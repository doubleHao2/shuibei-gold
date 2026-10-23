# 水贝金价/工费自动测算与朋友圈海报生成器

> 基于 **Vue 3 (Composition API `<script setup>`) + Tailwind CSS + HTML5 Canvas (html2canvas)** 开发的轻量级移动端珠宝营销工具。

专为深圳水贝黄金珠宝批发/零售展厅档口量身定制，解决每日大盘金价频繁波动、多工艺工费快速换算、以及微信朋友圈/小红书高清爆款海报即时制作的核心痛点。

---

## 🌟 核心功能与亮点

### 1. 今日大盘金价与行情看板
- **默认手动报价 620 元/克**，支持点击大字实时修改，或点击步进快捷键（`+1`、`+2`、`-1`、`-2`）；手动改价后界面自动标记为“手动报价”，不伪装为实时行情。
- **新浪财经 Au99.99 行情代理接口**：Node 服务端读取新浪公开接口 `gds_AU9999`，返回人民币/克价格、按昨收计算的涨跌幅、行情时间与来源；页面加载自动获取，之后每分钟刷新，刷新失败显示错误且保留上次有效报价。
- 新浪行情不开放浏览器 CORS，因此前端访问同源 `/api/gold-price`，由服务端请求新浪并将 GB18030 响应解析为 JSON。此实现不使用 NeoData、不需要 API Key，但新浪公开行情的授权、稳定性和更新频率不作保证；用于商业展示或传播前应核实供应商及交易所的信息使用许可。

### 2. 工艺类型与工费动态匹配
- 内置水贝核心工艺选项卡：
  - **古法金**（默认工费 `+65 元/克`，热销推荐）
  - **3D硬金**（默认工费 `+45 元/克`，精选工艺）
  - **普通足金**（默认工费 `+20 元/克`，经典百搭）
- 工费单价支持自由微调（步进 `-5` / `+5`），切换工艺时智能自动带入默认标准。

### 3. 克重输入与多维实时结算
- 支持手动输入任意克重（如 `12.50g`）及微调步进（`-0.5g` / `+0.5g`）。
- 底部配备常用爆款手镯/吊坠克重快捷气泡（`5.2g`、`8.8g`、`12.5g`、`18.6g`、`25.0g`、`36.8g`）。
- **实时严谨结算模型**：
  $$\text{单克综合价} = \text{大盘基准价} + \text{工费单价}$$
  $$\text{预估结算总价} = \text{克重} \times \text{单克综合价}$$
- 并列清晰展示：**金料总价值** 与 **工费总小计** 拆解。

### 4. 奢华黑金质感朋友圈海报（核心特色）
- **视觉风格**：深曜石黑背景（#0D0E12）结合香槟金高光（#F59E0B / #FDE047），暗夜微光质感。
- **动态海报内容**：
  - 商家档口名称（如“水贝·老周珠宝”）、源头直供徽章、专属防伪印章。
  - 今日大盘金价特大醒目徽标（透明公道）。
  - **爆款实拍图动态上传**：支持从手机/电脑本地上传实拍图，未上传时自动展示内置的高清黄金手镯矢量光晕艺术插图。
  - 首饰克重、工艺标签、工费标准与最终到手总价大字呈现。
  - 微信/咨询电话、正品国检复检背书。

### 5. 一键生成高清海报 (Retina 视网膜清晰度)
- 采用 **html2canvas** 引擎，设定 `scale: 2.5` 高清抗锯齿渲染。
- 一键导出 PNG 原图并自动触发浏览器下载保存。
- 贴心提供**手机端长按保存模态框**，微信内或手机浏览器长按图片即可直接“保存到手机相册”并发朋友圈。

---

## 📁 目录结构

```text
├── index.html                  # 核心入口页面（集成 Vue 3 + Tailwind CDN + html2canvas）
├── src/
│   ├── GoldPosterCalculator.vue # 核心单文件组件 (Vue 3 SFC)
│   ├── App.vue                 # 根组件
│   ├── main.js                 # Vue 3 入口
│   └── style.css               # 样式重置与微调规则
├── public/
│   └── _worker.js              # Cloudflare Pages 边缘代理（构建时自动打包至 dist 根目录）
├── functions/api/
│   └── gold-price.js           # Cloudflare Pages Functions 标准函数
├── api/
│   └── gold-price.js           # Vercel Serverless Function 原生处理函数
├── vercel.json                 # Vercel 自动化部署配置文件
├── dist/                       # npm run build 产物目录（包含 index.html、css 与 _worker.js）
├── package.json                # 工程依赖与 npm 脚本
├── server.js                   # 本地 Node 开发服务器与行情代理
├── vite.config.js              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
└── postcss.config.js           # PostCSS 配置
```

---

## 🚀 部署指引

本项目已做**多平台双适配（Cloudflare Pages + Vercel）**，支持当下无 GitHub 快速上线，以及未来账号恢复后无缝切换。

### 阶段一：当下应急上线（无需 GitHub，使用 Cloudflare Pages 网页直传）

当 GitHub 账号无法使用时，可以直接通过 Cloudflare 网页端拖拽上传 `dist` 目录完成部署。项目中已内置 `public/_worker.js`，打包后会自动随同上传并在 Cloudflare 边缘节点运行 `/api/gold-price`，**无需单独配置后端服务器**。

1. **本地执行打包**：
   ```bash
   npm run build
   ```
   打包完成后，确认项目根目录下生成了 `dist` 文件夹，里面包含：
   - `index.html`（前端页面）
   - `assets/*.css`（打包样式）
   - `_worker.js`（Cloudflare Pages 边缘行情代理）

2. **在 Cloudflare 控制台直接上传**：
   - 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
   - 在左侧菜单中进入 **Workers & Pages** -> 点击 **Create Application**（创建应用程序）。
   - 选中 **Pages** 选项卡 -> 点击 **Upload assets**（上传资产 / Direct Upload）。
   - 输入项目名称（例如 `shuibei-gold`）。
   - **将本地 `dist` 文件夹直接拖拽放入上传虚线框中**（也可以把 `dist` 目录内的文件打包为 zip 上传）。
   - 点击 **Deploy site**（部署站点）。

3. **上线使用**：
   - 数秒内即部署完成，分配 `https://<你的项目名>.pages.dev` 访问链接。
   - 外部访客打开即可完整使用测算器、海报导出功能，大盘金价也会自动从新浪 Au99.99 实时拉取。

---

### 阶段二：后续平滑迁移（GitHub 恢复后，接入 Vercel 主力维护）

当 GitHub 账号申诉成功后，可无缝切换到 Vercel，享受 Git 自动集成与 CI/CD 自动部署。

1. **代码推送到 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "feat: complete gold calculator with dual platform deployment"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

2. **导入至 Vercel**：
   - 登录 [Vercel 控制台](https://vercel.com/) -> 点击 **Add New...** -> 选择 **Project**。
   - 导入对应的 GitHub 仓库。
   - Vercel 会根据项目中的 `vercel.json` 自动识别：
     - 构建命令：`npm run build`
     - 输出目录：`dist`
     - 服务端函数：自动识别 `api/gold-price.js` 为 `/api/gold-price` Serverless 路由。
   - 点击 **Deploy** 即可一键上线。以后每次 `git push` 到 GitHub 都会自动触发预发与生产部署。

---

## 💻 本地开发与调试

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务与新浪行情代理（默认 http://127.0.0.1:4173）
npm run dev

# 3. 生产环境预览
npm run build
npm run preview
```
