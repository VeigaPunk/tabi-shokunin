# R99Critic2 — mechanism + source attack on C1

Seat: R99Critic2 (leaf). Target: `plans/round-99.md` §Claim + §Declared limits 1–8.
Method: re-fetched every upstream raw URL from `sources/fetch-log.txt` and diffed bytes against
staged copies; grepped the installed dists in my own pinned deps; spot-checked the mime table
entry-by-entry; traced check ordering in the bundle; recomputed the counter's byte digests.

Deps (my scratch, per contract): `npm install --no-audit --no-fund puppeteer-core@25.16.0
playwright-core@1.65.0` into `/fast/scratch/hyaku/tabi-r99/R99Critic2/deps` — resolved
puppeteer-core 25.16.0, playwright-core 1.65.0 (lockfile `packages` verified). No pacman, no
sudo, no lanes/fleet files touched.

## Source-row verdicts (all confirmed)

| Plan cites | Upstream re-fetch (sha256 of fetched bytes) | Staged = upstream? | Verdict |
|---|---|---|---|
| S240 dom.ts 756–757 | `…/playwright/v1.65.0/…/dom.ts` 65cb43c9…766 (49422 B) | yes | confirmed |
| S238 fileUploadUtils.ts 80 | `…/v1.65.0/…/fileUploadUtils.ts` 96dd5ef0…50 (3437 B) | yes | confirmed |
| S237 pp ElementHandle.ts 113–116 | `…/puppeteer-v25.16.0/…/ElementHandle.ts` c86ed958…45 (6124 B) | yes | confirmed |
| S244 pp assert.ts 19 | `…/puppeteer-v25.16.0/…/assert.ts` d0094a44…4e7 | yes | confirmed |
| S246 mime standard.ts 283 | `broofa/mime/v4.1.0/types/standard.ts` 6cd8a657…b4 | yes | confirmed |
| S247 mime Mime.ts 87 | `broofa/mime/v4.1.0/src/Mime.ts` 510d955c…6 | yes | confirmed |
| S246 pw root pkg 144 | `…/playwright/v1.65.0/package.json` bffb91e4…17 — `"mime": "4.1.0"` at line 144 | yes | confirmed |
| S245 fileapi.html §7 | fetched, sha 0034ebf4…b7; NotFound row found | yes | confirmed (§7.1; plan's "§7 error table" / "§7 NotFound failure-reason" accurate) |

Line-text checks, exact:
- dom.ts 756–757: `if (multiple && !inputElement.multiple && !inputElement.webkitdirectory)` /
  `throw injected.createStacklessError('Non-multiple file input can only accept single file');` — matches.
- fileUploadUtils.ts 80: `mimeType: payload.mimeType || mime.getType(payload.name) || 'application/octet-stream',` — matches (note `payload.mimeType` falsy check, so empty string also falls through — irrelevant, arms pass absent or a real type).
- ElementHandle.ts 113–116: `assert(files.length <= 1 || isMultiple, 'Multiple file uploads only work with <input type=file multiple>')` — matches; the assert runs immediately after the `element.multiple` evaluate and **before** `DOM.setFileInputFiles`, so a refusal sets nothing by construction.
- assert.ts 19: `throw new Error(message);` — plain `Error`; `errName === 'Error'` for PUCN is the right account (counter pins `fileSha256` of ElementHandle.js = 162b71…96, which I recomputed on my install and matched).
- mime standard.ts 283: `'image/png': ['png'],` — matches; bundled table (`lib/utilsBundle.js`) carries `"image/png": ["png"]`, and `"tabi99"` appears nowhere in either bundle file (grep count 0), so `getType('tabi-r99-p2.tabi99') === null` → octet-stream. Bundled `getType` body (utilsBundle ~50078) is byte-equivalent to Mime.ts 72–88, incl. `?? null` return for unknown extensions. Full-table identity: all 460 ext→type pairs of staged standard.ts present in bundled utilsBundle (0 missing) — the bundled mime **is** mime 4.1.0's, not a drifted table.
- Mime.ts 87: `return this.#extensionToType.get(ext) ?? null;` — `getType` does return `null` for an unknown extension; also note the `hasDot && hasPath` guard at 84–85 returns null for extension-less path names — p2 has a dot, so it reaches the map lookup and still lands null via the absent entry. Correct either way.
- fileapi.html: the §7.1 row reads "If the File or Blob resource could not be found at the time the read was processed, this is the NotFound failure reason" (with the NotFoundError attribute/throw rule below it). Plan's paraphrase is faithful.

Dist-vs-source:
- `coreBundle.js` `_setInputFiles` (21979+): utility evaluate runs the non-multiple check and throws **before** the payload branch (`injected.setInputFiles` at 22016) and before the localPaths `setInputFilePaths` branch — so PLBN is refused before any protocol call that could set a file. One nuance worth stating precisely: `Frame.setInputFiles` runs `prepareFilesForUpload` **first** (25866) — that step only maps payloads (mime fallback line present verbatim at the end of the function) and sets nothing; the throw still precedes everything that could touch the input. `createStacklessError(message)` constructs a plain `new Error(message)` (prefix only when a flag says so), so PLBN's `errName === 'Error'` and the exact message `locator.setInputFiles: Error: Non-multiple …` (client-side prefix + error text) are consistent with the source. `coreBundle.js` sha256 recomputed: 4ef83305…f1 — matches counter pin.
- PLBX/PLBM type rule: injected `setInputFiles` builds `new File([bytes], file.name, {type: file.mimeType})` and sets `input.files` via DataTransfer — `File.type` is exactly the resolved mimeType, explaining `image/png` for the untyped `.png` bytes and `application/octet-stream` for `.tabi99`. Untrusted events are the injected `new Event('input'/'change')` dispatch (isTrusted false) vs CDP-set trusted events on the `localPaths` branch — matches arms.

Counter-constant recompute (independent): bin bytes 0x00..0xff sha256 = 40aff2e9…944880 (plan's truncated form `40aff2e9…944880` matches); TRACKED? sizes A=22/B=30/P1=27/P2=36 all re-derived. Driver header cites "line 757" (off by one vs dom.ts 756–757 two-line statement) and "line 115" (assert call at 113, message at 115) — cosmetic line-pin looseness in the driver comment only; plan cites the true ranges. Not a behavioural claim.

Limit-5 interaction: plan declares the mechanism "the sources' account; the counter checks behaviour", and reads "refused before any file is set" from the outcome (both inputs `[]`, no event). The ordering trace above confirms the mechanism additionally, so behaviour and source agree — no narrower-enforcement gap.

## Result

No falsification found in the mechanism/source axis: every citation is confirmed, the dist matches
the cited version, the refusal precedes any file-setting action, and the mime/null/`Error`-name
accounts are correct. No law was run here (behavioural verdict is the other seats'); this review
did not execute a live leg, so no live evidence either way.

VERDICT C1: neutral
