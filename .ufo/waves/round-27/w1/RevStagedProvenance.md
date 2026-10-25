# RevStagedProvenance — provenance of the staged C3 theme

**Seat:** `RevStagedProvenance` (wave 1, read-only reporter; leaf, no dispatch)
**Lane root:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`
**Revs used:** baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (given); C3 landing
`6ca3b89ad2a7b480984859834b3d28f1e75a9a26`; tip at read `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`
(`git rev-parse HEAD`).
**Staged package (read-only):** `/home/vgpnk/Projects/shokuknow/merge/tabi/`
**Campaign lane (read-only):** `/home/vgpnk/Projects/shokuknow/lanes/tabi/`,
campaign registers `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/`
**Scratch:** `.ufo/waves/round-27/scratch/RevStagedProvenance/` (`rfc9110-verify.txt`,
`wpt-redirect-method.any.js`). Nothing tracked was written. No tool installs; no pacman call.

**Live-tree warning.** At the moment I read, the round-27 landing is uncommitted: `git status
--porcelain` lists `M LOG.md, M SCORECARD.md, M corpus/QUALITY.md, M corpus/README.md,
M corpus/SOURCES.md, M corpus/knowledge/redirect-and-retry-after-semantics.md,
M corpus/lessons/round-27.md, M scripts/check-s106-evidence.mjs` plus untracked wave files.
`LOG.md` grew from 1925 lines (at `5ed6484`) to 1947 lines between two reads. Every claim below
names its revision; "the tree" is never used as a revision.

**Verdict summary.** (a) staging is real; the entry is labelled `round2` in two package artifacts,
and the package carries no rationale field — the rationale lives in the campaign's
`round2/KNOWLEDGE-PROPOSED.md` and in the entry's own "why this matters" paragraph. (b) The
campaign's `opened: 2026-10-23` and the lane's `opened: 2026-10-25` are different facts about the
same bytes; the lane's gate carries `2026-10-25` in the row *and* `verified-at: 2026-10-25` in the
entry, and I re-fetched the URL (`status=200`, 502941 B, sha256 `21c1cdce…`) to bytes identical to
the lane's committed copy. (c) The `307/308 MUST NOT` over-assertion is campaign-side in **both**
the staged row's teaches cell and the staged entry's body; the lane corrected both cells, and it
additionally replaced a staged quote that is **absent from RFC 9110's bytes**. (d) The refusal
record covers 2 of the 13 redirect/Retry-After-family rows; S193 is in-family but provably silent
on 308, so it could not have settled the disputed clause, and it was not appendable as staged
(malformed row + dangling `used-by`). Two findings the round-27 lesson does not carry: staged S124
was already adjudicated `absent-refused` in the round-22 quarantine, and that verdict family rests
on a misaligned quote register.

---

## (a) The staging record: rationale and the round-2 label

`MERGE-REPORT.md:3`:

> "Staged by `corpus-expansion-1`. **Nothing was written into the lane repo.**"

The theme row, verbatim (`MERGE-REPORT.md:29`):

> `| corpus/knowledge/redirect-and-retry-after-semantics.md | new-file | round2 | Redirect and Retry-After semantics for a journey driver | new file |`

**Round-2 label: confirmed in two package artifacts.** The machine record
(`python3 -c "import json;…;print(json.dumps(d['entries'][10]))"` over `MERGE-REPORT.json`) gives
`"round": "round2"`, `"kind": "new-file"`, `"collides_with_existing": false`,
`"duplicate_target": false`. The staged package names the same round in its header comment:
"Each row was opened in the round that wrote it" (`SOURCES.append.md:2-3`).

**Rationale — where it actually lives.** `MERGE-REPORT.md` has no rationale field; its JSON entry
keys are only target/canonical_target/title/round/kind/collides_with_existing/duplicate_target/
duplicate_of/has_duplicate. The rationale is in two places, both campaign-side:

1. Campaign proposal `lanes/tabi/round2/KNOWLEDGE-PROPOSED.md:84-89` (byte-identical in the package
   copy at `knowledge/corpus/knowledge/redirect-and-retry-after-semantics.md:23-28`):

   > "the lane's journey notes flag redirects as untested and its approval table has no vocabulary
   > for a redirect that changes the method" — `KNOWLEDGE-PROPOSED.md:84-85`

   and

   > "and the two specs the round-1 ledger named" — `KNOWLEDGE-PROPOSED.md:86-87`

2. The campaign scout brief for this lane names the gap the theme serves:
   "Real-site journeys + evidence durability — third-party JS, redirects, POST forms,
   CSRF-checked submits untested by rule" (`briefs/ScoutTabi.md:51`).

Two defects in that rationale, both still visible in the package:

- **The "two specs" phrase names one.** The entry's `source:` line cites only RFC 9110. The second
  spec is almost certainly the Fetch Standard, which the package stages as row `S180`
  (`SOURCES.append.md:85`) and never dispositions.
- **The "redirects untested" half is false of this lane** (see F10).

**Package self-description vs the lane's record.** `MERGE-REPORT.md:5-6` says
"proposed rows accepted: **148**" / "proposed rows refused: **0**"; `MERGE-REPORT.json` has
`"refused": []`. The lane nonetheless refused two of the package's rows (see d.1). That is the
lane's own §10 collision pass doing work the package did not do: the package's "registry already
holds" table lists only `S117 ↔ S020` (`MERGE-REPORT.md:114-120`).

**Stale ancillary record (F9).** `lanes/tabi/ID-REMAP.md:4-6` states "staged rows renumbered: **3**"
and "first staged id is now **S223**", but the shipped append begins at `S102` and ends at `S249`
(`sort -u` over `^| S[0-9]{3}` in `SOURCES.append.md`; the package's own `assimilation/staged-ids`
holds 148 ids, S102…S249). The ID-REMAP table itself is round-11-scoped (S223↔S224↔S225), so the
header sentence is stale. It does not touch the lane (the lane assigned its own `S107`), but a
reader entering through `ID-REMAP.md` would be misled.

---

## (b) The campaign's `opened` proves nothing about this lane; the lane's own gate does carry 2026-10-25

**Campaign side.** Staged row `S124`'s opened cell (column 9) is `2026-10-23`
(`SOURCES.append.md:29`; same row copied at `assimilation/staged-row.txt`). The campaign's evidence
block agrees — `- accessed: 2026-10-23` (`lanes/tabi/round2/SOURCES-PROPOSED.md:53`) — and the
staged entry's own header says `verified-at: 2026-10-23` (staged entry :5). These are the
campaign's access facts. Under the campaign's own contract a row is a claim "you must have **opened**
the source in this round" (`corpus-expansion-1/FORMAT-CONTRACT.md:99`), where "round" is the
campaign's round, not the lane's.

**Lane side — both cells carry 2026-10-25.**

| carrier | value | command |
|---|---|---|
| row `S107`, opened cell | `2026-10-25` | cell-split of `corpus/SOURCES.md:121` |
| row `S107`, anchor cell | "fetched 2026-10-25, 502941 bytes, sha256 21c1cdce…232a" + seven line locators | same |
| row `S107`, recheck cell | `730d` (staged prose "(errata only)" stripped) | same |
| entry `verified-at` | `2026-10-25` (`corpus/knowledge/redirect-and-retry-after-semantics.md:4`) | `grep -n verified-at` |
| entry source line | "fresh plain-text fetch this round (2026-10-25, 502941 bytes, sha256 21c1cdce…)" | entry :3 |
| lesson Gate bullet | "access 2026-10-25, fresh plain-text fetch 502941 B sha256 `21c1cdce…`" | `corpus/lessons/round-27.md:26` (committed at `336d5d1`) |

**The 2026-10-25 access is byte-genuine — re-measured, not inherited.**

```
sha256sum .ufo/waves/round-27/assimilation/rfc9110.txt ; wc -c  →
  21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a   502941
curl -sSL -o scratch/RevStagedProvenance/rfc9110-verify.txt \
  -w 'status=%{http_code} bytes=%{size_download}\n' https://www.rfc-editor.org/rfc/rfc9110.txt
  → status=200 bytes=502941
sha256sum rfc9110-verify.txt → 21c1cdce…232a
cmp -s rfc9110-verify.txt .ufo/waves/round-27/assimilation/rfc9110.txt → IDENTICAL
sha256sum lanes/tabi/round2/.work/rfc9110.txt → 21c1cdce…232a (502941 B, dated Oct 23)
```

So the campaign's round-2 fetch and this lane's round-27 fetch are the **same bytes**; the whole
divergence between the staged text and the admitted text is interpretive, not a different snapshot.
That is the sharpest answer to "does the campaign date prove lane access": it does not, and it did
not need to — the lane re-opened the same document and its own hash is the one in its row.

**Receipt-detail observation.** The lane's receipts record bytes + sha256 but no HTTP status
(`assimilation/README.md:8`, `s107-row.txt`, `corpus/SOURCES.md:121`); `status=200` above is my
measurement. The campaign records status for *other* rows (e.g. S125 "accessed: … (HTTP 200,
146 976 bytes)", `round2/SOURCES-PROPOSED.md:61`) but not for S124 (`:53`). Net: this is a
receipt-detail gap on both sides for this document, not a lane-only regression.

---

## (c) The `307/308 MUST NOT change the request method` clause — both sides of the bytes

### c.1 Campaign side: the over-assertion is in the row *and* the entry, and no gate quotes it

**Staged entry, body** (byte 948 of a 1641-byte / 30-line file):

> `- **307 / 308** — "MUST NOT change the request method", which makes them the` (line 18; the quoted
> fragment begins at byte 965)

**Staged row, teaches cell** (`assimilation/staged-row.txt`, copied byte-exact from
`SOURCES.append.md:29`; phrase at byte 376 of the row):

> `301/302 MAY rewrite a POST to GET; 307/308 MUST NOT change the method; 303 redirects with GET or HEAD; Retry-After may accompany 3xx and 503`

The same sentence propagated into the campaign's own ledger:
"307/308 must not change the method" (`lanes/tabi/round2/CANNOT-ANSWER.md:25-26`).

**No campaign gate quote supports it.** The S124 gate carries exactly two quotes
(`lanes/tabi/round2/SOURCES-PROPOSED.md:54-55`): the §15.4.4 303 sentence and the §10.2.3
Retry-After sentence. There is no 307 quote and no 308 quote anywhere in the block, and the row's
anchor cell cites `§15.4, §15.4.4, §15.4.7, §10.2.3` — **no 308 section at all**. So the 308 half
was asserted with zero located support; the campaign gate could not have caught it.

### c.2 Ground truth in the bytes the lane fetched

```
grep -n "MUST NOT change the request method" rfc9110.txt → 7494 (one hit, whole document)
grep -n "^15\.4\." rfc9110.txt →
  7230 §15.4  7365 §15.4.2  7393 §15.4.3  7411 §15.4.4
  7485 §15.4.7 = 306 (Unused)   7490 §15.4.8 = 307 Temporary Redirect   7505 §15.4.9 = 308
sed -n '7505,7540p' rfc9110.txt | grep -c "MUST NOT" → 0
```

- The single MUST-NOT is inside **§15.4.8 (307)**: "the user agent MUST NOT change the request
  method if it performs an automatic redirection to that URI" (7493-7495).
- **§15.4.9 (308)** body (7507-7523) repeats the permanent-assignment text and closes on
  heuristic cacheability; it contains no MUST-NOT.
- Preservation of 308 is supported only by implication: the 301 note (7384-7387) and the 302 note
  (7406-7409) both say "If this behavior is undesired, the 30X … status code can be used instead",
  and the §15.4 history note says 307 and 308 "were later added to unambiguously indicate
  method-preserving redirects" (7261-7262). The §15.4 rewrite step 4 is at 7306-7307.

**Therefore the staged `307/308 MUST NOT` is a campaign-side over-assertion, and it is over-strong
in the exact place the lane's own kill rule tests.**

### c.3 Lane side: both cells corrected, at both revisions of the entry

Row `S107` teaches cell (`corpus/SOURCES.md:121`):

> `301/302 MAY rewrite a POST to GET; 307 MUST NOT change the request method; … 308's preservation is an inference in this text`

Entry — the file has two states and both correct the over-assertion:

| revision | sha256 | 308 treatment |
|---|---|---|
| `6ca3b89:corpus/knowledge/redirect-and-retry-after-semantics.md` (55 lines) | `848c0321…c532e22` | "its own §15.4.9 body does NOT repeat the MUST-NOT clause … the only MUST-NOT in the redirect sections is 307's at line 7494"; "**INFERENCE, not a located normative sentence**: the exact clause for 308 lives in RFC 7538" |
| working tree (57 lines, uncommitted) | `d5878a83…9284c7d7` | same located 307 clause; 308 paragraph now cites §15.4 history "to unambiguously indicate method-preserving redirects" (§15.4, lines 7260-7264; phrase at 7262) and keeps "**INFERENCE, not a located normative sentence**" (:38) |

Entry anchors re-located by me against the committed bytes — all exact:

| entry claim | measured |
|---|---|
| §15.4.4 303 at 7413, GET-or-HEAD 7416-7418, any method 7423 | 7413 "The 303 (See Other) status code indicates that the server is"; 7416-7418 "A user agent can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)"; 7423 "This status code is applicable to any HTTP method." |
| §15.4.2 note 7384-7387 | exact |
| §15.4.3 note 7406-7409 (points at 307) | exact |
| §15.4.8 7493-7495 | MUST-NOT at 7494 |
| §15.4.9 7507-7523, no MUST-NOT | exact (0 hits in 7505-7540) |
| rewrite step 4, 7306-7307 | exact |
| §10.2.3 4805-4807, 4803-4804, 4809-4813 | exact |
| §15.4 history note 7260-7264 (working tree only) | "unambiguously indicate method-preserving" at 7262, inside the range |

### c.4 A second campaign defect the re-grounding fixed: a quote absent from the cited source

The staged entry's Retry-After bullet (byte 1102, lines 20-21) and the campaign's S124 gate
(`round2/SOURCES-PROPOSED.md:55`) both carry:

> `"Retry-After can be used with a 3xx (Redirection) or 503 (Service Unavailable) status code"`

```
grep -c "Retry-After can be used with a 3xx" rfc9110.txt → 0
grep -c "can be used with a 3xx" rfc9110.txt → 0
```

The bytes actually say: "When sent with any 3xx (Redirection) response, Retry-After indicates the
minimum time that the user agent is asked to wait before issuing the redirected request."
(4805-4807). The lane's entry quotes that located sentence instead. **Byte fact: the staged quote is
absent. Attribution: its shape is RFC 7231 §7.1.3 wording — INFERENCE; I did not fetch RFC 7231.**

This absence was already known campaign-side, in two artifacts the round-27 record does not cite:

- **The defect register.** `corpus-expansion-1/absent-defect-register.md:186` lists lane `tabi`,
  round2, `S124`, class `payload-absent`, quoting exactly
  `Retry-After can be used with a 3xx (Redirection) or 503 (Service Unavailable) status code` with
  the note "cited source, companion URLs and local artifacts were all checked; the quote is in none
  of them".
- **The round-22 quarantine verdict.** `.ufo/waves/round-22/assimilation/quarantine-verdicts.json`
  records `{"id":"S124","round":"round2","registerClass":"payload-absent","fetch":{"bytes":502906},
  "quotes":2,"located":0,"missing":2,"verdict":"absent-refused"}`.

### c.5 Third campaign defect: a section misnumber

Staged anchor says `§15.4.7 (307)` (staged entry :4; row anchor cell; campaign
`round2/SOURCES-PROPOSED.md:49`). The bytes: `§15.4.7` is "306 (Unused)" (7485); 307 is `§15.4.8`
(7490). The lane's source line reads `§15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3` — corrected.

---

## (d) Redirect ground the refusal coverage did not evaluate

### d.1 Where the refusal record actually is

Two tracked carriers, and neither is the round-27 LOG entry:

1. **Round-26 parenthetical** — "S125 pre-noted refuse as S102 duplicate, S142 pre-noted refuse as
   overlap" (`LOG.md:1878`).
2. **Round-27 lesson** (committed at `336d5d1`) — `corpus/lessons/round-27.md:27-28` states both
   refusals with reasons and flips.

`LOG.md` at `5ed6484` is 1925 lines; its round-27 entry (`:1880`) contains the intro and
`### C1 corrections` only. In the working tree (1947 lines at read) the L1 has since appended
`### C1 counter falsification` and `### C2 correction` — still no C3 section, and the only
occurrences of the four ids are `LOG.md:1834` (S107 inside the round-26 frozen C3 text) and
`LOG.md:1878` (the pre-note). So: **the refusal set is 2 rows, recorded in the lesson, with no C3
disposition section landed at the rev I read.**

**Basis check.** S142 (same `rfc9110.txt` document as S107; anchors §15.4.2–§15.4.9) is grounded:
S107's anchor cell now carries those same sections. S125's stated basis is a duplicate of lane
`S102`, which is indeed the 6265bis row (`corpus/SOURCES.md:116`) with the identical URL. Caveat:
the lesson says appending it "must trip census E04 (duplicate URL+scope)", but the two scopes are
**not** the same — lane S102 scopes "What SameSite guarantees against CSRF, and the draft's own
limit on that guarantee" (§8.8.1 body, lines 2815-2828), staged S125 scopes §5.5.7 + §5.5.7.1 +
§8.8. Whether E04 fires on URL alone is unverified here (I did not run the census gate; the L1
runs gates). The refusal itself is defensible by document identity; the stated E04 prediction is
the unverified part.

### d.2 The redirect / Retry-After family in the staged package — 13 rows, 1 adopted, 2 refused, 10 silent

Parsed from `SOURCES.append.md` (rows whose text matches redirect/Retry-After/3xx/30x/重定向/リダイレクト),
cross-checked against the lane registry by URL:

| staged id | kind | opened | used-by entry (staged) | lane disposition |
|---|---|---|---|---|
| S110 | spec (RFC 6585, 429 + Retry-After) | 2026-10-23 | rate-and-tos-signal-vocabulary.md | none |
| **S124** | spec (RFC 9110) | 2026-10-23 | redirect-and-retry-after-semantics.md | **adopted as S107** |
| S142 | spec (RFC 9110) | 2026-10-23 | redirect-status-classification.md | **refused** (overlap) |
| S162 | code (CDP Network @152) | 2026-10-23 | redirect-status-classification-r14.md | none |
| S180 | spec (Fetch Standard) | 2026-10-23 | redirect-method-rewrite-r16.md | none |
| S191 | own-work (round7 receipt) | 2026-10-24 | redirect-method-rewrite-measured-r17.md | none |
| **S193** | code (WPT @154) | 2026-10-24 | redirect-method-rewrite-measured-r17.md | **none** |
| S194 | docs (MDN zh-CN) | 2026-10-24 | redirect-method-rewrite-measured-r17.md | none |
| S206 | own-work (round9 summary) | 2026-10-24 | journey-driver-redirect-semantics-r19.md, redirect-method-by-axis-r19.md | none |
| S213 | docs (Aliyun ESA) | 2026-10-24 | redirect-method-by-axis-r19.md | none |
| S214 | community (Zenn) | 2026-10-24 | journey-driver-redirect-semantics-r19.md, redirect-method-by-axis-r19.md | none |
| S199 | own-work (round8 429 receipt) | 2026-10-24 | rate-limit-header-to-status-r18.md | none |
| S200 | own-work (round8 quota) | 2026-10-24 | `—` (package already downgraded to `queued`) | none |

Lane registry check by URL: only the two RFC 9110 rows are "already in the registry" — and only
because `S107` was just appended. **None** of the other twelve URLs/paths appears in the lane's
`corpus/SOURCES.md` (`fetch.spec.whatwg.org`, MDN redirections, aliyun, zenn, the WPT path, the
Chromium CDP path: 0 hits each). So they are new ground, not duplicates — the two refusals exhaust
the duplicate class but say nothing about the ten in-family rows left untouched.

The lane holds **one** of the seven staged redirect entries (`ls corpus/knowledge | grep -i redirect`
→ `redirect-and-retry-after-semantics.md`; 46 files total). The other six
(`redirect-status-classification`, `…-r14`, `redirect-method-rewrite-r16`,
`redirect-method-rewrite-measured-r17`, `journey-driver-redirect-semantics-r19`,
`redirect-method-by-axis-r19`) are staged and unwritten here.

### d.3 S193 — same theme family; and no, it could not have settled the 308 question

**Same family: yes, by the row's own words.**

> "The upstream executable expectation for the redirect method rewrite that **S124's normative text leaves a MAY open**" — staged S193 scope cell (`SOURCES.append.md:98`)

**Fetched and checked** (my GET, scratch `wpt-redirect-method.any.js`):

```
curl -sSL 'https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/third_party/blink/web_tests/external/wpt/fetch/api/redirect/redirect-method.any.js'
  → status=200 bytes=5277  sha256 5f176cfaa009342a54796df044136a59716913f7fa37c8cf2a2251bac07175a5
grep -c "308" wpt-redirect-method.any.js → 0
grep -n "redirectMethod(" → 94,95,96 (301 GET/POST/HEAD); 98,99,100 (302); 102,103,104 (303); 107-110 (307 GET/POST-blob/POST/HEAD, POST→POST at 108)
```

The staged teaches cell ("301, 302 and 303 turn a POST into a GET and strip the body, 307 keeps the
POST method and its body") is **accurate**, and the added 302 arm is real (line 99,
`expectedStripRequestBodyHeader: true`; the campaign's own gate quoted only 301/303/307,
`round7/SOURCES-PROPOSED.md:82-84`). But the file contains **zero** occurrences of `308`: the
executable expectation is silent on the one status in dispute. So S193 could not have corrected the
over-assertion, and it should not be blamed for not correcting it.

**Could it have been appended? No — three independent blocks, each measured:**

- **Malformed row.** S193 is one of 19 of the 148 staged rows whose cell count is not 11
  (`line 98 S193 cells 12`). The cause is visible: its `recheck` cell carries a shell pipeline
  (`curl -fsSL '…' \ | grep -c '^redirectMethod'`), and the unescaped `|` splits the row. A
  byte-exact append inherits the same class of failure the lane's E09 caught on S124.
- **Dangling `used-by`.** Its used-by names `corpus/knowledge/redirect-method-rewrite-measured-r17.md`,
  which does not exist in this lane (0 hits outside the wave report). The census gate maps a missing
  used-by path to `used_by_missing` = **E11** (`scripts/check-sources.mjs:41`, `:338`), exit 1.
- **Claim shape.** The frozen C3 claim admits *one* theme entry and *one* row (`claims.json` C3
  `declared`). S193 belongs to a different entry.

**Verdict on the "should":** S193 is in-family and was never dispositioned — that is a *record*
gap. It was not adoptable as staged, and it is byte-silent on 308, so its absence did not weaken
the claim's kill rule. The rows that actually could have borne on 308 went the same way (d.4).

### d.4 The rows that could bear on 308 — also undispositioned

- **S180, Fetch Standard** — teaches "301, 302 and 303 rewrite a POST to GET and drop the body;
  307 and 308 keep the method" (`SOURCES.append.md:85`). Its gate quotes only the 301/302/303
  steps, so "308 keeps" is carried by elimination, not by a quoted 308 sentence. Not evaluated.
- **S191, own-work wire receipt** (`lanes/tabi/round7/.work/redirect-receipt.json`, 8426 B, read
  directly): the `/hop/308` entry carries `"issued_status": 308` with the request body
  `"field=payload-308"` (lines 166-181), i.e. a measured POST surviving a 308 with its body.
- **S206, derived summary** (`lanes/tabi/round9/.work/driver-redirect-summary.txt`, 1019 B):
  `308 -> server received: POST /hop/308` and `307 -> server received: POST /hop/307`.

So the package *did* contain on-the-wire 308 evidence. The admitted entry, restricted to RFC 9110
bytes, records 308 preservation as INFERENCE — honest for its own source, but narrower than the
package. That is a coverage gap, not a falsification.

### d.5 Own-work rows point outside the target repo

Staged own-work rows cite `/home/vgpnk/Projects/shokuknow/lanes/tabi/roundN/.work/…` (S191, S199,
S200, S206). I confirmed three exist (8426 / 6620 / 1019 B), but they live in the campaign lane
tree. This lane's own-work convention is in-repo (S029 → `corpus/evidence/round-13/aria/receipt.json`;
S101 → `corpus/evidence/round-21/runtime/receipt.json`), and the registry holds **0** rows with a
`shokuknow/lanes/tabi` path (`grep -c` → 0). Adopting any of them verbatim would put a permanent
pointer at another repo's scratch tree; no refusal or deferral note mentions it.

### d.6 Schema malformation is package-wide, not S193-only

Scan of all 148 staged rows for `len(cells) != 11`: **19 rows** — S186 (14), S187, S188, S193, S211,
S215, S236, S237, S238 (13), S239 (13), S240, S241, S242, S244 (13), S245 (15), S246, S247,
S248 (13), S249. Every one carries a shell pipeline or extra `|` in a cell. S124 is **not** among
them, which is why its do-nothing arm failed on E09 (prose recheck) rather than on row shape — the
lane's `claims.json` `controlArmFalsified` note is consistent with the measured shape.

---

## Findings beyond the four asked

**F1 — The adopted row descends from a quarantine verdict, and the record says nothing was adopted.**
Staged S124 is one of the 38 tabi rows adjudicated in round 22
(`.ufo/waves/round-22/assimilation/quarantine-verdicts.json`: 38 verdicts; summary
`absent-refused 37`, `unverifiable-unreachable 1`; adoption "closed — wave-4 quarantine-first round:
verdicts only, no package row appended"). The round-27 lesson says the slice is "closed since round
22, verdicts carried — **nothing adopted from it this round**" (`corpus/lessons/round-27.md:30`).
`S107` is a transform of that quarantined S124 (title, scope, teaches all descend from it). The
statement is true only in the narrow sense that no *quarantined row* was appended — but nothing
records that re-grounding supersedes S124's `absent-refused` verdict, and no reader can tell from
the record that the source row had one. Fix: one sentence in the C3 section naming S124's round-22
verdict and stating that the fresh fetch + located quotes supersede it.

**F2 — The round-22 verdict set rests on a misaligned quote register, so "verdicts carried" carries
an artifact.** In `absent-defect-register.md`, each tabi row's quotes belong to a *neighbouring*
row. Observed instances (register line → quote → whose text it actually is):

| register row | quoted text | whose cell it is |
|---|---|---|
| `:178` S102 | `Last updated 2026-10-05 UTC` | staged S103's anchor |
| `:179` S106 | `使用 WebMCP 時，請注意下列事項` | staged S107's anchor |
| `:180` S109 | `429 Too Many Requests` / `too many requests in a given amount of time` | staged S110's teaches |
| `:181` S110 | `Add hints to your tools` / `Last updated 2026-09-01 UTC` | staged S111's anchor |
| `:187` S125 | `Rate limits for the REST API` / `About secondary rate limits` | staged S126's anchor |
| `:188` S126 | `Native messaging` / `Extension side` | staged S127's anchor |
| `:190` S131 | `WebMCP のユーザー ジャーニー` | staged S132's anchor |
| `:191` S133 | `Agent security considerations for WebMCP` | staged S134's anchor |
| `:192` S134 | `評估測試和偵錯` | staged S135's anchor |

Mechanism: [INFERENCE — an offset/association defect in the register's row→quote mapping; I did not
read the generator `absent-defect-register.py`, which writes into the fleet repo and is forbidden].
Consequence: for S110 and S142 the verdict checks *someone else's* quote, so those two
`absent-refused` verdicts are uninformative about their own rows; for S124 one of the two quoted
strings is its own teaches sentence and is genuinely absent (c.4), the other
(`enforcement), §8.8 (SameSite Cookies); draft-13 | Default enforcement is`) is a cross-cell
fragment from S125. **The in-scope bite is S110: it is the Retry-After half of this very theme
(RFC 6585, 429 + Retry-After), it was never adopted or refused, and its carried verdict was computed
from S111's quotes.**

**F3 — The two campaigns fetched RFC 9110 at different sizes.** S124's quarantine verdict records
`fetch.bytes: 502906`; the campaign's own `round2/.work/rfc9110.txt` is 502941 B (sha
`21c1cdce…`), identical to this lane's fetch. A 35-byte spread means the round-22 verdict was
computed against a different payload than the row it judges. [Observation; the cause is not
recorded anywhere I can read.]

**F10 — The carried rationale was false of this lane; the working tree now fixes it.** At `6ca3b89`
the entry kept the staged sentence "the lane's journey notes flag redirects as untested and its
approval table has no vocabulary for a redirect that changes the method" while its `ground:` line
said the opposite ("extends existing loopback 303/307 observations"). The lane's own record agrees
with `ground:`: "**NARROWED at round 6.** Redirects-with-bodies are now measured on loopback"
(`corpus/knowledge/packet-readiness-r7.md:64`), and the approval-table half is true
(`grep -ci redirect corpus/knowledge/interaction-approval-table.md` → 0). The uncommitted working-tree
edit replaces that sentence with "the lane has measured loopback redirects, including 303→GET and
307 method/body preservation, but real-site journeys remain untested by rule" — i.e. the defect is
fixed in the tree but **not in any commit yet**, and the committed `6ca3b89` version still carries it.

**F12 — The S142 "merge into the existing row" is satisfied at source level, not content level.**
S107's anchor covers §15.4.2/§15.4.3/§15.4.9, the sections S142 proposed, but S107's teaches cell
carries none of S142's URI-assignment content ("301 and 308 assign a new permanent URI; 302 is
temporary…"). That content survives only as an aside in the entry body ("the normative body of
§15.4.2/§15.4.3 describes the new-URI assignment"). Acceptable if the teaches cell is a summary;
worth knowing before anyone closes the S142 flip condition.

**Re-verified C3 receipts (re-run, not taken on trust).**

```
git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l → 1
git show HEAD:corpus/SOURCES.md | grep -c "^| S" → 107
ls corpus/knowledge | wc -l → 46
assimilation/staged-census.txt  tail → "file  E09  S124 recheck=730d (errata only)"
assimilation/xform-census.txt   tail → "file  ok  …/xform/corpus/SOURCES.md"
guard-fixture/reg → "  | S124 | indented fixture row |" ; guard-fixture/fix-collisions → "S124"
```

---

## Observation / inference / unknown

**Observed (each with its command above).** Package labels and the round-2 id; the absent rationale
field; the campaign's `opened`/`accessed` 2026-10-23 vs the lane's `opened` and `verified-at`
2026-10-25; the committed fetch 502941 B sha `21c1cdce…` identical to my re-fetch (`status=200`) and
to the campaign's `round2/.work` copy; staged entry offsets 948/965/1102; the single MUST-NOT at
RFC line 7494 and §15.4.9's silence; §15.4.7 = 306; the absent §10.2.3 quote (0 hits) plus the
register row and quarantine verdict that already recorded it; the two refusal carriers and the
absence of a C3 section in LOG at `5ed6484` (1925 lines) and in the 1947-line tree; the 13-row
family inventory and the URL checks; the WPT file (5277 B, sha `5f176cfa…`, `grep -c "308"` → 0);
S191's `/hop/308` POST with body; S206's two 308 lines; 19 malformed staged rows; E11's rule;
own-work paths outside the repo; the register misalignment instances; the entry's two hashes and
the uncommitted diff.

**Inference (marked).** The register defect is an association/offset bug (F2) — mechanism not read.
The staged §10.2.3 sentence is RFC 7231 §7.1.3 wording — not verified against RFC 7231 bytes. That
`ID-REMAP`'s S223 sentence is stale rather than a second hidden id space. That S193 "should have
been evaluated" — a coverage judgment; the byte facts are only that it is in-family, silent on 308,
malformed as staged, and dangling in `used-by`.

**Unknown.** Why S124's gate carried no sha256 when the campaign held the bytes and digest
(`round2/.work/`, `21c1cdce…`) — no note anywhere. Why the round-22 fetch of the same URL differs by
35 bytes. Whether the round-27 LOG will gain a C3/refusal section before landing (it had none at
either read). Whether any L1 decision already dispositioned S110/S180/S191/S193/S206 outside tracked
files.

**Confidence.** High on every byte, hash, count and revision claim above — each carries its command
and was re-checked against a fresh GET. High on the access-date separation (three independent lane
cells vs two campaign cells). High on the S124-quarantine lineage (verdict file read directly).
Medium on the "should" judgments in (d) and on the register mechanism (F2).

**Suggested disposition (for the L1).** (1) Add one C3 clause naming S124's round-22
`absent-refused` verdict and stating the supersession. (2) Record a disposition line for the ten
unadjudicated in-family rows — at minimum S110 (Retry-After/429), S180 (Fetch), S193 (WPT) — even if
the disposition is "deferred: requires its own entry". (3) Quote the campaign's `absent-defect-register`
rows with a one-row-alignment caveat before any future round leans on the 38 verdicts. (4) Commit
the working-tree entry fix so the `6ca3b89` rationale sentence stops being the record.
