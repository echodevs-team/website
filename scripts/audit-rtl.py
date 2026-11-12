"""ECHO-503 RTL/LTR production-HTTP audit with real WebKitGTK screenshots.

Runs the built frontend on a random loopback port, drives an installed
WebKitGTK/Xvfb browser, captures viewport PNGs and records bidi/overflow/
keyboard observations. No download, intake or DB access. Evidence is written
outside tracked source under test-results/.

Run: xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' /usr/bin/python3 scripts/audit-rtl.py [--commit SHA]
"""
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import struct
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
from webkit_snapshot import SnapshotAPI

ROOT = Path(__file__).resolve().parents[1]
if shutil.disk_usage(ROOT).free < 256 * 1024 * 1024:
    raise RuntimeError('Insufficient space; no capture attempted')
OUT = ROOT/'test-results'/('echo-503-'+time.strftime('%Y%m%d-%H%M%S'))
SHOTS = OUT/'screenshots'
OUT.mkdir(parents=True, exist_ok=False)
SHOTS.mkdir()
commit = sys.argv[sys.argv.index('--commit')+1] if '--commit' in sys.argv else subprocess.run(
    ['git','rev-parse','HEAD'],cwd=ROOT,capture_output=True,text=True,check=True).stdout.strip()
engine = None
captures = []
checks = []

def pump(seconds=.1):
    end=time.monotonic()+seconds
    while time.monotonic()<end:
        while Gtk.events_pending(): Gtk.main_iteration_do(False)
        time.sleep(.01)

def evaluate(web, code):
    result={}
    def finished(view, task, _):
        try: result['value']=json.loads(view.evaluate_javascript_finish(task).to_string())
        except Exception as error: result['error']=str(error)
    web.evaluate_javascript('JSON.stringify((()=>{'+code+'})() ?? null)',-1,None,None,None,finished,None)
    deadline=time.monotonic()+10
    while not result and time.monotonic()<deadline: pump(.02)
    if 'value' not in result: raise RuntimeError(result.get('error','JS timeout'))
    return result['value']

def check(value, label):
    if not value: raise AssertionError(label)
    checks.append(label)

def key(value):
    subprocess.run(['xdotool','key',value],check=True,timeout=5);pump(.25)

def wait_ready(web):
    deadline=time.monotonic()+15
    while time.monotonic()<deadline:
        if evaluate(web,"return document.readyState==='complete'&&document.fonts.status==='loaded'&&!!document.querySelector('.mobile-navigation > button:not([disabled])');"):
            return
        pump(.05)
    raise RuntimeError('Production client hydration/font readiness timeout')

def settle(web):
    evaluate(web,"""window.__echoRtl={done:false};(async()=>{
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode()));
      let previous;
      for(let frame=0;frame<120;frame++){
        await new Promise(requestAnimationFrame);
        const geometry=JSON.stringify([innerWidth,innerHeight,scrollX,scrollY,document.documentElement.scrollWidth,document.documentElement.scrollHeight]);
        if(geometry===previous){window.__echoRtl={done:true};return;}previous=geometry;
      }throw Error('Layout did not settle');
    })().catch(e=>window.__echoRtl={done:true,error:String(e)});return true;""")
    deadline=time.monotonic()+10
    while time.monotonic()<deadline:
        result=evaluate(web,'return window.__echoRtl;')
        if result.get('done'):
            if result.get('error'): raise RuntimeError(result['error'])
            return
        pump(.02)
    raise RuntimeError('Layout readiness timeout')

PAGE_STATE = """const visible=el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0};
const rect=el=>{const r=el.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
const dirOf=el=>el?getComputedStyle(el).direction:null;
const clipped=el=>{for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(s.overflowX!=='visible'||s.overflowY!=='visible')return true;}return false;};
const off=[...document.querySelectorAll('body *')].filter(el=>visible(el)&&!el.closest('svg')&&!el.closest('dialog:not([open])')&&!clipped(el)).map(el=>({el,r:rect(el)})).filter(({el,r})=>r.w>0&&(r.x < -1 || r.x+r.w > innerWidth+1)).map(({el,r})=>({tag:el.tagName.toLowerCase(),cls:(typeof el.className==='string'?el.className:'').slice(0,80),r,pos:getComputedStyle(el).position})).slice(0,12);
const bdi=[...document.querySelectorAll('bdi')];
const controls=[...document.querySelectorAll('input,textarea,select')].filter(visible).map(el=>({name:el.name,type:el.type,dirAttr:el.getAttribute('dir'),computed:dirOf(el),textAlign:getComputedStyle(el).textAlign}));
const rail=document.querySelector('.section-rail');
let railReport=null;
if(rail&&visible(rail)){const rr=rect(rail);const hits=[...document.querySelectorAll('main h1,main h2,main h3,main p,main li')].filter(visible).map(el=>({el,r:rect(el)})).filter(({r})=>r.x<rr.x+rr.w&&r.x+r.w>rr.x&&r.y<rr.y+rr.h&&r.y+r.h>rr.y).map(({el,r})=>({tag:el.tagName.toLowerCase(),text:el.textContent.trim().slice(0,50),r})).slice(0,5);railReport={rect:rr,side:getComputedStyle(rail).right!=='auto'?'right':'left',textOverlaps:hits};}
const nav=[...document.querySelectorAll('.desktop-navigation .primary-links a')].filter(visible).map(el=>({text:el.textContent.trim(),x:+el.getBoundingClientRect().x.toFixed(1)}));
const main=document.querySelector('main');
const h1=document.querySelector('h1');
const firstMainText=[...document.querySelectorAll('main p')].find(visible);
const steps=[...document.querySelectorAll('.step-number')].filter(visible).map(el=>el.textContent.trim());
return {lang:document.documentElement.lang,dir:document.documentElement.dir,title:document.title,
 innerWidth,innerHeight,scrollX,scrollY,docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,
 bodyDir:dirOf(document.body),mainDir:dirOf(main),h1Dir:dirOf(h1),pDir:dirOf(firstMainText),
 bdiCount:bdi.length,bdiNonIsolate:bdi.filter(el=>getComputedStyle(el).unicodeBidi!=='isolate').map(el=>el.textContent.trim().slice(0,30)),
 controls,offscreen:off,rail:railReport,nav,steps,
 theme:document.documentElement.dataset.theme||null,
 inputsLtr:controls.filter(c=>['email','tel'].includes(c.type)).every(c=>c.computed==='ltr'),
 textareaDir:(document.querySelector('#inquiry-description')?dirOf(document.querySelector('#inquiry-description')):null),
 fontStatus:document.fonts.status};"""

def capture(window, web, folder, name, route, locale, theme, scroll='top', dsf=1):
    if scroll=='bottom':
        evaluate(web,"window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});return true;")
    elif scroll=='form':
        evaluate(web,"const el=document.querySelector('.inquiry-form');el.scrollIntoView({block:'center',behavior:'instant'});return true;")
    elif scroll=='rail':
        evaluate(web,"document.querySelector('.section-rail')?.focus?.();return true;")
    elif scroll=='visual':
        evaluate(web,"document.querySelector('.work-detail-visual,.concept-card')?.scrollIntoView({block:'center',behavior:'instant'});return true;")
    elif scroll=='error':
        evaluate(web,"document.querySelector('.inquiry-errors,[role=alert]')?.scrollIntoView({block:'center',behavior:'instant'});return true;")
    pump(.15); settle(web)
    state=evaluate(web,PAGE_STATE)
    directory=SHOTS/folder
    directory.mkdir(exist_ok=True)
    path=directory/(name+'.png')
    snapshot=SnapshotAPI().snapshot(web,path,pump)
    check([snapshot['width'],snapshot['height']]==[state['innerWidth'],state['innerHeight']],name+': complete viewport snapshot dimensions')
    check(snapshot['bodySampleColors']>8 or path.stat().st_size>8000,name+': nonflat WebKit snapshot')
    check(not state['offscreen'],name+': no element outside horizontal viewport '+json.dumps(state['offscreen'],ensure_ascii=False)[:400])
    check(state['lang']==locale,name+': document lang')
    check(state['dir']==('ltr' if locale=='en' else 'rtl'),name+': document dir')
    check(state['bodyDir']==state['dir'] and state['mainDir']==state['dir'],name+': body/main computed direction')
    check(state['h1Dir']==state['dir'],name+': heading computed direction')
    if state['pDir'] is not None:
        check(state['pDir']==state['dir'],name+': paragraph computed direction')
    check(not state['bdiNonIsolate'],name+': bdi isolation '+json.dumps(state['bdiNonIsolate'],ensure_ascii=False))
    if state['steps']:
        # Number shaping: accept either locale-native digits or Latin digits,
        # but every step marker must stay a plain, unreordered number.
        check(all(re.fullmatch(r'[0-9\u0660-\u0669\u06f0-\u06f9]{1,3}',s) for s in state['steps']),name+': step numerals are stable '+json.dumps(state['steps'],ensure_ascii=False))
    if route=='/contact':
        check(state['inputsLtr'],name+': email/phone inputs are LTR')
        localized_controls=[c for c in state['controls'] if c['name'] in ('fullName','timeline','description','service')]
        check(len(localized_controls)>=4 and all(c['computed']==state['dir'] for c in localized_controls),name+': localized text controls match locale direction '+json.dumps(localized_controls,ensure_ascii=False))
        check(state['textareaDir']==state['dir'],name+': description textarea matches locale direction')
    if state['innerWidth']>=1024 and state['nav']:
        xs=[item['x'] for item in state['nav']]
        check(xs==sorted(xs,reverse=locale!='en'),name+': navigation visual order matches locale')
    if state['rail']:
        check(not state['rail']['textOverlaps'],name+': section rail does not cover text '+json.dumps(state['rail'],ensure_ascii=False)[:500])
    image=path.read_bytes()
    check(image[:8]==b'\x89PNG\r\n\x1a\n',name+': valid PNG header')
    captures.append({'file':str(path.relative_to(OUT)),'route':'/'+locale+route,'locale':locale,'theme':theme,
        'viewport':[state['innerWidth'],state['innerHeight']],'deviceScaleFactor':dsf,'scroll':scroll,
        'url':origin+'/'+locale+route,'engine':engine,'commit':commit,**{k:state[k] for k in
        ['lang','dir','title','docWidth','docHeight','scrollY','bdiCount','steps','fontStatus']},
        'snapshot':snapshot})
    print('CAPTURE',captures[-1]['file'],{'viewport':[state['innerWidth'],state['innerHeight']],'dir':state['dir'],'scrollY':state['scrollY']})
    return state

def open_page(locale, theme, width, height, route, minimal=False):
    manager=WebKit2.UserContentManager()
    manager.add_script(WebKit2.UserScript.new('localStorage.setItem("echo_theme",'+json.dumps(theme)+');',WebKit2.UserContentInjectedFrames.TOP_FRAME,WebKit2.UserScriptInjectionTime.START,None,None))
    context=WebKit2.WebContext.new_ephemeral()
    web=WebKit2.WebView(web_context=context,user_content_manager=manager)
    window=Gtk.Window();window.set_default_size(width,height);window.add(web);window.show_all();window.move(0,0)
    window.get_window().focus(Gdk.CURRENT_TIME);web.grab_focus();web.load_uri(origin+'/'+locale+route)
    if minimal:
        deadline=time.monotonic()+15
        while time.monotonic()<deadline:
            if evaluate(web,"return document.readyState==='complete'&&document.fonts.status==='loaded'&&document.documentElement.lang==="+json.dumps(locale)+";"):
                break
            pump(.05)
        else: raise RuntimeError('Minimal page readiness timeout')
    else:
        wait_ready(web)
    check(evaluate(web,'return document.documentElement.dataset.theme === '+json.dumps(theme)+';'),f'/{locale}{route} {theme}: requested theme applied')
    check(evaluate(web,'return document.documentElement.lang === '+json.dumps(locale)+';'),f'/{locale}{route}: requested locale applied')
    return window,web

def close_page(window):
    window.destroy();pump()

DESKTOP=(1440,900); MOBILE=(375,812)

CASES=[
    ('fa','',DESKTOP,'light'),('en','',DESKTOP,'light'),('ar','',DESKTOP,'light'),
    ('fa','',DESKTOP,'dark'),('ar','',DESKTOP,'dark'),
    ('fa','',MOBILE,'light'),('en','',MOBILE,'light'),('ar','',MOBILE,'light'),
    ('fa','/contact',DESKTOP,'light'),('en','/contact',DESKTOP,'light'),('ar','/contact',DESKTOP,'light'),
    ('fa','/contact',MOBILE,'light'),('en','/contact',MOBILE,'light'),('ar','/contact',MOBILE,'light'),
    ('fa','/services',DESKTOP,'light'),('en','/services',DESKTOP,'light'),('ar','/services',DESKTOP,'light'),
    ('fa','/work',DESKTOP,'light'),('en','/work',DESKTOP,'light'),('ar','/work',DESKTOP,'light'),
    ('fa','/work/analytics',DESKTOP,'light'),('en','/privacy',DESKTOP,'light'),('ar','/privacy',DESKTOP,'light'),
    ('fa','',(320,720),'light'),('ar','',(320,720),'light'),('fa','/contact',(320,720),'light'),
    ('fa','',(768,900),'light'),('ar','/services',(768,900),'light'),
    ('fa','',(1024,900),'light'),('ar','',(1024,900),'light'),
    ('fa','/privacy',DESKTOP,'light'),('fa','/about',DESKTOP,'light'),('en','/about',DESKTOP,'light'),
    ('en','/work/analytics',DESKTOP,'light'),('ar','/work/chat',DESKTOP,'light'),
    ('fa','/missing',DESKTOP,'light'),('ar','/missing',DESKTOP,'light'),
    ('fa','/services',(320,720),'light'),('ar','/work',(320,720),'light'),('fa','/privacy',(320,720),'light'),
]

with socket.socket() as reserved:
    reserved.bind(('127.0.0.1',0));port=reserved.getsockname()[1]
origin=f'http://127.0.0.1:{port}'
with tempfile.TemporaryFile(mode='w+') as log:
    server=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',str(port)],cwd=ROOT,
        env={**os.environ,'NEXT_TELEMETRY_DISABLED':'1','INQUIRIES_ENABLED':'false'},stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
    try:
        for _ in range(120):
            if server.poll() is not None: raise RuntimeError('Next exited')
            try:
                with urllib.request.urlopen(origin+'/en',timeout=1): break
            except OSError: time.sleep(.1)
        else: raise RuntimeError('Next startup timeout')
        probe=WebKit2.WebView()
        engine='WebKitGTK '+'.'.join(str(v) for v in (WebKit2.get_major_version(),WebKit2.get_minor_version(),WebKit2.get_micro_version()))+' / Cairo snapshot'
        probe.destroy()
        for locale,route,(width,height),theme in CASES:
            folder=locale
            slug=('home' if route=='' else route.strip('/').replace('/','-'))
            minimal=route=='/missing'
            window,web=open_page(locale,theme,width,height,route,minimal=minimal)
            kind='desktop' if width>=1024 else 'tablet' if width>=600 else 'mobile'
            if (width,height)==DESKTOP: name=f'{locale}-{slug}-desktop-{theme}'
            elif (width,height)==MOBILE: name=f'{locale}-{slug}-mobile-{theme}'
            else: name=f'{locale}-{slug}-{width}x{height}-{theme}'
            capture(window,web,folder,name,route,locale,theme)
            if route=='' and width>=1024:
                capture(window,web,folder,name+'-rail',route,locale,theme,scroll='rail')
            if route=='' and width>=1024:
                capture(window,web,folder,name+'-footer',route,locale,theme,scroll='bottom')
            if route=='/work/chat' and width>=1024:
                radii=evaluate(web,"return [...document.querySelectorAll('.sample-chat p')].map(p=>{const s=getComputedStyle(p);return {bl:s.borderBottomLeftRadius,br:s.borderBottomRightRadius,dir:s.direction};});")
                first_zero='bl' if locale!='en' else 'br'
                second_zero='br' if locale!='en' else 'bl'
                check(len(radii)==2 and radii[0][first_zero]=='0px' and radii[1][second_zero]=='0px',name+': chat bubble tails mirror with locale '+json.dumps(radii))
                capture(window,web,folder,name+'-visual',route,locale,theme,scroll='visual')
            if route=='/privacy' and width>=1024:
                capture(window,web,folder,name+'-footer',route,locale,theme,scroll='bottom')
            if route=='/contact' and width<1024:
                capture(window,web,folder,name+'-form',route,locale,theme,scroll='form')
                # Keyboard matrix: tab through real form controls, then verify
                # each focused control is visible without horizontal scroll.
                evaluate(web,"document.querySelector('#inquiry-fullName').focus();return true;")
                order=[]
                for _ in range(6):
                    order.append(evaluate(web,"const el=document.activeElement;return el.id||el.name||el.tagName.toLowerCase();"))
                    key('Tab')
                check(order[:5]==['inquiry-fullName','inquiry-email','inquiry-phone','inquiry-service','inquiry-timeline'],name+': logical form tab order '+json.dumps(order))
                check(evaluate(web,"return document.documentElement.scrollWidth<=innerWidth+1;") ,name+': no horizontal scroll after keyboard focus')
                captures.append({'kind':'keyboard','file':None,'route':'/'+locale+route,'locale':locale,'theme':theme,
                    'viewport':[width,height],'deviceScaleFactor':1,'url':origin+'/'+locale+route,'engine':engine,'commit':commit,
                    'tabOrder':order,'docWidth':evaluate(web,'return document.documentElement.scrollWidth;')})
                # Real disabled-intake failure state: the form posts to the local
                # API (503 by default), so status/error alignment is observable
                # without a database or enabling intake.
                evaluate(web,"document.querySelector('.inquiry-form button[type=submit]').click();return true;")
                deadline=time.monotonic()+10
                while time.monotonic()<deadline:
                    if evaluate(web,"return !!document.querySelector('.inquiry-errors,[role=alert]');"): break
                    pump(.1)
                error_state=evaluate(web,"const el=document.querySelector('.inquiry-errors,[role=alert]');if(!el)return null;const r=el.getBoundingClientRect();return {text:el.textContent.trim().slice(0,120),dir:getComputedStyle(el).direction,x:+r.x.toFixed(0),w:+r.width.toFixed(0),docWidth:document.documentElement.scrollWidth};")
                check(error_state and error_state['text'],name+': visible localized failure status')
                check(error_state['dir']==('ltr' if locale=='en' else 'rtl'),name+': failure status direction')
                check(error_state['docWidth']<=width+1,name+': no horizontal overflow in failure state')
                capture(window,web,folder,name+'-error',route,locale,theme,scroll='error')
            if width<1024:
                # Real keyboard/mobile-dialog check, including drawer side.
                evaluate(web,"document.querySelector('.mobile-navigation > button').focus();return true;")
                key('Return')
                opened=evaluate(web,"const d=document.querySelector('.mobile-dialog'),r=d.getBoundingClientRect();return {open:d.matches(':modal'),inlineEnd:getComputedStyle(d).insetInlineEnd,rect:{x:r.x,w:r.width},focus:document.activeElement===document.querySelector('.mobile-dialog-heading button')};")
                check(opened['open'] and opened['focus'],name+': native mobile menu opens and focuses Close')
                side_ok=round(opened['rect']['x'])==0 if locale!='en' else round(opened['rect']['x']+opened['rect']['w'])==width
                check(side_ok,name+': mobile drawer side matches locale '+json.dumps(opened))
                key('Tab')
                check(evaluate(web,"return document.querySelector('.mobile-dialog').contains(document.activeElement);"),name+': Tab stays inside native modal')
                if locale in ('fa','ar') and route=='':
                    capture(window,web,folder,name+'-menu',route,locale,theme)
                key('Escape')
                check(evaluate(web,"return !document.querySelector('.mobile-dialog').open&&document.activeElement===document.querySelector('.mobile-navigation > button');"),name+': Escape closes menu and returns focus')
            close_page(window)
        (OUT/'manifest.json').write_text(json.dumps({'engine':engine,'commit':commit,'origin':origin,
            'capturedAt':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'viewportPresets':{'desktop':DESKTOP,'mobile':MOBILE},
            'screenshots':[c for c in captures if c.get('file')]},ensure_ascii=False,indent=2)+'\n')
        (OUT/'audit.json').write_text(json.dumps({'engine':engine,'commit':commit,'checks':checks,'records':captures},ensure_ascii=False,indent=2)+'\n')
        print(f'PASS {len(checks)} RTL/bidi/browser checks, {len([c for c in captures if c.get("file")])} screenshots; {OUT}')
    except Exception as error:
        (OUT/'failure.json').write_text(json.dumps({'error':str(error),'checks':checks,'captures':captures},ensure_ascii=False,indent=2)+'\n')
        raise
    finally:
        if server.poll() is None:
            os.killpg(server.pid,signal.SIGTERM);server.wait(timeout=10)
        log.seek(0);(OUT/'server.log').write_text(log.read())
