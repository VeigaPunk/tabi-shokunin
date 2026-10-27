# ScoutQuarantine144 — quarantine hand-check S144

## Row (read-only register, line 199 of /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md)
`| tabi | round3 | S144 | payload-absent | https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/api/Page.ts | `Defense in depth`<br>`is not the extent of a site's defense against CSRF` | ... |`
- Staged class (assimilation/quarantine-slice line 22): `payload-absent` — matches the tabi row. A second register line (337, `kumitate round5 S144\``, unreachable git URL) has a malformed ID and a different class; not the staged row, not evaluated.
- Quotes (2): "Defense in depth"; "is not the extent of a site's defense against CSRF".

## Source fetch
- URL: https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/api/Page.ts
- Access date: 2026-10-27 (UTC, Date header 19:33:41 GMT). `curl -sSL` → HTTP 200, 111019 bytes, text/plain, sha256 b446b70c6543026e66bc6da7c1abdefbd1c6a0b12bceb8b44d2e479ece9863bf, etag 8367afa0…da83f.
- Source opened fully (real TypeScript Page.ts, not an error/placeholder page).

## Search
- case-insensitive grep: `defense|defence|in depth|cross-site|samesite|forgery|extent of|csrf` → zero hits (the earlier grep for defense/depth/CSRF/extent also zero).
- whitespace-normalised, lowercased substring checks: "defense in depth" False; "is not the extent of a site" False; "defense against csrf" False; "csrf" False.

## Classification
**ABSENT / fabrication candidate confirmed for this row**: the cited source was successfully fetched and neither quote (nor the topic CSRF/SameSite) appears. Note: the wording reads like RFC 6265bis (SameSite/CSRF) prose, not puppeteer API docs [INFERENCE, not verified here].

## Limitations
- Fetched `main` HEAD today, not the revision at original citation time (URL is unpinned); a later/earlier revision could differ, though the page's subject (puppeteer Page API) makes CSRF text implausible. No archived revision checked; companion URLs/local artifacts not checked (not assigned).
- No source repo edits; scratch removed.

VERDICT finding S144: payload-absent confirmed — source opened (200, 111019 B), both quotes absent
