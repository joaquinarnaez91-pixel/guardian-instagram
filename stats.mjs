// Prints Guardian's Instagram numbers (account + every post) as JSON. Read-only.
// Env: IG_ACCESS_TOKEN (required).
const API = 'https://graph.instagram.com/v23.0';
const token = process.env.IG_ACCESS_TOKEN;
if (!token) throw new Error('IG_ACCESS_TOKEN is required');

async function get(endpoint, params = {}) {
  const res = await fetch(`${API}/${endpoint}?${new URLSearchParams({ ...params, access_token: token })}`);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`${endpoint}: ${json.error?.message ?? res.status}`);
  return json;
}

/** Asks for each metric on its own, so one the API refuses doesn't hide the rest. */
async function insights(id, metrics, extra = {}) {
  const out = {};
  for (const metric of metrics) {
    try {
      const { data } = await get(`${id}/insights`, { metric, ...extra });
      const d = data[0];
      out[metric] = d?.total_value?.value ?? d?.values?.at(-1)?.value ?? null;
    } catch (e) {
      out[metric] = `error: ${e.message}`;
    }
  }
  return out;
}

const account = await get('me', { fields: 'username,followers_count,follows_count,media_count' });
const until = Math.floor(Date.now() / 1000);
account.last28days = await insights('me', ['reach', 'views', 'accounts_engaged', 'total_interactions', 'likes', 'comments', 'shares', 'saves', 'profile_links_taps', 'follows_and_unfollows'], {
  period: 'day', metric_type: 'total_value', since: until - 28 * 86_400, until,
});

const { data: media } = await get('me/media', {
  fields: 'id,timestamp,media_type,media_product_type,permalink,like_count,comments_count,caption', limit: 50,
});
for (const m of media) {
  m.caption = m.caption?.split('\n')[0].slice(0, 80);
  m.insights = await insights(m.id, m.media_product_type === 'REELS'
    ? ['views', 'reach', 'saved', 'shares', 'total_interactions', 'ig_reels_avg_watch_time']
    : ['views', 'reach', 'saved', 'shares', 'total_interactions', 'profile_visits', 'follows']);
}

console.log('STATS_JSON ' + JSON.stringify({ at: new Date().toISOString(), account, media }));
