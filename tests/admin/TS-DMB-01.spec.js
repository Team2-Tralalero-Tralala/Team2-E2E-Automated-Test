import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManageMemberPage - ไปยังหน้าจัดการสมาชิก
 */
async function goToManageMemberPage(page) {
  await page.getByRole("link", { name: "จัดการสมาชิก" }).click();
  await expect(page).toHaveURL(/admin\/members/);
}

test.describe("admin - Search Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToManageMemberPage(page);
    await expect(page).toHaveURL(/admin\/members/);
  });

  /**
   * TS-DMB-01.1: ผู้ใช้งานบัญชี Admin ต้องสามารถค้นหาสมาชิกได้
   */
  test("TS-DMB-01.1: ผู้ใช้งานบัญชี Admin ต้องสามารถค้นหาสมาชิกได้", async ({
    page,
  }) => {
    await page.getByRole("textbox", { name: "ค้นหา" }).fill("แดง");
    await expect(page.getByText("แดง")).toBeVisible();
  });
});
