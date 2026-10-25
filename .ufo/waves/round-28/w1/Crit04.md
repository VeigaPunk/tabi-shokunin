# Crit04 — C1 adversarial review

## Axes
- **Depth:** counterexample shows revision-binding predicate absent.
- **Operability:** existing missing-receipt/missing-bytes refusal semantics are visible in the implementation; this fixture does not test those branches.
- **Calibration:** N/A to this C1-specific attack.

## Frozen claim
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json:11` freezes C1 as requiring receipt measurement-revision binding, gate verification at that revision, retained fetch-failure CNE, and at least 7 selftest cases including mismatch and correct-revision controls. The round-27 lesson independently reports the inherited revision/fetch binding omission (`corpus/lessons/round-27-verifier-spotcheck.md:16,47`).

## Counterexample (observed)
Command, run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```sh
node --input-type=module -e '<inline fixture script>'
```

The script created a `mkdtemp` repository, initialized it, checked every `git -C` subprocess status, and committed a single fixture. Fixture receipt declared `measurement_revision="deadbeef"`; the tested committed revision was `4c9c05424caa52456be75334ff62dfda1980b10b`. It invoked:

```sh
node scripts/check-s106-evidence.mjs --repo "$fixture_root" --rev 4c9c05424caa52456be75334ff62dfda1980b10b --json
```

**Observed:** exit 0 and JSON `valid: true`, with hash, anchor, uniqueness, and byte-count fields all true, despite the declared measurement revision differing from the tested revision. The exact inline script is preserved in the command transcript for this report; no lane files were changed by it. This is a direct false acceptance, not an inference.

## Evidence and limits
- `scripts/check-s106-evidence.mjs:87-104` parses receipt schema/URL/hash/bytes path/count/anchor but does not require a measurement revision.
- `:107-127` resolves requested revision and checks receipt/bytes at that revision, digest, anchor and count; validity is the conjunction of those content predicates, not a receipt revision identity predicate.
- `:160-213` baseline selftest defines five cases: clean valid, SHA mismatch, anchor offset, missing bytes CNE, missing receipt CNE. No measurement-revision mismatch or matching-revision case is present.
- `:215-279` builds temporary git fixture repositories and evaluates them at their commit. I did not run the gate selftest: no need to duplicate the source inspection for this attack; therefore current case count is source-inspected, not an executed result.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` observed baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; `git -C ... status --porcelain` observed only untracked round-28 wave artifacts. This review did not modify tracked files.
- No tool was installed or updated. No real-site request or credential/session material used.

## Smallest safe correction
Require a well-formed receipt measurement-revision identity and compare it to the canonical resolved commit id used for evaluation; mismatch must be invalid (exit 1), never accepted. Add paired selftests: a stale/mismatching receipt revision rejected and a receipt bound to the fixture commit accepted. Preserve missing receipt/bytes as CNE (exit 2). Run selftest and target committed receipt at the eventual target revision in the implementation lane; this review did not validate that target.

## Report trailer
Report: `.ufo/waves/round-28/w1/Crit04.md`
