# R96Critic1 — C1 wording-vs-instrument map (round 96, w1)

Seat: R96Critic1, Godspeed critic. Judged axes: calibration, coverage.
Question: does any frozen sentence in plans/round-96.md §Claim C1 predicate +
receipt paragraph claim more than counter
`scripts/check-client-oopif-chooser-round96.mjs` + pinned driver
`scripts/client-oopif-chooser-round96.mjs` (sha256 4020e57e…) enforce?
Frontier: widening sentences alone does not improve calibration; only a
narrowest true restatement would.

## Predicate sentence map

P0a "On this host's Chromium 155.0.8059.84 (/usr/bin/chromium --headless=new,
Linux)" — enforced-by-counter (version: counter:179 `includes(155.0.8059.84)`,
:208 `Browser===Chrome/155.0.8059.84` & client version; path/flag: driver:49,
:191, pinned by sha checked counter:96-99,:178). "this host"/OS is a scope
limiter, not a checked property; harmless.
P0b "--live runs the pinned driver (sha256 checked before it runs; nonce in
environment; receipt in fresh mkdtemp dir)" — enforced-by-counter: sha :96-99,
nonce env :115 matched vs receipt :177, mkdtemp :112-113.
P0c "with the npm install named by --deps" — enforced-by-counter via :183
`libs` equality (driver:95-102 builds libs from --deps).
P0d "3 reps of PPX,PPW,PPS,PWX,PWS in that order (15 legs)" — enforced-by-counter
:188-190 exact order, :181 reps.
P0e "each in a fresh browser and profile; client connects over DevTools
endpoint (Puppeteer connect:{browserURL}, Playwright connectOverCDP)" — fresh
browser enforced-by-counter :194 distinct UUIDs; fresh profile + connect method
enforced-by-driver-bytes-only (driver:188-191 new profile+chromium each leg,
:203 connect, :208 connectOverCDP). Bytes pinned pre-run, so part of instrument.
P1 "parent page http://127.0.0.1:<http>/parent.html?leg=<id> holds #pp + one
iframe; child http://<host>:<child>/child.html?leg=<id> holds #s (localhost on
PPX/PPW/PWX, 127.0.0.1 on PPS/PWS)" — URLs/hosts enforced-by-counter :204-207;
one-input/one-iframe DOM counts enforced-by-driver-bytes-only (driver:141-149
HTML); counter sees them via :209 frames, :212 clicks, :213 parent files.
P2 "client arms wait (Puppeteer waitForFileChooser({timeout:3000}), Playwright
waitForEvent('filechooser',{timeout:3000})), clicks frame.click('#s'),
answers with answer file (accept/setFiles)" — enforced-by-driver-bytes-only
(driver:227-236) + counter outcome checks :215/:219 + child files :220. Timeout
value 3000 pinned counter:115 passes --timeout-ms 3000 and receipt :182.
P3 "PPW opens second raw CDP connection, attaches iframe target, enables
interception (witness)" — enforced-by-driver-bytes-only (driver:218-225)
+ outcome enforced-by-counter :226.

## Bullet map (counter exits 0 iff)

B1 every leg: versions :208; arm fields+exact URLs :207; frames [parent,child]
:209; iframe targets (1 url=child cross / 0 same) :211 — timing "(after load,
before click)" enforced-by-driver-bytes-only (driver:213 sleep 800, :217
getTargets, :230 click); one trusted click [['s',true]] :212; parent #pp [] :213.
B2 PPX/PPW: TimeoutError exact message + outcome timeout :215; child #s [] :216.
   Counter also enforces chooserMultiple/ElementId null (:215) — stricter than
   plan bullet, no weakening.
B3 PPW: intercept target == iframe target, exactly one event, selectSingle,
   backendNodeId>0 int, frameId==target :226. Enforced-by-counter.
B4 PPS/PWX/PWS: outcome chooser, no error, isMultiple false :219; child files
   exactly [[answer,22]] :220; Playwright element id s :219. Enforced-by-counter.
   (Counter additionally requires PPS elementId null — stricter, consistent.)
B5 non-witness: intercept/events null :227-228. Enforced-by-counter (keys must
   be present-as-null; omission fails, stricter than wording).

## Receipt paragraph map

schema :176; nonce :177; driver pin :178; chromium contains tag :179;
crossHost localhost :180; reps==requested (default 3) :181; timeoutMs 3000 :182;
libs eq frozen constants (plan truncations match counter:49-50 & claims.json
lines 13-14) :183; answer {name,size 22} :184; 3 distinct ports 1024..65535
:186; exact leg list :190; failures [] + no leg error :192; 15 distinct
UUID browser ids :194; --live driver-exit :173 + ports-bound :174. All
enforced-by-counter.

Titles/intro ("never resolves", lines 21-24) are bounded by §Declared limits 1-6
and the scoped predicate bullets; predicate itself makes no universal claim.

## claims.json statement vs plan

claims.json C1.statement (line 24) is a faithful compression: same Chromium,
versions/pins, 3×5 legs, cross/same outcomes, witness triple, element id s,
frames/iframe-targets/click/parent-empty/Chrome per-leg checks, and defers
receipt identity to "as listed". Drops only: 'profile' word, timing
parentheticals, exact URL literals, client-version detail — none widens. No drift.

## Not enforced

Nothing not enforced beyond scope phrase "this host" (P0a), which limits rather
than asserts. No falsifies-wording sentence found; closest driver-bytes-only items
(P0e, P1 DOM counts, P2 method names, P3 second connection, B1 timing) are all
pinned-sha driver behaviors the counting command runs. Narrowest restatements not
needed.

Evidence: plans/round-96.md lines 31-67, counter lines cited, driver lines cited,
claims.json lines 24,13-14. No --live run performed (static map; no leg-level
statement found false to re-run). No chromium spawned; no port use.

VERDICT C1: neutral
