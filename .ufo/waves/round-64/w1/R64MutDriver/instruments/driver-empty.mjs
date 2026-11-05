#!/usr/bin/env node
import fs from "node:fs";
const a=process.argv.slice(2);const i=a.indexOf("--out");fs.writeFileSync(a[i+1],JSON.stringify({legs:[],wheellog:[],pageState:{}}));
