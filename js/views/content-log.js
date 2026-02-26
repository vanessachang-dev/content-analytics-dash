/* ============================================
   Content Performance Log View
   Sortable table of individual content pieces.
   ============================================ */

import { registerView } from '../router.js';
import { getState } from '../state.js';
import { dataTable } from '../components/data-table.js';
import { formatNumber, formatCompact, formatPercent, formatRelativeTime, platformName } from '../utils.js';

let activeFilter = 'all';
let tableInstance = null;

function render() {
  const { contentLog } = getState();
  const container = document.getElementById('view-content-log');
  if (!container) return;

  // Filter by platform
  const filteredPosts = activeFilter === 'all'
    ? contentLog
    : contentLog.filter(p => p.platform === activeFilter);

  // Platform filter buttons
  const platforms = ['all', ...new Set(contentLog.map(p => p.platform))];
  const filters = platforms.map(p => `
    <button class="content-log__filter${p === activeFilter ? ' content-log__filter--active' : ''}"
            data-filter="${p}">
      ${p === 'all' ? 'All' : platformName(p)}
    </button>
  `).join('');

  // Define columns with formatters
  const columns = [
    {
      key: 'title',
      label: 'Title',
      className: 'data-table__title-cell',
      format: (val) => val,
    },
    {
      key: 'platform',
      label: 'Platform',
      format: (val) => `<span class="badge badge--${val}">${platformName(val)}</span>`,
    },
    {
      key: 'type',
      label: 'Type',
      format: (val) => val,
    },
    {
      key: 'published_at',
      label: 'Published',
      format: (val) => formatRelativeTime(val),
    },
    {
      key: 'primary_metric',
      label: 'Primary Metric',
      align: 'right',
      format: (val) => formatCompact(val),
    },
    {
      key: 'engagement',
      label: 'Engagement',
      align: 'right',
      format: (val) => formatCompact(val),
    },
    {
      key: 'snapshot_24h',
      label: '24h',
      align: 'right',
      format: (val) => val != null ? formatCompact(val) : '—',
    },
  ];

  // Transform posts into flat rows for the table
  const rows = filteredPosts.map(post => {
    const l = post.latest || {};
    // Primary metric varies by platform
    let primaryMetric = l.views ?? l.impressions ?? l.opens ?? 0;
    let engagement = (l.likes ?? l.reactions ?? 0) + (l.comments ?? 0) + (l.shares ?? 0) + (l.saves ?? 0);

    // 24h snapshot primary metric
    const snap24h = post.snapshots?.['24h'];
    let snapshot24h = snap24h ? (snap24h.views ?? snap24h.impressions ?? snap24h.opens ?? null) : null;

    return {
      title: post.title,
      platform: post.platform,
      type: post.type,
      published_at: post.published_at,
      primary_metric: primaryMetric,
      engagement,
      snapshot_24h: snapshot24h,
    };
  });

  // Build table
  tableInstance = dataTable({
    id: 'content-table',
    columns,
    rows,
    sortKey: 'published_at',
    sortDir: 'desc',
    responsive: true,
  });

  // Mobile card view (shown on small screens via CSS)
  const mobileCards = filteredPosts.map(post => {
    const l = post.latest || {};
    const primaryMetric = l.views ?? l.impressions ?? l.opens ?? 0;
    const engagement = (l.likes ?? l.reactions ?? 0) + (l.comments ?? 0);

    return `
      <div class="content-card">
        <div class="content-card__header">
          <span class="content-card__title">${post.title}</span>
          <span class="badge badge--${post.platform}">${platformName(post.platform)}</span>
        </div>
        <div class="content-card__meta">
          <span class="content-card__stat">
            ${post.platform === 'beehiiv' ? 'Opens' : 'Views'}: <span class="content-card__stat-value">${formatCompact(primaryMetric)}</span>
          </span>
          <span class="content-card__stat">
            Engagement: <span class="content-card__stat-value">${formatCompact(engagement)}</span>
          </span>
          <span class="content-card__stat">
            ${formatRelativeTime(post.published_at)}
          </span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Content Log</h1>
      <p class="page-header__subtitle">Performance tracking by individual piece</p>
    </div>

    <div class="content-log__filters">${filters}</div>

    <!-- Desktop: data table -->
    <div class="content-log__table-view">
      ${tableInstance.html}
    </div>

    <!-- Mobile: card list (hidden on desktop via CSS) -->
    <div class="content-log__card-view">
      ${mobileCards}
    </div>
  `;

  // Wire up table sorting
  tableInstance.attach();

  // Wire up filter buttons
  container.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

registerView('content-log', render);
export { render as renderContentLog };
