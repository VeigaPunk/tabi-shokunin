# ReopenS039 — S039 rejection reason and flip

Seat: `TabiR16.ReopenS039` (leaf scout). Date: 2026-10-20. Lane root:
`/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Contract read: `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:64-155`
(SOURCES contract v1). Lane was read-only; all fetches/clones went to `/tmp`; only this report
was written.

## 1. The row under attack

`corpus/SOURCES.md:53`, cells parsed with awk (command in §5):

```
id=S039
source=WebMCP just landed in Chrome 146 — https://bug0.com/blog/webmcp-chrome-146-guide
kind=community
tier=C
scope=WebMCP API surface and local flag recipe as of 2026-02-11
anchor=post published 2026-02-11, §How it actually works para 1 and tldr
teaches=REJECTED: asserts the API lives at navigator.modelContext, contradicted by S020 §4.1, S033 and the observed 154 surface; flip: a dated spec or build exposing a Navigator partial
status=rejected
opened=2026-10-20
recheck=on-release
used-by=—
```

## 2. Verdict

**BREAKS.** The reason's factual predicate is true (the post does assert the claim, and the
three cited sources are real and do say `Document`), but the rejection is anachronistic against
the row's own `as of 2026-02-11` scope: on the post's date both the spec and the Chrome 146
build exposed `navigator.modelContext`. The stated flip — "a dated spec or build exposing a
Navigator partial" — is already satisfied twice, so it is not a condition that can change the
verdict; the row is self-inconsistent. The `rejected` status can survive only if the row is
re-grounded as *stale/superseded*, not *wrong* (a superseding row per contract rule 2).

## 3. Attack A1 — evidence (all opened by me 2026-10-20)

### 3.1 The post asserts the rejected claim — TRUE

| Quote (≤25 words) | Location | Method |
|---|---|---|
| "The API lives at navigator.modelContext." | §How it actually works, para 1 | `curl` + tag-strip of `https://bug0.com/blog/webmcp-chrome-146-guide`; also `read` (native) |
| "Chrome 146 ships a flag-gated preview of WebMCP." | tldr deck | same |
| "A W3C standard that lets any web page register structured tools for AI agents" | tldr deck | same |

Page metadata observed: `datePublished=2026-02-11T06:06:40.926Z`, `dateModified=2026-02-11T06:06:40.926Z`
(unchanged since publication). The row's anchor ("post published 2026-02-11, §How it actually
works para 1 and tldr") is exact: the quoted sentence is the first sentence of that section.

### 3.2 The row's current-source citations are real — TRUE

| Source | Observed 2026-10-20 |
|---|---|
| S020 §4.1 (live `https://webmachinelearning.github.io/webmcp/`) | Heading "4.1. Extensions to Document"; IDL: `partial interface Document { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };`; `navigator.modelContext` occurrences in the page text: **0**; masthead "Draft Community Group Report, 20 October 2026"; SOTD "It is not a W3C Standard nor is it on the W3C Standards Track." |
| S033 (Chromium tag 154.0.8037.97 `model_context_supplement.idl`) | `partial interface Document` at lines 10-12; sha256 `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` = the row's `50dd337d…6364`, so the anchor is intact |
| "observed 154 surface" | `.ufo/waves/round-16/PLAN.md:18-24`: `document.modelContext` present, `'modelContext' in navigator` false with the WebMCP feature set. Author-side record; **not re-executed by me** (no probe/harness run — outside my contract) |

So the row's "contradicted by …" is true **of today's sources**. That is not the defect.

### 3.3 The dated record at the post's own scope says `Navigator` — the defect

Repository `webmachinelearning/webmcp` (cloned, all commits read locally):

| Artifact | Date | Observed |
|---|---|---|
| Last `index.bs` revision before the post's timestamp (`e1439bb`, rev-list before `2026-02-11T06:06:41Z`) | committed 2026-02-10 | `index.bs:116-118`: `partial interface Navigator { [SecureContext, SameObject] readonly attribute ModelContextContainer modelContext; };` |
| `98b1ba3` — last `index.bs` revision before 2026-02-12 | 2026-02-11T16:28:32-05:00 | `index.bs:120-122`: `partial interface Navigator { [SecureContext, SameObject] readonly attribute ModelContext modelContext; };`; `ModelContext` declares `provideContext`, `clearContext`, `registerTool`, `unregisterTool` |
| Initial draft `92080f3` | author 2026-01-21 (committer 2026-01-26) | already `partial interface Navigator { … ModelContextContainer modelContext; }` |
| `c7b5c70` "Move the `modelContext` getter to `Document` (#184)" | 2026-05-27 | `index.bs | 62 ++++…` (16 insertions / 46 deletions); this is the commit that removes the `Navigator` partial |

`git log -S 'partial interface Navigator' -- index.bs` returns exactly two commits:
`92080f3` (initial draft) and `c7b5c70` (the removal) — i.e. the `Navigator` binding existed in
every spec revision from 2026-01-21 to 2026-05-27, including the post's date.

Chromium build evidence, independent of the spec and of deployment timing:

| Build | Observed |
|---|---|
| Chrome 146 Dev `146.0.7670.2`, chromium commit `e1b69f34`, released 2026-02-06T17:33:38Z (five days before the post) | `third_party/blink/renderer/core/script_tools/model_context_supplement.idl:5-10`: `[ RuntimeEnabled=WebMCP, ImplementedAs=ModelContextSupplement ] partial interface Navigator { [Replaceable] readonly attribute ModelContext modelContext; … };`; `model_context.idl` declares `registerTool`, `unregisterTool`, `provideContext`, `clearContext` |
| Chrome 154 tag `154.0.8037.97` | `partial interface Document` (S033, digest above) — the later state |

Chrome 146 **stable** reached 146.0.7680.71 on 2026-03-10 (after the post); the post's "Chrome 146"
is the DevTrial milestone, which Chrome Status itself places at 146 (below).

### 3.4 Chrome Status corroborates the post's other dated claims (background, not the row's ground)

`https://chromestatus.com/api/v0/features/5117755740913664` (updated 2026-09-28):

- stage_type **130** (dev trial): `desktop_first=146`, `android_first=146`
- stage_type **150** (origin trial): `desktop_first=149`, `desktop_last=156`
- `flag_name = "Experimental Web Platform features"`

Thus the post's "Chrome 146 ships a flag-gated preview" and its "Experimental Web Platform
Features" flag step are both corroborated by Chrome's own tracker; the 146-vs-149 contrast in
`SrcRejects.md` conflates two different stages (dev trial vs origin trial). The post's code
(`navigator.modelContext.registerTool(...)`) matches the 146 Dev build's `ModelContext.registerTool`.

### 3.5 The one claim in the post that was already false at publication

The tldr's "A W3C standard …" was false on 2026-02-11: the spec metadata at `98b1ba3` reads
`Status: CG-DRAFT`, `Group: webml`, and today's SOTD says "It is not a W3C Standard nor is it on
the W3C Standards Track." The row's anchor already cites the tldr but its `teaches` does not use
this defect; it is a true, date-independent ground that could carry a corrected rejection.

## 4. Why the rejection reason is not true at the row's scope

The row's `scope` cell is dated: "WebMCP API surface and local flag recipe **as of 2026-02-11**".
For that scope the post's sentence was correct — the published spec draft (last pre-post revision
`e1439bb`, and `98b1ba3` later the same day) declared `partial interface Navigator`, and the
Chrome 146 Dev build of 2026-02-06 declared the same global with the same `registerTool` method.
The three sources the row cites (S020 at the 2026-10-16/20 revision, S033 at tag 154, the 154
observation) all post-date the API's move to `Document` by 5–8 months; they contradict the post
**today**, not at its date. "Contradicted" therefore mischaracterises a date-correct claim as
wrong, when the accurate defect is "superseded on 2026-05-27 (c7b5c70)". This is exactly the
distinction the lane's own knowledge note already draws: `webmcp-chromium-loopback-round-16.md:77`
calls `navigator.modelContext` "stale guidance", and `SrcSpecCore.md:155-162` records the move
date — neither says the claim was false when written.

## 5. Why the flip is not sound

The flip is "a dated spec or build exposing a Navigator partial". That condition is met, twice,
by artifacts dated **at or before** the post:

- spec `98b1ba3` (2026-02-11): `partial interface Navigator { … attribute ModelContext modelContext; }`
- Chromium `146.0.7670.2` / `e1b69f34` (2026-02-06): `partial interface Navigator { … attribute ModelContext modelContext; }`

A flip that is already satisfied cannot be "what would change the verdict" (contract rule 1:
rejected rows read `REJECTED: <reason>; flip: <what would change the verdict>`). The row is
internally inconsistent: it rejects a claim while its own flip condition is present in the
record it cites by date. If the author intended "a **current** dated spec or build", the flip
does not say so and the reason still lacks the temporal qualifier.

## 6. Tier / kind / scope audit per contract v1

- `kind=community` — valid enum; the source is a community blog. Correct.
- `tier=C` — valid and honest: the contract forbids A for `community`, and C is "lead only".
  No tier inflation. Rejected-at-C is coherent.
- `anchor` — exact section + paragraph plus the publication date as revision. Passes the
  "never a bare homepage" rule.
- `scope` — honest as a label (topic + date), but semantically in conflict with the reason:
  the reason uses post-date sources against a date-scoped claim. This mismatch is the defect.
- `status=rejected`, `recheck=on-release`, `used-by=—` — all valid for a rejected row.
- Structural census: `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=39
  tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0`, exit 0.
- Rule 2 (append-only): a corrected reason cannot be an in-place edit of `teaches`; it must be a
  new row whose `teaches` opens `supersedes S039 —`.

## 7. Repair path for L1 (not performed by me)

A new row (next unused id) whose `teaches` opens `supersedes S039 —`, e.g.:

> supersedes S039 — REJECTED (stale, not false): the post's `navigator.modelContext` claim matched
> the spec at publication (`e1439bb`, `98b1ba3`) and the Chrome 146 Dev build
> (`146.0.7670.2`); the getter moved to `Document` on 2026-05-27 (`c7b5c70`), and the tldr's
> "A W3C standard" was already false (CG draft, `Status: CG-DRAFT`); flip: a current (≥154) spec
> or build exposing a `Navigator` partial, or a post update correcting the namespace and status.

If the wave wants to keep exactly one row, an alternative is to leave S039 rejected but record
the superseding row as the operative reason (append-only is not optional).

## 8. Commands and observed outputs

1. Row cells:
```
$ awk -F'|' 'NR==53{...}' corpus/SOURCES.md
id=S039
source=WebMCP just landed in Chrome 146 — https://bug0.com/blog/webmcp-chrome-146-guide
kind=community
tier=C
scope=WebMCP API surface and local flag recipe as of 2026-02-11
anchor=post published 2026-02-11, §How it actually works para 1 and tldr
teaches=REJECTED: asserts the API lives at navigator.modelContext, contradicted by S020 §4.1, S033 and the observed 154 surface; flip: a dated spec or build exposing a Navigator partial
status=rejected
opened=2026-10-20
recheck=on-release
used-by=—
```

2. Gate:
```
$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
exit=0
```

3. Post:
```
$ curl -sSL https://bug0.com/blog/webmcp-chrome-146-guide | python3 -c "…strip tags…"
The API lives at navigator.modelContext. Develope…
tldr: Chrome 146 ships a flag-gated preview of WebMCP. A W3C standard that lets any web page reg…
datePublished: ['2026-02-11T06:06:40.926Z']  dateModified: ['2026-02-11T06:06:40.926Z']
```

4. Spec history:
```
$ git clone --quiet https://github.com/webmachinelearning/webmcp.git s039-spec
$ git log --format='%h %aI %s' -S 'partial interface Navigator' -- index.bs
c7b5c70 2026-05-27T08:04:31-07:00 Move the `modelContext` getter to `Document` (#184)
92080f3 2026-01-21T17:43:02+02:00 Add initial spec draft and set up CI/CD

$ git rev-list -1 --before=2026-02-11T06:06:41Z HEAD -- index.bs   # post timestamp
e1439bbdc74ac681e5b024c41ff40d74f55c4957
$ git show e1439bb:index.bs | sed -n '116,118p'
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute ModelContextContainer modelContext;
};

$ git show 98b1ba3:index.bs | sed -n '120,122p'
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
};

$ git show 98b1ba3:index.bs | sed -n '1,7p'
Title: WebMCP
Shortname: webmcp
Level: None
Status: CG-DRAFT
Group: webml
```

5. Current S020 and S033:
```
$ curl -sSL https://webmachinelearning.github.io/webmcp/ | python3 -c "…tag-strip…"
navigator.modelContext count = 0
'partial interface Document {\n  [SecureContext, SameObject] readonly attribute ModelContext modelContext;\n};'
"Draft Community Group Report, 20 October 2026"
"It is not a W3C Standard nor is it on the W3C Standards Track."

$ curl -sSL 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT' | base64 -d | sha256sum
50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364  -
```

6. Chromium 146 Dev build:
```
$ curl -sS 'https://chromiumdash.appspot.com/fetch_releases?channel=Dev&platform=Linux&num=1&milestone=146'
146.0.7670.2 e1b69f3442bc215bd78dc42426c6b3232b5cd8be 2026-02-06T17:33:38.713000+00:00 Dev
$ curl -sS https://raw.githubusercontent.com/chromium/chromium/e1b69f3442bc215bd78dc42426c6b3232b5cd8be/third_party/blink/renderer/core/script_tools/model_context_supplement.idl | sed -n '5,11p'
[
  RuntimeEnabled=WebMCP,
  ImplementedAs=ModelContextSupplement
] partial interface Navigator {
  [Replaceable] readonly attribute ModelContext modelContext;
  [Replaceable, RuntimeEnabled=WebMCPTesting] readonly attribute ModelContextTesting modelContextTesting;
};
```

7. Chrome Status:
```
$ curl -sS https://chromestatus.com/api/v0/features/5117755740913664 | python3 -c "…stages…"
{"stage_type": 130, "desktop_first": 146, "android_first": 146}
{"stage_type": 150, "desktop_first": 149, "desktop_last": 156}
flag_name = Experimental Web Platform features
```

## 9. Confidence and limits

- Direct observation: post text/date, live S020 IDL/status, S033 tag IDL + digest, spec git history,
  Chromium 146 Dev IDL via chromiumdash's commit hash, Chromium 154 tag IDL, Chrome Status stages/flag,
  row cells, gate output.
- Not re-executed: the 154 runtime probe (`PLAN.md:18-24`, author-side); the C2 harness; no counters
  or selftests were needed for this item.
- [INFERENCE] The exact GitHub Pages build at 06:06Z 2026-02-11 was `e1439bb` (the last committed
  `index.bs`); deployment timing was not separately observed. The earlier `92080f3` draft already
  carried the `Navigator` global, and the Chromium 146 build is deployment-independent evidence.
- [INFERENCE] The post's "Chrome 146" means the DevTrial milestone (Chrome Status stage 130), not
  146 stable (which shipped 2026-03-10); the post's "Install Chrome 146" step is therefore a Dev
  channel instruction at publication.
- No tool installs or upgrades were made; no pacman/uv/npm transaction. No lane file other than this
  report was created or modified.
