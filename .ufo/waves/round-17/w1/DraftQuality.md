VERDICT: PASS

Scope: draft QUALITY criteria 26–29 (append-only, numbered, lesson-cited like 22–25, each with a falsifier sentence), extended to 30–32 after the peer cross-check in `.ufo/waves/round-17/w1/ConnQualityRouted.md`. Draft only; `corpus/QUALITY.md` untouched (L1 owns it). Lane `tabi-shokunin`, HEAD detached at `5859243` (`git symbolic-ref -q HEAD` → rc 1; `refs/heads/master` = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`).

## Draft
`.ufo/waves/round-17/drafts/quality.md` — criteria 26–32 (to append after `corpus/QUALITY.md:101`) and a Basis section with a pointer for every factual claim.

| # | Criterion (short) | Routed source | Falsifier (short) |
|---|---|---|---|
| 26 | run claim needs a receipt committed at the cited revision, or "holds by drift diff" over every counted input + counter | spot-check `:50-61`, `:150`; fleet `.ufo/reports/round-16/tabi.md:69` | drift diff omitting the counter passes; `committed` hash instead of `pushed` passes |
| 27 | probe strength = finite named shape set; "unforgeable" not admitted; unlisted shapes = untested | spot-check `:76`; `round-16.md:88`; `w2/AttackQuality22.md:92-111` | listed shape not red under its probe; silent pass left off the list |
| 28 | pointers resolve as committed bytes at their revision in a fresh clone; no `/tmp`/untracked-only roots | spot-check `:148`; `c1-liar-probes.json:3`; `corpus/README.md` `/tmp` rows | host-only pointer passes a working-tree check |
| 29 | gates certify the lane branch tip (40-hex printed), never HEAD; **carve-out for frozen `check-freshness.mjs`** | `JjAuditTabi.md` F1–F3, F6 (fleet) | non-exempt gate still reading HEAD passes on a commit on no branch |
| 30 | receipt's producer digest must equal the registered blob; earlier-hardening receipts labelled history | spot-check `:149`; `selftest.json:3-4`, `legacy-r15.json:3-4` | **falsified at baseline** (`5150611c…` recorded; `1f84fb54…` registered) |
| 31 | supersession of a pinned-note row names the frozen path and line, not only "census U3" | spot-check `:151`; `corpus/README.md:297` | README `:297` names "(census U3)" only |
| 32 | contested sibling scope dispositioned in a committed map row quoting both sides at 40-hex | spot-check `:152`, ruling `:138-142` | `ruled` row with `-` ruling_ref verifies unless C3 checker goes red |

## Corrections accepted from the cross-check
1. **29 was unsatisfiable as drafted.** `scripts/check-freshness.mjs` is `protectedPath` in both contract gates (`scripts/check-round-contract.mjs:101`, `scripts/check-user-round-contract.mjs:151`, also :80, :269) and accepts `--witness HEAD` (`scripts/check-freshness.mjs:49`; JjAudit F6 `JjAuditTabi.md:184-191`). The draft now carries the exemption sentence and records the literal acceptance as a why-not.
2. **"unforgeable" source.** Confirmed unlocated: `git grep -in unforgeable 5859243` → only spot-check `:76`. Fleet `.ufo/reports/round-16/tabi.md` has no "forge" hit. `.ufo/waves/round-16/` hits are unrelated ("forged" in `measure.mjs:290`, `w1/RevC1Count.md:29,51`). So `.ufo/waves/round-17/PLAN.md:169` ("the r16 report word") is a misattribution, recorded in the draft Basis.

## Routed-item coverage (r16 spot-check `:146-157`)
- Item 1 (`:148`) → 28. Item 2 (`:149`) → 30 (**gap, now drafted**). Item 3 (`:150`) → 26 (with existing 22). Item 4 (`:151`) → 31 (**gap, now drafted**). Item 5 (`:152`) → 32 (**gap, now drafted**). Item 6 (`:153`) and item 7 (`:154-157`) are not turned into criteria (operator/inherited debt, already disclosed; the peer's refusal stands).
- `:76` → 27.

## Verified facts behind the new criteria
- `corpus/evidence/round-16/binding/selftest.json:3-4` and `legacy-r15.json:3-4` record `gateSha256 5150611c…` / `selftestSha256 8c5426f2…`.
- `git show 5859243:scripts/check-measurement-binding.mjs | sha256sum` → `1f84fb545f76ad77…`.
- `corpus/README.md:297` "(census U3)"; `:293` index row; `corpus/knowledge/browser-surface-census.md:188` is the U3 line.
- Ruling `corpus/lessons/round-16-verifier-spotcheck.md:138-142`.

## Other findings (observed)
- **Worktree is not clean.** `git status --porcelain`: `M scripts/check-measurement-binding.mjs`, `scripts/check-round-contract.mjs`, `scripts/check-user-round-contract.mjs`, `scripts/selftest-measurement-binding.mjs`; `?? scripts/check-adjacency.mjs`, `.ufo/waves/round-17/`, `corpus/evidence/round-17/`. These are sibling in-flight edits. The worktree gate sha (`15af0111…`) differs from HEAD (`1f84fb54…`). Any gate or counter run against the working tree sees uncommitted bytes; this supports criterion 29 and 28.
- **Unrooted pointer confirmed.** `corpus/evidence/round-16/measure/c1-liar-probes.json:3` → `/tmp/tabi-r16-c1liar-93NO/repo`; `git cat-file -t 9ecfcc9`, `0754e44`, `7b497d1` → "Not a valid object name".
- **`/tmp` pointers in README:** 12 matches (:16, :18, :19, :20, :145, :148, :149, :151, :153, :154, :155, :184). `/tmp/w8-tabi-b81`, `/tmp/tabi-r2-1-capture`, `/tmp/tabi-r4-2-async` absent on this host. Existing rows are labelled history; not rewritten.
- **Pushed vs committed:** `JjTrialTabi.md:121`, `:153`.
- **Fleet-root paths.** `.ufo/reports/round-16/tabi.md` and `.ufo/waves/hyaku/jj-w1/reports/*` resolve only from the fleet root, not inside the lane. Criterion 28 requires `<repo>@<hex>:<path>` for them; the draft Basis labels them.

## Not drafted (for L1 to decide)
- Push-state clause for 29 (tip = `origin/master`, or report states `ahead=N`). F2 (`JjAuditTabi.md:69-93`) shows a clean porcelain status over an unpushed tip.
- Peer's concern on calibration dilution (seven criteria in one append). L1 may land 30–32 separately if it judges the append too large; 30 is the one falsified at baseline.
- Adding `round-17.md#mistakes` rows for routed 2, 4, 5 (the peer noted none exists); the draft cites the spot-check directly, as QUALITY 12/16 do.

## Out of scope / not run
- No gate, selftest, counter, browser or `jj` command was run. Checks were read-only (`git symbolic-ref|rev-parse|ls-files|ls-tree|cat-file|status|check-ignore|log|grep|show`, `grep -n`, `sha256sum`, `sed -n`).
- Line anchors come from `grep -n`, `git grep -n` at `5859243`, or numbered reads.
- Not replied to the peer by IRC; this report and the final message carry the response.

## Tools
None installed or updated. No pacman, no uv, no npm.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/drafts/quality.md` (owned; rewritten: 26–32 + Basis)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/DraftQuality.md` (this report, rewritten)
