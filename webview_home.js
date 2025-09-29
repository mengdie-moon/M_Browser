// webview_home.js - 用于 webview 内部的主页逻辑

const searchEngines = [
    { name: '百度', url: 'https://www.baidu.com/s?wd=' },
    { name: 'Google', url: 'https://www.google.com/search?q=' },
    { name: 'Bing', url: 'https://www.bing.com/search?q=' }
];

let currentSearchEngine = searchEngines[0]; // 默认使用百度

document.addEventListener('DOMContentLoaded', () => {
    console.log('Webview Home Page Loaded.');

    const homeSearchInput = document.getElementById('home-search-input');
    const searchEngineSelect = document.getElementById('search-engine-select');

    // 动态生成搜索引擎选项
    searchEngineSelect.innerHTML = searchEngines.map(engine => 
        `<option value="${engine.url}">${engine.name}</option>`
    ).join('');

    // 初始化选择器为当前默认搜索引擎
    searchEngineSelect.value = currentSearchEngine.url;

    // 搜索引擎选择器变化事件
    searchEngineSelect.addEventListener('change', (event) => {
        const selectedUrl = event.target.value;
        currentSearchEngine = searchEngines.find(engine => engine.url === selectedUrl);
        console.log('Webview Home: 当前搜索引擎:', currentSearchEngine.name);
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
});

function handleSearch(query) {
    let url = query;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.')) {
            url = 'https://' + url;
        } else {
            url = currentSearchEngine.url + encodeURIComponent(query);
        }
    }
    // 在当前 webview 中加载 URL
    window.location.href = url;
}
