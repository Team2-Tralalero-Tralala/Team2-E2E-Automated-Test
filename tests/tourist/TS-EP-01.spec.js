import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * uploadProfileImage
 * ฟังก์ชันสำหรับอัพโหลดรูปโปรไฟล์
 */
async function uploadProfileImage(page) {
  const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

  await page.locator('input[type="file"]').setInputFiles(imagePath);

  const imageDialog = page.getByRole("dialog");
  await expect(imageDialog).toBeVisible();

  const useOriginalBtn = imageDialog.getByRole("button", {
    name: "ใช้รูปเดิม",
  });

  await expect(useOriginalBtn).toBeEnabled();
  await useOriginalBtn.click();

  await expect(imageDialog).toBeHidden();
}

test.describe("TC-EP-01 - แก้ไขข้อมูลส่วนตัว", () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "tourist");
    await expect(page).toHaveURL(/tourist\/home/);

    // ไปหน้าแก้ไขโปรไฟล์
    await page.goto("/tourist/edit-profile");
    await expect(
      page.getByRole("heading", { name: /แก้ไขโปรไฟล์/i })
    ).toBeVisible();
  });

  test("TC-EP-01.1: เปิดหน้าแก้ไขโปรไฟล์ได้", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /แก้ไขโปรไฟล์/})
    ).toBeVisible();
  });

});
