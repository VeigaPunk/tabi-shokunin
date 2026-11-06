adjacent

# R70Connector — sibling overlap scan (tap-gesture surface + live-verifier pattern)

Seat: R70Connector (leaf, read-only). Lane `tabi-shokunin`, round 70, wave w1.
Fleet root `/home/vgpnk/Projects/shokunin`; 20 sibling lanes scanned.
Nothing outside this wave directory was written. No git/jj mutation, no sibling execution,
no claim admission, no PROVINCE edit (claims are frozen; PROVINCE is the integrator's).
Receipt: `.ufo/waves/round-70/w1/R70Connector/scan-receipt.txt` (commands + raw counts).

**Verdict in one line:** no sibling lane holds C1's command surface
(`Input.synthesizeTapGesture` / synthetic tap / touch-vs-mouse tap delivery) — a bounded
absence with a positive control; the C2 pattern (live verifier re-running a pinned browser
driver) has three pinned-instrument prior-art analogues plus one weak live-read analogue in
siblings, and no live browser re-run anywhere; every hit below is reported, none absorbed.

## 1. C1 surface — bounded absence (with controls)

Two scanners, because they disagree on scope and the disagreement is the point: `grep -rIl`
(gitignore not honoured) and `rg -l --hidden --no-ignore` (gitignore not honoured, so `.ufo/`
evidence counts). Both return **zero sibling files** for every C1 pattern.

| pattern | tabi files (positive control) | all 20 sibling lanes |
|---|---|---|
| `synthesizeTapGesture` | 143 (grep) / 142 (rg) | **0 / 0** |
| `synthetic_tap` | 14 / 15 | **0 / 0** |
| `tapCount` | 167 / 120 | **0 / 0** |
| `Input.synthesize` | (tabi reports; 2 fleet-root files) | **0 / 0** |
| `setTouchEmulationEnabled` | 50 | **2 — kotoba only** (row 1's bundle) |
| `EmulateTouchEventsForMouse` | 1 | **0** |
| `Input.pdl` | 81 | **0** (3 fleet-root files) |

Tabi counts exclude this seat's own wave directory, which quotes the patterns in this report.
The one non-zero sibling cell is the same kotoba strings dump as row 1: the omp bundle's CDP
client also calls `Emulation.setTouchEmulationEnabled` (`…strings.txt:1276528`, `:1484468`).

Commands (receipt §1–§2):
`grep -rIl --exclude-dir=.git --exclude-dir=.jj --exclude-dir=node_modules -e <pattern> <lane>-shokunin | wc -l`
`rg -l --hidden --no-ignore -g '!.git' -g '!.jj' -g '!node_modules' -F -e <pattern> <lane>-shokunin | wc -l`

The zero is a *scanned* zero: the same commands return 143/14/167 (grep) and 142/15/120 (rg)
files inside tabi, so the pattern and the traversal work; the negative is about sibling ground,
not about grep. `Input.dispatchMouseEvent` also has zero sibling files (tabi reports only).
The rg/grep gap is tabi's own gitignored `.ufo/` wave copies — it widens the positive control,
not the negative. Both scanners were re-run after this report was written and the numbers were
corrected upward: my own draft had inflated tabi's counts, which is why the seat directory is
excluded by glob in the receipt.

## 2. Rows — reported, not absorbed

All citations verified with `git -C <lane>-shokunin show <pinned head>:<path> | sed -n '<n>p'`
at the **round-69 snapshot heads** (`.ufo/waves/round-69/c1/sibling-heads-r69.tsv`), so each
row is gate-shaped for `scripts/check-sibling-matrix-r69.mjs` if the integrator reuses it.

| # | lane | path:line @ head | quote (≤25 words) | relation to tabi PROVINCE | absorbed? |
|---|---|---|---|---|---|
| 1 | kotoba | `.ufo/round-44/evidence/omp-live-18.12.2-strings.txt:1280609` @ 0344ddae | `await this.#i.send("Input.dispatchTouchEvent", {` | Nearest sibling *bytes* to C1: the omp bundle's own CDP client implements `Input.dispatchTouchEvent` touchStart/touchEnd. It is a vendored binary strings dump used for kotoba's omp surface census — no claim about touch semantics, no tap gesture. | reported; no |
| 2 | revenger | `corpus/SOURCES.md:314` (S299) @ 654d0929 | `CDP exposes a wide range of high-privilege capabilities, so protocol clients are assumed to be trusted.` | Source-level duplicate of tabi S002 (same index URL, different row purpose), already reported by revenger r92 §3. Protocol framing only; revenger's r93 knowledge entry (S496) is the landing-hero sentence. No Input-domain row, and revenger's saved r77 CDP record contains zero `Input.*` calls. | reported; no |
| 3 | game-dev-2d | `corpus/fixtures/run_battery.py:1574` @ 1e033ef0 | `the engine never computes double_click for synthetic` | Cross-substrate analogue of tabi's measured "tapCount 2 = two clicks, each detail 1, no dblclick": a headless engine's synthetic input also yields no derived double-click, and its `r100b_emul` arm carries touch press/release against an emulated-mouse arm. Different substrate (Godot `Input.parse_input_event`), same shape. | reported; no |
| 4 | kagi | `corpus/knowledge/adjacency-breadth.md:128` @ f5977284 | `The live Chrome` ``SingletonSocket`` `may point outside HOME without exposing its target;` | Same Chromium singleton-socket mechanism tabi's C2 verifier bounds at 107 bytes; kagi's predicate is symlink breadth, tabi's is path length. Shared mechanism, disjoint predicates. | reported; no |
| 5 | mado | `.ufo/waves/round-38/receipts/eventq-live-ss.txt:655` @ 24ba2a9d | `u_str LISTEN 0 5 /tmp/org.chromium.Chromium.hWtu2i/SingletonSocket 189441249 * 0 users:(("chromium",pid=3173339,fd=14))` | Host observation of the exact socket path shape tabi's verifier refuses when too long. Evidence, not a claim; mado's PROVINCE names no chromium socket surface. | reported; no |
| 6 | kama | `corpus/knowledge/listener-census.md:56` @ 9b4c7af1 | `session \| `chrome` pid **3080080**, `--remote-debugging-address=127.0.0.1 --remote-debugging-port=9222`` | kama holds **listener-level rows on the CDP endpoint class** tabi's province names (CDP session discipline): the `:9222` row here and the ephemeral `omp` band at `:100` (`45507, 46631, 43775, 44689, 41453, 41819, 34955`). tabi's r69 matrix labels kama `none`; that label is contradicted by evidence. kama's object is listener health, not CDP sessions, so the defensible label is `adjacent`, not `contested`. | reported; no (integrator decides the relabel) |
| 7 | kasegi | `.ufo/waves/round-67/w1/ExecMultiHeadDriver.md:13` @ d16d2124 | `Pin manifest (authored):` ``.ufo/waves/round-67/controls/driver-pins.json`` `— file sha256` | C2 prior art: a verifier that binds the driver's own bytes plus a canonical pins digest and refuses on mismatch (`driver-self-pin` in the 12-name measurement tuple). Non-browser target; kasegi refuses live-target testing (`PROVINCE.md:52`). | reported; no |
| 8 | mori | `.ufo/waves/round-23/falsify/RerunPinnedDriver.md:25` @ 7765969c | `identical to the sealed copy at` ``22772c10…`` `(driver check` ``C13.driver_matches_sealed_bytes`` `= pass)` | C2 prior art: a seat that re-runs a *pinned* instrument exactly once into an absent scratch and checks the driver bytes against the sealed copy. Non-browser (mori measurement driver). | reported; no |
| 9 | kaidoku | `PROVINCE.md:55` @ 0b518f56 (existing contested row) | `self-launched targets: `chromium --headless --remote-debugging-port=9222`, `xvfb-run electron --remote-debugging-port=9223`` | Contested CDP row stands. **New positive:** kaidoku holds the CDP *recipe* as documentation (`corpus/knowledge/2026-10-13-r3-runtime-observation.md`) but ships **no tracked executable launcher** — `git -C kaidoku-shokunin grep -l -F remote-debugging-port 0b518f56 -- '*.mjs' '*.py' '*.sh' '*.js'` → empty, while 126 tracked files mention the flag (PROVINCE, SKILL, corpus knowledge, control fixtures). So tabi's live browser verifier duplicates no sibling instrument; the contested part is the documented surface, not a running one. | reported; no |
| 10 | kotoba | `PROVINCE.md:76` @ 0344ddae | `\| tabi \| none \| 856fa9e1… \| tabi owns browser-session and web-interaction evidence` | **Relation-label contradiction**: kotoba labels tabi `none` and states "it states no split with kotoba on its scope surfaces", while tabi's r69 matrix labels kotoba `adjacent` (citing this same line). Both labels are each lane's judgment; the asymmetry is real and is not smoothed here. | reported; no |
| 11 | souji | `census/operator-sweep-20261019/.staged.json:1` (**worktree only — untracked at e063a2fc**) | `"/tmp/.org.chromium.Chromium.08bFW5", "standing-operator-directive-20261018/19;scratch;age>2h;0-handles"` | souji's `/tmp` census enumerates `.org.chromium.Chromium.*` singleton dirs as a scratch class — the same directory shape tabi's verifier bounds by path length, and the same class tabi must delete from its own scratch. Evidence only; no claim. **Not gate-citable**: `git -C souji-shokunin cat-file -e e063a2fc:census/operator-sweep-20261019/.staged.json` → absent, so this row cannot enter a matrix bound to the r69 snapshot. | reported; no |

Row 6 and row 10 are the only rows that would change tabi's matrix (one relation label, one
contradiction). Rows 1–5, 7–9, 11 add citation-level adjacency without changing a label.
Row 11 is deliberately marked unpinnable: it is real worktree evidence, not a citable row.

## 3. False-positive classes (named so the next scan does not re-chase them)

| term | apparent hit | what it actually is |
|---|---|---|
| `gesture` | kotodama `corpus/knowledge/linguistics/gesture-co-speech-pointing.md` (85 lines) | linguistic co-speech gesture; no browser ground |
| `synthetic` | chousa/souji/mado fixture JSON, `run_battery.py` "synthetic events" | test-fixture sense / engine sense, not CDP synthesis |
| `isTrusted` | game-dev-3d `reports/round-102/sentinel-mcp.md:153` | VS Code workspace-trust API (`this.trust.isTrusted()`) |
| `dblclick` | game-dev-2d `verdicts.json` `--arm=dblclick` | Godot fixture arm name (its comment *is* the analogue, row 3) |
| `touch` | kake `source-wcag22.html`, kagi `navigator.maxTouchPoints` fixtures | WCAG touch-target text; page capability detection |
| `cdp-bridge` | kagi `corpus/knowledge/cdp-bridge-1password.md`, S069/S070 | 1Password credential broker; already ruled a term collision by revenger r92 B5 |
| `Chrome` | kake `reports/round-70` "Chrome for Developers: CrUX" | docs source row, not a browser surface |
| `verify-live` | kaidoku custody-pair transcripts, audio `corpus/live/r83-verifier/` | different meaning (custody pair `--live`; audio verifier dir) |
| `verify-live` (2) | mado `.ufo/waves/round-46/w1/ExecXkbCompile/verify-live.py` | a *live host read* verifier (`hyprctl devices -j`) over keyboard layout, not a browser driver. Weak structural analogue: it re-reads live state instead of a saved receipt |
| `verify-live` (3) | souji `census/operator-sweep-20261019/quarantine-mtimes-t0.tsv:3642` `mr12-verify-live.txt` | a `/tmp` file name in a cleanup census, not an instrument |
| `107` | kagi r16 report, kama r26 report | source id `S107` and a `sed -n '104,107p'` range |

## 4. Structural findings the integrator needs

**4a. Nine sibling heads drifted since the r69 snapshot — and kept moving during this scan.**
The snapshot was captured 2026-11-06T15:46:41-03:00. Two observations minutes apart disagree
with each other as well as with the snapshot, which is the finding: sibling lanes commit while a
scan runs, so a matrix is only bound to the instant it was snapshotted.

| lane | snapshot head | head at scan start | head at receipt write |
|---|---|---|---|
| chousa | 378fda82 | 51a5dee8 | 03b586d1 |
| kagi | f5977284 | 87755829 | f01b729d |
| kama | 9b4c7af1 | 68bb0208 | 99cdb4d6 |
| kasegi | d16d2124 | 7ad3118c | 7ad3118c |
| kumitate | 814068f0 | 4f3a8d63 | 36277d49 |
| mado | 24ba2a9d | af998dcc | af998dcc |
| souji | e063a2fc | 0bf098dd | 0bf098dd |
| tameshi | f256302b | 8876cca5 | ff7a4b06 |
| tsukuroi | 64f45b79 | ffae885f | 3f567898 |

`check-sibling-matrix-r69.mjs` fails `head-not-snapshot` on any row pinned to a live head, so a
round-70 matrix must re-snapshot (one `git -C <lane> rev-parse HEAD` per lane, same TSV shape)
in a single pass and use that instant — never heads read at different times during the round.
Rows 1–10 above are already pinned to the r69 heads and stay valid for the r69 gate.

**4b. Inbound reciprocity at the pinned heads** (`grep -n -i -w tabi PROVINCE.md`, word match as
the gate implements it): only **kake** (8 lines, `:45` carries "contested scope (kagi/tabi/kake)"),
**kengaku** (`:103`) and **kotoba** (`:76`) name tabi at all. The other 17 siblings name tabi
nowhere, so their rows are unconstrained by reciprocity — but kake's row must stay `contested`
and must cite a kake `PROVINCE.md` line.

**4c. The 107-byte singleton-socket bound is tabi-only.** No sibling states the Chromium
`SingletonSocket` path-length limit (every `107`+`socket` hit is a source id or a line range).
tabi's `verify-live-r70.mjs:127-133` is the sole committed statement of the constraint; if a
sibling later launches Chromium under a scratch it will hit the same wall. That is a primitive to
*report* to them, never to absorb — and it is the one item here with forward value beyond r70.

**4d. No sibling holds a live browser re-run.** mori's `RerunPinnedDriver` and kasegi's
`driver-pins.json` are the same *structure* (pinned instrument + bytes check + refusal) over
non-browser substrates; mado's r46 `verify-live.py` is the weakest analogue (a live host read,
no driver pin); revenger/kaidoku hold CDP *observation*, not re-execution. tabi's C2
combination — two cold runs on verifier-drawn nonces and ports, run binding, pinned counter,
cross-run and evidence agreement, refusing a rewritten replay the counter accepts — is not
present in any sibling lane at the pinned heads.

**4e. The verifier's port draw shares the host's ephemeral pool with live omp sessions.**
`verify-live-r70.mjs:104` draws ports by binding port 0 and closing (`freePort()`), i.e. the
kernel's ephemeral range — not a reserved band. kama's host-wide census records that same pool
already carrying seven `omp` session listeners (`45507, 46631, 43775, 44689, 41453, 41819,
34955`; `corpus/knowledge/listener-census.md:100` @ 9b4c7af1). The close→Chromium-bind window is
a TOCTOU gap: a collision surfaces as a driver failure (Chromium cannot bind, or the fixture
server's origin disagrees), not as a port-conflict message. If a cold run ever fails with no
other explanation, check the drawn port against kama's census class before calling it a driver
defect. This is a *report* item for the integrator, not a change to the frozen verifier.

## 5. Risks of this report

- **Row 1 is bytes, not a claim.** kotoba's file is a strings dump of the omp binary; citing it
  as "a sibling implementation of touch dispatch" would overstate. It shows the *client the fleet
  already ships* can dispatch touch events, which is why tabi's measurement is re-derivable rather
  than exotic — not that kotoba owns any part of C1.
- **Row 6 is a foreign chrome.** kama's `:9222` listener is the fixed musketeer profile lease
  (kagi/kake contested), not a port tabi's verifier can draw. Reading it as tabi's endpoint would
  overclaim; the row is about the *endpoint class*, and the label change is `none`→`adjacent` at
  most. The band that actually matters for collisions is the kernel ephemeral pool (§4e), where
  kama's `:100` row is the live evidence.
- **Row 3 generalizes across substrates.** "Synthetic input yields no derived gesture" is now
  observed twice (Chromium tap → no `dblclick`; Godot synthetic pair → no `double_click`). If
  tabi's knowledge entry states it for browsers, it is exact; if it states it generally, the
  second substrate must be cited to game-dev-2d, not claimed as tabi's own.
- **Snapshot staleness (4a).** A row copied into a round-70 matrix without re-snapshotting fails
  the gate for the wrong reason, which the r69 lesson already classes as "not a kill".

## 6. Verification the integrator can run

```
# unchanged r69 matrix still binds (read-only)
node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv \
  --fleet /home/vgpnk/Projects/shokunin --json

# any row's quote, at its pinned head
git -C /home/vgpnk/Projects/shokunin/kama-shokunin show 9b4c7af1:corpus/knowledge/listener-census.md | sed -n '56p'
git -C /home/vgpnk/Projects/shokunin/game-dev-2d-shokunin show 1e033ef0:corpus/fixtures/run_battery.py | sed -n '1574p'
git -C /home/vgpnk/Projects/shokunin/kotoba-shokunin show 0344ddae:.ufo/round-44/evidence/omp-live-18.12.2-strings.txt | sed -n '1280609p'

# the absence claim, with its positive control
grep -rIl --exclude-dir=.git --exclude-dir=.jj --exclude-dir=node_modules -e synthesizeTapGesture \
  /home/vgpnk/Projects/shokunin | grep -v '/tabi-shokunin/' | grep -v R70Connector | wc -l   # 0
grep -rIl --exclude-dir=.git --exclude-dir=.jj --exclude-dir=node_modules -e synthesizeTapGesture \
  /home/vgpnk/Projects/shokunin/tabi-shokunin | grep -v R70Connector | wc -l                 # 143
```

## 7. Tooling

No installs, no upgrades, no pacman transactions. Scratch `/fast/scratch/hyaku/tabi-r70/R70Connector/`
was created empty and deleted before yielding; nothing was written there.
