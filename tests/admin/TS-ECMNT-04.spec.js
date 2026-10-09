import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageEditCommunity
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้า Edit Community
 * Steps:
 * 1. คลิกปุ่ม "แก้ไข"
 * 2. ตรวจสอบว่า URL เป็น /admin/community/own/edit
 */
async function goToPageEditCommunity(page) {
  const addBtn = page.getByRole("button", { name: "แก้ไข" });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await expect(page).toHaveURL(/\/admin\/community\/own\/edit/);
}

test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });
  
/**
   * TS-ECMNT-04.1
   * เปิดสถานะชุมชน
   */
  test("TS-ECMNT-04.1: Enable community status", async ({ page }) => {
    await goToPageEditCommunity(page);

    let statusToggle = page.getByRole("switch");

    if ((await statusToggle.count()) === 0) {
      statusToggle = page.locator('input[type="checkbox"]').first();
    }

    await expect(statusToggle).toBeVisible();

    if (!(await statusToggle.isChecked())) {
      await statusToggle.click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
   await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-ECMNT-04.2
   * ปิดสถานะชุมชน
   */
  test("TS-ECMNT-04.2: Disable community status", async ({ page }) => {
    await goToPageEditCommunity(page);
    let statusToggle = page.getByRole("switch");
    if ((await statusToggle.count()) === 0) {
      statusToggle = page.locator('input[type="checkbox"]').first();
    }

    await expect(statusToggle).toBeVisible();
    if (await statusToggle.isChecked()) {
      await statusToggle.click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

});