# ScribeScorecard — scoped findings (round 39, w1)

Full draft: [`w1/ScribeScorecard/report.md`](ScribeScorecard/report.md). The appendable `SCORECARD.md` block —
**Round 39 — declared claims (frozen before data)** and **Round 39 — executed disposition** — is there,
written for the integration seat; `SCORECARD.md` itself was not touched (host guard).

## What the draft contains

- Declared claims: both claims with `kind`, `surface`, exact counting command, before and target from
  `.ufo/waves/round-39/claims.json`; the two frozen predicates verbatim; the kill rules; the round-start axis
  scores (adjacency 8 lowest, all others 9), saturation 8 / window 3, and the stagnation-nudge text; the three
  frozen instrument digests, re-verified equal at the freeze `9c09ebb1` and at tip `1ace2fde`.
- Executed disposition: before→after cells carry only frozen-counter outputs read through `git show <REV>:…`.
  Because no integration REV exists yet, verdict/score cells are marked `⟨pending: integration REV⟩` — no lane
  verdict is asserted anywhere.
- An explicit separation of **measured predicate** (boolean from the frozen counter's exit status at a named
  REV: 0/1/2) from **numeric axis score** (frozen `axesAtRoundStart`, moved only by an authored rubric).
- A conditional capability-row draft (wording says periodic sampling, not continuous detection).

## Measured fields (observed, evidence-backed)

| Field | Value | Evidence |
|---|---|---|
| C1 at `d3232d56…` and `1ace2fde…` | `predicate: true`, findings 0, exit 0; v1 control refused with 5 reasons | `measure/pre-integration-counters.txt`; `w1/ScribeScorecard/c1-at-1ace2fde.txt` |
| C1 receipt | sha256 `e894f1d5…`; two unrefused runs; `sampleCount` 9/1560 ms and 8/1461 ms; shared first-shot `ebfae99c…`; owned `nodePid` 2430191, 1 root / 5-member tree per run; `ss` and `/proc` 6 observations each, 0 non-loopback; post-close sweep 0/0; survivors 0; ports closed; Firefox 157.0 bound to `ms-playwright/firefox-1555` | `corpus/evidence/round-39/playwright-egress/receipt.json` |
| C2 at `d3232d56…` and `1ace2fde…` | `predicate: false`, exit 1, findings `d5-receipt` (`measure/census-end.txt` absent) and `d6-file` (`measure/numstat-at-<REV8>.txt` absent) | `measure/pre-integration-counters.txt`; `w1/ScribeScorecard/c2-at-1ace2fde.txt` |
| C2 D1–D4, D7 | D1 stale+camera-correction present, seats 34, w2 absent; D2 stated 23/11 == recomputed 23/11 of 34; D3 six hashes present/ancestor with freeze landing `34ed508c`; D4 mutant exit 1, differing sentence, unequal sha pair; D7 sentence match true | same receipts |
| Baseline controls | C1 `receipt-absent` not-met; v1 `C1_ROUTED_DEFECTS` not-met with `d4-receipt`, `d6-file`, seats 34, tally 23/11, census 144 | `measure/c1-before.txt`, `measure/c2-before.txt` |
| Census ground truth | rows 144; tier A=128 B=7 C=9; status mined=120 queued=15 rejected=9 (identical at baseline and tip) | scribe `awk` run, command in report §2 |

## Freeze-provenance conflict (verbatim values, for the canonical judge)

- `claims.json@9c09ebb1` sha256 `40740f82aee080b9a1cd2c002d31c8f36455622c8b37b95bb03e101086fcc009`, with
  `"frozenAt": "1f4260aeb3af186e84444cbb417a31b8a35bdb55"`.
- `claims.json@dc695dc` (and every later commit) sha256 `ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6`,
  `"frozenAt": "9c09ebb1e2ff594c70ce72093b5d4133c1734dca"`; `git diff --stat 9c09ebb1..d3232d56 -- claims.json`
  → 1 insertion, 1 deletion. The three frozen instrument digests are unchanged by the amendment.
- The C2 mutant receipt binds `frozenClaimsSha256` `40740f82…` (pre-amendment) and mutant `a2ba6eea…`;
  w1 `RevC2Receipt` replayed the command at `9c09ebb1` and observed exit 1 with `d7-sentence-mismatch`.
- `1f4260ae` carries C2 counter `891c1e9d…`, not the pinned `eefc8997…` — the pre-amendment C2 freeze that
  w1 `RevFreezeIntegrity` reported as a mismatch; at `9c09ebb1` and later all three digests match.

## Constraints honoured

No `SCORECARD.md`/`LOG.md`/`MANIFEST.json`, counter, claim, receipt or product file edited; no commit, push,
git/jj mutation, spawn, install, or browser launch. Seat scratch created and removed; evidence only under
`.ufo/waves/round-39/w1/ScribeScorecard/`.

VERDICT finding — draft landed: declared-claims section frozen-field complete, disposition carries `⟨pending: integration REV⟩` cells; observed C1 predicate met (exit 0, receipt `e894f1d5…`) and C2 predicate not met (`d5-receipt`, `d6-file`) at `d3232d56` and `1ace2fde`; C2's frozen D5/D6 receipts are absent and D6 is self-referential by probe; `claims.json` was amended post-freeze (`frozenAt` only, `40740f82…` → `ed88855a…`) so the mutant receipt binds the pre-amendment blob; no lane verdict or numeric axis score asserted.
