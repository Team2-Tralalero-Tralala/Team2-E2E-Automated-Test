/**
 * คำอธิบาย : การทดสอบสำหรับการจัดการระบบ (เปิด/ปิดระบบ) โดย Super Admin
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("SuperAdmin - Manage Community", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });

    test("TS-CRP-02.1: ผู้ใช้งานบัญชี Super Admin ต้องสามารถดาวน์โหลดรายงานได้", async ({ page }) => {
        await goToPageDashboard(page);
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
        const download = await downloadPromise;
        const filePath = await download.path();
        console.log(`ดาวน์โหลดไฟล์สำเร็จที่: ${filePath}`);
        await expect(filePath).not.toBeNull();
    });

    /*
     * คำอธิบาย : ไปที่หน้ารายงาน
     * Input: page (Playwright Page Object)
     * Output : -
     */
    async function goToPageDashboard(page) {
        await page.getByRole('link', { name: 'รายงาน' }).click();
        const textHeader = page.getByText('สถิติการจองแพ็กเกจ');
        await expect(textHeader).toBeVisible();
    }
});