# RevSourcesRow — S145 source-row review

Axes: coverage, calibration. Registry was not edited.

## Findings

**Finding (blocking row grounding): S145 has not been appended.** The registry currently ends at S144; the only round-39 candidate evidence is `.ufo/waves/round-39/assimilation/S145-open.txt`. Its identity is internally inconsistent: it labels the source `proc_pid_net(5)` but gives `https://man7.org/linux/man-pages/man5/proc.5.html` (the `proc(5)` URL), while its anchor/quote claim `/proc/net/tcp` and `rem_address`. Resolve the source identity before drafting the row: fetch the cited URL and prove it contains the quote, or correct the URL/title to the actual `proc_pid_net(5)` page and preserve evidence from that page. Do not mark the row mined or imply the quote was grounded until source bytes and location agree. Scout evidence file was not yet present at review time.

Exact quote offered in the open note (11 words): “rem_address” is the remote address and port number pair (if connected). The candidate scope is appropriately narrow (Linux `/proc/net` TCP remote endpoint representation; explicitly excludes UDP and all-browser-network-traffic claims). The quote is within the ≤25-word limit, but this review could not independently verify it against fetched source bytes.

**Required row defects to prevent:** (1) exactly 11 pipe-delimited cells and no literal `|` in any cell; (2) use `kind=docs` for a man page and `tier=A` only if the primary man-page source supports the scoped claim; (3) `status=mined` only after opening and quote/location verification; (4) `opened=2026-10-27` (the candidate note's access date); (5) legal recheck token (e.g. `on-release` or `<n>d`, no prose suffix); (6) `used-by` must point to the actual round-39 knowledge entry and that file must exist/admit the stated scope. Do not carry forward an unverified URL/quote or claim this TCP table represents UDP/QUIC or all browser egress.

## Evidence / exact observations

- Read `claims.json`: C1 names “S145 (proc(5) man page, /proc socket observation) opened this round and cited by the knowledge entry.”
- Read `corpus/SOURCES.md` header: columns are `id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by` (11 cells).
- Registry search `^\| S14[45] ` returned S143 and S144 rows; no S145. SOURCES.md has S144 as the final registry row before `## Paths`.
- Read `.ufo/waves/round-39/assimilation/S145-open.txt`: source label `proc_pid_net(5)`, URL `/man5/proc.5.html`, access date 2026-10-27, anchor `DESCRIPTION, /proc/net/tcp`, quoted `rem_address` sentence.
- Round-39 S145 search finds the claims reference, the open note, and planner instructions; no candidate row in the production registry and no `ScoutSourceS145` report file was present when checked.
- Read frozen claims and C1 counter. C1 counter evaluates receipt fields and round-38 control; it does not validate SOURCES.md or source quote grounding, so that counter cannot close this row-review risk.
- `lsp` device/status was not available in the tool inventory; no semantic caller/reference claim is made.

## Verification gaps

No independent HTTP fetch/raw source bytes or source quote location were available in this seat's evidence at review time; no registry validation command was run. The other frozen counter is outside this row's question. Exact `SOURCES.md` contract v1 file was not located in this repo path (`.ufo/waves/kaika` is absent); the registry itself explicitly identifies the 11-column schema and points to contract v1. No tool installs.

VERDICT finding — S145 is not registered, and its candidate source title and URL disagree; resolve and independently ground the source before writing a mined row.