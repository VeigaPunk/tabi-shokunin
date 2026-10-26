# CritClaimVerdicts — receipts

Seat: critic. Attacks the verdicts a round-30 L1 may report for C1 and C2, given the two
wave-1 counter holes. Measured revision: `072af95fe2822f0785a6ff88a578e2142dd258e5`
(clean `git clone --shared` at `/fast/scratch/hyaku/tabi-r30/CritClaimVerdicts/clone`,
`git status --porcelain` = 0 bytes before every run). No lane, fleet or source-repo write.

## Frozen bytes at the measured rev

```
$ sha256sum clone/scripts/check-gate-mutants.mjs clone/scripts/gate-mutants.json \
    clone/scripts/check-frontier-admission.mjs
02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  …/check-gate-mutants.mjs
cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  …/gate-mutants.json
cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca  …/check-frontier-admission.mjs
```
All three equal `claims.json:frozenDigests`.

## C1 — frozen counting command, exactly as written in claims.json

Run from the clone root (no `--repo`), `TMPDIR` under `$HYAKU_SCRATCH`:

```
$ node scripts/check-gate-mutants.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --json
exit=0
{"fault_total":27,"fault_survivors":0,"benign_total":13,"benign_killed":0,"clean":true,
 "counter_sha256_at_rev":"02945f88…","catalogue_sha256":"cd1c27a2…"}
gates: s106 cases=10 passed=10 exit=0 pristine_clean=true
       release-pins cases=29 passed=29 exit=0 pristine_clean=true
```
Raw: `c1-exact-cmd.json` (identical second run with `--repo clone`: `c1-072af95.json`).

```
$ node scripts/check-gate-mutants.mjs --selftest
GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12        exit=0
```

### Kill attribution (`failing_cases` per fault, from `c1-exact-cmd.json`)

26 of 27 faults are killed by a named case; every killing case asserts a field, a refusal
reason, or an unresolved count built from a fixture (`scripts/check-s106-evidence.mjs:359-363`
`out[c.field] === c.fieldValue`; `scripts/check-release-pins.mjs:491-493` exit + unresolved +
`reasons` pinned in order). No added line in `38891ca0` reads `process.cwd()`, `process.ppid`,
`process.env`, `/proc/`, `import.meta.url` or a git blob (grep over the two gate files and
over the commit's added lines: zero hits).

One fault has no case: `pins-f3-bytes-absent` — `cases:null, passed:null, failing_cases:[],
exit:1`. Reproduced by applying the catalogue mutation in a scratch clone:

```
$ perl -0777 -i -pe 's/if \(ob === null \|\| nb === null\)/if (false)/' clone-mut/scripts/check-release-pins.mjs
$ node scripts/check-release-pins.mjs --selftest
exit=1
TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string or an instance of
Buffer, TypedArray, or DataView. Received null
```
Raw: `mut-f3.stderr`. Negative control: the same fault is a survivor at the freeze
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/measure/c1-before-at-freeze.json`,
`fault_survivors 14`, includes `pins-f3-bytes-absent`), so the new
`f3-old-bytes-never-committed-unresolved` fixture is its proximate cause — but the kill is a
gate abort, not a case.

## C2 — frozen counting command, exactly as written in claims.json

```
$ node scripts/check-frontier-admission.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 \
    --frontier rate-tos-signal --since 2026-10-26 --live --json
exit=0
{"population":2,"admitted":2,"failing":0,"clean":true}          # c2-exact-cmd.json

$ node scripts/check-frontier-admission.mjs --selftest
FRONTIER_ADMISSION_SELFTEST verdict=clean cases=24 passed=24   exit=0
```

### No-network negative control (the `--live` arm must depend on the wire)

```
$ unshare -Urn env TMPDIR=… node scripts/check-frontier-admission.mjs --rev 072af95… \
    --frontier rate-tos-signal --since 2026-10-26 --live --json
exit=1
{"population":2,"admitted":0,"failing":2,"clean":false}          # c2-nonet.json
```
The honest receipts fail `l1-live` with no network, so the passing reading is not a `file://`
pass (the wave-1 F1 hole is not in play). The same namespace run was shown by wave 1 to leave
a `file://` fixture at 2/2.

### Receipts at the tip (read from the clone)

| row | url | fetched_by / seat | fetched_at | HTTP | bytes | sha256 |
|---|---|---|---|---|---|---|
| S116 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | FetchS159 | 2026-10-26T06:39:52Z | 200 | 67097 | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| S116 refetch | same | ScribeEntryRateLimitFields | 06:40:26Z | 200 | 67097 | d6016dd0…d412 (byte-identical) |
| S117 | https://docs.discord.com/developers/topics/rate-limits | FetchS182 | 06:40:02Z | 200 | 408912 | b73dc7d190db10ff53213ff30e288a6d1ddbd8febf5756664fa5a8cb9f0583c3 |
| S117 refetch | same | ScribeEntryDiscordHeaders | 06:40:32Z | 200 | 408912 | c1c2d3f9d619c9397070bb93bf8595ea51f655b687e345654f4292cfbfd4b2f3 |

Both receipt urls are `https://` and equal their rows' `source` urls (`SOURCES.md:130-131`).

## My own read-only HTTPS GETs (network receipt)

All GETs, no credentials, cookie jar or session material; user agent
`tabi-r30-critic-readonly/1`; `curl -L --max-redirs 5`, effective url recorded.

| UTC | url | HTTP | bytes | redirects | effective url | sha256 |
|---|---|---|---|---|---|---|
| 2026-10-26T07:47:49Z | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 200 | 67097 | 0 | same | d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412 |
| 2026-10-26T07:47:49Z | https://docs.discord.com/developers/topics/rate-limits | 200 | 408912 | 0 | same | a386e31505b3a24bb823c3ad275e91068c5eee528f6c2d7e4a693233d8932272 |
| 2026-10-26T07:48:27Z | …/draft-ietf-httpapi-ratelimit-headers-09.txt | 200 | — | — | same | — |
| 2026-10-26T07:48:27Z | …/draft-ietf-httpapi-ratelimit-headers-10.txt | 200 | — | — | same | — |
| 2026-10-26T07:48:27Z | …/draft-ietf-httpapi-ratelimit-headers-11.txt | 200 | — | — | same | — |
| 2026-10-26T07:48:27Z | …/draft-ietf-httpapi-ratelimit-headers-12.txt | 404 | — | — | same | — |

S116: third fetch byte-identical to the committed bytes and to the committed refetch.
S117: all three fetches are 408912 B; `diff` of the committed refetch against my fetch shows a
single changed run — the Cloudflare `window.__CF$cv$params={r:'…',t:'…'}` nonce/timestamp
(`out/net/01474848.body`). So the raw-byte drift is request-scoped, and the committed bytes
carry a per-response nonce a re-expression could not have. Normalised text is identical
(counter `l3-live` passes).

Both receipt quotes are 25 words and located in my 07:47:49Z fetch (checked in
`quote-audit.py` output and by direct substring test).

## Independent entry quote audit (broader than the counter's `entryQuotes`)

`quote-audit.py clone` → `quote-audit.txt`, exit 0. It extracts every quoted span of ≥4 words
from both entries — double, curly-double, single, curly-single, including the title line and
fenced blocks — and tests it against the entry's own cited bytes and the sibling row's bytes.

```
SUMMARY unlocated_spans=4
```
All four are apostrophe artefacts of the single-quote regex (`server's quota …`, `page's t …`),
not real quoted spans; every genuine span is `OWN` (none `SIBLING-ONLY`, so no cross-row
misattribution of the M1 class). S116 anchor lines hold: 302 `3.  RateLimit-Policy Field`,
308-311 the quoted passage, 432 `4.  RateLimit Field`, 444 the `RateLimit: "default";r=50;t=30`
example.

## noHarm readings at the tip (independent runs)

```
$ node scripts/check-selfassessment.mjs --rev 072af95… --json   exit=0  mismatches=0
      counted=[]  couldNotEvaluate=124   -> "mismatches 0" attests nothing about the tallies C1 changed
$ node scripts/check-gate-registry.mjs --rev 072af95…           exit=0  rows=36 gates=20 nonconformant=0
$ node scripts/check-release-pins.mjs --rev 072af95… --stable 156.0.8078.47
      exit=0  population=23 resolved=23 unresolved=0 holds=16 drifted=7
$ node scripts/check-s106-evidence.mjs --rev 072af95…           exit=0  valid=true
$ sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
      exit=0  19 × W04 duplicate-url warnings, then "tabi ok …/corpus/SOURCES.md"
```
The tallies C1 changed are restated in `SCORECARD.md:1507-1508` (10/10 and 29/29) and match my
measured 10/10 and 29/29.

## Tooling

No install, upgrade or host transaction was made or needed (node 24.21.0, python 3, curl,
unshare already present). No `pacman` call.
