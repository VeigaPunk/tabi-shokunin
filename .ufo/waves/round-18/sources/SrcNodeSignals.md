VERDICT: PASS

# SrcNodeSignals — Node.js v24 signal events: what installing a listener changes (round 18, C2)

Seat `TabiR18.SrcNodeSignals` (leaf). Access date **2026-10-20** for every fetch. Method: direct `curl`
GETs of the two URLs named by the assignment plus a versioned mirror and the release index; **no**
discovery search, no browser, no harness run, no counter. Quote verified only through the round-18
single normalizer (`recheck-fetch.mjs --normalize-only`); no C1 receipt was written and no C1 claim is
made here.

## 1. Fetch ledger (curl GET, 2026-10-20)

Every fetch used `curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-r18/1'`.
Because of `--compressed`, the on-disk body is the **content-decoded** UTF-8 document: each `sha256`
below is over that on-disk body, and each byte count equals the response `Content-Length`.

| # | URL | HTTP | bytes | validator | sha256 of on-disk body | decision |
|---|---|---|---|---|---|---|
| 1 | https://nodejs.org/docs/latest-v24.x/api/process.html | 200 | 359705 | `last-modified: Wed, 14 Oct 2026 07:48:13 GMT`, `etag: "2b0e6d94272c5fd8f9becfdf0495b30c"` | 5573303fa35e48625332b0f2fe18bc211b4e4b341d9c60ac2ed081ace1ae55f6 | canonical URL named by the assignment; `<title>` is `Process` plus Node.js v24.22.0 Documentation — retained as the drift witness (§6D), not the anchor |
| 2 | https://nodejs.org/docs/v24.21.0/api/process.html | 200 | 359605 | `last-modified: Tue, 08 Sep 2026 00:21:36 GMT`, `etag: "ca42e0b7409fd85152d8d182a634a6e2"` | 1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5 | versioned mirror of the host's Node 24.21.0; holds the pinned sentence (check B) |
| 3 | https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md | 200 | 134327 | git tag `v24.21.0` (no HTTP validator) | 3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7 | **anchor body**: tag-pinned text with line numbers |
| 4 | https://nodejs.org/dist/index.json | 200 | 333611 | release index | b52f521b8e24898364b74f03596afef1f97c1448014df7c2b5ebdcd2b69ca4a9 | release dates for the two revisions (§6D) |

Tag resolution (`git ls-remote https://github.com/nodejs/node`, read-only, 2026-10-20):

- `refs/tags/v24.21.0` → tag object `f37d7da830134b5314a14ced553273786a2bb4cd`, peeled commit
  **`955266bfdd854cd280dffd47548673914484e4c0`** — the revision the anchor cell pins.
- `refs/tags/v24.22.0` → tag object `f2bc3c738a0873ecb23e8a09e5c074e412c4c42f`, peeled commit
  `f14cd3aa7bf9ca8df2cc5b8bb14beb0f335b1d93` — what the rolling URL served on 2026-10-20.
- `index.json` dates: `v24.21.0` **2026-09-07** (lts Krypton), `v24.22.0` **2026-10-14** (lts Krypton).
- Host check: `node --version` → `v24.21.0`; `process.versions.node` → `24.21.0`. The host runs the
  version the anchor pins; the live page has already moved one patch past it.

## 2. Draft registry row — L1 assigns the id

The registry holds 57 rows and its highest id at the lane tip is `S057`
(`awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(...); print i}' corpus/SOURCES.md | sort -V | tail -1`).
`S058` is already claimed by C3/D4 (`supersedes S057`), so C2's rows occupy the `S059+` band, but the
band is not a queue: the Playwright launch seat provisionally holds `S059`
(`.ufo/waves/round-18/sources/SrcPwLaunch.md:115`). The cell therefore keeps `S0??` and this note claims
no number. Replace it before running `node scripts/check-sources.mjs` — the placeholder trips `bad_id`
by construction.

Row shape verified: 13 pipe fields = 11 cells, no `|` inside any cell (`awk -F'|' '{print "NF="NF}'` → 13).

| S0?? | Node.js v24 process — Signal events — https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events | docs | A | Node.js v24 on POSIX: SIGTERM/SIGINT/SIGHUP default exit codes and what installing a listener removes | tag v24.21.0 (commit 955266bfdd854cd280dffd47548673914484e4c0), doc/api/process.md:756-759 and :761-766, §Signal events; latest-v24.x served v24.22.0 (f14cd3aa7bf9ca8df2cc5b8bb14beb0f335b1d93) on 2026-10-20 | Installing a SIGTERM/SIGINT/SIGHUP listener removes Node's default 128+n exit, so an aborted run must write its receipt synchronously and exit 2 itself | queued | 2026-10-20 | on-release | — |

Why tier A for that scope: these are the Node.js project's own API docs, the authoritative statement of
what Node's process object does; the scope is deliberately narrowed to signal default behaviour and the
listener effect, not to any claim about Playwright, Chromium, supervisors or shells. Status is `queued`:
no `corpus/knowledge/` entry or lesson cites the id yet; flip to `mined` only with a real `used-by` path,
otherwise `check-sources.mjs` raises `mined_without_used_by`. Cadence `on-release` is warranted by §6D:
the same bullet was reworded between 24.21.0 and 24.22.0.

## 3. Gate entry — URL, date, quote, location, sha256

| Field | Value |
|---|---|
| URL (row source) | https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events — HTTP 200, served v24.22.0, body 359705 B, sha256 `5573303fa35e48625332b0f2fe18bc211b4e4b341d9c60ac2ed081ace1ae55f6` |
| Anchor URL (pinned revision) | https://nodejs.org/docs/v24.21.0/api/process.html — HTTP 200, body 359605 B, sha256 `1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5`; and https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md — HTTP 200, body 134327 B, sha256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7` |
| Access date | 2026-10-20 |
| Revision | tag `v24.21.0` (`refs/tags/v24.21.0` → `f37d7da830134b5314a14ced553273786a2bb4cd`, commit `955266bfdd854cd280dffd47548673914484e4c0`), released 2026-09-07 |
| Quote (20 words) | "If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit)." |
| Location | `doc/api/process.md:757-759`, §Signal events (`### Signal events`, :700), bullet `'SIGTERM'`/`'SIGINT'` (bullet spans :756-759); same sentence in the versioned HTML §Signal events, html-text offset 31411 |
| Normalizer check | `found:true`, offset 23798 on the md, offset 31411 on the v24.21.0 HTML (§4 A and B) |

## 4. Normalize-only output, pasted verbatim

```
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs \
    --normalize-only --decode none --body /tmp/tabi-r18-process-v24.21.0.md \
    --quote 'If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit).'
```
(**A**) exit 0:
```json
{"found":true,"offset":23798,"normalizedLength":130740,"window":"ut doing so might interfere with the debugger. * `'SIGTERM'` and `'SIGINT'` have default handlers on non-Windows platforms that reset the terminal mode before exiting with code `128 + signal number`. If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit). * `'SIGPIPE'` is ignored by default. It can have a listener installed. * `'SIGHUP'` is generated on Windows when the console window is closed, and on other platforms under various similar conditions."}
```

```
$ node ... --normalize-only --decode html-text --body /tmp/tabi-r18-signals-v2421.html \
    --quote 'If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit).'
```
(**B**) exit 0, versioned v24.21.0 HTML:
```json
{"found":true,"offset":31411,"normalizedLength":128647,"window":"tener but doing so might interfere with the debugger. 'SIGTERM' and 'SIGINT' have default handlers on non-Windows platforms that reset the terminal mode before exiting with code 128 + signal number . If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit). 'SIGPIPE' is ignored by default. It can have a listener installed. 'SIGHUP' is generated on Windows when the console window is closed, and on other platforms under various similar conditions. See sig"}
```

```
$ node ... --normalize-only --decode html-text --body /tmp/tabi-r18-signals-page.html \
    --quote 'If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit).'
```
(**C**) **exit 1** — the rolling URL no longer carries the pinned sentence:
```json
{"found":false,"offset":-1,"normalizedLength":128747,"window":null}
```

```
$ node ... --normalize-only --decode html-text --body /tmp/tabi-r18-signals-page.html \
    --quote 'Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty.'
```
(**D**) exit 0 — the sentence the rolling URL carries instead:
```json
{"found":true,"offset":31499,"normalizedLength":128747,"window":"t handlers on non-Windows platforms that reset the terminal mode before exiting with code 128 + signal number . If one of these signals has a listener installed, its default behavior will be removed. Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty. 'SIGPIPE' is ignored by default. It can have a listener installed. 'SIGHUP' is generated on Windows when the console window is closed, and on other platforms under various similar conditions. See sig"}
```

## 5. Facts this source carries for C2 H1 (each with its anchor)

| # | Fact (observed in the source) | Anchor |
|---|---|---|
| F1 | `'SIGTERM'` and `'SIGINT'` "have default handlers on non-Windows platforms that reset the terminal mode before exiting with code `128 + signal number`" | `doc/api/process.md:756-757` |
| F2 | "If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit)." | `doc/api/process.md:757-759` |
| F3 | `'SIGHUP'`: "the default behavior of `SIGHUP` is to terminate Node.js, but once a listener has been installed its default behavior will be removed." | `doc/api/process.md:761-766` |
| F4 | `'SIGKILL'` and `'SIGSTOP'` "cannot have a listener installed"; SIGKILL "will unconditionally terminate Node.js on all platforms" | `doc/api/process.md:778-780` |
| F5 | "Signals are not available on [`Worker`][] threads." | `doc/api/process.md:710` |
| F6 | `process.exit()` can lose output: writes are "not written at all if `process.exit()` is called before an asynchronous write completes", and pipes/sockets are _asynchronous_ on POSIX while files are _synchronous_ | `doc/api/process.md:4228-4247` (§A note on process I/O) |
| F7 | v24.22.0 only: "Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty." | live page §Signal events, offset 31499 (§4 D); **absent** from the v24.21.0 tag body (`grep -n 'Signal events are emitted asynchronously' doc/api/process.md` → exit 1, no match) |

Two facts from the lane's own round-17 artifact show the doc predicting both observed branches — cited,
not re-run here:

- `.ufo/waves/round-17/w2/SentinelHarnessAfter.md:18` — "Playwright's default handleSIGTERM closes the
  browsers, and its listener stops Node from exiting", then `verdict=fail`, exit 1. That is F2 in the
  lane's own frame: the listener Playwright installed removed Node's default exit, and nothing replaced it.
- `.ufo/waves/round-17/w2/SentinelHarnessAfter.md:34` — "SIGINT at 5 s: node status 130". That is F1
  exactly: 128 + 2, no listener on SIGINT in that run.

## 6. Projection onto PLAN §C2, and the drift

**A. H1 is feasible and its mechanism is now sourced.** H1 wants SIGTERM/SIGINT/SIGHUP → exit 2
`run_aborted`. F1+F2+F3 say the default for all three is termination with 128+n, and that installing a
listener removes that default. So H1 is met only if a listener is registered for **each** of the three
and the handler's last act is `process.exit(2)`; a handler that sets a flag and returns converts the
signal into "no exit at all", which is precisely the round-17 defect.

**B. Does the source contradict the PLAN?** No. Nothing here contradicts H1, H2, H3, H4, S1 or F6, and
nothing in the PLAN's C2 text is unsupported by these docs. Three implementation constraints the PLAN
text does not spell out follow from the source:

1. **The abort receipt must be a synchronous file write before `exit(2)`** (F6): a `console.error` to a
   pipe can be lost when `process.exit(2)` runs. H1's "never a `fail` receipt" is only met if the
   abort record is durable, not merely printed.
2. **H2's "every exit path" cannot include SIGKILL/SIGSTOP** (F4): those cannot be listened to, so an
   idempotent cleanup plus a marker written before the kill is the only coverage; a handler-based sweep
   is not "every path". [INFERENCE] The round-18 note should scope that phrase.
3. **A listener is not guaranteed to run if the loop is empty** (F7, v24.22.0 only): keep an explicit
   pending handle alive for the run's duration rather than treating the handler as the sole abort record.
   [INFERENCE] — the page states the condition but not why.

**C. Version scope.** The host runs 24.21.0, which is the anchor; the rolling `latest-v24.x` URL served
24.22.0 on 2026-10-20 (released 2026-10-14, F7). Cite the tag when claiming 24.21.0 behaviour; the
reworded live bullet is a newer statement, not the host's.

**D. Drift observed (append-only consequence).** Same bullet, two revisions: 24.21.0 ends
"(Node.js will no longer exit)"; 24.22.0 drops that parenthetical and appends the async-emission
sentence. Checks C and D in §4 are the two probes that show it. This is why the row's cadence is
`on-release` and why the anchor names both revisions rather than a bare URL.

## 7. Limits and unknowns

- These docs describe Node's own process behaviour only. The claim that Playwright installs
  SIGTERM/SIGINT/SIGHUP listeners is round-17's observation (H1 repair text names `handleSIGTERM`,
  `handleSIGHUP`, `handleSIGINT`); it is not re-derived here and belongs to the sibling Playwright row.
- F7's mechanism is not explained by the page; my reading of it is marked [INFERENCE].
- No harness, browser, or counter was run in this seat; no exit code in this note was produced by a run
  of the round-18 harness. The 130 in §5 is round-17's recorded observation.
- The Windows clauses in the same bullets (`SIGHUP` terminated ~10 s later on Windows; `SIGTERM` not
  supported on Windows) were read and are out of scope: the host is Linux.
- `SIGUSR1` is reserved for the debugger (`doc/api/process.md:753-755`); not used by the harness and not
  proposed as a signal for abort handling.

## Tooling

No tool installed or upgraded (host `curl`, `node` v24.21.0, read-only `git ls-remote`). Quote checks
used only `recheck-fetch.mjs --normalize-only`, which writes nothing.

Files written: `.ufo/waves/round-18/sources/SrcNodeSignals.md`
