# ReopenS020 — S020 WebMCP spec re-open: does the row still teach the truth, and is the kept anchor honest?

Seat: `TabiR16.ReopenS020` (scout, wave 2 FALSIFY). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, attacked snapshot
`b444ca8e024f386124418169e8e400221524bba3` (HEAD confirmed by `git rev-parse HEAD`).
Access date for every fetch below: **2026-10-20**. Read-only on the lane; the only lane
write is this report. No subagents, no commits, no background jobs.

Axes attacked: (1) does the row's `teaches` still hold against live bytes; (2) is retaining
anchor `f14762e6` when the page reads `cb3d1696` honest; (3) are `kind`/`tier`/`scope` honest;
(4) is the queued→mined change logged as the contract requires.

## Verdict

| Question (as asked) | Verdict |
|---|---|
| Do the quotes/`teaches` still hold? | **HOLDS** |
| Is keeping anchor `f14762e6` honest? | **HOLDS** (contract-required; truthful at that revision) |
| Are `kind`/`tier`/`scope` honest? | **HOLDS** |
| Rule 2's old→new change log (secondary, not asked) | **BREAKS as of the measured snapshot** — the round lesson that must carry it does not exist at `b444ca8` |

This is an author-side report, not non-author certification.

## 0. The row and its only in-place change

`corpus/SOURCES.md:34` today:

```
| S020 | WebMCP — https://webmachinelearning.github.io/webmcp/ | spec | A | WebMCP draft API semantics (Community Group draft) | CG-DRAFT 2026-10-16, revision f14762e6 | Grounds the native-WebMCP frontier: pages expose JavaScript tools to agents; a CG draft, not a W3C Standard | mined | 2026-10-19 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

Exact delta from the pre-round revision, split by cell:

```
$ git show e38d2599a922cb729186353830fff8e159b4fef0:corpus/SOURCES.md | grep '| S020 |' > /tmp/.../s020-before.txt
$ grep '| S020 |' corpus/SOURCES.md > /tmp/.../s020-after.txt
$ diff <(tr '|' '\n' < before) <(tr '|' '\n' < after)
9c9
<  queued
---
>  mined
12c12
<  —
---
>  corpus/knowledge/webmcp-chromium-loopback-round-16.md
```

Only `status` and `used-by` moved. `source`, `kind`, `tier`, `scope`, `anchor`, `teaches`,
`opened`, `recheck` are byte-identical. Whole-file check that no other pre-existing row was
edited in place:

```
$ git diff e38d2599a922cb729186353830fff8e159b4fef0 b444ca8e024f386124418169e8e400221524bba3 -- corpus/SOURCES.md \
    | grep '^-' | grep -v '^---'
-| S020 | WebMCP — ... | queued | 2026-10-19 | on-release | — |
$ ... | wc -l
1
```

So the "spec re-open" this round was exactly `queued→mined` plus a `used-by` fill-in — which
is the whole set rule 2 permits in place (`CORPUS.md:116-118`).

## 1. Fetch identity — the row's URL opened this session

```
$ curl -sSL -o spec.html -w 'http_code=%{http_code} size=%{size_download}\n' \
    https://webmachinelearning.github.io/webmcp/
http_code=200 size=505949
$ sha256sum spec.html
180c55bab1b7c260a054df10076a2e893a61d696f5dec2592a47f0bc6ed00d1a  spec.html
```

Observed in the served bytes:

- `spec.html:11` — `<meta content="cb3d16964ab3e92cfd5f09901ed0504373a906e8" name="revision">`
- `spec.html:6` — `<meta content="CG-DRAFT" name="w3c-status">`
- `spec.html:843-844` — `<p id="w3c-state">… Draft Community Group Report … <time class="dt-updated" datetime="2026-10-20">20 October 2026</time></p>`
- `spec.html:878` — the Status-of-this-document sentence quoted below

The 505,949-byte size and this sha256 equal wave-1's recorded snapshot
(`.ufo/waves/round-16/w1/SrcSpecCore.md:12`), i.e. the page did not move between wave 1 and
this re-open.

**Quotes supporting the `teaches` cell** (each ≤25 words, verbatim, with location):

| # | Quote | Location | Words | Supports |
|---|---|---|---|---|
| Q1 | "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents." | §Abstract, raw HTML line 872 | 13 | "pages expose JavaScript tools to agents" |
| Q2 | "It is not a W3C Standard nor is it on the W3C Standards Track." | §Status of this document, raw HTML line 878 | 14 | "a CG draft, not a W3C Standard" |
| Q3 | "Draft Community Group Report, 20 October 2026" | `#w3c-state`, lines 843-844 | 7 | the `kind: spec` / draft framing |

`teaches` survives verbatim on Q1+Q2+Q3. The row's `scope` ("WebMCP draft API semantics
(Community Group draft)") is likewise exactly what the page self-declares.

## 2. Does the `teaches` hold at the anchor revision, not just live?

The anchor pins `CG-DRAFT 2026-10-16, revision f14762e6`. GitHub Pages serves only the latest
build, so I re-opened the *source document at that commit*:

```
$ curl -sS -o f.bs https://raw.githubusercontent.com/webmachinelearning/webmcp/f14762e6/index.bs   # 87973 bytes
$ curl -sS -o c.bs https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/index.bs   # 88074 bytes
$ sha256sum f.bs c.bs
eab56a31bc3b3934308f449587929809d04d2d47d3c10a165d3a0a197258c23e  f.bs
dabc073a28a21131d6c175a0738f7554c8c6ab431c4997ce5f1450a4da834a39  c.bs
$ diff -u f.bs c.bs
@@ -9,6 +9,7 @@
 Editor: Brandon Walderman, Microsoft ...
 Editor: Khushal Sagar, Google ...
 Editor: Dominic Farolino, Google ...
+Editor: Samuel Dallstream, Microsoft ...
 Abstract: The WebMCP API enables web applications to provide JavaScript-based tools to AI agents.
```

That is the **complete** diff: one added Editor line, metadata only. At `f14762e6` the source
still carries:

```
$ grep -n '^Status:\|^Abstract:\|^partial interface Document' f.bs
5:Status: CG-DRAFT
12:Abstract: The WebMCP API enables web applications to provide JavaScript-based tools to AI agents.
651:partial interface Document {
652-  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
653-};
```

So the exact sentence that grounds the row's `teaches` (Q1) exists byte-for-byte at the
revision the anchor names, and the CG-draft status (Q2's assertion) is carried there as
`Status: CG-DRAFT`. The live delta does not touch the row's claim; it adds an editor.

**Inference, labelled:** the *rendered* page of 2026-10-16 (hence Q2's exact boilerplate
wording at that render) is not retrievable, because Pages serves only the newest build. Q2 is
observed at the live render under the same `CG-DRAFT` status; at the anchor revision only
`Status: CG-DRAFT` is observed in source, and the "not a W3C Standard" sentence is Bikeshed's
standard CG-DRAFT boilerplate (same generator family, `Bikeshed 49e9fdd4f`, line 8).
I did not verify the 2026-10-16 rendered bytes and do not claim to.

## 3. Timeline — was `f14762e6` the live revision when the row was opened?

The GitHub REST API returned `403` (rate-limited), so I took commit metadata from an
independent blobless clone instead:

```
$ git clone -q --filter=blob:none --bare https://github.com/webmachinelearning/webmcp wm.git
$ git -C wm.git show -s --format='%H%n  committer=%cI%n  subject=%s' f14762e6 cb3d16964ab3e92cfd5f09901ed0504373a906e8
f14762e63607bf96592b1a7a6392cd2b047b8209
  committer=2026-10-16T12:30:24-04:00
  subject=Editorial: sync explainers with spec (#350)
cb3d16964ab3e92cfd5f09901ed0504373a906e8
  committer=2026-10-20T12:53:18+03:00
  subject=Add new editor (#352)
$ git -C wm.git log --format='%h %cI %s' f14762e6..cb3d1696
cb3d169 2026-10-20T12:53:18+03:00 Add new editor (#352)
```

`f14762e6` (2026-10-16) → `cb3d1696` (2026-10-20) is a single commit. The row's `opened`
date is **2026-10-19**, a date on which no later commit existed, so `f14762e6` was the
repository/deploy HEAD then. The anchor is therefore accurate for the moment the row was
written, not a mis-transcription of a newer page.

The repository has since moved again:

```
$ git -C wm.git rev-parse refs/heads/main
51ed75653aaa7f174f8dbe05d1bc327359bbc57c
$ git -C wm.git log --format='%h %cI %s' cb3d1696..51ed7565
51ed756 2026-10-20T10:57:14-04:00 Discuss general agent ecosystem risks and link to agent security guidance (#334)
$ git -C wm.git diff --stat cb3d1696 51ed7565 -- index.bs
 index.bs | 55 +++++++++++++++++++++++++++++++++++++++++++++++++++++++
$ git -C wm.git show 51ed7565:index.bs | grep -n '^Status:\|^Abstract:\|^partial interface Document'
5:Status: CG-DRAFT
13:Abstract: The WebMCP API enables web applications to provide JavaScript-based tools to AI agents.
675:partial interface Document {
```

So at this moment there are **three** states of the same teaching: anchor `f14762e6`
(2026-10-16), the deployed page `cb3d1696` (2026-10-20 09:53Z), and repo main `51ed7565`
(2026-10-20 14:57Z, +55 lines of security prose and bibliography). The `teaches` sentence and
the `CG-DRAFT` status are identical in all three. "Live revision is `cb3d1696`" is true of the
served page; the source main is already one commit ahead of the deploy, and the drift is
still immaterial to this row.

## 4. Is keeping the anchor honest?

**Contract law first.** `CORPUS.md:116-118`:

> "Append-only. Only `status`, `recheck` and `used-by` change in place, and each change is
> logged old→new in the round lesson. A correction is a new row whose `teaches` opens
> `supersedes S0NN —`."

Changing `anchor` in place is forbidden, even to the newer revision. Retaining `f14762e6` is
therefore not a tolerated shortcut — it is the only compliant move for a re-open that leaves
the `teaches` unchanged. Wave 1's own draft proposed *replacing* the S020 line, including the
anchor, the scope, the teaches and `opened` (`.ufo/waves/round-16/drafts/DraftSources.md:12`);
L1 did **not** integrate that replacement. That is the right call against rule 2, and it
explains why the anchor is old while the note is new.

**Truth second.** The anchor remains a true statement about the revision it names: the
`teaches` sentence and the CG-draft status both verify at `f14762e6` (§2). An anchor is "where
the claim was checked", not "current HEAD"; this one still checks.

**Disclosure third.** The newer revision is recorded where the trail is followed: the
`used-by` note cites `§4.1, rev cb3d1696` (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:77`)
and the SOURCES search log records that L1 re-fetched S020 this round
(`corpus/SOURCES.md:76`). Nothing in the row asserts that `f14762e6` is current; it asserts
that a CG draft at that revision teaches what it teaches. Both halves are true.

**Two residual weaknesses, neither a falsehood:**

1. *Anchor shape.* `CORPUS.md:99` defines `anchor` as "exact section / heading / page / line
   plus revision". S020's anchor carries date + revision but no in-document locator — it pins
   the whole document, not a section. The `teaches` is therefore section-located only via the
   used-by note (§4.1/§4.4), not via the row. This is a pre-existing shape deviation from
   kaika round 1 and is unfixable in place under rule 2; the compliant repair, if wanted, is
   a `supersedes` row. I did not create one (leaves only; L1 owns the registry).
2. *Recheck cadence.* `recheck: on-release` is the only `spec` row using that cadence (S005,
   also a spec, uses `90d`). The page rebuilt twice in four days and `on-release` gave no
   trigger; the re-open happened because of this round, not the cadence. Harmless here
   because the teaching survived, but the cadence is weak for a continuously deployed CG
   draft. Not a contract violation — `on-release` is in the allowed vocabulary.

## 5. `kind` / `tier` / `scope` honesty

- `kind: spec` — the document self-identifies as `CG-DRAFT` / "Draft Community Group Report"
  (lines 6, 843-844). A Community Group draft is a specification document; the enum allows
  `spec` and the row does not dress it as a Recommendation.
- `tier: A` — `CORPUS.md:93-95`: "A: primary or authoritative for that scope (spec, …)".
  S020 is the WebMCP editors' own document, i.e. the primary source for WebMCP API semantics.
  `community is never A` is untouched: this row is `spec`, not `community`.
- `scope` — "WebMCP draft API semantics (Community Group draft)" is exactly the narrowing that
  makes tier A defensible, and it repeats the draft qualifier a third time (source title,
  scope, teaches). No tier inflation.
- `status: mined` — `CORPUS.md:103` requires "cited by ≥1 path in `used-by`". The used-by note
  exists, opens with `source: S020` (line 1), cites `S020 §4.1` (lines 24, 77) and names S020
  in its spec table (line 75). The mined flip has a real citation behind it, not a bookkeeping
  convenience.

Structural checks run from the lane root:

```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
exit=0

$ grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
39
$ awk -F'|' '…status histogram…' corpus/SOURCES.md
mined=32 queued=3 rejected=4
$ …mined used-by existence loop…
(no output; every mined used-by path exists)
```

## 6. Rule 2's logging obligation — the one real failure at this snapshot

Rule 2 says each in-place change "is logged old→new in the round lesson". At the measured
revision there is no round-16 lesson:

```
$ git cat-file -e b444ca8e024f386124418169e8e400221524bba3:corpus/lessons/round-16.md
fatal: path 'corpus/lessons/round-16.md' does not exist in 'b444ca8e024f386124418169e8e400221524bba3'
exit=128
$ ls corpus/lessons/round-16.md
ls: cannot access 'corpus/lessons/round-16.md': No such file or directory
exit=2
$ git ls-files | grep -i 'lessons/round-16'
(no output)
```

The only round-16 lesson-shaped files are `.ufo/waves/round-16/drafts/DraftLesson.md` (its
own line 1: "draft for L1; not a lesson file") and `.ufo/waves/round-16/w1/DraftLesson.md`;
neither contains `S020`, `queued`, `mined`, `f14762e6` or `cb3d1696` (`grep -n -i … | head`
returned nothing). `.ufo/waves/round-16/PLAN.md:112` assigns `corpus/lessons/round-16.md` to
L1, and `:95` says "S020 WebMCP spec re-open (queued→mined if it backs the note)". So the
transition is *planned* to be logged but is **not logged at the snapshot** the counters were
measured on.

**Verdict on that clause: BREAKS as of `b444ca8`** (absent, not merely unverifiable). Caveat:
if the round lesson is by design a post-measurement L1 artifact, the obligation is pending
rather than violated — but at the attacked revision the corpus cannot show its own old→new
record. This is a bookkeeping gap, not a false statement in the row: the facts the row and
note assert are independently true (§1-§3).

## 7. Adjacent observation (routed, not charged to this row)

The used-by note's Spec-vs-build table says the events are in `§4.2`
(`corpus/knowledge/webmcp-chromium-loopback-round-16.md:79`). The live spec has
"Events" at **§4.3** (`spec.html:2180`, `data-level="4.3" id="events"`), while §4.2 is
"ModelContext Interface" (`:1503`). §4.1 and §4.4 cites in the same note are correct. This
mislabel does not touch S020's `teaches`; it belongs to the note-attack seats
(`AttackNoteSpecTable`, `AttackSourcedClaim`).

## 8. Confidence and remaining unknowns

- **High confidence** on: served bytes and revision (`sha256 180c55ba…`, meta line 11); Q1/Q2/Q3
  presence and wording; the one-line `f14762e6→cb3d1696` delta (my own raw fetch and `diff`);
  the commit timeline and newer main (`51ed7565`); the S020 row being the only in-place edit;
  `check-sources` clean; lesson absence at `b444ca8`.
- **Medium confidence / inference:** that `f14762e6` was the Pages build on 2026-10-19 (derived
  from commit dates: no commit between 2026-10-16 and 2026-10-20, and Pages rebuilds on push);
  that Q2's exact sentence was in the 2026-10-16 render (Bikeshed CG-DRAFT boilerplate; not
  directly observed). The round-1 fetch digest `a8f75790…` recorded at
  `corpus/lessons/kaika-fleet-round-1.md:63` could not be reproduced because that build is no
  longer served.
- **Unknown:** whether L1 intends `corpus/lessons/round-16.md` after measurement (PLAN says L1
  writes it; it is absent here). Whether anyone will add a `supersedes` row to give S020 a
  section-located anchor — not required by this round's claims, and not written by me.

## 9. Tooling

No tools installed or upgraded. Used the host's `curl`, `git`, `python3`, `diff`/`cmp`/`awk`
only. Pacman was not invoked. (`api.github.com` returned HTTP 403 rate-limit; a
`--filter=blob:none` clone was used instead and is recorded above.)
