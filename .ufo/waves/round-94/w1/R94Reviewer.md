# R94Reviewer — round-94 freeze & scored-evidence review (non-author, read-only)

Lane baseline: base `d7744d04`, freeze `2308b6ce` (2026-11-08T21:49:42-03:00), scored `012776cf` (2026-11-08T21:50:33-03:00) = master tip. No chromium run, no edits, no installs (nothing to install: `jq`/`node` only for read-only inspection). Scratch: none needed (no runs), none created.

## 1. claims.json frozenAt vs add-commit

`claims.json frozenAt = 2026-11-08T21:49:37-03:00`; `git log --diff-filter=A` → added in `2308b6ce` with committer time `2026-11-08T21:49:42-03:00`. frozenAt is 5 s **before** the add-commit time. PASS.

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin && git log --diff-filter=A \
  --format='%H %cI' -- .ufo/waves/round-94/claims.json
# 2308b6ce662d9ca6fc6a5a4d8f54af1599946143 2026-11-08T21:49:42-03:00
```

## 2. Instrument sha256: claims.json = instrument-sha256.txt = freeze bytes = master bytes

All three (driver/counter/battery) match at `2308b6ce`, `master`, and worktree; both manifests agree byte-for-byte.

```sh
for f in scripts/chrome-cdp-backendnode-collision-round94.mjs \
         scripts/check-backendnode-collision-round94.mjs \
         scripts/negatives-backendnode-collision-round94.mjs; do
  git show 2308b6ce:"$f" | sha256sum    # 518f40ff… / d7fd2cbe… / b750ee17…
  git show master:"$f"   | sha256sum    # identical
done
```
PASS.

## 3. No instrument/claims byte changed after the freeze

`git diff --stat 2308b6ce master -- 'scripts/*round94*' .ufo/waves/round-94/claims.json` → empty, rc 0. Freeze is ancestor of scored commit and of master (`merge-base --is-ancestor` YES/YES). PASS.

## 4. Controls in the freeze commit precede the scored run

`git show --stat 2308b6ce` lists all `controls/{battery,counter-*,rc,rc-attempt1,rc-attempt2,rc-setup-attempt1,receipt-*}.json/txt`, `probes/`, `sources/`, `claims.json`, `plans/round-94.md`, and the three scripts in the freeze commit (33 files). `scored/started-at.txt = 2026-11-08T21:49:50-03:00` (8 s after freeze commit); receipt `generatedAt = 2026-11-09T00:50:30.195Z` (= 21:50:30-03:00, inside the scored run); scored commit `012776cf` at 21:50:33-03:00. Order: freeze (21:49:42) → scored start (21:49:50) → receipt (21:50:30) → scored commit (21:50:33). PASS.

## 5. controls/rc.txt vs control JSONs; attempt disclosures vs plan §Controls

`rc.txt` (attempt 3) claims match each control JSON: positive `verdict clean, checkCount 165, findings []` = `counter-positive.json`; no-work-r93 ids (14: schema/nonce/driver-pin/pad/answer/leg-set/leg-arm/leg-pad/child-url/describe-chooser/describe-page/page-root/page-pierce/answer/child-files) = `counter-donothing-r93.json`; wrongsite ids (11, incl. iframe-targets/chooser/describe-*/page-root/page-pierce/cross-answer/answer + host ids) = `counter-wrongsite.json`; pad0 ids (7 incl. describe-page/page-root/page-pierce/cross-answer + pad/leg-pad/child-url) = `counter-pad0.json`; battery `{cases:74, ok:74, failed:[]}` = `battery.json`; setup-sigterm rc 2 `setup` "0 chromium processes swept" = `counter-setup-sigterm.json`; setup-driverkill rc 2 `setup` SIGKILL + `orphansSwept 14` = `counter-setup-driverkill.json`; busyport rc 2 `setup` = `counter-setup-busyport.json`. Attempt 1: `rc-setup-attempt1.txt` shows 12 chromium left after both signal controls — matches plan "left 12 chromium processes after both signal controls". Attempt 2: `rc-attempt2.txt:13` counter-SIGTERM → `rc=1 verdict=findings` and `:15-16` driverkill `swept=0, chromium-left=13` — matches plan "mapped a counter SIGTERM to `findings` rc 1 … orphan sweep matched 0 processes … 13 left". PASS.

## 6. Scored receipt: every leg re-read with jq (predicate clauses)

Receipt `corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` (see §7 identity): schema `tabi-chrome-cdp-backendnode-collision-r94`, nonce `tabi-r94-live-240f4c5100c3`, pad 300, reps 3, crossHost `localhost`, chromium `Chromium 155.0.8059.84 Arch Linux`, driverSha256 `518f40ff…`, failures `[]`, ports distinct `{http:19531, child:19532, cdp:19533}`.

- **Every leg (9/9):** exactly one chooser; integer B>0; sessions iframe (C/M) / page (S); describeChooser = INPUT type=file id=s backendNodeId=B, error null; answer error null + childFiles `[["tabi-r94-answer.txt",22]]`; one trusted click on #s; pageRoot `#document` documentURL=parentUrl; browserVersion `Chrome/155.0.8059.84`; 9 distinct browserIds; no leg `error`.
- **C (C-1..3, B=2, pad 0):** describePage (page) = `#document`, backendNodeId=2=B, documentURL=parentUrl, error null; pageRoot.backendNodeId=2=B; pierce inputS=0, maxBackendNodeId=15≥B; crossAnswer error exactly `Node is not a file input element`; filesAfterCross `[]`; 1 attached + 1 listed iframe target, same targetId=childFrameId, URL=childUrl.
- **M (M-1..3, B=302, pad 300):** describePage error exactly `No node found for given backend id`; pageRoot.backendNodeId=2≠B; pierce inputS=0, max=15<B (every id < B); crossAnswer error exactly `No node found for given backend id`; filesAfterCross `[]`; iframe-target clause as C.
- **S (S-1..3, B=305, pad 300):** describePage (page) = INPUT type=file id=s backendNodeId=305=B; pierce inputS=1, max=635≥B; crossAnswer null (none sent); 0 attached + 0 listed iframe targets.

All clauses hold in all 9 legs. PASS. Spot-extracts (reproducible):

```sh
jq -r '.legs[] | select(.arm=="C") | "\(.leg) \(.describePage|tojson) \(.pageRoot|tojson) \(.pagePierce|tojson) \(.crossAnswer|tojson)"' \
  corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json
# C-1 {"session":"page","B":2,"error":null,"nodeName":"#document",…,"backendNodeId":2,"documentURL":"http://127.0.0.1:19531/parent.html?leg=C-1"}
#     {"…","backendNodeId":2,"documentURL":"http://127.0.0.1:19531/parent.html?leg=C-1"}
#     {"error":null,"inputS":0,"nodes":13,"maxBackendNodeId":15}
#     {"session":"page","B":2,"error":"Node is not a file input element"}
# (C-2,C-3 identical modulo leg; M-1..3: describePage error "No node found for given backend id",
#  pageRoot backendNodeId=2, pierce max 15 < 302, cross error "No node found for given backend id";
#  S-1..3: describePage INPUT backendNodeId=305, inputS=1 max 635, cross null)
```

## 7. Receipt identity & receiptSha256

`cmp scored/live-receipt.json corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` → identical (exit 0). Both sha256 = `8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354` = `receiptSha256` in `scored/c1-live.json` and `scored/c1-live.record.json`. Corpus receipt added in `012776cf`. PASS.

## Findings, residual risk, verification gaps

- No defects found in the seven assigned checks; every number and string claimed in plans/round-94.md §Controls and in the scored record was reproduced from committed bytes.
- Residual: frozenAt is a self-stamped string; the 5 s margin proves the field was *written* before the commit time, not when the claim bytes were first composed. Unavoidable with git; nothing here contradicts it.
- Gap (out of scope): probe receipts (`probes/probe*.json`) and staged Blink `sources/sha256.txt` were not re-verified; no chromium re-run was performed (read-only brief), so this review establishes internal consistency, not a live reproduction.
- Evidence artifact: this report is the finding; measurements above are drawn from `.ufo/waves/round-94/scored/live-receipt.json` (= `corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json`, sha256 `8070fcdc…`).

VERDICT C1: neutral
