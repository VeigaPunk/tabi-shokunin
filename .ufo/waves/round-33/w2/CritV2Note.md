# CritV2Note — `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` at 042d6d9a (round 33, w2, C2)

**Verdict: two defects, both low and both evidential, in §7's live bullet; the rest holds.** I re-ran
the frozen battery at the integrated revision and got every headline number in §7 exactly
(predicate true, H0/H1/H2 at population 17 / admitted 16 / failing 0, forgeries 0/8 with the reason
ids §7 names, `digestLiterals []`, `--selftest` 44/44 exit 0), reproduced the controls J1/J2/J3, and
re-ran the integrated **live** leg myself: it reads `population 17 / admitted 16 / failing 0 /
unmeasured 1 / distinct 16 / live true`, `binding: null`, exit 0 — i.e. the number at `:299` is true.
But **no committed receipt carries that live reading**: the only two committed receipts that carry
those counted fields (`measure/noharm-at-bf48b81.txt:7`, `w2/RerunNoHarm/noharm-at-042d6d9.txt:7`)
say `live=false`, every committed live JSON is v1 vocabulary at another revision, and the entry's own
line is the only place the `live=true` form appears (lane-wide grep). That is a "readings match the
committed receipts" defect, not a false number. Second: `:301-302` cites
`w1/ExecLiveLeg/sandbox-probe.txt` for "setuid `chrome-sandbox` and
`kernel.unprivileged_userns_clone=1`", and that file (20 lines, read in full) contains neither string
(`grep -n 'chrome-sandbox\|userns\|setuid'` → exit 1); the facts are true on this host and are
recorded at `w1/ExecLiveLeg.md:105-106`. The provenance trio resolves, every S127–S129 anchor and
digest matches the pinned upstream bytes, every quote is located, and the disclosed limits
(finite battery, offline predicate, narrow digest clause, shared driver/fixture) match the frozen
claim cells.

## What I attacked

1. Provenance trio: `source:` (`:1`) → registry rows S127–S129; `verified-at:` (`:2`); `recheck:` (`:3`).
2. Every number carries its command — re-derived, not read.
3. Every quote located at its cited line/receipt.
4. §7 readings against the committed receipts.
5. Limits honest: finite battery, offline-only predicate, digest-clause narrowness.
6. S127–S129 cited for what they actually say, against the pinned upstream bytes.

## Evidence (commands, exit codes)

Scratch clone (contract shape), read-only git in the lane, no writes outside my dirs:

```
$ git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 042d6d9a…   # clone-ok, toplevel $S/clone
$ git -C "$S/clone" show b7d16fb:scripts/check-bidi-runtime.mjs > $S/gate-v1.mjs
$ sha256sum $S/gate-v1.mjs   → 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393   # = §1's gateSha256
$ git -C "$S/clone" show 042d6d9a:scripts/check-bidi-runtime.mjs | sha256sum   → 62453b55…8deac75  # = provenance-bf48b81.txt
```

**§7 numbers, re-derived** (frozen counter, integrated revision, my clone):

```
$ TMPDIR=$S/tmp node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev 042d6d9a… --repo "$S/clone" --json
exit=0 → {"rev":"042d6d9a…","gateSha256":"62453b55…","predicate":true,"honest":{"H0":true,"H1":true,"H2":true},
          "forgeriesAccepted":0,"forgeriesTotal":8,"acceptedForgeries":[],"digestLiterals":[],
          "selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44"}}
H0 0 17 16 0 · H1 0 17 16 0 · H2 0 17 16 0
F1 1 … t1-receipt · F2 x3-duplicate-id · F3/F4 t1-receipt · F5/F6 t1-receipt
F7 exit 1, pop 17, admitted 15, failing 1, x4-measured-cell · F8 entryFinding s1-source-row, failing 17
```

The recheck line itself (`:3`) runs as written — from the clone, default repo, `--rev HEAD`:

```
$ cd "$S/clone" && TMPDIR=$S node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev "$(git rev-parse HEAD)" --json
exit=0 → predicate true, forgeriesAccepted 0, selftest exit 0 cases=44 passed=44
$ cd "$S/clone" && node scripts/check-bidi-runtime.mjs --selftest --json
exit=0 → {"cases":44,"passed":44}
```

Selftest case set (attacks §2 rule 5 and §7 bullet 2): the 27 v1 ids are **all** present in the 44 and
none failing (`comm -23` empty; 17 new ids = `v2-f1…v2-f8` + `v2-m04…v2-m19`); `mutants.json` gives
each of the nine survivors exactly one `failedCases` entry naming its own `v2-mXX` case.

**§7 live bullet, re-derived** (integrated gate, `--live`, own loopback fixture only):

```
$ cd "$S/clone" && TMPDIR=$S timeout 240 node scripts/check-bidi-runtime.mjs --rev HEAD \
    --baseline d805d1d… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
live-exit=0 → {"rev":"042d6d9a…","population":17,"admitted":16,"failing":0,"unmeasured":1,
               "distinct":16,"live":true,"clean":true,"binding":null,"entryFinding":null}
```

So the fields at `:299` are reproducible — which is what makes F1 a citation defect rather than a
false claim. But the lane holds no receipt for them:

```
$ ls .ufo/waves/round-33/measure/ → c1-at-bf48b81.*, c2-at-bf48b81.*, noharm-at-bf48b81.txt,
                                    provenance-bf48b81.txt, selfassessment-at-bf48b81.json
$ grep -n 'live' .ufo/waves/round-33/measure/noharm-at-bf48b81.txt:7
  … population=17 admitted=16 failing=0 unmeasured=1 distinct=16 live=false
$ grep -rn 'population=17 admitted=16 failing=0 unmeasured=1 distinct=16' .
  entry:299  (live=true)   measure/noharm-at-bf48b81.txt:7 (live=false)   w2/RerunNoHarm/*  (live=false)
$ jq -c '{rev,population,admitted,live}' .ufo/waves/round-33/w1/ExecLiveLeg/live-out.json
  {"rev":"2b64a52e…","population":16,"admitted":16,"live":true}          # v1 vocabulary, v1+live patch only
$ jq -c '{rev,population,live}' .ufo/waves/round-33/w1/SentinelLiveLeg/live-L1.json   # and L2/L3/live-delete
  {"rev":"e6b0a90…","population":16,"live":true}                          # v1 vocabulary
```

**§6 controls** (read, matched value for value):

```
baseline/c2-J1-do-nothing.json   predicate false, honest all true, 8/8 accepted, selftest 27/27, exit 1 (provenance)
baseline/c2-J2-reject-all.json   predicate false, honest all false, 0/8, selftest 27/27, exit 1 (scratch 285fac1b…)
baseline/c2-J3-whitelist.json    predicate false, honest true, 0/8, digestLiterals [8aa97463c238,9918a716da71,
                                 92bd413caab0,b9dab912f0af,55dbef88ed4b], selftest exit 3 verdict=failed 27/25
```

**S127–S129 against the pinned upstream bytes** (curl `--proto =https`; records in
`w2/CritV2Note/fetch-log.tsv`, fetched files in `w2/CritV2Note/`):

| row | citation in note | served bytes | verdict |
|---|---|---|---|
| S127 | `util.cc:39-43`, `commands.cc:96-97`, `session_commands.cc:288-289` and `:372` | util.cc b64 26200 B sha256 `e3e0d00f…2e00d4`, decoded sha256 `3ed654c7…be37b` | **exact**: `:39-43` is `GenerateId()` — two `base::RandUint64()`s printed `"%016" PRIx64 "%016" PRIx64`; `commands.cc:96-97` `new_id = GenerateId()`; `session_commands.cc:288-289` builds `"ws://" + host + "/session/" + session->id`; `:372` `body.Set("sessionId", session->id)` |
| S128 | PKGBUILD `871c2ad9…`, `launcher.c` `a7ed2cb8…`: `:15`, `:18-29`, `:93-94`, `:124`; Makefile pins `CHROMIUM_BINARY` | PKGBUILD sha256 `a6fd458b…961be`, launcher.c sha256 `b2772fe0…82624`, Makefile sha256 `1bed55f7…b508c` | **exact**: `:15` `g_build_filename("/etc", CHROMIUM_NAME "-flags.conf", …)`; `:18-29` XDG_CONFIG_HOME else HOME/.config; `:93-94` `g_slist_concat(get_flags(system), get_flags(user))`; `:124` `execv(CHROMIUM_BINARY, …)`; Makefile `:5` `CHROMIUM_BINARY = /usr/lib/$(CHROMIUM_NAME)/…`, `:30` install; PKGBUILD `:444` installs `out/Release/chrome` to `usr/lib/chromium/chromium` |
| S129 | `sandbox/linux/README.md` §Overall Design `:20-27`, §setuid(2) `:36-52`; `sandbox/policy/switches.cc:42-44` | README decoded 4009 B sha256 `01c03346…f9a2`; switches.cc sha256 `b30542ce…39043` | **exact**: `:20-27` lists setuid(2) everywhere / namespaces / seccomp-BPF; `:36-52` PID+network namespaces, chroot, `prctl` undumpable, `capset` drop; `:42-44` "Disables the sandbox for all process types that are normally sandboxed." |

**Host facts in §4** (re-measured now, same day):

```
$ stat -c '%s' /usr/bin/chromium → 14424 ; sha256sum → eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b
$ pacman -Q chromium → chromium 154.0.8037.97-1
$ echo $XDG_CONFIG_HOME → /home/vgpnk/.config      # set, as §4 says
$ wc -l ~/.config/chromium-flags.conf → 5 ; grep -c -- --no-sandbox → 0 ; grep -c -- --load-extension → 1 ; /etc/chromium-flags.conf absent
$ stat -c '%A %U' /usr/lib/chromium/chrome-sandbox → -rwsr-xr-x root
$ cat /proc/sys/kernel/unprivileged_userns_clone → 1
```

**Quotes located**: `no — no BiDi command` (round-32 entry `:82`, verbatim); the kill-rule quote at
§4/§5(d) ("not part of this predicate … no-harm evidence only") is verbatim from claims C2
`killRule`; §5(a)/(c) match `feasibilityDisclosed`; §2 rule 6's quote ("header comment rewritten to
state v2's rules and limits") is verbatim from the ExecGateV2 seat item; the SentinelPerimeter quote
(`:70-72`, "both legs must use the same flags") is at that line; `criterion 86` sits at
`corpus/QUALITY.md:520-528`; `round-32-verifier-spotcheck.md:148` and `:64` say what §3 says; lesson
M2 (`:74` heading, `:79` text) names the three imports. Gate-v1 line citations all landed:
`:101,:102,:120,:121,:122,:126,:142,:154,:214,:341,:372,:496,:508,:514-515,:528,:529,:534,:550-551,:590,:601,:628`.
Counter line citations all landed: `:21,:25-42,:65-71,:72,:203,:217,:222,:229`.

**Limits**: §5(a) "eleven variants, eight constructions" = `VARIANTS` 11; §5(b)'s premise verified
(`sessionId 10abbb479bdcc37a405098c5ea778bf0`, context `31B8FE9C25C36020CBB175F250715903`,
`ws://127.0.0.1:37279/session/10abbb…`); §5(c) matches the counter's 12-hex prefix scan
(`:222`) and J3; §5(d) matches `killRule`; §5(e) matches the counter's H2 source
(RerunDriver pair, same `driverSha256 55dbef88…`). The §2 integration-hazard paragraph is consistent
with the two patches: `v2.patch` rewrites `-1,58` and `-63,7` (header block) while `live.patch` edits
`-21,7` and `-71,7` inside it (code hunks `-369,9`, `-398,11` are disjoint) — a mechanical second
`git apply` must conflict.

## Findings

| # | kind | severity | finding | evidence |
|---|---|---|---|---|
| F1 | **defect (evidential)** | low | §7 bullet 4 states an integrated live reading with no committed receipt. The four counted fields it quotes are the **offline** values; the only committed receipts carrying them say `live=false`, and the live JSONs that exist are v1 vocabulary at other revisions. The parenthetical names `live-out.json` as a *different* run, and "L1 run, 2026-10-26" names no file. | `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:298-302`; `measure/noharm-at-bf48b81.txt:7` (`live=false`); `w2/RerunNoHarm/noharm-at-042d6d9.txt:7` (`live=false`); `w1/ExecLiveLeg/live-out.json` rev `2b64a52e` population 16; `w1/SentinelLiveLeg/live-L{1,2,3}.json` rev `e6b0a90` population 16; lane-wide grep → `:299` is the only `live=true` with these fields. I reproduced the value (`w2/CritV2Note/live-at-042.json`, exit 0), so the fix is a receipt, not a retraction. |
| F2 | **defect (citation)** | low | §7's sandbox sentence attributes "setuid `chrome-sandbox` and `kernel.unprivileged_userns_clone=1`" to `sandbox-probe.txt`; that file contains neither fact. The facts are true (measured above) and are recorded in the seat's report. | `:301-302`; `w1/ExecLiveLeg/sandbox-probe.txt` is 20 lines and `grep -n 'chrome-sandbox\|userns\|setuid'` → **no match, exit 1** (its content: shell ns, session versions, child seccomp table, `no-sandbox-in-browser-argv: 0`); the two facts are at `w1/ExecLiveLeg.md:105-106` (and `:11`). |
| N1 | nit | — | `noHarmRule` is attributed to "claims C2"; it is a **top-level** `claims.json` field — C2's keys are `axis, before, commandShowingSurfaceUnmoved, controls, countingCommand, feasibilityDisclosed, id, killRule, predicate, surface, target, type`. The quoted content is correct. | `:286`; `jq -c '.claims[]|select(.id=="C2")|keys'` |
| N2 | nit | — | `proxy2.log` is cited as a committed probe; it is not in the lane (`find . -name proxy2.log` → nothing; only two prose mentions). The claim is still supported by F2's quoted log line. | `:173`; `w1/SentinelPerimeter.md:100` |
| N3 | nit | — | The measured revision is named only by the glob `measure/c2-at-*.json` (`verified-at:`, `:303-304`); the 40-hex `bf48b81…` appears nowhere in the entry. The glob resolves to one file whose values match my run. | `:2`, `:303` |

### Smallest safe correction

- F1: commit the integrated live run (`check-bidi-runtime.mjs --rev 042d6d9a --baseline d805d1d…
  --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json`, exit 0, the six fields
  above) under `.ufo/waves/round-33/measure/` and cite it in the bullet, or delete the five counted
  fields and cite `live-out.json`'s v1 live reading (16/16/0) with "the integrated live leg unmeasured
  this round". Either way, one line.
- F2: change the citation `sandbox-probe.txt` → `ExecLiveLeg.md:105-106`, or add the two probe lines
  (`ls -l /usr/lib/chromium/chrome-sandbox`, `sysctl kernel.unprivileged_userns_clone`) to the probe
  receipt and re-commit it.

## What holds (could not be broken)

- S127/S128/S129: every anchor and every digest matches the pinned upstream bytes (table above);
  registry rows 141–143 are `mined`, name this entry, and state the same claim text.
- All headline numbers in §1, §6, §7 reproduce at 042d6d9a (battery, selftest, controls, host facts).
- v1's holes are described accurately: `:508` yes-filter (F2/F7 15/15), `:528` single literal driver
  path, `:529`/`:534` count+digest only, `:550-551` screenshots+driverVersion only, golden constants
  `"X"` at `:628` and `"C1"` at `:601` never compared to the receipt; and v1's refusals (`t3-binding`
  0/16 v0; `s1-source-row` for `queued` v5 and present-at-baseline v7).
- The driver/allow-list section: gate exports at the 13 cited lines; `DRIVER_ALLOW` at v2 `:144` is
  exactly the six names the note lists; the round-32 driver's import line, its local `DATA_TEXT`
  duplicate, and `driverSha256 55dbef88…` all match.
- §7 bullet 2 (nine survivors, one case each) and the 27-v1-case preservation claim.
- §7's own predicate sentence: predicate true with `digestLiterals []`, and the gate source carries no
  12-hex prefix (`grep -c` of each of the five → 0).

## Network fetches (read-only, `curl -q -sS --proto '=https'`)

| UTC | status | bytes | sha256 | URL |
|---|---|---|---|---|
| 18:49:43 | 200 | 26200 | e3e0d00fb3d7a2b68212b40868e901dda14e74574f0c60077ac80eeb5b2e00d4 | …/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT |
| 18:49:44 | 200 | 20924 | 4bc5d8dccea1bbbe6188d3903e443b2cc22aa789fc8d4bccbb952dc403d64f22 | …/chrome/test/chromedriver/commands.cc?format=TEXT |
| 18:49:45 | 200 | 90944 | c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e | …/chrome/test/chromedriver/session_commands.cc?format=TEXT |
| 18:49:47 | **503** | 1459 | aa3a9d3dae5552661b8ec5f20cbd82d7c3b358988d515b239bcd9700ca7d3ddc | …/sandbox/linux/README.md?format=TEXT (first attempt; error page — control) |
| 18:50:40 | 200 | 5348 | 5a1ddc20bcfde734007c3b93200ce7e18c40a6f89c9a60683ec25649b208c2be | same URL, retry (decodes to 4009 B, sha256 `01c03346…f9a2`) |
| 18:49:47 | 200 | 4268 | a614c36721de60e7ba883903b11f82f621e4eaa07d1224522e27b581c950b81a | …/sandbox/policy/switches.cc?format=TEXT |
| 18:49:48 | 200 | 18285 | a6fd458b70bc4aa4abab0b64f003a03825a86e865a37b8543eb89dc54cd961be | gitlab.archlinux.org/…/chromium/-/raw/871c2ad9…/PKGBUILD |
| 18:50:24 | 200 | 3546 | b2772fe008deb15b9cc7c4a42dab6ec73ccb1bf22674eea14dde3fc832182624 | raw.githubusercontent.com/foutrelis/chromium-launcher/a7ed2cb8…/launcher.c |
| 18:50:24 | 200 | 1219 | 1bed55f744e5506dd5d792f0cda9746238fe76566a074aa35e503660fbcb508c | …/a7ed2cb8…/Makefile |

No other network use. No logins, cookies, tokens or consequential actions.

## Hygiene

- One browser run (the integrated `--live` leg): `/usr/bin/chromedriver` + headless chromium on this
  host build, gate-owned throwaway profile/HOME/XDG, loopback fixture only. Afterwards
  `pgrep -fa 'chromedriver|chromium'` → one line, the host `earlyoom` command; **no process of mine
  survives**.
- Writes: only `.ufo/waves/round-33/w2/CritV2Note.md`, `.ufo/waves/round-33/w2/CritV2Note/`, and
  scratch `/fast/scratch/hyaku/tabi-r33/CritV2Note/` (clone, TMPDIR, fetches). No lane tracked file,
  index, jj state, fleet-repo or sibling-repo write; every git call named `-C <clone>` after verifying
  its toplevel; commits (if any) only inside the clone the counter made, identity `battery`.
- Tooling: nothing installed or upgraded (node v24.21.0, jq, git, curl already present; pacman
  untouched). Scratch removed after the receipts below were copied.

## Deliverables

- Report: `.ufo/waves/round-33/w2/CritV2Note.md`
- Receipts: `.ufo/waves/round-33/w2/CritV2Note/` — `battery-at-042.json` (frozen battery at
  042d6d9a, exit 0, predicate true), `live-at-042.json` (integrated `--live`, exit 0, the six fields),
  `recheck-form.json` (the entry's `recheck` command form, exit 0), `v1-selftest.json` (27/27),
  `v2-selftest.json` (44/44), `fetch-log.tsv`, and the fetched pins (`util.cc`, `launcher.c`,
  `launcher-Makefile`, `PKGBUILD`, `sandbox-linux-README.md`, `sandbox-policy-switches.cc`).
