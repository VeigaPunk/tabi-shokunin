# ScoutReopenS105 — independent re-open of S105 (Page.pdl @ 154.0.8037.97)

Lane tip under test: `ad125e85c235e1c4ec6a08e398bd64da01f68a08` (`git rev-parse HEAD`).
Item: one documented GET of the S105 URL, base64-decode, and answer five questions about
the anchor cell and the located claims. Read-only: no tracked file was touched; fetched
bytes live in `.ufo/waves/round-24/scratch/ScoutReopenS105/`.

## Axes (godspeed)

| Axis | What a move can improve | Moves kept |
|---|---|---|
| A1 anchor identity | does the recorded sha256 equal the bytes this seat fetched | re-derive digest on decoded body |
| A2 anchor arithmetic | does the recorded byte count equal a count this seat can produce | measure raw transfer **and** decoded size |
| A3 anchor location | do the cited line numbers carry the cited symbols | `grep -n` on the decoded file |
| A4 negative claim | is `notRestoredReasons` truly absent | case-sensitive + case-insensitive sweep |
| A5 provenance | is the fetch a single GET, HTTP 200, pure base64 | status/size/content-type + alphabet sweep |

Every move below is one command; none harmed another axis.

## The fetch (one GET)

```
export TMPDIR=/home/vgpnk/tmp-tabi24
curl -sS -o s105.raw -w 'HTTP %{http_code}\nSIZE %{size_download}\nCT %{content_type}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT'
```
```
HTTP 200
SIZE 82548
CT text/plain; charset=utf-8
```
Raw body is pure base64 — `LC_ALL=C grep -c '[^A-Za-z0-9+/=]' s105.raw` → `0`.

```
base64 -d s105.raw > s105.decoded          # exit 0, stderr empty
```

## Answers to the five questions

### 1. Status

**HTTP 200** (`curl -w '%{http_code}'`), `content-type: text/plain; charset=utf-8`,
effective URL identical to the requested URL (no redirect). Single GET; no retry.

### 2. Decoded byte count

| Quantity | Value | Command |
|---|---|---|
| raw transfer (base64 body) | **82548** | `stat -c '%s' page.pdl.b64` |
| decoded body | **61911** | `stat -c '%s' page.pdl` |
| decoded lines | **1795** | `awk 'END{print NR}' page.pdl` |

`82548 * 3 / 4 = 61911` exactly (`python3 -c`), i.e. the transfer is the base64 expansion
of the decoded body with no padding slack.

### 3. sha256

| Basis | sha256 | Command |
|---|---|---|
| **decoded body** | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` | `sha256sum page.pdl` |
| raw base64 body (contrast) | `0823829b68ca3857c4e69a833863b23c6e8cca686c3dec8b4667c98a8a2dfc30` | `sha256sum page.pdl.b64` |

The fresh fetch is **byte-identical** to the committed evidence blob:
`cmp scratch/ScoutReopenS105/page.pdl corpus/evidence/round-24/sources/page.pdl` → identical,
and that blob is `61911` bytes with the same `e944a3b1…` digest.

### 4. Does S105's anchor cell match?

The anchor cell is field 6 of `corpus/SOURCES.md:120` (`awk -F'|'` → 11 fields; field 6 is
`tag 154.0.8037.97 PDL fetched 2026-10-25, 82548 bytes decoded, sha256 e944a3b1…; decoded
line 1345 NavigationType enum carries BackForwardCacheRestore; decoded line 1706 experimental
event backForwardCacheNotUsed with required notRestoredExplanations`).

**Verdict: three of four components match; the byte count does not.**

| Component | Recorded | Observed this seat | Match |
|---|---|---|---|
| sha256 | `e944a3b1…405be` | `e944a3b1…405be` on the 61911-byte decoded body | **yes** |
| byte count | `82548 bytes decoded` | 82548 = **raw base64 transfer**; **decoded = 61911** | **no — mislabelled** |
| line 1345 | `BackForwardCacheRestore` in `NavigationType` | line 1345 is exactly `      BackForwardCacheRestore`, inside `experimental type NavigationType extends string` (1342) | **yes** |
| line 1706 | `experimental event backForwardCacheNotUsed` with required `notRestoredExplanations` | line 1706 is exactly `  experimental event backForwardCacheNotUsed`; `notRestoredExplanations` at 1713, `array of BackForwardCacheNotRestoredExplanation`, comment "This must not be empty", not marked `optional` → required | **yes** |

The byte figure is a **mixed-basis anchor cell**: the size is the encoded transfer size,
while the digest is over the decoded body (which is the lane's normal basis — rows S074,
S077, S078, S082, S083, S084, S086, S093, S095–S100 all say "decoded sha256"). Both figures
are individually true of *something*; the word "decoded" makes the pair contradictory, since
82548 decoded bytes and a 61911-byte committed blob cannot both hold.

Blast radius — the same wrong figure is committed at three sites, all from one integration
(`grep -rn 82548` over the lane, excluding `scratch/` and the mtime dumps):

- `corpus/SOURCES.md:120` (anchor cell)
- `corpus/knowledge/navigation-history-bfcache-evidence.md:4` ("82548 bytes decoded")
- `corpus/lessons/round-24.md:16` ("82548 bytes decoded")

The wave-1 seat that actually fetched the file recorded the right number:
`.ufo/waves/round-24/w1/ScoutCdpPage.md:10` — "**Byte count: 61,911** (`wc -c page.pdl`)",
and `DistillW1.md:21` — "61,911 B". The error entered at integration, not at fetch.

**This defect is invisible to every gate.** `scripts/check-sources.mjs` contains zero
occurrences of `sha256` (`grep -c sha256` → 0); `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`
has no hash/digest logic (`grep -n 'SHA\|hash\|digest'` → no matches); and no lane script binds
the blob at all (`grep -rn 'sources/page.pdl\|evidence/round-24/sources' scripts/*.mjs` → no
matches). A digest-only anchor check passes; only re-opening the URL surfaces the number.

### 5. Where the symbols actually sit

```
$ grep -n 'BackForwardCacheRestore' page.pdl
1345:      BackForwardCacheRestore          # only occurrence in the file

$ grep -n 'backForwardCacheNotUsed' page.pdl
1706:  experimental event backForwardCacheNotUsed    # only occurrence

$ grep -n 'NavigationType' page.pdl
1342:  experimental type NavigationType extends string
1352:      experimental NavigationType type          # frameNavigated's parameter

$ grep -n 'event frameNavigated' page.pdl
1348:  event frameNavigated

$ grep -n 'notRestoredExplanations' page.pdl
1713:      array of BackForwardCacheNotRestoredExplanation notRestoredExplanations
1715:      optional BackForwardCacheNotRestoredExplanationTree notRestoredExplanationsTree
```

So `BackForwardCacheRestore` is **where the row says** (1345, inside the `NavigationType`
enum that `frameNavigated.type` at 1352 uses), and `backForwardCacheNotUsed` /
`notRestoredExplanations` are **where the row says** (event at 1706, required field at 1713).
The entry's extra detail also holds: the event carries `loaderId` (1711) and `frameId` (1712),
and an *optional* `notRestoredExplanationsTree` (1715) that the row does not mention.

### 6. Does `notRestoredReasons` appear anywhere?

**No — zero occurrences, in every spelling and every basis.**

```
grep -c 'notRestoredReasons'      page.pdl        → 0   (exit 1)
grep -ci 'notrestoredreasons'     page.pdl        → 0
grep -c  'NotRestoredReasons'     page.pdl        → 0
grep -c  'notRestoredReasons'     page.pdl.b64    → 0
```

Sweep scope: the whole 61911-byte / 1795-line decoded file and the whole 82548-byte transfer.
The only `Restored*` identifiers are `BackForwardCacheRestore` (1345), `SessionRestored`
(1527), and the `BackForwardCacheNotRestoredReason*` type family (1505, 1663, 1680, 1693) plus
the two `notRestoredExplanations*` fields. The knowledge entry's contrast — "the protocol
field is `notRestoredExplanations`, not the web API `NotRestoredReasons`" — is therefore
**true as written**: the web-facing spelling is absent from this PDL entirely.

## Findings

| # | Finding | Class | Grounding |
|---|---|---|---|
| F1 | S105's anchor cell records `82548 bytes decoded`; 82548 is the base64 transfer size and the decoded body is 61911 bytes. Mixed-basis cell: size from the encoded body, digest from the decoded body. | **observed, defect (narrow, editorial)** | `stat -c %s` on both files; `82548*3/4 = 61911`; committed blob `wc -c` = 61911 |
| F2 | The recorded sha256 matches the decoded body exactly, and the fresh fetch is byte-identical to the committed evidence blob. Source identity holds; nothing here is a paraphrase or a stale copy. | observed, confirms | `sha256sum page.pdl` = `e944a3b1…`; `cmp` identical |
| F3 | Both line anchors (1345 `BackForwardCacheRestore`; 1706 `backForwardCacheNotUsed` with required `notRestoredExplanations` at 1713) are exact at the pinned tag. | observed, confirms | `grep -n` outputs above |
| F4 | `notRestoredReasons` is absent from the pinned PDL in all spellings; the entry's negative claim is correct. | observed, confirms | four sweeps, all 0 |
| F5 | No lane or fleet gate recomputes the anchor's byte count or digest against the blob, so F1 cannot be caught by any gate in the lane — it survives `check-sources.mjs`, `sources-census.sh` and the round's own gates. | observed (gate absence), inference (consequence) | `grep -c sha256 scripts/check-sources.mjs` → 0; census has no digest logic; no script references the blob path |
| F6 | The wrong figure propagated from integration into three committed files (SOURCES.md:120, knowledge:4, lessons/round-24.md:16) while the fetching seat's own record says 61,911. | observed | `grep -rn 82548` (3 non-scratch sites); `w1/ScoutCdpPage.md:10`; `w1/DistillW1.md:21` |

## Observation / inference / unknown

**Observed** (each with the command above): HTTP 200; raw 82548 B; decoded 61911 B / 1795
lines; decoded sha256 `e944a3b1…`; raw sha256 `0823829b…`; fresh bytes identical to the
committed blob; symbols at 1345 / 1348 / 1352 / 1706 / 1713 / 1715; `notRestoredReasons`
absent (0 in four sweeps); the three committed sites carrying `82548`; the absence of any
digest or blob binding in the gates.

**Inference**: (a) the integration step copied the transfer size from the fetch transcript
and appended "decoded" — the wave-1 seat's own number is 61,911, and the digest it recorded
is the decoded one, so the two bases were merged at write-up; (b) because no gate binds the
blob, the defect is not detectable by re-running any lane gate, only by re-opening the URL,
which is what this seat did.

**Unknown**: (i) the anchor's `fetched 2026-10-25` date cannot be proven from bytes — the
committed blob's mtime is 2026-10-25 05:24 and its commit `f6f7f45` is 2026-10-25 05:30
-0300, consistent with a same-day fetch but not proof of the network timestamp; (ii) whether
the upstream tag could later serve different bytes is not testable from here — the tag is
immutable by construction, and today's bytes match the committed ones exactly; (iii) whether
any *other* lane row has the same mixed-basis error was not swept beyond S103–S105 (9 rows
contain the word "bytes"; only S105 says "bytes decoded").

## Consequence for the round's claims

C3's admission does not fall: the source was opened, the digest is real, both anchors are
exact, and the negative claim is correct. What fails is one arithmetic label in the anchor
cell and its two downstream copies — a factual error in a field a reader would use to
re-verify the fetch, sitting in a slot no gate reads. The honest repair is to change
`82548 bytes decoded` to `61911 bytes decoded (82548 raw base64)` at the three sites; it
does not change S105's tier, kind, scope or any axis score, and it does not touch the entry's
argument.

No tool was installed or upgraded for this item (curl, base64, sha256sum, grep, cmp, awk were
already present). No gate, build, linter or formatter was run; no service started; no browser
opened; no credential or session material touched; exactly one HTTP GET was issued.
