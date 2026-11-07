import fs from 'node:fs';
const C='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/controls/c1';
const A='/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round74/chromium-ime-composition/receipt.json';
const R=[1,2,3,4,5,6,7,8,9].map(i=>JSON.parse(fs.readFileSync(`${C}/smoke${i}.receipt.json`,'utf8')));
const a=JSON.parse(fs.readFileSync(A,'utf8'));
const maxDiff=(x,y)=>Math.max(...x.events.map((e,i)=>Math.max(Math.abs(e.ts-y.events[i].ts),Math.abs(e.at-y.events[i].at))));
const pairs=[];
for(let i=0;i<9;i++)for(let j=i+1;j<9;j++)pairs.push({i:i+1,j:j+1,d:maxDiff(R[i],R[j])});
const ds=pairs.map(p=>p.d).sort((x,y)=>x-y);
console.log('pairs',pairs.length,'min',ds[0],'median',ds[18],'max',ds[ds.length-1]);
console.log('<=1ms:',pairs.filter(p=>p.d<=1).map(p=>`s${p.i}-s${p.j}=${p.d}`));
console.log('<0.05ms:',pairs.filter(p=>p.d<0.05).length);
console.log('a vs smoke diffs:',R.map((r,i)=>`s${i+1}=${maxDiff(a,r)}`).join(' '));
console.log('a vs smokes <0.05:',R.filter(r=>maxDiff(a,r)<0.05).length);
const ident=(r)=>({nonce:r.nonce,tok:r.host&&r.host.launchToken,bid:r.host&&r.host.devtoolsListening&&r.host.devtoolsListening.browserId,
  started:r.startedAt,finished:r.finishedAt,nonceOnPage:r.nonceOnPage,
  devPort:(r.host.devtoolsListening||{}).port, fixture:r.fixture&&r.fixture.sha256, chrome:r.host&&r.host.chromium,
  origin:r.fixture&&r.fixture.origin, serverQ:(r.serverLog||[]).map(s=>s.run).filter(Boolean)});
for(const [i,r] of R.entries()) console.log('smoke'+(i+1),JSON.stringify(ident(r)));
console.log('(a)   ',JSON.stringify(ident(a)));
