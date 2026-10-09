import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Booking History View & Details", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/booking-histories");
        await page.waitForLoadState("networkidle");
    });

    /**
     * TC-VH-03.1: ดูการจองที่มีสถานะ “รอการยืนยัน”
     */
    test("TC-VH-03.1: View booking history with status 'รอการยืนยัน'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'รอการยืนยัน' }).click();
        await expect(page.getByText('รอยืนยัน').first()).toBeVisible();

        await page.getByText('เดินป่าศึกษาธรรมชาติรอการยืนยัน').click();
        const cancelButton = page.getByRole('button', { name: 'ยกเลิกการจอง' });
        await expect(cancelButton).toBeVisible();
    });

    /**
     * TC-VH-03.2: ดูการจองที่มีสถานะ “จองสำเร็จ”
     */
    test("TC-VH-03.2: View booking history with status 'จองสำเร็จ'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'จองสำเร็จ' }).click();
        await expect(page.getByText('จองสำเร็จ').first()).toBeVisible();

        await page.getByRole('heading', { name: 'เดินป่าศึกษาธรรมชาติ' }).first().click();
        const cancelButton = page.getByRole('button', { name: 'ยกเลิกการจอง' });
        await expect(cancelButton).toBeVisible();
    });

    /**
     * TC-VH-03.3: ดูการจองที่มีสถานะ “ถูกปฏิเสธ”
     */
    test("TC-VH-03.3: View booking history with status 'ถูกปฏิเสธ'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('ถูกปฏิเสธ').first()).toBeVisible();

        await page.getByRole('heading', { name: 'ปั่นจักรยานรอบหมู่บ้าน' }).first().click();

        await expect(page.getByText('เหตุผลที่ปฏิเสธ').first()).toBeVisible();
    });


    /**
     * TC-VH-03.4: ดูการจองที่มีสถานะ “รอการคืนเงิน”
     */
    test("TC-VH-03.4: View booking history with status 'รอการคืนเงิน'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();

        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('รอคืนเงิน').first()).toBeVisible();

        await page.getByRole('heading', { name: 'พักโฮมสเตย์สัมผัสธรรมชาติ' }).first().click();

        const refundButton = page.getByRole('button', { name: 'รายละเอียดคำขอเงินคืน' });
        await expect(refundButton).toBeVisible();
    });

    /**
     * TC-VH-03.5: ดูการจองที่มีสถานะ “คืนเงินแล้ว”
     */
    test("TC-VH-03.5: View booking history with status 'คืนเงินแล้ว'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();

        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('คืนเงินแล้ว').first()).toBeVisible();

        const refundButton = page.getByRole('button', { name: 'รายละเอียดคำขอเงินคืน' });
        await expect(refundButton).toBeVisible();
    });

    /**
     * TC-VH-03.6: ดูการจองที่มีสถานะ “การคืนเงินถูกปฏิเสธ”
     */
    test("TC-VH-03.6: View booking history with status 'การคืนเงินถูกปฏิเสธ'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();

        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('ปฏิเสธคืนเงิน').first()).toBeVisible();

        await page.getByRole('heading', { name: 'ทำอาหารพื้นบ้าน' }).click();

        await expect(page.getByText('เหตุผลที่ปฏิเสธ').first()).toBeVisible();

        const refundButton = page.getByRole('button', { name: 'รายละเอียดคำขอเงินคืน' });
        await expect(refundButton).toBeVisible();
    });
});