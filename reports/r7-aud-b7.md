# AUD-B7 — round-7 audit: the harness archive (manifest-pin equality, 3 groups) + the layer-routing table (2 rows re-derived)

Lane AUD-B7, 2026-10-14. Write scope: **this file only** — nothing else in
tabi-shokunin was written by this lane; every audited artifact was read-only
(`git status` at close shows this lane's only tree entry is this report;
`corpus/knowledge/layer-routing-synthesis.md` stays lane B7-1's untracked file).
Scratch: `/tmp/w7-aud-b7-scratch/` (scripts + check logs; volatile). Task:
audit the harness archive — manifest-pin equality on 3 groups — and the
layer-routing table — 2 rows re-derived from the source notes. Verdict table;
do NOT edit. Method: read + re-hash + re-derive from the archived bytes; no new
measurement of the world, no browser, no network act.

**Audited revisions (the tree was moving during the audit — recorded, not
smoothed).** Audit window 18:20–18:29Z (15:20–15:29 -03), HEAD `c0467a6`
("probation round 6 (training r5): see LOG"). Two motions observed mid-audit:
(i) the archive gained its three round-6 groups at **18:24:53Z** (lane B7-2's
manifests: `w6-aud-b6-scratch`, `w6-tabi-b61`, `w6-ver-b6` — the round-5 tree
held 25 groups at 18:20Z, 28 at 18:25Z); (ii) `corpus/knowledge/layer-routing-synthesis.md`
(lane B7-1) landed at 18:24Z and its mtime moved to **18:26:07Z** during the
audit — the revision this audit read and binds is
`77c60a5a9d635ae920cc8bce087e2ead92c0381e4cdc0d3ee89e04dd6beefd53`
(211 `wc -l` / 25,945 B); **close-time re-read (18:29Z): the note moved to
`dcfd2a4a998a7323fbe29097aa67dae6d71a662222a054c8b5f2edbb2a5fbc98`
(232 `wc -l`), with an E1 errata block; a third revision was present at final
close (`7725ee4217168710a556b352fec69bbc0fd78d82abfa91e945bd8c8cdc00b8bf`,
254 `wc -l`). The two audited rows (RT2/RT3) are byte-identical across all
three revisions (verified by string comparison; only their line numbers moved
70/71 → 72/73) — so the row verdicts below bind every revision observed. Later
ones are **not** covered (U3). `SKILL.md`
was ` M` throughout and moved under an in-flight sibling lane (finding 5.1).
The layer-routing table audited is §2's **RT2** and **RT3** rows of that note;
its §6 source pins were re-derived independently (all match except SKILL.md,
5.1).

## 1. Verdict table

| # | check | scope / method | result | verdict |
|---|---|---|---|---|
| A1 | archive census re-derived | 28 group dirs, 28 `MANIFEST.txt`; the round-5 25 groups re-counted file-by-file from their manifests | **1,010 files / 6,780,293 B** — digit-for-digit equal to `archive-receipt-r5.md` §1-2 (its 25-group totals) | **PASS** |
| A2 | manifest self-check, the 3 audited groups | `cd corpus/evidence/<g> && sha256sum -c MANIFEST.txt` for `tabi-r4-1-network`, `w4-t41-network`, `tabi-r4-2-async` | **423/423 OK, 0 FAILED, exit 0** each (122 + 200 + 101) | **PASS** |
| A3 | in-group pin files vs archived bytes | `methodology-sha.txt` (12+13+11), `r3-fixture-pins.txt` (6), `fixture-sha-pre.txt` (6) parsed and re-hashed | **48/48 pin lines MATCH, 0 mismatches** | **PASS** |
| A4 | note-pin equality (owning notes vs archived bytes) | rung §2 fixture 7 (hash-12 **+ byte counts**) + harness 6 (hash-12); rung §3 captures 12 (6 PNG hash-16+bytes, 6 shape hash-16); async §4 4 pins (2 PNG full-64 × 2 dirs, 2 shape full-64); multi-step-journey §2/§3 12 pins × 2 runs | **55/55 explicit comparisons MATCH** | **PASS** |
| A5 | the three new round-6 groups (in flight) | read-only manifest self-check + note-pin spot scan (v2 §3 pins; `r6-aud-b6.md` §7 pins) | **365/365 OK** (39+139+187); v2 pins **12/12** present in `w6-tabi-b61`; r6-aud-b6 pins **8/9** present in `w6-aud-b6-scratch` (the 9th, `4aa604f1788b`, is the *knowledge note's* closing stamp — not a scratch file) | **PASS as read** (in-flight; U4) |
| A6 | file↔manifest completeness | every on-disk file vs the union of manifest lines, all 28 groups | the only files absent from any manifest are the 28 groups' own `MANIFEST.txt` (28/28) — the r5 convention holds for the new groups too | **PASS** |
| R1 | routing row **RT2** ("the server served N requests") | re-derived from archived `w4-t41-network/run1` (`journey.json` + `http.log`) | client `/style.css` hops = **3**, server lines = **1**; cache-served entries: cache event present, no `reqExtra`/wire event, `finEnc=0`, body readable; perf `transferSize=0` — matches the row's three-surface reading | **PASS** |
| R2 | routing row **RT3** ("the wire status") | re-derived from archived `w4-t41-network/run6-reval` | wire `304` for index/style×3/async/slow/quick/confirm (3 headers / 129 B / `finEnc=129`); client `200` for index/async/confirm/slow/quick, client **`304` for style (2 of 3 loads)**; cache flags false; server histogram `10×304, 8×200, 2×302, 3×404` = the source's numbers | **PASS** |
| R3 | cited anchors exist at the cited lines | `sed -n` on rung :293-302 (D6), :304-318 (D7), :388-391 (§9.1), :407-408 (§9.6) | all four regions carry the text the rows attribute to them | **PASS** |
| R4 | row text ↔ source text (no widening) | RT2/RT3 wording compared clause-by-clause with rung §6 D6/D7 | every clause traces to the source line; the two routes ("server log for counts"; "`ExtraInfo.statusCode` + server log") are the source's own winners | **PASS** |
| R5 | cross-check, **not** a third row: RT1's D4 half | archived `run1`: client `loadingFailed net::ERR_ABORTED` on `/slow.json?abort=1`; server `200` line + `== ABORTED body write (client closed)` marker; DOM/shape `ERR_ABORTED` occurrences **0** | RT1's D4 clause reproduces; the row as a whole was **not** re-derived (U5) | **PASS (partial)** |
| — | audit did not edit | lane `git status`; audited artifacts re-hashed after reading | no file of this repo written except this report; the synthesis note's sha unchanged over the audit | **PASS** |

Aggregate: **the 3-group archive sample is sound — manifest pins, in-group
pins, and the owning notes' pins all agree, and the round-5 receipt's totals
re-derive exactly; the two routing rows re-derive from the archived bytes with
no widening.** The residual risk is scope and churn, not result: 22 round-5
groups were not re-hashed by this lane (U1), the three new groups are mid-wave
(U4), and both the archive and the synthesis note moved during the audit (U3).

## 2. Archive — what was re-derived (method → result)

- **A2 (manifest self-check).** `sha256sum -c MANIFEST.txt` inside each of the
  three groups: `tabi-r4-1-network` 122/122, `w4-t41-network` 200/200,
  `tabi-r4-2-async` 101/101 — 0 `FAILED` lines, exit 0 each
  (`/tmp/w7-aud-b7-<group>.check`, 423 lines total). Group choice: the
  network/async cluster — `tabi-r4-1-network` (T4-1 first dispatch),
  `w4-t41-network` (T4-1 re-dispatch: the §2/§3/§11 recorded runs),
  `tabi-r4-2-async` (async first dispatch) — chosen because it is the evidence
  base of both audited routing rows and it differs from AUD-B5/B6's trio
  (`tabi-r2-2-state`, `tabi-r3-1-journey`, `w4-t41-network`), so the audit adds
  new coverage rather than re-walking the same files.
- **A3 (in-group pins).** Every `<sha>  <path>` line of the in-group pin files
  re-hashed against the archived copy: `tabi-r4-1-network` 24 lines
  (`methodology-sha.txt` 12, `r3-fixture-pins.txt` 6, `fixture-sha-pre.txt` 6),
  `w4-t41-network` 13, `tabi-r4-2-async` 11 — all equal, no mismatch.
- **A4 (note pins).** Explicit comparisons where the note text names the file:
  - `network-evidence-rung.md` §2 — 7 fixture pins with **byte counts**
    (`site/index.html` `9736f2ef9f05`/360 B … `server.py` `a5ceef29fae5`/1,800 B)
    and 6 harness pins (`net-journey.mjs` `46c81f99decf` … `pngdiff.py`
    `24565a826526`): 13/13 equal to `w4-t41-network`'s archived bytes;
  - §3 capture table (run1 of `w4-t41-network`): 6 × hash-16 **+ byte size**
    (PNG) and 6 × hash-16 (shape) — 12/12 equal;
  - `async-step-evidence.md` §4 item 1: pending/settled PNG full-64 pins
    `6840ae9e34a6bcfd…` / `119764f8f406bc74…` equal in **both** `probe1/` and
    `run1/`, and the two shape pins `414b0d9d5f3a802f…` / `14afa29ed7f3813e…`
    equal — 6/6;
  - `multi-step-journey.md` §2/§3: the 6-capture pin set (e.g.
    `step-1-index` `e9d8c83c88015877`/14,810 B) equal in **run1 and run2** of
    `tabi-r4-1-network` — 24/24.
  - Coverage note (so the numbers are not over-read): of the 423 manifest
    entries, **42** (`tabi-r4-1-network`), **109** (`w4-t41-network`) and **53**
    (`tabi-r4-2-async`) carry a ≥12-hex token that appears in some
    note/report/SKILL; the remainder are manifest-only artifacts (shapes,
    DOMSnapshots, logs, profiles-adjacent files) that no note pins by hash —
    their equality evidence is the manifest self-check alone.
- **A1 (receipt totals).** The 25 round-5 groups re-derive to exactly
  **1,010 files / 6,780,293 bytes**, matching `archive-receipt-r5.md` §1-2
  digit-for-digit — the round-5 receipt's own totals survive the round-6
  extension untouched.
- **A5 (new groups, in flight).** Lane B7-2 wrote the three round-6 manifests
  at 18:24:53Z; read-only self-check at 18:26Z: `w6-aud-b6-scratch` 39/39,
  `w6-tabi-b61` 139/139, `w6-ver-b6` 187/187 OK, 0 FAILED — but this lane did
  **not** verify copy fidelity against the `/tmp` sources (the receipt's check B)
  or the exclusion counts; those remain the archive seat's proof (U4).

## 3. The layer-routing table — 2 rows re-derived

Row **RT2** (route: *server log for counts; client events for
"obtained the resource"; compare counts, not set membership*), re-derived from
`corpus/evidence/w4-t41-network/run1`:

- `journey.json` — three separate requestIds carry `/style.css`
  (`1474095.2`, `1474095.6`, `1474095.14`); the latter two hold a `cache` event,
  no `reqExtra`/wire event, `finEnc=0`, and the response body is still readable
  (383 B) — **client hops = 3**.
- `http.log` — exactly **1** `"GET /style.css HTTP/1.1" 200` line.
- page-side agreement: `perf /style.css transfer=0 encBody=383 status=200`.
- The row's warning is the measured one: a set-membership comparison sees
  `/style.css` on both surfaces and hides the 3-vs-1 count delta.

Row **RT3** (route: *`responseReceivedExtraInfo.statusCode` + server log; the
client status is the effective post-cache result; cache flags are not a
wire-contact signal*), re-derived from `corpus/evidence/w4-t41-network/run6-reval`:

- 10 client request records; per-request `wire` event (ExtraInfo) vs `resp`
  event (client model): wire `304` for index, style×3, go→async, slow.json,
  quick.json, confirm — each with `headerCount` 3 / `headersTextBytes` 129 /
  `finEnc=129`; client `200` for index, style#1, async, slow.json, quick.json,
  confirm; client **`304` for style#2 and #3** (2 of 3 loads) — the residual
  asymmetry the source names.
- `fromDiskCache`/`fromMemoryCache` = false on every response, including the
  304s — the row's "cache flags are not a wire-contact signal under
  revalidation".
- `http.log` histogram: `304:10, 200:8, 302:2, 404:3` = the source's
  "10×304 vs 8×200 + 3×404 + 2×302 across prepass+journey" (the recorded log
  holds both the prepass and the journey lines).
- `prepass/journey.json` is archived (its `http.log` is not present in the
  group; the journey log itself carries the prepass lines, which is what the
  source cites).

Cross-check (**R5**, not a third row): `run1`'s `/slow.json?abort=1` — client
`loadingFailed net::ERR_ABORTED` (canceled) with no wire event; server logged
`200` then `== ABORTED body write (client closed): /slow.json?abort=1`; DOM and
shape files contain **0** `ERR_ABORTED` strings — the only `abort` text in them
is the fixture's own inline script (`ctl.abort()`, `slow.json?abort=1`), i.e.
authored bytes, not a trace of the attempt. That reproduces RT1's D4 clause;
RT1's fresh-cache half and its route were not re-derived (U5).

## 4. Spot-checks (three, exact)

1. **Independent hash vs manifest vs note pin** — `sha256sum` on three files
   chosen from the three groups:
   `w4-t41-network/site/index.html` → `9736f2ef9f05ef35bb66fdaee648fcdcdfd8788f8686c05fb87d7aa6fff897a5`
   (manifest line equal; rung §2 pin `9736f2ef9f05` + 360 B equal);
   `tabi-r4-1-network/run1/step-1-index.png` → `e9d8c83c880158775f8aef00b0785adc9fe603f001f0230ce08b44c8a387bc12`
   (manifest equal; multi-step-journey pin equal, 14,810 B);
   `tabi-r4-2-async/probe1/step-5-async-pending.png` → `6840ae9e34a6bcfd8f42f8ad8c2785959638867b04bfe31a403699237e2d4959`
   (manifest equal; async §4 pin equal).
2. **RT2's count, re-run cold** — `grep -c '"GET /style.css HTTP/1.1" 200' run1/http.log` → **1**;
   client request events ending `/style.css` → **3**; `grep -c 'ABORTED body write'` → **1**
   (path `/slow.json?abort=1`).
3. **RT3's status census, re-run cold** —
   `awk -F'" ' '/"GET /{split($2,a," ");print a[1]}' run6-reval/http.log | sort | uniq -c`
   → `8 200 / 2 302 / 10 304 / 3 404`; wire↔client split from `journey.json`:
   7 requests `wire 304 / client 200`, 2 requests `wire 304 / client 304`
   (both `/style.css`), 1 request `404/404` (aborted body), 1 request no wire
   (client abort).

## 5. Observations for the owner (reported, not applied — this lane does not edit)

1. **The synthesis note's own SKILL.md pin was already stale — and its E1
   errata, read at close, records the same movement independently.** §6 pins
   `SKILL.md` `a8ba10b86138` / 795 L (working tree at 18:23Z, flagged `M`); at
   18:29Z the working tree read **`c0d2629ecbfb` / 829 L**. The note's own E1
   block (landed after this lane's read, stamped 18:28Z by lane B7-1) records
   the identical pair of values and converts the note's SKILL citations to
   section names — two independent observations of the same drift. A record
   citing the synthesis note must still re-derive SKILL.md itself (its other 10
   §6 pins re-derived equal here, including `r5-aud-b5.md`'s first pin
   `d09f1712cbcf` / 170, and E1 re-affirms them at 18:27:38Z).
2. **The archive outgrew the round-6 record's predicate mid-audit.** The r6
   record's a1 read "25 / 25"; the tree now holds **28 groups / 28 manifests**
   (the three round-6 groups landed at 18:24:53Z). The round-7 record must print
   the count it re-derives, with its read time — 28/28 is the current value, and
   the round-5 receipt's 25-group totals still re-derive exactly underneath it.
3. **A stale `/tmp`↔archive ambiguity is closed by B7-2 but not proved here.**
   The v2 note's r1/r2 runner revisions now both exist in the archive
   (`w6-tabi-b61` carries `ccc3d837…`; `w6-ver-b6/frozen*` carries the frozen
   copies) — AUD-B6's U5-era "r1 survives only in /tmp" is answered *in
   location*, but copy fidelity to the `/tmp` sources is the archive seat's
   check B, not re-run by this lane (**U4**).
4. **`r6-aud-b6.md` §7's closing-stamp pin `4aa604f1788b` is absent from the
   `w6-aud-b6-scratch` manifest** — expected (it is `corpus/knowledge/
   external-class-fixture-v2.md`, a knowledge-side file, not scratch). Noted so
   a future reader does not score it as an archive miss.
5. **Pin-equality precision differs by source.** Where a note prints 12/16 hex
   (rung §2/§3, multi-step-journey), equality was checked at the printed
   precision; the async §4 and multi-step PNG pins that print full 64 hex were
   compared at 64. No comparison used a value the note did not print.
6. **Working-tree shape at close (18:29Z):** ` M SKILL.md`; untracked:
   the 3 evidence groups, `corpus/knowledge/layer-routing-synthesis.md`,
   `corpus/knowledge/packet-readiness-r7.md`, `plans/round-8.plan.md` — a
   next-round artifact landed while this audit ran. Nothing here is this lane's.

## 6. Unknowns (do not convert to claims without a new probe)

- **U1.** 3 of the 25 round-5 groups were re-hashed by this lane (423 files);
  the other 22 were not (the round-5 receipt's 1,010/1,010 self-check is the
  standing evidence for them). "The archive is sound" is asserted for the 3
  audited groups only.
- **U2.** Note-pin matching is prefix-based where the note prints a prefix; a
  prefix collision across two archived files was not searched for (it would
  require two files sharing 12 hex — not observed, not excluded by construction).
- **U3.** Both audited artifacts moved or were created during the audit window;
  my verdicts bind `layer-routing-synthesis.md` `77c60a5a9d63…` (211 L) as read,
  and for the two audited rows only the later re-reads `dcfd2a4a998a…` (232 L)
  and `7725ee421716…` (254 L) — RT2/RT3 verified byte-identical across all
  three — plus the archive as read at 18:20–18:26Z. Anything later must be
  re-derived.
- **U4.** The three new round-6 groups were manifest-self-checked only; source
  copy fidelity, exclusion counts (profile dirs, shape-only by rule), and the
  completeness of the round-6 evidence selection are **not** audited here.
- **U5.** 2 of 18 routing rows were re-derived in full (RT2, RT3) + one half-row
  (RT1/D4); RT4–RT18 were not re-derived by this lane.
- **U6.** The two rows were re-derived on the *recorded* evidence this host
  produced on 2026-10-14; no re-execution was run (no browser, no server), so
  "re-derived" means "the archived bytes support the row", not "the
  measurement reproduces today".

## 7. Audited-state snapshot (sha256; audit-time, re-derive before citing)

```
77c60a5a9d635ae920cc8bce087e2ead92c0381e4cdc0d3ee89e04dd6beefd53  corpus/knowledge/layer-routing-synthesis.md  (211 L, 25,945 B, mtime 18:26:07Z, lane B7-1, untracked)
dcfd2a4a998a7323fbe29097aa67dae6d71a662222a054c8b5f2edbb2a5fbc98  corpus/knowledge/layer-routing-synthesis.md  (232 L, close-time re-read 18:29Z; E1 errata added; RT2/RT3 rows byte-identical)
7725ee4217168710a556b352fec69bbc0fd78d82abfa91e945bd8c8cdc00b8bf  corpus/knowledge/layer-routing-synthesis.md  (254 L, final close re-read; RT2/RT3 rows still byte-identical)
d1564f38dc14a261ce31970bdc706c5a63a9abbf9fea811f367525ccf3c60cc7  corpus/knowledge/network-evidence-rung.md  (609 L; == synthesis §6 pin)
05dcda5e60b9ae4a58d05bd2a9c447be3bd22bedb9e1706b400859f8a070a0f4  corpus/knowledge/async-step-evidence.md  (282 L; == pin)
e0367890f1cfc91081481c2613a481d02aa83a6c320d0fe2fbaf5764c4878923  corpus/knowledge/multi-step-journey.md  (349 L; == pin)
b41c2f6fb5a43483e4e84cdc916f736ceff214e98584bb3aafd923291b4d9f5f  corpus/knowledge/archive-receipt-r5.md  (== AUD-B5 §7 pin)
4aa604f1788b0531f0cb779b81137679829c994d1853658c7a092a729b5b6b2f  corpus/knowledge/external-class-fixture-v2.md  (== AUD-B6 closing stamp)
c0d2629ecbfb…  SKILL.md  (829 L at 18:29Z — synthesis §6 pins a8ba10b86138…/795; finding 5.1)
7dedc7c4cd30cca09a4cfdf3383b7373b8c0829c1fa3ea20f35c646b50f1b987  corpus/evidence/tabi-r4-1-network/MANIFEST.txt
6afffe6c748fdeae20aa9cd5170fb4255bc677c070198fc5f86b9ad6f49102e1  corpus/evidence/w4-t41-network/MANIFEST.txt
2c2e8e39e5032bcfb4d019ab070307c2ca1b001eaef88581e1efcd84fec03e3a  corpus/evidence/tabi-r4-2-async/MANIFEST.txt
581159b8da16f4ade0c70013bc264a1ee80355a5e532247c9748bdf4b1c9fe0c  corpus/evidence/w6-aud-b6-scratch/MANIFEST.txt  (new, 18:24:53Z)
d483404ea41bb0f6b4335a4b72106b489c451a93620cc4a0d07e735c62b69606  corpus/evidence/w6-tabi-b61/MANIFEST.txt  (new, 18:24:53Z)
b7199c2b606a50544ad486a9062acdae98038ff688c093dd0ce7a4864a1a860f  corpus/evidence/w6-ver-b6/MANIFEST.txt  (new, 18:24:53Z)
```

Evidence tree: `/tmp/w7-aud-b7-scratch/` — `audit-checks.py` (`48cd68fb645d…`),
`re-derive.py` (`9f75a907cfbf…`), `re-derive.log` (61 L, `e2eb35e4e3db…`),
`w6-*.check` (39/139/187 L). Group check logs:
`/tmp/w7-aud-b7-{tabi-r4-1-network,w4-t41-network,tabi-r4-2-async}.check`
(122/200/101 L).

Verdict: **audit stands PASS** on the briefed scope — the 3-group archive
manifest-pin equality holds at every surface checked (423 manifest lines,
48 in-group pin lines, 55 owning-note pins, all equal; the round-5 receipt's
1,010-file totals re-derive exactly), and routing rows **RT2** and **RT3**
re-derive from the archived bytes with no widening, their cited anchors present
at the cited lines. Residual risk = scope and churn (U1–U6), recorded, not
absorbed.