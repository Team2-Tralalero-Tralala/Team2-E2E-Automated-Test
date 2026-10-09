import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import path from "path";
import { safeGoto } from "../../utils/safeGoto.js";

test.describe("Member - Delete Package", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TS-BOOK-03.1
     * ค้นหาการจองตามชื่อกิจกรรม
     */
    test("TS-BOOK-03.1: สมาชิกพิมพ์คีย์เวิร์ดในช่องค้นหา", async ({
        page,
    }) => {
        await goToBookingsPage(page);
        await search(page, "ชมทะเลหมอกยามเช้า");
        await checkRow(page);
    });

    /*
    * คำอธิบาย : ไปหน้าจัดการการจอง
    * Input: page (Playwright Page Object)
    * Output : -
    */
    async function goToBookingsPage(page) {
        await page.getByRole('link', { name: 'จัดการการจอง' }).click();
        // await safeGoto(page, "/member/bookings/all");
        let textHeader = page.getByText('รายการการจอง');
        await expect(textHeader).toBeVisible();
    }

    /*
    * คำอธิบาย : ฟังก์ชันตรวจสอบแถวข้อมูลการจอง
    * Input: page (Playwright Page Object)
    * Output : -
    */
    async function checkRow(page) {
        const row = page.locator('tbody tr').first();
        await expect(row).toBeVisible();
        await expect(row.locator('td').nth(1)).not.toBeEmpty();
        await expect(row.locator('td').nth(2)).not.toBeEmpty();
        await expect(row.locator('td').nth(3)).not.toBeEmpty();
        await expect(row.locator('td').nth(4)).not.toBeEmpty();
        const evidenceCol = row.locator('td').nth(5);
        await expect(evidenceCol).not.toBeEmpty();
    }

    /*
    * คำอธิบาย : ฟังก์ชันค้นหาการจองตามคีย์เวิร์ด
    * Input: page (Playwright Page Object), keyword (string)
    * Output : -
    */
    async function search(page, keyword) {
        await page.getByRole('textbox', { name: 'ค้นหา' }).click();
        await page.getByRole('textbox', { name: 'ค้นหา' }).fill(keyword);
        await page.getByRole('textbox', { name: 'ค้นหา' }).press('Enter');
    }
});