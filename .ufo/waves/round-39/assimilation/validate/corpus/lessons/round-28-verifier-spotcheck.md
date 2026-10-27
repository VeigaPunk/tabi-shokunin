# Round 28 verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)

Lane round: tabi 28. Before `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` → after `b4128c420009a9736c8a64f75ccc02fc94c68502`.
Driver digest (`.ufo/watchdog.log`, copied at closure):
`2026-10-25T15:52:38-03:00 launch tabi round=28 pgid=3164201 driver=hyaku-inline attempt=1`;
`2026-10-25T16:39:22-03:00 complete tabi round=28; hyaku-inline attempt=1`.

## Conformance

- Report `.ufo/reports/round-28/tabi.md` committed by `tabi-shokunin <tabi@shokunin.local>` in fleet commit `32d6c304fb8e12765af78e98b26038c28a03de3d` (2026-10-25 16:32:33 -0300), after the lane commit (16:31:41 -0300) and before driver completion. `## SHONEN` heading present with four `[~]` lines, one per box.
- Cited lane hashes `eb23c0b8…`, `b4128c42…`, `0c666adc217685e1ece2af8596b732b303a3b15c` all `git cat-file -t` → `commit` and `git merge-base --is-ancestor <hash> master` holds. Lane range has one commit (`b4128c4 round-28: bind evidence revisions and exact citations`).
- `scripts/hyaku/jj-lane.sh state` → `branch=master local=b4128c42… remote=b4128c42… ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty.
- Prompt `.ufo/prompts/tabi-round-28.md` (committed `2c8bebbb`): `diff` of lines 1–140 against `kimi-shokunin/templates/round-prompt.md` differs only in filled placeholders; sections 1–5 present verbatim plus hyaku addendum §6.
- Defects (status-neutral): (a) report claims 64 results with output, and `w1-results.json` has 64 entries, but `.ufo/waves/round-28/w1/` holds 62 report files — `Mut04.md` and `Mut06.md` are absent (their output exists only inline; Mut06's inline output is unfinished reasoning text, not a verdict). (b) Report's census "After" block prints `S068 … WebMCPModel.ts`; my run of the same command at closure prints `S068 … WebMCPView.ts` (same row id, same 16 W04 count) — the quoted output is not byte-reproducible.

## Claim re-checks

Gate standard (Closure consequence) binds both claims: each rests on a lane-owned gate self-test. I did **not** execute either sibling gate; I verified committed evidence and re-derived inputs with plain git/sha256sum/grep over committed bytes.

### C1 depth — S106 receipt bound to measurement revision; self-test 5 → ≥7 with revision controls

- Case census (committed bytes): `git show <rev>:scripts/check-s106-evidence.mjs | awk '/^const CASES = \[/{f=1} f&&/^\];/{f=0} f' | grep -cE '^    id: "'` → `eb23c0b`: 5, `b4128c4`: 7. Matches reported +2.
- Receipt: `jq .measured_rev` at `b4128c4` → `0c666adc217685e1ece2af8596b732b303a3b15c` (full 40-hex). `git show <rev>:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | sha256sum` → `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` at both `0c666ad` and `b4128c4`, 73952 bytes, 1624 lines; equals receipt `decoded_sha256`/`decoded_bytes`. Anchor `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` at line 187, `grep -c` → 1. The runtime inputs for `revision_match` are consistent.
- Committed post-edit evidence: none. SKILL registry row reads "7 cases in CASES (not run at round-28 tip)"; report, LOG and lesson all state the self-test was not run. No self-test tally, no frozen-run verdict exists for `b4128c4`.
- Static read of the landed self-test (not an execution) finds both new controls unable to pass as written:
  - `measured-revision-bytes-match` (`exit: 0, valid: true, field: "revision_match"`): runner line 301 is `if (c.field) ok = ok && out[c.field] === false;`, while `valid` requires `revisionMatch` true (`valid = revisionMatch && …`). A passing valid case therefore has `revision_match === true` and fails the field check.
  - `measured-revision-bytes-mismatch` (`exit: 1`): `build` calls `d.commit()` (sets `committed = true`) and then writes the receipt without committing; `rev()` skips its commit when `committed` is true, so the evaluated HEAD has no receipt → `Refusal("receipt absent")` → exit 2, not 1.
  - [INFERENCE] The 7-case self-test would report at most 5/7 with `ok=false`. This is a lane-owned red gate, routed below; it is not graded `harmed` because I did not run it.
- Verdict: **unprovable** — after-state unmeasured by the lane, and the committed controls appear unable to establish the frozen target ("revision mismatch rejected" and a matching control passing).

### C2 calibration — supersession requires citation of the exact stale line

- Case census: CASES ids `eb23c0b` 15 → `b4128c4` 18 (`grep -nE '^\s*id: "'`), plus 2 fixed refusal rows appended in `runSelftest` → 17 → 20, matching the registry rows.
- Matcher diff: both `/:\d+/` tests replaced with `citesLine(text, f.line)` over `\b(?:LOG|SCORECARD)\.md:(\d+)(?:-(\d+))?\b`; new cases `m1-scorecard-unrelated-citation-not-superseded`, `m1-log-unrelated-citation-not-superseded`, `m1-log-timestamp-not-citation` (all expect exit 1, class `m1-selftest-tally`). The existing positive control now cites `SCORECARD.md:5`; `fixtureDoc` puts the tally on line 5, so that control stays consistent.
- Runtime input for LOG.md:221: `git show b4128c4:LOG.md | grep -nE '(LOG|SCORECARD)\.md:[0-9]+'` → the only paragraphs citing `LOG.md:221` are at `:1931` (round-27 C1 falsification note) and `:1970` (round-28 entry). Neither names a `scripts/*.mjs` path matching `SCRIPT_IN_TEXT`, so under the new matcher neither should clear the stale tally. [INFERENCE] The counter at the tip would therefore report the stale tally, as the claim targets.
- Committed post-edit evidence: none (no `--rev b4128c4 --json` output, no self-test tally).
- Matcher gap: `citesLine` accepts either document name whatever the stale line's document is, so `SCORECARD.md:221` would clear `LOG.md:221`. That contradicts the lane's new `corpus/QUALITY.md` criterion 70 ("names the target document and line").
- Verdict: **unprovable** — the design reads as sound for the frozen target, but no post-edit measurement is committed.

### Other axes

`git diff eb23c0b b4128c4 -- SCORECARD.md` only appends Round-28 sections. No axis score changes (depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8), no capability rows, no retirement. `git diff --stat … -- corpus/SOURCES.md corpus/knowledge` is empty.

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| depth | unprovable | C1 self-test not run; the two new controls appear unable to pass as written (static read, runner `:301`, fixture `commit()`/`rev()`); receipt inputs re-derived consistent |
| calibration | unprovable | C2 matcher and cases consistent with the target; no committed post-edit counter or self-test output; cross-document citation gap |
| operability | unprovable | s106-evidence gate self-test was 5/5 at baseline (registry); post-edit self-test predicted red by static read and not run — not graded harmed |
| coverage | unchanged | registry 107→107; no knowledge entries |
| freshness | unchanged | no recheck transitions; S106 bytes re-derived identical |
| adjacency | unchanged | no province or cross-domain changes |

Not admitted: no claim verifies. This is an honest stop: the lane itself declared both claims unprovable and asserted no delta.

## Discernment spot-check

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S106 admit (re-opened) | admit | `curl https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT` → base64-decoded (Gitiles) → sha256 `9b93fe64…6c44`, 73952 bytes; lines 186–187 `// Enable using the BackForwardCache.` / `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);` | agree | Live decoded bytes equal the committed copy and the receipt digest. The quoted anchor (9 words, under 25) is at the stated line, and the scope (default enablement at this tag only) fits the source. |
| S125 reject (re-opened) | reject | `curl https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` → 3696 lines; line 13 `Cookies: HTTP State Management Mechanism`; `grep -ciE 'rate.?limit'` → 0 | agree | The document is the cookie state-management draft and contains no rate-limit text, so the staged row's rate-limit quotation is unsupported. Rejection stands. S125 is not a registry row, so no status change was owed. |

No `corpus/SOURCES.md` row was written this round (`git diff --stat eb23c0b b4128c4 -- corpus/SOURCES.md` empty; census 107 rows). For the quote check I re-opened S106 (the source this round cited): its anchor quote `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)` is ≤25 words and present at decoded line 187 of the live source. `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 16 W04 duplicate-URL warnings (pre-existing).

## Trends

- Expansion: **unchanged** — no knowledge entries added; registry stays at 107 rows (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → 107).
- Quality: **unchanged** — no knowledge entry re-verified, deepened or superseded. The S106 receipt binding is evidence-of-record, not a re-verified entry.
- Discernment: **unchanged** — the outside sample agrees on admit and reject, but both are re-affirmations of prior decisions with no new gate decision this round. New QUALITY criteria 69/70 cite lessons M1/M2, but criterion 69's paired self-test controls do not yet demonstrate it, and criterion 70 is under-implemented (no document match).

## Routed defects (tabi, next round)

1. `scripts/check-s106-evidence.mjs` self-test: in `measured-revision-bytes-match`, the `field: "revision_match"` assertion inverts it (runner `:301` requires `false`). Either drop `field` from positive cases or make the runner assert the expected field value. In `measured-revision-bytes-mismatch`, the receipt is never committed because `rev()` skips its commit after `build` called `d.commit()`, so the case yields exit 2, not 1. Run the self-test, commit its tally, and include a red-before showing each control can fail.
2. Commit post-edit evidence for both claims at a named revision: `node scripts/check-s106-evidence.mjs --selftest`, `--rev <REV> --json`, `node scripts/check-selfassessment.mjs --selftest`, and `--rev <REV> --json` showing whether `LOG.md:221` is now reported. Update the SKILL registry tallies from observed output.
3. `citesLine` in `scripts/check-selfassessment.mjs`: bind the cited document to the stale finding's document (`f.doc`), as QUALITY 70 requires, and add a cross-document red case (`SCORECARD.md:N` must not clear `LOG.md:N`).
4. Wave accounting: commit `Mut04.md`/`Mut06.md` reports or mark those seats as having no report; Mut06's inline output is not a verdict.
5. Census output quoted in reports must be a fresh byte-exact capture: the `S068` duplicate URL differs between the report and a closure re-run.

## Operator note (SHONEN)

Boxes 1, 2 and 4 carry resolvable repo pointers (`SKILL.md:697`, `:1598-1617`; `corpus/knowledge/multi-step-journey.md`; `PROVINCE.md:3-19` plus the refusal receipt) that a non-author could check. Box 3 rests on a lane-dispatched executor, so it needs a non-author executor run. Promotion is operator-owned; no `[x]` was written.
