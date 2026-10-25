# W2 — scope & safety: `corpus/knowledge/csrf-defense-shape-boundary.md`

**Verdict: ALLOW on all three asked surfaces** — no security verdict, no credential/cookie
value/private URL/session material, and the inference column is labelled. Four non-blocking
citation/label defects (F4, F5, F10, F11) and one latent execution surface (F8) follow; none
is a verdict, a secret, or an unlabelled inference.
Artefact: 128 lines, sha256 `2bbedf0b77fd6f81c623c9de2cb6f2ec864d3d2d971d1883d9b6ca96b3d5b55f`;
index blob identical to worktree; **staged (` A `), not committed**; HEAD `03c1b4d`.
cwd = lane root for every command below.

## Findings

**F1 — Q1 allow: the entry refuses, in its own bytes, to be a verdict.**
`sed -n '15,20p' corpus/knowledge/csrf-defense-shape-boundary.md` → "Whether a defence is
adequate is a security judgment … nothing below is this lane's verdict on a site."
**F2 — every site-referring proposition is a negation, a prohibition, or a quote.**
`grep -niE '\bsite\b|\bsites\b' …` → 11 hits: 29/71 = S102/S103 quotes; 35–36 = "conclusions a
receipt must **not** draw"; 88 = "never a conclusion that the site is undefended"; rest are
observability instructions. No adequacy, exploitability or weakness claim anywhere.
**F3 — the one observed-site statement is the lane's own loopback fixture, bounded as such.**
`sed -n '118,122p' …` → "the loopback POST form already captured (round 6–8) had no token
field … one observation of `none-observed`, not a measurement of the taxonomy." Loopback is
not a real site; see F11 for its missing evidence pointer.
**F4 — locator defect (medium): the refusal's own citation is wrong at the named path.**
`grep -ci 'kasegi' PROVINCE.md; grep -ci 'verdict' PROVINCE.md` → `0`, `0` (PROVINCE.md, 21
lines, routes only to revenger/kaidoku, kake, kagi). Route exists at
`grep -n 'adequacy stays kasegi' corpus/README.md` → `560:`. Smallest remediation: re-point
line 19's parenthetical `PROVINCE.md` → `corpus/README.md:560`.
**F5 — locator defect (minor): second drift on the same citation.**
`grep -ci 'third-party' PROVINCE.md` → `0`; PROVINCE.md:17 says "consequential actions on
external sites". Line 13's "(PROVINCE.md, third-party and consequential classes)" names a class
the file does not carry.
**F6 — Q2 allow: no credential, cookie value, private URL or session material.**
`grep -niE 'cookie[[:space:]]*[=:]|set-cookie|session|bearer|authorization|password|secret|api[_-]?key|localhost|127\.0\.0\.1' …`
→ no credential-shaped hit; only full URLs are the two public sources (3–4). Lines 49–50/86
speak of token/cookie/attribute *shape*, matching `PROVINCE.md:15-16` ("shape-only, never values").
**F7 — independent secret sweep is clean.**
`grep -nE 'eyJ[A-Za-z0-9_-]{10,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{16,}|[A-Za-z0-9+/]{40,}={0,2}|([0-9]{1,3}\.){3}[0-9]{1,3}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}|localhost|\.local|internal' …`
→ only lines 3–4 (via public URLs). The two `sha256` values are digests of public documents.
**F8 — latent surface (allow now): executable text stored in front matter.**
Line 6's `recheck:` is a shell pipeline (`curl -fsSL … | grep -c …`). No gate runs it:
`grep -nE 'recheck' scripts/check-sources.mjs` → 315–322 parse only SOURCES.md column 10,
whitelisting `/^[0-9]+d$|ISO-date|on-release`; `grep -rnE 'execFileSync|execSync|spawnSync' scripts/*.mjs`
shows exec elsewhere but never on knowledge front matter. If a gate ever execs it, the field is
attacker-controllable free text in any admitted entry.
**F9 — Q3 allow: inferences labelled at row level (2/3) and column level (3/3).**
`grep -n '\[INFERENCE\]' …` → 2 tags, rows 49–50; row 51 carries none, but line 47's header is
"What a lane inference says a receipt could hold" and 59–61 declare "Every row's … column is
inference about observation … Nothing in the table has been captured."
`grep -c '\[INFERENCE\]' …` → `2` vs `grep -cE '^\| (synchronizer|double-submit|custom)' …` → `3`.
**F10 — label-reference mismatch (low): the blanket sentence renames its own column.**
`grep -c 'what a receipt could hold' …` → 1 (line 59), while the header
(`grep -o 'What a lane inference says a receipt could hold' …`) differs. A checker keyed to the
header string finds the referent only by paraphrase; row 51 is the row it would under-count.
**F11 — evidence class: "committed bytes" is not yet true of this file.**
`git status --porcelain corpus/knowledge/csrf-defense-shape-boundary.md` → ` A …`;
`git log --oneline -1 -- …` → no output. C2 counts revision-scoped
(`git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge`), so at HEAD it reads 0; this
audit read the index blob, byte-identical to the worktree. F3's round-6–8 claim also cites no path.
**F12 — the frozen claims recorded one locator correction, not this one.**
`grep -n 'revisions' .ufo/waves/round-23/claims.json` → `50:`; six entries, one fixing C2's
*frontier-item* pointer ("PROVINCE.md carries no CSRF line"). The entry's internal
PROVINCE→kasegi pointer (F4) is unrecorded, i.e. post-freeze.

Read-only throughout: `read`/`grep`/`sed`/`git ls-files,status,log,rev-parse,show :path`.
No tracked edits, git/jj writes, spawns, network, services or credentials; no pacman.
