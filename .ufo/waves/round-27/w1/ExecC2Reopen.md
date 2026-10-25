# ExecC2Reopen — independent S106 re-open and C2 re-derivation (round 27, second chair at the repaired tip)

Seat: `ExecC2Reopen` (leaf, read-only reporter). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. No tracked file was modified by this
seat; no git/jj write was run; every repo read was `git show`/`rev-parse`/`ls-tree`/`log`
against a committed revision. Scratch (throwaway): `.ufo/waves/round-27/scratch/ExecC2Reopen/`.

**Measured revision:** `master` = `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (detached
HEAD at the same commit). **Claim baseline:** `f185b4e7ab10cd9e8925e8ec614c9c111772357d`,
confirmed an ancestor of HEAD (`git merge-base --is-ancestor … && echo YES` → `YES`).
Claim under test: round-27 `claims[].id=C2` (`.ufo/waves/round-27/claims.json:35`).

**Supersedes an earlier chair of this same seat** that wrote this path at
`2026-10-25 14:32:52 -0300` against HEAD `336d5d1` (gate sha256 `a339ec31…`). That
chair's source-evidence conclusion (no mismatch) still holds, but its tip is no longer
the tip: two commits landed at 14:35 (`5198e28`, `5ed6484`) that change the very gate
under test. Sections 7 and F1/F2 below are new relative to that report.

**Working-tree state (observed, not mine):** the tree is dirty from sibling work and the
set grew while this seat ran. Snapshot at 14:41 (-03): `git status --porcelain` →
`M LOG.md`, `M corpus/QUALITY.md`, `M corpus/README.md`, `M corpus/SOURCES.md`,
`M corpus/knowledge/redirect-and-retry-after-semantics.md`, `M corpus/lessons/round-27.md`
(`git diff --stat` = 6 files, +81/−43), plus untracked round-27 wave files and
`scripts/report-contract.mjs`. None of these were written by this seat. The S106 row in
`corpus/SOURCES.md` is not among the changed hunks (`git diff corpus/SOURCES.md | grep -c '^[-+].*S106'` → 0),
and `scripts/check-s106-evidence.mjs`, `corpus/evidence/round-26/sources/`, `SCORECARD.md`,
`SKILL.md` and the round-27 claims files are unchanged in the working tree relative to
`master` (`git diff --quiet master -- scripts/check-s106-evidence.mjs && echo UNCHANGED_IN_WORKTREE`
→ unchanged). All substantive numbers below come from committed blobs or from files
verified unchanged, so sibling edits cannot move them.

## Verdict

**No mismatch on the S106 source evidence.** Every value the item names reproduces
exactly from an independent fetch in this chair, and the fetched decoded bytes are
byte-identical (`cmp`) to the blob committed at `master`. Re-deriving the gate's
`evaluate()` predicate by hand from those committed bytes yields
`present=true, sha_match=true, anchor_located=true, anchor_unique=true,
byte_count_match=true, valid=true` — C2's `AFTER` is satisfied at the tip.

**Two conditional notes, both revision-bound (not defects in the source evidence):**

1. The C2 measurement of record is taken at `5577d1b6` (pre-repair gate sha256
   `a339ec31…`), not at the tip. At that commit the gate's receipt-absent branch
   returned `valid:false` and exited 1, contradicting the claim's own kill rule
   (exit 2). The tip repairs this (`5198e28` + `5ed6484`; gate sha256 `fce4d4e2…`,
   5 self-test cases). So the claim holds at the tip, but **no tip-revision counter
   receipt exists**; tip equivalence rests on blob identity plus an unchanged
   predicate path, which is `[INFERENCE]` in this report (see F1).
2. `SCORECARD.md:1397` still binds the met-claim to `5577d1b6` with "selftest 4/4",
   while `SKILL.md:2514` records the tip as "(cases=5, passed=5)". Each is correct
   for its own revision; the two tallies are not cross-referenced.

## 1. Documented GET (one request)

```
cd .ufo/waves/round-27/scratch/ExecC2Reopen
curl -sSL -o s106-encoded.bin \
  -w 'HTTP=%{http_code}\nSIZE=%{size_download}\nURL=%{url_effective}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT'
```

| field | observed | expected | match |
|---|---|---|---|
| curl exit | 0 | 0 | yes |
| HTTP status | 200 | — | — |
| `url_effective` | identical to the requested URL (no redirect) | — | yes |
| encoded bytes (`size_download` and `wc -c`) | 98604 | 98604 (receipt `encoded_bytes`) | yes |
| encoded sha256 | `f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03` | `f17347b2…` | **yes** |
| newline count in transfer (`wc -l`) | 0 | — | — |
| non-base64-alphabet bytes after `tr -d 'A-Za-z0-9+/='` | 0 | — | — |
| transfer decoding (`base64 -d`) | exit 0, empty stderr | — | yes |
| transfer re-encode (`base64 -w0 s106-decoded.cc \| sha256sum`) | `f17347b2…` (equals encoded sha256) | — | yes |

Arithmetic consistency: `4*ceil(73952/3) = 4*24651 = 98604`, i.e. the encoded length is
exactly the base64 length of a 73952-byte payload.

Saved bytes: `s106-encoded.bin` (98604 B, sha256 `f17347b2…`).

## 2. Decode

```
base64 -d s106-encoded.bin > s106-decoded.cc    # exit 0, no stderr
```

| field | observed | expected | match |
|---|---|---|---|
| decoded bytes (`wc -c`) | 73952 | 73952 | **yes** |
| decoded sha256 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` | `9b93fe64…` | **yes** |
| decoded lines (`awk 'END{print NR}'`, `wc -l`) | 1624 / 1624 | 1624 (receipt `decoded_lines`) | yes |
| non-ASCII bytes (`LC_ALL=C grep -c '[^ -~\t]'`) | 0 | — | — (utf-8 round-trip is byte-exact) |
| final byte (`od -An -tx1`) | `0a` | — | — |
| first/last line | `// Copyright 2015 The Chromium Authors` / `}  // namespace features` | — | plausible tag content |
| `^BASE_FEATURE(` lines | 206 | — | — |

Saved bytes: `s106-decoded.cc` (73952 B, sha256 `9b93fe64…`).

## 3. Compare decoded bytes to the committed blob

```
git show master:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc > committed.cc
git show master:… | sha256sum      # 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44
git ls-tree -l master -- corpus/evidence/round-26/sources/
# 100644 blob 1ec86eaac948e8c295def4a70273bd7e75e01446   73952  …/content-features-154.0.8037.97.cc
# 100644 blob e2cc93298c4df00cbac614b6d8ebebff705ddbfb    1750  …/s106.json
cmp s106-decoded.cc committed.cc   # exit 0 → IDENTICAL_BYTES
```

| field | value |
|---|---|
| committed blob sha256 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` |
| committed blob size | 73952 B |
| committed blob oid | `1ec86eaac948e8c295def4a70273bd7e75e01446` |
| fresh decode == committed bytes | **yes (`cmp` exit 0)** |
| blob identical at baseline / cited commit / tip | `git rev-parse f185b4e:… 5577d1b6:… master:…` → `1ec86ea…` at all three |

So the committed evidence-of-record is bit-for-bit what the live tag serves today, and it
did not change between the baseline, the cited measurement commit and the tip.

## 4. Anchor

```
grep -c 'BASE_FEATURE(kBackForwardCache,' s106-decoded.cc      # 1
grep -cF 'BASE_FEATURE(kBackForwardCache,' s106-decoded.cc     # 1
grep -n 'kBackForwardCache' s106-decoded.cc                    # 187, 191, 203, 215
awk 'NR>=186 && NR<=188 {printf "%d: %s\n", NR, $0}' s106-decoded.cc
```

Verbatim, line 187 ±1:

```
186: // Enable using the BackForwardCache.
187: BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);
188: (empty)
```

- Exact-line uniqueness: `awk` trimmed-equality count over the whole file = **1**; the
  line-187 text hashes to `2e06fe8f…`, identical to `printf '%s\n' '<anchor text>' | sha256sum`.
- Registry row `corpus/SOURCES.md:120` holds the same anchor and says "decoded text lines 186-187
  carry `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)`"; the row's quote
  omits the trailing `;` that line 187 carries (substring locate still succeeds — see F5).
- The other three `kBackForwardCache` lines (191, 203, 215) are distinct symbols
  (`kBackForwardCacheEntryTimeout`, `…MemoryControls`, `…CCNSIgnoreUnchangedCookies`), so the
  unique-anchor predicate is real, not an artefact of a narrow grep.

## 5. Independent re-derivation of the gate's `evaluate()` (manual oracle)

Read of `scripts/check-s106-evidence.mjs` at `master` (blob `ea0f9d89…`, sha256
`fce4d4e2…`, 337 lines, mode 100755): the verdict is
`const valid = shaMatch && anchorLocated && anchorUnique && byteCountMatch;` (line 127),
with `present` forced true whenever the receipt exists; receipt-absent throws `Refusal`
→ exit 2 (line 111) and bytes-absent throws `Refusal` → exit 2 (line 117).

I re-derived each input from committed bytes by hand, **without executing the lane gate**
(contract: the L1 runs lane gates after integration):

| field | my independent value | how derived |
|---|---|---|
| `rev` | `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` | `git rev-parse master` |
| `present` | true | `git ls-tree master -- …/s106.json` → blob `e2cc9329…` |
| `decoded_bytes` | 73952 | `wc -c` on the committed blob |
| `decoded_sha256_claimed` | `9b93fe64…` | receipt field (`s106.json`) |
| `decoded_sha256_observed` | `9b93fe64…` | `git show master:… \| sha256sum` |
| `sha_match` | **true** | equality above |
| `anchor.line` / `occurrences` | 187 / 1 | `awk` line print + trimmed-equality count |
| `anchor_located` | **true** | trimmed equality of `lines[186]` to receipt text |
| `anchor_unique` | **true** | 1 occurrence in 1624 lines |
| `byte_count_match` | **true** | 73952 == `receipt.decoded_bytes` |
| `valid` | **true** | conjunction, line 127 |

This is field-for-field identical to the recorded measurement
`.ufo/waves/round-27/measure-c2-5577d1b.json` except its `rev`, which is
`5577d1b6…`; the underlying receipt and bytes blobs are identical at both revisions
(section 3), so the counter value cannot differ across them. `[INFERENCE]`, not an
executed tip run.

## 6. Receipt cross-check (`corpus/evidence/round-26/sources/s106.json`, 1750 B)

- `schema` = `tabi-s106-evidence-v1` = the gate's `RECEIPT_SCHEMA`; `url` string-identical
  to the URL fetched here; `bytes_path` resolves at `master`.
- Re-derived independently and matching: `encoded_bytes` 98604, `encoded_sha256`
  `f17347b2…`, `decoded_bytes` 73952, `decoded_lines` 1624, `decoded_sha256` `9b93fe64…`,
  `anchor.line` 187, `anchor.text` = line 187 verbatim, `anchor.comment_line` 186,
  `anchor.comment` = line 186 verbatim, `anchor.occurrences_in_file` 1.
- The receipt has **no revision field** (top-level keys: `anchor, bytes_path, decoded_bytes,
  decoded_lines, decoded_sha256, encoded_bytes, encoded_sha256, fetched_at, row, schema,
  status, transfer, url, verification`). See F2.
- `status` (line 25) is stale against round 27 — see F3.

## 7. Tip advance: the gate was repaired after most wave seats measured

Round-27 commits (`git log --format='%h %cI %s' f185b4e..master`), with the gate file hash
and self-test case count at each:

| commit | time (-03) | gate sha256 | cases | note |
|---|---|---|---|---|
| `fd722a7` | 14:14:21 | absent | — | C1; gate not yet added |
| `5577d1b` | 14:15:11 | `a339ec31…` | 4 | gate introduced (claim's cited commit) |
| `6ca3b89` | 14:15:19 | `a339ec31…` | 4 | C3 |
| `ef7a274` | 14:18:07 | `a339ec31…` | 4 | SKILL row added, `(cases=4, passed=4)` |
| `024d60c` | 14:18:17 | `a339ec31…` | 4 | SKILL verdict-map wording |
| `5a0178c` | 14:18:28 | `a339ec31…` | 4 | SKILL verdict-map wording (0=clean) |
| `8e07f0b` | 14:22:19 | `a339ec31…` | 4 | measure receipts incl. `measure-c2-5577d1b.json` |
| `336d5d1` | 14:25:52 | `a339ec31…` | 4 | lesson/QUALITY/SCORECARD; the tip most seats measured |
| `5198e28` | 14:35:27 | `9b99f4eb…` | 5 | receipt-absent → `throw Refusal` (exit 2); adds case 5; SKILL row → `cases=5` |
| `5ed6484` | 14:35:59 | `fce4d4e2…` | 5 | fixture `commit --allow-empty` (makes case 5 runnable) |

- `git diff 5577d1b6 5198e28 -- scripts/check-s106-evidence.mjs` replaces
  `return { … present:false, valid:false, reason: 'receipt absent…' }` with
  `throw new Refusal(\`receipt absent at ${rev}\`);` and appends the
  `missing-receipt-could-not-evaluate` case (exit 2).
- `git diff 5198e28 5ed6484 -- …` changes `commit -q -m fixture` to
  `commit --allow-empty -q -m fixture` — without it, case 5's empty fixture repo cannot
  create a revision and the self-test would throw out of the fixture helper.
- Fixture mechanic re-exercised in a throwaway repo under my scratch (aligned with the
  contract: `git -C "$D"` for every call, toplevel verified before the first commit):
  `git add -A` then `git commit --allow-empty -q -m fixture` → exit 0, `rev-parse HEAD`
  → `c125f9d…`; `git show "$rev:corpus/evidence/round-26/sources/s106.json"` → exit 128,
  i.e. `readBlob` returns null → `Refusal` → exit 2. Case 5 now passes by construction.
  `[INFERENCE]` for the gate's own `--selftest` exit, since I did not run it.
- Sibling reports `RevC2Gate.md` and `MutC2Gate.md` (written 14:33) measured the
  pre-repair gate (`MutC2Gate` records source sha256 `a339ec31…`; `RevC2Gate` reports
  "receipt-absent kill rule exits 1 (invalid), not 2"). At the current tip that reported
  defect is no longer present; the tip's own selftest is no longer blind to it. Both
  sibling reports predate `5198e28`/`5ed6484` by ~2 minutes and are stale on this point.

## Findings

| id | severity | finding | evidence |
|---|---|---|---|
| F1 | **medium (claim-binding)** | The C2 measurement of record was taken at `5577d1b6`, whose gate did not implement the claim's kill rule; the claim's target is "at the tip". The tip is repaired, but no tip-revision C2 counter receipt exists. | `SCORECARD.md:1397` "0 → `valid=true` at `5577d1b6…` … selftest 4/4"; `.ufo/waves/round-27/measure-c2-5577d1b.json` `rev=5577d1b6…`; `git show 5577d1b6:scripts/check-s106-evidence.mjs` line 111 returns `valid:false`; tip line 111 throws; only `measure-c1-*`/`measure-c2-5577d1b.json` exist in `.ufo/waves/round-27/` (sweep: `ls .ufo/waves/round-27 \| grep -i measure`) |
| F2 | **medium (claim integrity)** | Round 27 asserts the kill rule is unchanged but its C2 `killRule` drops two sentences of the frozen round-26 text: the honest-block-on-fetch-failure rule and the measurement-binding clause. The dropped clause is the only textual binding of receipt→revision, and the receipt has no revision field, so nothing mechanical replaced it. | `.ufo/waves/round-27/claims.json:9` "re-dispatches them with predicate, counter, kill rule and target unchanged"; `:45` (shortened killRule) vs `.ufo/waves/round-26/claims.json:49` "the receipt's recorded revision must equal the report's cited measurement revision"; receipt keys have no `rev` |
| F3 | low (stale prose) | The committed evidence-of-record receipt still says C2 failed. Not consumed by the gate, so no verdict moves, but a reader or a prose-based audit would be misled. | `corpus/evidence/round-26/sources/s106.json:25`: "claim C2 fails its frozen predicate and is recorded failed in SCORECARD.md"; gate consumer sweep: `parseReceipt` (lines 87-104) reads `schema,url,decoded_sha256,bytes_path,decoded_bytes,anchor.line,anchor.text` only; `status` is never read |
| F4 | low (doc divergence) | Two tracked tallies for the same gate describe different revisions without cross-reference: SCORECARD "selftest 4/4" (`5577d1b6`) vs SKILL "(cases=5, passed=5)" (tip). Both true for their revision; a naive tally comparison could read them as a mismatch. | `SCORECARD.md:1397`; `SKILL.md:2514` |
| F5 | trivial (quote fidelity) | The S106 registry row's held quote omits the terminal `;` present on decoded line 187. Locating the quote as a substring still succeeds; a whole-line match against the row text would not. | `corpus/SOURCES.md:120` vs decoded line 187 |
| F6 | info (transient, resolved) | At `5198e28` the new 5th self-test case was unrunnable (empty fixture repo + plain `git commit` fails); fixed 32 s later by `5ed6484` (`--allow-empty`). Not present at the tip. | `git diff 5198e28 5ed6484 -- scripts/check-s106-evidence.mjs` |

### Observation vs inference vs unknown

- **Observed (commands retained below):** all hashes, sizes, line numbers, grep counts,
  blob ids, commit times, gate diffs, receipt keys, registry row text, the fixture
  mechanic, and the current working-tree state.
- **`[INFERENCE]`:** the gate's `--rev master --json` value (I did not execute it; it is
  hand-derived from the same committed bytes) and therefore the tip `--selftest` exit 0.
  Also `[INFERENCE]`: that `SCORECARD.md:1397`/`measure-c2-5577d1b.json` were not
  re-measured at the tip — supported by the directory sweep showing no newer measure file.
- **Unknown:** whether the L1 intends the C2 receipt to be re-bound to the tip revision in
  SCORECARD, and whether the 5th case's fixture is acceptable under the wave's fixture
  policy. Not decidable from the repo.

## Risks / blockers for the L1

1. If the final gate run is at the tip, the recorded measurement (F1) does not cover it.
   Recommendation: run the C2 counter once at `5ed6484` (or later) and land that receipt
   beside `measure-c2-5577d1b.json`, so the "at the tip" clause is measured, not inferred.
2. F2 is a claims-text issue, not a code issue. If the wave's rule is "frozen claims are
   never rewritten", the shortened kill rule in round-27 `claims.json` should be
   reconciled append-only (record the delta) rather than silently left as "unchanged".
3. F3/F4 are prose divergences in tracked files; they change no gate verdict today, but
   they are the class the C1 m1 window exists to catch in LOG.md — outside this seat's
   write scope.
4. No blocker prevented this re-derivation. The single GET succeeded; no installs were
   needed.

## Exact retained evidence (scratch artefacts + commands)

Artefacts under `.ufo/waves/round-27/scratch/ExecC2Reopen/`:

| file | bytes | sha256 |
|---|---|---|
| `s106-encoded.bin` | 98604 | `f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03` |
| `s106-decoded.cc` | 73952 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` |
| `committed.cc` (from `git show master:…`) | 73952 | `9b93fe64…` (identical to decoded) |
| `decode.err` | 0 | — |

Commands (all read-only; `…` is the lane root):

```
curl -sSL -o scratch/ExecC2Reopen/s106-encoded.bin -w 'HTTP=%{http_code}\nSIZE=%{size_download}\nURL=%{url_effective}\n' '<item URL>'
sha256sum s106-encoded.bin; wc -c s106-encoded.bin; wc -l < s106-encoded.bin
LC_ALL=C tr -d 'A-Za-z0-9+/=' < s106-encoded.bin | wc -c
base64 -d s106-encoded.bin > s106-decoded.cc; echo $?; wc -c s106-decoded.cc; sha256sum s106-decoded.cc
base64 -w0 s106-decoded.cc | sha256sum
git -C … show master:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc | sha256sum
git -C … ls-tree -l master -- corpus/evidence/round-26/sources/
git -C … show master:…/content-features-154.0.8037.97.cc > committed.cc && cmp s106-decoded.cc committed.cc
grep -c 'BASE_FEATURE(kBackForwardCache,' s106-decoded.cc; grep -n 'kBackForwardCache' s106-decoded.cc
awk 'NR>=186 && NR<=188 {printf "%d: %s\n", NR, $0}' s106-decoded.cc
awk '{gsub(/^[ \t]+|[ \t]+$/,""); if($0=="BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);") c++} END{print c+0}' s106-decoded.cc
awk 'END{print NR}' s106-decoded.cc; wc -l < s106-decoded.cc
git -C … rev-parse master f185b4e7ab10cd9e8925e8ec614c9c111772357d
git -C … merge-base --is-ancestor f185b4e7ab10cd9e8925e8ec614c9c111772357d HEAD
git -C … rev-parse 5577d1b6:scripts/check-s106-evidence.mjs master:scripts/check-s106-evidence.mjs
git -C … diff 5577d1b6 5198e28 -- scripts/check-s106-evidence.mjs
git -C … diff 5198e28 5ed6484 -- scripts/check-s106-evidence.mjs
for rev in 5577d1b6 336d5d1 5198e28 5ed6484; do git -C … show $rev:scripts/check-s106-evidence.mjs | sha256sum; done
git -C … show <rev>:scripts/check-s106-evidence.mjs | grep -c 'id: "'
git -C … log --format='%h %cI %s' f185b4e7ab10cd9e8925e8ec614c9c111772357d..master
git -C … show master:corpus/evidence/round-26/sources/s106.json
git -C … status --porcelain
```

## Files changed / tooling

- Files written: this report (replacing the earlier chair's report at the same assigned
  path) and the scratch artefacts listed above. **No tracked file was touched.**
- Tooling: none installed or upgraded; no package manager invoked (PACMAN GUARD respected).
  Tools used were already present: `git`, `curl`, `base64`, `sha256sum`, `awk`, `grep`,
  `cmp`, `od`, `wc`, `tr`, `sed`, `python3`.
