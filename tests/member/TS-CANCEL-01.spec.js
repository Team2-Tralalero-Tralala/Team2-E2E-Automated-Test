import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToBookingManagementPage - นำผู้ใช้งานไปยังหน้าจัดการการจอง
 *
 * Input:
 *   - page: Playwright Page
 *
 * Action:
 *   1. คลิกเมนู “จัดการการจอง”
 *
 * Expected Result:
 *   - ระบบนำผู้ใช้งานเข้าสู่หน้าจัดการการจอง
 */
async function goToBookingManagementPage(page) {
    const bookingMenu = page.getByRole("link", { name: "จัดการการจอง" });
    await expect(bookingMenu).toBeVisible();
    await bookingMenu.click();
}

test.describe("TC-CANCEL-01: Reject Booking", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TC-CANCEL-01.1
     * ตรวจสอบการแสดงปุ่ม “ปฏิเสธ” สำหรับรายการจองของสมาชิก
     */
    test("TC-CANCEL-01.1: member sees reject button on pending booking", async ({ page }) => {
        await goToBookingManagementPage(page);

        const pendingBookingRow = page
            .locator("tr")
            .filter({ hasText: "รอตรวจสอบ" })
            .first();

        await expect(pendingBookingRow).toBeVisible();

        const rejectButton = pendingBookingRow.getByRole("button", { name: "ปฏิเสธ" });
        await expect(rejectButton).toBeVisible();
    });

    /**
     * TC-CANCEL-01.2
     * เมื่อคลิกปุ่ม “ปฏิเสธ” ต้องแสดง Modal ยืนยันการปฏิเสธ
     */
    test("TC-CANCEL-01.2: display reject confirmation modal", async ({ page }) => {
        await goToBookingManagementPage(page);

        const pendingBookingRow = page
            .locator("tr")
            .filter({ hasText: "รอตรวจสอบ" })
            .first();

        await expect(pendingBookingRow).toBeVisible();

        const rejectButton = pendingBookingRow.getByRole("button", { name: "ปฏิเสธ" });
        await expect(rejectButton).toBeVisible();
        await rejectButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        await expect(
            modal.getByRole("button", { name: /ยืนยัน/i })
        ).toBeVisible();

        await expect(
            modal.getByRole("button", { name: /ยกเลิก/i })
        ).toBeVisible();
    });
    /**
     * TC-CANCEL-01.3
     * ยกเลิกการปฏิเสธการจอง และตรวจสอบว่าสถานะยังไม่เปลี่ยนแปลง
    */
    test("TC-CANCEL-01.3: cancel reject booking and status remains pending", async ({ page }) => {
        await goToBookingManagementPage(page);

        const pendingBookingRow = page
            .locator("tr")
            .filter({ hasText: "รอตรวจสอบ" })
            .first();

        await expect(pendingBookingRow).toBeVisible();

        const rejectButton = pendingBookingRow.getByRole("button", { name: "ปฏิเสธ" });
        await expect(rejectButton).toBeVisible();
        await rejectButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const cancelBtn = modal.getByRole("button", { name: /ยกเลิก/i });
        await expect(cancelBtn).toBeVisible();
        await cancelBtn.click();

        await expect(modal).toHaveCount(0);

        await expect(
            pendingBookingRow.getByText("รอตรวจสอบ")
        ).toBeVisible();
    });

    /**
     * TC-CANCEL-01.4
     * ยืนยันการปฏิเสธการจอง และตรวจสอบสถานะในหน้าประวัติการจอง
     */
    test("TC-CANCEL-01.4: confirm reject booking and verify status in booking history", async ({ page }) => {
        await goToBookingManagementPage(page);

        const pendingBookingRow = page
            .locator("tr")
            .filter({ hasText: "รอตรวจสอบ" })
            .first();

        await expect(pendingBookingRow).toBeVisible();

        const rejectButton = pendingBookingRow.getByRole("button", { name: "ปฏิเสธ" });
        await expect(rejectButton).toBeVisible();
        await rejectButton.click();

        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();

        const confirmBtn = modal.getByRole("button", { name: /ยืนยัน/i });
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        await expect(modal).toHaveCount(0);

        const bookingHistoryMenu = page.getByRole("link", { name: "ประวัติการจอง" });
        await expect(bookingHistoryMenu).toBeVisible();
        await bookingHistoryMenu.click();

        const firstHistoryRow = page
            .getByRole("table")
            .getByRole("rowgroup")
            .nth(1)
            .getByRole("row")
            .first();

        await expect(
            firstHistoryRow.getByText("ปฏิเสธการจอง")
        ).toBeVisible();
    });

});
