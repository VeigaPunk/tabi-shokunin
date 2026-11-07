import fs from 'node:fs';
const S='/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/sources';
const rows=[
 {id:'S187',file:'Input.pdl',lines:'150',quote:'Use imeSetComposition with empty string as text to cancel composition.'},
 {id:'S188',file:'input_handler.cc',lines:'1345',quote:'Either both replacement start/end are specified or neither.'},
 {id:'S189',file:'input_method_controller.cc',lines:'1084',quote:'!DispatchCompositionStartEvent(GetFrame().SelectedText())) {'},
 {id:'S189',file:'input_method_controller.cc',lines:'409',quote:'EventDispatcher::DispatchScopedEvent(*target, *event);'},
 {id:'S190',file:'event_target.cc',lines:'868',quote:'event.SetTrusted(true);'},
 {id:'S191',file:'event_dispatcher.cc',lines:'92',quote:'ScopedEventQueue::Instance()->EnqueueEvent(event);'},
 {id:'S192',file:'scoped_event_queue.cc',lines:'78',quote:'EventDispatcher::DispatchEvent(*node, event);'},
 {id:'S193',file:'editing_utilities.cc',lines:'1772-1773',quote:'if (!target) return DispatchEventResult::kNotCanceled;'},
 {id:'S187 (rejected-hypothesis citation)',file:'Input.pdl',lines:'149',quote:'Use imeCommitComposition to commit the final text.'},
 {id:'S191 (caller-side trust)',file:'event_dispatcher.cc',lines:'175',quote:'event->SetTrusted(true);'},
];
const lines=(f)=>fs.readFileSync(`${S}/${f}`,'utf8').split('\n');
for(const r of rows){
  const L=lines(r.file);
  const [a,b]=r.lines.split('-').map(Number);
  const exact=r.lines.includes('-')? L.slice(a-1,b).join(' ') : L[a-1];
  const occSingle=!r.lines.includes('-') && L[a-1].includes(r.quote);
  const occRange=r.lines.includes('-') && L.slice(a-1,b).join('\n').includes(r.quote);
  const occJoined=L.slice(a-1,b).join(' ').includes(r.quote);
  const words=r.quote.trim().split(/\s+/).length;
  console.log(`${r.id} @${r.lines} single=${occSingle} range=${occRange} joined=${occJoined} words=${words} <=25=${words<=25} | "${exact.trim().slice(0,90)}"`);
}
