import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToUploadBannersPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าเพิ่ม/เเก้ไข โลโก้เเละรูปภาพ
 * Input: 
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 *   1. เลือกเมนู "ตั้งค่า" (Setting) 
 *   2. คลิกปุ่ม "เพิ่ม/เเก้ไข โลโก้เเละรูปภาพ"
 *   3. รอหน้าเปลี่ยน URL ไปยังหน้kเพิ่ม/เเก้ไข โลโก้เเละรูปภาพ
 * Output:
 *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/banners
 */
async function goToUploadBannersPage(page) {
  const settingsMenu = page.getByRole("link", { name: "การตั้งค่า" });
  await expect(settingsMenu).toBeVisible();
  await settingsMenu.click();

  const uploadBannerBtn = page.getByText(/การเพิ่ม\/แก้ไข โลโก้และรูปภาพ/);
  await expect(uploadBannerBtn).toBeVisible();
  await uploadBannerBtn.click();

  await expect(page).toHaveURL(/super\/banners/);
}

test.describe("SuperAdmin - Banner", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });
  /**
   * TC-MD-03.1
   * ลบรูป banner สำเร็จ
   */
  test("TS-MD-03.1: SuperAdmin can delete last banner image", async ({ page }) => {
    const deleteButtons = page.getByRole("button", { name: /ลบรูปที่ \d+/ });
    await expect(deleteButtons.first()).toBeVisible({ timeout: 10000 });

    const count = await deleteButtons.count();
    expect(count).toBeGreaterThan(0);

    await deleteButtons.nth(count - 1).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ตกลง" }).click();

    await expect(deleteButtons).toHaveCount(count - 1, { timeout: 10000 });
  });
});
