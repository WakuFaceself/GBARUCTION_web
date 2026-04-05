import { expect, test } from "@playwright/test";

test("root redirects to localized homepage", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/(zh|en)$/);
  await expect(page.getByRole("navigation").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /推荐|Current Recommendations/i })).toBeVisible();
});
