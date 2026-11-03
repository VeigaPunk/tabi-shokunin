#!/usr/bin/env python3
"""Sentinel probe 2: chunked (no Content-Length) body LARGER than --max-filesize,
plus a gzip body with NO Content-Length."""
import gzip
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1])


class H(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        sys.stderr.write("REQ %s %s\n" % (self.command, self.path))

    def do_GET(self):
        if self.path.startswith("/chunk-big"):
            # 60 MB of 'A' in chunks, NO Content-Length -> --max-filesize cannot pre-check
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Transfer-Encoding", "chunked")
            self.end_headers()
            chunk = b"A" * 65536
            try:
                for _ in range(960):  # 60 MB
                    self.wfile.write(b"%x\r\n" % len(chunk) + chunk + b"\r\n")
                self.wfile.write(b"0\r\n\r\n")
            except Exception as e:
                sys.stderr.write("write stopped: %s\n" % e)
            return
        if self.path.startswith("/gzip-nolen"):
            raw = gzip.compress(b"0" * (30 * 1024 * 1024))  # 30 MB expanded, ~30 KB compressed
            self.send_response(200)
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Transfer-Encoding", "chunked")
            self.end_headers()
            try:
                for i in range(0, len(raw), 16384):
                    piece = raw[i:i + 16384]
                    self.wfile.write(b"%x\r\n" % len(piece) + piece + b"\r\n")
                self.wfile.write(b"0\r\n\r\n")
            except Exception as e:
                sys.stderr.write("write stopped: %s\n" % e)
            return
        body = b"OK\n"
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
