import fs from 'node:fs';
import crypto from 'node:crypto';
const SRC = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-showpicker-proxy-round91.mjs';
const src = fs.readFileSync(SRC, 'utf8');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const PARENT_ORIGIN = 'http://127.0.0.1:19961';
const CHILD_ORIGIN = 'http://127.0.0.1:19963';
const nonce = 'tabi-r91-l1-1d073adc0b8d';

function grab(startMark, nth) {
  let i = -1;
  for (let k = 0; k <= nth; k++) i = src.indexOf(startMark, i + 1);
  if (i < 0) throw new Error('marker not found ' + startMark);
  return i;
}
// childHtml arrow function
const cs = grab('const childHtml = (parentOrigin) => `', 0);
const ce = src.indexOf('`;', src.indexOf('</script></body></html>`;', cs)) + 2;
const childSrcText = src.slice(cs, src.indexOf('</script></body></html>`;', cs) + '</script></body></html>`;'.length);
const ps = grab('const PARENT_HTML = `', 0);
const parentSrcText = src.slice(ps, src.indexOf('</script></body></html>`;', ps) + '</script></body></html>`;'.length);

const makeChild = new Function('PARENT_ORIGIN', 'CHILD_ORIGIN', childSrcText + '\nreturn childHtml;')(PARENT_ORIGIN, CHILD_ORIGIN);
const PARENT_HTML = new Function('PARENT_ORIGIN', 'CHILD_ORIGIN', parentSrcText + '\nreturn PARENT_HTML;')(PARENT_ORIGIN, CHILD_ORIGIN);

const childHtmlPage = makeChild(PARENT_ORIGIN);
const sameHtml = makeChild(PARENT_ORIGIN);
const parentHtml = PARENT_HTML.replaceAll('__RUN__', nonce);
console.log('recomputed parent', sha(parentHtml));
console.log('recomputed same  ', sha(sameHtml));
console.log('recomputed child ', sha(childHtmlPage));
console.log('claim parent    ', 'a6ecf367adcfd31e3e54e82794db09e2f9845b8d910eb465ab47ca022b778bf0');
console.log('claim same/child', '01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36');
const r = JSON.parse(fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round91/chromium-showpicker-proxy/receipt.json','utf8'));
console.log('match receipt   ', sha(parentHtml) === r.fixture.parent.sha256, sha(sameHtml) === r.fixture.same.sha256, sha(childHtmlPage) === r.fixture.child.sha256);
