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

test.describe("Admin - Booking Rejection Workflow", () => {

    test.describe("Authorized Admin Actions", () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, "admin");
            await expect(page).toHaveURL(/admin\/community\/own/);
            // Navigate to Manage Bookings
            await goToManageBookingsPage(page);
        });

        /**
         * TC-BOOKING-REJECT-01.1: ทดสอบการปฏิเสธคำขอการจองที่อยู่ในสถานะ “รอตรวจสอบ”
         * ขั้นตอน:
         * 1. เข้าสู่ระบบด้วยบัญชี Admin
         * 2. ไปที่เมนู “จัดการการจอง”
         * 3. เลือกรายการที่มีสถานะ “รอตรวจสอบ”
         * 4. คลิกปุ่ม “ปฏิเสธ”
         * 5. ระบบแสดง Popup “ปฏิเสธการจองหรือไม่ คุณจะไม่สามารถย้อนกลับได้”
         * 6. กดยืนยัน “ปฏิเสธ” (หรือยืนยันใน Popup)
         */
        test("TC-BOOKING-REJECT-01.1: Reject 'Pending' Booking", async ({ page }) => {
            // 1. Find "Pending" row
            const pendingRow = page.locator('tr').filter({ has: page.getByText('รอตรวจสอบ') }).first();

            if (await pendingRow.count() === 0) {
                test.skip(true, "No 'Pending' bookings available to reject.");
                return;
            }

            const rowText = await pendingRow.innerText();
            console.log("Rejecting Booking:", rowText);

            // 2. Click "Reject"
            const rejectButton = pendingRow.getByRole('button', { name: 'ปฏิเสธ' });
            await rejectButton.click();

            // 3. Confirm in Popup
            const popup = page.locator('.swal2-popup');
            await expect(popup).toBeVisible();
            // Verify correct text based on actual UI
            await expect(popup).toContainText('กรุณากรอกเหตุผลการปฏิเสธการจอง');

            // 4. Fill Rejection Reason
            // Snapshot confirms placeholder is "ระบุเหตุผลที่ปฏิเสธ..."
            const reasonInput = popup.getByPlaceholder('ระบุเหตุผลที่ปฏิเสธ...');
            await expect(reasonInput).toBeVisible();
            await reasonInput.fill('Test Rejection Reason: Booking not available.');

            // 5. Click Confirm (Send/ส่ง)
            const confirmButton = popup.getByRole('button', { name: 'ส่ง' });
            await expect(confirmButton).toBeVisible();
            await confirmButton.click();

            // 6. Verify Row is removed
            await page.waitForLoadState('networkidle');
            await expect(page.locator('tr').filter({ hasText: 'รอตรวจสอบ' }).filter({ hasText: rowText.split('\n')[0] })).toHaveCount(0);
        });

        /**
        * TC-BOOKING-REJECT-01.2: ทดสอบกรณีผู้ดูแลระบบกดยกเลิกใน Popup
        * ขั้นตอน:
        * 1. เข้าสู่ระบบด้วยบัญชี Admin
        * 2. ไปที่ “จัดการการจอง”
        * 3. คลิกปุ่ม “ปฏิเสธ” ในรายการ “รอตรวจสอบ”
        * 4. เมื่อ Popup แสดงขึ้น ให้กด “ยกเลิก”
        */
        test("TC-BOOKING-REJECT-01.2: Cancel Rejection in Popup", async ({ page }) => {
            // 1. Find a row with status "รอตรวจสอบ" (Pending)
            const pendingRow = page.locator('tr').filter({ has: page.getByText('รอตรวจสอบ') }).first();

            if (await pendingRow.count() === 0) {
                test.skip("No 'Pending' (รอตรวจสอบ) bookings available for testing cancel popup.");
                return;
            }

            // 2. Click "Reject" (ปฏิเสธ) button in that row
            const rejectButton = pendingRow.getByRole('button', { name: 'ปฏิเสธ' });
            await expect(rejectButton).toBeVisible();
            await rejectButton.click();

            // 3. Verify Popup appears
            const popup = page.locator('.swal2-popup');
            await expect(popup).toBeVisible();

            // Verify text regarding reason input (กรุณากรอกเหตุผลการปฏิเสธการจอง)
            await expect(popup).toContainText('กรุณากรอกเหตุผลการปฏิเสธการจอง');

            // Verify input exists
            const reasonInput = popup.getByPlaceholder('ระบุเหตุผลที่ปฏิเสธ...');
            await expect(reasonInput).toBeVisible();

            // 4. Click "Cancel" (ยกเลิก) in Popup
            const cancelButton = popup.getByRole('button', { name: 'ยกเลิก' });
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();

            // 5. Verify Popup closed and Status is still "Pending"
            await expect(popup).toBeHidden();
            await expect(pendingRow).toBeVisible();
            await expect(pendingRow).toContainText('รอตรวจสอบ');
        });

        /**
         * TC-BOOKING-REJECT-01.3: ทดสอบว่าหลังปฏิเสธแล้ว รายการปรากฏในหน้าประวัติการจองถูกต้อง
         * ขั้นตอน:
         * 1. ปฏิเสธรายการสถานะ “รอตรวจสอบ” สำเร็จ (Check 01.1)
         * 2. ไปที่เมนู “ประวัติการจอง”
         * 3. ตรวจสอบข้อมูลสถานะ “ปฏิเสธการจอง”
         */
        test("TC-BOOKING-REJECT-01.3: Verify rejected booking in 'Booking History'", async ({ page }) => {
            // 1. Go to History
            const historyLink = page.getByRole('link', { name: 'ประวัติการจอง' }).or(page.getByRole('button', { name: 'ประวัติการจอง' }));
            await historyLink.click();
            await expect(page).toHaveURL(/admin\/bookings-histories\/all/);
            await page.waitForLoadState('networkidle');

            // 2. Check for "Rejected" (ปฏิเสธการจอง)
            // The filter button usually defaults to "ทั้งหมด" (All)
            const filterButton = page.locator('button').filter({ hasText: /ทั้งหมด|สถานะ|Status/ }).last();
            await expect(filterButton).toBeVisible();
            await filterButton.click();

            // Use specific button role to avoid matching table cells (td) found by getByText
            const rejectOption = page.getByRole('button', { name: 'ปฏิเสธการจอง', exact: true })
                .or(page.getByRole('button', { name: 'ถูกปฏิเสธ' }));

            await expect(rejectOption).toBeVisible();
            await rejectOption.click();

            // Wait for table to update
            // Instead of fixed timeout, wait for the table to NOT contain "Success" (indicating filter applied)
            // Or wait for the first row to have "Rejected" status
            await expect(async () => {
                const firstRow = page.locator('tbody tr').first();
                await expect(firstRow).toBeVisible();
                await expect(firstRow).toContainText(/ถูกปฏิเสธ|ปฏิเสธ/);
            }).toPass({ timeout: 5000 });

            const rows = page.locator('tbody tr');
            await expect(rows.first()).toContainText(/ถูกปฏิเสธ|ปฏิเสธ/);
        });
    });
});
