# CST8504 Python 学习与考试系统

AI 驱动的 Python 学习与考试系统，专为 CST8504 期中考试练习设计。

## 功能特性

- 📚 **智能学习系统**: AI 驱动的 Python 概念学习
- 🎯 **练习模式**: 多种题型练习（选择题、填空题、代码题）
- 📊 **可视化图表**: 支持 matplotlib 图表生成和显示
- 🧠 **智能提示**: 根据学习进度提供个性化提示
- 📈 **进度跟踪**: 实时跟踪学习进度和成绩

## 技术栈

- **前端**: React 18 + Vite
- **UI 组件**: Tailwind CSS + Lucide React
- **图表库**: Recharts (替代 matplotlib)
- **代码高亮**: React Syntax Highlighter
- **路由**: React Router DOM

## 本地开发

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## GitHub Pages 部署

### 自动部署

项目已配置 GitHub Actions 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 会自动构建并部署到 GitHub Pages
3. 访问地址: `https://yourusername.github.io/cst8504-aat-midterm-practice-project/`

### 手动部署

1. 构建项目：

   ```bash
   npm run build
   ```

2. 将 `dist` 文件夹内容推送到 `gh-pages` 分支

### 配置 GitHub Pages

1. 进入仓库的 Settings
2. 找到 Pages 设置
3. 选择 Source: "GitHub Actions"
4. 保存设置

## 项目结构

```
src/
├── components/          # React组件
│   └── ...
├── pages/              # 页面组件
│   ├── Home.jsx        # 首页
│   ├── Practice.jsx    # 练习页面
│   ├── Exam.jsx        # 考试页面
│   └── ...
├── data/               # 数据文件
│   └── questions.js    # 题目数据
└── App.jsx             # 主应用组件
```

## 特色功能

### 真正的 Python 代码执行

项目集成了**Pyodide**，可以在浏览器中运行真正的 Python 代码，支持：

- 完整的 Python 语法
- 标准库函数
- 科学计算库（NumPy、Pandas 等）
- 文件操作
- 网络请求
- 面向对象编程

### 智能图表生成

- 自动解析 matplotlib 代码
- 生成对应的 Recharts 图表
- 支持多种图表类型（线图、柱状图、散点图、饼图）

## 学习内容

- Python 基础语法
- 数据类型和变量
- 控制流（条件、循环）
- 函数定义和调用
- 数据结构（列表、字典）
- 文件操作
- 异常处理
- 面向对象编程

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 许可证

MIT License
