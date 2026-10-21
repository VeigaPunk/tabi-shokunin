# CriticAuth — actor/publisher identity and honest-record-consistency boundary (round 22, C1 + debt)

Scope: attack the round-22 design (`.ufo/waves/round-22/w1-spec.json` context; uncommitted `LOG.md:1495-1521`, `SCORECARD.md:1043-1056`) on who/what the records can attest. Read-only. No tests, builds, browser, network, REA, peer messages or installs. Computations below are reads/parses over retained bytes, not executions of any gate.

Axes: **identity** (seat/publisher/producer attribution), **anchoring** (what the hash chain is rooted in), **claim wording** (consistency vs authenticity), **C1 depth legitimacy** (does value 12 discriminate a substituted record).

## Counterexamples

### F1 — Shape-identical splice from an archived acquisition passes a semantic-only oracle

`.ufo/waves/round-21/history/runtime-v4/na-reset.json` (tracked; sha256 `8a88a8c6…fb42`) has exactly the same top-level keys and frame `dir` set (`action, action-complete, event, observation, result, sent`) as the canonical `corpus/evidence/round-21/runtime/na-reset.json` (sha256 `097b8833…9ec4`), and the same semantics: `Canceled`, errorText `Tool execution cancelled by a form reset`. It differs in producer (`history/runtime-v4/receipt.json` producer sha256 `5363d576…eceb9`, not `bc11e4d6…a811`), invocationId (`A49A4367…` vs `B8BA3C97…`), nonce, and clock: v4 page observations are at `1792588026503`/`1792588027004` = 13:07:06.503Z/13:07:07.004Z. The canonical receipt window is 13:51:46.773Z–13:51:58.439Z (`corpus/evidence/round-21/runtime/receipt.json`). All 12 canonical cases have every frame/page `at` inside that window; I computed this.

Substitution: copy the v4 `na-reset.{json,html}` plus its receipt case, then relink the evidence sha, `runtime-execution-finalized.json` `artifacts` and `receiptSha256`. That is the same "coherent mutate + update digest links" the contract prescribes for selftests. Result:
- The round-21 counter (`.ufo/waves/round-21/measure-c1.mjs:64-141`) has no per-case producer and no receipt-window time containment. Its producer check (line 67) is receipt-level only. [INFERENCE: not executed] it would count this clean.
- A round-22 oracle whose expectations encode only status/errorText/order/window predicates accepts it too: every semantic predicate is satisfied by real-but-different-run bytes.
- Only exact pins (per-case evidence/fixture sha256, invocationId, nonce) taken from the baseline blobs, or a time-containment predicate, turn it red.

**Impacted axes:** C1 depth. The value 12 would not discriminate *which* acquisition is checked, which makes "over the retained round21 acquisition" false. It also affects calibration and the quality trend.

### F2 — Commit identity is a free label, not actor evidence

Every commit carries an author/committer string and none is signed (`%G?` = `N`):

| Commits | Recorded identity |
|---|---|
| Lane commits `e7cf11a…5f58577` | `tabi-shokunin <tabi@shokunin.local>` |
| Fleet closure `2dd025425c247c6fbce4ae6dac53027e30d4e492` (the "non-author" closure) | `protocol-shokunin <protocol@shokunin.local>` |
| Fleet `8596b37…` (round-22 dispatch evidence) | `tabi-shokunin` |

Lane-local `.git/config` sets `tabi-shokunin`. The three private clones (`.ufo/waves/round-22/clones/{BuildOracle,BuildDebt,BuildSelftest}`) have no local identity. They inherit `/home/vgpnk/.config/git/config` `r20 <r20@example.invalid>`, so all three writers would commit under one stale round-20 label. All files are owned by the single Unix user `vgpnk`.

Any seat can run `git -c user.name=protocol-shokunin -c user.email=protocol@shokunin.local commit` and produce a record indistinguishable from the closure's. The fleet prompt's "author and committer must match the lane/protocol identity" (`/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-22.md:343-345`) is a scope guard, not authentication.

**Impacted axes:** identity, discernment. Citing commit author fields as evidence of seat attribution or non-author status would be false provenance.

### F3 — Report-to-seat attribution is path convention only

In round 21 W1, 46 of 64 seat report files exist under `.ufo/waves/round-21/w1/`. The harness-captured returns `.ufo/waves/round-21/w1-returns.json` contain the sha256 of **0** of them; I computed this. Returns carry `agent://TabiR21.<name>` source metadata and text, but no report digest. Any seat can write any `w1/<Name>.md` path.

The round-22 W1 wake-history and W2 chronology corrections both rest on which seat read which bytes and when. History transcripts (`history://`) are harness-retained and are not committed bytes, so they cannot be the only root of a claim (`corpus/QUALITY.md:112-116`, criterion 28).

**Impacted axes:** identity, honest debt correction.

### F4 — "Produced by" is publisher-asserted, not attested

- `receipt.json` `producer.sha256` is self-declared by the receipt.
- `.ufo/waves/round-21/runtime-execution-finalized.json` is a wrapper record written by L1. Its argv `--out .ufo/waves/round-21/runtime-finalized-candidate` differs from the keyed artifact paths `corpus/evidence/round-21/runtime/*`, because the directory was renamed after success (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:53-55`).
- The clocks are consistent: wrapper start 13:51:46.597742Z < receipt start 13:51:46.773Z < receipt finish 13:51:58.439Z < wrapper finish 13:51:58.460511Z < first-containing commit `2d5eaaa` author date 14:16:49Z. All of these come from one host clock or are author-settable dates. They are consistency, not attestation.

**Impacted axes:** claim wording. "No new producer claim" also means no "verified produced by bc11e4…".

### F5 — Self-citation risk

Uncommitted `SCORECARD.md:1052` says: "Reopened own-work S101 supports the source-scoped finite predicates." The predicates are checked against S101's own bytes, so "supports" is circular. The round-21 note already fixes the right boundary: "S101 is the lane's re-runnable own-work evidence, not publisher corroboration" (`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md:14`).

`.ufo/waves/round-21/final/semantic-contrast-witness.json` is labelled `"author": "TabiR21 L1; author-side, not independent closure"`. If round-22 "independent fixed expectations" are transcribed from it or from the receipt, they are independent only of *evaluation-time recomputation*, not of the author.

**Impacted axes:** discernment, calibration.

## What does anchor the records (strongest available, not authentication)

- Every canonical acquisition input is byte-unchanged from measured to delivered. `git diff --name-only 2d5eaaa…5f58577` over `corpus/evidence/round-21`, the execution JSON, producer and note lists only `measurements.json` and `selftest-c1.json`. All 25 `artifacts` pins in `runtime-execution-finalized.json` match the current bytes.
- `5f585773258b33d2d514b00cd0b0775333578db6` equals `refs/remotes/origin/master` (origin `https://github.com/VeigaPunk/tabi-shokunin.git`). It is also recorded outside the lane in fleet `MANIFEST.json:11300` by closure commit `2dd0254`, written before round 22 began.
- That makes baseline-blob equality a **tamper-evidence relative to an externally recorded, pre-round commit**. It is still not authenticity: the author who published 5f58577 could have hand-written those bytes earlier.

## Acceptance boundary

**Admissible wording (consistency):**
- "At measured REV, the retained round-21 acquisition records are byte-identical to the blobs at `5f585773…` (fleet-recorded closure commit) and mutually consistent (receipt ↔ per-case raw ↔ fixture ↔ execution record ↔ note S101 header)."
- "The explicit finite semantic predicates hold over those bytes."
- "Seat X's report (path-convention attribution; sha256 Y at read time)."
- "Clone commit Z under fixture identity `r20@example.invalid`, not seat authentication."
- "Harness-observed wake/terminal events within stated coverage; unavailable history stays unavailable."

**Must be refused** by L1 and by the canonical judge, in the note, SCORECARD, report, finding names or verdict text:
- authentic, authenticated, unforgeable, tamper-proof (`corpus/QUALITY.md:107-110`, criterion 27)
- "verified produced by" the producer
- non-author or seat attribution derived from Git author/committer strings
- "S101 corroborates/supports" its own predicates
- "independent oracle" read as author independence
- settlement or quiescence certification (`corpus/QUALITY.md:235-241`, criterion 51)
- a W2 review credited as review of the finalized bytes: W2 returns at 13:49:02Z precede the final acquisition start at 13:51:46Z (`.ufo/waves/round-22/round21-closure.json`, `wave_conformance_debt`)

## Smallest safe corrections (fixable defects)

1. **Pin to the baseline, not to REV** (closes F1). `corpus/evidence/round-22/semantic-expectations.json` should record `pinnedFrom: 5f585773258b33d2d514b00cd0b0775333578db6` and, per case, the evidence and fixture sha256, invocationId and nonce, plus the receipt and execution sha256. The values come from baseline blobs. `measure-c1.mjs` refuses any mismatch under `evidence_binding`. Optionally it also requires `git merge-base --is-ancestor 5f58577 REV` under `revision_input`.
2. **Add one time-containment predicate under `evidence_binding`.** Every frame and page `at` must fall within the receipt `[startedAt, finishedAt]`, and that window must sit within the wrapper's `[startedAt, finishedAt]`. Red control: the v4 na-reset splice with all digest links relinked, so it fails on chronology, not on a stale hash.
3. **Close the chain.** `measure-c1.mjs` should pin the sha256 of `semantic-expectations.json`. The measurement binding should record the executed `measure-c1.mjs` sha256 at both measured and delivered REVs. The CLI runs the worktree script against REV blobs, so the executed counter's identity is otherwise unbound to REV.
4. **Write an import ledger** (`corpus/QUALITY.md:201-208`, criterion 45). Per writer, record clone path, base, 40-hex commit, `git rev-parse <commit>:<path>` blob ids and sha256, and the identity label "r20@example.invalid via global config; not seat authentication". Do not cite the lane's `tabi-shokunin` commit as the writer's identity.
5. **Bind reports at read time.** When a round-22 or debt correction relies on a seat report, record its sha256 at read time next to the `agent://<id>` return it is attributed to, or state "path-convention attribution". Export any `history://` excerpt used by WakeHistory or the debt correction into committed bytes, with the source URI and read time. Label it harness-observed and coverage-limited.
6. **Reword `SCORECARD.md:1052`** to: "Reopened own-work S101 retains the observations the finite predicates are checked against; S100 supplies scoped source interpretation; neither authenticates the acquisition." The new note `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` should keep a limits line equivalent to `webmcp-nonautosubmit-round-21-corrected.md:111-113`.

## Tradeoffs the canonical judge must reject, not fix

- Authenticity against a malicious or forging author cannot be reached with unsigned, single-user, author-settable records and no external witness of the acquisition. Any round-22 claim that implies it must be rejected, not repaired with more hashes.
- Author-independent expectations are not attainable inside a lane-dispatched wave (`.ufo/waves/round-21/w1/CriticAuthorship.md:1-8`). Lane critic/reviewer agreement, including this report, is author-side first-falsification, never non-author admission.

No production edits, tests, gate executions, browser or network actions, peer messages or tool installs were performed.

Report: `.ufo/waves/round-22/w1/CriticAuth.md`
