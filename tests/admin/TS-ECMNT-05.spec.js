import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageEditCommunity
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้า Edit Community
 * Steps:
 * 1. คลิกปุ่ม "แก้ไข"
 * 2. ตรวจสอบว่า URL เป็น /admin/community/own/edit
 */
async function goToPageEditCommunity(page) {
  const addBtn = page.getByRole("button", { name: "แก้ไข" });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await expect(page).toHaveURL(/\/admin\/community\/own\/edit/);
}

test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-ECMNT-05.1
   * เปิดการแสดงคะแนนชุมชน
   */
  test("TS-ECMNT-05.1: Enable community score display", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const communitySection = page.getByRole("region", { name: "ข้อมูลชุมชน" });
    const scoreToggle = communitySection.getByRole("switch").first();

    await expect(scoreToggle).toBeVisible();

    if (!(await scoreToggle.isChecked())) {
      await scoreToggle.click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-ECMNT-05.2
   * ปิดการแสดงคะแนนชุมชน
   */
 test("TS-ECMNT-05.2: Disable community score display", async ({ page }) => {
   await goToPageEditCommunity(page);
   await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

   const communitySection = page.getByRole("region", { name: "ข้อมูลชุมชน" });
   const scoreToggle = communitySection.getByRole("switch").first();

   await expect(scoreToggle).toBeVisible();

   if (await scoreToggle.isChecked()) {
     await scoreToggle.click();
   }

   await page.getByRole("button", { name: "บันทึก" }).click();

   const confirmModal = page.getByRole("dialog");
   await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

   await expect(page).toHaveURL(/admin\/community\/own/);
 });

});
