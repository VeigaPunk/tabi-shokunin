# Round 61 / w1 / R61Reviewer

Axes: adjacency (8) and coverage (9). Leaf attack/review only; no judgment/admission or integration.

## Findings

Detailed evidence, exact attacked quotes, path:line citations, A1–A5/B1–B4 coverage, and residual risks: `.ufo/waves/round-61/w1/R61Reviewer/attacks.md`.

- **MAJOR A5-HEADER:** frozen snapshot-r61.tsv has `lane<TAB><LF>` header; unchanged r60 wide-screen command rejects it with exit 2. Exact frozen C1(d)/K4 cannot pass these bytes.
- **MAJOR A5-CONTROL:** unchanged wide-screen counter accepts arbitrary snapshots and does not validate old rows unless --verify-rows is supplied. A header-only scratch shadow scans all 85,775 Markdown blobs green, rowMismatch=0. This is NOT a pass on the frozen snapshot; it independently refutes the claimed stale-row control premise.
- **MAJOR B4-SUPERSET:** published pointer runner emits two steps and no carried keyboard/control/CapsLock/form2 domains; additive r61 counter still requires those. Mixed mouse/pointer ptrlog and missing pointerEventOrder additionally disagree with its pointer checks. Runner/counter nonce grammars also differ.
- **MINOR A2-AID:** v20 --list-observed calls removed headSnapshots; reproduced ReferenceError, exit 1.
- **MINOR A2-ERROR:** evaluated red v20 runs disclose drift, but early map-load/argument/parser exits do not. Applicability depends on whether disclosure is intended for every error exit.
- **NOTE B1:** r60 first rejects r61 schema with schema-wrong, not unknown pointer fields; a pointer superset keeping r59 identity remains green.
- **NOTE B2:** f2 needs occurrence/order binding. Independent ordering checks can keep f2 red even under a literal first-entry-only loop mutant; document exact mutant boundaries.

A3 reproduced exit1/predicate false/findingCount18 and all five frozen counts, no mismatch. B3: carried r60 checks do NOT reject missing pointermove isTrusted; added r61 check does. A4: exact r59 ledger heads, not r61 rebinds or content-only reverts, determine K2 reachability.

## Pinned inputs

SHA256:

| Input | SHA256 |
|---|---|
| claims.json | d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e |
| frozen snapshot-r61.tsv | 8b175b27ca00e212b9e4cd776542c132d812f2e9e193bfb3083f14cc251efc27 |
| v19 meter | 0f956f869be4bfe573d2e3e863879b76ac42c1361c030eb0895662e0d703391c |
| unchanged r60 wide screen | ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920 |
| unchanged r60 receipt counter | b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae |
| reviewed v20 meter | b76d972e47cbb32fc3e9fd21385aaa627aed223e8c54d50a9f55b817920cebc7 |
| reviewed r61 rebind | 20acefdaa795273d60ced94dc100546c7d4cfc7f798069700f501c96057c2e5d |
| reviewed additive r61 receipt counter | c6b1e9bba71b8096781c67576ec74ea7b8a4a51ea22bea5a1cc953b6d4652bce |
| published r61 runner | ed712fb8148b9d41f95c239e25b7821c9d8cb46fb03f0de06a8b2129349388d8 |
| r60 known-green fixture receipt | 72514ff700cab2211b6507f8e423716ffe60e02affd5161f7d704486b483a083 |
| fixture r59 driver | b16ddb443d5bd1b101cfcdb55cbf2d5ffcb3f39d38064a661ab82bb9a152ff86 |
| exploratory pointer probe source | 1542c2b0be7fb0d531d4f2bf5c16fbe42531a8538322c8598e2f5e9fd7862925 |

All other pinned evidence bytes, including generated attack inputs, commands, verdicts, shadow snapshot, and retained source copies: `R61Reviewer/evidence-sha256.json`, `pins.json`, `builder-pins.json`, `published-runner-pin.json`, `probe-receipt-pin.json`. Earlier concurrent intermediate observations were not treated as final builder identities; definitive findings refer to retained source copies. Earlier observed v20 SHA 9471026a7b5ab8eade159561bc7d8f642710347ccb18b06b8d0257a5f5cd3160 and r61 receipt SHA 049a75a16b06fc3d9533797286b3dd8e356778af0b23d1587e32529716f3caf9 are recorded only as intermediate observations.

## Commands and observed exits

Every substantive attack has full absolute argv plus exit retained under `R61Reviewer/`:

| Command record | Observed exits/results |
|---|---|
| commands.json: r60 original / pointer superset / trust deleted / new schema | 0 / 0 / 0 / 1; last is schema-wrong only |
| commands.json: required v19 --rev 7032914... | 1, findingCount18 |
| commands.json: unchanged wide --scope wide --snapshot frozen input | 2, bad snapshot header |
| extra-commands.json: v20 --list-observed with map in owned scratch | 1, ReferenceError |
| extra-commands.json: v20 at frozen revision | 1, findingCount198, drift7; r61 data absent, not a data-pass claim |
| extra-commands.json: v20 --rev all-zero | 2, error without drift |
| synthetic-commands.json: synthetic two-click control / f1 / f2 / f3 / f4 | 0 / 1 / 1 / 1 / 1; pointer-type/order/id/trust respectively |
| wide-header-only.command.json | 0; all 85775 files screened, rowMismatch0 |

Ancillary commands: initial mkdir plus directory listing exit0; `od -An -tx1 -N24 <snapshot>` exit0; all sha256sum invocations exit0; `git -C <lane> diff --no-index -- <v19> <v20>` exit1 (differences); `git -C <lane> cat-file -p 7032914...:corpus/adjacency.tsv` exit0, output copied only to owned scratch. The scratch attack.py harness ran via python3 exit0, with individual subprocess failures preserved rather than masked as passes. Eval cells for evidence capture/shadow/synthetic fixtures succeeded; no shell/background jobs remain.

## Deviations and verification gaps

- LSP device unavailable (`read xd://lsp`: No such tool). Could not perform LSP status/references/definition/diagnostics; used explicit line reads and text-search fallback, not semantic-proof claims.
- Initial discovery used a shell directory listing rather than the preferred specialized read; no mutations resulted beyond owned scratch creation.
- No delegation or peer messages, no VCS mutations, no fleet/sibling writes, no tool installations/upgrades, no host services restarted. No Chromium was launched by this reviewer; the synthetic tests are not live pointer delivery evidence and have no new closure assertion.
- Did not execute v20 --selftest: its host fixture hard-codes R61Exec1 scratch and would violate this seat's write scope. No unrun selftest is reported passed.
- No actual data commit or instrument-freeze identity was reviewed. Final runtime receipt, same-data-revision K2, full carried suites, teardown, and exact post-freeze forgery results remain integration-owner checks. Later edits are not silently included in this pinned review.
- No orchestration/runtime/resume code was changed or admitted; resume_continuity_v1 and saturation admission are outside this assigned diff.

Self-evaluation (review quality, not claim judgment): accuracy4 (pinned/static conclusions distinguished from live execution); completeness4 (A/B complete, final data not yet available); clarity4 (separate fatal input and false-control premises); actionability4 (exact failure commands retained); concision4 (long evidence details isolated in attacks.md). Overall4.0. The disclosed integration-time gaps prevent an all-clear recommendation.

Owned scratch `/fast/scratch/hyaku/tabi-r61/R61Reviewer` is removed before terminal submission. Receipts and source evidence are retained in the report directory.

Report: .ufo/waves/round-61/w1/R61Reviewer.md
