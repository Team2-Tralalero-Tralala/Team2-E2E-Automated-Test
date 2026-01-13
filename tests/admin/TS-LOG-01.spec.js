import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TS-LOG-01 ตรวจสอบประวัติการเข้าใช้งาน", () => {
    test.beforeEach(async({ page }) => {
        await loginAs(page, "admin");
    });

    test.afterEach(async({ page }, testInfo) => {
        const fileName = testInfo.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        await page.screenshot({
            path: `screenshots/${fileName}.png`,
            fullPage: true,
        });
    });

    async function goToLogsPage(page) {
        await page.goto("http://dekdee2.informatics.buu.ac.th:4080/admin/logs");
        await expect(
            page.getByRole("heading", { name: "ประวัติการเข้าใช้งาน" })
        ).toBeVisible();
    }

    /**
     * TS-LOG-01.1: ทดสอบการเข้าถึงหน้า “ประวัติการใช้งาน” และตรวจสอบการแสดงข้อมูล
     */
    test("TS-LOG-01.1: ตรวจสอบการแสดงข้อมูลตาราง Log", async({ page }) => {
        await goToLogsPage(page);

        const table = page.locator("table");
        await expect(table).toBeVisible();
        await expect(table.locator("th").nth(0)).toHaveText("ชื่อผู้ใช้");
        await expect(table.locator("th").nth(1)).toHaveText("บทบาท");

        const rows = table.locator("tbody tr");
        await expect(rows.first()).toBeVisible();

        const firstRowText = await rows.first().innerText();
        expect(firstRowText).not.toBe("");
        expect(firstRowText).toMatch(/สมาชิก|ผู้ดูแล/);

        console.log("Verified: Log table is displayed with valid data.");
    });

    /**
     * TS-LOG-01.2: ทดสอบการใช้ช่องค้นหาผู้ใช้
     */
    test("TS-LOG-01.2: ค้นหาประวัติการใช้งาน", async({ page }) => {
        await goToLogsPage(page);

        const rows = page.locator("tbody tr");
        await expect(rows.first()).toBeVisible();

        const firstUserName = await rows.first().locator("td").nth(0).innerText();
        console.log(`Selected keyword for search test: "${firstUserName}"`);

        const searchInput = page.getByPlaceholder("ค้นหา");
        await expect(searchInput).toBeVisible();

        await searchInput.fill(firstUserName);
        await searchInput.press("Enter");

        await expect(rows.first()).toContainText(firstUserName);

        const count = await rows.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const rowText = await rows.nth(i).innerText();
            if (rowText.trim().length > 0) {
                await expect(rows.nth(i)).toContainText(firstUserName);
            }
        }

        console.log(
            `Verified: Search function filters logs for '${firstUserName}' correctly.`
        );
    });

    /**
     * TS-LOG-01.3: ผู้ใช้ทั่วไปต้องเข้าถึงไม่ได้ (Access Control)
     * เปิด Context ใหม่ และ Login ผ่านหน้า /guest/partner/login
     */
    test("TS-LOG-01.3: ผู้ใช้ทั่วไปต้องเข้าถึงไม่ได้ (Access Control)", async({
        browser,
    }) => {
        const memberContext = await browser.newContext();
        const memberPage = await memberContext.newPage();

        await memberPage.goto(
            "http://dekdee2.informatics.buu.ac.th:4080/guest/partner/login"
        );

        const usernameInput = memberPage.locator("#username");
        const passwordInput = memberPage.locator("#password");

        await expect(usernameInput).toBeVisible();
        await usernameInput.fill("member_1");
        await passwordInput.fill("hashedpw");

        await memberPage.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

        await memberPage.waitForLoadState("networkidle");

        await memberPage.goto(
            "http://dekdee2.informatics.buu.ac.th:4080/admin/logs"
        );

        const logsHeading = memberPage.getByRole("heading", {
            name: "ประวัติการเข้าใช้งาน",
        });
        await expect(logsHeading).not.toBeVisible();

        console.log(
            "Verified: Member 'member_1' cannot see the Admin Logs page on a fresh session."
        );

        await memberContext.close();
    });
});