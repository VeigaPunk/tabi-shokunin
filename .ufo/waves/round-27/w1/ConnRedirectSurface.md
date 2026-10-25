# ConnRedirectSurface — Within-Lane Consistency & Redirect Surface Synthesis

Seat: `TabiR27.ConnRedirectSurface` (peer id `ConnRedirectSurface-2`, leaf member, UFO-FSD connector).  
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.  
Report path: `.ufo/waves/round-27/w1/ConnRedirectSurface.md`.  
Lane baseline: `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (branch `master`).  
Lane tip observed: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (commit count: 10 commits past baseline).  
Read-only inspection; no tracked files modified.

---

## 1. Declared Axes (Godspeed & Round Context)

Values observed from `.ufo/waves/round-27/claims.json:10-18` (command: `jq -r '.axisScoresAtRoundStart' .ufo/waves/round-27/claims.json`):

| Axis | Score at Round Start | Status |
|---|---|---|
| **depth** | 8 | Lowest non-retired tier (tie); targeted by C2 (S106 evidence gate) |
| **coverage** | 9 | Targeted by C3 (S107 RFC 9110 redirect semantics admission) |
| **operability** | 8 | Lowest non-retired tier (tie) |
| **freshness** | 8 | Lowest non-retired tier (tie) |
| **calibration** | 9 | Targeted by C1 (m1 self-assessment extended to LOG.md) |
| **adjacency** | 8 | Lowest non-retired tier (tie) |

Target axis for connector synthesis: **depth** (improves protocol arbitration and journey driver invariants without harming any other axis).

---

## 2. Evidence: Exact Grep Pipeline & Lane Redirect Inventory

### 2.1 Exact Command & Output (First 40 Lines)

Executed command:
```bash
grep -ri 'redirect' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/ /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/README.md /home/vgpnk/Projects/shokunin/tabi-shokunin/SKILL.md | head -40
```

Verbatim output (40 lines):
```text
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/multi-step-journey.md:6. Real-site journeys — third-party JS, redirects, POST forms, CSRF-checked
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:→ `/confirm.html?…` **form_submit**. The redirect is invisible here (the entry
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:is the final URL — the redirect exists only in the network slice, §6 D5).
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:redirect successor share one `requestId`, hop 1 carrying
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:`redirectFrom {status:302, url:/go, encodedDataLength:139}` (run1/journey.json).
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:| `/go` → `/async.html` | 1,522 | 139 + 187 | 187 | 1,709 | 1,522 | 1,822 | 1,522 | redirect chain |
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:bytes of a redirect are **not** counted in `finEnc` (139 excluded; the
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:`redirectFrom.encodedDataLength=139` field records them). For cache-served
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:**D5 — the redirect.** `/go` → 302 → `/async.html`: the network slice shows
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:`redirectFrom` set); URL read-back, history (`link`) and the DOM only ever show
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:redirect"** (plus the server log line `GET /go … 302`); URL read-back is the
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:   (redirect hop-1 headers excluded) — run it before quoting any byte claim;
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/network-evidence-rung.md:   stands); real-site journeys (third-party JS, POST, redirects with bodies)
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:<!-- corpus entry — tabi-shokunin round 6 (2026-10-14), lane B6-1 (plan: plans/round-6.plan.md §Branch L; fixture seat = round-5 design §4 "external-class fixture v2", seat TABI-R5-4, unlanded by round 5 because the stop rule gated it — plans/round-5-record-draft.md:236). Method: a lane-authored loopback fixture (two ThreadingHTTPServer origins on 127.0.0.1:19541/19543; a CDP journey runner on 19542 driving headless chromium 152.0.7977.82) whose redirect chain and rate/ToS-shaped endpoints are instruments; 10 driver runs (2 cold chain runs byte-compared, 5 stop-cell runs, 2 headers-arm A/B runs, 1 retained misfire); a stop-and-report predicate fires on the firs…
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:# External-class fixture v2 — redirect chain + rate/ToS-shaped instruments (loopback only)
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:- **E1 — the redirect chain.** 302 → 303 → 307, a cross-path hop
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:<p><a id="chain-link" href="/chain/start">start the redirect chain</a></p>
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:    def _redirect(self, code, location):
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(302, "/chain/hop1")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(302, "/chain/same-hop1")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(303, "/chain/same-hop2")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(307, "/chain/same-landed.html")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(303, "/deep/path/hop2")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(307, HOP or "/chain/landed.html")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(307, "/m/echo")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:            return self._redirect(307, "/m/echo")
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:## 4. E1 measured — the redirect chain across three layers
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:`redirectResponse` — i.e. hops are events, not separate request entries.
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:| hop | wire (own server log) | CDP `…redirectResponse.status` | CDP wire status line | client-visible |
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:| 3 | `A GET /deep/path/hop2` → 307, `Location: http://127.0.0.1:19543/chain/landed.html` (origin hop) | 303 | `HTTP/1.0 307 Temporary Redirect` | — |
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:  `302 Found`, `303 See Other`, `307 Temporary Redirect`; B: `200 OK`); log pins
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:- **Client** — `PerformanceNavigationTiming.redirectCount` = **0** for the
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:  differs. `[inference, strong: the spec zeroes redirectCount for cross-origin
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:  `POST /m/307` → `redirected: true`, `finalUrl = /m/echo`, response
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:- **R2 — `redirectCount` is a same-origin-only witness.** 3 for the 3-hop
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:  *Falsifier:* a cross-origin chain whose `redirectCount` equals its hop count.
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:  `redirected: true`. *Falsifier:* a 307 leg whose method degrades to GET.
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:- **U1.** Whether `redirectCount = 0` on a cross-origin chain generalizes — one
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/external-class-fixture-v2.md:  scope** (the assignment names the redirect chain, 429/`Retry-After`, robots and
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/packet-readiness-r7.md:| **POST forms, redirects with bodies, CSRF-checked submits untested by rule** | **NARROWED at round 6.** Redirects-with-bodies are now measured on loopback: 302→303→307 chain incl. cross-path hop and origin change `127.0.0.1:19541`→`19543`, plus a POST arm (`/m/307`), all three layers reconciled (`external-class-fixture-v2.md` §4). **Still open:** POST form submit with a request body, a CSRF-shaped token minted/consumed once, and the non-idempotent replay contract — the round-6 L1 matrix (the state-changing step) did not land (round-6 record draft §3 L1a, E3), and round-7's plan makes it its carried debt | v2 §4; plan r7 §Branch L; round-6 draft |
```

### 2.2 Complete Lane Surface Inventory on Redirects

Inspection of the lane (`git grep -in 'redirect'`) reveals three distinct surfaces:

1. **Journey Notes & Debt Ledgers ("Redirects Untested by Rule"):**
   - `corpus/knowledge/multi-step-journey.md:287-289`: Item 6 of Frontier/Unknowns:
     > "Real-site journeys — third-party JS, redirects, POST forms, CSRF-checked submits — untested by rule this round" (16 words).
   - `corpus/knowledge/network-evidence-rung.md:435-436`: Item 8 of Unknowns:
     > "real-site journeys (third-party JS, POST, redirects with bodies) untested by rule this round." (13 words).
   - `corpus/knowledge/arc-synthesis.md:125`: §4.2:
     > "Real-site classes untested by rule: third-party JS, POST forms, redirects with bodies, CSRF-checked submits" (14 words).
   - `corpus/knowledge/arc-synthesis.md:129`: §4.3:
     > "zero real-site datum, the U1 absence, no POST/CSRF/redirect classes" (9 words).
   - `corpus/knowledge/closeout-r11.md:77`: §1.3:
     > "Real-site classes untested by rule: third-party JS, POST forms, redirects with bodies, CSRF-checked submits" (14 words).
   - `corpus/knowledge/closeout-r11.md:151`: Debt item R3:
     > "Zero real-site datum; U1 rate/ToS absence; real-site POST/redirect/CSRF classes; the handshake" (11 words).
   - `corpus/knowledge/packet-readiness-r7.md:64`: Table row:
     > "POST forms, redirects with bodies, CSRF-checked submits untested by rule" (10 words) — notes that loopback redirects were narrowed at round 6.
   - `corpus/README.md:42-43`: Historical Round 3 Frontier:
     > "Real-site journeys + evidence durability — third-party JS, redirects, POST forms, CSRF-checked submits untested by rule" (16 words).
   - `corpus/README.md:183`: Active Fleet Round 1 Frontier row:
     > "third-party JS, redirects, POST and CSRF-checked submits remain untested by rule." (11 words).

2. **Loopback Measured Redirects (Wire, CDP, Client Layers, Replay Matrix):**
   - `corpus/knowledge/network-evidence-rung.md:285-291` (Case D5):
     - Single CDP `requestId` covers `/go` (302) and `/async.html` (200).
     - Hop-1 header text (139 B) excluded from `finEnc`: `finEnc = last-hop header text + body bytes`.
     - URL read-back / DOM only surface the terminus (`/async.html`).
     - Quote: "the navigation went through a redirect" (`network-evidence-rung.md:285`, 6 words). Winner: network slice + server log.
   - `corpus/knowledge/external-class-fixture-v2.md:43-46, 373-404, 480-489` (Cell E1):
     - 3-hop loopback chain: 302 → 303 → 307 across origins (`127.0.0.1:19541` → `19543`).
     - Reconciled all 3 layers: wire server logs see every leg; CDP sees hop events (`redirectResponse` + `responseReceivedExtraInfo`); client `responseReceived` sees only the final 200.
     - Quote: "redirectCount is a same-origin-only witness" (`external-class-fixture-v2.md:484`, 5 words) (Rule R2: 0 for cross-origin chain vs 3 for same-origin chain).
     - 307 method and body preservation evidenced on POST `/m/307` with 8 B body arriving intact at `/m/echo`.
   - `corpus/knowledge/state-changing-matrix-r9.md:14, 162-177, 222` (Replay matrix):
     - 303 follow-up turns into GET (`/submit` POST → 303 → `/result` GET); terminus replay is safe.
     - 307 replay preserves POST and 8 B body (`POST /echo307` → 307 → `/echo307-target` POST 8 B); touches no state.
     - Quote: "Redirect code shapes the replay: 303 turns the follow-up into a GET" (`state-changing-matrix-r9.md:162-177`, 11 words).
     - Quote: "307 preserves POST + body and touches no state." (`state-changing-matrix-r9.md:162-177`, 9 words).
   - `SKILL.md:327, 860-864, 985-987, 1117-1118, 1132-1134`:
     - Distills the loopback invariants:
       - Quote: "the wire carries every hop while the client surfaces only the final one" (`SKILL.md:327`, 13 words).
       - Quote: "307 preserves method and body end-to-end" (`SKILL.md:327`, 6 words).
       - Quote: "Redirect-after-POST: the client-side status is the terminus (200)" (`SKILL.md:985`, 7 words).
       - Quote: "303 turns the follow-up into a GET" (`SKILL.md:1132`, 7 words).

3. **New Admitted Entry (Claim C3, Round 27):**
   - `corpus/knowledge/redirect-and-retry-after-semantics.md` (citing registry row S107, RFC 9110 plain text 502,941 B, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; commands: `wc -c .ufo/waves/round-27/assimilation/rfc9110.txt` -> 502941, `sha256sum .ufo/waves/round-27/assimilation/rfc9110.txt`).

---

## 3. Comparative Analysis: Contradiction vs Extension

### 3.1 Side-by-Side Comparison of Pre-Existing Statements and the New Delta

| Aspect | Pre-Existing Lane Statement | New Entry Statement (`redirect-and-retry-after-semantics.md`) | Delta & Relationship |
|---|---|---|---|
| **Real-Site Status** | `multi-step-journey.md:287-289`: "Real-site journeys — third-party JS, redirects, POST forms, CSRF-checked submits — untested by rule this round" (16 words) | Line 8: "Documented upstream, not measured here." (4 words); Line 54: "no runtime capture this round; the entry is spec-ground only." (10 words) | **Merely extends.** Does not claim live measurement. Narrows the gap from unclassified/untested to "documented upstream semantics held; runtime measurement open." |
| **303 See Other** | `SKILL.md:987`: "303 changes to GET" (4 words); `SKILL.md:1132`: "303 turns the follow-up into a GET" (7 words) | Lines 13-15: "The 303 (See Other) status code indicates that the server is redirecting the user agent to a different resource" (19 words); Lines 15-16: "can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" (16 words) | **Merely extends.** Grounds the empirical loopback observation (POST → GET) in RFC 9110 §15.4.4 normative text, adding the documented HEAD retrieval option. |
| **307 Temporary Redirect** | `SKILL.md:986-987`: "307 preserves method and body end-to-end (8 B delivered)" (9 words); `SKILL.md:327`: "307 preserves method and body end-to-end" (6 words) | Lines 27-28: "the user agent MUST NOT change the request method if it performs an automatic redirection to that URI" (18 words) | **Merely extends.** Provides the exact upstream RFC 9110 §15.4.8 normative constraint explaining the loopback measurement. |
| **301 / 302 Method Rewrite** | Loopback fixture v2 measured 302 solely for GET navigation (`/chain/start` → `/chain/hop1`). The lane had never tested POST to 301/302. | Lines 20-22: "a user agent MAY change the request method from POST to GET for the subsequent request." (16 words) | **Merely extends.** Introduces upstream specification warning (RFC 9110 §15.4.2/§15.4.3 note) that 301/302 can silently rewrite POST to GET. |
| **308 Permanent Redirect** | Unmeasured in prior rounds; unmentioned in SKILL.md. | Line 38: "INFERENCE, not a located normative sentence" (5 words); §15.4.9 has no status-specific MUST NOT clause in these bytes. | **Merely extends.** Introduces 308 status code, keeping inference honest and unconfused with direct normative quotes until re-anchored in RFC 7538. |
| **`Retry-After` Header** | `SKILL.md:329`: "Retry-After is recorded as a shape, never acted on" (9 words) (on 429 rate limit instruments) | Lines 41-43: "When sent with any 3xx (Redirection) response, Retry-After indicates the minimum time that the user agent is asked to wait" (20 words) | **Merely extends.** Extends `Retry-After` semantics beyond rate-limiting 429 instruments to 3xx redirection responses per RFC 9110 §10.2.3. |

### 3.2 Analysis of Potential Contradictions or Tensions

- **Tension Check 1: Does the entry contradict empirical loopback measurements?**
  - Observation: In every case where loopback measured behavior (302 GET traversal, 303 POST → GET, 307 POST preservation), RFC 9110 semantics match and explain the behavior.
- **Tension Check 2: "the approval table has no vocabulary for a redirect that changes the method" (`redirect-and-retry-after-semantics.md:50-51`):**
  - Verification command: `grep -ci 'redirect' /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/interaction-approval-table.md` -> `0` (across all 193 lines; command: `wc -l /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/interaction-approval-table.md` -> 193).
  - Observation: While `SKILL.md` and `state-changing-matrix-r9.md` observed 303 vs 307 on loopback, `interaction-approval-table.md` classifies permissions (C1 loopback, C2 read-only public, C3 authenticated, C4 consequential, C5 login, C6 rate/budget), and contains **zero rules or vocabulary** for redirect-induced method changes on real-site journeys. The statement is strictly accurate.
- **Tension Check 3: Does the entry contradict `redirectCount` observations?**
  - Observation: `redirectCount` is a W3C Navigation/Resource Timing concept (`PerformanceNavigationTiming`), analyzed in `external-class-fixture-v2.md` (§4). RFC 9110 is the wire-level IETF HTTP specification. The entry does not mention `redirectCount` and does not conflict with W3C timing layer observations.
- **Tension Check 4: RFC 9110 MUST-NOT sweep:**
  - Verification command: `sed -n '7260,7800p' /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/assimilation/rfc9110.txt | grep -n 'MUST NOT'` -> 1 hit at line 7494 (§15.4.8 for 307).
  - Observation: Line 7494 is the sole MUST NOT in the redirect sections of RFC 9110; 308 method preservation is absent from §15.4.9 (lines 7507-7523) and is correctly documented as an inference.

**Verdict:** **NO CONTRADICTION.** The new entry strictly extends pre-existing knowledge. No cross-link erratum is required.

---

## 4. Coverage Rows in `corpus/README.md`

### 4.1 Placement in `corpus/README.md`

1. **Current Placement in `corpus/README.md`:**
   The entry has been appended by L1 under section `## Round 27 — redirect semantics documented; LOG-window calibration mechanical (2026-10-25)` at lines 593-617:
   - **Coverage row (`corpus/README.md:598-600`):**
     - Column 1 (Note): `knowledge/redirect-and-retry-after-semantics.md *(round 27)*`
     - Column 2 (Holds): Documented-upstream classification vocabulary for redirects a journey driver observes (303 GET/HEAD, 301/302 rewrite, 307 method preservation, 308 inference, 3xx Retry-After).
     - Column 3 (Sources): S107 RFC 9110 citations with fetch metadata (2026-10-25, 502941 B, sha256 `21c1cdce…`).
   - **Frontier restatement (`corpus/README.md:601-610`):**
     - Quote: "RFC semantics documented; real-site redirects remain untested." (`corpus/README.md:602`, 7 words).
     - Cites loopback 302→303→307 evidence (`knowledge/state-changing-matrix-r9.md:162-177`; `knowledge/external-class-fixture-v2.md:373-404`).
     - Binds the 308 method-preservation inference.

2. **Which Existing Rows It Narrows / Extends (Report-Only Reference):**
   - **Historical Frontier Item (`corpus/README.md:42-43`):**
     > "Real-site journeys + evidence durability — third-party JS, redirects, POST forms, CSRF-checked submits untested by rule" (16 words).
     The new entry narrows the "redirects ... untested by rule" clause of this historical round-3 frontier bullet.
   - **Active Fleet Frontier Table Row (`corpus/README.md:183`):**
     > "third-party JS, redirects, POST and CSRF-checked submits remain untested by rule." (11 words).
     The new entry narrows the redirect dimension of this open frontier item from "untested and unclassified" to "documented vocabulary held; runtime observation unmeasured".
   - **Coverage Map Rows (`corpus/README.md:148, 153`):**
     - Line 148: `knowledge/external-class-fixture-v2.md` (loopback redirect chain traversal and 307 body preservation).
     - Line 153: `knowledge/state-changing-matrix-r9.md` (loopback redirect-code replay behavior: 303 → GET terminus, 307 POST replay).
     The new entry provides the upstream standards counterpart to these two loopback evidence notes.

This follows the exact precedent set in round 23 (`corpus/README.md:540-559`), where `knowledge/csrf-defense-shape-boundary.md` narrowed the CSRF component of lines 42-43 and 183 while leaving earlier bytes untouched.

---

## 5. Non-Obvious Move: Bounded UFO-FSD Synthesis

### 5.1 Evidence

Synthesizing evidence across round-27 C3 (`redirect-and-retry-after-semantics.md`), `interaction-approval-table.md`, `external-class-fixture-v2.md`, and `SKILL.md` reveals three second-order protocol gaps:
1. **Silent Method Rewrite Hazard:** RFC 9110 §15.4.2/§15.4.3 documents that browsers MAY rewrite POST to GET on 301/302 redirects. A journey driver verifying form submission currently inspects only the terminal URL and terminal status (200), remaining blind to intermediate method rewrites unless per-hop CDP `redirectResponse` events are inspected.
2. **Unintended Cross-Origin Retransmission Hazard:** Under 307/308, browsers MUST NOT change the request method, re-submitting POST bodies to `Location`. In `external-class-fixture-v2.md` (§4), tabi evidenced a cross-origin redirect (`19541` → `19543`). On real-site journeys, following a 307/308 cross-origin could leak POST request bodies to unvetted third-party origins without operator consent.
3. **`Retry-After` on Redirection is Unmonitored:** While `external-class-fixture-v2.md` and `SKILL.md:329` define `Retry-After` handling for 429 rate limits, neither the runner nor the CDP harness captures `Retry-After` on 3xx redirect responses.

### 5.2 Affected Axes

- **depth:** **Improves from 8 toward 9.** Transforms spec vocabulary into concrete CDP-layer protocol arbitration rules governing method rewrite detection, origin security boundaries, and redirect backoff pacing.
- **coverage:** **Maintained at 9** (unharmed; preserves clean path for future S108 RFC 7538 admission).
- **operability / freshness / calibration / adjacency:** **Maintained at 8/8/9/8** (unharmed).

### 5.3 Proposed Move (One Bounded Proposal)

**Proposal:** Formalize a single bounded **Interaction Approval Protocol Invariant for Redirection** (an append-only section in `SKILL.md` under §"Interaction approval" and an executable check in the journey runner), defining the **Method-and-Origin Redirection Guard**:

1. **Protocol Invariant 1 (Method Rewrite Detection):**
   In an automated journey, if an intended action is a state-changing method (POST/PUT/DELETE) and any intermediate hop in CDP `redirectResponse` is 301/302 that results in a GET retrieval, record the step verdict as `method-rewritten(301/302)` rather than treating the terminal 200 as a clean pass.
2. **Protocol Invariant 2 (Cross-Origin 307/308 Retransmission Guard):**
   A state-changing request (POST) encountering a 307/308 redirect that targets a different origin (`origin(Location) != origin(Request)`) MUST trip an autonomous stop-and-report predicate (`cross-origin-redirect-refused`), refusing automatic cross-origin body retransmission unless explicitly permitted by the journey manifest.
3. **Protocol Invariant 3 (3xx `Retry-After` Shape Recording):**
   When a 3xx response carries a `Retry-After` header (RFC 9110 §10.2.3), the runner must record the delay value as protocol metadata (`delaySeconds` or `httpDate`) in the network slice, mirroring the loopback 429 shape recording rule.

### 5.4 Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| False positive stops on canonical navigation | Legitimate same-origin 301 redirects (e.g., trailing slash normalization) tripping predicates | Invariant 1 is strictly restricted to state-changing methods (POST/PUT/DELETE); GET/HEAD canonicalization is exempt. |
| Test suite latency from `Retry-After` | Runner stalling test execution on loopback if fixture serves large delay values | Enforce rule as observation/logging of the shape in the network slice; never sleep or delay test execution (reusing the existing 429 rule: shape recorded, not acted on). |

### 5.5 Verification

1. **Loopback Multi-Origin Verification:**
   The multi-origin fixture from `external-class-fixture-v2.md` (`server.py` on ports 19541 and 19543) already serves 302, 303, and 307 legs. Adding a 301 POST-to-GET test cell and a 307 cross-origin cell with `Retry-After: 5` mechanically verifies all three invariants without external network access.
2. **Failure-Capable Verification:**
   - A driver without Invariant 1 reports `step: pass, status: 200` for a rewritten 301 POST; with Invariant 1 it reports `step: method-rewritten(301)`.
   - A driver without Invariant 2 silently retransmits POST bodies across origins; with Invariant 2 it halts at the origin boundary with `cross-origin-redirect-refused`.

---

## 6. Tooling & PACMAN Guard Compliance

- Tooling authorization (operator 2026-10-19): Respected.
- PACMAN GUARD (orchestrator 2026-10-20): Respected. No pacman commands executed.
- Zero packages or tools installed. All checks executed with existing read-only binaries (`grep`, `git`, `wc`, `sha256sum`, `jq`, `python3`).

---

## 7. Summary & Verdict

1. **Pre-existing Mentions:** The lane previously mentioned redirects in journey frontier notes as an "untested by rule" real-site anti-claim (`multi-step-journey.md:287`, `network-evidence-rung.md:435`, `corpus/README.md:42, 183`), and measured loopback redirects across wire, CDP, and client layers in `network-evidence-rung.md` (D5), `external-class-fixture-v2.md` (E1, R2), and `state-changing-matrix-r9.md` (Classes M and A).
2. **Consistency:** The new entry `redirect-and-retry-after-semantics.md` **merely extends** the lane's corpus. It provides upstream RFC 9110 normative ground for the observed loopback behaviors, introduces the 301/302 rewrite possibility and 3xx `Retry-After` vocabulary, and accurately maintains that live real-site redirects remain unmeasured. There are **zero contradictions**; no cross-link erratum is needed.
3. **Corpus README.md:** The entry belongs in `corpus/README.md` and has already been correctly landed by L1 at lines 593-617. Conceptually, it narrows the historical round-3 frontier bullet at lines 42-43 and the active fleet round-1 frontier row at line 183.
4. **FSD Move:** Propose formalizing method-rewrite detection and cross-origin 307/308 body-retransmission guards in the journey driver, lifting the **depth** axis from 8 toward 9 without compromising the loopback boundary.
