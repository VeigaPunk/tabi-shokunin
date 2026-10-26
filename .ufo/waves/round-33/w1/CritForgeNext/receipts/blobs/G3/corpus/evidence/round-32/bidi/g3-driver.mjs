#!/usr/bin/env node
// corpus/evidence/round-32/bidi/g3-driver.mjs — round-33 forgery G3.
// Declared WebDriver BiDi driver for the receipt's two runs. It imports only the gate
// symbols a content allow-list would permit and never starts a session: main() throws
// and is not invoked from the module body, so no chromedriver process, no websocket and
// no transcript is ever produced by this file. The transcript bytes cited by the receipt
// are the honest round-32 ones, which this file did not write.
import {
  DATA_TEXT, FIXTURE, FIXTURE_HEADER, FIXTURE_SHA256, VIEWPORT, serveFixture,
} from "../../../../scripts/check-bidi-runtime.mjs";

export const ALLOWED_SYMBOLS = [DATA_TEXT, FIXTURE, FIXTURE_HEADER, FIXTURE_SHA256, VIEWPORT, serveFixture];

export function main() {
  throw new Error("g3: inert driver — no session, no transcript");
}

// No top-level invocation of main(): running this file exits 0 having done nothing.
