import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageStore - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการร้านค้า (Store Management)
 * Input: 
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 * 1. คลิกเมนู "จัดการร้านค้า" (Manage Stores)
 * 2. รอให้ระบบเปลี่ยนเส้นทางไปยังหน้าจัดการร้านค้า
 * Output:
 * - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /admin/community/stores
 */
async function goToPageStore(page) {

  const manageStore = page.getByRole("link", { name: "จัดการร้านค้า" });
  await expect(manageStore).toBeVisible();
  await manageStore.click();

  await expect(page).toHaveURL(/admin\/community\/stores/);
}


test.describe("Admin - Go to Next Page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "thanakorn");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TC-DS-04.1
   * ไปยังหน้าถัดไปของรายการร้านค้า
   */
  test("TC-DS-04.1: Admin search store successfully", async ({
    page,
  }) => {
    await goToPageStore(page);

     await page.getByRole('button', { name: 'ถัดไป' }).click();

    await expect(page).toHaveURL(/admin\/community\/stores/);

    await expect(page.getByRole('cell', { name: 'ป้านกน้อย' }).first()).toBeVisible();

  });

});