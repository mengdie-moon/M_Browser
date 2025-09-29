// Electron 渲染进程的入口文件
// 这里将放置纯 JavaScript 逻辑来构建和管理 UI

document.addEventListener('DOMContentLoaded', () => {
    console.log('M_browser 渲染进程已加载。');
    renderHomePage();
});

// 定义搜索引擎列表
const searchEngines = [
    { name: '百度', url: 'https://www.baidu.com/s?wd=' },
    { name: 'Google', url: 'https://www.google.com/search?q=' },
    { name: 'Bing', url: 'https://www.bing.com/search?q=' }
];

let currentSearchEngine = searchEngines[0]; // 默认使用百度

// 多标签页相关变量
let tabs = []; // 存储所有标签页对象
let activeTabId = null; // 当前活动标签页的 ID
let nextTabId = 0; // 用于生成新的标签页 ID

// 获取当前文件所在的目录，用于构建本地文件路径
const currentDir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
const webviewHomePath = `${currentDir}/webview_home.html`;

function renderHomePage() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
        <div class="container">
            <div class="header">
                <div class="header-left">
                    <span class="icon search-icon">&#128269;</span> <!-- 搜索图标 -->
                    <span class="header-text">主页</span>
                </div>
                <div class="header-right">
                    <span class="icon scan-icon">&#128290;</span> <!-- 扫描图标 -->
                </div>
            </div>
            <div class="main-content">
                <div class="logo">
                    <img src="./origin/static/index/logo.png" alt="Logo">
                </div>
                <div class="search-box">
                    <span class="icon search-icon-in-box">&#128269;</span>
                    <input type="text" id="home-search-input" placeholder="搜索或输入网址" />
                    <select id="search-engine-select">
                        ${searchEngines.map(engine => `<option value="${engine.url}">${engine.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div id="bottom-navigation-bar"></div> <!-- 底部导航栏容器 -->
        </div>
    `;

    // 渲染底部导航栏
    renderBottomNavigationBar('home');

    // 获取元素并添加事件监听器
    const homeSearchInput = document.getElementById('home-search-input');
    const searchEngineSelect = document.getElementById('search-engine-select');

    // 初始化选择器为当前默认搜索引擎
    searchEngineSelect.value = currentSearchEngine.url;

    // 搜索引擎选择器变化事件
    searchEngineSelect.addEventListener('change', (event) => {
        const selectedUrl = event.target.value;
        currentSearchEngine = searchEngines.find(engine => engine.url === selectedUrl);
        console.log('当前搜索引擎:', currentSearchEngine.name);
    });

    // 首页搜索框回车事件
    homeSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = homeSearchInput.value;
            if (query) {
                handleSearch(query);
            }
        }
    });
}

function renderBrowserPage(initialUrl = webviewHomePath) {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
        <div class="container">
            <div class="browser-header">
                <button id="browser-home-button">首页</button>
                <button id="browser-back-button">&#9664;</button>
                <button id="browser-forward-button">&#9654;</button>
                <button id="browser-refresh-button">&#8635;</button>
                <input type="text" id="browser-url-input" class="browser-url-input" />
                <button id="browser-go-button">前往</button>
            </div>
            <div class="tab-bar" id="tab-bar">
                <button id="new-tab-button">+</button>
            </div>
            <div class="webview-views" id="webview-views">
                <!-- webview 元素将动态添加到这里 -->
            </div>
            <div id="bottom-navigation-bar"></div> <!-- 底部导航栏容器 -->
        </div>
    `;

    // 渲染底部导航栏
    renderBottomNavigationBar('browser');

    // 获取元素
    const urlInput = document.getElementById('browser-url-input');
    const goButton = document.getElementById('browser-go-button');
    const backButton = document.getElementById('browser-back-button');
    const forwardButton = document.getElementById('browser-forward-button');
    const refreshButton = document.getElementById('browser-refresh-button');
    const homeButton = document.getElementById('browser-home-button');
    const newTabButton = document.getElementById('new-tab-button');

    // 添加事件监听器
    goButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            let targetUrl = urlInput.value;
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                if (targetUrl.includes('.')) {
                    targetUrl = 'https://' + targetUrl;
                } else {
                    targetUrl = currentSearchEngine.url + encodeURIComponent(targetUrl);
                }
            }
            activeWebview.loadURL(targetUrl);
        }
    });

    urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            goButton.click();
        }
    });

    backButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview && activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
    });

    forwardButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview && activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
    });

    refreshButton.addEventListener('click', () => {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            activeWebview.reload();
        }
    });

    homeButton.addEventListener('click', () => {
        renderHomePage();
    });

    newTabButton.addEventListener('click', () => {
        addTab(webviewHomePath, true);
    });

    // 如果没有标签页，则添加一个默认标签页
    if (tabs.length === 0) {
        addTab(initialUrl, true);
    } else {
        // 重新渲染时，确保激活的标签页和 webview 是正确的
        updateBrowserUI();
    }
}

function renderBottomNavigationBar(currentPage) {
    const bottomBarContainer = document.getElementById('bottom-navigation-bar');
    if (!bottomBarContainer) return;

    let toolbarContent = '';
    if (currentPage === 'home') {
        toolbarContent = `
            <span class="toolbarIcon" id="nav-home-button">&#127963;</span> <!-- 首页 -->
            <span class="toolbarIcon" id="nav-search-button">&#128269;</span> <!-- 搜索 -->
            <span class="toolbarIcon" id="nav-tabs-button">&#128450;</span> <!-- 标签页列表 -->
        `;
    } else if (currentPage === 'browser') {
        toolbarContent = `
            <span class="toolbarIcon" id="nav-home-button">&#127963;</span> <!-- 首页 -->
            <span class="toolbarIcon" id="nav-search-button">&#128269;</span> <!-- 搜索 (新建主页标签页) -->
            <span class="toolbarIcon" id="nav-tabs-button">&#128450;</span> <!-- 标签页列表 (新建空白标签页) -->
        `;
    }

    bottomBarContainer.innerHTML = `
        <div class="footer">
            <div class="toolbar">
                ${toolbarContent}
            </div>
        </div>
    `;

    const navHomeButton = document.getElementById('nav-home-button');
    const navSearchButton = document.getElementById('nav-search-button');
    const navTabsButton = document.getElementById('nav-tabs-button');

    // 导航按钮事件监听器
    if (navHomeButton) {
        navHomeButton.addEventListener('click', () => {
            renderHomePage();
        });
    }

    if (navSearchButton) {
        navSearchButton.addEventListener('click', () => {
            // 在浏览器页面点击搜索，新建一个主页标签页
            addTab(webviewHomePath, true);
        });
    }

    if (navTabsButton) {
        navTabsButton.addEventListener('click', () => {
            // 在浏览器页面点击标签页列表，新建一个空白标签页
            addTab(webviewHomePath, true); // 默认加载自定义主页
        });
    }

    // 底部导航栏不再有后退/前进，所以不需要更新其状态
}

function updateNavigationButtonStates(currentPage) {
    // 浏览器头部的导航按钮
    const browserBackButton = document.getElementById('browser-back-button');
    const browserForwardButton = document.getElementById('browser-forward-button');

    if (currentPage === 'browser') {
        const activeWebview = getActiveWebview();
        if (activeWebview) {
            const canGoBack = activeWebview.canGoBack();
            const canGoForward = activeWebview.canGoForward();

            if (browserBackButton) browserBackButton.disabled = !canGoBack;
            if (browserForwardButton) browserForwardButton.disabled = !canGoForward;
        } else {
            if (browserBackButton) browserBackButton.disabled = true;
            if (browserForwardButton) browserForwardButton.disabled = true;
        }
    } else {
        // 首页没有浏览器头部，所以不需要更新 browserBackButton/browserForwardButton
    }
}

function handleSearch(query) {
    let url = query;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.')) {
            url = 'https://' + url;
        } else {
            url = currentSearchEngine.url + encodeURIComponent(query);
        }
    }
    // 如果当前是首页，则切换到浏览器页面并添加新标签页
    if (document.getElementById('home-search-input')) {
        renderBrowserPage(url);
    } else {
        // 如果已经在浏览器页面，则在当前活动标签页加载 URL，或者新建一个标签页加载 URL
        if (activeTabId !== null) {
            const activeWebview = getActiveWebview();
            if (activeWebview) {
                activeWebview.loadURL(url);
            }
        } else {
            addTab(url, true);
        }
    }
}

function addTab(url, isActive = true) {
    const tabId = nextTabId++;
    const newTab = {
        id: tabId,
        url: url,
        title: '新标签页',
        isActive: isActive
    };
    tabs.push(newTab);

    const webviewViews = document.getElementById('webview-views');
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.src = url;
    webview.style.width = '100%';
    webview.style.height = '100%';
    webview.style.border = 'none';
    webview.setAttribute('webpreferences', 'contextIsolation=yes, enableRemoteModule=no'); // 增强安全性
    webviewViews.appendChild(webview);

    // 监听 webview 事件
    webview.addEventListener('dom-ready', () => {
        if (newTab.id === activeTabId) {
            document.getElementById('browser-url-input').value = webview.getURL();
        }
        updateNavigationButtonStates('browser'); // 更新导航按钮状态
    });

    webview.addEventListener('did-navigate', () => {
        newTab.url = webview.getURL();
        if (newTab.id === activeTabId) {
            document.getElementById('browser-url-input').value = newTab.url;
        }
        updateTabBar();
        updateNavigationButtonStates('browser'); // 更新导航按钮状态
    });

    webview.addEventListener('did-navigate-in-page', () => {
        newTab.url = webview.getURL();
        if (newTab.id === activeTabId) {
            document.getElementById('browser-url-input').value = newTab.url;
        }
        updateTabBar();
        updateNavigationButtonStates('browser'); // 更新导航按钮状态
    });

    webview.addEventListener('page-title-updated', (event) => {
        newTab.title = event.title;
        updateTabBar();
    });

    if (isActive) {
        switchTab(tabId);
    }
    updateTabBar();
}

function switchTab(tabId) {
    tabs.forEach(tab => {
        tab.isActive = (tab.id === tabId);
        const webview = document.getElementById(`webview-${tab.id}`);
        if (webview) {
            webview.style.display = tab.isActive ? 'flex' : 'none';
        }
    });
    activeTabId = tabId;
    updateTabBar();

    // 更新地址栏和导航按钮状态
    const activeWebview = getActiveWebview();
    if (activeWebview) {
        document.getElementById('browser-url-input').value = activeWebview.getURL();
    } else {
        document.getElementById('browser-url-input').value = '';
    }
    updateNavigationButtonStates('browser');
}

function closeTab(tabId) {
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex !== -1) {
        const closedTab = tabs[tabIndex];
        tabs.splice(tabIndex, 1);

        const webview = document.getElementById(`webview-${tabId}`);
        if (webview) {
            webview.remove();
        }

        if (closedTab.isActive && tabs.length > 0) {
            // 如果关闭的是活动标签页，则激活下一个标签页
            const newActiveTab = tabs[Math.min(tabIndex, tabs.length - 1)];
            switchTab(newActiveTab.id);
        } else if (tabs.length === 0) {
            // 如果所有标签页都���闭了，则返回首页
            activeTabId = null;
            renderHomePage();
            return;
        }
        updateTabBar();
        updateNavigationButtonStates('browser'); // 更新导航按钮状态
    }
}

function updateTabBar() {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    // 清空除了新建按钮之外的所有标签页按钮
    Array.from(tabBar.children).forEach(child => {
        if (child.id !== 'new-tab-button') {
            child.remove();
        }
    });

    tabs.forEach(tab => {
        const tabButton = document.createElement('button');
        tabButton.className = `tab-button ${tab.isActive ? 'active' : ''}`;
        tabButton.innerHTML = `
            <span class="tab-title">${tab.title}</span>
            <span class="close-tab-button" data-tab-id="${tab.id}">&times;</span>
        `;
        tabButton.addEventListener('click', (event) => {
            if (!event.target.classList.contains('close-tab-button')) {
                switchTab(tab.id);
            }
        });
        tabBar.insertBefore(tabButton, document.getElementById('new-tab-button'));
    });

    // 为关闭按钮添加事件监听器
    document.querySelectorAll('.close-tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const tabId = parseInt(event.target.dataset.tabId);
            closeTab(tabId);
            event.stopPropagation(); // 阻止事件冒泡到标签页按钮，避免切换标签页
        });
    });

    // 更新地址栏 URL
    const activeWebview = getActiveWebview();
    if (activeWebview) {
        document.getElementById('browser-url-input').value = activeWebview.getURL();
    } else {
        document.getElementById('browser-url-input').value = '';
    }
}

function getActiveWebview() {
    if (activeTabId !== null) {
        return document.getElementById(`webview-${activeTabId}`);
    }
    return null;
}

function updateBrowserUI() {
    // 确保地址栏和导航按钮的状态与当前活动标签页匹配
    const activeWebview = getActiveWebview();
    const urlInput = document.getElementById('browser-url-input');
    const browserBackButton = document.getElementById('browser-back-button');
    const browserForwardButton = document.getElementById('browser-forward-button');

    if (activeWebview) {
        urlInput.value = activeWebview.getURL();
        if (browserBackButton) browserBackButton.disabled = !activeWebview.canGoBack();
        if (browserForwardButton) browserForwardButton.disabled = !activeWebview.canGoForward();
    } else {
        urlInput.value = '';
        if (browserBackButton) browserBackButton.disabled = true;
        if (browserForwardButton) browserForwardButton.disabled = true;
    }
}
