import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToUploadBannersPage - ฟังก์ชันสำหรับไปยังหน้าการอัพโหลดรูปโปรไฟล์
 * Input: 
 *   - page: Playwright Page object
 * Action:
 *   1. คลิกที่เมนู "การตั้งค่า"
 *   2. คลิกที่ลิงก์ "การเพิ่ม/แก้ไข โลโก้และรูปภาพ"
 *   3. ตรวจสอบว่า URL ปัจจุบันตรงกับ /super/banners/
 * Output:
 *   - ไม่มี return value, แต่ browser จะไปยังหน้าการอัพโหลดรูปโปรไฟล์
 */
async function goToUploadBannersPage(page) {
  await page.getByRole("link", { name: "การตั้งค่า" }).click();
  await page.getByText(/การเพิ่ม\/แก้ไข โลโก้และรูปภาพ/).click();
  await expect(page).toHaveURL(/super\/banners/);
}

/**
 * deleteLastBannerImage - ฟังก์ชันสำหรับลบรูปโปรไฟล์ล่าสุด
 * Input: 
 *   - page: Playwright Page object
 * Action:
 *   1. หาปุ่มลบรูปโปรไฟล์ทั้งหมด
 *   2. คลิกปุ่มลบรูปโปรไฟล์ล่าสุด
 *   3. ยืนยันการลบใน dialog
 *   4. ตรวจสอบว่าจำนวนรูปโปรไฟล์ลดลง 1
 * Output:
 *   - ไม่มี return value, แต่ browser จะแสดง dialog และลบรูปสำเร็จ
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

/**
 * deleteAllBannerImages - ฟังก์ชันสำหรับลบรูปโปรไฟล์ทั้งหมด
 * Input: 
 *   - page: Playwright Page object
 * Action:
 *   1. หาปุ่มลบรูปโปรไฟล์ทั้งหมด
 *   2. คลิกปุ่มลบรูปโปรไฟล์ล่าสุด
 *   3. ยืนยันการลบใน dialog
 *   4. ตรวจสอบว่าจำนวนรูปโปรไฟล์ลดลง 1
 *   5. ทำซ้ำจนกว่าจะไม่มีรูปโปรไฟล์เหลือ
 * Output:
 *   - ไม่มี return value, แต่ browser จะแสดง dialog และลบรูปทั้งหมดสำเร็จ
 */
async function deleteAllBannerImages(page) {
  const deleteButtons = page.getByRole("button", { name: /ลบรูปที่ \d+/ });

  await page.waitForLoadState("networkidle");

  while (await deleteButtons.count() > 0) {
    await deleteLastBannerImage(page);

    await page.waitForLoadState("networkidle");
  }

  await expect(deleteButtons).toHaveCount(0);
}

/**
 * uploadBannerImage - ฟังก์ชันสำหรับอัพโหลดรูปโปรไฟล์
 * Input: 
 *   - page: Playwright Page object
 * Action:
 *   1. กำหนด path ของรูปโปรไฟล์
 *   2. อัพโหลดไฟล์ผ่าน input[type="file"]
 *   3. ตรวจสอบว่าจำนวนรูปโปรไฟล์เพิ่มขึ้น 1
 * Output:
 *   - ไม่มี return value, แต่ browser จะแสดง dialog และอัพโหลดรูปสำเร็จ
 */
async function uploadBannerImage(page, imagePath) {
  const fileInput = page.locator('input[type="file"]').first();
  const banners = page.getByRole("img", { name: /preview-banner-/ });

  const beforeCount = await banners.count();

  await fileInput.setInputFiles(
    path.resolve(process.cwd(), imagePath)
  );

  await expect(banners).toHaveCount(beforeCount + 1, {
    timeout: 15000,
  });
}


test.describe("SuperAdmin - Banner", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });

  /**
   * TS-MD-02.1
   * SuperAdmin สามารถอัปโหลดรูป banner ได้สูงสุด 5 รูป
   */
test("TS-MD-02.1: SuperAdmin can upload 5 banner images successfully", async ({ page }) => {
  const banners = page.getByRole("img", { name: /preview-banner-/ });

  await deleteAllBannerImages(page);

  await expect(banners).toHaveCount(0);

  for (let i = 1; i <= 5; i++) {
    await uploadBannerImage(
      page,
      `assets/photo/banner${i}.jpg`
    );
  }

  await expect(banners).toHaveCount(5);
});
});
