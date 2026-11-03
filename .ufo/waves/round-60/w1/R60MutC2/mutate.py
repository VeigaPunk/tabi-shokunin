#!/usr/bin/env python3
"""R60MutC2 mutation harness: exact-string-replacement mutants of the r60
chromium receipt counter, each run through selftest + frozen probe set F + the
live receipt, with the pristine counter as control.

Mutant copies live in scratch; the fixtures directory the counter resolves from
dirname(SELF) is symlinked to the lane's frozen fixtures dir so the counter
bytes stay exact.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

ROOT = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
S = "/fast/scratch/hyaku/tabi-r60/R60MutC2"
SRC = os.path.join(ROOT, ".ufo/waves/round-60/counters/chromium-receipt-r60.mjs")
SPEC = os.path.join(S, "spec.json")

DRIVER = "scripts/chrome-cdp-loopback-round59.mjs"
DRIVER_SHA = "b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86"
SHOT = "corpus/evidence/round59/chromium-capslock-boundary"
LIVE = os.path.join(ROOT, "corpus/evidence/round59/chromium-capslock-boundary/receipt.json")
PROBES = [
    ("A", os.path.join(ROOT, ".ufo/waves/round-59/measure/f6-probe/A-cancelable-false.receipt.json")),
    ("B", os.path.join(ROOT, ".ufo/waves/round-59/measure/f6-probe/B-cancelable-missing.receipt.json")),
    ("D", os.path.join(ROOT, ".ufo/waves/round-60/measure/f-probes/probe-D.receipt.json")),
    ("E", os.path.join(ROOT, ".ufo/waves/round-60/measure/f-probes/probe-E.receipt.json")),
]


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_json_prefix(text):
    """The counter prints its JSON then a trailing '<n>/<m>' summary line."""
    try:
        return json.JSONDecoder().raw_decode(text.lstrip())[0]
    except Exception:
        return None


def run(counter, args):
    env = dict(os.environ)
    env["TMPDIR"] = S
    p = subprocess.run(["node", counter] + args, cwd=ROOT, capture_output=True, text=True, env=env, timeout=900)
    findings = None
    full = p.stdout
    j = parse_json_prefix(full)
    if isinstance(j, dict):
        findings = j.get("findings")
    return {
        "argv": ["node", os.path.relpath(counter, S)] + [os.path.relpath(a, ROOT) if a.startswith(ROOT + "/") else a for a in args],
        "exit": p.returncode,
        "stdoutTail": full.strip()[-1200:],
        "stderrTail": p.stderr.strip()[-1200:],
        "findings": findings,
        "findingCount": (len(findings) if isinstance(findings, list) else None),
        "_full": full,
    }


def probe_args(receipt):
    return [receipt, "--driver", DRIVER, "--expect-driver-sha256", DRIVER_SHA,
            "--shot", SHOT, "--json"]


def selftest(counter):
    r = run(counter, ["--selftest"])
    full = r.pop("_full", "")
    j = parse_json_prefix(full)
    all_pass = isinstance(j, dict) and j.get("allPass") is True
    results = j.get("results") if isinstance(j, dict) else None
    cases = None
    if isinstance(j, dict):
        cases = {
            "count": j.get("cases"),
            "pass": j.get("pass"),
            "failing": j.get("failing"),
            "idCoverage": j.get("idCoverage"),
            "failedDetail": ([{"name": c.get("name"), "file": c.get("file"), "got": c.get("got"), "want": c.get("want")}
                              for c in results if not c.get("ok")] if isinstance(results, list) else None),
        }
    r["allPass"] = all_pass
    r["cases"] = cases
    r["summaryLine"] = full.strip().splitlines()[-1] if full.strip() else ""
    return r


def measure(counter):
    out = {"selftest": selftest(counter), "probes": {}, "live": None}
    for name, path in PROBES:
        out["probes"][name] = run(counter, probe_args(path))
        out["probes"][name].pop("_full", None)
    out["live"] = run(counter, probe_args(LIVE))
    out["live"].pop("_full", None)
    return out


def verdict(m):
    reasons = []
    if not m["selftest"]["allPass"]:
        reasons.append("selftest not allPass (exit %s)" % m["selftest"]["exit"])
    for name in ("A", "B", "D", "E"):
        if m["probes"][name]["exit"] == 0:
            reasons.append("probe %s exit 0 (green)" % name)
    if m["live"]["exit"] != 0:
        reasons.append("live receipt exit %s (red)" % m["live"]["exit"])
    return ("KILLED" if reasons else "SURVIVED"), reasons


def prepare_copy(dest_dir, bytes_out):
    os.makedirs(dest_dir, exist_ok=True)
    target = os.path.join(dest_dir, os.path.basename(SRC))
    with open(target, "wb") as f:
        f.write(bytes_out)
    # the counter resolves FIXTURES_DIR from dirname(SELF); link it to the frozen dir
    fixtures_name = None
    for line in bytes_out.decode("utf-8").splitlines():
        if line.startswith("const FIXTURES_DIR = path.join(path.dirname(SELF), "):
            fixtures_name = line.split("'")[1]
            break
    if fixtures_name is None:
        raise SystemExit("cannot locate FIXTURES_DIR declaration")
    lane_fixtures = os.path.join(ROOT, ".ufo/waves/round-60/counters", fixtures_name)
    link = os.path.join(dest_dir, fixtures_name)
    if os.path.islink(link) or os.path.exists(link):
        os.remove(link)
    os.symlink(lane_fixtures, link)
    return target, fixtures_name, lane_fixtures


def main():
    spec = json.load(open(SPEC))
    src_bytes = open(SRC, "rb").read()
    src_sha = hashlib.sha256(src_bytes).hexdigest()
    report = {
        "seat": "R60MutC2",
        "claim": "C2",
        "sourceCounter": os.path.relpath(SRC, ROOT),
        "sourceSha256": src_sha,
        "driver": DRIVER,
        "driverSha256": DRIVER_SHA,
        "probeSet": [{"id": n, "path": os.path.relpath(p, ROOT), "sha256": sha256(p)} for n, p in PROBES],
        "liveReceipt": {"path": os.path.relpath(LIVE, ROOT), "sha256": sha256(LIVE)},
        "harness": {"path": os.path.relpath(os.path.abspath(__file__), S), "sha256": sha256(os.path.abspath(__file__))},
        "control": None,
        "mutants": {},
    }
    # control: pristine bytes, same harness, same args
    ctrl_dir = os.path.join(S, "control")
    ctrl, fixtures_name, lane_fixtures = prepare_copy(ctrl_dir, src_bytes)
    report["control"] = {
        "path": os.path.relpath(ctrl, S),
        "sha256": sha256(ctrl),
        "fixturesLink": {"name": fixtures_name, "target": lane_fixtures,
                         "targetIsDir": os.path.isdir(lane_fixtures)},
        "result": measure(ctrl),
    }
    # The control's expected shape is the MIRROR of a mutant's: selftest
    # allPass, every probe refused (exit != 0), live green (exit 0).
    cr = report["control"]["result"]
    ctrl_ok = (cr["selftest"]["allPass"]
               and all(cr["probes"][n]["exit"] != 0 for n in ("A", "B", "D", "E"))
               and cr["live"]["exit"] == 0)
    report["control"]["verdict"] = "CONTROL-OK" if ctrl_ok else "CONTROL-BROKEN"
    report["control"]["reasons"] = [
        "selftest allPass=%s (exit %s, %s)" % (cr["selftest"]["allPass"], cr["selftest"]["exit"], cr["selftest"].get("summaryLine")),
        "probes " + ", ".join("%s exit %s" % (n, cr["probes"][n]["exit"]) for n in ("A", "B", "D", "E")),
        "live exit %s" % cr["live"]["exit"],
    ]
    for mut in spec["mutants"]:
        mid = mut["id"]
        data = src_bytes
        applied = []
        for old, new in mut["replacements"]:
            ob, nb = old.encode("utf-8"), new.encode("utf-8")
            count = data.count(ob)
            if count != 1:
                raise SystemExit("mutant %s: replacement target occurs %d times (need exactly 1): %r" % (mid, count, old[:120]))
            data = data.replace(ob, nb)
            applied.append({"old": old, "new": new, "occurrencesReplaced": count})
        mdir = os.path.join(S, "mutants", mid)
        mpath, _, _ = prepare_copy(mdir, data)
        entry = {
            "mutant": mid,
            "description": mut["description"],
            "replacements": applied,
            "mutantSha256": sha256(mpath),
            "mutantPath": os.path.relpath(mpath, S),
            "result": measure(mpath),
        }
        entry["verdict"], entry["reasons"] = verdict(entry["result"])
        report["mutants"][mid] = entry
    out = os.path.join(S, "kills.json")
    with open(out, "w") as f:
        json.dump(report, f, indent=1, sort_keys=False)
        f.write("\n")
    print(json.dumps({
        "control": report["control"]["verdict"],
        "mutants": {k: {"verdict": v["verdict"], "reasons": v["reasons"],
                        "selftest": v["result"]["selftest"]["allPass"],
                        "probes": {n: v["result"]["probes"][n]["exit"] for n in ("A", "B", "D", "E")},
                        "live": v["result"]["live"]["exit"]} for k, v in report["mutants"].items()},
    }, indent=1))


if __name__ == "__main__":
    main()
