import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - ฟังก์ชันสำหรับไปยังหน้าจัดการแพ็กเกจ
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. คลิกเมนู "จัดการแพ็กเกจ"
 *   2. รอให้ URL เปลี่ยนไปยังหน้าจัดการแพ็กเกจ
 * Output:
 *   - browser จะแสดงหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/admin\/packages\/all/);
}

test.describe("Admin - จำนวนแถวต่อหน้า", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    // ตรวจสอบว่าหลังจาก login แล้วไปยังหน้า dashboard ของ admin (ตามที่กำหนดใน roles.js) -> /admin/community/own
    // หรือถ้า roles.js ตรวจสอบแล้ว ก็ไม่ต้องตรวจสอบซ้ำ แต่ถ้าจะตรวจสอบต้องให้ตรงกัน
    await expect(page).toHaveURL(/admin\/community\/own/);
  });
/**
    * TS-DPK-03.1
    * เลือกจำนวนแถวต่อหน้า
    */
    test("TS-DPK-03.1: เลือกจำนวนแถวต่อหน้า", async ({ page }) => {
        await goToManagePackagePage(page);

        await page.getByRole('link', { name: 'จัดการแพ็กเกจ' }).click();
        await page.getByRole('button', { name: '10' }).click();
        await page.getByRole('option', { name: '30' }).click();
        await page.getByRole('button', { name: '30' }).click();
        await page.getByRole('option', { name: '50' }).click();
        await page.getByRole('button', { name: '50' }).click();
        await page.getByRole('option', { name: '10' }).click();
    });
});