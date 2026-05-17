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
        "title": "从徒步到攀岩，我决定去爬墙了",
        "excerpt": "徒步走了3年，走过梅里雪山的冰川，走过齐云山的云海。直到有一天，我站在一面岩壁下面……",
        "date": "2026-05-10",
        "category": "经验分享",
        "emoji": "🧗",
        "bg": "linear-gradient(135deg, #2c1810, #1a1a2e)",
        "url": "posts/hiking-to-climbing.html",
        "hidden": false
    },
    {
        "title": "徒步入门：第一次徒步需要准备什么？",
        "excerpt": "从鞋子到背包，从食物到导航，手把手教你准备第一次徒步。不需要花大钱，安全出行最重要。",
        "date": "2026-05-15",
        "category": "徒步攻略",
        "emoji": "🥾",
        "bg": "linear-gradient(135deg, #1a3a2a, #0f3422)",
        "url": "posts/hiking-guide-first-time.html",
        "hidden": false
    },
    {
        "title": "我的徒步三年：从新手到独行侠",
        "excerpt": "3年时间，走了不下20条路线。梅里雪山雨崩村、齐云山云海、南太行绝壁……分享我走过的路和踩过的坑。",
        "date": "2026-05-08",
        "category": "经验分享",
        "emoji": "🏕️",
        "bg": "linear-gradient(135deg, #2a3a1a, #3a4a2a)",
        "url": "posts/hiking-experience-3years.html",
        "hidden": false
    },
    {
        "title": "徒步装备清单：这些钱不能省",
        "excerpt": "徒步鞋、登山杖、冲锋衣……哪些装备值得投资，哪些可以省？3年徒步经验总结的装备红黑榜。",
        "date": "2026-04-28",
        "category": "装备推荐",
        "emoji": "🎒",
        "bg": "linear-gradient(135deg, #1a2a3a, #2a3a4a)",
        "url": "posts/hiking-gear-guide.html",
        "hidden": false
    },
    {
        "title": "雨崩村徒步路线详解",
        "excerpt": "梅里雪山脚下的世外桃源——雨崩村。详细路线、交通、住宿、花费，一篇讲清楚。",
        "date": "2026-04-18",
        "category": "路线推荐",
        "emoji": "🏔️",
        "bg": "linear-gradient(135deg, #3a2a1a, #4a3a2a)",
        "url": "posts/hiking-yubeng-route.html",
        "hidden": false
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
    var showHidden = sessionStorage.getItem('admin_auth') === '1';
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
