好的！基于你提供的最新目录结构，我将生成一份更新的 **PRD（产品需求文档）**，确保与项目目录结构完全匹配，并涵盖所有核心功能和开发计划。

---

## 项目 PRD（产品需求文档）

### 1. **项目概述**
- **目标**：构建一个与 AWS Bedrock Agent 交互的 AI 对话界面，支持实时消息交互、消息历史记录和 Markdown 格式显示。
- **技术栈**：
  - **前端**：Next.js 14、TypeScript、TailwindCSS、Shadcn UI
  - **后端**：AWS Bedrock SDK（JavaScript/TypeScript）
- **核心功能**：
  1. AI 对话界面
  2. AWS Bedrock Agent 集成
  3. 清爽的 UI 设计（使用 Shadcn UI）

---

### 2. **项目目录结构**
```
├── README.md
├── app
│   ├── api
│   │   └── bedrock
│   │       └── route.ts          # Bedrock API 路由
│   ├── components
│   │   ├── ChatInput.tsx         # 聊天输入框组件
│   │   ├── MessageList.tsx       # 消息列表组件
│   │   └── MarkdownRenderer.tsx  # Markdown 渲染组件
│   ├── context
│   │   └── ChatContext.tsx       # 对话上下文管理
│   ├── favicon.ico
│   ├── fonts
│   ├── globals.css
│   ├── hooks
│   │   └── useChat.ts            # 聊天逻辑 Hook
│   ├── layout.tsx
│   ├── page.tsx                  # 首页（聊天界面）
│   └── utils
│       └── constants.ts          # 常量配置
├── components.json
├── lib
│   └── utils.ts                  # 工具函数
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

### 3. **核心功能需求**

#### 3.1 **AI 对话界面**
- **实时消息交互**：
  - 用户输入消息后，实时发送到 AWS Bedrock Agent 并获取响应。
  - 支持流式响应（Streaming Response），提升用户体验。
- **消息历史记录**：
  - 保存用户与 Agent 的对话历史。
  - 支持查看历史记录，并重新发送历史消息。
- **Markdown 格式显示**：
  - Agent 返回的消息支持 Markdown 渲染（如代码块、列表、加粗等）。

#### 3.2 **AWS Bedrock Agent 集成**
- **Agent 配置管理**：
  - 支持配置 AWS Bedrock Agent 的参数（如 Agent ID、Region 等）。
  - 配置信息存储在本地或通过环境变量管理。
- **对话上下文维护**：
  - 维护用户与 Agent 的对话上下文，确保多轮对话的连贯性。
- **错误处理机制**：
  - 捕获并处理 AWS Bedrock SDK 的错误（如网络错误、权限错误等）。
  - 提供友好的错误提示给用户。

---

### 4. **技术实现细节**

#### 4.1 **前端实现**
- **UI 框架**：
  - 使用 **Shadcn UI** 构建清爽的界面。
  - 主要组件：输入框、消息列表、按钮、加载状态等。
- **实时消息交互**：
  - 使用 **WebSocket** 或 **Server-Sent Events (SSE)** 实现流式响应。
- **Markdown 渲染**：
  - 使用 `react-markdown` 库渲染 Markdown 内容。

#### 4.2 **后端实现**
- **AWS Bedrock SDK 集成**：
  - 使用 AWS SDK v3 的 `@aws-sdk/client-bedrock-agent` 包与 Bedrock Agent 交互。
  - 主要 API：
    - `InvokeAgent`：发送用户输入并获取 Agent 响应。
    - `ListAgents`：获取可用的 Agent 列表（如果需要）。
- **对话上下文维护**：
  - 使用内存或数据库（如 Redis）存储对话上下文。
  - 每个用户的对话上下文通过唯一的 Session ID 标识。

#### 4.3 **项目结构**
- **`app/api/bedrock/route.ts`**：Bedrock API 路由，处理与 AWS Bedrock Agent 的交互。
- **`app/components/`**：包含所有 UI 组件（如 `ChatInput`、`MessageList`、`MarkdownRenderer`）。
- **`app/context/ChatContext.tsx`**：管理对话上下文。
- **`app/hooks/useChat.ts`**：封装聊天逻辑。
- **`app/page.tsx`**：首页（聊天界面）。

---
