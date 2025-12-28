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


test.describe("SuperAdmin - Pagination Tags", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CT-04.1
   * กำหนดจำนวนแถวต่อหน้าเป็น 10 แถว
   */
  test("TC-CT-04.1: SuperAdmin change page size to 10 rows", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('button', { name: '10' }).click();

    await page.getByRole('option', { name: '10' }).click();

    await expect(page).toHaveURL(/super\/tags/);

    const rows = page.locator('table tbody tr');

    const rowCount = await rows.count();
    
    expect(rowCount).toBeLessThanOrEqual(10);
  });

  /**
   * TC-CT-04.2
   * กำหนดจำนวนแถวต่อหน้าเป็น 30 แถว
   */
  test("TC-CT-04.2: SuperAdmin change page size to 30 rows", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('button', { name: '10' }).click();

    await page.getByRole('option', { name: '30' }).click();

    await expect(page).toHaveURL(/super\/tags/);

    const rows = page.locator('table tbody tr');

    const rowCount = await rows.count();

    expect(rowCount).toBeLessThanOrEqual(30);

    await expect(
      page.getByRole("cell", { name: "Tag-11-Nature" })
    ).toBeVisible();
  });

  /**
   * TC-CT-04.3
   * ตรวจสอบ Pagination ไปหน้าถัดไป
   */
  test("TC-CT-04.3: SuperAdmin check pagination forward", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('button', { name: 'ถัดไป' }).click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(
      page.getByRole("cell", { name: "Tag-11-Nature" })
    ).toBeVisible();
  });

  /**
   * TC-CT-04.4
   * ตรวจสอบ Pagination ย้อนกลับ
   */
  test("TS-CT-04.4: SuperAdmin check pagination back", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('button', { name: 'ย้อนกลับ' }).click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(
      page.getByRole("cell", { name: "Tag-6-Nature" })
    ).toBeVisible();
  });

});