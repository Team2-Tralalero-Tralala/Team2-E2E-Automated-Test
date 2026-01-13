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


test.describe("SuperAdmin - Create Tags", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CT-01.1
   * เพิ่มประเภทใหม่สำเร็จ
   */
  test("TC-CT-01.1: SuperAdmin create tag successfully", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole("button", { name: /เพิ่มประเภท/ }).click();

    await page.getByPlaceholder("กรอกชื่อประเภท").fill("ตกปลา");

    await page.getByRole("button", { name: "ยืนยัน" }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(
      page.getByRole("cell", { name: "ตกปลา" })
    ).toBeVisible();
  });

  /**
   * TC-CT-01.2
   * คลิกปุ่ม (Button) "ยกเลิก" ขณะเพิ่ม
   */
  test("TC-CT-01.2: SuperAdmin cancel create tag", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole("button", { name: /เพิ่มประเภท/ }).click();

    await page.getByPlaceholder("กรอกชื่อประเภท").fill("ตกปลา2");

    await page.getByRole("button", { name: "ยกเลิก" }).click();

    await expect(page).toHaveURL(/super\/tags/);

    await expect(page.getByRole("cell", { name: "ตกปลา2" })).not.toBeVisible();
  });

  /**
   * TC-CT-01.3
   * ชื่อประเภทว่าง
   */
  test("TC-CT-01.3: SuperAdmin create tag null", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole("button", { name: /เพิ่มประเภท/ }).click();

    await page.getByPlaceholder("กรอกชื่อประเภท").fill("");

    await page.getByRole("button", { name: "ยืนยัน" }).click();

    await expect(page.getByText("กรุณากรอกชื่อประเภท")).toBeVisible();

    await expect(page.getByText("การเพิ่มประเภท")).toBeVisible();

    await expect(page).toHaveURL(/super\/tags/);
  });

  /**
   * TC-CT-01.4
   * ชื่อประเภทซ้ำ
   */
  test("TC-CT-01.4: SuperAdmin create tag name duplicate", async ({
    page,
  }) => {
    await goToPageTag(page);

    await page.getByRole("button", { name: /เพิ่มประเภท/ }).click();

    await page.getByPlaceholder("กรอกชื่อประเภท").fill("ตกปลา");

    await page.getByRole("button", { name: "ยืนยัน" }).click();

    await expect(page.getByText('ชื่อซ้ำกับที่มีอยู่แล้ว').first()).toBeVisible();

    await expect(page.getByText("การเพิ่มประเภท")).toBeVisible();

    await expect(page).toHaveURL(/super\/tags/);
  });

});