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

    test("TS-CRP-01.1: ไม่เลือก ภูมิภาค, จังหวัด และวันที่", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
        // await page.waitForTimeout(5000);
    });

    test("TS-CRP-01.2: เลือกภูมิภาค", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByRole('button', { name: 'ทั้งหมด' }).click();
        await page.getByRole('button', { name: 'ภาคเหนือ' }).click();
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
    });

    test("TS-CRP-01.3: เลือกจังหวัด", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByPlaceholder('ค้นหาจังหวัด').click();
        await page.getByText('ตาก').click();
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
    });

    test("TS-CRP-01.4: เลือกวันที่", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByRole('region', { name: 'รายงาน' }).getByLabel('เปิดปฏิทิน').click();
        await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 30 ธันวาคม' }).click();
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
    });

    test("TS-CRP-01.5: เลือกตัวกรอง \"สัปดาห์\"", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByLabel('รายงาน').getByRole('button', { name: 'รายสัปดาห์' }).click();
        await page.locator('#calendar-mode-menu-_r_5_').getByRole('button', { name: 'รายสัปดาห์' }).click();
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
    });

    test("TS-CRP-01.6: เลือกตัวกรอง \"เดือน\"", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByLabel('รายงาน').getByRole('button', { name: 'รายสัปดาห์' }).click();
        await page.getByRole('button', { name: 'รายเดือน' }).click();
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
    });

    test("TS-CRP-01.7: เลือกตัวกรอง \"ปี\"", async ({ page }) => {
        await goToPageDashboard(page);
        await page.getByLabel('รายงาน').getByRole('button', { name: 'รายสัปดาห์' }).click();
        await page.getByRole('button', { name: 'รายปี' }).click();
        await page.getByRole('button', { name: 'พิมพ์รายงาน' }).click();
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