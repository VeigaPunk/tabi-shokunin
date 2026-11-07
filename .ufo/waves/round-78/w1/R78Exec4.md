HOLDS

# R78Exec4 — attack the `--tree-exempt` interface of check-filechooser-r78.mjs

Verdict: **HOLDS** — across 41 measured legs the interface only ever *narrows* what the walk refuses, and it narrows only by the caller-declared exact real path. No tested shape (directory, symlink to a contradictory receipt, relative path, missing path, traversal, `/`, lane root, `/dev/null`, empty string, flag-like value, hard link, relabelled byte-copy) widened the refusal set or shielded a second path that shares bytes, nonce or inode with an exempted path.

## Interface under attack (code, commit D bytes)

`scripts/check-filechooser-r78.mjs` (sha of prior set read by every leg: `95c5d14091348c47fac51252448934ce08bf222327259fb02943ac6249816716`):

- `:183-184` — values come from argv; a value missing or starting with `--` is usage exit 2 (`:163`).
- `:291` — `real(p)` = `fs.realpathSync(p)`, fallback `path.resolve(p)` (for nonexistent paths).
- `:292-294` — `priorReal` (real paths of prior-set + `--prior`), `selfReal` (receipt under test), `exemptReal` (each `--tree-exempt`, absolute as given, else `path.join(lane, p)` → **lane-anchored, not cwd-anchored**).
- `:297-308` — walk of `<lane>/.ufo/waves/round-78` and `<lane>/corpus/evidence/round78`; every regular file parsed; `:307` unparsable heuristic (`.json` name in any case OR first non-blank byte `{`/`[`); `:308` classification `j.schema === SCHEMA && ('nonce' in j || 'events' in j) && rf !== selfReal && !priorReal.has(rf) && !exemptReal.has(rf)` — **exact realpath membership only; no prefix, no inode, no nonce-based exemption**.
- `:312-313` — findings `prior-set-complete` (exit 1) and `prior-set-unparsable` (exit 1).
- `:181-182` — declared contract: "It is exempt BY PATH; a different file claiming the same nonce is not."

## Method

Mirror lane `M=/fast/scratch/hyaku/tabi-r78/R78Exec4/m` (`scripts`, `corpus`, and `.ufo/waves/round-78/{controls,sources,lesson-proof,scored,claims.json,freeze.txt}` symlinked to the real lane; plants written only into mirror-local `M/.ufo/waves/round-78/x4/`, never through a symlink into the real lane). Command template (all legs):

```
node <M>/scripts/check-filechooser-r78.mjs --lane <M> \
  --receipt <R> --expect-driver-sha256 0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f \
  --expect-nonce tabi-r78-l1-d59ca0270c2a --prior-set <M>/.ufo/waves/round-78/controls/c1/prior-set.txt --json
```

with per-leg `--receipt` / `--tree-exempt` deltas below; full argv, cwd, exit, finding ids and the exact `walk.{outside,unparsable}` arrays per leg are recorded in `.ufo/waves/round-78-seats/R78Exec4/legs/ledger.json` (stage 1, 37 legs) and `legs/ledger2.json` (stage 2, 4 legs), raw counter outputs in `legs/<leg>.json`. `X` = byte-copy of the scored receipt (claims nonce `tabi-r78-l1-d59ca0270c2a`, sha256 `203dcef9765a74c4…`); receipt under test otherwise the real scored receipt.

## Results (leg | plant | --tree-exempt | exit | finding ids | walk.outside)

Baseline: `L0-baseline` | none | none | **0** | clean, checkCount 186 | — (re-run after the artifact incident below; full command `legs/L0-baseline.json`).

**(1) --tree-exempt shapes**

| leg | plant | tree-exempt value | exit | findings | outside |
|---|---|---|---|---|---|
| A1-ctl-dir-no-exempt | dirx/y.receipt.json (=X) | — | 1 | prior-set-complete | x4/dirx/y.receipt.json |
| A1b-dir-exempt | dirx/y.receipt.json | `<PLANT>/dirx` (dir) | 1 | prior-set-complete | x4/dirx/y.receipt.json — **dir exempts nothing** |
| A1c-dir-exempt-trailing-slash | dirx/y.receipt.json | `<PLANT>/dirx/` | 1 | prior-set-complete | x4/dirx/y.receipt.json |
| A2-ctl-symlink-no-exempt | X + link-to-x.json→X | — | 1 | prior-set-complete | x4/link-to-x.json (walk reports the first path to the shared realpath) |
| A2-symlink-exempt | X + link-to-x.json→X | `<PLANT>/link-to-x.json` | 0 | clean | — — **exempts exactly the target X, by its realpath** |
| A3-relative-exempt-cwd-tmp | X | `.ufo/waves/round-78/x4/x.receipt.json`, cwd=`/tmp` | 0 | clean | — — **lane-anchored: hostile cwd cannot steer it** |
| A3b-relative-exempt-cwd-lane | X | same relative value, cwd=M | 0 | clean | — |
| A3c-relative-ctl-cwd-tmp-noexempt | X | — (cwd=/tmp) | 1 | prior-set-complete | x4/x.receipt.json |
| A4-missing-abs-exempt | X | `<S>/ghost/missing.receipt.json` | 1 | prior-set-complete | x4/x.receipt.json — inert, no error |
| A4b-missing-dot-exempt | X | `.` | 1 | prior-set-complete | x4/x.receipt.json |
| A4c-traversal-relative-exempt | X | `../R78Exec4-ghost.json` (resolves outside lane) | 1 | prior-set-complete | x4/x.receipt.json |
| A4d-root-exempt | X | `/` | 1 | prior-set-complete | x4/x.receipt.json |
| A4e-lane-root-exempt | X | `<M>` | 1 | prior-set-complete | x4/x.receipt.json |
| A4f-devnull-exempt | X | `/dev/null` | 1 | prior-set-complete | x4/x.receipt.json |
| A5-scored-exempt-copy-in-tree | scored-copy.receipt.json (=X bytes) | scored receipt | 1 | prior-set-complete | x4/scored-copy.receipt.json — **exempting the original never shields the relabelled copy** |
| A5b-copy-as-receipt-under-test | copy-as-self.receipt.json in tree (=X bytes), `--receipt`=it | scored receipt | 0 | clean | — — selfReal carries the copy; scored exempted by declaration |
| A5c-copy-outside-trees | — (`--receipt`=seat-dir copy, outside all walked trees) | scored receipt | 0 | clean | — — declared limit: receipts outside the two trees are unseen |
| A5d-copy-outside-no-exempt | — (same copy, no exemption) | — | 1 | prior-set-complete | corpus/evidence/round78/chromium-file-chooser/receipt.json — **the ORIGINAL is refused** (see corollary below) |
| G1-controls-dir-symlink-exempt | X (m2) | `<M2>/.ufo/waves/round-78/controls` (symlinked dir) | 1 | prior-set-complete | x4/x.receipt.json |

**(2) contradictory receipt claiming the run's nonce, other path**

| leg | plant | tree-exempt | exit | findings | outside |
|---|---|---|---|---|---|
| B1-contradict-claims-run-nonce | X | — | 1 | prior-set-complete | x4/x.receipt.json — **refused, as required** |
| B2-contradict-exempt-direct | X | `<PLANT>/x.receipt.json` | 0 | clean | — — caller-declared exact-path narrowing (by design, `:181-182`) |

**(3) JSON-escaped schema files**

| leg | plant | exit | findings |
|---|---|---|---|
| C1-escaped-schema-string | escaped.receipt.json = `JSON.stringify('{"schema":"tabi-chrome-cdp-filechooser-r78",…}')` (top-level JSON string) | 0 | clean — parses, top-level schema is a string ⇒ not a receipt; **hidden, but also inert: it can never be loaded as a receipt** |
| C2-escaped-schema-array | top-level array of the escaped string | 0 | clean — same |
| C3-broken-json-named-json | truncated object, `.json` name | 1 | prior-set-unparsable — refused, not skipped (`:307`) |
| C4-broken-json-nonjson-name | same bytes, `.txt` name (starts `{`) | 1 | prior-set-unparsable — first-byte heuristic catches it |

**(4) hard links** — `hardlink-of-p1.receipt.json` in the seat dir is a TRUE hard link to prior `controls/c1/probe/p1.receipt.json` (shared inode 270067971, nlink 2), reached from the walked tree via symlink `x4/sym-to-hardlink.json`.

| leg | plant | tree-exempt | exit | findings | outside |
|---|---|---|---|---|---|
| D1-hardlink-no-exempt | sym→H | — | 1 | prior-set-complete | x4/sym-to-hardlink.json — **hard link refused despite shared inode** |
| D2-hardlink-exempt-original-prior | sym→H | p1 (the original prior) | 1 | prior-set-complete | x4/sym-to-hardlink.json — **exempting the original does not shield the link** |
| D3-hardlink-exempt-itself | sym→H | H | 0 | clean | — |
| D4-hardlink-exempt-via-symlink | sym→H | the symlink path | 0 | clean | — (same realpath as H) |
| D5-same-inode-pair-no-exempt | copy-of-p1 + hard link twin, both in tree | — | 1 | prior-set-complete | base-copy-of-p1…, twin-hardlink… — **both paths of one inode refused** |
| D6-same-inode-exempt-one-of-two | same pair | base-copy path | 1 | prior-set-complete | twin-hardlink… — the declared twin only |

**Usage guards / argv shapes / outside-tree target**

| leg | detail | exit | findings |
|---|---|---|---|
| E1 | `--tree-exempt --json` | 2 | usage (`:163`, `:184`) — fail-closed |
| E2 | `--tree-exempt` with no value | 2 | usage |
| E3 | `--tree-exempt ''` (empty string resolves to lane root) | 1 | prior-set-complete (inert) |
| F1 | walked symlink → receipt outside all trees (`<S>/outside/x.json`) | 1 | prior-set-complete at x4/sym-to-outside.json — walk follows symlinks, so an outside receipt reachable from inside **is refused** |
| F2 | F1 + tree-exempt = the outside target (absolute) | 0 | clean — declares exactly that realpath |
| F3 | F1 + tree-exempt = `../outside/x.json` (lane-relative) | 0 | clean |
| G2 (stage 2) | `--receipt` = in-tree copy-as-self, NO exemption | 1 | prior-set-complete naming the original scored receipt |
| L0b (stage 2) | baseline over m2 (scored tree scrubbed of the selftest artifact) | 0 | clean, 186 — proves the only pollution was that one file |

## Why the verdict is HOLDS

1. **Exemption is membership of one exact realpath in a set** (`:294`, `:308`). Directory, dot, root, lane-root, device, traversal, empty and missing values resolve to paths that can never equal a walked file's realpath — measured inert in A1b/A1c/A4*/E3/G1. There is no prefix/glob/inode/nonce matching anywhere in `:292-308`.
2. **No shape adds a refusal.** The only way a leg's refusal set grew beyond the plants was the walk itself following an in-tree symlink (A2-ctl, D1, F1) — that is the committed D2 symlink-following law, present with no `--tree-exempt` at all; no tree-exempt value created a new refusal. Malformed values fail closed with usage exit 2 (E1/E2), which stops the run rather than perturbing the walk.
3. **Narrowing is confined to the declared file.** The same bytes at a second path stay refused: relabelled copy (A5), byte-copy sibling (A5d, G2), hard link to a prior (D1, D2), same-inode twin (D5, D6). Exemption reachable through a symlink (A2, D3/D4) or a lane-relative path (A3, F3) still names exactly one target realpath — the caller cannot exempt a class, only a file, and cannot steer it via cwd (A3 vs A3c).
4. **The one real power the interface gives a caller** — exempting a contradictory nonce-claimant by declaring its path (B2, A2, F2) — is the interface's documented purpose (`:181-182`) and removes exactly one refusal; it smuggles nothing into the prior set or any other check (the exempted file is only silenced in `walk.outside`; it is not read as a prior, and the receipt under test still faces all 186 checks — `L0`/`A2` outputs show identical `checkCount`).

## Environmental finding (resolved, reported to L1)

During the first battery every leg — including a plant-free baseline — exited 1 with `prior-set-unparsable` naming `.ufo/waves/round-78/scored/selftest-r78-gates.out`. Cause (measured): the file is a JSON document (`"schema":"tabi-selftest-r78-gates"`) followed by a trailing prose line `clean=true cases=15 failed=none`; `JSON.parse` fails at position 7629 and `:307`'s first-byte heuristic flags it. It sat in walked tree `.ufo/waves/round-78/scored/` and flipped **every** honest counter re-run to exit 1. TabiR78 confirmed authorship and removed it (moved to `.ufo/waves/round-78-seats/L1-selftest/`); my re-run `L0-baseline` is exit 0 clean, 186. Predicate (b) cold runs in that window would have inherited this refusal.

## Corollary worth pinning for (a)/(b)

`controls/c1/prior-set.txt` (11 lines) does **not** list the r78 scored receipt — its last cross-generation entry is the **r77** receipt. The scored receipt passes `prior-set-complete` only because it is the receipt under test (`selfReal`, `:293`,`:308`). Measured consequence (A5d, G2): passing any relabelled copy as `--receipt` makes the counter refuse the original scored receipt (`prior-set-complete`, exit 1) unless the caller declares it via `--tree-exempt`. Correct per E2 (a different file claiming the run's nonce is refused), but any cold-run harness that points `--receipt` at a copy rather than the canonical path will see exit 1.

## Evidence and bounds

- Ledger + raw outputs: `.ufo/waves/round-78-seats/R78Exec4/legs/` (41 legs: `ledger.json`, `ledger2.json`, one JSON per leg); crafted receipts preserved under `.ufo/waves/round-78-seats/R78Exec4/artifacts/`; the true hard link and the outside-trees copy are `hardlink-of-p1.receipt.json` and `scored-relabelled-copy.receipt.json` in the seat dir.
- Every claim above is a ledger row (command template in Method, per-leg argv reconstruction in `ledger.json` fields `receiptUsed`/`treeExempt`/`cwd`, exits and finding ids as shown). Unrun = not passed: nothing here is asserted without a leg.
- No git/jj operations anywhere; the only writes under the real lane are this seat's dir and the two prose report files. No tools installed (node v24.21.0 already present; disk-guard checked: 401.0G free on /fast/scratch/hyaku). Scratch `/fast/scratch/hyaku/tabi-r78/R78Exec4/` removed after the runs.
