import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToUploadBannersPage
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

test.describe("SuperAdmin - Delete Banner", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await goToUploadBannersPage(page);
  });

  test("TS-MD-02.1: SuperAdmin can delete banner image", async ({ page }) => {
    const bannerItems = page.locator(
      'button[aria-label^="ลบรูป"]'
    ).locator("..").locator("..");

    await expect(bannerItems.first()).toBeVisible();

    const beforeCount = await bannerItems.count();
    expect(beforeCount).toBeGreaterThan(0);

    const deleteButton = bannerItems
      .first()
      .locator('button[aria-label^="ลบรูป"]');

    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const confirmModal = page.getByRole("dialog").filter({
      hasText: /ยืนยัน|ต้องการลบ/i,
    });
    await expect(confirmModal).toBeVisible();

    const confirmBtn = confirmModal.getByRole("button", {
      name: /ยืนยัน|confirm/i,
    });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    const successModal = page.getByRole("dialog").filter({
      hasText: /ลบรูปภาพสำเร็จ|สำเร็จ/i,
    });
    await expect(successModal).toBeVisible();

    const okBtn = successModal.getByRole("button", {
      name: /ตกลง|ok/i,
    });
    await expect(okBtn).toBeVisible();
    await okBtn.click();

    await expect(bannerItems).toHaveCount(beforeCount - 1);
  });

test("TS-MD-02.2: SuperAdmin can edit banner image", async ({ page }) => {
  const editButton = page
    .getByRole("button", { name: /^แก้ไขรูปที่ \d+/ })
    .first();

  await editButton.click();

  const fileInput = page.locator('input[type="file"]').first();
  await expect(fileInput).toBeAttached();

  await fileInput.setInputFiles(
    path.resolve(process.cwd(), "assets/photo/banner-edit.jpg")
  );

  await page.getByRole("button", {
    name: /ยืนยัน|confirm/i,
  }).click();

  // ✅ assert จากผลลัพธ์จริงที่ user เห็น
  const successDialog = page.getByRole("dialog").filter({
    hasText: /แก้ไขรูปภาพสำเร็จ|สำเร็จ/i,
  });

  await expect(successDialog).toBeVisible();

  await successDialog.getByRole("button", {
    name: /ตกลง|ok/i,
  }).click();
});

});
