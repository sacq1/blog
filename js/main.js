// ==================== 文章数据 ====================
// 管理员密码
const ADMIN_PASS = 'LBS20040816';

// 文章列表 - 在这里添加新文章
// hidden: true 表示隐藏文章
let POSTS = [
    {
        id: 1,
        title: '从徒步到攀岩，我决定去爬墙了',
        excerpt: '徒步走了3年，走过梅里雪山的冰川，走过齐云山的云海。直到有一天，我站在一面岩壁下面……',
        date: '2026-05-10',
        category: '攀岩',
        emoji: '🧗',
        bg: 'linear-gradient(135deg, #2c1810, #1a1a2e)',
        url: 'posts/hiking-to-climbing.html',
        hidden: false
    },
    {
        id: 2,
        title: '梅里雪山保姆级攻略',
        excerpt: '从交通到住宿，从路线到装备，一篇讲清楚梅里雪山怎么去、怎么看、花多少钱。',
        date: '2026-04-21',
        category: '攻略',
        emoji: '🏔️',
        bg: 'linear-gradient(135deg, #1a2a3a, #0f3460)',
        url: 'posts/meili-snow-mountain.html',
        hidden: false
    },
    {
        id: 3,
        title: '攀岩绳结入门：这5个绳结必须会',
        excerpt: '八字结、布林结、双套结、意大利半扣、抓结。掌握这5个，户外攀岩够用了。',
        date: '2026-04-15',
        category: '绳索技术',
        emoji: '🪢',
        bg: 'linear-gradient(135deg, #3a1a1a, #5c1a1a)',
        url: 'posts/essential-knots.html',
        hidden: false
    }
];

// 从 localStorage 加载文章数据
function loadPosts() {
    const saved = localStorage.getItem('yanxingji_posts');
    if (saved) {
        try {
            POSTS = JSON.parse(saved);
        } catch(e) {}
    }
}

// 保存文章数据到 localStorage
function savePosts() {
    localStorage.setItem('yanxingji_posts', JSON.stringify(POSTS));
}

// 初始化
loadPosts();

// ==================== 渲染文章列表 ====================
function renderPosts(containerId, filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = filter === 'all'
        ? POSTS.filter(p => !p.hidden)
        : POSTS.filter(p => p.category === filter && !p.hidden);

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:var(--tx3);text-align:center;padding:40px;">暂无文章</p>';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const d = new Date(p.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        return `
            <article class="post-card">
                <div class="post-thumb" style="background:${p.bg}"><span>${p.emoji}</span></div>
                <div class="post-body">
                    <div class="post-meta">
                        <span class="post-date">${d}</span>
                        <span class="post-tag">${p.category}</span>
                    </div>
                    <h3 class="post-title">${p.title}</h3>
                    <p class="post-excerpt">${p.excerpt}</p>
                    <a href="${p.url}" class="post-more">阅读全文 →</a>
                </div>
            </article>
        `;
    }).join('');
}

// 首页最新文章
function renderLatest() {
    renderPosts('latestPosts');
}

// ==================== 文章管理 ====================
function renderManage() {
    const container = document.getElementById('manageList');
    if (!container) return;

    if (POSTS.length === 0) {
        container.innerHTML = '<p style="color:var(--tx3);text-align:center;padding:20px;">暂无文章</p>';
        return;
    }

    container.innerHTML = POSTS.map(p => {
        const d = new Date(p.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        return `
            <div class="manage-item ${p.hidden ? 'hidden' : ''}">
                <div class="manage-info">
                    <h4>${p.hidden ? '🔒 ' : ''}${p.title}</h4>
                    <p>${d} · ${p.category} · ${p.hidden ? '已隐藏' : '已发布'}</p>
                </div>
                <div class="manage-actions">
                    <button class="btn btn-o btn-s" onclick="editPost(${p.id})">修改</button>
                    <button class="btn btn-o btn-s" onclick="toggleHide(${p.id})">${p.hidden ? '显示' : '隐藏'}</button>
                    <button class="btn btn-d btn-s" onclick="deletePost(${p.id})">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleHide(id) {
    const post = POSTS.find(p => p.id === id);
    if (post) {
        post.hidden = !post.hidden;
        savePosts();
        renderManage();
    }
}

function deletePost(id) {
    if (confirm('确定删除这篇文章？删除后无法恢复。')) {
        POSTS = POSTS.filter(p => p.id !== id);
        savePosts();
        renderManage();
    }
}

function editPost(id) {
    const post = POSTS.find(p => p.id === id);
    if (!post) return;

    // 填充表单
    document.getElementById('pTitle').value = post.title;
    document.getElementById('pSubtitle').value = post.excerpt;
    document.getElementById('pDate').value = post.date;
    document.getElementById('pCat').value = post.category;
    document.getElementById('editId').value = id;

    // 滚动到表单
    document.getElementById('formSection').scrollIntoView({ behavior: 'smooth' });
}

// ==================== 自动刷新 ====================
let lastModified = null;
function checkUpdate() {
    fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' })
        .then(r => {
            const m = r.headers.get('Last-Modified');
            if (lastModified && m && lastModified !== m) location.reload();
            lastModified = m;
        })
        .catch(() => {});
}
setInterval(checkUpdate, 60000);
