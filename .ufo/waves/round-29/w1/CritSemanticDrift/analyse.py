import re,hashlib,os,json
base='.'
def fn(tag,p): return f"{tag}/{p.replace('/','_')}"
def norm(s): return re.sub(r'\s+',' ',s.strip())
def block_occ(old,new):
    n=len(old)
    if n==0: return 1
    return sum(1 for i in range(len(new)-n+1) if all(new[i+j]==old[j] for j in range(n)))
rows={
 'S033':[('third_party/blink/renderer/core/script_tools/model_context_supplement.idl',[(7,12)])],
 'S034':[('third_party/blink/renderer/platform/runtime_enabled_features.json5',[(7023,7050)])],
 'S041':[('third_party/blink/public/devtools_protocol/domains/WebMCP.pdl',[(7,7),(58,122)])],
 'S042':[('third_party/blink/renderer/core/script_tools/model_context.cc',[(528,580),(748,811),(856,873)])],
 'S045':[('third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html',[(87,87),(113,113)]),
         ('third_party/blink/web_tests/inspector-protocol/webmcp/invoke-tool.js',[(38,51)]),
         ('third_party/blink/public/devtools_protocol/domains/WebMCP.pdl',[(68,68)])],
 'S062':[('content/public/common/content_switches.cc',[(596,603)]),
         ('content/browser/devtools/devtools_pipe_handler.cc',[(135,200)]),
         ('chrome/browser/devtools/remote_debugging_server.cc',[(353,400)]),
         ('content/browser/devtools/devtools_http_handler.cc',[(297,306)])],
 'S064':[('base/command_line.cc',[(449,455)]),('base/feature_list.cc',[(417,453),(872,875)])],
 'S071':[('third_party/blink/renderer/core/html/forms/form_mcp_schema.cc',[(208,243)]),
         ('third_party/blink/renderer/core/html/forms/html_form_element.cc',[(192,258)]),
         ('third_party/blink/renderer/core/script_tools/model_context.cc',[(562,565),(752,811)])],
 'S074':[('third_party/blink/renderer/platform/runtime_enabled_features.json5',[(7023,7050)])],
 'S077':[('third_party/blink/renderer/core/html/forms/form_mcp_schema.cc',[(49,111),(208,490),(930,1093),(1238,1438)])],
 'S078':[('third_party/blink/renderer/core/html/forms/html_form_element.cc',[(174,328),(635,842)])],
 'S079':[('third_party/blink/public/devtools_protocol/domains/WebMCP.pdl',[(25,30),(109,123)]),
         ('third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc',[(208,243)])],
 'S080':[('third_party/blink/renderer/core/script_tools/script_tool_types.h',[(16,49)]),
         ('third_party/blink/renderer/core/html/forms/form_mcp_schema.cc',[(208,300)]),
         ('third_party/blink/renderer/core/html/forms/html_form_element.cc',[(174,259)]),
         ('third_party/blink/public/mojom/frame/frame.mojom',[(1112,1119)]),
         ('third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc',[(987,1005)]),
         ('third_party/blink/renderer/core/script_tools/model_context.cc',[(528,580),(695,745)]),
         ('third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc',[(220,243)]),
         ('third_party/blink/public/devtools_protocol/domains/WebMCP.pdl',[(25,30),(109,123)])],
 'S081':[('third_party/blink/renderer/core/html/forms/html_select_element.cc',[(291,347),(871,887),(1047,1108),(1162,1184),(180,210)])],
 'S093':[('third_party/blink/renderer/core/html/forms/form_mcp_schema.cc',[(121,181),(491,539),(556,928),(1095,1236),(1238,1438)]),
         ('third_party/blink/renderer/core/html/forms/form_mcp_schema.h',[(41,50),(56,121),(148,158)])],
 'S096':[('third_party/blink/renderer/core/html/forms/html_form_element.cc',[(174,328),(729,758),(818,842)])],
 'S097':[('third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc',[(47,64),(208,243)])],
 'S098':[('third_party/blink/renderer/core/html/forms/form_mcp_schema.cc',[(491,928),(583,583)])],
 'S099':[('third_party/blink/public/devtools_protocol/domains/WebMCP.pdl',[(59,69),(109,123)])],
 'S100':[('third_party/blink/renderer/core/html/forms/html_form_element.cc',[(174,328),(635,842)])],
 'S105':[('third_party/blink/public/devtools_protocol/domains/Page.pdl',[(1345,1345),(1706,1706)])],
 'S106':[('content/public/common/content_features.cc',[(186,187)])],
}
summary={}
for rid,files in rows.items():
    print('='*8,rid)
    tot_holds=True
    for p,ranges in files:
        try:
            ob=open(fn('154.0.8037.97',p),'rb').read(); nb=open(fn('156.0.8078.47',p),'rb').read()
        except FileNotFoundError:
            print(f"  {p}: MISSING scratch bytes"); continue
        ol=ob.decode('utf8',errors='replace').split('\n'); nn=[norm(x) for x in nb.decode('utf8',errors='replace').split('\n')]
        changed = ob!=nb
        ex=None
        eu=sum(1 for i in range(len(nn)-len(ol)+1) if ol==nn[i:i+len(ol)]) if len(ol)<=len(nn) else 0
        print(f"  file={p} old_lines={len(ol)} new_lines={len(nn)} file_changed={changed} old_sha={hashlib.sha256(ob).hexdigest()[:12]} new_sha={hashlib.sha256(nb).hexdigest()[:12]}")
        for a,b in ranges:
            if b>len(ol): print(f"    range {a}-{b}: PAST EOF ({len(ol)})"); tot_holds=False; continue
            pat=[norm(x) for x in ol[a-1:b]]
            occ=block_occ(pat,nn)
            exact=''.join(x+'\n' for x in ol[a-1:b])
            exact_occ=nb.decode('utf8',errors='replace').count(exact)
            print(f"    range {a}-{b}: holds={occ>0} occ={occ} exact_occ={exact_occ} first_old_line={ol[a-1][:90]!r}")
            if occ==0: tot_holds=False
    summary[rid]=tot_holds
print('\nROW VERDICTS:',json.dumps(summary))
