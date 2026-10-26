import { readFileSync, writeFileSync } from 'node:fs';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin';
const ledger=readFileSync(LANE+'/corpus/adjacency-screen-browser.tsv','utf8').split('\n');
const rows=[];
for(let i=1;i<ledger.length;i++){const l=ledger[i];if(!l)continue;const f=l.split('\t');if(f[0].startsWith('kake-shokunin@'))rows.push({row:i+1,ref:f[0],reason:f[1],surface:f[2],quote:f[3]});}
// judgment map: ledger row -> [verdict, correct reason(+surface), ground sentence]
const J = {
 195:['ok','not-browser-sense','Property-map row pricing the live site burnerchrome.kimi.page and its source dir; the BG hit is the site name, not a browser.'],
 196:['ok','not-browser-sense','Fleet-registry row name (burnerchrome-com) invisible to probe/status by design; no browser claim.'],
 197:['ok','no-claim-declared','Kake records kimi-webbridge unsupported on this host and DOM chat automation as not a site-ops channel - a boundary, not a claim on tabi\'s webbridge surface.'],
 198:['ok','same-surface musketeer-cdp-9222-profile-lease','Kake binds the shared burner chrome to the-musketeer profile at CDP 127.0.0.1:9222 - exactly the contested lease surface row 7 already answers for kake.'],
 199:['ok','not-browser-sense','Source subtree name (burnerchrome/) beside render.yaml and apps-sdk/ in a source-tree listing.'],
 200:['ok','not-browser-sense','Property-map STALE audit decided by test -e over local source directories.'],
 201:['ok','not-browser-sense','One public GET proving the burnerchrome.kimi.page property is live - publisher-side liveness, not browser execution.'],
 202:['ok','not-browser-sense','Correction swaps one local source checkout path for another.'],
 203:['ok','not-browser-sense','Served HTML head of one published page read as property evidence.'],
 204:['ok','not-browser-sense','Dated test -e reconciliation that a source directory named burnerchrome is present.'],
 205:['ok','not-browser-sense','Same dated filesystem reconciliation, repeated.'],
 206:['ok','not-browser-sense','Same dated filesystem reconciliation, repeated.'],
 207:['ok','not-browser-sense','CrUX eligibility: Chrome/WebView/Chromium names the audience that sends no field data, not a browser this lane drives.'],
 208:['ok','not-browser-sense','sync-check verdict rows naming kimi-surface properties (burnerchrome-kimi) - mirror state, not browser driving.'],
 209:['ok','same-surface lab-performance-tool-runs','Lab-tool capability facts (Chrome DevTools measures INP) on kake\'s own side of the split row 15 already owns (running the tool is tabi\'s work).'],
 210:['ok','not-browser-sense','CrUX contributor eligibility; browser families listed as measurement inputs, not drivers.'],
 211:['ok','not-browser-sense','Same CrUX eligibility point; "Chromium browsers" is an audience class.'],
 212:['ok','not-browser-sense','Fleet inventory row: site id burnerchrome-kimi at burnerchrome.kimi.page with a source dir.'],
 213:['ok','not-browser-sense','Queued inventory row burnerchrome-com with url null and a source dir.'],
 214:['ok','not-browser-sense','Dated local-state annotation that the burnerchrome source directory is present; deployment and byte continuity left unverified.'],
 215:['ok','not-browser-sense','Same dated local-state annotation (correcting row 66 of that inventory).'],
 216:['ok','not-browser-sense','sync-check verdict on the property id burnerchrome-kimi; the entry\'s own lines 210-211 call this verb pure HTTP with browser-gated kimi verbs out of scope.'],
 217:['ok','not-browser-sense','Artifact filename sync-burnerchrome.out in the artifact table of the plain-HTTP sync-check verb.'],
 218:['ok','not-browser-sense','Queued fleet row name burnerchrome-com among three wrapper misses.'],
 219:['ok','same-surface js-rendering-browser-execution','Block quotation of Google\'s rendering doc inside a publisher-side crawl-hygiene entry; split row 12 already answers browser execution for kake, and the line asserts no kake side.'],
 220:['ok','not-browser-sense','Add-date decomposition naming the source subdirectory burnerchrome/ of the mirror.'],
 221:['ok','not-browser-sense','Same-origin link sweep row for the property burnerchrome-kimi.'],
 222:['ok','not-browser-sense','HOLD recording plain GETs of burnerchrome.kimi.page\'s 15 same-origin targets - property coverage, no browser named.'],
 223:['ok','not-browser-sense','Open Graph census lists the source directory burnerchrome/ among the authored pages.'],
 224:['ok','not-browser-sense','Page filename burnerchrome.html in the same Open Graph census.'],
 225:['ok','not-browser-sense','Owned-properties OG census names the burnerchrome kimi.page root; captured bytes, not browser ground.'],
 226:['ok','not-browser-sense','Publisher-side re-publish gap list mentions the burnerchrome pages mirrored on Vercel.'],
 227:['ok','no-claim-declared','Entry header declares its Browser/CDP bullets have no named source and are metadata authority only (S019), and line 3 says no browser operation is authorized - an explicit non-claim.'],
 228:['ok','same-surface musketeer-cdp-9222-profile-lease','Heading of kake\'s Browser/CDP-lane section whose first bullet is the shared-burner-profile lease - the contested lease surface row 7 already answers.'],
 229:['ok','same-surface musketeer-cdp-9222-profile-lease','Launch recipe for the shared musketeer-chrome (setsid -f), the same profile/binary the lease row covers.'],
 230:['ok','same-surface musketeer-cdp-9222-profile-lease','Auth-verb help row enumerates the shared CDP endpoint and its tabs - kake\'s own side of the mapped lease surface.'],
 231:['ok','same-surface musketeer-cdp-9222-profile-lease','Lease verb serializes the shared burner chrome machine-wide - the exact lease behavior row 7 already dispositions.'],
 232:['ok','not-browser-sense','Byte comparison of the published site burnerchrome.kimi.page against its source repo - a publisher-side check.'],
 233:['ok','not-browser-sense','Source-directory comparison: vendored ds4cc-marketplace/burnerchrome vs repos/burnerchrome.'],
 234:['ok','not-browser-sense','fleet.config sourceDir key for the burnerchrome site - config drift record.'],
 235:['ok','not-browser-sense','Names the canonical source repo of the burnerchrome site; no browser, driver, protocol or capture.'],
 236:['ok','not-browser-sense','Static GET byte re-check of the published property URL.'],
 237:['ok','same-surface crawler-discipline-vs-publishing','Provenance header of kake\'s publish-channel entry (kimi-webbridge unsupported check) - a fact on kake\'s own publisher side of split row 6.'],
 238:['ok','same-surface crawler-discipline-vs-publishing','Asserts kake\'s publish-channel fact (no non-GUI channel on this host) on the publisher side of split row 6; the plugin is named only as the reason.'],
 239:['ok','same-surface crawler-discipline-vs-publishing','Publish-channel re-verification finding on the publisher side of split row 6; explicitly declines to establish the plugin\'s behavior.'],
 240:['ok','not-browser-sense','PQ-2 publish-queue row: the /burnerchrome/ mirror path 404s are a kimi dir-index pitfall - a publishing observation.'],
 241:['ok','same-surface musketeer-cdp-9222-profile-lease','Names the shared CDP 127.0.0.1:9222 endpoint\'s downtime as a caveat to kake\'s publish ledger - the mapped lease surface, no new side.'],
 242:['ok','same-surface musketeer-cdp-9222-profile-lease','Same CDP 9222 downtime named in kake\'s evidence rule about publishedUrl:null - referent is the mapped shared-chrome endpoint.'],
 243:['ok','not-browser-sense','Property-array census in which burnerchrome .com is a property name.'],
 244:['ok','not-browser-sense','Healthy-property list names burnerchrome among sites with HTTP health results.'],
 245:['ok','not-browser-sense','Round-23 re-verification of property health by unauthenticated GETs; burnerchrome.kimi.page is one URL.'],
};
const lines=['key\tverdict\tcorrect-reason+surface\tground'];
let nOk=0,nRelabel=0,nShouldMap=0; const counts={};
for(const r of rows){
  const j=J[r.row]; if(!j) throw new Error('missing judgment for row '+r.row);
  const [v,rs,g]=j;
  if(v==='ok')nOk++; else if(v==='relabel')nRelabel++; else nShouldMap++;
  counts[rs.split(' ')[0]]=(counts[rs.split(' ')[0]]||0)+1;
  lines.push([r.ref,v,rs,g].join('\t'));
}
writeFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/CritScreenKake/verdicts.tsv',lines.join('\n')+'\n');
writeFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w2/CritScreenKake/counts.json',JSON.stringify({rows:rows.length,ok:nOk,relabel:nRelabel,shouldMap:nShouldMap,reasonCounts:counts},null,2)+'\n');
console.log('rows',rows.length,'ok',nOk,'relabel',nRelabel,'shouldMap',nShouldMap,'reasonCounts',JSON.stringify(counts));
