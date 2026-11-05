# R66Scout — sourced row for S-next (Node.js `path.join`), round 66

Read-only seat. No edits to `corpus/`, `SOURCES.md`, `SKILL.md`, `SCORECARD.md`, `LOG.md`,
`PROVINCE.md`, `MANIFEST.json`, any frozen round-65 counter, `.ufo/state/`, the fleet root,
or any sibling repo. Only git read commands were run (`cat-file -t`).

## 1. Access date

```
$ date -I
2026-11-05
```
(exit 0)

## 2. Source opened

| field | value |
|---|---|
| URL | `https://nodejs.org/docs/latest-v24.x/api/path.html` |
| canonical (page-declared) | `https://nodejs.org/api/path.html` (`<link rel="canonical">`) |
| HTTP status | `200` (`curl -sS -D headers.txt`, exit 0; `content-length: 59344`, `last-modified: Tue, 27 Oct 2026 23:55:07 GMT`, `etag: "681ffa3694a85c8cf7df1f9761f65ddc"`, `server: cloudflare`, `date: Thu, 05 Nov 2026 08:56:41 GMT`) |
| Node docs version line | `<meta name="nodejs.org:node-version" content="v24.22.2">` and page title `Path \| Node.js v24.22.2 Documentation` |
| section located | `### \`path.join([...paths])\`[#](#pathjoinpaths)` — anchor `#pathjoinpaths`; the heading element `id="pathjoinpaths"` sits at raw-HTML byte offset **41285** |
| anchor URL | `https://nodejs.org/docs/latest-v24.x/api/path.html#pathjoinpaths` |
| raw-HTML offset of the quoted sentence | byte **41795** (`The <code>path.join()</code> method joins all given …`) |

### Verbatim quote (21 words, ≤25)

> The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path.

**Location:** §`path.join([...paths])` (anchor `#pathjoinpaths`), first body paragraph of the
section, rendered text lines 351–352 of the saved reader text; raw HTML byte offset 41795.

Byte-exactness was checked against the raw HTML with whitespace collapsed to single spaces
(stripping tags and unescaping entities) — the collapsed paragraph is **character-identical**
to the quote above (21 words).

## 3. Saved fetch and its digests

Reader-text form (what the `read` tool returns for the URL):

```
$ sha256sum path-docs.txt
41b69aeaf4f5afd2a89503b1ec8947274a4e9a96dc55108b87dff8e03a7d4a4f  path-docs.txt
$ wc -c path-docs.txt
22212 path-docs.txt
$ wc -l path-docs.txt
628 path-docs.txt
```

- `…/round-66/w1/R66Scout/sources/path-docs.txt` — sha256 `41b69aeaf4f5afd2a89503b1ec8947274a4e9a96dc55108b87dff8e03a7d4a4f`, **22212 bytes**, 628 lines.
  Contains the full `path.join` section at lines 344–352 and the `path.resolve` section at 532–548.
- Supplementary, same folder (not required by the item, kept for byte-offset verification):
  `path-docs.raw.html` — sha256 `7b14f91d3d43b614b4232e367e34a544ca8ced97aabaf5628cf71db0a40ae969`, 59344 bytes;
  `headers.txt` — the HTTP response headers quoted above.

## 4. Does `path.join(repo, rel)` with a relative `rel` resolve against the process cwd?

**No.** `path.join` only joins the segments with the platform separator and normalises the
result; it never consults the process cwd. The cwd rule belongs to `path.resolve`, not to
`path.join`.

**Supporting doc lines (both verbatim):**

- §`path.join([...paths])` (`#pathjoinpaths`), first paragraph — the behaviour of join:
  > The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path.
- §`path.resolve([...paths])` (`#pathresolvepaths`), third paragraph — the cwd rule that
  exists only in `resolve`:
  > If, after processing all given path segments, an absolute path has not yet been generated, the current working directory is used.

  (raw-HTML byte offset 54368; reader text lines 547–548)

**Runtime corroboration (local, not part of the sourced row).** Local interpreter is
`node v24.21.0` (`/run/user/1000/fnm_multishells/…/bin/node`), one patch behind the documented
v24.22.2, so this is corroboration only and not the cited evidence:

```
$ node -e "const p=require('node:path');console.log(JSON.stringify(p.join('/abs/repo','rel/child.json')));console.log(JSON.stringify(p.join('rel/child.json')));console.log(JSON.stringify(p.resolve('/abs/repo','rel/child.json')));console.log(JSON.stringify(p.resolve('rel/child.json')));"
"/abs/repo/rel/child.json"
"rel/child.json"
"/abs/repo/rel/child.json"
"/home/vgpnk/Projects/shokunin/rel/child.json"
```
(exit 0) — `join` leaves a relative result relative (no cwd prefix); only `resolve` prefixes
the cwd. This matches the doc lines above.

**What this grounds for C2.** It grounds only the *semantics of the binding primitive*: the
gate's candidate list at `.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs:90`
(`path.isAbsolute(rel) ? [rel] : [path.join(repo, rel), path.join(path.dirname(file), rel)]`)
resolves a relative input **relative to the two bases it is given**, and never relative to
the process cwd. So the choice of base (repo first, matrix-dir second) is decided by that
line, and a fixture must place the relative input under one of those two bases to discriminate
M5a from M5b. It does **not** ground: which base should win when the input exists under both,
whether the gate's ordering is correct, or that the mutants are killed — those remain the
L1's frozen measurements.

## 5. Live sibling heads resolve

Snapshot read (read-only): `…/round-66/measure/snapshot-live-r66.tsv` (20 lane rows + header).

```
$ git -C /home/vgpnk/Projects/shokunin/<lane> cat-file -t <head>
```
(one invocation per lane, `-C` pointing at the lane repo; read-only)

| # | lane | head | `cat-file -t` output | exit |
|---|---|---|---|---|
| 1 | audio-shokunin | f9da7ee97e0ba95da1803c2afe9c616c519bae18 | `commit` | 0 |
| 2 | chousa-shokunin | 378fda82dc2cbcc555a0565052cc408121813cef | `commit` | 0 |
| 3 | game-dev-2d-shokunin | 1e033ef053beedf9a201daa21fbeb9c8b2f72dc3 | `commit` | 0 |
| 4 | game-dev-3d-shokunin | 39ca3973c7865456d97fae18033f3f460c6cf8c1 | `commit` | 0 |
| 5 | kagi-shokunin | a916f4a56a08a6dea9a1a2318bbe6406fd0ac97c | `commit` | 0 |
| 6 | kaidoku-shokunin | fe1913d90a3774020bab129f4c8cc5bc10daa523 | `commit` | 0 |
| 7 | kake-shokunin | d838e744462c68f57232d8a61eba631c495940a1 | `commit` | 0 |
| 8 | kama-shokunin | 24d1895d8aae24c741baba2a57c809a35f84cdab | `commit` | 0 |
| 9 | kasegi-shokunin | a5e814a1679626b6d9fb9ba3f1a6483ed4f4b68c | `commit` | 0 |
| 10 | kengaku-shokunin | 00462b596f517cc70528f1773c20eac7dd530bfd | `commit` | 0 |
| 11 | kotoba-shokunin | 4df1e8005016c75390a5e06b209462df58c95918 | `commit` | 0 |
| 12 | kotodama-shokunin | d39434b3bc8458e1b66edd2d0d0fea9ea32f3331 | `commit` | 0 |
| 13 | kumitate-shokunin | 7218699cfbdec702ba42f35ceac0a8e52d1bd564 | `commit` | 0 |
| 14 | lore-shokunin | 0f044aa7c7e4e17cfd5b6278179709b60db45d61 | `commit` | 0 |
| 15 | mado-shokunin | e4875ba5619053cc3f91bb2f4d819e189df4088c | `commit` | 0 |
| 16 | mori-shokunin | 7b3fe9d540c98b8b0390a0f9bbe78de4341092a5 | `commit` | 0 |
| 17 | revenger-shokunin | dcb10b964e908d2d4872488dde8fd4437c518dcb | `commit` | 0 |
| 18 | souji-shokunin | 16fa821fdce00e709d6895ccfc7aaffa465af195 | `commit` | 0 |
| 19 | tameshi-shokunin | f256302b394ae3253df014fe1131e2c20e2c16b6 | `commit` | 0 |
| 20 | tsukuroi-shokunin | 64f45b790f2dbbf63b9b343c47810118a79f7a35 | `commit` | 0 |

**Result: 20 of 20 heads resolve; 0 fail.** Every invocation exited 0 and every object type
is `commit`. No lane was missing from the snapshot and no head was unresolvable, so the
snapshot is a usable frozen input for the C1 meter at these heads.

## 6. Proposed SOURCES row (for the L1 to mint — `SOURCES.md` NOT edited here)

The highest existing id in `corpus/SOURCES.md` is `S170` (grep over `^| S[0-9]+` returns
`S165…S170`; `S171` occurs 0 times), so the next free id is **S171**. The L1 owns the
minting; this is the row text only.

```
| S171 | Node.js path API — path.join segment semantics — https://nodejs.org/docs/latest-v24.x/api/path.html | docs | A | Semantics of path.join for the v2 receipt-provenance gate's relative matrix-input binding (which base a relative input is resolved against); the binding primitive only, not the gate's correctness | §path.join([...paths]) (id pathjoinpaths) first body paragraph, and §path.resolve([...paths]) (id pathresolvepaths) third paragraph; Node.js v24.22.2 documentation, fetched 2026-11-05; raw body 59344 B sha256 7b14f91d…969; reader text 22212 B sha256 41b69aea…d4a4f at .ufo/waves/round-66/w1/R66Scout/sources/path-docs.txt | path.join joins segments and normalises the result and never consults the process cwd; only path.resolve substitutes the cwd, so a relative matrix input is bound to the bases the caller passes, and a discriminating fixture must place it under one of those bases | queued | 2026-11-05 | on-release | — |
```

Structural notes for the L1 (from `scripts/check-sources.mjs`, read-only):
- The row has 11 cells, matching the existing table shape (13 fields after `split('|')`
  including the two empty ends).
- `kind=docs`, `tier=A`, `status=queued`, `opened=2026-11-05` (ISO, ≥ the gate's `since`),
  `recheck=on-release`, `anchor` non-empty → satisfies the shape checks at
  `scripts/check-sources.mjs:290-338`.
- `status=queued` avoids the `mined_without_used_by` finding. If the L1 flips it to `mined`,
  a `used-by` path is required, and `inspectUsedBy` (`scripts/check-sources.mjs:203-248`)
  requires the used-by file to **exist inside the repo and literally contain the minted row
  id**. The C2 knowledge note at
  `.ufo/waves/round-66/w1/R66Scribe2/knowledge-provenance-relative-input-r66.md` currently
  says `source: S-next (…)`, i.e. it cites no id, so it would fail `row_id_absent` until the
  L1 substitutes the minted id (or the row cites a file that does contain it). Also note the
  URL must be unique across the registry or the row needs a `supersedes S…` prefix.
- `recheck=on-release` matches the treatment of other live-docs rows.

## 7. Commands run (all exit codes as observed)

| command | exit |
|---|---|
| `date -I` | 0 |
| `read https://nodejs.org/docs/latest-v24.x/api/path.html` (text form) | 0 |
| `read https://nodejs.org/docs/latest-v24.x/api/path.html:301-629` | 0 |
| `read https://nodejs.org/docs/latest-v24.x/api/path.html:raw:1-25` | 0 |
| `curl -sS -D headers.txt -o path-docs.raw.html -w 'http=%{http_code}' https://nodejs.org/docs/latest-v24.x/api/path.html` | 0 (http=200) |
| `sha256sum path-docs.txt path-docs.raw.html` / `wc -c` / `wc -l` | 0 |
| `git -C /home/vgpnk/Projects/shokunin/<lane> cat-file -t <head>` × 20 | 0 each, 20/20 `commit` |
| `node -e "…path.join/path.resolve…"` (corroboration only) | 0 |
| `grep`/`read` over `corpus/SOURCES.md`, `scripts/check-sources.mjs`, `.ufo/waves/round-66/**` | 0 |

No scratch tree, clone, worktree or fixture was needed for this read-only seat, so nothing
was created under `$HYAKU_SCRATCH` and nothing needed deletion. No package was installed or
upgraded, so there is no tool/version/channel entry to report.

## 8. Limits

- The row covers `path.join` only. `path.isAbsolute` (also used at v2 gate `:90`) is present
  in the same saved page (§`path.isAbsolute(path)`, reader text ~line 302) but was not part
  of this item's quote request; if the L1 wants both semantics in one row, the saved
  `path-docs.txt` already carries the `path.isAbsolute` section.
- The docs page is a living document under `/docs/latest-v24.x/`; the pinned facts are the
  node-version meta `v24.22.2` and the two digests above, not the URL itself.
- The local runtime check used Node v24.21.0 while the docs describe v24.22.2; the doc lines,
  not the runtime, are the cited evidence.
