# round-86 do-nothing controls

- `nowork-r85-under-r86.json` — the r85 scored receipt under the r86 counter. **Re-captured
  2026-11-08T09:29Z** after the wave, at lane tip `9919aa52` plus the untracked round-86 tree:
  exit 1, `verdict findings`, **89 checks, 40 findings**. The first capture (39 findings) predated
  the scored r86 receipt and the two priors, so `prior-set-complete` could not fire; the difference
  is tree state, not an instrument change (R86Sentinel F1).
- `noreceipt.txt` — a nonexistent receipt path: exit 2, `receipt-unreadable`.
