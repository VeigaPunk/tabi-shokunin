# Round 30 w1 — ScribeRows (C2 registry rows + Gate block, drafted)

## Verdict

The two C2 registry rows and the round-30 Gate block are drafted, in the 11-column schema, and pass the frozen census syntax checks on a scratch copy of the registry: S116 (IETF `draft-ietf-httpapi-ratelimit-headers-11`, 23 May 2026, tier A spec, quote located in 67,097 fetched bytes) and S117 (Discord Developer Documentation "Rate Limits", tier A scoped to Discord's own published headers, quote located in the normalised page body whose sha256 an independent seat also reports). Two assimilation rejects (the overview entry citing staged S106/S110 and the r13 classes entry citing staged S147–S149) are recorded verbatim from the round-27 quarantine verdicts with flip conditions. Three package defects are documented and repaired: a false revision claim ("-10 and later return 404" — both `-10` and `-11` return 200 today; the newest is `-11`), a staged S117 anchor that names the page title rather than a section, and prose/pointer text in recheck cells. Nothing was landed: no lane file, index, jj state or counter was touched; the deliverables are drafts for the L1 plus fetched-byte receipts. The claim itself is not verified by this seat — the admission counter was not run (the rows' `used-by` entries and the receipts do not exist yet), so C2 remains unverified until the entry/receipt seats land and the measure seat runs `--live`.

## Deliverables (report trailer path: `.ufo/waves/round-30/w1/ScribeRows.md`)

- `.ufo/waves/round-30/w1/ScribeRows/rows.md` — both rows verbatim, provenance, tier justification, transform notes, renumber map, counter expectations, fetch log, command log.
- `.ufo/waves/round-30/w1/ScribeRows/gate-block.md` — `## Gate` block draft: per-row URL, access date, located quotes, tier line, admits, two rejects with reasons and flip conditions, integrator notes.
- `.ufo/waves/round-30/w1/ScribeRows/receipts/` — `draft-09.txt`, `draft-10.txt`, `draft-11.txt`, the three Discord fetches, `discord.norm.txt`, `fetches.tsv`, `SHA256SUMS.txt`, `census-validation.txt`, `SOURCES.scratch-appended.md`.

## Behavior

Read-only. Sources opened today (UTC): the IETF archive for revisions 09–13 of `draft-ietf-httpapi-ratelimit-headers` and `docs.discord.com/developers/topics/rate-limits`. Every fetch was a public HTTPS GET with no credentials, cookies or session material; no consequential action on any site.

- S116 is anchored at `-11`, §3 "RateLimit-Policy Field" line 302, §4 "RateLimit Field" line 432, examples lines 323 and 444. Gate quote: "It is this characteristic that differentiates it from the RateLimit (Section 4) field that contains information that MAY change on every request." (22 words, one occurrence).
- S117 is anchored at `§Header Format` (example block and per-header list) plus the per-guild exception paragraph, page `dateModified` 2026-02-06T17:38:32.017Z. Gate quote: "For most API requests made, we return optional HTTP response headers containing the rate limit encountered during your request." (19 words, one occurrence). The 25-word per-guild span a peer's receipt may quote is carried verbatim in the same Gate block, plus three candidate S116 spans, so `g6-gate` holds whichever span a receipt records.
- Rows carry `opened 2026-10-26`, `status mined`, `recheck 180d` (S116) / `90d` (S117), and `used-by` the two planned C2 entry paths.

## Gates and checks actually run

No lane gate, counter, build, linter or formatter was executed; no tool was installed or updated. The checks below ran against scratch copies, not the lane tree.

```sh
# fetch batch; HTTP status from curl -w, digests from sha256sum
curl -sS -L --max-time 60 -o draft-09.txt …-09.txt   → 200, 67876 B, e088940d…73ee
curl … -10.txt                                        → 200, 67803 B, f40a2411…7aa5
curl … -11.txt                                        → 200, 67097 B, d6016dd0…d412  (three fetches, identical digest)
curl … -12.txt / -13.txt                              → 404, 77297 B, db9919c0…c898 (error page)
curl … docs.discord.com/developers/topics/rate-limits  → 200, 408912 B; three fetches, raw sha 7870fe37…, 03b5a87d…, f29e0b33…
```
All exit 0 (curl exit status); HTTP codes read from `-w '%{http_code}'`.

```sh
# normalisation + substring probes (counter's normalise algorithm reimplemented)
python3 … → each quote: 1 occurrence; S117 normalised body 8728 chars, sha256 c719ecca4bef84b95a7f9fbda6b3e5094db944cc1e1374d5071ba97ea5d54007   exit 0
# three Discord fetches normalised → identical text (8728 chars)                                   exit 0
# census on a scratch copy of corpus/SOURCES.md with the two rows appended
rows=117 ; malformed=0 ; dupes=none ; enum/tier violations=none ; S116/S117 cells=11 each          exit 0
# used-by existence
missing: corpus/knowledge/rate-limit-policy-fields.md ; missing: corpus/knowledge/host-published-rate-limit-headers.md   exit 0
# ids unused at tip
grep -cE '^\|[[:space:]]*S11[67][[:space:]]*\|' corpus/SOURCES.md → 0                            exit 1 (count zero)
# receipt presence claimed by a peer
ls corpus/evidence/round-30/frontier/ → No such file or directory                                 exit 2
git -C … status --porcelain → only .ufo/waves/round-30/ untracked                                exit 0
```

## Touched surfaces

Written: `.ufo/waves/round-30/w1/ScribeRows/` (new output dir) and this report `.ufo/waves/round-30/w1/ScribeRows.md`. Scratch: `/fast/scratch/hyaku/tabi-r30/ScribeRows/` (removed after the receipts were copied). No lane tracked file, lane index, lane jj state, fleet repo, sibling lane or `/home/vgpnk/Projects/shokuknow` was modified; no commit was made anywhere.

## Out of scope (deliberately not done)

- No `corpus/SOURCES.md` edit and no patch file: the assignment scopes this seat to drafting the rows and Gate block; the peer seat `ScribeEntryDiscordHeaders` says its patch uses the canonical row, and the L1 integrates.
- No receipt or refetch file: another seat owns receipts; this seat only supplies fetched bytes and the verified spans.
- No counter run, so C2 is unverified here; routed defects 1–6 of the round-29 spot-check are frontier-step curation, not this item.

## Findings

1. **The package's revision claim is false today.** Staged S159 says `draft-09 (newest revision in the IETF archive; -10 and later return 404)`, and the r14 entry repeats `-10 and later currently return 404 (not run in this round)`. Measured 2026-10-26: `-10` → 200 (67,803 B), `-11` → 200 (67,097 B), `-12`/`-13` → 404. The newest revision is `-11`. The staged section/line map was right for `-09` (301/322/409), which is why the defect is the revision claim, not the anchor.
2. **The staged S117 anchor names a page title, not a section.** "Rate Limits" is the page title; the headings are `Header Format`, `Exceeding A Rate Limit`, `Global Rate Limit`, `Invalid Request Limit`, `API Reference`. Re-pointed, with `dateModified` and the fetch date.
3. **Tier B → A is a scope correction, not a promotion.** The scope is "what Discord publishes about its own API's rate-limit headers"; first-party documentation is primary for that, while B fits evidence of observed behaviour (which this row does not claim). Kind `docs`, so no A/community conflict.
4. **The Discord page's raw bytes vary per response, but the normalised body is stable.** Three fetches, three different sha256 digests, all 408,912 B; the normalised text is identical (8,728 chars, sha256 `c719ecca…`). The peer seat independently reports the same normalised digest, so `l3-live-bytes` is safe, but a receipt must record the digest of the bytes it commits, never the normalised digest. `nonce=` does not occur in the payload; the cause of the variance is not claimed.
5. **A peer's "landed" receipt is not observable.** `corpus/evidence/round-30/frontier/` does not exist at the lane tip and `git status --porcelain` shows only round-30 `.ufo/` paths, so no receipt quote was verified first-hand. The Gate block therefore carries both S117 candidate spans and three S116 candidates verbatim; none was invented — each occurs once in the fetched bytes.
6. **The Gate quote, not `teaches`, is what `g6-gate` checks.** A receipt quoting a span absent from the lesson fails admission even if the row is perfect. The block is written to survive either quote choice; the L1 must ensure the chosen spans survive editing and stay free of internal line breaks (the counter collapses whitespace but checks the receipt string as-is).
7. **Landing order matters.** The rows are `mined` and name two entry paths that do not exist; the census used-by check prints both as `missing` until the entries land. Rows and entries must land together.
8. **Population must be exactly two.** Any third knowledge entry carrying `frontier: rate-tos-signal` breaks `population = 2` even with both admits clean.
9. **Package/lane id collisions now cover S116 and S117.** Package S116 is a WebMCP guide, package S117 the WebMCP CG draft; lane S116/S117 now mean the IETF draft and Discord page. Package S118 (arXiv CDP paper) collides with reserved lane S118. Any later adoption of those package ids must be re-pointed by document.

## Artifact paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeRows/rows.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeRows/gate-block.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeRows/receipts/` (bytes, `fetches.tsv`, `SHA256SUMS.txt`, `census-validation.txt`, `SOURCES.scratch-appended.md`)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/w1/ScribeRows.md` (this report)
