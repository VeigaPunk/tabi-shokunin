VERDICT: PASS

Final draft: `.ufo/waves/round-18/drafts/source-recheck-round-18.md` (lane-relative). No `L1 FILL` block, no `<N>` marker, no TODO; grep for those returns nothing. All counts are derived from the 51 receipts in `corpus/evidence/round-18/source-recheck/`.

## Counts (derived from receipt JSON, observed 2026-10-20)

- Receipts: 51 `.json` + 51 `.excerpt.txt`; the six superseded rows (S004, S039, S047, S049, S050, S053) have none.
- `teachesVerdict`: held 51, drift 0, unreachable 0. `quoteFound` true 51, false 0.
- Row status (SOURCES): mined 40, queued 6, rejected 5. Tier: A 42, B 4, C 5.
- `decode`: none 13, html-text 32, base64 5, pdf-text 1 (S018). `httpStatus`: 200 for 50; null for S029 (git blob).
- `excerptSha256` matches the excerpt bytes: 51 of 51. `rowUrl` occurs in its row's source cell: 51 of 51. `producerSha256` identical across all 51: `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.
- Counter at B (read-only run, `node .ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c`): `eligible_rows` 51, `c1_rows_rechecked` 0 — receipts are not committed at B. At the integration revision that commits them, `c1_rows_rechecked` is the figure to cite.

## Findings for L1

1. **S057 live bytes differ from its registry record.** Registry (S053 record): 649153 B, sha256 `085c40b7d1bae1b3012c3bcf3dc74c1762f8c096136c0b6fa22e302069848a4c`. Receipt: 695881 B, sha256 prefix `361a9a0f2ec2`, full digest in `S057.json`. Quote held. Recorded as a limit in §6; no registry change made by this note.
2. **S030 and S046 have identical bodies** (37575 B, prefix `184c519af9ed`) though their anchors name different commits. The `main` URL of S030 cannot be tied to a commit by the receipt. Recorded in §4.
3. **S020 served revision `51ed7565` at fetch**, anchor cell still `f14762e6`. Quote held. Anchor cell left as opened; recorded in §4.
4. **`quoteSource` = `new`** for S018, S029, S035, S043; S042's quote differs from its round-17 lesson location (wrapped comment lines). Recorded in §3.
5. **Producer unchanged** per instruction; directory creation is the callers' job (the directory now exists).

## Environment witness (outside receipts)

`pdftotext -v` → `pdftotext version 26.08.0`, observed 2026-10-20 on this host. Receipts do not record the tool version (§6).

## Tooling

No installs or updates. No pacman. No tests run; the counter was run once at B, read-only.

## Lane VCS

No jj or git write. Read-only `git rev-parse` only.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/drafts/source-recheck-round-18.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/DraftNoteRecheck.md
