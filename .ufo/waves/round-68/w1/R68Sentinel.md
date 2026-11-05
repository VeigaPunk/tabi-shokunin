# R68Sentinel — security/scope audit, tabi round 68, wave w1

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin (base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8). Pre-freeze; no claims frozen. No production edits. No git/jj mutations. No tool installs. Scratch was used and deleted; evidence is persisted at `.ufo/waves/round-68/w1/R68Sentinel/evidence/`.

## Axes (named first)

1. Trust boundary of the gate inputs (argv, TSV, paths) — is anything untrusted reaching argv, paths, or git?
2. Destructive side effects (`rmSync`, git writes) — can a gate touch anything outside its own scratch?
3. Identity (fixture repo, adjudicator non-author, repo that a head resolves in).
4. Calibration — does what the gate claims to prove match what the code proves?

Ranking: F1 and F2 are the severe ones (destructive/foreign-repo write, identity bypass). F3 and F4 break the live CLI and the registry proof. The rest are hardening.

## Findings

Severity labels: HIGH = can mutate outside scratch or defeat a stated non-author guarantee; MED = a stated guarantee is not what runs; LOW = hardening.

### F1 — HIGH — Inherited `GIT_DIR` makes the C1 selftest commit into a foreign repository
- Code: `check-adjacency-adjudication-r68.mjs` selftest uses `execFileSync('git', ['init', '-q', repo])`, `git -C repo add`, `git -C repo commit`. `git()` helper and `resolveAtHead` use `execFile` with inherited `process.env`. Nothing strips `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_NAMESPACE`.
- Probe (scratch only): a victim repo `probe/victim` with one commit `victim-init`. Ran `GIT_DIR=<victim>/.git node check-adjacency-adjudication-r68.mjs --selftest --scratch <scratch>/gitdir-selftest`.
- Observed: exit 0 (`cases 15, failed 0`). Victim HEAD moved `9847eae` → `c7f793e`. Victim log now shows a new `fixture` commit. Victim index now tracks `PROVINCE.md`. The fixture's write landed in the victim repo, not in the scratch repo.
- Impact: any shell that exports `GIT_DIR` (CI wrappers, git hooks, `git rebase -x` contexts, developers) causes the selftest to commit into and index that repo. Live `resolveAtHead` would also read objects from the inherited repo, so the head proof is against the wrong store.
- Smallest remediation: build the child env as `const env = { ...process.env }; for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];` and pass `{ env }` to every `execFile`/`execFileSync` git call. Add a selftest guard: refuse if `process.env.GIT_DIR` is set. Also assert `git rev-parse --git-dir` equals `<repo>/.git` before committing.

### F2 — HIGH — Destructive scratch `rmSync` has no containment; a sibling directory was deleted
- Code: both gates' `selftest(scratch)` start with `fs.rmSync(scratch, { recursive: true, force: true })`. `--scratch` is taken verbatim from argv. The only check is "is it present".
- Probe (scratch only): created `probe/rm-parent/sibling/keep.txt` and `probe/rm-parent/victim-tree/keep.txt`, then ran C2 `--selftest --scratch <scratch>/probe/rm-parent`.
- Observed: exit 0. `rm-parent/` was recreated containing only `tool.mjs`. `sibling/keep.txt` is gone. `victim-tree/keep.txt` is gone. The `--scratch` path itself was wiped, not a child.
- Impact: `--scratch .`, `--scratch ~`, `--scratch <lane>`, or any parent of real data is wiped recursively. The usage text says "scratch", but nothing enforces it. Passing a fleet path would delete tracked work.
- Smallest remediation: do not `rmSync` a caller-supplied path. Options, in order of preference: (a) `fs.mkdtempSync(path.join(parent, 'r68-selftest-'))` and remove only that generated directory; (b) if the caller path must be used, require an empty dir or a marker file `.r68-selftest-scratch` created by the gate, `realpathSync` it, refuse if it equals or contains `process.cwd()`, `$HOME`, or the lane root, and remove only children carrying the marker. Recommend (a): the gate never needs a user-chosen deletion target.

### F3 — MED — Documented live invocation is unparseable; both live gates exit 2 with `--json`
- Code: `parseArgs` returns `null` whenever a `--flag` has no following value. `--json` is not special-cased (only `--selftest` is). Both gates' usage strings and the lane's stated run line use `--json`.
- Observed: C1 live `… --expect-pending 49 --max-adjudicated 0 --json` → rc 2, usage printed, no JSON. C2 live `--skill SKILL.md --repo . --json` → rc 2 ("error: missing --skill", because `args` is null). Without `--json`, both gates run normally and emit JSON.
- Impact: the stated live receipt cannot be produced as written; a reader might believe the gate passed or that it was never run. Calibration issue, not a bypass.
- Smallest remediation: in `parseArgs`, accept `--json` as a boolean (`if (key === 'json') { args.json = true; continue; }`), or drop `--json` from the usage line and receipts. Pick one; do not leave both.

### F4 — MED — Adjudicator non-author check is an exact string match on `tabi` only
- Code: `else if (adjudicator === 'tabi' || adjudicator.endsWith('-shokunin\ttabi')) findings.push(['adjudicator-author', line]);`. The second clause can never match, because cells are split on tab before this runs.
- Probe (scratch only): live ledger + regenerated worksheet, row 2 changed to `adjudicated-agree`, `verdict=agree`, `reason=holds`, `date=2026-11-05`, adjudicator varied. Gate run without `--expect-pending`.
- Observed: `tabi` → rc 1, `adjudicator-author`. Every one of these passed (rc 0, `ok: true`): `Tabi`, `TABI`, `"tabi "` (trailing space), `TabiR68` (planner seat id), `tabi-shokunin` (lane name), `L1 TabiR68`, and `R68Review1` (a lane-internal reviewer seat).
- Impact: the gate proves "not the literal string tabi", not "not the author". The contract says lane seats are not outside non-authors, and the planner seat is the author. Both pass. Calibration gap against the C1 claim "the lane itself can never be the adjudicator of record".
- Smallest remediation: normalize (`trim().toLowerCase()`) and reject against a closed allow-list of author identities: `tabi`, `tabi-shokunin`, `tabiR68`, plus every seat id of the lane (read from the wave roster). Require the adjudicator to be in an explicit outside-reviewer roster supplied by pin (e.g. `--outside-roster <file>` with its sha). Delete the dead `endsWith('\ttabi')` clause.

### F5 — MED — C1 committed worksheet is stale; quote column is `-` on all 49 rows
- Probe: regenerated with the lane's own counter `.ufo/waves/round-68/counters/build-worksheet-r68.mjs` into scratch. Output has 50 lines (header + 49), 9 columns each, quote column = ledger quote.
- Observed: `corpus/adjacency-adjudication-r68.tsv` (sha256 `ef9ec7da78720ffe3828073d47c196eaf42a078629d78db782d3903ffc7fe1e8`) has `-` in column 4 for all 49 rows. Columns 1–3 and 5–9 are byte-identical to the regen. Regen sha256 `a6028e70bb76e40902a6784fd199c5a329fd27a13830bee8976e795443a99d91`.
- Gate outcome: live C1 gate against the committed corpus → rc 1, 49 `quote-mismatch` findings (fails closed). Against the regen → rc 0, `ok: true`, `checked 49`, `pending 49`, `adjudicated 0`.
- Recommendation: L1 should overwrite `corpus/adjacency-adjudication-r68.tsv` with a fresh regen from the same counter and re-hash. I did not write it (production file, not mine).

### F6 — MED — C2 claims to pin the committed blob but hashes the working tree
- Code: header comment says "recorded sha256 equals the committed blob". `check` calls `sha256File(abs)` → `fs.readFileSync(abs)` on the working-tree file.
- Probe (scratch only): committed `scripts/verify-live-r67.mjs` with content A (blob sha256 `a3efecf6…7dba594`), then changed the working file to B, uncommitted (working sha256 `c4de0ab3…2a8014`). Registry row pinned the working sha.
- Observed: `ok: true`, `findings: []`. The gate accepts a registry pin for content that is not committed.
- Smallest remediation: compute the blob with `git -C <repo> show HEAD:<path>` piped through sha256 (or `git hash-object` against `ls-files -s` index entry) and compare; also require `git status --porcelain -- <path>` to be empty. Add a selftest case: uncommitted edit → `sha-mismatch` or `uncommitted`.

### F7 — MED — C2 accepts a symlink as an instrument; the sha and existence checks follow it
- Code: `fs.existsSync(abs)` and `fs.readFileSync(abs)` both follow symlinks. There is no `lstat`/`isFile` check, unlike `readIfExists` in C1.
- Probe (scratch only): `.ufo/waves/round-67/counters/png-r67.mjs` replaced by a symlink to a file outside the repo; row pinned that file's sha.
- Observed: `ok: true`. The registry proves a sha of an out-of-repo file.
- Smallest remediation: `fs.lstatSync(abs).isFile()` must be true and `realpathSync(abs)` must be under `realpathSync(repoRoot)`. Otherwise `path-not-regular-file`.

### F8 — LOW/MED — C2 `entry` check is a substring test; any mention of the path passes
- Code: `if (!entry || !entry.includes(p)) findings.push(['entry-unbound', p]);`
- Probe: row entry `echo scripts/verify-live-r67.mjs` (not an invocation) → rc 0, no `entry-unbound`.
- Smallest remediation: require the entry to start with `node <p>` (or `node ./<p>`) after trimming backticks, and reject entries containing `#`, `;`, `&&`, `|` unless they are explicitly allowed. Add selftest case.

### F9 — MED — C1 git repo resolution can silently use the fleet root repository for a non-repo lane directory
- Code: `resolveAtHead` runs `git -C path.join(fleetRoot, lane)` without checking that the directory is the top level of a repository. If `<fleet>/<lane>` exists as a plain directory inside the fleet root repo, git walks up and resolves objects from the fleet root.
- Probe (scratch only): outer repo `probe/fleet2` with commit H containing `PROVINCE.md`. Created plain directory `probe/fleet2/zed-shokunin` (not a repo). Ledger/snapshot/worksheet pinned H.
- Observed: rc 0, `ok: true`, `path-unresolved` absent. Control with lane dir absent → rc 1, `path-unresolved`.
- Impact: needs an unusual layout and a head that the fleet root also contains, so this is low in practice. It is still an identity confusion the gate claims to prevent ("path resolvable at that head in the sibling checkout").
- Smallest remediation: before resolving, `git -C <dir> rev-parse --show-toplevel` must equal `realpath(<dir>)`. Otherwise `lane-not-a-repo`.

### F10 — LOW — TOCTOU in `readIfExists`
- Code: `lstatSync(p)` then `readFileSync(p)`. Between them the path can be replaced with a symlink, and `readFileSync` follows it. The current lstat check is correct for the static case: symlink, directory, and FIFO inputs were all rejected (`ledger-missing`, `worksheet-missing`, rc 1), and the FIFO did not hang.
- Smallest remediation: `const fd = fs.openSync(p, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW); const st = fs.fstatSync(fd); if (!st.isFile()) …; fs.readFileSync(fd)`. Not urgent for a single-operator lane.

### F11 — LOW — argv/TSV hardening (checked; no injection found)
- `git` is invoked with `execFile` (no shell). `head` must match `^[0-9a-f]{40}$` before use; `filePath` must match `^[A-Za-z0-9][A-Za-z0-9._/@+-]*$`, so it cannot start with `-` and cannot be an option. Git receives `head + ':' + filePath`, which can't be an option because it starts with a hex digit.
- Gap: `lane` and `pathKey` shape failures (`validateKey`) push findings but do not `continue`, so an invalid lane still reaches `path.join(fleetRoot, lane)` and runs read-only git against it. Pinned ledger limits this to operator-controlled data. Smallest fix: `continue` after `key-shape`, before `resolutions.push`.
- The worksheet `quote` is compared with `includes`/`!==` only. No shell/argv use. OK.

### F12 — Scope note (C2 candidate state)
- `SKILL.md` contains no `## Instrument registry — round 68` section (grep count 0). The live C2 gate reports `registry-section-missing`, which is correct fail-closed behavior. The C2 repair is therefore not yet present. The registry must also satisfy F6–F8 before it can register the seven r67 instruments honestly.

## Checked and clean

- `readIfExists`: symlink, directory, and FIFO inputs fail closed (see F10).
- C1 gate selftest 15/15 and C2 selftest 7/7 pass as shipped. Note that the selftests themselves carry F1 and F2 (destructive and git-env), so they are not safe to run in an uncontrolled environment until fixed.
- Both gates pin inputs by sha256 and fail closed on pin mismatch (`ledger-pin`, `snapshot-pin`).

## Receipts

Tools: node v24.21.0, git 2.56.0 (already installed; no installs this round; no pacman).
git global `commit.gpgsign` unset; `tag.gpgSign` unset; GIT_* env not set in the session.

Input sha256 (lane-relative, all read-only):
- `.ufo/waves/round-68/counters/build-worksheet-r68.mjs` = 85e168020e95634c875b93b5384940805e9a0bec0d7f0e0a63a375d616a31750
- `scripts/check-adjacency-adjudication-r68.mjs` = e7f042916833828096c9550b299085934ad195aa318b864cfd7f68cc86963c1e
- `scripts/check-instrument-registry-r68.mjs` = 25cdc6c3c13fb73c12712d3fad8fce279d50fe5563ad077308eb369c4ffd0e17
- `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` = 3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105 (149 `line` rows; 49 contested-open; regen matched all 49)
- `.ufo/waves/round-66/measure/snapshot-live-r66.tsv` = a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74
- `corpus/adjacency-adjudication-r68.tsv` = ef9ec7da78720ffe3828073d47c196eaf42a078629d78db782d3903ffc7fe1e8
- `SKILL.md` = 0d7fa30bb6b1e72d3acfe3f63f0f464d3f24198bd84e0fa111ba1e7c9f59a76c
- regen worksheet (scratch, not kept) = a6028e70bb76e40902a6784fd199c5a329fd27a13830bee8976e795443a99d91

Executed commands and results (rc / stdout summary; full stdout in `evidence/`):

1. `node .ufo/waves/round-68/counters/build-worksheet-r68.mjs --ledger <ledger> --snapshot <snapshot> --out <scratch>/probe/ws-regen.tsv` → rc 0, stdout `{"ok":true,"rows":49,…}`. Evidence: `evidence/ws-regen.tsv`.
2. `node scripts/check-adjacency-adjudication-r68.mjs --selftest --scratch <scratch>/c1-selftest` → rc 0, `verdict clean, cases 15, failed 0`.
3. `node scripts/check-instrument-registry-r68.mjs --selftest --scratch <scratch>/c2-selftest` → rc 0, `verdict clean, cases 7, failed 0`.
4. C1 live, `--json` form (`… --expect-pending 49 --max-adjudicated 0 --json`) → rc 2, usage only (F3). Without `--json` against the committed corpus → rc 1, 49× `quote-mismatch` (F5). Evidence: `evidence/c1-live.json`.
5. C1 live against regen (`--worksheet <scratch>/probe/ws-regen.tsv`, pins as above, `--expect-pending 49 --max-adjudicated 0`) → rc 0, `{"ok":true,"findings":[],"checked":49,"pending":49,"adjudicated":0}`. Evidence: `evidence/c1-regen.json`.
6. C2 live `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo . ` → rc 1, `registry-section-missing` (F12). Evidence: `evidence/c2-live.json`. `--json` form → rc 2 (F3).
7. Alias probes (`awk` row 2 → `adjudicated-agree`, adjudicator varied; `node … --ledger <live> --worksheet <variant> --snapshot <live> --fleet /home/vgpnk/Projects/shokunin --expect-ledger-sha256 3739…1105 --expect-snapshot-sha256 a5fc…370a74 --repo <lane>`):
   - `tabi` → rc 1, `adjudicator-author:1`
   - `Tabi`, `TABI`, `tabi ` (trailing space), `TabiR68`, `tabi-shokunin`, `R68Review1`, `L1 TabiR68` → rc 0, `ok:true`. Evidence: `evidence/alias-*.json`.
8. Symlink/dir/FIFO ledger, symlink worksheet (`timeout 15`): rc 1 each, `ledger-missing` / `worksheet-missing`; no hang. (F10, inline output, not separately kept.)
9. GIT_DIR probe: `GIT_DIR=<victim>/.git node … --selftest --scratch <scratch>/probe/gitdir-selftest` → rc 0; victim HEAD `9847eae…` → `c7f793e…`. Evidence: `evidence/gitdir-selftest.out`. (F1)
10. rmSync probe: `node scripts/check-instrument-registry-r68.mjs --selftest --scratch <scratch>/probe/rm-parent` with sibling dirs present → rc 0; sibling and victim-tree removed. Evidence: `evidence/rm-parent.out`. (F2)
11. C2 working-tree probe (`--skill <scratch>/…/SKILL-probe.md --repo <scratch>/…/c2-wt`): uncommitted edit + symlink-to-outside → rc 0, `ok:true`. Evidence: `evidence/c2-wt.json`, `evidence/c2-probe-SKILL.md`. (F6, F7)
12. C2 entry probe (`| echo scripts/verify-live-r67.mjs |` entry) → rc 0. Evidence: `evidence/c2-entry.json`. (F8)
13. Nested-repo probe (plain-dir lane inside outer repo) → rc 0, `ok:true`; control with lane absent → rc 1, `path-unresolved`. (F9)

Lane tree after probes (read-only check `git -C <lane> rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/tabi-shokunin`; `git status --porcelain -- scripts .ufo/waves/round-68` → the three untracked `scripts/*r68*.mjs`/wave paths already present before my work). No lane file was modified by me.

Scratch `/fast/scratch/hyaku/tabi-r68/R68Sentinel/` removed after evidence was persisted.

## Recommended handoff for the integration owner (L1)

Order of repair, each as a bounded edit to the gate it belongs to:
1. F1 + F2 first (strip `GIT_*` env; replace scratch `rmSync` with `mkdtemp`). These block running either selftest safely.
2. F3 (`--json` parse) so the stated live receipts can be produced.
3. F4 (closed adjudicator allow-list, normalized) before any row is adjudicated. Until then, a non-literal `tabi` alias could be recorded as a non-author adjudication.
4. F5: regenerate `corpus/adjacency-adjudication-r68.tsv` with the lane counter and re-pin; do not hand-edit the quote column.
5. F6–F9 before C2's registry claims "committed blob", "instrument regular file", or "entry bound" are stated as proven. F12: the registry section is still absent; add it only after the C2 gate has these checks.
6. F10/F11 as hardening.

No production files were edited. Every item above is a proposal; each fix needs its own selftest case so the gate can't pass a probe that is shown to fail here.
