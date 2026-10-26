// RevLesson w2: invoke a check-bidi-runtime.mjs liveRecord build directly.
const mod = await import(process.argv[2]);
try {
  const rec = await mod.liveRecord({});
  console.log("ok cmds=" + rec.cmds.length + " events=" + rec.events.length);
} catch (e) {
  console.log("ERR " + String((e && e.message) || e).slice(0, 240));
}
