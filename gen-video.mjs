// Animates storyboard keyframes into clips: node gen-video.mjs <veo|seedance|both> <shot id> [more ids]
// Keys come from ~/.guardian-keys/gemini.key (Veo) and ~/.guardian-keys/fal.key (Seedance) and are never printed.
// Writes reel/clips/<id>_<provider>.mp4. 720p, vertical, with the model's own sound.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [which, ...ids] = process.argv.slice(2);
if (!which || !ids.length) throw new Error('usage: node gen-video.mjs <veo|seedance|both> <shot id> [more ids]');
const board = JSON.parse(fs.readFileSync('reel/storyboard.json', 'utf8'));
const readKey = (name) => fs.readFileSync(path.join(os.homedir(), '.guardian-keys', name), 'utf8').trim().split(/[=\s]/).filter(Boolean).pop();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync('reel/clips', { recursive: true });

async function save(url, headers, file) {
  const res = await fetch(url, { headers, redirect: 'follow' });
  if (!res.ok) throw new Error(`download ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function veo(shot, image, prompt, file) {
  const key = readKey('gemini.key');
  const API = 'https://generativelanguage.googleapis.com/v1beta';
  const headers = { 'x-goog-api-key': key, 'content-type': 'application/json' };
  // First-and-last-frame shots must be 8 seconds long.
  const seconds = shot.end ? 8 : [4, 6, 8].find((s) => s >= shot.seconds) ?? 8;
  const shapes = [
    { bytesBase64Encoded: image.toString('base64'), mimeType: 'image/jpeg' },
    { inlineData: { mimeType: 'image/jpeg', data: image.toString('base64') } },
  ];
  // A shot with a drawn last frame: Veo moves from the first frame to it.
  const endFile = `reel/frames/${shot.id}_end.jpg`;
  const end = shot.end && fs.existsSync(endFile) ? fs.readFileSync(endFile).toString('base64') : null;
  let op;
  const errors = [];
  for (const img of shapes) {
    const lastFrame = end && (img.inlineData ? { inlineData: { mimeType: 'image/jpeg', data: end } } : { bytesBase64Encoded: end, mimeType: 'image/jpeg' });
    const res = await fetch(`${API}/models/veo-3.1-generate-preview:predictLongRunning`, {
      method: 'POST', headers,
      body: JSON.stringify({ instances: [{ prompt, image: img, ...(lastFrame && { lastFrame }) }], parameters: { aspectRatio: '9:16', durationSeconds: seconds, resolution: '720p', personGeneration: 'allow_adult' } }),
    });
    op = await res.json();
    if (!op.error) break;
    errors.push(op.error.message);
  }
  if (op.error) throw new Error(errors.join(' | '));
  while (!op.done) {
    await sleep(10_000);
    op = await (await fetch(`${API}/${op.name}`, { headers })).json();
    if (op.error) throw new Error(op.error.message);
  }
  const uri = op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) throw new Error(`no video: ${JSON.stringify(op.response?.generateVideoResponse?.raiMediaFilteredReasons ?? op.response ?? {})}`);
  await save(uri, { 'x-goog-api-key': key }, file);
}

async function seedance(shot, image, prompt, file) {
  const headers = { Authorization: `Key ${readKey('fal.key')}`, 'content-type': 'application/json' };
  const submit = await (await fetch('https://queue.fal.run/bytedance/seedance-2.5/image-to-video', {
    method: 'POST', headers,
    body: JSON.stringify({
      image_url: `data:image/jpeg;base64,${image.toString('base64')}`,
      prompt, duration: String(Math.max(4, shot.seconds)), resolution: '720p', generate_audio: true,
    }),
  })).json();
  if (!submit.status_url) throw new Error(submit.detail ? JSON.stringify(submit.detail) : JSON.stringify(submit));
  for (;;) {
    await sleep(8_000);
    const s = await (await fetch(submit.status_url, { headers })).json();
    if (s.status === 'COMPLETED') break;
    if (s.status !== 'IN_QUEUE' && s.status !== 'IN_PROGRESS') throw new Error(JSON.stringify(s));
  }
  const result = await (await fetch(submit.response_url, { headers })).json();
  if (!result.video?.url) throw new Error(JSON.stringify(result));
  await save(result.video.url, {}, file);
}

const providers = which === 'both' ? ['veo', 'seedance'] : [which];
for (const id of ids) {
  const shot = board.shots.find((s) => s.id === id);
  if (!shot) { console.log(`${id}: not in the storyboard`); continue; }
  const image = fs.readFileSync(`reel/frames/${id}.jpg`);
  const prompt = `${shot.motion} ${board.style.replace('Cinematic still', 'Cinematic shot')}`;
  await Promise.all(providers.map(async (p) => {
    const file = `reel/clips/${id}_${p}.mp4`;
    const started = Date.now();
    try {
      await (p === 'veo' ? veo : seedance)(shot, image, prompt, file);
      console.log(`${file} (${Math.round((Date.now() - started) / 1000)}s)`);
    } catch (e) {
      console.log(`${id} ${p}: ${e.message}`);
    }
  }));
}
