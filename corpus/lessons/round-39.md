# Round 39 — lesson

## Gate

- **Admit S145 (lane source; package adoption none)** — https://man7.org/linux/man-pages/man5/proc_pid_net.5.html, accessed 2026-10-27. Located quote, `proc_pid_net(5)`, DESCRIPTION `/proc/net/tcp`: “the `rem_address` is the remote address and port number pair (if connected)” (11 words). The lane entry `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` cites the row and narrows the claim to TCP tables.
- **Admit as a verified-source candidate, not as an adopted package row: quarantined S110** — https://www.rfc-editor.org/rfc/rfc6585.txt, accessed 2026-10-27. Located quote, §4 “429 Too Many Requests”: “The 429 status code indicates that the user has sent too many requests in a given amount of time (\"rate limiting\").” (21 words). The source quote is present; no package row/knowledge payload was appended because the quarantine-first adoption gate remains closed.
- **Reject as unreachable / unverifiable, not fabrication: quarantined S171** — https://chromestatus.com/features/5117755740913664, fetched by ScoutQuarantine08 with HTTP 404 / 207-byte body; no quote was checked. Flip: the cited source becomes reachable and the exact row quote can be located.
- Outside non-author admit/reject spot-check: **pending**. The 64 dispatched seats are lane-authored and do not qualify.

### Quarantine slice verdicts (register order)

| Staged id | Round-39 hand-check status | Evidence / limit |
|---|---|---|
| S102 | unverified | ScoutQuarantine01 tested a “Last updated” phrase that does not match the staged row's cited anchor; row/source identity not established. |
| S106 | unverified | ScoutQuarantine01 tested Chinese WebMCP phrases against the RFC 9309 row; the tested quote does not match the row. |
| S109 | unverified | ScoutQuarantine01 tested a 429 phrase against a WebMCP tool-reference row; row/quote mismatch. |
| S110 | present; eligible candidate only | L1 reopened RFC 6585 §4 and located the 429 quote above; package row still quarantined. |
| S111 | partial / unverifiable | ScoutQuarantine01 fetched the secure-tools page but its exact-language/anchor checks did not establish the staged row's full quote. |
| S114 | unverified | No row-aligned lane-local source verdict. |
| S117 | absent in fetched view (provisional) | ScoutQuarantine02 reported the cited quote absent; retain the report's source-view limit. |
| S118 | partial / unverifiable | ScoutQuarantine02 reported only abstract-level evidence; full cited quote/anchor not established. |
| S124 | unverified | No row-aligned lane-local source verdict. |
| S125 | unverified | No row-aligned lane-local source verdict. |
| S126 | absent (provisional) | ScoutQuarantine03 reports the quoted rate-limit claim absent from the fetched source. |
| S130 | absent (provisional) | ScoutQuarantine03 reports the quoted test claim absent from the fetched source. |
| S131 | present (provisional) | ScoutQuarantine03 reports the quote present in the fetched source. |
| S133 | absent (provisional) | ScoutQuarantine03 reports the quoted eval claim absent from the fetched source. |
| S134 | absent (provisional) | ScoutQuarantine03 reports the quoted permission/security claim absent from the fetched source. |
| S135 | not accepted as lane evidence | ScoutQuarantine04 reports a source check, but wrote its report under the read-only shokuknow checkout; no lane copy/adoption made. |
| S137 | not accepted as lane evidence | Same ScoutQuarantine04 source-repo write-scope violation; no lane copy/adoption made. |
| S138 | not accepted as lane evidence | Same ScoutQuarantine04 source-repo write-scope violation; no lane copy/adoption made. |
| S140 | not accepted as lane evidence | Same ScoutQuarantine04 source-repo write-scope violation; no lane copy/adoption made. |
| S142 | not accepted as lane evidence | Same ScoutQuarantine04 source-repo write-scope violation; no lane copy/adoption made. |
| S143 | unverified | ScoutQuarantine05 aborted before source checks; no report/quote evidence. |
| S144 | unverified | ScoutQuarantine05 aborted before source checks; no report/quote evidence. |
| S145 (quarantine namespace) | unverified | ScoutQuarantine05 aborted. This staged id denotes the SameSite draft; lane-registry S145 is the distinct proc_pid_net(5) row above. |
| S147 | unverified | ScoutQuarantine05 aborted before source checks; no report/quote evidence. |
| S148 | unverified | ScoutQuarantine05 aborted before source checks; no report/quote evidence. |
| S149 | unverified | ScoutQuarantine06 tested daemon/status phrases that do not match the robots.txt row's source claim. |
| S153 | unverified | ScoutQuarantine06 tested Chinese WebMCP strings against the agentic-JavaScript guide; row/quote identity unresolved. |
| S154 | partial / unverifiable | ScoutQuarantine06 found a related Chrome-153 phrase but not the staged API-symbol quote/anchor. |
| S158 | unverified | ScoutQuarantine06 tested a rate-limit-policy phrase against a WebMCP implementation row; row/quote mismatch. |
| S163 | partial / unverifiable | ScoutQuarantine06 found a related heading but not the full staged claim/anchor. |
| S164 | partial / unverifiable | ScoutQuarantine07 found a generic “With the extension” phrase, not the staged source's complete substantive claim. |
| S165 | absent (provisional) | ScoutQuarantine07 reports its searched quote fragment absent from the fetched representation. |
| S166 | absent (provisional) | ScoutQuarantine07 reports its searched API symbol absent from the fetched source. |
| S167 | absent (provisional) | ScoutQuarantine07 reports its searched phrase absent from the fetched source. |
| S174 | absent (provisional) | ScoutQuarantine07 reports its searched phrase absent from the fetched source. |
| S175 | partial / present | ScoutQuarantine08 located one cited sentence; the second asserted quote was not verified. |
| S176 | absent (provisional) | ScoutQuarantine08 fetched the source but did not find the listed phrases. |
| S171 | unreachable (not fabrication) | ScoutQuarantine08 received HTTP 404; the register itself labels the family “could not be fetched, so no quote was checked.” |

The complete register slice was re-derived as 38 rows: 37 `payload-absent` + 1 `unreachable` (S171); see `.ufo/waves/round-39/assimilation/quarantine-slice` and `.ufo/waves/round-39/w1/ExecQuarantineSlice/report.md`. The scout partition did not yield a complete, row-aligned, lane-local source check: five checks (S135/S137/S138/S140/S142) were written by a seat into the read-only shokuknow checkout, and eight IDs (S114/S124/S125/S143/S144/quarantine-S145/S147/S148) have no source verdict. All package adoption remains closed; the partial list is not a pass.

## Mistakes

- **M1, class `number-drift` — `/proc` loopback parser used the wrong hex byte order.** Evidence: `.ufo/waves/round-39/measure/proc-endian-before.json` recorded 12 false non-loopback observations for a loopback `0100007F:8AEF` peer while `ss` recorded 0; `.ufo/waves/round-39/measure/proc-endian-raw-row.txt` records the raw peer; after decoding each 32-bit word little-endian, `proc-endian-after.json` reports 0 on both surfaces. Captured-by: `corpus/QUALITY.md:696-702` required socket observations, and the driver's dual-view disagreement was the detector; it did not previously require an endianness vector. Fix: decode the `/proc` words before checking 127/8 and retain the red→green receipts; QUALITY criteria 102 records the new guard.
- **M2, class `stale-premise` — C2 D6 freezes a receipt-at-REV rule that cannot be committed at the revision it must name.** Evidence: `.ufo/waves/round-39/measure/c2-self-reference-probe.txt` records candidate `03322e9d…` → receipt carrier `5c13c846…`; adding `numstat-at-03322e9d.txt` changed the commit and the frozen counter then expected a new filename. Captured-by: none; the pre-data controls did not test receipt/REV self-reference. Fix for a future freeze: define a pre-receipt input REV and a distinct committed evidence-carrier revision, or otherwise remove the self-reference before freezing. This round's frozen claim/counter were not amended after dispatch; C2 is reported not met. QUALITY criterion 103 records the guard.
- **M3, class `number-drift` — prior quarantine class summary omitted the unreachable row.** Evidence: `corpus/lessons/round-37-verifier-spotcheck.md` states “all `payload-absent`”; this round's full extraction and S171 cell show 37 payload-absent + 1 unreachable. Captured-by: none; the row-class summary was not re-derived from the data cell. Fix: retain the exact 37/1 class split in this lesson and never turn the S171 prose class into a fabrication verdict.
- **M4, class `scope` — a quarantine seat wrote its report under the read-only source checkout.** Evidence: `w1-results.json` names `/home/vgpnk/Projects/shokuknow/tabi-shokunin/.ufo/waves/round-39/w1/ScoutQuarantine04/report.md`; I read but did not modify/delete that source-repo artifact. Captured-by: round-39 §6.10 source-repo read-only boundary and the wave's absolute `Report:` rule. Fix this round: no further source-tree writes; exclude that misrooted report from lane-owned evidence and keep package adoption closed.

## Census

Round-start command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` — exit 0; `tabi ok`, 20 W04 duplicate-URL warnings; output `.ufo/waves/round-39/measure/census-start.txt`. Manual count at baseline `5bc56a81d196caeb8d24551928b883802697aabb`: rows 144; A128/B7/C9; mined120/queued15/rejected9 (`census-start-counts.txt`).
Round-end command: same command — exit 0; `tabi ok`, 20 W04 warnings; output `.ufo/waves/round-39/measure/census-end.txt`. Final registry count: 145 rows; A129/B7/C9; mined121/queued15/rejected9.

## Assimilation and frontier

Assimilation: none from `merge/tabi/`; no staged row or knowledge payload was appended. The 38-row quarantine is still open for the rows marked unverified/partial above. No `considerthese/` directory exists. S145 is the only new lane row, opened this round, and is cited by the new knowledge entry.

Collision guard: before the S145 lane append, current registry IDs numbered 144 (S001–S144), staged package IDs 148 (S102–S249), intersection 43 (S102–S144); the exact lists are `.ufo/waves/round-39/assimilation/reg-ids`, `staged-ids`, and `collisions`. The synthetic two-space `S145` registry row produced `indented-collisions` containing S145. No package IDs were adopted, so no renumber map was applied; the staged package's S145 (SameSite) and lane S145 (proc_pid_net) remain distinct documents and must be re-pointed by document if a later adoption round renumbers.

Outside spot-check: pending; dispatched seats remain part of the lane.
