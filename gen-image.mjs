// Generates a background photo with Gemini: node gen-image.mjs <key file> <name> "<scene>"
// Writes public/photos/<name>.jpg. The key is read from the file and never printed.
import fs from 'node:fs';

const [keyFile, name = 'dawn', scene] = process.argv.slice(2);
if (!keyFile) throw new Error('usage: node gen-image.mjs <key file> <name> "<scene>"');
const key = fs.readFileSync(keyFile, 'utf8').trim().split(/[=\s]/).filter(Boolean).pop();

const STYLE = 'Cinematic photograph, vertical 4:5, shot on 35mm film, soft natural light, deep navy and violet shadows, '
  + 'calm and hopeful mood, shallow depth of field, subtle film grain. No text, no logos, no screens showing content, '
  + 'no faces in focus. Leave the lower half quiet and dark for a caption.';
const prompt = `${scene ?? 'A person seen from behind, sitting on the edge of a bed at dawn, a phone lying face down on the nightstand, first light coming through the window'}. ${STYLE}`;

const API = 'https://generativelanguage.googleapis.com/v1beta';
const models = (await (await fetch(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } })).json()).models ?? [];
const imageModels = models
  .filter((m) => /image/i.test(m.name) && m.supportedGenerationMethods?.includes('generateContent'))
  .map((m) => m.name)
  .sort((a, b) => (/pro/.test(b) - /pro/.test(a)) || b.localeCompare(a));
if (!imageModels.length) {
  console.log('This key has no Gemini image model available. Models it can use:', models.map((m) => m.name).join(', ') || '(none: check the key)');
  process.exit(1);
}

for (const model of imageModels) {
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
    }),
  });
  const json = await res.json();
  const image = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (image) {
    fs.mkdirSync('public/photos', { recursive: true });
    fs.writeFileSync(`public/photos/${name}.jpg`, Buffer.from(image.data, 'base64'));
    console.log(`Saved public/photos/${name}.jpg with ${model}`);
    process.exit(0);
  }
  console.log(`${model}: ${json.error?.message ?? 'no image returned'}`);
}
process.exit(1);
