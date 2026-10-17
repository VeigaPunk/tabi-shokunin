# tabi-shokunin — 旅

Browser and web-interaction craft. Driving a real browser against a page,
with evidence a later reader can re-check, and with an approval table in
front of anything consequential.

Rank: **shonen**. [`SHONEN.md`](SHONEN.md) records non-author checks on
the seed boxes (verifier TABI-B4 and the round-3 executor test). Read
those evidence lines before treating probation as closed; later boxes and
later rounds are in the same file.

Fleet: [shokunin](https://github.com/VeigaPunk/shokunin).

## The question

> What was on this page, at this moment, and which capture makes that
> claim re-verifiable?

`SKILL.md` is written so a fresh agent can run a loopback evidence
capture from the runbook alone, grade it on the evidence ladder, wait
for settle, prove cleanup, and route the interaction through the approval
table. If a hash in the skill's pins section has moved, the citations are
stale and the note gets re-verified before reuse.

## Boundary

**Owns:** the kimi-webbridge plugin as substrate documentation, browser
and profile census (shape only), CDP session discipline, screenshot and
DOM evidence, site-specific gotchas, and login-session handling rules.
Cookies and tokens are shape-only. Values are never read into the record.

**Hands off:** reverse engineering as forensics (revenger, kaidoku), web
publishing (kake), secrets (kagi). No purchases, posts, or deletions on
external sites. Observation, and operator-approved interaction, are the
allowed actions.

## Scripts

[`scripts/`](scripts/) holds the round-contract and freshness checkers
used on this lane's own records:

| Script | Role |
|---|---|
| `scripts/check-freshness.mjs` | pin table vs expected freshness JSON |
| `scripts/check-round-contract.mjs` | fleet round-contract check |
| `scripts/check-user-round-contract.mjs` | user-round contract check |
| `scripts/pstack-seat.mjs`, `pstack-aggregate.mjs` | pstack seat and aggregate |
| `scripts/user-seat.mjs`, `user-aggregate.mjs` | user-round seat and aggregate |

The capture procedure itself is the runbook in `SKILL.md`, not a single
shell entry point. Start there.

## Map

| Path | What it is |
|---|---|
| [`SKILL.md`](SKILL.md) | runbook, evidence ladder, approval table, pins |
| [`PROVINCE.md`](PROVINCE.md) | surfaces and refusals |
| [`corpus/knowledge/`](corpus/knowledge/) | measured methodology notes |
| [`corpus/evidence/`](corpus/evidence/) | captured bytes |
| [`corpus/handoffs/`](corpus/handoffs/) | cross-lane handoffs |
| [`LOG.md`](LOG.md), [`SCORECARD.md`](SCORECARD.md) | rounds and axis verdicts |

Secrets stay shape-only. A claim about a page cites the capture, the
command, and the pin.
