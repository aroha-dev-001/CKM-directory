#!/usr/bin/env python3
"""Dedicated admin studio (HUD). Not the public companion site."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = int(os.environ.get("STUDIO_PORT", "43192"))
WALK = Path(ROOT) / "dist" / "bean-to-cup.walk.json"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path in ("/", "/studio", "/studio/", "/studio/bean-to-cup"):
            self.send_response(302)
            self.send_header("Location", "/studio/bean-to-cup/")
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        if self.path != "/studio/publish":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except Exception:
            self.send_error(400, "invalid json")
            return
        if not isinstance(data, dict) or "world" not in data or "camera" not in data:
            self.send_error(400, "not a walk config")
            return
        WALK.write_text(json.dumps(data, indent=2) + "\n")
        body = b'{"ok":true}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("Walk studio  http://127.0.0.1:%s/studio/bean-to-cup/" % PORT)
    httpd.serve_forever()
