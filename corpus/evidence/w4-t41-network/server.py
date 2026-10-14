#!/usr/bin/env python3
"""TABI lane T4-1 fixture server — loopback only.

Routes: static site files; /go -> 302 to /async.html; /slow.json sleeps SLOW_MS
before the stock static handler answers. Stock SimpleHTTPRequestHandler carries
the Last-Modified / If-Modified-Since 304 path used by the warm passes.
Usage: server.py <site-dir> <port> [slow-ms] [no-cache]
"""
import sys
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = sys.argv[1]
PORT = int(sys.argv[2])
SLOW_MS = int(sys.argv[3]) if len(sys.argv) > 3 else 400
NO_CACHE = len(sys.argv) > 4 and sys.argv[4] == "no-cache"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        if NO_CACHE:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/go":
            self.send_response(302)
            self.send_header("Location", "/async.html")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if path == "/slow.json":
            time.sleep(SLOW_MS / 1000.0)
        return super().do_GET()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - - [%s] %s\n" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def copyfile(self, source, outputfile):
        try:
            return super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            sys.stderr.write("== ABORTED body write (client closed): %s\n" % self.path)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()