import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * TS-CRF-01
 * การเปิดหน้า “อนุมัติคำขอคืนเงิน”
 */
test.describe("Member - Refund Request Workflow", () => {
    // Serial mode is important if these tests modify the same data record
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");

        // Centralized Navigation
        await page.getByRole('link', { name: 'จัดการการจอง' })
            .or(page.getByRole('button', { name: 'จัดการการจอง' }))
            .click();

        const refundLink = page.getByRole('link', { name: 'คำขอคืนเงิน' })
            .or(page.getByRole('button', { name: 'คำขอคืนเงิน' }));

        await refundLink.click();

        // Ensure we are on the right page before starting any test
        await expect(page).toHaveURL(/member\/bookings\/refunded-pending/);
        await page.waitForLoadState('networkidle');
    });

    /**
     * TC-CRF-01.1: Verify 'Approve' button visibility
     */
    test("TC-CRF-01.1: Verify 'Approve' button visibility", async ({ page }) => {
        const noData = page.getByRole('cell', { name: 'ไม่มีข้อมูล' });

        // Fast fail if no data exists to test
        if (await noData.isVisible()) {
            test.skip(true, "No refund requests found. Seed data required.");
        }

        // Wait for at least one "Pending" row to appear
        const pendingRow = page.getByRole('row').filter({ hasText: 'รอคืนเงิน' });
        await expect(pendingRow.first()).toBeVisible({ timeout: 15000 });

        // Verify "Approve" (อนุมัติ) button is present in that row
        const approveButton = pendingRow.getByRole('button', { name: 'อนุมัติ' }).first();
        await expect(approveButton).toBeVisible();
    });

    /**
     * TC-CRF-01.2: Check confirmation modal before approval
     */
    test("TC-CRF-01.2: Check confirmation modal before approval", async ({ page }) => {
        const approveButton = page.getByRole('row')
            .filter({ hasText: 'รอคืนเงิน' })
            .getByRole('button', { name: 'อนุมัติ' })
            .first();

        await approveButton.click();

        // Check for SweetAlert popup
        const swal = page.locator('.swal2-popup');
        await expect(swal).toBeVisible({ timeout: 5000 });

        // Optional: Verify specific text in modal
        await expect(swal).toContainText(/ยืนยัน|แน่ใจ/);
    });

    /**
     * TC-CRF-01.3: Verify Cancel action in Modal
     */
    test("TC-CRF-01.3: Verify Cancel action in Modal", async ({ page }) => {
        const approveButton = page.getByRole('row')
            .filter({ hasText: 'รอคืนเงิน' })
            .getByRole('button', { name: 'อนุมัติ' })
            .first();

        await approveButton.click();

        const cancelButton = page.locator('.swal2-cancel')
            .or(page.getByRole('button', { name: 'ยกเลิก' }))
            .or(page.getByText('Cancel'));

        await cancelButton.click();

        // Verify Modal is gone and Approve button is still there
        await expect(page.locator('.swal2-popup')).not.toBeVisible();
        await expect(approveButton).toBeVisible();
    });

    test("TC-CRF-01.4: Verify Approve confirmation", async ({ page }) => {
    // --- ส่วนที่ 1: หน้าคำขอคืนเงิน ---
    // ค้นหาแถวเป้าหมายและเก็บข้อมูลไว้สำหรับตรวจสอบในหน้าถัดไป
    const targetRow = page.getByRole('row').filter({ hasText: 'รอคืนเงิน' }).first();
    const userName = (await targetRow.locator('td').nth(0).textContent())?.trim();
    const activityName = (await targetRow.locator('td').nth(1).textContent())?.trim();

    // กดยืนยันอนุมัติ
    await targetRow.getByRole('button', { name: 'อนุมัติ' }).click();
    
    const confirmButton = page.getByRole('button', { name: /ยืนยัน|ตกลง|Yes/ });
    await confirmButton.click();

    // สำคัญ: ต้องรอให้ Modal หายไปก่อนเปลี่ยนหน้า เพื่อให้ Backend บันทึกข้อมูลเสร็จสมบูรณ์
    await expect(page.locator('.swal2-popup')).not.toBeVisible();

    // --- ส่วนที่ 2: หน้าประวัติการจอง ---
    // เปลี่ยนหน้าไปที่ประวัติการจอง
    await page.getByRole('link', { name: 'ประวัติการจอง' }).click();
    await page.waitForLoadState('networkidle');

    // ค้นหาแถวโดยระบุเงื่อนไขให้เจาะจงที่สุด (ชื่อคนจอง + ชื่อกิจกรรม)
    const historyRow = page.getByRole('row')
        .filter({ hasText: userName })
        .filter({ hasText: activityName })
        .first(); // เลือกแถวแรกที่เจอ (กรณีมีข้อมูลซ้ำหลายรายการ)

    // ตรวจสอบว่าแถวนั้นแสดงผลอยู่
    await expect(historyRow).toBeVisible({ timeout: 10000 });

    // ตรวจสอบสถานะว่าเปลี่ยนเป็น "คืนเงินแล้ว" หรือไม่
    const statusCell = historyRow.getByRole('cell', { name: 'คืนเงินแล้ว' });
    await expect(statusCell).toBeVisible();
});
});