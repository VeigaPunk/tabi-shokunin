# MutC2Counter — self-test kill matrix for `check-frontier-admission.mjs --selftest` (round 30 w1)

## Verdict

The 24-case self-test of the frozen C2 counter (sha256 `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`, byte-identical at rev `061e62024c0523d3c6c7e819506a773ff2cd7d75`) kills 19 of 24 single-point disables at the case level (suite exits 3 with at least one failing case) and detects 2 more only by crashing (uncaught `TypeError`, exit 1, no case asserted) — leaving **3 genuine survivors, i.e. three behaviors no case watches**: (1) **g1's receipt-id match** — a committed receipt whose `id` differs from the cited id still passes 24/24; (2) **the 13-cell registry-row guard** — a malformed short row for the cited id changes nothing; (3) **normalise()'s script/style stripping** — dropping it leaves the HTML fixture case green because no fixture ever quotes text that lives only inside a `<script>`/`<style>` block. All three are coverage findings against the self-test only (the production checks themselves are intact); the cheapest missing case for each is a one-entry addition to the frozen `CASES` table reusing the existing `std()` fixture helper, specified below. The lane was never modified: pristine, lane, and post-run clone bytes all hash `cadef57e…9eca` and `git status --porcelain` on the path is empty.

## Environment and baseline

- `node v24.21.0`, `git 2.56.0`; no tools installed or upgraded (operator tooling authorization unused).
- Scratch: `S=/fast/scratch/hyaku/tabi-r30/MutC2Counter` (created with `mkdir -p`); one live clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75` → `HEAD=061e6202…`, `sha256sum` → `cadef57e…9eca` (matches `frozenDigests`), `git status --porcelain | wc -l` → `0`.
- Detector baseline (pristine bytes): `cd "$S/clone" && TMPDIR="$S/tmp" node scripts/check-frontier-admission.mjs --selftest --json` → **exit 0**, `ok=true, cases=24, passed=24` (`runs/m00-pristine.json`). Detector sound on pristine bytes, so every nonzero mutant result below is a kill, not a baseline artifact.

## Method

Each mutant is a scratch copy of the pristine file (`cp`, then one surgical `edit` each — recorded per-mutant in `diffs/mNN-*.diff`, full bytes in `mutants/mNN-*.mjs`) that disables exactly one behavior-bearing point, then `TMPDIR="$S/tmp" node "$S/mutants/mNN.mjs" --selftest --json` runs the identical 24 cases against temporary fixture repos. Runs never touched the lane checkout, the lane git state, or any sibling; the `--repo` default (`LANE`) is unused on the `--selftest` path (fixtures are created under `TMPDIR`). No network was used (self-test cases fetch via `file://` only).

Loop run:

```
cd "$S/mutants" && for f in m*.mjs; do n="${f%.mjs}"; \
  TMPDIR="$S/tmp" node "$f" --selftest --json > "$S/runs/$n.json" 2> "$S/runs/$n.err"; echo "$n exit=$?"; done
```

Exit codes observed: `0` = suite clean → **survived**; `3` = suite ran, ≥1 case failed → **killed**; `1` = uncaught crash, no case results → **killed (crash, degenerate)**.

## Kill matrix (detector: `--selftest --json`, 24 cases; "killed by" = failing case ids)

| Mutant | Disabled point (one line) | Exit | Verdict | Killed by |
|---|---|---|---|---|
| m01-e1-off | e1 provenance push → `if (false)` | 3 | killed | `provenance-missing` |
| m02-r1-default-allow | r1: missing row fabricated as permissive `{status:"mined", usedBy:path, opened:since, …}` | 1 | killed (crash) | uncaught `TypeError: … reading 'source'` at `loadReceipt` L204 (trigger case: `row-missing`; `loadReceipt`'s own `rows.get(id)` still returns undefined) |
| m03-r2-off | r2 status → `if (false)` | 3 | killed | `status-queued` |
| m04-r3-off | r3 used-by → `if (false)` | 3 | killed | `used-by-omits-entry` |
| m05-r4-off | r4 opened → `if (false)` | 3 | killed | `opened-before-round` |
| m06-g1-id-off | g1: `!rc \|\| rc.id !== id` → `!rc` (id match dropped) | 0 | **SURVIVED** | — (24/24 clean) |
| m07-g1-full-off | g1 fully off → `if (false)` | 1 | killed (crash) | uncaught `TypeError: … reading 'url'` at `loadReceipt` L204 (trigger case: `receipt-missing`; `rc` null deref) |
| m08-g2-off | g2 url-in-row → `if (false)` | 3 | killed | `receipt-url-not-in-row` |
| m09-g3-off | g3 bytes/sha/status → `if (false)` | 3 | killed | `bytes-sha-mismatch`, `http-status-not-200` |
| m10-g4-upper-off | g4 words ≤25 bound dropped (`n > 25` conjunct removed) | 3 | killed | `quote-over-25-words` |
| m11-g5-off | g5 quote-located → `if (false)` | 3 | killed | `quote-not-in-bytes` (falls through to `g7-refetch` reason; reason-id assertion catches it) |
| m12-g6-off | g6 lesson gate → `if (false)` | 3 | killed | `quote-not-in-lesson-gate` |
| m13-g7-off | g7 refetch → `if (false)` | 3 | killed | `refetch-same-seat`, `refetch-bytes-lack-quote` |
| m14-q1-off | q1 entry-quote → `if (false)` | 3 | killed | `entry-quote-fabricated` |
| m15-l1-off | l1 live-located → `if (false)` | 3 | killed | `live-file-url-quote-gone` — **exit 1 and admitted 0 still matched; kill rests entirely on the first-reason-id assertion** (observed `reason="l3-live-bytes S001"` vs expected `l1-live`; recorded in `runs/m15-l1-off.json`) |
| m16-l3-off | l3 live-bytes equality → `if (false)` | 3 | killed | `live-bytes-differ-from-committed` |
| m17-tag-off | tag-line population filter → `if (false)` | 3 | killed | `no-tagged-entry-fails-zero` |
| m18-rowregex-noindent | row regex `^ {0,3}\|` → `^\|` | 3 | killed | `indented-row-found` |
| m19-cells13-off | 13-cell guard → `if (false)` | 0 | **SURVIVED** | — (24/24 clean) |
| m20-norm-html-off | normalise HTML-detection branch → `if (false)` | 3 | killed | `html-normalised-quote-located` |
| m21-norm-scriptstyle-off | normalise `<script>`/`<style>` stripping removed | 0 | **SURVIVED** | — (24/24 clean) |
| m22-norm-entities-off | normalise entity decoding short-circuited (`return m;` first) | 3 | killed | `html-normalised-quote-located` |
| m23-norm-collapse-off | normalise whitespace collapse/trim removed (`return t;`) | 3 | killed | 11 cases: `admitted-clean`, `indented-row-found`, `quote-not-in-lesson-gate`, `refetch-same-seat`, `refetch-bytes-lack-quote`, `entry-quote-fabricated`, `entry-quote-in-code-span-ignored`, `html-normalised-quote-located`, `live-file-url-located`, `live-file-url-quote-gone`, `live-bytes-differ-from-committed` |
| m24-clean-rule-nopop | `clean` drops `population > 0` conjunct | 3 | killed | `no-tagged-entry-fails-zero` |

Totals: 24/24 mutants detected (19 case-level kills, 2 crash kills, 3 survivors `m06`/`m19`/`m21`); raw per-case JSON for every run in `runs/`.

## Coverage findings — cheapest missing case per survivor

All three proposed cases are one entry in the (frozen) `CASES` table reusing the existing `row()`/`registry()`/`entry()`/`std()` helpers; none changes any catalogued production line. They are findings for the L1 to weigh against the C2 freeze contract — not changes I made anywhere.

1. **m06 (g1 id-match)** — missing case `receipt-id-mismatch`: build standard fixtures via `std(d)`, then overwrite `${DEFAULT_RECEIPTS}/S001.json` with a receipt whose `id` is `"S099"` (everything else valid). Expect exit 1, admitted 0, first reason `g1-receipt`. Pristine passes it (`rc.id !== id` fires); m06 admits the entry (url, bytes, sha, quote, lesson, refetch all still line up) → killed.
2. **m19 (13-cell guard)** — missing case `malformed-row-not-a-row`: registry contains, for the cited id, a short row such as `` `| S001 | Fixture spec — ${URL} | spec | A |` `` (5 cells instead of 11) plus the standard receipt fixtures. Expect exit 1, first reason `r1-row-missing`. m19 parses the short row (status `undefined` → first reason becomes `r2-status`) → killed on the reason-id assertion.
3. **m21 (script/style stripping)** — missing case `quote-in-script-block-ignored`: committed bytes = the existing `HTML_TEXT` fixture (its `<script>` already contains `hidden words in a script`), receipt `quote = "hidden words in a script"`, entry body quoting that span only inside a code span (`` `hidden words in a script` ``) so q1 stays out of the way. Expect exit 1, first reason `g5-quote-located`. Pristine strips the script block (quote absent); m21's tag-strip alone leaves the script text (quote present → admitted, exit 0) → killed.

Secondary observations from the matrix (no action implied): the l1 kill depends wholly on the first-reason-id assertion — under an exit/admitted-only oracle, `live-file-url-quote-gone` would still "pass" via the l3 reason; and both full-disable forms of g1 (`m07`) are caught only by an uncaught `TypeError`, not by any asserted case, which is detection but not diagnosis.

## Restoration evidence

- Mutants lived only in `$S/mutants/`; the clone's `scripts/check-frontier-admission.mjs` was never modified during runs (mutants executed from their own paths).
- Post-run hashes (all equal to the frozen `frozenDigests` value `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`): output-dir pristine copy, lane file `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-frontier-admission.mjs`, clone file.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain -- scripts/check-frontier-admission.mjs` → empty (exit 0). No lane tracked file, index, or jj state touched; no commits anywhere.
- Archive: `.ufo/waves/round-30/w1/MutC2Counter/{pristine-check-frontier-admission.mjs, mutants/m01…m24.mjs, diffs/m01…m24.diff, runs/m00…m24.{json,err}}`.

## Fetch log

None — no network fetches were performed by this seat (self-test only; `--live` cases resolve `file://` URLs inside temp fixtures).
