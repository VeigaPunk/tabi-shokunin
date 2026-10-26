# Host browser census delta — Firefox (round 35, w1, ScoutFirefoxCensus)

Read-only. Measured 2026-10-26 (host clock, ~-03:00; clone-free, no browser launched).
No profile/cookie/login content read; `~/.mozilla`, `~/.config/mozilla`, `~/.cache/mozilla` reported shape-only.

## 1. Measured present state (observations)

| Fact | Command → output |
|---|---|
| Launcher path | `ls -la ~/.local/bin/firefox` → `lrwxrwxrwx … Oct 26 17:48 /home/vgpnk/.local/bin/firefox -> /home/vgpnk/.local/opt/firefox-158.0.1/firefox` |
| Real executable | `file …/firefox-158.0.1/firefox` → `ELF 64-bit LSB executable, x86-64 … stripped` (NOT a shell wrapper: 5,520 B stub ELF; payload is `firefox-bin` 659,992 B + `libxul.so` 188,813,968 B) |
| Version (both paths, exit 0) | `~/.local/opt/firefox-158.0.1/firefox --version` → `Mozilla Firefox 158.0.1`; `~/.local/bin/firefox --version` → `Mozilla Firefox 158.0.1` |
| `application.ini` | `Version=158.0.1`, `BuildID=20261019185856`, `SourceRepository=https://hg.mozilla.org/releases/mozilla-release`, `SourceStamp=48a735cc74a7e6d730f9bf59c3de58f750287a23` |
| Executable sha256 `firefox` | `a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789` (5,520 B; symlink and target identical) |
| sha256 `firefox-bin` | `46e2c204ab769f1cb49fea4918e134c84829d2ab38278fb087a072f77b6e7294` (659,992 B) |
| geckodriver | `/home/vgpnk/.local/bin/geckodriver` 6,029,440 B, mtime Jul 17 06:35, sha256 `f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f`; `--version` (exit 0) → `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)` |
| Install tree | `/home/vgpnk/.local/opt/firefox-158.0.1` 340,636,387 B (`du -sb`), 51 files; dir mtime Oct 26 17:48; payload file mtimes Oct 19 17:36 (upstream build time) |
| PATH | `which -a firefox geckodriver` → only `/home/vgpnk/.local/bin/firefox`, `/home/vgpnk/.local/bin/geckodriver` (no system copy) |
| Package manager | `pacman -Q firefox` → `error: package 'firefox' was not found` (exit 1) — **still true; Firefox is not a pacman package, it is a user-local unpack** |
| Processes | `pgrep -a -f 'firefox\|geckodriver'` → none at measurement time |
| `~/.mozilla` | `drwx------ … Oct 11 10:26`; `find -maxdepth 3 -type d` → only `~/.mozilla` and `~/.mozilla/native-messaging-hosts`; one file `com.1password.1password.json` 324 B, mtime **2026-10-26 12:08** (census recorded 2026-10-13 11:02 — rewritten since). Still no Firefox profile directory there. |
| Firefox-created state (new) | `~/.config/mozilla/firefox` (dir, created Oct 26 17:48; contains `Crash Reports/` [`events/`, `crash_helper_server.log` 0 B] and empty `Pending Pings/`); `~/.cache/mozilla/firefox` (empty dir, Oct 26 17:48). These are first-run/crashhelper litter from this round's `--version`/launch; **no `profiles.ini`, no profile dir** — Firefox is still not profiled on the host's default location (any BiDi profile is a throwaway under a seat scratch). |

Anomaly to keep honest: `~/.config/mozilla/firefox` + `~/.cache/mozilla/firefox` at 17:48 mean some Firefox invocation ran with real `$HOME`/XDG (likely the install-time `--version`); lane seats were told to keep HOME/XDG in scratch. Cause is `[INFERENCE]`; not attributable from shape alone.

## 2. Stale statements to supersede (cite, do not edit)

Primary — `corpus/knowledge/browser-surface-census.md` (265 lines, sha256 `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b`, last commit bc4b7d5):
- `:34` — "Firefox: no `firefox`/`firefox-esr` on PATH; `pacman -Q firefox` → `error: package 'firefox' was not found`." (§1.2 "Not installed")
- `:95-96` — "**no Firefox profile directory** … Firefox never profiled on this host." (§2.4) — also `:94` "`~/.mozilla/` — only `native-messaging-hosts/…` (324 B, mtime 2026-10-13 11:02)".
- `:37` mentions `/opt` listing, unaffected. `:219-220` (round-2 errata "`~/.mozilla/` = NMH only, no profile dir") and `:250` (round-4 "`~/.mozilla/` = NMH only") re-verified at their dates — still literally true for `~/.mozilla`, but now misleading as to "no Firefox".
- `:173` (I1) "Mozilla config shells" clustering inference — still holds for `~/.mozilla`; unaffected.
- Heading of §1.1 `:15-19` lists Chromium as the only "Installed and runnable" row.

Other lane files stating Firefox absent / unmeasured / single-engine (path:line; from `grep -rn -i firefox SKILL.md corpus`, 44 files hit, noise from `node_modules`, `round-18/24/29` mirrors omitted):
- `corpus/README.md:14` — coverage row for the census: "chromium 152.0.7977.82-1 the only real install; measured absences for Firefox/Brave/Chrome/Vivaldi et al., rejection kept" (**stale for Firefox**; row also pins `70d1d455ee18`).
- `corpus/evidence/tabi-r2-3-verify/old-browser-surface-census.md:34,95-96` and `corpus/evidence/w4-erb-b-append-proof/pre/browser-surface-census.md:34,95-96` — frozen byte copies of the pre-append census (evidence; **must NOT be edited**, listed only so nobody "fixes" them).
- `corpus/knowledge/webdriver-bidi-runtime-round-32.md:7` ("re-run … on a second engine"), `:114` ("Still open for … other engines"), `:133` ("Nothing here generalizes to … another engine") — not absence claims but the open-engine limits that this round's C2 entry is meant to answer; the new Firefox entry must cite them rather than edit them.
- `corpus/knowledge/webdriver-bidi-capability-matrix.md:36,44-47,110-111` — documentary-only Firefox statements (S007 MDN direct-launch, S010 Firefox 102, S011 Firefox 129); "nothing run against a live browser" `:6`. Not wrong; now supplemented, not superseded.
- `corpus/knowledge/navigation-history-bfcache-evidence.md:94` — U5 "Firefox and Safari also ship a bfcache (S104); nothing here claims their protocol surfaces match Chromium's" — still true; bfcache not tested on Firefox by C2.
- `corpus/SOURCES.md:24-25` (S010, S011), `:83` (S069) — historical Firefox BiDi shipment rows; no absence claim.
- `corpus/lessons/kaika-fleet-round-1.md:53-54`, `round-12.md:48`, `round-18.md:65` — quotes of S010/S011/S069; no absence claim.
- `SKILL.md` — **no match** for "firefox" (case-insensitive). `SKILL.md:1875` ("Chromium-only surface") concerns declarative WebMCP tool specs, not a host-census absence. The SKILL does carry the census pin: `:45` `a4bbb39edb12` (stale pre-refresh value), `:816`/`:1361`/`:1221` `a33c22644d64`·265 (current on-disk hash). **Appending to the census will change its hash and make `:816`, `:1221`, `:1361` and `corpus/README.md:14` pins stale; L1 must refresh them (the census's own §6 errata convention: "The post-append hash necessarily differs — re-derive with `sha256sum`").**
- `corpus/knowledge/webmcp-chromium-loopback-round-16.md:85,89`, `webmcp-invocation-round-17.md:85`, `harness-hardening-round-18.md:26` — "Chromium-only" statements about WebMCP/CDP surfaces; remain true (BiDi on Firefox does not implement them). No change.

## 3. Draft append-only census correction lines

Append at end of `corpus/knowledge/browser-surface-census.md` (after `:265`), in the file's existing errata style (dated block header with pre-append sha256, then bold-tagged bullets). Pre-append sha256 to paste: `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b` (re-derive at append time; if the file moved, use the fresh value).

```markdown

Appended 2026-10-26 (tabi round 35, lane C2 — host browser census delta; shape-only read-only measurement by seat ScoutFirefoxCensus, transcript `.ufo/waves/round-35/w1/ScoutFirefoxCensus/census-delta.md`). Nothing above is edited. Pre-append sha256 of this file: `a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b`. The post-append hash necessarily differs — re-derive with `sha256sum`; the §Pins rows in `SKILL.md` and `corpus/README.md` that carry this file's hash are refreshed by the integrator.

- **[2026-10-26, state change] SUPERSEDED AS LIVE STATE — "Firefox: no `firefox`/`firefox-esr` on PATH" (§1.2 :34) and "§1.1 lists Chromium as the only runnable browser".** Firefox 158.0.1 is now present as a **user-local unpack, not a package**: `~/.local/bin/firefox` → `~/.local/opt/firefox-158.0.1/firefox` (5,520 B stripped ELF stub; payload `firefox-bin` 659,992 B, `libxul.so` 188,813,968 B; tree 340,636,387 B / 51 files); `firefox --version` (exit 0) → `Mozilla Firefox 158.0.1`; `application.ini` `Version=158.0.1` `BuildID=20261019185856` `SourceStamp=48a735cc74a7e6d730f9bf59c3de58f750287a23`; `sha256(firefox)` = `a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789`, `sha256(firefox-bin)` = `46e2c204ab769f1cb49fea4918e134c84829d2ab38278fb087a072f77b6e7294`. `command -v firefox` now resolves; `pacman -Q firefox` still → `error: package 'firefox' was not found` (exit 1) — the original `pacman` observation at :34 remains literally true; only the "absent from the host" reading is superseded. Installed this round from Mozilla's official release channel (provenance and signature check are the C2 entry's, not re-measured here). The round-1 row stands as-of-capture (2026-10-14).
- **[2026-10-26, state change] NEW — `geckodriver` is on PATH.** `~/.local/bin/geckodriver` 6,029,440 B, `sha256` `f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f`; `geckodriver --version` (exit 0) → `geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)`. Not in the round-1 `command -v` sweep of 16 names.
- **[2026-10-26, state change] SUPERSEDED AS LIVE STATE — "no Firefox profile directory … Firefox never profiled on this host" (§2.4 :95-96).** Still true for `~/.mozilla` (`find ~/.mozilla -maxdepth 3 -type d` → only `~/.mozilla` and `~/.mozilla/native-messaging-hosts`; sole file `com.1password.1password.json` 324 B, mtime now 2026-10-26 12:08 vs 2026-10-13 11:02 at :95 — rewritten since round 1; content not read) and there is still no `profiles.ini` or profile directory anywhere. But two Firefox-created shells now exist, both mtime 2026-10-26 17:48 and empty of profile data: `~/.config/mozilla/firefox/` (`Crash Reports/{events,crash_helper_server.log 0 B}`, `Pending Pings/`) and `~/.cache/mozilla/firefox/` (empty). Reading: Firefox ran at least once against the real `$HOME`/XDG layout (crash-helper first run); which invocation did it is unmeasured. Any BiDi session profile is a throwaway inside a seat's scratch, not a host profile.
- **[2026-10-26, status] U2-adjacent — Firefox existence is now a measured presence, not an unknown.** No Firefox process at measurement (`pgrep -a -f 'firefox|geckodriver'` → none). Firefox 158.0.1 is runnable but **not the system default** (`xdg-settings get default-web-browser` was not re-run this pass; the :21 `chromium.desktop` reading stays as-of-capture). The round-2/round-4 re-verifications at :219-220 and :250 ("`~/.mozilla/` = NMH only") remain true about `~/.mozilla` and say nothing about `~/.local/opt`.
- **[2026-10-26, scope] Re-run only.** Not re-measured: Chromium/Brave/Vivaldi/Chrome rows, profile sizes, daemon state, `/opt` listing. As-of-capture figures stay capture-scoped.
```

## 4. Notes for L1 (integration, not applied here)
- Append only; do not touch `:34,:95-96`. Pins to refresh after append: `SKILL.md:45` is already stale (`a4bbb39edb12`), `SKILL.md:816` / `:1221` / `:1361` (`a33c22644d64`·265 → new hash·new line count), `corpus/README.md:14` pin text (`70d1d455ee18`, also stale from round 5).
- `corpus/README.md:14` row text "measured absences for Firefox" should be superseded by a new README row/erratum, not rewritten, if the lane's rule for README is append-only (check `CORPUS.md` before deciding — not read by this seat).
- Frozen evidence copies (`corpus/evidence/tabi-r2-3-verify/…`, `corpus/evidence/w4-erb-b-append-proof/pre/…`) are byte proofs; leave untouched.
- `xdg-settings get default-web-browser` was not re-run (not requested); the draft says so rather than asserting it.
