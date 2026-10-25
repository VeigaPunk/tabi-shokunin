# Sentinel: SentScopes — security & write-scope review of the round-24 gate plan

- Seat: `L1Tabi24.SentScopes` (sentinel, leaf — no delegation)
- Date: 2026-10-25; baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`
- Surface reviewed (all reads read-only): frozen `claims.json`; `SKILL.md` REGate-registry rows (lines 1556-1800); `SCORECARD.md`; `SHONEN.md`; committed receipts under `corpus/evidence/**`; `scripts/**` execution precedents.
- Verdict: as described, the plan is viable only under the guards below. The design's C2/m2 class ("re-run read-only commands named inside committed receipts") is an arbitrary-command-execution surface unless the receipt's command string is parsed into a closed, allowlisted, argv-array plan and everything else fails closed. No tool was installed (none needed; only read/glob/grep/bash-mkdir used).

## 1. Facts about the surface (evidence, observed)

The committed receipts are **free-form human-readable shell text**, not parseable tokens, and some are not valid commands at all:

- `corpus/evidence/fleet-round-1-freshness/critic-current.json:32` — `"command": "git show -s --format='%H %cI %ct' c24eaea… && TZ=UTC git show -s --format=%cd --date=iso-strict c24eaea… && date -u -d @1792018171 +%Y-%m-%dT%H:%M:%SZ && …"` (`&&` chains, quoting, assignments).
- `corpus/evidence/fleet-round-1-freshness/critic-current.json:46` — `git show …:corpus/knowledge/archive-receipt-r10.md | sha256sum` (pipe).
- `corpus/evidence/fleet-round-1-freshness/critic-current.json:54` — `sha256sum /home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/…` (**absolute paths outside the lane**, inside the user's HOME).
- `corpus/evidence/fleet-round-1-freshness/scribe-current.json:110` — `git grep -h '^MATCH[[:space:]]' "$REV" -- corpus/evidence/fleet-round-1-freshness/pins.tsv | wc -l` (double-quoted variable + pipe).
- `corpus/evidence/fleet-round-1-freshness/scribe-current.json:184` — `ls corpus/knowledge/*.md | wc -l; ls -d corpus/evidence/*/ | wc -l; find corpus/evidence -name MANIFEST.txt | wc -l; …` (semicolon chain, globs).
- `corpus/evidence/fleet-round-1-freshness/scribe-current.json:187` — `sed -n '15p;18p' SCORECARD.md; sed -n '140p' LOG.md; sed -n '1386p' SKILL.md`.
- `corpus/evidence/round-23/c1-measurements.json:5` — counter string `node scripts/round-evidence-audit.mjs --rev <REV> --round 22 … -> distinct findings[].class` (not executable as written); `:8` — `git cat-file -e a89f193:scripts/round-evidence-audit.mjs` (malformed rev:path).
- `corpus/evidence/round-14/executions/userProduction.json:2-12` — pairs a human `command` string with a distinct `argv` array + `cwd` + `measuredRevision`; the two **diverge by construction** (`command` is for humans; `argv` is what ran).

In-repo execution precedents (what to copy / what not to copy):

- **Safe precedent:** `scripts/check-user-round-contract.mjs:442-524` parses counted command rows with closed anchored grammars (`TREE_COUNT`/`GREP_COUNT`) and re-executes the *semantics* (`git ls-tree -r --name-only REV` / `git grep -h -e PATTERN REV -- PATH`) as argv arrays — never the recorded string.
- **Safe precedent:** `scripts/check-measurement-binding.mjs:186-199` + `scripts/selftest-measurement-binding.mjs:86-89,424-437` — `minimalEnv` allowlist; `INJECTION_ARGV` (`; $(touch INJECTED) \`touch INJECTED2\` && touch INJECTED3`) and the `rev_injection_inert` positive control assert shell metacharacters are inert under argv-array spawn.
- **Safe precedent:** `scripts/round-evidence-audit.mjs:68-83` — `scrubbedEnv` (allowlist of `PATH/HOME/TMPDIR/LANG/LC_ALL/USER/LOGNAME/SHELL` + `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_SYSTEM=/dev/null`, `GIT_NO_REPLACE_OBJECTS=1`, `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`, `GIT_PAGER=cat`).
- **Unsafe precedent (do NOT copy):** `scripts/pstack-seat.mjs:34` and `scripts/user-seat.mjs:34` — `spawnSync('bash', ['-c', slice.command], …)`; the round-13 `USER` gate likewise ran SCORECARD commands through a shell (`scripts/check-user-round-contract.mjs:39-43`, `COUNT_WITNESS_BLOB` comment).

## 2. Risk (a) — execute an attacker-controlled command string from a committed receipt

A committed receipt is attacker-influenced bytes (any lane contributor — or a hostile commit — controls it). `corpus/evidence/**` already contains every syntax class needed for arbitrary code execution if a gate feeds `command` to a shell or to an unvalidated argv.

| # | Vector | How | Guard |
|---|---|---|---|
| A1 | Free-form shell eval | `exec(cmd)` / `spawn('sh',['-c',cmd])` / string-concatenated commands. Receipts above already contain `&&`, `;`, `|`, globs, `"$REV"`, absolute paths. | **G-A1**: never invoke a shell; only `spawnSync`/`execFileSync` with argv arrays. Selftest must include an injection mutant asserting zero side effect (pattern exists: `selftest-measurement-binding.mjs:86-89`). |
| A2 | Unvalidated argv execution | Split-on-whitespace then `spawn(argv[0], rest)` lets argv[0] be any binary (`/bin/sh`, `curl`, `/tmp/x`) and args carry quotes/globs. | **G-A2**: closed grammar parses the receipt command into a fixed semantic plan (allowlisted executable + literal operands); any unmatched string => `unsupported` finding / could-not-evaluate, exit 2 — never executed. Reimplement semantics in-repo (the `countingCommand()` precedent). |
| A3 | Attacker-chosen args to allowlisted binaries | `git -c core.fsmonitor=<cmd>`/`--exec-path=`; `git grep` pattern starting `--`; `node -e '<code>'`/`--eval`; GNU `sed` `1r /etc/passwd` (read) / `w /tmp/out` (write); `awk` program text. | **G-A3**: argv skeleton fixed by the grammar — subcommand and flags come from code, not free text; operands validated (`PATH: ^[A-Za-z0-9._/-]+$`, no leading `-`, no `..`, no `:`-magic; `PATTERN` charset `^[A-Za-z0-9 _:.\/^$-]+$`; `REV: ^[a-f0-9]{40}$`); always `--end-of-options` (+ `--literal-pathspecs`); spawn node only as `process.execPath` + an allowlisted lane path, never with `-e`/`-p`. |
| A4 | Revision/placeholder injection | `<REV>` substitution and CLI `--rev` reaching git without `--end-of-options`; `HEAD~1`, `--output=…` swallowing, `^{commit}` tricks. | **G-A4**: strict rev validation (40-hex) or `check-ref-format`-validated refs; `--end-of-options` on every git invocation that takes a user/row-derived rev; invalid rev => exit 2. |
| A5 | Hostile environment / git hooks | Inherited env (`BASH_ENV`, `ENV`, `NODE_OPTIONS` => `--require` injection, `GIT_ASKPASS`, `GIT_SSH_COMMAND`, `GIT_EXTERNAL_DIFF`, `GIT_TRACE*`, `HTTP(S)_PROXY`) and repo-controlled hooks (fsmonitor) execute code during otherwise-innocent git/node runs. | **G-A5**: replicate `scrubbedEnv()`/`minimalEnv()` allowlists; `PATH` absolute-only (F3 precedent, `check-measurement-binding.mjs:198`, `check-adjacency.mjs:307`); `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, `GIT_NO_REPLACE_OBJECTS=1`, `GIT_GRAFT_FILE=/dev/null`, `GIT_NO_LAZY_FETCH=1`, `GIT_TERMINAL_PROMPT=0`, `GIT_OPTIONAL_LOCKS=0`, `GIT_LITERAL_PATHSPECS=1`, `GIT_PAGER=cat`, `-c core.fsmonitor=false -c core.quotepath=false -c core.commitGraph=false`; never inherit `NODE_OPTIONS`/`SSH_AUTH_SOCK`/proxy vars. |

## 3. Risk (b) — read session material or credentials

| # | Vector | Guard |
|---|---|---|
| B1 | Free-form command reads: `cat ~/.ssh/*`, `~/.config/gh/*`, `/home/vgpnk/.omp/**`, `git config --global …` (credential.helper), loopback port probes. | G-A1/A2 (closed grammar) deny free-form reads entirely; plus **G-B1**: operand paths must resolve (realpath) inside the lane root; absolute paths and `..` refused. The three public kimi plugin pins (`critic-current.json:54` shape) are out-of-lane reads-by-format — refuse them by default rather than bless a shape a hostile receipt can reuse. |
| B2 | Credential exposure via env: an untrusted child receiving real `HOME`/token vars/SSH agent socket; git invoking stored credential helpers. | G-A5 env scrub; `GIT_CONFIG_GLOBAL=/dev/null` + `GIT_TERMINAL_PROMPT=0` disable helper reads. |
| B3 | Output leakage: re-run stdout/stderr and findings become committed bytes; crafted command prints secrets into `corpus/evidence/**`. | **G-B3**: capture bounded; print only structured verdicts + short trimmed tails (precedent: stderr slice 160 chars); never embed full child stdout; strip control chars; cap length. |
| B4 | Symlink escape: in-lane symlink -> outside file (e.g. `corpus/evidence/x -> /home/vgpnk/.ssh/id_rsa`). | **G-B4**: `lstat`/`realpath` containment before read; refuse non-regular or escaping paths (precedent: `check-sources.mjs` refuses symlinked/non-regular registries). |
| B5 | Pathspec magic: `:(top)`, `:(exclude)`, `:(attr)` prefixes altering what git reads. | `GIT_LITERAL_PATHSPECS=1` + forbid `:`-leading path tokens in grammar. |

## 4. Risk (c) — write outside the lane

| # | Vector | Guard |
|---|---|---|
| C1 | Command-driven writes: free-form execution (A1/A2) writes/deletes anywhere — including destroying lane or fleet bytes. | G-A1/A2 (closed grammar); **G-C1**: allowlisted git subcommands only — `cat-file`, `rev-parse`, `ls-tree`, `grep`, `show`, `log`, `diff` (`--no-ext-diff --no-textconv`), `merge-base`, `ls-files`, `check-ref-format`, `status` only with `--no-optional-locks`; never `fetch/checkout/reset/commit/add/update-index/config/tag/gc`. |
| C2 | The gates' own writes: any output path is attacker-adjacent only if the gate writes to free paths (or follows symlinks out). | **G-C2**: declare exactly two write targets — report file and scratch under `.ufo/waves/round-24/`; validate output resolves inside lane (realpath of parent, containment), create with `O_NOFOLLOW`, refuse overwrite of differing bytes (webmcp-invoke precedent) except intended measurement; no writes to `/tmp`. |
| C3 | Git maintenance side effects: gc/commit-graph/index refresh (write) triggered during reads; `git diff` refreshes index unless optional locks off; external diff drivers write/execute. | G-A5 + `-c gc.auto=0`, `GIT_OPTIONAL_LOCKS=0`, `--no-ext-diff --no-textconv`. |
| C4 | Selftest fixture cleanup: `rmSync` of temp dirs must target exactly the created fixture path (prefix-checked), created only under lane scratch, never `os.tmpdir()` (contract). | **G-C4**: `mkdtemp` under `.ufo/waves/round-24/scratch/<Seat>/`; record exact path; cleanup constrained to that prefix; on failure leave marker. |

## 5. Risk (d) — hang on hostile input

| # | Vector | Guard |
|---|---|---|
| D1 | Child never returns: receipt-named `sleep 100000`; git waiting on credential prompt; node doing retries. | **G-D1**: hard per-child timeout (precedents: 30s `check-aria-metadata.mjs:2258`, 60s selftest, 120s reproduce) => kill process tree (`detached:true` + `process.kill(-pid)`), report could-not-evaluate exit 2. |
| D2 | Child blocks on stdin. | `stdio:['ignore','pipe','pipe']` always; no pty. |
| D3 | Buffer exhaustion: unbounded maxBuffer => spawnSync throws / memory blowup. | Bounded `maxBuffer` (16 MiB precedent); catch `result.error` => exit 2. |
| D4 | ReDoS / catastrophic backtracking on hostile doc text (SKILL.md rows, receipt strings). | Grammars anchored, single-level, charset-restricted, no nested quantifiers/backrefs (existing grammars comply); cap input sizes; treat parse failure as a finding, never an uncaught exception (wrap all row parsing). |
| D5 | Pathological cardinality: quadratic joins over thousands of gates/rows. | Linear scans; maps; caps (e.g. 10k rows, 8 MiB per file) => exit 2 beyond. |
| D6 | Process-tree leaks / grandchildren surviving timeout. | Detached spawn + group kill on timeout; stdin ignored. |

## 6. The one I refuse to ship without

**Closed-grammar parsing of every receipt- or row-derived command string into an allowlisted executable + argv array, executed with `spawn`/`execFile` semantics (no shell, no free text, no whitespace-split argv), with any string outside the grammar failing closed to a finding / exit 2 — and never executed.**

This is the necessary precondition for all four boundaries: it removes (a) at the root, and (b), (c), (d) then reduce to the remaining per-shape guards above. Secondary non-negotiables: (1) hard per-child timeout + group kill; (2) scrubbed allowlist environment; (3) bounded, truncated output capture; (4) realpath containment on every operand and every gate-owned write.

## 7. Mapping to claim contracts

- The claims' kill rules already demand fail-closed behavior ("unparseable row … counts as nonconformant, never clean"; "could-not-evaluate" classes). The guards above are exactly that: an unsupported receipt command shape must produce a finding (or `could-not-evaluate`, exit 2), never an execution.
- C2/m2 compares recorded exit vs re-run. Receipts carry both a human `command` and a structured `argv`/`measuredRevision`/`cwd` (`userProduction.json:2-12`). The gate must reconstruct the invocation from the **structured fields** (argv array, measured revision, cwd==lane root), never from `command`; if those fields are absent or the shape unsupported, report the class as could-not-evaluate, not as a mismatch.
- m2 must re-run only commands whose script still exists at the lane tip; a receipt naming a script absent at tip is could-not-evaluate, never a mismatch, and never a reason to check out old bytes (that would write).
- m3 (unlanded working tree) must use `git status --porcelain`/`ls-files` with `GIT_OPTIONAL_LOCKS=0` so index refresh cannot write.

## 8. Required selftest additions (both gates)

1. Injection mutant: receipt command `node -e '…'`, `$(touch X)`, `` `touch X` ``, `; rm -rf …` — assert a finding id and **zero** side effect (probe: no file created).
2. `--rev` injection: `--rev --output=/tmp/x`, `--rev HEAD~1`, non-hex — exit 2.
3. Outside-lane operand: absolute path, `..` traversal, symlink escaping lane — exit 2 / refusal finding.
4. Hang mutant: `sleep 100000` receipt — assert bounded wall time and exit 2.
5. Oversized/malformed inputs: 100 MB receipt, deep JSON, malformed row — exit 2, no crash, no hang.
6. Output-truncation assertion: child printing a secret-shaped line — report contains only the bounded tail.
