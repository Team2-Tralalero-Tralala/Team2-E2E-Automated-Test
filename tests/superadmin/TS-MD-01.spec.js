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

/**
 * uploadBanner - ฟังก์ชันสำหรับอัพโหลดแบนเนอร์ด้วยไฟล์ที่ระบุ
 * Input: 
 *   - page: Playwright Page object
 * Action: 
 *   1. กำหนด path ของรูปโปรไฟล์
 *   2. อัพโหลดไฟล์ผ่าน input[type="file"]
 *   3. ตรวจสอบว่า dialog สำหรับรูปภาพแสดงขึ้น
 * Output:
 *   - ไม่มี return value, แต่ระบบจะทำการอัพโหลดไฟล์ที่ระบุ
 */
async function uploadBanner(page, relativePath) {

  const filePath = path.resolve(process.cwd(), relativePath);

  const fileInput = page
    .locator('input[type="file"][accept*="image"]')
    .first();
  await expect(fileInput).toBeAttached();
  await fileInput.setInputFiles(filePath);
}

test.describe("SuperAdmin - Upload Banners", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });

  /**
   * TC-MD-01.1
   * อัปโหลดโลโก้สำเร็จ
   */
  test("TS-MD-01.1: SuperAdmin upload banner with JPG/PNG successfully", async ({ page }) => {
    await uploadBanner(page, "assets/photo/profile.jpg");

    const uploadedImage = page.locator("img").first();
    await expect(uploadedImage).toBeVisible({ timeout: 10000 });
  });

  /**
   * TS-MD-01.2
   * อัปโหลดไฟล์ผิดรูปแบบ (ไม่ใช่ JPG/PNG)
   */
  test("TS-MD-01.2: SuperAdmin can't upload banner with non-JPG/PNG file", async ({ page }) => {
    await uploadBanner(page, "assets/files/sample.pdf");

    const errorMessage = page.getByText(/อัพโหลดไฟล์เฉพาะ JPG\/PNG/);

    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    const uploadedImages = page.locator("img");
    await expect(uploadedImages).toHaveCount(0);
  });

  /**
   * TS-MD-01.3
   * อัปโหลดไฟล์ใหญ่เกิดกำหนด
   */
  test("TS-MD-01.3: Cannot upload JPG/PNG file larger than allowed size", async ({ page }) => {
    // สมมติว่าไฟล์ oversize-image.jpg มีขนาดเกิน 2MB
    await uploadBanner(page, "assets/photo/oversize-image.jpg");

    const errorMessage = page.getByText(/อัพโหลดไฟล์เกินขนาดที่กำหนด/);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    const uploadedImages = page.locator("img");
    await expect(uploadedImages).toHaveCount(0);
  });
});
