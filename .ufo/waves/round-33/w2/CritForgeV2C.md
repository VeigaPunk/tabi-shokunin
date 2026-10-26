# CritForgeV2C — s1 source-row rule, gate v2 at 042d6d9a (round 33, w2 falsify)

**Verdict: defect (medium).** The frozen C2 predicate still holds at the integration commit — I re-ran the
frozen counter at `042d6d9abf97d567d495652a85eabc851b81adc1` and it reads `predicate true`, forgeries
0/8, `honest {H0,H1,H2} true`, `selftest exit 0` (44/44), `digestLiterals []` — but the `s1-source-row`
leg admits the construction it was added to refuse. A fabricated `mined` S-row whose `source:` URL host is
`chromium.googlesource.com`, corroborated by a fabricated `## Gate` table row with the same host and a
made-up 64-hex sha256, exits **0 clean, 16/16 admitted**. The same forged row also passes when the Gate
row is in an older lesson, in an arbitrary new `round-zzz.md`, in a verifier-spotcheck file, outside any
table, or inside a code fence; and — worst — a fabricated row needs **no Gate row at all** if the entry's
`source:` line co-cites one honest S-id, because the witness loop breaks at the first grounded id
(`scripts/check-bidi-runtime.mjs:742-751`). That last case re-opens exactly the v1 hole the rule was
written for ("v1 read the registry row alone, so a fabricated row passed", `:46-52`), and it is not
covered by the selftest: both `v2-f8-junk-source-row` and the frozen battery F8 replace the `source:`
line with `S990` alone (`:1001`, counter `F8` builder), so multi-cite source lines are untested. Negative
controls that do hold: junk row with no Gate row (frozen F8), `http://`-only Gate URL, look-alike host
`chromium.googlesource.com.evil.example`, and registry-vs-Gate host mismatch are all refused.

## Answers to the assigned questions

| # | Construction (all: S990 `mined`, used-by the entry, absent at `--baseline`; entry's `source:` = `S990`) | v2 at 042d6d9a | reading |
|---|---|---|---|
| V1 | junk row `https://e.test/`, **no** Gate row (the frozen F8 shape) | exit 1, `s1-source-row` | refused |
| **V2** | junk row + Gate row, **same** chromium.googlesource.com URL, made-up 64-hex, appended `## Gate` table in **round-33.md** | **exit 0, clean, admitted 16** | **admitted** |
| V3 | same forgery, Gate row appended to an **older lesson** (`round-20.md`) | exit 0, clean, 16 | admitted |
| V4 | same forgery, Gate row in a **new arbitrary file** `corpus/lessons/round-zzz.md` | exit 0, clean, 16 | admitted |
| V5 | same forgery, Gate row in `round-32-verifier-spotcheck.md` | exit 0, clean, 16 | admitted |
| V6 | Gate row **outside any table** (no header/separator line) | exit 0, clean, 16 | admitted |
| V7 | Gate row inside a **fenced code block** under `## Gate` | exit 0, clean, 16 | admitted |
| V8 | Gate URL **different port** `https://chromium.googlesource.com:8443/...` | exit 0, clean, 16 | admitted |
| V9 | Gate URL **http:// scheme** only | exit 1, `s1-source-row` | refused |
| V10 | Gate URL look-alike host `chromium.googlesource.com.evil.example` | exit 1, `s1-source-row` | refused |
| V11 | Gate URL **different path**, same host | exit 0, clean, 16 | admitted |
| **V12** | junk row **smuggled beside the honest S124/S125/S126 cites**, no Gate row for S990 | **exit 0, clean, 16** | **admitted** |
| V13 | honest entry, `--baseline b7d16fb8` (the round-33 baseline) | exit 1, `s1-source-row`, empty detail | honest input refused |
| V14 | Gate host ≠ registry host (`e.test` vs chromium) — negative control | exit 1, `s1-source-row` | refused |

`s1 forgeries v2 still admits: V2, V3, V4, V5, V6, V7, V8, V11, V12. Refused: V1 (frozen F8), V9, V10, V14.`

## Sub-findings

1. **D1 (medium) — first-witness free pass, `scripts/check-bidi-runtime.mjs:742-751`.** The loop over
   `newRows` (`:736`) sets `witness` and `break`s on the first grounded id; `if (!witness)` (`:753`) never
   looks at the rest. The honest entry's real source line cites three ids (`S124 …; S125 …; S126 …`,
   `corpus/knowledge/webdriver-bidi-runtime-round-32.md:5`), so appending `S990` to it is admitted with no
   Gate row for `S990` anywhere (V12: exit 0, clean, 16/16). The rule's stated purpose (`:46-52`) is to stop
   a fabricated registry row; it stops one only when that row is the *only* new cite.
2. **D2 (low) — "table row" is not enforced (`:511-533`).** `gateRows` matches any `| … |` line whose first
   cell is `S\d{3,}` under a `## Gate` heading, with no table context (V6) and no fence tracking (V7). The
   header (`:49-50`) and Limits (`:112`) both say "`## Gate` table row", so the implementation is narrower
   than the document in the wrong direction: it accepts more than documented.
3. **D3 (low) — host-only URL comparison (`:535-540`, `:748-749`).** `urlHost` keeps `hostname`, so port
   (V8) and path (V11) are ignored: the Gate URL need not be the page the registry row cites. This matches
   the header's wording ("whose host equals"), but the Limits sentence "It closes a fabricated registry row"
   (`:113-114`) is then false as written — the row is closed only against a second artifact that reproduces
   nothing but the host.
4. **D4 (low) — lesson-file surface (`:515`).** `round-[^/]+\.md` admits older lessons (V3), verifier
   spotcheck notes (V5) and a brand-new arbitrary file (V4). The header says `round-*.md`, so this is
   documented breadth rather than a mismatch; it does mean an ungrounded row needs only a second committed
   file, which the same author writes.
5. **D5 (low) — honest refusal under the round baseline (V13).** With `--baseline b7d16fb8` the honest entry
   at `042d6d9a` fails `s1-source-row` with **empty** `entryDetail` (no `newRows`), because its cites
   `S124-S126` all exist at that baseline. `measure.sh:36` passes `d805d1d6` (round-32's baseline), so H0 is
   "honest" only relative to a stale baseline; the gate cannot distinguish "no cited row is new this round"
   from "cited row is forged", and a caller following the round convention gets a false failure on honest
   bytes. Documented in the header, but it makes the honest leg baseline-dependent, which C2's `feasibilityDisclosed`
   does not mention.

## Smallest safe correction (measured, not proposed blind)

Tested in a scratch copy of the gate (`patched-gate.mjs`, sha256 `7f3328feed261517fa3f5568753d0b6909cf8772e7a05ff7713424ebffdc7401`,
lane file untouched), three local edits:

1. `:742-751`: require **every** id in `newRows` to be grounded (`if (!witness || why.length)`), not the first
   one — kills V12; H0 still admitted because S124/S125/S126 all have round-32 Gate rows with matching URLs.
2. `gateRows`: accept an S-id line only after a table separator has been seen in the same `## Gate` section
   (blank line resets), and skip fenced blocks — kills V6, V7; the selftest fixture already writes a real
   table, so `--selftest` stays 44/44 exit 0.
3. `:748-749`: compare `new URL(regUrl).href` with `new URL(gateUrl).href` (scheme+host+path), not
   `hostname` only — kills V8, V11; requires one fixture line in `lessonsDoc` (`https://e.test/<id>` →
   `https://e.test/`) to keep the selftest clean.

Patched readings (same variants, same commits pattern): V0 honest exit 0 / 16 admitted; V1, V6, V7, V8, V9,
V10, V11, V12, V14 exit 1 `s1-source-row`; `--selftest` `clean cases=44 passed=44`, exit 0. **Still admitted
by the patched gate:** V2, V3, V4, V5 — a forger who writes a Gate row that reproduces the cited URL exactly
is offline-indistinguishable from an honest one, which is the disclosed limit (`:112`) and cannot be fixed
without fetching or digest binding. Optional strengthening not taken here: require a 64-hex token shared
between the Gate row and the registry row — true for S124-S128 (shared digests 1,1,1,2,2) but S129's registry
row carries **no** 64-hex, so it would false-refuse any entry citing S129.

## Evidence

Scratch clone (one seat, `--shared`, detached at the target), forged commits only inside it; lane untouched
(read-only `git show`/`ls-tree`/`rev-parse` only). All gate runs: `node <clone>|patched-gate.mjs --repo <clone>
--rev <variant> --baseline <BASE> --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json`, cwd =
clone, `TMPDIR=/fast/scratch/hyaku/tabi-r33/CritForgeV2C/tmp`.

```
$ git clone -q --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 042d6d9a
$ test "$(git -C "$S/clone" rev-parse --show-toplevel)" = "$S/clone"   -> exit 0 (TOPLEVEL_OK)
$ TMPDIR=… node forge.mjs                                               -> exit 0 (14 variants + pristine honest run)
$ node scripts/check-bidi-runtime.mjs --selftest --json                 -> exit 0, cases 44 passed 44 ok true
$ node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
    --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --repo "$S/clone" --json
                                                                        -> exit 0, predicate true,
    honest {H0:true,H1:true,H2:true}, forgeriesAccepted 0/8, selftest exit 0, digestLiterals []
$ node patched-gate.mjs --selftest                                      -> exit 0, clean cases=44 passed=44
$ GATE_OVERRIDE=…/patched-gate.mjs OUT_PREFIX=patched node forge.mjs     -> exit 0 (patched readings above)
$ pgrep -fa 'chromedriver|chromium'                                     -> only `1371 /usr/bin/earlyoom -r 3600 --avoid
    (^|/)(Hyprland|Xwayland|…)$ --prefer (^|/)(java|node|chromium|python3?)$` (earlyoom's own argv; no
    chromedriver/chromium process was started by this seat)
```

Line evidence in the lane at `042d6d9a`: `scripts/check-bidi-runtime.mjs:46-52` (s1 definition),
`:112-114` (Limits: "reads one table row's text … It closes a fabricated registry row"),
`:515` (lesson glob), `:522-529` (Gate-section scan, no table/fence state), `:535-540` (`firstHttps`/`urlHost`),
`:736` (`newRows` filter), `:742-751` (first-witness `break`), `:753` (`!witness` verdict);
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:5` (three-id source line);
`.ufo/waves/round-33/measure.sh:36` (gate run with baseline `d805d1d6`, not the round baseline).

V2's admitted run (`gate-V2-junk-row+forged-Gate-row-round-33.json`): `clean true, entryFinding null,
population 17, admitted 16, failing 0, unmeasured 1, distinct 16`; the diff (`diff-V2-…patch`) is three
lines of forgery — one registry row, one `source:` line, one Gate table row whose digest is
`0123456789abcdef…` (a literal, never compared to anything).

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/CritForgeV2C.md` (this file)
- Artifacts: `.ufo/waves/round-33/w2/CritForgeV2C/` — `s1-forge-results.json` (all 14 verdicts),
  `gate-V*.json` (full gate output per variant), `diff-V*.patch` (the exact forged bytes),
  `patched-V*.json` / `patched-selftest.txt` (correction readings), `frozen-counter-at-042d6d9a.json`,
  `selftest-at-042d6d9a.json`, `forge.mjs` (sha256 `8d78092d7ac04bc84fe6ba1ca517a2039157cee56c73d8587407a2ab7cbe6d11`),
  `patched-gate.mjs`, run logs.
- No tool installed or upgraded; no network fetch made (all forgery URLs are never requested by the gate);
  scratch `/fast/scratch/hyaku/tabi-r33/CritForgeV2C` removed before yield.
