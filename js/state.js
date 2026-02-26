/* ============================================
   State Manager
   Loads all data on init, provides to views.
   Simple reactive store — no framework needed.
   ============================================ */

import { loadDays, loadRolling90, loadWeeklyReport, loadContentLog, getDateRange, getAvailableWeeks } from './services/data-loader.js';
import { getActiveAlerts, clearAlertCache } from './services/alerts.js';

const state = {
  // Data
  today: null,
  yesterday: null,
  weekDays: [],
  rolling90: null,
  weeklyReports: {},
  contentLog: [],
  alerts: [],
  availableWeeks: [],

  // UI state
  loading: true,
  error: null,
  selectedWeek: null,
  selectedPlatform: 'youtube',
};

/** Subscribers get called whenever state updates. */
const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach(fn => fn(state));
}

/** Read current state (immutable access). */
export function getState() {
  return state;
}

/** Update a piece of state and notify subscribers. */
export function setState(updates) {
  Object.assign(state, updates);
  notify();
}

/** Load all initial data. Called once at app start. */
export async function initData() {
  try {
    state.loading = true;
    notify();

    // Fetch last 7 days + rolling 90 + alerts in parallel
    const dates = getDateRange(7);
    const [days, rolling90, alerts, contentLog] = await Promise.all([
      loadDays(dates),
      loadRolling90(),
      getActiveAlerts(),
      loadContentLog(),
    ]);

    state.weekDays = days;
    state.today = days[days.length - 1] || null;
    state.yesterday = days[days.length - 2] || null;
    state.rolling90 = rolling90;
    state.alerts = alerts;
    state.contentLog = contentLog || [];

    // Load available weeks
    state.availableWeeks = getAvailableWeeks();
    state.selectedWeek = state.availableWeeks[0] || null;

    // Load the most recent weekly report
    if (state.selectedWeek) {
      const report = await loadWeeklyReport(state.selectedWeek);
      if (report) {
        state.weeklyReports[state.selectedWeek] = report;
      }
    }

    state.loading = false;
    state.error = null;
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    console.error('[state] Init failed:', err);
  }

  notify();
}

/** Load a specific weekly report (lazy load on navigation). */
export async function loadWeek(weekId) {
  if (state.weeklyReports[weekId]) {
    setState({ selectedWeek: weekId });
    return;
  }

  const report = await loadWeeklyReport(weekId);
  if (report) {
    state.weeklyReports[weekId] = report;
  }
  setState({ selectedWeek: weekId });
}
