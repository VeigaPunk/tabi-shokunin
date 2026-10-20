VERDICT: PASS

Scope: the draft `.ufo/waves/round-18/drafts/harness-hardening-round-18.md` is finalized with the fixed source map S059 (launch), S060 (downloads), S061 (CDPSession), S062 (Chromium pipe), S063 (Node signals), S064 (switch merge). It contains no `S0??` placeholder and no pending or TODO prose; the grep check returned no matches. This report covers only that draft file. I changed no other file.

## What the draft now states

- Provenance trio: six `source:` lines with the S### id, URL, anchor and dossier path; `verified-at` 2026-10-20; `recheck` on-release.
- Documented contract per source, with line anchors from the dossiers under `.ufo/waves/round-18/sources/`.
- Decision table: H1 signals, H2 cleanup and TMPDIR, H3 pipe CDP, H4 downloads, S1 merged switches, and the F6 witness wrapper. Each row gives hazard, symptom, fix and the probe that must go red on B and green on REV.
- Finite probes `h1`, `h2`, `h3`, `h4`, `s1`, `f6` from `.ufo/waves/round-18/measure-c2.mjs`, with their negative controls. The draft states no counts. It directs the reader to the committed `measurements.json` of the C2 measurement run.
- Revision basis: the Sentinel ran at `6c97851`. I checked that the round-17 harness bytes at `6c97851` and `93bfead` are identical. Both `git show … | sha256sum` give `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`, and `git diff --quiet 6c97851 93bfead -- scripts/webmcp-invoke-round17.mjs` exits 0 (read-only). The two names are not a conflict.
- Bounds: the pipe is not wire bytes; the witness wrapper is not a gate and does not block a direct call to the byte-frozen `check-freshness.mjs`; an `acceptDownloads:false` failure event is not proof of no disk bytes; historical and descendant F6 witnesses are accepted only by strict 40-hex hash equality; the BiDi launcher is out of scope. Also listed as not covered: argv allowlist (S3), netns witness (S2), field caps (S6), NODE_PATH and entry identity (S8).

## Facts checked in this seat

- `coreBundle.js` (Playwright 1.64.0, installed): the `--remote-debugging-port=0` default at ~44936 sits in the `BidiChromium` class (~44889), not the CDP `chromium` launcher the harness uses. The CDP default pushes `--remote-debugging-pipe` (~44738).
- The round-18 harness working copy (`scripts/webmcp-invoke-round18.mjs`) is mid-implementation. At the time of this check it still has `DEVTOOLS_PORT_ARG` at `:779` and `:2229`, the `cdpChannel` string at `:2222` naming `--remote-debugging-port=0`, the browser `TMPDIR: tmpdir()` at `:328`, and `tmpBase` under `tmpdir()` at `:1036`. Its header describes the target contract, and the draft describes the contract, not that file's current state. Its probes must be run to produce counts.

## Not run

- No probe, browser run, or `measure-c2.mjs` run. No counts or verdicts are claimed.
- No install, upgrade, pacman, jj, or git write. Git use was read-only (`rev-parse`, `show`, `diff --quiet`, `cat-file`).

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/drafts/harness-hardening-round-18.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/DraftNoteHarness.md
