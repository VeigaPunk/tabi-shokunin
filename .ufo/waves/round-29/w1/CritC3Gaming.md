# CritC3Gaming — attack on the frozen C3 freshness counter

Counter under attack: `scripts/check-release-pins.mjs` at lane rev
`190052c923c6968a3d4a292eb1330938a7cb10b4`, sha256
`567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770` — byte-identical to the
frozen counter commit `97be89bc66139eb45526a04af59a35dccc006eb9` (`git diff 97be89b..HEAD --
scripts/check-release-pins.mjs` empty). Node v24.21.0. No tool installs were needed.

Verdict in one line: **`population=23 unresolved=0` is reachable without re-verifying a single
row at 156.0.8078.47, and the lane's own committed tree reaches the exact target output by
adding 23 refetch JSON files that are mechanically derived from the receipt (S14).** The frozen
predicate sentence does not describe the code on five of its six bindings.

Every fixture below is a scratch `git init` repo under
`$HYAKU_SCRATCH/tabi-r29/CritC3Gaming/` (toplevel verified before the first commit); the lane
was cloned `--shared` once, read-only. Harness sources and raw outputs are copied to
`.ufo/waves/round-29/w1/CritC3Gaming/`. The counter's own `--selftest` is green at this rev
(`RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20`, exit 0 —
`selftest-head.txt`), so none of the attacks below are caught by its suite.

Reproduction (all commands run from `/fast/scratch/hyaku/tabi-r29/CritC3Gaming`):

```
S=/fast/scratch/hyaku/tabi-r29/CritC3Gaming
git clone --shared -q /home/vgpnk/Projects/shokunin/tabi-shokunin $S/lane
S=$S node $S/attacks.mjs  > $S/attacks.out   # exit 0 (it prints fixture verdicts; each is a JSON object)
S=$S node $S/attacks2.mjs > $S/attacks2.out  # exit 0
S=$S node $S/attacks3.mjs > $S/attacks3.out  # exit 0
S=$S node $S/attacks4.mjs > $S/attacks4.out  # exit 0
S=$S node $S/attacks5.mjs > $S/attacks5.out  # exit 0
```

Each fixture is run as
`node $S/lane/scripts/check-release-pins.mjs --repo <fixture> --rev <fixture head> --stable 156.0.8078.47 --json`.

## Attack table

| # | Attack | Counter output | severity |
|---|---|---|---|
| S1 | `bytes/156.0.8078.47` = byte copy of `bytes/154.0.8037.97`; receipt `new_sha256:=old_sha256`; refetch derived from the receipt | exit 0, `population=23 unresolved=0 holds=23` | **critical** |
| S14 | lane's committed tree + 23 refetch JSONs derived from the receipt, `fetched_at: 1970-01-01`, invented seat, no network | exit 0, `population=23 unresolved=0 holds=16 drifted=7` | **critical** |
| S2 | anchor states `lines 7-12`; receipt declares `[[12,12]]`; lines 7-11 rewritten | exit 0, holds | high |
| S3c | row source names the real `content_switches.cc`; entry verifies `attacker/elsewhere/content_switches.cc` only, ranges `[[596,596]]` of stated 596-603 | exit 0, holds | high |
| S4 | row's own `teaches` cell opens `supersedes S041 —`, `superseded_by: "S041"` | exit 0, `drifted=1`, resolved | high |
| S5c | superseder S900 = one registry line with a 156 URL to a nonexistent path, no receipt entry, no bytes | exit 0, `drifted=1`, resolved | high |
| S6c | S105 forced out of the population (a `\|` in its anchor cell → 14 cells → skipped), synthetic S999 appended | exit 0, `population=23 unresolved=0` with S105 absent | **high** |
| S15 | S105's source cell loses `refs/tags/154.0.8037.97/` (tag remains in the anchor); S999 appended | exit 0, `population=23 unresolved=0` with S105 absent | **high** |
| S12 | anchor states no line range at all; ranges `[[8037,8037]]` pass because `8037` occurs inside the tag `154.0.8037.97` | exit 0, holds | **high** |
| S10 | anchor names two files; entry lists only one; the omitted file's 156 bytes differ wholly | exit 0, holds | high |
| S8 | row records the real `.cc` digest; `.cc` bytes fabricated, the real `.cc` content sits under the `.h` path | exit 0, holds | medium |
| S7 | `old_status 404`: any body containing `NOT_FOUND`; declared ranges `[[100,200]]` exceed the file's two split lines (an `f4-ranges` failure for any 200 row) and are never checked | exit 0, holds | medium |
| S9 | range `[4,4]` is the empty line produced by `split("\n")` after the final newline | exit 0, holds | medium |
| S16 | same recorded digest: `sha256 <hex>` → `f5-digest`; `sha256<hex>` (S074's own spelling) → resolved | exit 1 → exit 0 | medium |
| S11 | `f.path` containing `..` | exit 1 `f2-path-bound` | none (blocked) |

## The two critical combinations

### S1 — 156 bytes may be a copy of 154 and the counter calls it `holds`

`attacks.mjs` builds the full 23-row registry, copies the receipt's own `bytes/154.0.8037.97`
tree to `bytes/156.0.8078.47` (`diff -rq` exit 0), sets `new_sha256 := old_sha256` and
`new_status := old_status` in the receipt, and writes one refetch record per row with
`seat: "RivalSeat-not-the-fetcher"`, `fetched_at: "whenever"`.

```
exit=0 population=23 unresolved=0 holds=23 drifted=0
```

Why: `f3-bytes` (l.209-215) only compares a committed blob against the sha the receipt itself
declares; `f6-refetch` (l.217-220) only compares two strings (`rf.seat !== entry.fetched_by`) and
the receipt's own `new_sha256`; `blockIn` (`f4`) is satisfied trivially when old and new bytes are
identical. Nothing anywhere ties the blob under `bytes/156.0.8078.47/` to a fetch of tag
`156.0.8078.47`. The claim's junk control `copied-old-as-new-caught-by-refetch` catches only an
agent that copies the bytes **and forgets to copy the refetch record**; `_refetch` there is
`sha256(NEW_SAME)` while `new_sha256` is `sha256(OLD_TEXT)`. An author who derives the refetch from
his own receipt defeats the case.

### S14 — the claimed target output, from the committed tree, with no network

`attacks4.mjs` copies `corpus/SOURCES.md`, the committed receipt and the committed 154/156 byte
trees unchanged, then writes the 23 refetch files as
`{id, seat: "seat-name-invented-by-the-receipt-author", fetched_at: "1970-01-01T00:00:00Z",
files: entry.files.map(f => ({path, tag: NEW, status: f.new_status, sha256: f.new_sha256}))}`.

```
exit=0 population=23 unresolved=0 holds=16 drifted=7
driftedIds=[S042,S071,S078,S080,S081,S096,S100]
```

Zero bytes fetched by anyone; `fetched_at` is never read (l.217-220). The seven drifted rows are
cleared by `superseded_by` S109–S115 (l.250-254); those seven registry lines have **no receipt
entry, no committed bytes, no digest check and no refetch record** — the counter only tests
`teaches.startsWith("supersedes <id> —")` and `source.includes("refs/tags/156.0.8078.47/")`.
So 7 of 23 rows rest on registry prose that the gate never reads. The counting command cannot
distinguish this run from an honest one.

## Population escapes (the count is not an identity)

- `parseRegistry` skips any `S###` line that does not split into exactly 13 cells (l.121,
  `continue`) and any line not matching `ROW_RE` (`^ {0,3}\|`, l.75). A `|` inside a cell, a
  4-space indent, or a tab silently removes the row.
- `population` (l.178) is a *count* of parseable rows; there is no allowlist and no id-set
  equality. S6c drops S105 (`r1-entry missing` in the control → `exit 1 population=23
  unresolved=1`) by injecting a pipe into its anchor cell and appends a synthetic S999 with
  fabricated identical 154/156 bytes: `exit 0 population=23 unresolved=0 holds=16 drifted=7`,
  reported ids `S033…S106, S999` with **S105 absent**.
- S15 does the same by deleting only `refs/tags/154.0.8037.97/` from S105's source cell while its
  anchor still says `tag 154.0.8037.97`: population filter reads tags from the source cell only
  (l.178 with l.126 `tags: ... cells[2]`), so the row leaves the population and the count is
  restored by S999. Same output.
- Controls: `S6a` (receipt lacks S105, registry untouched) → `exit 1 population=23 unresolved=1`;
  `S6b` (S999 added, S105 kept) → `exit 1 population=24 unresolved=1`. Only the drop+add pair
  reaches `population=23 unresolved=0`.

## Anchor binding is vacuous for every real row

`anchorHasRange` (l.140-144) accepts `a` alone when `a = b`, and its lookarounds admit any digit run
that is not adjacent to another digit. Every population row's anchor carries the tag
`154.0.8037.97`, so the tokens `154`, `8037` and `97` are always available:

```
S12: anchor "tag 154.0.8037.97, commit b510e9d7…", ranges [[8037,8037]], 8037-line fabricated old file,
     lines 101 and 5001 rewritten
-> exit 0, resolved, verdict holds
```

No row of the 23 is protected by this check. Related:
- S2: anchor `lines 7-12`, declared `[[12,12]]` → `holds`; the same fixture with the honest
  `[[7,12]]` → `exit 1 s1-drift-unsuperseded`. The declared ranges need not be the anchor's.
- S9: `"a\nb\nc\n".split("\n")` has 5 entries, so `[[5,5]]`/`[[4,4]]` can name the trailing empty
  line; `normLine("")` matches any new file that ends with a newline.
- S10: `entry.files` need not cover the paths the anchor/`source` name. Anchor names
  `command_line.cc` and `feature_list.cc`; entry lists only `command_line.cc`; the 156 bytes of
  `feature_list.cc` are wholly different → `exit 0`, holds.
- S3c: `f2-path-bound` passes on `basename` alone (l.207). The row's source names the real
  `content/public/common/content_switches.cc`; the entry verifies
  `attacker/elsewhere/content_switches.cc` with `[[596,596]]` while line 600 changed → `exit 0`,
  holds.

## Supersession is a prefix test, including on itself

```
S4:  row S041, teaches "supersedes S041 — this row now supersedes itself",
     source carries both 154 and 156 URLs, superseded_by "S041"
-> exit 0, drifted=1, resolved
```

`byId.get(row.id)` returns the row itself (l.249); the prefix test and the
`refs/tags/<stable>/` substring both pass because the source cell can carry two tags. No second
row, no bytes, no fetch. S5c adds a separate one-line superseder (S900) whose only content is a
156-tag URL to `this/path/does/not/exist.cc`, with no receipt entry and no bytes: S077's changed
line 2 (`drifted=1`) resolves, `exit 0`. This is the same shape the lane already relies on for
seven rows.

## Digest binding is weaker and format-fragile

- `f5-digest` (l.246) matches a row digest against **any** file's `old_sha256` in the entry
  (`oldShas` accumulates across files, l.216). S8 records the real `form_mcp_schema.cc` digest,
  commits fabricated `.cc` bytes, and puts the digest-named content under `form_mcp_schema.h` →
  `exit 0`, holds.
- `rowDigests` (l.146-152) requires a non-hex character before a 64-hex run. S074's anchor spells
  the digest `decoded sha25699b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b`
  (no separator), so **the recorded digest is silently dropped** and the row counts as digest-free.
  S16 proves the mechanism in both directions with one fixture: `sha256 <hex>` → `exit 1
  f5-digest`; `sha256<hex>` → `exit 0`, holds.
- In situ, 8 of the 23 population rows carry no digest the counter can see (S045, S062, S064,
  S071, S074, S080, S081, S106) — their 154 bytes are bound by nothing at all.

## 404 rows skip the range check entirely

`if (f.old_status === 404)` (l.222-225) precedes the range loop, so `ranges` are never validated
and never compared. S7 declares `old_status/new_status 404`, a two-line `NOT_FOUND` body, and
`ranges: [[100,200]]` that appear nowhere in the anchor and exceed the file length →
`exit 0`, holds. Any 404 row's "verification" is: the committed body contains `NOT_FOUND`.

## Negative result

Path traversal is blocked for the entry path: `f.path.includes("..")` rejects outside the byte
root (S11 → `exit 1 f2-path-bound ../../../../etc/hostname`). The byte paths are built from
`f.path` (l.209-210), so this is the effective guard. No exploit found there.

## Does the frozen predicate sentence still describe the code?

The sentence (`.ufo/waves/round-29/claims.json`, C3) says each row "is resolved **only by**:
committed 154 and 156 decoded bytes with matching sha256, ranges bound to the row's own anchor,
the row's registry digest matched where it records one, an independent re-fetch record from a
different seat agreeing with the 156 bytes, and, for a row whose anchored content changed, a
superseding registry row opening `supersedes <id> —` pinned at the 156 tag."

| clause | code reality | verdict |
|---|---|---|
| "committed 154 and 156 **decoded** bytes" | blob must exist under a directory named `154.…`/`156.…` and hash to the receipt's own sha; no provenance link to the tag | not implemented (S1) |
| "ranges **bound to the row's own anchor**" | token `a`/`a-b` occurs anywhere in the anchor cell; subranges, tag digits; skipped for 404 | not implemented (S2, S9, S12) |
| "the row's registry digest matched where it records one" | any file's old sha; `sha256<hex>` not recognized | partially, and lossy (S8, S16) |
| "an **independent** re-fetch record from a different seat" | a committed JSON authored by the same lane; seat/fetched_at are free strings, `fetched_at` unread | not implemented (S1, S14) |
| "for a row whose anchored content changed, a **superseding registry row** … pinned at the 156 tag" | prefix + substring test; the row may supersede itself; the superseder is otherwise unverified | implemented literally, admits degenerates (S4, S5c) |
| implicit "the 23 rows" | population is a count with no id allowlist; parser skips are silent | not enforced (S6c, S15) |

So the sentence describes the *shape* of the code but claims strength it does not have; under the
round's own rule ("a counter not run is a claim not verified") the C3 predicate is **not** verified
by this counter, and the `unresolved=0` number is not freshness evidence. The claim's junk
controls (`copiedOldAsNewJunk`, `noBytesJunk`) are true only against a non-adversarial fixture
author (S1 vs. `copied-old-as-new-caught-by-refetch`).

## Impacted axes

- **freshness** (the axis C3 claims): target reachable without re-verification; credit not earned.
- **calibration**: the claim's control receipts state the counter catches copied-old-as-new and
  missing-bytes attacks; S1/S14 show the catching depends on the attacker's refetch record being
  *inconsistent*, so the control overstates coverage.

## Smallest safe corrections (for the round owner; not applied by me)

1. **Population identity.** Refuse on any line matching `^ {0,3}\|\s*S\d{3,}\s*` that does not
   split into 13 cells (l.121) instead of skipping; require the population id multiset to equal a
   committed expected set, and reject duplicate ids.
2. **Range binding.** Parse the anchor's own `basename: a-b[, c-d]` expressions and require the
   declared ranges to be exactly that set for that path; restrict numeric tokens to those
   expressions (never the tag/commit digits).
3. **Path binding.** Use the exact path from the source cell; drop the `basename` fallback
   (l.207); require `entry.files` to cover every path the source/anchor names.
4. **Digest.** Recognize `sha256<hex>` (or refuse a 64-hex run that is not recognized); bind each
   digest to the file named next to it, not to any file in the entry.
5. **Supersession.** Reject `superseded_by === row.id`; verify the superseding row through the same
   receipt/bytes/refetch path (cycle-safe), so S109–S115 must carry their own 156 evidence.
6. **Independence is not implementable inside a committed-JSON design.** The smallest honest fix is
   either to have the counter do the read-only Gitiles GET itself and compare the bytes (network is
   already authorized for this round; the header's "never fetches" would change), or to narrow the
   predicate sentence to "a structurally consistent, self-attested refetch record" and move
   provenance to the round verifier. As written, the sentence's "independent" and "agreeing with
   the 156 bytes" are not what l.217-220 checks.

## Receipts in `.ufo/waves/round-29/w1/CritC3Gaming/`

`attacks.mjs` (S1-S11), `attacks2.mjs` (S3b/S5b/S12/S13), `attacks3.mjs` (S3c/S5c),
`attacks4.mjs` (S14/S15), `attacks5.mjs` (S16); `attacks*.out` raw JSON; `headsweep.json` (the
counter at lane HEAD: `population=23 unresolved=23`, every row failing `f6-refetch` — no refetch
directory is committed); `selftest-head.txt` (`cases=20 passed=20`, exit 0); `counter-sha.txt`.
