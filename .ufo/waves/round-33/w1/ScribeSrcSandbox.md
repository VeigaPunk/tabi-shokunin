# ScribeSrcSandbox — C2 source row S129 (what `--no-sandbox` disables)

**Verdict.** S129 is grounded at the measured tag and ready to paste, with one disclosed wording
correction: the item's named page `docs/linux/sandboxing.md` **does not exist** at
`refs/tags/154.0.8037.97` (HTTP 404), and no document at that tag states what `--no-sandbox` turns
off. The Linux implementation document at this tag is `sandbox/linux/README.md`, and it says
Chromium uses "multiple layers of sandboxing" naming `setuid(2) everywhere`, `namespaces where
supported`, `seccomp(2) BPF where supported`; its §setuid(2) describes the setuid helper entering
PID/network namespaces, chrooting and dropping capabilities. The switch scope comes from
`sandbox/policy/switches.cc:42-44` at the same tag: "Disables the sandbox for all process types
that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only."
So the row is `kind docs` as ordered, but its flag half is a code citation; the L1 may keep it as
drafted (S004 already cites two files in one anchor) or split it into a `code` row — it must not
relabel the row `code`, which would misdescribe the primary URL. Host build identity matches the
tag (`chromium 154.0.8037.97-1`, `ChromeDriver 154.0.8037.97`), and ExecLiveLeg's measured live leg
runs **without** `--no-sandbox` against a setuid `chrome-sandbox`, i.e. inside the layers this row
describes. No lane file was edited; no browser was started by this seat.

## Evidence

Commands (all read-only; scratch `TMPDIR`-style dir under `/fast/scratch/hyaku/tabi-r33/ScribeSrcSandbox`, since deleted):

| # | command | exit | result |
|---|---|---|---|
| 1 | `curl -q -sS --proto =https -o sandboxing.b64 -w '%{http_code} %{size_download}\n' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/docs/linux/sandboxing.md?format=TEXT'` | `exit=0` (printed; HTTP 404) | item's named doc absent; 233 B body `NOT_FOUND: Requested entity was not found` |
| 2 | same for `…/docs/linux/suid_sandbox_development.md?format=TEXT` | `exit=0` (printed; HTTP 200) | 4,228 B raw |
| 3 | loop: `curl … -w '%{http_code} %{size_download}'` + `sha256sum` + `base64 -d` for `…/sandbox/linux/README.md`, `…/docs/linux/sandbox_ipc.md`, `…/docs/design/sandbox.md`, `…/docs/linux/zygote.md` | block returned 0; per-fetch status printed | 200 / 5,348 / 2,896 / 37,776 / 5,060 B |
| 4 | loop as #3 for `…/docs/design/sandbox_faq.md`, `…/sandbox/README.md`, `…/docs/linux/pid_namespace_support.md`, `…/sandbox/policy/switches.cc`, `…/chrome/common/chrome_switches.cc` | block returned 0; per-fetch status printed | 200 / 200 / 200 / 200 / **404** (the older switches path is gone; `kNoSandbox` lives in `sandbox/policy/switches.cc`) |
| 5 | `grep -n '' sandbox_readme.md`, `grep -n '' sandbox_policy_switches.cc` | 0 | located the quoted lines |
| 6 | `grep -c 'sandbox/linux/README' corpus/SOURCES.md` | 0 | count `0` — no duplicate URL against S001-S126 |
| 7 | `pacman -Qi chromium \| sed -n '1,4p'`; `/usr/bin/chromedriver --version` | 0; `drv_exit=0` | `154.0.8037.97-1`; `ChromeDriver 154.0.8037.97 (b510e9d7…refs/branch-heads/8037@{#1673})` |
| 8 | `pgrep -fa 'chromedriver\|chromium'` at 2026-10-26T18:25:43Z | 0 | one line only, `earlyoom -r 3600 … --prefer …chromium…` (its own argv); no browser process of mine |

Fetch receipts (`receipts.tsv`, raw = `?format=TEXT` base64 body, decoded = base64 output):

| URL | UTC | HTTP | raw B | raw sha256 | decoded B | decoded sha256 |
|---|---|---|---|---|---|---|
| `…/docs/linux/sandboxing.md?format=TEXT` | 2026-10-26T18:22:07Z | 404 | 233 | `b52a956c404944f98d4ac5a0f9b3f170e82d7003430cc6fcbae1f5633ad55198` | — | — |
| `…/docs/linux/suid_sandbox_development.md?format=TEXT` | 18:22:07Z | 200 | 4,228 | `bd1562ceb74fa51400d5977da0282ba7e564ed38ac34392640d87c6c9acb59b3` | 3,171 | `5028871d625c97d5100b9005de682d5a723261f59d5dbe382305ffccb79dead4` |
| `…/sandbox/linux/README.md?format=TEXT` | 18:22:17Z | 200 | 5,348 | `5a1ddc20bcfde734007c3b93200ce7e18c40a6f89c9a60683ec25649b208c2be` | 4,009 | `01c033462774302a7d8be970e8846e5d690e9b6afd3bf971e3de66863cccf9a2` |
| `…/docs/linux/sandbox_ipc.md?format=TEXT` | 18:22:17Z | 200 | 2,896 | `40270eca31167cfc151b2eaf980a2a2d2b85efcaee0684b179a62f47aa9b6c1e` | 2,171 | `aa7cee56586a8483620ef5fca4e79e4e41f914ff1956a97a64c0b4a24c186329` |
| `…/docs/design/sandbox.md?format=TEXT` | 18:22:26Z | 200 | 37,776 | `6d4a3b0c0ad4c9aa0bd9aab9c9f79439093f46076efe91f200ce26ef18789b61` | 28,331 | `7b4efcf54eead4d0a30a941740472dde0124609b13e30130ffc4ef7ff4151c75` |
| `…/docs/linux/zygote.md?format=TEXT` | 18:22:29Z | 200 | 5,060 | `603387523c82079db5b1b4ff119c8d06a0dab2c13f60448ba373b521e2906442` | 3,794 | `214ebb5d32c7f9ae4b4992709c0681e1f6995f5463e089cdce90cf587eb8a1bd` |
| `…/docs/design/sandbox_faq.md?format=TEXT` | 18:22:41Z | 200 | 8,304 | `d93e93a39d48f1cb07a154201567d77071fa16a0c75f3ce41372995316212988` | 6,228 | `6a1c3ba7a7a8d7da505749be96d215bb01b50e6097ba0e853e0b6cb09471c82c` |
| `…/sandbox/README.md?format=TEXT` | 18:22:42Z | 200 | 1,600 | `3d198b4dca0ea34c6a8c4c6c8a814cb52d8a1aec254e80831254f1214b2fa87b` | 1,200 | `0ba3c70fd9301204a8dabdb7f0688e2d8afb22d7baece912bd858b3ed94d0f4e` |
| `…/docs/linux/pid_namespace_support.md?format=TEXT` | 18:22:53Z | 200 | 1,468 | `88b3ae8801ea31e18ddcbe5d03560a513f18c48c04b0eb4034acdb02fc66ab25` | 1,101 | `835d20a13877d6bfbac46678b6085fe541b8e461450d5df460a40e601b01e14b` |
| `…/sandbox/policy/switches.cc?format=TEXT` | 18:22:54Z | 200 | 4,268 | `a614c36721de60e7ba883903b11f82f621e4eaa07d1224522e27b581c950b81a` | 3,200 | `b30542ce1440a6e226df07a37398adb5ee6dc38d475778d23b4a2acf27e39043` |
| `…/chrome/common/chrome_switches.cc?format=TEXT` | 18:22:55Z | 404 | 233 | `d2e40ab56ba056ff4ad946cbaeaec33b7c19f472bb26ecfbf651198117852e3a` | — | — |

(all URLs under `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/`)

Located quotes (in the decoded bytes):

- `sandbox/linux/README.md:21-22` — "We also generally use multiple layers of sandboxing, to
  achieve both confinement for the process and reduction of the exposed kernel attack surface"
  (23 words), followed at `:23-27` by "Of these mechanisms, Chrome uses:" → `setuid(2) everywhere`,
  `namespaces where supported (modern Linux kernels)`, `seccomp(2) BPF where supported (modern
  Linux kernels)`. §setuid(2) at `:36-52` — renderer sandboxed "by creating empty namespaces for it
  at launch time", setuid binary at `/opt/google/chrome/chrome-sandbox`, PID+network namespaces
  (`:41-42`), chroot (`:43-46`), `capset(2)` (`:51`); `:60` — `--disable-setuid-sandbox` disables
  that layer; `:54-56` — setuid strength "varies between kernel versions".
- `sandbox/policy/switches.cc:42-43` — "Disables the sandbox for all process types that are
  normally sandboxed. Meant to be used as a browser-level switch for testing purposes only."
  (23 words), declaring `const char kNoSandbox[] = "no-sandbox";` at `:44`.

## Registry row as drafted (11 cells)

| S129 | The Linux Sandbox — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/sandbox/linux/README.md | docs | A | Chromium Linux sandbox layers at 154: which mechanisms Chrome uses, what the setuid helper does, and the scope of the `--no-sandbox` switch; not the strength those layers give on a given kernel | tag 154.0.8037.97, §Overall Design lines 20-27 and §setuid(2) lines 36-52; the switch sentence from sandbox/policy/switches.cc:42-44 at the same tag | Chromium's Linux sandbox is layered (setuid helper with PID and network namespaces, chroot and capability drop, plus seccomp-BPF), and `--no-sandbox` is a browser-level testing switch that disables the sandbox for all process types that are normally sandboxed, so a live leg reaches the sandboxed path only when it omits it | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md |

## Gate line as drafted (for `corpus/lessons/round-33.md` §Gate)

| S129 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/sandbox/linux/README.md | 2026-10-26T18:22:17Z (ScribeSrcSandbox; HTTP 200, 5,348 B raw `?format=TEXT`, sha256 `5a1ddc20bcfde734007c3b93200ce7e18c40a6f89c9a60683ec25649b208c2be`; decoded 4,009 B, sha256 `01c033462774302a7d8be970e8846e5d690e9b6afd3bf971e3de66863cccf9a2`) | §Overall Design lines 21-22: "We also generally use multiple layers of sandboxing, to achieve both confinement for the process and reduction of the exposed kernel attack surface"; no doc at this tag states the switch scope, so `sandbox/policy/switches.cc:42-43` (2026-10-26T18:22:54Z, HTTP 200, 4,268 B raw, sha256 `a614c36721de60e7ba883903b11f82f621e4eaa07d1224522e27b581c950b81a`; decoded 3,200 B, sha256 `b30542ce1440a6e226df07a37398adb5ee6dc38d475778d23b4a2acf27e39043`): "Disables the sandbox for all process types that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only." |

Rejected candidates (detail in the row file): `docs/linux/suid_sandbox_development.md` (self-declared
"mostly out-of-date", setuid-helper installation only, no layer composition, no `--no-sandbox`; flip:
a missing/version-mismatched setuid helper or the `CHROME_DEVEL_SANDBOX=""` ≡
`--disable-setuid-sandbox` note at lines 61-62); `docs/design/sandbox.md` (its only `--no-sandbox`
sentence is `:88-89` inside `## Sandbox Windows architecture`; flip: a Linux-section statement of the
switch); `docs/linux/sandboxing.md` (404 at this tag).

## Structural notes for the L1

- 11 cells ⇒ 13 `split('|')` fields; kind `docs` ∈ `kinds` (`scripts/check-sources.mjs:26`), tier `A`,
  status `mined`, ISO `opened`, `90d` recheck, non-bare anchor. Checked by reading the checker and by
  `awk -F'|'` field count; the checker itself was **not run** (leaf rule: no lane gates).
- `used-by` requires the note to contain the token `S129` (checker `inspectUsedBy` at `:203`;
  `used_by_*` findings at `:331-338`). The note seat must carry it; this seat did not create
  `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`.
- No duplicate URL: no current row cites `sandbox/linux/README.md` (`grep -c` = 0).
- C2 integration point: the note's flag-scope section (live leg must not pass `--no-sandbox`; on this
  host `/usr/lib/chromium/chrome-sandbox` is setuid root per ExecLiveLeg) cites S129.

## Limits

- Single tag (`154.0.8037.97`); nothing here claims per-kernel layer strength.
- The `--no-sandbox` reading is the switch's own comment. `sandbox/policy/linux/sandbox_linux.cc`
  was not opened, so no per-layer code path is asserted.
- No browser started by this seat; live-leg facts belong to ExecLiveLeg.
- Tool installs: none. Scratch `/fast/scratch/hyaku/tabi-r33/ScribeSrcSandbox` removed after copying
  `receipts.tsv` and `fetch/` into the output dir.

## Deliverables

- `.ufo/waves/round-33/w1/ScribeSrcSandbox/source-row-S129.md` — row, Gate line, wording finding,
  rejected candidates, structural notes.
- `.ufo/waves/round-33/w1/ScribeSrcSandbox/receipts.tsv` — 11 fetches + 2 404s, raw/decoded hashes.
- `.ufo/waves/round-33/w1/ScribeSrcSandbox/fetch/` — raw `?format=TEXT` bodies and decoded bytes
  (184 K total).
- This report: `.ufo/waves/round-33/w1/ScribeSrcSandbox.md`.
