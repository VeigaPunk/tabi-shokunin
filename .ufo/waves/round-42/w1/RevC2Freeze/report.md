# RevC2Freeze — pre-data freeze integrity audit (tabi round-42, claim C2)

- Seat: `RevC2Freeze`, leaf reviewer, no subagent dispatch, no commits/pushes.
- Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only for this seat).
- Judged on: calibration. Milestone: freeze integrity audit.
- Frozen claim under audit: **C2** (round-41 routed-defect ledger closure, predicate
  `claims[C2].predicate`), checker `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`.
- Evidence dir: `.ufo/waves/round-42/w1/RevC2Freeze/` (this file's directory), `MANIFEST.sha256`
  lists every artifact's sha256. Scratch (`/fast/scratch/hyaku/tabi-r42/RevC2Freeze`) removed at yield.

Headline: **the freeze itself is intact** — ordering, byte identity across every ref, empty diff,
and byte-exact control reproduction all hold. **The frozen checker has one real instrument hole**
(r4 evidence accepts a directory instead of a committed blob, with the same class of hole in r3),
which is a finding, not a freeze violation: the claim and counter bytes were frozen before any
seat data and were never touched.

---

## 1. Freeze predates the wave — ordering

Commands and output are recorded verbatim in `git-evidence.txt` §A1.

```
$ git -C <repo> log --format='%H %cI %s' -n 4
0081bfdb93b6bd1bf2853bb128996f1a976b7218 2026-10-28T12:26:20-03:00 round-42: SCORECARD declared-claims section (frozen predicates, C1/C2)
236c4f49f6cf8be7fd2efc71c7e89b7465b47a27 2026-10-28T12:23:38-03:00 round-42: C1 live measurement (...) + battery/replay controls; C1/C2 pre-data controls; wave w1 spec+dispatch(64 seats, attack 23/64)+registry+ready; LOG pre-dispatch entry
9b6de3a19de11abdb80e82a1310abc64a40215bb 2026-10-28T12:07:26-03:00 round-42: freeze C1 (...) + C2 (routed-defects ledger) claims and checker; land r41 defects D1 (...), D2 (...), D3 (...); open S149; baseline red control 34e1779
34e177959d1b7ce04afb85a001420e02631ce79e 2026-10-28T08:58:58-03:00 round-41 verifier spot-check (integrator, hyaku): non-author admit/reject
```

- Freeze `9b6de3a` at **12:07:26-03:00**; dispatch `236c4f4` at **12:23:38-03:00**: freeze precedes
  dispatch by **16m12s**. Exactly one commit lies between them, and it is the dispatch itself
  (`git log 9b6de3a..236c4f4 --reverse` → only `236c4f4`).
- Ancestry (not just timestamps):
  `git merge-base --is-ancestor 9b6de3a 236c4f4` → PASS, and `9b6de3a` is an ancestor of `HEAD` → PASS.
- The dispatch commit is the one that introduces the wave: `git show --stat 236c4f4 -- .ufo/waves/round-42/`
  adds `w1-spec.json` (584 lines, 64 items), `w1-dispatch.json` (1003), `w1-run-output.json` (1003),
  `w1.ready`, `w1/swarm-registry.json` (649), plus the C1/C2 pre-dispatch controls.
- The freeze tree contains **no seat data**: `git ls-tree -r --name-only 9b6de3a -- .ufo/waves/round-42/w1`
  → empty. The freeze tree contains exactly claims.json, two controls, the counter, three `measure/census-start.*`
  files, three `quarantine/slice-*.txt`, and `sources/git-ls-tree.html`.
- The dispatch payload itself names the freeze: `w1-spec.json.context` states "Two frozen claims, frozen
  BEFORE any seat data at commit 9b6de3a19de11abdb80e82a1310abc64a40215bb (baseline 34e1779…)".
- Corroborating local state (not committed evidence, so weighted low): `claims.json` mtime 12:01:32,
  seat directories under `w1/` created from 12:38:05 onward.

## 2. Predicate ↔ checker header ↔ code conditions

Frozen predicate (1070 chars, sha256 `a66358d2…`), extracted from the freeze commit — full text in
`c2-predicate.txt`:

> At the measured revision the checker exits 0: (r1a) `corpus/evidence/round41/playwright-egress/receipt.json`
> is a committed blob of at least 1000 bytes whose sha256 equals `receiptSha256` in the committed
> `.ufo/waves/round-41/measure/c1-measure.json` and whose bytes parse as JSON; (r1b) `receipt.witness.json`
> likewise equals `witnessSha256` and parses; (r2) `corpus/SOURCES.md` at the revision carries row S148 whose
> teaches cell begins `supersedes S146` and whose remainder is a verbatim substring of the committed
> `.ufo/waves/round-41/sources/node-cli-v24.21.0.html` of at most 25 words, and row S146's status cell is
> `rejected`; (r3) `.ufo/waves/round-41/controls/c1-baseline-noop.out` is a committed nonempty blob recording
> the ls-tree counting command and the digit 0; (r4) `.ufo/waves/round-42/quarantine/re-adjudication.tsv` is
> committed with exactly the 38 identifiers of the committed `.ufo/waves/round-42/quarantine/slice-ids.txt`,
> no duplicates, every verdict in {present, absent, misbound, partial, unreachable}, and every evidence path a
> committed blob of at least 200 bytes.

The checker header (lines 6–29, verbatim in `git-evidence.txt` §A2 / `checker-header-sentence.txt`) is a
reformatting of the same sentence with `(r1a)…(r4)` labels and a trailing provenance note about S149/S148.
Token diff (129 predicate tokens vs 137 header tokens, ratio 0.677) shows only formatting/abbreviation
differences — "at the measured revision" → "at REV", "identifiers" → "ids", "and whose bytes parse as JSON"
→ "valid JSON", dropped articles. **No condition is added, dropped, or inverted in the header.** Both the
header and the predicate say r4 evidence must be "a committed blob ≥200 bytes" and r3 must be "a committed
nonempty blob".

Column semantics were verified against the real table, not assumed — `corpus/SOURCES.md:13`:

```
| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
```

so after `split('|')` the id is cell 1, **teaches is cell 7**, **status is cell 8** — exactly the indices the
code uses (`cell(s148, 7)`, `cell(s146, 8)`). Observed cells at HEAD:

```
S146  teaches=[A space-separated list of command-line options; interpreted before command-line options] status=[rejected]
S148  teaches=[supersedes S146 — A space-separated list of command-line options.] status=[mined]
```

S148's remainder is a 6-word verbatim substring of the committed staged HTML (`in html? True`), S146 is
`rejected`. Clause-by-clause:

| clause | predicate | header | code | verdict |
|---|---|---|---|---|
| r1a | blob ≥1000 B, sha256 == `receiptSha256` in committed measure, parses JSON | same | `gitBlobSize` ≥1000, `sha256(raw) === measureDoc.receiptSha256`, `JSON.parse` | matches; extra fail-closed guards (`r1-measure-absent/unparseable`, `r1a-binding-unavailable`) |
| r1b | "likewise" `witnessSha256`, parses | same | same for `WITNESS` | matches |
| r2 | S148 teaches begins `supersedes S146`, remainder verbatim ≤25 words in staged HTML; S146 status `rejected` | same | `/^supersedes S146\b/`, strip `/^supersedes S146\s*[—-]\s*/`, 1..25 words, `html.includes`, `cell(s146,8)==='rejected'` | matches (code adds separator + non-empty-word requirements — see F3) |
| r3 | committed **nonempty blob** recording the ls-tree command and digit 0 | "committed nonempty" | size `< 10` → empty; `/ls-tree/`; `/(^|[^0-9])0([^0-9]|$)/m` | **blob-ness not enforced** — F1; size floor 10 vs "nonempty" — F3 |
| r4 | tsv with exactly the 38 ids of slice-ids.txt, no duplicates, verdict in the 5-name enum, **each evidence path a committed blob ≥200 B** | same | `slice` 38 + set equality + dup scan + `VERDICTS` set (identical five) + `gitBlobSize(evidence) ≥ 200` | **blob-ness not enforced** — F1 |

Exit contract matches the sentence: predicate → 0, findings → 1, usage/internal → 2; `--rev` must be
40 lowercase hex. The checker is read-only as its header claims: it has **no** `fs.*` call at all
(mutation grep found nothing) and shells out only to `git show` and `git cat-file -s`.

## 3. Frozen bytes unamended (empty diff)

```
$ git diff --stat 9b6de3a..HEAD -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/
(no output)
$ git diff 9b6de3a..HEAD -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/ | wc -c
0
$ git status --porcelain -- .ufo/waves/round-42/claims.json .ufo/waves/round-42/counters/ .ufo/waves/round-42/controls/
(no output)
```

Blob identity at freeze / HEAD / worktree:

```
claims.json  53445f632acf24d3a816514b89268144122cc898  (all three)
             content sha256 ce7b56799cae7593d315330ffce460ac9236c1f343e40cf7212f334f7fd41d7a
counter      df98d84e765c69a6db50781e4eff4c7d88abfa47  (all three)
control      767c2cb7710e95ee5861c9fa6acd6a5faeee668c  (c2-baseline-red.json, freeze == HEAD)
```

Cross-ref check (`git log --all`) found four commits touching `claims.json`/the counter on **all** refs:
`9b6de3a` plus three unlabelled `refs/jj/keep/*` snapshots (`6cc6826`, `0ddc6f7`, `c4bea52`, timestamps
12:07:25–26). Every one of them records **the same blob** `53445f63…` / `df98d84…`, so they are snapshots of
the freeze content, not amendments. Nothing else on any ref carries a different version.

All round-42 changes since the freeze are **pure additions**:
`git diff --name-status 9b6de3a..HEAD -- .ufo/waves/round-42/ | grep -v '^A'` → empty (14 added control files
from the C1 measurement commit; no `M`/`D`/`R` of claims, counters, or pre-existing controls).

## 4. Baseline red control

`c2-baseline-red.json` and `.exit` are committed at the freeze (and unchanged at HEAD):

```
exit file:  predicate False + r1a-receipt-absent, r1b-witness-absent, r2-s146-not-rejected,
            r2-supersession-absent, r3-baseline-file-empty, r4-slice-absent, r4-quarantine-absent
json:       schema tabi-r42-routed-defects, rev 34e1779…, predicate false, findingCount 7
```

Live run of the working-tree checker at `34e1779` → **exit 1, 7 findings**, and `cmp` against the committed
control: **byte-identical** (both 990 bytes, sha256 `16d8cdca…`). Running the checker **blob extracted from
the freeze commit** at the same rev also reproduces the control byte-for-byte. Finding ids, order, and detail
strings all match — including `r2-s146-not-rejected` ("S146 status is 'mined', expected 'rejected'") and
`r3-baseline-file-empty` ("…committed blob is 0 bytes").

## 5. Pre-data state at the freeze (design check)

At the freeze revision the checker is red only on the clause the wave is meant to fill:

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 9b6de3a… --json
{ "predicate": false, "findingCount": 1,
  "findings": [ { "id": "r4-quarantine-absent",
                  "detail": ".ufo/waves/round-42/quarantine/re-adjudication.tsv not committed at REV" } ] }
exit=1
```

The `c2-at-freeze.json/.exit` control committed with the dispatch is **byte-identical** to my independent run
(sha256 `a4c33e4d…`), and records `C2_AT_FREEZE_EXIT=1`. `slice-ids.txt` at the freeze has exactly **38**
ids. The S149 staged copy's sha256 is `2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64`,
matching the digest frozen in `claims[C2].restsOn`. At HEAD the checker is still red only on
`r4-quarantine-absent` — no seat has committed quarantine data yet.

## 6. Differential fixture matrix (does the code mean what the sentence says?)

A throwaway git repo in scratch was built to satisfy the predicate with real blobs (**exit 0 reached** — the
counter is not stuck red), then single-property mutants (`fixture-run.txt`, `build_fixture.py`):

| probe | mutation | exit | findings |
|---|---|---|---|
| G0 | predicate-satisfying tree | 0 | — |
| M1 | r3 control = 9-byte `ls-tree 0` | 1 | `r3-baseline-file-empty` |
| M2 | S148 teaches `supersedes S146 <quote>` (no dash) | 1 | `r2-quote-not-verbatim` |
| M3 | receipt bytes changed | 1 | `r1a-digest-mismatch` |
| M4 | duplicate TSV id | 1 | `r4-duplicate-ids`, `r4-ids-missing` |
| M5 | verdict `verified` | 1 | `r4-verdict-enum` |
| M6 | evidence file 199 bytes | 1 | `r4-evidence-thin` |
| M7 | TSV row with 2 cells | 1 | `r4-row-malformed`, `r4-ids-missing` |
| G1 | restored | 0 | — |

Blob-ness probes (`blobness-probes.txt`, `probe-blobness.py`):

| probe | object the path names | checker | predicate |
|---|---|---|---|
| B1 | r4 evidence cell = `.ufo/waves/round-42/quarantine/evidence` (`cat-file -t` = **tree**, 1368 B) | **exit 0, predicate true, 0 findings** | "committed **blob** of at least 200 bytes" → **false** |
| B2 | r3 control path = directory holding files named `ls-tree` and `0` (tree, 64 B; tree bytes contain both tokens because entry names are stored literally) | **exit 0, predicate true, 0 findings** | "committed nonempty **blob** recording the ls-tree counting command and the digit 0" → **false** |
| B3 | receipt path = directory (tree, 38 B) | exit 1, `r1a-too-small` | fails closed; a ≥1000 B tree would hit `r1a-unparseable` |

---

## Findings

### F1 — MEDIUM: "committed blob" is not enforced; r4 evidence greens on a directory

`gitBlobSize()` (`checker-freeze.mjs:61`) runs `git cat-file -s <rev>:<path>`, which returns a size for
**any** object type. Two conditions build on it without a type check:

- **r4 evidence** (`for (const r of rows) { … const esize = gitBlobSize(r.evidence) … }`): a cell naming a
  directory with a tree object ≥200 bytes passes. Demonstrated: B1, `exit 0 / predicate true /
  findingCount 0` with evidence = `.ufo/waves/round-42/quarantine/evidence` (`git cat-file -t` → `tree`,
  `-s` → `1368`). The frozen predicate **and** the checker's own header require "a committed blob of at
  least 200 bytes".
- **r3 control** (`const raw = gitShow(BASELINE_OUT).toString('utf8')` then `/ls-tree/` and the digit-0
  regex): a directory whose *entry names* are `ls-tree` and `0` produces tree bytes containing both tokens.
  Demonstrated: B2, `exit 0 / predicate true` on a 64-byte tree object, while the sentence requires a
  committed blob recording a counting command.

Why this matters and how far it reaches: r4 **is** this round's deliverable (the 38 quarantine verdicts), so
a seat — honest (naming an evidence folder) or adversarial — can green r4 without any committed evidence
blob. That is precisely the class the C2 `killRule` contemplates ("any accepted fabricated/empty evidence …
refuses admission the same way: calibration holds its score and the hole is routed"). It is **prospective**,
not yet exercised: at HEAD r4 is still red on `r4-quarantine-absent`, and r3 currently greens on the real
4-line blob, so today's verdicts are unaffected. r1a/r1b are not exposed (`JSON.parse` refuses tree bytes).
Fix direction for the next instrument (not applied — counter bytes are frozen): assert
`git cat-file -t <rev>:<path> === 'blob'` in `gitBlobSize` before comparing sizes.

### F2 — LOW: `beforeState` enumerates 5 of the 7 baseline findings

`claims[C2].beforeState` says the checker "exits 1 with findings r1a-receipt-absent, r1b-witness-absent,
r2-supersession-absent, r3-baseline-file-empty, r4-quarantine-absent", while the committed control and the
live run at `34e1779` both carry **7** — they additionally include `r2-s146-not-rejected` and
`r4-slice-absent`. Exit code and `findingCount` agree; only the prose enumeration is incomplete. The
predicate is unaffected, and no amendment is proposed (bytes frozen).

### F3 — INFO: two code conditions are stricter than the sentence (fail-closed only)

- r3: code treats `< 10 bytes` as empty although the predicate says "nonempty". M1 shows a 9-byte
  `ls-tree 0` (nonempty, records the command and the digit 0) is flagged.
- r2: code requires the teaches remainder to be introduced by `—` or `-` and to have ≥1 word; M2 shows a
  no-dash `supersedes S146 A space-separated list…` reds although the sentence's remainder is a verbatim
  substring.

Both can only produce a red the sentence would not — never a false green. Recorded for the next instrument;
the real table's convention (`supersedes S0NN — …`, see `corpus/lessons/round-29-verifier-spotcheck.md:76`)
means neither edge fires on this round's data.

## Residual risk and verification gaps

- Commit timestamps are author-asserted. The ordering conclusion rests on ancestry, on identical blobs across
  every ref, on the empty `w1/` listing at the freeze, and on the single intervening commit — not on clock
  time alone.
- `stash@{0}` ("On (no branch): simplgates-verify") carries a `corpus/SOURCES.md` ±1-line change. It cannot
  affect measurement because the checker reads `rev:path` committed bytes only, but it is a latent
  alternate-worktree state a human reader could mistake for HEAD.
- Nothing in the frozen bytes constrains what a seat writes; the wave's 38 quarantine verdicts are not
  committed and were therefore **not** evaluated here — r4's actual closure is unmeasured by this seat by
  design.
- The differential fixture is synthetic (though it reproduces the real 11-column SOURCES layout); the
  real-revision checks (baseline, freeze, HEAD) were run against the actual repository.

## Tooling

No installs or upgrades; the host's pacman guard was respected (no pacman, uv, or network calls). Tools used
as found: `node v24.21.0`, `Python 3.14.8`, `git 2.56.0`. All work ran on loopback/local files only.

## Evidence index (`.ufo/waves/round-42/w1/RevC2Freeze/`)

| file | contents |
|---|---|
| `git-evidence.txt` | reproducible capture of every git check (§A1–A7), 242 lines |
| `capture-git-evidence.sh` | the script that produced it (read-only git) |
| `claims-freeze.json` | `claims.json` bytes at the freeze commit (7808 B) |
| `c2-predicate.txt` | the frozen C2 predicate sentence as extracted |
| `checker-freeze.mjs` | the counter blob at the freeze commit (9467 B, git blob `df98d84…`) |
| `checker-header-sentence.txt` | the header comment joined into one line for comparison |
| `control-baseline.json` / `run-baseline.json` / `run-baseline-frozenblob.json` | committed control, live run, frozen-blob run — all byte-identical (sha256 `16d8cdca…`) |
| `control-at-freeze.json` / `run-at-freeze.json` | freeze-state control and independent run (sha256 `a4c33e4d…`) |
| `fixture-run.txt` / `build_fixture.py` | matrix G0/M1–M7/G1 |
| `blobness-probes.txt` / `probe-blobness.py` | probes G/B1/B2/B3 (the F1 evidence) |
| `m8-tree-object.txt` / `m8-tree-evidence.json` / `m8-pre-green.json` | earlier capture of the B1 case |
| `MANIFEST.sha256` | digests of all of the above |

VERDICT finding — the C2 freeze is intact (pre-dispatch ordering, byte-identical claims/counter/control on every ref, empty freeze..HEAD diff, byte-exact baseline-red and at-freeze control reproduction) but the frozen checker does not enforce its own "committed blob" condition: r4 evidence greens on a directory (tree object, 1368 B) and r3 greens on a directory whose entry names carry "ls-tree"/"0", so r4 can pass without any committed evidence blob.
