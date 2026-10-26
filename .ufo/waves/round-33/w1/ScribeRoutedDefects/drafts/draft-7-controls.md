# Draft — routed defect 7: are this round's controls reproducible?

Verdict: **six of the seven captures rebuild byte-exactly from `baseline/controls.mjs`; `c1-J3-junk-rows`
does not.** Every rebuild is a fresh `git checkout --force --detach b7d16fb8` + `git clean -fdx` of a
scratch clone, the file writes controls.mjs itself makes, then `git add -A` + `git write-tree` (no counters
re-run; only the tree identity is compared).

| capture | recorded `tree=` | rebuilt tree | equal |
|---|---|---|---|
| c1-J1-do-nothing | `c7999ee70b633f0f54a639069816bce53326e4b7` | `c7999ee7…` (the lane's `b7d16fb8` tree, `git rev-parse b7d16fb8^{tree}`) | yes |
| c1-J2-screen-all | `28208038dcd3973836c35b25c47b69aeba5d2b14` | `28208038…` | yes |
| c1-J3-junk-rows | `99b96a0235822e40c7bb2363aa21eab0294e4758` | `5b022ceefb7d9052a532d4d469c116cf84a40af0` | **no** |
| c1-J4-mislabel-unnamed | `9fa562e4551632be8234c2fba4d4db8c97738338` | `9fa562e4…` | yes |
| c2-J1-do-nothing | `c7999ee70b633f0f54a639069816bce53326e4b7` | same as row 1 | yes |
| c2-J2-reject-all | `b7566d9f8cc67cfd2c5210ab75471ae2f97d1e12` | `b7566d9f…` | yes |
| c2-J3-whitelist | `9811384d8d4a867be8bf502fc5eb161abb6b0014` | `9811384d…` | yes |

## Why `c1-J3` does not reproduce

`controls.mjs:64` resolves each junk row's sibling pin from the sibling repo's live branch head:

    const pin = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'rev-parse', 'refs/heads/master']).stdout.trim();

so the row text (and the tree) move whenever a sibling lane commits. At the rebuild the heads were
`kama 0163fea2`, `mori aa3af1ec`, `souji 756d77f0`, `tameshi c6295cb0`; the heads at scoring time are
recorded nowhere (the receipt carries `rev` and `tree` only), so the recorded tree cannot be regenerated
from the receipts. This is the round-32 defect 7 shape again, narrowed to one control.

## Why the other six do reproduce — and their own fragility

- `c1-J2` and `c1-J4` derive entirely from frozen receipt inputs (`c1-candidates.tsv`, `c1-J1-do-nothing.json`'s
  `unaccountedKeys`) plus the baseline `corpus/adjacency.tsv`, so they are a function of the freeze.
- The C1 controls also read the lane **worktree**'s `corpus/adjacency.tsv` (`controls.mjs:61`), so their trees
  assume the map is unchanged since the baseline — true at the rebuild.
- `c2-J2` and `c2-J3` read the lane **worktree** (`scripts/check-bidi-runtime.mjs`, and for J3 the sha256 of
  `corpus/knowledge/webdriver-bidi-runtime-round-32.md` and `corpus/SOURCES.md`). They reproduce today only
  because both files still equal the baseline bytes: the gate is still v1 (`2f25af5a…c393`, the frozen
  digest) and the two file digests are `c1018906…30c5` / `c77ca47d…71f2`. C2 rewrites the gate at REV, so
  once the round lands `c2-J2`'s recipe produces a tree over the *new* gate and the recorded tree becomes
  unreachable — the recipe should read `git show <BASELINE>:<path>`, not the worktree.

## One-line disposition (draft)

> Controls reproducible from `.ufo/waves/round-33/baseline/controls.mjs`: six of seven captures rebuild
> byte-exactly at `b7d16fb8`; `c1-J3-junk-rows` does not, because `controls.mjs:64` stamps sibling repo
> branch heads read live at run time (rebuild `5b022cee…` against recorded `99b96a02…`) — fix: take each
> sibling pin from the frozen candidate list's `<lane>-shokunin@<pin>` (or from the counter's `PINS`), and
> read the two C2 control inputs with `git show b7d16fb8:<path>`, so every tree is a function of the frozen
> inputs alone.

## Commands (scratch clone, `--shared`, detached at `b7d16fb8`)

    node $S/repro.mjs  "$D" b7d16fb8… <lane> <fleet> <lane>/.ufo/waves/round-33/baseline   # C1 J2/J3/J4
    node $S/repro-c2.mjs "$D" b7d16fb8… <lane>                                             # C2 J2/J3
    git -C "$D" write-tree                                                                  # inside each recipe

Both scripts are seat scratch, removed before this seat yields; their outputs are the table above and
`drafts/controls-repro.txt`.
