# W2Determinism — auditor read path, attacked by re-running

Pins: script `sha256 e88a078e2a6cc52415343d2acce8fc14ba271e94d36952f56829838ac966be62`
(mtime 04:34:49; it was rewritten twice mid-wave — 325006d2 at 04:33, 6eeaeda7 at 04:28 —
and every result below was re-run on this final revision), claims
`sha256 423dd9145d7607b3…` (carries the `revisions` block), evidence rev `a89f1935…`.
Fixtures: `.ufo/waves/round-23/scratch/W2Determinism/` (scratch clone, probe commits).

## Frozen counting command

`node scripts/round-evidence-audit.mjs --rev a89f1935… --round 22 --round-cap 128 --json`
→ exit 1, six distinct classes (c1–c6); two runs byte-identical (`cmp`); same six at
`be271a2d…`; identical from CWD `/tmp`; `--selftest` → cases 12, passed 12, inventoryOk true,
exit 0. The count reproduces; the read path below does not.

## Named attacks

| attack | command | exit | outcome |
|---|---|---|---|
| report is a directory | `--report …/.ufo/reports/round-22` | 2 | refused (EISDIR caught) |
| report outside reports dir | `--report /tmp/x.md` | 2 | refused by path guard |
| report absent | `--report …/round-22/absent.md` | 2 | refused |
| policy outside `scripts/hyaku` (byte-identical copy) | `--policy scratch/W2Determinism/policy-copy.json` | 2 | refused by allowlist |
| sibling repo behind `--root` | `--root /home/vgpnk/Projects/shokunin` | 2 | refused: unsupported argument |
| `GIT_DIR`/`GIT_OBJECT_DIRECTORY`/`GIT_TRACE`/`GIT_CONFIG_COUNT` poisoning | `GIT_DIR=/nonexistent GIT_TRACE=/tmp/w2-trace.log node …` | 1 | ignored (allowlist env); no trace file; output identical |
| replace ref, round-22 tree → empty tree, in a scratch clone | `git replace 983b0993… 4b825dc6…`; plain git lists 0 files; `node clone/scripts/… --rev a89f1935…` | 1 | `GIT_NO_REPLACE_OBJECTS=1` holds: 212 files, six classes, same lesson digest |
| directory-as-bytes at a **spec** path (probe commit `6c0010cb…`) | `node clone/scripts/… --rev 6c0010cb… --round 22 --round-cap 128 --json` | 1 | c2 **0**, c5 **0** — F1 |
| missing blob (lesson object removed from clone) | `rm .git/objects/5a/d907…`; rerun | 1 | `lessonSha256: null`, "lesson file absent" — F4 |

## Findings

**F1 (high, fail-open).** A spec path that is a tree hides its wave from *both* cap and
registry classes: `ls-tree -r --name-only` never lists a directory, so `topFiles`/`specFiles`
(line 282) lose it, and c5 is spec-driven. At `6c0010cb…` the 65-seat `w2b` wave disappears
from `roundTotal` and from c5: classes c1,c3,c4,c6 only; no refusal, no diagnostic. A round
whose only defect is that wave exits 0.

**F2 (high, silent clean).** c6 skips what it cannot resolve — `if (touched === null) continue;`
(line 475). Probe `scratch/W2Determinism/c6-probe.mjs` (imports `audit`, three landed rows
citing `deadbeef…`, `1234567`, `feedface`): `{"clean":true,"classes":[],"c6":0}`, exit 0.
A typo'd or foreign commit hash is reported as clean, not refused.

**F3 (medium).** `lessonSha256` (line 1015) hashes a lossy UTF-8 re-encode, not the bytes.
Non-UTF-8 lesson `d2c128e2…`: reported `6ada2060…`, real `c1381c12…`. Collision: `ad894062…`
(`0xff`) and `c33f758f…` (`0xfe`) — distinct blobs `8713f089…`/`d7207d5d…` — both report
`ae02a290…`. The blob sha1 check is intact; the *recorded digest* cannot bind verdict to bytes.

**F4 (medium).** A missing/corrupt object is diagnosed as absence, never refused: lesson blob
deleted → `lesson file absent at this revision`, `lessonSha256: null`, exit 1. `read()` returns
null for "not committed", "tree at path" and "object unreadable" alike (lines 117, 282).

**F5 (low, input trust).** The cap is required but never verified against the round's own
declaration: `--round-cap 400 --policy …/ufo-wave-policy-v2.json` (band 128) drops c2 → 5
classes, since the only remaining cap defect (65 > 64) sits under the wider authority. The
frozen 128 does match round-22's declared "≤128 two-wave cap", so the target holds here.

## Closed by the mid-wave rewrites (verified)

`--report` path allowlist; environment allowlist (GIT_TRACE/GIT_CONFIG_COUNT dead); c5 now
spec-driven, so a registry replaced by a directory fires `registry-absent` (probe `4673a3ed…`,
c5 = 1) instead of silently clearing; c4 requires a grade id joined to a committed receipt.

## Residual risk

- `git` comes from the inherited `PATH`; a substituted binary still wins the exec.
- The script self-locates its root: a copy committed in another worktree audits that worktree —
  recorded (`root`, `scriptSha256`) but not refused; `--root` itself is refused.
- A symlink *inside* `…/.ufo/reports/` satisfying the prefix was untestable (fleet dir is
  read-only here); the guard compares the resolved path, not file identity.
- Snapshot only: the script changed twice during wave 2 (three shas above). Tool installs: none.
