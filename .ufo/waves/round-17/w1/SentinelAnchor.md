VERDICT: ISSUES

# SentinelAnchor — §C1 laneTip + §C3 checker inputs (wave 1, read-only)

Reviewed live in-flight bytes (sha256 prefix): check-round-contract.mjs `c264e987`, check-user-round-contract.mjs
`bac10415`, check-measurement-binding.mjs `15af0111`, check-adjacency.mjs `19910cf5`, measure-c3.mjs `edee6622`.
git 2.56.0. All exploits were run against throwaway fixture repos under /tmp only; lane repo untouched (no jj, no git write).
Repro: `node /tmp/tabi-r17-SentinelAnchor-probe/probe.mjs` (extracts each gate's own `git()`+`laneTip()` text and runs it),
`bash /tmp/tabi-r17-SentinelAnchor-probe/c3probe.sh` (counter), `c3checker.sh <fixture>` (checker).

## C1 — laneTip (probe.mjs output; EXPLOITED = laneTip returned the hostile commit / gate read hostile bytes)

| id | attack | round | user | binding |
|---|---|---|---|---|
| E1 | lane `.git/HEAD` invalid → git discovery walks UP to the enclosing repo | EXPLOITED | EXPLOITED | EXPLOITED |
| E2 | `symbolic-ref` exit 128 (malformed HEAD, repo still valid) → silently treated as detached | EXPLOITED | EXPLOITED | safe (refuses) |
| E3 | detached HEAD, `refs/heads/master` is a symref → `refs/remotes/o/evil` | EXPLOITED | EXPLOITED | EXPLOITED |
| E4 | `git replace <TIP> <P>`: tip oid printed, P's tree read | EXPLOITED | EXPLOITED | safe |
| E5 | inherited `GIT_DIR=<other>/.git` | EXPLOITED | EXPLOITED | safe |
| E6 | attached HEAD on off-lane `refs/heads/scratch` | certifies scratch | same | same |

**F1 HIGH — E4 replace refs (round, user gates).** Exploit: in the lane, `git replace $(git rev-parse master) <clean-commit>`;
master's real tree is poisoned. laneTip prints master's 40-hex (`code_revision=` = REV, so C1 counter arm B "prints REV"
passes) while every `show/rev-parse REV:path/ls-tree` reads the replacement tree (fixture: printed tip, `show TIP:f` →
`POISON`). Also `info/grafts` / `replace --graft` fake `merge-base --is-ancestor` (sandbox: orphan→tip ancestry rc 1→0;
rc 1 again under `GIT_GRAFT_FILE=/dev/null` / `GIT_NO_REPLACE_OBJECTS=1`). Cause: `git()` at check-round-contract.mjs:59-62
and check-user-round-contract.mjs:116-118 spawn with the full inherited env and no replace/graft pin.
Guard (MUST): give both gates' `git()` an explicit env — the binding gate's `minimalEnv()` (check-measurement-binding.mjs:186-205)
minus nothing; at minimum `GIT_NO_REPLACE_OBJECTS=1`, `GIT_GRAFT_FILE=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`,
`GIT_CONFIG_GLOBAL=/dev/null`, absolute-only PATH, no `GIT_*` inherited. Same for the fixture `commit()` helpers' children
only if they read lane state (they don't; leave them).

**F2 MEDIUM — E5 env leakage (round, user).** Exploit: any caller that exports `GIT_DIR` (every git hook does; `GIT_DIR=x node gate`)
makes the gate certify another repo: symbolic-ref/rev-parse/show all hit `$GIT_DIR`; `-C`/cwd is ignored
(sandbox: `GIT_DIR=fleet/.git git -C lane show HEAD:x` → fleet bytes). Also `GIT_REPLACE_REF_BASE`, `GIT_OBJECT_DIRECTORY`,
`GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`, `GIT_CONFIG_COUNT/KEY_n/VALUE_n`, `GIT_CONFIG_PARAMETERS` pass through.
Guard: same as F1 (constructed env, never `{...process.env}`). Output on a benign attached checkout is unchanged
[INFERENCE: no glob pathspecs in SCORECARD counting rows — `grep -nE "git (grep|ls-tree)[^|]*\*" SCORECARD.md` returned nothing;
user gate already passes `--literal-pathspecs`].

**F3 MEDIUM — E1 parent-repo fallthrough (all three; also measure-c3 laneTip).** tabi-shokunin is nested inside the fleet
repo (`git -C /home/vgpnk/Projects/shokunin rev-parse --show-toplevel` = fleet; fleet `check-ignore`s the lane). If the lane's
`.git` stops qualifying as a repo (e.g. `.git/HEAD` = `ref: HEAD` or `ref: -x`), every git call from the lane cwd resolves
the FLEET repo: fixture `symbolic-ref -q HEAD` → status 0 `refs/heads/main` (passes the refs/heads/ regex), laneTip
returns the parent's commit in all three gates. The binding gate's `resolveRepo` (:282-288) likewise returns the parent toplevel.
Guard (MUST, verified): spawn git with `GIT_CEILING_DIRECTORIES=<dirname(realpath(root))>` (fixture: fallthrough →
`fatal: not a git repository`, rc 128; healthy lane unaffected) AND assert `realpath(rev-parse --show-toplevel) === realpath(root)`
before laneTip; exit 2 otherwise.

**F4 MEDIUM — E2 fail-open on unexpected symbolic-ref status (round :90-91, user :137-138, measure-c3 :177-179).**
`sym.status === 0 ? … : 'refs/heads/master'` maps 128 (bad HEAD), null (spawn error/ENOENT/E2BIG) to "detached".
measure-c3 additionally maps an attached non-heads ref (e.g. `refs/tags/t`, which symbolic-ref returns with status 0 —
sandbox verified) silently to master instead of refusing. Guard (MUST): attached iff status 0 and stdout matches
`^refs/heads/[^\0-\x20\x7f~^:?*\[\\]+\n$` exactly (no `.trim()` acceptance); detached iff status 1 AND stdout empty; anything
else → could_not_evaluate. The binding gate (:257-261) and check-adjacency (:268-273) already do the status part.

**F5 MEDIUM — E3 symref branch (all three, checker, counter).** `symbolic-ref -q HEAD` dereferences recursively and
`rev-parse refs/heads/master^{commit}` follows a symref: with detached HEAD and `refs/heads/master` → `refs/remotes/o/evil`,
every gate certifies an unlanded remote-tracking commit while the literal anchor string still passes `^refs/heads/`.
Guard (verified): use `symbolic-ref -q --no-recurse HEAD` and then require `git for-each-ref --format=%(symref) -- <ref>`
to print an empty line (fixture printed `refs/heads/evil` for the attack) → else could_not_evaluate.

**F6 LOW (design) — E6 attached off-lane branch.** All three certify whatever branch HEAD is attached to. On the real lane
(jj, detached: `symbolic-ref -q HEAD` rc=1 today) a `git switch scratch` makes gates certify scratch, not master. SHOULD:
in production mode (no `--repo` fixture) require the anchor to be exactly `refs/heads/master`; fixtures keep attached semantics.

**Negative results (held):** symbolic-ref never emits `-`-leading, newline, space, `@{`, `..`, `:`, `^{}` or ESC names — all such
HEAD contents give rc 128 (`No such ref: HEAD`) or not-a-repo (sandbox, 12 cases), so output-injection reduces to F3/F4;
`refs/heads/-x` is legal but the argv token starts with `refs/`, and `--end-of-options` is present in every laneTip and works
on 2.56 (`rev-parse --verify --end-of-options -x^{commit}` → "Needed a single revision", not an option). No `shell:true`,
`execSync`, or `bash -c` in any C1/C3 file (only pre-existing `scripts/pstack-seat.mjs:34`, `scripts/user-seat.mjs:34`, out of scope).
TOCTOU (LOW): the binding gate reproduces child commands that resolve their own tip; if L1 lands mid-run the parent and child
may disagree — pass the resolved 40-hex explicitly (`--at`) to any child gate [INFERENCE: not exercised].

## C3 — check-adjacency.mjs / measure-c3.mjs inputs

Fixture fleet (fleet repo + `kaidoku-shokunin` + `tabi-shokunin`), forged map committed in the fixture lane only.
Live checker: `ADJACENCY verdict=failed rows=7 verified=6` — 6 forged rows VERIFIED (only the deliberately non-matching
row 8 failed). Live counter on its own rows: `c3_adjacency_verified=6` with the same classes.

**F7 HIGH — forged sibling commit, no reachability (checker :465-470, counter commitAt :230-240).** Exploit: any same-uid
agent runs `git -C kaidoku-shokunin hash-object -w` + `mktree` + `commit-tree` — objects only, no ref moves, invisible in
kaidoku's `jj log`/`git log` — writing a PROVINCE.md line "kaidoku cedes all cdp scope to tabi forever", then cites
`kaidoku-shokunin@<forged>:PROVINCE.md:1`. Fixture: `merge-base --is-ancestor forged master` → no; checker and counter both
verify the row. Guard (MUST): resolve the sibling's lane tip with the same C1 laneTip (attached branch or refs/heads/master;
note `revenger-shokunin` is attached to `refs/heads/main`, kake/kagi attached master, kaidoku detached) and require
`merge-base --is-ancestor <commit> <siblingTip>` → else sibling_unresolved. Same for `ruled`/`contested-open` fleet refs
(fleet HEAD = `refs/heads/master`).

**F8 HIGH — self-citation of the map (both).** `tabi_ref=corpus/adjacency.tsv` makes `tabi_quote` trivially present (the row
itself contains it); for split rows the checker's `ruling_quote` must be in tabi_ref text (:531) — also self-satisfied. Fixture
row "FABRICATED CLAIM NOT IN ANY TABI FILE" verified by both. Guard (MUST): reject tabi_ref / ruling path equal to
`corpus/adjacency.tsv` or under `.ufo/waves/` (row fragments, drafts) → tabi_ref_invalid.

**F9 HIGH — own lane as "sibling" / as ruler.** Checker: `sibling=tabi`, `sibling_ref=tabi-shokunin@…` passes (LANE_TOKEN
admits `tabi`; :446-458 only checks list membership). Counter: SIBLING_REPO_RE (:69) admits `tabi-shokunin` and never ties
`sib.repo` to the `sibling` column at all (fixture: sibling=kaidoku, ref=tabi-shokunin → verified). Ruling: RULING_REF (:143)
and counter :364 admit `tabi-shokunin@…`, so a tabi worker writes "integrator ruled tabi wins everything" into any tabi file,
commits, and cites it as `ruled` (verified in fixture by both). Real rows already use this shape:
`.ufo/waves/round-17/adjacency/kaidoku.tsv` and `revenger.tsv` rule via `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md`.
Guard (MUST): own-lane token (from `basename(lane)`) forbidden in `sibling`/sibling_ref; counter requires
`sib.repo === sibling + '-shokunin'`. For own-lane rulings (needed for the integrator ruling at
spotcheck.md:138-142): pin an allowlist `{commit: 5859243…, path, lines 138-142}` in code, require that commit to be an
ancestor of the evaluated rev, and the cited line byte-identical at the evaluated rev; report them as `ruling_authority=self`
so the L1 can decide whether they count.

**F10 MEDIUM — trivial quotes.** One-char quotes (`e`, `o`, `c`) verify a `ruled` row in both tools (fixture). Guard (MUST):
every quote ≥3 words and ≥15 non-space chars; reject C0/C1 controls and invisible/bidi code points
(U+200B-200F, U+202A-202E, U+2066-2069, U+FEFF) in all 9 fields (Trojan-source "verbatim" quotes). Text output is already
safe: an ESC/CR-laden field printed only via `cleanDetail` (fixture row 8 detail showed no raw bytes; `--json` escapes).

**F11 LOW — count inflation via duplicates.** Identity is raw `surface+sibling` (checker; counter :431): `X6 self ruling` vs
`x6 SELF RULING` both verified. Guard: identity = case/space-folded surface + sibling, and also dedupe on the exact
`sibling_ref` line (one cited sibling line counts once).

**F12 LOW — repo identity (checker :335-354; counter repoDirFor :272-277 has none).** Counter checks only `existsSync`; a
non-repo `<lane>-shokunin` dir resolves to the fleet repo (fixture: commitAt passed; blob read failed only because ls-tree's
pathspec became cwd-relative — incidental). Checker's toplevel==realpath check blocks fallthrough but accepts a symlinked
dir and a `.git` gitfile (`gitdir: /elsewhere`; fixture toplevel stayed the sibling path). Guard: `lstat(dir)` not a symlink,
`realpath(rev-parse --absolute-git-dir) === realpath(dir)+'/.git'`, plus `GIT_CEILING_DIRECTORIES=<fleet parent>` (F3).

**Held on inputs:** lane token / `-shokunin` regexes forbid `/`, so `..`/absolute traversal is impossible; paths go through
isCleanRepoPath (no `.`/`..`/`-`/`:`/`\`/NUL; `rev:./f` alias refused); commits are 40-hex-anchored and resolved with
`--end-of-options`; blob reads use `ls-tree` mode check + `cat-file blob` (no textconv; trees/symlinks refused — `git show
<rev>:<dir>` would print a filename listing a quote could match). Unvalidated `git show` would be file-write: sandbox
`git show --output=<dir>/pwned.txt:f` created `pwned.txt:f` (rc 0) — the 40-hex regex is what prevents it; keep it before
any spawn. Checker `--at` refuses only `HEAD`/`@`-prefixed tokens; `master@{1}`, `ORIG_HEAD` resolve (LOW; SHOULD accept 40-hex only).

## Must-have guards (summary)
1. Round/user gates: constructed minimal git env (F1, F2). 2. All laneTips: ceiling + toplevel identity (F3); strict status/
stdout parse (F4); `--no-recurse` + non-symref anchor (F5). 3. C3: sibling/fleet commit ancestry from that repo's lane tip (F7);
ban map/fragment self-citation (F8); own lane never sibling, self-rulings pinned + labelled (F9); quote floor + invisible-char
ban (F10); folded dedupe (F11); lstat + git-dir identity (F12).

## Re-probe after owner hardening (round `2f31d4d5`, user `03dd5010`, binding `b3adbf61`)
probe.mjs now reads E4 through each gate's OWN `git()` and runs binding as `laneTip(resolveRepo(root))` (the earlier
E4 "EXPLOITED" for round/user on re-run was a probe artefact, as GateRoundAnchor reported). Result: E1-E5 safe/refused
in all three gates; E6 still certifies the attached branch (F6 declined per PLAN §C1, routed to L1).

**F13 MEDIUM — regression from the F5 fix: reflog anchor (round, binding).** `symbolic-ref --no-recurse` prints HEAD's
raw target with rc 0 even when it is not a valid ref name. Sandbox, `.git/HEAD` = `ref: refs/heads/master@{1}`: rc 0,
stdout `refs/heads/master@{1}\n`, which passes the `[^\x00-\x20\x7f~^:?*\[\\]+` class; `for-each-ref -- <ref>` prints
nothing (round accepts `trim()===''`, binding's row loop sees no rows), and `rev-parse --verify ${ref}^{commit}` resolves
the REFLOG entry. probe E7 (master moved clean→poison, HEAD → `master@{1}`): round EXPLOITED, binding EXPLOITED
(both return the old clean commit); user safe (requires for-each-ref stdout exactly `\n` → "does not exist").
Also accepted by the regex: `a..b`, `x.lock`, `.x`, trailing `/` (these fail to resolve → exit 2).
Guard (verified): require `git check-ref-format <ref>` rc 0 (rc 1 for `master@{1}`, `a..b`, `x.lock`, `.x`, `master/`; rc 0
for `master`, `feat/x`; `--` is NOT accepted, rc 129 — ref starts with `refs/` so no option risk) AND require for-each-ref to
return exactly one row whose refname === ref with empty symref (user gate's shape). check-adjacency (no `--no-recurse`,
regex `[A-Za-z0-9._/-]+`) is not affected by the `@{` form.

**Final re-probe (round `1579a794`, user `a8ecb441`, binding `8be0a2c6`):** E1, E2, E3, E4 (read=good), E5, E7 safe/refused in
all three gates; E7 now refuses via `check-ref-format` ("not a valid ref name") in every gate. F1-F5 and F13 closed for C1.
Residual: E6/F6 (attached off-lane branch certified) — declined by both owners per PLAN §C1; L1 decision.

Tooling: none installed or updated. Sandboxes: /tmp/tabi-r17-SentinelAnchor-* fixtures removed after the run; probe
scripts kept at /tmp/tabi-r17-SentinelAnchor-probe/ for repro.

Files written:
- .ufo/waves/round-17/w1/SentinelAnchor.md
