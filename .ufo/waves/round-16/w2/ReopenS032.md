# ReopenS032 — non-author re-open of S032 (Chrome for Developers WebMCP page)

Seat: `TabiR16.ReopenS032` (scout, leaf). Date: 2026-10-20. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD
`b444ca8e024f386124418169e8e400221524bba3`.

**Verdict: HOLDS**, with one disclosed inference (F1) that the round-16 Gate must record as
inference, not as page text. No false claim, no tier/kind/scope inflation, no row-shape
violation found.

Target: `corpus/SOURCES.md:46` (file sha256
`9f06c7a23b1663e66e8b9059116569cd9615200e428be9f082201768cc21ed70`; last touched by commit A
`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a`). Row as admitted:

```text
| S032 | WebMCP — Chrome for Developers — https://developer.chrome.com/docs/ai/webmcp | docs | A | Chrome's documented origin-trial start, local testing flag and tools Permissions Policy for WebMCP | page last updated 2026-10-07, §Get started, §Local WebMCP, §Permissions policy | Chrome documents WebMCP as an origin trial from Chrome 149 with a local chrome://flags testing switch, not a default-on feature | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

## Axis

Two questions, per the assignment: (a) does a ≤25-word contiguous quote at the named sections
ground the `teaches` cell, and (b) are `kind`/`tier`/`scope` honest under CORPUS.md §SOURCES
contract v1 (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:64-155`)?

## What I observed (read-only, lane root unless stated)

Page opened this session with the reader tool and with `curl`; both render the same prose.

```sh
curl -sSL -o /tmp/s032.html https://developer.chrome.com/docs/ai/webmcp
sha256sum /tmp/s032.html
# 605fa63c758fa866f91ad787e5a9596a3c05729de584047b83a93f936ee831a0  /tmp/s032.html
grep -o '<link rel="canonical" href="[^"]*"' /tmp/s032.html
# <link rel="canonical" href="https://developer.chrome.com/docs/ai/webmcp"
grep -n "Last updated: October 7, 2026\|Last updated 2026-10-07 UTC" /tmp/s032.html
# 4324:  Published: May 18, 2026, Last updated: October 7, 2026
# 4608:  <p>Last updated 2026-10-07 UTC.</p>
grep -n 'id="get_started"\|id="local_webmcp"\|id="permissions_policy"' /tmp/s032.html
# 4436:<h2 id="get_started" data-text="Get started" tabindex="-1">Get started</h2>
# 4442:<h3 id="local_webmcp" data-text="Local WebMCP" tabindex="-1">Local WebMCP</h3>
# 4483:<h3 id="permissions_policy" data-text="Permissions policy" tabindex="-1">Permissions policy</h3>
```

Quotes were extracted by stripping tags from the saved bytes and matched as contiguous strings;
each was found (`FOUND`) with its word count:

| # | quote (verbatim, tags stripped) | words | location in the named anchor |
|---|---|---|---|
| Q1 | `Join the WebMCP origin trial from Chrome 149.` | 8 | §Get started, raw lines 4437-4439 |
| Q2 | `WebMCP is available as a Chrome flag for local development:` | 10 | §Local WebMCP, line 4444 |
| Q3 | `Open Chrome and navigate to chrome://flags/#enable-webmcp-testing` | 6 | §Local WebMCP step 1, line 4447 |
| Q4 | `Both APIs are gated by the tools Permissions Policy.` | 9 | §Permissions policy, lines 4485-4486 |
| Q5 | `The policy defaults to self, which allows tool registration in top-level and same-origin contexts` | 14 | §Permissions policy, lines 4487-4488 |

Q1 grounds the "origin trial from Chrome 149" clause; Q2+Q3 ground the "local chrome://flags
testing switch" clause; Q4+Q5 ground the `scope`'s "tools Permissions Policy" phrase. All are
≤25 words. The anchor's revision string is exact: the page carries `Last updated: October 7,
2026` and `Last updated 2026-10-07 UTC.`; the three anchor sections exist under the exact names
used (note hierarchy: §Local WebMCP is an H3 under §Get started; §Permissions policy is an H3
under §Use WebMCP APIs — the anchor lists them flat, not as siblings).

## F1 — the one clause with no page sentence ("not a default-on feature")

```sh
for p in "default-on" "enabled by default" "not a default" "off by default"; do
  printf '%-22s %s\n' "$p" "$(grep -o -i "$p" /tmp/s032.html | wc -l)"; done
# default-on             0
# enabled by default     0
# not a default          0
# off by default         0
grep -o -i ".\{0,120\}by default.\{0,120\}" /tmp/s032.html
# line 4524  By default, this extension uses a small Node server with an AI SDK.
# line 4526  gemini-3.6-flash model by default, but you can modify the model choice ...
# line 4541  Your prompts are sent by default to the ...
```

All three "by default" sentences are about the example Chrome extension's model choice. The page
never states WebMCP's default state. So `not a default-on feature` is a one-step **inference**
from the two documented facts (opt-in origin trial; local use requires setting the flag to
Enabled), not a page statement, and it is the only part of `teaches` that no contiguous quote
covers. It is true and independently corroborated outside the row's source:

```sh
python3 - <<'EOF'   # /tmp/cs.json = curl -sS https://chromestatus.com/api/v0/features/5117755740913664
raw=open('/tmp/cs.json').read()
d=json.loads(raw.split("\n",1)[1] if raw.startswith(")]}'") else raw)
b=d['browsers']['chrome']
print("status:", b['status']['text'], "| flag_name:", b['flag_name'])
EOF
# status: Proposed | flag_name: None
```

plus the wave-1 seat reading of the 154 tag (`WebMCP` `status: "experimental"`,
`runtime_enabled_features.json5:7023-7035`) and the receipt's flags-off negative control
(`corpus/evidence/round-16/webmcp/receipt.json`, case `flags-off-negative-control`: no
`document.modelContext`). For any 154 default-state assertion, cite S034 + the receipt, not S032.

Consequence for the round-16 Gate: record Q1 and Q2/Q3 as the S032 quotes; do not present "not a
default-on feature" as quoted page text. If the Gate records exactly one quote per new row, Q1 is
the minimum for the headline clause and the negation must be labelled inference.

## Tier / kind / scope audit

| field | admitted | finding |
|---|---|---|
| `kind` | `docs` | correct — developer.chrome.com is Chrome's own documentation, not a spec or Chromium source |
| `tier` | `A` | correct for the declared scope: official vendor docs are authoritative for Chrome's own documented posture; the scope is bounded by the qualifier "Chrome's documented ..." and does not extend to spec text or runtime behavior |
| `scope` | documented origin-trial start, local testing flag, `tools` Permissions Policy | honest and narrower than the page; all three phrases are grounded by Q1/Q2-Q3/Q4. It does **not** claim spec text or a runtime default state — but note `teaches` adds a default-state inference that sits just outside the literal "documented" scope (F1) |
| `anchor` | `page last updated 2026-10-07, §Get started, §Local WebMCP, §Permissions policy` | exact revision date; named sections, not a bare homepage; no fabricated line numbers |
| `source` | title — descriptor — canonical URL | canonical link on the page equals the URL cell |
| `status` | `mined` with used-by = `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | the path exists and cites S032 in its front matter (`source: S032`) and recheck line; the gate's `used_by_uncited` rule accepts that (proved below). Observation F2: the note **body** never uses S032 (grep `149|origin trial|chrome://flags` in that note → 0 hits), so the citation is declarative, not distilled |
| `recheck` | `on-release` | allowed cadence and appropriate for a page whose milestone posture changes with Chrome releases |

## Registry gate and mutation probes

Lane (read-only):

```sh
node scripts/check-sources.mjs
# SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
# exit 0
awk -F'|' '/^\|[[:space:]]*S032[[:space:]]*\|/ {print NF}' corpus/SOURCES.md
# 13
```

Row has 13 fields, no `|` inside a cell, no duplicate id/URL, no tier inflation. To show the
clean result is not vacuous, two mutations were applied only to a full-corpus copy under
`/tmp/s032probe.Wg3B`. Baseline on the copy, exit 0:

```text
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
```

```sh
# A: delete both S032 citations from the used-by note in the probe tree
node scripts/check-sources.mjs --root /tmp/s032probe.Wg3B --file corpus/SOURCES.md
# FINDING id=used_by_uncited fleet=- row=S032 detail=row_id_absent
# SOURCES_GATE verdict=failed rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=1 file=corpus/SOURCES.md
# exit 1

# B: S032 kind docs -> community, tier A kept
node scripts/check-sources.mjs --root /tmp/s032probe.Wg3B --file corpus/SOURCES.md
# FINDING id=tier_inflation fleet=E10 row=S032 detail=community_at_tier_A
# SOURCES_GATE verdict=failed rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=1 file=corpus/SOURCES.md
# exit 1
```

`mined` is therefore bound to a real citation in the named path, and the A/`community` grade
would have been caught; S032's current clean pass reflects its actual cells.

## Fetch-digest caveat (not a row defect)

Two same-session `curl` fetches of the URL differ byte-wise:
`605fa63c…e831a0` vs `1bab70d9…af4cf4b`. The difference is a per-request devsite bootstrap
block (script `nonce` plus a randomized feature-flag list); the article prose is identical. The
wave-1 draft recorded `16a8a0bd…81c8` for this URL, which cannot be reproduced. S032 cites no
hash — it cites the page's own `Last updated` date — so the row is unaffected, but any Gate or
note that pins a raw sha256 of this URL is unreproducible by construction; pin the page's
`Last updated` value (2026-10-07) or a normalized digest instead.

## Remaining unknowns

- The origin-trial registration page (`origintrials/#/register_trial/4163014905550602241`) is a
  2,402-byte JS shell; the trial's start/end milestones were not readable there this session.
  The end milestone is not claimed by the row, so nothing hinges on it here.
- Whether a Chrome 149/150 stable build actually honours the trial was not run (no browser
  launched by this seat); the row claims only what Chrome documents, which is the scope it
  declares.

## Verdict

**HOLDS.** The row's URL opens, its revision anchor is exact, its two load-bearing clauses are
grounded by ≤25-word verbatim quotes in the named sections, and `docs`/`A` is honest for a scope
carefully limited to Chrome's own documented posture. One corrective note for the Gate (F1): the
trailing `not a default-on feature` is a true inference, not page text — do not quote it as such;
use Q1 (+ Q2/Q3) instead. F2 is a low-severity observation: the used-by note cites S032 only in
its front matter, so the row's benefit is registered but not distilled in that note's body.
