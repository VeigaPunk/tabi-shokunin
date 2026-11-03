#!/bin/bash
set -u
f(){ # $1 name, $2 url
  curl -sL --max-time 90 --max-filesize 25000000 -A 'r57-quarantine-handcheck/1.0' \
    -o "$1.bin" -w "$1 %{http_code} %{size_download} %{content_type} %{url_effective}\n" "$2"
}
f S102 'https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md' &
f S106 'https://www.rfc-editor.org/rfc/rfc9309.txt' &
f S109 'https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md' &
f S109blob 'https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md' &
f S110 'https://www.rfc-editor.org/rfc/rfc6585.txt' &
f S111 'https://developer.chrome.com/docs/ai/webmcp/secure-tools' &
f S114 'https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf' &
f S117 'https://webmachinelearning.github.io/webmcp/' &
f S118 'https://arxiv.org/abs/2305.11506' &
f S124 'https://www.rfc-editor.org/rfc/rfc9110.txt' &
f S125 'https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt' &
wait
