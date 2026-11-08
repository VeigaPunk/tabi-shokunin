# R88Scribe — round 88, wave w1

Seat: scribe (leaf member; no subagent dispatch). L1 / integration owner: `TabiR88`.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base `f16f992d`.
Dispatch-time digest: **D `93500a4e`** (the dispatch brief's `freeze.txt` digest).

**Role in this wave:** draft records. I did **not** edit any lane file, did not commit, did not
push, did not run any mutating git/jj command, and did not write into
`corpus/evidence/round88/` or `.ufo/waves/round-88/scored/`. Every draft lives in my scratch
(`/fast/scratch/hyaku/tabi-r88/R88Scribe/`); this report is the only file I wrote into the lane,
and it is the path my seat spec names.

## Deliverables (drafted, not integrated)

| # | deliverable | draft | state |
|---|---|---|---|
| (a) | round-88 knowledge-note body for the three new token forms — laws, leg facts, declared limits; divergences vs the committed note | **§Appendix A** below | complete |
| (b) | lesson `## Gate` source rows for S223/S219 with quotes and word counts | **§Appendix B** below | complete |
| (c) | SCORECARD capability row text for generation r88 + round-88 claim-table wording | **§Appendix C** below | complete |
| (d) | three `## Mistakes` candidates for round 88 with class/evidence/captured-by/fix | **§Appendix D** below | complete |

All four drafts were re-verified against the lane **after** its D7 re-freeze; every divergence
listed below still stands in the working tree. The drafts are reproduced in full in the appendices
so they survive the removal of my scratch tree.

---

## Findings (for the L1 to adjudicate)

Seven record-vs-state divergences, one of them substantive (F1). None is a measurement failure:
I re-derived the round's own numbers and they hold.

| # | where | divergence | severity |
|---|---|---|---|
| **F1** | `corpus/knowledge/chromium-showpicker-runtime-round-88.md` front-matter `recheck:` line | The line names the **r87** counter, the **r87** driver sha, the **r87** nonce, the **r87** fixture sha and the **r87** prior-set, and claims "exit 0, 99 checks". **Run verbatim by this seat it exits 1 with 59 findings** (see below). Only the `--receipt` path was re-pointed at r88. | **substantive** — the note's own recheck line does not reproduce the note |
| F2 | `SCORECARD.md` r88 C1 claim-row cell | "battery **212**" — the scored battery has **215** cases | record-vs-state |
| F3 | `SCORECARD.md` r88 C1 claim-row cell | "selftest **10/10**" — the scored selftest has **11** gates (D3 added `gate-selftest`) | record-vs-state |
| F4 | `SCORECARD.md` r88 C2 claim-row cell + `claims.json` C2 leg (b) | before control reads "**4** mismatches" but names **three** statements; `gate-selftest` is missing, and `claims.json` leg (b) still asserts it "is structural and already holds" — it is **red at base** | record-vs-state |
| F5 | `corpus/lessons/round-88.md` §Gate, S223 row | "the normative ground for the **ten-form** acceptance law" — but one of the ten values is **out of grammar** (`image/png;q=0.9`). The note, `claims.json` and the SCORECARD capability row all carry the corrected wording; the lesson is the last r88 record still on the pre-narrowing claim | narrowing-sweep miss (r87 D1 class) |
| F6 | `corpus/knowledge/chromium-showpicker-runtime-round-88.md` | "the honest receipt has **0/34** divergent per-leg copies" — the r88 receipt has **37** legs; seat measured **0 of 37** divergent | stale denominator |
| F7 | `corpus/knowledge/chromium-showpicker-runtime-round-88.md` | body says "the r88 counter re-derives all of them (**99** checks)" (×2) and the limits bullet cites the **r87** fixture/child hashes `10e444f7…` / `bbb22189…` where r88's are `8f93405128f1…` / `2ac1101032b4…` | stale generation values |

### F1 — the note's recheck line fails when run

The committed/working note's front-matter says:

```
recheck: `node scripts/check-showpicker-r87.mjs --lane <ABS lane> --receipt
corpus/evidence/round88/chromium-showpicker/receipt.json --expect-driver-sha256 7c54e786…
--expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7…
--prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json` → exit 0, 99 checks
```

Seat measurement, that command run **verbatim**:

```
EXIT=1   verdict "findings"   checkCount 102   findings 59
```

Five stale tokens, each the r87 generation's value: the script name, the driver sha, the nonce,
the fixture sha and the prior-set path. The trailing claim is wrong on both numbers too (r88 is
102 checks, exit 0). The correct r88 line is in `claims.json` C1 `countingCommand` and in my
knowledge-note draft §3/D1.

This is the same defect class the round-87 spot-check routed as D2 (a recheck line naming the
wrong freeze), inherited because the r88 note was drafted as a copy of the r87 note with only the
body re-pointed. The r87 note shipped the same defect; **r88 should not be the second
consecutive note whose recheck line does not run.**

### F2/F3 — the r88 claim cell lags its own scored artifacts

| item | C1 cell says | scored artifact says |
|---|---|---|
| battery cases | **212** | `scored/battery-a.json`: `"cases": 215` |
| selftest | **10/10** | `scored/selftest.json`: `"cases": 11`, `"clean": true` |

The SCORECARD's *own* trailing line (`Scored (r88): … battery 215/215 … selftest 11/11 …`),
`SKILL.md` (215 cases; 11 gates) and the lesson (215; 11/11) all carry the correct numbers — only
the claim cell lags. Both are record fixes; no predicate, count, threshold or kill rule moves.

### F4 — the before-control parenthetical names three statements for a count of four

The C2 cell: "before (base `f16f992d` worktree): **4 mismatches** (`scorecard-tallies`,
`selftest-wording`, `quality161-sweep` — `scored/drift-before.json`)". `gate-selftest` is the
fourth and is missing. Seat measurement, running the drift gate against a base `f16f992d`
worktree (both the D1 gate `3953e340…` and the D6 gate `e4501c19…`):

```
claims 4   mismatches 4   failed [scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]
  scorecard-tallies  detail: bad=[round-44-no-9, round-44-has-10, … ] tens=10 stray=[2386,3629,3910,3956,3997,4114,4148,4183]
  gate-selftest      detail: mentions=false wired=false counter=false battery=false killpower=false
```

`claims.json` already amended the kill-rule numeral 3 → 4 and disclosed it in `frozenAmendments`
(R88Exec3's measurement) — the **prose was not amended with it**. The lane's own
`scored/drift-before.json` (written 09:06:37) records all four ids, so the artifact is right and
the cell prose lags.

### F5 — the narrowing reached every record but the lesson

Round 88 narrowed "ten token forms" → "ten attribute-string values, **nine** in-grammar",
because `image/png;q=0.9` is **not** an `accept` grammar form: the spec admits "A valid MIME type
string with **no parameters**" (staged page byte 425136). The narrowing is applied in the
knowledge note, `claims.json` C1 `type`/`limit`, and the SCORECARD capability row — but the
lesson's `## Gate` S223 row still says "the normative ground for the **ten-form** acceptance
law". The lesson's own rejected-claims block already says "ten attribute-string values are
measured, **nine of** in-grammar", so the lesson contradicts itself within one file.

The r87 spot-check's D1 asked that a narrowing's copy set be *enumerated by a counting command*.
`scripts/check-record-drift-r88.mjs`'s `quality161-sweep` statement checks that QUALITY 161 names
the SCORECARD tally set and cites the r88 gate; it does not check that the narrowing reached the
lesson's `## Gate` prose.

### F7 — the note carries r87's digests and r87's check count

Body: "The r88 counter re-derives all of them (**99** checks)" — the counter's `checkCount` is
**102** (`scored/counter-a.json`; `claims.json` C1 leg (a); `SKILL.md`; `SCORECARD.md`; the
battery's `coverage.declared`/`covered` 102/102). Limits bullet: "R87Sentinel re-derived the
fixture (`10e444f7…`) and child (`bbb22189…`)" — those are r87's; r88's are fixture
`8f93405128f1…`, child `2ac1101032b4…`.

---

## What I verified as **correct** (so the L1 need not re-check)

The lane's own re-freeze already did good work on the knowledge note; these are the parts I
checked and would not touch.

- **The in-grammar framing.** "ten attribute-string values, nine in-grammar" is right and is the
  round's sharpest finding: `image/png;q=0.9` is a **non-conforming value**, not a third grammar
  form, so the leg measures that even a value the grammar rejects does not filter a programmatic
  answer. I independently confirmed the counter's `GRAMMAR` table has 12 rows over **10 distinct**
  `accept` strings (`image/*` and `image/png, .txt` each appear twice with different answers).
- **The note's three byte citations.** Verified against
  `.ufo/waves/round-88/sources/whatwg-input.html` (687,515 B, sha256 `b0202de1c0b4…`): byte
  424423 is the "ASCII case-insensitive match" token rule, byte 425136 the
  `valid-mime-type-string-with-no-parameters` anchor, byte 425894 the comma-split rule. All three
  locate.
- **The three new legs' facts.** Measured from the receipt: `ac`←`IMAGE/PNG`→`tabi-r88-b.png`
  (21 B, `image/png`); `au`←`audio/*,video/*`→`tabi-r88-a.txt` (22 B, `text/plain`);
  `amc`←`image/png;q=0.9`→`tabi-r88-b.png`. Each lands in **only** its own input's `files` list;
  `input` and `change` both fire with `isTrusted: true`; exactly one `read` event per leg with the
  exact bytes (`\x89PNG\r\n\x1a\ntabi-r83-png\n` / `tabi-r83-answer-alpha\n`); exactly one
  `Page.fileChooserOpened` per leg, `mode: selectSingle`.
- **The r83-marker claim** and **the "tabi-r88-* names" claim** — both confirmed from the receipt.
- **The "comma/whitespace normalization rules are not on the staged page"** claim — confirmed: the
  staged page carries the token *rules* but the mimesniff/infrastructure definitions they point
  at are not staged in this wave's `sources/`.
- **The SCORECARD capability row** — already correct and verified (10 values, 9 in-grammar, 37
  legs, 102 checks).
- **The SCORECARD trailing "Scored (r88)" line** — every figure verified against the scored
  artifacts: 102 checks, battery 215/215, kill power 69/69, selftest 11/11, drift 4 → 0.
- **`corpus/SOURCES.md`'s round-88 search-log entry** — correct: "identified 2 / screened 2 /
  included 0 / excluded 2", S223/S219 "re-opened in place, not superseded", S221/S222 carried, "the
  dialog itself stays unmeasured". The registry rows correctly stay undated (the staged page is
  byte-identical to the r87 copy — `b0202de1c0b4…`).
- **The r88 measurements themselves** — counter `clean`, 102 checks, 0 findings; battery 215
  cases, 0 failed, coverage 102/102; kill power 69 mutants, 69 killed, 0 survived / 0 crashed /
  0 unapplied; selftest 11 gates, clean; drift 0 at HEAD, 4 at base. **The round's numbers hold.**

---

## Two things I want to flag to the L1 beyond the drafts

### 1. The dispatch digest `93500a4e` is D3, and the chain is now seven deep

I reconstructed `93500a4e` exactly: it is the sha256 of a `freeze.txt` with the eight lines in
the order `selftest-r88-gates.mjs`, `check-showpicker-round88.mjs`,
`negatives-showpicker-round88.mjs`, `kill-power-round88.mjs` (the **old** `ed4ee813…` pin),
`check-record-drift-r88.mjs`, `chrome-cdp-showpicker-round88.mjs`, `prior1.json`, `prior2.json`.
That is **D3** in `plans/round-88.md`'s chain — so the wave was dispatched against D3, and seats
read the runner, the kill-power list and the drift gate at four different freezes.

While this seat worked the lane moved to a **seventh** freeze (D7): four instruments carry
uncommitted edits and `freeze.txt` was rewritten again. The D7 edits are robustness hardening
(null-guards on `plan-calls`, a restructured kill-power list) and change **no** count — counter
102/clean/0 findings, battery 215/0/102-of-102, kill power 69/69/0/0/0, selftest 11 clean, and the
scored receipt unchanged. The lesson's `## Mistakes` row and the SCORECARD header should say
"seven", not the plan's current "D2–D5 after the wave".

**A capture-ordering detail the L1 should confirm.** The D4 kill-power repair
(`scripts/kill-power-round88.mjs` at 08:51:10) landed **after** the scored kill-power artifact
(`scored/killpower-a.json` at 08:50:27, which at that moment read `killed 68, unapplied 1`), and
`freeze.txt` was rewritten at 08:51:16 — after the capture. The re-run did happen and the file
now reads 69/69, so the committed tally is right, but the *ordering* shows a window in which
evidence predated the instrument it describes. The next round should re-capture after the final
freeze so the artifact's mtime is provably later than the last instrument edit.

### 2. The lesson has no `## Mistakes` section, and the plan promises one

`corpus/lessons/round-88.md` has exactly one `##` heading: `## Gate`. But `plans/round-88.md`
line 150 says the churn "is mined as a `mid-wave-re-freeze-churn` mistake in
`corpus/lessons/round-88.md` §Mistakes with the missing rule: freeze the runner only after its
gates have all executed green once, and batch every repair." **The section the plan names does
not exist.** It must be created, not amended. My draft (d) proposes three candidates in the
round-87 table shape (`class | evidence | captured-by | fix`):

- **M1 `mid-wave-re-freeze-churn`** — the plan's own promise; seven freezes, six after dispatch;
  the D3→D5 pair is the counter-example (the `gate-selftest` gate was pinned before it had ever
  run green).
- **M2 `record-vs-state-staleness`** — the r87 spot-check's **D1** class recurring inside this
  round's own claim cells (F2, F3, F4): the drift gate reads `SCORECARD.md` but counts only four
  statements and never inspects the round's own before/after figures, exactly as the r87 gate's
  five statements could not see the r87 sweep.
- **M3 `narrowing-partial-sweep`** — F5: the in-grammar narrowing reached the note, `claims.json`
  and the SCORECARD but not the lesson's `## Gate` prose; and the drift gate reads the **r87** note
  (`corpus/knowledge/chromium-showpicker-runtime-round-87.md`) and **no** r88 note, so a re-opened
  row's own prose is unenforced.

Each candidate names its evidence with a path, quotes the stale string, and attributes a
captured-by. None proposes moving a predicate, counter, pin, prior, threshold or kill rule; the
fixes are record-text corrections plus a rule statement for the next round.

---

## Bounds observed

- **Read-only outside my seat's report path.** I edited no lane file: not `SKILL.md`,
  `SCORECARD.md`, `LOG.md`, `plans/`, `corpus/**`, `scripts/**`, `claims.json` or `freeze.txt`.
  The only lane file I wrote is this report at the path my seat spec names.
- **Never wrote into** `corpus/evidence/round88/` or `.ufo/waves/round-88/scored/`.
- **No mutating git/jj command** anywhere: no add, commit, stash, checkout, switch, reset, pull,
  push. `git log`, `git show`, `git diff`, `git status`, `git archive`, `git ls-tree` only.
- **No `git worktree add` was used.** The base comparison was done by `git archive f16f992d` into
  my own scratch directory and running the lane's gate against it read-only; nothing was created
  in the lane or the fleet repo.
- **Fixture-repo rule not needed**: no fixture repo was created, so no `git init` and no toplevel
  assertion was required. The base tree I extracted was never committed to.
- **No host sysctls touched**, no service restarted, no package installed.
- **No `agent://all` broadcast.** I did not message any peer.
- **Scratch**: `/fast/scratch/hyaku/tabi-r88/R88Scribe/` holds the four drafts and the extracted
  base tree; it is removed before this seat yields.

## Tooling

**No tools were installed, upgraded or removed.** The work used only what the host already had:
`node` (v24.21.0), `git`, `python3` (standard library only), `jq`, `sha256sum`, `stat`, `sed`,
`grep`. I read `/home/vgpnk/.omp/agent/RULES.md` as instructed; its directive to install helpful
tools was not triggered, because nothing in this seat's task needed a tool that was absent.
Per the round's ruling, no `pacman` transaction was attempted.

## What the main agent should check after integrating

1. That the note's `recheck:` line is the **r88** command and that running it returns exit 0 /
   102 checks (F1).
2. That the SCORECARD r88 C1 cell reads **battery 215** and **selftest 11/11** (F2, F3), and the
   C2 cell names **four** before-control statements (F4).
3. That `claims.json` C2 leg (b)'s prose matches its already-disclosed `frozenAmendments` numeral
   (F4) — a prose alignment, not a numeral change.
4. That the lesson's S223 row carries the in-grammar wording and a word count, and that a
   `## Mistakes` section exists with the three candidates (F5, and deliverable (d)).
5. That the two `scored/drift-*.json` files are **committed** before filing, and that the final
   freeze's digest is what the SCORECARD header, the lesson and `claims.json` all name (the
   chain is moving).
6. That the round's frozen predicate, counter, pins, priors, thresholds and kill rules are
   **unchanged** by any of the above — every fix proposed here is a record-text fix.

---

# Appendix A — Draft: round-88 knowledge-note body (three new token forms)

**Status: DRAFT for TabiR88 (L1) to integrate. Not written into the lane.**
Scope: the `corpus/knowledge/chromium-showpicker-runtime-round-88.md` body covering the three new
`accept` values. Compared against the committed note at `82d0c2b8` (the lane's own re-freeze
already revised it once). Every fact below was measured by this seat from committed bytes; no lane
file was edited.

> **Live-state caveat.** The lane was mid-re-freeze (D7) while this seat worked: the working tree
> moved from D6 `4daf8817` to a seventh freeze, and four instruments
> (`check-showpicker-round88.mjs`, `negatives-showpicker-round88.mjs`, `kill-power-round88.mjs`,
> `check-record-drift-r88.mjs`) carry uncommitted edits. The D7 edits are **robustness hardening
> only** — null-guards on `plan-calls` and a restructured kill-power list; the counter's
> `checkCount` stays **102**, `verdict` stays `clean`, 0 findings, and the scored battery (215
> cases, 0 failed, coverage 102/102), kill power (69/69/0/0/0) and selftest (11 gates, clean) all
> hold. The scored **receipt** is unchanged. Every divergence below was re-verified against the
> working tree after the D7 edit and still stands. The L1 should re-check the exact digests at
> file time, since the freeze is moving.

## A.1 Measured facts this draft rests on (seat measurements)

Receipt `corpus/evidence/round88/chromium-showpicker/receipt.json`
(nonce `tabi-r88-l1-86f1dcec`, driver `8c015fa4…`, fixture `8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`,
child `2ac1101032b4115e774ffedebe237daac2d46420fa13606ebad3cdb7521844a6`, 37 legs, 0 failures).

| leg | input | raw `accept` read from the page | answer delivered | bytes read back by the page |
|---|---|---|---|---|
| `sp88-accept-case-png` | `ac` | `IMAGE/PNG` | `tabi-r88-b.png` (21 B, `image/png`) | `89504e470d0a1a0a746162692d7238332d706e670a` → `\x89PNG\r\n\x1a\ntabi-r83-png\n` |
| `sp88-accept-audiovideo-text` | `au` | `audio/*,video/*` | `tabi-r88-a.txt` (22 B, `text/plain`) | `746162692d7238332d616e737765722d616c7068610a` → `tabi-r83-answer-alpha\n` |
| `sp88-accept-mimeparam-png` | `amc` | `image/png;q=0.9` | `tabi-r88-b.png` (21 B, `image/png`) | same PNG bytes as above |

Per leg, verified by this seat:
- the delivered file lands in that input's `files` list and **only** that input's list
  (`stateAfter` for `ac`/`au`/`amc` respectively; the other sixteen are `[]`);
- `input` and `change` both fire with `isTrusted: true`, and both carry the same
  `[[name, size, type, '']]` entry;
- exactly one `read` page event per leg, `ret` = `hex:` + the bytes above;
- exactly one `Page.fileChooserOpened` per leg, `mode: selectSingle`;
- `showPicker()` returns `undefined` with no error; activation is consumed
  (`activationBefore.isActive: true` → `activationAfter.isActive: false`).

The counter's `accept-grammar-law` (one check) binds each of the three legs on **all** of:
answer files, `setParams.files` basename + `backendNodeId`, `setResult`/`setError`, the
`stateAfter` entry, one `read` event with the exact hex, and the `accept` string on the input
descriptor. Counter `checkCount` = **102**; `verdict: clean`; `findings: []`.

Per-leg descriptor copies: all 37 legs carry a `fixtureInputs` copy and **0 of 37** diverge from
the top-level snapshot (seat measurement) — the committed note's "0/34" is stale (it was the r87
leg count; r88 has 37).

## A.2 Draft body (proposed replacement text)

### The measured laws

1. **`accept` is not a validator on a programmatic answer — now over ten attribute-string values,
   nine of them in-grammar.** Every leg delivers a file through `DOM.setFileInputFiles` to an
   input whose raw `accept` attribute is read back from the page (`fixtureInputs`), and in every
   case the delivered file lands in the input's `files` list with its bytes, fires trusted
   `input`+`change`, and the page reads the bytes back (`read` event `ret: 'hex:…'`);
   `Page.fileChooserOpened` carries `selectSingle`. The new legs (this generation):

   - `accept="IMAGE/PNG"` (upper-case variant) answered with `image/png` bytes —
     `sp88-accept-case-png` (input `ac`);
   - `accept="audio/*,video/*"` (combined media-type list, no space after the comma) answered with
     `text/plain` — `sp88-accept-audiovideo-text` (`au`);
   - `accept="image/png;q=0.9"` answered with `image/png` — `sp88-accept-mimeparam-png` (`amc`).
     The spec's own token list admits only "A valid MIME type string with no parameters"
     (`input.html` byte 425136), so this value is **not** an `accept` grammar form: it is a
     non-conforming attribute value whose behaviour the spec leaves unspecified. The leg therefore
     measures a stronger thing than a grammar form — even a value the grammar rejects does not
     filter a programmatic answer.

   The r86/r87 forms (`image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`,
   `image/png,application/pdf`, the whitespace variant) and the r84 extension-token law
   (`.txt` into `accept=".png"`) are the controls; the whole matrix is gated by
   `accept-grammar-law`. The spec's own word for the attribute is "hint": it "may be specified to
   provide user agents with a hint of what file types will be accepted". What a user's DIALOG would
   offer or refuse is not measured by this receipt.

2. **Carried unchanged from r86** — the same-origin `tel`/`search`/`text` arms, the cross-origin
   `date`/`month`/`week`/`time`/`number`/`range`/`tel`/`search`/`text` `SecurityError`, the
   origin-before-mutability order discriminator, the directory answer with `webkitRelativePath`,
   `multiple` → `selectMultiple`, the second-chooser payload answer, and the same-origin
   `type=color` activated arm (`undefined`, activation consumed, no input/change, zero file
   choosers). The r88 counter re-derives all of them (**102** checks).

### What a receipt of this shape cannot prove

- **Acceptance is not filtering.** `DOM.setFileInputFiles` answers a chooser programmatically; the
  law says `accept` does not filter THAT path. What a user's dialog offers or rejects is not
  measured — headless opens no real dialog — and is not claimed.
- **Ten attribute-string values, nine of them in-grammar.** The case variant (`IMAGE/PNG`) is in
  grammar ("ASCII case-insensitive match", byte 424423) and the combined list (`audio/*,video/*`)
  is in grammar (the comma-split rule, byte 425894); `image/png;q=0.9` is out of grammar by the
  spec's own wording (byte 425136). The parser's whitespace/comma normalization read from the DOM,
  and the full WHATWG "unique security error" ordering for every type, stay unmeasured.
- **The whitespace leg measures the raw attribute string**, not a parsed token list: the counter
  compares the page's `accept` string exactly, so parser normalization is not inferred from it.
- **The colour arm is bounded to the file-chooser metric.** Zero `Page.fileChooserOpened` events do
  not show whether a colour popup appeared; nothing stronger is claimed.
- **The counter reads a receipt.** Its printed `limit` names the escape: a forger who shifts every
  page event by a constant offset passes the replay rule. Provenance is bound by the driver pin, the
  fixture sha and the nonce; the browser's own execution is not re-derived.
- **Secure-context state is not recorded.** The fixture is `http://127.0.0.1:<port>` (a
  potentially-trustworthy origin); nothing here measures a non-secure-context page.

### Limits the wave established (r88)

- **The pins are declaration-level in the counter.** `driver-pin` and `fixture-hash` compare receipt
  fields to the CLI pins; the counter never opens the instrument bytes. The fixture is verifiable
  out-of-band, not by the counter: this receipt's fixture hash is `8f93405128f1…` and its child
  hash `2ac1101032b4…`, re-derivable from the pinned driver + the r78 template + this receipt's
  nonce/child port.
- **Per-leg attribute copies are not separately witnessed.** The accept fact binds through the
  top-level `fixtureInputs` snapshot (copied from the first leg's read); the honest receipt has
  **0 of 37** divergent per-leg copies, but a per-leg copy can disagree with no finding.
- **The comma/whitespace normalization rules are not on the staged page.** They live on two linked
  pages the Scout opened; the whitespace leg measures the raw attribute string and nothing about a
  user agent's tokenisation.
- **The delivered bytes still carry an r83 marker** — the PNG body ends `tabi-r83-png\n` and the
  text body is `tabi-r83-answer-alpha\n`, under the r88 file names `tabi-r88-b.png` /
  `tabi-r88-a.txt`. The names and hashes are what the counter binds; the content marker is inherited
  fixture bytes, not a wrong-generation artifact. The r88 driver writes the `tabi-r88-*` names;
  the r87 driver wrote `tabi-r87-*` — the r88 counter binds the r88 names.

### Frontier (named, not held)

- The parser's whitespace/comma normalization read from the DOM rather than the raw string.
- A same-element origin comparison (an input reachable from both origins via a `postMessage` proxy)
  — not constructible in the current loopback fixture.
- What a `type=color` same-origin call does to the colour popup itself (not a CDP file-chooser
  event) — needs a UI-side probe or a source-side reading of the colour chooser path.

## A.3 Divergences from the committed note (`82d0c2b8`)

Listed for the L1 to adjudicate. **D1 is the substantive one**; D2–D4 are stale counts/citations
that the note inherits from r87.

### D1 — the note's `recheck:` front-matter line names the **r87** counter and the **r87** receipt

The committed note's front-matter says:

> recheck: `node scripts/check-showpicker-r87.mjs --lane <ABS lane> --receipt
> corpus/evidence/round88/chromium-showpicker/receipt.json --expect-driver-sha256
> 7c54e786… --expect-nonce tabi-r87-l1-3dd4b0802d67 --expect-fixture-sha256 10e444f7…
> --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json` → exit 0, 99 checks

Seat measurement — **that exact command was run verbatim** against the r88 receipt:

```
node scripts/check-showpicker-r87.mjs --lane <lane> --receipt corpus/evidence/round88/chromium-showpicker/receipt.json \
  --expect-driver-sha256 7c54e786… --expect-nonce tabi-r87-l1-3dd4b0802d67 \
  --expect-fixture-sha256 10e444f7… --prior-set .ufo/waves/round-87/controls/c1/prior-set.txt --json
→ EXIT=1, verdict "findings", checkCount 102, findings 59
```

So the note's own recheck line **fails**: exit 1, 59 findings — not the "exit 0, 99 checks" it
claims. This is the same class of defect the round-87 spot-check routed as D2 (a recheck line
naming the wrong freeze), and it survived into r88 because the r88 note was drafted as a copy of
the r87 note with only the body re-pointed at r88.

The correct r88 recheck line, from the lane's own frozen predicate (`claims.json` C1
`countingCommand`):

```
node scripts/check-showpicker-round88.mjs --lane <ABS lane> \
  --receipt corpus/evidence/round88/chromium-showpicker/receipt.json \
  --expect-driver-sha256 8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4 \
  --expect-nonce tabi-r88-l1-86f1dcec \
  --expect-fixture-sha256 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35 \
  --prior-set .ufo/waves/round-88/controls/c1/prior-set.txt --json
→ exit 0, verdict clean, 102 checks
```

Note the four stale tokens, each of which is the r87 generation's value: the **script name**
(`check-showpicker-r87.mjs`), the **driver sha** (`7c54e786…` = r87's), the **nonce**
(`tabi-r87-l1-3dd4b0802d67` = r87's), the **fixture sha** (`10e444f7…` = r87's) and the
**prior-set path** (round-87's). Only the `--receipt` path was updated to r88. The trailing claim
"exit 0, 99 checks" is also wrong on both numbers (r88 is 102 checks, exit 0).

### D2 — "the honest receipt has 0/34 divergent per-leg copies" (stale denominator)

The committed note says `0/34`. The r88 receipt has **37** legs and the seat measured **0 of 37**
divergent per-leg copies (`fixtureInputs` present on all 37 legs, every one byte-identical to the
top-level snapshot). `34` is the r87 leg count. The claim's substance is unchanged — the copies
really are unenforced by the counter — but the denominator is stale and understates the
copies-in-witness set.

### D3 — the "Limits the wave established (r88)" bullet still cites the **r87** fixture and child hashes

The committed note says:

> R87Sentinel re-derived the fixture (`10e444f7…`) and child (`bbb22189…`) hashes …

Those are r87's fixture/child hashes. The r88 receipt's are fixture **`8f93405128f1…`** and child
**`2ac1101032b4…`**. As written the r88 note points a reader at the previous generation's
provenance. The draft above replaces the r87 attribution with the r88 hashes and drops the
`R87Sentinel` attribution, since the re-derivation that actually happened in r88 (if any) is not
recorded in the r88 wave's committed bytes.

### D4 — the front-matter `source:` line cites the r88 receipt but the note body says "99 checks"

The body's carried law 2 says "The r88 counter re-derives all of them (99 checks)". The counter's
`checkCount` is **102** (`scored/counter-a.json`: `"checkCount": 102`; the battery's
`coverage.declared`/`covered` are 102/102; `claims.json` C1 leg (a) says "at checkCount 102";
`SKILL.md` says 102; `SCORECARD.md` says 102). `99` is r87's number. The draft above corrects it
to 102.

### Non-divergences worth recording (checked, so the L1 need not re-check)

- The r88 body's **byte citations** are correct. Verified against
  `.ufo/waves/round-88/sources/whatwg-input.html` (687,515 B, sha256 `b0202de1c0b4…`):
  byte 424423 sits inside the `set-of-comma-separated-tokens` anchor whose text carries
  "ASCII case-insensitive"; byte 425136 is the `valid-mime-type-string-with-no-parameters`
  anchor; byte 425894 sits at the `split-a-string-on-commas` anchor ("the user agent must split
  the attribute value on commas"). The anchors themselves are at 424476/424667, 425145 and 426024,
  so the cited bytes are the *sentence* positions the note claims, not off-by-one anchor
  artefacts. (The *anchor* offsets differ from the cited sentence offsets; the note cites
  sentences, and the sentences are where the note says.)
- The r88 body's **"ten attribute-string values, nine of them in-grammar"** framing is right and
  is the sharpest thing in the note: the spec's token list admits "A valid MIME type string with
  no parameters", so `image/png;q=0.9` is a **non-conforming value**, not a third grammar form.
  The note's framing upgrades the claim correctly — the leg measures that even a value the
  grammar rejects does not filter a programmatic answer.
- The r88 body's **"`Page.fileChooserOpened` carries `selectSingle`"** — verified: one chooser per
  sp88 leg, `mode: selectSingle` on all three.
- The r88 body's **"trusted `input`+`change`"** — verified `isTrusted: true` on both events of
  all three sp88 legs.
- The r88 body's **`read` event `ret: 'hex:…'`** — verified one `read` per sp88 leg with the exact
  bytes listed in A.1 above.
- The r88 body's **"the r88 driver writes the `tabi-r88-*` names"** — verified in the receipt
  (`tabi-r88-b.png`, `tabi-r88-a.txt`).
- The r88 body's **"the r83 marker"** claim — verified by decoding the `read` hex: PNG bodies end
  `tabi-r83-png\n`, the text body is `tabi-r83-answer-alpha\n`.
- The r88 body's **"the comma/whitespace normalization rules are not on the staged page"** —
  confirmed: the staged `input.html` contains the token *rules* ("ASCII case-insensitive match",
  "valid MIME type string with no parameters", "split the attribute value on commas") but **not**
  the mimesniff/infrastructure definitions those rules point at (the `href`s point to
  `mimesniff.spec.whatwg.org` and `infra.spec.whatwg.org`, neither staged in this wave's
  `sources/`). The note's claim is accurate.
- The r88 body's **"the full WHATWG 'unique security error' ordering"** frontier item — the phrase
  "unique security error" occurs **0 times** in the staged page (the one `unique` occurrence is
  "a unique security token" in an unrelated autocomplete passage). The phrase is inherited from
  r87 and is not locatable in the staged source. It is a *named frontier*, i.e. a claim that
  something is unmeasured, not a claim about the page — so it is not a false statement, but it
  would be better named as "the `showPicker()` exception-ordering rules beyond the three thrown
  here (not mutable → `InvalidStateError`; no transient activation → `NotAllowedError`; cross-origin
  → `SecurityError` unless File Upload or Color)", which *is* locatable in the staged page
  (byte 424322 region and the `showPicker()` IDL paragraph). Suggest as an optional tightening,
  not a required edit.

### Note on the recheck line's provenance

The r87 spot-check's §2 recorded that the round-87 note carried the same defect class in its
`recheck:` line. The r88 note is a descendant of that file: `diff` between the r87 and r88 notes
shows the front-matter `recheck:` value was edited (receipt path only) rather than rewritten.
Whatever the L1 does with D1, the r88 note should not be the second consecutive note to ship a
recheck line that does not run.

---

# Appendix B — Draft: lesson `## Gate` source rows for S223 / S219 (round 88)

**Status: DRAFT for TabiR88 (L1) to integrate. Not written into the lane.**
Model: the round-87 lesson's `### Sources — opened this round` block
(`corpus/lessons/round-87.md` lines 23–42), which is the shape the lane uses.
All word counts below were measured by this seat with `printf '%s' … | wc -w`; all byte offsets
were measured against the staged page.

## B.1 Proposed replacement rows

```markdown
### Sources — opened this round

The L1 re-opened the living WHATWG input page on 2026-11-08 (HTTP 200, 687,515 bytes, sha256
`b0202de1c0b4…`, staged at `.ufo/waves/round-88/sources/whatwg-input.html`).

- **S223** — the `accept` attribute's own sentence, plus the token-list sentence the three new
  attribute values are read against. Located quote (18 words, `printf '%s' … | wc -w`): "attribute
  may be specified to provide user agents with a hint of what file types will be accepted."
  (the page's own sentence opens "The accept attribute may be specified to provide user agents with
  a hint of what file types will be accepted." — 20 words; the 18-word form drops the leading
  "The accept", as in round 87). This is the normative ground for the ten-value acceptance law
  (a hint, not a validator on a programmatic answer).
  Located quote (24 words, `printf '%s' … | wc -w`): "the attribute must consist of a set of
  comma-separated tokens, each of which must be an ASCII case-insensitive match for one of the
  following" (staged page byte 424423). The list that follows admits, among others, "A valid MIME
  type string with no parameters" (8 words, byte 425136), which is what makes `IMAGE/PNG` in
  grammar ("ASCII case-insensitive") and `audio/*,video/*` in grammar (the comma-split rule: "the
  user agent must split the attribute value on commas", 10 words, byte 425894), while
  `image/png;q=0.9` is **out** of grammar — a non-conforming attribute value whose behaviour the
  spec leaves unspecified.
- **S219** — the `showPicker()` colour exemption, re-opened this round as the ground of the colour
  arm. Located quote (21 words, `printf '%s' … | wc -w`): "Throws a 'SecurityError' DOMException if
  input is inside a cross-origin iframe, unless input is in the File Upload or Color states." (The
  page's own quotation marks are straight double quotes; the nested single quotes here render the
  inner DOMException name.)

Identified 2 / screened 2 / included 0 / excluded 2 for NEW rows; no registry change. The round-88
`## Search log` entry is added at `corpus/SOURCES.md` (this round's bounded re-opening).
```

## B.2 Why the S223 row needs to carry a second sentence this round

Round 87's S223 row carried one sentence, and that was enough: r87 measured only **in-grammar**
values, so the hint-sentence alone grounded its law. Round 88 measures one value that is **not** a
grammar form (`image/png;q=0.9`). A note that quotes only the hint sentence cannot support the
sentence "this value is out of grammar" — that judgement needs the token-list sentence
("ASCII case-insensitive match for one of the following" + "A valid MIME type string with no
parameters") and the comma-split sentence.

Without the second quote, a reader of the lesson cannot tell where the in/out-of-grammar
distinction came from, and the round's most substantive finding (r88 is not three new token forms;
it is two new in-grammar values plus one non-conforming value) loses its only textual ground.

The three quotes together also make the *law* stronger than the hint sentence alone: the spec both
calls the attribute a "hint" and defines the token grammar, so "accept is not a validator on a
programmatic answer" is a claim about the attribute's *role*, and the token list is a claim about
which values are well-formed. The r88 legs cover the second claim too.

## B.3 Measured word counts (all by this seat)

| quoted text | words | where |
|---|---|---|
| "attribute may be specified to provide user agents with a hint of what file types will be accepted." | **18** | staged page byte 424312 (`may be specified to provide user agents with a hint`); the full `<dfn>`-wrapped sentence opens at byte 424208 |
| "The accept attribute may be specified to provide user agents with a hint of what file types will be accepted." | **20** | byte 424208 — the whole sentence as the page renders it |
| "the attribute must consist of a set of comma-separated tokens, each of which must be an ASCII case-insensitive match for one of the following" | **24** | byte 424423 |
| "A valid MIME type string with no parameters" | **8** | byte 425136 |
| "the user agent must split the attribute value on commas" | **10** | byte 425894 |
| "Throws a 'SecurityError' DOMException if input is inside a cross-origin iframe, unless input is in the File Upload or Color states." | **21** | staged page, `showPicker()` IDL paragraph |
| "accept is a hint to the user agent about the file types to offer, not a validation rule on the selected files" (the SOURCES.md row quote) | **22** | `corpus/SOURCES.md` row S223 |

The r87 lesson's own counts are reproduced and unchanged: S219 = 21 words, and the S223
18-word form. The r87 spot-check recorded the S223 *registry-row* quote as 22 words — that is the
`corpus/SOURCES.md` row's quote field, a different string from the 18-word located quote in the
lesson. Both numbers are correct for their own string; keeping them distinct matters.

## B.4 Divergences from the committed round-88 lesson

The committed `corpus/lessons/round-88.md` (at `82d0c2b8`, and unchanged in the working tree at
the time of writing) already carries the S223/S219 rows, and they are **mostly right**.
Divergences:

### L1 — the S223 row has no word count and no token-list sentence

The committed row reads:

> - **S223** — the `accept` attribute's own sentence. Located quote: "attribute may be specified to
>   provide user agents with a hint of what file types will be accepted." This is the normative
>   ground for the ten-form acceptance law (a hint, not a validator on a programmatic answer).

Two gaps:
- **no word count**, while the S219 row in the same list carries "(21 words, `printf '%s' … |
  wc -w`)". The asymmetry is not defensible: the S223 quote is the round's primary source sentence
  and it is the one the law rests on. The r87 lesson had the same asymmetry; this round should not
  inherit it.
- **"the ten-form acceptance law"** — the committed lesson says *ten-form*, but the round's own
  finding is that one of the ten values is **out of grammar** (`image/png;q=0.9`). "Ten-form"
  asserts all ten are forms. The lane's own committed knowledge note (also at `82d0c2b8`) already
  corrected this to "ten attribute-string values, nine of them in-grammar", and so did
  `claims.json` C1 `type`/`limit` and the SCORECARD capability row. The lesson is the **one**
  r88 record still carrying the pre-correction wording — and it contradicts its own rejected-claims
  block two paragraphs below, which says "ten attribute-string values are measured, **nine of**
  in-grammar". This is the QUALITY-161 narrowing-sweep class the r88 drift gate was built to catch
  — but the gate's four statements do not read the lesson's `## Gate` prose, so nothing catches it.

### L2 — the committed row's grammar justification is absent

The committed row grounds only the hint sentence. The round's actual measured claim — that
`image/png;q=0.9` is a non-conforming value — has no textual ground in the lesson at all. The
draft above adds it.

### L3 — the committed `## Gate` block names the admitted note but not the *new* leg facts

Not a defect; a completeness note for the L1. The committed `## Gate` block's "Admitted:" line
cites `corpus/knowledge/chromium-showpicker-runtime-round-88.md` correctly. The two rejected
claims and their flip conditions are correct and carried.

### L4 — the committed lesson has no `## Mistakes` section at all

See Appendix D. The plan explicitly promises one: `plans/round-88.md` line 150 — "The churn itself
(D2–D5 after the wave) is mined as a `mid-wave-re-freeze-churn` mistake in
`corpus/lessons/round-88.md` §Mistakes with the missing rule: freeze the runner only after its
gates have all executed green once, and batch every repair." The lesson at `82d0c2b8` has exactly
one `##` heading: `## Gate`. **The §Mistakes section the plan names does not exist in the
lesson.** The promise is made in a committed plan and the deliverable is absent from a committed
lesson.

## B.5 Note on the round-88 census and search-log entries

- `corpus/SOURCES.md` line 311 already carries the round-88 search-log entry, correctly stating
  "identified 2 / screened 2 / included 0 / excluded 2 for NEW rows", that S223/S219 were
  "re-opened in place, not superseded", and that S221/S222 were carried, not re-opened. It also
  correctly states that "the dialog itself stays unmeasured". No change needed.
- The registry rows for S219 and S223 are **unchanged** (still "mined", still dated 2026-11-07,
  still pointing at `b0202de1c0b4` — which is byte-identical to the round-88 staged copy, so no
  re-dating is warranted for a re-opened row). Verified: `.ufo/waves/round-88/sources/whatwg-input.html`
  and `.ufo/waves/round-87/sources/whatwg-input.html` both hash to `b0202de1c0b4…`.

---

# Appendix C — Draft: SCORECARD capability row + round-88 claim-table wording (round 88)

**Status: DRAFT for TabiR88 (L1) to integrate. Not written into the lane.**
Compared against `SCORECARD.md` at `82d0c2b8` (the lane's latest commit) and the working tree.
All numbers below are seat measurements over committed/working bytes; no lane file was edited.

> **Live-state caveat.** The lane was mid-re-freeze (D7) while this seat worked; four instruments
> carry uncommitted edits. The D7 edits change no count: counter `checkCount` **102**, `verdict`
> `clean`, 0 findings; battery **215** cases, 0 failed, coverage 102/102; kill power
> **69** mutants, 69 killed, 0 survived/crashed/unapplied; selftest **11** gates, clean. The two
> `scored/drift-*.json` files that were absent when this draft was first written have since
> appeared (09:06:37) with `mismatches 0` and `mismatches 4` respectively — so divergence **S4**
> below is now **partially resolved**: the artifacts exist, but see the note on their provenance
> under S4. Every divergence was re-verified against the working tree after the D7 edit.

## C.1 Proposed capability row

```markdown
| `chromium-showpicker-linux` (generation r88) | As r87, and now: the `accept` acceptance law holds over ten attribute-string values (nine in-grammar) — `IMAGE/PNG` ← png, `audio/*,video/*` ← txt, and the non-conforming `image/png;q=0.9` ← png all accept a programmatic answer with trusted input+change and page-read bytes, with each raw attribute read from the page (37 legs, 102 checks) | `corpus/evidence/round88/chromium-showpicker/receipt.json`; `corpus/knowledge/chromium-showpicker-runtime-round-88.md` | 79 |
```

**This is already the committed text at `82d0c2b8`** — the lane's own re-freeze already applied the
in-grammar correction. The row is sound as committed. Two seat-verified confirmations:

- "ten attribute-string values (nine in-grammar)" — the counter's `GRAMMAR` table has 12 rows over
  **10 distinct** `accept` strings (`image/*` and `image/png, .txt` each appear twice with two
  different answers); the ten distinct strings are `image/*`, `image/png, .txt`, `application/pdf`,
  `audio/*`, `video/*`, `image/png,application/pdf`, `  image/png ,  .txt  `, `IMAGE/PNG`,
  `audio/*,video/*`, `image/png;q=0.9`. Nine are in-grammar; `image/png;q=0.9` is not (the spec
  admits "A valid MIME type string with no parameters", staged page byte 425136). Verified.
- "37 legs, 102 checks" — receipt `.legs | length` = 37; `scored/counter-a.json` `checkCount` = 102.
  Verified.

The row already names the third value's status inline ("the **non-conforming**
`image/png;q=0.9`") and already says "with each raw attribute read from the page". **No change
needed.**

## C.2 Proposed round-88 claim-table rows

The lane's r88 section currently has this shape (abridged to the cells that matter):

```markdown
| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-showpicker-linux` generation r88 (sourced: S223/S219 re-opened) | `node scripts/check-showpicker-round88.mjs …`; leg (b) battery + kill power; leg (c) row, note, registry, selftest (predicate `C1-SHOWPICKER-R88`) | base `f16f992d`: no r88 receipt → exit 2 `receipt-unreadable`; the r87 scored receipt under the r88 counter → exit 1; after: the scored receipt → exit 0, `verdict clean`, **102 checks**, 0 findings; battery 212/0/coverage 102/102; kill power 69/69/0/0/0; selftest 10/10 | VERIFIED |
| C2 calibration (9), the r87 spot-check routed defects D1-D4 (`scripts/check-record-drift-r88.mjs`, predicate `C2-RECORDDRIFT-R88`) | `node scripts/check-record-drift-r88.mjs --lane <ABS lane> --json` (exit 0 iff 4 claims, 0 mismatches) | before (base `f16f992d` worktree): **4 mismatches** (`scorecard-tallies`, `selftest-wording`, `quality161-sweep` — `scored/drift-before.json`); after: **0** of 4 (`scored/drift-a.json`); the drift gate's own `--selftest` runs isolated and exits 0 | VERIFIED |
```

### C.2.1 What needs to change in the C1 cell

The C1 cell is the one place where the committed SCORECARD still disagrees with itself and with
the lane's own scored artifacts. Seat measurement against the committed/working bytes:

| item | C1 claim cell says | scored artifact says | verdict |
|---|---|---|---|
| battery cases | **212** | `scored/battery-a.json`: `"cases": 215` | **stale — must be 215** |
| battery failed / coverage | `0` / `102/102` | `"failed": 0`, `coverage.declared 102`, `coverage.covered 102` | correct |
| kill power | `69/69/0/0/0` | `scored/killpower-a.json`: mutants 69, killed 69, survived 0, crashed 0, unapplied 0 | correct |
| selftest | **10/10** | `scored/selftest.json`: `"cases": 11`, `"clean": true`, `failed []` | **stale — must be 11/11** |

The lane already knows both numbers: `SKILL.md` line 3342 says the battery has **215 cases**;
`SKILL.md` line 3345 says the selftest runner has **11 gates**; the SCORECARD's own trailing line
(`Scored (r88): 102 checks, battery 215/215, kill power 69/69, selftest 11/11, record drift 4 → 0`)
carries both correctly; `corpus/lessons/round-88.md` says battery **215** and selftest **11/11**.
**Only the C1 claim-row cell still carries the r87-era numbers 212 and 10/10** — the same
"one cell left behind" shape as the r87 spot-check's D2.

The selftest figure moved because D3 added the `gate-selftest` gate to the runner (ten r87 gates
plus one = eleven). The battery figure moved because the r88 battery carries the three new legs'
own cases plus three grammar cases.

Proposed corrected cell:

```
after: the scored receipt → exit 0, `verdict clean`, **102 checks**, 0 findings; battery 215/0/coverage 102/102; kill power 69/69/0/0/0; selftest 11/11
```

### C.2.2 What needs to change in the C2 cell

The C2 cell says the before control is "**4 mismatches** (`scorecard-tallies`, `selftest-wording`,
`quality161-sweep` — `scored/drift-before.json`)".

Seat measurement: the D6 gate run against a base `f16f992d` worktree gives **4 mismatches** —
`scorecard-tallies`, `selftest-wording`, **`gate-selftest`**, `quality161-sweep`. The count is
right; **the parenthetical list names only three of the four.**

The omission matters because `claims.json` C2 leg (b) — the frozen predicate — says the same
three names, and says "gate-selftest is structural and already holds". It does not hold at base:
the base tree has no `scripts/selftest-r88-gates.mjs` `gate-selftest` gate, no `--selftest` mode in
the r88 instruments, and no `check-record-drift-r88` citation in QUALITY 161 — the gate's own
detail string is `mentions=false wired=false counter=false battery=false killpower=false`.
`claims.json` has already amended the *kill rule* numeral from 3 to 4 and disclosed that in
`frozenAmendments` (R88Exec3's measurement), but **leg (b)'s prose still names three statements
and still asserts the fourth "already holds"**. The amendment fixed the number and left the
narrative.

Proposed corrected cell:

```
before (base `f16f992d` worktree): **4 mismatches** (`scorecard-tallies`, `selftest-wording`, `gate-selftest`, `quality161-sweep` — `scored/drift-before.json`); after: **0** of 4 (`scored/drift-a.json`); the drift gate's own `--selftest` runs isolated and exits 0
```

and, in `claims.json` C2 leg (b), replace

> exits 1 with mismatches 3 (scorecard-tallies, selftest-wording, quality161-sweep; gate-selftest is structural and already holds)

with

> exits 1 with mismatches 4 (scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep — the fourth is red at base because QUALITY 161 there carries neither the SCORECARD scope nor the r88 gate citation)

consistent with the already-disclosed `frozenAmendments` entry.

### C.2.3 The two `scored/*.json` pointers in the C2 cell

The C2 cell points at `scored/drift-before.json` and `scored/drift-a.json`. **Neither file
existed** when this seat first measured the tree (08:5x); both appeared at 09:06:37 during the
lane's D7 work. Seat measurement of `.ufo/waves/round-88/scored/`:

```
(at first measurement)
PRESENT battery-a.json   counter-a.json   killpower-a.json   selftest.json
ABSENT  drift-before.json   drift-a.json

(at 09:06:37, after the D7 edit)
PRESENT battery-a.json  counter-a.json  drift-a.json  drift-before.json  killpower-a.json  selftest.json
  drift-a.json      → claims 4, mismatches 0, failed []
  drift-before.json → claims 4, mismatches 4, failed [scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]
```

The two artifacts now exist and their contents match what this seat independently measured
(0 mismatches at HEAD, 4 at base). **The pointer is therefore no longer dangling.** What the
L1 should still do: confirm both files are **committed** before filing (they are untracked at the
time of writing — `git status` shows `?? .ufo/waves/round-88/scored/`), and confirm the drift
figures were captured against the **final** instrument bytes — the drift gate was edited at
09:04:52 and `freeze.txt` at 09:04:59, both within a minute of the artifacts being written at
09:06:37; the artifact's own content (4 statements, the four named ids) is consistent with the
D6/D7 gate, so the capture is sound, but the ordering is tight.

Note for comparison: the r87 wave committed all of its artifacts
(`battery-a.json`, `counter-a.json`, `drift-a.json`, `drift-before.json`, `killpower-a.json`,
`selftest.json`). The r88 wave must do the same for the two new files.

If the artifacts are not committed, the fallback is to re-point the cell at the reproducible
command (already in the cell's second column) and drop the file pointers. I am not authoring
`scored/` files — that tree is read-only for seats.

### C.2.4 The round-88 header block

The header currently reads (committed, `82d0c2b8`):

```
Base `f16f992d`; instrument freeze D6 **`4daf8817`** (D1 `86f1dcec`, D2 the selftest re-pin and the genuine
37-leg priors, D3 the `gate-selftest` gate, D4 one batched kill-power mutant repair;
`plans/round-88.md` §Re-freeze history). The scored receipt was produced once at the D1-derived
nonce **`tabi-r88-l1-86f1dcec`**; every later freeze touched only non-receipt instruments. Axes at start: all six at 9; C1 works a lowest axis and is a capability
move (generation r88 of the r79 capability); C2 works calibration (record-vs-state mismatches).
```

Two amendments the L1 should consider:

- **The D-list is short and will get shorter.** It names D1–D4 but the freeze chain is now
  **seven** deep: D1 `86f1dcec`, D2 `138bb883`, D3 `93500a4e`, D4 `77656d8a`, D5 `c3fa144b`,
  D6 `4daf8817`, and D7 in flight. The plan's §Re-freeze history carries the causes. The header's
  parenthetical should either enumerate the digests or say "D1–D7 (digests in `plans/round-88.md`
  §Re-freeze history)" rather than naming four.
- **The dispatch-time D is `93500a4e`.** I reconstructed that digest exactly: it is the sha256 of a
  `freeze.txt` with the eight lines in the order
  `selftest-r88-gates.mjs`, `check-showpicker-round88.mjs`, `negatives-showpicker-round88.mjs`,
  `kill-power-round88.mjs` (the **old** `ed4ee813…` pin), `check-record-drift-r88.mjs`,
  `chrome-cdp-showpicker-round88.mjs`, `prior1.json`, `prior2.json` — i.e. **D3**. So the wave was
  dispatched against D3 and the lane has since re-frozen. Worth a line in the header so a reader
  who holds the dispatch brief can reconcile.

### C.2.5 The trailing "Scored (r88)" line

```
Scored (r88): 102 checks, battery 215/215, kill power 69/69, selftest 11/11, record drift 4 → 0.
- Digests: D 4daf8817, nonce tabi-r88-l1-86f1dcec. 102 checks, battery 215 cases, kill power 69 mutants.
```

Every figure verified against the scored artifacts: counter 102 (`checkCount`), battery 215
(`cases`), kill power 69 (`mutants`, 69 killed, 0 survived/crashed/unapplied), selftest 11
(`cases`, clean), drift 4 → 0 (base worktree 4, HEAD 0). **No change needed.** This line is
already right; it is the C1/C2 cells above that lag it.

## C.3 Summary of divergences from the committed SCORECARD

| # | location | divergence | severity |
|---|---|---|---|
| S1 | r88 C1 claim-row cell | "battery 212" — the scored battery has **215** cases | record-vs-state; the SCORECARD's own trailing line, `SKILL.md` and the lesson all say 215 |
| S2 | r88 C1 claim-row cell | "selftest 10/10" — the scored selftest has **11** gates (D3 added `gate-selftest`) | record-vs-state; trailing line, `SKILL.md` and the lesson all say 11/11 |
| S3 | r88 C2 claim-row cell | before-control parenthetical names **3** statements for a count of 4; `gate-selftest` is missing | record-vs-state; the frozen `claims.json` leg (b) carries the same defect and asserts the fourth "already holds" — it does not |
| S4 | r88 C2 claim-row cell | cites `scored/drift-before.json` and `scored/drift-a.json`; both **appeared at 09:06:37** during D7 and are **still untracked** — the pointer resolves now, but the files must be committed | evidence-provenance; partially resolved |
| S5 | r88 section header | D-list names D1–D4; the chain is seven deep (D1–D7) | incomplete audit trail |
| S6 | r88 section header | does not say the wave dispatched at D3 (`93500a4e`) and the lane now stands at D7 | reconciliation aid; the dispatch brief cites D3 |
| — | r88 capability row | **none** — committed text is correct and verified | — |
| — | r88 trailing "Scored" line | **none** — every figure verified against the scored artifacts | — |

S1–S3 are the same defect class the round-87 spot-check routed as D1 (records disagreeing with
observed state, invisible to the drift gate because its four statements do not read the SCORECARD
*cell* prose). They are record fixes, not predicate changes: no claim, count, threshold or kill
rule moves.

## C.4 A note on the drift gate's reach (relevant to S1–S3)

`scripts/check-record-drift-r88.mjs` reads `SCORECARD.md` in full and counts four statements:
`scorecard-tallies` (the seven r87-swept historical rounds read `9/9` and carry no `10/10`),
`selftest-wording`, `gate-selftest`, `quality161-sweep`. It runs green (0 mismatches) against HEAD
— the seat confirmed this by running it. But it never looks at the round-88 **claim-row cells** or
the **trailing Scored line**: the numbers 212 and 10/10 sit in the r88 section and are simply not
in the gate's scope, exactly as the r87 sweep was invisible to the r87 gate's five statements.

This is the r87 spot-check's D1 lesson recurring in a new place. The D6 strengthening
("`scorecard-tallies` now checks EVERY `## Round N` occurrence … and requires every `selftest
10/10` line in the file to sit inside a Round 87/88 section") makes the *historical* tally set
airtight; it does not cover the round's own before/after figures.

The L1 should decide whether to (a) close S1–S3 by editing the two cells (a record fix, in scope
for the integration owner), or (b) extend the gate. I am not proposing (b): the prompt forbids
proposing to amend a predicate, counter, pin, prior, threshold or kill rule, and a new gate
statement is a threshold change. (a) is the correct scope for this wave — the round's own claim
cells must agree with the round's own scored artifacts before filing.

---

# Appendix D — Draft: three `## Mistakes` candidates for round 88

**Status: DRAFT for TabiR88 (L1) to integrate. Not written into the lane.**
Model: the round-87 lesson's `## Mistakes` table (`corpus/lessons/round-87.md` lines 84–94),
columns `class | evidence | captured-by | fix`.
Sources consulted, as the assignment directs: the round-87 rejected spot-check's **D1**
(`corpus/lessons/round-87-verifier-spotcheck.md` §7) and this round's **mid-wave re-freeze
history** (`plans/round-88.md` §Re-freeze history, lines 101–151).

**Important context for the L1:** the committed `corpus/lessons/round-88.md` has exactly one
`##` heading — `## Gate`. **There is no `## Mistakes` section in the lesson at all**, yet
`plans/round-88.md` line 150 names one as the place where the churn "is mined as a
`mid-wave-re-freeze-churn` mistake". A `## Mistakes` section must therefore be *created*, not
amended — and candidate **M1** below is the one the plan already promises. Candidates **M2** and
**M3** are additional, and each has its own committed-byte evidence.

## D.1 The three candidates

### M1 — `mid-wave-re-freeze-churn` (the plan's own promise)

| class | evidence | captured-by | fix |
|---|---|---|---|
| `mid-wave-re-freeze-churn` — the instrument family was re-frozen **seven** times (D1 `86f1dcec` → D2 `138bb883` → D3 `93500a4e` → D4 `77656d8a` → D5 `c3fa144b` → D6 `4daf8817` → D7, whose digest is still moving), and **six of the seven re-freezes landed after the wave was dispatched**. The wave was dispatched against D3 (the digest `93500a4e` in the dispatch brief is exactly the sha256 of the D3 `freeze.txt` — reconstructed by this seat), so seats read the runner, the kill-power list and the drift gate at four different freezes; the D4 repair alone changed the kill-power instrument's bytes *after* the scored kill-power run had already been captured against the un-repaired one. Each repair was honest and each is recorded with its cause in `plans/round-88.md` §Re-freeze history, but they were **not batched**: D2, D3, D4, D5, D6 and D7 each landed separately, and D5 exists only because D3's `gate-selftest` gate was shipped before its modes had ever been executed green. | `plans/round-88.md` §Re-freeze history (D1–D6 with causes, D7 in flight); the freeze digest chain D1 `86f1dcec` / D2 `138bb883` / D3 `93500a4e` / D4 `77656d8a` / D5 `c3fa144b` / D6 `4daf8817`; file mtimes `scripts/kill-power-round88.mjs` 08:51:10 vs `.ufo/waves/round-88/scored/killpower-a.json` 08:50:27 and `.ufo/waves/round-88/freeze.txt` 08:51:16 (capture **before** the repair); the D6 critic-driven strengthening recorded in the plan's D6 entry; the D3 runner gate's own read bug recorded in the plan's D5 entry; the D7 edits to four instruments and `freeze.txt` (09:04–09:05) still uncommitted at the time of writing | the seats' own hash-at-read discipline; the plan's §Re-freeze history is the reconciliation, but **no lane rule caught the churn** — the runner was re-frozen twice (D3 added a gate, D5 fixed that gate) without ever being frozen only-after-green, which is the rule the plan itself names | the repair set is frozen once at the tip and the chain is recorded with each cause, as the plan does; **the missing rule is added**: freeze the runner only after its gates have all executed green once, and batch every repair into one re-freeze. This round's D3→D5 pair is the counter-example — `gate-selftest` was added at D3 and had to be repaired at D5 because it was never run green before being pinned. The next round freezes the runner last, after a full green selftest run, and lands no further re-freeze after the wave is dispatched. |

**Why this is candidate #1.** The plan already names this class and names the missing rule
verbatim (`plans/round-88.md` lines 148–151). Mining it is a promise the round made to itself and
has not yet kept — the lesson has no `## Mistakes` section. Fulfilling it is the smallest
honest way to close the loop.

**A sharper detail the L1 should weigh.** The re-freeze history is not merely *churn*; it is
churn that **outran the evidence**. At D4 the kill-power instrument was repaired (the
`no-selection-empty-dropped` mutant's from-string was still the pre-r88 empty-state key list, so
it was unapplied and the round measured 68/69). Seat measurement of the working tree at the time
of writing: `scored/killpower-a.json` was written at **08:50:27** — *before* the
`scripts/kill-power-round88.mjs` repair at **08:51:10** and *before* the `freeze.txt` rewrite at
**08:51:16** — and the artifact's content at that moment read `killed 68, unapplied 1`. The
lane's committed tally is "69 mutants, 69 killed, 0 crashed, 0 unapplied", which is the
*post*-repair number, and the artifact on disk now reads `mutants 69, killed 69, survived 0,
crashed 0, unapplied 0` — so the re-run did happen and did overwrite the file. The ordering is
therefore sound in content but the **capture-before-repair** window is real and is exactly the
kind of thing a re-freeze must not leave implicit. Worth one clause in this row: **a post-wave
re-freeze that changes an instrument invalidates any artifact captured against the pre-repair
bytes, and the repair must be followed by a re-capture whose ordering is provable.** The next
round re-captures after the final freeze, and the `scored/` file's mtime must be later than the
final instrument edit.

**And the churn did not stop at D6.** While this seat worked, the lane moved to a **seventh**
freeze (D7): `scripts/check-showpicker-round88.mjs`, `negatives-showpicker-round88.mjs`,
`kill-power-round88.mjs` and `check-record-drift-r88.mjs` all carry uncommitted edits, and
`freeze.txt` was rewritten again. The D7 edits are robustness hardening (null-guards on
`plan-calls`, a restructured kill-power list) and change **no** count — counter `checkCount` 102,
`verdict clean`, 0 findings; battery 215/0/102-of-102; kill power 69/69/0/0/0; selftest 11 clean;
the scored receipt unchanged. But the chain is now **seven** deep, and the lesson's row should say
so rather than the plan's current "D2–D5 after the wave".

### M2 — `record-vs-state-staleness` (the r87 D1 class, recurring in the round's own cells)

| class | evidence | captured-by | fix |
|---|---|---|---|
| `record-vs-state-staleness` — the round-88 SCORECARD's own **C1 claim-row cell** carries two r87-era numbers that the round's own scored artifacts contradict: it reads "**battery 212**" where `scored/battery-a.json` records `"cases": 215`, and "**selftest 10/10**" where `scored/selftest.json` records `"cases": 11, "clean": true` (D3 added the eleventh gate, `gate-selftest`). The SCORECARD's *own* trailing line (`Scored (r88): … battery 215/215 … selftest 11/11`), `SKILL.md` (215 cases; 11 gates) and the lesson (215; 11/11) all carry the correct numbers — only the claim cell lags. This is the **same class the round-87 spot-check routed as D1** (records disagreeing with observed state), landing inside the very round that claims to have repaired it. | `SCORECARD.md` r88 C1 claim-row cell ("battery 212/0/coverage 102/102; … selftest 10/10") vs `.ufo/waves/round-88/scored/battery-a.json` (`"cases": 215`) and `.ufo/waves/round-88/scored/selftest.json` (`"cases": 11`); `SKILL.md` lines 3342 and 3345; `corpus/lessons/round-88.md` line 71; the r87 spot-check's D1 (`corpus/lessons/round-87-verifier-spotcheck.md` §7.1) | the drift gate **cannot** see it: `scripts/check-record-drift-r88.mjs` reads `SCORECARD.md` but counts only the four statements (`scorecard-tallies`, `selftest-wording`, `gate-selftest`, `quality161-sweep`) — the round's own before/after figures in the claim cells are outside its scope, exactly as the r87 blanket tally sweep was outside the r87 gate's five statements. No seat report claims it; this seat found it by reading the cell against the scored artifacts | the C1 claim cell's two numbers are corrected to **battery 215/0/coverage 102/102** and **selftest 11/11** before filing — a record fix, no predicate, count, threshold or kill rule moves. The missing rule, for the next round: **the round's own before/after figures in the claim row are part of the claim row and must be re-derived from the scored artifacts at file time.** The r87 spot-check's lesson was that a gate that cannot see a defect class will not catch it a second time; the r88 gate is green (0 mismatches) while the round's own claim cell is stale, which is that lesson repeating. |

**Why this is candidate #2.** It is the direct sequel to the assignment's instruction to look at
the r87 spot-check's D1. D1 said: *"extend QUALITY 161's counting command (or the drift gate) to
SCORECARD round tallies so a blanket sweep fails a predicate — the current five statements cannot
see it."* The r88 round did extend the gate's reach (D6: `scorecard-tallies` now checks **every**
`## Round N` occurrence and requires every `selftest 10/10` line to sit inside a Round 87/88
section). That hardening was aimed at the *historical* sweep. But it left the round's **own**
figures unchecked — and those are the figures a reader of the claim row actually checks.

**A second instance of the same class, in the same cells.** The C2 cell says the before control
is "**4 mismatches** (`scorecard-tallies`, `selftest-wording`, `quality161-sweep`)" — three names
for a count of four. `gate-selftest` is red at base (the base tree has no `--selftest` mode in the
r88 instruments and QUALITY 161 there cites neither the SCORECARD scope nor the r88 gate). The
count was already amended in `claims.json` (`frozenAmendments`, R88Exec3's measurement: 3 → 4);
the **prose was not**. And `claims.json` C2 leg (b) still asserts "gate-selftest is structural and
already holds", which is false at base — the seat's own base-worktree run of the gate (D1 version
`3953e340…` and D6 version `e4501c19…`, both) returns `mismatches 4`, `failed
[scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]`. I recommend the L1 fold
this into M2's row rather than making it a fourth candidate: it is the same class
(record-vs-state), the same fix (re-derive the cell's figures from the artifacts at file time),
and the same absence of gate coverage. The lane's own `scored/drift-before.json` (written
09:06:37) now records exactly this — `mismatches 4`, all four named — so the *artifact* is right
and only the *cell prose* lags.

### M3 — `narrowing-partial-sweep` (the in-grammar correction did not reach every record)

| class | evidence | captured-by | fix |
|---|---|---|---|
| `narrowing-partial-sweep` — round 88 **narrowed** its own claim from "ten token forms" to "ten attribute-string values, **nine of them in-grammar**", because `image/png;q=0.9` is not a grammar form at all (the spec admits "A valid MIME type string with no parameters", staged page byte 425136). The narrowing was applied to the knowledge note (`corpus/knowledge/chromium-showpicker-runtime-round-88.md`: "now over ten attribute-string values, nine of them in-grammar" and "**Ten attribute-string values, nine of them in-grammar.**"), to `claims.json` C1 `type`/`limit`, and to the SCORECARD capability row ("ten attribute-string values (nine in-grammar) … and the **non-conforming** `image/png;q=0.9`") — but **not** to the lesson, whose `## Gate` block still reads "the normative ground for the **ten-form acceptance law**". One r88 record therefore states the pre-narrowing claim the round has already abandoned, and the lesson contradicts itself: its rejected-claims block says "ten attribute-string values are measured, **nine of** in-grammar" while its S223 row says "ten-form". | `corpus/lessons/round-88.md` §Gate, S223 row: "This is the normative ground for the ten-form acceptance law (a hint, not a validator on a programmatic answer)" — against `corpus/knowledge/chromium-showpicker-runtime-round-88.md` "ten attribute-string values, nine of them in-grammar"; `claims.json` C1 `type` and `limit`; `SCORECARD.md` r88 capability row; the staged source `.ufo/waves/round-88/sources/whatwg-input.html` byte 425136 (the `valid-mime-type-string-with-no-parameters` anchor) and byte 424423 (the "ASCII case-insensitive match" token rule); R88Scout F1/F4 (`w1/R88Scout.md` §7) | the QUALITY-161 sweep statement in `scripts/check-record-drift-r88.mjs` (`quality161-sweep`) checks that QUALITY 161 *names* the SCORECARD tally set and cites the r88 gate — it does not check that the narrowing reached every copy. `scripts/check-record-drift-r88.mjs` reads the **r87** note (`corpus/knowledge/chromium-showpicker-runtime-round-87.md`, line 98) and **no** r88 note — a re-opened row's own prose is unenforced. The r87 spot-check's D1 named this class for the tally sweep; this is the same sweep applied to a *narrowing* rather than a tally | the lesson's S223 row is re-worded to "the normative ground for the ten-value acceptance law (**nine in-grammar**)" and carries the token-list sentence (see Appendix B), so the in/out-of-grammar distinction has a textual ground in the lesson as well as in the note. **The missing rule:** a narrowing's wording must be swept to every copy *in the same round that makes it*, including the lesson's `## Gate` prose and the `## Admitted` line — QUALITY 161 asks that a counting command *enumerate the set* of copies, and the r88 set enumerates the note, the plan, `SKILL.md` and ledger cells but **not the lesson's Gate block**. The next round's narrowing set names the lesson's Gate section explicitly. |

**Why this is candidate #3.** It is the narrowest and the most precisely evidenced of the three:
a single stale phrase in a committed record, contradicted by two sibling records in the same
commit, with the spec text that settles it at a measured byte. It is also the r87 spot-check's
D1 class exactly ("records rewritten without the round's own evidence" → here, "records *not*
rewritten when the round's own evidence moved"). The r87 D1 required a **counting command** that
enumerates the copy set; r88's `quality161-sweep` statement still does not enumerate the lesson's
Gate block.

## D.2 Coverage note — what these three deliberately do NOT claim

- **They do not claim the round's measurements are wrong.** C1's ten values, the 102 checks, the
  215-case battery, the 69/69 kill power and the 11/11 selftest were each re-derived by this seat
  and hold. Every candidate above is a **record-vs-state** finding, not a measurement finding.
- **They do not propose amending a predicate, counter, pin, prior, threshold or kill rule.** M2's
  fix is a cell-text correction plus a rule statement; M3's fix is a wording correction plus a
  rule statement; M1's fix is a batching rule. No claim is moved, no count is moved, no threshold
  is moved. Where `claims.json` already amended a numeral (3 → 4) the fix here is to bring the
  *prose* into line with the amendment that was already disclosed — not to move the numeral again.
- **They do not propose extending a gate.** M2 and M3 both note that the drift gate cannot see
  the defects. Adding a gate statement is a threshold change and is out of scope for this seat;
  the recommendation is to fix the records and to record the *rule* the next round should follow,
  leaving the gate's design to the L1 and the next round's calibration claim.

## D.3 Drafted sweep paragraph (the round-87 model's tail)

The r87 lesson closes its `## Mistakes` section with a sweep note. Suggested for r88:

> Sweep for further mistakes: the counter (102 checks), battery (215 cases), kill power (69
> mutants), drift gate (4 statements) and the wave's landed reports were re-read; the three
> classes above are the ones with a demonstrated failure mode. The round's own measurements were
> re-derived by a non-author seat and hold — counter clean at 102 checks, battery 215/0 with
> coverage 102/102, kill power 69/69/0/0/0, selftest 11/11, drift 4 → 0 — so none of the three
> classes above is a measurement failure.
