# ExecNoHarmGuard — landing no-harm gate (round 23, w1)

VERDICT: **not passable as landed.** Byte-prefix, evidence immutability and write-freedom hold;
C1's six-class metric is not derivable from lane bytes (c6 reads the fleet repo), `--root` fails
open from a subdirectory, and the round-21 control trips c3. All below is read-only at
`a89f1935f523a64b00991d792fca6a8c0d321948` (auditor snapshot sha256 `fd23c9ca5f9c…a07c9`, 565 lines).

## Gate to run at landing (paste-ready)

```
B=a89f1935f523a64b00991d792fca6a8c0d321948; cd /home/vgpnk/Projects/shokunin/tabi-shokunin
# N1 append-only prefix: silent = pass
for f in LOG.md SCORECARD.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md SKILL.md; do
  git show $B:$f | cmp -n "$(git cat-file -s $B:$f)" - "$f" || echo "N1 FAIL $f"; done
# N2 round-21/22 evidence untouched: both silent
git diff --exit-code $B -- .ufo/waves/round-21 .ufo/waves/round-22
git status --porcelain -uall -- .ufo/waves/round-21 .ufo/waves/round-22
# N3 scope: only whitelisted untracked, only whitelisted tracked edits
git status --porcelain -uall | awk '$1=="??"{print $2}' | grep -vE '^(\.ufo/waves/round-23/|corpus/evidence/round-23/|corpus/knowledge/|scripts/round-evidence-audit\.mjs$)'
git status --porcelain -uall | awk '$1!="??"{print $2}'
# N4 auditor writes nothing outside stdout/stderr
bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --chdir "$PWD" node scripts/round-evidence-audit.mjs --rev $B --round 22 --json > /tmp/ro.json; echo exit=$?
strace -f -qq -e trace=openat,creat,unlink,unlinkat,rename,renameat,mkdir,mkdirat,truncate,ftruncate -o /tmp/a.strace node scripts/round-evidence-audit.mjs --rev $B --round 22 --json >/dev/null
grep -E 'O_WRONLY|O_RDWR|O_CREAT|O_TRUNC' /tmp/a.strace | grep -vE '/dev/(null|pts|tty)|pipe:|anon_inode'   # must be empty
grep -cE '\b(unlink|unlinkat|rename|renameat2?|mkdir|mkdirat|creat|truncate|ftruncate)\(' /tmp/a.strace          # must be 0
grep -c '/home/vgpnk/Projects/shokunin/\.ufo' /tmp/a.strace                                                     # must be 0 after F1
# N5 contract
node scripts/round-evidence-audit.mjs --selftest | grep -E '"(cases|passed)"'    # 12 / 12, exit 0
node scripts/round-evidence-audit.mjs --rev $B --round 22 --json; echo exit=$?   # 6 classes, exit 1
node scripts/round-evidence-audit.mjs --rev $B --round 21 --json; echo exit=$?   # F3: exit 1, c3 only
node scripts/round-evidence-audit.mjs --rev $B --round 99; echo exit=$?          # 2
node scripts/round-evidence-audit.mjs --rev deadbeef --round 22; echo exit=$?    # 2
```

Violation text, observed in my scratch red mutants (`.ufo/waves/round-23/scratch/ExecNoHarmGuard/`):
N1 truncation `cmp: EOF on …/prefix-short.bin after byte 999`; N1 mutation
`- …/prefix-flip.bin differ: char 501, line 9`; N2 `diff --git a/.ufo/waves/round-22/…` + `+|` hunk
or ` M .ufo/…`; N3 the offending path on its own line; N4 an
`openat(AT_FDCWD, "scratch-cache.json", O_WRONLY|O_CREAT|O_TRUNC…)` line or a nonzero unlink/mkdir count.
Green controls (observed): clean stand-in under strace → no write-class line, no mutate syscall, exit 0;
under `bwrap --ro-bind / /` the red stand-in dies `EROFS … open 'scratch-cache.json'`, the clean one prints.

## Findings (observed at this tip; command → result)

1. N1 passes: `for f in …; git show $B:$f | cmp -n "$(git cat-file -s $B:$f)" - "$f"` → silent for all six (prefix sizes 125375 / 88656 / 26151 / 52500 / 84565 / 221365).
2. N2 passes: `git diff --exit-code $B -- .ufo/waves/round-21 .ufo/waves/round-22` → exit 0, no output; `git status --porcelain -uall -- …` → empty (263 + 212 committed paths).
3. N4 passes: `grep -cE '\b(unlink|…|ftruncate)\(' /tmp/a.strace` → 0; write-class scan → empty; `cmp /tmp/r22.json /tmp/r22-ro.json` → identical, bwrap exit 1 (= findings, not failure).
4. F1 (critical) C1 is not lane-derivable: `node scripts/round-evidence-audit.mjs --rev $B --round 22 --report corpus/lessons/round-22.md --json` → 5 classes, 5 findings; default run → 6 classes, 7 findings. Root cause `scripts/round-evidence-audit.mjs:502` defaults `--report` to `/home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/tabi.md` (fleet repo); `grep -c '/home/vgpnk/Projects/shokunin/\.ufo' /tmp/a.strace` → 1, `openat(… "/home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md", O_RDONLY)`. The lane holds no such file (`ls .ufo/reports/round-22/` → absent). c6 therefore rests on bytes outside `--rev` and outside the lane.
5. F2 (fail-open) `--root` from a subdirectory fabricates evidence: `node … --rev $B --round 22 --root .ufo/waves/round-23/scratch/ExecNoHarmGuard/empty --report corpus/lessons/round-22.md --json` → exit 1 with c1 `cited 23, derived 0, evidence []` (a false "0 receipts" finding) and c2/c5 silently absent. Cause: `ctx.list` passes a cwd-relative pathspec — `git -C <subdir> ls-tree -r --name-only $B -- .ufo/waves/round-22 | wc -l` → 0, from lane root → 212, `':(top).ufo/waves/round-22'` → 212; `git -C <subdir> show $B:corpus/lessons/round-22.md` still works (154 lines), so only listings break. Fix: anchor listings `:(top,literal)<prefix>` and refuse (2) on an empty wave listing.
6. F3 control deviation: `node … --rev $B --round 21 --json` → exit 1, 1 finding, class `c3-gate-spotcheck`, evidence `corpus/lessons/round-21.md`. It is a true positive: `sed -n '/^## Gate/,/^## /p' corpus/lessons/round-21.md | grep -ci spot` → 0. So round-21 is not a 0-control for c3; claims.json's "must not yield the round-22 classes at all" is unmet as written — an appended correction naming the c3 positive is required, not a narrowed c3.
7. F4 clean-fixture control is unexercisable under the frozen API: `.ufo/waves/round-23/fixtures/` is empty, and `--root` cannot re-root git paths (F2), so no flag addresses uncommitted clean bytes; `--round 99` merely refuses (exit 2). Either add an additive `--tree DIR` filesystem reader or count only `--selftest` green cases as the clean control.
8. Detection quality is grounded where lane bytes exist: c1 `cited 23 / derived 24` matches routed defect 1 (13 + 11 receipts); c2 `derived 129`; c5 `cited "65 spawned / 65 members" / derived "65 without agentId"`; c6 commits verified `git show --name-only --format="" 47bfb5f | grep -c '^LOG.md$'` → 0 and same for `be271a2` → 0.
9. Contract exits hold: `--round 99` → 2 (`cannot read the round report at …; …a clean verdict would be a false green`), `--rev deadbeef` → 2, no-args → 2, empty `--root` → 2.
10. N3 residual: `git status --porcelain -uall | awk '$1=="??"{print $2}' | grep -vE '^(\.ufo/waves/round-23/|corpus/evidence/round-23/|corpus/knowledge/|scripts/round-evidence-audit\.mjs$)'` → currently `corpus/evidence/round-23/c1-measurements.json`, `corpus/knowledge/csrf-defense-shape-boundary.md`, `scripts/round-evidence-audit.mjs`; all three are in-round deliverables (precedent `corpus/evidence/round-21|22`), so the lander must whitelist them or its sweep misreports.
11. Selftest sensitivity unverified: `--selftest` → `"cases": 12, "passed": 12`, exit 0, but nothing here flips an operator; require exit 3 after each single-operator mutation (peer `MutClassFalsifiers` owns it) before C1 is counted.
12. Disclosure: my red-mutant strace run created `scratch-cache.json` at the lane root; removed with `rm -f` and re-swept (absent). No tracked file, fleet path, sibling lane or shokuknow tree was written; no tool installs were needed.
