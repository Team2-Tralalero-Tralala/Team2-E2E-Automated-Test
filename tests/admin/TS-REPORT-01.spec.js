import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToReportPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้ารายงาน
 * Input:
 *   - page: object ของ Playwright Page
 * Action:
 *   1. เลือกเมนู "รายงาน"
 *   2. รอหน้าเปลี่ยน URL ไปยังหน้ารายงาน
 * Output:
 *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /admin/dashboard
 */
async function goToReportPage(page) {
    const reportMenu = page.getByRole("link", { name: "รายงาน" });
    await expect(reportMenu).toBeVisible();
    await reportMenu.click();

    await expect(page).toHaveURL(/admin\/dashboard/);
}

/**
 * selectMonthlyReportFilter - ฟังก์ชันเลือกตัวกรองช่วงเวลาเป็นรายเดือน
 * Input:
 *   - page: Playwright Page
 * Action:
 *   1. คลิกปุ่มตัวกรองช่วงเวลา (รายสัปดาห์)
 *   2. เลือกตัวเลือก "รายเดือน"
 *   3. ตรวจสอบว่าปุ่มตัวกรองเปลี่ยนค่าเป็นรายเดือน
 * Output:
 *   - หน้ารายงานแสดงข้อมูลตามช่วงเวลารายเดือน
 */
async function selectMonthlyReportFilter(page) {
    const weeklyFilterBtn = page.locator("#calendar-mode-btn-_r_0_");
    await expect(weeklyFilterBtn).toBeVisible();
    await weeklyFilterBtn.click();

    const monthlyOptionBtn = page.getByRole("button", { name: "รายเดือน" });
    await expect(monthlyOptionBtn).toBeVisible();
    await monthlyOptionBtn.click();

    await expect(
        page.getByRole("button", { name: "รายเดือน" })
    ).toBeVisible();
}

/**
 * goToReportPageByDirectURL - ฟังก์ชันเข้าหน้ารายงานผ่าน URL โดยตรง
 * Input:
 *   - page: Playwright Page
 * Action:
 *   1. เข้าหน้ารายงานผ่าน URL /admin/dashboard
 * Output:
 *   - ระบบไม่อนุญาตให้เข้าถึง
 */
async function goToReportPageByDirectURL(page) {
    await page.goto("/admin/dashboard");
}

test.describe("Admin - Report Dashboard", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "admin");
        await expect(page).toHaveURL(/admin\/community\/own/);
    });

    /**
     * TS-REPORT-01.1
     * ตรวจสอบการแสดงหัวข้อและกราฟสถิติรายได้จากการจองแพ็กเกจ
     */
    test("TS-REPORT-01.1: display report sections correctly", async ({
        page,
    }) => {
        await goToReportPage(page);

        await expect(
            page.getByText("สถิติการจองแพ็กเกจ")
        ).toBeVisible();

        await expect(
            page.getByText("รายได้จากการจองแพ็กเกจทั้งหมด")
        ).toBeVisible();

        const chartCanvas = page.locator("canvas").first();
        await expect(chartCanvas).toBeVisible();
    });

    /**
     * TS-REPORT-01.2
     * เปลี่ยนช่วงเวลาการแสดงผลเป็นรายเดือน
     */
    test("TS-REPORT-01.2: switch report filter to monthly", async ({
        page,
    }) => {
        await goToReportPage(page);

        await selectMonthlyReportFilter(page);
    });
});

test.describe("Member - Report Permission", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TS-REPORT-01.3
     * ทดสอบการเข้าถึงหน้ารายงานโดยผู้ใช้ Member
     */
    test("TS-REPORT-01.3: member cannot access report page", async ({
        page,
    }) => {
        await goToReportPageByDirectURL(page);

        await expect(
            page.getByText("ไม่มีสิทธิ์เข้าถึง")
        ).toBeVisible();
    });
});
