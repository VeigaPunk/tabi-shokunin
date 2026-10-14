#!/usr/bin/env python3
"""Deterministic fixture -> data: URL builder (exact navigation input)."""
import sys, urllib.parse
path = sys.argv[1]
html = open(path, 'rb').read().decode('utf-8')
print('data:text/html;charset=utf-8,' + urllib.parse.quote(html, safe=''))