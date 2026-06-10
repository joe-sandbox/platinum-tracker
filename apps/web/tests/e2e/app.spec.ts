import { expect, test } from "@playwright/test";

test("navigates through the application shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Stored locally")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Guides" })
    .click();

  await expect(page).toHaveURL(/\/guides$/);
  await expect(page.getByRole("heading", { name: "Guides" })).toBeVisible();
});

test("uses mobile navigation on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileNavigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });

  await expect(mobileNavigation).toBeVisible();
  await mobileNavigation.getByRole("link", { name: "Settings" }).click();

  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});
