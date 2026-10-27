// Does a ZOMBIE browser child (cmdline emptied) escape scratchSurvivors?
// The counter's check is a cmdline-string scan; a zombie's /proc/<pid>/cmdline is empty.
import { readdirSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const LANE='/home/vgpnk/Projects/shokunin/tabi-shokunin', FREEZE='99437d29de036415a9f2d0524343617a3b19988a';
const src=spawnSync('git',['-C',LANE,'show',`${FREEZE}:.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs`],{encoding:'utf8',maxBuffer:64*1024*1024}).stdout;
const i=src.indexOf('function scratchSurvivors');
const FN=src.slice(i,src.indexOf('\n}\n',i)+3);
const scratchSurvivors=new Function('readdirSync','readFileSync',`${FN}\nreturn scratchSurvivors;`)(readdirSync,readFileSync);
const BASE=process.env.TMPDIR; const A=mkdtempSync(join(BASE,'tabi-r36-c2-live-'));
// python parent forks a child with the scratch path in argv, child exits, parent never waits -> zombie
const py=`import os,time,sys
pid=os.fork()
if pid==0:
    os.execv("/bin/sleep",["sleep","30"])   # argv carries NO scratch path
else:
    time.sleep(0.3)
    # child exits -> becomes zombie (parent has not waited())
    os._exit(0)`;
const r=spawnSync('python3',['-c',py],{encoding:'utf8'});
// build the zombie ourselves with the path in argv
const py2=`import os,time
r,w=os.pipe()
pid=os.fork()
if pid==0:
    os.execv("/bin/sleep",["sleep","30"])
else:
    time.sleep(0.5)
    st=os.readlink(f"/proc/{pid}/stat") if False else ""
    try:
        fields=open(f"/proc/{pid}/stat").read().rsplit(") ",1)[1].split()
        print("zombie_state="+fields[0])
    except Exception as e:
        print("err",e)
    try:
        raw=open(f"/proc/{pid}/cmdline","rb").read()
        print("cmdline_bytes="+str(len(raw)))
    except Exception as e:
        print("cmdline_err",e)
    print("zombie_pid="+str(pid))
`;
const r2=spawnSync('python3',['-c',py2],{encoding:'utf8'});
const out={A, r2stdout:r2.stdout, notes:'parent exits without wait() -> child reparented to init and reaped; to observe a zombie the parent must stay alive'};
// Direct: use a long-lived python parent that forks a doomed child with the scratch path in argv
const py3=`import os,time,sys
S=sys.argv[1]
pid=os.fork()
if pid==0:
    os.execv("/bin/sleep",["sleep","30"])
else:
    time.sleep(0.4)
    # write scratch path into the child's argv is impossible post-exec; instead use a symlink-free marker
    # Report state of the child we spawned
    f=open(f"/proc/{pid}/stat").read().rsplit(") ",1)[1].split()
    raw=open(f"/proc/{pid}/cmdline","rb").read()
    print("child_pid=%d state=%s cmdline_len=%d cmdline=%r" % (pid,f[0],len(raw),raw))
    # now make it a zombie: kill it and never wait
    os.kill(pid,9)
    time.sleep(0.4)
    f2=open(f"/proc/{pid}/stat").read().rsplit(") ",1)[1].split()
    raw2=open(f"/proc/{pid}/cmdline","rb").read()
    print("zombie_state=%s zombie_cmdline_len=%d zombie_cmdline=%r" % (f2[0],len(raw2),raw2))
    time.sleep(3)
`;
const r3=spawnSync('python3',['-c',py3,A],{encoding:'utf8'});
out.py3=r3.stdout;
const found=scratchSurvivors(A);
out.scanFound=found;
out.notes2='the python child argv had no scratch path; the point is the ZOMBIE cmdline length';
rmSync(A,{recursive:true,force:true});
console.log(JSON.stringify(out,null,2));
