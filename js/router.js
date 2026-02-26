/* ============================================
   Hash-based SPA Router
   Maps URL hashes to view modules.
   ============================================ */

const routes = {
  '':        'snapshot',  // default
  'today':   'snapshot',
  'weekly':  'weekly',
  'platform':'platform',
  'content': 'content-log',
};

/** Currently active view name. */
let activeView = null;

/** Registered view render functions: { viewName: renderFn } */
const views = {};

/**
 * Register a view with its render function.
 * Called by each view module during init.
 */
export function registerView(name, renderFn) {
  views[name] = renderFn;
}

/** Get the current hash without the # symbol. */
function getHash() {
  return window.location.hash.replace('#', '').toLowerCase();
}

/** Navigate to a hash route. */
export function navigate(hash) {
  window.location.hash = hash;
}

/** Resolve hash → view name and render it. */
function resolveRoute() {
  const hash = getHash();
  const viewName = routes[hash] || 'snapshot';

  if (viewName === activeView) return;
  activeView = viewName;

  // Hide all views, show the active one
  document.querySelectorAll('.view').forEach(el => {
    el.classList.remove('view--active');
  });

  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) {
    viewEl.classList.add('view--active');
  }

  // Update nav active states
  document.querySelectorAll('[data-nav]').forEach(el => {
    const navTarget = routes[el.dataset.nav] || el.dataset.nav;
    el.classList.toggle('nav-top__link--active', navTarget === viewName);
    el.classList.toggle('nav-bottom__link--active', navTarget === viewName);
  });

  // Call the view's render function if registered
  if (views[viewName]) {
    views[viewName]();
  }
}

/** Initialize the router. Call once after DOM is ready. */
export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute(); // handle initial load
}

/** Get the active view name. */
export function getActiveView() {
  return activeView;
}
