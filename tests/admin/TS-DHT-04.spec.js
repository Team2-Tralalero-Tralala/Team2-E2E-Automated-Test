import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-DHT-04.1
   * ไปยังหน้าถัดไป หรือ ย้อนกลับ
   */
  test("TS-DHT-04.1:ไปยังหน้าถัดไป หรือ ย้อนกลับ", async ({ page }) => {
    const manageHomestays = page.getByRole("link", { name: "จัดการที่พัก" });
    await expect(manageHomestays).toBeVisible();
    await manageHomestays.click();

    await expect(page).toHaveURL(/.*\/community\/homestays/);
    await expect(page.locator("table")).toBeVisible();
    await page.getByRole("button", { name: "ถัดไป" }).click();
    await page.getByRole("button", { name: "ก่อนหน้า" }).click();
    await page.getByRole("button", { name: "ถัดไป" }).click();
  });
});
