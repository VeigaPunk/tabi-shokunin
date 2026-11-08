// Independent re-derivation of the receipt's fixture.sha256 from PINNED bytes only:
//   scripts/chrome-cdp-filechooser-round78.mjs (fixture template) + the pinned driver
//   + the receipt's nonce + the receipt's declared child port.
// Nothing is written to the lane; nothing from the lane is executed.
import fs from 'node:fs';
import crypto from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

const receipt = JSON.parse(fs.readFileSync(LANE + '/corpus/evidence/round90/chromium-showpicker/receipt.json', 'utf8'));
const driverSrc = fs.readFileSync(LANE + '/scripts/chrome-cdp-showpicker-round90.mjs', 'utf8');
const r78 = fs.readFileSync(LANE + '/scripts/chrome-cdp-filechooser-round78.mjs', 'utf8');

const fm = /\/\*CHOOSER-FIXTURE-BEGIN\*\/\r?\nconst FIXTURE_TEMPLATE = (`[\s\S]*?`);?\r?\n\/\*CHOOSER-FIXTURE-END\*\//.exec(r78);
if (!fm) { console.error('template extraction failed'); process.exit(2); }
const TEMPLATE = (0, eval)('(' + fm[1] + ')');

// Evaluate ONLY the driver's pure patch-constant block (PATCH_* decls + the anchor
// uniqueness loop), with TEMPLATE and a `usage` stub supplied. No fs/net side effects.
const start = driverSrc.indexOf('const PATCH_STYLE');
const end = driverSrc.indexOf('const PATCHED = TEMPLATE');
const decls = driverSrc.slice(start, end);
const P = new Function('TEMPLATE', 'usage', decls + '\nreturn {PATCH_STYLE,PATCH_BODY,PATCH_FL_FROM,PATCH_FL_TO,PATCH_INPUTS_FROM,PATCH_INPUTS_TO,PATCH_ACCEPT_FROM,PATCH_ACCEPT_TO,PATCH_STATE_FROM,PATCH_STATE_TO};')(
  TEMPLATE,
  (msg) => { throw new Error('driver-side usage(): ' + msg); }
);

const PATCHED = TEMPLATE
  .replace('</style>', P.PATCH_STYLE + '</style>')
  .replace('</body>', P.PATCH_BODY + '</body>')
  .replace(P.PATCH_FL_FROM, P.PATCH_FL_TO)
  .replace(P.PATCH_INPUTS_FROM, P.PATCH_INPUTS_TO)
  .replace(P.PATCH_STATE_FROM, P.PATCH_STATE_TO)
  .replace(P.PATCH_ACCEPT_FROM, P.PATCH_ACCEPT_TO);

const childOrigin = 'http://127.0.0.1:' + receipt.ports.child;
const FIXTURE_HTML = PATCHED.replaceAll('__CHILD_ORIGIN__', childOrigin).replaceAll('__NONCE__', receipt.nonce);

const recomputed = sha256(FIXTURE_HTML);
const driverBytesSha = sha256(fs.readFileSync(LANE + '/scripts/chrome-cdp-showpicker-round90.mjs'));
console.log(JSON.stringify({
  receiptFixtureSha: receipt.fixture.sha256,
  recomputedFixtureSha: recomputed,
  fixtureHashMatchesRecomputation: recomputed === receipt.fixture.sha256,
  nonce: receipt.nonce,
  childPort: receipt.ports.child,
  driverShaInReceipt: receipt.driverSha256,
  driverShaOfPinnedBytes: driverBytesSha,
  driverPinMatchesBytes: driverBytesSha === receipt.driverSha256,
}, null, 1));
