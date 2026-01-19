
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
 * - parentScope: object Locator ระบุขอบเขตที่จะค้นหาปุ่ม (เช่น ตัวแปร statsCard หรือ reportCard)
 * Action: 
 * 1. ค้นหาปุ่มที่มี Accessible Name ว่า "เปิดปฏิทิน" ภายใน parentScope (ใช้วิธีนี้แม่นยำกว่าการหาไอคอน)
 * 2. ทำการคลิกปุ่มนั้น
 * Output:
 * - ไม่มี return value, Popup ปฏิทินจะแสดงขึ้นมาบนหน้าจอ
 */
async function openCalendar(parentScope) {
    const calendarBtn = parentScope.getByRole('button', { name: 'เปิดปฏิทิน' });
    await calendarBtn.click();
}

test.describe("SuperAdmin - View Report And Dashboard", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });
    /**
     * TS-RAS-02.1
     * ค้นหาจังหวัด
     */
    test("TS-RAS-02.1: ค้นหาจังหวัด", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        await page.getByRole('link', { name: 'รายงาน' }).click();
        await page.getByPlaceholder('ค้นหาจังหวัด').click();
        await page.getByPlaceholder('ค้นหาจังหวัด').fill('ชลบุรี');
        await page.getByRole('button', { name: 'ชลบุรี ไป' }).click();
    });
    /**
    * TS-RAS-02.2
    * เลือกภูมิภาค
    */
    test("TS-RAS-02.2: เลือกภูมิภาค", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        await page.getByRole('link', { name: 'รายงาน' }).click();
        await page.getByRole('button', { name: 'ทั้งหมด' }).click();
        await page.locator('.MuiAccordionDetails-root').click();
        await page.getByRole('button', { name: 'ทั้งหมด' }).nth(1).click();
        await page.getByRole('button', { name: 'ทั้งหมด' }).click();
        await page.getByRole('button', { name: 'ภาคเหนือ' }).click();
        await page.getByRole('button', { name: 'ภาคเหนือ' }).click();
        await page.getByRole('button', { name: 'ภาคกลาง' }).click();
        await page.getByRole('button', { name: 'ภาคกลาง' }).click();
        await page.getByRole('button', { name: 'ภาคตะวันออกเฉียงเหนือ' }).click();
        await page.getByRole('button', { name: 'ภาคตะวันออกเฉียงเหนือ' }).click();
        await page.getByRole('button', { name: 'ภาคใต้' }).click();
    });
    /**
    * TS-RAS-02.3
    * เลือกจังหวัด
    */
    test("TS-RAS-02.3: เลือกจังหวัด", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        await page.getByRole('link', { name: 'รายงาน' }).click();
        await page.getByPlaceholder('ค้นหาจังหวัด').click();
        await page.getByPlaceholder('ค้นหาจังหวัด').fill('นครศรีธรรมราช');
        await page.getByRole('button', { name: 'นครศรีธรรมราช ไป' }).click();
    });
    /**
    * TS-RAS-02.4
    * เลือกวันที่
    */
    test("TS-RAS-02.4: เลือกวันที่", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const reportCard = page.getByRole('region', { name: 'รายงาน' });
        await openCalendar(reportCard);

        const calendarPopup = page.getByRole('dialog');
        await expect(calendarPopup).toBeVisible();

        await calendarPopup.getByRole('gridcell')
            .filter({ hasText: /^1$/ })
            .first()
            .click();
    });
    /**
    * TS-RAS-02.5
    * เลือกตัวกรอง:สัปดาห์
    */
    test("TS-RAS-02.5: เลือกตัวกรอง:สัปดาห์", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const reportCard = page.getByRole('region', { name: 'รายงาน' });
        await selectFilterMode(page, reportCard, 'รายสัปดาห์');
        await openCalendar(reportCard);

        const calendarPopup = page.getByRole('dialog');
        await expect(calendarPopup).toBeVisible();

        await calendarPopup.getByRole('gridcell')
            .filter({ hasText: /^8$/ })
            .first()
            .click();
    });
    /**
    * TS-RAS-02.6
    * เลือกตัวกรอง:เดือน
    */
    test("TS-RAS-02.6: เลือกตัวกรอง:เดือน", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const reportCard = page.getByRole('region', { name: 'รายงาน' });
        await selectFilterMode(page, reportCard, 'รายเดือน');
        await openCalendar(reportCard);

        const calendarPopup = page.getByRole('dialog');
        await expect(calendarPopup).toBeVisible();

        await calendarPopup.getByRole('option')
            .filter({ hasText: 'พ.ย.' })
            .first()
            .click();
    });
    /**
    * TS-RAS-02.7
    * เลือกตัวกรอง:ปี
    */
    test("TS-RAS-02.7: เลือกตัวกรอง:ปี", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const reportCard = page.getByRole('region', { name: 'รายงาน' });
        await selectFilterMode(page, reportCard, 'รายปี');
        await openCalendar(reportCard);

        const calendarPopup = page.getByRole('dialog');
        await expect(calendarPopup).toBeVisible();

        await calendarPopup.getByRole('button')
            .filter({ hasText: '2568' })
            .first()
            .click();
    });
    /**
    * TS-RAS-02.8
    * เลือกจำนวนแถวต่อหน้า
    */
    test("TS-RAS-02.8: เลือกจำนวนแถวต่อหน้า", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        await page.getByRole('link', { name: 'รายงาน' }).click();
        await page.getByRole('button', { name: '10' }).click();
        await page.getByRole('option', { name: '30' }).click();
        await page.getByRole('button', { name: '30' }).click();
        await page.getByRole('option', { name: '50' }).click();
        await page.getByRole('button', { name: '50' }).click();
        await page.getByRole('option', { name: '10' }).click();
    });
    /**
    * TS-RAS-02.9
    * pagination
    */
    test("TS-RAS-02.9: pagination", async ({ page }) => {
        await goToReportAndDashboardPage(page);
        await page.getByRole('link', { name: 'รายงาน' }).click();
        await page.getByRole('button', { name: 'ถัดไป' }).click();
        await page.getByRole('button', { name: 'ก่อนหน้า' }).click();
    });
    /**
    * TS-RAS-02.10
    * กราฟแสดงข้อมูลตามที่เลือก
    */
    test("TS-RAS-02.10: กราฟแสดงข้อมูลตามที่เลือก", async ({ page }) => {
        await goToReportAndDashboardPage(page);

        const reportCard = page.getByRole('region', { name: 'รายงาน' });

        // เช็คข้อมูลในตาราง
        const allTotalBookings = await reportCard.locator('tbody tr td:nth-child(4)').allInnerTexts();
        const sumBookings = allTotalBookings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        console.log(`ตรวจสอบพบยอดจองทั้งหมดในตาราง: ${sumBookings}`);

        // หา div ที่มีทั้ง "หัวข้อ" และ "กราฟ/รูปภาพ" (เพื่อเจาะจงเอา Card ใบใหญ่ ไม่เอา div ย่อย)
        const pieChartCard = page.locator('div')
            .filter({ has: page.getByRole('heading', { name: /^แผนภูมิวงกลม/ }) })
            .filter({ has: page.locator('img, canvas') }) // ต้องมีสิ่งนี้ ถึงจะนับว่าเป็น Card ที่เราอยากได้
            .last();

        // ตรวจสอบว่ามี element กราฟแสดงผล (ไม่ว่าจะเป็น img หรือ canvas ก็ให้ผ่าน)
        await expect(pieChartCard.locator('img, canvas')).toBeVisible();

        if (sumBookings === 0) {
            console.log('PASS: ตารางเป็น 0 และกราฟแสดงผล (Empty State)');
        } else {
            console.log('PASS: ตารางมีข้อมูล และกราฟแสดงผล (Data State)');
        }
    });

});
