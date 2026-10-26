# Counter v2 plan — round 31 candidates (drafted round 30 w2)

Seat `ScribeV2Plan`, scribe lane, round 30 w2. This is a **plan, not a build**: no lane file is
edited, no counter is changed, no SCORECARD row is landed. Every target number below is either a
measured reading (commands and exit codes in §1, artifacts listed in §7) or a stated rule; nothing
here is an execution claim. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

The three v2 counters are the round-30 wave-1/2 findings turned into mechanically enforced rules:

| v2 counter | closes | evidence it must answer |
|---|---|---|
| `scripts/check-gate-mutants.mjs` + `scripts/gate-mutants.json` | identity leak in run directories; kill attribution absent from the kill rule; 15 beyond-catalogue survivors | `.ufo/waves/round-30/w1/CritC1Counter.md` §2-§5; `.ufo/waves/round-30/w2/MeasureC1Clean.md`; `.ufo/waves/round-30/w2/MutC1Beyond.md` |
| `scripts/check-frontier-admission.mjs` | `file://` in production `--live`; redirects off-origin/downgrade; ambient curl config; credentials in URL; impossible dates; quote-extraction blind spots; one-word quote; duplicate rows | `.ufo/waves/round-30/w1/SentinelFetchScope.md` F1-F6; `.ufo/waves/round-30/w1/CritC2Counter.md` F1-F13, R1-R4 |
| `scripts/check-release-pins.mjs` | population stated as a rule + id set + excluded reasons; DEPS-mapped devtools rows; receipt-carried bytes root | `.ufo/waves/round-30/w1/ScribePopulationRule.md`; `corpus/lessons/round-30.md` §Release-pin population rule |

## 0. Verdict on the draft v2 designs (what this seat attacked)

Attacked: the three predicate drafts, not the v1 counters (those were attacked in w1). Six defects
in the drafts as they would naturally be written; each is fixed in the corresponding section.

| # | defect in the draft | severity | fix |
|---|---|---|---|
| P1 | C1 v2 "neutral per-run directory names + killer attribution" fails on `pins-f3-bytes-absent`: the mutant kills by **crashing** the pins self-test (no JSON, `failing_cases: []`, `TypeError` at `check-release-pins.mjs:215`), so a "killing case must be declared" rule reclassifies a genuine kill as unattributed | medium (claim would be red or silently reshaped) | attribute crashes by an anchored frame: catalogue field `crash_frame` naming the crash line's source text; the counter resolves the line number and requires it in stderr (§2.4) |
| P2 | C1 v2 attribution is still declaration-gameable: an implementer may declare the source-keyed case in `behavioural_cases`/`expect_cases`; the counter cannot see the case's semantics | medium (residual, named) | mechanical target cross-check (`cases[].target` ∈ `mutants[].targets`) + the pre-freeze declaration attack (QUALITY 73) is part of the claim, not an afterthought (§2.6) |
| P3 | C2 v2 "single-quote span extraction" as usually written false-refuses honest entries: apostrophe pairs (`client's … host's`) read as straight-single-quoted spans; my scan of the two admitted entries produced 20+ such artifacts of up to 99 words | high (would turn a green entry red) | straight `'…'` needs word-boundary guards; curly `‘…’` is safe; U+2019 never opens (§3.3) |
| P4 | C2 v2 cannot be a count claim: 2/2 admitted with `--live` is already reachable under v1 with zero network (`file://` receipt in `unshare -Urn`, CritC2Counter F1) | high (count-only claim unearned) | the target is the **refusal set**; the admission count is the no-false-refusal arm (§3.1) |
| P5 | C3 v2 copied from the round-30 lesson admits **seven** DEPS rows at the tip, not six: S118 (added by `072af95f`) is `on-release`, `mined`, devtools-pinned at the same commit | high (a claim sentence with "six" is a criterion-79 defect) | derive the id set; at `072af95f` it is 23 + 7 = 30, S118 named (§4.2) |
| P6 | C3 v2 `--receipt <path>` cannot point at next round's evidence: `BYTES_ROOT` and `REFETCH_ROOT` are constants at `check-release-pins.mjs:71-72` and used at `:209-210`; a receipt outside round-29 still resolves paths under round-29 | medium (the counter would read the wrong bytes and could pass) | receipt carries `bytes_root`; paths are computed from it; a receipt without it refuses (§4.4) |

Residual, stated, not fixed: a frozen declaration can always be lied into; byte-identical
fingerprints of the gate source are always constructible (CritC1Counter §4); a dynamic vendor page
cannot be byte-stable; seat identity cannot be proven from a repo. The claims below say what they
do not cover (§6).

## 1. Inputs measured (this seat)

Clean shared clone of the lane at the assigned tip; all readings from frozen bytes.

```
$ git -C "$S/clone" rev-parse HEAD; git -C "$S/clone" status --porcelain | wc -l
072af95fe2822f0785a6ff88a578e2142dd258e5
0
$ sha256sum scripts/{check-gate-mutants.mjs,gate-mutants.json,check-frontier-admission.mjs,check-release-pins.mjs,check-s106-evidence.mjs}
02945f88…3a55  check-gate-mutants.mjs        (frozen counter, claim C1)
cd1c27a2…3833  gate-mutants.json             (frozen catalogue, claim C1)
cadef57e…9eca  check-frontier-admission.mjs  (frozen counter, claim C2)
915a6bba…4648  check-release-pins.mjs
85dfd5e0…5467  check-s106-evidence.mjs
$ node scripts/<gate>.mjs --selftest --json      # each exit 0
check-gate-mutants       cases=12 passed=12 ok=true
check-frontier-admission cases=24 passed=24 ok=true
check-s106-evidence      cases=10 passed=10 ok=true
check-release-pins       cases=29 passed=29 ok=true
$ node scripts/check-release-pins.mjs --repo "$S/clone" --rev HEAD --stable 156.0.8078.47 --json
exit 0   population 23  resolved 23  unresolved 0  holds 16  drifted 7  clean true
         ids = S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094
               S096 S097 S098 S099 S100 S105 S106
$ node scripts/check-frontier-admission.mjs --repo "$S/clone" --rev HEAD \
    --frontier rate-tos-signal --since 2026-10-26 --json          # offline, no network
exit 0   population 2  admitted 2  failing 0  clean true
```

Population re-derivation over `corpus/SOURCES.md` at the tip (my own `population.py`, not the
counter): 118 registry rows, 90 `on-release`; the v1 rule selects 23; the seven devtools rows are
S036 S044 S068 S088 S089 S090 **S118**; the excluded classes at `--stable 156.0.8078.47` are
at-stable 7 (S109-S115), main-branch 3 (S004 S028 S035), non-chromium-host 50, malformed 0
(`ScribeV2Plan/population-v2.json`).

---

# 2. C1 v2 — `check-gate-mutants.mjs` + `gate-mutants.json`

## 2.1 Claim shape (falsifiable sentence)

> At REV, with `scripts/check-gate-mutants.mjs` and `scripts/gate-mutants.json` byte-identical to
> digests frozen in that round's `claims.json` **before any data**, `node
> scripts/check-gate-mutants.mjs --rev REV --json` exits 0 and reports
> `fault_total = 49`, `fault_survivors = 0`, `benign_total = 33`, `benign_killed = 0`,
> `unattributed = 0`, `concentrated_cases = 0`, `crash_attributed = 1`; for every fault mutant
> `failing_cases` is non-empty, every id in it appears in its gate's declared `behavioural_cases`,
> and it contains the row's declared `expect_cases`; every mutant run directory basename matches
> `^run-[a-z0-9]{6}$`, every child cwd basename matches `^cwd-[a-z0-9]{6}$`, and the child
> environment exposes no key outside `{PATH, HOME, TMPDIR, TMP, TEMP, LANG, GIT_CONFIG_NOSYSTEM,
> GIT_CONFIG_GLOBAL}`; the pristine self-tests report 19/19 (`check-s106-evidence`) and 35/35
> (`check-release-pins`); the counter's own `--selftest` reports 18/18.

Counting command (the id sets, not the exit code, are the reading):

```
node scripts/check-gate-mutants.mjs --rev REV --json \
  | jq '{fault_total,fault_survivors,benign_total,benign_killed,unattributed,concentrated_cases,
         crash_attributed,survivors,benign_killed_ids,isolation}'
node scripts/check-gate-mutants.mjs --rev REV --json \
  | jq '[.mutants[] | select(.kind=="fault")
         | {id, failing_cases, declared: (.failing_cases - .behavioural_cases | length)}]
        | map(select(.declared > 0 or (.failing_cases|length)==0))'      # must be []
node scripts/check-gate-mutants.mjs --selftest --json | jq '{cases,passed,ok}'
```

Kill rule: any number off, any attribution violation, any non-opaque name, any unexpected env key,
or a self-test not clean → **failed**; exit 2, counter/catalogue bytes differing from the frozen
digests, a find string not present exactly once, a declared case id absent from the pristine
report, or a read without `--json` → **not verified**.

Target vs before: before (round-30 counter, frozen catalogue) = 27/27 fault, 0/13 benign, but
14 kills only attributable by reading and 15 known survivors beyond the catalogue. After = the
sentence above.

## 2.2 Counter changes

1. **Opaque runs** (`:141-171` today). Replace `join(work, runId)` / `cwd: dir` / `env:
   {...process.env}`:
   - one `mkdtempSync(join(work, "run-"))` per run; the copied gate is `gate.mjs`
     (constant name, no role, no index);
   - the child cwd is a second fresh `mkdtempSync(join(work, "cwd-"))`, not the run dir;
   - before spawning, the counter `chdir`s to the fresh cwd dir so `/proc/<ppid>/cwd` is neutral;
   - child env is an allowlist only: `PATH`, `HOME` = fresh temp dir, `TMPDIR`/`TMP`/`TEMP` under
     the run, `LANG=C.UTF-8`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=os.devNull`;
   - no `PWD`, no `CURL_*`, no `GIT_DIR`, no inherited `HOME`.
2. **Kill kinds** (replaces `killed = !res.clean`, `:216`):
   - `case` kill: report parses, `ok:false` cases exist, `failing_cases` non-empty ⊆ gate's
     `behavioural_cases`, and `expect_cases ⊆ failing_cases`;
   - `crash` kill: nonzero exit, no parseable report, and stderr contains
     `<gate.mjs>:<line>` where `<line>` is the line of the row's `crash_frame` in the pristine
     bytes (resolved at run time, so line shifts cannot fake it);
   - anything else is **unattributed** (counted in `unattributed`, listed in `unattributed_ids`);
   - `crash_attributed` counts declared crash kills (expected 1: `pins-f3-bytes-absent`).
3. **Concentration**: `concentrated_cases` = case ids appearing in the failing sets of more than
   3 fault mutants; output `kills_by_case {case → [fault ids]}`. Today's maximum is 2 (measured,
   `MeasureC1Clean`), so the threshold cannot bite an honest catalogue; it catches the wave-1 Z
   signature (one case killing 14).
4. **Report fields**: `isolation {run_dir_prefix:"run-", child_cwd_prefix:"cwd-",
   env_keys:[…]}`, `unattributed`, `unattributed_ids`, `crash_attributed`,
   `concentrated_cases`, `kills_by_case`, and per-mutant `kill_kind`.
5. **Catalogue schema `tabi-gate-mutants-catalogue-v2`**:
   - `gates[]`: `{script, case_count, behavioural_cases:[id…], cases:[{id,target}]}`;
     `case_count` must equal the pristine report's `cases`; every `behavioural_cases` id must be
     in the pristine `results[].id`;
   - `mutants[]`: `{id, script, kind, find, replace, targets:[string…], expect_cases:[id…],
     crash_frame?: string, note}`; for `kind:"fault"`, `expect_cases` non-empty ⊆
     `behavioural_cases`, `targets` non-empty, and each `expect_cases` id's `cases[].target` must
     be one of `targets`.
6. **Counter self-test** (12 → 18 cases), six new, all over the toy gate:
   - `cwd-role-sniff-not-a-kill` — toy case `ok: !/(pristine|mutant)-\d+$/.test(cwd)`; with opaque
     dirs it passes on every run, so the fault survives (exit 1, survivors 1);
   - `env-sniff-not-a-kill` — toy case keyed on `process.env.PWD`/`HOME` containing the lane path;
     allowlisted env makes it pass everywhere (survivors 1);
   - `crash-attributed-by-frame` — toy gate crashes on a declared `crash_frame`; exit 0,
     `crash_attributed 1`;
   - `crash-without-frame-unattributed` — same crash, no declaration; exit 1 `unattributed 1`;
   - `expect-case-mismatch-unattributed` — a case kills the fault but is not in `expect_cases`;
     exit 1 `unattributed 1`;
   - `behavioural-case-unknown-could-not-evaluate` — declaration names a case id the pristine
     report does not emit; exit 2.

## 2.3 Catalogue extension (from `MutC1Beyond`, 22 rows)

All 22 rows in `.ufo/waves/round-30/w2/MutC1Beyond.md` are added, not only the 15 survivors: the
7 already killed by existing cases become regression rows (cheap protection against a later
self-test edit). Each row's `find`/`replace` is copied from `MutC1Beyond/results.json`; each gets
`targets` (the check field it disables) and `expect_cases`.

**15 rows need a new case** (they survive today):

| gate | row (MutC1Beyond id) | new case id (house style) | target |
|---|---|---|---|
| s106 | `s106-parseReceipt-schema-drop` | `receipt-wrong-schema-could-not-evaluate` | `receipt.schema` |
| s106 | `s106-parseReceipt-string-fields-drop` | `receipt-missing-url-could-not-evaluate` | `receipt.url` |
| s106 | `s106-parseReceipt-rev-hex-drop` | `receipt-rev-not-hex-could-not-evaluate` | `receipt.measured_rev` |
| s106 | `s106-parseReceipt-decoded-bytes-type-drop` | `receipt-decoded-bytes-type-could-not-evaluate` | `receipt.decoded_bytes` |
| s106 | `s106-parseReceipt-anchor-fields-drop` | `receipt-anchor-missing-invalid` | `receipt.anchor` |
| s106 | `s106-resolveRev-syntax-drop` | `rev-syntax-could-not-evaluate` | `resolveRev.syntax` |
| s106 | `s106-resolveRev-unresolvable-drop` | `rev-unresolvable-could-not-evaluate` | `resolveRev.resolve` |
| s106 | `s106-anchor-located-notrim` | `anchor-padded-line-valid` | `anchorLocated.trim` |
| s106 | `s106-anchor-unique-notrim` | `anchor-padded-duplicate-invalid` | `anchorUnique.trim` |
| pins | `pins-rowre-indent-loose` | `five-space-row-not-counted` | `ROW_RE` |
| pins | `pins-parseRegistry-13cell-drop` | `fourteen-cell-row-not-counted` | `parseRegistry.cells` |
| pins | `pins-cmpVersion-first-two` | `tag-differs-in-patch-counted` | `cmpVersion` |
| pins | `pins-digestMatches-suffix-drop` | `abbreviated-digest-wrong-suffix-unresolved` | `digestMatches` |
| pins | `pins-receipt-schema-refusal-drop` | `receipt-wrong-schema-could-not-evaluate` | `receipt.schema` |
| pins | `pins-r1-duplicate-entry-allowed` | `duplicate-entry-unresolved` | `r1-entry` |

**7 regression rows** (already killed, no new case): `pins-rowre-indent-strict`,
`pins-cmpVersion-always-zero`, `pins-rowDigests-abbr-drop`, `pins-blockIn-always-true`,
`pins-normLine-identity`, `pins-f2-inanchor-basename-drop`, `pins-receipt-stable-refusal-drop`.
Their `expect_cases` are the existing cases measured in `MeasureC1Clean`'s `neutral-sweep.txt`
(e.g. `pins-blockIn-always-true` → `drift-without-supersession-unresolved`).

**Benign twins**: one equivalent rewrite per distinct mutated site, 20 new rows → benign_total 33.
Default transforms, chosen to change text *and* byte length so the length-fingerprint junk stays
caught: `if (EXPR)` → `if (Boolean(EXPR))`; comparison operand swap (`a === b` → `b === a`);
`&&`/`||` parenthesised reorder; `\s+` → `\s\s*`; alternation reorder. The catalogue `note` records
the equivalence argument. Rows whose site has no equivalence-preserving rewrite are **not added**
and the claim names the omission; no silent shrink.

**Crash row**: `pins-f3-bytes-absent` gets `crash_frame: "sha256(ob)"`; the counter resolves that
frame in the pristine source to line 215 and requires `gate.mjs:215` in stderr. The fixture that
reaches it (`f3-old-bytes-never-committed-unresolved`, deleting `_old`) is the case the claim's
review reads.

## 2.4 Targets

| field | before (round 30) | target (v2) |
|---|---|---|
| fault_total / survivors | 27 / 0 (14 only by reading) | 49 / 0 |
| benign_total / killed | 13 / 0 | 33 / 0 |
| unattributed | not a field | 0 |
| crash_attributed | not a field | 1 |
| concentrated_cases | not a field | 0 |
| s106 selftest | 10/10 | 19/19 |
| pins selftest | 29/29 | 35/35 |
| counter selftest | 12/12 | 18/18 |

## 2.5 Controls

| id | shape | expected reading | why it fails the target |
|---|---|---|---|
| J1 do-nothing | v2 counter + v2 catalogue + round-30 self-test bytes (no new cases) | 15 survivors (exactly the beyond-catalogue faults), exit 1 | survivors 15 |
| J2 source-keyed junk (B2) | add one fragment-count table case (`readFileSync(import.meta.url)`), undeclared | all 49 killed, `unattributed 49`, exit 1 | unattributed 49 — the wave-1 B2 attack, now visible |
| J3 declared source-keyed (residual) | declare the table case in `behavioural_cases` + `expect_cases`, `cases[].target` set to each mutant's target | mechanically passes | **named residual**: only the pre-freeze declaration attack (2.6) catches it; the claim states this |
| J4 length fingerprint (round-30 J2) | a self-test result asserting the gate file's byte length | `benign_killed 33`, exit 1 | benign_killed 33 |
| J5 crash without frame | remove the null guard (`:214`), no `crash_frame` | `unattributed 1`, exit 1 | unattributed 1 |
| J6 cwd sniff | Z's two-line `process.cwd()` case, undeclared | with opaque dirs it passes everywhere → survivors 15 (J1 baseline); if it kills, `unattributed > 0` | no identity leak; any kill is unattributed |

J2 and J6 are the two shapes that reached the round-30 target; both must be red under v2.

## 2.6 Freeze and pre-freeze attack (QUALITY 73)

Before the v2 counter and catalogue are frozen in that round's `claims.json`, a **non-author** seat
runs, with declaration rights, the full `CritC1Counter` §2-§3 attack set (cwd, /proc, source-keyed
table, provenance) against the v2 catalogue and records for each whether the counter reported
`unattributed`; the attack report is a claim precondition. Two further duties: every new case names
the check it targets (QUALITY 76), and every `expect_cases` entry is read against its fixture, not
its id. No catalogue row may be added after the freeze.

---

# 3. C2 v2 — `check-frontier-admission.mjs`

## 3.1 Claim shape (refusal set, not a count)

> At REV, with the v2 counter byte-identical to the frozen digest, (a) `node
> scripts/check-frontier-admission.mjs --rev REV --frontier rate-tos-signal --since DATE --live
> --json` exits 0 with `population = 2`, `admitted = 2` for the two committed entries, and every
> live fetch is https, same-host after redirects, userinfo-free, with a calendar-valid `fetched_at`
> on or after `--since`; (b) `--selftest --json` reports 42/42, including one case per closed hole;
> (c) each of the 12 holdout fixture repos below, run with the same command, exits 1 (2 for a
> malformed receipt) with the named reason and none reports `admitted > 0`.

Reason to prefer the refusal set: 2/2 with `--live` is already reachable under v1 with **zero
network** — `CritC2Counter` F1's `file://` self-quote fixture admits 2/2 inside `unshare -Urn`
(exit 0) while the same bytes under `https://` fail `l1-live`. A count-only v2 claim repeats a
control that is already vacuous.

Counting command:

```
node scripts/check-frontier-admission.mjs --rev REV --frontier rate-tos-signal \
  --since DATE --live --json | jq '{population,admitted,failing,entries:[.entries[]|{path,admitted,reasons}]}'
node scripts/check-frontier-admission.mjs --selftest --json | jq '{cases,passed,ok}'
```

Kill rule: any holdout admitted, any count off, selftest not clean, counter bytes differ → failed;
exit 2 on (a) → not verified; a base reading taken without `--live` → not verified.

## 3.2 Counter changes (the six named + the evidenced false refusals)

1. **https-only production `--live`.** `fetchLive` (`:173-182`) accepts `file://` and code `000`.
   Change: production path accepts `^https://` only; a `file://` URL fails with reason `h1-scheme`;
   the hermetic `file://` self-test cases keep working through an internal `allowFile` option
   passed **only** by `--selftest`. The CLI never sets it. New selftest case
   `production-file-url-refused` calls `evaluate(..., {live:true})` (no option) and expects
   admitted 0, `h1-scheme`.
2. **Same-host, https-only redirects.** Curl argv (`:175`) gains `-q` (first), `--no-netrc`,
   `--proto-redir =https`, `--max-redirs 3`, and `-w "\n%{http_code}\t%{url_effective}"`. The
   counter parses the effective URL, requires its scheme `https` and its host to equal the receipt
   URL's host; otherwise `h2-redirect-host`. The effective URL is emitted per fetch in the JSON.
3. **No credentials.** Reject a receipt/row URL with userinfo (`@` before the path) → `h3-userinfo`;
   `-q --no-netrc` stops ambient `~/.curlrc`/`~/.netrc` from changing the verdict (`set -x`
   SentinelFetchScope F3).
4. **Calendar-valid dates.** `DATE_RE` (`:84`) gains a real-date test (`Date.UTC` round-trip) for
   `--since`, `opened` (`:253`) and — new — receipt `fetched_at` (ISO 8601, real date, date ≥
   `--since`; missing/stale → `g3-fetched-at`). `2026-13-45` and `2026-11-31` become `r4-opened`.
5. **Quote extraction.** `entryQuotes` (`:155-165`): scan head **and** body; extract:
   - `"…"` and `“…”` with no upper length cap (the 600-char cap is a blind spot, not a rule);
   - `‘…’` (curly single) freely;
   - `'…'` only when the opening quote is preceded by start/space/punctuation and the closing quote
     is followed by space/punctuation — **never** an apostrophe inside a word (U+2019 never opens);
   - strip markdown emphasis delimiters (`*`, `_`) and leading `>` blockquote markers from the
     span before locating it, so a verbatim quote with emphasis is not a false refusal (R1/R2);
   - keep the existing inline-code/fence exclusion from spans, but no fabricated span can hide in
     a fence: fenced text is not quoted prose, and a ≥4-word span must still locate.
6. **One-word quote floor.** `g4` (`:209`) becomes `n < 4 || n > 25`.
7. **Duplicates and identity** (evidenced, cheap): `parseRegistry` (`:131`) refuses a duplicate id
   with `r1-duplicate` instead of first-wins; `g2-url` (`:204`) compares parsed URLs for equality,
   not `includes`; `g7` requires `rf.url === rc.url` (a refetch of draft-10 cannot confirm a
   draft-11 receipt).
8. **Source-id extraction** (`:240`): anchor `^source:\s*(S\d{3,}(?:\s*[,+]\s*S\d{3,})*)` so
   "supersedes S118" prose is not a citation (R3, live this round).
9. **HTML sniff** (`normalise`, `:138-140`): detect HTML only at the buffer start
   (`^\s*(<!doctype html|<html[\s>])`), strip an unclosed `<script|style>` to EOF, delete
   U+200B/200C/200D/FEFF before collapsing (R4/F9).
10. **Selftest** 24 → 42 cases: the six hole cases plus redirect (same-host/cross-host/downgrade),
    userinfo, calendar, `fetched_at`, single/curly span, apostrophe-pair-not-a-span, oversize-span,
    duplicate row, curl-argv-pinned, anchored source-id, emphasis, blockquote, html-sniff-start,
    unclosed-script, production-file-url.

## 3.3 The apostrophe trap (measured)

Scanning the two admitted entries at the tip with a naive `'…'` extractor yields 20+ false spans of
4-99 words, e.g. `s `t` is; the host` and `s own UTC timestamp, so an absolute `Reset``. A v2 that
adds straight-single extraction without word-boundary guards would fail the base 2/2 arm for
reasons the claim does not name. Hence the guards in 3.2.5 and the selftest case
`apostrophe-pair-not-a-span`.

## 3.4 Controls

| id | shape | expected reading | fails target |
|---|---|---|---|
| J1 do-nothing | v1 counter + `CritC2Counter` F1 fixture (invented bytes, `file://` url, second-seat refetch label, matching lesson line) inside `unshare -Urn` | 2/2 admitted, exit 0, no network | count reachable without the work; (c) not met |
| J2 scheme-only fix | https-only in production, redirects/userinfo/dates/quote floor untouched | H2, H4, H5, H7 admitted | holdouts admitted |
| J3 deleted cases | production fixed, the hole selftest cases deleted | selftest count ≠ 42 | not verified (locks cases to code) |
| J4 ambient curl | `-q --no-netrc` omitted; `~/.curlrc insecure` + self-signed loopback | H11 (`l1-live` expected) admitted | holdout admitted |
| J5 naive quotes | 600-char cap kept / unguarded `'…'` | H8 skipped, or base 2/2 broken by apostrophe spans | holdout admitted **or** false refusal |

Holdouts (fixture repos, expected reason): H1 `file://` receipt → `h1-scheme`; H2 cross-host
redirect → `h2-redirect-host`; H3 https→http redirect → `h2-redirect-host`; H4 userinfo →
`h3-userinfo`; H5 `2026-13-45` → `r4-opened`; H6 missing/stale `fetched_at` → `g3-fetched-at`;
H7 one-word quote → `g4-quote-length`; H8 straight single-quoted fabricated span →
`q1-entry-quote`; H9 curly-single fabricated span → `q1-entry-quote`; H10 duplicate row →
`r1-duplicate`; H11 ambient `.curlrc` → `l1-live`; H12 refetch of a different document →
`g7-refetch`.

## 3.5 Freeze and pre-freeze attack

The round-30 defeaters (SentinelFetchScope F1-F6, CritC2Counter F1/F3/F4/F5/F7/F8/F11/F12/R1-R4)
are re-run against the v2 bytes by a non-author seat **before** the digest freeze; the claim's
target (c) is exactly that replay. The `--selftest` case count is part of the frozen predicate.
The two round-30 entries are re-read with `--live` in the same round and must stay admitted; a
CDN-driven `l3-live-bytes` failure is a known limit, not a lane defect (SentinelFetchScope Q2).

---

# 4. C3 v2 — `check-release-pins.mjs`

## 4.1 Claim shape

> At REV, with the v2 counter byte-identical to the frozen digest, `node
> scripts/check-release-pins.mjs --rev REV --stable 156.0.8078.47 --receipt
> corpus/evidence/round-31/release-pins/receipt.json --json` exits 0; `population_ids` equals the
> 30-id set R30 in §4.2; `population_rule` is the rule string; `excluded` carries
> `{at-stable: 7, main-branch: 3, non-chromium-host: 50, malformed: 0}` with the ids;
> `unresolved = 0`; each of S036 S044 S068 S088 S089 S090 S118 resolves through `f7-deps` bound to
> committed `DEPS` blobs (the row's tag carries `66df492…`, the 156 tag carries `bf69d041…`); every
> other file verdict is computed from committed bytes under the receipt's `bytes_root`.

Counting command:

```
node scripts/check-release-pins.mjs --rev REV --stable 156.0.8078.47 \
  --receipt corpus/evidence/round-31/release-pins/receipt.json --json \
  | jq '{population_ids,population_rule,excluded,resolved,unresolved,holds,drifted,clean,
         rows:[.rows[]|{id,resolved,verdict,reasons}]}'
```

Kill rule: any id missing/extra, any count off, `excluded` differing, `unresolved > 0` → failed;
exit 2, bytes differing, or a reading from a receipt without `bytes_root` → not verified.

## 4.2 Population rule (stated, with the tip's id set)

**Rule.** A row enters the population iff its `recheck` cell is `on-release` and either

- (a) its source cell carries `refs/tags/<A.B.C.D>/` for a tag numerically below `--stable`
  (today `check-release-pins.mjs:178`), or
- (b) its source cell is a devtools-frontend URL at a 40-hex commit
  (`github.com/ChromeDevTools/devtools-frontend/(blob|raw)/<40hex>/…` or
  `raw.githubusercontent.com/ChromeDevTools/devtools-frontend/<40hex>/…`) and a committed `DEPS`
  blob, at a tag numerically below `--stable`, names that commit as `devtools_frontend_revision`.
  **The tag is chosen by the receipt** (`deps.old_tag`) and validated by `f7-deps`; the anchor cell
  is not a membership criterion — five of the seven rows' anchors do not carry a full version.

**At `072af95f…`, `--stable 156.0.8078.47`, the rule selects 30 ids:**

- 23 source-tag rows: S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093
  S094 S096 S097 S098 S099 S100 S105 S106.
- 7 DEPS rows: **S036 S044 S068 S088 S089 S090 S118**.

**Excluded classes, counted** (90 `on-release` rows total = 30 + 60): at-stable 7 (S109-S115,
source carries `refs/tags/156.0.8078.47/`), main-branch 3 (S004 S028 S035), non-chromium-host 50,
malformed-row 0.

**Disclosures the claim must carry** (QUALITY 79):

- S118 is the seventh DEPS row, added by `072af95f` **after** the round-30 lesson's "six" was
  written. The lesson is a round-30 snapshot; a next-round claim that says six is a defect.
  S118's teaches also asserts that the `panels/application/WebMCPView.ts` path named by S044/S068
  returns 404 at `66df492` and `bf69d041` — the first data task is to settle that per file
  (a 200 with bytes+refetch, or a 404 pair that holds via `NOT_FOUND`).
- `status` is **not** a membership criterion (neither in v1 nor v2). Inside the 30: `queued`
  S080 S081 S088 S089 S090 S093 S098; `rejected` S094. The claim discloses them rather than
  silently filtering.
- `used-by` is not a membership criterion; S088/S089/S090 carry `—` and stay in.

## 4.3 `f7-deps` check

For a DEPS row's receipt entry:

- `deps.old_tag` is a tag below `--stable`; the committed blob `<bytes_root>/<old_tag>/DEPS`
  (decoded) has a line `'devtools_frontend_revision': '<hex>',` whose `<hex>` equals the 40-hex
  commit in the row's source cell;
- `deps.new_revision` equals the `devtools_frontend_revision` in
  `<bytes_root>/<stable>/DEPS`;
- both blobs' sha256 are recorded (`deps_old_sha256`, `deps_new_sha256`) and match;
- a DEPS row with no `deps` block, a missing blob, or a mismatch is **unresolved**
  (`f7-deps-missing` / `f7-deps-mismatch`), never silently excluded — exclusion is for rows
  outside the rule, not for missing evidence;
- `f1`-`f6` apply unchanged, with `wantOld = <bytes_root>/<old_tag>/<path>`,
  `wantNew = <bytes_root>/<stable>/<path>` (the new side is the DEPS-selected devtools revision at
  the stable tag, never "latest devtools").

## 4.4 Receipt schema v2 and the bytes-root defect

Receipt v2: `{schema:"tabi-release-pins-v2", stable, bytes_root, rows:[{id, fetched_by,
superseded_by?, files:[{path, old_tag, old_status, new_status, old_sha256, new_sha256, ranges}],
deps?:{old_tag, old_sha256, new_sha256, new_revision}}]}`. `bytes_root` is repo-relative, no `..`,
no absolute path. `old_bytes`/`new_bytes` fields are dropped (computed), which is the migration
from the round-29 receipt.

Why: at the tip `BYTES_ROOT` and `REFETCH_ROOT` are constants (`:71-72`) used inside `evaluate`
(`:209-210`), so `--receipt corpus/evidence/round-31/…` would still resolve bytes under
`corpus/evidence/round-29/…`; the counter would read stale bytes and could pass. The v2 counter
derives both roots from the receipt (`bytes_root`, `<bytes_root>/../refetch` or a `refetch_root`
field) and refuses a receipt without `bytes_root` (exit 2).

## 4.5 Controls

| id | shape | expected reading | fails target |
|---|---|---|---|
| J1 do-nothing | v1 counter at the tip, round-29 receipt | 23/23 resolved, exit 0 | population 23, seven ids absent |
| J2 receipt without DEPS | seven entries + bytes, no `DEPS` blobs | 7 unresolved (`f7-deps-missing`), exit 1 | unresolved 7 |
| J3 wrong mapping | the 156 `DEPS` blob submitted as the 154 one (says `bf69d041…`) | 7 unresolved (`f7-deps-mismatch`), exit 1 | unresolved 7 |
| J4 copied old as new | new devtools bytes = old bytes, `new_revision` = `66df492…` | `f7-deps-mismatch` on the stable side; if a file is also unchanged, `f3`/`f6` catch it | unresolved > 0 |
| J5 tag laundering | `deps.old_tag` = `156.0.8078.47` | `f7-old-tag-not-below-stable`, exit 1 | unresolved > 0 |
| J6 404 laundering | S044/S068 panels path recorded as bytes while the source 404s | `f3-bytes status` / `f6-refetch` mismatch, exit 1 | unresolved > 0 |
| J7 absolute bytes_root | `bytes_root: "/tmp/x"` | refusal exit 2 | not verified |

## 4.6 Targets

| field | before (v1 at tip) | target (v2) |
|---|---|---|
| population | 23 (count only, ids in `rows`) | 30 ids, rule string, excluded array |
| unresolved | 0 over 23 | 0 over 30 |
| DEPS rows checked | 0 | 7 (S036 S044 S068 S088 S089 S090 S118) |
| excluded named | none | 7 + 3 + 50 + 0 |
| receipt portability | round-29 constants | `bytes_root` from the receipt |

---

# 5. Freeze protocol and SCORECARD rows

## 5.1 Protocol (same shape as round 30's `061e6202`)

1. Land the three v2 counters + catalogue v2 + their new selftest cases in one commit.
2. A **non-author** seat attacks each before the freeze with the §2.5/§3.4/§4.5 controls (C1 also
   with declaration rights); findings are pasted into the round's w1 report.
3. Freeze counter + catalogue digests in that round's `claims.json` before any claim data.
4. Each claim's counting command reads the id sets/attribution fields; `exit 0` alone is never the
   reading (round-30 lesson: C2 F13, C3 clause (c)).
5. Measure at the named rev in a clean checkout; raw JSON under `measure/`.
6. SCORECARD corrections restate the superseded tallies by line (QUALITY 78): the round-30
   corrections at `SCORECARD.md:1497-1502` are the lines this round's counters supersede.

## 5.2 Planned rows (paste-ready; no lane edit made here)

Under `### Planned / saturation / retired — round 30`:

```markdown
- planned: operability — gate-mutants counter v2: opaque `run-*` ids, neutral child cwd and
  allowlisted env, kill attribution to declared behavioural cases with a target cross-check, crash
  attribution by anchored frame (`crash_frame`), `unattributed`/`concentrated_cases` fields; catalogue
  v2 adds the 22 `MutC1Beyond` rows (15 new cases, 7 regression rows) and 20 benign twins: target
  49/49 fault killed, 0/33 benign killed, 0 unattributed, 0 concentrated cases (round 30 before:
  27/27 counted, 14 kills only by reading, 15 beyond-catalogue survivors,
  `.ufo/waves/round-30/w2/MutC1Beyond.md`).
- planned: coverage — frontier-admission counter v2: https-only production `--live`, same-host
  https-only redirects with `url_effective`, `curl -q --no-netrc`, userinfo refusal, calendar-valid
  dates plus required `fetched_at`, straight/curly single-quote spans with a 4-word floor and no
  length cap, duplicate rows refused, anchored `source:` id extraction: target 2/2 admitted with
  `--live` and all 12 round-30 holdout shapes refused with named reasons (round 30 before: every
  holdout shape admitted 2/2 with `--live`, including `file://` inside `unshare -Urn`).
- planned: freshness — release-pin counter v2: population stated as a rule + id set + `excluded`
  reasons, DEPS-mapped devtools rows bound through committed `DEPS` blobs (`f7-deps`), receipt-carried
  `bytes_root`: target population ids = 30 (23 source-tag + S036 S044 S068 S088 S089 S090 S118),
  unresolved 0 at 156.0.8078.47 (round 30 before: 23 counted, 0 unresolved, seven rows outside the
  rule; S118 added after the rule was written).
```

Saturation 8 / window 3, stagnation nudge inactive, no axis retired — unchanged by this plan.

---

# 6. Out of scope / not claimed

- No lane edit, no counter build, no SCORECARD landing, no claim freeze: this seat drafts only.
- C2 wire-byte provenance (`wire_sha256`): not in v2. `l3` stays normalised-text equality; a
  re-expressed committed body still passes. The dynamic vendor page makes byte identity a tradeoff,
  and the clause needs a claim sentence, not a silent counter edit (CritC2Counter F2).
- C2 seat identity: a refetch seat is a label; no repo evidence can prove an independent agent.
- C1 byte-fingerprint class: a frozen declaration can be lied into, and B2 needs no channel; the
  pre-freeze attack (2.6) is the only defence, and it is review, not mechanics.
- C3 `main`-branch rows (S004 S028 S035) and the 50 non-chromium rows: excluded by the stated
  rule; no per-row cadence scheduler is proposed.
- No real-site interaction: this seat made zero network fetches; every number above is local.

# 7. Artifacts

Output dir `.ufo/waves/round-30/w2/ScribeV2Plan/`:

- `plan.md` (this file)
- `population-v2.json` — 118 rows / 90 on-release / v1 23 / DEPS 7 / v2 30, buckets and statuses
- `population.py` — the re-derivation script
- `frozen-sha256.txt` — the five scripts' sha256 at `072af95f`
- `pins-v1-at-072af95f.json`, `frontier-v1-offline-at-072af95f.json` — the two local readings
- `check-{gate-mutants,frontier-admission,s106-evidence,release-pins}-selftest.json` — 12/24/10/29
- `RECEIPTS.md` — commands, exit codes, scratch paths, restoration
