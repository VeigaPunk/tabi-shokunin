source: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/measure/snapshot-live-r66.tsv (20 sibling `lane<TAB>head` rows, read as the frozen heads) and the frozen meter /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs (sha256 4d3a6b589d1c3a795314cc93b2cd481071c70309a957cb54031a6971002d50d5, not edited); ledgers read at the lane base: corpus/adjacency.tsv, corpus/adjacency-host-audit-r62.tsv, corpus/adjacency-host-delta-r62.tsv; committed output .ufo/waves/round-66/measure/v22-live-r66.json
verified-at: 2816adb359a50c2fd83fa975e39f0650aa189984 (lane base; the ledgers and the meter source are read at this revision, the sibling bytes are read at the snapshot heads, not at this revision)
recheck: `cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev 2816adb359a50c2fd83fa975e39f0650aa189984 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --json` — expect exit 1 (evaluated, predicate not met) and `"findingCount": 40` while the r62 ledgers are unchanged; re-read this entry whenever the r62 ledgers, the snapshot, or any listed sibling head changes.

# C1 adjacency: the r62 sibling-overlap ledger at live sibling heads

## 1. What this entry records

The round-62 sibling-overlap ledger (`corpus/adjacency-host-audit-r62.tsv`, `corpus/adjacency-host-delta-r62.tsv`) was generated against older sibling heads. Measured against the round-66 snapshot of sibling heads, the frozen v22 meter does not admit the lane state. This entry records that before-state and leaves the after-state to the L1. It makes no claim about whether any sibling's content is correct.

## 2. Before (measured)

| Quantity | Measured value | Command (run from the lane root) |
|---|---|---|
| predicate | `false` | the `recheck` command above; key `"predicate"` in `.ufo/waves/round-66/measure/v22-live-r66.json` |
| findingCount | `40` | same command; key `"findingCount"` in the same file |
| exit status | `1` (evaluated, predicate not met) | same command, `echo $?` |
| roster / mapRows / auditRows / deltaLanes / bgScreenSiblings / unresolvableHead | `20 / 16 / 16 / 20 / 20 / 0` | same command; key `"counts"` |
| `lane-screen-head-mismatch` | 21 | `python3 -c "import json,collections;d=json.load(open('.ufo/waves/round-66/measure/v22-live-r66.json'));print(collections.Counter(f['id'] for f in d['findings']))"` |
| `lane-screen-sha-mismatch` | 9 | same counter command |
| `lane-screen-lines-mismatch` | 8 | same counter command |
| `delta-quote-not-whole-line` | 1 | same counter command |
| `audit-note-moved-line` | 1 | same counter command |

Reproduction. The same `recheck` command, re-run at this seat, exited `1` with `findingCount` 40, `predicate` False, and a `findings` array equal to the committed file's (`findings == committed findings: True`). That re-run disclosed one drift that the committed file does not carry: `kengaku-shokunin` snapshot head `00462b596f517cc70528f1773c20eac7dd530bfd`, live head `c3f81f72495476db1f4e36706d2855347077fa36` (the committed `"drift": []`). The meter's findings were not changed by the drift; the drift is disclosed only.

Independent cross-check (this seat, not the meter's verdict). A python pass read each delta lane row's bytes with `git -C /home/vgpnk/Projects/shokunin/<lane> cat-file -p <snapshot-head>:<path>` and re-derived the sha256, line count and background-word hit count, with `BG_WORDS` copied by regex from the meter source (line 34). Result: 25 lane rows; 4 carry the snapshot head (`audio-shokunin`, `game-dev-2d-shokunin`, `game-dev-3d-shokunin`, `lore-shokunin`, all PROVINCE.md); 21 carry an older head; 9 sha256 mismatches; 8 line-count mismatches; 0 background-hit-count mismatches. These agree with the meter's counts above.

Named instances (each is a located line in the committed output, quoted):

- `audit-note-moved-line`: `kumitate-shokunin@89cbd998ff956965634b14368231c6d117d6437e:SCORECARD.md:1723: note :1885 != derived :1898`. At the snapshot head `7218699cfbdec702ba42f35ceac0a8e52d1bd564`, `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -p 7218699cfbdec702ba42f35ceac0a8e52d1bd564:SCORECARD.md` has the cited text at line 1898: `internals route to **tabi**, the `config.toml` REA MCP spawn key to **kaidoku**,` (python index check: `[1898]`).
- `delta-quote-not-whole-line`: `kake-shokunin:SKILL.md:1358`. The r62 delta quote is 1937 characters; the snapshot-head line 1358 (`git -C /home/vgpnk/Projects/shokunin/kake-shokunin cat-file -p d838e744462c68f57232d8a61eba631c495940a1:SKILL.md`, 1-based line 1358) is 2254 characters; the two are neither equal nor prefix-related. The meter rule is `rowFor[6] !== linesArr[ln - 1]` (meter line 215).
- `lane-screen-head-mismatch` (21): all 21 lane rows whose `head` cell differs from the snapshot head (meter line 220, `head !== cur`). The 25 lane rows include three `kaidoku-shokunin` rows and two each for `kake`, `kama`, `kumitate`; the detail string is the lane name.

## 3. After (for the L1 to paste; not measured here)

after: predicate `[L1 to paste]`, findingCount `[L1 to paste]`, exit `[L1 to paste]`
command: the `recheck` command above, run on the frozen r66 state of the lane (`--snapshot` pointing at the frozen snapshot, `--rev` at the frozen revision).

This seat did not produce an after figure. No after number appears in this draft.

## 4. What the before-state does not show

- It does not show that any sibling's content is correct or incorrect. It shows only that the r62 ledger rows do not match the snapshot-head bytes and heads.
- The meter reads sibling bytes at the snapshot head, not at the head embedded in each audit reference. `makeSibRefGit` takes `heads.get(lane)` (meter line 317). For `kumitate-shokunin` the audit reference head `89cbd998` differs from the snapshot head `7218699c`; the meter's `audit-note-moved-line` check is therefore against `7218699c`.
- Four lanes already match their snapshot head. The predicate is false because of the other 16 lanes, not because of all 20.
- [INFERENCE] Regenerating the two r62 ledgers at the snapshot heads would clear the 21 head, 9 sha and 8 line findings, which are all lane-row checks. Whether the predicate then holds also depends on the audit note and the single delta quote; neither was measured after any regeneration.
- The snapshot is not stable across the run: the `kengaku-shokunin` head moved between the committed run and this seat's re-run. Any freeze must re-take the snapshot or record the drift the meter discloses.

## 5. Provenance of the numbers

Every number in section 2 is taken from `.ufo/waves/round-66/measure/v22-live-r66.json` or from a command listed beside it. The cross-check counts come from the python pass described in section 2; the script was not committed, and its inputs are the snapshot TSV and `git cat-file -p` at the listed heads.
