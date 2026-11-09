#!/usr/bin/env python3
"""R99Scribe: re-derive every factual sentence of the round-99 knowledge note from the
scored live receipt, one assertion per sentence, with the leg ids that carry it.

Input : <lane>/.ufo/waves/round-99/scored/live-receipt.json
Output: JSON summary on stdout (also saved next to this script as R99Scribe-facts.json)
"""
import hashlib
import json
import pathlib
import sys

LANE = pathlib.Path("/home/vgpnk/Projects/shokunin/tabi-shokunin")
RECEIPT = LANE / ".ufo/waves/round-99/scored/live-receipt.json"
COMMITTED = LANE / "corpus/evidence/round99/client-oopif-uploadsets/receipt.json"

NF = ["err", "NotFoundError",
      "A requested file or directory could not be found at the time an operation was processed."]
BIN_SHA = hashlib.sha256(bytes(range(256))).hexdigest()

checks = []


def ck(fact, ok, legs, detail=""):
    checks.append({"fact": fact, "ok": bool(ok), "legs": legs, "detail": detail})


r = json.loads(RECEIPT.read_text())
legs = {l["leg"]: l for l in r["legs"]}
arm = lambda a: sorted([k for k in legs if k.rsplit("-", 1)[0] == a])
rep = lambda a: [f"{a}-{i}" for i in (1, 2, 3)]

# --- receipt identity -------------------------------------------------------
ck("scored receipt sha256 == committed receipt sha256",
   hashlib.sha256(RECEIPT.read_bytes()).hexdigest() == hashlib.sha256(COMMITTED.read_bytes()).hexdigest(),
   [], "scored/live-receipt.json and corpus/evidence/round99/.../receipt.json are byte-identical")
ck("24 legs, 8 arms x 3 reps, order PUAM,PLAM,PLBX,PLBM,PLBN,PLLP,PUCM,PUCN per rep",
   [l["leg"] for l in r["legs"]] == [f"{a}-{i}" for i in (1, 2, 3)
                                     for a in ("PUAM", "PLAM", "PLBX", "PLBM", "PLBN", "PLLP", "PUCM", "PUCN")],
   [], "receipt.legs order")
ck("reps == 3, failures empty, no leg carries an error",
   r["reps"] == 3 and r["failures"] == [] and all(l["error"] is None for l in r["legs"]),
   [], "receipt.reps / failures / leg.error")
ck("24 distinct UUID-shaped browser ids, one browser per leg",
   len({l["browserId"] for l in r["legs"]}) == 24 and
   all(len(l["browserId"]) == 36 for l in r["legs"]),
   [], "receipt.legs[].browserId")
ck("every leg: DevTools Browser == Chrome/155.0.8059.84",
   all(l["browserVersion"] == "Chrome/155.0.8059.84" for l in r["legs"]),
   [], "receipt.legs[].browserVersion")
ck("every leg: exactly one iframe target (the child URL), frames == [parent, child]",
   all(len(l["iframeTargets"]) == 1 and l["iframeTargets"][0]["url"] == l["childUrl"]
       and l["frames"] == [l["parentUrl"], l["childUrl"]] for l in r["legs"]),
   [], "receipt.legs[].iframeTargets / frames")
ck("every leg: the parent page's own #pp holds []",
   all(l["parentFiles"] == [] for l in r["legs"]),
   [], "receipt.legs[].parentFiles")
ck("no leg recorded a click event",
   not any(e[1] == "click" for l in r["legs"] for e in l["events"]),
   [], "receipt.legs[].events")
ck("every event was recorded on the leg's own target input",
   all(all(e[0] == l["target"] for e in l["events"]) for l in r["legs"]),
   [], "receipt.legs[].events[0] vs .target")

# --- PUAM -------------------------------------------------------------------
P = rep("PUAM")
ck("PUAM (Puppeteer launch, absent path, #s): resolves, no error",
   all(legs[k]["outcome"] == "resolved" and legs[k]["errName"] is None and legs[k]["errMessage"] is None
       for k in P), P, "leg.outcome/errName/errMessage")
ck("PUAM: #s holds exactly [[tabi-r99-missing.txt, 0, text/plain]] and #m holds []",
   all(legs[k]["files"] == {"s": [["tabi-r99-missing.txt", 0, "text/plain"]], "m": []} for k in P),
   P, "leg.files")
ck("PUAM: events are exactly [['s','input',true],['s','change',true]]",
   all(legs[k]["events"] == [["s", "input", True], ["s", "change", True]] for k in P),
   P, "leg.events")
ck("PUAM: both arrayBuffer() and FileReader reads reject NotFoundError with Blink's message",
   all(legs[k]["reads"] == [[NF, NF]] for k in P), P, "leg.reads")

# --- PLAM -------------------------------------------------------------------
P = rep("PLAM")
ck("PLAM (Playwright chromium.launch, absent path, #s): error name Error, message ENOENT stat '<missingPath>'",
   all(legs[k]["outcome"] == "error" and legs[k]["errName"] == "Error"
       and legs[k]["errMessage"] == "ENOENT: no such file or directory, stat '" + r["missingPath"] + "'"
       for k in P), P, "leg.errName/errMessage")
ck("PLAM: both inputs hold [], no event, no read",
   all(legs[k]["files"] == {"s": [], "m": []} and legs[k]["events"] == [] and legs[k]["reads"] == []
       for k in P), P, "leg.files/events/reads")

# --- PLBX -------------------------------------------------------------------
P = rep("PLBX")
ck("PLBX (connectOverCDP, one untyped 256-byte payload named tabi-r99-bytes.png, #s): resolves",
   all(legs[k]["outcome"] == "resolved" for k in P), P, "leg.outcome")
ck("PLBX: #s holds exactly [[tabi-r99-bytes.png, 256, image/png]], #m []",
   all(legs[k]["files"] == {"s": [["tabi-r99-bytes.png", 256, "image/png"]], "m": []} for k in P),
   P, "leg.files")
ck("PLBX: events are exactly [['s','input',false],['s','change',false]] (untrusted)",
   all(legs[k]["events"] == [["s", "input", False], ["s", "change", False]] for k in P),
   P, "leg.events")
ck("PLBX: both reads give ['ok', 256, sha256(bytes 0x00..0xff)]",
   all(legs[k]["reads"] == [[["ok", 256, BIN_SHA], ["ok", 256, BIN_SHA]]] for k in P),
   P, "leg.reads (sha256 " + BIN_SHA + ")")
ck("PLBX: the receipt's `bin` descriptor carries mimeType exactly null and that sha256",
   r["bin"]["mimeType"] is None and r["bin"]["sha256"] == BIN_SHA and r["bin"]["size"] == 256,
   [], "receipt.bin")

# --- PLBM -------------------------------------------------------------------
P = rep("PLBM")
ck("PLBM (connectOverCDP, typed text/plain P1 + untyped .tabi99 P2, #m): resolves",
   all(legs[k]["outcome"] == "resolved" for k in P), P, "leg.outcome")
ck("PLBM: #m holds exactly [[tabi-r99-p1.txt, 27, text/plain], [tabi-r99-p2.tabi99, 36, application/octet-stream]] in that order, #s []",
   all(legs[k]["files"] == {"s": [], "m": [["tabi-r99-p1.txt", 27, "text/plain"],
                                            ["tabi-r99-p2.tabi99", 36, "application/octet-stream"]]}
       for k in P), P, "leg.files")
ck("PLBM: events are exactly [['m','input',false],['m','change',false]] (untrusted)",
   all(legs[k]["events"] == [["m", "input", False], ["m", "change", False]] for k in P),
   P, "leg.events")
ck("PLBM: both reads of both files give each file's own size and sha256",
   all(legs[k]["reads"] == [[["ok", 27, r["payload1"]["sha256"]], ["ok", 27, r["payload1"]["sha256"]]],
                            [["ok", 36, r["payload2"]["sha256"]], ["ok", 36, r["payload2"]["sha256"]]]]
       for k in P), P, "leg.reads")
ck("PLBM: receipt descriptors payload1 mimeType text/plain, payload2 mimeType exactly null",
   r["payload1"]["mimeType"] == "text/plain" and r["payload2"]["mimeType"] is None,
   [], "receipt.payload1/payload2")

# --- PLBN -------------------------------------------------------------------
P = rep("PLBN")
ck("PLBN (the PLBM payloads on #s, no multiple): error name Error, message exactly "
   "'locator.setInputFiles: Error: Non-multiple file input can only accept single file'",
   all(legs[k]["outcome"] == "error" and legs[k]["errName"] == "Error"
       and legs[k]["errMessage"] == "locator.setInputFiles: Error: Non-multiple file input can only accept single file"
       for k in P), P, "leg.errMessage")
ck("PLBN: both inputs hold [], no event, no read",
   all(legs[k]["files"] == {"s": [], "m": []} and legs[k]["events"] == [] and legs[k]["reads"] == []
       for k in P), P, "leg.files/events/reads")

# --- PLLP / PUCM ------------------------------------------------------------
for A in ("PLLP", "PUCM"):
    P = rep(A)
    ck(f"{A} (two paths a.txt 22 B + b.txt 30 B on #m): resolves",
       all(legs[k]["outcome"] == "resolved" for k in P), P, "leg.outcome")
    ck(f"{A}: #m holds exactly [[tabi-r99-a.txt, 22, text/plain], [tabi-r99-b.txt, 30, text/plain]] in that order, #s []",
       all(legs[k]["files"] == {"s": [], "m": [["tabi-r99-a.txt", 22, "text/plain"],
                                                ["tabi-r99-b.txt", 30, "text/plain"]]}
           for k in P), P, "leg.files")
    ck(f"{A}: events are exactly [['m','input',true],['m','change',true]] (trusted)",
       all(legs[k]["events"] == [["m", "input", True], ["m", "change", True]] for k in P),
       P, "leg.events")
    ck(f"{A}: both reads of both files give each file's own size and sha256",
       all(legs[k]["reads"] == [[["ok", 22, r["fileA"]["sha256"]], ["ok", 22, r["fileA"]["sha256"]]],
                                [["ok", 30, r["fileB"]["sha256"]], ["ok", 30, r["fileB"]["sha256"]]]]
           for k in P), P, "leg.reads")
ck("PLLP is connectOverCDP with isLocal true; PUCM is Puppeteer connect",
   all(legs[k]["lib"] == "playwright" and legs[k]["mode"] == "connect" and legs[k]["isLocal"] is True
       for k in rep("PLLP"))
   and all(legs[k]["lib"] == "puppeteer" and legs[k]["mode"] == "connect" for k in rep("PUCM")),
   rep("PLLP") + rep("PUCM"), "leg.lib/mode/isLocal")

# --- PUCN -------------------------------------------------------------------
P = rep("PUCN")
ck("PUCN (the two paths on #s, no multiple): error name Error, message exactly "
   "'Multiple file uploads only work with <input type=file multiple>'",
   all(legs[k]["outcome"] == "error" and legs[k]["errName"] == "Error"
       and legs[k]["errMessage"] == "Multiple file uploads only work with <input type=file multiple>"
       for k in P), P, "leg.errMessage")
ck("PUCN: both inputs hold [], no event, no read",
   all(legs[k]["files"] == {"s": [], "m": []} and legs[k]["events"] == [] and legs[k]["reads"] == []
       for k in P), P, "leg.files/events/reads")

# --- shared descriptors -----------------------------------------------------
ck("fileA/fileB descriptors: tabi-r99-a.txt 22 B, tabi-r99-b.txt 30 B with the sha256s the reads returned",
   r["fileA"]["name"] == "tabi-r99-a.txt" and r["fileA"]["size"] == 22
   and r["fileB"]["name"] == "tabi-r99-b.txt" and r["fileB"]["size"] == 30,
   [], "receipt.fileA/fileB")
ck("missingPath is absolute with basename tabi-r99-missing.txt and missingExists is exactly false",
   r["missingPath"].endswith("/tabi-r99-missing.txt") and r["missingExists"] is False,
   [], "receipt.missingPath/missingExists")
ck("tmpdirAtLoad is absolute with basename t",
   r["tmpdirAtLoad"].endswith("/t") and r["tmpdirAtLoad"].startswith("/"),
   [], "receipt.tmpdirAtLoad")
ck("three distinct ports in 1024..65535",
   len({r["ports"]["http"], r["ports"]["child"], r["ports"]["cdp"]}) == 3
   and all(1024 <= r["ports"][k] <= 65535 for k in ("http", "child", "cdp")),
   [], "receipt.ports")
ck("libraries pinned: puppeteer-core 25.16.0, playwright-core 1.65.0",
   r["libs"]["puppeteer-core"]["version"] == "25.16.0"
   and r["libs"]["playwright-core"]["version"] == "1.65.0",
   [], "receipt.libs")

out = {"source": str(RECEIPT), "checks": checks,
       "passed": sum(1 for c in checks if c["ok"]), "total": len(checks),
       "failed": [c for c in checks if not c["ok"]]}
json.dump(out, sys.stdout, indent=2)
print()
sys.exit(0 if not out["failed"] else 1)
