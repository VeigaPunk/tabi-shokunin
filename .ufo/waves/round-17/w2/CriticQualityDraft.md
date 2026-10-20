VERDICT: BREAKS
Attacked: draft QUALITY 26–32 (`.ufo/waves/round-17/drafts/quality.md:7-19` @ M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`). Checks: lesson backing, a falsifier that can actually fail, no restatement of 1–25, satisfiable on frozen surfaces, consistent with the gates/map landed at M. Sandbox `/tmp/tabi-r17w2-CriticQualityDraft-1Br2` (clone at M, plumbing commits only), now removed. Lane not written apart from this report.
Lesson backing holds for all 7: spot-check `:150` (26), `:76` (27), `:148` (28), `:149` (30), `:151` (31), `:152` (32). 29 is backed by fleet JjAuditTabi. The spot-check was added at `5859243` (`git log --diff-filter=A`), so row 2's ruling pin is the revision that produced the ruling.
Result: 29 and 32 contradict M as worded. 26 and 28 contradict the draft's own text or the landed receipts. 30 and 31 hold but need re-tensed falsifiers. 27 holds but has a clause that can never fail.

## 29 — BREAKS (four contradictions with M)
E29a. "never git HEAD" is false at M for an explicit `--at HEAD`. Sandbox: HEAD detached at off-branch P=`1aa3f99…`, master=M. `check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at HEAD --json` → `"at":"1aa3f99fca5b…"`. The same run without `--at` → `"at":"6c97851…"`. Cause: `resolveCommit` (`scripts/check-measurement-binding.mjs:245-255`, used at `:941`) accepts any token. `check-adjacency.mjs:447-454` (selftest `at-head-refused` `:1535`) and `measure-c3.mjs:198` refuse HEAD-relative tokens. The user/round `--witness`/`--count-witness` paths refuse only by accident (format regex at `check-round-contract.mjs:290`; usage error observed for user `--witness HEAD`). QUALITY 22 (`corpus/QUALITY.md:79-80`) still says `--at <delivered HEAD>`.
E29b. The anchor recipe is weaker than the landed gates. Draft: "`symbolic-ref -q HEAD` … `rev-parse --verify <ref>^{commit}`". All 4 gates use `symbolic-ref -q --no-recurse HEAD` (`check-round-contract.mjs:123`, `check-user-round-contract.mjs:175`, `check-measurement-binding.mjs:268`, `check-adjacency.mjs:411`), plus strict status classes, `check-ref-format`, and refusal when the anchor ref is itself a symref. `measure-c3.mjs:211-228` implements the draft's weaker recipe literally. Counterexample (sandbox): HEAD detached at M, `.git/refs/heads/master` = `ref: refs/remotes/o/evil` → `22f92d2…` (unlanded). `measure-c3.mjs` with no REV measured `"revision":"22f92d240bf9…"`. Both gates refused the same state: binding `revision_unresolved … is a symbolic ref to refs/remotes/o/evil`; adjacency `lane_tip_unresolved`. So the draft's wording admits the exact SentinelAnchor F5 shape. The C3 count is safe only because REV is passed explicitly.
E29c. "prints that 40-hex in every … `measuredRevision=` field" contradicts M:
- the user gate prints `measuredRevision=uncommitted` when the worktree blob ≠ the tip blob (`check-user-round-contract.mjs:886-887`, `:1020`, `:1158`; C1 v2 accepts this, `w1/C1Counter.md:25`);
- the binding manifest's `measuredRevision` is the claim's datum, not the anchor (`check-measurement-binding.mjs:43-45`, `:572`).
E29d. "never git HEAD" also reads on the fixture HEAD reads that PLAN `:77-78` keeps on purpose: `check-round-contract.mjs:689`, `:1176`; `check-adjacency.mjs:1173`; `measure-c3.mjs:757`. The draft has no fixture exemption.
E29e. The carve-out is not satisfied at M. "the registry invocation passes an explicit 40-hex ref" is unlanded: `git show M:SKILL.md | sed -n 1559p` still reads `--witness REV`, and the rule exists only in `drafts/skill.md:22,73`. The draft falsifier cites `FRESHNESS_GATE … revision=HEAD`, which is the exempt gate's output, so it cannot falsify 29.
Repair — replace 29 with:
> 29. A gate or counter that certifies this lane anchors on the lane branch tip, never on git `HEAD`.
> - It reads `git symbolic-ref -q --no-recurse HEAD`. Status 0 with exactly one `refs/heads/` line names that branch. Status 1 with empty stdout (detached) names `refs/heads/master`. Any other outcome is could-not-evaluate (exit 2).
> - The anchor must pass `check-ref-format`, must not itself be a symbolic ref, and must peel with `rev-parse --verify --end-of-options <ref>^{commit}` to one 40-hex. That value is resolved once per process and printed in every `code_revision=`/`codeRevision=` field.
> - A printed `measuredRevision=` is that 40-hex when the gate's committed bit is yes, and the literal `uncommitted` otherwise. A manifest `measuredRevision` is input data, not an anchor.
> - An explicit revision argument that is HEAD-relative (`HEAD`, `HEAD~N`, `@`, `HEAD^{…}`) is refused. Supersedes 22's "delivered HEAD" with "the delivered lane-tip 40-hex".
> - Exempt: fixture or self-test code that reads HEAD of a repository it just committed with HEAD attached.
> - Exempt: the byte-frozen `scripts/check-freshness.mjs` (`protectedPath`, `check-round-contract.mjs:175`, `check-user-round-contract.mjs:84`). Its literal `--witness HEAD` is a recorded why-not. The SKILL append (not row `:1559`, which stays) passes `"$(git rev-parse --verify refs/heads/master)"`.
> - Falsifier: detached HEAD at an off-branch commit whose tree differs is red on any non-exempt certifying path (JjAuditTabi F1–F3). So are:
>   - `refs/heads/master` written as `ref: refs/remotes/…`,
>   - `HEAD -> refs/heads/master@{1}`,
>   - `--at HEAD`.
>   Each must exit 2, not print a clean verdict.

Route a code repair (C1 scope, not frozen): `check-measurement-binding.mjs` `resolveCommit` refuses HEAD-relative tokens, plus one selftest case. `measure-c3.mjs` `laneTip` takes the gates' `--no-recurse`/symref refusal. Until both land, 29 is red at M on E29a/E29b.

## 32 — BREAKS (the satisfiability example fails the landed checker; one clause is unenforced)
E32a. The draft example `ruling_ref = tabi-shokunin@5859243:…spotcheck.md:138`, re-checked at M with `check-adjacency.mjs --at <variant> --fleet <fleet>` on row 2 changed in a plumbing commit:
- short hex → exit 1 `ruling_ref_invalid … must be <repo>@<40-hex>:<path>:<line>`;
- full hex at `:138` (a heading) → exit 1 `ruling_quote_absent … does not name sibling=kaidoku`.
The landed row uses `…5859243183c4…:corpus/lessons/round-16-verifier-spotcheck.md:142` (`corpus/adjacency.tsv:2`). Unmodified M → `verdict clean rows 9 verified 9 selfRulings [2]`.
E32b. "a declared split or refusal quotes both sides stating the split" is not what the checker enforces. Its committed refinement is verbatim existence only (`check-adjacency.mjs:83-87`). Counterexample: row 5 (split-declared) rewritten to `tabi_ref corpus/README.md:9`, quote "A row is written when its file exists," → exit 0, verified 9/9. So the C3 checker cannot falsify the semantic clause.
E32c. The draft omits rules the gate does enforce:
- the ruling venue must be fleet or a non-tabi-authored spot-check line whose quote names the sibling (`:73-78`, `:88-95`). A tabi-authored self-ruling satisfies the draft text but not the gate;
- `tabi_ref` must be `<path>:<line>` and may not point under `.ufo/`;
- quotes must be 4–25 words and ≥20 non-space characters;
- the pin must be reachable from the sibling's master→main ladder.
Its falsifier ("ruled with `-` …") holds: observed `ruling_ref_invalid "ruled requires a ruling_ref, not '-'"`.
Repair — replace the tail of 32 after "is not a disposition." with:
> Each row quotes both sides verbatim at `<path>:<line>` (sibling at `<lane>-shokunin@<40-hex>`, reachable from that lane's master→main tip; tabi in-lane, never `.ufo/`).
> - A `ruled` venue is the fleet repo or an integrator spot-check line not authored by this lane, and its quote names the sibling.
> - `contested-open` cites `fleet@<40-hex>:.ufo/l0-questions.md:<line>` of a `tabi |` row naming the sibling.
> - Whether a split/refusal quote states the split is human-verified: the checker proves verbatim existence only.
> - Falsifier: `scripts/check-adjacency.mjs` exits 1 on each of: a `ruled` row with `-`; a non-40-hex pin; a ruling line whose quote omits the sibling; a pin unreachable from the sibling tip.
> - Satisfied at M by `corpus/adjacency.tsv:2` (`ruling_ref tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142`, reported in `selfRulings`).

Mark the contested-open and split clauses `(contract: PLAN.md:137-146 + amendments :211-214)`: `:152` backs only the ruled case.

## 26 — BREAKS (no receipt can satisfy its own wording; it shadows 22)
E26a. "cites a receipt committed at the claimed revision" cannot be met: a receipt for a run at X can only land in a commit after X. The routed-3 repair itself fails it: `corpus/evidence/round-17/routed/binding-hardened/check-at-1205d26.json` records `at`/`cwdRev` `1205d261…` but was committed at M, not at `1205d26`.
E26b. The rule text says "committed", but its falsifier requires "pushed" (fleet JjTrialTabi `:121`). The two conflict.
E26c. The "holds by drift diff" branch would let a count claim pass without the `--reproduce` run that 22 requires (`QUALITY.md:79-81`): two authorities. The drift branch is the same test as `counted_input_changed` (`check-measurement-binding.mjs:67-68`).
E26d. "in a report" includes wave seat reports. These cite non-lane runs, e.g. `w1/C1Counter.md:99` `"rev":"7babdfd…"` (`git cat-file -t 7babdfd` → "Not a valid object name").
Repair:
> 26. A run claim (re-run, count, verdict, exit) in a lesson, LOG/SCORECARD cell, README row or the round report cites a receipt committed in the lane, at `<path>@<40-hex commit>`. The receipt records argv, the 40-hex revision it ran at, and the exit. That revision equals the claimed one and is reachable from the lane tip; a delivered claim also states pushed (`origin/master` contains it) or `ahead=N`.
> Or the claim says "holds by drift diff" and names the empty `git diff --name-only <receipt rev> <claimed rev> -- <counted inputs> <counter>`.
> Drift diff never discharges 22's `--reproduce` for a count.
> Falsifier: the cited receipt's revision ≠ the claimed one; a drift diff that omits the counter path or one counted input; a "pushed" claim whose commit is not in `origin/master`.
> Existing append-only cells are not rewritten.

## 28 — ISSUES→BREAKS (the draft fails its own rule; the grandfather clause is too narrow)
E28a. The draft's own rows violate 28:
- 26 cites "`.ufo/reports/round-16/tabi.md:69` in the fleet repo" and 29 cites "`.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` … fleet repo", both with no `<repo>@<40-hex>`. Both files are tracked in fleet: last touched `5830720cd3cd1f52816ac9bf1d86c152dd6e7707` and `7d0c7605b66b6e7fa2d998fc66534586d660bd26`; the line-69 and F1/F2/F3 headings (`:44`, `:69`, `:95`) verified at those commits;
- 30 and 32 use short `5859243`.
E28b. The grandfather clause names "rows" only. Sha-pinned notes and protected lessons carry `/tmp/` text at M, e.g. `browser-surface-census.md` 15, `cdp-evidence-patterns.md` 21, `hygiene-sweep-r4.md` 22, `round-16-verifier-spotcheck.md` 3 (`git grep -c /tmp/ M -- corpus/knowledge corpus/lessons`).
E28c. `/tmp` inside receipt data or a reproduction command is not a pointer:
- `binding-hardened/selftest.json` `"cwd":"/tmp/tabi-r17-RoutedHardened-5ubB/s3254740"`;
- `corpus/knowledge/webmcp-invocation-round-17.md:122` `--out /tmp/webmcp-invoke-recheck.json`.
The draft would flag both.
E28d. "its cited revision" is undefined for revisionless lane pointers, which is most of the corpus.
Repair: append to 28:
> A revisionless lane pointer resolves at the commit that adds it. Fleet/sibling objects are written `fleet@<40-hex>:<path>[:<line>]`.
> `/tmp` text inside a recorded receipt field or a reproduction command is data, not a pointer.
> Bytes that exist at the baseline of the round admitting 28 (pinned notes, protected lessons, frozen evidence, README rows) are not rewritten.

Then rewrite 26/29/30/32's citations as `fleet@5830720cd3cd1f52816ac9bf1d86c152dd6e7707:.ufo/reports/round-16/tabi.md:69`, `fleet@7d0c7605b66b6e7fa2d998fc66534586d660bd26:.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:44-130`, and `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`.

## 30 — ISSUES (holds at M for its routed case; the key term is undefined; the falsifier is in baseline tense)
- Observed: `git show 3254740:scripts/check-measurement-binding.mjs | sha256sum` = `1f84fb545f76ad77…`, selftest `481eefaec846fa8a…`. These equal `gateSha256`/`selftestSha256` in all three `binding-hardened/*.json`. The r16 receipts are labelled history in the M README append ("Binding receipts history label"). The C2 receipt `producerSha256` = `de62820d…` = the harness blob at M.
- "the blob registered for the claim" has no named registry.
- At M the gate moved to `388c2b49…` and the selftest to `8324692c…`, and no committed JSON receipt carries those digests. They appear only in narratives (`w1/GateBindAnchor.md:101,104`, `w1/C1Counter.md:90`). So any r17 claim of "binding selftest green at M" is red under 30 until L1 commits such a receipt.
Repair: replace "the blob registered for the claim" with:
> the blob `git show <rev>:<producer path>` at the revision the receipt records (`cwdRev`/`at`), and for a count claim the blob at its `measuredRevision`.

Replace the falsifier with:
> any committed receipt whose recorded producer digest ≠ that blob's sha256. At M: `binding-hardened/*.json` and `webmcp-invoke/receipt.json` match; the round-16 `binding/selftest.json` and `legacy-r15.json` (`5150611c…`) do not, and are labelled history.

## 31 — HOLDS with an edit
Satisfied at M: `corpus/README.md:345` has the row `knowledge/browser-surface-census.md:188` (U3) → `:295-305`, `:307-314`. The census bytes are unchanged and pinned (`pins.tsv:7`, `a33c2264…`). The pointer runs README→census, so "a reader at the frozen surface can reach the correction" means "find by search". The README uses `knowledge/…`, not the draft's `corpus/knowledge/…`.
Edits:
- "Refines 24" → "Refines 4 and 24".
- Falsifier → `git grep -n 'browser-surface-census.md:188' <rev> -- corpus/README.md` must return a row naming the superseding lines, and those lines must state the answer. At B it returned only `:297` "(census U3)" with no path; at M it returns `:345`.

## 27 — HOLDS with an edit
- No restatement of 1–25 (25 covers counter probes; 27 covers descriptions).
- The clause "A shape not listed is stated as untested" plus falsifier half 2 can never fail: the set of unlisted shapes is unbounded. Replace both with one closing sentence ("shapes outside this list are untested") whose absence is the finding.
- State the scope as prose surfaces (lesson, note, README, SKILL, LOG, SCORECARD, report), not code comments. Otherwise `check-round-contract.mjs:113` ("a concurrent jj command cannot mix revisions") and `measure-c1.mjs:31` ("can never be normalized away") become findings.
- Drafts disagree on where the word came from: `drafts/log.md:44` and `PLAN.md:169` say "round-16 report"; the fleet report has no `forge` hit (grep at fleet HEAD `839d8df`, empty). L1 should use spot-check `:76` "author summary" throughout. That the summary was uncommitted is [INFERENCE].

## Impacted axes
QUALITY/calibration: 26, 28, 29 and 32 as drafted would admit rows that M's own gates, receipts or map contradict. C1 operability: E29a/E29b are live residual HEAD and symref holes, outside the 4 credited entries. C3: E32b, the semantic split clause is unchecked.

Tools: none installed or updated. No `jj`, no lane git writes. Fleet/sibling reads were read-only `git show`/`ls-files`/`log`.
Files written: .ufo/waves/round-17/w2/CriticQualityDraft.md
