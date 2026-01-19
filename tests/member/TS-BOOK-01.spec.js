import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import path from "path";
import { safeGoto } from "../../utils/safeGoto.js";

test.describe("Member - Delete Package", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TS-BOOK-01.1
     * สมาชิกเปิดหน้า “จัดการการจอง”
     */
    test("TS-BOOK-01.1: ตรวจสอบว่าสมาชิกเข้าไปดูหน้าการจองได้", async ({
        page,
    }) => {
        await goToBookingsPage(page);
        await expect(page.locator('tbody input[type="checkbox"]').first()).toBeVisible();
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
});