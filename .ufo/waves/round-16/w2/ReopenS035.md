# ReopenS035 — S035 Chromium WebMCP.pdl (round-16 w2, FALSIFY)

Seat: TabiR16.ReopenS035 (leaf, read-only on the lane). Date: 2026-10-20.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3`
(commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair; `corpus/SOURCES.md` unchanged
across A..HEAD: `git diff --stat 8f7feb3 HEAD -- corpus/SOURCES.md` printed nothing).

Row under attack (`corpus/SOURCES.md:49`):

> `| S035 | Chromium WebMCP.pdl — https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | code | A | Source declaration of the experimental CDP WebMCP domain at Chromium main | main fetched 2026-10-20, line 7 and lines 47-54, sha256 f386bcfd…f99f | The domain is experimental; enable replays toolsAdded for registered tools; backendNodeId marks declarative tools; the 154 build's own /json/protocol is the build authority | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |`

## Verdict

**HOLDS** on the row as a claim: URL opens, digest matches, every source-derived clause of
`teaches` is verbatim-supported inside the stated anchor, and `kind`/`tier`/`scope` are honestly
scoped to Chromium `main` with no inflation onto the 154 build. Two recorded non-breaking
weaknesses (W1 anchor revision, W2 rule-1 Gate record) and one integration hazard (W3) follow.
No corpus edit is proposed; rule 2 allows in-place changes only to status/recheck/used-by.

## 1. The URL opens; the digest is exact (this session, 2026-10-20)

```
$ curl -sS -o /tmp/s035.pdl "https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl"
$ wc -l /tmp/s035.pdl && sha256sum /tmp/s035.pdl
125 /tmp/s035.pdl
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  /tmp/s035.pdl
```

`f386bcfd…f99f` is the row's truncated digest: full digest starts `f386bcfd`, ends `f99f`. Match.

Two other hosts serve the same bytes (so the raw URL is not a stale or divergent mirror):

```
$ curl -sS "https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT" | base64 -d > /tmp/gs-main.pdl
$ sha256sum /tmp/gs-main.pdl && diff -q /tmp/gs-main.pdl /tmp/s035.pdl && echo GOOGLESOURCE_IDENTICAL
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  /tmp/gs-main.pdl
GOOGLESOURCE_IDENTICAL
$ curl -sS -o /tmp/dp.pdl "https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/pdl/domains/WebMCP.pdl"
$ sha256sum /tmp/dp.pdl && wc -l /tmp/dp.pdl && diff -q /tmp/dp.pdl /tmp/s035.pdl && echo DEVTOOLSPROTOCOL_IDENTICAL
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  /tmp/dp.pdl
125 /tmp/dp.pdl
DEVTOOLSPROTOCOL_IDENTICAL
```

## 2. Quotes inside the anchor, ≤25 words, grounding `teaches`

Anchor is "line 7 and lines 47-54". Observed bytes:

```
$ sed -n '7p' /tmp/s035.pdl
experimental domain WebMCP
$ sed -n '47,54p' /tmp/s035.pdl
      # Optional node ID for declarative tools.
      optional DOM.BackendNodeId backendNodeId
      # The stack trace at the time of the registration.
      optional Runtime.StackTrace stackTrace


  # Enables the WebMCP domain, allowing events to be sent. Enabling the domain will trigger a toolsAdded event for
  # all currently registered tools.
```

| `teaches` clause | Verbatim quote | Location | Words |
|---|---|---|---|
| "The domain is experimental" | `experimental domain WebMCP` | WebMCP.pdl line 7 | 3 |
| "backendNodeId marks declarative tools" | `Optional node ID for declarative tools.` (attaches to `optional DOM.BackendNodeId backendNodeId`) | lines 47-48 | 6 |
| "enable replays toolsAdded for registered tools" | `Enables the WebMCP domain, allowing events to be sent. Enabling the domain will trigger a toolsAdded event for all currently registered tools.` | lines 53-54 | 22 |
| "the 154 build's own /json/protocol is the build authority" | not a source claim; an epistemic scoping rule (see §3) | — | — |

Word count of the enable quote:

```
$ sed -n '53,54p' /tmp/s035.pdl | sed 's/^ *# *//' | tr '\n' ' ' | sed 's/  */ /g;s/^ *//;s/ *$//' | wc -w
22
```

Nothing outside lines 7/47-54 is needed for the source clauses, and no line in that range
contradicts them.

## 3. The fourth clause is warranted, not borrowed authority

Fetched the 154 tag file and diffed it against main:

```
$ curl -sS "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT" | base64 -d > /tmp/s035-154.pdl
$ sha256sum /tmp/s035-154.pdl
26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff  /tmp/s035-154.pdl
$ diff -u /tmp/s035-154.pdl /tmp/s035.pdl
@@ -19,6 +19,8 @@
       optional boolean untrustedContent
       ...
       optional boolean consequential
+      # If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.
+      optional boolean debugging
       # If the declarative tool was declared with the autosubmit attribute.
       optional boolean autosubmit
```

So `main` (sha `f386bcfd…`) is **not** the 154 build: exactly one hunk, `Annotation.debugging`
added. The row's directive "the 154 build's own /json/protocol is the build authority" is therefore
correct and necessary, and the row does not attribute any build fact to this `main` file. The
draft row had the same caution in other words ("this is the field set at main, not what the Chrome
154 binary emits", `.ufo/waves/round-16/drafts/DraftSources.md:17`).

The three quoted ranges are byte-identical across the two revisions, modulo the +2-line shift
introduced by that one hunk:

```
$ diff <(sed -n '7p' /tmp/s035.pdl) <(sed -n '7p' /tmp/s035-154.pdl) && echo IDENTICAL
IDENTICAL
$ diff <(sed -n '47,54p' /tmp/s035.pdl) <(sed -n '45,52p' /tmp/s035-154.pdl) && echo IDENTICAL
IDENTICAL
```

## 4. kind / tier / scope honesty

- **kind `code`** — the `.pdl` is the authored browser-protocol source that generates
  `browser_protocol.json`; `code` is the same kind used for S033/S034/S036. Choosing `code` rather
  than `spec` is honest: the knowledge note records the domain as "not in any spec"
  (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:82`), so no normative-spec status is
  implied.
- **tier `A`** — the file is primary for the row's stated scope. The scope cell is explicit:
  "Source declaration of the experimental CDP WebMCP domain **at Chromium main**". Tier A is not
  extended to the 154 build; `teaches` instead directs the reader to the build's own protocol.
  This is the opposite of tier inflation.
- **scope** — matches both the anchor and the only corpus use of the row. The note cites S035 for
  exactly one proposition ("S035 marks `experimental domain WebMCP`") and cites 154 presence to
  `protocol-domain.json`, not to S035. Verified:
  `grep -n "S035" corpus/knowledge/webmcp-chromium-loopback-round-16.md` → `:7 source: S035`,
  `:82 … | CDP domain | not in any spec; S035 marks experimental domain WebMCP | present at 154 even with no flags (protocol-domain.json) | …`.
- **status/used-by** — `mined` with `corpus/knowledge/webmcp-chromium-loopback-round-16.md`, which
  exists and cites the row in its front matter. `opened 2026-10-20` and `recheck on-release` match
  today's date and the moving-`main` posture.

Census (contract v1 commands, run at HEAD):

```
rows: 39
malformed (NF!=13): 0
enum/tier violations: (no output)
duplicate ids: (no output)
mined used-by paths that do not exist: (no output)
```

## 5. Weaknesses and hazards (none flips the verdict)

**W1 — the anchor names no revision (minor, non-breaking).** The row pins `main fetched
2026-10-20` + a truncated sha256, but no commit or tag. `main` moves, so the line numbers are only
re-findable by matching the digest. Notably, the pre-integration draft row did carry a commit:
`DraftSources.md:17` anchors "Chromium main HEAD **05abdb878fa62ed76a61b413b0c3f9d55838b8b9**
(ls-remote 2026-10-20); file sha256 in §C; WebMCP.pdl line 7, lines 35–50". The final row dropped
it. Both candidates are commit-addressable for this file (verified this session):

```
$ for c in 05abdb878fa62ed76a61b413b0c3f9d55838b8b9 7585497a1cefc5459e8babfce6b232358359bb8c; do
    curl -sS -o /tmp/c.pdl -w '%{http_code}\n' "https://raw.githubusercontent.com/chromium/chromium/$c/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl"
    sha256sum /tmp/c.pdl
  done
200
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  /tmp/c.pdl
200
f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f  /tmp/c.pdl
```

Since content identity is pinned (and matched today on three hosts and two commits), this is a
precision loss, not a false claim. Recommendation for L1: put `05abdb87…` (or the GitHub head
`7585497a…` recorded in `.ufo/waves/round-16/w1/SrcChromiumPdl.md` §4) in the Gate text; do not
edit the anchor cell in place (rule 2).

**W2 — rule-1 Gate record is not yet in the corpus (UNPROVEN, L1-only duty).**
Contract v1 rule 1 requires the round lesson's `## Gate` to record, for every new row, the URL,
access date, and a ≤25-word quote with location. At this snapshot:

```
$ ls corpus/lessons/round-16*        # no such file
$ git ls-tree -r HEAD --name-only corpus/lessons/ | grep -c 'round-16'
0
$ git ls-tree -r 8f7feb3 --name-only corpus/lessons/ | grep -c 'round-16'
0
```

`PLAN.md:112` lists `corpus/lessons/round-16.md` under "L1 only", and
`.ufo/waves/round-16/w1/DraftQuality.md:21-22` already flags the file as absent. So the duty is
pending L1 integration, not a defect of S035's content. Until it lands, S035's rule-1 backing
exists only in wave artifacts.

**W3 — draft quote table miskeys the PDL quotes (integration hazard).** The only existing Gate-style
quote table keys `experimental domain WebMCP` (line 7) and `Optional node ID for declarative tools.`
(line 47) to **S034**, not S035 (`DraftSources.md:48-49`); in that draft, "S035" is a row about
`model_context_supplement.idl` (`:51`), because final ids were reassigned during integration. If
L1 copies §B verbatim into the Gate, the PDL quotes will be attributed to the wrong row. L1 must
rekey. (Verified no other S035 quote record exists: `.ufo/waves/round-16/drafts/DraftLesson.md` has
no `S03x`/`WebMCP.pdl`/`## Gate` hits.)

## 6. What was and was not run

- Ran: `curl` fetches (three hosts), `sha256sum`, `diff`, `sed`, `awk`, `grep`, `git rev-parse`,
  `git ls-tree`, `git diff --stat`, `ls`. All read-only on the lane.
- Not run: `scripts/webmcp-loopback-round16.mjs` (C2 evidence, not this ticket's question),
  the counters/gates (C1/C2), any mutation probe. Mutation probes were unnecessary: the attack is
  a source-row check, and the only candidate mutations (row cell edits) are barred by rule 2, not
  by tooling.
- Wrote only `/tmp` scratch files and this Report.
- Installed/upgraded nothing, so no tooling record is due.

## 7. Remaining unknowns

- Because the row names no commit, I cannot prove the bytes the row's author fetched at w1 were
  `f386bcfd…`; I can only show today's `main` equals that digest and that the draft names head
  `05abdb87…`. The seat report's own fetch (`w1/SrcChromiumPdl.md:35`) shows the same digest, which
  is author-side evidence only.
- I did not re-derive the 154 build's `/json/protocol` body; the `debugging` skew was proven from
  the tag PDL, which is sufficient for the row's "build authority" clause.
