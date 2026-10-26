# Registry transition log — round 30 routed defect 1 (`used-by` old → new)

Source of the change: `corpus/knowledge/chromium-156-release-pin-recheck.md:3` names 31 S-ids;
its re-opened 23 (`S033 S034 S041 S042 S045 S062 S064 S071 S074 S077 S078 S079 S080 S081 S093
S094 S096 S097 S098 S099 S100 S105 S106`) omitted the entry from `used-by`. The other eight on
that line (`S108`–`S115`) already listed it and were left byte-identical.

Authority: `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:49-51` — "**Append-only.** Only `status`,
`recheck` and `used-by` change in place, and each change is logged old→new in the round lesson."
No other cell changed (verified: `verify-cells.txt`).

Append form follows the existing `S109`–`S115` rows: the new path is added last after `, `.
The four rows whose `used-by` was the empty sentinel `—` (S080, S081, S093, S098) take the single
path; a comma cannot be appended to the sentinel.

| id | used-by old | used-by new |
|---|---|---|
| S033 | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | `corpus/knowledge/webmcp-chromium-loopback-round-16.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S034 | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | `corpus/knowledge/webmcp-chromium-loopback-round-16.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S041 | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S042 | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S045 | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S062 | `corpus/knowledge/harness-hardening-round-18.md` | `corpus/knowledge/harness-hardening-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S064 | `corpus/knowledge/harness-hardening-round-18.md` | `corpus/knowledge/harness-hardening-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S071 | `corpus/knowledge/source-recheck-round-18.md` | `corpus/knowledge/source-recheck-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S074 | `corpus/knowledge/source-recheck-round-18.md` | `corpus/knowledge/source-recheck-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S077 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S078 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S079 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S080 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S081 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S093 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S094 | `corpus/lessons/round-19.md` | `corpus/lessons/round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S096 | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S097 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S098 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S099 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S100 | `corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S105 | `corpus/knowledge/navigation-history-bfcache-evidence.md` | `corpus/knowledge/navigation-history-bfcache-evidence.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S106 | `corpus/knowledge/bfcache-runtime-observed-round-25.md` | `corpus/knowledge/bfcache-runtime-observed-round-25.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |

Counts: 23 rows changed (19 appended, 4 sentinel→single path), 0 other cells changed,
`corpus/SOURCES.md` 101566 → 102788 bytes, row count 115 → 115.
