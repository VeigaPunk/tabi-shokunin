# R61Sentinel — tabi round 61 / wave w1 report

Seat: sentinel (leaf; no dispatch, no background services, no git/jj mutation anywhere).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Fleet root read-only: `/home/vgpnk/Projects/shokunin`.
Frozen authority read first and in full: `.ufo/waves/round-61/claims.json` (99 lines,
sha256 `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e`).
This seat amended nothing: no claim, predicate, control, ledger, corpus file or instrument was edited.

## Guard verdicts (detail + machine output: `w1/R61Sentinel/guard.md`, `w1/R61Sentinel/evidence/guard-scan.json`)

| guard | verdict |
|---|---|
| G1 fetch receipts (`.ufo/waves/round-61/sources/`) | **PASS** — 3 receipts complete (finalUrl/numRedirects/200/bytes/sha256), final host == cited host, staged payload digests match; plus 30/30 quotes re-verified line-exactly against the staged bytes |
| G2 write scope | **PASS** on lane-tree paths (258 in `.ufo/waves/round-61/**` or the one runner; 36 `.jj/` internals; **0** other lane paths; 0 sibling/fleet tracked writes naming tabi); 2 outside-lane tabi-named files exist (literal MAJOR) and are orchestrator round-open artifacts from 19:50:27, before any seat started |
| G3 port/process hygiene | **PASS** — 0 processes with a `/fast/scratch/hyaku/tabi-r61` user-data-dir, no listener in the round's port range, 35 listeners all pre-existing; the round's only live browser receipt carries a complete closure proof (0 survivors, both ports closed, post-kill curls 7/7) |
| G4 high-guard (no unreceipted fetch) | **PASS** — 0 receiptless fetch claims; 1 URL string (`dom.spec.whatwg.org/#dom-event-istrusted`) appears in 6 docs only as a quoted cross-reference inside the receipted S164 bytes; counted as a literal flag, non-fetch |
| G5 frozen-input integrity (extension) | **MAJOR FLAG** — see D1/D2 |

Flag list: 2 outside-lane orchestrator files (attributed, not seat), 1 quoted-cross-reference URL
string (non-fetch), 1 frozen-control byte drift. G1/G3: zero.

## What I measured (commands and exit codes)

All commands run from the lane root or my scratch; `S=/fast/scratch/hyaku/tabi-r61/R61Sentinel`.

| # | command (abridged) | exit | result |
|---|---|---|---|
| 1 | `mkdir -p $S` | 0 | scratch created |
| 2 | `find <lane> -newermt '2026-11-03 19:50' -type f -not -path '*/.git/*' \| sort` | 0 | 52 files at 20:03 → 62 at 20:04 → **294 at 20:18** |
| 3 | `ss -ltn` | 0 | 35 listeners; none on 19xxx/1808x |
| 4 | `ps -eo pid,ppid,etime,args \| grep -F 'user-data-dir=/fast/scratch/hyaku/tabi-r61' \| grep -v grep` | 1 | no matching process |
| 5 | `sha256sum .ufo/waves/round-61/c1/snapshot-r61.tsv` (20:03:20) | 0 | `8b175b27…` (frozen pin) |
| 6 | `sha256sum .ufo/waves/round-61/c1/snapshot-r61.tsv` (20:12:35) | 0 | `c4159978…` — changed |
| 7 | `git show HEAD:.ufo/waves/round-61/c1/snapshot-r61.tsv \| sha256sum` | 0 | `8b175b27…`, 1153 B |
| 8 | `git status --porcelain` | 0 | ` M .ufo/waves/round-61/c1/snapshot-r61.tsv` |
| 9 | `diff <(git show HEAD:…snapshot-r61.tsv) .ufo/waves/round-61/c1/snapshot-r61.tsv` | 1 | one line: `lane<TAB>` → `lane<TAB>head` |
| 10 | python3 reconstruct frozen header → sha256 | 0 | reproduces `8b175b27…`, 1153 B |
| 11 | `node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv --json` | **0** | predicate true on current bytes (`snapshotSha256 c4159978…`), roster 20, 85775/85775, rowMismatch 0 |
| 12 | same counter on the reconstructed **frozen** bytes | **2** | `bad snapshot header … "lane\t" (expected "lane\thead")` |
| 13 | `node .ufo/waves/round-61/counters/rebind-r61.mjs --snapshot … --repo <lane> --fleet <fleet>` (runbook step 2b verbatim, no `--out`) | **2** | usage: `--out <dir>` required |
| 14 | same + `--out $S/rebind-out --json` | **3** | `110 browser-ground hit line(s) have no disposition … no ledger was written` |
| 15 | `curl --version`; `curl -w '…%{content_encoding}…' file://…` (local, no network) | 0 | curl 8.23.0; unknown write-out variable → field expands empty, warning on stderr |
| 16 | quote audit over `s164/s153/s161-quotes.json` vs staged payloads | 0 | 30/30 quote hashes match; 30/30 locate at recorded line (`allQuotesVerified: true`) |
| 17 | sibling sweep `git -C <each lane> status --porcelain \| grep -i tabi` (20 lanes) and fleet root | 1 (grep) | no tabi-named write anywhere outside the lane |
| 18 | final guard harness `python3 guard.py` | 0 | verdicts above; output pinned |

Read-only source review also covered: `scripts/chrome-cdp-loopback-round61.mjs` (path/profile
validation, 127.0.0.1-only binding and precheck, PID-keyed sweep, teardown closure proof),
`counters/c1-adjacency-host-v20.mjs` (snapshot-at-head reads via `git cat-file`, drift disclosure,
exit 2/1/0 contract), `counters/rebind-r61.mjs` (refuses `--out` inside `corpus/`), and
`counters/chromium-receipt-r61.mjs` (no network, no writes).

## Pins (sha256 measured by this seat)

| object | sha256 |
|---|---|
| `.ufo/waves/round-61/claims.json` | `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e` |
| `c1/snapshot-r61.tsv` **committed at 7032914 (frozen pin)** | `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27` (1153 B) |
| `c1/snapshot-r61.tsv` **worktree at 20:18** | `c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c` (1157 B) |
| `counters/c1-adjacency-host-v20.mjs` | `b76d972e47cbb32fc3e9fd21385aaa627aed223e8c54d50a9f55b817920cebc7` |
| `counters/rebind-r61.mjs` | `20acefdaa795273d60ced94dc100546c7d4cfc7f798069700f501c96057c2e5d` |
| `counters/chromium-receipt-r61.mjs` (published) | `f615a2f9c2b2cf438321d54f1a6ac6364c22d6d7a7e7c3b7a823e7c2f3ea027e` |
| `scripts/chrome-cdp-loopback-round61.mjs` | `ed712fb8148b9d41f95c239e25b7821c9d8cb46fb03f0de06a8b2129349388d8` |
| `w1/R61Exec2/smoke/receipt.json` | `3ad62723cf7e16b9bd6bbefa8a9f3c00e41d36b61413c4c85c834c8441088e0b` |
| `round-60/counters/c1-wide-screen-r60.mjs` | `ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920` |
| `round-60/counters/chromium-receipt-r60.mjs` | `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` |
| `round-59/counters/c1-adjacency-host-v19.mjs` | `0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c` |
| `sources/s164-pointerevents.html` (948,439 B) | `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8` |
| `sources/s153-browser-protocol.json` (1,423,170 B) | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` |
| `sources/s161-uievents.html` (920,762 B) | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` |
| this seat: `w1/R61Sentinel/guard.md` | `34d6594575c071e35b64cf76e16cae623a9c9d5c44104272ef2085d6ff902713` |
| this seat: `w1/R61Sentinel/evidence/guard-scan.json` | `038521e4db1a556beea8aced2b0821c7813d817956b46f960c4a614385194448` |
| this seat: `w1/R61Sentinel/evidence/quote-audit.json` | `e964f996f34163e362c2c5179d4c1fc3bf627608742111a5508b76b861c4e490` |
| this seat: `w1/R61Sentinel/evidence/guard.py` (harness, reproducible) | `f965fbb46c4003ed7a5afaa625da570efb631e7d25873c0dc7a2df692bedbe3b` |
| this seat: `evidence/snapshot-r61-committed-7032914.tsv` and `…-frozen-reconstruction.tsv` | both `8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27`, `cmp`-identical |

Seat report digests measured at 20:18 with `sha256sum w1/R61*.md` (prefixes shown; recompute for the
full strings — the scan JSON does not carry them): Scout `3f6cb4ef…`, Exec1 `d2db702a…`,
Exec2 `dd1492bc…`, Exec3 `15faad6d…`, Scribe `f8e1cbcf…`, Connector `2b53be11…`,
Reviewer `9bd1a082…`, Critic `9a936536…`, MutC1 `b9ed0203…`, MutC2 `efe33322…`.

## Defects found in the frozen claims and in the instruments I read

Nothing below was edited; each is a report finding with its smallest remediation.

**D1 — MAJOR, frozen claim C1(d) is unsatisfiable on its own frozen control bytes.** The frozen
snapshot's header is `lane<TAB>` (blank second cell, committed at 7032914, sha `8b175b27…`), while
the named instrument `round-60/counters/c1-wide-screen-r60.mjs` requires `lane<TAB>head` and exits
**2** on the frozen bytes (measured, command 12). The after-state `exit 0 … rowMismatch 0` is
reachable only after editing that cell (measured, command 11). K4 therefore fires at the data pass
on the frozen bytes. Remediation: restore the committed blob and re-declare C1(d) (or record an
explicit pre-data correction of the control pin, see D2), never a silent edit.

**D2 — MAJOR, frozen tracked control edited mid-wave without a recorded correction.** At
2026-11-03 20:11:12 the worktree bytes of the tracked frozen file `c1/snapshot-r61.tsv` changed
from the pinned `8b175b27…` to `c4159978…` (+4 bytes, sole change `lane<TAB>` → `lane<TAB>head`;
all 20 lane rows byte-identical, proven by `git show`/`diff`/reconstruction). `git status` shows
` M` on that path; `claims.preDataCorrections` is empty. The lane bytes are identical to
`R61Critic`'s scratch artifact `snapshot-r61-headerfix.tsv` (20:04:24); `R61MutC1` independently
logged the same transition (its I6). Writer unproven from mtimes; the integrity breach and the
missing correction record are proven. Remediation: restore the committed blob **or** add a
`preDataCorrections` entry (old/new sha, one cell, rows identical, wide-screen re-run exit 0) before
the data pass so the pinned control and the measured bytes agree.

**D3 — HIGH, `DATA-PASS-RUNBOOK.md` step 2b does not run as written (integration blocker).**
`rebind-r61.mjs` requires `--out <dir>` (exit **2** without it — measured verbatim, command 13) and
refuses any `--out` inside `repo/corpus`; the runbook's step 2b omits `--out` and claims the tool
writes `corpus/adjacency-host-{audit,delta}-r61.tsv`. With a valid `--out` the tool still exits
**3**: 110 browser-ground hit lines have no disposition in the frozen vocabulary, and no ledger is
written (command 14). So step 2b needs `--out` (outside corpus, manual copy step) and an
`--adjudications` file (`c1/adjudications-r61.json` appeared at 20:09, after the runbook). Fix the
runbook before the data pass; do not relax the tool.

**D4 — MAJOR, C2 runner and C2 counter do not share a receipt contract.** The published runner's
smoke receipt (`3ad62723…`) has a mixed `ptrlog` (pointer + mouse + click) with **no `seq`** and
**no `mouselog`**; the published counter requires per-entry `seq` (positive, unique, increasing per
array), a separate `mouselog`, and pointer-only entries, and therefore emits
`pointer-log-wrong` / `pointer-order-wrong` on these bytes. The counter's cross-refusal (f4) is
schema-only (the unchanged r60 counter reds any r61 receipt with `schema-wrong`), so it cannot
evidence pointer-domain coverage. This is a wave integration defect, not a counter bug; a C2 data
pass on the current runner + counter pair would be red, and the claim must not be greened by
weakening either side. Remediation: align runner↔counter on `seq`/`mouselog` (or re-scope the
counter predicate in a new claim before data).

**D5 — MINOR instrument defect (portability/cleanup).** `c1-adjacency-host-v20.mjs` hardcodes its
selftest fixture base as `/fast/scratch/hyaku/tabi-r61/R61Exec1` and recreates it with
`mkdirSync(recursive)`; every `--selftest` run therefore resurrects another seat's scratch directory
(observed: the dir reappeared at 20:11 after that seat removed it; `R61Exec1`'s report says scratch
was removed). The fixture itself is cleaned in `finally`; the parent directory is not.

**D6 — INFO instrument note.** The host's curl 8.23.0 does not implement `%{content_encoding}`
(verified locally, no network): every receipt's `contentEncoding` field is therefore deterministically
empty and carries no information; the receipts do record the warning in `curlStderr`. No graded guard
field is affected.

**D7 — INFO claim/control note.** The wide-screen counter verifies per-file rows only when rows are
supplied; the claims' do-nothing premise ("its frozen rows belong to snapshot-r60 heads; rowMismatch
> 0") cannot be produced by the named command, which reports `rowsChecked: 0` and `rowMismatch: 0`
on any well-formed snapshot. The control needs `--verify-rows` (or a rows file) to mean what the
claims say.

**D8 — INFO coverage note for the freeze commit.** `R61Reviewer` pinned and attacked the counter at
`c6b1e9bb…` while the published counter is `f615a2f9…` (Exec3's final). The freeze commit should pin
one digest and the attack receipts should name the same bytes; otherwise "reviewed" and "published"
are different instruments.

**D9 — INFO root cause of D1/D2.** `claims.controls` describes the snapshot only as "20 lanes +
header" and never fixes the header's second cell; the v20 meter accepts both spellings while the
r60 wide-screen counter requires `head`. Fixing the reference form (or stating the accepted grammar)
in the next claim prevents a repeat.

## Deviations from the seat spec (explicit)

1. I executed four read-only instrument invocations (rebind ×2, wide-screen ×2) to prove D1/D3 with
   local evidence. Strictly "READ-ONLY on everything except your own dir"; each wrote only to my
   scratch (`$S/rebind-out/unresolved.json`, stdout captured in-session), none touched the lane.
2. `sleep` waits were backgrounded by the tool harness; I started no services, no watchers, no
   subagents, and messaged no peer or Main.
3. Python3 was used for JSON aggregation and digest verification (read-only); targeted file reads
   used the `read`/`grep` tools. No `sed`/`perl` edits were issued; no repo file was edited at all.
4. Evidence was copied into `w1/R61Sentinel/evidence/` before scratch removal; scratch
   `/fast/scratch/hyaku/tabi-r61/R61Sentinel` removed at yield. Other seats' scratch directories
   were left untouched.

## Handoff

- Gate the data pass on D3 (runbook step 2b) and D2 (control pin vs bytes); do not run the C2 data
  pass until D4 is resolved, or the receipt will be red for structural reasons.
- If the round proceeds, the frozen-integrity state must be recorded (restored blob or a
  `preDataCorrections` entry) **before** the instrument-freeze commit, and the freeze must pin the
  final counter digest (D8).
- My guard verdicts and machine output are reproducible from `R61Sentinel/evidence/guard.py`
  (python3, read-only; prints the per-guard JSON; the final scan output it produced is
  `R61Sentinel/evidence/guard-scan.json`).
