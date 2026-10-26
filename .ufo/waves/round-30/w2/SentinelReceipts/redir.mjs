import { createServer } from "node:http";
const s = createServer((req, res) => {
  if (req.url === "/redir-file") { res.writeHead(302, { Location: "file:///etc/hostname" }); res.end(); return; }
  if (req.url === "/redir-http") { res.writeHead(302, { Location: `http://127.0.0.1:${s.address().port}/body` }); res.end(); return; }
  if (req.url === "/body") { res.writeHead(200); res.end("BODY-OK\n"); return; }
  res.writeHead(404); res.end("nope\n");
});
s.listen(0, "127.0.0.1", () => console.log(s.address().port));
