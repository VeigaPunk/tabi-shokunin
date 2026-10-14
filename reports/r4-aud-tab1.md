# AUD-TAB1 — round-4 audit: multi-step-journey (r3) + cdp-evidence (r1/r2) regression re-run

Lane AUD-TAB1, 2026-10-14. Write scope: this file only. Nothing else in
tabi-shokunin was edited (no note, LOG, SCORECARD, SKILL, or plan touched;
`git status --short` shows this file as the only new tree entry from this
lane). Scratch: `/tmp/w4-aud-tab1/` (ephemeral). Audited notes read-only:
`corpus/knowledge/multi-step-journey.md` (296 lines, `wc -l`),
`corpus/knowledge/cdp-evidence-patterns.md` (177 lines).

Task: re-run ONE capture recipe on a fresh port; confirm cleanup; verdict
table; do NOT edit. I ran the recipe twice-bounded: (A) the r3 journey
recipe (primary), (B) the r1 single-page data:-URL probe (second anchor for
the cdp note). Both loopback/`data:` only — no external site, no secrets,
substrates read-only (PROVINCE.md:15-19).

## 0. Re-run setup (observed)

- Harness bytes = the r3-1 staged harness copied to
  `/tmp/w4-aud-tab1/harness/`; re-hashed in place before the run — all 9
  pins match the note (§1 table + `methodology-sha.txt`):
  `journey.mjs b52074a33876…5ddbc`, `driver.sh 9509c07f49f9…74b13`,
  `compare.mjs ecce1c73dc56…3215`, and the 6 `site/` files
  (`index 42d7a35b82be`, `detail 353d8107a072`, `form 50d811502ef8`,
  `confirm 84b6ea0c17f4`, `style 6380986105b3`, `data bf141027b3ef`).
  Line counts `wc -l` → journey.mjs 356 / driver.sh 85 / compare.mjs 38 =
  the note's counts.
- Driver delta from the pinned `driver.sh` is exactly 3 lines (documented,
  `diff -u` in `/tmp/w4-aud-tab1/driver.diff`): `ROOT`, `HTTP_PORT`
  19421→19621, `CDP_PORT` 19422→19622 (fresh ports; verified free by `ss`
  before launch). Edited driver sha `c7eddbfce6ac…`. The recipe is
  port-parameterized by design (`driver.sh:8-9`, `journey.mjs` `--cdp/--base`).
- Run: `bash driver.sh 1` → exit 0, 16:20:17→16:20:19Z, 2.2 s wall.
  Listening lines loopback-only, driver.log:10-11 (python pid 1261334;
  chromium pid 1261335); effective child line driver.log:13 reproduces r1 E1
  wrapper flags (`--ozone-platform=wayland … --ozone-override-screen-size=800,600`).
- Suite B: `cdp-probe.mjs` copied from `/tmp/tabi3-cdp/` (sha
  `e67236113d8a…`), delta = 2 output paths only (verified by sed-substitution
  diff); launched chromium with the r1 recipe (`cdp-evidence-patterns.md:23-27`)
  fresh profile, port 19631 (`CDP_PORT=19631 node cdp-probe.mjs`), exit 0.

## 1. Verdict table — multi-step-journey.md (r3 note)

| # | claim (note anchor) | recorded | my re-run (fresh port, +1:33 h, new browser) | verdict |
|---|---|---|---|---|
| 1 | 6 step PNGs byte-identical across runs (§2/§4) | full shas §2:90-94 | all 6 full shas equal, e.g. step-1 `e9d8c83c…387bc12`, step-4 `a12566cd…60693b`; bytes 14810/14810/15068/13354/14240/12692 | PASS |
| 2 | 6 shape + 6 struct shas (§2) | §2:95-98 | all equal (e.g. step-2 shape `f4ecc277…f23d2`, struct `d6ba6564…16d73`) | PASS |
| 3 | node counts 37/37/42/53/53/43 (§2) | §2 table | 37/37/42/53/53/43 | PASS |
| 4 | viewport 800×600 DPR 1; PNG dims 800×600 (§1) | journey.json | innerWidth 800, innerHeight 600, DPR 1; all 6 PNG 800×600 | PASS |
| 5 | history `typed→link→link→form_submit`, currentIndex 4/5 (§2) | §2:108-111 | `auto_toplevel:blank → typed:/index.html → link:/detail.html → link:/form.html → form_submit:/confirm.html`, 4/5 | PASS |
| 6 | input columns: `-1` sentinel empty; filled `tabi-r3`; rail checked by value-less presence (§3) | §3:153-159 | extraction identical: step-3-form traveler `inputValue:null`(guarded), filled `"tabi-r3"`, rail `inputChecked:true` (index-presence), shape text unchanged across fill (`23aa4e30…` both) | PASS |
| 7 | confirm URL on 3 surfaces, exact query; server line 8 (§2) | §2:116-119 | targetEnd url = `…/confirm.html?traveler=tabi-r3&mode=rail&item=1`, title `TABI-R3-1 confirm`; ± port, http.log request line identical | PASS |
| 8 | per-launch ids; target id stable within a run (§2) | B9AE54BF…, ws c8fe2ee0… | id `ECACF4EE624832043929B131CC48B62D` equal at launch and end; browser ws uuid `558b1995…` (new per launch) | PASS |
| 9 | chromium.log 4 lines, no GCM lines (§4) | 4 lines | 4 lines, no google/gcm lines | PASS |
| 10 | wire = 7 requests in 8 lines; client 10 events; 3-event delta = cache re-serves with **no wire line** (§2/§5) | run1/run2 http.log 8 lines | wire = **8 requests in 9 lines**: one added `"GET /style.css HTTP/1.1" 304 -` at step-2; client 10 events; delta 2 — step-2 style went to the wire and the client reported **304** there (flags false) | **VARIANT — see §2** |
| 11 | cleanup per run: kill by PID from `ps`, no survivors, ports closed, `curl` exit 7 (§7) | §7:256-263 | driver.log:59-64 all pass (`no chromium survivors`, `pass: ports 19621/19622 not listening`, both curls exit 7); independent post-run re-check: ports dead, 0 chromium, no http.server, curls exit 7 | PASS |
| 12 | fresh profile per run; loopback-only binds (§1/§6:5) | driver.sh:16, bind lines | profile rm line driver.log:2; bind lines `127.0.0.1:19621/19622` only | PASS |

Byte-identity now holds across **three** cold runs on **three port
pairs** (r3 run1/run2 · my 19621/19622) — the byte-determinism claim
survives a fresh-port, later-clock, new-browser re-run. Boundary caveat
unchanged: same host/build/font stack (note §4 as-scoped).

## 2. The one regression finding: wire-vs-client path is run-variant (observed)

Exact diff, ref run1 http.log vs mine (timestamps ignored):
`diff` → `5a6 > "GET /style.css HTTP/1.1" 304 -` (single added line; the
same diff holds vs ref run2/run2-http.log). Three-way observation:

| run | wire (style.css repeats) | client slice status/flags for the repeat | client events | wire requests |
|---|---|---|---|---|
| r3 run1+run2 (cold) | no wire line — pure client re-serve | 200, fromDiskCache:false, fromMemoryCache:false | 10 | 7 |
| r3 warm pass | 304 (all 6 URLs) | 200, flags false (post-revalidation) | 10 | as-recorded |
| my cold run | 304 at step-2 only; steps 3/4 no wire line | **304** at step-2, flags false | 10 | 8 |

So §5's sentence "the 3-event delta is style.css entries … and no wire
line" is true **as-of-its-capture** but is not a stable count: with
capture bytes byte-identical, the within-session cache/revalidation path
varied (my delta = 2, not 3). The note's *general* rule — "the client
status is not wire truth; keep both surfaces" — is corroborated and
arguably strengthened (a third combination appeared: client 304 = wire 304).
Mechanism for the run-to-run difference unmeasured (§5 unknowns here).
Owning-lane action (not taken by this lane — do-not-edit): mark §5's
delta counts as per-run measured, or errata-append this third run.

## 3. Verdict table — cdp-evidence-patterns.md (r1 core + r2 errata)

| # | claim (anchor) | recorded | my re-run (port 19631) | verdict |
|---|---|---|---|---|
| 1 | screenshot byte-determinism, environment-scoped (§4 E9; errata: "held a third time") | `c1ba9588…93b6e`, 12,100 b64 chars, 9,074 B, IHDR 780×493 | 4th independent session: identical sha / b64 length / bytes / IHDR 780×493 | PASS (4th session) |
| 2 | DOM.getDocument: 11-node walk; root `nodeId:1/nodeType:9/"#document"`; `backendNodeId` per-capture (§4 E10 + r2 errata) | 11 nodes; backendNodeId 2 then 1 | 11 nodes; root keys equal; root `backendNodeId:2` — varies again, correction confirmed | PASS |
| 3 | DOMSnapshot: 11 nodes, `strings.length` 18, 1 doc (§4 E11) | 11/18/1 | 11/18/1 | PASS |
| 4 | `frameId == target id` on main frame (§7.5; errata: 3 sightings) | 3 sightings | 4th: navFrameId `402E0513…` == page target id | PASS |
| 5 | `data:` URL read-back is the navigated (normalized/encoded) form (r2 errata #2) | encoded | `location.href` read back percent-encoded | PASS |
| 6 | launch recipe from the note alone works verbatim (port substituted) | :23-27 | CDP up in <1 s; `/json/version` Chrome/152.0.7977.82, Protocol 1.3 | PASS |
| 7 | §2/:50 + r2 errata: earlier launch-window listing with `background_page`+`service_worker` "not backed by a staged artifact … non-replayable" | errata downgrade | **re-observed**: `listBefore` at probe time = count 5, `{page:1, browser_ui:2, background_page:1, service_worker:1}`; `Target.getTargets` count 5, same field names; `listAfter` ~2 s later still 5 | **SUPERSEDED (reinstated as replayable-at-launch-window)** |
| 8 | cleanup: kill by PID, port closed, curl exit 7 (§6) | §6:99-103 | my cdp browser killed by PID; `ss` 19631 dead, curl exit 7 (verification re-run after a self-match incident, §4) | PASS |
| 9 | §5.1-5.9 rules (URL, provenance, session slot, bytes+hash, determinism class, cross-checks, channel naming, cleanup proof, archive) | rules | rules applied unchanged; archive rule (§5.9) is *not yet satisfied* for r1-r3 bytes — see §5 debt | HOLDS (debt open) |

## 4. Calibration incident (second instance of the r1 §6 class)

My cdp-browser cleanup selected PIDs with
`ps -eo pid,args | grep "[c]hromium" | grep "user-data-dir=/tmp/w4-aud-tab1/cdp/profile"`.
The **second grep pattern text itself appeared in my own shell's command
line**, so the selection matched the invoking shell; `kill $PIDS` killed my
own shell mid-command (tool abort, exit −1) and its verification steps never
ran — the exact failure mode r1:105 warns about, reached via `ps|grep`
instead of `pkill -f`. The chromium PIDs were in the same list and did die;
I re-verified afterwards with a split pattern (`[p]rofile`): no survivor,
port 19631 closed, `curl exit=7`. Rule of record stays: **an unverified
kill is an unknown, not a cleanup** — and the pattern must not occur in
your own command line (character-class the fixed part, or verify after).

## 5. Owner-facing deltas (reported, not applied — this lane does not edit)

1. `multi-step-journey.md` §5: mark the "3 client events had no wire line"
   count as per-run-measured; my fresh-port run shows one of the three
   going to the wire as 304 with the client reporting 304, bytes unchanged.
2. `cdp-evidence-patterns.md` errata (r2 block): the "launch-window
   extension-targets listing … non-replayable" line is superseded — a
   fifth listing is now recorded in this lane's scratch with the same
   shape (count 5; `background_page` 1 + `service_worker` 1 + page 1 +
   browser_ui 2), reproducible by listing right after CDP comes up.
   §7.1 (why they vanish later) stays open.
3. Standing archive debt (LOG r2/r3) unchanged: all r1-r3 evidence bytes
   plus this lane's live only in `/tmp` (`tabi3-cdp`, `tabi-r3-1-journey`,
   `tabi-r2-1-capture`, …, `w4-aud-tab1`) — hash citations are only
   verifiable while `/tmp` lives (cdp note §5.9).

## 6. Environment context (out of audit scope, observed only)

- Another round-4 lane (`t4-2-async`) ran its own `python3 -m http.server`
  on 127.0.0.1:19431 during my audit; left untouched, no shared ports
  (my runs used 19621/19622/19631). It was gone by my final check.
- The webbridge daemon recorded as "pid 3934817 still listening" in the
  r2/r3 LOG: **not present now** (pid gone, port 10086 not listening).
  State changed since the record — mechanism unknown, no daemon file or
  log read (shape-only discipline; that note is not this audit's target).

## 7. Unknowns (unchanged or new — do not promote without a probe)

1. What decides the within-session cache path (no-wire re-serve vs 304
   revalidation) for the repeated `style.css` — unmeasured; only the byte
   invariance of captures across all three paths is measured.
2. Which cache tier serves the repeats (`fromDiskCache` false in all
   observed paths, including wire-304) — as r3 §8.1.
3. Extension targets' appearance/disappearance window (present at ≤2 s,
   absent in r1's capture-time listings; exact timing unmeasured) — r2
   §7.1 stands.
4. Root `backendNodeId` value rule (2 vs 1 across captures) — per-capture
   handling is the correct rule; the deciding factor is unexamined.
5. All determinism results remain bounded to this host/browser build
   (chromium 152.0.7977.82) and font stack.

## 8. Spot-checks (3, named)

1. **Pins re-derived before use**: 9/9 harness shas + 3 line counts match
   the note before the run (so the run used the pinned bytes). Commands:
   `sha256sum journey.mjs driver.sh compare.mjs site/*`, `wc -l`.
2. **Cross-run byte diff**: `sha256sum` of my run1 artifacts equal the r3
   record (all 18 rows in §1.1-1.2; full hashes in
   `/tmp/w4-aud-tab1/harness/run1/`), including step-1↔idem idempotence.
3. **Independent cleanup proof**: driver closure lines + my own re-run of
   `ss`/`ps`/`curl` after both browser sessions (exit 7 both ports; zero
   my-lane survivors; r1 screenshot on-disk re-hash `c1ba9588…93b6e`).

Evidence tree: `/tmp/w4-aud-tab1/` — `harness/` (pinned copies + edited
driver + run1/ + driver.diff), `cdp/` (probe copy, `cdp-summary.json`,
`chromium.log`, screenshot), `verify/` (`mine-vs-ref.json`).