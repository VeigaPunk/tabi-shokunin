VERDICT: PASS

Axes: sibling-routing invariance; lease-ruling silence; province bounds on tool and library claims; pin fidelity against `w1/ConnL0.md` and `w1/ConnSiblings.md`. No tool installed or updated.

## Answer

At `530f40a9bc3f10436161a2af1ca0fe9bffffc004` the switch from a requested TCP DevTools port to Playwright's pipe does not alter sibling routing and does not rule the musketeer lease or the revenger/kama reach question. `corpus/adjacency.tsv` is the baseline blob. Fleet L0 lines 62 and 65 are still the filed sentences, with no `L0 ANSWER`. New notes keep those questions open and do not claim tabi installs, upgrades, or owns a sibling tool or library.

## Map

`git diff --exit-code 2bff864fdfee684ddbcd066cc8e735adaba2735c 530f40a9bc3f10436161a2af1ca0fe9bffffc004 -- corpus/adjacency.tsv PROVINCE.md SKILL.md SCORECARD.md scripts/check-adjacency.mjs` → exit 0, empty diff.

Blob `098aa6adc5678d52a32653f38329dc3eae0a52ef`. Content sha256 `a099b7137270e917665c78b12875ab4a8081cd9cc0601d7ee97cd4b552375b0c`. 10 data rows, 6 siblings (`kagi`, `kaidoku`, `kake`, `kama`, `kumitate`, `revenger`). Dispositions: ruled 1, refused-route 3, contested-open 4, split-declared 2.

CDP rows, unchanged:

| surface | sibling | disposition | ruling_ref |
|---|---|---|---|
| `cdp-runtime-observation` | kaidoku | ruled | `tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142` |
| `rea-browser-runtime-evidence` | revenger | contested-open | `fleet@b6b3b5e42044b7cd7307d1d923ee054bf98eeb43:.ufo/l0-questions.md:65` |
| `musketeer-cdp-9222-profile-lease` | kake | contested-open | `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62` |
| `musketeer-cdp-9222-profile-lease` | kagi | contested-open | same `:62` pin |
| `cdp-live-target-census` | kama | contested-open | same `:65` pin |

`SKILL.md:1963-1967` still says contested scope waits on `:62` and `:65`. That section was not edited this round (blob `e461228c28a85dfc3505820b2767406a5eca63ab`).

Pinned quotes still sit on the commits the map names (`git show <pin>:<file> | sed -n '<line>p'`, fixed-string check, all `PIN_OK`):

- `kaidoku-shokunin@9011581d84527ba34c675f9cf912e54d2e72d470:PROVINCE.md:53` contains `remote-debugging-port=9222`
- `kake-shokunin@7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md:35` contains `contested scope (kagi/tabi/kake)`
- `kagi-shokunin@c2cab35bc92e57e39e5489bac3386db078345b3f:PROVINCE.md:43` contains `contested with kake`
- `kama-shokunin@54a29268e2083caa2b1e0d54ee1e7d90961302f3:corpus/knowledge/listener-census.md:355` contains `127.0.0.1:9222`
- `revenger-shokunin@cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97:PROVINCE.md:5` contains `browser/Electron runtime evidence`

## L0

ConnL0 pins still match the two lines. Fleet `HEAD` is now `3a4d1aa6489c4639a4830f34adc52e1f9e24ea4a` (ConnL0 read `920564963850426430435a4703e18370c9c1c21f`). `git diff --stat 92056496 HEAD -- .ufo/l0-questions.md` → `1 file changed, 1 insertion(+)`. The insertion is line 68, a kama llama-archive question, after line 67. It is not a tabi row and not an answer. `tabi |` rows remain 4.

| line | sha256 with trailing newline | `L0 ANSWER` | matches ConnL0 |
|---|---|---|---|
| 62 | `84feeea47ee8d1d9f264a480627a7e38bf9736c584d5127515f670591a44e38c` (719 B) | no | yes |
| 65 | `66b0faf15dfe79d885790e4def77df05a8f6af6ecad804e23479c3c3d857ccd4` (562 B) | no | yes |

File sha256 is now `f9d802f2c5fed3524123cd65e5042c5e5d8244f1ccf990803e6b9d9cbef3a3d6` (68 lines, 56048 B). ConnL0 recorded `446bc837d3d63866e3c6abb8be8a4a795690d707bd4bd5aba2337ea709e23610` at 67 lines. The line-62 and line-65 digests did not move. Latest log touch of the file is still `543437674dcef7939618cd29a08218724da77d0d` (kama), not an edit of 62 or 65.

Landed lesson `corpus/lessons/round-18.md:94-100` (blob `3f79bcf4e6ca7a46aa846715c4fdb80e3c87fc81`, sha256 `31b21b9a461a25b263c8a16f6453a7bc60d49f57157246760a45c325ac7b8a44`) says both questions remain unanswered and points at `w1/ConnL0.md` and `w1/ConnSiblings.md`. Draft `.ufo/waves/round-18/drafts/lesson-round-18.md:50` and `:125` say closing those lines is rejected and tabi absorbs neither. That absorb sentence did not need to land twice: the adjacency section already leaves the lines open.

## Pipe switch

`scripts/webmcp-invoke-round18.mjs` (blob `919dc260bf67fa20ef0b5e5cb2617ae295a939c1`, sha256 `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`):

- `:12` limits H3 to this launch: the pipe is retained and no remote-debugging TCP port is requested.
- `:927-945` launches `chromium.launchPersistentContext` on a `mkdtemp` profile under the run tree, with `acceptDownloads: false`. The constructed `args` are the host-resolver deny plus merged feature switches (`:888-912`). No `--remote-debugging-port` is pushed.
- `:1017-1041` fail-closes unless effective argv has `--remote-debugging-pipe`, has no `--remote-debugging-port`, and the profile has no `DevToolsActivePort`.
- `:440-459` signals only pids already in that run's tree, and only when `/proc` start ticks still match. It does not scan for port 9222 or kill a foreign profile.

`corpus/SOURCES.md:75-76`: S061 teaches that `newCDPSession(page)` uses the launched-browser pipe and is not a wire capture. S062 teaches that pipe mode uses fds 3 and 4, the port switch separately opens HTTP, and dropping the port is necessary even when the pipe is present. The pipe does not stand in for the port switch, so it cannot close the 9222 lease by transport substitution.

`corpus/knowledge/harness-hardening-round-18.md` (blob `9c34c6309b4f2ce38930911e22165b9c33d342ef`, sha256 `b4aae6a26bdb26d5eaf358012bc6889d399dafba7e8f799013a6c539dfc63816`) `:51` says "No TCP DevTools port" for this harness. `:63` scopes the claim to `scripts/webmcp-invoke-round18.mjs` and disclaims a default-profile run. The note never names 9222, the musketeer lease, or a disposition change. `LOG.md` round-18 append and `corpus/QUALITY.md:140-160` do not either. `corpus/README.md:375` indexes the note as CDPSession transport for that successor script.

`.ufo/waves/round-18/measure-c2.mjs:618-627` counts a listener only when `ss -H -ltnp` names a pid already observed with the run temp path (`:449-471`, `:210-224`). A sibling listener on 9222 is not that pid. `:1048` and `:1060` put `--remote-debugging-port=9223` and the text `9223` into a stub argv and a stub `DevToolsActivePort` file; `listener-bad` binds `127.0.0.1:0`. That is a negative control inside the probe temp dir, not a bind of kaidoku's electron port and not a lease act. This seat did not execute `measure-c2.mjs`.

Kills in the counter (`terminateMarkerProcesses`, `:311-315`) require the probe temp path to occur in argv. That path is an `mkdtemp` (`:305-308`).

## Tool and library claims

Searched the landed notes, the harness, the witness, the two pipe dossiers, and the lesson/skill/harness drafts:

`git grep -n -I -E -e pacman -e 'npm install' -e 'uv tool' -e 'install -g' -e library -e update-safety -e omarchy -e absorb 530f40a9 -- corpus/lessons/round-18.md corpus/knowledge/harness-hardening-round-18.md corpus/QUALITY.md corpus/README.md corpus/SOURCES.md LOG.md scripts/webmcp-invoke-round18.mjs scripts/freshness-witness.mjs .ufo/waves/round-18/drafts/lesson-round-18.md .ufo/waves/round-18/drafts/skill-append.md .ufo/waves/round-18/drafts/harness-hardening-round-18.md .ufo/waves/round-18/sources/SrcChromiumPipe.md .ufo/waves/round-18/sources/SrcPwCdpSession.md`

Exit 0. Hits are historical `LOG.md` lines (`:144`, `:309`, `:347`, `:402`, `:406`, `:897`, all before the round-18 append) and the draft's "tabi absorbs neither" (`drafts/lesson-round-18.md:50`, `:125`). No new sentence says tabi runs pacman, npm, uv, or a sibling installer, or that tabi owns kaidoku's REA pin, tsukuroi's update-safety gate, or mado's checkout identity.

`harness-hardening-round-18.md:20` records that installed Playwright 1.64.0 was read locally. That is a read of the pin already named by `scripts/webmcp-invoke-round17.mjs:78`. `:62` says `NODE_PATH` search is not covered. `scripts/freshness-witness.mjs` resolves `refs/heads/master` for this lane; it does not import a sibling revision tool. S063's "Installing listeners" is a Node signal listener, not a package install.

## Contradiction, not a routing change

`corpus/lessons/round-18.md:96` says "No sibling-owned files changed." That is false as a freeze of sibling repositories. ConnL0 already recorded kaidoku `PROVINCE.md` byte changes with no `tabi` cite. This seat also saw kaidoku `main` at `321da6300d5e3cefdb7bca4fa3114714ec166fd4`, past ConnSiblings' `d0690fd44f46d8a7fe9da5f01c6be723d12abd41`. `git diff --stat d0690fd4 321da630 -- PROVINCE.md` → `14 +++++++-------` (exit 0). Hunks are lines 8, 11, 18, 44, 47, and 62 (REA pin wording, JDK rc line, host fallback readers). `git grep -n -w -e tabi -e Tabi` on `PROVINCE.md` at both commits → exit 1. `git grep -n -F remote-debugging-port` at `321da630` → only `:53`, still `chromium --headless --remote-debugging-port=9222` and electron `9223`. No `remote-debugging-pipe`. An unanchored `git grep -F tabi` hit on `:142` at `d0690fd4` is a substring; the word search is empty. Kaidoku's own tool-inventory edit is not a tabi management claim and does not retarget the ruled row.

## Proposed move

Leave `corpus/adjacency.tsv` and fleet `.ufo/l0-questions.md:62` and `:65` untouched. Add one bounds sentence to `corpus/knowledge/harness-hardening-round-18.md` under the existing scope bullet (`:63`): dropping `--remote-debugging-port` applies only to `scripts/webmcp-invoke-round18.mjs`; it does not dispose `cdp-runtime-observation`, `musketeer-cdp-9222-profile-lease`, `cdp-live-target-census`, or `rea-browser-runtime-evidence`, and it does not install or manage Chromium, Playwright, or a sibling tool. That makes rule `:51` unable to be read as a lease ruling, without editing a row, a pin, or the harness.

## Risks

A later edit that "aligns" the map with the pipe would turn a local argv check into a disposition change and would collide with kaidoku's still-current `:53`. Treating lesson `:96` as a fleet freeze hides kaidoku's own `PROVINCE.md` edits. Appending an L0 answer anywhere but as a suffix on line 62 or 65 would move the pins the map names. This seat did not launch Chromium, so H3's runtime absence of a port is unread here; the argv construction above is the source claim.

## Verification already run

Read-only `git diff`, `git show`, `git grep`, `git rev-parse`, `sha256sum`, and a line hash of `.ufo/l0-questions.md`. Worktree vs `530f40a9` for the cited lane files: `git diff --exit-code` exit 0. No `jj`, no git write, no browser, no `measure-c2.mjs` run, no full sibling rescan. Tools installed: none.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ConnScope.md
