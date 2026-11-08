// Concrete receipt mutations that exercise the conjunct each surviving mutant weakened.
// Classification is done by witness.mjs: pristine=finding + mutant=clean => behavioral-escape;
// pristine=finding + mutant=finding => the behavior is still caught by a sibling check.
const L = (r, n) => r.legs.find((l) => l.name === n);
const OPEN = (r, n, i = 0) => L(r, n).cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened')[i];
const SEND = (r, n, m) => L(r, n).cdpSendLog.find((c) => c.method === m);
const EV = (r, n, p) => L(r, n).pageEvents.find(p);
const LAST = (r, n) => { const e = L(r, n).pageEvents; return e[e.length - 1]; };
const PREV = (r, n) => { const e = L(r, n).pageEvents; return e[e.length - 2]; };
const settle = (r, n) => L(r, n).marks.find((m) => m.name === 'settle').at;
const mainId = (r, n) => L(r, n).frameTree.mainFrameId;

export default [
  { name: 'fixture-root-keyset-unpinned', describe: 'r.fixture.extra=1', mutate: (r) => { r.fixture.extra = 1; } },
  { name: 'frame-tree-parent-unpinned', describe: 'r.frameTree.mainFrameParentId="X"', mutate: (r) => { r.frameTree.mainFrameParentId = 'X'; } },
  { name: 'plan-frozen-priorclick-unpinned', describe: 'leg accept priorClick.at=[999,999]', mutate: (r) => { L(r, 'sp83-accept-answer').priorClick.at = [999, 999]; } },
  { name: 'plan-frozen-intercept-unpinned', describe: 'leg accept intercept.enabled=false', mutate: (r) => { L(r, 'sp83-accept-answer').intercept.enabled = false; } },
  { name: 'leg-records-name-index-unbound', describe: 'leg accept name="sp83-accept-answer-x"', mutate: (r) => { L(r, 'sp83-accept-answer').name = 'sp83-accept-answer-x'; } },
  { name: 'leg-records-kind-index-unbound', describe: 'leg accept kind="bogus"', mutate: (r) => { L(r, 'sp83-accept-answer').kind = 'bogus'; } },
  { name: 'leg-records-wait-lower-unpinned', describe: 'leg accept chooserWaitMs=-1', mutate: (r) => { L(r, 'sp83-accept-answer').chooserWaitMs = -1; } },
  { name: 'leg-records-armerr-unchecked', describe: 'leg accept armError={note:1}', mutate: (r) => { L(r, 'sp83-accept-answer').armError = { note: 1 }; } },
  { name: 'leg-records-clickerr-unchecked', describe: 'leg accept clickError={note:1}', mutate: (r) => { L(r, 'sp83-accept-answer').clickError = { note: 1 }; } },
  { name: 'leg-records-triggererr-unchecked', describe: 'leg accept triggerError={note:1}', mutate: (r) => { L(r, 'sp83-accept-answer').triggerError = { note: 1 }; } },
  { name: 'errOk-code-type-unpinned', describe: 'leg accept interceptError={code:"x",message:"m"}', mutate: (r) => { L(r, 'sp83-accept-answer').interceptError = { code: 'x', message: 'm' }; } },
  { name: 'leg-marks-first-label-unpinned', describe: 'leg accept marks[0].name="begin"', mutate: (r) => { L(r, 'sp83-accept-answer').marks[0].name = 'begin'; } },
  { name: 'ctx-count-exactness-relaxed', describe: 'append a second default child context to a cross leg', mutate: (r) => {
    const l = L(r, 'sp83-cross-origin-nonfile');
    const child = l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child && c.isDefault === true);
    l.contexts.push({ ...child, id: 'CTX-DUP', frameId: 'F'.repeat(32) });
  } },
  { name: 'ctx-origin-unbound', describe: 'change the child context origin to the http origin', mutate: (r) => {
    const l = L(r, 'sp83-cross-origin-nonfile');
    const child = l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child && c.isDefault === true);
    child.origin = 'http://127.0.0.1:' + r.ports.http;
  } },
  { name: 'ctx-frameid-type-unchecked', describe: 'change the child context frameId to a number', mutate: (r) => {
    const l = L(r, 'sp83-cross-origin-nonfile');
    l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child && c.isDefault === true).frameId = 12345;
  } },
  { name: 'sendlog-params-object-unchecked', describe: 'Browser.getVersion params=null', mutate: (r) => { SEND(r, 'sp83-accept-answer', 'Browser.getVersion').params = null; } },
  { name: 'sendlog-min-length-relaxed', describe: 'cross leg send log truncated to prologue + intercept + child click (9 entries)', mutate: (r) => {
    const l = L(r, 'sp83-cross-origin-nonfile');
    const sends = l.cdpSendLog;
    const pro = sends.slice(0, 6);
    const intercept = sends.find((c) => c.method === 'Page.setInterceptFileChooserDialog');
    const clicks = sends.filter((c) => c.method === 'Input.dispatchMouseEvent').slice(0, 2);
    l.cdpSendLog = [...pro, intercept, ...clicks].map((c, i) => ({ ...c, id: i + 1 }));
    l.interceptSendId = 7;
    l.priorPressId = 8;
    l.priorReleaseId = 9;
  } },
  { name: 'sendlog-navigate-once-unpinned', describe: 'append a duplicate Page.navigate send', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer');
    const nav = l.cdpSendLog.find((c) => c.method === 'Page.navigate');
    l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Page.navigate', params: JSON.parse(JSON.stringify(nav.params)) });
  } },
  { name: 'sendlog-browser-once-unpinned', describe: 'append a duplicate Browser.getVersion send', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer');
    const b = l.cdpSendLog.find((c) => c.method === 'Browser.getVersion');
    l.cdpSendLog.push({ id: l.cdpSendLog.length + 1, method: 'Browser.getVersion', params: JSON.parse(JSON.stringify(b.params)) });
  } },
  { name: 'plan-calls-intercept-sendid-unbound', describe: 'accept interceptSendId += 1000', mutate: (r) => { L(r, 'sp83-accept-answer').interceptSendId += 1000; } },
  { name: 'plan-calls-prior-sendids-unbound', describe: 'accept priorReleaseId = priorPressId', mutate: (r) => { const l = L(r, 'sp83-accept-answer'); l.priorReleaseId = l.priorPressId; } },
  { name: 'plan-calls-trigger-sendid-unbound', describe: 'sod triggerSendId += 1000', mutate: (r) => { L(r, 'sp83-same-origin-nonfile-disabled').triggerSendId += 1000; } },
  { name: 'plan-calls-trigger2-unexpected-unchecked', describe: 'accept trigger2SendId=1', mutate: (r) => { L(r, 'sp83-accept-answer').trigger2SendId = 1; } },
  { name: 'plan-calls-click-sendids-unbound', describe: 'click leg clickReleaseId += 1000', mutate: (r) => { L(r, 'sp83-click-while-open').clickReleaseId += 1000; } },
  { name: 'plan-calls-dismiss-sendid-unbound', describe: 'accept dismissSendId += 1000', mutate: (r) => { L(r, 'sp83-accept-answer').dismissSendId += 1000; } },
  { name: 'plan-calls-answer-sendid-unbound', describe: 'accept answer.setSendId += 1000', mutate: (r) => { L(r, 'sp83-accept-answer').answer.setSendId += 1000; } },
  { name: 'plan-calls-answer-files-relaxed', describe: 'answer.setParams.files[0] and the send-log setFileInputFiles path become /tmp/other.txt', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer');
    l.answer.setParams.files[0] = '/tmp/other.txt';
    SEND(r, 'sp83-accept-answer', 'DOM.setFileInputFiles').params.files[0] = '/tmp/other.txt';
  } },
  { name: 'cdp-multiopen-threshold-relaxed', describe: 'append a third chooser event to the click leg', mutate: (r) => {
    const l = L(r, 'sp83-click-while-open');
    l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { backendNodeId: 77, frameId: mainId(r, 'sp83-click-while-open'), mode: 'selectSingle' }, afterSendId: l.clickReleaseId });
  } },
  { name: 'cdp-method-whitelist-unpinned', describe: 'append a Page.evil CDP event', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer');
    l.cdpEventLog.push({ method: 'Page.evil', params: {}, afterSendId: l.triggerSendId });
  } },
  { name: 'cdp-nav-frameid-unbound', describe: 'frameNavigated frameId="A"*32', mutate: (r) => { L(r, 'sp83-accept-answer').cdpEventLog.find((e) => e.method === 'Page.frameNavigated').params.frameId = 'A'.repeat(32); } },
  { name: 'cdp-open-frame-unbound', describe: 'accept chooser event frameId="A"*32', mutate: (r) => { OPEN(r, 'sp83-accept-answer').params.frameId = 'A'.repeat(32); } },
  { name: 'cdp-cross-open-sendbinding-unbound', describe: 'append a cross chooser event with afterSendId=1', mutate: (r) => {
    const l = L(r, 'sp83-cross-origin-nonfile');
    const child = l.contexts.find((c) => c.origin === 'http://127.0.0.1:' + r.ports.child && c.isDefault === true);
    l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { backendNodeId: 9, frameId: child.frameId, mode: 'selectSingle' }, afterSendId: 1 });
  } },
  { name: 'cdp-click-open-sendbinding-unbound', describe: 'second-chooser leg opens[1].afterSendId += 99', mutate: (r) => {
    const l = L(r, 'sp83-second-chooser-answer');
    const opens = l.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened');
    opens[1].afterSendId = l.clickReleaseId + 99;
  } },
  { name: 'frame-binding-frameid-regex-unpinned', describe: 'relabel the accept leg main frame id consistently', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer');
    const old = l.frameTree.mainFrameId, neu = 'not-a-frame-id';
    l.frameTree.mainFrameId = neu;
    for (const c of l.contexts) if (c.frameId === old) c.frameId = neu;
    l.cdpEventLog.find((e) => e.method === 'Page.frameNavigated').params.frameId = neu;
    const op = l.cdpEventLog.find((e) => e.method === 'Page.fileChooserOpened');
    if (op) op.params.frameId = neu;
  } },
  { name: 'event-types-typefield-unchecked', describe: 'accept pageEvents[0].type=5', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].type = 5; } },
  { name: 'event-types-istrusted-type-unchecked', describe: 'accept pageEvents[0].isTrusted="yes"', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].isTrusted = 'yes'; } },
  { name: 'event-types-act-type-unchecked', describe: 'accept pageEvents[0].act="x"', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].act = 'x'; } },
  { name: 'event-types-target-type-unchecked', describe: 'accept pageEvents[0].target=5', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].target = 5; } },
  { name: 'event-types-x-y-buttons-types-unchecked', describe: 'accept pageEvents[0].x="5"', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].x = '5'; } },
  { name: 'event-types-files-type-unchecked', describe: 'accept input event files="x"', mutate: (r) => { EV(r, 'sp83-accept-answer', (e) => e.type === 'input').files = 'x'; } },
  { name: 'event-types-seq-integer-unchecked', describe: 'accept pageEvents[0].seq=1.5', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].seq = 1.5; } },
  { name: 'event-types-leg-type-unchecked', describe: 'accept pageEvents[0].leg=5', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].leg = 5; } },
  { name: 'event-quantum-at-unchecked', describe: 'accept last event at = prev + 0.037 (off-grid)', mutate: (r) => {
    const e = LAST(r, 'sp83-accept-answer'), p = PREV(r, 'sp83-accept-answer'), s = settle(r, 'sp83-accept-answer');
    e.at = p.at + 0.037 < s ? +(p.at + 0.037).toFixed(3) : +(p.at + 0.013).toFixed(3);
  } },
  { name: 'event-window-upper-unbound', describe: 'accept last event at = settle + 100', mutate: (r) => { LAST(r, 'sp83-accept-answer').at = settle(r, 'sp83-accept-answer') + 100; } },
  { name: 'leg-shape-trusted-unchecked', describe: 'accept pageEvents[0].isTrusted=false', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].isTrusted = false; } },
  { name: 'leg-shape-act-unchecked', describe: 'accept pageEvents[0].act=null', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].act = null; } },
  { name: 'leg-shape-opened-unchecked', describe: 'click leg opens[1].mode=selectMultiple', mutate: (r) => { const l = L(r, 'sp83-click-while-open'); l.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened')[1].params.mode = 'selectMultiple'; } },
  { name: 'gesture-law-error-text-unpinned', describe: 'sod showPicker.message="wrong"', mutate: (r) => { L(r, 'sp83-same-origin-nonfile-disabled').showPicker.message = 'wrong'; } },
  { name: 'activation-hasbeenactive-unpinned', describe: 'accept activationBefore={true,false}', mutate: (r) => { L(r, 'sp83-accept-answer').activationBefore = { isActive: true, hasBeenActive: false }; } },
  { name: 'mode-law-second-open-unchecked', describe: 'click leg opens[1].mode=selectMultiple', mutate: (r) => { const l = L(r, 'sp83-click-while-open'); l.cdpEventLog.filter((e) => e.method === 'Page.fileChooserOpened')[1].params.mode = 'selectMultiple'; } },
  { name: 'cross-child-istrusted-unchecked', describe: 'co.childEvents[0].isTrusted=false', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile').childEvents[0].isTrusted = false; } },
  { name: 'cross-childresult-message-unpinned', describe: 'co.childResult.message="wrong"', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile').childResult.message = 'wrong'; } },
  { name: 'order-cod-childresult-exactness-dropped', describe: 'cod.childResult.message="wrong"', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile-disabled').childResult.message = 'wrong'; } },
  { name: 'order-cod-childact-before-unbound', describe: 'cod.childActivationBefore={true,true}', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile-disabled').childActivationBefore = { isActive: true, hasBeenActive: true }; } },
  { name: 'order-cod-child-istrusted-unchecked', describe: 'cod.childEvents[0].isTrusted=false', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile-disabled').childEvents[0].isTrusted = false; } },
  { name: 'order-sod-open-count-unbound', describe: 'append a chooser event to the same-origin disabled leg', mutate: (r) => {
    const l = L(r, 'sp83-same-origin-nonfile-disabled');
    l.cdpEventLog.push({ method: 'Page.fileChooserOpened', params: { backendNodeId: 7, frameId: l.frameTree.mainFrameId, mode: 'selectSingle' }, afterSendId: l.triggerSendId });
  } },
  { name: 'extras-parentcross-unbound', describe: 'month parentCrossAccess.contentDocument="object"', mutate: (r) => { L(r, 'sp83-cross-origin-month').parentCrossAccess = { contentDocument: 'object', windowDocument: 'SecurityError' }; } },
  { name: 'extras-childact-before-unbound', describe: 'month childActivationBefore={true,true}', mutate: (r) => { L(r, 'sp83-cross-origin-month').childActivationBefore = { isActive: true, hasBeenActive: true }; } },
  { name: 'extras-childlate-unbound', describe: 'month childLate=1', mutate: (r) => { L(r, 'sp83-cross-origin-month').childLate = 1; } },
  { name: 'extras-istrusted-unchecked', describe: 'month childEvents[0].isTrusted=false', mutate: (r) => { L(r, 'sp83-cross-origin-month').childEvents[0].isTrusted = false; } },
  { name: 'webkit-setparams-keyset-unpinned', describe: 'wa.answer.setParams.extra=1', mutate: (r) => { L(r, 'sp83-webkitdirectory-answer').answer.setParams.extra = 1; } },
  { name: 'webkit-answer-basename-unbound', describe: 'wa setFileInputFiles path -> /tmp/other (both answer and send log)', mutate: (r) => {
    const l = L(r, 'sp83-webkitdirectory-answer');
    l.answer.setParams.files[0] = '/tmp/other';
    SEND(r, 'sp83-webkitdirectory-answer', 'DOM.setFileInputFiles').params.files[0] = '/tmp/other';
  } },
  { name: 'webkit-read-bytes-unpinned', describe: 'wa read events ret=hex:00', mutate: (r) => { for (const e of L(r, 'sp83-webkitdirectory-answer').pageEvents) if (e.type === 'read') e.ret = 'hex:00'; } },
  { name: 'webkit-state-unbound', describe: 'wa stateAfter.d=[]', mutate: (r) => { L(r, 'sp83-webkitdirectory-answer').stateAfter.d = []; } },
  { name: 'webkit-seterr-unchecked', describe: 'wa.answer.setResult={ok:1}; setError={code:1,message:"x"}', mutate: (r) => { const a = L(r, 'sp83-webkitdirectory-answer').answer; a.setResult = { ok: 1 }; a.setError = { code: 1, message: 'x' }; } },
  { name: 'accept-answer-files-unpinned', describe: 'aa.answer.files=["other.txt"]', mutate: (r) => { L(r, 'sp83-accept-answer').answer.files = ['other.txt']; } },
  { name: 'accept-backendid-unbound', describe: 'aa.answer.setParams.backendNodeId=999', mutate: (r) => { L(r, 'sp83-accept-answer').answer.setParams.backendNodeId = 999; } },
  { name: 'accept-upload-sha-unpinned', describe: 'aa.upload.sha256="0"*64', mutate: (r) => { L(r, 'sp83-accept-answer').upload.sha256 = '0'.repeat(64); } },
  { name: 'accept-seterr-unchecked', describe: 'aa.answer.setResult={ok:1}; setError={code:1,message:"x"}', mutate: (r) => { const a = L(r, 'sp83-accept-answer').answer; a.setResult = { ok: 1 }; a.setError = { code: 1, message: 'x' }; } },
  { name: 'accept-read-count-unbound', describe: 'append a duplicate read event to accept', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer'); const src = l.pageEvents.find((e) => e.type === 'read');
    l.pageEvents.push({ ...JSON.parse(JSON.stringify(src)), seq: l.pageEvents.length + 1, at: src.at + 0.1, ts: src.ts + 0.1 });
  } },
  { name: 'multiple-answer-files-unpinned', describe: 'mm.answer.files=["other.txt"]', mutate: (r) => { L(r, 'sp83-multiple-mode').answer.files = ['other.txt']; } },
  { name: 'multiple-setparams-length-unbound', describe: 'mm setParams.files + send log become 2 files', mutate: (r) => {
    const l = L(r, 'sp83-multiple-mode'); const f = l.answer.setParams.files[0];
    l.answer.setParams.files = [f, f];
    SEND(r, 'sp83-multiple-mode', 'DOM.setFileInputFiles').params.files = [f, f];
  } },
  { name: 'multiple-basename-unbound', describe: 'mm setFileInputFiles path -> /tmp/other (both)', mutate: (r) => {
    const l = L(r, 'sp83-multiple-mode'); l.answer.setParams.files[0] = '/tmp/other';
    SEND(r, 'sp83-multiple-mode', 'DOM.setFileInputFiles').params.files[0] = '/tmp/other';
  } },
  { name: 'multiple-seterr-unchecked', describe: 'mm.answer.setResult={ok:1}; setError={code:1,message:"x"}', mutate: (r) => { const a = L(r, 'sp83-multiple-mode').answer; a.setResult = { ok: 1 }; a.setError = { code: 1, message: 'x' }; } },
  { name: 'multiple-upload-sha-unpinned', describe: 'mm.upload.sha256="0"*64', mutate: (r) => { L(r, 'sp83-multiple-mode').upload.sha256 = '0'.repeat(64); } },
  { name: 'multiple-read-count-unbound', describe: 'append a duplicate read event to multiple-mode', mutate: (r) => {
    const l = L(r, 'sp83-multiple-mode'); const src = l.pageEvents.find((e) => e.type === 'read');
    l.pageEvents.push({ ...JSON.parse(JSON.stringify(src)), seq: l.pageEvents.length + 1, at: src.at + 0.1, ts: src.ts + 0.1 });
  } },
  { name: 'accept-mime-answer-files-unpinned', describe: 'am.answer.files=["other.png"]', mutate: (r) => { L(r, 'sp83-accept-mime-answer').answer.files = ['other.png']; } },
  { name: 'accept-mime-backendid-unbound', describe: 'am.answer.setParams.backendNodeId=999', mutate: (r) => { L(r, 'sp83-accept-mime-answer').answer.setParams.backendNodeId = 999; } },
  { name: 'accept-mime-upload-hex-unpinned', describe: 'am.uploadPng.hex="00"', mutate: (r) => { L(r, 'sp83-accept-mime-answer').uploadPng.hex = '00'; } },
  { name: 'accept-mime-read-count-unbound', describe: 'append a duplicate read event to accept-mime', mutate: (r) => {
    const l = L(r, 'sp83-accept-mime-answer'); const src = l.pageEvents.find((e) => e.type === 'read');
    l.pageEvents.push({ ...JSON.parse(JSON.stringify(src)), seq: l.pageEvents.length + 1, at: src.at + 0.1, ts: src.ts + 0.1 });
  } },
  { name: 'second-chooser-first-open-id-unbound', describe: 'sc.firstChooserBackendNodeId=999', mutate: (r) => { L(r, 'sp83-second-chooser-answer').firstChooserBackendNodeId = 999; } },
  { name: 'second-chooser-answer-files-unpinned', describe: 'sc.answer.files=["other.txt"]', mutate: (r) => { L(r, 'sp83-second-chooser-answer').answer.files = ['other.txt']; } },
  { name: 'second-chooser-read-count-unbound', describe: 'append a duplicate read event to second-chooser', mutate: (r) => {
    const l = L(r, 'sp83-second-chooser-answer'); const src = l.pageEvents.find((e) => e.type === 'read');
    l.pageEvents.push({ ...JSON.parse(JSON.stringify(src)), seq: l.pageEvents.length + 1, at: src.at + 0.1, ts: src.ts + 0.1 });
  } },
  { name: 'second-chooser-seterr-unchecked', describe: 'sc.answer.setResult={ok:1}; setError={code:1,message:"x"}', mutate: (r) => { const a = L(r, 'sp83-second-chooser-answer').answer; a.setResult = { ok: 1 }; a.setError = { code: 1, message: 'x' }; } },
  { name: 'second-chooser-upload-hex-unpinned', describe: 'sc.uploadSecond.hex="00"', mutate: (r) => { L(r, 'sp83-second-chooser-answer').uploadSecond.hex = '00'; } },
  { name: 'noselection-state-keyset-unpinned', describe: 'cross leg stateAfter.extra=1', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile').stateAfter.extra = 1; } },
  { name: 'noselection-svalue-unpinned', describe: 'cross leg stateAfter.sValue="x"', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile').stateAfter.sValue = 'x'; } },
  { name: 'noselection-nonanswer-dismiss-state-unchecked', describe: 'cross leg stateAfterDismiss with a non-empty array', mutate: (r) => { L(r, 'sp83-cross-origin-nonfile').stateAfterDismiss = { s: [['x', 1, 'text/plain', '']], m: [], d: [], k: [], dis: [], disd: [], sValue: '' }; } },
  { name: 'noselection-nonanswer-file-events-unchecked', describe: 'cross leg gets an input page event', mutate: (r) => {
    const l = L(r, 'sp83-cross-origin-nonfile'); const pre = l.marks.find((m) => m.name === 'pre').at;
    l.pageEvents.push({ type: 'input', ts: pre + 0.1, isTrusted: true, act: false, target: 's', x: null, y: null, buttons: null, files: [['x', 1, 'text/plain', '']], ret: null, seq: l.pageEvents.length + 1, leg: 'show-picker', at: pre + 0.1 });
  } },
  { name: 'dismiss-nocancel-unchecked', describe: 'append a cancel page event to accept', mutate: (r) => {
    const l = L(r, 'sp83-accept-answer');
    l.pageEvents.push({ type: 'cancel', ts: 20, isTrusted: true, act: false, target: 'k', x: null, y: null, buttons: null, files: [['cancel', 'k', []]], ret: null, seq: l.pageEvents.length + 1, leg: 'settle', at: 20 });
  } },
  { name: 'trust-showpicker2-unchecked', describe: 'accept pageEvents[0].leg="show-picker-2"', mutate: (r) => { L(r, 'sp83-accept-answer').pageEvents[0].leg = 'show-picker-2'; } },
  { name: 'argv-tail-unpinned', describe: 'accept argv[10]="--evil-flag"', mutate: (r) => { L(r, 'sp83-accept-answer').argv[10] = '--evil-flag'; } },
  { name: 'argv-token-charset-unpinned', describe: 'accept launchToken="zzzzzzzzzzzz"', mutate: (r) => { L(r, 'sp83-accept-answer').launchToken = 'zzzzzzzzzzzz'; } },
  { name: 'devtools-port-binding-relaxed', describe: 'accept devtoolsListening.port=20000', mutate: (r) => { L(r, 'sp83-accept-answer').devtoolsListening.port = 20000; } },
  { name: 'teardown-probes-not-open', describe: 'accept portProbes.fixture="timeout"', mutate: (r) => { L(r, 'sp83-accept-answer').teardown.portProbes.fixture = 'timeout'; } },
  { name: 'teardown-curl-not-zero', describe: 'accept postKillCurl.fixture=28', mutate: (r) => { L(r, 'sp83-accept-answer').teardown.postKillCurl.fixture = 28; } },
  { name: 'fixture-accept-unpinned', describe: 'fixtureInputs[k].accept=".gif"', mutate: (r) => { r.fixtureInputs.find((d) => d.id === 'k').accept = '.gif'; } },
  { name: 'server-root-status-unpinned', describe: 'accept serverLog "/" status=500', mutate: (r) => { L(r, 'sp83-accept-answer').serverLog.find((s) => s.path === '/').status = 500; } },
  { name: 'server-nonroot-status-relaxed', describe: 'accept serverLog "/favicon.ico" status=500', mutate: (r) => { L(r, 'sp83-accept-answer').serverLog.find((s) => s.path === '/favicon.ico').status = 500; } },
  { name: 'child-server-root-status-unpinned', describe: 'accept childServerLog "/child.html" status=500', mutate: (r) => { L(r, 'sp83-accept-answer').childServerLog.find((s) => s.path === '/child.html').status = 500; } },
  { name: 'child-server-nonchild-status-relaxed', describe: 'accept childServerLog gains {path:"/other",status:500}', mutate: (r) => { L(r, 'sp83-accept-answer').childServerLog.push({ path: '/other', status: 500, run: r.nonce }); } },
  { name: 'runwindow-lower-relaxed', describe: 'finishedAt = startedAt + 11000 ms', mutate: (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 11000).toISOString(); } },
  { name: 'runwindow-upper-relaxed', describe: 'finishedAt = startedAt + 650000 ms', mutate: (r) => { r.finishedAt = new Date(Date.parse(r.startedAt) + 650000).toISOString(); } },
  { name: 'replay-token-charset-unpinned', describe: 'accept launchToken="zzzzzzzzzzzz"', mutate: (r) => { L(r, 'sp83-accept-answer').launchToken = 'zzzzzzzzzzzz'; } },
  { name: 'ports-distinctness-unchecked', describe: 'ports.cdp=ports.http with every leg argv/devtools relabelled', mutate: (r) => {
    r.ports.cdp = r.ports.http;
    for (const l of r.legs) {
      l.argv[2] = '--remote-debugging-port=' + r.ports.cdp;
      l.devtoolsListening.port = r.ports.cdp;
      l.devtoolsListening.url = 'ws://127.0.0.1:' + r.ports.cdp + '/devtools/browser/' + l.devtoolsListening.browserId;
      l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
    }
  } },
  { name: 'ports-lower-bound-partial', describe: 'ports.cdp=80 with every leg argv/devtools relabelled', mutate: (r) => {
    r.ports.cdp = 80;
    for (const l of r.legs) {
      l.argv[2] = '--remote-debugging-port=80';
      l.devtoolsListening.port = 80;
      l.devtoolsListening.url = 'ws://127.0.0.1:80/devtools/browser/' + l.devtoolsListening.browserId;
      l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
    }
  } },
  { name: 'ports-cdp-integer-unchecked', describe: 'ports.cdp and every leg devtools port become strings', mutate: (r) => {
    r.ports.cdp = String(r.ports.cdp);
    for (const l of r.legs) {
      l.argv[2] = '--remote-debugging-port=' + r.ports.cdp;
      l.devtoolsListening.port = r.ports.cdp;
      l.devtoolsListening.url = 'ws://127.0.0.1:' + r.ports.cdp + '/devtools/browser/' + l.devtoolsListening.browserId;
      l.stderrHead = 'DevTools listening on ' + l.devtoolsListening.url;
    }
  } },
];
