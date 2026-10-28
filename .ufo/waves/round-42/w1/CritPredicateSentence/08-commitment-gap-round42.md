== commitment of the round-42 C1 artifacts (audit time) ==
$ git status --porcelain -- corpus/evidence/round42
?? corpus/evidence/round42/
$ git cat-file -e 0081bfdb93b6bd1bf2853bb128996f1a976b7218:corpus/evidence/round42/playwright-egress/receipt.json
fatal: path 'corpus/evidence/round42/playwright-egress/receipt.json' exists on disk, but not in '0081bfdb93b6bd1bf2853bb128996f1a976b7218' (exit 128)
$ git log --all --oneline -- corpus/evidence/round42
(no commit ever contained the path)
$ git ls-tree -r --name-only HEAD -- .ufo/waves/round-42/measure
.ufo/waves/round-42/measure/c1-measure.exit
.ufo/waves/round-42/measure/c1-measure.json
.ufo/waves/round-42/measure/c1-measure.stderr.txt
.ufo/waves/round-42/measure/census-start.err
.ufo/waves/round-42/measure/census-start.exit
.ufo/waves/round-42/measure/census-start.out

$ python3 (sha compare: committed measure record vs untracked receipt/witness)
{
 "committed measure receiptSha256": "3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e",
 "actual untracked receipt sha256": "3984455276a5b54a0a7652fc76923eb46d446f0630556d6775abc7c1fd317b7e",
 "committed measure witnessSha256": "163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339",
 "actual untracked witness sha256": "163f4eba7f8b6c93daa0e5742b0ade81ee16ff716cc27bc578fb76795a57d339",
 "receipt bytes": 1145258,
 "witness bytes": 1122212,
 "committed measure counter.predicate": true,
 "counter findings": [],
 "committed measure schema": "tabi-r41-c1-measure"
}

== commit 236c4f4 message (asserts the measurement) ==
236c4f4 round-42: C1 live measurement (predicate true, spans 16356/17790ms) + battery/replay controls; C1/C2 pre-data controls; wave w1 spec+dispatch(64 seats, attack 23/64)+registry+ready; LOG pre-dispatch entry


== env ==
node v26.12.0 ; git version 2.56.0

== note: the C2 checker's r4 evidence check uses this primitive ==
grep -n "cat-file" .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
18://         nonempty, recording the ls-tree counting command and the digit 0;
23:// The committed-bytes checks are built on S149 (git-ls-tree documentation,
61:  const r = spawnSync('git', ['-C', repo, 'cat-file', '-s', `${rev}:${revPath}`], { encoding: 'utf8' });
128:    if (!/ls-tree/.test(raw)) add('r3-command-not-recorded', 'baseline control does not record its ls-tree counting command');

