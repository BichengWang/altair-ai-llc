import { expect, test } from "@playwright/test";

test("homepage renders with auth entry points", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /local services, matched by ai/i })
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Login" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" }).first()).toBeVisible();
});

test("account route redirects guests to login", async ({ page }) => {
  await page.goto("/account");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /welcome back to altair/i })).toBeVisible();
});
