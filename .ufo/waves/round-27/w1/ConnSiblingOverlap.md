# ConnSiblingOverlap — Sibling-Overlap Scan & Non-Obvious Move Synthesis

Seat: `ConnSiblingOverlap` (leaf member, UFO-FSD connector).  
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.  
Report path: `.ufo/waves/round-27/w1/ConnSiblingOverlap.md`.  
Target revision / baseline: `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (branch master).  
Read-only inspection; no tracked files modified. Tooling authorization respected (no tools installed, PACMAN GUARD observed).

---

## 1. Declared Axes (Godspeed & Round Context)

From `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/claims.json:10-18`:
- **depth**: 8 (lowest non-retired axis; worked by C2 via `check-s106-evidence.mjs`)
- **coverage**: 9 (worked by C3 via redirect/Retry-After entry + S107 row)
- **operability**: 8 (lowest non-retired axis tie)
- **freshness**: 8 (lowest non-retired axis tie)
- **calibration**: 9 (worked by C1 via `check-selfassessment.mjs` class m1 LOG extension)
- **adjacency**: 8 (lowest non-retired axis tie; evaluated here across sibling lanes)

---

## 2. Sibling-Overlap Scan (Report, Never Absorb)

Evidence discipline applied: exact commands, exit codes, file paths, line numbers, and quotes (<=25 words).

### (a) Calibration Counter Window (LOG.md & SCORECARD.md)
**Command:**
```bash
grep -rE 'check-selfassessment|selfassessment' --include='SCORECARD.md' --include='LOG.md' -l /home/vgpnk/Projects/shokunin/*-shokunin/ 2>/dev/null
```
**Observation:**
Only `/home/vgpnk/Projects/shokunin/tabi-shokunin/LOG.md` and `tabi-shokunin/SCORECARD.md` match (plus tabi scratch clones). Zero matches in any sibling lane.
- Extended check across sibling scripts: `find /home/vgpnk/Projects/shokunin/*-shokunin/scripts/ -type f \( -name '*self*' -o -name '*assess*' -o -name '*calib*' \)` returned only `tabi-shokunin/scripts/check-selfassessment.mjs` and `kake-shokunin/scripts/*_selftest.py` (which test internal parsers, not self-assessment tallies).
- Other lanes maintain calibration checkers (e.g. `tsukuroi-shokunin/tools/check-self-assessment.py`, `tameshi-shokunin/.ufo/evidence/round-41/calibration/measure.py`), but none extend checking to a `LOG.md` round-entries window comparing gate self-test tallies against measured gate oracles.
- In `tameshi-shokunin/.ufo/waves/round-42/w1/ConnectorSibling.md:55,138`, tameshi reviewed tabi's `scripts/check-selfassessment.mjs` and concluded against absorbing it.

**Adjacency Narrative Recommendation:**
Tabi should report that its LOG-window calibration counter (`check-selfassessment.mjs` class m1) is unique across the fleet. Do not absorb sibling checkers.

---

### (b) RFC 9110 & Redirect-Semantics Rows
**Command:**
```bash
grep -rnE 'rfc9110|rfc-editor\.org/rfc/rfc9110' /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md
```
**Observation:**
Matches found across 4 lanes (8 lines total):
1. `/home/vgpnk/Projects/shokunin/chousa-shokunin/corpus/SOURCES.md:71` (row `S061`):
   - URL: `https://www.rfc-editor.org/rfc/rfc9110.txt`
   - Scope: §15.5.5 "404 Not Found" and §15.5.11 "410 Gone"; plain text sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` (identical byte sha256 to tabi's S107).
   - Domain: Origin-server availability semantics vs local-copy rules.
2. `/home/vgpnk/Projects/shokunin/kake-shokunin/corpus/SOURCES.md`:
   - Line 18 (`S010`): §8.8 (entity tags / ETag).
   - Line 36 (`S028`): §4.2.1/4.2.2 (URI schemes http/https; sha256 `21c1cdce…7232a`).
   - Line 41 (`S033`): §8.3/5.6 (Media types).
   - Line 96 (`S088`): `https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4` — §15.4 Redirection, §10.2.2 Location, §15.5.5 404, §15.5.11 410. Used by `scripts/source_recheck.py` for static site crawler link preflight.
3. `/home/vgpnk/Projects/shokunin/mori-shokunin/corpus/SOURCES.md`:
   - Line 48 (`S042`): `https://www.rfc-editor.org/rfc/rfc9110#section-10.2.3` — `Retry-After` response-header semantics (queued).
   - Line 227 (`S221`): `https://www.rfc-editor.org/rfc/rfc9110.txt` — §15.4:7230-7252 (3xx redirection class and Location-header redirect). Used by `corpus/knowledge/source-drift-hardening-r37.md` for SSRF follow-redirect byte probing.
4. `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md:121` (`S107`):
   - URL: `https://www.rfc-editor.org/rfc/rfc9110.txt` (502941 B, sha256 `21c1cdce…47232a`).
   - Scope: §15.4, §15.4.2–15.4.4, §15.4.8–15.4.9, §10.2.3 for browser journey driver redirect navigation and method rewriting.
5. Other named lanes (`kumitate`, `kaidoku`, `revenger`, `kotodama`):
   - No RFC 9110 rows. `kumitate` holds RFC 3339/8785; `kaidoku` holds RFC 8259; `revenger` holds RFC 3227.

**Adjacency Narrative Recommendation:**
Tabi should explicitly disclose this overlap: `kake` (`S088`) and `mori` (`S221`, `S042`) already hold rows on RFC 9110 §15.4 and §10.2.3. Tabi's S107 is not duplicate absorption: it is re-grounded independently on fresh bytes specifically for journey-driver method-rewriting semantics (301/302 POST->GET, 303 GET/HEAD, 307 preservation), whereas kake uses S088 for static URL recheck preflight and mori uses S221 for SSRF probe boundaries. Tabi reports the convergence in adjacency, absorbing nothing from sibling registries.

---

### (c) Decoded-Source-Bytes Convention (`format=TEXT`)
**Command:**
```bash
grep -rn 'format=TEXT' /home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md
```
**Observation:**
- In `SOURCES.md`: matches ONLY in `tabi-shokunin/corpus/SOURCES.md` (14 rows, including S106).
- In `QUALITY.md`: ONLY `tabi-shokunin/corpus/QUALITY.md:360-363` codifies criterion 67:
  > "67. A googlesource `?format=TEXT` source is not admitted until its base64 transfer has been decoded and the decoded bytes are committed as lane evidence..."
- Sibling occurrences outside SOURCES.md:
  - `revenger-shokunin` (round 65) decoded `ResourceTypes.h?format=TEXT` in `.ufo/waves/round-65/source-snapshots/` and noted it in `R65SnapshotManifest.md:17`.
  - `kama-shokunin` (round 21/22) decoded `hash.go?format=TEXT` via a scratch curl-to-base64 pipeline.
  - `kaidoku-shokunin` (round 17) noted base64 transfer in a scout note.
- Key Distinction: No sibling lane formalized a committed evidence receipt schema (`corpus/evidence/.../s106.json`), an automated gate (`scripts/check-s106-evidence.mjs`), and a standing QUALITY criterion.

**Adjacency Narrative Recommendation:**
The S106 decoded-evidence admission gate and receipt convention is **unique to tabi**. Tabi should report this mechanism as a candidate export pattern for siblings handling `?format=TEXT` googlesource blobs, while absorbing nothing.

---

### (d) Report-Contract Utilities
**Command:**
```bash
find /home/vgpnk/Projects/shokunin/*-shokunin/ -type f \( -name '*report-contract*' -o -name '*check-report*' -o -name '*check_report*' \) 2>/dev/null
```
**Hits Identified:**
1. `/home/vgpnk/Projects/shokunin/mado-shokunin/.ufo/waves/round-35/scratch-evidence/RevReportShape/check-report-shape.py`:
   - Validates the identical six `##` sections in order (`Work performed`, `Landed changes`, `Before -> after measurements`, `Sources & frontier`, `Trend verdicts`, `SHONEN`).
   - Also checks watchdog conformance, minimum 400 bytes, placeholder tokens, and evidence pointers.
2. `/home/vgpnk/Projects/shokunin/tsukuroi-shokunin/tools/check-report-receipts.py`:
   - Validates that revision-cited report gate outcomes have committed receipts in the repository snapshot.
3. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ScoutS124/13-report-contract-check.command.txt`:
   - A wave-level script checking required contract strings in seat reports.
4. `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/report-contract.mjs`:
   - Zero-dependency Node.js utility enforcing the round report contract: six `##` sections in order, exact SHONEN box count match against `SHONEN.md`, and strict path format (`.ufo/reports/round-<N>/tabi.md` refusing `.ufo/waves/` to catch the round-25 defect).

**Adjacency Narrative Recommendation:**
Tabi and `mado` independently converged on automating the exact six-section report contract. Tabi should report this convergence in its adjacency narrative. Tabi should **never absorb** `mado`'s Python script or watchdog dependencies, as tabi's `report-contract.mjs` is purpose-built in native Node.js and uniquely enforces the round-25 path location check and `SHONEN.md` box count parity.

---

## 3. Non-Obvious Move: Bounded UFO-FSD Synthesis

### Evidence & Synthesis Across Round Proposals
- `SimplifyEvidence.md` validates that `rfc9110.txt` (502,941 B) provides offline self-contained re-derivability for all S107 line anchors, but notes that C3's counting command is junk-blind.
- `CritC3Junk.md` proves via temporary git fixture that a zero-content entry with no quotes or locations satisfies `git grep -lE '^source: S107 '` and `scripts/check-sources.mjs:232`.
- `ConnRedirectSurface.md` synthesizes loopback measurements with RFC 9110, discovering that automated journey runners lack protocol guards for silent 301/302 POST->GET method rewrites and cross-origin 307 body retransmissions.
- `ScribeQuality67.md` and `ExecReportContract.md` show the value of mechanical gates over prose rules.

### Affected Axes
- **depth**: Improves from 8 toward 9 (advances journey driver protocol verification from unclassified loopback traversals to RFC-grounded invariant enforcement).
- **coverage**: Preserved at 9.
- **operability / freshness / calibration / adjacency**: Preserved (all >= 8; no regressions).

### Proposed Move
**Synthesize a Dual-Boundary Redirect Verification Harness for Journey Drivers:**
1. **Contract/Verification Surface:** Extend `scripts/check-sources.mjs` (or introduce a light preflight check) with an entry-quote locator rule: require any markdown entry citing a `spec`-tier source row with line anchors to locate its cited quotes in the committed evidence file (`.ufo/waves/round-27/assimilation/rfc9110.txt`). This closes the junk-entry vulnerability discovered by `CritC3Junk` without altering frozen C3 counters.
2. **Runtime Surface (Journey Invariants):** In the next depth round, codify two journey-driver invariants from `ConnRedirectSurface.md` into loopback tests:
   - *Invariant 1:* Trip a warning/verdict `method-rewritten(301/302)` if a state-changing POST request receives a 301/302 redirect resulting in a GET.
   - *Invariant 2:* Trip an autonomous stop-and-report predicate if a 307/308 redirect targets an origin different from the initial POST origin, preventing inadvertent cross-origin body retransmission.

### Risks & Mitigations
- *Risk:* Over-constraining GET redirections (e.g., trailing slash normalization).  
  *Mitigation:* Restrict Invariant 1 strictly to state-changing methods (POST/PUT/DELETE); leave GET/HEAD unconstrained.
- *Risk:* Verification overhead for large spec files.  
  *Mitigation:* Quote checks only inspect lines cited in the SOURCES row anchor cell, which are already bounded (<=25 words, line numbers given).

### Verification
- Verify against loopback server fixtures in `external-class-fixture-v2.md` (`ThreadingHTTPServer` on `127.0.0.1:19541` and `19543`).
- Re-run `node scripts/check-selfassessment.mjs --selftest` (17 cases pass) and `node scripts/check-s106-evidence.mjs --selftest` (4 cases pass).

---

## 4. Verification & State Inspection
- Report written strictly to designated leaf path: `.ufo/waves/round-27/w1/ConnSiblingOverlap.md`.
- No tracked repository files were modified (`git status --porcelain` shows only pre-existing L1 / sibling changes).
- All searches conducted read-only across `/home/vgpnk/Projects/shokunin/*-shokunin/`.
