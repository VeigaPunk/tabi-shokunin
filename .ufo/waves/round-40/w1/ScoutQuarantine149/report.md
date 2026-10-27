# ScoutQuarantine149 — Quarantine hand-check, staged ID S149 (lane tabi, round3)

## Row (read-only register)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 203:
`| tabi | round3 | S149 | payload-absent | https://en.wikipedia.org/robots.txt | `The daemon`<br>`/status JSON fields` | ... quote is in none of them |`
- Class: `payload-absent`. The register has no anchor column; the quoted spans are the section labels "The daemon" and "/status JSON fields".
- Lane staging row (`lanes/tabi/round3/SOURCES-PROPOSED.md:67`, read-only): S149 = "robots.txt for wikipedia.org — https://en.wikipedia.org/robots.txt", anchors §"Crawl-delay" (line 130), §"Sitemap" (line 424), §header comment on 429-ignoring clients (line 9).

## Source fetch
- Access date: 2026-10-27T19:33:35Z. Command: `curl -sS -L -m 60 -A 'Mozilla/5.0 (quarantine-check)' -D hdr.txt -o body.txt https://en.wikipedia.org/robots.txt` (scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine149/, deleted before yield).
- Observed: `code=200 bytes=28275`, 712 lines, content-type text/plain, last-modified Tue, 06 Oct 2026 02:21:00 GMT, sha256 48b98d80c8444d37cdf50cc9a4d2257b66039477e581066d2356062a4cbd678f. The file was fetched whole and cleanly.

## Quote search (observed)
- `grep -i -F -e 'The daemon' -e '/status' -e 'JSON fields' body.txt` -> no matches (rc=1). Case-insensitive `daemon` count: 0.
- Neither register quote is in the cited source. Verdict on the register's quotes: ABSENT in the opened source.

## Where the quotes come from (cross-check, read-only)
`lanes/tabi/round3/SOURCES-PROPOSED.md:76-83` is row **S150** (kimi-webbridge operations reference, a local file `/home/vgpnk/.kimi-code/.../operations.md`). Its quotes are labelled `§The daemon` and `§/status JSON fields`. So the register's two quote strings for S149 are S150's section labels; nothing in S149's own staged row contains them. This is an inference from text match, not a fetch of the S150 source.

## S149's own staged anchors (for context; outside the register's flagged quotes)
Present in the fetched file: line 9 `# and ignoring 429 ratelimit responses, claims to respect robots:`; line 130 `Crawl-delay: 5`; line 424 `Sitemap: https://en.wikipedia.org/w/rest.php/site/v1/sitemap/0`.

## Classification (this row only)
- Register quotes `The daemon` / `/status JSON fields` vs cited URL: **absent** (actual source opened, 200, 28275 bytes, quote not present). Not a fabrication of the Wikipedia source's content: the quotes appear to be misbound from the adjacent row S150, so the register candidate is a mis-attribution artifact, not evidence that S149's real anchors are false.
- Wikipedia robots.txt anchors in S149's staged row: present.

## Limitations
- The file is mutable (cache age ~55 min, last-modified 2026-10-06); the line numbers matched today's snapshot. The S150 local source was not opened. No tools installed; no writes outside scratch and this report.

VERDICT finding S149 register quotes "The daemon" and "/status JSON fields" ABSENT from https://en.wikipedia.org/robots.txt (fetched OK, 28275 bytes); quotes belong to S150 (misbound); S149's own anchors Crawl-delay line 130 / Sitemap line 424 present
