# MutDetailAssert — round 34 w2 (C2): runner `detailIncludes` comparison & result recording

## Verdict

**HOLDS — no defect found.** The integrated runner's new `detailIncludes` assertion (scripts/check-bidi-runtime.mjs:1161–1165 at 04f9623dde8ad35d470cecf766e421eafbcb47fa) is load-bearing for **exactly 3 of the 20 frozen gate-mutant kills: M04, M05, M06** — with the conjunct dropped the frozen C2 counter reports killedCount 17 / survivors M04 M05 M06 while pristine, neutral, decoy, all 20 twins and the battery stay green, so nothing else moves. Every *active* weakening I applied to the comparison or to the result recording is caught by the frozen counter (drop-conjunct via survivors; wrong-field and inverted-includes via pristine/neutral/decoy exit 3 + all 20 twins failing + battery false; falsified `ok` recording via 20 survivors), so the claim's instrument covers its own runner. Two mutation classes are **behavior-equivalent on today's case set and invisible to the counter** (reading the last instead of the first finding; dropping the detail fields from the recorded results) — recorded below as coverage notes, not defects; no gate mutant slips through them today.

## What I attacked

The self-test runner only — the round-34 additions in `scripts/check-bidi-runtime.mjs`:

- line 1161 `const firstDetail = out.entryDetail || (out.rows.find((r) => !r.admitted) || {}).detail || null;`
- line 1164 the `pass` conjunct `&& (c.detailIncludes === undefined || (typeof firstDetail === "string" && firstDetail.includes(c.detailIncludes)))`
- line 1165 the recording `results.push({ id: c.id, ok: pass, …, detail: firstDetail, expectedDetailIncludes: … })`

Six runner mutants, one scratch commit each (tree = base + exactly one runner-line change; full diffs in `runner-mutant-diffs.patch`; no rule line touched, no mutant find text reworded — every run reports `unappliable: []`):

| id | mutation | commit |
|---|---|---|
| RA | drop the `detailIncludes` conjunct from `pass` | `4d43777cb442370731823435df34bfa05bee5f16` |
| RB | compare against the wrong field (`reason` instead of `firstDetail`) | `6382e17d80470a2e2974881a39001db7fb2b32b5` |
| RC | invert the includes (`!firstDetail.includes(…)`) | `b898bf3e428957fb6e48a08eb5670cbc914e3219` |
| RD | rows fallback reads the **last** non-admitted row's detail (`rows.filter(…).pop()` instead of `rows.find(…)`) | `8196b1bc3449b352ed1168f58b38763d2a6b12a8` |
| RE | result recording falsified (`ok: pass` → `ok: true`) | `13b24c993e6f20f93b432973104cc9a6c8a60638` |
| RF | recording drops `detail`/`expectedDetailIncludes` fields | `4dd25a1183a9fad1d41f35329e761af16ef205ea` |

## Evidence

Frozen-counter integrity: `sha256 .ufo/waves/round-34/counters/c2-gate-mutants.mjs` = `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82` — equals `frozenDigests` in claims.json. Gate blob at base: sha256 `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87`.

Command shape (one run per commit; `S=/fast/scratch/hyaku/tabi-r34/MutDetailAssert`):

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa
# … edit runner lines, commit (-c user.name=MutDetailAssert -c user.email=MutDetailAssert@scratch.local) …
TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --repo "$S/clone" --rev <commit> --json \
  > "$S/out/<name>.json" 2> "$S/out/<name>.stderr"; echo exit=$?
```

Exit codes: pristine=0, RA=1, RB=1, RC=1, RD=0, RE=1, RF=0 (~83 s each).

| run | rev | predicate | killed | survivors | pristine/neutral/decoy | twinsFailing | battery |
|---|---|---|---|---|---|---|---|
| pristine control | 04f9623 | **true** | 20/20 | — | 0/0/0 | — | true |
| RA drop conjunct | 4d43777 | false | **17** | **M04 M05 M06** | 0/0/0 | — | true |
| RB wrong field | 6382e17 | false | 20 (spurious) | — | **3/3/3** | **all 20** | **false** |
| RC invert includes | b898bf3 | false | 20 (spurious) | — | **3/3/3** | **all 20** | **false** |
| RD last finding | 8196b1b | **true** | 20/20 | — | 0/0/0 | — | true |
| RE ok:true | 13b24c9 | false | **0** | **all 20** | 0/0/0 | — | true |
| RF drop recorded detail | 4dd25a1 | **true** | 20/20 | — | 0/0/0 | — | true |

Why exactly M04, M05, M06 (mechanism-checks.json, observed `--selftest --json` details under runner RA):

- pristine `v3-a-m06` observes `detail = "run1: sessionId is not 32 lowercase hex: \"585E9EC1343EAA7FAA0718A636677BC9\""` (56/56 cases pass) — the pin matches.
- RA+**M04** (path rule disabled, gate:797): `v3-b-m04` still sees exit 1 / admitted 0 / `t1-receipt`, detail `"transcript sha256 repeated across runs (byte-identical copies)"` — the sha rule (gate:798) fires instead; without the detail pin the case passes → M04 survives.
- RA+**M05** (sha rule disabled, gate:798): `v3-b-m05` still sees exit 1 / admitted 0 / `t1-receipt`, detail `"sessionId repeated across runs: e3a0ae31f5ca9591800dcbf63f70ae4f, e3a0ae31f5ca9591800dcbf63f70ae4f"` — the sessionId-distinctness rule (gate:811) fires instead → M05 survives.
- RA+**M06** (SESSION_ID widened, gate:145): `v3-a-m06` still sees exit 1 / admitted 0 / `t1-receipt`, detail `"run1: webSocketUrl is not ws://<host>/session/<sessionId>: ws://127.0.0.1:9515/session/585E9EC1343EAA7FAA0718A636677BC9"` — the `WS_SESSION` shape regex (gate:148 → refusal at gate:387) still rejects the upper-case segment, exactly as the case comment (gate:1034–1035, "would refuse later, naming the ws url") says → M06 survives.
- RA+**M07** and RA+**M19** are still killed (exit 3, FAIL lines `v3-b-m07-ws-session-segment-unbound` / `v3-b-m19-sessionid-repeated`): under those mutants the refusal disappears entirely (exit 0), so their kills rest on exit/admitted, not on the detail pin.

## Findings for the L1 (no repair proposed)

1. **Dependency map:** 3 of 20 kills (M04, M05, M06) depend on the `detailIncludes` assertion; 17 do not. Any future edit weakening runner line 1164 silently drops those 3 kills — but the frozen counter detects it (predicate false via survivors), so the C2 instrument covers its own runner.
2. **Counter-invisible, equivalent today (RD):** first-vs-last finding is untested — all five detail cases are single-refusal (either `entryDetail` set with row details null, or one shared `receiptFinding` stamped on every failing row), so `rows.find` ≡ `rows.filter().pop()` on every case; predicate stays true, 20/20 killed. If a future case ever mixes differing per-row details, row order becomes load-bearing with no probe noticing.
3. **Counter-invisible, equivalent today (RF):** the CASE text line (gate:1213) never prints the detail; dropping the recorded `detail`/`expectedDetailIncludes` fields degrades only `--json` diagnostics, and the counter cannot see it (predicate stays true). Kill evidence flows through the comparison, not the recording.
4. **killedCount alone is not kill evidence (RB/RC):** wrong-field/inverted comparisons make the five detail cases fail under *any* gate, inflating killedCount to 20 spuriously; the counter refuses via pristine/neutral/decoy exit 3, all 20 twins failing, and battery false (the round-33 battery's own predicate requires the gate's `--selftest` to exit 0, battery line 45/229). The guard probes, not the kill count, are what make the predicate meaningful — confirmed empirically.

## Deliverable paths

- Report: `.ufo/waves/round-34/w2/MutDetailAssert.md` (this file)
- Receipts: `.ufo/waves/round-34/w2/MutDetailAssert/` — `pristine.json`, `RA-drop-conjunct.json`, `RB-wrong-field-reason.json`, `RC-invert-includes.json`, `RD-last-finding.json`, `RE-recording-ok-true.json`, `RF-recording-drop-detail.json` (+ empty `.stderr` each), `mechanism-checks.json`, `runner-mutant-diffs.patch`, `scratch-commits.txt` (sha256 of each JSON in the transcript above).

Scratch `/fast/scratch/hyaku/tabi-r34/MutDetailAssert` (clone, counter TMPDIR, mech gates) deleted after receipt copy. No lane tracked file, no lane git/jj state, no fleet file touched; git writes only inside the scratch clone (toplevel asserted before every commit).
