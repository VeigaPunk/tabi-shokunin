# R58Sentinel — wave w1 seat report (round 58)

Seat: **R58Sentinel** — SECURITY review (read-only). Wave: round 58 **w1** (the only v1 wave).
Date: 2026-11-03. Lane: `tabi-shokunin`. Lane base rev `051f433dd49880d652407f1c02f8a15646602bbe`.
Host: linux 7.2.11-arch1-1 x64, node v24.21.0, `/usr/bin/chromium` = Chromium 155.0.8059.84 (Arch launcher
wrapper), curl 8.23.0, python3 3.14.

## Files written (absolute paths)

1. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-58/w1/R58Sentinel.md` — this report.
2. `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-58/sentinel/evidence/` — every receipt
   and every probe cited below (22 files; all `*.json` receipts parse — verified with `json.load`).

No other file was created or modified. **`claims.json` was READ ONLY** — no predicate, control, kill
rule, expected finding or counter byte was touched. **No mutating git or jj command was run anywhere**
— only `read`, `grep`, `ls`, `sha256sum`, `stat`, `ps`, `cmp`, `node`, `curl`, `python3` and `find`
(read-only). Nothing under `corpus/` was written; no live data pass was run; the only driver runs were
smoke runs into this seat's scratch. The fleet root `/home/vgpnk/Projects/shokunin`, every sibling lane
and the operator's own Chromium profile were read-only.

## Tooling

**No tool was installed or upgraded** (none was needed — every check used the host's existing node
24.21.0, curl 8.23.0, python3 3.14 and Chromium 155.0.8059.84). **No pacman transaction was run**;
pacman is paused host-wide and this seat honours the pause.

## Artefacts audited (the digests this report is about)

| Artefact | sha256 | Note |
|---|---|---|
| `scripts/chrome-cdp-loopback-round58.mjs` | `9935ed9862af0f5e7ff1d5400790ab9a14d6966e6f5cc713280af6108bd1d324` | 1903 lines; **matches the R58Runner's own `runner/driver-sha.txt` pin** |
| `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs` | `632e62e447bd66204c6db2bf03bb3897a99fcbd3c6503baa81d43794c41a4f52` | `--selftest` → **78/78 allPass**; `--path-selftest` of the runner → **19/19 allPass** |
| `.ufo/waves/round-58/scout/reopen-receipt-s153.json` | `253154feabdb534d1c04fbe5dbf94285243f921d65db0b1f62cf13716128d12c` | |
| `.ufo/waves/round-58/scout/reopen-receipt-s161.json` | `3f1d2f7b3ec0b8841892fa85e10f484bfd9252d668bb10656bcdf93e89c48948` | |
| `.ufo/waves/round-58/sources/browser_protocol.json` | `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | 1,423,170 B |
| `.ufo/waves/round-58/sources/uievents.html` | `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | 920,762 B |

Both artefacts were still being authored while this seat polled them; every conclusion below was
re-verified against the FINAL digests above (the runner's own `--path-selftest` and the counter's own
`--selftest` are green at those digests).

## Verdict summary

| # | Item | Verdict | Finding |
|---|---|---|---|
| 1 | r58 runner contract (perimeter, argv, egress, swallow toggle) | **PASS** | none |
| 2 | scout's fetches (R57-S3 final-host rule) | **PASS** | none |
| 3 | r58 counter (driver-by-sha only, no execution, no network fixture) | **PASS on 3 of 4 sub-checks** | **R58-S1 (MEDIUM)** |
| 4 | C2 synthetic-green (kill rule "green on anything but the committed receipt") | **ATTACK SUCCEEDED on one axis** | **R58-S1 (MEDIUM)** |

**R58-S1 is the one finding that must be adjudicated before the L1's data pass.** It is a
*counter-completeness* gap, not a claim gap: it cannot make a red claim green, but it can make a
**forged** receipt green where the frozen kill rule says the claim must die.

---

## 1. The r58 runner contract — PASS

**Delivered artefact:** `scripts/chrome-cdp-loopback-round58.mjs`, 1903 lines, sha256 `9935ed98…`
— the exact digest the R58Runner report pins in `runner/driver-sha.txt`.

**Probe calibration:** every probe below was calibrated on the frozen r57 precedent first
(`evidence/probe-calibration-r57-precedent.json`): on r57 the four swallow-specific checks FAIL
(r57 has no swallow) and every perimeter check PASSES — so the probes are not vacuous and the
r58 result is a real difference, not a probe artifact.

### 1.1 Loopback-only perimeter — MET, from the bytes and from a live run

| Contract element | Delivered | Evidence |
|---|---|---|
| `--remote-debugging-address=127.0.0.1` | present, `:1050` | `evidence/runner-perimeter-static-audit.json` |
| fixture server bound to `127.0.0.1` only | `listen(0,'127.0.0.1',…)`, `:916` | same |
| throwaway `--user-data-dir` under the scratch (`profile-<12hex>`) | `:1051`, r56/r57 write-probe + 0700 + empty-check inherited | same |
| throwaway `HOME` + `XDG_CONFIG_HOME` under the scratch | `:806`, `:807`, env at `:1069` | same |
| `--disable-extensions` | `:1059` | same |
| keyed PID-group kill, **never** `pkill -f` | `kill(-child.pid)` + `/proc` sweep on `[launchToken, profileDir, runCrashDb]`; the only `pkill` hits are the two "never pkill -f" comments | same |
| zero-survivor closure probes + port probes | `postKillSweepCount 0`, `survivors []`, `portProbes {fixture:'closed', devtools:'closed'}` | live receipt + `evidence/live-perimeter-probe.json` |
| argv recorded shape-only | `:1065` redacts `/home/<user>/` → `__USER_HOME__`; the live receipt's argv carries **no** `/home/...` and **no** `~` | `evidence/smoke-receipt-scratch.json` |
| **no launch flag removed or added vs the r57 precedent** | the 13-flag set is **identical** to r57 (`removed: []`, `added: []`) — a removed `--disable-background-networking` would have re-opened the browser's background calls; none was | same |
| no external URL anywhere in the driver | clean (the only URLs are `http://127.0.0.1:` for the fixture and the CDP origin) | same |

**Live run on the delivered bytes** (`evidence/smoke-receipt-scratch.json`, produced by
`evidence/probe-live-perimeter-probe.mjs` into this seat's scratch): exit 0, `predicate true`,
schema `tabi-chrome-cdp-r58`, nonce `tabi-r58-4016af42c32a`, `driverSha256` = the pinned digest,
`Chromium 155.0.8059.84 Arch Linux`, teardown `postKillSweepCount 0 / survivors [] /
portProbes {fixture:'closed', devtools:'closed'}`. The background-services artefacts landed
**inside the throwaway HOME**
(`<scratch>/home-<token>/.config/chromium/Crash Reports`), and the operator's real
`~/.config/chromium` was **not** written by the launch — the only three files that moved there
(`Default/GPUCache/data_1`, `Default/DawnGraphiteCache/data_1`, `Default/DawnWebGPUCache/data_1`)
were **attributed to the operator's own live browser** (pid 1162567), which holds that file open:
a paired A/B test (`evidence/probe-live-perimeter-probe.mjs` + the attribution script) showed the
file moving in a 120 s window with **no launch** and **not** moving in the window that **contained**
an r58 driver launch. The throwaway profile's own GPU cache is a different file with a different
digest (`902f30c1…` vs `3707c2f0…`). **This is not an r58 defect** — it is the operator's browser
and is reported for completeness only.

### 1.2 The NEW swallow listener and `__setSwallow` introduce no new egress — MET

* The fixture's inline JS references **no** external URL (no `http://`, `https://`, `<link>`,
  `<img>`, `<script src`).
* The only new page-side primitive is `e.preventDefault()` inside a capture-phase keydown listener;
  it cannot egress.
* The only new driver-side primitive is `window.__setSwallow(on, keys)` — a page-global setter, no
  I/O.
* The r58 driver's `fetch(`/`net.connect`/`WebSocket` inventory is **unchanged** from r57: the only
  `net.connect` is the closure probe to `127.0.0.1`.

### 1.3 The swallow toggle: no URL/query parameter may set `__swallowOn` — ATTACKED CONCRETELY, HOLDING

This is the item the seat contract names explicitly, so it was attacked two ways.

**(a) Static.** The shipped fixture block is `chrome-cdp-loopback-round58.mjs:658–711`. In it:

* `window.__swallowOn = false;` (`:667`) and `window.__swallowSet = [];` (`:668`) are the ONLY
  assignments, and both are constants — no URL, query, hash, cookie, `window.name`,
  `localStorage`, `sessionStorage` or `location` member is read anywhere in the fixture
  (`fixture-js-no-location-read`: clean; `swallow-state-not-url-derived`: clean).
* The **line that guarantees it** is the runner's own `fixtureContract()` guard,
  `chrome-cdp-loopback-round58.mjs:221–223`:

  ```js
  const urlToggles = ['location', 'URLSearchParams', 'document.cookie', 'window.name',
                      'localStorage', 'sessionStorage'].filter((needle) => s.includes(needle));
  const external = ['http://', 'https://', '<link', '<img', '<script src']
                    .filter((needle) => s.includes(needle));
  ```

  and `:244` `res.noUrlToggle = urlToggles.length === 0 && external.length === 0;` feeding
  `res.missing` (`:258–259`) and `res.ok` (`:262`). **The live path refuses to spawn a browser
  against a fixture that carries any such channel** — so the guarantee is enforced at launch, not
  merely asserted in a comment.
* Additionally, `swallowApi` (`:237–239`) requires the setter to be exactly
  `window.__setSwallow = function` with `window.__swallowOn = on === true` and
  `window.__swallowSet = Array.isArray(keys) ? keys.slice() : []` — the gate is **cleared then
  set**, so it is idempotent and cannot accumulate keys.

**(b) Dynamic (`evidence/probe-query-toggle-attack.mjs` → `evidence/query-toggle-attack-r58.json`).**
The probe extracts the runner's **own** `FIXTURE_HTML`, serves it from a loopback-only server in
scratch, loads it in Chromium 155 headless over loopback CDP (throwaway profile, throwaway
HOME/XDG under scratch, `--disable-extensions`, keyed PID-group kill, zero-survivor closure + port
probe), and drives **nine** hostile URLs without the driver ever calling `__setSwallow`:

```
/form                            -> __swallowOn undefined, __swallowSet undefined
/form?swallow=1                  -> __swallowOn undefined, __swallowSet undefined
/form?__swallowOn=true           -> undefined / undefined
/form?swallowOn=1&swallowSet=Enter -> undefined / undefined
/form?swallowSet=Backspace       -> undefined / undefined
/form?swallow=true&keys=Enter    -> undefined / undefined
/form?swallow=1#swallow          -> undefined / undefined
/form?swallow%3D1                -> undefined / undefined
/form?S=1&swallow=1              -> undefined / undefined
```

In **every** leg `location.search` was visible to the page (`?swallow=1` etc. — the probe read it
back) and **no** keydown was swallowed without a driver `__setSwallow` call. The **control leg**
then called `window.__setSwallow(true,['Enter'])` explicitly and the recorder observed
`defaultPrevented: true` — which is simultaneously the proof that the swallow works and the
**empirical** proof of the listener-registration order (the recorder can only see the flag if the
swallower ran first). Zero findings, zero survivors, fixture port closed.

**(c) Registration order — the r58 delta's own correctness hinge.** The claim says the swallower must
be registered **before** the recorders on the same target and phase for capture order to make its
`preventDefault()` visible. The bytes satisfy it: the fixture's keydown listeners are registered at
`:672` (swallower), `:676` (r56 `__keylog` recorder), `:701` (r57 `__keylogFull` recorder) — the
swallower is **first**. The runner enforces this itself
(`fixtureContract.swallowRegisteredBeforeRecorder`, `:242`, comparing the index of
`window.__swallowSet.indexOf(e.key)` against the index of `window.__keylog = []`), and the dynamic
control leg confirms it behaviourally. The recorder gains exactly the two declared additive fields
(`cancelable: e.cancelable === true`, `defaultPrevented: e.defaultPrevented === true`) in **both**
recorders (`:678`, `:693`) — the r57 field set is otherwise unchanged.

### 1.4 Swallow witnesses are page-side, not driver-side — MET in the runner

Every swallow witness in the runner is read back from the page or the server, never assumed:

* `cancelable` / `defaultPrevented` come from the **page's own** keylog entries
  (`bsRec.entry.defaultPrevented`, `:1503`; `:1524`; the chord's `enterKeylogEntry`, `:1556`).
* The gate state is **read back from the page** after every setter call
  (`readSwallowGate()` at `:1259`, used by `setSwallow()` at `:1260`), so the receipt carries the
  page's own `__swallowOn`/`__swallowSet`.
* The one-submission witness is the **fixture server's own request log**
  (`form.serverRequests = serverLog.map(...)`, `:1693`), and the predicate requires exactly one
  `/echo` carrying `field` and `field2` and **not** `field3` (`:1804–1809`).

---

## 2. The scout's fetches (R57-S3 final-host rule) — PASS, no HIGH finding

**Rule applied (R57-S3, binding):** every fetch records `num_redirects`, `url_effective`, content
type and size; the **final host after redirects must equal the cited source's host**, or the fetch
is refused.

`evidence/probe-check-scout-receipts.mjs` → `evidence/scout-fetch-guard-audit.json` (0 findings):

| Receipt | `num_redirects` | `url_effective` | content-type | size | cited host | **final host** |
|---|---|---|---|---|---|---|
| `reopen-receipt-s153.json` | `0` | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` | `text/plain; charset=utf-8` | 1,423,170 | `raw.githubusercontent.com` | **`raw.githubusercontent.com` — MATCH** |
| `reopen-receipt-s161.json` | `0` | `https://www.w3.org/TR/uievents/` | `text/html; charset=utf-8` | 920,762 | `www.w3.org` | **`www.w3.org` — MATCH** |

**No fetch whose final host differs from the cited source's host exists** → **no HIGH finding** on the
r58 scout's fetches. The R57-S3 gap (the r57 quarantine seats never re-checked the *final* host) is
**not** repeated here: the scout records the four guard fields at the top level of each receipt
(`fetch_guard`) and states `host_match`/`refused` explicitly.

**Independent corroboration (this seat fetched both sources itself, under the same guard, into
scratch):**

| Source | this seat's fetch | staged copy | r57 staged copy | registry anchor |
|---|---|---|---|---|
| S153 | `d6737c31…`, 1,423,170 B, 0 redirects | `d6737c31…` **identical** | `d6737c31…` **identical** (`cmp`: no difference) | `d6737c31…` — **@master UNMOVED** |
| S161 | `8ded5eaf…`, 920,762 B, 0 redirects | `8ded5eaf…` **identical** | `8ded5eaf…` **identical** (`cmp`: no difference) | `8ded5eaf…` — **byte-identical** |

The staged bytes are byte-identical to this seat's independent fetch (`cmp` clean on both), and the
quotes are byte-exact in them: S153's `held_quote` occurs 5× file-wide (1 inside the
`dispatchKeyEvent` block at raw line 14323 — exactly the r57 anchor's hit count), S161's
`held_quote` occurs 1× (raw line 5680) and both S161 secondary quotes occur 1× each. `held_quote ==
located_quote` on both rows, and `verdict: holds` on both.

**One honest note for the L1 (not a finding):** the S161 `defaultPrevented` and `preventDefault()`
"secondary quotes" are **cross-reference items, not definitions** — UI Events lists the members and
links out to `dom.spec.whatwg.org`. The scout says so explicitly in its own receipt
(`definition_locus: "EXTERNAL: …"`). The *primary* S161 anchor is the normative
§4.3.4 "Default actions and cancelable keyboard events" sentence, which **is** in the cited bytes.
The C2 claim's grounding sentence ("the cancelable/default-action ground") is satisfied by the
primary anchor; the `defaultPrevented` **attribute definition** itself lives in the DOM spec, not in
S161. The L1's knowledge note should not assert that S161 defines `defaultPrevented`.

---

## 3. The r58 counter — PASS on 3 of 4 sub-checks; **R58-S1 (MEDIUM)** on the fourth

### 3.1 It reads the driver only through the pinned sha and NEVER executes it — PASS

* **Static:** the counter imports only `node:fs`, `node:path`, `node:crypto`, `node:url` — **no
  `child_process`**, no `spawn`/`exec`/`fork`, no dynamic `import()` of the driver. The driver is
  read with `fs.readFileSync(driverPath)` (`:745`) and hashed (`:748`); the pin
  `--expect-driver-sha256` is honoured (`:750`). The counter **writes nothing** — no
  `writeFileSync`/`mkdirSync`/`rmSync` anywhere.
* **Runtime (not just static):** `evidence/probe-counter-driver-exec-probe.mjs` →
  `evidence/counter-driver-exec-r58.json`. The probe hands the counter a **trap driver** — a valid
  ES module whose top level writes a marker file and prints — and a receipt whose `driverSha256`
  is wrong. Result: the marker file **does not exist** (the driver was read as bytes and never
  executed), the counter **refused** with `driver-sha-mismatch` among its findings and
  `predicate false`.
* **Cross-refusal, committed bytes:** the r58 counter on the **committed r57 receipt**
  (`corpus/evidence/round57/chromium-modifier-chords/receipt.json`) → exit 1, `schema-wrong`
  **first**, `nonce-shape` second, `couldNotEvaluate [{check:'modifier+swallow-domain-derivation',
  code:'nonce-unusable'}]`. The seat's own receipt
  `.ufo/waves/round-58/measure/c2-r58counter-refuses-r57.json` records the same shape
  (`schemaWrongFirst: true`, `exitCode: 1`). The **r57-counter-refuses-r58** direction is the L1's
  data-pass step and was **not** fabricated here.

### 3.2 The fixtures dir ships no network fixture — PASS

`evidence/runner-perimeter-static-audit.json`: the r58 fixtures dir holds **169 files**
(153 `.json`, 14 `.png`, 1 `.mjs`, 1 `.bin`). The single `.mjs` is the r57-precedent
`driver-stub.mjs` — a pure `export const` with **no** `fetch`/`node:http`/`node:net`/
`createServer`/`urllib`/socket primitive. No fixture file carries an **external** URL (the only URL
anywhere in the dir is a loopback `http://127.0.0.1:52741` origin string inside a receipt fixture).
No copy of the real driver ships in the fixtures dir.

### 3.3 The six new swallow checks are implemented with page-side re-derivation — PASS

All six declared ids exist and are exercised: `swallow-control-inserted-wrong`,
`swallow-defaultprevented-missing`, `swallow-value-changed`, `swallow-enter-chord-leak`,
`swallow-plan-mismatch`, `swallow-recorder-fields-missing`. The expected plan is re-derived from the
**receipt's own nonce** (`deriveSwallowKeydowns(nonceStr, f3Target)`, `:506`), not read from the
recorded block. The counter's own selftest is **78/78 allPass** and its id-coverage block asserts
every one of the 49 ids is exercised by at least one fixture.

### 3.4 **R58-S1 — MEDIUM — the swallow witness is read from the RECORDED BLOCK, and the PAGE keylog's `cancelable`/`defaultPrevented` values are never compared**

**This is the one finding that must be adjudicated.**

**The gap, in the counter's own words.** The counter's `expected` loop (`:605–637`) selects the
witness entry as `const found = own.length ? own : any;` (`:618`) where `own` = the entries inside
the **driver-recorded block** (`swallowLeg.*.keylogEntry`, i.e. `entriesOfBlock(exp.block)`) and
`any` = the same pool filtered — and the pool (`:586–588`) contains the **page keylog**
(`journey.form.pageKeylog`) as well. The comparison at `:634`
(`e.defaultPrevented !== exp.dp`) therefore runs on the **block's** copy whenever the block carries
one. The **page keylog's own `defaultPrevented`/`cancelable` values are never compared against the
derived plan** — the page-keylog cross-check (`:1120–1160`) compares event type, key, code, keyCode,
modifiers, targetId and the four modifier booleans, but **not** `cancelable` and **not**
`defaultPrevented`.

**Exploit path (measured — `evidence/swallow-flag-source-boundary.json`,
`evidence/swallow-witness-source.json`, `evidence/page-vs-recorded-attack.json`).** Starting from
the genuine live receipt (predicate true, 0 findings) and forging **only** the receipt's
`journey.form.pageKeylog` — the page's own full record — the counter stays **GREEN** in three
independent cases:

| Leg | Forgery | Counter verdict | Finding emitted |
|---|---|---|---|
| **B2 / Q2** | the page keylog's swallowed **Backspace** entry says `defaultPrevented: false` (the page says the keystroke was **not** prevented) while the recorded block says `true` | **predicate TRUE** | **none** |
| **B1** | the page keylog's swallowed Backspace entry says `cancelable: false` while the block says `true` | **predicate TRUE** | **none** |
| **B3** | the page keylog's **control** digit (gate OFF, which must be `defaultPrevented: false`) says `true` while the block says `false` | **predicate TRUE** | **none** |

The **control** leg Q1 proves the counter *does* honour the block: setting the **block's**
`defaultPrevented` to `false` yields `swallow-defaultprevented-missing` and a red verdict. So the
block is the authority and the page keylog is not — exactly inverted from what a "page-side witness"
should mean.

**The boundary is narrow, and I measured it.** The counter **does** catch:

* a forged block entry whose **key** differs from the plan (B4 → `swallow-plan-mismatch`);
* a **missing** page-keylog entry (B5, F2/F3/F4 → `keylog-entry-mismatch`, because the page keylog's
  keydown **count** is cross-checked against the derived plan);
* a **second** `/echo` request (G4 → `swallow-enter-chord-leak`);
* a **blanked** `field3Value`/`field3Final` (G5 → `field3-not-empty`);
* a block entry whose `cancelable`/`defaultPrevented` **fields are absent** (Q3 →
  `swallow-recorder-fields-missing`) — i.e. the *presence* of the two fields is enforced on the page
  keylog, only their **values** are not.

So the gap is exactly: **the page keylog's `cancelable`/`defaultPrevented` VALUES are unverified.**

**Impact.** The frozen C2 kill rule says: *"The claim dies if … a swallow witness rests on driver-side
state instead of page/server state."* A receipt whose **page-side record contradicts the swallow
witness** — the page's own keylog says the Backspace was **not** prevented, while the driver's
recorded block says it was — is scored **green**. The counter's own header promises the opposite
(*"the r58 generation — whose preventDefault-swallow domain is witnessed end to end … AND …
`journey.form.pageKeylog` is cross-checked ENTRY BY ENTRY against the sequence this counter
RE-DERIVES from the receipt's own nonce (the r52..r58 defence)"*). Entry-by-entry cross-checking
that skips the two fields the whole r58 claim turns on is the defect.

**Blast radius today: ZERO.** The receipt the L1 will commit comes from the L1's own live run of the
frozen driver; my live smoke receipt is **green and self-consistent** (page keylog and block agree on
every flag). Nothing currently scored is wrong. The gap is in the **guard**, not in this round's
data — the same shape as R57-S3 in r57, and it must not survive into the data pass.

**Smallest remediation (one comparison, in the counter's own existing loop).** In the `expected`
loop at `:605–637`, when the witness entry is taken from the **page keylog**, compare its two
values against the derived plan — the same way the block's values are compared at `:632–635`:

```js
// after the existing `e.defaultPrevented !== exp.dp` check, add:
const pageTwin = pageKd.find((x) => x && x.type === 'keyDown'
  && x.key === exp.key && x.code === exp.code && x.keyCode === exp.keyCode);
if (pageTwin) {
  if (pageTwin.cancelable !== true && exp.dp === true)
    add('swallow-defaultprevented-missing', exp.where + ' key ' + exp.key + ' page keylog cancelable=false');
  if (typeof pageTwin.defaultPrevented === 'boolean' && pageTwin.defaultPrevented !== exp.dp)
    add('swallow-defaultprevented-missing', exp.where + ' key ' + exp.key
      + ' PAGE keylog defaultPrevented=' + pageTwin.defaultPrevented + ' != ' + exp.dp);
}
```

Roughly 8 lines, **no change to any predicate, no change to the expected finding set on a
self-consistent receipt** (the page twin and the block agree there), and it can only turn a green
verdict **red** — never the reverse. **Pre-freeze is the right time**, because the counter's digest
is what the L1's `--expect-driver-sha256`/cross-refusal receipts pin
(`measure/c2-r58counter-refuses-r57.json` already records the counter's own sha256
`632e62e4…`; changing the counter changes it again).

**Alternative, if the L1 prefers not to re-digest the counter:** the equivalent guard can be added
to the **runner** instead — have the driver assert, before it writes the receipt, that the page
keylog's `cancelable`/`defaultPrevented` for each swallow-leg keystroke equals the block's copy,
and fail the run on a mismatch. That is a driver-side change, which **also** changes the driver
digest and its pin, so it is not cheaper.

---

## 4. Other checks run (read-only, no finding)

* **C2 end-to-end on the delivered bytes:** the r58 counter scores my own live smoke receipt
  **green** — `predicate true`, `findingCount 0`, `findings []`, `couldNotEvaluate []` — with
  `--expect-driver-sha256 9935ed98…`. The C2 pipeline (driver → receipt → counter) is coherent
  end to end at the frozen digests.
* **The runner's own `--path-selftest` is green (19/19)** and the counter's own `--selftest` is
  green (78/78) at the digests this report audits.
* **The counter never executes the driver and never writes** — both verified statically and at
  runtime (§3.1).

---

## 5. Hygiene

* **No process of this seat survives.** Every browser this seat launched (the live perimeter probe,
  the query-toggle attack's two runs, the GPUCache attribution run) was killed by its own keyed
  PID-group teardown; the probe's independent `/proc` sweep for this seat's scratch path returns
  **0** survivors after each run, and both fixture ports and the DevTools ports refuse a connect
  (`teardown.survivors: []`, `teardown.fixturePortProbe: "closed"` in every probe receipt).
* **The operator's live Chromium (pid 1162567) was never touched**, never swept and never killed;
  it is the writer of the three operator-profile GPU cache files (attribution measured, §1.1).
* **Scratch** `/fast/scratch/hyaku/tabi-r58/R58Sentinel/` is removed at exit; every artefact this
  report cites was copied into `.ufo/waves/round-58/sentinel/evidence/` **first**. `/tmp` holds
  nothing from this seat; **no file authored by this seat hardcodes `/tmp`** (the probe scripts take
  their scratch root as an argument or from `R58_SENTINEL_SCRATCH`).
* The lane's `git status` shows only the expected untracked `.ufo/waves/round-58/` tree; **no
  fetched source bytes and no receipt of mine is staged as claim data** — the smoke receipt in
  `sentinel/evidence/` is explicitly named `smoke-receipt-scratch.json` and lives outside
  `corpus/`.
* **No tool was installed; no pacman transaction was run.**

## 6. Recommended action, in order

1. **R58-S1 (medium) — before the L1's data pass.** Close the counter's page-keylog flag gap
   (§3.4): compare the **page keylog's** `cancelable`/`defaultPrevented` for each swallow-leg
   keystroke against the derived plan, using the existing `expected` loop. ~8 lines, pre-freeze
   (the counter's digest is pinned in `measure/c2-r58counter-refuses-r57.json`). It can only turn
   green red, never red green. **If the L1 rules this out of scope, the C2 kill rule's clause "a
   swallow witness rests on driver-side state instead of page/server state" must be recorded as
   waived with that reason** — it is not satisfied as written.
2. **No other action required.** The runner perimeter, the swallow-toggle guarantee, the scout's
   fetch posture (R57-S3) and the counter's driver-binding/no-network-fixture properties all hold
   at the digests this report audits.
3. **Informational for the L1's knowledge note:** the S161 secondary quotes are cross-reference
   items, not definitions — do not assert that S161 defines `defaultPrevented` (§2).
