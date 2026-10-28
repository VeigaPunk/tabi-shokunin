# QuarR4211 — quarantine re-adjudication S143, S144

Axes used: registered-URL identity (final URL after redirects, status, bytes, sha256), quote location (exact, then whitespace-normalized), verdict class (present / absent / misbound / partial / unreachable), delta versus the round-40 disposition on the live bytes.

Lane cell `tabi`, round cell `round3`, ids S143 and S144. Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 198-199. No anchor cells; the quote cells are the only staged text. Other lanes' S143/S144 rows were not adjudicated.

No tools installed. curl, python3, and sha256sum were already on the host. Pacman is paused; nothing was installed.

Full write-up and evidence files: `.ufo/waves/round-42/w1/QuarR4211/report.md`, `evidence-S143.txt`, `evidence-S144.txt`.

## Fetch (2026-10-28)

- S143 `https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/cdp/WebMCP.ts` → HTTP 200, 0 redirects, final URL identical, 10681 bytes, sha256 `ee7b6fd89e0080754ad1d17b288a4c2a806728761908fd79291a778524f979f5`, etag `24417a1899b63c1a52629736f18f76674c0b6648279c48fe82c40d392cd9efa2`, date Wed, 28 Oct 2026 15:37:04 GMT.
- S144 `https://raw.githubusercontent.com/puppeteer/puppeteer/main/packages/puppeteer-core/src/api/Page.ts` → HTTP 200, 0 redirects, final URL identical, 111019 bytes, sha256 `b446b70c6543026e66bc6da7c1abdefbd1c6a0b12bceb8b44d2e479ece9863bf`, etag `8367afa09d2d3832a0d1b9ffd4d4211f59ee305957463a965fd3a999738da83f`, date Wed, 28 Oct 2026 15:37:05 GMT.
- Classification only (S145's registered URL, named by the S144 census line; not substituted for S144): `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` → HTTP 200, 0 redirects, 146976 bytes, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`, date Wed, 28 Oct 2026 15:38:00 GMT.

## S143 — misbound

Quote `Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled` is absent from WebMCP.ts (exact and whitespace-normalized; no `151` / `enable-features` / `Requires Chrome`). It is verbatim at Page.ts line 1085:

`* Requires Chrome 151+ with the `--enable-features=WebMCP` flag enabled.`

Page.ts is tabi round3 S144's registered source. Round-40 called S143 absent against the same WebMCP.ts bytes (same sha256 and etag on 2026-10-27) and did not open Page.ts. The cited file did not change; the class changes from absent to misbound.

## S144 — misbound

Quotes `Defense in depth` and `is not the extent of a site's defense against CSRF` are absent from Page.ts (exact and whitespace-normalized; no Defense / CSRF / SameSite). In draft-13 §8.8.1 the heading `8.8.1.  Defense in depth` is exact (newline line 2813), and the CSRF fragment is present once the hard wrap between lines 2817 and 2818 is collapsed:

It is, however, prudent to ensure that this designation is not the extent of a site's defense against CSRF, as same-site navigations and submissions can certainly be executed in conjunction with other attack vectors such as cross-site scripting.

Round-40 called S144 absent against the same Page.ts bytes (same sha256 on 2026-10-27) and did not fetch the draft. The cited file did not change; the class changes from absent to misbound.

VERDICT finding S143 misbound, S144 misbound — registered bodies unchanged since r40 and still lack the quotes; quotes are in Page.ts and draft-13 respectively
