# `## Gate` entries for the round-37 lesson — draft for the L1 (tabi r37, w1)

Seat: `ScribeSources` (leaf). Drop-in text for `corpus/lessons/round-37.md` §Gate. The registry row
itself is `S143-row.md` in this directory; these entries are the contract-v1 rule-1 record for it.
Both openings are recorded: `ScoutSrc` fetched at 13:35:05Z and this seat re-fetched independently
at 13:34:56Z and re-hashed the bytes (`evidence/git-replace.html`, `evidence/sha256.txt`); the two
fetches are byte-identical.

---

## Gate

Row opened this round (fetch bytes held by seat `ScoutSrc` — `.ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md`;
independent second opening, re-hash and quote location by seat `ScribeSources` —
`.ufo/waves/round-37/w1/ScribeSources/evidence/`, raw page retained as `git-replace.html`):

| id | URL | accessed (UTC) | status | bytes | SHA-256 | located quote (≤25 words) | location / decision |
|---|---|---|---:|---:|---|---|---|
| S143 | https://git-scm.com/docs/git-replace | 2026-10-27T13:35:05Z | 200 | 38,351 | `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105` | “The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option.” (16 words, measured on tag-stripped, whitespace-normalised text) | `git-replace.html:1708-1709`, §DESCRIPTION (`<h2 id="_description">` at raw line 1658); **admit** — tier A, `mined`, opened `2026-10-27`, recheck `180d`, used-by `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` (C2 leg B1: the counter cites this row at `:10` and implements the disable at `:121` with `refs/replace` enumeration at `:124-125`, `:528`) |
| — (supporting fetch, not a row) | https://git-scm.com/docs/gitrepository-layout | 2026-10-27T13:35:05Z | 200 | 64,401 | `2f736f8d40834d2fb4556322c44ae2ae332287df5b4eddcc0a8e5fdd78da82b5` | “records the SHA-1 of the object that replaces `<obj-sha1>`.” (10 words) | declared in `ScoutSrc`'s receipt (its `refs/replace/<obj-sha1>` `dd` block, raw lines 2127-2134); **this seat did not fetch this URL**, so the digest above is **declared, not verified here**; **not registered** — see the reject row |
| — (no further row) | — | — | — | — | — | — | **REJECT — no other package or registry row is admitted this round: assimilation is `none`.** Rationale under the table |

Additional located quotes, same page and same fetch (each ≤25 words):

- “Replacement references will be used by default by all Git commands except those doing reachability traversal (prune, pack transfer and fsck).” — 21 words, `git-replace.html:1680-1682`, §DESCRIPTION. This grounds the “rewrites object reads” half of the row's `teaches`.
- “Adds a replace reference in refs/replace/ namespace.” — `git-replace.html:1662`, §DESCRIPTION first paragraph.
- “It is possible to disable the use of replacement references for any command using the --no-replace-objects option just after git.” — 20 words, `git-replace.html:1685-1686`, §DESCRIPTION. (The raw HTML wraps `--no-replace-objects` in a `code` span; whitespace-normalised text is required to locate it.)
- The read-overwrite demonstration: `git-replace.html:1693` shows `$ git --no-replace-objects cat-file commit foo` printing commit *foo*, while `:1700-1705` shows `$ git cat-file commit foo` printing commit *bar*.

**REJECT row rationale — why nothing else is admitted this round.**

1. **Assimilation is `none`.** `ScoutAssim`'s round-37 survey (`.ufo/waves/round-37/w1/ScoutAssim/report.md`) read `/home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.md` and its 148 staged rows plus 86 staged knowledge files read-only and recorded **zero literal hits** for `replace.?ref|graft|GIT_NO_REPLACE|adjacency|calibrat`. Every staged theme is WebMCP/CDP/HTTP craft (version floors, origin trials, cookie prefixes, redirect and rate-limit semantics), so no package theme touches the C1 adjacency-instrument surface or the C2 git-object evidence surface. No staged row is adopted, renumbered or re-grounded; the package stays read-only.
2. **Contract rule 1.** A row is written only after the writer opened the source in the round that writes the row. This round opened exactly two URLs, both listed above; neither the quarantine slice nor the package was re-fetched, so no further row can be claimed.
3. **Contract rule 4.** There is no row quota; the support fetch is refused because the frozen C2 claim cites only the replace-ref *mechanism*, which S143 already grounds. Flip for the refused support row: a claim that depends on replace refs surviving transport between repositories (the layout page's “Such refs can be exchanged between repositories while grafts are not” sentence) — that is the c2r37-J1 clone-graft threat model, and it would earn its own row.

**Cautions for the L1, both measured here.**

- **Access timestamp.** The lesson draft's S143 cell reads `2026-10-27T13:30Z`; the opening receipt records `2026-10-27T13:35:05Z` (server `date:` 13:34:54 GMT) and this seat's independent fetch wrote at 13:34:56Z. Use `13:35:05Z` (the owning seat's recorded value) or state both; do not leave `13:30Z`.
- **Quote counting must name its extraction method.** The sentence is **16** words, not 17 (`ScoutSrc` receipt) and not 13 (L1 note): `The / GIT_NO_REPLACE_OBJECTS / environment / variable / can / be / set / to / achieve / the / same / effect / as / the / --no-replace-objects / option.` The count is reproducible only on tag-stripped, whitespace-normalised text; a raw-byte tokenisation splits the `code` spans and yields a different number. All three counts satisfy ≤25; the cell carries **16 words (tag-stripped, whitespace-normalised)**, and the method belongs in the cell so a later reader does not re-derive a third value and route a false mismatch.
- **Locating the quote needs normalisation.** The raw HTML splits the sentence across `code` spans, so a raw exact-string `grep` fails while whitespace-normalised text matches once (`evidence/quote-check.out`: `exact_occurrences=1`). A later re-checker that greps raw bytes will wrongly report the rows absent.
- **Id namespace.** The registry gains its next-free id `S143` (max was `S142`); the quarantine absent-defect register independently uses `S143` for a puppeteer row. The row's `scope` cell states the two are unrelated so a future reader cannot mistake the registry row for a revival or correction of the refused quarantine row.

`corpus/SOURCES.md` change log: `142 → 143` rows; S143 is tier A, `mined`, opened `2026-10-27`, recheck `180d`, used-by `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`. **No prior row cell changes** — the appended copy differs from the untouched registry by exactly one added line and zero removed lines (`evidence/registry-diff-S143.txt`). Tier histogram `A:126→127, B:7, C:9`; status histogram `mined:118→119, queued:15, rejected:9`.

Census receipts: `evidence/validate.out` is
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <copy-with-S143>` → **exit 0**,
`W04=20 ok=1`, zero E-codes, no line naming S143. `evidence/check-sources.out` is the lane's own
`scripts/check-sources.mjs --root <copy-lane> --file corpus/SOURCES.md` → **exit 0**,
`SOURCES_GATE verdict=clean rows=143 tiers=A:127,B:7,C:9 status=queued:15,mined:119,rejected:9 findings=0`.
The same two commands over the unmodified registry copy give `rows=142 tiers=A:126 … mined:118` with
the same 20 W04 warnings and the same empty finding set, so the new row introduces no finding.
`evidence/contract-census.out` runs the contract's inline census commands over the copy: `rows 143`,
`malformed (NF!=13) 0`, no duplicate ids, no enum or tier-inflation violation, every `mined` used-by
path resolving on disk.

## Landing instructions (L1)

1. Append the single row line from `S143-row.md` (the line beginning `| S143 |`) immediately after the
   `S142` row, inside `## Registry`, and change nothing else. The line measures 2,092 bytes, `NF=13`.
2. Re-run the two commands above against the real lane; expect exit 0 with 143 rows.
3. Take the Gate table above verbatim, with the timestamp and word-count corrections applied.
