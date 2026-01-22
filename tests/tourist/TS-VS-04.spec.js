import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Booking History View & Details", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/booking-histories");
        await expect(page).toHaveURL(/tourist\/booking-histories/);
    });

    /**
     * TC-VH-04.1: ยกเลิกการจองที่มีสถานะ  “รอการยืนยัน”
     */
    test("TC-VH-04.1: cancel booking with status 'รอการยืนยัน'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'รอการยืนยัน' }).click();
        await expect(page.getByText('รอยืนยัน').first()).toBeVisible();

        await page.getByText('เดินป่าศึกษาธรรมชาติรอการยืนยัน').click();
        const cancelButton = page.getByRole('button', { name: 'ยกเลิกการจอง' });
        await expect(cancelButton).toBeVisible();

        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('กรุณาเลือกเหตุผลในการยกเลิกการจอง')).toBeVisible();
    });

    /**
     * TC-VH-04.2: ยกเลิกการจองที่มีสถานะ “จองสำเร็จ”
     */
    test("TC-VH-04.2: cancel booking with status 'จองสำเร็จ'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'จองสำเร็จ' }).click();
        await expect(page.getByText('จองสำเร็จ').first()).toBeVisible();

        await page.getByRole('heading', { name: 'เดินป่าศึกษาธรรมชาติ' }).first().click();
        const cancelButton = page.getByRole('button', { name: 'ยกเลิกการจอง' });
        await expect(cancelButton).toBeVisible();

        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('กรุณาเลือกเหตุผลในการยกเลิกการจอง')).toBeVisible();
    });
});