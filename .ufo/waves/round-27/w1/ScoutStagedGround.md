# ScoutStagedGround — C3 assimilation set re-adjudicated from primary bytes

Seat: ScoutStagedGround (wave 1, attack + verify). Round 27, attempt 1 (hyaku run 7).
Baseline lane tip `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; lane tip under test
`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (+ dirty worktree — see §6).
Read-only reporter: no tracked file touched, no git write, nothing run inside
`/home/vgpnk/Projects/shokuknow` beyond reading bytes.

---

## 0. Answer in one table

| # | staged row | disposition | primary basis | what a second row would cost |
|---|---|---|---|---|
| a | **S125** (SameSite draft-13) | **REFUSE as a row** | its source cell is **byte-identical** to lane row **S102**'s (sha256[:16] of the whole source cell = `20f638370009c7f1` for both; URL field sha256 = `6a7dd9b7…` for both). Appending it trips the lane gate `duplicate_url` = **E04** and, with S102's scope substituted, the scope-sensitive fleet census **E04 within scope**. | A second row on one document; the lane gate refuses the append outright. |
| b | **S142** (RFC 9110, redirect status classes) | **REFUSE as a row — merge into the existing S107 row, not a second row** | S142's URL field is **byte-identical to S124's** (sha256 = `4ccd9e03…`) and to lane **S107**'s; its §15.4.2–§15.4.9 ground is already inside S107's cited scope. Appending it trips lane-gate `duplicate_url` **E04**. | A second row + a second knowledge file for one document and one section range. |
| c | staged entry `redirect-and-retry-after-semantics.md` | **staged bytes over-assert; the landed entry does not** | the staged bytes assert *"307 / 308 — 'MUST NOT change the request method'"* as one clause; the fresh RFC bytes carry that sentence **only for 307** (§15.4.8, line 7494). §15.4.9's 308 body (lines 7507-7523) has **no** such clause. | — (this is the M1 already landed) |

**The claim C3 as frozen is met.** Counting command at the tip:
`git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l` → **1**
(`HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`); census
`bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ **exit 0**, `tabi ok …/corpus/SOURCES.md`; registry rows **106 → 107**.

---

## 1. Sources read (all read-only)

| artifact | path | bytes / id |
|---|---|---|
| staged rows file | `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` | 154 lines; S124 = line 29, S125 = line 30, S142 = line 47 |
| merge report (md) | `/home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.md` | 18 764 B, mtime 2026-10-24 23:33:20 -0300 |
| merge report (json) | `/home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.json` | `lane=tabi accepted=148 refused=0 entries=86 existing_rows=101 first_id=S102` |
| staged knowledge (2 files) | `…/merge/tabi/knowledge/corpus/knowledge/{redirect-and-retry-after-semantics.md, redirect-status-classification.md}` | read in full |
| lane registry | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` | 107 rows at tip; S102 = line 116, S107 = line 121 |
| lane gate | `scripts/check-sources.mjs` | `duplicate_url` → fleet **E04** (`scripts/check-sources.mjs:34`, logic at `:293-300`) |
| fleet census | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` | E04 = duplicate URL **within scope** (`:649`); W04 = same URL across scopes (`:645`) |
| fresh RFC bytes | `.ufo/waves/round-27/assimilation/rfc9110.txt` | **502 941 B**, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` (matches the S107 anchor cell) |

Tools: node v24.21.0, git 2.56.0, GNU Awk 5.4.1. No package installed this round.

---

## 2. (a) S125 is a byte-identical duplicate of lane row S102 — E04 confirmed

### 2.1 The URL is byte-identical

Command (lane registry line 116 vs staged file line 30):

```
grep -o 'https://[^ |]*' <(sed -n '116p' corpus/SOURCES.md) > /tmp/s102.url
grep -o 'https://[^ |]*' <(sed -n '30p'  …/SOURCES.append.md) > /tmp/s125.url
cmp /tmp/s102.url /tmp/s125.url   # → BYTE-IDENTICAL
sha256sum /tmp/s102.url /tmp/s125.url
```

Both URLs:

- lane **S102**: `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`
- staged **S125**: `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`

sha256 of each extracted URL field (files copied to
`.ufo/waves/round-27/scratch/ScoutStagedGround/{s102,s125}.url`):
`6a7dd9b76012971b2f69a22b3c5ffac59e2f96540172d556cbee5cd80b3b7a69` **for both**.

Stronger than the URL: the **entire source cell** (title + URL) is byte-identical.
Computed by splitting each row on `|` and hashing cell 2:

| row | source-cell sha256[:16] | len |
|---|---|---|
| lane S102 | `20f638370009c7f1` | 132 |
| staged S125 | `20f638370009c7f1` | 132 |

`S102 vs S125 source cell byte-identical: True`.

### 2.2 Appending S125 trips E04 — measured, two gates

Scratch mirror of the tip registry (`corpus/SOURCES.md` + `corpus/knowledge/` +
`corpus/lessons/` + `corpus/QUALITY.md`) under
`.ufo/waves/round-27/scratch/ScoutStagedGround/m-s125/`, with the **byte-exact**
staged row inserted immediately before the `## Paths` heading.

Lane gate (`node scripts/check-sources.mjs --root …/m-s125 --file corpus/SOURCES.md`):

```
FINDING id=duplicate_url fleet=E04 row=S125 detail=duplicate_url
FINDING id=bad_recheck fleet=E09 row=S125 detail=recheck_invalid
FINDING id=used_by_missing fleet=E11 row=S125 detail=path_missing
SOURCES_GATE verdict=failed rows=108 … findings=3
exit=1
```

Scope-sensitive fleet census (`sources-census.sh validate --file …/m-s125/corpus/SOURCES.md`):

```
file	W04	S125 duplicate url www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt across scopes
file	E09	S125 recheck=180d (draft; re-read for a new revision)
file	E11	S125 missing used-by corpus/knowledge/cookie-samesite-semantics.md
exit=1
```

Note the two gates differ in scope sensitivity: the lane gate's `duplicate_url`
keys on **URL only** (`scripts/check-sources.mjs:293-300`), the fleet census keys
on **URL + scope** (`sources-census.sh:643-650`). So the byte-exact staged row
lands as **E04 on the lane gate** and as **W04 (across scopes) + E09 + E11** on
the fleet census — E04 there only if the scope cell matches.

### 2.3 Control: same scope ⇒ fleet census E04 (the E04 trip is real, not a naming artifact)

`m-ctrl-s125-samescope/` = the same fixture with **only** S125's scope cell
replaced by S102's exact scope text ("What SameSite guarantees against CSRF, and
the draft's own limit on that guarantee"). Everything else byte-exact:

```
file	E04	S125 duplicate url www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt within scope What SameSite guarantees against CSRF, and the draft's own limit on that guarantee
file	E09	S125 recheck=180d (draft; re-read for a new revision)
file	E11	S125 missing used-by corpus/knowledge/cookie-samesite-semantics.md
```

Lane gate on the same fixture: `FINDING id=duplicate_url fleet=E04 row=S125`.

**Conclusion (a):** S125's URL is byte-identical to lane S102's URL, and its
source cell is byte-identical to S102's whole source cell. Appending it trips
E04. **Refusal-as-row is correct.** The lesson's recorded reasoning
(`corpus/lessons/round-27.md:27`) — "on the same bytes, `scripts/check-sources.mjs`
flags duplicate URL as E04; the scope-sensitive sources census reports W04 …
A control with S102's exact scope produces census E04" — is confirmed verbatim
by my independent measurements.

**One correction to the dispatch prompt's phrasing (not to the lane's record).**
The prompt says "appending S125 must trip census E04". Strictly: it trips **E04
on the lane gate**; on the **scope-sensitive fleet census** it trips **W04**,
because the staged scope cell ("The normative cookie SameSite semantics that
decide whether a cross-site submit carries the session cookie") differs from
S102's. The refusal stands either way — the append fails on three independent
codes (E04 lane-gate / W04+E09+E11 fleet-census) — but "census E04" is only true
of the lane gate, or of the fleet census under the same-scope control. The lane's
own lesson already states this correctly.

---

## 3. (b) S142 is the same RFC 9110 document as S124 — refusal-as-row, merge into S107

### 3.1 URL identity

```
grep -o 'https://[^ |]*' <(sed -n '29p' SOURCES.append.md) > s124.url   # staged S124
grep -o 'https://[^ |]*' <(sed -n '47p' SOURCES.append.md) > s142.url   # staged S142
grep -o 'https://[^ |]*' <(sed -n '121p' corpus/SOURCES.md) > lane_s107.url
cmp s124.url s142.url        # → BYTE-IDENTICAL
cmp s124.url lane_s107.url   # → BYTE-IDENTICAL
```

sha256 of the URL field: `4ccd9e03066611d6b5a8cc0519fafca9a3d2c7a5643efba49194f2ebfd4f4eff`
for **all three**.

The two source cells (quoted in full, as required):

- staged **S124** (SOURCES.append.md:29, cell 2):
  `HTTP Semantics — RFC 9110 — https://www.rfc-editor.org/rfc/rfc9110.txt`
- staged **S142** (SOURCES.append.md:47, cell 2):
  `HTTP Semantics — RFC 9110 (redirect status classes) — https://www.rfc-editor.org/rfc/rfc9110.txt`

The **URL** is byte-identical; the source cells differ only in the title
("RFC 9110" vs "RFC 9110 (redirect status classes)") — whole-cell sha256[:16]:
S124 `ed360165fa140109`, S142 `da16e83c030c5629`. The landed lane row **S107**'s
source cell is byte-identical to staged **S124**'s (`ed360165fa140109`).

### 3.2 Scope overlap with S107

| row | scope cell |
|---|---|
| lane **S107** (corpus/SOURCES.md:121) | "Documented redirect semantics a journey driver may observe (301/302/303/307/308, method rewriting) and the `Retry-After` header; scope bound to the sections cited, not the whole spec" |
| staged **S142** (SOURCES.append.md:47) | "The per-status redirect semantics wave 2 quoted only for 303 and 307: what 301, 302 and 308 each mean and whether the method may change" |

S107's cited ground already carries every section S142 names: its anchor cell
cites §15.4.4 (303, lines 7413-7414), §15.4.2 note (7384-7387), §15.4.3 note
(7406-7409), §15.4.8 (7493-7495), §15.4.9 (7507-7523), §15.4 step 4
(7306-7307), §10.2.3 (4805-4813). S142 adds **no section outside** that range —
its §15.4.2/.3/.8/.9 anchors are already inside S107's. So the second row would
carry **no separately citable ground**.

### 3.3 Appending S142 is refused by the gates too

Fixture `m-s142/` (byte-exact staged S142 row, tip registry):

```
node scripts/check-sources.mjs --root …/m-s142 --file corpus/SOURCES.md
  FINDING id=duplicate_url fleet=E04 row=S142 detail=duplicate_url
  FINDING id=bad_recheck fleet=E09 row=S142 detail=recheck_invalid
  FINDING id=used_by_missing fleet=E11 row=S142 detail=path_missing
  verdict=failed rows=108 findings=3   exit=1
```

Fleet census: `W04 S142 duplicate url www.rfc-editor.org/rfc/rfc9110.txt across scopes`,
`E09 S142 recheck=730d (errata only)`, `E11 S142 missing used-by corpus/knowledge/redirect-status-classification.md`, exit 1.

### 3.4 Control: the *merge* is what passes, and only with the id cited

`m-ctrl-s142-supersedes/` — same staged row with only the teaches cell prefixed
`supersedes S107 — merged into the S107 row; …`:

- lane gate: E04 **cleared** (supersedes is the documented exemption at
  `scripts/check-sources.mjs:296`); remaining findings E09 + E11 only.
- fleet census: still W04 (across scopes) + E09 + E11.

`m-ctrl-s142-full/` — supersedes + recheck normalised to bare `730d` + used-by
pointed at the **admitted** entry `corpus/knowledge/redirect-and-retry-after-semantics.md`:

- fleet census: `file ok` (exit 0)
- lane gate: `FINDING id=used_by_uncited fleet=- row=S142 detail=row_id_absent` — the lane gate
  requires the used-by file to literally contain the row id.

`m-ctrl-s142-both/` — the same plus the entry's source line naming S142 as well:

- lane gate: `SOURCES_GATE verdict=clean rows=108 … findings=0` exit 0
- fleet census: `file ok` exit 0

**Conclusion (b):** S142 is refused as a row; the only way it could land is as a
**merge into the existing S107 row** (a `supersedes S107` teaches prefix, a
normalised recheck cell, a used-by that points at the already-admitted entry,
and that entry naming S142). That merge is *mechanically possible* (last
control) but is **not what the lane did and should not be done here**: S142's
§15.4.2–§15.4.9 ground is already inside S107's cited scope, so a merge would
add no separately admitted knowledge, and the refusal is recorded at
`corpus/lessons/round-27.md:28`. **Refusal-as-row is the right disposition.**

---

## 4. (c) The staged bytes over-assert; the landed bytes do not

### 4.1 The staged clause

`/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/redirect-and-retry-after-semantics.md:18-19`:

> `- **307 / 308** — "MUST NOT change the request method", which makes them the`
> `  status codes that preserve a state-changing submission.`

One clause, two statuses.

### 4.2 What the fresh bytes actually contain

Fresh RFC 9110 bytes = `.ufo/waves/round-27/assimilation/rfc9110.txt`, 502 941 B,
sha256 `21c1cdce…` (the same bytes the S107 anchor cell names).

```
grep -c "MUST NOT change the request method" rfc9110.txt   →  1
grep -n  "MUST NOT change the request method" rfc9110.txt   →  7494
```

**Exactly one** occurrence in the whole 502 941-byte document, at line 7494,
inside **§15.4.8. 307 Temporary Redirect** (heading at line 7490). The complete
sentence (lines 7493-7495):

> `   resource resides temporarily under a different URI and the user agent`
> `   MUST NOT change the request method if it performs an automatic`
> `   redirection to that URI.  Since the redirection can change over time,`

Section headings, located: `15.4.8.  307 Temporary Redirect` at line 7490;
`15.4.9.  308 Permanent Redirect` at line 7505. The 308 body runs lines 7507-7523
and contains **no** MUST-NOT clause of any kind — a sweep of the whole redirect
section (`awk 'NR>=7230 && NR<=7530 && /MUST NOT/'`) returns **one** line, 7494.
A document-wide sweep for `MUST NOT.*method` also returns only 7494.

### 4.3 What the landed entry says instead

`corpus/knowledge/redirect-and-retry-after-semantics.md` (worktree, tip) keeps the
clauses apart:

- **307** — quotes the located sentence with its location (§15.4.8, lines 7493-7495).
- **308** — "its own §15.4.9 body does NOT repeat the MUST-NOT clause (located:
  §15.4.9 carries the permanent-assignment text, lines 7507-7523; the only
  MUST-NOT in the redirect sections is 307's at line 7494)" and marks the
  preserving reading **INFERENCE**, not a located normative sentence.
- It additionally cites the §15.4 history note (lines 7260-7264) — "307
  (Temporary Redirect) and 308 (Permanent Redirect) [RFC7538] were later added to
  unambiguously indicate method-preserving redirects" — as history, explicitly
  *not* as a status-specific normative MUST-NOT.

The landed S107 row's teaches cell says the same: "307 MUST NOT change the
request method; … RFC 9110's history note describes 308 as method-preserving but
§15.4.9 does not restate the rule normatively".

**Conclusion (c): CONFIRMED — over-assertion in the staged bytes.** The staged
entry attributes 307's clause to 307 *and* 308. The fresh RFC bytes carry it
only for 307. The landed entry and row correct this and mark 308 as inference.
This is exactly the M1 recorded at `corpus/lessons/round-27.md:35-46`.

### 4.4 One further staged-bytes defect found while checking (c) — NOT in the landed entry

The same staged file, lines 20-21, quotes Retry-After as:

> `- **`Retry-After`** "can be used with a 3xx (Redirection) or 503 (Service`
> `  Unavailable) status code", so a redirect may itself carry a wait instruction.`

That sentence is **not in RFC 9110** at all. Sweeps of the fresh bytes:

```
grep -n "can be used with a 3xx" rfc9110.txt        → NOT FOUND
grep -n "Redirection) or 503" rfc9110.txt           → NOT FOUND
```

What RFC 9110 §10.2.3 actually says (lines 4801-4810): "Servers send the
'Retry-After' header field to indicate how long the user agent ought to wait
before making a follow-up request. … When sent with a 503 (Service Unavailable)
response, Retry-After indicates how long the service is expected to be unavailable
to the client. When sent with any 3xx (Redirection) response, Retry-After
indicates the minimum time that the user agent is asked to wait before issuing
the redirected request."

The staged wording is a paraphrase of RFC 6585's §4 wording, not RFC 9110's
§10.2.3 text, and it is presented as a quote. **The landed entry does not carry
this defect** — it quotes the located §10.2.3 sentences verbatim ("When sent with
any 3xx (Redirection) response, Retry-After indicates the minimum time that the
user agent is asked to wait before issuing the redirected request.", §10.2.3,
lines 4805-4807) and does not use the RFC-6585 phrasing. So this is a
staged-bytes-only defect, caught by re-grounding, and it is a **second,
independent** instance of the same class as M1 (staged bytes asserting a quote
the cited document does not contain). Worth a look by the lesson owner: M1 names
only the 307/308 clause.

Also checked while there: staged `redirect-status-classification.md` claims
"RFC 9110 defines no 429 status at all (zero occurrences of '429' in the
document)" — **verified true**: `grep -c "429" rfc9110.txt` → 0.

---

## 5. C3 counters re-run by a non-author

| counter | command | result |
|---|---|---|
| entries citing S107 | `git grep -lE '^source: S107 ' HEAD -- corpus/knowledge \| wc -l` | **1** → `HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md` |
| census at tip | `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | **exit 0**, `tabi ok …/corpus/SOURCES.md`, 16 standing W04 warnings (unchanged from `census-before.txt`) |
| registry rows | `git show f185b4e7…:corpus/SOURCES.md \| grep -cE '^\| S[0-9]{3,}'` → 106; tip → 107 | **106 → 107** |
| lane gate at tip (scratch mirror of the committed HEAD registry) | `node scripts/check-sources.mjs --root …/m-head --file corpus/SOURCES.md` | `SOURCES_GATE verdict=clean rows=107 … findings=0` exit 0 |
| lane gate at tip (scratch mirror of the dirty worktree registry) | same, `--root …/mirror` | `verdict=clean rows=107 … findings=0` exit 0 |

The census was run with a **copy** of the fleet script placed in my scratch dir
(`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/ScoutStagedGround/sources-census.sh`,
read-only copy of `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`) so that
no `--out` artefact and no write could land in the fleet tree; the final
confirmation line was produced by running the fleet script itself in its
read-only `validate` mode (it writes only stdout unless `--out` is given).

---

## 6. Observations the author should see (no action required by this seat)

1. **The tip tree is dirty.** `git status --porcelain` shows 8 modified tracked
   files including `corpus/SOURCES.md` and
   `corpus/knowledge/redirect-and-retry-after-semantics.md`. The S107 row's
   scope/teaches/anchor cells in the **worktree** differ from the **committed**
   HEAD row (worktree: "Documented redirect semantics a journey driver may
   observe…" + the §15.4 history-note anchor at 7260-7264; HEAD: "The normative
   redirect semantics…"). Both forms pass the lane gate clean (§5). The landed
   M1 fix therefore lives partly in an uncommitted edit — **the 308
   inference-preserving wording is present in the committed HEAD entry too**
   (I read `git show HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`
   into the `m-head` mirror and the gate passed), but the §15.4-history-note
   anchor addition is worktree-only. Not a defect; a state observation.
2. **`SOURCES.append.md` is a different S-space from the lane's.** The staged
   file's S102 is a CDP README row; the lane's S102 is the SameSite draft;
   the staged S107 is a zh-TW WebMCP page; the lane's S107 is RFC 9110. The
   lane's own collision note (`.ufo/waves/round-27/assimilation/collisions`)
   lists the id overlap S102-S106. The merge report's own `first_id` is S102 and
   `existing_rows` 101 — i.e. the package was built against the pre-round-23
   registry, before the lane held S102 at all. **Consequence: the merge
   report's "Rows whose source the lane's registry already holds" table (which
   lists only S117/S020) could not have flagged S125 or S142 — those duplicates
   are against rows the lane acquired after packaging.** The round-27 refusal
   record is therefore the *first* adjudication of these two staged rows
   against the current lane registry, which is what §2/§3 above supply
   independently.
3. **Within the staged file itself, S125 is not alone.** A sweep of
   SOURCES.append.md finds four rows sharing the 6265bis URL (S125, S145,
   S172, S181) and two sharing the RFC 9110 URL (S124, S142); six URL groups
   are duplicated across the 118 URL-bearing staged rows. So the duplicate-URL
   pressure is a property of the staged set, not only of the lane — any future
   adoption of that package needs the same within-set E04 sweep.
4. **The merge report's `accepted=148 / refused=0`** is a statement about the
   packaging step only. It is **not** an admission decision: the package accepted
   S125 and S142 as rows, and the lane has since refused both. Nothing in the
   lane's tracked files claims the package's rows were admitted.

---

## 7. Remaining unknowns (kept separate from the findings)

- Whether RFC 7538 (the normative home of 308's method-preservation) was ever
  opened by this lane: no row for it exists in `corpus/SOURCES.md`
  (`grep -c 6585 corpus/SOURCES.md` → 0) and no bytes are committed. The landed
  entry names RFC 7538 as the place to re-anchor the 308 clause; that re-anchor
  has not been done. *Unknown, not a defect.*
- Whether the §15.4 history note (lines 7260-7264) would satisfy a future
  QUALITY review as a located basis for a 308 method-preservation claim. The
  landed entry deliberately declines that route. *Not measured here.*
- The staged `cookie-samesite-semantics.md` and `redirect-status-classification.md`
  entry bodies were not re-grounded against fresh bytes in this seat — they are
  outside the three named claims (S125/S142 were refused as rows, so no entry
  rests on them). Their quote fidelity is **not asserted** here either way.
  *Unknown.*

---

## 8. Reproduction (all scratch, all read-only w.r.t. tracked files)

Scratch root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/ScoutStagedGround/`

- `receipts.txt` — every gate/census run quoted above, in order, with exit codes.
- `mirror/` — scratch copy of the tip `corpus/` (SOURCES.md + knowledge/ +
  lessons/ + QUALITY.md) used as the base for the append fixtures.
- `m-s125/`, `m-s142/`, `m-s124/` — tip mirror + the **byte-exact** staged row
  inserted immediately before `## Paths`.
- `m-head/`, `m-head-s124/` — the same, built from `git show HEAD:…` blobs.
- `m-ctrl-s125-samescope/` — S125 with S102's scope cell (fleet-census E04 control).
- `m-ctrl-s142-supersedes/`, `m-ctrl-s142-full/`, `m-ctrl-s142-both/` — the three
  S142 merge controls of §3.4.
- `s102.url`, `s125.url`, `s124.url`, `s142.url`, `lane_s107.url` — the extracted
  URL fields whose sha256 values are quoted above.
- `sources-census.sh` — read-only copy of the fleet census script.

Fixture construction rule (avoiding the M2 trap recorded in
`corpus/lessons/round-27.md:48-56`): rows are inserted as verified **row text**
before the `## Paths` heading — never as a `grep -n` output line — so the row is
a real registry row and the gate actually sees it.

No tracked file was modified; no git write command was run; nothing was executed
inside `/home/vgpnk/Projects/shokuknow` beyond reading its bytes.

---

## 9. Addendum — second instance of this seat (independent re-adjudication)

A second `ScoutStagedGround` instance ran this same spec item concurrently and
wrote the report above at 14:54; this addendum is that instance's independent
re-derivation from the same primary bytes. **Nothing above is retracted** — every
load-bearing claim in §0–§8 was re-measured independently and all of them
reproduce:

| claim | independent re-measurement | agrees |
|---|---|---|
| lane S102 vs staged S125 source cell byte-identical | `20f638370009c7f1` for both, len 132, `equal: True` | ✅ |
| S125 URL field sha256 | `6a7dd9b7…` for both | ✅ |
| S124 / S142 / lane-S107 URL field sha256 | `4ccd9e03066611d6…` for all three; whole-cell `ed360165fa140109` (S124 = lane S107), `da16e83c030c5629` (S142) | ✅ |
| lane gate trips on S125 | `FINDING id=duplicate_url fleet=E04 row=S125` + E09 + E11, `verdict=failed rows=108 findings=3` | ✅ |
| fleet census on S125 | `W04 … across scopes` + `E09 recheck=180d (draft; re-read for a new revision)` + `E11 missing used-by corpus/knowledge/cookie-samesite-semantics.md`, exit 1 | ✅ |
| same-scope control ⇒ census E04 | `E04 S125 duplicate url … within scope What SameSite guarantees against CSRF…` | ✅ |
| lane gate trips on S142 | `duplicate_url E04 row=S142` + E09 + E11 | ✅ |
| clause occurs once, in §15.4.8 only | `grep -c "MUST NOT change the request method"` → **1**, at line **7494**; §15.4.9 spans 7505–7531 and carries no MUST-NOT (its only "method" token is line 7525, cache controls) | ✅ |
| §15.4 history note at 7260–7264 | lines 7260–7264 carry "307 (Temporary Redirect) and 308 (Permanent Redirect) [RFC7538] were later added to unambiguously indicate method-preserving redirects" | ✅ |
| `grep -c "429"` in the fresh bytes | **0** | ✅ |
| registry rows 106 → 107 | `git show f185b4e7…:corpus/SOURCES.md \| grep -cE '^\| S[0-9]{3,}'` → **106**; tip → **107** | ✅ |
| census exit 0 at tip, 16 standing W04 | `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`; W04 count **16** now and **16** in `census-before.txt` | ✅ |
| lane gate clean on the **committed** HEAD registry | `git archive HEAD corpus` into a scratch root, then `check-sources.mjs --root … --file corpus/SOURCES.md` → `SOURCES_GATE verdict=clean rows=107 findings=0` | ✅ |
| entries citing S107 at tip | `git grep -lE '^source: S107 ' HEAD -- corpus/knowledge \| wc -l` → **1** | ✅ |

### 9.1 One correction to §4.4's attribution (the finding stands; the source does not)

§4.4 correctly establishes that the staged `Retry-After` quote is **absent from
RFC 9110** — that is reproduced and stands. But it attributes the staged wording
to "RFC 6585's §4 wording". **That attribution is wrong.** RFC 6585 was fetched
for this check (2026-10-25, HTTP 200, 17164 B, sha256
`f6d55d1b491cd515c35877cf9181753b23b2a68c4df14e56d83dc445b3876e58`) and its §4
("429 Too Many Requests") says only:

> `   condition, and MAY include a Retry-After header indicating how long`
> `   to wait before making a new request.`

That is a 429 context and contains no 3xx/503 wording. The staged sentence's
actual ancestor is **RFC 2616 §14.37** (HTTP/1.1), fetched for this check
(2026-10-25, HTTP 200, 422279 B, sha256
`10211d2885196b97b1c78e1672f3f68ae97c294596ef2b7fd890cbd30a3427bf`), lines
7853–7857:

> `   The Retry-After response-header field can be used with a 503 (Service`
> `   Unavailable) response to indicate how long the service is expected to be`
> `   unavailable to the requesting client. This field MAY also be used`
> `   with any 3xx (Redirection) response to indicate the minimum time the`
> `   user-agent is asked wait before issuing the redirected request.`

The staged line is a **compressed paraphrase of RFC 2616 §14.37** ("can be used
with a 3xx (Redirection) or 503 (Service Unavailable) status code"), presented
as a quotation of RFC 9110. RFC 7231 §7.1.3 was also fetched for this check
(2026-10-25, HTTP 200, 235053 B, sha256
`a83d026937f6f7929a0e53f8a9bfec4104285f0f89d6dbabd3927c4208a715b2`): its
§7.1.3 (lines 3843–3849) is worded like RFC 9110 §10.2.3 — "When sent with any
3xx (Redirection) response…" — not like the staged line. Phrase sweep
(`grep -c '3xx (Redirection) or 503'`): **0** in RFC 9110, **0** in RFC 7231,
**0** in RFC 6585, **0** in RFC 2616 — the exact staged string is a paraphrase
of none of them; it is closest to RFC 2616 §14.37.

**The class of defect is unaffected: the staged bytes present a quotation the
cited document does not contain.** Only the upstream attribution changes
(2616 §14.37, not 6585 §4). The landed entry does not carry the defect — it
quotes RFC 9110 §10.2.3 verbatim ("When sent with any 3xx (Redirection)
response, Retry-After indicates the minimum time that the user agent is asked to
wait before issuing the redirected request.", lines 4805–4807).

### 9.2 A third staged-bytes defect not covered above: the §15.4.7 anchor mislabel

The staged **S124** row's anchor cell names the wrong section for 307:

```
staged S124 anchor cell:
 §15.4 (Redirection 3xx), §15.4.4 (303 See Other), §15.4.7 (307), §10.2.3 (Retry-After); RFC 9110, June 2022
```

and the staged entry's own `source:` line (line 4) repeats it:

```
source: S124 — https://www.rfc-editor.org/rfc/rfc9110.txt — §15.4, §15.4.4, §15.4.7, §10.2.3 — RFC 9110, June 2022 fetched 2026-10-23
```

In RFC 9110, **§15.4.7 is "306 (Unused)"** (heading at line 7485) and 307 is
**§15.4.8** (heading at line 7490):

```
7485:15.4.7.  306 (Unused)
7490:15.4.8.  307 Temporary Redirect
7505:15.4.9.  308 Permanent Redirect
```

So the staged anchor points at the *wrong section* for the very clause the row
teaches. The staged package is self-contradictory here: its own **S142** row
(line 47) names the sections correctly — `§15.4.8 (307 Temporary Redirect),
§15.4.9 (308 Permanent Redirect)` — while **S124** and the staged entry both
carry `§15.4.7 (307)`.

This is a **third instance of the same class as M1** (staged bytes asserting
something the cited document does not support), on a *different* surface
(anchor cell rather than quote), and it is **absent from the landed bytes**:
the landed S107 anchor cites `§15.4.8 307 MUST-NOT at 7493-7495` and
`§15.4.9 308 at 7507-7523`, i.e. the correct numbering. §4.4 names only M1
(the 307/308 clause) and this quote defect; the lesson owner may want M1's
wording to cover the anchor mislabel and the RFC-2616 provenance too.

### 9.3 Scope note on the worktree-vs-HEAD divergence (extends §6.1)

Re-measured, and the divergence is real and larger than a row cell:

- **Committed HEAD** (tip `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`):
  S107's scope cell begins "The normative redirect semantics…"; its `teaches`
  cell says "308's preservation is an inference in this text"; its anchor cell
  has **no** §15.4 history-note clause; the committed entry
  (`HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`) carries the
  308-inference wording and names RFC 7538 as the re-anchor target, but **does
  not** cite the §15.4 history note.
- **Worktree** (mtime 2026-10-25 14:38–14:39, after the C3 commit `6ca3b89`
  at 14:15): S107's scope cell begins "Documented redirect semantics a journey
  driver may observe…"; its `teaches` cell adds "RFC 9110's history note
  describes 308 as method-preserving but §15.4.9 does not restate the rule
  normatively"; its anchor cell adds "§15.4 historical note at 7260-7264 says
  307/308 were added to unambiguously indicate method-preserving redirects";
  and the worktree entry adds a matching paragraph citing that note.

Both forms pass the lane gate clean on the committed tree (§5), and both are
defensible; the point is that the **history-note-grounded 308 wording is
worktree-only** and is not in the commit the C3 claim cites. Nothing in §0–§8
depends on which form is authoritative.

### 9.4 Reproduction for this addendum

Scratch root (this instance):
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/TabiR27.ScoutStagedGround/`

- `receipts/` — the census runs and staged-row extracts quoted in §9.
- `souji-validator-check/` — a **separate** check performed for a sibling-lane
  request (see below), kept here because it is the only place a copy of the
  fleet census script and a rewritten spec were used; it touches no tracked file
  and nothing under `/home/vgpnk/Projects/shokuknow`.
- `rfc9110-refetch.txt` — independent refetch of the cited document:
  HTTP 200, 502941 B, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`
  (identical to the round-27 assimilation copy and to the sha256 named in
  S107's anchor cell).
- `rfc6585.txt`, `rfc7231.txt`, `rfc2616.txt` — the three additional RFC
  fetches for §9.1 (status/bytes/sha256 recorded inline above).

### 9.5 Out-of-lane finding, reported here because it was asked for directly

A sibling seat (`SoujiR27`, souji lane) asked this lane for a dispatch handoff.
It needed none, and the answer was located rather than relayed: souji round 27
**is** dispatched and running under a fresh attempt-2 identity. Facts, all
read-only:

- `events.log`: 14:42:35 launch attempt=1 → 14:46:45 `attempt-failed … :: L1
  misread inline-spawn handoff (expected orchestrator to supply claims/ready),
  declared blocked, refused resume; no lane writes` → 14:46:47 launch attempt=2.
  `MAX_ATTEMPTS=3` (`scripts/hyaku/inline.sh:25`).
- `.ufo/waves/round-27/w1.ready` = `{"lane":"souji","round":27,"wave":"w1",
  "dispatch":"…/w1-dispatch.json","l1":"SoujiR27a2"}`; `w1.ready.dispatched` =
  `2026-10-25T14:54:26`; dispatcher log `registered …/w1.ready`, then
  `souji/w1: spawned 79/79`; 65 of 79 seat reports on disk at 15:03.
- The attempt-1 root cause, for the record: the first `w1-spec.json` failed the
  validator with `{"code":"invalid_spec","message":"items[0] has unknown key
  \"agent\""}`. `ITEM_KEYS` at `ufo-swarm-wave.mjs:279` permits only
  `{item,prompt,role,resume,message,name,axes,milestone,modelAlias}`; the
  generator emitted `{"name","agent","task"}`. Attempt 2's generator emits
  `{"name","role","prompt"}` and validates clean.
- **Independent reproduction**: rewriting the attempt-1 spec's item keys to
  `role`/`prompt` in this seat's scratch and re-running the validator
  (`UFO_CONFIG_PATH=…/ufo-wave-policy-v2.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1
  UFO_PROJECT_ROOT=<scratch> node …/ufo-swarm-wave.mjs run --spec …`) exits 0
  with `counts {spawn: 79, resume: 0, total: 79}` and a dispatch payload
  **byte-identical** to the shipped `w1-dispatch.json` (`cmp` clean).

**No tracked file was modified by this addendum; no git write was run; nothing
inside `/home/vgpnk/Projects/shokuknow` was executed.**
