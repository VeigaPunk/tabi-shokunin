# RerunDistinct — does the plain distinct counter close the four admitted constructions?

**Verdict (one paragraph).** The plain counter passes the lane receipt and fails the w1 forgery blobs
it was built for, but it does **not** close the fourth construction, and it does not close "two
runs" as a class. On the honest tree at `b234a58` it prints `ok: true`, `distinctRowIds 16`,
`distinctTranscriptPaths 2`, `distinctTranscriptDigests 2`, `driverSha256 55dbef88…` (`false` for
`driverEqualsGate`), `driverNames []`, `driverReexports false`, exit **0** — every number the entry's
§8 sentence names is reproducible and correct. The `R2 ×16` duplicate entry (v2 blob), the
same-transcript-path receipt (v3 blob), two byte-identical copies at distinct paths (v4 recipe from
the real receipt), and the re-export driver (v1 blob) each go red (exit 1) on the intended field.
But the construction that matters — **synthetic transcripts with the real first screenshot spliced
in**, driven by a driver that is never executed — **passes**: two attacker-authored transcripts with
distinct bytes/session ids/contexts/URLs, each carrying the real 6626-byte PNG
(`sha256 ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`, the exact payload of
the honest runs), plus a hand-written stub driver that names none of `liveRecord`/`PREDICATES`/
`goldenLines`, imports nothing from the gate, and re-exports nothing, over the **honest entry** →
`ok: true`, exit **0**. A weaker forgery also passes: one real transcript plus one byte appended to
its copy at another path (distinct digests, exit 0). So the entry's sentence "the plain counts that
close those four holes" (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:189-192`) is true for
three of the four and false for the spliced-screenshot one; what the counter measures is byte
distinctness and a static-text screen of the driver file, never provenance. That is a hole the plain
counts do not close, and it is the same boundary `claims.json:39` sells as "not reachable without a
committed receipt of two real runs from a driver other than the counter".

## What I attacked

`/…/tabi-shokunin/.ufo/waves/round-32/measure/c1-distinct.mjs` (sha256
`64cad7c6926b5d12e6a4f8c1801205e4e2c56143c539360ba0a07aa667e57280`) as the witness for the §8
sentence and for C1's evidence boundary — not as a replacement for the frozen gate. Model: the
attacker controls every byte of the tree except the counter. I ran it (a) on a clean clone of
`b234a58920134424e0d104f137311ff54a16d26b` and (b) on trees built from every blob in
`.ufo/waves/round-32/w1/CritC1Forgery/blobs/` plus reconstructions of the two constructions that
wave 1 admitted but did not leave blobs for (v4 identical copies; the spliced variants).

## Provenance

- Clone `git -C <S>/clone rev-parse HEAD` → `b234a58920134424e0d104f137311ff54a16d26b`;
  `git status --porcelain | wc -l` → `0`.
- Script copied byte-identically into scratch; both copies hash to `64cad7c6…7280` (above).
  Frozen gate `scripts/check-bidi-runtime.mjs` hashes to `2f25af5a…c393`, equal to `GATE_SHA`
  (`c1-distinct.mjs:16`) and to `claims.json` `frozenDigests`.
- Honest receipt self-consistency (node, in the clone): `run1.transcriptSha256` and
  `run2.transcriptSha256` match the file bytes (`8aa97463…`, `9918a716…`); `driverSha256`
  `55dbef88…` matches `scripts/bidi-loopback-round32.mjs`. No lane defect on the receipt.
- `node --version` → `v24.21.0`. No browsers, no chromedriver, no network fetch, no tool install.
  `pgrep -fa 'chromedriver|chromium' | grep <my scratch>` → no match (exit 1): nothing to kill.

## Results (all `--` free: `node c1-distinct.mjs <root> corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json`)

| case | tree | exit | decisive fields |
|---|---|---|---|
| `real` | clean clone `b234a58` | **0** | 16/16 distinct ids; 2 paths, 2 digests; driver `55dbef88…` ≠ gate; names `[]`; reexport false |
| `v1-reexport-samebytes` | v1 receipt + v1 entry + re-export driver + honest run1 bytes at both v1 paths | **1** | `distinctTranscriptDigests 1`, `driverReexports true` |
| `v1-spliced-distinct-reexport` | v1 receipt + **two distinct** synthetic transcripts (real PNG spliced) + re-export driver | **1** | `driverReexports true` only — digests 2, paths 2 |
| `v2-duplicates` | v2 entry (`R2` ×16) + honest receipt | **1** | `distinctRowIds 1`, `duplicateListings 15` |
| `v3-same-path` | v3 receipt + honest entry + gate bytes as `driver` + real run1 at the cited path | **1** | `distinctTranscriptPaths 1`, `digests 1`, `driverEqualsGate true`, `driverNames [liveRecord, PREDICATES, goldenLines]` |
| `v4-identical-copies` | real receipt, run2 → byte copy of run1 at a new path | **1** | `paths 2`, `digests 1` |
| `v4b-one-byte-copy` | real receipt, run2 → run1 **plus one trailing newline** | **0** | `paths 2`, `digests 2` — **passes** |
| `spliced-stub-driver` | honest entry + two distinct synthetic transcripts (real PNG spliced) + hand-written stub driver (`scripts/stub-driver.mjs`, names nothing, imports nothing) + `driverSha256` **field** set to the gate's digest | **0** | `ok true` — **passes** |
| `spliced-stub-driver-honest-hash` | same, but `driverSha256` field = the stub's real digest `a189d9af…` | **0** | `ok true` — **passes** |
| `real-receipt-counter-copy-driver` | honest receipt, `driver` renamed to a byte copy of the counter | **1** | `driverEqualsGate true`, names all three |
| `real-receipt-gate-hash-field` | honest receipt, `driverSha256` field overwritten with the gate digest | **0** | computed digest still `55dbef88…`: the field is never read |
| `one-row` | one-row entry (`R2` only) + honest receipt | **0** | `distinctRowIds 1` — no floor |
| `fourteen-rows` | 14 invented rows (`R1`..`R14`, method `m`, evidence `e`) + honest receipt | **0** | `distinctRowIds 14` — no row-validity check |
| `v8-r16-r18` | v8 entry (`R16 yes`, invented `R18 yes`) + honest receipt | **0** | no counterpart/known-row check (the gate's `x1`/`x2` are the only defence) |

Raw JSON and stderr for all fourteen cases: `evidence/runs/*.json`, `evidence/runs/summary.tsv`.
Builder: `evidence/build.mjs`; forged spliced artefacts: `evidence/spliced/` (receipt
`24004db4…4be1`, run1 `d2a37ec8…b4c5`, run2 `683898f0…61a2`, stub driver `a189d9af…b629`).

## Findings

**F1 — the spliced-screenshot construction passes the plain counts (high, against entry §8 and
`claims.json:39`).** `ok` is `distinctRowIds === rowsMarkedYes && transcripts >= 2 &&
distinctTranscriptPaths === transcripts && distinctTranscriptDigests === transcripts &&
driverSha !== null && !driverEqualsGate && names.length === 0 && !reexport`
(`c1-distinct.mjs:40-41`). Nothing in that expression is a provenance predicate: digests are
compared only for pairwise inequality (`:27`), the three symbol names are a `String.includes` screen
over comment-stripped text (`:31-32`), re-export is a regex (`:34`), and the driver is read as bytes
but never executed (`:30`). Two synthetic transcripts that differ in session id/context/URL and
share the one production payload a spliced screenshot needs therefore read as two independent runs.
Evidence: `evidence/runs/spliced-stub-driver.json` (`ok: true`, exit 0) and
`…-honest-hash.json`; the spliced payload is byte-identical to the honest first screenshot
(`ee0ede…`), i.e. exactly the v1 construction wave 1 admitted, minus the v1 blobs' self-inflicted
tell (equal transcript bytes) and minus the re-export driver. Smallest append-only fix (the counter
is frozen, so prose only): append a correction paragraph to the entry's §8 stating that the plain
counts close duplicate listings, same-path/identical-byte reruns and the two named driver shapes,
and do not close a synthetic transcript with a real screenshot spliced in or a driver that is never
executed; for that fourth construction the only evidence is the frozen gate's live leg plus
`w1/CritC1Forgery.md` D1, and no counter currently binds a transcript to the process that wrote it.
If a v2 counter is ever built, the single check that closes it is a per-run driver-emitted log whose
sha the receipt records and whose content carries that run's `sessionId`/`webSocketUrl`.

**F2 — "two runs" is byte distinctness, so one real run plus one byte passes (medium).**
`v4b-one-byte-copy`: run2 is run1's exact bytes with a trailing `\n` (`7b11ff54…` vs `8aa97463…`),
cited at another path; `distinctTranscriptDigests 2`, exit 0. `claims.json:39`'s "two real runs" is
therefore satisfied by one run and a newline. Same append-only fix as F1 (one sentence in the same
paragraph); no code change is possible inside the freeze.

**F3 — the receipt's declared digests are never read (informational).** `c1-distinct.mjs` touches
only `receipt.runs[*].transcript` (`:26`) and `receipt.driver` (`:30`); `grep -c driverSha256` → 1
occurrence, and it is the *output* field at `:38`. The honest receipt's fields happen to match the
bytes (verified above), so this is not a lane defect; the concrete consequence is
`real-receipt-gate-hash-field` (exit 0): a receipt can declare the gate's own digest as its driver
digest while the bytes are the independent driver, and the count will not notice. Recorded so nobody
reads `driverSha256`-in-receipt as an independently checked value. Related precision:
`driverImportsFromGate` is printed but is not part of `ok` (`:40-41`), and the honest driver does
import from the gate — `FIXTURE_SHA256, VIEWPORT, serveFixture` (the fixture exports), which matches
§8's "imports neither `liveRecord` nor `PREDICATES`" rather than "imports nothing".

**F4 — no population floor and no row validity (informational, scope).** `one-row` (exit 0) and
`fourteen-rows` (exit 0, method/evidence cells `m`/`e`) both pass. The target number `>= 14`
therefore has to be read off `distinctRowIds`, never off the exit code, and row legitimacy stays
entirely with the frozen gate's `x1`/`x2`. This is what a distinct-count tool is for; it is listed
so `measure/c1-distinct-red-green.txt` (exit 0 = "counts hold") is not quoted as "target met".

**F5 — v8 passes the counts while the gate refuses it (note).** `v8-r16-r18` exit 0: `R16 yes` and an
invented `R18` are distinct ids. Expected, but it means a red/green pair from different counters on
the same tree must not be read as agreement.

## Note on the recorded red-green legs

`measure/c1-distinct-red-green.txt` already records three red legs. Its v3 and v1 legs are red partly
for a weaker reason: it reports `distinctTranscriptDigests 0` and `driverSha256 null`, i.e. the
referenced files did not exist in the tree it ran on (`readFileSync` caught at `:28` and `:30`).
With the forged blobs materialised at their cited paths (`v3-same-path`, `v1-reexport-samebytes`
above) the same trees still go red, but on the intended fields (`paths 1`, `digests 1`,
`driverEqualsGate true`, `reexport true`). The recorded reds are true, not strongest; the four-blob
set was never exercised with resolvable paths before this seat.

## Commands and exit codes

```
# clone (once)
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"          # 0
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b    # 0
git -C "$S/clone" status --porcelain | wc -l                                      # 0 lines

# honest leg
TMPDIR=$S/tmp node $S/c1-distinct.mjs $S/clone \
  corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json
# exit 0, ok true

# trees: node $S/build.mjs $S <blobs dir>   # exit 0, "built 10 trees"
# one-row / fourteen-rows / v4b-one-byte-copy trees built by hand in scratch (see evidence/)
for v in <each case>; do TMPDIR=$S/tmp node $S/c1-distinct.mjs "$S/variants/$v" \
  corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json; done
# exit codes: real 0, v1-reexport-samebytes 1, v1-spliced-distinct-reexport 1, v2-duplicates 1,
# v3-same-path 1, v4-identical-copies 1, v4b-one-byte-copy 0, spliced-stub-driver 0,
# spliced-stub-driver-honest-hash 0, real-receipt-counter-copy-driver 1,
# real-receipt-gate-hash-field 0, one-row 0, fourteen-rows 0, v8-r16-r18 0

# provenance
git -C $S/clone rev-parse HEAD            # b234a58920134424e0d104f137311ff54a16d26b
sha256sum $S/c1-distinct.mjs              # 64cad7c6926b5d12e6a4f8c1801205e4e2c56143c539360ba0a07aa667e57280
sha256sum /…/tabi-shokunin/.ufo/waves/round-32/measure/c1-distinct.mjs   # same digest
sha256sum $S/clone/scripts/check-bidi-runtime.mjs                        # 2f25af5a…c393
grep -c driverSha256 $S/c1-distinct.mjs   # 1 (line 38, output field only)
pgrep -fa 'chromedriver|chromium' | grep -F $S ; echo $?                 # 1 (no owned process)
```

## Honesty and boundaries

- **Blob gaps I reconstructed, and how.** `w1/CritC1Forgery/blobs/` carries entries v1/v2/v8, receipts
  v1/v3 and the v1 driver, but no transcript payloads and no v4 receipt. I rebuilt: `v1-reexport-
  samebytes` uses the **honest run1 bytes twice** (v1's receipt declares equal digests for both runs,
  so this is the shape wave 1 shipped); `v1-spliced-distinct-reexport`, `spliced-stub-driver` and
  `…-honest-hash` use my own synthetic JSONL (session line + `getTree` + `captureScreenshot`
  request/response + one `browsingContext.load`) carrying the **real** run1 PNG payload lifted from
  the honest transcript (`ee0ede…`) and distinct session ids/contexts/URLs per run; `v4-identical-
  copies`, `v4b-one-byte-copy`, `real-receipt-*` are edits of the honest receipt in scratch. The
  spliced transcripts therefore contain real pixels and fabricated provenance — which is the point.
- **Not run.** The frozen gate (`check-bidi-runtime.mjs --live`) and the C2 counter: not this item.
  The counter's own selftest: not run. No browser session was started, so nothing here re-measures
  BiDi capability; the honest row verdicts are untouched by F1–F5.
- **What F1 does not say.** It does not say the lane receipt is forged — the honest receipt is
  self-consistent and the spliced trees are mine. It says the plain counts cannot distinguish the
  two, so the §8 sentence needs narrowing rather than the receipt needing rework.
- Lane files read-only: zero writes under `/home/vgpnk/Projects/shokunin/tabi-shokunin` outside
  `.ufo/waves/round-32/w2/RerunDistinct*`. No lane git command other than `rev-parse`/`status`.
  Every write lived in `$HYAKU_SCRATCH/tabi-r32/RerunDistinct` (clone at `$S/clone`, verified
  `rev-parse --show-toplevel`; no commits made) and that tree was deleted after the evidence copy.
- Network: none. Tooling: nothing installed or upgraded.
