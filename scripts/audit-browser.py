"""ECHO-407 bounded production-HTTP WebKitGTK spot checks, not full acceptance.
Uses existing Ubuntu GTK/WebKit/XTest only; no download, intake or DB access.
Run: xvfb-run -a -s '-screen 0 1500x1100x24 -nolisten tcp' /usr/bin/python3 scripts/audit-browser.py
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
from webkit_snapshot import SnapshotAPI

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

def page_state(window, web):
    state=evaluate(web,"return {width:innerWidth,height:innerHeight,theme:document.documentElement.dataset.theme,locale:document.documentElement.lang,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth+1,ready:document.readyState,fonts:document.fonts.status,faces:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({complete:i.complete,width:i.naturalWidth})),scrollY,scrollHeight:document.documentElement.scrollHeight,footer:{top:document.querySelector('footer').getBoundingClientRect().top,height:document.querySelector('footer').getBoundingClientRect().height},typography:[...document.querySelectorAll('h1,footer p')].map(el=>{const s=getComputedStyle(el);return {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight};}),paintEntries:performance.getEntriesByType('paint').map(p=>p.name)};")
    allocation=web.get_allocation()
    state['gtk']={'visible':web.get_visible(),'mapped':web.get_mapped(),'realized':web.get_realized(),'drawable':web.is_drawable(),'allocated':[allocation.width,allocation.height], 'frameCounter':web.get_frame_clock().get_frame_counter(), 'scale':web.get_scale_factor()}
    return state

def wait_capture_ready(web):
    # No content/style mutation: wait for real fonts/images and stable layout over
    # consecutive animation frames. Animation pixels need not be static. Snapshot
    # completion below, not this DOM gate, supplies composited paint evidence.
    evaluate(web,"""window.__echoCapture={done:false};(async()=>{
      await document.fonts.ready;
      await Promise.all([...document.images].map(i=>i.decode()));
      if([...document.fonts].some(f=>f.status==='error'))throw Error('Font load failed');
      let previous;
      for(let frame=0;frame<120;frame++){
        await new Promise(requestAnimationFrame);
        const geometry=JSON.stringify([innerWidth,innerHeight,scrollY,document.documentElement.scrollHeight,
          ...[...document.querySelectorAll('main,footer')].flatMap(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})]);
        if(geometry===previous){window.__echoCapture={done:true};return;}previous=geometry;
      }throw Error('Layout did not settle');
    })().catch(e=>window.__echoCapture={done:true,error:String(e)});return true;""")
    deadline=time.monotonic()+10
    while time.monotonic()<deadline:
        result=evaluate(web,'return window.__echoCapture;')
        if result.get('done'):
            if result.get('error'): raise RuntimeError(result['error'])
            return
        pump(.02)
    raise RuntimeError('Fonts/images/layout readiness timed out')

def capture(window, web, name):
    if '--diagnose' not in sys.argv:
        # Save diagnostics before any possible readiness or image-write failure.
        (OUT/(name+'-before.json')).write_text(json.dumps(page_state(window,web),ensure_ascii=False,indent=2)+'\n')
        wait_capture_ready(web)
        state=page_state(window,web)
        (OUT/(name+'-state.json')).write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
        check(not state['overflow'],name+': no horizontal viewport overflow')
        check(state['gtk']['mapped'] and state['gtk']['drawable'],name+': mapped drawable WebView')
        check(state['gtk']['allocated']==[state['width'],state['height']],name+': GTK allocation matches viewport')
        path=OUT/(name+'.png')
        snapshot=SnapshotAPI().snapshot(web,path,pump)
        check([snapshot['width'],snapshot['height']]==[state['width'],state['height']],name+': complete viewport snapshot dimensions')
        check(snapshot['bodySampleColors']>8,name+': nonflat WebKit snapshot (manual inspection required)')
        captures.append({'path':str(path),'kind':'viewport','backend':'WebKit snapshot / installed Cairo C API',**state,'snapshot':snapshot})
        print('CAPTURE',path,{k:state[k] for k in ['width','height','locale','theme','scrollY']})
        return
    # Historical GDK path retained solely for paired failure reproduction.
    pump(.4)
    state=evaluate(web,"return {width:innerWidth,height:innerHeight,theme:document.documentElement.dataset.theme,locale:document.documentElement.lang,dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth+1};")
    check(not state['overflow'], name+': no horizontal viewport overflow')
    image=Gdk.pixbuf_get_from_window(window.get_window(),0,0,*window.get_size())
    if image is None: raise RuntimeError('Capture failed')
    # Preserve even flat/partial GDK output as diagnosis, never as acceptance.
    pixels=image.get_pixels();stride=image.get_rowstride();channels=image.get_n_channels()
    colors={tuple(pixels[y*stride+x*channels:y*stride+x*channels+3])
            for y in range(150,image.get_height(),24) for x in range(0,image.get_width(),24)}
    if '--diagnose' in sys.argv:
        path=OUT/(name+'-gdk.png');image.savev(str(path),'png',[],[])
        allocation=web.get_allocation()
        state['gtk']={'visible':web.get_visible(),'mapped':web.get_mapped(),'realized':web.get_realized(),'drawable':web.is_drawable(),'allocated':[allocation.width,allocation.height], 'frameCounter':web.get_frame_clock().get_frame_counter()}
        state['page']=evaluate(web,"return {ready:document.readyState,fonts:document.fonts.status,faces:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({complete:i.complete,width:i.naturalWidth})),scrollY,scrollHeight:document.documentElement.scrollHeight,footer:{top:document.querySelector('footer').getBoundingClientRect().top,height:document.querySelector('footer').getBoundingClientRect().height},footerHit:document.elementFromPoint(innerWidth/2,innerHeight-100)?.outerHTML.slice(0,180),paintEntries:performance.getEntriesByType('paint').map(p=>p.name)};")
        state['gdkBodySampleColors']=len(colors)
        snapshot=OUT/(name+'-webkit.png')
        diagnostic=OUT/(name+'-diagnostic.json')
        diagnostic.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
        state['snapshot']=SnapshotAPI().snapshot(web,snapshot,pump)
        captures.append({'gdkPath':str(path),'webkitPath':str(snapshot),**state})
        diagnostic.write_text(json.dumps(captures[-1],ensure_ascii=False,indent=2)+'\n')
        print('DIAGNOSTIC',json.dumps(captures[-1],ensure_ascii=False))
        return

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
        if '--diagnose' in sys.argv: cases=[('en','light',1440,'','desktop-reproduction')]
        if '--desktop-evidence' in sys.argv:
            cases=[('en','light',1440,'','01-en-light-home'),('fa','dark',1440,'','02-fa-dark-home'),
                   ('ar','dark',1440,'/services','03-ar-dark-services'),('fa','light',1440,'/contact','04-fa-light-contact'),
                   ('en','dark',1440,'/privacy','05-en-dark-privacy'),('en','dark',375,'/about','06-en-dark-about-narrow')]
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
                evaluate(web,"document.querySelector('.inquiry-privacy a').focus();return true;");wait_capture_ready(web)
                check(evaluate(web,"const el=document.activeElement,r=el.getBoundingClientRect();return el.matches('.inquiry-privacy a')&&r.top>=document.querySelector('header').getBoundingClientRect().bottom&&r.bottom<=innerHeight&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===el;"),name+': inquiry privacy link visibly reachable')
                capture(window,web,name+'-inquiry-privacy')
            evaluate(web,"window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});return true;")
            capture(window,web,name+'-footer')
            check(evaluate(web,"return Math.abs(scrollY-Math.max(0,document.documentElement.scrollHeight-innerHeight))<2;"),name+': deliberate bottom-of-page viewport, not full-page capture')
            window.destroy();pump()
        (OUT/'manifest.json').write_text(json.dumps({'evidence':'Production frontend, local HTTP / Ubuntu WebKitGTK-Xvfb; intake disabled; not full accessibility/legal/native Fedora acceptance','checks':checks,'captures':captures},ensure_ascii=False,indent=2)+'\n')
        print(f'PASS {len(checks)} browser spot checks, {len(captures)} captures; {OUT}')
    except Exception as error:
        (OUT/'failure.json').write_text(json.dumps({'error':str(error),'checks':checks,'captures':captures},ensure_ascii=False,indent=2)+'\n')
        raise
    finally:
        if server.poll() is None:
            os.killpg(server.pid,signal.SIGTERM);server.wait(timeout=10)
        log.seek(0);output=log.read();(OUT/'server.log').write_text(output);print(output)
