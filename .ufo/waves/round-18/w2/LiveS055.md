VERDICT: PASS

# LiveS055 — C1 receipt S055 falsification (TabiR18.LiveS055-2)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; B `2bff864fdfee684ddbcd066cc8e735adaba2735c`;
REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git rev-parse HEAD`; lane tip
`refs/heads/master` = same, detached, `git symbolic-ref -q HEAD` exit 1). Attacker fetched only into
`/tmp/tabir18-s055-lives055`; the producer was used only as a read-only module import
(`decodeBody`/`normalize`), never invoked with `--outdir`. No LANE, fleet, jj, or Git write.
Tool installs: none.

Subject: `corpus/evidence/round-18/source-recheck/S055.json` + `S055.excerpt.txt` (committed at REV:
`git rev-parse REV:…/S055.json` = `2193dd0fe172b976924f1a14494f5c78496e26a3`,
excerpt = `1910d58cadfb2fe276ee8c1dac39b1521165fb76`; `git diff REV --` both paths empty).
Row `corpus/SOURCES.md:69` at REV; quote source `corpus/lessons/round-17.md:61`; note
`corpus/knowledge/source-recheck-round-18.md`.

## 1. Live re-fetch — identity HELD (byte-identical)

Exact receipt argv:
```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabir18-s055-lives055/body -w '%{http_code}' \
  'https://docs.jj-vcs.dev/v0.45.1/git-compatibility/'
```
Observed (2026-10-20, local): `http=200 bytes=11056` (transfer, compressed) `redirects=0
url_effective=https://docs.jj-vcs.dev/v0.45.1/git-compatibility/ content_type=text/html; charset=UTF-8`.
Decoded body on disk: **58 508 bytes**,
**sha256 `5362168d6cd398ea2f6a2d9ed6cad2807f356ee2e8800b277767c2f0987c0367`** — exactly the receipt's
`bytes`/`sha256`. A further fetch (`-D headers`) reproduced the same digest
(`etag: "8b386b325bda2b1ca345395744b297fb-ssl-df"`, `server: Netlify`, `age: 122`,
`cache-control: public,max-age=0,must-revalidate`). The digest is also the one recorded for this URL in
round 17 (`corpus/lessons/round-17.md:61`, S049 cell, 58 508 B, access date 2026-10-20 — the same day),
so this is a same-day independent reproduction, not temporal stability and not a changing archive.
RECEIPT: identity held; no discrepancy. (Static page, so raw-body equality was available and used.)

## 2. Decode + quote location + derivation — HELD

`decode=html-text`, `normalize()` as in `recheck-fetch.mjs:35-40`. Independent reproduction
(`/tmp/tabir18-s055-lives055/verify.mjs`, imports the producer's exported functions read-only):
```
bodySha 5362168d6cd398ea2f6a2d9ed6cad2807f356ee2e8800b277767c2f0987c0367
bytes 58508, normalizedLen 13009
quoteOffset 7179   (receipt quoteOffset 7179)
quoteWords 13      (receipt quoteWords 13; source string 13)
excerptSha e20e5d7e30c4b6af7f51714590207d85160337210e9018c21f72c6a3e2d9eeb6
excerptBytes 1269  (committed S055.excerpt.txt: e20e5d7e…, 1269 B — exact)
```
Quote at offset 7179 reads: "…is that jj commands will usually put the Git repo in a \"detached
HEAD\" state, since in jj there is not concept of a \"currently tracked branch\"." The excerpt is the
producer's `slice(offset-600, offset+len+600)+"\n"` window verbatim. No forgery surface: the offset,
excerpt digest and excerpt bytes are all reproducible from the fetched body.

Counter conditions (`measure-c1.mjs:320-378`) checked field-by-field, not by running it: row `S055`
present and not in `SUPERSEDED` (`measure-c1.mjs:15`); no duplicate `S055.json` (51 json + 51 excerpt
files); `rowUrl` occurs verbatim in the `source` cell at B and REV; 64-hex `sha256`; `quoteFound:true`;
`fetchedAt 2026-10-20T19:06:28.764Z` → ISO day 2026-10-20; `teachesVerdict:held`; `httpStatus:200`;
`command` string-equals `expectedCurlCommand(url)` (checked by reconstruction — `true`); canonical fetch
URL `https://docs.jj-vcs.dev/v0.45.1/git-compatibility` (trailing slash normalised away) also returns
200/58 508 B/same sha (1 redirect to the slash form, body identical — so `--live` would hold);
`producerSha256 f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` =
`sha256(recheck-fetch.mjs at REV)` and the file is absent at B (`git cat-file -e` exit 128).

## 3. Anchor — HELD

- Tag: `GET https://api.github.com/repos/jj-vcs/jj/git/refs/tags/v0.45.1` → 200, `object.sha
  7c41cdeb16b6b321c64e789a966b6adf723816a5`, `type commit`; matches the row's anchor cell. The installed
  tool is the same commit: `jj --version` → `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.
- Raw doc: `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md` → 200,
  12 284 B, sha256 `0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641` — matches
  `anchorObserved`. Quote at raw **:114-115**; paragraph 3 spans **:111-117**, i.e. the receipt's
  "(raw :111-117)" and "¶3" are exact. `S049`'s "¶5" was wrong; the supersession corrects it.
  Registry cell still says `:113-115` (one line of non-quote lead-in); see F3. In the raw file the
  sentence is line-wrapped and carries backticks around `jj`; the receipt's quote is verbatim in the
  fetched HTML-rendered text (offset 7179), which is why `quoteSource` says "rendered form without the
  raw-backtick markup".
- Version pin is real, not an alias of `latest`: `/v0.45.1/` (sha `5362168d…`) ≠
  `/latest/` (sha `db9c9a76…`), and `/latest/` is byte-identical to `/v0.46.0/`. Content probes in
  rendered text: 0.46-only heading "There are two common ways to start using Jujutsu" present in
  v0.46.0 and absent in v0.45.1; 0.45-only "To create a Jujutsu repo backed by a Git repo you already
  have on disk" present in v0.45.1 and absent in v0.46.0. The versioned page really tracks the tag;
  the receipt's "version from the URL path (no version banner in the body)" is accurate — no `0.45.x`
  string occurs in the body. It does carry `rel="canonical" href="https://docs.jj-vcs.dev/latest/…"`,
  which `anchorObserved` omits (F3; harmless — bytes are version-specific).

## 4. Does the quote support the `teaches`? — HELD descriptively; prescriptive tail is DERIVED (disclosed)

Row cell (`SOURCES.md:69`): "supersedes S049 — In a colocated workspace git HEAD is jj-owned and
usually detached with no current branch, so a gate must resolve an exported branch ref, never HEAD".

| Clause | Quote (:114-115) | Other doc text |
|---|---|---|
| "usually detached" | direct: "usually put the Git repo in a 'detached HEAD' state" | — |
| "no current branch" | same sentence: "there is not concept of a 'currently tracked branch'" | — |
| "HEAD is jj-owned" | partial: jj puts it there | :105-106 jj imports/exports refs on every command |
| "a gate must … never HEAD" | **not in quote** | :208 "# Convince jj to update .git/HEAD to point to the working-copy commit's parent" — a comment in the manual `jj git colocation enable` script |

The receipt's `note` states exactly this split ("the tail … is the row own derived rule, grounded at
raw :208") — so the receipt does not present the prescription as quoted text. Operational check of the
derivation, entirely in a private `/tmp` jj colocated repo (jj 0.45.1, `JJ_CONFIG` in /tmp):
`jj git init --colocate`; commit `5890469d8aedcac523bdcd52ac3a58696aab3ba3`; bookmark `master` at it;
`jj new`; `jj bookmark set master -r @` → `HEAD=5890469d…`, `master=f2d3b11f8ec2beef9342c0f61c64874ef729dbf9`
(differ); after `jj describe -m b`, `master=1369abfa0ab95ff1b372f349f71d0f116c79e524`, HEAD still
`5890469d…` (the working-copy commit's parent); `git symbolic-ref -q HEAD` exit 1. So a gate reading
HEAD would read `@-`, not the exported branch tip — the derived rule is substantively correct and the
doc's :208/`Detached HEAD: Yes` (raw :44) support it. Finite limit on the rule's *necessity* (not its
correctness): in LANE today `HEAD == refs/heads/master == 530f40a…`, so HEAD coincidentally equals the
tip; the rule is conservative, not false. No drift, no unreachable.

## 5. Immutable availability vs live product freshness — no drift; one note-level wording defect

Facts (all observed today):
- `GET https://api.github.com/repos/jj-vcs/jj/releases/tags/v0.46.0` → `published_at
  2026-10-07T21:28:17Z`, `prerelease:false`; `releases/latest` = `v0.46.0`. That is 13 days **before**
  this receipt's `fetchedAt`, and `/latest/git-compatibility/` already serves the 0.46.0 bytes.
- The cited release itself (`v0.45.1`) shipped `2026-09-03T16:24:38Z` — before the row was opened
  (2026-10-20, 47 days later), so the note's "or sooner when a release named by a cited row ships"
  names an event already past and cannot trigger for this row
  (`corpus/knowledge/source-recheck-round-18.md`, `verified-at:` line). F2.
- Nevertheless the substance did not drift: the quoted sentence survives at v0.46.0 —
  `docs/git-compatibility.md:146` at tag v0.46.0 (raw sha `135a99ea…`), rendered offset 8133; the raw
  0.45.1→0.46.0 diff touches
  only "Creating a repo backed by an existing Git repo" (raw 4 959 B → 5 250 B,
  `135a99ea40d2e626d0bc282283459650ba864df728449ac9225965578bc4e4bc`), not the colocated section. The
  installed jj is exactly the pinned commit, so the version scope is the lane's tool.

Conclusion: for S055 the receipt evidences **hosting availability + byte immutability of a pinned
version page** (and the quoted sentence is unchanged in the successor release). It does not, by itself,
evidence that the *latest* jj teaches the same thing; that is my separate v0.46.0 check, not the
receipt's. The round-18 lesson Gate already bounds C1 this way ("counts … recheck receipts, not overdue
rows or current product support"), so the main claim as written is not confused. F2 is a note wording
defect (the "sooner" trigger is vacuous for version-pinned rows; the next release did not trigger a
recheck), not a false receipt and not a count defect.

## 6. Findings

- **F1 (scope, non-falsifying):** the quote supports the descriptive clauses; the "never HEAD"
  prescription is a derived rule, openly labelled in `note`. Verified operative in /tmp. No action
  forced on the receipt; if the registry is read as quote-only evidence, the cell overstates the quote.
- **F2 (note wording):** `source-recheck-round-18.md` `verified-at:` "or sooner when a release named
  by a cited row ships (… Jujutsu v0.45.1 …)" is unsatisfiable for S055: v0.45.1 predates the row by
  47 days and v0.46.0 (2026-10-07) was not treated as a trigger. Counterexample is finite and above.
- **F3 (cosmetic):** registry anchor `:113-115` includes one non-quote line (quote is :114-115);
  excerpt is a raw 600-char window cut mid-word at both ends ("he default … but the G") — contract-
  compliant, not standalone-readable; `anchorObserved` omits the `rel=canonical → /latest/` marker
  while correctly noting there is no in-body version banner.

## 7. Limits

One URL, three fetches (all same digest), one decode/normalizer (producer's, imported read-only), one
quote. No browser, no page-tool, no real-site session. No `measure-c1.mjs` execution (conditions read
from source and checked by hand); no recheck producer run into any outdir. The /tmp jj probe is my own
construction, not the lane and not a product claim beyond HEAD-vs-ref behaviour of jj 0.45.1.
S029 is out of scope for this seat.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS055.md
- /tmp/tabir18-s055-lives055/{body,body2,body-noslash,headers,raw.md,raw-v0.45.1.md,raw-v0.44.0.md,raw-v0.45.0.md,raw-v0.46.0.md,html-v0.44.0,html-v0.45.0,html-v0.46.0,latest.html,tag-ref.json,rel-v0.45.1.json,rel-v0.46.0.json,rel-latest.json,verify.mjs,textdiff.mjs,q046.mjs,pindiff.mjs}
- /tmp/tabir18-s055-jjprobe/{jjconfig.toml,repo/.jj,repo/.git,repo/f.txt,repo/g.txt}
