# WebBridge plugin anatomy (TABI-1)

Lane: tabi-shokunin (probation wave 1) · Date: 2026-10-14 · Method:
read-only inspection of `~/.kimi-code/plugins/managed/kimi-webbridge/`
plus shell presence checks. Daemon endpoint **not called** (presence
check only, per assignment). Secrets shape-only.

Substrate identity at capture time (sha256, `sha256sum` in plugin root):

| file | lines | bytes | sha256 (first 12) |
|---|---|---|---|
| `kimi.plugin.json` | 24 | 1273 | `e70aff5c40ff` |
| `skills/kimi-webbridge/SKILL.md` | 158 | 11880 | `84a8e69d04c5` |
| `skills/kimi-webbridge/references/operations.md` | 34 | 2422 | `b811d9c23dfd` |

All three files share mtime `2026-10-03 18:06:32 -0300`
(`find . -type f -exec stat ...`); 216 lines total. This table is the
re-verification anchor: hashes change → this note is stale.

## 1. Package layout — Observation

`find` returns exactly 3 files:

```
kimi.plugin.json
skills/kimi-webbridge/SKILL.md
skills/kimi-webbridge/references/operations.md
```

No scripts, no binaries shipped inside the plugin. The plugin is pure
declarative manifest + one skill directory; all executable machinery
lives outside, in the separate daemon install root (Section 5).

## 2. `kimi.plugin.json` — Observation

| field | value | line |
|---|---|---|
| `$schema` | `https://kimi.com/schemas/kimi.plugin.schema.json` | 2 |
| `name` | `kimi-webbridge` | 3 |
| `version` | `1.11.3` | 4 |
| `description` | one-line summary, names the local daemon + CDP | 5 |
| `keywords` | browser, webbridge, cdp, automation, web, scraping | 6-13 |
| `author` | `Moonshot AI` | 14 |
| `license` | `Proprietary` | 15 |
| `skills` | `./skills/` | 16 |
| `interface.displayName` | `Kimi WebBridge` | 18 |
| `interface.longDescription` | names daemon URL, Chrome/Edge + extension over CDP, "everything runs locally" | 20 |
| `interface.websiteURL` | `https://www.kimi.com/features/webbridge` | 22 |

Mechanism reading: `skills: "./skills/"` is the discovery root — the
loader scans that directory, finds `kimi-webbridge/SKILL.md`, and the
skill's frontmatter `name`/`description` (SKILL.md:2-4) become the
registration. Observed registration in this session: the skill appears
in the available-skills listing under Extra scope with path
`/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md`.

Version consistency: manifest `1.11.3` (kimi.plugin.json:4) == skill
frontmatter `metadata.version` (SKILL.md:5-6). Cross-checked by grep.

## 3. Registry entry — Observation

`~/.kimi-code/plugins/installed.json` (read-only):

- `id: "kimi-webbridge"`, `enabled: true` (lines 5, 8)
- `root:` absolute path of the managed dir (line 6)
- `source: "zip-url"`, `originalSource:` `https://code.kimi.ai/kimi-code/plugins/official/kimi-webbridge.zip` (lines 7, 11)
- `installedAt` == `updatedAt` == `2026-10-03T21:06:32.435Z` (lines 9-10) — matches file mtime; single install, never updated.

Plugin dir permissions: `drwx------` on the `kimi-webbridge` dir
(`ls -la` of managed/), owner-only.

## 4. `SKILL.md` — mechanism inventory — Observation

Frontmatter (lines 1-7): `name`, triggered-by description ("interact
with websites … even for simple-sounding browser requests"), metadata
version.

Tool table (lines 15-30), 14 rows, all commands are POSTed to the
daemon as `{action, args, session}`:

`navigate` (:17) · `find_tab` (:18) · `snapshot` (:19, accessibility
tree with `@e` refs) · `click` (:20) · `fill` (:21, handles `<input>`,
`<textarea>`, `[contenteditable]`) · `evaluate` (:22, async/await) ·
`cdp` (:23, raw `chrome.debugger` passthrough) · `screenshot` (:24,
returns file path not base64) · `network` (:25) · `upload` (:26) ·
`save_as_pdf` (:27) · `list_tabs` (:28) · `close_tab` (:29) ·
`close_session` (:30).

Mechanism rules worth carrying verbatim-equivalent:

- **Tabs (:32-44):** single-tab tools act on "the current tab" =
  most recent `navigate` or `find_tab`. `find_tab` default scope =
  only this session's tabs; `active:true` *borrows* the user's
  currently-viewed tab (`borrowed:true`) and does not move it into
  the agent's group (:38). Failure string: "no tab matching … in
  this session" → fall back to `navigate newTab:true` (:39).
- **Call format (:46-67):** macOS/Linux inline JSON ok (:53); on
  Windows every request must be a uniquely-named temp JSON file POSTed
  with `curl.exe --data-binary`, then deleted — rationale: shell
  corrupts non-ASCII to `?`, unrecoverable (:58-67).
- **Sessions (:69-87):** one task = one session = one tab group,
  top-level `session` field, never switch mid-task (:71-74).
  `group_title` set on first navigate, in user's language (:75).
  Closing is user-initiated only; `close_session` clears the group
  (:87).
- **Screenshots (:89-101):** daemon writes to disk, returns
  `{format, path, sizeBytes, mimeType}`; caller `path` honored
  verbatim, parent dirs created, existing files overwritten (:101).
- **Selector policy (:103-110):** prefer `snapshot` `@e` refs over
  CSS/JS; evaluate only for missing refs, absent attributes, or
  complex event sequences.
- **Evaluate tips (:112-116):** compact `JSON.stringify` only;
  shared JS realm → wrap IIFEs to avoid `const` redeclare SyntaxError.
- **fill semantics (:117-121):** clear-and-insert; append = read via
  evaluate + concat + fill.
- **No key-press tool (:123-129):** submit by clicking the button;
  synthetic keyboard events via evaluate.
- **PDF (:131-142):** defaults letter/scale 1.0/print_background
  true; decoded cap 100 MB, above that refused.
- **Limitations (:144-147):** `isTrusted`-checking sites ignore
  synthetic click/fill; cross-origin iframes not covered by
  click/fill/evaluate/snapshot — navigate to the iframe URL instead.
- **Failure routing (:149-151):** delegating to `references/operations.md`.
- **Version mismatch (:153-158):** error text "Please update the Kimi
  WebBridge extension" → tell user to update; never reconcile
  versions yourself. Help URLs: /features/webbridge (en) and
  /zh-cn/features/webbridge (zh).

## 5. `references/operations.md` — Observation

- Daemon binary: `~/.kimi-webbridge/bin/kimi-webbridge` (`%USERPROFILE%\.kimi-webbridge\bin\kimi-webbridge.exe` on Windows), serves HTTP on `127.0.0.1:10086`; status/PID/logs under `~/.kimi-webbridge/` (:7).
- Recovery order (:9-22): (1) connection refused → run `start` yourself (idempotent, single-binder convergence) (:11-15); (2) binary missing → point user at install page (:16); (3) extension missing → Chrome Web Store id `fldmhceldgbpfpkbgopacenieobmligc` or restricted-network zip URL `https://kimi-web-img.moonshot.cn/webbridge/latest/extension/kimi-webbridge-extension.zip` loaded unpacked (:17-19); (4) still broken → help page, no deep troubleshooting (:20-22).
- Hard prohibition (:24-26): never run `stop`/`restart`/`uninstall` autonomously — they kill the daemon and fight the Kimi Desktop App's own daemon management.
- `/status` response fields (:28-34): `running`, `version`, `extension_connected`, `extension_id`, `uptime_seconds`.

Scope note: the recovery text authorizes spawning the daemon (`start`)
— that is an exception to pure read-only posture for the *operator*,
not for corpus builders. This note did not start anything.

## 6. Daemon endpoint — presence check only — Observation

Commands run (no HTTP call, no `start`):

```
$ ss -ltn | grep 10086          → no output (NO-LISTENER-10086)
$ cat ~/.kimi-webbridge/daemon.addr → 127.0.0.1:10086
$ cat ~/.kimi-webbridge/daemon.pid  → 37800
$ ps -p 37800 -o pid,comm       → empty (header only)
$ file ~/.kimi-webbridge/bin/kimi-webbridge
  ELF 64-bit LSB executable, x86-64, static, stripped, 10,031,288 bytes
$ which kimi-webbridge          → not on PATH
```

Install-root inventory (`ls -la ~/.kimi-webbridge/`): `bin/` (binary
above), `daemon.addr` (16 B), `daemon.pid` (6 B), `identity.json`
(mode 600, 36 B — **not read**, shape only), `logs/` with
`daemon.log` (19,532 B, mtime 2026-10-11 18:39) and `daemon.log.prev`
(2,281 B) — names/size/mtime only, contents not inspected (may hold
user page URLs; privacy, PROVINCE login-session rule).

## 7. Findings — tagged by epistemic type

**Observation (measured):**
- O1. Plugin is 3 files / 216 lines; no vendored code. (§1, §4, §5)
- O2. Manifest and skill both declare `1.11.3`. (§2)
- O3. Registry entry active, `source: zip-url` from
  `code.kimi.ai/kimi-code/plugins/official/kimi-webbridge.zip`. (§3)
- O4. Daemon currently **not running**: no `:10086` listener, pid
  file stale, binary present but not on PATH. (§6)
- O5. The skill is live in this session's skill listing (Extra scope,
  path into this plugin). (§2)

**Inference:**
- I1. Because the pid file is stale and `daemon.addr` still holds the
  endpoint, the daemon appears to have been started via its own `start`
  at least once and shut down without cleaning these files. Basis:
  O4 plus `operations.md:7` (files live under the install root).
  Confidence: medium — a crash or external kill yields the same trace.
- I2. Since the plugin ships no code, every capability claim in
  SKILL.md is a contract with the external daemon binary + browser
  extension; SKILL.md alone cannot be tested end-to-end without the
  daemon running. Basis: §1 + `operations.md:11-13`.
- I3. The declared JSON schema URL (kimi.plugin.json:2) is
  informational at install time — the registry (`installed.json`)
  carries no schema validation record. No measured confirmation of
  enforcement; see U1.

**Unknown:**
- U1. The `$schema` document at `https://kimi.com/schemas/kimi.plugin.schema.json`
  could not be retrieved (FetchURL returned a generic landing page, not
  schema JSON). Field meanings beyond the observed key names are not
  verified against the schema — do not assume additional required
  fields from this note.
- U2. Daemon binary's own version string and `/status` shape are
  unverified (endpoint not called per assignment; `running`=false).
  The `1.11.3` claim is only from static files.
- U3. Browser-extension presence, id (`fldmhceldgbpfpkbgopacenieobmligc`,
  operations.md:18), and version are unverified — no browser profile
  surface inspected (out of this assignment's scope).
- U4. Whether the skill loader requires the manifest's `interface.*`
  block, `keywords`, or `license` fields is unproven — only `skills`,
  `name`, and (likely) `version` are demonstrably load-bearing for the
  observed registration.

**Opinion (explicitly marked):** the strongest operational facts to
carry into SKILL.md craft are the Windows file-body rule
(SKILL.md:58-65) and the no-auto-restart rule
(operations.md:24-26); both are silent-corruption / user-impact class
failure modes rather than mere ergonomics.

## 8. Spot-check anchors (re-run to falsify this note)

1. `grep -n '"version"' ~/.kimi-code/plugins/managed/kimi-webbridge/kimi.plugin.json`
   → `4:  "version": "1.11.3",`; same value at SKILL.md:6.
2. `grep -n '"skills"' kimi.plugin.json` → `16:  "skills": "./skills/",`
   — the discovery root that makes the single skill reachable.
3. `grep -rn 10086 .` in plugin root → 10 hits, first at SKILL.md:11
   (daemon base URL), plus operations.md:7 (binary+port) and
   operations.md:30 (`/status.running` description).
4. `wc -l` on the three files → 24 / 158 / 34.

## Errata (append-only — never edit above; append dated blocks below)

- (none yet)

Appended 2026-10-14 (tabi round 2, lane TABI-R2-3; command transcripts staged
at `/tmp/tabi-r2-3-verify/`, volatile). Entries below supersede the
placeholder above; nothing above is edited. Pre-append sha256 of this file:
`49f0735b0594c77a2c352d21cf71edc94cb742b16f972202acacaf4f48167b7a` (= the
`SKILL.md:23-27` pin `49f0735b0594` at append time). The post-append hash
necessarily differs — re-derive with `sha256sum` and refresh the pin.

- **[2026-10-14, fresh re-run] VERIFIED — §8 anchors + identity table held.**
  `wc -l` → 24 / 158 / 34 (216 total); sha256 first-12 `e70aff5c40ff` /
  `84a8e69d04c5` / `b811d9c23dfd`; mtimes still 2026-10-03 18:06:32 -0300;
  `grep -n '"version"'` → :4; `grep -n '"skills"'` → :16; `grep -rn 10086`
  → 10 hits, first SKILL.md:11. This records a re-verification date later
  than capture (the SCORECARD freshness ceiling noted "nothing re-verified on
  a date later than capture").
- **[2026-10-14, cross-note] U3 partially RESOLVED.** U3 put extension
  presence/id/version unverified; the round-1 census measured them:
  `fldmhceldgbpfpkbgopacenieobmligc` "Kimi" `2.0.23_0` under
  `~/.config/chromium/Default/Extensions/…`
  (`browser-surface-census.md:69`); re-checked today — manifest.json:36
  `"name": "Kimi"`, :45 `"version": "2.0.23"`. The extension→daemon
  handshake remains unverified (daemon was down at capture; the round-2
  disposition probe reports `extension_connected:false` —
  `webbridge-daemon-disposition.md` §5). U3's "and version are unverified"
  clause is discharged; "presence ↔ live connection" is not.
- **[2026-10-14, state change] §6 O4 SUPERSEDED AS LIVE STATE — daemon now
  running.** O4 ("daemon currently not running") was true at capture (09:54).
  A doc-authorized `start` (`operations.md:11-13`) executed 2026-10-14
  13:46:31Z → pid 3934817 on `127.0.0.1:10086`, left running; `daemon.pid`
  rewritten (37800 → 3934817) and `logs/daemon.log` rotated (19,532 B →
  `.prev`, fresh 2,281 B). Trace and disposition rows:
  `webbridge-daemon-disposition.md` §4/§6 (its §10 already flags this
  supersession). §6 stands as-of-capture only; re-measure before citing it
  as current. New CLI surface observed in the binary's help: `status`,
  `logs`, `upgrade`, `install-skill`, `run`; the no-agent
  `stop`/`restart`/`uninstall` rule is unchanged (`operations.md:26`).
- **[2026-10-14, reading tension — pointer, not reconciled] §5's scope note
  (:136-138) reads the `start` authorization as operator-scoped ("not for
  corpus builders"); the round-2 plan and disposition seat read it as
  agent-authorized under the plan (`webbridge-daemon-disposition.md` §2).
  Both readings remain on record; flagged for the round scribe.

Appended 2026-10-14 (tabi round 4, lane ERR-B — errata sweep; re-run transcripts
staged `/tmp/w4-erb-b-sweep/`, byte-prefix proof `/tmp/w4-erb-b-append-proof/`,
both volatile). Nothing above is edited. Pre-append sha256 of this file:
`5e0fbe35feea149d6eb22a0cc26c4b0f1f0aebbfec0356b1c02d8f476fae4f5b`. The
post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, fresh re-run] VERIFIED — §8 anchors held a third round.**
  `wc -l` → 24 / 158 / 34; sha256 first-12 `e70aff5c40ff` / `84a8e69d04c5` /
  `b811d9c23dfd`; mtimes still 2026-10-03 18:06:32 -0300; `"version"` `:4`,
  `"skills"` `:16`, `grep -rn 10086` → 10 hits, first at substrate `SKILL.md:11`.
- **[2026-10-14, state change] daemon DOWN — the live state recorded in the
  round-2 erratum above is itself superseded.** 16:21:07Z: `ps -p 3934817` →
  gone; `ss -ltn` → no listener on 10086; `curl -s
  http://127.0.0.1:10086/status` → exit 7; `daemon.pid`/`daemon.addr` present
  but stale (mtimes 10:46:31), `logs/` shapes unchanged. A sibling read-only
  sweep measured it still LISTEN/running with an 8-field `/status` at
  16:08:33Z (uptime 8,532 s) — the down event falls inside that 13-minute
  window. Cause unmeasured (unknown): the stop was owed to the operator
  (daemon note D2/A4); no in-repo record of who executed it. Re-measure before
  citing either state (`webbridge-daemon-disposition.md` §10 carries the same
  row).

Appended 2026-10-14 (tabi round 5, lane B5-3 — pin refresh; derivation pass 17:01–17:06Z; scratch `/tmp/w5-tabi-b53/` — volatile). Nothing above is edited. Pre-append sha256 of this file: `6ce6fdd018a70d0be9ef5b9517565f5245c047199f3123c16badcac2c88cf974`. The post-append hash necessarily differs — re-derive with `sha256sum`.

- **[2026-10-14, pin refresh] VERIFIED — §8 anchors re-ran clean; file pin held.** `wc -l` → 24 / 158 / 34; sha256 first-12 `e70aff5c40ff` / `84a8e69d04c5` / `b811d9c23dfd`; `grep -n '"version"'` → `kimi.plugin.json:4`; `"skills"` → `:16`; `grep -rn 10086` → 10 hits, first at substrate `SKILL.md:11`; substrate mtimes still `2026-10-03 18:06:32 -0300`. This note's hash re-derived 17:01Z → `6ce6fdd018a7…` (= the §Pins value); the round-1 blob still `49f0735b0594` (`git show 7961735:corpus/knowledge/webbridge-plugin-anatomy.md | sha256sum`). Same-day-later pass — a strictly-later-date re-derivation remains open (round-5 plan clause (c)).