# ScriC2Entry — errata compliance check (tabi round 42, w1)

**Seat:** `ScriC2Entry` · **Lane:** tabi · **Subject rev:** `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (HEAD)
**Baseline rev:** `34e177959d1b7ce04afb85a001420e02631ce79e` · **Freeze rev:** `9b6de3a`
**Scope:** read-only compliance audit of the round-42 errata against committed bytes. No corpus
edit, no commit, no push, no agent dispatch.

---

## Bottom line

The append is mechanically clean (pure append, byte-exact prefix) and its *diagnosis* of the
quote defect is exactly right. But the registry transition it names is **not structurally
compliant**: the lane's own SOURCES gate went from **clean (exit 0)** at baseline to
**failed (exit 1, 2 findings)** at HEAD, caused solely by the errata commit.

| # | Assigned check | Result |
|---|---|---|
| 1 | Errata is a pure append (prefix-preserving) | **PASS** — append starts at 0-based byte offset **6642** (1-based byte 6643); identical sha256 over the first 6642 bytes |
| 2 | Changes no measured claim, only source pointer + quote | **PASS for the entry file** (`+13/−0`, one insertion hunk at line 72; every pre-existing byte of every measured claim unchanged). **Not harmless elsewhere** — see F1/F2: it flipped `S146.status` in place and repointed `used-by` to a nonexistent file, breaking the SOURCES gate |
| 3 | S146/S148 transitions match registry bytes | **PARTIAL** — the four *named* transitions all match the registry bytes exactly, but two of them are contract-invalid and the errata's own word count is wrong |

```
VERDICT finding
```

---

## Check 1 — prefix preservation (proof)

Evidence: `evidence/01-prefix-proof.txt`

```
$ git show 34e1779...:corpus/knowledge/environment-injection-...round-41.md | wc -c
6642
$ wc -c corpus/knowledge/environment-injection-...round-41.md
7459

$ sha256sum <baseline blob>            b039365670f915ef7d99df47c708e44ec110ab1bad9f9d868b26503d507adb05
$ sha256sum <current file>             6d34d4555d913906bcb485694bc1eb6c04acd744a96de8525dde58d463352056
$ head -c 6642 <current> | sha256sum   b039365670f915ef7d99df47c708e44ec110ab1bad9f9d868b26503d507adb05   # == baseline

$ git show <baseline> > base.md; cmp -l base.md <current>
cmp: EOF on base.md after byte 6642
$ head -c 6642 <current> | cmp base.md -
PREFIX_IDENTICAL_6642

$ git diff --numstat 34e1779..HEAD -- <file>
13	0	corpus/knowledge/environment-injection-...round-41.md
$ git diff --unified=0 34e1779..HEAD -- <file>
@@ -71,0 +72,13 @@
```

- **Append starts at byte offset 6642 (0-based) / byte 6643 (1-based).** `cmp` reports
  `EOF on base.md after byte 6642`, i.e. every byte 1..6642 matches; the prefix sha256 equals
  the whole baseline blob's sha256.
- `--numstat` is `13 0` and the only hunk is `@@ -71,0 +72,13 @@` — an insertion that deletes
  nothing. No in-place rewrite of the entry occurred.

## Check 2 — does it change a measured claim?

The appended text is a new `## Errata` section only. Because the hunk is `-71,0 +72,13`, **no
pre-existing byte of the entry changed** — so the entry's measured claims (the round-40
F4-full replay, the `predicate=true` result, the V1-V8 vector table, the declared residuals)
are untouched, and the errata's sentence *"No measured claim in this entry changes"* is true
**for this file**.

That sentence is true only for this file. The same commit (`9b6de3a`) edited
`corpus/SOURCES.md` in two places, and those edits are **not** harmless — they break the
lane's own structural gate (F1) and leave a dangling pointer (F2). The errata describes itself
as "only the source pointer and quote"; in the registry that is a `status` flip plus a
`used-by` repoint, which is more than a pointer-and-quote edit and is subject to contract
Rule 2 (F5).

## Check 3 — named transitions vs registry bytes

Evidence: `evidence/02-sources-cells.txt`. Registry column order is
`id|source|kind|tier|scope|anchor|teaches|status|opened|recheck|used-by`, so `teaches`=cell 7,
`status`=cell 8, `used-by`=cell 11.

| Errata's claim | Registry bytes at HEAD | Verdict |
|---|---|---|
| S146 status changed `mined` → `rejected` | baseline `status='mined'` → HEAD `status='rejected'` | **matches** (but invalid, F1) |
| S146 `used-by` moved to `corpus/lessons/round-42.md` | `used-by='corpus/lessons/round-42.md'` | **matches the string**, but the path **does not exist** (F2) |
| S148 teaches begins `supersedes S146` | `teaches='supersedes S146 — A space-separated list of command-line options.'`; `re.match(r'^supersedes S146\b')` → `True` | **matches** |
| S148 quote is the corrected verbatim quote | residual quote `'A space-separated list of command-line options.'`, `html.includes(q)` → **True**, occurrence count 1 | **matches** |
| S148 is "verbatim, **7 words**" | measured **6** whitespace tokens (whole cell 9, em dash counted) | **mismatch** (F3) |
| `S147 is unchanged` | S147 row byte-identical baseline vs HEAD (`cmp -s` → identical) | **matches** |
| S146's old quote "spliced two source fragments with a semicolon and is not a verbatim substring" | source reads `…command-line options. options... are interpreted before command-line options…`; carried quote `…options; interpreted before command-line options` → `in` = **False**, count 0; the second fragment alone also count 0 | **matches exactly** (errata diagnosis is correct) |
| "This entry's loader-channel source is S148" | entry line 3 still reads `source: S146 …`; body lines 21-24 still present the splice; `corpus/README.md:878` already says `S148 (supersedes S146)` | **prospective only** (F4) |

Frozen C2 checker at HEAD (evidence `06-checker-head.json`), bytes sha256
`b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`:

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
      --rev 0081bfdb… --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
{ "schema": "tabi-r42-routed-defects", "rev": "0081bfdb…", "predicate": false,
  "findingCount": 1,
  "findings": [ { "id": "r4-quarantine-absent", … } ] }
EXIT=1
```

Only `r4` is red ⇒ **D2 is closed under the frozen r2 predicate** (this matches the freeze
note in the assignment). The r2 block reads `cell(s148, 7)` — cell 7 *is* `teaches` under the
registry header, so the checker's comment and code agree; there is no prose/code divergence.

---

## Findings

### F1 — HARD: the errata commit turned the SOURCES gate from clean to failed

Evidence: `evidence/03-gate-baseline.txt`, `evidence/04-gate-head.txt`, `evidence/05-gate-patched.txt`

```
# baseline 34e1779, full `git archive` extract, its own script bytes
$ node $S/baseline/scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=147 tiers=A:131,B:7,C:9 status=queued:15,mined:123,rejected:9 findings=0
EXIT=0

# HEAD 0081bfd
$ node scripts/check-sources.mjs
FINDING id=rejected_without_flip fleet=- row=S146 detail=rejection_requires_reason_and_flip
FINDING id=used_by_missing      fleet=E11 row=S146 detail=path_missing
SOURCES_GATE verdict=failed rows=149 tiers=A:133,B:7,C:9 status=queued:15,mined:124,rejected:10 findings=2
EXIT=1
```

Attribution is clean: `git diff --stat 34e1779 HEAD -- scripts/check-sources.mjs` is **empty**
(the instrument is byte-identical), and both findings name **S146**, the only row the errata
changed in place. My first baseline attempt archived only `corpus scripts` and produced a
spurious `S143 used_by_missing`; re-running against the **full** baseline tree gave
`findings=0`, so that first reading was an extraction artifact and is discarded.

Cause: the errata flipped `status` to `rejected` but left `teaches` carrying the old spliced
quote. Contract v1 requires rejected rows to read `REJECTED: <reason>; flip: <what would
change the verdict>` (`.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:34-35`), and
`scripts/check-sources.mjs:325-326` enforces it.

### F2 — HARD: `used-by` points at a file that does not exist

Evidence: `evidence/02-sources-cells.txt` (tail)

```
$ ls -la corpus/lessons/round-42.md
ls: cannot access 'corpus/lessons/round-42.md': No such file or directory
```

Highest committed lesson is `corpus/lessons/round-41.md`. Two contract consequences:
1. `used_by_missing` (E11) — the path dangles.
2. Contract Rule 2 requires every in-place `status`/`used-by` change be *"logged old→new in
   the round lesson"*; that log does not exist, so the errata's parenthetical
   "(old→new logged in the round-42 lesson)" is an unbacked claim at every committed rev.

The gate also enforces `used_by_uncited` — a repaired target must literally contain `S146`.

### F3 — LOW: the errata's own word count is wrong

Evidence: `evidence/09-wordcount.txt`

```
teaches cell      = 'supersedes S146 — A space-separated list of command-line options.'
whole-cell tokens = 9
residual quote    = 'A space-separated list of command-line options.'
residual tokens   = 6 -> ['A','space-separated','list','of','command-line','options.']
```

The errata states `verbatim, 7 words`. The stripped quote is **6** words (9 for the whole cell;
8 only under a non-standard hyphen split). The frozen checker's bound is `1..25`
(`check-routed-defects-round42.mjs:112`), so this **does not gate r2** — it is an accuracy
defect in the correction document, not a measurement failure.

### F4 — LOW/MEDIUM: the corrected pointer is not reflected in the bytes the entry itself cites

Evidence: `evidence/10-cross-references.txt`

- `corpus/knowledge/environment-injection-…-round-41.md:3` → `source: S146 …` (still S146)
- `:21-24` → still renders `"a space-separated list of command-line options ... interpreted
  before command-line options"` (an elided splice, not a verbatim substring)
- `corpus/lessons/round-41.md:20` → still renders the spliced quote, labelled "(10 words)"
- `corpus/README.md:878` → already reads `S148 (supersedes S146), S147`

So the errata's sentence "This entry's loader-channel source is S148" is the **only** pointer;
the entry's own `source:` line still resolves a reader to a now-`rejected` row. The round-41
verifier's D2 fix instruction (`corpus/lessons/round-41-verifier-spotcheck.md:76`) explicitly
asked for "the lesson/entry rendering" to be fixed too; that part is unfulfilled. This is
append-only-consistent (the body cannot be rewritten) but needs one explicit pointer sentence,
which patch `03` supplies.

### F5 — STRUCTURAL (routed, not amended): contract Rules 1/2 cannot both hold for this flip

Contract v1 Rule 2 (`SOURCES-CONTRACT-v1.md:49-51`): *"Only `status`, `recheck` and `used-by`
change in place… A correction is a new row whose `teaches` opens `supersedes S0NN —`."*
Contract shape rule (`:34-35`): a `rejected` row's `teaches` must read `REJECTED: …; flip: …`.

An in-place `mined`→`rejected` flip is therefore **unrepresentable**: satisfying the shape rule
requires editing `teaches`, which Rule 2 forbids in place. The errata chose the flip (required
by C2's r2 predicate) and left `teaches` untouched, producing F1. Two honest exits exist and
they are mutually exclusive — **this is a contract hole to route, not to amend**:

- **A** (keeps r2 true): edit `teaches` in place to the `REJECTED:/flip:` form, and accept a
  documented Rule-2 exception. → patch `01` + `02`.
- **B** (keeps Rule 2 pure): leave `S146` `mined`, carry the rejection entirely on `S148`; the
  gate goes clean but C2's r2 (`S146.status == 'rejected'`) becomes false.

I do not pick one for the lane; C2's frozen predicate makes **A** the only option that keeps
D2 closed, and A is what the drafts implement.

---

## Drafted corrections (patch files — corpus untouched)

All three are in `.ufo/waves/round-42/w1/ScriC2Entry/patches/`. Nothing was applied to the lane
tree; validation ran on `git archive HEAD` copies in scratch.

| Patch | File | Effect |
|---|---|---|
| `01-s146-rejected-shape.patch` | `corpus/SOURCES.md` | Rewrites S146 `teaches` to `REJECTED: <splice reason>; flip: <a verbatim ≤25-word quote carried by a superseding row>`. `status` stays `rejected` (r2 preserved); `used-by` unchanged. |
| `02-round-42-lesson-old-new-log.patch` | `corpus/lessons/round-42.md` (new) | Supplies the Rule-2 old→new log for S146 `status`/`used-by`/`teaches` and the S148 opening; contains the literal `S146` so `used_by_uncited` passes. Marked as a draft patch payload, not a landed lesson. |
| `03-errata-wordcount-append.patch` | `corpus/knowledge/environment-injection-…-round-41.md` | **Pure append** correcting `7`→`6` words and naming the entry's `source:` line and body splice as round-41 freeze bytes superseded by S148. First 7459 bytes stay byte-identical (`PATCH3_PREFIX_7459_IDENTICAL`). |

Validation (scratch only):

```
$ patch -p1 --dry-run < each of the three      # all: "checking file …", no rejects
$ patch -p1 -s      < each                    # APPLIED ×3 on a pristine HEAD tree

$ node scripts/check-sources.mjs              # patched tree
SOURCES_GATE verdict=clean rows=149 tiers=A:133,B:7,C:9 status=queued:15,mined:124,rejected:10 findings=0
EXIT=0

$ node r2-replica.mjs …                       # faithful replica of checker lines 96-118
HEAD    {"quote":"A space-separated list of command-line options.","words":6,"verbatim":true}  R2_PASS
PATCHED {"quote":"A space-separated list of command-line options.","words":6,"verbatim":true}  R2_PASS
```

So the patch set is gate-clean **and** r2-preserving. `01+02` are the load-bearing repair;
`03` is the fidelity correction the assignment asked for.

---

## Limitations

- The r2 evaluation on the patched tree is a **replica** (`evidence/07-r2-replica.txt`) of the
  frozen checker's lines 96-118, not the checker itself: the checker reads `git show`, and the
  lane bounds forbid any git mutation (including `git init` in scratch). The real checker was
  run unmodified against the real repo at HEAD (`evidence/06-checker-head.json`), where r2
  passes; `01/02/03` do not touch `S148` or S146's status, so r2 cannot change.
- I did not evaluate C2's r1/r3/r4 or C1 at all; `r4-quarantine-absent` is reported only as the
  checker's raw output, not adjudicated — the quarantine seats own it.
- `scripts/check-sources.mjs` cannot see whether a source was opened; no network fetch was made
  (all quote checks are against the committed staged HTML).
- Whether `corpus/lessons/round-42.md` is scheduled to land later in this wave is outside my
  seat; the finding is stated at committed revs, where it does not exist.
- Toolchain: `node --version`, `git --version`, `python3 --version` in
  `evidence/11-toolchain.txt`; `patch` from base. **No installs** (no pacman, no uv, no
  downloaded binaries) — nothing to record beyond that.

---

## Evidence index

`evidence/01-prefix-proof.txt` · `02-sources-cells.txt` · `03-gate-baseline.txt` ·
`04-gate-head.txt` · `05-gate-patched.txt` · `06-checker-head.json` · `07-r2-replica.txt` ·
`08-verbatim.txt` · `09-wordcount.txt` · `10-cross-references.txt` · `11-toolchain.txt` ·
`12-anomaly-symlinks.txt`

Patches: `patches/01-s146-rejected-shape.patch`,
`patches/02-round-42-lesson-old-new-log.patch`, `patches/03-errata-wordcount-append.patch`

## Appendix — untracked symlinks that appeared mid-session (not this seat's write)

Evidence: `evidence/12-anomaly-symlinks.txt`

```
$ ls -la corpus/knowledge/knowledge corpus/lessons/lessons
lrwxrwxrwx … 12:39 corpus/knowledge/knowledge -> /…/tabi-shokunin/corpus/knowledge/
lrwxrwxrwx … 12:39 corpus/lessons/lessons     -> /…/tabi-shokunin/corpus/lessons/
```

Two self-referential directory symlinks appeared **inside the read-only corpus tree** at
12:39, mid-wave. They were absent from the `git status` captured at this seat's start, and this
seat issued no `ln`/symlink command. `scripts/check-sources.mjs --self-test` cannot be the
source: it creates fixtures only under `mkdtempSync(tmpdir())` (line 493) and removes them
(line 526). The likely origin is a peer's in-flight path-escape fixture written into the live
tree — the same class as the named round-39 `shokuknow` incident.

Impact on this seat: **none.** The gate resolves only `corpus/SOURCES.md` and the paths named
in `used-by` cells, and no row cites these paths; re-running the gate after they appeared gives
byte-identical output to `04-gate-head.txt` (2 findings, both S146). I did **not** delete them —
not this seat's write, and a peer's test may still own them. Flagged for the judge: any seat
measuring `used_by_escape` in the live repo would be contaminated by them.

VERDICT finding — append itself is byte-clean (offset 6642) and its diagnosis is correct, but it flipped S146 to a contract-invalid `rejected` row pointing at a nonexistent `corpus/lessons/round-42.md`, taking the SOURCES gate from clean to 2 findings, and its "7 words" is measurably 6.
