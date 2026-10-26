# Fixture self-check for the drafted S096 supersede row (not a verdict on the lane)

Purpose: prove that `entry.json` and the row drafted in `supersede-row.md` are *bindable* by the
frozen counter `scripts/check-release-pins.mjs` at stable `156.0.8078.47`. This is a binding test
inside a throwaway repository under `$HYAKU_SCRATCH`; it is **not** the independent re-fetch
record required by f6, and nothing here was written into the lane.

Fixture (`git init` in scratch, one commit per state, `git -C` on every call, toplevel verified
equal to the fixture dir before the first commit):

- `corpus/SOURCES.md`: registry header plus (a) the lane's own S096 row copied verbatim, (b) the
  row drafted in `supersede-row.md` with its `S1NN` placeholder replaced by `S190`.
- `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`: the two decoded bodies from
  `bytes/` in this directory.
- `corpus/evidence/round-29/release-pins/receipt.json`: this directory's `entry.json` with
  `superseded_by` set to `S190`.
- `corpus/evidence/round-29/release-pins/refetch/S096.json`: a synthetic seat `FixtureRefetch`
  carrying the 156 path, status 200 and sha256, standing in only to satisfy f6's shape check.

Results (`node scripts/check-release-pins.mjs --repo <fixture> --rev <rev> --stable 156.0.8078.47 --json`):

- `fixture-counter-out.json` — exit 0, `population=1 resolved=1 unresolved=0 drifted=1 reasons=[]`.
  So f1/f2/f3/f4/f5/f6 all bind and the drift is attributed to the S096 row itself, with the
  superseding row satisfying `s1-drift-unsuperseded`.
- `fixture-negative-control.json` — exit 1, `s1-drift-unsuperseded`. Same fixture with the
  superseding row deleted, so the resolution above is caused by the drafted row and not by the
  receipt alone.

Two things this fixture cannot show:

1. `S1NN` is not a parseable registry id — `parseRegistry` matches `/^ {0,3}\|\s*S\d{3,}\s*\|/`,
   so a literal `S1NN` row is invisible to the counter and the row stays `s1-drift-unsuperseded`.
   The allocator must renumber the draft to a real `S1xx` in the registry *and* in
   `entry.json.superseded_by` in the same commit.
2. The real f6 record must come from a seat other than `PinS096` and must carry
   `sha256 = 2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` for the 156 body.
