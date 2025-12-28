import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
test.describe.configure({ mode: "serial" });


async function goToManageAccountsPage(page) {
    const manageAccountLink = page.getByRole("link", { name: "จัดการบัญชี" });
    await expect(manageAccountLink).toBeVisible();
    await manageAccountLink.click();

    await expect(page).toHaveURL(/super\/accounts\/all/);

    console.log("Waiting 2 seconds at Manage Accounts page...");
    await page.waitForTimeout(2000);
}

async function goToManageMemberPage(page) {
    const manageManageMemberLink = page.getByRole("link", {
        name: "จัดการสมาชิก",
    });
    await expect(manageManageMemberLink).toBeVisible();
    await manageManageMemberLink.click();

    await expect(page).toHaveURL(/admin\/members/);

    console.log("Waiting 2 seconds at Manage Member page...");
    await page.waitForTimeout(2000);
}

async function filterByRoleAdmin(page) {
    const filterBtn = page
        .locator("button")
        .filter({
            hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/,
        })
        .first();

    await expect(filterBtn).toBeVisible();

    await filterBtn.click();

    const adminOption = page.getByRole("button", { name: "ผู้ดูแลชุมชน" });
    await adminOption.click();

    console.log("Waiting 1 seconds after filtering...");
    await page.waitForTimeout(1000);
}

async function filterByRoleMember(page) {
    const filterBtn = page
        .locator("button")
        .filter({ hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/ })
        .first();
    await filterBtn.click();

    const memberOption = page.getByRole("button", { name: "สมาชิก" });
    await memberOption.click();

    await page.waitForTimeout(1000);
}

async function filterByRoleUser(page) {
    const filterBtn = page
        .locator("button")
        .filter({ hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/ })
        .first();
    await filterBtn.click();

    const userOption = page.getByRole("button", { name: "ผู้ใช้งานทั่วไป" });
    await userOption.click();

    await page.waitForTimeout(1000);
}

async function filterByRoleAll(page) {
    const filterBtn = page
        .locator("button")
        .filter({ hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/ })
        .first();

    await filterBtn.click({ force: true });

    const userOption = page.getByRole("button", { name: "ทั้งหมด" }).last();
    await userOption.click();

    await page.waitForTimeout(1000);
}

test.describe
    .serial("TS-STA-01 ผู้ใช้งาน Super Admin สามารถระงับบัญชีผู้ใช้งาน", () => {
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
            const fileName = testInfo.title
                .replace(/[^a-z0-9]/gi, "_")
                .toLowerCase();
            if (page) {
                await page.screenshot({
                    path: `screenshots/${fileName}.png`,
                    fullPage: true,
                });
            }
        });

        test("TS-STA-01.1: กรองบทบาท Admin", async({}) => {
            await goToManageAccountsPage(page);

            await filterByRoleAdmin(page);

            await expect(page.getByRole("table")).toBeVisible();
        });

        test("TS-STA-01.2: กรองบทบาท Member", async({}) => {
            await goToManageAccountsPage(page);

            await filterByRoleMember(page);

            await expect(page.getByRole("table")).toBeVisible();
        });

        test("TS-STA-01.3: กรองบทบาท User", async({}) => {
            await goToManageAccountsPage(page);

            await filterByRoleUser(page);

            await expect(page.getByRole("table")).toBeVisible();
        });

        test("TS-STA-01.8: แสดงปุ่มระงับบัญชีเฉพาะ Super Admin เท่านั้น", async({}) => {
            await filterByRoleAll(page);
            const blockBtn = page
                .locator('button[title="บล็อก"]')
                .first();

            await expect(blockBtn).toBeVisible();
        });

        test("TS-STA-01.5: ยกเลิกการระงับบัญชีก่อนยืนยัน (แสดง Modal)", async({}) => {
            await goToManageAccountsPage(page);
            await filterByRoleAll(page);

            const rowToSuspend = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="บล็อก"]') })
                .first();

            await expect(rowToSuspend).toBeVisible();

            await rowToSuspend.locator('button[title="บล็อก"]').click({ force: true });

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

        test("TS-STA-01.6: ยกเลิกการระงับบัญชีก่อนยืนยัน (กดปุ่มยกเลิกใน Modal)", async({}) => {
            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();
            await confirmModal.getByRole("button", { name: "ยกเลิก" }).click();
            await page.waitForTimeout(2000);
        });

        test("TS-STA-01.4: ระงับบัญชีผู้ใช้งานสำเร็จ", async({}) => {
            await goToManageAccountsPage(page);
            await filterByRoleAll(page);

            const rowToSuspend = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="บล็อก"]') })
                .first();

            await expect(rowToSuspend).toBeVisible();

            await rowToSuspend
                .locator('button[title="บล็อก"]')
                .click({ force: true });

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();
            await page.waitForTimeout(1000);
            await confirmModal
                .getByRole("button", { name: "ยืนยัน" })
                .click();
            await page.waitForTimeout(1000);
        });

    });

test.describe
    .serial("TS-STA-01 ผู้ใช้งาน Admin", () => {
        let page;

        test.beforeAll(async({ browser }) => {
            page = await browser.newPage();

            await loginAs(page, "admin");
            await expect(page).toHaveURL(/admin\/community\/own/);
            console.log("Login Successful - Starting tests...");
        });

        test.afterAll(async() => {
            await page.close();
        });

        test.afterEach(async({}, testInfo) => {
            const fileName = testInfo.title
                .replace(/[^a-z0-9]/gi, "_")
                .toLowerCase();
            if (page) {
                await page.screenshot({
                    path: `screenshots/${fileName}.png`,
                    fullPage: true,
                });
            }
        });

        test("TS-STA-01.10: ผู้ใช้ที่ไม่ถูกระงับควรเข้าสู่ระบบได้ตามปกติ", async({}) => {
            await goToManageMemberPage(page);
            await page.waitForTimeout(1000);
        });


        test("TS-STA-01.7: ผู้ใช้งานที่ไม่ใช่ Super Admin ไม่สามารถเห็นปุ่มระงับบัญชี", async({}) => {
            const blockBtn = page.locator('button[title="บล็อก"]').first();

            await expect(blockBtn).toBeHidden();
            await page.waitForTimeout(1000);
        });

    });

test.describe.serial("TS-STA-01 ผู้ใช้งานเข้าสู่ระบบไม่สำเร็จ", () => {
    let page;

    test.afterEach(async({}, testInfo) => {
        const fileName = testInfo.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        if (page) {
            await page.screenshot({
                path: `screenshots/${fileName}.png`,
                fullPage: true,
            });
            await page.close();
        }
    });

    test("TS-STA-01.9: ผู้ใช้งานเข้าสู่ระบบไม่สำเร็จ", async({
        page: fixturePage,
    }) => {
        page = fixturePage;

        await page.goto("/guest/partner/login");
        await page.locator("#username").fill("admin_1@example.com");
        await page.locator("#password").fill("hashedpw");
        await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

        const errorMsg = page.getByText(/ถูกบล็อก/);
        await expect(errorMsg).toBeVisible();
        await page.waitForTimeout(1000);
    });
});