import re,json,difflib
OUT="/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S081"
P="third_party/blink/renderer/core/html/forms/html_select_element.cc"
old=open(f"{OUT}/bytes/154.0.8037.97/{P}",encoding="utf-8").read().split("\n")
new=open(f"{OUT}/bytes/156.0.8078.47/{P}",encoding="utf-8").read().split("\n")
norm=lambda s:re.sub(r"\s+"," ",s.strip())          # counter: trim then collapse inner whitespace
nold=[norm(x) for x in old]; nnew=[norm(x) for x in new]
def hits(block):
    n=len(block); out=[]
    for i in range(len(nnew)-n+1):
        if nnew[i:i+n]==block: out.append(i+1)
    return out
res=[]
for a,b in [[291,347],[871,887],[1047,1108],[1162,1184],[180,210]]:
    h=hits(nold[a-1:b])
    res.append({"range":[a,b],"old_lines":b-a+1,"verdict":"holds" if h else "drifted","at_156":h,
                "anchor_token":(f"{a}-{b}" if a!=b else str(a))})
print(json.dumps(res,indent=1))
print("old_line_count",len(old),"new_line_count",len(new))
