import fs from 'node:fs';
import crypto from 'node:crypto';
import { decode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/png-r64.mjs';
const dir = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/controls/smoke';
const receipt = JSON.parse(fs.readFileSync(dir + '/receipt.json', 'utf8'));
const GRID = { left: 8, top: 8, cell: 4, cols: 32, rows: 8 };
const BAND_COLORS = [[255,0,0],[0,128,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255]];
const BAND_HEIGHT = 120, BAND_SAMPLE_X = 1000, BAND_SAMPLE_Y = [60,180,300,420];
const LEG_WITNESS = { start:[10,20,30], down1:[40,50,60], down2:[70,80,90], up1:[100,110,120], swallowed:[130,140,150], released:[160,170,180] };
const bits = Array.from(crypto.createHash('sha256').update(receipt.nonce,'utf8').digest().subarray(0,32)).flatMap(b=>Array.from({length:8},(_,k)=>(b>>(7-k))&1));
const out = [];
for (const leg of receipt.legs) {
  const d = decode(fs.readFileSync(dir + '/' + leg.shot));
  let gridOk = true, gridHits = 0;
  for (let r=0;r<GRID.rows;r++) for (let c=0;c<GRID.cols;c++) {
    const p = d.pixel(GRID.left + c*GRID.cell + 2, GRID.top + r*GRID.cell + 2);
    const want = bits[r*GRID.cols+c] ? 255 : 0;
    if (p[0]!==want||p[1]!==want||p[2]!==want) { gridOk=false; } else gridHits++;
  }
  const bandOk = BAND_SAMPLE_Y.every((y,k)=>{ const idx=Math.floor((leg.scrollY+y)/BAND_HEIGHT)%BAND_COLORS.length; const p=d.pixel(BAND_SAMPLE_X,y); const w=BAND_COLORS[idx]; return p[0]===w[0]&&p[1]===w[1]&&p[2]===w[2]; });
  const w = LEG_WITNESS[leg.name]; const pw = d.pixel(1000,625);
  const witnessOk = pw[0]===w[0]&&pw[1]===w[1]&&pw[2]===w[2];
  out.push({ leg: leg.name, dims: d.width+'x'+d.height, gridBitsMatched: gridHits+'/256', gridOk, bandOk, witnessOk, witnessPixel: pw.join(',') });
}
console.log(JSON.stringify({ nonce: receipt.nonce, legs: out }, null, 1));
