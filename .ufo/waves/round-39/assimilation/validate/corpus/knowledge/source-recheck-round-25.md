# Source recheck round 25 — six on-release rows hold

opening source: `corpus/evidence/round-25/freshness/reopened.json` (schema
`tabi-source-reopen-v1`) and the committed bytes `corpus/evidence/round-25/freshness/<ID>.html`
verified-at: `git rev-parse HEAD` (round-25 evidence commit); receipt sha256
`609ab7c4eb3642a6bd2db3ecec1fbb8d70897740b516ced086562f2a1a8bb094`
recheck: on-release

## What is observed

On 2026-10-25 the six on-release rows S013, S015, S016, S020, S023, S024 were
fetched fresh (HTTP 200, byte-identical bodies to the earlier committed fetches
for each). Every held quote is located in today's bytes exactly once:

| id | sha256 (today) | quote located | verdict |
|---|---|---|---|
| S013 | `cf48ff4d…bdfa` | raw exact, byte 42946, line 68 | holds |
| S015 | `31075410ae…fe8d` | raw exact, byte 26887, line 5 | holds |
| S016 | `1bb8afe888…6a2c` | tag-split, byte 28210, line 7 | holds |
| S020 | `5627596668…ca40` | raw exact, byte 28801, line 872 | holds |
| S023 | `234a24527d…dee6` | tag-split, byte 56837, line 36 | holds |
| S024 | `bbbad68813…e6194` | raw exact, byte 36001, line 56 | holds |

Verdicts are `holds` for all six; no superseding row is opened (0 supersessions).
The S020 anchor cell still reads `CG-DRAFT 2026-10-16, revision f14762e6` while
today's bytes carry revision `51ed7565` with `dt-updated 2026-10-20`; this
moving-anchor condition was already recorded in round 18, and the round-18
precedent holds that moving anchors are not drift and need no superseding row
(`corpus/knowledge/source-recheck-round-18.md:118,127`).

## Notes for counters

- Byte-identical pages legitimately yield identical sha256 after a fresh fetch;
  openness must rest on this round's `fetched_at`, committed bytes, and
  `sha(bytes)` — never on the digest differing from earlier fetches.
- Quotes split by inline markup (S016 `<a>`, S023 `<strong>`) require a
  tag-stripped/whitespace-normalized search; a raw-byte grep would wrongly call
  them absent.
