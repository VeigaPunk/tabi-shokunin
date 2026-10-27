# ScoutAssim — assimilation survey (§10), tabi round 36 w1

## Axis check of the staged merge package (corpus-expansion-1)

Source: `/home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.md` (read-only; nothing written there).
Staged: 148 proposed rows (all accepted, 0 refused), 86 proposed knowledge entries, rounds 1-16, ids S102-S248 continuing the lane's 101-row registry.

Themes across the 86 staged entries (every title in the report's knowledge table):
- WebMCP surface/version/contract (r1-r16): tool listing paths, version floor, argument contract, declarative surface, origin-trial token mechanics, DevTools agent surface, CDP domain commands
- CDP transport / support posture (r1), extension-native-host & webbridge daemon handshake (r2-r4)
- Agent surface category gating, approval handshake/hints, element identification, journey determinism, error recovery (r1-r5)
- SameSite / cookie prefix rules (r2-r8, r11)
- Redirect / Retry-After semantics and measured rewrites (r2-r9)
- Host rate-limit signal vocabulary/classes/measured postures (r1-r8)
- Eastern-language measurement provenance (r7, r12-r13)

Axis (a) — sibling adjacency map / browser-ground overlap (`corpus/adjacency.tsv`, `corpus/adjacency-screen-*.tsv`, C1's surface): **no staged theme or entry touches it.** Zero occurrences of "adjacency" or "sibling" in the report; every staged row is external-source WebMCP/cookie/redirect/rate-limit material, not fleet sibling-overlap screening.

Axis (b) — Firefox / WebDriver BiDi / browser automation runtime evidence (C2's surface, `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`): **no staged theme or entry touches it.** Zero occurrences of "firefox", "bidi", or "webdriver" in the report. The staged browser-automation material is Chromium/CDP/WebMCP-side; nothing re-grounds the Firefox BiDi runtime evidence or its receipts. (The round-35→36 `webdriver-bidi-runtime-firefox` capability row in claims.json is the lane's own record, not staged content.)

**Assimilation: none** for round 36. No theme fits either axis, so no entries are nominated and no re-grounding is required. The round-22 adoption posture stays apt: quarantine-first, verdicts only.

## Quarantine slice re-derivation (§10)

Register: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
Register sha256 at survey time: `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` — **unchanged** from the digest recorded in `.ufo/waves/round-22/assimilation/quarantine-verdicts.json` (same hash).

Slice rule (prompt §10): lane cell `tabi`, data rows carrying a round cell and an S-id. Result: **38 rows**, matching the count recorded in rounds 22-23.

- 37 rows class `payload-absent` (lines 178-214; the report's own lane-totals table also records `tabi` = 37)
- 1 row class `unreachable` — `tabi | round5 | S171` (chromestatus.com/features/5117755740913664 could not be fetched; the unreachable table's id cell carries a trailing backtick, which is why a strict `| S<digits> |` pattern alone yields 37 — the §10 rule says rows with a round cell and an S-id, which includes S171)
- Rounds 22-23 record: `.ufo/waves/round-22/assimilation/quarantine-verdicts.json` — rows 38, summary `absent-refused: 37, unverifiable-unreachable: 1`, identical S-id set. **Match confirmed.**

S-ids (38, by round):
- round1 (8): S102, S106, S109, S110, S111, S114, S117, S118
- round2 (11): S124, S125, S126, S130, S131, S133, S134, S135, S137, S138, S140
- round3 (9): S142, S143, S144, S145, S147, S148, S149, S153, S154
- round4 (6): S158, S163, S164, S165, S166, S167
- round5 (4): S171 (unreachable), S174, S175, S176

Count check: 8 + 11 + 9 + 6 + 4 = 38.

## Claims cross-read

Neither frozen claim's surface is touched by the staged package: C1's adjacency screen/drift ledgers are fleet-internal screening artifacts, and C2's Firefox-BiDi runtime evidence stands outside the staged Chromium/WebMCP themes. `Assimilation: none` implies no w1 build work from this survey and no interference with either predicate.

Tooling installs: none (no tool needed installing; only read/grep/awk/sha256sum on host).

VERDICT ok assimilation none; quarantine slice re-derived at 38 rows (37 payload-absent + 1 unreachable S171), S-ids match rounds 22-23 record; register digest unchanged 5afe1810…
