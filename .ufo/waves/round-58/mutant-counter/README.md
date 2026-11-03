# R58MutCounter — MUTATE-RUN-REVERT receipts (r58 C2 counter)

Probed generation: `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs`
sha256 `632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52`
(83 630 B; matches the sha declared in `counters/R58Counter.md`). The file was
stable for 120 s across four 30 s polls before the probe and its sha was
re-checked after every mutant; it never changed during the probe.

Independent selftest on the unmutated repo bytes — `node chromium-receipt-r58.mjs --selftest`
→ exit 0, `allPass true`, **78 cases / 78 pass**, id coverage 49/49, uncovered [],
stray [] — `selftest-independent.json` (+ full stdout `selftest-independent.log`).

Each mutant ran in its own scratch copy (`/fast/scratch/hyaku/tabi-r58/R58MutCounter/<id>/`);
the pristine copy's selftest was green (78/78) before the mutation, the mutant ran
`--selftest` plus the seeded refusal fixture through the CLI, and the copy was restored
to the pristine sha afterwards. The repo counter was never written.

- **m1 — KILLED**: dropped `if (bs.defaultPrevented !== true) add('swallow-defaultprevented-missing', …)` → selftest 77/78, case `swallow-defaultprevented-missing` wants `[swallow-defaultprevented-missing]` got `[]`; fixture CLI pristine exit 1 `[swallow-defaultprevented-missing]` → mutant exit 0 `[]`. (`m1-kill.json`)
- **m2 — KILLED**: weakened both negative-edit witnesses (`bs.valueAfter`/`dg.valueAfter` equality → `startsWith` prefix) → selftest 77/78, case `swallow-value-changed` wants `[swallow-value-changed]` got `[]`; fixture CLI pristine exit 1 `[swallow-value-changed]` → mutant exit 0 `[]`. (`m2-kill.json`)
- **m3 — KILLED**: dropped the one-submission check `if (echoes.length !== 1 || submissions.length !== 1) { … }` → selftest 77/78, case `swallow-enter-chord-leak` wants `[swallow-enter-chord-leak]` got `[]`; fixture CLI pristine exit 1 `[swallow-enter-chord-leak]` → mutant exit 0 `[]`. (`m3-kill.json`)
- **m4 — KILLED**: weakened the nonce binding `NONCE_RE = ^tabi-r58-[0-9a-f]{12}$` → `^tabi-r58-` → selftest 77/78, case `nonce-shape` wants `[nonce-shape]` got `[field3-not-empty, swallow-plan-mismatch, swallow-recorder-fields-missing]` (the malformed nonce is admitted and the swallow plan is graded against a nonce it cannot bind); fixture CLI pristine exit 1 `[nonce-shape]` → mutant exit 1 `[swallow-recorder-fields-missing, swallow-plan-mismatch, field3-not-empty]`. (`m4-kill.json`)
- **m5 — KILLED**: dropped the per-entry recorder-fields check `if (typeof e.cancelable !== 'boolean' || typeof e.defaultPrevented !== 'boolean') { … }` → selftest 77/78, case `swallow-recorder-fields-missing` wants `[swallow-recorder-fields-missing]` got `[]`; fixture CLI pristine exit 1 `[swallow-recorder-fields-missing]` → mutant exit 0 `[]`. (`m5-kill.json`)

Restoration: every receipt records `restore.equalsPristine true`,
`restore.repoBytesUntouched true`, and `afterRestoreSha256 =
632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52`. No survivors.

Full findings, method and the next-generation coverage notes: `R58MutCounter.md`.
Scoped wave copy: `../w1/R58MutCounter.md`.
