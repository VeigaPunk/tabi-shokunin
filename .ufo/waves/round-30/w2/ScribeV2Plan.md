# ScribeV2Plan — counter v2 plan for the next round (round 30 w2, scribe)

## Verdict

I attacked the three v2 counter predicates as they would naturally be written — `check-gate-mutants`
v2 (opaque run ids + killer attribution + catalogue extension), `check-frontier-admission` v2
(https-only production `--live`, same-host redirects, `curl -q`, calendar dates, single/curly-quote
spans, one-word floor), and `check-release-pins` v2 (DEPS-mapped population) — against the round-30
w1/w2 evidence and my own re-derivations at `072af95f…`. **Defect: all three drafts leak as first
written, and the plan now fixes each leak.** Six plan-level findings: (P1, medium) the natural
"killing case must be declared" rule reclassifies a genuine kill as unattributed because
`pins-f3-bytes-absent` kills by crashing at `check-release-pins.mjs:215` with `failing_cases: []`;
(P2, medium) attribution remains declaration-gameable and only a pre-freeze attack with declaration
rights covers it; (P3, high) naive straight-single-quote extraction false-refuses the two admitted
entries — I measured 20+ apostrophe artifacts up to 99 words — so boundary guards are mandatory;
(P4, high) C2 cannot be a count claim because 2/2 with `--live` is already reachable under v1 with
zero network via a `file://` receipt inside `unshare -Urn`, so the target is a 12-shape refusal set;
(P5, high) the round-30 lesson's "six" DEPS rows is stale at the tip — S118, added by this round's
`072af95f`, is the seventh, so the rule selects 30 ids, not 29; (P6, medium) `--receipt` cannot
point at next-round evidence because `BYTES_ROOT`/`REFETCH_ROOT` are constants at
`check-release-pins.mjs:71-72` used at `:209-210`. With those fixes the three claims are
mechanically falsifiable and each has a do-nothing and junk control that must read red; nothing was
built, so no v2 reading is claimed. Deliverable: `.ufo/waves/round-30/w2/ScribeV2Plan/plan.md`
(no lane edit, no SCORECARD landing).

## What was attacked and how

| draft | attack surface | evidence used |
|---|---|---|
| C1 v2 | the attribution clause against the measured kill set and the 22 beyond-catalogue mutants | `w1/CritC1Counter.md` §2-§5; `w2/MeasureC1Clean.md` (per-case kill matrix: max case concentration 2, `pins-f3-bytes-absent` failing set empty, `TypeError` at `:215`); `w2/MutC1Beyond.md` (15 survivors, 7 already killed) |
| C2 v2 | the count target against the round-30 defeaters; the quote extractor against the two admitted entries | `w1/SentinelFetchScope.md` F1-F6; `w1/CritC2Counter.md` F1-F13/R1-R4; my own span scan of `corpus/knowledge/{rate-limit-policy-fields,host-published-rate-limit-headers}.md` |
| C3 v2 | the population sentence against `corpus/SOURCES.md` at the tip | `w1/ScribePopulationRule.md`; `corpus/lessons/round-30.md` §Release-pin population rule; my re-derivation of 118/90/23/7/30 and the excluded buckets |

## Evidence (commands, exit codes, readings)

All in one `git clone --shared` of the lane at `072af95fe2822f0785a6ff88a578e2142dd258e5`,
`git status --porcelain` empty before and after; `TMPDIR=/fast/scratch/hyaku/tabi-r30/ScribeV2Plan/tmp`.

```
$ sha256sum scripts/{check-gate-mutants.mjs,gate-mutants.json,check-frontier-admission.mjs,check-release-pins.mjs,check-s106-evidence.mjs}   # exit 0
02945f88…3a55  check-gate-mutants.mjs          (= claims.json frozenDigests)
cd1c27a2…3833  gate-mutants.json               (= claims.json frozenDigests)
cadef57e…9eca  check-frontier-admission.mjs    (= claims.json frozenDigests)
915a6bba…4648  check-release-pins.mjs
85dfd5e0…5467  check-s106-evidence.mjs

$ node scripts/check-gate-mutants.mjs --selftest --json          # exit 0  cases=12 passed=12 ok=true
$ node scripts/check-frontier-admission.mjs --selftest --json    # exit 0  cases=24 passed=24 ok=true
$ node scripts/check-s106-evidence.mjs --selftest --json         # exit 0  cases=10 passed=10 ok=true
$ node scripts/check-release-pins.mjs --selftest --json          # exit 0  cases=29 passed=29 ok=true

$ node scripts/check-release-pins.mjs --repo "$S/clone" --rev HEAD --stable 156.0.8078.47 --json   # exit 0
population 23  resolved 23  unresolved 0  holds 16  drifted 7  clean true
ids: S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094
     S096 S097 S098 S099 S100 S105 S106

$ node scripts/check-frontier-admission.mjs --repo "$S/clone" --rev HEAD \
    --frontier rate-tos-signal --since 2026-10-26 --json        # exit 0, offline
population 2  admitted 2  failing 0  clean true

$ python3 population.py "$S/clone" 156.0.8078.47 "$OUT/population-v2.json"   # exit 0
118 registry rows; 90 on-release; v1 23; DEPS 7 (S036 S044 S068 S088 S089 S090 S118);
v2 30; excluded: at-stable 7, main-branch 3, non-chromium-host 50, malformed 0;
statuses inside the set: queued S080 S081 S088 S089 S090 S093 S098, rejected S094
```

Line evidence for the findings (frozen bytes at the tip):

- `check-release-pins.mjs:214` null guard, `:215` `sha256(ob)` — the crash site behind P1;
  `:71-72` constant roots, `:209-210` their use — P6; `:178` the population expression, `:121`
  13-cell drop, `:128` source-only tags — the rule P5 restates.
- `check-gate-mutants.mjs:142,148,152` run dir/cwd/env leak; `:203,215` role/index names; `:216`
  `killed = !res.clean`; `:220` `failing_cases` — the fields P1/P2 build on.
- `check-frontier-admission.mjs:174` scheme test, `:175` curl argv, `:180` `000` arm; `:84` date
  regex, `:253` `opened`; `:155-165` quote extractor; `:209` one-word floor; `:131` first-wins
  registry; `:240` unanchored `source:` extraction — P3/P4.
- `corpus/SOURCES.md:132` (S118, `on-release`, `mined`, `66df492…`, opened `2026-10-26`) — P5.

The `enum.py` → `population.py` rename after an exit-1 stdlib shadowing error is recorded in
`ScribeV2Plan/RECEIPTS.md`; no reading rests on the failed run.

## The plan's fixes (delivered in plan.md)

1. **C1 v2**: opaque `run-*` ids, neutral child cwd and allowlisted env
   (`PATH/HOME/TMPDIR/TMP/TEMP/LANG/GIT_CONFIG_*`), `chdir` before spawn; kill kinds `case`
   (non-empty `failing_cases` ⊆ declared `behavioural_cases`, ⊇ `expect_cases`) and `crash`
   (anchored `crash_frame`, line resolved at run time); `unattributed`,
   `crash_attributed`, `concentrated_cases` (threshold >3; today's max is 2); catalogue v2 adds all
   22 `MutC1Beyond` rows (15 new cases, 7 regression rows) and 20 benign twins → **target 49/49
   killed, 0/33 benign killed, 0 unattributed, 0 concentrated cases; s106 19/19, pins 35/35,
   counter selftest 18/18**. Controls: do-nothing → 15 survivors; B2 source-keyed table → all
   kills unattributed; declared source-keyed table → named residual, covered by the pre-freeze
   declaration attack; length fingerprint → 33 benign killed; undeclared crash → unattributed 1.
2. **C2 v2**: https-only production `--live` (internal `allowFile` selftest-only), same-host
   https-only redirects with `%{url_effective}`, `-q --no-netrc` first, `@` userinfo refusal,
   real calendar dates plus required `fetched_at`, head+body span extraction over
   `"…"`/`“…”`/`‘…’`/guarded `'…'` with no 600-char cap, emphasis/blockquote normalisation for
   spans, 4-word floor, duplicate-row refusal, anchored `source:` ids, start-only HTML sniff and
   unclosed-script strip, exact-URL `g2`/`g7` → **target: 2/2 admitted live (no false refusal) +
   42/42 selftest + all 12 holdout shapes refused with named reasons**. Do-nothing: v1 + the
   `file://` self-quote fixture admits 2/2 in `unshare -Urn` (count reachable without the work).
3. **C3 v2**: population = rule string + id set + `excluded` reasons; DEPS arm by source shape and
   `f7-deps` binding through committed `DEPS` blobs; receipt-carried `bytes_root` → **target
   population_ids = 30 (23 + S036 S044 S068 S088 S089 S090 S118), unresolved 0 at
   156.0.8078.47, excluded {7,3,50,0}**. Do-nothing: v1 23/23 exit 0 (target unmet); junk: no
   DEPS blobs, wrong mapping, copied old as new, tag laundering, 404 laundering, absolute
   `bytes_root` — each unresolved or refused.

## Touched surfaces

- Added (untracked): `.ufo/waves/round-30/w2/ScribeV2Plan/` (`plan.md`, `RECEIPTS.md`,
  `population-v2.json`, `population.py`, `frozen-sha256.txt`, the four self-test JSONs, the two
  counter baseline JSONs) and this report `.ufo/waves/round-30/w2/ScribeV2Plan.md`.
- No lane tracked file, lane git index, lane jj state, fleet repo, sibling lane, or
  `/home/vgpnk/Projects/shokuknow` was written. No commit anywhere. No counter was modified or run
  for a v2 reading.

## Out of scope / known limits

- No counter build, no SCORECARD landing, no claim freeze; the "planned" bullet text is for the
  planner to land.
- C2 wire-byte provenance (`wire_sha256`) and seat identity are not in v2; `l3` stays
  normalised-text equality (the dynamic vendor page makes byte identity a tradeoff).
- C1's declaration lie and the byte-fingerprint family cannot be closed mechanically; the
  pre-freeze attack with declaration rights is the only defence and is stated as such.
- C3 does not schedule the `main`-branch rows (S004 S028 S035) or the 50 non-chromium rows.
- Zero network fetches; no tool installed or upgraded.

## Findings summary for the canonical judge

| id | severity | claim affected | one line |
|---|---|---|---|
| P1 | medium | C1 | crash kill (`pins-f3-bytes-absent`, `:215`) has an empty failing set; needs `crash_frame` attribution |
| P2 | medium | C1 | declared behavioural set can be lied into; pre-freeze declaration attack is load-bearing |
| P3 | high | C2 | unguarded `'…'` extraction false-refuses both admitted entries (apostrophe artifacts) |
| P4 | high | C2 | count-only target already reachable under v1 with `file://` and zero network |
| P5 | high | C3 | lesson's "six" DEPS rows is stale: S118 makes seven; rule selects 30 ids at the tip |
| P6 | medium | C3 | `--receipt` cannot leave round-29 bytes (`:71-72`, `:209-210`); v2 needs `bytes_root` |

Artifacts:
`.ufo/waves/round-30/w2/ScribeV2Plan/plan.md`,
`.ufo/waves/round-30/w2/ScribeV2Plan/RECEIPTS.md`,
`.ufo/waves/round-30/w2/ScribeV2Plan/population-v2.json`,
`.ufo/waves/round-30/w2/ScribeV2Plan/population.py`.
