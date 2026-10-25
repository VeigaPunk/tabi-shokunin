# RevEntryQuality — C3 surface admission review (round 24, wave 1)

Role: read-only reviewer (leaf seat). Scope: the C3 coverage surface choice — a knowledge
entry on "navigation-history evidence across a bfcache restore (a `history.back()` step
served from bfcache emits no network request and restores live JS state, so 'no network
events' cannot be read as 'no navigation')". Authority read first: `.ufo/waves/round-24/claims.json`
(C3 row, kill rule), `corpus/QUALITY.md`, `corpus/SOURCES.md`, `PROVINCE.md`.

Reviewed at `573c99e4885382db38babc3a6fc90e77afeb42a6` (= baseline = current `HEAD`;
`git rev-parse HEAD`). No files other than this report were written.

## 1. Is the surface inside PROVINCE.md's owned surfaces? — YES (category-covered, not name-enumerated)

PROVINCE.md owns (lines 6–13): "the kimi-webbridge plugin … as primary substrate
documentation; browser inventory + profile surfaces (shape-only census); CDP session
discipline (endpoints, targets, screenshot/DOM evidence capture); interaction records:
site-specific gotchas, rate/rights discipline, login-session handling rules …; dynamic-page
evidence patterns (what to capture so a claim about a page is re-verifiable)". The domain
header (line 3) is "browser & web-interaction craft — driving real browsers against real
sites with evidence discipline".

A bfcache-restore navigation-history note is an evidence-reading pattern for a dynamic page:
it prescribes what to capture/read so a navigation claim stays re-verifiable. It falls under
"CDP session discipline … evidence capture" and "dynamic-page evidence patterns", and in no
refused surface (lines 15–19: forensics, publishing, secrets, consequential actions). The
note body in this lane already uses exactly this scope bucket: `network-evidence-rung.md:4`
and `multi-step-journey.md:4` declare "Scope: PROVINCE.md:9-13 (CDP session discipline;
dynamic-page evidence patterns)". Precedent confirms the bucket covers this class.

## 2. Is it ground the corpus does not already hold? — YES, unheld (negative sweep)

Sweeps run at HEAD (commands below); zero hits for the bfcache vocabulary in corpus,
lessons, SKILL.md, SHONEN.md, LOG.md, SCORECARD.md, scripts:

- `git grep -inE 'bfcache|back-forward|back_forward|history\.back|pageshow|pagehide|bfcached|bf cache|back forward' HEAD -- . ':!corpus/evidence/**'`
  → hits only: `--disable-back-forward-cache` argv in round-17/18/19 probe/receipt JSONs
  (e.g. `.ufo/waves/round-17/probes/invoke-lifecycle.json:6554`), and one negative-scope
  sentence in `.ufo/waves/round-22/w1/RevNative.md:73`: "No claim about other browsers,
  bfcache restore, or cross-origin landing targets". No pageshow/pagehide/history.back
  content anywhere.
- `git grep -inE 'bfcache|back-forward|back_forward|pageshow|pagehide|bfcached' HEAD -- corpus/evidence .ufo/waves/round-24`
  → hits only the same `--disable-back-forward-cache` argv inside receipts
  (e.g. `corpus/evidence/round-17/webmcp-invoke/receipt.json:47`).
- `grep` over `corpus/knowledge/` for `bfcache|back-forward|back_forward|history\.back|pageshow|pagehide` → no matches.
- `grep` over `corpus/lessons/` for the same → no matches.
- `grep` over `corpus/knowledge/` for `S10[45]` → no citations exist.

Two corroborating facts: the lane's own harness has historically **disabled** bfcache
(`--disable-back-forward-cache` in every receipt above), so no prior observation could have
exercised a restore; and the round-22 reviewer explicitly carved bfcache restore out of its
claims. The surface is unheld and was deliberately left unheld until now.

## 3. Nearest existing notes that might cover it, and overlap quotes

No note *holds* the surface; three are adjacent and the entry must explicitly differentiate:

1. **`corpus/knowledge/multi-step-journey.md` §5 (lines 215–219)** — nearest single
   sentence, reads zero network events in a slice:
   > "client shows 200" does not imply "the server sent 200"; a claim of "no wire contact"
   > needs the server log, not the client slice; "no client event in a slice" (step-1-index-idem,
   > step-3-form-filled: 0) does mean no network activity attributable to that step in the record
   > [as-of-capture].
   This is scoped to *network activity in the recorded journey* and never claims zero events
   imply zero navigation. The C3 entry is the precise refinement: a bfcache-served
   `history.back()` step also shows zero client events, yet it IS navigation — so the new
   entry must not contradict this sentence but extend its "absence ≠ event" reading to the
   navigation layer. **Overlap to quote in the entry**: multi-step-journey.md:217–219.
2. **`corpus/knowledge/network-evidence-rung.md` D6 (lines 293–302)** — cache-served
   subresource client events with no wire line; teaches "the body exists ≠ the wire moved
   bytes". Same epistemic family (absence on one layer is not absence of the event), but
   mechanism is HTTP cache on a subresource, not a whole-document restore. Sibling, not
   coverage.
3. **`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` row `na-native-submit`
   (line 35) and §8 rules 3–4 (lines 90–93)** — the closest existing navigation-absence
   teaching:
   > "old-document submit count unavailable after navigation (null, not observed zero)"
   > "Native submit's absence of a submit event is not evidence that no navigation happened."
   Distilled in `SKILL.md:2374` ("old-document submit count can be unavailable (null), not
   observed zero") and echoed in `webmcp-lifecycle-oracle-round-22.md:40` ("old-document
   submits unavailable/null … null-to-empty collapse"). These concern **submit-driven
   navigation and destroyed old documents**; the C3 entry extends the same absence≠negation
   principle to **back/forward traversal** and adds the network-layer wrinkle (no request
   emitted at all). Not the same surface; the entry should cite this lineage when it draws
   the parallel.
4. `multi-step-journey.md` §6 rule 1 (line 234): "Record navigation history per step
   (transitionType …)" — the lane's general navigation-history evidence rule; back/forward
   traversal is the untested transition direction.

## 4. Would an entry clear the QUALITY.md bar? — YES, conditional on two prerequisites

Bar criteria that apply (criterion numbers from `corpus/QUALITY.md`):

- **Falsifiable + anchored (1, 2)**: achievable — the claim is structural and its evidence
  (restore emits no request; live JS state restored; `pageshow` with `persisted=true`)
  is checkable; every claim needs a measured anchor.
- **Source tier (12/15)**: the entry must cite ≥1 opened tier-A/B SOURCES row for its
  scope; tier C never sole support. **Prerequisite 1**: rows **S104/S105 do not exist yet**
  — the registry ends at S103 (`corpus/SOURCES.md:117`). The C3 counter (`git grep -lE
  '^source: S10[45] ' <REV> -- corpus/knowledge | wc -l`) only fires on entries whose
  `source:` line reads exactly `S104`/`S105`; these rows must be opened **this round**
  (access date 2026-10-25, matching S102/S103's precedent), tier A/B, with located quotes
  ≤25 words, before admission. Candidate sources exist (e.g. web.dev/developer.chrome.com
  tier-A docs, MDN tier-B docs, or an HTML-standard session-history section) and none
  duplicates an in-scope URL, so the census duplicate-URL refusal is satisfiable.
- **Quote presence ≠ source identity (38) and digest re-derivation (39)**: the S104/S105
  rows must bind the row URL to the fetched URL with explicit same-source transformations
  and carry raw-fetch sha256; quotes must be re-derived from the retained bytes. This is
  exactly the S102/S103 round-25 row format — feasible.
- **Browser-API observation discipline (23/24)**: if the entry records a runtime restore
  observation, it must name the build, flags and secure-context state, and check spec text
  before naming anything a divergence; hypothesized paths carry the unchecked-hypothesis
  label. **Prerequisite 2**: the lane's harness currently launches with
  `--disable-back-forward-cache` (receipts cited in §2) — a runtime observation of a
  restore is impossible under that flag; the run must drop it (and say so). If the entry is
  documentation-held (like the `accessible-selectors` path, "documentation-held, runtime
  unmeasured"), criterion 23/24's runtime requirements are lighter but the note must say
  runtime unmeasured.
- **No reuse credit for old observations (56)**: critical and favorable — because every
  prior run disabled bfcache, no historical receipt can be recycled as restore evidence;
  the "re-open sources this round" requirement is therefore not a formality but the only
  honest source of evidence. This is consistent with C3's declared design.
- **Navigation-output separation (53)**: complementary, not conflicting — bfcache restore
  is the case where the document is *not* destroyed; missing old-document collections after
  a restore are available, not null. The entry must not blur this with the submit-navigation
  null rule; it can cite it as the contrast.
- **Named error signatures / untested shapes (27, and the note convention)**: the entry
  should end by naming what it does not cover (e.g. cross-origin bfcache eligibility, other
  engines, non-Chromium builds, and the untested `pageshow`-less restore paths).

Kill-rule verdict (claims.json C3): the surface is **not held by an existing note**, so the
entry may be admitted as coverage — C3 is not forced to report a miss. The rule's other
sharp edge is satisfied by design: any quote must come from the bytes fetched this round, and
the duplicated-URL refusal is satisfiable.

## 5. Residual risk and verification gaps

- **S104/S105 dependency**: no row exists yet; if the round fails to open two tier-A/B
  bfcache rows with located quotes this round, the counter stays 0 and admission must stop
  (honest stop per kill rule). This is a sequencing requirement, not a surface defect.
- **Runtime-observation flag hazard**: if the entry is runtime-based, forgetting to drop
  `--disable-back-forward-cache` would make the observation impossible or vacuous; the
  report/receipt must show the effective child line without it.
- **Overlap wording**: the entry must explicitly refine multi-step-journey.md:217–219
  (zero network events in a slice ⇒ zero *network activity*, never zero *navigation*) so
  the two notes read as one lineage, not a contradiction.
- **Unverified here**: I did not fetch any bfcache source bytes (READ-ONLY, no probe
  allowed); the tier A/B existence of a suitable source is a candidate assessment only, to
  be confirmed by the opening seat.

## 6. Recommendation

Admit the surface choice: owned (PROVINCE.md:9–13 bucket), unheld (negative sweep clean),
and clearable against QUALITY.md provided (a) S104/S105 are opened this round with tier-A/B
anchors, digest-bound fetched bytes and ≤25-word located quotes, and (b) any runtime
observation excludes `--disable-back-forward-cache` and names build/flags/secure-context.
Nearest overlap to quote: `multi-step-journey.md:217–219`; sibling lineage: `webmcp-nonautosubmit-round-21-corrected.md:35,90–93` and `SKILL.md:2374`.
