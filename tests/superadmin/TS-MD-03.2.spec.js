import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToUploadBannersPage - ฟังก์ชันสำหรับนำผู้ใช้งานไปยังหน้าเพิ่ม/แก้ไข โลโก้และรูปภาพ
 * Input:
 *   - page: Playwright Page object ใช้สำหรับควบคุม browser
 * Action:
 *   1. คลิกเมนู "การตั้งค่า"
 *   2. คลิกลิงก์ "การเพิ่ม/แก้ไข โลโก้และรูปภาพ"
 *   3. รอให้ URL เปลี่ยนไปยังหน้า /super/banners
 * Output:
 *   - ไม่มี return value แต่ browser จะถูกนำทางไปยังหน้าจัดการแบนเนอร์
 */
async function goToUploadBannersPage(page) {
  const settingsMenuLink = page.getByRole("link", { name: "การตั้งค่า" });
  await settingsMenuLink.click();

  const uploadBannerLink = page.getByText(/การเพิ่ม\/แก้ไข โลโก้และรูปภาพ/);
  await uploadBannerLink.click();

  await expect(page).toHaveURL(/super\/banners/);
}

/**
 * editFirstBannerImage - ฟังก์ชันสำหรับแก้ไขรูป banner รูปแรก
 * Input:
 *   - page: Playwright Page object ใช้สำหรับควบคุม browser
 *   - relativeImagePath: path ของไฟล์รูปภาพแบบ relative
 * Action:
 *   1. ตรวจสอบการแสดงผลของรูป banner รูปแรก
 *   2. เก็บค่า src ของรูปเดิมไว้เพื่อนำมาเปรียบเทียบ
 *   3. คลิกปุ่ม "แก้ไขรูป"
 *   4. เลือกไฟล์รูปภาพใหม่ผ่าน file chooser
 *   5. ยืนยันการอัพโหลดรูปภาพ
 *   6. ตรวจสอบว่ารูป banner ถูกเปลี่ยนจากรูปเดิม
 * Output:
 *   - ไม่มี return value แต่รูป banner รูปแรกจะถูกแก้ไขสำเร็จ
 */
async function editFirstBannerImage(page, relativeImagePath) {
  const firstBannerImage = page
    .getByRole("img", { name: /preview-banner-0/ });

  await expect(firstBannerImage).toBeVisible({ timeout: 10000 });

  const oldImageSrc = await firstBannerImage.getAttribute("src");

  const editButton = firstBannerImage
    .locator("..")
    .getByRole("button", { name: /แก้ไขรูป/ });

  await editButton.click();

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    editButton.click(),
  ]);

  await fileChooser.setFiles(
    path.resolve(process.cwd(), relativeImagePath)
  );

  const confirmDialog = page.getByRole("dialog");
  await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

  const successDialog = page.getByRole("dialog");
  await successDialog.getByRole("button", { name: "ตกลง" }).click();

  await expect(firstBannerImage).not.toHaveAttribute(
    "src",
    oldImageSrc,
    { timeout: 10000 }
  );
}

test.describe("SuperAdmin - Banner", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });

  /**
   * TC-MD-03.2
   * แก้ไขรูป banner สำเร็จ
   */
  test("TS-MD-03.2: SuperAdmin can edit first banner image", async ({ page }) => {
    await editFirstBannerImage(
      page,
      "assets/photo/banner-edit.jpg"
    );
  });
});
