import json,sys
D=sys.argv[1]
spec=json.load(open(D+'/w1-spec.json'))
disp=json.load(open(D+'/w1-dispatch.json'))
reg=json.load(open(D+'/w1/swarm-registry.json'))
mark_raw=open(D+'/w1.ready.dispatched').read()
ts,_,body=mark_raw.partition('\n')
print('marker ts:',ts,'| body bytes:',len(body.encode()))
try:
    mark=json.loads(body)
    print('marker json ok, keys:',len(mark), 'sample:', list(mark.items())[:2])
except Exception as e:
    print('marker body not json:',e); mark=None
spec_items=spec['items']
spec_names=[x['name'] for x in spec_items]
tasks=disp['taskCall']['tasks']
task_names=[t['name'] for t in tasks]
print('spec n',len(spec_names),'unique',len(set(spec_names)))
print('task n',len(task_names),'unique',len(set(task_names)))
print('names identical & same order:', spec_names==task_names)
print('set diff spec-task:', set(spec_names)^set(task_names))
mem=disp['registry']['members']
print('registry members',len(mem),'keys==names', set(mem)==set(spec_names))
print('registry members all kind=spawn:', all(v['kind']=='spawn' for v in mem.values()))
print('dispatch counts', disp['counts'])
print('reg file schema', reg.get('schema'), 'members', len(reg.get('members',{})), 'keys eq', set(reg.get('members',{}))==set(spec_names) if 'members' in reg else 'n/a')
print('reg file top keys', list(reg.keys()))
# prompt/task text linkage
mismatch=[]
for s,t in zip(spec_items,tasks):
    if s['prompt'] not in t['task'] and s['prompt'][:200] not in t['task']:
        mismatch.append(s['name'])
print('task text does not contain spec prompt (first 200 chars):', len(mismatch), mismatch[:5])
# role/axes/milestone vs registry
bad=[]
for s in spec_items:
    m=mem.get(s['name'])
    if not m or m['role']!=s['role'] or m['milestone']!=s['milestone'] or m['axes']!=json.loads(s['axes'].replace("'",'"')) if s['axes'].startswith('[') else True:
        bad.append(s['name'])
print('registry vs spec role/milestone/axes mismatches:', len(bad), bad[:5])
print('agent field values:', sorted(set(t.get('agent') for t in tasks)))
print('task solutionSpace key present:', sum('solutionSpace' in t for t in tasks))
print('spec item keys:', sorted(set(k for x in spec_items for k in x)))
print('prompts starting /skill:godspeed:', sum(x['prompt'].startswith('/skill:godspeed') for x in spec_items))
print('context identical to spec context:', disp['taskCall']['context']==spec['context'])
print('task texts unique:', len(set(t['task'] for t in tasks)))
print('reportDir in tasks mentions:', sum(spec['reportDir'] in t['task'] or spec['reportDir'] in disp['taskCall']['context'] for t in tasks))
if mark:
    mk=set(mark) ; print('marker keys==names', mk==set(spec_names), 'marker n', len(mk))
    print('marker key->value identity:', all(k==v for k,v in mark.items()))
    print('marker keys missing:', set(spec_names)-mk, 'extra:', mk-set(spec_names))
print('w1 subdirs:', sorted(__import__('os').listdir(D+'/w1')))
