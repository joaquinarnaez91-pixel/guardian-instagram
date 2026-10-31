// Renders one week of posts: node render.mjs [weeks/2026-10-12.json] [YYYY-MM-DD ...]
// Writes out/<week>/ with each post's images or video, named by date, and captions.txt.
import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const weekFile = process.argv[2] ?? fs.readdirSync('weeks').filter((f) => f.endsWith('.json')).sort().map((f) => path.join('weeks', f)).pop();
const week = JSON.parse(fs.readFileSync(weekFile, 'utf8'));
// Dates after the week file limit rendering to those posts; the others keep their existing files.
const only = new Set(process.argv.slice(3));
const outDir = path.join('out', week.week);
fs.mkdirSync(outDir, { recursive: true });

console.log(`Bundling for ${weekFile}...`);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });

const captions = [];
for (const post of week.posts) {
  const base = `${post.date}_${post.day}_${post.name}`;
  const files = [];
  const skip = only.size > 0 && !only.has(post.date);
  if (post.kind === 'reel') {
    // "template" picks the composition: the breathing Reel (default) or a cut of existing footage (ClipReel).
    const { template = 'Reel', ...inputProps } = post.reel;
    const file = `${base}.mp4`;
    if (!skip) {
      const composition = await selectComposition({ serveUrl, id: template, inputProps });
      await renderMedia({ serveUrl, composition, codec: 'h264', inputProps, outputLocation: path.join(outDir, file) });
    }
    files.push(file);
  } else {
    for (const [i, slide] of post.slides.entries()) {
      // Instagram's publishing API takes JPEG only.
      const file = post.slides.length > 1 ? `${base}_${i + 1}.jpg` : `${base}.jpg`;
      files.push(file);
      if (skip) continue;
      // Each slide names its layout: Quote (default), Journey, Character or PhotoQuote.
      const { template = 'Quote', ...inputProps } = slide;
      const composition = await selectComposition({ serveUrl, id: template, inputProps });
      await renderStill({ serveUrl, composition, inputProps, imageFormat: 'jpeg', jpegQuality: 95, output: path.join(outDir, file) });
    }
  }
  console.log(`  ${post.date} ${post.day}: ${skip ? '(kept) ' : ''}${files.join(', ')}`);
  captions.push(
    `${post.date} (${post.day.toUpperCase()}) at ${week.postAt}, ${post.kind}\n` +
    `Files: ${files.join(', ')}\n\n${[post.caption, week.cta, week.hashtags].filter(Boolean).join('\n\n')}\n`
  );
}

fs.writeFileSync(path.join(outDir, 'captions.txt'), captions.join('\n' + '-'.repeat(40) + '\n\n'));
console.log(`Done: ${outDir}`);
