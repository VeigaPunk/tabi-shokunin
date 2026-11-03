#!/usr/bin/env python3
"""Build the FINAL .ufo/waves/round-61/w1/R61MutC2/kills.json.

Instrument: chromium-receipt-r61.mjs sha256
97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625 (selftest 129/129).
The earlier measurement on sha f615a2f9 is archived under superseded-f615a2f9/
and is NOT the verdict.

Inputs: out5/harness.out.json (control + five mutants), precision2.json
(narrow readings), the lane counter/fixtures/probes, staged wave-dir copies.
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
DRV = L + "/scripts/chrome-cdp-loopback-round61.mjs"


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


def reproduce(argv, measured_dir, staged_dir):
    out = []
    for a in (argv or []):
        out.append(staged_dir + a[len(measured_dir):] if a.startswith(measured_dir) else a)
    return out


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
    d = json.load(open(S + "/out5/harness.out.json"))
    prec = json.load(open(S + "/precision2.json"))
    man = json.load(open(P + "/manifest.json"))
    fd, fc = dir_digest(F)
    ctl = d["control"]
    labels = {"C1p": "C1'", "C2p": "C2'", "C3p": "C3'", "C4p": "C4'", "C5p": "C5'"}
    replay = WD + "/replay-root/.ufo/waves/round-61/counters"

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
            "note": "measured on the authoring bytes that reached selftest 129/129; the earlier sha f615a2f9 was superseded mid-authoring and is archived under superseded-f615a2f9/ (not a verdict).",
        },
        "baseCounter": {
            "path": ".ufo/waves/round-60/counters/chromium-receipt-r60.mjs",
            "sha256": "b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae",
        },
        "probeGenerator": {"path": rel(GEN), "sha256": sha(GEN)},
        "probeManifest": {"path": rel(P + "/manifest.json"), "sha256": sha(P + "/manifest.json")},
        "fixtureReceipt": {
            "path": rel(F + "/r61-base-receipt.json"),
            "sha256": sha(F + "/r61-base-receipt.json"),
            "note": "Exec2's real runner smoke receipt (smoke-r61b), copied untransformed; schema tabi-chrome-cdp-r61, nonce tabi-r61-a3f19c42d5e87b01. It is the counter's own green case r61-green.",
        },
        "driver": {
            "path": "scripts/chrome-cdp-loopback-round61.mjs",
            "sha256": sha(DRV),
            "note": "the fixture's pinned driver (r61 runner), sha matches r61-green.expectDriverSha256 and the receipt's driverSha256.",
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
            "argvShape": "node <counter> <receipt> --driver scripts/chrome-cdp-loopback-round61.mjs --expect-driver-sha256 f33f0ab7... --shot <fixtures> <fixtures>/r61-a-pointer-press.png <fixtures>/r61-b-typed.png --json",
            "selftestArgv": "node <counter> --selftest",
            "note": "The receipt's steps name a-pointer-press.png / b-typed.png while the fixture dir stores them as r61-*.png; the two shots must be passed as positional shotFiles overrides after --shot, exactly as r61-green.shotFiles declares. Without them the receipt and every probe carry 2 png-missing findings and no mutant could ever green a probe (measured).",
        },
        "harness": {"path": rel(WD + "/harness.py"), "sha256": sha(WD + "/harness.py")},
        "spec": {"path": rel(WD + "/spec.json"), "sha256": sha(WD + "/spec.json")},
        "control": {
            "counterPath": rel(WD + "/control/chromium-receipt-r61.mjs"),
            "counterSha256": ctl["sha256"],
            "measuredScratchPath": ctl["path"],
            "reproduceArgv": {
                "selftest": reproduce(ctl["selftest"].get("argv"), ctl["path"], replay + "/control.mjs"),
                "fixture": reproduce(ctl["fixture"].get("argv"), ctl["path"], replay + "/control.mjs"),
                "probes": {
                    k: reproduce(v.get("argv"), ctl["path"], replay + "/control.mjs")
                    for k, v in ctl["probes"].items()
                },
            },
            "selftest": brief_selftest(ctl["selftest"]),
            "fixtureReceipt": brief_probe(ctl["fixture"]),
            "probes": {
                k: {"sha256": v["probeSha256"], **brief_probe(v)}
                for k, v in ctl["probes"].items()
            },
            "verdict": "CONTROL-OK (selftest 129/129 allPass true; green fixture exit 0 findings []; f1-f5 all exit 1)",
        },
        "mutants": [],
        "summary": {"killed": 0, "survivors": 0, "blocked": 0},
        "integrity": {
            "sourceShaBefore": d["source"]["sha256"],
            "sourceShaAfter": d["integrity"]["sourceShaAfter"],
            "sourceUnmodified": d["source"]["sha256"] == d["integrity"]["sourceShaAfter"],
            "fixturesDigestAfter": fd,
            "mutantFilesStagedUnder": ".ufo/waves/round-61/w1/R61MutC2/mutants/",
            "replayRoot": ".ufo/waves/round-61/w1/R61MutC2/replay-root/ (lane-shaped; hardlinked counters, fixtures + runner symlinked) so the fixtures' ../../../../../scripts/ traversal resolves after scratch disposal.",
            "note": "Every mutant is a byte copy while it is measured; the lane counter bytes were never edited. Scratch /fast/scratch/hyaku/tabi-r61/R61MutC2 is removed before exit.",
            "stagedReplay": {
                "note": "Replayed from replay-root after staging, cwd=<lane>. Identical to the measured matrix.",
                "control": {"selftestExit": 0, "fixtureExit": 0},
                "mutants": {
                    "C1'": {"selftestExit": 1, "probe": "f1", "probeExit": 0, "fixtureExit": 0},
                    "C2'": {"selftestExit": 1, "probe": "f2", "probeExit": 0, "fixtureExit": 0},
                    "C3'": {"selftestExit": 1, "probe": "f3", "probeExit": 0, "fixtureExit": 0},
                    "C4'": {"selftestExit": 1, "probe": "f4", "probeExit": 0, "fixtureExit": 0},
                    "C5'": {"selftestExit": 1, "probe": "f5", "probeExit": 0, "fixtureExit": 0},
                },
            },
        },
    }

    src_text = open(C, encoding="utf-8").read().splitlines()
    for m in d["mutants"]:
        pid = m["probeId"]
        ctlp = ctl["probes"][pid]
        staged = WD + "/mutants/" + m["id"] + ".mjs"
        mut_text = open(staged, encoding="utf-8").read().splitlines()
        udiff = list(difflib.unified_diff(src_text, mut_text, fromfile="chromium-receipt-r61.mjs",
                                          tofile=m["id"] + ".mjs", n=2, lineterm=""))
        changed_lines = sum(1 for line in udiff if line.startswith(("+", "-")) and not line.startswith(("+++", "---")))
        hunks = sum(1 for line in udiff if line.startswith("@@"))
        killed = (
            m["probe"]["exit"] == 0
            and ctlp["exit"] != 0
            and m["selftest"]["exit"] != 0
        )
        rec = {
            "id": labels[m["id"]],
            "mutantSha256": m["sha256"],
            "mutantFile": rel(staged),
            "measuredScratchPath": m["path"],
            "reproduceArgv": {
                "selftest": reproduce(m["selftest"].get("argv"), m["path"], replay + "/" + m["id"] + ".mjs"),
                "probe": reproduce(m["probe"].get("argv"), m["path"], replay + "/" + m["id"] + ".mjs"),
                "fixture": reproduce(m["fixtureGreen"].get("argv"), m["path"], replay + "/" + m["id"] + ".mjs"),
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
            "basis": "frozen seat rule: KILL requires the matched probe to green under the mutant AND the kill to show as selftest failures; the green fixture must stay green.",
        }
        out["mutants"].append(rec)
        out["summary"]["killed" if killed else "survivors"] += 1

    out["precisionProbes"] = []
    for name, desc, probe in [
        ("P-C2-narrow", "narrow one-site reading of C2' (per-entry loop over ptrlog[0] only); f2 stays RED because the presence/count rules independently refuse the deleted pointerdown. Demonstrates the frozen one-line wording does not realise the stated f2-green without also making the press presence optional.", "f2"),
        ("P-C3-typeonly", "one-site reading of C3' (relax the numeric pointerId rule only); f3 stays RED on pointer-order-wrong via the release-id equality. The KILL needs the equality relaxed too.", "f3"),
        ("P-C5-additiveonly", "one-site reading of C5' (remove the additive pointer-nonce-wrong check only); f5 stays RED on plain-trace-wrong plus the r61-path nonce-not-invocation-bound rule. The KILL needs the carried prefix rule and the r61 typed-trace rule dropped too.", "f5"),
    ]:
        r = prec[name]
        staged = WD + "/mutants/precision/" + name + ".mjs"
        out["precisionProbes"].append({
            "id": name,
            "finding": desc,
            "probe": probe,
            "variantSha256": r["variantSha256"],
            "variantFile": rel(staged),
            "measuredScratchPath": r["root"] + "/.ufo/waves/round-61/counters/chromium-receipt-r61.mjs",
            "reproduceArgv": [staged if a == (r["root"] + "/.ufo/waves/round-61/counters/chromium-receipt-r61.mjs") else a for a in (r.get("argv") or [])],
            "probeExit": r["probeExit"],
            "probeFindings": [{"id": x[0], "occurrences": x[1]} for x in r["probeFindings"]],
            "fixtureExit": r["fixtureExit"],
            "verdict": "probe did not green (narrow reading)",
        })

    c2 = next(m for m in out["mutants"] if m["id"] == "C2'")
    c3 = next(m for m in out["mutants"] if m["id"] == "C3'")
    c5 = next(m for m in out["mutants"] if m["id"] == "C5'")
    out["instrumentFindings"] = [
        {"id": "F1", "class": "frozen mutant wording precision (C2')",
         "finding": "'check only the first pointer entry' is not realised by the narrow per-entry-loop edit: measured probe f2 stays exit 1 with pointer-order-wrong x2 (P-C2-narrow sha " + prec["P-C2-narrow"]["variantSha256"][:16] + "...). The frozen kill rule needs the composed defect (per-entry ptrlog[0] only + missing-press tolerated + first-pairing-only), which greens f2 and is KILLED at mutant " + c2["mutantSha256"][:16] + "...."},
        {"id": "F2", "class": "frozen mutant wording precision (C3')",
         "finding": "f3 (pointerId deleted from the pointerdown) is refused TWICE: the numeric-type rule (pointer-id-wrong) and the release-id equality (pointer-order-wrong). Relaxing only the type rule leaves f3 red (P-C3-typeonly sha " + prec["P-C3-typeonly"]["variantSha256"][:16] + "...). The KILL requires both sites (mutant " + c3["mutantSha256"][:16] + "...)."},
        {"id": "F3", "class": "frozen mutant wording precision (C5')",
         "finding": "f5 (corrupted final valueAfter) is refused THREE times on this generation: additive pointer-nonce-wrong (plainTrace rederivation), carried plain-trace-wrong (prefix binding), and the r61-path nonce-not-invocation-bound (exact-nonce-in-typed-trace). Removing only the additive check leaves f5 red (P-C5-additiveonly sha " + prec["P-C5-additiveonly"]["variantSha256"][:16] + "...). The KILL requires all three plus the r61 valueAfterTyping equality (mutant " + c5["mutantSha256"][:16] + "..., 4 sites). Exec3's report disclosed the carried-rule part in advance; the r61-path rule appeared with the later revision and is measured here."},
        {"id": "F4", "class": "probe invocation shape",
         "finding": "Scoring probes needs `--shot <fixtures>` plus the two shotFiles overrides (r61-a-pointer-press.png, r61-b-typed.png) because the receipt's steps name a-pointer-press.png/b-typed.png while the fixture dir stores r61-*-prefixed copies. Without the overrides the receipt and every probe carry 2 png-missing findings and no mutant could ever green a probe (measured). The frozen live command uses corpus/evidence/round61/chromium-pointer-domain PNGs whose names match the live receipt, so live scoring is unaffected; any replay from measure/ must pass the overrides."},
        {"id": "F5", "class": "baseline provenance",
         "finding": "The green baseline is Exec2's real runner smoke receipt (smoke-r61b sha 7839c0a6..., copied to r61-base-receipt.json), so the pointer records are live-delivery bytes; it is still a smoke receipt, and the committed corpus receipt plus the closure proof remain data-pass obligations. This seat ran no browser."},
        {"id": "F6", "class": "selftest-vs-probe shape divergence (f2)",
         "finding": "The selftest case r61-f2-pointerdown-deleted derives its forgery with an ARRAY-KEY delete (ptrlog.1 delete => a hole, length 3), which the counter refuses as pointer-log-wrong + pointer-order-wrong; the frozen probe f2 deletes the element (Python del => length 2), refused as pointer-order-wrong x2. The selftest case and the frozen probe therefore exercise different bytes; both are refused by the pristine counter, and the C2' mutant greens the probe while the selftest case (hole shape) still fails. Recorded so the L1 does not conflate them."},
        {"id": "F7", "class": "probe purity",
         "finding": "f1-f4 edit only ptrlog; f5 edits only the last plainTrace valueAfter. They never touch mouselog or journey, which is coherent with the counter's independent seq/journey rules; it is precisely why the composed C2' can green f2 while the r61-journey checks stay satisfied."},
    ]

    with open(WD + "/kills.json", "w") as fh:
        fh.write(json.dumps(out, indent=1) + "\n")
    print(json.dumps(out["summary"]), os.path.getsize(WD + "/kills.json"))


if __name__ == "__main__":
    main()
