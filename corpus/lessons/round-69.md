# tabi — round 69 (attempt 1, fresh start)

Fresh start under operator Amendment 46. Before declaring, the L1 read the last three rejected
closures (MANIFEST rounds[] indices 1325, 1336, 1341 — rounds 66, 67, 68, all
`rejected-honest-stop`) and their verifier spot-checks (`corpus/lessons/round-66-verifier-spotcheck.md`,
`round-67-…`, `round-68-…`). The common root failure: three rounds in a row worked the lowest
axis (adjacency, 8) on the round-62/66 sibling ledger, and every closure graded the move as
something else — freshness (r66 rebind, 0 dispositions changed), withdrawn (r67, disposition
meaning not countable), calibration/bookkeeping (r68, gate hardening, 49 rows still pending).
This round leaves that ledger alone and moves a different adjacency surface: tabi's own
`PROVINCE.md`, which had no Adjacent section at all, while kake's `PROVINCE.md:40-46` declared a
tabi split and a contested scope naming tabi that tabi never answered.

Base `58d84eda992ffc11d77d76a2c1019bfe061f9241`. Pre-freeze instruments and executed controls
`a70c231d`; freeze `a033979c` (`.ufo/waves/round-69/claims.json`); freeze digests `d65546b3`
(`.ufo/waves/round-69/freeze.txt`). Axes at start: adjacency 8 (lowest), coverage 9, depth 9,
operability 9, freshness 9, calibration 9. Saturation 8 / window 3; capability
`chromium-hscroll-domain-linux` entered at r67, inside the window, so no stagnation nudge.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0,
173 rows (`.ufo/waves/round-69/census/start.txt`).

## Gate

### Sources — new rows

- **S174** — Chromium 155.0.8059.84 `content/browser/devtools/protocol/input_handler.cc`,
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/content/browser/devtools/protocol/input_handler.cc?format=TEXT`
  (base64-decoded). Access date 2026-11-06 (L1; `.ufo/waves/round-69/sources/input_handler.cc.accessed`).
  Staged `.ufo/waves/round-69/sources/input_handler.cc`, sha256
  `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`, 2,343 lines; the base64
  transport is committed beside it and decodes to the same digest. The R69Scout seat re-opened
  the same URL independently (`.ufo/waves/round-69/w1/R69Scout/`).
  - Located quote 1 (line 2239, 4 words): "if (repeat_count > 0) {" — the repeat loop in
    `OnScrollFinished`; the response is sent in the `else` branch at line 2248.
  - Located quote 2 (line 2169, 1 statement): "gesture_params.prevent_fling = prevent_fling.value_or(kDefaultPreventFling);"
  - Tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-69 knowledge
    note and this lesson.
  - Same document as **S162** (round 59, URL without `?format=TEXT`, scope `GetEventModifiers`;
    staged `.ufo/waves/round-59/sources/input_handler.cc`, the same sha256 `72cf0d1d…4f4`). S174 is a
    second scope on that file, not a correction of S162 (the S168/S173 precedent the r68 closure
    agreed with). The fleet census does not warn: the two URLs differ by the query string. Found by
    R69Scout after the row was drafted (Mistakes, duplicate-document row).
- Status / recheck / used-by changes (old → new): **S173** used-by
  `corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md, corpus/lessons/round-68.md` →
  `… , corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md` (the new note cites
  S173 Input.pdl:293-296 for the distance sign). No other row changed.

### Admitted

- `corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md` (cites S174, S173): the
  measured page-side delivery of `Input.synthesizeScrollGesture` on this host, each behaviour
  tied to a source line. Flips the round-68 Gate reject "runtime capability claim for
  `Input.synthesizeScrollGesture`", whose flip condition was "a live run with a measured
  receipt": scored run (a) `corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`
  and independent cold run (b) `.ufo/waves/round-69/w1/R69Exec1/receipt.json`.
- `PROVINCE.md` `## Adjacent — sibling matrix (round 69)`: 20 rows, each quote re-located at the
  snapshot head by the counter.

### Rejected (with flip conditions)

- **Touch-source scrolling as a capability.** The touch leg delivered pointer(touch) events and
  `touchstart`/`touchend` but never scrolled the document. Not claimed as "touch scrolling works"
  and not claimed as "touch scrolling cannot work": only the measured non-scroll on desktop
  metrics is recorded. Flip: a receipt where a touch-source gesture moves scrollY on this host
  (the R69Exec4 falsification probes are the first attempt).
- **"S174 authenticates the build that ran."** Rejected: the staged digest proves byte identity
  with the fetched tag, not that `/usr/bin/chromium` 155.0.8059.84 (Arch) was built from exactly
  these bytes with no distro patch. Flip: a distro patch list for chromium 155.0.8059.84 showing
  no change to this file.
- **The connector's blind relations as the matrix.** Not adopted wholesale: 5 of 20 rows still
  disagree after integration (below). Adopted where its evidence was better (kaidoku).

### Connector comparison (non-author-of-the-row relation draft)

R69Connector drafted all 20 relations blind (`.ufo/waves/round-69/w1/R69Connector/relations.tsv`).
Agreement with the L1 draft: 14/20. The L1 then adopted the connector's `kaidoku contested`
(kaidoku `PROVINCE.md:55`: self-launched `chromium --headless --remote-debugging-port=9222`
targets — the same CDP ground tabi owns), so the integrated matrix agrees 15/20. The remaining
5 disagreements, kept as disagreements:

| lane | matrix | connector | why the matrix keeps its label |
|---|---|---|---|
| kake | contested | adjacent | kake `PROVINCE.md:45` says in words "contested scope (kagi/tabi/kake)"; the connector cited line 40 only |
| kagi | contested | adjacent | kagi `PROVINCE.md:64` marks the CDP 9222 musketeer lease contested; tabi's CDP session discipline touches it |
| kengaku | adjacent | none | kengaku names a tabi instrument as a shared primitive (`PROVINCE.md:103`); the counter's inbound rule forbids `none` for a sibling that names tabi |
| kotoba | adjacent | none | kotoba scopes SKILL.md craft fleet-wide (`PROVINCE.md:3`); kotoba's own matrix grades tabi `none` (`PROVINCE.md:76`) — a real two-sided disagreement, reported |
| tameshi | adjacent | none | tameshi owns the reusable fixture/mutation method tabi's batteries use; the connector reads tameshi's refusal of product domains as no shared surface |

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| vacuous receipt (exit code recorded after a command substitution) | the L1's first control recorder wrote `exit` from `$?` evaluated after `$(… \| python3 …)`, so every control would have recorded exit 0, including the do-nothing control whose counter printed `red`; caught before commit and re-recorded (`.ufo/waves/round-69/controls/*/*.exit.json`: do-nothing C1 exit 1, no-receipt C2 exit 2) | none | capture `rc=$?` on the line after the command; QUALITY 130. Shown able to fail: the committed do-nothing receipt records `"exit": 1` beside a `red` stdout; the buggy recorder produced `0` for the same command |
| misroot over-correction carried in a lane commit | r68 commit `920b6be4` added the lane-root file `report written` (`agent://TabiR68a2`), routed as R1 in `round-68-verifier-spotcheck.md:127` | none (the helper's scope guard accepts any named path) | removed in freeze commit `a033979c`; `git ls-tree master -- "report written"` is empty now and non-empty at `920b6be4` |
| duplicate document unseen before appending a row | S174 drafted without checking that S162 already registers `input_handler.cc` at the same tag (R69Scout §1: `.ufo/waves/round-59/sources/input_handler.cc` has the same sha256) | none (the census duplicate-URL rule compares the URL string; `?format=TEXT` makes it differ) | S174 scope cell now names S162 and the second scope; before appending a row, `grep -n '<path without query>' corpus/SOURCES.md` — shown able to fail: it returns the S162 line for this file |
| battery coverage below the counter's check set | R69Mut2: 4 single-point weakenings of `check-synthscroll-r69.mjs` survive all 44 negatives (per-leg scrollYBefore, absolute scrollY, wheel direction off their one tested leg, nonce shape) — `.ufo/waves/round-69/w1/R69Mut2/report.md` | the mutation seat (this round) | not amended (the battery is pinned); discriminating forged receipts committed by the seat; next generation adds one negative per check per leg |

## Attack findings (wave w1) — routed, not amended

The instruments are pinned at the freeze; nothing below changed them. Each item is a defect for a
later generation, with the seat report that reproduces it.

- **C1 counter proves form, not boundary** (R69Critic §1–§2, `.ufo/waves/round-69/w1/R69Critic/`):
  a cheapest control (title-line quotes, labels from a `\btabi\b` regex, one boilerplate side) and
  an over-claim variant (19 `adjacent`) both pass the counter and the 19-negative battery. The
  committed matrix differs from the null only on manual reading (0/20 vs 17/20 title-line quotes,
  19 vs 1 distinct sides, three contested rows no rule forces). Critic verdict: adjacent
  (conditional) — the move is the AXES adjacency surface, but "re-derivable by the command" was
  an overstatement, now corrected in the SCORECARD round-69 row.
- **C1 counter false-greens** (R69Review1 F1–F11, `.ufo/waves/round-69/w1/R69Review1/`): the
  sibling's own declared relation is never compared (kotoba grades tabi `none` at
  `PROVINCE.md:76`; the inbound rule forces tabi to `adjacent` and accepts the contradiction —
  reported to the integrator as a two-sided disagreement); the outbound set is read from the
  first `**Refuses:**` paragraph only; only the first matrix section is read; `contested` needs no
  contested text; `tabi side` accepts vacuous text; CRLF input is refused for the wrong reason.
- **C1 battery gaps** (R69Mut1, 14/18 killed): quote lower bound, side minimum, same-relation
  duplicates and case-sensitive `tabi` survive all 19 negatives.
- **C2 counter checks internal consistency only** (R69Critic §3): a fabricated-but-consistent
  receipt (forged host, zeroed timestamps, empty stderr, rewritten nonce) passes the counter and the
  battery; the driver pin is self-attested; (b) has no cross-run check. The live run is shown by
  manual provenance: runs (a) and (b) differ in 387 leaf paths.
- **C2 battery gaps** (R69Mut2, 21/26 killed, 1 equivalent): per-leg scrollYBefore, absolute
  scrollY, wheel direction off their one tested leg, and nonce shape.

## Claims — measured

| Claim | Axis | Before (do-nothing) | After | Verdict |
|---|---|---|---|---|
| C1 sibling matrix | adjacency | base PROVINCE.md: exit 1 `matrix-missing`, bound 0/20 | exit 0, rows 20, bound 20/20, inbound 3/3 (kake, kengaku, kotoba), outbound 4/4 (kagi, kaidoku, kake, revenger); real-mode battery 19/19 | see SCORECARD round 69 |
| C2 capability `chromium-synth-scroll-gesture-linux` | coverage | no receipt: exit 2 | run (a) clean, run (b) clean, battery 44/44 on (a) and on (b) | see SCORECARD round 69 |

## Assimilation

Assimilation: none (no claim slot used; `considerthese/` does not exist in this lane).
