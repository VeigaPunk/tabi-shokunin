#!/usr/bin/env python3
"""SentinelFetchScope experiments: probe the frozen frontier-admission counter's
--live fetch surface with fixture git repos (loopback only; no external network)."""
import http.server, json, os, shutil, socket, ssl, subprocess, sys, threading, hashlib, datetime

S = os.path.dirname(os.path.abspath(__file__))
CLONE = os.path.join(S, "clone")
COUNTER = os.path.join(CLONE, "scripts", "check-frontier-admission.mjs")
FXROOT = os.path.join(S, "fx")
PKI = os.path.join(S, "pki")
OUT = os.path.join(S, "out")
BODY = "Loopback served document. The budget is disclosed per route in response headers. Extra sentence for word count."


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


HITS = []
CREDS_SEEN = []


def make_plain(port, body):
    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            HITS.append({"port": port, "path": self.path, "scheme": "http",
                         "authorization": self.headers.get("Authorization"),
                         "cookie": self.headers.get("Cookie"),
                         "time": datetime.datetime.now(datetime.timezone.utc).isoformat()})
            if self.path.startswith("/doc.txt"):
                b = body.encode()
                self.send_response(200); self.send_header("Content-Type", "text/plain")
                self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
            else:
                self.send_response(404); self.end_headers()
        def log_message(self, *a): pass
    srv = http.server.HTTPServer(("127.0.0.1", port), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def make_tls(port, redirect_port, body):
    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            HITS.append({"port": port, "path": self.path, "scheme": "https",
                         "authorization": self.headers.get("Authorization"),
                         "cookie": self.headers.get("Cookie"),
                         "time": datetime.datetime.now(datetime.timezone.utc).isoformat()})
            if self.path.startswith("/start"):
                self.send_response(302)
                self.send_header("Location", "http://127.0.0.1:%d/doc.txt" % redirect_port)
                self.end_headers()
            elif self.path.startswith("/body"):
                b = body.encode()
                self.send_response(200); self.send_header("Content-Type", "text/plain")
                self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
            else:
                self.send_response(404); self.end_headers()
        def log_message(self, *a): pass
    srv = http.server.HTTPServer(("127.0.0.1", port), H)
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ctx.load_cert_chain(os.path.join(PKI, "cert.pem"), os.path.join(PKI, "key.pem"))
    srv.socket = ctx.wrap_socket(srv.socket, server_side=True)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def git(repo, *args, check=True):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        raise SystemExit("git %s failed: %s%s" % (args, r.stdout, r.stderr))
    return r


def build_fixture(name, url, committed_text, quote, fetched_by="W1-fetch", refetch_seat="W2-refetch"):
    root = os.path.join(FXROOT, name)
    shutil.rmtree(root, ignore_errors=True)
    os.makedirs(os.path.join(root, "corpus", "knowledge"))
    os.makedirs(os.path.join(root, "corpus", "evidence", "round-30", "frontier", "bytes"))
    os.makedirs(os.path.join(root, "corpus", "evidence", "round-30", "frontier", "refetch"))
    os.makedirs(os.path.join(root, "corpus", "lessons"))

    def put(rel, text):
        p = os.path.join(root, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w") as f: f.write(text)

    put("corpus/SOURCES.md",
        "# SOURCES\n\n## Registry\n\n"
        "| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n"
        "|---|---|---|---|---|---|---|---|---|---|---|\n"
        "| S116 | Fixture document — %s | spec | A | scope | §1 | teaches | mined | 2026-10-26 | 180d | corpus/knowledge/fx-entry.md |\n" % url)
    put("corpus/knowledge/fx-entry.md",
        "# Fixture entry\n\n"
        "source: S116 — %s — §1 — fetched 2026-10-26\n"
        "verified-at: 2026-10-26 — round 30\n"
        "recheck: 180d — fixture\n"
        "frontier: rate-tos-signal\n"
        "ground: fixture\n\n"
        "The document says \"%s\" in one place.\n" % (url, quote))
    bpath = "corpus/evidence/round-30/frontier/bytes/S116.txt"
    put(bpath, committed_text)
    rpath = "corpus/evidence/round-30/frontier/refetch/bytes/S116-refetch.txt"
    put(rpath, committed_text)
    sha = hashlib.sha256(committed_text.encode()).hexdigest()
    put("corpus/evidence/round-30/frontier/S116.json", json.dumps({
        "id": "S116", "url": url, "fetched_at": "2026-10-26T00:00:00Z",
        "fetched_by": fetched_by, "http_status": 200, "bytes_path": bpath,
        "sha256": sha, "quote": quote}, indent=2) + "\n")
    put("corpus/evidence/round-30/frontier/refetch/S116.json", json.dumps({
        "id": "S116", "url": url, "fetched_at": "2026-10-26T00:00:00Z",
        "seat": refetch_seat, "http_status": 200, "bytes_path": rpath,
        "sha256": sha, "quote": quote}, indent=2) + "\n")
    put("corpus/lessons/round-30.md",
        "# Round 30\n\n## Gate\n\n- S116: %s, 2026-10-26, \"%s\"\n" % (url, quote))
    git(root, "init", "-q")
    git(root, "-c", "user.name=sentinel", "-c", "user.email=sentinel@scratch.local", "add", "-A")
    git(root, "-c", "user.name=sentinel", "-c", "user.email=sentinel@scratch.local",
        "commit", "-q", "-m", "fixture")
    top = git(root, "rev-parse", "--show-toplevel").stdout.strip()
    assert os.path.realpath(top) == os.path.realpath(root), top
    return root


def run(repo, live, env_extra=None, tag=""):
    env = dict(os.environ)
    env["TMPDIR"] = os.path.join(S, "tmp")
    if env_extra: env.update(env_extra)
    cmd = ["node", COUNTER, "--repo", repo, "--rev", "HEAD", "--frontier", "rate-tos-signal",
           "--since", "2026-10-26", "--json"] + (["--live"] if live else [])
    r = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=180)
    rec = {"tag": tag, "cmd": " ".join(cmd), "exit": r.returncode,
           "env": {k: v for k, v in (env_extra or {}).items()}}
    try:
        out = json.loads(r.stdout)
        rec.update({"population": out["population"], "admitted": out["admitted"],
                    "clean": out["clean"],
                    "reasons": [e["reasons"] for e in out["entries"]]})
    except Exception:
        rec.update({"stdout": r.stdout[-800:], "stderr": r.stderr[-800:]})
    print(json.dumps(rec, indent=1))
    return rec


def main():
    for d in (FXROOT, OUT):
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    os.makedirs(os.path.join(S, "tmp"), exist_ok=True)
    os.makedirs(PKI, exist_ok=True)
    subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes",
                    "-keyout", os.path.join(PKI, "key.pem"), "-out", os.path.join(PKI, "cert.pem"),
                    "-days", "1", "-subj", "/CN=127.0.0.1",
                    "-addext", "subjectAltName=IP:127.0.0.1"],
                   check=True, capture_output=True)
    fakehome = os.path.join(S, "fakehome"); os.makedirs(fakehome, exist_ok=True)
    with open(os.path.join(fakehome, ".curlrc"), "w") as f:
        f.write("insecure\n")

    pl = free_port(); tl = free_port()
    make_plain(pl, BODY); make_tls(tl, pl, BODY)
    results = {}

    # A1/A2: file:// receipts
    hn = open("/etc/hostname").read().strip()
    mid = open("/etc/machine-id").read().strip()
    fx = build_fixture("file-exact", "file:///etc/hostname", open("/etc/hostname").read(), hn)
    results["A1_file_url_exact_committed"] = run(fx, True, tag="A1")
    fx = build_fixture("file-mismatch", "file:///etc/machine-id", mid + "\ntrailing bytes differ from live,\n", mid)
    results["A2_file_url_live_differs"] = run(fx, True, tag="A2")

    # B: userinfo credential in the receipt URL (loopback TLS, self-signed)
    ca = os.path.join(PKI, "cert.pem")
    u = "https://seat:notarealsecret@127.0.0.1:%d/body" % tl
    fx = build_fixture("userinfo", u, BODY, "The budget is disclosed per route in response headers")
    results["B_userinfo_credential"] = run(fx, True, {"CURL_CA_BUNDLE": ca}, tag="B")

    # C: redirect off the origin + https->http downgrade, accepted as the live source
    u = "https://127.0.0.1:%d/start" % tl
    fx = build_fixture("redirect", u, BODY, "The budget is disclosed per route in response headers")
    results["C_redirect_downgrade"] = run(fx, True, {"CURL_CA_BUNDLE": ca}, tag="C")
    results["D_redirect_no_ambient_ca"] = run(fx, True, tag="D")
    results["E_redirect_ambient_curlrc"] = run(fx, True, {"HOME": fakehome}, tag="E")

    # G: bytes_path traversal refusal (git blob path with ..)
    fx = build_fixture("traversal", "file:///etc/hostname", open("/etc/hostname").read(), hn)
    rc = git(fx, "show", "HEAD:corpus/../corpus/knowledge/fx-entry.md", check=False)
    results["G_git_show_dotdot"] = {"exit": rc.returncode, "stderr": rc.stderr.strip()[:300]}
    print(json.dumps(results["G_git_show_dotdot"], indent=1))

    with open(os.path.join(OUT, "experiments.json"), "w") as f:
        json.dump(results, f, indent=2)
    with open(os.path.join(OUT, "server-hits.json"), "w") as f:
        json.dump(HITS, f, indent=2)
    print("hits:")
    for h in HITS:
        print(json.dumps(h))


if __name__ == "__main__":
    main()
