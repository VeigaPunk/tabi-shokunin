# §Mistakes candidate handed to ScribeLesson (from seat ScribeSrcLauncher, round 33)

_ScribeLesson was not spawnable when this seat ran (`swarm-registry.json` → `agentId: null`;
`write agent://ScribeLesson` → "Unknown agent"), so the candidate is filed here for the lesson seat
to read with the other w1 outputs._

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| X1 | `method` | `.ufo/waves/round-33/w1/ExecLiveLeg/launcher-probe.txt` (sha256 `38214ace8dbf0055c91f949600e07ade3b3f5a0fa4518fe419d10b281c34e21d`, kept byte-identical as history) listed **one** injected flag; the corrected `.ufo/waves/round-33/w1/ExecLiveLeg/launcher-probe-full.txt` (sha256 `0a439bb90edc731c6c9c36b2d57892624e0ef7ebf6656f8d9c203c1345fc577c`) shows all **five** flags-file arguments ahead of the caller's args | ExecLiveLeg, after my count-only check of `~/.config/chromium-flags.conf` (`grep -cF -- --load-extension` → 1 against 5 newlines) disagreed with its list of one | Chromium rewrites its process title into a single space-joined string, so reading `/proc/<pid>/cmdline` and splitting on NUL yields `argc=1` and silently truncates the argument block: read the raw bytes and replace NULs with spaces. Any lane note, receipt or counter reporting a Chromium process's arguments must do this; an `argc` read from that file is not an argument count on Chromium |

Why it belongs in this round's lesson rather than only in a seat report: the lane has at least four
places that reason about what argv a browser actually received
(`corpus/knowledge/cdp-evidence-patterns.md:18,85`; `corpus/knowledge/webmcp-invocation-round-17.md:40`;
`corpus/knowledge/harness-hardening-round-18.md:62`; `SKILL.md:452`), and a predicate that counts
arguments would be silently satisfiable on a truncated read.

Related Gate context, not a mistake: row **S128** sources the launcher behind the same probe —
`/usr/bin/chromium` is `chromium-launcher` v8 (ELF, 14,424 B, sha256 `eaed39c3…a172b`),
`launcher.c` at commit `a7ed2cb89fe28c91199524c828866201c9d6b5e5`, Arch PKGBUILD at commit
`871c2ad960ad54af03579cb90a1c9656485ea598`; row + Gate line draft in
`.ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md`, cited by
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` (ScribeGateV2Note).
