"""Read-only P0 checks; PASS reproduces defects, not website readiness. No network."""

from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "design/reference"


class Inventory(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = Counter()
        self.ids = []
        self.links = Counter()
        self.labels = []
        self.fields = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags[tag] += 1
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "a":
            self.links[attrs.get("href", "")] += 1
        if tag == "label":
            self.labels.append(attrs)
        if tag in ("input", "select", "textarea"):
            self.fields.append(attrs)


def luminance(color):
    channels = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
              for c in channels]
    return sum(c * w for c, w in zip(linear, (0.2126, 0.7152, 0.0722)))


def contrast(first, second):
    low, high = sorted((luminance(first), luminance(second)))
    return (high + 0.05) / (low + 0.05)


def main():
    for line in (REFERENCE / "SHA256SUMS").read_text().splitlines():
        digest, name = line.split(maxsplit=1)
        contents = (REFERENCE / name).read_bytes()
        assert sha256(contents).hexdigest() == digest, name
        print(f"PASS reference {name}: {len(contents)} bytes, SHA-256 {digest}")
    assert (ROOT / "code.html").read_bytes() == (REFERENCE / "code.html").read_bytes()
    print("PASS root prototype unchanged")

    source = (REFERENCE / "code.html").read_text()
    inventory = Inventory()
    inventory.feed(source)
    assert inventory.tags["section"] == 6
    assert inventory.tags["a"] == 35
    assert len(inventory.ids) == len(set(inventory.ids)) == 15
    missing = [href for href in inventory.links
               if href.startswith("#") and href[1:] not in inventory.ids]
    assert not missing, missing
    assert len(inventory.labels) == len(inventory.fields) == 5
    assert all("for" not in label for label in inventory.labels)
    assert all("id" not in field and "name" not in field for field in inventory.fields)
    assert inventory.tags["img"] == inventory.tags["title"] == 0
    assert "event.preventDefault(); document.getElementById('inquiry-success')" in source
    assert "prefers-reduced-motion" in source and "visibilitychange" not in source
    print("PASS source inventory: 6 sections, 35 anchors, 15 unique IDs, no missing fragments")
    print("CONFIRMED defects: 5 unassociated fields, no title/images, false success, incomplete motion handling")
    print("Anchor destinations:", dict(inventory.links))

    pairs = [
        ("#FFFFFF", "#EE7758", False),
        ("#201B14", "#EE7758", True),
        ("#FFFFFF", "#B84228", True),
        ("#B84228", "#FFF8F4", True),
        ("#201B14", "#FFF8F4", True),
        ("#554339", "#FFF8F4", True),
        ("#F38361", "#181412", True),
        ("#FAF5EE", "#181412", True),
        ("#C9BDB5", "#181412", True),
    ]
    for first, second, passes in pairs:
        ratio = contrast(first, second)
        assert (ratio >= 4.5) == passes
        print(f"Contrast {first}/{second}: {ratio:.2f}:1, normal-text AA {'PASS' if passes else 'FAIL (baseline defect)'}")
    print("PASS P0 evidence checks only; browser/DB/build/CI NOT RUN")


if __name__ == "__main__":
    main()
