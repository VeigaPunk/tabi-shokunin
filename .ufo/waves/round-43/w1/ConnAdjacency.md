# ConnAdjacency — r43 adjacency-meter completeness pass (lane ground, SHONEN.md/LOG.md delta since r37 pins)

Date: 2026-10-29. Seat: ConnAdjacency (leaf, connector). Round-43 wave-1 seat spec:
sibling commits at `/home/vgpnk/Projects/shokunin/*/SHONEN.md` or `LOG.md` changed since the
r37 pins that land ON the lane's ground; report any candidate line as a screen candidate
(no mapping without a screen; no writes outside this seat).

## Verdict in one line

The post-r37-pin window over all 20 siblings' SHONEN.md/LOG.md is clean against the frozen
BG meter (0 new browser-ground lines) and against a widened ground-sense sweep (0 lines land
on tabi's province); 3 borderline mentions are dispositioned by sense as not-browser-sense /
third-lane and are listed as optional low-priority screen candidates.

## Pins used (r37 pins)

The r37 counter (`c1-adjacency-sweep-v5.mjs`) reads sibling heads from the round-36-frozen
delta pins, digest-bound at the r37 freeze. Those delta heads are "the r37 pins" for this pass:

- `.ufo/waves/round-36/baseline/c1-delta-pins.json` (20 lanes; sha256-bound in the r37 counter
  as `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655`).
- r37 measure at 34ed508 recorded `delta.total = 0` and `predicate = true`; this pass covers
  everything added after those heads (all 20 sibling heads have since moved).

Ground definition: tabi `PROVINCE.md` (browser driving, kimi-webbridge substrate docs, browser
inventory/profile surfaces, CDP session discipline, interaction records with shape-only
session material, dynamic-page evidence; refuses RE-as-forensics → revenger/kaidoku, publishing
→ kake, secrets → kagi) plus the map's screened surfaces in `corpus/adjacency.tsv`.

## Method (all read-only, git objects only; no working tree touched, no writes anywhere but this seat)

1. `commit-scan`: per lane `git log --format=%h %ci %s <pin>..HEAD -- SHONEN.md LOG.md` plus
   `rev-parse HEAD` (evidence/commit-scan.txt).
2. Frozen BG delta pool: per lane, every trimmed line at `HEAD:<file>` matching the frozen BG
   regex (r37 counter line 105: playwright|puppeteer|chromedriver|geckodriver|webdriver|
   selenium|chromium|headless-(chrome|chromium|browser|firefox)|devtools protocol|chrome
   devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner-chrome|
   musketeer, case-insensitive) and not matching `\btabi\b`, absent from the pin-era text set.
   (evidence/bg-delta-pool.tsv — empty; evidence/bg-verify.txt per-lane counts.)
3. Widened ground-sense sweep over the same head-minus-pin line set: tabi-province vocabulary
   (browser/crawl/render/DOM/screenshot/CDP/profile/cookie/session/loopback/socket/TCP/ss/
   /proc/net/fetch/robots/sitemap/web-vitals/accessibility/headless/webdriver/127.0.0.1...),
   then a second independent broad pass (46 hits, evidence/broad-hits.txt) and two targeted
   passes: added lines mentioning `tabi` (0 hits) and `electron|REA|forensic|shipped-artifact`
   (kaidoku firmware-SquashFS and revenger binary-forensics lines only — no browser/Electron
   runtime evidence claims).

Repro: the scan was two inline python3 heredocs over `git show`/`git diff <pin>..HEAD`
output; exact commands are reconstructed in evidence/command-log.txt. Python 3 (system),
git 2.x (system) — no tools installed or upgraded this seat.

## Observed results

Commit scan (pin..HEAD touching SHONEN.md/LOG.md), from evidence/commit-scan.txt:

- 0-commit lanes (head moved, these two files untouched): audio, game-dev-2d, game-dev-3d,
  kagi, lore.
- >=1-commit lanes: chousa 11, kaidoku 20, kake 8, kama 19, kasegi 13, kengaku 7, kotoba 7,
  kotodama 8, kumitate 2, mado 9, mori 6, revenger 3, souji 20, tameshi 8, tsukuroi 7.

Frozen BG delta pool: **0 lines** in every lane (bg-verify.txt: e.g. kagi carries 14 BG lines
at head, all pin-era; kaidoku 6, kake 6, kasegi 2, kotoba 1, kumitate 1, souji 2 — all
pin-era, already covered by the committed r37 screen ledger).

Widened sweep: 9 ground-sense added lines (ground-added-lines.tsv), all adjudicated
not-browser-sense on inspection. Broad pass: 46 hits (broad-hits.txt), same conclusion after
line-by-line reading. TABI-mention pass: 0 added lines name tabi. electron/REA pass: only
kaidoku SquashFS/firmware REA receipts and revenger binary-forensics gate lines — neither
asserts browser/Electron runtime evidence (the map's contested rea-browser-runtime-evidence
surface is untouched by these lines).

## Screen candidates

Strict result (frozen BG definition): **none** — nothing added since the r37 pins requires a
delta-ledger or screen row.

Borderline mentions, dispositioned by sense; reported as optional low-priority screen
candidates with a recommended reason (a future screener can convert to a ledger row verbatim;
no mapping is proposed):

1. `kaidoku-shokunin@d71829bffbe35996872bc12350f87a7042f59d19:LOG.md:3460` —
   "session cookies in two wave-1 receipts (redacted at the tip)". Names session-cookie
   material in evidence handling; a secrets-hygiene fact on kaidoku's own side (routes to
   kagi's mapped refused surface secrets-vault-ops if anything). Recommended reason:
   not-browser-sense (no browser/driver/protocol/capture statement), note cross-references
   the existing kagi secrets rows.
2. `kake-shokunin@1a48131577ba82c967650561be34e8dba909432d:LOG.md:2249` —
   capture-tool hardening: "SSRF through private redirect targets, ambient proxy use... a
   loopback server received 0 requests". HTTP-client egress hygiene of kake's publisher-side
   capture tool; mentions loopback/socket but asserts no browser, driver, or client-side
   crawler claim (kake's publisher side of the mapped splits stays kake's). Recommended
   reason: not-browser-sense.
3. `chousa-shokunin@4ece131ca826c646bd28a50802d41bc78d8a9717:LOG.md:1887` (with 1885, 1889,
   1963) — batch source re-fetch ("47 pinned (id,url,capture_sha256) triples re-fetched...
   3-attempt cap, >=600s spacing"). Automated corpus capture at a fetch-policy level;
   chousa's committed AP-03 denylist already records its no-browser-surface claim
   (screen-ledger row reason no-claim-declared covers the lane). Recommended reason:
   not-browser-sense (fetch ≠ browser surface; no crawl/robots/render claim), or
   third-lane-report if the screener wants the fetcher policy on record.

All remaining broad-pass hits are non-ground by inspection: typography "rendered" (chousa
man-pages, mori spec-renderer defect), claim-token forging controls (kasegi, souji, mado),
a llama-server health probe (kengaku 127.0.0.1:34113), window-manager socket-protocol claims
(mado), Fetch-spec source citations (kake), an SDK-page source snapshot (kotoba), a curl CVE
capture URL (kasegi), and revenger's Devin wiki link.

## Limitations

- Method is net-diff plus head-minus-pin text-set differencing over committed objects only;
  lines added and fully deleted before HEAD leave no head text and are out of scope (the
  meter's delta pool is head-text-based, so this matches the frozen definition).
- "Lands on the lane's ground" screening of the widened hits is my connector judgment against
  PROVINCE.md and the committed map; the frozen BG regex is the only machine-checked filter
  and it reports zero.
- Seat scope limited to SHONEN.md/LOG.md per the assignment; other sibling files were not
  swept this pass.
- No counters were run (the r37 counter needs a lane REV and fleet layout built for r37); the
  pass re-implements the counter's delta derivation over the two named files only.

## Evidence

All under `.ufo/waves/round-43/w1/ConnAdjacency/evidence/`:
- `commit-scan.txt` — per-lane pins, heads, moved flags, touching commits with subjects.
- `bg-verify.txt` — per-lane BG-line counts at head and new-since-pin counts (all zero).
- `bg-delta-pool.tsv` — the frozen-definition delta pool (empty).
- `ground-added-lines.tsv` — 9 widened-sense added lines.
- `broad-hits.txt` — 46 broad-vocabulary hits for line-by-line audit.
- `command-log.txt` — exact observed commands (reconstructed from this session's heredocs).

No tools installed or upgraded (system git + python3 only). Scratch root
`/fast/scratch/hyaku/tabi-r43/ConnAdjacency` deleted at seat exit. No writes outside
`.ufo/waves/round-43/w1/ConnAdjacency*`; no commits, no mutation anywhere.

VERDICT ok r37-pin delta window over 20 siblings' SHONEN.md/LOG.md is clean — 0 frozen-BG delta lines and 0 lines landing on tabi's ground; 3 borderline mentions dispositioned by sense as optional not-browser-sense screen candidates.
