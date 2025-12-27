import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe.configure({ mode: "serial" });

/**
 * goToStorePage - ฟังก์ชันนำผู้ใช้งานไปยังหน้ารายการร้านค้า (Store Management)
 * Input:
 * - page: object ของ Playwright Page
 * Action:
 * 1. เลือกเมนู "จัดการชุมชน" (Manage Community)
 * 2. เลือกชุมชนแรกจากรายการ
 * 3. คลิกที่เมนู "ร้านค้า" (Store Accordion)
 * 4. คลิกปุ่ม "จัดการ" (Manage)
 * 5. รอจนกว่า URL จะเปลี่ยนเป็นหน้ารายการร้านค้า (/stores/all)
 * Output:
 * - ไม่มี return value, แต่ browser จะ navigate ไปยัง URL /stores/all
 */
async function goToStorePage(page) {
    const manageCommunityLink = page
        .getByRole("link", { name: "จัดการชุมชน" })
        .first();
    await expect(manageCommunityLink).toBeVisible();
    await manageCommunityLink.click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/super\/communities/);

    const communityLink = page.locator('a[href^="/super/community/"]').first();
    await expect(communityLink).toBeVisible();
    await communityLink.click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/super\/community\/\d+/);

    const storeAccordion = page
        .locator("button")
        .filter({ hasText: "ร้านค้า" })
        .first();
    await expect(storeAccordion).toBeVisible();
    await storeAccordion.click();
    await page.waitForTimeout(1000);

    const manageBtn = page.getByRole("button", { name: "จัดการ" }).first();
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();

    await expect(page).toHaveURL(/stores\/all/);

    console.log("Navigated to Store Management Page successfully.");
    await page.waitForTimeout(1000);
}

test.describe
    .serial("TS-DST-01: ผู้ใช้งานบัญชี Super Admin ต้องสามารถคลิกลบร้านค้าได้", () => {
        let page;

        test.beforeAll(async({ browser }) => {
            page = await browser.newPage();
            await loginAs(page, "superadmin");
            await expect(page).toHaveURL(/super/);
            console.log("Login Successful - Starting tests...");
        });

        test.afterAll(async() => {
            await page.close();
        });

        test.afterEach(async({}, testInfo) => {
            const fileName = testInfo.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
            if (page) {
                await page.screenshot({
                    path: `screenshots/${fileName}.png`,
                    fullPage: true,
                });
            }
        });

        /**
         * TC-DST-01.1
         * คลิกปุ่มไอคอน (Icon Button) ถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)
         */
        test("TS-DST-01.1: Click delete icon, modal should appear", async({}) => {
            await goToStorePage(page);
            await page.waitForTimeout(2000);

            await expect(page.getByRole("table")).toBeVisible();
            const rowToSuspend = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="ลบ"]') })
                .first();

            await expect(rowToSuspend).toBeVisible();

            await rowToSuspend.locator('button[title="ลบ"]').click({ force: true });

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();

            await expect(
                confirmModal.getByRole("button", { name: /ยกเลิก/ })
            ).toBeVisible();
            await expect(
                confirmModal.getByRole("button", { name: /ยืนยัน/ })
            ).toBeVisible();
            await page.waitForTimeout(2000);
        });

        /**
         * TC-DST-01.3
         * คลิกปุ่ม (Button) ยกเลิก เพื่อปิด Modal
         */
        test("TS-DST-01.3: Click cancel button", async({}) => {
            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();
            await confirmModal.getByRole("button", { name: "ยกเลิก" }).click();
            await page.waitForTimeout(2000);
        });

        /**
         * TC-DST-01.2
         * คลิกปุ่ม (Button) ยืนยัน เพื่อลบร้านค้า
         */
        test("TS-DST-01.2: Click confirm button to delete", async({}) => {
            await expect(page.getByRole("table")).toBeVisible();
            const rowToSuspend = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="ลบ"]') })
                .first();

            await expect(rowToSuspend).toBeVisible();

            await rowToSuspend.locator('button[title="ลบ"]').click({ force: true });

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();
            await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
            await page.waitForTimeout(2000);
        });
    });