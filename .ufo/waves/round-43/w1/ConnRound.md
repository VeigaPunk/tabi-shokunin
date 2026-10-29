# ConnRound — wave-internal pattern finding (tabi r43 w1)

Seat: `ConnRound` · role: connector (leaf, no subagents) · axis: adjacency
Date: 2026-10-29 · Lane HEAD at analysis: `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`
Coverage at analysis time: 58/64 sibling reports landed (53 top-level `<Seat>.md`, 30 `<Seat>/report.md`,
25 both). Not yet landed: ExecScratchGuard, MutC1Challenge, MutC1Witness, MutDriverEgress, ScribeEntryAuth
(MutC1Challenge/MutC1Witness are mutation testers expected to extend pattern 1).

## Own verification base (independent of siblings)

- Frozen digests: all six `frozenDigests` re-derive byte-exact at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
  (`evidence/frozen-digests.txt`).
- C2 checker, own runs: at HEAD `exit 0, predicate true, findingCount 0`; at baseline `ab592825cd195599822ca227f7768914df208201`
  `exit 1` with exactly `r5-claims-absent` + `r6-probe-absent` (matches committed red control)
  (`evidence/c2-head-stable.json`, `evidence/c2-baseline-stable.json`).
- C1 committed chain, own verifier (22 checks, all pass): nonce `d2c85f6e…` propagated to receipt + both runs +
  witness; receipt/witness sha256 bind to the measure record; wrapper Ed25519 signature verifies over the canonical
  unsigned form; witness attestation verifies under its own key and is bound to the measure witness pubkey; all
  frozen digests re-derive; `refused=false`, `egressNonLoopback=0`, two Firefox 157.0 runs
  (`evidence/c1-chain-verify.json`).
- Tooling: no installs/upgrades. `node v24.21.0` (fnm), `git 2.56.0`, python3 — all preinstalled. RULES.md read;
  PACMAN guard respected; no git/jj mutation; scratch `/fast/scratch/hyaku/tabi-r43/ConnRound` deleted before yield.

## Pattern 1 — C1 do-nothing reach: seven-seat convergence, zero disputes (kill rule fires)

Seven independent seats demonstrate an in-model do-nothing reach against the **frozen** counter bytes
(each pins counter sha256 `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` = the frozen
digest; CritC1ReachSynth's `attack-summary.json` records `frozenCounterSha256` likewise):

- `CritC1ReachDirect` — exact-argv direct invocation of the frozen counter exits 0; no wrapper/driver/browser.
- `CritC1ReachSynth` — synthetic receipt+witness+self-signed measure record; 3 modes, 2× `counterExit 0,
  predicate true, findings []`, `noBrowserOrWrapperInvocation: true`.
- `CritC1Witness` — self-issued fake receipt/witness/measure record accepted (exit 0, predicate true).
- `CritC1ReachReplay` — self-issued synthetic artifacts answer the fresh challenge; reaches exit 0.
- `CritResidualModel` — copied (unmodified) counter accepts attacker-self-signed synthetic artifacts.
- `MutC1Sig` — §6 routed finding: frozen counter admits a self-authored self-signed pair with exit 0/predicate
  true and zero browser runs once the forger answers the fd3/fd4 challenge with their own key.
- `MutC1Nonce` — assigned mutation load-bearing; **independently confirms the sibling-filed do-nothing reach on
  the unmodified counter** (the nonce triple-match clause does not defend it).

Attack shape (consistent across all seven): caller generates a fresh Ed25519 keypair, authors a fabricated
receipt/witness/measure record, signs the measure record with their own wrapper key, and answers the counter's
fresh in-invocation fd3 challenge over fd4 with the matching private key. The counter verifies every signature
correctly — the chain authenticates *self-consistency*, not *provenance*. No seat disputes the in-model
classification; the declared residual model explicitly does not cover it (no prior-honest-run key harvesting;
process-memory/kernel out of scope; no committed-byte tampering). `CritNonceAudit` (ok: no nonce freshness break)
and `ExecC1Battery` (ok: battery 7/7 as committed) are complementary, not contradictory.
`SimplifierC1` (finding) supplies the structural explanation: the predicate's "no private half persisted" clause
has no enforcing code, 6 dead signing-layer paths, and pin checks silently skip 3 of 6 frozen pins.

**Effect:** per the frozen kill rule ("any settled seat demonstrating an IN-MODEL do-nothing reach … refuses
admission"), C1 is not admittable this round; the capability routes to round 44. This is the wave's dominant
finding class by seat count and is the clearest possible illustration of why round 42's kill-rule refusals were
re-run at r43.

## Pattern 2 — C2: passes-as-worded, with five routed rule-coverage findings (no true contradiction)

- Current-revision pass independently reproduced by `ExecC2FreezeRev`, `ExecC2TreeFixture`, `ExecC2V0Probe`,
  `ExecPinProbe` (992-commit blob-id sweep), `MutC2Bind`, `MutC2Blob`, `MutC2Pin` (all three mutations
  load-bearing), `ExecTsvBlobs` (38/38 evidence blobs), `ExecClaimsSchema` (8/8 bindings), `ExecSentence`,
  `ExecDigestPins` — plus this seat's own runs above.
- Coverage findings, all routed-not-amended: `CritC2LedgerR43` (executed: V0-style fake R2/R3/R4 greens when the
  authentic r41 blobs are copied — but byte-identical copies are r1-covered by the frozen wording, so this is a
  provenance-scope gap, not a false green of the frozen sentence); `CritFreezeAudit` (r5 completeness not
  enforced; reasoned); `CritFreezeBindings` (executed false-greens: 5-binding set accepted; 19-char quote
  fragment accepted as "line"; plus a fail-closed crash robustness note); `CritPredC2` (r5 self-authorization
  [INFERENCE]; r6 accepts any digest-shaped generator id; r4 has no 38-row guard; r5 substring vs line; r3 token
  weakness); `RevC2Checker` (r4 dropped the pinned 38-row check; r6 format-only digest).
- Resolution: the "ok" verdicts assert the frozen predicate at the measured revision (true — reproduced); the
  "finding" verdicts assert the rules are weaker than the sentence for future or synthetic revisions (also
  evidenced). Complementary lenses on the same bytes; the freeze's r5 freeze-binds-controls claim holds for this
  freeze.

## Pattern 3 — the transcription-typo family (three instances, one false attribution, one rebuttal)

- `RevEvidenceR42.md` §Observations claims "seat spec + w1-dispatch carry `7ca6f018280b08dcc6c519e11…`" (a
  nonexistent commit). **Direct contradiction with `ExecWaveAudit` O1**, which rebuts: the dispatch bytes are
  clean; the typo is seat-local. This seat independently checked: `w1-dispatch.json` and `w1-spec.json` contain
  ONLY the correct `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (21× each, 0 wrong). The wrong form exists only in
  `RevEvidenceR42.md` (+ its evidence note) and `RevS151.md` line 26. **ExecWaveAudit's rebuttal is correct.**
- `RevS151.md`: verdict ok, but its body cites the freeze commit with the nonexistent hash (`…c519e11…`) while its
  byte-identity checks against the real committed bytes are genuine — a VERDICT/body tension (ok stands; the
  commit citation points at a nonexistent object).
- This seat's own process error (evidence/typo-investigation.md): a transposed nibble in HEAD's full hex
  (`…eba0be…` for `…eba1be…`) manufactured a phantom "object flicker / jj-export instability" — ls-visible but
  stat-ENOENT objects, strace ENOENT, a 40-attempt retry loop, and a scratch clone — all resolved by feeding the
  OID programmatically from `git rev-parse HEAD`. The repo's jj-export reflog is benign background.
- Lesson for the wave: re-derive every commit hash programmatically; never hand-copy 40-hex strings into
  acceptance-critical commands. Same class the round-42 D1 receipt-bytes defect addressed.

## Pattern 4 — duplicated cross-seat findings (mutually reinforcing, no contradictions)

- S150/S151 used-by untracked → freeze E11 red: `ExecNoHarm` (finding), `ExecCensus` (finding: census receipt
  attests 149-row registry vs 151 observed; frozen tree validates exit 1 with 2× E11), `ScoutRegister` (ok
  framing: used-by targets are planned-untracked paths), `ScribeLessonSkel` (finding: used-by untracked; S150
  locator names a section the quote is not in; recovered run-1 archive uncommitted), `ScribeErrata42` (finding:
  r43 errata note untracked at freeze+HEAD, D1 class; controls' fixture revisions not objects).
- Routed single findings: `SentSecrets` (F1 transient private-key PEMs un-ignored then remediated, no `*.pem`
  guard; F2 driver creates a scratch profile dir it never binds — browser profile escapes `--scratch` into
  ambient TMPDIR; 264 `/tmp` paths already inside the committed r43 receipt); `SentEgressAudit` (r43 measurement
  byte/signature-sound, attempt-1's 46-finding refusal = host-environment transient; producer delta F-1 and
  archived receipt absent address data F-2 routed); `ExecReplayAll` (4/4 historic rounds refuse v5, exits
  2/1/1/1; but `c1-replay-r42-refused.json` is not re-derivable — 2 stale digest-mismatch findings; v5 exits 2 by
  crashing on an unreadable `--measure` file); `RevC1Wrapper` (refuse() exit degenerate at line 185;
  output-exists guard misses the derived witness path); `CritBatteryVectors` (NODE_COMPILE_CACHE accepted by
  --battery-probe — vector list gap, not a battery failure; `ExecC1Battery` ok 7/7 byte-identical — consistent);
  `ScribeScorecardDraft` (SCORECARD.md:2309 declares `--scratch …/L1-measure/run2` vs frozen claims.json `run` —
  divergence routed to L1); `ExecSelfassess` (in-lane m3-unlanded-paths mismatch = the wave's own untracked
  output; stale nudge claim could-not-evaluate F1); `ExecWaveAudit` F1 (two seat prompts name colon-instead-of-slash
  paths — RevEvidenceR42, ExecTsvBlobs; both still delivered) + F2 (two prompts point at a full hash the cited r42
  evidence contains only abbreviated; both seats resolved it).
- Sibling-repo cluster: `ConnSiblingProc` (registry fails rule 32 for kama/souji overlaps; r42 two-row split fix
  re-verifies clean at ba433c94 — should land) and `ScoutSibling` (kama r64 routes duties onto tabi's files) —
  adjacent, non-contradictory.

## Pattern 5 — wave hygiene

- Reports landed in two locations: 53 top-level `<Seat>.md` (per each seat's Report trailer) and 30
  `<Seat>/report.md`; 25 seats wrote both, 5 dir-only, 28 top-only (counts at analysis time). No seat published
  two contradictory reports (spot-checked; `SimplifierC1`'s dir report is a pointer to its top-level report).
- Cross-citations observed: MutC1Nonce → "sibling-filed do-nothing reach"; ExecWaveAudit O1 → RevEvidenceR42;
  ScribeScorecardDraft → claims.json vs SCORECARD.md; ConnSiblingProc/ScoutSibling → kama/souji; SentEgressAudit →
  its failed-run-1. No circular-citation loops detected.
- 6 seats unlanded at analysis (incl. this one); MutC1Challenge and MutC1Witness are expected to extend pattern 1.

## Limitations

- I reviewed the seven do-nothing-reach reports and their pinned counter digests but did not re-execute the reach
  myself (sibling evidence is convergent and pins the frozen counter sha256; this seat's remit is adjacency).
- Sibling reports may still be updating; patterns reflect the tree at analysis time (≈18:20).
- C1 chain verification covers the committed receipt/witness/measure-record bytes; the live counting command
  (two browser launches) was not re-run by this seat.

VERDICT finding seven-seat convergent in-model do-nothing reach on the frozen C1 counter (pinned 6b8c8750…) fires C1's frozen kill rule — no admission this round; C2 passes as worded with five routed rule-coverage findings; one cross-seat contradiction (RevEvidenceR42 dispatch-typo claim) resolved in ExecWaveAudit's favor by independent grep
