import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TC-DP-03 - ผู้ใช้งาน Tourist ต้องการดูรายละเอียดแพ็กเกจ ในหน้าจอหลัก", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "Tourist1");
    await expect(page).toHaveURL(/tourist\/home/);
  });

  /*
   * TC-DP-03.1
   * ผู้ใช้งานล็อกอินเข้าสู่ระบบ
   */
  test("TC-DP-03.1: ผู้ใช้งานล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'แพ็กเกจมาใหม่' })).toBeVisible();

    await page.getByRole('button', { name: 'ดูเพิ่มเติม' }).first().click();
    await expect(page).toHaveURL(/.*\/tourist\/packages\?sort=new/);

    await page.locator('article').first().click();
    await expect(page).toHaveURL(/.*\/tourist\/package\/\d+/);
  });
  
  /*
 * TC-DP-03.2
 * ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ
 */
  test("TC-DP-03.2: ผู้ใช้งานไม่ได้ล็อกอินเข้าสู่ระบบ", async ({ page }) => {
    // Logout ก่อนเพราะ beforeEach ล็อกอินมาให้แล้ว
    await page.getByRole("button", { name: "Tourist 1 Profile" }).click();
    await page.getByText("ออกจากระบบ").click();
    await expect(page.getByRole('heading', { name: 'แพ็กเกจมาใหม่' })).toBeVisible();

    await page.getByRole('button', { name: 'ดูเพิ่มเติม' }).first().click();
    await expect(page).toHaveURL(/.*\/tourist\/packages\?sort=new/);

    await page.locator('article').first().click();
    await expect(page).toHaveURL(/.*\/tourist\/package\/\d+/);
  });

});

// ver เก่า
// await expect(page.getByRole('heading', { name: 'แพ็กเกจมาใหม่' })).toBeVisible();
// const packageCard = page.getByRole('link')
//                         .filter({ has: page.getByRole('heading') }) // ต้องมีชื่อแพ็กเกจข้างใน
//                         .filter({ hasNotText: 'ดูเพิ่มเติม' })      // ต้องไม่ใช่ปุ่มดูเพิ่มเติม
//                         .first(); // อันแรกสุดที่เจอ
// await packageCard.click();
// await expect(page).toHaveURL(/\/tourist\/package\/\d+/);