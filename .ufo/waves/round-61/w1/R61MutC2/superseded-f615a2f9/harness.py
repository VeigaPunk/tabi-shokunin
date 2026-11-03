#!/usr/bin/env python3
"""R61MutC2 mutation harness: byte-copy the r61 counter, apply one exact
string replacement per mutant, run selftest + the matching f-probe + the
green fixture receipt, and record raw outputs.

Usage: python3 harness.py spec.json outdir
spec: {
  "source": "<abs counter path>",
  "sourceSha256": "<expected sha>",
  "fixturesLink": "<abs fixtures dir>",
  "fixture": {"receipt": "<abs>", "driver": "<abs>", "sha256": "<driver sha>",
              "shot": "<abs dir>"},
  "probes": {"f1": {"receipt": "<abs>", "sha256": "..."}, ...},
  "mutants": [{"id": "C1'", "probe": "f1", "from": "...", "to": "...",
               "mutation": "..."}]
}
"""
import hashlib
import json
import os
import subprocess
import sys
import time


def sha256_bytes(b):
    return hashlib.sha256(b).hexdigest()


def sha256_file(p):
    with open(p, "rb") as fh:
        return sha256_bytes(fh.read())


def run(argv, cwd, timeout=600):
    t0 = time.time()
    try:
        p = subprocess.run(argv, cwd=cwd, capture_output=True, text=True,
                           timeout=timeout)
        return {
            "argv": argv,
            "cwd": cwd,
            "exit": p.returncode,
            "seconds": round(time.time() - t0, 3),
            "stdout": p.stdout,
            "stderr": p.stderr,
        }
    except subprocess.TimeoutExpired as e:
        return {
            "argv": argv,
            "cwd": cwd,
            "exit": None,
            "seconds": round(time.time() - t0, 3),
            "stdout": (e.stdout or b"").decode("utf-8", "replace") if isinstance(e.stdout, bytes) else (e.stdout or ""),
            "stderr": "TIMEOUT after " + str(timeout) + "s",
        }


def parse_stdout(res):
    """Parse a JSON object from stdout (last {...} block) if present."""
    s = res.get("stdout") or ""
    s = s.strip()
    if not s:
        return None
    try:
        return json.loads(s)
    except Exception:
        pass
    i = s.find("{")
    j = s.rfind("}")
    if i >= 0 and j > i:
        try:
            return json.loads(s[i:j + 1])
        except Exception:
            return None
    return None


def summarize(res):
    doc = parse_stdout(res)
    out = {
        "argv": [str(a) for a in res["argv"]],
        "exit": res["exit"],
        "seconds": res["seconds"],
        "stderr_tail": (res.get("stderr") or "")[-400:],
        "stdout_tail": (res.get("stdout") or "")[-400:],
    }
    if isinstance(doc, dict):
        for k in ("predicate", "findingCount", "findings", "couldNotEvaluate",
                  "allPass", "cases", "pass", "failing", "idCoverage",
                  "schema", "nonce", "receipt"):
            if k in doc:
                out[k] = doc[k]
        if "results" in doc and isinstance(doc["results"], list):
            out["failed_cases"] = [
                {"name": r.get("name"), "file": r.get("file"),
                 "got": r.get("got"), "want": r.get("want")}
                for r in doc["results"] if r.get("ok") is False
            ]
    return out


def main():
    spec_path, outdir = sys.argv[1], sys.argv[2]
    with open(spec_path) as fh:
        spec = json.load(fh)
    lane = spec.get("laneRoot", "/home/vgpnk/Projects/shokunin/tabi-shokunin")
    os.makedirs(outdir, exist_ok=True)

    src = spec["source"]
    src_bytes = open(src, "rb").read()
    src_sha = sha256_bytes(src_bytes)
    if spec.get("sourceSha256") and src_sha != spec["sourceSha256"]:
        raise SystemExit("source sha mismatch: " + src_sha)

    fixtures_link = spec["fixturesLink"]
    fixture = spec["fixture"]
    probes = spec["probes"]
    node = "node"

    fixture_argv_tail = [
        fixture["receipt"],
        "--driver", fixture["driver"],
        "--expect-driver-sha256", fixture["sha256"],
    ]
    if fixture.get("shot"):
        fixture_argv_tail += ["--shot", fixture["shot"]]
    fixture_argv_tail += ["--json"]

    def probe_argv_tail(probe, shot):
        argv = [probe["receipt"], "--driver", fixture["driver"],
                "--expect-driver-sha256", fixture["sha256"]]
        if shot:
            argv += ["--shot", shot]
        argv += ["--json"]
        return argv

    report = {
        "schema": "tabi-r61-mutc2-harness-v1",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "laneRoot": lane,
        "source": {"path": src, "sha256": src_sha, "bytes": len(src_bytes)},
        "fixturesLink": fixtures_link,
        "fixture": fixture,
        "control": {},
        "mutants": [],
        "integrity": {"sourceShaAfter": None, "fixturesShaAfter": None},
    }

    # --- control: pristine copy -------------------------------------------
    ctl_dir = os.path.join(outdir, "control")
    os.makedirs(ctl_dir, exist_ok=True)
    ctl = os.path.join(ctl_dir, os.path.basename(src))
    open(ctl, "wb").write(src_bytes)
    link = os.path.join(ctl_dir, os.path.basename(fixtures_link))
    if os.path.islink(link) or os.path.exists(link):
        os.unlink(link) if os.path.islink(link) else None
    if not os.path.exists(link):
        os.symlink(fixtures_link, link)
    ctl_sha = sha256_file(ctl)
    assert ctl_sha == src_sha, "control copy sha mismatch"

    control = {"path": ctl, "sha256": ctl_sha}
    control["selftest"] = summarize(run([node, ctl, "--selftest"], lane))
    control["fixture"] = summarize(run([node, ctl] + fixture_argv_tail, lane))
    control["probes"] = {}
    for pid, probe in probes.items():
        control["probes"][pid] = summarize(
            run([node, ctl] + probe_argv_tail(probe, probe.get("shot")), lane))
        control["probes"][pid]["probeSha256"] = sha256_file(probe["receipt"])
    report["control"] = control

    # --- mutants -----------------------------------------------------------
    for m in spec["mutants"]:
        mid = m["id"]
        d = os.path.join(outdir, mid.replace("'", "p").replace(" ", "_"))
        os.makedirs(d, exist_ok=True)
        mut_path = os.path.join(d, os.path.basename(src))
        text = src_bytes.decode("utf-8")
        reps = m.get("replacements") or [{"from": m["from"], "to": m["to"]}]
        applied = []
        for r in reps:
            n = text.count(r["from"])
            if n != 1:
                raise SystemExit("replacement target occurs %d times for %s: %r" % (n, mid, r["from"][:80]))
            text = text.replace(r["from"], r["to"], 1)
            applied.append({"from": r["from"], "to": r["to"], "occurrencesInSource": n})
        mutated = text.encode("utf-8")
        open(mut_path, "wb").write(mutated)
        mut_sha = sha256_bytes(mutated)
        link = os.path.join(d, os.path.basename(fixtures_link))
        if not os.path.islink(link) and not os.path.exists(link):
            os.symlink(fixtures_link, link)
        changed = sum(1 for a, b in zip(src_bytes.decode().splitlines(),
                                        mutated.decode().splitlines()) if a != b)
        rec = {
            "id": mid,
            "mutation": m["mutation"],
            "replacements": applied,
            "replacementSites": len(applied),
            "path": mut_path,
            "sha256": mut_sha,
            "bytes": len(mutated),
            "changedLines": changed,
            "probeId": m["probe"],
        }
        rec["selftest"] = summarize(run([node, mut_path, "--selftest"], lane))
        probe = probes[m["probe"]]
        rec["probe"] = summarize(
            run([node, mut_path] + probe_argv_tail(probe, probe.get("shot")), lane))
        rec["probe"]["probeSha256"] = sha256_file(probe["receipt"])
        rec["fixtureGreen"] = summarize(
            run([node, mut_path] + fixture_argv_tail, lane))
        report["mutants"].append(rec)

    report["integrity"]["sourceShaAfter"] = sha256_file(src)
    report["integrity"]["fixturesShaAfter"] = sha256_file(fixtures_link) if os.path.isfile(fixtures_link.decode() if isinstance(fixtures_link, bytes) else fixtures_link) else None
    with open(os.path.join(outdir, "harness.out.json"), "w") as fh:
        json.dump(report, fh, indent=1)
    print(json.dumps({
        "control": {
            "selftest": {k: control["selftest"].get(k) for k in ("exit", "allPass", "cases", "pass")},
            "fixture": {k: control["fixture"].get(k) for k in ("exit", "predicate", "findingCount")},
            "probes": {k: v.get("exit") for k, v in control["probes"].items()},
        },
        "mutants": [
            {
                "id": r["id"],
                "sha256": r["sha256"],
                "selftest": {k: r["selftest"].get(k) for k in ("exit", "allPass", "cases", "pass")},
                "failed": [x.get("name") for x in (r["selftest"].get("failed_cases") or [])],
                "probeExit": r["probe"].get("exit"),
                "probePredicate": r["probe"].get("predicate"),
                "probeFindings": [f.get("id") for f in (r["probe"].get("findings") or [])] if isinstance(r["probe"].get("findings"), list) else r["probe"].get("findings"),
                "fixtureExit": r["fixtureGreen"].get("exit"),
            }
            for r in report["mutants"]
        ],
        "integrity": report["integrity"],
    }, indent=1))


if __name__ == "__main__":
    main()
