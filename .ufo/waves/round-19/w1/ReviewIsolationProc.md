# ReviewIsolationProc — round 19 writer-isolation probe

## Verdict

The §Writer isolation clone-and-switch recipe succeeds on this lane at baseline `66251bfc1aef393e4aec599e950a8deb867736bb`. The resulting branch is based exactly on B, and a committed binary probe extracted with `git show <commit>:<path>` compared byte-for-byte equal with `cmp`. No blocking defect found in the tested sequence.

## Observed behavior

- Before cloning, lane `HEAD` was detached at B, `refs/heads/master` also pointed to B, and `git status --porcelain=v1` showed `?? .ufo/waves/round-19/`.
- `git clone --no-hardlinks --quiet /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/tabi-r19/ReviewIsolationProc` succeeded. The clone's initial `HEAD` was attached to `refs/heads/master`; `refs/remotes/origin/HEAD` pointed to `refs/remotes/origin/master`. It did not preserve the lane's detached-HEAD state.
- `git -C /fast/scratch/tabi-r19/ReviewIsolationProc switch --quiet -c r19/ReviewIsolationProc 66251bfc1aef393e4aec599e950a8deb867736bb` succeeded. It created `refs/heads/r19/ReviewIsolationProc` at B and left the clone clean.
- Source had 55 `refs/jj/*` refs. `git ls-remote --refs` advertised them, but the clone had zero `refs/jj/*` refs. All 55 corresponding object IDs were nevertheless readable with `git cat-file -e` in this local clone; source and clone each reported 1,423 loose objects, 3,223 in-pack objects, and four packs. Thus the jj ref names are not carried over, even though their target objects were available in this observation. Do not depend on `refs/jj/*` names in the worker clone; the explicit B hash resolved and the branch was created successfully.
- The four source and clone packfiles had distinct device/inode pairs and link count 1. The clone and source were on different devices, so this confirms no shared hardlinks in the observed result, but does not independently isolate the option's effect from the filesystem boundary.
- The source's untracked `.ufo/waves/round-19/` directory was not cloned: `PLAN.md` was absent from the clone and `git ls-tree` showed no such directory at B. The plan must be read from the lane/context before working in the clone; ordinary clone does not bring along untracked wave control files or reports.

## Git-show byte comparison

In the isolated clone, I committed a test-only 22-byte binary file (`review-isolation-probe.bin`, containing NUL, `0xff`, and CRLF bytes) as `0c622a78b917dc708d0fd13c96d1595af9a796c1`. I extracted it with `git -C /fast/scratch/tabi-r19/ReviewIsolationProc show 0c622a78b917dc708d0fd13c96d1595af9a796c1:review-isolation-probe.bin > /fast/scratch/tabi-r19/ReviewIsolationProc.imported.bin`. `cmp` exited 0; both files were 22 bytes and had SHA-256 `696a13a7cab54a58d65dbe3fb720aa0d81bbb8f2c1e87bfdc735335c3e2cf186`. This validates exact blob extraction for the tested commit/path. The probe was synthetic, not a production artifact.

## Residual risk and verification gaps

- The run tested the actual lane state where both detached `HEAD` and `master` equal B. It did not test a lane where the advertised default branch diverges from B or where B is unavailable in the cloned object database. The explicit hash in `switch -c` avoids inheriting the clone's initial branch position when B is present. [INFERENCE]
- The `git show`/`cmp` check used a synthetic committed binary probe, not one of the wave's eventual production files. No build, lint, or test suite was run; none was needed for this isolation probe.
- No tools were installed or updated.

## Isolation

- Clone: `/fast/scratch/tabi-r19/ReviewIsolationProc`
- Branch: `r19/ReviewIsolationProc`
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`
- Commit: `0c622a78b917dc708d0fd13c96d1595af9a796c1`
- Changed paths: `review-isolation-probe.bin` (synthetic isolation test only)
