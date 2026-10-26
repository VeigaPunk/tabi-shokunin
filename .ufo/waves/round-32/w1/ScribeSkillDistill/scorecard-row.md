# SCORECARD capability row — draft (round 32, scribe ScribeSkillDistill)

Paste target: end of `SCORECARD.md` (append-only), in the round-32 capability block. Two forms are
supplied because recent rounds use both: a `Capabilities — round N` table (rounds 16, 17, 23, 24) and a
prose block under `**Capability rows (appended; …)**` (round 25). Use one, not both.

## Form A — table row

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webdriver-bidi-runtime | Drive a WebDriver BiDi session on this host (chromium + chromedriver 154.0.8037.97 over the classic `webSocketUrl` handshake, headless, throwaway profile, `127.0.0.1` fixtures only) and read per-surface runtime evidence from it: 16 of the seventeen matrix §2 rows carry a predicate (R16 has no BiDi command), every admitted row is bound to a real rendering by identical first-screenshot bytes and `chromedriverVersion` across two cold runs and, with `--live`, by the gate's own independent session, and each row's predicate is re-checked on that session | `node scripts/check-bidi-runtime.mjs --rev REV --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` → `admitted >= 14`, `failing 0` (raw reading in `.ufo/waves/round-32/measure/`); `--selftest` `cases=27`, `passed=27`; `corpus/evidence/round-32/bidi/receipt.json` (two runs + transcripts); rows in `corpus/knowledge/webdriver-bidi-runtime-round-32.md` | 32 |

## Form B — prose block

WebDriver BiDi runtime transport — drives a BiDi session on this host through the classic
`webSocketUrl` handshake (chromium and chromedriver 154.0.8037.97, headless, throwaway profile,
`127.0.0.1` fixtures only) and reads per-surface runtime evidence from it; the matrix §2 rows R1–R17 are
each decided by a named predicate, R16 (stop-loading) has no BiDi command, and an admitted row requires
a committed two-run receipt whose transcripts are bound to a real rendering (identical first-screenshot
bytes and `chromedriverVersion`) plus, with `--live`, the gate's own independent session. Evidence:
`scripts/check-bidi-runtime.mjs`, `--selftest` (cases=27),
`corpus/evidence/round-32/bidi/receipt.json`, `corpus/knowledge/webdriver-bidi-runtime-round-32.md`.
First-working round: 32.

## Notes for the integrating L1

- Do not paste `admitted=N` with a number this draft cannot observe: the count is the counter's reading
  of the ExecDriver receipt, and it belongs in the measure file and the round report. The frozen target
  is `admitted >= 14`, `failing = 0` (`.ufo/waves/round-32/claims.json` C1).
- `First-working round: 32` is earned by the run that lands the entry + receipt; if the entry is not
  committed at the measured revision this row must not land.
- The capability is transport + evidence operation, not protocol support: R11 (wire truth), R14
  (history witness) and R16 (stop-loading) stay CDP, and R5 (DOMSnapshot shape) stays CDP — the row
  must not be read as "BiDi replaces CDP".
