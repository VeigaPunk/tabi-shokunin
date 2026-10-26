# RevControls — round 35 w1 — frozen control receipts: reproduced, two defects found

## Verdict

The 13 frozen controls reproduce exactly. In a scratch clone of the lane at the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83` (`controls.mjs` sha256 `32c0f6bc17060d9d71550961c5783b5293a08610760355fc81db22da7533d8b1` = `frozenDigests`), `TMPDIR=$S/ctl node .ufo/waves/round-35/baseline/controls.mjs` exited 0 in 23.1 s with empty stderr, and the produced `controls-summary.json` is **byte-identical** to the frozen baseline summary — exit, predicate, every count and every refusal clause for all 13 controls. `c1-candidates.tsv` is byte-identical (383 lines). All 8 C1 receipt JSONs are byte-identical (J1) or equivalent-modulo-`rev` (J2–J8, fresh control-commit hashes); the C2 receipts are equivalent modulo `rev`, the live-session ports/ids, and c2-J3's by-design `randomUUID` transcript rewrites; 10 of 11 mutation-commit **tree hashes match the frozen provenance exactly** (c2-J3 differs only because that control rewrites transcript ids with `randomUUID`); and the counter's live Firefox first-screenshot sha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` equals both the frozen control run's and the frozen instrument check's — three independent Firefox sessions, one screenshot. Two defects found, neither in the reproduction: **(1) [medium] claims.json's C2 predicate states `admitted >= 16` while the frozen counter enforces `TARGET = 14`** — the arbiter is weaker than the claimed predicate; **(2) [low] c1-J5 does not cleanly isolate its clause** — one of its three rows is refused earlier by `n3-third-lane-record`, so only 2 of 3 rows exercise `n4-split-quote-not-browser-ground`. No control depends on wall-clock or network; the C1 controls do inherit a live-state dependence through the gate's reachability guard (sibling/fleet `refs/heads/master` tips), disclosed in the gate header, and `controls.mjs` reads six lane working-tree files rather than git objects.

## Reproduction — commands and exit codes

Scratch: `S=/fast/scratch/hyaku/tabi-r35/RevControls` (HYAKU_SCRATCH prefix honored; `mkdir -p $S/ctl $S/out`).

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83   # freeze
sha256sum $S/clone/.ufo/waves/round-35/baseline/controls.mjs
# -> 32c0f6bc17060d9d71550961c5783b5293a08610760355fc81db22da7533d8b1  (matches frozenDigests)
node --version  # v24.21.0
```

- **Run 1 — exit 1 (my setup defect).** I checked the lane clone out at the *baseline* `2d2c8a77…`; `controls.mjs` does not exist there — it is added by the freeze commit (`git diff --stat 2d2c8a77..a4bfef0f` = 52 files, 2106 insertions, **0 deletions**; `scripts/` and `corpus/` untouched, so freeze-state corpus bytes = baseline bytes). Error: `MODULE_NOT_FOUND …/baseline/controls.mjs`.
- **Run 2 — exit 0 but receipts mismatched (my setup defect, instructive).** With the lane clone at the freeze but the fleet mirror a *plain directory*, all 8 C1 receipts came back `adjacency: "failed"` (16 rows, 12 verified, 4 findings). Direct gate run:
  `TMPDIR=$S/ctl node $S/fleet/tabi-shokunin/scripts/check-adjacency.mjs --at 2d2c8a77… --repo $S/fleet/tabi-shokunin --fleet $S/fleet --json` → `verdict failed`, rows 5/7/8/11 `ruling_unresolved — ruling repo …/RevControls/fleet is absent or not a git toplevel`. Cause: the gate resolves the `fleet` ruling token to the fleet directory **itself** and requires it to be a git toplevel (`scripts/check-adjacency.mjs:851-854`) — the real fleet root `/home/vgpnk/Projects/shokunin` is a git repo; my mirror was not.
- **Run 3 — exit 0, full match.** Rebuilt `$S/fleet` as `git clone --shared --no-checkout` of the real fleet repo, with the lane clone (checkout at the freeze) and all 20 sibling clones (`--shared --no-checkout`) nested inside, then:
  `cd $S && TMPDIR=$S/ctl node $S/fleet/tabi-shokunin/.ufo/waves/round-35/baseline/controls.mjs` → **EXIT=0**, 23.1 s, stderr empty.

Note on invocation shape: the frozen run must have executed the script from the lane checkout itself (that is the only way `LANE`/`FLEET` resolve to the real lane/fleet, `controls.mjs:15-16`, and the only way the frozen receipts landed beside the script). My reproduction mirrors that layout under scratch; the script's own mutation clone is created and removed internally (`mkdtempSync` under TMPDIR, `rmSync` in `finally`).

## Mismatch table (reproduced vs frozen)

| Check | Result |
|---|---|
| `controls-summary.json` (13 controls: exit, predicate, counts, refusal clauses) | **IDENTICAL** (`diff` empty) |
| `c1-candidates.tsv` | **IDENTICAL**, 383 lines both |
| `c1-J1-do-nothing.json` | **IDENTICAL** byte-for-byte |
| `c1-J2…J8 .json` | equivalent; only `rev` (fresh control commit) differs |
| `c2-J1-do-nothing.json` | **IDENTICAL** byte-for-byte |
| `c2-J2/J4/J5 .json` | equivalent; only `rev` and `live` (ports/session ids) differ |
| `c2-J3 .json` | equivalent except `provenance[].sessionId/contexts` — the control's own `randomUUID` rewrites (`controls.mjs:151`) |
| Mutation-commit `tree=` | **10/11 MATCH**; `c2-J3` differs (`2f921bc0…` vs `9faef556…`, randomUUID, by design) |
| Provenance `counter_sha256=`, `exit=` | MATCH (checked J1, J8, c2-J3, c2-J5) |
| `.stderr` files | IDENTICAL (checked J1, J8, c2-J3) |
| `live.firstShotSha256` | **MATCH** `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` = frozen control run = `c2-instrument-check.json` |

Field-level comparator: `cmp-receipts.mjs` (excludes only `rev` and `live`).

## Per-control verdicts

C1 counter predicate: gate clean ∧ unaccounted==0 ∧ newMapped>=2 (`c1-adjacency-sweep-v3.mjs:299-300` area; refusal order n1→n2→n1-path→n1-shared→n2-rename→**n3 (:287)**→**n4 (:289)**).

| Control | What it claims to test | Verdict | Isolation |
|---|---|---|---|
| `c1-J1-do-nothing` | Counter floor at baseline: 383 unaccounted, predicate false | **holds** | Floor; receipt byte-identical |
| `c1-J2-screen-all` | Screening alone drives unaccounted to 0 but not the predicate | **holds** | Cleanly isolates `newMapped>=2` — the only false clause left |
| `c1-J3-junk-noncandidate` | Junk rows on non-candidate lines don't inflate newMapped | **holds** | Isolates the "maps ≥ 1 candidate" conjunct: 4 junk rows are gate-verified (adjacency rows 20, verified 20) yet `mapped 0, newMapped 0`; had the counter counted them, newMapped 4 ≥ 2 would have flipped the predicate to true (exit 0 ≠ frozen 1) |
| `c1-J4-existing-tabi-line` | An existing tabi line never counts as a new declaration | **holds** | Isolates n1-newness (3× `n1-tabi-declaration`). Does **not** reach `n1-shared-tabi-ref` (`:285`): the three rows share one existing tabi line, but the newness clause fires first — no control exercises the shared-ref clause |
| `c1-J5-quote-no-browser-ground` | Split quotes without browser ground are refused | **holds, PARTIAL isolation** | 2 of 3 rows reach `n4-split-quote-not-browser-ground`; **row 19 (`nobg-1`, kagi) is refused earlier by `n3-third-lane-record`** (frozen `c1-J5…json` `newRowRefusals`) because its candidate path matches `THIRD_LANE` and the J5 pick filter doesn't exclude those paths (`controls.mjs:101`; n3 precedes n4, `:287` vs `:289`) — that row duplicates J7's target |
| `c1-J6-quote-states-no-side` | Browser-ground quotes stating no side are refused | **holds** | Cleanly isolates the SIDE half of n4 (3× `n4-split-quote-states-no-side`) |
| `c1-J7-third-lane-record` | Third-lane records are refused as sibling sides | **holds** | Cleanly isolates n3 (3× `n3-third-lane-record`) |
| `c1-J8-residual-lexical-forgery` | Form-only forgery reaches the predicate | **holds as disclosed** | exit 0, newMapped 2 — the disclosed residual (claims `feasibilityDisclosed`). Note the `ruled`/`contested-open`/`refused-route` auto-pass branch of n4 (`:288`) is never exercised by a control; it is guarded upstream by the gate's ruling-venue verification, a different layer |

C2 counter predicate: no entry finding ∧ no binding finding ∧ failing==0 ∧ admitted>=TARGET (`c2-firefox-bidi.mjs:462`).

| Control | What it claims to test | Verdict | Isolation |
|---|---|---|---|
| `c2-J1-do-nothing` | Floor: `e1-entry-absent` | **holds** | Early return before any live leg (`:342`) |
| `c2-J2-chromium-copy` | A copied Chromium receipt is refused | **holds** | Isolates the firefox session-shape clause (`t1-receipt`: sessionId not geckodriver UUID, `:299`); binding/live leg skipped once the receipt finding fires (`:418`, `:424`) |
| `c2-J3-relabelled-chromium` | Chromium transcripts relabelled Firefox are caught by binding | **holds** | The **only** control that runs the live leg (`:418`); isolates `t3-binding` — first screenshot differs from the counter's live session (`:432`). My live session's first-shot sha equals the frozen instrument check's |
| `c2-J4-duplicate-run` | One transcript at two paths is refused | **holds** | Isolates the pairwise-distinct-transcript clause (`t1-receipt`: sha repeated) |
| `c2-J5-driver-imports-counter` | A driver importing the counter's recorder is refused | **holds** | Isolates the driver-independence clause (`t1-receipt`: "driver imports this counter") |

## Dependence audit (wall-clock / network / live HEAD)

- **Wall-clock: none.** No `Date`/`Date.now`/`performance` usage in `controls.mjs` or either counter; the only date literal is the hardcoded `'2026-10-26'` in `fakeSource` (`controls.mjs:134`).
- **Network: none external.** The C2 live leg (c2-J3 only) serves the gate fixture on loopback and talks to geckodriver on 127.0.0.1; ports come from `freePort()` binding port 0 (`c2-firefox-bidi.mjs:177-179`), so the operator's 9222 lease is never touched. After the run: `pgrep -af 'geckodriver|firefox'` → none; `$S/ctl` empty (the script's mkdtemp dirs removed in `finally`).
- **Live sibling HEAD: yes, by disclosed design.** Content comes from the frozen pins, but *validity* is anchored to each repo's **current** `refs/heads/master` (then `main`): `checkSibling`/`checkRuling` require every cited pin to be an ancestor of the live tip (`scripts/check-adjacency.mjs:198` TIP_FALLBACKS, `:452-464` tipOrNull, `:708-718` sibling reachability, `:861-871` ruling reachability; the gate header presents this as the anti-dangling-commit guard, `:60-66`). The C1 controls — and the claim's adjacency-clean clause — inherit this: a sibling history rewrite could flip a verdict with no lane change. My run used today's tips and reproduced the frozen verdicts, so no tip drift affects the 16 baseline rows or the control rows.
- **Lane working tree: six reads.** `controls.mjs` reads `corpus/adjacency.tsv` (`:64`), the round-32 receipt (`:130`), the round-32 entry (`:131`), and the round-32 run transcripts (`:149`, `:165`, `:176`) from the LANE checkout's **working tree**, not git objects — a dirty or advanced lane checkout at run time would drift the receipts. My run pinned the working tree at the freeze. The counters themselves read only git objects.

## Findings

1. **[medium] claims.json ↔ counter TARGET mismatch.** `claims.json` C2 `predicate`: "no entry finding AND no binding finding AND failing == 0 AND **admitted >= 16**"; the frozen counter: `const TARGET = 14;` (`c2-firefox-bidi.mjs:77`), `out.admitted >= TARGET` (`:462`), header comment "admitted >= 14" (`:53-54`). The counter is the arbiter and would admit C2 at 14–15 admitted rows while the claim's stated predicate promises 16 of the 16 matrix rows. Risk direction: the gate is weaker than the claim text — closure at admitted 14–15 would pass the counter but not the claim as written. Not reproduction-relevant (no control reaches the TARGET comparison; all C2 controls fail earlier), but it must be reconciled before C2 closure.
2. **[low] c1-J5 partial isolation.** Row 19 (`nobg-1`, kagi) is refused by `n3-third-lane-record` before the clause J5 claims to test (frozen `c1-J5…json` `newRowRefusals`; refusal order `c1-adjacency-sweep-v3.mjs:287` vs `:289`; J5's pick filter `controls.mjs:101` does not exclude `THIRD_LANE` paths). The clause is still exercised by rows 18 and 20, so the control is not vacuous — but it is contaminated.
3. **[info] Untested clauses.** C1: `n1-shared-tabi-ref` (`:285`) and the `ruled`/`contested-open`/`refused-route` auto-pass of n4 (`:288`, guarded upstream by the gate's ruling verification). C2: entry findings beyond `e1` (s1-source, x1–x4, duplicate ids, R16-yes) and the gdv/browserVersion binding sub-clauses (`:429-430`, `:433-434`) — only the screenshot-differs branch (`:432`) ever fires.
4. **[info] Live-state dependences** as listed in the dependence audit (gate tip ladder; lane working-tree reads). Both reproduced cleanly this round.

## Tooling / environment / bounds

- No tools installed or upgraded (operator tooling authorization unused). No network fetches. No pacman transactions.
- Writes: this report, my output dir, my scratch. Lane tracked files, the lane git index, sibling repos and the fleet repo untouched (all git access read-only; commits only inside the script's own scratch clone, which it creates and removes).
- Browsers: one geckodriver 0.37.1 + Firefox 158.0.1 headless session launched by the C2 counter's live leg inside its own scratch under my TMPDIR; loopback fixture only; cleaned up on exit (no leftover processes; 9222 untouched).
- Scratch `/fast/scratch/hyaku/tabi-r35/RevControls` deleted after receipts were copied.

## Deliverable paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/RevControls.md` — this report
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/RevControls/reproduced/` — my run's 13 receipt `.json`/`.stderr`/`.provenance` + `controls-summary.json` + `c1-candidates.tsv` (41 files)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/RevControls/controls-stdout.json`, `controls-stderr.txt` — raw run output
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/RevControls/cmp-receipts.mjs` — field-level comparator (excludes `rev`/`live`)
