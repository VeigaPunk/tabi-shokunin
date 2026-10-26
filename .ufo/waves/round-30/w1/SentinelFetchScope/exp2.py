#!/usr/bin/env python3
"""Second probe: curl-level behaviour of the exact argv the counter uses."""
import http.server, json, os, shutil, socket, ssl, subprocess, threading, datetime

S = os.path.dirname(os.path.abspath(__file__))
PKI = os.path.join(S, "pki")
OUT = os.path.join(S, "out")
BODY = "Loopback served document. The budget is disclosed per route in response headers."
HITS = []


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def serve(port, tls):
    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            HITS.append({"port": port, "path": self.path, "authorization": self.headers.get("Authorization"),
                         "user_agent": self.headers.get("User-Agent")})
            if self.path == "/redir-file":
                self.send_response(302); self.send_header("Location", "file:///etc/hostname"); self.end_headers()
            elif self.path == "/redir-ftp":
                self.send_response(302); self.send_header("Location", "ftp://127.0.0.1:1/x"); self.end_headers()
            elif self.path == "/redir-cross":
                self.send_response(302); self.send_header("Location", "http://127.0.0.1:%d/doc" % port2); self.end_headers()
            elif self.path == "/redir-loop":
                self.send_response(302); self.send_header("Location", "/doc"); self.end_headers()
            elif self.path == "/doc":
                b = BODY.encode()
                self.send_response(200); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
            else:
                self.send_response(404); self.end_headers()
        def log_message(self, *a): pass
    srv = http.server.HTTPServer(("127.0.0.1", port), H)
    if tls:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ctx.load_cert_chain(os.path.join(PKI, "cert.pem"), os.path.join(PKI, "key.pem"))
        srv.socket = ctx.wrap_socket(srv.socket, server_side=True)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


p1 = free_port(); port2 = free_port()
serve(p1, True); serve(port2, False)
ca = os.path.join(PKI, "cert.pem")
fake = os.path.join(S, "fakehome2"); shutil.rmtree(fake, ignore_errors=True); os.makedirs(fake)
open(os.path.join(fake, ".netrc"), "w").write("machine 127.0.0.1 login netrcuser password netrcpass\n")
open(os.path.join(fake, ".curlrc"), "w").write("insecure\nnetrc\n")
os.chmod(os.path.join(fake, ".netrc"), 0o600)

# the exact argv shape used by fetchLive()
def fetch(url, env_extra):
    env = dict(os.environ); env.update(env_extra)
    r = subprocess.run(["curl", "-sS", "-L", "--max-time", "60", "-o", "-", "-w", "\n%{http_code}", url],
                       capture_output=True, env=env)
    return {"url": url, "exit": r.returncode, "stdout_tail": r.stdout[-60:].decode("utf8", "replace"),
            "stderr": r.stderr.decode("utf8", "replace").strip()[:300],
            "env": list(env_extra)}

res = {}
res["file_scheme_direct"] = fetch("file:///etc/hostname", {})
res["redirect_to_file"] = fetch("https://127.0.0.1:%d/redir-file" % p1, {"CURL_CA_BUNDLE": ca})
res["redirect_to_ftp"] = fetch("https://127.0.0.1:%d/redir-ftp" % p1, {"CURL_CA_BUNDLE": ca})
res["redirect_cross_origin"] = fetch("https://127.0.0.1:%d/redir-cross" % p1, {"CURL_CA_BUNDLE": ca})
res["netrc_injection"] = fetch("https://127.0.0.1:%d/doc" % p1, {"HOME": fake})
res["no_ambient_config"] = fetch("https://127.0.0.1:%d/doc" % p1, {"HOME": os.path.join(S, "fakehome-empty")})
os.makedirs(os.path.join(S, "fakehome-empty"), exist_ok=True)
res["no_ambient_config"] = fetch("https://127.0.0.1:%d/doc" % p1, {"HOME": os.path.join(S, "fakehome-empty")})
print(json.dumps(res, indent=2))
print("HITS", json.dumps(HITS, indent=1))
json.dump({"curl": res, "hits": HITS, "at": datetime.datetime.now(datetime.timezone.utc).isoformat()},
          open(os.path.join(OUT, "curl-probe.json"), "w"), indent=2)
