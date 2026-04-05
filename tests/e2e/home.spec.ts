import { expect, test } from "@playwright/test";

test("root redirects to localized homepage", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/(zh|en)$/);
  await expect(page.locator("nav")).toBeVisible();
});
