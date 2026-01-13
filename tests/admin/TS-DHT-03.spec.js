import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";



test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-DHT-03.1
   * เลือกจำนวนแถวต่อหน้า
   */
  test("TS-DHT-03.1:เลือกจำนวนแถวต่อหน้า", async ({ page }) => {
    const manageHomestays = page.getByRole("link", { name: "จัดการที่พัก" });
    await expect(manageHomestays).toBeVisible();
    await manageHomestays.click();

    await expect(page).toHaveURL(/.*\/community\/homestays/);
    await expect(page.locator("table")).toBeVisible();

    await page.locator(".px-4.text-base.font-light").first().click();
    await page.getByRole("button", { name: "10" }).click();
    await page.getByRole('option', { name: '50' }).click();
  });
});
