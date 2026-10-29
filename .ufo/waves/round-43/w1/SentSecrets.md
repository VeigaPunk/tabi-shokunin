# SentSecrets — secrets and scratch discipline audit (tabi round 43, wave 1)

Seat: `SentSecrets` · role: sentinel (leaf) · axis: operability
Milestone: secrets and scratch discipline audit
Scope executed: every file this round adds at
`git diff --name-only ab592825cd195599822ca227f7768914df208201 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
(24 files), plus the live `.ufo/waves/round-43/` wave tree (which the seat item scopes for the >10 MiB check
and which is where seat artifacts land before the wave-close commit).

**VERDICT: finding** — 2 findings (F1 remediated during the seat, F2 live in the frozen instrument bytes),
2 named checks clean, 1 informational.

---

## Tooling

No tool was installed or upgraded. `/home/vgpnk/.omp/agent/RULES.md` was read first (operator directive
2026-10-19); the PACMAN GUARD (host-wide pause) was honored — no `pacman` transaction of any kind was run.
Channels used: stock `git`, `node` (v24.21.0, already installed), `grep`/`find`/`sha256sum` from PATH, and
Python 3 stdlib for the entropy scan. Nothing to record beyond "no install".

Scratch root used: `/fast/scratch/hyaku/tabi-r43/SentSecrets/` (created by me, deleted before yield).
Probe byproducts under `/tmp` created by my own controlled Playwright launches were removed
(8 `playwright_chromiumdev_profile-*` dirs created 17:58–18:02 were `rm -rf`'d; re-scan shows none of mine
remain). I created **no** git fixture repo, **no** commit, and wrote **nothing** outside
`.ufo/waves/round-43/w1/SentSecrets/` and this seat's own scratch.

---

## Check 1 — no PEM / PRIVATE KEY / Ed25519 private material committed

**Result: PASS on the committed bytes.** Two transient, non-committed exposures were observed in the live
wave tree and both were remediated during the seat (F1).

### 1a. Pattern scan over the 24 added files

```
$ for f in $(git diff --name-only ab592825 ab592825 7ca6f018); do grep -Hn -- '-----BEGIN' "$f"; done
.ufo/waves/round-43/measure/c1-measure-r43.json:6:  "wrapper": "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAEYYWsPtD35E9SEtw/PHWjdChqehBYLLP4MiLZiC3Lm0=\n-----END PUBLIC KEY-----\n",
.ufo/waves/round-43/measure/c1-measure-r43.json:7:  "witness": "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAqbSEcUj0w8JridttFFsMqgcNupuNSSB1ti17YmwKsis=\n-----END PUBLIC KEY-----\n"
.ufo/waves/round-43/sources/crypto.html:910:header and footer lines (e.g. <code>-----BEGIN PUBLIC KEY-----</code>). PEM strings can
```

Only **two** PEM blocks in the whole added set, both `PUBLIC KEY`, both in the committed measure record —
the wrapper and witness Ed25519 public halves, which is exactly the intended shape. The third hit is MDN
prose inside the fetched `crypto.html` source page.

### 1b. Entropy / DER scan (not just grep)

The pattern scan alone cannot distinguish a public SPKI blob from a raw 32-byte Ed25519 seed, so I also
scanned every added file for the Ed25519 PKCS#8 seed prefix `302e020100300506032b657004220420` and the SPKI
public prefix `302a300506032b6570032100`, in raw DER, base64 and hex form, plus a Shannon-entropy token
scan (≥40-char tokens, per-token entropy ≥4.0):

```
=== CHECK 1e: ed25519 PKCS8 seed DER prefix (302e0201...0420) in the 24 added files ===
.ufo/waves/round-43/measure/c1-measure-r43.json: ['spki-b64']
(no 'pkcs8' entry above => no private seed material anywhere in the added set; 'spki' = public key, expected)
```

The only hit is `spki-b64` — the public key, expected. **No `pkcs8` entry in any of the 24 files.** The
entropy scan (`evidence/entropy-scan.txt`) shows every high-entropy token in the six new instruments is a
path or a repo-relative filename (`ufo/waves/round-43/counters/c1-signature-bound-v5`,
`cache/ms-playwright/firefox-1555/firefox/firefox`, …) — no opaque secret-shaped blob.

### 1c. The committed PEMs really are public keys, and the signature verifies

```
$ node -e "...createPublicKey(d.pubkeys.wrapper)..."
  wrapper asymmetricKeyType= ed25519 key.type= public
  witness asymmetricKeyType= ed25519 key.type= public
  witness attestation key type= ed25519
  signature verifies: true
```

Both committed PEMs load as `key.type === 'public'`, and the measure record's Ed25519 signature verifies
under its own wrapper public key over the canonical unsigned form. So no mislabeled private key is hiding
behind "PUBLIC KEY" armor.

### 1d. The per-invocation run key really is not persisted (design cross-check)

`scripts/measure-c1-round43.mjs` mints the run keypair per invocation (`generateKeyPairSync('ed25519')`,
line 205) and the private half is used only in-process at line 283 (sign the measure record) and line 304
(sign the counter challenge on fd4). The witness child mints its own separate keypair (`WITNESS_SRC`,
line 137) and exports only the public half + signature. No `fs.write*` call in either file receives a
private key. Consistent with the claim's residual model.

### F1 (severity: low-medium, REMEDIATED) — Ed25519 private keys transiently present in the wave tree, un-ignored

**Evidence (observed live, 17:52–17:59):**

```
$ find .ufo/waves/round-43 -name '*.pem' -printf '%m %s %p\n'
644 119 .ufo/waves/round-43/w1/MutC1Sig/evidence/synthetic/syn-self/attacker-private.pem
644 119 .ufo/waves/round-43/w1/MutC1Sig/evidence/synthetic/syn-tampered/attacker-private.pem
644 119 .ufo/waves/round-43/w1/MutC1Sig/evidence/synthetic/syn-nosig/attacker-private.pem
600 119 .ufo/waves/round-43/w1/CritC1ReachSynth/synthetic-wrapper-private.pem      (observed 17:52, already gone by 17:55)

$ git check-ignore -v <each path>          → NOT-IGNORED for all four
$ grep -rl -- '-----BEGIN.*PRIVATE KEY' .ufo/waves/round-43/   → the four .pem paths
```

**Exploit path:** `.gitignore` has no rule covering `*.pem` (only `.ufo/interactive-sessions/`,
`.ufo/waves/*/scratch/`, `.ufo/waves/*/*.err`). Wave seat dirs *are* committed wholesale at wave close —
`git ls-tree -r HEAD | grep -c '^\.ufo/waves/round-42/w1/'` = **858** files tracked under round-42/w1,
**7635** repo-wide. A wave-close `git add .ufo/waves/round-43` landing in the window between observation and
removal would have committed four Ed25519 private keys into git history permanently (git history is not
scrubbed by deletion).

**Impact:** private-key material in an append-only repo history, in a wave whose whole C1 narrative is
"the private half never persists" — the two would be indistinguishable to a later reader. No production
secret was exposed: these were test-generated synthetic keys (the MutC1Sig pair signs synthetic forgery
fixtures; the CritC1ReachSynth key signs a synthetic paired-key attack), and I confirmed the MutC1Sig
`attacker-private.pem` corresponds to the *attacker* public key in the synthetic measure records, i.e. the
exact bytes the attack needs, not a live signing key.

**Smallest remediation (applied by the owners, verified by me):** delete the `.pem` files before wave close;
the evidence is the JSON results plus the pair-attack script, which mints a fresh keypair on every run.
`CritC1ReachSynth` removed its key unprompted; I notified `MutC1Sig` (message delivered, ack received) and it
removed its three at 17:59 and regenerated `evidence/SHA256SUMS.txt`.

**Post-remediation re-scan (final state):**

```
$ find .ufo/waves/round-43 -name '*.pem' | wc -l        → 0
$ grep -rIl -- '-----BEGIN.*PRIVATE KEY' .ufo/waves/round-43/ | grep -v /sources/
  .ufo/waves/round-43/w1/MutC1Sig.md            (prose only: "grep -rl "PRIVATE KEY" <seat dir> → no match")
  .ufo/waves/round-43/w1/MutC1Sig/report.md    (prose only, same line)
```

Both residual hits are the remediation sentence itself; no key body follows either armor line.
**Residual risk that outlives this seat:** there is still no `.gitignore` guard for key material anywhere in
the repo, so the same seat can repeat it in the next wave. The wave-close committer should verify
`git status --porcelain` shows no `*.pem`/`*key*` path under `.ufo/waves/round-43/` before `git add`.

---

## Check 2 — no hardcoded `/tmp` in the new instruments; scratch paths honor TMPDIR/--scratch

### 2a. Literal `/tmp` in the six new instruments — PASS

```
$ grep -Hn '/tmp' scripts/measure-c1-round43.mjs scripts/playwright-firefox-egress-round43.mjs \
    .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs \
    .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    .ufo/waves/round-43/fixtures/tree-vs-blob.mjs .ufo/waves/round-43/fixtures/v0-fabrication.mjs
(grep exit 1 — no /tmp literal in any instrument)

$ git diff ab592825 7ca6f018 | grep '^+[^+]' | grep -c '/tmp'
0
```

Zero `/tmp` literals across all **11,894** added lines of the round diff. The `/tmp` strings that appear in
`LOG.md`/`SCORECARD.md` are pre-existing lines (historical round-1…r-42 notes), not additions — confirmed by
scanning the added-lines set rather than the files.

Scratch plumbing is argument-driven, not path-driven: `measure-c1-round43.mjs --scratch <dir>` (line 193)
→ `fs.mkdirSync(scratchPath)` (240) → forwarded to the driver as `--scratch scratchPath` (243) with
`HYAKU_SCRATCH` in the child env; the driver's `--scratch` (403) → `mkdtempSync(join(scratchRoot,
'tabi-r43-pwegress-'))` (429) → `rmSync(S)` on exit (431); the two fixtures take `--work <dir>` (26/30) and
build their git fixtures under `path.join(path.resolve(work), …)` after asserting
`git rev-parse --show-toplevel === D`. No absolute host path is baked into any scratch path.

### F2 (severity: low-moderate, LIVE in the frozen bytes) — the browser profile escapes the declared scratch root

**Evidence (instrument source):**

```
$ grep -n -E '\bprofile\b' scripts/playwright-firefox-egress-round43.mjs
285:  const profile = mkdtempSync(join(profileRoot, 'profile-'));
$ grep -n 'launch(' scripts/playwright-firefox-egress-round43.mjs
286:  const browser = await firefox.launch({ headless: true, firefoxUserPrefs: {…} });
$ grep -n 'TMPDIR' scripts/playwright-firefox-egress-round43.mjs
(grep exit 1 — the driver never sets TMPDIR for the browser child)
```

The driver creates a per-run profile directory **under the caller's `--scratch`**, stores it in a local
`profile` that is **never read again** (line 285 is the only occurrence of the identifier), and then launches
the browser without it — `firefox.launch()` takes no profile argument (no `launchPersistentContext`, no
`userDataDir`; grep confirms neither is present), and `node:os`'s `tmpdir` is imported at line 26 and never
used. So the browser picks its own profile directory from the **ambient TMPDIR**, which on this host is
`/tmp` when TMPDIR is unset.

**Evidence (behavior, controlled launch, profile arg read from `/proc/<pid>/cmdline`):**

```
TMPDIR=/fast/scratch/.../tmpdecisive  →  FIREFOX -profile ARG = /fast/scratch/.../tmpdecisive/playwright_firefoxdev_profile-74oRJn
TMPDIR unset                          →  FIREFOX -profile ARG = /tmp/playwright_firefoxdev_profile-2NF1tV
```

So Playwright *does* honor TMPDIR — but the instrument never points TMPDIR at its own `--scratch`, and never
binds the profile dir it made. Result: browser profile state lands outside the declared scratch boundary.

**Evidence (it already happened in the frozen measurement — committed bytes):**

```
$ grep -o '/tmp/[^" ]*' corpus/evidence/round43/playwright-egress/receipt.json | sort | uniq -c
    132 /tmp/playwright_firefoxdev_profile-7Aj7Us
    132 /tmp/playwright_firefoxdev_profile-jUJmiQ
$ grep -o '\-profile [^"]*' corpus/evidence/round43/playwright-egress/receipt.json | sort -u
-profile /tmp/playwright_firefoxdev_profile-7Aj7Us -juggler-pipe -silent
-profile /tmp/playwright_firefoxdev_profile-jUJmiQ -juggler-pipe -silent
```

**264 absolute `/tmp` path strings are inside the committed round-43 evidence**, and the driver's exit hook
(`rmSync(S)`) removes only its own scratch subtree — it never removes the browser profile, which lives
outside `S`. A leftover `/tmp/playwright_firefoxdev_profile-OcEGP1` (17:44, this round) was present on the
host at scan time; the two profiles recorded in the committed receipt are gone (Playwright cleans them on
browser close), but a crashed or killed run leaks the directory. `/tmp` also holds 22–56 pre-existing
`playwright-artifacts-*` / `playwright_chromiumdev_profile-*` dirs from other Playwright CLI users on this
host — I did not attribute those to the round-43 instrument (it uses the library API, not the CLI runner).

**Impact:** (i) browser state (profile dir, caches) escapes the instrument's own scratch root and is not
covered by its cleanup; (ii) the committed receipt embeds absolute host `/tmp` paths, so the evidence is
host-tied and re-runs produce different bytes; (iii) the instrument depends on an **inherited** TMPDIR, which
the round's own rule 4 forbids relying on ("never rely on an inherited TMPDIR"). No secret is exposed — the
profile holds only loopback-fixture state (the fixture server binds 127.0.0.1) — so this is an operability /
hygiene defect, not a credential leak.

**Smallest remediation (NOT applied — the instrument bytes are frozen at `7ca6f018`; routed as a finding per
the round contract):** in `scripts/playwright-firefox-egress-round43.mjs`, either pass the already-created
profile dir to the browser (`firefox.launchPersistentContext({ userDataDir: profile, … })`) or export
`TMPDIR=<scratchRoot>` into the browser child's env, and drop the dead `profile` local and the unused
`tmpdir` import. Note this also touches the `measure-c1-round43.mjs` digest pin for that file, so it cannot
be done inside the frozen round — it is a round-44 item, and the C1 claim should not be cited as
"scratch-contained" until it lands.

---

## Check 3 — no pacman invocation anywhere in the new bytes

**Result: PASS.**

```
$ grep -Hn -E 'pacman' scripts/measure-c1-round43.mjs scripts/playwright-firefox-egress-round43.mjs \
    .ufo/waves/round-43/counters/*.mjs .ufo/waves/round-43/fixtures/*.mjs
(grep exit 1 — none)

$ git diff ab592825 7ca6f018 | grep '^+[^+]' | grep -n -i 'pacman'
11073:+WAVE-DONE. No tool installs; no pacman transactions (pause honored).
11094:+digests. No tool installs; no pacman transactions.
```

Both hits are prose in the appended `LOG.md` round-43 entry asserting that no pacman transaction ran. A wider
sweep for *any* install-channel invocation across all added lines
(`sudo pacman|uv tool install|cargo install|npm i(nstall)? -g|pip install|apt-get|yay `) returns nothing.
`scripts/check-sources.mjs` and the repo's other tooling were untouched by this round. Host-wide pacman
transactions remain paused and were honored by this seat.

---

## Check 4 — no file >10 MiB in the round-43 wave dir

**Result: PASS.**

```
$ find .ufo/waves/round-43 -type f -size +10M -printf '%s %p\n'
(empty)

$ git ls-tree -r -l HEAD -- .ufo/waves/round-43 | awk '$4>10485760 {print $4,$5}'
(empty)
$ git ls-tree -r -l 7ca6f018 | awk '$4>10485760 {print $4,$5}'
(empty)   # no blob >10 MiB anywhere in the frozen tree
```

Largest files in the wave tree at scan time (live, 696 files, 10.8 MB total):

```
   1268515  .ufo/waves/round-43/w1/SentEgressAudit/failed-run-1/receipt.witness.json
   1268515  .ufo/waves/round-43/measure/failed-run-1/receipt.witness.json
   1212196  .ufo/waves/round-43/w1/MutC2Bind/fixture-patches/0007-…-TREE-object.patch
   1187101  .ufo/waves/round-43/w1/MutC2Bind/fixture-patches/0008-…-rebinding-control-bytes-clai.patch
   1171017  .ufo/waves/round-43/w1/SentEgressAudit/failed-run-1/receipt.json
   1171017  .ufo/waves/round-43/measure/failed-run-1/receipt.json
    681625  .ufo/waves/round-43/sources/crypto.html
```

**Informational (not part of my four checks):** six wave files exceed **1 MiB** (max 1.21 MiB). The repo
carries a separate >1 MiB rule (r41 D1 class — directory commits skip >1 MiB new files; the frozen commit
message `ba433c94` records exactly this trap being hit and worked around with explicit file commits). The
wave-close committer should add those six by explicit path, not by directory.

---

## Cross-checks that support the above

- **Frozen bytes are the frozen bytes.** `git diff --stat 7ca6f018 -- <the 24 files>` is empty: the working
  tree matches the frozen commit for every scoped file, so scanning the worktree scans the frozen bytes.
- **The digest pins are honest.** Re-deriving all six `frozenDigests` from the worktree files: **MATCH** for
  every one (`measure-c1-round43.mjs`, `playwright-firefox-egress-round43.mjs`, `c1-signature-bound-v5.mjs`,
  `check-routed-defects-round43.mjs`, `v0-fabrication.mjs`, `tree-vs-blob.mjs`).
- **No secret-shaped values in the evidence.** Regex sweep of the committed round-43 receipt/witness for
  `TOKEN=|SECRET=|PASSWORD=|API_KEY=|CREDENTIAL=` → no hits; the witness records `environ` **names only**
  (18 names, no values); no `Authorization`/`Cookie`/`Bearer` material in the receipt.
- **Round-43 files outside the frozen diff** (untracked `corpus/knowledge/receipt-authenticity-signing-round-43.md`,
  modified `corpus/README.md`) were also swept for the same four patterns: clean on all four.

---

## Limitations (what I did *not* do)

1. I did not execute the round-43 instruments (`measure-c1-round43.mjs`, the driver, the counters). F2's
   behavioral half is established by controlled Playwright launches I ran myself in my scratch, plus the
   `-profile` arguments recorded in the committed receipt — not by re-running the frozen chain.
2. The >10 MiB and PEM scans are point-in-time over the live wave tree while ~30 peer seats are writing
   into it. Re-run `find .ufo/waves/round-43 -name '*.pem'` and the >10 MiB check immediately before the
   wave-close commit; the tree grew from 515 to 696 files during this seat.
3. I scanned for Ed25519/PEM material specifically (plus a generic entropy pass and a credential-regex
   pass). A key in a non-Ed25519, non-PEM encoding that also escapes the entropy heuristics would not be
   caught.
4. I did not audit the two `sources/*.html` pages for embedded secrets beyond the PEM-armor scan; they are
   verbatim MDN and git-scm renders whose sha256 are pinned in `corpus/SOURCES.md` (S150/S151) and are not
   produced by the round.
5. Scratch-hygiene checks cover the six new instruments only; the two peer fixture generators under
   `.ufo/waves/round-43/fixtures/` were included, but pre-existing round-42 instruments were not re-audited.

---

## Evidence files (all under this seat's directory)

- `evidence-check1-secrets.txt` — PEM armor scan (added files + whole wave tree), PEM file inventory,
  gitignore coverage, Ed25519 DER/base64/hex scan, public-key type + signature verification.
- `evidence-check2-3-scratch-pacman.txt` — `/tmp` literal scan (instruments + all added lines), scratch
  plumbing (`--scratch`/`--work`/`mkdtemp`), pacman and install-channel sweeps.
- `evidence-check2b-tmpdir-empirical.txt` — controlled-launch proof of Playwright's TMPDIR behavior, the
  dead `profile` local, and the `/tmp` strings inside the committed receipt.
- `evidence-check4-sizes.txt` — >10 MiB scans (worktree, HEAD tree, frozen tree), largest-file listings,
  wave-dir totals.
- `evidence-scope-and-pins.txt` — the 24 scoped files, worktree-vs-frozen byte equality, HEAD/frozen revs,
  digest-pin re-derivation, measure-record key types + signature verification.
- `evidence-added-files.txt` — `git ls-tree -r -l` blob sizes for the frozen wave dir.
- `entropy-scan.txt` — per-file Shannon entropy and ≥40-char token/entropy≥4.0 listings for the added set.

---

VERDICT finding — committed bytes are clean on all four checks (no private keys, no `/tmp` literal, no pacman, no >10 MiB file), but two findings stand: F1 (four Ed25519 private-key PEMs transiently un-ignored in the wave tree — remediated by their owners, verified zero remaining, and the repo still has no `*.pem` guard) and F2 (the frozen driver creates a scratch profile dir it never binds, so the browser profile escapes `--scratch` into ambient TMPDIR/`/tmp` — 264 absolute `/tmp` paths are already inside the committed round-43 receipt).
