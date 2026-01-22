import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Refund Requests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/\/member\/home/);
  });

  /**
   * TC-DRF-05.1
   * ระบบบันทึกสถานะการปฏิเสธคำขอคืนเงินสำเร็จ โดยกรอกเหตุผล
   * Steps:
   *  1) คลิก “ปฏิเสธ”
   *  2) กรอกเหตุผล แล้วกด “ส่ง” (ยืนยัน)
   *  3) ตรวจสอบข้อความ “บันทึกข้อมูลสำเร็จ” และสถานะเปลี่ยนเป็น “ถูกปฏิเสธ”
   */
  test("TC-DRF-05.1: Reject refund request successfully", async ({ page }) => {
    await page.getByRole("link", { name: "จัดการการจอง" }).click();
    await page.getByRole("link", { name: "คำขอคืนเงิน" }).click();
    await expect(page).toHaveURL(/\/member\/bookings\/refunded-pending/);

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const row = table.locator("tbody tr").first();
    await expect(row).toBeVisible();

    await expect(row.getByText(/รอคืนเงิน/i)).toBeVisible();
    await row.getByRole("button", { name: /^ปฏิเสธ$/ }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(
      modal.getByRole("heading", { name: /^ปฏิเสธคำขอคืนเงิน$/ })
    ).toBeVisible();

    const reasonBox = modal.getByRole("textbox", { name: /เหตุผลการปฏิเสธ/i });
    await expect(reasonBox).toBeVisible();
    await reasonBox.fill("หลักฐานไม่ถูกต้อง");

    await modal.getByRole("button", { name: /^ส่ง$/ }).click();

    await expect(modal).toBeHidden({ timeout: 10000 });

    await expect(
      page.getByText(/บันทึกข้อมูลสำเร็จ|สำเร็จ|success/i)
    ).toBeVisible({ timeout: 15000 });

     // ตรวจสอบสถานะเปลี่ยนเป็น “ถูกปฏิเสธ”
    // (บางระบบอาจย้ายออกจากตาราง pending เลย ถ้าเป็นแบบนั้นให้ปรับ expectation ด้านล่าง)
    await expect(row.getByText(/ถูกปฏิเสธ/i)).toBeVisible({ timeout: 15000 });
  });
});
