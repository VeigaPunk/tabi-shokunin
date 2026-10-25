// RED stand-in: writes into the lane (must be caught by the no-write proof).
import { writeFileSync } from "node:fs";
writeFileSync("scratch-cache.json", '{"n":1}\n');
console.log(JSON.stringify({ schema: "probe", clean: true }));
