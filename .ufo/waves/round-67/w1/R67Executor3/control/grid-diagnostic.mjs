#!/usr/bin/env node
// Read-only diagnostic: counts white (255) cells in the 32x8 nonce grid of each
// live leg PNG and compares them with the popcount of the nonce bits. Reads the
// live receipt and PNGs; writes nothing.
// Usage: node grid-diagnostic.mjs <shotDir> <receipt.json> --counter <path/to/chromium-hscroll-r67.mjs>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const shotDir = path.resolve(argv[0]);
const receiptPath = path.resolve(argv[1]);
const counterPath = path.resolve(argv[argv.indexOf('--counter') + 1]);
const counter = await import(pathToFileURL(counterPath).href);
const { decode } = await import(pathToFileURL(path.join(path.dirname(counterPath), 'png-r67.mjs')).href);
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const bits = counter.nonceBits(receipt.nonce);
const expectedWhite = bits.reduce((n, b) => n + b, 0);
const rows = [];
for (const leg of receipt.legs) {
  const d = decode(fs.readFileSync(path.join(shotDir, leg.shot)));
  let white = 0, black = 0, other = 0, bitMismatch = 0;
  for (let row = 0; row < 8; row++) for (let col = 0; col < 32; col++) {
    const p = d.pixel(8 + col * 4 + 2, 8 + row * 4 + 2);
    const isWhite = p[0] === 255 && p[1] === 255 && p[2] === 255;
    const isBlack = p[0] === 0 && p[1] === 0 && p[2] === 0;
    if (isWhite) white++; else if (isBlack) black++; else other++;
    if ((bits[row * 32 + col] === 1) !== isWhite) bitMismatch++;
  }
  rows.push({ leg: leg.name, whiteCells: white, blackCells: black, otherCells: other, expectedWhiteCells: expectedWhite, cellsDisagreeingWithNonceBits: bitMismatch });
}
console.log(JSON.stringify({ nonce: receipt.nonce, nonceBitsSetToOne: expectedWhite, legs: rows }, null, 1));
