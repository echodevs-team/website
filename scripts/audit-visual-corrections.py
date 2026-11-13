"""Targeted visual-correction evidence harness (ECHO-VF01 / ECHO-VF01-R1).

Captures genuinely comparable before/after viewport PNGs for the owner-confirmed
findings (mobile sticky-header bleed, Work-page hierarchy, About copy) using the
already installed WebKitGTK/Xvfb stack.

Each run writes test-results/<task>-<phase>-<timestamp>/ with screenshots/,
manifest.json, metrics.json and the private loopback server log. It never
downloads a browser, never enables intake and never touches another server.

Run:
  xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' \
    /usr/bin/python3 scripts/audit-visual-corrections.py --phase before \
    --task ECHO-VF01 --only header,work,about
"""
import argparse
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import tempfile
import time
import urllib.request

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('Gdk', '3.0')
gi.require_version('GdkPixbuf', '2.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gdk, GdkPixbuf, Gtk, WebKit2
from evidence_manifest import page_url, source_revision
from webkit_snapshot import SnapshotAPI

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['before', 'after'], required=True)
parser.add_argument('--task', default='ECHO-VF01', help='task id used in paths and manifests')
parser.add_argument('--only', default='header,work,about', help='comma-separated case groups: header,work,about')
args = parser.parse_args()
groups = [item.strip() for item in args.only.split(',') if item.strip()]
if not groups or set(groups) - {'header', 'work', 'about'}:
    parser.error('--only accepts header, work and about')

TASK = args.task.strip()
if not TASK:
    parser.error('--task must not be empty')
OUT = ROOT/'test-results'/f'{TASK.lower()}-{args.phase}-{time.strftime("%Y%m%d-%H%M%S")}'
SHOTS = OUT/'screenshots'
OUT.mkdir(parents=True, exist_ok=False)
SHOTS.mkdir()
revision = source_revision(ROOT)
tested_revision = revision['testedSourceRevision']
worktree_dirty = revision['worktreeDirty']
checks = []
captures = []
metric_rows = []

DESKTOP = (1440, 900)
MOBILE = (375, 812)

# Owner-confirmed defensive / verification phrasing that must no longer be the
# public About introduction. Used as a factual check, not a style opinion.
ABOUT_BANNED = [
    'unverified', 'not a list of', 'not published yet', 'not been verified',
    'تأییدنشده', 'تأیید نشده', 'منتشر نشده', 'تأییدنشده‌ای',
    'غير موثقة', 'لم تُنشر', 'لم تُتحقق',
]


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
    deadline = time.monotonic()+10
    while not result and time.monotonic() < deadline:
        pump(.02)
    if 'value' not in result:
        raise RuntimeError(result.get('error', 'JS timeout'))
    return result['value']


def check(value, label):
    if not value:
        raise AssertionError(label)
    checks.append(label)


def wait_ready(web):
    deadline = time.monotonic()+15
    while time.monotonic() < deadline:
        if evaluate(web, "return document.readyState==='complete'&&document.fonts.status==='loaded'&&!!document.querySelector('.mobile-navigation > button:not([disabled])');"):
            return
        pump(.05)
    raise RuntimeError('Ready-state timeout')


def settle(web):
    evaluate(web, """window.__echoVf={done:false};(async()=>{
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode()));
      let previous;
      for(let frame=0;frame<120;frame++){
        await new Promise(requestAnimationFrame);
        const geometry=JSON.stringify([innerWidth,innerHeight,scrollX,scrollY,document.documentElement.scrollWidth,document.documentElement.scrollHeight]);
        if(geometry===previous){window.__echoVf={done:true};return;}previous=geometry;
      }throw Error('Layout did not settle');
    })().catch(e=>window.__echoVf={done:true,error:String(e)});return true;""")
    deadline = time.monotonic()+10
    while time.monotonic() < deadline:
        state = evaluate(web, 'return window.__echoVf;')
        if state.get('done'):
            if state.get('error'):
                raise RuntimeError(state['error'])
            return
        pump(.02)
    raise RuntimeError('Settle timeout')


def scroll_mode(web, mode):
    if mode == 'top':
        evaluate(web, "window.scrollTo({top:0,behavior:'instant'});return scrollY;")
    elif mode.startswith('under:'):
        selector = mode.split(':', 1)[1]
        evaluate(web, f"const el=document.querySelector({json.dumps(selector)});if(!el)return false;"
                      "window.scrollTo({top:el.getBoundingClientRect().top+scrollY-24,behavior:'instant'});return scrollY;")
    elif mode == 'error':
        evaluate(web, "const el=document.querySelector('.inquiry-errors,[role=alert]');"
                      "if(el)window.scrollTo({top:el.getBoundingClientRect().top+scrollY-24,behavior:'instant'});return scrollY;")
    else:
        raise ValueError(mode)
    pump(.15)
    settle(web)


def luma(data, stride, channels, x, y):
    offset = y*stride + x*channels
    r, g, b = data[offset], data[offset+1], data[offset+2]
    return (0.2126*r + 0.7152*g + 0.0722*b)/255


def band_metrics(path, header_height, exclude=()):
    """Measure ghosting in the header band.

    UI boxes (brand, language switch, theme control, menu button) are excluded so
    the numbers describe the translucent surface only. `edgeRatio` is the share
    of adjacent pixel pairs crossing a visible edge; underlying text bleeding
    through glass raises it. `spread` is the p5-p95 luminance range.
    """
    pixbuf = GdkPixbuf.Pixbuf.new_from_file(str(path))
    width, height = pixbuf.get_width(), pixbuf.get_height()
    channels, stride = pixbuf.get_n_channels(), pixbuf.get_rowstride()
    data = pixbuf.get_pixels()
    top, bottom = 3, min(header_height-3, height-1)

    def excluded(x, y):
        for bx, by, bw, bh in exclude:
            if bx-3 <= x <= bx+bw+3 and by-3 <= y <= by+bh+3:
                return True
        return False

    values = []
    edges = pairs = 0
    for y in range(top, bottom):
        for x in range(1, width-1):
            if excluded(x, y):
                continue
            value = luma(data, stride, channels, x, y)
            values.append(value)
            if not excluded(x+1, y):
                pairs += 1
                if abs(luma(data, stride, channels, x+1, y)-value) > 0.08:
                    edges += 1
    if not values:
        raise RuntimeError('No measurable header background pixels')
    ordered = sorted(values)
    p5 = ordered[int(len(ordered)*0.05)]
    p95 = ordered[int(len(ordered)*0.95)-1]
    mean = sum(ordered)/len(ordered)
    variance = sum((v-mean)**2 for v in ordered)/len(ordered)
    median = ordered[len(ordered)//2]
    ink = sum(1 for v in ordered if abs(v-median) > 0.18)/len(ordered)
    return {
        'pixels': len(ordered), 'mean': round(mean, 4), 'stdev': round(variance**.5, 4),
        'p5': round(p5, 4), 'p95': round(p95, 4), 'spread': round(p95-p5, 4),
        'edgeRatio': round(edges/max(pairs, 1), 4), 'inkRatio': round(ink, 4),
    }


def header_state(web):
    return evaluate(web, """
      const header=document.querySelector('.site-header');
      const before=getComputedStyle(header,'::before');
      const row=header.querySelector('.header-row');
      const ui=[...header.querySelectorAll('.header-brand,.desktop-navigation,.header-settings,.mobile-navigation,.header-cta,.header-subtitle')]
        .filter(el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getClientRects().length>0});
      const rect=el=>{const r=el.getBoundingClientRect();return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}};
      const cs=getComputedStyle(header);
      return {position:cs.position,top:cs.top,zIndex:cs.zIndex,
        background:cs.backgroundColor,height:+row.getBoundingClientRect().height.toFixed(1),
        beforeBackground:before.backgroundColor,beforeOpacity:before.opacity,
        backdropFilter:before.backdropFilter||before.getPropertyValue('-webkit-backdrop-filter'),
        headerBackdrop:cs.backdropFilter,scrollY:+scrollY.toFixed(1),
        theme:document.documentElement.dataset.theme,dialogOpen:!!document.querySelector('.mobile-dialog[open]'),
        ui:ui.map(rect),width:innerWidth,docWidth:document.documentElement.scrollWidth};
    """)


def capture(web, name, route, locale, theme, viewport, mode, extra=None):
    header = header_state(web)
    path = SHOTS/(name+'.png')
    snapshot = SnapshotAPI().snapshot(web, path, pump)
    check([snapshot['width'], snapshot['height']] == [header['width'], evaluate(web, 'return innerHeight;')], name+': complete viewport snapshot')
    check(path.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n', name+': valid PNG header')
    check(header['docWidth'] <= header['width']+1, name+': no horizontal overflow '+json.dumps(header))
    if route != '/contact-drawer':
        check(header['position'] == 'sticky', name+': header stays sticky')
    metrics = None
    if route != '/contact-drawer':
        metrics = band_metrics(path, header['height'], [(b['x'], b['y'], b['w'], b['h']) for b in header['ui']])
    record = {
        'file': str(path.relative_to(OUT)), 'phase': args.phase, 'route': route, 'locale': locale,
        'theme': theme, 'viewport': list(viewport), 'scroll': mode, 'scrollY': header['scrollY'],
        'url': page_url(origin, locale, route),
        'engine': engine, 'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
        'deviceScaleFactor': 1,
        'header': {k: header[k] for k in ('position', 'top', 'zIndex', 'background', 'height', 'beforeBackground', 'beforeOpacity', 'backdropFilter', 'headerBackdrop')},
        'band': metrics, 'snapshot': snapshot,
    }
    if extra is not None:
        record['page'] = extra
    captures.append(record)
    if metrics:
        metric_rows.append({'file': record['file'], 'phase': args.phase, 'route': route, 'locale': locale,
                            'theme': theme, 'viewport': list(viewport), **metrics})
    print('CAPTURE', record['file'], {'viewport': list(viewport), 'scrollY': header['scrollY'],
          'band': metrics and {k: metrics[k] for k in ('spread', 'edgeRatio', 'inkRatio')}})
    return record


def page_metrics(web, kind):
    if kind == 'work':
        return evaluate(web, """
          const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),docTop:+(r.top+scrollY).toFixed(1)}};
          const concept=document.querySelector('#concept');
          const cards=[...document.querySelectorAll('#concept .work-card')];
          return {viewportH:innerHeight,
            sections:[...document.querySelectorAll('main > section[id]')].map(s=>({id:s.id,...box(s)})),
            concept:box(concept), conceptHeading:box(concept&&concept.querySelector('h2')),
            cards:cards.map(box), cardsInFirstView:cards.filter(c=>c.getBoundingClientRect().top<innerHeight).length,
            jumpLinks:[...document.querySelectorAll('.work-jump-links a')].map(a=>a.textContent.trim())};
        """)
    if kind == 'about':
        return evaluate(web, """
          const rect=el=>{const r=el.getBoundingClientRect();return {top:+r.top.toFixed(1),h:+r.height.toFixed(1)}};
          const intro=document.querySelector('.about-intro');
          const team=document.querySelector('#about-team');
          return {viewportH:innerHeight, intro:rect(intro), team:rect(team),
            introText:intro.innerText.trim(),
            teamHeading:team.querySelector('.home-heading').innerText.trim(),
            notes:[...team.querySelectorAll('.about-note')].map(n=>n.innerText.trim())};
        """)
    return None


def open_page(locale, theme, width, height, route):
    manager = WebKit2.UserContentManager()
    manager.add_script(WebKit2.UserScript.new(
        'localStorage.setItem("echo_theme",'+json.dumps(theme)+');',
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
    web.load_uri(origin+'/'+locale+route)
    wait_ready(web)
    check(evaluate(web, 'return document.documentElement.dataset.theme === '+json.dumps(theme)+';'),
          f'/{locale}{route} {theme}: requested theme applied')
    check(evaluate(web, 'return document.documentElement.lang === '+json.dumps(locale)+';'),
          f'/{locale}{route}: requested locale applied')
    return window, web


HEADER_CASES = [
    ('fa', '/contact', (375, 812), 'light', 'under:#contact-inquiry', 'fa-contact-375-light'),
    ('en', '/contact', (375, 812), 'light', 'under:.inquiry-form', 'en-contact-375-light'),
    ('ar', '/contact', (375, 812), 'light', 'under:.contact-guidance', 'ar-contact-375-light'),
    ('fa', '/contact', (375, 812), 'dark', 'under:.contact-guidance', 'fa-contact-375-dark'),
    ('en', '/contact', (375, 812), 'dark', 'under:.inquiry-form', 'en-contact-375-dark'),
    ('fa', '/contact', (320, 720), 'light', 'under:.inquiry-form', 'fa-contact-320-light'),
    ('fa', '/contact', (768, 900), 'light', 'under:.inquiry-form', 'fa-contact-768-light'),
    ('fa', '/contact', (1024, 900), 'light', 'under:.inquiry-form', 'fa-contact-1024-light'),
    ('fa', '', (375, 812), 'light', 'under:#process', 'fa-home-375-light'),
    ('ar', '', (375, 812), 'dark', 'under:#why-us', 'ar-home-375-dark'),
    ('en', '/contact', (375, 812), 'dark', 'error', 'en-contact-375-dark-error'),
]

WORK_CASES = [
    ('fa', '/work', DESKTOP, 'light', 'fa-work-1440-light'),
    ('en', '/work', DESKTOP, 'light', 'en-work-1440-light'),
    ('ar', '/work', DESKTOP, 'light', 'ar-work-1440-light'),
    ('en', '/work', DESKTOP, 'dark', 'en-work-1440-dark'),
    ('fa', '/work', MOBILE, 'light', 'fa-work-375-light'),
    ('en', '/work', MOBILE, 'light', 'en-work-375-light'),
    ('ar', '/work', MOBILE, 'light', 'ar-work-375-light'),
]

ABOUT_CASES = [
    ('fa', '/about', DESKTOP, 'light', 'fa-about-1440-light'),
    ('en', '/about', DESKTOP, 'light', 'en-about-1440-light'),
    ('ar', '/about', DESKTOP, 'light', 'ar-about-1440-light'),
    ('fa', '/about', MOBILE, 'light', 'fa-about-375-light'),
    ('en', '/about', MOBILE, 'light', 'en-about-375-light'),
    ('ar', '/about', MOBILE, 'light', 'ar-about-375-light'),
]


def submit_and_wait_error(web):
    evaluate(web, "document.querySelector('.inquiry-form button[type=submit]').click();return true;")
    deadline = time.monotonic()+10
    while time.monotonic() < deadline:
        if evaluate(web, "return !!document.querySelector('.inquiry-errors,[role=alert]');"):
            return
        pump(.1)
    raise RuntimeError('No localized validation/failure surface appeared')


def set_viewport(window, web, width, height):
    window.resize(width, height)
    pump(.2)
    deadline = time.monotonic()+5
    while time.monotonic() < deadline:
        if abs(evaluate(web, 'return innerWidth;')-width) <= 1 and abs(evaluate(web, 'return innerHeight;')-height) <= 1:
            return
        pump(.05)
    raise RuntimeError('Viewport did not apply')


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

        engine = 'WebKitGTK '+'.'.join(str(v) for v in (WebKit2.get_major_version(), WebKit2.get_minor_version(), WebKit2.get_micro_version()))+' / Cairo snapshot'

        # Fix A: mobile/tablet/desktop sticky-header legibility.
        for locale, route, viewport, theme, mode, name in (HEADER_CASES if 'header' in groups else []):
            window, web = open_page(locale, theme, *viewport, route)
            if mode == 'error':
                submit_and_wait_error(web)
            elif mode == 'top':
                pass
            scroll_mode(web, mode)
            capture(web, name, route, locale, theme, viewport, mode)
            if name == 'fa-contact-375-light':
                # Mobile drawer must stay opaque and unmoved by the header fix.
                evaluate(web, "document.querySelector('.mobile-navigation > button').focus();return true;")
                subprocess.run(['xdotool', 'key', 'Return'], check=True, timeout=5)
                pump(.4)
                opened = evaluate(web, """const d=document.querySelector('.mobile-dialog');
                  return {open:d.open,background:getComputedStyle(d).backgroundColor,
                    focus:document.activeElement===d.querySelector('.mobile-dialog-heading button')};""")
                check(opened['open'] and opened['focus'], 'mobile drawer still opens and focuses Close')
                check('rgba(0, 0, 0, 0)' not in opened['background'], 'mobile drawer background stays opaque')
                dialog_capture = SHOTS/(name+'-drawer.png')
                SnapshotAPI().snapshot(web, dialog_capture, pump)
                captures.append({'file': str(dialog_capture.relative_to(OUT)), 'phase': args.phase,
                                 'route': '/contact-drawer', 'locale': locale, 'theme': theme,
                                 'viewport': list(viewport), 'scroll': 'drawer', 'scrollY': 0,
                                 'url': page_url(origin, locale, '/contact'), 'engine': engine,
                                 'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
                                 'deviceScaleFactor': 1, 'dialog': opened})
                print('CAPTURE', captures[-1]['file'])
                subprocess.run(['xdotool', 'key', 'Escape'], check=True, timeout=5)
                pump(.3)
            window.destroy()
            pump()

        # Fix B: Work hierarchy and discoverability of the available studies.
        work_metrics = {}
        for locale, route, viewport, theme, name in (WORK_CASES if 'work' in groups else []):
            window, web = open_page(locale, theme, *viewport, route)
            scroll_mode(web, 'top')
            metrics = page_metrics(web, 'work')
            work_metrics[name] = metrics
            capture(web, name, route, locale, theme, viewport, 'top', extra=metrics)
            if viewport == DESKTOP and locale == 'en':
                # Same viewport/scroll comparison also for a dark theme.
                pass
            window.destroy()
            pump()

        # Fix C: About introduction copy and first-screen composition.
        about_text = {}
        for locale, route, viewport, theme, name in (ABOUT_CASES if 'about' in groups else []):
            window, web = open_page(locale, theme, *viewport, route)
            scroll_mode(web, 'top')
            metrics = page_metrics(web, 'about')
            about_text[name] = metrics
            capture(web, name, route, locale, theme, viewport, 'top', extra=metrics)
            if viewport == DESKTOP:
                found = [phrase for phrase in ABOUT_BANNED if phrase.casefold() in (metrics['introText']+' '+metrics['teamHeading']+' '+' '.join(metrics['notes'])).casefold()]
                if args.phase == 'after':
                    check(not found, f'/{locale}/about no defensive verification phrasing in introduction: {found}')
                else:
                    metric_rows.append({'file': name, 'phase': args.phase, 'kind': 'about-banned', 'locale': locale, 'found': found})
            window.destroy()
            pump()

        # Phase-specific acceptance assertions (before records the defect).
        if args.phase == 'after':
            for name, metrics in work_metrics.items():
                if name.endswith('1440-light') or name.endswith('1440-dark'):
                    check(metrics['cardsInFirstView'] >= 1,
                          name+': at least one concept card is visible in the initial 1440x900 viewport '+json.dumps(metrics))
                check(metrics['concept'] is not None, name+': concept section still present')
                check(len(metrics['sections']) == 3, name+': all three work category sections remain')

        (OUT/'manifest.json').write_text(json.dumps({
            'task': TASK, 'phase': args.phase, 'engine': engine,
            'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
            'documentationRevision': None,
            'documentationRevisionNote': 'assigned when this evidence is committed; it is not the tested source revision',
            'origin': origin, 'capturedAt': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'caseGroups': groups,
            'viewportPresets': {'desktop': DESKTOP, 'mobile': MOBILE},
            'screenshots': [c for c in captures],
        }, ensure_ascii=False, indent=2)+'\n')
        (OUT/'metrics.json').write_text(json.dumps({
            'task': TASK, 'phase': args.phase, 'engine': engine,
            'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
            'headerBands': metric_rows, 'work': work_metrics, 'about': about_text,
        }, ensure_ascii=False, indent=2)+'\n')
        (OUT/'audit.json').write_text(json.dumps({
            'phase': args.phase, 'engine': engine,
            'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
            'caseGroups': groups,
            'checks': len(checks), 'labels': checks,
        }, ensure_ascii=False, indent=2)+'\n')
        print(f'PASS {len(checks)} visual checks, {len(captures)} screenshots; {OUT}')
    finally:
        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
            server.wait(timeout=10)
        log.seek(0)
        (OUT/'server.log').write_text(log.read())
