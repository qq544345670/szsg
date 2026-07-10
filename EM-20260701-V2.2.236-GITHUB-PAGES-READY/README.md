# 数智施工演示环境

这是一个用于产品演示的静态前端 Demo，已整理为适合 GitHub Pages 发布的目录结构。

## 在线发布

将本目录中的所有文件上传到 GitHub 仓库根目录，然后开启 GitHub Pages：

1. 进入仓库 `Settings`。
2. 打开 `Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，Folder 选择 `/root`。
5. 保存后等待 GitHub 生成访问地址。

访问地址通常为：

```text
https://你的用户名.github.io/仓库名/
```

## 目录结构

```text
.
├── index.html              # 页面入口
├── app.js                  # 页面逻辑与模拟数据
├── styles.css              # 全局样式
├── organization-data.js    # 组织基础数据
├── src/                    # 图片、图标、组件资源
├── data/                   # 演示数据与数据结构占位
├── docs/                   # 文档资料
├── CHANGELOG.txt           # 历史版本说明
└── .nojekyll               # GitHub Pages 静态资源开关
```

## 本地预览

可以直接使用任意静态服务器预览，例如：

```bash
npx serve .
```

或使用 VS Code 的 Live Server 插件打开 `index.html`。

## 注意事项

- GitHub Pages 只能托管静态文件，不能运行后端服务。
- 当前在线版本适合页面演示、交互预览和同事评审。
- 数据字典、组织、人员等在线维护后的服务端持久化，需要后续接入后端接口或使用本地服务版本。

## 当前版本

`EM-20260701-V2.2.236-GITHUB-PAGES-READY`
