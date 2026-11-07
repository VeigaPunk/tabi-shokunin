| leg | seq | data | isComposing | isTrusted | targets | state after | cdpError |
|---|---|---|---|---|---|---|---|
| start | — | — | — | — | — | f="" sel=[0,0] ce="" active=BODY | — |
| focus-f | — | — | — | — | — | f="" sel=[0,0] ce="" active=f | — |
| compose-a | compositionstart, compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "", "か", "か", "か" | null, null, true, true | T, T, T, T | f | f="か" sel=[1,1] ce="" active=f | — |
| compose-b | compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "かな", "かな", "かな" | null, true, true | T, T, T | f | f="かな" sel=[2,2] ce="" active=f | — |
| commit | compositionupdate, beforeinput(insertCompositionText), textInput, input(insertCompositionText), compositionend | "仮名", "仮名", "仮名", "仮名", "仮名" | null, true, null, true, null | T, T, T, T, F | f | f="仮名" sel=[2,2] ce="" active=f | — |
| plain | beforeinput(insertText), textInput, input(insertText) | "ab", "ab", "ab" | false, null, false | T, T, T | f | f="仮名ab" sel=[4,4] ce="" active=f | — |
| select-f | — | — | — | — | — | f="仮名ab" sel=[2,4] ce="" active=f | — |
| compose-c | compositionstart, compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "ab", "x", "x", "x" | null, null, true, true | T, T, T, T | f | f="仮名x" sel=[3,3] ce="" active=f | — |
| replace-half | — | — | — | — | — | f="仮名x" sel=[3,3] ce="" active=f | {"code":-32602,"message":"Either both replacement start/end are specified or neither."} |
| cancel | compositionupdate, beforeinput(insertCompositionText), textInput, input(insertCompositionText), compositionend | "", "", "", null, "" | null, true, null, true, null | T, T, T, T, F | f | f="仮名" sel=[2,2] ce="" active=f | — |
| focus-ce | — | — | — | — | — | f="仮名" sel=[2,2] ce="" active=ce | — |
| ce-compose | compositionstart, compositionupdate, beforeinput(insertCompositionText), input(insertCompositionText) | "", "é", "é", "é" | null, null, true, true | T, T, T, T | ce | f="仮名" sel=[2,2] ce="é" active=ce | — |
| ce-commit | compositionupdate, beforeinput(insertCompositionText), textInput, input(insertCompositionText), compositionend | "é", "é", "é", "é", "é" | null, true, null, true, null | T, T, T, T, F | ce | f="仮名" sel=[2,2] ce="é" active=ce | — |
| blur | — | — | — | — | — | f="仮名" sel=[2,2] ce="é" active=BODY | — |
| nofocus-compose | — | — | — | — | — | f="仮名" sel=[2,2] ce="é" active=BODY | — |
| nofocus-insert | textInput, input(insertText) | "z", "z" | null, false | T, T | BODY,ce | f="仮名" sel=[2,2] ce="éz" active=ce | — |
