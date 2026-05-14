// index.js - 直接读取 Archive.md 和 files 文件夹，无硬编码内容
(function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const panels = {
        home: document.getElementById('homePanel'),
        program: document.getElementById('programPanel'),
        website: document.getElementById('websitePanel')
    };

    // 切换标签页
    function switchTab(tabId) {
        navBtns.forEach(btn => {
            const btnTab = btn.getAttribute('data-tab');
            if (btnTab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        Object.keys(panels).forEach(key => {
            if (panels[key]) {
                if (key === tabId) {
                    panels[key].classList.add('active-panel');
                } else {
                    panels[key].classList.remove('active-panel');
                }
            }
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = btn.getAttribute('data-tab');
            if (tab === 'home') switchTab('home');
            else if (tab === 'program') switchTab('program');
            else if (tab === 'website') switchTab('website');
        });
    });

    // 转义 HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
            return c;
        });
    }

    // ========== 首页：直接读取 Archive.md ==========
    async function loadArchiveMarkdown() {
        const archiveContentDiv = document.getElementById('archiveContent');
        const snippetsContainer = document.getElementById('codeSnippets');
        const archiveUrl = './Archive/Archive.md';
        
        try {
            const response = await fetch(archiveUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: 未找到 Archive.md 文件`);
            }
            const markdownText = await response.text();
            
            // 显示原始 Markdown 内容（带格式）
            const formattedArchive = formatMarkdownToHtml(markdownText);
            archiveContentDiv.innerHTML = formattedArchive || `<pre style="white-space:pre-wrap;word-break:break-all;">${escapeHtml(markdownText)}</pre>`;
            
            // 提取代码片段
            const snippets = extractCodeSnippets(markdownText);
            if (snippets.length > 0) {
                snippetsContainer.innerHTML = snippets.map(s => `
                    <div class="snippet-item">
                        <div class="snippet-code">${escapeHtml(s.code)}</div>
                        <div class="snippet-desc">${escapeHtml(s.desc || '代码示例')}</div>
                    </div>
                `).join('');
            } else {
                snippetsContainer.innerHTML = '<div class="error-message">未找到代码片段，请在 Archive.md 中添加类似 "- 通过 `code` 描述" 的内容</div>';
            }
        } catch (err) {
            console.error('加载 Archive.md 失败:', err);
            archiveContentDiv.innerHTML = `<div class="error-message">❌ 无法加载 Archive.md 文件<br>请确保根目录下有 Archive/Archive.md 文件<br>错误: ${escapeHtml(err.message)}</div>`;
            snippetsContainer.innerHTML = '<div class="error-message">无法提取代码片段，请检查 Archive.md 文件是否存在</div>';
        }
    }
    
    // 简单的 Markdown 转 HTML（支持换行、代码块、列表）
    function formatMarkdownToHtml(md) {
        if (!md) return '';
        let html = md;
        
        // 处理代码块 ```code```
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
            return `<pre class="code-block" style="background:rgba(0,0,0,0.05);padding:0.75rem;border-radius:8px;overflow-x:auto;"><code>${escapeHtml(code)}</code></pre>`;
        });
        
        // 处理行内代码 `code`
        html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 6px;border-radius:6px;">$1</code>');
        
        // 处理标题 # 
        html = html.replace(/^### (.*)$/gm, '<h5 style="margin:12px 0 6px;color:#2c3e50;">$1</h5>');
        html = html.replace(/^## (.*)$/gm, '<h4 style="margin:12px 0 8px;color:#2c3e50;font-weight:600;">$1</h4>');
        html = html.replace(/^# (.*)$/gm, '<h3 style="margin:16px 0 10px;color:#1e2a3a;font-weight:700;">$1</h3>');
        
        // 处理无序列表 - 或 *
        html = html.replace(/^- (.*)$/gm, '<li style="margin-left:1.5rem;margin-bottom:4px;">• $1</li>');
        html = html.replace(/^\* (.*)$/gm, '<li style="margin-left:1.5rem;margin-bottom:4px;">• $1</li>');
        
        // 将连续的列表项包裹在 <ul> 中（简单处理）
        html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => {
            return `<ul style="margin:6px 0;">${match}</ul>`;
        });
        
        // 处理换行
        html = html.replace(/\n/g, '<br>');
        
        return `<div style="word-wrap:break-word;white-space:normal;">${html}</div>`;
    }
    
    // 提取代码片段（匹配 - 通过 `code` 描述 格式）
    function extractCodeSnippets(mdText) {
        const snippets = [];
        const lines = mdText.split(/\r?\n/);
        for (let line of lines) {
            // 匹配 "- 通过 `code` 描述"
            let match = line.match(/-\s*通过\s*`([^`]+)`\s*(.*)/);
            if (match) {
                snippets.push({ code: match[1], desc: match[2] || '代码示例' });
                continue;
            }
            // 匹配 "- `code` 描述"
            let genericMatch = line.match(/-\s*`([^`]+)`\s*(.*)/);
            if (genericMatch) {
                snippets.push({ code: genericMatch[1], desc: genericMatch[2] || '常用引用' });
                continue;
            }
            // 匹配 "描述：`code`"
            let colonMatch = line.match(/^[^-]*[：:]\s*`([^`]+)`\s*(.*)/);
            if (colonMatch && colonMatch[1]) {
                snippets.push({ code: colonMatch[1], desc: colonMatch[2] || line.substring(0, 30) });
            }
        }
        return snippets;
    }

    // ========== 程序面板：直接读取 files 文件夹，支持点击下载 ==========
    async function loadProgramFiles() {
        const container = document.getElementById('programFileList');
        if (!container) return;
        
        container.innerHTML = '<div class="loading-placeholder">正在扫描 files 文件夹...</div>';
        
        try {
            // 尝试通过 GitHub API 或目录列表获取文件
            // 由于 GitHub Pages 不支持自动目录列表，我们使用一个策略：
            // 预先定义一个文件列表配置文件 files/files.json，或者通过 fetch 逐个探测常用文件
            // 为了让功能完整，我会尝试两种方式：
            // 1. 尝试读取 files/files.json（如果用户创建了这个文件）
            // 2. 如果没有，则提供手动添加文件到 files 文件夹的指引，并展示已存在的常见文件
            
            let files = [];
            
            // 方式1: 尝试读取 files/files.json 配置文件
            try {
                const configResp = await fetch('./files/files.json');
                if (configResp.ok) {
                    const fileList = await configResp.json();
                    if (Array.isArray(fileList)) {
                        files = fileList;
                    }
                }
            } catch(e) {
                console.log('未找到 files/files.json，将尝试探测文件');
            }
            
            // 方式2: 如果没有配置文件，尝试探测常见文件类型
            if (files.length === 0) {
                // 常见的文件扩展名列表
                const commonFiles = [
                    'example.txt', 'sample.pdf', 'document.md', 'data.json', 
                    'script.py', 'notes.txt', 'readme.md'
                ];
                
                // 测试这些文件是否存在
                const testResults = await Promise.all(
                    commonFiles.map(async (filename) => {
                        try {
                            const resp = await fetch(`./files/${filename}`, { method: 'HEAD' });
                            if (resp.ok) {
                                // 获取文件大小
                                const size = resp.headers.get('Content-Length');
                                return {
                                    name: filename,
                                    size: size ? formatFileSize(parseInt(size)) : '未知大小',
                                    date: new Date().toLocaleDateString()
                                };
                            }
                        } catch(e) {}
                        return null;
                    })
                );
                
                files = testResults.filter(f => f !== null);
            }
            
            if (files.length === 0) {
                container.innerHTML = `
                    <div class="error-message">
                        ⚠️ files 文件夹中没有检测到文件<br><br>
                        <strong>使用方法：</strong><br>
                        1. 在项目根目录创建 files 文件夹<br>
                        2. 将文件放入 files 文件夹中<br>
                        3. 可选：创建 files/files.json 配置文件来定义文件列表<br><br>
                        <strong>files.json 格式示例：</strong><br>
                        <pre style="background:rgba(0,0,0,0.05);padding:0.5rem;">[
  {"name": "document.pdf", "size": "2.3 MB", "date": "2026-05-14"},
  {"name": "code.zip", "size": "1.1 MB", "date": "2026-05-13"}
]</pre>
                    </div>
                `;
                return;
            }
            
            renderFileTable(container, files);
            
        } catch (err) {
            console.error('加载 files 文件夹失败:', err);
            container.innerHTML = `<div class="error-message">无法加载文件列表: ${escapeHtml(err.message)}<br>请确保 files 文件夹存在，并包含文件</div>`;
        }
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (!bytes) return '未知';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }
    
    // 渲染文件表格，支持点击下载
    function renderFileTable(container, files) {
        const html = `
            <div style="display:flex; justify-content:space-between; padding:0.5rem 1rem; border-bottom:1px solid rgba(0,0,0,0.1); font-weight:bold; color:#2c3e50;">
                <span>文件名（点击下载）</span><span>日期</span><span>大小</span>
            </div>
            ${files.map(file => `
                <div class="file-row">
                    <span class="file-name" data-filename="${escapeHtml(file.name)}" data-filepath="./files/${escapeHtml(file.name)}">📄 ${escapeHtml(file.name)}</span>
                    <span class="file-date">${escapeHtml(file.date || '未知')}</span>
                    <span class="file-size">${escapeHtml(file.size || '未知')}</span>
                </div>
            `).join('')}
            <div style="padding:0.75rem; text-align:center; font-size:0.75rem; color:#5a6e7c;">
                💡 提示：点击文件名即可下载文件
            </div>
        `;
        container.innerHTML = html;
        
        // 绑定点击下载事件
        document.querySelectorAll('.file-name').forEach(elem => {
            elem.addEventListener('click', async (e) => {
                const filename = elem.getAttribute('data-filename');
                const filepath = elem.getAttribute('data-filepath');
                if (filepath) {
                    downloadFile(filepath, filename);
                }
            });
        });
    }
    
    // 下载文件
    async function downloadFile(url, filename) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('文件不存在');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            alert(`下载失败: ${err.message}\n请确保文件 ${filename} 存在于 files 文件夹中`);
        }
    }

    // ========== 网站面板 ==========
    async function loadWebsiteList() {
        const container = document.getElementById('websiteList');
        if (!container) return;
        
        const websites = [
            { name: 'LoliAPI - 随机图片/API', url: 'https://www.loliapi.com/', desc: '二次元与实用API' },
            { name: 'GitHub - LWIHX', url: 'https://github.com/lwihx', desc: '开源代码仓库' },
            { name: '背景图源', url: 'https://eo-img.iloli.love/i/pc/', desc: '高清壁纸资源' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/zh-CN/', desc: '前端技术文档' }
        ];
        
        container.innerHTML = websites.map(site => `
            <div class="website-row">
                <span class="website-name">🌐 <a href="${escapeHtml(site.url)}" target="_blank" rel="noopener" class="website-link">${escapeHtml(site.name)}</a></span>
                <span class="website-status">${escapeHtml(site.desc)}</span>
            </div>
        `).join('');
    }
    
    // 初始化
    async function init() {
        switchTab('home');
        await loadArchiveMarkdown();
        await loadProgramFiles();
        await loadWebsiteList();
        const container = document.querySelector('.app-container');
        if (container) container.classList.add('fade-in');
    }
    
    init();
})();