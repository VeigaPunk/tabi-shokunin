# ScoutFirefoxCensus — report (round 35, w1, milestone C2)

**Verdict.** The census's "Firefox absent / never profiled" statements (`corpus/knowledge/browser-surface-census.md:34`, `:95-96`) are stale as live state. Firefox 158.0.1 is a user-local unpack at `~/.local/opt/firefox-158.0.1` (symlinked as `~/.local/bin/firefox`); geckodriver 0.37.1 sits in `~/.local/bin`. `pacman -Q firefox` still reports not found, so line :34's pacman observation stays literally true. `~/.mozilla` still holds only the 1Password NMH json (its mtime moved to 2026-10-26 12:08), and no Firefox profile exists. Two empty Firefox-created shells now exist at `~/.config/mozilla/firefox` and `~/.cache/mozilla/firefox` (both 2026-10-26 17:48). Append-only correction lines are drafted in `census-delta.md` §3. Only the census (`:34`, `:95-96`) and `corpus/README.md:14` assert Firefox absence among live lane files. SKILL.md has zero "firefox" matches. Appending will invalidate the census hash pins at `SKILL.md:816/1221/1361` and `corpus/README.md:14`, so L1 must refresh them. `SKILL.md:45` is already stale.

## Evidence (all read-only; shell `cwd=/tmp`)
- `firefox --version` (both paths) → `Mozilla Firefox 158.0.1`, exit 0. `geckodriver --version` → `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`, exit 0. `pacman -Q firefox` → `error: package 'firefox' was not found`, exit 1.
- sha256 and sizes:
  - `firefox` (5,520 B stripped ELF stub): `a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789`
  - `firefox-bin` (659,992 B): `46e2c204ab769f1cb49fea4918e134c84829d2ab38278fb087a072f77b6e7294`
  - `geckodriver` (6,029,440 B): `f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f`
- Install tree: `du -sb` 340,636,387 B, 51 files. `application.ini` shows `Version=158.0.1`, `BuildID=20261019185856`, `SourceStamp=48a735cc…287a23`.
- `which -a firefox geckodriver` → only the two `~/.local/bin` entries. `pgrep -a -f 'firefox|geckodriver'` → no processes.
- `find ~/.mozilla -maxdepth 3 -type d` → only `.mozilla` and `.mozilla/native-messaging-hosts`. No profile content was read.
- Census file: 265 lines, sha256 `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b`, matching the `SKILL.md:816/1361` pin.
- `grep -rIil firefox SKILL.md corpus` → 44 files. Hits are listed in `census-delta.md` §2 and mostly carry no absence claim; `node_modules` and `round-18/24/29` mirrors were omitted.
- Unrun: `xdg-settings get default-web-browser` was not re-run. Which invocation created the `~/.config/mozilla/firefox` shells was not measured. The draft marks the cause as `[INFERENCE]`.

## Deliverables
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ScoutFirefoxCensus/census-delta.md`
- This report.

Nothing else was written. No scratch was created, and no browser or driver was launched or left running.
