import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Booking History View & Details", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/booking-histories");
        await expect(page).toHaveURL(/tourist\/booking-histories/);
    });

    /**
     * TC-VH-05.1: ดูรายละเอียดคำขอเงินคืนที่มีสถานะ “รอการคืนเงิน”
     */
    test("TC-VH-05.1: View details of refund request with status 'รอการคืนเงิน'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();

        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('รอคืนเงิน').first()).toBeVisible();

        await page.getByRole('heading', { name: 'พักโฮมสเตย์สัมผัสธรรมชาติ' }).first().click();

        const refundButton = page.getByRole('button', { name: 'รายละเอียดคำขอเงินคืน' });
        await expect(refundButton).toBeVisible();
    });

    /**
     * TC-VH-05.2: ดูรายละเอียดคำขอเงินคืนที่มีสถานะ “คืนเงินแล้ว”
     */
    test("TC-VH-05.2: View details of refund request with status 'คืนเงินแล้ว'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();

        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('คืนเงินแล้ว').first()).toBeVisible();

        const refundButton = page.getByRole('button', { name: 'รายละเอียดคำขอเงินคืน' });
        await expect(refundButton).toBeVisible();
    });

    /**
     * TC-VH-05.3: ดูรายละเอียดคำขอเงินคืนที่มีสถานะ “การคืนเงินถูกปฏิเสธ”
     */
    test("TC-VH-05.3: View details of refund request with status 'การคืนเงินถูกปฏิเสธ'", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();

        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await expect(page.getByText('การคืนเงินถูกปฏิเสธ').first()).toBeVisible();

        await page.getByRole('heading', { name: 'ทำอาหารพื้นบ้าน' }).click();

        await expect(page.getByText('เหตุผลที่ปฏิเสธ').first()).toBeVisible();

        const refundButton = page.getByRole('button', { name: 'รายละเอียดคำขอเงินคืน' });
        await expect(refundButton).toBeVisible();
    });
});