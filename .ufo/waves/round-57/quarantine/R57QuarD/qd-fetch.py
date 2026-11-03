#!/usr/bin/env python3
"""Guarded fetcher: http(s) only, refuses loopback/private/link-local/metadata hosts.
Usage: fetch.py <outdir> <id> <url>   -> writes <id>.bin, <id>.meta.json on stdout"""
import sys, json, socket, ipaddress, subprocess, os, urllib.parse

BLOCKED = [ipaddress.ip_network(n) for n in (
    "127.0.0.0/8","10.0.0.0/8","172.16.0.0/12","192.168.0.0/16",
    "169.254.0.0/16","::1/128","fc00::/7","fe80::/10","0.0.0.0/8","100.64.0.0/10")]

def guard(url):
    p = urllib.parse.urlsplit(url)
    if p.scheme not in ("http","https"):
        return False, f"scheme {p.scheme} not http(s)"
    host = p.hostname
    if not host:
        return False, "no host"
    try:
        infos = socket.getaddrinfo(host, p.port or (443 if p.scheme=="https" else 80), proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        return None, f"dns-fail {e}"
    addrs = sorted({i[4][0] for i in infos})
    for a in addrs:
        try:
            ip = ipaddress.ip_address(a.split('%')[0])
        except ValueError:
            return False, f"unparseable addr {a}"
        for n in BLOCKED:
            if ip in n:
                return False, f"address {a} in blocked range {n}"
    return True, addrs

def main():
    outdir, sid, url = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(outdir, exist_ok=True)
    ok, info = guard(url)
    out = os.path.join(outdir, sid + ".bin")
    meta = {"id": sid, "url": url}
    if ok is None:
        meta.update({"guard":"dns-unresolved","detail":info,"verdict_guard":"fetch-failed","httpCode":None,"bytes":0})
        print(json.dumps(meta)); return
    if not ok:
        meta.update({"guard":"refused","detail":info,"httpCode":None,"bytes":0})
        print(json.dumps(meta)); return
    meta["resolved"] = info
    r = subprocess.run(["curl","-sL","--max-time","90","--max-filesize","25000000",
                        "--no-progress-meter","-o",out,
                        "-w","%{http_code} %{size_download} %{content_type} %{url_effective}",
                        url], capture_output=True, text=True)
    parts = (r.stdout or "").strip().split(" ", 3)
    meta["curl_rc"] = r.returncode
    meta["curl_err"] = r.stderr.strip()[:400]
    if len(parts) >= 3:
        meta["httpCode"] = int(parts[0]) if parts[0].isdigit() else 0
        meta["bytes"] = int(parts[1]) if parts[1].isdigit() else 0
        meta["contentType"] = parts[2]
        meta["urlEffective"] = parts[3] if len(parts) > 3 else ""
    else:
        meta["httpCode"] = 0; meta["bytes"] = 0; meta["contentType"] = ""
    meta["bytesOnDisk"] = os.path.getsize(out) if os.path.exists(out) else 0
    hdr = subprocess.run(["curl","-sSL","--max-time","90","--no-progress-meter","-o","/dev/null",
                          "-D","-",url], capture_output=True, text=True).stdout
    ct = [l for l in hdr.splitlines() if l.lower().startswith("content-type:")]
    meta["contentTypeHeader"] = ct[-1].split(":",1)[1].strip() if ct else None
    if os.path.exists(out):
        import hashlib
        meta["sha256"] = hashlib.sha256(open(out,"rb").read()).hexdigest()
    json.dump(meta, open(os.path.join(outdir, sid + ".meta.json"), "w"), ensure_ascii=False, indent=1)
    print(json.dumps(meta))

main()
