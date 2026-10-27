#!/usr/bin/env python3
"""AdjDrift05 independent re-derivation of C1 drift-audit statuses.

For each input row (sibling_ref<TAB>status<TAB>note):
  1. git -C <lane repo> show <pin>:<path>  -> take line <line>, trimmed = CITED
     (line absent -> "stale: pin line absent")
  2. H = baseline/c1-delta-pins.json[lane]; git -C <lane repo> show <H>:<path>
     (absent -> "stale: head file absent"); head line <line> trimmed:
       equal to CITED -> unchanged
       else first head line whose trimmed text == CITED at N -> moved :N
       else -> stale
  3. compare with committed ledger corpus/adjacency-screen-drift.tsv row by sibling_ref.

Every git invocation is logged verbatim to commands.txt.
"""
import json
import os
import subprocess
import sys

ROOT = "/home/vgpnk/Projects/shokunin"
LANE = os.path.join(ROOT, "tabi-shokunin")
SEAT = os.path.join(LANE, ".ufo/waves/round-36/w1/AdjDrift05")
CHUNK = os.path.join(LANE, ".ufo/waves/round-36/w1-chunks/AdjDrift05.tsv")
LEDGER = os.path.join(LANE, "corpus/adjacency-screen-drift.tsv")
PINS = os.path.join(LANE, ".ufo/waves/round-36/baseline/c1-delta-pins.json")

cmdlog = []


def git(args):
    """Run one literal git invocation and log it."""
    cmd = ["git"] + args
    cmdlog.append(" ".join(cmd))
    p = subprocess.run(cmd, capture_output=True)
    if p.returncode != 0:
        return None, p.stderr.decode("utf-8", "replace").strip()
    return p.stdout.decode("utf-8", "replace"), None


def show_lines(repo, rev, path):
    """Return list of lines (raw, unstripped) or None if rev:path unreadable."""
    out, err = git(["-C", repo, "show", "%s:%s" % (rev, path)])
    if out is None:
        print("# unreadable %s:%s -> %s" % (rev, path, err.splitlines()[0] if err else ""),
              file=sys.stderr)
        return None
    # index = line number - 1; drop the artefact of a trailing newline, keep real
    # blank lines so line numbers match `sed -n Np` / git show output.
    lines = out.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    return lines


def trim(s):
    return s.strip(" \t\r")


def main():
    pins = json.load(open(PINS))
    ledger = {}
    with open(LEDGER, encoding="utf-8") as f:
        next(f)  # header
        for ln in f:
            ln = ln.rstrip("\n")
            if not ln:
                continue
            parts = ln.split("\t")
            ledger[parts[0]] = (parts[1] if len(parts) > 1 else "",
                                parts[2] if len(parts) > 2 else "")

    rows = []
    with open(CHUNK, encoding="utf-8") as f:
        for ln in f:
            ln = ln.rstrip("\n")
            if not ln.strip():
                continue
            rows.append(ln.split("\t"))

    receipt = ["sibling_ref\tmy-status\tmy-note\tledger-status\tagree|MISMATCH"]
    mismatches = []
    for parts in rows:
        ref = parts[0]
        lane_pin, path, lineno_s = ref.split(":", 2)
        lane, pin = lane_pin.split("@", 1)
        repo_name = lane if lane.endswith("-shokunin") else lane + "-shokunin"
        lane_key = repo_name[: -len("-shokunin")]
        lineno = int(lineno_s)
        repo = os.path.join(ROOT, repo_name)

        pinlines = show_lines(repo, pin, path)
        cited = None
        if pinlines is not None and 1 <= lineno <= len(pinlines):
            cited = trim(pinlines[lineno - 1])
            if cited == "" and lineno > len(pinlines):
                cited = None
        if cited is None:
            my_status, my_note = "stale", "pin line absent"
        else:
            H = pins[lane_key]
            headlines = show_lines(repo, H, path)
            if headlines is None:
                my_status, my_note = "stale", "head file absent"
            elif 1 <= lineno <= len(headlines) and trim(headlines[lineno - 1]) == cited:
                my_status, my_note = "unchanged", "-"
            else:
                hits = [i + 1 for i, h in enumerate(headlines) if trim(h) == cited]
                if hits:
                    my_status, my_note = "moved :%d" % hits[0], "verbatim at :%s" % (
                        ",".join(":%d" % h for h in hits))
                else:
                    my_status, my_note = "stale", "cited text absent at head"

        lstatus, lnote = ledger.get(ref, ("<absent-from-ledger>", "<>"))
        if lstatus == "<absent-from-ledger>":
            agree = "MISMATCH"
        elif my_status.split(" ")[0] != lstatus.split(" ")[0]:
            agree = "MISMATCH"
        elif my_status.startswith("moved"):
            want = ":%s" % my_status.split(":")[1]
            agree = "agree" if want in lnote else "MISMATCH"
        else:
            agree = "agree"
        if agree == "MISMATCH":
            mismatches.append((ref, my_status, my_note, lstatus, lnote))
        receipt.append("\t".join([ref, my_status, my_note, lstatus, agree]))

    receipt.append("# AdjDrift05: %d rows, %d mismatches" % (len(rows), len(mismatches)))

    with open(os.path.join(SEAT, "receipt.tsv"), "w", encoding="utf-8") as f:
        f.write("\n".join(receipt) + "\n")
    with open(os.path.join(SEAT, "commands.txt"), "w", encoding="utf-8") as f:
        f.write("# exact commands executed by derive.py, in order\n")
        f.write("# driver: python3 .ufo/waves/round-36/w1/AdjDrift05/derive.py\n")
        f.write("\n".join(cmdlog) + "\n")
    for m in mismatches:
        print("MISMATCH: %s | mine=%s (%s) | ledger=%s (%s)" % m)
    print("rows=%d mismatches=%d" % (len(rows), len(mismatches)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
