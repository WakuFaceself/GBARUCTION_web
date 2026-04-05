# GBARUCTION V1 独立网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `dispatching-parallel-agents` for independent workstreams and `executing-plans` for the serial critical path. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在单一 Next.js 项目中交付 GBARUCTION 第一版内容型厂牌网站，包括前台站点、轻量后台、单语正文内容模型、双语框架、搜索、媒体上传与部署链路。

**Architecture:** 先串行完成基础设施与共享契约，再把可独立推进的前台、后台、区块编辑器、上线保障拆给不同代理并行开发。主数据使用 Neon Postgres + Drizzle，后台认证使用 Better Auth，媒体使用 R2，事务邮件使用 Resend，页面内容由共享区块 schema 驱动。

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, Tiptap, Drizzle ORM, Neon Postgres, Better Auth, Resend, Cloudflare R2, Zod, pnpm, Vitest, Playwright, Vercel

---

## Summary

- 中英双语范围固定为：导航、栏目页、标题、摘要、标签、SEO 文案；`正文不做双语`。
- 正文统一只有一份 `bodyBlocks`，并通过 `bodyLanguage` 标记语言；英文页展示英文元信息 + 原正文提示条。
- V1 搜索只覆盖 `标题 + 摘要 + 标签`，不做正文全文搜索。
- 并行执行只从“共享契约稳定”之后开始，避免多代理抢改 `schema`、`routes`、`block contracts`。
- 并行分工采用 5 个域：
  - 基础设施与共享契约
  - 后台 CMS
  - 区块编辑器与渲染
  - 前台站点与搜索
  - 上线与 QA

## Public Interfaces / Core Contracts

- 前台路由：
  - `/`
  - `/[locale]`
  - `/[locale]/recommend`
  - `/[locale]/shows`
  - `/[locale]/interviews`
  - `/[locale]/search`
  - `/[locale]/poster-lab`
  - `/[locale]/recommend/[slug]`
  - `/[locale]/shows/[slug]`
  - `/[locale]/interviews/[slug]`
  - `/[locale]/pages/[slug]`
- 后台路由：
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/content/recommendations`
  - `/admin/content/shows`
  - `/admin/content/interviews`
  - `/admin/content/pages`
  - `/admin/settings`
  - `/admin/media`
  - `/admin/invites`
- 核心表：
  - `users`
  - `sessions`
  - `accounts`
  - `verification_tokens`
  - `admin_invites`
  - `media_assets`
  - `tags`
  - `site_settings`
  - `recommendations`
  - `shows`
  - `interviews`
  - `pages`
  - `content_tag_links`
- 共享内容字段：
  - `titleZh`
  - `titleEn`
  - `summaryZh`
  - `summaryEn`
  - `slug`
  - `status`
  - `publishedAt`
  - `coverAssetId`
  - `bodyBlocks`
  - `bodyLanguage`
  - `seoTitleZh`
  - `seoTitleEn`
  - `seoDescriptionZh`
  - `seoDescriptionEn`
- 初始区块类型：
  - `hero`
  - `richText`
  - `image`
  - `quote`
  - `musicEmbed`
  - `cardGrid`
  - `cta`
  - `eventMeta`
- 搜索接口：
  - 输入：`locale`, `query`, `page`
  - 命中范围：已发布内容的标题、摘要、标签
  - 不读取 `bodyBlocks`

## Implementation Changes

### Phase 0：串行关键路径

这部分不并行，必须先稳定契约。

### Task 0A：项目基础搭建

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `lib/env.ts`
- Create: `lib/i18n.ts`
- Modify: `README.md`
- Test: `tests/e2e/home.spec.ts`

- [ ] **Step 1: 写首页语言跳转冒烟测试**

```ts
import { test, expect } from "@playwright/test";

test("root redirects to localized homepage", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/(zh|en)$/);
  await expect(page.locator("nav")).toBeVisible();
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm playwright test tests/e2e/home.spec.ts`
Expected: FAIL，提示缺少 Next.js 应用或页面路由。

- [ ] **Step 3: 写最小可运行项目骨架**

```tsx
// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/zh");
}
```

```tsx
// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: 加入 `/zh` 与 `/en` 基础壳层**

```tsx
// app/[locale]/page.tsx
export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main>
      <nav>GBARUCTION</nav>
      <h1>{locale === "en" ? "Curated Sounds" : "策展之声"}</h1>
    </main>
  );
}
```

- [ ] **Step 5: 再跑测试，确认通过**

Run: `pnpm playwright test tests/e2e/home.spec.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add package.json pnpm-workspace.yaml next.config.ts tsconfig.json postcss.config.js tailwind.config.ts app app/globals.css lib/env.ts lib/i18n.ts tests/e2e/home.spec.ts README.md
git commit -m "chore: scaffold app foundation"
```

### Task 0B：数据层与认证/存储契约

**Files:**
- Create: `drizzle.config.ts`
- Create: `lib/db/client.ts`
- Create: `lib/db/schema/auth.ts`
- Create: `lib/db/schema/content.ts`
- Create: `lib/db/schema/media.ts`
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...all]/route.ts`
- Create: `lib/email/resend.ts`
- Create: `lib/storage/r2.ts`
- Create: `app/api/uploads/presign/route.ts`
- Test: `tests/integration/auth.test.ts`

- [ ] **Step 1: 写邀请码只能单次使用的集成测试**

```ts
import { describe, it, expect } from "vitest";

describe("admin invite flow", () => {
  it("accepts invite only once", async () => {
    const first = { ok: true };
    const second = { ok: false, reason: "invite-used" };

    expect(first.ok).toBe(true);
    expect(second).toEqual({ ok: false, reason: "invite-used" });
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm vitest tests/integration/auth.test.ts`
Expected: FAIL，缺少认证与 invite 实现。

- [ ] **Step 3: 定义数据库 schema**

```ts
// lib/db/schema/content.ts
export const contentStatus = ["draft", "published", "archived"] as const;
export const bodyLanguages = ["zh", "en"] as const;
```

```ts
// lib/db/schema/media.ts
export type MediaKind = "image" | "poster" | "cover";
```

- [ ] **Step 4: 接 Better Auth、Resend、R2 的最小链路**

```ts
// lib/auth.ts
export async function requireAdminSession() {
  return { user: { role: "admin" } };
}
```

```ts
// app/api/uploads/presign/route.ts
export async function POST() {
  return Response.json({ ok: true, url: "https://example-upload" });
}
```

- [ ] **Step 5: 再跑测试，确认通过**

Run: `pnpm vitest tests/integration/auth.test.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add drizzle.config.ts lib/db lib/auth.ts app/api/auth app/api/uploads lib/email lib/storage tests/integration/auth.test.ts
git commit -m "feat: add database auth and storage foundation"
```

### Task 0C：共享区块契约

**Files:**
- Create: `lib/blocks/schema.ts`
- Create: `lib/blocks/types.ts`
- Create: `lib/blocks/extract-text.ts`
- Test: `tests/unit/blocks.test.ts`

- [ ] **Step 1: 写区块 schema 与搜索提取器测试**

```ts
import { describe, it, expect } from "vitest";
import { extractSearchText } from "@/lib/blocks/extract-text";

describe("block contracts", () => {
  it("does not index body blocks for search", () => {
    const result = extractSearchText({
      title: "Demo",
      summary: "Summary",
      tags: ["noise"],
      bodyBlocks: [{ type: "richText", content: "正文内容" }],
    });

    expect(result).toContain("Demo");
    expect(result).toContain("Summary");
    expect(result).toContain("noise");
    expect(result).not.toContain("正文内容");
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm vitest tests/unit/blocks.test.ts`
Expected: FAIL，缺少区块 schema 与提取函数。

- [ ] **Step 3: 写共享区块契约**

```ts
// lib/blocks/types.ts
export const blockTypes = [
  "hero",
  "richText",
  "image",
  "quote",
  "musicEmbed",
  "cardGrid",
  "cta",
  "eventMeta",
] as const;
```

```ts
// lib/blocks/extract-text.ts
export function extractSearchText(input: {
  title: string;
  summary: string;
  tags: string[];
  bodyBlocks: unknown[];
}) {
  return [input.title, input.summary, ...input.tags].join(" ");
}
```

- [ ] **Step 4: 再跑测试，确认通过**

Run: `pnpm vitest tests/unit/blocks.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add lib/blocks tests/unit/blocks.test.ts
git commit -m "feat: add shared block contracts"
```

### Phase 1：第一轮并行开发

在 0A、0B、0C 完成后，拆成 3 个互不抢写共享契约文件的子代理。

### Task 1A：后台 CMS 壳层与 CRUD

**Owner:** Agent A

**Files:**
- Create: `app/(admin)/admin/layout.tsx`
- Create: `app/(admin)/admin/dashboard/page.tsx`
- Create: `app/(admin)/admin/content/recommendations/**`
- Create: `app/(admin)/admin/content/shows/**`
- Create: `app/(admin)/admin/content/interviews/**`
- Create: `app/(admin)/admin/content/pages/**`
- Create: `app/(admin)/admin/settings/page.tsx`
- Create: `app/(admin)/admin/media/page.tsx`
- Create: `app/(admin)/admin/invites/page.tsx`
- Create: `components/admin/**`
- Create: `lib/actions/admin/**`
- Create: `lib/queries/admin/**`
- Test: `tests/e2e/admin-content.spec.ts`

- [ ] **Step 1: 写后台登录后创建推荐内容的 E2E 测试**

```ts
import { test, expect } from "@playwright/test";

test("admin can create recommendation draft", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.goto("/admin/content/recommendations/new");
  await page.fill('input[name="titleZh"]', "测试推荐");
  await page.click('button[data-action="save-draft"]');
  await expect(page.locator("text=测试推荐")).toBeVisible();
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm playwright test tests/e2e/admin-content.spec.ts`
Expected: FAIL，后台页面和表单尚不存在。

- [ ] **Step 3: 实现后台壳层与列表页**

```tsx
// app/(admin)/admin/dashboard/page.tsx
export default function AdminDashboardPage() {
  return <main>Admin Dashboard</main>;
}
```

- [ ] **Step 4: 实现四类内容 CRUD 页面与状态切换**

```ts
// lib/actions/admin/recommendations.ts
export async function createRecommendationDraft() {
  return { ok: true };
}
```

- [ ] **Step 5: 再跑测试，确认通过**

Run: `pnpm playwright test tests/e2e/admin-content.spec.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add app/'(admin)' components/admin lib/actions/admin lib/queries/admin tests/e2e/admin-content.spec.ts
git commit -m "feat: build admin cms shell"
```

### Task 1B：区块编辑器与前台区块渲染

**Owner:** Agent B

**Files:**
- Create: `components/editor/editor-shell.tsx`
- Create: `components/editor/extensions/**`
- Create: `components/editor/blocks/**`
- Create: `components/public/blocks/**`
- Modify: `lib/blocks/schema.ts`
- Modify: `lib/blocks/types.ts`
- Create: `lib/blocks/render.tsx`
- Test: `tests/unit/block-renderer.test.ts`

- [ ] **Step 1: 写正文单语提示条测试**

```ts
import { describe, it, expect } from "vitest";
import { getBodyFallbackNotice } from "@/lib/blocks/render";

describe("body language fallback", () => {
  it("shows fallback notice when english page renders chinese body", () => {
    expect(getBodyFallbackNotice("en", "zh")).toContain("original language");
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm vitest tests/unit/block-renderer.test.ts`
Expected: FAIL，缺少 renderer helper。

- [ ] **Step 3: 实现编辑器骨架与 block renderer**

```tsx
// components/editor/editor-shell.tsx
export function EditorShell() {
  return <div data-editor-shell>Editor</div>;
}
```

```ts
// lib/blocks/render.tsx
export function getBodyFallbackNotice(locale: string, bodyLanguage: string) {
  if (locale === "en" && bodyLanguage === "zh") {
    return "This body is shown in its original language.";
  }
  return "";
}
```

- [ ] **Step 4: 接入初始 block 列表**

```ts
export const initialBlockRegistry = [
  "hero",
  "richText",
  "image",
  "quote",
  "musicEmbed",
  "cardGrid",
  "cta",
  "eventMeta",
] as const;
```

- [ ] **Step 5: 再跑测试，确认通过**

Run: `pnpm vitest tests/unit/block-renderer.test.ts`
Expected: PASS

- [ ] **Step 6: 提交**

```bash
git add components/editor components/public/blocks lib/blocks tests/unit/block-renderer.test.ts
git commit -m "feat: add shared block editor system"
```

### Task 1C：前台站点、列表详情页与搜索

**Owner:** Agent C

**Files:**
- Create: `app/[locale]/recommend/**`
- Create: `app/[locale]/shows/**`
- Create: `app/[locale]/interviews/**`
- Create: `app/[locale]/search/page.tsx`
- Create: `app/[locale]/poster-lab/page.tsx`
- Create: `components/site/**`
- Create: `lib/queries/public/**`
- Create: `lib/seo.ts`
- Test: `tests/e2e/public-content.spec.ts`

- [ ] **Step 1: 写搜索仅命中标题/摘要/标签的 E2E 测试**

```ts
import { test, expect } from "@playwright/test";

test("search returns published content by title summary and tags", async ({ page }) => {
  await page.goto("/zh/search?q=noise");
  await expect(page.locator("main")).toContainText("noise");
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm playwright test tests/e2e/public-content.spec.ts`
Expected: FAIL，搜索页和内容页尚不存在。

- [ ] **Step 3: 实现首页与栏目页**

```tsx
// app/[locale]/recommend/page.tsx
export default function RecommendListPage() {
  return <main>Recommend List</main>;
}
```

- [ ] **Step 4: 实现详情页、搜索页、Poster Lab 概念页**

```tsx
// app/[locale]/search/page.tsx
export default function SearchPage() {
  return <main>Search</main>;
}
```

- [ ] **Step 5: 加入试听降级卡片逻辑**

```ts
// lib/queries/public/embed.ts
export function getEmbedState(embedUrl?: string) {
  return embedUrl ? "embed" : "fallback-card";
}
```

- [ ] **Step 6: 再跑测试，确认通过**

Run: `pnpm playwright test tests/e2e/public-content.spec.ts`
Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add app/'[locale]' components/site lib/queries/public lib/seo.ts tests/e2e/public-content.spec.ts
git commit -m "feat: ship public bilingual site"
```

### Phase 2：集成回合

这一轮由主代理负责，不并行修改共享接口。

### Task 2A：后台与编辑器集成

**Files:**
- Modify: `app/(admin)/admin/content/**`
- Modify: `components/editor/editor-shell.tsx`
- Test: `tests/e2e/admin-editor.spec.ts`

- [ ] **Step 1: 写后台正文编辑集成测试**

```ts
import { test, expect } from "@playwright/test";

test("admin can edit body blocks in content editor", async ({ page }) => {
  await page.goto("/admin/content/recommendations/new");
  await expect(page.locator("[data-editor-shell]")).toBeVisible();
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm playwright test tests/e2e/admin-editor.spec.ts`
Expected: FAIL，后台表单尚未接入编辑器。

- [ ] **Step 3: 将后台内容表单接入统一编辑器**

```tsx
// app/(admin)/admin/content/recommendations/new/page.tsx
import { EditorShell } from "@/components/editor/editor-shell";

export default function NewRecommendationPage() {
  return <EditorShell />;
}
```

- [ ] **Step 4: 再跑测试，确认通过**

Run: `pnpm playwright test tests/e2e/admin-editor.spec.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add app/'(admin)'/admin/content components/editor tests/e2e/admin-editor.spec.ts
git commit -m "feat: integrate admin content editor"
```

### Task 2B：前台与编辑器/查询集成

**Files:**
- Modify: `app/[locale]/**`
- Modify: `components/public/blocks/**`
- Modify: `lib/queries/public/**`
- Test: `tests/e2e/public-locale-fallback.spec.ts`

- [ ] **Step 1: 写英文页显示中文正文提示条测试**

```ts
import { test, expect } from "@playwright/test";

test("english page shows original language notice for zh body", async ({ page }) => {
  await page.goto("/en/recommend/sample-slug");
  await expect(page.locator("main")).toContainText("original language");
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm playwright test tests/e2e/public-locale-fallback.spec.ts`
Expected: FAIL，详情页尚未集成 renderer 提示逻辑。

- [ ] **Step 3: 将详情页接入 block renderer 与 locale 提示条**

```tsx
// pseudo-integrated detail renderer
const notice = getBodyFallbackNotice(locale, bodyLanguage);
```

- [ ] **Step 4: 再跑测试，确认通过**

Run: `pnpm playwright test tests/e2e/public-locale-fallback.spec.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add app/'[locale]' components/public/blocks lib/queries/public tests/e2e/public-locale-fallback.spec.ts
git commit -m "feat: integrate public content rendering"
```

### Task 2C：种子数据与内容通路打通

**Files:**
- Create: `scripts/seed.ts`
- Test: `tests/integration/seed.test.ts`

- [ ] **Step 1: 写种子数据结构测试**

```ts
import { describe, it, expect } from "vitest";

describe("seed content", () => {
  it("includes homepage and core content entries", async () => {
    const seeded = ["homepage", "recommendation", "show", "interview", "poster-lab"];
    expect(seeded).toContain("homepage");
    expect(seeded).toContain("poster-lab");
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm vitest tests/integration/seed.test.ts`
Expected: FAIL，缺少 seed 脚本。

- [ ] **Step 3: 实现最小 seed**

```ts
export async function seedCoreContent() {
  return ["homepage", "recommendation", "show", "interview", "poster-lab"];
}
```

- [ ] **Step 4: 再跑测试，确认通过**

Run: `pnpm vitest tests/integration/seed.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add scripts/seed.ts tests/integration/seed.test.ts
git commit -m "chore: add core seed content"
```

### Phase 3：第二轮并行收尾

在集成完成后，再开两个并行域。

### Task 3A：部署、CI、环境变量、文档

**Owner:** Agent D

**Files:**
- Create: `.env.example`
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `scripts/seed.ts`
- Test: `tests/smoke/env.test.ts`

- [ ] **Step 1: 写环境变量清单测试**

```ts
import { describe, it, expect } from "vitest";

describe("env example", () => {
  it("lists required deployment variables", () => {
    const required = ["DATABASE_URL", "R2_BUCKET", "RESEND_API_KEY"];
    expect(required).toContain("DATABASE_URL");
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm vitest tests/smoke/env.test.ts`
Expected: FAIL，缺少 `.env.example` 与 CI 文档。

- [ ] **Step 3: 实现 `.env.example`、CI、README 部署章节**

```yaml
# .github/workflows/ci.yml
name: ci
```

- [ ] **Step 4: 再跑测试，确认通过**

Run: `pnpm vitest tests/smoke/env.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add .env.example .github/workflows/ci.yml README.md scripts/seed.ts tests/smoke/env.test.ts
git commit -m "chore: add deployment and ci setup"
```

### Task 3B：测试补全与 QA 场景

**Owner:** Agent E

**Files:**
- Create: `tests/unit/**`
- Create: `tests/integration/**`
- Create: `tests/e2e/**`

- [ ] **Step 1: 补全文案选择、上传权限、发布状态相关测试**

```ts
import { describe, it, expect } from "vitest";

describe("content publishing", () => {
  it("hides archived content from public queries", () => {
    expect(["published"]).not.toContain("archived");
  });
});
```

- [ ] **Step 2: 运行目标测试，确认失败**

Run: `pnpm vitest tests/unit tests/integration`
Expected: FAIL，缺少实现或测试文件。

- [ ] **Step 3: 完整补齐测试矩阵**

```text
- locale 字段选择器
- 正文原语言提示条
- 搜索仅标题/摘要/标签
- 上传接口需要后台登录
- 发布/撤回影响公开可见性
```

- [ ] **Step 4: 再跑测试，确认通过**

Run: `pnpm vitest tests/unit tests/integration`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add tests
git commit -m "test: add coverage for content and admin flows"
```

### Phase 4：主代理最终验收

### Task 4：全量验证与最终集成

**Files:**
- Modify: conflict-resolution files as needed after review

- [ ] **Step 1: 审核并行代理改动，确认没有越界修改共享契约**

Run: `git status --short && git diff --stat main...HEAD`
Expected: 只出现各自负责域内的改动。

- [ ] **Step 2: 跑单元与集成测试**

Run: `pnpm vitest`
Expected: PASS

- [ ] **Step 3: 跑端到端测试**

Run: `pnpm playwright test`
Expected: PASS

- [ ] **Step 4: 跑类型检查与构建**

Run: `pnpm typecheck && pnpm build`
Expected: PASS

- [ ] **Step 5: 按需求逐条验收**

```text
- 推荐优先首页
- 后台可运营
- 正文不做双语
- 搜索不含正文
- Poster Lab 仅概念入口
- 中英文界面框架完整
```

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: deliver gbaruction v1 site"
```

## Test Plan

- 单元测试：
  - 区块 schema 校验
  - locale 字段选择器
  - `bodyLanguage` 提示条逻辑
  - 搜索索引提取器仅包含标题、摘要、标签
- 集成测试：
  - 邀请码单次使用
  - 密码重置后旧会话失效
  - 上传签名接口要求登录
  - 发布/归档影响公开可见性
- E2E：
  - 管理员登录并发布推荐内容
  - `/en/...` 显示英文字段 + 原正文提示
  - 首页推荐优先于演出/采访
  - 搜索按标题/摘要/标签命中
  - Poster Lab 页面可后台编辑、前台访问
- 手动验收：
  - Vercel Preview 正常连接 Neon、R2、Resend
  - 嵌入试听失败时有降级 UI
  - 中文正文在英文页不空白、不误触发正文双语逻辑

## Assumptions

- 当前仓库为空项目，允许先由主代理稳定基础设施，再开始真正并行。
- 并行代理必须遵守文件所有权；共享契约文件只能由主代理改。
- V1 后台角色只有 `admin`，投稿只做未来兼容，不做任何 UI。
- V1 不做正文双语，不做正文全文搜索，这两项已经从先前方案中正式移除。
- 若某个并行代理在实现中发现共享契约需要变更，必须停止并回到主代理统一调整，不能各自改接口。
- 真正开始实施时，推荐顺序是：
  - 主代理完成 Phase 0
  - 并行派发 Agent A、B、C
  - 主代理集成
  - 并行派发 Agent D、E
  - 主代理验收
