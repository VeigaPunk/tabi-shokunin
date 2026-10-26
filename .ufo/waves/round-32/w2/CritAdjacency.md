# CritAdjacency — adjacency attack, tabi round 32 w2 (attempt 1)

Seat: CritAdjacency (leaf; no dispatch, no browser, no network, no lane edits). Attacks: (`a`) whether
round 32 absorbs sibling ground (kaidoku's Playwright-over-CDP forensic capture; tameshi's general test
craft), (`b`) whether `PROVINCE.md` is unchanged and whether the new entry/SKILL section stays inside it,
(`c`) whether a "BiDi driver" in `scripts/` is within PROVINCE's "CDP session discipline … evidence
capture", and (`d`) what should be routed to a sibling instead. Revision attacked:
`b234a58920134424e0d104f137311ff54a16d26b`; claims frozen in `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`.

## Verdict

**No sibling ground is absorbed, the BiDi driver is inside tabi's province, and `PROVINCE.md` is unchanged
— but the round leaves one host-global side effect unrecorded and routes nothing to the two siblings whose
surfaces it touches.** `PROVINCE.md` is byte-identical to the baseline (`sha256 16c27b1…`, its only commit
`ff81c0f`, diff baseline..REV exit 0), and the new bytes contain zero sibling-ground terms
(`playwright|recordHar|har-schema|kaidoku|tameshi` = 0 in the entry, the lesson and the driver). The
"Owns (surfaces)" line `PROVINCE.md:9` names CDP only, but BiDi was already tabi ground before this round
(`corpus/README.md:168`, the round-1 matrix row "every CDP evidence surface tabi uses to its WebDriver BiDi
command or event", `locally measured: no`), and no sibling declares WebDriver/chromedriver/BiDi ground
(`grep` over kaidoku/tameshi/kama `SKILL.md`+`PROVINCE.md` → no matches; w1 `ConnSiblings.md:7` reaches the
same result from a wider sweep) — so C1 extends an already-claimed protocol inside the domain line, it does
not annex kaidoku's CDP/HAR capture or tameshi's craft. Three adjudications: (1) **defect, Low** — the
recipe's "throwaway profile" is profile-only: the w1 seat measured chromium's crashpad writing
`~/.config/chromium/Crash Reports` from these runs (`w1/SentinelPerimeter.md:218-236`, F6), and the landed
bytes are silent (`grep -c 'crashpad|disable-breakpad|disable-crash-reporter'` = 0 in entry, lesson, driver),
including in §7, which exists for exactly this class; that directory is shared with every other lane's
chromium launch on this host and is quoted by `corpus/adjacency.tsv:7-8` as tabi's side of the contested
musketeer lease. (2) **defect, Low** — `corpus/knowledge/webdriver-bidi-runtime-round-32.md:10-11` restates
the matrix's lane-scoped `locally measured: no` as a host-wide negative ("no BiDi endpoint had ever been
contacted on this host"), a claim about other lanes that no tabi instrument establishes (it is true in fact
only because w1 `ConnSiblings` swept the siblings, and the landed bytes cite no such basis). (3) **routed,
not landed** — the chromium 108-byte singleton-socket cap (`SKILL.md:2677`, `LOG.md:2130-2131`, lesson M5)
and the crashpad shared-dir fact both belong in kaidoku's hands, which self-launches chromium; the M2
gate-craft pattern is a single-lane observation that tameshi's "two independent lanes" rule forbids tabi
from handing over as general. `scripts/bidi-loopback-round32.mjs` itself is lane-local, fixture-only,
ephemeral-port and in-province; nothing there needs moving.

## Evidence (commands and exit codes; full log `.ufo/waves/round-32/w2/CritAdjacency/commands.txt`)

1. `git -C <lane> diff --exit-code d805d1d6… b234a589… -- PROVINCE.md` → **exit 0** (byte-identical).
2. `sha256sum PROVINCE.md` → `16c27b12a60dbbcc43903d40334c314f6587bd8703d1e890e076398eac1a946a`;
   `git log -- PROVINCE.md` → one commit, `ff81c0f round 0: minted as shonen` (exit 0).
3. `git diff --name-status 4181fffb… b234a589… -- PROVINCE.md scripts/ corpus/knowledge/ corpus/lessons/` →
   **exit 0**; `PROVINCE.md` absent; additions are `corpus/knowledge/webdriver-bidi-runtime-round-32.md`,
   `corpus/lessons/round-32.md`, `scripts/bidi-loopback-round32.mjs` (modifications to the matrix and the
   decision table).
4. `grep -c -i -E 'playwright|recordHar|har-schema|kaidoku|tameshi'` over the entry, lesson and driver →
   `0,0,0` (**exit 1**, no match) — the new bytes name no sibling surface.
5. `grep` tool, `(?i)webdriver|chromedriver|websocketurl|\bbidi\b` over
   `kaidoku-shokunin/{SKILL,PROVINCE}.md; tameshi-shokunin/{SKILL,PROVINCE}.md; kama-shokunin/{SKILL,PROVINCE}.md`
   → **No matches found** (independent of w1's sweep).
6. `grep -c -i -E 'crash-report|crashpad|disable-breakpad|disable-crash-reporter'` over entry, lesson,
   driver → `0,0,0` (**exit 1**); the only `crash` hit in `SKILL.md` is unrelated (`:2534`, a round-29
   self-test sentence). Contrast `w1/SentinelPerimeter.md:218-236` (F6, `settings.dat` mtime advanced
   `1793030748 → 1793030756`, crashpad `--database=/home/vgpnk/.config/chromium/Crash Reports`).
7. `grep -n 'ever been contacted'` in the entry → `:10` (**exit 0**), sentence closes at `:11`; matrix's own
   wording is lane-scoped (`corpus/knowledge/webdriver-bidi-capability-matrix.md:10,56` — "locally
   measured: no", "no row has been run on a BiDi endpoint").
8. `grep -n 'freePort()|--port=' scripts/bidi-loopback-round32.mjs` → `:45` `freePort()` (`listen(0,
   "127.0.0.1")`), `:77`, `:80` `--port=${port}` (**exit 0**) — no fixed `9222`/`9515`, so neither kama's
   listener census (`corpus/adjacency.tsv:11`) nor the contested musketeer lease (`adjacency.tsv:7-8`,
   fleet `.ufo/l0-questions.md:62`) is touched by the driver.
9. Driver header `:10-15` — imports only `FIXTURE_SHA256, VIEWPORT, serveFixture`; "it is a client, not the
   counter"; write scope "its own `--out` directory and a throwaway chrome profile under TMPDIR; never the
   lane, never credentials, never an off-loopback URL". `grep` for a URL argument shows only the two frozen
   fixture navigations (`:160` `/a.html`, `:231` `/b.html`) — no arbitrary-site driving capability, i.e. it
   captures evidence, it does not crawl (the `kake` split at `adjacency.tsv:6` is unaffected).
10. `node -e` over `corpus/evidence/round-32/bidi/receipt.json` → `runs=2 innerWidth=["640","640"]`
    (**exit 0**), which contradicts the drafting residue at `SKILL.md:2659` ("the `innerWidth` read itself
    is the driver run's to record (pending below)").
11. `git status --porcelain --untracked-files=no` → empty (**exit 0**) — the lane's tracked tree is clean at
    REV; the only untracked paths are other seats' `.ufo/waves/round-32/**` artifacts, untouched here.
12. `pgrep -fa 'chromedriver|chromium' | grep -c CritAdjacency` → `0` (**exit 1**) — no browser process was
    started by this seat; none to kill.

## Findings

### F1 — the recipe mutates a host-global directory the round's own §7 was written to record (Low; adjacency)

Attack: does the round's declared "throwaway profile" discipline (`SKILL.md:550-557`, quoted as tabi's side
of `adjacency.tsv:7-8`) hold for the BiDi recipe, and does the landing honour its own §7 purpose?

`w1/SentinelPerimeter.md:218-236` measured that every launched browser's crashpad handler uses
`--database=/home/vgpnk/.config/chromium/Crash Reports` — outside `--user-data-dir` — and that
`settings.dat`'s mtime advanced during the run; `liveRecord`'s cleanup removes only `scratch`/`chromeTmp`.
The landed bytes neither record it in `corpus/knowledge/webdriver-bidi-runtime-round-32.md:161-179` §7
("What the runs carried that the predicates do not read"), which already carries four sibling-wave items,
nor in the SKILL recipe (`SKILL.md:2671-2715`), whose launch args likewise lack
`--disable-breakpad --disable-crash-reporter`. §7's own precedent for an unfixable-this-round flag is
"recorded here and routed, not changed" (`:170-172`, the `--no-sandbox` item). This is the one place the
round writes outside its own scratch on a surface shared with every other lane that launches chromium on
this host (kaidoku does: `kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:66`,
`--user-data-dir=$(mktemp -d)`), and the `har`-free, loopback-only perimeter does not cover it.

Smallest safe correction (append-only; scripts are frozen, do not patch): one limitation bullet appended to
§7 of `corpus/knowledge/webdriver-bidi-runtime-round-32.md` citing `w1/SentinelPerimeter.md` F6 ("crash
reporting is host-global; the commited receipt keeps the flags it ran; add `--disable-breakpad
--disable-crash-reporter` at the next gate freeze; the receipt is not retro-edited"), plus one line in the
SKILL recipe step 1 or 17 naming the same. Do **not** amend the receipt — it is evidence.

### F2 — a host-wide negative about other lanes' activity, unsupported in the landed bytes (Low; adjacency)

`corpus/knowledge/webdriver-bidi-runtime-round-32.md:9-11`: "The capability matrix … stated `locally
measured: no` for all seventeen §2 rows: no BiDi endpoint had ever been contacted **on this host**." The
matrix's own bytes scope this to the lane (`webdriver-bidi-capability-matrix.md:10`: "locally measured: no;
no BiDi endpoint or browser was probed"; `:56` "no row has been run on a BiDi endpoint"). The entry's
explication widens a lane measurement into a statement about every lane on the host. It happens to be true
(w1 `ConnSiblings.md:7` swept the siblings and my check 5 above agrees), but the entry cites no such basis,
so the claim rests on evidence tabi does not hold. This is the adjacency axis's false-provenance class, not
a coverage defect: no verdict in §2 depends on it.

Smallest safe correction (append-only): a correction paragraph after §8 scoping the sentence to "no BiDi
endpoint had been contacted by this lane", with the sibling basis named
(`.ufo/waves/round-32/w1/ConnSiblings.md:7`), or the citation added to the §7 wave-1 block.

### F3 — drafting residue contradicts the committed receipt (Low; document hygiene, not adjacency)

`SKILL.md:2659` (new round-32 section, R7 row): "the `innerWidth` read itself is the driver run's to record
(pending below)." The committed receipt records it in both runs (`"step":"window.innerWidth","value":640`,
check 10), the entry's R7 evidence claims the same (`webdriver-bidi-runtime-round-32.md:73`), and the recipe
step 9 does it (`SKILL.md:2698`). "pending below" is a scribe-time forward reference that survived
into an append-only section. Smallest safe correction: an append-only correction in the round-32 corrections
block citing `SKILL.md:2659` as superseded, or (if the section is still w2-editable by the L1) the three
words replaced — nothing else in the row is affected.

## Adjudications (holds)

- **H1 — `PROVINCE.md` unchanged, and the new surface is inside it.** `PROVINCE.md:9` enumerates "CDP
  session discipline (endpoints, targets, screenshot/DOM evidence capture)", and the round's second
  transport is not CDP. Read as an exhaustive list this would be an overreach; the lane's own history
  settles it otherwise: the BiDi protocol map is a round-1 corpus row on tabi's own surfaces
  (`corpus/README.md:168`), and the domain line ("driving real browsers … with evidence discipline") plus
  the owned item "dynamic-page evidence patterns (what to capture so a claim about a page is
  re-verifiable)" cover a fixture-only evidence driver. Holds: in-province. The surface enumeration is now
  one protocol family short of what the lane runs, but the amendment **must not be made by a lane edit**:
  `PROVINCE.md` is census-frozen (`SKILL.md:1967`, `LOG.md:1022`) and its `:9` is a line anchor for three
  `corpus/adjacency.tsv` rows (`:2`, `:5`, `:11`), which `scripts/check-adjacency.mjs` resolves by exact
  line (`:72`, `:738-741`). Routed defect, not a repair: ask for the census-time amendment (add "browser
  session discipline over CDP and WebDriver classic/BiDi" to the owned surfaces) and leave the current
  bytes alone.
- **H2 — no absorption of kaidoku's ground.** kaidoku owns Playwright-over-CDP forensic capture and its
  admission gate is a HAR-schema-valid capture (`kaidoku-shokunin/corpus/knowledge/2026-10-14-r10-01-queue-ops.md:151`).
  The new bytes name no HAR, no `recordHar`, no Playwright (check 4), and the entry's R10–R13 network rows
  are explicitly bounded below that gate (`webdriver-bidi-runtime-round-32.md:101-102` "Not a complete request
  ledger", "Not wire truth"; §5 "Predicate-scoped verdicts"). The w1 classification (`ConnSiblings.md:7`)
  is independently confirmed by check 5. Holds.
- **H3 — no absorption of tameshi's craft.** Let us test the strongest candidate: criterion 86's
  "distinct surfaces backed by distinct runs" is reusable gate craft in tameshi's sense. It is stated
  lane-scoped ("the round records the plain distinct counts beside the gate's reading",
  `corpus/QUALITY.md:522-530`) and is not claimed general; tameshi's own charter refuses product-domain
  gates and admits a pattern only from **two** independent lanes (`tameshi-shokunin/PROVINCE.md:14-17`), so
  one lane's finding cannot transfer as craft. Holds — with a route recommendation below, not a claim.
- **H4 — the `scripts/` driver is a lane instrument, not fleet tooling.** kumitate's `scripts/` band is the
  ufo-fsd origin script layer and the Kimi substrate (`kumitate-shokunin/PROVINCE.md:12,15`); every lane
  keeps "the lane's own instruments `scripts/*.mjs`" (same lines), tameshi's charter says "every lane's gate
  remains its own" (`tameshi-shokunin/PROVINCE.md:14-17`). A fixture-only client with no arbitrary-URL
  argument (check 9) and an ephemeral port (check 8) is exactly that. Holds.
- **H5 — the ledger needs no new row.** `corpus/adjacency.tsv` is unchanged and correctly so: no sibling
  claims WebDriver/chromedriver/BiDi (check 5), so there is no overlap to disposition, and the contested
  9222 lease and kama's census are untouched (check 8). Holds.

## Routed to siblings (report, never absorb)

1. **kaidoku** — two host facts it does not hold (`grep -i 'singleton|108.byte'` over its SKILL/PROVINCE/
   knowledge returns only unrelated REA/bridge-socket hits): (a) chromium's singleton socket path is capped
   at 108 bytes, so a deep `TMPDIR`/`--user-data-dir` fails `session not created: Chrome instance exited`
   (`SKILL.md:2677`; `LOG.md:2130-2131`; lesson `M5`; red/green
   `.ufo/waves/round-32/measure/c1-socket-path-red-green.txt`). kaidoku launches with
   `--user-data-dir=$(mktemp -d)` (short), so no live hazard today — record the cap, not a bug report.
   (b) crashpad writes to `~/.config/chromium/Crash Reports` regardless of `--user-data-dir` (F1), i.e. the
   forensic lane's own launches also write a shared host dir; `--disable-breakpad --disable-crash-reporter`
   is the flag pair. Route as a boundary note in the round report; kaidoku owns any entry it writes.
2. **tameshi** — the M2 pattern (a gate counting row listings rather than distinct surfaces; one transcript
   cited as two runs; the gate's own bytes accepted as the driver under another path;
   `w1/CritC1Forgery.md`, criterion 86, `corpus/lessons/round-32.md:74-80`) is single-lane evidence. Route
   it explicitly as **unconfirmed single-lane**, which tameshi's two-lane rule forbids admitting; do not
   present it as craft.
3. **kama** — nothing to route: ephemeral chromedriver port, loopback-only fixture, teardown recorded in the
   recipe (check 8), so the listener census is unaffected.

## Axes this touches

`adjacency` (F1 shared host surface + routing gap; F2 host-wide negative; H1 routed province amendment).
`calibration` only incidentally through F3 (a landed sentence contradicts the round's own evidence), no
score is asserted by this seat.

## Scope, scratch, processes

Read-only git in the lane (no clone was needed: no lane script was run); no browser, no network fetch, no
install, no lane edit, no commit, no subagent. Scratch `/fast/scratch/hyaku/tabi-r32/CritAdjacency` was
created for the output dir contract and removed at yield; command log kept at
`.ufo/waves/round-32/w2/CritAdjacency/commands.txt`. `pgrep` for owned chromedriver/chromium: none
(check 12).
