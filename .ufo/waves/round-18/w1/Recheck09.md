# Recheck09 — C1 freshness recheck of S018 and S019

VERDICT: PASS

Lane tip during work (read-only `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`): `2bff864fdfee684ddbcd066cc8e735adaba2735c` (= B). Receipts written by `.ufo/waves/round-18/recheck-fetch.mjs`, producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (recorded in both receipts).

## S018 — held

- Row: `corpus/SOURCES.md:32` (status `mined`), URL `https://mpapad.github.io/publications/pdfs/ICST25.pdf`
- Receipt: `corpus/evidence/round-18/source-recheck/S018.json`
- http 200; bytes 447958; sha256 `9304083f19871e117d5c4de0db4b1fe40767b66778641a188cdbd9dae4ebed3b`; decode `pdf-text`; quoteFound true (offset 45719)
- Quote (11 words, `--quote-source new`): `DOM interaction synchronization mechanism Ensure elements are fully loaded and visible` — §V.A Table V, printed p. 99
- Anchor observed: `ICST 2025, Naples, Italy`; `979-8-3315-0814-2/25 © 2025 IEEE`; Table V on printed p. 99 (extracted p. 1 bears printed 92). §III.C "Categorization and Analysis" present.
- Teaches check: Table V (printed p. 99) gives the repair classes and counts — DOM interaction synchronization 62 (50.4%), conditional event completion waits 47 (38.2%), consistent DOM state transitions 14 (11.4%); abstract bounds the sample at "123 flaky tests in 49 open-source web projects". The teaches cell ("DOM-event web UI flake classes and repair patterns within the study sample") is supported.
- Digest equality: fetched bytes are byte-identical to the original TabiFlakeExec2 seat fetch (`corpus/lessons/kaika-fleet-round-1.md:61` records the same `9304083f…`), so the source did not change.
- Quote choice: the original Gate quote `Ensure elements are fully loaded and visible before interaction.` is the Table V description cell, which `pdftotext -layout` splits across two column-interleaved lines (`before interaction.` lands after the Examples column), so it cannot normalize-match. A contiguous 11-word Table V span is used instead and marked `new` in the receipt. [INFERENCE] the cell text is the original quote; the extraction, not the paper, broke it.

## S019 — held

- Row: `corpus/SOURCES.md:33` (status `mined`), URL `https://research.knu.ac.kr/en/publications/non-flaky-and-nearly-optimal-time-based-treatment-of-asynchronous/`
- Receipt: `corpus/evidence/round-18/source-recheck/S019.json`
- http 200; bytes 49866; sha256 `119a6e3078a7927ea6276bd013abaa9904eb13b392be18c8009bb3bb525e55a9`; decode `html-text`; quoteFound true (offset 1022 of 10556 normalized chars)
- Quote (18 words, `--quote-source corpus/lessons/kaika-fleet-round-1.md:62`, original Gate quote): `developers adjusted wait time to address asynchronous wait flakiness in about 63% of cases (31 out of 49)`
- Anchor observed: `publication_date` `2025/02/12`, DOI `10.1145/3695989` (both in page meta/DOIs block)
- Teaches check: the abstract on the institutional record still states the 63% (31/49) wait-time adjustment "even when the underlying causes lie elsewhere", which is exactly the row's abstract-only "reported prevalence" claim.
- Byte-vs-original: the seat fetch digest `4fa85f45c7657f149f868a36b747c2319ebb10fb00484bb491b8b7a3546015ab` does not match today's bytes. The portal serves fixed-length but per-request-varying markup: a second `curl` body (49866 bytes, sha256 `e3e5ab7e640ce34acc0c9109425e33797becb77126ea21214a89239179bebea4`) also carries the full quote (re-probed with `--body`, quoteFound true, digest matches that body). So the stored sha256 pins the exact bytes the tool fetched at 2026-10-20T19:05:49Z; the quoted content is stable. [INFERENCE] a per-request token of equal width accounts for the digest delta.

## Drift drafts

None — both rows held; no superseding SOURCES rows drafted, no Gate entries added.

## Unknowns / residual

- S019 full text remains behind the ACM DOI (row already states abstract-only scope); not attempted.
- S018 §III.C page range (pp. 94–95) was not re-verified beyond heading presence; the row's anchor page claims for Table V (p. 99) were verified.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S018.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S018.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S019.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S019.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck09.md

Tooling: no installs or upgrades performed.
