"""Focused installed-library ABI/serialization tests; no browser/server/intake."""
import ctypes as c
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch

import gi
gi.require_version('WebKit2', '4.1')
from webkit_snapshot import SnapshotAPI


class SnapshotTests(unittest.TestCase):
    def test_cairo_image_round_trip_without_python_cairo_converter(self):
        api = SnapshotAPI()
        create = api.cairo.cairo_image_surface_create
        create.argtypes, create.restype = [c.c_int, c.c_int, c.c_int], c.c_void_p
        surface = create(0, 32, 24)  # CAIRO_FORMAT_ARGB32
        try:
            with tempfile.TemporaryDirectory(prefix='echo-snapshot-') as directory:
                path = Path(directory)/'image.png'
                result = api.save(surface, path)
                png = path.read_bytes()
                self.assertEqual(png[:8], b'\x89PNG\r\n\x1a\n')
                self.assertEqual(struct.unpack('>II', png[16:24]), (32,24))
                self.assertEqual(result, {'width':32,'height':24,'bodySampleColors':1})
        finally: api.cairo.cairo_surface_destroy(surface)

    def test_null_surface_is_rejected_before_serialization(self):
        with self.assertRaisesRegex(RuntimeError, 'no surface'):
            SnapshotAPI().save(None, 'must-not-be-written.png')

    def test_cairo_errors_are_not_suppressed(self):
        with self.assertRaises(RuntimeError): SnapshotAPI().status(1)

    def test_png_write_failure_is_reported(self):
        api = SnapshotAPI()
        create = api.cairo.cairo_image_surface_create
        create.argtypes, create.restype = [c.c_int, c.c_int, c.c_int], c.c_void_p
        surface = create(0, 32, 24)
        try:
            with tempfile.TemporaryDirectory(prefix='echo-snapshot-') as directory:
                with self.assertRaises(RuntimeError): api.save(surface, Path(directory)/'absent'/'image.png')
        finally: api.cairo.cairo_surface_destroy(surface)

    def test_timeout_cancels_and_late_callback_cannot_write(self):
        api = SnapshotAPI()
        class PendingView:
            __gpointer__ = None
            def get_snapshot(self, region, options, cancellable, callback, data):
                self.cancellable, self.callback = cancellable, callback
        web = PendingView()
        with patch.object(api, 'pointer', return_value=None), patch.object(api, 'finish', return_value=None), patch.object(api, 'save') as save:
            with self.assertRaisesRegex(RuntimeError, 'timed out'):
                api.snapshot(web, 'must-not-be-written.png', lambda _: None, timeout=0)
            self.assertTrue(web.cancellable.is_cancelled())
            web.callback(web, web, None)
            save.assert_not_called()

    def test_callback_failure_releases_owned_surface(self):
        api = SnapshotAPI()
        class ImmediateView:
            __gpointer__ = None
            def get_snapshot(self, region, options, cancellable, callback, data): callback(self, self, None)
        with patch.object(api, 'pointer', return_value=None), patch.object(api, 'finish', return_value=123), patch.object(api, 'save', side_effect=RuntimeError('fixture serialization error')), patch.object(api.cairo, 'cairo_surface_destroy') as destroy:
            with self.assertRaisesRegex(RuntimeError, 'fixture serialization error'):
                api.snapshot(ImmediateView(), 'must-not-be-written.png', lambda _: None)
            destroy.assert_called_once_with(123)


if __name__ == '__main__': unittest.main()
