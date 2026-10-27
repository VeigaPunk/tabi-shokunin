# RevC2Code — C2 v3 line review (v2→v3, hunk by hunk)

Seat: RevC2Code, tabi round 37 w1. Scope: full diff of `.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs` → `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` (190-line unified diff, all hunks covered; SCHEMA/COUNTER_PATH/console-label V2→V3 renames consistent; no hunks outside those reviewed below).

Reviewed artifact identity: sha256(worktree v3) = `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019` = sha256(blob at freeze commit 99437d2) = `claims.frozenDigests.c2`. Diff base v2 worktree = v2 blob at 99437d2 (`15910c59…`). What I reviewed is byte-identical to the frozen artifact.

## Hunk 1 — B1 replace-ref refusal + GIT_NO_REPLACE_OBJECTS — **approved**

- Env literal (v3:121): `GIT_NO_REPLACE_OBJECTS: '1'` added to the single `spawnSync('git')` site; env is a fixed literal (PATH + config quarantine + LC_ALL), so every git read inherits it. Grep confirms no other git spawn in the file (v3:221 spawns the pinned firefox/geckodriver `--version` only). Bonus honesty: it also makes `resolveCommit`'s `^{commit}` peel read the true object.
- `replaceRefs()` (v3:123-127): `for-each-ref --format=%(refname) refs/replace/`; `status !== 0` throws `Refusal` — enumeration failure is loud, not silent (covers spawn-failure `status: null` too). It runs after `resolveCommit(REV)` (v3:525), which itself would Refusal first if git were broken, so the `r.stderr.toString()` on the error path is only reachable with a working git.
- ORDER verified: v3:525 `resolveCommit(repo, rev)` → v3:526-528 `replaceRefs` + `throw new Refusal('refs/replace present…')` when non-empty → v3:529 BASELINE resolve → verifyBinaries → v3:531 `loadGate(repo, REV)` → `loadGate`'s `blob(repo, rev, GATE_PATH)` (v3:519) is the **first** `blob()` read; every later blob read (entry, SOURCES, LESSONS, RECEIPT, transcripts, driver) follows it. No repo content is read from the worktree (the gate is imported from blob bytes via `safeWrite`), so a grafted worktree cannot sneak in either. Defense in depth: even if enumeration were evaded, all reads are replace-free.
- Corroboration: frozen control `c2r37-J1-replace-ref-v3` exit 2 (`could-not-evaluate` path); v2 same fixture exit 0 predicate true.

## Hunk 2 — B2 teardown survivor check — **approved**

- `scratchSurvivors()` (v3:433-443): readdir `/proc`, numeric-pid filter, cmdline read (`\0`→space, per-pid catch → skip), substring match on this session's `scratch` (mkdtemp-unique). Both geckodriver (`--profile-root <scratch>/profiles`) and firefox (`-profile` under it) carry the path in argv; the counter process itself does not.
- `rec` scope: `const rec = {…}` at v3:252, **before** the `try` (v3:256) — in scope on every finally path, as are `scratch` (222), `gd` (232), `fx` (225), `deadline`/`sampler`/`ws`/`sessionId` (241-255). No TDZ path for `rec.survivors = …`.
- Finally (v3:336-345): SIGTERM → fixture close → sleep(500) → scan → SIGKILL each survivor → if any survived: sleep(500) + rescan, concat → `rec.survivors = survivors.length` → `rmSync`. The pre-kill list is retained in the concat, so a survivor is counted even when the SIGKILL succeeds — the kill-rule "survivors are uncounted" is impossible; count ≥ lingering survivors; the post-grace rescan only adds.
- Flow: `rec.survivors` reaches `out.survivors` (v3:681) via the returned rec; on the throw path rec is discarded but `liveError` → binding `live session failed` (v3:635) → predicate false regardless.
- Non-blocking observations: (a) a pid still lingering after SIGKILL (e.g. D-state) is counted twice by the concat — predicate tests `=== 0` and is already false; cosmetic inflation in an already-failing path. (b) The B2 lines sit after `await fx.close();` in the finally — a throw from `fx.close()` would skip the survivor scan and rmSync; same exposure shape as v2, narrow (server-already-closed). (c) A SIGTERM-slow firefox (>500 ms) is counted and SIGKILLed, failing the honest predicate — that is the declared strict semantics ("no session process may survive the counter's own run"); frozen `c2r37-J3-honest-v3` shows `survivors: 0` empirically.

## Hunk 3 — B3 observed-decoration binding — **approved**

- `capsOf(rec)` used (v3:410) — not `rec.caps` (rec has no caps field; `capsOf` reads `newSession.value.capabilities`).
- `contextIds` wrapped in `new Set(...)` for uniqueness (v3:424, both occurrences).
- The five derivable checks map 1:1 onto the header's declared set ("session caps/websocket segment, context count, viewport, first-screenshot sha"):
  1. session caps — `browserVersion` vs `caps.browserVersion`, `geckodriverVersion` vs `caps['moz:geckodriverVersion']` (v3:415-416);
  2. session identity / websocket segment — `sessionId` vs transcript sid with the declared `'uuid'` redaction placeholder accepted, `webSocketUrl` segment vs sid (v3:417-421);
  3. context count — `getTree.contexts` vs unique transcript context ids (v3:424);
  4. viewport — vs frozen `gate.VIEWPORT` (v3:426);
  5. first-screenshot sha — vs `firstShot(rec)` derived from the transcript (v3:428).
  Nothing outside the declared set is enforced; every declared element is checked.
- Undefined steps skipped, not failed: null/undefined decoration → null; absent step keys skip; per-field `!== undefined` / `typeof` guards; non-array decoration → finding. The `if (s.why) return null;` early return is sound: `sessionOf(...).why` is a receipt finding for every run at v3:607-608 (that loop runs after the observed loop, before binding/rows), so a broken session shape is caught regardless of the skip.
- Wiring: v3:599 calls `observedFinding(runs[runs.length-1].rec, run.observed, gate, run.name)` immediately after the push inside the per-run loop; `if (of) { rf = of; break; }` breaks on first finding; all downstream checks are `!rf`-guarded; rf → `out.receiptFinding` → predicate false → exit 1. Matches frozen `c2r37-J2-observed-tamper-v3` (exit 1, predicate false); v2 same fixture exit 0.
- Residual (display-only by design, not a defect): a decoration `webSocketUrl` that does not parse as `WS_SESSION` (`m === null`) is silently skipped, and duplicate step entries bind only the first occurrence — both consistent with "steps outside that derivable set stay declared display-only".

## Hunk 4 — predicate adds survivors — **approved**

- v3:681 `out.survivors = liveRec && typeof liveRec.survivors === 'number' ? liveRec.survivors : null;` v3:683 adds `&& out.survivors === 0`. Null-when-no-live is covered by binding: `liveRec` null with runs ≥ 1 → binding `live session failed` (v3:635); runs < 2 → rf `fewer than two runs`; either way predicate is false independently of `survivors`, and no path reaches `gate.PREDICATES[id](liveRec, …)` with a null rec.
- Sentence binding: `out.predicateSentence = PREDICATE_SENTENCE` (v3:682). Byte-identity verified programmatically across all three sites — claims.json `C2.predicate`, the v3 header line, and `PREDICATE_SENTENCE` (which is what the receipt carries): identical, including `AND live.survivors == 0`.

## State notes (not findings)

- `claims.json` `before.receipts` paths resolve under `.ufo/waves/round-37/baseline/` (wave-relative); all five C2 receipts present there and their outcomes corroborate the code paths above (J1 v2 admit / J1 v3 exit 2; J2 v2 admit / J2 v3 exit 1; J3 v3 exit 0, admitted 16, survivors 0, egress 0).
- `claims.frozenAt` = ed8ccfc (round-36 baseline REV) while the round's claims+counters freeze commit is 99437d2 — consistent with `measurementRule` (counters from the FREEZE commit); the reviewed v3 blob at 99437d2 equals the worktree.

## Verification gaps

- Code-level review only; I did not re-run the live leg (pinned Firefox 158.0.1 + geckodriver 0.37.1) — the frozen controls (J1/J2/J3) and the executor seats own runtime reproduction; their outcomes match my reading of the code.
- No LSP server was consulted for this review (single-file diff review; all callers of the changed functions are within the one file, checked by grep across it).

VERDICT ok
