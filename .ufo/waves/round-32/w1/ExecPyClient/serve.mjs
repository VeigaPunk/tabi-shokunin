// Serves the frozen FIXTURE from the counter module in this seat's scratch clone.
// Prints {"base":...,"fixtureSha256":...} on stdout once listening; stays alive
// until SIGTERM/SIGINT. Serves 127.0.0.1 only.
import { serveFixture, FIXTURE_SHA256 } from "./clone/scripts/check-bidi-runtime.mjs";

const fx = await serveFixture();
process.stdout.write(JSON.stringify({ base: fx.base, fixtureSha256: FIXTURE_SHA256 }) + "\n");
let closing = false;
const shutdown = async () => { if (closing) return; closing = true; await fx.close(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
setInterval(() => {}, 1 << 30);
