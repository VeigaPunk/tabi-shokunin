# CritMatrixAddendum — round 32 w2 (falsify): matrix dated correction, 2026-10-26 block

**Verdict.** The appended block `corpus/knowledge/webdriver-bidi-capability-matrix.md:168-261` keeps
every earlier byte — the change from `4181fff` to `b234a58` is additions only (`95 0` numstat, and
the base blob's sha256 equals the sha256 of the new blob's first 19 304 bytes), every line reference
it makes into the earlier bytes (`:10`, `:54-76`, `:56`, `:60`-`:76`, `:80`, `:81-82`, `:82-83`,
`:100-107`, `:157-161`) resolves to the text it names, and each of its sixteen `yes` cells plus the
R16 refusal describes the frozen counter's actual predicate and the entry's table row. It does
**not** contradict §3 or the round-13 correction in substance. Two statements do not hold: the block
cites the round-13 correction as R12's authority (`:247-249`) while leaving that correction's fourth
bullet (`:157-161`, "the body within that collector's `max encoded item size`") contradicted at
runtime with **nothing anywhere in the corpus recording the contradiction** (medium), and its closing
§Rejected sentence (`:256-259`) asserts a conjunctive flip condition is "met for the sixteen rows …
not for the three contracts named above", which is arithmetically self-contradictory because those
three contracts are the grounds of three of the sixteen rows (low). Three further low defects are
pointers/precision (counts pointer to `measure/`; the R12 body quoted without its trailing LF; the
live leg stated as an unconditional admission condition). Every fix below is append-only; no frozen
script needs touching.

**What I attacked, in order:** (a) append-only byte keeping; (b) line-reference correctness of the
new block against the earlier bytes; (c) each "what the counter admits" cell against
`scripts/check-bidi-runtime.mjs` `PREDICATES` and against the entry table the block points to;
(d) the receipt binding claim (two transcripts named/digested); (e) §3 / §Rejected internal
consistency; (f) whether the round-13 contradiction found by w1 `ExecCollectorTiming` is recorded in
the matrix, the entry, the lesson, or anywhere in the corpus.

Nothing here judges C1's admission count. I did not re-run the `--live` counter (unrun, not claimed)
and I ran no lane script; all git was read-only in the lane, and no scratch tree or clone was
created.

## Evidence — commands and exit codes

| # | Command (cwd = lane root) | Exit | Result |
|---|---|---|---|
| 1 | `git diff --numstat 4181fff… b234a58… -- corpus/knowledge/webdriver-bidi-capability-matrix.md` | 0 | `95	0	corpus/knowledge/webdriver-bidi-capability-matrix.md` |
| 2 | `git show 4181fff:…matrix.md \| sha256sum` vs `git show b234a58:…matrix.md \| head -c 19304 \| sha256sum` | 0 | both `39cd0ee2c748ec9cfc216c0acb35469776bb0315adea3a1edb402d53cbc364b6`; base 19 304 B → new 27 135 B |
| 3 | `git show b234a58:…matrix.md \| tail -c 7831 \| grep -c $'\r'`; `tail -c 60 \| xxd` | 0 | `0` CR bytes; file ends `contracts.\n`; new block is `:168-261` |
| 4 | `node -e` receipt verifier (read `receipt.json`, sha256 each named transcript) | 0 | `runs 2`; `corpus/evidence/round-32/bidi/run1/transcript.jsonl` sha matches (`true`, 51 715 B); `run2` matches (`true`, 51 755 B); `fixtureSha256 343cbce…2843` |
| 5 | `nl -ba …matrix.md \| sed -n '1,20p;50,110p;151,166p;186,199p;216,261p'` | 0 | line-ref audit below |
| 6 | `grep -n 'DATA_TEXT\|FIXTURE_HEADER\|VIEWPORT' scripts/check-bidi-runtime.mjs` | 0 | `DATA_TEXT = "tabi-bidi-body-0123456789\n"` (`:101`), `FIXTURE_HEADER = ["x-tabi-fixture","r32"]` (`:121`), `VIEWPORT 640x480` (`:122`); predicates at `:215-283`; `navBase` loopback test `:181-189` |
| 7 | `grep -o 'tabi-bidi-body-0123456789..' corpus/evidence/round-32/bidi/run1/transcript.jsonl \| head -2` | 0 | `tabi-bidi-body-0123456789\n` — the admitted value carries a trailing LF (26 B) |
| 8 | `node -e` over w1 `ExecCollectorTiming/runs/out{9,10,11,12}/summary.json` | 0 | `b20000-l200` → `getData.type = success`, returned `20000` bytes; `t-h0-l190-total1M` → error `no such network data`; `t-h0-b20000-l65536-total200` → success |
| 9 | `git grep -n 'not a body cap\|b20000\|maxEncodedDataSize' b234a58 -- corpus/ LOG.md SCORECARD.md` | 0 | only `matrix.md:71`, `runtime-round-32.md:103`, and the two transcripts' `:8`; **no wording anywhere records the limit/body divergence** |
| 10 | `grep -n 'collector\|ExecCollectorTiming' corpus/lessons/round-32.md` | **1** | no match — the lesson does not record the collector finding at all |
| 11 | `grep -rln 'population\|admitted\|failing' .ufo/waves/round-32/measure/` | **1** | no file — `measure/` holds `c1-distinct.mjs`, `c1-distinct-red-green.txt`, `c1-socket-path-red-green.txt`, `c2-refusal-mutant.txt`, none carrying those fields |
| 12 | `pgrep -fa 'chromedriver\|chromium' \| grep -v earlyoom` | 1 | no line of mine; I started no browser and no chromedriver |

No tool was installed or upgraded (pacman untouched); no network fetch was made by this seat, so no
fetch log exists here; no credential or session material was read.

## Holds (verified, so the L1 need not re-litigate)

1. **Additions only, at byte level.** Items 1-3 above: no earlier byte changed, no CR was
   introduced, the file still ends with one newline.
2. **Line references are exact** (item 5): `:10` = "browser or binding support matrix: **locally
   measured: no**"; `:54` = `## 2.`; `:56` = "`locally measured: no` for every row"; `:60`-`:76` =
   the seventeen §2 rows in R1..R17 order; `:80` = "Choose the transport **per evidenced feature,
   never by protocol branding**"; `:82-83` = "CDP remains the lane's measured evidence substrate";
   `:100-107` = the Rejected bullet with its flip sentence at `:105-107`; `:157-161` = the round-13
   bullet it is accused of ignoring. The round-13 block's own reference `:87-88` is a *different*
   sentence (the collector sentence), so the two corrections do not collide on §3.
3. **Per-row cells match the frozen counter** (item 6), one for one: R1 `rec.newSession…capabilities`
   + loopback `webSocketUrl` regex + `rec.cmds.some(ok)` (`:215-221`); R2 `getTree`
   `contexts.length>=1` and every `typeof x.context === "string"` (`:222`); R3 leading loopback
   `/a.html` navigate with result url + `load` event (`:223-229`); R4 PNG IHDR `640x480` (`:230-234`);
   R5 `locateNodes` css `#h` → one `localName h1` (`:235-237`); R6 awaited `window.__ready` →
   `settled` (`:238-239`); R7 `setViewport` then later `innerWidth === 640` (`:240-244`); R8 pointer
   down/up then `#out = clicked:tabi` (`:245-250`); R9 key actions then `#t = tabi` (`:251-256`);
   R10 both events on `/a.html` (`:257-262`); R11 status 200 + `x-tabi-fixture: r32` (`:263-268`);
   R12 `addDataCollector` then later `getData` decodes to `DATA_TEXT` (`:269-273`); R13 blocked
   `beforeRequestSent` naming the intercept then `continueRequest` (`:274-281`); R14 `delta -1` after
   `/b.html`, then `location.pathname = /a.html` (`:282-287`); R15 `tabi_fixture=1` (`:288`);
   R16 `no-bidi-counterpart` → `x2-no-counterpart` (`:289`, `:564`); R17 `userPromptOpened`
   `tabi-alert` then `handleUserPrompt` (`:290-293`). The entry's row descriptions agree.
4. **The verdict vocabulary is real** (`:41-57`, `:564-574`): `x2-no-counterpart`, `t1-receipt`,
   `t3-binding`, `t2-run`, `l1-live`; self-test case `off-loopback-navigate` exists (`:662`) and is
   the `t2-run` refusal the block names.
5. **Receipt binding claim holds** (item 4): the two transcripts the block says are "named in
   `receipt.json`" are named there, exist, and their digests verify. `browserVersion` /
   `chromedriverVersion` in the receipt are `154.0.8037.97` / the `b510e9d7…` build, matching the
   block and the entry.
6. **§3 consistency.** The block re-reads `:82-83` rather than editing it, says so, keeps
   `:80` unchanged, and its "measured counter-example … for these sixteen rows — and only for them"
   is a narrower true statement than §3's "a Working Draft command is not proof". No contradiction.
7. **Driver claims** (spot-checked): `scripts/bidi-loopback-round32.mjs` contains no
   `json/version`/`remote-debugging`/CDP string (`grep -ci` → 0), posts `webSocketUrl: true`
   (`:90`), and uses a throwaway `--user-data-dir` under scratch (`:91`). The 17.0.2 mapper identity
   is inherited from the entry (`runtime-round-32.md:28,133`), not from the receipt.

## Findings — defects

### F1 (severity: medium) — the round-13 contradiction is recorded nowhere, and the block points R12 at it

`corpus/knowledge/webdriver-bidi-capability-matrix.md:247-249` tells the reader what R12 does not
show and hands them the 2026-10-20 correction for the mechanism: "(`:71`, and the 2026-10-20
collector-timing correction above)". w1 `ExecCollectorTiming`
(`.ufo/waves/round-32/w1/ExecCollectorTiming.md`, "Which round-13 correction sentences …") measured
that correction's bullets 1-3 hold but bullet 4 does not:

- `matrix.md:157-161` — "with the body within that collector's `max encoded item size`" — is
  contradicted on chromium 154.0.8037.97: `maxEncodedDataSize: 200` returns a 20 000-byte body in
  full (`ExecCollectorTiming/runs/out10/summary.json`, case `b20000-l200`, `getData.type = success`,
  returned 20 000 B — item 8 above), while limits under the response's header-block size yield
  `no such network data` / "No collected response data" — never the spec's `unavailable network
  data` — and `maxTotalCollectedSize` moves nothing (`out12`).
- The lane already relies on the limit in a live path: both committed transcripts register
  `maxEncodedDataSize: 65536` (`run1/transcript.jsonl:8`, `run2/transcript.jsonl:8`), which clears
  the header-block threshold; a future script lowering it toward the body size gets silence, not a
  truncated body.

Is it recorded anywhere? No (items 9-10): corpus-wide at `b234a58` the only occurrences of
`maxEncodedDataSize` are `matrix.md:71` (the spec-shaped gaps cell "`maxEncodedDataSize` limits each
item"), `runtime-round-32.md:103` ("`maxEncodedDataSize` and total-storage behaviour … are
unmeasured" — false as of this wave's own artifacts), and the two transcripts. `corpus/lessons/`
round-32 has no collector line (grep exit 1). The matrix block's own "Still not measured" list
(`:233-254`) is exactly where the lane records such a result and it is silent.

Impacted axes: C1 coverage/capability provenance (the matrix's operational reading of the R12 gap);
the lane's evidence contract for collector-gated body capture; lesson completeness.

Smallest safe correction (append-only, no frozen script touched) — append one bullet at
`matrix.md:249`, e.g.:

> - **No size-limit protection, and no `unavailable network data`.** On chromium 154.0.8037.97 the
>   2026-10-20 bullet at `:157-161` does not describe the runtime: `maxEncodedDataSize` does not cap
>   the body (20 000 B returned in full at 200), a limit below the response's header-block size makes
>   the record vanish (`no such network data`, never `unavailable network data`), and
>   `maxTotalCollectedSize` showed no effect. Evidence: `.ufo/waves/round-32/w1/ExecCollectorTiming.md`
>   with `runs/out9`-`out12`. The committed transcripts' 65536 is above that threshold.

and, in the same wave, one errata line under `runtime-round-32.md:103` saying the limit and
total-storage behaviour *were* measured in w1, with that pointer.

### F2 (severity: low) — the §Rejected paragraph asserts a conjunctive condition "is met" and "not met"

`:256-259`: "What this block does **not** change: the `## Rejected` flip condition (`:100-107`, a
pinned per-row runtime/evidence-contract comparison preserving every required output, scope and
provenance) is met for the sixteen rows at the granularity the counter checks, not for the three
contracts named above."

The flip condition is one conjunction over "every required output, scope, and provenance" (`:105-107`).
The three contracts that fail it (DOMSnapshot's columnar shape, the history-entry list,
`insertText`) are the grounds of rows R5, R9 and R14 — three *inside* the sixteen. So the sentence
cannot be true as written: the condition cannot be met for the sixteen but not for three of them.
Read charitably it means "the per-row comparison exists at predicate granularity", and the block's
closing sentence (`:259-261`) plus the `## Rejected` heading keep the decision; I found no substantive
overturn, only a self-contradictory sentence under a heading that says nothing is being changed.

Smallest safe correction — append one disambiguating sentence after `:261`:

> Read `:256-259` as "the counter-granularity comparison exists for those sixteen rows": the `Rejected`
> flip is a conjunction over every required output, scope and provenance, and it stays **unmet** —
> three of the sixteen rows (R5, R9, R14) are the contracts that fail it and R16 has no command —
> so the `Rejected` decision stands unchanged.

### F3 (severity: low) — the counts pointer names a directory that holds no such counts

`:194`: "the observed `population` / `admitted` / `failing` counts are the round's measurement
(`.ufo/waves/round-32/measure/`)". Item 11: `measure/` holds four files and none carries
`population`/`admitted`/`failing` (its `c1-distinct-red-green.txt` reports `rowsMarkedYes` /
`distinctRowIds` / `duplicateListings` / transcripts / digests). The fields the sentence names are in
`.ufo/waves/round-32/w1/ExecDriver.md:15-16` and `:82-83` (`{"population":16,"admitted":16,
"failing":0}`, offline and `--live`), measured against a clone of `4181fff` with the built driver, not
at `b234a58`.

Smallest safe correction — append one clause to `:194` naming `w1/ExecDriver.md:82-83` for the fields
and `measure/` only for the plain distinct-count receipts beside the gate.

### F4 (severity: low) — R12's quoted body is not the admitted byte string

`:209` says `getData` "returns the fixture body `tabi-bidi-body-0123456789`". The admitted value is
`DATA_TEXT` (`scripts/check-bidi-runtime.mjs:101`) = `tabi-bidi-body-0123456789\n`, 26 bytes, and the
transcripts carry the LF (item 7). The entry avoids the trap (`runtime-round-32.md:78`, "decoded
bytes equal the `/data.txt` body"); the same table introduced a literal that is off by one byte — the
kind of drift a byte-truth row exists to prevent.

Smallest safe correction — append at `:215`: "the admitted bytes are `DATA_TEXT` = the body plus its
trailing LF (26 B), not the 22-character string quoted above."

### F5 (severity: low) — the live leg is stated as an unconditional admission condition

`:217-220`: "A row is admitted only when its predicate holds on both committed driver-run
transcripts (`t2-run`) **and** on the counter's own live session (`l1-live`)". Without `--live` the
gate skips `l1-live` entirely and still admits sixteen (`ExecDriver.md:15`, offline run: admitted 16,
exit 0). The block's own command line (`:188-190`) does pass `--live`, so the claim is true only in
that mode.

Smallest safe correction — append "(in the `--live` mode shown above; the gate also admits on the
committed transcripts alone without it)" to `:220`.

## Nits (recorded, no append needed unless the L1 wants them)

- `:192` enumerates "per-row verdicts" as five ids; the gate has a sixth, `x1-row-unknown` (`:40`,
  `:561`). Unreachable for R1..R17, so the enumeration is complete for the round, not for the gate.
- `:198` "`newSession` capabilities" is the counter's own field name (`rec.newSession`, `:216`) for
  the *classic* `POST /session` response; the entry says "classic `POST /session`"
  (`runtime-round-32.md:67`). Correct for a code reader, misreadable as the BiDi `session.new`
  command.
- `:183` "chromedriver's chromium-bidi 17.0.2 mapper" is inherited from the entry's provenance
  (`runtime-round-32.md:28,133`, `w1/ScoutChromiumBidi.md`), not carried by the receipt — fine, but
  the block's own "no cited source page was re-fetched" framing should not be read as covering it.
- `:183` "no credential or session material was touched": the driver does call `storage.getCookies`
  (R15) and notes the loopback fixture's own `tabi_fixture` cookie. No credential material, so the
  claim holds as written; it just is not a no-cookie claim.

## Hygiene

- No scratch tree, no clone, no lane script run: the analysis needed only read-only git and file
  reads (`grep -n`/`nl`/`wc`) in the lane. Nothing to delete; `$HYAKU_SCRATCH/tabi-r32/CritMatrixAddendum`
  was never created.
- No browser, no chromedriver: item 12 shows no line of mine; nothing was started, so nothing was
  killed.
- No lane tracked file, lane index, jj state, fleet repo or sibling lane was written; my only writes
  are this report and `.ufo/waves/round-32/w2/CritMatrixAddendum/`.
- No tooling installed or upgraded; no network fetch; no credential read.
