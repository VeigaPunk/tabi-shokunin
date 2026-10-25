# RevQuality67 — QUALITY 67/68 landed-fidelity review (round 27, wave 2, FALSIFY)

Seat `TabiR27.RevQuality67`, leaf reporter. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; every path below absolute to it unless
marked fleet (`/home/vgpnk/Projects/shokunin`). Measured 2026-10-25; node on lane gates
only; read-only git; no build/lint/formatter; no tool installed (none needed, none
recorded). Writes: this report + scratch under
`.ufo/waves/round-27/scratch/RevQuality67/` only.

**Verdict: PASS on both criteria.** Criterion 67 matches the routed decoded-source defect
and the gate's actual predicate; criterion 68 matches the routed report-contract defect
and the utility actually refuses it. Both required runs reproduce: fleet round-26 report
exit 0; doctored missing-SHONEN exit 1. No blocking finding. Carried/advisory items
below, none repairs the criterion text as committed.

Tip at measurement: `git rev-parse HEAD` → `bceb17dd82446a3b7514dd9759ec733673b4ba0d`
("integrate falsification findings, documentation, report tool and W2 dispatch").
Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`. Wave-1 findings folded by name.

## (a) Criterion 67 — fidelity to the decoded-source defect and the actual predicate

Text under test: `corpus/QUALITY.md:360-366` (worktree == HEAD; `git status --porcelain
corpus/QUALITY.md` → empty; `git show HEAD:corpus/QUALITY.md | grep -n 'cases=5'` →
`:366`).

| Claim in the criterion | Measurement | Result |
|---|---|---|
| decoded bytes committed as lane evidence | `git cat-file -e HEAD:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` and receipt `HEAD:…/s106.json` both exist; `node scripts/check-s106-evidence.mjs --rev HEAD --json` → `present:true, decoded_bytes:73952, decoded_sha256_observed == claimed 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`, `valid:true`, exit 0 | holds |
| receipt records `bytes_path`, `decoded_sha256`, `encoded_sha256` | read `corpus/evidence/round-26/sources/s106.json` → all three present (`bytes_path` …/content-features-154.0.8037.97.cc; `encoded_sha256 f17347b2…`; `decoded_sha256 9b93fe64…`) | holds |
| gate "rehashes the decoded committed bytes … never the live URL" | gate output above recomputes `decoded_sha256_observed` over the blob at `--rev HEAD`; source check `grep -n 'http' scripts/check-s106-evidence.mjs` → only the fixture URL `https://example.invalid/fixture?format=TEXT` at `:164`; imports are `spawnSync("git", …)` only (`:36`, `:59`) — no fetch capability | holds |
| "checks the located anchor against those bytes" | same JSON: `anchor {line:187, text:"BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);", occurrences:1}`, `anchor_located:true, anchor_unique:true, byte_count_match:true` | holds (gate also enforces uniqueness + byte count — criterion underclaims, harmless) |
| "`scripts/check-s106-evidence.mjs` cases=5" | `node scripts/check-s106-evidence.mjs --selftest` → `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0 | holds — wave-1 ScribeQuality67 F4 (landed text said cases=4) is closed by `bceb17d` |
| "encoded digest is provenance only unless an instrument explicitly verifies it" | `grep encoded_sha256 scripts/` → **no match**; the only lane readers are the receipt itself. No instrument reads it, and the criterion does not claim one does — honest wording, no vacuous check claimed (Q64-class discipline; wave-1 F5 resolved by the same sentence) | holds |
| kill-rule "missing receipt or bytes → could-not-evaluate, never valid" | selftest cases 4 and 5: `missing-bytes-could-not-evaluate` exit 2, `missing-receipt-could-not-evaluate` exit 2, `valid=n/a` both | holds |
| defect fidelity (routed round-25 closure defect 4, base64 `?format=TEXT` misread) | lesson anchor exists: `corpus/lessons/round-26.md:52` "### M2 — decoded-source transfer misread (base64 `?format=TEXT`)"; registry row `corpus/SOURCES.md:120` anchors "decoded text lines 186-186-187" claim consistent with receipt (`comment_line:186`, `line:187`); the sha-mismatch red case (selftest case 2) models exactly the encoded-as-decoded recording (wave-1 ExecC2Controls case (a): encoded sha in `decoded_sha256` → `sha_match:false`, isolated) | holds |

## (b) Criterion 68 — fidelity to the report-contract defect

Text under test: `corpus/QUALITY.md:367-376` (worktree == HEAD; `git show
HEAD:corpus/QUALITY.md | grep -n 'exactly one\|fenced text'` → `:370`). Utility landed:
`git cat-file -e HEAD:scripts/report-contract.mjs` → exit 0; `git log --oneline -3 --
scripts/report-contract.mjs` → `bceb17d` only (wave-1 ScribeQuality67 F1 "untracked" is
closed). `git status --porcelain scripts/` → empty.

Required runs, verbatim:

1. GREEN — `node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-26/tabi.md` (cwd lane)
   → `report-contract: PASS … — 6/6 sections in order; SHONEN 4/4 boxes`, **exit 0**.
   Box ground truth `grep -cE '^- \[[ xX~]\]' SHONEN.md` → `4`.
2. RED (required arm) — doctored copy of the fleet round-26 report cut at `## SHONEN`
   (awk, 132 lines, `grep -c '^## '` → 5) at scratch contract path
   `scratch/RevQuality67/fx/.ufo/reports/round-26/tabi.md`, run with cwd `…/fx` and
   relative arg `.ufo/reports/round-26/tabi.md`
   → `(a) missing section(s): shonen` + `(b) no ## SHONEN heading`, FAIL, **exit 1**.

Extra failure-capability arms (each names the clause it exercises):

| Arm | Command shape | Observed |
|---|---|---|
| wrong path (the round-25 defect class) | same script, arg `.ufo/waves/round-27/scratch/RevQuality67/fx/.ufo/waves/round-25/tabi.md` | `(c) … is under .ufo/waves/ — land reports in .ufo/reports/round-<N>/tabi.md (round-25 defect class)`, exit 1 |
| fenced text cannot satisfy clauses | fixture `fx/.ufo/reports/round-31/tabi.md`: all six headings + a box inside a ```` ``` ```` fence | five sections + SHONEN reported missing, exit 1 — criterion's "fenced text does not satisfy headings or boxes" is failure-capable |
| indented pseudo-fence (edge probe, mine) | `fx/.ufo/reports/round-32/tabi.md`: headings + box indented 4 spaces, no fence markers | exit 1, no false green (indented lines are not `^##` headings; the box sits under no recognized SHONEN heading) |
| historical defect report | `node scripts/report-contract.mjs /home/vgpnk/Projects/shokunin/.ufo/reports/round-25/tabi.md` | `(a) missing section(s): work performed, landed changes, before->after measurements` + `(b) 2 ## SHONEN headings — expected exactly one`, exit 1 — the exact defect the criterion routes (correlates wave-1 ScribeQuality67 V20/F7) |

Defect fidelity: criterion cites `corpus/lessons/round-26.md#m1`; the anchor exists —
`:36` "### M1 — round-25 report landed at the wrong path without SHONEN (routed defect
1)". The criterion's bar (contract path, six ordered headings, one SHONEN, box count
from SHONEN.md, fence masking) is exactly what the utility enforces, and the multiplicity
wording is honest: only `## SHONEN` multiplicity is enforced (wave-1 ExecReportContract
run 5/V17: appended second `## Trend verdicts` still PASSes) and the criterion does not
claim more. Lane-bound `tabi.md` in `REPORT_RE` matches the criterion's own "tabi round
report" scoping (wave-1 F2 satisfied by wording, no overclaim).

## (c) Measurable / cited

- Every figure above carries its exact command; observation vs inference separated below.
- Citations resolve: `corpus/lessons/round-26.md:36` (M1), `:52` (M2); routed-defect
  wording present in both sections ("routed defect 1", "round-25 closure reader read the
  encoded transfer as text" paraphrase at `:30` area).
- Both instruments are now committed at the measured tip — the criterion texts and the
  utility land in one commit (`bceb17d`), satisfying wave-1 F8's binding requirement.

## Findings by severity

**Blocking: none.**

**Minor (advisory, no repair demanded):**

1. **M-1 (carried, wave-1 ScribeQuality67 F6):** `corpus/lessons/round-26.md:39-40` says
   fleet `git log` "shows the round-25 report first committed at the wrong path";
   wave-1 measured `git log --all -- .ufo/waves/round-25/tabi.md` → 0 commits in both
   repos (working-tree landing, not a commit). Criterion 68 does not inherit the claim
   (it names the contract path and the utility refuses waves paths — measured above), so
   the criterion stands; the lesson sentence is the residual wording defect. L1-only fix
   if that lesson is ever revised; this seat did not touch it.
2. **M-2 (carried, wave-1 ExecSelftestSweep OBS-1):** `check-s106-evidence.mjs
   --selftest` fixture commits take the wall clock, so refusal detail strings (fixture
   revs `b715a8b9…`, `8b65c167…` in my run) differ between runs; verdict/tally stable.
   My own run reproduced 5/5 PASS with different fixture revs than wave-1's — expected
   under OBS-1, recorded as corroboration.
3. **M-3 (new, cosmetic):** criterion 68 states the bar but not the utility's exit
   taxonomy (0 pass / 1 violation / 2 usage-I/O); a reader cannot derive "wrong path ⇒
   exit 1" from the criterion alone. Underclaim, harmless; noted for the next text
   touch.
4. **M-4 (carried, wave-1 ExecReportContract run 5/V17):** duplicated non-SHONEN required
   section passes. Consistent with criterion 68's wording ("all six headings in order,
   exactly one `## SHONEN`"); recorded as an owed hardening, not a fidelity defect.

**Resolved wave-1 blockers (verified closed at `bceb17d`):** F1 (utility untracked →
committed), F4 (cases=4 → cases=5 in text, selftest measures 5), F8 (criterion + utility
committed together), F5 (encoded-digest honesty sentence in the landed text).

## Residual risk

- SHONEN.md box count is live (4 today); if SHONEN.md grows, historical reports re-fail
  by design — expected, not a defect.
- The utility's SHONEN.md discovery walks up from cwd then script dir; a run from an
  unrelated tree without `--shonen` picks the lane's SHONEN.md — correct for this lane,
  untested for other lanes (other lanes would need their own utility per `REPORT_RE`).
- Fence masking covers ```` ``` ````/`~~~` pairs only; unmatched fence markers leave
  later lines masked (per spec of `outsideFences`) — not probed further; no criterion
  claim depends on it.

## Verification gaps (stated as gaps, not assumed)

- I did not re-fetch the googlesource transfer; the encoded/decoded digest agreement
  rests on wave-1 ScribeQuality67 V4 (documented GET, HTTP 200, 98,604 B, sha
  `f17347b2…`, decoded `9b93fe64…`, `cmp` identical to committed bytes). No instrument
  reads `encoded_sha256`, so a re-fetch would not have changed any verdict here.
- I did not re-run the C1/C3 counters (other seats' items); the C2-adjacent gate run
  above (`valid:true` at `bceb17d`) was in service of criterion 67's predicate only.

## Touched surfaces

Written: this report; scratch
`.ufo/waves/round-27/scratch/RevQuality67/fx/{.ufo/reports/round-26,round-31,round-32,.ufo/waves/round-25}/…`
+ empty-dir scaffolding. No tracked file written; no git write; no peer messaged; no
subagent; no external GET (none needed this seat).
