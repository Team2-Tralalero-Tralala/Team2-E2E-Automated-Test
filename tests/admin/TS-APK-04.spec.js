import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Admin - Package Requests Pagination", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-APK-04.1
   * ไปที่หน้าตารางถัดไป
   */
  test("TS-APK-04.1: Go next/prev page", async ({ page }) => {
    await page.goto("/admin/package-requests");
    await expect(page.getByRole("heading", { name: /คำขออนุมัติ/i })).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const pager = page.getByText(/จำนวนแถวต่อหน้า/i).locator("..").locator("..");
    const rangeText = pager.getByText(/\d+\s*-\s*\d+\s*จาก\s*\d+/);

    const prevBtn = pager.getByRole("button", { name: /ก่อนหน้า/i });
    const nextBtn = pager.getByRole("button", { name: /ถัดไป/i });

    await expect(rangeText).toBeVisible();
    const before = (await rangeText.innerText()).trim();

    await expect(nextBtn).toBeVisible();
    if (await nextBtn.isDisabled()) test.skip(true, "No next page available (rows <= page size).");

    await nextBtn.click();
    await expect(rangeText).not.toHaveText(before);

    const rowsAfterNext = table.locator("tbody tr");
    await expect(rowsAfterNext.first()).toBeVisible();
    const after = (await rangeText.innerText()).trim();

    await page.waitForTimeout(5000);

    await expect(prevBtn).toBeVisible();
    await prevBtn.click();
    await expect(rangeText).not.toHaveText(after);
    await expect(rangeText).toHaveText(before);

    const rowsAfterPrev = table.locator("tbody tr");
    await expect(rowsAfterPrev.first()).toBeVisible();

    await page.waitForTimeout(5000);
  });
});