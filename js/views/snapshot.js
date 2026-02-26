/* ============================================
   Today's Snapshot View
   Default landing page — aggregate + per-platform metrics.
   ============================================ */

import { registerView } from '../router.js';
import { getState } from '../state.js';
import { metricCard, renderSparklines } from '../components/metric-card.js';
import { alertBanner } from '../components/alert-banner.js';
import { formatNumber, formatCompact, formatPercent, formatDuration, formatDateFull, calcDelta, platformName, platformIcon } from '../utils.js';

function render() {
  const { today, yesterday, weekDays, alerts } = getState();
  const container = document.getElementById('view-snapshot');
  if (!container || !today) return;

  // Helper: extract metric across weekDays for sparklines
  const sparkline = (platform, metric) =>
    weekDays.map(d => d.platforms?.[platform]?.[metric]).filter(v => v != null);

  // Aggregate metrics across all platforms
  const totalFollowers =
    (today.platforms.youtube?.subscribers_total || 0) +
    (today.platforms.linkedin?.followers_total || 0) +
    (today.platforms.instagram?.followers_total || 0) +
    (today.platforms.beehiiv?.subscribers_total || 0) +
    (today.platforms.tiktok?.followers_total || 0);

  const prevTotalFollowers = yesterday ? (
    (yesterday.platforms.youtube?.subscribers_total || 0) +
    (yesterday.platforms.linkedin?.followers_total || 0) +
    (yesterday.platforms.instagram?.followers_total || 0) +
    (yesterday.platforms.beehiiv?.subscribers_total || 0) +
    (yesterday.platforms.tiktok?.followers_total || 0)
  ) : null;

  const totalEngagements =
    (today.platforms.youtube?.likes || 0) + (today.platforms.youtube?.comments || 0) +
    (today.platforms.linkedin?.engagements || 0) +
    (today.platforms.instagram?.engagements || 0) +
    (today.platforms.tiktok?.likes || 0) + (today.platforms.tiktok?.comments || 0);

  const prevTotalEngagements = yesterday ? (
    (yesterday.platforms.youtube?.likes || 0) + (yesterday.platforms.youtube?.comments || 0) +
    (yesterday.platforms.linkedin?.engagements || 0) +
    (yesterday.platforms.instagram?.engagements || 0) +
    (yesterday.platforms.tiktok?.likes || 0) + (yesterday.platforms.tiktok?.comments || 0)
  ) : null;

  // Aggregate sparklines
  const followerSparkline = weekDays.map(d =>
    (d.platforms.youtube?.subscribers_total || 0) +
    (d.platforms.linkedin?.followers_total || 0) +
    (d.platforms.instagram?.followers_total || 0) +
    (d.platforms.beehiiv?.subscribers_total || 0) +
    (d.platforms.tiktok?.followers_total || 0)
  );

  const engagementSparkline = weekDays.map(d =>
    (d.platforms.youtube?.likes || 0) + (d.platforms.youtube?.comments || 0) +
    (d.platforms.linkedin?.engagements || 0) +
    (d.platforms.instagram?.engagements || 0) +
    (d.platforms.tiktok?.likes || 0) + (d.platforms.tiktok?.comments || 0)
  );

  // YouTube section
  const yt = today.platforms.youtube;
  const ytPrev = yesterday?.platforms.youtube;

  // LinkedIn section
  const li = today.platforms.linkedin;
  const liPrev = yesterday?.platforms.linkedin;

  // Instagram section
  const ig = today.platforms.instagram;
  const igPrev = yesterday?.platforms.instagram;

  // Beehiiv section
  const bh = today.platforms.beehiiv;
  const bhPrev = yesterday?.platforms.beehiiv;

  // TikTok section
  const tt = today.platforms.tiktok;
  const ttPrev = yesterday?.platforms.tiktok;

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Today's Snapshot</h1>
      <p class="page-header__subtitle">${formatDateFull(today.date)}</p>
    </div>

    ${alertBanner(alerts)}

    <!-- Aggregate Metrics -->
    <div class="section snapshot__aggregate">
      <div class="grid grid--4">
        ${metricCard({ label: 'Total Audience', value: totalFollowers, previousValue: prevTotalFollowers, format: 'compact', sparklineData: followerSparkline, large: false })}
        ${metricCard({ label: 'Engagements', value: totalEngagements, previousValue: prevTotalEngagements, format: 'compact', sparklineData: engagementSparkline })}
        ${metricCard({ label: 'YouTube Views', value: yt?.views, previousValue: ytPrev?.views, format: 'compact', sparklineData: sparkline('youtube', 'views') })}
        ${metricCard({ label: 'Newsletter Subs', value: bh?.subscribers_total, previousValue: bhPrev?.subscribers_total, format: 'compact', sparklineData: sparkline('beehiiv', 'subscribers_total') })}
      </div>
    </div>

    <!-- Per-Platform Breakdown -->
    <div class="snapshot__platforms">

      <!-- YouTube -->
      <div class="section">
        <h2 class="section__title">
          <span class="platform-dot" style="background: var(--color-youtube)"></span>
          YouTube
        </h2>
        <div class="grid grid--5">
          ${metricCard({ label: 'Views', value: yt?.views, previousValue: ytPrev?.views, format: 'compact', sparklineData: sparkline('youtube', 'views') })}
          ${metricCard({ label: 'Watch Hours', value: yt?.watch_hours, previousValue: ytPrev?.watch_hours, format: 'number' })}
          ${metricCard({ label: 'Subscribers', value: yt?.subscribers_total, previousValue: ytPrev?.subscribers_total, format: 'compact', sparklineData: sparkline('youtube', 'subscribers_total') })}
          ${metricCard({ label: 'CTR', value: yt?.ctr, previousValue: ytPrev?.ctr, format: 'percent' })}
          ${metricCard({ label: 'Avg Duration', value: yt?.avg_view_duration, previousValue: ytPrev?.avg_view_duration, format: 'duration' })}
        </div>
        ${yt?.top_video ? `
          <div class="snapshot__top-content">
            <div class="snapshot__top-content-title">Top video today</div>
            <div class="snapshot__top-content-name">${yt.top_video.title} — ${formatCompact(yt.top_video.views)} views</div>
          </div>
        ` : ''}
      </div>

      <!-- LinkedIn -->
      <div class="section">
        <h2 class="section__title">
          <span class="platform-dot" style="background: var(--color-linkedin)"></span>
          LinkedIn
        </h2>
        <div class="grid grid--5">
          ${metricCard({ label: 'Impressions', value: li?.impressions, previousValue: liPrev?.impressions, format: 'compact', sparklineData: sparkline('linkedin', 'impressions') })}
          ${metricCard({ label: 'Engagements', value: li?.engagements, previousValue: liPrev?.engagements, format: 'compact' })}
          ${metricCard({ label: 'Followers', value: li?.followers_total, previousValue: liPrev?.followers_total, format: 'compact', sparklineData: sparkline('linkedin', 'followers_total') })}
          ${metricCard({ label: 'Engagement Rate', value: li?.engagement_rate, previousValue: liPrev?.engagement_rate, format: 'percent' })}
          ${metricCard({ label: 'Profile Views', value: li?.profile_views, previousValue: liPrev?.profile_views, format: 'number' })}
        </div>
      </div>

      <!-- Instagram -->
      <div class="section">
        <h2 class="section__title">
          <span class="platform-dot" style="background: var(--color-instagram)"></span>
          Instagram
        </h2>
        <div class="grid grid--5">
          ${metricCard({ label: 'Reach', value: ig?.reach, previousValue: igPrev?.reach, format: 'compact', sparklineData: sparkline('instagram', 'reach') })}
          ${metricCard({ label: 'Engagements', value: ig?.engagements, previousValue: igPrev?.engagements, format: 'compact' })}
          ${metricCard({ label: 'Followers', value: ig?.followers_total, previousValue: igPrev?.followers_total, format: 'compact', sparklineData: sparkline('instagram', 'followers_total') })}
          ${metricCard({ label: 'Engagement Rate', value: ig?.engagement_rate, previousValue: igPrev?.engagement_rate, format: 'percent' })}
          ${metricCard({ label: 'Story Views', value: ig?.stories_views, previousValue: igPrev?.stories_views, format: 'number' })}
        </div>
      </div>

      <!-- Beehiiv -->
      <div class="section">
        <h2 class="section__title">
          <span class="platform-dot" style="background: var(--color-beehiiv)"></span>
          Beehiiv
        </h2>
        <div class="grid grid--4">
          ${metricCard({ label: 'Subscribers', value: bh?.subscribers_total, previousValue: bhPrev?.subscribers_total, format: 'compact', sparklineData: sparkline('beehiiv', 'subscribers_total') })}
          ${metricCard({ label: 'Open Rate', value: bh?.open_rate, previousValue: bhPrev?.open_rate, format: 'percent' })}
          ${metricCard({ label: 'Click Rate', value: bh?.click_rate, previousValue: bhPrev?.click_rate, format: 'percent' })}
          ${metricCard({ label: 'Web Views', value: bh?.web_views, previousValue: bhPrev?.web_views, format: 'number', sparklineData: sparkline('beehiiv', 'web_views') })}
        </div>
      </div>

      <!-- TikTok -->
      <div class="section">
        <h2 class="section__title">
          <span class="platform-dot" style="background: var(--color-tiktok)"></span>
          TikTok
        </h2>
        <div class="grid grid--5">
          ${metricCard({ label: 'Views', value: tt?.views, previousValue: ttPrev?.views, format: 'compact', sparklineData: sparkline('tiktok', 'views') })}
          ${metricCard({ label: 'Likes', value: tt?.likes, previousValue: ttPrev?.likes, format: 'number' })}
          ${metricCard({ label: 'Followers', value: tt?.followers_total, previousValue: ttPrev?.followers_total, format: 'compact', sparklineData: sparkline('tiktok', 'followers_total') })}
          ${metricCard({ label: 'Comments', value: tt?.comments, previousValue: ttPrev?.comments, format: 'number' })}
          ${metricCard({ label: 'Avg Watch Time', value: tt?.avg_watch_time, previousValue: ttPrev?.avg_watch_time, format: 'number' })}
        </div>
      </div>

    </div>
  `;

  // Render sparklines after DOM update
  renderSparklines();
}

registerView('snapshot', render);
export { render as renderSnapshot };
