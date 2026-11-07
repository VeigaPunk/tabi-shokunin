FINDINGS

# R77Review1 — false greens in `scripts/check-filechooser-r77.mjs`

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `1320d428f0c0957b46d6969b59c122fd69199331`, policy `dcdf582add58`.
Counter reviewed at the frozen bytes: `sha256 ac17ff8dda4661e2e6217831158de5e1e19a584f3f7dad918b77faee6bab4aeb` (re-verified after every pass,
`sha256sum scripts/check-filechooser-r77.mjs scripts/chrome-cdp-filechooser-round77.mjs` → `ac17ff8d…4aeb`,
`9954db07…58a6`, exit 0). Nothing in the lane was modified:
`git -C … status --porcelain` shows only other seats' paths (`.ufo/waves/round-77-seats/`, `w1/R77Exec*.md`, …); no
counters, driver, battery, kill power or walked tree was touched. All crafted receipts, scores and copies live in
`.ufo/waves/round-77-seats/R77Review1/`; scratch was `/fast/scratch/hyaku/tabi-r77/R77Review1/` (removed).

**Baseline** (the frozen counting command, as specified, on the L1 receipt):
`… .ufo/waves/round-77-seats/R77Review1/baseline.json` → `verdict clean`, `checkCount 183`, 0 findings, rc 0;
`timeline.ownGaps 11`, `ownEvents 79`; `limit` = 19 rows, `absNeed 40` / `gapNeed 9` for every 79-event prior
(19/9, 18/9 for the degenerate priors) — identical to the dispatch status block.

**Bottom line.** The page-event plane is tight: every mutation of event content, order, type, read bytes, set
params/result, backendNodeId or server-log query that I built was refused (list under "Controls that held"). The
false greens are elsewhere: (F1, F2, F9) the prior-set walk cannot see three classes of receipt that sit *inside*
the two walked trees; (F3) `host-argv` pins 6 of 17 argv slots, so a decoy `--user-data-dir` / `--remote-debugging-port`
passes while Chromium honours the decoy (measured); (F4) `mainFrameId` is self-referential — the receipt may carry a
`Page.getFrameTree` result that contradicts it and still score clean; (F5–F8) bookkeeping fields that no check reads
(`sweeps`, `host.childExit`, `devtoolsListening.browserId`, unbounded `elapsedMs`, a zero-length post-close window).

---

## Findings

Severity, crafted file (all under `.ufo/waves/round-77-seats/R77Review1/`), measured counter result, and whether the
declared limit admits it.

### F1 — HIGH — the walk is gated on raw bytes, so a JSON-escaped schema string hides a receipt
`scripts/check-filechooser-r77.mjs:272` `if (!b.includes(needle)) continue;` gates on the literal byte string, while
the receipt predicate at `:276` tests the *parsed* `j.schema === SCHEMA`. A file whose schema value is written
`"tabi-chrome-cdp-filechooser-r7\u0037"` parses to the schema but never contains the needle, so the walk `continue`s
before parsing it. The check's own detail sentence (`:280`) claims "receipts of schema tabi-chrome-cdp-filechooser-r77
in the round-77 wave/evidence trees" — a claim the implementation cannot meet.

Craft `w1-escaped-schema.receipt.json` (a full receipt, unchanged in content, schema escaped) placed at
`.ufo/waves/round-77/extra/escaped.receipt.json` inside a scratch lane whose `corpus/evidence/round77` and
`.ufo/waves/round-77` are walked:

    LANEARG=$L PS=$L/prior-set.txt node score.mjs "$L/corpus/evidence/round77/chromium-file-chooser/receipt.json" tabi-r77-rev-w1
    → rc 0, verdict clean, findings [], walk.outside [], walk.unparsable []

Control in the same lane, same run family: a plain foreign receipt (`different nonce`, byte-readable) →
`rc 1`, `["prior-set-complete"]`, `outside ["corpus/evidence/round77/ctl/foreign.receipt.json"]`; a 30 MB foreign
receipt with a distinct nonce → `rc 1`, `["prior-set-complete"]` (so size is not the issue); `chmod 000` copy →
`rc 1`, `["prior-set-unparsable"]` (`… (unreadable)`); truncated `.json` carrying the schema → `rc 1`,
`["prior-set-unparsable"]`.

**Inside the declared limit? No.** The limit carves out receipts "outside the prior set and outside the two walked
trees"; this file is inside a walked tree and the counter still reports clean.

### F2 — HIGH — prior-set identity is the nonce, so a second, contradictory receipt of the run's own nonce is invisible
`:276` excludes any parsed receipt whose `j.nonce === expectNonce`. Nothing checks that this is the receipt under
test (path/realpath/bytes). Craft `w2-dupe-same-nonce.receipt.json`: a copy of the receipt under test with
`events[10].ret = "hex:00"` and an added `note`. Placed in the walked tree, the run is `rc 0`, verdict `clean`,
`outside []` — the tree then holds two mutually contradictory receipts of `tabi-r77-rev-w1` and only one is scored
(measured in the same run as F1; the dupe was present in that clean run, together with F1's and F9's files).

**Inside the declared limit? No.** Same reasoning as F1: in-tree, different bytes, never reported.

### F3 — MEDIUM/HIGH — `host-argv` pins 6 of 17 slots; a decoy profile/port passes and Chromium honours the decoy
`:222` (`argvOk`) checks length 17, `[0] /usr/bin/chromium`, `[1] --headless=new`, `[3] --remote-debugging-address`,
`[4] --user-data-dir=…profile-<tok>`, `[15] --window-size`, `[16] about:blank` (plus "no old-headless anywhere").
Indices 5–14 are unconstrained. Everything derived from the argv (`upload.dir`, `devtools-port-binding`,
`fixture`/`serverLog`) is derived from those six slots, so a decoy in a free slot is invisible.

Craft `g16-dup-userdatadir.json` — `argv[6] = "--user-data-dir=/fast/scratch/elsewhere/profile-decoy"`,
`argv[9] = "--remote-debugging-port=9999"`, everything else identical:

    node score.mjs …/g16-dup-userdatadir.json tabi-r77-l1-dcdf582add58 → rc 0, clean, findings []

That the decoy *wins* is measured on the pinned binary, not assumed:

    /usr/bin/chromium --headless=new --remote-debugging-port=0 --remote-debugging-address=127.0.0.1 \
      --user-data-dir=…/chr/A … --user-data-dir=…/chr/B --remote-debugging-port=39997 --dump-dom about:blank
    → only `…/chr/B` exists (`ls -d A B` → A: No such file; B: present)
    → stderr `DevTools listening on ws://127.0.0.1:39997/devtools/browser/467daef7-…`

So a receipt can satisfy `host-argv`, `upload-binding` and `devtools-port-binding` while asserting a launch whose
real profile dir and debugging port were different. The battery's own argv cases
(`scripts/negatives-filechooser-r77.mjs:108-114`) only move the *pinned* slots
(`splice(1,1)`, `[1]=--headless=old`, `[13]=--headless`, `[4]` mangled, `[0]` replaced, `[1]↔[5]`, `[3]↔[13]`) and
cannot express a decoy in a free slot; kill power has three argv mutants (headless/address/profile) and likewise
cannot.

**Inside the declared limit?** The blanket clause ("nor a receipt fabricated from nothing that satisfies every
check") would cover anything that passes, but the named check `host-argv` asserts a specific thing — that argv is
the pinned launch line — and F3 shows the assertion is 10 slots weaker than a reader would infer. Treated as a
defect of the check, not as a declared limit.

### F4 — MEDIUM — `mainFrameId` is self-referential; the receipt may contradict its own `Page.getFrameTree`
`:393-396` binds `r.mainFrameId` only to the *event log* (`:393` `e.params.frameId === mf`, `:394` nav frame and
url) and to the `/^[0-9A-F]{32}$/` shape. The `Page.getFrameTree` send is allow-listed with `{}` (`:399`
`EMPTY`) and its result is never read; `allowed()` (`:400-407`) checks only `id`/`method`/`params`, so send-log
entries may carry arbitrary extra keys unread.

Craft `g20-getframetree-contradiction.json` — `cdpSendLog`'s `Page.getFrameTree` entry gains
`result.frameTree.frame.id = "BBBB…"` / `url = http://127.0.0.1:1/?run=nope`, while `mainFrameId` and every
`Page.fileChooserOpened.frameId` are `"AAAA…"`:

    → rc 0, clean, findings []

`g21-sendlog-extra-keys.json` (every send entry gains `note: "fabricated response <id>"`) → rc 0, clean.
The battery only tests the frame id's *case* (`negatives:195`) and per-event mismatches (`:191-192`).

**Inside the declared limit?** Same treatment as F3: `frame-binding` claims to bind the event log's frame ids to
"the main frame"; it binds them to each other only.

### F5 — LOW/MEDIUM — `sweeps` and `host.childExit` are read by nothing
`grep -c sweeps scripts/check-filechooser-r77.mjs` → `0` and `grep -c childExit …` → `0` (both exit 1; no line
in the file contains either token). `teardown-closure` (`:532`) reads only `teardown.{postKillSweepCount,survivors,
sweepError,portProbes,postKillCurl}`.

- `g01-sweeps-garbage.json` (`sweeps = {preLaunch:99, midRun:0, postKill:99, note:"fabricated"}`) → rc 0, clean.
- `g02-childexit-clean.json` (`host.childExit = {code:0, signal:null}`) → rc 0, clean.
- `g15-childexit-null.json` (`childExit` and `sweeps` deleted) → rc 0, clean.

The receipt may therefore claim zero mid-run sweeps or a clean browser exit (or omit both) with no finding, while
the "reaped" claim rests entirely on the self-reported `teardown` block.

### F6 — LOW — `host.devtoolsListening.browserId` is unread; only the url binds
`browserId(host)` (`:236`) parses the uuid out of `devtoolsListening.url`. Craft
`g04-devtools-browserid-field.json` (`browserId` set to `99999999-…` while the url keeps `a3afaaff-…`) → rc 0,
clean. The receipt can carry an internal contradiction about which browser it talked to.

### F7 — LOW — the post-close observation window has no minimum
`:354` requires only `r.closedAt >= marks[last].at` and `lateAfterClose === 0`. Craft
`g19-late-window-zero.json` (`closedAt` = last event's `at` + 0.1 ms) → rc 0, clean: the "nothing arrived after
close" claim is satisfied with an empty window. (Tightening the upper bound on the *last mark* instead is caught:
`g17-closedAt-equal-lastmark.json` and `g18-mark-window-tight.json` both → rc 1, `["event-leg-window"]`, because the
last leg's own events then fall outside their window.)

### F8 — LOW — `elapsedMs` has a floor but no ceiling
`:300` `if (!num(l.elapsedMs) || l.elapsedMs < 290) bad('elapsedMs');`. `g05-elapsed-huge.json` (every leg
`999999999`) → rc 0, clean. Harmless, but the per-leg timing claim is unbounded while `run-window` bounds the total.

### F9 — LOW — an array-wrapped receipt is invisible (declared, but still a container inside the trees)
`:276` requires `isObj(j)`, so `[ {schema, nonce, events} ]` is neither `outside` nor `unparsable`.
`w3-array-wrapped.receipt.json` in the tree → rc 0, clean (same run as F1/F2). The header defines a prior as "a
parsed object whose top-level schema is the receipt schema", so this is inside the letter of the declaration; it is
listed because the walk's stated purpose is completeness inside the trees.

### F10 — INFORMATIONAL — an opening can be re-attributed between two set-less legs that open the same node/mode
`chooser-event-binding` binds an opening to `afterSendId` = a leg's `triggerSendId` whose `opened` is true and whose
`backendNodeId` matches, and to `setSendId === afterSendId + 1` when the leg sets files. Legs without a set
(`pick-empty`, `dir-mode`, `intercept-cancel`, …) have no adjacency constraint, so openings may be swapped among
them provided the `afterSendId` order stays non-decreasing. Craft `g24-open-swap-setless.json` (swap the openings
of `pick-empty` and `intercept-cancel`, array positions swapped too) → rc 0, clean. Both legs genuinely open a
chooser on node 5 in `selectSingle`, so no false content — but leg attribution is inferred, not proven. Swaps that
do lie are killed: `g22-open-swap-homogeneous.json` (set-bearing leg) → rc 1 `["chooser-event-binding"]`;
`g23-open-swap-heterogeneous.json` → rc 1 `["chooser-event-binding","leg-pick-single-opened",
"leg-pick-multiple-opened","mode-law","legshape-consistency"]`.

---

## Controls that held (evidence the event plane is tight)

Each is the L1 receipt with exactly one semantic change, scored with the frozen command; `rc / finding ids`:

| craft | change | result |
|---|---|---|
| `g07-nodeid-remap.json` | backendNodeId 5/7/14/18 → 101/102/103/104 everywhere consistent | rc 1 — 10 × `leg-*-opened` + `legshape-consistency` (the SHAPE constants pin the ids) |
| `g09-filetype-event.json` | read `files[0][2]` → `text/html` | rc 1 — `read-law` |
| `g10-setresult-shape.json` | `setResult` `{}` → `{ok:true}` | rc 1 — `leg-records`, `empty-list-law` |
| `g11-readret.json` | one read `ret` → `hex:deadbeef` | rc 1 — `leg-pick-single-read`, `read-law`, `legshape-consistency` |
| `g12-serverquery.json` | `serverLog` `/` row `query` → `run=other` | rc 1 — `server-log-binding` |
| `g14-events-shuffle-at.json` | two adjacent events' `at` swapped by 0.1 | rc 1 — `event-leg-window` |
| `g15-tsgrid.json` (as `f15`) | one `ts` off the 0.1 ms grid | rc 1 — `event-time-quantum` |
| `g17/g18` | `closedAt` / last mark tightened | rc 1 — `event-leg-window` |
| `g08-upload-order.json` | `upload.files` key order reversed | rc 0 — by design (keys are sorted before comparison, `:233`) |
| `f00/f01…f15` | first harness pass | all refused, but *for harness reasons*: my relabel had not rewritten the pinned ready-expression (caught by `send-log-allowlist`) and the in-tree L1 receipt then failed `nonce` (caught by `prior-set-complete`). Kept as evidence that the nonce is bound through the ready expression (`:404` `readyExpr`) and the `Page.navigate` url (`:394`); superseded by the `g*` series, which mutates nothing but the field under test. |

Not reproducible as a false green: "a set on a node id that is not the opened one but consistent everywhere"
(refuted by `g07` — the SHAPE constants `changed('s',…,5,…)`, `('m',…,7,…)`, `('d',…,14,…)`, `('k',…,18,…)` pin
them), "an opening moved between legs with send ids rewritten consistently" (refuted by `g22`/`g23`, plus F10's
narrow vacuous case), and "read `ret` on legs the selection model does not predict" (refuted: `read-law` compares the
*exact* list of reads `same(reads.map(…), wantReads)`, so an extra read is a finding).

## The laws: can they be satisfied by a receipt whose page saw something else?

I could not build one. `selection-law`, `cancel-law`, `empty-list-law`, `read-law` and `activation-law` are all
re-derived from the same page event array that the per-leg SHAPE compares field by field (`:293-335` pins every leg
record; `:416-436` re-derives `seq/trusted/act/xy/files/read/opened/error/state`), so a law can only be satisfied
vacuously by an input the SHAPE rule does not read. I checked each law's inputs: `activation-law` uses the plan's
`intercept` flags and the leg's own `click` event (`:447-460`); `mode-law`/`node-binding-law` use the hard-coded
`AT_TARGET`/`OPENS`/`MULTIPLE` maps plus `coordinate-law`'s binding of the trusted pointer event to
`AT_TARGET[p.at]` (`:527-528`); `empty-list-law` (`:511`) additionally pins `setParams.files === []` and
`stateAfter === pick-missing.stateAfter`; `read-law` (`:517`) pins the exact read list and the frozen hex/sha pair. The
mutations that attack those inputs (`g09`, `g11`, `g07`) all fired. The laws are sound *relative to the SHAPE
table*; the SHAPE table itself is the unverified root (it was filled from three shape probes, as its comment says).

## The replay rule (item 4): the printed `limit` block is the true boundary

`absNeed`/`gapNeed` are computed from the *prior's* counts (`:249`, `Math.ceil(FRAC*np)` / `Math.ceil(GAP_FRAC*gp)`),
and the refusal is a disjunction (`:250`), so a forgery must break **both** thresholds. Measured, all with
`--prior corpus/evidence/round77/chromium-file-chooser/receipt.json` (the leg-(b) shape):

| craft | moves | measured | rc |
|---|---|---|---|
| `c04-l1-relabel-exec1.json` | mechanical relabel (nonce, launch token, browser id, dirs, nav url, ready expr) | a79 ≥ 40, g11 ≥ 9 | rc 1 `["replay-event-timeline"]` |
| `c07-l1-escape-boundary.json` | 40 events' `ts` ±0.1 + 2 in-window `at` jitters | a40 ≥ 40, g9 ≥ 9 | rc 1 `["replay-event-timeline"]` |
| `c08-l1-escape-past.json` | 45 `ts` + 3 jitters | a35 < 40, **g9 ≥ 9** | rc 1 `["replay-event-timeline"]` |
| `c05-l1-escape-exec1.json` | 40 `ts` + jitter that broke order | a39 < 40, g10 ≥ 9 | rc 1 `["replay-event-timeline","event-leg-window"]` |
| `c09-l1-escape-surgical.json` | 45 `ts` + 3 jitters chosen to cut the ≥50 ms gap multiset to 8 | a36 < 40, g8 < 9 | **rc 0, clean** |

So: no escape below the printed numbers; refusal happens at exactly `a=40` / `g=9`; the first accepted forgery
needs 43 pairs and 3 gaps broken on a copy of the scored receipt. That is precisely what the declared sentence says
("not refused once fewer than absNeed(p) … AND fewer than gapNeed(p) …"), so **the limit is honestly stated, not
understated**. Two clarifications worth recording: (i) the gap comparison is on gap *durations* only (`:244`, `:235`
`matchCount`), not positions, which makes the check *stricter* than the sentence reads, never weaker; (ii) the
`MIN_OWN_GAPS 11` floor is satisfiable by any honest-shaped receipt (79 events → 11 gaps, unchanged by `ts` edits).

## The walk (item 3): what it does and does not see, measured in a scratch lane

Lane built at `/fast/scratch/hyaku/tabi-r77/R77Review1/lane` (`scripts/` present, `.ufo/waves/round-77/…`,
`corpus/evidence/round77/…`, one declared prior `p1`). Scored with `LANEARG=$lane PS=$lane/prior-set.txt`:

| tree content | result |
|---|---|
| literal foreign receipt, distinct nonce | caught (`prior-set-complete`) |
| 30 MB foreign receipt, distinct nonce | caught (`prior-set-complete`) — no size hole at 30 MB |
| `chmod 000` receipt | refused (`prior-set-unparsable`, `… (unreadable)`) |
| truncated `.json` carrying the schema | refused (`prior-set-unparsable`) |
| `dir → …/extra` symlink loop (`extra/loop`) | no hang, no duplicate findings (realpath + `seen` cut the cycle) |
| FIFO named `fifo.receipt.json` | silently skipped (`statSync().isFile()` false, `:268`) — unobservable statically, informational |
| escaped schema (F1) + same-nonce duplicate (F2) + array (F9), no control | **rc 0, clean, `outside []`, `unparsable []`** |

## Residual risk and verification gaps

- **Not run by me:** the battery (`negatives-filechooser-r77.mjs`) and kill power; my seat is the counter. Kill
  power **structurally cannot** refute F1–F9: it edits check *predicates* in the counter source and asserts the
  battery flips, while my crafts satisfy every predicate (the battery has 0 cases mentioning `sweeps`, `childExit`,
  `user-data-dir`, schema escaping or same-nonce duplicates; `grep -c` over
  `negatives-filechooser-r77.mjs` → `0` for each of `sweeps`, `childExit`, `user-data-dir`, `u0037`, `same-nonce`). "0 survivors" is therefore not evidence against these findings.
- **Untested:** a >2 GB in-tree file (would hit `readFileSync` limits and surface as `prior-set-unparsable`);
  hardlink duplicates (realpath dedupe does not merge inodes — two paths would both be read and both flagged);
  `--prior` given a malformed path (usage path); a `Page.getFrameTree` result that *agrees* with `mainFrameId`
  (there is nothing to agree with — F4).
- **Root of trust:** the per-leg SHAPE table (`:114-140`) is the ground truth for every event check; it was filled
  from three shape probes and no check re-derives it from a source. Everything in the event plane is only as good
  as that table — and the three appliances (counter, battery, kill power) share it.
- **Tooling:** no installs, no upgrades, no pacman transaction. Chromium probe used the pinned
  `/usr/bin/chromium` (Chromium 155.0.8059.84) with a `timeout` wrapper; no host sysctl, no `/boot` access, no git
  mutation anywhere. Scratch `/fast/scratch/hyaku/tabi-r77/R77Review1/` removed; cited receipts and their scores
  are in `.ufo/waves/round-77-seats/R77Review1/` (`baseline.json`, `c0*.json`, `g*.json`, `w*.json`, `*.score.json`).
