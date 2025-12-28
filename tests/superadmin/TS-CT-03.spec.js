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


test.describe("SuperAdmin - Delete Tags", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CT-03.1
   * ลบประเภทรายการเดียวสำเร็จ(Soft Delete)
   */
  test("TC-CT-03.1: SuperAdmin delete one tag successfully", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('row', { name: 'Tag-5-Relax แก้ไข ลบ' }).getByLabel('ลบ').click();

    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(page.getByRole("cell", { name: "Tag-5-Relax" })).not.toBeVisible();
  });

  /**
   * TC-CT-03.2
   * "ลบประเภทหลายรายการสำเร็จ(Soft Delete)"
   */
  test("TC-CT-03.2: SuperAdmin delete multiple tags successfully", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('row', { name: 'Tag-7-Culture แก้ไข ลบ' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: 'Tag-8-Food แก้ไข ลบ' }).getByRole('checkbox').check();

    await page.getByRole('button', { name: 'ลบทั้งหมด' }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(page.getByRole("cell", { name: "Tag-7-Culture" })).not.toBeVisible();
    await expect(page.getByRole("cell", { name: "Tag-8-Food" })).not.toBeVisible();
  });

  /**
   * TC-CT-03.3
   * ลบประเภทที่มีการใช้งานอยู่
   */
  test("TC-CT-03.3: SuperAdmin delete tag in use", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole('row', { name: 'Tag-1-Relax แก้ไข ลบ' }).getByLabel('ลบ').click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page.getByText("ไม่สามารถลบได้ เนื่องจากประเภทนี้ยังมีการเชื่อมกับแพ็กเกจอยู่")).toBeVisible();

    await expect(page).toHaveURL(/super\/tags/);

        await expect(page.getByRole("cell", { name: "Tag-1-Relax" })).toBeVisible();
  });

});