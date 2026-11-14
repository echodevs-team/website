"""ECHO-506 localized 404 browser audit.

Drives the installed WebKitGTK/Xvfb browser against a private loopback
production server. Captures and checks the localized 404 document for FA/EN/AR
at 1440x900 and 375x812 in light and dark, including direction, recovery links,
header/footer shell, focus visibility and horizontal overflow. The harness
never downloads a browser, never enables intake and never touches another
server.

`--phase before` records defects without failing; `--phase after` fails when any
check fails.

Run:
  xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' \
    /usr/bin/python3 scripts/audit-404.py --phase after
"""
import argparse
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(os.environ.get('ECHO_ROOT', Path(__file__).resolve().parents[1])).resolve()
sys.path.insert(0, str(ROOT/'scripts'))

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('Gdk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gdk, Gtk, WebKit2
from evidence_manifest import page_url, source_revision
from webkit_snapshot import SnapshotAPI

parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['before', 'after'], required=True)
parser.add_argument('--task', default='ECHO-506')
args = parser.parse_args()
TASK = args.task.strip() or 'ECHO-506'
OUT = ROOT/'test-results'/f'{TASK.lower()}-{args.phase}-{time.strftime("%Y%m%d-%H%M%S")}'
SHOTS = OUT/'screenshots'
OUT.mkdir(parents=True, exist_ok=False)
SHOTS.mkdir()

revision = source_revision(ROOT)
tested_revision = revision['testedSourceRevision']
worktree_dirty = revision['worktreeDirty']
checks = []
failures = []
captures = []

LOCALES = ('fa', 'en', 'ar')
EXPECTED_DIR = {'fa': 'rtl', 'en': 'ltr', 'ar': 'rtl'}
EXPECTED_H1 = {
    'fa': 'صفحه پیدا نشد',
    'en': 'Page not found',
    'ar': 'الصفحة غير موجودة',
}
VIEWPORTS = {'desktop': (1440, 900), 'mobile': (375, 812)}
UNKNOWN_ROUTE = '/missing/nested'


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


def check(ok, label, detail=None):
    record = {'label': label, 'ok': bool(ok)}
    if detail is not None:
        record['detail'] = detail
    checks.append(record)
    if not ok:
        failures.append(record)
        print('FAIL', label, json.dumps(detail, ensure_ascii=False)[:500] if detail is not None else '')
    return ok


def key(value):
    subprocess.run(['xdotool', 'key', value], check=True, timeout=5)
    pump(.25)


def wait_ready(web, locale):
    deadline = time.monotonic()+20
    while time.monotonic() < deadline:
        if evaluate(web, "return document.readyState==='complete'&&document.fonts.status==='loaded'&&document.documentElement.lang==="+json.dumps(locale)+";"):
            return
        pump(.05)
    raise RuntimeError('404 page readiness timeout')


def open_page(locale, theme, width, height):
    manager = WebKit2.UserContentManager()
    manager.add_script(WebKit2.UserScript.new(
        'localStorage.setItem("echo_theme",'+json.dumps(theme)+');',
        WebKit2.UserContentInjectedFrames.TOP_FRAME,
        WebKit2.UserScriptInjectionTime.START, None, None))
    context = WebKit2.WebContext.new_ephemeral()
    web = WebKit2.WebView(web_context=context, user_content_manager=manager)
    window = Gtk.Window()
    window.set_default_size(width, height)
    window.add(web)
    window.show_all()
    window.move(0, 0)
    window.get_window().focus(Gdk.CURRENT_TIME)
    web.grab_focus()
    url = page_url(origin, locale, UNKNOWN_ROUTE)
    web.load_uri(url)
    wait_ready(web, locale)
    check(evaluate(web, 'return document.documentElement.dataset.theme === '+json.dumps(theme)+';'),
          f'/{locale}{UNKNOWN_ROUTE} {theme}: requested theme applied')
    return window, web


STATE = """return {
  href:location.href, pathname:location.pathname,
  lang:document.documentElement.lang, dir:document.documentElement.dir,
  bodyDir:getComputedStyle(document.body).direction,
  title:document.title,
  h1:document.querySelector('h1')?.textContent?.trim()||null,
  h1Count:document.querySelectorAll('h1').length,
  h2Count:document.querySelectorAll('h2').length,
  header:!!document.querySelector('header.site-header'),
  footer:!!document.querySelector('footer'),
  mainTabIndex:document.querySelector('main')?.getAttribute('tabindex')||null,
  homeLinks:[...document.querySelectorAll('a[href="/'+document.documentElement.lang+'"]')].map(a=>a.textContent.trim()),
  servicesLink:!!document.querySelector('a[href="/'+document.documentElement.lang+'/services"]'),
  workLink:!!document.querySelector('a[href="/'+document.documentElement.lang+'/work"]'),
  contactLink:!!document.querySelector('a[href="/'+document.documentElement.lang+'/contact"]'),
  languageLinks:[...document.querySelectorAll('a[hreflang]')].map(a=>({lang:a.getAttribute('hreflang'),href:a.getAttribute('href')})),
  robots:document.querySelector('meta[name="robots"]')?.getAttribute('content')||null,
  robotsTags:[...document.querySelectorAll('meta[name="robots"]')].map(m=>m.getAttribute('content')),
  canonical:document.querySelector('link[rel="canonical"]')?.getAttribute('href')||null,
  alternateLinks:[...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(a=>({lang:a.getAttribute('hreflang'),href:a.getAttribute('href')})),
  overflow:document.documentElement.scrollWidth>innerWidth+1,
  docWidth:document.documentElement.scrollWidth, innerWidth,
  offscreen:[...document.querySelectorAll('.not-found-panel *')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&(r.left<-1||r.right>innerWidth+1);}).map(el=>el.tagName+'.'+el.className).slice(0,8),
  panelText:document.querySelector('.not-found-panel')?.textContent?.trim().slice(0,400)||null,
  recoveryHeading:document.querySelector('.not-found-recovery h2')?.textContent?.trim()||null,
  fakeRecovery:!!document.querySelector('.not-found-panel form, .not-found-panel button, .not-found-panel input')
};"""


def focus_check(web, locale):
    """Press Tab until a link inside the recovery panel is focused."""
    evaluate(web, 'document.body.focus();return true;')
    reached = False
    for _ in range(40):
        key('Tab')
        if evaluate(web, "return !!document.activeElement && document.activeElement.closest && !!document.activeElement.closest('.not-found-panel');"):
            reached = True
            break
    detail = evaluate(web, """const el=document.activeElement;const s=getComputedStyle(el);return {
      tag:el.tagName,text:el.textContent.trim().slice(0,60),href:el.getAttribute('href'),
      focusVisible:el.matches(':focus-visible'),outlineStyle:s.outlineStyle,
      outlineWidth:s.outlineWidth,outlineColor:s.outlineColor};""")
    check(reached, f'/{locale}: keyboard reaches a 404 recovery link', detail)
    check(detail and detail['focusVisible'], f'/{locale}: recovery link matches :focus-visible', detail)
    check(detail and detail['outlineStyle'] != 'none' and detail['outlineWidth'] not in ('0px', ''), f'/{locale}: recovery link has a visible focus outline', detail)
    return detail


def capture(web, name, locale, theme, viewport):
    state = evaluate(web, STATE)
    path = SHOTS/(name+'.png')
    snapshot = SnapshotAPI().snapshot(web, path, pump)
    check([snapshot['width'], snapshot['height']] == [state['innerWidth'], viewport[1]],
          name+': complete viewport snapshot', snapshot)
    check(snapshot['bodySampleColors'] > 8 or path.stat().st_size > 8000, name+': nonflat WebKit snapshot', snapshot)
    check(path.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n', name+': valid PNG header')
    captures.append({
        'file': str(path.relative_to(OUT)),
        'url': page_url(origin, locale, UNKNOWN_ROUTE),
        'locale': locale, 'theme': theme, 'viewport': [state['innerWidth'], viewport[1]],
        'engine': engine, 'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
        'snapshot': snapshot,
        **{k: state[k] for k in ('lang', 'dir', 'bodyDir', 'title', 'h1', 'robots', 'robotsTags', 'canonical',
                                 'alternateLinks', 'docWidth', 'overflow', 'header', 'footer')},
    })
    print('CAPTURE', name, {'lang': state['lang'], 'dir': state['dir'], 'theme': theme,
                            'viewport': [state['innerWidth'], viewport[1]], 'h1': state['h1']})
    return state


with socket.socket() as reserved:
    reserved.bind(('127.0.0.1', 0))
    port = reserved.getsockname()[1]
origin = f'http://127.0.0.1:{port}'
http_status = {}

with tempfile.TemporaryFile(mode='w+') as log:
    server = subprocess.Popen(
        ['node', 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', str(port)],
        cwd=ROOT, env={**os.environ, 'NEXT_TELEMETRY_DISABLED': '1', 'INQUIRIES_ENABLED': 'false'},
        stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    try:
        for _ in range(120):
            if server.poll() is not None:
                raise RuntimeError('Next exited')
            try:
                with urllib.request.urlopen(origin+'/en', timeout=1):
                    break
            except OSError:
                time.sleep(.1)
        else:
            raise RuntimeError('Next startup timeout')
        for locale in LOCALES:
            url = page_url(origin, locale, UNKNOWN_ROUTE)
            try:
                with urllib.request.urlopen(url, timeout=10) as response:
                    http_status[locale] = response.status
            except urllib.error.HTTPError as error:
                http_status[locale] = error.code
            except OSError as error:
                http_status[locale] = str(error)
        engine = 'WebKitGTK '+'.'.join(str(v) for v in (WebKit2.get_major_version(), WebKit2.get_minor_version(), WebKit2.get_micro_version()))+' / Cairo snapshot'
        for locale in LOCALES:
            check(http_status.get(locale) == 404, f'/{locale}{UNKNOWN_ROUTE}: HTTP status 404', {'status': http_status.get(locale)})
            for viewport_name, viewport in VIEWPORTS.items():
                for theme in ('light', 'dark'):
                    window, web = open_page(locale, theme, *viewport)
                    name = f'{locale}-{viewport_name}-{theme}'
                    state = capture(web, name, locale, theme, viewport)
                    check(state['lang'] == locale, name+': document lang', state['lang'])
                    check(state['dir'] == EXPECTED_DIR[locale], name+': document dir', state['dir'])
                    check(state['bodyDir'] == EXPECTED_DIR[locale], name+': body computed direction', state['bodyDir'])
                    check(state['h1'] == EXPECTED_H1[locale], name+': localized 404 heading', state['h1'])
                    check(state['h1Count'] == 1, name+': exactly one h1', state['h1Count'])
                    check(state['h2Count'] >= 1, name+': recovery section has a heading', state['h2Count'])
                    check(state['header'], name+': established header shell is present', state['header'])
                    check(state['footer'], name+': established footer shell is present', state['footer'])
                    check(state['mainTabIndex'] == '-1', name+': main is a skip target', state['mainTabIndex'])
                    check(state['homeLinks'], name+': localized homepage link is visible', state['homeLinks'])
                    check(state['servicesLink'], name+': localized Services recovery link', state['servicesLink'])
                    check(state['workLink'], name+': localized Work recovery link', state['workLink'])
                    check(state['contactLink'], name+': localized Contact recovery link', state['contactLink'])
                    check(state['recoveryHeading'], name+': localized recovery nav label', state['recoveryHeading'])
                    check(not state['fakeRecovery'], name+': no fake recovery form/button', state['fakeRecovery'])
                    check(not state['overflow'], name+': no horizontal overflow',
                          {'docWidth': state['docWidth'], 'innerWidth': state['innerWidth']})
                    check(not state['offscreen'], name+': no panel element outside the viewport', state['offscreen'])
                    check(len(state['robotsTags']) == 1, name+': exactly one robots directive', state['robotsTags'])
                    check(state['robotsTags'] and 'noindex' in state['robotsTags'][0],
                          name+': error page is noindex', state['robotsTags'])
                    check(state['canonical'] is None, name+': preview 404 emits no canonical URL', state['canonical'])
                    check(state['alternateLinks'] == [], name+': preview 404 emits no document hreflang alternates', state['alternateLinks'])
                    expected_hrefs = {'/fa', '/en', '/ar'}
                    check(state['languageLinks'] and all(link['href'] in expected_hrefs for link in state['languageLinks']),
                          name+': language links fall back to locale homes', state['languageLinks'])
                    check(all('/missing/nested' not in link['href'] for link in state['languageLinks']),
                          name+': language links never invent the missing route', state['languageLinks'])
                    if viewport_name == 'desktop' and theme == 'light':
                        focus_check(web, locale)
                    window.destroy()
                    pump()
        failures_now = len(failures)
        (OUT/'manifest.json').write_text(json.dumps({
            'task': TASK, 'phase': args.phase, 'engine': engine, 'origin': origin,
            'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
            'capturedAt': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'unknownRoute': UNKNOWN_ROUTE, 'httpStatus': http_status,
            'viewportPresets': VIEWPORTS, 'screenshots': captures,
            'checks': checks, 'failures': failures,
        }, ensure_ascii=False, indent=2)+'\n')
        (OUT/'audit.json').write_text(json.dumps({
            'engine': engine, 'testedSourceRevision': tested_revision, 'worktreeDirty': worktree_dirty,
            'checks': checks, 'failures': failures}, ensure_ascii=False, indent=2)+'\n')
        print(f'{args.phase.upper()} {len(checks)-len(failures)}/{len(checks)} 404 browser checks passed, '
              f'{len(captures)} screenshots; {OUT}')
        if args.phase == 'after' and failures_now:
            raise SystemExit(1)
    finally:
        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
            server.wait(timeout=10)
        log.seek(0)
        (OUT/'server.log').write_text(log.read())
