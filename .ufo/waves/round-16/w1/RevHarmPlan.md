# RevHarmPlan — which existing lane gates go red from round-16 writes, and the must-run no-harm list

Seat: `TabiR16.RevHarmPlan-5` (reviewer, leaf). Scope: existing lane gates only. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. HEAD at review: `e38d2599a922cb729186353830fff8e159b4fef0`
(clean tracked tree; untracked: `.ufo/waves/round-16/`, `corpus/evidence/round-16/`,
`scripts/{check-measurement-binding,selftest-measurement-binding,webmcp-loopback-round16}.mjs`).

Method: this seat ran **no gates/selftests/browsers** (lane bound). Every "expected" value below is
derived from committed bytes and gate source read this session, not observed execution. Prior observed
anchors are cited where they exist (round-14 `corpus/evidence/round-14/gates.json`, round-15
`corpus/evidence/round-15/*.json`). Tools installed/updated: none.

## 1. Gate map — what each gate actually reads

| Gate | Reads | Baseline / pins | Round-16 exposure |
|---|---|---|---|
| `scripts/check-round-contract.mjs` | **HEAD tree only** (`git show HEAD:…`): `SCORECARD.md`, `LOG.md`, pstack lessons/reports/evidence for ids `pstack-20261015-r01..r10`, `SHONEN.md`, census | `HARD_BASELINE=7f506aff…` (`:11`), fixed `expect=10` (`:224-226`), `CENSUS_SHA256=b9c8dc35…` (`:30`) | Append-only prefix + protected baseline paths + pstack id set (see §2) |
| `scripts/check-freshness.mjs` | **Worktree** in `--worktree` (or a witness rev): 34 pinned targets = 31 baseline `.md` + 3 host files | `expectedPath` descriptor (`:11`), baseline `c24eaea1…`, table `corpus/evidence/fleet-round-1-freshness/pins.tsv` (`:12`) | SKILL.md append; new knowledge note; never edit baseline `.md` |
| `scripts/check-sources.mjs` | **Worktree** `corpus/SOURCES.md` (`:24`, bytes read at `:147-177`) | schema only, no counts pinned | SOURCES row edits/appends |
| `scripts/check-user-round-contract.mjs` | **HEAD tree only**: user lessons `user-20261015-r01..r06`, SCORECARD/LOG, pstack pin diff over `PSTACK_PATHS` | `PSTACK_PIN=92d700d6…` (`:13`), `ROUND_SCRIPT_CURRENT_SHA256=8a573b4e…` (`:32`), `LEGACY_LESSON` (`:56`), `PSTACK_PATHS` (`:73-81`), fixed `expect=10` (`:301-302`) | pstack-path immutability; expected known red 6/10 (see §3.4) |
| `scripts/check-aria-metadata.mjs` | round-13/14 ARIA evidence only | — | **Not affected** by any round-16 write path |
| `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate` (fleet) | `corpus/SOURCES.md` of every lane | E01–E11, W01–W03 | SOURCES row shape/used-by; warnings do not change exit 0 |

New `scripts/*.mjs`, `corpus/evidence/round-16/**` and `.ufo/waves/round-16/**` are read by **no**
existing gate: `check-round-contract.mjs:265-270` enumerates only `corpus/lessons/pstack-20261015-r\d{2}.md`;
`check-user-round-contract.mjs:337-343` only `user-20261015-r\d{2}.md`; `check-freshness.mjs:78-83` only
the baseline `ls-tree`; `check-sources.mjs:24` only `corpus/SOURCES.md`. No script enumerates
`corpus/evidence` directories (`readdirSync` appears only in the aria harness/checker).

## 2. Exact red vectors (write shape → gate → finding)

Citations are `path:line`. "G1"=round contract, "G2"=freshness, "G3"=sources, "G4"=user contract.

1. **SKILL.md, any non-append edit** (inserting/replacing anywhere in the first 116,663 bytes):
   G2 `content_drift` — `verify` compares `current.subarray(0, original.length)` byte-for-byte
   (`check-freshness.mjs:95-101`); G1/G4 `Append-only prefix changed: SKILL.md`
   (`check-round-contract.mjs:25,246`; `check-user-round-contract.mjs:72,321`).
   Appending strictly after the last byte is safe and required to grow the file
   (`check-freshness.mjs:101` `witness_append` if `current.length <= original.length`).
   Verified baseline prefix: 116,663 bytes sha256
   `f4d9cf5b1aa5711948a4f86cf111b0560b39f4df76ed504cbe4559e7e4c9acfe`; HEAD SKILL 147,204 bytes.
2. **SCORECARD.md / LOG.md / corpus/QUALITY.md / corpus/README.md non-EOF edits** (including a
   "newest first" top insert or reformatting an existing block): G1+G4 `history_rewritten`
   (`check-round-contract.mjs:25,246`; `check-user-round-contract.mjs:72,321`). G2 does not read
   these four. EOF appends are safe. (SCORECARD's pstack blocks are parsed by first match,
   `check-round-contract.mjs:286-292`; original blocks win as long as bytes are untouched.)
3. **Any new `corpus/lessons/pstack-20261015-rNN.md`** (e.g. a "round 16 = r11/r16" rename):
   G1 `round_count` — `Found 11 pstack rounds, expected 10` (`:265-270`, `check()` `:579`);
   G4 `history_rewritten` earlier, via `pstackDrift` returning true for
   `/^corpus\/lessons\/pstack-20261015-r\d{2}\.md$/` (`:260-272`, regex at `:265`).
   Round-16 lesson must be `corpus/lessons/round-16.md`, which matches neither pstack regex.
4. **Any write under `corpus/evidence/pstack-20261015*`** (including "backup" copies or census
   edits): G4 `history_rewritten` (`PSTACK_PATHS[0]`, `:73`, `pstackDrift` `:264`) and G1
   `history_rewritten` for the census bytes (`:30`, `:176-195`; current sha256 verified `b9c8dc35…`
   = constant).
5. **Any new `reports/pstack-20261015-rNN.md`**: G4 `history_rewritten` (`:266` regex match is
   unconditional, independent of A/M status). `reports/round-16.md` is *not* matched and is allowed.
6. **`corpus/lessons/round-16.md` edited after its first commit**: G4 `history_rewritten`
   `Pstack bytes changed` — `lessonDrift` admits an absent-at-baseline lesson only as an initial
   addition with no later `M/D/R/T` commit in `PSTACK_PIN..HEAD` (`:250-258`). Commit it once in
   final form; a later fixup commit inside the round is red. `round-16-verifier-spotcheck.md` is
   not matched (regex requires exact `round-\d+.md`), so it is not frozen by G4.
7. **Editing frozen scripts**: `scripts/check-round-contract.mjs` sha256 must stay
   `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` (verified: current file
   hashes to it; `:32`): any change → G4 `history_rewritten` (`acceptedRoundScript` `:226-249`).
   `scripts/check-freshness.mjs` content-addressed at baseline == HEAD (blob `987c3267…`) and is
   `protectedPath` in G1 (`:94-110`) and G4 (`:144-153`): any change → `history_rewritten` in both.
   `scripts/pstack-seat.mjs`, `scripts/pstack-aggregate.mjs`: G4 `history_rewritten` (`:267-269`).
8. **SHONEN.md**: G1 `shonen_policy`/`history_rewritten` (`:167-175`, policy `:133-165`); G4
   `canonicalShonen` (`:187-221`) accepts only `[ ]`/`[~]` plus one committed-blob pointer per `[~]`;
   `[x]` fails closed. Round-16 plan has no SHONEN write — leave it byte-identical.
9. **Any baseline `corpus/knowledge/*.md` or `reports/*.md` edit**: G2 `content_drift` — target set is
   `ls-tree <c24eaea1> -- corpus/knowledge reports SKILL.md` (`check-freshness.mjs:78-83`), every
   such blob must equal baseline bytes (`:95-101`). The **new** note
   `corpus/knowledge/webmcp-chromium-loopback-round-16.md` is not in the baseline tree, so it is not
   a target and needs **no** pins row. Do **not** touch `pins.tsv` (G1 `protectedPath`, `:96`;
   also G2 `target_set`/`duplicate_target` `:77,81` if a row is added).
10. **SOURCES.md row shapes** (G3, `evaluate`):
    - rows must be inside `## Registry` — a naive EOF append lands in `## Leads`, →
      `row_outside_registry` (`:264-269`); required sections are fixed (`:29`).
    - `split('|').length === 13` else `malformed_row` (`:306-309`); all 11 cells non-empty.
    - `kind` ∈ the 10-value set (`:26`), `tier` ∈ A/B/C (`:27`), `status` ∈ queued/mined/rejected
      (`:28`); `tier=A` + `kind=community` → `tier_inflation` (`:323`).
    - `anchor` empty or `—` → `bare_anchor` (`:324`).
    - `opened` must be a real ISO date (`:79-90`; no future check in G3 — the census adds E08 with
      `--today`); `recheck` must be ISO, `NNd`, or `on-release` (`:320`).
    - `status=mined` with `used-by` empty/`—` → `mined_without_used_by` W03 (`:329-332`);
      every used-by path must exist, stay inside root, be a regular non-symlink file and contain
      the row id as a token (`inspectUsedBy` `:203-241`, applied `:333-341`). Worktree read, so the
      new note must already exist when G3 runs.
    - `status=rejected` requires `teaches` to contain `REJECTED:` **and** `flip:` (`:325-327`).
    - adding a row reusing an existing URL (S002 viewer, S004/S028 Chromium .cc) → `duplicate_url`
      unless `teaches` starts `supersedes S###` (`:296`). Flipping S020 queued→mined is an
      in-place edit and schema-safe; the cited note must contain literal `S020` (token-boundary
      regex, `:232`).
    - credential patterns (`op://`, private key, `ghp_`, `AKIA`, `xox…`) anywhere in the file →
      `credential_material` (`:344-351`).

## 3. Must-run list (L1 no-harm check, in this order)

Run from the lane root. **G1 and G4 read HEAD only**, so run them *after* the round-16 integration
commit(s); G2/G3 read the worktree. Only `--worktree` is a production mode for G2 (the expected-value
block rejects any `--expected` other than the fixed descriptor, `check-freshness.mjs:211`).

### 3.1 `node scripts/check-round-contract.mjs`
Expected exit **0**, stderr empty, exactly these 10 stdout lines then the final line (values derived
from `SCORECARD.md:238-316` + `corpus/evidence/pstack-20261015-rNN/aggregate.json` (32 PASS each) +
lesson gate lines; identical to the round-14 observed clean at `f942c625`, with no pstack path
changed since — `git log f942c625..HEAD -- corpus/evidence/pstack-20261015 …pstack…r01…` returned 0
commits):

```
ROUND id=pstack-20261015-r01 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8
ROUND id=pstack-20261015-r02 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=2 measured-against=6a91f68af5ac5135b6b753c947b12c72e54794ef
ROUND id=pstack-20261015-r03 axis=adjacency swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=4 measured-against=a19c6a90a0fb0e00729fd895c3c136ac4305f877
ROUND id=pstack-20261015-r04 axis=coverage swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=3e3ba9e90d4bf04d5743652e72a9252f81877122
ROUND id=pstack-20261015-r05 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=2e4cba06a07ff7f50a7aee6688644217eec64128
ROUND id=pstack-20261015-r06 axis=operability swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=ef51deddbb3c649ae3931f011757e3eb9d340ad9
ROUND id=pstack-20261015-r07 axis=adjacency swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=ec5ee4bd51a35fe964fe63b73ab356c27530e464
ROUND id=pstack-20261015-r08 axis=calibration swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=472bfc33de340035be5fa001f4e6685b79be4a64
ROUND id=pstack-20261015-r09 axis=coverage swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2
ROUND id=pstack-20261015-r10 axis=freshness swarm=32 pass=32 issues=0 blocked=0 dropout=0 gap=0 admits=1 rejects=2 spot=agree consequential=0 before=0 after=1 measured-against=4e75a17ebbaa125777ed0d6e745fd150e9c6caf2
ROUND_CONTRACT verdict=clean rounds=10 consequential=0
```

Any `ROUND_CONTRACT verdict=failed …` (`history_rewritten`, `round_count`, `score_mismatch`,
`public_observation`) means a §2 write shape landed. Note `checkPublic` requires ≥1 admitted pstack
public capture (`:544-572`); existing ones are untouched by round-16.

### 3.2 `node scripts/check-freshness.mjs --worktree`
Expected exit **0**; 34 `PIN_MATCH` lines; final line exactly:

```
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
```

Why 34/31/3 is the current truth (verified): `pins.tsv` has header + 34 rows, all 8 columns; target
set at `c24eaea1` is 31 `.md`; `git diff --name-status c24eaea1 HEAD -- corpus/knowledge reports
SKILL.md` shows **only** `M SKILL.md`; HEAD SKILL's first 116,663 bytes hash to the pinned
`f4d9cf5b…`; the three host public files hash/newline-count exactly to their pins
(`e70aff5c…/24`, `84a8e69d…/158`, `b811d9c2…/34`, all `realpath` non-symlink).
Red shapes: any edit to a baseline knowledge/report blob (`content_drift` `:100`), SKILL edited
inside the prefix (`content_drift`), or SKILL not longer than baseline (`witness_append` `:101`).
Optional witness form after the round-16 commit:
`node scripts/check-freshness.mjs --witness <round16-commit>` → same 34 matches with
`finding=freshness_witness … revision=<commit> …`; commit epoch must be ≥ `1792022400`
(2026-10-15T00:00:00Z), and the commit must descend from `c24eaea1` (`:62-71`).

### 3.3 `node scripts/check-sources.mjs`
Expected exit **0**, no `FINDING` lines, final line shape
(`printResult` `:364-371`):

```
SOURCES_GATE verdict=clean rows=<N> tiers=A:<a>,B:<b>,C:<c> status=queued:<q>,mined:<m>,rejected:<r> findings=0 file=corpus/SOURCES.md
```

Pre-write truth (verified by counting rows/tier/status this session): `rows=29`,
`tiers=A:23,B:4,C:2`, `status=queued:3,mined:24,rejected:2`. Expected post-write values:
- no new rows, S020 queued→mined only → `rows=29 tiers=A:23,B:4,C:2 status=queued:2,mined:25,rejected:2`;
- each new row increments `rows` and exactly one tier/status bucket. A non-zero `findings` or exit 1
  is a §2.10 shape; exit 2 (`could-not-evaluate`, `registry_symlink_refused`/`registry_missing`) means
  the path/read was wrong, not a content finding.

### 3.4 `node scripts/check-user-round-contract.mjs`
Expected exit **1** and stderr exactly (no `reason=` field; `fail('round_count', …)` at `:602`):

```
USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10
```

This red is the documented, deliberately retained production state (round-14
`corpus/lessons/round-14.md:69`; round-15 `corpus/lessons/round-15.md:63`). It is only a no-harm pass
**if it is this exact line**: `checkHistory` runs first (`:600`), so
`finding=history_rewritten … Pstack bytes changed: …` is the round-16 regression signal (new
pstack-named file, modified `round-16.md` after commit, edited frozen script, touched
`SHONEN.md`/census/append-only prefix). Do not "repair" the 6/10 count by adding
`user-20261015-r07..r10` lessons: they would need full spec/swarm/report/score evidence
(`checkSpec`/`checkSwarm` `:443-535`) and would change the recorded fingerprint.

### 3.5 Cheap self-test regressions (unchanged scripts must reproduce prior observed summaries)
- `node scripts/check-round-contract.mjs --self-test` → exit 0, last line
  `ROUND_CONTRACT_SELFTEST verdict=clean cases=32 alias_checks=1` (`:927`; observed same at
  `corpus/evidence/round-14/gates.json`).
- `node scripts/check-user-round-contract.mjs --self-test` → exit 0, last line
  `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=42 fixtures=32 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1`
  (`:1313`; observed in `corpus/evidence/round-15/user-selftest.json`).
- `node scripts/check-sources.mjs --self-test` → exit 0, last line
  `SOURCES_SELFTEST verdict=clean cases=26` (`:529`; 26 fixture cases at `:46-72`).

### 3.6 End census (fleet validator, unchanged argv)
```
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```
Expected exit 0, stdout `tabi\tok\t/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`
(round-15 `corpus/evidence/round-15/census-after.json` records that exact byte string). This validator
is stricter than G3: it adds E08 future-opened against `--today`, E11 used-by on disk, and W01–W03
warnings; a row opened `2026-10-20` is valid on the round date. Warnings do not change exit 0.

### 3.7 Not affected — do not re-baseline
`node scripts/check-aria-metadata.mjs` reads `corpus/evidence/round-13/aria/*` and
`corpus/evidence/round-14/aria-metadata/*` only; round-16 writes none of those. Its recorded states
must stay: original receipt `--check` exit 1 with the single
`R14-ARIA-CLEANUP-LISTENING-AFTER-01` finding, corrected sidecar exit 0, `--witness` exit 0
(round-15 `metadata-*.json`). A change there is an unrelated regression.

## 4. Gate-silent hazards (green gates do not mean contract-clean)

- `.ufo/waves/round-16/erratum-anchors.json` proposes appending to
  `corpus/lessons/round-15-verifier-spotcheck.md`. That filename does **not** match
  `^corpus/lessons/round-\d+\.md$` (`check-user-round-contract.mjs:56`, `check-round-contract.mjs:95`),
  so all four gates stay green if it is edited. The lane contract says historical lessons and
  outside-verifier files are immutable; this seat flags the proposal as contract-forbidden even
  though no gate would catch it. Route the pointer through `corpus/lessons/round-16.md` only.
- The new scripts and `corpus/evidence/round-16/**` have no schema gate at all; their correctness is
  the C1/C2 counters' job, not the historical gates'. Do not read a green lane gate as evidence that
  the new receipts are well-formed.
- `.ufo/waves/round-16/**` is not scanned; committing it changes no gate outcome.

## 5. Residual risk / gaps

- All expected outputs in §3.1–3.4 are **derived**, not executed by this seat (lane bound). The
  strongest empirical anchors are the round-14 observed clean at `f942c625`, the round-15 observed
  6/10 red, the unchanged pstack subtree since `f942c625`, and the byte/hash checks enumerated above.
- G2's three public targets are live host files outside the repo; if another lane upgrades the
  kimi-webbridge plugin mid-round, G2 can go red for reasons unrelated to round-16 writes.
- `check-user-round-contract.mjs` `checkSpec` spawns the external validator
  `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (`:57,463`), but only for user ids;
  production never reaches it because `round_count` fails first.
- Round-16's own counters (`node .ufo/waves/round-16/measure.mjs …`) are not existing gates and are
  outside this review; they are L1's C1/C2 measurement, not a no-harm check.
