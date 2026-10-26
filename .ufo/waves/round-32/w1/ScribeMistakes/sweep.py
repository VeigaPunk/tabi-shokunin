#!/usr/bin/env python3
"""Read-only sweep of tabi lane self-description for stale state premises.

A. Derives the stagnation-nudge state per SCORECARD.md round group from the same
   inputs the frozen counter m4 uses (six axis scores, `Saturation S / window W`,
   capability `First-working round: N`), flattening the group the way m4 does
   (whitespace collapsed across lines) and mapping the match offset back to its
   first line. B. Repeats it for LOG.md round groups (saturation falls back to the
   nearest preceding declaration in the same document, printed as such). C. Checks
   `lowest ... at N` statements against the argmin of the same axes.

Usage: sweep.py <lane-root>
Exit 0 always; this is a report, not a gate.
"""
import re
import sys

LANE = sys.argv[1]
AXES = ["depth", "coverage", "operability", "freshness", "calibration", "adjacency"]


def read(p):
    with open(f"{LANE}/{p}", encoding="utf-8") as fh:
        return fh.read()


def capability_rounds(doc):
    out = set(int(m.group(1)) for m in re.finditer(r"First-working round:\s*(\d+)", doc, re.I))
    lines = doc.split("\n")
    for i, line in enumerate(lines):
        if not re.match(r"^\s*\|.*First-working round\s*\|\s*$", line, re.I):
            continue
        for row in lines[i + 1:]:
            if not row.strip().startswith("|"):
                break
            if re.match(r"^\s*\|[\s:|-]+\|\s*$", row):
                continue
            cells = row.strip().strip("|").split("|")
            m = re.search(r"(\d+)", cells[-1] or "")
            if m:
                out.add(int(m.group(1)))
    return sorted(out)


def round_groups(doc):
    groups, cur, buf = [], None, []
    for i, line in enumerate(doc.split("\n"), 1):
        m = re.match(r"^##\s+Round\s*(\d+)\b", line, re.I)
        if m:
            if cur is not None:
                groups.append((cur, buf))
            cur, buf = int(m.group(1)), [(i, line)]
        elif cur is not None:
            buf.append((i, line))
    if cur is not None:
        groups.append((cur, buf))
    return groups


def axes_of(text):
    m = re.search(r"Axes at round start:\s*([\s\S]{0,240})", text, re.I)
    if not m:
        return None
    scores = {}
    for a, n in re.findall(r"\b(" + "|".join(AXES) + r")\s+(\d+)", m.group(1), re.I):
        scores.setdefault(a.lower(), int(n))
    return scores if all(a in scores for a in AXES) else None


def sat_of(text):
    m = re.search(r"saturation\s+(?:line\s*)?\**(\d+)\**\s*/\s*(?:stagnation\s+)?window\s*(?:N\s*=\s*)?\**(\d+)\**", text, re.I)
    return (int(m.group(1)), int(m.group(2))) if m else None


def derive(round_no, scores, sat, caps):
    line, window = sat
    all_at = all(scores[a] >= line for a in AXES)
    within = [c for c in caps if round_no - window <= c <= round_no - 1]
    return ("active" if all_at and not within else "inactive"), all_at, within


def nudge_rows(name, doc, caps, fallback_sat):
    print(f"\n== {name}: `nudge inactive|active` statements, derived from own round group ==")
    print(f"{'line':>6} {'round':>5} {'claimed':<8} {'derived':<8} {'verdict':<12} inputs")
    stale = 0
    last_sat = fallback_sat
    for rnd, lines in round_groups(doc):
        flat, offsets = "", []
        for no, line in lines:
            offsets.append((len(flat), no))
            flat += line + " "
        text = re.sub(r"\s", " ", flat)

        def line_at(pos):
            no = offsets[0][1]
            for at, ln in offsets:
                if at <= pos:
                    no = ln
                else:
                    break
            return no

        scores = axes_of(text)
        sat, sat_src = sat_of(text), "group"
        if sat:
            last_sat = sat
        else:
            sat, sat_src = last_sat, "fallback (nearest preceding declaration in this document)"
        for m in re.finditer(r"\bnudge\s+(?:is\s+)?(inactive|active)\b", text, re.I):
            no, claimed = line_at(m.start()), m.group(1).lower()
            if not scores:
                print(f"{no:>6} {rnd:>5} {claimed:<8} {'-':<8} {'unevaluable':<12} no six-axis `Axes at round start:` in group")
                continue
            obs, all_at, within = derive(rnd, scores, sat, caps)
            stale += obs != claimed
            print(f"{no:>6} {rnd:>5} {claimed:<8} {obs:<8} {('fresh' if obs == claimed else 'STALE'):<12} "
                  f"saturation {sat[0]}/window {sat[1]} [{sat_src}]; all axes >= {sat[0]}: {all_at}; caps in window: {within}")
    print(f"stale statements in {name}: {stale}")
    return stale


def lowest_rows(doc):
    print("\n== C. `lowest ... at N` statements vs the axes table (SCORECARD.md round groups) ==")
    print(f"{'line':>6} {'round':>5} {'stated':<24} {'argmin':<38} {'worked':<28} verdict")
    defects = 0
    for rnd, lines in round_groups(doc):
        flat, offsets = "", []
        for no, line in lines:
            offsets.append((len(flat), no))
            flat += line + " "
        text = re.sub(r"\s", " ", flat)

        def line_at(pos):
            no = offsets[0][1]
            for at, ln in offsets:
                if at <= pos:
                    no = ln
                else:
                    break
            return no

        scores = axes_of(text)
        if not scores:
            continue
        low = min(scores.values())
        argmin = sorted(a for a in AXES if scores[a] == low)
        for m in re.finditer(r"lowest[^.;|]{0,90}?at\s+(\d+)([^.;|]{0,140})", text, re.I):
            no = line_at(m.start())
            stated_n = int(m.group(1))
            span = m.group(0)
            says_tie = "tie" in span.lower()
            worked = re.findall(r"C\d+\s+works\s+([a-z]+)", span)
            problems = []
            if stated_n != low:
                problems.append(f"stated {stated_n} != argmin {low}")
            if says_tie and len(argmin) == 1:
                problems.append(f"says tie but argmin unique ({argmin[0]})")
            if not says_tie and len(argmin) > 1:
                problems.append(f"no tie word but argmin has {len(argmin)}")
            bad = [w for w in worked if w not in argmin]
            if bad:
                problems.append(f"worked axis not lowest: {bad}")
            defects += bool(problems)
            print(f"{no:>6} {rnd:>5} {('line ' + str(stated_n) + (' tie' if says_tie else '')):<24} "
                  f"{','.join(argmin):<38} {','.join(worked) or '-':<28} {'HOLDS' if not problems else 'DEFECT: ' + '; '.join(problems)}")
    print(f"lowest-axis defects: {defects}")


scorecard = read("SCORECARD.md")
log = read("LOG.md")
caps = capability_rounds(scorecard)
print(f"capability rounds parsed from SCORECARD.md: {caps}")
print(f"last capability entry round: {caps[-1]}")
declared = sat_of(re.sub(r"\s+", " ", scorecard))
print(f"lane saturation/window as last declared in SCORECARD.md: {declared}")
nudge_rows("SCORECARD.md", scorecard, caps, declared)
nudge_rows("LOG.md", log, caps, declared)
lowest_rows(scorecard)
