/* ============================================
   Formatting Utilities
   ============================================ */

/**
 * Format a number with commas: 1234567 → "1,234,567"
 */
export function formatNumber(n) {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
}

/**
 * Format a number compactly: 1234 → "1.2K", 1234567 → "1.2M"
 */
export function formatCompact(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

/**
 * Format a percentage: 0.482 → "48.2%"
 */
export function formatPercent(n) {
  if (n == null) return '—';
  return (n * 100).toFixed(1) + '%';
}

/**
 * Format a duration in seconds: 174 → "2:54"
 */
export function formatDuration(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format a date string: "2026-02-26" → "Feb 26"
 */
export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date string for headers: "2026-02-26" → "Wednesday, Feb 26"
 */
export function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

/**
 * Relative time: ISO string → "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateShort(isoStr.slice(0, 10));
}

/**
 * Calculate percentage change between two values.
 * Returns { value: number, direction: 'positive'|'negative'|'neutral' }
 */
export function calcDelta(current, previous) {
  if (previous == null || previous === 0 || current == null) {
    return { value: 0, direction: 'neutral', formatted: '—' };
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const direction = pct > 0.5 ? 'positive' : pct < -0.5 ? 'negative' : 'neutral';
  const sign = pct > 0 ? '+' : '';
  return {
    value: pct,
    direction,
    formatted: `${sign}${pct.toFixed(1)}%`
  };
}

/**
 * Get the platform display name.
 */
export function platformName(key) {
  const names = {
    youtube: 'YouTube',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    beehiiv: 'Beehiiv',
    tiktok: 'TikTok'
  };
  return names[key] || key;
}

/**
 * Get the platform icon (emoji for now — swap for SVG icons later).
 */
export function platformIcon(key) {
  const icons = {
    youtube: '▶',
    linkedin: '◼',
    instagram: '◉',
    beehiiv: '✉',
    tiktok: '♪'
  };
  return icons[key] || '•';
}
