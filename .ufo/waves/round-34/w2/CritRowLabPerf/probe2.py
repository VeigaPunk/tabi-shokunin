import subprocess, sys, os
CL='/fast/scratch/hyaku/tabi-r34/CritRowLabPerf/clone'
def run(a): return subprocess.run(a,cwd=CL,text=True,capture_output=True)
def commit(m):
    r=run(['git','-c','user.name=CritRowLabPerf','-c','user.email=CritRowLabPerf@scratch.local','commit','-qam',m]); assert r.returncode==0,r.stderr
    print(run(['git','rev-parse','HEAD']).stdout.strip())
def drop(surface):
    p=os.path.join(CL,'corpus/adjacency.tsv'); ls=open(p,encoding='utf-8').read().split('\n')
    keep=[l for l in ls if not l.startswith(surface+'\t')]; assert len(keep)==len(ls)-1
    open(p,'w',encoding='utf-8').write('\n'.join(keep))
def repoint(old,new):
    p=os.path.join(CL,'corpus/adjacency-screen-skill.tsv'); ls=open(p,encoding='utf-8').read().split('\n')
    n=0
    for i,l in enumerate(ls):
        f=l.split('\t')
        if len(f)==5 and f[2]==old:
            f[2]=new; ls[i]='\t'.join(f); n+=1
    assert n==1,n
    open(p,'w',encoding='utf-8').write('\n'.join(ls))
def screen(key,quote,note):
    p=os.path.join(CL,'corpus/adjacency-screen-skill.tsv'); s=open(p,encoding='utf-8').read()
    if not s.endswith('\n'): s+='\n'
    open(p,'w',encoding='utf-8').write(s+'\t'.join([key,'same-surface','js-rendering-browser-execution',quote,note])+'\n')
K='kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:SKILL.md:'
m=sys.argv[1]
if m=='p1b':
    drop('lab-performance-tool-runs'); repoint('lab-performance-tool-runs','js-rendering-browser-execution')
    screen(K+'697',"Running the tool is tabi's work",'probe P1b: row 16 withdrawn, 697 screened same-surface on row 12; :153 screen re-pointed')
    commit('probe P1b: row 16 withdrawn, 697 screened on row 12')
elif m=='p2b':
    drop('live-delivery-observation')
    screen(K+'408','route browser work to tabi, publishing/account actions to the operator','probe P2b: row 15 withdrawn, 408 screened same-surface on row 12')
    commit('probe P2b: row 15 also withdrawn, 408 screened on row 12')
