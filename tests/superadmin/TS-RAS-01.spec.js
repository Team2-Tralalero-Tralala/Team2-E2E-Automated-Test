import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToReportAndDashboardPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้ารายงานและสถิติ
 * Input: 
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 * 1. ค้นหาลิงก์เมนู "รายงาน" ที่ Sidebar
 * 2. ตรวจสอบว่าลิงก์มองเห็นได้และทำการคลิก
 * 3. รอจนกว่า URL จะเปลี่ยนเป็น /super/dashboard
 * 4. รอจนกว่าข้อความ "สถิติการจองแพ็กเกจ" จะปรากฏเพื่อยืนยันว่าหน้าโหลดเสร็จสมบูรณ์
 * Output:
 * - ไม่มี return value, แต่ browser จะถูก navigate ไปยังหน้ารายงาน
 */
async function goToReportAndDashboardPage(page) {
    const reportSidebar = page.getByRole("link", { name: "รายงาน" });
    await expect(reportSidebar).toBeVisible();
    await reportSidebar.click();
    await expect(page).toHaveURL(/\/super\/dashboard/);
    await expect(page.getByText('สถิติการจองแพ็กเกจ')).toBeVisible();
}

/**
 * selectFilterMode - ฟังก์ชันเลือกโหมดการแสดงผล (รายสัปดาห์, รายเดือน, รายปี) ในขอบเขตที่กำหนด
 * Input: 
 * - page: object ของ Playwright Page
 * - parentScope: object Locator ระบุขอบเขตที่จะค้นหาปุ่ม (เช่น ตัวแปร statsCard)
 * - modeName: String ชื่อโหมดที่ต้องการเลือก (ต้องตรงกับ text ในปุ่ม เช่น 'รายสัปดาห์', 'รายเดือน', 'รายปี')
 * Action: 
 * 1. ค้นหาปุ่ม Dropdown ภายใน parentScope โดยจับจากข้อความสถานะปัจจุบัน
 * 2. คลิกปุ่ม Dropdown เพื่อเปิดเมนูตัวเลือก
 * 3. ค้นหาปุ่มตัวเลือกที่มีชื่อตรงกับ modeName (กรองเอาเฉพาะตัวเลือกจริง ตัดปุ่ม Trigger ทิ้งด้วย aria-haspopup)
 * 4. คลิกที่ตัวเลือกนั้น
 * Output:
 * - ไม่มี return value, UI ภายใน Card จะเปลี่ยนโหมดการแสดงผล
 */
async function selectFilterMode(page, parentScope, modeName) {
    const dropdownButton = parentScope.locator('button').filter({ hasText: /รายสัปดาห์|รายเดือน|รายปี/ }).last();
    await dropdownButton.click();
    
    await page.getByRole('button', { name: modeName })
        .filter({ hasNot: page.locator('[aria-haspopup]') }) 
        .first() 
        .click();
}

/**
 * openCalendar - ฟังก์ชันคลิกปุ่มเพื่อเปิด Popup ปฏิทิน
 * Input: 
 * - parentScope: object Locator ระบุขอบเขตที่จะค้นหาปุ่ม (เช่น ตัวแปร statsCard)
 * Action: 
 * 1. ค้นหาปุ่มที่มี Icon (svg) ภายใน parentScope
 * 2. กรองปุ่มที่มีข้อความ "ราย" ออกไป (เพื่อป้องกันการกดผิดไปโดนปุ่มเลือกโหมด)
 * 3. คลิกปุ่มปฏิทินที่เหลืออยู่
 * Output:
 * - ไม่มี return value, Popup ปฏิทินจะแสดงขึ้นมาบนหน้าจอ
 */
async function openCalendar(parentScope) {
    const calendarBtn = parentScope.locator('button:has(svg)')
        .filter({ hasNotText: /ราย/ })
        .last();
    await calendarBtn.click();
}

test.describe("SuperAdmin - View Report And Dashboard", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });
    /**
     * TS-RAS-01.1
     * เลือกวันที่
     */
    test("TS-RAS-01.1: เลือกวันที่", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const statsCard = page.locator('div')
            .filter({ has: page.getByText('สถิติการจองแพ็กเกจ') })
            .filter({ has: page.locator('button') })
            .last();

        await openCalendar(statsCard);

        await page.getByRole('gridcell').filter({ hasText: /^1$/ }).first().click();
    });
    /**
     * TS-RAS-01.2
     * เลือกตัวกรอง:สัปดาห์
     */
    test("TS-RAS-01.2: เลือกตัวกรอง:สัปดาห์", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const statsCard = page.locator('div')
            .filter({ has: page.getByText('สถิติการจองแพ็กเกจ') })
            .filter({ has: page.locator('button') })
            .last();

        await selectFilterMode(page, statsCard, 'รายสัปดาห์');
        await openCalendar(statsCard);

        await page.getByRole('gridcell').filter({ hasText: /^8$/ }).first().click();
    });
    /**
     * TS-RAS-01.3
     * เลือกตัวกรอง:เดือน
     */
    test("TS-RAS-01.3: เลือกตัวกรอง:เดือน", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const statsCard = page.locator('div')
            .filter({ has: page.getByText('สถิติการจองแพ็กเกจ') })
            .filter({ has: page.locator('button') })
            .last();

        await selectFilterMode(page, statsCard, 'รายเดือน');
        await openCalendar(statsCard);

        await page.getByRole('option').filter({ hasText: 'พ.ย.' }).click();
    });
    /**
     * TS-RAS-01.4
     * เลือกตัวกรอง:ปี
     */
    test("TS-RAS-01.4: เลือกตัวกรอง:ปี", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const statsCard = page.locator('div')
            .filter({ has: page.getByText('สถิติการจองแพ็กเกจ') })
            .filter({ has: page.locator('button') })
            .last();

        await selectFilterMode(page, statsCard, 'รายปี');
        await openCalendar(statsCard);

        await page.getByRole('button', { name: '2568' }).first().click();
    });

});

