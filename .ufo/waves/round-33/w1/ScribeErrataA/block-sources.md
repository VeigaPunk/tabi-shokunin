
## Corrections (append-only)

- **Round-33 correction to `corpus/SOURCES.md:138` (S124 `scope`).** The round-32 C1 driver sends 15 distinct BiDi
  commands over 28 send frames per transcript — `session.subscribe`, `browsingContext.getTree`, `.setViewport`,
  `.navigate`, `.captureScreenshot`, `.locateNodes`, `.traverseHistory`, `.handleUserPrompt`, `script.evaluate`,
  `input.performActions`, `network.addDataCollector`, `.addIntercept`, `.continueRequest`, `.getData`,
  `storage.getCookies` — and sends no event: all 28 send frames carry a `method`. The events the transcripts show
  (`browsingContext.load`, `.userPromptOpened`, `network.beforeRequestSent`, `network.responseCompleted`) appear only
  as `session.subscribe` names and as received notifications, so the cell's "sixteen … commands and one event" does
  not re-derive. Evidence: `.ufo/waves/round-32/w1/ExecDriver/bidi/run1/transcript.jsonl` and `run2`.
