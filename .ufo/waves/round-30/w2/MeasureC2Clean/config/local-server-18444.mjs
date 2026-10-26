import https from "node:https";
import fs from "node:fs";
const dir = process.env.SRV;
const srv = https.createServer({ key: fs.readFileSync(dir + "/key.pem"), cert: fs.readFileSync(dir + "/cert.pem") }, (req, res) => {
  const host = (req.headers.host || "").split(":")[0];
  fs.appendFileSync(dir + "/access.log", `REQ host=${host} path=${req.url}\n`);
  const map = { "www.ietf.org": dir + "/s116.bin", "docs.discord.com": dir + "/s117.bin" };
  let body = Buffer.from("no such host\n");
  try { body = fs.readFileSync(map[host]); } catch {}
  res.writeHead(200); res.end(body);
});
srv.listen(18444, "127.0.0.1", () => fs.appendFileSync(dir + "/access.log", "LISTEN 18444\n"));
setTimeout(() => process.exit(0), 600000);
