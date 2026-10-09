import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Refund Requests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/member\/home/);
  });

  /**
   * TC-DRF-03.1
   * สมาชิกกดยกเลิกปฏิเสธคำขอคืนเงิน
   * * Steps:
   *  1) คลิก “ปฏิเสธ”
   *  2) กด “ยกเลิก” 
   *  3) ตรวจสอบสถานะยังเป็น “รอคืนเงิน”
   */
  test("TC-DRF-03.1: Member rejects request pending refund", async ({ page }) => {
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

    await expect(
      modal.getByRole("heading", { name: /^ปฏิเสธคำขอคืนเงิน$/ }),
    ).toBeVisible();

    await modal.getByRole("button", { name: /ยกเลิก/i }).click();

    await expect(modal).toBeHidden({ timeout: 10000 });
    await expect(rows.getByText(/รอคืนเงิน/i)).toBeVisible();
  });
});
