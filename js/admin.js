var ADMIN_PASS = 'LBS20040816';

// 判断当前页面类型
var isEditorPage = window.location.pathname.indexOf('editor.html') !== -1;
var isSiteEditorPage = window.location.pathname.indexOf('site-editor.html') !== -1;
var isTechniquesPage = window.location.pathname.indexOf('techniques.html') !== -1;

// ==================== 应用本地编辑（普通用户可见） ====================
(function applyEdits() {
    if (isEditorPage || isSiteEditorPage) return;
    try {
        var edits = JSON.parse(localStorage.getItem('inline_edits') || '{}');
        if (edits.heroDesc) { var hd = document.querySelector('.hero-desc'); if (hd) hd.textContent = edits.heroDesc; }
        if (edits.heroSub) { var hs = document.querySelector('.hero-sub'); if (hs) hs.textContent = edits.heroSub; }
        if (edits.heroTitle) {
            var ht = document.querySelector('.hero-title');
            if (ht) ht.innerHTML = '<span class="gold">' + edits.heroTitle.charAt(0) + '</span>' + edits.heroTitle.slice(1);
        }
        document.querySelectorAll('.about-main p').forEach(function(p, i) {
            if (edits['aboutP' + i]) p.textContent = edits['aboutP' + i];
        });
    } catch(e) {}
})();

// ==================== 管理员模式 ====================
(function initAdmin() {
    var isAdmin = sessionStorage.getItem('admin_auth') === '1';

    // 非管理页面：只显示登录入口
    if (!isAdmin && !isEditorPage && !isSiteEditorPage && !isTechniquesPage) {
        createLoginButton();
        return;
    }

    // 已登录的管理页面：启用编辑模式
    if (isAdmin && !isEditorPage && !isSiteEditorPage && !isTechniquesPage) {
        enableEditMode();
        return;
    }
})();

// ==================== 登录按钮 ====================
function createLoginButton() {
    var html = '' +
    '<div style="position:fixed;bottom:24px;right:24px;z-index:10000;">' +
        '<button id="loginBtn" style="width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.1);background:var(--bg-card);color:var(--text-muted);cursor:pointer;font-size:1rem;box-shadow:var(--shadow);" title="站长登录">🔑</button>' +
        '<div id="loginPopup" style="display:none;position:absolute;bottom:48px;right:0;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:16px;width:200px;box-shadow:var(--shadow);">' +
            '<input type="password" id="loginPass" placeholder="站长密码" style="width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:0.85rem;margin-bottom:8px;outline:none;font-family:inherit;" onkeydown="if(event.key===\'Enter\')onLogin()">' +
            '<button onclick="onLogin()" style="width:100%;padding:8px;background:var(--gold);color:#0c0c14;border:none;border-radius:4px;cursor:pointer;font-size:0.85rem;font-family:inherit;">进入编辑模式</button>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);

    var btn = document.getElementById('loginBtn');
    var popup = document.getElementById('loginPopup');
    btn.onclick = function(e) {
        e.stopPropagation();
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
        if (popup.style.display === 'block') {
            setTimeout(function() { document.getElementById('loginPass').focus(); }, 100);
        }
    };
    document.addEventListener('click', function() { popup.style.display = 'none'; });
}

window.onLogin = function() {
    var pass = document.getElementById('loginPass').value;
    if (pass === ADMIN_PASS) {
        sessionStorage.setItem('admin_auth', '1');
        location.reload();
    } else {
        var inp = document.getElementById('loginPass');
        inp.style.borderColor = '#e94560';
        inp.value = '';
        setTimeout(function() { inp.style.borderColor = ''; }, 1000);
    }
};

// ==================== 编辑模式 ====================
function enableEditMode() {
    // CSS
    var s = document.createElement('style');
    s.textContent = '' +
        '.admin-bar{position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--bg-card);border-bottom:2px solid var(--gold);padding:6px 14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:0.82rem}' +
        '.admin-bar b{color:var(--gold)}' +
        '.editable{cursor:text;border-radius:4px;padding:2px 4px;margin:-2px -4px;transition:all 0.2s}' +
        '.editable:hover{background:var(--gold-dim);outline:1px dashed var(--gold)}' +
        '.editable:focus{background:var(--bg);outline:2px solid var(--gold);box-shadow:0 0 0 3px var(--gold-dim)}' +
        'body.admin-on{padding-top:44px}' +
        '.img-placeholder{display:inline-block;width:100%;min-height:120px;margin:8px 0;background:var(--gold-dim);border:2px dashed var(--gold);border-radius:8px;text-align:center;line-height:120px;color:var(--gold);cursor:pointer;font-size:0.85rem;transition:var(--trans)}' +
        '.img-placeholder:hover{background:rgba(201,168,76,0.2)}' +
        '.img-placeholder img{max-width:100%;display:block;border-radius:6px}';
    document.head.appendChild(s);
    document.body.classList.add('admin-on');

    // 工具栏
    var bar = '' +
    '<div class="admin-bar">' +
        '<b>✏️ 编辑模式</b>' +
        '<button class="btn btn-ghost btn-sm" onclick="insertImage()">📷 插入图片</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="hidePostManager()">👁 文章显隐</button>' +
        '<button class="btn btn-ghost btn-sm" onclick="exportEdits()">📤 导出</button>' +
        '<a href="editor.html" class="btn btn-gold btn-sm" style="text-decoration:none;">写文章</a>' +
        '<button class="btn btn-ghost btn-sm" onclick="sessionStorage.removeItem(\'admin_auth\');location.reload();" style="margin-left:auto;">退出</button>' +
    '</div>';
    document.body.insertAdjacentHTML('afterbegin', bar);

    // 标记可编辑元素
    setTimeout(makeEditable, 200);
}

function makeEditable() {
    // 英雄区
    tag('.hero-desc', 'heroDesc');
    tag('.hero-sub', 'heroSub');
    tag('.hero-title', 'heroTitle');
    // 关于页
    document.querySelectorAll('.about-main p').forEach(function(p, i) {
        p.contentEditable = 'true';
        p.classList.add('editable');
        p.dataset.key = 'aboutP' + i;
        p.onblur = saveEdits;
    });
    // 文章卡片
    document.querySelectorAll('.post-title').forEach(function(el, i) {
        el.contentEditable = 'true';
        el.classList.add('editable');
        el.onblur = savePosts;
    });
    document.querySelectorAll('.post-excerpt').forEach(function(el) {
        el.contentEditable = 'true';
        el.classList.add('editable');
        el.onblur = savePosts;
    });
    // 岩行中国
    document.querySelectorAll('.yx-spot-title, .yx-spot-desc').forEach(function(el) {
        el.contentEditable = 'true';
        el.classList.add('editable');
    });
}

function tag(selector, key) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.contentEditable = 'true';
    el.classList.add('editable');
    el.dataset.key = key;
    el.onblur = saveEdits;
}

function saveEdits() {
    var data = {};
    try { data = JSON.parse(localStorage.getItem('inline_edits') || '{}'); } catch(e) {}
    document.querySelectorAll('.editable[data-key]').forEach(function(el) {
        data[el.dataset.key] = el.textContent.trim();
    });
    localStorage.setItem('inline_edits', JSON.stringify(data));
}

function savePosts() {
    var cards = document.querySelectorAll('.post-card');
    var posts = [];
    try { posts = JSON.parse(localStorage.getItem('site_edited_posts')); } catch(e) {}
    if (!posts || !posts.length) posts = JSON.parse(JSON.stringify(window.SITE_POSTS || window.POSTS || []));

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

function hidePostManager() {
    var posts = [];
    try { posts = JSON.parse(localStorage.getItem('site_edited_posts')); } catch(e) {}
    if (!posts || !posts.length) posts = JSON.parse(JSON.stringify(window.SITE_POSTS || window.POSTS || []));

    var msg = posts.map(function(p, i) {
        return i + ': ' + (p.hidden ? '[隐藏]' : '[显示]') + ' ' + p.title;
    }).join('\n');

    var choice = prompt('输入序号切换显隐，或输入 "del 序号" 删除：\n\n' + msg);
    if (!choice) return;

    if (choice.indexOf('del ') === 0) {
        var idx = parseInt(choice.replace('del ', ''));
        if (idx >= 0 && idx < posts.length) {
            if (confirm('确定删除「' + posts[idx].title + '」？')) {
                posts.splice(idx, 1);
            }
        }
    } else {
        var idx = parseInt(choice);
        if (idx >= 0 && idx < posts.length) {
            posts[idx].hidden = !posts[idx].hidden;
        }
    }
    localStorage.setItem('site_edited_posts', JSON.stringify(posts));
    localStorage.setItem('blog_posts', JSON.stringify(posts));
    location.reload();
}

// ==================== 图片插入 ====================
window.insertImage = function() {
    var sel = window.getSelection();
    var range = null;
    try { range = sel.getRangeAt(0); } catch(e) {}

    var url = prompt('输入图片地址（URL）：\n支持外链图片，如 Imgur、GitHub 图床等\nhttps://...');
    if (!url) return;

    var alt = prompt('图片描述（可选）：', '图片');

    var imgHTML = '' +
    '<div class="img-placeholder" contenteditable="false" style="margin:16px 0;">' +
        '<img src="' + url + '" alt="' + (alt || '图片') + '" style="max-width:100%;border-radius:8px;display:block;">' +
        '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;text-align:center;">' + (alt || '图片') + '</div>' +
    '</div>';

    // 如果光标在可编辑区域内，插入图片
    if (range && range.startContainer) {
        var node = range.startContainer;
        // 找到父级可编辑元素
        while (node && node !== document.body) {
            if (node.contentEditable === 'true' || node.classList.contains('editable')) {
                // 在光标位置之后插入
                range.collapse(false);
                var temp = document.createElement('span');
                temp.innerHTML = imgHTML;
                range.insertNode(temp);
                // 保存编辑
                saveEdits();
                savePosts();
                return;
            }
            node = node.parentNode;
        }
    }

    // 如果不在可编辑区域，在页面底部插入
    var container = document.querySelector('.article-body') || document.querySelector('.about-main') || document.querySelector('.hero-content');
    if (container) {
        container.insertAdjacentHTML('beforeend', imgHTML);
    }
    saveEdits();
    savePosts();
};

// ==================== 导出 ====================
function exportEdits() {
    var code = '';
    var edits = localStorage.getItem('inline_edits');
    if (edits) {
        code += '// 页面内容\nvar siteConfig = ' + edits + ';\n\n';
    }
    var posts = localStorage.getItem('site_edited_posts');
    if (posts) {
        code += '// 文章列表（替换 js/main.js 中 DEFAULT_POSTS）\nvar DEFAULT_POSTS = ' + posts + ';\n';
    }
    if (!code) { alert('没有修改'); return; }
    navigator.clipboard.writeText(code).then(function() {
        alert('代码已复制！\n打开 GitHub → blog → js/main.js → 粘贴替换 → Commit');
    });
}
