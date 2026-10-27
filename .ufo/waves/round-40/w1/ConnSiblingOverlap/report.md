# ConnSiblingOverlap — Tabi round 40 C1 vs sibling browser-process / socket evidence

Scope: read-only sibling PROVINCE/knowledge overlap with Tabi C1 (Playwright Firefox loopback process/socket observation). No Tabi or sibling file edited; no browser launched; the measured command was not run; no git mutation (only `show`, `status`, `log`, `ls-tree`, `rev-parse`). Leaf lane; no subagents.

Freeze: `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`. Tabi HEAD: `c925d9230c3f7908152fad7bc0f0dd1cdd9af45f`. Baseline: `a1b1e939048885d2793759b7f49b10c5c820d70d`.

## 1. Axes

- **coverage**: which sibling surfaces observe the same objects (listener sockets, owned process trees, `/proc/net`, residue) as C1, and which C1 observation gaps they expose.
- **adjacency**: who owns each surface, and whether the boundary is written in Tabi's adjacency corpus.

## 2. Revisions read

`git -C <lane> status --porcelain -- PROVINCE.md` was empty for every lane named below, so the working-tree PROVINCE.md equals HEAD. Knowledge and tool files were read with `git show HEAD:<path>` because kama and souji have untracked churn.

| Lane | HEAD | Read at HEAD |
|---|---|---|
| tabi | c925d92 | PROVINCE.md; scripts/*; counters; corpus/adjacency.tsv |
| kama | 83c1c4a5 | PROVINCE.md (lines 1-40); corpus/knowledge/loopback-listener-ownership.md; corpus/knowledge/listener-census.md (§0.1); tools/kama-probe.sh (`ss -ltnpH`, line 246); tools/kama-llamacpp-live.py (`_listen_inodes` 619, `port_owned_by` 641, `verify_live` 1143, call sites 2262, 2316, 2323, 2363) |
| souji | 2cdea68 | PROVINCE.md (lines 120-175); corpus/knowledge/process-residue-observations.md; tools/souji-proc-census.sh (presence only) |
| kengaku | 3a54833 | PROVINCE.md (lines 13-17, 114, 147-157, 320-361) |
| mado | 3b55b6e9 | PROVINCE.md (lines 25-112, 325); quality/counters/c1-r40-live-v2.py (presence only) |
| kaidoku | c29360e3 | PROVINCE.md (lines 50-56, 136-140) |
| kagi | 69b61db | PROVINCE.md (lines 43, 59) |
| kake | 1a481315 | PROVINCE.md (lines 327-329, 355-360) |
| kumitate | 14057f3e | PROVINCE.md (lines 321-324) |
| mori, tsukuroi, tameshi, others | various | keyword sweep only (see §8) |

Frozen C1 bytes were hashed in the Tabi working tree and checked against the freeze commit. All four match `claims.json` `frozenDigests`. None of the four has commits after `07e99cf`, and `git status --porcelain -- scripts .ufo/waves/round-40/counters` is empty.

```
scripts/measure-c1-round40.mjs                         a0e564c7d18bf75d  (HEAD = 07e99cf)
scripts/playwright-firefox-egress-round39.mjs          1f8a15f00a85c7a8  (HEAD = 07e99cf)
.ufo/waves/round-40/counters/c1-sample-span-v3.mjs     0b452eac24280353  (HEAD = 07e99cf)
scripts/selftest-measure-c1-round40.mjs                5a0b702d90c37628  (HEAD = 07e99cf)
git log --oneline 07e99cf..HEAD -- <those four files>  -> 0 lines
```

## 3. Overlap map

| Sibling (HEAD) | Owned surface | Overlap with C1 | Boundary | Row in Tabi `corpus/adjacency.tsv`? |
|---|---|---|---|---|
| **kama** (83c1c4a5) | Loopback listener ownership. `tools/kama-probe.sh listeners` uses `ss -ltnpH`. `tools/kama-llamacpp-live.py` joins a LISTEN row to the child's `/proc/<pid>/fd` `socket:[inode]` through `/proc/net/tcp{,6}` (`_listen_inodes`, `port_owned_by`). Knowledge: `corpus/knowledge/loopback-listener-ownership.md`, `listener-census.md` §0.1. | **Same mechanism** as C1's proc surface: inode join against `/proc/net/tcp{,6}`, and the same per-word IPv6 address reversal. Tabi's decoder agrees with every kama vector (§7.1). Kama re-runs ownership before the captures, before each probe, after the probes and after the witness (`verify_live` at HEAD lines 2262, 2316, 2323, 2363). C1 samples ownership on a 100 ms tick and does not re-verify the owned set (§5.1). Kama's knowledge records that wildcard sockets can answer loopback connections (§5.2). | Kama owns serving and endpoint ports, not browser connections. Kama never claims an installed server. | **No.** |
| **souji** (2cdea68) | Own-uid `/proc` residue listing: `tools/souji-proc-census.sh`; cwd/argv/fd `(deleted)` rules; no `environ`; never signals; self and descendants excluded. Knowledge: `process-residue-observations.md`. | Same class as C1's survivor check (`existsSync('/proc/<pid>')` over the owned tree). Souji's residue rules could cross-check C1's scratch leftovers, but are not wired to C1. | Souji lists only. Reaping needs operator approval and a fresh (pid, starttime, boot_id). Other uids are mori's. | **No.** |
| **kengaku** (3a54833) | Read-only `ss -ltn 'sport = :8791'` probe (PROVINCE.md line 114) and `/proc/1299/cmdline` process pin (line 157). | Uses the correct `-l` form for listeners. No overlap in method beyond the `ss` surface. | Read-only probes; no reap or serving. | No. |
| **mado** (3b55b6e9) | `quality/counters/c1-r40-live-v2.py` (PROVINCE.md line 325): a "C1 round-40" counter run under `bwrap --unshare-all --cap-drop ALL`, fresh `/proc`, tmpfs `/tmp`; no bwrap gives `SETUP` exit 2, no silent downgrade. | **Label collision.** Two lanes both have a "C1 round 40" process/socket counter. Only mado enforces network isolation by sandbox. Tabi's C1 has no sandbox (§5.4). | Different lane, different claim. Receipts must carry the lane prefix. | No. |
| **kumitate** (14057f3e) | `cap-run.mjs` (PROVINCE.md lines 321-324): `systemd-run` + `env -i` + `bwrap --ro-bind / / --unshare-pid --die-with-parent --new-session --clearenv`. No `--unshare-net`. | Sandbox precedent only. | Runner, not a socket observer. | No. |
| **kake** (1a481315) | `c57_idresolver_gate.py` runs its tool under `bwrap --unshare-net --unshare-pid`; `sealed_count_v2.py` runs with no network (PROVINCE.md lines 327-329). | **Enforced** network-namespace precedent. C1 only observes (§5.4). | Kake's counter, not C1's. | No. |
| **kaidoku** (c29360e3) | Self-launched CDP targets on `:9222`; Playwright `recordHar` channel; `capture-electron-scenario` refusal ("Playwright handshake") (PROVINCE.md lines 53, 137). | Playwright use. Tabi's adjacency already has `recorded-har-producer-channel` and `cdp-live-target-census` rows. | Kaidoku owns capture of its own targets, not socket or process observation. | Partly (CDP and HAR rows exist; no C1 row). |
| **kagi** (69b61db) / **kake** | `the-musketeer` Chrome profile lease on CDP `9222` is contested between kagi and kake (kagi PROVINCE.md line 43; kake line 35). | Not C1. C1 uses Playwright Firefox with Juggler, not CDP, and no port 9222. The fixture port is kernel-chosen (`server.listen(0,'127.0.0.1')`, driver line 246). | Lease ownership unresolved. Already `contested-open` in `adjacency.tsv`. | Yes (`musketeer-cdp-9222-profile-lease`). |
| mori, tsukuroi, tameshi | `/proc/pressure/*`, `/proc/self/mounts`, `/proc/meminfo` | No object overlap with C1 (no socket or owned tree). | n/a | n/a |

## 4. Boundary summary

- No sibling owns Playwright Firefox loopback observation, the owned-process-tree binding, or the `ss`/`proc` socket surfaces C1 uses. Each sibling that reads sockets or `/proc` owns a different object: serving ports, residue, sandboxed counters, CDP targets.
- The closest owned mechanism is **kama's listener ownership**: the same inode join, the same IPv6 decode, and a stricter re-verification cadence.
- Two fleet mechanisms C1 does not use are **enforced network isolation** (mado `bwrap --unshare-all`; kake `--unshare-net`) and **repeated ownership re-verification** (kama `verify_live`).
- The `C1 round 40` label is used by mado for an unrelated counter. Any receipt or scorecard row must carry the lane prefix.
- The `ss -tnp` versus `ss -ltnp` trap is documented by kama (`listener-census.md` §0.1, "`ss -tnp` cannot see listeners"). C1's driver uses `ss -Htnp` (line 120), so it has this trap (§5.2).

## 5. Gaps in C1 observation (static read of frozen driver, Tabi HEAD)

These are boundary facts about what the frozen predicate can and cannot see. I did not amend or widen the predicate.

### 5.1 Owned tree is a launch-time snapshot

- `scripts/playwright-firefox-egress-round39.mjs:254-255`: `roots = ownedRoots(process.pid)` and `tree0 = ownedTree(roots...)`, taken once after `await sleep(400)` following `firefox.launch` (line 251-253).
- Line 266: `rec.owned = { ..., tree: tree0, ... }`.
- Line 279: the sampler reads `rec.owned.tree`. Line 344: the final sweep reads `rec.owned.tree`. Line 345: survivors are `rec.owned.tree.filter(existsSync)`.
- `ownedTree(` has one call site: line 255 (definition at line 95). `ownedRoots` is also called only at line 254 (definition at line 91).
- Effect: a Firefox descendant created after the ~400 ms snapshot is never sampled, never attributed, and never counted as a survivor. The predicate "per-run owned tree is nonempty" can pass on a partial tree.
- [INFERENCE] Whether Firefox spawns relevant children after the 400 ms snapshot was not tested. No browser was run (§8).

### 5.2 Owned listening sockets are invisible to both socket surfaces

- `observeSs` runs `ss -Htnp` (line 120), with no `-l` and no `-a`. Verified locally (§7.2): a live process's LISTEN socket, wildcard or loopback, does not appear in `ss -Htnp`. It does appear in `ss -Htlnp`.
- `observeProc` skips state `0A` (LISTEN) rows (around line 216, `if (row.st === '0A') continue;`, inside `observeProc` at line 202).
- Only the fixture port's closure is checked (lines 348-349, `ss -Hlt` substring match). Other owned listeners are not observed. Kama's knowledge (`loopback-listener-ownership.md`) records that wildcard listeners answer loopback connections, so a "loopback-only" reading would miss them.

### 5.3 Observation is TCP-only

- `parseProcNet` (line 162) reads `/proc/net/tcp` and `/proc/net/tcp6` only. `ss -Htnp` is TCP-only. There is no UDP surface (`/proc/net/udp{,6}`, `ss -u`).
- Effect: nonLoopback = 0 says nothing about UDP egress (DNS to a non-loopback resolver, QUIC). [INFERENCE] Firefox DNS behaviour on this host was not measured.

### 5.4 Observation, not enforcement; 100 ms sampling

- `scripts/measure-c1-round40.mjs` line 18 runs the driver with no network namespace and no sandbox. Sibling precedent (mado `bwrap --unshare-all`; kake `--unshare-net`) enforces the network boundary. Tabi's C1 only observes it.
- `SAMPLE_MS = 100` (driver line 39). A TCP connection that opens and closes between two ticks is never sampled. Zero nonLoopback counts therefore mean "not observed at 100 ms ticks", not "no egress".

### 5.5 Smaller notes

- Survivors use `existsSync('/proc/<pid>')` (line 345). A zombie with a `/proc` entry counts as a survivor. This is fail-closed. [INFERENCE] Not observed in a run.
- `portClosed` (line 349) matches `:${port}` as a substring of `ss -Hlt` output, so `:1234` matches `:12345`. Fail-closed, not a false pass.

## 6. Adjacency recommendations (for the lead; not edited)

1. Add `corpus/adjacency.tsv` rows for C1's surfaces:
   - `listener-ownership-proc-inode`: kama `tools/kama-llamacpp-live.py` `port_owned_by` vs Tabi driver `observeProc`. Disposition: `split-declared`. Kama owns serving ports; Tabi owns browser connections.
   - `process-residue-own-uid`: souji `tools/souji-proc-census.sh` vs Tabi survivor check. Disposition: `split-declared`. Souji lists; Tabi counts survivors of its own tree; no reap.
   - `c1-round40-label`: mado `quality/counters/c1-r40-live-v2.py` vs Tabi C1. Disposition: `split-declared` by lane prefix.
2. If the lead wants a repeated ownership gate, kama's `verify_live` cadence is the sibling precedent (§3, §4).
3. If the lead wants enforced egress, mado's `bwrap --unshare-all` arm is the precedent (§5.4). That is not in the frozen predicate; adding it would need a new freeze.

## 7. Exact local checks (scratch deleted afterward)

### 7.1 Decoder agrees with kama IPv6 vectors

Tabi's `decodeProcIp` and `isLoopbackHexRem` (driver lines 175-200) were extracted verbatim and run on the vectors kama documents in `loopback-listener-ownership.md`, plus two kama suffix traps.

```
v4 127.0.0.1 (kama: 0100007F)                      got=true   want=true
v4 10.0.0.1                                        got=false  want=false
v6 ::1 (kama: 00000000000000000000000001000000)    got=true   want=true
v6 ::ffff:127.0.0.1 (kama mapped row)              got=true   want=true
v6 ::ffff:127.1.2.3                                got=true   want=true
v6 ::ffff:10.0.0.1                                 got=false  want=false
v6 2001:db8::1 (kama suffix trap)                  got=false  want=false
v6 fe80::1 (kama suffix trap)                      got=false  want=false
v6 :: wildcard                                     got=false  want=false
all-agree: true
```

Limit: this is one decoder run in a single Bun eval against the vectors kama documents. It is not an independent check of kama's parser, and it did not exercise a live browser's socket table.

### 7.2 `ss` listener visibility (scratch Node listeners on this host)

A scratch Node process listened on `127.0.0.1:42363` and `0.0.0.0:34689`, with one client connection to the loopback port. Raw `ss` output:

```
ss -Htnp "sport = :42363 or dport = :42363"  -> ESTAB 127.0.0.1:41244 127.0.0.1:42363 users:(("MainThread",pid=2083657,fd=23))
                                                ESTAB 127.0.0.1:42363 127.0.0.1:41244 users:(("MainThread",pid=2083657,fd=24))
ss -Htnp "sport = :42363"                    -> ESTAB 127.0.0.1:42363 127.0.0.1:41244 (accepted side only; no LISTEN row)
ss -Htlnp "sport = :42363"                   -> LISTEN 127.0.0.1:42363 0.0.0.0:* users:(("MainThread",pid=2083657,fd=21))
ss -Htnp "sport = :34689"                    -> (empty)
ss -Htlnp "sport = :34689"                   -> LISTEN 0.0.0.0:34689 0.0.0.0:* users:(("MainThread",pid=2083657,fd=22))
```

So the driver's `ss -Htnp` surface never returns an owned LISTEN socket, wildcard or loopback. The scratch listener had exited by the time I checked (`pgrep` empty).

## 8. Limitations

- No browser was launched and the measured command was not run. §5.1's runtime effect is static-code reasoning, not observed.
- The sibling PROVINCE sweep was a keyword search across 20 PROVINCE files plus targeted reads of the lanes in §2. It is not a full reading of every sibling PROVINCE (about 369 KB combined). Lanes not named in §3 were checked only for `/proc`, `ss`, loopback, Playwright, CDP, and socket keywords.
- Sibling `ls-tree` and `show` checks confirm HEAD presence of cited tools and knowledge. I did not run any sibling tool.
- Kama and souji have untracked churn (`.ufo/scopes/`, `census/round-34/records/`). Those files were not read.
- Keyword sweeps are capped at about 20 matches per file by the search tool. Results were confirmed by targeted reads, not relied on as exhaustive.
- The report path requested in the seat spec is `w1/ConnSiblingOverlap/report.md`. The second `w1/ConnSiblingOverlap.md` path in the item text was not created, since the scope allows reports only under `<SeatName>/report.md`.

## 9. Tooling

No tool was installed, upgraded, or removed. Existing `ss`, `node`, and Bun (eval) were used. No pacman action. Nothing written to `~/.local/bin` or any PATH directory.

## 10. Cleanup

Scratch `/fast/scratch/hyaku/tabi-r40/ConnSiblingOverlap/` was used for the §7 checks and was deleted before yield. The scratch listener exited on its own timer. No file outside this report was written.

VERDICT finding — Sibling overlap is mechanism-level, not ownership-level. Kama's listener-ownership join and souji's own-uid residue list are the closest sibling surfaces, and no sibling owns Playwright Firefox loopback observation. The frozen C1 driver has four observation boundaries that its predicate does not state: a launch-time owned tree (§5.1), blind spots for owned LISTEN sockets (§5.2, verified §7.2), TCP-only observation (§5.3), and observation-only egress at 100 ms ticks with no network sandbox (§5.4). The C1 predicate itself was not evaluated here.
