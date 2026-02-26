/* ============================================
   Alert Service
   Evaluates current data against threshold rules.
   For Phase 1: just loads pre-computed alerts from JSON.
   ============================================ */

import { loadAlerts } from './data-loader.js';

let cachedAlerts = null;

/** Get active alerts, sorted by severity (critical first). */
export async function getActiveAlerts() {
  if (cachedAlerts) return cachedAlerts;

  const alerts = await loadAlerts();
  if (!alerts) return [];

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  cachedAlerts = alerts.sort((a, b) =>
    (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );
  return cachedAlerts;
}

/** Clear cached alerts (call when data refreshes). */
export function clearAlertCache() {
  cachedAlerts = null;
}

/** Get severity icon. */
export function severityIcon(severity) {
  switch (severity) {
    case 'critical': return '🔴';
    case 'warning':  return '🟡';
    case 'info':     return '🔵';
    default:         return '⚪';
  }
}
