# RevS150 — re-open S150 (node:crypto docs)

Seat: RevS150 (leaf, no subagents dispatched)
Milestone: re-open S150 (node:crypto docs)
Date: 2026-10-29

## Assignment
Re-open https://nodejs.org/docs/latest-v24.x/api/crypto.html via read-only GET; compare sha256 to pinned 4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af; verify registry row S150 in corpus/SOURCES.md (verbatim flat-byte quote, ≤25 words, no pipes, 11 cells, tier A, status mined); agree/disagree with the admit.

## Commands and observed output

1. Staged copy check (pre-existing staged bytes):
   `sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/sources/crypto.html`
   → `4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af  .../sources/crypto.html`; size `681625` bytes, mtime `Oct 29 17:24`.

2. Live re-open (read-only GET into scratch):
   `curl -sS -o crypto-live.html "https://nodejs.org/docs/latest-v24.x/api/crypto.html"` (cwd `/fast/scratch/hyaku/tabi-r43/RevS150`)
   → `sha256sum crypto-live.html` = `4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af`; size `681625` bytes. **No byte drift.**
   → `cmp -s crypto-live.html .../sources/crypto.html` → byte-identical (exit 0).

3. Registry row (SOURCES.md line 164):
   `grep -n "S150" corpus/SOURCES.md` — one row, pipe-delimited, `awk -F'|'` cell count `NF-2 = 11`. Cells:
   1 `S150`; 2 `Node.js Crypto documentation — https://nodejs.org/docs/latest-v24.x/api/crypto.html`; 3 `docs`; 4 `A`; 5 receipt-authenticity instrument description; 6 `§Crypto API index line, node v24.x docs page (681,625 B, sha256 4b7024df...c50c42af); opened 2026-10-29`; 7 quote; 8 `mined`; 9 `2026-10-29`; 10 `on-release`; 11 `corpus/knowledge/receipt-authenticity-signing-round-43.md`.

4. Quote verification against staged copy:
   `grep -qF -- 'createPrivateKey, createPublicKey, generateKeyPair, sign, verify,' .../sources/crypto.html` → FOUND (verbatim flat-byte substring).
   `grep -boF ...` → byte offset `85163` (only one occurrence region; the five identifiers appear consecutively in one code sample).
   Context at offset 85120: `<span class="hljs-keyword">const</span> {\n  createPrivateKey, createPublicKey, generateKeyPair, sign, verify,\n} = <span class="hljs-keyword">await</span> <span class="hljs-keyword">import</span>(<span class="hljs-string">` — i.e. the quote is a line inside the docs' code sample destructuring `const { ... } = await import('node:crypto')`. The "§Crypto API index line" description in the evidence cell is accurate.
   Word count: `wc -w` on the quote = `5` (≤25). Pipe count in quote = `0`.

5. Knowledge note (cell 11): `corpus/knowledge/receipt-authenticity-signing-round-43.md` exists (6183 B, mtime Oct 29 17:51).

## Invariant-by-invariant result

| Check | Spec | Observed | Result |
|---|---|---|---|
| live sha256 | 4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af | 4b7024df...c50c42af | PASS (no drift) |
| live vs staged | — | byte-identical (`cmp` exit 0) | PASS |
| live size | registry evidence says 681,625 B | 681,625 B | PASS |
| quote verbatim flat-byte substring of staged | required | FOUND at offset 85163 | PASS |
| quote ≤25 words | required | 5 words | PASS |
| quote no pipes | required | 0 pipes | PASS |
| cells = 11 | required | 11 | PASS |
| tier | A | A (cell 4) | PASS |
| status | mined | mined (cell 8) | PASS |
| knowledge note exists | cell 11 | exists | PASS |

## Agree/disagree with admit

**Agree.** All registry invariants are empirically verified, not asserted: the live page is byte-identical to the staged copy and to the pinned digest, so the quote-locates claim is invariant under today's re-open. The quote is a genuine, semantically meaningful anchor — the destructured identifier list from the `node:crypto` import code sample at the top of the API docs, directly naming the five primitives (createPrivateKey, createPublicKey, generateKeyPair, sign, verify) that the round-43 Ed25519 receipt-signing chain uses; the trailing comma is part of the literal sample. Field hygiene is clean: exactly 11 cells, tier A, status mined, 5-word quote, no pipes. Cell 6's size/hash evidence matches the staged bytes exactly. No grounds for demotion; admit stands.

## Evidence and limitations
- Evidence: the staged copy `.ufo/waves/round-43/sources/crypto.html` (hash, size, offset 85163 context) and live GET `crypto-live.html` are byte-identical, so no separate evidence artifact was copied into the wave dir; the committed staged copy is itself the evidence. Command transcripts above are the record.
- Fetch performed once at 2026-10-29 with curl (read-only GET; no login/forms). A single-point re-open cannot detect drift between the mining time and now beyond "identical at both sampled instants"; both sampled instants agree.
- Tools: only pre-installed host tools (curl, sha256sum, grep, awk, dd, cmp, stat). No installs performed; no tools added/upgraded this seat (nothing to record under the operator tooling rule).

## Cleanup
Scratch `/fast/scratch/hyaku/tabi-r43/RevS150` deleted before yield (`rm -rf`). No writes outside the seat report path and scratch. No git/jj mutations. No fleet-repo or sibling-repo writes.

VERDICT ok re-open S150: no byte drift (live sha256 == pinned 4b7024df…c50c42af), registry row verified end-to-end (quote verbatim at offset 85163, 5 words, no pipes, 11 cells, tier A, mined) — admit agreed
