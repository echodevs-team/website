"""Read-only ZIP safety/CRC/hash/consistency check. Never extracts archive members."""
from hashlib import sha256
from pathlib import Path, PurePosixPath
import stat
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "design/reference/original"
EXPECTED = {
    "cvecho.zip": "658daaf9def5badf3b9c061f8e669d0980b91cae6fe76975324def7f01bd050b",
    "code.html": "442209f1ddad359afd32ec57ef89d280fcd60a88b06b76b22adb854f4b1a8a36",
    "screen.png": "ad99ac9ebce18e484454baa17de048f9f51753e0d77055936126185800889731",
    "DESIGN.md": "0947699de006092828e36745efd0478652e7f6568694a524fd22f030b8431fee",
}


def main():
    for name, digest in EXPECTED.items():
        assert sha256((BASE / name).read_bytes()).hexdigest() == digest, name
        print(f"PASS SHA-256 {name}: {digest}")
    with zipfile.ZipFile(BASE / "cvecho.zip") as archive:
        members = archive.infolist()
        assert len(members) == 3
        assert {entry.filename for entry in members} == set(EXPECTED) - {"cvecho.zip"}
        assert sum(entry.file_size for entry in members) < 10_000_000
        for entry in members:
            path = PurePosixPath(entry.filename)
            assert not path.is_absolute() and ".." not in path.parts
            assert not stat.S_ISLNK(entry.external_attr >> 16)
            data = archive.read(entry)
            assert data == (BASE / entry.filename).read_bytes(), entry.filename
            print(f"PASS member {entry.filename}: {entry.file_size} bytes; compressed {entry.compress_size}")
        assert archive.testzip() is None
    assert (BASE / "code.html").read_bytes() == (ROOT / "code.html").read_bytes()
    assert (BASE / "code.html").read_bytes() == (ROOT / "design/reference/code.html").read_bytes()
    assert (BASE / "DESIGN.md").read_bytes() == (ROOT / "design/reference/DESIGN.sahara.md").read_bytes()
    png = (BASE / "screen.png").read_bytes()
    assert png[:8] == b"\x89PNG\r\n\x1a\n"
    print("PNG dimensions:", struct.unpack(">II", png[16:24]))
    print("PASS original member CRCs, safety checks, extracted copies and preserved prototype consistency")


if __name__ == "__main__":
    main()
