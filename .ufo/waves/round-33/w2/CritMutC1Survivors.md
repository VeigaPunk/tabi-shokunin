# CritMutC1Survivors — receipt-level attack on gate v2's closure of the five unbuilt MutC1 survivors

Attacked revision: `042d6d9abf97d567d495652a85eabc851b81adc1` (the w1 integration commit every w2 seat
attacks). Gate under attack: `scripts/check-bidi-runtime.mjs` v2, sha256
`62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75`, 73041 bytes, `--selftest` 44 cases /
44 passed / exit 0. All work in one `git clone --shared` detached at that revision
(`$HYAKU_SCRATCH/tabi-r33/CritMutC1Survivors/clone`, toplevel asserted equal to the clone before the first
commit); the lane checkout, its index and its jj state were read-only throughout.

## Verdict

**Holds** for the assigned attack: v2 refuses all five round-32 MutC1 survivors that w1 only closed as
self-test cases (M11 driver digest, M06 error frame, M04 cross-run `chromedriverVersion`, M18 well-formed PNG
with wrong IHDR, M17 non-loopback `webSocketUrl`) on the **production path** — committed blobs in a real
repository, no fixture injection, no `--live` — each at the check its self-test case names: M11 and M17 at
the receipt leg (`t1-receipt`, `scripts/check-bidi-runtime.mjs:773` and `:389`), M04 at binding
(`t3-binding`, `:822`), M06 and M18 at the row predicates over a committed transcript (`t2-run`, R2 at `:286` and R4 at
`:295-298`). Each refusal is *carried* by exactly that check and not by an incidental tell: re-applying that
survivor's single-point weakening to v2 admits the same receipt with `admitted 16/17 failing 0` in five of
five cases, while every weakened gate still admits the honest revision (control) and is killed only by its
own named self-test case (44→43 passed, exit 3). The self-test's declared reason equals the production
reason for all five, so there is no fixture/production divergence in this slice. Two adjacent findings
outside the assigned five, both **low**: a *near copy* of the gate accepted as the receipt's "driver"
(the byte-equality clause is defeated by one appended comment line, `S-KILL 1`), and a hybrid screenshot
transcript admitted because R4 is existential while the t3 pin covers only the first capture (`S-KILL 2`).
Neither adds an admission class beyond v2's own disclosed synthetic-transcript limit; both are recorded so
the C2 closure wording can be read at its true strength.

## Constructions (one commit each on REV in the scratch clone)

Entry, baseline, receipt and transcripts are the lane's honest ones
(`corpus/knowledge/webdriver-bidi-runtime-round-32.md`, base `d805d1d6132430118b206a848b85753ab35d1014`,
`corpus/evidence/round-32/bidi/receipt.json` + `run1`/`run2`), so every construction is *honest evidence plus
one targeted defect*; each changed transcript's `transcriptSha256` was recomputed in the receipt so the t1
digest arm passes and the defect is the only thing left to find.

| id | construction (single defect) | commit |
|---|---|---|
| V0 | honest revision, unchanged (control) | `042d6d9abf97` |
| V1 | `receipt.driverSha256 = "0"×64`, driver path/bytes untouched (M11) | `263021247d07` |
| V2 | run1's `browsingContext.getTree` recv frame rewritten to `{id, type:"error", error:"unknown command", message, result:<original result with contexts>}` (M06) | `adfffbd202fd` |
| V3 | run2's `capabilities.chrome.chromedriverVersion = "155.0.0.0 (other build)"` (M04) | `a3caa59c17b6` |
| V4 | both runs' first `captureScreenshot` data replaced by one identical, genuinely valid 100×100 RGBA PNG, 119 bytes, sha256 `46a42303f8d329f8f0902007fbf69799d461993ca88476b766bca97d47efa9b8` (`file`: "PNG image data, 100 x 100, 8-bit/color RGBA, non-interlaced") (M18) | `67e3c9a878e2` |
| V5 | both runs' `webSocketUrl` → `ws://10.0.0.1:37279/session/10abbb479bdcc37a405098c5ea778bf0` (session segment retained, so only loopback-ness is wrong) (M17) | `37bcc2141ab5` |
| V6 | receipt's `driver` = `corpus/evidence/round-32/bidi/near-copy-driver.mjs`, the gate's own bytes + one appended comment line (73085 B, sha256 `b1c0c7b168322cae65e87054262a47f423555cede913ab4478a8b52006290df3`), `driverSha256` correct for it (`S-KILL 1`) | `23a16a4ba7fe` |

Mutant gates (single-point weakenings of v2, built by `mkmut.mjs`, each replacement asserted to match exactly
once): `m11-driver-sha-not-compared` (`:773` → `else if (false)`, digest equality dropped),
`m06-ok-accepts-any-frame` (`:239` → `c && c.response`), `m04-cdv-presence-only` (`:822`, equality dropped),
`m18-png-dims-unchecked` (`:298` → any decodable PNG), `m17a-r1-loopback-loosened`
(`:147` `WS_LOOPBACK` → `/^ws:\/\//`), `m17b-sessionof-loopback-dropped` (`:389` clause deleted),
`m17c-both-loopback-dropped` (both). Note `WS_LOOPBACK` is shared by R1 (`:220`) and `sessionOf` (`:389`), so
m17a loosens both loops at once; m17b is the stage that isolates *which* loop is load-bearing.

## Evidence

### Gate runs (offline; `--repo <clone> --rev <variant> --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json`, cwd = clone, no `--live`)

| variant | gate | exit | population | admitted | failing | reason carried by | detail (gate's own row text) |
|---|---|---|---|---|---|---|---|
| V0 | pristine | 0 | 17 | 16 | 0 | — | — (R16 `no` counted as unmeasured) |
| V1 | pristine | **1** | 17 | 0 | 16 | `t1-receipt` | `driver sha256 differs: scripts/bidi-loopback-round32.mjs` |
| V1 | m11 | 0 | 17 | 16 | 0 | — | admits |
| V2 | pristine | **1** | 17 | 15 | 1 | `t2-run` (R2) | `run1: no getTree with contexts` |
| V2 | m06 | 0 | 17 | 16 | 0 | — | admits |
| V3 | pristine | **1** | 17 | 0 | 16 | `t3-binding` | `chromedriverVersion absent or differs between runs` |
| V3 | m04 | 0 | 17 | 16 | 0 | — | admits |
| V4 | pristine | **1** | 17 | 15 | 1 | `t2-run` (R4) | `run1: screenshot is not a PNG of the pinned viewport` |
| V4 | m18 | 0 | 17 | 16 | 0 | — | admits |
| V5 | pristine | **1** | 17 | 0 | 16 | `t1-receipt` | `run1: webSocketUrl is not a loopback ws session url: ws://10.0.0.1:37279/session/10abbb479bdcc37a405098c5ea778bf0` |
| V5 | m17a | 0 | 17 | 16 | 0 | — | admits |
| V5 | m17b | 1 | 17 | 15 | 1 | `t2-run` (R1) | `run1: webSocketUrl not a loopback ws url` |
| V5 | m17c | 0 | 17 | 16 | 0 | — | admits |
| V6 | pristine | **0** | 17 | 16 | 0 | — | **near-copy gate accepted as driver** (`S-KILL 1`) |
| V7 (hybrid) | pristine | **0** | 17 | 16 | 0 | — | **R4 satisfied by an unpinned later capture** (`S-KILL 2`); R4 row `admitted:true, reason:null` |

Controls (each mutant gate on the honest revision V0/REV): all seven `exit 0 admitted 16/17` — no mutant is
"killed" by breaking the honest receipt.

Self-test identity of the mutants (`--selftest --json`, cwd = clone): pristine `exit 0 cases 44 passed 44`;
every mutant `exit 3 cases 44 passed 43`, failing exactly its own case —
`m11 → v2-m11-driver-sha-differs`, `m06 → v2-m06-error-frame-as-success`,
`m04 → v2-m04-runs-chromedriver-differ`, `m18 → v2-m18-png-wrong-dimensions`,
`m17a/m17b/m17c → v2-m17-ws-url-off-loopback`. This ties each production refusal to the named case rather
than to a coincidental similarity.

### What the two low findings mean precisely

* **`S-KILL 1` — near-copy gate as driver. Defect, low (wording gap), `scripts/check-bidi-runtime.mjs:774`
  (exact-byte comparison) vs `SKILL.md` round-33 row "a driver that is the gate or imports it beyond the
  allow-list".** V6's driver differs from the gate by one appended comment (`diff` reports only
  `1175d1174 < // recorded by the round-32 loopback driver`), so `sha256(drv) === sha256(gateBuf)` is false,
  `driverGateFinding()` sees only the gate's `node:` builtin imports and returns null, and the receipt is
  admitted. The gate's own header is literal ("its bytes"), so this is a limit against the code header and a
  defect against the SKILL/claims wording. It admits no evidence the disclosed synthetic-transcript limit
  does not already admit (a gate-derived driver can only produce the transcripts v2 already refuses to
  distinguish from real ones), hence *low*: the harm is misstatement of the closure, not a new forgery class.
  Smallest safe correction: either compare a normalised digest (comments/whitespace stripped from both
  blobs) at `:774`, or reword the SKILL row and the `:48-56` header to "a byte copy of this gate" and add the
  near-copy to `Limits`.
* **`S-KILL 2` — R4 is existential, the pin is not. Limit, low, `scripts/check-bidi-runtime.mjs:298` and
  `:816-824`.** V7 keeps V4's 100×100 first capture in both runs (so `t3-binding`'s `firstShot` equality
  passes) and appends one extra successful 640×480 capture at the end of each wire log; R4's
  `shots.some(...)` then holds and the gate exits 0. R4's stated predicate ("a successful screenshot decodes
  as a PNG whose IHDR is exactly 640x480") is still literally true of the transcript, so this is a limit, not
  a false claim — but it means the M18 construction is refusable only when *every* capture has the wrong
  size, and the t3 pin binds only the first. With `--live`, the wrong first shot is caught at `:824`
  (`firstShot(liveRec) !== shots[0]`) — read statically; no `--live` run was made and none is claimed.

### Commands and exit codes

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                          # 0
git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1                        # 0
git -C "$S/clone" rev-parse --show-toplevel                                                            # $S/clone (0)
sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"                                                    # 62453b55…ac75 (0)
node "$S/mkmut.mjs" "$S/clone/scripts/check-bidi-runtime.mjs" "$S/mut"                                 # 0 (7 mutants)
node "$S/probe.mjs" "$S"                                                                              # 0 (7 variants × gates + 7 controls)
node "$S/probe2.mjs" "$S"                                                                             # 0 (V7 hybrid)
(spawned by probe.mjs, cwd=clone, no --live; the V0 reading)
node scripts/check-bidi-runtime.mjs --repo "$S/clone" --rev 042d6d9… --baseline d805d1d6…
    --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --json   # spawned: exit 0, admitted 16/17
node <each mutant>.mjs --selftest --json                                                              # exit 3, 43/44, own case
```

Every variant commit was made with `-C "$S/clone"` and `-c user.name=CritMutC1Survivors
-c user.email=CritMutC1Survivors@scratch.local`; the clone was reset with
`checkout -q --force --detach 042d6d9…` + `clean -q -fdx` between variants and is back at REV with
`git status --porcelain` empty. No lane file, index or jj state was written; no sibling repo was touched; no
commit outside `$S/clone`; no subagent dispatched; nothing installed or upgraded (node v24.21.0, git, no
browser needed).

## Deliverable paths

- `.ufo/waves/round-33/w2/CritMutC1Survivors.md` — this report.
- `.ufo/waves/round-33/w2/CritMutC1Survivors/results.json` — full per-variant/per-gate readings incl. row
  details and self-test matrix; `results-v7.json` — the hybrid probe.
- `.ufo/waves/round-33/w2/CritMutC1Survivors/variants/*.diff` — each construction as a diff against REV
  (V6's includes the near-copy driver in full); `v1-m11-receipt.json`, `v5-m17-receipt.json`,
  `v6-near-copy-receipt.json`, `m18-100x100.png`.
- `.ufo/waves/round-33/w2/CritMutC1Survivors/mut/` — the seven mutant gates, `manifest.json`, `mutants.diff`.
- `.ufo/waves/round-33/w2/CritMutC1Survivors/{mkmut,probe,probe2}.mjs`, `probe.log` — reproduction.

Scratch `/fast/scratch/hyaku/tabi-r33/CritMutC1Survivors` is deleted after the copies above; this seat
started no chromedriver/chromium, and `pgrep -fa 'chromedriver|chromium'` shows no line it owns (only the
host `earlyoom` daemon, whose `--prefer` regex contains the word `chromium`, and a sibling seat's `curl`).
