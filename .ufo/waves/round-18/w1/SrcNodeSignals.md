VERDICT: PASS

# SrcNodeSignals — report (round 18 W1, C2 source seat)

Seat `TabiR18.SrcNodeSignals` (leaf). Access date **2026-10-20**. Full note:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcNodeSignals.md`.

## What was opened (curl GET only; no browser, no harness, no counter)

| URL | HTTP | bytes | revision marker | sha256 (on-disk, content-decoded body) |
|---|---|---|---|---|
| https://nodejs.org/docs/latest-v24.x/api/process.html | 200 | 359705 | served **v24.22.0**, `last-modified: Wed, 14 Oct 2026 07:48:13 GMT`, `etag: "2b0e6d94272c5fd8f9becfdf0495b30c"` | 5573303fa35e48625332b0f2fe18bc211b4e4b341d9c60ac2ed081ace1ae55f6 |
| https://nodejs.org/docs/v24.21.0/api/process.html | 200 | 359605 | v24.21.0 mirror, `last-modified: Tue, 08 Sep 2026 00:21:36 GMT`, `etag: "ca42e0b7409fd85152d8d182a634a6e2"` | 1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5 |
| https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md | 200 | 134327 | tag `v24.21.0` | 3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7 |
| https://nodejs.org/dist/index.json | 200 | 333611 | release index | b52f521b8e24898364b74f03596afef1f97c1448014df7c2b5ebdcd2b69ca4a9 |

Tag identity (`git ls-remote https://github.com/nodejs/node`, read-only): `refs/tags/v24.21.0` →
`f37d7da830134b5314a14ced553273786a2bb4cd`, peeled commit
**`955266bfdd854cd280dffd47548673914484e4c0`**, released 2026-09-07 (lts Krypton). `v24.22.0` →
`f14cd3aa7bf9ca8df2cc5b8bb14beb0f335b1d93`, released 2026-10-14. Host `node --version` → `v24.21.0`, so
the tag-pinned body is the host's own text; the rolling URL has moved one patch ahead.

## Draft registry row — L1 assigns the id (`S0??`; registry max at B is S057, S058 is C3's, C2 band is S059+)

Note on numbering: this note claims **no** specific id. `S059` is provisionally held by the Playwright
launch seat (`.ufo/waves/round-18/sources/SrcPwLaunch.md:115`), so the L1 must assign distinct ids across
the six C2 rows.

| S0?? | Node.js v24 process — Signal events — https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events | docs | A | Node.js v24 on POSIX: SIGTERM/SIGINT/SIGHUP default exit codes and what installing a listener removes | tag v24.21.0 (commit 955266bfdd854cd280dffd47548673914484e4c0), doc/api/process.md:756-759 and :761-766, §Signal events; latest-v24.x served v24.22.0 (f14cd3aa7bf9ca8df2cc5b8bb14beb0f335b1d93) on 2026-10-20 | Installing a SIGTERM/SIGINT/SIGHUP listener removes Node's default 128+n exit, so an aborted run must write its receipt synchronously and exit 2 itself | queued | 2026-10-20 | on-release | — |

Shape checked with the census rule: `awk -F'|' '{print "NF="NF}'` on the row line → **NF=13** (11
cells, no `|` inside a cell). Status `queued` because no lesson/knowledge path cites it yet; replace
`S0??` before `node scripts/check-sources.mjs` (the placeholder trips `bad_id` by construction).

## Gate entry

| Field | Value |
|---|---|
| URL | https://nodejs.org/docs/latest-v24.x/api/process.html#signal-events (200, served v24.22.0, 359705 B, sha256 `5573303fa35e48625332b0f2fe18bc211b4e4b341d9c60ac2ed081ace1ae55f6`) |
| Access date | 2026-10-20 |
| Revision | tag v24.21.0, commit `955266bfdd854cd280dffd47548673914484e4c0`; anchor body https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md, 134327 B, sha256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7` |
| Quote (20 words) | "If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit)." |
| Location | `doc/api/process.md:757-759`, §Signal events, bullet `'SIGTERM'`/`'SIGINT'` (bullet :756-759); same sentence at html-text offset 31411 of the versioned v24.21.0 page |
| sha256 | md `31078797…86ab3b7`; versioned HTML `1224adf1…9180a4b5`; rolling HTML `5573303f…ace1ae55f6` |

## Normalize-only output (verbatim; `recheck-fetch.mjs --normalize-only`, writes nothing)

A. `--decode none --body process.md` → exit 0:
```json
{"found":true,"offset":23798,"normalizedLength":130740,"window":"ut doing so might interfere with the debugger. * `'SIGTERM'` and `'SIGINT'` have default handlers on non-Windows platforms that reset the terminal mode before exiting with code `128 + signal number`. If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit). * `'SIGPIPE'` is ignored by default. It can have a listener installed. * `'SIGHUP'` is generated on Windows when the console window is closed, and on other platforms under various similar conditions."}
```

B. `--decode html-text --body` v24.21.0 mirror → exit 0:
```json
{"found":true,"offset":31411,"normalizedLength":128647,"window":"tener but doing so might interfere with the debugger. 'SIGTERM' and 'SIGINT' have default handlers on non-Windows platforms that reset the terminal mode before exiting with code 128 + signal number . If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit). 'SIGPIPE' is ignored by default. It can have a listener installed. 'SIGHUP' is generated on Windows when the console window is closed, and on other platforms under various similar conditions. See sig"}
```

C. `--decode html-text --body` rolling latest-v24.x with the same quote → **exit 1**:
```json
{"found":false,"offset":-1,"normalizedLength":128747,"window":null}
```

D. same rolling body, v24.22.0 wording → exit 0:
```json
{"found":true,"offset":31499,"normalizedLength":128747,"window":"t handlers on non-Windows platforms that reset the terminal mode before exiting with code 128 + signal number . If one of these signals has a listener installed, its default behavior will be removed. Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty. 'SIGPIPE' is ignored by default. It can have a listener installed. 'SIGHUP' is generated on Windows when the console window is closed, and on other platforms under various similar conditions. See sig"}
```

## What it teaches the hardened harness

- SIGTERM/SIGINT default handlers exit **128 + signal number** (143 / 130) after resetting terminal
  mode (`doc/api/process.md:756-757`); SIGHUP's default is to terminate Node (:761-766). None of those is
  exit 2, so H1's exit 2 can only come from a listener that ends in `process.exit(2)`.
- Installing any listener on one of the three **removes** that default exit (:757-759). A handler that
  sets a flag and returns leaves the process alive — exactly the round-17 H1 defect, where
  "its listener stops Node from exiting" (`.ufo/waves/round-17/w2/SentinelHarnessAfter.md:18`).
- Round-17's other branch corroborates F1: "SIGINT at 5 s: node status 130"
  (`.ufo/waves/round-17/w2/SentinelHarnessAfter.md:34`) = 128 + 2 with no listener installed.
- `process.exit()` can drop an async write; pipes/sockets are asynchronous on POSIX, files synchronous
  (`doc/api/process.md:4228-4247`). The `run_aborted` receipt must be a sync file write before exit(2),
  not `console.error` to a pipe.
- SIGKILL/SIGSTOP cannot take listeners (`:778-780`), so H2's "every exit path" cannot include them; and
  signals are unavailable on Worker threads (`:710`), so handlers live in the parent.
- v24.22.0 adds: "Signal events are emitted asynchronously, so Node.js may exit before the listener is
  called if the event loop is otherwise empty." (offset 31499). Keep a handle alive; [INFERENCE] the
  page states the condition, not the mechanism.

## Contradiction with PLAN §C2

**None found.** Nothing in these docs contradicts H1, H2, H3, H4, S1 or F6. Three constraints the PLAN
text leaves implicit, all sourced: (1) the abort receipt must be durable before `exit(2)` (§F6);
(2) SIGKILL/SIGSTOP are unlistenable, so H2's "every exit path" needs scoping (§F4); (3) the v24.22.0
async-emission sentence weakens the listener guarantee when the loop is empty (§F7). One version note:
the PLAN's host is v24.21.0, but the rolling `latest-v24.x` URL already serves v24.22.0, whose bullet is
reworded (checks C vs D) — cite the tag, not the rolling page, for 24.21.0 behaviour. That is why the
row's cadence is `on-release`.

## Tooling

No tool installed or upgraded. Used host `curl`, `node` v24.21.0, and read-only `git ls-remote`.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcNodeSignals.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcNodeSignals.md`
