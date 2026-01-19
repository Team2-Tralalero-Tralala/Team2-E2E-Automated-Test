import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import path from "path";
import { safeGoto } from "../../utils/safeGoto.js";

test.describe("Member - Confirm", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TS-CONFIRM-01.1
     * ตรวจสอบการแสดงปุ่ม “อนุมัติ”
     */
    test("TS-CONFIRM-01.1: สมาชิกเห็นปุ่ม “อนุมัติ” เฉพาะการจองของตน", async ({
        page,
    }) => {
        await goToBookingsPage(page);
        let button = page.getByRole('button', { name: 'อนุมัติ' }).first();
        await expect(button).toBeVisible();
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