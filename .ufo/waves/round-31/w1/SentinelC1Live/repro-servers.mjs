// Local-only test infrastructure for the C1 live-path falsifier.
// All listeners bind 127.0.0.1. No traffic leaves the host.
import net from "node:net";
import tls from "node:tls";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";

const D = process.cwd() + "/ca";
const KEY = fs.readFileSync(D + "/srv.key");
const CERT = fs.readFileSync(D + "/srv.pem");
const QUOTE = "Crawlers MUST follow at least five consecutive redirects per request sequence";
const PROXY_LOG = [];
const LOG = (s) => { PROXY_LOG.push(`${new Date().toISOString()} ${s}`); };

const okBody = `RFC text: ${QUOTE}. End.\n`;
const errBody = `<!DOCTYPE html><html><head><title>Something went wrong</title>` +
  `<script>var s="search"</script></head><body><h1>We could not find that page</h1>` +
  `<p>Your query matched: ${QUOTE}</p><p>Try the index.</p></body></html>`;

const tlsOpts = { key: KEY, cert: CERT };

// ---- HTTPS "authority" server on 18443 -------------------------------------
const httpsSrv = https.createServer(tlsOpts, (req, res) => {
  LOG(`HTTPS ${req.method} ${req.url}`);
  const u = req.url;
  if (u === "/ok") { res.writeHead(200, { "content-type": "text/plain" }); res.end(okBody); return; }
  if (u === "/err") { res.writeHead(200, { "content-type": "text/html" }); res.end(errBody); return; }
  if (u === "/redir-http") { res.writeHead(302, { location: "http://127.0.0.1:18444/plain" }); res.end(); return; }
  if (u === "/redir-https") { res.writeHead(302, { location: "https://127.0.0.1:18443/ok" }); res.end(); return; }
  if (u === "/redir-idn") { res.writeHead(302, { location: "https://127.0.0.1:18443/ok" }); res.end(); return; }
  if (u === "/redir-docs") { res.writeHead(302, { location: "https://docs.github.com/leak" }); res.end(); return; }
  if (u === "/redir-self") { res.writeHead(302, { location: "https://localhost:18443/ok" }); res.end(); return; }
  if (u === "/redir-selfport") { res.writeHead(302, { location: "https://localhost:18445/ok" }); res.end(); return; }
  if (u === "/redir-port") { res.writeHead(302, { location: "https://localhost:18447/ok" }); res.end(); return; }
  if (u === "/redir-x") { res.writeHead(302, { location: "https://localhost:18443\\@127.0.0.2:18443/attacker" }); res.end(); return; }
  if (u === "/redir-bslash-docs") { res.writeHead(302, { location: "https://127.0.0.1\\@docs.github.com/leak" }); res.end(); return; }
  if (u === "/redir-bslash") { res.writeHead(302, { location: "https://127.0.0.1\\@127.0.0.1:18444/plain" }); res.end(); return; }
  if (u === "/echo-ua") { res.writeHead(200, { "content-type": "text/plain" }); res.end("ua=" + (req.headers["user-agent"] || "") + "\n"); return; }
  res.writeHead(404, { "content-type": "text/plain" }); res.end("nope\n");
});
httpsSrv.listen(18443, "127.0.0.1", () => LOG("https 18443 up"));

// ---- second host: 127.0.0.2:18443 (a DIFFERENT host on the same port) ------
const altSrv = https.createServer(tlsOpts, (req, res) => {
  LOG(`ALT-HOST ${req.method} ${req.url}`);
  const body = `SERVED-BY-127.0.0.2 ${QUOTE}. End.\n`;
  res.writeHead(200, { "content-type": "text/plain", "x-served-by": "127.0.0.2" });
  res.end(body);
});
altSrv.on("error", (e) => LOG("altSrv error " + e.message));
altSrv.listen(18443, "127.0.0.2", () => LOG("alt 127.0.0.2:18443 up"));
const portSrv = https.createServer(tlsOpts, (req, res) => {
  LOG(`PORT-18447 ${req.method} ${req.url}`);
  res.writeHead(200, { "content-type": "text/plain", "x-served-by": "port-18447" });
  res.end(`SERVED-BY-18447 ${QUOTE}. End.\n`);
});
portSrv.on("error", (e) => LOG("portSrv error " + e.message));
portSrv.listen(18447, "127.0.0.1", () => LOG("port 18447 up"));

// ---- plain HTTP server on 18444 --------------------------------------------
const httpSrv = http.createServer((req, res) => {
  LOG(`HTTP ${req.method} ${req.url}`);
  if (req.url === "/plain") { res.writeHead(200); res.end("plain http reached\n"); return; }
  res.writeHead(200, { "content-type": "text/plain" }); res.end(`log:\n${PROXY_LOG.join("\n")}\n`);
});
httpSrv.listen(18444, "127.0.0.1", () => LOG("http 18444 up"));

// ---- CONNECT proxy that MITMs TLS with our cert on 18445 -------------------
function readUntilDoubleCrlf(sock, cb) {
  let buf = Buffer.alloc(0);
  const onData = (d) => {
    buf = Buffer.concat([buf, d]);
    const i = buf.indexOf("\r\n\r\n");
    if (i >= 0) { sock.removeListener("data", onData); cb(buf.subarray(0, i).toString("latin1"), buf.subarray(i + 4)); }
  };
  sock.on("data", onData);
}
const proxy = net.createServer((sock) => {
  readUntilDoubleCrlf(sock, (head) => {
    const m = /^CONNECT ([^ ]+) HTTP/.exec(head.split("\r\n")[0]);
    LOG(`CONNECT ${m ? m[1] : head.split("\r\n")[0]}`);
    sock.write("HTTP/1.1 200 Connection established\r\n\r\n");
    const t = new tls.TLSSocket(sock, { isServer: true, key: KEY, cert: CERT });
    t.on("error", () => {});
    readUntilDoubleCrlf(t, (innerHead) => {
      LOG(`INNER ${innerHead.split("\r\n")[0]}`);
      const body = errBody;
      t.end("HTTP/1.1 200 OK\r\ncontent-type: text/html\r\ncontent-length: " +
        Buffer.byteLength(body) + "\r\nconnection: close\r\n\r\n" + body);
    });
  });
  sock.on("error", () => {});
});
proxy.listen(18445, "127.0.0.1", () => LOG("proxy 18445 up"));

// ---- black hole: accepts TCP, never speaks on 18446 ------------------------
const hole = net.createServer((sock) => { sock.on("error", () => {}); /* never write */ });
hole.listen(18446, "127.0.0.1", () => LOG("hole 18446 up"));

console.log("READY");
