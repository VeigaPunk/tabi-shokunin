# MutC2Size — r1 size-floor mutation (tabi round 42, wave 1)

Seat: `MutC2Size` (leaf, no subagent dispatch). Lane: `tabi-shokunin`.
Scope: one mutation probe against the frozen C2 checker
`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` (lane bytes, read-only).

## 0. Artifact identity (lane bytes, never edited)

```
$ sha256sum .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .../check-routed-defects-round42.mjs
```
Toolchain: `node v24.21.0`, `git version 2.56.0`. No tools installed or upgraded (pacman guard honoured; nothing needed).

Lane hash re-checked **after** all detector runs — unchanged:
`b1d05df1…b4a8`. No writes, commits, fetches or pushes in the lane, the fleet repo, sibling
`*-shokunin` repos or `shokuknow`.

## 1. Method

1. Copied lane counter bytes to scratch twice (`check-pristine-copy.mjs`, `check-mutant.mjs`);
   both hashed `b1d05df1…b4a8`, i.e. byte-identical to the lane before mutation.
2. Built scratch git fixtures under `/fast/scratch/hyaku/tabi-r42/MutC2Size/`; each
   `git init -q`, then the tasking's guard **before any commit**:
   `[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ]` → `toplevel guard: OK` for all three.
3. Applied mutation **M** to `check-mutant.mjs` only.
4. Ran the **same bounded detector pair** on pristine and mutant bytes against the **same**
   fixture revisions: pristine from lane bytes read-only (`node <lane path> --rev … --repo <fixture>`),
   mutant from the scratch copy.

### Mutation M (exact diff; only the two assigned clauses removed)

```
$ diff -u check-pristine-copy.mjs check-mutant.mjs
@@ -77,12 +77,8 @@
 for (const [id, p, key] of [['r1a', RECEIPT, 'receiptSha256'], ['r1b', WITNESS, 'witnessSha256']]) {
   const size = gitBlobSize(p);
   if (size === null) { add(`${id}-${p.includes('witness') ? 'witness' : 'receipt'}-absent`, `${p} not committed at REV`); continue; }
-  if (size < 1000) { add(`${id}-too-small`, `${p} committed blob is ${size} bytes (<1000)`); continue; }
   const raw = gitShow(p);
   if (raw === null) { add(`${id}-unreadable`, `${p} unreadable at REV`); continue; }
-  let doc = null;
-  try { doc = JSON.parse(raw.toString('utf8')); } catch { add(`${id}-unparseable`, `${p} does not parse as JSON`); continue; }
-  if (!doc || typeof doc !== 'object') { add(`${id}-unparseable`, `${p} is not a JSON object`); continue; }
   const want = measureDoc && measureDoc[key];
```
Presence (`size === null`), readability, measure-record binding and sha256 equality are **retained**,
so any mutant green is attributable only to the dropped size floor / JSON parse.
`node --check check-mutant.mjs` → OK.
Hashes: pristine copy `b1d05df1…b4a8` → mutant `6d35f7f903d813e0803ebdea2c5d398e7dbe9d709353a5ac90ec5c355e7af615`.

## 2. Fixtures

All paths relative to each fixture repo root; `ls-tree -r -l` receipts in `fixture{1,2,3}-ls-tree.txt`.

**fixture1** (rev `3bd4079ea47bbf67a64012e5e5e8535ce3aa98e5`) — the assigned fixture:
- `corpus/evidence/round41/playwright-egress/receipt.json` = `not-json-12b` → **12 bytes**, not JSON,
  sha256 `82edf103126d2a7d2b905b2f04e162046070ab4855c64518dc3d4213347a1eff`;
- `receipt.witness.json` = `witness-10` → **10 bytes**, not JSON,
  sha256 `09bb78821476f28ac403213080983272edd707b1e0b8b066c35115daf70844ed`;
- `.ufo/waves/round-41/measure/c1-measure.json` — self-authored, `receiptSha256`/`witnessSha256`
  set to exactly those two digests (matching sha256s of the tiny files);
- R2/R3/R4 satisfied synthetically so the **only** deviation from green is r1a/r1b:
  `corpus/SOURCES.md` (header + `S146` status `rejected` + `S148` teaches
  `supersedes S146 — A space-separated list of command-line options.`, 6-word quote verbatim in
  committed `.ufo/waves/round-41/sources/node-cli-v24.21.0.html`),
  `.ufo/waves/round-41/controls/c1-baseline-noop.out` (`git ls-tree … | wc -l` + `0`),
  38-id `.ufo/waves/round-42/quarantine/slice-ids.txt` + 38-row `re-adjudication.tsv`
  (`present` × 38) + 248-byte committed evidence blob.

**fixture2** (rev `660a117aaa6ff828feb118057bb6e35fb0795b4f`) — supplementary, isolates the
*parse* half of M: receipt and witness are 1200-byte **non-JSON** blobs (`NOT-JSON-` + 1191 × `x`,
sha256 `cacae529…44a4`) with matching measure record.

**fixture3** (rev `9cd3306555f3c8008995b47470724aa2d59905b6`) — digest-integrity control: 1200-byte
**valid JSON** receipt/witness, measure record binds `000…0` digests (deliberate mismatch).

## 3. Red/green table

| Fixture | Checker | Exit | Findings |
|---|---|---|---|
| fixture1 (12 B / 10 B non-JSON, digests match) | **pristine** (lane bytes) | **1** | `r1a-too-small` (`committed blob is 12 bytes (<1000)`), `r1b-too-small` (`10 bytes (<1000)`) — `findingCount: 2` |
| fixture1 | **mutant** (M) | **0** | `[]` — `predicate: true`, `findingCount: 0` |
| fixture2 (1200 B non-JSON, digests match) | pristine | 1 | `r1a-unparseable`, `r1b-unparseable` |
| fixture2 | mutant | 0 | `[]` — `predicate: true` |
| fixture3 (1200 B valid JSON, digest mismatch) | pristine | 1 | `r1a-digest-mismatch`, `r1b-digest-mismatch` |
| fixture3 | mutant | 1 | `r1a-digest-mismatch`, `r1b-digest-mismatch` |

Raw outputs: `out-pristine.json`, `out-mutant.json`, `out-pristine-fixture2.json`,
`out-mutant-fixture2.json`, `out-pristine-fixture3.json`, `out-mutant-fixture3.json`.

**Read:** the mutant greens the exact fixture the pristine checker refuses, for both dropped
clauses separately (size floor via fixture1; JSON parse via fixture2), while the retained digest
binding still refuses fixture3 identically in both copies. The dropped clause is **load-bearing**;
mutation M is **killed** — it is not a silent weakening.

## 4. Limitations

- Fixtures are self-authored: R2/R3/R4 content is synthetic by construction, so this probe proves
  the r1a/r1b clauses are individually load-bearing, not that the *real* round-41 evidence passes
  R2-R4 (that is the lane's own predicate run, not this seat's).
- Fixture1 exercises size before parse; the pristine checker therefore cannot show
  `unparseable` for it (the size branch `continue`s). fixture2 supplies that isolation.
- All `re-adjudication.tsv` rows in the fixtures point at one shared evidence blob; the checker
  imposes no per-row uniqueness, so this is a legitimate but dense fixture.
- The mutant also drops the `typeof doc !== 'object'` guard implicitly; that path is unreachable
  once parse is removed, so it carries no separable behavior.
- Nothing here is a claim verdict: the probe only measures whether the clause is observable.

## 5. Restoration evidence

`check-mutant.mjs` re-copied from lane bytes after the probe:
```
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  check-mutant.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  (pristine scratch copy, same)
cmp -s check-mutant.mjs <lane path>  →  IDENTICAL to lane bytes
```
Scratch root `/fast/scratch/hyaku/tabi-r42/MutC2Size/` deleted after the evidence copies
(`build-fixture.sh`, `mutation.diff`, six `out-*.json`, three `*-ls-tree.txt`, `hashes.txt` live in
this seat directory).

VERDICT ok — mutation M (dropped ≥1000-byte floor + JSON parse in r1a/r1b) greens fixtures the pristine checker refuses (exit 0 vs exit 1 on `r1a-too-small`/`r1b-too-small`, and on `r1a-unparseable`/`r1b-unparseable`), while retaining digest refusal on the control fixture: the dropped clause is load-bearing and M is killed.
