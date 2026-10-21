# ReviewRawDecoded — round 20 S096 raw gzip → base64 → `.cc` identity

Seat: `TabiR20.ReviewRawDecoded` (leaf; no dispatch). Revision: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (HEAD; the three artifacts below are tracked at this revision).
Scope: `.ufo/waves/round-20/source-opening.json`, its retained raw bytes `.ufo/waves/round-20/source-opened.base64.gz`, and the retained `corpus/evidence/round-20/sources/html_form_element.cc`. Content identity only. No authenticity claim, no publisher-independence claim, no runtime claim, no quote or span check.

## Verdict

1. **Decode identity holds.** Retained gzip → gunzip → Gitiles TEXT base64 body → base64 decode gives sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68278 bytes, byte-identical (`cmp` exit 0) to the retained `.cc`.
2. **The recorded raw fields do not bind the retained raw file (F1).** `rawSha256` and `rawBytes` describe the gunzipped Gitiles body. A literal check of `rawRetainedPath` fails.
3. **First retrieval is unresolved (F4).** The only access timestamp in the record is the refetch, 2026-10-21T10:02:55.751763Z to 10:02:56.802538Z. The first-retrieval time is not captured, and no retained artifact supplies it.

## Chain (observed)

Read-only pipes and digests only; values from this seat's runs.

| step | artifact | bytes | sha256 | compared with | result |
|---|---|---|---|---|---|
| 0 | `.ufo/waves/round-20/source-opened.base64.gz` (regular file; `gzip -t` exit 0) | 25397 | `46966f0544d0d9628cd6d3823b1898fe224116a80aaff2e24a5b38da34281e52` | `rawSha256` and `rawBytes` in source-opening.json | **mismatch** (F1): both fields describe step 1 |
| 1 | `gzip -dc` of step 0 (`gzip -l` uncompressed 91040) | 91040 | `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed` | `rawSha256` ff55…, `rawBytes` 91040 | match, on the gunzipped body |
| 2 | `base64 -d` of step 1 | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `decodedSha256`, `decodedBytes` 68278; `cmp` vs step 3 exit 0 | match |
| 3 | `corpus/evidence/round-20/sources/html_form_element.cc` (regular file) | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | S096 pin in `design.json` and `corpus/SOURCES.md` | match; 1740 LF lines, no CR, no BOM, LF-terminated |

Step 0 header (`od`): `1f 8b 08 00 00 00 00 00 02 ff` — MTIME 0, XFL 2, OS 255, no FNAME; trailer passes `gzip -t`. Step 1 body: 91040 base64 characters, zero newlines, length divisible by 4, final `==` consistent with 68278 mod 3 = 1, last quad `Cg==` decoding to the final LF of the `.cc`.

### Identity bindings beyond sha256

- Git at HEAD `4ae99816`: `source-opened.base64.gz` blob `7dcfeeb92835f02feb106069934239f475e4d1b3`; `source-opening.json` blob `f0b96b5e3b97bd461fa82ae17cc2dfcada218cf4` (sha256 `36a8888b8885a7bb587208d65734f740c91e49e623115be6c9601525d78c7080`); `html_form_element.cc` blob `cd7efa45834bfce0697b06c7092f16d084c4eb55`. One commit, `4ae9981` (2026-10-21T07:21:32-03:00), is the only one touching these paths. `git diff HEAD` on the three paths is empty.
- `git hash-object` of the retained `.cc` is `cd7efa45834bfce0697b06c7092f16d084c4eb55`. Upstream Gitiles `forms/?format=JSON` at tag `154.0.8037.97` lists `html_form_element.cc` with the same blob id. This is git's SHA-1 object identity, not authenticity.
- Tag to commit: Gitiles `refs/tags/154.0.8037.97?format=JSON` gives `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, matching the S096 row.
- This seat's refetches, tag URL and commit URL: body sha256 `ff55d511…19ed`; decoded sha256 `8c8d6796…6916`; 68278 bytes.
- Round-19 committed `corpus/evidence/round-19/sources/html_form_element.cc.gz` (blob `8e8134ee120d7f1db1f6bd5e0076306c9d97867b`): `gzip -dc` gives `8c8d6796…6916`, 68278 bytes, `gzip -t` exit 0. Same bytes, so not independent corroboration.
- The recheck command in `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` line 3 (`curl … ?format=TEXT | base64 -d | sha256sum`) prints `8c8d6796…6916` when run here (equivalent pipeline; `-L` omitted, no redirect observed).

## Timeline (UTC; file mtimes converted from -03:00)

| time | event | source | kind |
|---|---|---|---|
| 09:49:12.345 | `.cc` mtime | stat | write time |
| 09:52:32.343 | `openingRecordedAt` | source-opening.json | recording time |
| 10:02:55.752 to 10:02:56.803 | refetch | source-opening.json `refetchStartedAt` / `refetchFinishedAt` | access (refetch) |
| 10:02:56.8045 and 10:02:56.8056 | `.gz` and `.json` mtimes | stat | write, about 2 ms after `refetchFinishedAt` |
| 10:21:32 | commit `4ae9981` adds all three paths | git log | commit time |
| 10:22:43.861 | `w2/before.json`: `trackedDiff` empty; the three paths are not in status | file | status snapshot |
| 10:26:42 to 10:26:46 | this seat's tag and commit refetches | curl | access (this seat) |
| 10:29:18 to 10:29:19 | this seat's forms tree JSON | curl | access (this seat) |

The `.gz` and `.json` mtimes land about 2 ms after `refetchFinishedAt`, at the end of the refetch, so the retained raw bytes were most likely written by the refetch [INFERENCE from mtimes; consistent with `w1/CriticIsolation.md:104`]. No timestamp in the record is a first-retrieval time.

## Findings

**F1 — Raw digest and size belong to the gunzipped body, not the retained file (medium; record defect, no decoded-identity effect).**
`rawRetainedPath` names the `.gz`. Its sha256 is `46966f0544d0d9628cd6d3823b1898fe224116a80aaff2e24a5b38da34281e52` and its size is 25397 B. `rawSha256` `ff55d511…19ed` and `rawBytes` 91040 are the gunzipped body. A reviewer who follows the field names fails a correct chain. The `retrieval` string (`urllib.request.urlopen, base64.b64decode Gitiles TEXT`) names neither a gzip step nor a gunzip step. The repo convention is "carrier sha256 = base64 bytes as served" (`.ufo/waves/round-18/sources/DeclarativeValidation.md:12`), so the value follows convention, but the key binds the wrong object for this file.
Fix: annotate the keys — e.g. `carrierBodySha256` / `carrierBodyBytes` for the gunzipped body, `retainedGzSha256` / `retainedGzBytes` for the file — and state the gunzip step in `retrieval`. `source-opening.json` is a round-20 artifact, not historical bytes, so it may be corrected in place. If the main seat freezes commit `4ae9981`, record an append-only correction instead.

**F2 — The gzip producer is not recorded (low).** The record has no command, tool, level or date for the compression. The header (MTIME 0, XFL 2, OS 255, no FNAME) matches Python's `gzip` at level 9 with mtime 0 [INFERENCE from header only; no recompression was run]. The `.gz` cannot be re-derived from the manifest alone; its gunzipped content can, as shown above.

**F3 — The `.gz` has no recorded digest (low).** A repo-wide search for `46966f05`, `7dcfeeb9` (git blob) and `f0b96b5e` (json blob) returns zero matches. The file is bound only by its tracked HEAD blob. Record its sha256 and size alongside F1's fields.

**F4 — First-retrieval time is unresolved (informational; matches the record's own disclosure).** `initialRetrievalTimestamp` reads "not captured" and cites a "direct before-dispatch status snapshot". No retained artifact matches that description:
- `w2/before.json` (10:22:43Z) does not name the `.cc`. By then the file is tracked (commit at 10:21:32Z), so it does not appear in status.
- `census-before.json` (validate output, 09:51Z) names the S096 URL, not file bytes.
- `source-counts-before.json`, which `w1/CriticIsolation.md:105` reports present in listings at 06:52 -03, is absent.
The `.cc` mtime (09:49:12Z) and `openingRecordedAt` (09:52:32Z) are write and recording times; neither is a retrieval time. `openingRecordedAt` appears carried over from the pre-refetch record, since the JSON was rewritten at 10:02:56Z [INFERENCE; `w1/CriticIsolation.md:104`].

**F5 — Stale sibling findings (resolved at HEAD).** `w1/ReviewSourceContract.md:35` and `w1/CriticScope.md:16` report the retained `.cc` and round-20 inputs as untracked (`??`). At `4ae99816` all three artifacts are tracked. Those reports predate commit `4ae9981`.

**F6 — Pointer drift (minor).** `w1/ScoutSourceFidelity.md:36` (row E7) cites `source-opening.json:7` for `8c8d6796…`. In the current file that digest is on line 6; line 7 is `decodedBytes`.

## Not checked

- Quote and span checks for LC01–LC12 and the S100 span 787–815. Only the line count was checked (1740 lines, which covers spans through 830).
- Authenticity: no TLS chain check and no commit-signature check. Equal bytes across several access times show repeatability, not publisher authenticity or independence.
- The gzip producer was not re-run (F2).
- First retrieval cannot be determined from retained artifacts (F4).

## Provenance and writes

- Repo writes: this report only. The first `git status --porcelain=v1 -uall` ran without `--no-optional-locks`, which can refresh the index stat cache; no content change is observed (`git diff HEAD` on the three paths is empty). Later git calls used `--no-optional-locks`.
- Network: seven read-only GET requests to chromium.googlesource.com — tag body (sha256, decoded sha256, decoded size), commit body, commit decoded sha256, tag JSON, forms tree JSON.
- Installs or updates: none. Tools used: `base64`, `gzip`, `sha256sum`, `cmp`, `od`, `wc`, `tr`, `stat`, `git`, `curl`, `jq` (present; checked with `command -v`).
- Production trees and clones untouched. No tests, builds or formatters run.

Report: `.ufo/waves/round-20/w2/ReviewRawDecoded.md`
