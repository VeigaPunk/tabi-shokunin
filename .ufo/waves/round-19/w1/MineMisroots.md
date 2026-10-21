# Tabi misroot sweep

Scope: read-only inventory of `/home/vgpnk/Projects/shokunin` using `git status --porcelain --untracked-files=all`, content checks of the untracked entries, and a path-name scan of `.ufo/waves/`. No candidates were moved, deleted, or edited.

## Untracked candidates

The fleet status reported 17 untracked files: 15 `*.report-baseline` state files, one round-19 Kama report, and one round-37 falsify audit. Only the following were plausible Tabi/round matches after checking names and content:

| Path | Size | First line | Belongs to Tabi? |
|---|---:|---|---|
| `/home/vgpnk/Projects/shokunin/.ufo/state/tabi.report-baseline` | 68 bytes | `19 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | **Yes, as Tabi-lane bookkeeping only.** The filename identifies the Tabi lane and the first field is `19`; the digest is SHA-256 of empty content. It is not a Tabi report or production artifact. |
| `/home/vgpnk/Projects/shokunin/.ufo/reports/round-19/kama.md` | 8,035 bytes | `# kama — round 19 (attempt 1)` | **No.** Content identifies the Kama round-19 report and discusses round-18 defects, with no Tabi mention or Tabi seat name. |

No untracked file content matched `tabi` case-insensitively except the tracked-modified watchdog log noted below. The other 14 state files name other lanes. The remaining untracked file, `/home/vgpnk/Projects/shokunin/.ufo/waves/round-37/falsify/AuditRemainder6.md` (8,455 bytes; first line `# AUDIT Remainder6 — census group 6/8 (round-37 restoration)`), is a round-37 audit, not Tabi. No Tabi seat name was found in untracked-file content.

## Tabi-named paths under fleet `.ufo/waves/`

All eight entries below were returned by the case-insensitive Tabi-name scan and are tracked according to `git ls-files`:

- `.ufo/waves/hyaku/jj-w1/reports/JjTrialTabi.md`
- `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md`
- `.ufo/waves/kaika-aggregate/seats/audit-tabi.md`
- `.ufo/waves/kaika-w1/tabi-art.md`
- `.ufo/waves/kaika-w1/tabi-state.md`
- `.ufo/waves/kaika-w2j/tabi.md`
- `.ufo/waves/kaika-w3/tabi-critic.md`
- `.ufo/waves/kaika-w3/tabi-review.md`

One lexical false positive also matched: `.ufo/waves/shokunin12h-20261014-p4-mori-r1/members/RerunStability.md` contains the substring `tabi` inside “Stability”; its content identifies the Mori lane and the `RerunStability` seat, not Tabi. The `misroots/` entries observed were `MoriR16.Lesson`, `SoujiR15`, and `TameshiR15`; no Tabi-named entry appeared there.

## Status note

`.ufo/watchdog.log` was modified but tracked, not untracked. Its contents include a Tabi round-19 launch record; it was left untouched and is excluded from the candidate list.

## Isolation

- Production files: none; no clone, branch, or commit was created.
- Fleet candidates and wave files: unchanged.
- Sole write: this requested report at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/MineMisroots.md`.
