# ReopenS129 — S129 re-opened at 042d6d9abf97d567d495652a85eabc851b81adc1 (C2 sourcing)

## Verdict

**Holds.** I re-fetched both pinned sources myself at tag 154.0.8037.97 (read-only HTTPS GET, `curl -q -sS --proto =https`, 2026-10-26T18:49–18:55Z) and every load-bearing receipt reproduces byte-exactly: `sandbox/linux/README.md` raw `?format=TEXT` 5,348 B sha256 `5a1ddc20…c2be` / decoded 4,009 B `01c03346…f9a2`, and `sandbox/policy/switches.cc` raw 4,268 B `a614c367…b81a` / decoded 3,200 B `b30542ce…9043` — identical to the landed row's lesson Gate line and the seat's `receipts.tsv`. Every pinned quote is located verbatim in my decoded bytes: README `## Overall Design` :8, the "multiple layers of sandboxing" sentence at :21-22 (23 words ≤ 25), mechanisms at :20-27, the setuid body at :36-52, the kernel-variation caveat at :54-56, `--disable-setuid-sandbox` at :60; `switches.cc` comment at :42-43 with `kNoSandbox[]` declared at :44, so the row anchor ":42-44" and the Gate line's ":42-43" are both correct. The kind `docs` + code-corroboration disposition is right: the primary URL is a document, the switch-scope sentence is a code comment no document at this tag states (zero `no-sandbox` matches across all eight fetched docs), the anchor names both files (S004 establishes the two-file anchor precedent), `check-sources.mjs:26` admits `docs`, and the gate is clean at the revision (`verdict=clean rows=129 findings=0`, exit 0, run in my own clone). All three lesson rejections verify against my own fetches, and the flip condition for the 404 (`docs/linux/sandboxing.md` existing at a later tag) is not live — still HTTP 404 at `refs/heads/main` today. One **low defect**: the lesson and seat record sha256 digests of gitiles 404 bodies, which embed a per-request `request_id`; three same-hour fetches of the same URL yield three different digests at the same 233 B, so those two recorded digests are not reproducible receipts (the substantive 404 claims — status, size, body text — all reproduce).

## Evidence

### 1. Revision identity
- Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` + `git -C "$S/clone" checkout -q --detach 042d6d9…` → HEAD `042d6d9abf97d567d495652a85eabc851b81adc1`, exit 0.
- `git -C "$S/clone" diff --stat bf48b81cbb5dd63bd3f5159dcba536ccd577e28e 042d6d9abf97d567d495652a85eabc851b81adc1 -- corpus/SOURCES.md corpus/lessons/round-33.md corpus/knowledge/bidi-runtime-gate-v2-round-33.md scripts/check-bidi-runtime.mjs` → **empty diff, exit 0**: the S129 row, lesson Gate, note and gate are byte-identical at both revisions, so this re-open covers both.

### 2. Fetch receipts (all `chromium.googlesource.com`, read-only GET, no credentials)
Full ledger: `.ufo/waves/round-33/w2/ReopenS129/receipts.tsv` (12 rows: URL, UTC, status, bytes, sha256 raw+decoded). Highlights (raw b64 / decoded):

| file | status | raw B / sha256 | decoded B / sha256 |
|---|---|---|---|
| sandbox/linux/README.md | 200 | 5348 / `5a1ddc20…c2be` | 4009 / `01c03346…f9a2` |
| sandbox/policy/switches.cc | 200 | 4268 / `a614c367…b81a` | 3200 / `b30542ce…9043` |
| docs/linux/suid_sandbox_development.md | 200 | 4228 / `bd1562ce…59b3` | 3171 / `5028871d…ead4` |
| docs/design/sandbox.md | 200 | 37776 / `6d4a3b0c…9b61` | 28331 / `7b4efcf5…1c75` |
| docs/linux/sandboxing.md | **404** | 233 / `f510dbfd…713` | — |
| chrome/common/chrome_switches.cc | **404** | 233 / `09fd105c…b8d` | — |
| sandbox_ipc.md, zygote.md, sandbox_faq.md, sandbox/README.md, pid_namespace_support.md | 200 | digests equal seat `receipts.tsv:5-10` | silent on `--no-sandbox` (grep: 0 matches) |

All five 200-digests I share with the seat match its `receipts.tsv` byte-for-byte; the two 404 digests do not (see defect).

### 3. Quote verification (my decoded bytes)
- `fetch/readme.dec:21-22`: "We also generally use multiple layers of sandboxing, to achieve both / confinement for the process and reduction of the exposed kernel attack surface." — verbatim, 23 words (lesson Gate line `corpus/lessons/round-33.md:34`, row anchor `corpus/SOURCES.md:143` "§Overall Design lines 20-27" — `## Overall Design` is at :8; mechanisms `setuid(2) everywhere` / namespaces / seccomp(2) BPF at :25-27).
- `fetch/readme.dec:36-52` (§setuid(2), heading :34): empty namespaces at launch (:37-38), setuid binary at `/opt/google/chrome/chrome-sandbox` (:39), "Enters new PID and network namespaces" (:41), chroot into a safe directory (:43-46), `capset(2)` drop (:51) — matches the row's setuid-helper description exactly; caveat "varies between kernel versions" :54-56; `--disable-setuid-sandbox` :60.
- `fetch/switches.dec:42-44`: `// Disables the sandbox for all process types that are normally sandboxed.` / `// Meant to be used as a browser-level switch for testing purposes only.` / `const char kNoSandbox[] = "no-sandbox";` — the landed row's "browser-level testing switch that disables the sandbox for all process types that are normally sandboxed" and the note's quote (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:186`) are verbatim substrings of :42.
- Paste fidelity: landed `corpus/SOURCES.md:143` is byte-equal to the seat draft `source-row-S129.md:41` (890 chars, sha256 prefix `5ae8a79747d1026e`).

### 4. Kind `docs` with code corroboration — judged: holds
- Primary URL is a Markdown doc; the layer-composition half of the claim is doc-grounded (§3 above). The switch-scope half is statable only from code at this tag: grep of all eight fetched docs finds **zero** `no-sandbox` mentions outside `docs/design/sandbox.md:88-89` (Windows section) — so "no doc at this tag states the switch scope" (lesson :34) is verified, and the switches.cc comment is the only authoritative sentence.
- Two-file anchors are lane practice: `corpus/SOURCES.md:18` (S004) cites `.cc:160-183,335-424; .h:28-50` in one anchor. The anchor names both files, so no reader is misled; relabelling `code` would misdescribe the primary URL, splitting would orphan the doc half — the seat's placement caution (`source-row-S129.md` "Two placement cautions" 1) is the correct call.
- Mechanically: `scripts/check-sources.mjs:26` kinds set contains `docs`; `node scripts/check-sources.mjs` in my clone → `SOURCES_GATE verdict=clean rows=129 tiers=A:114,B:6,C:9 status=queued:15,mined:105,rejected:9 findings=0`, **exit 0**. Row status `mined`, opened `2026-10-26`, recheck `90d`, used-by note exists and carries the `S129` token (note :1, :183, :186, :298) — so no `used_by_missing`/`on-release` tag-pin population issue (lesson :26-29, :141).

### 5. Rejected candidates in the lesson (`corpus/lessons/round-33.md:63-77`) — all verified
1. **`docs/linux/suid_sandbox_development.md`** — my fetch digest equals the seat's (`bd1562ce…59b3` / decoded `5028871d…ead4`). Self-declared out-of-date at :3-5 ("The Linux SUID sandbox is almost but not completely removed." / bug link / "This page is mostly out-of-date.") — verbatim. Zero `--no-sandbox` mentions in the whole decoded page (grep: 0). Flip condition intact: the `CHROME_DEVEL_SANDBOX=""` ≡ `--disable-setuid-sandbox` equivalence is at :61-62 exactly as the lesson states. **Rejection sound.**
2. **`docs/design/sandbox.md`** — digest equals the seat's (`6d4a3b0c…9b61` / `7b4efcf5…1c75`). Exactly one `--no-sandbox` occurrence in 28,331 decoded bytes: :88-89, under `## Sandbox Windows architecture` (:50) → `### The target process` (:86); every other section is Windows-mechanism text ("four Windows mechanisms" :117). **Rejection sound** — citing it for a Linux launch-flag claim would import the wrong scope, as recorded.
3. **`docs/linux/sandboxing.md`** (the item's named path) — my fetch: HTTP 404, 233 B, body line 1 "NOT_FOUND: Requested entity was not found" (evidence copy: `ReopenS129/notfound-sandboxing-body.txt`). **Rejection sound**; flip condition checked and not live: still HTTP 404 at `refs/heads/main` (2026-10-26T18:54:41Z, 233 B, sha256 `c346ddc8…2eb9`).
4. The five "opened and found silent" pages and the `chrome/common/chrome_switches.cc` 404: all five digests equal the seat's `receipts.tsv:5-10` and none mentions `--no-sandbox` (grep: 0 matches); `chrome_switches.cc` is 404 for me too (233 B). **Claims verified.**

### 6. Downstream usage consistency (spot)
- `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:183-186` uses S129 only for what the flag disables (layers + `switches.cc:42-44` scope), :189/:298 for the live-leg "no `--no-sandbox`" rule — consistent with the row's scope; it does not cite S129 for the session-id rule (matches CritC2Axis D3's correction).
- `scripts/check-bidi-runtime.mjs:28` comment "never passes --no-sandbox (S129)" — consistent with the row's claim cell.

## Defect (low)

**D-S129-1 (low) — gitiles 404-body digests are not reproducible receipts.** `corpus/lessons/round-33.md:73` records "HTTP 404, 233 B, sha256 `b52a956c…5198`" and :77 records "sha256 `d2e40ab5…852e3a`" (same values in `source-row-S129.md:13,90,98` and `receipts.tsv:2,12`). The 404 body embeds a per-request `request_id` (my bodies: `c0cc69e9…` and `2a921fbb…`, see `ReopenS129/notfound-*-body.txt`), so re-fetching the same URL minutes later gives a different digest at the same 233 B: mine are `f510dbfd…713` (tag) and `09fd105c…b8d` (chrome_switches.cc), and a third fetch at main gives `c346ddc8…2eb9`. The recorded digests therefore cannot be re-verified by anyone, unlike every 200-digest in the same receipts. The substantive claims they accompany (HTTP 404, 233 B, body text "NOT_FOUND: Requested entity was not found") all reproduce, and no landed artifact (SOURCES.md row, note) depends on these digests — hence low, receipt-precision only. Smallest correction: mark the two 404 rows "digest request-scoped; stable facts are status/size/body text" in an errata append, or drop the digests and keep status+size+body line.

## Commands and exit codes
1. `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1` → exit 0, HEAD `042d6d9a…adc1`.
2. 12 × `curl -q -sS --proto =https -o <file> -w '%{http_code} %{size_download}' <url>` → all statuses/bytes in `receipts.tsv`; script exit 0.
3. `git -C "$S/clone" diff --stat bf48b81… 042d6d9a… -- corpus/SOURCES.md corpus/lessons/round-33.md corpus/knowledge/bidi-runtime-gate-v2-round-33.md scripts/check-bidi-runtime.mjs` → empty, exit 0.
4. `node scripts/check-sources.mjs` (cwd = my clone) → `SOURCES_GATE verdict=clean rows=129 … findings=0`, exit 0.
5. `pgrep -fa 'chromedriver|chromium'` → one line only, `/usr/bin/earlyoom -r 3600 … --prefer (^|/)(java|node|chromium|python3?)$` (system service matching the pattern; not a browser). **No chromedriver/chromium owned by me; none started.**

## Bounds
- No tool installs (none needed). No lane tracked file, lane git index, fleet repo, sibling repo, or PATH dir touched. Writes: this report, `ReopenS129/receipts.tsv`, `ReopenS129/notfound-*-body.txt` only. Read-only git in the lane; the checker ran only in my scratch clone. Scratch `/fast/scratch/hyaku/tabi-r33/ReopenS129/` deleted after receipt copy.

## Deliverables
- Report: `.ufo/waves/round-33/w2/ReopenS129.md` (this file, at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/ReopenS129.md`)
- `.ufo/waves/round-33/w2/ReopenS129/receipts.tsv` — my 12-fetch ledger (URL, UTC, status, bytes, sha256 raw/decoded)
- `.ufo/waves/round-33/w2/ReopenS129/notfound-sandboxing-body.txt` — my 404 body for `docs/linux/sandboxing.md` (233 B)
- `.ufo/waves/round-33/w2/ReopenS129/notfound-chrome-switches-body.txt` — my 404 body for `chrome/common/chrome_switches.cc` (233 B)
