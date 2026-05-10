var ADMIN_PASS = 'LBS20040816';

// ==================== 加载本地编辑的内容 ====================
(function applyEdits() {
    if (sessionStorage.getItem('admin_auth') === '1') return;
    try {
        // 加载页面文字编辑
        var edits = JSON.parse(localStorage.getItem('inline_edits') || '{}');
        if (edits.heroDesc) { var hd = document.querySelector('.hero-desc'); if (hd) hd.textContent = edits.heroDesc; }
        if (edits.heroSub) { var hs = document.querySelector('.hero-sub'); if (hs) hs.textContent = edits.heroSub; }
        if (edits.heroTitle) { 
            var ht = document.querySelector('.hero-title');
            if (ht) ht.innerHTML = '<span class="gold">' + edits.heroTitle.charAt(0) + '</span>' + edits.heroTitle.slice(1);
        }
        // 加载关于页编辑
        document.querySelectorAll('.about-main p').forEach(function(p, i) {
            if (edits['aboutP' + i]) p.textContent = edits['aboutP' + i];
        });

        // 加载文章编辑
        var pdata = localStorage.getItem('site_edited_posts');
        if (pdata && window.renderPosts) {
            try {
                var posts = JSON.parse(pdata);
                window.SITE_POSTS = posts;
                if (typeof renderPosts === 'function' && document.getElementById('postsGrid')) {
                    renderPosts('postsGrid');
                }
                if (typeof renderLatest === 'function') {
                    renderLatest();
                }
            } catch(e) {}
        }
    } catch(e) {}
})();

// ==================== 管理员模式 ====================
(function initAdminMode() {
    var ia = sessionStorage.getItem('admin_auth') === '1';
    if (!ia) { createLoginWidget(); return; }

    // 注入编辑模式样式
    var style = document.createElement('style');
    style.textContent = '' +
        '.admin-toolbar{position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--bg-card);border-bottom:2px solid var(--gold);padding:6px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:0.82rem}' +
        '.admin-toolbar span{color:var(--gold)}' +
        '.editable{cursor:text;transition:all 0.2s;border-radius:4px;padding:2px 4px;margin:-2px -4px}' +
        '.editable:hover{background:var(--gold-dim);outline:1px dashed var(--gold)}' +
        '.editable:focus{background:var(--bg);outline:2px solid var(--gold);box-shadow:0 0 0 3px var(--gold-dim)}' +
        'body.admin-active{padding-top:44px}';
    document.head.appendChild(style);
    document.body.classList.add('admin-active');

    // 工具栏
    var bar = document.createElement('div');
    bar.className = 'admin-toolbar';
    bar.innerHTML = '<span>✏️ 编辑模式已启用</span>' +
        '<button class="btn btn-ghost btn-sm" onclick="exportChanges()">导出修改</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="hidePostToggle()">显示/隐藏文章</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="exitAdminMode()">退出</button>' +
        '<span style="font-size:0.75rem;color:var(--text-muted);margin-left:auto">点击页面上的文字直接修改</span>';
    document.body.prepend(bar);

    // 使内容可编辑
    makeContentEditable();
})();

// ==================== 使内容可编辑 ====================
function makeContentEditable() {
    // 英雄区域
    markEditable('.hero-desc', 'heroDesc', true);
    markEditable('.hero-sub', 'heroSub', true);
    markEditable('.hero-title', 'heroTitle', true);

    // 关于页段落
    document.querySelectorAll('.about-main p').forEach(function(p, i) {
        p.contentEditable = 'true';
        p.classList.add('editable');
        p.dataset.editKey = 'aboutP' + i;
        p.addEventListener('blur', saveAllEdits);
    });

    // 文章标题/摘要
    document.querySelectorAll('.post-title').forEach(function(el) {
        el.contentEditable = 'true';
        el.classList.add('editable');
        el.addEventListener('blur', savePostChanges);
    });
    document.querySelectorAll('.post-excerpt').forEach(function(el) {
        el.contentEditable = 'true';
        el.classList.add('editable');
        el.addEventListener('blur', savePostChanges);
    });

    // 岩行中国页面
    document.querySelectorAll('.yx-spot-title').forEach(function(el) {
        el.contentEditable = 'true';
        el.classList.add('editable');
    });
    document.querySelectorAll('.yx-spot-desc').forEach(function(el) {
        el.contentEditable = 'true';
        el.classList.add('editable');
    });
}

function markEditable(selector, key, saveOnBlur) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.contentEditable = 'true';
    el.classList.add('editable');
    el.dataset.editKey = key;
    if (saveOnBlur) el.addEventListener('blur', saveAllEdits);
}

function saveAllEdits() {
    var data = {};
    try { data = JSON.parse(localStorage.getItem('inline_edits') || '{}'); } catch(e) {}
    document.querySelectorAll('[data-edit-key]').forEach(function(el) {
        // 对于 hero-title 特殊处理（保留 gold span）
        if (el.dataset.editKey === 'heroTitle') {
            data[el.dataset.editKey] = el.textContent.trim();
        } else {
            data[el.dataset.editKey] = el.textContent || el.innerText || '';
        }
    });
    localStorage.setItem('inline_edits', JSON.stringify(data));
}

function savePostChanges() {
    var cards = document.querySelectorAll('.post-card');
    var posts = [];
    try { 
        var saved = localStorage.getItem('site_edited_posts');
        if (saved) posts = JSON.parse(saved);
    } catch(e) {}
    if (!posts.length) posts = JSON.parse(JSON.stringify(window.SITE_POSTS || POSTS || []));

    cards.forEach(function(card, i) {
        if (!posts[i]) posts[i] = {};
        var t = card.querySelector('.post-title');
        var e = card.querySelector('.post-excerpt');
        if (t) posts[i].title = t.textContent.trim();
        if (e) posts[i].excerpt = e.textContent.trim();
    });
    localStorage.setItem('site_edited_posts', JSON.stringify(posts));
    localStorage.setItem('blog_posts', JSON.stringify(posts));
}

function hidePostToggle() {
    var cards = document.querySelectorAll('.post-card');
    var posts = [];
    try {
        var s = localStorage.getItem('site_edited_posts');
        if (s) posts = JSON.parse(s);
    } catch(e) {}
    if (!posts.length) posts = JSON.parse(JSON.stringify(window.SITE_POSTS || POSTS || []));

    var names = [];
    posts.forEach(function(p, i) {
        names.push((p.hidden ? '[隐藏] ' : '[显示] ') + p.title);
    });
    var choice = prompt('输入序号来切换隐藏/显示状态：\n\n' + names.map(function(n, i) { return i + ': ' + n; }).join('\n'));
    if (choice !== null) {
        var idx = parseInt(choice);
        if (idx >= 0 && idx < posts.length) {
            posts[idx].hidden = !posts[idx].hidden;
            localStorage.setItem('site_edited_posts', JSON.stringify(posts));
            localStorage.setItem('blog_posts', JSON.stringify(posts));
            alert('已' + (posts[idx].hidden ? '隐藏' : '显示') + '：' + posts[idx].title);
            location.reload();
        }
    }
}

function exportChanges() {
    var code = '';
    var edits = localStorage.getItem('inline_edits');
    if (edits) {
        code += '// 页面内容（复制到 js/main.js 底部）\nvar siteConfig = ' + edits + ';\n\n';
    }
    var posts = localStorage.getItem('site_edited_posts');
    if (posts) {
        code += '// 文章列表（替换 js/main.js 中的 POSTS）\nvar POSTS = ' + posts + ';\n';
    }
    if (!code) { alert('没有需要导出的修改'); return; }
    navigator.clipboard.writeText(code).then(function() {
        alert('代码已复制！打开 GitHub → blog → js/main.js 粘贴替换即可。');
    });
}

function exitAdminMode() {
    sessionStorage.removeItem('admin_auth');
    location.reload();
}

// ==================== 登录小部件 ====================
function createLoginWidget() {
    var div = document.createElement('div');
    div.id = 'loginWidget';
    div.innerHTML = '' +
    '<div style="position:fixed;bottom:24px;right:24px;z-index:10000;font-family:inherit;">' +
        '<button id="showLoginBtn" style="width:40px;height:40px;border-radius:50%;border:1px solid var(--border);background:var(--bg-card);color:var(--text-muted);cursor:pointer;font-size:1rem;transition:all 0.2s;box-shadow:var(--shadow);" title="站长登录">🔑</button>' +
        '<div id="loginForm" style="display:none;position:absolute;bottom:48px;right:0;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:16px;width:200px;box-shadow:var(--shadow);">' +
            '<input type="password" id="adminPass" placeholder="站长密码" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:0.85rem;margin-bottom:8px;outline:none;font-family:inherit;">' +
            '<button onclick="doAdminLogin()" style="width:100%;padding:8px;background:var(--gold);color:#0c0c14;border:none;border-radius:4px;cursor:pointer;font-size:0.85rem;font-family:inherit;">进入编辑模式</button>' +
            '<p style="font-size:0.7rem;color:var(--text-muted);margin-top:8px;text-align:center;">登录后可编辑页面内容</p>' +
        '</div>' +
    '</div>';
    document.body.appendChild(div);

    var btn = document.getElementById('showLoginBtn');
    var form = document.getElementById('loginForm');
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        if (form.style.display === 'block') {
            setTimeout(function() { document.getElementById('adminPass').focus(); }, 100);
        }
    });

    var input = document.getElementById('adminPass');
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doAdminLogin();
    });

    document.addEventListener('click', function() {
        form.style.display = 'none';
    });
}

function doAdminLogin() {
    var pass = document.getElementById('adminPass').value;
    if (pass === ADMIN_PASS) {
        sessionStorage.setItem('admin_auth', '1');
        location.reload();
    } else {
        document.getElementById('adminPass').style.borderColor = '#e94560';
        setTimeout(function() { document.getElementById('adminPass').style.borderColor = ''; }, 1000);
    }
}
