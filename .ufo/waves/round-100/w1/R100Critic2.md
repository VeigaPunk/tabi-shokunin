# R100Critic2 — source & mechanism attack on C1

## Axes
1. Citation fidelity: does each plan-quoted line say what the plan says, at the claimed line/URL?
2. Dist fidelity: does the installed pinned dist carry the cited mechanism verbatim?
3. Mechanism visibility: does the counter see the claimed mechanism, or is it inferred from outcome only (limit 5)?

## Counterexample (strongest, from local evidence)
Plan S238 cites "`fileUploadUtils.ts` v1.65.0 line 44" for the exactly-one-category throw, and
§Sourced claims "each has a staged copy and a fetch-log line." Actual: line 43 carries the throw
(`staged pw-fileUploadUtils.ts:43`, blank line 44; upstream identical), and the staged client file
`pw-elementHandle.ts` (S248/S249 source) has NO fetch-log line at all — fetch-log.txt lists 4 URLs,
not the elementHandle.ts URL. Both staged copies are byte-identical to live upstream (diff -q clean
for all 5 files), so the sentences rest on the right code — only the line number and log claim are wrong.

## Evidence
Staged==upstream (all HTTP 200, diff -q identical): pw-elementHandle.ts 15091 B, pw-dom.ts 49422 B,
pw-fileUploadUtils.ts 3437 B, pp-ElementHandle.ts 6124 B, whatwg-input.html 687515 B. Upstream anchors:
- elementHandle.ts:278 'File paths must be all files or a single directory' ✓ (S249, exact);
  :287 'File paths cannot be mixed with buffers' ✓ (S248, exact). Plan lines agree.
- dom.ts:756-757 Non-multiple refusal ✓; :758-759 'File input does not support directories…' ✓;
  :760-761 '[webkitdirectory] input requires passing a path to a directory' ✓. Matches S240.
- fileUploadUtils.ts:43 throws (plan says line 44 — off by one); :80 mimeType fallback ✓.
- pp-ElementHandle.ts:113-116 assert ✓ (S237; actual line 115 message).
- whatwg input.html: 'Filenames must not contain path components…' (4021) ✓ and 'Unless the multiple…'
  (4027-28) ✓, §4.10.5.1 File Upload state ✓. BUT 'webkitRelativePath' occurs 0 times in the staged
  whatwg-input.html (and 0 in dom.html) — S250's claimed 'plus the webkitRelativePath definition' is
  not in the staged source; DIR's webkitRelativePath behaviour is untriggered/untested by source.

## Installed dist (deps: puppeteer-core 25.16.0, playwright-core 1.65.0; npm install, no new tool versions)
coreBundle.js contains each verbatim exactly once (grep -c =1): 'File paths cannot be mixed with
buffers', 'File paths must be all files or a single directory', 'Exactly one of payloads…',
'Non-multiple file input…', 'File input does not support directories…', '[webkitdirectory] input
requires passing a path to a directory'; ElementHandle.js (puppeteer) 'Multiple file uploads only
work…' ×1. Dist line 21981 `multiple = filePayloads && … || localPaths && …` matches staged dom.ts:748.

## Mechanism the counter cannot see (limit 5's account)
Confirmed declared, not new: (a) MIXED's 'refused before any file is set' is outcome-only (three []
  + no event) — no protocol trace proves the client-side throw vs a browser-level no-op; (b) trusted
  vs untrusted = isTrusted from page listeners, not CDP provenance — both dom.ts paths (evaluateInUtility
  synthetic vs delegate.setInputFilePaths) produce that flag, counter sees only the flag; (c) dom.ts:748
  `&&`/`||` precedence means `multiple` = (payloads>1)||(paths>1) — a 1-path DIR case reads multiple=false.
All three are within declared limits 2/3/5; (a) and (b) are the limit-5 account, no over-claim.

## Commands (all exit 0 unless noted)
npm init/install deps: `added 26 packages`, versions 25.16.0/1.65.0 confirmed.
curl re-fetch of 5 upstream URLs: 200 each; diff -q staged==upstream all identical.
grep anchors on staged + upstream + dist as quoted above.

## Smallest safe correction
Fix line-citation to fU:43 and add the missing elementHandle.ts fetch-log line (or drop the
'and a fetch-log line' clause). Distinguish S250's 'Filenames…' sentence (present) from the absent
'webkitRelativePath definition' (remove that clause or stage the spec page that has it).

VERDICT C1: falsifies-wording
