# ScoutQuarantine126 — quarantine hand-check S126 (tabi lane)

## Row identification
Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` has three S126 rows (souji, tabi, tameshi). The staged slice (`round-40/assimilation/quarantine-slice`) lists only the bare ID `S126 payload-absent`, and the neighbouring staged IDs (S125, S130, S131, S133) are the tabi rows, so I took the tabi row (register line 188). This is an inference; the slice carries no lane column.

```
| `tabi` | round2 | S126 | `payload-absent` | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | `Native messaging`<br>`Extension side`<br>`Native messaging host side` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |
```
- Staged class: `payload-absent`.
- The register has no anchor field for this row.
- Three quote spans: "Native messaging", "Extension side", "Native messaging host side".

## Source fetch
- Access: 2026-10-27T19:33:23Z, `curl -L -A Mozilla/5.0` → `200 337116 bytes`, effective URL unchanged.
- The page is the real GitHub Docs article "Rate limits for the REST API". Its headings include "About primary rate limits", "Primary rate limit for unauthenticated users" and "Primary rate limit for authenticated users".
- Tag-stripped visible text: 15505 chars.
- Case-insensitive occurrence counts in the visible text:

| Term | Count |
|---|---|
| `Native messaging` | 0 |
| `native` | 0 |
| `messaging` | 0 |
| `Extension side` | 0 |
| `host side` | 0 |

- The same terms are also absent from the raw HTML. `grep -ci 'native messaging' page.html` printed 0.

## Classification
**absent / fabrication (payload-absent confirmed)** for the cited URL. The source was opened successfully and none of the three quoted spans is in it. Native messaging is a browser-extension topic (Chrome/Firefox), unrelated to GitHub REST rate limits, so the URL looks like a mis-cited source rather than a fetch or rendering problem.

## Limitations
- I fetched only the assigned cited URL. I did not check companion URLs or lane artifacts, so I did not check whether the quotes exist at some other correct source. The verdict covers this row's cited URL only.
- Plain HTTP fetch, no JS rendering. The GitHub Docs article body is server-rendered and the page contained its full article headings, so I treat the fetch as complete.
- The lane for S126 was inferred as tabi (see above). If the staged row meant souji or tameshi, this check does not cover it.
- No tools installed. Nothing written to the shokuknow repo or the lane corpus. The scratch dir `/fast/scratch/hyaku/tabi-r40/ScoutQuarantine126/` was removed.

VERDICT finding S126 (tabi, docs.github.com rate-limits page) payload-absent confirmed: the page was opened (HTTP 200, 337116 bytes) and none of "Native messaging", "Extension side", "Native messaging host side" occurs in it; the quote is absent and likely mis-cited.
