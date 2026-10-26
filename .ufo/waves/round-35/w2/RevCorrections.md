# RevCorrections — round 35 w2 — appended-corrections verification (FALSIFY)

## Verdict

**Defect.** All three appended corrections are **true on the bytes they cite** (the S131 locator was re-derived from the tagged source; the noHarmRule scope and the relabel byte-claim were reproduced; the duplicate-URL refusal is confirmed by the report's own lines), the README round-34 block and round-35 rows check out against the ledgers and the host, and append-only holds with **0 deletions on every item-named path except one**. Three findings, none of them touching a correction's own claim of fact except the last clause of the census append:

- **D1 (medium)** — a previously-green gate is red at the w1 integration and the round's own sweep cannot see it: `scripts/check-freshness.mjs --worktree` (production) exits **0 verdict=clean (34/34)** at baseline `2d2c8a7` and **exit 1 `content_drift` "Measured bytes differ for corpus/knowledge/browser-surface-census.md"** at `083c5c6`, because its input `corpus/evidence/fleet-round-1-freshness/pins.tsv:7` still pins the census at `a33c2264…/265`. `measure.sh noharm` runs check-freshness only through the `--self-test` fixture loop, so closure's measurement stays green while the production gate is red.
- **D2 (low-medium)** — the census append's closing clause is false on the bytes: `corpus/knowledge/browser-surface-census.md:269` says "the §Pins rows in `SKILL.md` and `corpus/README.md` that carry this file's hash are refreshed by the integrator." At `083c5c6`: `SKILL.md:816` still reads `a33c22644d64…  browser-surface-census.md  265` and `SKILL.md:1361` still reads `| browser-surface-census.md | a4bbb39edb12 | a33c22644d64 | 265 |` (both unchanged baseline→integration), and `corpus/README.md` contains **no** §Pins row carrying the hash — its only `a33c22644d64` occurrences (`:337`, `:348`) are historical round-17 records. The refresh the sentence promises is also forbidden by this round's own frozen append-only rule (an in-place pin edit would put deletions on SKILL.md).
- **D3 (low)** — the census "append" is not byte-append-only: `git diff --numstat 2d2c8a7 083c5c6 -- corpus/knowledge/browser-surface-census.md` = `10  1`, the only non-zero deletion in the whole baseline→integration diff. Mechanism: the baseline file ended without a trailing newline; the append rewrote the last line byte-identically plus the EOF newline (`cmp`: first 479 bytes identical, then +`\n`), then added the round-35 block. No prior-round prose byte changed in content, but the frozen noHarmRule ("numstat … deleted 0 for those paths", corpus/knowledge/* included) fails mechanically at `083c5c6`, and this seat's assignment bar ("numstat must show 0 deletions") fails with it.

## 1. Each correction is true on the bytes it cites

### 1a. round-34.md corrections (three bullets, block at `corpus/lessons/round-34.md:167-187`, diff `+22 −0` at `@@ -165,0 +166,22 @@`)

1. **S131 locator 245-247 → 244-248 — TRUE, re-derived from source.** Stale line verified: `corpus/lessons/round-34.md:33` carries `CdpTargetManager.ts:245-247: "// New context. BrowsingContextImpl.create( targetInfo.targetId, parentId, userContext,"`. Re-fetch: `curl -q -sS --proto =https` on `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts?format=TEXT` at 2026-10-26T21:50:56Z → HTTP 200, 20,140 B raw, sha256 `f3483993a72e09531b8efe322ca317727f8241c06b708ddc8270c88102c33599` (equals the row's `f3483993…c33599`); decoded 15,104 B, sha256 `cd435aa8cbbd0a1e908e48c3190be7120aa76cf918cb81d814d55d1ad5cce9d9` (equals the row). Decoded lines: `:244 // New context.`, `:245 BrowsingContextImpl.create(`, `:246 targetInfo.targetId,`, `:247 parentId,`, `:248 userContext,` — exactly the correction's span statement. (Receipt: `RevCorrections/net/`.)
2. **noHarmRule scope — TRUE.** `.ufo/waves/round-34/claims.json:75` (noHarmRule) verifiably names only "the routed relabel of its kake 396/422/440 rows"; the routed relabel (round-34.md:151, errata intake item 5) names "`:411` note" as a fourth touched cell. Byte-claim reproduced: at `15dfaccb` and `71a87305` the `kake…PROVINCE.md:411` row (ledger file line 35) has byte-identical columns 1-4 (`kake-shokunin@04404859…:PROVINCE.md:411 | same-surface | crawler-discipline-vs-publishing | re-grounded against a fresh retained body fetched 2026-10-25`); the whole-line diff touches column 5 (note) only; reason unchanged (`RevCorrections/relabel.diff`).
3. **"source drafts refused as duplicate URLs" superseded — TRUE.** Fleet report `.ufo/reports/round-34/tabi.md:116` verifiably says "Rejects on record: … source drafts refused as duplicate URLs"; the same report's §Source rows and `corpus/lessons/round-34.md:44-46` state only the two W3C drafts were duplicate-refused (S124/S126) while "RFC 4122 (its S134) — not needed by any kill case (the ChromeDriver id is not a UUID string, which the entry does not rely on)". The cited receipt exists: `.ufo/waves/round-34/w1/ScoutSessionBinding/rows.md` S134 row (rfc4122.txt, 2026-10-26T19:48:03Z, HTTP 200, 59,319 B, sha256 `3825a334…66e0c31`) at the Rows and Gate tables (the correction's `:23,:34`).

### 1b. corpus/README.md round-34 corrections block (README:806-815, inside diff `+23 −0` at `@@ -804,0 +805,23 @@`)

- Stale lines verified at baseline: baseline README `:794` "…four new map rows; no earlier line is edited." and `:799` "| `adjacency-screen-skill.tsv` *(round 34, with `adjacency.tsv` rows 15–18)*…" — both exist as cited.
- "final map carries three new rows, adjacency.tsv 15–17": verified — baseline `corpus/adjacency.tsv` lines 15/16/17 = `lab-performance-tool-runs`, `recorded-har-producer-channel`, `screenshot-pair-compare-semantics` (line 14 `accessibility-browser-at-execution`, line 18 absent); unchanged at `083c5c6` where line 18 = `cdp-bridge-vault-dom-refusal` (the round-35 row).
- Withdrawn rows "screened in adjacency-screen-skill.tsv": verified — kake `SKILL.md:408` → ledger line 2, same-surface `js-rendering-browser-execution`; kotoba census49 `:171/:172/:173/:175` → ledger lines 9-12, third-lane-report; kasegi `mission-control.md:119` → ledger line 60, third-lane-report (its `:267`/`:272` screens sit at kasegi `SKILL.md:267` and `ufo-workspaces.md:272` in the same ledger).
- Cited evidence span `corpus/lessons/round-34.md:104-111` verified: the wave-2 C1 gate-decisions table (rows 15/16/17/18) sits exactly there.

### 1c. corpus/README.md round-35 rows (README:817-827)

- `knowledge/webdriver-bidi-firefox-runtime-round-35.md` exists (329 lines, 20 headings); "eleven engine differences in shape" verified: §5 "Engine differences" holds exactly `### D1`…`### D11`, and §5's intro itself says "differ on 11 of 17 rows in shape, never in predicate outcome".
- Receipt + two transcripts exist at `083c5c6`: `corpus/evidence/round-35/bidi-firefox/{receipt.json,run1.jsonl,run2.jsonl}`.
- Ledger row counts verified: `corpus/adjacency-screen-browser.tsv` at `083c5c6` = 383 lines = 1 header + **same-surface 225, not-browser-sense 119, third-lane-report 30, no-claim-declared 8** (382 screens) + **mapped 1** (`adjacency.tsv:18 cdp-bridge-vault-dom-refusal`) — exactly the README row's figures.
- SOURCES rows S134–S141 present at `083c5c6`.
- Census correction row (README table, "…the round-1 'Firefox absent' rows stay as capture-scoped history"): host facts re-measured this session, all true — `~/.local/bin/firefox` → `~/.local/opt/firefox-158.0.1/firefox`; `firefox --version` exit 0 → `Mozilla Firefox 158.0.1`; stub 5,520 B, `firefox-bin` 659,992 B, `libxul.so` 188,813,968 B; tree 340,636,387 B / 51 files; `application.ini` Version=158.0.1, BuildID=20261019185856, SourceStamp=48a735cc74a7e6d730f9bf59c3de58f750287a23; sha256 firefox `a1947294…700789`, firefox-bin `46e2c204…7294`; geckodriver 6,029,440 B, sha256 `f831b7e6…6e39f`, `--version` exit 0 → `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`; `~/.mozilla` = NMH dir only, sole file `com.1password.1password.json` 324 B mtime 2026-10-26 12:08 local; `~/.config/mozilla/firefox` and `~/.cache/mozilla/firefox` exist, mtime 2026-10-26 17:48 local, `crash_helper_server.log` 0 B; `pgrep -a -f 'firefox|geckodriver'` → none; `pacman -Q firefox` exit 1 `error: package 'firefox' was not found` (the census quotes exactly this line; pacman also printed an unrelated local-db warning `openai-chatgpt: missing required signature`, not part of the census quote).

## 2. Append-only (pasted)

`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --numstat 2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684 083c5c643be7aa5965a5de3458a32ed0d289ead3`, filtered to the assignment's paths (full 296-line output: `RevCorrections/numstat.txt`):

```
24	0	LOG.md
36	0	SCORECARD.md
11	0	SKILL.md
25	0	corpus/QUALITY.md
23	0	corpus/README.md
9	0	corpus/SOURCES.md
383	0	corpus/adjacency-screen-browser.tsv
1	0	corpus/adjacency.tsv
10	1	corpus/knowledge/browser-surface-census.md      ← D3: the only deletion in the entire diff
329	0	corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md
22	0	corpus/lessons/round-34.md
126	0	corpus/lessons/round-35.md
```

Deletion scan over the full numstat (`awk '$2!=0'`) returns exactly one row: the census. D3 mechanism (pasted patch, `@@ -266 +266,10 @@` U0): baseline line 266 (the round-5 "[2026-10-14, pin refresh] VERIFIED…" bullet, `\ No newline at end of file`) is re-added byte-identically with a trailing newline, then two blanks, the round-35 header, and five bullets follow. `cmp` of baseline last line vs integration line 266: "EOF on b-last.txt after byte 479" — identical 479 bytes, +`\n`. Post-append census: 275 lines, sha256 `e3ce1676f2976ca18629666ba88d90c5e8646d4736885ab61decc06ae6b75e21`; worktree clean and identical (`git status --porcelain` on the file: empty).

## 3. Old-hash pins (`a33c22644d64`) and whether any gate reads them

Tracked lines at `083c5c6` carrying the old hash (full list incl. 12-char-prefix occurrences: `RevCorrections/pins-at-083c5c6.txt`; the .ufo/evidence historical record set adds ~80 more files — round-16..35 wave receipts, gate-witness JSONs, pstack/user seat results, w5/w10 snapshots, round-13/14/18 freshness outputs — all append-only history, none read by a gate):

| line | kind | read by a gate? |
|---|---|---|
| `corpus/evidence/fleet-round-1-freshness/pins.tsv:7` | freshness table row: `MATCH corpus/knowledge/browser-surface-census.md a33c2264… 265 … baseline@c24eaea1…` | **YES — the only one.** `scripts/check-freshness.mjs:12,110` reads this table and fails `content_drift` when the worktree bytes differ |
| `SKILL.md:816` (`a33c2264…  browser-surface-census.md  265`) | prose §Pins row | no script pins `a33c2264` (`grep -rn a33c2264 scripts/` → none); prose-only staleness |
| `SKILL.md:1361` (`\| browser-surface-census.md \| a4bbb39edb12 \| a33c22644d64 \| 265 \|`) | §Pins table row | no gate reads SKILL.md pins |
| `SKILL.md:1221` | historical L0 row, pinned to rev `7961735` | stale by design |
| `corpus/README.md:337`, `:348` | historical round-17 recon text ("(`a33c22644d64…`, 265 lines)…", "(expect `a33c22644d64…`)") | no; historical records, must not be edited |
| `corpus/knowledge/browser-surface-census.md:269` | the append's own pre-append sha statement | no |

Gate runs (in a `--shared` scratch clone detached at each rev; command `node scripts/check-freshness.mjs --worktree`):

```
083c5c6: exit 1  "FRESHNESS_GATE verdict=failed finding=content_drift detail=Measured bytes differ for corpus/knowledge/browser-surface-census.md"
2d2c8a7: exit 0  "FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 … profile=production"
```

(`.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json` does not contain the hash — grep count 0.) The no-harm sweep in `.ufo/waves/round-35/measure.sh` runs check-freshness only via its `--self-test` branch (the `for g in scripts/check-*.mjs` fixture loop); the production mode that now fails is not on the sweep, so closure's measurement will not surface D1.

## 4. Commands and exit codes (all run this session)

- `git … diff --numstat 2d2c8a7… 083c5c6…` → exit 0 (full output saved).
- `awk '$2!=0'` over numstat → exit 0, exactly the census row.
- `git show <rev>:corpus/knowledge/browser-surface-census.md | sha256sum` → `a33c2264…` (baseline, 265 lines), `e3ce1676…75e21` (integration, 275 lines).
- `node scripts/check-freshness.mjs --worktree` in clone@`083c5c6` → exit 1; in clone@`2d2c8a7` → exit 0 (outputs saved).
- `curl -q -sS --proto =https <S131 URL>?format=TEXT` → exit 0, HTTP 200, 20,140 B (record above per QUALITY 93).
- `cmp b-last.txt r-266.txt` → "EOF … after byte 479" (identical prefix, newline added).
- `diff` of the :411 row at `15dfaccb` vs `71a87305` → exit 1, column-5-only change.
- `pacman -Q firefox` → exit 1 (read-only query). `pgrep -a -f 'firefox|geckodriver'` → none.
- No browsers or drivers launched; no tool installed or upgraded (none needed); no lane file edited; scratch clones created with `git clone --shared` and detached checkouts only.

## 5. Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-35/w2/RevCorrections.md` (this file)
- Receipts: `tabi-shokunin/.ufo/waves/round-35/w2/RevCorrections/` — `numstat.txt`, `pins-at-083c5c6.txt`, `freshness-at-083c5c6.out`, `freshness-at-2d2c8a7.out`, `three-hunks.txt`, `relabel.diff`, `b-last.txt`, `r-266.txt`, `net/{fetch-receipt.txt,raw.b64,dec.ts}`

Scratch `/fast/scratch/hyaku/tabi-r35/RevCorrections-2` deleted after receipt copy.
