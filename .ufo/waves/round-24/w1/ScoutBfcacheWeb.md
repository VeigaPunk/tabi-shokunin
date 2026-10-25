# Scout Bfcache Web — report (round 24, w1)

Seat: `L1Tabi24.ScoutBfcacheWeb` (leaf scout, read-only).

## Fetch record
- URL: `https://web.dev/articles/bfcache`
- Command: `curl -sSL -w 'HTTP_STATUS:%{http_code}\n' -o .../scratch/ScoutBfcacheWeb/bfcache.html https://web.dev/articles/bfcache`
- HTTP status: **200**
- Saved bytes: **157,667** (`bfcache.html`)
- SHA-256: **4535f93b281c37c369bb723ae9535e314cb37a27408acae40baaa78783dd2ce5**
- Saved at: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-24/scratch/ScoutBfcacheWeb/bfcache.html`

## Located quotes (from the saved bytes; line = file line, offset = byte offset of the quoted text start)
1. **Network/observability consequence of a restore — no request re-issued** (line 2531, byte offset 72397, 25 words):
   > "Loading the previous page is <em>essentially instant</em>, because the entire page can be restored from memory, without having to go to the network at all."
   (Shown below the "With bfcache enabled" table row, contrasted with the "Without bfcache" row "A new request is initiated…", line 2524.)
2. **What disqualifies a page from bfcache — the notRestored reasons class** (line 2893, byte offset 132216, 18 words):
   > "The Chrome team has added the <code>NotRestoredReasons</code> API to help expose the reasons why pages don&#39;t use bfcache, so developers can improve their bfcache hit rates."
   (First sentence of the paragraph; the quote above is the 18-word lead until "...use bfcache".)

## Is bfcache stated as Chromium-only? — No.
- Line 2511: "All major browsers include a bfcache, including Chrome since version 96, Firefox and Safari."
- The page does state several *related* features are Chromium-only / Chrome-exposed:
  - Line 2581: Page Lifecycle `freeze`/`resume` events "are only supported in Chromium-based browsers."
  - Line 2646: the unload-bypass header policy "is only supported in Chromium-based browsers."
  - Line 2893: `NotRestoredReasons` API was added by the Chrome team (Chrome-exposed).

## Tooling
No installs/updates performed (system `curl`, `grep`, `wc`, `sha256sum` sufficed; no pacman transaction needed).

## Notes
- Quote 1 is exactly 25 words as rendered text (the `<em>` tags mark "essentially instant"); quote 2 is 18 words; both ≤25.
- Verification of quote/line/offset: `grep -n` and `grep -b` against the saved bytes; results above.
