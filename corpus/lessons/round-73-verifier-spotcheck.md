# tabi round 73 — verifier spot-check (non-author)

author: hyaku closure (non-author integrator, @m_zfl)

Scope: lane-round tabi r73, base `d7ff9f190260d91a1e675f474b7abf79960cdfd4` → tip
`8c081aa3d96df73e19f41b9920b8b48cebd1637f`; report `.ufo/reports/round-73/tabi.md` (fleet repo).
Driver digest (`.ufo/watchdog.log` lines 3105/3124):
`2026-11-06T21:21:02-03:00 launch tabi round=73 pgid=187911 driver=hyaku-inline attempt=1`;
`2026-11-06T23:05:06-03:00 complete tabi round=73; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | command | observed |
|---|---|---|
| report committed by lane identity | `git log --format='%an %ae %H %ad' -- .ufo/reports/round-73/tabi.md` | `tabi-shokunin tabi@shokunin.local e3fb5960… Fri Nov 6 22:51:20 2026 -0300` (before `complete` 23:05:06) |
| SHONEN heading | read report | `## SHONEN`, 4 lines, each `[~]` with a pointer |
| cited commits exist + ancestry | `git cat-file -e <h>^{commit} && git merge-base --is-ancestor <h> master` for ae2628af, d7387fb3, 3409ab53, c44fcf6f, 8c081aa3 | all 5 ok; `d7ff9f19..master` holds exactly these 5 commits, all by `tabi-shokunin` |
| pushed / clean | `scripts/hyaku/jj-lane.sh state …/tabi-shokunin`; `git status --porcelain` | `branch=master local=remote=8c081aa3… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; `ls-remote origin refs/heads/master` = `8c081aa3…` |
| prompt carries template contract | `diff <(sed -n 1,140p tabi-round-72.md) <(sed -n 1,140p tabi-round-73.md)` | sections 1–5 differ only by round number (lines 1, 69, 101, 133); §6 hyaku addendum present |

Not a marker: 5 lane commits with checkable work. Status `ok`.

## 2. Claim C1 (coverage) — capability `chromium-synth-pinch-gesture-linux`, generation r73

Frozen predicate `C1-SYNTHPINCH-R73` (`.ufo/waves/round-73/claims.json`).

Re-measured (plain commands over committed bytes):

| measurement | command | before (d7ff9f19) | after (8c081aa3) | reported |
|---|---|---|---|---|
| leg (d) capability row | ``git show <rev>:SCORECARD.md \| grep -c '^| `chromium-synth-pinch-gesture-linux` |'`` | 0 | 1 | 0 → 1 ✓ |
| knowledge entries | `git ls-tree -r --name-only <rev> corpus/knowledge \| wc -l` | 85 | 86 | 85 → 86 ✓ |
| SOURCES rows | `grep -cE '^\| S[0-9]{3} ' corpus/SOURCES.md` | 179 | 186 | 179 → 186 ✓ |
| freeze digests hold at tip | `sha256sum` of the 6 files in `freeze.txt` (D `3409ab53`) at 8c081aa3 | — | driver 3f0ffe24, counter 3104101a, battery 0a738780, kill-power 5e4a8255, claims ef289314, run-scored 8288728d — all equal to `freeze.txt` | ✓ (no post-freeze instrument edit; `git diff --stat 3409ab53 8c081aa3 -- <counter, driver, claims>` empty) |
| scored receipt digest | `git show 8c081aa3:corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json \| sha256sum` | — | `a3b9070b…3ea8` | ✓ |
| R73Exec1 receipt digest | same on `w1/R73Exec1/receipt.json` | — | `e0abd3e7…8815` (matches seat report) | ✓ |
| nonce freshness | `git grep -l 3409ab53b905 ae2628af d7387fb3` | — | no match (exit 1); receipts `startedAt` 01:18:28Z / 01:24:48Z = 22:18:28 / 22:24:48 -03:00, after D 22:18:22 | ✓ |
| leg (d) note sources | `grep -oE 'S18[0-6]'` on the r73 note | — | `source:` frontmatter cites S180–S183 (+S184–S186) | ✓ |

Evidence-verified (lane gate/counter not executed, §Gate standard closure consequence):

- (a) `scored/c1-counter-a.json`: `verdict clean`, `checkCount 98`, 98 checks all `true`, `findings []`, nonce `tabi-r73-l1-3409ab53b905`.
- (b) `w1/R73Exec1/counter.json`: clean, 98/98 true, nonce `tabi-r73-exec1-3409ab53b905`; seat report line 17 records 12 PRE priors + (a) receipt as 13th prior. L1 re-run `scored/c1-counter-b-L1rerun.json` clean 98.
- (c) `scored/c1-negatives-a.json`: `allOk true, passed 228, failed 0, coverageGap 0, cases 228`; `scored/c1-kill-power-a.json` and `w1/R73Exec1/kill-power-a.json`: `holds true, unmutatedExit 0, forceTrue killed 98, semantic 19/19, survivors 0`.
- Controls `controls/c1/controls-summary.json`: `allOk true`; do-nothing exit 2/1/2, replay exit 1 ×3, limit-full-identifier-rewrite exit 0 (declared limit witness).
- Supplementary crossgen `scored/c1-counter-{a,b}-crossgen.json`: clean 98, so neither scored receipt is a relabel of a committed r71/r72 receipt.
- Gate registry: SKILL.md `## Round 73 gate registry`; `scored/selftest-r73-gates.out` tail `clean=true cases=12 failed=none`, `exit=0`, measured at the round's revision.

All four frozen legs hold. The frozen `limit` sentence was falsified by R73Critic (a relabelled
previous-generation receipt passes the frozen prior set); this weakens the instrument's replay
guarantee, not the claim — the crossgen controls show this round's receipts are not such relabels.
Correction landed in SCORECARD `## Round 73` (append-only) and QUALITY 138.

Harm check: `git diff d7ff9f19 8c081aa3 --numstat -- SCORECARD.md corpus/QUALITY.md SKILL.md PROVINCE.md LOG.md corpus/SOURCES.md`
→ 20/6/8/0/10/7 insertions, 0 deletions everywhere; PROVINCE.md untouched. No owned axis harmed.

### Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| coverage | improved | C1 legs (a)–(d) hold; capability row 0 → 1 (re-measured) |
| calibration | unchanged | no calibration claim; limit-sentence correction is a record fix, not an axis move |
| operability | unchanged | no claim |
| depth | unchanged | no claim |
| freshness | unchanged | no claim |
| adjacency | unchanged | no claim; R73Connector overlap none |

## 3. Discernment spot-check (`corpus/lessons/round-73.md` `## Gate`)

Sources re-opened from `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`, base64-decoded.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S180 row + r73 note (Blink wheel delta ÷ frame scale) | admit | `web_mouse_wheel_event.cc` (143 lines, sha256 prefix c00b3bf7 = row) | agree | line 104 reads `  return delta_y / frame_scale_;` verbatim; supports the note's sourced division |
| S183 quote (InputEventsScaleFactor) | admit | `local_frame_view.cc` (5,822 lines, sha 146aa4c1 = row) | agree | lines 1994–1997: `page_scale * …GetChromeClient().InputEventsScaleForEmulation()` as quoted |
| `widget_base_input_handler.cc` as a source row | reject | same tag (673 lines) | agree | `grep -nE 'FrameScale\|frame_scale\|SetFrameScale\|InputEventsScale'` → no match; it does not stamp the wheel frame scale |
| "InputEventsScaleForEmulation() is 1" as sourced (pre-freeze) | reject (kept inference) | `chrome_client_impl.cc` (1,602 lines, sha dadba314) | agree | the value is delegated (line 671 `return web_view_->GetDevToolsEmulator()->InputEventsScaleForEmulation();`), so the ChromeClient file alone cannot source "=1"; the flip condition was met post-freeze via S184–S186, correctly kept out of the claim's `sourced` field |

Newly written row re-opened: **S186** (anchor "decoded lines 669-672", sha256 `dadba314…eee`):
re-fetched bytes have sha256 prefix `dadba314`, and the lesson's quote
"return web_view_->GetDevToolsEmulator()->InputEventsScaleForEmulation();" (2 words, ≤25) is at line 671. Agree.

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ exit 0, `tabi ok …/corpus/SOURCES.md`, 25 `W04` duplicate-URL warnings (S058–S173), matching the report's end census (25 W04).

## 4. Trend verdicts

- **expansion: improved** — capability `chromium-synth-pinch-gesture-linux` admitted (row 0 → 1); knowledge 85 → 86 on ground the lane did not hold (Blink half of the pinch wheel law), citing mined rows S180–S183; registry 179 → 186.
- **quality: improved** — the r72 note's inference line is superseded by a sourced statement (S180–S183, S184–S186); the r72 receipt-relative battery case is replaced by absolute anchor cases; replay refusal against `--prior` receipts added; no admitted entry failed its re-check here (S180, S183, S186 re-opened, all hold).
- **discernment: improved** — this non-author spot-check agrees with the gate on both admits and both rejects; the falsified limit sentence became a grounded QUALITY 138 criterion with red/green evidence (`lesson-proof/forge-*.pre-only.json` exit 0 vs `*.crossgen.json` exit 1).

## 5. Routed defects (lane fixes next round)

1. Counter prior set is current-generation only (frozen limit falsified, R73Critic F4/F5): ship the cross-generation prior set (QUALITY 138) in the r74 counter, as a frozen instrument property, not a supplementary control.
2. R73Mut1's 21 witnessed survivors outside the frozen 19-mutant semantic set: add them as battery cases with acceptance witnesses.
3. R73Review1 FG2–FG12 receipt-content false greens and §1.4 (a 1e-12 `ts` change defeats `replay-event-timeline`): harden the timeline comparison.
4. Carried: r71 R2 verifier hardening; R72Scout R3 rows; R4/R5.
5. Conformance note (status-neutral): planner seat held by the L1 (validator rejects `planner`), no planning data-walk seat.

SHONEN: all four boxes `[~]`; boxes 2 and 4 (end-to-end task in LOG.md; PROVINCE accuracy) look checkable by a non-author — operator's call (promotion is operator-owned).
