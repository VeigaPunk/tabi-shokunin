# ConnBoundaries — independent C1 boundary scan (round 35, wave w1)

Seat: ConnBoundaries (leaf). Item: independent C1 boundary scan over all 383 frozen
candidates (`baseline/c1-candidates.tsv`), clustered by tabi PROVINCE surface and by
sibling, with every sibling's `PROVINCE.md` read at its frozen pin (`baseline/c1-pins.json`).

## Verdict (one paragraph)

Read strictly against the frozen decision rule (SKILL.md:2861-2881) and QUALITY 87-91/97,
this 383-candidate pool carries **no clean new map row**: 238 candidates are same-surface
facts on surfaces an existing verified row already answers for that sibling (QUALITY 91),
66 are not-browser-sense (chromium/webbridge as workload, theme-file or agent-name senses),
51 declare no claim (refusals, own-domain operations), and 28 are third-lane records
(adjacency/description-rewrites documents, surveys, kill-classification). The two strongest
side-stating lines — kake's shared-burner-chrome serialization lease (SKILL.md:160,
ops-automation.md:79) and kaidoku's "caller-supplied chromium runs only a REA resolver stub"
(2026-10-14-r11-01-queue-ops.md:63) — are both facts on the sibling's own side of an
already-mapped split (respectively the musketeer-cdp-9222-profile-lease contested row and the
cdp-runtime-observation ruled row) and must screen same-surface. That leaves three genuine
**new-surface signals** that no existing row answers but that cannot be mapped this round
without an L0 question (contested-open) because their sibling quotes carry no SIDE token:
kake's auth-over-CDP surface matrix (ops-automation.md:78), kumitate's WebBridge-drives-
Chrome/Edge-over-CDP endpoint route (kimi-skills-plugins.md:486), and kama's logged-in-
browser drive-ability report (listener-census.md:356). The single mechanically n4-eligible
line on an *unmapped* sibling (chousa AP-03) is a refusal and must screen no-claim-declared
under decision-rule step 4 — it is also the cheapest split-forgery vector, so wave 2 must
attack it. Bottom line for the L1: enforce the same-surface screens or newMapped>=2 will be
reached only through rows wave 2 can withdraw (QUALITY 97 red-state pattern).

## Method and evidence

- Read (frozen, all absolute): `.ufo/waves/round-35/claims.json` (C1 definitions, kill
  rule, feasibilityDisclosed, frozenDigests), `baseline/controls-summary.json`,
  `baseline/c1-pins.json`, `baseline/c1-candidates.tsv` (383 lines, all read),
  `corpus/adjacency.tsv` (16 rows), `scripts/check-adjacency.mjs:1-170` (columns,
  dispositions, row semantics), `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs`
  (lines 1-183: BG/SIDE/THIRD_LANE/PINS definitions, candidate formula),
  `PROVINCE.md`, `SKILL.md:2861-2881`, `corpus/QUALITY.md:532-590,670-675`.
- Sibling `PROVINCE.md` at pins (git show, read-only): kaidoku 49096c7e…, kumitate
  8d557f85…, kagi 69b61db4…, kake 044048597d…, tsukuroi a968393c…, mado e0be61e4…,
  kotoba 65a5c7a…, kama e8fa87ef…, mori aa3af1ec…, tameshi f181a961…, chousa 00f8c7f5….
- Instrumented scan: parsed all 383 candidates with the frozen BG/SIDE/THIRD_LANE regexes
  (59 carry SIDE tokens; 25 live in third-lane paths), then classified each per the frozen
  decision rule. Script: scratch `cands.json`; analysis in eval (Python 3.11).

## Cluster: 383 candidates × tabi surface × sibling (independent estimate)

| sibling | candidates | same-surface | no-claim-declared | third-lane-report | not-browser-sense |
|---|---|---|---|---|---|
| kaidoku | 137 | 123 | 0 | 0 | 14 |
| kumitate | 66 | 66 | 0 | 0 | 0 |
| kagi | 56 | 36 | 3 | 17 | 0 |
| kake | 51 | 9 | 42 | 0 | 0 |
| kotoba | 20 | 0 | 0 | 8 | 12 |
| mado | 20 | 0 | 0 | 0 | 20 |
| tsukuroi | 20 | 0 | 0 | 0 | 20 |
| kama | 9 | 4 | 5 | 0 | 0 |
| mori | 2 | 0 | 0 | 2 | 0 |
| chousa | 1 | 0 | 1 | 0 | 0 |
| tameshi | 1 | 0 | 0 | 1 | 0 |
| **total** | **383** | **238** | **51** | **28** | **66** |

Sum = 383 ⇒ unaccounted 0 is reachable with **zero** new rows. The same-surface reasons map
to existing verified rows: kaidoku → cdp-runtime-observation / recorded-har-producer-channel /
screenshot-pair-compare-semantics; kumitate → kimi-webbridge-plugin-internals; kagi → musketeer-
cdp-9222-profile-lease / secrets-vault-ops; kake → crawler-discipline-vs-publishing / musketeer-
cdp-9222-profile-lease / js-rendering-browser-execution / robots-txt-publisher-audit-vs-client-
obedience / accessibility-browser-at-execution / lab-performance-tool-runs; kama → cdp-live-target-census.

## Strongest NEW boundary candidates (6, ranked)

### B1. kake — shared burner chrome serialization lease (row-plausible mechanically; same-surface trap)
- Candidate key: `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/ops-automation.md:79`
- Sibling quote (verbatim): `| `lease acquire\|release\|status --owner N --ttl-ms` | serializes the shared burner chrome machine-wide | free; release in `finally` |`
  (companion: `kake-shokunin@044048597d…:SKILL.md:160` → `--ttl-ms 900000`; release in `finally`. The shared burner chrome)
- Tabi surface: browser inventory + profile surfaces, shape-only census (PROVINCE.md:8); CDP session discipline (PROVINCE.md:9).
- Why not a same-surface fact of an existing row: the lease **mechanism** (TTL, owner, machine-wide serialization) is a side-stating claim (lease/share) beyond the bare ownership dispute already mapped — a naive reader can read it as "kake runs the shared browser, tabi only censuses it". But `SKILL.md:161` shows the shared burner chrome **is** `the-musketeer` profile on CDP `127.0.0.1:9222` — exactly the surface of the verified `musketeer-cdp-9222-profile-lease` contested row (kake side). Per QUALITY 91 this is a fact on kake's own side of an already-mapped split ⇒ **screen same-surface** (`surface=musketeer-cdp-9222-profile-lease`).
- One-line tabi declaration draft (only if the integrator declines the same-surface read): "tabi keeps browser/profile surfaces shape-only; the machine-wide serialization lease of the shared burner chrome (musketeer profile, CDP 9222) is kake's (`kake-shokunin/corpus/knowledge/ops-automation.md:79`)."

### B2. kaidoku — chromium as REA resolver stub only (the only genuine new-surface bid)
- Candidate key: `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f:corpus/knowledge/2026-10-14-r11-01-queue-ops.md:63`
- Sibling quote (verbatim, 4-25 words, BG+SIDE): `trace-web-module-imports` refuses typed without `REA_BROWSER_EXECUTABLE` (invisible in the 18-op capability matrix); the caller-supplied chromium runs only a REA resolver stub
- Tabi surface: dynamic-page evidence patterns / browser execution (PROVINCE.md:12-13; SKILL.md:2887-2889).
- Why not a same-surface fact of an existing row: the r11-01 use is kaidoku **launching Chromium via Playwright as an offline import-resolution engine** (REA `trace-web-module-imports`), explicitly not page observation and not the 9222/9223 CDP endpoints the ruled `cdp-runtime-observation` row and the split `recorded-har-producer-channel` row cover. The ruling's scope ("kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis", round-16 spotcheck:142) is broad enough that wave 2 will likely call this a fact on kaidoku's own side of that ruling ⇒ same-surface screen is the safe call; this entry is the **strongest honest new-surface bid** if the L1 judges "browser-as-engine vs page-driving" to be a distinct split.
- One-line tabi declaration draft: "tabi drives browsers to observe pages; kaidoku runs Chromium only as a trusted REA module-resolution stub for shipped-artifact analysis (`kaidoku-shokunin/corpus/knowledge/2026-10-14-r11-01-queue-ops.md:63`)."

### B3. kake — auth surface matrix spans CDP (new-surface signal; needs L0, no SIDE token)
- Candidate key: `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/ops-automation.md:78`
- Sibling quote (verbatim): `| `auth [--json]` | surface matrix: CDP, grok/kimi tabs, grok CLI, grok-bot app, origin | free |`
- Tabi surface: CDP session discipline (PROVINCE.md:9).
- Why not a same-surface fact of an existing row: no existing row answers kake's CDP **operations** beyond the 9222 lease; this line asserts kake's automation tool's surface spans CDP. It carries no SIDE token (the split disposition's mechanical floor, n4) and no tabi refusal can route it (refused-route), so it cannot be a verified row this round — it is an L0 contested-open candidate (`tabi | round-35 |` question naming kake).
- One-line tabi declaration draft (for the L0 question): "kake's `auth` verb operates over a CDP surface (`kake-shokunin/corpus/knowledge/ops-automation.md:78`); rule who owns CDP session operation vs tabi's CDP session discipline."

### B4. kumitate — WebBridge drives Chrome/Edge over CDP; endpoints routed to kama (new-surface signal; needs L0)
- Candidate key: `kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md:486`
- Sibling quote (verbatim): `(WebBridge drives Chrome/Edge over CDP via a browser extension). → **kama (endpoints).**`
- Tabi surface: kimi-webbridge plugin documentation (PROVINCE.md:6-7) and CDP session discipline (PROVINCE.md:9).
- Why not a same-surface fact of an existing row: the mapped `kimi-webbridge-plugin-internals` split answers kumitate's internals→tabi route (SCORECARD.md:1556) but not the **driver-mechanism/endpoint routing** facet; this line states the plugin drives Chrome/Edge over CDP and routes endpoint authority to kama. No SIDE token ("→" is not in SIDE) ⇒ cannot be split-declared under n4; an L0 contested-open question (or a later kama/tabi declaration) is the only path.
- One-line tabi declaration draft (for the L0 question): "kumitate routes WebBridge endpoint authority to kama and documents WebBridge's Chrome/Edge-over-CDP driver (`kumitate-shokunin/corpus/knowledge/kimi-skills-plugins.md:486`); tabi documents the plugin and keeps CDP session discipline."

### B5. kama — any local process can drive a logged-in browser (risk statement on the shared profile)
- Candidate key: `kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/listener-census.md:356`
- Sibling quote (verbatim): `gemini.google.com` (`the-musketeer` profile). Any local process can drive a logged-in browser.
- Tabi surface: browser inventory + profile surfaces (PROVINCE.md:8); CDP session discipline (PROVINCE.md:9).
- Why not a same-surface fact of an existing row: the verified `cdp-live-target-census` contested row answers kama's enumeration of live 9222 targets; this line adds a **security property** (drive-ability of a logged-in profile) that no row answers. It is a census observation, not a side-stating claim — screen third-lane/same-surface is the honest call, but the property is worth an L0 or lesson note because it bears on tabi's profile-surface census and on the contested lease.
- One-line tabi declaration draft (lesson/L0 note, not a row): "kama reports any local process can drive the logged-in musketeer profile (`kama-shokunin/corpus/knowledge/listener-census.md:356`); tabi's profile census records presence only and does not adjudicate the lease."

### B6. chousa — denies browser/CDP/profile/session/credential reads (screen, but the top forgery vector)
- Candidate key: `chousa-shokunin@00f8c7f5272a1d98b6d34913985fa4537e00aaf9:corpus/knowledge/archived-export-intake.md:141`
- Sibling quote (verbatim): `| AP-03 | browser, CDP, profile, session or credential reads of any kind | denied | secrecy guard MINT.md:100-111, a resolved hop is never opened, fetched or executed by this lane, session paths are denylisted by the gate at tools/research-gate.sh:210-218 |`
- Tabi surface: CDP session discipline (PROVINCE.md:9), secrets (PROVINCE.md:16), browser/profile inventory (PROVINCE.md:8).
- Why not a same-surface fact of an existing row: chousa has **no** map row at all. The line is a deliberate refusal — decision-rule step 4 ⇒ **screen no-claim-declared**. Critically, it is also mechanically n4-eligible (BG: browser/CDP; SIDE: denied/never), i.e. a forged split-declared row on it would pass the frozen counter's form checks; wave 2 must withdraw any such row (QUALITY 97: the sibling states it refuses — never a side of a split).
- One-line tabi declaration draft: none (screen).

## Most likely WRONGLY mapped lines (eager-seat watchlist)

1. **kake SKILL.md:696** (`kake-shokunin@044048597d…:SKILL.md:696`): "…Otherwise too few eligible Chrome visitors is likely but unconfirmed (low traffic, or iOS, WebView or other Chromium audiences send no data). Report "no field data", not pass or fail." — SIDE "Report" + BG "Chromium". This is the verdict rule of the already-split `lab-performance-tool-runs` row (whose sibling side cites SKILL.md:697) ⇒ same-surface (QUALITY 91); also `field-performance-cwv.md:134`.
2. **kotoba sibling-description-rewrites-round8.md:164/209/236**: dense SIDE tokens ("kagi owns vault auth + the CDP bridge; kake owns … the shared burner-chrome lease") but they are kotoba's **descriptions of other lanes** in a third-lane filename ⇒ n3 third-lane-report, never kotoba's side.
3. **kagi cdp-bridge-1password.md:57/60** (`## cdp-bridge open-popup is refused by design` / `will not scrape vault DOM`) and SKILL.md:40: kagi's own refusals on its mapped surfaces (secrets-vault-ops; musketeer-cdp-9222-profile-lease) ⇒ same-surface, not a new CDP row.
4. **mori observability-census-r1.md:142/145** ("The killed process was not the webbridge daemon… a webbridge OOM-death; this boot's kill is an unrelated desktop event"): mori's kill-classification in its own domain — a third-lane report about a kimi-webbridge process, not a claim on the plugin surface.
5. **chousa archived-export-intake.md:141**: see B6 — the n4-forgery vector; must screen no-claim-declared.
6. (bonus) **kake publish-channels.md:32 / SKILL.md:131**: "No non-GUI channel exists on this host (kimi-webbridge: 'not supported on Linux')" — a declarative non-use (no-claim-declared), but it factually tensions tabi's PROVINCE.md:6-7 premise (kimi-webbridge as primary substrate). Surface to the integrator as a cross-lane factual note, not a row.

## Screen-arithmetic note

Under the frozen counter, `unaccounted 0` is reachable by screens alone (J2 class) with
`newMapped 0`; every new row the chunk scribes propose should be checked against this scan's
same-surface and third-lane verdicts before it is committed, because a row wave 2 withdraws is
never kept (kill rule; QUALITY 91, 97). If the L1 wants honest `newMapped >= 2`, the only
defensible paths are B2 (kaidoku resolver stub) plus one L0-resolved contested-open (B3/B4) —
neither of which can be pre-committed by this scan.
