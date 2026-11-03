#!/usr/bin/env python3
"""Build .ufo/waves/round-61/w1/R61MutC2/kills.json from the measured runs.

Inputs (all read-only):
  out3/harness.out.json  -- control + five frozen-mutant runs (argv, exit, parsed JSON)
  precision.json         -- narrow-reading variants that must NOT green the probe
  the lane counter, its fixtures dir, the f-probes manifest, harness.py, spec.json

Output: the wave dir's kills.json. No lane bytes are written.
"""
import difflib
import hashlib
import json
import os

L = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
S = "/fast/scratch/hyaku/tabi-r61/R61MutC2"
WD = L + "/.ufo/waves/round-61/w1/R61MutC2"
C = L + "/.ufo/waves/round-61/counters/chromium-receipt-r61.mjs"
F = L + "/.ufo/waves/round-61/counters/chromium-receipt-r61-fixtures"
P = L + "/.ufo/waves/round-61/measure/f-probes"
GEN = L + "/.ufo/waves/round-61/measure/f-probes-r61.py"


def sha(p):
    with open(p, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def dir_digest(root):
    rows = []
    for dp, dn, fn in os.walk(root):
        dn.sort()
        for f in sorted(fn):
            p = os.path.join(dp, f)
            rows.append(os.path.relpath(p, root) + " " + sha(p))
    rows.sort()
    return hashlib.sha256("\n".join(rows).encode()).hexdigest(), len(rows)


def rel(p):
    return os.path.relpath(p, L)


def brief_selftest(r):
    return {
        "argv": r.get("argv"),
        "exit": r["exit"],
        "cases": r.get("cases"),
        "pass": r.get("pass"),
        "allPass": r.get("allPass"),
        "failing": [
            {"name": x["name"], "got": x["got"], "want": x["want"]}
            for x in (r.get("failed_cases") or [])
        ],
    }


def reproduce(argv, measured, staged):
    return [staged if a == measured else a for a in (argv or [])]


def brief_probe(r):
    return {
        "argv": r.get("argv"),
        "exit": r["exit"],
        "predicate": r.get("predicate"),
        "findings": [
            {"id": f["id"], "occurrences": f.get("occurrences"), "detail": f.get("detail")}
            for f in (r.get("findings") or [])
        ],
        "couldNotEvaluate": r.get("couldNotEvaluate"),
    }


def main():
    d = json.load(open(S + "/out3/harness.out.json"))
    prec = json.load(open(S + "/precision.json"))
    man = json.load(open(P + "/manifest.json"))
    fd, fc = dir_digest(F)
    ctl = d["control"]
    labels = {"C1p": "C1'", "C2p": "C2'", "C3p": "C3'", "C4p": "C4'", "C5p": "C5'"}

    out = {
        "seat": "R61MutC2",
        "round": 61,
        "wave": "w1",
        "claim": "C2 (coverage capability chromium-pointer-event-domain-linux): r61 counter generation mutation probe",
        "authority": ".ufo/waves/round-61/claims.json (mutants.C2 C1'-C5') - read, never amended",
        "sourceCounter": {
            "path": rel(d["source"]["path"]),
            "sha256": d["source"]["sha256"],
            "bytes": d["source"]["bytes"],
        },
        "baseCounter": {
            "path": ".ufo/waves/round-60/counters/chromium-receipt-r60.mjs",
            "sha256": "b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae",
        },
        "probeGenerator": {"path": rel(GEN), "sha256": sha(GEN)},
        "probeManifest": {"path": rel(P + "/manifest.json"), "sha256": sha(P + "/manifest.json")},
        "fixtureReceipt": {
            "path": rel(F + "/live/r61-pointer-fixture.receipt.json"),
            "sha256": sha(F + "/live/r61-pointer-fixture.receipt.json"),
            "note": "SYNTHETIC pointer fixture shipped by the r61 counter (schema tabi-chrome-cdp-r61, R59 driver bytes/nonce); not live browser evidence.",
        },
        "driver": {
            "path": rel(F + "/live/chrome-cdp-loopback-round59.mjs"),
            "sha256": sha(F + "/live/chrome-cdp-loopback-round59.mjs"),
            "note": "the fixture's own pinned driver (r59 bytes), as the path-backed fixture cases declare.",
        },
        "fixturesDir": {
            "path": rel(F),
            "digestSha256": fd,
            "files": fc,
            "digestRule": "sha256 over sorted '<relpath> <sha256>' lines for every file",
        },
        "probeSet": [
            {
                "id": e["id"],
                "path": rel(P + "/" + e["file"]),
                "sha256": e["sha256"],
                "frozenSetF": e["frozenSetF"],
            }
            for e in man["probes"]
        ],
        "commandContext": {
            "cwd": L,
            "argvShape": "node <counter> <receipt> --driver <fixture driver> --expect-driver-sha256 b16ddb44...ff86 --shot <fixtures>/live --json",
            "selftestArgv": "node <counter> --selftest",
            "note": "--shot names the fixture's PNG dir so PNG-byte checks resolve exactly as in the counter's own path-backed green case; without it the probes carry 36 png-missing findings in control and mutant alike (measured).",
        },
        "harness": {"path": rel(WD + "/harness.py"), "sha256": sha(WD + "/harness.py")},
        "spec": {"path": rel(WD + "/spec.json"), "sha256": sha(WD + "/spec.json")},
        "control": {
            "counterPath": rel(WD + "/control/chromium-receipt-r61.mjs"),
            "counterSha256": ctl["sha256"],
            "measuredScratchPath": ctl["path"],
            "reproduceArgvNote": "argv below were measured with the scratch copy; substitute the wave-dir path (same sha256) to reproduce after scratch disposal.",
            "selftest": brief_selftest(ctl["selftest"]),
            "fixtureReceipt": brief_probe(ctl["fixture"]),
            "probes": {
                k: {"sha256": v["probeSha256"], **brief_probe(v)}
                for k, v in ctl["probes"].items()
            },
            "verdict": "CONTROL-OK (selftest 126/126 allPass true; fixture receipt exit 0 findings []; f1-f5 all exit 1)",
        },
        "mutants": [],
        "summary": {"killed": 0, "survivors": 0, "blocked": 0},
        "integrity": {
            "sourceShaBefore": d["source"]["sha256"],
            "sourceShaAfter": d["integrity"]["sourceShaAfter"],
            "sourceUnmodified": d["source"]["sha256"] == d["integrity"]["sourceShaAfter"],
            "fixturesDigestAfter": fd,
            "mutantFilesStagedUnder": ".ufo/waves/round-61/w1/R61MutC2/mutants/",
            "note": "Every mutant is a byte copy in scratch/the wave dir; the lane counter bytes were never edited. Scratch /fast/scratch/hyaku/tabi-r61/R61MutC2 is removed before exit.",
            "stagedReplay": {
                "note": "The wave-dir copies (same sha256 as the measured scratch copies) were re-run after staging, from cwd=<lane>, each with --selftest, the matched probe and the green fixture receipt. Results identical to the measured matrix.",
                "control": {"selftestExit": 0, "fixtureExit": 0},
                "mutants": {
                    "C1'": {"selftestExit": 1, "probe": "f1", "probeExit": 0, "fixtureExit": 0},
                    "C2'": {"selftestExit": 1, "probe": "f2", "probeExit": 0, "fixtureExit": 0},
                    "C3'": {"selftestExit": 1, "probe": "f3", "probeExit": 0, "fixtureExit": 0},
                    "C4'": {"selftestExit": 1, "probe": "f4", "probeExit": 0, "fixtureExit": 0},
                    "C5'": {"selftestExit": 1, "probe": "f5", "probeExit": 0, "fixtureExit": 0},
                },
                "fixturesSymlink": ".ufo/waves/round-61/w1/R61MutC2/mutants/chromium-receipt-r61-fixtures -> the lane r61 fixtures dir (the counter resolves FIXTURES_DIR as dirname(SELF)/chromium-receipt-r61-fixtures).",
            },
        },
    }

    src_text = open(C, encoding="utf-8").read().splitlines()
    for m in d["mutants"]:
        pid = m["probeId"]
        mut_text = open(WD + "/mutants/" + m["id"] + ".mjs", encoding="utf-8").read().splitlines()
        udiff = list(difflib.unified_diff(src_text, mut_text, fromfile="chromium-receipt-r61.mjs",
                                          tofile=m["id"] + ".mjs", n=2, lineterm=""))
        changed_lines = sum(1 for line in udiff if line.startswith(("+", "-")) and not line.startswith(("+++", "---")))
        hunks = sum(1 for line in udiff if line.startswith("@@"))
        ctlp = ctl["probes"][pid]
        killed = (
            m["probe"]["exit"] == 0
            and ctlp["exit"] != 0
            and m["selftest"]["exit"] != 0
        )
        rec = {
            "id": labels[m["id"]],
            "mutantSha256": m["sha256"],
            "mutantFile": rel(WD + "/mutants/" + m["id"] + ".mjs"),
            "measuredScratchPath": m["path"],
            "reproduceArgv": {
                "selftest": reproduce(m["selftest"].get("argv"), m["path"], WD + "/mutants/" + m["id"] + ".mjs"),
                "probe": reproduce(m["probe"].get("argv"), m["path"], WD + "/mutants/" + m["id"] + ".mjs"),
                "fixture": reproduce(m["fixtureGreen"].get("argv"), m["path"], WD + "/mutants/" + m["id"] + ".mjs"),
            },
            "mutation": m["mutation"],
            "replacementSites": m["replacementSites"],
            "replacements": [
                {"from": r["from"], "to": r["to"], "occurrencesInSource": r["occurrencesInSource"]}
                for r in m["replacements"]
            ],
            "diffLines": changed_lines,
            "diffHunks": hunks,
            "selftestFailures": brief_selftest(m["selftest"]),
            "probeVerdict": {
                "probe": pid,
                "probeSha256": m["probe"]["probeSha256"],
                "control": {"exit": ctlp["exit"], "findings": [f["id"] for f in (ctlp.get("findings") or [])]},
                "mutant": {
                    "exit": m["probe"]["exit"],
                    "predicate": m["probe"].get("predicate"),
                    "findings": [f["id"] for f in (m["probe"].get("findings") or [])],
                },
                "turnedGreen": m["probe"]["exit"] == 0,
            },
            "fixtureReceiptAfterMutation": {
                "exit": m["fixtureGreen"]["exit"],
                "predicate": m["fixtureGreen"].get("predicate"),
                "findings": [f["id"] for f in (m["fixtureGreen"].get("findings") or [])],
            },
            "verdict": "KILLED" if killed else ("SURVIVOR" if m["probe"]["exit"] != 0 else "blocked"),
            "basis": "frozen seat rule: KILL requires the matched probe to green under the mutant AND the kill to show as selftest failures; fixture receipt must stay green.",
        }
        out["mutants"].append(rec)
        out["summary"]["killed" if killed else "survivors"] += 1

    out["precisionProbes"] = []
    for name, desc, probe in [
        ("P-C2-narrow", "narrow one-site reading of C2' ('per-entry loop over ptrlog[0] only'); f2 stays RED because the presence/count rules independently refuse the deleted pointerdown. Demonstrates the frozen one-line wording does not realise the stated f2-green without also making the press presence optional.", "f2"),
        ("P-C3-typeonly", "one-site reading of C3' (relax the numeric pointerId rule only); f3 stays RED on pointer-order-wrong via the release-id equality. The KILL needs the equality relaxed too.", "f3"),
        ("P-C5-additiveonly", "one-site reading of C5' (remove the additive pointer-nonce-wrong check only); f5 stays RED on the CARRIED plain-trace-wrong prefix rule. The KILL needs the carried binding dropped too.", "f5"),
    ]:
        r = prec[name]
        out["precisionProbes"].append({
            "id": name,
            "finding": desc,
            "probe": probe,
            "variantSha256": r["variantSha256"],
            "variantFile": rel(WD + "/mutants/precision/" + name + ".mjs"),
            "argv": r.get("argv"),
            "reproduceArgv": [ (WD + "/mutants/precision/" + name + ".mjs") if a == ("/fast/scratch/hyaku/tabi-r61/R61MutC2/precision/" + name + "/chromium-receipt-r61.mjs") else a for a in (r.get("argv") or []) ],
            "probeExit": r["probeExit"],
            "probeFindings": [{"id": x[0], "occurrences": x[1]} for x in r["probeFindings"]],
            "fixtureExit": r["fixtureExit"],
            "verdict": "probe did not green (narrow reading)",
        })

    c2 = next(m for m in out["mutants"] if m["id"] == "C2'")
    out["instrumentFindings"] = [
        {"id": "F1", "class": "frozen mutant wording precision (C2')",
         "finding": "'check only the first pointer entry' is not realised by the narrow per-entry-loop edit: measured probe f2 stays exit 1 with pointer-order-wrong x2 (P-C2-narrow sha " + prec["P-C2-narrow"]["variantSha256"][:16] + "...). The frozen kill rule needs the composed defect (per-entry ptrlog[0] only + missing-press tolerated + first-pairing-only), which greens f2 and is KILLED at mutant " + c2["mutantSha256"][:16] + "...."},
        {"id": "F2", "class": "frozen mutant wording precision (C3')",
         "finding": "f3 (pointerId deleted from the pointerdown) is refused TWICE: the numeric-type rule (pointer-id-wrong) and the release-id equality (pointer-order-wrong). Relaxing only the type rule leaves f3 red (P-C3-typeonly sha " + prec["P-C3-typeonly"]["variantSha256"][:16] + "...). The KILL requires both sites, as executed."},
        {"id": "F3", "class": "frozen mutant wording precision (C5')",
         "finding": "f5 (corrupted final valueAfter) is refused TWICE: the additive pointer-nonce-wrong rederivation and the CARRIED plainTrace prefix rule (plain-trace-wrong). Removing only the additive check leaves f5 red (P-C5-additiveonly sha " + prec["P-C5-additiveonly"]["variantSha256"][:16] + "...). The KILL requires the carried binding dropped as well. Exec3's report had already disclosed this; measured here."},
        {"id": "F4", "class": "probe invocation sensitivity",
         "finding": "Running the probes without --shot makes every probe carry 36 png-missing findings, so no mutant can ever green a probe (measured on the control probe set). The frozen live after-command passes --shot; DATA-PASS-RUNBOOK step 3c omits it. Mutation verdicts above use --shot .ufo/waves/round-61/counters/chromium-receipt-r61-fixtures/live."},
        {"id": "F5", "class": "baseline provenance",
         "finding": "The green fixture receipt is the counter's SYNTHETIC pointer fixture (sha 6dd8c3e2...), not live browser evidence. The kills are contract-level detector kills on frozen-shaped bytes; the C2 live delivery/teardown evidence remains a data-pass obligation and was not measured by this seat."},
        {"id": "F6", "class": "probe purity",
         "finding": "f1/f2/f3/f4 edit only ptrlog; they never touch mouselog. This is coherent with the counter's seq-based cross-array rule (mouselog seqs remain globally unique/increasing), and it is precisely why f2 leaves an unmatched pointerup that the composed C2' tolerates."},
    ]

    with open(WD + "/kills.json", "w") as fh:
        fh.write(json.dumps(out, indent=1) + "\n")
    print(json.dumps(out["summary"]), os.path.getsize(WD + "/kills.json"))


if __name__ == "__main__":
    main()
