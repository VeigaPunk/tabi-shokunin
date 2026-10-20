VERDICT: ISSUES

# NewS062 — S062 (Chromium 154 remote-debugging pipe) falsification, round 18 wave 2

Seat `TabiR18.NewS062-2` (leaf, no dispatch). Date 2026-10-20. LANE
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline B
`2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (lane tip). Read-only on LANE: no
production file, fleet file, jj state or Git index was touched. Scratch clone/body dir
`/tmp/tabi-r18-ns062-m3xn` (deleted; commands and digests below are the retained record).
No tool install or upgrade.

## Inputs opened

| Item | Path:line | State at REV |
|---|---|---|
| S062 row | `corpus/SOURCES.md:76` | 11 cells; `code`; `A`; `mined`; opened 2026-10-20; recheck `on-release`; used-by `corpus/knowledge/harness-hardening-round-18.md` |
| S062 Gate entry | `corpus/lessons/round-18.md:43` | quote, location, commit, both digests, dossier pointer (lines 183–185) |
| S062 dossier | `.ufo/waves/round-18/sources/SrcChromiumPipe.md` (203 lines; Gate section begins line 183) | committed blob at REV |
| S058 row / Gate | `corpus/SOURCES.md:72`; `corpus/lessons/round-18.md:39` | rejection + flip |
| S058 dossier | `.ufo/waves/round-18/sources/S058Listing.md` (draft row line 56; §6 lines 89–97) | committed blob at REV |
| C1 note | `corpus/knowledge/source-recheck-round-18.md:11,102,136` | new this round; committed |
| C2 note | `corpus/knowledge/harness-hardening-round-18.md:1–6,26` | new this round; cites S059–S064 |
| Counters | `.ufo/waves/round-18/measure-c1.mjs`, `measure-c3.mjs` | read-only runs at REV |

## Independent re-open of the S062 URL (2026-10-20)

Commands (from the scratch dir; the UA string was `Mozilla/5.0 (X11; Linux x86_64) tabi-r18-falsify`):

```sh
curl -sS -A "$UA" -w '%{http_code}' -o cs.b64 \
 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_switches.cc?format=TEXT'
base64 -d cs.b64 > content_switches.cc
git hash-object content_switches.cc
```

Observed:

```text
content_switches.cc  HTTP=200  raw=60504 B  sha256=7b5618f52b80dd54b394ad2aa18408ef138a87959b87f29f651094e1df23d47e
decoded              45378 B, 990 lines  sha256=0262144447bae97b511b1f4e3cfcda4dcd58c5775c890b0b2ff517a3d1b4764e
git blob             2ad794823dc328d4ce7253c931eac3c8d3373460
```

Tag object `+refs/tags/154.0.8037.97?format=JSON` → `commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`,
committer `Chromium LUCI CQ`, time `Wed Sep 30 21:20:00 2026`. All three values match the
dossier and the Gate entry.

Exact source bytes at the quoted location (decoded file):

```text
596|// Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes
597|// specified in the 'remote-debugging-io-pipes' switch.
598|// Optionally, specifies the format for the protocol messages, can be either
599|// "JSON" (the default) or "CBOR".
600|const char kRemoteDebuggingPipe[] = "remote-debugging-pipe";
601|
602|// Enables remote debug over HTTP on the specified port.
603|const char kRemoteDebuggingPort[]           = "remote-debugging-port";
```

Quote verification with the lane producer:

```text
node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode base64 \
  --body cs.b64 \
  --quote "Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch."
{"found":true,"offset":26205,"normalizedLength":44208,"window":"... // Enables remote debug over stdio pipes [in=3, out=4] or over the remote pipes // specified in the 'remote-debugging-io-pipes' switch. ..."}
exit=0
```

19 whitespace tokens (the `//` is one token), matching the Gate entry's "(19 words)". The
served browse rendering (no `?format=TEXT`) was also fetched: HTTP 200, 309,997 B, sha256
`374044ca1c2f8c837a2c101e456f7b2b7ed453f45f44a41ea32d990ef3e40c4c`; the same quote is found
after `--decode html-text` at normalized offset 26732 of 44961. So the quote is present in
both the pinned raw file and the served rendering.

The dossier's other fetch-sweep claims were spot-checked and held: the seven URLs returned the
recorded raw/decoded digests and blob ids (`devtools_pipe_handler.cc` blob
`2a75e6f8…`, `remote_debugging_server.cc` blob `d348e869…`, `devtools_http_handler.cc` blob
`d14be48b…`); `chrome/browser/devtools/devtools_pipe_handler.cc?format=TEXT` is HTTP 404,
233 B, confirming the handler is under `content/browser/devtools/`; the pipe handler has no
`socket`/`bind`/`listen`/`accept` call (only `#include <sys/socket.h>` and `shutdown()` at
:164 and :248); `remote_debugging_server.cc:353` and `:365` are two independent `if`s (a pipe
launch and a port launch can both start), not an `else if`.

## What holds (verified, not an issue)

- S062 is structurally legal at REV: `node scripts/check-sources.mjs --root . --file corpus/SOURCES.md`
  → `SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0`, exit 0.
- Tier is scoped as the registry requires: `tier=A` with `scope=Pipe versus HTTP transport at Chromium 154.0.8037.97`,
  `kind=code`; no global claim. The row's Gate quote, digest, commit, location `content_switches.cc:596-597`
  and word count are exact.
- `used-by` exists and is used: `corpus/knowledge/harness-hardening-round-18.md` is committed at REV, its
  `source:` header names S059–S064, and S062 occurs 3 times in it.
- S058's corrected facts reproduce at the live URL: HTTP 200, 695,873 B, sha256
  `1169e5000040ccdd57ab4869a4c2dfacc7064dd7da0b6e8b475c8c422a957111`; `Developer` label → value
  `Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE` (byte 567480 region);
  `Offered by` at 567152 with value `François Beaufort` at 567173; `individual publisher` occurs 0 times;
  `invokeTool`, `executeTool`, `invocationId`, `invoke`, `toolInvoked`, `toolResponded` each occur 0 times.
  The S058 gate quote matches after `--decode html-text` at offset 936 of 5997. The recorded fetch #4 digest
  `fbc214a8…` did not reproduce, exactly as the dossier §1 predicts (four same-day fetches, four digests);
  my fetch corroborates the facts, not that digest.
- S058 row cells: 11 cells, no cell contains `individual publisher`; `teaches` starts
  `supersedes S057 —`, contains `REJECTED:` and `flip:`; `status=rejected`; `used-by=—`.
- C1/C3 counters at REV: `measure-c1.mjs` exit 0 with `c1_rows_rechecked:51, eligible_rows:58, held:50,
  own_work:1, rejected:[]`; `measure-c3.mjs` exit 0 with `c3_routed_closed:5` and
  `d4:{"pass":true,"why":"S058_supersession_verified"}`.
- Census: `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → one warning
  `tabi W04 S058 duplicate url … across scopes`, then `tabi ok`, exit 0. W04 is warning-level by design
  (census header line 33); it is the deliberate S058 supersession and the different scope wording keeps
  it W04 rather than E04.

## Findings

### F1 — S062 `teaches` overclaims the `DevToolsActivePort` write (medium)

Row cell (`corpus/SOURCES.md:76`):

> Pipe mode uses stdio descriptors 3 and 4; the port switch separately opens HTTP and its handler writes DevToolsActivePort; dropping the port is necessary even when the pipe is present

The third clause is stated unconditionally. The cited source does not support that: in
`chrome/browser/devtools/remote_debugging_server.cc:363-373`, `output_dir` is filled with
`chrome::DIR_USER_DATA` **only when `*port == 0`** (ephemeral); then
`content/browser/devtools/devtools_http_handler.cc:299` writes the file only under
`if (!output_directory.empty())`. A fixed non-zero `--remote-debugging-port=N` therefore runs the
HTTP handler with an empty output directory and writes **no** `DevToolsActivePort`. The dossier's own
precision limit §Consequence 1 states exactly this and says the file absence is "necessary, not
sufficient" and that the argv and file clauses must stay conjoined. The row drops the condition, so a
registry-only reader can over-read absence of the file as a no-listener witness. The counter `h3`
survives only because it conjoins the argv check; the cell is still wider than its source.

The first clause also omits the platform alternative that the Gate quote itself names: on Windows,
`remote-debugging-io-pipes` replaces fds 3/4 via `AdoptPipes`
(`content/browser/devtools/devtools_agent_host_impl.cc:224-232`). The row's scope is not OS-qualified.
The row's anchor cell does include `devtools_http_handler.cc:297-306`, so the guard at :299 is
reachable; the summary, not the citation, is the defect.

### F2 — the S062 Gate quote is normalized, not a contiguous raw-byte span (low)

`content_switches.cc:596` begins `// `; the quote begins after it. `:597` begins `//`; the quote
includes that marker mid-sentence. Direct check:

```text
q in raw_source                      -> False
q in normalize(raw_source)           -> True
q.replace(" //","") in normalize(...) -> False
```

So the exact string matches only because `recheck-fetch.mjs` joins lines with one space and keeps the
second line's comment marker. The dossier discloses this ("The `//` is the source's own line-comment
marker … the normalizer joins lines with one space"); the lesson's Gate table (line 43) labels the
quote "verbatim" without that caveat. The same pattern applies to S058's Gate quote (line 39), which
crosses `<br>` and newlines and matches only after `html-text` tag stripping at offset 936/5997. This
is a fidelity caveat, not a false quote: both quotes are present and reproducible under the declared
normalizer.

### F3 — S058's integrated `flip` contradicts its own dossier (medium)

Final row (`corpus/SOURCES.md:72`):

> … REJECTED: listing names developer Google Ireland, Ltd. but adds no invocation contract beyond S041/S048; flip: listing or extension source publishes a concrete invocation API contract

Dossier draft row (`.ufo/waves/round-18/sources/S058Listing.md:56`):

> … plus a Chrome 150.0.7861.0 floor, serving 0 occurrences of invokeTool, executeTool and invocationId, so it adds no invocation contract beyond S048 and S041; flip: a Chrome-owned page or the extension's own published source stating that floor or publishing an invocation API contract

Dossier §6 (`S058Listing.md:94-95`):

> **Chrome 150 floor.** The floor is the author's listing claim (F3), still not corroborated by a Chrome-owned page; that is exactly S058's flip condition.

The integration condensed the row and narrowed the flip to the invocation API, dropping the Chrome
150 floor from both the reason and the flip; the dossier still calls the floor "exactly S058's flip
condition". The final flip is in fact S057's flip (`SOURCES.md:71`), while the floor flip is S053's
(`SOURCES.md:67`). These are two different reopening conditions. `measure-c3.mjs:456-462` checks only
the `supersedes S057 —` prefix, absence of `individual publisher`, the corrected developer name, the
dossier pointer and the opened date; it does not compare the flip, which is why `d4` passes
(`S058_supersession_verified`) while the cell and dossier disagree.

### F4 — the S058 correction leaves the unsupported publisher premise in the round-18 C1 note (high)

`corpus/knowledge/source-recheck-round-18.md` is a current, committed round-18 artifact (absent at B,
so not byte-frozen). It still says:

```text
102| S057 | rejected / C | ... | listing fetched 2026-10-20, Offered by François Beaufort (individual publisher), summary paragraph and Prerequisites paragraph; registry-recorded body 649153 B, sha256 085c40b7… (S053 record) — this round's receipt differs in both, see §6 |
136| - **S053 → S057.** … (`corpus/SOURCES.md` S057 still carries the "individual publisher" wording from its source cell; the correction to that cell is outside this note.)
```

Observed: `grep -c historical` → 0; `grep -c S058` → 0. The phrase is in a table cell describing
the 2026-10-20 fetch, not marked historical or superseded, and the note never cites S058. Lesson
line 65 claims "The new knowledge source-recheck note quotes S057's old anchor as historical text, not
a current claim." That characterization is not verifiable from the note's bytes: there is no
"historical" marker at :102, and :136 says the correction is outside the note. The receipt
`corpus/evidence/round-18/source-recheck/S057.json:22` at least carries "Anchor cell (individual
publisher) is corrected by S058 per PLAN D4"; the note dropped that marker.

The S058 sweep table (`.ufo/waves/round-18/w1/SrcS058Listing.md` §4) records 25 lines across 15 files
at `2026-10-20T19:09:30Z` and does not list the note. The note's mtime is `2026-10-20T19:18:41Z`, and
its draft's is `19:16:36Z` (epochs 1792523921 / 1792523796), both after the sweep. A fresh
`grep -rn "individual publisher" --exclude-dir=.git .` now returns 50 lines in 28 files (most are
wave/dispatch artifacts); the current production occurrences are this note (:102, :136), the
superseded S053/S057 rows (`SOURCES.md:67,71`), the frozen round-17 spot-check
(`corpus/lessons/round-17-verifier-spotcheck.md:162`) and the S057 receipt. The S053/S057 rows and
frozen lessons are allowed historical retention; the new note is not superseded and is the leak.
`measure-c3.mjs` d4 inspects only S058's cells, so it cannot see this.

### F5 — C1's receipt contract says rows at REV; its target and counter say 51 at B (medium-low)

- `PLAN.md:16`: "target 51 = every row not superseded at B".
- `PLAN.md:69`: receipt contract "`row` is a row id present in `corpus/SOURCES.md` at REV and not in the superseded set above".
- At REV there are 64 rows; `measure-c1.mjs REV` prints `c1_rows_rechecked:51, eligible_rows:58` (exit 0).
- The receipt directory contains 102 files = 51 `.json` + 51 `.excerpt.txt`; there is no
  `S058.json`…`S064.json`. S062 therefore has no `tabi-source-recheck-v1` receipt, although the
  contract's literal wording would require one.

The measured number is honest against the declared target (51), and the counter exposes the 58
eligible rows, but the contract text and the target disagree. Also, `source-recheck-round-18.md:11`
says "`corpus/SOURCES.md` has 57 rows (S001–S057)" — false at REV (`check-sources` rows=64); the
note's header line 1 correctly qualifies "the 51 rows … at baseline B", so this is a wording bug in
§1, not a counter failure.

### F6 — final census emits an unreported W04 (informational)

`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`:

```text
tabi	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
exit=0
```

The lesson reports only the start census (57 rows, A46/B4/C7; mined42/queued8/rejected7), which is
correct at B. W04 is warning-level and does not fail; it is the intended S058 supersession, kept
W04 rather than E04 by the different scope text. No action needed unless the lesson wants the final
census state.

### F7 — dossier supporting-span offsets need an unstated quote (low)

The dossier's "two further spans" JSON omits the quote strings, so its offsets are reproducible only
with guessed spans: `10328` is the HTTP-handler comment; `12696` is
`` `--remote-debugging-port` and `--remote-debugging-pipe` // take precedence over the new mode. ``
without the leading `// ` (with it, the same span is `12693`); `2182` is
`static constexpr int kReadFD = 3; static constexpr int kWriteFD = 4;` (the preceding comment is
`2076`). All three strings are present and the claims hold; only the probe's reproducibility is
weaker than the prose implies.

## Direct answers to the assigned questions

- **Tier scoped?** Yes. `tier=A`, `kind=code`, scope pinned to Chromium 154.0.8037.97; enums legal;
  `check-sources` clean. The scope does not globalize. Caveat F1: the summary drops the
  output-directory condition and the Windows io-pipes alternative, both inside the row's own scope.
- **Teaches overclaimed?** Yes, F1 (unconditional `DevToolsActivePort` write; fds 3/4 without the
  Windows alternative). The rest (pipe on fds 3/4, port separately opens HTTP, both switches run
  independently) is confirmed at `remote_debugging_server.cc:353-395`.
- **S058 rejection reason + flip?** Both exist and the rejection reason is supported today (developer
  card, 0 invocation tokens). The flip is narrower than the dossier's draft and §6 (F3): the final
  flip omits the Chrome 150 floor that the dossier calls "exactly S058's flip condition".
- **Source note uses S059–S064 and used-by exists?** Yes. `corpus/knowledge/harness-hardening-round-18.md`
  header names S059–S064; occurrence counts are S059 8, S060 3, S061 4, S062 3, S063 6, S064 6; the
  used-by cell for each of `SOURCES.md:73-78` is that path; the note is committed at REV.
- **Does a correction leave an unsupported premise in another cell?** Yes: F4 (the C1 note :102/:136
  keep "individual publisher" without a historical/S058 marker, and lesson line 65's "historical
  text" claim is unsupported) and F3 (the final S058 flip drops the floor the dossier still calls the
  flip condition). In `SOURCES.md`, S053:67 and S057:71 also retain the phrase, but as superseded rows
  the lesson explicitly allows that; S057 has no local "superseded by S058" back-pointer — the only
  pointer is S058's `teaches` — so "explicitly superseded" is true only from the successor.
- **Does quoted code differ by comment/backticks?** The S062 quote carries line 597's `//` mid-span and
  is only a normalized match (F2); S058's gate quote crosses `<br>`/newlines and is only an
  `html-text` match. No backtick or wording difference between the lesson quote and the dossier
  quote: the lesson contains the string once, the dossier three times, byte-identical. The source
  contains the prose only as two `//` comment lines.

## Limits

- No `measure-c2.mjs` run, no browser launch, no WebMCP invocation, no real-site page tool. Only HTTP
  GETs to the pinned Chromium gitiles URLs and the public Chrome Web Store listing.
- No LANE write outside this report; no git write in LANE. Scratch `/tmp/tabi-r18-ns062-m3xn` deleted;
  its commands and digests are reproduced above.
- The S058 fetch is a fresh serialization; its digest is not comparable to the recorded fetch #4 and
  the recorded body is not committed. I verified the facts and the quote, not the recorded digest.
- C1/C3 counts are the counters' own outputs; F3/F4/F5 are cell/prose mismatches outside their
  predicates, not counter failures.
- The browse-page offsets are normalized offsets (`html-text` + `normalize`), not raw byte offsets.
- No installs/upgrades; no host service restart.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS062.md`
