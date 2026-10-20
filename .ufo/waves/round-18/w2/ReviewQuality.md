VERDICT: ISSUES

# ReviewQuality — round 18 WAVE2 FALSIFY

Reviewed committed candidate `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (the lane's `refs/heads/master` and `HEAD` both resolved to that full ID). Scope is QUALITY 33–38, their round-18 Mistakes mappings, and the explicitly requested F6, receipt/index, and source-transition checks.

Full SHA-256 identities at the reviewed revision:

- `corpus/QUALITY.md` — `9c31b8046690966ecd9b8d54165697950292b5583e2cfed28a5179e3452d9c73`
- `.ufo/waves/round-18/measure-c1.mjs` — `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`
- `.ufo/waves/round-18/measure-c2.mjs` — `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6`
- `.ufo/waves/round-18/measure-c3.mjs` — `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a`
- `corpus/lessons/round-18.md` — `31b21b9a461a25b263c8a16f6453a7bc60d49f57157246760a45c325ac7b8a44`
- `corpus/README.md` — `d99c3953484378a0a2d389b208d666a62a7ce4080dc09fea69c1202df9ac9d26`
- `corpus/SOURCES.md` — `81f849da8c78c5e496b5d3973a6a4f47fb1823dfc163f2e5e80c8d845767fa55`
- `corpus/evidence/round-18/routed/adjacency-selftest.json` — `5207b8ff66ad298a7dfca8c030a70b9623ad73057f229f2ae6c41e15622dce6e`
- `corpus/evidence/round-18/routed/harm-at-93bfead.json` — `99134ebbdda47b9be5d92c97d65675974ec347f335e0f16a7fcbd2fb0af46721`
- `corpus/evidence/round-18/routed/harness-reruns/index.json` — `043ba4456bca22cad3156ed5eae75bf6c46743167b36303a930a2d48c755cc8a`
- `corpus/evidence/round-18/source-recheck/S001.json` — `dd8c58f5d5d7179939f2e8cf5c79a34eeda3e8a631072ac9261429f93798cd03`

## Findings (severity order)

### P1 — QUALITY 38 / C1 accepts a fabricated HTTP-source digest

`corpus/QUALITY.md:157-160` says source identity is bound and copied quotes from unrelated sources must not count. For HTTP rows, however, `.ufo/waves/round-18/measure-c1.mjs:328-360` only checks that `sha256` is 64-hex; unlike the S029 own-work branch at `:342-350`, it never compares that digest to retained source bytes. The only retained text is the excerpt. `liveCheck()` at `:380-434` re-fetches only under `--live` and checks quote presence, not the receipt's body digest; `countRevision()` counts accepted receipts independently at `:458-479`.

Falsification run: in a private `git clone --no-hardlinks` of the lane, changed S001's receipt `sha256` to 64 zeroes while leaving its row URL, fetch URL, quote, excerpt and excerpt digest intact. The derived private commit was `72c0a6ebbb17b263fc020fb8804077dc5861de18`; no lane file was changed. Exact command:

```text
node /tmp/tabi-r18-ReviewQuality-2-530f40a9/.ufo/waves/round-18/measure-c1.mjs 72c0a6ebbb17b263fc020fb8804077dc5861de18
```

Exit 0; stdout included `"c1_rows_rechecked":51`, `"rejected":[]`, `"live":null`, and `"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"`. Thus an invalid source-body digest contributes to the 51 count. Existing C1 self-test cases reject mismatched declared URLs and a forged S029 Git-object digest (`measure-c1.mjs:676-731`), but do not test an HTTP receipt whose claimed canonical URL has an unrelated/fabricated body digest. The row-to-fetch URL allowlist is useful but is not proof that the bytes came from that URL.

### P2 — QUALITY 37 / C3 validates the self-test output but not its required argv

The committed D3 receipt exists at `corpus/evidence/round-18/routed/adjacency-selftest.json:2-15`, with the correct `argv` at `:4`, exit 0, stdout, digests and producer identity. This is no longer merely a wave-report line. But `measure-c3.mjs:387-415` never reads or validates `receipt.argv`, despite QUALITY 37 requiring it (`corpus/QUALITY.md:154-156`).

Falsification: the private commit `72c0a6ebbb17b263fc020fb8804077dc5861de18` changed that field to `node scripts/check-adjacency.mjs --not-self-test` while retaining the other receipt fields and hashes. Exact command:

```text
node /tmp/tabi-r18-ReviewQuality-2-530f40a9/.ufo/waves/round-18/measure-c3.mjs 72c0a6ebbb17b263fc020fb8804077dc5861de18
```

Exit 0; stdout returned `"c3_routed_closed":5` and `d3:{"pass":true,"why":"adjacency_selftest_verified"}`. The current receipt's argv is correct; the gap is that the counter does not enforce it.

The rule is also broader than the D3 receipt. At REV, C1/C2/C3 counter self-test results and the freshness-wrapper self-test are recorded in wave reports (`.ufo/waves/round-18/w1/C1Counter.md:12-17`, `C2Counter.md:12-19`, `C3Counter.md:8-12`, `C2FreshWrapper.md:6`), not in separate `corpus/evidence/` self-test receipts. In addition, C1Counter's committed report says “Exact output (15 cases)” at `C1Counter.md:14-17`; running the REV counter in the private clone produced 24 passing cases (`allPass:true`, exit 0). That report is not producer/revision-bound and its case count is stale. If QUALITY 37 is applied as written, these remain wave-only self-test claims.

### P2 — QUALITY 33 / D4 only catches the exact “individual publisher” phrase

QUALITY 33 claims a superseding row removes the falsified premise from every cell (`corpus/QUALITY.md:140-142`), grounded in the stale-premise Mistake (`corpus/lessons/round-18.md:83`). D4 loops across S058's cells, but `measure-c3.mjs:455-470` rejects only the literal regex `/individual publisher/i` and then checks that `teaches` names Google Ireland, Ltd. It does not detect a rephrased false publisher attribution in another cell.

Falsification: in the private clone, the scope cell was changed from “Listing prerequisites …” to “Listing publisher François Beaufort; prerequisites …” (contradicting the roles recorded in `corpus/SOURCES.md:72`), without changing the exact phrase searched by D4. The derived private commit was `6689c42d3ed67040f03385ac2e786c86da4e65cd`. Exact command:

```text
node /tmp/tabi-r18-ReviewQuality-2-530f40a9/.ufo/waves/round-18/measure-c3.mjs 6689c42d3ed67040f03385ac2e786c86da4e65cd
```

Exit 0; stdout returned `"c3_routed_closed":5` and `d4:{"pass":true,"why":"S058_supersession_verified"}`. The S058 row at REV is correctly worded; this is a concrete regression hole in the claimed all-cell premise sweep.

### P2 — QUALITY 34 / D1 does not enforce the required counting command

The current correction includes the command and six (`corpus/lessons/round-18.md:55-60`), and the round-18 Mistake is number-drift (`:80`). But `measure-c3.mjs:267-296` derives the sibling count and checks the correction line's count/citations; it does not inspect or require the counting command.

Falsification: private commit `72c0a6ebbb17b263fc020fb8804077dc5861de18` removed the “Counting command” text at lesson lines 58-59 while leaving the count and both citations. The C3 command/output shown under QUALITY 37 above still returned `c3_routed_closed=5`, with `d1:{"pass":true,"why":"correction_line_verified"}`. The current prose is correct, but the counter does not enforce QUALITY 34's command requirement.

### P2 — QUALITY 36 / D5 ignores whether reruns are called new or falsely called recovered

The current index accurately labels its executions as new and says the lost bytes were unrecoverable (`corpus/evidence/round-18/routed/harness-reruns/index.json:8`; also `corpus/lessons/round-18.md:73-74`, `corpus/README.md:381-382`). However, `measure-c3.mjs:478-580` verifies run files, full digests, producer identity, exits, verdicts and cases, but never reads `index.note` or checks the new-versus-recovery qualification required by QUALITY 36 (`corpus/QUALITY.md:151-153`).

Falsification: the same private commit changed the note to “These recover the original lost round-17 /tmp outputs.” With the receipts otherwise unchanged, the C3 command returned `d5:{"pass":true,"why":"7_reruns_verified"}` and 5/5. This is an honest current index with an unenforced anti-mislabeling rule, grounded in the round-18 landing Mistake (`corpus/lessons/round-18.md:84`).

## Checks that held / requested scope

- QUALITY 35 is implemented for the routed harm receipt: `measure-c3.mjs:165-230,306-368` derives the complete 20-gate set, exact argv and gate-script hashes from `93bfead1f5f25f584353df3152a60209bbd89a2e`, binds the runner at the measured revision, and checks the receipt revision. At REV, `node /tmp/tabi-r18-ReviewQuality-2-530f40a9/.ufo/waves/round-18/measure-c3.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` exited 0 with `c3_routed_closed=5` and all d1–d5 true. Its self-test exited 0 (`selfTest:"pass"`, 26 cases), including wrong-revision and 19-gate rejection cases (`measure-c3.mjs:864-872`). The full harm receipt SHA-256 is listed above.
- C1 at REV: `node /tmp/tabi-r18-ReviewQuality-2-530f40a9/.ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` exited 0; stdout reported `c1_rows_rechecked=51`, `eligible_rows=58`, `held=50`, `drift_superseded=0`, `own_work=1`, `rejected=[]`, `live=null`, and counter digest `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Its self-test exited 0 with 24 passing cases, including unrelated declared URL rejection and exact S029 Git-object pinning. No `--live` re-fetch was run.
- C2 at REV: `node /tmp/tabi-r18-ReviewQuality-2-530f40a9/.ufo/waves/round-18/measure-c2.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` exited 0 with `c2_hazards_closed=6`; H1–H4, S1 and F6 all passed. It selected `scripts/webmcp-invoke-round18.mjs` (artifact SHA-256 `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`), counter SHA-256 `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6`, and receipt SHA-256 `08e287b5d6b3c60648cdf98d0b04bd1095cbf8a588e261050989cd266e5bbfc5`. Its F6 output was wrapper-scoped: `--rev HEAD exit=2`; poison detached HEAD `5884df4ec53a4682ab91be6b630e26df8e68ba27`; `refs/heads/master=530f40a9bc3f10436161a2af1ca0fe9bffffc004`; `--dry-run exit=0` printed the master hash. The output explicitly says the frozen `scripts/check-freshness.mjs --witness HEAD` remains directly callable. This matches `corpus/README.md:386-387` and `w1/C2Counter.md:10`: **no global F6 closure is claimed**. The browser probe used the harness's fixture-owned 127.0.0.1 server (`scripts/webmcp-invoke-round18.mjs:65,613-617,1352-1353`), not a real site. The harness explicitly scopes its network claim and does not claim global host no-egress (`:2701-2706`).
- README/corrections counts: `corpus/README.md:378-382` points to both superseded round-17 lines and states six; the round-18 correction is at `corpus/lessons/round-18.md:55-60`. Independent parser over the committed M17 `corpus/adjacency.tsv` returned `siblings=6 values=kagi,kaidoku,kake,kama,kumitate,revenger`. At REV, a Git-tree/README mapping check returned `{"knowledgeFiles":36,"uniqueReadmePointers":36,"missing":[],"dangling":[]}`; old 33/34 counts in README `:289` and `:318` are round-16/17 snapshots, while round 18 adds two note rows at `:373-376`.
- Source rows: at REV the committed registry has 64 rows (mined 48, queued 8, rejected 8), consistent with 57 at baseline plus S058–S064. `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exited 0 and printed `tabi W04 S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes` followed by `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`. The W04 is a nonfatal duplicate-URL warning for retained/superseding scopes.
- `git diff --numstat 2bff864fdfee684ddbcd066cc8e735adaba2735c 530f40a9bc3f10436161a2af1ca0fe9bffffc004 -- corpus/SOURCES.md` returned `9 0 corpus/SOURCES.md`; `git diff --unified=0` showed additions only: seven new rows S058–S064 and two new search-log rows. There are no deleted/rewritten baseline source rows and no undocumented in-place status/recheck/used-by transition. This agrees with `corpus/lessons/round-18.md:48-51`.
- No scalar promotion or saturation claim was found: the plan has no scalar promotion, and the lesson explicitly defers depth 8 rather than calling it saturated (`corpus/lessons/round-18.md:88-92`). The D5 rerun identity is also correctly kept on the round-17 harness digest `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`, not silently rerouted to the round-18 runtime.

## Verification gaps and residual risk

- The `lsp` device is unavailable: `read xd://lsp` returned “No such tool” and listed mounted devices without an LSP device. Therefore no LSP status/references/definition/diagnostics were available. Literal `grep` searches were used only to locate fixture/self-test text, not as semantic proof.
- C1 `--live` was not run; the reported C1 count is a receipt-date/cohort count (`freshness_scope` says round-18-only), not proof that all HTTP sources still serve those quotes today.
- The lane worktree changed after review began: `git diff --name-only 530f40a9bc3f10436161a2af1ca0fe9bffffc004 -- <reviewed paths>` listed only `.ufo/waves/round-18/measure-c3.mjs`; a `git diff --quiet` check therefore exited 1. All C1/C2/C3 probes and mutation tests above used the private clone at the committed REV, not this divergent worktree file. No lane Git/JJ writes were made. The private clone and its two test commits were removed after probing.
- No tools were installed or updated.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ReviewQuality.md
