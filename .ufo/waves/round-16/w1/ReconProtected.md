# ReconProtected — protected / pinned / census sets vs the round-16 write plan

Seat `TabiR16.ReconProtected-5`, read-only. Repo `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
HEAD `e38d2599a922cb729186353830fff8e159b4fef0` (observed `git rev-parse HEAD`). No gate, selftest,
counter or browser was executed; every behavioural claim below is code-read, and predictions of
failure are marked `[INFERENCE]` (unrun). No files written except this Report; no tool installs.

## Verdict

No **new** round-16 path (PLAN ownership table, plus SKILL/README/SOURCES/QUALITY/LOG/SCORECARD
appends) is frozen by these three gates. The constraints land only on pre-existing files:

| Planned path | Constraint |
|---|---|
| `scripts/check-measurement-binding.mjs`, `scripts/selftest-measurement-binding.mjs` | none (new; not in `PSTACK_PATHS`, `protectedPath`, census, pins) |
| `.ufo/waves/round-16/measure.mjs`, `.ufo/waves/round-16/probes/*`, `.ufo/waves/round-16/drafts/*`, `.ufo/waves/round-16/w1/*` | none (`protectedPath` covers only `.ufo/rounds|reports|plans|continuation/fleet-round-1-*`) |
| `corpus/evidence/round-16/**` (binding, webmcp receipt/fixtures/protocol/runtime-pin) | none (only `corpus/evidence/pstack-20261015/**` is pinned) |
| `scripts/webmcp-loopback-round16.mjs` | none |
| `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (new) | unpinned; freshness target set is fixed at the c24eaea baseline, so a new note is not a target |
| `corpus/lessons/round-16.md` (new) | `protectedPath` regex *matches* but is inert (absent at baseline); live rule is `lessonDrift`: add once, never modify afterward in `92d700d6..HEAD` |
| `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md` | APPEND_ONLY byte-prefix (round gates) |
| `SKILL.md` (again) | plus freshness `pre-append`: c24eaea prefix preserved **and** file strictly longer |
| `PROVINCE.md` | APPEND_ONLY-listed, but a **census row** → byte-frozen; any append fails `Census blob drifted` `[INFERENCE]` |
| `corpus/SOURCES.md` | not in APPEND_ONLY, protectedPath, `PSTACK_PATHS`, census, or pins — no byte/append rule in these gates (separate structural `scripts/check-sources.mjs`) |

## Gate 1 — `scripts/check-round-contract.mjs`

- `APPEND_ONLY` — `:25`: `['LOG.md', 'SCORECARD.md', 'SKILL.md', 'PROVINCE.md', 'corpus/QUALITY.md', 'corpus/README.md']`.
- `protectedPath` — `:94-102`: `corpus/lessons/round-\d+.md`, `corpus/evidence/fleet-round-1-freshness/`,
  `.ufo/rounds/fleet-round-1-interactive-20261015/`, `.ufo/reports/fleet-round-1-attempt-20261015/`,
  `.ufo/plans/fleet-round-1-interactive-20261015`, `.ufo/continuation/fleet-round-1-interactive-20261015`,
  `scripts/check-freshness.mjs`, `SHONEN.md`.
  Applied only to paths present in the **baseline tree** — `:234`
  `for (const path of list(root, baseline, '.').filter(protectedPath))`; absent-at-baseline paths are
  never tested here. Bytes must be identical at baseline and HEAD (`:235-238`).
- APPEND_ONLY rule — `:242-247`: baseline bytes must be a non-null exact prefix of HEAD bytes:
  `if (!after || !after.subarray(0, before.length).equals(before)) fail('history_rewritten', 'Append-only prefix changed: ...')`.
  `before` comes from `git show <baseline>:<path>` as a Buffer (`show()` `:76-80`); deletion or any
  edit inside the baseline prefix fails; a file absent at baseline is skipped (`if (!before) continue`).
  Both gates use `HARD_BASELINE = 7f506aff…` (`:11`), and production mode refuses another baseline
  (`:225`).
- Census pin — `CENSUS_SHA256` `:30` = `b9c8dc3557b825f8bd4b18ff0db03909e16ddd526ef18554cb2bf68da696be9c`;
  checked in `censusEntries` `:176-197`; observed `sha256sum corpus/evidence/pstack-20261015/baseline-census.tsv`
  = `b9c8dc3557b825f8bd4b18ff0db03909e16ddd526ef18554cb2bf68da696be9c` (match). First line must equal the
  baseline argument (`:187`), rows are `<40-hex> <path>` (`:189-195`). Every row's recorded blob must
  equal the baseline blob **and** the HEAD blob; only `SHONEN.md` is carved out to `checkShonenPolicy`
  (`:255-260`); every other row fails as `Census blob drifted` at `:261`.
- Census content: 56 rows (`node` count over the file), including `PROVINCE.md` (`c2222b16…`),
  `SHONEN.md`, `corpus/lessons/round-1..10.md`, `scripts/check-freshness.mjs`, and the
  fleet-round-1 files. `corpus/SOURCES.md`, `corpus/QUALITY.md`, `corpus/README.md`, `.ufo/waves/**`
  and `corpus/evidence/round-16/**` are absent from it.
- Round parsing is pstack-only: `roundIds` `:271-277` matches `corpus/lessons/pstack-20261015-r\d{2}.md`;
  production expects exactly 10 (`:225`, `:576-585`). A `round-16.md` lesson is not a round to this gate.

## Gate 2 — `scripts/check-user-round-contract.mjs`

- `PSTACK_PIN` `:13` = `92d700d6a8aa9855f1e9d2cc8e12c82f762a1367`; observed `git merge-base --is-ancestor`
  against HEAD = exit 0. Production forbids `--pstack-pin` override (`:302`).
- `PSTACK_PATHS` `:73-82`: `corpus/evidence/pstack-20261015`, `corpus/lessons`, `reports`,
  `scripts/check-round-contract.mjs`, `scripts/pstack-seat.mjs`, `scripts/pstack-aggregate.mjs`,
  `scripts/check-freshness.mjs`, `SHONEN.md`. Drift is decided by `pstackDrift` `:260-271` over
  `git diff --no-renames --name-status <pin> HEAD -- <PSTACK_PATHS>` (`:327`):
  - `corpus/evidence/pstack-20261015/**` → drift on any change;
  - `corpus/lessons/**` → `lessonDrift` `:250-258`: lesson present at baseline must be byte-identical
    at HEAD; a lesson absent at baseline is admitted only with status `A` **and** no later
    `M/D/R/T` commit in `<pin>..HEAD`; any `pstack-20261015-rNN.md` is always drift;
  - `reports/**` → only `reports/pstack-20261015-rNN.md` is drift; other report paths fall through;
  - `scripts/check-round-contract.mjs` → `acceptedRoundScript` `:226-247`: HEAD sha256 must be the
    prior (`7d403cee…`) or current (`8a573b4e…`) identity, every commit in `pin..HEAD` touching it must
    be one of four archived identities, and the pinned copy must still hash to `7d403cee…`.
    Observed `sha256sum scripts/check-round-contract.mjs` = `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`
    (current identity; history `pin..HEAD` = `ed69b15`, `1212207`, `1199150`);
  - `scripts/pstack-seat.mjs`, `scripts/pstack-aggregate.mjs`, `scripts/check-freshness.mjs` → any change;
  - `SHONEN.md` → `canonicalShonen` only (`:187`, canvas seed `b45c2ac3…`);
  - then `protectedPath` `:144-152` (same list as Gate 1) for any other path.
- APPEND_ONLY `:72` and loop `:317-321`: identical byte-prefix rule to Gate 1. `protectedPath` loop
  `:311-316` runs over the baseline tree with a canonical-SHONEN carve-out.

## Gate 3 — `scripts/check-freshness.mjs`

- Baseline `c24eaea14dfc0c4a3848742d31673db5675f9183` from
  `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`; table
  `corpus/evidence/fleet-round-1-freshness/pins.tsv`. Both files sit under paths that Gate 1/2 freeze
  (`protectedPath` prefixes) and in the census, so the pin table cannot be extended this round.
- Target set is fixed from the **baseline** tree: `:78-80`
  `git ls-tree -r --name-only <baseline> -- corpus/knowledge reports SKILL.md` filtered to `.md`,
  union the 3 live public files (`:13-17`), and the resulting identity list must equal the pin table
  (`:80-81`). Observed: 31 local + 3 public = 34 pin rows.
- Byte rule: non-SKILL local targets must equal their baseline bytes — `:98-100` `bytes = current;
  if (!bytes.equals(original)) fail('content_drift', ...)`; `SKILL.md` uses
  `bytes = current.subarray(0, original.length)` (`:99`) so only the baseline prefix is compared, and
  `:101` additionally requires `current.length > original.length` (`witness_append`). Revision labels
  are `baseline@<rev>` for pinned notes/reports and `pre-append@<rev>` for SKILL.md (`:96-97`).
  Measurement is worktree bytes (`regularBytes`, `:71`, `:98`) or `git show <witness>:<path>` in
  `--witness` mode.
- Consequence: the 23 `corpus/knowledge/*.md` and 7 `reports/*.md` present at c24eaea are byte-frozen;
  the planned **new** `corpus/knowledge/webmcp-chromium-loopback-round-16.md` is not in the baseline
  target set and therefore unconstrained by this gate.

## Path predicate run (observed output)

Command (read-only Node, predicates copied from the sources; no gate executed) evaluated the PLAN
paths against the four sets. Condensed output:

```
census_rows=56 freshness_pins=34
scripts/check-measurement-binding.mjs            protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
scripts/selftest-measurement-binding.mjs         protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
.ufo/waves/round-16/measure.mjs                  protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
corpus/evidence/round-16/binding/*.json          protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
scripts/webmcp-loopback-round16.mjs              protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
corpus/evidence/round-16/webmcp/*                protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
.ufo/waves/round-16/{probes,drafts,w1}/*         protected=ok  appendOnly=-  pstack=-  censusRow=-  freshPin=-
LOG.md                                           protected=ok  appendOnly=PREFIX  censusRow=-  freshPin=-
SCORECARD.md                                     protected=ok  appendOnly=PREFIX  censusRow=-  freshPin=-
SKILL.md                                         protected=ok  appendOnly=PREFIX  censusRow=-  freshPin=FROZEN
PROVINCE.md                                      protected=ok  appendOnly=PREFIX  censusRow=FAIL  freshPin=-
corpus/README.md                                 protected=ok  appendOnly=PREFIX  censusRow=-  freshPin=-
corpus/QUALITY.md                                protected=ok  appendOnly=PREFIX  censusRow=-  freshPin=-
corpus/SOURCES.md                                protected=ok  appendOnly=-       censusRow=-  freshPin=-
corpus/knowledge/webmcp-chromium-loopback-...md  protected=ok  appendOnly=-       censusRow=-  freshPin=-
corpus/lessons/round-16.md                       protected=FAIL appendOnly=-  pstack=lessonDrift(add-once)  censusRow=-  freshPin=-
```

`protected=FAIL` for `round-16.md` is the regex matching but **not** enforced: the protected loop
enumerates the baseline tree, and `git ls-tree -r --name-only 7f506aff… -- corpus/lessons` returns only
`round-1.md` … `round-10.md` (observed). The live constraint is Gate 2 `lessonDrift`.

## How appends are validated (synthesis)

1. **Byte-prefix only.** For the six `APPEND_ONLY` files the sole rule is: committed bytes at
   `7f506aff…` are an exact prefix of committed bytes at HEAD, else `history_rewritten`
   (`check-round-contract.mjs:242-247`, `check-user-round-contract.mjs:317-321`). Nothing validates
   the appended text's structure, date, or size; the round gates do not require the file to grow.
2. **Two different baselines.** Round gates compare against `7f506aff…`; freshness compares SKILL.md
   against `c24eaea…` and requires a non-empty extension. A valid SKILL append must preserve both
   prefixes (observed today: 147204 bytes at HEAD vs 125194 at 7f506aff and 116663 at c24eaea; both
   prefixes PRESERVED, `grew=true`).
3. **Committed state, not working tree, for round gates.** They read `git show HEAD:<path>`; only
   `check-freshness --worktree` reads the checkout. Appends must be committed to be seen by
   Gates 1/2.
4. **Deletion and truncation fail.** `!after` fails; a file absent at baseline is exempt
   (`if (!before) continue`).
5. **Census overrides APPEND_ONLY.** `PROVINCE.md` is append-listed but census-frozen: baseline and
   HEAD blob ids are both `c2222b16b3b18ce2c2058fb3a50d690c6e5735ae` (observed), and the census row
   check rejects any HEAD digest other than the recorded one (`:261`). An append therefore fails
   `history_rewritten` / `Census blob drifted: PROVINCE.md` `[INFERENCE]`. `SHONEN.md` is the only
   carve-out and is validated structurally by `canonicalShonen`/`checkShonenPolicy`.
6. **Appended content is only parsed where a round-id grammar applies.** `SCORECARD.md` blocks
   `<!-- pstack-round:<id> … -->` and `<!-- user-round:<id> … -->` are parsed by
   `parseScore`/`runCount` (`check-round-contract.mjs:395-424`, `check-user-round-contract.mjs:398-410`),
   and `LOG.md` must contain the round id; these apply only to `pstack-20261015-rNN` /
   `user-20261015-rNN` ids, not to a `round-16` block. Nothing constrains a round-16 SCORECARD/LOG
   append beyond the prefix rule.
7. **`corpus/SOURCES.md` is outside all of these sets** (absent at 7f506aff, no APPEND_ONLY entry, no
   `PSTACK_PATHS` entry, no census row, no freshness pin). Its only nearby gate is
   `scripts/check-sources.mjs`, which parses row/section grammar and `used-by` paths and checks
   credential patterns, and computes no digest and no git baseline for the file (observed: no
   `sha256`/`git`/append logic; `rowPattern` at `:24`, sections/tiers/statuses at `:25-31`).

## Residual unknowns

- `scripts/check-aria-metadata.mjs` and the fleet validator
  `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (referenced at
  `check-user-round-contract.mjs:57`) were not opened; they could add constraints on
  SOURCES/README/QUALITY or `.ufo/waves` that are out of this slice.
- All failure predictions above are code-read, not executed by this seat (contract: recon runs no
  gates). L1 should re-run `node scripts/check-round-contract.mjs` and
  `node scripts/check-user-round-contract.mjs` after integration.
