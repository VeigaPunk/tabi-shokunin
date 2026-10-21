# CriticSourceReuse — re-opening S096 on the same bytes (round 20, C1)

Seat: TabiR20.CriticSourceReuse (leaf critic, author-side, no dispatch). Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`. Source-only: no runtime, capability, or host claim. Only this file was written. Nothing committed. Tools installed or updated: none.

## 1. Verdict

- **Same bytes — holds.** `corpus/evidence/round-20/sources/html_form_element.cc`: 68,278 B, sha256 `8c8d6796…8c36916` (`sha256sum`, `stat`). Equal to `design.json:19` and `:128`, `SOURCES.md:110` (S096 decoded sha), the decoded round-19 `corpus/evidence/round-19/sources/html_form_element.cc.gz` (`zcat | sha256sum`; tracked blob `8e8134ee…`), and `.ufo/waves/round-20/source-opening.json` (`openedAt` 2026-10-21T09:52:32Z, `decodedBytes` 68278).
- **No new row for the reopen itself — holds.** Re-verifying S096's bytes changes only the `used-by` cell.
- **No new row — FAILS for LC11.** LC11 (`html_form_element.cc:787-815`) falls outside every S096 anchor range (`174-328,729-758,818-842`; gap 759–817). Under SOURCES contract v1 Rule 2 only `status`, `recheck`, `used-by` change in place, and a correction is a new row whose `teaches` opens `supersedes S0NN —`. The lane's own procedure says the same (`SKILL.md:2010-2011`). Today 11 of 12 decisions are pinned to S096; LC11 is not.
- **Smallest safe correction:** one correction row **S100** (next unused id; no `S1xx` row exists in `SOURCES.md`), same URL and sha, teaches opening `supersedes S096 —`, anchor cell extended to include `787-815`. All 12 decisions then cite S100 (L1 amends `design.json` `source.id`, `manifestShape.source.id`, and the `skillRendering` prefix). The only no-new-row alternative is dropping LC11 (C1 becomes 11); that needs explicit user approval.
- **Used-by audit — holds with corrections** (§4). **No diversity or expansion credit — holds** (§5). **Frontier does not saturate at 12** (§6).

## 2. Axes

A1 identity · A2 pin coverage (span inside the cited row's anchor set) · A3 registry contract and gates · A4 evidence commit · A5 credit honesty · A6 evidence class and quote discipline · A7 frontier residue.

## 3. Counterexamples

**C1 (A2, A3) LC11 unpinned.** `design.json` LC11 span `[787,815]`. Containment: not inside `174-328`, not inside `729-758`, not inside `818-842`. Pinned count today: 11/12. Reproduced independently by ScribeGate F2, ScribeFrontier F1, ScoutSourcesCensus §5, ReviewPromotion F7. In-place anchor edits proposed by ConnEvidence (Proposed Move 1), ConnPlanner (items 2–3), ConnSibling §4.1, ScribeGate F2, and ScribeFrontier F1 violate Rule 2 and `SKILL.md:2010-2011`. **Reject them.** The same applies to ConnEvidence's in-place note on `SOURCES.md:92` (S078, Proposed Move 2) and ScribeFrontier F2's "explicit superseded marker" on S078. A cell edit violates Rule 2, and `status` accepts only `queued|mined|rejected` (`check-sources.mjs:28`, enforced at `:320`), so a superseded marker has no legal status value. The registry convention is the successor's `supersedes` prefix (S069→S010 precedent), and S096 already carries it.

**C2 (A2, A3) Two authorities for one span.** ScribeLifecycle keeps LC11 at `S096:787-815` in the manifest and table while citing S100 in prose as "same-file authority". Resolve with a single row: cite S100 for all 12 (precedent: S077 supersedes S071, and SKILL DV rows cite S077 — `SOURCES.md:91`, `SKILL.md:2159-2178`), or drop LC11. Mixed per-decision sources would need a manifest schema change.

**C3 (A4) Evidence root uncommitted.** `git --no-optional-locks status --porcelain=v1 -uall` shows `??` for `corpus/evidence/round-20/sources/html_form_element.cc` and `.ufo/waves/round-20/source-opening.json`. QUALITY 28 forbids an untracked sole root. Committed fallback for the same decoded bytes: `corpus/evidence/round-19/sources/html_form_element.cc.gz`.

**C4 (A1, A6) Receipt partial, and a stale provenance claim.** `source-opening.json` records URL, `openedAt`, retrieval method, decoded sha, and bytes. It lacks argv or producer digest, HTTP status, and raw base64-body sha256 (QUALITY 26 and 30). Its scope string is correct: "no publisher authenticity proof beyond HTTPS". ScribeGate's draft says "no network fetch" and "Accessdate (re-open)", which the receipt contradicts; it must cite the receipt, not claim no fetch. If the receipt is amended after creation, record it as a new run label (QUALITY 36).

**C5 (A5) Carry-forward presented as depth.** `.ufo/waves/round-19/w1/SrcHtmlFormTool.md` already reads every span the LC rows use: `:16` (174–198 → LC01/02), `:17` (200–220 → LC04/05), `:18` (224–229 → LC06; grep-verified), `:19` (232–259 → LC03), `:21` (261–275 → LC07), `:22` (290–328 → LC08–10), `:26` (761–815 → LC11), `:27` (818–842 → LC12). The admitted round-19 knowledge note holds none of LC02/03/06/07/11 (grep: no `CancelTool`, cancel, or `respondWith` hits; its S096 refs are `:129-131` only). "Before = 0" is true for admitted notes only. The note and lesson must label these rows as carried from round-19 scouting.

**C6 (A6) Wording trap.** `SrcHtmlFormTool.md:27` says `form.submit()` "resolves an active tool with an empty string (834-842)". The source is `base::ok(String())` — a null String — at `:841`. That is the superseded S078 "empty string" premise. Do not import the scout sentence; cite the source line.

**C7 (A6) Quotes are not literal in two candidates.** LC11's natural quote crosses C++ string-literal joins (`:809-813`). ScribeGate's LC12 quote (`:827-828`) elides `//` across two comment lines. Neither is literal under the design's rule. Single-line options: LC11 `The site has a programming error: it called` (`:810`, 8 words); LC12 `Return a null string to indicate that a navigation has been` (`:827`, 11 words).

**C8 (A6) Outcome overclaims.**
- LC02/LC03: `invocation_id_ = invocation_id;` runs at `:178`, before the error return, and is not cleared on that path (`CallDoneCallback` returns early at `:263-265`). Say "running state not set", never "no state change".
- LC06–LC08: the CHECK lines (`:225`, `:794`, `:826`, `:840`) are source invariants, not runtime behavior.
- LC12: `String()` is the source-level callback value. The CDP wire shape belongs to S097 (`inspector_web_mcp_agent.cc:47-64,208-243`) and is untested.

## 4. Used-by audit (exact)

- **S096** (`SOURCES.md:110`, last cell): `corpus/knowledge/webmcp-declarative-validation-round-19.md` → `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Append only if the new note cites the token `S096`, which it will as predecessor.
- **S100** (new): `used-by` = `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
- **S078** (`SOURCES.md:92`): unchanged.
- Sequence: create the note first. Otherwise `check-sources.mjs:334-340` reports a missing path, and `:231-232` requires the literal row id in the file, else `used_by_uncited`. Only then edit `used-by`. Separator is `,` or `;` (`:329`). `mined` requires a non-empty `used-by` (`:331`).
- Log old→new in `corpus/lessons/round-20.md` (Rule 2 requires the round lesson, not just the registry).
- Unlisted S096 consumers — audit disposition only, no edit under the note-only convention (S077 precedent: `SOURCES.md:91`): `SKILL.md:2160, 2165, 2172, 2174, 2176` (DV rows); `corpus/README.md:424`; `corpus/lessons/round-19.md:131, 137, 175` (protected, `check-round-contract.mjs:169`); `corpus/evidence/round-19/validation/decisions.json` (row S096 ×5).
- Log line text for the reopen: "S096 re-verified against retained bytes, decoded sha256 8c8d…, 68,278 B, live retrieval `source-opening.json`; no S096 row change except `used-by`; LC11 pinned via S100."

## 5. Credit ledger

- **Diversity: 0 new source identities.** S096, S078, S100 share URL and sha. The round-19 census flags S096 as duplicate across scopes (`.ufo/waves/round-19/final/census-after.json:12`). The gate accepts the duplicate only because `teaches` opens `supersedes S…` (`check-sources.mjs:296-297`). S100 adds one W04 warning (rows 99 → 100). State it in the log.
- **Expansion: 0** (SOURCES Rule 4: expansion counts admitted knowledge on uncovered ground; no row quota).
- **Depth: 12 admitted decisions**, of which LC02, LC06, LC07, LC11, LC12 are at least partly carried from round-19 scouts (C5). Label carry-forward in the note and the lesson.
- **Note count +1** if the note lands. ScribeFrontier measured 37 notes on disk (not re-derived here). That is an artifact count, not source credit. Re-derive at integration (QUALITY 43).

## 6. Frontier duties (exact)

- **FD1** — Create S100 per §7 after the round-20 lesson Gate entry exists.
- **FD2** — L1 amends `design.json` `source.id` (`:16`), `manifestShape.source.id` (`:125`), and the `skillRendering` prefix (`:133`) from `S096` to `S100`. The ExecCounter spec (`.ufo/waves/round-20/w1/spec.json:9`) names "source registry S096" and needs the same update. Alternatively drop LC11 with user approval. Do not leave the manifest at S096 while LC11 cites S100.
- **FD3** — Commit `corpus/evidence/round-20/sources/html_form_element.cc` and `.ufo/waves/round-20/source-opening.json` in the integration commit (QUALITY 28). Amend the receipt per C4 before commit.
- **FD4** — Apply §4 `used-by` changes after the note exists. S100 becomes `mined` only then.
- **FD5** — Quotes: one physical line each, ≤25 words. LC11 → `:810`; LC12 → `:827`. The counter must reject join-crossing and comment-crossing quotes, with negative controls (QUALITY 25, 27).
- **FD6** — Outcome wording per C8 for LC02, LC03, LC06–LC08, LC12.
- **FD7** — Residual completion sites not among the 12. Name them as open; claim none:
  - `:841` in `submitFromJavaScript()` (`:834-843`): `CallDoneCallback(base::ok(String()))`. Inside registered 818-842 but outside LC12's 818-830. Either narrow LC12's condition to the `should_submit` path or add a row. Currently unpinned.
  - Form-reset cancel near `:1101-1105` (`kToolCancelled`, "cancelled by a form reset"). Outside every registered anchor. Per `SrcHtmlFormTool.md:28` and `ScribeChecklist.md:25`; not re-read here.
  - Registration and tool-update cancel near `:391-394` and `:449-451`. Outside registered anchors. Per ScribeLifecycle; not re-read here.
  - `PrepareForSubmission` guards `:635-680`. Outside registered anchors; no tool completion.
- **FD8** — Runtime frontier stays open. LC01, LC03, LC04, LC06, and LC08–LC11 have no runtime case in rounds 17–19 (sibling-reported; fixtures use `toolautosubmit`). Declarative navigation completion is a separate control (`webmcp-invocation-round-17.md:95`). Round 17 holds only `respondWith` success (`:55`) and autosubmit navigation (`:63`, per ScribeFrontier). No row closes any frontier item.
- **FD9** — Gate and labels. The note needs a README row with snapshot date and gap in the same commit (QUALITY 11). The SKILL section is appended at EOF (SKILL.md is 2197 lines), so no cited line drifts. `corpus/lessons/round-20.md` must exist before admission (QUALITY 10). Do not touch `corpus/lessons/round-19.md`.
- **FD10** — Main runs once after integration: `node scripts/check-sources.mjs` (expect 100 rows; S100 passes E04 via `supersedes S096`; E11 path exists and cites the token), `node .ufo/waves/round-20/measure-c1.mjs` (12 evaluated, plus negative controls for C1, C4, C7), and the protected-bytes check in `scripts/check-round-contract.mjs`.

## 7. S100 specification (for L1)

- id `S100`; source `Chromium 154 form submit lifecycle — anchor-complete correction of S096 — <S096 URL>`; kind `code`; tier `A`.
- scope `Build-scoped declarative form tool completion lifecycle; source-level only`.
- anchor `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,729-758,787-815,818-842; decoded sha256 8c8d6796…6916`.
- teaches `supersedes S096 — same bytes; anchor set adds 787-815 (LC11 preventDefault without respondWith branch); no source diversity`.
- status `mined`; opened `2026-10-21`; recheck `on-release`; used-by `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
- Gate (round-20 lesson): URL; access `2026-10-21` (`source-opening.json:3`); quote `The site has a programming error: it called` at `html_form_element.cc:810`.
- No `|` inside any cell.

## 8. Untested / not exercised

- Not run: `check-sources.mjs`, `measure-c1.mjs` (absent), any test or build. These are main's job after integration.
- Not re-fetched: the live URL. I verified the retained body and the receipt's internal fields only.
- Not present in the production tree at my read: `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Quote-literal and used-by-cites checks are therefore untested.
- Sibling-reported and not re-read by me: ScribeFrontier's fixture claim (all declarative runtime forms carry `toolautosubmit`), ConnEvidence's "9 of 12 zero receipts", the 15 W04 warning list, and the line numbers for registration and reset cancels.

Report: .ufo/waves/round-20/w1/CriticSourceReuse.md
