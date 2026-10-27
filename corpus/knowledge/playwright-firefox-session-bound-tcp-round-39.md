source: S145 — proc_pid_net(5), Linux man-pages, https://man7.org/linux/man-pages/man5/proc_pid_net.5.html (§DESCRIPTION, `/proc/net/tcp`)
verified-at: 2026-10-27; round 39; Playwright 1.64.0 / Firefox 157.0; loopback-only fixture
recheck: run `HYAKU_SCRATCH=${HYAKU_SCRATCH:-/fast/scratch/hyaku/tabi-r39} node scripts/playwright-firefox-egress-round39.mjs --out <receipt.json> --runs 2`; compare the owned process tree, sample count/duration, ss and /proc TCP summaries, final sweep, first-shot hashes, version binding and cleanup fields

# Playwright Firefox TCP socket observation — round 39

## Scope and source-grounded rule

The Linux man-pages `proc_pid_net(5)` description states: “the `rem_address` is the remote address and port number pair (if connected)” (DESCRIPTION, `/proc/net/tcp`). This grounds reading the TCP peer address/port from a procfs row; it does not establish that every browser network channel is covered.

The round-39 driver launches Playwright Firefox against its own loopback fixture, records a Firefox root found among the current Node process's children and its then-present descendants, and correlates socket inodes from those PIDs' `/proc/<pid>/fd` links with `/proc/net/tcp` and `/proc/net/tcp6`; it separately samples `ss -Htnp`. The two-run receipt is `corpus/evidence/round-39/playwright-egress/receipt.json`; the measured driver is `scripts/playwright-firefox-egress-round39.mjs`.

## Observations

- On this host, the receipt records Playwright 1.64.0, Firefox 157.0, the live page's Firefox user agent, and the Playwright Firefox binary path. Two cold runs have the same first-shot SHA256; each records a nonempty owned tree, 8–9 socket samples over more than 1 s, 0 non-loopback observations on both recorded TCP surfaces, 0 survivors and a closed fixture port (`corpus/evidence/round-39/playwright-egress/receipt.json`). This is an as-observed, host/build/fixture result, not a claim of comprehensive egress absence.
- The first `/proc` loopback parser used a `7F` prefix test on the displayed hex and counted 12 false non-loopback observations across two loopback runs while `ss` counted 0. The raw matched peer was `0100007F:8AEF` (`corpus/evidence/round-39/measure/proc-endian-raw-row.txt`); decoding the little-endian 32-bit word before testing 127/8 brought the post-fix `/proc` count to 0 on both runs (`proc-endian-before.json`, `proc-endian-after.json`).

## Limits

- This method observes TCP tables only; UDP, QUIC, Unix-domain sockets, packet-level traffic, and other network namespaces are not covered. `/proc/net` is viewed from the driver process's namespace, and the owned PID tree is captured once shortly after launch; later descendants are not re-enumerated by this driver. Do not generalize the receipt to “no egress.”
- The driver's session profile path is not bound by the receipt: the locally-created `profile` directory is not passed to `firefox.launch`. The result is a fixture observation, not a reusable system-wide assurance or an external-site authorization.
- The frozen C1 counter checks receipt summaries and the round-38 v1 refusal; its output is not an independent non-author spot-check. See the round-39 claim report for the adversarial verdict and scope limits.
