"""Focused tests for evidence metadata; no browser, server or network access."""
from pathlib import Path
import unittest

from evidence_manifest import page_path, page_url, source_revision, evidence_root

ROOT = Path(__file__).resolve().parents[1]


class PageUrlTests(unittest.TestCase):
    def test_homepage_has_locale_segment(self):
        self.assertEqual(page_path('fa', ''), '/fa')
        self.assertEqual(page_path('en', '/'), '/en')
        self.assertEqual(page_url('http://127.0.0.1:4310', 'ar', ''), 'http://127.0.0.1:4310/ar')

    def test_marketing_routes_keep_the_separator(self):
        # Regression: the old manifest wrote `/facontact` for this input.
        self.assertEqual(page_path('fa', '/contact'), '/fa/contact')
        self.assertEqual(page_url('http://127.0.0.1:4310', 'fa', '/contact'), 'http://127.0.0.1:4310/fa/contact')
        self.assertEqual(page_url('http://127.0.0.1:4310', 'en', '/work/chat'), 'http://127.0.0.1:4310/en/work/chat')
        self.assertEqual(page_url('http://127.0.0.1:4310', 'ar', '/work'), 'http://127.0.0.1:4310/ar/work')

    def test_route_without_leading_slash_is_normalized(self):
        self.assertEqual(page_path('fa', 'contact'), '/fa/contact')

    def test_drawer_capture_reports_the_contact_page(self):
        self.assertEqual(page_path('fa', '/contact-drawer'), '/fa/contact')
        self.assertEqual(page_url('http://127.0.0.1:4310', 'fa', '/contact-drawer'), 'http://127.0.0.1:4310/fa/contact')

    def test_origin_trailing_slash_does_not_double(self):
        self.assertEqual(page_url('http://127.0.0.1:4310/', 'en', '/about'), 'http://127.0.0.1:4310/en/about')

    def test_no_malformed_concatenation_for_any_harness_route(self):
        for locale in ('fa', 'en', 'ar'):
            for route in ('', '/contact', '/work', '/about', '/work/chat', '/privacy'):
                url = page_url('http://127.0.0.1:4310', locale, route)
                self.assertNotIn(locale+'contact', url)
                self.assertTrue(url.startswith('http://127.0.0.1:4310/'+locale))

    def test_invalid_inputs_are_rejected(self):
        with self.assertRaises(ValueError):
            page_path('', '/contact')
        with self.assertRaises(ValueError):
            page_url('file:///tmp/x', 'fa', '/contact')
        with self.assertRaises(ValueError):
            page_url('http://127.0.0.1:4310', 'fa', None)


class RevisionTests(unittest.TestCase):
    def test_records_a_full_revision_and_dirty_flag(self):
        record = source_revision(ROOT)
        self.assertEqual(len(record['testedSourceRevision']), 40)
        self.assertIsInstance(record['worktreeDirty'], bool)

    def test_evidence_root_stays_inside_the_repository(self):
        self.assertEqual(evidence_root(ROOT), ROOT.resolve()/'test-results')


if __name__ == '__main__':
    unittest.main()
