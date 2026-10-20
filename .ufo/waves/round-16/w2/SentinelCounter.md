# SentinelCounter — round-16 wave 2 (FALSIFY)

Author-side sentinel report. It is not a non-author certification.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3`, `.ufo/waves/round-16/measure.mjs` (blob sha256 `bda4e18eecbaae5463240889fa5b71574cb50f31287f2f3617ba325ff70b88f9`, the same in the lane worktree and in my /tmp clone).
Node v24.21.0, bubblewrap 0.13.1 (already installed at `/usr/bin/bwrap`). I installed nothing. I wrote nothing in the lane except this file.
Probe dir: `/tmp/sentinelcounter-8hkne02h/clone`, made with `git clone --no-local` from the lane. All hostile commits exist only in that clone.

## Item SC-1 — what a hostile REV can make `--claim C1` execute

**Verdict: BREAKS.** The counter runs code chosen by REV with no bounds, and it gives the caller's write access to the measured repo.
**Severity: Medium** for a lane-local counter. It would be High if a non-author verifier ran it on a revision they had not read.

### Exploit path
`countC1` (lines 116–177) copies two blobs from REV into `mkdtemp` and runs them with `process.execPath`:
- `scripts/selftest-measurement-binding.mjs`, with timeout 600 s;
- `scripts/check-measurement-binding.mjs --legacy … --repo ROOT`, with timeout 120 s.

Both run:
- as the invoking uid;
- with the real `HOME` and `PATH` (from `ENV`, lines 77–87);
- with network access;
- with no filesystem confinement;
- with the absolute path of the real repo passed in argv (`--repo ROOT`, line 160).

The `ENV` hardening only covers the counter's *own* git calls. It does nothing to contain the blobs. So whoever writes REV can run arbitrary code on whoever runs the counter. The counter is a verifier tool, so the person running it is usually not the author.

### Evidence (hostile REV `a4aba7f71af2b1b1bdb69659f2c2061d420be74c`, 19+12-line gate/selftest; unmodified b444ca8 counter)
Command (cwd = clone):
```
node .ufo/waves/round-16/measure.mjs a4aba7f71af2b1b1bdb69659f2c2061d420be74c --claim C1
```
Observed:
- stdout: `"c1_binding_contracts":1,…"failures":[]`, exit 0. The payload also forges the count.
- The selftest marker shows `uid:1000`, cwd `/tmp/tabi-r16-measure-c1-ybJgD8`, and env keys `PATH,HOME,TZ,LC_ALL,GIT_CONFIG_*…`.
- The gate marker shows `"repo":"/tmp/sentinelcounter-8hkne02h/clone"` and `"homeEntries":111`, so the real `$HOME` was listable.
- The gate wrote `.git/HOSTILE_GATE_WROTE_HERE` into the `--repo` root: `-rw-r--r-- 1 vgpnk vgpnk 32 … .git/HOSTILE_GATE_WROTE_HERE`.
  - In a lane run, `--repo` is the lane itself. The same primitive could write `.git/hooks/*` and get code execution at the next lane commit `[INFERENCE — not attempted]`.
- A detached orphan outlives the counter: `marker-orphan` was absent right after exit and read `survived` 5 s later. spawnSync's timeout only signals the direct child.
- Cleanup evasion: the gate renamed its temp dir and left a symlink in its place. `rmSync` removed the link, not the target, so the victim dir `keep.txt` survived (no traversal; **HOLDS**). But `/tmp/tabi-r16-measure-c1-ybJgD8.moved` was left behind (I removed it afterwards).

### Surfaces that HOLD (run or read)
- **REV argv injection** — run:
  - `measure.mjs --output=/tmp/x --claim C1` gives `detail=revision token`, exit 2;
  - `'HEAD --output=/tmp/x'` gives `unresolved revision`, exit 2;
  - `'b444ca8:scripts'` gives `unresolved revision`, exit 2.
  - Reason: the `-` prefix is rejected, plus `--end-of-options` and `^{commit}`.
- **Blob type** — code read, not run. `blob()` refuses non-`100644/100755` entries (line 108), so a symlink gate/selftest is treated as absent. Paths written into the temp dir are constants, so REV cannot write elsewhere through a crafted name.
- **Temp cleanup** does not follow a swapped symlink (shown above).

### Is unbounded execution acceptable for a lane-local counter?
No, as it stands:
1. Running the blobs is inherent to a behavioural C1, but nothing makes this run safe: no sandbox, real HOME, network, a writable measured repo, and orphans survive.
2. It does not even buy integrity. A **5+5-line print-only** REV (`037f8020c9a1bfab8fdcff2181d5d51ac0f84cab`) counts 1 on the unmodified counter:
   ```
   node .ufo/waves/round-16/measure.mjs 037f8020c9a1bfab8fdcff2181d5d51ac0f84cab --claim C1
   → "c1_binding_contracts":1, selftest cases=27 bad=0 clean=1 missingVocab=[], legacy exit 1 with the exact LEGACY_EXPECTED sets
   ```
   This matches TabiR16.AttackC1Liar V1. The header's claim "receipts are not trusted" is false in effect: the selftest's own stdout is the receipt.

### Recommended bounds (smallest first)
**B1 — confinement (tested).** Wrap both spawns in `bwrap` with:
```
--unshare-all --die-with-parent --new-session --ro-bind / / --dev /dev --proc /proc
--tmpfs /tmp --tmpfs $HOME --ro-bind <node prefix> --ro-bind ROOT ROOT --bind dir dir --setenv HOME dir
```
I tested this as an 11-line patch to a /tmp copy of the counter (worktree-only change in the clone):
- Honest `b444ca8` still gives `c1_binding_contracts:1`, `cases=43 bad=0 clean=21 missingVocab=[]`, legacy exit 1 with the exact sets. B1 does not cost operability.
- The hostile `a4aba7f` side effects were contained: no markers on the host, no `.git/HOSTILE_GATE_WROTE_HERE` (read-only `ROOT`), and no temp-dir leftovers.
- PID-namespace reaping, tested on its own:
  ```
  bwrap … --unshare-pid --die-with-parent sh -c "(sleep 2; echo leaked > $P/orph-boxed) & exit 0"
  ```
  left no `orph-boxed`, while the same command without bwrap produced `orph-unboxed`.
- If bwrap is unavailable, the minimum is:
  - `HOME=dir`;
  - a throwaway `git clone --no-local ROOT` as `--repo`, not the live lane;
  - spawn with `detached:true` and `process.kill(-pid)` in `finally`;
  - `lstat` the temp dir before cleanup.

**B2 — integrity (required for C1 to mean anything; B1 does not fix it).** With B1 in place, the print-only forge `037f802` still counts **1**. Two parts:
1. **Digest pin.** Count only when `gateSha256`/`selftestSha256` equal digests pinned *in the counter* (`5150611c…`/`8c5426f2…`, which match `corpus/evidence/round-16/binding/*.json`). For the named snapshot the counter then records the reviewed bytes and cannot be swapped silently. Pins inside REV are not enough, because REV controls them.
2. **Counter-owned oracle.** Have the counter itself build a few temp repos it controls and run the gate CLI against them. Include at least one case derived from REV that the gate cannot predict, e.g. mutate one digest field in the real r15 manifest and expect the finding set to change. This way the gate is checked against inputs a lookup table cannot hard-code.

## Commands not run / limits
- I did not write a real `.git/hooks` payload or exfiltrate anything. Impact past the marker writes is `[INFERENCE]`.
- I tested the bwrap patch only in the /tmp clone. The lane counter is unchanged.
- `/tmp/tabi-r16-measure-c1-utLdye`, seen once during the run, is not attributable to me (gone at the next `stat`). Probably a concurrent peer run `[INFERENCE]`.
