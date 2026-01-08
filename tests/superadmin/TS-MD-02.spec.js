import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

async function goToUploadBannersPage(page) {
  await page.getByRole("link", { name: "การตั้งค่า" }).click();
  await page.getByText(/การเพิ่ม\/แก้ไข โลโก้และรูปภาพ/).click();
  await expect(page).toHaveURL(/super\/banners/);
}

async function deleteAllBannerImages(page) {
  const deleteButtons = page.getByRole("button", { name: /ลบรูปที่ \d+/ });
  const banners = page.getByRole("img", { name: /preview-banner-/ });

  while (await deleteButtons.count() > 0) {
    const beforeCount = await banners.count();
    await deleteButtons.first().click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ตกลง" }).click();
    await expect(banners).toHaveCount(beforeCount - 1);
  }

  await expect(banners).toHaveCount(0);
}

async function uploadBannerImage(page, relativeImagePath) {
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(path.resolve(process.cwd(), relativeImagePath));
}

test.describe("SuperAdmin - Banner", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });

  test("TS-MD-02.1: SuperAdmin can upload 5 banner images successfully", async ({ page }) => {
    // ลบรูปทั้งหมดก่อน
    await deleteAllBannerImages(page);

    // เพิ่มรูปใหม่ 5 รูป
    for (let i = 1; i <= 5; i++) {
      await uploadBannerImage(page, `assets/photo/banner${i}.jpg`);
    }

    // ✅ สร้าง locator ใหม่หลังจากอัปโหลดเสร็จ
    const bannerImages = page.getByRole("img", { name: /preview-banner-/ });

    // ตรวจสอบว่าเพิ่มครบ 5 รูป
    await expect(bannerImages).toHaveCount(5);
  });
});
