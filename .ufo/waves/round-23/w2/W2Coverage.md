# W2 coverage attack — tabi round 23

Seat `L1Tabi23.W2Coverage`. Baseline `a89f1935f523a64b00991d792fca6a8c0d321948` (= `HEAD`). Read-only git.

## Verdict

**Fails as stated, in the unsafe direction: the frontier denies measured ground the lane already holds.**
The vocabulary is genuinely new (0 hits at baseline), but the note's own synchronizer-token test was
already satisfied by a captured, CDP-receipted round-8 submit — so `no submit carrying any of those
shapes has been executed or captured` is false on committed bytes. `documented taxonomy held; measured
submit still untested` claims less than the corpus shows, at the one place a frontier must be exact. It
does not quietly claim a measured surface; it forfeits one.

## Findings

**F1 (blocking, coverage+calibration).** The note's "no token field" (§6) and the frontier's "no submit
carrying any of those shapes" are contradicted by round-8 bytes. `git show a89f193:corpus/knowledge/stateful-fixture-evidence.md | sed -n '276,281p'`
→ `<input type="hidden" id="token" name="token" value="%s">`; `:78` → "the token is a CSRF-*shaped*
instrument". Captured pair: `git show a89f193:corpus/evidence/w9-tabi-b91/runs/xclient-consume/rep1/a-form.html | sed -n '8p'`
→ `value="6463006273e5bb35"`; `git show …/runs/replay-consumed-post/rep1/facts.json | head -20` →
`"tokenShape": {"len": 16, "cls": "lower-hex"}`; `git show …/rep1/ledger-after.json` → seq 7
`{"kind":"apply","bodyBytes": 53}`, seq 9 `{"kind":"submit-refused","reason":"token-consumed"}`. Under the
note's own line-49 definition ("appears both in the document and in the submitted body") this is a
measured paired occurrence. Correction: state in §6 and the README row that the paired-occurrence shape
was captured in round 8 on a lane-authored fixture (`w9-tabi-b91`, `replay-consumed-post`), that the
fixture token is an idempotency guard rather than an asserted defence, and that what remains untested is
real-site classification plus the double-submit and custom-header shapes.

**F2 (provenance).** The novelty command at `corpus/README.md:556` no longer reproduces its recorded
result: `grep -rniE 'synchroni[sz]er token|double-submit|custom request header' corpus/knowledge/*.md SKILL.md corpus/*.md`
→ exit 0, 9 matches in 3 files, including README:556 itself. At the named baseline it is true:
`git grep -niE … a89f193 -- corpus/knowledge SKILL.md corpus/README.md corpus/SOURCES.md` → rc 1;
assigned broad pattern `git grep -rniE 'synchroni[sz]er|double-submit|custom request header' a89f193 -- corpus SKILL.md | wc -l`
→ `0`. Claim holds, evidence pointer does not. Correction: pin the command to `a89f193` (or the pre-round
path set), since the glob now includes the file carrying the claim.

**F3 (metric not yet evaluable).** `git grep -lE '^source: S10[23] ' HEAD -- corpus/knowledge | wc -l` → `0`;
baseline → `0`. Cause: `git status --short` → `?? corpus/knowledge/csrf-defense-shape-boundary.md`,
` M corpus/SOURCES.md`; `git ls-tree HEAD corpus/knowledge | grep -i csrf` → rc 1. The pattern is sound
(`grep -nE '^source:' corpus/knowledge/csrf-defense-shape-boundary.md` → lines 3, 4). Until a landing rev
exists, `after: 1` has nothing to point at and must be reported pending, not measured.

**F4 (freeze record).** `claims.json` has no `revisions` block, so post-freeze corrections have no home:
`python3 -c "import json;d=json.load(open('.ufo/waves/round-23/claims.json'));print(list(d));print('revisions' in d)"`
→ keys end at `notClaimed`; `False`.

**F5 (citation layer, self-inconsistent).** Note line 78 cites `multi-step-journey.md §4` for the
`typed`/`link`/`form_submit` witness; `grep -nE '^#+ ' corpus/knowledge/multi-step-journey.md` → §4
"Determinism boundary" at 171, while the classes sit in §2 (rows 80–85) and §6 (234–235); `sed -n '171,197p'`
holds no classification. The note's own E2 says a right quote with a wrong locator still fails the Gate.
Correction: cite §2 and §6.

**F6 (credit scope).** `corpus/README.md:546-550` drops the note's `[INFERENCE]` tags on the three receipt
tests and reads as if the sheet supplies them (note lines 49–51, 59–61 mark them lane inference). "Can now
be classified" also overstates capability: `git show a89f193:corpus/evidence/w9-tabi-b91/journey.mjs` lines
334, 391, 414 already read the document token into `tokenShape` before the taxonomy existed. Correction:
scope the credit to the sheet's naming plus the SameSite-limit boundary and open-list caveat, with the
tests tagged inference in the frontier line.

## Checked, not challenged

`ls corpus/knowledge/*.md | wc -l` → `42` (README claim holds); `grep -cE '^\| S10[23] ' corpus/SOURCES.md`
→ `2`, one row each, no id collision with S100/S101. Quote-vs-remote-bytes for S102/S103 is out of scope —
no further GET is authorised here, so those sha256/locator claims are **unknown**, not affirmed.
