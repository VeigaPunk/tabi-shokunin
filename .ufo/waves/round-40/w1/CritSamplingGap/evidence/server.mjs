import net from 'node:net'; import fs from 'node:fs';
const srv=net.createServer(s=>{s.on('data',()=>{});s.on('error',()=>{});});
srv.listen(0,'192.168.0.253',()=>fs.writeFileSync('port',String(srv.address().port)));
setTimeout(()=>process.exit(0),120000);
