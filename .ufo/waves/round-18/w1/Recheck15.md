VERDICT: PASS

# C1 freshness recheck — S030, S031 (seat Recheck15)

Lane tip at run time: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `2bff864fdfee684ddbcd066cc8e735adaba2735c` (= baseline B).
Producer: `.ufo/waves/round-18/recheck-fetch.mjs`, sha256
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (recorded as `producerSha256` in both receipts).
No tools installed or upgraded (node v26.x and curl on the host were sufficient; no pacman, no uv).

## S030 — WebMCP repository README

- Row (corpus/SOURCES.md:44): `https://github.com/webmachinelearning/webmcp/blob/main/README.md`;
  teaches = "Editors' statement of which WebMCP surface the specification defines versus explores";
  anchor cell = "repo HEAD cb3d16964ab3e92cfd5f09901ed0504373a906e8 (2026-10-20), README.md line 319, §Future Exploration: Declarative API".
- Fetch: tool `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 … 'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/README.md'`
  (`--url` differs from the row URL because the row points at the GitHub blob page; decode `none`).
  http = **200**, bytes = **37575**, sha256 =
  `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6`.
- Quote (original Gate quote, corpus/lessons/round-16.md:40, unchanged in the body, quoteFound=true,
  offset 18011, 11 words): `but it is not part of the specification at this time.`
- Anchor observed: repo HEAD `51ed75653aaa7f174f8dbe05d1bc327359bbc57c` (2026-10-20T14:57:14Z,
  "Discuss general agent ecosystem risks and link to agent security guidance (#334)"); README.md
  line 319 still sits under `### Future Exploration: Declarative API` (heading line 315). The row's
  anchor `cb3d1696` is exactly one commit behind current main; the GitHub compare API
  (`/compare/cb3d1696...main`: status ahead, ahead_by 1, total_commits 1, behind 0) lists **only
  `index.bs` (+55 −0)** as changed, so README.md is byte-identical between the row anchor and HEAD.
- Verdict: **held**. Line 319 still reads "A declarative counterpart … is being explored
  separately … but it is not part of the specification at this time.", which still grounds
  "declarative observations are implementation evidence, never spec citations".
- Drift draft: none.

## S031 — WebMCP declarative API explainer

- Row (corpus/SOURCES.md:45): `https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md`;
  teaches = "Proposed declarative (HTML form) WebMCP surface and its open schema-synthesis question";
  anchor cell = "repo HEAD cb3d16964ab3e92cfd5f09901ed0504373a906e8 (2026-10-20), §Input schema synthesis lines 108-115".
- Fetch: tool `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 … 'https://raw.githubusercontent.com/webmachinelearning/webmcp/main/declarative-api-explainer.md'`
  (decode `none`). http = **200**, bytes = **10417**, sha256 =
  `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28`.
  This digest is identical to the round-16 record quoted in corpus/lessons/round-16.md:41
  (`4587c9f2…bd28`), so the file has not changed since that gate.
- Quote (original Gate quote, corpus/lessons/round-16.md:41, unchanged in the body, quoteFound=true,
  offset 5241, 12 words): `Chromium is implementing a loose version of this and will conduct testing/trials`
- Anchor observed: repo HEAD `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`; `### Input schema synthesis`
  at line 106, `TODO: The exact algorithms … are TBD` at lines 108-113, the quoted sentence at
  lines 114-115 — i.e. the row's cited range lines 108-115 still holds. Same HEAD/compare evidence
  as S030: only `index.bs` changed after `cb3d1696`, so this file is untouched by that commit.
- Verdict: **held**. The proposal still marks form-to-JSON-Schema reduction as TODO/TBD and still
  says Chromium ships "a loose version" under testing, which keeps derived schemas build-scoped.
- Drift draft: none.

## Independent cross-check

My own plain `curl -sSL` (no `--compressed`) produced 37575 / 10417 bytes with the same two
digests before the tool ran, so the tool's `bytes`/`sha256` are not encoding artefacts.

## Residual unknowns

- None for either row. (Reading "HEAD" through raw.githubusercontent reflects the branch at fetch
  time; the compare API call and the two fetches were within the same minute, and the S031 digest
  equality with the round-16 record makes the historical stability independent of that timing.)

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S030.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S030.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S031.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S031.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck15.md
