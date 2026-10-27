# CritC1a — ATTACK C1-B1 (pins digest binding), tabi round 37 w1

Seat: CritC1a (critic, leaf). Frozen bytes under test: `c1-adjacency-sweep-v5.mjs` at
99437d29de036415a9f2d0524343617a3b19988a (sha256 `9c6289b7…91752c`, verified equal to
`claims.json:frozenDigests.c1`). All fixtures built in a scratch clone
(`/fast/scratch/hyaku/tabi-r37/w1/CritC1a/lane-clone`, toplevel asserted before first
fixture commit, deleted at exit); every run took the counter from the lane path read-only,
`TMPDIR` under the seat scratch, `--repo` the clone, `--fleet` the real fleet (read-only
git ops on siblings only). Evidence: this seat's `evidence/` dir (48 files: 12 evaluation
receipts + display-mode runs + runner script).

Fixture base for all attacks: honest `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
(round-start tip; pins digest at that rev == frozen `81019362…0655`, verified).

## Verdict on the four avenues

**(a) `--list-delta` / `--list-drift` — DISPLAY-ONLY. Cannot influence any predicate
evaluation.** Three independent proofs:
1. *Static*: the list branch in `main()` (counter L606-624) reads pins from lane HEAD
   (`git rev-parse HEAD` → blob; `cat` disk fallback), never from a `--rev` blob, performs
   no digest check, prints, and `process.exit(0)` — it never calls `evaluate()`. No
   round-37 harness/gate/control consumes these modes (grep across the lane: only the
   superseded round-36 `controls.mjs` used `--list-drift`; round-37 `measure.sh` /
   `run-controls.sh` invoke the counter only as `--rev … --json`).
2. *Dynamic divergence*: with CRLF pins committed at HEAD (`f-crlf`), both modes exit 0
   and print the canonical listings (drift 307 lines, delta 0) over pins bytes that the
   predicate path refuses (exit 2) at the same commit. `--rev ed8ccfc…` passed to the list
   mode is accepted but ignored — output identical (307 lines), proving the listing tracks
   HEAD, not the measured REV.
3. *Forged-disk decoupling*: at `f-absent` (pins blob deleted at HEAD) with a CRLF-forged
   pins file dropped on disk, `--list-drift` serves the forged bytes (exit 0, 307 lines)
   while `--rev f-absent --json` on the same worktree refuses exit 2
   (`…absent at 78841293…`). The predicate path re-reads the blob at REV and is fully
   decoupled from what the display path served.
   Classification: display-only. Two consumer-hazard warts (below), zero predicate impact.

**(b) CRLF / trailing-newline normalization — v5 REFUSES (good), v4 ADMITS.** The digest
is `sha256(git show REV:path)` — raw blob bytes, no normalization at any layer (refusal-
reported digests match independent `git show | sha256sum` exactly). Fixtures and results:

| fixture | bytes vs frozen | v5 result | v4 result |
|---|---|---|---|
| `f-crlf` 29180a64 | LF→CRLF | **exit 2** digest `c7d7d468…85b7` | exit 0, predicate **true** |
| `f-trail` 223a1651 | `}` + trailing `\n` | **exit 2** digest `ef7ca6ac…f7c4` | exit 0, predicate **true** |
| `f-sorted` 35f96b05 | sorted keys + `\n` | **exit 2** digest `ef7ca6ac…f7c4` | exit 0, predicate **true** |

v4's parsed `drift.pins` over the CRLF bytes is deep-equal to the honest pins (verified in
the receipt JSON) — semantic equality rides through raw difference on the unbound v4.
Calibration bonus: the frozen J1 control fixture is byte-identical to my `f-trail`/
`f-sorted` (digest `ef7ca6ac…` matches the `c1r37-J1-pins-reorder-v5` receipt's reported
digest) because the pins keys were already alphabetically ordered — the J1 "reorder" is
exactly a trailing-newline attack. My matrix reproduces the frozen control and extends it.

**(c) Multi-key duplicate JSON — classified: v5 immune by ordering; v4 last-wins.**
`f-dup` 02430fe70 inserts `"kake": "0000…0"` before the honest kake entry (honest value
last). v5 **exit 2** (`e2cb3592…142c`): the digest check (L388-389) fires *before*
`JSON.parse` (L390), so any byte-level trick — duplicate keys, key order, whitespace,
BOM, Unicode normalization — dies on bytes before object semantics exist. v4 exit 0,
predicate true, and its parsed pins equal the honest pins: empirical proof that
`JSON.parse` keeps the **last** duplicate. For v5 the parse behavior is display-class
trivia; it is material only for the unbound v4 (a *resolvable* evil head listed last
would be admitted by v4 — that is precisely the hole B1 closes).

**(d) Refusal downgrade to exit 1 — NOT REACHABLE in the predicate path.** All 24 `throw`
sites in v5 construct `Refusal`; every failure mode of the pins block (absent L386,
digest L389, non-JSON L391, non-object L392, non-40-hex L394, unknown sibling L395,
unresolvable head via `resolveCommit`) is a Refusal, and `main()` maps Refusal→exit 2
with `predicate:null` in receipt terms. Empirically all six pins attacks exit 2 with the
`verdict=could-not-evaluate` line; only a genuine evaluated-not-met yields exit 1 (full
JSON receipt, `predicate:false` — cf. frozen `c1r37-J2-decoy-note-v4.json` exit 1 vs
`c1r37-J1-pins-reorder-v5.json` exit 2/predicate null). One wart: the list modes' bare
`JSON.parse` (L617) is uncaught — malformed pins at HEAD or on disk crash with **exit 1**
and a raw Node `SyntaxError` stack (`evidence/list-delta-baddisk.err`), not the documented
exit 2. Display-mode only, unreachable from `measure.sh` (which parses stdout JSON; a
crash emits none), so it cannot be scored as met/not-met. The remaining exit-1
theoretical is an fs error from `mkdtempSync`/`safeWrite` (environmental, pre-pins,
equally true of v4).

## Honest-floor and no-harm spot checks

- v5 at honest `ed8ccfc…`: exit 0, `predicate:true`, `deltaPinsSha256` = frozen,
  drift 307/307 covered, 0 findings all legs — reproduces frozen `c1r37-J3-honest-v5`.
- v4 at honest `ed8ccfc…`: exit 0, predicate true (old instrument still operable on the
  honest state — no-harm direction holds).
- Build tool `c1-drift-audit-build-v2.mjs` reads pins unbound (HEAD blob → disk fallback →
  `JSON.parse`, L66-71) but only *generates* the audit ledger; the counter is the
  authority that digest-binds at measure time. Context note, not a B1 defect.

## Smallest safe corrections (hardening notes, non-blocking)

1. Wrap the list-mode `JSON.parse` in the same try/catch→Refusal used at L390 (restores
   the documented exit-2 contract in display modes).
2. Either honor `--rev` in list modes or reject it outright — silently accepting and
   ignoring it lets a listing diverge from any measured REV.
3. Drop or lstat-guard the disk fallback (`cat` of the working-tree file, no digest, no
   symlink check) — it can serve forged bytes to listing consumers.

None of these touches the predicate path; none is required for the C1 kill rule.

## Tooling record

No tools installed or upgraded — node (preexisting), python3 (preexisting), git
(preexisting) sufficed.

## VERDICT ok — C1-B1 binding holds: v5 refuses every byte-variant pins file (CRLF, trailing newline, reorder, duplicate keys, invalid JSON, unknown sibling, absent) with exit 2 and an exact digest mismatch, v4 admits the same fixtures at exit 0, list/delta/drift modes are provably display-only, and no refusal downgrades to exit 1 in the predicate path; three display-mode warts recorded as non-blocking hardening notes.
