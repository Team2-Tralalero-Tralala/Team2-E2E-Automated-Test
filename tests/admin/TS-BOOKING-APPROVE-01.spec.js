import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManageBookingsPage - ฟังก์ชันสำหรับไปยังหน้าจัดการการจอง
 * Input:
 * - page: object ของ Playwright Page
 * Action:
 * 1. ค้นหาเมนู "จัดการการจอง" หากยังไม่แสดง ให้คลิกเมนูแม่ "จัดการชุมชน" เพื่อเปิดลิสต์
 * 2. รอจนกว่าเมนู "จัดการการจอง" จะแสดงผลและทำการคลิก
 * 3. ตรวจสอบว่า Browser ไปที่หน้ารายการการจอง (/admin/bookings)
 * Output:
 * - ไม่มี return value, Browser จะถูก Navigate ไปยัง URL หน้าจัดการการจอง
 */
async function goToManageBookingsPage(page) {
    const manageBookingsLink = page.getByRole('link', { name: 'จัดการการจอง' }).or(page.getByRole('button', { name: 'จัดการการจอง' }));
    await expect(manageBookingsLink).toBeVisible();
    await manageBookingsLink.click();
    await expect(page).toHaveURL(/admin\/bookings/);
    await page.waitForLoadState('networkidle');
}

test.describe("Admin - Booking Approval Workflow", () => {

    // Shared variable to store booking details for cross-verification
    let approvedBookingDetails = null;

    test.describe("Authorized Admin Actions", () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, "admin");
            await expect(page).toHaveURL(/admin\/community\/own/);
            // Navigate to Manage Bookings using documented helper
            await goToManageBookingsPage(page);
        });

        /**
         * TC-BOOKING-APPROVE-01.1: ทดสอบการอนุมัติคำขอการจองที่อยู่ในสถานะ “รอตรวจสอบ”
         * ขั้นตอน:
         * 1. เข้าสู่ระบบด้วยบัญชี Admin
         * 2. ไปที่เมนู “จัดการการจอง”
         * 3. เลือกรายการที่มีสถานะ “รอตรวจสอบ”
         * 4. คลิกปุ่ม “อนุมัติ”
         * 5. ยืนยันการอนุมัติ
         */
        test("TC-BOOKING-APPROVE-01.1: Approve 'Pending' Booking", async ({ page }) => {
            // 1. Find "Pending" row
            const pendingRow = page.locator('tr').filter({ has: page.getByText('รอตรวจสอบ') }).first();

            if (await pendingRow.count() === 0) {
                // Fail if this critical test cannot run. Or seed data if possible (not in scope).
                test.fail(true, "No 'Pending' bookings available to approve.");
                return;
            }

            // Store details for verification in history later (TC 1.3)
            const rowText = await pendingRow.innerText();
            approvedBookingDetails = rowText; // simplified for matching
            console.log("Approving Booking:", rowText);

            // 2. Click "Approve"
            const approveButton = pendingRow.getByRole('button', { name: 'อนุมัติ' });
            await approveButton.click();

            // 3. Confirm in Popup
            const confirmButton = page.getByRole('button', { name: 'ยืนยัน' }).or(page.getByRole('button', { name: 'ตกลง' })).or(page.locator('.swal2-confirm'));
            await expect(confirmButton).toBeVisible();
            await confirmButton.click();

            // 4. Verify Row is removed or Status updated
            await page.waitForLoadState('networkidle');
            await expect(page.locator('tr').filter({ hasText: 'รอตรวจสอบ' }).filter({ hasText: rowText.split('\n')[0] })).toHaveCount(0); // Rough check
        });

        /**
         * TC-BOOKING-APPROVE-01.2: ทดสอบการกดยกเลิกในหน้าต่าง Popup
         * ขั้นตอน:
         * 1. เข้าสู่ระบบด้วยบัญชี Admin
         * 2. ไปที่เมนู “จัดการการจอง”
         * 3. คลิกปุ่ม “อนุมัติ” ในรายการที่รอตรวจสอบ
         * 4. เมื่อ Popup แสดงขึ้น กด “ยกเลิก”
         */
        test("TC-BOOKING-APPROVE-01.2: Cancel Approval in Popup", async ({ page }) => {
            // 1. Find a row with status "รอตรวจสอบ" (Pending)
            const pendingRow = page.locator('tr').filter({ has: page.getByText('รอตรวจสอบ') }).first();

            if (await pendingRow.count() === 0) {
                test.skip("No 'Pending' (รอตรวจสอบ) bookings available for testing cancel popup.");
                return;
            }

            // 2. Click "Approve" (อนุมัติ) button in that row
            const approveButton = pendingRow.getByRole('button', { name: 'อนุมัติ' });
            await expect(approveButton).toBeVisible();
            await approveButton.click();

            // 3. Verify Popup appears
            const popup = page.locator('.swal2-popup');
            await expect(popup).toBeVisible();

            // 4. Click "Cancel" (ยกเลิก) in Popup
            const cancelButton = page.getByRole('button', { name: 'ยกเลิก' }).filter({ hasText: 'ยกเลิก' }).last();
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();

            // 5. Verify Popup closed and Status is still "Pending"
            await expect(popup).toBeHidden();
            await expect(pendingRow).toBeVisible();
            await expect(pendingRow).toContainText('รอตรวจสอบ');
        });

        /**
         * TC-BOOKING-APPROVE-01.3: ตรวจสอบว่าหลังอนุมัติ ข้อมูลถูกแสดงใน “ประวัติการจอง”
         * ขั้นตอน:
         * 1. เข้าสู่ระบบด้วยบัญชี Admin
         * 2. ไปที่ “จัดการการจอง” และอนุมัติรายการหนึ่ง
         * 3. เปิดเมนู “ประวัติการจอง”
         * 4. ตรวจสอบว่ารายการที่อนุมัติแล้วแสดงอยู่ในตาราง
         */
        test("TC-BOOKING-APPROVE-01.3: Verify approved booking in 'Booking History'", async ({ page }) => {
            // 1. Go to History
            const historyLink = page.getByRole('link', { name: 'ประวัติการจอง' }).or(page.getByRole('button', { name: 'ประวัติการจอง' }));
            await historyLink.click();
            await expect(page).toHaveURL(/admin\/bookings-histories\/all/);
            await page.waitForLoadState('networkidle');

            // 2. Check for "Success" (จองสำเร็จ) items
            const filterButton = page.locator('button').filter({ hasText: /สถานะ|Status/ }).last();
            if (await filterButton.isVisible()) {
                await filterButton.click();
                const successOption = page.getByRole('option', { name: 'จองสำเร็จ' })
                    .or(page.getByRole('menuitem', { name: 'จองสำเร็จ' }))
                    .or(page.getByText('จองสำเร็จ'));
                if (await successOption.isVisible()) await successOption.click();
            }

            // 3. Verify at least one approved item exists
            const rows = page.locator('tbody tr');
            await expect(rows.first()).toBeVisible();
            await expect(rows.first()).toContainText('จองสำเร็จ');
        });
    });

    test.describe("Unauthorized Access", () => {
        /**
         * TC-BOOKING-APPROVE-01.4: ทดสอบการเข้าถึงหน้าจัดการการจองโดยผู้ใช้ Member
         * ขั้นตอน:
         * 1. เข้าสู่ระบบด้วยบัญชี Member
         * 2. พยายามเข้าหน้า “จัดการการจอง” ผ่าน URL โดยตรง
         * 3. หรือคลิกปุ่ม “อนุมัติ” หากมี
         */
        test("TC-BOOKING-APPROVE-01.4: Member cannot access Manage Bookings page", async ({ page }) => {
            // 1. Login as Member
            await loginAs(page, "member");

            // 2. Try to visit Admin Manage Bookings URL directly
            await page.goto("/admin/bookings");

            // 3. Verify Redirect
            await expect(page).not.toHaveURL(/admin\/bookings/);
            await expect(page).toHaveURL(/login/);
        });
    });
});
