# ExecDigestPins — frozen digest re-derivation

Seat: `ExecDigestPins` · lane: tabi round 43, wave 1 · judged on: operability
Milestone: frozen digest re-derivation · wave item: `ExecDigestPins`

## Verdict in one line

All **8/8** pinned digests (6 `frozenDigests` paths + 2 `producerPins`) re-derive **exactly**
from the committed bytes at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` and from the live
filesystem, and the six frozen digests are **unchanged at HEAD** `ba433c94` — the pins are
intact and the freeze has not drifted.

---

## 1. Scope and what was (not) touched

* Read-only: the production tree `/home/vgpnk/Projects/shokunin/tabi-shokunin`, the fleet root
  `/home/vgpnk/Projects/shokunin`, sibling `*-shokunin` repos, `/home/vgpnk/Projects/shokuknow`.
  Nothing was written, committed, fetched or pushed in any of them. The only write into the
  production tree is this seat's own report + evidence under
  `.ufo/waves/round-43/w1/ExecDigestPins/` and this file at `.ufo/waves/round-43/w1/ExecDigestPins.md`.
* No commits, no pushes, no git/jj mutation anywhere. The clone under my scratch was created with
  `git clone --no-checkout` + `git checkout <rev>` only — no commit was authored, and no
  throwaway identity was configured anywhere.
* No spawned subagents. The "single labrat" allowance in the lane bounds was not used.
* No network access of any kind: every input is a local file or a local git object.
* No tools installed or upgraded. `pacman` was not invoked (host-wide pacman pause respected).
  Node `v24.21.0` (fnm-managed) and git `2.56.0` were already present and are the tools used.
* Scratch root `/fast/scratch/hyaku/tabi-r43/ExecDigestPins/` was created, used for the clone
  only, and **deleted before yield** (see §7).

## 2. Method

Two independent readings of the same frozen bytes, compared against `claims.json`:

1. **Committed bytes** — `git -C <clone> cat-file blob 7ca6f018:<path> | sha256sum`. This is the
   authoritative reading: the bytes as committed at the freeze commit, independent of any
   worktree state.
2. **Checked-out worktree bytes** — `sha256sum <clone>/<path>` after `git checkout` of the freeze
   revision, proving the checkout is faithful (byte-equal to the blob).

Producer pins were hashed directly from the live filesystem paths named in `claims.json`
(the Playwright Firefox binary, and `process.execPath` for node).

`git cat-file -t` was used to confirm each frozen path is a **blob** at the freeze revision (not a
tree, not a symlink) before hashing — the same blob-type discipline the C2 checker enforces.

## 3. Result — 8/8 match

Frozen revision under test: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
Clone: `/fast/scratch/hyaku/tabi-r43/ExecDigestPins/clone` (clean worktree, `git status --porcelain` empty)
Claims source: `.ufo/waves/round-43/claims.json` at that revision, sha256
`290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029` (identical to the production
worktree copy and to the HEAD copy — `git diff --stat 7ca6f018 ba433c94 -- .ufo/waves/round-43/claims.json`
is empty).

### 3.1 `frozenDigests` (6/6 match)

| path | type | claims value | re-derived sha256 | match |
|---|---|---|---|---|
| `scripts/measure-c1-round43.mjs` | blob | `23afa29d…92a0` | `23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0` | ✅ |
| `scripts/playwright-firefox-egress-round43.mjs` | blob | `37182359…87c7e` | `3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e` | ✅ |
| `.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs` | blob | `6b8c8750…7126c` | `6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c` | ✅ |
| `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` | blob | `2f150b84…11743` | `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743` | ✅ |
| `.ufo/waves/round-43/fixtures/v0-fabrication.mjs` | blob | `b8747062…cb0b80c` | `b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c` | ✅ |
| `.ufo/waves/round-43/fixtures/tree-vs-blob.mjs` | blob | `7407f6cd…259ab6d` | `7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d` | ✅ |

For every one of the six: the committed-blob digest, the checked-out worktree digest, and the
`claims.json` value are the same 64-hex string, and the worktree bytes are byte-equal to the
committed blob bytes (`worktreeEqualsCommittedBytes: true`).

### 3.2 `producerPins` (2/2 match)

| pin | path | claims value | re-derived sha256 | match |
|---|---|---|---|---|
| `firefoxBinSha256` | `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox` (579 008 bytes) | `1f637a7c…495eb` | `1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb` | ✅ |
| `nodeSha256` | `process.execPath` = `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (node v24.21.0) | `7fde7b8a…246df4c` | `7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c` | ✅ |

### 3.3 No drift between the freeze and HEAD

All six `frozenDigests` values also match the **blob at HEAD** (`ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`),
i.e. the two commits after the freeze (`b77e84a0` w1 spec, `ba433c94` C1 receipt/witness commit)
touched none of the six pinned files. `git status --porcelain` on the six paths in the production
worktree is empty — the working tree has not drifted from either commit either.

## 4. Exact commands (verbatim, observed output)

```
$ node --version
v24.21.0
$ git --version
git version 2.56.0
$ node -e 'process.stdout.write(process.execPath)'
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node

$ S=/fast/scratch/hyaku/tabi-r43/ExecDigestPins; mkdir -p "$S"
$ git clone --quiet --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout --quiet 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
$ git -C "$S/clone" rev-parse HEAD
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
$ git -C "$S/clone" status --porcelain          # empty output (clean)

$ for p in <the 6 frozen paths + claims.json>; do
    printf '%s -> %s\n' "$p" "$(git -C "$S/clone" cat-file -t 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:"$p")"; done
scripts/measure-c1-round43.mjs -> blob
scripts/playwright-firefox-egress-round43.mjs -> blob
.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs -> blob
.ufo/waves/round-43/counters/check-routed-defects-round43.mjs -> blob
.ufo/waves/round-43/fixtures/v0-fabrication.mjs -> blob
.ufo/waves/round-43/fixtures/tree-vs-blob.mjs -> blob
.ufo/waves/round-43/claims.json -> blob

$ cd "$S/clone" && sha256sum scripts/measure-c1-round43.mjs \
    scripts/playwright-firefox-egress-round43.mjs \
    .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
    .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    .ufo/waves/round-43/fixtures/v0-fabrication.mjs \
    .ufo/waves/round-43/fixtures/tree-vs-blob.mjs
23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  scripts/measure-c1-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  scripts/playwright-firefox-egress-round43.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c  .ufo/waves/round-43/fixtures/v0-fabrication.mjs
7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  .ufo/waves/round-43/fixtures/tree-vs-blob.mjs

$ for p in <the 6 frozen paths>; do
    printf '%s  %s\n' "$(git -C "$S/clone" cat-file blob 7ca6f018...:"$p" | sha256sum | cut -d' ' -f1)" "$p"; done
23afa29d5def9d4043f19e8be020ef0a50b3565f92ee5965facf70c4a95992a0  scripts/measure-c1-round43.mjs
3718235934d1fd06ffef2b976cfe09fabdc5af75d295bd78ee4d95b04e487c7e  scripts/playwright-firefox-egress-round43.mjs
6b8c875037b64ab5c9bb4735e2dc5b668ecf7f2ee9b407328658efca8c27126c  .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c  .ufo/waves/round-43/fixtures/v0-fabrication.mjs
7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  .ufo/waves/round-43/fixtures/tree-vs-blob.mjs

$ sha256sum /home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox
1f637a7cfe8f1a3ec814a7da7e38c360a3e3c39553b8c7245ac5d6643fd495eb  /home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox

$ readlink -f "$(node -e 'process.stdout.write(process.execPath)')"
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node
$ sha256sum "$(readlink -f "$(node -e 'process.stdout.write(process.execPath)')")"
7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c  /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node

# drift check
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --stat \
    7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c \
    -- .ufo/waves/round-43/claims.json
(no output — claims.json byte-identical freeze..HEAD)
$ sha256sum .ufo/waves/round-43/claims.json
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  .ufo/waves/round-43/claims.json
$ git cat-file blob 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/claims.json | sha256sum
290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029  -
```

Full transcript with all intermediate output: `w1/ExecDigestPins/command-transcript.txt`.

## 5. Supplementary corroboration (context, not the seat item)

Collected under the same frozen-revision method while the digests were being verified; recorded in
`w1/ExecDigestPins/supplementary-bindings.json`:

* All **8** `controlBindings` entries: sha256 of the committed blob at HEAD equals the claimed
  value (8/8), and every binding's `quote` string appears verbatim in the committed control bytes
  (8/8, minimum quote length 16 chars, so none is malformed under the ≥8-char rule).
* The committed round-43 receipt and witness files hash to the values recorded in the committed
  measure record's `bindings`: `receiptSha256 = 1b33d6a6b25681045bebf80bf371faa4c94db7ecc49298a7fe2f68536fe2d9bf`,
  `witnessSha256 = 0728d338f3b53a672b3404f548a2ed9bf982394c8660fcdf7a5c5789eeef2b2b` — both match.
* The only owned-root executable recorded in the committed receipt is
  `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`, whose sha256 equals the
  `firefoxBinSha256` pin — so the counter's `digest-mismatch:firefox-bin` check would not fire
  on the committed receipt.

## 6. Limitations, risks, and one advisory observation (no finding raised)

* **Scope.** This seat verified *pin integrity*, not the behaviour of the pinned instruments. The
  re-derivation says the bytes named by `claims.json` are exactly the bytes committed at the
  freeze; it does not by itself say the C1 chain admits anything (that is the L1's counting
  command) nor that the C2 checker is correctly implemented (separate seat). No claim verdict is
  asserted here.
* **Producer pins are environment facts, not repository facts.** The two `producerPins` are
  digests of files that live outside git (a Playwright browser build and an fnm-managed node
  install). They re-derive correctly on *this host at this moment*. They are not reproducible
  from the committed tree alone: a different machine, a Playwright cache rebuild, or an fnm
  version bump would change them without any repository change. The node pin is additionally
  PATH-sensitive — `which -a node` on this host lists five node binaries, and the two non-fnm
  ones (`/usr/bin/node` v26.12.0, sha256 `6dcdb9bb…`; mise `latest` v26.12.0, sha256 `caa24deb…`)
  do **not** match the pin. The C1 chain is therefore pinned to one specific node install, and any
  run under a different node binary must fail closed on `digest-mismatch:node` rather than silently
  proceed. This is a portability constraint to record, not a defect in the freeze.
* **Advisory observation — the firefox pin covers the launcher stub, not the browser engine.**
  `firefoxBinSha256` pins `/home/vgpnk/.cache/ms-playwright/firefox-1555/firefox/firefox`
  (579 008 bytes). `file` reports it as an ELF PIE executable and `ldd` shows no link-time
  dependency on `libxul.so`; `strings -a` shows the literal `libxul.so`, i.e. the engine is
  `dlopen`ed at runtime. A live run confirmed the mapping: for all five sampled
  `ms-playwright/firefox-1555` pids, `/proc/<pid>/maps` contained `libxul.so` — the 185 403 320-byte
  engine whose sha256 is `13290f667a6ba71cddd3394d38a546f86b2c602d73bccfe6cf1bc0f5afb2d3bc`, which
  appears **nowhere** in `claims.json` `producerPins`. The counter's check hashes only the
  owned-root `exe` path, so it binds the launcher, not the engine payload.
  I am **not** raising this as a finding: the declared residual model puts on-disk tampering of
  the producer outside the model ("on-disk pin tampering caught by committed-byte re-derivation"),
  no in-model do-nothing reach follows from it, and this seat did not demonstrate any such reach.
  Recording it here so the L1 can decide whether the round-43 evidence pointer should name the
  engine payload alongside the launcher. Frozen bytes were not touched; this is routed, not
  amended.
* **The C2 checker does not re-derive the six `frozenDigests`.** It checks the measure blob id and
  the control bindings; the frozen-digest re-derivation is a closure-time obligation. This seat
  discharges that obligation for the freeze commit and for HEAD.

## 7. Evidence paths

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecDigestPins/`:

| file | content |
|---|---|
| `digest-rederivation-receipt.json` | the receipt: 8 entries (kind, path, claims value, committed-blob sha256, worktree sha256, blob type, git blob id, match) + `allMatch: true` |
| `digest-rederivation-raw.json` | raw first-pass re-derivation output (committed vs worktree vs claims) |
| `command-transcript.txt` | every command and its observed output, in order |
| `supplementary-bindings.json` | 8 control bindings sha256 + verbatim-quote presence at HEAD; committed receipt/witness ↔ measure-record binding cross-check; owned-exe ↔ firefox-pin check |
| `pin-coverage-observations.txt` | the launcher-vs-engine observation, the `ldd`/`strings`/`/proc/<pid>/maps` evidence, and the multi-node PATH observation |

This report: `.ufo/waves/round-43/w1/ExecDigestPins.md` (a copy is also kept at
`.ufo/waves/round-43/w1/ExecDigestPins/report.md`).

**Scratch cleanup:** `/fast/scratch/hyaku/tabi-r43/ExecDigestPins/` was created with `mkdir -p`
and removed with `rm -rf -- "$S"` immediately before yield; the removal was verified with
`test ! -e "$S"`. Nothing was left under `/fast/scratch/hyaku/tabi-r43/` for this seat.

## 8. Tools used (no installs)

| tool | version | channel | note |
|---|---|---|---|
| node | v24.21.0 | pre-installed (fnm-managed, `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0`) | used for the digest script and as the `producerPins` node subject |
| git | 2.56.0 | pre-installed (`/usr/bin/git`) | clone / `cat-file` / `rev-parse` only |
| coreutils `sha256sum` | system | pre-installed | independent cross-check of the Node-computed digests |

No package was installed or upgraded; `pacman` was never invoked.

VERDICT ok all eight round-43 pinned digests (six frozenDigests paths + the firefox and node producerPins) re-derive byte-exactly from the committed bytes at 7ca6f018 and from the live filesystem, unchanged at HEAD, with a complete receipt and command transcript in the seat dir.
