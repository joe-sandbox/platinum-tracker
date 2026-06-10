import { expect, test } from "@playwright/test";

test("shows the starter application", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Platinum Tracker" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create your first guide" }),
  ).toBeVisible();
});
