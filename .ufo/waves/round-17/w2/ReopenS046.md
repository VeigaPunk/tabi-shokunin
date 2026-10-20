VERDICT: HOLDS

Attacked: SOURCES row S046 at M=6c97851034e9d8f58b135d28ff969f1f28fa2f7d — pinned URL,
anchor revision and line claims, the wave-1 Gate quote and its limits, recorded sha256, and the
tier/scope/teaches/status/used-by cells. Gate entry under attack:
`.ufo/waves/round-17/sources/ExplainerExec.md:79-96` (the `w1/SrcExplainerExec.md` report points
at that dossier instead of repeating it; `corpus/lessons/round-17.md` does not exist at M, and
`git grep 'The browser mediates the call'` over `corpus/` at M returns 0 hits, so the dossier is
the only place the Gate entry lives at M).

Observed evidence (all fetched/fetched-at 2026-10-20, raw.githubusercontent.com at the pinned
commit; no installs, no pacman):

1. URL resolves. `https://github.com/webmachinelearning/webmcp/blob/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md`
   -> HTTP 200. The three sibling files named only in the anchor cell also resolve as blobs at
   the same commit (declarative-api-explainer.md, continuations-explainer.md,
   security-privacy-questionnaire.md -> 200 each).
2. Revision exists and is still the tip. GitHub commit API returns sha
   `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`, committer date `2026-10-20T14:57:14Z`
   (= 10:57:14-04:00, matching the dossier), subject
   `Discuss general agent ecosystem risks and link to agent security guidance (#334)`.
   `git ls-remote https://github.com/webmachinelearning/webmcp.git HEAD refs/heads/main` at
   reopen returns that same SHA for both, so the row is neither stale nor a dead commit.
3. sha256 recorded in the Gate entry all match the live bytes:
   - README.md 37575 B `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` OK
   - declarative-api-explainer.md 10417 B `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` OK
   - continuations-explainer.md 10512 B `009b04ae31ffdb0c3ca211572d49f3a6d68cf85f66e0be541bfb8a3ac9fe9de8` OK
   - security-privacy-questionnaire.md 9229 B `76e65774f109f3f0b8ce296dda8116cb919ed616ddb00cb46841b9b5f75141c0` OK
   (`sha256sum -c` on the fetched copies: four OK.)
4. Every line anchor exists, at the stated position (`awk NR==` / `sed -n`):
   - README.md:308 `### Lifecycle of a Tool Call`, 308-313 = heading + five steps 309-313.
   - README.md:352 `#### Discovering and running tools: getTools() and executeTool()`; 352-375
     includes the `executeTool` prose at 354/375 (section continues past 375, but the cited
     sentence is inside the range).
   - declarative-api-explainer.md §Events heading 155; 157 `**Additions to SubmitEvent**` through
     188 (end of the `toolcancel` paragraph), exactly as cited.
   - declarative-api-explainer.md:117 `### Getting the form response to the agent` .. 129
     (`However, this is technically TBD`).
   - continuations-explainer.md:15-20 = single-document/single-Promise plus the navigating bullet.
   - continuations-explainer.md:218 heading `# Document Lifecycle Considerations`; line 220 is
     `Tokens cannot be requested or redeemed on inactive documents or frames.` exactly.
   - security-privacy-questionnaire.md Q12 at 57-65 (question 57, `readOnlyHint` bullet 63);
     Q19 at 93-100 (question 93, abandoned-invocation bullets 95-100).
5. Gate quote is verbatim, <=25 words. Quote grounding `teaches`:
   `The browser mediates the call, invokes the tool's `execute` callback with the provided arguments`
   -> `grep -cF` = 1 on README.md, matched line 312 (section step 4); `wc -w` = 14.
   Limit quotes also verbatim: `This topic is currently under debate` (declarative:119),
   `a `readOnlyHint` may cause the agent to skip a confirmation step` (spq:63),
   `If a site executes a server request that navigates the document` (continuations:18) — each
   `grep -cF` = 1. Supporting quotes from the dossier table checked the same way (agent-requests
   args at README:311, returned results at :313, owner-execution-context at :375,
   outside-spec at :319, spq:100 intended-direction, continuations:220) — all = 1.
6. Tier/scope/teaches honest. `docs`/`A` is the same classification S030 and S031 already carry
   for this repository; `check-sources.mjs` only flags tier A for `kind=community`
   (scripts/check-sources.mjs:323), so there is no inflation finding. Scope says "editors'
   statement ... never spec text, Chromium behaviour or CDP command shape": the anchor points only
   at repo Markdown, the cited ranges exclude the Chromium-mention lines (declarative:193-195 is
   outside 157-188), and `grep -rn 'invokeTool|invocationId|toolInvoked|toolResponded' --include='*.md'`
   over the dossier's sweep is 0 hits, so no CDP shape is grounded here. `teaches` ("execute
   arguments and returned response, not a navigation response or user consent") is satisfied by
   README:311-313 (args in, results out), continuations:18-19 (navigation ends the call with no
   success signal) and spq:63 (annotations can skip confirmation, so no consent fact).
7. Status/used-by consistent. Row status `mined`; used-by
   `corpus/knowledge/webmcp-invocation-round-17.md` exists at M (`git cat-file -e` OK); the note
   declares `source: S046` in its header (`:6`) and carries the matching recheck class at `:10`
   (`S043/S046/S047/S048 on-release` = the row's `on-release`). Structural gate run in a
   `--no-hardlinks` sandbox clone at M: `node scripts/check-sources.mjs` ->
   `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6
   findings=0`, exit 0. So no E11 used_by_missing/E04 duplicate_url/row-shape finding touches S046.

Non-blocking observation (does not change the row's verdict; no repair required for S046 to hold):
the note's only substantive in-body use, `webmcp-invocation-round-17.md:76`, cites S046 for
"declarative tools are outside the spec"; the explicit sentence for that is README.md:319, which
S046's anchor cell does not list (308-313, 352-375) and which S030 already anchors. The note's
citation is still true of the document, and S046's scope covers declarative response paths, so this
is citation precision in the consumer, not a false source row. If a later round wants it exact:
point that note cell at S030 (README:319) or add `README.md:319` to S046's anchor cell.

Verdict: HOLDS. URL live, revision real and still the branch tip, all four sha256 exact, every
anchor line present at the stated number, the Gate quote verbatim at README.md:312 in 14 words,
tier/scope/teaches consistent with the cited bytes, status mined with a real, id-citing used-by
path, and the sources gate clean over the whole registry.

Remaining unknowns: static verification only (no browser run, no re-run of the C2 receipt in this
seat); the branch is a moving tip, so the commit pin — not `main` — is what stays valid, and the
row's `on-release` recheck is the right guard. Nothing in this seat observed the dossier's
"only index.bs moved since cb3d1696" claim beyond the four byte-identical sha256 the dossier
already records.

Files written: .ufo/waves/round-17/w2/ReopenS046.md
