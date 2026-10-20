VERDICT: PASS

## Findings and evidence

- Implemented `scripts/freshness-witness.mjs` (new). It resolves the checked-out local branch or detached-HEAD fallback with the QUALITY 29 gate-anchor sequence, validates `--rev` as a full lowercase 40-hex ancestor of `refs/heads/master`, and refuses invalid revisions with exit 2 and `finding=witness_revision_refused`. Relevant implementation: `scripts/freshness-witness.mjs:30-52` (constructed Git environment), `:76-110` (branch anchor and `rev-parse --verify --end-of-options`), `:113-149` (argument and ancestry validation), and `:152-160,255-272` (argv, dry-run, child execution and exit handling). The source gate rule is `scripts/check-round-contract.mjs:114-153`; F6 is specified in `.ufo/waves/round-18/PLAN.md:31-35,88-89`.
- Self-test, run in LANE: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs --self-test` → `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0`. Fixture coverage includes detached poison HEAD falling back to master, attached branch selection, rejected `HEAD`, short and dash-led revisions, a non-ancestor commit, a valid ancestor, and a symbolic HEAD outside `refs/heads/`. Test implementation: `scripts/freshness-witness.mjs:188-252`.
- Lane dry-run, run in LANE: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs --dry-run` →
  ```text
  FRESHNESS_WITNESS tip=2bff864fdfee684ddbcd066cc8e735adaba2735c source=refs/heads/master
  FRESHNESS_WITNESS argv=["/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node","--","/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-freshness.mjs","--witness","2bff864fdfee684ddbcd066cc8e735adaba2735c"]
  ```
- Real execution: cloned LANE with `git clone --no-hardlinks` to `/tmp/tabi-r18-C2FreshWrapper-XEiEV0`, copied the new wrapper into the clone, detached HEAD at `refs/heads/master` (`## HEAD (no branch)`), and ran `node /tmp/tabi-r18-C2FreshWrapper-XEiEV0/scripts/freshness-witness.mjs`. First output lines and result:
  ```text
  FRESHNESS_WITNESS tip=2bff864fdfee684ddbcd066cc8e735adaba2735c source=refs/heads/master
  PIN_MATCH target=corpus/knowledge/arc-synthesis.md sha256=f42428bd9af738c5dc0ec5361edd56e667acf84b6c96d23459bc5d46ab0a9269 newlines=183
  FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=2bff864fdfee684ddbcd066cc8e735adaba2735c baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
  WRAPPER_EXIT=0
  ```
  The temporary sandbox clone was removed after the run.
- SHA-256 of `scripts/freshness-witness.mjs`: `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1`.
- LSP was unavailable: no LSP tool or route is exposed in the provided tool inventory. No tools were installed or updated.

## Risks and blockers

None observed for the assigned behavior. The byte-frozen `scripts/check-freshness.mjs` was not edited.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C2FreshWrapper.md`
