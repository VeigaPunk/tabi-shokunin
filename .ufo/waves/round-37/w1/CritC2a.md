# CritC2a — ATTACK C2-B1 (replace-ref refusal), tabi r37 w1

Seat: CritC2a (critic, leaf). Target: frozen counter `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`
(sha256 `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019`, verified identical between
freeze commit `99437d29de036415a9f2d0524343617a3b19988a` and the lane worktree) and its B1 defense:
every git read spawned with a **fresh literal env** (`PATH`, `GIT_CONFIG_NOSYSTEM=1`,
`GIT_CONFIG_GLOBAL=/dev/null`, `LC_ALL=C`, `GIT_NO_REPLACE_OBJECTS=1`) plus a one-shot
`git for-each-ref refs/replace/` enumeration at `evaluate()` entry (lines 525–528) that refuses
(exit 2) on any hit. All fixtures were scratch clones under
`/fast/scratch/hyaku/tabi-r37/w1/CritC2a/` (deleted on exit); host git 2.56.0; lane cloned at
`f76da094f0ff0ad9856d2232858241e3f7841379`.

## (a) Replace refs hidden in packed-refs — DEFEATED

Fixture `f1`: clone → `git replace <receipt-blob> <forged-blob>` (loose ref
`refs/replace/88f73cf28e07795427af90edc7e671981d0384a7`) → `git pack-refs --all`.

- Loose dir `.git/refs/replace/` empty after packing; ref present in `.git/packed-refs`.
- `git for-each-ref refs/replace/` **still enumerates the packed ref** (packed-refs is a first-class
  ref store; `--all` is the default packing scope needed and it includes refs/replace).
- Frozen v3 run: `node c2v3.mjs --repo f1 --rev <HEAD> --json` → **exit 2**,
  `verdict=could-not-evaluate detail=refs/replace present in measured clone (refs/replace/88f73cf28e07795427af90edc7e671981d0384a7); refusing`.

## (b) Mid-run TOCTOU — classified; integrity closed, detection gap named

The enumeration is **point-in-time, once**, at `evaluate()` entry (v3 line 527). A replace ref added
after that is never re-enumerated: there is no mid-run refusal path. Probe (`probe.mjs`, replicating
the counter's `git()`/`replaceRefs()` verbatim) on a clean clone:

- enumeration at start: `[]`; then a replace ref grafting the receipt blob was added mid-"run":
  re-enumeration shows it, but the counter-construction read of `HEAD:corpus/evidence/round-35/bidi-firefox/receipt.json`
  returned the **honest bytes**; the same read without the env closure returned the forged bytes —
  the graft was live, the env closure did the work.

Classification: single-host measurement, L1-owned clone. The enumeration is the *loud-refusal* layer;
the continuous *integrity* layer is `GIT_NO_REPLACE_OBJECTS=1` on every spawn (plus the fresh-literal
env, see below). **Residual (named):** a clone doctored mid-measurement would be read honestly but
would **not** be loudly refused — a detection gap, not an integrity gap; the predicate outcome over
forged objects is unreachable through it. Smallest safe correction: none required for the frozen
kill rule ("v3 admits the replace-graft clone or reads through any refs/replace" — neither occurs);
optional round-38 note: re-enumerate `refs/replace/` once more just before the predicate is computed,
or document the point-in-time scope.

Related blind spot, also classified: the enumeration (and `GIT_NO_REPLACE_OBJECTS=1` — verified
empirically and against `gitrepository-layout(5)`) does **not** cover the legacy `.git/info/grafts`
file (grfts rewrite commit *ancestry* only; upstream-git deprecated). Not exploitable here: every v3
read is `git show <40-hex commit>:<path>` tree-anchored at a pinned sha (BASELINE is a constant,
`--rev` is regex-validated 40-hex), and grafts cannot alter tree/blob content reachable at a commit.
Demonstrated: with a graft swapping `HEAD^` to `HEAD~3`, `rev-parse HEAD^` followed the graft even
under `GIT_NO_REPLACE_OBJECTS=1`, but `git show HEAD:<path>` content is unchanged either way.

## (c) Does GIT_NO_REPLACE_OBJECTS=1 alone close the read path? — YES (demonstrated)

On graft clone `f1` (replace ref redirecting the receipt blob):

| read | result |
|---|---|
| `git cat-file blob <orig-sha>` (no env) | `{"schema":"tabi-bidi-receipt-v1","forged":true}` |
| `GIT_NO_REPLACE_OBJECTS=1 git cat-file blob <orig-sha>` | original receipt bytes (`{\n "schema": "tabi-bidi-receipt-v1",\n "f…`) |

Robustness of the closure, both verified:
- **Caller-hostile env**: `GIT_REPLACE_REF_BASE=refs/attack/` exported around a custom-namespace
  graft (`refs/attack/<sha>` written; raw `git show` with the base set returns forged bytes) — the
  counter's `git()` env is a *fresh literal object*, so caller vars are never inherited, and even if
  smuggled in, `GIT_NO_REPLACE_OBJECTS=1` in the same object **dominates** `GIT_REPLACE_REF_BASE`
  (probe read with both set returned honest bytes).
- **Clone-local config**: `git config core.useReplaceRefs true` in the graft clone cannot override
  the env closure (read under the env var returned original bytes with config set; without the env
  var the same read returned forged bytes).

Caveat for the header's wording: the env var closes **replace refs** (loose, packed, any namespace);
it does not disable legacy grafts (ancestry-only, non-exploitable as shown in (b)).

## (d) Worktree/.git-file indirection (`--separate-git-dir`) — DEFEATED

Fixture `f2`: `git clone --separate-git-dir=<gd> <lane> <wt>`; `.git` is a file
(`gitdir: /fast/scratch/.../f2-gitdir`); replace ref added via `--git-dir=<gd>`.

- `git -C <wt> for-each-ref refs/replace/` **follows the gitfile** and enumerates the ref.
- Frozen v3 run: `node c2v3.mjs --repo f2 --rev <HEAD> --json` → **exit 2**, same refusal message.

## Additional basis checked

- Ordering inside `evaluate()`: `resolveCommit` (line 525) runs before the enumeration (527) — a
  `rev-parse` read precedes enumeration, but it is itself env-closed and a 40-hex sha cannot be
  redirected by ancestor rewriting; all blob reads (`loadGate`, entry, receipt, transcripts) happen
  strictly after the refusal. No pre-enumeration content read exists.
- Enumeration failure mode: `for-each-ref` non-zero → `Refusal` (exit 2), so a corrupted ref store
  fails loud, not open.

## Verdict on the claim's kill rule

`v3 admits the replace-graft clone or reads through any refs/replace` — **not reproduced** across
packed refs, gitfile indirection, mid-run graft, custom namespace, and config/env override attempts.
The frozen B1 repair holds. Named residuals (point-in-time enumeration; grafts outside both layers)
are detection/documentation-level, not integrity-level, and do not intersect the frozen kill rule or
predicate.

Impacted axes: **operability** (B1 refusal verified operable, exit 2 on all graft-present fixtures),
**calibration** (each attack's expected outcome confirmed against the frozen receipt semantics; the
one true gap — mid-run detection — classified precisely rather than conflated with integrity).

No tools installed/upgraded this seat (git 2.56.0 host, node host — pre-existing; nothing fetched).

VERDICT ok — C2-B1 refusal holds against all four assigned avenues (packed-refs, mid-run TOCTOU,
env-only closure, separate-git-dir); residuals are detection/documentation-level, not integrity-level;
no amendment to the frozen counter required.
