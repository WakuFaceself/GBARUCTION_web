import { expect, test } from "@playwright/test";

test("public browsing shell covers recommendations, shows, interviews, search, and poster lab", async ({
  page,
}) => {
  await page.goto("/zh");

  await expect(page.getByRole("link", { name: "推荐" })).toBeVisible();
  await expect(page.getByRole("link", { name: "演出" })).toBeVisible();
  await expect(page.getByRole("link", { name: "采访" })).toBeVisible();
  await expect(page.getByRole("link", { name: "搜索" })).toBeVisible();
  await expect(page.getByRole("link", { name: "海报实验室" })).toBeVisible();

  await page.getByRole("link", { name: "推荐" }).click();
  await expect(page).toHaveURL(/\/zh\/recommend$/);
  await expect(page.getByRole("heading", { name: /推荐/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "霓虹漂移" })).toBeVisible();

  await page.getByRole("link", { name: "霓虹漂移" }).click();
  await expect(page).toHaveURL(/\/zh\/recommend\/neon-drift$/);
  await expect(page.getByRole("heading", { name: "霓虹漂移" })).toBeVisible();
  await expect(page.getByText("This is a single-language body example")).toBeVisible();

  await page.goto("/en/recommend/terminal-bloom");
  await expect(page.getByRole("heading", { name: "Terminal Bloom" })).toBeVisible();
  await expect(page.getByText("This page's body is shown in its original language.")).toBeVisible();
  await expect(page.getByText("这篇保留较短正文，用于支撑浏览与搜索演示。")).toBeVisible();

  await page.goto("/zh/shows");
  await expect(page.getByRole("heading", { name: /演出/ })).toBeVisible();
  await expect(page.getByText("地下信号")).toBeVisible();

  await page.goto("/zh/interviews");
  await expect(page.getByRole("heading", { name: /采访/ })).toBeVisible();
  await expect(page.getByText("与 Dust Operator 对话")).toBeVisible();

  await page.goto("/zh/search?q=drift");
  await expect(page.getByRole("heading", { name: /搜索/ })).toBeVisible();
  await expect(page.getByText("霓虹漂移")).toBeVisible();
  await expect(page.getByText("终端花开")).not.toBeVisible();

  await page.goto("/zh/poster-lab");
  await expect(page.getByRole("heading", { name: /海报实验室/ })).toBeVisible();
  await expect(page.getByText("尚未开放")).toBeVisible();
});
