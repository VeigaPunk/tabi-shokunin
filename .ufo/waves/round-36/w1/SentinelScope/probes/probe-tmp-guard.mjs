#!/usr/bin/env node
// probe-tmp-guard.mjs — the containment guard in baseline/controls.mjs:23 is a string prefix
// check; a `..` path passes it and resolves outside /fast/scratch/hyaku/tabi-r36/.
import { resolve } from 'node:path';
const TMP = '/fast/scratch/hyaku/tabi-r36/../../../../home/vgpnk/evil';
console.log('startsWith(/fast/scratch/hyaku/tabi-r36/):', TMP.startsWith('/fast/scratch/hyaku/tabi-r36/'));
console.log('resolve(TMP):', resolve(TMP));
