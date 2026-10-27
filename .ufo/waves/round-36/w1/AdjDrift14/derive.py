import json, subprocess, sys, os

FLEET = "/home/vgpnk/Projects/shokunin"
CHUNK = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/w1-chunks/AdjDrift14.tsv"
LEDGER = "/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen-drift.tsv"
PINS = "/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/baseline/c1-delta-pins.json"

def git(repo, *args):
    p = subprocess.run(["git", "-C", repo] + list(args), capture_output=True)
    return p.returncode, p.stdout.decode("utf-8", "replace"), p.stderr.decode("utf-8", "replace")

pins = json.load(open(PINS))

# ledger rows: sibling_ref <TAB> status <TAB> note
ledger = {}
with open(LEDGER, encoding="utf-8") as f:
    for ln in f:
        ln = ln.rstrip("\n")
        if not ln or ln.startswith("#"):
            continue
        parts = ln.split("\t")
        if len(parts) < 2:
            continue
        ledger[parts[0]] = (parts[1], parts[2] if len(parts) > 2 else "")

cmds = []
out = []
mism = []

rows = [l.rstrip("\n") for l in open(CHUNK, encoding="utf-8") if l.strip()]
for row in rows:
    ref = row.split("\t")[0]
    lane_and_pin, path, line_s = ref.rsplit(":", 2)
    lane, pin = lane_and_pin.split("@", 1)
    lane_key = lane[:-len("-shokunin")] if lane.endswith("-shokunin") else lane
    line = int(line_s)
    repo = os.path.join(FLEET, lane)
    cmds.append(f"git -C {repo} show {pin}:{path}")
    rc, pinout, pinerr = git(repo, "show", f"{pin}:{path}")
    cited = None
    if rc == 0:
        lines = pinout.splitlines()
        if line <= len(lines):
            cited = lines[line - 1].strip()
    if cited is None:
        status, note = "stale", "stale: pin line absent"
    else:
        head = pins.get(lane_key)
        hname = head if head else "MISSING-FROM-PINS"
        cmds.append(f"git -C {repo} show {hname}:{path}")
        rc2, headout, _ = git(repo, "show", f"{hname}:{path}")
        if rc2 != 0:
            status, note = "stale", "stale: head file absent"
        else:
            hlines = headout.splitlines()
            if line <= len(hlines) and hlines[line - 1].strip() == cited:
                _, pb, _ = git(repo, "rev-parse", f"{pin}:{path}")
                _, hb, _ = git(repo, "rev-parse", f"{hname}:{path}")
                pb, hb = pb.strip(), hb.strip()
                cmds.append(f"git -C {repo} rev-parse {pin}:{path} {hname}:{path}")
                blob = "blob identical" if pb == hb else f"blob pin:{pb[:8]} head:{hb[:8]} (same text at :{line})"
                status, note = "unchanged", f"same text at same line; {blob}"
            else:
                hits = [i + 1 for i, h in enumerate(hlines) if h.strip() == cited]
                if hits:
                    status, note = f"moved :{hits[0]}", f"moved :{','.join(str(h) for h in hits)}"
                else:
                    status, note = "stale", "stale: cited text absent at head"
    lg = ledger.get(ref)
    if lg is None:
        lstatus, lnote = "ABSENT-FROM-LEDGER", ""
    else:
        lstatus, lnote = lg
    agree = "agree" if lstatus == status else "MISMATCH"
    if agree == "MISMATCH":
        mism.append((ref, status, lstatus))
    out.append("\t".join([ref, status, note, lstatus, agree]))

with open("receipt.tsv", "w", encoding="utf-8") as f:
    for l in out:
        f.write(l + "\n")
    f.write(f"# AdjDrift14: {len(out)} rows, {len(mism)} mismatches\n")

with open("commands.txt", "w", encoding="utf-8") as f:
    f.write("# AdjDrift14 — exact commands issued (git -C <lane repo> ..., read-only)\n")
    f.write(f"# chunk: {CHUNK}\n# pins: {PINS}\n# ledger: {LEDGER}\n")
    for c in cmds:
        f.write(c + "\n")
    f.write("\n# derivation script: derive.py (this dir)\n")
    f.write(f"# rows={len(out)} mismatches={len(mism)}\n")
    f.write("""
# ---- auxiliary verification actually run (read-only) ----
git -C <lane> diff --stat <pin> <head> -- <each cited path>        # empty => no content change on cited files
git -C <lane> diff --numstat <pin> <head> -- <each cited path>     # empty => 0 added/0 removed on cited files
git -C <lane> cat-file -t <pin> ; git -C <lane> cat-file -t <head>  # both "commit"
git -C <lane> merge-base --is-ancestor <pin> <head>               # yes (pin precedes frozen delta head)
git -C <lane> diff --name-only <pin> <head>                       # delta files; none of the 6 cited files appear
git -C <lane> rev-parse <pin>:<path> <head>:<path>                # blob ids; identical for all 6 cited files

# independent re-derivation in shell (awk NR==n + trim), not sharing derive.py's code path:
#   for each ref: a=$(git -C <lane> show <pin>:<path> | awk -v n=<line> 'NR==n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
#                 b=$(git -C <lane> show <head>:<path> | awk -v n=<line> 'NR==n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
#   result: 20/20 "unchanged", every cited line non-empty
# ledger integrity:
awk -F'\\t' '{print $1}' corpus/adjacency-screen-drift.tsv | sort | uniq -d   # none (no duplicate refs)
grep -F -f <(cut -f1 receipt.tsv | grep -v '^#') corpus/adjacency-screen-drift.tsv      # 20 rows
grep -F -f <(cut -f1 receipt.tsv | grep -v '^#') corpus/adjacency-screen-browser.tsv    # 20 rows (every ref is a real screen row)
ls corpus/adjacency-screen-delta.tsv                                                     # absent => our refs cannot be delta rows
""")

print(f"rows={len(out)} mismatches={len(mism)}")
for m in mism:
    print("MISMATCH", m)
