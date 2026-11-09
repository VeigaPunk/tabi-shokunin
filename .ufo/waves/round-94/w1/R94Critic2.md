# R94Critic2 — procedure sensitivity of the C1 collision/miss law

Seat: R94Critic2 (leaf critic, no subagents, no commits, no git mutation). Ports 19561/19562/19563, one run at a time.
Scratch /fast/scratch/hyaku/tabi-r94/R94Critic2 (removed before yield). No tools installed or upgraded.

## What was run

- Probe copy: `.ufo/waves/round-94/w1/R94Critic2-probe.mjs` (sha256 of the lane driver copied byte-identical; only the
  `--variant`, `--parent-pad` flags and the three variant branches were added). The lane driver was not edited.
  Note for the record: my first edit batch clobbered six declarations; each run that hit this exited at argument
  parsing with `ReferenceError` (rc 1) and 0 Chromium processes; all were restored before any receipt was taken.
- Pinned sanity (probe copy, `--variant pinned`, 1 rep): C B=2 `#document` collision; M B=302 miss; S B=305 INPUT.
  Matches the scored shape, so the copy is a faithful stand-in for the pinned procedure.
- Variants (1 rep each; C/M/S unless the arm set is stated):
  - (a) `--variant a --parent-pad 400 --pad 300`: parent has 400 painted `<span>p</span>` before the iframe.
  - (b) `--variant b --pad N`, M arm only, N = 1, 5, 20, 100.
  - (c) `--variant c --pad 300`: chooser-session answer first, then the page-session cross call.
  - (d) `--variant d --pad 300`, M arm only: child's 300 spans `display:none`, no pre-click serialization.
- Frozen counter, live, on my ports: `node scripts/check-backendnode-collision-round94.mjs --lane <lane>
  --expect-driver-sha256 518f40ff…9686f --live --scratch <S>/counter-live --ports 19561,19562,19563 --json`
  → rc 0, verdict `clean`, checkCount 165, findings []. Receipt sha256 e36d5e0a…6dc6d1cd (new nonce; not the scored one).
- Each probe run: `echo rc`, then `pgrep -f "remote-debugging-port=1956[123]"` → empty (CHROMIUM_GONE) after every run.

Evidence: `.ufo/waves/round-94/w1/R94Critic2-results.json` (per-leg summary, machine-built from receipts),
receipts `R94Critic2-var-{pinned,a,b1,b5,b20,b100,c,d}-receipt.json`, frozen-counter output
`R94Critic2-counter-live.json` and its receipt `R94Critic2-counter-live-receipt.json`.

## Results (B = chooser backendNodeId; "pageRoot" = page DOM.getDocument depth 0 root)

| variant | leg | B | page describeNode(B) | parent pierce max | cross setFileInputFiles(B) on page | filesAfterCross |
|---|---|---|---|---|---|---|
| pinned | C | 2 | `#document`, url = parent, = pageRoot 2 | 16 | Node is not a file input element | [] |
| pinned | M | 302 | No node found for given backend id | 16 | No node found for given backend id | [] |
| pinned | S | 305 | INPUT#s | 636 | (no cross) | — |
| a (parent 400) | C | 2 | `#document` = pageRoot 2 | 816 | Node is not a file input element | [] |
| a (parent 400) | M | 302 | **`#text`** (no url), pageRoot still 2 | 816 | Node is not a file input element | [] |
| a (parent 400) | S | 705 | INPUT#s | 1435 | (no cross) | — |
| b pad 1 | M | 3 | **`#document`, url = about:blank**, not the root (root 2) | 16 | Node is not a file input element | [] |
| b pad 5 | M | 7 | No node found | 16 | No node found | [] |
| b pad 20 | M | 22 | No node found | 16 | No node found | [] |
| b pad 100 | M | 102 | No node found | 16 | No node found | [] |
| c (answer first) | C | 2 | `#document` = pageRoot 2 | 16 | Node is not a file input element | **[answer, 22]** |
| c (answer first) | M | 302 | No node found | 16 | No node found | **[answer, 22]** |
| c (answer first) | S | 305 | INPUT#s | 636 | (no cross) | — |
| d (display:none) | M | 2 | `#document` = pageRoot 2 | 16 | Node is not a file input element | [] |

Child answer on the chooser session succeeded (answer error null) in every leg of every variant; all `childFiles` = [answer, 22].

## Findings

1. **(a) parent padding: prediction confirmed.** With 400 painted spans in the parent, the same child fixture (pad 300,
   B=302) that misses under the pinned parent now collides with a parent node: page describeNode(302) names a `#text`
   node, and page setFileInputFiles(302) errors `Node is not a file input element` (the same error as the C arm).
   The collision is with a parent node that is not the root (pageRoot stays 2). So the miss is a property of the
   parent+child pair, not of the child alone. This is what the claim's mechanism sentence predicts from the other side
   ("when the child has minted more ids than the parent, B resolves to NO node"): a busier parent flips M to a collision.
   The frozen M-clause "every backendNodeId < B" fails here (pierce max 816 > 302), as it should for a different
   procedure. It does not contradict the frozen predicate, which pins the parent at 0 extra spans.

2. **(b) child pad sweep: B = pad + 2 exactly, and the boundary is not a child-pad threshold.**
   Child pads 1, 5, 20, 100, 300 gave B = 3, 7, 22, 102, 302 (one id per painted span on top of the root's 2).
   Pad 1 collides with a parent `#document` (about:blank, id 3, not the root); pads 5, 20, 100, 300 miss.
   The naive rule "collision iff B ≤ parent's max id" is FALSIFIED by the pad-5 leg: B=7 ≤ 16 and still NO node.
   So the miss/collision split is membership of B in the parent's live id set, not a comparison with the parent's
   largest id. The receipts cannot show the parent's minted set (the pierced tree skips some ids; the gap at 7 is
   [INFERENCE] a minted-then-removed or unserialized parent node), so the membership reading is consistent with all
   receipts but is not directly measured. The frozen claim says no threshold exists (declared limit 3); this agrees.

3. **(c) answer-first order: error texts unchanged, but the frozen "files stay []" read is order-dependent.**
   With the chooser-session answer first, `filesAfterCross` reads [answer, 22] in C and M, because the earlier correct
   call already set the files. The cross call's own error text is unchanged (`Node is not a file input element` / `No
   node found…`). So the frozen "child's files then read []" clause is informative only in the pinned order (declared
   limit 4 already names order as unmeasured). This is procedure sensitivity of an observation, not of the law.

4. **(d) display:none spans: the M miss depends on painted spans.** 300 `display:none` spans give B=2, a collision with
   the parent's root, identical to pad 0. So hidden DOM nodes mint no chooser id; the frozen wording's "painted" is
   load-bearing (the claim's fixture says painted `<span>x</span>`, so this is consistent with it). It also matches
   the pre-freeze probe1 observation (B=2 with display:none spans and pre-click serialization).

5. **Knowledge reading** "B resolves in the receiving renderer's own map: collision iff the parent minted B": every
   receipt above is consistent with it (pad 1 collides with a parent-minted id 3; pads 5+ miss on ids the parent did not
   have live; variant a collides when the parent has minted up to 816). Two gloss-level readings are contradicted by
   the data and should not be repeated: "collision iff B ≤ parent max" (pad 5) and "the collision is always with the
   parent root" (pad 1 and variant a's `#text`).

## Verdict reasoning

- None of the variants contradicts the frozen predicate: each changes the procedure (parent pad, child pad, order,
  hidden spans), which the predicate does not cover; the pinned-procedure live counter run is clean (165 checks, 0
  findings).
- No leg-level statement of the pinned predicate is false on a `--live` run of the pinned driver (the counter run).
- The claim's wording "when the child renderer has minted more ids than the parent renderer… NO node" is a mechanism
  sentence the instrument does not measure (the counter checks pierce max < B, a proxy valid at pad 300). Variant (a)
  supports its contrapositive; variant (b) pad 5 shows the instrument's proxy is not the mechanism, but the claim does
  not assert the proxy as a law. Not a falsification of the wording.

Install/update record: none (no tool installed, upgraded, or fetched). pacman not used.
Commands rc: probe node runs rc 0 (after the restoration edits); counter --live rc 0; pgrep after each run empty.

VERDICT C1: neutral
