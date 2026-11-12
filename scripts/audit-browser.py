"""ECHO-407 bounded production-HTTP WebKitGTK spot checks, not full acceptance.
Uses existing Ubuntu GTK/WebKit/XTest only; no download, intake or DB access.
Run: xvfb-run -a -s '-screen 0 1440x1100x24 -nolisten tcp' /usr/bin/python3 scripts/audit-browser.py
"""
import json
import os
from pathlib import Path
import shutil
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

ROOT = Path(__file__).resolve().parents[1]
if shutil.disk_usage(ROOT).free < 256 * 1024 * 1024:
    raise RuntimeError('Insufficient space; no capture attempted')
OUT = ROOT/'test-results'/('echo-407-'+time.strftime('%Y%m%d-%H%M%S'))
OUT.mkdir(parents=True, exist_ok=False)
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
    subprocess.run(['xdotool','key',value],check=True,timeout=5);pump(.2)

def capture(window, web, name):
    pump(.4)
    state=evaluate(web,"return {width:innerWidth,height:innerHeight,theme:document.documentElement.dataset.theme,locale:document.documentElement.lang,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth+1};")
    check(not state['overflow'], name+': no horizontal viewport overflow')
    image=Gdk.pixbuf_get_from_window(window.get_window(),0,0,*window.get_size())
    if image is None: raise RuntimeError('Capture failed')
    # DOM readiness is not paint evidence. Refuse flat body readback rather than
    # labeling blank Xvfb captures as a passing visual check. Inspection is still
    # required for partial paint; the cause needs an independent browser check.
    pixels=image.get_pixels();stride=image.get_rowstride();channels=image.get_n_channels()
    colors={tuple(pixels[y*stride+x*channels:y*stride+x*channels+3])
            for y in range(150,image.get_height(),24) for x in range(0,image.get_width(),24)}
    check(len(colors)>8,name+': nonflat body readback (not visual acceptance)')
    path=OUT/(name+'.png');image.savev(str(path),'png',[],[])
    captures.append({'path':str(path),**state})
    print('CAPTURE',path,state)

with socket.socket() as reserved:
    reserved.bind(('127.0.0.1',0));port=reserved.getsockname()[1]
origin=f'http://127.0.0.1:{port}'
with tempfile.TemporaryFile(mode='w+') as log:
    server=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',str(port)],cwd=ROOT,
        env={**os.environ,'NEXT_TELEMETRY_DISABLED':'1','INQUIRIES_ENABLED':'false'},stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
    try:
        for _ in range(100):
            if server.poll() is not None: raise RuntimeError('Next exited')
            try:
                with urllib.request.urlopen(origin+'/en',timeout=1): break
            except OSError: time.sleep(.1)
        else: raise RuntimeError('Next startup timeout')
        cases=[('en','light',1300,'','01-en-light-home'),('en','dark',375,'/about','02-en-dark-about'),
               ('fa','dark',375,'/contact','03-fa-dark-contact'),('fa','light',1300,'/privacy','04-fa-light-privacy'),
               ('ar','dark',1300,'/services','05-ar-dark-services'),('ar','light',375,'/work/booking','06-ar-light-concept')]
        for locale,theme,width,route,name in cases:
            if '--desktop-only' in sys.argv and width<1024: continue
            if '--narrow-only' in sys.argv and width>=1024: continue
            manager=WebKit2.UserContentManager()
            manager.add_script(WebKit2.UserScript.new('localStorage.setItem("echo_theme",'+json.dumps(theme)+');',WebKit2.UserContentInjectedFrames.TOP_FRAME,WebKit2.UserScriptInjectionTime.START,None,None))
            context=WebKit2.WebContext.new_ephemeral()
            web=WebKit2.WebView(web_context=context,user_content_manager=manager)
            window=Gtk.Window();window.set_default_size(width,1000);window.add(web);window.show_all();window.move(0,0)
            window.get_window().focus(Gdk.CURRENT_TIME);web.grab_focus();web.load_uri(origin+'/'+locale+route)
            ready=False
            for _ in range(150):
                if evaluate(web,"return document.readyState==='complete'&&!!document.querySelector('.mobile-navigation > button:not(:disabled)');"):
                    ready=True;break
                pump(.05)
            check(ready,name+': production client hydration ready')
            check(evaluate(web,'return document.documentElement.dataset.theme === '+json.dumps(theme)+';'),name+': requested theme applied')
            check(evaluate(web,'return document.documentElement.lang === '+json.dumps(locale)+';'),name+': requested locale applied')
            capture(window,web,name)
            if width<1024:
                evaluate(web,"document.querySelector('.mobile-navigation > button').focus();return true;")
                key('Return')
                check(evaluate(web,"return document.querySelector('.mobile-dialog').matches(':modal')&&document.activeElement===document.querySelector('.mobile-dialog-heading button');"),name+': real Enter opens native menu and focuses Close')
                key('Tab')
                check(evaluate(web,"return document.querySelector('.mobile-dialog').contains(document.activeElement);"),name+': Tab remains inside native modal')
                if locale=='fa': capture(window,web,'07-fa-dark-mobile-menu')
                key('Escape')
                check(evaluate(web,"return !document.querySelector('.mobile-dialog').open&&document.activeElement===document.querySelector('.mobile-navigation > button');"),name+': real Escape closes menu and returns focus')
            if route=='/contact':
                evaluate(web,"document.querySelector('.inquiry-privacy a').focus();return true;");pump(.3)
                check(evaluate(web,"const el=document.activeElement,r=el.getBoundingClientRect();return el.matches('.inquiry-privacy a')&&r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===el;"),name+': inquiry privacy link visibly reachable')
                capture(window,web,'08-fa-dark-inquiry-privacy')
            evaluate(web,"window.scrollTo(0,document.documentElement.scrollHeight);return true;");pump(.5)
            capture(window,web,name+'-footer')
            window.destroy();pump()
        (OUT/'manifest.json').write_text(json.dumps({'evidence':'Production frontend, local HTTP / Ubuntu WebKitGTK-Xvfb; intake disabled; not full accessibility/legal/native Fedora acceptance','checks':checks,'captures':captures},ensure_ascii=False,indent=2)+'\n')
        print(f'PASS {len(checks)} browser spot checks, {len(captures)} captures; {OUT}')
    finally:
        os.killpg(server.pid,signal.SIGTERM);server.wait(timeout=10);log.seek(0);print(log.read())
