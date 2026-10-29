// Pure-function test of the egress classifier + recorder, NO network I/O.
// Bytes extracted verbatim from the frozen driver (and from the attempt-1 driver,
// which is byte-identical here) so the recorder path is exercised for real.
import fs from 'node:fs';
const FROZEN='/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/playwright-firefox-egress-round43.mjs';
const ATTEMPT1='/fast/scratch/hyaku/tabi-r43/SentEgressAudit/c41b.mjs'; // reconstructed attempt-1 driver
function extract(src, name){
  const i=src.indexOf('function '+name);
  if(i<0) throw new Error('missing '+name);
  // take until the next top-level "function " after i
  const j=src.indexOf('\nfunction ', i+10);
  return src.slice(i, j<0?src.length:j);
}
function load(src){
  const code=[extract(src,'isLoopbackPeer'),extract(src,'decodeProcIp'),extract(src,'isLoopbackHexRem')].join('\n');
  return new Function(code+'; return {isLoopbackPeer,decodeProcIp,isLoopbackHexRem};')();
}
const F=load(fs.readFileSync(FROZEN,'utf8'));
const A=load(fs.readFileSync(ATTEMPT1,'utf8'));
const peers=['127.0.0.1:44321','[::1]:44321','[::ffff:127.0.0.1]:44321','[0:0:0:0:0:0:0:1]:44321','0.0.0.0:0','[::]:44321','203.0.113.7:443','[2606:4700::1111]:443','198.51.100.42:80'];
console.log('=== isLoopbackPeer (frozen) ===');
for(const p of peers) console.log(' ',JSON.stringify(p),'->',F.isLoopbackPeer(p));
console.log('classifier identical attempt1 vs frozen:', peers.map(p=>A.isLoopbackPeer(p)).join()===peers.map(p=>F.isLoopbackPeer(p)).join());
console.log('=== isLoopbackHexRem (frozen) ===');
const rems=['0100007F:BBE1','00000000000000000000000001000000:BBE1','0000000000000000FFFF000001000000:BBE1','00000000000000000000000000000000:0000','0100007F:0000','0808080808080808B8850000:01BB'];
for(const r of rems) console.log(' ',r,'->',F.isLoopbackHexRem(r));
console.log('classifier identical attempt1 vs frozen:', rems.map(r=>A.isLoopbackHexRem(r)).join()===rems.map(r=>F.isLoopbackHexRem(r)).join());
// Recorder path from the frozen driver (the post-hardening delta), exercised on a
// synthetic proc/net/tcp row. No socket is created.
function recordHexRem(row){
  const [iphex,porthex]=row.rem.split(':');
  const b=F.decodeProcIp(iphex.toUpperCase());
  return `${b?b.join('.'):iphex}:${parseInt(porthex,16)}`;
}
console.log('=== recorder (frozen-only delta) on synthetic rows ===');
for(const r of rems) console.log('  rem',r,'-> recorded',JSON.stringify(recordHexRem({rem:r})));
