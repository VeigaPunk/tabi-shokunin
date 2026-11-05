# R68Exec3 — C3 docs-held `synthesizeScrollGesture` counter (round 68, w1)

Seat: R68Exec3 (leaf executor). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base `1746c53de7d56e8aeaf420a68b5b95e6af96adf8`.
Output dir: `.ufo/waves/round-68/w1/R68Exec3/` (`check-c3-synthscroll-r68.mjs`, `proposed/`, `receipts/`).

## Verdict

A committed-byte C3 counter with positive, no-work and forgery controls is built and green on its
own selftest and on the current entry bytes. Its binding is to the S173 source by exact URL, anchor,
located quotes, facts, staged digest and corroborating r64 copy. It makes no runtime claim: it
requires the `runtime unmeasured` qualifier and refuses `delivery measured`-type wording.

One registry issue blocks S173 from passing the sources gate, and that repair is the L1's decision.
The live registry already has an S173 row. See "Registry finding".

## Axes (named)

1. Source binding strength: exact URL + anchor + quote + digest, not file presence.
2. Discrimination: positive (green), no-work (presence-only / empty), forgery (wrong URL, anchor, quote, digest, claim id, runtime-drift).
3. Scope honesty: the runtime-unmeasured qualifier is required in the entry and delivery wording is refused.

## Artifacts

- `check-c3-synthscroll-r68.mjs` — counter. Modes: default (check entry vs contract vs staged bytes) and `--selftest --scratch <dir>`. Exit 0 clean, 1 failed, 2 no-work or bad args. Producer sha256 `2e271e22f463263d…` (truncated, full value in receipts).
- `proposed/c3-contract-r68.json` — pinned contract: URL, tag `155.0.8059.84`, tag commit `5869fe313571d75152b77813cf0a4ee26a4e6df0`, staged path, bytes 14431, sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`, anchor `lines 286–315`, quotes (line 286, line 303), facts (lines 287, 294, 296, 304, 306, 309, 311), required and forbidden qualifier phrases.
- `proposed/s173-row.md` — proposed registry row, with the E04 repair variant spelled out.
- `receipts/c3-selftest.json`, `receipts/c3-on-evidence.json`, `receipts/check-sources-*.txt`.

## Counter behaviour

Entry-side checks: `source-id` (S173 present), `source-url` (exact URL in entry), `staged-digest` (staged file and entry both carry the pinned sha256), `corroboration` (r64 staged copy has the same digest), `anchor-range` (`lines 286–315` in entry), `quote` (quotes present verbatim in both the entry and the staged line at the stated line number), `fact` (declaration text on the stated line and the token in the entry), `qualifier` (required phrases present, forbidden absent).

No-work rule: an entry that cites no S-id, no URL and no 64-hex digest makes no source-binding claim, so the counter returns exit 2 and does not certify it. The presence-only fixture ("Staged file … exists") lands here.

## Selftest receipt (9 cases, rc 0)

argv: `node check-c3-synthscroll-r68.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r68/R68Exec3 --receipt …/receipts/c3-selftest.json --base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8` — rc 0. Producer sha256 `2e271e22f463263d…`. Inputs (entry, source, contract, nine fixture files) are hashed in the receipt's `inputs`.

| case | expected exit | observed | findings |
|---|---|---|---|
| green | 0 | 0 clean | — |
| presence-only | 2 | 2 no-work | — |
| empty | 2 | 2 no-work | — |
| wrong-url (155.0.8059.84→.83) | 1 | 1 failed | source-url |
| wrong-anchor (286–315 → 276–305) | 1 | 1 failed | anchor-range |
| quote-forgery (issuing→emitting) | 1 | 1 failed | quote |
| stale-digest (5bbc6e23→5bbc6e24) | 1 | 1 failed | staged-digest |
| claim-drift (S173→S999) | 1 | 1 failed | source-id |
| runtime-drift (+ "Runtime delivery measured") | 1 | 1 failed | qualifier |

Each failure case also asserts that its mutation actually changed the text (`mutated: true`), so a no-op mutant cannot pass as a red control.

Fixed during build: (a) `wrong-anchor` and `quote-forgery` first used single `replace`, leaving sibling occurrences intact, so they passed clean; both now use global replacement. (b) The script's `lines 286-315` literal used an ASCII hyphen, while the entry uses an en dash (U+2013); the anchor-range mutant is now a regex that matches either. Both were caught by the selftest, not assumed.

## On-evidence receipt (rc 0)

`node check-c3-synthscroll-r68.mjs --entry corpus/knowledge/chromium-scroll-gesture-protocol-round-68.md --source .ufo/waves/round-68/sources/Input.pdl --receipt …/receipts/c3-on-evidence.json --base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8` → rc 0, verdict `clean`, all 8 checks true, 0 findings.

- entry sha256 `8be5b900891704a4c8fa4b170b2c4ed8f40b6bc228120e988d17f722d8167dcd`
- source sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d` (14,431 B)
- contract sha256 `0818791593e8012105e4935a19d15bde190f4f84472f1539aa5b71ceb3bb7718`

Note: the entry's bytes changed during the wave. My earlier read (before the last rebuild) was `1cc24bbb…`; the current on-disk digest is `8be5b900…`. The change was not made by this seat. The counter was re-run against the current bytes and is green on them. The L1 should re-run on final bytes before any freeze.

## Registry finding (for L1 decision, not applied)

Live `corpus/SOURCES.md` (uncommitted) now contains an S173 row at line 187. Its URL is the same as S168's, and it lacks the `supersedes S168` marker. `node scripts/check-sources.mjs` (live registry, rc 1) reports:

- E04 `duplicate_url` on S171 (repeats S157), S172 (repeats S167), S173 (repeats S168)
- E11 `used_by_missing` on S173 (cites `corpus/lessons/round-68.md`, not present yet)

`check-sources.mjs` also refused a scratch registry copy outside the lane root with `could_not_evaluate unsafe_registry_path`, so a scratch gate run of the proposed row was not possible. Shape was checked manually: 11 cells, as in live rows. The proposed row in `proposed/s173-row.md` is one repair variant (teaches cell begins `supersedes S168`). The alternatives are: narrow or supersede S168; or keep a single S168 row and drop S173. This is the L1's call.

Live-gate receipts: `receipts/check-sources-live-baseline.txt` (rc 1, the 4 findings above), `receipts/check-sources-proposed-attempt.txt` (rc 2, unsafe_registry_path).

## Negatives and limits (not claimed)

- No runtime driver, no capability, no execution of `Input.synthesizeScrollGesture`. Delivery, fling-versus-no-fling, source-type effects, overscroll, repeats and smooth rendering stay runtime-unmeasured.
- Digest match establishes byte identity with the staged copy and the r64 copy, not publisher authentication.
- The counter checks declaration text and the S173 binding only. It does not check that Chromium behaves as declared.
- The `phase` negative (no phase parameter at this tag) is in the knowledge entry as a finite scan. The counter does not check it.
- The entry's "fetched 2026-11-05" is recorded text. I did not re-fetch the URL in this seat. The staged bytes and digest were matched to the r64 copy, not to a fresh network fetch.

## Tooling

No installs or updates. Used only existing `node` (v24.21.0, fnm), `sha256sum`, `git status`/`rev-parse` (read-only), `wc`, `cp`, and `rm -rf` of my own scratch dir `/fast/scratch/hyaku/tabi-r68/R68Exec3` (deleted before yield). No pacman, no sysctl, no service changes. No git mutations. No files written outside `.ufo/waves/round-68/w1/R68Exec3/` and this report.

## Checks for main agent to run

- `node .ufo/waves/round-68/w1/R68Exec3/check-c3-synthscroll-r68.mjs --selftest --scratch <scratch> --base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8` (expect rc 0, 9/9)
- The on-evidence command above on final entry bytes (expect rc 0)
- `node scripts/check-sources.mjs` on the lane after the L1 decides the E04/E11 repair (current: rc 1, 4 findings)
