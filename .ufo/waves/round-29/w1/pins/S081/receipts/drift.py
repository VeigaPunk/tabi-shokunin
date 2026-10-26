import difflib,json
OUT="/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S081"
P="third_party/blink/renderer/core/html/forms/html_select_element.cc"
old=open(f"{OUT}/bytes/154.0.8037.97/{P}",encoding="utf-8").read().split("\n")
new=open(f"{OUT}/bytes/156.0.8078.47/{P}",encoding="utf-8").read().split("\n")
nold=[x.strip() for x in old]; nnew=[x.strip() for x in new]
sm=difflib.SequenceMatcher(None,nold,nnew,autojunk=False)
# map old index -> new index
mapo={}
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag in ("equal","replace"):
        for k in range(i2-i1):
            if j1+k < j2: mapo[i1+k]=j1+k
            elif j1<len(nnew): mapo[i1+k]=min(j1,len(nnew)-1)
    else:
        for k in range(i1,i2): mapo[k]=j1
a,b=1047,1108
js=[mapo[i] for i in range(a-1,b) if i in mapo]
lo,hi=min(js)+1,max(js)+1
print(json.dumps({"old_range":[a,b],"new_span":[lo,hi],"new_span_len":hi-lo+1},indent=1))
print("\n===== unified diff (trimmed, context 3) =====")
d=list(difflib.unified_diff(nold[a-1-3:b+3],nnew[lo-1-3:hi+3],fromfile=f"154.0.8037.97:{a-3}-{b+3}",tofile=f"156.0.8078.47:{lo-3}-{hi+3}",lineterm="",n=3))
print("\n".join(d))
print("\n===== 156 region verbatim with line numbers =====")
for i in range(lo-12,hi+12):
    print(f"{i+1:5d}| {new[i]}")
