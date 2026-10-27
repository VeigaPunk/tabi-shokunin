# Fetch receipts — frontier source opening for C1 (S142 draft)

Seat: ScribeSrcGitDocs (leaf). Scratch root used for raw bytes:
`/fast/scratch/hyaku/tabi-r36/ScribeSrcGitDocs/fetch/` (HTML kept in scratch only; the
digests below are the audit handle).

## Commands (verbatim)

```
cd /fast/scratch/hyaku/tabi-r36/ScribeSrcGitDocs/fetch
curl -sSL -o git-show.html -w "%{http_code} %{size_download} %{url_effective}\n" https://git-scm.com/docs/git-show
curl -sSL -o git-diff.html -w "%{http_code} %{size_download} %{url_effective}\n" https://git-scm.com/docs/git-diff
date -u +%Y-%m-%dT%H:%M:%SZ
sha256sum git-show.html git-diff.html
wc -c git-show.html git-diff.html
```

curl ran in one `for` loop over `git-show git-diff`; the two lines below are the loop's own
`-w` output, in order.

| source | URL | HTTP | bytes | sha256 (raw fetch) |
|---|---|---|---|---|
| git-show | https://git-scm.com/docs/git-show | 200 | 246,608 | `0a95cbcd8868054d851eedb192864798092c597592851989f5d1bb392730168a` |
| git-diff (support) | https://git-scm.com/docs/git-diff | 200 | 229,155 | `5ae80d1deee5dc2c1acafff5491c5ba019629b9a785e6781a3e8a411cf9e22ed` |

- Access timestamp: **2026-10-27T09:29:57Z** (`date -u` taken immediately after both fetches
  returned; the two requests were issued inside the same loop, so this single reading bounds
  both).
- Effective URLs reported by curl were the canonical pages (no redirect chain observed in the
  `%{url_effective}` field).
- Titles: `git-show - Show various types of objects`; the git-diff page's DESCRIPTION begins
  `Show changes between the working tree and the index or a tree, …`.

## Quote selection (C1 §2b.4 — git-object addressing)

Primary, ≤25 words, located in the fetched bytes:

> Shows one or more objects (blobs, trees, tags and commits).

- Location: `git-show.html` line **3272**, §DESCRIPTION, first paragraph.
- Word count: **10** (checked by splitting on whitespace).
- Fidelity check: the string is present verbatim in the tag-stripped page text
  (`q1 in plain: True`).

Revision-addressing support, same page, §EXAMPLES (the form the drift auditor actually calls —
`git show <rev>:<path>`):

> Shows the contents of the file Documentation/README as they were current in the 10th last commit of the branch next.

- Location: `git-show.html` lines **5566-5571** (synopsis `git show next~10:Documentation/README`
  at line 5566, definition paragraph at 5568-5571).
- Word count: **20**.
- Fidelity caveat: the paragraph is hard-wrapped across lines 5568-5571 and carries
  `<span class='synopsis'><code>` markup, so the quote above is **whitespace-normalised and
  markup-stripped**; the words and their order are the page's.

Secondary source (git-diff), §DESCRIPTION:

> Show changes between the working tree and the index or a tree, changes between the index and a tree, changes between two trees, changes resulting from a merge, changes between two blob objects, or changes between two files on disk.

- Location: `git-diff.html` lines **3243-3246**.
- Word count: **41** — over the 25-word cap, so it is recorded as a location, not as an
  admitted quote. The ≤25-word fragment used in the S142 anchor is
  `changes between two blob objects` (line 3245), which the tag-stripped page contains verbatim
  (checked: `True`).
- Why it is support only: git-diff states *what* a diff compares (including two blob objects);
  it does not state the `<rev>:<path>` blob-read syntax the audit invokes, which is the
  git-show EXAMPLES entry above.

## Limits of these receipts

- `https://git-scm.com/docs/git-show` is a **living page**, not a versioned manual: the
  sha256 pins *what this seat read*, not a stable artifact. The page's own version chrome
  showed git release notes down to 2014 at the foot of the page; no release tag is attached to
  the DESCRIPTION text, so the quote is cited by page + line, never by version.
- The general `<rev>:<path>` grammar lives in **gitrevisions(7)**, which was **not opened this
  round**. The example `next~10:Documentation/README` demonstrates the form; the full syntax
  table is unverified here. Recorded as a limit on the S142 row and on the knowledge entry.
- This seat launched no git object reads against a fixture beyond `git -C <lane> show` /
  `rev-parse` reads of the lane repo (read-only) and no measurement.
