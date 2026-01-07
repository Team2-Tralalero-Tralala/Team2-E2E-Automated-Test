import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

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
 * editFirstBannerImage - ฟังก์ชันแก้ไข banner รูปแรก
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
