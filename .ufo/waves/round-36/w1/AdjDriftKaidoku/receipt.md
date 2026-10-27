# Receipt — C1 by-hand verification of the 3 MOVED rows (kaidoku SKILL.md)

Seat: `AdjDriftKaidoku` (wave w1, round 36, tabi lane). Method: read-only `git show`/`git diff` on
`/home/vgpnk/Projects/shokunin/kaidoku-shokunin`; no worktree reads (the worktree HEAD `ece55864c9bad5caac03b95cc95f2372346f80a0`
has ` M SKILL.md` and was not used for any claim).

Objects:
- pin = `49096c7e6f226af0c750c4b003be58883cb6049f` (cite commit in both ledgers)
- head = `1ed29de2cdd6061315fb2f5478d5029b7d570675` (delta head for `kaidoku` in `.ufo/waves/round-36/baseline/c1-delta-pins.json`)
- `git merge-base --is-ancestor <pin> <head>` → YES. `SKILL.md` pin 1405 lines, head 1568 lines.

Script reproducing everything below: `verify.sh` (this dir); raw output `verify.log`
(sha256 `15fb26837b49456a16417ecf283fa53b5e3e12cd987902dd66b181529184cf6e`).
Ledger under test: `corpus/adjacency-screen-drift.tsv`
(sha256 `bde87e24da7daace476270e5f7c052df591094613ee27f231a879e7e9b1debf2`), 307 data rows,
status histogram `3 moved / 304 unchanged` — the 3 moved rows are exactly the ones I was given.

## 1. Side by side (pin line vs named head line)

```
--- pin SKILL.md:585  ==  head SKILL.md:748 (shift +163) ---
PIN :585 | | `GoApiSnapshot` WARN `Falling back from X to Y` | Lower patch data used; the next `GoRttiMapper` line still says `X` | Requested-label echo: never cite the mapper line as selection. Round 17 observed only fallback to the base (Y = M.m.0); round 18 observed an intermediate patch fallback (1.24.13 → 1.24.6, `.ufo/waves/round-18/runs/real-kimi-webbridge/logs/rea-ghidra-ZSUHpG/ghidra.log:68`) |
HEAD:748 | | `GoApiSnapshot` WARN `Falling back from X to Y` | Lower patch data used; the next `GoRttiMapper` line still says `X` | Requested-label echo: never cite the mapper line as selection. Round 17 observed only fallback to the base (Y = M.m.0); round 18 observed an intermediate patch fallback (1.24.13 → 1.24.6, `.ufo/waves/round-18/runs/real-kimi-webbridge/logs/rea-ghidra-ZSUHpG/ghidra.log:68`) |
--- pin SKILL.md:621  ==  head SKILL.md:784 (shift +163) ---
PIN :621 | | Swiss Go 1.24/1.25 carrier, bootstrap OK, `Go analysis failure` + `Invalid index: N` or `Unable to read past EOF: A, B` | Run `swiss-misread.py` on the carrier; an exact H1 match attributes the abort to the `OldMapType` binding | 3 carriers observed (aether calibrated; s1246-swiss-nethttp and kimi-webbridge held out); Ghidra 12.1.4, x86-64 ELF |
HEAD:784 | | Swiss Go 1.24/1.25 carrier, bootstrap OK, `Go analysis failure` + `Invalid index: N` or `Unable to read past EOF: A, B` | Run `swiss-misread.py` on the carrier; an exact H1 match attributes the abort to the `OldMapType` binding | 3 carriers observed (aether calibrated; s1246-swiss-nethttp and kimi-webbridge held out); Ghidra 12.1.4, x86-64 ELF |
--- pin SKILL.md:652  ==  head SKILL.md:815 (shift +163) ---
PIN :652 | | swiss-misread | probe / kaidoku | `python3 -I -B .../swiss-misread.py --carrier <PATH> --golang-root <GOLANG_DIR>` ... reads the carrier and installed snapshot JSON, JSON on stdout, never executes the carrier. amd64 only; the `walk` channel has false positives (unmasked variadic bit, notesmd-cli, kimi-webbridge) and ...
HEAD:815 | | swiss-misread | probe / kaidoku | (same line, byte-identical, 906 bytes)
```
(The two 906-byte lines print in full in `verify.log` §2.)

## 2. Byte equality after trim

```
pin:585 head:748  sha=4a011a192b38c0e3a04e433384e19a7fbbea30fb86fb8c01ec978ff4a7095536  bytes=398/398  trim-equal=yes  raw-equal=yes
pin:621 head:784  sha=c936a4cf28e373f473df4d2b2dcf7dab80fd858f2d9ea9e1d8624c2e6456278c  bytes=350/350  trim-equal=yes  raw-equal=yes
pin:652 head:815  sha=d8b8cdd83a63733fa41f6f7c70cbe9ee96b87988302626616c97efad60e84b2a  bytes=906/906  trim-equal=yes  raw-equal=yes
```
Raw sha256 equal (not merely trim-equal): the move is byte-preserving, no whitespace/Unicode drift.

## 3. No un-named verbatim occurrence at head

`grep -nxF` with each relocated line as the fixed needle, over the whole head file:

```
pin line 585 -> head occurrences: 748      (in the PIN file itself: 585 only)
pin line 621 -> head occurrences: 784      (in the PIN file itself: 621 only)
pin line 652 -> head occurrences: 815      (in the PIN file itself: 815 only)
```
So each pin line exists exactly once at head, at the line the ledger names, and exactly once at the pin
revision. No duplicate/copy the ledger failed to name, and the old occurrence is genuinely gone (head
585/621/652 now hold unrelated prose: `closed.** Re-capture ...`, `pinned per client ...`, `do not re-flag.`).

## 4. The screen rows those refs point at still quote the moved text

`corpus/adjacency-screen-browser.tsv` lines 62-64 (all pinned at `49096c7`):

```
…:SKILL.md:585  not-browser-sense  -  Lower patch data used; the next `GoRttiMapper` line still says `X`
…:SKILL.md:621  not-browser-sense  -  Run `swiss-misread.py` on the carrier; an exact H1 match attributes the abort to the `OldMapType` binding
…:SKILL.md:652  not-browser-sense  -  reads the carrier and installed snapshot JSON, JSON on stdout, never executes the carrier
```

`grep -nF` of each quoted fragment over head SKILL.md:

```
quote -> head lines: 748   [Lower patch data used; the next `GoRttiMapper` line still says `X`]
quote -> head lines: 784   [Run `swiss-misread.py` on the carrier; an exact H1 match attributes the abort to the `OldMapType` binding]
quote -> head lines: 815   [reads the carrier and installed snapshot JSON, JSON on stdout, never executes the carrier]
```
Each fragment occurs exactly once at head, on the relocated line — the citations survive the move
unchanged, and nothing else in the file now carries them.

## 5. kimi-webbridge still present, in the same role the screen notes claim

```
head:748 count=1   → `.../round-18/runs/real-kimi-webbridge/logs/rea-ghidra-ZSUHpG/ghidra.log:68`  (round-18 REA run dir)
head:784 count=1   → `3 carriers observed (aether calibrated; s1246-swiss-nethttp and kimi-webbridge held out)`  (held-out parity carrier)
head:815 count=1   → `walk channel has false positives (unmasked variadic bit, notesmd-cli, kimi-webbridge)`  (walk-channel false positive)
```
The three `not-browser-sense` dispositions in `adjacency-screen-browser.tsv:62-64` are exactly these
three roles; relocation changed neither the token nor its sense, so the dispositions remain supported at head.

## 6. Why the lines moved: pure insertion, zero edits

`git diff <pin> <head> -- SKILL.md`:
```
 SKILL.md | 171 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 167 insertions(+), 4 deletions(-)
hunk old-side headers: 328,10  357,6  374,6        (all before line 585)
deleted lines: 4, all unrelated sqfs-triage text at old ~328
hunks overlapping [585,652]: 0
shift: 748-585=163  784-621=163  815-652=163   (= 167-4 net)
diff lines whose text is one of the three relocated lines: 0
```
Every hunk lies above line 585, the only deletions are four unrelated lines, and no `+`/`-` diff line
carries any of the three rows' text: the rows sit in untouched regions and were shifted by a constant
+163. That is the mechanical form of "moved verbatim", independent of the sha comparison.

## 7. Independent re-derivation of the whole ledger (cross-check, not a claim run)

Re-implemented the ledger's status rule directly from git objects (status `unchanged` iff the cited line
is byte-equal at the same line number at the lane's frozen delta head; else `moved`), over all 307 rows
and all 9 cited pins:

```
data rows=307 checked=307 missing_at_head=0 status_mismatches=0
moved rows in ledger: 3
```
No row's status disagrees with a from-object re-derivation, and no cited file/line is missing at head.
This does not substitute for the frozen counter (`c1-adjacency-sweep-v4.mjs`) — the C1 measurement is
the counter's — it only shows my three rows are not a special case of a systematic ledger error.

## 8. Reproduction

```
S=/fast/scratch/hyaku/tabi-r36/AdjDriftKaidoku; export TMPDIR="$S/tmp"
bash <this dir>/verify.sh > $S/verify.log 2>&1   # read-only git; exit 0
```
