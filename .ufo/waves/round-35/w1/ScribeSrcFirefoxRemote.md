# ScribeSrcFirefoxRemote — round 35, w1 (C2 sources: S136, S137)

**Verdict.** Two registry rows were opened this round against sources this seat fetched itself, and
both are drafted in the 11-column SOURCES shape plus the `## Gate` row shape the item asked for:
**S136** — Firefox Source Docs *Remote protocol preferences* (`remote.active-protocols` removed in
Firefox 141, WebDriver BiDi the only protocol; `remote.experimental.enabled` defaults false outside
Nightly) grounding the C2 entry's protocol premise and R1; **S137** — MDN
`browsingContext.locateNodes` (locator `type`/`value`, `css` takes a selector string) grounding R5.
Both URLs were absent from `corpus/SOURCES.md` before this seat (`grep` → no match; the only
`developer.mozilla.org` rows are the pre-existing S006/S007), both fetched HTTP 200 with digests
recorded, both byte-stable across re-fetch, both appended to a scratch clone at the freeze and
accepted by `sources-census.sh validate` — whose **only** findings are `E11 missing used-by` for the
C2 entry path that another seat has not written yet (identical to the lane's own
`scripts/check-sources.mjs` output); a clone-only zero-byte stub of that path makes both checks exit
0 with zero E-codes, and the stub was deleted. No lane file, index or jj state was touched; the
rows reach the lane only through this report's `rows.md`/`gate.md` for L1 integration.

## Evidence (commands, exit codes, file:line)

- Scratch clone at freeze: `git -C clone rev-parse HEAD` → `a4bfef0f75027c915e715649950b1d46dcb33d83`;
  `--show-toplevel` → the scratch clone (exit 0). Commands in `…/ScribeSrcFirefoxRemote/commands.md`.
- Fetch receipts (`fetches/fetches.log`, canonical bodies in `fetches/`):
  - `https://firefox-source-docs.mozilla.org/remote/Prefs.html` — 2026-10-26T21:13:03Z, HTTP 200,
    31,971 B, sha256 `72cd6162cb1e81f44293e71cc67d6b4002a08bdf1c80471250c8c6a4ff9644f1`; probe and
    canonical bodies byte-identical.
  - `https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/browsingContext/locateNodes`
    — 2026-10-26T21:13:04Z, HTTP 200, 186,783 B, sha256
    `721e6f0c1dd68c019915076285ceb733ccfe6bdc972920b5c8891c65cd45af48`; three GETs, same digest,
    no per-response nonce.
- Quote locations (greps pasted in `gate.md`, all `exit=0` in the fetched bytes): Prefs.html body
  **297** (`…of the CDP support, WebDriver BiDi is the only available protocol, and the`, sentence
  complete across 296-298 under `#remote-active-protocols`); Prefs.html **310-311**
  (`remote.experimental.enabled` … "Defaults to true in Nightly builds, and false otherwise");
  MDN **1506** (`finds the nodes in a context that match a locator, which specifies the search
  criteria`), MDN **1596** (locator = five criteria) and **1637** (`type: "css"` takes a selector
  string).
- Duplicate check (CORPUS.md rule 2 / census E04): `grep -n 'firefox-source-docs.mozilla.org'` and
  `grep -n 'Modules/browsingContext/locateNodes'` on the registry → no match, exit 1;
  `grep -c 'developer.mozilla.org'` → 2 (S006 `:20`, S007 `:21`); registry held 133 rows.
- Row shape: `awk -F'|'` on the two appended lines → `NF=13` (11 cells), so the C2 counter's
  `parseRegistry` accepts them; each row's first https URL host equals its Gate-row URL host
  (`firefox-source-docs.mozilla.org`, `developer.mozilla.org`) and the Gate rows carry 64-hex
  digests — the counter's `s1-source` predicate's requirements.
- Validation (`census-check.txt`):
  `sources-census.sh validate --file $S/clone/corpus/SOURCES.md` → exit **1**, exactly two
  `E11 S136/S137 missing used-by corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` plus
  21 pre-existing `W04` warnings and `file ok`; with the clone-only stub → exit **0**, zero
  E-codes; `node scripts/check-sources.mjs` in the clone → exit 1, `rows=135`,
  `findings=2`, the same two `used_by_missing`; `git -C clone status --porcelain` → only
  `M corpus/SOURCES.md` after the stub was removed.

## Deliverables

- `.ufo/waves/round-35/w1/ScribeSrcFirefoxRemote/rows.md` — the two registry rows verbatim, why each
  grounds a C2 row, rejected candidates, duplicate-check evidence, validation note.
- `.ufo/waves/round-35/w1/ScribeSrcFirefoxRemote/gate.md` — `## Gate` rows in the 8-column shape for
  `corpus/lessons/round-35.md`, supporting quotes, fetch command/receipt table, pasted greps, and the
  probe-fetch table.
- `.ufo/waves/round-35/w1/ScribeSrcFirefoxRemote/fetches/` — `Prefs.html` (31,971 B),
  `mdn-browsingContext.locateNodes.html` (186,783 B), `fetches.log`.
- `.ufo/waves/round-35/w1/ScribeSrcFirefoxRemote/census-check.txt` — raw census/check-sources output.
- `.ufo/waves/round-35/w1/ScribeSrcFirefoxRemote/commands.md` — every command with exit codes.

## Findings for the C2 build/entry seats

1. **`remote.experimental.enabled` matters before any refusal is read as unimplemented.** S136's
   page documents that experimental BiDi commands and events are exposed only when this preference
   is set, defaulting `false` outside Nightly. A release Firefox 158 transcript that never sets it
   cannot distinguish "command missing" from "command experimental and gated"; the receipt should
   record the pref state (or the driver's prefs) before a `no` verdict on any experimental command
   is written as capability evidence.
2. **No CDP path exists on this engine.** The same page states CDP support ended and
   `remote.active-protocols` was removed in Firefox 141, so a Firefox session's `webSocketUrl` is a
   BiDi endpoint by construction — no protocol-selection flag is needed or available.
3. **MDN has no `network.addDataCollector` page** (HTTP 404, 88,379 B); the only MDN grounding for
   the C2 recipe's commands found this round is the `locateNodes` page. If the entry's R12 row cites
   documentation, it must cite S124 (spec) rather than MDN.
4. **Loopback source left unregistered.** `https://firefox-source-docs.mozilla.org/remote/Security.html`
   (HTTP 200, 32,928 B) states connections are restricted to loopback devices and that the HTTPD
   default is `localhost:9222`; it was fetched and recorded but not registered (two rows allotted).
   A later round needing Firefox's own loopback statement can open it as a new row.
5. **Guessed Firefox doc paths 404**: `remote/RemoteAgent.html`, `remote/WebDriverBidi.html`,
   `remote/SupportedClients.html` (358/360/363 B). `testing/geckodriver/Capabilities.html`
   (31,324 B) has zero occurrences of `webSocketUrl` and `moz:geckodriverVersion`, so the R1
   capability vocabulary has no Firefox-docs row yet.

## Limits / out of scope

- The C2 entry `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` does not exist at the
  freeze; the two `E11` findings are that absence, not a row defect. L1 must integrate `rows.md`
  and `gate.md` into the entry's round and may renumber S136/S137 (S134–S135 are unused in the file
  as read).
- Probe fetches (10 URLs) are recorded by status and byte count only; their 200 bodies are not cited
  by any row and are not kept. The two 404s are recorded by status/bytes per QUALITY 93.
- This seat launched no browser, driver or session; the live Firefox evidence is the C2 executor
  seats' work. No tool was installed or upgraded. Scratch
  `/fast/scratch/hyaku/tabi-r35/ScribeSrcFirefoxRemote` was deleted after the receipts above were
  copied into this output dir.
