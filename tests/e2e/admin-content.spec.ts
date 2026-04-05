import { expect, test } from "@playwright/test";

const routes = [
  { path: "/admin", heading: "Admin CMS" },
  { path: "/admin/recommendations", heading: "Recommendations" },
  { path: "/admin/recommendations/new", heading: "New recommendation" },
  { path: "/admin/shows", heading: "Shows" },
  { path: "/admin/shows/new", heading: "New show" },
  { path: "/admin/interviews", heading: "Interviews" },
  { path: "/admin/interviews/new", heading: "New interview" },
  { path: "/admin/pages", heading: "Pages" },
  { path: "/admin/pages/new", heading: "New page" },
  { path: "/admin/media", heading: "Media" },
  { path: "/admin/settings", heading: "Settings" },
  { path: "/admin/invites", heading: "Invites" },
] as const;

test("admin CMS shell and content scaffolding are reachable", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.getByRole("main").getByRole("heading", { name: route.heading })).toBeVisible();
  }

  await page.goto("/admin/recommendations/new");
  await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Body blocks" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "bodyBlocks" })).toBeVisible();
});
