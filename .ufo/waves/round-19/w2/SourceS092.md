# SourceS092 — round-19 source falsification

- Attacked checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R).
- Axes: source fidelity; teaches/contract entailment; status/admission calibration. Scope: S092, plus the expressly requested S094 rejection check; no other queued source was mined.
- **Finding: agree with S092 as a queued, tier-A primary documentation source.** Its quote, version/commit, decoded hash and narrowly scoped teaches are supported. No source drift found. **Agree with S094 rejection; no status flip is justified.** Its error-body hash changed only because the server generated a different request ID.
- Confidence: high for the observed documents, hashes and registry state; no runtime or implementation-equivalence claim.

## Checkpoint binding and registry state

Read-only `git rev-parse R:<path>` and `git hash-object <absolute-path>` produced matching blob IDs for the inspected current files, binding these observations to R:

| Path | Blob at R and on disk |
|---|---|
| `corpus/SOURCES.md` | `77aaede0098f251f289461f23fcf66f52b42bcf1` |
| `corpus/lessons/round-19.md` | `e76dfde1f6e9e79f510fabd1ea88ee2e6d6fe31e` |
| `.ufo/waves/round-19/w1/SrcSignalsChild.gate.json` | `b07bd807a5775ca9234bc8c92540730873e826a0` |
| `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `e0897bf9ca08d18612876dc8db9eb4278b0160ee` |
| `corpus/evidence/round-19/sources/form_mcp_schema_unittest-404.txt.gz` | `48926e8989fdd5f20efe1c65b7f23294ec22b7d5` |

`corpus/SOURCES.md:106` records S092 as `docs | A`, scoped to Node v24.21.0 child lifecycle/signal delivery, POSIX group/session behavior with Windows separated; status `queued`, opened `2026-10-21`, recheck `on-release`, used-by `—`. All are appropriate: Node's official versioned API documentation is primary authority for its documented API contract, not an implementation trace or a browser-cleanup receipt. `corpus/lessons/round-19.md:48` is a located discovery citation, not knowledge admission. Its status summary at lines 53–54 also leaves S092 queued. Literal searches of the round-19 knowledge note and `SKILL.md` found no S092/child_process.md citation; this is textual evidence only, not semantic proof of non-use.

The lesson names `.ufo/waves/round-19/w1/SrcSignalsChild.md` and `.ufo/waves/round-19/w1/SrcSignalsChild.gate.json`; the latter's lines 3–10 agree on URL, date, quote, word count, location, decoded hash and retained-body path. No SOURCES status or used-by field was changed.

## S092 — exact fetch, quote and immutable identity

Access: **2026-10-21**, `08:40:39.814453+00:00`. Exact registry/lesson URL, also the final URL (no redirect):

https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md

Observed HTTP **200**, `text/plain; charset=utf-8`, no Content-Encoding (identity). Decoded body: **86,669 bytes**; SHA-256:

`32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a`

This exactly matches `corpus/lessons/round-19.md:48` and the gate's line 9. The lesson's quote is:

> On non-Windows platforms, if `options.detached` is set to `true`, the child process will be made the leader of a new process group and session.

**24 whitespace-delimited words.** Location: `doc/api/child_process.md`, §`options.detached`, source lines **912–913** (within the lesson's valid, broader 912–915 anchor). The quote occurs exactly after folding the source's line break to a space. Lines 913–915 continue with a separate statement about children continuing after parent exit; those extra sentences are not part of the 24-word quote. URL/date/SHA for this quote are the exact values above.

Independent commit-addressed corroboration, fetched on the same date at `08:40:39.848377+00:00`:

https://raw.githubusercontent.com/nodejs/node/955266bfdd854cd280dffd47548673914484e4c0/doc/api/child_process.md

HTTP **200**, **86,669 bytes**, same SHA-256; the two fetched bodies were byte-for-byte equal. The tag's official GitHub API metadata was also fetched:

| Exact URL | HTTP / decoded bytes / decoded SHA-256 |
|---|---|
| https://api.github.com/repos/nodejs/node/git/ref/tags/v24.21.0 | 200 / 329 / `c5b5a099add6b82a24df0b6ec04e9c242cc720a3196455522c2887dec30c52e1` |
| https://api.github.com/repos/nodejs/node/git/tags/f37d7da830134b5314a14ced553273786a2bb4cd | 200 / 1,770 / `6de486a5e9f4a2a91ffab5ffc9c2f59fdd1684f44e30d4db8e29c517a0e9bb77` |

Accessed 2026-10-21 at `08:40:40.091608+00:00` and `08:41:21.574473+00:00`, respectively. Observed mapping: `v24.21.0` → annotated tag `f37d7da830134b5314a14ced553273786a2bb4cd` → commit `955266bfdd854cd280dffd47548673914484e4c0`. This agrees with the row. GPG signature verification was not performed.

Retained decoded S092 body, gzip with mtime 0:

- `.ufo/waves/round-19/w2/SourceS092.body.gz`
- Compressed size **18,181 bytes**; compressed SHA-256 `7f2a5245611cd894939fc74b8e4fbbc9ef43de43a2a15c93ff27714a12f537a2`.

## Source-versus-teaches entailment

All source locations below refer to the S092 URL, accessed 2026-10-21, decoded SHA-256 `32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a`.

| Row teaching | Observed source | Assessment |
|---|---|---|
| POSIX detached children lead a new process group/session | §`options.detached`, 912–913; Windows behavior is separately described at 907–910 | Supported within the row's stated platform scope. Detachment itself is not a cleanup operation. |
| `subprocess.kill()` signals the child, not recursively its Linux descendants | §`subprocess.kill([signal])`, 1675–1678 says the method targets the child and its boolean reports kill(2) success; 1726–1728 separately documents the Linux descendant caveat | Supported as a non-recursive cleanup warning. Do not strengthen this into a claim that group signals or a child's own signal handler can never affect descendants. |
| Successful delivery is not proof of termination | 1712–1713 explicitly warns the signal may not terminate; §`subprocess.killed`, 1790–1795 separates delivery from termination | Directly supported. |

Additional short verbatim anchors (word counts use whitespace; each ≤25):

- **10 words**, §`subprocess.kill([signal])`, line 1675: “The `subprocess.kill()` method sends a signal to the child process.”
- **17 words**, same section, lines 1726–1727: “On Linux, child processes of child processes will not be terminated when attempting to kill their parent.”
- **13 words**, §`subprocess.killed`, lines 1794–1795: “The `killed` property does not indicate that the child process has been terminated.”

**Boundary:** this is released-version API documentation, neither a proposal/spec-only WebMCP source nor an inspected Node implementation. It does not by itself prove process-group signaling syntax, Chromium/Playwright descendant ownership, which signal a harness actually sent, or completed reaping. Those require separate implementation/runtime evidence. The original dossier's `.ufo/waves/round-19/w1/SrcSignalsChild.md:50–55` likewise separates harness requirements from Node guarantees. Round-19 lesson lines 22–25 correctly treat H1 signal behavior as baseline informational coverage, not new runtime operability credit. No new runtime claim is admitted here.

## S094 — rejection and flip condition

Exact attempted URL and final URL, fetched **2026-10-21**, `08:40:40.128301+00:00`:

https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema_unittest.cc?format=TEXT

Observed HTTP **404**, decoded text/plain response **233 bytes**, SHA-256:

`cb734b18145242bdb97ee92de6195fbf1cbe9fb1a3de551ea6f842f5f90af840`

Located quote, response line **1**, **6 words**:

> NOT_FOUND: Requested entity was not found

The retained R response also decodes to **233 bytes** and hashes to the recorded `9d640282763185d862683fc9f41bea0e42783725a1e344ff193e0cc05bdc8b19`. Comparing decoded responses showed equality after removing only their `request_id:` lines. Thus the changed SHA is request-metadata drift in a generated error body, not drift in immutable Chromium source or evidence that the missing file appeared. The stable quote remains exact.

`corpus/SOURCES.md:108` scopes S094 only to this attempted path, tier C, `rejected`, opened 2026-10-21, recheck `on-release`, used-by `corpus/lessons/round-19.md`; the cited path exists at R and records the exclusion at lines 51 and 55–56. **Agree** with that narrowly scoped rejection. This fetch establishes an unavailable path, not that Chromium has no relevant tests anywhere.

**Flip assessment:** no flip now. The row's stated condition—an actually resolvable test source with a located quote—is reasonable for a separately validated/replaced source, not permission to promote this HTTP404 response. The named alternative test remains an unopened lead in this audit; neither it nor any other queued row is mined. A different working filename would not retroactively make this exact URL valid.

New error response retained as `.ufo/waves/round-19/w2/SourceS092.s094.body.gz`: **183 compressed bytes**, compressed SHA-256 `c6ad425e63a138ed9d57550571843b60673bc3cb64d14df61011623cec5f77fb`.

## Method, confidence and remaining gaps

- `xd://lsp` returned **No such tool** with the mounted-device inventory; no server/status operation is available. This was not an empty cold-index result. Searches and line checks here are explicitly literal/documentary evidence, not semantic definition/reference proof. No exported code contract was changed.
- Performed only this item's public HTTPS fetches, decoded-body hashes, quote containment/word counts, tag mapping, checkpoint blob comparisons and rejected-response comparison. No browser, runtime/mutation probe, build, lint, test suite or orchestration runtime was run. Tool installs/updates: **none**.
- The ranged web `read` output omitted some requested raw source lines; reported via `xd://report_issue`. Numbered clause evidence above instead comes from the exact retained decoded response, corroborated by literal URL searches.
- Remaining unknowns: actual harness descendant ownership and signal/reaping behavior were not exercised; no implementation guarantee is inferred from documentation. No unresolved source/hash/registry discrepancy was found for S092. S094 remains unavailable at the exact attempted URL.

## Isolation

- Clone / branch / production commit: **not applicable**; source-only advisory audit, no runtime/mutation probe and no production changes. Target revision: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Only lane files written: `.ufo/waves/round-19/w2/SourceS092.md`, `.ufo/waves/round-19/w2/SourceS092.body.gz`, `.ufo/waves/round-19/w2/SourceS092.s094.body.gz`.
- No SOURCES edits, lane Git/jj writes, sibling/fleet/source-tree writes, browser-profile access, host mutation or live secrets. Read-only Git commands were `rev-parse` and `hash-object` without `-w`. All fetch workers finished within their tool calls; no background job or owned process remains.
