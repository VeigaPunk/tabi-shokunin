# ScribeErrataB — round 33 w1 report

**Verdict.** CritEntry's precision/provenance intake resolves cleanly against the freeze: of the twelve rows
(`D3–D13` plus its nit `n1`), **nine land** as append-only corrections to
`corpus/knowledge/webdriver-bidi-runtime-round-32.md` (D3, D4, D6, D7, D8, D9, D10, D11, D13, n1 — ten bullet
lines, ready to paste), **two are closed-already** and need no text (D5 by the round-32 wave-2 correction at
`:196-200`; D12 because `.ufo/waves/round-32/measure/c1-distinct-at-0808688.json` with `ok:true` landed in
`8fa57d2`, an ancestor of the freeze), and **none is refused**. D3 — §8's "four constructions" where w1
CritC1Forgery rates a fifth — is real: `CritC1Forgery.md` rates six defects and D5 (a fabricated `mined` registry
row passing `s1`) is the fifth admitted construction, outside all four counts the entry lists. Every landed
sentence is re-derived from bytes read at `e6b0a90` or from one read-only spec fetch whose sha256 equals S124's
recorded digest; no live browser was started, no probe was re-run, no lane file was written. One landing hazard is
recorded: `baseline/controls.mjs:87` pins the **live worktree's** entry digest into the C2 J3 whitelist control
while its clone resets to BASELINE, so after an append a regenerated `c2-J3-whitelist.json` will show
`honest.H0/H1/H2 = false` instead of the committed `true` (the control's own predicate does not flip); the gate's
row population is unaffected because `parseTable` stops at the first non-row line.

## Evidence

Frozen state (clean shared clone at `e6b0a9074d434ccc307badd312ae7379d1193fea`; `git status --porcelain` → 0 lines):

```
$ sha256sum corpus/knowledge/webdriver-bidi-runtime-round-32.md   # c10189069bdf9195bdf8f9b8876e5669e3f9b42382cc16ab795de0133db630c5  (211 lines)
$ sha256sum scripts/check-bidi-runtime.mjs                        # 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  (exit 0)
$ git -C lane diff --stat b7d16fb e6b0a90 -- <entry>             # empty: entry identical at baseline and freeze (exit 0)
```

Per-defect checks (full transcripts with exit codes in `evidence/checks.txt`, `checks2.txt`, `checks3.txt`):

| id | check | result |
|---|---|---|
| D3 | `grep -n '^\*\*D[0-9]' .ufo/waves/round-32/w1/CritC1Forgery.md` | `D1 :91`, `D2 :104`, `D3 :113`, `D4 :122`, `D5 :132` (fabricated `mined` row), `D6 :142` (no min population); exit 0 |
| D4 | `grep -n 'FIXTURE_SHA256\|FIXTURE_HEADER\|writeHead(404\|writeHead(200\|Every response carries' scripts/check-bidi-runtime.mjs` | `:120/:121/:125/:131/:132` — 404 branch has `content-type` + fixture header only; `cache-control` at `:132` only; exit 0 |
| D5 | entry `:196-200` | wave-2 correction already reads the binding as "does not prove that the receipt's runs were executed" |
| D6 | `file /usr/bin/chromium`; `strings … \| grep -E 'chromium-flags.conf\|XDG_CONFIG_HOME\|/usr/lib'` | ELF 64-bit LSB pie, 14,424 B, BuildID `b60b9805…`; three strings; exit 0 |
| D7 | `cat -n ~/.config/chromium-flags.conf` | five lines, incl. `--ozone-platform-hint=wayland`; `SentinelPerimeter.md:89-92` executed argv puts it second; exit 0 |
| D8 | `grep -n session_commands …/ScribeEntry/fetch-receipts.md` | **no match, exit 1**; `corpus/SOURCES.md:139` is the S125 row with decoded `7b40e94c…` |
| D9 | `curl -q -sS --proto =https https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` | 2026-10-26T18:24:43Z, HTTP 200, 4,235,856 B, sha256 `dc1077db…` (= S124); `id="command-session-subscribe"` `data-level="7.1.3.4"` "The session.subscribe Command"; exit 0 |
| D10 | `grep -o 'e\.[0-9]*"' run{1,2}/transcript.jsonl`; `sed -n '24p;26p;27p;33p'` | run1 `#t`→`…e.1` (seq 24), `#b`→`…e.6` (seq 26), pointer sequences seq 27 and 33; run2 same sharedId multiset and 3 `input.performActions`; exit 0 |
| D11 | `grep -n 'ws = new WebSocket' scripts/bidi-loopback-round32.mjs` | `:108` — the BiDi client is the Node script, not chromedriver (`:80` spawns it); exit 0 |
| D12 | `jq -c … measure/c1-distinct-at-0808688.json`; `git log --diff-filter=A --` that path; `git merge-base --is-ancestor 8fa57d2 e6b0a90` | `ok:true`, 16 distinct ids, 2 digests, `driverEqualsGate:false`; added in `8fa57d2`; ancestor check exit 0 |
| D13 | `sed -n '12p' run1/transcript.jsonl \| jq '.frame.params.response'` | `statusText:"OK"`, `protocol:"http/1.1"`, `headersSize:198`, `bodySize:703`, `bytesReceived:703`, `mimeType:"text/html"`, `fromCache:false`, `content` present; exit 0 |
| n1 | `sed -n '15,16p' run1/transcript.jsonl` | `script.evaluate {expression:"window.__ready", awaitPromise:true}` → `"settled"`; exit 0 |

Landing constraint (recorded, not acted on):

```
$ sed -n '29p;87p;90p' .ufo/waves/round-33/baseline/controls.mjs
const reset = () => { g('checkout', '-q', '--force', '--detach', BASELINE); ... };
  const entrySha = sha(readFileSync(join(LANE, 'corpus/knowledge/webdriver-bidi-runtime-round-32.md')));
  ... wlOk = ... && sha256(entryBuf) === "${entrySha}" ...            # exit 0
$ python3 -c "…c2-J3-whitelist.json results accepted…"                 # {'H0': True, 'H1': True, 'H2': True}
$ sed -n '341,353p' scripts/check-bidi-runtime.mjs                     # parseTable stops at first non-row line
```

Process hygiene: `pgrep -fa 'chromedriver|chromium'` → one line, `/usr/bin/earlyoom` (not mine); no browser
started; no network fetch other than the one W3C GET above; no tool installed or upgraded; scratch
`/fast/scratch/hyaku/tabi-r33/ScribeErrataB` removed after the receipts were copied.

## Deliverable paths

- `.ufo/waves/round-33/w1/ScribeErrataB/errata-B.md` — verdict, ledger of all twelve rows, the ready-to-append
  correction block (10 bullets, in paste order), per-defect evidence, landing constraint, out-of-scope flags.
- `.ufo/waves/round-33/w1/ScribeErrataB/errata-B.tsv` — machine-readable ledger (id, severity, stale line,
  disposition, bullet order, note).
- `.ufo/waves/round-33/w1/ScribeErrataB/evidence/checks.txt`, `checks2.txt`, `checks3.txt` — every command and its
  exit code as run.
- `.ufo/waves/round-33/w1/ScribeErrataB/evidence/fetch-receipts.txt` — URL, UTC, status, bytes, sha256 of the one
  fetch.

Out of scope, flagged: `D1` (material; `:41-42` still overstates `FIXTURE_SHA256`'s preimage — `:120` excludes
`FIXTURE_HEADER` at `:121`; bytes read, mutation probe not re-run) and `D2` (material; closed at entry
`:201-206`). No lane tracked file, index, jj state, fleet repo or sibling lane was touched; no commit was made
outside the scratch clone.
