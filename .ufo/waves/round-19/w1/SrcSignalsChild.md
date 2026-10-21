# Node v24.21.0 signal and child-process source findings

**Verdict — source supports the G-H1 signal-handler and cleanup hazard, but does not itself prescribe the harness outcome.** Node's POSIX SIGINT/SIGHUP listeners suppress the corresponding default termination; Node's `ChildProcess.kill()` signals the child, not its shell descendants. POSIX `detached` creates a new session and process group, but that alone is not evidence of descendant cleanup. Confidence: high for these documented Node v24.21.0 statements; unresolved for the harness's actual Chromium process topology and explicit POSIX process-group-kill syntax.

## Retrieval and provenance

- Access date: **2026-10-21**. The pinned Git tag resolves to commit `955266bfdd854cd280dffd47548673914484e4c0` (peeled tag result); annotated tag object: `f37d7da830134b5314a14ced553273786a2bb4cd`.
- `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md` — decoded response body: **134,327 bytes**, SHA-256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7`; retained as `.ufo/waves/round-19/w1/TabiR19-2.SrcSignalsChild-4.body.gz`.
- `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md` — decoded response body: **86,669 bytes**, SHA-256 `32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a`; retained as `.ufo/waves/round-19/w1/TabiR19-2.SrcSignalsChild-4-child_process.body.gz`.

Hashes and sizes above are for the fetched, decoded Markdown bytes, not the gzip artifacts.

## Line-numbered map

**`process.md`, §Signal events**

- **700-716:** Defines delivery: Node emits the signal event on receipt, not on a terminal keypress; the handler receives the signal name as its first argument and event names are uppercase. Signals are unavailable on Worker threads.
- **756-759:** Non-Windows default SIGTERM/SIGINT handlers restore terminal mode and exit with `128 + signal number`; installing a listener removes the default behavior, so Node no longer exits by that default.
- **761-766:** SIGHUP platform branches: Windows can generate it when the console closes, and Node unconditionally terminates about 10 seconds later even if a listener exists; on non-Windows platforms it ordinarily terminates Node, but a listener removes that default behavior.
- **767-771:** SIGTERM is unsupported on Windows (though listenable). Terminal SIGINT is supported on all platforms and usually comes from Ctrl+C, subject to configuration; Ctrl+C does not generate SIGINT in terminal raw mode.
- **778-786:** SIGKILL cannot be handled and terminates on all platforms; SIGSTOP cannot be handled; signal `0` probes process existence.
- **788-796:** Windows has no POSIX signals; Node emulates some behavior. SIGINT/SIGTERM/SIGKILL sent through the documented APIs unconditionally terminate the target there; signal `0` is a cross-platform existence check.

**`process.md`, §`process.kill(pid[, signal])`**

- **2677-2691:** Takes a PID and signal (default SIGTERM) and sends that signal to the identified process; names include SIGINT/SIGHUP, with kill(2) referenced.
- **2693-2700:** A nonexistent PID errors; signal `0` checks existence; Windows errors if the PID is used to kill a process group. The method is a signal sender and the signal need not kill its target. The documentation does not spell out POSIX negative-PID/process-group syntax here.

**`child_process.md`, §`options.detached`**

- **901-910:** Windows `detached: true` permits the child to continue after parent exit and gives it its own console.
- **912-915:** On non-Windows, `detached: true` makes the child leader of a new process group and session. Child processes can continue after the parent exits whether detached or not.
- **917-928:** Parent waits for detached child by default; `unref()` removes the child from the parent's event-loop reference count (unless IPC remains established). A detached long-running process does not stay in the background after parent exit unless stdio is disconnected from the parent; inherited stdio leaves it attached to the controlling terminal.

**`child_process.md`, §`subprocess.kill([signal])` and §`subprocess.killed`**

- **1666-1678:** `subprocess.kill()` sends a signal to the child process; default is SIGTERM. Its boolean reports whether `kill(2)` succeeded, not whether the child exited.
- **1706-1715:** Delivery can error; signaling an already-exited child is not an error and a reused PID could receive the signal. The delivered signal may not terminate the child.
- **1717-1724:** Windows-specific coercion: several known signal names force termination; SIGWINCH errors without killing, and unknown names error.
- **1726-1728:** On Linux, killing a child process does not terminate that process's children; Node calls out shell launches and `shell` option as likely cases.
- **1784-1795:** `subprocess.killed` means a signal was successfully sent/received; it does **not** mean the process has terminated.

## Verbatim source quotes

1. “If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit).” — `process.md`, §Signal events, lines 758-759. URL: `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md`; accessed 2026-10-21; decoded-body SHA-256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7`.
2. “On non-Windows platforms, the default behavior of `SIGHUP` is to terminate Node.js, but once a listener has been installed its default behavior will be removed.” — `process.md`, §Signal events, lines 764-766. URL: `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md`; accessed 2026-10-21; decoded-body SHA-256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7`.
3. “On non-Windows platforms, if `options.detached` is set to `true`, the child process will be made the leader of a new process group and session.” — `child_process.md`, §`options.detached`, lines 912-915. URL: `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md`; accessed 2026-10-21; decoded-body SHA-256 `32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a`.
4. “The `subprocess.kill()` method sends a signal to the child process.” — `child_process.md`, §`subprocess.kill([signal])`, lines 1675-1676. URL: `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md`; accessed 2026-10-21; decoded-body SHA-256 `32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a`.

## C2 applicability and gaps

- **G-H1 source implication:** A listener that receives SIGINT or POSIX SIGHUP cannot rely on Node's default termination. The planned exit code `2`, `run_aborted` classification, suppression of pass/fail receipts, and cleanup-before-exit are harness requirements, not Node requirements. The Windows SIGHUP forced termination caveat means this controlled-cleanup conclusion is explicitly scoped to the pinned non-Windows environment.
- **Terminal distinction:** The docs support Ctrl+C as a usual terminal SIGINT source, not as a universal trigger; terminal raw mode prevents that generation. A harness's externally delivered SIGINT tests signal handling but does not establish terminal-key behavior.
- **Child cleanup:** `subprocess.kill()` success is not proof of exit, and Linux shell descendants survive killing their parent. Detached group/session leadership is a separate property from cleanup. A non-empty run-owned PID observation before signal and empty observation after cleanup remains necessary for C2's stated predicate.
- **Unresolved:** These Node docs do not explicitly state the POSIX process-group signaling syntax (`process.kill` negative PID behavior); `process.md` only mentions the Windows group-kill error and refers to kill(2). They also do not establish which Chromium descendants Playwright owns in this harness. Do not claim Node documentation alone proves that a group signal was sent or that all browser processes were reaped.

## Proposed SOURCES row

One distinct source family/anchor is proposed: `child_process.md` detached process group/session plus the direct-child kill and Linux descendant caveat. No new row is proposed for the already-covered listener-removes-default claim in S063/S070. The signal-event terminal/raw-mode and SIGHUP platform detail are mapped above, but I am not proposing a second row in this one-row assignment.

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Node child process lifecycle — https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md | docs | A | Node v24.21.0 child lifecycle and signal delivery; POSIX group/session behavior, with Windows branches separated | tag v24.21.0, commit 955266bfdd854cd280dffd47548673914484e4c0; §`options.detached` 901-928 and §`subprocess.kill()` 1666-1728 | POSIX detached children lead a new process group/session, but `subprocess.kill()` signals the child, not its Linux descendants; successful signal delivery is not proof of termination | queued | 2026-10-21 | on-release | — |

## Isolation

- Clone / branch / base / commit: not applicable; this was a read-only source scout and produced no production changes.
- Lane writes: this report and the two explicitly permitted seat-owned compressed source bodies under `.ufo/waves/round-19/w1/` only. No lane Git/jj command was run.
