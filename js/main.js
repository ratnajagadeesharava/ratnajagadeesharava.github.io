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
const LANG_COLORS = {
  'Rust':'#dea584','C++':'#f34b7d','C':'#555555','C#':'#178600',
  'TypeScript':'#3178c6','JavaScript':'#f1e05a','Python':'#3572A5',
  'GLSL':'#5686a5','HTML':'#e34c26','CSS':'#563d7c',
};

/* ── Theme ─────────────────────────────────── */
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === 'dark'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
}

/* ── Nav scroll / active ────────────────────── */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 50);
  updateScrollProgress();
  updateActiveNav();
  toggleBackToTop();
  animateLearningBars();
}, { passive: true });

function updateScrollProgress() {
  const el = document.getElementById('scroll-progress');
  if (!el) return;
  const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
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

navToggle?.addEventListener('click', () => {
  document.body.classList.toggle('nav-open');
  navLinksEl?.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    navLinksEl?.classList.remove('open');
  });
});

/* ── Smooth scroll for anchor links ─────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

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
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error('API error');
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork && CUSTOM_DESCS.hasOwnProperty(r.name))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    if (!filtered.length) { grid.innerHTML = '<p class="projects-error">No projects found.</p>'; return; }

    // Store for filter
    window._allProjects = filtered;
    renderProjects(filtered);

    // Setup filter buttons
    setupProjectFilters(filtered);
  } catch (err) {
    grid.innerHTML = `<p class="projects-error">Couldn't load projects. <a href="https://github.com/${GITHUB_USER}" target="_blank" style="color:var(--accent)">View on GitHub →</a></p>`;
  }
}

function setupProjectFilters(repos) {
  const langs = [...new Set(repos.map(r => r.language).filter(Boolean))];
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  const allBtn = bar.querySelector('[data-lang="all"]');
  allBtn?.addEventListener('click', () => {
    setActiveFilter(allBtn);
    renderProjects(window._allProjects);
  });

  langs.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.lang = lang;
    btn.innerHTML = `<span class="lang-dot" style="background:${LANG_COLORS[lang]||'#8b8b8b'};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:4px;"></span>${lang}`;
    btn.addEventListener('click', () => {
      setActiveFilter(btn);
      renderProjects(window._allProjects.filter(r => r.language === lang));
    });
    bar.appendChild(btn);
  });
}

function setActiveFilter(btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
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
    const lang = repo.language || 'Unknown';
    const color = LANG_COLORS[lang] || '#8b8b8b';
    const updated = new Date(repo.pushed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const name = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return `<a href="${esc(repo.html_url)}" target="_blank" rel="noopener" class="project-card reveal">
      <div class="project-card-top">
        <span class="project-lang">
          <span class="lang-dot" style="background:${color}"></span>
          ${esc(lang)}
        </span>
        ${repo.stargazers_count > 0 ? `<span class="project-stars">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${repo.stargazers_count}
        </span>` : ''}
      </div>
      <h3>${esc(name)}</h3>
      <p>${esc(desc)}</p>
      <div class="project-footer">
        <span>Updated ${esc(updated)}</span>
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
    const posts = await res.json();
    const latest = posts.slice(0, 3);
    grid.innerHTML = latest.map(post => blogCard(post)).join('');
    grid.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `post.html?id=${card.dataset.id}`;
      });
    });
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--text-muted)">Could not load posts.</p>';
  }
}

function blogCard(post) {
  const tagHtml = post.tags.slice(0, 2).map(t =>
    `<span class="blog-tag blog-tag-${getCategoryClass(t)}">${esc(t)}</span>`
  ).join('');
  const d = new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `<div class="blog-card reveal" data-id="${esc(post.id)}">
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
  </div>`;
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
let cmdFocusIdx = -1;

const CMD_ITEMS = [
  { type: 'nav', label: 'About', icon: 'user', href: '#about' },
  { type: 'nav', label: 'Experience', icon: 'briefcase', href: '#experience' },
  { type: 'nav', label: 'Projects', icon: 'code', href: '#projects' },
  { type: 'nav', label: 'Blog', icon: 'edit', href: 'blog.html' },
  { type: 'nav', label: 'Skills', icon: 'zap', href: '#skills' },
  { type: 'nav', label: 'Contact', icon: 'mail', href: '#contact' },
  { type: 'action', label: 'Toggle Theme', icon: 'sun', action: () => themeToggle?.click() },
  { type: 'action', label: 'Download Resume', icon: 'download', action: () => { const a = document.createElement('a'); a.href='Ratna_Jagadeesh_CV_2024.pdf'; a.download=''; a.click(); } },
  { type: 'link', label: 'GitHub', icon: 'github', href: 'https://github.com/ratnajagadeesharava', external: true },
  { type: 'link', label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/in/ratna-jagadeesh-arava/', external: true },
];

let cmdPostItems = [];

async function loadCmdPosts() {
  try {
    const res = await fetch('data/posts.json');
    const posts = await res.json();
    cmdPostItems = posts.map(p => ({
      type: 'blog', label: p.title, icon: 'edit',
      href: `post.html?id=${p.id}`
    }));
  } catch (e) {}
}
loadCmdPosts();

document.getElementById('cmd-trigger')?.addEventListener('click', openCmd);

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCmd(); }
  if (e.key === 'Escape') closeCmd();
  if (cmdOverlay?.classList.contains('open')) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); moveFocus(-1); }
    if (e.key === 'Enter')     { e.preventDefault(); activateFocused(); }
  }
});

cmdOverlay?.addEventListener('click', e => { if (e.target === cmdOverlay) closeCmd(); });

function openCmd() {
  cmdOverlay?.classList.add('open');
  cmdInput?.focus();
  renderCmdResults('');
}

function closeCmd() { cmdOverlay?.classList.remove('open'); cmdFocusIdx = -1; }

cmdInput?.addEventListener('input', () => {
  cmdFocusIdx = -1;
  renderCmdResults(cmdInput.value.trim().toLowerCase());
});

function renderCmdResults(query) {
  const all = [...CMD_ITEMS, ...cmdPostItems];
  const filtered = query ? all.filter(i => i.label.toLowerCase().includes(query)) : all;

  if (!filtered.length) {
    cmdResults.innerHTML = `<p class="cmd-empty">No results for "${query}"</p>`;
    return;
  }

  const groups = {};
  filtered.forEach(item => {
    const g = item.type === 'nav' ? 'Navigation' : item.type === 'blog' ? 'Blog Posts' : item.type === 'action' ? 'Actions' : 'Links';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });

  cmdResults.innerHTML = Object.entries(groups).map(([group, items]) =>
    `<p class="cmd-section-header">${group}</p>` +
    items.map((item, i) =>
      `<div class="cmd-item" data-href="${item.href||''}" data-action="${item.action ? 'true' : ''}" tabindex="-1">
        ${iconSvg(item.icon)}
        <span>${esc(item.label)}</span>
      </div>`
    ).join('')
  ).join('');

  cmdResults.querySelectorAll('.cmd-item').forEach((el, i) => {
    const item = filtered[i];
    el.addEventListener('click', () => {
      executeCmd(item);
      closeCmd();
    });
  });
}

function executeCmd(item) {
  if (item.action) { item.action(); return; }
  if (item.external) { window.open(item.href, '_blank', 'noopener'); return; }
  if (item.href?.startsWith('#')) {
    const target = document.querySelector(item.href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  } else if (item.href) {
    window.location.href = item.href;
  }
}

function moveFocus(dir) {
  const items = cmdResults.querySelectorAll('.cmd-item');
  items[cmdFocusIdx]?.classList.remove('focused');
  cmdFocusIdx = Math.max(0, Math.min(items.length - 1, cmdFocusIdx + dir));
  items[cmdFocusIdx]?.classList.add('focused');
}

function activateFocused() {
  const all = [...CMD_ITEMS, ...cmdPostItems];
  const filtered = cmdInput.value.trim().toLowerCase()
    ? all.filter(i => i.label.toLowerCase().includes(cmdInput.value.trim().toLowerCase()))
    : all;
  if (filtered[cmdFocusIdx]) { executeCmd(filtered[cmdFocusIdx]); closeCmd(); }
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
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.skills-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('skills-' + target)?.classList.add('active');
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
loadProjects();
loadBlogPreview();
