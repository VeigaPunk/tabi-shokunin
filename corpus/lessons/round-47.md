# Round 47 — tabi (Windows host; the regression gate re-run, the routed gate repair, one frozen claim refused)

Baseline `b95b546949e71f34bfaa1e63de44aff4b4d29371` → freeze
`80325bd8e977a2730cb7b2bbd16ae26d4b022648` → data `d76eb5bbf84276d0f0d568d6918e1e571555a441`
→ correction 1 `524910a98abe7d21ed81bfffb1366d43eea0e8a5` (**cited measured revision for C1**) →
C2 repair `c2711c47fb12c88c401268fbcdd5a41ed9adddae`. Two declared claims: C1 adjacency (lowest
owned axis, 8) — the r46-planned regression-gate re-run of the adjacency ledgers, which measured
REAL (17 findings at round open: ten sibling heads advanced since the r46 snapshot, three provinces
changed bytes); C2 operability — the r46-routed host-portable repair of
`scripts/check-adjacency.mjs`'s `minimalEnv` PATH pruning (sourced S157). **C1 VERIFIED under its
frozen predicate. C2 REFUSED under its own frozen kill rule** (the repair landed and live-verifies,
but the frozen after-state — "verified=10, findings exactly 6 × sibling_unresolved" — was
mis-authored from reasoning instead of a pre-data measured prediction: the repaired gate honestly
prints verdict=failed, rows=16, verified=5, findings = 6 × sibling_unresolved (exactly the absent
siblings, as frozen) + 4 × ruling_unresolved + 3 × quote_too_long). **Round admission:
FALSE — reported honestly; a claim refused under a pre-declared kill rule is not re-declared
post-data.** No axis is harmed; the round is an honest stop with one verified claim and one
refused claim whose object-level repair is landed and measurable.

## Carry-in items from the r46 non-author closure (all addressed)

- **V1 (number-drift, S155 anchor) — closed as S156.** New SOURCES row whose `teaches` opens
  `supersedes S155 —`: the committed staged copy is **104,255 B** — `git cat-file -s
  859d441fa1f5b5f70e1ec6ca636e91edf1ae481b` → 104255 (re-run 2026-11-01) — sha256
  `317f30f2…` UNCHANGED (the bytes were right, the count drifted); the superseded "104,251 B"
  text is named in the row and in this lesson; S155 itself is not edited (append-only contract).
- **V2 (provenance trio missing) — closed per the r21-corrected precedent.**
  `corpus/knowledge/chrome-cdp-teardown-round-46-corrected.md` opens with the machine-readable
  trio (`source:` citing S156, `verified-at:`, `recheck:` with a concrete command) and carries the
  r46 body verbatim (suffix-identity asserted at write time); the original note keeps an
  append-only supersession paragraph; README index rows landed (round-47 section + correction
  index). Knowledge notes 63 → 64.
- **V3 ("five readings" wording) — superseded with a derivable disclosure.** A fresh selfassessment
  receipt at the repair commit (`.ufo/waves/round-47/measure/selfassessment-precommit.txt`) reads
  `SELFASSESSMENT verdict=failed rev=c2711c47… mismatches=1 could_not_evaluate=171 superseded=24`;
  the single mismatch is `m3-unlanded-paths` (the pre-commit artifact — the receipt was written
  before this round's integration commit). The same command at the r46 measured revision reads
  `mismatches=1 could_not_evaluate=175 superseded=23` (committed
  `.ufo/waves/round-46/measure/selfassessment-precommit.txt`) — the same single m3 class at both
  revisions; the r46 note's "all five m1-selftest-tally readings are pre-existing" is not
  derivable from any receipt line and is superseded by this derivation (README correction index;
  SCORECARD round-47 block). Every number in this disclosure is quoted from a receipt's own
  summary line.
- **L2-floor L0 (tabi | round-44) — still open, routed around.** No wave-settled clause in any
  predicate; the round ran L1-inline; the open question is never treated as answered.

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S156 — Win32_Process anchor correction (supersedes S155), https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-process | 2026-11-01 | `git cat-file -s 859d441fa1f5b5f70e1ec6ca636e91edf1ae481b` → 104255; `git cat-file blob 859d441f… \| sha256sum` → 317f30f2b10c2dc7fbfc3e42a76b1cc914189c41e78362682061b85e1558d253 (staged copy `.ufo/waves/round-46/sources/win32-process.html`, the r46 bytes) | supersedes S155 — byte count corrected 104,251 → 104,255 (11 words; the row's own teaches cell) |
| S157 — Node.js path API, https://nodejs.org/docs/latest-v24.x/api/path.html | 2026-11-01 | `curl -q -sL --proto =https -o .ufo/waves/round-47/sources/node-path.html https://nodejs.org/docs/latest-v24.x/api/path.html` → 59,344 B (`wc -c`), sha256 `7b14f91d3d43b614b4232e367e34a544ca8ced97aabaf5628cf71db0a40ae969`; the delimiter sentence has 1 hit in the raw bytes | "Provides the platform-specific path delimiter: ; for Windows : for POSIX" (11 words; `path.delimiter` property section; 1 hit in the raw bytes) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains the
closure's duty): ADMIT — S156 (the correction re-measures the committed blob; the superseded count
is named; load-bearing for V2's trio). ADMIT — S157 (raw-fetched this round, staged, quote
verbatim 1-hit; the repair's two primitives; load-bearing for C2). ADMIT — C1 (red 17 findings at
round open on committed meter bytes; green exit 0 / predicate true / 0 findings at the correction-1
revision; selftest clean 16/16; retarget diff comment/const/schema-only). **REJECT — C2 as
frozen** (kill rule fired: findings other than the six absent-sibling sibling_unresolved —
4 × ruling_unresolved: the `fleet` ruling venue cannot resolve on this host because the fleet
repo (`shokunin-clone/shokunin`) and the sibling checkouts (`…/fleet/`) are different directories
and the gate requires one dir to be both; 3 × quote_too_long: the legacy gate's 25-word quote cap
contradicts the r46 meter-era whole-line quotes on kagi :64 / kama :355 / kake :310; verified=5,
not the frozen 10). The object-level repair is NOT rejected: red exit 2 `git_failed (status=spawn)`
at round open → repaired exit 1 evaluated at `c2711c47`, selftest `ADJACENCY_SELFTEST verdict=clean
cases=57 reasons=18 could_not_evaluate=6` on this host, and the only functional delta vs the freeze
blob is the `minimalEnv` PATH block (committed diff). The repair is landed, live-verified, and
re-declarable next round with an honestly-predicted predicate. REJECT — the first green meter run
(`d76eb5bb`): `lane-screen-head-mismatch` ×2 (shokunin-reverse-engineering, tsukuroi advanced
between the ledger snapshot and the meter run) — corrected under the frozen kill-rule data flow
(correction 1 re-binds both ledgers at one fresh snapshot; second Mistake below records the
message-drift on that commit).

## Measurements (counting commands, paste-able)

- C1 (adjacency — the regression-gate re-run; VERIFIED):
  - Before: `node .ufo/waves/round-46/counters/c1-adjacency-host-v6.mjs --rev b95b5469… --repo
    <lane> --fleet <fleet>` → exit 1, predicate=false, **findingCount 17** (3
    lane-screen-sha-mismatch, 3 lane-screen-lines-mismatch, 1 lane-screen-hits-mismatch,
    2 delta-line-missing, 8 lane-screen-head-mismatch) — receipt
    `.ufo/waves/round-47/controls/c1-meter-red-at-round-open.json`, taken at round open before any
    lane write.
  - After: `node .ufo/waves/round-47/counters/c1-adjacency-host-v7.mjs --rev 524910a9… --repo
    <lane> --fleet <fleet>` → exit 0, predicate=true, **findingCount 0**, counts {roster:16,
    mapRows:16, auditRows:16, deltaLanes:12} — receipt
    `.ufo/waves/round-47/measure/c1-meter-green-at-correction1.json`.
  - Instrument: `node .ufo/waves/round-47/counters/c1-adjacency-host-v7.mjs --selftest` → exit 0,
    allPass=true, cases=16, pass=16 (`.ufo/waves/round-47/measure/c1-meter-v7-selftest.json`);
    `diff` v6→v7 committed (`.ufo/waves/round-47/controls/v6-v7-retarget.diff`) — comment,
    ledger-filename const and schema-string hunks only; meter blob
    `168e1ecc76ebe547c3242c01e0697df1d899e5f9` identical freeze → measured (`.ufo/waves/round-47/
    measure/c1-committed-bytes-at-cited-rev.txt`).
  - Ledgers: `awk -F'\t' 'NR>1{n[$2]++} END{for(k in n) print k, n[k]}'
    corpus/adjacency-host-audit-r47.tsv` → `unchanged 10 / sibling-absent 6`; delta-r47 = 12 lane
    rows + 16 line rows; binfor's 2 new browser-ground lines (:30 rea-cdp-browser surface, :33
    list-browser-targets over loopback CDP) adjudicated `contested-open` — the same family as the
    sre `:53` row (fleet L0 `b6b3b5e4…` :65 still open); all other dispositions carried from r46
    by exact whole-line quote match.
- C2 (operability — the routed repair; claim REFUSED, repair landed):
  - Before: `node scripts/check-adjacency.mjs --repo <lane> --fleet <fleet> --json` → exit 2,
    `could_not_evaluate`, `git_failed`, `status=spawn` — receipt
    `.ufo/waves/round-47/controls/c2-gate-red-at-round-open.json` (round open; corroborated by the
    committed r46 receipt `c2-check-adjacency-hostbound.json`).
  - After (repaired bytes, commit `c2711c47`): same command → exit 1, verdict=failed, rows=16,
    verified=5, findings 6 × sibling_unresolved + 4 × ruling_unresolved + 3 × quote_too_long —
    receipt `.ufo/waves/round-47/measure/c2-gate-green-at-data.json`. The frozen predicate
    demanded verified=10 with EXACTLY the 6 absent-sibling findings → **kill rule fired, claim
    refused**. The 6 absent-sibling findings match the audit-r47 `sibling-absent` rows 1:1 (the
    one cross-check limb that held).
  - Repair scope: `git diff 80325bd8..c2711c47 -- scripts/check-adjacency.mjs` → the import line
    and the `minimalEnv` PATH block only (`path.delimiter` split/join, `isAbsolute` keep); gate
    blob pre-repair `0a24cfec` → repaired `ac720457`.
  - Self-test: `node scripts/check-adjacency.mjs --self-test` → exit 0, `ADJACENCY_SELFTEST
    verdict=clean cases=57 reasons=18 could_not_evaluate=6`
    (`.ufo/waves/round-47/measure/c2-gate-selftest.json`) — the repaired gate runs its full
    fixture fleet on this host, symlink cases included.
- Registry: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` 155 → 157
  (S156 correction, S157 new). Knowledge: `ls corpus/knowledge/*.md | wc -l` 63 → 64 (the
  corrected entry; the original keeps its supersession append).

## Mistakes

| Class | Evidence | Captured-by | Fix / status |
|---|---|---|---|
| stale-premise in a frozen predicate (the C2 after-state was reasoned, not measured) | the freeze's C2 predicate predicted `verified=10`, findings exactly 6 × sibling_unresolved; the repaired gate honestly prints verified=5 with 4 ruling_unresolved (fleet-venue split: the fleet repo and the sibling checkouts are different directories on this host, the gate requires one dir to be both) and 3 quote_too_long (the legacy 25-word quote cap vs the r46 meter-era whole-line quotes) — `measure/c2-gate-green-at-data.json` | the frozen kill rule itself, firing at data time (no softer gate exists for predicate text; the discipline held — the claim was refused, not re-declared post-data) | C2 refused; refusal + refusal rationale on record here and in SCORECARD; durable fix for the next freeze: a predicate's numeric after-state is either measurable pre-data (a prediction receipt over the same bytes) or keyed to refusal CLASSES (persisting could_not_evaluate; repair-regression findings) rather than exact counts — recorded for the r48 freeze |
| landing — a commit message naming a change its bytes do not carry | `d76eb5bb`'s message names the C2 repair while its `scripts/check-adjacency.mjs` blob is pre-repair `0a24cfec` (the edit was made after the helper ran); caught in this session's own post-commit scope review minutes later | the pre-push scope check this round now runs on every helper commit (`git diff --stat` over the named paths BEFORE invoking the helper) | `c2711c47` lands the repair and its message names the correction; disclosed here, in LOG round-47, and in the report; the helper invocation order is corrected going forward |
| number-drift mined from r46 per the §2b duty (the V1 count drift itself) | S155's anchor cell and the r46 lesson Gate row recorded "104,251 B" for the fetched page; the committed staged blob is 104,255 B with the recorded sha — the bytes were right, the count drifted; the r46 Gate row carried the count WITHOUT its measuring command | the r46 non-author closure's re-measure (closure defect V1); the CORPUS rule "a count carries its command" would have caught it at write time had the command been pasted | closed as S156 (supersedes S155, count + command); durable practice: no byte count lands in a Gate row or anchor cell without the command that produced it beside it |

## Census

Start (2026-11-01, round open): `bash <fleet>/scripts/sources-census.sh validate --root <fleet>
tabi` → exit 0, `tabi ok`, 21 pre-existing W04 duplicate-URL warnings (same set r43–r46
disclosed); receipt `.ufo/waves/round-47/measure/census-start.txt` (committed in the freeze).
End (round close): same command → exit 0 (receipt `.ufo/waves/round-47/measure/census-end.txt`)
with **22 W04 duplicate-URL warnings**: the 21 pre-existing (same set r43–r46 disclosed) plus one
new — S156 intentionally re-uses S155's URL, a correction row sharing its source by construction
(disclosed here; the census exit stays 0).
`node scripts/check-sources.mjs` → exit 0, `verdict=clean rows=157 tiers=A:141,B:7,C:9
status=queued:15,mined:132,rejected:10 findings=0` at the integration tip (receipt
`.ufo/waves/round-47/measure/check-sources-at-integration.txt`; S156/S157 used-by paths land in
the same commit).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-01). Shokuknow register not
reachable from this host. Assimilation: none — shokuknow unreachable.
