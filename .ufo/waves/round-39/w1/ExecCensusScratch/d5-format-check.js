const fs = require('fs');
const [file, receipt] = process.argv.slice(2);
const srcs = fs.readFileSync(file, 'utf8').split('\n');
const mine = { rows: 0, tier: {}, status: {} };
for (const l of srcs) {
  if (/^ {0,3}\|\s*S\d{3,}\s*\|/.test(l)) {
    mine.rows += 1;
    const c = l.split('|').map((x) => x.trim());
    if (c.length >= 10) { mine.tier[c[4]] = (mine.tier[c[4]] || 0) + 1; mine.status[c[8]] = (mine.status[c[8]] || 0) + 1; }
  }
}
const text = fs.readFileSync(receipt, 'utf8');
const rm = /rows\s*[:=]\s*(\d+)/.exec(text);
const tm = /tier[s]?\s*[:=]\s*([^\n]*)/.exec(text);
const sm = /status\s*[:=]\s*([^\n]*)/.exec(text);
const parseHist = (s) => { const o = {}; for (const m of (s || '').matchAll(/([A-Za-z]+)\s*[:=]\s*(\d+)/g)) o[m[1]] = Number(m[2]); return o; };
const rt = parseHist(tm && tm[1]); const rs = parseHist(sm && sm[1]);
const eq = (a, b) => Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);
console.log('receiptRows=', rm ? Number(rm[1]) : null, ' counterRows=', mine.rows);
console.log('receiptTier=', JSON.stringify(rt), ' counterTier=', JSON.stringify(mine.tier), ' eq=', eq(rt, mine.tier));
console.log('receiptStatus=', JSON.stringify(rs), ' counterStatus=', JSON.stringify(mine.status), ' eq=', eq(rs, mine.status));
console.log('D5 rows-eq=', (rm ? Number(rm[1]) : null) === mine.rows, ' tier-eq=', eq(rt, mine.tier), ' status-eq=', eq(rs, mine.status));
