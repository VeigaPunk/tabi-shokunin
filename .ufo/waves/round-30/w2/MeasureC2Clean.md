# MeasureC2Clean — round 30, w2, attack on C2's measurement (seat report)

Milestone C2. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`, tip
`072af95fe2822f0785a6ff88a578e2142dd258e5`, baseline `f7c0317e4f8445502005e79e3d65767430912dab`.
I attacked only the **C2 measurement apparatus** (`scripts/check-frontier-admission.mjs`, sha256
`cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`, equal to
`frozenDigests` in `.ufo/waves/round-30/claims.json`): whether its `--live` leg is a real,
network-bound, tamper-evident check of the two rate/ToS receipts S116/S117.

**Verdict: the reported C2 outcome (population 2 / admitted 2 at 072af95) is reproducible and
holds in a clean environment — but the predicate's `--live` warrant does not hold as written.
`--live` is not network-bound by construction: it shells out to `curl` with no `-q`, no
`--config`, no `--proto`/`--max-redirs`/host pinning (scripts/check-frontier-admission.mjs:175),
and it accepts `file://` sources as a passing live fetch (:180, self-test cases :340-342).
Measured: (a) in a `unshare -Urn` namespace with only `lo` and zero routes, `--live` at the tip
reports `l1-live` for both receipts (exit 1) while the offline run still reports 2/2 — so the
real reading does reach the network; (b) with a five-line fixture `~/.curlrc`
(`connect-to` remapping the two hosts to a local TLS server) the same command reports
`live: true, population 2, admitted 2, clean: true` **with zero external network**, and it does
so even for committed bytes that the real network rejects with `l3-live-bytes` — a complete
forgery chain, run in a network namespace, at a fixture commit. Severity: **high for the
predicate's warrant, not for this round's number** — with a clean HOME (verified: no
`~/.curlrc`/`~/.netrc`/`/etc/curlrc`, empty-HOME rerun 2/2, three repeat live runs 2/2) the live
leg does discriminate: tampered committed bytes → `l3-live-bytes`, a quote absent from the live
page → `l1-live`. Second defect: `file://` receipts are admitted under `--live` with no network
at all (fixture t3 admitted 2/2 inside the empty namespace), so the "fetched now from the source"
clause is unenforced. Third, procedural: at the tip there is **no committed after-measurement**
for C2 under `.ufo/waves/round-30/measure/` (only `c2-before-at-freeze.json`), which the frozen
`measurementRule` requires before the report.**

---

## 0. Environment and provenance of this reading

- Live clone (one per seat): `git clone --shared …/tabi-shokunin $S/clone`,
  `git checkout -q 072af95…` → `HEAD 072af95fe2822f0785a6ff88a578e2142dd258e5`,
  `git status --porcelain` = 0 lines, before and after every measurement. (The lane branch head was
  already `af0664ed…`, a wave-1 evidence commit, when I started, so every reading below is taken at
  the assigned rev in my own clone, never in the lane checkout.)
- `sha256sum $S/clone/scripts/check-frontier-admission.mjs` →
  `cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca` (exit 0; matches
  `frozenDigests`, and matches `git show 072af95…:scripts/check-frontier-admission.mjs | sha256sum`).
- Tooling: node v24.21.0, curl 8.23.0 (OpenSSL 3.6.5), git 2.56.0, util-linux 2.42.4
  (`unshare`), kernel 7.2.11-arch1-1. `unshare -Urn` works unprivileged on this host (uid 1000).
  Nothing installed or upgraded.
- Host has **no** `~/.curlrc`, `~/.netrc`, `~/.config/curlrc`, `/etc/curlrc`; no
  `*_PROXY`/`ALL_PROXY` variables in the shell; `/etc/hosts` is stock (localhost only). So the
  measurement below is not silently proxied or host-pinned.
- Every command, its exit code and its output file is listed in
  `.ufo/waves/round-30/w2/MeasureC2Clean/commands.log`; fetch provenance in `fetch-ledger.md`;
  digests of all 41 evidence files in `MANIFEST.sha256`.

## 1. Target reading reproduced (C2 holds)

Clean clone, frozen counter bytes, `TMPDIR` under `$HYAKU_SCRATCH`:

```
node scripts/check-frontier-admission.mjs --rev 072af95… --frontier rate-tos-signal \
     --since 2026-10-26 --json                       → exit 0, live false, population 2, admitted 2
     … --live --json                                 → exit 0, live true,  population 2, admitted 2
```

Evidence: `measure/c2-offline.json`, `measure/c2-live.json`, `measure/c2-after-live-final.json`
(07:41:23Z → 07:41:24Z, exit 0, empty stderr), repeats `measure/c2-live-rep1..3.json`
(07:38:28Z/28Z/29Z, each exit 0, 2/2). Entries admitted: `corpus/knowledge/host-published-rate-limit-headers.md`
(S117), `corpus/knowledge/rate-limit-policy-fields.md` (S116). Only these two entries carry
`frontier: rate-tos-signal` (header line 6 of each; `grep -l '^frontier: rate-tos-signal$'`
→ 2 files); rows S116/S117 exist exactly once each (`status=mined`, `opened=2026-10-26`,
used-by naming the entry). Counter self-test: `--selftest --json` → exit 0, 24/24
(`fixtures/selftest.json`).

## 2. Is `--live` a real network check? — yes, in a clean environment (holds)

**2a. Networkless namespace.** `unshare -Urn` with `ip link set lo up`, `ip route` = 0 routes,
external probe `curl -sS --max-time 3 https://www.ietf.org/` → `HTTP 000`, exit 7. In that
namespace, at the tip (`measure/netns-proof.log`, 07:40:45Z):

```
--live --json   → exit 1, population 2, admitted 0, reasons: l1-live S117, l1-live S116
--json (offline)→ exit 0, population 2, admitted 2, clean true
```

(`measure/netns-live-tip.json`, `measure/netns-offline-tip.json`; the same result at 07:37Z in
`measure/c2-live-netns.json` + `measure/c2-offline-netns.json`.) So the live leg performs a real
fetch per receipt, has **no fallback to the committed bytes** (failure mode is `l1-live`, not a
pass), and the offline path is unaffected by the namespace — the two legs are separable.

**2b. Live bytes are the committed bytes.** My own GETs at 07:36:04Z (`fetch-ledger.md`):
S116 URL → 200, 67097 bytes, sha256 `d6016dd0…2d1d412`, **byte-identical** to the committed
receipt bytes; S117 URL → 200, 408912 bytes, sha256 `c6bc80a4…4ea7ca`, differing from the
committed page in 21 bytes (first diff char 408144, line 1238) yet **normalising to the same
8728-character text** (checked with the counter's own exported `normalise`). Independent
refetch is genuine for S117: refetch bytes `c1c2d3f9…d4b2f3` ≠ receipt bytes `b73dc7d1…f0583c3`,
both normalise equal.

**2c. The live leg discriminates when config is clean** (fixtures committed in my scratch clone,
`git rev-parse --show-toplevel` == fixture root, `-c user.name=MeasureC2Clean`):

| fixture | what it changes | offline | live |
|---|---|---|---|
| t1 `e250c5a` | committed S116 bytes + marker appended, receipt sha re-stamped | exit 0, 2/2 (`fixtures/t1-offline.json`) | exit 1, admitted 1, `l3-live-bytes S116` (`fixtures/t1-live.json`) |
| t2 `5eec969` | committed S116 bytes replaced by the entry's own text + the quote (self-quote fabrication, cf. control `c2-control-J4`) | exit 0, 2/2 (`t2-offline.json`) | exit 1, admitted 1, `l3-live-bytes S116` (`t2-live.json`) |
| t5 `00daa75` | committed+refetch bytes fabricated with a quote absent from the real page | exit 0, 2/2 (`t5-offline.json`) | exit 1, admitted 1, `l1-live S116` on a real 200 GET (`t5-live.json`) |

t5 is the real-network `l1` path (host reachable, quote absent), not just the unreachable-host
path from §2a. So in a clean environment the live leg is exactly what the claim says it is.

## 3. Defect A (severity **high** for the warrant): `--live` inherits ambient curl config, so it is not network-bound

`fetchLive` is `spawnSync("curl", ["-sS","-L","--max-time","60","-o","-","-w","\n%{http_code}", url])`
(:175) — no `-q`, no `--config /dev/null`, no `--proto`/`--proto-redir`, no IP pinning. curl reads
`$HOME/.curlrc` (`$CURL_HOME`, `$XDG_CONFIG_HOME` likewise), so `proxy`, `connect-to`, `resolve`
and `insecure` in that file steer the "live" fetch.

Measured, in my scratch:

1. Hostile `proxy` in `.curlrc` (`config/curlrc-hostile-proxy`): `--live` → exit 1,
   admitted 0, `l1-live` on both (`measure/c2-live-hostilecurlrc.json`); bare `curl $HOME=…`
   reproduces `curl: (7) … over proxy 127.0.0.1`, and `curl -q` bypasses it (HTTP 200).
2. **Full forgery, no network.** In `unshare -Urn` (0 routes, external curl exit 7) with a local
   node TLS server (`config/local-server-18444.mjs`, self-signed) serving the **tampered** t1
   bytes, and `config/curlrc-hostile-connect-to` mapping
   `www.ietf.org:443→127.0.0.1:18444`, `docs.discord.com:443→127.0.0.1:18444`:

   ```
   t1 tip e250c5a, HOME=<hostile> node … --live --json  → exit 0, live true, population 2,
        admitted 2, clean true                              (fixtures/t1-live-forged.json)
   server access log: REQ host=docs.discord.com path=/developers/topics/rate-limits
                      REQ host=www.ietf.org path=/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
   external curl in the same namespace: HTTP 000, exit 7
   ```

   The very same fixture fails with `l3-live-bytes` against the real network (`fixtures/t1-live.json`).
   Same mechanism admits a fabricated payload (t2-style) for the same reason: the server can serve
   *whatever the attacker committed*.

Consequence: `--live` proves "bytes were served by whatever curl's configuration points at", not
"bytes came from the receipt's host over the network". The round's 2/2 therefore rests on the
unstated assumption **home directory clean** (true here: no `~/.curlrc`; empty-HOME rerun 2/2,
`measure/c2-live-emptyhome.json`). Any incidental corporate/user proxy or `connect-to` in a
`~/.curlrc` silently changes what the gate measures; the `proxy`-to-dead-port case fails loudly
(exit 1) but a caching or remapping config fails **silently in the passing direction**.

Minimal closures (finding only, not applied): pass `-q --config /dev/null`, refuse non-`https`
schemes in `--live`, and require the effective URL (`%{url_effective}`) to remain on the receipt
host (with `--proto-redir =https`), or fetch via node's `https`/`fetch` with a clean agent.

## 4. Defect B (severity **medium**): `file://` is an accepted live source, so `--live` can pass with no network at all

`fetchLive` returns the body when `code === "200"` **or** `url.startsWith("file://") && code === "000"`
(:180); the self-test institutionalises this (`live-file-url-located`, `live-file-url-quote-gone`,
`:340-341`). Fixture t3 (`6a17688`) re-points **both** receipts at
`file://…/corpus/evidence/round-30/frontier/bytes/*` and updates the SOURCES rows (`g2-url`):

```
--json              → exit 0, 2/2                                  fixtures/t3-offline.json
--live --json       → exit 0, 2/2                                  fixtures/t3-live-net.json
unshare -Urn --live → exit 0, 2/2, external curl HTTP 000 exit 7   fixtures/t3-live-netns.json
```

So a future round can satisfy the C2 predicate with receipts that were never fetched from any
host: the `l1`/`l3` legs become a comparison of committed bytes with themselves. The current two
receipts are `https` (`S116.json`, `S117.json`), so this round's reading is unaffected — but the
predicate as frozen does not enforce "fetched now from the source".

## 5. Defect C (procedural, severity **warning**): no committed after-measurement at the tip

`claims.json` `measurementRule`: "its raw output is committed under
`.ufo/waves/round-30/measure/` **before the report is written**. A counter not run is a claim not
verified." At `072af95` that directory holds only `c2-before-at-freeze.json` (rev `061e6202`,
`live true`, population 0, admitted 0) — there is **no** `--live` after-reading at 072af95
committed (`git ls-tree -r 072af95 -- .ufo/waves/round-30/measure`; and `git grep` at the tip finds
no file containing both the tip rev and `"live": true`). The lane branch head has since advanced to
`af0664ed039af98a5d8c460cf99c71d726dd41af` ("round-30: wave-1 evidence … w2 spec and dispatch",
776 files, a wave-1 evidence commit); that head also carries only the two `*-before-at-freeze.json`
files under `measure/`, so the gap is not an artefact of the pinned rev. A working copy of
`measure/c1-identity-blind-at-072af95.json` exists uncommitted in the lane worktree (mtime 04:25) —
the same gap applies to C1's after-reading. My own after-readings are committed-by-me in my output
dir (`measure/c2-after-live-final.json` etc.), but they do not substitute for the lane's committed
measurement. L1 still has to land it.

## 6. Confirmed by reading (not separately exercised against a third-party host)

- `-L` is passed with no `--max-redirs`, `--proto-redir` or host check (:175): the "live" body may
  come from a redirect target on another host, and `l1`+`l3` would accept it if it carried the
  quote and normalised equal to the committed page. This matches w1 `SentinelFetchScope`
  /`CritC2Counter`; I add that the same missing pinning is what §3 exploits with `connect-to`.
- `l3-live-bytes` compares **normalised text**, not bytes (:223, with `l1` at :222). Measured consequence:
  21 bytes of churn in the Discord page (scripts/attributes/build id near line 1238) are tolerated —
  correct by design, but it means "live bytes equal committed bytes" is prose equality only.
- Quoted-span budget: both receipts sit exactly on the `g4-quote-length` boundary (25 of 1..25
  words, ≥4-word entry spans checked by `q1`). Any editorial trim/pad on the quote breaks `g4`
  unmarginally.
- Fragility of the reading: S117 is a live vendor page (byte churn already observed within ~1h);
  prose drift there flips `l3-live-bytes` and with it the C2 target. S116 is a frozen IETF archive
  draft `-11` (byte-stable across the same window, and across the 06:39Z fetch and my 07:36Z GET).
- Positive: the counter reads **committed git blobs**, not the worktree — fixture t4 (tip commit,
  an entry dirtied in the worktree) still reports 2/2 (`fixtures/t4-offline.json`). Evidence cannot
  be forged by dirtying a checkout.

## 7. Answer to "prove the live check is real for these receipts"

It is real **for these two receipts, in a clean environment**: the two `https` URLs are fetched at
run time (namespace test), S116's live bytes are byte-identical to the committed receipt, S117's
live bytes are the same document after normalisation, and both mutation classes the claim relies on
are detected on the real network (t1/t2 → `l3-live-bytes`, t5 → `l1-live`). It is **not real by
construction**: the same command reports a clean 2/2 with no network at all when the ambient curl
configuration (three `connect-to` lines) or the receipts' own `file://` scheme says so, and it
follows redirects off the receipt's host. Both are properties of the predicate, not of this round's
data; the round's 2/2 verdict stands under the environment I verified (clean HOME, no proxy vars,
no hosts pinning), and would need re-verification in any environment that has a `~/.curlrc`.

## 8. What I did not do

- No lane writes: the lane checkout is untouched (`git -C … rev-parse HEAD` = `072af95…`,
  read-only; all work in `$S/clone` and fixtures `t1`–`t5`). No builds, linters or formatters.
- No mutant-identity work (C1), no receipt repair, no curation, no commit in the lane.
- No third-party redirector was used (that would require a consequential API call), so §6's
  redirect bullet is read-only code evidence; likewise `http://` receipts are refused by the
  scheme gate at :174 by reading, not by a live test.
- Scratch is `$HYAKU_SCRATCH/tabi-r30/MeasureC2Clean/` (HYAKU_SCRATCH=/fast/scratch/hyaku); the
  live clone and fixtures still exist there for the parent to replay any command in
  `commands.log`; every cited artifact is copied into this seat's output dir with digests in
  `MANIFEST.sha256`.
