# SourceS101 — own-work receipt, producer metadata, row shape and tier (round21 w2)

Seat: `TabiR21.SourceS101` (scout, author-side, read-only). Scope: the S101 row at `corpus/SOURCES.md:115`, the current receipt `corpus/evidence/round-21/runtime/`, the producer `scripts/webmcp-lifecycle-round21.mjs`, and `.ufo/waves/round-21/runtime-execution-bounded.json`.
I did not run any counter, selftest, browser, build or lint. Everything below comes from file reads, `sha256sum`, read-only `git ls-files`/`ls-tree`/`rev-parse`/`hash-object`, and Python arithmetic over retained JSON. I opened no external URLs; Playwright semantics were read from the locally installed package. Tools installed or updated: none.

## Verdict

S101's retained observation bytes are sound. The **producer half of S101 is not bound to Git at HEAD `1b5f449ad15525d281fda4558aeef1086f1e4a65`**. The row, note and counter all rely on that producer. There is also no located quote record for S101 anywhere. Tier A is correct only for the scoped retained-receipt bytes. The "re-runnable" producer claim is unsupported until F1 is fixed.

## Findings (most severe first)

**F1 — blocker. The current producer is untracked, but committed artifacts cite it.**
- Attack: bind the producer digest that the receipt records to a Git object.
- Observed: `git ls-files --error-unmatch scripts/webmcp-lifecycle-round21.mjs` fails, and `git status` shows `?? scripts/webmcp-lifecycle-round21.mjs`. `git ls-tree -r HEAD -- scripts/webmcp-lifecycle-round21.mjs` returns 0 entries. `git rev-parse HEAD:scripts/webmcp-lifecycle-round21.mjs` reports "exists on disk, but not in 'HEAD'". `git log --all` shows no commit ever containing the path.
- HEAD `1b5f449` does commit the receipt (blob `1373a71b…`), the S101 row (`SOURCES.md` blob `9ed1278d…`), the note, the counter, and historical producers v1–v3 under `.ufo/waves/round-21/history/`. The current producer is the one file left out. `history/index.json:21-25` maps the bounded acquisition to the worktree path only, with no archived copy.
- The worktree bytes match the receipt: sha256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` (`receipt.json:4-6`, `runtime-execution-bounded.json:11`). Their Git blob would be `1c0d3bfe24f51e45fd36e67a6393942b1321f4b9` (`git hash-object`; not written to the object store).
- Consequence, inferred from code and not executed: `measure-c1.mjs:104-111` loads inputs via `git ls-tree` at REV, and `:47` adds `producer_digest` when `!get(PRODUCER)`. So `node .ufo/waves/round-21/measure-c1.mjs 1b5f449…` should return a `producer_digest` finding with `c1_lifecycle_observations: 0`.
- This also breaks QUALITY30 (`corpus/QUALITY.md:127-128`: cite a producer "only when that digest equals the blob registered") and QUALITY38 (`:157-158`: "binds own-work bytes to their Git object"). Note lines `:3` (rerun the pinned producer) and `:14` ("re-runnable own-work evidence") cannot be followed from the repository.
- If the worktree file is edited before it is committed, the bytes behind the current receipt are lost. v1–v3 are protected only because they were archived.
- Fix: commit exactly these bytes (sha256 `5363d576…`, blob `1c0d3bfe…`) and measure only at a revision whose tree contains them.

**F2 — high. S101 has no located quote or access record, and the lesson it points to does not exist.**
- Attack: find S101's ≤25-word quote and location, as the registry contract requires.
- Contract text: `corpus/SOURCES.md:3-6` says the round lesson's §Gate carries each row's quote and location. The round-20 clarification right after the round-20 search-log line says later rows quote their own round lesson's `## Gate`.
- S100 has a quote and location in `.ufo/waves/round-21/source-opening.json` (`html_form_element.cc:213-214`). S101 has no equivalent record.
- `corpus/lessons/round-21.md` is absent; `corpus/lessons/` stops at `round-20.md`. It is nevertheless cited by `corpus/SOURCES.md:155` ("Framing rejects are in the round21 lesson Gate"), `.ufo/waves/round-21/study.json:10`, and QUALITY52/53 (`corpus/QUALITY.md:248,254`, `corpus/lessons/round-21.md#mistakes`). Peers SourceReset and SourceS100 independently observed the same absence.
- Candidate located quotes from committed bytes, all ≤25 words:
  - `receipt.json:2`: `"schema": "tabi-round21-runtime-v1",`
  - `receipt.json:6`: the producer sha256 line
  - `na-reset.json:205` (blob `69c0eb5a…`): `"errorText": "Tool execution cancelled by a form reset"`
  - `na-remove.json:205`: `"errorText": "Tool execution cancelled, since tool definition was updated"`
  - `na-reject.json:205`: `"errorText": "respondWith promise was rejected"`

**F3 — medium. The S101 anchor binds nothing immutable.**
- Attack: compare the S101 anchor with prior own-work rows.
- `SOURCES.md:115` anchor cell [6] reads "schema tabi-round21-runtime-v1; receipt cases and per-case JSON/HTML; producer … SHA-256 recorded in receipt". It has no commit or blob pin and no producer digest in the row.
- Prior own-work A rows do pin. S029 (`SOURCES.md:43`) says "committed at 837b33a3…". S067 (`:81`) cites "producer line 605; original receipt at 837b33a3…".
- The row's producer reference is circular: it is the receipt's self-reported digest of a file that is not in Git (F1).
- Pin candidates: receipt blob `1373a71b970e13af3e681c92eee20aabd64c0374` at `1b5f449`, plus the producer commit once F1 lands.

**F4 — medium. The producer's environment metadata hides a host-flag injection path.**
- Attack: does the receipt's "feature flags" claim describe the browser's effective configuration?
- The producer launches `executablePath: '/usr/bin/chromium'` (`scripts/webmcp-lifecycle-round21.mjs:164`). On this host that is the Arch launcher, not the browser: an ELF of 14424 bytes, sha256 `eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b`. Its strings include `chromium-flags.conf`, `/etc`, `XDG_CONFIG_HOME`, `.config`, and it execs `/usr/lib/chromium/chromium`.
- The host file `~/.config/chromium-flags.conf` exists and contains `--enable-features=TouchpadOverscrollHistoryNavigation`, `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`, `--disable-features=Vulkan` and ozone flags. A second `--enable-features` would conflict with the producer's own.
- This run was shielded, but only implicitly. Playwright replaces the environment rather than merging it (`playwright-core/lib/coreBundle.js:41211`: `options.env ? envArrayToObject(options.env) : process.env`). The producer passes only `PATH`, `HOME: temp`, `TMPDIR` and `LANG`, so the launcher looks in `temp/.config`. `/etc/chromium-flags.conf` is absent.
- The receipt records none of this. `receipt.json:7-16` has `node`, `chromium` (observed via `browser.version()`), the literal `playwright` value and the requested `flags`. It has no executable path, no launcher-versus-binary distinction, no environment override and no effective browser argv.
- The counter's `environment` check (`measure-c1.mjs:49`) compares requested strings only. A producer edit that drops `HOME: temp` would produce an identical receipt while loading the extension and overriding features. Only `producer_digest` could catch that, and F1 currently defeats it.
- The managed policy `/etc/chromium/policies/managed/color.json` (theme color only, unrecorded) also applies regardless of profile.
- Minor: the receipt's `playwright: '1.64.0'` is a literal (`producer:146`). It is gated by the `package.json` check at `:47` but is not the value read from `package.json`. `producer.path` is also a literal, not derived from `SELF`, although the digest is computed from `SELF`.
- Installed package: `/var/lib/pacman/local/chromium-154.0.8037.97-1`, matching the receipt version, but the pkgrel `-1` is not recorded.

**F5 — low. LOG has stale producer metadata.**
- `LOG.md:1352-1353` names `runtime-execution-pinned.json` as the domain execution; that record now maps to history v1.
- `LOG.md:1388` says "`runtime-execution-final.json` names the current producer", and `:1391` maps only `runtime-v1/` and `runtime-v2/`.
- `history/index.json:15-19` classifies `final` as historical v3 (producer `history/webmcp-lifecycle-v3.mjs`, sha `847d0467…`, matching the `runtime-execution-final.json` digest). The current record is `runtime-execution-bounded.json` (`index.json:21-25`). The note (`:2`, `:50`) is already correct.

**F6 — mutation gaps (to inspect only, not executed).**
- The positive fixture's producer is the 32-byte synthetic string `'fixture producer, never executed'` (`fixtures/positive-ordered.json`). Its receipt digest is `123b9cac…`.
- `fixtures/expected.json` (43 cases) has `producer-edit` but no **producer-absent** case, i.e. one that deletes `files[PRODUCER]`. That is exactly F1's real condition, and it is the untested `!get(PRODUCER)` operand at `measure-c1.mjs:47`.
- S101 row checks at `measure-c1.mjs:58` (`ownCells[3]` kind, `[4]` tier A, `[8]` mined, `[2]` receipt path, backlink) are exercised only by `own-work-row-missing`. Deleting any single operand would survive. Missing red cases:
  - S101 tier A→B
  - S101 kind changed away from own-work
  - S101 status changed away from mined
  - receipt path removed from S101 cell [2]
  - S101 used-by backlink removed

## Checks that passed (re-derived from retained bytes)

- **Row shape.** `SOURCES.md:115` has 11 data cells, so the counter's split yields 13. Kind `own-work` is in the checker's kind set (`scripts/check-sources.mjs:26`). Tier A and status mined are present. Opened `2026-10-21` matches `receipt.json` `startedAt` `2026-10-21T13:07:02.041Z`. Used-by `corpus/knowledge/webmcp-nonautosubmit-round-21.md` exists and cites S101 (`:1`, `:14`). The anchor is non-bare.
- **Digests.** For all 12 cases, `receipt.cases[].evidence.sha256` equals the per-case JSON sha256, each per-case `fixture.sha256` equals its HTML sha256, and each nonce appears in its HTML.
- **Invocation correlation.** For all 12 cases, the invokeTool result's `invocationId` equals `case.invocationId`. Each case has exactly one matching `toolInvoked` event and no foreign-ID `toolResponded` events. Statuses match the execution stdout: none-in-window, Completed×3, Canceled×2, Error×2, Completed, Error, plus autosubmit Completed and Error.
- **Windows and errorText.** `preAction.windowMs` ranges 252–255 and `after.windowMs` 501–754, matching the note's errorText for reset, remove, reject, throw, invalid-submit and auto-invalid.
- **Native submit.** Landing URL `q` equals the case nonce `de22b3e0-…`, output is `[{"dummy":"landing"}]`, and `submits` is null.
- **Cleanup.** Every case has 9 PIDs before close and `browserPidsAfter: []`, with no forced cleanup and no late PIDs. `receipt.requests` lists 13 loopback paths only.
- **Producer chain.** Worktree producer sha `5363d576…` equals both `receipt.producer.sha256` and `runtime-execution-bounded.json:11`. The pinned, ordered and final execution records' digests (`a273fe77…`, `b99d1698…`, `847d0467…`) equal the archived `history/webmcp-lifecycle-v{1,2,3}.mjs` and each `history/runtime-v{1,2,3}/receipt.json` producer. Execution `startedAt`/`finishedAt` (13:07:01.895 → 13:07:14.124) bracket the receipt's (13:07:02.041 → 13:07:14.098).

## Scoped tier ruling

- Kind `own-work` is correct.
- **Tier A holds for the scope "retained recorded Chromium 154 loopback observations"**, and only once the anchor is pinned to receipt blob `1373a71b…` at a named commit (F3) and a located quote is recorded (F2).
- Tier A does **not** currently cover the producer and re-runnability claims (row anchor cell [6], note `:3` and `:14`). They need F1, committing the producer blob, before any revision-bound C1 credit. The alternative is to narrow the row and note so they drop the re-runnable and producer claims.
- F4 does not change the tier. It narrows "with the receipt's feature flags" (note `:10`) to "requested flags". The effective argv is not retained.

## Remaining unknowns

- Effective browser argv for this run: not retained. `HOME` shielding is inferred from Playwright source plus the launcher strings, not observed in `/proc/<pid>/cmdline`.
- Whether the `/usr/lib/chromium/chromium` binary equals upstream tagged source: unclaimed, and S100's scope already excludes it.
- jj state: `.jj` exists, but I ran no `jj` command because it snapshots the working copy. Whether a jj change holds the producer is unknown and does not substitute for a Git tree entry under `measure-c1.mjs:104-111`.

Report: .ufo/waves/round-21/w2/SourceS101.md
