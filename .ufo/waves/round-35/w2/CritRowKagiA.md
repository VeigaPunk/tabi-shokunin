# CritRowKagiA — w2 attack on C1 map row 18 (`cdp-bridge-vault-dom-refusal`)

Milestone: C1. Seat: CritRowKagiA. Attacked: the one new C1 map row
(`corpus/adjacency.tsv:18`, surface `cdp-bridge-vault-dom-refusal`, sibling kagi,
disposition `split-declared`, tabi decl `SKILL.md:2970`) at the wave-1 integration
`083c5c643be7aa5965a5de3458a32ed0d289ead3`.

## Verdict

**WITHDRAW — defect, high severity for C1 as integrated.** The kagi line the row
cites (`kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:40`) states
kagi's own operational rule for its own CLI and states no side of any split with
tabi: kagi names tabi nowhere at the pin, the `open-popup` refusal is routed toward
no lane ("use agent-browser" = an unrelated global npm binary analyzed by kaidoku,
not tabi), and the vault-DOM ban is a refusal **both lanes share** — tabi's own
declaration (`SKILL.md:2970`) disclaims reading a vault DOM or a session value, so
there is no overlap to dispose. Per QUALITY 91 the row's only sibling-side ground is
a fact on kagi's own side of already-mapped splits (`secrets-vault-ops` row 9,
`musketeer-cdp-9222-profile-lease` row 8), and per QUALITY 97 the sibling line does
not state the sibling's side of the split — it is the round-34 M5 pattern "a refusal
neither side routes" again. The row must be withdrawn and the candidate line screened
`same-surface` (surface `secrets-vault-ops`; alternatively `musketeer-cdp-9222-profile-lease`),
which drops `newMapped` to 0 and makes the C1 predicate false (honest stop).

## Evidence

### The row and its candidate line

- Map row, `corpus/adjacency.tsv:18` at `083c5c64`:
  `cdp-bridge-vault-dom-refusal	kagi	kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md:40	| 1Password in musketeer Chrome | `cdp-bridge ensure` then `status` | `open-popup` (hard refusal, exit 2); scraping vault DOM | manifest at `$MUSKETEER_CHROME_PROFILE/NativeMessagingHosts/` |	SKILL.md:2970	the `open-popup` refusal kagi states at `kagi-shokunin/SKILL.md:40`	split-declared	-	tabi's CDP session discipline (PROVINCE.md:9) drives browsers and captures DOM/screenshot evidence`
- Candidate line bytes, `git show 69b61db46be4ed955994f6f1d1cba522bc5f4e97:SKILL.md | sed -n '40p'`
  → 192 bytes, the table row above. It is a kagi skill-table row: allowed verb
  (`cdp-bridge ensure`/`status`), refused verb (`open-popup` hard refusal exit 2;
  scraping vault DOM), manifest location. Self-directed operational rule; no lane is
  named or addressed.

### Kagi never names tabi at the pin

- `git grep -ni 'tabi' 69b61db46be4ed955994f6f1d1cba522bc5f4e97 -- SKILL.md PROVINCE.md corpus/knowledge/`
  → **zero matches** (empty output, exit 1).

### "use agent-browser" is not tabi

- Fleet-wide `grep -rn --include=*.md "agent-browser"` under `/home/vgpnk/Projects/shokunin/*-shokunin/`:
  kagi's only occurrence is the refusal message `corpus/knowledge/cdp-bridge-1password.md:60`
  ("the-janitor: open-popup is human/CDP UI — use agent-browser; will not scrape vault DOM");
  the other occurrences are kaidoku's REA analysis of a global npm binary
  (`agent-browser` 0.38.2, `~/.local/share/fnm/.../agent-browser/bin/agent-browser-win32-x64.exe`,
  `kaidoku-shokunin/corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:45,48`). No kagi
  text ties agent-browser to tabi; the refusal routes nowhere toward tabi, and tabi makes
  no claim to `open-popup` anywhere (tabi `SKILL.md:2970` is the only tabi mention of it,
  and it quotes kagi's refusal).

### Shared refusal — no overlap

- Tabi's own declaration, `SKILL.md:2970`: "…the `open-popup` refusal kagi states at
  `kagi-shokunin/SKILL.md:40`, and the ban on scraping vault DOM, stay kagi's; tabi's CDP
  session discipline (PROVINCE.md:9) drives browsers and captures DOM/screenshot evidence
  **without reading a vault DOM or a session value**." Tabi holds the same refusal on vault
  DOM; neither lane claims open-popup. Both sides refuse the same thing → no overlap to
  dispose (seat trichotomy: "a refusal both lanes share (no overlap)").
- The knowledge entry states the ban as universal: "scraping vault DOM is out of bounds for
  the CLI and for agents" (`kagi-shokunin/corpus/knowledge/cdp-bridge-1password.md` §"cdp-bridge open-popup is refused by design"), i.e. not a tabi-specific boundary.

### The w1 screen ledger already screens this exact refusal as same-surface

`git show 083c5c643...:corpus/adjacency-screen-browser.tsv | sed -n '34,50p'` — kagi
lines carrying the identical refusal are already screened `same-surface`:

- `cdp-bridge-1password.md:57` → `same-surface` `secrets-vault-ops` ("the heading states
  kagi's refusal to scrape the vault DOM through `open-popup`, the vault-ops boundary
  kagi-shokunin PROVINCE.md:3 owns and the refused-route row already answers")
- `cdp-bridge-1password.md:60` → `same-surface` `secrets-vault-ops` (the refusal message;
  "the vault-ops boundary kagi-shokunin PROVINCE.md:3 owns")
- `cdp-bridge-1password.md:87` → `same-surface` `secrets-vault-ops` ("smoke-checks the
  refused `open-popup` subcommand, the vault-ops boundary kagi-shokunin PROVINCE.md:3 owns")
- `janitor-command-surface.md:23` → `same-surface` `musketeer-cdp-9222-profile-lease`
  (the `cdp-bridge` manifest write into the-musketeer chrome-profile, "kagi PROVINCE.md:43
  pins exactly that manifest as its side of the lease/profile split already mapped contested")

Row 18 maps the same refusal, in table form, instead of screening it. Q91: "a map row
whose only sibling-side ground is a fact on the sibling's own side of an already-mapped
split is a screen, whatever its surface name."

### Precedent: round-34 M5

`corpus/lessons/round-34.md` M5: wave 2 withdrew row 17 ("a census of tabi's own draft
taken as a sibling-side split") and row 18 ("a refusal neither side routes"); QUALITY 97:
"a `split-declared` map row cites a sibling line in which the sibling itself states its side
of the split". Row 18 here is the same shape: a refusal neither side routes, on kagi's own
side of already-mapped splits.

### The counter: form passes, semantics not judged

- Run (scratch clone at `083c5c64`, frozen counter bytes):
  `TMPDIR=/fast/scratch/hyaku/tabi-r35/CritRowKagiA node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --json` → exit 1,
  `{adjacency:{verdict:"clean",rows:17,verified:17,findings:0}, candidates:383, mapped:1, screened:382, unaccounted:0, newMapped:1, newMappedRows:[{row:18, surface:"cdp-bridge-vault-dom-refusal", sibling:"kagi", disposition:"split-declared"}]}` (JSON saved at `.ufo/waves/round-35/w2/CritRowKagiA/counter-c1-at-083c5c643.json`).
- Mechanical n4 passes only because `refusal` is in the SIDE regex
  (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:83,289`); the counter
  expressly defers overlap semantics to wave 2 (same file, lines 59-60: "Overlap
  semantics … are NOT judged here: wave 2 and the closure judge each new row").

### Decision-rule application (SKILL.md:2861-2881)

1. Browser-sense: yes (CDP bridge, Chrome, DOM) → not `not-browser-sense`.
2. Already-mapped verified row owns that surface for kagi: yes — row 9
   `secrets-vault-ops` (refused-route) and row 8 `musketeer-cdp-9222-profile-lease`
   (contested-open); both verify at `083c5c64` (17/17 verified). → `same-surface`,
   surface `secrets-vault-ops` (primary; the row also touches
   `musketeer-cdp-9222-profile-lease` via its manifest cell).
3. Not a third-lane report; not a claim of this lane's surface → steps 3/4 do not apply.

## Deliverables

- Report: `.ufo/waves/round-35/w2/CritRowKagiA.md`
- Output dir: `.ufo/waves/round-35/w2/CritRowKagiA/`
  - `counter-c1-at-083c5c643.json` (full frozen-counter JSON at the wave-1 integration rev)
  - `counter-c1-stderr.txt`
- Scratch `/fast/scratch/hyaku/tabi-r35/CritRowKagiA/` removed on exit.

## Commands run (exit codes)

- `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` → 0
- `git -C "$S/clone" checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3` → 0
- counter run → exit 1 (evaluated, predicate false: newMapped 1 < 2)
- `git grep -ni 'tabi' 69b61db… -- SKILL.md PROVINCE.md corpus/knowledge/` → no matches
- `git show 69b61db…:SKILL.md | sed -n '40p'` → 192-byte line, quoted above
