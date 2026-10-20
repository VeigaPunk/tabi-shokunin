VERDICT: PASS

# ReviewLesson — round-18 lesson falsification at REV 530f40a9bc3f10436161a2af1ca0fe9bffffc004

Reviewer: TabiR18.ReviewLesson-2 (leaf; no delegation). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Axes: (1) lesson-claim falsification coverage (Gate C1/C2/C3, Corrections, Mistakes, L0, Seats, Sources table);
(2) evidence rigor (exact argv/exit/digest, red-before, selftest-negative); (3) scope integrity (byte-frozen,
append-only, no fabrication). Every check below was executed by me in this session; outputs quoted verbatim.

## 0. Revision and scope integrity

- `git rev-parse HEAD` in lane → `530f40a9bc3f10436161a2af1ca0fe9bffffc004` = REV. `git status --porcelain` → only `?? .ufo/waves/round-18/w2/` (w2 report dir).
- `git diff --name-status 2bff864..530f40a` → 221 paths. Modified: `LOG.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md` only; everything else added (`.ufo/waves/round-18/**`, `corpus/evidence/round-18/**`, `corpus/knowledge/harness-hardening-round-18.md`, `corpus/knowledge/source-recheck-round-18.md`, `corpus/lessons/round-18.md`, `scripts/freshness-witness.mjs`, `scripts/webmcp-invoke-round18.mjs`).
- Append-only verified: deleted-line counts in the B..REV diff for SOURCES/QUALITY/README/LOG = **0** each (`git diff … | grep -c "^-[^-]"` → 0, 0 combined for QUALITY/README/LOG). Lesson claims "Existing status/recheck/used-by cells unchanged; no old→new transitions" — confirmed.
- Byte-frozen surfaces untouched: `corpus/lessons/round-17*.md`, `scripts/check-*.mjs`, `scripts/check-freshness.mjs`, `scripts/webmcp-invoke-round17.mjs`, census files, all B knowledge files absent from the diff. Prior lesson not edited ✓.
- SOURCES rows: 57 at B (verified from `git show 2bff864:corpus/SOURCES.md`: A46/B4/C7; mined42/queued8/rejected7 — exact match to lesson) → 64 at REV (S058–S064 appended; all row IDs distinct, count 1 each).

## 1. Gate C1 — 51 source rechecks (freshness 8)

- Counting command run: `node .ufo/waves/round-18/measure-c1.mjs 530f40a…` in /tmp sandbox (clone `--no-hardlinks`, HEAD verified `530f40a…`, clean). Output: `{"c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"rejected":[]}`, exit **0**. Baseline red: same command at `2bff864…` → `c1_rows_rechecked:0, eligible_rows:51`, exit 0. 0 → 51 movement confirmed; superseded set exactly S004/S039/S047/S049/S050/S053 (receipt files present for the other 51 row IDs, absent for those 6).
- Receipt spot-audit (S001, S045, S057): `schema=tabi-source-recheck-v1`; `quoteWords` equals `wc -w` of quote (16/7/10); `excerptSha256` == recomputed sha256 of excerpt file; `sha256` 64-hex; `producerSha256` == sha256 of `.ufo/waves/round-18/recheck-fetch.mjs` at REV (`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`); `fetchedAt` 2026-10-20; `quoteFound=true`; `teachesVerdict=held`. All True.
- Self-test: `node .ufo/waves/round-18/measure-c1.mjs --self-test` → exit 0, 23 cases, all `pass:true`. Negatives include `wrong producer sha`, `rowUrl not in row`, **`wrong URL S016 unrelated` → "fetch URL does not match row URL"**, **`body override command` → "fetch command is not canonical curl"**, **`forged S029 sha` → "S029 sha256 does not match pinned git object"**, `superseded row`, `duplicate row receipt`, `wrong fetchedAt date`, `httpStatus != 200`. This is exactly the Mistakes-table fix for the w1 survivor ("wrong-source URL and forged own-work bytes become counter-owned negative cases") — the ReviewC1Contract.md HIGH finding (URL-provenance/forged-body) is closed in the counter, not just in prose.

## 2. Gate C2 — six harness/witness hazards (operability 8)

- `node .ufo/waves/round-18/measure-c2.mjs 530f40a…` → `{"c2_hazards_closed":6,…}`, exit **0**. Observed whys: h1 `run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0`; h2 `TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true, watchdog=true`; h3 `--remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=78, browser-owned listeners=0`; h4 `case unique=true, pass=true, actual invoke attempt=true`; s1 `required launch roles missing=none, feature-union violations=0`; f6 `--rev HEAD exit=2; --dry-run exit=0 master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable`.
- Baseline red: same command at `2bff864…` → `c2_hazards_closed:0`, exit 0; h1 why records B's actual defect (`run_aborted/SIGTERM observed=false, exit=1, pass/fail receipt=fail:…/r.json`), h2 records SIGINT/watchdog leaks (`empty=false`). Red-before is real, not asserted.
- Self-test: `--self-test` → `{"verdict":"pass","cases":21}`, exit 0, including **`h1_startup_exit2_is_not_signal_success`** (expected false / observed false) — the ReviewC2Contract.md HIGH (startup failure ≠ signal delivery) is implemented and passing; `h1_signal_without_abort_record` negative also present.
- Retention claim: `corpus/evidence/round-18/webmcp-invoke/receipt.json` → verdict pass, **12 cases = 11 original round-17 case IDs (set-compared against `corpus/evidence/round-17/webmcp-invoke/receipt.json`, `issubset=True`) + `invoke-download-refused`**, **4 controls identical IDs**, all pass; `producerSha256 0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155` == `sha256sum scripts/webmcp-invoke-round18.mjs`. Lesson wording "retaining the 11 original functional scenarios and four controls" exact.
- Lesson honesty: Gate states "The guarded wrapper does not prevent direct use of the byte-frozen old freshness CLI" — counter f6 why says the same. No overclaim.

## 3. Gate C3 — five routed corrections (calibration 9)

- `node .ufo/waves/round-18/measure-c3.mjs 530f40a…` → `{"c3_routed_closed":5,"defects":{d1…d5 all pass}}`, exit **0**. Baseline: at `2bff864…` → `c3_routed_closed:0`, d1 why = **`lesson_missing`** — the exact red-before the Mistakes table row 1 claims; d2–d5 `*_missing`.
- Receipt internals independently recomputed:
  - `corpus/evidence/round-18/routed/harm-at-93bfead.json`: `revision=93bfead1f5f25f584353df3152a60209bbd89a2e` (full), 20 gates, name set identical to `.ufo/waves/round-17/harm-baseline.json` (sorted lists compared); `gateScriptsSha256` 6/6 match `git show 93bfead:<script> | sha256sum` (d707625e…, 93d19637…, 388c2b49…, 1579a794…, afd04787…, 568c0421…); `producer.path=harm-runner.mjs` sha256 `892466566850fd5edce2e901e20ca81dc79fa7a9957fa45380e12dfa6f03b98f` == committed bytes.
  - `routed/adjacency-selftest.json`: exit 0, `parsed.cases=57`, `producer.sha256 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` == `git show 93bfead:scripts/check-adjacency.mjs | sha256sum` (verified twice, lane and sandbox).
  - `routed/harness-reruns/`: 7 `run-N.json` + `index.json`; index `producer.sha256 de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` == sha256 of `scripts/webmcp-invoke-round17.mjs` (== blob at 93bfead, verified both); run-1 file sha256 `5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6` == index entry.
- Self-test: `measure-c3.mjs --self-test` → `{"selfTest":"pass","cases":26}`, exit 0; honest case = 5/5; all 26 forgeries reject with expected reasons: d1 **`correction_claims_7`**, `correction_report_citation_missing`; d2 `wrong_revision`, `gate_count`, `short_stdout_sha256`, `gate_producer_sha_mismatch`; d3 `wrong_producer_sha256`, `cases_not_57`; d4 **`S058_individual_publisher`**, `S058_not_superseding_S057`, +3 more; d5 **`fewer_than_seven_reruns`**, **`rerun_sha_mismatch`**, `duplicate_rerun_artifact`, +6 more. Every mutant named in the Mistakes table exists and rejects.

## 4. Corrections section — coverage of every old mention

- Counting command rerun: `git show 93bfead:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l` → **6**; values kagi, kaidoku, kake, kama, kumitate, revenger — identical to the lesson's list.
- Old mentions confirmed at exact cited lines: `corpus/lessons/round-17.md:116` "Map: 10 rows, 7 siblings."; fleet `/home/vgpnk/Projects/shokunin/.ufo/reports/round-17/tabi.md:35` "- C3 `corpus/adjacency.tsv` (10 rows, 7 siblings) …". Both are named in the correction; spot-check pointer `round-17-verifier-spotcheck.md:159` is exactly routed-defect 1.
- Repo-wide sweep `grep -rn "7 siblings"` over lane *.md and fleet round-17 reports: no remaining live mention outside the two named records (both retained-by-design/frozen) and wave-scratch descriptions of the correction. Nothing uncovered.
- S058: `corpus/SOURCES.md:72` — `teaches` starts "supersedes S057 — REJECTED: …", status `rejected`, no cell contains "individual publisher" (grep). Old phrase survives only in the superseded S053/S057 rows (`:67`, `:71`, retained bytes per SOURCES rule), frozen round-17 wave files, and historical-quoting contexts (`corpus/knowledge/source-recheck-round-18.md:136` explicitly frames the S057 anchor as historical with "the correction to that cell is outside this note"). Dossier `.ufo/waves/round-18/sources/S058Listing.md` records fetch #4, 649152 B, sha256 `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2`, F7 label/value bytes 523546/523625 — matching the lesson table cell for cell.

## 5. L0 full hashes — not fabricated

- `git cat-file -t` in **fleet** `/home/vgpnk/Projects/shokunin`:
  - `ebeb396f7db43c55de2711baa409f8bb9b71147b` → commit "round-17: tabi L0 question (musketeer CDP lease contested scope)", 2026-10-20 13:04:44 -03; `git show <sha>:.ufo/l0-questions.md | sed -n '62p'` → the musketeer/9222 row. Scope matches the lesson.
  - `b6b3b5e42044b7cd7307d1d923ee054bf98eeb43` → commit "round-17: tabi L0 question (CDP ruling scope: revenger, kama)", 14:25:52 -03; line 65 → the revenger/kama row. Scope matches.
- Unanswered: at fleet HEAD `3a4d1aa` ("round-19: kaidoku report"), lines 62/65 contain 0 occurrences of "L0 ANSWER" — "both remain unanswered" verified.
- Pins: `grep -o "fleet@<40-hex>:.ufo/l0-questions.md:6[0-9]" corpus/adjacency.tsv` → exactly 2× `fleet@ebeb396…:62` and 2× `fleet@b6b3b5e…:65`, full 40-hex.
- Note: these are fleet-repo commits, not lane objects — `git cat-file` in the lane fails for them, which is expected, not a fabrication.

## 6. Sources table — remote re-verification (public GET, curl, UA `tabi-shokunin-recheck/18`)

| Row | Re-fetch result |
|---|---|
| S059 | sha256 `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61`, 167791 B — exact; quote "Close the browser process on SIGTERM" ×3 in body |
| S060 | sha256 `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e` (--compressed), 184490 B — exact |
| S061 | sha256 `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba`, 54215 B — exact |
| S062 | as-served `7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e`; base64-decoded `0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e` — both exact; `remote-debugging-io-pipes` present ×3 |
| S063 | sha256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7`, 134327 B — exact; quote verbatim at `doc/api/process.md:757-759` (markdown hard-wrap spans those lines; single-line grep misses, raw lines confirm) |
| S064 | as-served `edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991`; decoded `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` — both exact |
| S058 | Not re-fetched live (offsets shift per fetch per dossier; hash verified against committed dossier fetch ledger and corroborated by the committed S057 recheck receipt, which is a fresh 2026-10-20 fetch of the same listing URL finding the Google Ireland developer text). Gap disclosed in §8. |

## 7. Remaining lesson claims

- Census: ran `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → `tabi ok …/corpus/SOURCES.md`, exit **0** (one W04 warning: S058 URL duplicated across scopes — non-blocking, consistent with the shared listing URL). B composition A46/B4/C7, mined42/queued8/rejected7 verified from B bytes.
- Seats: `swarm-registry.json` members = **70**; roles scout 36, executor 12, scribe 7, reviewer 6, connector 5, critic 2, sentinel 1, revenger 1 — exactly the lesson's counts.
- LOG.md round-18 entry present (lines ~1044-1066) and consistent (five routed defects, no scalar move, disjoint-files conformance miss recorded, not concealed).
- Knowledge note `harness-hardening-round-18.md` cites S059–S064 (19 matches) as the lesson claims.
- `/tmp` sandbox probes only; no git/jj writes in lane; no lane production file touched by me.

## 8. Observations and verification gaps (none rise to a defect)

1. `measure-c1.mjs` at REV reports `eligible_rows:58` (64 rows − 6 superseded) while counting the fixed baseline 51 — transparent in the same JSON and declared by the Gate ("fixed baseline selection is 51 rows"); new rows S058–S064 carry no receipts by design.
2. S058's listing sha256 `fbc214a8…` was not independently re-fetched (byte-exact reproduction of a JS-rendered store page is not achievable via plain GET; the lesson itself says "Offsets shift per fetch; locate by quote"). Binding rests on three committed, mutually consistent records (dossier ledger, SOURCES S058 cells, S057 receipt) plus the d4 forgery mutants.
3. Census W04 duplicate-URL warning exists but the lesson only claims `tabi ok, exit 0`, which is accurate.
4. C2-at-B hazard whys include a "retained-coverage precondition failed" clause (the new `invoke-download-refused` case cannot exist at B) alongside the genuine red observations (exit 1 + fail receipt, SIGINT/watchdog leaks); red status at B is nonetheless real and recorded per-hazard.

## Tooling

No tools installed or upgraded (existing curl 8.x, python3 3.14, node v24.21.0, git 2.56.0 sufficient); tooling directive noted, nothing to record.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ReviewLesson.md
