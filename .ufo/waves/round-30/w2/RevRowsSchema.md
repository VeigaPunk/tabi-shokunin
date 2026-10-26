# Round-30 w2 — RevRowsSchema — registry rows S116/S117/S118 vs CORPUS §SOURCES.md

## Verdict

I attacked the three registry rows the frontier step appended at tip `072af95fe2822f0785a6ff88a578e2142dd258e5` — structure (11 cells, no pipes), kind/tier enums and tier scoping (including the S117 A-vs-package-B question), anchor exactness (sections, revision/dates, line numbers, digests) against the committed evidence bytes, `teaches` grounding (including S118's `supersedes S044 —` opening and its 404 claim), `status`/`used-by` reciprocity, `opened`/`recheck` cells, append-only discipline across the whole round diff, and live re-reachability of every cited source. **Verdict: holds.** Every contract check passes on byte-verified evidence; the S117 tier-A re-grade is contract-correct for the scope the row states; the S118 supersession is grounded in committed 404 receipts plus my own live 404 probe. Two low-severity findings (used-by cells incomplete under the contract's plain reading for body-text cross-references; the webmcp entry's header `source:` block never gained `source: S118`) and two nits/observations below — none breaks a gate, none is fabricated content, none changes a row verdict.

Instruments (in my scratch clone at the tip, `git status --porcelain` empty): `sources-census.sh validate --file` → exit 0; `node scripts/check-sources.mjs` → exit 0, `verdict=clean rows=118 … findings=0`. Frozen counter digest confirmed: `sha256sum scripts/check-frontier-admission.mjs` = `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca` (= `claims.json` frozenDigests).

## Evidence

### Commands run and exit codes

```sh
S=/fast/scratch/hyaku/tabi-r30/RevRowsSchema
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # exit 0
git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5         # exit 0
git -C "$S/clone" rev-parse HEAD        # 072af95fe2822f0785a6ff88a578e2142dd258e5
git -C "$S/clone" status --porcelain | wc -l   # 0
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md
   # exit 0; 18 W04 duplicate-url-across-scopes warnings (incl. S118 ↔ S036); final line "file ok …/corpus/SOURCES.md"
node scripts/check-sources.mjs
   # exit 0; SOURCES_GATE verdict=clean rows=118 tiers=A:103,B:6,C:9 status=queued:19,mined:90,rejected:9 findings=0
awk -F'|' 'NR>=130 && NR<=132 {print NR": NF="NF" id="$2}' corpus/SOURCES.md   # NF=13 for S116, S117, S118
grep -c '\\|' corpus/SOURCES.md         # 0 — no escaped pipes anywhere in the registry
sha256sum scripts/check-frontier-admission.mjs
   # cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca — matches claims.json frozenDigests
```

Receipts: `row-structure.txt`, `normalisation.txt`, `cell-audit.txt`, `fetch-log.tsv` in my output dir.

### S116 — draft-ietf-httpapi-ratelimit-headers-11 (spec, A, mined) — holds

- **Structure**: NF=13; kind `spec`, tier `A`, status `mined` all in enum; not community, so no tier-inflation.
- **Anchor vs committed bytes** (`corpus/evidence/round-30/frontier/bytes/S116.txt`, 67,097 B, sha256 `d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412` — recomputed, matches row and receipt): line 302 `3.  RateLimit-Policy Field`; lines 308–311 the Gate quote verbatim ("The field value SHOULD remain consistent … differentiates it from the RateLimit (Section 4) field that contains information that MAY change on every request."); line 323 the `RateLimit-Policy` example; line 432 `4.  RateLimit Field`; line 444 the `RateLimit: "default";r=50;t=30` example; line 8 `Expires: 24 November 2026`, line 11 `23 May 2026`. Every location the anchor names is exact.
- **teaches grounded**: the consistency/MAY-change distinction is lines 308–311 verbatim; one benefit (a receipt can record which of the two fields it saw). Gate quote = 25 words, contiguous substring of this row's own bytes (QUALITY 74).
- **status/used-by/opened/recheck**: `mined`; used-by `corpus/knowledge/rate-limit-policy-fields.md` exists and its `source:` line names S116 with the same URL, size and sha256; `opened 2026-10-26` (receipt `fetched_at 2026-10-26T06:39:52Z`, refetch 06:40:26Z byte-identical); `recheck 180d` valid cadence.
- **Live**: my independent GET (07:39:53Z) returned 67,097 B, sha256 `d6016dd0…d412` — byte-identical to the committed bytes.
- **Tier A fair**: the draft is the primary normative text for its own vocabulary; scope cell names exactly that vocabulary; lane precedent grades drafts `spec`/A (S020, S043).

### S117 — Discord Developer Documentation, Rate Limits (docs, A, mined) — holds

- **Structure**: NF=13; kind `docs`, tier `A`, status `mined` in enum.
- **Tier A for "Discord's own published headers" — fair, and the package's B answered a different question.** CORPUS tier definition: A = "primary or authoritative for that scope (spec, official docs, source code, …)". The row's scope is "Discord's own published API rate-limit headers … documentation only, not a measured response and no API calls". For the scope *what Discord publishes about its own wire headers*, first-party official docs are primary — A is the contract-correct grade. B ("strong secondary: expert write-up, survey, textbook") fits evidence of *observed behaviour*, which the scope cell explicitly disclaims. The re-grade and its reason are recorded in the lesson (`corpus/lessons/round-30.md:28-30`). Kind is `docs`, so the A/community bar never triggers.
- **Anchor vs committed bytes** (`bytes/S117.html`, 408,912 B, sha256 `b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3` — recomputed, matches receipt): `"dateModified":"2026-02-06T17:38:32.017Z"` present (raw and live); `Header Format` heading present with the `Rate Limit Header Examples` block (2 occurrences); all seven header names present (`X-RateLimit-Limit/-Remaining/-Reset/-Reset-After/-Bucket/-Global/-Scope`); the per-guild exception paragraph sits **before** §Header Format (byte offsets: `per-guild basis to prevent abuse` at 140,606 < heading at 141,615), exactly as the anchor says.
- **"with Global and Scope on a 429" grounded**: page bytes carry, for both headers, "Returned only on HTTP 429 responses" (Global: "…if the rate limit encountered is the global rate limit (not per-route)"; Scope: "Returned only on HTTP 429 responses. Value can be `user` … `global` … `shared`").
- **Normalised body replicated with the frozen counter's own `normalise`** (extracted verbatim from the byte-identical counter, applied in node): committed receipt bytes, committed refetch bytes, **and my live fetch** all normalise to 8,728 chars, sha256 `c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007` — matching the anchor's claim — and both quotes (the receipt's per-guild span, the Gate's "optional HTTP response headers…" span) are substrings of the normalised text.
- **"raw bytes vary per response (three fetches, 408912 B each)"**: the w1 scratch batch (`w1/ScribeRows/receipts/discord-{rate-limits,2,3}.html`) is three files, 408,912 B each, digests `7870fe37…`/`03b5a87d…`/`f29e0b33…` (recomputed in the lane worktree); the tracked lane evidence adds `b73dc7d1…` (receipt) and `c1c2d3f9…` (refetch), and my live fetch adds `2393033d…` — six fetches, all 408,912 B, six distinct raw digests, one normalised body. Claim true and reproducible without the untracked w1 receipts (see Observation 4).
- **status/used-by/opened/recheck**: `mined`; used-by `corpus/knowledge/host-published-rate-limit-headers.md` exists, `source: S117` with the URL and §names; `opened 2026-10-26` (receipt 06:40:02Z, refetch 06:40:32Z); `recheck 90d` valid.

### S118 — DevTools frontend WebMCP model (code, A, mined) — holds

- **Structure**: NF=13; kind `code`, tier `A`, status `mined` in enum. **`teaches` opens `supersedes S044 —`** as SOURCES rule 2 requires for a correction row.
- **Anchor vs committed bytes** (`corpus/evidence/round-30/s118/`): `WebMCPModel.ts@66df492` (8,553 B, sha256 `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632` — recomputed) has `invoke` at 128–139 (returns `response.invocationId` at 138) and `toolResponded` at 249–258 (id lookup at 250) — exactly the lines and semantics the anchor and `teaches` name; `WebMCPView.ts@66df492` (59,794 B, sha256 `4b2fce64…a7540f` — recomputed) has the `onRunTool` invoke+correlation at 942–952 and the status/output cells at 561–576; `WebMCPModel.ts@bf69d041` is byte-identical (`c23d575e…`), matching "Model byte-identical at bf69d041". `DEPS.154.0.8037.97.lines420-425.txt` shows `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',` at line 424 — the tag↔commit pin is exact.
- **404 claim verified three ways**: committed Gitiles TEXT 404 receipts at both commits (`NOT_FOUND.panels-application.WebMCPModel.ts@{66df492,bf69d041}.b64`, 233 B each, plus the 14 B raw-host "404: Not Found"), the fetch log (`fetches.tsv`, 404 rows at 07:06:11–13Z), **and my own live probe** of the github.com blob URL (HTTP 404, 191,258 B, 07:39:54Z). The panel-directory listings (85 entries, no model file) and both BUILD.gn/barrel files corroborate the correction.
- **Quote discipline**: `quote-check.txt` reports count=1 and word counts 8/10/9 for the three spans; the Gate quote (`WebMCPModel.ts:249-250`, 8 words) is a contiguous substring of this row's own committed bytes (QUALITY 74).
- **status/used-by/opened/recheck**: `mined`; used-by `corpus/knowledge/webmcp-invocation-round-17.md` exists and cites S118 in its appended round-30 correction (`:152`); `opened 2026-10-26` (fetches.tsv 07:02:04–07:09:04Z); `recheck on-release` valid and consistent with the tag-pinned siblings. The source cell deliberately carries no `refs/tags/` string, matching S044/S068's URL form, so the round-29 release-pin reading is untouched (documented in w1 `ExecS044Supersede.md`).
- **Live**: my independent GETs of the model at both commits returned 8,553 B, sha256 `c23d575e…b632` each — byte-identical to the committed bytes.

### Registry-level discipline (rule 2, append-only)

Cell-level audit of `git show f7c0317e4f8445502005e79e3d65767430912dab:corpus/SOURCES.md` vs the tip file: **115 → 118 rows; appended exactly S116, S117, S118; removed none; all 23 modified rows (S033…S106) changed only the `used-by` cell; violations 0** (`cell-audit.txt`). The lesson logs the 23 old→new appends in §"`used-by` changes" (table with exactly 23 rows) — rule 2's logging requirement holds. CORPUS census awks (enums, duplicate ids, mined used-by existence) print nothing.

## Findings

1. **LOW — used-by cells incomplete under the contract's plain reading (body-text cross-references).** `host-published-rate-limit-headers.md` attributes claims to S116 in body text (`:14-15`, `:134-136`, and `:144` "the draft's `pk` is a byte-sequence value (S116)"), but S116's `used-by` lists only `rate-limit-policy-fields.md`; `rate-limit-policy-fields.md:77` names "the sibling S117 entry", but S117's `used-by` lists only `host-published-rate-limit-headers.md`. CORPUS defines `used-by` as "paths of the knowledge entries or lessons citing the row", which these mentions arguably are. Mitigation: maintained QUALITY 75 scopes reciprocity to `source:` lines (each entry's `source:` names exactly its own row — reciprocity holds there), the counter's `r3-used-by` direction holds, and the census passes; no instrument fails. Attack seat — not repaired.
2. **LOW — the webmcp entry's header `source:` block never gained `source: S118`.** The landed `corpus/knowledge/webmcp-invocation-round-17.md` header (`:1-9`) lists S041–S054 including S044 but not S118; w1's `ExecS044Supersede.md` patch had proposed "`source: S118` added after `source: S044`", and `corpus/lessons/round-30.md:53` documents "its header `source:` lines were not edited". The entry cites S118 only in the appended correction (`:152`), which is why `check-sources.mjs` passes (row id present in the file). Residual: a freshness sweep reading only the header re-checks S044 — whose anchor carries the wrong Model path — and never reaches S118. Documented deviation, not a row defect.
3. **NIT — S118 `teaches` wording**: "the panels/application path S044 and its twin S068 name" slightly overstates S068, whose anchor says `Model:249-257` with no directory (S044's anchor names `WebMCPModel.ts` bare under the panels/application context). w1's own report classifies S068 as under-specified, not false. The load-bearing claims (model at `models/web_mcp/WebMCPModel.ts`; the panels/application path 404s at both commits) are byte-verified.
4. **OBSERVATION — S117's "three fetches" receipts are untracked.** `.ufo/waves/round-30/w1/` has 0 tracked files in git (the w1 reports and scratch receipts exist only as lane-worktree content). The tracked lane evidence carries two fetches and my live fetch a third distinct digest, so the claim is reproducible without the untracked receipts; noted as provenance, not a defect.
5. **OBSERVATION — census W04 on S118 is the lane's usual same-URL/different-scope warning.** S118's URL duplicates S036's (`…/front_end/models/web_mcp/WebMCPModel.ts`, scopes: tool-registry maintenance @192-203 vs invocation client @128-139/249-258); `validate` exits 0 and 17 pre-existing W04 warnings share the pattern. Consistency bonus: S036 (opened 2026-10-20) already carried the correct model path and the same file sha256 `c23d575e…`, so S118's correction agrees with the registry's own earlier row.

## Network fetch log (all read-only HTTPS GETs, no credentials/cookies/session material)

See `fetch-log.tsv` (URL, UTC, status, bytes, sha256 per fetch): ietf.org draft -11 (200, byte-identical), raw.githubusercontent model at 66df492 and bf69d041 (200, byte-identical each), github.com blob 404 probe (404), docs.discord.com rate-limits (200, sixth distinct raw digest, normalised body identical). Small live bytes copied to the output dir (`S116-live.txt`, `S118-model-66.ts`, `S118-model-bf.ts`); large responses recorded by digest.

## Residual risk / verification gaps

- I did not run the C1/C2 counters (other seats' claims; my item's instruments are the census and `check-sources.mjs`, both run clean). The S117 normalisation replication used the frozen counter's own `normalise` function but is not a counter run.
- The bf69d041 panels/application 404 is verified via committed receipts only; my live 404 probe covered 66df492 (github.com blob UI).
- The Discord page is a dynamic render: raw bytes vary per response by design; six fetches (3 w1 + 2 tracked + 1 mine) all normalise identically, but invariance over future fetches is the `90d` recheck's business, not a proof.
- Tree-wide uniqueness of `WebMCPModel.ts` in devtools-frontend is not proven (Gitiles archive 404 on this host; w1 risk note 5) — not load-bearing: the row's anchor names paths.

Tooling: nothing installed or upgraded (node/curl/awk present; no authorization needed).

Report trailer: `Report: .ufo/waves/round-30/w2/RevRowsSchema.md`
