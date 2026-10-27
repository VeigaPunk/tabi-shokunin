# LabratC2 — v3 survivor-check isolation probe

Seat: `LabratC2` (executor, one bounded labrat probe) · lane: tabi · round 37 (attempt 1), wave w1
Milestone: C2 · Judged on: calibration
Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · frozen counter bytes: `99437d29de036415a9f2d0524343617a3b19988a`

## Item under test

Hypothesis as dispatched: *"scratchSurvivors matches ANY /proc cmdline containing the scratch dir
string, so an unrelated host process whose argv embeds that path string would false-positive."*

Frozen subject under test: `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`, lines 465–476
(B2 survivor check). Verified the worktree file is byte-identical to the frozen commit
(`sha256 eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019` = `claims.json`
`frozenDigests.c2`), and extracted the function **verbatim from the frozen blob** for every probe
(no hand-copy — `git show 99437d29…:…/c2-firefox-bidi-v3.mjs`, sliced the function text, evaluated
it via `new Function`):

```js
function scratchSurvivors(scratch) {
  const out = [];
  for (const pid of readdirSync('/proc')) {
    if (!/^[0-9]+$/.test(pid)) continue;
    let cmd = '';
    try { cmd = readFileSync(`/proc/${pid}/cmdline`, 'utf8').replace(/\0/g, ' '); } catch { continue; }
    if (cmd.includes(scratch)) out.push(Number(pid));
  }
  return out;
}
```

Scope discipline: all probes ran in this seat's scratch only
(`/fast/scratch/hyaku/tabi-r37/w1/LabratC2/`), `TMPDIR` set explicitly to `$S/tmp`. The lane's real
measurement run was never touched; no fixture repo was created (no git mutation of any kind); the
lane repo, fleet root files and sibling repos were not modified.

## (1) Reading the function — what it actually is

`scratchSurvivors` is a **path-string scan, not an own-tree scan**. It reads every `/proc/<pid>/cmdline`
on the host and keeps any pid whose command line *contains* the session scratch path as a **plain
substring** (`cmd.includes(scratch)`). Three properties follow directly:

- **Not own-tree scoped.** Contrast `treePids(rootPid)` (line 447), which the *same file* uses for the
  A5 egress sampler and which is properly ancestry-scoped from the geckodriver pid. The survivor check
  deliberately does not use it: it is path-string scoped. So the hypothesis's premise is **true as
  stated** — the match is not restricted to the counter's own descendants.
- **Substring, not path-component.** `cmd.includes(scratch)` matches the scratch path anywhere in the
  cmdline, including as a **prefix of a longer token** (probe2 `V3-longer-token`: argv
  `…/tabi-r36-c2-live-YexDW3-backup` was flagged by a scan for `…/tabi-r36-c2-live-YexDW3`).
- **Read errors are swallowed.** `catch { continue; }` — other users' processes are skipped silently
  (measured on this host: 4 of 3791 pids had unreadable cmdlines). This is a **false-negative** leak,
  not a false-positive one.

## (2) Probability window

The scratch path is `mkdtempSync(join(SCRATCH_BASE, 'tabi-r36-c2-live-'))` (line 222), where
`SCRATCH_BASE = process.env.TMPDIR || tmpdir()` (line 116). Measured on this host:

- `mkdtemp` suffix length is **6**; observed suffixes `wHsxpI, ptTIRV, LynK5D, LLyD2P, MBUKRD, QFw2z3,
  aXru1c, YexDW3, wjqHmj, 9ZN9G9, tqL7cs, B6UfvM` — mixed alnum, consistent with the C-library
  `mkdtemp` 62-character alphabet `[A-Za-z0-9]`.
- Suffix space = **62⁶ = 56,800,235,584 ≈ 2^35.7**. Not the whole defence, though: the *full* matched
  string also contains the base dir (`/fast/scratch/hyaku/tabi-r37/L1/m/tmp` under the lane's
  `measure.sh`, which sets `TMPDIR="$S/tmp"` with `S=…/tabi-r37/L1/m`), the fixed prefix
  `tabi-r36-c2-live-`, and the 6 random chars.

**The probability argument is weaker than the entropy argument suggests.** The random suffix is not
what protects the scan; what protects it is that the scratch path is *unguessable by an unrelated
process that never saw it*. An unrelated process only embeds the string if it **learned** the path —
and there are three realistic learning channels on this host, all of which I reproduced:

| Channel | Reproduced? | Evidence |
|---|---|---|
| Shell glob / directory listing of `$TMPDIR` expands the path into a child's argv | **Yes** | probe3 `W1-glob-expanded-to-A`: `bash -c 'exec -a "$(ls -d $A)" sleep 30'` → **flagged** |
| A monitoring/agent tool invoked with `--watch=<scratch>` (path as an argument) | **Yes** | probe3 `W2-unrelated-tool-mentions-path`: argv `monitor-agent --watch=$A/state -f /dev/null` → **flagged** |
| Random collision with an unrelated process's argv | No — negligible | base rate 0 matches over 3712 host pids (probe2 `V5-base-rate`), suffix space 2^35.7 |

The third channel is the one the dispatched hypothesis was implicitly about, and it is indeed
negligible. But the first two channels are **not** collisions at all — they are *knowledge*, and they
make the "random suffix" defence irrelevant.

## (3) Controlled false-positive — reproduced, in my scratch only

The dispatched probe was: create a scratch dir, start `sleep 30` with a renamed argv containing that
path string, run an equivalent scan, see whether it flags. **It flags.**

`evidence/probe-output.json` — step `4-unrelated-decoy-scan`:

```
"decoyPid": 4112985,
"foundPids": [4112985],
"cmdlines": ["/…/tmp/tabi-r36-c2-live-aXru1c/unrelated-host-tool --profile=/…/tabi-r36-c2-live-aXru1c/x 30"],
"decoyFlagged": true
```

The hypothesis is **confirmed**: an unrelated host process whose argv embeds the scratch path string
is indistinguishable to `scratchSurvivors` from a real survivor of the browser session.

Two aggravating factors, both measured:

**(a) The false positive is not merely counted — the process is SIGKILLed.** The frozen `finally`
block (lines 338–342) iterates the survivor list and `process.kill(pid, 'SIGKILL')`s each one. Probe
step `5-finally-block-vs-decoy`:

```
"survivorsCount": 1, "killedPids": [4112985], "decoyKilled": true, "decoyAliveAfter": false
```

So an unrelated process is not merely miscounted — it is **killed by the counter**. The blast radius
is every same-uid host process whose argv happens to mention the path. On this host the counter's
own history shows the realistic case is not hypothetical: a round-36 seat's abandoned geckodriver +
firefox tree (`/fast/scratch/hyaku/tabi-r36/ExecEgressLive/tmp/tabi-r36-c2-live-aGpVDp/…`) was still
resident and still carrying a `tabi-r36-c2-live-` path when I measured the host base rate.

**(b) The counter's own process is not flagged** (probe step `7-self-and-other-pids`:
`selfFlagged: false`, `selfPid: 4110443`) — because the counter's argv does not embed the scratch
path. That is the one saving grace: the check cannot kill the counter itself. But the
**cross-session** case is asymmetric in the wrong direction — see (4).

## (4) Isolation that does hold, and the one that does not

**Cross-run isolation holds (good).** Two concurrent sessions with distinct mkdtemp suffixes do not
cross-match: probe2 `V2-cross-run-isolation` — sibling session B's geckodriver-like child
(`…/tabi-r36-c2-live-wjqHmj/profiles/geckodriver`) is found by a scan for B and **not** by a scan for
A (`siblingInScanA: false`, `siblingInScanB: true`). The 6-char random suffix does separate
sessions from each other.

**The real leak is against the *sibling lane* and the *previous round*, not against a random
process.** Because the match is a **substring of the full path**, and because the lane's
`measure.sh` puts every seat's `TMPDIR` under a **shared** per-round base
(`/fast/scratch/hyaku/tabi-r37/L1/m/tmp`), a process that embeds *any* path under that base which
shares the `tabi-r36-c2-live-` prefix is matched. The lane's own naming prefix is the constant
`tabi-r36-c2-live-` across rounds — a round-36 residue and a round-37 session differ only in the 6
random chars, and any process that learned the round-36 path but not the round-37 one is correctly
not matched. So the boundary that matters in practice is: **path learned exactly** → flagged.

**The scan also sees exactly what it should for the real browser (no false negatives there).**
probe4 launched the lane's pinned Firefox 158.0.1 headless (`about:blank`, no network target) with
`-profile $A/profiles/p1`:

```
"allMentioningA": [ {pid: 843830, cmdline: "…/firefox -profile $A/profiles/p1 about:blank"},
                    {pid: 843983, cmdline: "…/crashhelper 843830 9 $A/tmp/ 11 …"} ],
"scanFound": [843830, 843983],
"scanFoundMatchesMentioning": true,
"mentionedButNotFlagged": []
```

The scan is complete for the live session — every process whose cmdline names the scratch is found,
and none is missed. Note the `crashhelper` also carries the path and is correctly included. This
is the behaviour the B2 amendment intends, and it works.

## (5) A complementary gap found while probing (not the dispatched hypothesis)

A **zombie** browser child escapes the scan entirely: a zombie's `/proc/<pid>/cmdline` is **empty**
(0 bytes). Measured in `evidence/probe5-output.json`:

```
child_pid=1481580 state=S cmdline_len=9 cmdline=b'sleep\x0030\x00'
zombie_state=Z zombie_cmdline_len=0 zombie_cmdline=b''
```

`cmd.includes(scratch)` on an empty cmdline is false → a zombie is never counted as a survivor, and
never SIGKILLed (it needs no killing, it is already dead — but it also is not reaped by the counter,
so it lingers as a defunct entry under the session). This is a **false-negative** in the survivor
count, i.e. a survivor that the predicate's `live.survivors == 0` term cannot see. It does not
threaten the honest floor (the honest receipt shows `survivors: 0`) but it is the mirror image of
the dispatched hypothesis and belongs in the same finding.

## (6) Count semantics of the frozen `finally` block

`rec.survivors` is set to the length of the **pre-kill** list concatenated with the post-kill list
(lines 339–342). A process that was found and successfully killed **still counts** toward
`rec.survivors`. Measured (`V4-count-semantics`):

```
"foundAtTeardown": 1, "recSurvivors": 1, "killedVictim": true, "survivorsTermPasses": false
```

So `live.survivors == 0` means "no process was *seen* with the path at teardown", not "no process
*survived*". This is arguably the stricter reading and is safe for the honest floor — but it means
the term is also satisfied by the false-positive channel above: an unrelated process that merely
mentions the path flips `live.survivors` to 1 and **fails the whole predicate**, i.e. the
false-positive makes the counter refuse an honest state (false-negative on the claim, exit 1),
rather than admit a bad one.

Direction check on the predicate (line 683):
`out.predicate = !entryFinding && !receiptFinding && !binding && failing === 0 && admitted >= TARGET
&& egressNonLoopback === 0 && out.survivors === 0`.

A false-positive survivor therefore **fails closed** (refuses), it does not launder bad evidence.
The security-relevant direction is safe. The damage is to **operability/calibration**, not to
soundness: the counter can spuriously refuse an honest run, and it SIGKILLs an innocent bystander.

## Verdict

**VERDICT finding** — the dispatched hypothesis is **confirmed**, but the classification is
*acceptable isolation with one named, bounded residual*, not a routed defect against the C2 claim.

Reasoning for the classification:

1. **The premise is true**: `scratchSurvivors` matches any `/proc` cmdline containing the scratch
   path string; it is not own-tree scoped (it does not use the `treePids` helper that sits 18 lines
   above it in the same file), and the match is a plain substring, not a path-component match.
2. **The random mkdtemp suffix does isolate sessions from each other** (measured: sibling-session
   cross-match absent), and the probability of a *random* unrelated process colliding is negligible
   (2^35.7 suffix space; 0 base-rate matches over 3712 host pids).
3. **But the "random collision" framing is the wrong threat model.** The realistic channel is
   *knowledge*: a process that learned the path (a `ls`/`glob` of `$TMPDIR`, or an agent invoked
   with the path as an argument — both reproduced here) embeds the exact string and is flagged with
   certainty. The suffix's entropy is irrelevant once the path is known.
4. **The consequence is a kill, not just a count.** The frozen `finally` block SIGKILLs every pid the
   scan returns; the reproduced decoy was killed (`decoyAliveAfter: false`). The blast radius is
   every same-uid process whose argv mentions the path — and this host demonstrably retains
   abandoned `tabi-r36-c2-live-` browser trees across rounds, so path-carrying bystanders are not
   hypothetical.
5. **The direction fails closed.** A false positive makes `live.survivors = 1` → the predicate is
   false → the counter exits 1 and **refuses**. It cannot admit a forged state. So this does not
   violate C2's kill rule ("v3 admits the replace-graft clone…"), which is about admission.
6. **It does not threaten the honest floor in the measured configuration.** The honest control
   receipt `baseline/c2r37-J3-honest-v3.json` records `exit 0`, `predicate true`,
   `{"admitted": 16, "survivors": 0, "egress": 0, "receiptFinding": null, "binding": null}` — a clean
   run with zero survivors, and the lane's `measure.sh` gives the measurement a **private**
   `TMPDIR` (`…/tabi-r37/L1/m/tmp`) so no other seat's process is in the blast radius during the
   measured run.

**Therefore: acceptable isolation (fresh mkdtemp per session + per-session uniqueness), with the
residual that the check is path-string scoped rather than own-tree scoped, so any process that
*learns* the scratch path is both miscounted and SIGKILLed.** Not a routed defect against the C2
claim as frozen; it is a **round-38 candidate** for a narrow amendment — scope the survivor set to
`treePids(gd.pid)` ∪ (pids whose cmdline names the scratch), or simply record survivors without
killing pids that are not descendants of the geckodriver — plus the zombie gap (empty cmdline ⇒
zombie not counted) as a second, opposite-direction hole in the same term.

### Residual risks a round-38 amendment should weigh

- **Residual R1 (false positive, kills a bystander):** reproduced; see §3.
- **Residual R2 (false negative, zombie not counted):** reproduced; see §5.
- **Residual R3 (count semantics):** killed-but-found processes still count toward `rec.survivors`;
  see §6. A survivor term that means "seen at teardown" is stricter than the header's
  "must be gone" wording implies.

### What I did not do

- Did not run the lane's real measurement run, and did not execute the frozen v3 counter end-to-end
  (that is `ExecHonestRe`'s / `RevC2a`'s assignment, not this bounded probe).
- Did not modify any instrument, the lane repo, the fleet root, or any sibling repo. Read-only git
  (`git show`, `git log`) only.
- Did not create a git fixture repo (none needed — the probe needs no commits).
- Did not kill any host process other than my own probe processes. The `firefox`/`geckodriver` tree
  observed under `…/tabi-r36/ExecEgressLive/…` belongs to another seat's round-36 work; it was left
  untouched and is reported here as evidence only.

## Evidence index (this seat's dir)

| File | What it shows |
|---|---|
| `evidence/probe.mjs` | harness; extracts the frozen function bytes and runs steps 1–9 |
| `evidence/probe-output.json` | step 4: unrelated decoy **flagged**; step 5: decoy **SIGKILLed**; step 6: substring-prefix match; step 8: mkdtemp suffix space; step 9: predicate effect |
| `evidence/probe2.mjs` | leak vectors and cross-run isolation |
| `evidence/probe2-output.json` | V2 sibling-session **not** cross-matched; V3 longer-token match; V4 count semantics; V5 host base rate 0/3712 |
| `evidence/probe3.mjs` | realistic knowledge channels |
| `evidence/probe3-output.json` | W1 glob-expanded path **flagged**; W2 `--watch=<path>` tool **flagged**; W4 intended child flagged |
| `evidence/probe4.mjs` | real pinned Firefox 158.0.1 headless (about:blank, no network target) |
| `evidence/probe4-output.json` | scan finds firefox **and** crashhelper; zero missed; no false positives among path-mentioning pids |
| `evidence/probe5.mjs` | zombie cmdline test |
| `evidence/probe5-output.json` | `zombie_state=Z zombie_cmdline_len=0` — zombie escapes the scan |

Frozen counter bytes verified: `sha256 c2-firefox-bidi-v3.mjs = eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019`
(worktree) = `claims.json frozenDigests.c2`; the same value is `git show 99437d29de036415a9f2d0524343617a3b19988a:…`.

Tooling: no installs, no upgrades, no pacman (host-wide pacman guard observed). Only stock `node`
(v24.21.0), `python3`, `git` (read-only) and coreutils were used.

VERDICT finding — the dispatched hypothesis is confirmed: `scratchSurvivors` is path-string scoped
over all of `/proc` (not own-tree scoped), so an unrelated host process whose argv embeds the scratch
path string is flagged and then SIGKILLed by the frozen `finally` block; the random mkdtemp suffix
(62^6 ≈ 2^35.7) separates sessions from each other and makes random collision negligible, but the
realistic channel is knowledge (a `$TMPDIR` glob or a `--watch=<path>` agent — both reproduced), not
collision. Classified acceptable isolation with a named residual, not a routed defect against C2:
the false positive fails closed (it makes `live.survivors` 1 → predicate false → exit 1 refusal, never
an admission), the honest control `c2r37-J3-honest-v3.json` is clean (`survivors 0`, `exit 0`), and
the lane's `measure.sh` gives the measured run a private `TMPDIR`. Two round-38 candidates named:
R1 path-scope false positive that kills a bystander, R2 zombie (empty cmdline) escaping the survivor
count.
