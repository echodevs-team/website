"""Small binding to installed WebKit/Cairo snapshot APIs.

PyGObject can start the async snapshot, but this guest lacks its optional Cairo
foreign-struct converter. Finish through the same public C API and serialize the
owned cairo_surface_t directly; no browser settings or page content are changed.
"""
import ctypes as c
import ctypes.util
import os
import time


class GError(c.Structure):
    _fields_ = [('domain', c.c_uint), ('code', c.c_int), ('message', c.c_char_p)]


class SnapshotAPI:
    def __init__(self):
        def installed(name):
            library = ctypes.util.find_library(name)
            if not library: raise RuntimeError('Installed snapshot library unavailable: '+name)
            return c.CDLL(library)
        self.webkit = installed('webkit2gtk-4.1')
        self.cairo = installed('cairo')
        self.glib = installed('glib-2.0')
        self.finish = self.webkit.webkit_web_view_get_snapshot_finish
        self.finish.argtypes = [c.c_void_p, c.c_void_p, c.POINTER(c.POINTER(GError))]
        self.finish.restype = c.c_void_p
        self.glib.g_error_free.argtypes = [c.POINTER(GError)]
        self.glib.g_error_free.restype = None
        for name, args, result in [
            ('cairo_surface_status', [c.c_void_p], c.c_int),
            ('cairo_surface_get_type', [c.c_void_p], c.c_int),
            ('cairo_surface_flush', [c.c_void_p], None),
            ('cairo_image_surface_get_width', [c.c_void_p], c.c_int),
            ('cairo_image_surface_get_height', [c.c_void_p], c.c_int),
            ('cairo_image_surface_get_stride', [c.c_void_p], c.c_int),
            ('cairo_image_surface_get_format', [c.c_void_p], c.c_int),
            ('cairo_image_surface_get_data', [c.c_void_p], c.c_void_p),
            ('cairo_surface_write_to_png', [c.c_void_p, c.c_char_p], c.c_int),
            ('cairo_surface_destroy', [c.c_void_p], None),
            ('cairo_status_to_string', [c.c_int], c.c_char_p),
        ]:
            function = getattr(self.cairo, name)
            function.argtypes, function.restype = args, result
        self.pointer = c.pythonapi.PyCapsule_GetPointer
        self.pointer.argtypes = [c.py_object, c.c_char_p]
        self.pointer.restype = c.c_void_p

    def status(self, code):
        if code: raise RuntimeError(self.cairo.cairo_status_to_string(code).decode())

    def save(self, surface, path):
        """Inspect/serialize a borrowed image surface; the caller owns destruction."""
        if not surface: raise RuntimeError('Snapshot returned no surface')
        self.status(self.cairo.cairo_surface_status(surface))
        if self.cairo.cairo_surface_get_type(surface) != 0:
            raise RuntimeError('Expected a Cairo image snapshot')
        self.cairo.cairo_surface_flush(surface)
        if self.cairo.cairo_image_surface_get_format(surface) not in (0, 1):
            raise RuntimeError('Expected a 32-bit Cairo snapshot')
        width = self.cairo.cairo_image_surface_get_width(surface)
        height = self.cairo.cairo_image_surface_get_height(surface)
        stride = self.cairo.cairo_image_surface_get_stride(surface)
        if width <= 0 or height <= 0 or stride < width * 4:
            raise RuntimeError('Invalid snapshot allocation')
        data = c.string_at(self.cairo.cairo_image_surface_get_data(surface), stride * height)
        colors = {data[y*stride+x*4:y*stride+x*4+3] for y in range(min(150, height-1),height,24) for x in range(0,width,24)}
        self.status(self.cairo.cairo_surface_write_to_png(surface, os.fsencode(path)))
        return {'width':width, 'height':height, 'bodySampleColors':len(colors)}

    def snapshot(self, web, path, pump, timeout=10):
        from gi.repository import Gio, WebKit2
        result = {}
        cancellable = Gio.Cancellable()
        def finished(view, task, _):
            surface = None
            try:
                error = c.POINTER(GError)()
                surface = self.finish(self.pointer(view.__gpointer__, None), self.pointer(task.__gpointer__, None), c.byref(error))
                if error:
                    message = error.contents.message.decode()
                    self.glib.g_error_free(error)
                    raise RuntimeError(message)
                if not cancellable.is_cancelled(): result['value'] = self.save(surface, path)
            except Exception as exc: result['error'] = str(exc)
            finally:
                if surface: self.cairo.cairo_surface_destroy(surface)
        web.get_snapshot(WebKit2.SnapshotRegion.VISIBLE, WebKit2.SnapshotOptions.NONE, cancellable, finished, None)
        deadline = time.monotonic()+timeout
        while not result and time.monotonic()<deadline: pump(.02)
        if not result:
            cancellable.cancel()
            raise RuntimeError('WebKit viewport snapshot timed out')
        if 'error' in result: raise RuntimeError(result['error'])
        return result['value']
