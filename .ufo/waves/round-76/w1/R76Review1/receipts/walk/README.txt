Walk-evasion artifacts used against prior-set-complete (check-dialog-r76.mjs:213-219).
Each file carries schema tabi-chrome-cdp-dialog-r76 and a nonce other than the run under test, so a correct walk must flag it.
evil-plain.receipt.json          -> control: flagged (exit 1, prior-set-complete) when placed as *.json in a walked tree.
evil-escaped-schema.receipt.json -> parses to the exact schema (JSON \u002d escapes); byte needle misses it -> clean (exit 0).
evil-bom.receipt.json            -> needle present, JSON.parse throws on the BOM -> clean (exit 0).
evil-utf16le.receipt.json        -> UTF-16LE bytes: needle absent, parse throws -> clean (exit 0).
evil-unparsable.receipt.json     -> needle present, JSON.parse throws -> clean (exit 0).
Also tested at run time (not reproducible as plain files): symlink to a file, symlink to a directory, *.JSON case, mode-000 file, mode-000 directory, FIFO; all -> clean (exit 0).