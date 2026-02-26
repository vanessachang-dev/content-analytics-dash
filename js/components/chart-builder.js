/* ============================================
   Chart Builder
   Thin wrapper around Chart.js for consistent styling.
   ============================================ */

// Chart.js is loaded via CDN in index.html
// We access it as the global `Chart` variable.

const PLATFORM_COLORS = {
  youtube:   '#ff4444',
  linkedin:  '#0a66c2',
  instagram: '#e1306c',
  beehiiv:   '#f59e0b',
  tiktok:    '#00f2ea',
};

/** Shared Chart.js defaults for dark theme. */
function getDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#e8e8f0',
        bodyColor: '#9ca3b4',
        borderColor: '#2a2a4a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: '600' },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(42, 42, 74, 0.5)', drawBorder: false },
        ticks: { color: '#5a6275', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(42, 42, 74, 0.5)', drawBorder: false },
        ticks: { color: '#5a6275', font: { size: 11 } },
      },
    },
  };
}

/**
 * Create a line chart.
 *
 * @param {string} canvasId - ID of the canvas element
 * @param {Object} opts
 * @param {string[]} opts.labels - X-axis labels
 * @param {Object[]} opts.datasets - Array of { label, data, platform? }
 * @param {boolean} [opts.showLegend] - Show legend
 */
export function createLineChart(canvasId, { labels, datasets, showLegend = false }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Destroy existing chart on same canvas
  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  const defaults = getDefaults();
  defaults.plugins.legend.display = showLegend;

  const chartDatasets = datasets.map((ds, i) => {
    const color = ds.platform ? PLATFORM_COLORS[ds.platform] : `hsl(${240 + i * 30}, 70%, 65%)`;
    return {
      label: ds.label,
      data: ds.data,
      borderColor: color,
      backgroundColor: color + '20',
      fill: datasets.length === 1, // Fill only for single-line charts
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
    };
  });

  return new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: chartDatasets },
    options: defaults,
  });
}

/**
 * Create a bar chart.
 */
export function createBarChart(canvasId, { labels, datasets, showLegend = false }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const existing = Chart.getChart(canvas);
  if (existing) existing.destroy();

  const defaults = getDefaults();
  defaults.plugins.legend.display = showLegend;

  const chartDatasets = datasets.map((ds, i) => {
    const color = ds.platform ? PLATFORM_COLORS[ds.platform] : `hsl(${240 + i * 30}, 70%, 65%)`;
    return {
      label: ds.label,
      data: ds.data,
      backgroundColor: color + '80',
      borderColor: color,
      borderWidth: 1,
      borderRadius: 4,
    };
  });

  return new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: chartDatasets },
    options: defaults,
  });
}

/** Get platform color by key. */
export function getPlatformColor(platform) {
  return PLATFORM_COLORS[platform] || '#6366f1';
}
