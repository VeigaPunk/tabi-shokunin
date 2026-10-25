# ScribeSOURCESRows — round 25, wave 1 (scribe, read-only)

Seat: `L1Tabi25.ScribeSOURCESRows`. Lane HEAD read: `c8ef3084c6363f265b9d23285296ab3547654f57` (`git rev-parse HEAD`; one commit past baseline `9e136667`: `c8ef308 round-25: freeze claims, controls, census-before, wave-1 spec`). Claims read first: `.ufo/waves/round-25/claims.json`.
Writes: this file, plus fetched bytes under `.ufo/waves/round-25/scratch/ScribeSOURCESRows/`. No tracked file was edited and no git write was made. No tools were installed or upgraded. No long-running process was started; the only network clients were eight one-shot `curl` GETs, all of which exited.

## Bottom line

- **S106 draft row is ready** (Chromium 154 `content_features.cc`). The id is free in the lane registry, and the URL is not already in it. The only S106 collision is with the *staged* shokuknow package (RFC 9309). Lane ids are assigned by document, so the lane keeps S106 for content_features.cc and any adopted package row gets renumbered.
- **C2 needs zero superseding rows.** All six held quotes (S013, S015, S016, S020, S023, S024) appear exactly once in today's bytes. All six bodies are byte-identical to the 2026-10-20 round-18 receipt digests.
- **Search-log drafts:** three lines below. The assimilation line is a template, because the candidate's verdict is not decided by this seat.

## 1. Fetch provenance (observed)

Command, run from the scratch dir; `date -u +%FT%TZ` was recorded just before the GETs → `2026-10-25T12:15:58Z`:

```
fetch(){ curl -sS -L -A 'Mozilla/5.0 tabi-recheck' -o "$1.body" -w "$1 %{http_code} %{size_download} %{url_effective}\n" "$2"; }
# one GET per URL in parallel, then: sha256sum *.body; wc -c *.body
```

| file | HTTP | bytes (`wc -c`) | sha256 (`sha256sum`) | equals prior digest? |
|---|---|---|---|---|
| S013.body (playwright.dev/docs/test-retries) | 200 | 99073 | `cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa` | yes: kaika r1 Gate and round-18 `S013.json` |
| S015.body (…/actionability) | 200 | 47845 | `31075410ae19edfe13f6f1cd5ec4d980ee9be0303009f4273563231db610fe8d` | yes: kaika r1 and round-18 |
| S016.body (…/test-assertions) | 200 | 159543 | `1bb8afe888af092190125a3d5a6aef753fb17312c0c0b774d296060ac0766a2c` | yes: kaika r1 and round-18 |
| S020.body (webmachinelearning.github.io/webmcp/) | 200 | 511987 | `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40` | round-18 yes; kaika r1 (`a8f75790…04a1`) no |
| S023.body (…/locators) | 200 | 268087 | `234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6` | yes: kaika r1 and round-18 |
| S024.body (…/aria-snapshots) | 200 | 125426 | `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194` | yes: kaika r1 and round-18 |
| S106-content_features.body (base64 transfer) | 200 | 98604 | `f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03` | n/a (new row) |
| S106-content_features.cc (`base64 -d`) | — | 73952 (1624 lines) | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | equals ScoutOpenS106's independent fetch |
| S106-tagref.body (`+/refs/tags/154.0.8037.97?format=JSON`) | 200 | 2334 | `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264` | commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, committer time `Wed Sep 30 21:20:00 2026` |

The prior digests come from `corpus/lessons/kaika-fleet-round-1.md:56-67` and from `corpus/evidence/round-18/source-recheck/<id>.json` (fetchedAt 2026-10-20T20:49Z). Both were read with `node -e` over each JSON. The same tag commit `b510e9d7…` is already recorded on S033/S100.

## 2. Draft S106 row (new, opened this round)

Located quote: decoded lines 186–187 (`grep -n 'BASE_FEATURE(kBackForwardCache,' S106-content_features.cc` → 187). The quote is 7 words:

```
186: // Enable using the BackForwardCache.
187: BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);
```

Scope context (`sed -n 186,210p`): line 191 is `BASE_FEATURE(kBackForwardCacheEntryTimeout, base::FEATURE_ENABLED_BY_DEFAULT);`. Lines 193–202 are comments saying the feature is disabled on low-memory devices, and that `BackForwardCacheMemoryControls` "is enabled only on Android". Line 203 declares `BASE_FEATURE(kBackForwardCacheMemoryControls,`, and lines 205–209 hold `#if BUILDFLAG(IS_ANDROID)` → ENABLED, else → DISABLED.

Row (11 cells, same order as the registry header):

```
| S106 | Chromium 154 content_features.cc — BackForwardCache feature — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT | code | A | Build-scoped default state of the BackForwardCache feature and its Android-only memory gate at tag 154, not runtime restore behaviour or any page's eligibility | tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; fetched 2026-10-25, 73952 bytes decoded from a 98604-byte base64 transfer, sha256 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44; decoded lines 186-187 "// Enable using the BackForwardCache. BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);"; memory gate lines 193-209 | At tag 154 kBackForwardCache is enabled by default and its memory-controls gate defaults on only on Android, so a desktop loopback run needs no feature flag to be eligible; eligibility is not an observed restore | mined | 2026-10-25 | on-release | corpus/knowledge/bfcache-runtime-observed-round-25.md |
```

Why each cell has its value:
- `kind code` / `tier A`: this matches the other tag-pinned Chromium rows (S034, S100, S105). Tier A is scoped to the `scope` cell only.
- `recheck on-release`: the URL pins an immutable tag, as with S105.
- `used-by`: this is the path given in ScribeEntryBfcache's assignment. [INFERENCE] `scripts/check-sources.mjs` resolves `used-by` paths (lines 205–237 classify missing/uncited/cited). The row should therefore land in the same commit as that entry, and the entry must cite `S106`, or the checker will flag it.
- `teaches` stays out of runtime territory. "Enabled by default" is a source default. Source-to-binary equivalence and whether a restore occurs are C1's receipt questions. `--disable-back-forward-cache` is not declared in this file: `grep -c 'disable-back-forward-cache' S106-content_features.cc` → 0 (observed).

**Id-collision guard (observed):**
- Lane registry: `rg -c "content_features" corpus/SOURCES.md` → 0, so there is no duplicate URL. ScoutAssimilationPrep records 105 lane ids, S001–S105, with no S106.
- Staged package: `/home/vgpnk/Projects/shokuknow/lanes/tabi/SOURCES-PROPOSED.md:43` uses `S106` for RFC 9309, and lines 52/60/68 use `S107`/`S108`/`S109` for the WebMCP DevTools agent-surface pages. `corpus/lessons/round-22-verifier-spotcheck.md:164` records that staged S106 as `payload-absent` → refused.
- Rule: the round-23 lesson (lines 72–73) says ids go "by document, never arithmetic". The round-24 lesson (line 24) says a future adoption "must renumber by document".

Taken together: the lane's S106 is content_features.cc. The next unused lane id after this append is **S107**, and it does not denote the staged S107 document. Any adopted staged row must be re-keyed to S107+ in an id map like the one in the round-23 lesson.

Suggested `## Paths` extension (optional, for the L1): `bfcache-runtime` — S104 → S105 → S106 → the round-25 receipt. The order is: what a restore does, then the protocol discriminator, then the build's feature default, then the observation. It ends at `knowledge/bfcache-runtime-observed-round-25.md`.

## 3. C2 — six re-opened rows: superseding rows required = 0

Locator: a python pass over each body that strips tags, unescapes entities, collapses whitespace and runs `str.find`/`count` for the held quote. The raw line is the first raw line whose tag-stripped text contains the quote. The held quotes are verbatim from `corpus/lessons/kaika-fleet-round-1.md` §Gate.

| id | held quote (kaika r1 Gate) | words | located (today) | count | nearest heading | verdict |
|---|---|---|---|---|---|---|
| S013 | "\"flaky\" - tests that failed on the first run, but passed when retried" | 13 | raw line 68, text offset 4318 | 1 | Retries | holds |
| S015 | "It auto-waits for all the relevant checks to pass and only then performs the requested action." | 16 | raw line 5, text offset 2043 | 1 | Introduction | holds |
| S016 | "Playwright also includes web-specific async matchers that will wait until the expected condition is met." | 15 | raw line 7, text offset 2212 | 1 | (none matched by the h1–h3 regex) | holds |
| S020 | "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents." | 13 | raw line 872 (`<p>…</p>`), text offset 23154 | 1 | Abstract | holds |
| S023 | "role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines" | 19 | raw line 36, text offset 5280 | 1 | (none matched by the h1–h3 regex) | holds |
| S024 | "aria snapshots provide a YAML representation of the accessibility tree of a page." | 13 | raw line 56, text offset 5464 | 1 | Aria snapshots | holds |

The text offsets depend on the stripping method; ScoutFreshnessReopen's offsets differ from mine for the same bytes. The raw lines agree with ScoutFreshnessReopen for all six, and so do the sha256s. For the counter, raw line plus count is the stable anchor.

No superseding row is drafted because every held quote is located. Per the C2 kill rule, each row resolves through "a located held quote", so no supersession pointer is needed.

**Anchor-cell drift on S020 (observed, not a supersession trigger):**
- The row's anchor cell reads `CG-DRAFT 2026-10-16, revision f14762e6`.
- Today's bytes carry `content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c" name="revision"` and `<time class="dt-updated" datetime="2026-10-20">` (`grep -o` over S020.body).
- This is the same served revision round 18 recorded. The precedent (`corpus/knowledge/source-recheck-round-18.md:118,127`) says "no superseding row is opened for a moving anchor"; the drift is recorded in the receipt.

Recommendation: carry it in the freshness receipt, not the registry. If the L1 overrides the precedent anyway, here is a conditional draft; it is not recommended:

```
| S107 | WebMCP — https://webmachinelearning.github.io/webmcp/ | spec | A | WebMCP draft API semantics (Community Group draft) | CG-DRAFT dt-updated 2026-10-20, revision 51ed75653aaa7f174f8dbe05d1bc327359bbc57c; fetched 2026-10-25, 511987 bytes, sha256 5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40; Abstract, raw line 872 | supersedes S020 — anchor cell only: the held Abstract quote still holds at the served revision 51ed7565; teaching unchanged | mined | 2026-10-25 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

If this conditional row were landed, the C1 entry would have to keep S106, and this row would take S107. That in turn pushes any assimilation renumbering to S108+.

**Counter-design finding (observed):** five of six digests equal the 2026-10-19 digests, and all six equal the 2026-10-20 digests. A freshness check that requires "digest differs from prior rounds" would therefore mark these honest fetches stale. "This round's fetch" has to rest on `fetched_at` plus a retained body whose sha256 recomputes, not on digest novelty. ScoutFreshnessReopen.md (lines 18–22) reached the same conclusion independently. This is for MutC2Counter/ExecCounterC2Proto; it changes no row.

## 4. Draft Search-log lines (for `corpus/SOURCES.md` §Search log)

```
- 2026-10-25 · round-25 bfcache runtime sources (ScoutOpenS106, ScribeSOURCESRows). Question: what does the Chromium 154 build declare about the BackForwardCache feature default, and do the two bfcache rows C1 cites still hold? Query: none (no discovery search); bounded to three named URLs. Where: chromium.googlesource.com at tag 154.0.8037.97 (content/public/common/content_features.cc; third_party/blink/public/devtools_protocol/domains/Page.pdl) and web.dev/articles/bfcache. Identified 3, screened 3, included 3 (S106 opened; S104 and S105 re-opened, quotes held at lines 2531 and 1345), excluded 0. S104's digest drifted by 4 bytes (CSP nonce and app-loader config only, no article line); S105 decoded bytes are identical. Stop: the feature default (S106 lines 186-187) and the protocol discriminator (S105 line 1345) are each tag-pinned; whether a restore occurs is the round-25 receipt's question, not a source's.
- 2026-10-25 · round-25 on-release freshness reopening (ScoutFreshnessReopen, ExecFreshnessReceipt, ScribeSOURCESRows). Question: do the held quotes of six on-release rows (S013, S015, S016, S020, S023, S024) still appear in today's bytes? Query: none; six named URLs (playwright.dev ×5, webmachinelearning.github.io/webmcp/). Identified 6, screened 6, included 6 (all held, each quote located exactly once; no superseding row), excluded 0. All six bodies are byte-identical to the 2026-10-20 receipt digests, so freshness rests on this round's fetched_at, not on digest change; S020's anchor cell (f14762e6, 2026-10-16) still trails the served revision 51ed7565 (2026-10-20), recorded in the receipt per the round-18 moving-anchor precedent. Stop: every row resolves by a located held quote. Receipt: corpus/evidence/round-25/freshness/reopened.json.
- 2026-10-25 · round-25 assimilation candidate webmcp-devtools-agent-surface-r25 (ScoutAssimilationPrep, <re-grounding seat>). Question: can one shokuknow theme be adopted after re-grounding, the id-collision guard and quarantine? Where: /home/vgpnk/Projects/shokuknow/lanes/tabi/SOURCES-PROPOSED.md (staged S102-S249; 148 ids) and the absent-defect register slice (38 tabi ids, including S106 and S109). Identified <n>, screened <n>, included <n>, excluded <n>: <per-row reason>. Collision guard: staged ∩ lane = S102-S105, plus S106 once the lane appends content_features.cc; any adopted row is renumbered by document from S107 (or S108 if a conditional S020 correction lands). Stop: <verdict> — or "Assimilation: none — <reason>".
```

The `<…>` fields in the third line are deliberately left open. This seat did not observe the candidate's re-grounding or quarantine intersection, and ScoutAssimilationPrep.md:80 says it did not check it either. The L1 fills them from the deciding seat, or writes `Assimilation: none` with the reason.

## 5. Findings outside the drafts

- **Search-log gap (observed):** `rg -c "^- 2026-10-2[2-5] " corpus/SOURCES.md` → no match (0 lines). The search log has no entries for rounds 23–24, though S102–S105 were appended with opened date 2026-10-25. The sweep is the full file, 166 lines (`grep -c ''`). Backfilling is out of scope for this round's claims and is not drafted here.
- **Lead candidate (unopened, [INFERENCE]):** `content/public/common/content_switches.cc` at the same tag is where the `--disable-back-forward-cache` switch is presumably declared. It was not fetched (not a documented GET for this item). If the C1 entry cites the flag's meaning, open it first or keep it in `## Leads (unopened)`.
- **S104** (`recheck 90d`, not on-release) re-opened by ScoutOpenS106: the quote held at line 2531 and the digest drifted −4 bytes from page chrome only. No supersession, by the same moving-anchor precedent.

## Out of scope / not done

- No row was appended, no verdict was asserted for assimilation, and no non-author judgment was made. Every number above comes with the command that produced it.
- The census (`scripts/sources-census.sh validate`) and `scripts/check-sources.mjs` were not run. These are the L1's gates after integration.

Artifacts: `.ufo/waves/round-25/scratch/ScribeSOURCESRows/{S013,S015,S016,S020,S023,S024}.body`, `S106-content_features.body`, `S106-content_features.cc`, `S106-tagref.body`, `fetched-at.txt`.
