# CritScreenKagiKama — screens for kagi and kama (round 34 w2, C1 adjacency)

**Verdict: HOLDS on every disposition; one minor prose defect (D1) and one informational correction (D2).**
All seven screen rows for `kagi` (4) and `kama` (3) carry the right reason and, where `same-surface`, a surface that really carries that boundary; no line in this group is a real overlap screened away, and none should become a map row. The specific question — *is kagi's 1Password CDP bridge ("start/inspect via the browser lane", `cdp-bridge-1password.md:70`) a distinct boundary from the musketeer lease rows?* — is answered **no**: same document, same shared browser, same contested lease, and tabi's committed stance on it is the refusal already mapped. D1 is evidence-only: the three kagi notes point at "row 6" for the lease, but map line 6 is `crawler-discipline-vs-publishing` (kake); the lease is map lines 7–8 (kagi side **8**) at both the baseline and REV, so the pointer was never true. It changes no disposition and the frozen C1 predicate is untouched (notes are prose the counter does not read, SKILL.md:2843). D2: the round-33 lead's parenthetical "names tabi" for `cdp-bridge-1password.md:70` is an inference, not a naming — the token `\btabi\b` occurs **0** times in that file (and 0 times in kagi `SKILL.md`, kama `listener-census.md`, kama `consumer-registry.md`).

## 1. The question: is the 1Password CDP bridge a distinct boundary from the lease?

No. Five independent pieces of local evidence:

1. **Same document says they are one browser.** `cdp-bridge-1password.md:77-82` (the row-77 candidate line): "Port `9222` and the `the-musketeer` Chrome profile are **shared** with the webzites kimi fleet … A janitor CDP probe and a kimi publish-prep both want that one browser. Ownership of the shared-browser lease for vault work is unresolved in this province; filed to the integrator rather than claimed here." The doc treats the probe at `:70` and the lease at `:77` as one resource.
2. **The cause cell fixes the identity.** `:70` = "burner Chrome not running with `--remote-debugging-port=9222`" — the leased burner, not "a browser". There is no general browser-start claim to peel off.
3. **Kagi's own declared side already scopes the bridge to the manifest.** `kagi-shokunin@69b61db4…:PROVINCE.md:43` (the map row's sibling side): "CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` — **contested with kake** (lease/profile ownership unresolved; kagi pins only the 1Password native-messaging manifest — the profile dir itself is presence-only, mode unchecked)"; `PROVINCE.md:59`: "the CDP lease/profile ownership question is reported to the integrator, never adjudicated here."
4. **Tabi's committed answer is on that same boundary.** `tabi-shokunin/SKILL.md:1965`: "contested scope waits on fleet `.ufo/l0-questions.md:62` (the-musketeer CDP lease, kagi/kake)"; L0:62: "tabi holds no lease half: it launches only fresh throwaway loopback profiles (tabi-shokunin SKILL.md:556-557) and never attaches to 9222 or the musketeer profile." A delegation of "start/inspect" for the 9222 burner therefore lands on the mapped lease surface, where tabi's recorded answer is a refusal — it opens no new tabi surface.
5. **A second map row on that surface is mechanically refused, not merely redundant.** Probe in my own clone (commit `63b8b53d7975da67cb22fdfaa0114ad2501b2b34`, row appended verbatim in `probe-duplicate-row-adjacency.tsv`): `check-adjacency` exit 1, `finding row=19 reason=duplicate_row detail=surface=musketeer-cdp-9222-profile-lease sibling=kagi pin=kagi@corpus/knowledge/cdp-bridge-1password.md:70 first_row=8`. So for a restatement of an already-mapped (surface, sibling) pair the screen is the only truthful accounting — exactly the case SKILL.md:2868-2869 describes.

The phrase itself is undefined in kagi's corpus: `the browser lane` occurs once (that line; plus `.ufo/` sandbox copies), and kagi never writes the token `tabi`. Reading it as tabi or as the lease-holder/kake changes nothing, because both readings resolve to the same contested surface.

## 2. Per-row verdicts (grouped by reason)

Candidate keys and texts from `.ufo/waves/round-34/baseline/c1-candidates.tsv`; every line read with `git -C <lane> show <pin>:<path>` at ±10 lines.

### reason = same-surface (5 rows) — all RIGHT

| # | candidate | surface named | verdict | why |
|---|---|---|---|---|
| 1 | `kagi…@69b61db4…:SKILL.md:450` | `musketeer-cdp-9222-profile-lease` | right (note D1) | Verbatim subject: "CDP port 9222 + musketeer profile are shared with the kake fleet: report lease conflicts, don't absorb them." Same surface as map line 8 (kagi side of the lease), which verification passes (`adjacency` clean, 17/17). Rule 2 (SKILL.md:2868) applies before rule 4. |
| 2 | `kagi…:SKILL.md:488` | `musketeer-cdp-9222-profile-lease` | right (note D1) | Anti-pattern: "Absorbing cross-domain surfaces (CDP lease, musketeer profile) into this repo — report to integrator." A refusal to absorb the already-mapped surface adds no breadth. |
| 3 | `kagi…:corpus/knowledge/cdp-bridge-1password.md:70` | `musketeer-cdp-9222-profile-lease` | right (D2 lead caveat) | The burner on 9222 is the leased resource; "start/inspect via the browser lane" is the operational half of it (§1). Not a distinct boundary. |
| 4 | `kagi…:corpus/knowledge/cdp-bridge-1password.md:77` | `musketeer-cdp-9222-profile-lease` | right (note D1) | The doc's own cross-domain note, verbatim the lease: 9222 + `the-musketeer` shared with the webzites kimi fleet, ownership unresolved, filed to the integrator. |
| 5 | `kama…@0163fea2…:corpus/knowledge/listener-census.md:56` | `cdp-live-target-census` | right | Table row 8 of the same census: same endpoint, same `chrome` pid 3080080, `FOREIGN_SERVICE` for model purposes. The map's tabi side names both halves — `PROVINCE.md:9` "CDP session discipline (endpoints, targets, screenshot/DOM evidence" — so an endpoint row and the `:355` target row are one boundary (map line 11, verified contested-open on L0:65, which names kama). |
| 6 | `kama…:corpus/knowledge/consumer-registry.md:235` | `cdp-live-target-census` | right | Records the consumer pin `~/.config/opencode/agents/musketeer.md:26` = `http://localhost:9222` plus the model-only probe verdict; "for model purposes" is a non-claim, but the surface is the same loopback CDP endpoint census, and `same-surface` is the only eligible reason here (a kama candidate can only name a kama surface). |

### reason = no-claim-declared (1 row) — RIGHT

| # | candidate | verdict | why |
|---|---|---|---|
| 7 | `kama…:corpus/knowledge/consumer-registry.md:9` | right | "Non-model loopback pins (CDP, browser daemons, auth brokers, web previews) are recorded in a separate section because they share the same 'drifted loopback peer' failure class but are *not* kama's serving surface." Explicit non-goal, confirmed by the section header at `:230-231` ("**not** kama's serving surface, and deliberately not given a model verdict"). The sentence spans all non-model pins (auth brokers, web previews), so it is not on the CDP-target surface either; `no-claim-declared` is the first matching rule (SKILL.md:2872). |

No `third-lane-report` or `not-browser-sense` rows exist for these two siblings.

### Wrong reasons / should-be-map-rows

None. Every one of the seven lines is a restatement of a boundary already mapped for that same sibling; per `check-adjacency`, a second row on that (surface, sibling) pair is `duplicate_row` (§1.5), so mapping is not available and would be dishonest without a tabi-side declaration the lane does not hold.

## 3. Defects

**D1 — minor (evidence pointer, prose only): three kagi notes cite map "row 6" for the lease.** `SKILL.md:2843` makes the note free prose the counter does not read, so the frozen C1 predicate is unaffected (`screenFindings []`); the defect is that the pointer contradicts the lane's own row numbering, which is the file-line number (`SKILL.md:2915` "map row 6" = `crawler-discipline-vs-publishing`; `lessons/round-34.md` uses the same base for rows 15-18).

- `adjacency-screen-skill.tsv` kagi:450 note: "Restates the lease row 6 already maps contested on kagi PROVINCE.md:43" — row 6 is `crawler-discipline-vs-publishing` (kake, `kake PROVINCE.md:30`); `kagi PROVINCE.md:43` is **row 8**.
- kagi:488 note: "already mapped contested at row 6" — same error.
- kagi:77 note: "verbatim the row 6 lease, reported not absorbed" — same error.
- Verified unchanged at both revisions: `git show 15dfacc…:corpus/adjacency.tsv | nl` and `git show 04f9623…:corpus/adjacency.tsv | nl` both give line 6 = crawler/kake, lines 7-8 = `musketeer-cdp-9222-profile-lease` (kake, kagi). The pointer was never true, so it is not a stale-by-append artifact.
- Smallest safe correction: renumber the three notes to "map row 8" (or "rows 7-8") in the ledger; no surface, reason, quote or disposition changes. kama's notes are correct under the same convention ("row 11" for `cdp-live-target-census`, file line 11), so the fix removes an internal inconsistency, not a convention.

**D2 — informational: the round-33 lead's "names tabi" annotation is an inference.** `ConnSiblingScan.md:66-67` lists `cdp-bridge-1password.md:70` with "(… — names tabi)". The file contains zero `\btabi\b` tokens (`git -C kagi-shokunin show <pin>:corpus/knowledge/cdp-bridge-1password.md | grep -c -E '\btabi\b'` → 0, exit 1), and "the browser lane" is undefined in kagi's corpus. The screen row's `same-surface` verdict is unaffected (it never relied on a tabi naming), but a future reader should not treat the parenthetical as a quote. No action required for C1; the frozen candidate set is keyed on the line, not on the annotation.

## 4. Mechanical checks (all passed)

- Seven rows: 5 TAB columns, exact header `sibling_ref reason surface quote note`, `sibling_ref` exactly a frozen candidate key, `screen-surface-not-dash` N/A (all non-same-surface rows write `-`), no repeated `sibling_ref` in the ledger.
- Quotes: verbatim substrings of the frozen candidate text — kagi:450 18 words/91 non-space; 488 14/88; cdp:70 12/87; cdp:77 11/64; kama:56 9/114; registry:9 14/79; registry:235 6/45. All inside 4-25 words and ≥20 non-space chars.
- Ledger tally matches the lesson: same-surface 35, third-lane-report 23, no-claim-declared 3, not-browser-sense 1, total 62 (`awk -F'\t' 'NR>1{c[$2]++}'`), equal to `lessons/round-34.md:65`.
- Surface validity: `musketeer-cdp-9222-profile-lease` is verification-passing for kagi (map line 8, contested-open, `fleet@ebeb396f…:.ufo/l0-questions.md:62` names kagi); `cdp-live-target-census` is verification-passing for kama (map line 11, contested-open, `fleet@b6b3b5e4…:.ufo/l0-questions.md:65` names kama).

## 5. Commands run (exact, with exit codes)

Scratch `S=/fast/scratch/hyaku/tabi-r34/CritScreenKagiKama`; clone `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` + `git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa` (rev-parse → `04f9623dde8ad35d470cecf766e421eafbcb47fa`, exit 0).

1. `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 04f9623… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 0**; `{'predicate': True, 'candidates': 67, 'mapped': 5, 'screened': 62, 'unaccounted': 0, 'newMapped': 4}`, `adjacency {'verdict':'clean','rows':17,'verified':17,'findings':0}`, `screenFindings []`. (Receipt `c1-adjacency-sweep-v2-at-04f9623.json`.) Note this confirms the ledger's seven kagi/kama rows are all consumed as screens and that no candidate in this group is unaccounted — it does **not** judge semantics.
2. `git -C kagi-shokunin show 69b61db4…:SKILL.md | nl | sed -n '430,500p'` (exit 0); `…:corpus/knowledge/cdp-bridge-1password.md | nl | sed -n '40,100p'` (exit 0).
3. `git -C kama-shokunin show 0163fea2…:corpus/knowledge/listener-census.md | nl | sed -n '35,75p;330,375p'` (exit 0); `…:corpus/knowledge/consumer-registry.md | nl | sed -n '1,40p;215,245p'` (exit 0).
4. `git -C kagi-shokunin show …:PROVINCE.md | nl | sed -n '1,70p'` (exit 0); `sed -n '55,70p' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` (exit 0).
5. Python check over `baseline/c1-candidates.tsv` × `corpus/adjacency-screen-skill.tsv`: header equality, candidate key present, quote verbatim, word/non-space counts, column counts — all True/in range, exit 0.
6. Duplicate-row probe: added one `musketeer-cdp-9222-profile-lease`/`kagi` row on `cdp-bridge-1password.md:70` inside `$S/dup` (own clone, toplevel asserted = `$S/dup`), committed with seat identity; `node scripts/check-adjacency.mjs --at <commit> --repo "$S/dup" --fleet …` → **exit 1**, `finding row=19 reason=duplicate_row detail=surface=musketeer-cdp-9222-profile-lease sibling=kagi pin=kagi@corpus/knowledge/cdp-bridge-1password.md:70 first_row=8`.
7. `grep -n -E "the-musketeer|9222|attach" SKILL.md` and `grep -n "adjacency-screen-skill…"` over tabi SKILL/QUALITY/lesson (exit 0) for the tabi side and the row-numbering convention.
8. Token check: `git -C <lane> show <pin>:<file> | grep -c -E '\btabi\b'` → 0 for kagi `SKILL.md`, kagi `cdp-bridge-1password.md`, kama `listener-census.md`, kama `consumer-registry.md`.
9. `git show 15dfacc…:corpus/adjacency.tsv | nl` vs `git show 04f9623…:corpus/adjacency.tsv | nl` (exit 0 each): row 6/7/8 identity for D1.

No network fetch, no browser launch, no lane-file edit, no lane git/jj mutation, no tool install (nothing installed or upgraded this seat). All writes: this report, the `CritScreenKagiKama/` receipts beside it, and `$S` scratch (removed before yield; receipts copied first).

## 6. Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKagiKama.md`
- `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKagiKama/c1-adjacency-sweep-v2-at-04f9623.json`
- `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKagiKama/probe-duplicate-row-adjacency.tsv`
- `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKagiKama/probe-duplicate-row-gate.json`
- `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKagiKama/probe-duplicate-row-gate.txt`
- `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKagiKama/probe-duplicate-commit.txt`

**Axes touched:** adjacency (C1) only. No axis is harmed; D1 is an evidence-pointer correction inside the round's own numbering convention.
