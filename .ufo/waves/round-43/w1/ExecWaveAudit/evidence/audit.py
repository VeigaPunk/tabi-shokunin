import json, os, re, hashlib, subprocess, sys

R='/home/vgpnk/Projects/shokunin/tabi-shokunin'
W=R+'/.ufo/waves/round-43'
DISP=W+'/w1-dispatch.json'
SPEC=W+'/w1-spec.json'
READY=W+'/w1.ready'
out={}
def p(*a): print(*a)

# ---- A. ready file ----
ready_raw=open(READY,'rb').read()
try:
    ready=json.loads(ready_raw)
    ready_ok=True; ready_err=None
except Exception as e:
    ready=None; ready_ok=False; ready_err=str(e)
out['ready']={'parses':ready_ok,'err':ready_err,'raw':ready_raw.decode(),
  'lane':ready.get('lane') if ready else None,'round':ready.get('round') if ready else None,
  'wave':ready.get('wave') if ready else None,'dispatch':ready.get('dispatch') if ready else None,
  'l1':ready.get('l1') if ready else None,
  'lane_ok':(ready.get('lane')=='tabi') if ready else False,
  'round_ok':(ready.get('round')==43) if ready else False,
  'wave_ok':(ready.get('wave')=='w1') if ready else False,
  'l1_ok':(ready.get('l1')=='TabiR43') if ready else False,
  'dispatch_abs':os.path.isabs(ready.get('dispatch','')) if ready else False,
  'dispatch_exists':os.path.exists(ready['dispatch']) if ready else False,
  'dispatch_under_lane':(ready.get('dispatch','').startswith(R+'/') if ready else False)}
# r41 defect class: ready must point at a file WITH taskCall
dp_target=ready.get('dispatch') if ready else None
r41={'ready_points_at':dp_target}
if dp_target and os.path.exists(dp_target):
    try:
        dt=json.load(open(dp_target))
        r41['target_parses']=True
        r41['target_has_taskCall']='taskCall' in dt
        r41['target_top_keys']=list(dt.keys())
    except Exception as e:
        r41['target_parses']=False; r41['target_err']=str(e)
else:
    r41['target_parses']=False
out['r41_class']=r41

# ---- committed bytes vs worktree ----
def git_show(rev,path):
    r=subprocess.run(['git','-C',R,'show',f'{rev}:{path}'],capture_output=True)
    return r.stdout if r.returncode==0 else None
def sha(b): return hashlib.sha256(b).hexdigest() if b is not None else None
wt_disp=open(DISP,'rb').read(); wt_spec=open(SPEC,'rb').read()
cm_disp=git_show('HEAD','.ufo/waves/round-43/w1-dispatch.json')
cm_spec=git_show('HEAD','.ufo/waves/round-43/w1-spec.json')
cm_ready=git_show('HEAD','.ufo/waves/round-43/w1.ready')
out['bytes']={'dispatch_worktree_sha256':sha(wt_disp),'dispatch_committed_HEAD_sha256':sha(cm_disp),
 'dispatch_worktree_eq_committed':wt_disp==cm_disp,
 'spec_worktree_sha256':sha(wt_spec),'spec_committed_HEAD_sha256':sha(cm_spec),
 'spec_worktree_eq_committed':wt_spec==cm_spec,
 'ready_worktree_sha256':sha(ready_raw),'ready_committed_HEAD_sha256':sha(cm_ready),
 'ready_worktree_eq_committed':ready_raw==cm_ready}

d=json.loads(wt_disp.decode()); s=json.loads(wt_spec.decode())
tasks=d['taskCall']['tasks']; items=s['items']
byitem={i['name']:i for i in items}

# ---- B. taskCall structure ----
out['taskCall']={'present':'taskCall' in d,'tasks_len':len(tasks),
 'context_nonempty':bool(d['taskCall'].get('context')),
 'context_eq_spec':d['taskCall']['context']==s['context'],
 'counts':d.get('counts'),'policy_waveMinLanes':d['policy'].get('waveMinLanes'),
 'policy_waveMaxLanes':d['policy'].get('waveMaxLanes'),
 'in_lane_band':d['policy'].get('waveMinLanes',0)<=len(tasks)<=d['policy'].get('waveMaxLanes',0),
 'spawn_eq_len':d.get('counts',{}).get('spawn')==len(tasks)}

names=[t['name'] for t in tasks]
out['names']={'unique':len(set(names))==len(names),'count':len(names),
 'set_eq_spec':set(names)==set(byitem),'order_eq_spec':names==[i['name'] for i in items],
 'missing_from_dispatch':sorted(set(byitem)-set(names)),
 'extra_in_dispatch':sorted(set(names)-set(byitem))}

# ---- C. roles ----
role_mismatch=[{'name':t['name'],'dispatch_agent':t.get('agent'),'spec_role':byitem[t['name']]['role']}
               for t in tasks if t['name'] in byitem and t.get('agent')!=byitem[t['name']]['role']]
out['roles']={'mismatches':role_mismatch,'count':len(role_mismatch),
 'role_hist':{r:sum(1 for t in tasks if t.get('agent')==r) for r in sorted({t.get('agent') for t in tasks})},
 'spec_role_hist':{r:sum(1 for i in items if i['role']==r) for r in sorted({i['role'] for i in items})}}

# ---- D. registry (dispatch) vs spec vs tasks ----
reg=d.get('registry',{})
regm=reg.get('members',{})
out['registry']={'members_len':len(regm),'schema':reg.get('schema'),
 'path_field':reg.get('path'),'path_exists':os.path.exists(os.path.join(R,reg.get('path',''))),
 'reportDir':reg.get('reportDir'),
 'names_eq_tasks':set(regm)==set(names),
 'role_mismatch_vs_spec':[n for n in regm if n in byitem and regm[n].get('role')!=byitem[n]['role']],
 'axes_mismatch_vs_spec':[n for n in regm if n in byitem and regm[n].get('axes')!=byitem[n]['axes']],
 'milestone_mismatch_vs_spec':[n for n in regm if n in byitem and regm[n].get('milestone')!=byitem[n]['milestone']]}

# ---- E. godspeed block exactness ----
skill=open('/home/vgpnk/.agents/skills/godspeed/SKILL.md',encoding='utf-8').read()
body=skill.split('---\n',2)[2]
BLOCK='/skill:godspeed\n\n'+body+'\n'
out['godspeed']={'skill_body_sha256':hashlib.sha256(body.encode()).hexdigest(),
 'block_len':len(BLOCK),'block_repr_tail':repr(BLOCK[-90:])}
bad_prefix=[t['name'] for t in tasks if not t['task'].startswith(BLOCK)]
out['godspeed']['tasks_not_beginning_with_block']=bad_prefix
# also spec-side
out['godspeed']['spec_items_not_beginning_with_block']=[i['name'] for i in items if not i['prompt'].startswith(BLOCK)]
# prompt composition: dispatch task == spec prompt + trailer?
bodies={}
trailers={}
for t in tasks:
    sp=byitem[t['name']]['prompt']
    if t['task'].startswith(sp):
        trailers[t['name']]=t['task'][len(sp):]
    else:
        bodies[t['name']]=t['task']
out['godspeed']['dispatch_eq_spec_prompt_plus_trailer']=len(bodies)==0
out['godspeed']['not_eq']=list(bodies)[:5]

# ---- F. context absolute paths ----
ctx=d['taskCall']['context']
abs_paths=sorted(set(re.findall(r'(?<![\w/])(/home/[^\s`"\')\],;]+)',ctx)))
out['context_paths']={'all':abs_paths,
 'under_lane':[p for p in abs_paths if p.startswith(R+'/') or p==R],
 'outside_lane':[p for p in abs_paths if not (p.startswith(R+'/') or p==R)],
 'exists':{p:os.path.exists(p) for p in abs_paths},
 'contains_shokuknow':any('/shokuknow' in p for p in abs_paths),
 'mentions_readonly_fleet_root':'/home/vgpnk/Projects/shokunin' in ctx,
 'mentions_shokuknow':'shokuknow' in ctx}

# ---- G. per-task Report: trailer ----
rep={}
rep_dup=[]
for t in tasks:
    m=re.findall(r'Report:\s*(?:write your scoped findings to\s*)?(\S+)',t['task'])
    rep[t['name']]=m
    if len(set(m))>1: rep_dup.append((t['name'],m))
out['reports']={'missing':[n for n,m in rep.items() if not m],
 'multi':rep_dup,
 'all_under_wave_w1':all(all(x.startswith('.ufo/waves/round-43/w1/') for x in m) for m in rep.values() if m),
 'paths':{n:m for n,m in rep.items() if m},
 'unique_paths':len({x for m in rep.values() for x in m})==len([m for m in rep.values() if m])}

# ---- H. per-task referenced absolute paths exist ----
missing_refs={}
for t in tasks:
    ps=sorted(set(re.findall(r'(?<![\w/])(/home/[^\s`"\')\],;]+)',t['task'])))
    ms=[p for p in ps if not os.path.exists(p)]
    if ms: missing_refs[t['name']]=ms
out['task_missing_refs']=missing_refs

# ---- I. role/agent field sanity ----
out['task_fields']={'keys_union':sorted({k for t in tasks for k in t}),
 'agents_not_in_spec_roles':sorted({t.get('agent') for t in tasks}-{i['role'] for i in items}),
 'tasks_missing_agent':[t['name'] for t in tasks if 'agent' not in t]}

print(json.dumps(out,indent=1,ensure_ascii=False))
