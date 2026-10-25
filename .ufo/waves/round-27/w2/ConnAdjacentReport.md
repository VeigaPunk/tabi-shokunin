# ConnAdjacentReport — Adjacency Narrative & Non-Obvious Move Synthesis

Seat: `TabiR27.ConnAdjacentReport` (UFO-FSD connector, leaf member).  
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.  
Report path: `.ufo/waves/round-27/w2/ConnAdjacentReport.md`.  
Lane baseline: `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (branch `master`).  
Current observed tip: `bceb17dd82446a3b7514dd9759ec733673b4ba0d`.  
Read-only inspection on tracked repository files; no git/jj writes outside scratch fixtures; no tools installed (PACMAN PAUSED, operator 2026-10-19 tooling directive respected).

---

## 1. Declared Axes (Godspeed & Round Context)

From `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/claims.json:10-18`:

| Axis | Score at Round Start | Round 27 Status & Work |
|---|---|---|
| **depth** | 8 | Lowest non-retired axis (tie); targeted by C2 (`check-s106-evidence.mjs` S106 admission) |
| **coverage** | 9 | Targeted by C3 (S107 RFC 9110 redirect & Retry-After semantics admission) |
| **operability** | 8 | Lowest non-retired axis (tie) |
| **freshness** | 8 | Lowest non-retired axis (tie) |
| **calibration** | 9 | Targeted by C1 (`check-selfassessment.mjs` class m1 LOG extension) |
| **adjacency** | 8 | Lowest non-retired axis (tie); evaluated here across sibling lane boundaries |

---

## 2. Adjacency Narrative: Boundary Audits (Report, Never Absorb)

Province discipline: "Out of province → report, never absorb" (`tabi-shokunin/PROVINCE.md:21`).

### (a) Redirect Semantics Entry vs. `kake` (Web Properties & Publishing) Boundary

- **Tabi Province Quotes:**
  - `tabi-shokunin/PROVINCE.md:3-5`:
    > "**Domain:** browser & web-interaction craft (旅, journey) — driving real browsers against real sites with evidence discipline."
  - `tabi-shokunin/PROVINCE.md:6-10`:
    > "**Owns (surfaces):** the kimi-webbridge plugin (`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate documentation; browser inventory + profile surfaces (shape-only census); CDP session discipline (endpoints, targets, screenshot/DOM evidence capture)..."
  - `tabi-shokunin/PROVINCE.md:15-18`:
    > "**Refuses:** reverse engineering as forensics (→ revenger/kaidoku), web *publishing* (→ kake), secrets (→ kagi — session material is shape-only, never content-read)."

- **Kake Province Quotes:**
  - `kake-shokunin/PROVINCE.md:3`:
    > "**Domain:** web properties & publishing — scopes ds4cc.com, kimi.page/pro mirrors, Pages deploys"
  - `kake-shokunin/PROVINCE.md:5`:
    > "**Owns:** the domain knowledge, playbooks, error patterns, and checklists above."
  - `kake-shokunin/PROVINCE.md:6`:
    > "**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it."
  - `kake-shokunin/PROVINCE.md:34-35`:
    > "- `tabi` drives browsers and owns client-side crawler discipline; kake owns publisher-side placement (robots/sitemap at the host it serves)."
  - `kake-shokunin/PROVINCE.md:61-62`:
    > "browser execution stays tabi's adjacent province and publication/account operations stay operator-owned."

- **Analysis:**
  Tabi's newly admitted entry `corpus/knowledge/redirect-and-retry-after-semantics.md` (citing row S107, RFC 9110 §15.4 / §10.2.3) documents client-side user agent navigation rules: intermediate method rewriting (301/302 POST→GET), GET/HEAD retrieval obligations (303), method and body preservation (307/308), and client-side Retry-After delay pacing. Sibling lane `kake` holds row `S088` on RFC 9110 §15.4 for publisher-side URL preflight and link validation (`kake-shokunin/corpus/SOURCES.md:96`), and sibling lane `mori` holds row `S221` on RFC 9110 §15.4 for server-side SSRF redirect probing (`mori-shokunin/corpus/SOURCES.md:227`). Tabi does not configure or audit publisher endpoints, web servers, or Pages deployments (strictly refused per `PROVINCE.md:15`).
- **Adjacency Note:**
  `Adjacency note (kake): No overlap. Tabi owns client-side browser journey navigation, method rewriting (301/302 POST->GET, 303 GET/HEAD, 307 preservation), and Retry-After delay pacing (PROVINCE.md: "browser & web-interaction craft", "CDP session discipline"), refusing "web *publishing* (→ kake)". Kake owns "web properties & publishing" (ds4cc.com, Pages, Render deploys) and publisher-side hosting/redirect rules, explicitly acknowledging that "tabi drives browsers and owns client-side crawler discipline; kake owns publisher-side placement" (kake PROVINCE.md:34). Parallel RFC 9110 §15.4 citations (kake S088 for link preflight, mori S221 for SSRF boundary) are reported as distinct domain applications, never absorbed.`

---

### (b) Report-Contract Utility vs. `kumitate` (Orchestration & Tooling) Territory

- **Tabi Province Quotes:**
  - `tabi-shokunin/PROVINCE.md:3`:
    > "**Domain:** browser & web-interaction craft (旅, journey)..."
  - `tabi-shokunin/PROVINCE.md:21`:
    > "**Out of province → report, never absorb.**"

- **Kumitate Province Quotes:**
  - `kumitate-shokunin/PROVINCE.md:3`:
    > "**Domain:** orchestration & tooling — scopes OMP task/hub, ufo-fsd scripts & runtime"
  - `kumitate-shokunin/PROVINCE.md:5`:
    > "**Owns:** the domain knowledge, playbooks, error patterns, and checklists above."
  - `kumitate-shokunin/PROVINCE.md:6`:
    > "**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it."
  - `kumitate-shokunin/PROVINCE.md:12-15`:
    > "- Origin script layer `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/` — registry rows S1–S8 (`SCORECARD.md` §In-scope surface registry)..."
    > "- Origin runtime layer `/home/vgpnk/Projects/ufo-fsd-alpha/crates/ufo-core-runtime/src/` + `crates/ufo-cli/src/`..."
    > "- The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry)..."

- **Analysis:**
  Tabi's utility `scripts/report-contract.mjs` (landed tracked at tip `bceb17d`, sha256 `b1e296bf…`, 140 lines) validates the six required report sections in order, exact `SHONEN.md` box count parity, and contract path shape. Kumitate owns the origin orchestration tooling for the fleet (`ufo-fsd-alpha/scripts/`). However, `report-contract.mjs` is an intra-lane operational self-check utility:
  1. It is hardcoded to validate `REPORT_RE = /(?:^|\/)\.ufo\/reports\/round-\d+\/tabi\.md$/` (`scripts/report-contract.mjs:99`), refusing all non-tabi reports.
  2. It specifically checks against tabi's local `SHONEN.md` box count (`scripts/report-contract.mjs:146`).
  3. It explicitly guards against the tabi round-25 defect class (`.ufo/waves/` path refusal; `:181-183`).
  Sibling lanes have authored similar local checks (`mado-shokunin` `check-report-shape.py`, `tsukuroi-shokunin` `check-report-receipts.py`, `kumitate-shokunin` wave script `13-report-contract-check.command.txt`). Tabi's utility is not a general fleet harness gate, does not touch `ufo-fsd-alpha`, and is run manually before hand-off (`ExecReportContract.md:3-5`).
- **Adjacency Note:**
  `Adjacency note (kumitate): No overlap. Kumitate owns fleet orchestration and tooling across "/home/vgpnk/Projects/ufo-fsd-alpha/scripts/" and OMP task/hub runtime (kumitate PROVINCE.md:3,12). Tabi's "scripts/report-contract.mjs" is a lane-local, zero-dependency manual preflight utility hardcoded to check ".ufo/reports/round-<N>/tabi.md" and local "SHONEN.md" box parity to catch the round-25 wrong-path defect class. It does not govern fleet orchestration or ufo-fsd runtime. If the report contract is ever elevated to an automated fleet-wide harness gate, ownership transfers to kumitate; in round 27 it remains lane-local tooling, reported never exported.`

---

### (c) Decoded-Source Convention vs. `revenger` (Reverse Engineering)

- **Tabi Province Quotes:**
  - `tabi-shokunin/PROVINCE.md:15`:
    > "**Refuses:** reverse engineering as forensics (→ revenger/kaidoku), web *publishing* (→ kake)..."

- **Revenger Province Quotes:**
  - `revenger-shokunin/PROVINCE.md:3-7`:
    > "Owns: reverse engineering of shipped artifacts — native binaries, managed assemblies, Electron/JavaScript packages, Android APKs, archives, firmware, browser/Electron runtime evidence — using the REA skill and its toolset, with an evidence-ledger discipline: every conclusion separates observation, inference, and unknown, and cites Evidence IDs."
  - `revenger-shokunin/PROVINCE.md:19-23`:
    > "Refuses: live-target execution beyond the declared target and lifecycle (REA runtime discipline); DRM circumvention or piracy facilitation; publishing reversed code; asset rights claims (art-east-asian-design); harness/evidence auditing (harness-integrity, gate-evidence, rlm-dispatch); game mechanics verification (game-dev-2d); narrative canon (lore)."

- **Analysis:**
  Tabi's C2 claim landed an evidence receipt (`corpus/evidence/round-26/sources/s106.json`), a gate (`scripts/check-s106-evidence.mjs`), and QUALITY criterion 67 governing googlesource `?format=TEXT` source rows. When Gitiles serves a source file with `?format=TEXT`, it returns the plain text file base64-encoded over HTTP. In round 25, the spotcheck reviewer failed to decode this transfer, filing closure defect 4 ("S106 exact source line was not recoverable through independent source reopen").
  Decoding an HTTP transport representation (base64 transfer encoding) of open-source Chromium C++ code (`content-features-154.0.8037.97.cc`) to verify a feature flag definition (`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`) is transport-layer evidence normalization and source curation for browser feature verification. It is neither binary decompilation, assembly analysis, nor executable artifact forensics. Furthermore, `revenger` explicitly refuses "harness/evidence auditing" (`revenger-shokunin/PROVINCE.md:22`).
- **Adjacency Note:**
  `Adjacency note (revenger): No overlap. Revenger owns "reverse engineering of shipped artifacts — native binaries, managed assemblies, Electron/JavaScript packages, Android APKs, archives, firmware" (revenger PROVINCE.md:3-5) and explicitly refuses "harness/evidence auditing" (line 22). Tabi refuses "reverse engineering as forensics (→ revenger/kaidoku)" (tabi PROVINCE.md:15). Decoding a base64 transfer encoding (?format=TEXT) from a public Chromium Gitiles source repository to recover C++ source text for feature flag verification (BASE_FEATURE(kBackForwardCache)) is transport-layer evidence normalization of open-source Chromium source code for browser flag verification, not reverse engineering or forensics.`

---

## 3. Non-Obvious Move: Bounded UFO-FSD Synthesis Across Proposals

### 3.1 Evidence & Second-Order Contradictions Across Proposals
1. **Adjacency & Evidence Normalization (C2 & Revenger):**
   - Wave-2 attack `ExecFreshAttack2.md:58-76` discovered three defects in `check-s106-evidence.mjs`:
     a. **Trim-equality indentation mask:** `lines[line-1].trim() === text.trim()` allows indented lines to match unindented receipt anchors and vice-versa, losing whitespace fidelity.
     b. **Unpinned anchor content:** Combined with `w1/RevC2Gate.md` (M1), the gate enforces only internal consistency between receipt and bytes, accepting fabricated anchors.
     c. **Uppercase hex refusal:** Comparing sha256 digests via strict case-sensitive equality (`:120`) exits 1 on valid uppercase hex digests.
     d. **Encoded digest unread:** `ScribeQuality67.md:150-158` (F5) confirmed that `encoded_sha256` has zero readers in `scripts/`.
2. **Redirect Surface & Boundary Discipline (C3, Kake, Mori):**
   - `ConnRedirectSurface.md:199-203` and `ConnSiblingOverlap.md:117-120` demonstrated that while RFC 9110 §15.4 defines redirect semantics, automated journey drivers lack protocol guards for silent 301/302 POST→GET method rewrites and cross-origin 307/308 POST body retransmissions.
   - `ExecC3Recount.md:72-88` and `CritC3Junk.md:1-15` demonstrated that the frozen kill rule's "quote absence" is undefined without explicit whitespace normalization, and current gates do not mechanically verify quoted anchor normalization.
3. **Report Contract & Fleet Tooling (Kumitate):**
   - `SentReportPath.md:16-27` and `ExecReportContract.md:9-41` verified that `report-contract.mjs` prevents the round-25 defect class, but `ScribeQuality67.md:133-138` (F3) proved that section multiplicity is only enforced for `## SHONEN`.

### 3.2 Affected Axes
- **adjacency**: **Improves from 8 toward 9.** Establishes explicit domain scope declarations in `SOURCES.md` that resolve overlap across `kake`, `mori`, and `revenger`, and defines a clean upstreaming path for `report-contract.mjs` to `kumitate`.
- **depth**: **Improves from 8 toward 9.** Bridges the gap between spec vocabulary and CDP runtime verification by defining untrimmed-anchor verification and redirect method/origin guards.
- **coverage / operability / freshness / calibration**: **Maintained at 9 / 8 / 8 / 9** (unharmed; no counter or kill rule altered).

### 3.3 Proposed Move (One Bounded Proposal)
**Synthesize the "Province-Bound Scope Matrix & Untrimmed Evidence Anchor Guard":**

1. **Registry Adjacency Scope Marker (Contract Surface):**
   In the next coverage round, require that any `spec`-tier row in `corpus/SOURCES.md` citing a specification held by multiple sibling lanes (e.g. RFC 9110 held by `tabi` S107, `kake` S088, and `mori` S221) must include an explicit `province-boundary:` token in its `notes` or `scope` cell:
   - For Tabi: `province-boundary: client-browser journey navigation, method rewriting, and 3xx Retry-After pacing (refuses web publishing and server probe routing)`.
   - This prevents future cross-lane claim collisions and mechanically enforces the "report, never absorb" contract.
2. **Untrimmed Anchor & Case-Insensitive Digest Guard (Depth & Verification Surface):**
   In the next depth round (advancing beyond frozen C2), update `scripts/check-s106-evidence.mjs` to resolve the vulnerabilities proved by `ExecFreshAttack2`:
   - Replace `lines[line-1].trim() === text.trim()` with untrimmed line equality `lines[line-1] === text`, asserting exact indentation fidelity.
   - Normalize hex digests with `.toLowerCase()` prior to comparison (`digest.toLowerCase() === receipt.decoded_sha256.toLowerCase()`), eliminating false rejections on valid uppercase hex notation.
   - Add a reader for `encoded_sha256` that checks `crypto.createHash('sha256').update(base64Payload).digest('hex')` to close the vacuity gap noted in `ScribeQuality67.md` F5.
3. **Fleet Tooling Export Handoff (Kumitate Substrate Surface):**
   Formally file `scripts/report-contract.mjs` in the round-27 report as a candidate export for `kumitate` (`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/`). If `kumitate` standardizes a fleet-wide report preflight gate in `ufo-core-runtime` or `ufo-cli`, tabi will retire its local script and adopt the fleet harness check, maintaining minimal intra-lane tooling footprint.

### 3.4 Risks & Mitigations
- *Risk:* Breaking existing S106 fixtures if whitespace is modified.  
  *Mitigation:* As measured by `ExecFreshAttack2` (case 0 / clean), the authentic committed S106 line 187 is completely unindented (`BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`), exactly matching the receipt text. Untrimmed equality passes the authentic tip.
- *Risk:* Over-constraining shared spec rows across lanes.  
  *Mitigation:* The `province-boundary` token is informational in the `scope`/`notes` column, requiring no schema changes in `sources-census.sh`.

### 3.5 Verification
1. **Adjacency Separation Verification:**
   - Execute: `grep -rn 'RFC 9110' /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`
   - Confirm that S107 (tabi), S088 (kake), and S221 (mori) each define distinct domain scopes without overlapping verification claims.
2. **Evidence Anchor Verification:**
   - Execute: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-s106-evidence.mjs --rev 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0 --json`
   - Observe `valid: true`, `byte_count_match: true`, `anchor_located: true`.
3. **Report Contract Verification:**
   - Execute: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md`
   - Observe exit 0: `PASS ... 6/6 sections in order; SHONEN 4/4 boxes`.

---

## 4. Evidence Classification & Negative Sweeps

- **Observed:**
  - `git rev-parse HEAD` on `tabi-shokunin` → `bceb17dd82446a3b7514dd9759ec733673b4ba0d`.
  - Exact quotes from `tabi-shokunin/PROVINCE.md`, `kake-shokunin/PROVINCE.md`, `kumitate-shokunin/PROVINCE.md`, and `revenger-shokunin/PROVINCE.md`.
  - `git grep -c 'encoded_sha256' -- scripts/` → 0 matches (confirmed no reader in scripts).
- **Negative Sweeps:**
  - Sweep for RFC 9110 in other sibling lanes (`revenger`, `kumitate`, `kaidoku`, `kotodama`): 0 rows found.
  - Sweep for `format=TEXT` in sibling `SOURCES.md`: 0 rows outside `tabi-shokunin`.
  - Sweep for tracked modifications: `git status --porcelain` showed no tracked file edits.
- **Inference:**
  - The convergence between Tabi and Mado on the six-section report contract reflects an organic multi-lane need for pre-commit report validation that Kumitate can unify upstream.

---

## 5. Tooling Directive Compliance

- Operator directive (2026-10-19) respected: No tools installed or upgraded.
- PACMAN PAUSED rule strictly observed: zero pacman / system package calls.
- All inspections conducted with standard read-only coreutils and git commands.
