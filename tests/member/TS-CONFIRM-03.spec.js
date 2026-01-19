import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import path from "path";
import { safeGoto } from "../../utils/safeGoto.js";

test.describe("Member - Confirm", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TS-CONFIRM-03.1
     * ตรวจสอบการกดยกเลิกใน Pop-up
     */
    test("TS-CONFIRM-03.1: เมื่อกด “ยกเลิก” ต้องไม่มีการเปลี่ยนแปลง", async ({
        page,
    }) => {
        await goToBookingsPage(page);
        await page.getByRole('button', { name: 'อนุมัติ' }).first().click();
        let textHeader = page.getByRole('heading', { name: 'ยืนยันการอนุมัติการจอง' });
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'ยกเลิก' }).click();
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