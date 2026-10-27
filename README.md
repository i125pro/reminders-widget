# Hello Widget React Example

这是一个基于 `Vite + React + TypeScript` 的 WidgetJS 示例项目。

## 项目特性

- 使用 `react-router-dom` 管理首页、组件页和配置页
- 直接复用 `@widget-js/react` 的 `WidgetWrapper`、`useWidget`、`useWidgetStorage`、`useWidgetTheme`
- 保留 `@widget-js/vite-plugin-widget` 打包流程，支持在线构建和离线 zip 构建

## 开发命令

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 构建在线包

```bash
npm run build
```

### 构建离线 zip 包

```bash
npm run build:offline
```

### 更新 WidgetJS 相关依赖

```bash
npm run update:widgetjs
```
