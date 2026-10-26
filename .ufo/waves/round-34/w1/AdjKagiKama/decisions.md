# AdjKagiKama — per-candidate dispositions (round 34, C1 build)

Seven candidates (baseline `c1-candidates.tsv` rows 48-51, 58, 60, 61). Every one
is a **screen** row; no map row is drafted (see `decl.md` for why no disposition
was available to a new row).

Group verdict asked by the seat: **kagi's 1Password CDP bridge "start/inspect via
the browser lane" is not a distinct boundary** — it is the driver half of the
`musketeer-cdp-9222-profile-lease` boundary already mapped (row 6, contested-open,
fleet `.ufo/l0-questions.md:62`), and tabi's side of it is already recorded there
(fresh throwaway profile per run, `SKILL.md:556-557`; L0:62 "tabi holds no lease
half … never attaches to 9222 or the musketeer profile"). **kama's
consumer-registry CDP pins are not distinct either** — both land on
`cdp-live-target-census` (row 11, contested-open, L0:65). The one line that does
not land on any mapped surface (`consumer-registry.md:9`) is a registry-scope
sentence that claims nothing on browser ground.

| candidate key | decision | reason (grounded in both sides) |
|---|---|---|
| `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:450` | screen `same-surface` / `musketeer-cdp-9222-profile-lease` | kagi records that "CDP port 9222 + musketeer profile are shared with the kake fleet" and sends the conflict to the integrator; kagi `PROVINCE.md:43` is the same declaration ("CDP `9222` + `…/the-musketeer/chrome-profile` — **contested with kake**") that map row 6 dispositions against tabi `SKILL.md:556` (fresh throwaway profile per run), so the line restates a mapped boundary. |
| `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:488` | screen `same-surface` / `musketeer-cdp-9222-profile-lease` | the anti-pattern forbids "Absorbing cross-domain surfaces (CDP lease, musketeer profile)" — exactly the two objects row 6 already covers, and a refusal to absorb adds no claim and no breadth. |
| `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/cdp-bridge-1password.md:70` | screen `same-surface` / `musketeer-cdp-9222-profile-lease` | "start/inspect via the browser lane" is the move for the burner Chrome started with `--remote-debugging-port=9222`, i.e. the `the-musketeer` profile kagi `PROVINCE.md:43` records as contested; tabi's side is already on record (L0:62 "never attaches to 9222 or the musketeer profile"; `SKILL.md:556-557`), and this bridge only writes the native-messaging manifest and probes reachability (`cdp-bridge-1password.md:30-55`), so the line asks the leased question, not a new one. |
| `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:corpus/knowledge/cdp-bridge-1password.md:77` | screen `same-surface` / `musketeer-cdp-9222-profile-lease` | the note itself: port `9222` and the `the-musketeer` profile "are **shared** with the webzites kimi fleet", line 81-82 (wrap collapsed) "Ownership of the shared-browser lease for vault work is unresolved in / this province; filed to the integrator rather than claimed here" — verbatim the row-6 lease, reported and not absorbed. |
| `kama-shokunin@0163fea2dab3f282ebd70c71da9ab5de4cedf733:corpus/knowledge/listener-census.md:56` | screen `same-surface` / `cdp-live-target-census` | census table row 8 for `127.0.0.1:9222` (`chrome` pid **3080080**, `--remote-debugging-port=9222`, `FOREIGN_SERVICE` under the 2xx text/html rule); the same census's prose at `:355` is map row 11 — same endpoint, same pid, same model-purpose verdict, no second claim. |
| `kama-shokunin@0163fea2dab3f282ebd70c71da9ab5de4cedf733:corpus/knowledge/consumer-registry.md:9` | screen `no-claim-declared` | registry scope sentence: non-model loopback pins (CDP, browser daemons, auth brokers, web previews) are filed in a separate section, share the "drifted loopback peer" failure class and "are *not* kama's serving surface" (`:11`); the section adds "deliberately not given a model verdict" (`:230-231`), so kama asserts no CDP session, target or browser-daemon disposition — nothing is claimed on tabi's surface. |
| `kama-shokunin@0163fea2dab3f282ebd70c71da9ab5de4cedf733:corpus/knowledge/consumer-registry.md:235` | screen `same-surface` / `cdp-live-target-census` | the registry row pins `~/.config/opencode/agents/musketeer.md:26` at `http://localhost:9222`, "Chrome CDP endpoint (grok/kimi browser automation)", probed `9222/v1/models` → 404 text/html and scored **NOT_HTTP / FOREIGN_SERVICE for model purposes** — the same 9222 endpoint map row 11 dispositions for kama; it records the pin and claims no target enumeration. |

## Why the ordered decision rule puts each line where it is

`SKILL.md:2861-2881` gives the order: (1) not this lane's craft → `not-browser-sense`;
(2) a verification-passing row already owns that surface for that sibling →
`same-surface`; (3) reports another lane's work → `third-lane-report`;
(4) declares no claim on this lane's surface → `no-claim-declared`; else a map row.

- Rows 1-5 and 7 answer **yes at step 1** (a CDP endpoint, a browser profile, a
  listener census of one) and then **yes at step 2**: two surfaces are already
  verified for these siblings — `musketeer-cdp-9222-profile-lease` (kagi, map row 6)
  and `cdp-live-target-census` (kama, map row 11). Step 2 precedes step 4, so a line
  that both restates a mapped surface and disclaims a claim is `same-surface`.
- Row 6 (`consumer-registry.md:9`) passes step 1 only in the weak sense: its browser
  nouns are a list of *pin classes* in a scope sentence about kama's own registry, not
  a browser/driver/protocol/capture claim; step 2 does not apply (no kama row owns
  "non-model loopback pins"); step 3 does not apply; **step 4 applies** — the line and
  its section explicitly give these pins no verdict, i.e. kama declares no claim on
  tabi's surface. This row was first drafted as `not-browser-sense` and corrected to
  `no-claim-declared` after re-reading the ordered rule (the line does name CDP and
  browser daemons, so rule 1's "another sense of the word" exclusion does not fit).

## What a wave-2 attacker should test first

1. Row 3 (`cdp-bridge-1password.md:70`) is the seat's sharpest judgement call: is
   "start/inspect via the browser lane" the same boundary as the profile lease, or a
   distinct "browser start/inspection vs credential bridge" boundary? My ground for
   `same-surface` is that the object started is the burner Chrome on 9222 whose profile
   is `the-musketeer` (kagi `PROVINCE.md:43`), and that tabi's recorded side of that
   row already answers the driver question (L0:62). A distinct row was impossible to
   disposition truthfully: the line has no `tabi` token (no `split-declared`), no fleet
   line outside `.ufo/` names kagi and tabi (no `ruled`), nothing is unruled (both
   lease rows are already contested-open), and the deferral runs toward tabi, not away
   (no `refused-route`).
2. Row 6's reason label: `no-claim-declared` vs `not-browser-sense`. The substantive
   claim is the same — kama takes no browser verdict on those pins — and
   `consumer-registry.md:236` (the 10086 kimi-webbridge pin recorded "**DEAD** at probe
   time") is the strongest counter-material, since it is a liveness fact about tabi's
   substrate daemon. It is a measurement, not a disposition, and tabi records the same
   state (`corpus/knowledge/webbridge-plugin-anatomy.md`).
3. Rows 5 and 7 sit on one kama surface: if the integrator decides the listener table
   row and the consumer-config pin are different boundaries, both become separate rows
   and row 11's surface name stops covering them.
