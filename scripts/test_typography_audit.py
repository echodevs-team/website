"""Tests for the ECHO-505 static typography audit (no browser required)."""
from pathlib import Path
import shutil
import tempfile
import unittest

from typography_audit import (
    ARABIC_BLOCK,
    LATIN_BLOCK,
    ascii_digits_in_rtl_prose,
    audit_repository,
    content_strings,
    covers,
    covers_interval,
    css_variable,
    decode_js_string,
    latin_punctuation_in_rtl,
    merge_ranges,
    parse_font_faces,
    parse_font_list,
    parse_unicode_range,
    uncovered_characters,
)

ROOT = Path(__file__).resolve().parents[1]


class UnicodeRangeTests(unittest.TestCase):
    def test_parses_ranges_singletons_and_wildcards(self):
        self.assertEqual(
            parse_unicode_range('U+0600-06FF, U+200C, U+20??'),
            [(0x0600, 0x06FF), (0x200C, 0x200C), (0x2000, 0x20FF)],
        )

    def test_rejects_invalid_and_inverted_tokens(self):
        for value in ('0600-06FF', 'U+06FF-0600', 'U+GGGG'):
            with self.subTest(value=value), self.assertRaises(ValueError):
                parse_unicode_range(value)

    def test_merges_and_checks_intervals(self):
        ranges = merge_ranges([(0x0600, 0x0605), (0x0606, 0x06FF), (0x0041, 0x005A)])
        self.assertEqual(ranges, [(0x0041, 0x005A), (0x0600, 0x06FF)])
        self.assertTrue(covers(ranges, 0x0627))
        self.assertFalse(covers(ranges, 0x2192))
        self.assertTrue(covers_interval(ranges, *ARABIC_BLOCK))
        self.assertFalse(covers_interval(ranges, *LATIN_BLOCK))


class FontFaceTests(unittest.TestCase):
    def test_parses_family_weight_display_and_src(self):
        faces = parse_font_faces("""
          @font-face {
            font-family: Vazirmatn; font-style: normal; font-weight: 400;
            font-display: swap;
            src: url('/fonts/vazirmatn-arabic-400-normal.woff2') format('woff2');
            unicode-range: U+0600-06FF, U+200C;
          }
        """)
        self.assertEqual(len(faces), 1)
        self.assertEqual(faces[0]['family'], 'Vazirmatn')
        self.assertEqual(faces[0]['weight'], '400')
        self.assertEqual(faces[0]['display'], 'swap')
        self.assertEqual(faces[0]['url'], '/fonts/vazirmatn-arabic-400-normal.woff2')
        self.assertEqual(faces[0]['format'], 'woff2')
        self.assertEqual(faces[0]['ranges'], [(0x0600, 0x06FF), (0x200C, 0x200C)])

    def test_parses_quoted_family_lists_and_variables(self):
        self.assertEqual(
            parse_font_list('"Vazirmatn", system-ui, sans-serif'),
            ['Vazirmatn', 'system-ui', 'sans-serif'],
        )
        self.assertEqual(
            css_variable(':root { --font-body: "Vazirmatn", system-ui, sans-serif; }', 'font-body'),
            '"Vazirmatn", system-ui, sans-serif',
        )


class ContentScanTests(unittest.TestCase):
    def test_decodes_typescript_escapes_without_corrupting_persian(self):
        self.assertEqual(decode_js_string(r'نیم\u200cفاصله \"نقل\"'), 'نیم\u200cفاصله "نقل"')
        self.assertEqual(decode_js_string(r'\u06F1'), '\u06f1')
        self.assertIn('اکو', decode_js_string('اکو دوز'))

    def test_reports_only_characters_outside_the_declared_ranges(self):
        strings = [('copy.ts', 'سلام \u2192 پایان'), ('copy.ts', 'Echo Devs')]
        ranges = [(0x0600, 0x06FF), (0x0000, 0x00FF), (0x2000, 0x206F)]
        rows = uncovered_characters(strings, ranges)
        self.assertEqual([row['codepoint'] for row in rows], ['U+2192'])

    def test_flags_ascii_punctuation_inside_rtl_prose_only(self):
        findings = latin_punctuation_in_rtl([
            ('fa.ts', 'این یک جمله است, با ویرگول لاتین.'),
            ('en.ts', 'Echo Devs, a software studio.'),
            ('fa.ts', 'از API, داده و یکپارچه‌سازی استفاده می‌کنیم.'),
        ])
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]['punctuation'], ',')

    def test_flags_western_digits_in_rtl_prose_but_allows_technical_tokens(self):
        findings = ascii_digits_in_rtl_prose([
            ('fa.ts', 'سه حوزه خدمات'),
            ('fa.ts', '3 حوزه خدمات'),
            ('fa.ts', 'فرم ۲۰ تا ۵۰۰۰ نویسه دارد.'),
            ('fa.ts', 'IPv6 با پیشوند /64 و API v2 و +44…'),
        ])
        self.assertEqual([row['digits'] for row in findings], [['3']])


class RepositoryAuditTests(unittest.TestCase):
    def test_current_repository_passes_with_documented_fallbacks(self):
        report = audit_repository(ROOT)
        self.assertTrue(report['ok'], report['errors'])
        self.assertEqual(len(report['faces']), 6)
        self.assertEqual(set(report['fonts']), {
            'vazirmatn-arabic-400-normal.woff2', 'vazirmatn-arabic-500-normal.woff2',
            'vazirmatn-arabic-700-normal.woff2', 'vazirmatn-latin-400-normal.woff2',
            'vazirmatn-latin-500-normal.woff2', 'vazirmatn-latin-700-normal.woff2',
        })
        self.assertTrue(all(asset['woff2'] for asset in report['fonts'].values()))
        fallbacks = {row['codepoint'] for row in report['content']['uncovered']}
        self.assertEqual(fallbacks, {'U+2190', 'U+2192'})
        self.assertGreater(report['checks'], 100)
        self.assertGreater(report['content']['strings'], 100)

    def test_real_content_has_no_latin_punctuation_or_western_digits_in_rtl_prose(self):
        report = audit_repository(ROOT)
        self.assertEqual(report['content']['latinPunctuation'], [])
        self.assertEqual(report['content']['westernDigits'], [])

    def _copy_repository(self, destination: Path) -> Path:
        shutil.copytree(ROOT / 'src', destination / 'src')
        shutil.copytree(ROOT / 'public', destination / 'public')
        return destination

    def test_missing_font_asset_and_external_url_are_errors(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self._copy_repository(Path(directory))
            (root / 'public/fonts/vazirmatn-arabic-400-normal.woff2').unlink()
            fonts_css = root / 'src/styles/fonts.css'
            fonts_css.write_text(fonts_css.read_text().replace(
                "url('/fonts/vazirmatn-latin-500-normal.woff2')",
                "url('https://fonts.example.test/vazirmatn-latin-500-normal.woff2')"), encoding='utf8')
            report = audit_repository(root)
            self.assertFalse(report['ok'])
            joined = '\n'.join(report['errors'])
            self.assertIn('is missing', joined)
            self.assertIn('self-hosted', joined)

    def test_old_monospace_stack_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = self._copy_repository(Path(directory))
            tokens = root / 'src/styles/tokens.css'
            tokens.write_text(tokens.read_text().replace(
                '--font-mono: ui-monospace, "Vazirmatn", monospace;',
                '--font-mono: ui-monospace, monospace;'), encoding='utf8')
            report = audit_repository(root)
            self.assertFalse(report['ok'])
            self.assertTrue(any('--font-mono must list Vazirmatn' in error for error in report['errors']))

    def test_content_strings_include_messages_and_copy_modules(self):
        strings = content_strings(ROOT)
        sources = {source for source, _ in strings}
        self.assertIn('home.ts', sources)
        self.assertIn('fa.json', sources)
        self.assertTrue(any('\u0627' in value for _, value in strings))


if __name__ == '__main__':
    unittest.main()
