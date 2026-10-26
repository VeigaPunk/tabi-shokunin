# Receipts — RevC1KillAttribution (tabi round-30 w2, C1 kill attribution)

Scratch: `/fast/scratch/hyaku/tabi-r30/RevC1KillAttribution` (clone + tmp + repro). Lane untouched (read-only); no lane git/jj writes; no commits anywhere. No tool installs (none needed).

## Commands and exit codes

1. Clone + checkout tip (exit 0):
   ```
   git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
   git -C "$S/clone" checkout -q 072af95fe2822f0785a6ff88a578e2142dd258e5
   git -C "$S/clone" rev-parse HEAD        # 072af95fe2822f0785a6ff88a578e2142dd258e5
   git -C "$S/clone" status --porcelain | wc -l   # 0
   ```
2. Frozen-digest check at tip (exit 0):
   ```
   sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json
   # 02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55  scripts/check-gate-mutants.mjs
   # cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833  scripts/gate-mutants.json
   ```
   Both equal `claims.json:frozenDigests`. Gate bytes at tip: `85dfd5e0cb9d5a99…` (s106), `915a6bba21223a48…` (pins).
3. Counter at tip (exit 0), in the clone, `TMPDIR=$S/tmp`:
   ```
   node scripts/check-gate-mutants.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --json > counter-tip.json
   echo exit=$?        # exit=0
   jq '{fault_total,fault_survivors,benign_total,benign_killed}' counter-tip.json
   # fault_total 27, fault_survivors 0, benign_total 13, benign_killed 0
   ```
   `counter-tip.json` headers: `rev 072af95f…`, `counter_sha256_at_rev 02945f88…`, `catalogue_sha256 cd1c27a2…`. Pristine runs: s106 cases=10 passed=10 clean; pins cases=29 passed=29 clean.
4. Per-mutant killing cases (exit 0): `jq -r '.mutants[] | … failing_cases …' counter-tip.json` — full lists in the report table; raw in `counter-tip.json` (sha256 `0392fc1005dc52bd…`).
5. Catalogue row dump (exit 0): `jq -r '.mutants[] | [.id,.kind,.find,.replace] | @tsv' scripts/gate-mutants.json > catalogue-rows.tsv` (sha256 `5fe203746f037dc…`).
6. Repro of the `pins-f3-bytes-absent` kill (exit 1, as the counter saw):
   ```
   node -e '…apply find→replace from catalogue to a scratch copy…'   # occurrences=1
   TMPDIR=$S/tmp node repro/pins-f3-bytes-absent.mjs --selftest --json > out.json 2> err.txt
   echo exit=$?        # exit=1 ; stdout empty (unparseable)
   # err.txt: TypeError [ERR_INVALID_ARG_TYPE] … at sha256 (…:96:46) at evaluate (…:215:11) at runSelftest (…:483:15)
   ```
7. Crash-case identification (exit 1; instrumented scratch copy `pins-f3-bytes-absent2.mjs` logs the case id only on non-Refusal rethrow):
   ```
   TMPDIR=$S/tmp node repro/pins-f3-bytes-absent2.mjs --selftest 2> err2.txt
   echo exit=$?        # exit=1
   grep CRASH-CASE err2.txt
   # CRASH-CASE f3-old-bytes-never-committed-unresolved TypeError The "data" argument must be of type string or …
   ```

## Artifact digests (copied into this output dir)

| file | sha256 |
|---|---|
| counter-tip.json | 0392fc1005dc52bd95e9d1e934cdaeba1a224357c41723b87ac2a5fcda4122e2 |
| catalogue-rows.tsv | 5fe203746f037dcadb375cc419dd62ce9e08a09fa5b03104f7b073edb7ee63b1 |
| repro/pins-f3-bytes-absent.mjs | 4877948ccaeac7e9f3035e51727f9f14d28db1b4f584872ed12bd8778497bad5 |
| repro/pins-f3-bytes-absent2.mjs | e35f17c403698709955e117ab91751c0a2db9afa52ffcdb2fe3982d605b7e5ee |
| repro/err.txt | 3215d0e64d2b62723359df69000634926a82131087b50d235c4dee100781be5e |
| repro/err2.txt | f6a90f339d02fc71d5849f674be49d2fc852d398e496a25d816446101549007f |

No network fetches were needed (all evidence is local source + local counter runs).
