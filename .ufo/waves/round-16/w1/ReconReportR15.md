# tabi round 16 — W1 recon: round-15 report shape and outside-closure flags

Seat: `TabiR16.ReconReportR15-5`. Read-only slice. No lane script, gate, selftest, counter or browser was run.
Tools installed/updated: **none**.

Sources read this session (opened, not inferred):

- `/home/vgpnk/Projects/shokunin/.ufo/reports/round-15/tabi.md` (88 lines) — headings and body.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-15-verifier-spotcheck.md` (126 lines).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-16/PLAN.md` (110 lines) for the routing of defects 1–2 and the C1/C2 counting commands.
- `/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-16.md:99-125` (report contract), `:10-60` (claims/census), `:194-195` (wave reporting).

Commands used, with observed output:

```sh
grep -n '^#' .ufo/reports/round-15/tabi.md
# 1:# tabi — round 15 (hyaku, attempt 1)
# 3:## Work performed   20:## Landed changes   37:## Before → after measurements
# 48:## Sources & frontier   77:## Trend verdicts   83:## SHONEN
wc -l .ufo/reports/round-15/tabi.md tabi-shokunin/corpus/lessons/round-15-verifier-spotcheck.md
#   88 .ufo/reports/round-15/tabi.md
#  126 tabi-shokunin/corpus/lessons/round-15-verifier-spotcheck.md
```

## 1. Section headings of the round-15 report (verbatim, with anchors)

| # | Heading | Line | Contract slot (round-16 prompt) |
|---|---|---|---|
| — | `# tabi — round 15 (hyaku, attempt 1)` | `.ufo/reports/round-15/tabi.md:1` | title, `<lane> — round <N> (<driver>, attempt <n>)` |
| 1 | `## Work performed` | `:3` | `:104` |
| 2 | `## Landed changes` | `:20` | `:107` |
| 3 | `## Before → after measurements` | `:37` | `:109` |
| 4 | `## Sources & frontier` | `:48` | `:111` |
| 5 | `## Trend verdicts` | `:77` | `:116` |
| 6 | `## SHONEN` | `:83` | `:118` |

Exactly six level-2 headings, no level-3 headings, and the order matches the required order in
`.ufo/prompts/tabi-round-16.md:104-119` one-for-one. The round-15 report is therefore conformant on
section set and order; the r15 defects are content defects, not missing sections.

Sub-structure that is not a heading but carries required content:

- Declared claims paragraph, `.ufo/reports/round-15/tabi.md:5` — "Declared **C1 operability** … Declared **C2 calibration** … Claims are causally separable; …".
- Pushed-HEAD line `:7` — `**Pushed lane HEAD:** `<40-hex>`. `git push` observed `<before>..<after> master -> master`; following `git status --porcelain` was empty.` ends "This report is written after that push."
- One evidence bullet per work item `:9-16`.
- Stale-lane paragraph `:18`, prefixed `**Stale-lane:**`.
- Boundaries paragraph after the commit table `:33-35` ("Boundaries are explicit, not silently certified: … not claimed as …").
- Per-axis author-verdict paragraph `:46` immediately after the measurement table.
- Open-L0 paragraph `:75` inside Sources & frontier.

## 2. Measurement table format (`## Before → after measurements`)

Anchor block, verbatim shape:

- `.ufo/reports/round-15/tabi.md:39` — preamble sentence:
  `Measured input baseline: `<before-40-hex>`; after: `<after-40-hex>`. Gate code is byte-identical to exercised<short-rev> at the after revision. Exact argv/stdout/stderr/exits and probe identities: `<receipt-path>`.`
- `:41-42` — header and separator, exactly three columns:
  ```markdown
  | Claim | Literal counting commands | Observed result / evidence |
  |---|---|---|
  ```
- `:43-44` — one row per claim. Column 2 holds the literal argv for both revisions, separated by
  `; same command with <after-rev>`; column 3 opens with the literal delta `**0→1**`, then exit code,
  sub-counts, the production gate result, and ends with receipt filenames plus the probe revision.
  C1 row: `:43`; C2 row: `:44`.
- `:46` — after the table: `Per-axis author verdicts: **… improved (C1), … improved (C2); depth, coverage, freshness and adjacency unchanged**. Six scalar deltas remain0. …`

Gap that the outside closure measured: the table gives command + after-revision but **no counter
digest and no counted-input declaration**, and its after-revision `b7cf044` is not the delivered
HEAD `36240c7` (see §4 defects 1–2). Round 16 must extend the row, e.g. five columns:
`Claim | Literal counting commands (argv) | Counter sha256 @ measuredRevision | measuredRevision == delivered HEAD | Before→after observed / evidence`.
The contract minimum is still "the counting command and the commit it was measured against"
(`.ufo/prompts/tabi-round-16.md:109-110`); the extra columns are what close r15 defects 1–2.

## 3. Wave / seat reporting lines

- `.ufo/reports/round-15/tabi.md:15` — one bullet carries both waves and the total. Shape, in order:
  `Wave1 validated/dispatched<N> seats in one unchanged taskCall: executor3/revenger5/scout11/reviewer18/critic9/sentinel4/scribe8/connector6. Completed<c>, provider-failed<f>; <estimate correction>. Wave2 validated/dispatched<N> distinct delivered-byte attacks: <role mix>; all<N> completed. **Round total<N>**,<c> completed/<f> failed, no replacement identities or per-task model parameters. L1 held canonical planner; <planner deviation>. Evidence: `.ufo/waves/round-15/{w1,w2}/{spec.json,validation.json,swarm-registry.json,dispatch-result.json}`, `policy-provenance.json`, `build-snapshot.json` and `verified-code-snapshot.json`.`
- `.ufo/reports/round-15/tabi.md:18` — `**Stale-lane:**` paragraph: sole-mission claim, both waves
  completed before wrap-up, no skipped wave, misroot sweep result with receipt, misplaced-report
  copy byte-exact with SHA-256, **"Tools installed/updated: none."**
- `.ufo/reports/round-15/tabi.md:22-31` — `## Landed changes`: sentence tying all changes to
  `LOG.md:828-961`, then `| Commit | Landed work / LOG linkage |` table, one row per round commit,
  each row naming the LOG content it carries.
- Round-16 requirement: `.ufo/prompts/tabi-round-16.md:194-195` — "Record each wave's seat count,
  role mix, dead seats, and the round total in the report." Wave 1 is this wave; wave 2 is mandatory
  when wave 1 yields ≥64 distinct attack items (`.ufo/prompts/tabi-round-16.md:185-190`), and the report must say so if it is not run.

## 4. What the outside closure flagged

File: `tabi-shokunin/corpus/lessons/round-15-verifier-spotcheck.md`. Status: non-author (hyaku closure,
`@m_opus`), `CLOSURE tabi r15 status=ok admitted=true` at `:7`; it did not author r15 (`:7-8`).

| # | Anchor | Flagged item (paraphrase, quoted fragments) | Round-16 routing |
|---|---|---|---|
| 1 | `:120` | **counter identity for C1** — `measurements.json` pins C1's counter "only as `counterCodeRevision 27dfd98` (`measure.mjs` sha256 `3ee59de0…`)"; HEAD's is `dd9c8675…`, so "re-running the cited C1 argv at HEAD runs a different counter". Asks: "Record the counter digest per claim, and say which counter revision reproduces each receipt." | Routed by PLAN C1: `counter.sha256`, `countedInputs`, `measuredRevision`, `before`/`after` in `corpus/evidence/round-16/measurement-binding.json` (`PLAN.md:11-14`, `:44-50`); gate reasons `counter_digest_mismatch`, `counter_changed_since_measurement`, `counter_failed`, `count_not_reproduced` (`PLAN.md:54-60`) |
| 2 | `:121` | **measured revision vs delivered HEAD** — "The report and SCORECARD measure at `b7cf044`, not the delivered `36240c7`"; the closure confirmed no drift between them; "Future rounds should measure at, or explicitly diff to, the delivered HEAD." | PLAN C1 `measuredRevision` + `counted_input_changed` via `git diff --name-only measuredRevision REV -- <countedInputs + counter.path>` (`PLAN.md:48`, `:57`); report must state the diff or measure at HEAD |
| 3 | `:122` | **adopt the erratum** — future SKILL/lesson text citing round-14 Node wording must point to the erratum section (`:90-101`), not the superseded lines | Applies to any round-16 SKILL/lesson text; do not restate the overbroad "producer never enforces pin.node" claim |
| 4 | `:123` | **protocol/operator** — "frozen step-1/step-4 closure-checker certification for current inputs is still absent; carried as debt" | Report must not claim that certification; keep it as debt |
| 5 | `:124` | **inherited debt** — "USER 6/10, r07 survivor replay, user-record freezing, IPv6 origin, Git env/hooks/config/PATH, external-validator pin" | Round-16 report must not silently drop these; list what is still open |

What the same closure will re-check on the round-16 report (its step-1 table, `:29-38`): real landed
report by lane identity; `HEAD = origin/master`, ahead count 0; clean `git status --porcelain`; commit
ordering and author/committer identity; **every word-bounded 7–40-hex commit string resolves and passes
`git merge-base --is-ancestor HASH HEAD`** (`:35`); SHONEN four `[~]` lines and **no `[x]`** (`:36`);
prompt fidelity (`:37`); history pin (`:38`). Independent-measurement pattern at `:44` (re-derive with
`git diff --name-status <measured> HEAD`); "No evidence timestamp postdates its shipping commit"
(`:71`); harm check = SCORECARD diff appends a section and no scalar is lowered (`:73-75`).

## 5. Round-16 report checklist (author-side; anchors)

### A. Mechanics and placement

- [ ] Report written at `/home/vgpnk/Projects/shokunin/.ufo/reports/round-16/tabi.md` on the fleet repo (`.ufo/prompts/tabi-round-16.md:101-102`); seat reports at `.ufo/waves/round-16/<wave>/<Name>.md` (`PLAN.md:98`). No fleet-root misroot under `.ufo/waves/round-16/*` (r15 pattern `tabi.md:18`).
- [ ] Lane commit `round-16` exists and is pushed **before** the report commit; report line states 40-hex lane HEAD, the observed push line, and an empty `git status --porcelain` (r15 `:7`).
- [ ] Every commit hash named in the report resolves and is an ancestor of the delivered HEAD (`round-15-verifier-spotcheck.md:35`). Prefer full 40-hex at first mention.
- [ ] Evidence bytes are committed no later than the commit that cites them (`round-15-verifier-spotcheck.md:71`).
- [ ] Report is labelled author-side; it does **not** claim non-author admission or closure certification (`round-15-verifier-spotcheck.md:123`).

### B. Section contract

- [ ] Six headings, exact text and order: `## Work performed`, `## Landed changes`, `## Before → after measurements`, `## Sources & frontier`, `## Trend verdicts`, `## SHONEN` (`tabi-round-16.md:104-118`; r15 anchors `:3,20,37,48,77,83`).
- [ ] `Work performed` opens by naming the 1–3 declared claims and their axes/capability, then one bullet per work item with an evidence pointer (`tabi-round-16.md:104-106`; r15 `:5,9-16`).
- [ ] `Landed changes`: every change tied to a `LOG.md` entry and the carrying commit hash (`:107-108`; r15 `:22-31`).
- [ ] `Before → after measurements`: one row per claim with counting command and measured commit (`:109-110`), plus the §C hardening below.
- [ ] `Sources & frontier`: rows before→after with the counting command, rows added by tier, rows touched old→new, frontier rows advanced (`:111-115`; r15 `:50-70`). C2 must enumerate the S020 and S002 re-open plus every new primary row opened this session with URL, access date `2026-10-20`, and ≤25-word located quote (`PLAN.md:94-96`).
- [ ] `Trend verdicts`: exactly `expansion`, `quality`, `discernment`, each `improved|harmed|unchanged|unprovable-but-better` with evidence, no scalar (`:116-117`; r15 `:79-81`).
- [ ] `SHONEN`: one line per box; `[x]` only with a named non-author verifier, `[~]` with a resolvable pointer (`:118-119`; r15 `:85-88` all `[~]`).
- [ ] Not a marker report: no placeholder text, no missing required section (`:121-125`).

### C. Measurement hardening — the two routed r15 defects

- [ ] Per claim, record counter path and **sha256 at `measuredRevision`**, the declared `countedInputs`, `measuredRevision`, and `before`/`after` counts (`PLAN.md:44-50`); the manifest lives at `corpus/evidence/round-16/measurement-binding.json`.
- [ ] `measuredRevision` equals the delivered HEAD, or the report pastes `git diff --name-status <measuredRevision> <HEAD>` proving no counted input or counter changed (`round-15-verifier-spotcheck.md:121`; `PLAN.md:57`).
- [ ] Report states which counter blob reproduces each receipt; if it differs from the cited one, say so explicitly (`round-15-verifier-spotcheck.md:120`).
- [ ] C1 command is the exact literal `node .ufo/waves/round-16/measure.mjs REV --claim C1` (`PLAN.md:14`), exit codes shown before and after; gate `--reproduce` evidence included (`PLAN.md:59-60`).
- [ ] C2 command is `node .ufo/waves/round-16/measure.mjs REV --claim C2` (`PLAN.md:29`); receipt is `corpus/evidence/round-16/webmcp/receipt.json` with schema `tabi-round16-webmcp-v1`, runtime pin, `producerSha256`, per-case `status`, summary counts (`PLAN.md:88-90`).
- [ ] Genuine failures stay in the record, not relabelled or deleted (r15 `:16`; closure `:62` "failure retained, not relabeled").
- [ ] Capability acquisition (C2) states the SCORECARD capabilities-table row added in the same round (`.ufo/prompts/tabi-round-16.md:24-26`), and `Sources & frontier` states the frontier row held/advanced.
- [ ] Census at start and end: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`, both exit codes and exact stdout pasted; exit 0 required at end (`tabi-round-16.md:54-58`; r15 `:61-70`).
- [ ] Histogram/counting commands pasted for source rows before→after (r15 `:52-59`).

### D. Wave and seat reporting

- [ ] Each wave reports: validated/dispatched seat count, exact role mix, completed and failed counts, dead-seat names, and the round total (`tabi-round-16.md:194-195`; r15 shape `:15`).
- [ ] Wave receipts named: `.ufo/waves/round-16/{w1,w2}/{spec.json,validation.json,swarm-registry.json,dispatch-result.json}` plus `policy-provenance.json`/build snapshot (r15 `:15`).
- [ ] If wave 2 is not run, the report says why against the ≥64-distinct-attacks rule (`.ufo/prompts/tabi-round-16.md:186-190`).
- [ ] Stale-lane paragraph: sole mission, waves completed before wrap-up, no skipped wave, misroot sweep with receipt (`tabi.md:18`).
- [ ] Tooling line: "Tools installed/updated: none" or tool, version, channel, reason (`tabi.md:18`; operator directive 2026-10-19).
- [ ] Boundaries paragraph names what is **not** certified (r15 `:33-35`), including the carried debt from closure `:123-124`.

### E. Re-verification surface the closure will apply (pre-empt it)

- [ ] `HEAD = origin/master`, ahead 0, clean tree at report time (`round-15-verifier-spotcheck.md:32-33`).
- [ ] Commit ordering: all round commits precede the report commit; author/committer is the lane identity (`:34`).
- [ ] Every hex commit string resolves and is an ancestor (`:35`).
- [ ] Prompt fidelity: report's opening matches the rendered `templates/round-prompt.md` + `.ufo/prompts/tabi-round-16.md` for the lane/round/axes/fleet root (`:37`).
- [ ] SCORECARD diff from baseline appends `## Round 16` and lowers no scalar (`:73-75`); trend verdicts separate `quality`/`discernment`/`expansion` from the six axis scalars (`:103-112`).
- [ ] The report does not present the r15 closure or this recon as round-16 verification.

## 6. Observed vs inferred

Observed in this session: line anchors and verbatim fragments in §1–§4 (commands above); file lengths;
heading order; table headers; the five routed defects and their line numbers; the PLAN routing and
manifest field names; the round-16 report contract bullets and line numbers.

Inferred (not verified here): that r15's six-section order is exactly what the round-16 driver checks —
the contract text is authoritative but the driver implementation was not opened; and that the proposed
five-column measurement row is sufficient to satisfy both routed defects — the PLAN's gate reasons imply
it, but the gate script does not exist yet in this slice. Remaining unknown: whether L1 adds any
host-specific section beyond the six (none is required by `tabi-round-16.md:103-119`).
