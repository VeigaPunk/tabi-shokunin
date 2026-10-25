# ScoutCdpPage — round-24 w1 findings

Assignment: fetch the Chrome DevTools Protocol Page domain PDL at the lane's pinned Chromium tag (154.0.8037.97), report byte count / sha256 / exact located text for `backForwardCacheNotUsed` and its `notRestoredExplanations`/`notRestoredReasons` fields plus `Page.frameNavigated`'s type enum if present; then check corpus/SOURCES.md for a row with this exact URL (duplicate-URL refusal).

## Fetch
- URL (single documented GET): `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT`
- Command: `curl -fsSL "<url>" -o page.pdl.b64 && base64 -d page.pdl.b64 > page.pdl` (run in `.../scratch/ScoutCdpPage/`)
- HTTP 200 (curl -f would have failed otherwise); base64 decoded.
- Saved decoded file: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-24/scratch/ScoutCdpPage/page.pdl`
- **Byte count: 61,911** (`wc -c page.pdl`)
- **sha256: `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`** (`sha256sum page.pdl`)

## Located text: `backForwardCacheNotUsed` event (page.pdl lines 1702–1715)
```
  # Fired for failed bfcache history navigations if BackForwardCache feature is enabled. Do
  # not assume any ordering with the Page.frameNavigated event. This event is fired only for
  # main-frame history navigation where the document changes (non-same-document navigations),
  # when bfcache navigation fails.
  experimental event backForwardCacheNotUsed
    parameters
      # The loader id for the associated navigation.
      Network.LoaderId loaderId
      # The frame id of the associated frame.
      FrameId frameId
      # Array of reasons why the page could not be cached. This must not be empty.
      array of BackForwardCacheNotRestoredExplanation notRestoredExplanations
      # Tree structure of reasons why the page could not be cached for each frame.
      optional BackForwardCacheNotRestoredExplanationTree notRestoredExplanationsTree
```
- Field `notRestoredExplanations` present: required, `array of BackForwardCacheNotRestoredExplanation` (line 1713).
- Field **`notRestoredReasons` is ABSENT** from the entire file (sweep `grep notRestoredReasons` → no matches). At tag 154.0.8037.97 the event instead carries `notRestoredExplanationsTree` (optional, line 1715).
- Supporting types (lines 1680–1700):
```
  experimental type BackForwardCacheNotRestoredExplanation extends object
    properties
      # Type of the reason
      BackForwardCacheNotRestoredReasonType type
      # Not restored reason
      BackForwardCacheNotRestoredReason reason
      # Context associated with the reason. The meaning of this context is
      # dependent on the reason:
      # - EmbedderExtensionSentMessageToCachedFrame: the extension ID.
      #
      optional string context
      optional array of BackForwardCacheBlockingDetails details

  experimental type BackForwardCacheNotRestoredExplanationTree extends object
    properties
      # URL of each frame
      string url
      # Not restored reasons of each frame
      array of BackForwardCacheNotRestoredExplanation explanations
      # Array of children frame
      array of BackForwardCacheNotRestoredExplanationTree children
```

## Located text: `Page.frameNavigated` + its type enum (lines 1341–1352)
```
  # The type of a frameNavigated event.
  experimental type NavigationType extends string
    enum
      Navigation
      BackForwardCacheRestore

  # Fired once navigation of the frame has completed. Frame is now associated with the new loader.
  event frameNavigated
    parameters
      # Frame object.
      Frame frame
      experimental NavigationType type
```
- `frameNavigated` has an **experimental** parameter `type` of enum `NavigationType` = `Navigation` | `BackForwardCacheRestore` (present).

## SOURCES.md duplicate-URL check
- Sweep: `grep -n "devtools_protocol/domains/Page\.pdl" corpus/SOURCES.md` → **no matches** (exit 1).
- Closest rows (same tag root, different paths): S033 (model_context_supplement.idl), S034/S074 (runtime_enabled_features.json5), S041/S099 (WebMCP.pdl), S042 (model_context.cc), S045, S062, S064, S071/S077–S081, S093–S100 (form/script_tool/html_select/command_line files). None is `third_party/blink/public/devtools_protocol/domains/Page.pdl`.
- **Result: no SOURCES.md row claims this exact URL → no duplicate-URL refusal; the URL is a fresh source (relevant to C3's two-new-rows requirement).**

## Notes
- `notRestoredReasons` (singular field name from older/other protocol versions) does not exist at this tag; observed field names are `notRestoredExplanations` and `notRestoredExplanationsTree`.
- No tools installed; no pacman transactions; read-only git not needed.
