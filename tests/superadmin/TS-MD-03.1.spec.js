import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToUploadBannersPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าเพิ่ม/แก้ไข โลโก้และรูปภาพ
 */
async function goToUploadBannersPage(page) {
  const settingsMenuLink = page.getByRole("link", { name: "การตั้งค่า" });
  await settingsMenuLink.click();

  const uploadBannerLink = page.getByText(/การเพิ่ม\/แก้ไข โลโก้และรูปภาพ/);
  await uploadBannerLink.click();

  await expect(page).toHaveURL(/super\/banners/);
}

/**
 * deleteLastBannerImage - ฟังก์ชันลบ banner รูปล่าสุด
 */
async function deleteLastBannerImage(page) {
  const deleteButtons = page.getByRole("button", { name: /ลบรูปที่ \d+/ });
  await expect(deleteButtons.first()).toBeVisible({ timeout: 10000 });

  const bannerCountBeforeDelete = await deleteButtons.count();
  expect(bannerCountBeforeDelete).toBeGreaterThan(0);

  await deleteButtons.nth(bannerCountBeforeDelete - 1).click();

  await page.getByRole("button", { name: "ยืนยัน" }).click();
  await page.getByRole("button", { name: "ตกลง" }).click();

  await expect(deleteButtons).toHaveCount(
    bannerCountBeforeDelete - 1,
    { timeout: 10000 }
  );
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
    await deleteLastBannerImage(page);
  });
});
