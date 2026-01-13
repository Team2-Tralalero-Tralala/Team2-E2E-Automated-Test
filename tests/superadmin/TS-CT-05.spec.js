import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageTag - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการประเภท (Tag Management)
 * Input: 
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 * 1. คลิกเมนู "จัดการประเภท" (Manage Tag)
 * 2. รอให้ระบบเปลี่ยนเส้นทางไปยังหน้าจัดการประเภท
 * Output:
 * - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/tags
 */
async function goToPageTag(page) {

  const manageTag = page.getByRole("link", { name: "จัดการประเภท" });
  await expect(manageTag).toBeVisible();
  await manageTag.click();

  await expect(page).toHaveURL(/super\/tags/);
}


test.describe("SuperAdmin - Search Tags", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CT-05.1
   * ค้นหาชื่อประเภท
   */
  test("TC-CT-05.1: SuperAdmin search tag successfully", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByPlaceholder("ค้นหา").fill("ตกปลา");

    await expect(page).toHaveURL(/super\/tags/);

    await expect(
      page.getByRole("cell", { name: "ตกปลา" })
    ).toBeVisible();

  });

  /**
   * TC-CT-05.2
   * ค้นหาชื่อประเภทที่ไม่มีอยู่
   */
  test("TC-CT-05.2: SuperAdmin search tag doesn't exist", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByPlaceholder("ค้นหา").fill("กายกรรม");

    await expect(page).toHaveURL(/super\/tags/);

    await expect(page.getByRole("cell", { name: "ไม่มีข้อมูล" })).toBeVisible();
  });

  /**
   * TC-CT-05.3
   * ค้นหาชื่อประเภทว่าง
   */
  test("TC-CT-05.3: SuperAdmin search tag null", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByPlaceholder("ค้นหา").fill("");

    await expect(page).toHaveURL(/super\/tags/);

    await expect(page.getByRole("cell", { name: "Tag-2-Culture" })).toBeVisible();
  });

});