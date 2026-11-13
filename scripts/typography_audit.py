"""Static typography audit for ECHO-505.

Checks the self-hosted Vazirmatn assets, the @font-face declarations, the CSS
font stacks and the visitor-facing content for the typography rules documented
in docs/I18N-TERMINOLOGY.md. It never starts a browser or a server, so it can run
in CI before a production build exists.

The browser-level checks (font readiness, actual glyph use, clipping, fallback
rendering) live in scripts/audit-typography.py; this module only inspects files.

Run: python3 scripts/typography_audit.py [--json PATH]
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
FONT_CSS = Path('src/styles/fonts.css')
TOKENS_CSS = Path('src/styles/tokens.css')
GLOBALS_CSS = Path('src/styles/globals.css')
STYLES_DIR = Path('src/styles')
FONT_DIR = Path('public/fonts')

ARABIC_BLOCK = (0x0600, 0x06FF)
LATIN_BLOCK = (0x0000, 0x00FF)
PERSIAN_LETTERS = (0x0627, 0x06CC, 0x06A9, 0x200C, 0x200D)
ARABIC_PUNCTUATION = (0x060C, 0x061B, 0x061F)
PERSIAN_DIGITS = (0x06F0, 0x06F9)
ARABIC_INDIC_DIGITS = (0x0660, 0x0669)
LATIN_PUNCTUATION = (0x002C, 0x003B, 0x003F)
LATIN_SYMBOLS_USED_IN_COPY = (0x00B7, 0x2013, 0x2014, 0x2026)
GENERIC_SANS = {'sans-serif', 'system-ui', 'ui-sans-serif'}
MONOSPACE_FIRST = {'ui-monospace', 'monospace', 'menlo', 'consolas', 'sfmono-regular'}

FACE_RE = re.compile(r'@font-face\s*\{([^}]*)\}', re.S)
DECL_RE = re.compile(r'([-\w]+)\s*:\s*([^;]+);')
UNICODE_TOKEN_RE = re.compile(r'^U\+([0-9A-Fa-f?]{1,6})(?:-([0-9A-Fa-f?]{1,6}))?$')
SRC_URL_RE = re.compile(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)")
ARABIC_LETTER_RE = re.compile(r'[\u0600-\u06FF]')
ASCII_LATIN_TOKEN_RE = re.compile(r'[A-Za-z][A-Za-z0-9._/+&#:-]*')
PHONE_TOKEN_RE = re.compile(r'\+\d[\d\s-]*')
REPLACEMENT_CHAR = '\ufffd'


def parse_unicode_range(value: str) -> list[tuple[int, int]]:
    """Parse a CSS unicode-range value into inclusive integer intervals."""
    ranges: list[tuple[int, int]] = []
    for raw in value.split(','):
        token = raw.strip()
        if not token:
            continue
        match = UNICODE_TOKEN_RE.match(token)
        if not match:
            raise ValueError(f'Invalid unicode-range token: {token!r}')
        start_text, end_text = match.groups()
        if '?' in start_text or (end_text and '?' in end_text):
            if not end_text:
                end_text = start_text
            start = int(start_text.replace('?', '0'), 16)
            end = int(end_text.replace('?', 'F'), 16)
        else:
            start = int(start_text, 16)
            end = int(end_text, 16) if end_text else start
        if end < start:
            raise ValueError(f'Inverted unicode-range: {token!r}')
        ranges.append((start, end))
    return ranges


def merge_ranges(ranges: list[tuple[int, int]]) -> list[tuple[int, int]]:
    merged: list[tuple[int, int]] = []
    for start, end in sorted(ranges):
        if merged and start <= merged[-1][1] + 1:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def covers(ranges: list[tuple[int, int]], codepoint: int) -> bool:
    return any(start <= codepoint <= end for start, end in ranges)


def covers_interval(ranges: list[tuple[int, int]], start: int, end: int) -> bool:
    return any(a <= start and end <= b for a, b in merge_ranges(ranges))


def parse_font_faces(css: str) -> list[dict]:
    """Return the @font-face declarations as plain dictionaries."""
    faces = []
    for match in FACE_RE.finditer(css):
        declarations = {}
        for declaration in DECL_RE.finditer(match.group(1)):
            declarations[declaration.group(1).strip().lower()] = declaration.group(2).strip()
        src = declarations.get('src', '')
        url_match = SRC_URL_RE.search(src)
        faces.append({
            'family': declarations.get('font-family', '').strip().strip('\'"'),
            'weight': declarations.get('font-weight', '').strip(),
            'style': declarations.get('font-style', '').strip().lower(),
            'display': declarations.get('font-display', '').strip().lower(),
            'src': src,
            'url': url_match.group(1) if url_match else None,
            'format': 'woff2' if "format('woff2')" in src.replace('"', "'") else None,
            'unicodeRange': declarations.get('unicode-range', ''),
            'ranges': parse_unicode_range(declarations.get('unicode-range', ''))
            if declarations.get('unicode-range') else [],
        })
    return faces


def parse_font_list(value: str) -> list[str]:
    """Split a CSS family list on commas while respecting quoted names."""
    families, current, quote = [], [], None
    for char in value:
        if quote:
            if char == quote:
                quote = None
            else:
                current.append(char)
        elif char in '\'"':
            quote = char
        elif char == ',':
            families.append(''.join(current).strip())
            current = []
        else:
            current.append(char)
    families.append(''.join(current).strip())
    return [family for family in families if family]


def css_variable(css: str, name: str) -> str | None:
    match = re.search(rf'--{re.escape(name)}\s*:\s*([^;]+);', css)
    return match.group(1).strip() if match else None


def font_files(root: Path) -> dict[str, dict]:
    directory = root / FONT_DIR
    rows = {}
    if not directory.is_dir():
        return rows
    for path in sorted(directory.glob('*.woff2')):
        data = path.read_bytes()
        rows[path.name] = {
            'bytes': len(data),
            'sha256': hashlib.sha256(data).hexdigest(),
            'woff2': data[:4] == b'wOF2',
        }
    return rows


def decode_js_string(raw: str) -> str:
    """Decode the escapes that can appear in a double-quoted TypeScript string."""
    result = []
    index = 0
    simple = {'n': '\n', 'r': '\r', 't': '\t', '"': '"', "'": "'", '\\': '\\', '/': '/'}
    while index < len(raw):
        char = raw[index]
        if char != '\\' or index + 1 >= len(raw):
            result.append(char)
            index += 1
            continue
        following = raw[index + 1]
        if following in simple:
            result.append(simple[following])
            index += 2
        elif following == 'u' and re.fullmatch(r'[0-9A-Fa-f]{4}', raw[index + 2:index + 6] or ''):
            result.append(chr(int(raw[index + 2:index + 6], 16)))
            index += 6
        elif following == 'x' and re.fullmatch(r'[0-9A-Fa-f]{2}', raw[index + 2:index + 4] or ''):
            result.append(chr(int(raw[index + 2:index + 4], 16)))
            index += 4
        else:
            result.append(following)
            index += 2
    return ''.join(result)


def content_strings(root: Path) -> list[tuple[str, str]]:
    """Collect string literals from localized content and message JSON.

    The scan is intentionally lexical: it covers the copy modules and message
    dictionaries, where visitor-facing strings live. It is not a TypeScript
    parser, so it never needs to evaluate code.
    """
    strings: list[tuple[str, str]] = []
    for path in sorted((root / 'src/content').glob('*.ts')):
        text = path.read_text(encoding='utf8')
        for match in re.finditer(r'"((?:[^"\\]|\\.)*)"', text):
            strings.append((path.name, decode_js_string(match.group(1))))
    for path in sorted((root / 'src/i18n/messages').glob('*.json')):
        data = json.loads(path.read_text(encoding='utf8'))

        def walk(value):
            if isinstance(value, str):
                strings.append((path.name, value))
            elif isinstance(value, dict):
                for item in value.values():
                    walk(item)
            elif isinstance(value, list):
                for item in value:
                    walk(item)

        walk(data)
    return strings


def uncovered_characters(strings: list[tuple[str, str]], ranges: list[tuple[int, int]]) -> list[dict]:
    seen: dict[int, dict] = {}
    for source, value in strings:
        for char in value:
            codepoint = ord(char)
            if codepoint < 0x80 or unicodedata.category(char)[0] not in 'LPS':
                continue
            if covers(ranges, codepoint):
                continue
            row = seen.setdefault(codepoint, {
                'codepoint': f'U+{codepoint:04X}',
                'name': unicodedata.name(char, 'unknown'),
                'char': char,
                'sources': [],
            })
            if source not in row['sources']:
                row['sources'].append(source)
    return [seen[key] for key in sorted(seen)]


def latin_punctuation_in_rtl(strings: list[tuple[str, str]]) -> list[dict]:
    """Find ASCII , ; ? used as prose punctuation inside Arabic-script copy."""
    findings = []
    pattern = re.compile(r'[\u0600-\u06FF][\u0600-\u06FF\s\u200c\u200d]*([,;?])(?=\s|$)')
    for source, value in strings:
        if not ARABIC_LETTER_RE.search(value):
            continue
        for match in pattern.finditer(value):
            findings.append({'source': source, 'punctuation': match.group(1), 'sample': value[:120]})
    return findings


def ascii_digits_in_rtl_prose(strings: list[tuple[str, str]]) -> list[dict]:
    """Find Western digits left in prose that has no Latin technical token."""
    findings = []
    for source, value in strings:
        if not ARABIC_LETTER_RE.search(value):
            continue
        simplified = PHONE_TOKEN_RE.sub('', value)
        simplified = ASCII_LATIN_TOKEN_RE.sub('', simplified)
        simplified = re.sub(r'/\s*[0-9]+', '', simplified)
        digits = re.findall(r'[0-9]+', simplified)
        if digits:
            findings.append({'source': source, 'digits': digits, 'sample': value[:120]})
    return findings


def audit_repository(root: Path = ROOT) -> dict:
    errors: list[str] = []
    warnings: list[str] = []
    checks = 0

    def require(condition, message):
        nonlocal checks
        checks += 1
        if not condition:
            errors.append(message)
        return bool(condition)

    fonts_css_path = root / FONT_CSS
    tokens_css_path = root / TOKENS_CSS
    globals_css_path = root / GLOBALS_CSS
    if not fonts_css_path.is_file():
        return {'ok': False, 'errors': [f'Missing {FONT_CSS}'], 'warnings': [], 'checks': 0,
                'faces': [], 'fonts': {}, 'content': {}}

    css = fonts_css_path.read_text(encoding='utf8')
    faces = parse_font_faces(css)
    assets = font_files(root)

    require(len(faces) == 6, f'Expected 6 @font-face declarations, found {len(faces)}')
    by_key: dict[tuple[str, str], dict] = {}
    for face in faces:
        label = f"{face['family']} {face['weight']} {face['ranges']}"
        require(face['family'].lower() == 'vazirmatn', f'{label}: unexpected family')
        require(face['style'] == 'normal', f'{label}: font-style must be normal')
        require(face['display'] == 'swap', f'{label}: font-display must be swap (readable fallback while loading)')
        require(face['format'] == 'woff2', f'{label}: src must use WOFF2')
        url = face['url']
        require(bool(url), f'{label}: missing src URL')
        if url:
            require(url.startswith('/fonts/'), f'{label}: font URL must be self-hosted under /fonts/ ({url})')
            require('http://' not in url and 'https://' not in url, f'{label}: external font request {url}')
            name = url.rsplit('/', 1)[-1]
            asset = assets.get(name)
            require(asset is not None, f'{label}: asset {url} is missing')
            if asset:
                require(asset['woff2'], f'{label}: {name} is not a WOFF2 file')
                require(asset['bytes'] >= 1024, f'{label}: {name} is implausibly small')
        arabic = covers_interval(face['ranges'], *ARABIC_BLOCK)
        latin = covers_interval(face['ranges'], *LATIN_BLOCK)
        require(arabic != latin, f'{label}: each face must be either the Arabic or the Latin subset')
        subset = 'arabic' if arabic else 'latin'
        by_key[(subset, face['weight'])] = face
        if subset == 'arabic':
            for codepoint in (*PERSIAN_LETTERS, *ARABIC_PUNCTUATION):
                require(covers(face['ranges'], codepoint),
                        f'{label}: missing U+{codepoint:04X}')
            require(covers_interval(face['ranges'], *PERSIAN_DIGITS),
                    f'{label}: Persian digits U+06F0-06F9 are not covered')
            require(covers_interval(face['ranges'], *ARABIC_INDIC_DIGITS),
                    f'{label}: Arabic-Indic digits U+0660-0669 are not covered')
        else:
            require(covers_interval(face['ranges'], 0x0041, 0x007A),
                    f'{label}: Latin letters are not covered')
            require(covers_interval(face['ranges'], 0x0030, 0x0039),
                    f'{label}: Latin digits are not covered')
            require(covers_interval(face['ranges'], 0x2000, 0x206F),
                    f'{label}: general punctuation (dashes, ellipsis, quotes) is not covered')
            for codepoint in LATIN_SYMBOLS_USED_IN_COPY:
                require(covers(face['ranges'], codepoint), f'{label}: missing U+{codepoint:04X}')

    for weight in ('400', '500', '700'):
        for subset in ('arabic', 'latin'):
            require((subset, weight) in by_key, f'Missing {subset} face at weight {weight}')

    if ('arabic', '400') in by_key and ('latin', '400') in by_key:
        arabic_ranges = by_key[('arabic', '400')]['ranges']
        latin_ranges = by_key[('latin', '400')]['ranges']
        overlap = set()
        for start, end in merge_ranges(arabic_ranges):
            for other_start, other_end in merge_ranges(latin_ranges):
                if max(start, other_start) <= min(end, other_end):
                    overlap.update(range(max(start, other_start), min(end, other_end) + 1))
        disallowed = {cp for cp in overlap if unicodedata.category(chr(cp)) != 'Cf'}
        require(not disallowed,
                'Arabic and Latin unicode ranges overlap outside format controls: '
                + ', '.join(f'U+{cp:04X}' for cp in sorted(disallowed)))

    style_css = {}
    for path in sorted((root / STYLES_DIR).glob('*.css')):
        style_css[path.name] = path.read_text(encoding='utf8')
    for name, text in style_css.items():
        if name != FONT_CSS.name:
            require('@font-face' not in text, f'{name}: @font-face declarations belong in fonts.css')
        for line_number, line in enumerate(text.splitlines(), 1):
            if 'letter-spacing' not in line:
                continue
            require(':lang(en)' in line or '.language-switch' in line,
                    f'{name}:{line_number}: letter-spacing must be scoped to :lang(en) or the Latin locale codes')
        for match in re.finditer(r'url\(\s*[\'"]?(https?://[^\'")]+)', text):
            errors.append(f'{name}: external resource {match.group(1)}')
        checks += 1

    tokens = tokens_css_path.read_text(encoding='utf8') if tokens_css_path.is_file() else ''
    body_stack = css_variable(tokens, 'font-body')
    mono_stack = css_variable(tokens, 'font-mono')
    require(body_stack is not None, 'tokens.css must define --font-body')
    require(mono_stack is not None, 'tokens.css must define --font-mono')
    body_families = parse_font_list(body_stack or '')
    mono_families = parse_font_list(mono_stack or '')
    require(bool(body_families) and body_families[0].strip('"\'').lower() == 'vazirmatn',
            '--font-body must start with the approved Vazirmatn family')
    require(any(family.lower() in GENERIC_SANS for family in body_families),
            '--font-body must keep a generic sans-serif fallback')
    require(bool(mono_families) and mono_families[0].lower() in MONOSPACE_FIRST,
            '--font-mono must keep a monospace family first')
    require(any(family.strip('"\'').lower() == 'vazirmatn' for family in mono_families[1:]),
            '--font-mono must list Vazirmatn after the monospace family so Persian/Arabic '
            'text in mono-styled chrome uses the approved script face instead of a silent system fallback')
    require(not any(family.startswith(('http://', 'https://')) for family in (*body_families, *mono_families)),
            'Font stacks must not contain external URLs')

    globals_css = globals_css_path.read_text(encoding='utf8') if globals_css_path.is_file() else ''
    require(re.search(r'body\s*\{[^}]*font-family\s*:\s*var\(--font-body\)', globals_css, re.S) is not None,
            'globals.css body rule must use var(--font-body)')

    source_text = []
    for path in sorted((root / 'src').rglob('*')):
        if path.suffix in {'.ts', '.tsx', '.css', '.json', '.md'} and path.is_file():
            source_text.append((str(path.relative_to(root)), path.read_text(encoding='utf8')))
    external = []
    for name, text in source_text:
        for match in re.finditer(r'https?://[^\s\'"<>)]+', text):
            url = match.group(0)
            if re.search(r'font|gstatic|googleapis', url, re.I):
                external.append(f'{name}: {url}')
    require(not external, 'External font requests found: ' + ', '.join(external[:5]))

    strings = content_strings(root)
    require(bool(strings), 'No localized content strings were found')
    all_ranges = merge_ranges([interval for face in faces for interval in face['ranges']])
    uncovered = uncovered_characters(strings, all_ranges)
    for row in uncovered:
        warnings.append(
            f"{row['codepoint']} {row['name']} is outside the declared font ranges and uses a system fallback "
            f"({', '.join(row['sources'][:3])})")
    replacement = [(source, value) for source, value in strings if REPLACEMENT_CHAR in value]
    require(not replacement, 'Replacement characters (U+FFFD) found in localized content')

    for finding in latin_punctuation_in_rtl(strings):
        errors.append(
            f"{finding['source']}: Latin '{finding['punctuation']}' inside RTL prose: {finding['sample']!r}")
    for finding in ascii_digits_in_rtl_prose(strings):
        errors.append(
            f"{finding['source']}: Western digits {finding['digits']} in RTL prose without a Latin token: "
            f"{finding['sample']!r}")

    return {
        'ok': not errors,
        'checks': checks,
        'errors': errors,
        'warnings': warnings,
        'faces': [
            {
                'family': face['family'],
                'weight': face['weight'],
                'style': face['style'],
                'display': face['display'],
                'url': face['url'],
                'format': face['format'],
                'unicodeRange': face['unicodeRange'],
            }
            for face in faces
        ],
        'fonts': assets,
        'fontStacks': {'body': body_stack, 'mono': mono_stack},
        'content': {
            'strings': len(strings),
            'uncovered': uncovered,
            'latinPunctuation': latin_punctuation_in_rtl(strings),
            'westernDigits': ascii_digits_in_rtl_prose(strings),
        },
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', default=str(ROOT), help='repository root to audit')
    parser.add_argument('--json', help='write the full report to this path')
    parser.add_argument('--quiet', action='store_true', help='only print errors and the result')
    args = parser.parse_args(argv)

    report = audit_repository(Path(args.root).resolve())
    if not args.quiet:
        for face in report['faces']:
            print(f"FACE {face['family']} {face['weight']} {face['url']} {face['unicodeRange']}")
        for row in report['fonts'].items():
            print(f"ASSET {row[0]} {row[1]['bytes']} bytes sha256={row[1]['sha256'][:16]} woff2={row[1]['woff2']}")
        for warning in report['warnings'][:20]:
            print('WARN', warning)
        if len(report['warnings']) > 20:
            print(f'WARN ... {len(report["warnings"]) - 20} more fallback characters')
    for error in report['errors']:
        print('ERROR', error)
    print(f"RESULT {'PASS' if report['ok'] else 'FAIL'} checks={report['checks']} "
          f"errors={len(report['errors'])} warnings={len(report['warnings'])}")
    if args.json:
        Path(args.json).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
