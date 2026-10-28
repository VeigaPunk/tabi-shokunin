# QuarR4209 — re-adjudication S137, S138 (tabi)

Axes: fetch integrity (status, final URL, bytes, sha256), quote fidelity (exact then whitespace-normalized), verdict specificity (one of present/absent/misbound/partial/unreachable), and an honest delta against the r40 label. No install. Pacman not used. `/home/vgpnk/.omp/agent/RULES.md` read; no tool added.

Lane is `tabi`. The register also has a tameshi round4 S137 and a souji round3 S138; those rows were not adjudicated.

## S137 — misbound

Register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 194:

`| tabi | round2 | S137 | payload-absent | https://raw.githubusercontent.com/cloudflare/agents/main/experimental/webmcp.md | Run and load | … |`

Command:

```
curl -sSL -D s137.hdr -o s137.body -w 's137_http=%{http_code} s137_size=%{size_download} s137_url=%{url_effective} s137_redir=%{num_redirects}\n' \
  'https://raw.githubusercontent.com/cloudflare/agents/main/experimental/webmcp.md'
sha256sum s137.body
```

Observed: `s137_http=200 s137_size=11991 s137_url=https://raw.githubusercontent.com/cloudflare/agents/main/experimental/webmcp.md s137_redir=0`, sha256 `dfe13d9bfb4c372c69cb8e64e119a9f2299a702ab4b14b0b1d3cd4a6de69379e`, etag `9217e802d197984daa924374329a10523ea98aeed67c18cd28728a171df7eb81`, `date: Wed, 28 Oct 2026 15:37:08 GMT`. Raw search: exact miss, whitespace-normalized miss, token `load` count 0. Closest sentence, line 185 under `## Testing`: `Run them with `npm run test:webmcp` from `packages/agents`.`

The census row (census-adjudication.json, tabi/round2/S137) stores this URL against `line` text that is corpus source S138, whose anchor is `§"Run and load"`. That string is the other source's anchor label. The S138 README, fetched the same minute (and at commits 160acc30, f1dbaa0f, 52928a62), has no such heading; the 2026-10-23 gate sentence coined under that anchor is still under `## Set up the extension`.

verdict: misbound

Delta vs r40 `absent/misbound`: Cloudflare bytes unchanged (same sha256, 11991 bytes, same etag as the 2026-10-27 seat). Single token keeps the misbind. Nothing on this URL changed today.

## S138 — misbound

Register line 195:

`| tabi | round2 | S138 | payload-absent | https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md | Testing WebMCP tools | … |`

Command:

```
curl -sSL -D s138.hdr -o s138.body -w 's138_http=%{http_code} s138_size=%{size_download} s138_url=%{url_effective} s138_redir=%{num_redirects}\n' \
  'https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md'
sha256sum s138.body
```

Observed: `s138_http=200 s138_size=6443 s138_url=https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md s138_redir=0`, sha256 `4db8d356ade0f6da3f00b8b4bd50bccdfeba7c068142c21fafd4b5ee4d45bbdb`, etag `62915516b489692eab282484d4c85a88074f233b4ef85e90a57d8e51badb896f`, `date: Wed, 28 Oct 2026 15:37:09 GMT`. Exact and whitespace-normalized miss. Closest heading is `## Test` (line 143).

The census `line` for this row is corpus S139, `https://testingbot.com/support/ai/webmcp`. Probe, not a substitute URL:

```
curl -sSL -D s139-testingbot.hdr -o s139-testingbot.body -w 'tb_http=%{http_code} tb_size=%{size_download} tb_url=%{url_effective} tb_redir=%{num_redirects}\n' \
  'https://testingbot.com/support/ai/webmcp'
```

Observed: `tb_http=200 tb_size=258854 tb_url=https://testingbot.com/support/ai/webmcp tb_redir=0`, sha256 `a296533df34434b2763b001744736538c306600e5ea161d8c5e09876500811e9`, `date: Wed, 28 Oct 2026 15:38:19 GMT`. Exact quote at two offsets. Surrounding sentence: `<h2 id="howto">Testing WebMCP tools</h2>` then "The pattern is the same in every framework: launch Chrome 149 or higher with the WebMCP testing flag, navigate to your page, then call navigator.modelContextTesting.getTools() to read the registered tools and navigator.modelContextTesting.executeTool(name, input) to invoke one and inspect its result."

verdict: misbound

Delta vs r40 `absent`: the registered README did not change (same sha256 `4db8d356…`, 6443 bytes). The verdict changes because the quote is verbatim today on the other registered source the census line names. The 2026-10-23 snapshot `lanes/tabi/round2/.work/testingbot.txt` already had that heading, so TestingBot did not gain the sentence between r40 and today; r40 never opened it.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4209/evidence-S137.txt`
- `.ufo/waves/round-42/w1/QuarR4209/evidence-S138.txt`

Limitations: `main` is a moving ref; these verdicts are the 2026-10-28 bodies above. Historical README commits were fetched only to test whether `Run and load` had ever been a heading of the other source (it had not, across the three commits that touch the file). No writes under shokuknow. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4209` removed on exit.

VERDICT finding S137 misbound (Cloudflare body unchanged vs r40); S138 misbound (README unchanged; quote verbatim on TestingBot h2#howto)
