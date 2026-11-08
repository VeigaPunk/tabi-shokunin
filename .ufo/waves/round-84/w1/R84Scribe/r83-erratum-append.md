source: S219 (WHATWG HTML `showPicker()` steps), S220 (Chromium 155.0.8059.84 `html_input_element.cc`), S223 (WHATWG `accept` attribute); the r83 receipt `corpus/evidence/round83/chromium-showpicker/receipt.json` (sha256 `7b465a0bcf6d0187fa0d4e3aa1298b93e7f7bef19c9edc4a5348317375afc05f` — the final-nonce run) and the r84 receipt `corpus/evidence/round84/chromium-showpicker/receipt.json` (sha256 `29347958cfbc2c246af1e89cb2286b8a21fbdbde5d55fd78e69e1bca732cf59c`); the round-83 spot-check `corpus/lessons/round-83-verifier-spotcheck.md` §Routed defects 1–2; the round-83 scribe seat artifact `.ufo/waves/round-83-seats/R83Scribe/knowledge-note.md:61-64`
verified-at: 2026-11-08 (round 84, Linux host; the erratum corrects the r83 note against the r83 receipt's own bytes, re-read at the r84 receipt where the law is carried)
recheck: `jq -r '.legs[13].uploadPng.hex, (.legs[13].stateAfter.k|tojson), (.fixtureInputs[]|select(.id=="k")|.accept)' corpus/evidence/round83/chromium-showpicker/receipt.json` and `grep -n 'accept="image/png"' scripts/chrome-cdp-showpicker-round83.mjs` → the extension token on `#k`, the MIME token on `#accept` targeted by no leg, and the 8-byte-signature-plus-13-byte-marker payload; the r83 counter at its pin
  `node scripts/check-showpicker-r83.mjs --lane <ABS lane> --receipt corpus/evidence/round83/chromium-showpicker/receipt.json --expect-driver-sha256 70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce --expect-nonce tabi-r83-l1-b6496e6f5d4f --expect-fixture-sha256 7784c9dece0f5c7ad1911733281a8bd7337a8a5588799cbda9acc02f9a9e55fa --prior-set .ufo/waves/round-83/controls/c1/prior-set.txt --json` → exit 0, 74 checks

# Erratum to `corpus/knowledge/chromium-showpicker-runtime-round-83.md` (round 84, append-only)

This block is appended to the r83 note's own file. **The frozen law text above is not rewritten.**
The r83 non-author spot-check (`corpus/lessons/round-83-verifier-spotcheck.md`, §Routed defects 1
and 2) found law 3 and the "real PNG" sentence overstated against the committed r83 receipt.
Corrected of record:

1. **Law 3's accept token.** The answered input is `#k`, whose `accept` attribute is `accept=".png"`
   — an **extension** token (`receipt.fixtureInputs`, `legs[8]`/`legs[13]`). The fixture's other
   `accept` attribute, `accept="image/png"` on `#accept`, is targeted by **no leg** of the r83
   receipt; `image/png` in the law is the **delivered file's media type**, not an `accept` token the
   leg exercised. The MIME-token and `image/*` branches of the token grammar stay **frontier**
   (`R83Scout.md` §5.1; `R83Scribe/knowledge-note.md:61-64` — "the fixture's `accept="image/png"`
   input (`#accept`) is targeted by no leg … the MIME-token and `image/*` branches of the grammar
   stay unmeasured"). The r83 receipt's own bytes carry this: `fixtureInputs` lists `#k` with
   `accept:".png"` and no `#accept` entry, and the two answer legs target `k`.

2. **"A real PNG".** The delivered bytes are the **8-byte PNG signature** `89 50 4e 47 0d 0a 1a 0a`
   followed by the **13-byte ASCII marker** `tabi-r83-png\n` — 21 bytes in all
   (`legs[13].uploadPng.hex` = `89504e470d0a1a0a746162692d7238332d706e670a`, `size` 21) — not a
   decodable PNG image. The measured law is **byte-acceptance** of a non-empty file, not image
   validity. (The r84 generation carries the same bytes: `legs[16].uploadPng.hex` is the identical
   hex and sha256 `575d88a4…`, because the driver's content strings are pinned to the r83 bytes and
   only the file *names* are r84.)

3. **The law-count sentence.** "The r82 seven laws are carried forward" names five clauses; the
   counter carries **eight** r82 check ids (`gesture-law`, `activation-law`, `mode-law`,
   `cross-origin-nonfile-law`, `order-law`, `webkitdirectory-answer-law`, `accept-answer-law`,
   `click-while-open-law`), all eight present in the r84 counter as well. The number was a label,
   not a count of distinct checks.

Generation r84 measures the frontier this note named — the cross-origin `type=tel`/`search`/`text`
legs — and carries every r83 leg forward; see
`corpus/knowledge/chromium-showpicker-runtime-round-84.md`.
