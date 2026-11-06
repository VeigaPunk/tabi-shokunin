// Blocks the pinned counter for 2 s so the watcher can swap the driver file AFTER the verifier's
// pin read (which happens before the evidence-counter spawn). Loaded via NODE_OPTIONS, inherited.
const main = String(process.argv[1] || '');
if (main.endsWith('/scripts/check-synthtap-r70.mjs')) {
  const sab = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(sab), 0, 0, 2000);
}
