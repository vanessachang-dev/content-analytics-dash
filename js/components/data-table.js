/* ============================================
   Data Table Component
   Sortable table with mobile card fallback.
   ============================================ */

/**
 * Create a sortable data table.
 *
 * @param {Object} opts
 * @param {string} opts.id - Table wrapper ID
 * @param {Object[]} opts.columns - Array of { key, label, format?, align? }
 * @param {Object[]} opts.rows - Array of row data objects
 * @param {string} [opts.sortKey] - Initial sort column key
 * @param {string} [opts.sortDir] - 'asc' or 'desc' (default: 'desc')
 * @param {boolean} [opts.responsive] - Enable mobile card layout (default: true)
 */
export function dataTable({ id, columns, rows, sortKey, sortDir = 'desc', responsive = true }) {
  let sortedRows = sortRows(rows, sortKey, sortDir);

  function sortRows(data, key, dir) {
    if (!key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[key] ?? 0;
      const bVal = b[key] ?? 0;
      if (typeof aVal === 'string') {
        return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  function renderHeader() {
    return columns.map(col => {
      const isActive = col.key === sortKey;
      const arrow = isActive ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
      const activeClass = isActive ? 'sort-icon--active' : '';
      return `<th data-sort-key="${col.key}" style="text-align: ${col.align || 'left'}">
        ${col.label} <span class="sort-icon ${activeClass}">${arrow}</span>
      </th>`;
    }).join('');
  }

  function renderRow(row) {
    return columns.map(col => {
      const raw = row[col.key];
      const formatted = col.format ? col.format(raw, row) : (raw ?? '—');
      const className = col.className ? ` class="${col.className}"` : '';
      return `<td data-label="${col.label}"${className} style="text-align: ${col.align || 'left'}">${formatted}</td>`;
    }).join('');
  }

  const html = `
    <div class="data-table-wrapper${responsive ? ' data-table-wrapper--responsive' : ''}" id="${id}">
      <table class="data-table">
        <thead><tr>${renderHeader()}</tr></thead>
        <tbody>
          ${sortedRows.map(row => `<tr>${renderRow(row)}</tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  return {
    html,
    /** Call after inserting HTML into DOM to wire up sort handlers. */
    attach() {
      const wrapper = document.getElementById(id);
      if (!wrapper) return;

      wrapper.querySelectorAll('th[data-sort-key]').forEach(th => {
        th.addEventListener('click', () => {
          const key = th.dataset.sortKey;
          if (sortKey === key) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            sortKey = key;
            sortDir = 'desc';
          }

          sortedRows = sortRows(rows, sortKey, sortDir);

          // Re-render header
          wrapper.querySelector('thead tr').innerHTML = renderHeader();

          // Re-render body
          wrapper.querySelector('tbody').innerHTML =
            sortedRows.map(row => `<tr>${renderRow(row)}</tr>`).join('');

          // Re-attach handlers (recursive but bounded)
          this.attach();
        });
      });
    }
  };
}
