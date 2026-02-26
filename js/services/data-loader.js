/* ============================================
   Data Loader
   Fetches JSON from mock/ or data/ directory.
   Switch USE_MOCK to false for real data.
   ============================================ */

const USE_MOCK = true;
const BASE_PATH = USE_MOCK ? './mock' : './data';

/** Simple fetch wrapper with error handling. */
async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return await res.json();
  } catch (err) {
    console.warn(`[data-loader] Failed to load ${path}:`, err.message);
    return null;
  }
}

/** Load a single day's metrics. */
export function loadDay(date) {
  return fetchJSON(`${BASE_PATH}/daily/${date}.json`);
}

/** Load multiple days of metrics. */
export async function loadDays(dates) {
  const results = await Promise.all(dates.map(d => loadDay(d)));
  return results.filter(Boolean);
}

/** Load the rolling 90-day consolidated data. */
export function loadRolling90() {
  return fetchJSON(`${BASE_PATH}/daily/rolling-90.json`);
}

/** Load a weekly synthesis report. */
export function loadWeeklyReport(weekId) {
  return fetchJSON(`${BASE_PATH}/weekly/${weekId}.json`);
}

/** Load the content performance log. */
export function loadContentLog() {
  return fetchJSON(`${BASE_PATH}/content/posts.json`);
}

/** Load active alerts. */
export function loadAlerts() {
  return fetchJSON(`${BASE_PATH}/alerts/active.json`);
}

/** Load alert thresholds config. */
export function loadThresholds() {
  return fetchJSON(`${BASE_PATH}/config/thresholds.json`);
}

/**
 * Get the last N dates as YYYY-MM-DD strings ending at `endDate`.
 * Useful for building date ranges to fetch.
 */
export function getDateRange(count, endDate = new Date()) {
  const dates = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * List available weekly report IDs from mock data.
 * In production, this would scan the weekly/ directory.
 */
export function getAvailableWeeks() {
  return ['2026-W09', '2026-W08'];
}
