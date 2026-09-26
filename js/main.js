/* ════════════════════════════════════════════
   MAIN.JS — Portfolio site core script
════════════════════════════════════════════ */

const GITHUB_USER = 'ratnajagadeesharava';
const EXCLUDE_REPOS = ['ratnajagadeesharava.github.io', 'Ratnajagadeesharava'];
const CUSTOM_DESCS = {
  'redis-rust':             'Redis server implementation from scratch in Rust — supports key/value, TTL, and RDB persistence.',
  'shell-rust':             'Unix shell built from the ground up in Rust — pipes, redirects, builtins, and signal handling.',
  'ray-tracing':            'Physically-based ray tracer in Rust with BVH acceleration, multi-threading, and multiple material types.',
  'computer-graphics':      'Implementing the PBRT book in Rust — a deep dive into physically based rendering theory.',
  'trinetra-engine':        'Custom game engine built with C++ and OpenGL featuring ECS architecture and deferred rendering.',
  'unity_adventures':       'Game prototypes and experiments in Unity3D — mechanics research and rapid prototyping.',
  'whatsapp_erp_attendance':'Automated attendance tracking system via WhatsApp for IIT Bhubaneswar.',
  'knn_iBhubs':             'K-Nearest Neighbors algorithm implementation and visualization in Python.',
};
// Used only when the GitHub API is unavailable (rate limit / offline)
const FALLBACK_LANGS = {
  'redis-rust': 'Rust', 'shell-rust': 'Rust', 'ray-tracing': 'Rust', 'computer-graphics': 'Rust',
  'trinetra-engine': 'C++', 'unity_adventures': 'C#', 'knn_iBhubs': 'Python',
};
const LANG_COLORS = {
  'Rust':'#dea584','C++':'#f34b7d','C':'#555555','C#':'#178600',
  'TypeScript':'#3178c6','JavaScript':'#f1e05a','Python':'#3572A5',
  'GLSL':'#5686a5','HTML':'#e34c26','CSS':'#563d7c',
};

/* ── Theme ─────────────────────────────────── */
// The initial theme is applied by an inline script in <head> to avoid a flash.
const themeToggle = document.getElementById('theme-toggle');
updateThemeIcon(document.documentElement.getAttribute('data-theme') || 'dark');

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === 'dark'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  themeToggle.title = label;
  themeToggle.setAttribute('aria-label', label);
}

/* ── Nav scroll / active ────────────────────── */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    onScroll();
    scrollTicking = false;
  });
}, { passive: true });

function onScroll() {
  nav?.classList.toggle('scrolled', window.scrollY > 50);
  updateScrollProgress();
  updateActiveNav();
  toggleBackToTop();
  animateLearningBars();
}

function updateScrollProgress() {
  const el = document.getElementById('scroll-progress');
  if (!el) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = max > 0 ? (window.scrollY / max) * 100 : 0;
  el.style.width = Math.min(scrolled, 100) + '%';
}

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

/* ── Mobile nav ─────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navLinksEl = document.getElementById('nav-links');

navToggle?.setAttribute('aria-expanded', 'false');
navToggle?.setAttribute('aria-controls', 'nav-links');

function setMobileNav(open) {
  document.body.classList.toggle('nav-open', open);
  navLinksEl?.classList.toggle('open', open);
  navToggle?.setAttribute('aria-expanded', String(open));
}

navToggle?.addEventListener('click', () => {
  setMobileNav(!navLinksEl?.classList.contains('open'));
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => setMobileNav(false));
});

/* ── Smooth scroll for anchor links ─────────── */
document.addEventListener('click', e => {
  const a = e.target.closest?.('a[href^="#"]');
  if (!a) return;
  const target = findHashTarget(a.getAttribute('href'));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  }
});

function findHashTarget(hash) {
  if (!hash || hash === '#') return null;
  try { return document.querySelector(hash); } catch (e) { return null; }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── Scroll reveal ──────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Back to top ────────────────────────────── */
const backToTop = document.getElementById('back-to-top');
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));

function toggleBackToTop() {
  backToTop?.classList.toggle('visible', window.scrollY > 500);
}


/* ── Learning progress bars ─────────────────── */
let learningAnimated = false;

function animateLearningBars() {
  if (learningAnimated) return;
  const section = document.getElementById('learning');
  if (!section) return;
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.8) {
    learningAnimated = true;
    document.querySelectorAll('.learning-progress-bar').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }
}

/* ── GitHub Projects ────────────────────────── */
const REPO_CACHE_KEY = 'gh-repos-v1';
const REPO_CACHE_TTL = 60 * 60 * 1000; // 1 hour — keeps us well under the unauthenticated API limit

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let repos = readRepoCache();
  if (!repos) {
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
      if (!res.ok) throw new Error('API error ' + res.status);
      repos = await res.json();
      writeRepoCache(repos);
    } catch (err) {
      // Rate-limited or offline: fall back to the curated list so the section is never empty
      repos = Object.keys(CUSTOM_DESCS).map(name => ({
        name, fork: false, language: FALLBACK_LANGS[name] || null, stargazers_count: 0, pushed_at: null,
        html_url: `https://github.com/${GITHUB_USER}/${name}`,
      }));
    }
  }

  const filtered = repos
    .filter(r => !r.fork && Object.prototype.hasOwnProperty.call(CUSTOM_DESCS, r.name))
    .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0));

  if (!filtered.length) {
    grid.innerHTML = `<p class="projects-error">No projects found. <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener" style="color:var(--accent)">View on GitHub →</a></p>`;
    return;
  }

  window._allProjects = filtered;
  renderProjects(filtered);
  setupProjectFilters(filtered);
}

function readRepoCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(REPO_CACHE_KEY));
    if (cached && Date.now() - cached.t < REPO_CACHE_TTL) return cached.repos;
  } catch (e) {}
  return null;
}

function writeRepoCache(repos) {
  try {
    const slim = repos.map(({ name, fork, language, stargazers_count, pushed_at, html_url, description }) =>
      ({ name, fork, language, stargazers_count, pushed_at, html_url, description }));
    sessionStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ t: Date.now(), repos: slim }));
  } catch (e) {}
}

function setupProjectFilters(repos) {
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))];
  const bar = document.getElementById('filter-bar');
  if (!bar) return;
  if (langs.length < 2) { bar.hidden = true; return; }

  const allBtn = bar.querySelector('[data-lang="all"]');
  allBtn?.addEventListener('click', () => {
    setActiveFilter(allBtn);
    renderProjects(window._allProjects);
  });

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.lang = lang;
    btn.innerHTML = `<span class="lang-dot" style="background:${LANG_COLORS[lang]||'#8b8b8b'};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:4px;"></span>${esc(lang)}`;
    btn.addEventListener('click', () => {
      setActiveFilter(btn);
      renderProjects(window._allProjects.filter(r => r.language === lang));
    });
    bar.appendChild(btn);
  });
}

function setActiveFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b === btn);
    b.setAttribute('aria-pressed', String(b === btn));
  });
}

function renderProjects(repos) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (!repos.length) {
    grid.innerHTML = '<p class="projects-error">No projects found for this filter.</p>';
    return;
  }

  grid.innerHTML = repos.map(repo => {
    const desc = CUSTOM_DESCS[repo.name] || repo.description || '';
    const lang = repo.language;
    const color = LANG_COLORS[lang] || '#8b8b8b';
    const updated = repo.pushed_at
      ? 'Updated ' + new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'On GitHub';
    const name = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return `<a href="${esc(repo.html_url)}" target="_blank" rel="noopener" class="project-card reveal">
      <div class="project-card-top">
        <span class="project-lang">
          ${lang ? `<span class="lang-dot" style="background:${color}"></span>${esc(lang)}` : ''}
        </span>
        ${repo.stargazers_count > 0 ? `<span class="project-stars">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${repo.stargazers_count}
        </span>` : ''}
      </div>
      <h3>${esc(name)}</h3>
      <p>${esc(desc)}</p>
      <div class="project-footer">
        <span>${esc(updated)}</span>
        <span class="project-link">View →</span>
      </div>
    </a>`;
  }).join('');

  // Re-observe new cards
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── Blog preview on index ──────────────────── */
async function loadBlogPreview() {
  const grid = document.getElementById('blog-preview-grid');
  if (!grid) return;

  try {
    const res = await fetch('data/posts.json');
    const posts = sortPostsByDate(await res.json());
    grid.innerHTML = posts.slice(0, 3).map(post => blogCard(post)).join('');
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--text-muted)">Could not load posts.</p>';
  }
}

function blogCard(post) {
  const tagHtml = post.tags.slice(0, 2).map(t =>
    `<span class="blog-tag blog-tag-${getCategoryClass(t)}">${esc(t)}</span>`
  ).join('');
  const d = formatPostDate(post.date, 'short');
  return `<a href="post.html?id=${encodeURIComponent(post.id)}" class="blog-card reveal">
    <div class="blog-card-meta">
      ${tagHtml}
      <span class="blog-date">${d}</span>
      <span class="blog-read-time">${post.readTime} min</span>
    </div>
    <h3>${esc(post.title)}</h3>
    <p>${esc(post.excerpt)}</p>
    <div class="blog-card-footer">
      <span>Read article →</span>
    </div>
  </a>`;
}

function sortPostsByDate(posts) {
  return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Post dates are plain YYYY-MM-DD strings; format them in UTC so they never shift a day.
function formatPostDate(date, month = 'long') {
  return new Date(date).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function getCategoryClass(tag) {
  const map = {
    'Rust':'rust','Angular':'web','RxJS':'web','TypeScript':'web','Frontend':'web',
    'C++':'systems','OpenGL':'graphics','Graphics':'graphics','Ray Tracing':'graphics',
    'Game Engine':'graphics','AI':'ai','LLMs':'ai','Career':'career','Systems':'systems',
    'Math':'math',
  };
  return map[tag] || 'web';
}

/* ── Command Palette ────────────────────────── */
const cmdOverlay = document.getElementById('cmd-palette');
const cmdInput = document.getElementById('cmd-input');
const cmdResults = document.getElementById('cmd-results');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
let cmdFocusIdx = -1;
let cmdVisible = [];      // items currently rendered, in display order
let cmdLastFocus = null;  // element to restore focus to on close

const CMD_ITEMS = [
  { type: 'nav', label: 'About', icon: 'user', href: '#about' },
  { type: 'nav', label: 'Experience', icon: 'briefcase', href: '#experience' },
  { type: 'nav', label: 'Projects', icon: 'code', href: '#projects' },
  { type: 'nav', label: 'Blog', icon: 'edit', href: 'blog.html' },
  { type: 'nav', label: 'Skills', icon: 'zap', href: '#skills' },
  { type: 'nav', label: 'Contact', icon: 'mail', href: '#contact' },
  { type: 'action', label: 'Toggle Theme', icon: 'sun', action: () => themeToggle?.click() },
  { type: 'action', label: 'Download Resume', icon: 'download', action: () => { const a = document.createElement('a'); a.href = 'Ratna_Jagadeesh_CV_2024.pdf'; a.download = ''; a.click(); } },
  { type: 'action', label: 'Copy Email Address', icon: 'mail', action: () => copyText('ratnajagadeesh@outlook.in', 'Email copied!') },
  { type: 'link', label: 'GitHub', icon: 'github', href: 'https://github.com/ratnajagadeesharava', external: true },
  { type: 'link', label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/ratna-jagadeesh-arava/', external: true },
];
const CMD_GROUPS = { nav: 'Navigation', action: 'Actions', link: 'Links', blog: 'Blog Posts' };

let cmdPostItems = [];

async function loadCmdPosts() {
  if (!cmdOverlay) return;
  try {
    const res = await fetch('data/posts.json');
    const posts = sortPostsByDate(await res.json());
    cmdPostItems = posts.map(p => ({
      type: 'blog', label: p.title, icon: 'edit', keywords: p.tags.join(' '),
      href: `post.html?id=${encodeURIComponent(p.id)}`
    }));
    if (cmdOverlay.classList.contains('open')) renderCmdResults(cmdInput.value.trim().toLowerCase());
  } catch (e) {}
}
loadCmdPosts();

document.querySelectorAll('#cmd-trigger .cmd-kbd').forEach(el => { el.textContent = isMac ? '⌘K' : 'Ctrl K'; });
document.getElementById('cmd-trigger')?.addEventListener('click', openCmd);

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    cmdOverlay?.classList.contains('open') ? closeCmd() : openCmd();
    return;
  }
  if (e.key === 'Escape') {
    if (cmdOverlay?.classList.contains('open')) closeCmd();
    else if (navLinksEl?.classList.contains('open')) setMobileNav(false);
    return;
  }
  if (cmdOverlay?.classList.contains('open')) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); moveFocus(-1); }
    if (e.key === 'Enter')     { e.preventDefault(); activateFocused(); }
  }
});

cmdOverlay?.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmd(); });

function openCmd() {
  if (!cmdOverlay) return;
  cmdLastFocus = document.activeElement;
  cmdOverlay.classList.add('open');
  cmdOverlay.setAttribute('aria-hidden', 'false');
  cmdInput.value = '';
  renderCmdResults('');
  requestAnimationFrame(() => cmdInput?.focus());
}

function closeCmd() {
  if (!cmdOverlay?.classList.contains('open')) return;
  cmdOverlay.classList.remove('open');
  cmdOverlay.setAttribute('aria-hidden', 'true');
  cmdFocusIdx = -1;
  cmdLastFocus?.focus?.();
}

cmdInput?.addEventListener('input', () => renderCmdResults(cmdInput.value.trim().toLowerCase()));

function renderCmdResults(query) {
  const all = [...CMD_ITEMS, ...cmdPostItems];
  const matches = query
    ? all.filter(i => (i.label + ' ' + (i.keywords || '')).toLowerCase().includes(query))
    : all;

  // Order by group so keyboard focus index matches what's on screen
  cmdVisible = Object.keys(CMD_GROUPS).flatMap(type => matches.filter(i => i.type === type));
  cmdFocusIdx = cmdVisible.length ? 0 : -1;

  if (!cmdVisible.length) {
    cmdResults.innerHTML = `<p class="cmd-empty">No results for "${esc(query)}"</p>`;
    return;
  }

  let idx = 0;
  cmdResults.innerHTML = Object.entries(CMD_GROUPS).map(([type, group]) => {
    const items = cmdVisible.filter(i => i.type === type);
    if (!items.length) return '';
    return `<p class="cmd-section-header">${group}</p>` + items.map(item =>
      `<div class="cmd-item${idx === 0 ? ' focused' : ''}" data-idx="${idx++}" role="option">
        ${iconSvg(item.icon)}
        <span>${esc(item.label)}</span>
      </div>`
    ).join('');
  }).join('');

  cmdResults.querySelectorAll('.cmd-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = cmdVisible[Number(el.dataset.idx)];
      closeCmd();
      executeCmd(item);
    });
  });
}

function executeCmd(item) {
  if (!item) return;
  if (item.action) { item.action(); return; }
  if (item.external) { window.open(item.href, '_blank', 'noopener'); return; }
  if (item.href?.startsWith('#')) {
    const target = findHashTarget(item.href);
    // Section links only exist on the home page; jump there from blog/post pages
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    else window.location.href = 'index.html' + item.href;
  } else if (item.href) {
    window.location.href = item.href;
  }
}

function moveFocus(dir) {
  const items = cmdResults.querySelectorAll('.cmd-item');
  if (!items.length) return;
  items[cmdFocusIdx]?.classList.remove('focused');
  cmdFocusIdx = (cmdFocusIdx + dir + items.length) % items.length;
  items[cmdFocusIdx].classList.add('focused');
  items[cmdFocusIdx].scrollIntoView({ block: 'nearest' });
}

function activateFocused() {
  const item = cmdVisible[cmdFocusIdx];
  if (!item) return;
  closeCmd();
  executeCmd(item);
}

async function copyText(text, msg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg, 'success');
  } catch (e) {
    showToast('Could not copy to clipboard', 'error');
  }
}

/* ── Toast ──────────────────────────────────── */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${esc(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/* ── Skills tabs ────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-selected', String(b === btn));
    });
    document.querySelectorAll('.skills-panel').forEach(p => {
      const active = p.id === 'skills-' + target;
      p.classList.toggle('active', active);
      p.hidden = !active;
    });
  });
});

/* ── Helpers ─────────────────────────────────── */
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function iconSvg(name) {
  const icons = {
    user:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    briefcase:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    code:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    edit:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>`,
    zap:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    mail:     `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    sun:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    download: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    github:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    linkedin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  };
  return icons[name] || icons.code;
}

/* ── Init ─────────────────────────────────────── */
document.querySelectorAll('.footer-year').forEach(el => { el.textContent = new Date().getFullYear(); });
onScroll();
loadProjects();
loadBlogPreview();
