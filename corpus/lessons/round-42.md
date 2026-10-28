# Round 42 — admission attempts refused; routed-defect ledger closed; quarantine re-adjudicated

## Gate

### Candidates considered

- **C1** — coverage capability: admission of the frozen r41 Playwright Firefox loopback
  TCP chain on committed bytes with a settled attack wave
  (`.ufo/waves/round-42/claims.json`, freeze `9b6de3a19de11abdb80e82a1310abc64a40215bb`).
- **C2** — calibration: round-41 routed-defect ledger closure (verifier D1–D4) measured
  by the frozen checker `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`.
- 38-row staged quarantine slice (fresh re-adjudication, r41 verifier defect D4).
- Registry moves: S148 (supersedes S146), S149 (git-ls-tree), S146 flip to rejected.

### C1 — REJECTED (kill rule fired: do-nothing reach demonstrated)

The live counting command ran clean on 2026-10-28 (`measure/c1-measure.json`: exit 0,
driver 0, counter 0, predicate true, findings empty; two real Firefox runs, sample
spans 16,356 ms / 17,790 ms; receipt sha256 `39844552…317b7e`, witness `163f4eba…578fb…`
`163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339`), and every
pre-data control held (`controls/c1-battery-r42.json` all-pass; r39/r40/r41 replay
refusals exit 1). The claim is still refused because four seats demonstrated the
frozen counter accepts forged bytes when invoked over committed files:

- `w1/CritC1Reach`: counter exit 0, predicate true with ZERO browser runs, three ways —
  round-41 receipt bytes relabeled, round-42 bytes relabeled, and a hand-written
  receipt naming pid 1 as firefox; the r41-replay control itself is defeated by nonce
  relabeling.
- `w1/CritC1Witness`: a 4-scalar nonce patch of committed r41 bytes and a 6.7 KB fully
  synthetic receipt+witness both reach predicate true; the witness driver-observation
  clause is vacuous and `startTicks`/`rootPid` are never checked.
- `w1/RevWitnessProbe`: P2f/P2g/P2g′ — receipt copy + nonce rewrite + hand-built
  10-sample witness + 98-byte measure doc → exit 0, findings []; the in-process nonce
  binds only the live wrapper invocation, not scored-over-committed-bytes scoring.
- `w1/MutC1Counter`: the `--pins` argument is unbound (any claims file vacuates the
  digest pins) and a substituted counter copy cannot be detected by its own pin.

Disposition: **not admitted; no capability row; coverage holds 9 → 9.** The frozen
predicate, kill rule and counting command were never amended after seat data. The
live run remains valid evidence of one bounded host/build run, not of the claim.

### C2 — REJECTED as worded (instrument does not establish the frozen sentence)

The four routed repairs ARE landed and seat-verified: D1 receipt+witness committed at
`9b6de3a` with sha256s equal to the committed r41 measure record (`RevReceiptBytes`,
`ExecNoHarm`); D2 S148 supersedes S146 with a verbatim quote, byte-located at 243279
of the staged copy (`ExecQuoteVerify`); D3 baseline control populated with command +
0, re-derived (`ExecBaselineCount`); D4 the 38-row re-adjudication TSV built from
settled seat evidence (this lesson's spot-check below). The checker held all seven
mutation attacks (every dropped clause proved load-bearing — `MutC2Size/Status/
IdSet/Enum/Sentence/Digest/TinyStub` all "killed") and the adversarial CLI battery
(`SentC2Checker`: no writes, no shell, typed refusals). `ExecSelftestSynthetic`:
32/34 finding ids reproduced live, boundary-exact, positive control F5 green.

Refused anyway, on the frozen rules:

- `w1/CritPredicateSentence` (P-A) and `w1/RevC2Freeze`: the frozen sentence says
  "every evidence path a committed **blob** of at least 200 bytes", but the checker's
  `git cat-file -s` accepts tree objects — a 720-byte directory greens r4 (demonstrated
  in a scratch fixture). The counter therefore does not establish the sentence as
  worded (the r39 C1 counter-proxy class). No post-data amendment; hardening
  (`cat-file -t blob`) is routed to round 43.
- `w1/CritC2Ledger` (V0): a self-consistent hostile committer greens all four rules
  with zero real work (self-authored measure record; a 1-word quote already present in
  the staged copy passes the 1..25 window; a 13-byte stub satisfies r3's two
  substrings; one shared blob satisfies r4 evidence). The kill rule's
  "accepted fabricated evidence" limb is demonstrated at instrument-class level; the
  seat's own closure proposal (pinned measure blob id `8ff64d69…` + a verdict-probe
  scoring 0/38 on V0) is recorded as the round-43 repair path.
- `w1/CritAdmissionPolicy`: C1's kill rule already fired; C2 lands `unprovable`, not
  improved.

Disposition: **not met as worded; calibration holds 9 → 9.** The checker at the final
revision returns exit 0 (all four findings cleared in real bytes) — recorded as
instrument pass, not claim admission.

### Quarantine re-adjudication (D4) — 38/38 fresh verdicts, adoption stays closed

Built by 19 scout seats (2 rows each) from the fixed extraction
(`quarantine/slice-ids.txt`, 38 clean ids; `MutSliceExtraction` proved the old r41
extraction yields `S171`` ` and the gsub fix reproduces the frozen set byte-identically;
`ScoutRegisterDrift` independently re-derived the same 38 ids, sha256
`37351627…12cf`). Verdict TSV `quarantine/re-adjudication.tsv`:
**misbound 25, absent 6, partial 4, present 2, unreachable 1.** Evidence per row in
`w1/QuarR42*/evidence-S*.txt`. Every seat fetched its sources live; none wrote inside
shokuknow (the r39 incident class did not recur). Fresh data confirms the staged
register slice is predominantly misbound/absent — **no package row is adopted;
assimilation stays none.** S171 remains unreachable (register URL 404), consistent
with r22/r39/r40 spot-checks.

### Registry moves (old → new, this round)

- S146: status `mined` → `rejected`; used-by
  `corpus/knowledge/environment-injection-measurement-integrity-round-41.md` →
  `corpus/lessons/round-42.md`; teaches rewritten to the REJECTED form
  (`REJECTED: quote cell was a spliced non-verbatim paraphrase (r41 verifier defect
  D2), superseded by S148; flip: S148 carries the verbatim quote and a substring
  check against the committed staged copy`) — the flip vocabulary the lane's own
  `check-sources.mjs` gate requires (`rejected_without_flip` finding observed and
  cleared).
- S148 (new, A, mined): `supersedes S146 — A space-separated list of command-line
  options.` — verbatim, 6 whitespace words, located at byte 243279 of
  `.ufo/waves/round-41/sources/node-cli-v24.21.0.html` (same URL as S146; opened
  2026-10-28).
- S149 (new, A, mined): git-ls-tree manual, https://git-scm.com/docs/git-ls-tree,
  HTTP 200, 38,955 B, sha256 `2c298383476164238c6e25ba804412a335c405ab9540650bb603778e2f4f8b64`,
  quote `Lists the contents of a given tree object, like what "/bin/ls -a" does`
  (13 words, NAME/DESCRIPTION); opened 2026-10-28 by the L1; cited by
  `corpus/knowledge/committed-bytes-verification-round-42.md` (new admitted note,
  coverage row appended) and by the C2 checker's committed-bytes instrument.
- No other row changed. Census: 149 rows, A133/B7/C9, mined 124 / queued 15 /
  rejected 10 (`ExecCensus` expected-vs-observed exact).

### Spot-check (discernment)

`w1/RevQuarCross` independently re-opened one source per four sampled seats
(QuarR4201/4208/4214/4219): **7 of 8 verdict letters reproduced**; the single
disagreement (S135: seat `absent` vs cross `misbound`) is a classification-standard
divergence, not a fabrication — captured as QUALITY criterion 105. All four seats had
fetched live (no assertion-without-fetch). This is lane-internal sampling; the outside
non-author admit/reject spot-check remains the closure's duty and is pending as of
this lesson.

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| counter authenticity (vacuous) | `w1/CritC1Reach` (3 zero-browser reaches), `w1/CritC1Witness`, `w1/RevWitnessProbe`, `w1/MutC1Counter` — counter v4 greens nonce-relabeled and synthetic receipts when scoring committed bytes | QUALITY criteria 25/27 caught the wrapper layer (r40 F4) but not the scoring layer; none required | Routed to r43: receipt authenticity (wrapper signs with a per-invocation key, public half pinned in claims; counter refuses unpinned `--pins`). No post-data amendment. QUALITY criterion 104 added. |
| counter drift (reference-drift) | frozen C2 sentence says "committed blob"; checker `git cat-file -s` accepts trees (`w1/CritPredicateSentence` P-A, `w1/RevC2Freeze`) | the three-site sentence-identity audit (r37 discipline) — caught in-round this time | Routed to r43: `cat-file -t` blob check before the size floor. |
| number-drift | my LOG pre-dispatch entry wrote "A131/B7/C9; mined 122"; observed truth is A133/B7/C9, mined 124 (I miscounted r41's two rows into the baseline) | `w1/ExecCensus` expected-vs-observed | Corrected here old→new; census receipt is authoritative. |
| registry flip schema | flipping S146 without rewriting teaches tripped `check-sources.mjs` (`rejected_without_flip`) | the lane gate itself (same-run detection) | Teaches rewritten to the REJECTED form on flip, old→new logged above; future flips follow this procedure. |
| r41 handoff root cause (landing) | `w1/RevengerDispatch`: r41's ready pointed at `w1-spec.json` (no `taskCall`) after the validator payload was discarded through `| tail` compile runs; this round's dispatch JSON carries `taskCall` (verified by `w1/ExecWaveAudit`); the inline dispatcher stalled ~18 min and Main consumed the ready manually (kama r61 precedent, >2h) | none — the r41 verifier's D3 named the symptom, not the cause | Procedure: write the validator's FULL stdout to the dispatch file; never pipe through `tail`; verify `taskCall.tasks` length before writing `.ready`. |
| standing-gate conflict | `scripts/check-c2-knowledge-round41.mjs` now exits 1 (`registry-status:S146:rejected`, `registry-usedby:S146`) — its frozen pins describe the pre-D2 state the r41 closure explicitly routed as defect D2 | none; the frozen-claim vs routed-defect tension was filed as an r27 L0 question, still unanswered | Recorded, not amended: the r41 gate is that round's instrument; the non-author closure's routed fix supersedes. Left for the operator's ruling alongside the r27 question. |

## Census

- Start (2026-10-28, pre-edit): exit 0, `tabi ok`, 20 W04 warnings —
  `.ufo/waves/round-42/measure/census-start.{out,err,exit}`.
- End (this round, post-registry edits): command
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
  → exit 0, `tabi ok`, 21 W04 warnings (S148 shares S146's URL — expected); receipt
  `.ufo/waves/round-42/measure/census-end.*`.
- Row count: 147 (r41 end) → 149; tiers A131→A133; status mined 123→124, rejected
  9→10 (S146), queued 15. Commands and outputs in `w1/ExecCensus/report.md`.

## Assimilation

None. The wave-4 quarantine-first adjudication is complete (38/38 fresh verdicts
above); adoption stays closed on the fresh misbound/absent evidence. No
`merge/tabi/` row or knowledge entry was appended from the package.
`considerthese/` is absent (one report line per contract).
