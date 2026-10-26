# RerunC2 — independent re-run of the frozen C2 BiDi forgery battery (round 33, w2)

**Target:** C2 predicate at the integration revision `042d6d9abf97d567d495652a85eabc851b81adc1` (claims.json:41-49), frozen counter `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs` (sha256 `51ace65f…e812b`), L1 measure `.ufo/waves/round-33/measure/c2-at-bf48b81.json` (sha256 `16453148…0998c`).

**Verdict: holds.** I re-ran the frozen counter bytes (taken from freeze commit `e6b0a90`, sha256 identical to `frozenDigests`) three independent times at `042d6d9` — twice against my own `--shared` clone with distinct `TMPDIR`s, once against the lane checkout directly — and every counted field equals the L1's measure at `bf48b81`: `predicate true`, `honest {H0,H1,H2} true` each with `population 17 / admitted 16 / failing 0`, `forgeriesAccepted 0 of 8`, `acceptedForgeries []`, `selftest {exit 0, cases=44 passed=44}`, `digestLiterals []`, `gateSha256 62453b55…53b43a7b6da944a9544b3af8deac75`. The only field that differs from the measure is the named `rev` itself (`bf48b81` → `042d6d9`), and I verified that transplant is sound: the gate blob is byte-identical at both revisions (`10be4ef9…530678`) and all battery input trees (round-32 receipt/transcripts, entry, `RerunDriver` transcripts, `SOURCES.md`) are the same objects at both revs; between the two revisions only `.ufo/waves/round-33/measure/*`, `w2-spec.json` and a 2-line append to `SCORECARD.md` changed (0 deletions). The same counter at the frozen baseline `b7d16fb` reproduces the before-state exactly (`forgeriesAccepted 8/8`, all eight F-variants accepted, `honest` true, `selftest 27/27 exit 0`, `predicate false`), matching the claim's `before` and the frozen control `baseline/c2-J1-do-nothing.json` field for field. No defect found; one informational caveat (raw-byte nondeterminism) is recorded under Risks — it does not touch the frozen predicate. Severity if it mattered: none for the claim as written.

## Evidence

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=/fast/scratch/hyaku/tabi-r33/RerunC2`. One live clone `$S/clone` at `042d6d9` (`git rev-parse --show-toplevel` = `$S/clone`). Receipts copied to `.ufo/waves/round-33/w2/RerunC2/` before scratch deletion.

### 1. Freeze-byte provenance

```
$ git -C tabi-shokunin show e6b0a9074d434ccc307badd312ae7379d1193fea:.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs > $S/c2-counter.mjs
exit 0
51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b  $S/c2-counter.mjs
```
Matches `claims.json` `frozenDigests[".ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs"]` (`51ace65f…e812b`), so the killRule clause "counter bytes != frozenDigests → not verified" does not fire.

### 2. Two runs at REV `042d6d9` (as assigned)

```
$ TMPDIR=$S/tmp1 node $S/c2-counter.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --repo "$S/clone" --json > run1.json   # exit 0   (2764 B, sha256 f0a651ec…7bff2f)
$ TMPDIR=$S/tmp2 node $S/c2-counter.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --repo "$S/clone" --json > run2.json   # exit 0   (2764 B, sha256 7505cceb…e8ef3ad)
$ TMPDIR=$S/tmp4 node $S/c2-counter.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json > run3-lane-repo.json   # exit 0 (third, control for clone-of-clone)
```
stderr for all three: 0 bytes.

Counted fields (identical in run1 / run2 / run3, quoted from run1):

```json
{"schema":"tabi-r33-c2-bidi-forgery-battery-v1","rev":"042d6d9abf97d567d495652a85eabc851b81adc1",
 "gateSha256":"62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75",
 "honest":{"H0":true,"H1":true,"H2":true},"digestLiterals":[],
 "forgeriesAccepted":0,"forgeriesTotal":8,"acceptedForgeries":[],
 "selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44"},
 "predicate":true}
H0 exit=0 accepted=true population=17 admitted=16 failing=0 reasons=[]
H1 exit=0 accepted=true population=17 admitted=16 failing=0 reasons=[]
H2 exit=0 accepted=true population=17 admitted=16 failing=0 reasons=[]
F1 exit=1 accepted=false population=17 admitted=0  failing=16 reasons=["t1-receipt"]
F2 exit=1 accepted=false population=17 admitted=0  failing=16 reasons=["x3-duplicate-id"]
F3 exit=1 accepted=false population=17 admitted=0  failing=16 reasons=["t1-receipt"]
F4 exit=1 accepted=false population=17 admitted=0  failing=16 reasons=["t1-receipt"]
F5 exit=1 accepted=false population=17 admitted=0  failing=16 reasons=["t1-receipt"]
F6 exit=1 accepted=false population=17 admitted=0  failing=16 reasons=["t1-receipt"]
F7 exit=1 accepted=false population=17 admitted=15 failing=1  reasons=["x4-measured-cell"]
F8 exit=1 accepted=false population=17 admitted=0  failing=17 reasons=["s1-source-row"] entryFinding="s1-source-row"
```

### 3. Field-by-field comparison with `.ufo/waves/round-33/measure/c2-at-bf48b81.json`

Compared: `schema, rev, gateSha256, goldenRev, baseline, entry, forgeriesAccepted, forgeriesTotal, digestLiterals, predicate` and, per variant, `exit, accepted, population, admitted, failing, reasons, entryFinding, binding`. Result: **one difference only** —

```
- rev: measure="bf48b81cbb5dd63bd3f5159dcba536ccd577e28e" rerun="042d6d9abf97d567d495652a85eabc851b81adc1"
```

`gateSha256` measure = rerun = `62453b55…8ddbf3b43a7b6da944a9544b3af8deac75`; `honest`, `forgeriesAccepted 0`, `digestLiterals []`, `selftest {0, 44/44}`, `predicate true` all equal. Variant commit hashes necessarily differ (wall-clock commit timestamps; the measure's variant commits `70b713f9…`, `74a6f184…` are not objects in the lane repo — `git cat-file -t` → exit 128), but no counted field depends on them.

Transplant check `git diff bf48b81 042d6d9`: `SCORECARD.md | 2 +` (0 deletions) plus `.ufo/waves/round-33/measure/*` and `w2-spec.json`; `scripts/check-bidi-runtime.mjs` blob `10be4ef9…530678` at both revs (`cmp` on `git show` output → identical); trees for `corpus/evidence/round-32/bidi`, `corpus/knowledge/webdriver-bidi-runtime-round-32.md`, `.ufo/waves/round-32/w2/RerunDriver/bidi-run`, `corpus/SOURCES.md` are the same object ids at both revs.

### 4. Baseline run (before-state)

```
$ TMPDIR=$S/tmp3 node $S/c2-counter.mjs --rev b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd --repo "$S/clone" --json > run-base.json   # exit 1 (predicate false, as frozen)
gateSha256=2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393
forgeriesAccepted=8 of 8 acceptedForgeries=["F1","F2","F3","F4","F5","F6","F7","F8"]
honest={"H0":true,"H1":true,"H2":true} selftest={"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27"} digestLiterals=[] predicate=false
  F1..F8 exit=0 accepted=true (F7 admitted=15, others 16); H0/H1/H2 exit=0 admitted=16
control baseline/c2-J1-do-nothing.json: forgeriesAccepted=8 honest={"H0":true,"H1":true,"H2":true} selftest={"exit":0,"last":"…cases=27 passed=27"} digestLiterals=[] predicate=false
```
Reproduces `claims.json:45` `before` and the frozen do-nothing control exactly (v1 selftest 27 cases vs v2's 44 is the expected version delta).

### 5. Independent cross-checks of the predicate's other clauses

```
$ (cd $S/clone && node scripts/check-bidi-runtime.mjs --selftest)   # exit 0
BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44
# digest clause, scanned directly on the gate source at 042d6d9 (not via the counter):
8aa97463…af851 full=0 prefix12=0 ; 9918a716…169d7 full=0 prefix12=0 ; 92bd413c…febad1 full=0 prefix12=0
b9dab912…dc7252 full=0 prefix12=0 ; 55dbef88…dff070a full=0 prefix12=0
# any 40+ hex literal anywhere in the gate: none
# gate sha256 at REV: 62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75
```
So the "carries no honest digest literal" clause holds independently of the counter's own 12-hex-prefix implementation (counter lines 222 and 229 were read: `digestLiterals: HONEST_DIGESTS.filter(...)` over `gateAtRev`, and `out.predicate = honest.H0 && honest.H1 && honest.H2 && forgeriesAccepted === 0 && st.status === 0 && digestLiterals.length === 0`).

### 6. Process hygiene

No chromedriver/chromium started by this seat (battery is offline by construction). `pgrep -fa 'chromedriver|chromium'` showed only the host's `/usr/bin/earlyoom` line whose *arguments* mention `chromium`; no browser process owned by this seat. No lane tracked file, lane index, fleet file or sibling repo was written; every git call was read-only in the lane and `-C $S/clone` / `-C` inside the clone. No tool installs were needed.

## Risks / limits

- **Raw output bytes are not reproducible; counted fields are.** `run1.json` and `run2.json` differ in sha256 because git commit hashes inside the JSON include wall-clock committer seconds (between my two concurrent runs only variant `F3`'s commit differed). Anyone comparing raw measure digests across runs would see a false drift; the frozen predicate, the counting command and this re-run all compare fields, so the claim is unaffected. Reported as informational only — severity: none against C2 as written.
- The battery is finite by design (`claims.json` `feasibilityDisclosed`): refusal of F1-F8 is construction-specific; smarter forgeries are out of predicate scope. My re-run only re-establishes the frozen predicate, not freshness against new constructions.
- The measure the claim cites was taken at `bf48b81`, one commit before the integration rev; soundness of that transplant rests on the gate-blob and input-tree identity shown in §3, and on my live re-run at `042d6d9` reproducing every counted field.
- The `--live` leg is excluded from this predicate by freeze; I did not run it and make no statement about it.

## Deliverables

- `.ufo/waves/round-33/w2/RerunC2.md` (this report)
- `.ufo/waves/round-33/w2/RerunC2/c2-counter.mjs` — frozen bytes used, sha256 `51ace65f…e812b`
- `.ufo/waves/round-33/w2/RerunC2/run1.json` (`f0a651ec…7bff2f`), `run2.json` (`7505cceb…e8ef3ad`), `run3-lane-repo.json` (`ba202610…f656ed`), `run-base.json` (`5de7311a…4f79a`), plus 0-byte `.err` files
- `.ufo/waves/round-33/w2/RerunC2/00-commands.txt`, `01-compare-to-measure.txt`, `02-run-determinism.txt`, `03-selftest-at-rev.txt`, `04-digest-scan.txt`, `05-baseline-vs-control.txt`, `06-rev-scope.txt`
