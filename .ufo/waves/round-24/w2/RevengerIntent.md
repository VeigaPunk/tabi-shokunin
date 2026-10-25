# RevengerIntent — routed defect 5 (receipt exit 1 vs command exit 128), reconstruction

Seat: W2 revenger, tabi round 24, reviewed tip `ad125e85c235e1c4ec6a08e398bd64da01f68a08`.
Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; fleet spot-check report
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` (read-only). Read-only git only.
All numbers below carry the command that produced them.

## Bottom line

The **literal** field defect does not reproduce — true, and the round-24 wording is
revision-accurate. But "**does not reproduce**" answers the wrong question. The routed
defect's own criterion is "re-deriving the receipt must reproduce its fields," and at the
tip the receipt still fails that criterion on **three other attestation fields**
(`after.scriptSha256`, `after.lessonSha256`, `after.policySha256`) that resolve to no
master-line blob. The wording is honest for the `before.exit` literal and **incomplete —
it hides a live instance of the same defect class**, not a stale one.

## What the routed defect actually said

`corpus/lessons/round-23-verifier-spotcheck.md` §4.5: "`c1-measurements.json` `before.exit`
is `1` while the command it names (`git cat-file -e …`) exits **128**, as the report
correctly says. Re-deriving the receipt must reproduce its fields."

Its claimed reviewed tip is stated in the spot-check header: **"reviewed lane tip
`c90dffd3807a68de7ab9c6503273eeddbcd03e2b`"** (`git show 573c99e:…` head of file). The
C1 re-check table (`:34-38`) quotes the receipt via **`git show 03c1b4d:corpus/evidence/
round-23/c1-measurements.json`** — the superseded blob.

## Every revision of `corpus/evidence/round-23/c1-measurements.json` (committed bytes only)

`git log --all --source --format='%h %S %ad %s' -- corpus/evidence/round-23/c1-measurements.json`
yields three distinct blobs on the landing line (jj/keep snapshots of the working copy carry
the same blobs — `8df585c`,`2e1e4bc`,`4fa822b`,`893634e`,`b34a69b`,`1be32fe`,`a802304`,`318405d`):

| Landing commit | blob | `before.exit` | `after` shape | `at` |
|---|---|---|---|---|
| `03c1b4d` | `6103e58` | **1** | `after[0].rev=a89f1935 exit 1 classes 6 roundTotal 129` | `07:14:36Z` |
| `7ac9fff` | `a80d243` | **128** | `after.rev=03c1b4d exit 1` + `scriptSha256 325006d2` | `07:29:16Z` |
| `dfae5cd` | `a0532c7` | **128** | same, `scriptSha256 325006d2` re-pinned + `selfAudit` block | `07:34:01Z` |

Commands: `git rev-parse <c>:corpus/evidence/round-23/c1-measurements.json` (blob); `git show
<c>:corpus/evidence/round-23/c1-measurements.json` per commit (field reads). The file
appears under **no** other path (`git log --all --full-history --find-renames` → same set).

- **The commit that changed the field:** `7ac9fff` (`git diff 03c1b4d 7ac9fff -- …` →
  `before.exit` 1→128, `instrumentPresent` removed, `command` re-spelled `a89f193`→`a89f193`,
  `note` added; `after` restructured and `after.rev` re-pinned `a89f1935`→`03c1b4d`). `dfae5cd`
  only re-pinned `scriptSha256` and added `selfAudit`; it did **not** touch `before.exit`.
- **The commit the spot-check actually read:** `03c1b4d`. Its C1 table cell is
  `git show 03c1b4d:…`; blob `6103e58` is the only one with `"exit": 1` at line 11
  (`git show 03c1b4d:… | nl -ba` → line 11 is `"exit": 1`, matching `spotcheck.md:104`'s
  citation "`c1-measurements.json:11`"). The field was corrected at `7ac9fff` — **before** the
  spot-check's own reviewed tip `c90dffd` (04:40) and before the spot-check landed `573c99e`
  (04:40:48). So the spot-check graded a **superseded blob** while asserting tip `c90dffd`.
  `[OBSERVATION]` This is a verifier-side stale-read, not a lane defect at the reviewed tip.

Re-verified live: `git cat-file -e a89f1935f523a64b00991d792fca6a8c0d321948:scripts/round-evidence-audit.mjs`
→ `fatal: … exists on disk, but not in 'a89f1935…'`, `exit=$?` → **128**. The corrected
`before` arm is itself consistent.

## What the round-24 report said, and whether it is honest

Three durable records (verified at tip):
- `corpus/lessons/round-24.md:88` — "does not reproduce: `git show c90dffd:…` and `573c99e:…`
  both read 128; the stale `1` lived at `03c1b4d` until `7ac9fff`."
- `LOG.md:1780-1781` — same.
- `SCORECARD.md:1260-1261` — "5 — receipt exit field: **does not reproduce** at the reviewed tip
  or the baseline … the defect describes the blob at `03c1b4d`, where the field was `1` until
  `7ac9fff` corrected it — recorded, not 'fixed'."

Every numeral checks out: `git show c90dffd:…` → `before.exit 128`; `git show 573c99e:…` →
`before.exit 128`; `git show 03c1b4d:…` → `before.exit 1`. **[OBSERVATION]** The sentence is
**true as written** — the field doesn't reproduce, the revision attribution is correct, and the
correction commit is correctly named.

## But it hides a live defect — two ways

### A. The routed defect's *criterion* still fails at the tip, on fields nobody re-derived

The routed defect ends: "Re-deriving the receipt must reproduce its fields." The tip receipt
`corpus/evidence/round-23/c1-measurements.json` `after` block pins four digests attesting the
measured artifacts. **None of the three resolvable ones matches the blob at the rev it names.**

`git show ad125e8:corpus/evidence/round-23/c1-measurements.json | <field>` vs `git show 03c1b4d:<path> | sha256sum`:

| Pin | receipt value (prefix) | blob at `after.rev=03c1b4d` | match? |
|---|---|---|---|
| `after.scriptSha256` | `325006d2…` | `git show 03c1b4d:scripts/round-evidence-audit.mjs` → `6eeaeda7…` | **no** |
| `after.lessonSha256` | `f0f8a9c6…` | `git show 03c1b4d:corpus/lessons/round-23.md` → `e5195499…` | **no** |
| `after.policySha256` | `b5f635af…` | `git show 03c1b4d:.ufo/waves/round-23/claims.json` → `5ed36177…` | **no** |

Where do those digests live? Sweep of every `scripts/round-evidence-audit.mjs` blob across all
refs (`git log --all --format=%H -- scripts/round-evidence-audit.mjs | while read c; git rev-parse
$c:…`) — six distinct blobs, sha256 `6eeaeda7`,`e88a078e`,`978dfc49`,`ddee0113`,`0a1f9572`,
and `325006d2`. The pinned `325006d2` blob (`0cd9d58`) is carried **only by jj/keep
working-copy snapshots** (`318405d`,`a802304`,`1be32fe`,`4fa822b`,`893634e`,`b34a69b`), never on
the master line — the master commits at 04:33:45 carry `6eeaeda7`, not `325006d2`. Same for the
lesson/policy pins: `f0f8a9c6`/`b5f635af` match no `corpus/lessons/round-23.md` /
`claims.json` blob at any landing commit `03c1b4d…ad125e8` (sweep above, all `e5195499`,`98555c0e`,
`d39da4df`,`885608ce`,`ecebe639` / `5ed36177`,`423dd914`,`3f474771`).

**[OBSERVATION]** The `after` arm attests to blobs that were never committed at the rev it names —
the working copies were measured, then either rewritten or never landed (the round-23 routed
defect 2 class). At the reviewed tip, `git show 03c1b4d:scripts/round-evidence-audit.mjs | sha256sum`
yields `6eeaeda7`, not `325006d2`, so a re-derivation of the receipt's own pinned fields fails.
**[INFERENCE]** This is the *same defect family* routed defect 5 names — a receipt field that does
not reproduce its attestation — alive at the tip on three fields, while the disposition records the
class as "does not reproduce, recorded not fixed." The narrower `m2` gate cannot see it because it
only re-runs `command`/`exit` pairs; it has **no predicate for `*Sha256` pins** at all. That is a
live instrument gap, not a stale one.

### B. The verdict recasts a verifier misgrade as a lane pre-correction

The spot-check **graded a superseded blob** (`03c1b4d`) while asserting reviewed tip `c90dffd`.
The round-24 disposition rewrites that as "the defect describes the blob at `03c1b4d`, where the
field was `1` until `7ac9fff` corrected it — recorded, not fixed." That is the charitable lane-side
reconstruction, but it erases the material fact: the defect was filed **against the wrong revision
by the verifier** — a read-time error class (`m2`-adjacent, but for the *grader*, not the lane).
No gate or disposition records "the spot-check cited revision X while claiming tip Y"; `m2` re-runs
receipt commands but never checks that a report's quoted blob is the tip it asserts. **[INFERENCE]**
Presenting "does not reproduce" as the defect's disposition, without recording that the spot-check
itself read a stale blob, is honest for the field and incomplete for the class.

## Corroborating, separate (still a live calibration gap, same shape)

The **C2 claim itself** has the identical freeze-vs-measured mismatch:
`claims.json` C2 `before: 4`, `after: 0`, but the committed receipt
`corpus/evidence/round-24/c2-measurements.json` `before.mismatches: 5` (4×m1 + 1×m3 at `573c99e`)
and `after.mismatches: 1` (m3, `b973fde`). Re-runs: `--rev 573c99e` → mismatches=5 (matches receipt);
`--rev b973fde` → mismatches=1 (matches receipt, not the claim's 0); `--rev ad125e8` → mismatches=1
(m3, `git status --porcelain -uall` = 8 in-flight W2 paths). So the claim's `0` is reachable only at
a quiescent worktree; `m3` is read against the live tree, not committed bytes, so the tip's
"clean, exit 0" verdict is not reproducible from `--rev` alone. **[OBSERVATION]** the claim table's
`before: 4`/`after: 0` disagree with the lane's own committed receipt (`5`/`1`) — the same
self-assessment/observed-state class the gate exists to catch, present in the claim file itself.

## Evidence chain (grounded numbers)

- `git rev-parse <c>:corpus/evidence/round-23/c1-measurements.json` → blob per commit (table above).
- `git cat-file -e a89f1935f523a64b00991d792fca6a8c0d321948:scripts/round-evidence-audit.mjs` → 128 (live).
- `node scripts/check-selfassessment.mjs --rev 03c1b4d… --json` → the **red state the gate exists to
  catch**: `m2-receipt-exit`, `claimed: 1, observed: 128`, `doc: corpus/evidence/round-23/c1-measurements.json`,
  counted. `[OBSERVATION]` the instrument does produce the routed defect 5 state at `03c1b4d`, so the
  class is detectable — `does not reproduce` is a *revision* fact, not an instrument blindness.
- `node scripts/check-selfassessment.mjs --rev ad125e8 --json` → mismatches=1 (m3), exit 1.
- `git log --all --format=%H -- scripts/round-evidence-audit.mjs` + per-commit `sha256sum` → pinned
  `325006d2` resolves to blob `0cd9d58` on jj/keep snapshots only.
- Fixture (throwaway, scratch only): `git show 03c1b4d:scripts/round-evidence-audit.mjs >
  .ufo/waves/round-24/scratch/RevengerIntent/audit-at-03c1b4d.mjs` → sha256 `6eeaeda7` — the
  *real* script at `03c1b4d`, distinct from the pinned `325006d2`.

## Verdict

- `before.exit: 1` vs `128`: **does not reproduce at the reviewed tip** — honest and exact.
- The commit that changed the field: **`7ac9fff`** (`6103e58`→`a80d243`).
- The commit the spot-check actually read: **`03c1b4d`** — a superseded blob, below its own
  claimed tip `c90dffd`.
- "Does not reproduce" as the disposition of routed defect 5: **honest for the literal field,
  but it hides a live defect of the same class** — the receipt's `after.*` attestation pins
  resolve to no committed blob, so re-deriving the receipt's fields still fails at the tip.
  Confidence: high on every numeral and blob; the *interpretation* (that this is the same
  defect class rather than a merely-consistent-but-unlanded pin) is marked `[INFERENCE]` —
  it depends on reading routed defect 5's own closing sentence ("re-deriving the receipt must
  reproduce its fields") as the defect's contract, which the round-24 disposition itself cites.
