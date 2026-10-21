# ResidualFrozen — `check-wave.mjs --frozen` review

Revision: `ac10319843f718489a10b89a8d2a568879aaf980` (ancestor of HEAD). Committed blobs equal working-tree bytes for every file reviewed.

## Method and limits
- Static reading and read-only data inspection only. Not executed: `check-wave.mjs` in any mode, `--selftest`, counters, `run-checks.py`, tests, gates. "Predicted" results are hand traces.
- Inspection commands: `sha256sum`, `stat`, `grep`, `git --no-optional-locks` (`cat-file`, `show`, `rev-parse`, `merge-base`), `python3` JSON parse and set comparison.
- Disclosure: one earlier `git status --porcelain=v1` ran without `--no-optional-locks` and can refresh the index stat cache. No content or tree change. Not repeated.
- Tools: none installed or updated.

## Verdict
- Hash pinning and regular-input refusal match the stated contract. No defect found.
- The committed `w1/frozen` triple should evaluate clean: exit 0, `verdict` `frozen_match`, `findings` [], `pinnedExit` 0.
- All 27 new oracle rows match their fixtures and code paths by static trace.
- Assigned limits are confirmed. Four Medium items need a decision or wording fix (M1–M4).

## Findings

### Medium

**M1. Frozen exit 0 means "equals the pin", including pinned failures.**
- `check-wave.mjs:306-318`: equality with the pin returns exit 0 and `verdict: 'frozen_match'`, whatever the pinned outcome.
- The oracle has no row that pins a non-clean outcome and expects exit 0. The only pinned-exit-1 row (`frozen_expectation_mismatch`) expects exit 1.
- Header lines 17-18 ("0 clean/matched; 1 findings") do not say a matched pinned failure exits 0.
- Effect: a snapshot with a marker or tracked change can be pinned as its expected failure, and the gate exits 0. No current effect: the w1 pin is `0 / []`.
- Fix: allow only clean pins in frozen mode, or emit a distinct exit for a matched non-clean pin. Add an oracle row.

**M2. "Pins every input digest" overstates the pinned set.**
- `SKILL.md:2352`. Code pins only `spec.json`, `registry.json`, `snapshot.json` (`check-wave.mjs:53`, `290-291`).
- Pinned nowhere: the checker (sha256 `9c667b84522a65abed12af2b19c2347f63f350bdeba7214b963bc270f7983f12`), the pin file `w1/frozen/expected.json` (`8d8b85fb63e283815b9775af65b88a09fa560bfef6d3ff27d4d63a1e5ea40f92`), the oracle `corpus/evidence/round-20/wave-check-expected.json` (`2dc7c858e31a21439a6113868dec0afc7f934c0ff74c489c01b123b836f80022`), and the directory listing.
- Frozen output carries no input digests or paths (`report()` at 211-221 emits schema, verdict, findings, details).
- Effect: an edited checker or pin file changes the verdict with no digest in output. Only the commit anchors them.
- Fix: print checker and pin-file digests in frozen output and record them in the registry row, or narrow the sentence to the three JSON inputs.

**M3. "w1-specific, not a w2 checker" is not enforced.**
- `SKILL.md:2357`. Only `ROUND_BASELINE` (line 47) and `RETURN_PHASE` (line 48) are constants. `checkWave` (134-142) checks `spec.wave === registry.wave` and non-blankness. The snapshot has no wave id and is never compared with spec or registry.
- No oracle row checks wave identity. `wave_mismatch` uses `...-w0` only as a mismatch.
- Effect (by reading): a w2 spec and registry with matching names, plus a snapshot with the round baseline, `return-before-integration`, and in-scope status, returns clean. A pinned w2 triple would pass the same way.
- Fix: check wave identity (closed set or argument) with oracle rows, or reword to "wave-agnostic; the pinned triple binds w1 bytes".

**M4. The serial harness does not run the frozen gate.**
- `run-checks.py:62-63` runs only `check-wave.mjs --selftest` under gate name `wave-provenance`.
- The canonical frozen command (`SKILL.md:2350`) is not in the harness. The active registry row (`SKILL.md:2244`) still lists the direct-mode command; the supersession is prose at 2349-2351.
- Effect: the harness label `wave-provenance` covers the selftest only. Main must run the frozen command by hand.

### Low (confirmed limits and hygiene)

**L1. Provenance fields are never read.** No reference in `check-wave.mjs` to `all64Settled`, `captureActor`, `capturedAt`, `writerHeads`, `preexistingSourceSha256`, or registry `updatedAt`. The marker test only sees keys matching `/reconstruct/` (line 167), so `all64Settled` passes whether true or false. The frozen snapshot is byte-identical to `w1/return.json` (sha256 `40e3cb38337aa7434a0df8f45751454eba01e6cd4621729209b39cbd84380260`), still asserts `"all64Settled": true` (line 7), and `w1/ordering-correction.json` lines 3-4 withdraw that claim. The clean verdict is shape-only.

**L2. Marker predicate is top-level only and skips `status`.** `check-wave.mjs:164-170`. Line 166 skips `status` and `trackedDiff`; the comment at 164 does not say so. By reading: a snapshot otherwise valid with `"meta":{"method":"RECONSTRUCTED"}` passes, and so does a status path containing the marker. `trackedDiff` is harmless (any non-empty value gives `tracked_change`, lines 179-180). `SKILL.md:2357` declares nested values and path strings outside the shape proof.

**L3. Status predicate is lexical prefix matching.** Lines 192 and 195-196. No `..` normalisation: `?? .ufo/waves/round-20/../../x` passes. The prefix `corpus/evidence/round-20/sources/` admits any untracked file in that directory; only one file is pinned (line 49, checked at 171-174). Quoted paths fail closed and non-`??` codes give `tracked_change`; both correct.

**L4. No actor, order, or membership certification.** `checkMembers` (144-153) checks only a non-empty map with non-blank IDs: no names, count, or uniqueness. Observed, not certified: spec has 64 items; registry has 64 members with identical name sets and 64 unique non-blank agentIds.

**L5. Finding names overloaded.** `snapshot_reconstructed` covers phase, observed, baseline (163), status and preserved line (171-174), non-porcelain lines (188), and markers (167-168). `snapshot_tampered` (291) also covers spec and registry mismatches.

**L6. Duplicate JSON keys.** `JSON.parse` keeps the last value, so an earlier duplicate escapes the predicates while its bytes stay pinned. Not exercised. The w1 snapshot has ten top-level keys, each once.

**L7. Symlinked directory followed.** `lstat` and `O_NOFOLLOW` (91-96) guard only the final path component. `--frozen` through a symlinked `DIR` is followed. Low: inputs are author-controlled.

**L8. Oracle gaps.** All 27 rows pass by trace; these branches are unexercised: members absent or empty; blank agentId; baseline mismatch (163); non-`??` status line (192); quoted path (195); status missing or non-porcelain (171, 188); non-string `trackedDiff` (176); matched pinned failure (M1); FIFO refusal; membership or count mismatch; non-w1 identity (M3); duplicate keys (L6).

**L9. Stale or ambiguous text.** `wave-check-expected.json:4` says actual capture data is "supplied later by L1", but the w1 triple exists. Header lines 17-18 (M1). Registry row (M4).

Earlier lane review notes (`w2/WaveMembership.md`, `WaveOrder.md`, `WaveAgentId.md`, `WaveMismatch.md`) raised membership, marker, provenance, and wave-binding gaps against earlier revisions. Re-checked by static reading at ac10319: they still hold.

## Verified, no defect

- **V1 Hashes.** `sha256sum` equals the pins in `w1/frozen/expected.json` for spec (`f4270233febe3313fc97a403647d3bd702dff11b18dd719dbf0aec7b172ed4bc`), registry (`a77ad7569eb201bc444486a2bf2d57bc8bb523a7773f2a7e985dabd82d8045c5`), and snapshot (`40e3cb38337aa7434a0df8f45751454eba01e6cd4621729209b39cbd84380260`). Hashing runs before parsing (289-291), and parsing uses the same buffers, so there is no re-read window.
- **V2 Regular-input refusal.** Symlink (`isSymbolicLink`), non-file, and `ELOOP` map to `input_not_regular`; other read failures map to `input_unreadable` (89-108). Oracle covers symlink and non-regular for all four files, plus missing `registry.json`. FIFO shares the non-file branch and is not separately exercised.
- **V3 `w1/frozen` triple (predicted clean).** `spec.wave` = `registry.wave` = `tabi-round-20-w1`. 64 members with non-blank IDs. Snapshot phase, observed, and baseline pass. Case-insensitive count of `reconstruct` in the snapshot is 0. 84 status lines: all `?? ` (untracked); 83 under `.ufo/waves/round-20/`, 1 under `corpus/evidence/round-20/sources/` (the preserved line, present); no `..`; no quoted paths. `trackedDiff` empty. Predicted output: exit 0, `frozen_match`, `findings` [], `pinnedExit` 0. Direct-mode inputs are byte-identical to the frozen copies (`w1/spec.json`, `w1/swarm-registry.json`, `w1/return.json`).
- **V4 Oracle, 27 rows.** Names equal `buildFixtures` (342-380); no extras or gaps. Direct rows (14): `positive_clean_triple` clean; four `wave_null` rows (137-138); `wave_mismatch` (139-140); `agent_id_absent` (150-152); five `snapshot_reconstructed` rows; `tracked_change` (179-180); `out_of_scope` (195-196). Frozen rows (13): `frozen_clean` (315-318) gives `frozen_match` exit 0; `frozen_tampered` (290-291) gives `snapshot_tampered` exit 2; `frozen_expectation_mismatch` (306-314) gives exit 1; `frozen_unpinned` gives `frozen_expectation_invalid` exit 2 (249-261); `frozen_unreadable_input` gives `input_unreadable` exit 2; eight symlink/non-regular rows give `input_not_regular` exit 2. All frozen pins pass `validOutcome` (241-247).
- **V5 Identity.** Committed blob equals working-tree bytes at ac10319 for `check-wave.mjs`, `wave-check-expected.json`, the four `w1/frozen/*` files, `ordering-correction.json`, and `html_form_element.cc`. ac10319 is an ancestor of HEAD.
- **V6 Source digest.** `preexistingSourceSha256` `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` equals the file bytes, `design.json` `source.sha256`, and `corpus/SOURCES.md:110` (S096). The guard does not compare the field (L1).
- **Docs.** `corpus/README.md` has no round-20 `check-wave` claim; its only w1 row (line 460) matches `ordering-correction.json`.

## Assigned limits: status

| Limit | Status |
|---|---|
| `all64Settled` ignored as provenance | Confirmed (L1) |
| w1-only | Not enforced in code; doc claims it (M3) |
| Top-level marker and lexical status predicates | Confirmed (L2, L3) |
| No actor or order certification | Confirmed (L1, L4) |

## Residual risk
- Static trace only; Node semantics assumed standard (`JSON.parse` last-wins; Linux `O_NOFOLLOW`).
- Trust root is the commit; the pins live in the file they pin (M2).

## Checks for main (not run here)
1. `node .ufo/waves/round-20/check-wave.mjs --selftest`: expect `CHECK_WAVE_SELFTEST verdict=clean cases=27 failed=0`, exit 0.
2. `node .ufo/waves/round-20/check-wave.mjs --frozen .ufo/waves/round-20/w1/frozen`: expect exit 0, `frozen_match`, `findings` [], `pinnedExit` 0.
3. Decide M1-M4 before close; otherwise correct the SKILL paragraph (2349-2360) and registry row (2244).
