VERDICT: ISSUES

Scope: read-only verification of (a) the integrator ruling text at the tabi baseline, (b) kaidoku
`PROVINCE.md:53` at the pinned 40-hex, (c) whether kaidoku has since landed a tabi citation. No
writes outside this file; no `jj`; no git write; no sandbox clone needed (no commands required one).
No tool installs were needed.

## 1. Ruling text — PASS, verbatim at tabi 5859243183c4d7ac5429dfdb8a73ce0d9a43d583

`git -C tabi-shokunin rev-parse HEAD` = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; worktree clean for
this file (`git status --porcelain -- corpus/lessons/round-16-verifier-spotcheck.md` empty).
`git show 5859243:corpus/lessons/round-16-verifier-spotcheck.md`, exact lines:

- `:138` — `## Integrator ruling — contested scope (tabi report `:136-137`, lesson `:113-116`)`
- `:140` — `Recorded for the operator and both lanes:`
- `:141` — `- **tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.`
- `:142` — `- **kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis (`kaidoku-shokunin/PROVINCE.md:53`, "Runtime observation (CDP)"). It cites tabi for browser-side mechanics.`
- `:144` — `This closure edits neither lane's PROVINCE. Lane-side follow-ups are routed below.`
- `:152` — routed defect 5, including `kaidoku should make its `PROVINCE.md:53` CDP row cite tabi for browser-side mechanics.`

Cross-references also verify: fleet `.ufo/reports/round-16/tabi.md:136-137` is the contested-scope
note citing `kaidoku-shokunin/PROVINCE.md:53`; `tabi-shokunin/corpus/lessons/round-16.md:113-116` is
the `## Adjacency` paragraph. The spotcheck file exists only in the tabi lane (absent at fleet root),
so a C3 `ruling_ref` must use the `tabi-shokunin@<hex>` repo token, not `fleet@<hex>`.

## 2. kaidoku PROVINCE.md:53 — PASS, same row at every candidate pin

- kaidoku has **no `master` ref**: `git rev-parse --verify master` → `fatal: Needed a single
  revision`, rc 128. Branch is `main`: `refs/heads/main` = `9011581d84527ba34c675f9cf912e54d2e72d470`,
  equal to `HEAD` (`symbolic-ref -q HEAD` → exit 1, detached; `origin/HEAD` = same).
- Fleet-recorded round-17 pin: `MANIFEST.json` `/rounds/358/commit` =
  `kaidoku-shokunin@de6c721be61bf6e8b4001021f09a9cdea38166dd`; `/rounds/358/verification/spotcheck` =
  `...@9011581d84527ba34c675f9cf912e54d2e72d470`. Round-18 contract baseline B = `9011581d…` (`main`).
- `PROVINCE.md` blob `99e1ecc4499d6f2e8f8bb8c10406ab84d49eecab` at `de6c721`, `9011581`, `main`, and
  the worktree (no diff). Line 53 is the `Runtime observation (CDP)` row at both r17 revs.
- Not a drift artifact: r16 pin `b563c799:PROVINCE.md` = `aa309ded…`; `git diff -U0 b563c799 de6c721 --
  PROVINCE.md` changes only `:52` (Cross-version compare, 1+/1-). `:53` is byte-identical row text.
- The ruling's parenthetical `"Runtime observation (CDP)"` is an exact substring of `:53`.

## 3. Has kaidoku since landed a tabi citation? — NO (routed defect 5 kaidoku half still OPEN)

- Strict word-boundary count `(^|[^[:alnum:]_-])[Tt]abi([^[:alnum:]_-]|$)` = **0** in `PROVINCE.md`,
  `SKILL.md`, `LOG.md`, `SCORECARD.md`, `README.md`, `corpus/SOURCES.md`, `corpus/QUALITY.md`,
  `corpus/README.md` (worktree; `PROVINCE.md` itself clean vs HEAD).
- `git grep -rlE` over `corpus/` (`*.md`, `*.tsv`) at HEAD: no hits.
- `git grep -nw -i tabi HEAD` hits only historical `.ufo` artifacts (interactive-session JSONL,
  `luna-round-10/K1.md:5`, `KB1.md:5,10,11`, `arc2-loop1-round3/E17.md:272`) — none a lane surface.
- Pickaxe `git log --all -S'tabi' -- PROVINCE.md` returns only `40de383`; its sole PROVINCE hunk is
  `+ ... rerun id-stability`, i.e. the substring inside "stability" (false positive), not a citation.
- Chronology closes it: kaidoku tip `9011581` is `2026-10-20 12:06:56 -0300`; the ruling commit
  `5859243` is `12:31:11`. `git log --all --since='2026-10-20 12:31'` → empty. No post-ruling commit.
- WIP round-18 (untracked, `contract.md` mtime 12:37) has no `tabi|ruling|adjacen` token; its C1
  routed list is only `R17-PINMAP, R17-VALIDATE16, R17-PRODUCER-REV, R17-SUMS-RUNLOG, R17-REGISTRY,
  R17-S032-DIGEST`.
- kaidoku's own r17 spotcheck `corpus/lessons/round-17-verifier-spotcheck.md:127` says
  `| adjacency | unchanged | Nothing absorbed; the revenger/kaidoku contest is unchanged (integrator-owned) |`
  — no tabi mention.

## Findings

**P1 (blocks a correct C3 row) — the scout pin recipe is wrong for kaidoku.**
The AdjKaidoku prompt in `.ufo/waves/round-17/w1/spec.json` says `git -C … rev-parse master` for the
pinned 40-hex. That returns rc 128 here. A scout obeying it literally either fails or falls back to
`HEAD`, which is detached — the exact C1 hazard this round is about. Fix: resolve
`rev-parse --verify refs/heads/main` (or generic laneTip: `symbolic-ref -q HEAD`, else
`refs/heads/main`, else `origin/HEAD`). Use `9011581d84527ba34c675f9cf912e54d2e72d470` or the
MANIFEST pin `de6c721…`; both carry the same `PROVINCE.md` blob.

**P2 (coverage) — the ruling names only `:53`; kaidoku holds a second live browser-runtime row at `:128`.**
`:128` = `| Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe); … |
`observe-web-session`, `observe-web-execution`, `observe-javascript-runtime`,
`reconcile-javascript-runtime` | ...`. A `:53`-only row under-records the overlap. Add a second ruled
row at `:128` (same ruling), and name both loci in the tabi **SKILL.md** append.

A tabi `PROVINCE.md` append cannot land, verified: `PROVINCE.md` is census row
`corpus/evidence/pstack-20261015/baseline-census.tsv:24` (blob `c2222b16…`), and
`scripts/check-round-contract.mjs:268-281` fails any census-row drift with
`history_rewritten: Census blob drifted: PROVINCE.md`. `APPEND_ONLY` at `:25` nominally lists
PROVINCE.md, so the gate contradicts itself and the census check wins. `SKILL.md` is not a census row
(the census holds only PROVINCE.md among the six append-only files), so SKILL.md is the executable
carrier. The user gate's `pstackDrift` (`check-user-round-contract.mjs:283-292`) does not list
PROVINCE.md; the refusal point is the round contract above, not that function. The only non-SKILL
route is a gate change: a PROVINCE carve-out in the census loop mirroring the SHONEN `continue`
(`check-round-contract.mjs:258`, `:274`) plus a `ROUND_SCRIPT_*` identity re-pin
(`check-user-round-contract.mjs:29-41`). Removing the census row is refused — any census byte change
hits `Census identity changed` (`check-round-contract.mjs:205-206`).

**P3 (wording that a checker can trip on) — `:142` "It cites tabi for browser-side mechanics."**
Present tense, but false at the pin (0 citations, §3). The operative obligation is `:152` ("should
make … cite tabi"). The C3 row must use the constraint clause as `ruling_quote` and must not encode
kaidoku adoption as a satisfied fact; disposition is `ruled` with an open follow-up on kaidoku's side.
That follow-up is feasible: kaidoku edited `PROVINCE.md:52` in r17 (`git diff b563c799 da64646 --
PROVINCE.md`; its wave2 dispatch reviewed `PROVINCE.md:52` in place), so only tabi's copy is frozen.

**Info — port lease, with prior art verified.** `:53` self-launches
`chromium --headless --remote-debugging-port=9222` and `xvfb-run electron --remote-debugging-port=9223`.
The lease is already recorded outside tabi: `kagi-shokunin/corpus/adjacency.tsv:82` (musketeer profile,
`kake`, `contested`, `presence-only`, ref `lane:kake/SKILL.md:161`), `kake-shokunin/SKILL.md:159-162`
(lease before browser; `127.0.0.1:9222` serializes the whole fleet), `kake-shokunin/PROVINCE.md:35-36`
("contested scope (kagi/tabi/kake) and stays with the integrator"), `kagi-shokunin/PROVINCE.md:43`
(threshold `9222` + profile contested with kake). All four lines re-read and match. kagi's file is a
different schema (header `# kagi-shokunin ownership partition — v1 (round 16)`), so it is prior art,
not a reusable table. Constraint: `.ufo/l0-questions.md` holds only two `tabi |` rows (`:25` round-5,
`:34` round-1), none about the musketeer lease or CDP 9222; `check-adjacency.mjs:555-558` requires
`fleet@<hex>:.ufo/l0-questions.md:<line>` naming a `tabi | round-<N> |` row for `contested-open`, so
that disposition is unavailable for the lease row today — use `split-declared`/`refused-route` or file
an L0 line. The checker accepts `<lane>-shokunin` tokens for `ruled` (`:56-57`, `:560`), so the
`tabi-shokunin@5859243…` ruling_ref above is valid. (Checker line numbers are the worktree file —
absent at `5859243`, new this round — so re-read after C3Checker integration.)

## Exact C3 ruled row (quotes verified verbatim; all ≤25 words, no TAB)

Row 1 (`:53`):
- surface = `live-browser-cdp-observation`; sibling = `kaidoku`; disposition = `ruled`
- sibling_ref = `kaidoku-shokunin@de6c721be61bf6e8b4001021f09a9cdea38166dd:PROVINCE.md:53`
- sibling_quote = ``Runtime observation (CDP) | self-launched targets: `chromium --headless --remote-debugging-port=9222`, `xvfb-run electron --remote-debugging-port=9223` `` (12 words; verbatim at pin)
- tabi_ref = `PROVINCE.md:9`
- tabi_quote = `CDP session discipline (endpoints, targets, screenshot/DOM evidence` (7 words; verbatim at 5859243)
- ruling_ref = `tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142`
- ruling_quote = `keeps CDP only as an REA provider surface for shipped-artifact analysis` (11 words; verbatim at `:142`)

Row 2 (optional, `:128`): sibling_ref `kaidoku-shokunin@de6c721…:PROVINCE.md:128`; sibling_quote
``Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe)`` (9 words) or
`` `observe-web-session`, `observe-web-execution`, `observe-javascript-runtime`, `reconcile-javascript-runtime` ``
(4 words), both verbatim; same tabi_ref/tabi_quote and ruling_ref/ruling_quote.

## Residual risk and verification gaps

- `corpus/adjacency.tsv` and `scripts/check-adjacency.mjs` do not exist yet (L1 integration), so the
  row was verified by hand against Git blobs, not by the checker. `measure-c3.mjs` was not run.
- kaidoku is a live lane (untracked round-18 WIP, contract mtime 12:37): "not landed" is stated as of
  tip `9011581` 12:06:56 and the worktree observed this session. Re-check before closure.
- `PROVINCE.md:53` citations drift: kaidoku `.ufo/waves/luna-round-4/V04a.md:8` already cites
  `PROVINCE.md:53` for unrelated APK-inventory shorthand. The C3 checker must verify the quote **at
  the cited line**, not just the line number (the PLAN schema already requires this).
- No secret/session values read; only shape/line evidence.

Files written:
- .ufo/waves/round-17/w1/RevKaidokuRuling.md
