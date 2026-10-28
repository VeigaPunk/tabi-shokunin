# QuarR4219 — quarantine re-adjudication S176, S171

Access date: 2026-10-28 (response dates 15:37:43Z-15:38:18Z). Seat dir: `.ufo/waves/round-42/w1/QuarR4219/`. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4219/` deleted before yield. No write under `/home/vgpnk/Projects/shokuknow`. No commit, push, or git/jj mutation.

Axes named: exact register text, live fetch identity (status, final URL, bytes, sha256), quote location (exact then whitespace-normalized), delta versus the round-40 dispositions.

Tooling: `/home/vgpnk/.omp/agent/RULES.md` read. No package installed. Pacman not run. `curl` and `python3` already on the host were enough.

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`. Lane cell tabi, round cell round5. Staged quotes for the gate blocks are in `/home/vgpnk/Projects/shokuknow/lanes/tabi/round5/SOURCES-PROPOSED.md` (read-only). Round-40 notes were used only for the delta, not as evidence.

## S176 — misbound

Register line 214, class payload-absent:

| tabi | round5 | S176 | payload-absent | https://web-mcp.net/security-guide | origin trial / Understand origin trials / Third-party origin trials |

Fetch of the registered URL (0 redirects, final URL unchanged):

curl -sS -L --max-time 60 to https://web-mcp.net/security-guide returned HTTP/2 200, text/html; charset=utf-8, date Wed, 28 Oct 2026 15:37:43 GMT, 385056 bytes, sha256 5c7bbbf249acbf2a827abf46f11559bdecbe1b6adbf1ce4e5d50c1acdb98467a. Header x-matched-path: /security-guide, x-vercel-cache: HIT.

In that body, exact / whitespace-normalized / case-insensitive counts are 0 for all three registered spans. The token trial occurs 0 times. The three third-party hits are CSP and untrusted-content sentences, not origin trials. The row's own gate sentences are present after tag-strip: "requestUserInteraction() Forces the browser to show a native UI prompt for high-stakes actions. The agent CANNOT bypass this." and "Nothing is exposed by default. You must call navigator.modelContext.registerTool() for each tool."

Classification fetch of the other registered source, not substituted as S176's URL: https://developer.chrome.com/docs/web-platform/origin-trials (S177) HTTP 200, 138229 bytes, sha256 c6599b9137eec894395997ea44e0ec0523b02bd393e000709e92506b413b30ca. Nav text contains "Understand origin trials" and "Third-party origin trials". Body sentence: "You can register for an origin trial to enable a feature for all users on your origin, without requiring them to toggle any flags." The census line bound to tabi S176 is the S177 registry row (census-adjudication.json).

Verdict: misbound.

Delta vs r40 (absent/misbound, sha256 55df2673013d439545d9833fdbb9d7a1778de90b5f9222efdf0ba5909d6905c8, also 385056 bytes, also 0 hits): verdict class unchanged. The live sha256 changed. The r40 body was not kept, so the differing bytes were not isolated; the three registered spans stayed at count 0 and the row's own anchors stayed present. r40 did not re-fetch S177; this round did, and the three spans are on that page today.

## S171 — unreachable

Register line 362, never-checked section. The id cell is malformed (S171 plus a trailing backtick). No quote and no anchor are registered:

| tabi | round5 | S171` | the cited source could not be fetched, so no quote was checked | https://chromestatus.com/features/5117755740913664 |

Staged quotes exist only on the gate block (Q1 name/summary through UI., Q2 maturity incubation, Q3 status Proposed).

Registered URL: HTTP/2 404, 0 redirects, final URL unchanged, 207 bytes, sha256 e9639e3c4681ce85f852fbac48e2eeee5ba51296dbfec57c200d59b76237ab80, date Wed, 28 Oct 2026 15:37:45 GMT. Body is the 404 Not Found page. Quotes are not in it.

Obvious corrected location, not treated as the registered URL: https://chromestatus.com/feature/5117755740913664 HTTP 200, 3710 bytes, sha256 c9cc294b3a7a55bb8e1d6881311a19bbd91a0d789ddcf9b8b9c00e7540521e92. Server HTML is a chromedash-app shell. WebMCP, Proposed, origintrial, and the feature id each occur 0 times. That does not make the quotes absent from a rendered record, and it does not make them misbound.

Gate-named JSON, disclosed separately: https://chromestatus.com/api/v0/features/5117755740913664 HTTP 200, application/json, 21011 bytes, sha256 82bdbe63bed5326c00cc4b268af41f4d5c3910f333b3e1317a7bb16d617ad191 (XSSI prefix). Q2 and Q3 match exactly. Q1 matches through "paths in their UI." and then the summary continues "With WebMCP, agent-service interaction"; the staged closing quote is a truncation. origintrial is JSON false, not {}. updated is fbeaufort@google.com at 2026-09-28 23:57:13.517191.

Verdict: unreachable. The registered source was not fetched. Not a fabrication. Not reclassified as present, because the API URL is not the registered URL.

Delta vs r40 (unreachable, register URL 404, /features/ malformed; API sha256 82bdbe63bed5326c00cc4b268af41f4d5c3910f333b3e1317a7bb16d617ad191, 21011 bytes; shell 3710 bytes): no change on the live responses. The API digest is byte-identical. The 404 is still 207 bytes (round-27 already recorded prefix e9639e3c4681ce85).

## Evidence

- .ufo/waves/round-42/w1/QuarR4219/evidence-S176.txt
- .ufo/waves/round-42/w1/QuarR4219/evidence-S171.txt

## Limitations

Single plain GET per URL, no browser render. S176 is a Next.js prerender (x-nextjs-prerender: 1); the three spans are also absent from the raw body, so client render would not add them. S171's human page is a shell; only the JSON carries the record, and that JSON is not the registered URL. S177 was fetched only to test misbinding. No tool was installed.

VERDICT finding S176 misbound (three registered spans absent from HTTP 200 web-mcp.net/security-guide, present on registered S177); S171 unreachable (registered /features/ URL still HTTP 404, API bytes unchanged vs r40)
