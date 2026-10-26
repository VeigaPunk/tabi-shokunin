# S129 — Chromium Linux sandbox layers at 154, and what `--no-sandbox` disables

Seat: ScribeSrcSandbox (scribe, C2), round 33 attempt 1.
Source pin: `refs/tags/154.0.8037.97` on chromium.googlesource.com, the same build as the
host package `chromium 154.0.8037.97-1` and `/usr/bin/chromedriver` (ChromeDriver 154.0.8037.97).
Opened 2026-10-26 by read-only HTTPS GET; receipts in `receipts.tsv` and `fetch/`.

## Wording finding (read this before placing the row)

The item asked for "the sentences stating the layer-1 namespace/setuid sandbox". At tag
154.0.8037.97 there is no numbering "layer 1" / "layer 2", and the item's named page
`docs/linux/sandboxing.md` does **not exist** (HTTP 404, 233 B, sha256
`b52a956c404944f98d4ac5a0f9b3f170e82d7003430cc6fcbae1f5633ad55198`). The Linux implementation
document at this tag is `sandbox/linux/README.md` (linked from `docs/design/sandbox.md:19-20`);
it says Chromium uses "multiple layers of sandboxing" and enumerates the mechanisms:

- `sandbox/linux/README.md:21-27`: "We also generally use multiple layers of sandboxing, to
  achieve both confinement for the process and reduction of the exposed kernel attack surface."
  followed by "Of these mechanisms, Chrome uses:" — `setuid(2) everywhere`, `namespaces where
  supported (modern Linux kernels)`, `seccomp(2) BPF where supported (modern Linux kernels)`.
- `sandbox/linux/README.md:36-39`: the setuid sandbox "sandboxes the renderer by creating empty
  namespaces for it at launch time. It relies on a setuid binary, usually installed at
  `/opt/google/chrome/chrome-sandbox`", entering new PID and network namespaces (`:41-42`),
  chroot into an empty read-only root (`:43-46`), `capset(2)` capability drop (`:51`).
- `sandbox/linux/README.md:60`: `--disable-setuid-sandbox` disables that layer only.

No document at this tag states the scope of `--no-sandbox`. The only authoritative sentence is
the switch definition at `sandbox/policy/switches.cc:42-44` (same tag): "Disables the sandbox for
all process types that are normally sandboxed. Meant to be used as a browser-level switch for
testing purposes only." (`docs/design/sandbox.md:88-89` also mentions `--no-sandbox`, but inside
`## Sandbox Windows architecture`; see Rejected 2.)

Consequence for C2's live leg: passing `--no-sandbox` puts the browser process outside every
layer the README describes; omitting it (as the measured live leg does, with
`/usr/lib/chromium/chrome-sandbox` setuid root) leaves the sandboxed path in force. So the row
teaches both the layer composition and the flag scope, and the flag half is grounded in code,
not docs.

## Registry row (11 cells, paste under `## Registry` in `corpus/SOURCES.md`)

| S129 | The Linux Sandbox — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/sandbox/linux/README.md | docs | A | Chromium Linux sandbox layers at 154: which mechanisms Chrome uses, what the setuid helper does, and the scope of the `--no-sandbox` switch; not the strength those layers give on a given kernel | tag 154.0.8037.97, §Overall Design lines 20-27 and §setuid(2) lines 36-52; the switch sentence from sandbox/policy/switches.cc:42-44 at the same tag | Chromium's Linux sandbox is layered (setuid helper with PID and network namespaces, chroot and capability drop, plus seccomp-BPF), and `--no-sandbox` is a browser-level testing switch that disables the sandbox for all process types that are normally sandboxed, so a live leg reaches the sandboxed path only when it omits it | mined | 2026-10-26 | 90d | corpus/knowledge/bidi-runtime-gate-v2-round-33.md |

Structural self-check against `scripts/check-sources.mjs` read at the lane (not run by this seat —
leaf rule bars running lane gates): 11 cells / 13 `split('|')` fields; kind `docs` in
`kinds` (checker line 26); tier `A` in `tiers`; status `mined` with a non-`—` `used-by` path;
`opened` ISO date; `recheck` `90d`; `anchor` non-bare; no `REJECTED:` requirement (status is not
`rejected`); URL normalises to
`chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/sandbox/linux/README.md`, which
`grep -c 'sandbox/linux/README' corpus/SOURCES.md` returns 0 for — no duplicate URL against
S001-S126.

Two placement cautions for the L1:
1. The row's `kind` is `docs` as the item ordered, but its decisive switch sentence comes from
   `sandbox/policy/switches.cc` at the same tag. If the L1 prefers one kind per source URL, either
   keep `docs` with the code sentence as corroboration (as drafted, and as S004 already cites two
   files in one anchor) or split the switch sentence into a `code` row; do not relabel this row
   `code`, which would misdescribe its primary URL.
2. The `used-by` file must exist and contain the token `S129` or `check-sources.mjs` reports
   `used_by_missing` / `used_by_uncited` (checker lines 331-338, via `inspectUsedBy` at 203).

## Gate line (for `corpus/lessons/round-33.md` §Gate)

| S129 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/sandbox/linux/README.md | 2026-10-26T18:22:17Z (ScribeSrcSandbox; HTTP 200, 5,348 B raw `?format=TEXT`, sha256 `5a1ddc20bcfde734007c3b93200ce7e18c40a6f89c9a60683ec25649b208c2be`; decoded 4,009 B, sha256 `01c033462774302a7d8be970e8846e5d690e9b6afd3bf971e3de66863cccf9a2`) | §Overall Design lines 21-22: "We also generally use multiple layers of sandboxing, to achieve both confinement for the process and reduction of the exposed kernel attack surface"; no doc at this tag states the switch scope, so `sandbox/policy/switches.cc:42-43` (2026-10-26T18:22:54Z, HTTP 200, 4,268 B raw, sha256 `a614c36721de60e7ba883903b11f82f621e4eaa07d1224522e27b581c950b81a`; decoded 3,200 B, sha256 `b30542ce1440a6e226df07a37398adb5ee6dc38d475778d23b4a2acf27e39043`): "Disables the sandbox for all process types that are normally sandboxed. Meant to be used as a browser-level switch for testing purposes only." |

Suggested admitted sentence for §Gate: "Admitted: S129 (the item's named `docs/linux/sandboxing.md`
answers 404 at tag 154.0.8037.97 — recorded as a discarded path, not an admitted source; the Linux
layer document at this tag is `sandbox/linux/README.md`, whose §Overall Design names the layers, and
the `--no-sandbox` scope is cited from `sandbox/policy/switches.cc:42-44` at the same tag because no
document at this tag states it. Cited by `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` §4.)"

## Rejected candidates (each opened this seat, tag 154.0.8037.97)

- **`docs/linux/suid_sandbox_development.md`** — opened 2026-10-26T18:22:07Z, HTTP 200, 4,228 B raw,
  sha256 `bd1562ceb74fa51400d5977da0282ba7e564ed38ac34392640d87c6c9acb59b3`; decoded 3,171 B, sha256
  `5028871d625c97d5100b9005de682d5a723261f59d5dbe382305ffccb79dead4`. Reason: the page opens
  "The Linux SUID sandbox is almost but not completely removed … This page is mostly out-of-date"
  (lines 3-5) and its body scopes to building/installing the `chrome_sandbox` helper and exporting
  `CHROME_DEVEL_SANDBOX`; it states no layer composition and never mentions `--no-sandbox`. Flip:
  cite it when the lane must explain a missing or wrongly-versioned setuid helper, or the
  `CHROME_DEVEL_SANDBOX=""` ≡ `--disable-setuid-sandbox` equivalence (page lines 61-62).
- **`docs/design/sandbox.md`** — opened 2026-10-26T18:22:26Z, HTTP 200, 37,776 B raw, sha256
  `6d4a3b0c0ad4c9aa0bd9aab9c9f79439093f46076efe91f200ce26ef18789b61`; decoded 28,331 B, sha256
  `7b4efcf54eead4d0a30a941740472dde0124609b13e30130ffc4ef7ff4151c75`. Reason: its only
  `--no-sandbox` sentence sits at lines 88-89 under `## Sandbox Windows architecture` ("In Chromium,
  the renderers are always target processes, unless the `--no-sandbox` command line has been
  specified for the browser process"); citing a Windows-section sentence for a Linux launch-flag
  claim would import the wrong scope. Flip: a Linux-section statement of the same switch, or reuse
  this page as OS-independent design background only.
- **`docs/linux/sandboxing.md`** (the item's own named path) — HTTP 404, 233 B, sha256
  `b52a956c404944f98d4ac5a0f9b3f170e82d7003430cc6fcbae1f5633ad55198`; gitiles body
  "NOT_FOUND: Requested entity was not found". Reason: absent at this tag, so nothing can be
  located in it. Flip: the file exists again at a later tag, or an older tag is the measured one.

Also opened and found silent on both questions (not cited): `docs/linux/sandbox_ipc.md`
(2,896 B raw), `docs/linux/zygote.md` (5,060 B raw), `docs/design/sandbox_faq.md` (8,304 B raw),
`sandbox/README.md` (1,600 B raw), `docs/linux/pid_namespace_support.md` (1,468 B raw). And
`chrome/common/chrome_switches.cc` (the older switches path) answered 404, 233 B, sha256
`d2e40ab56ba056ff4ad946cbaeaec33b7c19f472bb26ecfbf651198117852e3a`; the flag lives in
`sandbox/policy/switches.cc` at this tag.

## Limits

- One tag only: `refs/tags/154.0.8037.97`. Nothing here says which layers survive on a given
  kernel; the README's own caveat is that setuid strength "varies between kernel versions"
  (lines 54-56).
- The `--no-sandbox` reading is the switch's own comment text. This seat did not read
  `sandbox/policy/linux/sandbox_linux.cc` to trace each layer's early return, so the row asserts
  the switch's documented scope, not a per-layer code path.
- No browser was started by this seat; the live-leg facts in the accompanying report are
  ExecLiveLeg's measurement, reported as such.
