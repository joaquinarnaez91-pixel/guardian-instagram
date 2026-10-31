// Publishes the day's post to Guardian's Instagram through the Instagram API with Instagram Login.
// Env: IG_ACCESS_TOKEN (required), MEDIA_BASE (public URL of this repo's files),
//      POST_DATE (YYYY-MM-DD, posts that day now; otherwise today, only from 20:00 Guardian time).
import fs from 'node:fs';
import path from 'node:path';

const TZ = 'America/Chicago';
const POST_HOUR = 20;
const API = 'https://graph.instagram.com/v23.0';
const token = process.env.IG_ACCESS_TOKEN;
const mediaBase = (process.env.MEDIA_BASE ?? '').replace(/\/$/, '');
if (!token || !mediaBase) throw new Error('IG_ACCESS_TOKEN and MEDIA_BASE are required');

const parts = Object.fromEntries(
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map((p) => [p.type, p.value]),
);
const today = `${parts.year}-${parts.month}-${parts.day}`;
const yesterday = new Date(Date.parse(`${today}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
const posted = (d) => fs.existsSync(path.join('posted', `${d}.json`));

// GitHub's scheduler can run hours late, so this runs hourly: today's post from 20:00, and a post
// that a late run missed yesterday goes out the next morning (until noon). One post per run.
// A run that lands in the afternoon waits for 20:00 itself, so the post isn't left to a late run.
const MAX_WAIT_MIN = 340; // post.yml gives the job 355 minutes
let date = process.env.POST_DATE;
let waitMin = 0;
if (!date) {
  const hour = Number(parts.hour);
  const untilPost = (POST_HOUR - hour) * 60 - Number(parts.minute);
  if (hour < POST_HOUR && untilPost <= MAX_WAIT_MIN && !posted(today)) { date = today; waitMin = untilPost; }
  else if (hour >= POST_HOUR && !posted(today)) date = today;
  else if (hour < 12 && !posted(yesterday)) date = yesterday;
  else {
    console.log(`Nothing due at ${parts.hour}:00 in ${TZ}.`);
    process.exit(0);
  }
}
const marker = path.join('posted', `${date}.json`);
if (fs.existsSync(marker)) {
  console.log(`${date} is already posted.`);
  process.exit(0);
}

let week, post;
for (const f of fs.readdirSync('weeks').filter((f) => f.endsWith('.json'))) {
  const w = JSON.parse(fs.readFileSync(path.join('weeks', f), 'utf8'));
  const p = w.posts.find((p) => p.date === date);
  if (p) { week = w; post = p; break; }
}
if (!post) {
  console.log(`Nothing planned for ${date}.`);
  process.exit(0);
}
if (waitMin > 0) {
  console.log(`Waiting ${waitMin} minutes for ${POST_HOUR}:00 in ${TZ}.`);
  await new Promise((r) => setTimeout(r, waitMin * 60_000));
}

async function call(method, endpoint, params = {}) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const url = method === 'GET' ? `${API}/${endpoint}?${body}` : `${API}/${endpoint}`;
  const res = await fetch(url, method === 'GET' ? {} : { method, body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${endpoint}: ${json.error?.message ?? res.status}`);
  return json;
}

/** Waits until Instagram has fetched and processed a container (videos take a while). */
async function ready(id) {
  for (let i = 0; i < 60; i++) {
    const { status_code } = await call('GET', id, { fields: 'status_code' });
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR' || status_code === 'EXPIRED') throw new Error(`container ${id}: ${status_code}`);
    await new Promise((r) => setTimeout(r, 10_000));
  }
  throw new Error(`container ${id} still processing after 10 minutes`);
}

const url = (file) => `${mediaBase}/out/${week.week}/${file}`;
const base = `${post.date}_${post.day}_${post.name}`;
// The launch line switches by itself once Apple's lookup finds the app (approval to public can take a day).
const APP_STORE_ID = '6819515592';
const appLive = await fetch(`https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=us`)
  .then((r) => r.json()).then((j) => j.resultCount > 0).catch(() => false);
const cta = appLive ? (week.ctaLive ?? week.cta) : week.cta;
console.log(`App Store listing ${appLive ? 'is live' : 'not public yet'}.`);
const caption = [post.caption, cta, week.hashtags].filter(Boolean).join('\n\n');

let container;
if (post.kind === 'reel') {
  ({ id: container } = await call('POST', 'me/media', { media_type: 'REELS', video_url: url(`${base}.mp4`), caption, share_to_feed: 'true' }));
} else if (post.slides.length > 1) {
  const children = [];
  for (let i = 1; i <= post.slides.length; i++) {
    const { id } = await call('POST', 'me/media', { image_url: url(`${base}_${i}.jpg`), is_carousel_item: 'true' });
    await ready(id);
    children.push(id);
  }
  ({ id: container } = await call('POST', 'me/media', { media_type: 'CAROUSEL', children: children.join(','), caption }));
} else {
  ({ id: container } = await call('POST', 'me/media', { image_url: url(`${base}.jpg`), caption }));
}
await ready(container);

const { id: mediaId } = await call('POST', 'me/media_publish', { creation_id: container });
const { permalink } = await call('GET', mediaId, { fields: 'permalink' });

fs.mkdirSync('posted', { recursive: true });
fs.writeFileSync(marker, JSON.stringify({ date, name: post.name, mediaId, permalink }, null, 2) + '\n');
console.log(`Posted ${date} ${post.name}: ${permalink}`);
