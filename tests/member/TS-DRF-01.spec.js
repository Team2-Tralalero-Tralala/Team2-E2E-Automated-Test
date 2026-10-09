import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Refund Requests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/member\/home/);
  });

  /**
   * TC-DRF-01.1
   * สมาชิกเห็นปุ่ม “ปฏิเสธ” เฉพาะกิจกรรมของตน
   */
  test("TC-DRF-01.1: Member sees Reject only for own pending refund items", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "จัดการการจอง" }).click();
    await page.getByRole("link", { name: "คำขอคืนเงิน" }).click();
    await expect(page).toHaveURL(/\/member\/bookings\/refunded-pending/);

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    const rejectBtn = rows.getByRole("button", { name: /^ปฏิเสธ$/ });
    await expect(rejectBtn).toBeVisible;
    });
});
