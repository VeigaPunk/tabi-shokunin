# R66Scout — scoped findings (round 66, wave w1)

Seat: scout, axes: coverage. Read-only. Full report with all command transcripts:
`.ufo/waves/round-66/w1/R66Scout/report.md`.

## Source opened (sourced row for S-next)

- URL: `https://nodejs.org/docs/latest-v24.x/api/path.html` — HTTP 200, canonical `https://nodejs.org/api/path.html`.
- Access date: `2026-11-05` (`date -I`, exit 0).
- Node docs version line: `<meta name="nodejs.org:node-version" content="v24.22.2">`; title `Path | Node.js v24.22.2 Documentation`.
- Section: `### \`path.join([...paths])\`[#](#pathjoinpaths)`, anchor `#pathjoinpaths` (heading `id="pathjoinpaths"` at raw-HTML byte 41285).
- Verbatim quote (21 words), §`path.join([...paths])` first body paragraph (reader text lines 351–352, raw byte 41795):

  > The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path.

  Byte-exact against the raw HTML with whitespace collapsed (character-identical, 21 words).
- Saved fetch: `.ufo/waves/round-66/w1/R66Scout/sources/path-docs.txt` —
  sha256 `41b69aeaf4f5afd2a89503b1ec8947274a4e9a96dc55108b87dff8e03a7d4a4f`, `wc -c` = **22212** (628 lines).
  Supplementary in the same folder: `path-docs.raw.html` sha256 `7b14f91d3d43b614b4232e367e34a544ca8ced97aabaf5628cf71db0a40ae969` (59344 B), `headers.txt`.

## join-vs-cwd answer

`path.join(repo, rel)` with a relative `rel` **never** resolves against the process cwd; it only
joins and normalises. Supporting doc lines (both verbatim):

- §`path.join([...paths])`: "The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path."
- §`path.resolve([...paths])` (raw byte 54368, reader text 547–548): "If, after processing all given path segments, an absolute path has not yet been generated, the current working directory is used." — the cwd rule lives in `resolve`, not `join`.

Grounds for C2: the gate's relative-input candidate list (v2 `:90`) is decided by the bases it is
handed (`--repo` first, matrix dir second) and never by the cwd, so a discriminating fixture must
place the relative input under one of those two bases. Does not ground: which base should win when
the input exists under both, nor any mutant-kill verdict (L1's frozen measurement).

## 20-head resolution

`git -C /home/vgpnk/Projects/shokunin/<lane> cat-file -t <head>` for all 20 rows of
`.ufo/waves/round-66/measure/snapshot-live-r66.tsv`: **20 of 20 resolve, 0 fail**; every output
was `commit` and every exit code 0. Lanes and heads as listed in the seat report §5. The snapshot
is a usable frozen input at these heads.

## Row proposal (L1 mints the id; `SOURCES.md` NOT edited)

Highest existing id is `S170` (`S171` appears 0 times), so next free is **S171**. Proposed row text,
the structural checks it satisfies under `scripts/check-sources.mjs:290-338`, and the
`used-by` constraint (the used-by file must literally contain the minted id; the C2 note currently
cites `S-next`, so it would fail `row_id_absent` until the L1 substitutes the id) are in the seat
report §6.

## Scope / limits

- Covers `path.join` only; `path.isAbsolute` is in the same saved page if the L1 wants it in one row.
- The `/docs/latest-v24.x/` page is living; the pinned facts are the node-version meta `v24.22.2` and the two digests.
- Local runtime corroboration only (Node v24.21.0, one patch behind the docs): `path.join('rel/child.json')` → `"rel/child.json"` (no cwd prefix), `path.resolve('rel/child.json')` → cwd-prefixed. The doc lines are the cited evidence.
- No scratch tree/clone/fixture was needed (read-only seat), so nothing under `$HYAKU_SCRATCH` was created or left behind. No tool was installed or upgraded.
