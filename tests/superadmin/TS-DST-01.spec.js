import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe.configure({ mode: "serial" });

async function goToManageShopsPage(page) {
    const sidebarLink = page.getByRole("link", { name: "จัดการร้านค้า" });
    await expect(sidebarLink).toBeVisible();
    await sidebarLink.click();

    await expect(page).toHaveURL(/super\/.*(shop|store).*/);

    await page.waitForTimeout(1000);
}

test.describe
    .serial("TS-DST-01 ผู้ใช้งานบัญชี Super Admin สามารถลบร้านค้าได้", () => {
        let page;

        test.beforeAll(async({ browser }) => {
            page = await browser.newPage();
            await loginAs(page, "superadmin");
            console.log("Login Successful - Starting Manage Shops tests...");
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

        test("TS-DST-01.1: คลิกปุ่มไอคอนถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)", async({}) => {
            await goToManageShopsPage(page);

            const rowToDelete = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="ลบ"]') })
                .first();

            if ((await rowToDelete.count()) === 0) {
                console.log("⚠️ ไม่พบร้านค้าในตาราง (ข้ามการทดสอบ)");
                return;
            }

            await rowToDelete.locator('button[title="ลบ"]').click();

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();

            await expect(
                confirmModal.getByRole("button", { name: /ยืนยัน|Confirm/ })
            ).toBeVisible();
            await expect(
                confirmModal.getByRole("button", { name: /ยกเลิก|Cancel/ })
            ).toBeVisible();

            await confirmModal.getByRole("button", { name: /ยกเลิก|Cancel/ }).click();
            await expect(confirmModal).toBeHidden();
            await page.waitForTimeout(500);
        });

        test("TS-DST-01.3: คลิกปุ่ม 'ยกเลิก' ในหน้าต่าง Modal ร้านค้าจะไม่ถูกลบ", async({}) => {
            const rowToDelete = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="ลบ"]') })
                .first();

            const shopName = await rowToDelete.innerText();

            await rowToDelete.locator('button[title="ลบ"]').click();

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();
            await confirmModal.getByRole("button", { name: /ยกเลิก|Cancel/ }).click();

            await expect(confirmModal).toBeHidden();

            const rowCheck = page
                .getByRole("row")
                .filter({ hasText: shopName })
                .first();
            await expect(rowCheck).toBeVisible();
        });

        test("TS-DST-01.2: คลิกปุ่ม 'ยืนยัน' ในหน้าต่าง Modal ร้านค้าจะถูกลบ", async({}) => {
            const rowToDelete = page
                .getByRole("row")
                .filter({ has: page.locator('button[title="ลบ"]') })
                .first();

            if ((await rowToDelete.count()) === 0) {
                test.skip("ไม่มีข้อมูลร้านค้าให้ลบ");
                return;
            }

            const rowText = await rowToDelete.textContent();

            await rowToDelete.locator('button[title="ลบ"]').click();

            const confirmModal = page
                .locator(".modal-content")
                .or(page.getByRole("dialog"));
            await expect(confirmModal).toBeVisible();

            await confirmModal.getByRole("button", { name: /ยืนยัน|Confirm/ }).click();

            await expect(confirmModal).toBeHidden();

            await page.waitForTimeout(1000);

            const deletedRow = page.getByRole("row").filter({ hasText: rowText });

            await expect(deletedRow).toBeHidden();
        });
    });