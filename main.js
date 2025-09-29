const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true // 启用 webview 标签
    }
  });

  // 加载 Uni-app 构建后的 H5 页面
  // 在 Electron 中，通常会加载一个本地的 HTML 文件
  // 这里我们暂时加载一个空白页面，稍后会配置加载 Uni-app 的 H5 产物
  mainWindow.loadFile('index.html'); // 假设根目录有一个 index.html

  // 打开开发者工具
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
