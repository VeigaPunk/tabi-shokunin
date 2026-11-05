# SUGGESTION only (R66MutTester1). Not applied to v3; the frozen v2/v3 bytes are unchanged.

Insert this block in `selftest()` immediately before `  const passed = results.filter((r) => r.ok).length;`.
It uses the existing `dir`, `repo`, `aSha`, `good()`, `evaluate()` and `sha()` names from v3.
Verified on a scratch copy: pristine `cases=15 passed=15`, exit 0. Kills: (i) S-matrix-dir-relative, (ii) and (iii) S-matrix-repo-relative, (iv) crash in S-matrix-directory-input.

```js
  // SUGGESTION (R66MutTester1; not in v3): relative-input bindings, one per base, and a directory input.
  {
    const sibBytes = 'export const sib = 2;\n';
    fs.writeFileSync(path.join(dir, 'sibling.mjs'), sibBytes);
    const sibSha = sha(Buffer.from(sibBytes));
    for (const c of [
      { id: 'S-matrix-repo-relative', name: 'matrix-srel1.json', matrix: { input: { path: 'instruments/a.mjs', sha256: aSha } }, want: (f) => f.check === 'matrix-input', negate: true },
      { id: 'S-matrix-dir-relative', name: 'matrix-srel2.json', matrix: { input: { path: 'sibling.mjs', sha256: sibSha } }, want: (f) => f.check === 'matrix-input', negate: true },
      { id: 'S-matrix-directory-input', name: 'matrix-srel3.json', matrix: { input: { path: 'instruments', sha256: 'a'.repeat(64) } }, want: (f) => f.check === 'matrix-input' && f.detail === 'input absent: instruments' },
    ]) {
      fs.writeFileSync(path.join(dir, c.name), JSON.stringify(c.matrix));
      fs.writeFileSync(path.join(dir, c.name.replace(/\.json$/, '') + '.command.json'), JSON.stringify({ ...good(), name: c.name.replace(/\.json$/, '') }, null, 1));
      const res = evaluate(dir, repo, 'worktree', false, 0);
      const hit = res.findings.some(c.want);
      results.push({ id: c.id, ok: c.negate ? !hit : hit, findings: res.findings.map((f) => f.check) });
      fs.rmSync(path.join(dir, c.name), { force: true });
      fs.rmSync(path.join(dir, c.name.replace(/\.json$/, '') + '.command.json'), { force: true });
    }
    fs.rmSync(path.join(dir, 'sibling.mjs'), { force: true });
  }
```
