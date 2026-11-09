#!/usr/bin/env python3
"""R96Mut: mutation sweep of the frozen counter vs the frozen battery."""
import json, hashlib, subprocess, sys, os

S = "/fast/scratch/hyaku/tabi-r96/R96Mut"
LANE = f"{S}/lane"
COUNTER = f"{LANE}/scripts/check-client-oopif-chooser-round96.mjs"
PRISTINE = f"{S}/pristine-counter.mjs"
BATTERY = f"{LANE}/scripts/negatives-client-oopif-chooser-round96.mjs"
POS = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-96/controls/receipt-positive.json"
PIN = "4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91"
NONCE = "tabi-r96-ctl-positive"

def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()

PRISTINE_SHA = sha(COUNTER)
open(PRISTINE, "wb").write(open(COUNTER, "rb").read())
SRC = open(COUNTER, "r", encoding="utf-8").read()

MUTANTS = [
 ("M01-timeout-ms-30000", "const TIMEOUT_MS = 3000;", "const TIMEOUT_MS = 30000;", 1),
 ("M02-pp-msg-period", "Waiting for `FileChooser` failed: 3000ms exceeded'", "Waiting for `FileChooser` failed: 3000ms exceeded.'", 1),
 ("M03-chromium-tag", "const CHROMIUM_TAG = '155.0.8059.84';", "const CHROMIUM_TAG = '155.0.8059.85';", 1),
 ("M04-browser-str", "const BROWSER = 'Chrome/155.0.8059.84';", "const BROWSER = 'Chrome/155.0.8059.85';", 1),
 ("M05-answer-size", "const ANSWER = ['tabi-r96-answer.txt', 22];", "const ANSWER = ['tabi-r96-answer.txt', 23];", 1),
 ("M06-pp-lib-version", "version: '25.16.0'", "version: '25.15.0'", 1),
 ("M07-pw-integrity", "sha512-vNSKgH6YqtN7cdT", "sha512-vNSKgH6ZqtN7cdT", 1),
 ("M08-pp-filesha", "fileSha256: '31a522df2d59bba82e92a8", "fileSha256: '31a522de2d59bba82e92a", 1),
 ("M09-schema-r97", "const SCHEMA = 'tabi-client-oopif-chooser-r96';", "const SCHEMA = 'tabi-client-oopif-chooser-r97';", 1),
 ("M10-arm-ppx-chooser", "PPX: { lib: 'puppeteer', cross: true, witness: false, chooser: false }", "PPX: { lib: 'puppeteer', cross: true, witness: false, chooser: true }", 1),
 ("M11-arm-ppw-witness", "PPW: { lib: 'puppeteer', cross: true, witness: true, chooser: false }", "PPW: { lib: 'puppeteer', cross: true, witness: false, chooser: false }", 1),
 ("M12-arm-pps-chooser", "PPS: { lib: 'puppeteer', cross: false, witness: false, chooser: true }", "PPS: { lib: 'puppeteer', cross: false, witness: false, chooser: false }", 1),
 ("M13-arm-pwx-cross", "PWX: { lib: 'playwright', cross: true, witness: false, chooser: true }", "PWX: { lib: 'playwright', cross: false, witness: false, chooser: true }", 1),
 ("M14-arm-pws-lib", "PWS: { lib: 'playwright', cross: false, witness: false, chooser: true }", "PWS: { lib: 'puppeteer', cross: false, witness: false, chooser: true }", 1),
 ("M15-drop-schema", "check('schema', receipt.schema === SCHEMA,", "check('schema', true,", 1),
 ("M16-drop-nonce", "check('nonce', receipt.nonce === expectNonce,", "check('nonce', true,", 1),
 ("M17-drop-driver-pin", "check('driver-pin', receipt.driverSha256 === pin && driverSha === pin,", "check('driver-pin', true,", 1),
 ("M18-drop-chromium", "check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG),", "check('chromium', true,", 1),
 ("M19-drop-cross-host", "check('cross-host', receipt.crossHost === 'localhost',", "check('cross-host', true,", 1),
 ("M20-drop-reps", "check('reps', receipt.reps === reps,", "check('reps', true,", 1),
 ("M21-drop-timeout", "check('timeout', receipt.timeoutMs === TIMEOUT_MS,", "check('timeout', true,", 1),
 ("M22-drop-libs", "check('libs', eq(receipt.libs, LIBS),", "check('libs', true,", 1),
 ("M23-drop-answer", "check('answer', eq(receipt.answer, { name: ANSWER[0], size: ANSWER[1] }),", "check('answer', true,", 1),
 ("M24-drop-ports", "check('ports', [ports.http, ports.child, ports.cdp].every((p) => Number.isInteger(p) && p >= 1024 && p <= 65535) && new Set([ports.http, ports.child, ports.cdp]).size === 3,", "check('ports', true,", 1),
 ("M25-drop-leg-set", "check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want),", "check('leg-set', true,", 1),
 ("M26-drop-failures", "check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0,", "check('failures', true,", 1),
 ("M27-drop-fresh-browser", "check('fresh-browser', ids.length > 0 && ids.every((b) => typeof b === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)) && new Set(ids).size === ids.length,", "check('fresh-browser', true,", 1),
 ("M28-drop-driver-exit-LIVE", "check('driver-exit', driverRun.status === 0,", "check('driver-exit', true,", 1),
 ("M29-drop-ports-bound-LIVE", "check('ports-bound', isObj(receipt.ports) && eq([receipt.ports.http, receipt.ports.child, receipt.ports.cdp], livePorts),", "check('ports-bound', true,", 1),
 ("M30-drop-leg-arm", "check('leg-arm', l.lib === a.lib && l.cross === a.cross && l.witness === a.witness && l.childHost === childHost && l.childUrl === childUrl && l.parentUrl === parentUrl,", "check('leg-arm', true,", 1),
 ("M31-drop-browser", "check('browser', l.browserVersion === BROWSER && l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG),", "check('browser', true,", 1),
 ("M32-drop-frames", "check('frames', eq(l.frames, [parentUrl, childUrl]),", "check('frames', true,", 1),
 ("M33-drop-iframe-targets", "check('iframe-targets', !!its && (a.cross ? its.length === 1 && isObj(its[0]) && its[0].url === childUrl && typeof its[0].targetId === 'string' && its[0].targetId.length > 0 : its.length === 0),", "check('iframe-targets', true,", 1),
 ("M34-drop-click", "check('click', eq(l.childClicks, [['s', true]]),", "check('click', true,", 1),
 ("M35-drop-parent-files", "check('parent-files', eq(l.parentFiles, []),", "check('parent-files', true,", 1),
 ("M36-drop-pp-timeout", "check('pp-timeout', l.outcome === 'timeout' && l.errName === 'TimeoutError' && l.errMessage === PP_TIMEOUT_MSG && l.chooserMultiple === null && l.chooserElementId === null,", "check('pp-timeout', true,", 1),
 ("M37-drop-chooser", "check('chooser', l.outcome === 'chooser' && l.errName === null && l.errMessage === null && l.chooserMultiple === false && l.chooserElementId === (a.lib === 'playwright' ? 's' : null),", "check('chooser', true,", 1),
 ("M38-drop-child-files-timeout", "check('child-files', eq(l.childFiles, []),", "check('child-files', true,", 1),
 ("M39-drop-child-files-chooser", "check('child-files', eq(l.childFiles, [ANSWER]),", "check('child-files', true,", 1),
 ("M40-drop-witness", "check('witness', isObj(l.witnessIntercept) && typeof tid === 'string' && l.witnessIntercept.targetId === tid && !!ev && ev.length === 1 && isObj(ev[0]) && ev[0].mode === 'selectSingle' && isPosInt(ev[0].backendNodeId) && ev[0].frameId === tid,", "check('witness', true,", 1),
 ("M41-drop-no-witness", "check('no-witness', l.witnessIntercept === null && l.witnessEvents === null,", "check('no-witness', true,", 1),
 ("M42-drop-leg-label", "check('leg-label', !!m && ARM[m[1]] && l.arm === m[1] && l.rep === Number(m[2]),", "check('leg-label', true,", 1),
 ("M43-eq-loose", "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);", "const eq = (a, b) => a == b;", 1),
 ("M44-eq-true", "const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);", "const eq = (a, b) => true;", 1),
 ("M45-isPosInt-geq0", "const isPosInt = (n) => Number.isInteger(n) && n > 0;", "const isPosInt = (n) => Number.isInteger(n) && n >= 0;", 1),
 ("M46-witness-frameid", "ev[0].frameId === tid", "true", 1),
 ("M47-witness-count-geq1", "ev.length === 1", "ev.length >= 1", 1),
 ("M48-witness-mode", "ev[0].mode === 'selectSingle'", "true", 1),
 ("M49-witness-targetid", "l.witnessIntercept.targetId === tid", "true", 1),
 ("M50-witness-backend", "isPosInt(ev[0].backendNodeId)", "true", 1),
 ("M51-pp-accept-error", "check('pp-timeout', l.outcome === 'timeout'", "check('pp-timeout', (l.outcome === 'timeout' || l.outcome === 'error')", 1),
 ("M52-pp-errname", "l.errName === 'TimeoutError'", "true", 1),
 ("M53-pp-errmsg", "l.errMessage === PP_TIMEOUT_MSG", "true", 1),
 ("M54-chooser-errnulls", "l.errName === null && l.errMessage === null", "true", 1),
 ("M55-chooser-element", "l.chooserElementId === (a.lib === 'playwright' ? 's' : null)", "true", 1),
 ("M56-ports-range0", "p >= 1024 && p <= 65535", "p >= 0 && p <= 65535", 1),
 ("M57-ports-distinct", "new Set([ports.http, ports.child, ports.cdp]).size === 3", "true", 1),
 ("M58-failures-errlegs", "errLegs.length === 0", "true", 1),
 ("M59-freshbrowser-unique", "new Set(ids).size === ids.length", "true", 1),
 ("M60-iframe-count-geq1", "its.length === 1 && isObj(its[0])", "its.length >= 1 && isObj(its[0])", 1),
 ("M61-click-first-only", "check('click', eq(l.childClicks, [['s', true]]),", "check('click', Array.isArray(l.childClicks) && eq(l.childClicks[0], ['s', true]),", 1),
 ("M62-legset-sort", "check('leg-set', eq(legs.map((l) => (isObj(l) ? l.leg : null)), want),", "check('leg-set', eq([...legs.map((l) => (isObj(l) ? l.leg : null))].sort(), [...want].sort()),", 1),
 ("M63-leglabel-pwz", "/^(PPX|PPW|PPS|PWX|PWS)-([0-9]+)$/", "/^(PPX|PPW|PPS|PWX|PWS|PWZ)-([0-9]+)$/", 1),
 ("M64-browser-ternary-flip", "l.clientBrowserVersion === (a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG)", "l.clientBrowserVersion === (a.lib === 'puppeteer' ? CHROMIUM_TAG : BROWSER)", 1),
 ("M65-chooser-accept-error", "check('chooser', l.outcome === 'chooser'", "check('chooser', (l.outcome === 'chooser' || l.outcome === 'error')", 1),
 ("M66-childfiles-count-only", "check('child-files', eq(l.childFiles, [ANSWER]),", "check('child-files', Array.isArray(l.childFiles) && l.childFiles.length === 1,", 1),
 ("M67-pp-multiple-checks", "l.chooserMultiple === null && l.chooserElementId === null", "true", 1),
 ("M68-flip-schema", "check('schema', receipt.schema === SCHEMA,", "check('schema', receipt.schema !== SCHEMA,", 1),
 ("M69-flip-nonce", "check('nonce', receipt.nonce === expectNonce,", "check('nonce', receipt.nonce !== expectNonce,", 1),
 ("M70-reps-offbyone", "for (let r = 1; r <= reps; r++) for (const a of ARMS) want.push(a + '-' + r);", "for (let r = 1; r <= reps + 1; r++) for (const a of ARMS) want.push(a + '-' + r);", 1),
]

results = []
for mid, old, new, cnt in MUTANTS:
    if old not in SRC:
        results.append({"mutant": mid, "verdict": "INAPPLICABLE", "old_not_found": old[:80]})
        continue
    assert SRC.count(old) >= cnt, mid
    mutated = SRC.replace(old, new, cnt)
    open(COUNTER, "w", encoding="utf-8").write(mutated)
    msha = sha(COUNTER)
    scratch = f"{S}/battery/{mid}"
    r = subprocess.run(["node", BATTERY, "--lane", LANE, "--receipt", POS, "--expect-nonce", NONCE,
                        "--expect-driver-sha256", PIN, "--scratch", scratch, "--json"],
                       capture_output=True, text=True)
    try:
        out = json.loads(r.stdout)
        failed = out.get("failed", [])
        ok = out.get("ok"); total = out.get("cases")
    except Exception:
        out, failed, ok, total = None, ["<unparseable>"], None, None
    # positive-only probe
    p = subprocess.run(["node", COUNTER, "--lane", LANE, "--expect-driver-sha256", PIN, "--receipt", POS,
                        "--expect-nonce", NONCE, "--json"], capture_output=True, text=True)
    pos_ok = (p.returncode == 0)
    if failed and "positive" in failed:
        verdict = "POSITIVE-BREAK"
    elif r.returncode == 1:
        verdict = "KILLED"
    elif r.returncode == 0:
        verdict = "SURVIVED"
    else:
        verdict = f"ERROR-rc{r.returncode}"
    results.append({"mutant": mid, "verdict": verdict, "battery_rc": r.returncode,
                    "battery_ok": ok, "battery_cases": total, "failed_cases": failed,
                    "positive_clean": pos_ok, "before_sha": PRISTINE_SHA, "after_sha": msha})
    print(f"{mid}: {verdict} rc={r.returncode} ok={ok}/{total} failed={failed} pos={pos_ok}", flush=True)

# restore
open(COUNTER, "wb").write(open(PRISTINE, "rb").read())
after = sha(COUNTER)
summary = {"pristine_sha": PRISTINE_SHA, "restored_sha": after, "restored_ok": after == PRISTINE_SHA,
           "results": results}
json.dump(summary, open(f"{S}/mutant-results.json", "w"), indent=2)
from collections import Counter
print(Counter(r["verdict"] for r in results))
print("restored_ok:", after == PRISTINE_SHA, after)
