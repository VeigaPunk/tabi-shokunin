#!/usr/bin/env python3
"""TABI lane B6-1 fixture server v2 — loopback only, lane-authored bytes.

Routes: static files under <site-dir>; instrument endpoints below. Every
instrument response carries Cache-Control: no-store. /__ready is a quiet
readiness probe (204, never logged).

Usage: server.py <site-dir> <port> [hop-url]
  hop-url: absolute URL the origin-changing hop 307s to; absent -> same-origin
  /chain/landed.html.
"""
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = sys.argv[1]
PORT = int(sys.argv[2])
HOP = sys.argv[3] if len(sys.argv) > 3 else None


class Handler(SimpleHTTPRequestHandler):
    server_version = "tabi-fixture-v2/0.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        if getattr(self, "_quiet", False):
            return
        sys.stderr.write("%s - - [%s] %s\n" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def _send(self, code, body="", ctype="text/plain; charset=utf-8", headers=()):
        b = body.encode("utf-8")
        self.send_response(code)
        for k, v in headers:
            self.send_header(k, v)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _redirect(self, code, location):
        self.send_response(code)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/__ready":
            self._quiet = True
            self.send_response(204)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if path == "/chain/start":
            return self._redirect(302, "/chain/hop1")
        if path == "/chain/hop1":
            return self._redirect(303, "/deep/path/hop2")
        if path == "/deep/path/hop2":
            return self._redirect(307, HOP or "/chain/landed.html")
        if path == "/rate/429":
            return self._send(429, "rate-shaped 429 instrument (lane-authored). Retry-After is a shape, not a schedule.\n", headers=(("Retry-After", "7"),))
        if path == "/rate/403":
            return self._send(403, "toS-shaped 403 instrument (lane-authored).\n")
        if path == "/gate/interstitial":
            with open(os.path.join(ROOT, "gate", "interstitial.html"), "rb") as f:
                return self._send(200, f.read().decode("utf-8"), ctype="text/html; charset=utf-8")
        if path == "/m/307":
            return self._redirect(307, "/m/echo")
        if path == "/m/echo":
            return self._send(200, json.dumps({"method": self.command, "path": path}) + "\n")
        return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else b""
        path = self.path.split("?", 1)[0]
        if path == "/m/307":
            return self._redirect(307, "/m/echo")
        if path == "/m/echo":
            return self._send(200, json.dumps({"method": self.command, "bodyBytes": len(body)}) + "\n")
        return self._send(405, "instrument endpoints only\n")


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()