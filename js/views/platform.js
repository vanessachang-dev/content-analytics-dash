/* ============================================
   Platform Deep Dive View
   90-day trends with line charts per platform.
   ============================================ */

import { registerView } from '../router.js';
import { getState, setState } from '../state.js';
import { metricCard, renderSparklines } from '../components/metric-card.js';
import { createLineChart, getPlatformColor } from '../components/chart-builder.js';
import { formatNumber, formatCompact, formatPercent, formatDateShort, platformName } from '../utils.js';

const PLATFORMS = ['youtube', 'linkedin', 'instagram', 'beehiiv', 'tiktok'];

// Which metrics to chart for each platform
const PLATFORM_CHARTS = {
  youtube: [
    { key: 'views', label: 'Views' },
    { key: 'subscribers', label: 'Subscribers' },
    { key: 'watch_hours', label: 'Watch Hours' },
    { key: 'engagement', label: 'Engagements' },
  ],
  linkedin: [
    { key: 'impressions', label: 'Impressions' },
    { key: 'followers', label: 'Followers' },
    { key: 'engagements', label: 'Engagements' },
    { key: 'engagement_rate', label: 'Engagement Rate', format: 'percent' },
  ],
  instagram: [
    { key: 'impressions', label: 'Impressions' },
    { key: 'followers', label: 'Followers' },
    { key: 'engagements', label: 'Engagements' },
    { key: 'engagement_rate', label: 'Engagement Rate', format: 'percent' },
  ],
  beehiiv: [
    { key: 'subscribers', label: 'Subscribers' },
    { key: 'open_rate', label: 'Open Rate', format: 'percent' },
    { key: 'click_rate', label: 'Click Rate', format: 'percent' },
    { key: 'web_views', label: 'Web Views' },
  ],
  tiktok: [
    { key: 'views', label: 'Views' },
    { key: 'followers', label: 'Followers' },
    { key: 'likes', label: 'Likes' },
    { key: 'avg_watch_time', label: 'Avg Watch Time (s)' },
  ],
};

function render() {
  const { rolling90, selectedPlatform } = getState();
  const container = document.getElementById('view-platform');
  if (!container || !rolling90) return;

  const platform = selectedPlatform || 'youtube';
  const platformData = rolling90.platforms[platform];
  if (!platformData) return;

  const charts = PLATFORM_CHARTS[platform] || [];
  const labels = platformData.dates.map(formatDateShort);

  // Summary metrics (latest values from rolling data)
  const summaryCards = charts.map(chart => {
    const data = platformData[chart.key];
    if (!data || data.length === 0) return '';
    const latest = data[data.length - 1];
    const previous = data.length >= 2 ? data[data.length - 2] : null;
    const format = chart.format || (typeof latest === 'number' && latest < 1 ? 'percent' : 'compact');
    return metricCard({
      label: chart.label,
      value: latest,
      previousValue: previous,
      format,
      sparklineData: data.slice(-7),
    });
  }).join('');

  // Chart containers
  const chartContainers = charts.map((chart, i) => `
    <div class="chart-container">
      <div class="chart-container__header">
        <span class="chart-container__title">${chart.label} — 90 Day Trend</span>
      </div>
      <div class="chart-container__canvas">
        <canvas id="platform-chart-${i}"></canvas>
      </div>
    </div>
  `).join('');

  // Platform tabs
  const tabs = PLATFORMS.map(p => `
    <button class="platform-tab${p === platform ? ' platform-tab--active' : ''}"
            data-platform="${p}"
            style="${p === platform ? `border-color: ${getPlatformColor(p)}; color: ${getPlatformColor(p)}` : ''}">
      ${platformName(p)}
    </button>
  `).join('');

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Platform Deep Dive</h1>
      <p class="page-header__subtitle">90-day performance trends</p>
    </div>

    <div class="platform-tabs">${tabs}</div>

    <div class="platform-dive__summary">${summaryCards}</div>

    <div class="platform-dive__charts">${chartContainers}</div>
  `;

  // Render sparklines
  renderSparklines();

  // Create Chart.js charts
  charts.forEach((chart, i) => {
    createLineChart(`platform-chart-${i}`, {
      labels,
      datasets: [{
        label: chart.label,
        data: platformData[chart.key],
        platform,
      }],
    });
  });

  // Tab click handlers
  container.querySelectorAll('[data-platform]').forEach(btn => {
    btn.addEventListener('click', () => {
      setState({ selectedPlatform: btn.dataset.platform });
      render();
    });
  });
}

registerView('platform', render);
export { render as renderPlatform };
