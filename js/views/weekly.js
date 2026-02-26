/* ============================================
   Weekly Synthesis View
   AI-generated prose report + highlights + scores.
   ============================================ */

import { registerView } from '../router.js';
import { getState, loadWeek, setState } from '../state.js';
import { platformName } from '../utils.js';

function render() {
  const { weeklyReports, selectedWeek, availableWeeks } = getState();
  const container = document.getElementById('view-weekly');
  if (!container) return;

  const report = weeklyReports[selectedWeek];

  // Week selector tabs
  const weekTabs = availableWeeks.map(w => `
    <button class="week-selector__btn${w === selectedWeek ? ' week-selector__btn--active' : ''}"
            data-week="${w}">
      ${w}${weeklyReports[w]?.partial ? ' (partial)' : ''}
    </button>
  `).join('');

  if (!report) {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-header__title">Weekly Synthesis</h1>
        <p class="page-header__subtitle">AI-generated performance analysis</p>
      </div>
      <div class="week-selector">${weekTabs}</div>
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__message">No report available for this week</div>
      </div>
    `;
    attachWeekSelector(container);
    return;
  }

  // Highlight icons by type
  const highlightIcons = {
    growth: '📈',
    engagement: '🔥',
    milestone: '🏆',
    performance: '⚡',
  };

  const highlightsHtml = report.highlights?.map(h => `
    <div class="weekly__highlight">
      <span class="weekly__highlight-icon">${highlightIcons[h.type] || '✦'}</span>
      <div class="weekly__highlight-content">
        <div class="weekly__highlight-value">
          <span class="badge badge--${h.platform}">${platformName(h.platform)}</span>
          ${h.value}
        </div>
        <div class="weekly__highlight-context">${h.context}</div>
      </div>
    </div>
  `).join('') || '';

  const concernsHtml = report.concerns?.length ? `
    <div class="section">
      <h3 class="section__title">Concerns</h3>
      ${report.concerns.map(c => `
        <div class="weekly__highlight">
          <span class="weekly__highlight-icon">⚠️</span>
          <div class="weekly__highlight-content">
            <div class="weekly__highlight-value">
              <span class="badge badge--${c.platform}">${platformName(c.platform)}</span>
            </div>
            <div class="weekly__highlight-context">${c.issue}</div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const recommendationsHtml = report.recommendations?.length ? `
    <div class="section">
      <h3 class="section__title">Recommendations</h3>
      <ul class="weekly__recommendations">
        ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  // Platform scores
  const scoresHtml = report.platform_scores ? `
    <div class="section">
      <h3 class="section__title">Platform Scores</h3>
      <div class="weekly__scores">
        ${Object.entries(report.platform_scores).map(([platform, data]) => {
          const scoreClass = data.score >= 8 ? 'high' : data.score >= 5 ? 'medium' : 'low';
          const trendArrow = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';
          return `
            <div class="weekly__score-item">
              <span class="weekly__score-platform">${platformName(platform)}</span>
              <span class="score-badge score-badge--${scoreClass}">${data.score}</span>
              <span class="weekly__score-note">${trendArrow} ${data.note}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Weekly Synthesis</h1>
      <p class="page-header__subtitle">AI-generated performance analysis</p>
    </div>

    <div class="week-selector">${weekTabs}</div>

    <div class="weekly__report">
      <div class="weekly__report-header">
        <h2 class="weekly__report-title">Week of ${report.range.start} — ${report.range.end}</h2>
        <div>
          <span class="weekly__report-date">Generated ${new Date(report.generated_at).toLocaleDateString()}</span>
          ${report.partial ? '<span class="weekly__partial-badge">Partial Week</span>' : ''}
        </div>
      </div>

      <!-- AI Summary -->
      <div class="prose">
        ${report.summary.split('\n\n').map(p => `<p>${p}</p>`).join('')}
      </div>
    </div>

    <!-- Highlights -->
    <div class="section">
      <h3 class="section__title">Highlights</h3>
      <div class="weekly__highlights">
        ${highlightsHtml}
      </div>
    </div>

    ${concernsHtml}
    ${recommendationsHtml}
    ${scoresHtml}
  `;

  attachWeekSelector(container);
}

function attachWeekSelector(container) {
  container.querySelectorAll('[data-week]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await loadWeek(btn.dataset.week);
      render();
    });
  });
}

registerView('weekly', render);
export { render as renderWeekly };
