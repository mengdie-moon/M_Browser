# M_browser 技术细节文档

## 1. 技术栈

- **开发框架:** Uni-app (基于 Vue.js)
- **核心语言:** JavaScript
- **样式预处理器:** SCSS
- **UI 组件库:** uView UI (版本 2.x)

## 2. 项目结构

```
D:/GitHub/M_browser/
├───App.vue                 # 应用的根组件
├───index.html              # H5 平台的入口文件
├───main.js                 # 项目入口文件，初始化 Vue 实例和全局配置
├───manifest.json           # Uni-app 项目的配置文件，用于配置应用名称、图标、权限等
├───pages.json              # Uni-app 页面路由配置和导航栏样式配置
├───uni.promisify.adaptor.js # Uni-app API Promise 化适配文件
��───uni.scss                # 全局 SCSS 样式文件
├───components/             # 自定义组件目录
│   ├───BottomBar/          # 底部导航栏组件
│   │   └───BottomBar.vue
│   ├───BottomBarNav/       # 底部导航项组件
│   │   └───BottomBarNav.vue
│   └───statusBarHeight/    # 状态栏高度适配组件
│       └───statusBarHeight.vue
├───pages/                  # 页面目录
│   ├───index/              # 首页
│   │   └───index.vue
│   └───searchPage/         # 搜索页面
│       └───searchPage.vue
├───static/                 # 静态资源目录，如图片、字体等
│   ├───logo.png
│   ├───index/
│   │   └───logo.png
│   └───startImg/           # 启动页图片资源
│       └───...
└───uni_modules/            # Uni-app 插件模块目录
    └───uview-ui/           # uView UI 组件库
        └───...
```

## 3. 环境搭建与运行

### 3.1 前提条件

- 已安装 Node.js (建议 LTS 版本)
- 已安装 HBuilderX (推荐使用 HBuilderX 进行开发和运行)

### 3.2 安装依赖

在项目根目录下打开终端，运行以下命令安装项目依赖：

```bash
npm install
# 或者使用 yarn
yarn install
```

### 3.3 运行项目

#### 3.3.1 在 HBuilderX 中运行

1.  打开 HBuilderX，导入 `D:/GitHub/M_browser` 项目。
2.  在 HBuilderX 顶部菜单栏选择 `运行` -> `运行到浏览器` 或 `运行到小程序模拟器` 或 `运行到手机或模拟器`，选择你希望运行的平台。

#### 3.3.2 通过命令行运行 (以 H5 为例)

```bash
npm run dev:h5
```

运行成功后，会在终端输出访问地址，通常是 `http://localhost:8080`。

### 3.4 构建项目

#### 3.4.1 在 HBuilderX 中构建

在 HBuilderX 顶部菜单栏选择 `发行` -> `H5` 或 `小程序` 或 `App`，根据提示进行构建。

#### 3.4.2 通过命令行构建 (以 H5 为例)

```bash
npm run build:h5
```

构建完成后，会在 `dist` 目录下生成对应平台的发布文件。

## 4. 使用说明

- **首页 (`pages/index/index.vue`):** 应用的起始页面，通常会展示一些常用功能或导航入口。
- **搜索页 (`pages/searchPage/searchPage.vue`):** 用户输入关键词进行搜索的页面。
- **底部导航栏 (`components/BottomBar/BottomBar.vue`):** 提供应用的主要导航入口，方便用户快速切换功能模块。
