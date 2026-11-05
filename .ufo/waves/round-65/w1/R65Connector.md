# R65Connector — sibling-overlap scan (round 65, w1, read-only)

Deliverable: `.ufo/waves/round-65/w1/R65Connector/overlap.md` (one row per overlapping sibling; `siblings-with-overlap: 14`).

## Method
- Scope: 20 sibling lanes under `/home/vgpnk/Projects/shokunin/*-shokunin` (tabi skipped); each `PROVINCE.md` and `SKILL.md`.
- Terms: `receipt|provenance|adjacency|matrix|mutation` (scan), then ownership-phrase narrowing (`adjacency`, `provenance`, `mutation method|matrix|harness`, `receipt` with bind/sha/digest/gate/replay/verify).
- Each overlap row was verified with `sed -n` at its `path:line`; all 14 cited locations match their claim text.
- Commands run: `grep -c -iE 'receipt|provenance|adjacency|matrix|mutation' <file>` and `grep -n -iE ... <file>` for all 38 PROVINCE.md and SKILL.md files (2711 hit lines captured in scratch, deleted); narrowed greps as above; `sed -n` verification.
- No edits, no git mutation, no installs. Subagents not used (leaf seat).

## Result against C1 and C2
- **C1 (per-key disposition conflict in an adjacency ledger):** no sibling claims this check. Two lanes use the word for different mechanisms: kagi `corpus/adjacency.tsv` (ownership partition, kagi PROVINCE.md:72) and tsukuroi `adjacency-anchors` / `adjacency-overlap` gates (tsukuroi SKILL.md:2080, 2482; anchor counts). Neither checks per-(lane, path, line) dispositions. Name collision only; flag for the L1 so C1 does not borrow their vocabulary as prior art.
- **C2 (input path resolves and sha256 equals pinned matrix sha):** 12 lanes (chousa, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, kumitate, mado, mori, revenger) bind receipts or inputs by digest or revision. Closest mechanisms to C2:
  - kumitate `receipt-bind` (SKILL.md:646): hashes the instrument named in `cmd=` from `git show <rev>:<path>` and compares it to the receipt's `tool_sha256`. This is the nearest analogue to "resolve the input path and pin its sha256".
  - revenger receipt_ok (SKILL.md:54): `fixture_sha256==expected_hash` with forged-receipt controls. The forged-control pattern is worth reusing in v2 self-tests.
  - mori receipt provenance grammar (PROVINCE.md:655): `# counter-sha256: <64-hex> <path>` verified against path bytes at the receipt's own revision.
  - Others (chousa, kagi, kaidoku, kake, kama, kasegi, kengaku, kotoba, mado) bind to revision, gate sha, or artifact digests; they do not state a matrix-input path+sha contract.
- **Mutation matrices:** tameshi owns the mutation and fixture method (PROVINCE.md:3-4). kengaku, kotoba and kama cede or cite it (kengaku PROVINCE.md:483-485; kotoba SKILL.md:14; kama SKILL.md:350 `probe-mutation-matrix`). No sibling claims calibration-gate matrix ownership that overlaps C2's selftest cases. Overlap is method-level only.

## Non-overlap (scanned, no claim on these terms)
- audio-shokunin: provenance of its own audio outputs (PROVINCE.md:25-26).
- game-dev-2d-shokunin: fixture provenance seeded from a named source (PROVINCE.md:6).
- game-dev-3d-shokunin: bounded-run receipts gate card labels, not input binding (SKILL.md:46-51). Nearest is `verified-here` label gating; no sha pin of matrix inputs.
- kotodama-shokunin: D3 evidence coupling checks exit/finding tuples (SKILL.md:814); `dedup-ledger.tsv` disposition ledger keyed by S-ids (SKILL.md:497). Neither is keyed by lane/path/line.
- lore-shokunin: source provenance for inspiration records (SKILL.md:44).
- souji-shokunin: removal receipts (PROVINCE.md:3-4; SKILL.md:33-40). Not matrix input binding.

## Notes for the L1 (not scored here)
- kagi `claim-ledger.sh verify` (SKILL.md:46) binds revision stamps and citations to a ledger; it is provenance-adjacent to C2 but binds revisions, not input sha256s.
- mori `freeze-order` (SKILL.md:179, 208) binds exact loaded-byte hashes and resolved commits. Nearest to C2's "input sha must equal pin" wording.

## Verification of the count
Command that counts the rows in overlap.md (the count line is derived from the file):
`awk -F' [|] ' 'NF>=4 && $1 !~ /^#/{print $1}' .ufo/waves/round-65/w1/R65Connector/overlap.md | sort -u | wc -l` → `14`.

## Deliverables
- `.ufo/waves/round-65/w1/R65Connector/overlap.md`
- `.ufo/waves/round-65/w1/R65Connector.md` (this file)

## Tooling
No tools installed or updated. Scratch under `/fast/scratch/hyaku/tabi-r65/R65Connector` (removed before yield).
