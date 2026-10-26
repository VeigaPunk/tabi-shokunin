# CritForgeNext — C2 next-generation forgeries (tabi round 33, wave 1)

**Verdict.** Against the v2 requirements *as written in this wave's `ExecGateV2` item*, the
receipt leg stays forgeable in four independent ways, and none of them needs a byte that gate
v2 is specified to refuse. Four constructions were built as scratch commits on
`e6b0a9074d434ccc307badd312ae7379d1193fea` — (G1) two synthetic transcripts with freshly
generated 32-lowercase-hex session ids, matching `ws://127.0.0.1:<port>/session/<id>` URLs,
distinct bases and 32-uppercase-hex contexts; (G2) one *real* transcript re-signed with a fresh
session id; (G3) an inert driver that imports only the six allow-listed gate symbols and never
runs; (G4) a *genuine* fetch receipt for an irrelevant page on the honest source's own host —
and **gate v1 admits all four today** (offline, 16/16, exit 0; G1 and G3 also exit 0 with
`--live`), while an independent literal implementation of the four v2 clauses (`v2-predict.mjs`,
calibrated: honest H0 passes, the round-32 F1 shape is refused, and five deliberately-invalid
variants are each refused on the expected clause) admits all four with `wouldPass: true`. The
root cause is structural, not a missing clause: every rule v2 adds inspects bytes the attacker
commits, and the one non-attacker byte in the receipt — the real first screenshot — is
reproducible without BiDi (round-32 D1, reproduced here: digest `ee0edeba…51eca5`). So C2's
frozen predicate is **not** contradicted (v2 can still refuse F1–F8), but v2 must not be
written up as verifying receipt *provenance*. Severity: **defect (medium-high) against the
provenance reading of clause (2)**, **medium** for clauses (3) and (4). The frozen C2 predicate
is untouched; these are limits to disclose, not predicate changes.

## What was attacked, and the exact rule text

Source of the v2 rules: `.ufo/waves/round-33/w1-spec.json`, item `ExecGateV2`, requirements
(1)–(4) (read with `jq -r '.items[] | select(.name=="ExecGateV2") | .prompt'`, exit 0). The
clauses I attack, quoted from that item:

- (2) "each run's newSession body has a sessionId matching ChromeDriver's id shape (the honest
  transcripts carry 32 lowercase hex …) and a capabilities.webSocketUrl
  `ws://127.0.0.1:<port>/session/<that sessionId>`, sessionIds distinct across runs, and
  browsing-context ids not the golden constants (honest contexts are 32 uppercase hex)".
- (3) "driver: blob present with matching sha256, sha256 different from the gate's own blob at
  --rev, and its source neither re-exports (`export * from` / `export {…} from`) the gate nor
  imports any gate symbol outside an explicit allow-list FIXTURE, FIXTURE_SHA256,
  FIXTURE_HEADER, VIEWPORT, DATA_TEXT, serveFixture".
- (4) "the cited new S-id must also appear in a `corpus/lessons/round-*.md` `## Gate` table row
  at --rev carrying an https URL and a 64-hex sha256, and the registry row's source URL host
  must equal that Gate URL host".

Gate v1's behaviour that the constructions ride on (all line numbers from
`scripts/check-bidi-runtime.mjs` at the baseline, sha256 `2f25af5a…c393`): population is a
Measured-cell filter `:508`; the s1 source check `:512-515`; the driver check is one literal
path plus a self-written digest `:528`; runs only need `length >= 2` `:529`; transcript digests
are checked `:534`; the whole "binding" is first-screenshot equality plus a
`chromedriverVersion` string `:550-553`; and the golden constants are `context "C1"` `:601` /
`sessionId "X"`, `ws://127.0.0.1:9515/session/X` `:628`. The honest sessions are 32 lowercase
hex (`10abbb479bdcc37a405098c5ea778bf0`, `6b30c7033f4821af5f94d9e75e85b234`) with 32 uppercase
hex contexts (`31B8FE9C25C36020CBB175F250715903`, `0E62B928C3D82E935056B338D5E0FBF4`).

## Readings

Setup (all commands from `$S=/fast/scratch/hyaku/tabi-r33/CritForgeNext`, one live clone):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"            # exit 0
git -C "$S/clone" checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea      # exit 0
git -C "$S/clone" rev-parse HEAD                                                     # e6b0a907…3fea
git -C "$S/clone" rev-parse --show-toplevel                                          # $S/clone
git -C "$S/clone" show e6b0a90:scripts/check-bidi-runtime.mjs | sha256sum            # 2f25af5a…c393 (= v1)
TMPDIR=$S/tmp ./run-all.sh "$S/clone" e6b0a9074d434ccc307badd312ae7379d1193fea receipts   # exit 0
```

| variant | scratch commit | gate v1 offline | gate v1 `--live` | v2-predict (literal v2) |
|---|---|---|---|---|
| H0 honest `e6b0a90` | `e6b0a907…3fea` | exit 0, 16/16, failing 0 | — | `wouldPass true` (calibration) |
| **G1** golden sessions | `ec434d380533967e1c9d0be1327c6958fc9b83b4` | **exit 0, 16/16** | **exit 0, 16/16** | **true** (`rows,runs,driver,source` all pass) |
| **G2** real body re-signed | `ad67c9e3dc6af3a6969245b8cca4a736275a1b28` | **exit 0, 16/16** | not run | **true** |
| **G3** inert allow-listed driver | `0a25de379e792f480272296bfd1597880663ad72` | **exit 0, 16/16** | **exit 0, 16/16** | **true** |
| **G4** junk Gate row, same host | `41b4118bc355658f5d67e4623598c61193b4af4f` | **exit 0, 16/16** | not run | **true** (`newIds ["S180"]`, host `chromium.googlesource.com` both sides) |
| G1 calibration arm (`--ids golden`) | `9569521412587ef6bf8af6dfb84a1d20fed222b5` | exit 0, 16/16 | — | **false** — refused on `runs`: `sessionId "X" is not 32 lowercase hex` ×2, `sessionIds are not distinct`, `context id C1 is a golden constant` ×2 |

Per-variant readings are in `receipts/<variant>.gate.json`, `receipts/<variant>.live.gate.json`
and `receipts/<variant>.v2predict.json`; builder transcripts in `receipts/<variant>.build.json`;
the committed forged blobs are snapshotted verbatim under `receipts/blobs/<variant>/`.

`--live` runs used `/usr/bin/chromedriver` + chromium 154.0.8037.97 headless, loopback fixture
only, throwaway profile; the gate's own `finally` removed the profile. Final
`pgrep -fa 'chromedriver|chromium' | grep -v earlyoom` printed nothing.

## Constructions — how each one satisfies the rule and what it does not prove

### G1 — golden sessions with real-shaped identity (`build-G1-golden-sessions.mjs`)

Attack on **clause (2)**. Two `goldenLines()` transcripts (generated from the *frozen v1 gate's
own* generator, pinned at `GOLDEN_REV b7d16fb…`, digest asserted `2f25af5a…`), each with a
fresh session id, a matching ws URL, its own base and an uppercase-hex context; the honest
run's real first screenshot and the real `chromedriverVersion` are spliced in, and the honest
classic session body plus the honest `getTree` context objects are transplanted so the objects
have a real run's shape. Committed bytes (snapshot `receipts/blobs/G1/…/run1/transcript.jsonl`):

```
{"seq":1,"dir":"http-res","path":"/session","body":{"value":{"sessionId":"e74b444600674694ff50573b41d67eaa",
 "capabilities":{…,"webSocketUrl":"ws://127.0.0.1:46261/session/e74b444600674694ff50573b41d67eaa"}}}}
{"seq":5,"dir":"recv","frame":{"id":2,"type":"success","result":{"contexts":[
 {"children":[],"clientWindow":"306990277","context":"479558959AD2DF682FE9D5B60FAABE03",…}]}}}
```

run2: `27ebee664753dcc3ffd2739be830f7ba` / `ws://127.0.0.1:30464/session/27ebee…` /
context `FC3C72E8498E4D077337F1A6959FB464` / base `http://127.0.0.1:26834`; run1 base
`http://127.0.0.1:58873`. Session ids distinct, URLs match ids, contexts are 32 uppercase hex
and none begins with `C1` (the builder regenerates a context that does, so the construction
survives a prefix-matching reading of the same rule rather than exploiting a loose one).
Screenshot digest of the spliced first capture: `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`
— the real 640×480 rendering, obtainable without BiDi (round-32 `CritC1Forgery.md` D1).
**What clause (2) actually establishes:** that the *strings* have ChromeDriver's shapes. It
cannot establish that a session by that id ever existed: the id is 16 random bytes the author
picks, and the honest receipt's own `observed` record stores `sessionId: "present"`, not the id
(`corpus/evidence/round-32/bidi/receipt.json:17`, and `:166` for run2), so there is nothing in the committed bytes to
bind the transcript's id to. **Defect (medium-high) if v2 is described as a provenance rule.**

### G2 — one real transcript re-signed (`build-G2-honest-body-edit.mjs`)

Attack on **clause (2)**, at maximum fidelity: 70 of 71 lines are real wire bytes. Only line 1
changes —

```
honest run2: ws://127.0.0.1:41011/session/6b30c7033f4821af5f94d9e75e85b234   (sha256 9918a716…69d7)
forged run2: ws://127.0.0.1:50767/session/2e680a38342198a94b3a21d3ec1d9d67   (sha256 d338a808…dacc2)
builder asserts linesChanged == [1];
```

— and the receipt's `observed` ws URL for that run is rewritten to match, so transcript and
receipt stay consistent. Distinct paths, distinct digests, distinct session ids, matching ws
URLs, real contexts: clause (2) passes. This is the sharpest witness that structural fidelity
is free: any static shape rule is satisfied by copying the honest blobs (which the repo
publishes) and editing the one line the rule inspects.
**Defect (medium-high), same clause.**

### G3 — inert driver inside the allow-list (`build-G3-inert-driver.mjs`)

Attack on **clause (3)**. The receipt names `corpus/evidence/round-32/bidi/g3-driver.mjs`
(sha256 `ee46b6a1…9198`, ≠ gate `2f25af5a…`), which imports exactly the six allow-listed
symbols, has no re-export, defines `main()` throwing `"g3: inert driver — no session, no
transcript"` and never calls it; the transcripts remain the honest runs, which this file did not
produce. v2-predict's clause (3) passes with `importedGateSymbols =
["DATA_TEXT","FIXTURE","FIXTURE_HEADER","FIXTURE_SHA256","VIEWPORT","serveFixture"]`, and the
gate admits the variant **with `--live` as well** (exit 0, 16/16): the live leg re-tests the
rows on the *gate's own* `liveRecord` client, never on the receipt's declared driver, so it
cannot notice that the declared driver is inert.
**Defect (medium): a content allow-list is a necessary condition on a file's text, not evidence
that anything ran.** (If v2 adds a per-run driver log, the attacker writes the log too — G3's
driver is attacker-authored, so its log is as well.)

### G4 — a real Gate row for a junk URL on the same host (`build-G4-junk-gate-row.mjs`, `fetch-g4-junk.sh`)

Attack on **clause (4)**. One genuine, read-only HTTPS GET of
`https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/BUILD.gn?format=TEXT`
— a GN build manifest, on the honest S125 source's own host — at `2026-10-26T18:28:37Z`, HTTP
200, 26,656 B, sha256 `1469e6a4a87fa3f3e82e8e32cb7a02747e3fd3e1a7d0333779c60b1f910a5ec3`
(decoded 19,990 B, sha256 `4cea6c0c…2166`). The `## Gate` row carries that URL, status, byte
count, digest and a verbatim located quote ("Use of this source code is governed by a BSD-style
license that can be"); the registry row S180 cites the same URL; the entry's `source:` line
cites S180 alone. Every part of clause (4) holds — the digest is real, the fetch happened, the
hosts are equal — and the cited page grounds nothing about BiDi. (Exact-URL equality would not
help either: the Gate URL *is* the registry URL.)
**Defect (medium): the rule pins the shape of a fetch receipt, not the relevance of the fetched
document.** Relevance is a reviewer judgement (CORPUS.md "a quote names its location"), not a
gate predicate.

## Predictor calibration — why the four admissions are not vacuous

`v2-predict.mjs` is my literal implementation of clauses (1)–(4); it is **not** v2 (v2 had not
landed: `.ufo/waves/round-33/w1/` holds only `ScribeGateV2Note`, no `ExecGateV2`). Its
discriminating power was measured two ways (`calib-clause-firing.mjs`, exit 0,
`receipts/calib-clause-firing.txt`):

| calibration | v1 gate | v2-predict | expected clause |
|---|---|---|---|
| honest H0 (`e6b0a90`) | exit 0, 16/16 | **pass** | — |
| G1 `--ids golden` (round-32 F1 shape) | exit 0, 16/16 | refuse: `sessionId "X"`, `C1` context | runs |
| C-dup (`R2` ×16) | exit 0, 16/16 | refuse | rows |
| C-decorated (`yes (live)`) | exit 0, **15/15** (silent drop) | refuse | rows |
| C-samepath (both runs cite run1) | exit 0, 16/16 | refuse | runs |
| C-gatecopy (driver = gate bytes) | exit 0, 16/16 | refuse | driver |
| C-no-gate-row (junk `S990`, no Gate row) | exit 0, 16/16 | refuse | source |

`CALIB allRefusedOnExpected=true`. The predictor is therefore not a rubber stamp: it refuses
the F-shapes on the clause each one violates, and admits the honest receipt and the four
next-generation constructions.

One rule-text ambiguity is worth flagging (independently found, and it agrees with
`ScribeGateV2Note.md` finding 1): requirement (1)'s "a Measured cell other than exactly `yes` or
`no` is a row finding" cannot be implemented literally, because the honest entry's R16 cell is
`no — no BiDi command` (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:82`) and the frozen
battery requires H0 admitted with 16 (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`,
`HONEST_ADMITTED = 16`). The predictor therefore treats a *yes*-decoration as a finding and a
*no*-decoration as an allowed measured negative, and that asymmetry is disclosed here rather
than hidden.

## Impacted axes

- **operability (C2 surface)** — the gate's new clauses: what they can and cannot establish.
- **calibration** — a `clean` verdict from v2 would overstate the receipt's provenance if the
  v2 note says it is verified. A reader of the note would take "distinct session ids, matching
  ws URLs, driver ≠ gate" as "two real runs"; G1/G2 show it is "two well-shaped records".
- **coverage** — the entry's evidence sentence ("two committed runs from a driver other than
  the counter") is the sentence that stays unsupported by the receipt leg; it is only
  dischargeable by re-execution, or by narrowing the claim.
- depth / freshness / adjacency — untouched. No lane file, counter, claim or control was
  modified by this seat; the frozen C2 predicate is unchanged and is not shown false.

## Smallest safe correction (disclose, don't rebuild)

1. **In v2's header and in the round-33 knowledge note, state the limit**: the receipt leg is an
   *internal-consistency and shape* check. Provenance ("these transcripts came from a session a
   driver actually ran") is not established by any offline clause, including the new ones; the
   only runtime witness in the gate today is `--live`, and it exercises the gate's own client,
   not the receipt's driver. A future executed-driver leg (`--live-driver`: run the receipt's
   driver under the gate's harness and require it to emit the recorded session ids) is the
   honest closure; until then, the claim must be narrowed.
2. **s1 / clause (4)**: require the Gate row's URL to equal the registry source URL *exactly*,
   and say plainly that relevance is a reviewer judgement. G4 satisfies exact equality, so this
   is a tidiness fix, not a closure — do not claim otherwise.
3. Carry **G1–G4 as named surviving constructions** in the C2 closure's limits list and run
   `run-all.sh` against the landed v2 in wave 2; a refusal of any of them is v2's evidence, an
   admission is the disclosed limit. Do not add construction-specific tells (see F4 below).

## Additional note (no action recommended): accidental tells

No v2 clause counts transcript lines or compares command shapes, yet G1's transcripts are 48
lines against the honest 71, and the golden generator's per-command result objects are sparser
than a real run's. These are accidents of the generator, not closures: G2 (71/71 real lines) is
the same forgery at full fidelity, so a line-count or shape rule would be a construction-specific
tell (exactly what the frozen `feasibilityDisclosed` warns against) and would be evaded by
copying honest bytes. They are listed so no one mistakes them for something v2 already catches.

## Honesty / boundaries

- **v2 was not available.** No `ExecGateV2` output existed when this seat ran (only
  `ScribeGateV2Note`), so "would pass v2" is a prediction from the rule text, not a measurement
  of v2's code. Wave 2 must run these builders (and the frozen battery) against the landed v2.
- **Ran**: the pipeline (`run-all.sh`, exit 0) four times end to end; gate v1 offline on H0 and
  every variant; gate v1 `--live` on G1 and G3 (exit 0 each); `calib-clause-firing.mjs`
  (exit 0); `pgrep` after the last browser run (nothing).
  **Not run**: the frozen `c2-bidi-forgery-battery.mjs` (its baseline reading is already frozen
  in `.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`: 8/8 accepted; my constructions are
  additions beyond F1–F8); the gate's `--selftest` (no gate bytes were changed by this seat);
  any real v2.
- **Network** (one GET, read-only): the G4 URL above at `2026-10-26T18:28:37Z`, HTTP 200,
  26,656 B, sha256 `1469e6a4…e5ec3`. Receipt `receipts/g4-fetch.json`; wire and decoded bodies
  beside it. No cookies, credentials or off-allow-list hosts.
- **Writes**: only `.ufo/waves/round-33/w1/CritForgeNext/` (this seat's output dir) and the
  report `.ufo/waves/round-33/w1/CritForgeNext.md`; commits only inside the scratch clone
  (toplevel verified; identity `CritForgeNext <CritForgeNext@scratch.local>`). No lane tracked
  file, index, jj state, fleet repo or sibling repo touched. Scratch
  `/fast/scratch/hyaku/tabi-r33/CritForgeNext` removed after the receipts were copied here.
- **Tooling**: nothing installed or upgraded (node v24.21.0, git, jq, curl, chromedriver and
  chromium 154.0.8037.97 already present; pacman untouched).

## Deliverables

Output dir `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/CritForgeNext/`
(`receipts/tool-digests.txt` pins every byte below):

| file | role |
|---|---|
| `forge-common.mjs` | clone/commit mechanics, honest-blob reader, sid/context generators, session patcher |
| `build-G1-golden-sessions.mjs` | G1 builder (`--ids real` attack arm, `--ids golden` calibration arm) |
| `build-G2-honest-body-edit.mjs` | G2 builder (one real transcript, line 1 re-signed) |
| `build-G3-inert-driver.mjs` | G3 builder (allow-listed inert driver) |
| `build-G4-junk-gate-row.mjs` | G4 builder (registry row + lesson `## Gate` row + entry source line) |
| `fetch-g4-junk.sh` | the one real HTTPS GET with provenance (URL, UTC, status, bytes, sha256, quote) |
| `run-gate.mjs` | score a variant with the gate at that commit (offline or `--live`), JSON out |
| `v2-predict.mjs` | literal implementation of v2 clauses (1)–(4) — prediction, not v2 |
| `calib-clause-firing.mjs` | red/green calibration: one invalid variant per clause |
| `run-all.sh` | `<clone> <rev> <outdir>` → fetch, build all five variants, gate-score, predict |
| `receipts/*.gate.json`, `*.live.gate.json`, `*.v2predict.json`, `*.build.json` | readings |
| `receipts/blobs/<variant>/…` | the committed forged bytes, verbatim |
| `receipts/g4-fetch.{json,body.txt,decoded.txt,headers.txt}` | G4 fetch receipt |
| `receipts/calib-clause-firing.txt`, `receipts/tool-digests.txt` | calibration and script digests |

Reproduce: `TMPDIR=<short scratch> ./run-all.sh <disposable-clone> e6b0a9074d434ccc307badd312ae7379d1193fea <outdir>`;
against v2, point `<disposable-clone>` at a tree whose `scripts/check-bidi-runtime.mjs` is v2
(the builders only read the golden generator from `GOLDEN_REV` and the honest receipt from
`<rev>`, so they never depend on the gate under test).
