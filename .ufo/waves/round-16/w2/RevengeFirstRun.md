# RevengeFirstRun — between-runs reconstruction of the C2 WebMCP receipt pair

Item: reconstruct exactly what changed between `receipt-first-run-failed.json` (8/11) and
`receipt.json` (11/11) via the `producerSha256` values and the fixture digests, and decide
whether any change exists other than the three named repairs and the `realpathSync` import.

Author-side review; not a certification. All commands run read-only at
`/home/vgpnk/Projects/shokunin/tabi-shokunin` on 2026-10-20. No writes to the lane except this
file. No tools installed.

## Verdict

**BREAKS** — the between-runs mutation set contains **two fixture files** (`frame-parent.html`,
`frame-child.html`) in addition to the harness, so "only the three harness repairs plus the
`realpathSync` import changed" is false as literally scoped. The fixture edits are declared as
the *content* of repair #2 in the note, but they are input-data changes, not harness edits, and
one of the three pass-flips is produced entirely by them.

Sub-verdicts:

| # | Claim attacked | Verdict | Basis |
|---|---|---|---|
| V1 | The two receipts were produced by different harness bytes | **HOLDS** | `cedccdf9…` vs `961874e4…`; `961874e4…` = committed blob at `8f7feb3` and `b444ca8` |
| V2 | The repair set = three named repairs + `realpathSync` import, nothing else | **BREAKS** | 2 fixtures edited at 11:48:03, between the runs (digests + bytes + mtimes); qualifies as a 4th changed artifact |
| V3 | The harness delta is exactly those repairs + the import | **UNPROVEN** | pre-repair producer bytes exist nowhere: 0 of 2453 git blobs hash to `cedccdf9…`; the path has only a `create mode` in `8f7feb3` (11:54:43), after both runs |
| V4 | No observable change outside the three repaired cases | **HOLDS** | full normalized receipt diff (below) shows only the 3 cases + statuses/findings/summary/verdict/port |
| V5 | "The original bytes are kept" (note §Corrections) covers the producer | **BREAKS** (producer reading) | only the *receipt* bytes are kept (sha256 `0ab50be4…`); the producer bytes are not. If the sentence means the receipt, it holds |

## Axes named

1. **A1 producer identity** — map each receipt's `producerSha256` onto recoverable bytes.
2. **A2 input identity** — do the fixtures (the case inputs) differ between runs, per digest and
   per served byte count?
3. **A3 window completeness** — enumerate *every* file in the lane written between
   `generatedAt`(before) and `generatedAt`(after).
4. **A4 residual delta** — after removing nonces (port, frameId, temp dirs, durations), what
   receipt content still differs?
5. **A5 claim falsification** — does A1–A4 admit a 4th change, and is a byte-level negative
   provable?

## A1 — producer identity: different harness bytes; only the post-repair bytes survive

```
$ jq -r '.producerSha256' corpus/evidence/round-16/webmcp/receipt-first-run-failed.json
cedccdf9b649fcead09b391cfe7b34fcbcb992ce503aac8adf21a55699149779
$ jq -r '.producerSha256' corpus/evidence/round-16/webmcp/receipt.json
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1

$ sha256sum scripts/webmcp-loopback-round16.mjs
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  scripts/webmcp-loopback-round16.mjs
$ git show HEAD:scripts/webmcp-loopback-round16.mjs | sha256sum
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  -
$ git show 8f7feb3:scripts/webmcp-loopback-round16.mjs | sha256sum
961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1  -
```

History of the path is a single creation, not an edit:

```
$ git rev-list --all -- scripts/webmcp-loopback-round16.mjs
8f7feb3ff7a0c0ceef220a362581e325a95d6f3a
$ git show --summary 8f7feb3 -- scripts/webmcp-loopback-round16.mjs
 create mode 100755 scripts/webmcp-loopback-round16.mjs
$ git log --format='%H %ci %s' -2
b444ca8e… 2026-10-20 11:55:15 -0300 round-16: repair C2 counter fixture-path read; retain first failing measurement
8f7feb3f… 2026-10-20 11:54:43 -0300 round-16: measurement-binding gate, native WebMCP loopback capability, sources and wave-1 evidence
$ git cat-file -e e38d259:scripts/webmcp-loopback-round16.mjs
fatal: path 'scripts/webmcp-loopback-round16.mjs' exists on disk, but not in 'e38d259'   # exit 128
```

First run `generatedAt` = `2026-10-20T14:46:36.879Z` = **11:46:36 local**; both commits are
11:54:43/11:55:15. So at the time of the first run the harness was **untracked**, and the only
harness bytes ever committed are the post-repair ones. The `receipt.json` leg is byte-reproducible
from `8f7feb3`; the `receipt-first-run-failed.json` leg is not reproducible from the repo at all.

Exhaustive object-database scan (streams every object through one `git cat-file --batch`, hashes
each blob with SHA-256):

```
blobs hashed: 2453
MATCHES for pre-run producer digest: []
blobs of size 63358: ['ffbfc69a36beb6a36e489cea5a4b59d4f68fd862']   # = current harness
```

Filesystem fallback: the only `webmcp-loopback-round16.mjs` anywhere under `/home/vgpnk` is the
lane copy (hash `961874e4…`); `git worktree list` shows one worktree; a size-window scan
(`find /home/vgpnk /tmp -maxdepth 4 -type f -size 60k -size -70k`, hashed) finds no file with
`cedccdf9…`; the earlier `/tmp` scan (`-maxdepth 3 -size -200k`, 400 files) also found none.
`git fsck --lost-found` yields two dangling trees from round 1, neither containing the harness;
`git stash list` empty.

**Conclusion A1:** the harness changed (`cedccdf9…` → `961874e4…`), the change is real, and the
pre-repair bytes are permanently unavailable. Any claim about the *content* of the harness delta
outside what the receipts constrain is unprovable from this repository.

## A2 — the fixtures changed between the runs

`fixtures[]` differs in exactly two entries:

| file | before bytes / sha256 | after bytes / sha256 |
|---|---|---|
| frame-child.html | 636 / `6ed41b9aac86ce1fc987f446daf0cb14a0129f4374f10b793c14137e7db89b24` | 860 / `a4e060ada0e804aa4ab7220269b813ad4018365f364645118d88ba742e7727b6` |
| frame-parent.html | 561 / `d281ff6656bae0f1910d7f68616de85c91a6464c7a8b14db2bc738a4fcd5a3c7` | 583 / `5b51e2700c73ab922e6573dce1e0aae1265d78d5fd2d89beeead354e91a96eb3` |

The other five fixtures are byte-identical across both receipts.

Independent corroboration inside each receipt: `server.served[]` byte counts match the
inventory digests (before: `frame-parent.html` 561, `frame-child.html` 636; after: 583, 860), and
`cases[frame-tools].fixtureSha256` tracks the parent fixture. Two independently produced fields
agree, so this is not a single-field artifact.

Filesystem corroboration (mtimes bracket the second run, `generatedAt` 11:48:16):

```
$ stat -c '%y %s %n' corpus/evidence/round-16/webmcp/fixtures/*.html
2026-10-20 11:48:03.0038150540  860 frame-child.html
2026-10-20 11:48:03.0048150520  583 frame-parent.html
2026-10-20 11:33:22 … / 11:31:05 …  (other five fixtures, both pre-run)
```

The committed fixtures at `8f7feb3` and `b444ca8` both hash to the **after** values
(`a4e060ad…`, `5b51e270…`); the pre-run bytes are in no revision. `git log --
corpus/evidence/round-16/webmcp/fixtures/` shows the single `8f7feb3` add.

The harness never writes into the fixtures directory: its only writes are the atomic
`writeFileSync(tmp, body, {flag:'wx'})` + `renameSync(tmp, args.out)` for the receipt
(`scripts/webmcp-loopback-round16.mjs:1606-1607`); `args.fixtures` is used only by
`existsSync/statSync`, `readdirSync`, `readFileSync`, `startFixtureServer`. So the two fixture
edits are external author edits, not harness side effects.

## A3 — window completeness: exactly six files written between the runs

```
$ find . -path ./.git -prune -o -type f \
    -newermt '2026-10-20 11:46:36' ! -newermt '2026-10-20 11:48:17' \
    -printf '%TY-%Tm-%Td %TH:%TM:%TS %10s %p\n'
2026-10-20 11:47:58.4068261030      63358 ./scripts/webmcp-loopback-round16.mjs
2026-10-20 11:48:03.0038150540        860 ./corpus/evidence/round-16/webmcp/fixtures/frame-child.html
2026-10-20 11:48:03.0048150520        583 ./corpus/evidence/round-16/webmcp/fixtures/frame-parent.html
2026-10-20 11:48:07.9563915650      65047 ./corpus/evidence/round-16/webmcp/receipt-first-run-failed.json
2026-10-20 11:48:07.9568648720        642 ./corpus/evidence/round-16/webmcp/receipt-first-run-failed.stdout.txt
2026-10-20 11:48:16.3447850270      64973 ./corpus/evidence/round-16/webmcp/receipt.json
```

`git status --porcelain` at 11:57 showed only the untracked `.ufo/waves/round-16/w2/` directory,
so no post-commit worktree dirt remains and no other lane file was touched in the window. (A
sibling seat later created `corpus/evidence/round-16/measurement-binding.json`, untracked, mtime
11:57:18 — not mine, outside the window, irrelevant to this diff; the harness, both fixtures and
both receipts are unchanged since the runs: mtimes 11:47:58 / 11:48:03 / 11:48:07 / 11:48:16, and
`receipt.json` still reports `producerSha256 961874e4…`, 11 passed, 0 failed.) Three of the six
are the harness + two fixtures (changes); three are the receipt/stdout artifacts (outputs).

Provenance nit, not a falsification: `receipt-first-run-failed.json` was materialized in the
corpus at **11:48:07**, i.e. after the harness (11:47:58) and fixture (11:48:03) edits. Its bytes
are nevertheless the first run's output:

```
$ sha256sum /tmp/tabi-r16-webmcp-L1.json corpus/evidence/round-16/webmcp/receipt-first-run-failed.json
0ab50be41c6008dc1159f97ddfd0cdb5caafc93f7d49608aa683fa5a1325eb78  /tmp/tabi-r16-webmcp-L1.json   (mtime 11:46)
0ab50be41c6008dc1159f97ddfd0cdb5caafc93f7d49608aa683fa5a1325eb78  corpus/…/receipt-first-run-failed.json
```

The first run's stdout names `out=/tmp/tabi-r16-webmcp-L1.json`, so the corpus copy is a
post-hoc `cp` of that file; the "retained unchanged" statement holds for the receipt bytes.

## A4 — residual delta after removing nonces

Command (normalizes port, 32-hex frame ids and temp dirs; drops `generatedAt`, `producer*`,
`durationMs`, `eventLog`, `events`):

```
F='del(.generatedAt,.producer,.producerSha256) | walk(if type=="object" then del(.durationMs,.eventLog,.events) elif type=="string" then gsub("127\\.0\\.0\\.1:[0-9]+";"127.0.0.1:PORT") | gsub("[0-9A-F]{32}";"FRAMEID") | gsub("/tmp/tabi-r16-webmcp-[A-Za-z0-9-]+/[A-Za-z0-9-]+";"/tmp/TMP") else . end)'
jq -S "$F" …/receipt-first-run-failed.json > /tmp/nb.json
jq -S "$F" …/receipt.json                 > /tmp/na.json
diff -u /tmp/nb.json /tmp/na.json
```

Everything that differs, grouped:

| Group | Field | before → after |
|---|---|---|
| nav repair | `cases[nav].expected` | `{toolsRemovedOnNavigate:["search"]}` → `{staleToolsInNewDocument:[], toolsRemovedOnNavigate:[]}` |
| nav repair | `cases[nav].expectedProvenance` | `harness-specified (navigation clears page-registered tools)` → `source oracle: devtools-frontend WebMCPModel.ts:192-203 (pin 66df492a) …` |
| nav repair | `cases[nav].detail`, `.status` | `registered=[search] removed=[]` / fail → new pass string / pass |
| frame repair | `cases[frame].fixtureSha256` | `d281ff66…` → `5b51e270…` |
| frame repair | `q.description` ×2 | absent → `"Query"` at `actual.perFrameDeclarations.{0,1}.declaration.expectedTools.0.inputSchema.properties.q` (i.e. both fixture files) |
| sandbox repair | `cases[sandbox].actual.iframeReport` | `{error:null,errorName:null,mcType:object,regType:function}` → same + `settled:"rejected"`, `error:"NotAllowedError: Access to the feature \"tools\" is disallowed by permissions policy."` |
| sandbox repair | `cases[sandbox].detail`, `.status` | `report={…} sandboxedAdded=0` / fail → `opaque sandboxed iframe denied: NotAllowedError (…)` / pass |
| derived | `findings` | 3 `case_failed` entries → `[]` |
| derived | `fixtures[]`, `server.served` bytes | 636/561 → 860/583 |
| environment | `server.port` | 35929 → 43245 |
| derived | `summary`, `verdict` | 8/3/11 fail → 11/0/0 pass |

Unchanged across the pair (verified by empty diff of the respective subtrees): `flags` (every
array and the `enableSemantics` string), `safety`, `protocolDomain` except `.source` port
(`protocolSha256` identical `126cf5fa9b3d6e189029d6af6695b6d029c2ca372277081804b9c82ce7865e7d`),
`loopback` (`externalRequestCount: 0`), `runtime.observed` (chromium launch sha256
`eaed39c3…a172b`, product `Chrome/154.0.8037.97`, node `24.21.0`, playwright `1.64.0`), `closure`
shape and every `pids[].gone`/`tempPaths[].removed` flag, and the other **8 cases** including
their `expected`, `expectedProvenance`, `actual`, `toolsAdded` and `control`.

So: the behavioral delta is bounded to exactly the three repaired cases. Whatever else the
harness delta contains (beyond those case functions and the import) is behaviorally inert on this
receipt — or nonexistent; the evidence cannot separate those two.

## Per-repair reconstruction (what the receipts pin, and how far)

**R1 navigation-clears-tools — oracle + predicate + diagnostic rewritten.**
The pre-run fail string `registered=[search] removed=[]` cannot be produced by the current
source, whose fail branch is
`` `registered=[${registeredNames}] removed=[${removedNames}] stale=[${stale}]` ``
(`scripts/webmcp-loopback-round16.mjs:1046`). The current pass predicate also needs
`removedNames.length === 0 && stale.length === 0` and a `getToolsSnapshot` call, which the
pre-run run's `actual` shape (`{getTools, toolsAddedAfterNavigate, toolsRemoved}` — same keys,
but `getTools: []`) and the receipt's own fail detail show were not *required* pre-run: the
pre-run case failed with `removed=[]` and empty `getTools`, i.e. the observation already
satisfied the new criterion. In-source comment at :1023 states the expectation was "repaired
after the first L1 run (which expected toolsRemoved and failed)". This is repair #1, and it is an
*acceptance-criterion change*, not a mechanism fix: the pre-run oracle demanded an event this
build does not emit. Declared.

**R2 frame-tools — data-only fix in two fixture files; harness matcher provably unchanged.**
- `expectedProvenance` is byte-identical before and after:
  `fixture __webmcpFixture.expectedTools per frame (frame marker attribution)`.
- `expected.perFrameTools[]` is identical modulo the ephemeral port and frameId.
- The fail detail `tool not observed: childSearch (frame …/frame-child.html)` is the `!match`
  branch of the current matcher, so the pre-run matcher already existed in the same shape.
- Chromium's *observed* tool schema already carried `q.description:"Query"` in **both** runs
  (`cases[frame-tools].toolsAdded[0].inputSchema.properties.q` is identical in both receipts).
- Only the *declared expectations* (read from `window.__webmcpFixture.expectedTools` in both
  fixtures) lacked it; `schemaEquivalent` then rejected the match.

Therefore the frame-tools pass was achieved by editing `frame-parent.html` (+22 B) and
`frame-child.html` (+224 B) so the fixture-declared expectation matches the label rule, with the
harness attribution logic untouched. The committed `frame-child.html` says so inline: "Added
after the first L1 run omitted it and failed." This is repair #2 as the note words it — and it
is the reason V2 fails: the pass was bought with **input** edits. Note the parent fixture was
changed too even though it declares no tools; it is the file the harness reads `frame:'child'`
attribution from, so both edits are expectation-data edits.

**R3 opaque-sandboxed-iframe — probe mechanics; the denial was already there, unread.**
Pre-run `iframeReport` is exactly a 4-key object `{mcType, regType, error, errorName}` serialized
in that order, which matches the current `out` declaration minus `settled`
(`…:1216`). The current fail-branch template (`…:1246`) reproduces the pre-run detail string
verbatim from such an object. The pass predicate now requires
`report.settled !== 'resolved' && report.errorName === 'NotAllowedError'`; pre-run the probe never
awaited the returned Promise, so `error` stayed `null` while `sandboxedAdded` was already `0`.
`expected` is byte-identical in both receipts. This is repair #3, declared, and it changes what is
*observed*, not what is *required*.

**The `realpathSync` import.** Current source imports it at :48 and uses it at :278, :304
(fixture-server confinement) and :735 (`/proc/<pid>/exe`). No receipt field can distinguish "the
import was added between runs" from "it was already present": the pre-run receipt shows a working
fixture server (`server.served` 12 entries, `deniedPaths: []`), and an unimported `realpathSync`
at :278 would have thrown `ReferenceError` before any case, producing no receipt at all — so at
minimum the pre-run confinement code did not call `realpathSync` while unimported. The claim is
**UNPROVEN**; it is consistent with the evidence and unfalsifiable from it. Both receipts also
record `runtime.observed.realExecutable: null`, so the engine-realpath feature at :735 produced
no value in either run and cannot serve as a marker.

## Why V3 cannot be closed

`producerSha256` commits to whole-file bytes. Recovering the pre-run delta would require one of:
a pre-repair commit (none: single `create mode` at 11:54:43), a staged/dangling blob (none: 2453
blobs hashed, zero matches; dangling trees are round-1), a second checkout or backup (none on
host), or a copy in `/tmp` (none found; the only `/tmp` artifact is the receipt at 11:46). The
receipt's own `producer.path`/`sha256` is the sole surviving commitment to those bytes.

Consequence for the lane: a reviewer can re-derive the *after* state from `8f7feb3`, and can
verify the three declared repairs against the after source and the two receipts, but cannot
verify that the harness diff contained nothing else. The note's phrase "the original bytes are
kept" is true of the failing receipt and false of its producer. Fix, if the author wants the
claim mechanical: retain the pre-repair producer (or a patch) beside
`receipt-first-run-failed.json`; a diff would then be checkable against `cedccdf9…`.

## Confidence

- A1, A2, A3, A4: **high** — independent receipt fields, filesystem mtimes, object-database scan
  and commit graph agree.
- R2 causal chain (fixture expectation → `schemaEquivalent` → `!match`): **high inference**,
  grounded in identical provenance/template across receipts and identical observed
  `toolsAdded` schema in both runs; the pre-repair harness text itself is not available to read.
- R1/R3 delta descriptions: **medium** — pinned by the pre-run detail strings and the current
  source's fail branches; exact line-level edits remain unrecoverable.
- `realpathSync` import status: **unresolved by construction**.

Nothing here was run as a harness execution; the reconstruction is static plus receipt evidence.
Counter/gate behavior was not re-measured (other lanes own that).
