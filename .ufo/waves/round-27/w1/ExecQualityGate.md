# ExecQualityGate — C3 artifact mechanical check (round 27, wave 1)

Scope: item-assigned mechanical verification of the two admitted C3 artifacts only —
`corpus/knowledge/redirect-and-retry-after-semantics.md` and the `S107` row in
`corpus/SOURCES.md`. Read-only. Nothing tracked was modified; no gate, build, linter or
formatter was run (L1 owns the post-integration run). No tool was installed or upgraded.

## 0. Measurement bindings (fix these first; the live tree moves)

| Binding | Value | Command |
|---|---|---|
| Lane HEAD | `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` | `git rev-parse HEAD` |
| Entry blob at HEAD | `95627a7b8e08720ed80845e4d883d5b7de1d0679`, 3752 B, sha256 `848c032117d199904fed6da98d38a9fe55d8ca93562d890dbf1971511c532e22` | `git rev-parse HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`; `git show HEAD:<path> > …/scratch/ExecQualityGate/entry-HEAD-5ed6484.md`; `sha256sum` |
| SOURCES blob at HEAD | `2f2034d` (prefix; `git diff` index line), 169 lines, scratch copy sha256 `30cd6a49e518065cf7600eff4b8f794a4b6e7a1608a4aed6daf6d6ccc3860bc3` | `git show HEAD:corpus/SOURCES.md > …/scratch/ExecQualityGate/SOURCES-HEAD.md` |
| RFC bytes | `.ufo/waves/round-27/assimilation/rfc9110.txt`, 502941 B, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`, git-**tracked** | `sha256sum <path>`; `wc -c <path>`; `git ls-files --error-unmatch <path>` |
| C3 landing commit | `6ca3b89` (lesson `corpus/lessons/round-27.md:22`), ancestor of HEAD | `git merge-base --is-ancestor` |

All three row/entry claims about the source bytes hold: entry `source:` line and row
`anchor` cell both state **502941 B / sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a**,
and that is exactly what the committed, tracked byte file hashes to.

### 0.1 Concurrent-edit observation (not a C3 defect; affects any live-path reading)

The live worktree paths were **being edited by sibling seats during this window**. Evidence
(`git status --porcelain corpus/`, `stat -c '%y %s'`, `sha256sum`):

| Time (mtime) | Path | Size | sha256 / blob | State |
|---|---|---|---|---|
| 14:38:16 | entry | 3945 B | blob `646af92` | mid-write: contained a **duplicated** `  (line 7423).` line |
| 14:38:32 | entry | 3945 B | 5479e352… | 308 paragraph rewritten |
| 14:38:34 | entry | 3888 B | d5878a83…, blob `086271e` | current; `SOURCES.md` also now `M` |
| (same) | SOURCES row 121 | 977→? | blob `03dd2fc` | `S107` row rewritten (adds "§15.4 historical note at 7260-7264") |

Consequence: **every verdict below binds the HEAD blobs** (`entry 95627a7`, `SOURCES 2f2034d`).
Measurements taken on a live path in this window are not reproducible after the sibling edit.
I did not judge the in-flight rewrite; I record only that duplication of `(line 7423).` was
observable in one intermediate state and was gone in the next. Drift continued after this
report was written: at 14:40 `git status --porcelain corpus/` additionally showed
`M corpus/README.md` and `M corpus/lessons/round-27.md`, and HEAD was still
`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`.

## 1. Entry `corpus/knowledge/redirect-and-retry-after-semantics.md` (HEAD blob 95627a7)

Bar applied: the lane's own — front-matter trio (`source:`/`verified-at:`/`recheck:`),
`ground:` line, explicit Unknowns, `INFERENCE` label, and `^source: S107 ` matching the
frozen counting regex (`claims.json:54`); quote bar from `corpus/SOURCES.md:6` ("≤25-word
quote with location") plus the stricter lane form recorded at
`corpus/knowledge/webmcp-completion-lifecycle-round-20.md:22` ("literal substring of one
source line … at most 25 whitespace words").

| Check | Result | Evidence |
|---|---|---|
| `source:` present, correct form | **PASS** | L3; `grep -cE '^source: S107 '` → `1`; `re.search(r'(?m)^source: S107 ')` → True |
| `verified-at:` present | **PASS** | L4 = `verified-at: 2026-10-25` |
| `recheck:` present | **PASS** | L5 = `recheck: 730d — …` |
| `ground:` line present | **PASS** (content questioned, O2) | L6 |
| Explicit Unknowns | **PASS** | L52 `**Unknowns (kept separate):**` … L55 |
| `INFERENCE` label present | **PASS** | L36 `**INFERENCE, not a located normative sentence**` (also L54 "is an inference") |
| Counting predicate `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | **PASS = 1** at HEAD | output: `HEAD:corpus/knowledge/redirect-and-retry-after-semantics.md`; also `0` at `5577d1b` and `0` at baseline `f185b4e` (harmless: it reads `<REV>` = delivered tip) |
| Rendered-byte check | **n/a — no such gate exists**; `grep -rn "25\|quot" scripts/*.mjs` shows only `check-adjacency.mjs` enforces 4..25 words, and only for adjacency-map fields, not `knowledge/` entries |

### 1.1 Quote census against the RFC bytes (all 9 double-quoted spans in the body)

Method: `re.finditer(r'"([^"]*)"')` on the entry; each span whitespace-normalized
(`re.sub(r'\s+',' ',s)`) and searched in (a) whitespace-normalized RFC, (b) the RFC block
with table markup stripped (`|` and `*Note:*` removed). Word count = `len(norm.split())`.

| Entry line | Words | Found in RFC bytes | Span (trimmed) |
|---|---|---|---|
| L13 | 19 | yes (whitespace-normalized) | "The 303 (See Other) status code indicates that the server is redirecting…" |
| L15 | 16 | yes | "can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" |
| **L19-23** | **34** | **only after stripping `|`/`*Note:*` table markup** | "For historical reasons, a user agent MAY change the request method from POST to GET…" |
| L24 | 4 | **absent** — lane's own gloss ("the form was POSTed"), not offered as a spec quote | — |
| L26 | 18 | yes | "the user agent MUST NOT change the request method if it performs an automatic redirection to that URI" |
| L32 | 13 | yes | "Change the request method according to the redirecting status code's semantics, if applicable" |
| **L35** | 5 | **absent verbatim** (case + `|` in the source: RFC 7385 ends `If`; 7386 starts `|  this behavior is undesired,`) | "if this behavior is undesired" |
| L39 | 25 | yes (exactly at the cap) | "When sent with any 3xx (Redirection) response, Retry-After indicates…" |
| L49 | 3 | **absent** — lane's own gloss ("a redirect happened") | — |

Raw (byte-exact) substring test: **0 of 9** spans occur in the bytes as written — the RFC is
hard-wrapped and wraps both notes in a `|  *Note:*` table block, so verbatim identity is only
reachable after whitespace/markup normalization at every line. Reported as a class, not a
per-quote defect.

**V1 — VIOLATION (lane quote-length bar).** Entry L19-23: 34 whitespace words against the
≤25-word cap (`corpus/SOURCES.md:6`). This is the only span over the cap; L39 is 25 (pass,
zero headroom). `max(words)=34`.

**V2 — VIOLATION (lane quote-fidelity bar, as the frozen claim words it).** The same span
(L19-23) and the fragment at L35 are not literal substrings of the fresh bytes. They are
token-identical only after deleting the RFC's table markers and the `*Note:*` label
(verified: `"For historical reasons … used instead."` ∈ stripped 7384-7387 block = True;
∈ whitespace-normalized full text = False). Two further points:
- The frozen kill rule recorded at `corpus/lessons/round-27.md:41-43` reads "if any quote the
  admitted entry rests on is absent from this round's fresh bytes, the entry is refused".
  Under a byte-exact reading the note quote **is** absent, so the kill rule as written would
  refuse this entry; it is rescued only by a normalized-match reading that the claim text
  does not state. That normalization reading should be written into the claim/lesson or the
  quote should be reduced to a single-line, ≤25-word fragment.
- The round-27 Gate/M1 text itself rests on the L35 fragment (`round-27.md:45`), so the same
  finding propagates into the lesson.

**V3 — border (anchor line ranges include a trailing blank line).** Entry cites
"§15.4.9 … lines 7507-7523" but the section body ends at 7522 and 7523 is blank; and
"Value = HTTP-date or delay-seconds (lines 4809-4813)" where 4809-4810 is the sentence,
4812 the ABNF, 4813 blank. Off-by-one-trailing-blank only; every cited *opening* line is
exact. Sweep used: `awk 'NR>=7507&&NR<=7526'`, `awk 'NR>=4805&&NR<=4813'` on the RFC bytes.

**PASS items verified at the cited lines** (each line printed from the RFC bytes):
- L13-14 "§15.4.4, lines 7413-7414" → 7413 `The 303 (See Other) status code indicates that the server is`; 7414 `redirecting the user agent to a different resource, as indicated by a` ✓
- L15-16 "(lines 7416-7418)" → 7416 contains `A user agent can perform`, 7417 `a retrieval request targeting that URI (a GET or HEAD request if`, 7418 `using HTTP), …` ✓
- L17 "(line 7423)" → `This status code is applicable to any HTTP method.` ✓
- L23-24 "§15.4.2 note, lines 7384-7387" and "§15.4.3 at lines 7406-7409, pointing at 307" → 7384/7406 `|  *Note:* For historical reasons…`; 7386 `308`, 7408 `307` ✓ (the two notes are not literally "identical" — 308 vs 307 — but the entry's own qualifier is the correction; observation only)
- L27-29 "§15.4.8, lines 7493-7495" → 7493-7495 carry the MUST-NOT sentence ✓
- L30-32 "the only MUST-NOT in the redirect sections is 307's at line 7494" → **negative-claim sweep**: `awk 'NR>=7230&&NR<=7531 && /MUST NOT/'` returns exactly `7494`; the only other `MUST` line in §15.4 (7230-7531) is 7456 `MUST generate` (a wider 7270-7560 window additionally hits 7552 `MUST send`, which lies in §15.5 starting at 7532) ✓
- L33-34 "step 4, lines 7306-7307" → 7306 `4.  Change the request method according to the redirecting status`, 7307 continuation ✓
- L41-43 "§10.2.3, lines 4805-4807" → 4805-4807 verbatim ✓; "with 503 … (lines 4803-4804)" → 4803 `sent with a 503 (Service Unavailable) response, Retry-After indicates`, 4804 `how long the service is expected to be unavailable to the client.` ✓
- §10.2.3 is indeed `10.2.3.  Retry-After` at RFC line 4799 ✓

**O2 — observation (ground-line content, not a formal bar violation).** HEAD's `ground:`
says "the redirect rules the lane's driver has never asserted". The lane does carry a
measured redirect in a journey: `corpus/evidence/w4-t41-network/net-journey.mjs:3`
(`index.html -> click /go (302) -> async.html`) and `corpus/lessons/round-6.md:51`
("the redirect chain measured across all three network surfaces"); what is *not* landed is
the state-changing 303/307 step (`corpus/lessons/round-7.md:33` marks
"redirect-after-POST 303 vs 307" **NOT LANDED**). The sentence therefore needs to say
"the redirect *method-rewrite rules*", or the in-flight rewrite (which asserts existing
"303→GET and 307 method/body preservation" loopback observations) needs an evidence pointer
of its own, because round 7 records that step as not landed.

## 2. Registry row `S107` — `corpus/SOURCES.md:121` (HEAD blob 2f2034d)

Header read by name at `corpus/SOURCES.md:13`
(`id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`).

| Check | Result | Measured |
|---|---|---|
| Cell count = 11 | **PASS** | `row.split('|')` → 13 parts with `parts[0]==''` and `parts[-1]==''` ⇒ exactly 11 cells |
| No literal `|` inside any cell | **PASS** | same split (an embedded pipe would add a part); `any('|' in c for c in cells)` → False |
| `status` = `mined` | **PASS** | cell 8 = `mined` |
| `opened` = `2026-10-25` | **PASS** | cell 9 = `2026-10-25` |
| `recheck` = `730d` | **PASS** | cell 10 = `730d` |
| `used-by` lists exactly the entry path | **PASS** | cell 11 = `corpus/knowledge/redirect-and-retry-after-semantics.md` (single path; `grep -c 'redirect-and-retry-after-semantics' corpus/SOURCES.md` → 1, so no second row reuses it) |
| Row id unique, URL unique | **PASS** | `grep -c '^| S107 '` → 1; `grep -c 'rfc9110.txt'` → 1 |
| Quoted spans in the row, ≤25 words each | **PASS, vacuously** | `row.count('"')` → 0; anchor cell and teaches cell carry no double-quoted spans (`dq=0` per cell). Word counts of the cells themselves (scope 25, anchor 54, teaches 35) are not quotes and are not capped |
| Anchor cell's located references resolve | **PASS** | 7413 / 7416-7418 / 7384-7387 / 7406-7409 / 7493-7495 / 7507-7523 / 7306-7307 / 4805-4813 each verified at the cited RFC lines (see §1); `7507-7523` and `4805-4813` share the trailing-blank-line looseness noted in V3 |
| Byte/sha claim | **PASS** | `502941 bytes, sha256 21c1cdce…` matches `sha256sum`/`wc -c` of the tracked assimilation file |
| Row position/appendix | **PASS** | row is line 121, immediately before `## Paths` (line 122), so the append did not disturb the section |

No violation was found in the registry row at HEAD.

## 3. Observation / inference / unknown separation

- **Observation (measured):** everything in §1.1, §0.1 and §2 tables; every number above
  carries its command.
- **Inference:** the sibling rewrite in §0.1 is an attempt to repair V1/V2 and O2 (it drops
  the 34-word quote's companions, reworks the 308 INFERENCE onto the §15.4 history note at
  7260-7264 — that note does exist and does say 307/308 "were later added to unambiguously
  indicate method-preserving redirects", verified against the bytes). I did not verify or
  judge that rewrite; it was mid-flight and its own quote lengths/citations must be re-gated.
- **Unknown:** whether the L1's post-integration gate set (`check-*`) would catch V1 — no
  lane gate in `scripts/` parses `knowledge/` entry quotes for the 25-word cap
  (`grep -rn "25\|quot" scripts/*.mjs`), so on current instruments **V1/V2 are reviewer-only
  findings, not gate-caught**.
- **Not run (intentional):** any gate/build/test (`check-sources.mjs`, census, selftests,
  `node` runs), any git write, and the shokuknow scripts (`quote-lint.py` etc.) per contract.

## 4. Bottom line

- Entry front-matter trio, `ground:`, Unknowns, `INFERENCE`, and the frozen counting predicate
  (`= 1` at HEAD): **all pass**.
- One **enforceable violation**: a 34-word quote (V1, cap 25) — the only over-cap quote in the
  entry.
- One **fidelity violation as the frozen kill rule is worded**: the 301/302 `*Note*` quote and
  its `"if this behavior is undesired"` pointer are not byte-verbatim (RFC table markup);
  they resolve only under table-stripped normalization, which the claim text does not state —
  and the round-27 lesson itself rests on the same fragment.
- Registry row S107: **all checks pass** (11 cells, `mined`, `2026-10-25`, `730d`, exact
  single `used-by`, no embedded pipes, no quoted spans to cap).
