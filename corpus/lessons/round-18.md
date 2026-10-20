# Round 18 — early source rechecks, guarded execution, routed corrections

Steered round 18, attempt 1, hyaku phase 2, 2026-10-20. Baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. L1 TabiR18 holds the canonical planner seat.
Claims: C1 freshness (8, lowest tie), bounded source re-verification; C2 operability (8,
lowest tie), six finite harness/witness hazards; C3 calibration (9), five routed defects.
No scalar promotion or exploratory claim. Final measurements are appended after the measured
revision lands; targets are not measurements. Motivating record: LOG.md round-18 entry.

## Gate

C1 counts round-specific integrity-checked recheck receipts, not overdue rows or current product
support. The fixed baseline selection is 51 rows: 57 minus S004/S039/S047/S049/S050/S053.
Own-work S029 is explicitly hygiene, not live freshness. Author-side admission requires positive
movement from baseline zero, valid quote/excerpt/producer binding, source URL relationship checks,
and drift marked by a superseding row. Command: `node .ufo/waves/round-18/measure-c1.mjs REV`.

C2 admission requires each credited hazard red on the baseline artifact and green on its successor,
retaining the 11 original functional scenarios and four controls. The six hazards are signals,
abnormal cleanup, TCP DevTools exposure, download acceptance, feature-switch composition and
symbolic witness input. Command: `node .ufo/waves/round-18/measure-c2.mjs REV`.
The guarded wrapper does not prevent direct use of the byte-frozen old freshness CLI.

C3 admission requires all five independent repairs to verify from committed bytes with
`node .ufo/waves/round-18/measure-c3.mjs REV`: correction text, historical 20-gate comparison,
adjacency self-test receipt, complete S057 supersession and seven new fully retained reruns.
The historical runner is new this round; its digest is bound at REV while each executed gate's
digest is independently bound to `93bfead1f5f25f584353df3152a60209bbd89a2e`.

Rejected: editing census-frozen files or prior lessons; scalar moves 8→9/9→10; overdue-repair
framing (no row is date-due); transport-level wire identity from CDPSession; host-wide no-egress;
calling the wrapper a global fix to the frozen CLI; calling retained new reruns the lost old runs.
No non-author judgment is claimed here: the orchestrator's subsequent closure owns that check.

### Sources opened this round

| Row | URL | Access | Located quote (verbatim, ≤25 words) | Location | sha256 (full) | Dossier pointer |
|---|---|---|---|---|---|---|
| S058 (rejected, supersedes S057) | https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | 2026-10-20 | "Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE" (12 words) | Developer card: label byte 523546, value byte 523625, recorded fetch #4 (649152 B). Offsets shift per fetch; locate by quote. | `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2` (649152 B, recorded fetch #4) | `.ufo/waves/round-18/sources/S058Listing.md` §1 (fetch ledger), §2 (F6–F10), §4 (Gate entry) |
| S059 | https://playwright.dev/docs/api/class-browsertype | 2026-10-20 | "Close the browser process on SIGTERM." (6 words) | §launch options `handleSIGTERM` (`#browser-type-launch-option-handle-sigterm`); docs source `docs/src/api/params.md:1229` at tag v1.64.0 (commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`); normalize-only found=true, offset 9268 | `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` (167791 B on disk, HTTP 200) | `.ufo/waves/round-18/sources/SrcPwLaunch.md` §Gate entry (lines 123–137) |
| S060 | https://playwright.dev/docs/api/class-browser#browser-new-context-option-accept-downloads | 2026-10-20 | "Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted." (16 words) | §Browser.newContext › Arguments › acceptDownloads; docs source v1.64.0 `params.md:377`; normalize-only found=true, offset 5230 | `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e` (184490 B decoded) | `.ufo/waves/round-18/sources/SrcPwDownloads.md` §Gate entry (lines 79–87) |
| S061 | https://playwright.dev/docs/api/class-cdpsession | 2026-10-20 | "The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method." (19 words) | served page §CDPSession, first paragraph, normalized offset 1054 of 3362; docs source `class-cdpsession.md:4-5` at v1.64.0, byte-identical at v1.64.1 | `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba` (54215 B, two fetches identical) | `.ufo/waves/round-18/sources/SrcPwCdpSession.md` §7 (Gate entry) |
| S062 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc | 2026-10-20 | "Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch." (19 words) | `content_switches.cc:596-597`; tag 154.0.8037.97, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; normalize-only found=true, offset 26205 | decoded `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e`; as served (base64) `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e` | `.ufo/waves/round-18/sources/SrcChromiumPipe.md` §Gate entry (lines 183–185) |
| S063 | https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md | 2026-10-20 | "If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit)." (20 words) | `doc/api/process.md:757-759`, §Signal events; tag `v24.21.0` (commit `955266bfdd854cd280dffd47548673914484e4c0`); normalize-only found=true, offset 23798. The quote is absent from the rolling `latest-v24.x` page (served 24.22.0), so the pinned URL is the citation. | `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7` (134327 B raw md at v24.21.0) | `.ufo/waves/round-18/sources/SrcNodeSignals.md` §3 (Gate entry), §4 (normalize-only A), §6C–D (version scope and drift) |
| S064 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT | 2026-10-20 | "if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); }" (13 words) | `base/command_line.cc:449-455`; tag 154.0.8037.97, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, blob `3a95f227d419ebe02319c065f3cdedf2a65c69a4`; normalize-only found=true, offset 13888 | decoded `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53`; as served (base64) `edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991` | `.ufo/waves/round-18/sources/SrcChromiumSwitchMerge.md` §Gate entry (lines 153–161) |


New rows S058–S064 were opened this round. S058 rejected; S059–S064 mined and cited by
`corpus/knowledge/harness-hardening-round-18.md`. Existing status/recheck/used-by cells unchanged;
no old→new transitions. Census began `tabi ok`, exit 0, rows 57 (A46/B4/C7; mined42/queued8/rejected7).
Command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`.

## Corrections

Correct sibling count is 6. `corpus/lessons/round-17.md:116` and fleet `.ufo/reports/round-17/tabi.md:35`
said 7 siblings; both are superseded by this correction. The six are kagi, kaidoku, kake, kama,
kumitate and revenger. Spot-check: `corpus/lessons/round-17-verifier-spotcheck.md:159`.
Counting command run by DraftLesson:
`git show 93bfead:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l` → `6`.
The round-17 lesson is protected, so its original bytes are retained, not rewritten.

S058 supersedes S057 in every cell that repeated the unsupported publisher classification;
the served listing names Google Ireland, Ltd. as developer and François Beaufort under Offered by.
Old S053/S057 and frozen historical quotations retain their bytes as explicitly superseded records.
The new knowledge source-recheck note quotes S057's old anchor as historical text, not a current claim.

The round-17 20-gate set now has an actual receipt at its measured `93bfead`:
`corpus/evidence/round-18/routed/harm-at-93bfead.json`; all 20 exits equal baseline.
Four repeated stdout hashes differ (temporary paths/fixture identities can vary); this is not
asserted to be byte-determinism. The prior `6c97851` run remains historical, not relabeled.
The retained adjacency self-test receipt is `routed/adjacency-selftest.json` beneath the same evidence
directory: exit 0, 57 cases, producer bound to the historical checker blob.
Seven `routed/harness-reruns/run-N.json` files and `index.json` retain new executions of the unchanged
round-17 harness: 11/11 cases, four controls, exit 0 for each; they do not reconstruct lost /tmp bytes.

## Mistakes

| Class | Evidence | Captured-by | Fix, including red case |
|---|---|---|---|
| number-drift | round-17 spot-check routed 1; prior lesson :116 | none for prose counts | Recount six and correct both mentions; C3 baseline d1 `lesson_missing`, self-test wrong-seven mutant rejected |
| reference-drift | spot-check routed 2 | QUALITY 26 (revision binding) | Historical full-set receipt at 93bfead, not earlier integration; C3 wrong-revision/19-gate mutants reject |
| landing | spot-check routed 3 | QUALITY 28/30 (insufficient without a receipt) | Commit adjacency 57-case receipt; C3 missing/wrong-producer receipt rejects |
| stale-premise | spot-check routed 4 | CORPUS corrections sweep | S058 sweeps all falsified cells; C3 individual-publisher mutant rejects |
| landing | spot-check routed 5 | QUALITY 28 | Seven new rerun artifacts with full digests; C3 six-rerun/sha-mismatch mutants reject |
| survivor | w1/ReviewC1Contract.md | initial receipt contract missed URL provenance | C1 wrong-source URL and forged own-work bytes become counter-owned negative cases |
| scope | w1/ReviewC2Contract.md | initial h1/h2 design | Distinguish startup failure from signal delivery; abnormal cleanup needs abnormal probes, not normal completion |

Pointers beginning w1/ in this table mean `.ufo/waves/round-18/w1/`. QUALITY additions below are
lesson-backed, not claims of independent discernment. Existing scalar depth 8 is deliberately deferred:
it has not been claimed since user round 5; a feasible next claim is substrate re-verification of the
r3/r8/r9 evidence ladder. Freshness/operability were selected for explicit existing debt, not because
depth is saturated.

## Adjacency

No sibling-owned files changed. Existing six-sibling map remains citation/venue evidence, not six
bilateral agreements. Open L0 questions are identified by tabi round-17 opening words:
“the-musketeer” CDP lease (filed ebeb396f7db43c55de2711baa409f8bb9b71147b) and ruling reach to
revenger/kama (filed b6b3b5e42044b7cd7307d1d923ee054bf98eeb43); both remain unanswered per
`.ufo/waves/round-18/w1/ConnL0.md`. Sibling tools/routes: w1/ConnSiblings.md.

## Seats

Wave 1: 70 seats: scout36/executor12/scribe7/reviewer6/connector5/critic2/sentinel1/revenger1.
The L1 is planner; connector seats perform bounded overlap/data walks, not another judge.
Registry: `.ufo/waves/round-18/w1/swarm-registry.json`. Falsification-wave evidence is appended
when delivered. Wave-1 seats wrote disjoint assigned files directly in LANE, without separate writer
worktrees: this missed addendum §6.2's stronger writer-isolation contract despite no shared-file edit
assignment. It is recorded as a conformance defect, not concealed as compliant isolation.
