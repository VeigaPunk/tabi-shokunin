# CritC1SsParse — C1 `ss -Htnp` parser falsification

Axes: coverage; calibration.

## Counterexample and result

No observed counterexample classified a non-loopback peer as loopback, nor did the tested `pid=` boundary omit the tested owned PID. On the live host, `ss -Htnp` produced normal `users:( ("name",pid=N,fd=F))` rows (actual formatting has no whitespace inside that tuple), including both IPv4 and bracketed IPv6 endpoints. The parser takes field 5 as peer (`f[4]`) after splitting the fixed five-column `ss -Htnp` output and treats unrecognized peer forms as non-loopback. Thus arbitrary spacing between columns and IPv6 brackets do not appear to create a false-loopback path in this observed output.

The crafted boundary probe used `tree=[123,1234]`: `pid=123,fd=4`, `pid=123)`, and `pid=1234,fd=4` matched; `pid=12345,fd=4` did not. This checks delimiter protection against PID-prefix collisions and accepts multiple candidate PIDs through alternation. Multiple process tuples are not excluded by the line-wide match.

Residuals, not demonstrated false negatives: a hostname/unknown peer or an unrecognized valid IPv6 loopback spelling is conservatively counted non-loopback (false positive, not silent egress acceptance). The implementation tests exact textual spellings rather than parsing IP addresses. Also `if (!txt) return null` conflates empty successful output with unavailable `ss`; it does not establish zero socket evidence. For this claim an empty socket set can be legitimate, so this is an availability/evidence distinction rather than proof of egress omission.

## Evidence / commands

Frozen inputs read:
- `.ufo/waves/round-39/claims.json` (C1 predicate and frozen digests)
- `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`
- `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs`
- `scripts/playwright-firefox-egress-round39.mjs`, lines 75–138

Commands run:
```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show --stat --oneline 9c09ebb1e2ff594c70ce72093b5d4133c1734dca
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show --stat --oneline 5bc56a81d196caeb8d24551928b883802697aabb
ss -Htnp | cat
node -e 'const tree=[123,1234]; const re=new RegExp(`pid=(?:${tree.join("|")})[,\\)]`); for(const s of ["users:((\"firefox\",pid=123,fd=4))","users:((\"firefox\",pid=123))","users:((\"firefox\",pid=1234,fd=4))","users:((\"firefox\",pid=12345,fd=4))"]) console.log(re, s, re.test(s))'
```

The live `ss` output included standard IPv4 peer `127.0.0.1:38581`, public IPv4 peers such as `140.82.112.26:443`, and bracketed IPv6 peers such as `[2606:4700:78::90:0:142]:443`; process fields appeared in the expected `pid=N,fd=N` form. Probe outputs were respectively `true`, `true`, `true`, `false` for the four PID strings above. No tools installed.

Smallest safe correction: no required change shown by this attack. To close the identified evidence ambiguity, distinguish command failure from successful empty output; to avoid textual IP corner cases, parse the peer address and test address-family loopback semantics, retaining fail-closed handling for unknowns.

VERDICT ok — attempted parser falsification found no demonstrated false-loopback classification or owned-PID omission; conservative unknown-address handling remains.
