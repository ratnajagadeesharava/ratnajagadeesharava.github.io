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
    posts = sortPostsByDate(await res.json());
    labelCategoryCounts(posts);
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
      catBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      activeCategory = btn.dataset.cat;
      renderBlogList(filterPosts(posts));
    });
  });

  function labelCategoryCounts(all) {
    catBtns.forEach(btn => {
      const cat = btn.dataset.cat;
      const count = cat === 'all' ? all.length : all.filter(p => p.category === cat).length;
      if (!count) { btn.remove(); return; }
      btn.insertAdjacentHTML('beforeend', ` <span class="cat-count">${count}</span>`);
    });
  }

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
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:3rem">No posts match your search.</p>';
      return;
    }

    list.innerHTML = posts.map((post, i) => {
      const d = formatPostDate(post.date);
      const tagHtml = post.tags.slice(0, 3).map(t =>
        `<span class="blog-tag blog-tag-${getCategoryClass(t)}">${esc(t)}</span>`
      ).join('');

      return `<a href="post.html?id=${encodeURIComponent(post.id)}" class="blog-list-card reveal">
        <span class="blog-list-number">${String(i+1).padStart(2,'0')}</span>
        <div class="blog-list-content">
          <h3>${esc(post.title)}</h3>
          <p>${esc(post.excerpt)}</p>
          <div class="blog-list-footer">
            ${tagHtml}
            <span class="blog-date">${d}</span>
            <span class="blog-read-time">${post.readTime} min read</span>
          </div>
        </div>
      </a>`;
    }).join('');

    list.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }
}

/* ─────────────────── POST PAGE ────────────────── */
if (document.getElementById('post-content')) {
  initPost();
}

async function initPost() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.replace('blog.html'); return; }

  try {
    const res = await fetch('data/posts.json');
    const posts = sortPostsByDate(await res.json());
    const post = posts.find(p => p.id === id);
    if (!post) { renderPostNotFound(); return; }
    renderPost(post, posts);
  } catch (e) {
    document.getElementById('post-title').textContent = 'Could not load post';
    document.getElementById('post-content').innerHTML = '<p>Something went wrong loading this post. <a href="blog.html">Back to the blog →</a></p>';
  }
}

function renderPostNotFound() {
  document.title = 'Post not found — Ratna Jagadeesh Arava';
  document.getElementById('post-title').textContent = 'Post not found';
  document.getElementById('breadcrumb-title').textContent = 'Not found';
  document.getElementById('post-content').innerHTML = '<p>This post doesn\'t exist or has moved. <a href="blog.html">Browse all posts →</a></p>';
  document.querySelector('.post-share')?.remove();
  document.querySelector('.toc')?.remove();
  document.querySelector('.post-header')?.classList.add('visible');
}

function renderPost(post, allPosts) {
  document.title = `${post.title} — Ratna Jagadeesh Arava`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', post.excerpt);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', post.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', post.excerpt);

  const metaEl = document.getElementById('post-meta');
  if (metaEl) {
    const tagHtml = post.tags.map(t =>
      `<span class="blog-tag blog-tag-${getCategoryClass(t)}">${esc(t)}</span>`
    ).join('');
    metaEl.innerHTML = `${tagHtml}<time class="blog-date" datetime="${esc(post.date)}">${formatPostDate(post.date)}</time><span class="blog-read-time">${post.readTime} min read</span>`;
  }

  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-excerpt').textContent = post.excerpt;

  const bc = document.getElementById('breadcrumb-title');
  if (bc) bc.textContent = post.title.length > 40 ? post.title.slice(0, 40) + '…' : post.title;

  // Share links
  const shareUrl = location.href;
  const twitterBtn = document.getElementById('twitter-share');
  if (twitterBtn) twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinBtn = document.getElementById('linkedin-share');
  if (linkedinBtn) linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  document.getElementById('copy-link')?.addEventListener('click', () => copyText(shareUrl, 'Link copied!'));

  // Content (markdown via marked.js, with a dependency-free fallback)
  const contentEl = document.getElementById('post-content');
  contentEl.innerHTML = typeof marked !== 'undefined'
    ? marked.parse(post.content, { gfm: true, breaks: true })
    : simpleMarkdown(post.content);

  // External links open in a new tab
  contentEl.querySelectorAll('a[href^="http"]').forEach(a => {
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Syntax highlighting (optional dependency)
  if (typeof hljs !== 'undefined') {
    contentEl.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
  }

  // Copy buttons on code blocks
  contentEl.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
      } catch (e) {
        btn.textContent = 'Failed';
      }
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
    pre.appendChild(btn);
  });

  buildToc(contentEl);

  // Prev (older) / Next (newer) — posts are sorted newest first
  const idx = allPosts.findIndex(p => p.id === post.id);
  const prev = allPosts[idx + 1];
  const next = allPosts[idx - 1];
  const navEl = document.getElementById('post-nav');
  if (navEl && (prev || next)) {
    const link = (p, dir) => `<a href="post.html?id=${encodeURIComponent(p.id)}" class="post-nav-link post-nav-${dir}">
        <span class="post-nav-label">${dir === 'prev' ? '← Older' : 'Newer →'}</span>
        <span class="post-nav-title">${esc(p.title)}</span>
      </a>`;
    navEl.innerHTML = `<div class="post-nav">
      ${prev ? link(prev, 'prev') : '<span></span>'}
      ${next ? link(next, 'next') : '<span></span>'}
    </div>`;
  }

  document.querySelector('.post-header')?.classList.add('visible');

  // Honour deep links to a heading (e.g. post.html?id=x#why-build-a-ray-tracer)
  if (location.hash) findHashTarget(location.hash)?.scrollIntoView();
}

function buildToc(contentEl) {
  const tocEl = document.getElementById('toc-list');
  if (!tocEl || !contentEl) return;
  const headings = contentEl.querySelectorAll('h2, h3');
  if (!headings.length) { document.querySelector('.toc')?.remove(); return; }

  const used = new Set();
  headings.forEach((h, i) => {
    // Readable, stable ids so headings can be deep-linked
    let id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section-' + i;
    while (used.has(id)) id += '-' + i;
    used.add(id);
    h.id = id;

    const a = document.createElement('a');
    a.className = 'toc-item' + (h.tagName === 'H3' ? ' toc-h3' : '');
    a.href = '#' + id;
    a.textContent = h.textContent;
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
      `<pre><code class="language-${lang}">${esc(code.trim())}</code></pre>`)
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

/* Shared helpers (esc, getCategoryClass, formatPostDate, sortPostsByDate,
   copyText, findHashTarget, revealObserver) live in main.js, loaded first. */
