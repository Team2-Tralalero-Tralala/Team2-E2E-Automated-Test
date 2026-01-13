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


test.describe("Admin - Delete Stores", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TC-DS-02.1
   * คลิกปุ่มไอคอน (Icon Button) "ถังขยะ"ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)
   */
  test("TC-DS-02.1: Admin delete store show modal", async ({
    page,
  }) => {
    await goToPageStore(page);

    await page.getByRole('row', { name: 'ร้านเพื่อสุขภาพ' }).getByLabel('ลบ').click();

    await expect(page.getByText('ยืนยันการลบร้านค้า').first()).toBeVisible();

    await expect(page).toHaveURL(/admin\/community\/stores/);

  });

  /**
   * TC-CT-02.2
   * คลิกปุ่ม (Button) "ยืนยัน" ในหน้าต่างแสดงผลซ้อน (Modal) ร้านค้าจะถูกลบ
   */
  test("TC-CT-02.2: Admin delete store", async ({
    page,
  }) => {
    await goToPageStore(page);

    await page.getByRole('row', { name: 'ร้านค้าสำหรับลบ' }).getByLabel('ลบ').click();

    await expect(page.getByText('ยืนยันการลบร้านค้า').first()).toBeVisible();

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page).toHaveURL(/admin\/community\/stores/);

    await expect(page.getByRole("cell", { name: "ร้านค้าสำหรับลบ" })).not.toBeVisible();
  });

  /**
   * TC-CT-03.2
   *   คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อน (Modal) ร้านค้าจะไม่ถูกลบ
   */
  test("TC-CT-03.2: Admin cancel delete store", async ({
    page,
  }) => {
    await goToPageStore(page);

    await page.getByRole('row', { name: 'ร้านเพื่อสุขภาพ' }).getByLabel('ลบ').click();

    await expect(page.getByText('ยืนยันการลบร้านค้า').first()).toBeVisible();

    await page.getByRole('button', { name: 'ยกเลิก' }).click();

    await expect(page).toHaveURL(/admin\/community\/stores/);

    await expect(page.getByRole("cell", { name: "ร้านเพื่อสุขภาพ" })).toBeVisible();
  });

});