# ExecFreshAttack2 — fresh receipt-parsing attack on `scripts/check-s106-evidence.mjs` (round-27 w2)

Seat: `TabiR27.ExecFreshAttack2` (leaf executor, read-only reporter). Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Gate under test: `scripts/check-s106-evidence.mjs`
(worktree == HEAD `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`; blob `ea0f9d8…`, sha256 `fce4d4e2…`).
Environment: `node --version` → `v24.21.0`; `git --version` → `git version 2.56.0`. No tool
installed/updated (operator 2026-10-19 rule: none needed; no pacman transaction attempted).

Write scope: this report + throwaway fixtures under
`.ufo/waves/round-27/scratch/TabiR27.ExecFreshAttack2/` only. Read-only git only (`init`, `config`,
`add`, `commit`, `rev-parse`, `rev-parse --show-toplevel` on scratch fixture repos). No tracked file
touched; no peer messaged; no subagent spawned.

## What was attacked

The receipt-parsing front of the C2 gate: `parseReceipt` (`scripts/check-s106-evidence.mjs:87-105`)
and the anchor/hash evaluation (`:119-127`). Four shapes per the item, plus controls. Every fixture
mirrors the gate's own selftest bytes (`:148-158`: line 187 =
`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`, unindented, unique).

Wave-1 reports read first, folded in: `w1/RevC2Gate.md` (M1: anchor content never pinned to the frozen
predicate — only internal receipt↔bytes consistency is checked), `w1/ExecC2Reopen.md` (F1–F6),
`w1/ExecC2Controls.md` (off-by-one line, duplicate anchor, missing bytes/receipt, path-escape arms),
`w1/ExecSelftestSweep.md` (OBS-1/2), `w1/SimplifyEvidence.md`. **None of them exercised the four
receipt shapes attacked here** — they covered line-number and occurrence tampering, not value-type,
whitespace, hex-case, or anchor-absence parsing. No earlier finding names (a)–(d).

## Runs (verbatim; each fixture: `D=$(mktemp -d …)`; `git -C "$D" init -q`; `config user.email/name`;
assert `[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ]` before the first commit; then
`git -C "$D" add -A` + `git -C "$D" commit --allow-empty -q -m fixture`)

```
node scripts/check-s106-evidence.mjs --repo <fixture> --rev <rev> --json
```

| # | case | fixture rev | exit | verdict fields (JSON) | stderr |
|---|---|---|---|---|---|---|
| 0 | control clean | `a0867649…` | 0 | `present:true sha_match:true anchor_located:true anchor_unique:true byte_count_match:true valid:true` occurrences=1 | — |
| a | `anchor.line` = STRING `"187"` | `a0e04f2c…` | **2** | stdout 0 bytes (no JSON, never valid) | `S106_EVIDENCE verdict=could-not-evaluate detail=receipt anchor needs line (number) and text (string)` |
| b1 | receipt `anchor.text` = `"  BASE_FEATURE(…);"` (2 leading spaces), bytes line 187 unindented | `7edd94ed…` | **0** | `anchor_located:true anchor_unique:true valid:true` (anchor.text echoed with leading spaces) | — |
| b2 | receipt `anchor.text` = `"BASE_FEATURE(…);  "` (trailing spaces) | `4d726838…` | **0** | `anchor_located:true valid:true` | — |
| b3 | bytes line 187 INDENTED (receipt re-hashed), receipt text unindented | `6741f97c…` | **0** | `anchor_located:true valid:true` | — |
| b4 | negative control: receipt text `"  WRONG_ANCHOR_TEXT"` (whitespace + different content) | `bd9e1efb…` | **1** | `anchor_located:false valid:false` occurrences=0 | — |
| c | receipt `decoded_sha256` = UPPERCASE hex of the correct digest | `988a4c80…` | **1** | `sha_match:false valid:false`; claimed `D721CD40…` vs observed `d721cd40…`; `anchor_located:true byte_count_match:true` | — |
| d | receipt **missing `anchor` entirely** | `0e1b9c60…` | **2** | stdout 0 bytes (no JSON, never valid) | `S106_EVIDENCE verdict=could-not-evaluate detail=receipt missing anchor` |

Relevant source lines: anchor type gate `:100-103`; anchor location `lines[line-1].trim() === text.trim()` `:123`; occurrence count (trimmed equality) `:124`; sha `:119-120` (`digest("hex")` lowercase vs strict `===` `:120`).

## Findings

- **(a) — CONFIRMED, fail-closed, INFO.** `anchor.line` as string `"187"` → Refusal → exit 2
  (`parseReceipt:101`), stdout empty, never valid. Note the type check is strictly conservative: the
  evaluation arithmetic `lines[receipt.anchor.line - 1]` (`:122`) would coerce `"187" - 1` → 186
  correctly, but the receipt is refused before evaluation. A receipt produced by a serializer that
  emits numeric fields as strings is triaged `could-not-evaluate` rather than evaluated. No false
  admission; no kill-rule violation.

- **(b) — CONFIRMED: trim-equality masks a real whitespace mismatch.** The receipt's recorded anchor
  text need not match the committed line byte-for-byte. Leading (b1) and trailing (b2) whitespace in
  `anchor.text` both pass `valid=true` against the unindented line; an indented committed line also
  passes an unindented receipt text (b3, `anchor_located:true`). The mask is exactly whitespace:
  b4 shows differing content still fails (`exit 1`, `anchor_located:false`). The predicate
  (`:123-124`) is `trim()`-on-both-sides, so indentation state is unobservable to the gate. Combined
  with `w1/RevC2Gate.md` M1 (anchor content is never pinned to the frozen predicate), the anchor check
  enforces only "unique trimmed string at the recorded line" — the `BASE_FEATURE(kBackForwardCache…`
  content pin is not enforced at all, and whitespace fidelity is additionally lost. Severity: LOW (a
  fidelity gap within an already unpinned anchor check; does not create a new fabrication class beyond
  M1, since M1 already admits arbitrary anchor text).

- **(c) — CONFIRMED: hex case-mismatch is flagged, but falsely.** A receipt whose `decoded_sha256`
  is the same digest in uppercase hex exits 1 `sha_match:false valid:false` with every other predicate
  true. Hex digests are case-insensitive semantically; the bytes are identical, so the verdict
  "invalid" is wrong on the evidence. Strict string equality (`:120`) against Node's lowercase
  `digest("hex")`. Fail-closed direction only — an uppercase digest can never falsely *admit*
  (a case-mismatch always fails), so the live tip is unaffected (real receipt digest `9b93fe64…` is
  lowercase, observed). Severity: LOW.

- **(d) — CONFIRMED, matches expectation.** Receipt missing `anchor` → Refusal `"receipt missing anchor"`
  (`:100`) → exit 2, stdout empty, never valid. Kill rule respected.

## Observation vs inference

All exits, JSON fields, and refusal strings above are observed tool output (commands retained in the
transcript `scratch/TabiR27.ExecFreshAttack2/transcript.txt` and per-case `out-*.json`/`err-*.txt`).
The judgment that uppercase hex "should" compare equal is a semantic statement about sha256 notation,
not an observed gate behavior. The claim that wave-1 reports did not exercise these shapes is an
observed negative sweep over the four reports listed above.

## Risks / blockers

- None blocked. (a)/(c)/(d) are fail-closed by construction; (b) is the only case where the gate
  admits receipts whose recorded anchor text does not byte-match the line — limited impact per M1.
- If the L1 wants stricter anchor fidelity: compare untrimmed `lines[line-1] === anchor.text` (would
  fail the real receipt? no — the real receipt text is the byte-exact line 187, so untrimmed equality
  still passes at the tip); and normalize hex to lowercase before comparing `:120`.
- Scratch fixtures remain under `scratch/TabiR27.ExecFreshAttack2/` (7 repos + driver + generator +
  transcript + per-case out/err) for L1 re-execution.

## Files changed

- `.ufo/waves/round-27/w2/ExecFreshAttack2.md` — this report (only tracked-area write).
- `.ufo/waves/round-27/scratch/TabiR27.ExecFreshAttack2/` — `mk-fixture-data.js`,
  `run-attacks.sh`, `transcript.txt`, `out-*.json`/`err-*.txt` (7 cases), fixture repos `clean-*`,
  `line-string-*`, `anchor-indent-*`, `anchor-trailing-*`, `bytes-indent-*`, `sha-upper-*`,
  `no-anchor-*`, `anchor-wrong-*`. No tracked file modified; no git/jj write outside fixture repos.
