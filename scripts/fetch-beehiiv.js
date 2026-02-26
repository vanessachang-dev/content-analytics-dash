/**
 * Fetch Beehiiv metrics and write to data/daily/<date>.json
 *
 * Pulls: subscriber count, new subs, unsubscribes,
 *        recent email stats (open rate, click rate, recipients),
 *        web views from aggregate stats.
 *
 * Required env vars:
 *   BEEHIIV_API_KEY       — Bearer token from Beehiiv settings
 *   BEEHIIV_PUBLICATION_ID — V2 publication ID (pub_...)
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const API_KEY = process.env.BEEHIIV_API_KEY;
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;
const BASE_URL = 'https://api.beehiiv.com/v2';

if (!API_KEY || !PUB_ID) {
  console.error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID');
  process.exit(1);
}

/** Make an authenticated GET request to Beehiiv API. */
async function beehiivGet(path, params = {}) {
  const url = new URL(`${BASE_URL}/publications/${PUB_ID}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach(item => url.searchParams.append(k, item));
    } else if (v != null) {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Beehiiv API ${res.status}: ${body}`);
  }

  return res.json();
}

/** Get total active subscriber count. */
async function getSubscriberCount() {
  // limit=1 so we only fetch metadata, not actual subscriber data
  const data = await beehiivGet('/subscriptions', {
    limit: 1,
    status: 'active',
  });

  console.log(`  [debug] Active subscribers: ${data.total_results}`);

  // If active returns 0, check all statuses to diagnose
  if (!data.total_results) {
    const allData = await beehiivGet('/subscriptions', { limit: 1 });
    console.log(`  [debug] All subscribers (any status): ${allData.total_results}`);
    // Use the "all" count as fallback — some publications don't use the "active" status
    return allData.total_results || 0;
  }

  return data.total_results || 0;
}

/** Get the most recent email campaign stats. */
async function getRecentEmailStats() {
  const data = await beehiivGet('/posts', {
    'expand[]': 'stats',
    platform: 'email',
    status: 'confirmed',
    limit: 5,
    order_by: 'publish_date',
    direction: 'desc',
  });

  if (!data.data || data.data.length === 0) {
    return { latest: null, emails_sent_today: 0 };
  }

  // Find the most recent email
  const latest = data.data[0];
  const stats = latest.stats?.email || {};

  // Check if this email was sent today
  const today = new Date().toISOString().slice(0, 10);
  const publishDate = latest.publish_date
    ? new Date(latest.publish_date * 1000).toISOString().slice(0, 10)
    : null;
  const sentToday = publishDate === today;

  return {
    latest: {
      title: latest.title || latest.subtitle || 'Untitled',
      published_at: latest.publish_date
        ? new Date(latest.publish_date * 1000).toISOString()
        : null,
      recipients: stats.recipients || 0,
      opens: stats.unique_opens || 0,
      open_rate: stats.open_rate || null,
      clicks: stats.unique_clicks || 0,
      click_rate: stats.click_rate || null,
      unsubscribes: stats.unsubscribes || 0,
    },
    emails_sent_today: sentToday ? stats.recipients : 0,
  };
}

/** Get aggregate web view stats. */
async function getWebStats() {
  const data = await beehiivGet('/posts/aggregate_stats', {
    platform: 'web',
    status: 'confirmed',
  });

  return {
    total_web_views: data.data?.stats?.web?.views || 0,
  };
}

async function main() {
  console.log('Fetching Beehiiv metrics...');

  const [subscriberCount, emailStats, webStats] = await Promise.all([
    getSubscriberCount(),
    getRecentEmailStats(),
    getWebStats(),
  ]);

  // Build today's Beehiiv data
  const today = new Date().toISOString().slice(0, 10);
  const beehiivData = {
    subscribers_total: subscriberCount,
    subscribers_gained: null, // Calculated by diffing with yesterday
    unsubscribes: emailStats.latest?.unsubscribes || 0,
    emails_sent: emailStats.emails_sent_today,
    open_rate: emailStats.latest?.open_rate || null,
    click_rate: emailStats.latest?.click_rate || null,
    web_views: webStats.total_web_views,
    latest_email: emailStats.latest,
  };

  // Read or create today's daily JSON
  const dailyDir = join(ROOT, 'data', 'daily');
  mkdirSync(dailyDir, { recursive: true });

  const dailyPath = join(dailyDir, `${today}.json`);
  let dailyData;

  if (existsSync(dailyPath)) {
    dailyData = JSON.parse(readFileSync(dailyPath, 'utf-8'));
  } else {
    dailyData = { date: today, platforms: {} };
  }

  // Calculate subscribers_gained by comparing with yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayPath = join(dailyDir, `${yesterday.toISOString().slice(0, 10)}.json`);
  if (existsSync(yesterdayPath)) {
    const yesterdayData = JSON.parse(readFileSync(yesterdayPath, 'utf-8'));
    const prevSubs = yesterdayData.platforms?.beehiiv?.subscribers_total;
    if (prevSubs != null) {
      beehiivData.subscribers_gained = subscriberCount - prevSubs;
    }
  }

  // Merge Beehiiv data into the daily file (preserves other platforms)
  dailyData.platforms.beehiiv = beehiivData;

  writeFileSync(dailyPath, JSON.stringify(dailyData, null, 2));
  console.log(`Wrote Beehiiv data to ${dailyPath}`);
  console.log(`  Subscribers: ${subscriberCount}`);
  console.log(`  Open rate: ${beehiivData.open_rate ?? 'no recent email'}`);
  console.log(`  Web views: ${beehiivData.web_views}`);
}

main().catch(err => {
  console.error('Beehiiv fetch failed:', err.message);
  process.exit(1);
});
