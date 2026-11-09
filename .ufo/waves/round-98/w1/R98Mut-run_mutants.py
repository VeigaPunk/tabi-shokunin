#!/usr/bin/env python3
import subprocess, json, os, re, sys, hashlib, copy, shutil

S = "/fast/scratch/hyaku/tabi-r98/R98Mut"
LANE = S + "/lane"
COUNTER = LANE + "/scripts/check-client-oopif-uploadmodes-round98.mjs"
BATTERY = LANE + "/scripts/negatives-client-oopif-uploadmodes-round98.mjs"
RECEIPT = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-98/controls/receipt-positive.json"
PIN = "f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2"
NONCE = "tabi-r98-ctl-positive"
W1 = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-98/w1"
BATT_TMP = S + "/batt"
os.makedirs(BATT_TMP, exist_ok=True)
orig = open(COUNTER).read()
orig_sha = hashlib.sha256(orig.encode()).hexdigest()

# each mutant: (name, exact_search, replacement)
M = []
def add(name, a, b):
    M.append((name, a, b))

# T/U helpers
add("swap-T-trusted", "const T = (t) => [t, true];", "const T = (t) => [t, false];")
add("swap-U-untrusted", "const U = (t) => [t, false];", "const U = (t) => [t, true];")
add("swap-TU-both-1", "const T = (t) => [t, true];\nconst U = (t) => [t, false];", "const T = (t) => [t, false];\nconst U = (t) => [t, true];")
# ARM event swaps per arm
add("PUA-events-untrusted", "PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] }", "PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [U('input'), U('change')], read: ['ok', ANSWER.text] }")
add("PLA-events-untrusted", "PLA: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] }", "PLA: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [U('input'), U('change')], read: ['ok', ANSWER.text] }")
add("PLAB-events-trusted", "PLAB: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [U('input'), U('change')], read: ['ok', PAYLOAD.text] }", "PLAB: { lib: 'playwright', mode: 'launch', isLocal: null, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [T('input'), T('change')], read: ['ok', PAYLOAD.text] }")
add("PLB-events-trusted", "PLB: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [U('input'), U('change')], read: ['ok', PAYLOAD.text] }", "PLB: { lib: 'playwright', mode: 'connect', isLocal: false, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [T('input'), T('change')], read: ['ok', PAYLOAD.text] }")
add("PLLB-events-trusted", "PLLB: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [U('input'), U('change')], read: ['ok', PAYLOAD.text] }", "PLLB: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'payload', outcome: 'resolved', files: F_PAYLOAD, events: [T('input'), T('change')], read: ['ok', PAYLOAD.text] }")
add("PLL-events-untrusted", "PLL: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] }", "PLL: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [U('input'), U('change')], read: ['ok', ANSWER.text] }")
add("PUR-events-untrusted", "PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing', outcome: 'resolved', files: [[MISSING, 0, 'text/plain']], events: [T('input'), T('change')], read: NOT_FOUND }", "PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing', outcome: 'resolved', files: [[MISSING, 0, 'text/plain']], events: [U('input'), U('change')], read: NOT_FOUND }")
add("PUA-events-input-only", "PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input'), T('change')], read: ['ok', ANSWER.text] }", "PUA: { lib: 'puppeteer', mode: 'launch', isLocal: null, input: 'path', outcome: 'resolved', files: F_ANSWER, events: [T('input')], read: ['ok', ANSWER.text] }")
add("PLLM-events-input", "PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: [], events: [], read: null }", "PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: [], events: [T('input'), T('change')], read: null }")
add("PUR-events-empty", "PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing', outcome: 'resolved', files: [[MISSING, 0, 'text/plain']], events: [T('input'), T('change')], read: NOT_FOUND }", "PUR: { lib: 'puppeteer', mode: 'connect', isLocal: null, input: 'missing', outcome: 'resolved', files: [[MISSING, 0, 'text/plain']], events: [], read: NOT_FOUND }")
# size/type/read text
add("ANSWER-size-23", "const ANSWER = { name: 'tabi-r98-answer.txt', size: 22,", "const ANSWER = { name: 'tabi-r98-answer.txt', size: 23,")
add("PAYLOAD-size-30", "const PAYLOAD = { name: 'tabi-r98-payload.txt', size: 29,", "const PAYLOAD = { name: 'tabi-r98-payload.txt', size: 30,")
add("ANSWER-type-octet", "const F_ANSWER = [[ANSWER.name, ANSWER.size, 'text/plain']];", "const F_ANSWER = [[ANSWER.name, ANSWER.size, 'application/octet-stream']];")
add("PAYLOAD-type-octet", "const F_PAYLOAD = [[PAYLOAD.name, PAYLOAD.size, PAYLOAD.mimeType]];", "const F_PAYLOAD = [[PAYLOAD.name, PAYLOAD.size, 'application/octet-stream']];")
add("ANSWER-text-perturb", "text: 'tabi round 98 answer.\\n' };", "text: 'tabi round 98 answerX\\n' };")
add("PAYLOAD-text-perturb", "text: 'tabi round 98 payload bytes.\\n' };", "text: 'tabi round 98 payload bytesX\\n' };")
add("ANSWER-name-perturb", "const ANSWER = { name: 'tabi-r98-answer.txt',", "const ANSWER = { name: 'tabi-r98-answer2.txt',")
add("PAYLOAD-name-perturb", "const PAYLOAD = { name: 'tabi-r98-payload.txt',", "const PAYLOAD = { name: 'tabi-r98-payload2.txt',")
add("PUR-size-1", "files: [[MISSING, 0, 'text/plain']]", "files: [[MISSING, 1, 'text/plain']]")
add("PUR-name-perturb", "const MISSING = 'tabi-r98-missing.txt';", "const MISSING = 'tabi-r98-missingX.txt';")
add("PLLM-files-payload", "PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: [], events: [], read: null }", "PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: F_PAYLOAD, events: [], read: null }")
add("PLLM-read-ok-empty", "PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: [], events: [], read: null }", "PLLM: { lib: 'playwright', mode: 'connect', isLocal: true, input: 'missing', outcome: 'enoent', files: [], events: [], read: ['ok', ''] }")
# NOT_FOUND / ENOENT
add("NOTFOUND-msg-drop", "'A requested file or directory could not be found at the time an operation was processed.'", "'not found'")
add("NOTFOUND-name-swapped", "['err', 'NotFoundError',", "['err', 'NotReadableError',")
add("ENOENT-prefix-drop", "l.errMessage === \"ENOENT: no such file or directory, stat '\" + missingPath + \"'\"", "l.errMessage === \"no such file or directory, stat '\" + missingPath + \"'\"")
add("ENOENT-errname-drop", "l.outcome === 'error' && l.errName === 'Error'", "l.outcome === 'error' && true")
add("ENOENT-no-missingpath-guard", "!!missingPath && l.errMessage ===", "l.errMessage ===")
add("ENOENT-drop-message", "&& l.errMessage === \"ENOENT: no such file or directory, stat '\" + missingPath + \"'\"", "")
# checks dropped / inverted
add("drop-child-events", "check('child-events', eq(l.childEvents, a.events)", "check('child-events', true")
add("drop-child-files", "check('child-files', eq(l.childFiles, a.files)", "check('child-files', true")
add("drop-child-read", "check('child-read', eq(l.childRead, a.read)", "check('child-read', true")
add("drop-parent-files", "check('parent-files', eq(l.parentFiles, [])", "check('parent-files', true")
add("drop-frames", "check('frames', eq(l.frames, [parentUrl, childUrl])", "check('frames', true")
add("drop-outcome", "check('outcome', l.outcome === 'resolved' && l.errName === null && l.errMessage === null", "check('outcome', true")
add("drop-outcome-enoent-branch", "check('outcome', l.outcome === 'error' && l.errName === 'Error'", "check('outcome', l.outcome === 'error'")
add("drop-leg-arm", "check('leg-arm', l.lib === a.lib && l.mode === a.mode && l.isLocal === a.isLocal && l.input === a.input", "check('leg-arm', true && false && false && false && false && false && false && false && false && false || (l.lib === a.lib && l.mode === a.mode && l.isLocal === a.isLocal && l.input === a.input")
# simpler drop via direct replacement done below for remaining (use substring of full lines where needed)
add("drop-browser", "check('browser', l.browserVersion === BROWSER", "check('browser', true")
add("drop-iframe-targets", "check('iframe-targets', !!its && its.length === 1", "check('iframe-targets', !!its && true")
add("drop-leg-label", "check('leg-label', !!m && ARM[m[1]] && l.arm === m[1] && l.rep === Number(m[2])", "check('leg-label', true")
add("ignore-lib-mode", "l.lib === a.lib && l.mode === a.mode", "true && true")
add("ignore-isLocal", "l.isLocal === a.isLocal", "true")
add("ignore-input", "l.input === a.input", "true")
add("ignore-childUrl", "l.childUrl === childUrl", "true")
add("ignore-parentUrl", "l.parentUrl === parentUrl", "true")
# top-level
add("drop-schema", "check('schema', receipt.schema === SCHEMA", "check('schema', true")
add("drop-nonce", "check('nonce', receipt.nonce === expectNonce", "check('nonce', true")
add("drop-driver-pin", "check('driver-pin', receipt.driverSha256 === pin && driverSha === pin", "check('driver-pin', true")
add("drop-chromium", "check('chromium', typeof receipt.chromium === 'string' && receipt.chromium.includes(CHROMIUM_TAG)", "check('chromium', true")
add("drop-reps", "check('reps', receipt.reps === reps", "check('reps', true")
add("drop-libs", "check('libs', eq(receipt.libs, LIBS)", "check('libs', true")
add("drop-answer", "check('answer', eq(receipt.answer, ANSWER)", "check('answer', true")
add("drop-payload", "check('payload', eq(receipt.payload, PAYLOAD)", "check('payload', true")
add("drop-missing", "check('missing', !!missingPath && path.isAbsolute(missingPath) && path.basename(missingPath) === MISSING && receipt.missingExists === false", "check('missing', true")
add("drop-missing-exists-only", "&& receipt.missingExists === false", "")
add("drop-missing-absname", "path.isAbsolute(missingPath) && path.basename(missingPath) === MISSING", "true")
add("drop-ports", "check('ports', [ports.http, ports.child, ports.cdp].every", "check('ports', true || [ports.http, ports.child, ports.cdp].every")
add("drop-leg-set", "check('leg-set', eq(legs.map", "check('leg-set', true || eq(legs.map")
add("drop-failures", "check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0", "check('failures', true")
add("drop-failures-legerr-leg", "check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0", "check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0")
add("drop-failures-list", "check('failures', Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0", "check('failures', true && errLegs.length === 0 || (Array.isArray(receipt.failures) && receipt.failures.length === 0 && errLegs.length === 0)")
add("drop-fresh-browser", "check('fresh-browser', ids.length > 0", "check('fresh-browser', true || ids.length > 0")
# ports bounds
add("ports-lb-1023", "p >= 1024 && p <= 65535", "p >= 1023 && p <= 65535")
add("ports-ub-65536", "p >= 1024 && p <= 65535", "p >= 1024 && p <= 65536")
add("ports-distinct-drop", "&& new Set([ports.http, ports.child, ports.cdp]).size === 3", "")
add("ports-int-drop", "Number.isInteger(p) &&", "true &&")
# libs subfields
add("pp-version-drop", "version: '25.16.0'", "version: '25.15.0'")
add("pw-version-drop", "version: '1.65.0'", "version: '1.64.0'")
add("pp-treefiles-928", "treeFiles: 927", "treeFiles: 928")
add("pw-treefiles-117", "treeFiles: 116", "treeFiles: 117")
# outcome polarity
add("resolved-errcheck-invert", "l.outcome === 'resolved' && l.errName === null && l.errMessage === null", "l.outcome === 'resolved'")
add("enoent-outcome-invert", "l.outcome === 'error' && l.errName === 'Error'", "l.outcome === 'resolved' && l.errName === 'Error'")
# iframe targets
add("iframe-len-2", "its.length === 1", "its.length === 2")
add("iframe-url-drop", "its[0].url === childUrl", "true")
add("iframe-null-ok", "!!its && its.length === 1", "true || (its.length === 1)")
# browser lib swap in version check
add("clientbrowser-lib-swap", "a.lib === 'puppeteer' ? BROWSER : CHROMIUM_TAG", "a.lib === 'puppeteer' ? CHROMIUM_TAG : BROWSER")
# fresh browser regex / distinct
add("fresh-browser-distinct-drop", "&& new Set(ids).size === ids.length", "")
add("fresh-browser-uuid-drop", "/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(b)", "true")
add("fresh-browser-length-drop", "ids.length > 0", "true")
# live-only
add("live-driver-exit-drop", "check('driver-exit', driverRun.status === 0", "check('driver-exit', true")
add("live-ports-bound-drop", "check('ports-bound', isObj(receipt.ports)", "check('ports-bound', true")
add("live-missing-bound-drop", "check('missing-bound', receipt.missingPath === liveMissing", "check('missing-bound', true")
# final verdict polarity
add("verdict-invert", "verdict: findings.length ? 'findings' : 'clean'", "verdict: findings.length ? 'clean' : 'findings'")
add("exit-invert", "process.exit(findings.length ? 1 : 0);", "process.exit(findings.length ? 0 : 1);")

results = []
# verify baseline battery count
print(f"mutants: {len(M)} orig_sha={orig_sha}")

for name, a, b in M:
    n = orig.count(a)
    if n != 1:
        results.append({"mutant": name, "anchor_count": n, "verdict": "setup", "detail": f"anchor found {n} times, needs exactly 1", "edit": f"- {a}\n+ {b}"})
        print(f"SKIP {name} anchor={n}")
        continue
    mutant = orig.replace(a, b)
    mpath = S + "/mut/" + name + ".mjs"
    os.makedirs(os.path.dirname(mpath), exist_ok=True)
    open(mpath, "w").write(mutant)
    # run battery with counter=mutant: battery hardcodes counter path; run battery in a per-mutant lane copy
    mlane = S + "/mlane/" + name
    shutil.rmtree(mlane, ignore_errors=True)
    os.makedirs(mlane + "/scripts", exist_ok=True)
    os.makedirs(mlane + "/corpus/evidence/round97/client-oopif-uploadfile", exist_ok=True)
    shutil.copy(COUNTER, mlane + "/scripts/check-client-oopif-uploadmodes-round98.mjs")
    open(mlane + "/scripts/check-client-oopif-uploadmodes-round98.mjs", "w").write(mutant)
    shutil.copy(BATTERY, mlane + "/scripts/negatives-client-oopif-uploadmodes-round98.mjs")
    shutil.copy(LANE + "/scripts/client-oopif-uploadmodes-round98.mjs", mlane + "/scripts/client-oopif-uploadmodes-round98.mjs")
    shutil.copy(S + "/lane/corpus/evidence/round97/client-oopif-uploadfile/receipt.json", mlane + "/corpus/evidence/round97/client-oopif-uploadfile/receipt.json")
    shutil.copy(RECEIPT, mlane + "/receipt-positive.json")
    r = subprocess.run(["node", mlane + "/scripts/negatives-client-oopif-uploadmodes-round98.mjs", "--lane", mlane, "--receipt", "receipt-positive.json", "--expect-nonce", NONCE, "--expect-driver-sha256", PIN, "--scratch", BATT_TMP + "/" + name, "--json"], capture_output=True, text=True, timeout=300)
    try:
        out = json.loads(r.stdout)
    except Exception as e:
        results.append({"mutant": name, "verdict": "setup", "edit": f"- {a}\n+ {b}", "battery_rc": r.returncode, "stdout_tail": r.stdout[-500:], "stderr_tail": r.stderr[-500:]})
        print(f"SETUP {name} rc={r.returncode}")
        continue
    failed = out.get("failed", [])
    # positive case is base; battery ok count
    if r.returncode == 0:
        # may be whitelisted trivial (mutant didn't change battery-relevant behavior and positive still passes) => survivor
        # but also if battery passed because never invoked? check cases count
        results.append({"mutant": name, "verdict": "survived", "edit": f"- {a}\n+ {b}", "battery_rc": r.returncode, "cases": out.get("cases"), "ok": out.get("ok")})
        print(f"SURVIVED {name}")
    else:
        results.append({"mutant": name, "verdict": "killed", "edit": f"- {a}\n+ {b}", "battery_rc": r.returncode, "failed_cases": failed})
        print(f"KILLED {name} failed={failed}")

# summary
surv = [x for x in results if x.get("verdict")=="survived"]
killed = [x for x in results if x.get("verdict")=="killed"]
setup = [x for x in results if x.get("verdict")=="setup"]
print(f"killed={len(killed)} survived={len(surv)} setup={len(setup)} total={len(results)}")
json.dump({"orig_sha256": orig_sha, "pin": PIN, "receipt": RECEIPT, "nonce": NONCE, "total": len(results), "killed": len(killed), "survived": len(surv), "setup": len(setup), "results": results}, open(W1+"/R98Mut-results.json","w"), indent=2)
