import {readFileSync} from "node:fs";
const norm=(s)=>s.trim().replace(/\s+/g," ");
function blockIn(o,n){const L=o.length;if(!L)return true;for(let i=0;i+L<=n.length;i++){let ok=true;for(let j=0;j<L;j++)if(n[i+j]!==o[j]){ok=false;break;}if(ok)return i+1;}return 0;}
const jobs=[["content/public/common/content_switches.cc",596,603],["content/browser/devtools/devtools_pipe_handler.cc",135,200],["chrome/browser/devtools/remote_debugging_server.cc",353,400],["content/browser/devtools/devtools_http_handler.cc",297,306]];
for(const [p,a,b] of jobs){
 const old=readFileSync(`bytes/154.0.8037.97/${p}`,"utf8").split("\n");
 const neu=readFileSync(`bytes/156.0.8078.47/${p}`,"utf8").split("\n").map(norm);
 const blk=old.slice(a-1,b).map(norm);
 const at=blockIn(blk,neu);
 console.log(`${p} range=${a}-${b} oldlines=${old.length} blockAtNewLine=${at} verdict=${at?"holds":"drifted"}`);
}
