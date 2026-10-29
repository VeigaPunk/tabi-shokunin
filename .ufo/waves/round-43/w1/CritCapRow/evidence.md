# Read-only evidence — CritCapRow

All repository sources below were read without modification. Paths are relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## Frozen C1 admission

` .ufo/waves/round-43/claims.json:68-70` (frozen at the specified claims commit):

> On pass only: one capabilities-table row `playwright-firefox-loopback-tcp - observe a loopback browser session's TCP sockets from both ss and /proc/net/tcp under a signature-authenticated chain (per-invocation Ed25519 run key, witness-attested, challenge-bound receipt)` whose evidence pointer names the committed round-43 receipt and measure record, first-working round 43.
>
> `verdict`: `pending`; `measuredRevision`: `null`.

The line explicitly names the operation and separately qualifies its measurement chain. The frozen counting command names the receipt path `corpus/evidence/round43/playwright-egress/receipt.json` and measure path `.ufo/waves/round-43/measure/c1-measure-r43.json` (`claims.json:62`). The driver named by the frozen surface is `scripts/playwright-firefox-egress-round43.mjs` (`claims.json:60`).

## QUALITY 84 and precedent

`corpus/QUALITY.md:508-511`:

> A capability-table row names an operation the shokunin can now run, with its demonstration in the round report; a gate or counter never enters the table ...

`SCORECARD.md:1663-1665` records the round-32 practice: the row describes the operation and its evidence pointer, then states that it names the transport operation rather than the gate. `SCORECARD.md:1978-1982` and `.ufo/waves/round-35/w2/CritCapabilityRow.md:50-54,69` apply the same rule: pointer shape includes producer/evidence plus the measured round-report demonstration, with no gate/counter in the capability row.

The accepted round-35 capability is `webdriver-bidi-runtime-firefox` and describes driving a WebDriver BiDi session through Firefox/geckodriver (`SCORECARD.md:1978`). That is distinct from observing Playwright Firefox TCP sockets.

## Admission timing and false-provenance counterexample

`SCORECARD.md:2309`'s round-43 C1 target requires the frozen predicate at a fresh nonce, committed receipt/witness/signed measure at the measured revision, battery and replay conditions, and “the policy-v2 wave settled (≥64 seats, WAVE-DONE) with no in-model do-nothing reach.” `SCORECARD.md:2317-2319` records the first live attempt as pre-freeze and refused by the counter (46 `*-egress` findings). Therefore that attempt is not a working demonstration and cannot support early row insertion.

`SCORECARD.md:2297-2310` is the round-43 declared-claims section; it is not a capabilities-table entry. The exact-name search below found no matching capability row.

## Exact read/search observations

- `functions.grep(pattern="playwright-firefox-loopback-tcp", path="/home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md")` → `No matches found`.
- `functions.grep(pattern="playwright-firefox|Firefox loopback|loopback TCP observation", path="/home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md")` → matches at lines 2166, 2177, 2208-2209, 2235-2236, and 2309-2310. These are round-39–43 claims/round summaries, not a capabilities row; the round-35 Firefox capability is the separately named BiDi operation at line 1978.
- `functions.read(path="/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/claims.json:53-71")` → frozen admission at line 68, `pending`/`null` at lines 69-70.
- `functions.read(path="/home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md:raw:2309-2319")` → full C1 target includes ≥64 seats and `WAVE-DONE`; before-state says pre-freeze live attempt refused; lines 2317-2319 identify 46 findings.
- Seat setup/cleanup command: `S=/fast/scratch/hyaku/tabi-r43/CritCapRow; trap 'rm -rf -- "$S"' EXIT; mkdir -p /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/CritCapRow; rm -rf -- "$S"; test ! -e "$S" && printf 'seat report directory ready; scratch removed\\n'` → `seat report directory ready; scratch removed`.

No browser/counter/test was run; the absent row check and wording review are static only.
