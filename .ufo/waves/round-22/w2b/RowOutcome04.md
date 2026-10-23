# RowOutcome04 — falsification of row `na-native-submit` (round-22, W2b, C1 OPERABILITY)

**Scope (my seat only):** row `na-native-submit` of `.ufo/waves/round-22/measure-c1.mjs` against the pinned
`corpus/evidence/round-22/semantic-expectations.json` and the retained raw
`corpus/evidence/round-21/runtime/na-native-submit.json` — exact status/output/errorText, pre/post page state,
navigation, finite response window.

**Review revision:** `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (post-crash repair of the landing-stage oracle).
**Author-side falsification, not admission.** Verdict below is a recommendation only.

**Verdict: NOT FALSIFICATION-PROVEN for the navigation axis.** The status/output/errorText, pre/post page-state
and finite-window axes are falsifiable (7 control mutations refused with precise findings). The **navigation axis is
not**: three coherent, fully re-sealed raw mutations that contradict the pinned expectation
(`navigation: "landing"` = a *post-action* navigation to `/landing?q=<nonce>`) are still **counted** as
semantically checked — `value 12`, `verdict clean`, `exit 0`, `findings []`.

---

## 1. Method, environment, and what was executed

* Canonical runtime: the lane's own Node, `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`
  (`v24.21.0`, matching the pinned `expectations.environment.node`). No browser was launched; no services started.
* Private throwaway clone: `/home/vgpnk/.cache/tabi-r22-w2b-RowOutcome04` (git clone of the lane, checked out at
  `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`), reachable at the assigned path `/tmp/tabi-r22-w2b-RowOutcome04`
  (symlink). Reason: `/tmp` was at 100% (364 KiB free) from other agents' clones; `/home` had 749 GiB free. The
  clone was deleted after the run. **The lane was never written to**: no lane git write, no lane file edit, no
  `git` operation of any kind inside `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
* No installs were needed (no tool install/update performed in this seat).

**Commands exercised (exit codes are observed, not inferred):**

| # | Command (in the throwaway clone) | Exit | Result |
|---|---|---|---|
| 1 | `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `value 12`, `verdict clean`, `findings []`, all 12 rows `counted: true` — **preserving positive** |
| 2 | `node .ufo/waves/round-22/selftest-c1.mjs` | 0 | `cases 44, passed 44, verdict clean` (pristine `e3cf4e0d`) |
| 3 | `python3 mutate.py <each mutant>` (10 mutants) | see §4/§5 | per-mutant oracle runs on freshly committed revisions |
| 4 | `python3 fixcheck.py` (candidate patch applied to the oracle **in the clone only**) | 0 | before/after table in §6 |

**Resealing method (this is the "digests resealed through receipt/acquisition" the assignment asks for).** For every
mutant the whole chain was recomputed, not just the raw file:

1. mutated `corpus/evidence/round-21/runtime/na-native-submit.json` → new bytes;
2. `corpus/evidence/round-21/runtime/receipt.json` → `cases[na-native-submit].evidence.sha256` = sha256(new raw bytes);
   and the receipt **summary was re-derived from the mutated raw exactly as the oracle recomputes it**
   (`preAction.responseCount`, `after.responses`, `after.navigations`, `after.pageState`, `after.submits`,
   `after.end/windowMs`) so that only a *semantic* check can possibly catch the mutant;
3. `.ufo/waves/round-21/runtime-execution-finalized.json` → `artifacts[na-native-submit.json]`,
   `artifacts[receipt.json]` and `receiptSha256` = sha256(new receipt bytes).

The pinned expectations file, the fixture HTML, the producer script and the note were **not** touched, so the
`EXPECTATIONS_SHA256` (line 21) / `PRODUCER_SHA256` (line 22) pins stayed satisfied. The mutants were committed in
the clone and evaluated with `measure-c1.mjs <mutant-revision>`; the oracle reads the corpus from git and the oracle
code from the working tree, so the mutants are exactly reproducible from the quoted revision ids.

---

## 2. Finding F1 (HIGH) — the post-action navigation window is wall-clock based, so a landing that happened
### *before* the submit dispatch is counted as the submit's landing

**Where:** `.ufo/waves/round-22/measure-c1.mjs:309-310` (window definition), `:274` (window start bound),
`:314-325` (the landing check).

```js
309  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
310    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
...
314    const landing = actionNavigations[0]?.params?.frame?.url;
318      validLanding = actionNavigations.length === 1 && url.origin === origin && url.pathname === '/landing' &&
319        url.search === `?q=${encodeURIComponent(nonce)}` && !url.hash;
321    if (!validLanding) add('semantic_navigation', 'native-submit-landing');
323    const navigation = actionNavigations[0];
324    if (navigation && response && navigation.seq >= response.seq)
325      add('semantic_navigation', 'landing-before-completion');
```

The "action window" is delimited by **wall clock** (`frame.at >= receiptCase.after.start`), and `after.start` is only
bounded by `pre.at <= after.start <= actionFrame.at` (line 274). In the retained receipt `after.start == pre.at ==
1792590710183`, i.e. the window **opens before the submit is dispatched**. The only ordering the landing check
enforces is `navigation.seq < response.seq` (lines 323-325): a navigation is never required to happen **after** the
action. Consequently a record in which the *only* landing navigation precedes the submit satisfies
`navigation: "landing"`, which the pinned expectation defines as a post-action navigation (the same field is read as
"no post-action navigation" for the `navigation: "none"` rows at lines 311-312).

**Smallest counterexample (mutant `m1_pre_action_landing`, revision `00972a33d440d71a93bfe9b23e662b3bd3be5176`):**
one frame is moved and one timestamp is lowered; nothing else in the raw record changes.

Baseline frames (seq, at, kind, detail) → mutated frames:

```
(12, 1792590710183, observation pre-action , http://127.0.0.1:43143/na-native-submit)   (unchanged)
(13, 1792590710183, action submit dispatch-started)                    ->  (13, 1792590710183, event Page.frameNavigated, http://127.0.0.1:43143/landing?q=8a5839ad-…-501aa2c5c4a4)
(14, 1792590710184, action-complete submit)                           ->  (14, 1792590710183, action submit dispatch-started)
(15, 1792590710190, event Page.frameNavigated, …/landing?q=8a5839ad-…) ->  (15, 1792590710184, action-complete submit)
(16, 1792590710196, event WebMCP.toolResponded Completed [{"dummy":"landing"}]) -> (16, 1792590710196, … unchanged)
(17, 1792590710686, observation after-action, …/landing?q=8a5839ad-…) -> (17, 1792590710686, … unchanged)
```

The mutated record therefore says: the page was on `/na-native-submit` at the pre-action observation, it **navigated
to `/landing` at the same millisecond**, and only **then** was the submit dispatched — the submit ran on the landing
document, and the landing cannot have been produced by it. The after-action observation still shows
`/landing?q=<nonce>` with no form.

**Observed oracle result at revision `00972a33…`:** `value 12`, `verdict clean`, `exit 0`, `findings []`,
row `na-native-submit` `counted: true`, `semanticMatch: true`, row findings `[]`,
`rawDigest 01b1f72477d596405aca147684ae2da725b26c485d716a8d6734540194716076` (resealed identically in
`receipt.cases[].evidence.sha256` and `execution.artifacts[corpus/evidence/round-21/runtime/na-native-submit.json]`).

**Preserving positive:** the pristine revision `e3cf4e0d…` measures `value 12 / clean / exit 0` (command 1 above).
The mutation is the only difference; nothing about the population, target, metric or pinned expectations changes.

**Smallest fix:** define the post-action window by frame order instead of wall clock, and require the landing to be
the only navigation of the case:

```js
const actionNavigations = post ? navEvents.filter((frame) =>
  frame.seq > (actionFrame?.seq ?? 0) && frame.seq < post.seq) : [];
const earlierNavigations = navEvents.filter((frame) =>
  frame.seq > (initialNavigations[0]?.seq ?? 0) && frame.seq <= (actionFrame?.seq ?? 0));
```

and add `earlierNavigations.length === 0` to `validLanding` (line 318). Verified in the clone: the mutant is then
refused with `semantic_navigation na-native-submit:native-submit-landing`, the pristine baseline still measures
12/clean, and the 44/44 selftest still passes (§6).

---

## 3. Finding F2 (HIGH) — pre-action navigations are entirely unconstrained; the landing route can be reached
### before the submit and the row is still counted

**Where:** `.ufo/waves/round-22/measure-c1.mjs:236-244` (only `navEvents[0]` is inspected) and `:309-310`
(the window starts at `after.start`, which may precede the action). Nothing in the oracle constrains navigations
that occur between the initial navigation and the action dispatch, and `navEvents.length` is never compared.

**Smallest counterexample (mutant `m2b_coherent_pre_action_landing`, revision
`c0f3d8f717f97ecd044536e1a1c5718ed6881fec`):** a *fully self-consistent* record — a landing navigation, then a
navigation back to the fixture page, then the pre-action observation, the submit, and a second landing:

```
(12, 1792590710181, event Page.frameNavigated, http://127.0.0.1:43143/landing?q=8a5839ad-…-501aa2c5c4a4)   [added]
(13, 1792590710182, event Page.frameNavigated, http://127.0.0.1:43143/na-native-submit)                      [added]
(14, 1792590710183, observation pre-action, http://127.0.0.1:43143/na-native-submit)
(15, 1792590710183, action submit dispatch-started)
(16, 1792590710184, action-complete submit)
(17, 1792590710190, event Page.frameNavigated, http://127.0.0.1:43143/landing?q=8a5839ad-…-501aa2c5c4a4)
(18, 1792590710196, event WebMCP.toolResponded Completed [{"dummy":"landing"}])
(19, 1792590710686, observation after-action, http://127.0.0.1:43143/landing?q=8a5839ad-…-501aa2c5c4a4)
```

Every page state is consistent with this navigation history (the page really was back on the fixture page at the
pre-action observation), and the receipt summary is re-derived from it. What it destroys is the *causal* claim the row
exists to support: the landing route is demonstrably reachable **without** the submit, so the in-window landing does
not establish that the native submit navigated the page.

**Observed oracle result at revision `c0f3d8f7…`:** `value 12`, `verdict clean`, `exit 0`, `findings []`,
row `counted: true`, row findings `[]`,
`rawDigest 29cbb60c65536d525e19b355973f37f797355475c330fdb997a1a7a9dbc915b4` (resealed).
A cruder variant (`m2_extra_pre_action_landing`, revision `eb65ee190ad5…`) — a single extra pre-action landing with
no navigation back — is likewise counted with `value 12 / clean / exit 0`.

**Smallest fix:** the `earlierNavigations.length === 0` condition of §2 (one extra conjunct) refuses both variants;
equivalently, require the case to contain exactly one navigation after the initial one.

---

## 4. Finding F3 (MEDIUM) — the landing navigation is never tied to the frame the tool was invoked in

**Where:** the oracle verifies frame identity for the *invocation* (`:212` `treeFrameId`, `:223-225`
`treeFrameId !== initialFrameId`, `lifecycleTools[0]?.frameId !== treeFrameId`,
`sent?.params?.frameId !== treeFrameId`, `invoked?.params?.frameId !== treeFrameId`) but performs **no** frame
check for the action navigation (`:314-319` inspects only the URL).

**Smallest counterexample (mutant `m18_landing_in_other_frame`, revision `1c93b2db2e1da11651ebfc53276a68bcd9542846`):**
one string is changed — the landing navigation's `params.frame.id` becomes `SUBFRAME0NOTTHETOOLFRAME` (the tool's
frame is `3F62022BA8EB4F1C7A8BAD21B535C727`, the frame the tool was invoked in and the frame the after-action page
observation was taken from). The record is then internally contradictory: the main frame's after-action page state
says `http://127.0.0.1:43143/landing?q=<nonce>`, yet the only navigation to that URL belongs to a different frame.

**Observed oracle result at revision `1c93b2db…`:** `value 12`, `verdict clean`, `exit 0`, `findings []`,
row `counted: true`, row findings `[]`,
`rawDigest 011e6a61ae080c692afb164b1c8c280b5020c212a51db220ba4d93dd1f9319fa` (resealed).

**Smallest fix:** add `&& actionNavigations[0]?.params?.frame?.id === treeFrameId` to `validLanding` (line 318).
Verified in the clone: the mutant is then refused with `semantic_navigation na-native-submit:native-submit-landing`
and the baseline stays 12/clean.

---

## 5. Confirm-none: the axes that *are* falsifiable, with the exact code lines that refuse each mutation

Every control below mutates the same retained raw file, is re-sealed through receipt + acquisition exactly as in §1,
and is evaluated with `measure-c1.mjs <mutant-revision>`. All were **refused** (`exit 1`, `value 0`,
`verdict failed`); the row was `counted: false`.

| Control (mutation) | Refused by (finding id : detail) | Code line that refuses it |
|---|---|---|
| `m3_response_output` — tool output changed to `[{"dummy":"TAMPERED"}]` | `semantic_output:na-native-submit:exact-output-shape` | `:296-299` (`equal(response.params, expectedParams)` with `output = resolveTokens(expectedResponse.output, nonce, inputQ)`) |
| `m12_error_text_added` — an `errorText` added to a successful response | `semantic_output:na-native-submit:exact-output-shape` | `:293-296` (expected params carry `output`, never `errorText`, when the expectation has no `errorText`) |
| `m4_response_status` — status `Completed` → `Error` | `semantic_status:…:outcome-status`, `semantic_status:…:finite-window-response-statuses`, `semantic_output:…:exact-output-shape` | `:291` and `:260` (`statuses(beforePost)` vs `expected.post.statuses`) |
| `m5_post_url` — after-action page URL changed away from `/landing` | `evidence_binding:…:page-observation-raw-link`, `…:observation-frame-link`, `…:receipt-raw-summary` | `:181` (raw↔mirror equality), `:248-250` (frame↔observation link), `:277-280` (receipt summary equality); independently `:140-141` (URL) |
| `m7_nonce_in_post` — landing document retains the fixture's `nonce`/`submits` | `evidence_binding:…` (×3) | `:117-128` (landing rules: `nonce`/`submits` must be *absent* on the landing) |
| `m6_response_before_action` — tool response delivered before the submit dispatch | `semantic_status:…:response-count`, `semantic_timing:…:response-outside-action-window`, `semantic_navigation:…:landing-before-completion` | `:289`, `:306-307`, `:323-325` |
| `m10_no_action` — the submit action frames removed | `semantic_status:…:action-invocation`, `semantic_timing:…:finite-summary-windows` | `:196-200` (action/action-complete markers), `:266-276` (window arithmetic) |

So, for the axes named in my assignment: **exact status / output / errorText — falsifiable** (`:285-301`);
**pre/post page state — falsifiable** (`:107-146`, incl. the landing-specific absence rules the `e3cf4e0d` repair
added); **finite response window — falsifiable** (`:302-307`, `:260`); **navigation — NOT falsifiable** (§2-§4).
This is the precise shape of the gap: the repair `e3cf4e0d` hardened the *landing page-state* rules, and the added
controls `native-landing-errors` / `native-landing-wrong-query` (see `.ufo/waves/round-22/post-crash-repair.json`,
`addedControls`) cover the landing's *error key* and *query token* — but no control in the 44-case selftest
(`fixtures/expected.json` case list) exercises **navigation order**, **navigation count** or **navigation frame
identity**. The three counted contradictions above are exactly the uncovered neighbourhood.

---

## 6. Fix verification (scratch clone only — the lane was not modified)

Candidate patch to `.ufo/waves/round-22/measure-c1.mjs` (only the block quoted in §2 plus one conjunct in §4):

```js
const actionNavigations = post ? navEvents.filter((frame) =>
  frame.seq > (actionFrame?.seq ?? 0) && frame.seq < post.seq) : [];
const earlierNavigations = navEvents.filter((frame) =>
  frame.seq > (initialNavigations[0]?.seq ?? 0) && frame.seq <= (actionFrame?.seq ?? 0));
// in the landing branch:
validLanding = actionNavigations.length === 1 && earlierNavigations.length === 0 && … &&
  actionNavigations[0]?.params?.frame?.id === treeFrameId;
```

| revision | before patch | after patch |
|---|---|---|
| pristine `e3cf4e0d…` (baseline) | value 12, clean, exit 0 | **value 12, clean, exit 0** (unchanged) |
| `m1_pre_action_landing` | value 12, clean, **counted** | value 0, `semantic_navigation:na-native-submit:native-submit-landing` |
| `m2_extra_pre_action_landing` | value 12, clean, **counted** | value 0, `native-submit-landing` |
| `m2b_coherent_pre_action_landing` | value 12, clean, **counted** | value 0, `native-submit-landing` |
| `m18_landing_in_other_frame` | value 12, clean, **counted** | value 0, `native-submit-landing` |
| all 7 controls of §5 | value 0, refused | value 0, refused (unchanged) |
| `node .ufo/waves/round-22/selftest-c1.mjs` | 44/44 clean, exit 0 | **44/44 clean, exit 0** (no existing control regresses) |

The patch is therefore non-disruptive to the existing 44-case control suite and to the 12/12 population, and it closes
F1/F2/F3. **It is a proposal only — I did not apply it to the lane** (lane is read-only for this seat). It must be
paired with new selftest controls, otherwise the next repair round can silently revert it: suggested fixture names
`native-landing-before-action`, `native-landing-extra-navigation`, `native-landing-other-frame`, each with expected
finding `semantic_navigation`.

---

## 7. Finding F4 (LOW, outside the four named axes — reported for completeness, not scored against the row)

`.ufo/waves/round-22/measure-c1.mjs:345-349` checks the cleanup boundary from
`raw.browserPidsBefore` / `raw.browserPidsAfter` / `raw.contextClosed` / `raw.closeError` / `raw.blocked` /
`raw.downloads` only. The retained raw record also carries the corroborating fields `browserPidsAtClose`,
`browserPidsSeenAfterClose` and `processIdentities`, and the receipt asserts
`cleanup.browserClosed === true` / `cleanup.serverClosed === true` (checked at `:449`). Mutant
`m19_browser_survived_close` (revision `771f11cd1aec…`) sets `browserPidsSeenAfterClose` to the nine live browser
PIDs — i.e. the record says the browser processes were still alive after the context closed, contradicting the
receipt's `browserClosed: true` — and the oracle still reports `value 12 / clean / exit 0`. The candidate patch of §6
does **not** address this axis; a separate one-line check (`raw.browserPidsSeenAfterClose` must be `[]`, and
`browserPidsAtClose` must equal `browserPidsBefore`) would.

---

## 8. Residual risk and verification gaps (stated honestly)

* **Not run:** no browser acquisition, no re-run of the round-21 producer, no lane `run-checks.py`, no lane
  `check-review-chronology.mjs`; the lane's git index, jj state and history were not touched; no VCS write of any
  kind was performed in `/home/vgpnk/Projects/shokunin/tabi-shokunin`. The mutants exist only in the deleted
  throwaway clone, so the quoted revision ids are reproducible only by re-running the described mutation.
* **Lane-level reseal caveat:** the raw digest `28a20412…` is also recorded in wave artefacts outside the oracle's
  input set (`.ufo/waves/round-21/final/semantic-contrast-witness.json`,
  `.ufo/waves/round-22/{review-snapshot,checks-pre-w2-0f24164,historical-chronology-input,selftest-pre-repair-0f24164,selftest-repair-sandbox}.json`).
  `measure-c1.mjs` does not read them (`INPUT_PATHS`, lines 36-39), so they do not affect the verdict above, but a
  reseal intended to survive the whole lane would have to update them too. I did not modify them.
* **Population / metric claims untouched:** target 12, population 12→12, scalar 8, metric
  `c1_semantically_checked_lifecycle_rows` and the pinned expectations digest `4a693dce…` are unchanged by this
  review; the finding does not claim a wrong number, it claims that one of the twelve counted rows is not
  semantically discriminated on its navigation axis.
* **Row scope:** I audited row `na-native-submit` only, as assigned. The window/order defect in §2 lives in
  `checkCase` and is shared by every row that has `navigation: "landing"` (only this row today) and by the
  `navigation: "none"` rows in the weaker direction (a pre-action navigation would be missed there too — my
  candidate patch closes that as well). Sibling seats own the other eleven rows.
* **Honesty note on the repair:** `e3cf4e0d` was authored after observing the failing positive (the repair file
  states this itself). F1-F3 are *not* repair regressions — the same window logic exists in the pre-repair
  checkpoint `0f24164be77e72ba359fe4befdc42d96bc343034` — but they are gaps the repair's own negative-control
  methodology did not probe, and the two new controls it added sit next to, not on, this axis.
* **Tooling:** no package was installed or upgraded in this seat (the lane's pinned Node was sufficient). The only
  environment change is the relocation of my throwaway clone from a full `/tmp` to `/home/vgpnk/.cache` (symlinked
  at the assigned `/tmp` path).

---

## 9. Recommendation

1. Adopt the §6 patch (order-delimited post-action window, no navigation before the action, landing frame tied to
   the tool frame) and land it **with** the three new selftest controls, so the fix is itself falsifiable.
2. Until then, treat the C1 OPERABILITY claim for `na-native-submit` as **partially unverified**: the row's status /
   output / page-state / response-window claims are falsifiable and hold, but its *navigation* claim (that the native
   submit is what produced `/landing?q=<nonce>`) is not discriminated by the repaired oracle and survives three
   coherent, fully re-sealed contradictory raw records.
3. Add the F4 cleanup cross-check in the same repair round if the repair is accepted.

**Report:** `.ufo/waves/round-22/w2b/RowOutcome04.md`
