# R63Sentinel — round 63, wave w1: security / closure audit

Seat: `R63Sentinel` (leaf). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline `f098bcf8843c8a5a723a83995352180f897a6ff9`; instrument/controls freeze
`816592612dd2a8073437c595d3fe3c477125cf3c` (both verified ancestors of HEAD
`e5325ad8805df86cb0109373d2ac695f558c2a1f`, `git merge-base --is-ancestor` exit 0/0).
Host: Linux 7.2.11-arch1-1, Chromium 155.0.8059.84 (`/usr/bin/chromium --version`), node v24.21.0.
Scratch: `/fast/scratch/hyaku/tabi-r63/R63Sentinel` (deleted before yield; see §Cleanup).
Receipts: `.ufo/waves/round-63/w1/R63Sentinel/` (`INDEX.json` carries size+sha256 of every file there).

All claimed pins were re-hashed from the worktree at the end of the audit and still match
`claims.json:17-27`: driver `b00efd59…6c040`, counter `08470569…d7178`, mutate `4bf6e614…1fb`,
make-negatives `598a19da…2eb`, old-generation `1ee9cda2…4c8`, mutants `5f0efd8f…1c8c`,
s166b `78bd40dc…2d1`, s167 `51a7efdb…b99`. Pinned paths are clean in `git status`.

## What I ran (exact argv, cwd, exit)

| # | argv | cwd | exit |
|---|---|---|---|
| R1 | `./sample-run.sh` → `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-loopback-round63.mjs --scratch /fast/scratch/hyaku/tabi-r63/R63Sentinel/run1/scratch --out /fast/scratch/hyaku/tabi-r63/R63Sentinel/run1/out/receipt.json --nonce tabi-r63-sentinel-w1 --http-port 19499 --cdp-port 19500` | `/fast/scratch/hyaku/tabi-r63/R63Sentinel` | 0 |
| R2 | `./sample-run2.sh` → same driver, `run2/scratch`, `run2/out/receipt.json`, `--nonce tabi-r63-sentinel-w1b`, ports `19499/19500` | `/fast/scratch/hyaku/tabi-r63/R63Sentinel` | 0 |
| S-A | `HOME=/fast/scratch/hyaku/tabi-r63/R63Sentinel/symtest/mimichome node …/chrome-cdp-loopback-round63.mjs --scratch …/symtest/link --out …/symtest/out/notjson.txt --nonce tabi-r63-symlink-a --http-port 19501 --cdp-port 19502` | `/fast/scratch/hyaku/tabi-r63/R63Sentinel` | 2 |
| S-B | same as S-A with `--out …/symtest/out/receipt.json --nonce tabi-r63-symlink-b` | same | 0 |
| S-C | same driver `--scratch …/symtest/refused-scratch --out …/symtest/out/bad.txt --nonce tabi-r63-refused --http-port 19503 --cdp-port 19504` | same | 2 |
| N | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs <receipt> --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot .ufo/waves/round-63/controls/smoke --json` | lane root | live 0; 10 negatives 1 each |
| D | `./durability.sh` (read-only `git cat-file -e`/`ls-tree`/`status`/`diff`) | lane root | 0 |

## 1. Launch block — what the frozen bytes actually do

| Check | Frozen bytes | Result |
|---|---|---|
| HOME redirected under per-run scratch | `runHome = path.join(scratchDir,'home-'+launchToken)` L98; child env `HOME: runHome` L219 (and the `--version` probe L216) | PASS |
| XDG_CONFIG_HOME redirected under scratch | `runXdgConfig = path.join(runHome,'.config')` L99; `XDG_CONFIG_HOME: runXdgConfig` L216/L219 | PASS |
| profile dir token-keyed and inside scratch | token `crypto.randomBytes(6).toString('hex')` L96; `profileDir = validateProfile(scratchDir, launchToken, path.join(scratchDir,'profile-'+launchToken))` L97; `inside()` L62 + `includes('profile-'+token)` L63 | PASS (see F9: the containment test is tautological given L97) |
| `--disable-extensions` in argv | L190 | PASS; observed in live child argv (`samples/run2-browser-argv.txt`) |
| `--remote-debugging-address=127.0.0.1` in argv | L187 | PASS; live listener bound `127.0.0.1:19500` only (`samples/run2-ssl-2.txt`), never `0.0.0.0` |
| no user profile path is read | complete fs surface of the driver: `statSync(s)` L49 (the given scratch), `existsSync('/usr/bin/chromium')` L85, `readFileSync(SELF)` L181. `os.homedir()` L50 only builds the *rejection* comparison path `~/.config/chromium`; no I/O on it | PASS |

One static gap: the child env is `{...process.env, HOME, XDG_CONFIG_HOME, TMPDIR}` (L216/L219), so every
other XDG variable the host exports is inherited — `XDG_CACHE_HOME=/home/vgpnk/.cache`,
`XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_RUNTIME_DIR` (host env, recorded, not read from any profile). See F3.

## 2. Live run on my ports, with mid-run sampling

R1 and R2 both exit 0 with `predicate: true`, `failures: []`, `sweeps {preLaunch:0, midRun:13, postKill:0}`,
`teardown {survivors:[], portProbes:{fixture:"closed",devtools:"closed"}, postKillCurl:{fixture:7,devtools:7}}`
(`run1-receipt.json` sha256 `34743224…f979`, `run2-receipt.json` `d23cadfe…eb2e`).

**ps.** 22 samples in R1, 24 in R2 at 0.10–0.12 s. 11 chromium processes carry
`--user-data-dir=<scratch>/profile-<token>` (13 at the receipt's mid-run sweep). Every child argv in every
sample was scanned for `/home/vgpnk`: **zero hits** — no operator path appears in any audited child argv.
Live argv carries `--headless=new --remote-debugging-port --remote-debugging-address=127.0.0.1
--user-data-dir=<scratch>/profile-<token> --disable-extensions --disable-smooth-scrolling`.

**/proc/<pid>/environ — measured limitation.** All 55 sampled chromium processes expose a zero-length
environ (`-r-------- … 0 bytes`; `tr '\0' '\n' < /proc/PID/environ` returns 0 bytes, exit 0,
`samples/run2-netservice-environ-ls.txt` + `…-environ-err.txt`). A control read of an ordinary
same-user process in the same session returns its HOME/PATH, so the sampler works; the zero-length region is
specific to the Chromium processes (mechanism not established — [INFERENCE] it is cleared by Chromium itself). The effective environment therefore cannot be read directly during the run. It is confirmed
*behaviourally* instead: crashpad wrote
`<scratch>/home-<token>/.config/chromium/Crash Reports/settings.dat` at 16:05:39 (XDG_CONFIG_HOME reached
the child), Chromium's own temp dirs `org.chromium.Chromium.*` appear in the scratch root at 16:05:39
(TMPDIR reached the child), and `profile-<token>/` is under the scratch and mode `0700`.

**Egress (ss -tnp) — the finding of this audit.** During both runs the browser's NetworkService
(`--type=utility --utility-sub-type=network.mojom.NetworkService`, pid 1587142 in R2) held established TCP
connections to non-loopback IPv6 peers, and only in the first ~1 s of the run:

| run | samples in-set rows | peers (in this seat's pid set) |
|---|---|---|
| R1 | 19 rows / 22 samples | `[2600:1900:4110:86f::]:80`, `[2001:4860:4829:7700::]:443`, `[2800:3f0:4003:c0f::54]:443`, `[2800:3f0:4004:80e::200e]:443` |
| R2 | 19 rows / 24 samples | `[2600:1900:4110:86f::]:80`, `[2001:4860:482a:7700::]:443`, `[2800:3f0:4003:c0f::54]:443`, `[2800:3f0:4004:80e::200e]:443` |

Rows are attributed to this seat only when the citing pid is in that sample's `profile-<token>` pid set
(`egress.json`; rows from other seats' concurrent chromium instances are classified `inSeatPidSet:false`
and excluded). The fixture server itself logged only `/` and `/favicon.ico` from `127.0.0.1:19499`, so these
are Chromium's own connections, not page requests. The counter has no field that could see them.

## 3. Teardown

Receipt-level (both runs): `survivors: []`, `postKillSweepCount: 0`, both probes `closed`, both
`curl` probes exit 7, `midRun 13`, and the driver's own `teardown-closure` failure is absent.
Independent re-check after each run, and again after S-B:

- `ps -eo pid,args | grep -E '49964c7c22db|68b925852aff|713f099e2ae8'` → no process (all three launch tokens).
- `ss -ltn` on 19499/19500/19501/19502 → no listeners.
- `curl --noproxy '*' --max-time 2 http://127.0.0.1:<p>/` → exit 7 for all four ports.

## 4. Symlink / realpath residual

`inside()` is purely lexical: `path.resolve` on both sides, no `fs.realpathSync` (L38-43). `validateScratch`
mkdirs the given path (L48), `statSync`s it (L49) and compares lexical strings against
`path.join(os.homedir(),'.config','chromium')` (L50).

Demonstrated entirely inside my scratch, with `HOME` pointed at a mimic config root (no operator path was
created, read or traversed):

- S-A: `--scratch …/symtest/link`, where `link → …/mimichome/.config/chromium/nested`, is **accepted**;
  the run is refused only later, at `--out`, exit 2, `detail: "--out must be a .json path"`.
- S-B: same symlinked scratch with a valid `--out` runs to `exit 0`, `predicate: true`, and materialises
  `fixture.html` (1334 B), `home-<token>/`, `profile-<token>/`, two `org.chromium.Chromium.*` temp dirs and
  `server-log.json` under the **realpath**, i.e. inside the mimic "default profile root".
  `{lexical_inside:false, realpath_inside:true}` for the same pair.
- S-C: a refused invocation (exit 2) still **creates** the `--scratch` directory, because `mkdirSync` (L48)
  precedes `validateOut` (L58).

Residual, stated without exploiting operator paths: the guard cannot enforce "scratch is not inside the
default Chromium profile root" against a symlinked ancestor; a caller who can place a symlink can cause run
fixture/profile/crash bytes to be written into that tree. It is a hygiene guard, not a trust boundary —
no operator file is read by the driver, and the bypass needs local control of the scratch path.

## 5. Artifact durability (freeze commit `8165926`)

Every instrument/control path cited by `claims.json` **is tracked** at the freeze commit and clean in the
worktree: driver, all five counters, `mutants-r63.json`, both pinned sources (and the extra
`s166-mdn-wheel.html`), `controls/{mutation/matrix.json,mutation/matrix.stdout,negatives/index.json,
old-generation/result.json,selfassessment-before.json,.command.json,.stderr}`, the six
`no-work/*.command.json` plus their stdout/stderr, `controls/smoke/*`, `scripts/check-selfassessment.mjs`,
`scripts/check-secondary-round62.mjs`. (Full table with capture time: `durability-commit-table.txt`.)

**Cited paths NOT tracked at `8165926`** (all post-freeze evidence, all still untracked now):

- `corpus/evidence/round63/chromium-wheel-scroll/{MANIFEST.txt,receipt.json,a-wheel-down.png,b-wheel-up.png,c-swallow.png,d-release.png,run1.stdout,run1.stderr}`
- `corpus/evidence/round63/chromium-wheel-scroll/stability/{receipt-run2.json,a…d PNGs,run2.stdout,run2.stderr}` — **15 paths** under the prefix. The untracked `MANIFEST.txt` self-verifies (`sha256sum -c` OK for all 14 peers) and pins the driver hash; the cold-run PNG identity it records holds (a/b/c identical, d identical across the stability twin).
- `corpus/knowledge/chromium-wheel-scroll-round-63.md`
- `.ufo/waves/round-63/counters/compare-stability-r63.mjs` — the stability comparator named only as "the stability comparison" in `claims.json:16`; it is neither in `pins` nor tracked (F6).

**Inherited r62 artifact C2 must commit** (untracked, absent from `8165926`):

- `.ufo/waves/round-62/w1/R62Scout/commands.json` — **1 388 366 B**, sha256
  `e9b673d70685b317f33f12bb91556e62f27f27aa62185121670ce8e56a2e34d7` (the only missing sibling of that
  directory at the freeze tree; the other seven are tracked).
- Its manifest appeared during the wave and is also untracked:
  `.ufo/waves/round-62/w1/R62Scout/MANIFEST.txt` — 1 105 B, sha256
  `f6ea0a0d6e4135004664a01f66b03a18d4758b4cd5a71fd89d9397c0e8103697`; every listed digest matches,
  including `e9b673d7…` for `commands.json`.

**Worktree at the audit snapshot** (`durability-status.txt`, captured 2026-11-04T16:11:59-03:00, HEAD
`e5325ad8`): 733 `??` + 6 ` M` (LOG.md, SCORECARD.md, SKILL.md, corpus/QUALITY.md, corpus/README.md,
corpus/SOURCES.md); 714 of the untracked paths are under `.ufo/waves/round-63/w1/`. Four minutes later the
same count read 836 `??` / 6 ` M`, and the first status read in this seat (before my 16:05 run) showed
55 `??` and 0 ` M` — the lane is being edited concurrently, so these numbers are point-in-time facts. m3 (v4, `scripts/check-selfassessment.mjs:57-87`) classifies each status row
against the measured revision tree and counts the real residue **once per block**, so C2's `mismatches 0`
requires the landing revision to carry all of these bytes: at this snapshot the clean-worktree precondition
of C2 killRule 4 is unmet (F7).

Also observed in the frozen-byte comparison (`claims.json` is the contract):

- C2's correction **is** present and append-only: `SCORECARD.md:3473` cites the stale `SCORECARD.md:3427`
  (`44/44` for the v21 meter), names `scripts/check-secondary-round62.mjs`'s 9-case oracle; the only
  SCORECARD change is `git diff --numstat` = `46  0` (46 insertions, 0 deletions).
- Aux counts disagree: `claims.json:85` says "142 could-not-evaluate and 58 superseded", while the
  pre-declared after-row `SCORECARD.md:3465` says "194 could-not-evaluate and 58 superseded" (F10).
- `scripts/check-selfassessment.mjs` at HEAD is clean and hashes `005bd45ac44aa8fc0d81c453b38e0bd7aacee1527432da50eb5fd9d7aee8a48d`
  (blob at the freeze commit `db0767d7d1ab7e2a0609213aa715925a69825ce9`, 55 933 B) — but `pins` has no
  entry for it, so killRule 1 (`claims.json:79`) is enforceable only via the freeze tree (F5).

Evidence integrity of the scored receipt: `corpus/evidence/round63/chromium-wheel-scroll/receipt.json`
records `driverSha256 = b00efd59…6c040` (the pin) and the four recorded PNG hashes match the bytes on disk
(`a/b/c = c8de4967…5b9a`, 14 275 B each; `d = 1bc648c8…e0`, 14 359 B). I did not re-score it.

## Controls re-run (attack, not rebuild)

The ten committed negatives were re-run against the frozen counter from the committed live smoke receipt:
pristine live → exit 0, predicate true, 0 findings; **10/10 negatives → exit 1 with exactly one expected
finding each** (`negatives-rerun.json`): `launch-guards, producer-verdict ×2, scroll-arithmetic,
wheellog-sequence, delta-y-passthrough, cancelation, shot-bytes, survivors, nonce-binding`. The
`survivors` and `launch-guards` refusals still fire on the security-relevant fields.

## Findings by severity (no fixes applied)

**F1 MEDIUM — browser egress outside loopback during the audited run.**
Attacks `scripts/chrome-cdp-loopback-round63.mjs:186-191` (argv: `--disable-background-networking`,
`--disable-component-update`, `--disable-sync` are the only network limits; no resolver/proxy/netns
confinement) and the claim's limit text `claims.json:63` ("Loopback fixture only … no third-party site").
Evidence: `egress.json` — 19 in-set ESTAB rows per run to four non-loopback IPv6 peers, both runs, all
within the first second of the run; not visible in `serverLog` and not testable by any counter field.
Impact: the wheel predicate is untouched, but the receipt cannot be read as proof of network isolation, and
any future statement that the run was loopback-only would be false as measured. Bytes transferred were not
measured (no root, no capture).

**F2 LOW — lexical-only scratch containment; symlink bypass.**
`inside()` at `scripts/chrome-cdp-loopback-round63.mjs:38-43` resolves paths lexically and never
`realpath`s; the refusal at L51 therefore cannot see a symlinked ancestor. Demonstrated S-A/S-B above
(exit 2 only at a later argument; exit 0 and real writes under the realpath). Residual: run
fixture/profile/crash bytes can be written into the default Chromium profile root via an alias; no operator
file is read.

**F3 LOW — only HOME / XDG_CONFIG_HOME / TMPDIR are redirected.**
`{...process.env, HOME, XDG_CONFIG_HOME, TMPDIR}` at L216/L219 leaves `XDG_CACHE_HOME`,
`XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_RUNTIME_DIR` pointing at the operator's directories (host env
recorded). No write outside the scratch was confirmed (cache fell under `profile-<token>/Default/Cache`
because of `--user-data-dir`), but the containment statement is narrower than "XDG is redirected".

**F4 LOW — a refused invocation still mutates the filesystem.**
`fs.mkdirSync(s,{recursive:true})` at L48 runs before `validateOut` at L58; S-C exited 2 and created
`refused-scratch/`. Any "refusal performs no mutation" statement would be wrong.

**F5 LOW — C2's gate pin is missing from `pins`.**
`claims.json:79` ("bytes differ from the frozen pin") vs `pins` at `claims.json:17-27`, which has no
`scripts/check-selfassessment.mjs` entry. The only binding is the freeze-tree blob
`db0767d7…`/sha256 `005bd45a…`. Not a kill by itself; a reviewer cannot enforce the rule from `pins` alone.

**F6 LOW — the stability comparator is unpinned and untracked.**
`.ufo/waves/round-63/counters/compare-stability-r63.mjs` produces scored evidence named in
`claims.json:16`, yet it is absent from `pins` and from `8165926`, so a post-freeze change to it is
undetectable. The compared fields themselves survive in the two receipts, which limits the blast radius.

**F7 LOW/MEDIUM — C2's clean-worktree precondition is unmet at the snapshot.**
733 `??` + 6 ` M` at 16:11:59 (`durability-status.txt`); `claims.json:82` (killRule 4) makes an after-run
on a dirty worktree *could-not-evaluate*. The r62 pair (`commands.json` + `MANIFEST.txt`) is still
untracked; so are 15 round-63 evidence paths, the knowledge entry and the comparator. All must be in the
landing revision, not merely on disk.

**F8 INFO — `/proc/<pid>/environ` is unreadable-by-content for Chromium.**
All 55 sampled chromium processes report a zero-length environ; the assigned direct readback (HOME/XDG
from the child) is therefore *not available*, and the pass in §1/§2 rests on the frozen source plus the
three on-disk effects. Recorded so nobody mistakes this for a clean direct check.

**F9 INFO — `validateProfile` cannot fail.**
L61-65 tests `inside(profileDir, scratch)` and `includes('profile-'+token)` on the exact path constructed
at L97 from the same two values; containment is enforced solely by `validateScratch`. Defence-in-depth
no-op, not a defect in isolation.

**F10 INFO — aux-count drift between claim and SCORECARD.**
`claims.json:85` (142 could-not-evaluate) vs `SCORECARD.md:3465` (194). One of the two will be wrong when
the landing gate reports its own number.

## Skipped / not exercised

- UDP/QUIC egress: `ss -tnp` only (as assigned); no UDP sample, no packet capture, no byte counts.
- No read of any operator profile/cookie/session content or metadata: I never listed or statted
  `~/.config/chromium`, `~/.cache/chromium`, or any browser store. Host env variables were read only for
  presence/paths.
- The 8 exact-line mutants, the cold-run stability comparison and the scored after-run belong to other
  seats; not re-run here.
- No corrective edit was made to any frozen file, control, or lane document.

## Cleanup

Scratch `/fast/scratch/hyaku/tabi-r63/R63Sentinel` removed after the report and receipts were written;
nothing of mine is left outside `.ufo/waves/round-63/w1/R63Sentinel/` and `…/w1/R63Sentinel.md`.

**VERDICT:** closure mechanics pass (env redirected to scratch, devtools loopback-only, survivors 0, all three tokens gone, ports exit 7, all 10 negatives still red), but C1 is not loopback-isolated as its limits read — the browser reached four non-loopback IPv6 peers in both runs — the scratch guard is lexical-only and symlink-bypassable, and C2's landing precondition (clean worktree, cited bytes tracked) is unmet at the 16:11:59 snapshot.
