# CritSkillSection — falsify the two round-32 SKILL.md sections (C1, w2)

**Verdict.** The two appended sections are substantially sound at `b234a58920134424e0d104f137311ff54a16d26b`:
all seventeen transport rulings agree with the runtime entry's §3 (four CDP, R17 BiDi, twelve `either`, and every
`either` carries the deciding condition the entry names), the bootstrap recipe's order is literally both the frozen
gate's `liveRecord` order and the committed driver's order (verified frame by frame in `run1`/`run2`), and every
`Observed:` line except one traces to the receipt, its transcripts, or a cited probe (`probe.json`, `probe2.json`,
`probe3.json`, `pattern-probe.json`). The registry numbers re-run clean on the attacked revision (bidi selftest
27/27, self-assessment selftest 41/41, `--live` count 16 admitted / 0 failing / `binding: null`, `--live` without a
driver exit 2), and the "equal to the gate's own live render" sentence I re-derived myself: my own `--live` run came
back `binding: null`, i.e. the gate's live first screenshot is the same `ee0edeba…51eca5`. Against that, four lines
are falsifiable as written and one is a wording nit — the R7 "`(pending below)`" clause (the receipt records
`innerWidth 640` in *both* runs), "Five error codes" (three codes across five signatures), R12's "on that collector's
response" (the counter never ties `getData` to the collector's response: two transcripts I built are admitted), and
R14/'silent-7' "on empty history" (both probes traversed *after* navigating to `/a.html`, so the history held the
initial `about:blank` entry). None of the four changes any row's admitted verdict, so C1's count is unaffected; the
fix for each is one append-only correction bullet.

## What I attacked

- Target: `SKILL.md:2612-2627` (registry rows) and `SKILL.md:2629-2754` (transport table, bootstrap recipe, error
  signatures), at the revision every item attacks. Lane checkout HEAD is `b234a58` with a clean tracked tree and my
  scratch clone is byte-identical for `SKILL.md` (`sha256 0230fdb6…d6418`) and the receipt (`e739d53d…b88cf4`), so
  the line numbers below are the attacked bytes.
- Authorities used: `corpus/evidence/round-32/bidi/receipt.json` + `run1/run2/transcript.jsonl`,
  `scripts/bidi-loopback-round32.mjs`, `scripts/check-bidi-runtime.mjs` (ROWS/PREDICATES/liveRecord/CASES),
  `corpus/knowledge/webdriver-bidi-runtime-round-32.md` §3/§6, `corpus/knowledge/webdriver-bidi-capability-matrix.md`
  `:58-:76`, and the cited probes under `w1/ScribeSkillDistill/evidence/` and `w1/ExecInterceptPhases/`.

## Findings

| # | Attacked line | Verdict | Severity | Evidence |
|---|---|---|---|---|
| F1 | `SKILL.md:2659` — R7 "the `innerWidth` read itself is the driver run's to record **(pending below)**" | **defect** (false; under-claim) | low | `receipt.json` `runs[0].observed` and `runs[1].observed` both carry step `window.innerWidth` = `640`; `run1/transcript.jsonl` seq 18 and `run2/transcript.jsonl` seq 18 are the successful evaluates; `PREDICATES.R7` (`check-bidi-runtime.mjs:242-247`) requires exactly this. Nothing is pending. The stale marker is inherited from the scribe draft (`w1/ScribeSkillDistill/skill-section.md:31`), which was written before the receipt landed (`ScribeSkillDistill.md:15,19-21`). |
| F2 | `SKILL.md:2719` — "Five error **codes** and two silent failures" | **defect** (count) | low | The five numbered signatures use three distinct codes: `no such alert`, `invalid argument`, `no such network data` (`probe.json` `probes[].error`; all six `pattern-probe.json` error entries are `invalid argument`). The scribe's own report calls them "five error signatures" (`ScribeSkillDistill.md:8`); the section changed the noun. |
| F3 | `SKILL.md:2664` — "`PREDICATES.R12` needs the collector before the `getData`, **on that collector's response**, and the body equal to `DATA_TEXT`" | **defect** (description exceeds the counter) | low–medium | `check-bidi-runtime.mjs:274-278` checks only: some `addDataCollector` with `dataTypes` containing `response`, then any later `getData` with `dataType: "response"` whose decoded bytes equal `DATA_TEXT`. It never reads the collector id and never reads the request id. My two mutations of the committed `run1` transcript (`r12-probe.mjs`, output `r12-probe.out`) are both admitted: (a) the collector moved to *after* the `/data.txt` `responseCompleted` but before `getData` → `HOLDS`; (b) `getData`'s `request` rewritten to `"NOSUCHREQUEST"` → `HOLDS`. |
| F4 | `SKILL.md:2666` (R14) and `:2742` (silent failure 7) — "on empty history" | **defect** (wording; the parenthetical is right, the premise is not) | low | Both probes traversed after a real navigation: `probe.json` probe order is `setViewport → getData-no-collector → navigate-a → evaluate-ready → traverseHistory-empty`, and `probe3.json` is `subscribe → navigate-a → href-before → traverseHistory-empty`; `probe3.json` shows `href-after` `about:blank` from realm `-5711…` vs `-3673…` and a `browsingContext.load` for `about:blank`. The history was *not* empty — it held the session's initial `about:blank` entry (which is why the traverse had a target), plus `/a.html`. |
| F5 | `SKILL.md:2741` — "`PREDICATES.*` do (they require `res(c).type === "success"`)" | **defect** (over-universal) | trivial | The literal test appears only in `evalCmds` (`check-bidi-runtime.mjs:192`, used by R6/R7/R8/R9/R14) and in R6 (`:241`). R2/R3/R4/R5/R10/R11/R12/R13/R15/R17 never test `res(c).type`; they reject an exception result only because the expected field is then missing. The operational advice ("read `result.type`") is right; the universal is not. |
| N1 | `SKILL.md:2703` — recipe 11 "an evaluate after **each** action" | nit | trivial | `liveRecord` and the driver issue three `performActions` (click `#t`, keys `tabi`, click `#b`) and two evaluates (`run1/transcript.jsonl` seq 27-36); there is no evaluate after the click on `#t`. |

### Checked and holding (no defect)

- **All 17 transport rulings vs entry §3.** R5/R11/R14/R16 = CDP and R17 = BiDi match the entry's §3 "what each yes
  does not show" cells (`:64`/`:70`/`:73`/`:75`/`:76`) and matrix `:64/:70/:73/:75/:76`; the twelve `either` rows each
  carry the entry's deciding condition (R2 target-types→CDP, R4 beyond-viewport→CDP, R9 `insertText`→CDP, R12
  collector-first, R13 exact-URL patterns, R15 partition scope). **R12's `either` is the closest thing to a conflict**
  — the entry's §6 rejection list names "collector-gated body retrieval" among the reasons BiDi cannot replace the
  CDP capture pipeline — but the entry's §3 R12 plus §4 U4 ("feasibility half is measured; cost open") support the
  ruling *for that surface's evidence*, and the why column states the gating. I class this a tradeoff, not a defect.
- **Recipe order = `liveRecord` order = driver order.** Frame-by-frame: subscribe(4 events) → getTree → setViewport →
  addDataCollector → navigate(`/a.html`, `wait:"complete"`) → load → `window.__ready` (awaitPromise true) →
  `window.innerWidth` (false) → captureScreenshot → locateNodes `#h`,`#t`,`#b` → click `#t` → keys → read `#t.value`
  → click `#b` → read `#out` → fetch `/data.txt` → getData → getCookies → addIntercept → fetch `?held=1` → blocked →
  continueRequest → navigate `/b.html` → traverseHistory −1 → load → pathname poll → alert → userPromptOpened →
  handleUserPrompt. `check-bidi-runtime.mjs:438-479` and `run1/transcript.jsonl:2-71` agree with `SKILL.md:2680-2716`.
- **Post-freeze gate limits do not touch these sections' claims.** `SKILL.md:2632-2644` claims only "two runs",
  "identical first-screenshot bytes and `chromedriverVersion`", "predicate on every committed run", "--live equal to
  the gate's own session" — each is literally what `evaluate()` (`:496-583`) enforces; the four forgery holes in the
  entry's §8 (duplicate row id, one transcript twice, driver bytes under another path, spliced screenshot) are not
  asserted here as closed.
- **"Equal to the gate's own live render" (`SKILL.md:2746-2751`).** Re-derived, not taken on trust: my own
  `--live` run returned `binding: null` with `admitted 16 / failing 0`, which is precisely the equality test
  (`:545-556`); the receipt's two runs each decode to 6,626 bytes, `sha256 ee0edebad5…d51eca5`
  (`run1:20`, `run2:20`).
- **"Two cold runs".** Distinct `chrome.userDataDir` per run (`…/prof-bWDBKf/data`, `…/prof-GpdDsH/data`) and distinct
  transcript digests (`8aa97463…`, `9918a716…`), matching the receipt's `transcriptSha256`.
- **"`getData` with no collector → `no such network data`" (R12 why).** `probe.json` `getData-no-collector`; the
  "collector added after `responseCompleted` recovers nothing" half of recipe 7 is supported by
  `w1/ExecCollectorTiming.md:14-19,90-91` (not cited by path in the recipe — a provenance gap, not a false claim).
- **Error-signature bodies 1-7** each reproduce in the cited probes: `probe.json` (`no such alert`, `Unknown event:
  nonsense.event`, `no such network data`/`No collected response data`, `setViewport → {}`, page exception inside a
  success), `probe2.json` (780x437 pre-pin shot twice, `Required in "awaitPromise".`, ignore→second handle fails,
  dismiss-and-notify→auto-dismissed then `no such alert`, collector-before-fetch returns the 26-byte body),
  `probe3.json` (traverse success, `about:blank`, new realm, load, `TypeError: … Failed to parse URL from /data.txt`),
  `pattern-probe.json` (`?held=1` accepted; `*` refused `Forbidden characters`; `/data.txt` refused
  `Failed to construct 'URL': Invalid URL '/data.txt'`).
- **R10 handle shapes** (`32-hex` document id, `<pid>.<n>` page fetches) and **R11** (`status 200`, `statusText OK`,
  `protocol http/1.1`, `{name:"x-tabi-fixture", value:{type:"string", value:"r32"}}`) are literal in
  `run1/transcript.jsonl:11-12,38-39,49`; **R15** returns `cookies` + `partitionKey{userContext:"default"}`
  (`:44`).
- **Registry rows.** `cases=27, passed=27` and `cases=41, passed=41` re-run clean; the `bidi-runtime` verdict map
  matches `main()` (`exit 0/1/2`, and `--live` with no driver refuses with exit 2); "self-test … never starts a
  browser" holds because every live case injects a `liveRunner` stub (`:723-731`, live record injected at `:733`); `FIXTURE`, `ROWS`,
  `PREDICATES`, `CASES` all exist at the pinned-value path.
- **"One realm race was seen while the driver was written (not in the committed runs)"** (`SKILL.md:2752-2754`) is
  supported but unattributed: `w1/ExecDriver.md:119-124` and `w1/ExecPyClient/evidence/py1-transcript.jsonl:66`
  (`"Cannot find context with specified id"`). It names no path, so a reader cannot check it from the section alone.
- **`--baseline REV` in the registry's entry-command template** is runnable only if the two REVs differ (same revision
  ⇒ `s1-source-row`); it is lane-wide template convention (same shape at `SKILL.md:2575`), so not a round-32 defect.

## Smallest safe correction (append-only, one bullet each)

Under `## Round 32 — corrections (append-only; …)`, add — no other edit:

1. `Correction — supersedes the "(pending below)" clause at SKILL.md:2659: the driver's committed runs record the post-pin read (window.innerWidth 640) in both runs (corpus/evidence/round-32/bidi/receipt.json runs[0..1].observed step "window.innerWidth"; run1/transcript.jsonl seq 18; run2/transcript.jsonl seq 18), which PREDICATES.R7 requires; the R7 verdict rested on the receipt, not on a pending read.`
2. `Correction — supersedes "Five error codes" at SKILL.md:2719: the five observed signatures use three codes (no such alert, invalid argument, no such network data) with distinct messages (Required in "awaitPromise"., Unknown event: <name>, Forbidden characters / Failed to construct 'URL': Invalid URL, No collected response data, No dialog is showing), per w1/ScribeSkillDistill/evidence/probe*.json and ExecInterceptPhases/pattern-probe.json.`
3. `Correction — supersedes the "on that collector's response" clause at SKILL.md:2664: PREDICATES.R12 (scripts/check-bidi-runtime.mjs:274-278) checks a response-type collector before the getData and the decoded bytes equal DATA_TEXT; it does not tie the getData to the collector's own response (a transcript whose getData names an unseen request id, or whose collector is added after responseCompleted but before the getData, is still admitted).`
4. `Correction — supersedes "on empty history" at SKILL.md:2666 and SKILL.md:2742: both probes traversed after a real navigation (probe.json probe order; probe3.json probe order), so the history held the session's initial about:blank entry; the observed effect — success, about:blank, new realm, a load for about:blank — is unchanged.`
5. `Correction — supersedes "PREDICATES.* do (they require res(c).type === \"success\")" at SKILL.md:2741: only evalCmds (scripts/check-bidi-runtime.mjs:192; R6/R7/R8/R9/R14) and R6 (:241) test result.type; the other predicates reject an exception result because the field they read is absent.`

N1 is text-only and needs no correction (an L1 may fold it into item 1's bullet if it wants the recipe sentence
exact).

## Evidence — commands and exit codes

All lane scripts were run in my scratch clone only (`/fast/scratch/hyaku/tabi-r32/CritSkillSection/clone`, checked out
`--detach b234a58920134424e0d104f137311ff54a16d26b`); the lane checkout was read-only (`git log`, `git status`,
`sha256sum`, `grep`, file reads).

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" ; git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b
$ git -C "$S/clone" rev-parse HEAD
b234a58920134424e0d104f137311ff54a16d26b                                                        # exit 0
$ sha256sum SKILL.md .ufo/../SKILL.md(clone) corpus/evidence/round-32/bidi/receipt.json(clone)
0230fdb680a1d7a428672c83524a8a610b38b42394cc7142b4dd82cf9f9d6418  SKILL.md                       # lane == clone
e739d53df693f1673d32df7562ce25c14f71cb7875ca7804be8ff6b7f8b88cf4  receipt.json                   # lane == clone
$ TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest
BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27                                           # exit 0
$ TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --selftest
SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41                                         # exit 0
$ TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --rev b234a589… --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
{"population":16,"admitted":16,"failing":0,"clean":true,"live":true,"binding":null,"entryFinding":null}   # exit 0
   (real 1.765s / user 42.1s / sys 31.4s — the multi-process browser, so the live leg really ran; no ROW lines failed)
$ PATH=$S/bin TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --rev … --baseline … --entry … --live
BIDI_RUNTIME verdict=could-not-evaluate detail=chromedriver or chromium not found                 # exit 2
$ TMPDIR=$S/tmp node r12-probe.mjs        # imports PREDICATES + recordFromTranscript from the clone's gate
control R12: HOLDS
collector added AFTER responseCompleted, before getData -> R12: HOLDS (predicate admits)
getData request id never seen -> R12: HOLDS (predicate admits)                                   # exit 0
$ python3 - <<'PY'  # request ids / status / headers / screenshot digests per transcript
run1: 11-12 document request DDF778C6456D1668F9703C6FD1CA5FBE ; 38-39/41 page fetch 483282.3 ;
      49 blocked 483282.4 intercepts ['06a611f5-…'] ; 20 screenshot 6626 B sha ee0edeba…51eca5 ;
      responseCompleted status 200 statusText OK protocol http/1.1 header x-tabi-fixture=r32
run2: 11-12 6B5AEDC7C0C524031436C636E5D70F9B ; 38-39/41 498838.3 ; 49 498838.4 ; 20 same screenshot digest
PY                                                                                                # exit 0
$ python3 - <<'PY'  # probe2 IHDR + errors
probe2 ignore:      screenshot-before-setViewport PNG 780x437 ; screenshot-after-setViewport PNG 640x480 ;
                    handleUserPrompt-2 error "no such alert" / "No dialog is showing" ; getData body 26 B
probe2 dismiss and notify: same shots ; handleUserPrompt-after-auto-dismiss error "no such alert"
PY                                                                                                # exit 0
$ grep -o 'Required in [^"]*' probe-frames.jsonl ; grep -o 'Unknown event[^"]*' … ; grep -o 'No collected response data' …
Required in \"awaitPromise\". / Unknown event: nonsense.event / No collected response data               # each 1 hit
$ python3 -c "…receipt.runs[*].observed…"   # both runs: window.innerWidth 640, captureScreenshot 6626/ee0edeba…,
                                            # #t value tabi, #out clicked:tabi, getData /data.txt {bytes:26,matches:true}
```

Artifacts copied into this seat's output dir (`.ufo/waves/round-32/w2/CritSkillSection/`): `gate-live.json`,
`gate-live.stderr` (0 B), `selftest-bidi.txt` + `.exit`, `selftest-selfassessment.txt` + `.exit`,
`live-without-driver-bin.txt`, `r12-probe.mjs`, `r12-probe.out`.

## Perimeter and hygiene

- Browser work: only the frozen gate's own `--live` leg (chromedriver `/usr/bin/chromedriver`, chromium
  `/usr/bin/chromium`, both 154.0.8037.97, throwaway profile under my scratch, fixture served on `127.0.0.1` by the
  gate). No page of any external site requested. `TMPDIR=/fast/scratch/hyaku/tabi-r32/CritSkillSection/tmp`
  passed explicitly; short enough for chromium's 108-byte singleton socket.
- `pgrep -fa 'chromedriver|chromium'` before yield: only the host's long-running `earlyoom` line (its `--prefer`
  regex mentions chromium); **no chromedriver/chromium process of mine**.
- Network fetches: **none** (no HTTPS GET was needed; nothing to record).
- Tool installs/upgrades: **none** (no `pacman`, `uv`, `npx`, no binary drop; nothing to report under the 2026-10-19
  tooling authorization).
- Scratch: `/fast/scratch/hyaku/tabi-r32/CritSkillSection` removed after the receipts above were copied; no tree left.
- Lane writes: this report and this seat's output dir only; no lane tracked file, index, jj state, fleet repo or
  sibling lane touched. `/tmp` used for nothing.
