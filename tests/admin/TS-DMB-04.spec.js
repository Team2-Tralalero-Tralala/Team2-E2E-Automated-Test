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
 * clickNextPage - คลิกปุ่มถัดไป
 */
async function clickNextPage(page) {
  await page.getByRole("button", { name: "ถัดไป" }).click();
}

/**
 * clickPreviousPage - คลิกปุ่มก่อนหน้า
 */
async function clickPreviousPage(page) {
  await page.getByRole("button", { name: "ก่อนหน้า" }).click();
}

test.describe("admin - Pagination Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToManageMemberPage(page);
    await expect(page).toHaveURL(/admin\/members/);
  });

  /**
   * TS-DMB-04.1: pagination
   */
  test("TS-DMB-04.1: pagination", async ({ page }) => {
    await expect(page.getByRole("button", { name: "ก่อนหน้า" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "ถัดไป" })).toBeEnabled();

    const firstRowBefore = await page.locator("tbody tr").first().textContent();
    await clickNextPage(page);
    const firstRowAfter = await page.locator("tbody tr").first().textContent();
    expect(firstRowAfter).not.toBe(firstRowBefore);

    await expect(page.getByRole("button", { name: "ก่อนหน้า" })).toBeEnabled();
    await clickPreviousPage(page);
    const firstRowBack = await page.locator("tbody tr").first().textContent();
    expect(firstRowBack).toBe(firstRowBefore);
    await expect(page.getByRole("button", { name: "ก่อนหน้า" })).toBeDisabled();
  });
});
