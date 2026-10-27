"""Serve an instrumented copy of the exact published page, without TV credentials."""
from pathlib import Path
from zipfile import ZipFile
import hashlib
import json
import shutil
import argparse

repo = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument("--candidate", action="store_true", help="Use the current built dist/ instead of the broken published ZIP")
args = parser.parse_args()
archive = repo / "release/web-remote-0.2.5.zip"
assert hashlib.sha256(archive.read_bytes()).hexdigest() == "360c3977ca7a4911570723a1642c665bb740babfc877f8f2103e7e973d88db7e"
out = Path("/tmp/fmtv-pwa-haptic-check")
if out.exists():
    shutil.rmtree(out)
out.mkdir()
if args.candidate:
    shutil.copytree(repo / "dist", out, dirs_exist_ok=True)
else:
    with ZipFile(archive) as bundle:
        for name in bundle.namelist():
            if not name.startswith("page/") or name.endswith("/"):
                continue
            relative = Path(name.removeprefix("page/"))
            assert not relative.is_absolute() and ".." not in relative.parts
            target = out / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(bundle.read(name))
html = (out / "index.html").read_text()
html = html.replace("FMTV Controller", "Teste Tátil")
# This credential is accepted only by the development fake bridge, on the Mac's origin.
html = html.replace("<head>", '<head><script>localStorage.setItem("fmtv-controller.credential","local-haptic-diagnostic");</script>')
if args.candidate:
    html = html.replace("<head>", '<head><script>window.__FMTV_TEST_VARIANT__="Candidate switch=true fix, full App, simulated bridge";</script>')
html = html.replace("</body>", '<script src="/haptic-diagnostic.js"></script></body>')
(out / "index.html").write_text(html)
manifest = json.loads((out / "manifest.webmanifest").read_text())
manifest.update(name="Teste Tátil", short_name="Teste Tátil")
(out / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False))
shutil.copyfile(Path(__file__).with_name("pwa-diagnostic.js"), out / "haptic-diagnostic.js")
print(f"{'Candidate build' if args.candidate else 'Published JS and CSS'} in {out}; test PWA and diagnostic added.")
