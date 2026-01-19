import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Refund Requests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/member\/home/);
  });

  /**
   * TC-DRF-02.1
   * สมาชิกเห็น Modal ปฏิเสธคำขอคืนเงิน
   */
  test("TC-DRF-02.1: Member sees Modal pending refund", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "จัดการการจอง" }).click();
    await page.getByRole("link", { name: "คำขอคืนเงิน" }).click();
    await expect(page).toHaveURL(/\/member\/bookings\/refunded-pending/);

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr").first();
    await expect(rows.first()).toBeVisible();

    const rejectBtn = rows.getByRole("button", { name: /^ปฏิเสธ$/ });
    await expect(rejectBtn).toBeVisible();
    await rejectBtn.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10000 });

    await expect(modal.getByRole("heading", {name: /^ปฏิเสธคำขอคืนเงิน$/})).toBeVisible();

    await expect(
      modal.getByRole("button", { name: /ส่ง/i }),
    ).toBeVisible();
    await expect(
      modal.getByRole("button", { name: /ยกเลิก/i }),
    ).toBeVisible();
  });
});
