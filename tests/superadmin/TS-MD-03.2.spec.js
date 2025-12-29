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
  await expect(settingsMenu).toBeVisible({ timeout: 10000 });
  await settingsMenu.click();

  const uploadBannerLink = page.getByRole("link", { name: /การเพิ่ม\/แก้ไข/ });
  await expect(uploadBannerLink).toBeVisible({ timeout: 10000 });
  await uploadBannerLink.click();

  await expect(page).toHaveURL(/super\/banners/, { timeout: 10000 });
}

test.describe("SuperAdmin - Banner", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });
  /**
   * TC-MD-03.2
   * เเก้ไขรูป banner สำเร็จ
   */
   test("TS-MD-03.2: SuperAdmin can edit first banner image", async ({ page }) => {
    const firstEditButton = page
      .getByRole("button", { name: /แก้ไขรูปที่ \d+/ })
      .first();

    await expect(firstEditButton).toBeVisible();

    const bannerImg = page
      .locator('img[alt^="preview-banner"]')
      .first();

    await expect(bannerImg).toBeVisible();
    const oldSrc = await bannerImg.getAttribute("src");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      firstEditButton.click(),
    ]);

    await fileChooser.setFiles(
      path.resolve(process.cwd(), "assets/photo/banner-edit.jpg")
    );

  const confirmDialog = page.getByRole("dialog", {name: "ยืนยันการแก้ไขรูปภาพหรือไม่",});

    await expect(confirmDialog).toBeVisible();

    await confirmDialog
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(confirmDialog).toBeHidden();

   const successDialog = page.getByRole("dialog");

await expect(
  successDialog.getByRole("heading", { name: "สำเร็จ" })
).toBeVisible();

await successDialog
  .getByRole("button", { name: "ตกลง" })
  .click();

await expect(successDialog).toBeHidden();

    await expect(bannerImg).not.toHaveAttribute("src", oldSrc);
  });
});
