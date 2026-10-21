# ScoutSourceFidelity — round 20

Seat: `TabiR20.ScoutSourceFidelity` · Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` · Baseline: `c49929430d996b016dde2e3a3a5be380f3433fdb`
Scope: S096 source identity, same-source reuse against round-19 retained evidence, and authenticity wording. Source-only. No runtime, browser, build, or test was run. No upstream re-fetch was made in this pass.

## Axes

1. Byte identity (decoded body and served carrier)
2. Reuse and independence labelling (S078 ↔ S096 ↔ round-19 bindings)
3. Git rooting of retained bytes (QUALITY 28)
4. Anchor coverage (design spans vs. the S096 anchor cell)
5. Authenticity wording (QUALITY 39)
6. Record semantics and timestamps

## Verdict

- **Axis 1 holds.** One body across every copy: decoded SHA-256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68,278 B, 1,740 lines, ends with `\n`.
- **Axis 2 holds.** S096 is the round-19 S078 body under a new registry row. The round-20 file's record describes a fresh urllib fetch (`source-opening.json:5`). I verified only that its output matches the round-19 bytes; I did not verify the fetch itself.
- **Axis 3 fails for the round-20 pointer.** The round-20 retained body is untracked. Byte-identical tracked roots exist in round 19.
- **Axis 4 fails for LC11.** Design span 787–815 lies outside S096's declared anchors.
- **Axis 5 holds for primary paths.** Several peer and round-18/19 phrasings ("immutable", "re-verified against commit", "first-party") exceed what is verified (F6).
- **Authenticity is not established and is not claimed in primary paths.** The chain is HTTPS-served content, digests, and served tag and blob metadata. There is no signature and no pinned root. The lane's own rule says this binds recorded content, not publisher authenticity (`corpus/QUALITY.md:161–164`).

Blocking before any admission: **F1** (LC11 anchor) and **F2** (untracked round-20 pointer).

## Evidence

| # | Check | Result |
|---|---|---|
| E1 | sha256 of round-20 body `corpus/evidence/round-20/sources/html_form_element.cc` | `8c8d6796…c36916` |
| E2 | Round-19 `corpus/evidence/round-19/sources/html_form_element.cc.gz` decoded sha256; `cmp` vs E1 | `8c8d6796…c36916`; IDENTICAL; gzip ISIZE 68278 |
| E3 | Round-19 `.ufo/waves/round-19/w2/SourceS078.body.gz` decoded sha256; `cmp` vs corpus gz | `8c8d6796…`; IDENTICAL; tracked and in baseline |
| E4 | `git hash-object` of E1 | `cd7efa45834bfce0697b06c7092f16d084c4eb55`; equals the blob id from the tag's tree listing recorded in round 18 (`.ufo/waves/round-18/sources/DeclarativeValidation.md:9,12`; `.ufo/waves/round-18/w2/LiveS042.md:140`) |
| E5 | `base64 -w0` of E1 | 91,040 chars; sha256 `ff55d511…6519ed` = the round-18 served-carrier record (`DeclarativeValidation.md:9`; `.ufo/waves/round-19/w2/SourceS078.md:27`). Local re-encoding equality only |
| E6 | Retained tag metadata `.ufo/waves/round-19/w2/SourceS078.tag.body.gz`, decoded | 2,334 B; sha256 `02dbdcc4…b264` (matches `SourceS078.md:36`); `"commit": "b510e9d7…78d"` = S096 row commit (`corpus/SOURCES.md:110`). Served and unsigned |
| E7 | Literal sweep for `8c8d6796…` | `.ufo/waves/round-20/design.json:19,128`; `source-opening.json:7`; `corpus/SOURCES.md:92` (S078), `:110` (S096); `corpus/knowledge/webmcp-declarative-validation-round-19.md:2`; `corpus/lessons/round-19.md:34,131`; `corpus/evidence/round-19/validation/decisions.json` `bodySha256` at `:152,:283,:462,:514,:566`; `DeclarativeValidation.md:9`; `LiveS042.md:140`; `SourceS078.md:28,44,62`. Also `.ufo/waves/round-19/w1/FamDisabledHidden.md:53` (68,278 B; 1,740 lines) |
| E8 | Clone copies: `ScribeLifecycle`, `ExecCounter`, `ExecFixtures`, `ExecFrozen` | Round-20 body `8c8d…` and round-19 gz (`7d0dc111…`) identical in all four. Round-20 body untracked in each |
| E9 | Git tracking | Round-20 body `??` in lane (`status -uall`); zero tracked entries under `corpus/evidence/round-20` at baseline. Round-19 corpus gz tracked (blob `8e8134ee…`); w2 body tracked; `decisions.json` tracked (blob `252faf96…` = worktree; status clean) |
| E10 | Design spans vs S096 anchor cell `174-328,729-758,818-842` | 11 of 12 inside. LC11 `787-815` outside |
| E11 | Quote locations in E1 | S078 quote "With the `toolautosubmit` attribute, we immediately submit the form." at line 219 ✔. S096 "Return a null string" comment at line 827 ✔; `base::ok(String())` at 829 |
| E12 | Timestamps (local TZ −03) | Body mtime 09:49:12Z; `source-opening.json` mtime 09:52:32.343Z = its `openedAt` 09:52:32.343251Z; `design.json` 09:49:45Z; round-19 gz 07:12:28Z |
| E13 | Overclaim sweep: `SKILL.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md`, round-19 note and lesson, round-18/19 dossiers, round-20 `w1/` | No "authenticated / official / signed / publisher-verified" claim about S096 in primary paths. Unrelated "authenticated" uses (`QUALITY.md:66`; `corpus/README.md:269`) concern local proofs. Wording hits are F6 |

## Findings

**F1 — B. LC11 is outside S096's anchor cell.** `design.json` decision LC11 spans 787–815. `corpus/SOURCES.md:110` anchors S096 at `174-328,729-758,818-842`. Body lines 787–815 contain the `declarative_webmcp_call` branch and the "programming error" `CallDoneCallback` (808–813). Peers `ConnEvidence.md:107,121` and `ConnSibling.md:68–89` report the same gap; this is an independent confirmation. Fix: append a superseding row or erratum whose anchors cover 787–815 (for example `174-328,729-842`). Do not edit in place.

**F2 — B. The round-20 pointer is not committed.** `design.json:17,126` and `source-opening.json:6` point to `corpus/evidence/round-20/sources/html_form_element.cc`. It is untracked in the lane and in all four clones, and absent at baseline. `ScribeLifecycle.md:20` says the same. QUALITY 28 (`corpus/QUALITY.md:112–116`) requires an admitted pointer to be a tracked path, and says an untracked path is never the only root. Tracked, byte-identical roots exist: `corpus/evidence/round-19/sources/html_form_element.cc.gz` and `.ufo/waves/round-19/w2/SourceS078.body.gz`. Fix: commit the round-20 body in the integration commit, or cite a tracked root with decode-before-hash.

**F3 — R. S078 is not marked superseded.** `corpus/SOURCES.md:92`: status `mined`; `teaches` still reads "navigation submission returns an empty string". The round-19 note (`:129–131`) and S096 record the null String sentinel (`html_form_element.cc:827–829`). QUALITY 33 (`:140–142`) requires the old row to remain explicitly superseded, with the falsified premise removed from every cell. Fix: append a superseded-for-navigation marker. `ConnEvidence.md:123` proposes the same.

**F4 — R. S096 does not declare that it reuses S078's body.** `SOURCES.md:110` says only "supersedes S078". The round-19 note says "same retained body as S078" (`:129`). The lesson row cites `w2/SourceS078.body.gz` (`corpus/lessons/round-19.md:131`). The round-19 census flags the duplicate URL (`.ufo/waves/round-19/final/census-after.json`, stdout; exit 0). S098 and S099 carry explicit "not a distinct independent source" wording (`SOURCES.md:112–113`); S096 does not. `corpus/README.md:424–427` lists S096 as a supersession source without that statement. Fix: append the reuse clause to S096, matching S098/S099.

**F5 — R. S096 has no raw-fetch digest.** `SOURCES.md:5–6` says the gate carries a raw-fetch sha256 per row. The round-19 gate table (`lessons/round-19.md:31`, column "sha256 (decoded body)") and S096 carry the decoded digest only. The carrier digest `ff55d5…` is recorded in round 18 and re-derived in E5. Fix: append the carrier digest with its derivation, or reword the header to "decoded digest".

**F6 — W. Wording exceeds evidence (no primary-path overclaim).**
- `source-opening.json:9` "same immutable source bytes"; `SourceS078.md:29` "No immutable-source drift"; `LiveS042.md:119` "the URL is immutable by construction". A tag URL is a mutable git ref; immutability is convention. What is verified is digest identity across retrievals.
- `.ufo/waves/round-20/w1/ConnPlanner.md:124` "re-verified against pinned Chromium tag 154 commit b510e9d7". What was verified is that the decoded digest yields blob `cd7efa45…` (E4), which matches the round-18 tree-listing record. The commit id is a served value and unsigned. Reword.
- `SourceS078.md:50` "first-party Chromium implementation". This is host-based authority. `CORPUS.md` (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:93–97`) defines tier A as "primary or authoritative for that scope" and states "Tier is curation, not truth". Keep the tier as curation.
- `LiveS042.md:143` "byte-identical to the earlier raw.githubusercontent.com fetches". Those bytes are not retained (`LiveS042.md:132`: "not committed to the lane"). No round-18 copy of `html_form_element.cc` exists under `corpus/evidence/round-18`. Label as recorded, not retained (QUALITY 39).

**F7 — W. Digest labels.** `webmcp-declarative-validation-round-19.md:2` gives `8c8d6796…` beside a `.gz` path without "decoded". Line 1 for S077 says "decoded sha256". `decisions.json` pairs a `.gz` `body` with a decoded `bodySha256`. `sha256sum` on either gz returns a different value (corpus `7d0dc111…`; w2 `1dd17397…`). Fix: say "decoded sha256", and state decode-before-hash in any gate.

**F8 — I. Record time, not fetch time.** `source-opening.json:3` `openedAt` equals the record's own mtime. The body file was written 3 min 20 s earlier. The fetch instant is not recorded. Fix: add `fetchedAt`.

**F9 — P. No gate binds the pin yet.** `run-checks.py:62–65` runs `measure-c1.mjs --selftest` and `check-wave.mjs --selftest`. Neither file exists at this snapshot, and `run-checks.py` has no digest check. The pin is a record until a gate reads the retained bytes. `ScribeChecklist.md:5` is a manual `sha256sum`.

## Same-source reuse conclusion

Round-19 S078 body = round-19 S096 binding = round-20 S096 body = round-18 carrier, blob, and decoded records = four clone copies. The round-19 decisions bind S096 at lines 729–758 (`decisions.json:149–155`). `SourceS078.md:56` describes the earlier S078 / 729–751 binding at checkpoint `d5cf4d7`. That relabel changed no bytes. `SKILL.md` has 11 citations of the same body: six to S078 at 729–751 (lines 2053–2081) and five to S096 at 729–758 (lines 2160–2176, corrected rows).

## Not verified / limits

- No upstream re-fetch. The tag→commit `b510e9d7…` and carrier `ff55d5…` values are recorded, and re-derived only by hashing or re-encoding local bytes.
- No signature or pinned-root check. Gitiles TEXT is unsigned.
- The round-18 raw.githubusercontent bytes are not retained, so that match claim cannot be re-derived.
- The overclaim sweep covered the named paths and round-19/20 wave reports. It did not read all 570+ grep-hit files.
- Tier definitions were read only at `CORPUS.md:93–97`.
- No runtime, browser, build, test, or formatter was run.

## Tooling and writes

- Installs or updates: none. Tools used: `sha256sum`, `base64`, `cmp`, `zcat`, `stat`, `date`, and read-only `git` (`ls-files`, `ls-tree`, `hash-object` without `-w`, `status --porcelain`, `rev-parse`, `log`).
- One lane-root `git status` ran without `--no-optional-locks`. It may have refreshed the lane index stat cache. No tracked content changed. Disclosed.
- Writes: this report only.

Reproduce (from lane root):
```
sha256sum corpus/evidence/round-20/sources/html_form_element.cc
zcat corpus/evidence/round-19/sources/html_form_element.cc.gz | sha256sum
zcat .ufo/waves/round-19/w2/SourceS078.body.gz | cmp - corpus/evidence/round-20/sources/html_form_element.cc
git hash-object corpus/evidence/round-20/sources/html_form_element.cc
base64 -w0 corpus/evidence/round-20/sources/html_form_element.cc | sha256sum
zcat .ufo/waves/round-19/w2/SourceS078.tag.body.gz | sha256sum
git ls-files -s -- corpus/evidence/round-20/sources corpus/evidence/round-19/sources
```

## Integrator actions (append-only; no frozen bytes edited)

1. F2: commit the round-20 body, or repoint `design.json` `source.path` and `source-opening.json` `retainedPath` to the tracked round-19 gz with decode-before-hash.
2. F1, F4, F5: add a superseding S096 row or appended erratum with anchors covering 787–815, the reuse clause, and the carrier digest.
3. F3: append the S078 superseded marker.
4. F6–F8: wording errata and `fetchedAt`.
5. F9: gate reads the retained bytes after decode and checks `git ls-files --error-unmatch`.
