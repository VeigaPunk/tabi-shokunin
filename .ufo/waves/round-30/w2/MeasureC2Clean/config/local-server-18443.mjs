import https from "node:https";
import fs from "node:fs";
const dir = process.env.SRV;
const key = fs.readFileSync(dir + "/key.pem");
const cert = fs.readFileSync(dir + "/cert.pem");
const map = {
  "www.ietf.org": dir + "/s116.bin",
  "docs.discord.com": dir + "/s117.bin",
};
const srv = https.createServer({ key, cert }, (req, res) => {
  const host = (req.headers.host || "").split(":")[0];
  fs.appendFileSync(dir + "/access.log", `REQ host=${host} path=${req.url}\n`);
  let body = Buffer.from("no such host\n");
  try { body = fs.readFileSync(map[host]); } catch {}
  res.writeHead(200, { "content-type": "text/html" });
  res.end(body);
});
srv.listen(18443, "127.0.0.1", () => fs.appendFileSync(dir + "/access.log", "LISTEN 18443\n"));
setTimeout(() => process.exit(0), 600000);
