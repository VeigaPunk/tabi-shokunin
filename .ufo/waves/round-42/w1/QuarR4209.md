# QuarR4209 — re-adjudication S137, S138 (tabi)

Full write-up and evidence: `.ufo/waves/round-42/w1/QuarR4209/report.md`, `evidence-S137.txt`, `evidence-S138.txt`.

S137 tabi round2. Registered URL https://raw.githubusercontent.com/cloudflare/agents/main/experimental/webmcp.md fetched 2026-10-28 HTTP 200, 0 redirects, 11991 bytes, sha256 dfe13d9bfb4c372c69cb8e64e119a9f2299a702ab4b14b0b1d3cd4a6de69379e. Quote `Run and load` exact and whitespace-normalized miss (`load` count 0). Census line is the next source (S138 anchor `§"Run and load"`), not this document. verdict: misbound. Live body unchanged vs r40 (same sha256 and etag).

S138 tabi round2. Registered URL https://raw.githubusercontent.com/WebMCP-org/npm-packages/main/packages/webmcp-extension/README.md fetched 2026-10-28 HTTP 200, 0 redirects, 6443 bytes, sha256 4db8d356ade0f6da3f00b8b4bd50bccdfeba7c068142c21fafd4b5ee4d45bbdb. Quote `Testing WebMCP tools` miss; closest heading `## Test`. Same quote is verbatim on https://testingbot.com/support/ai/webmcp (HTTP 200, 258854 bytes, sha256 a296533df34434b2763b001744736538c306600e5ea161d8c5e09876500811e9) at `<h2 id="howto">Testing WebMCP tools</h2>`. verdict: misbound. Registered README unchanged vs r40; r40 had not opened TestingBot.

No tools installed. Pacman not used.

VERDICT finding S137 misbound (Cloudflare body unchanged vs r40); S138 misbound (README unchanged; quote verbatim on TestingBot h2#howto)
