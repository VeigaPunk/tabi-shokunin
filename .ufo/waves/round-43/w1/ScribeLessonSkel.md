# ScribeLessonSkel — round-43 lesson skeleton

- Seat: `ScribeLessonSkel` (leaf; no subagents dispatched), role scribe, axis **discernment**
- Wave: tabi round 43, w1 (64 seats, policy-v2)
- Date: 2026-10-29
- Freeze under audit: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (baseline
  `ab592825cd195599822ca227f7768914df208201`)
- Repo (read-only for this seat apart from its own seat dir):
  `/home/vgpnk/Projects/shokunin/tabi-shokunin`

## What this seat produced

The skeleton of `corpus/lessons/round-43.md` — Gate structure (admit candidates **S150 / S151**
with located quotes and access dates, plus a reject row rule) and **Mistakes rows restricted to
PRE-DATA events**, with verdicts and post-wave rows left to the L1.

| artifact | path (under the seat dir) |
|---|---|
| lesson skeleton (the deliverable) | `.ufo/waves/round-43/w1/ScribeLessonSkel/draft-round-43-lesson.md` |
| committed-bytes verification | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-committed-bytes.txt` |
| pre-data egress event, re-derived | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-egress.txt` |
| failed-run digests vs the frozen pins | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-run1-digests.txt` |
| failed-run authenticity (Ed25519 / bindings) | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-run1-signatures.txt` |
| failed-run measure-record field diff | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-predata-run1-record-diff.txt` |
| quote locator context + used-by state | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-locator-context.txt` |
| sibling-report sweep (reject-row basis) | `.ufo/waves/round-43/w1/ScribeLessonSkel/evidence-sibling-sweep.txt` |
| the scripts that produced all of the above | `.ufo/waves/round-43/w1/ScribeLessonSkel/scripts/*.mjs` |

The integrated lesson itself was **not** written: `corpus/lessons/round-43.md` is the L1's to land
after WAVE-DONE, and this seat wrote nothing outside its own seat dir.

## Commands actually run (read-only over the repo) and what they returned

All repository reads go through `git -C <repo> show 7ca6f018…:<path>` (committed bytes only) or
read-only file reads; the only writes were the seat-dir artifacts above.

### 1. S150 / S151 — located quotes and access dates (committed bytes)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/sources
$ sha256sum crypto.html git-cat-file.html
4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af  crypto.html
624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7  git-cat-file.html
```

Re-derived from the **committed** staged copies at the freeze (`git show 7ca6f018:…`):

| row | quote | staged bytes | sha256 == registry cell | location | uniqueness | words |
|---|---|---|---|---|---|---|
| S150 | `createPrivateKey, createPublicKey, generateKeyPair, sign, verify,` | 681,625 B | yes | byte 85109, line 1056 | 1 occurrence | 5 |
| S151 | `Instead of the content, show the object type identified by` | 79,360 B | yes | byte 43851, line 2234 (`-t` option `<dd>`) | 1 occurrence | 10 |

Both rows: tier A, status `mined`, recheck `on-release`, 11 cells, 0 pipes in the quote, access date
**2026-10-29**. Registry row count at the freeze: **151** (`.ufo/waves/round-43/measure/census-start.out`
records the pre-freeze census as 149 rows / 21 W04 warnings / exit 0 — the two rows land after it).

### 2. Reject row — sibling re-opens (evidence, not assertion)

`evidence-sibling-sweep.txt` (script `scripts/sweep-siblings.mjs`) sweeps every markdown report in
the wave dir, records each seat's `VERDICT` line and every `S150`/`S151` mention. Result at the
sweep time:

```
dedicated re-open seats agreeing with the admit: 2 (RevS150.md, RevS151.md)
dedicated re-open seats not agreeing / no verdict: 0 (none)
```

The other mentions (`ExecC2TreeFixture`, `ExecC2V0Probe`, `MutC2Pin`, `ScribeLogDraft`,
`ScribeScorecardDraft`) cite S151 as *the source behind the C2 r1 type gate* or as registry rows in
the LOG/scorecard drafts — none of them re-opens the rows, none disagrees. **No reject row is
therefore required**; the skeleton carries an explicit `[L1: …]` instruction to re-run the sweep at
WAVE-DONE and to add a reject row (seat, row, verdict, grounds, evidence path) if any settled
seat's re-open disagrees.

### 3. Pre-data event #1 — the first live attempt refused by its own counter (46 egress findings)

The freeze's own `LOG.md` / `SCORECARD.md` disclose it; the run-1 bytes were recovered into the
wave dir by seat `SentEgressAudit`
(`.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1/`). This seat re-derived the claim from those
bytes (`scripts/analyze-failed-run1.mjs`, `scripts/compare-failed-run.mjs`):

```
run1: samples=133, samples with nonLoopback != 0 -> 46 counter finding ids
      flagged sample indices: 111..133 (distinct 23), surfaces [ss, proc], nonLoopback = 1
run2: 0 flagged samples; run1 egressNonLoopback=46, run2 egressNonLoopback=0; final sweeps 0/0
```

and the run's **own** counter output inside the archived `measure.stdout` lists exactly the 46
ids `run1-sample111-ss-egress` … `run1-sample133-proc-egress`, `predicate: false`. The disclosure's
arithmetic is therefore exact: **23 samples × 2 surfaces = 46**, matching the counter's committed
finding-id templates `${N}-sample${j + 1}-${k}-egress` with `k ∈ {ss, proc}`.

Authenticity of the recovered bytes (`scripts/verify-failed-run-signatures.mjs`) — the archive is
self-authenticating, not a hand-made artifact:

```
sha256(canonical(unsigned)) == signature.over: true
Ed25519 verify under the embedded wrapper public key: true      (failed run)
Ed25519 verify under the witness's own public key: true          (failed run)
sha256(receipt.json) == measureRecord.bindings.receiptSha256: true
sha256(receipt.witness.json) == measureRecord.bindings.witnessSha256: true
```

(control: the same three checks pass on the **committed** clean run at
`.ufo/waves/round-43/measure/c1-measure-r43.json` + `corpus/evidence/round43/playwright-egress/`.)

### 4. Pre-data event #2 — instrument hardened before the freeze, with remotes recording, disclosed

Re-derived, not asserted:

```
failed run's own stdout digests:  driver b70e2c145390cc4c1c79b93aad87f13319f32f77c85ba972a973352e9843082a
                                   counter bbdf1234ab0e5e0f7446218830d97a326cf87de171cfdc520f6c4e4e3731b6a8
                                   wrapper 23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0
frozen pins (claims.json):       driver 3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e
                                   counter 6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c
                                   wrapper 23afa29d… (unchanged)
```

So the driver and the counter changed between the failed run and the freeze; the wrapper did not.
The change is exactly the disclosed one, seen at field level:

```
failed  run1 sample[110].ss keys: ["ticks","lines","nonLoopback","ssObs"]                      (no remotes field)
clean   run1 sample[110].ss keys: ["ticks","lines","nonLoopback","ssObs","nonLoopbackRemotes"]  (remotes field exists)
failed-run counter output keys:    [... ,"predicate","findings","challengeVerified","challengeError"]  (no egressDetail)
frozen counter returns egressDetail (counters/c1-signature-bound-v5.mjs:47,80,108,234)
```

That matches the freeze's disclosure verbatim: *"the driver counted but recorded no remotes"* →
*"driver + counter now record and surface `nonLoopbackRemotes`"*, *"no predicate was loosened"*.

### 5. The predicate was not loosened — checked over committed bytes

`claims[0].counterPredicate` is **byte-identical** to the counter's `const PREDICATE`
(1343/1343 characters); `claims[1].predicate` is byte-identical to the checker's `PREDICATE`
(1314/1314). All six `claims.json.frozenDigests` re-derive byte-identically from commit
`7ca6f018`. Evidence: `evidence-committed-bytes.txt` §3–§4.

## Findings (routed, no frozen byte touched)

1. **The pre-data 46-finding receipt is not committed.** `git ls-tree -r 7ca6f018` over
   `.ufo/waves/round-43/` and `corpus/evidence/round43` lists 19 files and **none** names the failed
   run. The committed evidence for the pre-data event is the freeze's `LOG.md` / `SCORECARD.md`
   prose; the bytes live only in the wave dir (`.ufo/waves/round-43/w1/SentEgressAudit/failed-run-1/`,
   recovered from the scratch archive the LOG names). **Route to the L1:** land that archive (or a
   digest record of it) with the wave so the 46-finding claim is re-derivable from committed bytes
   at closure. Severity: medium (auditability, not a claim defect — the C1 clean run is committed
   and its bindings verify).
2. **The peer behind the 46 findings is unrecoverable.** The pre-hardening driver recorded only a
   count (`nonLoopback = 1`), never the address, so "run-1 transient" rests on run 2 being clean and
   both final sweeps being 0 — not on the peer's identity. The skeleton states this limit rather
   than repeating "transient" as established fact.
3. **S150's locator cell is loose.** The cell reads `§Crypto API index line`; the quote's actual
   heading context in the staged copy is `Crypto` (h2) → `Asymmetric key types` (h3) → `Examples`
   (h4) — a code line inside an examples block, not a line in a section named "Crypto API index".
   The row's `teaches` claim is nevertheless directly evidenced by the quote, and both re-open
   seats agreed, so this is a locator-precision note, not a reject row.
4. **S150 / S151 `used-by` dangles at HEAD.** Both rows point at
   `corpus/knowledge/receipt-authenticity-signing-round-43.md`, which exists on disk (6,183 B) but
   is **untracked** (`git status --porcelain` → `?? …`) at HEAD `ba433c94`; the freeze's LOG says it
   "lands at integration". The L1 should confirm the pointer resolves after integration.
5. **`claims[0]` carries two sentence keys** — `counterPredicate` (the instrument sentence,
   byte-identical to the counter's `PREDICATE`, 1343 chars, sha256 `9bc95453…`) and `predicate`
   (2012 chars, sha256 `a6187940…`: the same sentence plus a suffix starting `" THE CLAIM: "` —
   committed bytes at the measured revision, battery all-pass, refusals of the r42 receipt and of
   synthetic pairs, WAVE-DONE over ≥64 seats, no in-model do-nothing reach). The frozen
   `sentenceIdentity` block binds the instrument sentence only, and the declared three-site
   identity holds. Layering, not drift; recorded so a reader who picks `claims[i].predicate`
   generically does not mistake the difference for post-freeze amendment. **Independently observed
   by seat `ExecSentence`** (`w1/ExecSentence.md`, F1) — cross-seat agreement, no frozen byte
   amended by either seat.
6. **Self-correction, recorded for audit.** My first signature check reported
   `sha256(canonical(unsigned)) == signature.over: false` for the failed run. That was my bug — I
   canonicalised an object that still carried a `signature: undefined` key, which the wrapper's
   `canonical()` renders as the literal `undefined`. After deleting the key before canonicalising,
   both the `over` hash and the Ed25519 signature verify (`evidence-predata-run1-signatures.txt`,
   regenerated). The stale first reading is preserved as
   `evidence-predata-run1-record-diff.txt`, whose useful content is that the archived measure
   record's bytes hash to the `measureRecordSha256` the run itself recorded — i.e. the file was
   not modified after the run.
7. **Word-count divergence between seats (minor, both rows stand).** The registry quote cells hold
   5 (S150) and 10 (S151) whitespace words — the counts `RevS150` and `RevS151` also measured.
   The L1's live draft `corpus/lessons/round-43.md` (created during this wave, 1,941 B, ending in
   a `<POST-WAVE-SECTIONS-PENDING>` marker) records "7 words" and "11 words" for the same two
   quotes. S151's 11 is reproduced by appending the `<object>` placeholder (`… identified by
   <object>.` → 11); S150's 7 is **not** reproduced by the obvious code-line form
   (`const { createPrivateKey, …, verify, }` → 8). Both counts are far below the registry
   contract's ≤25-word limit, so neither row's admit is affected; the lesson should carry the
   quote cell's own count (5 / 10) so the two readings do not drift. This seat did **not** modify
   the L1's file — it is the L1's artifact.

## Note on the L1's lesson file

`corpus/lessons/round-43.md` appeared in the working tree during this wave (untracked; written by
the L1 seat, not by this one — this seat wrote nothing outside its own seat dir and its report
path). Its Gate table already carries the two admit rows with quotes and access dates; this
seat's skeleton is the pre-WAVE-DONE draft the L1 folds in, and it adds the re-derived pre-data
egress event, the locator nuance, the dangling `used-by` pointer and the word-count note above.

## Limitations

- The run-1 archive was **not** produced by this seat; this seat only read it. Its provenance is
  the freeze's `LOG.md` ("`failed-run-1/` archived under scratch") plus seat `SentEgressAudit`'s
  recovery into the wave dir. Nothing in the archive is committed, so it is not independently
  anchored by the repo's own history.
- The sweep for disagreeing re-opens is a snapshot of the wave dir at sweep time (see the timestamp
  at the top of `evidence-sibling-sweep.txt`); the wave was still running. It must be re-run at
  WAVE-DONE — the skeleton says so explicitly.
- This seat ran **no** claim counting command (neither C1's measure nor C2's checker): it is a
  scribe seat and the claims are not its to score. Every claim-related statement above is a
  re-derivation over committed bytes or over the recovered archive, never a scoring verdict.
- No network access was performed by this seat (the two re-opens named in the Gate were performed
  by `RevS150` / `RevS151`; this seat verified their verdicts against the **committed staged
  copies**, which is what C1/C2 actually pin).
- The committed clean-run evidence was read from commit `ba433c94` (the receipt/witness landed
  there, after the freeze), not from the freeze commit — the freeze predates the evidence files.

## Tooling record

`/home/vgpnk/.omp/agent/RULES.md` was read first. **No installs and no upgrades were performed**:
the seat needed only the pre-installed `node` (v24.21.0, fnm-managed),
`git`, `sha256sum`, `grep`. No pacman transaction was run (host-wide pause honoured). Nothing was
written to `~/.local/bin` or any other PATH directory.

## Cleanup

Scratch `/fast/scratch/hyaku/tabi-r43/ScribeLessonSkel/` was deleted before this yield. No writes
outside this seat's dir (`.ufo/waves/round-43/w1/ScribeLessonSkel/`) and this seat's report path;
no git/jj mutation anywhere (no commit, no fetch, no push); no write to the fleet root, to a
sibling `*-shokunin` repo, or to `/home/vgpnk/Projects/shokuknow`.

VERDICT finding S150/S151 admit candidates verified against committed staged bytes (quotes located, both re-open seats agree, no reject row) and the pre-data 46-egress event independently re-derived from the recovered run-1 archive (23 samples x 2 surfaces, signed, binding-consistent) — three items routed to the L1: that archive is uncommitted, S150's locator cell names a section the quote is not in, and S150/S151's used-by path is untracked at HEAD
