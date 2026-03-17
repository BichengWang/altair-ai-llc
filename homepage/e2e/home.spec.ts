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

  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
  await expect(page.getByRole("heading", { name: /welcome back to altair/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
  await expect(page.getByLabel("Email")).toHaveCount(0);
  await expect(page.getByLabel("Password")).toHaveCount(0);
});

test("workspace preview mode redirects guests into the workspace login", async ({ page }) => {
  await page.goto("/?app=workspace");

  await expect(page).toHaveURL(/\/login\?app=workspace$/);
  await expect(page.getByRole("heading", { name: /welcome back to altair/i })).toBeVisible();
  await expect(page.locator(".workspace-app-shell")).toBeHidden();
});

test("register route uses OAuth-only account creation", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: /create your altair account/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Register with Google" })).toBeEnabled();
  await expect(page.getByLabel("Full name")).toHaveCount(0);
  await expect(page.getByLabel("Email")).toHaveCount(0);
  await expect(page.getByLabel("Password")).toHaveCount(0);
});

test("consent route asks the user to authenticate before authorization", async ({ page }) => {
  await page.goto("/oauth/consent?authorization_id=auth-123");

  await expect(
    page.getByRole("heading", { name: /sign in to review this authorization request/i })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
  await expect(page.getByText(/authenticate the user first, then collect consent/i)).toBeVisible();
});
