// Synthesises the Reel's sound effects: node gen-sfx.mjs  ->  public/sfx/heartbeat.wav, public/sfx/muffled.wav
import fs from 'node:fs';

const RATE = 48000;

function wav(file, samples) {
  const data = Buffer.alloc(samples.length * 2);
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  samples.forEach((v, i) => data.writeInt16LE(Math.round((v / peak) * 0.9 * 32767), i * 2));
  const head = Buffer.alloc(44);
  head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8);
  head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22);
  head.writeUInt32LE(RATE, 24); head.writeUInt32LE(RATE * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34);
  head.write('data', 36); head.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([head, data]));
}

// A heartbeat that quickens from 72 to 96 bpm: a low "lub" and a softer "dub" per beat.
function heartbeat(seconds) {
  const out = new Float64Array(seconds * RATE);
  const thump = (at, amp) => {
    const start = Math.round(at * RATE);
    for (let i = 0; i < 0.18 * RATE && start + i < out.length; i++) {
      const t = i / RATE;
      const f = 62 - 22 * (t / 0.18);
      out[start + i] += amp * Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.045) * Math.min(1, t / 0.004);
    }
  };
  let t = 0.1;
  while (t < seconds - 0.4) {
    const bpm = 72 + 24 * (t / seconds);
    thump(t, 1);
    thump(t + 0.27, 0.62);
    t += 60 / bpm;
  }
  return Array.from(out);
}

// Muffled, indistinct audio from a phone: band-limited noise shaped into speech-like rhythm, no words.
function muffled(seconds) {
  const n = seconds * RATE;
  const out = new Array(n);
  let lp1 = 0, lp2 = 0, lp3 = 0, hp = 0, prev = 0;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    // Through a pocket-sized speaker in another room: low-pass around 500 Hz, rumble removed.
    lp1 += 0.06 * (rand() - lp1); lp2 += 0.06 * (lp1 - lp2); lp3 += 0.06 * (lp2 - lp3);
    hp = 0.995 * (hp + lp3 - prev); prev = lp3;
    const syllables = 0.35 + 0.65 * Math.abs(Math.sin(2 * Math.PI * (3.1 + 0.9 * Math.sin(t * 0.7)) * t));
    const phrases = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.45 * t + 1);
    const tone = 0.25 * Math.sin(2 * Math.PI * (150 + 25 * Math.sin(t * 2.3)) * t) * syllables;
    out[i] = (hp * 9 + tone * 0.25) * syllables * phrases * Math.min(1, t / 0.3, (seconds - t) / 0.3);
  }
  return out;
}

fs.mkdirSync('public/sfx', { recursive: true });
wav('public/sfx/heartbeat.wav', heartbeat(6));
wav('public/sfx/muffled.wav', muffled(4));
console.log('public/sfx/heartbeat.wav, public/sfx/muffled.wav');
