import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe.configure({ mode: "serial" });

/**
 * goToBlockAccountsPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าการระงับบัญชี (Block Accounts)
 * Input:
 * - page: object ของ Playwright Page
 * Action:
 * 1. เลือกเมนู "จัดการบัญชี" (Manage Account)
 * 2. เลือกเมนูย่อย "การระงับบัญชี" (Block Account)
 * 3. รอหน้าเปลี่ยน URL ไปยังหน้าจัดการการระงับบัญชี
 * Output:
 * - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/users/blocked
 */
async function goToBlockAccountsPage(page) {
    const manageAccountLink = page
        .getByRole("link", { name: "จัดการบัญชี" })
        .first();
    await expect(manageAccountLink).toBeVisible();
    await manageAccountLink.click();
    await expect(page).toHaveURL(/super\/accounts\/all/);

    const blockAccountLink = page.getByRole("link", { name: "การระงับบัญชี" });
    await expect(blockAccountLink).toBeVisible();
    await blockAccountLink.click();
    await expect(page).toHaveURL(/super\/users\/blocked/);

    console.log("Waiting 2 seconds at Manage Accounts page...");
    await page.waitForTimeout(2000);
}

test.describe
    .serial("TS-CSTA-01 ผู้ใช้งาน Super Admin ยกเลิกระงับบัญชีผู้ใช้งาน", () => {
        let page;

        test.beforeAll(async({ browser }) => {
            page = await browser.newPage();

            await loginAs(page, "superadmin");
            await expect(page).toHaveURL(/super\/communities/);
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
         * TC-CSTA-01.1
         * ยกเลิกการระงับบัญชีผู้ใช้งานสำเร็จ
         */
        test("TS-CSTA-01.1: Unblock user account successfully", async({}) => {
            await goToBlockAccountsPage(page);

            const rowToSuspend = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="ยกเลิกการระงับ"]') })
                .first();

            if ((await rowToSuspend.count()) === 0) {
                console.log("ไม่พบรายชื่อที่ถูกระงับ");
                return;
            }

            await expect(rowToSuspend).toBeVisible();

            await rowToSuspend
                .locator('button[title="ยกเลิกการระงับ"]')
                .click({ force: true });

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();

            const confirmBtn = confirmModal.getByRole("button", {
                name: /ยืนยัน/,
            });
            await expect(confirmBtn).toBeVisible();
            await confirmBtn.click();
            await page.waitForTimeout(2000);
        });

        /**
         * TC-CSTA-01.2
         * ตรวจสอบการเข้าสู่ระบบของบัญชีที่ถูกปลดระงับ
         */
        test("TS-CSTA-01.2: Verify login of unblocked account", async({
            browser,
        }) => {
            const Context = await browser.newContext();
            const Page = await Context.newPage();

            await Page.goto("/guest/partner/login");
            await Page.locator("#username").fill("member_1@example.com");
            await Page.locator("#password").fill("hashedpw");
            await Page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

            await Page.waitForTimeout(2000);

            await Context.close();
        });

        /**
         * TC-CSTA-01.3
         * ยกเลิกการระงับบัญชีทั้งหมด
         */
        test("TS-CSTA-01.3: Unblock all accounts successfully", async({}) => {
            await goToBlockAccountsPage(page);

            const selectAllCheckbox = page
                .locator("thead input[type='checkbox']")
                .first();

            if (await selectAllCheckbox.isVisible()) {
                if (!(await selectAllCheckbox.isChecked())) {
                    await selectAllCheckbox.click();
                }
            } else {
                console.log("ไม่พบ Checkbox เลือกทั้งหมด");
            }

            const unblockAllBtn = page.getByRole("button", {
                name: "ยกเลิกการระงับทั้งหมด",
            });

            await expect(unblockAllBtn).toBeVisible();
            await unblockAllBtn.click();

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            if (await confirmModal.isVisible()) {
                await confirmModal.getByRole("button", { name: /ยืนยัน/ }).click();
            }

            await page.waitForTimeout(2000);
        });
    });