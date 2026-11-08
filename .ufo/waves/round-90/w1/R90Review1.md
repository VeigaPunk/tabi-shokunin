# R90Review1 — C1 count reproduction, freeze-pin audit, prior-set audit, `plan-calls` necessity

Seat `R90Review1`, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `a9f1da08`, round 90 wave `w1`.
Snapshot **2026-11-08 11:36:55 -0300 (14:36:55Z)**. The wave was live during the audit: the freeze
file was rewritten three times (`D1` 11:09:33 → `D2` 11:23:23 → `D3` 11:31:53 → `D4` 11:36:19) and
the C1 instruments were edited at 11:30:41–11:31:21 (the drift gate again at 11:36:14). Every
statement below is timestamped; hashes are of the bytes present at the stated time.

## Verdict

| # | Item | Result |
|---|---|---|
| 1 | C1 counting command reproduction | **PASS** — exit 0, `clean`, `checkCount 107`, `checks`/`limit` identical to `scored/counter-a.json`, on the D2-pinned counter bytes `1d3dfb0b…` *and* the D3-pinned bytes `6f65a0d4…` |
| 2 | Every sha256 in `freeze.txt` vs bytes | **PASS at D4** (8/8 match, freeze digest `85c41917…`, C1 pins stable since D3) — but the ledger was stale twice before: the D1 battery pin matched no bytes ever found, and D2 went stale after the 11:30 instrument edits. Evidence in each cycle was produced *before* the freeze that pins its instrument (§2) |
| 3 | Prior set `prior1`/`prior2` | **PASS** — 41 legs, 0 failures each, distinct nonces/ports/launch tokens/browser ids; each scores clean 107/107 against the other's prior-set and against the scored receipt; fixture/child hashes independently reproduced from the pinned driver + the r78 template + nonce/child-origin |
| 4 | Fixture pin | **declaration-level** — the counter compares the declared field to the CLI pin and never derives it; `fixture.patch` is unvalidated and `fixture.child.sha256` has no CLI pin. The value *is* externally reproducible (§4), so the declaration is honest, but the counter does not bind it to served bytes |
| 5 | `plan-calls` requires the settle call | **PASS** on D2 and D3 bytes (mutations refuse a stripped/moved/duplicated call). On D3 the non-domread refusal lives in `send-log-allowlist`, not `plan-calls`; the frozen C1 sentence attributes it to `plan-calls` (§5) |

## 1. Count reproduction

Command as frozen (`claims.json` C1 `countingCommand`), run from the lane with the D2 pins
(`driver ac5a7a5e…`, nonce `tabi-r90-l1-e573334c78fa`, fixture `5fb1f0f7…`, prior-set
`.ufo/waves/round-90/controls/c1/prior-set.txt`):

```
node scripts/check-showpicker-round90.mjs --lane <ABS lane> \
  --receipt corpus/evidence/round90/chromium-showpicker/receipt.json \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
```

* 11:27 run (lane counter was then the D2-pinned `1d3dfb0b…`): exit 0, `verdict clean`,
  `checkCount 107`, `findings []`, `priorSetFile.sha256 0f17b594c0c5165e9719bc534124d7d21232289fc58ab6bbc25d2e1b9afdab71`.
* Byte-identical copy of the D2-pinned counter (`/fast/scratch/hyaku/tabi-r90/R90Mut1/bin/check-showpicker-round90.mjs`,
  sha256 `1d3dfb0b…`): same result (`counter-pinned-D2.json`).
* 11:32 run on the current lane counter (`6f65a0d4…`, the D3/D4 pin): exit 0, clean, 107, same
  prior-set hash (`counter-current.json`). `scored/counter-a.json` (11:31:26) is identical to it
  in `verdict`, `checks`, `limit` and prior-set hash.
* All three runs' `checks` maps and `limit` blocks compare equal; the scored receipt's 41 legs,
  empty `failures`, and the four domread legs bind.

**"Committed bytes" is not available for round 90.** `git cat-file -e HEAD:<path>` fails and
`git show master:<path>` returns `fatal: path '<path>' exists on disk, but not in 'master'` for
**every** line of `freeze.txt`; `git log --all -- scripts/check-showpicker-round90.mjs` (and for the
receipt and freeze paths) is empty, including `refs/jj/keep/*`; `git status --porcelain` lists every
r90 instrument/evidence file as `??`. The `git show <branch>:<path> | sha256sum` method in the
dispatch is therefore unsatisfiable at review time; this audit is against worktree bytes, and the
wave must commit these exact bytes for the pins to be checkable in the normal way.

## 2. Freeze-pin audit

### D4 (current freeze, sha256 `85c4191706b3af4b028c0be6b29ad782fe26858799235f52a91581ff692dd11a`, mtime 11:36:19)

D3 (mtime 11:31:53, digest `5134c4be…`) pinned the same C1 instruments; D4 changed only the drift
gate (`32a3595d…` → `bd33d158…`, drift script edited 11:36:14). The D4 audit matches all eight
files:

| path | freeze | on-disk at 11:36:55 | |
|---|---|---|---|
| `scripts/chrome-cdp-showpicker-round90.mjs` | `ac5a7a5e…49c8d` | `ac5a7a5e…49c8d` | OK |
| `scripts/check-showpicker-round90.mjs` | `6f65a0d4…7f735` | `6f65a0d4…7f735` | OK |
| `scripts/negatives-showpicker-round90.mjs` | `2f11fffc…f39960` | `2f11fffc…f39960` | OK |
| `scripts/kill-power-round90.mjs` | `05bbe353…c3e3` | `05bbe353…c3e3` | OK |
| `scripts/selftest-r90-gates.mjs` | `0da4d405…6be67` | `0da4d405…6be67` | OK |
| `scripts/check-record-drift-round90.mjs` | `bd33d158…32ee2` | `bd33d158…32ee2` | OK |
| `.ufo/waves/round-90/controls/c1/probes/prior1.json` | `cb4d260e…ca44a` | `cb4d260e…ca44a` | OK |
| `.ufo/waves/round-90/controls/c1/probes/prior2.json` | `ed44bd6f…bbb55` | `ed44bd6f…bbb55` | OK |

### The ledger moved three times while I audited it

| freeze | time | digest | battery pin | kill-power pin | counter pin |
|---|---|---|---|---|---|
| D1 | 11:09:33 | not captured (file replaced) | `06c67275…04e2d8` | `686cb665…0218a` | `1d3dfb0b…7be37` |
| D2 | 11:23:23 | `18d06a3f3895086a92f09868f5a0f5c1c3b4e880851377de2ea4fb070dde0ddf` | `6dc63daf…6f28` | `95f59965…4105` | `1d3dfb0b…7be37` |
| D3 | 11:31:53 | `5134c4be…2675e` | `2f11fffc…f39960` | `05bbe353…c3e3` | `6f65a0d4…7f735` |
| D4 | 11:36:19 | `85c41917…dd11a` | `2f11fffc…f39960` | `05bbe353…c3e3` | `6f65a0d4…7f735` |

Under **D1**, the battery line `06c67275…04e2d8` matched no bytes on disk: the battery was
mtime 11:10:51 with sha `6dc63daf…6f28`, i.e. it was edited 78 s after D1 and **10 min before D2
pinned it**. I searched `/fast/scratch/hyaku` for any copy with the D1 hash and found none (the
nearest, `R90Mut1/bin/negatives-showpicker-round90.mjs`, is `6dc63daf…`). D1's battery pin is
consequently unbacked by any artifact I can produce.

`D2` matches the digest named in `corpus/lessons/round-90.md:50` ("D2 `18d06a3f3895`"). Between D2
and D3 the counter, battery and kill-power were rewritten (counter mtime 11:31:21.038272384,
battery 11:30:41.270738831, kill-power 11:31:21.038772435); D2 then mismatched all three until D3
at 11:31:53 pinned the new bytes.

**Ordering.** In both cycles the evidence was produced *before* the freeze that pins its instrument:

* `scored/battery-a.json` 11:20 (`225 cases / 0 failed / 107/107`) → D2 freeze 11:23:23.
* `scored/counter-a.json` 11:31:26 and `scored/battery-a.json` 11:31:48 (`226 cases / 0 failed /
  107/107`) → D3 freeze 11:31:53.
* `scored/killpower-a.json` was **0 bytes** at 11:35:03 (the D3 sweep was re-running).

For D3 the instruments were not touched between evidence and pin (counter 11:31:21 < counter-a
11:31:26; battery 11:30:41 < battery-a 11:31:48), so D3 correctly attests the bytes that produced
those two artifacts. The D1→D2 cycle is the failure mode a pre-freeze exists to prevent: the scored
battery ran at 11:20 on bytes the freeze then in force did not pin. The pin is a post-hoc
attestation in this wave, not a pre-commitment. D4 (11:36:19) changed only the drift-gate pin after
the drift script was edited at 11:36:14; the C1 evidence is unaffected, and the kill-power re-run
completed at 11:36:47 with 76/76 killed, 0 survivors.

**The 11:29 kill-power snapshot (D2 bytes):** `74 mutants, 73 killed, 1 survived
(domread-settle-call-dropped), 0 crashed, 0 unapplied`. Under C1's frozen kill rule ("kill power
leaves 0 survivors") leg (b) was **red at that instant**. The survivor is an *equivalent mutant*,
not an unenforced rule: `domread-settle-call-dropped` deletes `if (settle.length !== 1)`; a missing
call still fails `settleIx === stateIx + 1` (`findIndex` returns −1) and the ordered-sequence
comparison. My mutation m1 on the same D2 bytes emits **both** `settle-eval 0` and `settle-order`,
so disabling only the count check cannot silence it. The L1 replaced the two `domread-*` mutants
with four sharper ones (`settle-want-dropped`, `settle-want-always`, `settle-order-any`,
`settle-allow-any`), added the battery case `send-log-settle-on-plain-leg` (225→226 cases), and
re-ran counter/battery/kill-power. The re-run completed at **11:36:47** (after D4, 11:36:19), using
the D4-pinned kill-power bytes (edited 11:31:21): **`76 mutants, 76 killed, 0 survived, 0 crashed,
0 unapplied`** — leg (b) reads 0 survivors at snapshot, and the 11:29 artifact is the pre-fix
state. The equivalent-mutant analysis above is why the fix was a sharper mutant list (and an extra
battery case) rather than a rule change.

**Record lag:** `LOG.md` is 11:13, `corpus/lessons/round-90.md` and `plans/round-90.md` are
11:24:35/11:24:47 and name D2; no record names D3/D4 (`5134c4be…` / `85c41917…`) at snapshot. `claims.json` is
11:01:59 (below the D2/D3 instrument edits).

## 3. Prior-set audit

| | nonce | ports (http/cdp/child) | legs | failures | fixture sha256 | child sha256 | window (UTC) |
|---|---|---|---|---|---|---|---|
| prior1 | `tabi-r90-probe1-probe0001` | 19970/19971/19972 | 41 | 0 | `aceee93d…38a16` | `dd7e1d20…74c5` | 13:59:40.076 → 14:02:58.781 |
| prior2 | `tabi-r90-probe2-probe0002` | 19980/19981/19982 | 41 | 0 | `78b5072f…61c07` | `46b62bf5…e8775` | 14:04:03.828 → 14:07:35.592 |
| scored | `tabi-r90-l1-e573334c78fa` | 19960/19961/19962 | 41 | 0 | `5fb1f0f7…7bd7ac8` | `44db776c…420523` | 14:14:36.148 → 14:19:05.292 |

**Cross-scoring.** `prior1` scored with prior-set `{prior2}` (plus the scored receipt as `--prior`
because it sits in the walked tree): D2 counter **clean 107, exit 0**; D3 counter **clean 107,
exit 0**. Symmetrically `prior2` against `{prior1}`: clean 107 on both counters. Replay numbers in
every run: `absMatched 0`, `gapMatched 0`, `absNeed 105` per prior, `refused false`. Full outputs:
`w1/R90Review1/prior1-score.json`, `prior2-score.json` (D2), `d3-prior1-score.json`,
`d3-prior2-score.json` (D3).

**Independence.** Nonces, all six ports, launch tokens and CDP `browserId`s are pairwise disjoint
across the three receipts (cross-product checked). No page-event `(ts, at)` pair matches at the
0.05 ms replay tolerance between any two receipts. The priors' `at` series share 106/209 values
within 1 ms with each other (fixed-wait artifact; exact equal values 6) — this is what the limit
sentence calls a driver artifact, and it is why the absolute-pair rule matches 0.

**Fixture genuineness.** Recomputing the driver's construction —
`sha256(PATCHED(r78 template, `__CHILD_ORIGIN__`→receipt child origin, `__NONCE__`→receipt nonce))`
— reproduces the declared fixture *and* child hashes for all three receipts exactly
(`w1/R90Review1/repro-fixture.json`). The template source is
`scripts/chrome-cdp-filechooser-round78.mjs`, sha256 `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`,
which is **not** in `freeze.txt`. The pinned driver (D3, `ac5a…`) is the generator; the receipt's
nonce and child origin are the per-run inputs.

Conclusion: at the counter's evidence standard the two priors are genuine independent r90 runs.
Receipt bytes alone cannot prove browser provenance (no signature or remote attestation); the
counter's replay/identity checks are the strongest available evidence, and they pass.

## 4. The fixture pin is declaration-level

Code: `check('fixture-hash', …)` at `scripts/check-showpicker-round90.mjs:511-512` compares the
declared `r.fixture.sha256` to `--expect-fixture-sha256`, checks the key set and the frozen viewport,
and requires `fixture.child.sha256` to be 64 hex. `expectFixture` is read only at lines 129/137/511;
nothing derives the hash from bytes, from `fixture.patch`, or from the served page.

Mutations against the isolated mirror lane (all other pins held, priors `prior1`/`prior2`):

| mutation | result |
|---|---|
| `m5a` declared `fixture.sha256 = 'b'*64` **and** pass that as the pin | exit 0, **clean** |
| `m5b` `fixture.patch` set to `JUNK` for all four strings | exit 0, **clean** |
| `m9` `fixture.child.sha256 = 'c'*64` | exit 0, **clean** (no CLI pin exists for the child) |
| `m12b` declared field mutated, **original** pin `5fb1f0f7…` held | exit 1, `fixture-hash` |

So the check is live but is an identity declaration, not a byte binding. The frozen counting
command passes `<receipt fixture sha256>` (claims.json C1 `countingCommand`), which is tautological
as written; the dispatch text's external `5fb1f0f7…` is the only anchor. The value is nevertheless
externally reproducible from the pinned driver and the run's nonce/child origin, so the declaration
is consistent with a real run of the pinned driver; the generator template is outside the freeze.

## 5. `plan-calls` really requires the settle call

D2 code (`scripts/check-showpicker-round90.mjs`, the `1d3dfb0b…` bytes): the settle eval is pushed
into the ordered `want` sequence for domread legs (`:602`); domread requires
`settle.length === 1` and `settleIx === stateIx + 1` (`:604-611`); every other leg requires
`settle.length === 0` (`:612-613`); the ordered `got` filter includes the settle only for domread
(`:604`); findings are emitted under `plan-calls` (`:640`). D3 (`6f65a0d4…`) removes the explicit
count and non-domread checks and adds an allowlist rule — `if (params.expression ===
'window.__inputs(true)') return p.kind === 'showpicker-domread';` — keeping the `settleIx ===
stateIx + 1` order check and the ordered sequence.

Scored receipt: exactly **4** `window.__inputs(true)` sends in 41 legs, one per domread leg
(`sp89-accept-domread-{text,png,multimime,whitespace}`), each send id **24** immediately after the
settle `window.__state()` at id **23**, before the dismiss at 25 and the post-dismiss state read at
26. No other leg carries it.

Mutation matrix (isolated mirror lane; all other pins held; the mutated receipt is the only
r90-schema receipt in the mirror tree):

| mutation | D2 bytes (`1d3dfb0b…`) | D3 bytes (`6f65a0d4…`) |
|---|---|---|
| m1 strip the settle from a domread leg, renumber ids, fix `dismissSendId` | exit 1, **plan-calls** (`settle-eval 0`, `settle-order`, `sequence`) | exit 1, **plan-calls** (`settle-order`, `sequence`) |
| m2 append the settle to a non-domread leg | exit 1, **plan-calls** (`settle-eval-unexpected 1`) | exit 1, **send-log-allowlist** only |
| m3 swap the settle and its preceding `__state()` | exit 1, **plan-calls** (`settle-order`) | exit 1, **plan-calls** (`settle-order`) |
| m4 duplicate the settle | exit 1, **plan-calls** (`settle-eval 2`, `sequence`) | exit 1, **plan-calls** (`sequence`) |
| m7 replace the settle `__state()` with `window.__late` | exit 1, **plan-calls** (`settle-order`) | exit 1, **plan-calls** (`settle-order`) |
| m14 non-domread leg given a `__state()` + `__inputs(true)` pair | — | exit 1, **send-log-allowlist** only; `plan-calls` passes |
| m15 move the settle one position later | — | exit 1, **plan-calls** (`settle-order`, `sequence`) |
| m8 baseline (unmutated) | exit 0, clean | exit 0, clean |

Controls supplied by the L1, scored under the D2 counter: `nowork-settle-stripped.json` (four
settle calls stripped) exits 1 with `plan-calls` naming all four domread legs; the r89 receipt
`nowork-r89-under-r90.json` exits 1 with `plan-calls` `settle-eval 0` on all four domread legs (r89
sent `window.__inputs()` with no argument). Re-scored under D3, the stripped control still exits 1
with `plan-calls` and four `settle-order` entries (`d3-control-settle-stripped.json`).

**Answer: yes** — `plan-calls` refuses a receipt whose domread legs lack the distinct settle call,
and it also refuses a moved or duplicated call. Two calibration notes:

* On **D3** the *non-domread* half of the sentence is no longer carried by `plan-calls`: m2 and
  m14 are refused only by `send-log-allowlist`. The frozen C1 text (claims.json, 11:01:59) says
  "the counter's `plan-calls` … forbids it on every other leg"; that was true of the D2 bytes
  (`settle-eval-unexpected`) and is now true of the counter but not of `plan-calls`. The instrument
  was edited at 11:31:21, after the claims and after D2. This is an attribution divergence between
  the frozen claim sentence and the post-claims instrument, not an unenforced rule.
* `stateIx` is the **first** `window.__state()` in the leg. The scored receipt's first state read is
  the settle read (id 23), so the check is correct today; a driver reorder that inserted an earlier
  probe `__state()` would false-refuse. Low risk, driver-side convention.

## 6. Other findings

1. **`claims.json` is not sealed**: `digestsCommit`, `nonce`, `frozenAt` are all `"PENDING"` and
   `claims.C1.pins` is `{}` (mtime 11:01:59). The dispatch supplies the nonce and pins; the file
   itself does not close them. Low/medium record gap.
2. **Exit-2 control timing**: C1 `doNothingControl` names `controls/c1/noreceipt.txt`. At 11:23:42
   Exec3 scored that path and got `ENOENT` → exit 2 (`w1/R90Exec3-noreceipt.json`); the file did
   not exist then. It was created at 11:33:06 (390 bytes, prose, deliberately not JSON) and passing
   it now returns exit 2, `verdict unreadable`, `receipt-unreadable` (verified 11:36). A nonexistent
   `--receipt` also returns exit 2. Not a defect at snapshot; the record sequence (evidence ran
   before the control file existed) is the only gap.
3. **Counter output carries no receipt digest**: `scored/counter-a.json` records the prior-set file
   hash but not the receipt's; the receipt is untracked and is not pinned by the freeze. The output
   is therefore not self-binding to the bytes it scored. Low/medium provenance gap.
4. **Freeze-order**: see §2 — evidence precedes its pin in each cycle; D1's battery pin is
   unbacked. Medium.
5. **Records lag**: LOG.md (11:13) predates D2/D3/D4; lesson/plan (11:24) name D2 `18d06a3f…`; the
   current freeze is D4 `85c41917…`. Low (likely in-flight).
6. **Kill-power leg resolved at snapshot**: the 11:29 artifact (D2 bytes) had 1 survivor; the
   D4-pinned re-run (11:36:47) reads `76 mutants / 76 killed / 0 survived / 0 crashed / 0
   unapplied`. The survivor was an equivalent mutant (see §2); the fix sharpened the mutant list.
   The pre-fix artifact remains in the wave's history.
7. **Counter selftest**: `--selftest --json` exits 0 with `{ok: true}`; its second case's ids are
   `lane`, `send-log-allowlist`, `plan-calls` (`lane` arises because the harness points the copy at
   a scratch lane whose basename is not the receipt's `tabi-shokunin`; expected in that harness).
8. **Fixture generator unpinned**: `chrome-cdp-filechooser-round78.mjs` (sha `0ae89d92…`) is the
   source of the served fixture bytes but is not in `freeze.txt`; only its output hash is declared.
   Low/medium.

## 7. Residual risk and verification gaps

* I did **not** run the battery (226 cases), the full kill-power sweep, the 11-gate selftest or the
  drift gate; those legs belong to other seats. My statements about them are limited to reading
  their artifacts, and the kill-power leg was in flight.
* The counter is receipt-level: nothing binds a receipt to the browser beyond the declared fields,
  the CDP logs and the replay/identity rules; the documented limit (constant-offset escape,
  `absNeed 105` per 209-event prior) applies unchanged. No cryptographic attestation exists.
* Replay calibration: honest priors share 106/209 `at` values within 1 ms yet 0 `(ts, at)` pairs at
  0.05 ms; the rule separates near-exact copies only, and the printed constant-offset escape is
  available to a forger. This is disclosed in the limit block, not a defect.
* The wave was a moving target: four freezes and three C1 instrument edits during a ~28-minute audit.
  The evidence files under `w1/R90Review1/` are named for the counter bytes that produced them
  (`counter-pinned-D2.json`/`prior*-score.json`/`iso-res-*` = D2 `1d3dfb0b…`;
  `counter-current.json`/`d3-*` = D3 `6f65a0d4…`).

## Evidence

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-90/w1/R90Review1/` (all counter
outputs, schema `tabi-chrome-cdp-showpicker-r90-counter`; no receipt-schema JSON was copied, so the
wave's `prior-set-complete` walk stays green — re-verified after the copy: exit 0, clean 107):

* `counter-repro.json`, `counter-pinned-D2.json` — D2-pinned counter reproductions
* `counter-current.json` — D3-pinned counter reproduction
* `prior1-score.json`, `prior2-score.json` — D2 cross-scores; `d3-prior1-score.json`,
  `d3-prior2-score.json` — D3 cross-scores
* `iso-res-m1…m12b-*.json` — D2 mutation matrix; `d3-res-m1…m15-*.json` — D3 mutation matrix
* `control-settle-stripped.json`, `control-r89-under-r90.json` (D2),
  `d3-control-settle-stripped.json` (D3)
* `repro-fixture.json` — independent fixture/child hash derivation for all three receipts

Scratch `/fast/scratch/hyaku/tabi-r90/R90Review1/` deleted after the copy. No subagent dispatch, no
background jobs, no commits or git/jj mutation; nothing installed (no pacman/uv/npx), so there is no
tool/version/channel entry to record.
