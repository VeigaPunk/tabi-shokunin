# W2Determinism — auditor read path, attacked by re-running

Pins: script `sha256 325006d29400b3dedd85c1a898582713a0181dee83a14ecd4ce8b7d5deb8e808`
(mtime 2026-10-25 04:33:14; rewritten during this wave — an 04:28 copy differs, see F5 note),
claims `sha256 423dd9145d7607b3cd3af92fb3c19a778a476460feffdbec280e8ec836314274` (has the
`revisions` block), evidence rev `a89f1935f523a64b00991d792fca6a8c0d321948`, round 22.
Fixtures: `.ufo/waves/round-23/scratch/W2Determinism/` (scratch clone + probe commits).

## Result of the frozen counting command

`node scripts/round-evidence-audit.mjs --rev a89f1935… --round 22 --round-cap 128 --json`
→ exit 1, six distinct classes (c1…c6), and byte-identical across two runs (`cmp` = equal);
same six at `be271a2d…`; CWD-independent from `/tmp`; `--selftest` → cases 12, passed 12,
inventoryOk true, exit 0. C1's *count* reproduces.

## Named attacks

| attack | command | exit | outcome |
|---|---|---|---|
| report is a directory | `--report …/reports/round-22` | 2 | refused (EISDIR caught) |
| report outside the reports dir | `--report /tmp/x.md` | 2 | refused, path-scoped guard |
| report absent | `--report …/round-22/absent.md` | 2 | refused |
| policy outside `scripts/hyaku` (byte-identical copy) | `--policy scratch/W2Determinism/policy-copy.json` | 2 | refused, path allowlist |
| sibling repo behind `--root` | `--root /home/vgpnk/Projects/shokunin` | 2 | refused: unsupported argument |
| `GIT_DIR`/`GIT_OBJECT_DIRECTORY`/`GIT_TRACE`/`GIT_CONFIG_COUNT` poisoning | `GIT_DIR=/nonexistent GIT_TRACE=/tmp/w2-trace.log node … --rev a89f…` | 1 | ignored (allowlist env); no trace file; output identical |
| replace ref (round-22 tree → empty tree) in a scratch clone, `git replace` | plain git lists 0 files; `node …/clone/scripts/round-evidence-audit.mjs --rev a89f…` | 1 | `GIT_NO_REPLACE_OBJECTS=1` holds: still 212 files, six classes, same lesson digest |
| directory-as-bytes at a **spec** path (commit `6c0010cb…` in the clone) | `node clone/scripts/… --rev 6c0010cb… --round 22 --round-cap 128 --json` | 1 | c2 **0** and c5 **0** — see F1 |
| missing blob (lesson object removed) | rm `.git/objects/5a/d907…`, rerun | 1 | `lessonSha256: null` + "lesson file absent" — see F3 |

## Findings

**F1 (high, fail-open).** A spec path that is a tree removes that wave from *both* cap and
registry classes, with no refusal and no diagnostic. `ls-tree -r --name-only` never lists a
directory, so `topFiles` (line 275) and `specFiles` lose the file; the 65-seat `w2b` wave
vanishes from `roundTotal` and from c5 (spec-driven since the 04:33 rewrite). Observed:
`--rev 6c0010cbbf05b6d0bdb3e385761bd73c052d3c7c` → classes c1,c3,c4,c6 only, exit 1
(otherwise-asserted classes silently drop; a round whose sole defect is that wave exits 0).

**F2 (high, silent clean).** c6 treats an unresolvable cited commit as nothing to check —
`if (touched === null) continue;` (line 468) — so `seen` stays empty and no finding is added.
Probe (`scratch/W2Determinism/c6-probe.mjs`, imports `audit`): a landed-changes table whose
three rows cite `deadbeef…` (40 hex), `1234567` (all-digit, filtered) and `feedface` returns
`{"clean":true,"classes":[],"c6":0}`, exit 0. The class is fail-open on typos and on rows
citing another repo's commits — exactly the "refuses rather than guessing" the claim asserts.

**F3 (medium).** `lessonSha256` is not a digest of the lesson bytes: it hashes the UTF-8
re-encoding of a lossy decode (line 1008). Non-UTF-8 lesson (commit `d2c128e2…`):
auditor `6ada2060…` vs real `git cat-file blob | sha256sum` `c1381c12…`. Collision: commits
`ad894062…` (`0xff`) and `c33f758f…` (`0xfe`) — distinct blobs `8713f089…`/`d7207d5d…` —
both report `ae02a290…`. The recorded sha therefore cannot bind the verdict to the bytes;
the blob-level sha1 check is intact, the *report* is not.

**F4 (medium).** A missing/corrupt object is diagnosed as absence, not refused: with the
lesson blob deleted the tool prints `lesson file absent at this revision`, `lessonSha256: null`,
exit 1. No distinction between "not committed" and "committed but unreadable"
(`objectType(oid) !== "blob"` at line 117 returns null for both).

**F5 (low, input trust).** The cap is taken on trust: missing → exit 2, but any positive value
is accepted and changes the class set. `--round-cap 400` with
`--policy …/ufo-wave-policy-v2.json` (band 128) drops c2 entirely → 5 classes, because the
band breach (65 > 64) is the only cap defect left; with the default authority the same cap
yields 6. The claim's "the round cap is declared by the round contract, never assumed" is
enforced only as *required*, not as *verified against the round's own declaration*.
(Also: the frozen command's 128 does match round-22's declared "≤128 two-wave cap".)

## Closed by the 04:33 rewrite (verified, not assumed)

`--report` path allowlist; environment allowlist (GIT_TRACE/CONFIG_COUNT dead); c5 now
spec-driven, so a registry replaced by a directory fires `registry-absent` (commit `4673a3ed…`,
c5 = 1) instead of silently clearing; c4 requires a grade id to join a committed receipt.

## Residual risk

- `git` is resolved through the inherited `PATH`; a substituted `git` still wins the exec.
- The script self-locates its root, so a copy committed in another worktree audits that
  worktree — recorded (`root`, `scriptSha256`) but not refused; `--root` itself is gone.
- A symlink inside `…/.ufo/reports/` satisfying the path prefix was not testable (fleet dir
  is read-only here); the guard compares the resolved path, not the file's identity.
- Tool installs: none this seat; no packages, no network.
