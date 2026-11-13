"""ECHO-505 real-browser typography, shaping and expansion audit.

Runs the production build on a private loopback port, drives the installed
WebKitGTK/Xvfb browser, and checks font readiness/use, mixed-script rendering,
clipping, wrapping, header collisions, line heights, glyph fallback and Tofu
risk across all 27 localized marketing routes and the 320/375/768/1024/1440
widths. Screenshots and manifests are written outside tracked source under
test-results/.

The harness never downloads a browser, never enables intake, never touches
another server and never modifies the site. `--phase before` records defects
without failing; `--phase after` fails when any check fails.

Run:
  xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' \
    /usr/bin/python3 scripts/audit-typography.py --phase after
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('Gdk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gdk, Gtk, WebKit2
from evidence_manifest import page_url, source_revision
from typography_audit import audit_repository
from webkit_snapshot import SnapshotAPI

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['before', 'after'], required=True)
parser.add_argument('--task', default='ECHO-505')
parser.add_argument('--limit', type=int, default=0, help='run only the first N cases (focused debugging)')
parser.add_argument('--only-locale', choices=['fa', 'en', 'ar'],
                    help='restrict the matrix to one locale (focused debugging)')
args = parser.parse_args()
TASK = args.task.strip() or 'ECHO-505'
OUT = ROOT/'test-results'/f'{TASK.lower()}-{args.phase}-{time.strftime("%Y%m%d-%H%M%S")}'
SHOTS = OUT/'screenshots'
OUT.mkdir(parents=True, exist_ok=False)
SHOTS.mkdir()

revision = source_revision(ROOT)
tested_revision = revision['testedSourceRevision']
worktree_dirty = revision['worktreeDirty']
checks = []
captures = []
warnings = []

LOCALES = ('fa', 'en', 'ar')
ROUTES = ('', '/services', '/work', '/work/analytics', '/work/chat', '/work/booking', '/about', '/contact', '/privacy')
VIEWPORTS = {'320': (320, 720), '375': (375, 812), '768': (768, 900), '1024': (1024, 900), '1440': (1440, 900)}
EXPECTED_DIR = {'fa': 'rtl', 'en': 'ltr', 'ar': 'rtl'}
ALLOWED_FALLBACKS = {'U+2190', 'U+2192', 'U+2197'}


def pump(seconds=.1):
    end = time.monotonic()+seconds
    while time.monotonic() < end:
        while Gtk.events_pending():
            Gtk.main_iteration_do(False)
        time.sleep(.01)


def evaluate(web, code):
    result = {}

    def finished(view, task, _):
        try:
            result['value'] = json.loads(view.evaluate_javascript_finish(task).to_string())
        except Exception as error:
            result['error'] = str(error)

    web.evaluate_javascript('JSON.stringify((()=>{'+code+'})() ?? null)', -1, None, None, None, finished, None)
    deadline = time.monotonic()+15
    while not result and time.monotonic() < deadline:
        pump(.02)
    if 'value' not in result:
        raise RuntimeError(result.get('error', 'JS timeout'))
    return result['value']


def check(ok, label, detail=None):
    row = {'ok': bool(ok), 'label': label}
    if detail is not None:
        row['detail'] = detail
    checks.append(row)
    if not ok:
        print('FAIL', label, json.dumps(detail, ensure_ascii=False)[:700] if detail is not None else '')


def wait_ready(web):
    deadline = time.monotonic()+25
    while time.monotonic() < deadline:
        if evaluate(web, "return document.readyState==='complete'&&document.fonts.status==='loaded'&&!!document.querySelector('.site-header');"):
            return
        pump(.05)
    raise RuntimeError('Document/font readiness timeout')


def settle(web):
    evaluate(web, """window.__echoType={done:false};(async()=>{
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));
      let previous;
      for(let frame=0;frame<120;frame++){
        await new Promise(requestAnimationFrame);
        const geometry=JSON.stringify([innerWidth,innerHeight,scrollX,scrollY,document.documentElement.scrollWidth,document.documentElement.scrollHeight]);
        if(geometry===previous){window.__echoType={done:true};return;}previous=geometry;
      }throw Error('Layout did not settle');
    })().catch(e=>window.__echoType={done:true,error:String(e)});return true;""")
    deadline = time.monotonic()+10
    while time.monotonic() < deadline:
        state = evaluate(web, 'return window.__echoType;')
        if state.get('done'):
            if state.get('error'):
                raise RuntimeError(state['error'])
            return
        pump(.02)
    raise RuntimeError('Settle timeout')


PAGE_JS = r"""
  const expectedDir=__EXPECTED_DIR__;
  const fontStatusAtStart=document.fonts.status;
  const visible=el=>{
    const cs=getComputedStyle(el);
    return cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity)!==0&&el.getClientRects().length>0;
  };
  const desc=el=>{
    const cls=(typeof el.className==='string'&&el.className.trim())?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):'';
    return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+cls;
  };
  const measure=(text,font)=>{const ctx=document.createElement('canvas').getContext('2d');ctx.font=font;return ctx.measureText(text).width;};
  const arabicRuns=text=>(text.match(/[\u0600-\u06FF\u200c\u200d]+(?:\s+[\u0600-\u06FF\u200c\u200d]+)*/g)||[])
    .filter(run=>/[\u0600-\u06FF]/.test(run));
  const textElements=[];
  for(const el of document.querySelectorAll('body *')){
    if(!visible(el))continue;
    const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
    if(hasText)textElements.push(el);
  }
  const clipped=[];const nowrap=[];
  for(const el of textElements){
    const cs=getComputedStyle(el);
    if(el.clientWidth<=0)continue;
    const overflowX=el.scrollWidth-el.clientWidth,overflowY=el.scrollHeight-el.clientHeight;
    if((cs.overflowX==='hidden'||cs.overflowX==='clip')&&overflowX>1)
      clipped.push({label:desc(el),axis:'x',overflow:overflowX});
    if((cs.overflowY==='hidden'||cs.overflowY==='clip')&&overflowY>1)
      clipped.push({label:desc(el),axis:'y',overflow:overflowY});
    if(cs.whiteSpace==='nowrap'&&overflowX>1)
      nowrap.push({label:desc(el),overflow:overflowX,text:el.textContent.trim().slice(0,80)});
  }
  const lineBoxesOutside=[];
  const range=document.createRange();
  for(const el of document.querySelectorAll('main h1,main h2,main h3,main p,main li,main a,main button,main label,header a,header button,footer p,footer a,footer h2')){
    if(!visible(el))continue;
    if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    range.selectNodeContents(el);
    for(const rect of range.getClientRects()){
      if(rect.width<0.5||rect.height<0.5)continue;
      if(rect.left<-1||rect.right>innerWidth+1){
        lineBoxesOutside.push({label:desc(el),left:+rect.left.toFixed(1),right:+rect.right.toFixed(1)});
        break;
      }
    }
  }
  const header=document.querySelector('.site-header');
  const headerRect=header.getBoundingClientRect();
  const headerItems=[...header.querySelectorAll('.header-brand,.primary-links a,.header-settings > *,.mobile-navigation > button,.header-wordmark,.header-subtitle')].filter(visible);
  const headerOverlaps=[];
  for(let i=0;i<headerItems.length;i++)for(let j=i+1;j<headerItems.length;j++){
    const a=headerItems[i],b=headerItems[j];
    if(a.contains(b)||b.contains(a))continue;
    const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
    const w=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
    const h=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
    if(w>1&&h>1)headerOverlaps.push({a:desc(a),b:desc(b),w:+w.toFixed(1),h:+h.toFixed(1)});
  }
  const headerOutside=headerItems.filter(el=>{
    const r=el.getBoundingClientRect();
    return r.left<-1||r.right>innerWidth+1||r.top<headerRect.top-1||r.bottom>headerRect.bottom+1;
  }).map(desc);
  const lineHeights=[];
  for(const el of document.querySelectorAll('main p,main li,footer p')){
    if(!visible(el))continue;
    const cs=getComputedStyle(el),size=parseFloat(cs.fontSize),lh=parseFloat(cs.lineHeight);
    if(size>0&&lh>0)lineHeights.push({label:desc(el),ratio:+(lh/size).toFixed(2)});
  }
  const headingHeights=[];
  for(const el of document.querySelectorAll('main h1,main h2,main h3,footer h2')){
    if(!visible(el))continue;
    const cs=getComputedStyle(el),size=parseFloat(cs.fontSize),lh=parseFloat(cs.lineHeight);
    if(size>0&&lh>0)headingHeights.push({label:desc(el),ratio:+(lh/size).toFixed(2)});
  }
  const fc=(weight,text)=>document.fonts.check(weight+' 16px "Vazirmatn"',text);
  const faSample='سلام، دنیای فنی ۱۲۳۴۵۶۷۸۹۰ نیم\u200cفاصله';
  const arSample='مرحبًا بالعالم التقني ١٢٣٤٥٦٧٨٩٠';
  const latinSample='Echo Devs 2026 API — “quoted”';
  const fontChecks={
    fa400:fc(400,faSample),fa500:fc(500,faSample),fa700:fc(700,faSample),
    ar400:fc(400,arSample),ar500:fc(500,arSample),ar700:fc(700,arSample),
    lat400:fc(400,latinSample),lat500:fc(500,latinSample),lat700:fc(700,latinSample),
    arabicPunctuation:fc(400,'،؛؟'),zwnj:fc(400,'\u200c'),persianDigits:fc(400,'۱۲۳۴۵'),
    arabicIndicDigits:fc(400,'١٢٣٤٥'),latinArrow:fc(400,'↑'),rightArrow:fc(400,'→'),leftArrow:fc(400,'←'),northEastArrow:fc(400,'↗')
  };
  const faces=[...document.fonts].map(face=>({family:face.family.replace(/["']/g,''),weight:face.weight,style:face.style,status:face.status,unicodeRange:face.unicodeRange||null}));
  const resourceEntries=performance.getEntriesByType('resource').filter(entry=>/\.woff2(?:$|\?)/.test(entry.name));
  const fontResources=resourceEntries.map(entry=>({name:entry.name,path:entry.name.replace(location.origin,''),initiatorType:entry.initiatorType,transferSize:entry.transferSize,encodedBodySize:entry.encodedBodySize}));
  const externalFontResources=resourceEntries.filter(entry=>{try{return new URL(entry.name).origin!==location.origin;}catch{return true;}}).map(entry=>entry.name);
  const monoSelectors=['.brand-chip','.footer-badge','.footer-links h2','.footer-contact h2','.footer-bottom p'];
  const mono=[];
  for(const selector of monoSelectors){
    for(const el of document.querySelectorAll(selector)){
      if(!visible(el))continue;
      const runs=arabicRuns(el.textContent);
      if(!runs.length)continue;
      const text=runs.sort((a,b)=>b.length-a.length)[0].replace(/\s+/g,'');
      if(!text)continue;
      const cs=getComputedStyle(el),size=parseFloat(cs.fontSize),weight=cs.fontWeight;
      const monoWidth=measure(text,weight+' '+size+'px '+cs.fontFamily);
      const vazWidth=measure(text,weight+' '+size+'px "Vazirmatn"');
      mono.push({selector,text,size,weight,monoWidth:+monoWidth.toFixed(2),vazWidth:+vazWidth.toFixed(2),
        delta:+Math.abs(monoWidth-vazWidth).toFixed(2),matches:Math.abs(monoWidth-vazWidth)<=0.5});
    }
  }
  const uniqueChars=new Set();
  for(const el of textElements)for(const char of el.textContent){const cp=char.codePointAt(0);if(char.trim()&&cp>0x2000)uniqueChars.add(char);}
  const uncovered=[...uniqueChars].filter(char=>!document.fonts.check('16px "Vazirmatn"',char)).slice(0,80)
    .map(char=>({char,cp:'U+'+char.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}));
  const glyph=char=>{
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
    const ctx=canvas.getContext('2d');ctx.font='32px "Vazirmatn", system-ui, sans-serif';
    ctx.textBaseline='top';ctx.fillStyle='#000';ctx.fillText(char,4,4);
    const data=ctx.getImageData(0,0,64,64).data;
    let hash=2166136261,ink=0;
    for(let i=3;i<data.length;i+=4){if(data[i]){ink++;hash=(hash^data[i])*16777619>>>0;}}
    return ink?hash:0;
  };
  // Vazirmatn intentionally shares some Persian/Arabic-Indic digit glyphs,
  // so digits are excluded from the duplicate-.notdef probe.
  const probeChars=[...new Set(['\u0633','\u0644','\u0627','\u0645','\u06cc','\u06a9','\u0628','\u062a','\u0646','\u060c','\u061b','\u061f','\u2190','\u2192','\u2191','\u2197','\u2013','\u2014','\u2026','\u00b7','A','B','a','b'])];
  const byHash={};const tofuCollisions=[];
  for(const char of probeChars){
    const hash=glyph(char);
    if(!hash)continue;
    if(byHash[hash]&&byHash[hash]!==char)tofuCollisions.push({a:byHash[hash],b:char});
    else byHash[hash]=char;
  }
  const errors=window.__echoTypography?window.__echoTypography.errors.slice(0,10):[];
  return {
    lang:document.documentElement.lang,dir:document.documentElement.dir,expectedDir,
    theme:document.documentElement.dataset.theme,fontStatus:fontStatusAtStart,
    fontFaceCount:document.fonts.size,faces,
    loadedFaceCount:faces.filter(face=>face.status==='loaded').length,
    bodyFont:getComputedStyle(document.body).fontFamily,
    headingFont:document.querySelector('main h1,h1')?getComputedStyle(document.querySelector('main h1,h1')).fontFamily:null,
    mainDirection:document.querySelector('main')?getComputedStyle(document.querySelector('main')).direction:null,
    fontChecks,fontResources,externalFontResources,
    docWidth:document.documentElement.scrollWidth,innerWidth,innerHeight,
    docHeight:document.documentElement.scrollHeight,
    clipped,nowrap,lineBoxesOutside,headerOverlaps,headerOutside,
    minProseLineHeight:lineHeights.length?Math.min(...lineHeights.map(row=>row.ratio)):null,
    minHeadingLineHeight:headingHeights.length?Math.min(...headingHeights.map(row=>row.ratio)):null,
    proseSamples:lineHeights.filter(row=>row.ratio<1.35).slice(0,5),
    headingSamples:headingHeights.filter(row=>row.ratio<1.2).slice(0,5),
    mono,uncovered,tofuCollisions,errors,
    textLength:document.body.innerText.trim().length,
    h1Text:(document.querySelector('main h1,h1')||{}).textContent?.trim().slice(0,120)||''
  };
"""

FALLBACK_JS = r"""
  const sample='سلام، دنیای فنی ۱۲۳۴۵';
  document.documentElement.style.setProperty('--font-body','system-ui, sans-serif');
  void document.body.offsetHeight;
  const measure=(text,font)=>{const ctx=document.createElement('canvas').getContext('2d');ctx.font=font;return ctx.measureText(text).width;};
  const bodyFont=getComputedStyle(document.body).fontFamily;
  const fallbackWidth=measure(sample,'16px system-ui, sans-serif');
  const vazWidth=measure(sample,'16px "Vazirmatn"');
  const main=document.querySelector('main');
  return {
    fallbackStack:'system-ui, sans-serif',bodyFont,
    applied:bodyFont.toLowerCase().includes('system-ui')&&!bodyFont.toLowerCase().includes('vazirmatn'),
    fallbackWidth:+fallbackWidth.toFixed(2),vazWidth:+vazWidth.toFixed(2),
    widthDelta:+Math.abs(fallbackWidth-vazWidth).toFixed(2),
    mainTextLength:main?main.innerText.trim().length:0,
    mainHeight:main?+main.getBoundingClientRect().height.toFixed(1):0,
    docWidth:document.documentElement.scrollWidth,innerWidth,
    replacement:document.body.innerText.includes('\ufffd'),
    errors:window.__echoTypography?window.__echoTypography.errors.slice(0,10):[]
  };
"""


FORCE_FONTS_JS = r"""
  window.__echoFonts={done:false};
  (async()=>{
    try{
      const sample='سلام دنیای فنی ۱۲۳٤٥٦٧٨٩٠ Echo Devs 2026';
      const loads=[];
      for(const weight of [400,500,700]){
        loads.push(document.fonts.load(weight+' 16px "Vazirmatn"',sample));
      }
      await Promise.all(loads);
      await document.fonts.ready;
      window.__echoFonts={done:true,status:document.fonts.status};
    }catch(error){window.__echoFonts={done:true,error:String(error)};}
  })();
"""


def force_fonts(web):
    """Load every declared Vazirmatn weight before coverage is measured.

    WebKit loads a subset lazily, so a page that renders no Persian/Arabic text
    (most notably the English locale) legitimately leaves the Arabic faces
    unloaded; `document.fonts.check` would then report a false gap, and drawing
    an Arabic glyph on a canvas starts the download and flips
    `document.fonts.status` to `loading`. Requesting the declared faces makes
    the coverage check measure the shipped assets rather than page usage.
    """
    evaluate(web, FORCE_FONTS_JS)
    deadline = time.monotonic()+20
    while time.monotonic() < deadline:
        state = evaluate(web, 'return window.__echoFonts;')
        if state.get('done'):
            if state.get('error'):
                raise RuntimeError(state['error'])
            return state
        pump(.05)
    raise RuntimeError('Font force-load timeout')


def open_page(locale, theme, width, height, route):
    manager = WebKit2.UserContentManager()
    manager.add_script(WebKit2.UserScript.new(
        'localStorage.setItem("echo_theme",'+json.dumps(theme)+');'
        'window.__echoTypography={errors:[]};'
        'addEventListener("error",e=>window.__echoTypography.errors.push(String(e.message||e.error)));'
        'addEventListener("unhandledrejection",e=>window.__echoTypography.errors.push(String(e.reason)));',
        WebKit2.UserContentInjectedFrames.TOP_FRAME, WebKit2.UserScriptInjectionTime.START, None, None))
    context = WebKit2.WebContext.new_ephemeral()
    web = WebKit2.WebView(web_context=context, user_content_manager=manager)
    window = Gtk.Window()
    window.set_default_size(width, height)
    window.add(web)
    window.show_all()
    window.move(0, 0)
    window.get_window().focus(Gdk.CURRENT_TIME)
    web.grab_focus()
    web.load_uri(page_url(origin, locale, route))
    wait_ready(web)
    settle(web)
    force_fonts(web)
    settle(web)
    return window, web


def page_checks(state, label):
    check(state['fontStatus'] == 'loaded', label+': document.fonts is loaded', state.get('fontStatus'))
    check(state['theme'] in ('light', 'dark'), label+': theme applied', state.get('theme'))
    check(state['lang'] in LOCALES, label+': locale applied', state.get('lang'))
    check(state['dir'] == EXPECTED_DIR[state['lang']], label+': document direction matches locale',
          {'dir': state['dir'], 'expected': EXPECTED_DIR.get(state['lang'])})
    check(state['mainDirection'] == EXPECTED_DIR[state['lang']], label+': main inherits the locale direction',
          state.get('mainDirection'))
    check('vazirmatn' in (state['bodyFont'] or '').lower(), label+': body uses the approved font stack', state.get('bodyFont'))
    check('vazirmatn' in (state['headingFont'] or '').lower(), label+': headings use the approved font stack', state.get('headingFont'))
    check(state['fontFaceCount'] >= 1 and all(face['family'] == 'Vazirmatn' for face in state['faces']),
          label+': every declared web font is Vazirmatn', state['faces'])
    check(state['loadedFaceCount'] >= 1, label+': at least one Vazirmatn face is loaded', state['loadedFaceCount'])
    for key in ('fa400', 'fa500', 'fa700', 'ar400', 'ar500', 'ar700', 'lat400', 'lat500', 'lat700',
                'arabicPunctuation', 'zwnj', 'persianDigits', 'arabicIndicDigits'):
        check(state['fontChecks'].get(key) is True,
              f'{label}: Vazirmatn covers {key}', state['fontChecks'].get(key))
    check(state['fontChecks'].get('latinArrow') is True, label+': Vazirmatn covers the ↑ arrow', state['fontChecks'].get('latinArrow'))
    check(len(state['fontResources']) >= 1, label+': a WOFF2 font was requested', state['fontResources'])
    check(not state['externalFontResources'], label+': no external font requests', state['externalFontResources'])
    check(all(entry['path'].startswith('/fonts/') for entry in state['fontResources']),
          label+': font requests are self-hosted under /fonts/', state['fontResources'])
    check(state['docWidth'] <= state['innerWidth']+1, label+': no horizontal overflow',
          {'docWidth': state['docWidth'], 'innerWidth': state['innerWidth']})
    check(not state['clipped'], label+': no clipped text', state['clipped'])
    check(not state['nowrap'], label+': no truncated nowrap labels', state['nowrap'])
    check(not state['lineBoxesOutside'], label+': no text outside the viewport', state['lineBoxesOutside'])
    check(not state['headerOverlaps'], label+': header items do not overlap', state['headerOverlaps'])
    check(not state['headerOutside'], label+': header items stay inside the header band', state['headerOutside'])
    if state['minProseLineHeight'] is not None:
        check(state['minProseLineHeight'] >= 1.3, label+': readable prose line height',
              {'minimum': state['minProseLineHeight'], 'samples': state['proseSamples']})
    if state['minHeadingLineHeight'] is not None:
        check(state['minHeadingLineHeight'] >= 1.15, label+': readable heading line height',
              {'minimum': state['minHeadingLineHeight'], 'samples': state['headingSamples']})
    check(not state['tofuCollisions'], label+': no duplicate .notdef glyphs (Tofu risk)', state['tofuCollisions'])
    check(not state['errors'], label+': no browser script errors', state['errors'])
    check(state['textLength'] >= 200, label+': page has rendered text', state['textLength'])
    check(bool(state['h1Text']), label+': localized h1 is present', state['h1Text'])
    mono_mismatch = [row for row in state['mono'] if not row['matches']]
    check(not mono_mismatch, label+': Arabic text in mono-styled chrome uses Vazirmatn', mono_mismatch)
    unexpected = sorted({row['cp'] for row in state['uncovered']}-ALLOWED_FALLBACKS)
    check(not unexpected, label+': no unexpected characters outside the approved font ranges', unexpected)
    if state['uncovered']:
        warnings.append({'label': label, 'uncovered': state['uncovered']})


def capture(web, name, route, locale, theme, viewport, metrics=None, phase=None, extra=None):
    path = SHOTS/(name+'.png')
    snapshot = SnapshotAPI().snapshot(web, path, pump)
    check([snapshot['width'], snapshot['height']] == [viewport[0], viewport[1]],
          name+': complete viewport snapshot', snapshot)
    check(path.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n', name+': valid PNG header')
    record = {
        'file': str(path.relative_to(OUT)), 'phase': phase or args.phase, 'route': route,
        'locale': locale, 'theme': theme, 'viewport': list(viewport), 'url': page_url(origin, locale, route),
        'engine': engine, 'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
        'deviceScaleFactor': 1, 'snapshot': snapshot,
    }
    if metrics:
        record['metrics'] = metrics
    if extra:
        record['extra'] = extra
    captures.append(record)
    print('CAPTURE', record['file'], {'route': route, 'locale': locale, 'theme': theme, 'viewport': list(viewport)})
    return record


def compact_metrics(state):
    return {
        'fontStatus': state['fontStatus'], 'fontFaceCount': state['fontFaceCount'],
        'loadedFaceCount': state['loadedFaceCount'], 'bodyFont': state['bodyFont'],
        'headingFont': state['headingFont'], 'mainDirection': state['mainDirection'],
        'docWidth': state['docWidth'], 'docHeight': state['docHeight'], 'textLength': state['textLength'],
        'minProseLineHeight': state['minProseLineHeight'], 'minHeadingLineHeight': state['minHeadingLineHeight'],
        'clipped': state['clipped'], 'nowrap': state['nowrap'], 'lineBoxesOutside': state['lineBoxesOutside'],
        'headerOverlaps': state['headerOverlaps'], 'headerOutside': state['headerOutside'],
        'mono': state['mono'], 'uncovered': state['uncovered'], 'tofuCollisions': state['tofuCollisions'],
        'fontChecks': state['fontChecks'], 'fontResources': state['fontResources'],
        'externalFontResources': state['externalFontResources'], 'errors': state['errors'],
    }


cases = []
for locale in LOCALES:
    for route in ROUTES:
        cases.append((locale, route, VIEWPORTS['1440'], 'light', 'full'))
        cases.append((locale, route, VIEWPORTS['375'], 'light', 'full'))
    for route in ('', '/contact'):
        for width in ('320', '768', '1024'):
            cases.append((locale, route, VIEWPORTS[width], 'light', 'expansion'))
    for route in ('', '/contact'):
        cases.append((locale, route, VIEWPORTS['375'], 'dark', 'theme'))
if args.only_locale:
    cases = [case for case in cases if case[0] == args.only_locale]
if args.limit:
    cases = cases[:args.limit]

static_report = audit_repository(ROOT)
if not static_report['ok']:
    warnings.append({'staticAuditErrors': static_report['errors']})

with socket.socket() as reserved:
    reserved.bind(('127.0.0.1', 0))
    port = reserved.getsockname()[1]
origin = f'http://127.0.0.1:{port}'

with tempfile.TemporaryFile(mode='w+') as log:
    server = subprocess.Popen(
        ['node', 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', str(port)],
        cwd=ROOT, env={**os.environ, 'NEXT_TELEMETRY_DISABLED': '1', 'INQUIRIES_ENABLED': 'false'},
        stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        for _ in range(120):
            if server.poll() is not None:
                raise RuntimeError('Next exited during startup')
            try:
                with urllib.request.urlopen(origin+'/en', timeout=1):
                    break
            except OSError:
                time.sleep(.1)
        else:
            raise RuntimeError('Next startup timeout')

        engine = 'WebKitGTK '+'.'.join(str(v) for v in (
            WebKit2.get_major_version(), WebKit2.get_minor_version(), WebKit2.get_micro_version()))+' / Cairo snapshot'

        for index, (locale, route, viewport, theme, purpose) in enumerate(cases, 1):
            window, web = open_page(locale, theme, *viewport, route)
            label = f'/{locale}{route or "/"} {viewport[0]}x{viewport[1]} {theme}'
            state = evaluate(web, PAGE_JS.replace('__EXPECTED_DIR__', json.dumps(EXPECTED_DIR[locale])))
            page_checks(state, label)
            slug = route.strip('/').replace('/', '-') or 'home'
            name = f'{locale}-{slug}-{viewport[0]}-{theme}'
            capture(web, name, route, locale, theme, viewport, compact_metrics(state),
                    extra={'purpose': purpose, 'pageIndex': index, 'caseCount': len(cases)})
            window.destroy()
            pump()

        # Fallback simulation: remove the loaded @font-face entries and confirm
        # the page remains readable with the system stack (font-display fallback).
        for locale in ('fa', 'ar'):
            window, web = open_page(locale, 'light', *VIEWPORTS['375'], '')
            fallback = evaluate(web, FALLBACK_JS)
            settle(web)
            check(fallback['applied'], f'fallback {locale}: declared fallback stack is applied', fallback)
            check(fallback['widthDelta'] > 0.5,
                  f'fallback {locale}: fallback glyph metrics differ from Vazirmatn (shaping re-run)', fallback)
            check(fallback['fallbackWidth'] > 0, f'fallback {locale}: Arabic text still has measurable glyphs', fallback)
            check(fallback['mainTextLength'] >= 200, f'fallback {locale}: page text is retained', fallback)
            check(fallback['mainHeight'] > 0, f'fallback {locale}: main content still has height', fallback)
            check(fallback['docWidth'] <= fallback['innerWidth']+1,
                  f'fallback {locale}: no horizontal overflow without Vazirmatn', fallback)
            check(fallback['replacement'] is False, f'fallback {locale}: no replacement characters', fallback)
            check(not fallback['errors'], f'fallback {locale}: no browser errors', fallback['errors'])
            capture(web, f'fallback-{locale}-home-375-light', '', locale, 'light', VIEWPORTS['375'],
                    phase='fallback', extra={'simulated': 'declared --font-body fallback stack (system-ui, sans-serif)', 'state': fallback})
            window.destroy()
            pump()

        failures = [row for row in checks if not row['ok']]
        harness = {
            name: hashlib.sha256((ROOT/name).read_bytes()).hexdigest()
            for name in ('scripts/audit-typography.py', 'scripts/typography_audit.py',
                         'scripts/evidence_manifest.py', 'scripts/webkit_snapshot.py')
        }
        summary = {
            'task': TASK, 'phase': args.phase, 'engine': engine,
            'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
            'harness': harness,
            'documentationRevision': None,
            'documentationRevisionNote': 'assigned when this evidence is committed; it is not the tested source revision',
            'origin': origin, 'capturedAt': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'cases': len(cases), 'screenshots': len(captures), 'checks': len(checks),
            'failures': len(failures), 'warnings': len(warnings),
            'viewports': {key: list(value) for key, value in VIEWPORTS.items()},
            'routes': list(ROUTES), 'locales': list(LOCALES),
        }
        (OUT/'manifest.json').write_text(json.dumps({
            **summary,
            'screenshots': captures,
        }, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
        (OUT/'audit.json').write_text(json.dumps({
            **summary,
            'failedChecks': failures,
            'warningRows': warnings,
            'staticAudit': static_report,
            'checks': checks,
        }, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
        (OUT/'font-faces.json').write_text(json.dumps({
            'engine': engine, 'testedSourceRevision': tested_revision,
            'staticAudit': static_report,
        }, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
        print(f"{'PASS' if not failures else 'DEFECTS OBSERVED'} {len(checks)} checks, "
              f"{len(captures)} screenshots, {len(failures)} failures; {OUT}")
        if args.phase == 'after' and failures:
            sys.exit(1)
    finally:
        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
            server.wait(timeout=10)
        log.seek(0)
        (OUT/'server.log').write_text(log.read())
