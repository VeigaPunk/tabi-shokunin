VERDICT: PASS

# Round 18 measurement-binding input inventory

Scope: the three production counter invocations at measured revision `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`REV`), with the declared before revision `2bff864fdfee684ddbcd066cc8e735adaba2735c` (`B`). This is an input-path inventory only; no counter was run, no manifest was created, and no lane files other than this report were written.

## C1 — freshness

Counter identity and invocation:

```json
{
  "path": ".ufo/waves/round-18/measure-c1.mjs",
  "sha256": "df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234",
  "argv": ["node", ".ufo/waves/round-18/measure-c1.mjs", "{REV}"],
  "countField": "c1_rows_rechecked"
}
```

`argv` intentionally omits `--live`, `--self-test`, and `--lane`; the production entry dispatches to `countRevision` without those switches (measure-c1.mjs:484–499, 778–789). The counter’s measured fields are emitted at :469–480.

Sorted `countedInputs`:

```json
[
  ".ufo/waves/round-18/recheck-fetch.mjs",
  "corpus/SOURCES.md",
  "corpus/evidence/round-13/aria/receipt.json",
  "corpus/evidence/round-18/source-recheck/"
]
```

Why each is required:

- `corpus/SOURCES.md` is read at the arm revision and supplies row IDs, source URLs, kinds and teaches text (measure-c1.mjs:12–18, 437–444).
- `corpus/evidence/round-18/source-recheck/` is enumerated recursively as a Git tree; direct-child JSON receipts are read, and their referenced excerpt blobs are conditionally read (measure-c1.mjs:102–112, 291–305, 362–369). At `REV` the tree has exactly 102 entries: paired `.json` and `.excerpt.txt` files for `S001–S003`, `S005–S038`, `S040–S046`, `S048`, `S051–S052`, and `S054–S057` (51 receipt IDs). At `B` the same tree has zero entries.
- `.ufo/waves/round-18/recheck-fetch.mjs` is read at the arm revision and hashed to validate receipts when the receipt tree is nonempty (measure-c1.mjs:437–450).
- `corpus/evidence/round-13/aria/receipt.json` is read from the pinned historical object `837b33a3988ebeea7f6b4ef5c04698da88909a73` when the `S029` receipt is present; the pinned digest is `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (measure-c1.mjs:16–18, 451–455). The candidate S029 receipt names this exact path and uses `decode: "none"`, so the production arm does not invoke the PDF decoder.

At the `B` arm there are no round-18 receipt entries, so the production counter reads `SOURCES.md` and the empty receipt tree but skips the producer and S029 source lookups. The separate C1 `--self-test` reads baseline `SOURCES.md` at `B` (measure-c1.mjs:643–647); that branch is not in this `argv` and is not a counted production input. `--live` is also absent, so no source URL fetch belongs in this manifest entry.

## C2 — operability

Counter identity and invocation:

```json
{
  "path": ".ufo/waves/round-18/measure-c2.mjs",
  "sha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "argv": ["node", ".ufo/waves/round-18/measure-c2.mjs", "{REV}"],
  "countField": "c2_hazards_closed"
}
```

The field is the number of passing entries among the six hazards (measure-c2.mjs:845–863); the production CLI accepts the revision without `--self-test` or worktree overrides (:904–924).

Sorted `countedInputs`:

```json
[
  "corpus/evidence/",
  "scripts/"
]
```

Why these prefixes are required:

- `scripts/` is queried as a tree to select the highest-numbered `scripts/webmcp-invoke-round*.mjs`, and the selected blob is used for all probes (measure-c2.mjs:133–142). At `REV` that is `scripts/webmcp-invoke-round18.mjs`; at `B` it is `scripts/webmcp-invoke-round17.mjs`. The F6 probe also checks and runs `scripts/freshness-witness.mjs` at `REV` (absent at `B`) (:758–781, 784–801). The directory prefix is necessary to bind both the current selector result and any later-added higher-numbered harness that could change the selection.
- `corpus/evidence/` covers two data uses: the counter recursively snapshots matching `corpus/evidence/round-*/webmcp-invoke/receipt.json` files before/after its abnormal probe, and the selected harness’s default fixture root is `corpus/evidence/round-17/webmcp-invoke/fixtures/` (measure-c2.mjs:274–303; scripts/webmcp-invoke-round18.mjs:48–55, 1330–1340). The round-17 fixture directory contains these seven HTML files at both `B` and `REV`: `invoke-decl-nav.html`, `invoke-decl-result.html`, `invoke-declarative.html`, `invoke-iframe-child.html`, `invoke-iframe-parent.html`, `invoke-imperative.html`, and `plain.html`. The round-18 download fixture is embedded in the selected harness and is therefore covered by `scripts/`.

The full `corpus/evidence/` prefix is deliberate rather than a claim that every evidence file is read as bytes: the counter dynamically enumerates the evidence tree and filters round-numbered receipt paths, while the harness reads the round-17 fixture subtree. The manifest path syntax supports literal paths/prefixes, not the dynamic glob the counter uses. `runNormalArtifact` writes its output receipt under the counter’s temporary run directory, not under the tracked evidence tree (measure-c2.mjs:423–428; scripts/webmcp-invoke-round18.mjs:2743–2760).

External, non-Git inputs that `countedInputs` cannot express: the Node executable/runtime; `/usr/bin/chromium`; the Playwright package and its version (`1.64.0`, found through external package directories); `ss -H -ltnp`; `/proc` process arguments/statistics; host process/listener state; and temporary-directory behavior. These are read or exercised by measure-c2.mjs:73–77, 337–359, 411–420 and scripts/webmcp-invoke-round18.mjs:50–55, 290–320. They remain environment reproducibility requirements, not omitted repo paths.

## C3 — calibration

Counter identity and invocation:

```json
{
  "path": ".ufo/waves/round-18/measure-c3.mjs",
  "sha256": "cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a",
  "argv": ["node", ".ufo/waves/round-18/measure-c3.mjs", "{REV}"],
  "countField": "c3_routed_closed"
}
```

The production CLI takes exactly one revision argument (measure-c3.mjs:1046–1071); the result field is emitted at :583–601.

Sorted `countedInputs`:

```json
[
  ".ufo/waves/round-17/harm-baseline.json",
  ".ufo/waves/round-18/sources/S058Listing.md",
  "corpus/SOURCES.md",
  "corpus/adjacency.tsv",
  "corpus/evidence/round-18/routed/adjacency-selftest.json",
  "corpus/evidence/round-18/routed/harm-at-93bfead.json",
  "corpus/evidence/round-18/routed/harm-runner.mjs",
  "corpus/evidence/round-18/routed/harness-reruns/",
  "corpus/lessons/round-18.md",
  "scripts/check-adjacency.mjs",
  "scripts/check-aria-metadata.mjs",
  "scripts/check-freshness.mjs",
  "scripts/check-measurement-binding.mjs",
  "scripts/check-round-contract.mjs",
  "scripts/check-sources.mjs",
  "scripts/check-user-round-contract.mjs",
  "scripts/webmcp-invoke-round17.mjs"
]
```

Revision and path provenance:

- At the fixed historical reference revision `93bfead1f5f25f584353df3152a60209bbd89a2e`, the counter reads `corpus/adjacency.tsv`, `.ufo/waves/round-17/harm-baseline.json`, and the round-17 adjacency checker and invoke harness. It extracts one `scripts/*.mjs` path from each of 20 gate argv entries and hashes the unique paths (measure-c3.mjs:18–38, 165–228). The complete sorted unique set from that baseline is the six listed `scripts/check-*.mjs` paths above; the fixed checker/harness paths are `scripts/check-adjacency.mjs` and `scripts/webmcp-invoke-round17.mjs`.
- At the arm revision, D1 reads `corpus/lessons/round-18.md`; D2 reads the harm receipt and `harm-runner.mjs`; D3 reads `adjacency-selftest.json`; D4 reads `corpus/SOURCES.md` and `.ufo/waves/round-18/sources/S058Listing.md`; D5 reads `harness-reruns/index.json`, inventories every `run-<n>.json`, and reads the indexed receipts (measure-c3.mjs:267–295, 306–367, 387–415, 427–472, 478–579). At `REV`, the rerun prefix has exactly `index.json` and `run-1.json` through `run-7.json`.
- `corpus/lessons/round-17.md` and `.ufo/reports/round-17/tabi.md` are cited as strings in the round-18 lesson; the counter does not open them. It calculates the sibling count from `corpus/adjacency.tsv` at the fixed reference revision. `BASELINE_REV` appears only in a self-test forgery (measure-c3.mjs:20–21, 866–867); the production `argv` does not read a separate baseline file.

The counter also reads its own committed blob at `REV` to report `counterSha256` (measure-c3.mjs:583–600). As with C1/C2, that is bound by `counter.path` and `counter.sha256`, not repeated as a counted input.

## Reproduction topology

No original fleet layout or sibling worktree is required. The lane resolves as `/home/vgpnk/Projects/shokunin/tabi-shokunin` with its own `.git` directory; both `HEAD` and `refs/heads/master` were `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. The C2 counter creates its own temporary `git clone --no-hardlinks` of the lane and checks out the requested revision (measure-c2.mjs:145–162). The C1 pinned source commit `837b33a3988ebeea7f6b4ef5c04698da88909a73` and C3 reference commit `93bfead1f5f25f584353df3152a60209bbd89a2e` are both ancestors of `REV`; a normal full-history clone of the lane therefore retains both Git objects. Keep the lane’s repository structure and committed `scripts/`/`corpus/evidence/` trees, but no outer fleet siblings are addressed by these production paths.

## Evidence commands and observed results

All commands below were read-only. Commands used absolute lane paths.

- Counter blob SHA-256s (all exit 0):
  - `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:.ufo/waves/round-18/measure-c1.mjs | sha256sum` → `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234  -`
  - `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:.ufo/waves/round-18/measure-c2.mjs | sha256sum` → `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6  -`
  - `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:.ufo/waves/round-18/measure-c3.mjs | sha256sum` → `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a  -`
  - Worktree SHA-256s matched all three candidate blob digests exactly. The round-18 harness, round-17 harness, and freshness witness worktree digests also matched their candidate blobs exactly: `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`, `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`, `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1`.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only 530f40a9bc3f10436161a2af1ca0fe9bffffc004 corpus/evidence/round-18/source-recheck | wc -l` → `102`; the same command at `B` → `0`; combined command exit 0.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sha256sum` → `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -`; `git cat-file -e` for that object and for `REV:corpus/evidence/round-13/aria/receipt.json` both exited 0.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 93bfead1f5f25f584353df3152a60209bbd89a2e:.ufo/waves/round-17/harm-baseline.json | jq -r '.gates | length'` → `20`, exit 0. Extracting and sorting unique `scripts/*.mjs` argv values returned exactly the six C3 gate-script paths listed above, exit 0.
- `git ls-tree -r --name-only REV corpus/evidence/round-18/routed/` returned the two fixed receipts, `harm-runner.mjs`, `harness-reruns/index.json`, and `run-1.json` through `run-7.json` (10 tracked files total), exit 0.
- The `git ls-tree -r --name-only` fixture query at both `REV` and `B` returned the seven round-17 fixture paths listed above, exit 0 for each.
- `git merge-base --is-ancestor 837b33a3988ebeea7f6b4ef5c04698da88909a73 REV` and the equivalent command for `93bfead1f5f25f584353df3152a60209bbd89a2e` each returned exit 0.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` and `... rev-parse --verify HEAD` each printed `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

## Findings, residual risk, and verification gaps

No actionable defect was found in the requested input-path inventory. The C2 result still depends on host runtime/process observations beyond Git paths, as listed above; binding only its repository paths does not freeze those external conditions.

I did not execute `node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`, the C2 equivalent, or the C3 equivalent. Therefore this report asserts neither their stdout nor exit status nor measured counts; those counts remain for the integrator’s actual measurement. The only failed inventory probe was a `git ls-tree` pathspec-glob attempt, which exited 128 with `pathspec magic not supported by this command`; the C2 input is consequently represented by the necessary concrete `corpus/evidence/` prefix justified by the counter’s recursive scan, not by an asserted exhaustive enumeration of all matching historical receipt filenames.

LSP was unavailable: `read xd://lsp` returned `No such tool` (the mounted-device list contained no LSP device), so no LSP status/references/definition/diagnostics request could be made. Literal grep was used only to locate source line anchors; conclusions above come from reading the referenced candidate-matching source ranges and Git blobs, not from grep output.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/BindingDesign.md
