# RevQuality92 — round 34 w2 — QUALITY criteria 92-96 review (falsify)

Reviewed: criteria 92-96 appended to `corpus/QUALITY.md` at the wave-1 integration `04f9623dde8ad35d470cecf766e421eafbcb47fa` (diff vs baseline `15dfaccb34601c2d221c78501e2befd8998d600c` = +78 lines, corpus/QUALITY.md only). Everything read at pinned commits; no lane file, index, jj state, sibling repo or fleet-root file written. No tools installed; no browser launched. Network: two read-only HTTPS GETs (receipts below).

## Verdict

**Defect, low severity.** All five criteria are checkable, none contradicts criteria 1-91, each cites a lesson/red state that exists — and three of the five red states were re-executed by this seat, not just read: 92's red replay (`9f008f6c` → mismatches 1, exit 1, counted finding byte-equal to the criterion's quote), 93's 404-sha instability (my own fetch produced a fifth distinct sha256 over the same 233-byte body), and 96's probe A (rebuilt from w1's committed builder in my own scratch clone; the frozen C1 counter reads exit 0, predicate true, newMapped 3). Criterion 96 would have caught round-34 lesson M3: round-33 M5 names the rename route before the freeze, and 96 makes every such named construction a required, scored freeze control, so the gap would have surfaced at the freeze instead of after integration — though 96 scores the omission, it does not itself force a repair. The defects are in the landed text, not the substance: (1) criterion 95's two in-gate line anchors are reference-drifted at the very commit that appends them — exact at the baseline gate (`:1037` = `gateSource`, `:1108-1110` = the case-result assertion), but at `04f9623` `:1037` is an M08 comment, `gateSource` sits at `:1086` and the case-result push at ~`:1160` (CASE print `:1213`), and no revision is pinned, so by criterion 28 they do not resolve as committed bytes in the current tree; (2) criterion 92's parenthetical "one mismatch per porcelain path" misdescribes the code it cites — `check-selfassessment.mjs:421-423` returns ONE `m3-unlanded-paths` finding per run with `observed = paths.length`, and the header at `:60-61` says "Counted once per run with the porcelain path count". Adjacent finding: the round-34 lesson that 95/96 cite violates criterion 77 (`grep -c '^| M[0-9]'` = 4, `grep -c '^### M[0-9]'` = 0).

## Per-criterion verdicts

### 92 (integration hygiene) — holds; wording defect (low)

- Lesson/red state exists: `corpus/lessons/round-33-verifier-spotcheck.md:162` is exactly routed defect 4 ("Run `check-selfassessment` before each integration commit. Two commits this round read mismatch 1 (`bf48b81c`, `9f008f6c`)…"); `claims.json` priorClosure item (4) matches.
- Red state re-executed (script at `04f9623`; `scripts/check-selfassessment.mjs` unchanged `59f1b47a`→`04f9623`, empty diffstat):
  - `node scripts/check-selfassessment.mjs --repo $S/clone --rev 9f008f6c --json` → exit **1**, `mismatches:1`, counted finding `{class:m1-selftest-tally, doc:SCORECARD.md, line:1829, script:scripts/check-adjacency.mjs, claimed:44, observed:57, superseded:false}` — byte-matches the criterion's quoted receipt. Receipt: `RevQuality92/sa-9f008f6c.json`.
  - `--rev bf48b81c` → exit 0, `mismatches:0` (`sa-bf48b81c.json`); `--rev 59f1b47a` → exit 0, `mismatches:0` (`sa-59f1b47a.json`). Confirms both the "clean replay never supersedes the candidate reading" motivation and the freeze reading.
- Cited code: `:57-61` holds the m3 definition; `:419-423` is `m3Findings` (`git status --porcelain --untracked-files=all`, one finding, `observed: paths.length`). **Defect (low):** the criterion's "(…, one mismatch per porcelain path)" contradicts both cited lines — mismatches counts findings, not paths.
- Checkable: yes — the receipt triple (rev, exit, porcelain count) is mechanical.

### 93 (404 receipts) — holds

- Lesson/red states exist, line-exact: `corpus/lessons/round-33.md:73` = "`docs/linux/sandboxing.md` … HTTP 404, 233 B, sha256 `b52a956c…5198`"; `corpus/lessons/round-33-verifier-spotcheck.md:134` = the closure row with `3bd81c56…`; `:168` = "Record 404 receipts by body text, not sha."
- This round's two fetches are backed by committed seat receipts: `.ufo/waves/round-34/w1/ScribeQuality/receipts/404-fetch-{1,2}.tsv`, `404-body-{1,2}.txt`, `provenance.txt` (19:47:51Z/19:47:52Z, 233 B, `582edd5a…`/`b427426b…`, request_ids `6f1045c9…`/`d2dac4cd…`) — exactly as the criterion quotes.
- Independently reproduced: `curl -q -sS --proto =https` to `chromium.googlesource.com/chromium/src/+/154.0.8037.97/docs/linux/sandboxing.md?format=TEXT` — 2026-10-26T20:23:20Z, HTTP 404, 233 B, sha256 `c0d8d296…3497` (a fifth distinct sha over the same 233-byte body), first line `NOT_FOUND: Requested entity was not found` verbatim; a second fetch at 20:23:21Z hit the known Gitiles 503 transient (1,459 B HTML; the round-33 lesson's own practice retries 503s). Instability claim confirmed.
- Checkable: yes. No conflict with 39/67 — those bind content-bearing (200) receipts; 93 keeps the sha for 200s.

### 94 (lead lists keyed by path+quote) — holds; every locator verified

- `ConnSiblingScan/leads.tsv:24` = the kake `mirror-pitfalls.md:39@04404859…` lead with quote ``Lease first: `webzites lease acquire --owner <n> --ttl-ms 900000`; release`` — exact.
- kake pin `044048597d62f3199494b63b36e90dd57825e350`, `corpus/knowledge/mirror-pitfalls.md`: `:38` = `## Browser/CDP lane`, `:39` blank, `:40` = `- Lease first: …` — byte-exact as the criterion states.
- `c1-candidates.tsv:56` keys the candidate at `:40` — exact.
- Frozen counter `c1-adjacency-sweep-v2.mjs` (bytes `0dba816c…` = `claims.json:frozenDigests`): `:23-33` is the anchor definition (cited line → ±2 → 4-consecutive-word whitespace-normalised fallback, moves reported); `:159-160` is the `LEADS_UNRESOLVED`/`LEADS_REANCHORED` push — exact.
- `baseline/c1-J1-do-nothing.json` records `leadsReanchored: ["corpus/knowledge/mirror-pitfalls.md:39@044048597d62… -> 40"]` — exact.
- Lesson class: `corpus/lessons/round-33.md` M3 `reference-drift` (row `:168`, subsection `:202`) — exists.
- Checkable: yes. Consistent with 32/87/88.

### 95 (kill cases exercise the rule, not the source text) — holds; stale anchors (low)

- Red state verified from the frozen control receipt `baseline/c2-J3-find-sniff.json`: killedCount 20, survivors `[]`, `twinsFailing` = all 20 mutants, pristine/neutral/decoy exit 0, battery true — exactly as the criterion describes (refused only by the twin probe).
- `MutGateV2.md:37` = M01 row (threshold `>1`→`>2`, selftest 0/44, battery 0/8, SURVIVED); protocol note at `:31` — both as cited.
- Counter cites exact: `c2-gate-mutants.mjs:14-31` probes, `:27-29` KILLED definition, `:35-37` disclosed residual — all verified raw.
- **Defect (low):** the two in-gate cites are exact at the baseline gate (`git show 15dfaccb…:scripts/check-bidi-runtime.mjs`: `:1037` = `const gateSource = readFileSync(fileURLToPath(import.meta.url));`; `:1108-1110` = `const pass = exit === c.exit && out.admitted === c.admitted && reason === c.reason` / `results.push({id, ok, expectedExit, …})`) but stale at `04f9623`, the commit that appends the criterion: there `:1037` = an M08 comment, `gateSource` = `:1086`, the case-result push ≈ `:1160`, the `CASE … FAIL` print = `:1213`. No revision is pinned on these cites; by criterion 28 they must resolve in the current tree and do not. Reference-drift (M2's class) inside the criterion that polices locator discipline; rules unaffected, locators recoverable by search.

### 96 (control-set completeness at freeze) — holds; would have caught M3

- Red state **independently reproduced**: from w1's committed `CritC1Claim/build-probe.mjs` (path patched to my scratch clone only), clone at freeze `59f1b47a…`: declaration line lands at `SKILL.md:2919`, three `refused-route` rows on kake `SKILL.md:408` / `SKILL.md:697` / `corpus/knowledge/field-performance-cwv.md:153`, 64 screen rows written (63 counted after dedupe against the pre-mapped kama row). Probe commit `ae310fb7e2e101acfe39ae691f215396d4f2e86e` (my scratch clone only). Counter bytes = `0dba816c…` = frozenDigests. `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev ae310fb7… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` → exit **0**, `predicate:true, mapped:4, screened:63, unaccounted:0, newMapped:3, adjacency clean 16/16` — matches w1 CritC1Claim's committed receipt and the criterion's red state. Receipt: `RevQuality92/probeA-c1.json`.
- Prior naming verified: `corpus/lessons/round-33.md:170` (M5) records that cosmetic renames "reach predicate true more cheaply" (CritC1Axis). The round-34 freeze scored five C1 controls and none is a rename route (`claims.json` C1 controls J1-J5; lesson `## Gate` table).
- **Would 96 have caught M3? Yes.** Round-33 M5 predates the freeze and names the construction; under 96 the freeze must score it with the frozen counter before data; that control reads predicate true, so the gap is visible at the freeze (forcing disclosure, withdrawal, or a hardening before the claim is read) instead of being discovered by w1's probe after the fact. Two honest limits: 96's trigger set is "constructions the previous round's lesson names", so it depends on criterion 77's numbering discipline being met, and 96 scores the omission — a freeze that scores the control and proceeds anyway satisfies its letter while still shipping the gap; the refusal itself is carried by the claim's killRule, not by 96. Catch, not repair.
- `corpus/lessons/round-34.md` M3 row exists (`:93` in the pin) and cites this fix.

## Contradiction check vs criteria 1-91

None found. 92 refines 26/65 (adds the candidate-time reading and the tree state to the receipt); 93 is consistent with 39/67 (200s keep digests; a 404 has no content bytes to bind); 94 sharpens the pin discipline of 32/87/88 for lead lists; 95 refines 76/27 for mutation kills; 96 extends 87/90 to the freeze control set. No earlier criterion is superseded or contradicted. One 1-91 violation was found nearby, not inside 92-96: the round-34 lesson (source of 95/96) fails criterion 77's mechanical count — `grep -c '^| M[0-9]'` = 4 (M1-M4 rows) vs `grep -c '^### M[0-9]'` = 0 subsections (`corpus/lessons/round-34.md`, pin `04f9623`; round-33's lesson complies, e.g. `### M3` at `:202`). The fix/able-to-fail content is carried in-row, so harm is limited; severity low.

## Commands and exit codes

```
git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 04f9623…   # toplevel=$S/clone, exit 0
node scripts/check-selfassessment.mjs --repo $S/clone --rev 9f008f6c --json   # exit 1, mismatches 1 (finding line=1829 claimed=44 observed=57)
node scripts/check-selfassessment.mjs --repo $S/clone --rev bf48b81c --json   # exit 0, mismatches 0
node scripts/check-selfassessment.mjs --repo $S/clone --rev 59f1b47a --json   # exit 0, mismatches 0
curl -q -sS --proto =https …/docs/linux/sandboxing.md?format=TEXT  x2          # 404/233B/c0d8d296… ; 503/1459B (transient)
node build-probe-rq92.mjs                                                      # exit 0 (decl SKILL.md:2919, 3 rows, 64 screens)
git -C $S/clone commit (probe)                                                 # ae310fb7e2e101acfe39ae691f215396d4f2e86e
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev ae310fb7… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
                                                                               # exit 0, predicate true, newMapped 3
sha256sum …/c1-adjacency-sweep-v2.mjs                                          # 0dba816c… = claims.json frozenDigests
grep -c '^| M[0-9]' / '^### M[0-9]' corpus/lessons/round-34.md                 # 4 / 0
git -C $S/clone diff --stat 59f1b47a 04f9623 -- .ufo/waves/round-34/counters scripts/check-selfassessment.mjs scripts/check-adjacency.mjs corpus/lessons/round-33*
                                                                               # empty (cited counter/script/lesson bytes stable freeze→landing)
```

Network receipts (URL, UTC, status, bytes, sha256): `RevQuality92/fetch-receipts.tsv`; bodies kept as `fetch404-1.bin`/`fetch404-2.bin`.

## Residual risk and verification gaps

- I reviewed the criteria text and their red states; I did not audit whether the twelve landed `v3-a-*`/`v3-b-*` cases themselves satisfy 95 (that is the C2 attack seats' scope).
- 93: only one of my two repro fetches returned the 404 body (the other hit a 503), so my own runs give one extra sha, not a pair; the committed w1 pair covers the two-sha claim.
- 92: my replays used the `04f9623` script (byte-identical to the freeze), while the criterion's quoted replay used the `59f1b47a` script; readings matched the quoted values.
- Criterion 77's count has no lane instrument ("no lane instrument asserts this yet" — its own text); my 4/0 count is manual.

## Deliverable paths

- Report: `.ufo/waves/round-34/w2/RevQuality92.md` (this file)
- Receipts: `.ufo/waves/round-34/w2/RevQuality92/` — `sa-9f008f6c.json`, `sa-bf48b81c.json`, `sa-59f1b47a.json`, `probeA-c1.json`, `probeA-c1.stderr`, `probe-build.log`, `build-probe-rq92.mjs`, `fetch-receipts.tsv`, `fetch404-1.bin`, `fetch404-2.bin`, `sha256.txt`

Scratch `/fast/scratch/hyaku/tabi-r34/RevQuality92` (including the probe clone) deleted after receipts were copied.
