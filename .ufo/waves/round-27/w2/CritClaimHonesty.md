# CritClaimHonesty — attack on the landed round-27 claim dispositions (C1/C2/C3, re-dispatch)

Seat: TabiR27.CritClaimHonesty (read-only reporter, leaf). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Measured rev: HEAD
`bceb17dd82446a3b7514dd9759ec733673b4ba0d` ("round-27: integrate falsification findings, documentation, report tool and W2 dispatch"). Nothing in this report landed in tracked files; all artifacts live under `.ufo/waves/round-27/scratch/CritClaimHonesty/`.

## Attack targets (per assignment)

(a) C1 "mismatches=0 at the tip" — real calibration or window under-report? Re-scan of the round-27 LOG entry against the four frozen tally shapes.
(b) C2 "valid=true" — honest depth or bookkeeping? Source-open binding = S106 row + this round's re-fetch; did it match?
(c) C3 coverage move — documented-upstream entry vs prior frontier statement.
(d) Re-dispatching frozen claims — legitimate resumption or replay?

---

## (a) C1 — verdict: FALSIFIED (the zero is a matcher artifact, not calibration)

### 1.1 Counter re-runs (mine, at HEAD `bceb17d`)

- Dirty live tree: `node scripts/check-selfassessment.mjs --rev HEAD --json` → exit 1, `mismatches=1`, `counted=[m3-unlanded-paths observed=10]`, `superseded=10`, `couldNotEvaluate=92` (receipt `tip-head.json`).
- Clean clone (`git clone --no-hardlinks . <D>`, toplevel asserted): `node scripts/check-selfassessment.mjs --repo <D> --rev HEAD --json` → exit 0, `mismatches=0`, `counted=[]`, `superseded=10`, `couldNotEvaluate=92` (receipt `tip-cleanclone.json`). So the shipped integer 0 exists only on a clean tree; every wave-time run reads 1 because m3 is a live-porcelain probe, not a `--rev`-bound count (w1: ExecC1Baseline §2, ExecC1Attacks F5).

### 1.2 The zero is unsound under the frozen predicate (F1/F2/F3 confirmed at source)

I re-read the shipped matcher, `scripts/check-selfassessment.mjs:316-328`:

- Citation leg (line 325): `/:\\d+/.test(text)` — any colon-number anywhere in the paragraph (wrong line, clock time, URL port) "cites the superseded line". Unbound to the finding's line.
- Number leg (line 326): `statedTallyNumbers(text).includes(f.observed)`; `statedTallyNumbers` (lines 246-254) includes a bare `\b(\d+)\s*\/\s*(\d+)\b` fraction arm with no tally context, so a quoted fraction can "state" the oracle number.
- Supersession unit: `paragraphs()` (lines 256-265) splits on blank lines only; the five round-27 correction bullets (LOG.md:1904-1925) are one 22-line paragraph with zero blank lines inside.

w1 real-content proof (ExecC1Attacks §4-5): re-pointing the two check-sources bullets to `:7019`/`:7013` still yields `mismatches=0`; deleting the `:335` bullet still leaves `:335` cleared by the merged paragraph; LOG.md:221 (stale `cases=8` vs oracle 12) is cleared by an 183-line paragraph (LOG.md:265-447) that never cites 221. Strict-predicate counts: baseline `4ad4c77` = 6 LOG findings (not 5 — adds `:221`); tip = 1 (`:221` uncorrected). The claim's before (5) is one low; the after (0) is reachable only through the three defects.

### 1.3 Round-27 LOG entry re-scan against the four shapes (assignment's explicit probe)

I scanned LOG.md with exactly the counter's claim-extraction regexes (`--self-?test N/N`, `N-case`, `cases=N`, `N [isolated] [CLI] cases`; the same list used at `check-selfassessment.mjs:277-283`):

- 20 tally-shaped lines exist in LOG.md total; **zero fall inside the round-27 section (lines 1880-1947)** (`shape-scan.txt`). The corrections' own `cases: 12/26/13/17` texts are written in colon form, which the line-level claim scanner does not recognize (only `cases=`; note the header comment claims `cases: N` coverage — comment overstates detection, RevC1FrozenFit Finding 4).
- Consequence: the fifth correction bullet restates a **stale tally number for check-selfassessment — `cases: 13` (oracle now 17) — at LOG.md:1921, invisible to the window by shape asymmetry. If colon-form were recognized, that line would be a genuine finding under the frozen rule (claimed 13 vs observed 17) needing its own disposition; the counter could neither flag nor supersede it. The round-27 entry therefore contains tally-like text the window misses, though not in a declared shape.
- The after-arm's "mismatches=0" rests on the loose paragraph semantics, not on per-line disposition of the six actual stale mentions (`:221` never dispositioned).

### 1.4 Verdict

The claim as frozen fails: the before-number is low (strict 6 vs declared 5) and the tip zero is a matcher artifact, not calibration. The lane itself now records C1 failed (LOG.md:1933-1936 "C1 is recorded failed, not met"; SCORECARD.md:1396). My independent re-run confirms: clean-clone 0 is composed of F1/F2/F3 looseness, and the round-27 entry's own stale `cases: 13` mention is invisible. Do not repair the counter after data — defer to a new claim (the lane already says this).

---

## (b) C2 — verdict: HOLDS (valid=true at tip; independent re-fetch matches the committed bytes)

### 2.1 Gate re-run at HEAD

`node scripts/check-s106-evidence.mjs --rev HEAD --json` → exit 0, `present=true`, `sha_match=true`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`, `valid=true` (decoded sha claimed == observed `9b93fe64…`). `--selftest` → 5/5, including missing-receipt and missing-bytes → exit 2 (could-not-evaluate) — the frozen kill rule is honored at the tip (the pre-repair gate at `5577d1b6` violated it: absent receipt → invalid/exit 1; repaired at `5198e28`/`5ed6484`).

### 2.2 Honest depth: this round's re-fetch matches (assignment's probe)

Documented GET (public URL named in the claim) from this seat:

```
curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT'
```

| field | refetched (mine) | receipt `s106.json` | match |
|---|---|---|---|
| encoded bytes | 98604 | 98604 | yes |
| encoded sha256 | `f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03` | `f17347b2…` | yes |
| decoded bytes | 73952 | 73952 | yes |
| decoded sha256 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | `9b93fe64…` | yes |
| anchor | line 187, unique (grep -c = 1) | anchor.line 187, occurrences 1 | yes |

So the committed evidence-of-record is bit-for-bit what the live tag serves today — the admission is not internal-only bookkeeping; the S106 row anchor (SOURCES.md:120: "decoded text lines 186-187 carry `BASE_FEATURE(kBackForwardCache, …)`") binds to real fetched bytes, and the gate verifies the receipt hashes against the committed bytes at the measured revision.

### 2.3 Integrity caveats (do not move the verdict)

1. Measurement-of-record provenance: the committed receipt `measure-c2-5577d1b.json` predates the gate repair (kills-rule defect); my HEAD run now supplies the tip-measured `valid=true`. SCORECARD.md:1397 binds the met-claim to corrected gate `5ed6484` — the tip clause is now measured.
2. The round-27 claims.json C2 `killRule` is shortened vs the frozen round-26 text: it drops the fetch-failure-block sentence and the "receipt's recorded revision must equal the report's cited measurement revision" clause (ExecC2Reopen F2). The receipt also has no revision field, so nothing mechanical re-binds receipt→revision besides existence-at-rev. "Re-dispatched verbatim" overstates this.
3. The receipt's `status` field still says "claim C2 fails its frozen predicate and is recorded failed" — stale prose, not consumed by the gate (F3).

---

## (c) C3 — verdict: HOLDS (real, narrow, honest coverage gain)

### 3.1 Counting command re-run

`git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l` → **1** (`corpus/knowledge/redirect-and-retry-after-semantics.md`). SOURCES row S107 exists (SOURCES.md:121); `grep -cE '^\| S10[0-7] ' corpus/SOURCES.md` → 8 (= S100-S107). Fleet census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0 (receipt `census-mine.txt`; W04s are pre-existing carries, none on S107).

### 3.2 Prior frontier statement vs round-27 row

- Prior frontier (README.md:216, carried): "Other open frontier ground | unchanged — extension↔daemon handshake, native WebMCP host probe, rate/rights real-site records, **real-site journeys**, WebMCP spec mining". Round-25 frontier held loopback 303→GET / 307 method-body preservation (`knowledge/state-changing-matrix-r9.md:162-177`).
- Round-27 row (README.md:599): "Documented-upstream classification vocabulary for redirects a journey driver observes … **Nothing in it was run, captured or observed in a browser.** | S107 RFC 9110 §15.4… fresh fetch 2026-10-25 (502941 B, sha256 21c1cdce…)".
- Frontier restatement (README.md:601-609): "redirects on journeys — RFC semantics documented; real-site redirects remain untested", with the 308 method-preservation explicitly labeled inference (the MUST-NOT clause lives in RFC 7538, not in the fetched bytes).

The gain is a documented-upstream spec vocabulary + one registry row + one entry citing it — the declared assimilation metric (0→1 entry citing S107, census 106→107). RevEntryC3 verified all eight quoted spans against the fresh RFC 9110 bytes (line-pinned), the front-matter trio matches the S107 row, and the INFERENCE on 308 is honestly bounded. The entry does not claim runtime coverage, and the frontier is correctly restated rather than falsely closed. Verdict: genuine within the declared assimilation scope; a reader must not read it as runtime evidence (it is not labeled as such).

Minor, non-blocking: orphan line fragment at entry line 18; the §15.4 step-4 quote lacks an inline line cite (row has it).

---

## (d) Re-dispatch of frozen claims — verdict: legitimate resumption, not a replay; two record nits

- Round-26 recorded all three claims as **"failed — not executed"** (SCORECARD.md:1351-1353: "the frozen counting command does not exist" / "§10 machinery … never ran"; round-26 LOG: "No falsification credit; all three claims recorded failed (not executed)", 0 seats, wave 1 built but never dispatched). The failures were procedural, not falsifications — nothing was tested.
- Round-26 LOG next-iteration (a) explicitly owes the re-dispatch: "Re-dispatch round 26's frozen claims unchanged in a fresh round — the claims file is the resumption point." Round-27 claims.json `resumeNote` cites it; predicates/counters/targets are unchanged; the round-27 LOG documents the basis (LOG.md:1882-1888).
- Verdict: legitimately resumed, not a replay of failed dispositions — the three claims got their first real execution in round 27, and round 27 records the honest outcomes (C1 failed, C2 met-after-correction, C3 met).

Record nits (honesty of the record, not of the disposition):

1. "Verbatim / unchanged" is overstated: round-27 C1 `before`/`killRule` fields contain post-measurement values ("measured 5, not 0") and C2's `killRule` drops two frozen sentences (see §2.3.2). The resumeNote's "predicate, counter, kill rule and target unchanged" is not literally true of the claims-file text.
2. C1's measured before-arm anchors at `4ad4c77` (round-26 baseline) while the declared round-27 baseline is `f185b4e`, which already contains the round-26 `:1664` correction (so at `f185b4e` the before reads 4 LOG findings, not 5). The claim text names the rev and the LOG explains it, but the before/after pair spans round-26→round-27 commits rather than baseline→tip.

---

## Verification notes

- Every number above carries its exact command; receipts under `.ufo/waves/round-27/scratch/CritClaimHonesty/` (`tip-head.json`, `tip-cleanclone.json`, `census-mine.txt`, `shape-scan.txt`, `s106-refetch.txt/.bin`, `b64.err`).
- Report-contract utility: `scripts/report-contract.mjs` exists and by design rejects wave paths ("(c) … is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md"), i.e. w-path reports like this one are outside its contract; no run against this file.
- No tool installed; no network beyond the one documented public GET; no tracked-file writes; read-only git.
