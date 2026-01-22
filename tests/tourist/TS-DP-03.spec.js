import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TC-DP-03 - ผู้ใช้งาน Tourist ต้องการดูรายละเอียดแพ็กเกจ ในหน้าจอหลัก", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "tourist");
    await expect(page).toHaveURL(/tourist\/home/);
  });

  /*
   * TC-DP-03.1
   * ผู้ใช้งานล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-03.1: ผู้ใช้งานล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'แพ็กเกจมาใหม่' })).toBeVisible();
    const packageCard = page.getByRole('link')
                            .filter({ has: page.getByRole('heading') }) // ต้องมีชื่อแพ็กเกจข้างใน
                            .filter({ hasNotText: 'ดูเพิ่มเติม' })      // ต้องไม่ใช่ปุ่มดูเพิ่มเติม
                            .first(); // อันแรกสุดที่เจอ
    await packageCard.click();
    await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
  });
    /*
   * TC-DP-03.2
   * ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-03.2: ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'แพ็กเกจมาใหม่' })).toBeVisible();
    const packageCard = page.getByRole('link')
                            .filter({ has: page.getByRole('heading') })
                            .filter({ hasNotText: 'ดูเพิ่มเติม' })      
                            .first(); 
    await packageCard.click();
    await expect(page).toHaveURL(/\/tourist\/package\/\d+/);
  });

  
});

