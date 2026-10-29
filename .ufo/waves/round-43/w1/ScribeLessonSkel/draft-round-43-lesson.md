# Round 43 — SKELETON (drafted pre-WAVE-DONE by seat ScribeLessonSkel, 2026-10-29)

> **Skeleton, not the integrated lesson.** This file is the draft the L1 lands as
> `corpus/lessons/round-43.md` after WAVE-DONE. Every `[L1: …]` marker is a placeholder the L1
> fills with the settled wave evidence; this seat deliberately does **not** write verdicts, does
> not write post-wave rows, and does not touch `corpus/`. Draft location:
> `.ufo/waves/round-43/w1/ScribeLessonSkel/draft-round-43-lesson.md`.
> Evidence for every claim below: `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-*.txt`.

## Gate

### Candidates considered

- **C1 — coverage capability**: admission attempt of the round-43 signature-authenticated
  Playwright Firefox loopback TCP chain (`scripts/measure-c1-round43.mjs` +
  `scripts/playwright-firefox-egress-round43.mjs` +
  `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`), frozen in
  `.ufo/waves/round-43/claims.json` at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`.
- **C2 — calibration**: the round-42 routed-defect checker hardened
  (`.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`, `--rev <rev> --repo
  /home/vgpnk/Projects/shokunin/tabi-shokunin --json`): r1 blob-type gate (S151), pinned measure
  blob id `8ff64d691f5c09569a50f2a5a038bb23774c3d35`, r5 freeze-binds-controls, r6 committed
  V0-probe refusal.
- **S150, S151 — two new registry rows** mined at the freeze (admit candidates below).

### Admit candidates — the two registry rows opened this round

| id | source | located quote (verbatim, flat-byte) | access date | staged bytes committed at the freeze | quote location | quote size | re-open verdict |
|---|---|---|---|---|---|---|---|
| **S150** | Node.js Crypto documentation — https://nodejs.org/docs/latest-v24.x/api/crypto.html | `createPrivateKey, createPublicKey, generateKeyPair, sign, verify,` | opened 2026-10-29 | `.ufo/waves/round-43/sources/crypto.html` — 681,625 B, sha256 `4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af` | byte 85109, line 1056, **1** occurrence | 5 words, 0 pipes | `w1/RevS150.md` — **AGREE** (live GET byte-identical, `cmp` exit 0) |
| **S151** | git-cat-file manual — https://git-scm.com/docs/git-cat-file | `Instead of the content, show the object type identified by` | opened 2026-10-29 | `.ufo/waves/round-43/sources/git-cat-file.html` — 79,360 B, sha256 `624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7` | byte 43851, line 2234 (the `-t` option's `<dd>`), **1** occurrence | 10 words | `w1/RevS151.md` — **AGREE** (live GET byte-identical; blob/tree/commit `cat-file -t` run in a scratch fixture) |

Both rows are tier A, status `mined`, recheck `on-release`, 11 cells, no escaped pipes; the
sha256 each row records equals the sha256 of the committed staged copy (re-derived this round,
`evidence-committed-bytes.txt` §1–§2). Registry row count at the freeze: **151**.

Locator precision (nuance, not a defect — both re-open seats still agreed):

- **S150**'s locator cell reads `§Crypto API index line`. The quote is a code line, not prose: the
  destructured identifier list of `const { createPrivateKey, createPublicKey, generateKeyPair,
  sign, verify, } = await import('node:crypto')`. Its actual heading context in the staged copy is
  `Crypto` (h2) → `Asymmetric key types` (h3) → `Examples` (h4). The row's `teaches` claim — the
  five primitives the round-43 Ed25519 chain is built on — is directly evidenced by the quote.
- **S151**'s quote sits under the `-t` option (`<dt id="…--t">`) in the page's OPTIONS section;
  the page's `<type>` option separately names `blob` and `tree`, so the row's type-discipline
  scope claim is supported by the same page (RevS151 additionally confirmed it empirically).
- The staged `crypto.html` is a snapshot of `latest-v24.x`; its `<h1>` reads *Node.js v24.22.2
  documentation* while the pinned node binary is v24.21.0. The row says "node v24.x docs page" and
  carries `on-release` cadence — consistent, but the docs page moves under the pin, so the frozen
  staged copy (not the live URL) is what any future quote check must read.
- Word counts diverge between seats: the **quote cells** hold 5 (S150) and 10 (S151) whitespace
  words — the counts `RevS150` / `RevS151` measured; the L1's live draft `corpus/lessons/round-43.md`
  writes "7 words" and "11 words". S151's 11 comes from appending the `<object>` placeholder
  (`… identified by <object>.`); S150's 7 is not reproduced by the code-line form
  (`const { … }` → 8 tokens). Both are far below the registry contract's ≤25-word limit, so neither
  admit is affected; carry the quote cell's own count (5 / 10) in the lesson.

### Reject row

| seat re-open | row | verdict | grounds |
|---|---|---|---|
| *(none at the time of this draft)* | — | — | the two dedicated re-open seats (`RevS150`, `RevS151`) both **agreed**; no seat's re-open disagreed with either admit at the sweep recorded in `evidence-sibling-sweep.txt` |

`[L1: at WAVE-DONE, re-run the sweep. If any settled seat's re-open disagrees with either admit,
add one row here (seat, row, verdict, grounds, evidence path) and demote the corresponding admit
candidate — the row stays in the registry only with the flip the lane's own gate requires.]`

### Claim gates (predicates frozen before any seat data)

- **C1 —** `[L1: verdict + evidence pointer; the frozen kill rule fires on any in-model do-nothing
  reach, on any control refusal, or on receipt/measure bytes not committed at the measured
  revision.]`
- **C2 —** `[L1: verdict + measured revision; the frozen kill rule fires if a settled seat shows a
  rule accepting what its sentence denies.]`

`[L1: one-line-per-row for the wave results path (.ufo/waves/round-43/w1-results.json) and the
seat tallies.]`

## Mistakes — pre-data events only

Both rows below are **pre-data** (they happened before the freeze, before any seat scored, and are
disclosed in the freeze commit's own `LOG.md` / `SCORECARD.md` text). Verdicts and post-wave rows
stay for the L1.

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| **Instrument refused its own first live attempt** — the round-43 counter rejected the first live measurement with 46 real `*-egress` findings (one non-loopback owned socket, samples 111–133 of run 1, absent by run 2) | `.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1/` (the run-1 archive recovered into the wave dir from the scratch archive the freeze's `LOG.md` names): the run's own counter output lists exactly 46 findings `run1-sample111-ss-egress` … `run1-sample133-proc-egress`; the archived receipt shows `nonLoopback = 1` on both surfaces for exactly the 23 samples 111–133 and `0` everywhere else, run 1 = 46, run 2 = 0; the archived measure record's `bindings.receiptSha256`/`witnessSha256` match the archived receipt/witness bytes, its Ed25519 wrapper signature verifies under its own embedded public key, and the witness attestation verifies under the witness's own key (all re-derived here — `evidence-predata-*.txt`). Disclosure at the freeze: `LOG.md` ("the first attempt failed its counter with 46 real `*-egress` findings") and `SCORECARD.md` ("the first live attempt (pre-freeze) was refused by the round's own counter with 46 `*-egress` findings") | **the frozen counter itself** — `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs`, digest `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c`; the refusing run used the pre-hardening bytes `bbdf1234ab0e5e0f7446218830d97a326cf87de171cfdc520f6c4e4e3731b6a8` | Closed before the freeze: the second live run (2026-10-29T20:42:30Z) is clean — exit 0, predicate true, findings `[]`, egress 0, survivors 0 — and its receipt, witness and signed measure record are committed (`c1-measure-r43.json`, sha256 `c67a1096e5cc32b0c935ca133c67d8b485c8fff11e44a288f6e62d6abb97b258`; receipt `1b33d6a6…`, witness `0728d338…`). No predicate was loosened: the frozen sentence still reads "all observed nonLoopback counts are zero" (`evidence-committed-bytes.txt` §3: `claims[0].counterPredicate` is byte-identical to the counter's `PREDICATE`, 1343/1343 chars). |
| **Instrument hardened before the freeze, with remotes recording, disclosed** — the driver and counter were edited after the failed run so that a non-loopback peer is recorded, not just counted; the change was disclosed in the freeze's own `LOG.md`/`SCORECARD.md` | The failed run's receipt sample objects carry **no** `nonLoopbackRemotes` key at all (`{ticks, lines, nonLoopback, ssObs}`), while the committed clean run's samples carry `nonLoopbackRemotes: []` — the field exists only after the edit; the failed run's counter output has no `egressDetail` key, the frozen counter returns one (`.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs:47,80,108,234`); the failed run's own stdout records the driver digest `b70e2c14…` and counter digest `bbdf1234…`, both different from the frozen pins `37182359…` / `6b8c8750…`, while the wrapper digest `23afa29d…` is unchanged — i.e. the driver and counter changed, the wrapper did not | the frozen counter itself (its `egressDetail` channel is what makes the difference visible) **plus** the lane's own disclosure at the freeze (`LOG.md`: "Instrument hardened BEFORE the freeze: driver + counter now record and surface `nonLoopbackRemotes` (disclosed here; no predicate was loosened …)"; `SCORECARD.md`: "the instrument was hardened before the freeze (driver/counter now record `nonLoopbackRemotes`; no predicate loosened)") | Disclosed and digest-pinned: the hardened bytes are the ones frozen in `claims.json.frozenDigests` and re-derived byte-identically from commit `7ca6f018` this round (`evidence-committed-bytes.txt` §4, all six digests match). The r42-style "fixture/counter edit after the fact" hazard is closed by the freeze-time pinning plus the fact that the edit happened **before** any seat scored. |

`[L1: post-wave rows (claim verdicts, seat-level attacks, any r42-style drift found this wave)
belong in this table after WAVE-DONE — this seat records pre-data events only.]`

## Pre-data provenance and limits (read before citing the rows above)

- The run-1 archive is **not committed**: `git ls-tree -r 7ca6f018` over `.ufo/waves/round-43/` and
  `corpus/evidence/round43` lists 19 files and **none** names the failed run
  (`evidence-committed-bytes.txt` §7). The committed evidence for the pre-data event is the
  freeze commit's `LOG.md` / `SCORECARD.md` prose; the run-1 bytes themselves are the wave-dir
  copy recovered by seat `SentEgressAudit` from the scratch archive the freeze's `LOG.md` names
  (`failed-run-1/ archived under scratch`). Anyone re-checking the 46 must read that copy (or a
  re-run of the same counter over the same archive), not a committed artifact.
- The failed run's `nonLoopbackRemotes` value was never recorded (the field did not exist yet), so
  the **peer** behind the 46 findings is not recoverable from the archive: the count, the sample
  window and the surfaces are, the peer address is not. The "run-1 transient" characterisation is
  the lane's, supported by run 2 being clean and by the final sweeps of both runs being 0.
- The `claims[0]` object carries **two** sentence keys: `counterPredicate` (byte-identical to the
  counter's `PREDICATE`, 1343 chars, sha256 `9bc95453…`) and `predicate` (2012 chars, sha256
  `a6187940…` — the same instrument sentence plus a suffix starting `" THE CLAIM: "`: committed
  bytes at the measured revision, battery all-pass, refusals of the r42 receipt and synthetic
  pairs, WAVE-DONE over ≥64 seats, no in-model do-nothing reach). The frozen `sentenceIdentity`
  block binds the **instrument** sentence only, and the declared three-site identity holds. This
  is layering, not a duplicate-row defect, but a reader who picks `claims[i].predicate` generically
  (the natural key for C2) will read a different byte string than the counter's `PREDICATE` and
  report a false divergence. Independently observed by seat `ExecSentence`
  (`w1/ExecSentence.md`, F1) — cross-seat agreement, no frozen byte amended.
- `S150`/`S151`'s `used-by` cell points at `corpus/knowledge/receipt-authenticity-signing-round-43.md`,
  which exists on disk (6,183 B) but is **untracked** at HEAD `ba433c94` (git status `??`); the
  LOG says it "lands at integration". Until it is committed the used-by pointer dangles — the L1
  should confirm at integration.

## Census

`[L1: end-of-round receipt — the freeze's start receipt is committed
(.ufo/waves/round-43/measure/census-start.*: exit 0, "tabi ok", 21 W04 warnings, 149 rows; the
registry is at 151 rows after S150/S151).]`

## Assimilation

`[L1: none planned — the r42 fresh re-adjudication keeps package adoption closed.]`
