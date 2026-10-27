# SentinelScope2 — tabi round 36 / w2 — falsification of w1 SentinelScope A7 (`refs/replace`) and A8 (process cleanup)

- **Round / wave**: tabi 36, attempt 2, w2 (FALSIFY). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
- **Freeze**: `2e7b7a8920bff47fae6f75c3d06e48e37767099e`; wave-1 landed `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7` (S125 cell + companions, S142 row + method entry). Neither file is in this seat's attack surface, and the counter bytes are unchanged at the landing, so every run below used the **freeze bytes**: `c2-firefox-bidi-v2.mjs` sha256 `15910c59d40a8e7b708e73b206dca3dfcc2db38ef29a9a81d668b07ef9e2b764` (== `frozenDigests`); `scripts/check-bidi-runtime.mjs` read at REV hashes `370e8e95…` (the counter's `GATE_SHA256`). Read first: `.ufo/waves/round-36/claims.json`, then `w1/SentinelScope/report.md` A7/A8.
- **Scratch**: `/fast/scratch/hyaku/tabi-r36/SentinelScope2` (deleted at the end). Fixture clone: `git clone --shared` of the lane; `rev-parse --show-toplevel` asserted = the clone before any write. The only mutating git was `hash-object -w`, `commit-tree`, `replace` and `replace -d` **inside that scratch clone**. No tool was installed or upgraded.

## Summary

| # | w1 claim | w2 verdict | severity |
|---|---|---|---|
| A7-1 | C2's `git()` omits `GIT_NO_REPLACE_OBJECTS` (C1 sets it); a replace ref substitutes what C2 reads | **CONFIRMED and extended.** The replace ref redirects every read: an entry-blob replace flips the predicate **both ways**, a commit-level replace keeps `out.rev` printing the pinned REV, and the caller's `GIT_NO_REPLACE_OBJECTS=1` **cannot** mitigate because `git()` replaces the environment with a literal. Not reachable through the canonical `measure.sh` clone today (0 replace refs copied). | **medium** for `--repo <worktree>` / mirror / ref-fetched repos; gap-only for the canonical clone |
| A8-1 | teardown sends SIGTERM and deletes scratch 500 ms later, no exit wait, no SIGKILL | **PARTLY REFUTED, PARTLY CONFIRMED.** Normal exit: 0 processes and 0 scratch dirs left, 5/5 live runs (w1's re-creation inference not observed). Abnormal exit (SIGTERM to the node process with the session live): **3 processes + 1 scratch dir leak**, reproduced twice; the counter has no signal/exit handler. | **low** |
| — | (new, info) | When entry/receipt findings short-circuit the live leg, `binding` is still set to `"live session failed: null"` — a live failure that never happened. Predicate unaffected. | info |

---

## A7 — untrusted records: does `refs/replace` redirect the C2 counter's `git show`?

### A7.1 The read path (frozen bytes)

- `c2-firefox-bidi-v2.mjs:98-100` — `git()` builds its own environment:
  `env: { PATH: process.env.PATH, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' }`.
  **No `GIT_NO_REPLACE_OBJECTS`, no `GIT_GRAFT_FILE`, no `-c core.commitGraph=false`.**
- `c1-adjacency-sweep-v4.mjs:122` — the sibling counter runs the same binary with
  `env: { ...ENV, GIT_NO_REPLACE_OBJECTS: '1' }` and `-c core.commitGraph=false`. The two counters
  read one REV through different object-resolution rules: the asymmetry w1 flagged is real and still present at the landing.
- Every C2 read — entry (`:458`), `SOURCES.md`, `LESSONS`, the receipt and each transcript via `blob()`
  (`:496-514`, `:108`), and the gate source (`:439`) — goes through this one `git show`.

### A7.2 Git-level experiment (scratch clone of the lane)

Honest entry blob at the freeze: `a6cf16e088d7d606a00fdda7924682129e1af46a` (content sha256 `43b4cfce…`). Forge: the honest entry with one extra first line `source: S999 (sentinel-scope2 scratch forge — an unregistered id, no URL, first source: line)` (the counter reads only the **first** `/^source:/i` line, so the s1 witness drops). Forged blob `17274c0c9d72b7ff232f162196143bb32cb4fb08` (content sha256 `9843a443…`).

| git invocation | entry bytes read at `REV` |
|---|---|
| `git show REV:ENTRY` under **exactly the counter's `git()` env** (replace ref `a6cf16e0→17274c0c` present) | **`9843a443…` (forged)** |
| same env **+ `GIT_NO_REPLACE_OBJECTS=1`** | `43b4cfce…` (honest) |
| `git --no-replace-objects show REV:ENTRY` | `43b4cfce…` (honest) |
| plain `git show` with `GIT_NO_REPLACE_OBJECTS=1` exported in the parent shell | `43b4cfce…` (honest) |

So the variable is the right lever **for git**, and it works when git inherits it. The counter's child git does not inherit it (A7.1).

### A7.3 Counter runs (frozen bytes, `--repo` = the scratch clone)

`node c2-firefox-bidi-v2.mjs --repo <clone> --rev <REV> --json`, `TMPDIR` under the seat scratch.

| run | REV | repo state | exit | admitted | entryFinding | predicate |
|---|---|---|---|---|---|---|
| 1 `A-R-control` | freeze | no replace refs | 0 | **16/17**, egress 0, live ok | null | **true** |
| 2 `B-R-entry-forged` | freeze | `replace a6cf16e0→17274c0c` (forged entry blob) | 1 | 0 | `s1-source-row` | **false** |
| 3 `C-R-entry-forged-parenv` | freeze | same + **parent `GIT_NO_REPLACE_OBJECTS=1`** | 1 | 0 | `s1-source-row` | **false** (byte-identical outcome to run 2) |
| 4 `D0-REVF-committed-broken` | `68854848…` (REVF) | no replace refs | 1 | 0 | `s1-source-row` | **false** |
| 5 `D1-REVF-entry-replaced` | REVF | `replace 17274c0c→a6cf16e0` (honest entry) | **0** | **16/17**, egress 0, live ok | null | **true** |
| 6 `E-REVF-replaced-parenv` | REVF | same + **parent `GIT_NO_REPLACE_OBJECTS=1`** | **0** | 16/17, egress 0 | null | **true** |
| 7 `G-R-commit-replaced` | freeze | `replace <freeze-commit>→c4e846b9` (same tree, no parent) | 1 | 0 | `s1-source-row` | **false**, while `out.rev` printed **`2e7b7a89…`** |

REVF was created in the scratch clone as the freeze tree with the ENTRY blob swapped for the forged blob (`commit-tree`, parent = freeze): `688548481b298da35fb4d834500651931ed16cb0`. The committed entry at REVF genuinely fails s1 (run 4, exit 1). One replace ref on that blob turns the **same command at the same REV** into `exit 0 / predicate true / admitted 16` (run 5). The reproducer recreated an equivalent REVF (`852f1ace…`, different identity/timestamp) with identical outcomes for runs 1–7.

Run 7 is the sharper variant: replacing the **commit** object leaves `resolveCommit()` printing the pinned `2e7b7a89…` (verified: `git rev-parse '2e7b7a89…^{commit}'` → `2e7b7a89…`) while `git show REV:ENTRY` returns the forged tree's entry. The counter's JSON then carries the frozen REV, the frozen `counterSha256` and the matching `gateSha256` — **nothing in the output distinguishes a substituted read from an honest one**.

### A7.4 Reachability, stated honestly

| clone vehicle | `refs/replace` carried |
|---|---|
| `git clone --shared <repo-with-replace-refs>` (what `measure.sh:19` does) | **0** |
| `git clone --mirror` | 1 |
| `git clone` + `git fetch origin '+refs/replace/*:refs/replace/*'` | 1 |

- The lane itself is clean: `git -C <lane> for-each-ref refs/replace` = 0, no `.git/info/grafts`, no packed replace refs. `measure.sh` clones with `--shared` + `checkout --detach`, so the canonical measurement path **does not** carry a replace ref.
- It **is** reachable whenever `--repo` names a repo the attacker can add refs to: the lane worktree (C1's own `c1-J0` control runs `--repo LANE`), a mirror clone, or any clone that fetched the namespace. It also survives a `--repo` pointed at a mirror.
- No defence at the counter: the gate is digest-pinned (`GATE_SHA256`), but the **entry, receipt and transcripts have no digest binding in the counter** (`claims.json` `frozenDigests` does not list them either), and `measure.sh`'s provenance records only counter/gate/binary digests — not the evidence digests and not `refs/replace`.

### A7.5 Judgment on exploitability

- **w1's "hardening gap, not a hole" — confirmed for the canonical path**: the frozen counter running from a `--shared` clone of the frozen lane reads honest objects; today's receipts are not affected.
- **The premise "the env is seat-controlled" is refuted**: `git()` does not inherit the caller's environment at all, so a seat **cannot** protect a run with `GIT_NO_REPLACE_OBJECTS=1` in its own shell (runs 3 and 6 reproduce the forged read with the variable set). The mitigation only exists if the frozen counter bytes set it — which `frozenDigests` forbid changing this round.
- **The hole is real wherever refs can be planted**: (`a`) a committed failure is certified `predicate true` at an unchanged REV (run 5/6) — the false→true flip that matters, because the claim/report binds REV and a replace ref preserves it; (`b`) a commit-level replace masks the substitution behind the pinned REV in `out.rev` (run 7); (`c`) a planted blob replace can also *break* an honest REV (run 2), so the two counters can disagree about one REV with no cause visible in either receipt.
- **Smallest correction** (round-37 counter amendment; bytes are frozen now): give C2 the same three settings C1 has —
  `env: { …, GIT_NO_REPLACE_OBJECTS: '1', GIT_GRAFT_FILE: '/dev/null' }` and `-c core.commitGraph=false` in `git()`
  — ideally one shared `git()` helper for both counters so the settings cannot drift; and have the counter output (and `measure.sh` provenance) record `for-each-ref refs/replace` **required empty**, plus `sha256(ENTRY)`, `sha256(RECEIPT)` and `sha256(transcript)` at REV, so a substituted read is visible in the receipt itself.

---

## A8 — process cleanup

### A8.1 The cleanup path (frozen bytes, `:303-312`)

```js
clearTimeout(deadline); clearInterval(sampler);
try { ws && ws.close(); } catch {}
if (sessionId) { try { await fetch(`…/session/${sessionId}`, { method: 'DELETE' }); } catch {} }
gd.kill('SIGTERM');
await fx.close();
await sleep(500);
rmSync(scratch, { recursive: true, force: true });
```

No wait on `gd`'s `exit`, no SIGKILL escalation, and no `process.on('SIGTERM'|'SIGINT'|'exit')` anywhere in the file (`grep process.on` → no hits). `gd` is a child of node, not a detached process group.

### A8.2 Normal exit — measured, clean

5 live runs (runs 1, 5, 6 above, the validated `probe-teardown.sh normal`, and `H-R-control-watch`), watching the browser tree restricted to this seat's scratch path at +0 ms, +500 ms and +2500 ms after node exits:

| run | processes at +0 / +500 ms / +2500 ms | `tmp/tabi-r36-*` dirs |
|---|---|---|
| `A-R-control` | 0 / 0 / 0 | none |
| `D1-REVF-entry-replaced` | 0 / 0 / 0 | none |
| `E-REVF-replaced-parenv` | 0 / 0 / 0 | none |
| `H-R-control-watch` | 0 / 0 / 0 | none |
| `probe-teardown.sh normal` | 0 / 0 | 0 (reported at +3 s) |

`runs/H-R-control-watch/watch.log` is the full 400 ms timeline: the browser tree (geckodriver + firefox + crashhelper) is last seen at `1793102122.15`, node exits at `1793102126.07` — **the tree was gone ≥3.9 s before node's own exit**, i.e. teardown completed far inside the 500 ms window on this host. w1's A8-1 inference that a live browser can recreate files after `rmSync` was **not observed**, and the "ignores or delays SIGTERM" branch did not occur in 5/5 normal runs.

### A8.3 Abnormal exit — measured, leaks

`probe-teardown.sh sigterm` starts the frozen counter, waits until the firefox process of *its* session is up, then sends **SIGTERM to the node process only** (the shape of a harness timeout, `kill <pid>`, or systemd `TimeoutStop`):

```
browser tree before kill: 3 processes
processes at +1 s after node exit: 3
processes at +3 s after node exit: 3
3083220 /home/vgpnk/.local/bin/geckodriver --port 45561 --websocket-port 33841 --binary … --profile-root …/tmp/tabi-r36-c2-live-6CKnu8/profiles
3083415 /home/vgpnk/.local/opt/firefox-158.0.1/firefox --marionette -headless … -profile …/tmp/tabi-r36-c2-live-6CKnu8/profiles/rust_mozprofilePQZVUV
3083714 /home/vgpnk/.local/opt/firefox-158.0.1/crashhelper 3083415 9 …/tmp/tabi-r36-c2-live-6CKnu8/tmp/ …
scratch dirs at +3 s: 1
node exit=143
```

The earlier `F-sigterm` run reproduced it on the first try: geckodriver `919884`, firefox `920069`, crashhelper `920340` alive at +1 s and +3 s, scratch `tabi-r36-c2-live-sLWBsW` left behind (`runs/F-sigterm/after_term_{1s,3s}.txt`, `tmpdirs_after.txt`). Both leak sets were killed and both scratch dirs removed by this seat afterwards (verified: no survivors).

So **A8-1 is confirmed, but only on the abnormal-exit path**: node dies with 143 without running `finally`, the browser tree is orphaned (3 processes), and the counter's own `mkdtemp` is leaked. `measure.sh`'s `trap 'rm -rf -- "$S"'` removes the profile directory underneath a still-running browser, which is worse than an empty residue: a live Firefox whose profile was deleted mid-session. On normal completion (the only path `measure.sh` waits for) the teardown is clean on this host.

**Smallest correction**: in `liveRecordFirefox`, register teardown for `SIGTERM`/`SIGINT` (kill the geckodriver **process group**, then `rmSync`), replace the fixed `sleep(500)` with `once(gd,'exit')` raced against ~3 s and then `gd.kill('SIGKILL')`, and move `rmSync` after that exit (or spawn geckodriver `detached: true` and kill `-gd.pid`). Alternatively, keep the sampler running until exit so the egress reading covers the whole session rather than stopping before teardown.

---

## Info observation (new)

Runs 2, 3, 4 and 7 show `binding: "live session failed: null"`. The live leg is skipped when `entryFinding || receiptFinding` (`:542`), but the binding block runs `if (!rf && runs.length)` (`:554`) and reaches `else if (!liveRec) out.binding = \`live session failed: ${liveError}\`` with `liveError === null`. The predicate is already false, so nothing is admitted; the defect is that the JSON attributes a non-existent live failure. Smallest correction: `else if (!liveRec && !out.entryFinding)`.

---

## Operability verdict for this axis

The instruments remain operable from the freeze bytes: digest match on every run, the live Firefox leg completes headless (`browserVersion 158.0.1`, `geckodriverVersion 0.37.1`, `egressNonLoopback 0` over 6–8 samples, `pids 12`), the gate digest check passes at REV, and normal-exit teardown leaves no process and no scratch directory (5/5). The two assigned gaps are real but neither touches the canonical `measure.sh` clone: A7 needs a repo carrying `refs/replace` (not copied by `--shared`), and A8 needs an abnormal kill of node. Both are small, local, round-37 corrections.

## Reproducers (this seat dir)

- `probes/probe-replace-c2.sh <scratch>` — clones the lane, forges the entry, creates blob/commit replace refs, prints the git-level reads under the counter's env, and runs the frozen counter in 7 configurations (runs 1–7 above); validated end-to-end (fresh clone, equivalent REVF `852f1ace…`, identical exits/predicates).
- `probes/probe-teardown.sh normal|sigterm <scratch>` — the A8 normal-vs-SIGTERM comparison; both modes validated.
- `runs/<tag>/{out.json,err.txt,exit,watch.log,after0.txt,after500ms.txt,after2500ms.txt,tmpdirs_after.txt}` — raw outputs of the runs cited. `H-R-control-watch/watch.log` holds the full 400 ms process timeline (`node_exit` is written as the last line); the A–G `watch.log` files are empty because that runner revision printed the watcher to stdout — their cleanup evidence is the `after*` / `tmpdirs_after.txt` files.
- `runs/run.sh` — the invocation + process watcher (the copy used for A–G; the `H` run used the same script with the `watch.log` tee fix, which is the copy kept here).
- `fixtures/entry-honest.md`, `fixtures/entry-forged.md` — the bytes the blob replace swaps.

Seat scratch `/fast/scratch/hyaku/tabi-r36/SentinelScope2` was deleted after these files were copied out. REV ids `68854848…`/`c4e846b9…` live only in that deleted clone; the reproducer recreates equivalent commits (same trees, different identity/timestamp).

VERDICT finding — A7-1 is confirmed and stronger than w1 judged: under the counter's own literal git env a `refs/replace` ref redirects every read, an entry-blob replace flips the predicate true→false (freeze) and false→true (a committed failing REV certified `predicate true`, exit 0, admitted 16, live egress 0), a commit-level replace keeps `out.rev` on the pinned freeze REV, and the caller's `GIT_NO_REPLACE_OBJECTS=1` cannot mitigate because `git()` replaces the environment — smallest correction: C2's `git()` must carry C1's `GIT_NO_REPLACE_OBJECTS=1`, `GIT_GRAFT_FILE=/dev/null` and `-c core.commitGraph=false`, plus a recorded empty `for-each-ref refs/replace` and evidence digests in provenance. A8-1 is confirmed only on abnormal exit — SIGTERM to node leaks 3 browser processes and the scratch dir (twice); normal exit left 0 processes and 0 dirs in 5/5 live runs, with the browser tree gone ≥3.9 s before node exit — smallest correction: a signal/exit handler plus an `exit`-waited SIGTERM→SIGKILL teardown before `rmSync`.
