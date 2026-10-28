# SentC2Checker — adversarial CLI probes of the round-42 C2 checker

Seat: `SentC2Checker` (leaf, no subagents).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; nothing written there except this seat dir).
Scratch: `/fast/scratch/hyaku/tabi-r42/SentC2Checker/` (deleted at yield; receipts copied here first).
Tested artifact (frozen bytes, unmodified):

```
sha256  b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8
        .ufo/waves/round-42/counters/check-routed-defects-round42.mjs   (168 lines)
```
Evidence: `evidence/checker.sha256`.

Nothing was installed or upgraded, so the tooling directive records no transaction (no pacman was
run: the host-wide pacman guard was respected).

---

## 0. Contract reproduced first (baseline, no fixture)

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
      --rev 9b6de3a19de11abdb80e82a1310abc64a40215bb \
      --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
exit=1
{ "schema": "tabi-r42-routed-defects", "rev": "9b6de3a19de11abdb80e82a1310abc64a40215bb",
  "predicate": false, "findingCount": 1,
  "findings": [ { "id": "r4-quarantine-absent",
                  "detail": ".ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV" } ] }
```

Same single finding at `HEAD` (`0081bfdb93b6bd1bf2853bb128996f1a976b7218`). This matches the frozen C2
statement: at the freeze only r4 is red, by design (the 38 verdicts are the wave's job). Evidence:
`evidence/base-freeze.json`, `evidence/base-head.json`.
Checks against frozen claim C2: **consistent** — the checker's exit contract (0 predicate true,
1 findings, 2 usage/internal) and its five clauses are exercised by probes below.

## 1. How the checker touches the world (code argument, needed for every write claim)

- `line 25: import fs from 'node:fs'` — **`fs` is imported and never used.** `grep -nE 'fs\.'` over the
  file returns nothing; there is no `writeFile`, `appendFile`, `mkdir`, `unlink`, `rm`, or any stream.
- The only I/O is two helper functions, each `spawnSync('git', [...])` with an **argv array** (no shell):
  - `line 56`: `git -C <repo> show <rev>:<path>` (encoding `buffer`, `maxBuffer 64 MiB`)
  - `line 61`: `git -C <repo> cat-file -s <rev>:<path>` (encoding `utf8`)
- `line 39`: `sha256` via `crypto.createHash` over the already-fetched buffer.
- `line 52`: the only argument gate — `if (!rev || !repo || !/^[0-9a-f]{40}$/.test(rev)) die(...)`, so a
  malformed `rev` short-circuits before any child process exists.
- `--repo` is **not** validated (not resolved, not tested for existence) and is passed only as the value
  of `git -C`, i.e. one argv element. It cannot become a git option or a shell word.

Empirical confirmation (`evidence/trace-write-check.txt`, `evidence/exec-summary.txt`):

```
$ strace -f -qq -e trace=openat,open,creat,unlink,unlinkat,rename,renameat,truncate,ftruncate \
      -o trace.log node <checker> --rev 9b6de3a… --repo <lane> --json
exit=1
## write-mode opens under lane tree: 0
## unlink/rename/truncate/ftruncate lines: 0
$ strace -f -qq -e trace=execve …      # 11 actual launches, all:
execve("/usr/bin/git", ["git","-C",<lane>,"show",…])          ×8 (measure, receipt, witness, SOURCES, staged html, baseline control, slice-ids, tsv)
execve("/usr/bin/git", ["git","-C",<lane>,"cat-file","-s",…]) ×3 (receipt, witness, baseline control)
# 8 + 3 = 11 = `grep -cE 'execve\("/usr/bin/git"'`; every argv begins ["git","-C",<lane>,…]
```

The only `O_RDWR` opens in the trace are `openat(AT_FDCWD,"/dev/null",O_RDWR)` — `spawnSync` stdio
plumbing, not repo files. Lane `git status --porcelain` was unchanged apart from a sibling seat's new
`ExecCensus/` directory, and `.git/index` + `refs/heads/master` mtime/size were byte-identical before
and after (`evidence/mtimes.before|after`).
On the scratch fixture the same check is even tighter — `.git/index` **sha256 and mtime identical**
after a run (`evidence/idx.sha.before|after`, `idx.mt.before|after`):

```
7db5d1e9…cf6f1  7db5d1e9…cf6f1     INDEX-BYTE-AND-MTIME-IDENTICAL
```

Conclusion for every probe below: **no filesystem write of any kind is reachable**, by construction
(zero fs API calls, only `git show`/`git cat-file -s`, no shell) and by observation.

## 2. Fixture

Because `git show <rev>:<path>` needs committed bytes, probes P4–P8 and the extras run against a
throwaway repo at `/fast/scratch/…/fixture` (15 commits, `evidence/fixture-log.txt`,
`evidence/fixture-files.txt`). Git writes there were made by the harness in scratch only — never in the
lane, the fleet repo, a sibling `*-shokunin` repo, or shokuknow; no commit/push anywhere else.
The fixture reproduces every clause (receipt+witness >1000 bytes digest-bound to a measure record,
S146 `rejected`, S148 `supersedes S146 — …` verbatim in a staged html copy, baseline control with
`ls-tree` + `0`, 38 slice ids, 38-row TSV, 38 evidence blobs ≥200 bytes) and **must score predicate
true before a variant is trusted**:

```
$ node <checker> --rev 47b35f3bd70b9b0bc16766935798c7f9960ec2c6 --repo <fixture> --json
exit=0   predicate=true  findingCount=0
```

`evidence/probe-results.json` line 1 (CONTROL) and `evidence/probe2-results.json` line 1 (CONTROL2,
`rev abfe4a4…`) both show `exit=0 predicate=true`.

---

## 3. Probes P1–P8

### P1 — `--rev` short hash (7 hex) → usage, exit 2  ✅
```
$ node <checker> --rev 0081bfd --repo . --json                  # real lane
exit=2
{"schema":"tabi-r42-routed-defects","error":"usage: node check-routed-defects-round42.mjs --rev <40-hex rev> --repo <lane repo> [--json]"}
```
Reproduced on the fixture (`--rev 47b35f3`, `exit=2`, 21 ms). The error goes to **stderr**; stdout is
empty. `/^[0-9a-f]{40}$/` is an exact-length match, so 7/39/41 hex all die. Writes: none (die()
precedes any `spawnSync`).

### P2 — shell metacharacters → exit 2, nothing executed  ✅
```
$ node <checker> --rev '; rm -rf /tmp/x' --repo . --json
exit=2  → same usage error

$ node <checker> --rev 0081bfdb93b6bd1bf2853bb128996f1a976b7218 --repo '.; rm -rf /tmp/x' --json
exit=1  → 7 findings, all "not committed at REV" (git -C failed; fail-closed, no shell)

$ node <checker> --rev 47b35f3… --repo '$(rm -f <scratch>/pwned-canary)'        → exit=1, 7 absent findings
$ node <checker> --rev '`rm -f <scratch>/pwned-canary`' --json                   → exit=2, usage
$ canaryPreExists=true  canaryStillExists=true
```
`/tmp/x` already existed (empty, mtime `2026-10-28 12:17:48`, i.e. **before** this seat's first probe at
~12:40) — it is not attributable to this checker; other lanes are running the same P2 wording. To get a
discriminating artifact I used a seat-local canary that did not pre-exist and that the injected strings
would have deleted: **it survived**. The structural reason is stronger than the observation: `spawnSync`
receives an argv array, `shell` is not set, and `--rev` never reaches a child at all.
Writes: none (nothing executed; canary intact).

### P3 — `--repo` is a symlink to the lane  ✅ (identical behaviour)
```
$ ln -s /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/…/symlink-to-lane
$ node <checker> --rev 9b6de3a… --repo /fast/scratch/…/symlink-to-lane --json   → exit=1, [r4-quarantine-absent]
$ node <checker> --rev 9b6de3a… --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json → exit=1, same
symlinkOutputEqualsReal: true   symlinkExit=1   realExit=1
```
Byte-identical stdout. `git -C` resolves the symlink before opening the repository, so the checker sees
the same object store. Acceptable for a read-only checker, and it cannot be used to widen anything: the
symlink only redirects *reads of committed objects*. Writes: none (the checker never writes, so a
symlink cannot redirect a write).

### P4 — CRLF line endings  ✅ stripped
Fixture commit `78a44a8`, TSV bytes on disk start `"S102\tpresent\t…S102.md\r\nS10"`:
```
$ node <checker> --rev 78a44a8… --repo <fixture> --json
exit=0  predicate=true  findingCount=0
```
Mechanism: `line 137` maps every line through `.replace(/\r$/, '')` before splitting on tabs, and
`sliceIds` go through `.trim()` (which also eats `\r`). Extra check: CRLF in **slice-ids.txt** alone
(commit `2cacd3c`) → `exit=0 predicate=true`. So CRLF is **stripped, not refused**. Writes: none.

### P5 — evidence path `../../etc/passwd` → `r4-evidence-absent`, no outside read  ✅
Fixture commit `f0d8d2d` (row 1 evidence `../../etc/passwd`, row 2 `/etc/passwd`):
```
$ node <checker> --rev f0d8d2d… --repo <fixture> --json
exit=1
findings: [ {id:"r4-evidence-absent", detail:"S102: evidence ../../etc/passwd not committed at REV"},
            {id:"r4-evidence-absent", detail:"S106: evidence /etc/passwd not committed at REV"} ]
```
The path is interpolated into `"<rev>:<path>"` and handed to `git cat-file -s`; git treats everything
after `:` as a **tree path inside that commit**. There is no `fs.readFile`, no `path.resolve`, no
`open()` on the working tree, so `../` and leading `/` cannot escape. Verified by tracing the exact
probe run: `evidence/trace-p5-summary.txt` → `count=0` references to `/etc/passwd` anywhere in the
1761-line trace, and 0 write/deletive syscalls under the fixture path. Writes: none.

### P6 — 5000-row TSV: terminates, but linear and unbounded ⚠ soft DoS
Fixture commit `84222a9`, 5000 rows (duplicate slice ids, valid verdicts), 280000-byte TSV:
```
$ node <checker> --rev 84222a9… --repo <fixture> --json
exit=1  findingCount=1  ["r4-duplicate-ids"]  elapsed 8.3 s   (re-run under fleet load: 14.1 s)
```
Under the 60 s budget, so **not** a DoS at the specified size. But the cost is one child process per
row (`gitBlobSize` inside the per-row loop, line 156) and **there is no row cap** — the checker pins
`sliceIds.length === 38` but never bounds the TSV's line count. Measured scaling:

| rows | verdict | wall | notes |
|---|---|---|---|
| 38 | valid | 0.10 s | baseline |
| 5000 | invalid (`bogus`) | 0.06 s | parse only; 5000 `r4-verdict-enum` findings, no spawns |
| 5000 | valid | 8.3 s / 14.1 s | 5000 `git cat-file -s` launches |
| 20000 | valid | 44.9 s | same shape, 20 000 launches |

≈2.2 ms/row of subprocess cost → the 60 s budget is exhausted at **~27 000 rows** (commits `3003e9d`,
`07ab202`). A one-line cap (`lines.length > sliceIds.length` → malformed finding) would bound it.
Secondary volume note: 5000 malformed rows print **430 420 bytes** of JSON (a 5000-entry findings
array). Writes: none.

### P7 — unicode / emoji staged ids  ✅ findings, no crash
(a) emoji+fullwidth id in the TSV only (commit `04fc78b`):
```
exit=1  ["r4-ids-missing","r4-ids-extra"]
  "tsv misses staged ids: S102"
  "tsv has unknown ids: Ｓ102🦊"
```
(b) same unicode ids in **both** `slice-ids.txt` and the TSV (commit `b41de49`; ids
`Ｓ102🦊`, `S106-ünïcødé-🧪`):
```
exit=0  predicate=true  findingCount=0
```
Exactly the intended behaviour: comparison is exact-byte after `trim()`, no normalisation, no locale
dependence, no exception. Writes: none.

### P8 — pipe (`|`) inside the S148 teaches cell: no crash, but silent cell truncation ⚠
The parser is `text.split('\n')` → `row.split('|')` → `cell(l,n)` (lines 96–99). A pipe inside the
teaches cell therefore **shifts every later cell and truncates the teaches text at the pipe**. It does
not throw. Three variants on the fixture:

**P8a (commit `b33495e`)** — teaches = `supersedes S146 — A space-separated list of command-line options. | EXTRA-JUNK`
```
exit=0  predicate=true  findingCount=0
```
The row **passes while misaligned**: the checker reads teaches as `supersedes S146 — A space-separated
list` (the pipe is a cell boundary), i.e. a 4-word quote that is still a verbatim substring, and reads
cell 8 as `command-line options.` instead of S148's status. Nothing flags the extra pipe.
**P8c (commit `9db8167`)** — teaches = `supersedes S146 — Not verbatim junk | A space-separated list of command-line options.`
```
exit=1  ["r2-quote-not-verbatim"]
```
The genuine verbatim quote sits after the pipe and is invisible; the row is *rejected for the wrong
reason*. So the same parser defect can both admit a shortened citation and reject a correct one.
**P8b (commit `09f0ba2`)** — pipe in **S146**'s teaches:
```
exit=1  ["r2-s146-not-rejected"]  detail: "S146 status is 'EXTRA-JUNK', expected 'rejected'"
```
Static status cell shifts one to the right → false red.

Impact assessment: the verbatim-substring test still binds whatever text the checker *sees*, so this
cannot admit a fabricated quote — only a **truncated** one (`supersedes S146 — X | junk`) where X is a
real substring, plus cell-misattribution on that same row. As instructed, the census is expected to flag
the malformed row separately; the checker's own contribution is that it does so **silently** rather than
with an `r2-row-malformed`-style finding. Smallest remediation (not applied; frozen bytes): reject rows
whose `split('|').length` differs from the header's, or parse with a trailing-cell-aware split.
Writes: none.

---

## 4. Extra CLI probes (cheap, same harness)

| # | input | exit | result |
|---|---|---|---|
| X1 | TSV row with trailing tab (4 cells) | 1 | `r4-row-malformed` "line 1: expected 3 tab-separated cells, got 4" + `r4-ids-missing: S102` — correct |
| X2 | UTF-8 BOM on first id (commit `f657283`) | 0 | **accepted**: `String.trim()` strips U+FEFF, so the id matches; benign, no crash |
| X4 | `--rev deadbeef…` (40 hex, no such object) | 1 | 7 absent-findings — fail-closed, never "true" |
| X5a | `--repo /etc/passwd` (regular file) | 1 | 7 absent-findings — `git -C` fails; no read of the file |
| X5b | `--repo ''` | 2 | usage (empty string is falsy) |
| X6 | unknown flag `--bogus-flag` | 0 | silently ignored, normal run (strict-parse nit only) |
| X7 | uppercase 40-hex rev | 2 | usage — regex is lowercase-only (fine: callers pass `git rev-parse` output) |
| X8a | `--rev` twice (bad then good) | 0 | last one wins |
| X8b | `--rev --repo <rev>` (flag swallowed) | 2 | usage — fails closed |
| X9 | no `--json` flag | 0 | identical JSON: `jsonOut` is parsed and **never used** (dead variable; output format is unconditional) |

All of these wrote nothing (single-process, no fs API).

## 5. Findings (severity / impact / smallest remediation)

1. **LOW-MEDIUM — unbounded linear subprocess cost (P6).** Every TSV row with an in-enum verdict
   triggers a `git cat-file -s` child; no row cap. 5000 rows = 8–14 s; ~27 000 rows ≈ the 60 s gate.
   Impact: a large committed TSV can stall the calibration gate (self-DoS), and output volume grows to
   ~430 KB per 5000 malformed rows. Remediation: cap rows at `sliceIds.length` (or 2× for duplicates),
   or resolve sizes in one `git cat-file --batch-check` pass.
2. **LOW — pipe inside a table cell is not detected (P8).** `split('|')` silently truncates the teaches
   cell and shifts later cells: a truncated-but-verbatim quote passes (P8a), a genuine quote after a
   pipe is rejected with the wrong reason (P8c), and S146's status can be read from the wrong cell
   (P8b). Remediation: compare `row.split('|').length` with the header's and emit a dedicated
   malformed-row finding.
3. **INFO — dead code / inert flag.** `import fs` (line 25) unused; `jsonOut` (line 49/51) never read.
   Harmless, but `fs` being imported is exactly what makes a reviewer ask "does it write?" — deleting it
   makes the read-only property self-evident.
4. **INFO — residual, out of scope to test here.** `git` is resolved via `PATH` (strace shows 12
   candidate directories probed before `/usr/bin/git`), and the checker trusts the target repo's git
   configuration. Only `show <rev>:<path>` and `cat-file -s` are invoked, neither of which runs hooks or
   a pager, so no command-execution path was found; but the PATH search is a supply-chain surface
   (`env -i PATH=/usr/bin` would remove it).

No HIGH finding. Every hostile input either failed safe (exit 2 / fail-closed findings) or produced the
documented finding id; no input crashed the checker, executed anything, or wrote a byte.

## 6. Limitations

- P4–P8 and X* were measured on a synthetic fixture in scratch that I authored; it reproduces the
  clauses and scores predicate-true, but it is not the lane's real corpus. The real-lane baseline (r4
  absent only) is reproduced at both `9b6de3a` and `HEAD`.
- 20 000-row timing (44.9 s) was taken while ~100 sibling seats were running; absolute wall times are
  inflated relative to an idle host (the same 5000-row run moved 8.3 s → 14.1 s). Ratios and the
  rows→spawns→time linearity are unaffected.
- The claims/counter bytes are frozen and were not modified; the `r4` red state at the freeze is
  reproduced, not adjudicated. This seat assigned no C2 verdict from the probes: it reports checker
  behaviour only.
- `/tmp/x` pre-existed this seat's work; the injection evidence therefore rests on the seat-local
  canary plus the argv/shell analysis of lines 52–61.

VERDICT ok checker rejects all malformed CLI input with exit 2 or fail-closed findings, executes no shell text, and writes nothing (fs imported but never called; only `git show`/`git cat-file -s` via argv arrays); two non-blocking defects recorded — unbounded per-row subprocess cost (soft DoS ≈27k rows, 5000 rows = 8.3 s) and silent `|`-in-cell truncation of S148/S146 teaches cells.
