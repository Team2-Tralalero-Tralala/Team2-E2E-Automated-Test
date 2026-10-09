import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToRefundRequest - ฟังก์ชันนำผู้ใช้งานไปยังหน้าคำขอคืนเงิน
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action:
 *   1. คลิกเมนู "จัดการการจอง"
 *   2. คลิกเมนูย่อย "คำขอคืนเงิน"
 * Output:
 *   - ไม่มี return value, แต่ browser จะ navigate ไปยังหน้าคำขอคืนเงิน
 */
async function goToRefundRequest(page) {
  const manageBooking = page.getByRole("link", { name: "จัดการการจอง" });
  await expect(manageBooking).toBeVisible();
  await manageBooking.click();

  const refundRequestMenu = page.getByRole("link", { name: "คำขอคืนเงิน" });
  await expect(refundRequestMenu).toBeVisible();
  await refundRequestMenu.click();
}

/**
 * goToBookingHistory - ฟังก์ชันนำผู้ใช้งานไปยังหน้าประวัติการจอง
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action:
 *   1. คลิกเมนู "ประวัติการจอง"
 * Output:
 *   - ไม่มี return value, แต่ browser จะ navigate ไปยังหน้าประวัติการจอง
 */
async function goToBookingHistory(page) {
  const bookingHistory = page.getByRole("link", { name: "ประวัติการจอง" });
  await expect(bookingHistory).toBeVisible();
  await bookingHistory.click();
}

test.describe("Admin - Refund Approval", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

/**
 * TC-REFUND-01.1
 * ทดสอบการอนุมัติคำขอคืนเงินจากรายการ “รอคืนเงิน”
 * หลังจากกดยืนยันแล้ว เข้าเมนูประวัติการจอง
 * ตรวจสอบแถวแรกในตาราง คอลัมน์ "สถานะ" ต้องเป็น "คืนเงินแล้ว"
 */
test("TS-REFUND-01.1: approve refund request successfully", async ({
  page,
}) => {
  await goToRefundRequest(page);

  const approveBtn = page
    .getByRole("table")
    .getByRole("row")
    .nth(1)
    .getByRole("button", { name: /อนุมัติ/i });

  await expect(approveBtn).toBeEnabled();
  await approveBtn.click();

  const confirmBtn = page.getByRole("button", { name: /ยืนยัน/i });
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();

  await goToBookingHistory(page);

  const firstRowStatus = page
    .getByRole("table")
    .getByRole("row")
    .nth(1)
    .getByRole("cell", { name: "คืนเงินแล้ว" });

  await expect(firstRowStatus).toBeVisible();
});
/**
 * TC-REFUND-01.2
 * ทดสอบการปฏิเสธคำขอคืนเงิน
 * หลังจากกดปฏิเสธ ต้องกรอกเหตุผลและกดส่ง
 * จากนั้นเข้าเมนูประวัติการจอง
 * ตรวจสอบแถวแรกในตาราง คอลัมน์ "สถานะ" ต้องเป็น "ปฏิเสธการคืนเงิน"
 */
test("TS-REFUND-01.2: reject refund request successfully", async ({
  page,
}) => {
  await goToRefundRequest(page);

  const rejectBtn = page
    .getByRole("table")
    .getByRole("row")
    .nth(1)
    .getByRole("button", { name: /ปฏิเสธ/i });

  await expect(rejectBtn).toBeEnabled();
  await rejectBtn.click();

  const reasonInput = page.getByRole("textbox", { name: /เหตุผล/i });
  await expect(reasonInput).toBeVisible();
  await reasonInput.fill("ข้อมูลไม่ครบถ้วน");

  const submitBtn = page.getByRole("button", { name: /ส่ง/i });
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  await goToBookingHistory(page);

  const firstRowStatus = page
    .getByRole("table")
    .getByRole("row")
    .nth(1)
    .getByRole("cell", { name: "ปฏิเสธการคืนเงิน" });

  await expect(firstRowStatus).toBeVisible();
});

});
