import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Admin - Login Account", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "thanakorn");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-APK-03.1
   * แสดงจำนวนแถวในหน้าตาราง 30 หรือ 50 แถว
   */
  test("TS-APK-03.1: Rows per page", async ({ page }) => {
    await page.goto("/admin/package-requests");
    await expect(
      page.getByRole("heading", { name: /คำขออนุมัติ/i })
    ).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const pager = page.getByText(/จำนวนแถวต่อหน้า/i).locator("..");
    const pageSizeBtn = pager.getByRole("button").first();

    for (const size of [30, 50]) {
      await expect(pageSizeBtn).toBeVisible();
      await pageSizeBtn.click();

      const listbox = pager.getByRole("listbox");
      await expect(listbox).toBeVisible();

      await listbox.getByRole("option", { name: String(size) }).click();
      await expect(pageSizeBtn).toHaveText(new RegExp(`^${size}$`));

      const bodyRows = table.locator("tbody tr");
      const rowCount = await bodyRows.count();
      expect(rowCount).toBeLessThanOrEqual(size);
    }

    await page.waitForTimeout(5000);
  });
});
