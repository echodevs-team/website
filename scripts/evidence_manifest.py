"""Testable metadata helpers shared by the browser evidence harnesses.

The harnesses themselves need a display and WebKit; this module only builds and
validates the facts they write to a manifest, so URL and revision serialization
can be checked without launching a browser.

ECHO-VF01-R1: an earlier manifest serialized `origin + '/' + locale + stripped
route`, which produced `/facontact` for `fa` + `/contact`. `page_url` now keeps
the locale segment and the route separator explicit.
"""
from pathlib import Path
import subprocess

# A drawer capture photographs the Contact page with its dialog open.
ROUTE_ALIASES = {'/contact-drawer': '/contact'}


def page_path(locale, route):
    """Return the canonical path for a locale and marketing route."""
    if not isinstance(locale, str) or not locale.strip('/'):
        raise ValueError('locale is required')
    if not isinstance(route, str):
        raise ValueError('route must be a string')
    resolved = ROUTE_ALIASES.get(route, route).strip()
    if resolved in ('', '/'):
        return '/' + locale.strip('/')
    if not resolved.startswith('/'):
        resolved = '/' + resolved
    return '/' + locale.strip('/') + resolved


def page_url(origin, locale, route):
    """Return the exact URL the harness loads, with no ambiguous concatenation."""
    if not isinstance(origin, str) or not origin.startswith(('http://', 'https://')):
        raise ValueError('origin must be an http(s) URL')
    return origin.rstrip('/') + page_path(locale, route)


def source_revision(root='.'):
    """Record the source revision actually tested and whether it was dirty."""
    def git(*args):
        result = subprocess.run(
            ('git', *args), cwd=root, capture_output=True, text=True, check=True)
        return result.stdout.strip()

    return {
        'testedSourceRevision': git('rev-parse', 'HEAD'),
        'worktreeDirty': bool(git('status', '--porcelain', '--untracked-files=no')),
    }


def evidence_root(root):
    """Resolve the gitignored evidence directory, refusing a symlink escape."""
    root_path = Path(root).resolve()
    target = (root_path/'test-results').resolve()
    if root_path not in target.parents:
        raise RuntimeError('evidence directory escapes the repository')
    return target
