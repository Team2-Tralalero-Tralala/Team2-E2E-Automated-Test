import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManageMemberPage - ไปยังหน้าจัดการสมาชิก
 */
async function goToManageMemberPage(page) {
  await page.getByRole("link", { name: "จัดการสมาชิก" }).click();
  await expect(page).toHaveURL(/admin\/members/);
}
/**
 * selectRowsPerPage - เลือกจำนวนแถวต่อหน้า
 */
async function selectRowsPerPage(page, rows) {
  await page.locator('button[aria-haspopup="listbox"]').click();
  await page.getByRole("option", { name: rows }).click();
}
/**
 * verifyRowsPerPage - ตรวจสอบจำนวนแถวต่อหน้า
 */
async function verifyRowsPerPage(page, rows) {
  await expect(page.getByRole("button", { name: rows })).toBeVisible();
  const table = page.locator("table");
  const rowsTable = table.locator("tbody tr");
  await expect(rowsTable).toHaveCount(rows);
}
test.describe("admin - Pagination Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToManageMemberPage(page);
    await expect(page).toHaveURL(/admin\/members/);
  });

  /**
   * TS-DMB-03.1: จำนวนแถวต่อหน้า
   */
  test("TS-DMB-03.1: จำนวนแถวต่อหน้า", async ({ page }) => {
    await selectRowsPerPage(page, 10);
    await verifyRowsPerPage(page, 10);
    await selectRowsPerPage(page, 30);
    await verifyRowsPerPage(page, 30);
    await selectRowsPerPage(page, 50);
    await verifyRowsPerPage(page, 50);
  });
});
