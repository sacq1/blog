// ==================== 主题切换 ====================
function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.querySelector('.theme-btn');
    if (!btn) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.textContent = isLight ? '☀️' : '🌙';
    btn.title = isLight ? '切换为深色模式' : '切换为浅色模式';
}

// 初始化主题
(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    updateThemeIcon();
})();

// ==================== 文章数据 ====================
const DEFAULT_POSTS = [
    {
        "title": "1",
        "excerpt": "1",
        "date": "2026-05-13",
        "category": "攀岩",
        "emoji": "🧗",
        "bg": "linear-gradient(135deg, #2c1810, #1a1a2e)",
        "url": "posts/ceshi.html",
        "hidden": true
    },
    {
        "title": "从徒步到攀岩，我决定去爬墙了",
        "excerpt": "徒步走了3年，走过梅里雪山的冰川，走过齐云山的云海。直到有一天，我站在一面岩壁下面……",
        "date": "2026-05-10",
        "category": "攀岩",
        "emoji": "🧗",
        "bg": "linear-gradient(135deg, #2c1810, #1a1a2e)",
        "url": "posts/hiking-to-climbing.html",
        "hidden": true
    },
    {
        "title": "梅里雪山保姆级攻略",
        "excerpt": "从交通到住宿，从路线到装备，一篇讲清楚梅里雪山怎么去、怎么看、花多少钱。",
        "date": "2026-04-21",
        "category": "攻略",
        "emoji": "🏔️",
        "bg": "linear-gradient(135deg, #1a2a3a, #0f3460)",
        "url": "posts/meili-snow-mountain.html",
        "hidden": true
    },
    {
        "title": "攀岩绳结入门：这5个绳结必须会",
        "excerpt": "八字结、布林结、双套结、意大利半扣、抓结。掌握这5个，户外攀岩够用了。",
        "date": "2026-04-15",
        "category": "绳索技术",
        "emoji": "🪢",
        "bg": "linear-gradient(135deg, #3a1a1a, #5c1a1a)",
        "url": "posts/essential-knots.html",
        "hidden": true
    }
];

// 优先读取 localStorage 中的文章数据
var POSTS = [];
var SITE_POSTS = [];

(function loadPosts() {
    try {
        const saved = localStorage.getItem('blog_posts');
        if (saved) {
            POSTS = JSON.parse(saved);
        }
    } catch(e) {}
    if (!POSTS || POSTS.length === 0) {
        POSTS = JSON.parse(JSON.stringify(DEFAULT_POSTS));
    }
    SITE_POSTS = POSTS;
})();

// ==================== 渲染文章 ====================
function renderPosts(containerId, filter) {
    filter = filter || 'all';
    var container = document.getElementById(containerId);
    if (!container) return;

    var filtered = filter === 'all' ? POSTS : POSTS.filter(function(p) {
        return p.category === filter;
    });

    // 排除隐藏文章
    var showHidden = sessionStorage.getItem('editor_auth') === '1';
    if (!showHidden) {
        filtered = filtered.filter(function(p) { return !p.hidden; });
    }

    container.innerHTML = filtered.map(function(p) {
        var d = new Date(p.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        var hiddenTag = (showHidden && p.hidden) ? '<span class="post-hidden-tag">已隐藏</span>' : '';
        return '<article class="post-card' + (p.hidden && showHidden ? ' hidden-card' : '') + '" data-cat="' + p.category + '">' +
            '<div class="post-thumb" style="background: ' + p.bg + ';">' +
                '<span>' + p.emoji + '</span>' +
            '</div>' +
            '<div class="post-body">' +
                '<div class="post-meta">' +
                    '<span class="post-date">' + d + '</span>' +
                    '<span class="post-tag">' + p.category + '</span>' +
                    hiddenTag +
                '</div>' +
                '<h3 class="post-title">' + p.title + '</h3>' +
                '<p class="post-excerpt">' + p.excerpt + '</p>' +
                '<a href="' + p.url + '" class="post-more">阅读全文 →</a>' +
            '</div>' +
        '</article>';
    }).join('');
}

// 首页最新文章（显示前3条）
function renderLatest() {
    var container = document.getElementById('latestPosts');
    if (!container) return;
    // 排除隐藏文章
    var visible = POSTS.filter(function(p) { return !p.hidden; });
    container.innerHTML = visible.slice(0, 3).map(function(p) {
        var d = new Date(p.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        return '<article class="post-card">' +
            '<div class="post-thumb" style="background: ' + p.bg + ';">' +
                '<span>' + p.emoji + '</span>' +
            '</div>' +
            '<div class="post-body">' +
                '<div class="post-meta">' +
                    '<span class="post-date">' + d + '</span>' +
                    '<span class="post-tag">' + p.category + '</span>' +
                '</div>' +
                '<h3 class="post-title">' + p.title + '</h3>' +
                '<p class="post-excerpt">' + p.excerpt + '</p>' +
                '<a href="' + p.url + '" class="post-more">阅读全文 →</a>' +
            '</div>' +
        '</article>';
    }).join('');
}

// ==================== 网站内容配置（可从编辑器修改）====================
(function loadSiteConfig() {
    try {
        var cfg = localStorage.getItem('site_data');
        if (!cfg) return;
        cfg = JSON.parse(cfg);

        if (cfg.heroDesc) {
            var hd = document.querySelector('.hero-desc');
            if (hd) hd.textContent = cfg.heroDesc;
        }
        if (cfg.heroTitle && document.querySelector('.hero-title')) {
            var t = cfg.heroTitle;
            document.querySelector('.hero-title').innerHTML = '<span class="gold">' + t.charAt(0) + '</span>' + t.slice(1);
        }
        if (cfg.heroSub) {
            var hs = document.querySelector('.hero-sub');
            if (hs) hs.textContent = cfg.heroSub;
        }
        if (cfg.aboutIntro) {
            var ap = document.querySelector('.about-main p');
            if (ap) ap.textContent = cfg.aboutIntro;
        }
    } catch(e) {}
})();

// ==================== 自动刷新 ====================
var lastCheck = Date.now();
setInterval(function() {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', window.location.href + '?t=' + Date.now(), true);
    xhr.onload = function() {
        var lm = xhr.getResponseHeader('Last-Modified');
        if (lm && localStorage.getItem('last_modified') && lm !== localStorage.getItem('last_modified')) {
            location.reload();
        }
        if (lm) localStorage.setItem('last_modified', lm);
    };
    xhr.send();
}, 30000);

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    try { renderLatest(); } catch(e) {}
});
