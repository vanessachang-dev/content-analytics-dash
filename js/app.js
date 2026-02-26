/* ============================================
   App Entry Point
   Initializes navigation, state, and router.
   ============================================ */

import { renderTopNav, renderBottomNav } from './components/nav.js';
import { initData, subscribe, getState } from './state.js';
import { initRouter } from './router.js';

// Import views (they self-register via registerView)
import './views/snapshot.js';
import './views/weekly.js';
import './views/platform.js';
import './views/content-log.js';

async function init() {
  const app = document.getElementById('app');

  // Render shell with loading state
  app.innerHTML = `
    ${renderTopNav()}
    <main class="main">
      <div class="loading">
        <div class="loading__spinner"></div>
      </div>

      <!-- View containers (router shows/hides these) -->
      <div id="view-snapshot" class="view"></div>
      <div id="view-weekly" class="view"></div>
      <div id="view-platform" class="view"></div>
      <div id="view-content-log" class="view"></div>
    </main>
    ${renderBottomNav()}
  `;

  // Load all data
  await initData();

  // Remove loading spinner
  const loader = app.querySelector('.loading');
  if (loader) loader.remove();

  // Start router (renders the initial view)
  initRouter();
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
