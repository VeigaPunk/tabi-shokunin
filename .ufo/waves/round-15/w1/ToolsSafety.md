# ToolsSafety — round-15 w1 (sentinel, author-side)

Read at 2026-10-20 ~05:04 -03:00. This is an author-side seat, not non-author certification.
Writes: this file only. No gate, counter, self-test, suite, browser, build or lint ran. Tools installed or updated: **none**.
Commands run, all read-only: `pacman -Q pacman mkinitcpio pacman-contrib`, `pacman -Qu`, reading `/var/log/pacman.log` and `/etc/pacman.conf` + `/etc/pacman.d/openai-chatgpt.conf`, `stat` on `/var/lib/pacman/sync/*.db`, `git config --global --get-regexp` limited to signing/hook keys.
Not touched: `~/.omp/agent/agent.db*`, credential/auth files, omp CLI, sibling/fleet state. The only file read under `~/.omp/agent` was `RULES.md`.

Axes: (A1) tool-authorization fidelity, (A2) pacman-guard soundness, (A3) secret / agent-DB boundary in lane code, (A4) child-process env/cleanup in the C1/C2 scripts.

## Verdict
No blocker for C1/C2. Neither claim needs a tool install. The lane scripts contain no `agent.db`, `~/.omp` or credential-file access (grep over `scripts/` found 0 hits for `agent\.db|\.omp|auth\.json`). The host package state, however, makes the wave's pacman guard (spec.json:3 `.context`) necessary but not sufficient. Findings follow, highest first.

## F1 HIGH (host, A2) — sync DB far ahead of the installed system: any `pacman -S` now is a partial upgrade
- Evidence [obs]: `/var/log/pacman.log` has `[2026-10-18T14:11:00-0300] Running 'pacman -Sy --noconfirm'` with no `-u`. The last `starting full system upgrade` was at `2026-10-16T23:53:17`. `pacman -Qu` lists hundreds of outdated packages. Boot-chain and ABI-critical ones: `mkinitcpio 41.1-1 -> 42.2-1` (the exact RULES.md:10-12 hazard), `plymouth`, `linux 7.2.3 -> 7.2.11`, `glibc`, `systemd 261.2 -> 262`, `limine*`, `qt6-base 6.11 -> 6.12`, `llvm-libs 22 -> 23`, `nvidia-open-dkms`.
- Evidence [obs]: `[2026-10-20T04:25:16-0300] Running 'pacman -S --needed --noconfirm libinput libinput-tools'` printed `upgraded libinput (1.31.3-1 -> 1.32.0-1)` and then ran `35-systemd-udev-reload.hook`. That is an actual partial upgrade made through the RULES.md:7 channel. `--needed` does not stop an installed-but-outdated package from being upgraded. Actor [unk]: the lane has 0 hits for `libinput`, and the run predates this wave's directory, so I attribute it to no lane.
- Exploit path: a seat follows RULES.md:7 literally (`sudo pacman -S --needed --noconfirm X`). Pacman pulls X and any versioned deps built against the newer sync DB. This yields a mixed-ABI system, or upgrades of installed libraries outside the update-safety gate.
- Impact: the host runs on a partial upgrade without the tsukuroi gate, and the boot chain is next in line.
- What the guard catches [obs/INFERENCE]: `pacman -Sp --print-format '%n %v' X` lists every target pacman would install or upgrade. So installed deps that need an upgrade (e.g. `mkinitcpio` pulled by a dkms or plymouth-theme package) show up, `pacman -Q` on them succeeds, and the guard refuses. That closes the libinput case above.
- Remediation: L1 should keep the guard verbatim and add one line to the wave context: "if `pacman -Qu` is non-empty, prefer `uv`/release-binary channels; pacman installs must also pass F2/F3".

## F2 MEDIUM (A2) — the guard misses unversioned-dependency ABI skew
- Exploit path [INFERENCE, not exercised]: new package X has an unversioned dependency (or none) on library Y, installed old. X was built against the newer Y now in the sync DB. `pacman -Sp` lists only X (Y counts as satisfied), the guard passes, and X installs against an older Y. This is the classic Arch partial-upgrade breakage. Soname provides (`libfoo.so=N-64`) catch only the soname bumps that packagers declare.
- Smallest remediation: add a guard step. Take the `Depends On` names from `pacman -Si <pkg>`; `pacman -Qu <those names>` must print nothing, otherwise refuse. Proposed falsifier for L1 (documentation only, do not run an install): pick a not-installed sync package whose `Depends On` includes an entry from the current `pacman -Qu` list. The current guard admits it; the amended guard refuses it.

## F3 MEDIUM (A1/A2) — the guard cannot see the repository, but "official sources only" depends on it
- Evidence [obs]: in `/etc/pacman.conf:28-32`, `[omarchy]` has `SigLevel = Optional TrustAll` (unsigned packages accepted) and `Server = https://pkgs.omarchy.org/...`, plus `Include = /etc/pacman.d/openai-chatgpt.conf` (signed, third-party). The guard prints `'%n %v'` only.
- Exploit path: `pacman -S X`, where X (or one of its dependencies) exists only in `[omarchy]`, installs an unsigned non-Arch package. The guard passes and the report says "pacman, official channel".
- Remediation: use `--print-format '%r %n %v'` and refuse any target whose `%r` is outside `core|extra|multilib`. Record `%r` in the install line next to the existing "tool, version, channel, reason" (RULES.md:14).

## F4 LOW (A2) — ALPM hooks are host side effects the guard does not predict
- Evidence [obs]: every logged install runs `10-limine-snapper-lock.hook` and `35-systemd-update.hook`. libinput also ran `35-systemd-udev-reload.hook`. The wave forbids "host service restart" (spec.json:3), yet a udev/systemd reload can be triggered by a pure new-package install.
- Remediation: the report line should list the hooks pacman ran, taken from pacman output. Treat a `*-reload`/`*-restart` hook as a reportable host action, not a silent one.

## F5 LOW (A4, code → CounterDiagnostics) — USER gate child processes inherit the full parent env
- Evidence [obs, current file `scripts/check-user-round-contract.mjs`; line numbers shift while CounterDiagnostics edits]: these calls pass no `env:`, so `process.env` is inherited:
  - `git()` at `spawnSync('git', args, { cwd: root ... })` (~:114)
  - `runCount` at ~:420
  - `commit()` at ~:626
  - self-test CLI children at ~:778-779, ~:838/842, ~:1002 and ~:1039
  - the external `VALIDATOR` (`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`, :57) at ~:458, run with `cwd` set to an external repo.
- Contrast [obs]: `scripts/check-aria-metadata.mjs:1799` already uses a minimal child env `{ PATH, HOME, TZ:'UTC' }`. That is the existing lane pattern.
- Exploit path: a seat or L1 runs the self-test from a shell that exports `GIT_DIR`/`GIT_WORK_TREE`/`GIT_CONFIG_*`/`GIT_INDEX_FILE`. The `/var/tmp` fixture commits and the CLI expected-reason children then read a repo other than the fixture. The new C1 "expected reason" assertions could pass or fail for reasons unrelated to the grammar. Git-env hostility is CountShellBoundary's slice; here I note only the env-inheritance surface.
- Secret angle [obs]: global git has no `commit.gpgsign`/`core.hooksPath`/`gpg.format` (`git config --global --get-regexp` exited 1). Fixture commits do not touch a signing key today. [INFERENCE] they would once signing is enabled globally, because the children inherit `SSH_AUTH_SOCK`/`GPG_AGENT_INFO`.
- Smallest remediation: in the new CLI negative/expected-reason controls, pass `env: { PATH, HOME, TZ:'UTC', GIT_CONFIG_NOSYSTEM:'1', GIT_CONFIG_GLOBAL:'/dev/null' }`, matching check-aria-metadata.mjs:1799. Add `-c commit.gpgsign=false` to the fixture `commit()` args.
- Proposed test: self-test case `hostile_git_env`. Run the CLI child with `GIT_DIR=<other fixture>/.git`. The expected literal exit/finding must equal the clean-env run, i.e. the env is ignored.
- Provenance note: `VALIDATOR` is unpinned, with no digest of `ufo-swarm-wave.mjs`. A `short_swarm` verdict therefore depends on mutable external bytes. Reporting only; this does not affect C1.

## F6 INFO (A3/A4) — carried, not exercised this round
- `scripts/aria-loopback-round13.mjs:736-744` still passes `...process.env` to the Playwright runner and browser. Round-13 `SafetyBrowser.txt:72-76` (SB-5) flagged this. It remains unremediated, but C2 is "no new browser run", so it is not exercised. It must not be cited as "no credential access proven" in round-15 text.
- `scripts/user-seat.mjs:34` and `scripts/pstack-seat.mjs:34` run `bash -c slice.command`, where the command comes from the worktree file `corpus/evidence/<round>/slices.json`, not from HEAD. These are historical r01-r10 seats, not invoked in round 15. Any reuse should first read slices from a committed revision.
- `scripts/check-sources.mjs:344-351` covers 5 credential shapes (`op://`, PEM private key, `ghp_`, `AKIA`, `xox*`) and scans only SOURCES.md text. New round-15 fixture assets under `corpus/evidence/round-15/metadata/` are not scanned by any gate [obs: there is no other credential scan in `scripts/`]. They should stay synthetic.

## A1 conformance (wave context)
[obs] `.ufo/waves/round-15/w1/spec.json:3` (`.context`) carries:
- the tooling authorization with a pointer to RULES.md,
- the pacman guard,
- the ban on `-Sy/-Syu/-U/-R`, downgrade and service restart,
- the ban on `agent.db*`/credential/auth files and on the omp CLI.

The same context is embedded in `validation.json:421`. RULES.md:14 recording duty: this seat installed none. At read time every member in `dispatch-result.json` was `pending` with `toolCount: 0`, so no member's install record was readable [unk].

## Commands for L1 (read-only; do not install)
- `pacman -Qu | wc -l` and `grep -n "Running 'pacman -S" /var/log/pacman.log` to re-check the F1 host state before allowing any pacman install this round.
- `pacman -Sp --print-format '%r %n %v' <pkg>` (the F3 form) before any approved install.
- After CounterDiagnostics lands: `grep -n "spawnSync(" scripts/check-user-round-contract.mjs` and confirm the new expected-reason children pass an explicit `env`. Then run the lane's normal `--self-test`.
