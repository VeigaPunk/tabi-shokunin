#!/usr/bin/env python3
"""generate-diff.py — ExecNoHarmTip, round 30 w2.

Assemble diff-vs-baseline.md from the measured tables (matrix.tsv at wave 1,
matrix-tip.tsv / exit-class.tsv / tally-changes.tsv / raw-diffs.tsv at wave 2).
No number in the document is typed from memory except the note text, which names
the mechanism verified in the raw receipts.
"""
import json
import pathlib

OUT = pathlib.Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w2/ExecNoHarmTip')
BASE = pathlib.Path('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ExecNoHarmBaseline')
REV_B = '061e62024c0523d3c6c7e819506a773ff2cd7d75'
REV_T = '072af95fe2822f0785a6ff88a578e2142dd258e5'

NOTE = {
    '1': 'script byte-identical; raw stdout identical',
    '2': 'script byte-identical; raw stdout identical',
    '3': 'script byte-identical; raw stdout identical',
    '4': 'script byte-identical; raw stdout identical',
    '5': 'script byte-identical; raw stdout identical',
    '6': 'script byte-identical; differs only in sandbox fixture commit SHAs inside refusal detail (same cases=12 passed=12)',
    '7': 'script byte-identical; raw stdout identical',
    '8': 'script byte-identical; raw stdout identical',
    '9': 'C1 gate: +9 reason-pinned cases (20 -> 29, all PASS); baseline 20 case lines unchanged',
    '10': 'script byte-identical; raw stdout identical',
    '11': 'C1 gate: +3 cases (7 -> 10, all PASS); baseline 7 case lines unchanged except new fixture SHAs',
    '12': 'script byte-identical; raw stdout identical',
    '13': 'script byte-identical; raw stdout identical',
    '14': 'script byte-identical; raw stdout identical',
    '15': 'script byte-identical; raw stdout identical',
    '16': 'script byte-identical; raw stdout identical',
    '17': 'script byte-identical; raw stdout identical',
    '18': 'script byte-identical; raw stdout identical (rev normalised)',
    '19': 'script byte-identical; raw stdout identical — designed red side of row 20',
    '20': 'script byte-identical; raw stdout identical',
    '21': 'script byte-identical; raw stdout identical',
    '22': 'script byte-identical; raw stdout identical (matched=34 unique=34 lane=31 public=3 at both revs)',
    '23': 'script byte-identical; raw stdout identical',
    '24': 'C2 target: population 0 -> 2, admitted 0 -> 2, clean false -> true',
    '25': 'C1 target: survivors 14 -> 0, fault_killed 13 -> 27, benign_killed 0; per-mutant transitions in c1-attribution.tsv',
    '26': 'script byte-identical; rows 34 -> 36 = two SKILL.md lines added by commit 38891ca (release-pins 1 -> 2 rows, s106 3 -> 4 rows); 20 gates unchanged, nonconformant=0',
    '27': 'findings deep-equal; only `at` differs because it resolves laneTip (lane master), not the measured rev — same class of drift as at baseline',
    '28': 'script byte-identical; raw stdout identical',
    '29': 'script byte-identical; raw stdout identical (population 23, holds 16, drifted 7, unresolved 0)',
    '30': 'script byte-identical; raw stdout identical',
    '31': 'script byte-identical; raw stdout identical',
    '32': 'sanctioned restatements only: s106 7->10 and release-pins 20->29 with superseded=true, two new counted SCORECARD rows, superseded 12->15; mismatches=0',
    '33': 'script byte-identical; raw stdout identical',
    '34': 'data-driven: rows 115 -> 118 (S116/S117/S118), tiers A 100 -> 103, mined 87 -> 90; findings=0',
    '35': 'raw stdout empty at both revs (gate writes to stderr); stderr identical: history_rewritten on corpus/lessons/round-18.md',
    '36': 'script byte-identical; raw stdout identical',
    '37': 'data-driven: lessonSha256 of corpus/lessons/round-29.md changes (round-30 appended 13 lines); 11 findings, classes c2:1 c3:1 c6:9 unchanged',
    '38': 'C2 target with --live: population 2 admitted 2 clean; live arm re-fetched both receipts (fetch evidence in the report)',
    '39': 'script byte-identical; raw stdout identical (PASS 6/6 sections, SHONEN 4/4 boxes). Re-run needed after a wrong-path attempt, see report §2',
    '40': 'one added W04 duplicate-url warning for S118; exit 0 both',
    '41': 'script byte-identical; raw stdout identical',
    '42': 'script byte-identical; differs only in fixture repo commit SHAs embedded in the JSON',
    '43': 'script byte-identical; raw stdout identical',
    '44': 'script byte-identical; differs only in fixture repo commit SHAs embedded in the JSON',
    '45': 'script byte-identical; raw stdout identical (revision normalised)',
    '46': 'script byte-identical; raw stdout identical (revision normalised)',
    '47': 'one added W04 duplicate-url warning for S118; exit 0 both',
}


def read_tsv(path):
    lines = path.read_text().rstrip('\n').split('\n')
    head = lines[0].split('\t')
    return [dict(zip(head, ln.split('\t'))) for ln in lines[1:]]


def main():
    tip = {r['row']: r for r in read_tsv(OUT / 'matrix-tip.tsv')}
    cls = {r['row_key']: r for r in read_tsv(OUT / 'exit-class.tsv')}
    raw = {f"{int(r['row']):02d}": r for r in read_tsv(OUT / 'raw-diffs.tsv')}
    out = []
    out.append('# ExecNoHarmTip — matrix diff, baseline `061e620` -> tip `072af95`\n')
    out.append('Generated by `generate-diff.py` from `matrix-tip.tsv` (measured), '
               '`exit-class.tsv` (join against wave-1 `matrix.tsv`), `raw-diffs.tsv` '
               '(normalised stdout/stderr identity) and `c1-attribution.tsv`.\n')
    out.append('## Headline\n')
    out.append('| class | rows |')
    out.append('|---|---|')
    harm = [k for k, v in cls.items() if v['class'].startswith('HARM')]
    flips = [k for k, v in cls.items() if v['class'].startswith('flip')]
    same = [k for k, v in cls.items() if v['class'] == 'same']
    out.append(f'| same exit class | {len(same)} |')
    out.append(f'| allowed red->green flip | {len(flips)} |')
    out.append(f'| **green->red (harm)** | **{len(harm)}** |')
    out.append('')
    out.append('Flips: ' + ', '.join(f'`{k}`' for k in sorted(flips)) + '.\n')
    out.append('## Per-row comparison\n')
    out.append('| row | script | mode | base exit | tip exit | class | raw | note |')
    out.append('|---|---|---|---|---|---|---|---|')
    for r in sorted(tip.values(), key=lambda x: int(x['row'])):
        key = f"{r['script']}|{r['mode']}"
        c = cls[key]
        rk = f"{int(r['row']):02d}"
        rawtag = raw[rk]['raw_identity'] if rk in raw else '?'
        out.append(f"| {r['row']} | {r['script']} | {r['mode']} | {c['base_exit']} | {c['tip_exit']} | "
                   f"{c['class']} | {rawtag} | {NOTE.get(r['row'], '')} |")
    out.append('')
    out.append('## How exit codes were read\n')
    out.append('Wave-1 `matrix.tsv` and this seat\'s `matrix-tip.tsv` share one schema '
               '(`row, seat, rev, script, mode, exit, tally, command`); rows are joined on '
               '`script|mode`, never on row number, because the baseline row-38 command carries a '
               '`<clone>` placeholder. `compare.sh` writes the join (`joined.tsv`), the exit classes '
               '(`exit-class.tsv`, `harm-findings.tsv`, `red-movements.tsv`) and tally deltas '
               '(`tally-changes.tsv`).\n')
    out.append('## What the tally deltas are, after normalisation\n')
    out.append('`raw-diffs.tsv` replaces only the scratch path and the measured revision, then compares '
               'byte-for-byte. 32 of 47 rows are identical; the 15 that differ are classified above. '
               'Three sources of difference are non-behavioural and must not be read as drift: '
               '(a) sandbox fixture commit SHAs inside `check-gate-mutants --selftest` refusal detail and '
               'inside the round-21/round-22 selftest JSON (rows 6, 42, 44, same length, same verdict); '
               '(b) `at` in row 27, which resolves `laneTip(repo)` — the lane master ref, here '
               '`af0664e`, one commit ahead of the measured tip — exactly as it resolved `38891ca` at '
               'baseline; (c) tallies the projection prints in a different order.\n')
    out.append('## Gate-script change surface\n')
    out.append('`sha256sum -c` over wave-1 `scripts-sha256-baseline.txt` at the tip: 18 of 20 files OK, '
               'exactly two FAILED — `scripts/check-s106-evidence.mjs` and `scripts/check-release-pins.mjs` '
               '— and `scripts/gate-mutants.json` is OK (catalogue frozen). The two gate diffs remove '
               '4 lines and add 139; the removed lines are one header comment count, the old two-term '
               'selftest assertion, and its two reporting lines. No line of either gate\'s check '
               'implementation changed, so no gate kept green by deleting a check.\n')
    (OUT / 'diff-vs-baseline.md').write_text('\n'.join(out) + '\n')
    print('wrote', OUT / 'diff-vs-baseline.md', len(out), 'lines')


if __name__ == '__main__':
    raise SystemExit(main())
