# Round 39 C2 independent D1–D3 recheck

## Inputs and method

Read `.ufo/waves/round-39/claims.json`; it names baseline `5bc56a81d196caeb8d24551928b883802697aabb`, frozen counter digest `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c`, and predicate D1–D3. At freeze commit `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`, `git show ...:.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs | sha256sum` returned that exact digest. A scratch clone was rooted at `/fast/scratch/hyaku/tabi-r39/RevC2D2D3/repo` (root asserted) and checked out at current tip `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`; clone was clean. Scratch was removed before report completion.

Commands run in that clone:

```sh
node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 5bc56a81d196caeb8d24551928b883802697aabb --repo "$S/repo" --json
node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4 --repo "$S/repo" --json
```

Both exited **1** (counter evaluated; full predicate false). The complete raw JSON was captured in tool artifact `artifact://58775` (lines 2 and 5).

## Raw D1–D3 values

At **baseline `5bc56a81d196caeb8d24551928b883802697aabb`**:

- D1: `stalePresent=true`, `supersedingCorrection=true`, `seats=34`, `w2Absent=true`.
- D2: stated `{ok:23,finding:11}`; recomputed `{ok:23,finding:11,error:0,none:0,reports:34}`. The 34 seats consist of 23 final `VERDICT ok` and 11 final `VERDICT finding` reports.
- D3: all six expected round-37 hashes were present in the LOG round-38 section, resolved as commits, and ancestors of baseline: `99437d29de036415a9f2d0524343617a3b19988a`, `f76da094f0ff0ad9856d2232858241e3f7841379`, `34ed508c47ca8727450d7f210bc440dadb61f883`, `5a2ebb6af9cbfe024c4a98d483dfe476a02e59f1`, `f485cce10c8640eda64f5e555f99894ed4de7fb0`, `bf8ecd5a663d9773d92c4842ed1874814b8a9a83`. `freezeLandingStated=true`.

At **current tip `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`**, D1 and D2 returned the same values above. D3 returned the same six `presentInR38Section=true`, `isCommit=true`, `ancestorOfRev=true` triples and `freezeLandingStated=true`.

Independent direct ancestry commands (`git cat-file -t HASH`, `git merge-base --is-ancestor HASH REV`) confirmed all six are commits and ancestors of both revisions. The instrument freeze is not an ancestor of baseline and is an ancestor of current tip.

## LOG typo handling

The actual LOG ledger at `LOG.md:2533` spells each of the six hashes above correctly and says the freeze-entry work was carried in `34ed508c`, not the freeze commit. Thus the observed LOG entries are not mistyped; the counter's exact `r38.includes(fullHash)` checks, `cat-file` checks, and ancestry checks would reject a misspelled expected ledger hash.

Residual D3 weakness: `freezeLandingStated` is not a full-hash/statement binding. The frozen implementation at `c2-routed-defects-v2.mjs:147-148` only requires `/34ed508c/` somewhere in the LOG suffix and forbids one narrow pairing pattern involving `99437d29`. A typo or misleading attribution retaining the short substring `34ed508c` can therefore still score true. This did not falsify the observed ledger text, but the claim that the landing statement is accurately verified is broader than this implementation.

## Overall counter status

The baseline run reported D4 receipt absent, D5 census receipt absent, D6 numstat receipt absent, and D7 claims absent. The tip run reported D5 census receipt and D6 numstat receipt absent; D4 and D7 passed. Thus the whole predicate was false at both revisions, for the emitted reasons; D1–D3 themselves passed at both.

VERDICT finding — observed D1–D3 values match the frozen claims, but D3's freeze-landing text check is only a short-substring test and does not honestly enforce an exact landing-hash attribution.
