# SentReportPath — report-path pre-flight sentinel (round 27, wave 2)

Seat: leaf sentinel, read-only reporter. Deliverable: verification of the final
report contract (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-27/tabi.md`),
the `scripts/report-contract.mjs` utility, and the evidence paths/commits the
round-27 report will cite. All commands run with cwd
`/home/vgpnk/Projects/shokunin/tabi-shokunin` unless stated. Node `v24.21.0`
(`node --version`). No tool installs (no network, no pacman).

## Work performed

1. **Final path pre-flight.** `/home/vgpnk/Projects/shokunin/.ufo/reports/round-27/`
   exists, owned `vgpnk:vgpnk`, mode `drwxr-xr-x` (writable). No `tabi.md`
   exists there yet — the round-27 report draft has not landed (ScribeFinalReport
   is a w2 peer still running).
2. **Landed utility integrity.** `scripts/report-contract.mjs` is tracked at tip
   `bceb17d` (`git ls-files --error-unmatch` ok, `git diff --stat HEAD -- …`
   empty), byte-identical to the w1-validated scratch utility: sha256
   `b1e296bfd46b6aa23c92cc99e53b5356bbc2ba485e75001b17e4afc52065ea5a`, 140 lines,
   5718 bytes, `node --check` clean.
3. **Contract clauses re-exercised** (a) six sections in order, (b) exactly one
   `## SHONEN` with one checkbox per SHONEN.md item, (c) path shape — all three,
   plus fence-mask false-green blocking.
4. **Evidence commits/paths.** All commits the report will cite verified present at
   tip; receipt path `corpus/evidence/round-26/sources/s106.json` exists; LOG.md
   cited lines and correction region verified.

## Landed changes

**No tracked file was created, modified or deleted.** Throwaway fixtures only,
under this seat's scratch root:

- `.ufo/waves/round-27/scratch/SentReportPath/.ufo/reports/round-27/{tabi.md,tabi-3box.md}`
- `.ufo/waves/round-27/scratch/SentReportPath/fx/.ufo/reports/round-27/{tabi.md,tabi-3box.md,tabi-fenced.md}`

`git status --porcelain` at hand-off: only pre-existing untracked wave/dir
artifacts (`.ufo/waves/round-27/w1.ready.dispatched`, `.ufo/waves/round-27/w2/`).

## Before → after measurements

| Check | Command | Observed |
|---|---|---|
| SHONEN.md box ground truth | `grep -cE '^- \[[ xX~]\]' SHONEN.md` | `4` (items: SKILL.md, domain task, executable instructions, no cross-domain bleed; all `[~]`) |
| Real green reference (fleet r26) | `node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md` | `PASS … — 6/6 sections in order; SHONEN 4/4 boxes`, exit 0; sha256 `4eb961e7…` |
| Compliant skeleton (my fixture, relative path from fx cwd) | `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/report-contract.mjs .ufo/reports/round-27/tabi.md` | `PASS .ufo/reports/round-27/tabi.md — 6/6 sections in order; SHONEN 4/4 boxes`, exit 0 |
| Box-count drift | same tool, 3-box copy | exit 1 — `(b) ## SHONEN carries 3 checkbox(es); SHONEN.md defines 4` |
| Fence-mask false green | same tool, all six headings + 4 boxes inside a ```` ``` ```` fence | exit 1 — `(a) missing section(s): work performed, landed changes, … shonen` and `(b) no ## SHONEN heading` |
| Waves-path refusal (round-25 defect class) | `node scripts/report-contract.mjs …/scratch/SentReportPath/.ufo/reports/round-27/tabi.md` | exit 1 — `(c) … is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md (round-25 defect class)` |
| Actual round-27 draft (absent at pre-flight) | `node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-27/tabi.md` | exit 2 — `ERROR cannot read report …: ENOENT` |
| Cited commits exist at tip `bceb17d` | `git cat-file -e <c>^{commit}` for fd722a7, 5577d1b, 6ca3b89, ef7a274, 024d60c, 5a0178c, 8e07f0b, 336d5d1, f185b4e7, bceb17d | all `ok` |
| Receipt path | `stat -c '%s %n' corpus/evidence/round-26/sources/s106.json` | `1750 …s106.json` |
| LOG.md evidence | `wc -l LOG.md`; `sed -n '1900,1930p'` ; lines 221/335/391/1090/1103/1664 | 1947 lines; correction block present with per-line citations (335/391/1090/1103/1863); cited lines carry the stale figures the corrections describe |

## Sources & frontier

- Box ground truth: `/home/vgpnk/Projects/shokunin/tabi-shokunin/SHONEN.md` — 4 items, one checkbox each.
- Contract spec: the assignment prompt (six `##` sections in order; exactly one `## SHONEN` with one checkbox per SHONEN.md item; final path `.ufo/reports/round-<N>/tabi.md`).
- Real green reference: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md` (sha256 `4eb961e7…`, unchanged by my runs).
- Utility: `scripts/report-contract.mjs` at `bceb17d`, identical to the w1 utility (sha256 `b1e296bf…`).
- Evidence commits: all ten ids above resolve at tip; receipt file exists.

Frontier moved: the report-shape contract is now verified end-to-end against the
landed tool; the only outstanding item is mechanical — re-run the utility against
the drafted `tabi.md` once ScribeFinalReport lands.

## Trend verdicts

- **expansion — unchanged.** No knowledge entry, registry row, census number, or
  tracked file touched; this seat is read-only by construction.
- **quality — better, bounded.** The round-25 M1 report-path defect is mechanised
  and the landed tool is byte-identical to the w1-validated utility; false-green
  directions (fenced headings, box drift, duplicate SHONEN, waves path) all fail
  red as verified above.
- **discernment — verified.** Path-shape, heading-order, and box-count clauses
  each produced the expected exit codes in my own runs, not only w1's.

## Risks & limitations

1. The actual round-27 draft was not available at pre-flight time (`ENOENT`); my
   PASS results come from an equivalent fixture, not from the real draft. The L1
   MUST re-run the receipt command below after ScribeFinalReport lands.
2. The utility's `SHONEN.md` box count is file-global (4); if a future SHONEN.md
   edit changes item count, the expected box count moves with it (intended).
3. This findings report is a waves-path file: running the utility on it exits 1
   on clause (c) by design (round-25 class) — expected, not a defect.

## Blockers

None. No installs, no external fetch, no tracked-file writes.

## Receipt — actual draft (pending, re-run by L1)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-27/tabi.md
# expected: report-contract: PASS /home/vgpnk/Projects/shokunin/.ufo/reports/round-27/tabi.md — 6/6 sections in order; SHONEN 4/4 boxes (exit 0)
```

At pre-flight (this run) the command exits 2 with `ENOENT`: the draft does not
exist yet. All clauses the tool will enforce are verified working; the draft only
needs the six headings in order (Work performed / Landed changes / Before →
after measurements / Sources & frontier / Trend verdicts / SHONEN) and exactly
four checkboxes under a single `## SHONEN` for the PASS receipt.
