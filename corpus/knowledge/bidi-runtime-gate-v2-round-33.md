source: S127 (ChromeDriver 154's new-session id — `chrome/test/chromedriver/util.cc:39-43` at tag 154.0.8037.97, call site `commands.cc:96-97`, surfaces `session_commands.cc:288-289` and `:372`; row drafted by `.ufo/waves/round-33/w1/ScribeSrcSession/row-S127.txt`); S128 (the Arch chromium launcher at package 154.0.8037.97-1 — PKGBUILD commit 871c2ad960ad54af03579cb90a1c9656485ea598, chromium-launcher v8 `launcher.c` at commit a7ed2cb89fe28c91199524c828866201c9d6b5e5: `/etc/chromium-flags.conf` at `:15`, `$XDG_CONFIG_HOME` else `$HOME/.config` at `:18-29`, system-then-user concatenation `:93-94`, `execv(CHROMIUM_BINARY)` at `:124`; row drafted by `.ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md`); S129 (Chromium Linux sandbox layers at tag 154.0.8037.97 and the scope of `--no-sandbox` — `sandbox/linux/README.md` §Overall Design `:20-27`, §setuid(2) `:36-52`, and the switch sentence at `sandbox/policy/switches.cc:42-44`; row drafted by `.ufo/waves/round-33/w1/ScribeSrcSandbox/source-row-S129.md`); scripts/check-bidi-runtime.mjs (the gate this entry is about: v1 at b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd, sha256 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393; v2 sha256 in `.ufo/waves/round-33/measure/provenance-*.txt`, live-leg patch at `.ufo/waves/round-33/w1/ExecLiveLeg/live.patch`); .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs (the frozen battery, sha256 51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b, 11 variants: H0–H2 honest, F1–F8 forgeries)
verified-at: 2026-10-26 — battery and self-test readings in §7 (ExecGateV2 scratch commit `b04b1fee`; the lane measurement at the round-33 measured revision is `.ufo/waves/round-33/measure/c2-at-*.json`)
recheck: `node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev "$(git rev-parse HEAD)" --json` (run from the lane root; offline, no `--live`; exit 0 = the frozen predicate is met) and `node scripts/check-bidi-runtime.mjs --selftest --json`

# WebDriver BiDi runtime gate v2 — the receipt leg as a forgery check

The round-32 entry (`corpus/knowledge/webdriver-bidi-runtime-round-32.md`) holds the capability
measurements: seventeen matrix rows, sixteen of them `yes` against one host build and one loopback
fixture. This entry holds the other half — whether the gate that re-checks the receipt can tell a
measured session from a receipt that merely looks measured. Round 32 found five construction
families that the frozen gate admits (`corpus/lessons/round-32.md` M2,
`.ufo/waves/round-32/w1/CritC1Forgery.md` D1–D5, named in `.ufo/waves/round-33/claims.json` claim
C2) plus a decorated-cell population drop (`.ufo/waves/round-32/w2/MutC1Entry.md`); round 33 froze
them as eight variants in a battery (F1–F8) and three honest layouts (H0–H2), and this entry
records what v1 scores, what v2 must refuse, and where the falsification stops.

Scope: one host build (Chromium / ChromeDriver 154.0.8037.97), offline receipt leg only. Every
number below carries the command that produced it; the receipts are committed before this entry.

## 1. What gate v1 accepted [observation]

The frozen battery, run at the baseline revision, reads:

```
$ jq -c '{rev,gateSha256,honest,forgeriesAccepted,forgeriesTotal,acceptedForgeries,digestLiterals,selftest,predicate}' \
    .ufo/waves/round-33/baseline/c2-J1-do-nothing.json
{"rev":"b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd",
 "gateSha256":"2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393",
 "honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":8,"forgeriesTotal":8,
 "acceptedForgeries":["F1","F2","F3","F4","F5","F6","F7","F8"],"digestLiterals":[],
 "selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27"},
 "predicate":false}

$ jq -r '.results | to_entries[] | [.key,.value.exit,.value.population,.value.admitted,.value.failing] | @tsv' \
    .ufo/waves/round-33/baseline/c2-J1-do-nothing.json
H0	0	16	16	0
H1	0	16	16	0
H2	0	16	16	0
F1	0	16	16	0
F2	0	16	16	0
F3	0	16	16	0
F4	0	16	16	0
F5	0	16	16	0
F6	0	16	16	0
F7	0	15	15	0
F8	0	16	16	0
```

The gate bytes these runs executed are the baseline's, not the worktree's:

```
$ git show b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd:scripts/check-bidi-runtime.mjs | sha256sum
2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  -
$ sha256sum .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs
51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b  .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs
```

Per construction, and why the frozen checks let it through (battery definitions at
`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:25-42`; gate line numbers are v1):

| # | Construction | v1 reading | The check that does not fire |
|---|---|---|---|
| F1 | two `goldenLines()` synthetic transcripts (distinct bases) with the honest run1's real first screenshot spliced in, real browser/driver version strings, honest driver | exit 0, 16/16 | `t3-binding` compares the runs' first screenshots to each other and the `chromedriverVersion` strings (`scripts/check-bidi-runtime.mjs:550-551`); it never reads the session id (`"X"`, `:628`), the base URL or a context id (`"C1"`, `:601`) for coherence with the transcript they sit in |
| F2 | every `yes` row of the entry relabelled `R2` | exit 0, 16/16 | the population is built by cell text, `(r.cells[3] \|\| "").toLowerCase() === "yes"` (`:508`); each row is then evaluated by id, so sixteen listings of one id score sixteen admissions (M2) |
| F3 | one transcript path cited for both runs | exit 0, 16/16 | runs are checked for count and digests (`:529`, `:534`), not for distinctness of path or of digest |
| F4 | run2 = byte copy of run1 at a new path, `transcriptSha256` updated | exit 0, 16/16 | `:534` only requires each run's digest to match its own blob; two identical blobs each match themselves |
| F5 | receipt `driver` = byte copy of the gate at a new path, `driverSha256` = the gate's digest | exit 0, 16/16 | `:528` refuses one literal path, `receiptObj.driver === "scripts/check-bidi-runtime.mjs"`; the same bytes under another path pass |
| F6 | receipt `driver` = a one-line `export * from "…/check-bidi-runtime.mjs"` | exit 0, 16/16 | same check as F5 plus digest equality; a re-export has its own digest and is "a driver" |
| F7 | first `yes` row's Measured cell reads `yes (live)` | exit 0, **15/15** | the row is dropped from the population by the `=== "yes"` filter (`:508`) instead of failing — the population shrinks 16→15 and the verdict stays clean (MutC1Entry A) |
| F8 | a new `mined` S990 row (`https://e.test/`) naming the entry, cited alone on the entry's `source:` line | exit 0, 16/16 | `s1-source-row` (`:514-515`) checks only that a cited id is `mined`, names the entry in `used-by`, and is absent at `--baseline`; the registry row's URL, anchor and quote are never read |

What v1 does refuse is also load-bearing for v2: a browserless synthetic transcript with no real
screenshot fails `t3-binding` (0 admitted, `.ufo/waves/round-32/w1/CritC1Forgery.md` v0), and a
source row that is `queued`, or present at `--baseline`, fails `s1-source-row` (same report, v5/v7).
The gate is a filter with holes, not a formality — and it is not a whitelist: `digestLiterals` is
`[]` at the baseline and its own `--selftest` is clean, 27 cases.

## 2. What v2 must refuse — the rules, each mapped to its construction

The rules are the ExecGateV2 seat's requirement list for this wave
(`.ufo/waves/round-33/w1-spec.json`, item `ExecGateV2`; the predicate itself is frozen in
`.ufo/waves/round-33/claims.json` claim C2). At this entry's draft no v2 bytes exist and no v2
reading has been taken: the v2 readings are in §7.

| # | v2 rule (requirement) | Construction it must refuse | v1 reading of that construction |
|---|---|---|---|
| 1a | duplicate row ids are a row finding (stable id, e.g. `x3-duplicate-id`) | F2 | 16/16 admitted (`:508`) |
| 1b | population counts every table row whose Measured cell is non-empty; a Measured cell other than exactly `yes` or `no` is a row finding | F7 | row silently dropped, 15/15, exit 0 (MutC1Entry A; M19) |
| 2a | receipt runs: transcript paths distinct | F3 | 16/16 (`:529`) |
| 2b | receipt runs: transcript sha256 distinct | F4 | 16/16 (`:534`) |
| 2c | receipt runs: each run's new-session body carries a sessionId of ChromeDriver's shape (the honest transcripts carry 32 lowercase hex), a `capabilities.webSocketUrl` of `ws://127.0.0.1:<port>/session/<that sessionId>`, sessionIds distinct across runs, and browsing-context ids that are not the golden constants (honest contexts are 32 uppercase hex) | F1 | 16/16 (`:550-551`; the golden transcripts carry the gate's own constants — `sessionId: "X"` with `ws://127.0.0.1:9515/session/X` at `scripts/check-bidi-runtime.mjs:628`, context `"C1"` at `:601` — and nothing compares them with the receipt's session or with the transcript's own base) |
| 3 | driver: blob present with matching sha256, sha256 different from the gate's own blob at `--rev`, and its source neither re-exports the gate nor imports any gate symbol outside the allow-list (stated in the header) | F5, F6 | 16/16 (`:528`) |
| 4 | `s1`: the cited new S-id must also appear in a `corpus/lessons/round-*.md` `## Gate` table row at `--rev` carrying an https URL and a 64-hex sha256, and the registry row's source-URL host must equal that Gate URL host | F8 | 16/16 (`:514-515`) |
| 5 | one new `--selftest` case per construction F1–F8 and one per round-32 survivor M04, M06, M09, M10, M11, M14, M17, M18, M19, each proved to fail when its mutant is re-applied; all 27 v1 cases keep passing | the battery itself; `.ufo/waves/round-32/w1/MutC1.md` (9 survivors of 20) | v1's suite: `cases=27 passed=27`, and the 9 mutants survive it |
| 6 | no honest digest literal or 12-hex prefix in the source; CLI, JSON field names and exit codes unchanged (fields may be added) | the whitelist family (control J3 below) | `digestLiterals []`, selftest exit 0 (`c2-J1`) |
| 7 | the receipt-leg patch leaves `liveRecord` unchanged — the live-leg change is ExecLiveLeg's (§4) | — | v1's `liveRecord` at `:372-401`; ExecLiveLeg's patch touches the header, the `node:fs` import, `sandboxStatus()` and the `liveRecord` signature/args (`.ufo/waves/round-33/w1/ExecLiveLeg/live.patch`) |

One integration hazard follows from the split: both patches rewrite the same header comment (v2's
requirement 6 says "header comment rewritten to state v2's rules and limits"; ExecLiveLeg's patch
adds its live-leg paragraph at the same block) and both are patches against the same baseline file.
The L1 must apply both and reconcile the header by hand; a mechanical `git apply` of the second will
conflict even though the code hunks are disjoint.

Two consequences follow from the rules as written, and both are decisions the v2 build has to make
explicitly rather than by accident:

- **The honest entry has one decorated cell.** R16's Measured cell reads `no — no BiDi command`
  (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:82`; 16 exact-`yes` rows —
  `awk -F'|' '/^\| R[0-9]+ /{if ($5 ~ /^ *yes *$/) y++} END {print y}'` over the entry at
  b7d16fb → `16`). A literal reading of rule 1b — non-empty population, any cell other than
  exactly `yes` or `no` is a finding — makes that cell a finding and fails H0, which the frozen
  predicate forbids (`admitted === 16`, `failing === 0`,
  `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:217`). The rule therefore needs a
  scoped reading (a `no`-prefixed cell as a measured negative that is counted but not admitted,
  valid only where the matrix has no counterpart), and the battery's H0 is its arbiter.
- **Rule 4 must keep S124–S126 passing.** The honest entry cites three rows whose Gate lines carry
  both the URL and the 64-hex sha256 (`corpus/lessons/round-32.md:14-19`); the host-equality clause
  is what F8 cannot satisfy, not what the honest rows fail. This is stated as a check in the
  requirement, so a v2 that fails it is a finding against v2.

## 3. The driver import allow-list, stated

The gate exports, at the round-32 revision: `DATA_TEXT` (`scripts/check-bidi-runtime.mjs:101`),
`FIXTURE` (`:102`), `FIXTURE_SHA256` (`:120`), `FIXTURE_HEADER` (`:121`), `VIEWPORT` (`:122`),
`serveFixture` (`:126`), `ROWS` (`:142`), `recordFromTranscript` (`:154`), `PREDICATES` (`:214`),
`parseTable` (`:341`), `liveRecord` (`:372`), `evaluate` (`:496`), `goldenLines` (`:590`). The v2
driver allow-list is `FIXTURE`, `FIXTURE_SHA256`, `FIXTURE_HEADER`, `VIEWPORT`, `DATA_TEXT`,
`serveFixture` — fixture bytes, their digest, their header pair, the pinned viewport, and the
loopback server; nothing that decides or records a verdict.

The round-32 driver's actual import line is
`import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";`
(`scripts/bidi-loopback-round32.mjs:31`), i.e. three of the six, and it duplicates the data body
locally rather than importing `DATA_TEXT` (`:37`). Its blob is what the receipt names:
`driverSha256 55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a`
(`git show b7d16fb:corpus/evidence/round-32/bidi/receipt.json`; `git show …:scripts/bidi-loopback-round32.mjs | sha256sum` → the same digest). The round-32 lesson states the same three names
(`corpus/lessons/round-32.md` M2). The closure routed this as a defect with a choice — state the
allow-list or remove the shared imports
(`corpus/lessons/round-32-verifier-spotcheck.md:148`; its measurement at `:64`).

Why the line matters: a driver that imports the gate's fixture server and constants shares the
gate's bytes on the one path where "independent run" is claimed. The shared object is the fixture,
not the verifier — no verdict code (`PREDICATES`, `evaluate`, `liveRecord`) is in the list — so the
receipt's two runs remain two sessions; but the claim "the driver is not the gate" is only true at
the level of verdict logic, and the gate's header has to say so. Criterion 86 makes the corpus-side
reading explicit: distinct row ids, distinct transcript digests, driver digest unequal to the
gate's, and the driver's imports (`corpus/QUALITY.md:522-528`). v2's header states the allow-list verbatim (`scripts/check-bidi-runtime.mjs` header, `DRIVER_ALLOW`).

## 4. The live leg: real binary, no `--no-sandbox`, no launcher flags

v1's `liveRecord` starts `chromedriver` from `PATH` and passes `binary: "/usr/bin/chromium"` with
`args: ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu",
"--user-data-dir=<throwaway>"]` (`scripts/check-bidi-runtime.mjs:372`, `:401`), and hands chromium a
short TMPDIR so the singleton socket fits the 108-byte unix-socket limit (`:379-390`).

`/usr/bin/chromium` is not the browser. It is the Arch launcher — a 14,424 B ELF (package
`chromium 154.0.8037.97-1`, sha256 `eaed39c3…a172b`) built from chromium-launcher v8: `launcher.c:15`
reads `/etc/chromium-flags.conf` unconditionally, `:18-29` chooses
`$XDG_CONFIG_HOME/chromium-flags.conf` when `XDG_CONFIG_HOME` is set and `$HOME/.config/…`
otherwise, `:93-94` concatenates system-then-user flags, and `:124` `execv`s `CHROMIUM_BINARY`,
which the launcher Makefile pins to `/usr/lib/chromium/chromium` (S128; host cross-check in
`.ufo/waves/round-33/w1/ScribeSrcLauncher/host-crosscheck.md`). Two host facts matter: this host's
environment has `XDG_CONFIG_HOME` set, so redirecting `HOME` alone would not move the user flags
file; and the file carried no `--no-sandbox` on 2026-10-26 (0 matches; 1 `--load-extension`, counts
over flag names only — a property of the file that day, not of the launcher), so the flag v1 passes
is the gate's own, not ambient. Round 32 measured the consequence of the
ambient half: the user's flags file then held five entries
(`--ozone-platform=wayland`, `--ozone-platform-hint=wayland`,
`--enable-features=TouchpadOverscrollHistoryNavigation`,
`--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`,
`--disable-features=Vulkan`) and a chromedriver session executed exactly that list *first*, before
chromedriver's arguments; with a proxy added to that file, a loopback URL left the host
(`.ufo/waves/round-32/w1/SentinelPerimeter.md` F2, probes `probe-d-withsandboxflag.json`,
`proxy2.log`). The gate never records which flags were in force — its argv is not the executed
argv.

`--no-sandbox` is the second half. v1 passes it. Round 32 measured what it changes on this host: a
chromedriver session *without* it succeeds and its renderers carry `Seccomp: 2`,
`Seccomp_filters: 1`, `NoNewPrivs: 1` and their own user namespace; the same session *with* the
flag carries `Seccomp: 0`, `Seccomp_filters: 0` and the shell's user namespace
(`.ufo/waves/round-32/w1/SentinelPerimeter.md` F1, probes `probe-d-nosandbox.json`,
`probe-d-withsandboxflag.json`; the entry records the flag as unnecessary on this host at
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:170-171`). S129 grounds what the flag disables
at the measured tag: `sandbox/linux/README.md` describes the layers (setuid helper with PID and
network namespaces, chroot, capability drop, seccomp-BPF) and `sandbox/policy/switches.cc:42-44`
defines `--no-sandbox` as disabling "the sandbox for all process types that are normally sandboxed".
The live-leg change is ExecLiveLeg's patch on the baseline file
(`.ufo/waves/round-33/w1/ExecLiveLeg/live.patch`): it makes
`/usr/lib/chromium/chromium` the default binary, removes `--no-sandbox` from the session args, and
adds a `sandboxStatus()` guard that refuses (exit 2) instead of launching unsandboxed when neither
the setuid helper nor unprivileged user namespaces are available. At its scratch commit
`2b64a52eb3f5b790127b0e4f61c9acf766393c03` the receipts read: offline `population 16 / admitted 16 /
failing 0 / clean true` (`offline.json`), live `population 16 / admitted 16 / failing 0 /
clean true`, `binding: null` (`live-out.json`), and `--selftest` `cases 27 / passed 27`
(`selftest.json`). The sandbox probe (`sandbox-probe.txt`) shows the session created on the real
binary without the flag, renderers in their own user and network namespaces with `Seccomp 2`, and
`no-sandbox-in-browser-argv: 0`; the launcher probe (`launcher-probe.txt`) shows the exec'd argv is
`/usr/lib/chromium/chromium` carrying one injected `--ozone-platform`. The seat's own report is the
authority for its verdict; if its patch or revision changes, re-read those five files rather than
this sentence.

The frozen predicate does not depend on any of this: the battery invokes the gate without `--live`
(`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:21`, `:203`), and claims C2's kill rule
says the live leg "is not part of this predicate … any live-leg change v2 makes is reported as
no-harm evidence only" (`.ufo/waves/round-33/claims.json` claim C2 `killRule`). A v2 that broke the
live leg would still meet the battery, which is why §5(d) names that as a limit and why the change
is measured separately.

The round-32 remediation named the hazard this change could carry: "both legs must use the same
flags … re-freeze the digest" (`.ufo/waves/round-32/w1/SentinelPerimeter.md:70-72`), because the
binding compares the live session's first screenshot with the committed runs' (`:552-553`). The
ExecLiveLeg run settles it for this build: `binding: null` with the live leg admitted means the
first screenshot did not move when the launcher and the flag were dropped, so no re-record was
needed. The claim is narrow — one host build, one fixture, one flags file — and if a future flags
file or build does move the bytes, the gate fails the binding loudly rather than re-baselining.
The offline battery is unaffected either way: H0–H2 compare the committed runs only.

## 5. Limits of this falsification

(a) **The battery is finite.** Eleven variants, eight constructions, frozen before data
(`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:72`). A gate can be written to refuse
exactly these eight by construction-specific tells; the predicate would be met while the class
stays open. Claims C2 discloses this in its `feasibilityDisclosed` cell.

(b) **The rules are syntactic provenance, not execution.** A golden transcript carrying real-shaped
32-lowercase-hex session ids, a matching `ws://127.0.0.1:<port>/session/<id>`, distinct base URLs
and 32-uppercase-hex contexts satisfies rule 2c without any browser; the offline binding only
compares two runs' first screenshots to each other (`:550-551`), and one real screenshot spliced
into both satisfies that — F1 is exactly that construction with the gate's own golden constants, so
changing the constants is a different forgery, not a harder one. The honest receipt's own shapes
are the premise rule 2c generalises from: `sessionId 10abbb479bdcc37a405098c5ea778bf0`,
`context 31B8FE9C25C36020CBB175F250715903` (`git show b7d16fb:corpus/evidence/round-32/bidi/run1/transcript.jsonl`).
This is the claims' disclosed limit; the wave-2 forger set (`.ufo/waves/round-33/w1-spec.json`
item `CritForgeNext`) is the falsifier, and its survivors are limits, not predicate changes.

(c) **The digest clause is narrow.** `digestLiterals` looks for the five honest 64-hex digests and
12-hex prefixes of them in the gate's source
(`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:65-71`, `:222`, `:229`). A whitelist that
encodes the same bytes another way — lengths, base64, a sorted table — passes the clause; the
reviewer reads v2's code (claims C2 `feasibilityDisclosed`). Control J3 shows the clause does catch
the straightforward form.

(d) **The predicate is offline-only.** No `--live`: a v2 that refuses all eight and breaks its live
leg still meets the predicate (§4). What pins the live leg is the wave's no-harm pass and
ExecLiveLeg's receipt (clean at `2b64a52e…`, `.ufo/waves/round-33/w1/ExecLiveLeg/live-out.json`), not
this battery.

(e) **The honest layouts share one driver and one fixture.** H0 (the round-32 receipt), H1 (the same
transcripts re-laid-out with the run order swapped) and H2 (the round-32 w2 RerunDriver pair) were
all produced by `scripts/bidi-loopback-round32.mjs` against the gate's fixture; passing them
demonstrates that v2 admits three layouts of the same provenance, not that it admits diverse
provenance. Criterion 86's driver-import reading is the corpus-side guard.

(f) **What this entry does not claim.** It does not claim that any admitted receipt's runs happened:
it records which constructions the gate refuses and why. It does not re-measure the capability
rows — the round-32 entry holds those, and nothing here changes them. It does not claim v2 meets its
predicate; that is the round's measurement (§7 and the round-33 report).

## 6. Controls — the instrument moves, and only for the right reason

Three frozen controls, all scratch commits on the baseline revision (never lane commits; provenance
files carry the scratch rev and the counter's sha256):

```
$ jq -c '{predicate,honest,forgeriesAccepted,acceptedForgeries,digestLiterals,selftest}' \
    .ufo/waves/round-33/baseline/c2-J2-reject-all.json
{"predicate":false,"honest":{"H0":false,"H1":false,"H2":false},"forgeriesAccepted":0,
 "acceptedForgeries":[],"digestLiterals":[],
 "selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27"}}
$ jq -c '{predicate,honest,forgeriesAccepted,acceptedForgeries,digestLiterals,selftest}' \
    .ufo/waves/round-33/baseline/c2-J3-whitelist.json
{"predicate":false,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":0,
 "acceptedForgeries":[],
 "digestLiterals":["8aa97463c238","9918a716da71","92bd413caab0","b9dab912f0af","55dbef88ed4b"],
 "selftest":{"exit":3,"last":"BIDI_RUNTIME_SELFTEST verdict=failed cases=27 passed=25"}}
```

| Control | Gate at | What it shows |
|---|---|---|
| J1 do-nothing (the baseline itself) | b7d16fb (`c2-J1-do-nothing.provenance`, exit 1) | 8/8 forgeries admitted with the honest three true: the instrument is not simply red, and the eight are real admissions, not gate failures |
| J2 reject-all (a gate that exits 1 on every evaluation) | scratch 285fac1b0ff792dd3471975b93bf03375769304d (`c2-J2-reject-all.provenance`, exit 1) | forgeries 0/8 but honest H0–H2 all false: refusing everything is not a pass, so the predicate cannot be met by loosening nothing |
| J3 whitelist (v1 + "accept only the honest transcript/driver/entry/registry digests") | scratch 3f77d79b6533779b1e85b08d3d3358a1e2b77980 (`c2-J3-whitelist.provenance`, exit 1) | forgeries 0/8 and honest true — but five digest literals in the source and the suite red (`verdict=failed cases=27 passed=25`, exit 3). Both the digest clause and the selftest-status arm are load-bearing: a whitelist satisfies forgery refusal without being a forgery check |

No-harm reading for v2: at the baseline, the honest offline evaluation exits 0 (H0, 16/16) and
`--selftest` exits 0 with 27/27. v2 must keep both, add its cases, and leave every other offline
gate at the wave's no-harm pass untouched (claims C2 `noHarmRule`).

## 7. Readings (round 33, integrated by the L1)

- Battery on v2 (ExecGateV2 scratch commit `b04b1fee2b7fb6c6be9ca6b55fd936c756e89373`, frozen counter bytes):
  predicate true; H0, H1, H2 accepted at population 17, admitted 16, failing 0 (R16 is the one `no` row, now counted and
  never admitted); forgeries accepted 0 of 8 — F1 `t1-receipt` (golden session ids and contexts), F2 `x3-duplicate-id`,
  F3 and F4 `t1-receipt` (run paths and digests not distinct), F5 and F6 `t1-receipt` (driver is the gate or re-exports
  it), F7 `x4-measured-cell`, F8 `s1-source-row` (no Gate row for S990); `digestLiterals []`
  (`.ufo/waves/round-33/w1/ExecGateV2/battery-final.json`).
- Self-test: `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44`; each of the nine round-32 survivors M04, M06, M09,
  M10, M11, M14, M17, M18, M19 is killed by exactly one new case (`.ufo/waves/round-33/w1/ExecGateV2/mutants.json`).
- Live leg (no-harm only): with the real binary, no `--no-sandbox`, and a throwaway HOME/XDG config and cache, the
  integrated gate reads `population=17 admitted=16 failing=0 unmeasured=1 distinct=16 live=true`, exit 0, on the
  round-32 entry (L1 run, 2026-10-26; `.ufo/waves/round-33/w1/ExecLiveLeg/live-out.json` is the seat's run of the
  launcher-bypass patch alone). The renderer runs sandboxed on this host: setuid `chrome-sandbox` and
  `kernel.unprivileged_userns_clone=1` (`.ufo/waves/round-33/w1/ExecLiveLeg/sandbox-probe.txt`).
- The lane measurement at the measured revision supersedes these scratch readings:
  `.ufo/waves/round-33/measure/c2-at-*.json`.

