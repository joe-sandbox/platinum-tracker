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
  await expect(
    page.getByRole("heading", { name: "Guides", exact: true }),
  ).toBeVisible();
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

test("creates, edits, and deletes a game and guide", async ({ page }) => {
  const suffix = Date.now().toString();
  const gameTitle = `E2E Game ${suffix}`;
  const updatedGameTitle = `${gameTitle} Updated`;
  const guideTitle = `E2E Guide ${suffix}`;
  const updatedGuideTitle = `${guideTitle} Updated`;

  await page.goto("/games");
  await page.getByRole("button", { name: "Add game" }).click();
  await page.getByLabel("Title").fill(gameTitle);
  await page.getByLabel("Platform").fill("PlayStation 5");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: gameTitle })).toBeVisible();

  await page.getByRole("button", { name: `Edit ${gameTitle}` }).click();
  await page.getByLabel("Title").fill(updatedGameTitle);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("heading", { name: updatedGameTitle }),
  ).toBeVisible();

  await page.goto("/guides");
  await page.getByRole("button", { name: "Add guide" }).click();
  await page.getByLabel("Game").selectOption({ label: updatedGameTitle });
  await page.getByLabel("Title").fill(guideTitle);
  await page.getByLabel("Description").fill("Created by Playwright.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: guideTitle })).toBeVisible();

  await page
    .locator("article")
    .filter({ hasText: guideTitle })
    .getByRole("link", { name: "Manage content" })
    .click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByLabel("Name").fill("Document");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Document", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Add chapter" }).click();
  await page.getByLabel("Title").fill("Chapter One");
  await page.getByRole("button", { name: "Save" }).click();
  await page
    .getByRole("button", { name: "Add section to Chapter One" })
    .click();
  await page.getByLabel("Title").fill("Opening");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Add collectible" }).click();
  await page.getByLabel("Title").fill("Captain's Log");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Captain's Log")).toBeVisible();

  await page.getByRole("link", { name: "Back to guides" }).click();
  await page.getByRole("button", { name: `Edit ${guideTitle}` }).click();
  await page.getByLabel("Title").fill(updatedGuideTitle);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("heading", { name: updatedGuideTitle }),
  ).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: `Delete ${updatedGuideTitle}` })
    .click();
  await expect(
    page.getByRole("heading", { name: updatedGuideTitle }),
  ).not.toBeVisible();

  await page.goto("/games");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: `Delete ${updatedGameTitle}` })
    .click();
  await expect(
    page.getByRole("heading", { name: updatedGameTitle }),
  ).not.toBeVisible();
});
