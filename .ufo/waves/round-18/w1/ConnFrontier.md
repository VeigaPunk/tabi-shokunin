VERDICT: PASS

Axes: append-only fidelity; no capability-frontier flip; operability scoped to the new harness; freshness scoped to the 51 rows at baseline B; calibration kept off the frontier.

Lane tip `refs/heads/master` = `2bff864fdfee684ddbcd066cc8e735adaba2735c` (baseline B). `corpus/README.md` is 368 lines. `ls corpus/knowledge/*.md | wc -l` = 34. Absent at that tip: `corpus/knowledge/source-recheck-round-18.md`, `corpus/knowledge/harness-hardening-round-18.md`, `scripts/webmcp-invoke-round18.mjs`, `scripts/freshness-witness.mjs`. No install.

## What round 18 advances

No capability row in the round-3 Frontier (`corpus/README.md:22-54`), the kaika restatement (`:171-194`), or the round-16/17 status paragraphs (`:295-314`, `:324-332`) changes from open to held. C1 and C3 do not advance those rows. C2 advances harness debt recorded on the already-held invocation surface, and only on new files.

### C2 — harness debt, new script only (operability)

Old text stays: `corpus/knowledge/webmcp-invocation-round-17.md:99-104` (“all are open debt”). It describes byte-frozen `scripts/webmcp-invoke-round17.mjs` (PLAN `.ufo/waves/round-18/PLAN.md:55-56`). Findings: `.ufo/waves/round-17/w2/SentinelHarnessAfter.md`.

| Hazard | Old at B | New, and only if `c2_hazards_closed` = 6 |
|---|---|---|
| Unauthenticated DevTools TCP port (`--remote-debugging-port=0`) | open debt, note `:100`; H3 `:42-51` | closed on `scripts/webmcp-invoke-round18.mjs`: no `--remote-debugging-port`; CDP via `context.newCDPSession(page)` (PLAN `:27`, probe h3 `:85-86`) |
| SIGTERM yields `verdict=fail` | open debt, note `:101-102`; H1 `:17-27` | closed: SIGTERM/SIGINT/SIGHUP → exit 2 `run_aborted`, no `fail` or `pass` receipt (PLAN `:25`, probe h1 `:83-84`) |
| Temp profiles and `org.chromium.Chromium.*` survive abnormal exit | open debt, note `:102`; H2 `:29-40` | closed: every exit path removes the run temp tree; browser `TMPDIR` is inside that tree (PLAN `:26`, probe h2 `:84`) |
| Page-tool downloads not refused or recorded | open debt, note `:102`; H4 `:53-59` | closed: `acceptDownloads:false`, download recorded, fixture case `invoke-download-refused` (PLAN `:28`, probe h4 `:86`) |
| Two `--enable-features=` (Chromium keeps the last); domain-disabled has two `--disable-features=` | open debt, note `:103`; S1 `:69-75` | closed: exactly one `--enable-features=` and at most one `--disable-features=` per launch, union preserved (PLAN `:29-30`, probe s1 `:87-88`) |
| `check-freshness.mjs --witness HEAD` enforced only by SKILL text | open, not a defect: `corpus/lessons/round-17-verifier-spotcheck.md:165`; SKILL `:1919-1922`; spot-check rejected editing the frozen checker (`:129`) | closed as F6 by new `scripts/freshness-witness.mjs`: resolves `refs/heads/master`, refuses `HEAD` / symbolic / non-40-hex, then calls the still-frozen checker (PLAN `:31-34`, probe f6 `:88-89`; QUALITY 29 carve-out `corpus/QUALITY.md:123-124`) |

The round-17 invocation claim (Chromium 154, flags, loopback, committed `WebMCP.invokeTool` receipt) stays held. C2 does not add a capability.

### C1 — freshness of 51 rows, not a frontier bullet

PLAN `:15-20`: recheck every SOURCES row not superseded at B. Census at B is 57 rows. Superseded, not rechecked: S004→S028, S039→S040, S047→S054, S049→S055, S050→S056, S053→S057. Parsed status of the other 51: mined 40, queued 6 (S021 S022 S051 S052 S055 S056), rejected 5 (S026 S027 S038 S040 S057). A receipt is quote-in-excerpt (`PLAN.md:67-77`), not a re-derivation of every historical note claim, and it does not promote queued or rejected.

Round 12's sentence that S018/S019 “were not refreshed” (`corpus/README.md:218-221`) stays historical. Both rows are inside the 51, so they move from “not refreshed” to “quote rechecked”. That is weaker than “the paper claims were re-proved.”

After S058 lands, the rechecked set and the then-current set differ by one swap: S057 is in the 51; S058 is not. Do not write “rechecked every current row.”

### C3 — calibration, no frontier expansion

Same class as rounds 14–15 (`corpus/README.md:247-254`, `:265-285`). Old → new, historical sentences unedited:

| Defect | Old | New |
|---|---|---|
| D1 sibling count | `corpus/lessons/round-17.md:116` and the round-17 report say 7; spot-check `:83-84` and `:159` count 6 (`kagi kaidoku kake kama kumitate revenger`) | correction in `corpus/lessons/round-18.md` `## Corrections` citing `corpus/lessons/round-17.md:116`; the 7 stays in the frozen lesson |
| D2 harm set | measured at `6c97851`, not at measured revision `93bfead1f5f25f584353df3152a60209bbd89a2e` (`:160`) | `corpus/evidence/round-18/routed/harm-at-93bfead.json` |
| D3 adjacency self-test | only a wave line (`:161`) | `corpus/evidence/round-18/routed/adjacency-selftest.json` |
| D4 S057 anchor | `corpus/SOURCES.md:71` still has “individual publisher” (`:162`) | S058, `teaches` starts `supersedes S057 —`, no S058 cell contains that phrase |
| D5 seven reruns | abbreviated digests only (`:163`) | ≥7 receipts under `corpus/evidence/round-18/routed/harness-reruns/` with full 64-hex |

## Draft append

Paste after `corpus/README.md:368` only once both notes exist as files (`corpus/README.md:9`: a row is written when its file exists). Replace each `L1 FILL` from the counter; do not append the status word “closed” while `c2_hazards_closed` is still 0. Leave `:22-54`, `:171-194`, `:295-332` byte-identical.

```markdown
## Round 18 — source recheck and harness hardening, no new capability (2026-10-20)

New knowledge map rows (36 notes once both files are in `corpus/knowledge/`; the 34 earlier rows are unchanged). These two rows are the first map entries for the files; the historical 34 at round 17 (`:318`) stays a historical count.

| Note | Holds | Sources |
|---|---|---|
| `knowledge/source-recheck-round-18.md` | Freshness recheck of the 51 SOURCES rows not superseded at `2bff864fdfee684ddbcd066cc8e735adaba2735c`: S001–S057 except S004, S039, S047, S049, S050, S053 (mined 40, queued 6, rejected 5). One `tabi-source-recheck-v1` receipt plus excerpt per row under `corpus/evidence/round-18/source-recheck/`, produced only by `.ufo/waves/round-18/recheck-fetch.mjs`. Verdict `held`, or `drift` with a row whose `teaches` starts `supersedes <row> —`. Quote-in-excerpt does not re-derive every historical note claim and does not promote queued or rejected rows. Not a runtime capability. S058 is not one of the 51. | those 51 rows; `corpus/evidence/round-18/source-recheck/`; counter `node .ufo/waves/round-18/measure-c1.mjs REV` |
| `knowledge/harness-hardening-round-18.md` | Operability of the already-held Chromium 154 loopback invocation surface, on new files only. `scripts/webmcp-invoke-round18.mjs` closes H1 (signals → exit 2 `run_aborted`), H2 (one cleanup; browser `TMPDIR` inside the run dir), H3 (no TCP DevTools port; `context.newCDPSession(page)`), H4 (`acceptDownloads:false`, recorded, case `invoke-download-refused`), and S1 (one `--enable-features=`, at most one `--disable-features=`). `scripts/freshness-witness.mjs` resolves `refs/heads/master` and refuses `HEAD`, a symbolic ref, or a non-40-hex revision before the byte-frozen `scripts/check-freshness.mjs`. Does not claim raw-frame parity with the round-17 receipt. The round-17 harness and `webmcp-invocation-round-17.md:99-104` stay historically true. | `L1 FILL` exact S059+ ids from SrcPwLaunch, SrcPwDownloads, SrcPwCdpSession, SrcChromiumPipe, SrcNodeSignals, SrcChromiumSwitchMerge (Playwright launch / downloads / CDPSession, Node signals, Chromium pipe, Chromium switch-merge). Counter `node .ufo/waves/round-18/measure-c2.mjs REV` |

Frontier status (append-only; the round-3 bullets, the kaika table, and the round-16/17 status paragraphs keep their wording):

No capability frontier row moves. Still open, same pointers: real-site WebMCP (`:302`, needs operator approval), real-site rate/ToS (`:182`), real-site journeys (`:183`), agent-side consumption (`:302-329`; `knowledge/webmcp-invocation-round-17.md:78` and `:85`), Chromium 152 at runtime (`:298`, `:345`; note `:93`), any unflagged or default-profile claim (`:303-304`; kaika correction `:196-199` — the ≥136 profile-boundary row stays docs-held, refusal never observed), extension↔daemon handshake (`:180`, `:331`).

Harness debt old → new (the old sentence at `knowledge/webmcp-invocation-round-17.md:99-104` is not edited). “Closed” below is admitted only when `measure-c2.mjs` prints `c2_hazards_closed` = 6 (`L1 FILL` the measured number):

| Item | Old | New |
|---|---|---|
| TCP DevTools port | open debt on the round-17 harness | closed on `scripts/webmcp-invoke-round18.mjs` only (H3) |
| SIGTERM/SIGINT/SIGHUP → `verdict=fail` | open debt | closed on that script only (H1): exit 2 `run_aborted` |
| Temp tree survives abnormal exit | open debt | closed on that script only (H2) |
| Downloads not refused or recorded | open debt | closed on that script only (H4) |
| Two `--enable-features=` / two `--disable-features=` | open debt | closed on that script only (S1) |
| `--witness HEAD` on `scripts/check-freshness.mjs` | open; SKILL text only (`SKILL.md:1919-1922`) | `scripts/freshness-witness.mjs` refuses it (F6). The frozen checker still accepts `--witness HEAD` if invoked directly |

Freshness old → new: round 12 rechecked three claim families and left S018/S019 unrefreshed (`:218-221`, historical). Round 18 rechecks all 51 non-superseded rows at B, including S018 and S019, by quote-in-excerpt. `L1 FILL` `c1_rows_rechecked` from `measure-c1.mjs`. A `drift` verdict opens a superseding SOURCES row; it does not hold a new runtime surface.

Calibration old → new (no frontier expansion; frozen round-17 sentences stay):

| Record | Old | New |
|---|---|---|
| Sibling count | 7 at `corpus/lessons/round-17.md:116` | 6, corrected in `corpus/lessons/round-18.md` `## Corrections` |
| 20-gate harm set | at `6c97851` | receipt `corpus/evidence/round-18/routed/harm-at-93bfead.json` at `93bfead1f5f25f584353df3152a60209bbd89a2e` |
| Adjacency self-test | wave report only | `corpus/evidence/round-18/routed/adjacency-selftest.json` |
| S057 anchor “individual publisher” | `corpus/SOURCES.md:71` | S058 supersedes S057; no S058 cell carries that phrase |
| Seven harness reruns | abbreviated digests | full 64-hex receipts under `corpus/evidence/round-18/routed/harness-reruns/` |

Still open after this round (not closed by C1, C2, or C3): real-site WebMCP, real-site rate/ToS, and real-site journeys; agent-side invocation; Chromium 152; default profile (and any unflagged claim); argv allowlist S3 (`.ufo/waves/round-17/w2/SentinelHarnessAfter.md:77-80`); netns witness S2 (`:82-90` — a sentinel run under `unshare -rn` is not a receipt field); field caps S6 (`:92-95`). Also not closed: S8 `NODE_PATH` (`:100-101`); H4's side findings that the C2 probe does not cover (unrecorded non-`/__ledger` POST, query dropped by `served`, ledger `seq`/`at` overwrite, `:60-63`); page-level confinement only (note `:94`); cross-origin iframes, page-abort `Canceled`, and S045 not re-run (note `:97`); L0 `.ufo/l0-questions.md:62` and `:65`.
```

## Stays open (required)

- Real-site: WebMCP (`corpus/README.md:302`), rate/ToS (`:182`), journeys (`:183`). Note `:79` and `:93`.
- Agent-side invocation: decision table note `:78`; spec-versus-build `:85` (S043 does not prescribe the format). A pipe CDPSession is still a test harness.
- Chromium 152: unprobed at runtime (`corpus/README.md:298`, `:345`; note `:93`). Census U3 stays a README pointer because `browser-surface-census.md` is sha-pinned (`corpus/README.md:335-345`).
- Default profile: no default-profile launch (`corpus/README.md:196-199`). The kaika ≥136 row stays docs-held (`:190`). Unflagged remains the negative control only (note `:93`).
- Argv allowlist S3: `XDG_CONFIG_HOME` is redirected; `/etc/chromium-flags.conf` and foreign `--user-data-dir` / `--load-extension` / `--proxy-server` / `--no-sandbox` are not rejected (`SentinelHarnessAfter.md:77-80`). PLAN C2 does not include this repair.
- Netns witness S2: the sentinel's own netns run left no `ns/net` or interfaces key on the receipt (`:9-14`, `:82-90`). C2 does not record `/proc/self/ns/net`.
- Field caps S6: CDP `output` / `exception` stored verbatim; ledger POST count uncapped (`:92-95`).

## Contradictions (do not smooth)

1. “Harness hardened” is not “frontier held.” Writing C2 as expansion would count a method fix as coverage. Rounds 14–15 already refused that (`corpus/README.md:254`, `:272-273`).
2. Closing the five note `:99-104` debts on the new script leaves them true of `scripts/webmcp-invoke-round17.mjs`. A status line that omits “new script only” falsifies the frozen note.
3. The parenthetical “downloads, signals, pipe CDP” does not name S1 or F6 or H2. All three are in PLAN C2 (`:25-34`) and in the old debt (S1 at note `:103`; F6 at spot-check `:165`). Leaving S1 off both the advanced table and the open list hides it. S1 is advanced; S2, S3, and S6 are not.
4. F6 does not patch `scripts/check-freshness.mjs`. Direct `--witness HEAD` still certifies whatever HEAD is (spot-check `:58`, `:129`). QUALITY 29's carve-out (`corpus/QUALITY.md:123-124`) remains the rule for direct callers.
5. “51 rows” ≠ “51 mined” and ≠ “51 current after S058.” Queued 6 and rejected 5 stay those statuses. S057 is rechecked; S058 is a C3 correction row, not a C1 receipt.
6. H4's download repair does not close the ledger/query/POST findings at `SentinelHarnessAfter.md:60-63`.
7. S2's sentinel netns is a one-run observation with an explicit missing receipt field. It is not a closed witness.
8. Index rows before the two files exist break `corpus/README.md:9` and the round-17 map diff at `:349`.

## Proposed move

L1 appends the fenced section above after both knowledge files exist, fills `L1 FILL` from `measure-c1.mjs` / `measure-c2.mjs` / `measure-c3.mjs`, and does not edit earlier frontier sentences. Admit “closed” only for H1, H2, H3, H4, S1, and F6, each on the new artifact.

## Risks

- A pipe `CDPSession` may drop raw WebSocket frames the round-17 receipt stored. The harness index row must not say the receipt shape is unchanged. ConnHarnessDiff owns that checklist; this draft does not assert frame parity.
- If S059+ ids are written before the Src* seats land, the Sources cell will name rows that do not exist. Leave `L1 FILL`.
- Promoting the ≥136 profile-boundary row from docs-held to held because the new harness uses a temp profile would erase `:196-199`.

## Verification (for the integrator)

- Both notes present, then `diff <(ls corpus/knowledge | sed 's/\.md$//' | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||;s|\.md$||' | sort -u)` empty.
- `git diff -U0 -- corpus/README.md` shows only the appended section; `:22-54`, `:171-194`, `:295-332` unchanged.
- `c2_hazards_closed` is 6 before the word “closed” is committed; otherwise keep the status “claimed, unmeasured.”
- This seat did not run the counters. Unrun checks have not passed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ConnFrontier.md
