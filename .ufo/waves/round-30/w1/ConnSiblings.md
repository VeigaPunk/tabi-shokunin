# ConnSiblings — sibling-overlap scan for C2's surface (round 30 w1)

Seat: ConnSiblings (connector, milestone adjacency). Lane: tabi, round 30 attempt 1, wave w1.
Basis: lane checkout at `38891ca0bd28fff45b6736edfcad93438b782063` (integration commit: C1 self-test
cases, C2 entries S116/S117 with receipts, used-by curation, lesson Gate); freeze
`061e62024c0523d3c6c7e819506a773ff2cd7d75`; scratch shared clone at the freeze (unused for runs).

## Verdict

C2's surface is **uncontested**: no sibling lane claims rate-limit-signal, robots/crawl-policy, ToS, or
`Retry-After` ground that the two adopted entries (S116 — IETF `RateLimit`/`RateLimit-Policy` field
vocabulary; S117 — Discord's published `X-RateLimit-*` header set) absorb. Both entries stay inside tabi's
own declared province (`PROVINCE.md:10` "rate/rights discipline"): the S117 entry's shape-only capture rules
explicitly refuse credentials, tokens and cookies, so the declared kagi secrets split is respected; neither
entry parses robots.txt, sitemap or crawl policy, so kake's robots/crawl ground is untouched and the
already-recorded client-side/publisher-side split (kake `PROVINCE.md:34-35`, `:304`; existing adjacency row
`crawler-discipline-vs-publishing`, `split-declared`) still holds. The closest neighbors — kama's measured
GitHub REST 403 + `x-ratelimit-*` samples (2026-10-25), kengaku's observed provider 429/`x-ratelimit-*`
headers (recorded but refused as unowned), mado's GitHub REST 403 note, mori's journald rate-limit notices,
chousa's 403 challenge-page gate handling — are different evidentiary classes (measured single-host facts,
local-log mechanics, gate behavior) on different surfaces, and none is claimed as a domain by its lane. No
absorption, no contest. One adjacency row is warranted (drafted below) tying tabi's new vocabulary to kama's
closest measured neighbor as `split-declared`, so the two lanes do not drift into a shared "host rate-limit
behavior" hub. The **ToS half of the frontier label remains open everywhere** — no lane holds real-site ToS
ground and C2 does not touch it; L1 should keep that distinction explicit in the frontier wording.

## Evidence

### A. Basis and lane state

- Lane HEAD at scan time: `38891ca0bd28fff45b6736edfcad93438b782063` (commit message: "round-30: C1
  self-test cases (s106 +3, release-pins +9), C2 rate/ToS entries S116-S117 with receipts, used-by
  curation, lesson Gate, tally corrections"). Freeze `061e62024…` is its parent.
  - `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → exit 0, `38891ca0bd28fff45b6736edfcad93438b782063`.
  - `git -C … status --porcelain | head -40` → only `.ufo/waves/round-30/w1*` dispatch/spec files untracked (wave runner files), no tracked-file drift.
  - `git -C … diff --name-status 061e62024… 38891ca0bd28fff45b6736edfcad93438b782063` → exit 0; C2-side changes: `corpus/knowledge/rate-limit-policy-fields.md` (+), `corpus/knowledge/host-published-rate-limit-headers.md` (+), `corpus/SOURCES.md` (S116/S117 rows), `corpus/evidence/round-30/frontier/{S116.json,S117.json,bytes/*,refetch/*}`, `corpus/lessons/round-30.md`.
- Read: `.ufo/waves/round-30/claims.json` (C2 surface, controls J1–J4, assimilation package, id plan), `.ufo/waves/round-30/baseline/README-receipts.md`, package entries `merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r14.md` (staged S159) and `host-rate-limit-header-set-r16.md` (staged S182), adopted entries, `corpus/lessons/round-30.md`, `corpus/SOURCES.md` rows S116/S117 (both `mined`, opened 2026-10-26, `used-by` names each adopted entry), `corpus/adjacency.tsv` (format read: `surface sibling sibling_ref sibling_quote tabi_ref tabi_quote disposition ruling_ref ruling_quote`).

### B. Province scan (all 21 `*-shokunin/PROVINCE.md`)

Grep (case-insensitive, gitignore off; pattern `rate.?limit|ratelimit|RateLimit|retry.?after|Retry-After|robots|crawl|terms of service|ToS|429|403|throttl|quota`), relative glob `*-shokunin/PROVINCE.md`:

| lane | held rate/robots/ToS ground | path:line |
|---|---|---|
| **kake** | **yes — robots/crawl-policy is kake's core ground, with an explicit tabi split already declared** | `PROVINCE.md:22-23` (crawl hygiene per host: robots.txt, sitemap scope, canonical signals), `:34-35` ("`tabi` drives browsers and owns client-side crawler discipline; kake owns publisher-side placement (robots/sitemap at the host it serves)"), `:297-304` (round-37 robots.txt frontier step; boundary restated at `:304`), `:322-324` (round-38 robots audit repair; "Client-side crawler discipline stays with tabi; kake keeps publisher-side placement") |
| kengaku | none (telemetry/quota is provider-model quota vocabulary; unrelated) | `PROVINCE.md:16` ("quota-vs-auth failure split") |
| kotoba | none (adjacency table only) | `PROVINCE.md:57-61` |
| mori | none (filesystem quota FR2 and journald rate-limit notices; not HTTP) | `PROVINCE.md:45` (FR2 quota/EDQUOT), `:211-231` (round-23 quota disposition) |
| kama | none in province (local model serving; "Refuses: … remote web surfaces (kake)" at `:43`) | — |
| game-dev-3d | none (incidental pattern hits only) | `PROVINCE.md:53-57` |
| all other lanes (kaidoku, revenger, kasegi, chousa, kumitate, mado, souji, tameshi, tsukuroi, kotodama, lore, audio, game-dev-2d, kagi) | **no matches** | — |

### C. Corpus-level scan (`*-shokunin/corpus/README.md` + `*-shokunin/corpus/knowledge/*.md`)

Same pattern, plus targeted exclusivity pattern `X-RateLimit|ratelimit|RateLimit-Policy|Retry-After|rate-limit`:

- **kake** `corpus/README.md`: web robots/crawl knowledge rows — `crawl-scope-per-host.md` (`:42`), `robots-txt-rules.md` (RFC 9309; `:63`), `baidu-friendly-crawl-guidance.md` (`:48`), `baidu-mobile-matching-error-causes.md` (`:49`), `canonical-selection.md` (`:50`), `crawl-budget-consequences.md` (`:51`), `crawl-error-status-table.md` (`:52`), `crawler-identity.md` (`:53`), `js-rendering-queue.md` (`:56`), `yahoo-japan-*` robots rows (`:66-74`), frontier map `:89`.
- **kama** `corpus/README.md:583` (`sglang-docs-version-pinning-amendment-2026-10-23.md` row: "the GitHub REST API rate-limit is bypassed by the read-only git protocol"), `:589` (staged row S360 rejected: "the API is rate-limited at HTTP 403 on this host"); knowledge file `sglang-docs-version-pinning-amendment-2026-10-23.md:34-36` measured `HTTP 403 "API rate limit exceeded"` with `x-ratelimit-limit: 60`, `x-ratelimit-remaining: 0` on two independent requests (2026-10-25).
- **kengaku** knowledge `attrib-r21.md:629-630`: observed provider quota headers `x-ratelimit-limit-day 10000 / remaining-day 8322` (hyper) — recorded as serving-plane observation, "routed to the integrator, not absorbed"; `probe-battery-r19.md:147-148,197,268-271` (zai 429 rate-limit windows). No claim of ground; explicitly unowned.
- **mado** knowledge `idle-lock-route-r17.md:28-29,120`: "The GitHub REST API returned HTTP 403 rate-limit and was not used" (operational footnote), plus local hyprctl request limits (`request-limits-upstream-r31.md`, `event-delivery-limits-r26.md` — local IPC, unrelated).
- **mori** knowledge: journald rate-limit notice text (`earlyoom-invocation-scope-r30.md:93`, `journal-alarm-routing-r14.md:165,175`, etc.) — local journal mechanics, unrelated to HTTP signals.
- **chousa** knowledge `quote-reopen-r29.md:38,96-97`: "challenge pages (S014 answered 403)" — research-gate method note, unrelated.
- **kagi** knowledge `op-ref-consumption.md:190`: `op service-account` subcommand named `ratelimit` — a CLI name, unrelated.
- **kumitate** knowledge `cost-and-profile.md:318-320`, `distill-and-l3.md:287-290`, `native-judge-pipeline.md:157-158`: internal `FailureClass::RateLimit` routing enum — model-routing internal, unrelated.
- **audio** knowledge: no rate/robots/ToS ground (incidental matches only).
- **tabi** (self): `knowledge/rate-limit-policy-fields.md` (S116), `knowledge/host-published-rate-limit-headers.md` (S117), pre-existing `knowledge/redirect-and-retry-after-semantics.md` (RFC 9110 `Retry-After`, S107; `:41-44`), loopback instruments `knowledge/external-class-fixture-v2.md` (robots-disallow/429/403, never a real surface; `arc-synthesis.md:38`).

### D. Exclusivity confirmation

Pattern `X-RateLimit|ratelimit|RateLimit-Policy|Retry-After|rate-limit` over all sibling PROVINCE/README/knowledge files → holders are only: kama (measured GitHub REST 403/`x-ratelimit-*`), kengaku (measured provider `x-ratelimit-*`), kumitate (internal enum name), mado (GitHub REST 403 footnote), mori (journald text), kagi (CLI subcommand name), and tabi itself. **No sibling holds the published site-interaction rate-limit signal vocabulary** (IETF draft fields or a host's documented `X-RateLimit-*` set).

### E. Absorption check

1. **kake (robots/crawl): not absorbed.** The two entries are vocabulary for server-published rate-limit *headers*; neither mentions robots.txt, sitemap, canonical signals or crawl policy. tabi's own province line `PROVINCE.md:10` ("rate/rights discipline") is client-side record-keeping; kake's split declarations (`PROVINCE.md:34-35`, `:304`) name the same boundary. The pre-existing adjacency row `crawler-discipline-vs-publishing` (kake, `split-declared`) already records it and stays accurate.
2. **kagi (secrets): not absorbed.** S117 §5 explicitly forbids capturing `Authorization`, bot tokens, webhook tokens, cookies and session material ("shape-only" records); consistent with the declared refusal `PROVINCE.md:16`.
3. **Forensics/method lanes (revenger, kaidoku, chousa, kotoba): untouched.** No overlap anywhere.
4. **Status classes vs hosted measurement:** C2 is `tier: documented upstream, not measured`; the adjacent measured facts (kama/kengaku) are single-host observations inside other lanes' tooling, not claimed surfaces.

### F. Adjacency row draft (one row; format from `corpus/adjacency.tsv`)

```
host-rate-limit-signal-ground	kama	kama-shokunin@9d9cc93ec50783cd114829a91757b90d57c78dc6:corpus/README.md:583	the GitHub REST API rate-limit is bypassed by the read-only git protocol	PROVINCE.md:10	site-specific gotchas, rate/rights discipline	split-declared	-	-
```

Rationale: tabi now holds published rate-limit signal vocabulary (S116/S117, docs-level); kama holds the
closest measured neighbor (GitHub REST 403 + `x-ratelimit-*` sampled 2026-10-25, `sglang-docs-version-pinning-amendment-2026-10-23.md:34-36`). The row declares the split (vocabulary vs measured single-host fact) so neither lane later claims a shared "host rate-limit behavior" hub. Optional second row (not drafted): kengaku's observed provider `x-ratelimit-*` headers (`attrib-r21.md:629-630`) as a further measurement-side neighbor — it refused ownership, so it is lower priority.

### G. Risks / L1 notes

- All sibling citations are to live lane files; hashes above are the scan-time HEADs (kake `7ff637929c938f56c625e01d54b6156843c9d469`, kama `9d9cc93ec50783cd114829a91757b90d57c78dc6`, chousa `00f8c7f5272a1d98b6d34913985fa4537e00aaf9`, kaidoku `e265533ea3a7cd4d9a75a24ef737c2ff0e98e95f`, revenger `6da884c6708fa25a7af013b6fc6802492e3264fa`, kasegi `5a253372d7ccda2fd7829932489481218c3b0efb`, kotoba `314e4a1a749848fdf3fc61d44c07e356bdaa1c65`). Re-anchor before integration if those lanes moved.
- The ToS half of the frontier item label "Rate/ToS surface" is still held by nobody; C2 does not claim it. Keep the wording of the frontier row scoped to the rate-limit signal vocabulary, and leave ToS as a separate open item.
- Nothing in this scan required network access; no fetches were made.

## Commands run (with exit codes)

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` → exit 0 (`38891ca0bd28fff45b6736edfcad93438b782063`)
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain | head -40` → exit 0 (only wave dispatch/spec files untracked)
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline -6` → exit 0 (38891ca … 061e620 … f7c0317 …)
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --name-status 061e62024c0523d3c6c7e819506a773ff2cd7d75 38891ca0bd28fff45b6736edfcad93438b782063` → exit 0
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show --stat --format='%H%n%s' 061e62024…..38891ca0bd28fff45b6736edfcad93438b782063` → exit 0
- `for d in kake kama chousa kaidoku revenger kasegi kotoba; do git -C "/home/vgpnk/Projects/shokunin/$d-shokunin" rev-parse HEAD; done` → exit 0 for all seven
- grep-tool scans (case-insensitive; gitignore off): (a) `*-shokunin/PROVINCE.md`; (b) `*-shokunin/corpus/README.md`; (c) `*-shokunin/corpus/knowledge/*.md` (pattern `rate.?limit|ratelimit|RateLimit|retry.?after|Retry-After|robots|crawl|terms of service|ToS|429|403|throttl|quota`); (d) exclusivity pattern `X-RateLimit|ratelimit|RateLimit-Policy|Retry-After|rate-limit` over the union of the three file sets. All four returned matches only in the files quoted above; every other lane file returned no match. (Earlier probe greps with absolute-path globs returned "No matches found" — a tool-glob limitation; re-run with relative globs + `gitignore:false` is the evidence above.)
