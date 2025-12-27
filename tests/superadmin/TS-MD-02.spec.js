import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToUploadBannersPage - ฟังก์ชันสำหรับนำทางไปยังหน้าการอัพโหลดแบนเนอร์
 * Input: 
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 *   1. เลือกเมนู "การตั้งค่า" (Settings) 
 *   2. คลิกปุ่ม "เพิ่ม/แก้ไข โลโก้และรูปภาพ" (Add/Edit Logo and Images)
 *   3. รอหน้าเปลี่ยน URL ไปยังหน้าอัพโหลดแบนเนอร์
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
   * TC-MD-02.1
   * ลบรูปสำเร็จ
   */
test("TS-MD-02.1: SuperAdmin can delete banner image (image #2)", async ({ page }) => {
  const deleteButtons = page.getByRole("button", {
    name: /ลบรูปที่ \d+/,
  });

  await expect.poll(async () => {
    return await deleteButtons.count();
  }).toBeGreaterThan(1);

  const beforeCount = await deleteButtons.count();

  await deleteButtons.nth(1).click();

  await page.getByRole("button", { name: "ยืนยัน" }).click();
  await page.getByRole("button", { name: "ตกลง" }).click();

  await expect(deleteButtons).toHaveCount(beforeCount - 1);
});

/**
 * TC-MD-02.2
 * เเก้ไขโลโก้สำเร็จ
 */
test("TS-MD-02.2: SuperAdmin can edit banner image", async ({ page }) => {
  const editButton = page.getByRole("button", { name: /^แก้ไขรูปที่ \d+/ });

    await editButton.nth(0).click();

  const bannerImg = page.locator("img").first();

  const fileInput = page.locator('input[type="file"]').first();
  const imagePath = path.resolve(
    process.cwd(),
    "assets/photo/banner-edit.jpg"
  );

  await fileInput.setInputFiles(imagePath);

  const confirmDialog = page.getByRole("dialog").filter({
    hasText: /ยืนยัน/i,
  });

  const confirmBtn = confirmDialog.getByRole("button", {
    name: /ยืนยัน/i,
  });

  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();

  const successDialog = page.getByRole("dialog").filter({
    hasText: /สำเร็จ/i,
  });

  await expect(successDialog).toBeVisible();
});

});