# 爻爻 — 六爻决策助手

基于中国传统六爻（纳甲筮法）的 AI 决策辅助应用，融合京房八宫卦体系与现代大语言模型（Claude API）。

## 项目结构

```
decide/
├── backend/            # FastAPI 后端（Python）
│   ├── app/
│   │   ├── core/       # 核心算法：起卦/排盘/变卦/用神/旺衰
│   │   ├── data/       # 64 卦数据、纳甲、八卦
│   │   ├── models/     # SQLAlchemy 模型
│   │   ├── routers/    # API 路由（auth/qigua/interpret/...）
│   │   └── services/   # AI 解读 / RAG 知识库
│   └── requirements.txt
│
├── frontend/           # Taro 微信小程序（保留现有）
│
├── packages/
│   ├── shared/         # 共享包：类型/API 客户端/Hooks/设计 Token
│   ├── web/            # React 18 Web 应用（Vite + Tailwind + Three.js）
│   └── mobile/         # React Native 应用（Expo SDK 56）
│
├── docker-compose.yml  # PostgreSQL + Redis
├── pnpm-workspace.yaml # Monorepo 配置
└── turbo.json          # 构建编排
```

## 快速开始

### 前置条件

- Node.js >= 18
- pnpm >= 8
- Python >= 3.11
- Docker（用于 PostgreSQL/Redis）

### 1. 启动后端

```bash
# 启动 PostgreSQL + Redis
docker-compose up -d

# 安装 Python 依赖
cd backend
pip install -r requirements.txt

# 初始化数据库（种子数据）
python -m app.seed

# 启动 API 服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. 启动 Web 应用

```bash
pnpm install
pnpm dev:web
# 访问 http://localhost:5173
```

### 3. 启动 React Native 应用

```bash
pnpm dev:mobile
# 使用 Expo Go 扫码运行
```

### 4. 启动微信小程序

```bash
pnpm dev:mini
# 使用微信开发者工具打开 frontend/dist/
```

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 后端 | FastAPI + SQLAlchemy + PostgreSQL | RESTful API + SSE 流式 |
| AI | Claude API + RAG（ChromaDB） | 卦象智能解读 |
| Web | React 18 + Vite + Tailwind CSS | 现代响应式 Web 应用 |
| Web 3D | @react-three/fiber + drei | 铜钱翻转/卦象环/太极球 |
| Mobile | React Native + Expo SDK 56 | iOS + Android 原生体验 |
| 小程序 | Taro 3.6 + React | 微信小程序 |
| 共享 | TypeScript + pnpm workspace | 类型/API/Hooks 跨平台复用 |

## API 概览

| 路由 | 说明 |
|------|------|
| `POST /api/qigua/yao` | 铜钱摇卦 |
| `POST /api/qigua/number` | 数字起卦 |
| `POST /api/qigua/time` | 时间起卦 |
| `POST /api/qigua/paipan` | 完整排盘 |
| `POST /api/interpret/stream` | AI 解读（SSE 流式）|
| `GET /api/hexagrams` | 64 卦列表 |
| `POST /api/auth/login` | 手机号登录 |
| `POST /api/conversations` | 创建 AI 对话 |
| `POST /api/conversations/:id/stream` | 对话 SSE 流式 |

完整 API 文档：启动后端后访问 `http://localhost:8000/docs`

## 命令速查

```bash
# Web
pnpm dev:web          # 开发
pnpm build:web        # 构建

# Mobile
pnpm dev:mobile       # Expo 开发
pnpm build:mobile     # EAS Build

# Mini Program
pnpm dev:mini         # 小程序开发
pnpm build:mini       # 小程序构建

# 代码质量
pnpm typecheck        # 全仓类型检查
```
