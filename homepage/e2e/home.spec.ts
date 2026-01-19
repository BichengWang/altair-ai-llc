import { expect, test } from "@playwright/test";

test("homepage renders and regenerates hero", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /local services platform powered with ai/i })
  ).toBeVisible();

  const hero = page.locator("[data-seed]");
  const initialSeed = await hero.getAttribute("data-seed");

  await page.getByRole("button", { name: /generate new image/i }).click();

  await expect(hero).not.toHaveAttribute("data-seed", initialSeed ?? "");
});
