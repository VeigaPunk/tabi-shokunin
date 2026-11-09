#!/usr/bin/env python3
"""R97Mut mutation sweep: single-point mutants of the frozen r97 counter,
each run through the frozen negatives battery in --receipt mode.

Pristine / battery baseline: battery on the positive receipt must be
70/70 (positive clean + 69 negatives killed) before any mutant verdict
below means anything. A mutant SURVIVES iff the whole battery still
passes (exit 0, all cases ok) against the mutated counter copy.
KILLED is split into killed-clean (battery still 70/70 but the do-nothing
control or positive case changed... no: if the battery still passes the
mutant survived by definition) -- instead we record battery_ok and, for
killed mutants, whether the positive case stayed clean and which cases
failed.

Each mutant is (id, class, exact old string -> new string) applied to a
fresh copy of the pristine counter. All mutants are single-point edits:
one string replacement, one check dropped/weakened, one literal changed.
"""
import copy
import hashlib
import json
import os
import subprocess
import sys

S = "/fast/scratch/hyaku/tabi-r97/R97Mut"
PRISTINE = os.path.join(S, "lane/scripts/check-client-oopif-uploadfile-round97.mjs")
BATTERY = os.path.join(S, "lane/scripts/negatives-client-oopif-uploadfile-round97.mjs")
LANE = os.path.join(S, "lane")
RECEIPT = os.path.join(S, "receipt-positive.json")
PIN = "09f0c2fe2895ee0e035e8107995873328ce74f4e4d6d1ab3c8efd455b8c9e4eb"
NONCE = "tabi-r97-ctl-positive"
RESULTS_OUT = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-97/w1/R97Mut-results.json"

pristine = open(PRISTINE).read()
pristine_sha = hashlib.sha256(pristine.encode()).hexdigest()

MUTANTS = []  # (id, cls, old, new, note)

def M(i, cls, old, new, note):
    MUTANTS.append((i, cls, old, new, note))

# ---- A. ARM event-table trust flips (swap true/false in one arm's events) ----
M("M01", "arm-trust", "PUX: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] }",
  "PUX: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] }",
  "PUX trust->untrusted")
M("M02", "arm-trust", "PUS: { lib: 'puppeteer', cross: false, isLocal: null, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] }",
  "PUS: { lib: 'puppeteer', cross: false, isLocal: null, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] }",
  "PUS trust->untrusted")
M("M03", "arm-trust", "PLX: { lib: 'playwright', cross: true, isLocal: false, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] }",
  "PLX: { lib: 'playwright', cross: true, isLocal: false, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] }",
  "PLX untrusted->trusted")
M("M04", "arm-trust", "PLS: { lib: 'playwright', cross: false, isLocal: false, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] }",
  "PLS: { lib: 'playwright', cross: false, isLocal: false, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] }",
  "PLS untrusted->trusted")
M("M05", "arm-trust", "PLL: { lib: 'playwright', cross: true, isLocal: true, call: 'upload', outcome: 'resolved', files: 'answer', events: [T('input'), T('change')] }",
  "PLL: { lib: 'playwright', cross: true, isLocal: true, call: 'upload', outcome: 'resolved', files: 'answer', events: [U('input'), U('change')] }",
  "PLL trust->untrusted")
M("M06", "arm-trust", "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved', files: 'missing', events: [T('input'), T('change')] }",
  "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved', files: 'missing', events: [U('input'), U('change')] }",
  "PUM trust->untrusted")
M("M07", "arm-trust", "PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear', outcome: 'resolved', files: 'none', events: [T('input'), T('change'), U('input'), U('change')] }",
  "PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear', outcome: 'resolved', files: 'none', events: [T('input'), T('change'), T('input'), T('change')] }",
  "PUC second pair trust flip")
M("M08", "arm-trust", "PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing', outcome: 'enoent', files: 'none', events: [] }",
  "PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing', outcome: 'enoent', files: 'none', events: [U('input'), U('change')] }",
  "PLM expects phantom events")

# ---- B. ARM files / outcome / lib / cross / isLocal / call flips ----
M("M09", "arm-files", "files: 'answer', events: [T('input'), T('change')] },\n  PUS:", "files: 'none', events: [T('input'), T('change')] },\n  PUS:", "PUX expects empty child")
M("M10", "arm-files", "PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear', outcome: 'resolved', files: 'none'",
  "PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear', outcome: 'resolved', files: 'answer'",
  "PUC expects filled child")
M("M11", "arm-files", "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved', files: 'missing'",
  "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved', files: 'none'",
  "PUM expects empty child")
M("M12", "arm-outcome", "PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing', outcome: 'enoent'",
  "PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing', outcome: 'resolved'",
  "PLM expects resolved")
M("M13", "arm-outcome", "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved'",
  "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'error'",
  "PUM expects error (hits enoent branch)")
M("M14", "arm-lib", "PUX: { lib: 'puppeteer'", "PUX: { lib: 'playwright'", "PUX lib swapped")
M("M15", "arm-cross", "PUS: { lib: 'puppeteer', cross: false", "PUS: { lib: 'puppeteer', cross: true", "PUS cross flipped")
M("M16", "arm-islocal", "PLL: { lib: 'playwright', cross: true, isLocal: true", "PLL: { lib: 'playwright', cross: true, isLocal: false", "PLL isLocal claim false")
M("M17", "arm-islocal", "PLX: { lib: 'playwright', cross: true, isLocal: false", "PLX: { lib: 'playwright', cross: true, isLocal: true", "PLX isLocal claim true")
M("M18", "arm-call", "PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload-then-clear'", "PUC: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload'", "PUC call claim upload")
M("M19", "arm-call", "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing'", "PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'upload'", "PUM call claim upload")
M("M20", "arm-call", "PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'missing'", "PLM: { lib: 'playwright', cross: true, isLocal: false, call: 'upload'", "PLM call claim upload")
M("M21", "literal", "const ANSWER = ['tabi-r97-answer.txt', 22];", "const ANSWER = ['tabi-r97-answer.txt', 23];", "answer size 22->23")
M("M22", "literal", "const ANSWER = ['tabi-r97-answer.txt', 22];", "const ANSWER = ['tabi-r97-answer.txt', 0];", "answer size 22->0")
M("M23", "literal", "const ANSWER = ['tabi-r97-answer.txt', 22];", "const ANSWER = ['tabi-r97-ANSWER.txt', 22];", "answer name case swap")
M("M24", "literal", "const MISSING = 'tabi-r97-missing.txt';", "const MISSING = 'tabi-r97-missing.tXt';", "missing basename changed")
M("M25", "literal", "const SCHEMA = 'tabi-client-oopif-uploadfile-r97';", "const SCHEMA = 'tabi-client-oopif-uploadfile-r96';", "schema pinned r96 string")
M("M26", "literal", "const CHROMIUM_TAG = '155.0.8059.84';", "const CHROMIUM_TAG = '155.0.8059.85';", "chromium tag bumped")
M("M27", "literal", "const BROWSER = 'Chrome/155.0.8059.84';", "const BROWSER = 'Chrome/155.0.8059.85';", "browser string bumped")

# ---- D. LIBS field drops / weakenings ----
M("M28", "libs", "treeFiles: 927", "treeFiles: 928", "puppeteer treeFiles +1")
M("M29", "libs", "treeFiles: 116", "treeFiles: 117", "playwright treeFiles +1")
M("M30", "libs", "treeSha256: '968a85e856058073407c713275a0d6d0352a2063711cb1bc1de367691cd1e180'", "treeSha256: '1111111111111111111111111111111111111111111111111111111111111111'", "puppeteer treeSha256 -> ones")
M("M31", "libs", "version: '25.16.0'", "version: '25.16.0.0'", "puppeteer version extended")
M("M32", "libs", "fileSha256: '162b71998ba1761786bbd9ee1a4f94e0d7f0efe2d339fcafc4490eba4e9b7c96'", "fileSha256: '0000000000000000000000000000000000000000000000000000000000000000'", "puppeteer fileSha256 -> zeros")
M("M33", "libs", "'puppeteer-core': { version: '25.16.0', integrity:", "'puppeteer-core': { integrity:", "drop puppeteer version field from pin")
M("M34", "libs", "treeFiles: 927, treeSha256:", "treeSha256:", "drop puppeteer treeFiles field from pin")

# ---- E. Receipt-level check drops / weakenings ----
M("M35", "check-drop", "check('schema', receipt.schema === SCHEMA, null, 'schema ' + receipt.schema);", "// schema check dropped", "drop schema check")
M("M36", "check-drop", "check('nonce', receipt.nonce === expectNonce, null, 'nonce ' + receipt.nonce + ' expected ' + expectNonce);", "// nonce check dropped", "drop nonce check")
M("M37", "check-drop", "check('cross-host', receipt.crossHost === 'localhost', null, 'crossHost ' + receipt.crossHost);", "// cross-host check dropped", "drop cross-host check")
M("M38", "check-drop", "check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG), null, 'chromium ' + receipt.chromium);", "// chromium check dropped", "drop chromium check")
M("M39", "check-drop", "check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }), null, 'answer ' + JSON.stringify(receipt.answer));", "// answer check dropped", "drop answer check")
M("M40", "check-drop", "check('reps', receipt.reps === reps, null, 'reps ' + receipt.reps + ' expected ' + reps);", "// reps check dropped", "drop reps check")
M("M41", "check-drop", "check('missing', !!missingPath && path.isAbsolute(missingPath) && path.basename(missingPath) === MISSING && receipt.missingExists === false, null, 'missingPath ' + receipt.missingPath + ' missingExists ' + receipt.missingExists);",
  "// missing check dropped", "drop missing check")
M("M42", "check-weak", "receipt.missingExists === false", "receipt.missingExists !== true", "missingExists false -> not-true")
M("M43", "check-weak", "path.isAbsolute(missingPath) &&", "true &&", "drop absolute-path requirement")
M("M44", "check-weak", "path.basename(missingPath) === MISSING", "path.basename(missingPath).length > 0", "basename check -> non-empty")
M("M45", "check-weak", "check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3, null, 'ports ' + JSON.stringify(receipt.ports));",
  "check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p)), null, 'ports ' + JSON.stringify(receipt.ports));",
  "ports range+distinct dropped")
M("M46", "check-drop", "check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want), null, 'legs ' + JSON.stringify(legs.map((l) => (isObj(l) ? l.leg : null))) + ' expected exactly ' + JSON.stringify(want));",
  "// leg-set dropped", "drop leg-set check")
M("M47", "check-weak", "eq(legs.map((l) => (isObj(l) ? l.leg : null)), want)", "new Set(legs.map((l) => (isObj(l) ? l.leg : null))).size === want.length",
  "leg-set exact order -> set-size only")
M("M48", "check-drop", "check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0, null, 'failures ' + JSON.stringify(receipt.failures) + ' legs with error ' + JSON.stringify(errLegs));",
  "// failures dropped", "drop failures check")
M("M49", "check-weak", "legs.filter((l) => isObj(l) && l.error !== null)", "legs.filter((l) => isObj(l) && l.error !== null && false)", "errLegs never counts")

# ---- F. Per-leg check drops / polarity ----
M("M50", "check-drop", "check('leg-label', !!m && ARM[m[1]] && l.arm === m[1] && l.rep === Number(m[2]), id, 'leg ' + id + ' arm ' + l.arm + ' rep ' + l.rep);",
  "// leg-label dropped", "drop leg-label check")
M("M51", "check-weak", "l.arm === m[1] && l.rep === Number(m[2])", "l.arm === m[1] || l.rep === Number(m[2])", "leg-label && -> ||")
M("M52", "check-drop", "check('leg-arm', l.lib === a.lib && l.cross === a.cross && l.isLocal === a.isLocal && l.call === a.call && l.childHost === childHost && l.childUrl === childUrl && l.parentUrl === parentUrl, id, 'lib ' + l.lib + ' cross ' + l.cross + ' isLocal ' + l.isLocal + ' call ' + l.call + ' childUrl ' + l.childUrl + ' parentUrl ' + l.parentUrl);",
  "// leg-arm dropped", "drop leg-arm check")
M("M53", "check-weak", "l.lib === a.lib && l.cross === a.cross && l.isLocal === a.isLocal && l.call === a.call", "l.lib === a.lib", "leg-arm keeps only lib")
M("M54", "check-drop", "check('browser', l.browserVersion === BROWSER && l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG), id, 'browser ' + l.browserVersion + ' client ' + l.clientBrowserVersion);",
  "// browser dropped", "drop browser check")
M("M55", "check-weak", "l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG)", "true", "drop client-version requirement")
M("M56", "check-drop", "check('frames', eq(l.frames, [parentUrl, childUrl]), id, 'frames ' + JSON.stringify(l.frames));", "// frames dropped", "drop frames check")
M("M57", "check-weak", "eq(l.frames, [parentUrl, childUrl])", "eq(l.frames, [childUrl, parentUrl])", "frames order inverted")
M("M58", "check-drop", "check('iframe-targets', !!its && (a.cross ? its.length === 1 && isObj(its[0]) && its[0].url === childUrl && typeof its[0].targetId === 'string' && its[0].targetId.length > 0 : its.length === 0), id, 'iframe targets ' + JSON.stringify(l.iframeTargets));",
  "// iframe-targets dropped", "drop iframe-targets check")
M("M59", "check-weak", "a.cross ? its.length === 1 && isObj(its[0]) && its[0].url === childUrl", "true ? its.length === 1 && isObj(its[0]) && its[0].url === childUrl",
  "same-site legs also require 1 iframe target")
M("M60", "check-drop", "check('parent-files', eq(l.parentFiles, []), id, 'parent #pp files ' + JSON.stringify(l.parentFiles));", "// parent-files dropped", "drop parent-files check")
M("M61", "check-drop", "check('child-files', eq(l.childFiles, wantFiles), id, 'child #s files ' + JSON.stringify(l.childFiles) + ' expected ' + JSON.stringify(wantFiles));",
  "// child-files dropped", "drop child-files check")
M("M63", "check-weak", "check('child-events', eq(l.childEvents, a.events), id, 'child #s events ' + JSON.stringify(l.childEvents) + ' expected ' + JSON.stringify(a.events));",
  "check('child-events', eq(l.childEvents, a.events.filter((e) => e[1])), id, 'child #s events ' + JSON.stringify(l.childEvents) + ' expected ' + JSON.stringify(a.events));",
  "only trusted events compared in child-events check")
M("M64", "check-weak", "check('child-files', eq(l.childFiles, wantFiles), id, 'child #s files ' + JSON.stringify(l.childFiles) + ' expected ' + JSON.stringify(wantFiles));",
  "check('child-files', eq(l.childFiles, wantFiles.filter((f) => f[1] > 0)), id, 'child #s files ' + JSON.stringify(l.childFiles) + ' expected ' + JSON.stringify(wantFiles));",
  "zero-byte files ignored in compare")
M("M65", "check-weak", "const wantFiles = a.files === 'answer' ? [ANSWER] : a.files === 'missing' ? [[MISSING, 0]] : [];",
  "const wantFiles = a.files === 'answer' ? [ANSWER] : a.files === 'missing' ? [[MISSING, 1]] : [];",
  "phantom size expected 1 not 0")

# ---- G. Outcome branch / ENOENT weakening ----
M("M66", "outcome", "check('outcome', l.outcome === 'resolved' && l.errName === null && l.errMessage === null, id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);",
  "check('outcome', l.outcome === 'resolved', id, 'outcome ' + l.outcome);", "resolved outcome ignores errName/Msg")
M("M67", "outcome", "check('outcome', l.outcome === 'error' && l.errName === 'Error' && !!missingPath && l.errMessage === \"ENOENT: no such file or directory, stat '\" + missingPath + \"'\", id, 'outcome ' + l.outcome + ' errName ' + l.errName + ' errMessage ' + l.errMessage);",
  "check('outcome', l.outcome === 'error' && l.errName === 'Error' && typeof l.errMessage === 'string' && l.errMessage.includes('ENOENT'), id, 'outcome ' + l.outcome);",
  "ENOENT exact message -> substring")
M("M68", "outcome", "l.errName === 'Error'", "l.errName === 'Err'", "errName literal weakened")
M("M69", "outcome", "l.outcome === 'error'", "l.outcome === 'resolved'", "enoent outcome literal -> resolved (battery plm-resolved?)")
M("M70", "outcome", "if (a.outcome === 'resolved') {", "if (a.outcome === 'enoent') {", "outcome branch swap")

# ---- H. FRESH-BROWSER + leg label/regex + live-only + harness polarity ----
M("M71", "fresh", "check('fresh-browser', ids.length > 0 && ids.every((b) => typeof b === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)) && new Set(ids).size === ids.length, null, 'browser ids ' + JSON.stringify(ids));",
  "// fresh-browser dropped", "drop fresh-browser check")
M("M72", "fresh", "new Set(ids).size === ids.length", "true", "fresh-browser distinctness dropped")
M("M73", "fresh", "/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)", "/^[0-9a-f-]+$/.test(b)", "uuid shape -> hex/dash only")
M("M74", "leg-label", "const m = /^(PUX|PUS|PUC|PUM|PLX|PLS|PLL|PLM)-([0-9]+)$/.exec(id || '');",
  "const m = /^(PUX|PUS|PUC|PUM|PLX|PLS|PLL|PLM)-([0-9]+)$/.exec(id || ''); // leg-label", "no-op comment (control: should survive trivially = invalid mutant)")
M("M75", "live", "check('driver-exit', driverRun.status === 0, null, 'driver exit status ' + driverRun.status);", "// driver-exit dropped",
  "drop driver-exit (live-only; --receipt battery cannot see it)")
M("M76", "live", "check('ports-bound', isObj(receipt.ports) && eq([receipt.ports.http, receipt.ports.child, receipt.ports.cdp], livePorts), null, 'receipt ports ' + JSON.stringify(receipt.ports) + ' vs --ports ' + JSON.stringify(livePorts));",
  "// ports-bound dropped", "drop ports-bound (live-only)")
M("M77", "live", "check('missing-bound', receipt.missingPath === liveMissing, null, 'receipt missingPath ' + receipt.missingPath + ' vs ' + liveMissing);",
  "// missing-bound dropped", "drop missing-bound (live-only)")
M("M78", "harness", "const check = (id, ok, leg, detail) => { checkCount++; if (!ok) findings.push({ id, leg, detail }); };",
  "const check = (id, ok, leg, detail) => { checkCount++; if (ok) findings.push({ id, leg, detail }); };", "invert finding polarity")
M("M79", "harness", "process.exit(findings.length ? 1 : 0);", "process.exit(findings.length ? 0 : 1);", "invert exit code")
M("M80", "harness", "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);", "const eq = (a, b) => JSON.stringify(a) == JSON.stringify(b);", "eq === -> ==")
M("M81", "libs", "check('libs', eq(receipt.libs, LIBS), null, 'libs ' + JSON.stringify(receipt.libs));", "// libs dropped", "drop libs check")
M("M82", "check-drop", "check('driver-pin', receipt.driverSha256 === pin && driverSha === pin, null, 'receipt driver ' + receipt.driverSha256 + ', file ' + driverSha + ', pin ' + pin);",
  "// driver-pin dropped", "drop driver-pin check")
M("M83", "arm-order", "const ARMS = ['PUX', 'PUS', 'PUC', 'PUM', 'PLX', 'PLS', 'PLL', 'PLM'];", "const ARMS = ['PUX', 'PUS', 'PUC', 'PUM', 'PLX', 'PLS', 'PLL', 'PLM', 'PUM'];",
  "ARMS duplicate PUM (leg-set want wrong)")
M("M84", "arm-order", "const ARM = {", "const ARM = { PUM: { lib: 'puppeteer', cross: true, isLocal: null, call: 'missing', outcome: 'resolved', files: 'missing', events: [U('input'), U('change')] },", "prepending a PUM entry (later wins? no: JS object literal later wins; this is shadowed)")

def run_battery(counter_path, scratch_dir):
    # counter_path lives in the per-mutant mirror; derive the lane from it
    # (<mirror>/scripts/check-... -> <mirror>).
    mirror_lane = os.path.dirname(os.path.dirname(counter_path))
    os.makedirs(scratch_dir, exist_ok=True)
    r = subprocess.run(
        ["node", BATTERY, "--lane", mirror_lane,
         "--receipt", RECEIPT, "--expect-nonce", NONCE,
         "--expect-driver-sha256", PIN, "--scratch", scratch_dir, "--json"],
        capture_output=True, text=True, timeout=120)
    try:
        out = json.loads(r.stdout)
    except Exception as e:
        return {"ok": False, "parse_error": str(e), "rc": r.returncode,
                "stdout_tail": r.stdout[-500:], "stderr_tail": r.stderr[-500:]}
    return {"ok": bool(out.get("ok") is True and r.returncode == 0),
            "rc": r.returncode, "cases": out.get("cases"), "ok_count": out.get("ok"),
            "failed": out.get("failed"), "results": out.get("results")}

def main():
    # sanity
    sha = hashlib.sha256(pristine.encode()).hexdigest()
    assert sha == "8571f6b9971b2f8785083169dd69a05e9214bf893f367eb93e954661a9cf0ee0", sha
    results = []
    survivors = []
    for (mid, cls, old, new, note) in MUTANTS:
        occ = pristine.count(old)
        rec = {"id": mid, "class": cls, "note": note, "old": old, "new": new,
               "occurrences": occ}
        if occ != 1:
            rec["verdict"] = "INVALID"
            rec["reason"] = f"old string found {occ} times (need exactly 1)"
            rec["sha256"] = None
            rec["battery"] = None
            results.append(rec)
            survivors.append(rec)
            continue
        mutant_src = pristine.replace(old, new)
        mutant_sha = hashlib.sha256(mutant_src.encode()).hexdigest()
        mpath = os.path.join(S, f"mut-{mid}.mjs")
        open(mpath, "w").write(mutant_src)
        # copy pristine counter aside per-mutant so battery points at mirror lane script:
        # battery derives counter path from --lane; simplest: temporarily swap.
        # We instead invoke the battery with a mutated --lane copy. Build a light mirror.
        mirror = os.path.join(S, f"mirror-{mid}")
        os.makedirs(os.path.join(mirror, "scripts"), exist_ok=True)
        os.makedirs(os.path.join(mirror, "corpus/evidence/round96/client-oopif-filechooser"), exist_ok=True)
        open(os.path.join(mirror, "scripts/check-client-oopif-uploadfile-round97.mjs"), "w").write(mutant_src)
        for f in ("client-oopif-uploadfile-round97.mjs", "negatives-client-oopif-uploadfile-round97.mjs"):
            srcp = os.path.join(LANE, "scripts", f)
            open(os.path.join(mirror, "scripts", f), "w").write(open(srcp).read())
        shutil_r96 = os.path.join(LANE, "corpus/evidence/round96/client-oopif-filechooser/receipt.json")
        open(os.path.join(mirror, "corpus/evidence/round96/client-oopif-filechooser/receipt.json"), "w").write(open(shutil_r96).read())
        bat = run_battery(os.path.join(mirror, "scripts/check-client-oopif-uploadfile-round97.mjs"),
                          os.path.join(S, f"bat-{mid}"))
        rec["sha256"] = mutant_sha
        rec["battery"] = {k: v for k, v in bat.items() if k != "results"}
        # find which battery cases failed for killed mutants
        if bat.get("failed"):
            rec["battery_failed"] = bat["failed"]
        if bat.get("ok"):
            rec["verdict"] = "SURVIVED"
            survivors.append(rec)
        else:
            rec["verdict"] = "KILLED"
        results.append(rec)
        print(f"{mid} {rec['verdict']} ok_count={bat.get('ok_count')}/{bat.get('cases')} failed={bat.get('failed')}")
    # restore pristine mirror
    open(PRISTINE, "w").write(pristine)
    payload = {"seat": "R97Mut", "pristine_sha256": pristine_sha,
               "total": len(results),
               "survived": sum(1 for r in results if r["verdict"] == "SURVIVED"),
               "killed": sum(1 for r in results if r["verdict"] == "KILLED"),
               "invalid": sum(1 for r in results if r["verdict"] == "INVALID"),
               "survivors": [r["id"] for r in results if r["verdict"] == "SURVIVED"],
               "results": results}
    open(RESULTS_OUT, "w").write(json.dumps(payload, indent=1))
    print(f"survived={payload['survived']} killed={payload['killed']} invalid={payload['invalid']} total={payload['total']}")
    print("survivors:", payload["survivors"])

if __name__ == "__main__":
    main()
