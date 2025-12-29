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
    const banners = page.getByRole("img", {
      name: /preview-banner-\d+/,
    });

    await expect(banners.first()).toBeVisible({ timeout: 10000 });

    const targetBanner = banners.first();
    const oldSrc = await targetBanner.getAttribute("src");

    const editButton = targetBanner
      .locator("..")
      .getByRole("button", { name: /แก้ไขรูป/ });

    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

const [fileChooser] = await Promise.all([
  page.waitForEvent("filechooser"),
  editButton.click(),
]);

await fileChooser.setFiles(
  path.resolve(process.cwd(), "assets/photo/banner-edit.jpg")
);

    const confirmDialog = page.getByRole("dialog");

    await expect(
      confirmDialog.getByRole("heading", {
        name: "ยืนยันการแก้ไขรูปภาพหรือไม่",
      })
    ).toBeVisible({ timeout: 10000 });

    await confirmDialog
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    const successDialog = page.getByRole("dialog");

    await expect(
      successDialog.getByRole("heading", { name: "สำเร็จ" })
    ).toBeVisible({ timeout: 10000 });

    await successDialog
      .getByRole("button", { name: "ตกลง" })
      .click();

    await expect(targetBanner).not.toHaveAttribute("src", oldSrc, {
      timeout: 10000,
    });
  });
});
