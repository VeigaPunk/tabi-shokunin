---
title: Navigation history across a back/forward-cache restore
source_ids: [S104, S105]
opened: 2026-10-25
---

source: S104 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT — Chromium 154.0.8037.97 Page domain PDL; opened 2026-10-25 from round-24 scratch/ScoutCdpPage/page.pdl, lines 1341–1353 and 1662–1715
source: S105 — QUOTE-PENDING:<url>
verified-at: 2026-10-25
tier: documented upstream; no runtime claim, browser run, or measured credit

## 1. A history step is not a network-request predicate

A harness observing `history.back()` must keep the action and navigation outcome as separate evidence. Record the invocation (method, step identifier, and ordered timestamp), the before/after URL and history position where available, and the correlated main-frame CDP event stream. Preserve the raw events, target/session identity, frame and loader identifiers, and ordering; do not infer “no navigation” from an empty Network-domain slice. A bfcache restoration can be a document navigation while reusing the retained document rather than fetching it again. [INFERENCE] This is the capture rule implied by the protocol distinction below, not a runtime result from this lane.

## 2. CDP distinctions documented by the Page domain

S104's `Page.frameNavigated` event is fired once navigation completes; its experimental `type` is `Navigation` or `BackForwardCacheRestore` (Page.pdl:1341–1353). Record the event's full frame object, `type`, event order and timestamp if the transport supplies one. `BackForwardCacheRestore` is direct protocol evidence that the frame navigation was a cache restore; ordinary `Navigation` is not by itself proof of a network refetch, so correlate with Network events and the request trace.

S104 documents `Page.backForwardCacheNotUsed` as an experimental event for failed bfcache history navigations when the feature is enabled. It applies only to main-frame history navigation where the document changes (not same-document navigation), may arrive in either order relative to `Page.frameNavigated`, and carries `loaderId`, `frameId`, a nonempty `notRestoredExplanations` list, and optionally a per-frame explanation tree (Page.pdl:1662–1715). Capture those fields and correlate by frame/loader, not arrival order. The reasons explain why caching failed; this event is not a positive restore signal. A non-use event with a subsequent ordinary navigation supports the documented non-restored path; absence of the event alone does not establish restoration, because the event's documented scope is conditional.

For completeness, same-document history changes have a separate experimental `Page.navigatedWithinDocument` event with `navigationType` values `fragment`, `historyApi`, or `other` (Page.pdl:1721–1735). Record it rather than conflating same-document history API activity with a main-frame document replacement.

## 3. Minimum receipt for a back/forward step

- The explicit action (`history.back()`), step/case ID, and action time/order.
- Before/after URL and history state if the harness reads them; retain unavailable values as unavailable, not empty observations.
- Raw, ordered Page events: `frameNavigated` including `type`, `frame` and loader identity; `backForwardCacheNotUsed` with all reasons/tree fields; and `navigatedWithinDocument` when present.
- Raw, ordered Network events and request identities for the same interval, including the observed absence as a bounded event-window result rather than a global claim.
- Target/session identity and the protocol/browser build and feature configuration, so event coverage and experimental protocol version are scoped.

Interpretation: `frameNavigated.type=BackForwardCacheRestore` distinguishes the restored path in this documented protocol. `backForwardCacheNotUsed` plus `frameNavigated.type=Navigation` and correlated request evidence distinguishes a failed restore followed by a navigation; Network evidence alone does not establish whether history moved. If the event set is incomplete or the type is unavailable, classify the outcome as unknown, not “no navigation.” [INFERENCE]

## 4. Provenance and limits

This is a protocol-text reading, not a browser observation. The Page PDL explicitly labels relevant event/type material experimental; CDP compatibility and exact event emission remain build-scoped. No browser was run and no bfcache restoration or re-fetch was measured this round. S105's source must be opened and its located quote inserted before the entry can satisfy the two-source admission requirement.

## Unknowns

- S105 source URL, opened bytes, and located quote: `QUOTE-PENDING:<url>`.
- Whether this host/build emits the documented events for the proposed harness case, and under what feature/configuration conditions.
- Whether a particular history step actually restored from bfcache or re-fetched; no runtime trace was acquired.
- Whether all relevant event timing/order details are exposed consistently by the chosen CDP transport.

## Frontier pointer

Advances the navigation-history evidence frontier from URL/history-state plus Network-domain slices to explicit document-transition classification: retain Page navigation type and bfcache non-use reasons alongside request evidence. It does not promote an axis on a scalar and earns no measured/runtime credit.

## Sources

- S104: Chromium 154 Page domain protocol definition, `Page.frameNavigated` and `Page.backForwardCacheNotUsed`; quoted protocol text is pending location-verified excerpt: `QUOTE-PENDING:https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT`.
- S105: `QUOTE-PENDING:<url>`.
