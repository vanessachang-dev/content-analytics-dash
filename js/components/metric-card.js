/* ============================================
   Metric Card Component
   Displays a value, label, delta, and sparkline.
   ============================================ */

import { formatNumber, formatCompact, formatPercent, formatDuration, calcDelta } from '../utils.js';

/**
 * Create a metric card HTML string.
 *
 * @param {Object} opts
 * @param {string} opts.label - Metric name ("Views", "Subscribers", etc.)
 * @param {number} opts.value - Current value
 * @param {number} [opts.previousValue] - Previous value (for delta calculation)
 * @param {string} [opts.format] - 'number'|'compact'|'percent'|'duration' (default: 'number')
 * @param {number[]} [opts.sparklineData] - Array of values for sparkline
 * @param {string} [opts.icon] - Emoji or icon string
 * @param {boolean} [opts.large] - Use large card variant
 */
export function metricCard({ label, value, previousValue, format = 'number', sparklineData, icon, large = false }) {
  const formatFn = {
    number: formatNumber,
    compact: formatCompact,
    percent: formatPercent,
    duration: formatDuration,
  }[format] || formatNumber;

  const formattedValue = formatFn(value);
  const delta = calcDelta(value, previousValue);
  const deltaArrow = delta.direction === 'positive' ? '↑' : delta.direction === 'negative' ? '↓' : '';

  const sparklineId = `sparkline-${label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

  return `
    <div class="metric-card${large ? ' metric-card--large' : ''}">
      <div class="metric-card__header">
        <span class="metric-card__label">${label}</span>
        ${icon ? `<span class="metric-card__icon">${icon}</span>` : ''}
      </div>
      <div class="metric-card__value">${formattedValue}</div>
      <div class="metric-card__footer">
        <span class="metric-card__delta metric-card__delta--${delta.direction}">
          ${deltaArrow} ${delta.formatted}
        </span>
        ${sparklineData ? `<canvas class="metric-card__sparkline" id="${sparklineId}" data-sparkline='${JSON.stringify(sparklineData)}'></canvas>` : ''}
      </div>
    </div>
  `;
}

/**
 * Render all sparklines on the page.
 * Call after inserting metric cards into the DOM.
 * Uses tiny Canvas API — no Chart.js needed for sparklines.
 */
export function renderSparklines() {
  document.querySelectorAll('.metric-card__sparkline[data-sparkline]').forEach(canvas => {
    const data = JSON.parse(canvas.dataset.sparkline);
    if (!data || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    // Normalize values to canvas coordinates
    const points = data.map((v, i) => ({
      x: padding + (i / (data.length - 1)) * (w - padding * 2),
      y: padding + (1 - (v - min) / range) * (h - padding * 2),
    }));

    // Draw fill
    const style = getComputedStyle(document.documentElement);
    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = style.getPropertyValue('--color-sparkline-fill').trim();
    ctx.fill();

    // Draw line
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = style.getPropertyValue('--color-sparkline').trim();
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // End dot
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = style.getPropertyValue('--color-sparkline').trim();
    ctx.fill();

    // Clean up data attribute
    canvas.removeAttribute('data-sparkline');
  });
}
