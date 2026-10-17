# tabi-shokunin — 旅

**Drive real browsers against real sites with evidence discipline.**
A page claim is only as good as the capture that can re-verify it.

This is a [shokunin](https://github.com/VeigaPunk/shokunin) lane for
browser and web-interaction craft. Rank: shonen. `SKILL.md` is written
to be executable alone: a fresh agent can run a loopback evidence
capture start-to-finish, grade it on the evidence ladder, wait for the
page to settle before the shutter, prove cleanup, and route every
interaction class through the approval table.

Tabi observes. It does not publish (that is
[kake](https://github.com/VeigaPunk/kake-shokunin)), does not treat
reverse engineering as forensics (that is
[revenger](https://github.com/VeigaPunk/shokunin-binary-forensics) /
[kaidoku](https://github.com/VeigaPunk/shokunin-reverse-engineering)),
and does not read session values (that is
[kagi](https://github.com/VeigaPunk/kagi-shokunin) — cookies and tokens
are shape-only here).

## Province

**Owns:** the kimi-webbridge plugin as primary substrate documentation;
browser inventory and profile surfaces (shape-only census); CDP session
discipline (endpoints, targets, screenshot / DOM evidence capture);
interaction records — site-specific gotchas, rate / rights discipline,
login-session handling rules; dynamic-page evidence patterns.

**Refuses:** reverse engineering as forensics (→ revenger / kaidoku);
web *publishing* (→ kake); secrets (→ kagi). Never performs
consequential actions on external sites (purchases, posts, deletions).
Observation and operator-approved interaction only.

Full boundary: [`PROVINCE.md`](PROVINCE.md).

## Start here

1. [`SKILL.md`](SKILL.md) — runbook, evidence ladder, settle-wait, approval table.
2. [`PROVINCE.md`](PROVINCE.md) — owned surfaces and the no-consequential-action rule.
3. [`scripts/`](scripts/) — freshness and round-contract checks.

If a hash in `SKILL.md` §Pins has moved, every citation is stale —
re-verify the note before reuse. Round-3 executor test (TABI-R3-4)
graded the document **SUFFICIENT**: every copy-paste command ran
unmodified.

## Contract checks

```
node scripts/check-round-contract.mjs
node scripts/check-user-round-contract.mjs
node scripts/check-freshness.mjs
```

These read committed tabi round files only. A miss exits non-zero.
They do not launch a browser and they do not authorize an external
site action. The runbook in `SKILL.md` is the capture path; the
approval table is the rights path.

## What's in the repo

```
tabi-shokunin/
├── SKILL.md          runbook + evidence ladder (sufficient alone)
├── PROVINCE.md       domain boundary
├── SHONEN.md         promotion checklist
├── MINT.md           why this lane was minted
├── LOG.md            append-only audit trail
├── SCORECARD.md      axis verdicts
├── AGENTS.md         operating rules
├── scripts/          round-contract, freshness, pstack / user aggregate
├── plans/            round plans
├── reports/          verifier / adjudicator reports
└── corpus/           knowledge/, lessons/, QUALITY.md
```

Protocol: append-only corpus; secrets are shape-only; rounds are
non-author-verified. See the fleet
[README](https://github.com/VeigaPunk/shokunin#readme) for how a lane
learns.
