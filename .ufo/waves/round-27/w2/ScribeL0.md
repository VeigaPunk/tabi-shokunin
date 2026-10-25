# ScribeL0 — L0-side report-only draft content (wave 2)

Seat: `TabiR27.ScribeL0` (scribe, wave 2, round 27; read-only reporter).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline lane tip `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; lane tip at drafting `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (`git -C <lane> rev-parse HEAD`).
Item: draft the L0-side report content — open questions this round needs routed, the Stale-lane line, and the tool-installs line (grep of every w1 + w2 report for `install`).
Write scope: this report only (`.ufo/waves/round-27/w2/ScribeL0.md`). No tracked file edited; no git/jj write; no builds/linters/formatters; no spawn; no peer messages.

---

## 1. Open questions this round needs routed

### (a) The 308 re-anchor decision — is a second RFC-row wanted later, or does S107's scope suffice?

What the record says:

- The admitted entry labels 308 method-preservation an inference and names a re-anchor target: committed HEAD `corpus/knowledge/redirect-and-retry-after-semantics.md` line 36: "**INFERENCE, not a located normative sentence**: the exact clause for 308 lives in RFC 7538, not in these bytes." The working-tree revision (`d5878a83…`, uncommitted at drafting) rewords it: "the status-specific clause remains an open re-anchor" and cites the §15.4 history note, lines 7260-7264 (`RevStagedProvenance.md#F220` c.3; `ScoutReverifyRfc.md#6B91` :104-108).
- No RFC 7538 row exists: `grep -c 6585 corpus/SOURCES.md` → 0 and no 7538 bytes are committed (`ScoutStagedGround.md#61DC` :389-393). The landed S107 row's scope ("Documented redirect semantics a journey driver may observe (301/302/303/307/308, method rewriting) and the `Retry-After` header; scope bound to the sections cited, not the whole spec", `corpus/SOURCES.md:121`) already cites §15.4.2/§15.4.3/§15.4.8/§15.4.9 — the same sections S142 proposed.
- Two wave-1 seats dispute whether 7538 can even carry the sentence: `CritAssimProcess.md#B300` D3 (low): RFC 9110 obsoletes RFC 7538 (line 28) and §B.7 says "Changes from RFC 7538 / **None**" (372-373), "so 7538 cannot carry a sentence" — "the fix removes it silently". `ScoutReverifyRfc.md#6B91` F8 (medium) reads the same bytes the other way: RFC 9110 folds RFC 7538 into itself (§1.4 lists 7538; §15.4.9 Note cites `[RFC7538]` §4), so the "clause lives in RFC 7538" pointer is "likely wrong".

Route (draft line):

> **Open (308 re-anchor):** the admitted entry keeps 308's method-preservation an explicit INFERENCE and names a re-anchor; no RFC 7538 row or bytes exist in the lane, and wave-1 disagrees on whether 7538 (obsoleted by 9110, §B.7 "None") can carry a status-specific MUST-NOT sentence at all. Decision needed: (1) is a second RFC-row for 7538 wanted later (would it add any citable ground beyond 9110's §15.4.9 + history note 7260-7264?), or (2) does S107's scope suffice, closing the "open re-anchor" wording in the entry's Unknowns block with the history-note basis?

### (b) Staged S142 'same-document' disposition — confirmation requested

What the record says:

- S142 (staged `SOURCES.append.md:47`) refused as a row: same RFC 9110 document as S107; URL byte-identical (`cmp s124.url s142.url`, `cmp s124.url lane_s107.url` → identical; `ScoutStagedGround.md#61DC` §3.1); lane-gate `duplicate_url` E04 fired on the byte-exact append (`node scripts/check-sources.mjs` fixture `m-s142/` → E04/E09/E11, exit 1); the merge control passes only with `supersedes S107` + bare `730d` + used-by at the admitted entry (`m-ctrl-s142-full/` → `file ok`, exit 0). Refusal and flip are recorded in `corpus/lessons/round-27.md` §Gate: "Flip: adopt S142 only if the S107 row narrows its scope so per-status classification is no longer covered."
- `RevStagedProvenance.md#F220` F12 (medium): "The S142 'merge into the existing row' is satisfied at source level, not content level" — S107's anchor covers S142's sections (§15.4.2/.3/.8/.9) but "S107's teaches cell carries none of S142's URI-assignment content ('301 and 308 assign a new permanent URI; 302 is temporary…'). That content survives only as an aside in the entry body … Worth knowing before anyone closes the S142 flip condition."
- `ScribeReport27.md#4DE4` :276-278 lists the refusal and flip on record; `ScribeScorecard27.md#E247` D12 leaves the S125/S142 refusal-reason reconciliation vs the frozen `claims.json` (which never names S125/S142) **open**.

Route (draft line):

> **Open (S142 same-document disposition):** staged S142's refusal-as-row is gate-confirmed (E04) and recorded with its flip (adopt only if S107 narrows scope). Wave-1 flags that the "merge into S107" is satisfied at source level, not content level — S107's teaches cell carries none of S142's URI-assignment content, which survives only as an entry-body aside. Confirmation requested before closing the flip: is the teaches cell a permissible summary (content carried by the admitted entry's body), or must the S107 teaches cell absorb S142's URI-assignment content for the disposition to be considered fully executed?

---

## 2. Stale-lane line (draft)

> **Stale-lane:** respawn-per-round driver; no other mission of this lane is open. Round-27 is the only active tabi mission: baseline `f185b4e7` → tip `bceb17d` (round-27 integration commit, `git -C <lane> log --oneline -6`); wave 1 delivered 31 seat reports under `.ufo/waves/round-27/w1/`, wave 2 is in flight (only `swarm-registry.json` present in `w2/` at drafting time). Round-27 records are append-only on round 26; the round-26 frozen claims were re-dispatched pre-data (claims[0..2] C1/C2/C3, `resumeNote`). Next round's resumption point is whatever the canonical judge records for these three claims.

---

## 3. Tool-installs line (draft)

Grep performed: pattern `install` (case-insensitive) over `.ufo/waves/round-27/w1/` and `.ufo/waves/round-27/w2/`; plus channel-verb sweep `npx|npm -g|uv tool|cargo install|pacman|sudo |pip install`. Result: **every w1 report that names installs records none; no w2 report exists yet** (w2 holds only `swarm-registry.json`).

Seats explicitly recording no installs / no upgrades (28 of 31 w1 reports matched `install`):

| Seat (report) | Recorded statement (location) |
|---|---|
| ConnRedirectSurface | "Zero packages or tools installed. All checks executed with existing read-only binaries (`grep`, `git`, `wc`, `sha256sum`, `jq`, `python3`)." (:242) |
| ConnSiblingOverlap | "no tools installed, PACMAN GUARD observed" (:7) |
| CritAssimProcess | "no tool installed or upgraded; no pacman" (:215) |
| CritC1Supersession | "Tooling: no installs, no upgrades. `node v24.21.0`, `git 2.56.0`." (:17) |
| CritC3Junk | "Nothing installed or upgraded (no pacman, no uv/npx/binary). Read-only git + node + python3 from the host." (:238) |
| ExecC1Attacks | "Tooling unchanged. `node v24.21.0`, `git 2.56.0`, `jq` already present; nothing installed or upgraded." (:256) |
| ExecC1Baseline | "Tooling: none installed or upgraded (node v24.21.0 pre-existing). No pacman invoked." (:221) |
| ExecC1Tip | "no installs or upgrades were needed, so none were made (no pacman; per the host-wide guard, none attempted)." (:358-359) |
| ExecC2Controls | "No tool installs, no upgrades, no pacman. Environment: node v24.21.0." (:6) |
| ExecC2Reopen | "none installed or upgraded; no package manager invoked (PACMAN GUARD respected)"; tools used already present: `git`, `curl`, `base64`, `sha256sum`, `awk`, `grep`, `cmp`, `od`, `wc`, `tr`, `sed`, `python3` (:307-309) |
| ExecCensusMirror | "No tool installs or upgrades were needed; pacman was not invoked." (:253-254) |
| ExecQualityGate | "No tool was installed or upgraded." (:6) |
| ExecReportContract | "No tool installs" (:7); "None. No installs needed, no external fetch needed, no tracked file touched." (:335) |
| ExecSelftestSweep | "No tool installed or updated; no `pacman` transaction attempted." (:203) |
| MutC1Gate | "Tooling installs: **none** (nothing needed; pacman untouched). Environment: node v24.21.0, git 2.56.0." (:7) |
| MutC2Gate | "no installs (node v24.21.0 preinstalled; pacman guard untouched)" (:4-5); "Tools installed/updated: none (node v24.21.0 already present; no pacman use)." (:133) |
| RevC1FrozenFit | "no tool installed (none needed)" (:5) |
| RevSourcesS107 | "No tools installed (none needed) — recorded per operator 2026-10-19 rule; pacman untouched per guard." (:112) |
| RevStagedProvenance | "No tool installs; no pacman call." (:12) |
| ScoutReverifyRfc | "Tools installed: none (no pacman/uv/npm/cargo transaction was needed; … pre-installed `curl`/`python3`/`git`)" (:7-9); "No tools were installed or upgraded for this pass." (:439) |
| ScoutStagedGround | "Tools: node v24.21.0, git 2.56.0, GNU Awk 5.4.1. No package installed this round." (:40) |
| ScribeLOG27 | "Tooling: no installs, no upgrades, no pacman, no builds, no linters, no gate runs by this seat." (:13-14) |
| ScribeLesson27 | "Tooling: none installed or upgraded (nothing needed; channel n/a). No pacman call." (:7) |
| ScribeQuality67 | "No tool was installed or upgraded; no channel was used." (:223) |
| ScribeReport27 | "No tool installs or upgrades this round (channel n/a, nothing needed)." (:64) |
| ScribeScorecard27 | "None installed, upgraded or removed. `node` was the host binary; the C1/C2 gates are the claims' own counters, run read-only against committed blobs." (:329-330) |
| SentScope | "Tooling installed or upgraded: **none** (pacman untouched per the host-wide guard)." (:407-408) |
| SimplifyGateCode | "No tool installed or upgraded (nothing needed; see §9)" (:9); "None installed or upgraded. Everything ran on the host `node` and `git` already in use … No pacman transaction attempted." (:384-387) |

Three w1 reports contain **no** `install`/tooling statement at all: `RevC2Gate.md`, `SimplifyEvidence.md`, `RevEntryC3.md` (sweep of the three files for `install` and `Tools|node |version|channel` → no install line; they report method/tools in prose: node fixtures, read-only git, read/grep).

Draft line:

> **Tools installed/updated:** none by L1 (no install recorded in any w1 report; w2 has no reports yet). Grep of `.ufo/waves/round-27/w1/*.md` + `w2/` for `install`/`npx|npm -g|uv tool|cargo install|pacman|sudo |pip install` finds zero installs: 28 of 31 w1 reports explicitly record "none"/no tool installed, no pacman (PACMAN GUARD respected), channel n/a, reason "nothing needed"; the remaining three (`RevC2Gate.md`, `SimplifyEvidence.md`, `RevEntryC3.md`) carry no install statement. Instruments used were all pre-existing host binaries: node v24.21.0, git 2.56.0, jq, GNU Awk 5.4.1, python3, curl, base64, sha256sum, awk, cmp, od, wc, tr, sed, grep. The only external fetch is the documented RFC 9110 GET (502941 B, sha256 `21c1cdce…`).

---

## 4. Evidence appendix (commands)

- `grep -i install /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/w1/ /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/w2/` → 28 of 31 w1 files matched, 0 w2 matches.
- `grep -iE 'npx|npm -g|uv tool|cargo install|pacman|sudo |pip install' …/round-27/{w1,w2}/` → only PACMAN-GUARD/respect statements, no transaction.
- `grep -iE 'Tools|node |version|channel' …/w1/{RevC2Gate,SimplifyEvidence,RevEntryC3}.md` → no install/tooling line.
- `git -C <lane> rev-parse HEAD` → `bceb17dd82446a3b7514dd9759ec733673b4ba0d`; `git -C <lane> log --oneline -6 HEAD` → round-27 integration commit at tip; `git -C <lane> status --porcelain | wc -l` → 2 (uncommitted wave files at drafting).
- `glob …/round-27/w2/**` → `swarm-registry.json` only (no w2 reports at drafting).

## 5. Limits

- W2 was empty of reports at drafting time; the tool-installs enumeration is therefore w1-complete, w2-pending (re-run after w2 reports land).
- No claim verdicts are asserted here; this file only drafts report content. The 308/S142 lines record wave-1 findings and open decisions; they do not decide them.
