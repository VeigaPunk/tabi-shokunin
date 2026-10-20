#!/usr/bin/env python3
"""Round15 snapshot witness: no browser, immutable lane inputs, isolated CLI runs."""
import hashlib, json, os, pathlib, subprocess, tempfile
ROOT=pathlib.Path(__file__).resolve().parents[3]
BASE='7054a5e1068538349b4dbb0d291c2fe8643802f2'
SCRIPT='scripts/check-aria-metadata.mjs'
SIDECAR='corpus/evidence/round-14/aria-metadata/corrected.json'
ENV={'PATH':os.environ['PATH'],'HOME':os.environ['HOME'],'TZ':'UTC'}
PATHS=[
 'corpus/evidence/round-13/aria/receipt.json',
 'corpus/evidence/round-13/aria/runtime-pin.json',
 'corpus/evidence/round-13/aria/manifest.json',
 'corpus/evidence/round-13/aria/aria-loopback.spec.mjs',
 'corpus/evidence/round-13/aria/playwright.config.mjs',
 'corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json',
 'scripts/aria-loopback-round13.mjs', SIDECAR]
def blob(rev,path):
 return subprocess.check_output(['git','-C',str(ROOT),'show',rev+':'+path],env=ENV)
def run(root,args):
 cmd=['node',str(root/SCRIPT),*args]
 p=subprocess.run(cmd,cwd=root,env=ENV,text=True,capture_output=True,timeout=45)
 structured=None
 for line in p.stdout.splitlines():
  if line.startswith('ARIA_METADATA_JSON '): structured=json.loads(line[len('ARIA_METADATA_JSON '):])
 return {'command':cmd,'exit':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'payload':structured}
def accepted(record):
 return record['payload'] is not None and record['payload'].get('acceptedCorrection') is True
def failed_ids(record):
 return {x['id'] for x in (record['payload'] or {}).get('findings',[]) if x.get('status') != 'pass'}
def main():
 rev=subprocess.check_output(['git','-C',str(ROOT),'rev-parse','HEAD'],env=ENV,text=True).strip()
 current=blob(rev,SCRIPT); old=blob(BASE,SCRIPT)
 inputs={p:blob(BASE,p) for p in PATHS}
 records=[]
 with tempfile.TemporaryDirectory(prefix='tabi-r15-metadata-witness-') as d:
  root=pathlib.Path(d)
  for path,data in inputs.items():
   f=root/path; f.parent.mkdir(parents=True,exist_ok=True); f.write_bytes(data)
  original=json.loads(inputs[SIDECAR])
  mirrors=[('cleanup',x) for x in ['allClosed','allRefusedAfterClose','allNotListeningAfter','derivedListeningAfter','perWorkerCount','summaryServerOk']]
  mirrors += [('qualification',x) for x in ['everyProofListensBefore','everyProofClosed','everyProofRefusedAfterClose']]
  for section,key in mirrors:
   mutant=json.loads(json.dumps(original)); value=mutant[section][key]
   mutant[section][key]=(not value) if isinstance(value,bool) else value+1
   target=root/'mutated-sidecar.json'; target.write_text(json.dumps(mutant))
   arms={}
   for name,code in [('before',old),('after',current)]:
    (root/SCRIPT).write_bytes(code)
    arms[name]=run(root,['--check',str(target)])
   records.append({'case':section+'.'+key,'mutation':{'from':value,'to':mutant[section][key]},**arms,
    'pass':arms['before']['exit']==0 and accepted(arms['before']) and arms['after']['exit']==1 and not accepted(arms['after']) and any('SIDECAR' in x for x in failed_ids(arms['after']))})
  # Positive canonical sidecar and authenticated source-byte alteration share one snapshot.
  (root/SCRIPT).write_bytes(old)
  old_positive=run(root,['--check',SIDECAR])
  (root/SCRIPT).write_bytes(current)
  positive=run(root,['--check',SIDECAR])
  spec_path='corpus/evidence/round-13/aria/aria-loopback.spec.mjs'
  (root/spec_path).write_bytes(inputs[spec_path]+b'\n// isolated snapshot identity alteration\n')
  arms={}
  for name,code in [('before',old),('after',current)]:
   (root/SCRIPT).write_bytes(code); arms[name]=run(root,['--check',SIDECAR])
  tamper={'case':'spec-snapshot-digest','field':spec_path,'recordedSha256':hashlib.sha256(inputs[spec_path]).hexdigest(),'computedSha256':hashlib.sha256((root/spec_path).read_bytes()).hexdigest(),**arms,'pass':arms['before']['exit']==1 and not accepted(arms['before']) and 'R14-ARIA-SOURCE-01' in failed_ids(arms['before']) and arms['after']['exit']==2 and 'snapshot_tampered' in failed_ids(arms['after'])}
  untouched={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==hashlib.sha256(data).hexdigest() for p,data in inputs.items()}
 result={'schema':'tabi-round15-metadata-differential-v1','sourceRows':['S029'],'baseline':BASE,'revision':rev,
  'codeSha256':hashlib.sha256(current).hexdigest(),'oldCodeSha256':hashlib.sha256(old).hexdigest(),
  'snapshotInputs':{p:hashlib.sha256(data).hexdigest() for p,data in inputs.items()},
  'mirrors':records,'oldPositive':old_positive,'positive':positive,'tamper':tamper,'originalsUnchanged':untouched,
  'pass':all(x['pass'] for x in records) and tamper['pass'] and old_positive['exit']==0 and accepted(old_positive) and positive['exit']==0 and accepted(positive) and all(untouched.values()),'browserExecuted':False}
 print(json.dumps(result,indent=2)); return 0 if result['pass'] else 1
if __name__=='__main__': raise SystemExit(main())
