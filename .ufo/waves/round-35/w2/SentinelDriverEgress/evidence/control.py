import socket, subprocess, sys, time, json
pid = subprocess.os.getpid()
t0 = time.time()
try:
    s = socket.create_connection(("ftp.mozilla.org", 443), timeout=10)
except Exception as e:
    print(json.dumps({"connected": False, "error": str(e)})); sys.exit(1)
peer = s.getpeername()
seen = []
for _ in range(12):
    out = subprocess.run(["ss", "-tnpH"], capture_output=True, text=True).stdout
    for line in out.splitlines():
        if f"pid={pid}," in line:
            seen.append(line.strip())
    time.sleep(0.2)
s.close()
print(json.dumps({"connected": True, "peer": peer, "samples_with_own_socket": len(seen), "first": seen[0] if seen else None}, indent=1))
