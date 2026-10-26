# ExecRerunC3 — C3 (freshness) re-measured at 32008a453737a27f69e9ab401d0b9775d2a944f7

Seat: `ExecRerunC3` (w2 falsify, tabi lane round 29 attempt 1).
Milestone: C3. Attack seat: findings only, no production file touched, no lane index/jj state altered.
Lane checkout was **read only**; every measurement ran in a clean `git clone --shared` under
`/fast/scratch/hyaku/tabi-r29/ExecRerunC3/clone` (`TMPDIR` set to that scratch dir for the self-test sandboxes).

Tool installs/upgrades: **none** (node 24.21.0, git, curl, python3 already present; pacman paused, nothing needed).

---

## 1. Setup and the one deviation worth naming

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin clone        # exit 0
$ git -C clone log --oneline -3
e1e3a15 round-29: wave-1 evidence (44 seat reports, pin entries/drafts, attack receipts), lesson, QUALITY 71-73, README frontier
32008a4 round-29: S094 404 nonce normalisation, S045 semantic note, baseline receipt provenance
35045d7 round-29: LOG entry with doc-bound correction of LOG.md:221
$ git -C clone checkout -q --detach 32008a453737a27f69e9ab401d0b9775d2a944f7
$ git -C clone rev-parse HEAD   -> 32008a453737a27f69e9ab401d0b9775d2a944f7
$ git -C clone status --porcelain | wc -l  -> 0
```

The lane branch (`master`) carries **one commit after the frozen tip**: `e1e3a15` (wave-1 evidence mount).
The assigned revision `32008a4` is the parent. I measured both, and the counter output is byte-for-byte
equivalent (section 4), so the extra commit does not change C3.

Counter frozen-ness (claims C3: "the counter frozen in this round's counter commit"):

```
$ for r in 97be89b 32008a4 e1e3a15; do git show $r:scripts/check-release-pins.mjs | sha256sum; done
567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770  (all three revisions, identical)
```

---

## 2. Required commands, verbatim, with exit codes

```
$ node scripts/check-release-pins.mjs --selftest
CASE id=absent-receipt-all-unresolved ... PASS
... (20 cases) ...
RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20
exit=0
```
(raw: `raw/c3-selftest-32008a4.txt`) — 20/20 PASS, exit **0**. The self-test's own failure path exits 3; not taken.

```
$ node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --stable 156.0.8078.47 --json
exit=1
{"rev":"32008a453737a27f69e9ab401d0b9775d2a944f7","stable":"156.0.8078.47",
 "population":23,"resolved":0,"unresolved":23,"holds":0,"drifted":0,"clean":false}
```
(raw: `raw/c3-measure-32008a4.json`, `raw/c3-measure-32008a4.txt`, exit in `raw/c3-measure-32008a4.exit`)

**population = 23 confirmed.** **Target `unresolved = 0` is NOT met at this revision** — falsified as
stated, as expected: the refetch records land after this wave.

Reason census over the 23 rows, from the JSON:

- 40 file-level `f6-refetch` reasons (multi-file rows contribute several).
- Programmatic check `rows where reasons contains anything not starting with "f6-refetch"` → `[]`.

**Every unresolved reason is `f6-refetch` and nothing else.** No row is short of bytes, ranges, digest
binding or supersession: the only missing artifact is the second-seat re-fetch record.

Population is not just the counter's own parse — independent parse of the registry blob at 32008a4
(same 13-cell split, `recheck == on-release`, any tag `< 156`), `raw/SOURCES-32008a4.md`:

```
rows 115   recheck cells {"on-release":89,"90d":13,"180d":8,"365d":4,"730d":1}
tags {"154.0.8037.97":23,"156.0.8078.47":7}     population 23
S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093 S094 S096
S097 S098 S099 S100 S105 S106
```
Identical id set to the counter's. `corpus/evidence/round-29/release-pins/refetch/` holds **0** files at
`32008a4` **and** at `e1e3a15` — consistent with "refetch records land after this wave".

---

## 3. My own 156 fetches for S042 / S094 / S106, committed in the scratch clone

Network (read-only GET, status kept), `raw/fetch-digests.txt`:

```
status  path                                                                   body                  sha256
200  third_party/blink/renderer/core/script_tools/model_context.cc            base64 -d -> 51112 B  sha256 94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3
404  third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc  raw 233 B           sha256 aafde029f7667a129aa11f03057ba0af6a22f7b3f4bb8b2a0c94280640e89cf0
200  content/public/common/content_features.cc                               base64 -d -> 74920 B  sha256 392e24d777b3e8200325ff6523fd184b2ce633f27e442264558681480d65b259
```

- S042 and S106 digests are **identical** to the receipt `new_sha256` values — true independent agreement.
- S094 is a 404 whose body embeds a per-request nonce. My raw body differs from the committed 156 body;
  replacing `request_id: "<32 hex>"` with `request_id: "<per-request id removed>"` yields bytes
  **byte-identical** to the committed blob (`cmp` → IDENTICAL, sha256 `604d9798…4868`). The receipt's own
  normalisation note is therefore reproducible from my own fetch (`raw/s094-156-raw-404body.bin`,
  `raw/s094-156-normalised.bin`). I recorded the **normalised** digest in the refetch record, because the
  counter compares against committed `new_sha256` — see risk R2.

Three records written (seat `ExecRerunC3`, distinct from every receipt `fetched_by`, which are
`PinS033 … PinS106`), commit **0be9305** ("scratch: ExecRerunC3 independent 156 refetch records for S042 S094 S106"):

```
$ node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json   # exit=1
{"population":23,"resolved":3,"unresolved":20,"holds":2,"drifted":1}
S042 {"resolved":true,"verdict":"drifted","reasons":[]}   # drift accepted by superseding row S109 (pinned at 156)
S094 {"resolved":true,"verdict":"holds","reasons":[]}
S106 {"resolved":true,"verdict":"holds","reasons":[]}
reasonKinds {"f6-refetch":37}     still-unresolved-with-other-reasons: []
```
(raw: `raw/measure-refetch3.json`)

So the three rows resolve, and the three verdicts the counter computes are **drifted / holds / holds** —
S042's drift is the one that needs (and has) a `supersedes S042 —` row at the 156 tag.

### Wrong-sha record stays unresolved

`S033` (path `…/model_context_supplement.idl`, status 200, receipt `new_sha256` `50dd337d…6364`) with the
last hex digit flipped to `…6365`, commit **c825359**:

```
$ node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json   # exit=1
{"resolved":3,"unresolved":20,"holds":2,"drifted":1}
S033 {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/renderer/core/script_tools/model_context_supplement.idl"]}
S042/S094/S106 unchanged (resolved)
```
(raw: `raw/measure-wrongsha.json`) — less-than-`new_sha256` binding holds; the record does not launder a row.

### Three further binding mutations (cheap, each isolated in its own commit)

| commit | mutation | result |
|---|---|---|
| 0a1b064 | S106 record, correct path/status, sha flipped | `S106 unresolved f6-refetch …content_features.cc`, resolved 3→2 (`raw/measure-s106-wrongsha.json`) |
| 7d66096 | S094 record, right sha, `tag` = `155.0.8059.84` | `S094 unresolved f6-refetch …form_mcp_schema_unittest.cc`, resolved 2→1 (`raw/measure-s094-wrongtag.json`) |
| b232f9f | S042 record, `seat` = `PinS042` (= receipt `fetched_by`) | `S042 unresolved f6-refetch …model_context.cc`, resolved 1→0 (`raw/measure-s042-sameseat.json`) |

Each mutation regresses exactly one row to `f6-refetch`, exit 1.

---

## 4. Extra observations (same command, other revisions)

```
$ node scripts/check-release-pins.mjs --rev e1e3a15f2db10c135739e0ee7e81ce63a02facf6 --stable 156.0.8078.47 --json
exit=1  {"population":23,"resolved":0,"unresolved":23,"holds":0,"drifted":0,"receipt_present":true}
reasonKinds {"f6-refetch":40}
```
(`raw/measure-tip.json`) — lane tip and assigned revision agree exactly; adding `e1e3a15` changed nothing for C3.

**Reachability projection (labels below are fabricated, not evidence of resolution).** To answer "is
`unresolved = 0` mechanically reachable once real refetch records land", I built commit **1d15160** on a
throwaway branch from `32008a4` with 23 refetch files whose digests were **copied from the receipt**
(`"method": "FABRICATED PROJECTION - receipt digests copied, no fetch performed"`):

```
$ node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json
exit=0  {"population":23,"resolved":23,"unresolved":0,"holds":16,"drifted":7,"clean":true}
drifted, all with accepted supersession: S042 S071 S078 S080 S081 S096 S100
```
(`raw/measure-projection.json`)

Reading: with the refetch records present, 16 rows hold and **7 drift**, and each of the 7 already has an
accepted `supersedes <id> —` row at the 156 tag (S109–S115). No `s1-drift-unsuperseded` appears. So the
arriving wave's refetch records are sufficient to hit the target *provided* each drifting row's supersession
survives review, and the wave's own verdicts must be `drifted` for exactly those 7 rows if the committed 156
bytes are honest.

---

## 5. Findings (attack surface, ranked)

**R1 — `f6` is unenforceable paperwork, exactly like the C2 counter's gameable condition.**
The projection in section 4 resolved **23/23 with zero network fetches**, by copying each receipt
`new_sha256` into a plausible refetch file with a different `seat`. `f6` compares committed JSON fields to
receipt fields; it never sees a fetch. "An independent re-fetch from a different seat" is therefore a
procedural assertion the snapshot counter cannot test, and the `copied-old-as-new-caught-by-refetch`
self-test case is actually caught by the verdict computation (`holds` vs `drifted`), not by `f6`.
Mitigation that *does* bind: `f3` hashes the committed 156 bytes to `new_sha256`, and the per-file verdict
re-derives `holds`/`drifted` from those bytes, so substituting bytes is caught. Recommendation for the L1
(wave-3/next round, not mine to apply): give the refetch record a fetch-side field the receipt cannot
supply — e.g. an HTTP `Date`/`etag` header value plus the raw body digest before normalisation — or require
the refetch file to carry its own `old_sha256` re-derivation; otherwise C3's freshness work is done by
`f3` + verdict, and `f6` should be described as seat-provenance only, not as independent verification.

**R2 — a nonce-bearing 404 penalises an honest raw fetch.**
For S094 the only digest that satisfies `f6` is the *normalised* committed digest `604d9798…`. My honest
raw fetch (`aafde029…`) would have left the row unresolved, and the raw fetch of a second independent seat
will differ again (Gitiles varies `request_id` per request). Consequence: honest seats must either
normalise exactly as the receipt did, or copy the receipt digest. Two seats normalising "correctly" agree
only because the normalisation rule is identical; the check cannot distinguish that from copying. My record
used the normalised digest, and I proved byte-identity with the committed blob, so this instance is sound —
the general mechanism is not.

**R3 — wave-1's S094 `f5-digest` observation is a fixture artifact, not a lane defect.**
`.ufo/waves/round-29/w1/CritSemanticDrift/tip-subset-fakerefetch-run.txt` reports `resolved=22`,
`S094 … ['f5-digest']` on a "tip" fixture, which contradicts my measurement of the same tip. Cause, from
their `build_tip.py`: the fixture's 154-side 404 body is their **own** fetch
(`nf/154.0.8037.97.404body`, sha `77a2a5f6…`, per-request nonce) instead of the lane's committed round-19
retained body (`9d640282…`), which is what the S094 registry anchor binds
(`body sha256 9d640282…8b19`, verified against the committed 154 blob). Their own `s094-remedy-a-run.txt`
(zcat of the round-19 gz as the old body) reports `S094: True holds`, consistent with mine. No action on the
lane; note it so wave-3 does not re-open S094 on the strength of that fixture.

**R4 — `f5` covers 15 of 23 rows.** 8 population rows carry no digest in source/anchor cells
(S045, S062, S064, S071, S074, S080, S081, S106); for them the only byte binding is `f3` (committed bytes →
receipt sha) plus the verdict computation. Not a defect, but the claim's "registry-digest match" is partial
by construction and should not be counted as blanket coverage.

**R5 — population stability.** 23 rows at exactly one tag (`154.0.8037.97`) and 89 `on-release` rows total;
if any of the 7 rows already pinned at `156.0.8078.47` had recheck `on-release` they would leave the
population at the next stable bump — the counter would silently shrink its population rather than flag them.
`empty population` refuses (exit 2), so a total shrink is safe; a partial shrink is not detected. Worth a
one-line note in the claim record.

---

## 6. What I did not do

- No production file, lane tracked file, lane index, jj state, or fleet/sibling repo touched. All commits are
  in `/fast/scratch/hyaku/tabi-r29/ExecRerunC3/clone` (fixture-style scratch clone), each with
  `git -C "$clone" rev-parse --show-toplevel` equal to that clone before committing.
- No builds, linters, formatters, or lane gates other than the two commands assigned (self-test + measurement).
- No subagent, no background job, no broadcast message.
- Old (154) bytes were **not** re-fetched by me: `f3` binds them to committed blobs, and R3's analysis used
  the committed blobs plus wave-1's retained fetches.
- Scratch retained for inspection (no `trap` cleanup executed) at
  `/fast/scratch/hyaku/tabi-r29/ExecRerunC3/`; receipts copied into this directory first.

## 7. Verdict

C3 at `32008a453737a27f69e9ab401d0b9775d2a944f7`: **population = 23 (independently confirmed), unresolved = 23,
every reason `f6-refetch` only**; self-test `verdict=clean cases=20 passed=20`, exit 0; measurement exit 1.
Three real refetch records I fetched myself resolve S042 (`drifted`, supersession S109), S094 (`holds`),
S106 (`holds`); a wrong-sha record leaves its row unresolved; three further binding mutations each regress
exactly one row. The target `unresolved = 0` is reachable once the wave's refetch records land, but `f6`
itself proves only seat paperwork (R1) and must not be reported as independent byte verification.

### Receipts

All under `.ufo/waves/round-29/w2/ExecRerunC3/raw/`:
`c3-selftest-32008a4.txt`, `c3-measure-32008a4.json`, `c3-measure-32008a4.txt`,
`c3-measure-32008a4.exit`, `c3-measure-32008a4-plain.exit`, `measure-refetch3.json` (0be9305),
`measure-wrongsha.json` (c825359), `measure-s106-wrongsha.json` (0a1b064),
`measure-s094-wrongtag.json` (7d66096), `measure-s042-sameseat.json` (b232f9f),
`measure-projection.json` (1d15160, FABRICATED), `measure-tip.json` (e1e3a15),
`SOURCES-32008a4.md`, `s094-156-raw-404body.bin`, `s094-156-normalised.bin`, `fetch-digests.txt`.
