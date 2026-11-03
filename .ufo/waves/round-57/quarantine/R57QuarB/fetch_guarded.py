"""Guarded fetch: -q first, absolute -o, effective-URL re-guard, encoding + truncation checks."""
import json,os,subprocess,socket,ipaddress,urllib.parse,sys,re

def guard_host(u):
    p=urllib.parse.urlparse(u)
    if p.scheme not in ('http','https'): return dict(ok=False,reason='scheme-not-http')
    host=p.hostname
    try: ips=sorted({x[4][0] for x in socket.getaddrinfo(host,None)})
    except Exception as e: return dict(ok=False,reason='resolve-failed:'+str(e),ips=[])
    bad=[]
    for ip in ips:
        try:
            a=ipaddress.ip_address(ip)
            if a.is_private or a.is_loopback or a.is_link_local or a.is_reserved or a.is_multicast: bad.append(ip)
        except Exception: pass
    return dict(ok=not bad, reason=('private-address' if bad else 'public'), ips=ips, host=host, blocked=bad)

def fetch(url,outdir,name,cap=25000000):
    os.makedirs(outdir,exist_ok=True)
    outp=os.path.abspath(os.path.join(outdir,name))
    sep='\x1f'
    fmt=sep.join(['%{http_code}','%{size_download}','%{content_type}','%{content_encoding}',
                  '%{num_redirects}','%{url_effective}'])
    cmd=['curl','-q','-sS','-L','--max-time','90','--max-filesize',str(cap),'-o',outp,
         '-D',outp+'.hdr','-w',fmt,url]
    r=subprocess.run(cmd,capture_output=True,text=True)
    parts=r.stdout.strip().split(sep)
    code,size,ctype,cenc,redirs,eff=(parts+['']*6)[:6]
    rec=dict(url=url,name=name,path=outp,cmd=' '.join(cmd),curlExit=r.returncode,stderr=r.stderr.strip()[:200],
             httpCode=code,sizeDownload=size,contentType=ctype,contentEncoding=cenc,
             numRedirects=redirs,urlEffective=eff,
             guardCited=guard_host(url),guardEffective=guard_host(eff) if eff else None)
    try:
        hdr=open(outp+'.hdr',errors='replace').read()
        ce=re.search(r'(?im)^content-encoding:\s*(.+)$',hdr)
        rec['liveHeaderContentEncoding']=ce.group(1).strip() if ce else None
        rec['liveHeaderContentType']=(re.search(r'(?im)^content-type:\s*(.+)$',hdr) or [None,None])[1]
        rec['contentLength']=(re.search(r'(?im)^content-length:\s*(.+)$',hdr) or [None,None])[1]
    except Exception as e:
        rec['headerError']=str(e)
    # truncation / guard verdict
    flags=[]
    if rec['curlExit']!=0: flags.append('curl-exit-%d'%rec['curlExit'])
    if not rec['httpCode'].startswith('2'): flags.append('non-2xx')
    if rec['sizeDownload'].isdigit() and int(rec['sizeDownload'])>=cap: flags.append('size-at-cap')
    if (rec['contentEncoding'] or 'identity') not in ('identity',''): flags.append('encoded-body')
    if rec['liveHeaderContentEncoding'] and rec['liveHeaderContentEncoding'].lower() not in ('identity',): flags.append('encoded-body-header')
    if rec['guardEffective'] and not rec['guardEffective']['ok']: flags.append('effective-host-refused')
    if not rec['guardCited']['ok']: flags.append('cited-host-refused')
    rec['flags']=flags
    rec['usableForTextVerdict']= not flags
    return rec

if __name__=='__main__':
    spec=json.load(open(sys.argv[1]))
    out={}
    for name,u in spec.items():
        r=fetch(u,sys.argv[2],name+'.bin')
        out[name]=r
        print(f"{name} code={r['httpCode']} size={r['sizeDownload']} cenc={r['contentEncoding']!r} hdrCE={r['liveHeaderContentEncoding']!r} redirs={r['numRedirects']} eff={r['urlEffective']} flags={r['flags']}")
    json.dump(out,open(os.path.join(sys.argv[2],'_fetch.json'),'w'),indent=1)
