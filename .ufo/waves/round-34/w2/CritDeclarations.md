# w2 CritDeclarations — attack on the four round-34 tabi declaration lines

Seat: `CritDeclarations` (critic, leaf). Wave w2 = FALSIFY. Target: lane commit
`04f9623dde8ad35d470cecf766e421eafbcb47fa`; baseline `15dfaccb34601c2d221c78501e2befd8998d600c`.
I attacked `SKILL.md:2921-2924` as tabi-side claims and report findings only; nothing in the lane was edited.

## Verdict

**Three of four lines hold; `SKILL.md:2923` is a defect — severity low (false provenance of the
sibling-side authority, fixable by one citation edit).** The defect does not break the C1 predicate: the
adjacency gate reads clean at the integration revision (`verdict=clean rows=17 verified=17`, exit 0), all
four lines are new at the baseline, each is one physical line carrying its row's `tabi_quote` and
`ruling_quote`, none carries a control character, none absorbs ground on `PROVINCE.md`'s Refuses list
(revenger/kaidoku forensics, kake publishing, kagi secrets), and none claims a measured surface the lane
never measured — `:2922` explicitly denies a Lighthouse run, `:2921` restricts header/redirect capture to
loopback or operator-authorized properties (a hedge that matches C2's operator-go-ahead gate, not a claim
of an operator-property capture). The one real defect is in `:2923`: it grounds kotoba's half of the split
on `kotoba PROVINCE.md:13`, and that line — at kotoba's pinned commit `65a5c7a` and at its current tip —
is *"Agent-definition, always-on (AGENTS.md-class) and dispatch-prompt craft"*. Kotoba's `PROVINCE.md`
contains no line naming tool `name`/`description`/`inputSchema` craft anywhere (grep receipt below), and
kotoba's own census records the tabi row as `none` with the note that the split "never reached tabi's scope
surfaces" and only asks "whether to land it". So the declaration cedes to kotoba a surface kotoba does not
claim on its scope surfaces, citing a line about a different surface. Substance survives partially: kotoba
`SKILL.md:75-76` does document craft over one tool's `description` (and over `instructions`),
so the `description` half has real kotoba ground; the `name`/`inputSchema` half exists only as the subject
matter of kotoba's *census* note (`sibling-overlap-census-round49.md:173`), i.e. the wording of tabi's own
round-16 draft, not a kotoba scope surface. That is the smallest safe correction: repoint the parenthetical
to the census line the map already pins (which is where the surface is actually named), or narrow the
cession to `description` and cite kotoba `SKILL.md:76`; the map row's `ruling_quote` must move with the
edit because it contains the parenthetical.

## Evidence

Scratch clone (one live clone, integration rev; every lane script run there, never in the lane checkout):

```
$ git clone --shared -q /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
$ git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa
$ git -C $S/clone rev-parse HEAD        -> 04f9623dde8ad35d470cecf766e421eafbcb47fa   exit 0
$ git -C $S/clone rev-parse --show-toplevel -> /fast/scratch/hyaku/tabi-r34/CritDeclarations/clone  exit 0
```

Gates I ran (all in the clone, `--repo`/`--fleet` as the C1 contract requires):

```
$ node scripts/check-adjacency.mjs --repo $S/clone --fleet /home/vgpnk/Projects/shokunin \
    --at 04f9623dde8ad35d470cecf766e421eafbcb47fa --json
{"schema":"tabi-adjacency-check-v1",...,"verdict":"clean","rows":17,"verified":17,"selfRulings":[2],...}  exit 0
  receipt: .ufo/waves/round-34/w2/CritDeclarations/receipt-adjacency-gate.json
```

Quote containment / single-physical-line / control-char check, read from `corpus/adjacency.tsv` rows 15-18
against `SKILL.md` at the same revision (`receipt-declaration-quotes.json`): rows 15, 16, 17, 18 →
`tabi_quote_present=true`, `ruling_quote_present=true`, `controls=false`, lengths 357 / 368 / 406 / 451.
Newness at the baseline (blob read, not worktree):

```
$ for pat in 'Live delivery: HTTP status' 'Lab performance runs: Lighthouse' \
             'Agent-facing tool text (kotoba)' 'Authenticated consequential driving: tabi refuses'; do
    echo "[$pat] baseline_count=$(git show 15dfacc:SKILL.md | grep -c -- "$pat")"; done
[Live delivery: HTTP status] baseline_count=0
[Lab performance runs: Lighthouse] baseline_count=0
[Agent-facing tool text (kotoba)] baseline_count=0
[Authenticated consequential driving: tabi refuses] baseline_count=0        exit 0
```

Section shape: `SKILL.md:2917` is the required `## Round 34 — sibling-overlap declarations (outside
PROVINCE)` heading; `:2919` is the intro; `:2921-2924` are the only bullets; `:2926` starts the next
section. Each row's `tabi_ref` is the matching line (`adjacency.tsv` rows 15-18 → `SKILL.md:2921-2924`),
and each `tabi_quote` names its sibling (`kake`, `kake`, `kotoba`, `kasegi`).

### Per-line verdicts

**`:2921` Live delivery — holds.** Cited tabi ground opened: `SKILL.md:327` (fixture stop predicate plus
"Chain rules measured (note §4, §7): the wire carries every hop while the client surfaces only the final
one; `redirectCount` is a same-origin-only witness") and `SKILL.md:374` (recipe 4, network wire capture —
"wire truth (`responseReceivedExtraInfo` — raw status, status line, header bytes)"). Measured precedent
exists for both halves: `corpus/knowledge/network-evidence-rung.md:24` (header text bytes, status line per
hop) and `corpus/knowledge/external-class-fixture-v2.md:43,373` (E1 redirect chain 302 → 303 → 307 measured
across three layers, loopback). The sibling citation `kake SKILL.md:408` reads "route browser work to tabi,
publishing/account actions to the operator"; the declaration's "publishing or account action stay kake's and
the operator's" puts the kake half on a line that names only the operator, but kake's own province frames it
exactly that way (`kake PROVINCE.md:3` domain "web properties & publishing"; `:18` "Publishing itself stays
operator-gated: kake prepares, verifies and hands off") — so the compressed split is accurate, not a
misattribution. Scope hedges are consistent with C1-C3 (`SKILL.md:724-726`): loopback or operator-authorized
only. No Refuses-list ground absorbed.

**`:2922` Lab performance runs — holds.** Cited line `kake SKILL.md:697` is the exact other half of the
split: "Only a lab score (Lighthouse, DevTools) | Use it to guide a fix; give no Core Web Vitals verdict
(S036). Running the tool is tabi's work." Kake's field-data authority is same-table prose
(`kake corpus/knowledge/field-performance-cwv.md:151-153`: "kake holds the thresholds and eligibility rules
as publisher-side knowledge. Running lab tools such as Lighthouse or DevTools is browser work and routes to
tabi"); `:139-140` forbids converting a lab score into a CWV verdict. The "no Lighthouse run is yet a
measured surface of this lane" denial is true: `grep -rn -i lighthouse` over the lane's tracked markdown
(non-`.ufo`) returns 3 hits — `corpus/knowledge/chrome-remote-debugging-profile-boundary.md:93` (Lighthouse
named as an official product), `corpus/README.md:799` (ledger index), and this declaration line itself —
no run, score, trace or artifact. Nit (not a defect): the disclaimer names only Lighthouse, while the claim
pairs "Lighthouse or DevTools"; no DevTools-frontend run exists either, so the wider reading is true but not
stated. No measured non-loopback performance surface is claimed.

**`:2923` Agent-facing tool text (kotoba) — DEFECT (low): false provenance for the kotoba half; the
"schemas" cession has no kotoba scope-surface basis.** The tabi half is well grounded: `PROVINCE.md:12-13`
("dynamic-page evidence patterns (what to capture so a claim about a page is re-verifiable)") and
`corpus/knowledge/webmcp-chromium-loopback-round-16.md:59-60` — I verified the round-16 receipt artifact
actually stores the verbatim payload (`.ufo/waves/round-16/probes/WebmcpProbeDeclarative.json`:
`{"name":"basic","description":"Basic field types","inputSchema":{"type":"object","properties":{...},
"required":["q","em"]},...}`), so "records … verbatim as page-declared, re-verifiable evidence" and "grades
no wording" are both measured claims (no lane rule grades tool text: grep over `corpus/knowledge` finds no
grading rule for tool wording). The defect is the sibling authority:

```
kotoba PROVINCE.md:13 @65a5c7a (and @refs/heads/master):
  - Agent-definition, always-on (AGENTS.md-class) and dispatch-prompt craft — corpus/knowledge/agent-defs-commands-and-round-prompts.md, ...
```

Kotoba's `PROVINCE.md` names no tool/schema surface: `grep -n -i 'tool|schema|agent-facing'` over the whole
pinned file returns lines 22, 32, 57, 67 — agent-definition files by client, spec skill-creation guides,
chousa's tools, kumitate's tooling — none of them tool `name`/`description`/`inputSchema` craft. The nearest
real kotoba ground is server-wide `instructions` (`PROVINCE.md:19`, `SKILL.md:68-77`) and one tool's
`description` (`SKILL.md:76`), not names or schemas. Worse, the surface the declaration cedes is the one
kotoba's own census declines:

```
kotoba corpus/knowledge/sibling-overlap-census-round49.md:171-176
  :171  - **tabi** (seat `RowTabi.md`): tabi's round-16 wave drafts state a split with kotoba ("kotoba owns the
  :173    at the pin) over tool names, descriptions and schemas as agent-facing text. It never reached tabi's scope
  :174    surfaces, so the row stays `none` under the rule's wave-report exclusion ...
  :175    above); a later round should ask tabi whether to land it. ...
kotoba PROVINCE.md:73
  | tabi | none | 856fa9e1... | tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13) ...;
    it states no split with kotoba on its scope surfaces. |
```

So the cited line (`PROVINCE.md:13`) says something else, and kotoba's recorded state for tabi is `none`
(the census even flags the split as living only in a wave draft). The declaration does land what kotoba
asked tabi to decide ("a later round should ask tabi whether to land it"), so landing it is not itself the
defect; the defect is that the tabi line presents the cession as kotoba's settled ground with a pointer that
does not carry it. Impact: a future tabi seat can cite `:2923` to refuse tool-name/schema wording work that
kotoba's own surfaces never claimed; and the pointer cannot be re-verified by the reader. Impacted axis: C1
provenance (map bytes/gate untouched). Smallest safe correction: replace `(kotoba PROVINCE.md:13)` with the
sibling line that actually names the surface — kotoba
`corpus/knowledge/sibling-overlap-census-round49.md:173` (or `:171-176`) — and, because `inputSchema` craft
is nowhere in kotoba's province, either narrow the sentence to "the wording of those `description`s" citing
kotoba `SKILL.md:76`, or keep the wider cession and file it as `contested-open` with an L0 line the L1
files. The map row 17 `ruling_quote` contains the parenthetical, so it must be updated with the same edit.

**`:2924` Authenticated consequential driving — holds.** `SKILL.md:727` (C4: "operator-approval-required —
lane execution refused; approval routes the act to the operator") and `:728` (C5 login-required) are the
cited gate rows and do route the act out of the province; `:662-663` is the A9 session-material rule
("never content-read; report shape only (kind, mode, size, mtime)"; gate label A9 at `:743`), so "session
stores stay shape-only (A9, `SKILL.md:662-663`)" is exact. The kasegi citation is real ground and put the
claim on the right side of the line: `kasegi corpus/knowledge/mission-control.md:119` is the `fleets/
claimer-mission.md` bullet — "operator-authenticated burnerchrome at CDP 9222 (attach by URL substring,
never steal his tab)", continued at `:120` "Submission queue with per-package field plan" — and kasegi's
own scope surface states the same ownership (`kasegi SKILL.md:267`: "Sibling L1s: `fleets/claimer-mission.md`
(CDP browser submissions, operator-authed)"). Nit: "bounty submissions" spans `:118-126`; `:119` alone
names the CDP attach/profile, not the word "bounty", so a reader re-deriving the claim from the pinned line
must read the paragraph. No absorption: the line cedes the submission act, keeps observation, and matches
`PROVINCE.md:17-19` ("Never performs consequential actions on external sites … observation and
operator-approved interaction only").

## What I attacked and did not find

- Absorbed ground on `PROVINCE.md`'s Refuses list (revenger/kaidoku forensics, kake publishing, kagi
  secrets): none of the four lines claims any of the three; `:2924` keeps only CDP observation and
  session-shape reporting.
- A claimed measured surface the lane never measured: none. `:2922` denies the Lighthouse run outright;
  `:2921`'s header/redirect claim is backed by loopback measurements only and is written with the
  loopback/operator-authorized restriction; no line claims a non-loopback property capture, and the lane
  holds none (C3 default-deny, `SKILL.md:726`).
- A missing or extra physical line: the section is `:2917` heading, `:2919` intro, four bullets, next
  heading at `:2926`; each bullet contains its row's two quotes on the same physical line.
- Duplicate declaration for the same boundary elsewhere in `SKILL.md`: no earlier line states the kake
  live-delivery, kake lab-run, kotoba tool-text or kasegi claimer split (`grep` for "live delivery",
  "field-data verdict", "claimer lane" finds only `:2922`/`:2924`).

## Deliverables

- This report: `.ufo/waves/round-34/w2/CritDeclarations.md`
- `.ufo/waves/round-34/w2/CritDeclarations/receipt-adjacency-gate.json` — gate output at `04f9623` (clean, 17/17)
- `.ufo/waves/round-34/w2/CritDeclarations/receipt-declaration-quotes.json` — per-row quote containment, single-line, control-char check
- `.ufo/waves/round-34/w2/CritDeclarations/receipt-citation-audit.json` — every cited line opened at its pinned commit (tabi `04f9623`, kake `0440485`, kotoba `65a5c7a`/tip, kasegi `9a10b02`), plus the kotoba counter-evidence and the kotoba-PROVINCE token grep

Tooling: no install/upgrade was needed (node v24 from the host used as-is). Scratch
`/fast/scratch/hyaku/tabi-r34/CritDeclarations` removed after copying the three receipts. No browser was
launched; no lane file, lane index, fleet file or sibling repo was written.
