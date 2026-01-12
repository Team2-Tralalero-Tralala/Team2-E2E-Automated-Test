import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToPageEditPackage
 * 1. คลิก Sidebar "จัดการแพ็กเกจ"
 * 2. เข้า /member/packages/all (redirect ได้)
 * 3. คลิกชื่อ package ในตาราง
 * 4. เข้า package detail
 * 5. คลิกปุ่ม "แก้ไขรายละเอียดแพ็กเกจ"
 * 6. ตรวจสอบชื่อ package ในหน้า Edit
 */
export async function goToPageEditPackage(page, packageName) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/\/packages\/all/);

  const packageRow = page.locator("tr").filter({ hasText: packageName });
  await expect(packageRow).toHaveCount(1);

  const packageNameCell = packageRow.getByText(packageName, { exact: false });
  await expect(packageNameCell).toBeVisible();
  await packageNameCell.click();
  await expect(page).toHaveURL(/\/member\/package\/\d+$/);

  const editButton = page.getByRole("button", {
    name: "แก้ไขรายละเอียดแพ็กเกจ",
  });
  await expect(editButton).toBeVisible();
  await editButton.click();
  await expect(page).toHaveURL(/\/member\/package\/\d+\/edit/);
  await expect(page.getByText(packageName, { exact: false })).toBeVisible();
}

test.describe("Member - Edit Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
  });

  /**
   * TS-EDIT-01
   * ตรวจสอบการเปิดหน้าแก้ไขแพ็กเกจของสมาชิก
   */
  test("TS-EDIT-01: Member can edit the selected community packag", async ({
    page,
  }) => {
    const packageName = "เรียนรู้การจักสาน";
    await goToPageEditPackage(page, packageName);
  });
});
