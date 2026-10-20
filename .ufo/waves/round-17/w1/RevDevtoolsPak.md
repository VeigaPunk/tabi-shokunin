# RevDevtoolsPak — DevTools frontend WebMCP surface (round 17 / wave 1)
VERDICT: PASS

Read-only leaf; nothing in the lane modified except this report.
## 1. Artifact location
- `chromium --version` -> `Chromium 154.0.8037.97 Arch Linux`.
- No `devtools_resources.pak` exists: `find /usr/lib/chromium -iname "*devtools*"` -> empty; `pacman -Ql chromium | grep -E "\.pak$"`
  -> only `resources.pak`, `chrome_100_percent.pak`, `chrome_200_percent.pak`, `locales/*.pak`. The frontend is merged into
  **`/usr/lib/chromium/resources.pak`** (23,498,386 B, sha256 `35892fd6cf1e20fec8ea5783574787f74704273db93d43f58854c6ad51ab03a0`).
- pak v5 (`ui/base/resource/data_pack.cc`, `kHeaderLengthV5`): `u32 version=5 | u8 encoding=1 | 3 pad | u16 count=5605 | u16 aliases=371`,
  then `(count+1)` 6-byte entries `{u16 id; u32 file_offset}` (last = end sentinel), then `371*4` aliases; data at 35,132.
- DevTools frontend = **contiguous block of 855 entries, ids `0xC788`..`0xCADE`**.
- Entries are **brotli**, not gzip: 8-byte header `1e 9b` + 6-byte LE uncompressed size, then a raw brotli stream
  (`ui/base/resource/resource_bundle.h:60-61` `kBrotliConst={0x1e,0x9b}`/`kBrotliHeaderSize=8`; `resource_bundle.cc:120-190`).
  Skipping 8 bytes and brotli-decoding each entry below reproduces the browser-served bytes exactly.
### Path -> resource-id map (in the binary, not the pak)
`devtools_frontend_host_impl.cc:89-96` resolves `/devtools/<path>` via generated `kDevtoolsResources` (`devtools_resources_map.h`)
then `GetContentClient()->GetDataResourceBytes(id)`; HTTP entry `devtools_http_handler.cc:804`. The array is 16-byte records
`{const char* path; int id}` in `.data.rel.ro`:
| path | path string @ | map slot @ | resource id |
|---|---|---|---|
| `core/protocol_client/protocol_client.js` | `0x4D7819` | `0x13522000` | 51403 (`0xC8CB`) |
| `core/sdk/sdk.js` | `0x09F9B6` | `0x13522040` | 51405 (`0xC8CD`) |
| `panels/application/application.js` | `0x57F567` | `0x13524A80` | 51743 (`0xCA1F`) |
| `models/web_mcp/web_mcp.js` | `0x42D789` | `0x13524900` | 51731 (`0xCA13`) |
## 2. Extracted entries
| module | id | file offset | end | raw len | size field | decompressed | sha256(raw slice) | sha256(decompressed) |
|---|---|---|---|---|---|---|---|---|
| `core/protocol_client/protocol_client.js` | 51403 (`0xc8cb`) | 19907339 | 20004339 | 97000 | 624018 | 624018 | `f758361276af1b6ff7287e1e61f4610a4938fde43e92b5ba00aaf907acd40ac6` | `9d12c1c0a208670d0bd4a8aaaa4a0d8acea5d3b1f508bffcf4e9efa85ee926cd` |
| `core/sdk/sdk.js` | 51405 (`0xc8cd`) | 20006179 | 20164753 | 158574 | 757307 | 757307 | `4605782b2e4f8949f8bfec4fec23ad768b016a1de210454178e5c0dff6c64399` | `ab68faf8f7e2229f0876b8338789c4d04d1294eb353ccd1894ec69f94b9fa096` |
| `models/web_mcp/web_mcp.js` | 51731 (`0xca13`) | 20861725 | 20863051 | 1326 | 3655 | 3655 | `ebb33b0a76bf073e05ba82dcdce512ddab82a784cc7f6899a46a9717891472d6` | `fa89f8c5b40d915e76e96e90abc84822fe1b371c71f966698334795b28765305` |
| `panels/application/application.js` | 51743 (`0xca1f`) | 20935366 | 21009156 | 73790 | 363176 | 363176 | `a00dfdfc09592077407e7a0336838ea2660ccbacdf062e4b92a465c5690b1d0c` | `b2ef25c9c11416a1739d8c712cf55eb86dfdf448f88679553a36fa76fc7c4744` |

The browser serves these same bytes: headless Chromium 154 (temp `--user-data-dir`, loopback; also re-run inside
`sudo unshare -n` with only `lo`) returns sha256 `fa89f8c5b40d915e76e96e90abc84822fe1b371c71f966698334795b28765305` for
`/devtools/models/web_mcp/web_mcp.js`, byte-identical to entry 51731 (`cmp` clean); entries 51403/51405/51743 likewise
match the served `protocol_client.js`, `sdk.js`, `application.js`.
## 3. Reconstructed contract
- **Invoke.** `Tool#invoke(input)` calls `webMCPAgent().invoke_invokeTool({toolName, frameId, input})`; if the response has
  no protocol error (`getError()` falsy) it returns the wire `invocationId`. `invoke_invokeTool` is synthesised by the
  protocol layer as `this["invoke_"+commandName]` for `WebMCP.invokeTool` (snippet M) — the only frontend call site.
- **Response.** `WebMCPModel#toolResponded(e)` looks up the pending call by `e.invocationId`, converts `e.exception` to a
  `Runtime.RemoteObject` if present, stores `new Result(e.status, e.output, e.errorText, exceptionObj)` and dispatches
  local event `ToolResponded`. `Result` carries `status`, `output`, `errorText`, lazy `symbolizedError`.
- **Status values.** `WebMCP.InvocationStatus` = `Completed` | `Canceled` | `Error` (exact strings); passed through
  unmodified. The panel filters on the same strings and treats a missing `result` as pending ("In Progress").
- **Fields.** `toolInvoked`: `toolName, frameId, invocationId, input`; `toolResponded`: `invocationId, status, output,
  errorText, exception`; `toolsAdded/Removed`: `tools`; `WebMCP.Tool`: `name, description, inputSchema, annotations, frameId,
  backendNodeId, stackTrace`; `WebMCP.Annotation`: `readOnly, untrustedContent, consequential, autosubmit`.
- **Cancel.** `toolInvoked` builds `{tool, input, invocationId, cancel}`; `cancel()` fires only while `result === undefined`
  via `agent.invoke_cancelInvocation({invocationId})`; the panel shows "Cancel" only when `d.result === void 0`.
- **Gating.** `Target.Capability.WEB_MCP = 2097152` (`1<<21`); the model autostarts with it, and Target ORs the bit only
  when `Runtime.hostConfig.devToolsWebMCPSupport?.enabled`. The panel adds `WebMCPTreeElement` (`webMcp://`) under the
  same flag. `--print-resource-ids` printed no `Resource=` line for served `/devtools/` files, consistent with the
  `GetRawDataResource` path rather than `DataPack::GetResource`. [INFERENCE] the flag comes from browser feature
  `DevToolsWebMCPSupport` (binary strings `kDevToolsWebMCPSupport`/`devToolsWebMCPSupport`, "Enables WebMCP support in DevTools.").
## 4. Verbatim snippets (exact bytes; offsets are byte offsets inside the decompressed module)
**events enum** — `models/web_mcp/web_mcp.js` @ 243
```js
var u=(n=>(n.TOOLS_ADDED="ToolsAdded",n.TOOLS_REMOVED="ToolsRemoved",n.TOOL_INVOKED="ToolInvoked",n.TOOL_RESPONDED="ToolResponded",n))(u||{})
```
**Tool#invoke -> WebMCP.invokeTool** — `models/web_mcp/web_mcp.js` @ 1622
```js
async invoke(e){let o=await this.#o.deref()?.webMCPAgent().invoke_invokeTool({toolName:this.name,frameId:this.#e.frameId,input:e});if(!(!o||o.getError()))return o.invocationId}
```
**toolInvoked (pending call + cancel)** — `models/web_mcp/web_mcp.js` @ 2935
```js
toolInvoked(e){let t=this.#e.get(e.frameId)?.get(e.toolName);if(!t)return;let o={tool:t,input:e.input,invocationId:e.invocationId,cancel:()=>{o.result===void 0&&this.agent.invoke_cancelInvocation({invocationId:e.invocationId})}};this.#t.set(e.invocationId,o),this.dispatchEventToListeners("ToolInvoked",o)}
```
**toolResponded (Result construction)** — `models/web_mcp/web_mcp.js` @ 3241
```js
toolResponded(e){let t=this.#t.get(e.invocationId);if(!t)return;let o=e.exception&&this.target().model(r.RuntimeModel.RuntimeModel)?.createRemoteObject(e.exception);t.result=new s(e.status,e.output,e.errorText,o),this.dispatchEventToListeners("ToolResponded",t)}
```
**Result fields** — `models/web_mcp/web_mcp.js` @ 385
```js
s=class{status;output;errorText;#e;#t;constructor(e,t,o,n){this.status=e,this.errorText=o,this.#e=n,this.output=t}
```
**model registration / capability** — `models/web_mcp/web_mcp.js` @ 3505
```js
r.SDKModel.SDKModel.register(d,{capabilities:r.Target.Capability.WEB_MCP,autostart:!0})
```
**protocol enum + events** — `core/protocol_client/protocol_client.js` @ 547188
```js
e.registerEnum("WebMCP.InvocationStatus",{Completed:"Completed",Canceled:"Canceled",Error:"Error"}),e.registerEvent("WebMCP.toolsAdded",["tools"]),e.registerEvent("WebMCP.toolsRemoved",["tools"]),e.registerEvent("WebMCP.toolInvoked",["toolName","frameId","invocationId","input"]),e.registerEvent("WebMCP.toolResponded",["invocationId","status","output","errorText","exception"])
```
**WebMCP.invokeTool command** — `core/protocol_client/protocol_client.js` @ 547825
```js
e.registerCommand("WebMCP.invokeTool",[{name:"frameId",type:"string",optional:!1,description:"Frame in which to invoke the tool.",typeRef:"Page.FrameId"},{name:"toolName",type:"string",optional:!1,description:"Name of the tool to invoke.",typeRef:null},{name:"input",type:"object",optional:!1,description:"Input parameters for the tool, matching the tool's inputSchema.",typeRef:null}],["invocationId"],"Invokes a registered tool.")
```
**cancelInvocation** — `core/protocol_client/protocol_client.js` @ 548258
```js
e.registerCommand("WebMCP.cancelInvocation",[{name:"invocationId",type:"string",optional:!1,description:"Invocation identifier to cancel.",typeRef:null}],[],"Cancels a pending tool invocation.")
```
**WebMCP.Annotation** — `core/protocol_client/protocol_client.js` @ 548453
```js
e.registerType("WebMCP.Annotation",[{name:"readOnly",type:"boolean",optional:!0,description:"A hint indicating that the tool does not modify any state.",typeRef:null},{name:"untrustedContent",type:"boolean",optional:!0,description:"A hint indicating that the tool output may contain untrusted content, ex: UGC, 3rd party data.",typeRef:null},{name:"consequential",type:"boolean",optional:!0,description:"A hint indicating that executing the tool will result in consequential actions, ex: booking a flight, transferring money.",typeRef:null},{name:"autosubmit",type:"boolean",optional:!0,description:"If the declarative tool was declared with the autosubmit attribute.",typeRef:null}])
```
**WebMCP.Tool** — `core/protocol_client/protocol_client.js` @ 549138
```js
e.registerType("WebMCP.Tool",[{name:"name",type:"string",optional:!1,description:"Tool name.",typeRef:null},{name:"description",type:"string",optional:!1,description:"Tool description.",typeRef:null},{name:"inputSchema",type:"object",optional:!0,description:"Schema for the tool's input parameters.",typeRef:null},{name:"annotations",type:"object",optional:!0,description:"Optional annotations for the tool.",typeRef:"WebMCP.Annotation"},{name:"frameId",type:"string",optional:!1,description:"Frame identifier associated with the tool registration.",typeRef:"Page.FrameId"},{name:"backendNodeId",type:"number",optional:!0,description:"Optional node ID for declarative tools.",typeRef:"DOM.BackendNodeId"},{name:"stackTrace",type:"object",optional:!0,description:"The stack trace at the time of the registration.",typeRef:"Runtime.StackTrace"}])
```
**agent method generation (invoke_*)** — `core/protocol_client/protocol_client.js` @ 620495
```js
registerCommand(t,i,o,n){let r=T(this.domain,t);this.metadata[r]={parameters:i,description:n,replyArgs:o};function l(d={}){return this.invoke(r,d)}this["invoke_"+t]=l}
```
**model agent accessor** — `core/protocol_client/protocol_client.js` @ 618069
```js
webMCPAgent(){return this.getAgent("WebMCP")}
```
**Target capability bit** — `core/sdk/sdk.js` @ 247014
```js
y[y.WEB_MCP=2097152]="WEB_MCP"
```
**hostConfig gate on Target** — `core/sdk/sdk.js` @ 243696
```js
mc.Runtime.hostConfig.devToolsWebMCPSupport?.enabled&&(this.#n|=2097152)
```
**panel tree gate** — `panels/application/application.js` @ 320889
```js
ui.Runtime.hostConfig.devToolsWebMCPSupport?.enabled&&(this.webMcpTreeElement=new go(e),this.applicationTreeElement.appendChild(this.webMcpTreeElement))
```
**panel run-tool call site** — `panels/application/application.js` @ 307101
```js
onRunTool:async n=>{if(this.#t){if(this.#t.parameters=n.data.parameters||{},this.#i=await this.#t.tool.invoke(this.#t.parameters)??null,this.#i){let l=Ie.TargetManager.TargetManager.instance().models(cs.WebMCPModel.WebMCPModel).flatMap(g=>g.toolCalls).find(g=>g.invocationId===this.#i);l&&(this.#s=l,this.#i=null)}this.requestUpdate()}}
```
**panel status filter** — `panels/application/application.js` @ 288900
```js
return!!(n&&r.result?.status==="Completed"||a&&r.result?.status==="Error"||g&&r.result?.status==="Canceled"||l&&r.result===void 0)}
```
**panel cancel item** — `panels/application/application.js` @ 295100
```js
d.result===void 0&&v.defaultSection().appendItem(T(x.cancelCall),()=>{d.cancel()},{jslogContext:"webmcp.cancel-call"})
```
**panel listens to model events** — `panels/application/application.js` @ 305298
```js
#d(e){e.addEventListener("ToolsAdded",this.requestUpdate,this),e.addEventListener("ToolsRemoved",this.#g,this),e.addEventListener("ToolInvoked",this.#u,this),e.addEventListener("ToolResponded",this.requestUpdate,this)}
```
## 5. Notes / limits
- No `panels/web_mcp/*` module in this build; the UI lives in `panels/application/application.js` (`WebMCPTreeElement`,
  `WebMCPView`, `ToolDetailsWidget`, `filterToolCalls`) and imports the model as `cs` from `../../models/web_mcp/web_mcp.js`.
- `web_mcp.js` ends `//# sourceMappingURL=web_mcp.js.map`; map not needed. Live invocation is the C2 harness seat; this is
  static artifact evidence only.

Files written: `.ufo/waves/round-17/w1/RevDevtoolsPak.md`. Scratch: `/tmp/r17-devpak` (outside the lane).
Tooling: no installs/upgrades; system `python3`, `/usr/bin/brotli`, `curl`, `/usr/lib/chromium/chromium`.
