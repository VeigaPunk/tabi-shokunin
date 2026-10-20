VERDICT: ISSUES

C1 source-recheck attack, S028 and S029, at measured revision
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`), lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, 2026-10-20.

The S028 receipt's factual values are honest: my live re-fetch returns the same HTTP
status, byte count and sha256 as the receipt; the served `main` body is byte-identical
to commit `9bb1a1e`; the row's taught block is present and supports the operative
teaches; there is no drift. The issues are evidential, not factual: the receipt's
committed quote is from a different claim surface than the row's anchor/teaches, the
committed excerpt excludes the taught block, and the C1 counter cannot distinguish a
true teaches from a false one or a real body digest from an arbitrary 64-hex value.
S029 is correctly bound; its only defect is that it is an immutable own-work blob
counted inside the 51-row "live source" target, while the counter itself separates it.

## 1. S028 fetch identity — held

Receipt: `corpus/evidence/round-18/source-recheck/S028.json` (row `S028`, rowUrl
`https://github.com/chromium/chromium/blob/main/chrome/browser/devtools/remote_debugging_server.cc`,
fetch URL raw.githubusercontent.com, decode `none`, fetchedAt `2026-10-20T19:08:05.538Z`).

Re-fetch (2026-10-20 ~20:02Z), exact command:

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabi-r18-s028-Zb0B/body \
  -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc'
```

Observed: `HTTP=200 SIZE=3997 URL=https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc`;
exit 0. `SIZE=3997` is the compressed wire size; decoded body is 15057 B.
`sha256(body) = ea72757acd7c3bff419db92bf5be101256c1bc813fcb87174a401fc8856901cc`,
equal to `S028.json:10` and to `S028.json:9` (`bytes: 15057`).
The body fetch returned exit 0. A separate HEAD to the same URL at 20:05:20Z showed
`HTTP/2 200`, `content-type: text/plain; charset=utf-8`, `date: Tue, 20 Oct 2026
20:05:20 GMT`.

Pinned-revision probe (same URL bounds at commit `9bb1a1e`):

```
curl -sSL --compressed --max-time 90 -A '<same UA>' \
  -o /tmp/tabi-r18-s028-Zb0B/pinned9bb \
  'https://raw.githubusercontent.com/chromium/chromium/9bb1a1e18b5ac9c29103056f91a30897b32367b0/chrome/browser/devtools/remote_debugging_server.cc'
```

Observed: HTTP 200, 15057 B,
`sha256 = ea72757acd7c3bff419db92bf5be101256c1bc813fcb87174a401fc8856901cc`,
`cmp` with the `main` body: identical. So the served `main` content equals the file at
`9bb1a1e`, not merely "some commit on main".

GitHub API confirmation:

```
curl -sS --max-time 60 -H 'Accept: application/vnd.github+json' \
  'https://api.github.com/repos/chromium/chromium/commits?path=chrome/browser/devtools/remote_debugging_server.cc&sha=main&per_page=3'
```

Observed first entry: `9bb1a1e18b5ac9c29103056f91a30897b32367b0`,
`2026-10-05T04:25:50Z`, `[dcheck-to-check] Convert DCHECKs in chrome/browser/ [9/25]`.
This matches `S028.json:20` (`anchorObserved`). The row's recorded digest
`ea72757a…01cc` also matches S004's historical record at
`corpus/knowledge/chrome-remote-debugging-profile-boundary.md:87` and
`corpus/lessons/kaika-fleet-round-1.md:47`. Identity and anchor: **held**.

Build boundary: the `main` body contains three `CHECK(..., base::NotFatalUntil::M161)`
lines (body:272,302,372) that are not in tag `154.0.8037.97`. Fetch of
`https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/chrome/browser/devtools/remote_debugging_server.cc`
returned HTTP 200, 14979 B,
`sha256 9279d6f59241d780e02307975ee1fbfd2e95a8294547b32f73a926314d81d15d`;
`diff -u` shows only the three `DCHECK`→`CHECK` hunks at 269/299/369. The quote
lines 113-114 and the taught block 169-180 are in identical regions. Thus the
`@main` citation is a branch, not the host's 154 build, but the taught mechanics are
unchanged at that tag. The row itself labels the host behavior "inference from source,
never observed by a launch" (`corpus/SOURCES.md:42`), so this is not a product claim.

## 2. F1 (medium) — the receipt's quote does not support the row's teaches, and the excerpt excludes the taught block

Paths and locations:

- `corpus/evidence/round-18/source-recheck/S028.json:13` quote:
  `Prefers a free port over switching from IPv4 to IPv6.`
- `S028.json:15` quoteSource: `corpus/lessons/round-12.md:47` (the round-12 Gate
  table row for S028; same sentence).
- `S028.json:22` note, in the seat's own words: "Teaches held: :169-177 enable the
  refusal under GOOGLE_CHROME_BRANDING ... Quote is the :113-114 port-fallback
  comment." So the receipt itself does not claim the quote supports the teaches.
- `corpus/SOURCES.md:42` S028 row: anchor `.cc:169-177`; scope "Enforcement mechanics
  of the default-data-dir refusal; branding and OS gating"; teaches
  `supersedes S004 — the source shows the check compiled only under GOOGLE_CHROME_BRANDING ...`.
- Body locations: quote at lines 113-114
  (`// Creates a server socket ... // is busy. Prefers a free port ...`);
  `#if BUILDFLAG(GOOGLE_CHROME_BRANDING)` at 169; `constexpr bool
  default_user_data_dir_check_enabled = true;` at 170; `#else` / runtime flag at
  171-173; fail-closed `if (default_user_data_dir_check_enabled &&
  is_default_user_data_dir.value_or(true))` at 176-177; `#endif` at 181.
- Excerpt coverage: normalized quote offset 3815 (matches `S028.json:17`);
  excerpt is `[3215, 4468)` after normalization. `GOOGLE_CHROME_BRANDING` first
  occurs at normalized offset 5294, and `is_default_user_data_dir.value_or(true)`
  at 5554. Both are outside the committed excerpt. The excerpt is 1254 B and its
  sha256 `e252d1084c1c2d04e6ee28f4cfcacaca07a222cbb8067ac2b6021f08e989ba59`
  matches `S028.json:19` and `excerptSha256`; I also re-derived the producer's
  window from the live body and it is byte-equal. So the excerpt is internally
  correct but covers only the port-fallback class comment.

Finite counterexample (the taught block can be deleted and the quote rule still
passes). From a copy of the live body I removed lines 169-180 (the
`#if GOOGLE_CHROME_BRANDING` block through its closing `#endif`, including the
fail-closed `if`), replacing it with a comment. Result:

- mutant bytes 14642; sha256
  `11a2fbe70da3e62ecf16614313fe8a3e7c939388e4ac713f0478d84565ad97c2`;
  `grep -c GOOGLE_CHROME_BRANDING` = 0.
- `node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none
  --body <mutant> --quote 'Prefers a free port over switching from IPv4 to IPv6.'`
  → `{"found":true,"offset":3815,"normalizedLength":13449,...}`, exit 0.

So a body in which the row's taught refusal does not exist still satisfies the
receipt's quote rule. The committed quote is a valid sentence from the same file,
but it is not evidence that the row's teaches survives. This is exactly the
`record-12` port-fallback use of S028 (`corpus/knowledge/source-recheck-round-12.md:18-22`),
a separate claim, not the SOURCES S028 teaches. The seat report
`.ufo/waves/round-18/w1/Recheck14.md:22-28` does document a real check of
`:162-183`, so the teaches is not merely asserted; but that check is not bound by
the receipt's committed quote/excerpt, and the C1 counter never reads it.

## 3. F2 (medium) — the C1 counter accepts an arbitrary body digest and a deliberately false teaches cell

Counter at REV, committed-input path (no `--live`):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed (single line):
`{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{...},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}`.

`held:50` excludes own-work; `own_work:1` is S029; `c1_rows_rechecked:51` includes it.
`eligible_rows:58` is REV-scoped (64 rows less the 6 superseded), while the target 51
is baseline-scoped (`PLAN.md:15-16`); S058–S064 have no receipts by design.

Sandbox mutant 1 — zeroed body digest. Private clone only:

```
git clone --quiet --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-s028sb-Wq5V/lane
cd /tmp/tabi-r18-s028sb-Wq5V/lane
node -e 'const fs=require("fs");const p="corpus/evidence/round-18/source-recheck/S028.json";const r=JSON.parse(fs.readFileSync(p,"utf8"));r.sha256="0".repeat(64);fs.writeFileSync(p,JSON.stringify(r,null,2)+"\n")'
git -c user.name=probe -c user.email=probe@invalid add corpus/evidence/round-18/source-recheck/S028.json
git -c user.name=probe -c user.email=probe@invalid commit --quiet -m 'probe: S028 sha zeroed'
git rev-parse HEAD
node .ufo/waves/round-18/measure-c1.mjs --lane "$(pwd)" e48fc7ee5a9e0bc0c31d8d01c7bf53b904f379b5
```

Observed `git rev-parse HEAD`:
`e48fc7ee5a9e0bc0c31d8d01c7bf53b904f379b5`.

Observed: `{"c1_rows_rechecked":51,"held":50,"own_work":1,"rejected":[],
"s028Rejected":false}`. For HTTP rows, the counter's only digest check is
`measure-c1.mjs:330` (`sha256 is not 64-hex`); it never recomputes the HTTP body.
`--live` would refetch (`measure-c1.mjs:380-434`), but its only content check is the
quote (`:428-429`), not the sha, bytes, or teaches.

Sandbox mutant 2 — false teaches. In the same clone I ran
`git checkout -- corpus/evidence/round-18/source-recheck/S028.json`, replaced the
S028 teaches cell in `corpus/SOURCES.md` with
`PROBE-FALSE: the default-data-dir refusal is enabled by default on unbranded Chromium`,
ran `git add corpus/SOURCES.md`, and committed
`2afe24b120c1b376b03f627e406ca71ee9cde82f`. Observed:
`{"c1_rows_rechecked":51,"held":50,"rejected":0,"s028Rejected":false}`. The counter
reads `teaches` only to test the `drift` superseding-row rule (`measure-c1.mjs:337-339`);
it never compares `teachesVerdict` to the cell content. Therefore `held:50` is a count
of self-reported strings, not of verified teaches. The round's note says this in
`corpus/knowledge/source-recheck-round-18.md:140` ("does not show that the row's
`teaches` claim is correct, that the quote supports it"), but `PLAN.md:15` says
"Source rows re-verified against their live source with a committed recheck receipt"
and the counter field is named `held`; neither carries the qualifier.

This is a contract/claim defect, not evidence that the committed S028 receipt is
forged: its sha matches my live fetch exactly. The defect is that the counting path
cannot tell an honest receipt from a mutated one, and the claim wording reads stronger
than the probe.

## 4. F3 (low) — the SOURCES teaches cell's "compiled only under GOOGLE_CHROME_BRANDING" is literally false; the receipt note corrects it in free text

`corpus/SOURCES.md:42` says "the check compiled only under `GOOGLE_CHROME_BRANDING`".
The body shows the outer `#if BUILDFLAG(IS_WIN) || BUILDFLAG(IS_MAC) || BUILDFLAG(IS_LINUX)`
at 168, the branding `#if` at 169-170, the unbranded `#else` runtime flag at 171-173,
and the fail-closed `if` at 176-177. The check is compiled on all desktop builds; only
the default-enabled value is branding-conditional. The seat's report
`.ufo/waves/round-18/w1/Recheck14.md:26-28` says exactly this and calls
"compiled only under" shorthand for "enabled by default only under". The receipt note
`S028.json:22` is more precise ("enable the refusal under GOOGLE_CHROME_BRANDING").
The operative conclusion (unbranded default false; test-only setter at 291-294) holds,
so this is a record-wording correction, not source drift and not a reason to open a
superseding row. No cell was changed at REV; the S028/S029 rows are unchanged from B
(`git diff -U0 B REV -- corpus/SOURCES.md` adds only rows S058–S064 plus two
search-log lines; no existing row is modified).

## 5. S029 — held and correctly bound; own-work is separated by the counter but included in the 51 target

Receipt `corpus/evidence/round-18/source-recheck/S029.json`, row
`corpus/SOURCES.md:43`, own-work path `corpus/evidence/round-13/aria/receipt.json`.

```
git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json
```

Observed: 97073 B, sha256
`b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`,
equal to `S029.json:10` and `bytes` (`:9`). At REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` the same path has the same sha256
(`git show 530f40a:... | sha256sum`), so the receipt's "byte-identical at lane tip
2bff864" (`S029.json:20`) is still true at the measured revision.

Quote: 17 words, normalized offset 74695, exactly `S029.json:17`; the producer's
`[offset-600, offset+len+600)` window is byte-equal to the committed 1382-B
`S029.excerpt.txt`, sha256
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`
(`S029.json:19`). Parsing the pinned blob confirms the quote
supports the teaches: `cleanup.server.listeningAfter = true`,
`cleanup.server.perWorker[0].listeningAfter = false`,
`runtime.node = "26.12.0"`, `pin.node.recorded = "24.21.0"`,
`pin.node.minimumMajor = 20`. No new runtime observation is claimed; the receipt and
note say so.

Immutable-versus-live: the counter at REV reports `held:50, own_work:1,
c1_rows_rechecked:51`. `held` deliberately excludes own-work
(`measure-c1.mjs:467`), and the lesson says "Own-work S029 is explicitly hygiene, not
live freshness" (`corpus/lessons/round-18.md:14`). So the metric does not confuse the
two. The PLAN's one-line target (`PLAN.md:15-16`, "51 = every row not superseded at
B", "re-verified against their live source") does: 51 = 50 live/HTTP receipts plus 1
immutable git blob. The accurate sentence is "50 live rows + 1 own-work blob"; the
note's §6:147 says this, but the claim line does not.

## 6. What the claims can and cannot say

- S028 source identity: held; live fetch 2026-10-20 20:02Z equals the 2026-10-19
  digest and the 9bb1a1e revision byte-for-byte.
- S028 teaches: held in the live body at 169-181 and at tag 154.0.8037.97; the
  row's conclusion (unbranded default false, branded constexpr true, fail-closed on
  absent data) is supported. The literal "compiled only under" wording is not.
- S028 receipt as committed evidence for the teaches: not sufficient. The quote is
  the :113-114 port-fallback comment; the excerpt ends before the taught block; the
  teaches check exists only in the seat's committed free-text report and receipt note.
- C1 count: `c1_rows_rechecked:51` is a count of receipt files accepted by a
  schema/URL/quote/excerpt check, not a count of teaches verified. The counter can
  accept a zeroed digest and a false teaches cell (sandbox mutants above). The note's
  §6:140-141 discloses this; the PLAN's claim line and the `held` field name do not.
- Immutable availability vs live product freshness: the S028 source is a living
  `main` branch; the digest pins one response, and this response equals an immutable
  commit. That is source availability/stability, not a product observation: no browser
  was launched and no Chromium build was run, and the row itself calls the host
  behavior an inference. The S029 row is an immutable blob and is counted as
  own-work, separately from the 50 live holds. The only one-row conflation is the
  PLAN's 51 target including S029 under the words "live source"; the counter output
  and the lesson disclose the split.

## 7. Limits of this attack

- Only S028 and S029 were audited; the other 49 receipts were not.
- I did not run `measure-c1.mjs --live` (it would refetch all 51); I ran the
  committed-input counter at REV and direct S028/S029 fetches.
- The GitHub commits API is one public endpoint; the stronger identity check is the
  direct pinned-revision fetch equality (done).
- The tag-154 comparison covers this file only; it does not prove the host binary's
  build flags or behavior. The row itself disclaims a launch observation.
- The sandbox mutations prove counter semantics, not that the committed S028 receipt
  is forged; the committed sha matches the live body.
- No browser, runtime, product, or network service other than public-source GETs was
  used. No tool was installed or upgraded; no pacman transaction; no host service
  restart. No Git write occurred in LANE; all clone/commit probes ran under
  `/tmp/tabi-r18-s028sb-Wq5V` and were removed after recording. The lane's tracked
  tree was not modified; the only untracked path remains `.ufo/waves/round-18/w2/`,
  which contains this report and peer files.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS028.md
