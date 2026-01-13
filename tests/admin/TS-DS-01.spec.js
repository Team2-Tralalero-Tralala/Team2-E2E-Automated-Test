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


test.describe("Admin - Search Stores", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TC-DS-01.1
   * ค้นหาชื่อร้านค้า
   */
  test("TC-DS-01.1: Admin search store successfully", async ({
    page,
  }) => {
    await goToPageStore(page);

    await page.getByPlaceholder("ค้นหา").fill("ร้านเพื่อสุขภาพ");

    await expect(page).toHaveURL(/admin\/community\/stores/);

    await expect(
      page.getByRole("cell", { name: "ร้านเพื่อสุขภาพ" })
    ).toBeVisible();

  });

  /**
   * TC-CT-01.2
   * ค้นหาชื่อร้านค้าที่ไม่มีอยู่
   */
  test("TC-CT-01.2: Admin search store doesn't exist", async ({
    page,
  }) => {
    await goToPageStore(page);

    await page.getByPlaceholder("ค้นหา").fill("ร้านขายของชำ");

    await expect(page).toHaveURL(/admin\/community\/stores/);

    await expect(page.getByRole("cell", { name: "ไม่มีข้อมูล" })).toBeVisible();
  });

});