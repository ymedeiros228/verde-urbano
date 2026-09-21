const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function solidPng(size, r, g, b) {
  const rows = [];
  for (let y = 0; y < size; y++) {
    const line = Buffer.alloc(1 + size * 3);
    line[0] = 0;
    for (let x = 0; x < size; x++) {
      const cx = size / 2;
      const cy = size / 2;
      const d = Math.hypot(x - cx, y - cy);
      const i = 1 + x * 3;
      if (d < size * 0.42) {
        line[i] = r;
        line[i + 1] = g;
        line[i + 2] = b;
      } else if (d < size * 0.48) {
        line[i] = 0x2d;
        line[i + 1] = 0x8a;
        line[i + 2] = 0x58;
      } else {
        line[i] = 0xf3;
        line[i + 1] = 0xf6;
        line[i + 2] = 0xf1;
      }
      if (Math.hypot(x - size * 0.68, y - size * 0.28) < size * 0.06) {
        line[i] = 0xe8;
        line[i + 1] = 0xb8;
        line[i + 2] = 0x4a;
      }
    }
    rows.push(line);
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), solidPng(192, 0x1a, 0x5c, 0x3a));
fs.writeFileSync(path.join(dir, 'icon-512.png'), solidPng(512, 0x1a, 0x5c, 0x3a));
fs.writeFileSync(
  path.join(dir, 'apple-touch-icon.png'),
  solidPng(180, 0x1a, 0x5c, 0x3a)
);
console.log('ok', fs.readdirSync(dir));
