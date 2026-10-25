# W2Cls5 — attack: c5-registry-identities

Verdict: c5's three named arms REPRODUCE (fires on w2b 65 spawned / 65 null agentId; silent on w2;
silent on round-21), but the class is DEFEATABLE — the required red case "spawned wave with no registry
file at all" is silent, and identity/cardinality are unconstrained.

Pins: auditor sha256 `3fe9c326d1a6952514efa20fdd7110a085b17e244498c65b7a36377f1bb5efdd` (worktree; HEAD moved
a89f193 -> 03c1b4d mid-review and `git diff HEAD -- scripts/round-evidence-audit.mjs` touches only the selftest
inventory at 582+, so c5's region is byte-identical in both). Lane bytes: `--rev a89f1935f523a64b00991d792fca6a8c0d321948`.

## Arms re-run

| arm | command | result |
|---|---|---|
| C1 target | `node scripts/round-evidence-audit.mjs --rev a89f193… --round 22 --round-cap 128 --json` | exit 1, 7 findings, 6 classes; the one c5 = `65 spawned / 65 members` → `65 without agentId`, evidence `…/round-22/w2b/swarm-registry.json` |
| w2b bytes | `git show a89f193:.ufo/waves/round-22/w2b/swarm-registry.json`, `…/w2b-spawn-result.json` | 65 members, 65 null agentId; receipt text `Spawned 65 background agents` — claim matches bytes |
| w2 silent | same canonical run | only that one c5, naming `w2b`; `w2-spawn-result.json` is refusal-only (`Background job limit reached`), so the 64 nulls in `w2/swarm-registry.json` are correctly ungraded |
| r21 silent | `node scripts/round-evidence-audit.mjs --rev a89f193… --round 21 --round-cap 128 --json` | `findingClasses=[c2-wave-caps,c3-gate-spotcheck]`, no c5, while c2 derives 128 spawned (64+64) — both r21 registries exercised with spawned>0, 64/64 identified |
| selftests | `node scripts/round-evidence-audit.mjs --selftest` and `--selftest --rev a89f193… --round 22 --round-cap 65` | 12/12 and 6/6, exit 0 |

## Breaking it — `node .ufo/waves/round-23/scratch/W2Cls5/probe.mjs` (exit 1; 11 of 17 cases defeated)

Real round-22 bytes via the auditor's own `gitCtx`, one path overridden or dropped per case.

| case | expect | observed |
|---|---|---|
| A baseline 65 null / B one id filled / C all filled / H all `""` | fire, fire, silent, fire | ✔ (65 / 64 / silent / 65) |
| E registry present, unparseable | unreadable | ✔ `registry-unreadable` |
| D spawned wave, **no registry file** | unreadable | **silent** ✘ |
| F `members: []` / G `members: {}` | unreadable | **silent**, **silent** ✘ |
| I nested `w2b/critic/` / J root `w2b-swarm-registry.json` / K `w2b/registry.json` | unreadable | **all silent** ✘ |
| M ids all `x` / N all `" "` / O 65 `ghost.seat.N` / P one id 65x | fire | **all silent** ✘ |
| Q 1 member vs 65 spawned | fire | **silent** ✘ |

## Findings

1. **S1 (blocking) — the wave set is the registry files present, not the waves that spawned.**
   `scripts/round-evidence-audit.mjs:363` iterates `files.filter(/swarm-registry\.json$/)` and calls
   `waveEvidence` per stem, so a wave whose registry file is absent is never visited. The class's own
   message at :370 ("a spawned wave has no readable member registry") is therefore unreachable — it needs
   present-but-unparseable bytes (E ✔, D ✘). Deleting the file clears c5 with zero identities recorded:
   a skip-work control the class does not refuse. `probe.mjs` → case D.
2. **S1b (same root) — shapeless members are silent.** `:368`'s `typeof reg.members === "object"` admits
   `[]`, and `:375`'s `if (names.length && anonymous.length)` admits `{}`; 65 spawned seats with either
   shape produce no finding. `probe.mjs` → cases F, G.
3. **S1c (same root, shape drift) — discovery is one literal path.** The stem is sliced out of the path at
   `:364`, so any other placement is either unmatched or yields a stem `waveEvidence` cannot pair with a
   receipt: nested, round-root `w2b-swarm-registry.json`, renamed `registry.json` — all silent on the same
   65-spawned bytes. `probe.mjs` → cases I, J, K.
4. **S2 (high) — "identity" is truthiness, not identity.** `:374`'s `!members[n].agentId` accepts any
   non-empty string, never compares against the spawn receipt's seat list, never checks uniqueness. A
   constant `x`, a space, one id repeated 65x and 65 invented ids all clear — precisely the states in which
   the detail's claim ("cannot be tied to its transcripts") stays true. `probe.mjs` → cases M, N, O, P.
5. **S2b (high) — cardinality unchecked.** c2 bounds registry size from above (`n > maxLanes`) and nothing
   bounds it from below against `spawned`, so 65 spawned seats recorded as 1 identified member is clean.
   `probe.mjs` → case Q.
6. **S3 (medium) — the two existing controls cannot reach the defeated axis.** `c5-red` nulls both ids,
   `c5-green` exercises the refused-wave branch, and the evidence-keyed repair fills *every* registry, so
   none can fail on D/F/G/I/J/K/M/N/O/P/Q: 12/12 and 6/6 stay green while 11 of 17 adversarial cases defeat
   the class. `--selftest` + `probe.mjs`.

## Residual risk / gaps

- Not attacked: cross-checking the `Spawned N` marker against the receipt's seat list; c1–c4/c6 (other seats).
- Findings are per registry path, but non-canonical stems yield `spawned 0`, so no wave is double-counted.
- Every figure came from sha256 `3fe9c326…`, re-hashed before and after the run (identical:
  `scratch/W2Cls5/pin-before.txt` vs `pin-after.txt`). `scripts/round-evidence-audit.mjs` shows ` M` in
  `git status` from a sibling's selftest-inventory edit, not from this seat.
- No tracked file edited; no git/jj write; no spawn, service, browser or fetch. Fixtures only under
  `.ufo/waves/round-23/scratch/W2Cls5/` (`probe.mjs`, `probe.json`, `canon.json`, `r21.json`, pins).
