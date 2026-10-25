# ScoutReopenCandidate — re-grounding `webmcp-devtools-agent-surface-r25` (round 25, w1)

Seat: L1Tabi25.ScoutReopenCandidate (read-only scout). Fetch time 2026-10-25T12:16:14Z (`date -u`).
Candidate entry read: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/webmcp-devtools-agent-surface-r25.md` (cites S242 = the `?hl=zh-tw` page, §"確認 WebMCP 工具曝光度" and §"偵錯 WebMCP 工具執行作業", fetched 2026-10-24).

## Verdict (TL;DR)

- **(b) prerequisites: RESOLVES** verbatim on both pages (off by default, `--categoryExperimentalWebmcp`, Chrome 149+, either origin trial or local flag).
- **Audience distinction: RESOLVES** verbatim on both pages.
- **(a) tool surface: PARTIAL.** Both tool names are present, and so is the wording of each description. But the entry turns *example agent behaviour* into *properties of the tools*:
  - The canonical English page gives every behaviour (parsing output, confirming registration, validating the schema, choosing the input schema, watching the console) to **the agent**. The tools are only things the agent calls.
  - The zh-tw translation gives the `list_webmcp_tools` behaviours to the tool (「這項工具會…」). So the entry's `list_webmcp_tools` sentence is literally true of the zh-tw bytes, but it does not hold against the English source.
  - On **neither** page does `execute_webmcp_tool` choose the schema itself. Both say the agent or feature works out the schema and then *uses* `execute_webmcp_tool`. So the entry's inference that the tool "chooses the input schema itself … so it is not a thin wrapper over `executeTool()`" is **unsupported**.
  - Both pages also label these steps "examples of potential behavior … agents are non-deterministic". The entry drops that caveat.
- **Id-collision flag:** the merge package lists this same URL twice, as S107 (line 12) and S242 (line 147) of `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md`. The lane's `corpus/SOURCES.md` stops at S105 at both the baseline and HEAD, and contains no row for this URL.

## Fetches (documented GETs only)

Command, run in `.ufo/waves/round-25/scratch/ScoutReopenCandidate/`:
`curl -sS -L -o <f> -D <f>.headers -w "url=%{url_effective} status=%{http_code} bytes=%{size_download}\n" <url>`, then `sha256sum en.html zh-tw.html`.

| page | saved as | status | bytes | sha256 | last-modified header | footer |
|---|---|---|---|---|---|---|
| `https://developer.chrome.com/docs/devtools/agents/webmcp-debugging` | `scratch/ScoutReopenCandidate/en.html` | 200 | 173461 | `698a83e50249f0067b6ccee5570fc4f3353e3b0a213b746b07897a3fcf237203` | Wed, 23 Sep 2026 07:00:00 GMT | "Last updated 2026-09-23 UTC." |
| `https://developer.chrome.com/docs/devtools/agents/webmcp-debugging?hl=zh-tw` | `scratch/ScoutReopenCandidate/zh-tw.html` | 200 | 176236 | `f9963301221e71d487076a9b2581c23712c84fa48934f912362499f48c5eff54` | Wed, 23 Sep 2026 07:00:00 GMT | 「上次更新時間：2026-09-23 (世界標準時間)。」 |

Neither request redirected (url_effective equals the request URL). Both pages carry the same last-modified date, so today's bytes are one revision, published 2026-09-23. That is before the entry's 2026-10-24 fetch [INFERENCE: the content the entry saw is unchanged].

I also replayed the entry's own recheck command once (third GET, same zh-tw URL): `curl -fsSL '…?hl=zh-tw' -o /dev/null` exited 0. Running `grep -c 'list_webmcp_tools' zh-tw.html` on the saved bytes gives **1**, so the recheck passes.

Keyword counts (`grep -c -- <k> <file>`, counted per line):

| key | en.html | zh-tw.html |
|---|---|---|
| `list_webmcp_tools` | 1 | 1 |
| `execute_webmcp_tool` | 1 | 1 |
| `categoryExperimentalWebmcp` | 1 | 1 |
| `149` | 4 | 4 |
| `origin trial` | 2 | 0 |
| `來源試用` | 0 | 6 |

Locations below are given as `line:byte-offset` in the saved file (`grep -n -b`), with tags stripped.

## (a) Tool surface: `list_webmcp_tools` / `execute_webmcp_tool`

### English (canonical)

Section "Verify WebMCP tool exposure" (heading at en.html 5657:151288):

> en.html 5666–5669 (5668:152118, 5669:152196): "Example agent execution: Your agent detects the need to inspect exposed tools and autonomously invokes the list_webmcp_tools tool. It parses the output, confirms whether your tool was successfully registered, and validates that the schema is well-formed."

Section "Debug WebMCP tool execution" (heading at en.html 5671:152281):

> en.html 5680–5684 (5681:153004, 5683:153183): "Example agent execution: Your agent recognizes the intent to test a specific action. It autonomously determines the correct input schema, uses execute_webmcp_tool to run it, and monitors the application's response (including checking console logs) to report back the success status or debug any failures."

Caveat that covers both examples:

> en.html 5652–5654 (5652:151028, 5653:151121): "Note: Agent execution steps are examples of potential behavior. As there are many different types of agents and agents are non-deterministic, you can see different results."

### zh-tw (the entry's cited locale)

Section 「確認 WebMCP 工具曝光度」 (zh-tw.html 5652:153912):

> zh-tw.html 5659:154555: 「代理執行範例：代理偵測到需要檢查公開工具，並自主叫用 list_webmcp_tools 工具。這項工具會剖析輸出內容、確認工具是否已成功註冊，並驗證結構定義是否格式正確。」

Section 「偵錯 WebMCP 工具執行作業」 (zh-tw.html 5661:154854):

> zh-tw.html 5668:155498: 「代理執行範例：代理會辨識出測試特定動作的意圖。這項功能會自動判斷正確的輸入結構定義、使用 execute_webmcp_tool 運作執行，並監控應用程式的回應 (包括檢查控制台記錄)，回報成功狀態或偵錯任何失敗情況。」

Caveat:

> zh-tw.html 5649:153686: 「注意：代理程式執行步驟是潛在行為的範例。由於代理程式類型眾多，且代理程式具有不確定性，因此您可能會看到不同的結果。」

### Does the entry's claim resolve?

- **Names, and the wording "parses output / confirms registration / schema well-formed / chooses input schema / watches console": present** in both pages (quotes above).
- **Who does it.** The entry says "`list_webmcp_tools` … **parses the output, confirms … and verifies that the schema is well-formed**" (entry lines 17–19).
  - In English, "It" refers back to "Your agent", the subject of the previous sentence. The agent parses the tool's output.
  - In zh-tw, 「這項工具會剖析輸出內容」 ("this tool parses the output") gives it to the tool. The entry matches the zh-tw bytes literally. This is a translation drift away from the English source [INFERENCE: the English text is the original; the zh-tw page shows the "translated" badge, `translated.svg` at zh-tw.html 5239].
- **`execute_webmcp_tool` "chooses the input schema itself and watches the console — so it is not a thin wrapper over `executeTool()`"** (entry lines 23–25): **does not resolve on either page.**
  - In English, the agent "determines the correct input schema, uses execute_webmcp_tool to run it, and monitors …".
  - In zh-tw, 「這項功能」 ("this feature") 會自動判斷…輸入結構定義、**使用** execute_webmcp_tool 運作執行, which again means the schema is decided *before* the tool is used.
  - Neither page describes what `execute_webmcp_tool` does internally. The "not a thin wrapper" inference has no support.
- **Caveat dropped.** Both pages present these steps as non-deterministic *examples*. The entry states them as fixed tool behaviour.

## (b) Prerequisite sentence

English, section "When working with WebMCP, keep the following in mind:" (en.html 5620:149021):

> en.html 5623–5625 (5623:149227): "Experimental flag: The WebMCP category is not active by default. Use the --categoryExperimentalWebmcp flag. For more information on participating, see the WebMCP origin trial."

> en.html 5626–5630 (5626:149509): "Browser requirements: This feature requires Chrome 149+ with WebMCP features enabled. This means either the website you are testing is enrolled in the WebMCP Origin Trial, or you have manually enabled the corresponding WebMCP flag in your local Chrome browser."

zh-tw, section 「使用 WebMCP 時，請注意下列事項：」 (zh-tw.html 5631:151589):

> zh-tw.html 5634:151777: 「實驗性標記：WebMCP 類別預設不會啟用。使用 --categoryExperimentalWebmcp 旗標。如要進一步瞭解如何參與，請參閱 WebMCP 來源試用。」

> zh-tw.html 5635:152086: 「瀏覽器需求：這項功能需要啟用 WebMCP 功能的 Chrome 149 以上版本。這表示您測試的網站已註冊 WebMCP 來源試用，或您已在本機 Chrome 瀏覽器中手動啟用對應的 WebMCP 旗標。」

**Resolves.** The entry (lines 30–35) matches on every point: off by default, `--categoryExperimentalWebmcp`, Chrome 149+, and "origin trial OR local flag".

The entry's own source line only cites §「確認 WebMCP 工具曝光度」 and §「偵錯 WebMCP 工具執行作業」. This prerequisite text actually sits in a third section, 「使用 WebMCP 時，請注意下列事項」, so the section citation is incomplete. (The package's other entry, `webmcp-agent-side-consumption.md` line 4, does cite that section.)

## Audience distinction (DevTools MCP vs WebMCP tools)

> en.html 5631–5634 (5631:149881): "Target audience distinction: While the DevTools MCP server is a debugging feature targeted at developers, WebMCP tools can be called by any person using a browser agent to interact with websites. DevTools for agents helps you build and test those user-facing WebMCP tools."

> zh-tw.html 5636:152493: 「目標對象區別：DevTools MCP 伺服器是針對開發人員的偵錯功能，而 WebMCP 工具可由任何使用瀏覽器代理程式與網站互動的人員呼叫。代理專用開發人員工具可協助您建構及測試這些面向使用者的 WebMCP 工具。」

**Resolves.** Both pages state it explicitly, and it matches entry lines 38–40. The same section is missing from the entry's source citation here too.

## Id-collision and lane state (observed)

- `grep -n 'S107\|S242' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` finds line 12 `| S107 | 使用 AI 代理偵錯 WebMCP 工具 (Debug WebMCP tools with an AI agent) … ?hl=zh-tw` and line 147 `| S242 | 使用 AI 代理偵錯 WebMCP 工具 … ?hl=zh-tw`. That is one URL under two package ids.
- Lane `corpus/SOURCES.md`, via `git show <rev>:corpus/SOURCES.md | grep -o -E '^\| ?S[0-9]+' | sort -t S -k2 -n | tail -1`: the highest id is **S105** at both baseline `9e13666…` and HEAD. `grep -c 'webmcp-debugging'` gives **0** at both.
- Lane HEAD is **`c8ef308`** ("round-25: freeze claims, controls, census-before, wave-1 spec"), one commit past the stated baseline `9e13666` (`git log --oneline -3`). The SOURCES state is the same at both.
- `claims.json` opens S106 this round, so the lane's next free id would be S107. That equals the package's S107, which is a *different* package row for this same URL.
  - [INFERENCE] Admitting this entry under any package id needs renumbering, and must not append both S107 and S242 for one URL.

## Unknowns

- What `list_webmcp_tools` / `execute_webmcp_tool` do internally is not on either page. Settling the "thin wrapper" question would need the chrome-devtools-mcp tool source, which I did not fetch because it is outside the documented GETs.
- I did not compare any other locale; only en and zh-tw were fetched.

## Tooling

No installs or upgrades. I used curl, sha256sum, grep and git (read-only: rev-parse, log, show, ls-files, grep). I did not run any pacman transaction.
