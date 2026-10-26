# CritScreenOthers — w2 falsify: the eleven remaining screen rows at `042d6d9`

**Verdict.** Eight of the eleven assigned screen rows hold; the remaining three share one defect
(**low severity, label-only, not predicate-affecting**): kake `PROVINCE.md:396`, `:422`, `:440` are screened
`no-claim-declared` (`surface -`) although they are the same "we observed no live crawl" disclaimer the ledger
screens `same-surface` at kake `:303` and restates as a split at `:323`, so the round's own ordered decision rule
(`SKILL.md:2863-2873`, step 2 before step 4) reaches an already-owned surface and the `no-claim-declared` label is
the wrong cell — the accounting is right, the traceability is not. The contested question — is kagi `:20`'s
`cdp-bridge` verb a distinct secrets-side CDP surface that should be mapped — is answered **no** by local
evidence: kagi's own ownership partition puts the `cdp-bridge ensure` NMH write *inside kake's leased profile*
(`kagi-shokunin@69b61db…:corpus/adjacency.tsv:83`), the map's lease row already quotes the NMH clause
(`corpus/adjacency.tsv:8`, quote "kagi pins only the 1Password native-messaging manifest"), the verb's only
browser-touching leg is a `curl …/json/version` reachability probe on that same `9222` endpoint and `open-popup`
is refused by design (`kagi@69b61db…:corpus/knowledge/cdp-bridge-1password.md` §"`cdp-bridge status`", §"`cdp-bridge
open-popup` is refused by design"), and the secrets facet is already `refused-route` at map row 9
(`secrets-vault-ops`, kagi `:3` / tabi `PROVINCE.md:16`). The frozen counter is met at the integration commit
(`predicate true`, `candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4`, exit 0; `check-adjacency`
`clean rows=14 verified=14 findings=0`, exit 0), and the smallest safe correction for the defect leaves both
readings identical (probe commit `0c973cb3e8263f553b9b260bcff5f9abf1a395b4`: gate clean, counter `predicate true`).

## Items (one named thing each; verdict first)

### 1. kagi `PROVINCE.md:20` → `same-surface musketeer-cdp-9222-profile-lease` — **holds**
The strongest counterexample is the one the w1 seat itself named and declined (`w1/AdjKagi.md:76-89`): a new
`cdp-bridge`/manifest surface, `contested-open` with kagi. Tested against four local facts, it fails:

- kagi's own partition, at the candidate pin: `69b61db…:corpus/adjacency.tsv:82` = profile dir
  `kake / contested / presence-only`; `:83` = `NativeMessagingHosts  kagi  writer  declared  …  the NMH dir +
  1Password manifest are written by this domain's `cdp-bridge ensure` inside kake's leased profile; the writer lane
  owns the row`. The ground is the shared profile, not a second CDP endpoint.
- the map's lease row already carries that half in its quote: `corpus/adjacency.tsv:8` (kagi, `contested-open`) quotes
  kagi `:43` "*contested with kake* … kagi pins only the 1Password native-messaging manifest — the profile dir
  itself is presence-only". A second surface over the same sentence would be duplicate authority, not new evidence.
- the browser-touching behaviour is bounded: `cdp-bridge status` prints names and one
  `curl -fsS --max-time 1 http://127.0.0.1:9222/json/version` reachability line; `open-popup` exits 2 with
  "use agent-browser; will not scrape vault DOM". No target enumeration, no session, no DOM — the line claims no
  browser work to map.
- the secrets facet is already dispositioned `refused-route` at map row 9 (`secrets-vault-ops`, kagi `:3` ← tabi
  `PROVINCE.md:16` "secrets (→ kagi").

Structural check: the `(surface, sibling)` pair `musketeer-cdp-9222-profile-lease/kagi` already exists at row 8, so
a second row on it is `duplicate_row`; a coined surface would need a `tabi | round-33 |` L0 line that only the L1
files (brief; seats draft, L1 files) — it is not seat-available this round, and on substance it would assert a
browser claim the inventory line does not make. Presence caveat: the substrate is absent on this host
(`ls ~/.local/bin/the-janitor ~/.local/share/the-musketeer` → exit 2), so the verb semantics come from kagi's
pinned knowledge (historical; kagi `PROVINCE.md:10-17` erratum), not a live re-measure; the screen does not depend
on presence.

### 2. kagi `PROVINCE.md:59` → `same-surface` (same surface) — **holds**
Line 59 is a deliberate refusal ("the CDP lease/profile ownership question is reported to the integrator, never
adjudicated here"). Step 2 precedes step 4, and the lease surface is owned for kagi at row 8; the screen matches
that ordering and adds nothing.

### 3. kagi `PROVINCE.md:81` → `same-surface` (same surface) — **holds**
The quote is a mid-sentence fragment ("method, secret-scanner ownership, browser leases or authenticated
endpoint", verbatim on :81, 8 words / 67 non-space). The note's two anchors are accurate: kagi `:67` "kake holds
the musketeer profile lease (contested, above)" and `:43` records the contest. No distinct surface.

### 4. kaidoku `PROVINCE.md:137` → `same-surface cdp-runtime-observation` — **holds**
Row 2 (`cdp-runtime-observation`, kaidoku, `ruled`) already answers this ground; its ruling
(`corpus/lessons/round-16-verifier-spotcheck.md:142`) reads "**kaidoku** keeps CDP only as an REA provider surface
for shipped-artifact analysis (… PROVINCE.md:53, "Runtime observation (CDP)"). It cites tabi for browser-side
mechanics." `:137` is the same r3 recipe plus `node --inspect`. Residual, recorded not repaired: the line has two
referents (web CDP and node/V8-inspector) and one reason cell; the note column carries the carve-out ("the node
`--inspect` half is not tabi browser ground"), so the accounting is honest but the note is load-bearing.

### 5–7. kake `PROVINCE.md:396`, `:422`, `:440` → `no-claim-declared`, `surface -` — **defect (low)**
Evidence that the label is out of order and internally inconsistent:

- `SKILL.md:2863-2873` fixes an ordered rule (step 2 at `:2868`, step 4 at `:2872`, preamble "a real overlap is never
  screened" at `:2863`): step 2 "Does a verification-passing map row already own that surface for that sibling? Then
  `same-surface`" is asked **before** step 4 "declares no claim on this lane's surface … Then `no-claim-declared`";
  `SKILL.md:2879-2881` adds that when the same line could be mapped truthfully it must be, and that the screen ledger
  is for lines the map must not answer for.
- The identical disclaimer at kake `:303` ("This contract does not observe live fetches, redirects, caching, or
  crawler behavior") is screened **`same-surface robots-txt-publisher-audit-vs-client-obedience`** (the
  `adjacency-screen.tsv` row for kake:303),
  and the restated split at `:323` ("Client-side crawler discipline stays with tabi") is **`same-surface
  crawler-discipline-vs-publishing`** (the row for kake:323). `:396` "no robots.txt was served and no crawl was observed, so no
  crawler behaviour is", `:422` "no URL was served under test and no crawl was", `:440` "no URL was served under
  test and no crawl was observed." are the same proposition in later round sections (55–57).
- `corpus/lessons/round-33.md:111-112` records the split without distinguishing the two disclaimer forms, and the
  recorded overrides at `:113-119` do not include these three, so the inconsistency is not documented as an override.

Blast radius: none on the predicate — the counter treats any closed reason with `-` as a valid screen, so it cannot
catch this; that semantic guard is this wave. The line is not hidden, not double-counted, no map row is owed.
Impacted axis: C1 (ledger semantics / traceability), not C1's numeric predicate.

Smallest safe correction (proved inert): in the three rows change reason to `same-surface` and surface to
`robots-txt-publisher-audit-vs-client-obedience` (the row whose sibling line kake `:304` owns the
publisher-audit/client-crawl boundary and whose screen row already carries the `:303` limit), keeping quotes and
notes, with the note saying the line is a knowledge-entry provenance limit; `crawler-discipline-vs-publishing` is
the acceptable alternative if the L1 reads the sentence as the client/publisher split — either is step-2-ordered.
Then update the count sentence at `corpus/lessons/round-33.md:109-112` (`same-surface` 36 → 39, `no-claim-declared`
4 → 1, and the enumeration at `:111-112`). Probe at `0c973cb3…`: `check-adjacency --at 0c973cb3… ` exit 0 (`clean`, rows 14 / verified 14,
findings 0) and the frozen counter exit 0 (`predicate true`, screened 43, unaccounted 0, newMapped 4,
`screenFindings []`) — the relabel changes no number.

### 8. kake `PROVINCE.md:72` → `not-browser-sense` — **holds**
Two regex hits on the line: the project token `burnerchrome` (the deciding hit) and `browser-profile` inside the
sentence's own disclaimer ("it does not establish live deployment or grant publication, browser-profile, DNS or
account authority"). A local-checkout presence note claims no browser work; no operation, no surface.

### 9. kengaku `PROVINCE.md:54` → `not-browser-sense` — **holds (borderline reason, recorded)**
Context `PROVINCE.md:48-54` is a report-out to kumitate; the token is a taxonomy class ("treat `source=journal`
rows as scraper outages"), and kengaku's knowledge makes `journal` concrete: `bench-arena-fresh-run.md:20`
"falls back to `journalctl -u qwen-coder.service` `print_timing` lines", `:93` `BRANCH=journal`, `:97`
`telemetry_source=journal` from a field-count bug. No browser is driven and no crawl described, so no surface is
claimed. `third-lane-report` is a defensible alternative (the seat said so, `w1/AdjOthers.md` §Findings 3); only one
reason is allowed and both exclude a map row, so the disposition is unaffected.

### 10. kotoba `PROVINCE.md:73` → `no-claim-declared` — **holds**
The row's own coverage cell is `none`, and the sentence ends "it states no split with kotoba on its scope
surfaces". Kotoba has no map surface and claims none; nothing to map. (`third-lane-report` would misdescribe it:
the row is kotoba's own classification, not a report of an action another lane took.)

### 11. tsukuroi `PROVINCE.md:150` → `third-lane-report` — **holds**
The line restates revenger OUT-009 and states "It is not a tsukuroi grant of ownership"; the browser words are
revenger's declaration, already map row 5 (`rea-browser-runtime-evidence`, revenger, `contested-open`, quoting
revenger `PROVINCE.md:5` "browser/Electron runtime evidence — using the REA skill and its toolset,"). tsukuroi has
no map surface of its own; step 3 is the ordered answer.

## Mechanical re-check of all eleven rows (no finding)

`corpus/adjacency-screen.tsv` sha256 `a3ed0ad08f23566cbeea664a10c1fe5e0754aeb801eadab873556118e56950e1`;
map sha256 `da1207ae6e2943fd7a2fcd3e377cb99a6f8bc459b35c804975e9ceb93dd96ea1`. Each row's quote was matched with
`in` against the pinned line bytes read with `git cat-file -p <pin>:PROVINCE.md`; all eleven are verbatim and in
bounds (words / non-space chars): kagi 20 = 4/119, 59 = 10/61, 81 = 8/67; kaidoku 137 = 5/46; kake 72 = 8/55,
396 = 14/65, 422 = 10/36, 440 = 11/45; kengaku 54 = 6/41; kotoba 73 = 10/43; tsukuroi 150 = 11/64.

## Commands and exit codes (scratch clone at `042d6d9abf97d567d495652a85eabc851b81adc1`, TMPDIR under the seat scratch)

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                          # exit 0
$ git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1                    # exit 0
$ git -C "$S/clone" rev-parse --show-toplevel                                                       # $S/clone ; HEAD 042d6d9…
$ node …/.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo "$S/clone" \
      --fleet /home/vgpnk/Projects/shokunin --rev 042d6d9… --json
  exit=0  candidates=52 mapped=9 screened=43 unaccounted=0 newMapped=4 predicate=True screenFindings=[]
          adjacency={verdict:clean,rows:14,verified:14,findings:0}
          newMappedRows = rows 12-15 (kake: js-rendering, robots, accessibility, crawl-budget; all split-declared)
$ node "$S/clone/scripts/check-adjacency.mjs" --at 042d6d9… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json
  exit=0  {"verdict":"clean","rows":14,"verified":14} findings [] selfRulings [2]
$ git -C "$S/clone" add corpus/adjacency-screen.tsv && git -C "$S/clone" -c user.name=CritScreenOthers \
      -c user.email=CritScreenOthers@scratch.local commit -m 'crit probe: kake 396/422/440 reason -> same-surface'
  → 0c973cb3e8263f553b9b260bcff5f9abf1a395b4
$ node "$S/clone/scripts/check-adjacency.mjs" --at 0c973cb3… --repo "$S/clone" --fleet … --json   # exit 0 clean 14/14
$ node …/c1-adjacency-sweep.mjs --repo "$S/clone" --fleet … --rev 0c973cb3… --json
  exit=0  candidates=52 mapped=9 screened=43 unaccounted=0 newMapped=4 predicate=True screenFindings=[]
$ ls ~/.local/bin/the-janitor /home/vgpnk/.local/share/the-musketeer                                  # exit 2 (absent)
$ pgrep -fa 'chromedriver|chromium'   # only host pid 1371 /usr/bin/earlyoom … --prefer (…|chromium|…) — not mine
```

Pins read with `git -C <sibling> cat-file -p <pin>:<path>`: kagi `69b61db…` PROVINCE `:20,:43,:59,:67,:81`,
corpus/adjacency.tsv `:82,:83`, corpus/knowledge/cdp-bridge-1password.md; kaidoku `8b9634ed…` PROVINCE `:53,:137`;
kake `0440485…` PROVINCE `:72,:302-304,:323,:338,:396,:422,:440`; kengaku `7984fd30…` PROVINCE `:48-54`, SKILL `:39`,
corpus/knowledge/bench-arena-fresh-run.md `:20,:93,:97`; kotoba `65a5c7a6…` PROVINCE `:73`; tsukuroi `9cc9aa77…`
PROVINCE `:150`; lane `corpus/lessons/round-16-verifier-spotcheck.md:142`, `SKILL.md:2836-2882`,
`corpus/lessons/round-33.md:100-119`, fleet `.ufo/l0-questions.md:62`.

## Hygiene

No browser launched, no network fetch, no tool installed or upgraded (pacman untouched); no lane tracked file, lane
git index/jj state, fleet repo, sibling repo or `shokuknow` written; the only commit is inside the scratch clone
(`toplevel == "$S/clone"` asserted before it) and it is a probe, not a proposal. Scratch removed after receipts
were copied.

## Deliverables (under `.ufo/waves/round-33/w2/`)

- `CritScreenOthers.md` — this report
- `CritScreenOthers/c1-integration.json` — frozen counter at `042d6d9` (predicate true)
- `CritScreenOthers/adjacency-gate.json` — `check-adjacency` at `042d6d9` (clean 14/14)
- `CritScreenOthers/c1-corrected.json`, `CritScreenOthers/adjacency-gate-corrected.json` — probe at `0c973cb3`
- `CritScreenOthers/digests.txt` — sha256 of the four JSON receipts plus `corpus/adjacency-screen.tsv`
  (`a3ed0ad0…56950e1`) and `corpus/adjacency.tsv` (`da1207ae…dd96ea1`)
