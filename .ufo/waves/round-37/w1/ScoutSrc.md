# ScoutSrc — tabi r37 w1 report: S143 source opening (§2b.4)

Assignment: open the round's sourced-claim source S143 (git-replace manual) and its supporting
repository-layout page; record status/size/sha256/UTC timestamp; locate the target sentence and two
supporting quotes. Evidence file: `.ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md` (headers, hashes,
raw grepped lines with context — scribe drafts the §2b.4 row from it).

## Results

1. https://git-scm.com/docs/git-replace — HTTP 200, 38,351 B, sha256
   `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105`, accessed 2026-10-27T13:35:05Z
   (server Date 13:34:54 GMT, last-modified 2026-10-26 14:52:01 GMT). Manual "last updated in 2.55.0".
   - Target sentence VERBATIM PRESENT (rendered-text exact-match = 1): "The GIT_NO_REPLACE_OBJECTS
     environment variable can be set to achieve the same effect as the --no-replace-objects option."
     Raw HTML splits it across lines 1708–1709 with `<span class='synopsis'><code>` markup on the two
     tokens — a plain grep over raw HTML misses it; tag-stripped grep confirms it.
   - Second located quote (21 words, ≤25): "Replacement references will be used by default by all Git
     commands except those doing reachability traversal (prune, pack transfer and fsck)." (lines 1680–1682),
     plus the `--no-replace-objects cat-file foo / cat-file foo → bar` example (lines 1689–1705) showing
     replace refs overwriting object reads.
2. https://git-scm.com/docs/gitrepository-layout — HTTP 200, 64,401 B, sha256
   `2f736f8d40834d2fb4556322c44ae2ae332287df5b4eddcc0a8e5fdd78da82b5`, same access timestamp.
   - refs/replace directory description located (line 2127 + `<dd>`): "records the SHA-1 of the object
     that replaces <obj-sha1>." Full block adds: graft-like, maintained by git-replace, and
     "Such refs can be exchanged between repositories while grafts are not." — corroborates the
     c2r37-J1 replace-graft threat model (forged decoration rides through clone transport).

## Coverage / freshness

Both pages live-served 200 from git-scm.com (Cloudflare/GH Pages, HIT), content last-modified
2026-10-26 — fresher than the round-36 closure (2026-10-27 09:49 -03:00). Both target quotes sit in the
git-replace DESCRIPTION (mechanism + kill switch) and the layout page (where replace refs live), so the
S143 row grounds C2's B1 mechanism (replace-ref refusal + GIT_NO_REPLACE_OBJECTS) from primary
documentation. No tools installed (none needed; no pacman; guard honored). Writes confined to seat dir
+ scratch root; scratch deleted at exit.

VERDICT ok S143 opened: both quotes verbatim-present with status/size/sha256/UTC timestamps; evidence at .ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md
