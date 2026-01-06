import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - ฟังก์ชันสำหรับไปยังหน้าจัดการแพ็กเกจ
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. ค้นหาเมนู "จัดการแพ็กเกจ" โดยใช้ role="link"
 *   2. คลิกเมนู "จัดการแพ็กเกจ"
 *   3. รอให้ URL เปลี่ยนไปยังหน้าจัดการแพ็กเกจ
 * Output:
 *   - browser จะแสดงหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/admin\/packages\/all/);
}

test.describe("Admin - pagination Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/communities/);
  });

/**
    * TS-DPK-04.1
    * pagination
    */
    test("TS-DPK-04.1: pagination", async ({ page }) => {
        await goToManagePackagePage(page);
        await page.getByRole('link', { name: 'รายงาน' }).click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();
        await page.getByRole('button', { name: 'ก่อนหน้า' }).click();
    });
});