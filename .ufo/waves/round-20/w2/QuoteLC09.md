# QuoteLC09 — literal quote, line, source identity, and anchor check

Scope: LC09 only. Inputs: `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/SOURCES.md`, checked against `corpus/evidence/round-20/sources/html_form_element.cc` at checkpoint `4ae99816b8994fdedc159156d8d9d242dd5c4782` (equal to HEAD). Semantic entailment is not evaluated. Runtime behaviour is not claimed (source-only).

## Verdict: PASS on every scoped check

| Check | Result | Evidence |
|---|---|---|
| Literal quote | PASS | `decisions.json` LC09.quote = `could not be serialized to JSON` (ASCII, 31 chars). Byte-exact substring of exactly one physical line in the source. |
| Whitespace words ≤ 25 | PASS | 6 words. |
| Physical line of quote | PASS | line 311 (`"could not be serialized to JSON")));`, leading indentation omitted). |
| Row span (`startLine`/`endLine`) | PASS | 298 = `  if (resolved) {`; 319 = `    tool->CallDoneCallback(result);`. 311 ∈ [298, 319]. |
| Source assignment | PASS | LC09 has no `sourceId` key and inherits file-level `source.id` = S096. Only LC11 carries an explicit `sourceId` (S100). |
| Source identity | PASS | See below. |
| Cited-row anchor containment | PASS | SOURCES S096 anchors `html_form_element.cc:174-328,729-758,818-842`; [298, 319] ⊆ [174, 328]. S100 anchors `174-328,635-842` also contain it. |

## Source identity (all match)

- Path: `corpus/evidence/round-20/sources/html_form_element.cc`. This matches `decisions.json` `source.path` and `.ufo/waves/round-20/source-opening.json` `retainedPath`.
- Git blob at checkpoint `4ae99816`: `cd7efa45834bfce0697b06c7092f16d084c4eb55`. Working-tree `git hash-object` returns the same value. `git status` is clean for this file.
- Repo bytes: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68278 bytes, 1740 newline-terminated lines, no CR, no non-ASCII bytes. This matches:
  - `decisions.json` `source.sha256`;
  - SOURCES S096 "decoded sha256" (full 64 hex);
  - SOURCES S100 "decoded sha256";
  - `source-opening.json` `decodedSha256` and `decodedBytes` (68278).
- Upstream primary source: `decisions.json` `source.url` equals the SOURCES S096 URL (`…/refs/tags/154.0.8037.97/…/html_form_element.cc?format=TEXT`). Fetched read-only and base64-decoded, its bytes are byte-identical to the repo file (`cmp`) and have sha256 `8c8d6796…6916`.
- Tag `154.0.8037.97` resolves to commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. This matches the commit in the SOURCES S096 row. The commit-pinned path URL decodes to the same sha256.
- Checkpoint blobs equal working tree for the inputs: `decisions.json` `f5a55b3d1b88e801947a59dca8364aa0d3d5c676`; `SOURCES.md` `07f5d2e48a237a776c4d831a9a6f0bc2183f2ad0`.

## Exact quote and physical lines

- Line 310 (fragment of the same C++ message): `"respondWith promise resolved with an object that "`
- Line 311 (LC09 quote): `"could not be serialized to JSON")));`
- The message is split across 310–311. The cited literal lies wholly on 311, and no other physical line in the file contains it.

## Non-blocking notes (not LC09 defects)

1. LC08 (`startLine` 290, `endLine` 298) and LC09 (`startLine` 298) share physical line 298 (`if (resolved) {`). LC09's containment holds. LC08's boundary was not checked.
2. The SOURCES S096 row records URL, sha256 and anchors but no local-path column. The local path lives in `decisions.json` `source.path` and `source-opening.json` `retainedPath`, and these agree.
3. LC11 explicitly carries `sourceId: S100` as the assignment expects. LC11 was not otherwise checked.

## Not checked

- Semantic entailment of LC09 condition and outcome against the source. This is separate, per assignment.
- Runtime behaviour. Scope is source-only.
- Other decision rows and other SOURCES rows.

## Method and tooling

- Read-only: `git rev-parse`, `git hash-object`, `git status --short`, `sha256sum`, `wc -l`, `cmp`, `curl` plus `base64` for the Gitiles fetch, and read-only Python parsing of JSON and the source.
- No tests, builds, or formatters. No edits to corpus, source, or production files. Only this report was written.
- Installs or updates: none. A temporary fetch file under `/tmp` was removed.
