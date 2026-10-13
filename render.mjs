// Renders one week of posts: node render.mjs [weeks/2026-10-12.json]
// Writes out/<week>/ with each post's images or video, named by date, and captions.txt.
import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const weekFile = process.argv[2] ?? fs.readdirSync('weeks').filter((f) => f.endsWith('.json')).sort().map((f) => path.join('weeks', f)).pop();
const week = JSON.parse(fs.readFileSync(weekFile, 'utf8'));
const outDir = path.join('out', week.week);
fs.mkdirSync(outDir, { recursive: true });

console.log(`Bundling for ${weekFile}...`);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });

const captions = [];
for (const post of week.posts) {
  const base = `${post.date}_${post.day}_${post.name}`;
  const files = [];
  if (post.kind === 'reel') {
    const inputProps = post.reel;
    const composition = await selectComposition({ serveUrl, id: 'Reel', inputProps });
    const file = `${base}.mp4`;
    await renderMedia({ serveUrl, composition, codec: 'h264', inputProps, outputLocation: path.join(outDir, file) });
    files.push(file);
  } else {
    for (const [i, inputProps] of post.slides.entries()) {
      const composition = await selectComposition({ serveUrl, id: 'Quote', inputProps });
      // Instagram's publishing API takes JPEG only.
      const file = post.slides.length > 1 ? `${base}_${i + 1}.jpg` : `${base}.jpg`;
      await renderStill({ serveUrl, composition, inputProps, imageFormat: 'jpeg', jpegQuality: 95, output: path.join(outDir, file) });
      files.push(file);
    }
  }
  console.log(`  ${post.date} ${post.day}: ${files.join(', ')}`);
  captions.push(
    `${post.date} (${post.day.toUpperCase()}) at ${week.postAt}, ${post.kind}\n` +
    `Files: ${files.join(', ')}\n\n${post.caption}\n\n${week.hashtags}\n`
  );
}

fs.writeFileSync(path.join(outDir, 'captions.txt'), captions.join('\n' + '-'.repeat(40) + '\n\n'));
console.log(`Done: ${outDir}`);
