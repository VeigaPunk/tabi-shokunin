# R65Scout — round 65 wave w1

Seat: R65Scout (scout, read-only on the registry). Base revision: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162.
Scope: S170 source evidence + registry next-id check. `corpus/SOURCES.md` was NOT modified.

## Deliverables

| path | sha256 |
|---|---|
| .ufo/waves/round-65/w1/R65Scout/fips-quote.txt | (see below) |
| .ufo/waves/round-65/w1/R65Scout/next-id.txt | (see below) |
| .ufo/waves/round-65/w1/R65Scout/sources/fips180-4.pdf | 0455b406d89648d20cbde375561e19c245b9815e894164c2670772e3d54deb82 |
| .ufo/waves/round-65/w1/R65Scout/sources/fips180-4.pdftotext.txt | 15cacf3dc1ff75c71baef4fc35345a650d58f7396bc5c44361ad7cf2ddfd1401 |
| .ufo/waves/round-65/w1/R65Scout/sources/csrc-180-4-upd1-final.html | 6325f3140bb46fe66cdfa89cf4dc6ef4eb4659edc0d521adc8afa5a31d6652e0 |

## Proving command

`cd /home/vgpnk/Projects/shokunin/tabi-shokunin && grep -c 'S170' corpus/SOURCES.md` → `0` (S170 unused at base).
Next-id probe: `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort -u | tail -3` → `S167 S168 S169` ⇒ next free id **S170**.

## S170 source: NIST FIPS 180-4

Access date 2026-11-05. The landing page `https://csrc.nist.gov/pubs/fips/180-4/upd1/final` (HTTP 200, 40,642 B,
sha256 6325f314…) served metadata only; the URL that actually served the quoted normative text is the PDF
`https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf` (HTTP 200, 833,315 B, sha256 0455b406…, re-fetched
byte-identical). Document date printed in the document: **August 2015** (cover page; front matter p. iv; landing page
"Date Published: August 2015", Document History "08/04/15: FIPS 180-4 (Final)", supersedes FIPS 180-4 03/06/2012;
erratum 5/9/2014 incorporated).

Primary quote (25 words, one sentence), **§6.2.2 "SHA-256 Hash Computation", printed p. 23 (PDF p. 28)**:

> After repeating steps one through four a total of N times (i.e., after processing M(N)), the resulting 256-bit message digest of the message, M, is

Verbatim anchors: pdftotext extraction lines 1095–1096 (staged); independent markit extraction artifact line 835 — the
two extractions agree word for word. Supporting domain quote (21 words), §6.2 "SHA-256", printed p. 21 (PDF p. 26),
lines 1014–1015: *"SHA-256 may be used to hash a message, M, having a length of l bits, where 0 ≤ l < 2^64."*
Fixed-length support: front matter p. iv "The message digests range in length from 160 to 512 bits, depending on the
algorithm." and Figure 1 (p. 3) row SHA-256 → Message Digest Size 256 bits.

Proposed row fields (kind `spec`, tier `A`, opened 2026-11-05, recheck `on-release`) are laid out in fips-quote.txt §5
for the scribe; this seat did not write the row.

## Defects found

1. **Filename/id collision hazard on "s170".** `corpus/SOURCES.md` has one lowercase `s170` occurrence: row S168's
   anchor names the staged file `.ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl` (sha256
   5bbc6e23…e3d — verified to be S168's evidence), and S169's anchor names `s171-chromium155-Browser.pdl` (sha256
   5e1faf7d…0da — verified). The round-64 scribe numbered staged filenames two ahead of registry ids. An S170 row
   staging `s170-*.pdf` makes the token `s170` denote two different artefacts (S168's Input PDL and S170's FIPS PDF).
   No gate breakage — `check-sources.mjs` `rowPattern` and the next-id probe are both uppercase-anchored — but any
   corpus-wide lookup of "s170" must be id-aware, not filename-aware.
2. **The new row cannot pass the gate on its own.** `check-sources.mjs` `inspectUsedBy()` requires the `used-by` file
   to exist and to literally contain the token `S170` (`/(?<![A-Za-z0-9])S170(?![0-9])/`), else `used_by_uncited`.
   `grep -rl 'S170' corpus/` returns no match at base, so the knowledge/lesson file that cites S170 must exist before
   the row is committed — an ordering constraint the freeze plan does not currently name.
3. **FIPS 180-4 is not frozen.** The landing page carries "Planning Note (03/07/2023): … NIST has decided to revise
   FIPS 180-4". Any `recheck` interval of 90d/180d on S170 would be wrong; `on-release` is the honest value.

## Tooling

No tool installed, upgraded or modified. Pre-existing only: curl, pdftotext 26.10.0 (poppler, /usr/bin), git
(read-only), node. No pacman/uv/cargo/npm operation; the pacman guard was not exercised.

## Verification performed

`node scripts/check-sources.mjs` → `verdict=clean rows=169 findings=0`; `node scripts/check-sources.mjs --self-test`
→ `verdict=clean cases=26` — both run in a scratch clone at the base revision
(`/fast/scratch/hyaku/tabi-r65/R65Scout/clone`, `rev-parse --show-toplevel` asserted equal to the clone path). Scratch
deleted after copying receipts into this deliverable directory. No lane gate was run in the lane tree; no registry row
was written; no claim was scored.
