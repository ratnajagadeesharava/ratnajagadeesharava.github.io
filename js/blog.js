/* ════════════════════════════════════════════
   BLOG.JS — Blog listing + Post reader
════════════════════════════════════════════ */

/* ─────────────────── BLOG LISTING ────────────────── */
if (document.getElementById('blog-list')) {
  initBlogListing();
}

async function initBlogListing() {
  const list = document.getElementById('blog-list');
  const searchEl = document.getElementById('blog-search');
  const catBtns = document.querySelectorAll('.blog-cat-btn');

  let posts = [];
  let activeCategory = 'all';
  let searchQuery = '';

  try {
    const res = await fetch('data/posts.json');
    posts = await res.json();
    renderBlogList(posts);
  } catch (e) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:3rem">Could not load posts.</p>';
    return;
  }

  searchEl?.addEventListener('input', () => {
    searchQuery = searchEl.value.trim().toLowerCase();
    renderBlogList(filterPosts(posts));
  });

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderBlogList(filterPosts(posts));
    });
  });

  function filterPosts(all) {
    return all.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery) ||
        p.excerpt.toLowerCase().includes(searchQuery) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery));
      return matchCat && matchSearch;
    });
  }

  function renderBlogList(posts) {
    if (!posts.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:3rem">No posts found.</p>';
      return;
    }

    list.innerHTML = posts.map((post, i) => {
      const d = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const tagHtml = post.tags.slice(0, 3).map(t =>
        `<span class="blog-tag blog-tag-${getCategoryClass(t)}">${escHtml(t)}</span>`
      ).join('');

      return `<a href="post.html?id=${escHtml(post.id)}" class="blog-list-card reveal">
        <span class="blog-list-number">${String(i+1).padStart(2,'0')}</span>
        <div class="blog-list-content">
          <h3>${escHtml(post.title)}</h3>
          <p>${escHtml(post.excerpt)}</p>
          <div class="blog-list-footer">
            ${tagHtml}
            <span class="blog-date">${d}</span>
            <span class="blog-read-time">${post.readTime} min read</span>
          </div>
        </div>
      </a>`;
    }).join('');

    // Re-observe reveals
    list.querySelectorAll('.reveal').forEach(el => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.05 });
      obs.observe(el);
    });
  }
}

/* ─────────────────── POST PAGE ────────────────── */
if (document.getElementById('post-content')) {
  initPost();
}

async function initPost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'blog.html'; return; }

  try {
    const res = await fetch('data/posts.json');
    const posts = await res.json();
    const post = posts.find(p => p.id === id);
    if (!post) { window.location.href = 'blog.html'; return; }
    renderPost(post, posts);
  } catch (e) {
    document.getElementById('post-content').innerHTML = '<p>Could not load post.</p>';
  }
}

function renderPost(post, allPosts) {
  // Title
  document.title = `${post.title} — Jagadeesh`;

  // Meta
  const metaEl = document.getElementById('post-meta');
  if (metaEl) {
    const d = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const tagHtml = post.tags.map(t =>
      `<span class="blog-tag blog-tag-${getCategoryClass(t)}">${escHtml(t)}</span>`
    ).join('');
    metaEl.innerHTML = `${tagHtml}<span class="blog-date">${d}</span><span class="blog-read-time">${post.readTime} min read</span>`;
  }

  // Title element
  const titleEl = document.getElementById('post-title');
  if (titleEl) titleEl.textContent = post.title;

  // Excerpt
  const excEl = document.getElementById('post-excerpt');
  if (excEl) excEl.textContent = post.excerpt;

  // Content (render markdown via marked.js)
  const contentEl = document.getElementById('post-content');
  if (contentEl && typeof marked !== 'undefined') {
    contentEl.innerHTML = marked.parse(post.content);
  } else if (contentEl) {
    // Fallback: simple markdown
    contentEl.innerHTML = simpleMarkdown(post.content);
  }

  // Add copy buttons to code blocks
  contentEl?.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent;
      await navigator.clipboard.writeText(code);
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });

  // Build ToC
  buildToc(contentEl);

  // Prev / Next
  const idx = allPosts.findIndex(p => p.id === post.id);
  const prev = allPosts[idx + 1];
  const next = allPosts[idx - 1];
  const navEl = document.getElementById('post-nav');
  if (navEl) {
    navEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:2rem 0;border-top:1px solid var(--border)">
        ${prev ? `<a href="post.html?id=${escHtml(prev.id)}" style="color:var(--text-muted);font-size:0.875rem;display:flex;align-items:center;gap:0.5rem;transition:color .2s" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-muted)'">← ${escHtml(prev.title)}</a>` : '<span></span>'}
        ${next ? `<a href="post.html?id=${escHtml(next.id)}" style="color:var(--text-muted);font-size:0.875rem;display:flex;align-items:center;gap:0.5rem;transition:color .2s" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-muted)'"> ${escHtml(next.title)} →</a>` : '<span></span>'}
      </div>`;
  }

  // Scroll reveal for post-header
  setTimeout(() => {
    document.querySelector('.post-header')?.classList.add('visible');
  }, 100);
}

function buildToc(contentEl) {
  const tocEl = document.getElementById('toc-list');
  if (!tocEl || !contentEl) return;
  const headings = contentEl.querySelectorAll('h2, h3');
  if (!headings.length) { document.querySelector('.toc')?.remove(); return; }

  headings.forEach((h, i) => {
    const id = 'heading-' + i;
    h.id = id;
    const a = document.createElement('a');
    a.className = 'toc-item' + (h.tagName === 'H3' ? ' toc-h3' : '');
    a.href = '#' + id;
    a.textContent = h.textContent;
    a.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth' });
    });
    tocEl.appendChild(a);
  });

  // Active heading on scroll
  const tocItems = tocEl.querySelectorAll('.toc-item');
  const headingArr = Array.from(headings);
  const tocObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = headingArr.indexOf(entry.target);
        tocItems.forEach((item, i) => item.classList.toggle('active', i === idx));
      }
    });
  }, { rootMargin: '-20% 0% -70% 0%' });
  headings.forEach(h => tocObserver.observe(h));
}

/* Simple markdown fallback (no deps) */
function simpleMarkdown(md) {
  return md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="language-${lang}">${escHtml(code.trim())}</code></pre>`)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbla])(.+)$/gm, (_, line) => line ? `<p>${line}</p>` : '');
}

/* ─────────────────── HELPERS ────────────────── */
function getCategoryClass(tag) {
  const map = {
    'Rust':'rust','Angular':'web','RxJS':'web','TypeScript':'web','Frontend':'web',
    'C++':'systems','OpenGL':'graphics','Graphics':'graphics','Ray Tracing':'graphics',
    'Game Engine':'graphics','AI':'ai','LLMs':'ai','Career':'career','Systems':'systems',
    'Math':'math',
  };
  return map[tag] || 'web';
}

function escHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}
