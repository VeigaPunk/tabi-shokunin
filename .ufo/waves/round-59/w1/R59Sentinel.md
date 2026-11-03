# R59Sentinel — guard audit, tabi round 59 wave w1

Seat: `R59Sentinel` (sentinel). Scope: the five guard items in my seat spec for round 59 / wave w1.
**Read-only everywhere except `.ufo/waves/round-59/sentinel/` (my own dir) and my scratch tree.**
No VCS mutation of any kind was performed by me (no `git commit/add/push/stash/checkout/reset`,
no mutating `jj`). No other seat's file was edited — every defect below was reported, not fixed by me.

Authority read first: `.ufo/waves/round-59/claims.json` (frozen). Never amended by me.

Scratch: `/fast/scratch/hyaku/tabi-r59/R59Sentinel/` — **deleted before this yield**; every
artifact this report cites was copied into `.ufo/waves/round-59/sentinel/` first.

---

## Verdict

| # | Item | Verdict |
|---|---|---|
| 1 | Independent re-fetch S161 + S153 vs the scout's staged bytes | **MATCH / MATCH** — content and fetch-guard both clean |
| 1b | S162 (newly opened) staged bytes + guard record | **MATCH on content; HIGH guard-record defect RAISED, then REMEDIATED by the L1 and re-audited clean** |
| 2 | Write-scope audit + branch tip | **CLEAN** — 97/97 dirty paths in scope; 0 out-of-scope; 0 forbidden; every commit L1-authored |
| 3 | Secret-shape sweep over the new bytes | **CLEAN** — 0 hits in any r59 byte; 1 pre-existing, unchanged, out-of-scope hit |
| 4 | pacman guard | **CLEAN** — pacman state byte-identical across the window; no pacman transaction today at all |
| 5 | Fetch-guard compliance of the receipts | **CLEAN** — 3 receipts, 0 violations |
| — | Instrument audit (trust boundary, within my sentinel role) | **1 HIGH crash found + 1 polarity inversion + 1 unsatisfiable check — all fixed by the owners and re-audited GREEN by me** |

Four findings I raised were HIGH or near-HIGH and are the substantive output of this seat; all were
reported to `agent://TabiR59` and, for the counter, to `agent://R59Counter`. **Three of the four are
now closed and re-audited by me** (F-1 crash → counter emits verdicts; F-2 read-back → counter greens
the genuine receipt while still refusing both forgery shapes; F-3 S162 guard record → conforming
receipt, my fetch correctly credited). **F-4 (the LOW write-scope attribution) was accepted by the
L1** and is disclosed in the round lesson.

---

## F-1 (HIGH, found by me, raised, FIXED by owner, re-audited) — the r59 counter crashed on every receipt

`TypeError: add is not a function` — stdout empty, exit 1. The counter could emit **no verdict at
all**, so C2's after-state, the f1–f8 kill receipts and the cross-refusals were all unreachable.

Root cause: a one-argument parameter shift.

```
DEF  (line 1114): function checkCapsLock(rec, form, nonceStr, nonceOk, pageEntries, pageAdmitted, add)
CALL (line 1856): checkCapsLock(rec, form, nonceStr, nonceOk, pageEntriesOf(form), add);
```

Seven parameters declared, six passed ⇒ `pageAdmitted` received the `add` **function** (truthy), so
the guard `if (!pageEntries || !pageAdmitted) return;` no longer short-circuits, and the body ran
with `add === undefined` ⇒ TypeError at the first `add()` call.

Three reproductions (each exit 1, stdout empty): the **genuine** smoke2 receipt → crash at `:1098`
in `checkShiftDetector`; the same receipt with the capsLock leg removed → crash at `:1149`; a
forged receipt (latch mirrored) → crash at `:1145`.

Why it mattered against the frozen claims, not as a style point: C2's kill rule enumerates f1–f8
forgery probes that must each produce a kill receipt; a counter that crashes produces none. The
crash also fired **before** `checkForm2`, so the D4 positive control was never evaluated.

**Re-audit after the owner's fix** (counter sha256 `bea30e2e09df7f09eb5af32babf24d98edbaf490495dc3e83582aa8928c61363`):
call site now passes 7 args; all three reproductions emit a proper JSON verdict; the **polarity
inversion I also flagged is fixed** — the counter now treats `latch.acrossLetters1/2 === false`
as the violation ("a letter read capsLock true") and `true` as the pass, which matches the driver's
`letters1Caps.every((v) => v === false)`.

Evidence: `sentinel/evidence/counter-crash-evidence.txt`.

## F-2 (LOW–MEDIUM, raised by me, FIXED by the owner, re-audited green) — the counter's `press2` read-back check was unsatisfiable by a genuine receipt

```
counter (1207-1209):  if (prefix !== null && p.valueAfter !== prefix)
                        add('capslock-readback-missing', name + ' valueAfter ... != the pre-leg value ...');
```

The check applies the **pre-leg prefix** comparison to *both* presses, but the driver's semantics
differ: `press1.valueAfter` is read right after the press-1 CapsLock keyUp (pre-letters1) and *is*
the prefix, while `press2.valueAfter` is read right after the press-2 keyUp — **after** the letters1
keystrokes (driver lines 2073–2077) — so it necessarily equals `prefix + letters1.join('')`.

On the genuine smoke2 receipt the counter emits exactly one finding, and it is a **false positive**:

```
capslock-readback-missing : press2 valueAfter "48cd" != the pre-leg value "48"
```

(the receipt's own trace shows the accumulation is correct: letters1 `valueAfter` = `48c`,`48c`,`48cd`,`48cd`).

Impact: C2's green path (exit 0, `findings []`) is unreachable on honest bytes, **and the falsifier
is inverted** — a forger could satisfy the check by resetting `press2.valueAfter` to the prefix, i.e.
by *lying* about the DOM. Smallest fix (the counter seat's to land): compare `press1.valueAfter`
against the prefix and `press2.valueAfter` against `prefix + letters1.join('')`, or drop press2 from
the prefix comparison and rely on the per-letter read-back checks that already assert each letter's
`valueAfter == prefix + letters[0..i]`.

Evidence: `sentinel/evidence/counter-press2-readback-evidence.txt`. Raised to `agent://TabiR59` and
`agent://R59Counter`.

**CLOSED — re-audited green.** After the owner's next write (counter sha256
`346920a30f905198aa784b05d34d5be72a64fe44e327c4496c5198530184c9eb`, mtime 18:11:52) and with the
canonical driver now landed at `scripts/chrome-cdp-loopback-round59.mjs` (sha256
`b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86`):

| input | result |
|---|---|
| the **genuine** smoke2 receipt | **exit 0, predicate true, findingCount 0, couldNotEvaluate []** — the false positive is gone |
| forged receipt (`latch.acrossLetters1 = false`) | exit 1, findingCount 4 — incl. `caps-flag-true: the declared latch.acrossLetters1 is false (a letter read capsLock true)` |
| receipt with the capsLock leg removed | exit 1, findingCount 2 — `missing-delivered-shape-field: no capsLock leg recorded` |

So the counter now greens an honest receipt and still refuses both forgery shapes I probed. The
`driver-sha-mismatch` on the forged input is expected and correct: that receipt carries the older
driver digest `31fd014b…`.

## F-3 (HIGH, raised by me, REMEDIATED by the L1, re-audited clean) — S162 had no conforming fetch-guard record

`claims.json` `frontierStep.sourcedClaim` states C2 rests on "S162 opened NEW this round (fresh
fetches with the R57-S3 guard …)". The **only** guard record for it,
`sources/s162-guard.txt` (174 B, one line), read:

```
final_url=…/input_handler.cc?format=TEXT redirects=0 code=200 size=0
```

— **no sha256**, **no explicit final_host**, and `size=0` contradicting the 89,463-byte staged file.
S162 had no `corpus/SOURCES.md` registry row, so nothing tied the staged bytes to the cited URL.

**The content was never in doubt, and I verified that independently:** I fetched the cited URL myself
— attempt 1 → `503` (1459 B HTML error page; the endpoint is genuinely rate-limiting right now),
attempt 2 → `200`, 119,284 B base64, sha256 `847c531ee32e97a3dcd19bf100864a8867f045792b5b320db8f644f4e67c46a0`;
`base64 -d` of that → 89,463 B sha256 `72cf0d1d913302551731310cf76e03a259e8ccbfa7c8db14a185d9ae817324f4`,
**byte-identical** (`cmp`: no difference) to the staged `sources/input_handler.cc`.

I also read the staged bytes and confirmed the measured-negative's technical ground directly:
`GetEventModifiers` maps **only** bits 1/2/4/8 (`kAltKey`, `kControlKey`, `kMetaKey`, `kShiftKey`) with
**no CapsLock branch** — the CDP channel exposes no CapsLock bit.

**Remediation (L1-authored, then re-audited by me):** `sources/s162-fetch-receipt.json` +
`sources/README-S162.md`; `s162-guard.txt` stays as the historical record of the failed probes.
My re-audit of the new receipt: `fetchguard-check.py` → **0 violations**; receipt `stagedSha256`
`72cf0d1d…` == sha256 of the actual staged file (**MATCH**); receipt `transportSha256` `847c531e…`
== sha256 of **my** independent fetch's base64 body (**MATCH** — my fetch is credited correctly);
the staged bytes are byte-identical to my own decoded fetch.

## F-4 (LOW, raised by me, accepted by the L1) — a foreign seat wrote into another seat's declared dir

`sources/` is **R59Scout's** declared dir. R59Scout confirmed in writing it did **not** author or
stage `input_handler.cc` / `s162-guard.txt` — its seat spec bounded it to S161+S153 and it lists
exactly six artifacts as its own. The **L1** fetched and staged them (the runner seat's scratch
copy was its own independent fetch — hence three successful fetches of one URL). LOW because the
bytes are authentic and the path is inside the wave root (no forbidden path, no fleet-repo write),
but it is exactly the write-scope rule the round contract states. The L1 accepted it, is landing it
in the round lesson's Mistakes, and re-declares `sources/` as shared scout+L1 for S162.

---

## Item 1 — Independent re-fetch and byte comparison

**Method.** My own `curl` invocations, my own bytes, my own guard fields — never the scout's fetch:

```
curl -sS --max-time 120 -o <file> -w '%{http_code}|%{num_redirects}|%{url_effective}|%{size_download}|%{content_type}|%{time_total}' <url>
```

| source | cited host | http | redirects | final host | bytes | sha256 | vs registry anchor | vs scout's staged bytes |
|---|---|---|---|---|---|---|---|---|
| S161 `https://www.w3.org/TR/uievents/` | www.w3.org | 200 | **0** | www.w3.org ✅ | 920,762 | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | **MATCH** | **MATCH** (`cmp` identical) |
| S153 `…/devtools-protocol/master/json/browser_protocol.json` | raw.githubusercontent.com | 200 | **0** | raw.githubusercontent.com ✅ | 1,423,170 | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | **MATCH** | **MATCH** (`cmp` identical) |
| S162 `…/155.0.8059.84/…/input_handler.cc?format=TEXT` | chromium.googlesource.com | 200 (after one 503) | **0** | chromium.googlesource.com ✅ | 89,463 staged / 119,284 transport | `72cf0d1d…` staged / `847c531e…` transport | no anchor yet (new) | **MATCH** (`cmp` identical after decode) |

Both re-opens are **byte-identical to the r58 staged copies** and to the registry anchors — no drift.
Per-source match/mismatch: **S161 MATCH, S153 MATCH, S162 MATCH (content) + guard record remediated**.

Artifact: `sentinel/independent-refetch.json` (sha256 `3777724ca97bd523680ff056036a73a0cd6e1086500ea2e28602197da4e44635`).

## Item 2 — Write-scope audit and branch tip

`git -C <lane> status --porcelain -uall` at wave end: **112 dirty paths — 112 IN_SCOPE, 0 OUT_OF_SCOPE,
0 FORBIDDEN.** Every path falls in a seat's declared wave dir, `scripts/chrome-cdp-loopback-round59.mjs`,
or `.ufo/waves/round-59/`. Explicitly checked and absent: `.ufo/state/**`, `.ufo/watchdog.log`,
`MANIFEST.json`, the fleet repo, sibling lane repos.

Branch tip: `git rev-parse master` = `e7cc13313056aefe32c9e82a4fcbeed2d8d0e0f1`; `HEAD` == tip;
the lane base `4e7fb89d7b71a6fdf661680891440be6577759e8` **is an ancestor** of the tip. The tip
**advanced**, but only through **L1-authored** commits: `git log … | sort -u` over all 5 commits since
the claims freeze yields exactly one author, `tabi-shokunin <tabi@shokunin.local>`; the reflog shows
only `export from jj` entries. **No seat committed.** Every advance was a disclosed **pre-data**
correction (no data pass had scored): `44752c57` counts 19→20 / 16→20, `8e740a08` the C2 restatement
to `chromium-keyevent-delivery-boundary-linux`, `a40822d9`+`03f64a39` the critic's P1–P3 pins,
`e7cc1331` the R1–R4 pins — each recorded in `claims.json` `preDataCorrection`.

**I independently re-derived the L1's corrected counts** rather than accepting them: my own roster
scan finds **21** lane dirs → **20** siblings; `v18`'s roster scan excludes only `SELF_LANE =
'tabi-shokunin'`; and `v18` has **no** `bgScreenSiblings` count at all — so the v19 screened-set metric
is genuinely new surface (D8), not a re-bind. The rebind seat's `screen-set-r59-inventory.json` shows
20 lanes with 25 screens, and its screen set covers exactly the files the r58 reviewer named
(kagi `PROVINCE.md` 3 hits; kake `PROVINCE.md` 45 + `SKILL.md` 19; kama `corpus/knowledge/listener-census.md` 5).

Artifact: `sentinel/write-scope-audit.json` (sha256 `d3e7ff5772fab2a769686d024b81d2db409375b3cb387dd9c833893adb4955ea`).

## Item 3 — Secret-shape sweep

14 credential shapes (`sk-`, `ghp_`/`gho_`/`ghs_`/`github_pat_`, `AKIA`/`ASIA`/`ABIA`/`ACCA`,
`op://`, `AGE-SECRET-KEY-1`, `-----BEGIN … PRIVATE KEY-----`, `password =`, `token =`, bearer literal,
JWT). **Shape-only**: a hit records the shape label, the `file:line` and the match length — the matched
literal is never read, printed, copied or stored.

**133 files scanned, 1 hit — and it is not an r59 byte.** `scripts/check-sources.mjs:448`, shape
`github-pat-ghp`: the file is tracked and **unmodified** in this wave (`git status --porcelain` empty),
**unchanged since the base revision** (`git diff 4e7fb89d..master` empty), present at
`4e7fb89d`, mtime 2026-10-19 (before the wave opened) — and it is the repo's own
`credential-material` **self-test fixture**, a deliberately planted fake used to exercise the sources
checker's rejection path. Not a secret exposure.

**Zero hits in every r59 artifact.** The driver's receipt argv redacts any path into the user's home
to `__USER_HOME__` (driver line 1482), and the browser is launched with a throwaway
`HOME`/`XDG_CONFIG_HOME` under the seat's scratch plus `--disable-extensions`, so no user-profile path
enters the receipts.

Artifacts: `sentinel/secret-sweep.txt` (sha256 `3c5f71c1662f0424ff046a627e09b78d2ec822fbba0488e43514abc43eda0a26`),
`sentinel/secret-sweep.json` (sha256 `4f8b45c409ca59144237705b9039050be2f1eead6711bf498451c41dd2966cc7`).

## Item 4 — pacman guard

Host-wide `pacman` is **PAUSED** by operator guard; I installed nothing and ran no package transaction.
Read-only measurements, start of my window vs end:

| measure | start | end | verdict |
|---|---|---|---|
| `/var/log/pacman.log` sha256 | `1b49e2608ef9b708519aa999184c251d84342a500837546ccb55796b9154eed4` | identical | **no change** |
| `/var/log/pacman.log` size / mtime | 290,434 B / 2026-11-02 15:32:29 | identical | **no transaction** |
| local-db digest (`/var/lib/pacman/local/*/desc`) | `b39935f806e171b422540dd4d0983d963228be9d633a948fd146bff508119c76` | identical | **no install/uninstall/upgrade** |
| installed package count | 1519 | 1519 | **no change** |
| `/var/lib/pacman/sync/*.db` mtimes | 2026-10-22 → 2026-11-02 | identical | **no `-Sy`/`-Syu` refresh** |
| pacman.log lines dated 2026-11-03 | — | **0** | **no pacman activity today, host-wide** |

This is the sweep that carries the negative claim: the log contains **zero** lines for today, so no
seat could have installed via pacman in this window. Also checked for the allowed channels:
`~/.local/bin`, `/usr/lib/node_modules` and `~/.local/share/uv/tools` show no r59-era additions.
**No tool was installed by me** — none was needed; `curl`, `python3`, `node` and `sha256sum` sufficed.

Artifacts: `sentinel/evidence/pacman-baseline-start.txt`, `sentinel/evidence/pacman-end.txt`.

## Item 5 — Fetch-guard compliance of the receipts

Rule applied per fetch: `final_host == cited_host`, `num_redirects == 0`, a positive byte count, a
64-hex sha256, `http_code == 200`; each evidence row additionally carries bytes + sha256 + fetched_at.

| receipt | cited host | final host | redirects | bytes | http | sha256 | verdict |
|---|---|---|---|---|---|---|---|
| `scout/reopen-receipt-s161.json` | www.w3.org | www.w3.org | 0 | 920,762 | 200 | `8ded5eaf…` | **COMPLIANT** |
| `scout/reopen-receipt-s153.json` | raw.githubusercontent.com | raw.githubusercontent.com | 0 | 1,423,170 | 200 | `d6737c31…` | **COMPLIANT** |
| `sources/s162-fetch-receipt.json` (L1, post-remediation) | chromium.googlesource.com | chromium.googlesource.com | 0 | 89,463 | 200 | `72cf0d1d…` (+ transport `847c531e…`) | **COMPLIANT** |

**0 violations.** My checker was **self-validated** against the previous round's two receipts
(r58 → 0 violations) before being applied, so a "clean" verdict is a real signal and not a
checker artifact. It accepts the receipts' dual camelCase/snake_case spellings and the S162 receipt's
`stagedBytes`/`stagedSha256`/`transportSha256` fields.

**The one violation I did find was the pre-remediation `s162-guard.txt`** (no sha256, no explicit
final_host, `size=0` vs an 89,463-byte file) — see F-3.

Artifact: `sentinel/evidence/fetchguard-check.py` (the checker; sha256 `57ca271003b619b50fca10aaf68881680df5f7d3a09b3cc764f9fb78f7d9fcbe`).

---

## Additional instrument audit (within my sentinel role; read-only)

- **Driver hygiene (good).** `chrome-cdp-loopback-round59.mjs` launches `/usr/bin/chromium` with a
  throwaway `HOME`/`XDG_CONFIG_HOME`/`TMPDIR` under the seat's scratch, `--disable-extensions`,
  `--remote-debugging-address=127.0.0.1`, `--headless=new`, its own `--user-data-dir` under a
  `profile-<token>` dir at mode 0700; it kills the **process group** (`process.kill(-pid)`) and sweeps
  to `postKillSweepCount: 0`, `survivors: []`, both ports `closed`; the receipt argv redacts the user's
  home path. The user's own long-running Chromium (started 2026-11-02) is untouched and distinct.
- **Driver selftest for the measured negative (good).** `caps-boundary-negative` asserts a clean
  delivered pair is accepted and that a **true** caps flag is refused — the f5 probe is implemented on
  the driver side too.
- **Rebind refusal paths write no ledger (good).** `rebind-r59.mjs` exits 3 (unresolved BG hit) and
  exit 5 (v19 preflight red) **before** writing either ledger; `--out` is refused if it resolves inside
  `corpus/`; adjudication inputs are used only as **map keys** (never as a filesystem path or a shell
  argument); git is invoked via `execFileSync('git', [args])` with an **argv array** (no shell, no
  string interpolation); dispositions are constrained to a frozen 3-word vocabulary; the ledger is
  bound to **one** fresh sibling-head snapshot and the raw-byte sha is used (not a re-encoding).
- **No `resume_continuity_v1` surface exists in r59** — a fleet-wide grep finds it only in other lanes'
  and other rounds' artifacts. The closest analogue in this round, the rebind's refusal paths, was
  verified above to cause **zero ledger mutation** on every refusal.
- **Instrument integrity.** I snapshotted sha256 of every canonical r59 instrument file across the wave
  and re-diffed; no canonical instrument was mutated by a non-author seat. Author seats each wrote their
  own file once.

## Not run / not covered (stated plainly)

- I did **not** run the r59 counter's `--selftest`: at the time of measurement it aborts with
  `fixtures dir absent` in the seat's scratch, and the selftest belongs to the counter seat.
- I did **not** run the L1's live data pass, the C1 v19 meter, or any mutant harness — those are other
  seats'/the L1's, and my brief forbids operating another runtime.
- The **final** wave-end numbers above are a snapshot at 18:12 local; the wave was still running when
  this report was written, so the dirty-path count can only grow. The counts above are the ones I
  measured and they are reproducible with the archived tools.
- The counter was still being rewritten while I audited it; my F-1/F-2 re-audits are bound to the
  counter sha256s I quote above (`bea30e2e…` and `346920a3…`). A later write could change them
  again — the *behaviour* I verified (verdict emitted, genuine receipt green, both forgery shapes
  refused) is what matters, and it is reproducible with the archived commands.

## Artifacts (all under `.ufo/waves/round-59/sentinel/`, relative to the lane root)

| path | sha256 |
|---|---|
| `sentinel/independent-refetch.json` | `3777724ca97bd523680ff056036a73a0cd6e1086500ea2e28602197da4e44635` |
| `sentinel/secret-sweep.txt` | `3c5f71c1662f0424ff046a627e09b78d2ec822fbba0488e43514abc43eda0a26` |
| `sentinel/secret-sweep.json` | `4f8b45c409ca59144237705b9039050be2f1eead6711bf498451c41dd2966cc7` |
| `sentinel/write-scope-audit.json` | `1f51d3637c5d36eb07856fb0b60051f0acb4445ce184a2eea7ec2fb42be2659e` |
| `sentinel/evidence/counter-crash-evidence.txt` | `8721cf663b1fc2a2c5f5cda879d4e6bf5f1c81dc3c38ac8055a471fb5c880a31` |
| `sentinel/evidence/counter-press2-readback-evidence.txt` | `023be3efaaef53a392ca97b6aae920383c90e0e0462e49fcb2870fce13f9d494` |
| `sentinel/evidence/fetchguard-check.py` | `57ca271003b619b50fca10aaf68881680df5f7d3a09b3cc764f9fb78f7d9fcbe` |
| `sentinel/evidence/secret-sweep.py` | `a7d7b9f3bb4b937fa53637eabdbaafe05d017ace543ca9190f2b19396c3a5d66` |
| `sentinel/evidence/writescope-audit.py` | `c965eb1fb572a2a0e980a2cf46718befe67d98300b1e1b4e19fa98aab9cf6fa4` |
| `sentinel/evidence/instrument-integrity.py` | `5d62399c92cf86d55fd18cc1afd74756fe21dee2330dada5f523985b5f390d4d` |
| `sentinel/evidence/make-refetch-json.py` | `dafdf2cb4d742307119a478b2c5f4d905fe4977abfd238fc272dfefc6d690ed8` |
| `sentinel/evidence/pacman-baseline-start.txt` | `6a1334ccf8b1a90ba14b0c64781f05549cd96c7ef7ada542c59bb0d40a67983c` |
| `sentinel/evidence/pacman-end.txt` | `5b05ce47b95b0dd81820d05f9a041d9d0fb3927a3bba3955992945b2e01f7d81` |
| `sentinel/evidence/roster-check.txt` | `1b5a0a43b4c68bc2bdc5d31175e89a1c8667dfa7491116f8698fbf2124e5727b` |

## Commands run (with outcome)

Every command was run from an absolute path; the fleet-root cwd was never written to. Read-only
unless stated.

| command | outcome |
|---|---|
| `curl -sS --max-time 120 … https://www.w3.org/TR/uievents/` | 200, 0 redirects, 920,762 B, sha256 `8ded5eaf…` |
| `curl -sS --max-time 120 … browser_protocol.json` | 200, 0 redirects, 1,423,170 B, sha256 `d6737c31…` |
| `curl -sS --max-time 90 … input_handler.cc?format=TEXT` (×3) | attempt 1 → 503 (1459 B HTML); attempts 2–3 → 200, 119,284 B base64, sha256 `847c531e…` |
| `base64 -d` of that + `cmp` vs the staged `input_handler.cc` | identical — **staged bytes authentic** |
| `cmp` my S161/S153 bytes vs the scout's staged copies | no difference (both) |
| `sha256sum` of staged bytes vs the registry anchors | equal (S161, S153) |
| `git -C <lane> status --porcelain -uall` (×4, wave) | 8 → 64 → 97 → 112 dirty, all IN_SCOPE, 0 out-of-scope, 0 forbidden |
| `git -C <lane> rev-parse master` / `HEAD` / `merge-base --is-ancestor` | tip `e7cc1331…`; HEAD == tip; base is an ancestor |
| `git log --format='%an <%ae>' dd337bb3..master \| sort -u` | one author: `tabi-shokunin <tabi@shokunin.local>` (5 commits) |
| `git reflog -6` | only `export from jj` entries — no seat VCS mutation |
| `git diff 4e7fb89d..master -- scripts/check-sources.mjs` | empty (pre-existing hit) |
| `git status --porcelain` across all 21 lane repos | no r59 tabi artifact in any sibling; sibling dirt is their own concurrent rounds |
| `find` for round-59 files outside the tabi lane | none |
| `pacman -Qq \| wc -l`, `sha256sum /var/log/pacman.log`, `sha256sum /var/lib/pacman/local/*/desc`, `ls --time-style=full-iso /var/lib/pacman/sync/` | start vs end identical; 0 log lines dated 2026-11-03 |
| `python3 secret-sweep.py` over the wave + `scripts/` | 133 files, 1 hit (pre-existing, out of scope) |
| `python3 fetchguard-check.py` over the 3 receipts | 0 violations (and 0 on the r58 regression receipts) |
| `node chromium-receipt-r59.mjs <3 receipts> --json` | pre-fix: crash, empty stdout, exit 1 (×3); post-fix: genuine receipt -> exit 0 / predicate true / findingCount 0; both forgery shapes -> exit 1 with findings |
| `node --check chromium-receipt-r59.mjs` | syntax OK |
| read of `.ufo/waves/round-59/counters/adj-v19-selftest.json` (L1/meter seat's artifact) | allPass true, 37/37 cases pass (>= the frozen >= 28 floor) — observed only, not authored or run by me |
| `python3 instrument-integrity.py snap` / `diff` | no canonical instrument mutated by a non-author seat |

**Tooling:** no tool was installed, upgraded or removed by this seat (hence no
tool/version/channel/reason line to record); `curl 8.23.0`, `python3 3.14`, `node v24.21.0` and
`sha256sum` (coreutils) were already present and were used read-only.

**Scratch hygiene:** `/fast/scratch/hyaku/tabi-r59/R59Sentinel/` (my independent fetch bytes, the
four checker scripts, the probe receipts and the pacman/roster captures) was **deleted** before this
yield; every artifact cited above was copied into `sentinel/` and `sentinel/evidence/` first. No
/tmp or scratch path is cited as evidence anywhere in this report.
