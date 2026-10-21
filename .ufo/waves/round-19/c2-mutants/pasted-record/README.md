# Pasted-record H4 mutant

## Red reason

Round 18 H4 accepts a passing download case copied from the committed round-18 receipt: the predicate checks the record's pass bit and refusal fields but does not bind the record to a fresh per-run nonce. The direct probe executes the exact `retainedCoverage` and `h4Hazard` function bodies from `.ufo/waves/round-18/measure-c2.mjs` against the verbatim copy `pasted-receipt.json`.

## Command and observed output

Command (`argv`): `node /fast/scratch/tabi-r19/ExecC2Mutants-4/.ufo/waves/round-19/c2-mutants/pasted-record/run-h4.mjs`

Exit: **0**

`stdout` (also retained byte-for-byte in `results.json`):

```json
{"schema":"tabi-r19-c2-pasted-h4-probe-v1","verdict":"pass","counterSha256":"99ad9ff7ca664eaa3e64948308a53d1827e34983ce874c8b26f6e5dc6a49e4dc","pastedReceiptSha256":"43b3711eba135b6558df595637435acb0d3500519317bfeaa285da805af2e376","coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing, with the expected producer identity","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"producerPass":null,"producerPath":"scripts/webmcp-invoke-round18.mjs","producerSha256":"d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa","duplicateCases":[],"duplicateControls":[]},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"isolation":"exact round-18 retainedCoverage and h4Hazard function bodies; receipt copied verbatim; normal run fields are the minimal passing shape; no browser-execution evidence is supplied"}
```
