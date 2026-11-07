# tabi — round 76

L1 `TabiR76`, attempt 1. Base `a69f9060cb9d239b3d6d4429e1b91177b792ebd3` (lane clean, `ahead=0 behind=0`;
no `lane-dead-no-report tabi round=76` line, nothing inherited).

Round 75 was admitted (spot-check `corpus/lessons/round-75-verifier-spotcheck.md`: C1 verifies; the
frozen limit sentence imprecise; claims item 2 omitted r74 F4/F5). The r73–r75 spot-checks (all
admitted) and the last rejections (r71, r72: honest stops) were read before the claim. Routed
defects of the r75 closure and what this round does with them:

1. *r74 F4/F5 (tolerance 0.05 → 0.045, grid 1e-4 → 0.02 survive the battery): apply as bracketing
   battery cases + semantic mutants.* Applied to this generation: the battery brackets every carried
   tolerance and threshold from both sides (pair tolerance 0.049/0.051 ms, grid 2e-5/5e-6 ms, abs 19/18
   of 37 events, gap 5/4 of 6 gaps), each case placed with an exact replica of the counter rule and
   failing if misplaced; kill power carries both directions (TOL 0.045/0.06, FRAC 0.55/0.45, GAP_FRAC
   0.85/0.6, grid 0.02/1e-5), all killed in the pre-freeze pass.
2. *Mistakes row 5 had `captured-by: none`: add a grounded QUALITY criterion.* QUALITY 143 (below);
   item 1 above is its first application.
3. *Counter generation: pin host version/product + headless argv, check the CDP error code, compare
   structurally, read priors from the committed file.* Applied: exact `Chromium 155.0.8059.84 Arch
   Linux` / `Chrome/155.0.8059.84` / protocol 1.3 and `--headless=new` at argv[1]; errors kept and
   compared as `{code, message}`; no `|`-joined views; `--prior-set <file>` required (usage exit 2
   otherwise) and the counter walks the round-76 trees for receipts outside it (`prior-set-complete`);
   every leg-record field read.
4. *Kill power: attribute each kill, classify crashes, minimum-mutant guard; fold R75Mut1's witnesses.*
   Applied: `killed` needs a named failed case; `killed-positive` needs the mutant counter's own
   finding ids on the honest receipt; anything else is `crashed`; the unmutated battery runs twice;
   guard force-true = declared checks (131) and semantic ≥ 40. R75Mut1's 26 witnesses are drag-counter
   mutants: carried, not claimed (no drag counter generation this round), with R74Mut1 (IME) and
   R73Mut1 (pinch).
5. *Frozen `limit` wording exact.* The counter header and `claims.json` state the 0.1 ms move and the
   19-of-37 events / 2-of-6 gaps escape exactly; R76Critic is asked to attack the exactness.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exit 0,
201 rows (`.ufo/waves/round-76/census/start.txt`).

Claim: C1 coverage — capability `chromium-js-dialog-linux` (CDP `Page.handleJavaScriptDialog` and the
`Page.javascriptDialogOpening` / `javascriptDialogClosed` events on Chromium 155 `--headless=new`,
dialogs opened by real mouse clicks, plus beforeunload under `Page.navigate`), sourced: S202–S206, new
this round. One claim only.

## Gate

### Sources — new rows

All fetched by the L1 on 2026-11-07 between 03:56:02 and 03:56:08 -03:00 from
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/<path>?format=TEXT`
(base64 decoded; decoded copies, line counts and sha256 in `.ufo/waves/round-76/sources/FETCH.txt`).
Each row: tier A, kind `code`, status `mined`, recheck `on-release`, used-by the round-76 note and this
lesson. Before the append, `grep -c 'page_handler.cc\|local_dom_window.cc\|web_contents_impl.cc'
corpus/SOURCES.md` was 0; `Page.pdl` (S105) and `chrome_client_impl.cc` (S186) were held at other
tags/scopes.

- **S202** `third_party/blink/public/devtools_protocol/domains/Page.pdl` (1,795 lines, sha256
  `e944a3b1…05be`). Located quote (lines 1487-1488): "calling alert while Page domain is engaged will
  stall the page execution. Execution can be resumed via calling Page.handleJavaScriptDialog."
- **S203** `content/browser/devtools/protocol/page_handler.cc` (2,781 lines, sha256 `768a47e8…d4ac`).
  Located quotes (line 1733): "return Response::InvalidParams("No dialog is showing");" and (line
  1740): "std::move(pending_dialog_).Run(accept, prompt_override);"
- **S204** `content/browser/web_contents/web_contents_impl.cc` (13,314 lines, sha256 `adc65d86…be75`).
  Located quotes (line 9603): "bool suppress_this_message = should_suppress || !has_handlers;" and
  (line 11679): "rfh->frame_tree_node()->BeforeUnloadCanceled();"
- **S205** `third_party/blink/renderer/core/frame/local_dom_window.cc` (2,943 lines, sha256
  `a1b04978…117f`). Located quote (lines 1619-1621): "if (page->GetChromeClient().OpenJavaScriptPrompt(
  GetFrame(), message, default_value, return_value)) { return return_value;"
- **S206** `third_party/blink/renderer/core/page/chrome_client_impl.cc` (1,602 lines, sha256
  `dadba314…eee`; a second scope of the file S186 holds, W04). Located quote (lines 576-577): "//
  Synchronous mojo call. frame->GetLocalFrameHostRemote().RunModalPromptDialog("
- No status, recheck or used-by cell of an existing row changed.

### Admitted

- `corpus/knowledge/chromium-js-dialog-runtime-round-76.md` (cites S202–S206): what a page and a CDP
  client see when CDP answers alert/confirm/prompt/beforeunload on this build, sourced step by step
  (prompt accepted without promptText returns "", dismissed returns null while the closing event echoes
  the text; no dialog open → -32602; a dismissed beforeunload aborts the navigation; the page blocks in
  the dialog), measured identically on 13/13 pre-freeze runs (4 probes + 9 smokes).

### Rejected (with flip conditions)

- **"Accepting a prompt without `promptText` returns its default value"** — reject: S203 1736-1740
  passes an empty `prompt_override`; measured `""` 13/13. Flip: a tag whose handler passes the default
  when `promptText` is absent, or a run that returns it.
- **"`javascriptDialogClosed.userInput` is what the page received"** — reject: dismissed prompt returns
  `null` to the page (S205 1619-1628) while the event carries `"tabi-ignored"` (S204 11690/11695 pass the
  same `user_input` to both); 13/13. Flip: a tag that clears `user_input` on cancel.
- **"Answering with no dialog open is a harmless no-op"** — reject: `{code: -32602, message: "No dialog is
  showing"}` (S203 1733), 13/13. Flip: a tag that returns success.

Assimilation: none (`merge/tabi/` adoption stays closed pending the register-correction L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.
