import subprocess, json, sys
R="/home/vgpnk/Projects/shokunin/kaidoku-shokunin"
H=json.load(open("/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/baseline/c1-delta-pins.json"))["kaidoku"]
def show(rev, path):
    p=subprocess.run(["git","-C",R,"show",f"{rev}:{path}"],capture_output=True)
    return None if p.returncode!=0 else p.stdout.decode("utf-8","replace")
rows=[l.rstrip("\n").split("\t") for l in open("/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/w1-chunks/AdjDrift02.tsv") if l.strip()]
out=[]
for ref,_,_ in rows:
    lane,pin=ref.split("@"); pin,rest=pin.split(":",1); path,line=rest.rsplit(":",1); line=int(line)
    pinf=show(pin,path); headf=show(H,path)
    if pinf is None: st,note="stale","pin file absent"
    else:
        pl=pinf.split("\n")
        cited=pl[line-1].strip() if 0<=line-1<len(pl) else ""
        if not cited: st,note="stale","pin line absent"
        elif headf is None: st,note="stale","head file absent"
        else:
            hl=headf.split("\n")
            cur=hl[line-1].strip() if 0<=line-1<len(hl) else None
            if cur==cited: st,note="unchanged","-"
            else:
                hits=[i+1 for i,t in enumerate(hl) if t.strip()==cited]
                if hits: st,note="moved",":"+",:".join(map(str,hits))
                else: st,note="stale","cited text absent at head"
    out.append((ref,st,note,"H="+H[:12]))
for o in out: print("\t".join(o[:3]))
print("rows=%d"%len(out))
