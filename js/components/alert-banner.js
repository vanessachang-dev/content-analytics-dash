/* ============================================
   Alert Banner Component
   Displays active alerts at top of page.
   ============================================ */

import { severityIcon } from '../services/alerts.js';
import { formatRelativeTime } from '../utils.js';

/**
 * Render alert banner HTML from an array of alerts.
 * Returns empty string if no alerts.
 */
export function alertBanner(alerts) {
  if (!alerts || alerts.length === 0) return '';

  const items = alerts.map(alert => `
    <div class="alert-item alert-item--${alert.severity}">
      <span class="alert-item__icon">${severityIcon(alert.severity)}</span>
      <span class="alert-item__message">${alert.message}</span>
      <span class="alert-item__time">${formatRelativeTime(alert.triggered_at)}</span>
    </div>
  `).join('');

  return `<div class="alert-banner">${items}</div>`;
}
