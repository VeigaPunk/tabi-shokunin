#!/usr/bin/env python3
"""R63Critic do-nothing control harness.

Runs the four fabricated-receipt scenarios through the production CLI and records
exact argv, cwd, exit code, stdout findings and the sha256 of every input byte.
"""
import hashlib
import json
import subprocess

LANE = "/home/vgpnk/Projects/shokunin/tabi-shokunin"
COUNTER = f"{LANE}/.ufo/waves/round-63/counters/chromium-wheel-r63.mjs"
DRIVER = f"{LANE}/scripts/chrome-cdp-loopback-round63.mjs"
PIN = "b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040"
EVIDENCE = f"{LANE}/corpus/evidence/round63/chromium-wheel-scroll"
S = f"{LANE}/.ufo/waves/round-63/w1/R63Critic"


def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


SCENARIOS = [
    ("A-fabricated-receipt-empty-shot-dir", f"{S}/fab/receipt-tiny.json", f"{S}/fab/shots-empty"),
    ("B-fabricated-receipt-1x1-pngs", f"{S}/fab/receipt-tiny.json", f"{S}/fab/shots-tiny"),
    ("C-fabricated-receipt-borrowed-real-pngs", f"{S}/fab/receipt-borrow.json", EVIDENCE),
    ("D-fabricated-receipt-against-real-png-path", f"{S}/fab/receipt-tiny.json", EVIDENCE),
]

runs = []
for name, receipt, shot in SCENARIOS:
    argv = ["node", COUNTER, receipt, "--driver", DRIVER, "--expect-driver-sha256", PIN, "--shot", shot, "--json"]
    r = subprocess.run(argv, cwd=LANE, capture_output=True, text=True)
    try:
        parsed = json.loads(r.stdout)
    except json.JSONDecodeError:
        parsed = None
    runs.append({
        "name": name,
        "argv": argv,
        "cwd": LANE,
        "receiptSha256": sha(receipt),
        "shotDir": shot,
        "exit": r.returncode,
        "predicate": (parsed or {}).get("predicate"),
        "findings": (parsed or {}).get("findings"),
        "stdout": r.stdout.strip(),
        "stderr": r.stderr.strip(),
    })

doc = {
    "schema": "tabi-r63-critic-donothing-v1",
    "author": "R63Critic",
    "counterSha256": sha(COUNTER),
    "driverSha256": sha(DRIVER),
    "note": "receipt-tiny.json is authored from prose (fabricate.mjs); no browser process was ever launched. Its four step PNGs are 70-byte 1x1 images.",
    "runs": runs,
}
print(json.dumps(doc, indent=1))
