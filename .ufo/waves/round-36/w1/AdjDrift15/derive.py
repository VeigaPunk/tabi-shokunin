#!/usr/bin/env python3
import json, subprocess, sys, os

FLEET = os.environ.get("FLEET_ROOT", "/home/vgpnk/Projects/shokunin")
CHUNK = os.environ.get("CHUNK_FILE", FLEET + "/tabi-shokunin/.ufo/waves/round-36/w1-chunks/AdjDrift15.tsv")
PINS  = os.environ.get("PINS_FILE", FLEET + "/tabi-shokunin/.ufo/waves/round-36/baseline/c1-delta-pins.json")
LEDGER= os.environ.get("LEDGER_FILE", FLEET + "/tabi-shokunin/corpus/adjacency-screen-drift.tsv")
OUT   = os.environ.get("OUT_DIR", FLEET + "/tabi-shokunin/.ufo/waves/round-36/w1/AdjDrift15")

pins = json.load(open(PINS))
cache = {}
cmds = []

def git_show(repo, rev, path):
    key = (repo, rev, path)
    if key in cache:
        return cache[key]
    cmd = ["git", "-C", repo, "show", f"{rev}:{path}"]
    cmds.append(" ".join(cmd))
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        cache[key] = None
    else:
        cache[key] = p.stdout.decode("utf-8", "replace")
    return cache[key]

def lines_of(text):
    return text.split("\n")

def trim(s):
    return s.strip()

# ledger rows keyed by sibling_ref
ledger = {}
with open(LEDGER, encoding="utf-8") as f:
    hdr = f.readline()
    for ln in f:
        ln = ln.rstrip("\n")
        if not ln:
            continue
        parts = ln.split("\t")
        ledger[parts[0]] = (parts[1], parts[2] if len(parts) > 2 else "")

rows = []
with open(CHUNK, encoding="utf-8") as f:
    for ln in f:
        ln = ln.rstrip("\n")
        if not ln.strip():
            continue
        parts = ln.split("\t")
        rows.append(parts[0])

out = []
mismatch = 0
details = []
for ref in rows:
    # parse
    left, lineno = ref.rsplit(":", 1)
    lane_dir, path = left.split(":", 1)
    lane_full, pin = lane_dir.split("@", 1)
    lane = lane_full[: -len("-shokunin")]
    idx = int(lineno)
    repo = f"{FLEET}/{lane_full}"

    cited = None
    ptext = git_show(repo, pin, path)
    if ptext is None:
        status = "stale: pin line absent"
        note = f"pin object unreadable: {pin}:{path}"
        cited = "<pin-unreadable>"
    else:
        pl = lines_of(ptext)
        if idx < 1 or idx > len(pl):
            status = "stale: pin line absent"
            note = f"pin file has {len(pl)} lines"
            cited = "<absent>"
        else:
            cited = trim(pl[idx - 1])

    if cited not in (None, "<pin-unreadable>", "<absent>"):
        H = pins.get(lane)
        if H is None:
            status = "stale: head file absent"
            note = f"no delta pin for lane {lane}"
        else:
            htext = git_show(repo, H, path)
            if htext is None:
                status = "stale: head file absent"
                note = f"{H}:{path} absent"
            else:
                hl = lines_of(htext)
                if idx <= len(hl) and trim(hl[idx - 1]) == cited:
                    status = "unchanged"
                    note = "-"
                else:
                    found = [i + 1 for i, t in enumerate(hl) if trim(t) == cited]
                    if found:
                        status = "moved :" + ",".join(str(x) for x in found)
                        note = f"relocated at head {H[:12]}"
                    else:
                        status = "stale"
                        note = f"cited text absent at head {H[:12]}"

    led = ledger.get(ref)
    if led is None:
        lstat, lnote, verdict = "<absent>", "<absent>", "MISMATCH"
    else:
        lstat, lnote = led
        verdict = "agree" if lstat == status else "MISMATCH"
        if verdict == "MISMATCH":
            pass
    if verdict == "MISMATCH":
        mismatch += 1
    out.append("\t".join([ref, status, note, lstat, verdict]))
    details.append({"ref": ref, "lane": lane, "path": path, "line": idx,
                    "pin": pin, "head": pins.get(lane), "cited": cited,
                    "myStatus": status, "myNote": note,
                    "ledgerStatus": lstat, "ledgerNote": lnote,
                    "verdict": verdict})

os.makedirs(OUT, exist_ok=True)
with open(OUT + "/receipt.tsv", "w", encoding="utf-8") as f:
    f.write("\n".join(out) + "\n")
    f.write(f"# AdjDrift15: {len(rows)} rows, {mismatch} mismatches\n")

with open(OUT + "/derivation.json", "w", encoding="utf-8") as f:
    json.dump({"rows": details, "mismatches": mismatch,
               "chunk": CHUNK, "pins": PINS, "ledger": LEDGER}, f, indent=1, ensure_ascii=False)

with open(OUT + "/git-invocations.txt", "w", encoding="utf-8") as f:
    f.write("# AdjDrift15 git invocations issued by this driver, in order\n")
    for c in cmds:
        f.write(c + "\n")

print(f"rows={len(rows)} mismatches={mismatch}")
for d in details:
    if d["verdict"] != "agree":
        print("MISMATCH", d["ref"], "mine=", d["myStatus"], "ledger=", d["ledgerStatus"])
