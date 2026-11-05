# S172 candidate row template (unfilled; the L1 replaces every `{{FILL: …}}` and gates the row with check-row.mjs before append)

Row (registry columns: id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by):

```
| S172 | {{FILL: title}} — {{FILL: canonical URL from the scout's staged file}} | docs | A | {{FILL: scope — the claim or topic the tier applies to}} | §{{FILL: section heading}} @ {{FILL: revision or publication date}} | {{FILL: one grounded learner benefit}} | mined | 2026-11-05 | 180d | {{FILL: repo-relative knowledge entry path that cites S172}} |
```

Fixed by the lane: id `S172` (next unused: registry max is S171), kind `docs` (or `spec` for a W3C/WHATWG-class spec), tier `A`, status `mined`, opened `2026-11-05`, recheck `180d`.

Lesson `## Gate` fields the L1 fills from the scout's staged file (not part of the row; no quote is invented here):

- quote (≤25 words): `{{FILL: quote from scout staged file}}`
- quote location: `{{FILL: section / line of the staged file}}`
- access date: `{{FILL: date the scout opened the source}}`
- raw-fetch sha256: `{{FILL: sha256 of the staged raw fetch}}`

Gate command (refused until every `{{FILL: …}}` is replaced, the used-by path exists inside the repo, and that path cites S172):

```
node .ufo/waves/round-67/w1/R67Scribe1/check-row.mjs --registry corpus/SOURCES.md --root . '<filled row>'
```
