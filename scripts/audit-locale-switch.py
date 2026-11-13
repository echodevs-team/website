"""ECHO-504 targeted locale-switch browser audit.

Drives the installed WebKitGTK/Xvfb browser against a private loopback
production server. Verifies desktop and mobile switching for the concept-detail
slug, a homepage fragment, a marketing page and the preference cookie, without
rerunning the full ECHO-503 screenshot matrix.

Run: xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' /usr/bin/python3 scripts/audit-locale-switch.py
"""
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('Gdk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gdk, Gtk, WebKit2
from webkit_snapshot import SnapshotAPI

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'test-results'/('echo-504-'+time.strftime('%Y%m%d-%H%M%S'))
SHOTS = OUT/'screenshots'
OUT.mkdir(parents=True, exist_ok=False)
SHOTS.mkdir()
commit = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
checks = []
captures = []


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
    raise RuntimeError('Page readiness timeout')


def open_window(context, width, height):
    web = WebKit2.WebView(web_context=context)
    window = Gtk.Window()
    window.set_default_size(width, height)
    window.add(web)
    window.show_all()
    window.move(0, 0)
    window.get_window().focus(Gdk.CURRENT_TIME)
    web.grab_focus()
    return window, web


def navigate(web, url, expected_lang, ready=True, expected_path=None):
    web.load_uri(url)
    target_path = expected_path or urllib.parse.urlsplit(url).path
    deadline = time.monotonic()+15
    last = None
    while time.monotonic() < deadline:
        state = evaluate(web, "return {ready:document.readyState,lang:document.documentElement.lang,href:location.href,pathname:location.pathname,cookie:document.cookie};")
        last = state
        if state['ready'] == 'complete' and state['lang'] == expected_lang and state['pathname'] == target_path:
            if ready:
                wait_ready(web)
            return state
        pump(.05)
    raise RuntimeError(f'Navigation timeout: {url} last={json.dumps(last)}')


def click(web, selector):
    check(evaluate(web, f"const el=document.querySelector({json.dumps(selector)});if(!el)return false;el.click();return true;"), f'click target exists: {selector}')


def wait_path(web, pathname):
    deadline = time.monotonic()+10
    while time.monotonic() < deadline:
        if evaluate(web, "return location.pathname;") == pathname:
            wait_ready(web)
            return
        pump(.05)
    raise RuntimeError(f'Did not reach {pathname}: {evaluate(web, "return location.href;")}')


def state(web):
    return evaluate(web, """return {href:location.href,pathname:location.pathname,search:location.search,hash:location.hash,
      lang:document.documentElement.lang,dir:document.documentElement.dir,cookie:document.cookie,
      title:document.title,notFound:document.querySelector('h1')?.textContent||null,
      languageLinks:[...document.querySelectorAll('a[hreflang]')].map(a=>({lang:a.getAttribute('hreflang'),href:a.getAttribute('href')})),
      dialogOpen:!!document.querySelector('.mobile-dialog[open]')};""")


def capture(web, name):
    path = SHOTS/(name+'.png')
    snapshot = SnapshotAPI().snapshot(web, path, pump)
    check([snapshot['width'], snapshot['height']] == evaluate(web, 'return [innerWidth,innerHeight];'), name+': viewport snapshot')
    check(path.read_bytes()[:8] == b'\x89PNG\r\n\x1a\n', name+': valid PNG')
    captures.append({'file': str(path.relative_to(OUT)), 'url': evaluate(web, 'return location.href;'), 'snapshot': snapshot})
    print('CAPTURE', name)


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
                raise RuntimeError('Next exited')
            try:
                with urllib.request.urlopen(origin+'/en', timeout=1):
                    break
            except OSError:
                time.sleep(.1)
        else:
            raise RuntimeError('Next startup timeout')
        engine = 'WebKitGTK '+'.'.join(str(v) for v in (WebKit2.get_major_version(), WebKit2.get_minor_version(), WebKit2.get_micro_version()))+' / Cairo snapshot'
        context = WebKit2.WebContext.new_ephemeral()

        # Desktop: FA concept detail -> EN -> AR, preserving the slug.
        window, web = open_window(context, 1440, 900)
        navigate(web, origin+'/fa/work/chat', 'fa')
        capture(web, 'fa-work-chat-before')
        click(web, '.language-switch a[hreflang="en"]')
        wait_path(web, '/en/work/chat')
        s = state(web)
        check(s['lang'] == 'en' and s['dir'] == 'ltr', 'desktop FA->EN sets EN direction')
        check('echo_locale=en' in s['cookie'], 'desktop FA->EN stores preference')
        capture(web, 'en-work-chat-after')
        click(web, '.language-switch a[hreflang="ar"]')
        wait_path(web, '/ar/work/chat')
        s = state(web)
        check(s['lang'] == 'ar' and s['dir'] == 'rtl', 'desktop EN->AR sets AR direction')
        check('echo_locale=ar' in s['cookie'], 'desktop EN->AR stores preference')
        capture(web, 'ar-work-chat-after')

        # Homepage section fragment survives switching.
        navigate(web, origin+'/fa#process', 'fa')
        click(web, '.language-switch a[hreflang="en"]')
        wait_path(web, '/en')
        s = state(web)
        check(s['hash'] == '#process', 'homepage fragment preserved FA->EN '+json.dumps(s))
        check(s['lang'] == 'en', 'homepage fragment switch keeps EN document')
        capture(web, 'en-home-process-fragment')

        # Ordinary marketing page.
        navigate(web, origin+'/en/privacy', 'en')
        click(web, '.language-switch a[hreflang="ar"]')
        wait_path(web, '/ar/privacy')
        check(state(web)['lang'] == 'ar', 'privacy EN->AR keeps route')
        check('echo_locale=ar' in state(web)['cookie'], 'privacy EN->AR stores preference')
        capture(web, 'ar-privacy-after')

        # Unknown slug: localized 404 with home fallback, no invented slug.
        navigate(web, origin+'/fa/work/unknown', 'fa', ready=False)
        s = state(web)
        check(s['languageLinks'] and all(link['href'] in ('/fa', '/en', '/ar') for link in s['languageLinks']), 'unknown slug 404 language fallback '+json.dumps(s['languageLinks']))
        check('/work/unknown' not in json.dumps(s['languageLinks']), 'unknown slug 404 does not invent destination')
        capture(web, 'fa-unknown-slug-404')

        # Stored AR preference now governs the root redirect.
        navigate(web, origin+'/', 'ar', expected_path='/ar')
        check(evaluate(web, 'return location.pathname;') == '/ar', 'root remembers stored AR preference')

        window.destroy()
        pump()

        # Mobile: open the drawer and switch there as well.
        window, web = open_window(context, 375, 812)
        navigate(web, origin+'/fa/work/booking', 'fa')
        click(web, '.mobile-navigation > button')
        deadline = time.monotonic()+5
        while time.monotonic() < deadline:
            if evaluate(web, "return !!document.querySelector('.mobile-dialog[open]');"):
                break
            pump(.05)
        check(evaluate(web, "return !!document.querySelector('.mobile-dialog[open]');"), 'mobile drawer opens')
        capture(web, 'fa-work-booking-mobile-drawer')
        click(web, '.mobile-dialog a[hreflang="en"]')
        wait_path(web, '/en/work/booking')
        s = state(web)
        check(s['lang'] == 'en' and s['dir'] == 'ltr', 'mobile FA->EN keeps booking slug and direction')
        check('echo_locale=en' in s['cookie'], 'mobile switch stores preference')
        check(not s['dialogOpen'], 'mobile navigation leaves drawer closed')
        capture(web, 'en-work-booking-mobile-after')
        window.destroy()
        pump()

        (OUT/'manifest.json').write_text(json.dumps({
            'engine': engine, 'commit': commit, 'origin': origin,
            'capturedAt': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
            'screenshots': captures}, ensure_ascii=False, indent=2)+'\n')
        (OUT/'audit.json').write_text(json.dumps({
            'engine': engine, 'commit': commit, 'checks': checks, 'captures': captures}, ensure_ascii=False, indent=2)+'\n')
        print(f'PASS {len(checks)} locale-switch checks, {len(captures)} screenshots; {OUT}')
    finally:
        if server.poll() is None:
            os.killpg(server.pid, signal.SIGTERM)
            server.wait(timeout=10)
        log.seek(0)
        (OUT/'server.log').write_text(log.read())
