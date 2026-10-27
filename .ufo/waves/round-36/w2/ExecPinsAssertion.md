# ExecPinsAssertion — round 36 w2 (FALSIFY): F1 mitigation evidence, executed

Seat: ExecPinsAssertion (leaf executor). Item: produce the **out-of-band pins-binding** the
round's measurement cites, against CritC1's F1 (frozen delta pins read from REV with no digest
binding). Executed at the w1 landing, not only at the freeze.

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Freeze: `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (2026-10-27 06:17:04 -0300)
- Landing under attack: `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`
- Machine-readable receipt: `pins-binding-receipt.json` (this directory)
- Tooling: **nothing installed or upgraded** (node v24.21.0, git 2.56.0). No pacman.
- Scratch: `/fast/scratch/hyaku/tabi-r36/ExecPinsAssertion/` (`TMPDIR` passed explicitly),
  deleted before this report was finalised. All git calls read-only, all with `-C`.

**VERDICT ok — all 8 frozenDigests entries are byte-identical at the freeze and at the w1
landing, and no commit at or after the freeze in any ref carries different bytes; the
binding discriminates against every F1 substitution vector I could construct. Two advisories
below, neither of which changes a measured number this round.**

---

## A1. The two checks, executed for every frozen file

The item said "ALL SIX other frozen files"; `claims.json:frozenDigests` actually enumerates
**8 keys** (2 counters + `controls.mjs` + `measure.sh` + `c1-drift-audit-build.mjs` +
`c1-delta-pins.json` + 2 gate scripts). I ran the pair of checks on all 8 — a superset of the
item's count, so no file the claims freeze is left unbound.

For each: (1) `git show <rev>:<path> | sha256sum` at the freeze **and** at the landing, compared
to `frozenDigests`; (2) `git diff <freeze> <landing> -- <path>` must be empty.

| frozen file | frozenDigest | @freeze | @landing | diff freeze..landing | commits ≥freeze with other bytes |
|---|---|---|---|---|---|
| `.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs` | `8a223faf…aad385` | match | match | empty | 0 |
| `.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs` | `15910c59…e2b764` | match | match | empty | 0 |
| `.ufo/waves/round-36/baseline/controls.mjs` | `27dba3ea…259b061` | match | match | empty | 0 |
| `.ufo/waves/round-36/measure.sh` | `6a652aca…ff35afa` | match | match | empty | 0 |
| `.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs` | `c8153a5a…c62a2be1` | match | match | empty | 0 |
| `.ufo/waves/round-36/baseline/c1-delta-pins.json` | `81019362…f1910655` | match | match | empty | 0 |
| `scripts/check-adjacency.mjs` | `4e2c2a64…92324aac` | match | match | empty | 0 |
| `scripts/check-bidi-runtime.mjs` | `370e8e95…7d86c87` | match | match | empty | 0 |

`git diff --stat <freeze> <landing> -- .ufo/waves/round-36/counters .ufo/waves/round-36/baseline
.ufo/waves/round-36/measure.sh scripts/` prints nothing: the landing touched none of the
protected dirs (it changed `corpus/SOURCES.md`, two `session_commands.cc` sources,
`corpus/evidence/round-29/release-pins/{receipt.json,refetch/S125.json}`, and
`corpus/knowledge/adjacency-drift-audit-r36.md`).

**Stronger than byte-identity at two points.** I hashed each file at *every* commit in
`git rev-list --all` that contains it: the pins file appears in 31 commits (0 differ), and for
all 8 files **no commit at or after the freeze carries different bytes**. The gate scripts have
4 and 12 pre-freeze historical versions respectively — expected, and irrelevant to a
measurement at any revision ≥ the freeze. So the binding is **REV-independent for every
revision the round can measure**, not just for the two revisions named above.

Worktree snapshot (not a guarantee, a measurement): all 8 worktree copies currently equal the
frozen bytes, so a seat that violates the measurement rule and runs the worktree copy is, right
now, running the frozen bytes anyway.

## A2. The binding is against frozen claims, not a mutable file

`claims.json` is **byte-identical** at the freeze and at the landing
(`sha256 3c6fe2705d1062f6f6dfc9cdc521de2c64f02b1d493ac3026f3e8b6e60c09245`), and its
`frozenDigests`, `measurementRule` and `claims` blocks are identical. The w2 dispatch commits
(`12915bc`, `1ee2ab1`) did not touch it. So the digests I compare against are the frozen ones,
not something amended after the data.

## A3. What the bound pins file actually says (adjacency leg)

`c1-delta-pins.json` holds **20 lanes**, and the counter's `PINS` constant is byte-identical to
the round-35 counter's `PINS` (v3 vs v4, 20/20 entries equal), so "moved after the round-35
pins" is well defined. Re-derived with the frozen counter's own comparison:

- **12 drifted lanes** (`chousa kaidoku kake kama kasegi kengaku kumitate mado mori revenger
  tameshi tsukuroi`), 8 unchanged — matches the claim's "12 drifted lanes" exactly.
- **20/20 pins resolvable** as commits in their sibling repos, and **20/20 are ancestors of the
  lane's live HEAD** — no rewind, no orphan/rewritten branch behind a pin.
- 8 lanes have moved *past* their pin since the freeze (post-freeze sibling work). Harmless: the
  counter resolves the pinned commit by sha, so drift derivation is immune to later movement.
- 15/20 pins equal the lane's head *at freeze time* (newest HEAD ancestor with commit time ≤
  freeze). 5 do not: `chousa` −4, `kaidoku` −3, `kake` −2, `souji` −1, `tsukuroi` −3 commits.
  All 5 pins are ancestors of their freeze-time head, so "resolvable at freeze" holds and the
  drift classification is still honest.

Ledgers are untouched by the landing: `corpus/adjacency-screen-drift.tsv`
`bde87e24…1debf2` (307 rows: 304 unchanged, 3 moved), `adjacency-screen-browser.tsv`
`f4fc43f0…d8cb3b8`, `adjacency.tsv` `7a16a2e6…bac6e8`, `adjacency-screen-delta.tsv` empty
(`e3b0c442…b855`) — identical freeze→landing. w1's 307/307 therefore still stands at the landing.

## A4. The binding discriminates (control: it is not a tautology)

Substitution vectors, hashed against the frozen digest `81019362…f1910655`:

| construction | sha256 | detected |
|---|---|---|
| CritC1 F1/**T8** — `kaidoku` head → `c4895cf1f0fc00b629fbf5f4f9d4dd789ae93210` (a real commit; T8 scores predicate TRUE with 3 moved rows mis-audited) | `8f208b37…e22165fd` | yes |
| CritC1 F1/**T6** — `kaidoku` head → its round-35 pin `49096c7e…` (pool shrinks 307→170) | `d03033a4…85664a74` | yes |
| 8 pinned heads replaced by the lanes' **live** heads | `ef889b81…e2450b` | yes |
| single head `kama` `3a600d2f…` → its child `1d83c75f…` | `9a1ef48b…476bd7` | yes |
| semantic no-op reformat (indent 2, same mapping) | `8c0e5ef6…cf6b39a6` | yes |

Both of CritC1's winning trees are killed by the out-of-band check at the digest level, before
any counter runs. T6c (pins tampered, old ledger kept) is killed by the same check.

## A5. F1 is still open in the harness at the landing — this receipt is the only binding

- `measure.sh` has **0 references** to `delta-pins` (it pins counter bytes from the freeze and
  the two gate-script shas at REV).
- The frozen counter reads `DELTA_PINS_PATH` at REV (line 370), shape-checks it, resolves each
  head — and **never compares its bytes to a digest**, although it already implements exactly
  that pattern for the gate script (`ADJ_GATE_SHA256`, line 79; refuse at line 255).
- The pins digest `81019362…` appears in the wave dir only in `claims.json` and in w1 seat
  reports/commands — never in a counter, a control provenance, or `measure.sh`.

So the after-measurement must consult this receipt; it cannot inherit the binding from the
harness. Exact amendment for round 37 (CritC1's smallest correction, which this receipt
independently confirms is the right shape):

```js
const DELTA_PINS_SHA256 = '810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655';
// after line 370's blob():
if (sha256(pinsBuf) !== DELTA_PINS_SHA256) throw new Refusal(`${DELTA_PINS_PATH} at ${REV} sha256 ${sha256(pinsBuf)} != frozen ${DELTA_PINS_SHA256}`);
```

Residual the amendment must respect: `measure.sh` clones with `--shared`, so a **dangling**
commit carrying substituted pins is checkoutable even though no ref contains it. A digest test
inside the counter is therefore the right place — it binds the bytes at whatever REV is
measured, not the reachability of that REV.

## ADVISORY 1 — 5 pins sit behind the freeze-time head; zero measured effect

`souji`'s pin is its round-35 pin (`9c76c722…`) although souji had already moved one commit
before the freeze (`2b59192`, 06:08:22 < freeze 06:17:04). Because the counter skips any lane
whose recorded head equals its `PINS` entry (`deltaCandidates`, `if (head === PINS[sib]) continue`),
souji is classified *undrifted*: the drift set is 12, not 13, and souji's post-pin lines never
enter the delta pool. The same, smaller, applies to `chousa`/`kaidoku`/`kake`/`tsukuroi`
(1–4 commits of post-pin lines outside the pool enumerated at the pinned head).

Measured effect this round: **none**, and I quantified it with the frozen counter's own exported
`deltaCandidates` (imported from freeze bytes, sha256 `8a223faf…aad385`):

- delta candidates under the frozen pins: **0**; under pins corrected to every lane's
  freeze-time head: **0**; missed candidates: **0**.
- `souji` is cited by **0** rows of `adjacency-screen-browser.tsv`, and adds **0** BG non-`tabi`
  lines across `9c76c722..HEAD` (1444 lines added, none browser-ground).

So calling this a falsification of the measured predicate would be overclaiming: the delta pool
is empty either way (`delta.total=0`, consistent with control c1-J4). Smallest correction, for
the round-37 re-freeze only (the pins file is frozen bytes — it cannot be edited in this round):
record each lane's freeze-time head in `c1-delta-pins.json` (souji → `2b59192`), regenerate the
drift ledger with `c1-drift-audit-build.mjs`, re-measure; the drift set becomes 13 and the delta
pool is enumerated at the true freeze heads. Alternatively state in the claim that a pin is the
head *at pin time*, not at freeze — either is fine, the ambiguity is what should go.

## ADVISORY 2 — two `frozenDigests` keys are not paths

The keys `scripts/check-adjacency.mjs (pinned inside C1; must stay unchanged)` and
`scripts/check-bidi-runtime.mjs (pinned inside C2; must stay unchanged)` are prose, not paths:
a verifier that iterates `Object.keys(frozenDigests)` as file paths will fail to resolve both
gate scripts. I had to strip the parenthetical to bind them (both then match, A1). Smallest
correction: move the parenthetical to a sibling field (or key the two as plain paths) at the next
claims write, so the round-37 amendment cannot silently skip the two files whose digests are the
whole point of C1/C2's gate pinning.

---

## Reproduction

```sh
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
F=2e7b7a8920bff47fae6f75c3d06e48e37767099e
T=f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7
# (1) digest at freeze and at landing, (2) diff must be empty
for f in $(python3 -c "import json;print(' '.join(k.split(' (')[0] for k in json.load(open('$L/.ufo/waves/round-36/claims.json'))['frozenDigests']))"); do
  echo "$f $(git -C $L show $F:$f | sha256sum | cut -d' ' -f1) $(git -C $L show $T:$f | sha256sum | cut -d' ' -f1)"
  git -C $L diff --name-only $F $T -- "$f"
done
# (3) no commit at/after the freeze carries other bytes
git -C $L rev-list --all -- .ufo/waves/round-36/baseline/c1-delta-pins.json   # 31 commits, 0 differ
# (4) delta pool under frozen vs freeze-head pins, frozen instrument
node <frozen c1-adjacency-sweep-v4.mjs>/deltaCandidates(fleet, pins)          # 0 vs 0, 0 missed
```

**VERDICT ok — 8/8 frozenDigests bound at the freeze and at the landing, 8/8 freeze..landing
diffs empty, 0 commits at/after the freeze with substituted bytes; T8/T6/live-head/one-head/
reformat substitutions all rejected by the digest. Advisories: 5 pins behind the freeze-time
head (souji omitted from the drift set) with a measured delta-pool miss of 0, and two
`frozenDigests` keys that are prose rather than paths.**
