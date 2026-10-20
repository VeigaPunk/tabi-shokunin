# ReopenS031 — S031 (WebMCP declarative API explainer): re-open, quote-at-anchor, tier/kind/scope honesty

Wave: round-16 wave 2 (FALSIFY), lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
measured revision `b444ca8e024f386124418169e8e400221524bba3` (a1 `8f7feb3`, a2 `b444ca8e`).
Author-side report; not non-author certification. All fetches below were run by this seat on
2026-10-20 (UTC clock recorded where relevant). Read-only on the lane except this file.

## Attack item (one)

Registry row `corpus/SOURCES.md:45`:

| cell | value |
|---|---|
| source | WebMCP declarative API explainer — https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md |
| kind / tier | `docs` / `A` |
| scope | Proposed declarative (HTML form) WebMCP surface and its open schema-synthesis question |
| anchor | repo HEAD `cb3d16964ab3e92cfd5f09901ed0504373a906e8` (2026-10-20), §Input schema synthesis lines 108-115 |
| teaches | Form-to-schema synthesis is TBD in the proposal and Chromium ships a loose version, so derived schemas are build-scoped |

Question attacked: (a) does the URL at the pinned revision contain, at lines 108-115, a
≤25-word quote grounding the `teaches` cell; (b) are `kind`/`tier`/`scope` honest under
SOURCES contract v1 (CORPUS.md:64-155).

## Verdict: HOLDS

The anchor text exists verbatim at the pinned revision; its sha256 equals the digest the
round-16 gate recorded; the row's tier/kind/scope are within contract. One precision note on
the word “ships” (§Observation 2) and two round-level observations that do not falsify the row
(§Observations 3-4).

## Evidence — exact commands and observed output

### 1. Row bytes at the pinned revision (the row URL, resolved to its pin)

```
$ curl -sS -o decl_main.md -w 'HTTP %{http_code} bytes=%{size_download}\n' \
    https://raw.githubusercontent.com/webmachinelearning/webmcp/cb3d16964ab3e92cfd5f09901ed0504373a906e8/declarative-api-explainer.md
HTTP 200 bytes=10417
$ sha256sum decl_main.md
4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28  decl_main.md
$ wc -l decl_main.md
213 decl_main.md
```

```
$ awk 'NR>=106 && NR<=116 {printf "%3d|%s\n", NR, $0}' decl_main.md
106|### Input schema synthesis
107|
108|TODO: The exact algorithms reducing a form, its form-associated elements, and *their* attributes
109|like [`step`](https://html.spec.whatwg.org/C#the-step-attribute) and
110|[`min`](https://html.spec.whatwg.org/C#attr-input-min) are TBD. We need to concretely specify how
111|various form-associated elements like `<input>` and `<select>` reduce to a JSON Schema that includes
112|`anyOf`, `oneOf`, and `maximum`/`minimum` declarations.
113|
114|Chromium is implementing a loose version of this and will conduct testing/trials to see if what
115|we've come up with should be supported by the community as a general approach.
116|
```

The row's line range 108-115 is exact: 108-112 are the schema-synthesis TODO paragraph, 114-115
the Chromium sentence; the heading itself is at 106, so the row's range is the section body, not
the heading — accurate, not over-broad.

### 2. ≤25-word quote grounding `teaches`

`teaches` has two clauses; the anchor grounds both.

- TBD clause — 10 words, line 108: **“The exact algorithms reducing a form, its form-associated elements, and”** … “are TBD” (line 110).
- Chromium clause — 12 words, lines 114-115: **“Chromium is implementing a loose version of this and will conduct testing/trials”**.

Single quote spanning both, with elisions marked, 15 words, at lines 108-114:
**“TODO: The exact algorithms reducing a form … are TBD[;] Chromium is implementing a loose version”**.

```
$ grep -nF 'The exact algorithms reducing a form' decl_main.md
108:TODO: The exact algorithms reducing a form, its form-associated elements, and *their* attributes
$ grep -nF 'Chromium is implementing a loose version of this' decl_main.md
114:Chromium is implementing a loose version of this and will conduct testing/trials to see if what
$ python3 -c 'print(len("The exact algorithms reducing a form, its form-associated elements, and".split()), len("Chromium is implementing a loose version of this and will conduct testing/trials".split()))'
10 12
```

### 3. Gate record and digest agreement

The round-16 gate (`.ufo/waves/round-16/drafts/DraftSources.md`) records the URL, access date
2026-10-20, both located quotes, and the raw digest:

```
$ grep -n '4587c9f2\|bd28' .ufo/waves/round-16/drafts/DraftSources.md
41:| S031 | "The exact algorithms reducing a form, its form-associated elements, and" | declarative-api-explainer.md §Input schema synthesis (line 108) | https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md | 2026-10-20 | curl raw, sha256 4587c9f2…bd28 (grep-verified) |
42:| S031 | "Chromium is implementing a loose version of this and will conduct testing/trials" | same section (lines 114–115) | same | 2026-10-20 | same |
74:| webmachinelearning/webmcp declarative-api-explainer.md (raw main) | 4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28 |
```

My independent fetch reproduces `4587c9f2…bd28` exactly. Contract rule 1's per-row URL + access
date + ≤25-word located quote requirement is satisfied in substance by this gate table — with the
path caveat in Observation 3.

### 4. Honesty axes (CORPUS.md:64-155)

- `kind: docs` — enum value valid; the artifact is an explainer/proposal document, not the spec
  (`S030`'s README quote: “not part of the specification at this time”), so `spec` would be wrong
  and `code` would also be wrong (it is prose, not implementation). Correct.
- `tier: A` — “primary or authoritative for that scope (… maintainer statement …)”. The scope is
  the *proposal's own content*; this file is the proposal's primary text, committed in the
  maintainers' repository. A is defensible. Not tier inflation: the `community ⟹ not A` rule is
  inapplicable (kind is `docs`), and the scope does not extend to “the spec” or to “Chromium
  conformance”.
- `scope` — limited to the proposed surface and the open schema-synthesis question; it does not
  claim normative status or Chrome support. Matches the anchor section.
- `anchor` — not a bare homepage; carries commit `cb3d1696` + section + line range, and the lines
  resolve exactly. The URL is a `main` blob path, but the anchor's revision pin supplies the
  immutable reference the contract requires.
- `status: mined` + `used-by` — the path exists and cites the row:
  `corpus/knowledge/webmcp-chromium-loopback-round-16.md:3` (`source: S031`) and `:78`
  (“explainer says Chromium implements ‘a loose version’ (S031)”) — an attributed use, not an
  over-claim.
- `opened: 2026-10-20`, `recheck: on-release` — valid date and cadence vocabulary (checker E08/E09).

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-sources.mjs; echo "exit=$?"
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
exit=0
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' corpus/SOURCES.md | sort | uniq -d
(no output)
```

And the S031 cells contain no stray pipes (`NF=13`), so the row cannot be mis-parsed:

```
$ awk -F'|' '$2 ~ /S031/ {print "NF="NF}' corpus/SOURCES.md
NF=13
```

### 5. Living-URL check (the URL is `blob/main`)

The file at current `main` was compared byte-for-byte with the pinned revision, so the only way
`main` can invalidate the row is a content change, and there was none:

```
$ git ls-remote https://github.com/webmachinelearning/webmcp refs/heads/main
51ed75653aaa7f174f8dbe05d1bc327359bbc57c	refs/heads/main
$ curl -sS -o decl_newhead.md -w 'HTTP %{http_code}\n' \
    https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/declarative-api-explainer.md
HTTP 200
$ sha256sum decl_head.md decl_main.md decl_newhead.md
4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28  decl_head.md      # raw main
4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28  decl_main.md      # pinned cb3d1696
4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28  decl_newhead.md   # 51ed7565
```

Timing (why “repo HEAD” is stale but the row was true when written):

```
$ date -u '+%Y-%m-%dT%H:%M:%SZ'
2026-10-20T14:59:01Z
$ git log --format='%H %ci %s' -1 8f7feb3ff7a0c0ceef220a362581e325a95d6f3a
8f7feb3ff7a0c0ceef220a362581e325a95d6f3a 2026-10-20 11:54:43 -0300 round-16: measurement-binding gate, ...
# commits/main.atom (GitHub API was 403 rate-limited; feed used instead):
cb3d16964ab… updated 2026-10-20T09:53:18Z
51ed75653aaa… updated 2026-10-20T14:57:14Z
```

`cb3d1696` was `main` HEAD from 09:53Z to 14:57Z, i.e. through the lane commit at 14:54:43Z
(11:54:43-0300). The successor `51ed7565` landed 2m31s after the commit; the explainer file is
unchanged across that move. Unrun: GitHub REST commits API (403 `API rate limit exceeded`), so
the commit dates above come from the Atom feed, not the REST JSON.

## Observations (reported, not verdict-changing)

1. **Anchor exactness.** Registry says 108-115; the gate draft says 106-115 for the section.
   Both are true (106 is the heading); the registry's body range resolves exactly. No defect.
2. **`teaches` tense.** The anchor says Chromium “is implementing a loose version … and will
   conduct testing/trials”; the cell says “Chromium ships a loose version”. Strictly, the anchor
   grounds *implementing*, not *shipping*. The knowledge entry does not repeat that strengthening
   — it writes “explainer says Chromium implements ‘a loose version’”, and the round's runtime
   receipt plus `S033`/`S035` (154-tag feature table / CDP `backendNodeId`) supply the actual
   shipping observation. So the row is materially correct, but a strictly-verbatim reading of
   rule 1 would prefer “Chromium is implementing a loose version” in the cell or a pointer to the
   receipt. Not a BREAK: the learner benefit (“derived schemas are build-scoped”) follows from the
   TBD + loose-implementation pairing, both of which the anchor states.
3. **Gate path named by the search log is absent.** `corpus/SOURCES.md:76` ends “Per-row URL, date
   and located quotes: `corpus/lessons/round-16.md` §Gate.” At HEAD `b444ca8e` that file does not
   exist; the gate content is currently the wave draft
   `.ufo/waves/round-16/drafts/DraftSources.md` §B (quotes) and §C (digests).

   ```
   $ for p in corpus/lessons/round-16.md corpus/lessons/round-16-verifier-spotcheck.md; do [ -e "$p" ] && echo "EXISTS $p" || echo "ABSENT $p"; done
   ABSENT corpus/lessons/round-16.md
   ABSENT corpus/lessons/round-16-verifier-spotcheck.md
   $ grep -n '^## ' .ufo/waves/round-16/drafts/DraftSources.md
   6:## A. Row cells (11 columns, registry order)
   30:## B. Lesson Gate quotes (≤25 words each, verbatim, with location)
   68:## C. Raw-fetch digests (sha256 of bytes fetched 2026-10-20)
   98:## D. Search log line (round 16)
   ```

   This is a round-closure state, not a source-support failure: the row's URL/date/quotes/digest
   are present and reproducible. Flag to L1: either the round-16 lesson lands with §Gate at the
   named path, or the search-log sentence names the draft path. `check-sources.mjs` cannot see this
   (it checks structure only: E01-E11; no rule opens a URL or resolves the gate path).
4. **Registry preamble staleness (cross-row).** The preamble (“Every row below was opened in kaika
   fleet round-1 (2026-10-19)”) is qualified in the search log only for S029. S030-S039, S031
   included (`opened: 2026-10-20`), are outside that qualification even though the round-16
   search-log line records their opens. Adjacent honesty note for L1, not S031-specific.

## Remaining unknowns

- Whether `cb3d1696` was still `main` HEAD at the exact second each wave-1 seat fetched its file
  (only commit-time bounds 09:53Z-14:57Z are known; this seat's own fetch at 14:57-14:59Z saw the
  pin content byte-identical at the successor HEAD).
- Whether the round-16 lesson (with §Gate at the path the search log names) will be created at
  round close; at the measured revision it is absent. (Observation 3.)
- GitHub REST commit metadata for `cb3d1696`/`51ed7565` (rate-limited); dates above are Atom-feed
  observations.
- Not attacked here: the C2 counter, harness/receipt, and the S020/S030/S032-S039 rows (other
  wave-2 seats).

## Tooling

No installs or upgrades were needed or performed. `curl`, `git`, `awk`, `python3` and `node` were
already present; GitHub REST was rate-limited, so `git ls-remote` + `commits/main.atom` were used
as the fallback (recorded above).
