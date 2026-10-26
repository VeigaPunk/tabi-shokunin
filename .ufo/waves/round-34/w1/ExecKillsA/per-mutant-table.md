# C2 build (seat A) — per-mutant table

Gate: `scripts/check-bidi-runtime.mjs`, baseline `59f1b47aae277e1670e4a824173da8cde7e388ee`
(sha256 `eded1be0…61c1`), after this patch sha256 `cd06d73664b315e2a86f268d0321b965b24348534ed1fdb5e3c4a9f1c0a1a295`.
All observations are the gate's own run (exit / admitted / population / first finding id / first
finding detail), never the gate's bytes.

| mutant | rule the mutant disables | new case (v3, seat A) | pristine | mutant applied (exact find→replace) | verdict |
|---|---|---|---|---|---|
| M01 | `x3-duplicate-id` threshold: an id occurring more than once is a finding on **every** occurrence; mutant raises `> 1` to `> 2`, so an id listed exactly twice is admitted twice | `v3-a-m01-duplicate-id-twice` — entry rows `R2, R2` | exit 1, admitted 0, population 2, reason `x3-duplicate-id`, detail `R2 appears 2 times` | exit 0, admitted 2, population 2, reason `-` | **killed**, 1 failing case |
| M03 | Measured-cell verdict case folding: `MEASURED` matches case-insensitively and the verdict is folded to `yes`/`no`; mutant returns the cell's own case, so `Yes` is neither an admitted yes nor a `no` | `v3-a-m03-measured-cell-uppercase` — rows `R1, R2`, both cells `Yes` | exit 0, admitted 2, population 2, reason `-` | exit 1, admitted 0, population 2, reason `-` (clean refuses: no admitted row) | **killed**, 1 failing case |
| M06 | session-id shape: ChromeDriver 154 mints 32 **lower**-case hex (`util.cc:39-43`, `%016PRIx64%016PRIx64`; S127); mutant widens the shape to upper case, so an upper-case id is no longer refused *at the session-shape check* | `v3-a-m06-session-id-uppercase` — both runs' `sessionId` = `sha256("tabi-v3-a-session").slice(0,32).toUpperCase()`; the synthesised `webSocketUrl` carries the same upper-case id | exit 1, admitted 0, population 1, reason `t1-receipt`, detail `run1: sessionId is not 32 lowercase hex: "585E9EC1…7BC9"` | exit 1, admitted 0, population 1, reason `t1-receipt`, detail `run1: webSocketUrl is not ws://<host>/session/<sessionId>: ws://127.0.0.1:9515/session/585E9EC1…7BC9` | **killed by the `detailIncludes` clause only** (see below), 1 failing case |
| M08 | browsing-context id shape: 32 **upper**-case hex (round-32 evidence `"context":"31B8FE9C25C36020CBB175F250715903"`); mutant also accepts lower case, so a synthesised lower-case transcript is admitted | `v3-a-m08-context-id-lowercase` — both runs' context id = `sha256("tabi-v3-a-context").slice(0,32)` | exit 1, admitted 0, population 16, reason `t1-receipt`, detail `run1: browsing-context id not ChromeDriver-shaped: 8f219b48c042686311a73bfee44a3739` | exit 0, admitted 16, population 16, reason `-` | **killed**, 1 failing case |
| M09 | the driver allow-list is closed: a named import of a gate symbol outside it is a `t1-receipt` finding; mutant adds `ROWS` (gate-internal table) to the allow-list | `v3-a-m09-driver-imports-rows` — driver `import { FIXTURE, ROWS } from "./check-bidi-runtime.mjs";` | exit 1, admitted 0, population 16, reason `t1-receipt`, detail `driver imports non-allow-listed gate symbol(s): ROWS` | exit 0, admitted 16, population 16, reason `-` | **killed**, 1 failing case |
| M10 | the allow-list loses nothing: the honest round-32 driver imports `FIXTURE_SHA256`, `VIEWPORT`, `serveFixture` and stays admitted; mutant drops `serveFixture` | `v3-a-m10-driver-imports-servefixture` — driver `import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";` | exit 0, admitted 16, population 16, reason `-` | exit 1, admitted 0, population 16, reason `t1-receipt`, detail `driver imports non-allow-listed gate symbol(s): serveFixture` | **killed**, 1 failing case |

Each applied mutant fails **exactly one** case in the whole self-test (44 pre-existing + 6 new), i.e.
each new case is load-bearing and no pre-existing case regressed. Every mutant's whitespace twin
(doubled first space at the mutant site) still exits 0 with 0 failing cases.

## Why M06 needs a detail-level assertion

`sessionOf()` runs two independent id checks in sequence:

```
SESSION_ID  /^[0-9a-f]{32}$/                       scripts/check-bidi-runtime.mjs:382
WS_SESSION  /^ws:\/\/[^/]+\/session\/([0-9a-f]{32})$/   :148, :386
```

With an upper-case 32-hex session id the pristine gate refuses at `:382`; the M06 mutant passes
`:382` and then refuses at `:386` (the ws url carries the same upper-case id). Exit, admitted,
population and finding id are therefore identical under both gates — only the refusal's detail
differs. No fixture exists that separates them on exit/admitted/population/reason, so the case
pins the first finding's **detail** with the new optional `detailIncludes` case field.
