# AdjKakeC — round 33 w1, C1 disposition drafts for 18 kake candidates

## Verdict

All 18 assigned kake candidates (`kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md`, lines 367–440) are accounted for by **18 new screen rows and 0 map rows**: 15 rows are `same-surface` on kake's already-mapped `crawler-discipline-vs-publishing` surface, because every one of the 18 lines is a sentence of kake's publisher-side crawl-hygiene knowledge (rounds 52, 55, 56, 57 — robots/refusal-file syntax, `rel=nofollow` semantics, server-status answers, Baidu dead-link handling) and not one of them names `tabi`, names `publish*`, or names a distinct tabi surface (programmatic check below); 3 rows are `no-claim-declared`, because those lines themselves state that no robots.txt was served, no URL was served under test, and no crawl was observed. No non-pending map row is honest on this slice: `split-declared` needs the sibling quote to carry `tabi` (absent from all 18 lines), `refused-route` needs the line itself to sit on tabi's refused publishing route (the token `publish`/`publishing` is absent from all 18), no fleet-repo ruling outside `.ufo/` names kake on this ground (`grep kake ROADMAP.md PROTOCOL-APPENDIX.md MISSION.md` returns only lane-status and protocol-hygiene rows, none a crawl-scope ruling), and drafting an L0 question would invent a dispute neither lane's files record. So this seat's `newMapped` contribution is **0**, and the frozen counter at my commit reads `mapped 5, screened 18, unaccounted 29, newMapped 0, screenFindings []` — kake's unaccounted candidates fall 40 → 22 — with `check-adjacency` clean (rows 10, verified 10) because this seat adds no map row.

## Evidence

Scratch: `/fast/scratch/hyaku/tabi-r33/AdjKakeC` (deleted before yield; receipts copied to the output dir first). Clone: `git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea` → `git rev-parse HEAD` = `e6b0a907…` (exit 0); `git -C "$S/clone" rev-parse --show-toplevel` = `$S/clone` (checked before every commit).

Sibling bytes (no network):
```
git -C /home/vgpnk/Projects/shokunin/kake-shokunin show 044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md > $S/kake-province.txt   # exit 0
sha256sum $S/kake-province.txt → 5cc33b015f2691d7b387b60a41cd27cf943513f979143d3bbf2a28947956f7e3  (31691 bytes, 447 lines)
```

Candidate keys confirmed against the frozen counter (not hand-copied):
```
TMPDIR=$S node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --list-candidates --fleet /home/vgpnk/Projects/shokunin   # exit 0
→ 52 candidate lines, 42 of them kake; each of my 18 keys (367 373 375 376 377 394 396 398 408 410 411 412 418 420 422 431 438 440) printed with the frozen pin
```

Quote verification — every quote is a verbatim substring of exactly the cited line, checked with `grep -nF` against the `git show` bytes and required to hit that line number (`screen.tsv` column 4 is the quote):
```
line 367: grep -F OK (hit line 367)      line 373: grep -F OK (hit line 373)
line 375: grep -F OK (hit line 375)      line 376: grep -F OK (hit line 376)
line 377: grep -F OK (hit line 377)      line 394: grep -F OK (hit line 394)
line 396: grep -F OK (hit line 396)      line 398: grep -F OK (hit line 398)
line 408: grep -F OK (hit line 408)      line 410: grep -F OK (hit line 410)
line 411: grep -F OK (hit line 411)      line 412: grep -F OK (hit line 412)
line 418: grep -F OK (hit line 418)      line 420: grep -F OK (hit line 420)
line 422: grep -F OK (hit line 422)      line 431: grep -F OK (hit line 431)
line 438: grep -F OK (hit line 438)      line 440: grep -F OK (hit line 440)
```
Word counts 8–16 (4..25 required) and non-space characters 34–77 (≥20 required); all 18 measured in the generator run (printout in the transcript; `BAD []`).

Why no map row is available on this slice (the two naming tests the frozen counter applies to `split-declared`/`refused-route`):
```
for n in 367 … 440; do <line n> | grep -c -i 'tabi'    → 0 on all 18 lines
                       <line n> | grep -c -i 'publish' → 0 on all 18 lines
```
tabi side read for the judgement: `PROVINCE.md:6-13` (owns CDP session discipline / interaction records / dynamic-page evidence), `PROVINCE.md:15-16` (`**Refuses:** … web *publishing* (→ kake), …`), `corpus/README.md` coverage map (no publisher-side crawl note among the 8 held notes), `SKILL.md:323-327` (tabi's own client-side loop: first request `/robots.txt`, a `Disallow:` prefix cell is never issued, a 200 interstitial stops the run) — i.e. tabi's crawl material is its own request loop, not what an engine does with a publisher's signals. kake's own boundary sentences (`PROVINCE.md:304`, `:338`, `:362` at the frozen pin) place the other half on kake: "publisher-side placement is kake's; client-side crawling stays with tabi".

Gate + counter at the delivered seat commit `8a1f7c2c6609a3b3cc24f4fed7e455a9ff854256` (clone HEAD after committing only `corpus/adjacency-screen.tsv`, 19 lines):
```
TMPDIR=$S node scripts/check-adjacency.mjs --at 8a1f7c2c… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
exit 0 → {"verdict":"clean","rows":10,"verified":10,"selfRulings":[2],…}   (map untouched: 10/10 rows verify)

sha256sum .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs
→ da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380  (== claims.frozenDigests, so this is the frozen counter)
TMPDIR=$S node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 8a1f7c2c… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
exit 1 (predicate false at a single seat's commit, as expected: the lane-level target needs the other seats' rows)
→ predicate false | adjacency clean 10/10 | candidates 52 | mapped 5 | screened 18 | unaccounted 29 | newMapped 0 | screenFindings []
→ perLane kake 42; unaccountedKeys 29, of which 22 are kake
```

Screen-rule liveness probes (two throwaway commits in my own clone, showing the 18 rows are load-bearing and not silently skipped):
```
83273c6 (row 2 surface → not-a-kake-surface)  → screenFindings [{"row":2,"reason":"screen-surface-unmapped","detail":"not-a-kake-surface kake"}], screened 17
2e7befa (row 3 quote, "three"→"four")         → screenFindings [{"row":3,"reason":"screen-quote","detail":"…PROVINCE.md:373"}], screened 17
```

## Per-candidate dispositions

Format: candidate (kake line at the frozen pin) | decision | grounded reason. All 18 screen rows cite `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:<line>`; surface column is `crawler-discipline-vs-publishing` (map line 6, verified for kake at baseline) or `-`.

| # | candidate | decision | reason |
|---|---|---|---|
| 1 | kake:367 | screen `same-surface` | Section heading of kake's publisher-side crawl-hygiene block; the mapped split (map `adjacency.tsv:6`) already puts publisher-side crawl signals on kake and client-side crawler discipline on tabi (`PROVINCE.md:6-9` gives tabi CDP/evidence, not publisher signals), and a heading claims neither side. |
| 2 | kake:373 | screen `same-surface` | Round-52 opener for three publisher-side per-engine crawl-hygiene entries — the same publisher half of the mapped split, no tabi surface named. |
| 3 | kake:375 | screen `same-surface` | `rel=nofollow` semantics ("is not a crawl refusal") is a crawler-side reading of a publisher signal kake owns; tabi's client-side ground (`SKILL.md:323-327`) is untouched. |
| 4 | kake:376 | screen `same-surface` | Link-attribute half of round 52 continued; the line names kake's own knowledge file `baidu-friendly-crawl-guidance.md` and no tabi surface. |
| 5 | kake:377 | screen `same-surface` | Baiduspider `User-agent:` block binding PC and mobile crawlers is publisher-side refusal-file ground of the mapped split, not client-side crawler discipline. |
| 6 | kake:394 | screen `same-surface` | Explicit self-description of the ground: kake extends its own round-52 publisher-side crawl-hygiene block from link attributes — no new overlap. |
| 7 | kake:396 | screen `no-claim-declared` | The sibling states no robots.txt was served and no crawl was observed "so no crawler behaviour is" claimed (`:397` "claimed.") — crawler behaviour is tabi's ground. |
| 8 | kake:398 | screen `same-surface` | Yahoo! JAPAN crawler-address, user-agent-list and deleted-URL pages in kake's staging package (not adopted, `:399`) are publisher-side crawl signals on kake's half. |
| 9 | kake:408 | screen `same-surface` | Section heading of the round-56 publisher-side crawl-handling block; a heading claims neither side and names no tabi surface. |
| 10 | kake:410 | screen `same-surface` | Round-56 opener: what the operator's pages say a server answer does to the crawl is publisher documentation — kake's half of the split. |
| 11 | kake:411 | screen `same-surface` | Provenance sentence for kake's `yahoo-japan-link-target-crawl-restriction` entry; a knowledge-file citation, no tabi surface. |
| 12 | kake:412 | screen `same-surface` | Held S367 row re-opened: a head `index,nofollow` refusing the crawl of a page's link targets is a crawler-side reading kake holds under the split. |
| 13 | kake:418 | screen `same-surface` | Soft-404 knowledge — a page served under `HTTP 200 OK` is not read as an error and the crawl continues — is server-answer semantics on kake's publisher half. |
| 14 | kake:420 | screen `same-surface` | Continuity sentence for the publisher-side crawl-hygiene ground from link attributes and the refusal file; same mapped surface. |
| 15 | kake:422 | screen `no-claim-declared` | The sibling states no URL was served under test and no crawl was (`:423` "observed."), so no client-side observation is claimed on tabi ground. |
| 16 | kake:431 | screen `same-surface` | Round-57 opener: what one operator's own pages say a dead link is and how its crawler treats one is publisher documentation of crawler behaviour — still kake's half. |
| 17 | kake:438 | screen `same-surface` | Continuity sentence across rounds 52, 55 and 56; the index-display figure is explicitly excluded from dead-link handling, ground unchanged. |
| 18 | kake:440 | screen `no-claim-declared` | The sibling states no URL was served under test and no crawl was observed — nothing claimed on the client-side observation ground tabi practises. |

No new surface was coined by this seat (nothing to dedupe against AdjKakeA/AdjKakeB).

## Considered and rejected for a map row

- **kake:418 soft-404 vs tabi's interstitial-200 stop rule** (`SKILL.md:327`: a body-shape interstitial marker stops the run "regardless of status"; its interstitial is a 200). Both lanes touch "a 200 that means something else", but the actors and objects differ: kake's sentence is about what a search engine's crawler reads for crawl purposes, tabi's is its own request loop refusing to treat an interstitial as success. Recorded as adjacency, not overlap; mapping it would be a non-overlap row drafted to reach `newMapped`, which the assignment forbids. Flagged here so the wave-2 reviewer can attack the judgement rather than discover it late.
- **kake:412/:413 `noindex,nofollow` / `X-Robots-Tag: NOFOLLOW` vs tabi's robots stop predicate**: same shape — tabi's predicate reads `Disallow:` prefixes from `robots.txt` for its own loop, not page-level robots directives; no tabi row claims the page-directive surface.
- **kake:396/:422/:440** were weighed for `same-surface` too; the disclaimer is in the line itself, so `no-claim-declared` is the stronger true reason (they appear as their own reason group for wave 2 to attack).

## Behaviour, gates, touched surfaces

- **Behaviour**: read the frozen candidate list, the gate contract (`scripts/check-adjacency.mjs:1-170`), the frozen counter, the tabi province/skill/coverage map and each of the 18 kake lines at the frozen pin; produced 18 screen rows; validated them in a scratch clone at a detached commit.
- **Gates run**: `scripts/check-adjacency.mjs` (exit 0, clean, 10/10) and the frozen `c1-adjacency-sweep.mjs` (exit 1, predicate false, `screenFindings []`) — both at `8a1f7c2c…`; counter bytes match the frozen digest. `--self-test` was not run and is not claimed.
- **Touched surfaces**: lane tracked files: none (no map row, no screen file written into the lane — the ledger is delivered for the L1 to integrate). Lane git index / jj state: untouched. Fleet repo: untouched. Sibling repos: read-only `git show`. Writes went only to `.ufo/waves/round-33/w1/AdjKakeC/` and this report; commits went only into `$S/clone` (`8a1f7c2c…`, plus the two probe commits `83273c6`, `2e7befa` which die with the clone).
- **Out of scope / not done**: no C2 work, no assimilation, no SOURCES/QUALITY/lesson edits, no L0 filing, no `agent://all`, no subagents, no lane builds/linters/formatters, no network fetches (0 HTTPS GETs, so no URL/time/status/byte/sha table applies), no tool installs or upgrades (only preinstalled `node`/`python3`/`git`).
- **Cleanup**: scratch clone and all scratch files deleted after the receipts were copied. `pgrep -fa 'chromedriver|chromium'` at the end returned two lines, neither a browser/driver and neither mine (no chromium/chromedriver was ever started by this seat, and nothing was killed):
  `1371 /usr/bin/earlyoom -r 3600 --avoid (^|/)(Hyprland|Xwayland|sddm|init|systemd|sshd|pipewire|pipewire-pulse) … --prefer (^|/)(java|node|chromium|python3?)$`
  `1320973 curl -q -sS --proto =https -o util.cc.b64 -w %{http_code} %{size_download}\n https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT` (another seat's read-only fetch).

## Findings for the L1

1. **This slice yields 0 `newMapped` by construction, not by effort.** A candidate line can only become a NEW verified row if it names the other side (`split-declared`), sits on a refused route (`refused-route`), or is covered by a fleet ruling/L0 question. My 18 lines contain neither `tabi` nor `publish*`, and no fleet ruling names kake on crawl scope — so the 4-row target must come from the boundary-stating lines (`kake:34/:39` already mapped; `:304`, `:338`, `:362`, `:61`, `:22-23`, `:60-61`…), which sit in the other kake seats' slices. If those seats come back short, the honest lane outcome is screens + a named shortfall, not invented rows.
2. **`same-surface` needs the mapped surface to stay verified at REV.** My 15 rows point at `crawler-discipline-vs-publishing` (`corpus/adjacency.tsv:6`, kake, split-declared). If the L1 ever renames or retires that surface, these 15 rows fail with `screen-surface-unmapped` (probe `83273c6` shows the exact finding).
3. **Counter cannot judge the screens' semantics** (claims.json `feasibilityDisclosed`): an attacker can challenge whether round-52/55/56/57 publisher-side crawl knowledge "restates" the mapped split. My defence is that kake's own boundary sentences (`:304`, `:338`, `:362`) assign exactly this material to kake and the client half to tabi, and that no tabi note holds publisher-side crawl material (`corpus/README.md` coverage map, 8 held notes).
4. **No L0 question is drafted by this seat.** There is no contested overlap on these 18 lines; a draft would have invented a dispute.

## Deliverables

- `.ufo/waves/round-33/w1/AdjKakeC/screen.tsv` — 19 lines (header `sibling_ref	reason	surface	quote	note` + 18 rows), sha256 `6a9bcc11b4a88416e912b6888a8ba59fdd3b18dd291747f92b398e0ea693bb91`.
- `.ufo/waves/round-33/w1/AdjKakeC/rows.tsv` — 0 bytes, empty by design (no non-pending map row), sha256 `e3b0c442…b855`.
- `.ufo/waves/round-33/w1/AdjKakeC/gate-8a1f7c2.json` (sha256 `a85b0221…5f19`), `counter-8a1f7c2.json` (`e5b822c7…8108`), `probe-unmapped-surface-83273c6.json` (`9d187f81…bb33`), `probe-altered-quote-2e7befa.json` (`55419183…5434`), `candidates.txt` (`ce7eb93e…54bd`), `kake-PROVINCE-0440485.txt` (`5cc33b01…f7e3`), `provenance.txt` (`e7c952d0…d0d7`).
