#!/usr/bin/env python3
# AdjDrift11 independent re-derivation of C1 drift statuses from git objects only.
import json, re, subprocess, sys, os

LANE_ROOT = "/home/vgpnk/Projects/shokunin"
ROUND = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36"
CHUNK = f"{ROUND}/w1-chunks/AdjDrift11.tsv"
PINS = f"{ROUND}/baseline/c1-delta-pins.json"
LEDGER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen-drift.tsv"
REF_RE = re.compile(r"^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$")

env = dict(os.environ, GIT_NO_REPLACE_OBJECTS="1")
cmds = []

def git(repo, args, allow_fail=False):
    cmd = ["git", "-C", repo, "-c", "core.commitGraph=false"] + args
    cmds.append(" ".join(cmd))
    r = subprocess.run(cmd, capture_output=True, env=env)
    if r.returncode != 0 and not allow_fail:
        raise SystemExit(f"FAILED: {' '.join(cmd)}\n{r.stderr.decode()}")
    return r

def blob(repo, rev, path):
    r = git(repo, ["show", f"{rev}:{path}"], allow_fail=True)
    if r.returncode != 0:
        return None
    return r.stdout

def lines(b):
    return [l[:-1] if l.endswith("\r") else l for l in b.decode("utf-8").split("\n")]

delta_pins = json.load(open(PINS))

# ---- ledger (committed, read at the lane worktree path) ----
ledger = {}
dup = []
for raw in open(LEDGER, encoding="utf-8").read().split("\n"):
    if not raw.strip():
        continue
    f = [x.strip() for x in raw.split("\t")]
    if not REF_RE.match(f[0]):
        continue
    if f[0] in ledger:
        dup.append(f[0])
    ledger[f[0]] = (f[1] if len(f) > 1 else "", f[2] if len(f) > 2 else "")

rows = []
for raw in open(CHUNK, encoding="utf-8").read().split("\n"):
    if not raw.strip():
        continue
    f = raw.split("\t")
    rows.append((f[0].strip(), f[1].strip() if len(f) > 1 else "", f[2].strip() if len(f) > 2 else ""))

out = []
caches = {}
def head_lines(lane, head, path):
    k = (lane, head, path)
    if k not in caches:
        b = blob(f"{LANE_ROOT}/{lane}-shokunin", head, path)
        caches[k] = None if b is None else lines(b)
    return caches[k]

mismatches = []
for ref, lstatus, lnote in rows:
    m = REF_RE.match(ref)
    lane, pin, path, n = m.group(1), m.group(2), m.group(3), int(m.group(4))
    repo = f"{LANE_ROOT}/{lane}-shokunin"
    pinb = blob(repo, pin, path)
    if pinb is None:
        out.append((ref, "stale", "pin file absent", lstatus, "MISMATCH" if lstatus != "stale" else "agree")); continue
    pl = lines(pinb)
    cited = pl[n - 1].strip() if n <= len(pl) else None
    if cited is None:
        out.append((ref, "stale", "pin line absent", lstatus, "MISMATCH" if lstatus != "stale" else "agree")); continue
    head = delta_pins.get(lane)
    hl = head_lines(lane, head, path) if head else None
    if hl is None:
        out.append((ref, "stale", "head file absent", lstatus, "MISMATCH" if lstatus != "stale" else "agree")); continue
    at_n = hl[n - 1].strip() if n <= len(hl) else None
    if at_n == cited:
        st, note = "unchanged", "same text at same line"
    else:
        reloc = [i + 1 for i, t in enumerate(hl) if t.strip() == cited]
        if reloc:
            st, note = "moved", "verbatim at " + ",".join(f":{x}" for x in reloc)
        else:
            st, note = "stale", "cited text absent at head"
    lg = ledger.get(ref)
    if lg is None:
        verdict = "MISMATCH"
        ls, ln = "<absent>", ""
    else:
        ls, ln = lg
        verdict = "agree" if (ls == st) else "MISMATCH"
    if verdict == "MISMATCH":
        mismatches.append((ref, st, note, ls, ln))
    out.append((ref, st, note, ls, verdict))
    print(f"{ref}\n  cited={cited!r}\n  pin_line={n} head={head} head_len={len(hl)} at_n={at_n!r}\n  derived={st} ({note}) ledger={ls} {verdict}", file=sys.stderr)

seat = f"{ROUND}/w1/AdjDrift11"
os.makedirs(seat, exist_ok=True)
with open(f"{seat}/receipt.tsv", "w", encoding="utf-8") as fh:
    for r in out:
        fh.write("\t".join(r) + "\n")
    fh.write(f"# AdjDrift11: {len(out)} rows, {len(mismatches)} mismatches\n")
with open(f"{seat}/commands.txt", "w", encoding="utf-8") as fh:
    fh.write("# AdjDrift11 exact commands (env GIT_NO_REPLACE_OBJECTS=1)\n")
    fh.write(f"# chunk: {CHUNK}\n# delta pins: {PINS}\n# ledger: {LEDGER}\n")
    fh.write("# python3 " + os.path.abspath(__file__) + "\n")
    for c in cmds:
        fh.write(c + "\n")
print(f"ROWS={len(out)} MISMATCHES={len(mismatches)} DUPLEDGER={len(dup)}")
for mm in mismatches:
    print("MISMATCH:", mm)
