CONFIRMED

R76Exec3 scoped findings — Page domain DISABLED at dialog-open (`--headless=new`, Chromium
155.0.8059.84), 3/3 runs identical.

- Hypothesis CONFIRMED: `confirm()` opened by a real `Input.dispatchMouseEvent` click with only
  `Runtime.enable` sent is NOT suppressed and NOT auto-dismissed — the renderer never returned
  (0/4 `Runtime.evaluate` polls answered in the 3 s window; evaluates stayed unanswered ~74 s
  until SIGKILL). Auto-dismiss (confirm→false at once) refuted.
- The dialog is parked browser-side only: no `page_handlers` → S204 9650-9656 routes it solely to
  the delegate's `JavaScriptDialogManager`; suppression needs `!has_handlers` (S204 9601-9603)
  and the headless manager keeps `has_handlers` true.
- Orphaned-dialog consequence (measured): `Page.enable` never responded (20 s ×2 sessions, no
  late response); `javascriptDialogOpening` never (re)delivered; `Page.handleJavaScriptDialog`
  → `-32602 "No dialog is showing"` on both sessions (S203 1732-1733 — `pending_dialog_` only set
  by the `enabled_`-gated `DidRunJavaScriptDialog`, S203 613-624; `Enable` has no re-emission,
  S203 665-686); `Page.getFrameTree` also unanswered (10 s) while the definite-response handle
  command answered in ~2 s [INFERENCE: FallThrough chain needs the blocked renderer].
- Net: unanswerable via CDP; page blocked until target destruction. `hasBrowserHandler`
  unobservable (no opening event, S202 ~1486-1488).
- Teardown proven each run: `pgrep -af <profileDir>` exit 1, `ps` needle matches [], ports
  closed, 0 sweep survivors, `failures: []`.

Artifacts: `.ufo/waves/round-76/w1/R76Exec3/` — `report.md` (full report + proposed Limits
paragraph, not applied), `probe-disabled-dialog.mjs` (sha256
`d40933c408c08ed0d472fbf1e6ff1aa870bf7d9547f7fd0d22182df3be7d703e`), `run{1,2,3}.json`,
`stdout-run{1,2,3}.txt`.

Checks for main: none required beyond reading the receipts; probe exit code is 1 by design
(strict `core` predicate includes CDP-answerability, which this configuration cannot provide) —
the hypothesis measurements are in `verdict.*` and `blocked.*` of each run JSON.
