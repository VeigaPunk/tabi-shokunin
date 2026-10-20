VERDICT: ISSUES

Scope: draft skeleton of `corpus/lessons/round-18.md` at `.ufo/waves/round-18/drafts/lesson-round-18.md`. Only that draft and this report were written. No lane git write, no `jj`, no counter or producer script run; no install.

## Verified by command (read-only)

- D1 six distinct siblings at 93bfead: `git show 93bfead:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l` → `6` (kagi 2, kaidoku 2, kake 2, kama 1, kumitate 1, revenger 2; 10 data rows). Same 6 at `refs/heads/master`.
- Blob `93bfead:corpus/adjacency.tsv` = `098aa6adc5678d52a32653f38329dc3eae0a52ef`; sha256 = `a099b7137270e917665c78b12875ab4a8081cd9cc0601d7ee97cd4b552375b0c`.
- Dispositions at 93bfead: contested-open 4, refused-route 3, ruled 1, split-declared 2.
- `git show 93bfead:scripts/check-adjacency.mjs | sha256sum` → `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (matches `.ufo/waves/round-17/w1/C3Checker.md:101`).
- `corpus/lessons/round-17.md:116` = "Map: 10 rows, 7 siblings." (lane working tree and `refs/heads/master`).
- Source rows: `git show 2bff864:corpus/SOURCES.md` has 57 `S###` rows; `refs/heads/master` has 57. 57 − 6 superseded = 51 (PLAN C1 target consistent).
- `git grep -n "individual publisher" refs/heads/master -- corpus/SOURCES.md` → lines 67 (S053) and 71 (S057).

## Findings

1. **[ISSUE] Round-17 report `:35` cannot be checked in this lane.** `.ufo/reports/round-17/tabi.md` is absent from the working tree and from `refs/heads/master` (`git log --all -- <path>` empty); commit `af41737b8faafab6d392c898dacc88f3be0ebcd1` (cited at `corpus/lessons/round-17-verifier-spotcheck.md:31`) is not an object in this clone. The draft therefore corrects `round-17.md:116` only and marks report `:35` as not re-read. Owner of the report must confirm.
2. **[ISSUE] Unresolved pointer in the carried adjacency note.** `corpus/lessons/round-17.md:117` cites "kagi `corpus/adjacency.tsv:83`". At 93bfead the file has 11 lines (1 header + 10 rows), so `:83` does not exist there. The draft keeps the overlap but flags the pointer `[unresolved pointer]`; it may refer to a sibling's file. Needs re-citation.
3. **[ISSUE] Row-ID allocation collision.** PLAN assigns S058 to D4 (C3, PLAN:42-43) and S059+ to C2 (PLAN:35). C1 drift handling (PLAN:19-20) requires a new superseding SOURCES row but reserves no ID. The integrator must allocate IDs before scribes write rows.
4. **[NOTE] PLAN wording for the D3 producer.** PLAN:41-42 says "producer sha256 = blob at 93bfead"; a git blob id is SHA-1 and is not a sha256. The operative counter text (PLAN:97-98) says `git show 93bfead:scripts/check-adjacency.mjs | sha256sum`; the draft uses that form.
5. **[NOTE] `corpus/lessons/round-17.md` is absent at 93bfead** (`git show` fails); it postdates the measured revision. Recorded in the draft.
6. **[NOTE] Round-18 counter scripts do not exist yet.** `measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs` are absent under `.ufo/waves/round-18/` at master (only round-17 copies exist). The Gate's `c1_rows_rechecked` / `c2_hazards_closed` / `c3_routed_closed` values are therefore targets, not measurements.

## Tooling

No tool installed or updated. Commands used: `git show`, `git rev-parse`, `git grep`, `cut`, `sort`, `uniq`, `wc`, `sha256sum`, `grep`.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/drafts/lesson-round-18.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/DraftLesson.md
