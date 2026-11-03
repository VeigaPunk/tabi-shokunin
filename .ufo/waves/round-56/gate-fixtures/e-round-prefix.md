# case (e) round-prefix collision — a round-5 citation must not be read as round-55

A neighbouring round: `.ufo/waves/round-5/measure/absent-in-round-5.txt`

The same path spelled for round 56: `.ufo/waves/round-56/measure/present.txt`

Expected under --round 55: exit 0, zero findings, zero tokens checked for round 55
and one other-round token skipped. A prefix-matching regex that treated round-5 as
round-55 would report the absent round-5 path and exit 1.

Expected under --round 56: exit 0, one token checked.
