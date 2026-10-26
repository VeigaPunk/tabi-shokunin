# AdjKagiKama — commands, exit codes, receipts (round 34, C1 build)

Seat scratch: `/fast/scratch/hyaku/tabi-r34/AdjKagiKama` (`HYAKU_SCRATCH=/fast/scratch/hyaku`),
clone at `/fast/scratch/hyaku/tabi-r34/AdjKagiKama/clone`
(`git rev-parse --show-toplevel` → `/fast/scratch/hyaku/tabi-r34/AdjKagiKama/clone`),
`TMPDIR` always `$S/tmp` under that scratch. No network fetch. No tool installed.
No browser launched. No write outside the output dir, the clone and the scratch.

## Setup and frozen-counter identity

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"      # exit 0
git -C "$S/clone" checkout -q --detach 59f1b47aae277e1670e4a824173da8cde7e388ee  # exit 0
git -C "$S/clone" rev-parse HEAD
  59f1b47aae277e1670e4a824173da8cde7e388ee
git -C "$S/clone" show 59f1b47…:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs > "$S/c1.mjs"
sha256sum "$S/c1.mjs"
  0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e
```
Matches `claims.json:frozenDigests[".ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs"]`
= `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e`. The counter was run
from this copy (its own `ADJ_GATE_SHA256` check passed inside every run: the JSON
echoes `adjGateSha256 = 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac`).

## Candidate list (the counter's own text, not a re-read of the TSV)

```
TMPDIR="$S/tmp" node "$S/c1.mjs" --list-candidates --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin > "$S/cands.tsv"      # exit=0, 67 lines
```
Receipt: `candidates.tsv` (67 rows). My seven keys, verbatim:

```
kagi-shokunin@69b61db4…:SKILL.md:450
kagi-shokunin@69b61db4…:SKILL.md:488
kagi-shokunin@69b61db4…:corpus/knowledge/cdp-bridge-1password.md:70
kagi-shokunin@69b61db4…:corpus/knowledge/cdp-bridge-1password.md:77
kama-shokunin@0163fea2…:corpus/knowledge/listener-census.md:56
kama-shokunin@0163fea2…:corpus/knowledge/consumer-registry.md:9
kama-shokunin@0163fea2…:corpus/knowledge/consumer-registry.md:235
```

## Screen-row verification (reason vocabulary, quote on the cited line, bounds, surface rule)

```
node "$S/verify-screen.mjs" <out>/screen.tsv "$S/cands.tsv"     # exit=0
OK   row=1 kagi…:SKILL.md:450 reason=same-surface  surface=musketeer-cdp-9222-profile-lease words=18 nonspace=91
OK   row=2 kagi…:SKILL.md:488 reason=same-surface  surface=musketeer-cdp-9222-profile-lease words=14 nonspace=88
OK   row=3 kagi…:cdp-bridge-1password.md:70 reason=same-surface surface=musketeer-cdp-9222-profile-lease words=12 nonspace=87
OK   row=4 kagi…:cdp-bridge-1password.md:77 reason=same-surface surface=musketeer-cdp-9222-profile-lease words=11 nonspace=64
OK   row=5 kama…:listener-census.md:56 reason=same-surface surface=cdp-live-target-census words=9 nonspace=114
OK   row=6 kama…:consumer-registry.md:9 reason=no-claim-declared surface=- words=14 nonspace=79
OK   row=7 kama…:consumer-registry.md:235 reason=same-surface surface=cdp-live-target-census words=6 nonspace=45
SCREEN_VERIFY rows_ok=7 rows_bad=0
```
`verify-screen.mjs` (copied into the output dir) checks each quote as a substring of the
cited line read from the **pinned sibling commit** (`git show <pin>:<path>`), not from the
candidate TSV: every row carries `quote-absent-on-cited-line` only if that fails (it never did).
Word/non-space bounds are the counter's (`4..25` words, `>=20` non-space chars). A
`same-surface` row's `(surface, sibling)` must be one of the two verification-passing
baseline rows (`musketeer-cdp-9222-profile-lease`/kagi = adjacency row 6;
`cdp-live-target-census`/kama = row 11).

The `screen.tsv` byte identity and the clone ledger:
```
sha256sum screen.tsv            -> 50ddab114ce910dad32edcdc2e04e4bcf2f0571ee41e06ae9ddd770d109bf463   (7 rows, pre-header)
sha256sum clone/corpus/adjacency-screen-skill.tsv -> 4ebfcedd6992d6abb73dbaef2312a5c73f6b8b4e0711002e77494c042d9edde1  (header + 7 rows)
cmp <(printf 'sibling_ref\treason\tsurface\tquote\tnote\n') <(head -1 clone/corpus/adjacency-screen-skill.tsv) -> header-exact=yes
diff <(tail -n +2 clone/corpus/adjacency-screen-skill.tsv) screen.tsv -> no output (ledger rows == delivered rows)
```

## Clone history and the only change

```
git -C "$S/clone" checkout -q -B master 59f1b47aae277e1670e4a824173da8cde7e388ee      # exit 0
git -C "$S/clone" -c user.name=AdjKagiKama -c user.email=AdjKagiKama@scratch.local commit -q -m "…"  # exit 0
  8c8fab3f7bb445a0c708392e52194aa62641f1c1   (first screen ledger; row 6 as not-browser-sense)
  37c64dbb205cf200bdd6a6862dbe12f78c775678   (row 6 corrected to no-claim-declared under rule 4)
git -C "$S/clone" diff --numstat 59f1b47…..HEAD   -> 8	0	corpus/adjacency-screen-skill.tsv
git -C "$S/clone" status --porcelain              -> (empty)
```
No map row was appended to `corpus/adjacency.tsv`, no `SKILL.md` section was added
(there are no declaration bullets to carry), and no other tracked file moved.

## Gate runs

At the first commit (row 6 drafted `not-browser-sense`):
```
TMPDIR="$S/tmp" node "$S/clone/scripts/check-adjacency.mjs" --at 8c8fab3… \
  --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json     # exit=0
  verdict=clean rows=13 verified=13 findings=[]
TMPDIR="$S/tmp" node "$S/c1.mjs" --rev 8c8fab3… --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json                       # exit=1
  candidates=67 mapped=1 screened=7 unaccounted=59 newMapped=0 screenFindings=[] predicate=false
```

At the delivered commit `37c64dbb205cf200bdd6a6862dbe12f78c775678`:
```
TMPDIR="$S/tmp" node "$S/clone/scripts/check-adjacency.mjs" --at 37c64db… \
  --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json     # exit=0
{"schema":"tabi-adjacency-check-v1","mode":"check","at":"37c64dbb205cf200bdd6a6862dbe12f78c775678",
 "verdict":"clean","rows":13,"verified":13,"selfRulings":[2], …}      findings=[]

TMPDIR="$S/tmp" node "$S/c1.mjs" --rev 37c64db… --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json                       # exit=1
  schema = tabi-r34-c1-adjacency-sweep-v2
  rev = 37c64dbb205cf200bdd6a6862dbe12f78c775678
  baseline = 15dfaccb34601c2d221c78501e2befd8998d600c
  adjGateSha256 = 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac
  adjacency = {"verdict":"clean","rows":13,"verified":13,"findings":0}
  candidates = 67 ; candidatesBySet = {"A":38,"B":29}
  leadsReanchored = ["corpus/knowledge/mirror-pitfalls.md:39@0440485… -> 40"]
  leadsUnresolved = []
  mapped = 1 ; screened = 7 ; unaccounted = 59 ; newMapped = 0 ; newMappedRows = []
  screenFindings = []
  perLane.kagi = 4 ; perLane.kama = 4
  predicate = false
  unaccountedKeys ∩ {kagi@69b61db4…, kama@0163fea2…} = []        <-- all seven of this seat's candidates accounted
```
Receipts: `check-adjacency.json`, `c1-sweep.json`, `verify-screen.out`, `clone-diff.numstat`.

Exit 1 with `predicate=false` is the expected state for a **single seat** of this wave:
the wave target (`unaccounted 0`, `newMapped >= 3`) is met only once every seat's rows
are integrated. This seat's share of the target is "its seven candidates accounted for by
verified screen rows": baseline `screened 0, unaccounted 66` → here `screened 7,
unaccounted 59`, `screenFindings []`, and none of the seven keys is in `unaccountedKeys`.
`newMapped 0` is the seat's judgement, not an omission (see `decl.md`).

## Evidence for "no disposition was available to a map row"

Token check on the pinned bytes (python `re.findall(r'\btabi\b', line, re.I)`), all seven lines:
```
kagi…:SKILL.md:450                                  tabi-tokens=0  chars=114
kagi…:SKILL.md:488                                  tabi-tokens=0  chars=103
kagi…:cdp-bridge-1password.md:70                    tabi-tokens=0  chars=145
kagi…:cdp-bridge-1password.md:77                    tabi-tokens=0  chars=74
kama…:listener-census.md:56                         tabi-tokens=0  chars=278
kama…:listener-census.md:355                        tabi-tokens=0  chars=97
kama…:consumer-registry.md:9                        tabi-tokens=0  chars=98
kama…:consumer-registry.md:235                      tabi-tokens=0  chars=259
```
(So `split-declared` — which the counter requires to carry the word `tabi` on the sibling
side — is impossible for every one of them.)

Fleet rulings outside `.ufo/` naming the sibling and tabi together — none:
```
for f in LOG.md SCORECARD.md AXES.md MISSION.md README.md CORPUS.md PROTOCOL.md ROADMAP.md; do
  grep -n -i -w kagi "$f" | grep -i -w tabi ; grep -n -i -w kama "$f" | grep -i -w tabi ; done
  -> no output (LOG.md mentions kagi 15×, kama 24×; SCORECARD.md 14× / 21× — no line pairs them with tabi)
```
(So no `ruled` venue exists for a kagi or kama row on these surfaces.)

The two surfaces are already contested-open with fleet L0 lines that name them:
`.ufo/l0-questions.md:62` (tabi round-17: "tabi holds no lease half … never attaches to
9222 or the musketeer profile") and `:65` ("kama-shokunin corpus/knowledge/listener-census.md:355
enumerates live CDP 9222 targets"). Both were read read-only; nothing under `.ufo/` was written.

## Local checks of the cited tabi / sibling lines (read-only `git show`)

```
tabi-shokunin SKILL.md:556  "- **Profiles**: a fresh throwaway profile per run under the run's own output dir"
tabi-shokunin SKILL.md:2861 "### Round 33 — decision rule: a map row or a screen row (append-only)"
tabi-shokunin SKILL.md:2881 "for lines the map must not answer for, not for lines that are merely inconvenient."
kagi PROVINCE.md:43         "CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` — **contested with kake** …"
kagi PROVINCE.md:59         "the CDP lease/profile ownership question is reported to the integrator, never adjudicated here."
kagi cdp-bridge-1password.md:53-55  "`curl -fsS --max-time 1 http://127.0.0.1:9222/json/version` … reachability probe"
kagi cdp-bridge-1password.md:81-82  "Ownership of the shared-browser lease for vault work is unresolved … filed to the integrator"
kama consumer-registry.md:11        "kama's serving surface."
kama consumer-registry.md:230-231   "Recorded for completeness; **not** kama's serving surface, and deliberately not given a model / verdict."
kama consumer-registry.md:236       "… `127.0.0.1:10086` | kimi-webbridge browser daemon | **DEAD** at probe time …"
```
