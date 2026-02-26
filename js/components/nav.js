/* ============================================
   Navigation Component
   Renders top (desktop) and bottom (mobile) navs.
   ============================================ */

const NAV_ITEMS = [
  { hash: 'today',    label: 'Today',     icon: '⚡' },
  { hash: 'weekly',   label: 'Weekly',    icon: '📊' },
  { hash: 'platform', label: 'Platforms', icon: '🔍' },
  { hash: 'content',  label: 'Content',   icon: '📝' },
];

/** Render the top navigation bar (desktop). */
export function renderTopNav() {
  const links = NAV_ITEMS.map(item => `
    <li>
      <a href="#${item.hash}" class="nav-top__link" data-nav="${item.hash}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  return `
    <nav class="nav-top">
      <div class="nav-top__inner">
        <a href="#today" class="nav-top__brand">Content Analytics</a>
        <ul class="nav-top__links">${links}</ul>
      </div>
    </nav>
  `;
}

/** Render the bottom navigation bar (mobile). */
export function renderBottomNav() {
  const links = NAV_ITEMS.map(item => `
    <li>
      <a href="#${item.hash}" class="nav-bottom__link" data-nav="${item.hash}">
        <span class="nav-bottom__icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  return `
    <nav class="nav-bottom">
      <ul class="nav-bottom__links">${links}</ul>
    </nav>
  `;
}
