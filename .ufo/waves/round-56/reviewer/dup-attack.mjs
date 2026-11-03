const mod = await import(process.argv[2]);
const text = 'line one\nheadless mode here\nline three\n';
const lines = text.split('\n').length - 1; // trailing newline stripped by counter: lines.length after replace
const linesArr = text.replace(/\n$/, '').split('\n');
const sha = (await import('node:crypto')).createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
const base = {
  roster: ['x-shokunin'], mapRows: [], auditRows: [],
  sibRef: () => text, headOf: () => 'H1',
  deltaRows: [
    ['lane', 'x-shokunin', 'PROVINCE.md', sha, String(linesArr.length), '1', '-', '-', 'H1'],
    ['line', 'x-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'headless mode here', 'no-tabi-ground', 'H1'],
  ],
};
const good = mod.verify(base);
const dup = mod.verify({ ...base, deltaRows: [...base.deltaRows, ['line', 'x-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'headless mode here', 'BOGUS-DISPOSITION', 'H1']] });
const dupLane = mod.verify({ ...base, deltaRows: [...base.deltaRows, ['lane', 'x-shokunin', 'PROVINCE.md', 'WRONG', '9', '9', '-', '-', 'H9']] });
console.log(JSON.stringify({ control_no_dup: good.findings.map(f=>f.id), dup_bogus_disposition: dup.findings.map(f=>f.id), dup_lane_wrong_sha: dupLane.findings.map(f=>f.id) }));
