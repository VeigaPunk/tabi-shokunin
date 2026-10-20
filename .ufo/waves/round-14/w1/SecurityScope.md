# SecurityScope — round-14 w1 (sentinel, read-only)

Scope: the two gate counters in `scripts/check-round-contract.mjs` (round) and
`scripts/check-user-round-contract.mjs` (user). Read-only review. Nothing was
executed except read-only host inspection (`.git/config`, global git config,
`git for-each-ref refs/replace`, `git config --get-regexp`, `git ls-tree | wc -c`,
`sha256sum`, PATH). I ran no exploit, gate, self-test, or witness. I installed
no tools.

Both scripts were being edited by RoundCounter and UserCounter during this
review. Line numbers refer to these working-tree snapshots: round
`#8A91`, sha256 `af9eea1a…` at first read, and user `#B9BE`. They are not HEAD.
HEAD blobs: round `43db9f4b`, user `7df3ee9f`.

## Axes
A1: no lane-authored text reaches a shell. A2: every exec surface outside
runCount is named and has an owner. A3: historical counts and red findings
still hold. A4: the residual claim is honest and does not overreach (lane
operability hygiene, not generic sandboxing; this agrees with PolicyBoundaries).

## C1 status (A1)
- Legacy exploit path (HEAD, both gates). `runCount` = `spawnSync('bash', ['-c', command])`.
  The prefilter (`startsWith('git ')` and a deny-list for `;&\`<>\n\\$( ${`) allowed
  `|`, `||` and `(`. A committed SCORECARD row such as
  `git ls-tree … | grep x | wc -l | xargs …` therefore ran arbitrary code as
  whoever ran the gate. Git's own flags can also execute or write while passing
  a "git-only" deny-list (`git grep -O<cmd>`, `git -c core.fsmonitor=…`,
  `--output=`). Only a closed grammar fixes this; a deny-list does not.
- Working tree now: both gates validate commands against a closed grammar and
  call `git` with an argv array. No shell is involved.
  - Round: `countStages` (L309-345) → `treeLineCount` / `grepLineCount` / `runCount` (L385-445).
    The revision must be 40 hex. Patterns may not start with `-` and go through
    `-e`. Paths exclude `:`, `*`, `?` and `[`, so no pathspec magic or globs.
    The BRE subset is `.`, a non-leading `*`, `^` only at the start and `$` only
    at the end. Anything else fails closed.
  - User: `TREE_COUNT`/`GREP_COUNT` regexes (L~311-312) → `countingCommand`
    (L338) → `runCount` (L371). Allows at most two greps, uses
    `--literal-pathspecs`, and has a `GREP_PATTERN` allowlist.
  - All 16 production rows (SCORECARD L242-377) match the
    `ls-tree | grep [| grep] | wc -l` shape. Two greps is the maximum (r02).
- The old prefilter is still in round `parseScore` L289. It is now redundant;
  the grammar is the actual guard. It does no harm.

## Exec paths still present outside runCount (A2)

| # | Sev | Surface | Exploit path | Evidence | Smallest remediation |
|---|-----|---------|--------------|----------|----------------------|
| E1 | **Medium** | Witness arms: round `witness` L889-898, `countWitness` L927-946; user `witness` L703-723 | The pin is `git rev-parse rev:path` == pinned blob id. The bytes come from a separate `git show rev:path`. `git replace <pinned-blob> <evil-blob>` leaves the tree id unchanged, so the pin passes, and `show` returns the substituted bytes. Those bytes are written to `/var/tmp/.../old-gate.mjs` and run with `process.execPath`, so arbitrary JS runs as the verifier. On this host every seat and L1 share one `.git`, and replace refs never appear in `git diff`, review, or the commit. | Code as cited. `git for-each-ref refs/replace` returned 0 (observed), so it is not exploited now. | Before `writeFileSync`, check in Node: `createHash('sha1').update(\`blob ${b.length}\0\`).update(b).digest('hex') === PINNED`. Also pass `GIT_NO_REPLACE_OBJECTS=1` in the `git()` env. |
| E2 | Low-Med | Count and evidence integrity, all `git()` reads plus both new runCounts | The same replace-ref mechanism can make `ls-tree <measured>` or `show HEAD:…` report a forged tree. Counts and pins then match while the commit hashes stay the same. This is an integrity problem, not exec. The legacy shell path had the same exposure. | Round `git()` L54-57; user `git()` L83-85, runCount spawn L~377. | Use the `GIT_NO_REPLACE_OBJECTS=1` env (or a leading `--no-replace-objects`) in both `git()` helpers and the user runCount spawn. |
| E3 | Low-Med [INFERENCE] | User `lessonDrift` `git log -m … --format=%H` L214 | If the repo-local `.git/config` (lane-writable) or `GIT_CONFIG_COUNT` env sets `log.showSignature=true` together with `gpg.program=<cmd>`, git runs that program for every signed commit in `PSTACK_PIN..HEAD`. I did not check whether `--format=%H` suppresses signature display; I inferred this from git's log-tree behavior. | `git config --get-regexp '^(log\.showsignature|gpg)'` returned rc=1 (unset, observed). | Add `--no-show-signature` to that argv. |
| E4 | Low (residual, environment trust) | `spawnSync('git'…)` resolved through PATH: both `git()` helpers, user runCount, fixture `commit()` | PATH lists user-writable directories before `/usr/bin`: `~/.local/bin`, `~/.opencode/bin`, `~/.grok/bin`, fnm/mise shims (observed). The operator tooling directive installs into `~/.local/bin`. A same-uid shadow `git` would run in place of the real one. | `command -v git` → `/usr/bin/git` (observed, git 2.55.0). | Out of the gate's power: a same-uid attacker can already edit the scripts. State this as residual. Do not add an absolute path, which would hurt portability for no gain. |
| E5 | Low (residual) | Inherited `GIT_*` env in every git spawn | `GIT_DIR`/`GIT_WORK_TREE` redirect which repo is read while `isProduction`/`sameRoot` check `--repo`. `GIT_CONFIG_PARAMETERS`/`GIT_CONFIG_COUNT` inject config (E3 keys). `GIT_ALTERNATE_OBJECT_DIRECTORIES`/`GIT_NAMESPACE`/`GIT_REPLACE_REF_BASE` change object and ref resolution. | Current env has only `GIT_EDITOR=true`, `GIT_PAGER=cat`, `GIT_TERMINAL_PROMPT=0` (observed, harmless). | Optional: build the git env as `process.env` minus `GIT_*`, plus `GIT_NO_REPLACE_OBJECTS=1`. |
| E6 | Low | Repository identity vs path identity: round `isProduction` L46-52, user `sameRoot` L~64 | Production is detected by `realpath(--repo)`. A directory containing a `.git` gitfile that points at the production gitdir, a linked worktree, or `GIT_DIR` evaluates the production objects. Because the path is not "production", fixture-only overrides are accepted (`--census-sha256`, `--pstack-pin`, free baseline/expect), and the gate prints `verdict=clean` without naming the repo. A subdirectory alias fails closed: `list()` pathspecs are cwd-relative, so `roundIds` is empty and `round_count` fails [INFERENCE from code]. | Code as cited. | Also compare the realpath of `git rev-parse --path-format=absolute --git-common-dir` with production's, and require realpath of `--show-toplevel` === realpath of `--repo`. |
| E7 | Info (by design) | Witness legacy arms still run `bash -c` | The pinned legacy gate bytes run their own runCount on a fixture command written by the gate, inside a `/var/tmp` scratch repo. The round `countWitness` deliberately runs `… \| tee .round14-count-marker \| wc -l` (round L941) to prove the old gate executed a stage. This is not lane-authored text. Its only exposure is through E1. | Round L923-972. | None beyond E1. |
| E8 | Info | Fixture git: `init`/`add`/`commit` (round L~452/582, user L~517/605) | Fixture repos pick up global and system hooks (`core.hooksPath`, `init.templateDir`), `commit.gpgSign`/`gpg.program`, and filters via `core.attributesFile`. This only matters for self-test and witness runs. Global config now has none of these. `filter.lfs` is defined but only applies through attributes, and the fixtures write none [INFERENCE]. | Global config read (observed). `git config --get-regexp` hooks/template/gpgsign/attributesfile rc=1. | Optional: `-c core.hooksPath=/dev/null -c commit.gpgSign=false` in `commit()`. |
| E9 | Info (residual trust) | User `checkSpec` → `VALIDATOR` L411 (`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`) | Runs external code that is not digest-pinned and reads `UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` env. Lane spec JSON arrives as one argv value with no shell. In `plan` mode there is no `--route-probe` (that is argv-only, not spec-driven) and no registry persist, so lane data cannot cause execution. | Validator L109-126, L1764-1816. | Residual: trust in the ufo-fsd-alpha checkout. Optional: pin its sha256. |

Self-test and witness re-spawns of `script` use the absolute `process.execPath`
on the gate's own bytes. They need no action.

## Count-semantics deltas the counters introduce (A3; no exec)
- D1. Git failure handling differs between the gates. Legacy `| wc -l` masked a
  git failure as `0`. The round gate now fails closed (`score_mismatch`, L399,
  L416). The user gate keeps the masking (comment L~309-310, runCount ignores
  status). Production rows cannot hit this, because the baseline is
  ancestor-checked and measured commits exist. Crafted rows recorded as `0`
  behave differently in each gate. Pick one rule for both; fail-closed keeps
  the red findings intact.
- D2. Decoding differs. The round gate decodes `utf8` (through `git()`); the
  user gate decodes `latin1`. JS `.` therefore matches a different unit on
  non-ASCII paths. Today `ls-tree -r --name-only HEAD` has 0 non-printable-ASCII
  lines (observed), and `core.quotePath` is default, so counts are unaffected.
- D3. Buffer limits differ. Round `git()` has no `maxBuffer` (default 1 MiB) and
  no timeout. Today's listing is 165,414 B (observed). Past 1 MiB, `ENOBUFS`
  causes a false `score_mismatch`. The user gate uses 16 MiB plus a 30 s timeout.
- D4. The user pin chain has `ROUND_SCRIPT_CURRENT_SHA256 = 'ROUND14_CUTOVER_DIGEST_PENDING'`
  (L28). Until it is filled, `acceptedRoundScript` L193 makes the production
  user gate exit 2 with `could_not_evaluate`. Fill it with the final round-gate
  sha256 after the round gate's last edit.
- D5. An earlier snapshot of the user gate (`#23C4`) had duplicate
  `parseScore`/`runCount` declarations, one using `spec.regex`, which would be
  an ESM SyntaxError. The later snapshot `#B9BE` has one of each. L1 should
  confirm with `node --check`.

## Honest residual safety scope (A4)
After C1 lands, the claim is narrow. Neither production gate passes SCORECARD
text to a shell. Each row must match a closed two-shape grammar and only
reaches `git` as validated argv.

This does **not** cover:
- a same-uid attacker (PATH, script edits);
- tampering with repo-local `.git` (replace refs E1/E2, config E3);
- the invoking environment (`GIT_*` E5);
- repository-identity aliasing (E6);
- the external validator (E9);
- hooks and filters picked up by fixture git (E8);
- the deliberate shell run in witness legacy arms (E7).

This is lane operability hygiene, not generic security sandboxing. E1 is the
only item where reviewed bytes can be swapped for executed code without a
visible commit. It is the one fix I recommend for this round.

## Commands for L1 (not run by me)
```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node --check scripts/check-round-contract.mjs && node --check scripts/check-user-round-contract.mjs
rg -n "spawnSync\('bash'|shell:\s*true" scripts/check-round-contract.mjs scripts/check-user-round-contract.mjs   # expect: no hits
rg -n "ROUND14_CUTOVER_DIGEST_PENDING" scripts/check-user-round-contract.mjs                                     # expect: no hits
sha256sum scripts/check-round-contract.mjs   # must equal ROUND_SCRIPT_CURRENT_SHA256 in the user gate
git for-each-ref refs/replace                 # expect: empty
git config --get-regexp '^(log\.showsignature|gpg\.|core\.fsmonitor|core\.hookspath)'   # expect: rc=1
node scripts/check-round-contract.mjs
node scripts/check-user-round-contract.mjs
node scripts/check-round-contract.mjs --self-test
node scripts/check-user-round-contract.mjs --self-test
node scripts/check-round-contract.mjs --witness <rev with blob LEGACY_GATE_BLOB>
node scripts/check-round-contract.mjs --count-witness <rev with blob COUNT_WITNESS_BLOB>
node scripts/check-user-round-contract.mjs --witness <rev with blob 18e2c79a>
```

## Addendum: remediation status (re-read after RoundCounter's message; snapshots round `#6B13`, user `#44D2`; nothing executed)
- E1 is closed in both gates.
  - Round: `gitBlobId` (L84-86) is checked against the resolved blob before the bytes are written, in `witness` (L938) and `countWitness` (L977).
  - User: `gitBlobSha1` (L141-143) is checked in the witness (L747) and in the count-witness (L795).
  - A replace ref can no longer swap the executed bytes under a matching blob id. It still makes `rev-parse` and `show` disagree, but that now fails with exit 2.
- E3 is closed: both user `git log` calls (L217, L235) now pass `--no-show-signature`.
- D1 is resolved the same way in both gates. Any nonzero git status fails closed with `score_mismatch`, except `git grep` exit 1, which still counts as `0` (round, per RoundCounter; user L404-408). The ls-tree rows, which are all 16 production rows, now fail closed where the legacy pipeline silently produced `0`. L1 has ruled this an intentional correction, so it should be recorded as a claimed delta, not as unchanged semantics.
- D3 is closed: the round `git()` call now uses `maxBuffer: 16 MiB` (L60). It still has no timeout; this is low priority.
- D4 is closed. The round-gate working tree has sha256 `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942`, which RoundCounter reports as frozen. User gate L32 `ROUND_SCRIPT_CURRENT_SHA256` holds the same value (checked with `sha256sum` and a read; I ran no gate). Any later byte change to the round gate breaks this pin again. HEAD is still blob 43db9f4b, so the commit must carry these exact bytes.
- E2, E4, E5, E6, E8 and E9 are still residual, and L1 has chosen not to credit them. Replace refs and the env are not hardened for count and evidence reads. The scope claim must not say the gates run safely against a hostile repo. It should say: no shell; Git config, PATH, hooks and env are trusted from the caller.
