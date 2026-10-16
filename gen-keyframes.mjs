// Generates the Reel's keyframes with Gemini: node gen-keyframes.mjs <gemini key file> [shot ids...]
// First the lead's reference portrait (reel/frames/hero.jpg), then every shot drawn from it so he
// stays the same man. Existing frames are kept unless their id is named. The key is never printed.
import fs from 'node:fs';

const [keyFile, ...only] = process.argv.slice(2);
if (!keyFile) throw new Error('usage: node gen-keyframes.mjs <gemini key file> [shot ids...]');
const key = fs.readFileSync(keyFile, 'utf8').trim().split(/[=\s]/).filter(Boolean).pop();
const board = JSON.parse(fs.readFileSync('reel/storyboard.json', 'utf8'));
const MODEL = 'models/gemini-3-pro-image-preview';
const API = 'https://generativelanguage.googleapis.com/v1beta';
fs.mkdirSync('reel/frames', { recursive: true });

async function draw(prompt, aspectRatio, references = []) {
  const parts = [];
  for (const ref of [references].flat()) parts.push({ inlineData: { mimeType: 'image/jpeg', data: fs.readFileSync(ref).toString('base64') } });
  parts.push({ text: prompt });
  const res = await fetch(`${API}/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } } }),
  });
  const json = await res.json();
  const image = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!image) throw new Error(json.error?.message ?? `no image (${json.candidates?.[0]?.finishReason ?? 'unknown'})`);
  return Buffer.from(image.data, 'base64');
}

const want = (id) => only.length ? only.includes(id) : !fs.existsSync(`reel/frames/${id}.jpg`);

if (want('hero')) {
  fs.writeFileSync('reel/frames/hero.jpg', await draw(`${board.hero} ${board.style}`, '3:4'));
  console.log('hero.jpg');
}
for (const shot of board.shots) {
  if (want(shot.id)) {
    try {
      const prompt = `The man in the reference image is the lead; keep his face, hair, build and age exactly the same. ${shot.frame} ${board.style}`;
      fs.writeFileSync(`reel/frames/${shot.id}.jpg`, await draw(prompt, '9:16', 'reel/frames/hero.jpg'));
      console.log(`${shot.id}.jpg`);
    } catch (e) {
      console.log(`${shot.id}: ${e.message}`);
    }
  }
  // A shot with an "end" gets its last frame too, drawn from the lead and the shot's first frame.
  if (shot.end && want(`${shot.id}_end`)) {
    try {
      const prompt = `Same man, same room, same light and moment as the second reference image, later in the same shot. ${shot.end} ${board.style}`;
      fs.writeFileSync(`reel/frames/${shot.id}_end.jpg`, await draw(prompt, '9:16', ['reel/frames/hero.jpg', `reel/frames/${shot.id}.jpg`]));
      console.log(`${shot.id}_end.jpg`);
    } catch (e) {
      console.log(`${shot.id}_end: ${e.message}`);
    }
  }
}
