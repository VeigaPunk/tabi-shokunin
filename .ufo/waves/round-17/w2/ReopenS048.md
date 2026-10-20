VERDICT: ISSUES

# Reopen S048 — Debug WebMCP tools (Chrome DevTools)

Seat `TabiR17.ReopenS048`, leaf. M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`.
All checks below were run; nothing is inferred unless marked `[INFERENCE]`.

## Attacked

1. S048's URL resolves and the page is the same revision the row names.
2. Anchor cells (`§Test tools manually` id `test-tools`, `§Invoked tools` id `invoked-tools`, last-updated date).
3. The wave-1 Gate quote in `.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md`:68 — verbatim, ≤25 words, at its stated location.
4. Recorded sha256 (`9bd94f41…a87e5`) and body size (191224 B).
5. Tier `A`, `scope`, `teaches` honesty.
6. Status `mined` / `used-by` consistency at M.

## Evidence

### URL and revision — HOLDS

```
curl -sSL -A '…Chrome/154.0.0.0…' -D h -o body.html https://developer.chrome.com/docs/devtools/application/webmcp
HTTP:200 SIZE:191224 URL:https://developer.chrome.com/docs/devtools/application/webmcp
last-modified: Tue, 12 May 2026 07:00:00 GMT
```
- In-page `Last updated 2026-05-12` present; `<link rel="canonical" href="https://developer.chrome.com/docs/devtools/application/webmcp">` matches the row URL exactly.
- Byte size 191224 equals the row's `fetched body 191224 B`.

### Anchors — HOLDS

Live body contains `id="test-tools"` (`<h2 … data-text="Test tools manually">`) and `id="invoked-tools"` (`<h3 … data-text="Invoked tools">`). Both ids the row cites exist at M's cited revision, with the row's 2026-05-12 date. Anchor is section + publication date, not a bare homepage (SOURCES contract, `anchor`).

### Gate quote — HOLDS, exact

Dossier: `"The result of the invocation (Completed, Canceled, In Progress, or Error.)"` — §Invoked tools, Status bullet, fragment at byte 167237.

Live body:
- `b.find(b'The result of the invocation')` → **167237** (exact match to the dossier's claimed offset).
- Context: `<h3 id="invoked-tools" …>Invoked tools</h3> … <li><strong>Status:</strong> The result of the invocation (Completed, Canceled, In Progress, or Error.)</li>`.
- Quote is 11 words (≤25), contiguous on the served bytes.

Independent corroboration that wave 1 opened this same revision: an exact byte-offset hit cannot be produced by a different body at the same length; the offset agrees to the byte.

### Teaches and scope — HOLDS

- §Test tools manually: "enter or adjust parameters in the input fields"; "Click **Run tool**" — grounds "invokes a chosen tool manually with edited parameters".
- §Invoked tools: "provides a **persistent record** of tool interactions" and the Status bullet lists exactly `Completed, Canceled, In Progress, or Error` — grounds the status-vocabulary half and "leaves a record".
- `scope` cell ("DevTools' documented manual tool invocation and the invocation status vocabulary it reports") is bounded to what this page documents; it makes no protocol claim, so it does not collide with S041's `Completed|Canceled|Error` enum. The note already reconciles this at `corpus/knowledge/webmcp-invocation-round-17.md:88`.
- Tier `A` is the contract's "official docs" class; publisher is Chrome for Developers, official. `kind` docs, `recheck` on-release are in-enum.

### Status / used-by — HOLDS

- `used-by` path exists at M: `corpus/knowledge/webmcp-invocation-round-17.md` (`git cat-file -e` → EXISTS).
- The note cites it twice: frontmatter `source: S048`, and line 88 (`Status vocabulary | DevTools UI adds "In Progress" (S048) …`).
- Mechanical check, run on a throwaway clone at M (`git clone --no-hardlinks … && git checkout --detach 6c978510…`):
  ```
  node scripts/check-sources.mjs
  SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0
  EXIT:0
  ```

### sha256 — CANNOT BE REPRODUCED (the ISSUES finding)

Two live GETs of the same URL, same UA, same 191224-byte body:

| fetch | bytes | sha256 |
|---|---|---|
| recorded in S048 / dossier ledger #3 | 191224 | `9bd94f4182619b9eb7bc83c127d58a4de41da691e25ca867ffa3f419d83a87e5` |
| live #1 | 191224 | `8c491227c8adf7b3e20647bdc7721c442997d423c88820923ad78f70db2e5ba8` |
| live #2 (cache-buster) | 191224 | `10c7f5204e98a0fd4d94c8e7dbeb47ea3ef0cce738017c39e29aa7755f48bbcc` |

`cmp -l` between the two live bodies: 3192 differing bytes, all inside **184697–189865**; everything outside that window is byte-identical (`sha256(b1[:184697]) == sha256(b2[:184697])`, tail after 189866 equal, article region 160000–180000 equal). The varying window is a per-response CSP `nonce="…"` plus the trailing `GoogleDevelopersObject` JSON's feature-flag array whose order/members change per response. The article body, including the quote at 167237, is in the stable prefix.

Consequence: any raw-body digest of this origin is a digest of one HTTP response, not of the page; a re-verifier re-fetching will never reproduce `9bd94f41…`. This is not S048-specific — the sibling wave-1 row S047 (`/docs/ai/webmcp/imperative-api`) behaves the same: recorded `24239b8d…`, live today `11ec668f…`, same 189556 B. `scripts/check-sources.mjs` does not verify digests, and no gate/script pins this value (repo-wide grep for `9bd94f41` finds only `corpus/SOURCES.md:62` and the wave-1 dossier), so nothing breaks operationally.

Not established: I cannot show the recorded digest is *wrong* — a real fetch on 2026-10-20 would have had some nonce and some flag ordering, so `9bd94f41…` is a plausible valid snapshot. What is established is that the cell presents it as a checkable fetch identity while it is not re-derivable.

## Verdict rationale

Every load-bearing cell (URL, revision/anchors, Gate quote at the exact byte, tier, scope, teaches, status, used-by) holds under re-open. The one failed check is the recorded raw-body sha256, which is unreproducible by construction at this origin; the row does not disclose that the digest binds a single response. ISSUES, not BREAKS.

## Repair (append-only)

`corpus/SOURCES.md` rule 2 forbids editing any cell but `status`/`recheck`/`used-by` in place, so **do not** rewrite S048's anchor.
1. Add an append-only paragraph to the round-17 lesson (`corpus/lessons/`, wave-3 when the lesson lands): "raw-body digests from `developer.chrome.com` bind one HTTP response — the served HTML embeds a per-response CSP `nonce` and a variable feature-flag JSON — so they are recorded snapshots, not reproducible fetches; verify content by the stable prefix/first-diff boundary or by the cited byte offsets, and record a nonce-normalized digest for rows minted after round 17 (S047 and S048 are affected)."
2. For future rows from this origin, record a digest over the body with `nonce="…"` and the `GoogleDevelopersObject` flag array neutralized, and label it `normalized sha256`; keep the raw size.
3. No status/used-by change is warranted: S048 is genuinely cited.

## Remaining unknowns

- Whether the wave-1 body (`9bd94f41…`) existed exactly as recorded: no body was retained; `[INFERENCE]` yes, because the 191224 B size and the byte-167237 quote offset both match today's revision.
- Chrome may re-render these docs at any time; `Last-Modified` and the in-page date agree today but are one signal, not a revision id.
- No browser was launched (lane rule); the page was read from raw HTTP only.

## Tooling

None installed or upgraded; `curl`, `python3`, `node` from the host.

Files written: `.ufo/waves/round-17/w2/ReopenS048.md`
