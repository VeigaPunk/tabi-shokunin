# ConnectFrontier — frontier-row supersession chain (README / SOURCES / note)

Lane: tabi-shokunin, round-16 wave 2 (falsify), connector seat `TabiR16.ConnectFrontier`.
Snapshot under attack: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a`);
baseline `e38d2599a922cb729186353830fff8e159b4fef0`. All commands below ran at the lane root.
Nothing under the lane was modified except this report; mutations were confined to disposable clones under
`/tmp` (deleted). No tools installed or upgraded. Author-side findings, not certification.

## Item

> Check the README/SOURCES/note supersession chain for the frontier row "Native WebMCP in chromium 152 —
> unprobed (census U3)": every stale anchor (`corpus/README.md:35`, `:181`, `:194`;
> `corpus/knowledge/browser-surface-census.md:188`) now has a dated superseding statement, and no
> historical byte was edited.

## Axes named

1. **Supersession completeness** — each of the four named anchors has a dated statement that names it and
   states its new status.
2. **Historical-byte integrity** — the supersession is appended, never an in-place rewrite of the
   historical prose.
3. **Chain reachability** — a reader entering at a pointer (README `:181`'s "Current pointer", `:194`'s
   `corpus/SOURCES.md S020`) reaches the current state without landing on an unmarked stale claim.
4. **Counted-state admissibility** — the correction can land without making the round's C1/C2 measurements
   uncompilable with the measurement-binding gate.

## Verdict: **BREAKS**

2 of 4 anchors are fully addressed (`:35`, `:181`). The census anchor is named only from *outside* the
census file (note line 22); the census blob is **byte-identical to baseline** and contains **no** round-16
text. The decisive failure is `README:194`: no round-16 statement in the committed tree names it or restates
its status, while the row's own text is false at HEAD (`S020` is `mined`; the note exists). The only other
line in the chain that names `:194` is `README:216` — a round-12 row, also dated 2026-10-20, that says the item
is **unchanged**. Counterargument considered: `:194`'s own pointer (`corpus/SOURCES.md` S020) now resolves to
`mined`, so a reader who follows it self-corrects; that makes the row navigable but not superseded — the
acceptance asks for a dated statement, and the only same-date statement that names the row asserts the
opposite. The "no historical byte was edited" half **HOLDS** (README is a strict byte prefix of
baseline; census is the identical blob; exactly one pre-existing SOURCES line changed, in its `status` and
`used-by` cells only).

## Evidence

### A. The anchors as they stand at HEAD

```
$ nl -ba corpus/README.md | sed -n '35p;181p;194p;216p'
    35  - Native WebMCP in chromium 152 — unprobed (census U3).
   181  | Native WebMCP in chromium 152 | open — still unprobed; the only WebMCP surface evidenced on the host is a CDP tool, not `navigator.modelContext`, and no flag carries it. | `knowledge/browser-surface-census.md:145-153` and U3 `:188`. |
   194  | WebMCP spec | open — S020 opened and queued (CG draft 2026-10-16); native WebMCP in chromium 152 still unprobed | `corpus/SOURCES.md` S020; `knowledge/browser-surface-census.md` U3 |
   216  | Other open frontier ground | unchanged — extension↔daemon handshake, native WebMCP host probe, rate/rights real-site records, real-site journeys, WebMCP spec mining | historical frontier rows :180–183 and :194 |

$ nl -ba corpus/knowledge/browser-surface-census.md | sed -n '188p'
   188  - U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.) — no flag
```

The `:194` row is defined by the table legend at `README:186` ("`open` = rows queued in
`corpus/SOURCES.md`, no note"), so "open — S020 opened and queued" is false the moment S020 is mined and a
note exists.

### B. What names each anchor — exhaustive markdown search

```
$ git show HEAD:corpus/README.md | awk 'NR>=287 && /:194|:181|:35/ {print NR": "$0}'
295:Frontier status (append-only; the round-3 bullet at `:35` and the kaika row at
296:`:181` keep their historical wording): "Native WebMCP in chromium 152 —

$ git grep -n ':194' HEAD -- '*.md' | grep -v '127\.0\.0\.1' | grep -v '^HEAD:\.ufo/'
HEAD:corpus/README.md:216:| Other open frontier ground | unchanged — … WebMCP spec mining | historical frontier rows :180–183 and :194 |
HEAD:corpus/knowledge/hygiene-sweep-r4.md:60:| 19481, 19482 | …            # port-number false positive
```

The round-16 block (`README:287-305`) names `:35` and `:181` in its scope sentence and never names `:194`
(no match between lines 287 and 305). Every other `:194` hit in the tree is a `.ufo/` wave artifact
(drafts, wave-1 reviews, dispatch records) — not the documented chain.

```
$ nl -ba corpus/knowledge/webmcp-chromium-loopback-round-16.md | sed -n '9p;20,23p'
    9  verified-at: 2026-10-20 (round 16, Chromium 154.0.8037.97, loopback only)
   20  This note supersedes, for Chromium 154 only, the round-3/kaika frontier statement
   21  "Native WebMCP in chromium 152 — unprobed (census U3)" (`corpus/README.md:35`, `:181`;
   22  `knowledge/browser-surface-census.md:188`). It does not certify Chromium 152, which stays
   23  unprobed at runtime. The census guess "not `navigator.modelContext`" was an unsourced
```

The note is the dated superseding statement for `:35`, `:181` and (cross-file only) census `:188`. It does
not mention `:194` or `:216`. `SKILL.md:1831-1876` (round-16 section) likewise never mentions the frontier
rows; `LOG.md` and `SCORECARD.md` are byte-identical across the range (`git diff --stat e38d259 HEAD -- LOG.md
SCORECARD.md` → empty).

### C. `:194`'s factual claim versus the registry

```
$ awk -F'|' '/^\| S020 /{for(i=2;i<=12;i++){gsub(/^ +| +$/,"",$i)}; print "status="$9" opened="$10" used_by="$12}' corpus/SOURCES.md
status=mined opened=2026-10-19 used_by=corpus/knowledge/webmcp-chromium-loopback-round-16.md

$ git cat-file -e e38d2599:corpus/knowledge/webmcp-chromium-loopback-round-16.md; echo exit=$?
fatal: path 'corpus/knowledge/webmcp-chromium-loopback-round-16.md' exists on disk, but not in 'e38d2599…'
exit=128
```

So the row says "queued / no note" while the registry it points at says `mined` with the note in `used-by`,
and the note did not exist at baseline. The closest round-16 text is the map row at `README:293`, which lists
`S020, S030–S036` as the note's sources but never states S020's status; `README:301-305` lists what is "still
open" and omits "WebMCP spec mining", but names no row. Neither is a statement about `:194`.

### D. Census `:188` — named only from outside; no in-file erratum

```
$ git rev-parse HEAD:corpus/knowledge/browser-surface-census.md e38d2599:corpus/knowledge/browser-surface-census.md
90bd8ce8788f97d6c13b057e97df267f1070d8fe
90bd8ce8788f97d6c13b057e97df267f1070d8fe

$ git show HEAD:corpus/knowledge/browser-surface-census.md | grep -c '2026-10-2\|round 16\|Round 16\|U3-'
0        # exit 1

$ grep -n '## 6. Errata' corpus/knowledge/browser-surface-census.md
196:## 6. Errata
```

The census's own convention is an in-file append (every prior supersession got one: `Appended 2026-10-14`
blocks at `:200`, `:240`, `:264`). Round 16 appended nothing: the file's last errata is round 5
(`:264`, pre-append sha `a4bbb39edb12…`), the current file sha256 is `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b`,
and no `U3-*` successors exist. The committed draft for the missing append is explicit —
`.ufo/waves/round-16/drafts/DraftReadme.md:58-73` §C says "Apply §C only as an append to the census §6",
with the pre-append sha `a33c2264…` and the four-way U3 split; it was not applied. Consequence for axis 3:
`README:181`'s "Current pointer" (`browser-surface-census.md:145-153` and U3 `:188`) is a dead end forward —
a reader landing on `:188` sees an unqualified `navigator.modelContext` guess and "no runtime probe" with no
pointer to the note.

### E. Historical-byte integrity

```
$ base=$(git show e38d2599:corpus/README.md | wc -c); head=$(git show HEAD:corpus/README.md | wc -c)
$ echo "base=$base head=$head delta=$((head-base))"
base=32121 head=33534 delta=1413
$ git show e38d2599:corpus/README.md > /tmp/b; git show HEAD:corpus/README.md > /tmp/h
$ cmp -n "$base" /tmp/b /tmp/h && echo PREFIX_IDENTICAL
PREFIX_IDENTICAL
```

One diff hunk (`git diff … -- corpus/README.md | grep -c '^@@'` → `1`), additions only, at EOF after
`:285`; every baseline byte is preserved. Census: identical blob (above). The note is a new file.

SOURCES is the one mutable registry: `git diff --numstat e38d259 … HEAD -- corpus/SOURCES.md` → `13	1`.
The single replaced line is S020, and only `status` (`queued`→`mined`) and `used-by` (`—`→the note path)
differ; `opened 2026-10-19` and every other cell are byte-identical. This is the registry's designed
status transition, not a historical-prose rewrite; if the acceptance reads "no byte anywhere" literally,
this is the sole exception and it is named here.

### F. Counters and gate at HEAD (read-only)

```
$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2 | tail -1
{"revision":"b444ca8e…","c2_webmcp_held":1,…,"failures":[],…}          # exit 0

$ node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1 | tail -1
{"revision":"b444ca8e…","c1_binding_contracts":1,…,"failures":[],…}    # exit 0

$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json \
    --at b444ca8e024f386124418169e8e400221524bba3 --reproduce
MEASUREMENT_BINDING verdict=clean claims=2 bound=2
# exit 0
```

C1=1 and C2=1 with a clean binding are compatible with the broken chain — see §G and
Second-order effects 1 and 4.

### G. Mutation probe — the missing append is not free

In a disposable `--shared` clone of the lane at `b444ca8` (full tree; the manifest is untracked, so its
worktree bytes were copied in), I appended one dated correction paragraph naming `:194`/`:216` to
`corpus/README.md` and committed it (`528c5c79e85da271fe3d5ce03735f3daa9d1c025`). Control at the measured
revision: `verdict=clean`. At the probe commit:

```
$ node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at 528c5c79…
MEASUREMENT_BINDING verdict=failed claims=2 bound=1
finding claim=C2 reason=counted_input_changed detail=paths=corpus/README.md
# exit 1

$ node .ufo/waves/round-16/measure.mjs 528c5c79… --claim C2   → c2_webmcp_held=1, failures=[]
$ node .ufo/waves/round-16/measure.mjs 528c5c79… --claim C1   → c1_binding_contracts=1, failures=[]
```

Both counters still compute 1 (the append does not weaken the capability), but the gate unbinds C2 because
`corpus/README.md` is a declared counted input for C2 and the claim is measured at `b444ca8`
(`corpus/evidence/round-16/measurement-binding.json`; rule at `scripts/check-measurement-binding.mjs:57-58`).
So the append-only fix has an ordering cost: it must land **before** the delivered measurement, or C2's
`measuredRevision`/`after` must move to the post-append commit and be re-measured.

## What holds / what breaks

| Anchor | Round-16 dated superseding statement | Verdict |
|---|---|---|
| `README:35` | `README:287` section + `:295-297` names `:35`; note:20-22 | **HOLDS** |
| `README:181` | `README:295-296` names `:181`; clause-level supersession at `:298-302` ("not `navigator.modelContext`, and no flag carries it"); note:20-22 | **HOLDS** |
| census `:188` | note:20-22 names it and says "for Chromium 154 only"; **no in-file erratum**, census blob identical | **PARTIAL** (cross-file only; reader inside the census gets no forward pointer) |
| `README:194` | none; the only chain line naming it (`README:216`, also 2026-10-20) says "unchanged … WebMCP spec mining" while SOURCES S020 is `mined` and the note exists | **BREAKS** |

## Second-order effects

1. **The C2 counter cannot see this claim.** `measure.mjs:219` only tests
   `readme.includes('knowledge/webmcp-chromium-loopback-round-16.md')`; the frontier rows are not read. A
   green C2 (and a clean binding) is therefore not evidence that the supersession chain holds — the claim is
   asserted only in README prose, and it currently fails.
2. **The fix is counted-input-visible.** README is a C2 counted input; a correction commit after `b444ca8`
   produces `finding claim=C2 reason=counted_input_changed detail=paths=corpus/README.md` at every later
   revision until re-measured (observed in §G). Leave it unfixed and the chain stays false; fix it after the
   snapshot and the round looks like a counter regression for an unrelated reason.
3. **Dropped integration step, not a judgment.** The committed `DraftReadme.md` already carried the exact
   census §6 erratum (`:58-73`) and a per-layer frontier restatement (`:38-56`); the applied block kept only
   the map row and the `:35`/`:181` paragraph. The omission is mechanical.
4. **Adjacent (out of item scope, observed):** `corpus/evidence/round-16/measurement-binding.json` is
   **untracked** at `b444ca8` (`git status --porcelain` → `?? corpus/evidence/round-16/measurement-binding.json`;
   `git ls-tree -r HEAD -- corpus/evidence/round-16` does not list it). A fresh clone of the measured commit
   cannot run the gate without those worktree bytes; my control run used the worktree copy. Flagged for
   L1/verifiers; not folded into this verdict.

## Risks of leaving it as-is

- A reader or verifier following `:194` gets "S020 opened and queued" while the same file's round-16 block
  treats S020 as a live source and QUALITY 23 (`corpus/QUALITY.md:85-90`) cites the U3 guess as a recorded
  mistake — three documents in one chain disagree about the same row with no reconciling statement.
- `:216` ("unchanged … WebMCP spec mining", pointer to `:194`) is equally stale and shares the same dead end.
- `README:181`'s "Current pointer" terminates in a census U3 with no forward marker, so the chain's stated
  navigation does not reach the note unless the reader already knows the note path.

## Proposed move (one bounded, append-only)

1. `corpus/README.md` — append one dated paragraph after the round-16 block (never edit `:35`, `:181`, `:194`,
   `:216`), naming both stale rows:
   > Round-16 correction (2026-10-20): the "WebMCP spec" rows at `:194` and `:216` are superseded for S020
   > only — S020 is `mined`, used by `knowledge/webmcp-chromium-loopback-round-16.md`; "WebMCP spec mining"
   > is closed for S020. Chromium 152 runtime remains unprobed; `:194`'s "still unprobed" clause stands for
   > 152, not for the 154 build.
2. `corpus/knowledge/browser-surface-census.md` §6 — append the erratum already drafted at
   `DraftReadme.md:58-73` (pre-append sha `a33c2264…`; leave `:147-153` and `:188` byte-intact; split U3 into
   `U3-152-runtime` open / `U3-154-cdp-domain` held / `U3-154-runtime` held-on-receipt / `U3-default-profile`
   open).
3. Ordering — land 1+2 **before** the delivered measurement commit, or update the C2 claim's
   `measuredRevision`/`after` to the post-append commit and re-run `measure.mjs <NEW> --claim C2` plus
   `check-measurement-binding --reproduce`, so `counted_input_changed` does not unbind C2.
   Both counters were observed to keep returning 1 after the append (§G), so the move improves the doc chain
   without changing either count.

## Verification to run after the move

```
git show HEAD:corpus/README.md | awk 'NR>=287 && /:194|:216/ {print NR": "$0}'      # ≥1 dated line each
git show HEAD:corpus/knowledge/browser-surface-census.md | grep -n 'Erratum (round 16\|U3-'
git show e38d2599:corpus/README.md | cmp -n 32121 - <(git show HEAD:corpus/README.md)   # prefix intact
git rev-parse HEAD:corpus/knowledge/browser-surface-census.md   # new blob ≠ 90bd8ce8
node scripts/check-measurement-binding.mjs --check <manifest> --at <new HEAD> --reproduce   # clean
node .ufo/waves/round-16/measure.mjs <new HEAD> --claim C2                                  # 1
```

## Limits

- Author-side; this is not an outside admit/reject, and it exercises only the committed text plus read-only
  counters/gate. No browser, harness or external source was run or re-opened — none bears on a textual
  supersession claim.
- Mutation probe ran in `/tmp` clones only (commit `528c5c79…`, now deleted); no lane file was written by
  this seat except this report. Current `git status --porcelain` shows `?? .ufo/waves/round-16/w2/` and
  `?? corpus/evidence/round-16/measurement-binding.json` — the latter is untracked at the snapshot, has
  ctime `2026-10-20 11:57:18 -0300`, and was only read/copied out by this seat (it appeared after this
  seat's first status sample; a concurrent writer owns it).
- The gate control at `b444ca8` used the **untracked** worktree manifest (see Second-order effects 4); a commit-only checkout
  has no manifest to check.
