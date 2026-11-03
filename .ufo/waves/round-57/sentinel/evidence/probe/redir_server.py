#!/usr/bin/env python3
"""Sentinel probe: does `curl -sL` follow a redirect onto a REFUSED host?

Serves:
  /r-to-loopback  -> 302 Location: http://127.0.0.1:<port>/landed
  /r-to-metadata  -> 302 Location: http://169.254.169.254/latest/meta-data/
  /r-to-file      -> 302 Location: file:///etc/hostname
  /landed         -> 200 body with a marker
  /gzip-bomb      -> 200 with Content-Encoding: gzip, compressed size tiny
"""
import gzip
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1])
MODE = sys.argv[2] if len(sys.argv) > 2 else "loopback"


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        sys.stderr.write("REQ %s %s\n" % (self.command, self.path))

    def do_GET(self):
        if self.path.startswith("/r-to-loopback"):
            self.send_response(302)
            self.send_header("Location", "http://127.0.0.1:%d/landed" % PORT)
            self.end_headers()
            return
        if self.path.startswith("/r-to-metadata"):
            self.send_response(302)
            self.send_header("Location", "http://169.254.169.254/latest/meta-data/")
            self.end_headers()
            return
        if self.path.startswith("/r-to-file"):
            self.send_response(302)
            self.send_header("Location", "file:///etc/hostname")
            self.end_headers()
            return
        if self.path.startswith("/gzip-bomb"):
            # 20 MB of zeros compresses to ~20 KB
            raw = gzip.compress(b"0" * (20 * 1024 * 1024))
            self.send_response(200)
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
            return
        body = b"LANDED-MARKER-127.0.0.1\n"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
    srv.serve_forever()
