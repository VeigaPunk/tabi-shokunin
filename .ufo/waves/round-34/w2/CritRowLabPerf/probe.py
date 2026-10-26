import subprocess, sys, json, os
CL='/fast/scratch/hyaku/tabi-r34/CritRowLabPerf/clone'
def run(args, **kw):
    return subprocess.run(args, cwd=CL, text=True, capture_output=True, **kw)
def commit(msg):
    r=run(['git','-c','user.name=CritRowLabPerf','-c','user.email=CritRowLabPerf@scratch.local','commit','-qam',msg])
    assert r.returncode==0, r.stderr
    return run(['git','rev-parse','HEAD']).stdout.strip()
def drop_row(surface):
    p=os.path.join(CL,'corpus/adjacency.tsv')
    ls=open(p,encoding='utf-8').read().split('\n')
    keep=[l for l in ls if not l.startswith(surface+'\t')]
    assert len(keep)==len(ls)-1, (len(keep),len(ls))
    open(p,'w',encoding='utf-8').write('\n'.join(keep))
def screen(key,quote,note):
    p=os.path.join(CL,'corpus/adjacency-screen-skill.tsv')
    s=open(p,encoding='utf-8').read()
    row='\t'.join([key,'same-surface','js-rendering-browser-execution',quote,note])
    if not s.endswith('\n'): s+='\n'
    open(p,'w',encoding='utf-8').write(s+row+'\n')
K='kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:SKILL.md:'
mode=sys.argv[1]
if mode=='p1':
    drop_row('lab-performance-tool-runs')
    screen(K+'697',"Running the tool is tabi's work",'probe P1: row 16 re-keyed as a screen of row 12 (browser execution -> tabi)')
    print(commit('probe P1: row 16 screened same-surface row 12'))
elif mode=='p2':
    drop_row('live-delivery-observation')
    screen(K+'408','route browser work to tabi, publishing/account actions to the operator','probe P2: row 15 re-keyed as a screen of row 12')
    print(commit('probe P2: row 15 also screened same-surface row 12'))
