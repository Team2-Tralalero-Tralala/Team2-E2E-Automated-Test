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


test.describe("SuperAdmin - Edit Tags", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CT-02.1
   * แก้ไขประเภทสำเร็จ
   */
  test("TC-CT-02.1: SuperAdmin edit tag successfully", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('row', { name: 'ตกปลา แก้ไข ลบ' }).getByLabel('แก้ไข').click();

    await page.getByRole('textbox', { name: 'กรอกชื่อประเภท' }).fill('ว่ายน้ำ');

    await page.getByRole("button", { name: "ยืนยัน" }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(
      page.getByRole("cell", { name: "ว่ายน้ำ" })
    ).toBeVisible();
  });

  /**
   * TC-CT-02.2
   * แก้ไขชื่อประเภทว่าง
   */
  test("TC-CT-02.2: SuperAdmin edit tag name null", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.reload();

    await page.getByRole('row', { name: 'Tag-1-Relax แก้ไข ลบ' }).getByLabel('แก้ไข').click();

    await page.getByRole('textbox', { name: 'กรอกชื่อประเภท' }).fill('');

    await page.getByRole("button", { name: "ยืนยัน" }).click();

    await expect(page.getByText('กรุณากรอกชื่อประเภท').first()).toBeVisible();

    await expect(page).toHaveURL(/super\/tags/);
  });

  /**
   * TC-CT-02.3
   * แก้ไขประเภทชื่อซ้ำ
   */
  test("TC-CT-02.3: SuperAdmin edit tag name duplicate", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.reload();

    await page.getByRole('row', { name: 'Tag-1-Relax แก้ไข ลบ' }).getByLabel('แก้ไข').click();

    await page.getByRole('textbox', { name: 'กรอกชื่อประเภท' }).fill('ว่ายน้ำ');

    await page.getByRole("button", { name: "ยืนยัน" }).click();

    await expect(page.getByText('ชื่อซ้ำกับที่มีอยู่แล้ว').first()).toBeVisible();
    
    await expect(page).toHaveURL(/super\/tags/);
  });

});