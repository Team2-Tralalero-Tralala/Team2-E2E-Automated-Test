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

    test("TS-MST-01.1: คลิกปุ่ม (Button) \"เปิด/ปิดระบบ\" ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)", async ({ page }) => {
        await clickButtonModalStatus(page);
    });

    test("TS-MST-01.2: คลิกปุ่ม (Button) \"ยืนยัน\" ในหน้าต่างแสดงผลซ้อน (Modal) ระบบจะถูก เปิด/ปิด", async ({ page }) => {
        await confirmButtonModalStatus(page);
    });

    test("TS-MST-01.3: คลิกปุ่ม (Button) \"ยกเลิก\" ในหน้าต่างแสดงผลซ้อน (Modal) ระบบจะไม่ถูก เปิด/ปิด", async ({ page }) => {
        await cancelButtonModalStatus(page);
    });

    /*
     * คำอธิบาย : ฟังก์ชันสำหรับคลิกเปิดหน้าต่างยืนยันสถานะระบบ
     * Input: page (Playwright Page Object)
     * Output : หน้าต่าง Modal ยืนยันการปิดระบบแสดงผลขึ้นมา
     */
    async function clickButtonModalStatus(page) {
        await page.getByRole('link', { name: 'การตั้งค่า' }).click();
        await page.getByRole('link', { name: 'การเปิด/ปิด ระบบ' }).click();
        await page.getByRole('button', { name: 'ปิดระบบ' }).click();
        
        const modalHeader = page.getByText('ยืนยันการปิดระบบ');
        await expect(modalHeader).toBeVisible();
    }

    /*
     * คำอธิบาย : ฟังก์ชันสำหรับยืนยันการเปลี่ยนสถานะระบบใน Modal
     * Input: page (Playwright Page Object)
     * Output : ระบบดำเนินการเปลี่ยนสถานะหลังจากกดปุ่มยืนยัน
     */
    async function confirmButtonModalStatus(page) {
        await page.getByRole('link', { name: 'การตั้งค่า' }).click();
        await page.getByRole('link', { name: 'การเปิด/ปิด ระบบ' }).click();
        await page.getByRole('button', { name: 'ปิดระบบ' }).click();
        
        await expect(page.getByText('ยืนยันการปิดระบบ')).toBeVisible();
        const confirmBtn = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();
    }

    /*
     * คำอธิบาย : ฟังก์ชันสำหรับยกเลิกการเปลี่ยนสถานะระบบใน Modal
     * Input: page (Playwright Page Object)
     * Output : หน้าต่าง Modal ปิดลงและระบบไม่เปลี่ยนสถานะ
     */
    async function cancelButtonModalStatus(page) {
        await page.getByRole('link', { name: 'การตั้งค่า' }).click();
        await page.getByRole('link', { name: 'การเปิด/ปิด ระบบ' }).click();
        await page.getByRole('button', { name: 'ปิดระบบ' }).click();
        
        await expect(page.getByText('ยืนยันการปิดระบบ')).toBeVisible();
        const cancelBtn = page.getByRole('button', { name: 'ยกเลิก' });
        await expect(cancelBtn).toBeVisible();
        await cancelBtn.click();
    }
});