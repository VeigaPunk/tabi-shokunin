# R94Critic3 — when is the child input's backendNodeId B minted? (exploratory, leaf)

Scope: knowledge for the note, not a predicate. Judged on depth. Milestone: when is B minted.
Lane driver `scripts/chrome-cdp-backendnode-collision-round94.mjs` not edited (sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f, re-checked after my runs).
Probe = copy of that driver with a `--variant pre|late|after` switch (copy at `R94Critic3-probe.mjs`, sha256 dbc7694c…; not the lane file).
Chromium 155.0.8059.84 (Arch `/usr/bin/chromium --headless=new`), ports http 19571 / child 19572 / cdp 19573, reps 3, cross host `localhost`, parent `127.0.0.1`. Scratch `/fast/scratch/hyaku/tabi-r94/R94Critic3` (removed before yield).

## Commands run (exit codes)

```
node --check probe.mjs                       -> SYNTAX_OK (rc 0)
node probe.mjs --lane <lane> --nonce tabi-r94-c3-pre   --scratch .../run-pre   --out w1/R94Critic3-pre.json   --http-port 19571 --child-port 19572 --cdp-port 19573 --reps 3 --pad 300 --variant pre    -> rc 0, legs 3, failures 0
node probe.mjs ... --nonce tabi-r94-c3-late  --out w1/R94Critic3-late.json  ... --variant late   -> rc 0, legs 3, failures 0
node probe.mjs ... --nonce tabi-r94-c3-after --out w1/R94Critic3-after.json ... --variant after  -> rc 0, legs 3, failures 0
pgrep -f 'remote-debugging-port=19573' after each run -> 0 processes
```
Wall time for the three runs: 46.43 s. No tools installed or upgraded.

## Variants (what each leg did)

- **pre** (M-shape: 300 painted `<span>` before `#s`, pad 300 at load). Before the click: `DOM.getDocument {depth:-1}` on the iframe session; record the INPUT#s backendNodeId found (Bpre).
- **late** (child loads with pad 0; ~1 s after load a script prepends 300 painted spans in front of the input; wait 1 s; click). No pre-click DevTools serialization.
- **after** (child HTML has the input first, then the 300 painted spans, in DOM order). No pre-click serialization.

## Results (3 reps each; all legs: one iframe session, chooser fired, answer files = `[["tabi-r94-answer.txt",22]]`, no error)

| variant | leg | Bpre (pre-click serialization) | chooser B (iframe session) | page `describeNode(B)` | page root backendNodeId | page pierce INPUT#s | extra |
|---|---|---|---|---|---|---|---|
| pre | M-1,2,3 | 302 (all 3) | 302 | `No node found for given backend id` | 2 | 0 | pierce max 15; spans=300 pre-click |
| late | M-1,2,3 | n/a (no request) | 2 (all 3) | `#document` (collision) | 2 | 0 | after prepend+1 s: spans=300, inputInDom=true, firstChild id `p` |
| after | M-1,2,3 | n/a (no request) | 2 (all 3) | `#document` (collision) | 2 | 0 | input precedes spans in DOM |

Raw receipts: `.ufo/waves/round-94/w1/R94Critic3-pre.json`, `R94Critic3-late.json`, `R94Critic3-after.json` (driverSha256 = dbc7694c… in each; chromium string `Chromium 155.0.8059.84 Arch Linux`).
Pre-freeze comparators (not re-run by me): `.ufo/waves/round-94/probes/probe1…` (300 hidden `display:none` spans, pre-click serialization: B=2), `probe2…` (300 painted, pre-click serialization: B=302), `probe3…` (frozen fixture, no serialization: C B=2, M B=302, S B=305).

## What the data supports

1. **Not minted by a DevTools request.** `pre` (pre-click serialization) gives Bpre=302 = chooser B, and the frozen-shape M arm with no serialization (probe3) also gives 302. The request does not change B; it only reads it.
2. **Not minted at click time.** In `late`, 300 spans are present, laid out and visible at click time, and the input's B is still 2. If the renderer minted ids for all laid-out nodes in tree order at click, the prepended spans (which precede the input) would take 2..301 and B would be 302. It is 2. (Refutes "mint at chooser/click, all rendered nodes in tree order".)
3. **Not minted at DOM insertion after load.** Spans inserted after load do not move B (late: 2). The input's id is already fixed when those spans arrive.
4. **Minted at the child document's initial render, in tree order, for nodes that exist then.** `pre`/M: 300 spans present at load → input 302. `after`: input before spans → input 2. `late`: input rendered at load before the spans existed → 2. Consistent with: ids for the document's nodes are assigned in tree order during the first layout/paint pass, and only nodes that exist then count toward the input's B.
5. **Miss/collision threshold is about DOM-order-preceding nodes at first render, not a pad count.** `after` shows that 300 spans after the input produce the same collision as pad 0 (B=2 = parent root's id). This is a limit-3 fact the claim does not state: the M miss needs the spans before the input at first render.

## How sure

- Points 1–3: fairly sure (direct leg data, 3/3 reps each, consistent across variants).
- Point 4 (first render; layout vs paint vs parse): **low-moderate**. Not isolated. The only layout-tie evidence is probe1 (hidden spans, pre-freeze, pre-click serialization → B=2). That contradicts a plain "serialization mints every node in tree order" model, so layout/render-tied minting is the better fit, but probe1 is an old driver byte run and I did not re-run it. A clean test would be: 300 `display:none` spans before the input with no pre-click request, then `display:block` them after 1 s (paint-time vs layout-time vs DOM-time). Not run; out of this seat's three variants.

## Notes for the knowledge entry (not predicate clauses)

- Wording the note can state: "In this fixture the input's backendNodeId is fixed at the child's first render: spans present and in front of the input at that point push it to 302; spans added after first render do not, and spans after the input do not." Do not say "paint" or "layout" as proven.
- The r94 predicate's M arm (pad 300 before the input, no pre-serialization) is shaped correctly for the miss; the `late` and `after` variants are useful counterexamples to any reading that equates "pad count" with "the miss". Neither variant falsifies the frozen predicate, because the predicate does not claim a threshold.
- No `--live` run of the pinned driver was made here; the lane predicate, its controls, and the scored run are untouched by this seat.

## Sign-off

- Lane driver not edited (sha256 518f40ff… re-checked).
- No chromium left on 19571/19572/19573 (`pgrep` count 0 after each run).
- Scratch `/fast/scratch/hyaku/tabi-r94/R94Critic3` removed before yield; receipts copied into w1 first.
- No subagents, no background jobs, no git/jj mutation, no commits, no edits outside `.ufo/waves/round-94/w1/R94Critic3*`.

VERDICT C1: neutral
