# ConnCrossClaim — causal separation re-derivation (tabi round 43, w1)

- Seat: ConnCrossClaim (connector, leaf — no subagent dispatch)
- Axis judged: calibration
- Milestone: causal separation re-derivation
- Date: 2026-10-29
- Lane repo: /home/vgpnk/Projects/shokunin/tabi-shokunin (READ-ONLY; no writes/commits/fetches anywhere)
- Freeze commit: 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc (ancestor of HEAD ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c, confirmed below)
- Tools: none installed/upgraded (no install needed; only read/grep/sha256sum/git cat-file, all pre-existing). Nothing written to ~/.local/bin or any PATH dir.

## The sentence under test (claims.json `causalSeparation`, verbatim)

> "C1's counter reads only its own invocation's receipt, witness and signed measure record plus the frozen pins; it never reads the quarantine ledger, the registry or round-41 evidence. C2's checker reads only round-41/42 committed evidence, the registry, the round-43 freeze and its committed controls; it never reads round-43 C1 receipts. Each claim verifies without the other having landed."

## Method

Complete source read of the two counters and the wrapper (every line, no elision at decision time), grep enumeration of all path-bearing literals and all fs/process I/O call sites, plus dynamic byte-identity confirmation of the frozen files at the freeze rev. No runtime execution of either instrument was needed for path enumeration: the C2 checker is 224 lines with a single I/O pattern (`git -C repo show|cat-file|rev-parse <rev>:<path>`), the C1 counter is 274 lines, the wrapper 374 lines.

## Side C2 — every path the checker reads

File: `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` (sha256 at freeze rev = frozen pin 2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743, confirmed).

Static constants (lines 24–33) + one inline literal (line 189):

| Rule | Path | Class |
|---|---|---|
| r1a | `corpus/evidence/round41/playwright-egress/receipt.json` | round-41 evidence |
| r1b | `corpus/evidence/round41/playwright-egress/receipt.witness.json` | round-41 evidence |
| r1 | `.ufo/waves/round-41/measure/c1-measure.json` (object id pinned to `8ff64d69…3d35`) | round-41 measure record |
| r2 | `corpus/SOURCES.md` | the registry |
| r2 | `.ufo/waves/round-41/sources/node-cli-v24.21.0.html` | round-41 committed staged source copy |
| r3 | `.ufo/waves/round-41/controls/c1-baseline-noop.out` | round-41 control |
| r4 | `.ufo/waves/round-42/quarantine/re-adjudication.tsv` | round-42 quarantine TSV |
| r4 | `.ufo/waves/round-42/quarantine/slice-ids.txt` | round-42 quarantine |
| r5 | `.ufo/waves/round-43/claims.json` | the round-43 freeze |
| r6 | `.ufo/waves/round-43/controls/c2-v0-probe.json` | committed control |

Dynamic reads (r5, lines 190–201): for each `b` in `claims.controlBindings`, `requireBlob(b.path)` + `gitShow(b.path)`. Enumerated bindings in the frozen claims.json (all 8): `c1-baseline-tree-count.txt`, `c1-battery-r43.json`, `c1-replay-r42-refused.json`, `c1-synthetic-refused.json`, `c1-relabel-refused.json`, `c2-baseline-red-r43.json`, `c2-v0-probe.json`, `c2-tree-fixture.json` — all under `.ufo/waves/round-43/controls/`.

I/O discipline: `import fs from 'node:fs'` is present but `fs.` is never called (grep: zero hits) — every byte read flows through `git -C <repo> show|cat-file -t|cat-file -s|rev-parse <rev>:<path>`, i.e. committed object store at the measured revision, never the working tree. No path from `--repo` traversal, no env-derived paths, no receipt-content-driven opens (r6 parses probe JSON only for `refused`/`findingIds`/`fixtureRev`/`generatorDigest` fields).

**Cross-check vs round-43 C1 receipt/measure paths.** The round-43 C1 outputs are `corpus/evidence/round43/playwright-egress/receipt.json`, `corpus/evidence/round43/playwright-egress/receipt.witness.json` (both committed at HEAD ba433c9, after the freeze) and `.ufo/waves/round-43/measure/c1-measure-r43.json`. Intersection with the C2 read set: **empty**. The only round-43 C1 artifacts C2 touches are the five `c1-*` *control* files, and only because the freeze binds them (r5 freeze-binds-controls is C2's own rule); controls are refusal/battery evidence committed at the freeze, not C1 receipts or measure records. The sentence's "never reads round-43 C1 receipts" holds as worded. Nothing under `w1/` (seat reports, `swarm-registry.json`) is read.

## Side C1 — every path the wrapper and counter read

Files: `scripts/measure-c1-round43.mjs` (sha256 at freeze rev = pin 23afa29d…), `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` (sha256 at freeze rev = pin 6b8c8750…), both confirmed.

**Wrapper `measure-c1-round43.mjs` — repo-path reads/writes:**
- `SELF` = `scripts/measure-c1-round43.mjs`, `DRIVER` = `scripts/playwright-firefox-egress-round43.mjs`, `COUNTER` = `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` — read as bytes for the Stage-1 digest pin check (sha256File).
- `CLAIMS` = `.ufo/waves/round-43/claims.json` — read in `loadClaimsPins()` (the frozen pins).
- `--out <receipt>` (read back post-driver, hashed), `--out`→`.witness.json` (read back, hashed), `--measure-out <record>` (written) — its own invocation's artifacts, paths from argv.
- Non-repo: `/proc/uptime`, `/proc/self/environ`, `/proc/<pid>/{environ,stat,exe}` (self, gate child, witness samples), `getconf CLK_TCK`, `ps -eo pid=,ppid=`, `ss` (via driver), node `--eval` gate/witness children, driver child (`--out/--runs/--scratch/--nonce`, cwd=ROOT), counter child (`<receipt> --measure <record>` over fd3/fd4).
- `FIXTURES` = `.ufo/waves/round-41/fixtures` — **battery control mode only** (lines 347–352): the paths appear solely as strings inside child env vars (`NODE_OPTIONS=--require …/forger-round39.cjs`, etc.). The wrapper never opens them (no `readFileSync` on any FIXTURES-derived path; grep confirms the only occurrences are the five env-string templates and the constant). Fixtures are attack corpora, not round-41 evidence; Stage-0 refuses the child before any measurement state exists.
- Dead constant: `FIREFOX_BIN` (line 49) is never referenced again — the firefox binary path used for pinning arrives from the receipt's own `owned.roots[].exe`. Observation only.

**Counter `c1-signature-bound-v5.mjs` — reads:**
- argv receipt file + argv measure record; witness derived as `receipt.replace(/\.json$/, '.witness.json')` — its own invocation's receipt/witness/signed measure record.
- `CLAIMS` = `.ufo/waves/round-43/claims.json` — the frozen pins (line 268; also `ROOT`, `WRAPPER`, `DRIVER`, `import.meta.url` self-path for pin re-derivation).
- Firefox exe paths taken from the receipt's recorded `runs[].owned.roots[].exe` and hashed against `producerPins.firefoxBinSha256`; `process.execPath` hashed against `producerPins.nodeSha256`.
- fd3/fd4 challenge-response. No `spawn`/no `git`/no other fs opens.

**Cross-check vs quarantine TSV / registry / round-41 evidence.** Forbidden set: `.ufo/waves/round-42/quarantine/re-adjudication.tsv` (+ `slice-ids.txt`), the registry `corpus/SOURCES.md`, round-41 evidence `corpus/evidence/round41/playwright-egress/{receipt.json,receipt.witness.json}` and `.ufo/waves/round-41/measure/c1-measure.json`. Grep of wrapper + counter for `corpus|quarantine|registry|round-41|round-42|swarm|w1/|evidence`: wrapper hits are (a) comment lines, (b) the FIXTURES constant `.ufo/waves/round-41/fixtures` (battery-only env strings, never opened, and not any of the three forbidden classes); counter hits: **zero**. Driver (out of assigned scope, checked anyway): zero repo-path references — it reads `PLAYWRIGHT/package.json`, `/proc/*`, `ss`/`ps` output and writes only the `--out` receipt. Intersection with the forbidden set: **empty**.

## Independence ("each claim verifies without the other having landed")

- C1's chain (wrapper → driver → witness → counter) consumes only its own invocation artifacts + `claims.json` pins + producer binaries. It never touches C2's checker, C2's controls, or any r41/r42 evidence. ✔
- C2's checker consumes only r41/r42 committed evidence + the registry + the r43 freeze + freeze-bound controls — every one of those bytes was committed at or before the freeze 7ca6f018 (the five `c1-*` controls included). C1's receipts landed later (HEAD ba433c9) and are never read. So C2's verification has no input that C1's measurement produced. ✔
- One precision worth recording (observation, not a contradiction): the sentence says C2 reads "its committed controls"; in fact the freeze binds five C1-claim controls too, so C2 reads controls of both claims — but always *controls*, never *receipts/measure records*, which is what the separation sentence actually forbids. No amendment proposed (bytes frozen); the sentence is accurate as worded.

## Exact observed commands and output (abridged to decisive lines; all read-only)

```
$ grep -n "fs\." counters/check-routed-defects-round43.mjs        # no output — fs import unused
$ grep -nE "corpus|quarantine|registry|round-41|round-42|swarm|w1/|evidence" \
    scripts/measure-c1-round43.mjs
  48:const FIXTURES = path.join(ROOT, '.ufo/waves/round-41/fixtures');   # battery-only, never opened
  (+ comment lines only)
$ grep -nE "corpus|quarantine|registry|round-41|round-42|swarm|w1/|evidence" \
    .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs            # no output
$ grep -nE "tabi-shokunin|\.ufo|corpus" scripts/playwright-firefox-egress-round43.mjs   # no output

$ git rev-parse HEAD
  ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c
$ git cat-file -t 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc ; git merge-base --is-ancestor 7ca6f018… HEAD
  commit / yes
$ git cat-file blob 7ca6f018…:.ufo/waves/round-43/counters/check-routed-defects-round43.mjs | sha256sum
  2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  -   # == frozenDigests
$ git cat-file blob 7ca6f018…:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs | sha256sum
  6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  -   # == frozenDigests
$ git cat-file blob 7ca6f018…:scripts/measure-c1-round43.mjs | sha256sum
  23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  -   # == frozenDigests
$ sha256sum <worktree copies of all six frozen files>                 # all six == frozenDigests
$ git ls-tree -r --name-only HEAD -- corpus/evidence/round43
  corpus/evidence/round43/playwright-egress/receipt.json
  corpus/evidence/round43/playwright-egress/receipt.witness.json
```

## Evidence paths

- This report (self-contained; commands + outputs inline): `.ufo/waves/round-43/w1/ConnCrossClaim.md`
- Primary evidence (read-only, committed): `.ufo/waves/round-43/claims.json`, `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`, `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`, `scripts/measure-c1-round43.mjs`, `scripts/playwright-firefox-egress-round43.mjs`.

## Limitations

- Static re-derivation only; I did not execute either frozen instrument (other seats own C2 runtime probes). Completeness rests on full source reads: C2 checker 224/224 lines, C1 counter 274/274, wrapper 374/374, plus grep sweeps over all fs/spawn call sites — every read path enumerated above is the complete set.
- `causalSeparation`'s "the registry" is interpreted as `corpus/SOURCES.md` (the only registry-shaped artifact either side reads; C1 reads none). Under that reading both directions check out; no alternative registry path is read by either side.
- The wrapper→fixture reference is env-string-only in battery mode; if a future round ever reclassifies `.ufo/waves/round-41/fixtures` as "round-41 evidence" the sentence would need the receipts-vs-controls-style sharpening already noted — routed as an observation, not a finding, per the frozen-bytes rule.

## Assessment

Affected axes: calibration (positive; the frozen C2 checker's input closure is exactly its declared evidence class, and C1's chain has zero read overlap with C2's quarantine/registry/r41 inputs — the separation the round's two independent claims rest on is real in the bytes, not just the prose).

Proposed move: none required — separation re-derived consistent; the one sharpening (C2 reads freeze-bound C1 *controls*, not receipts; sentence already says "receipts") is accurate as worded and needs no change.

Risks of accepting: low; both read sets are closed under committed bytes at a pinned rev, and the freeze-rev byte identity of all three instruments was re-confirmed against `frozenDigests` in this seat.

VERDICT ok causal separation re-derived consistent — C2 checker reads zero round-43 C1 receipt/measure paths; C1 wrapper+counter read zero quarantine-TSV/registry/r41-evidence paths; both claims verifiable without the other landed
