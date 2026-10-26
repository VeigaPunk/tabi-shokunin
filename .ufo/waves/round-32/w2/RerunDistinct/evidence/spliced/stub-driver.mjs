// loopback BiDi driver: talks to a chromedriver session over its webSocketUrl
import { createHash } from "node:crypto";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function drive(url, commands) {
  const ws = new WebSocket(url);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const seen = [];
  for (const [i, cmd] of commands.entries()) {
    ws.send(JSON.stringify({ id: i + 1, ...cmd }));
    seen.push(await new Promise((res) => { ws.onmessage = (e) => res(JSON.parse(e.data)); }));
  }
  ws.close();
  return { commands: commands.length, seen, digest: createHash("sha256").update(JSON.stringify(seen)).digest("hex") };
}
