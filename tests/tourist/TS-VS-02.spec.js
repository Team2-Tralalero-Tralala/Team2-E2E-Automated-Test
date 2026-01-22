import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";
import { safeGoto } from "../../utils/safeGoto.js";

async function goToPageBookinghistory(page) {
    await page.getByRole('button', { name: /.* Profile/ }).click();
    await page.getByRole('link', { name: 'ประวัติการจอง' }).click();
}

test.describe("Tourist - Booking History View & Details", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/home");
    });

    /**
     * TC-VS-02.1: ผู้ใช้งานสามารถค้นหาสถานะการจองได้
     */
    test("TC-VS-02.1: Filter booking history by status", async ({ page }) => {
        await goToPageBookinghistory(page);
        await expect(page.getByRole('heading', { name: 'ประวัติการจอง' })).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'จองสำเร็จ' }).click();
        await page.getByRole('heading', { name: 'ประวัติการจอง' }).click();
        await expect(page.getByText('จองสำเร็จ').first()).toBeVisible();  
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ยกเลิกการจอง' }).click();
        await page.getByRole('heading', { name: 'ประวัติการจอง' }).click();
        await expect(page.getByText('รอคืนเงิน').first()).toBeVisible();
        
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'ทั้งหมด' }).first().click();
        await expect(page.getByText('รอคืนเงิน')).toBeVisible();
        await expect(page.getByText('ถูกปฏิเสธ').first()).toBeVisible();
    });

});