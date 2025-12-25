    import { test, expect } from "@playwright/test";
    import { loginAs } from "../../utils/roles.js";

    /**
     * goToManageAccountPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการบัญชี
     * Input:
     *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
     * Action:
     *   1. เลือกเมนู "จัดการบัญชี"
     *   2. รอหน้าเปลี่ยน URL ไปยังหน้าจัดการบัญชี
     * Output:
     *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/accounts/all
     */
    async function goToManageAccountPage(page) {
        const manageAccountBtn = page.getByRole("link", { name: "จัดการบัญชี" });
        await expect(manageAccountBtn).toBeVisible();
        await manageAccountBtn.click();

        await expect(page).toHaveURL(/super\/accounts\/all/);
    }

    /**
     * filterAccountByType - ฟังก์ชันเลือกตัวกรองประเภทบัญชี
     * Input:
     *   - page: object ของ Playwright Page
     *   - typeName: string ชื่อประเภทบัญชีที่ต้องการกรอง
     * Action:
     *   1. คลิกปุ่มตัวกรอง "ทั้งหมด"
     *   2. เลือกประเภทบัญชีตามที่ระบุ
     *   3. ตรวจสอบว่าปุ่มตัวกรองเปลี่ยนค่า
     * Output:
     *   - ตารางแสดงข้อมูลตามประเภทที่เลือก
     */
    async function filterAccountByType(page, typeName) {
        const filterDropdownBtn = page.getByRole("button", { name: "ทั้งหมด" });
        await expect(filterDropdownBtn).toBeVisible();
        await filterDropdownBtn.click();

        const filterTypeBtn = page.getByRole("button", { name: typeName });
        await expect(filterTypeBtn).toBeVisible();
        await filterTypeBtn.click();

        await expect(
            page.getByRole("button", { name: typeName })
        ).toBeVisible();

    }

    /**
     * clickDeleteIcon
     * Input:
     *   - page: Playwright Page
     * Action:
     *   1. เลือกแถวแรกของตารางบัญชี
     *   2. คลิกปุ่มไอคอน "ถังขยะ"
     * Output:
     *   - Modal ยืนยันการลบแสดงขึ้น
     */
    async function clickDeleteIcon(page) {
        const firstRow = page
            .getByRole("table")
            .getByRole("rowgroup")
            .nth(1)
            .getByRole("row")
            .first();

        const deleteBtn = firstRow.getByRole("button", { name: /ลบ|delete/i });
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();
    }

    test.describe("SuperAdmin - Filter Account", () => {
        test.beforeEach(async ({ page }) => {
            await loginAs(page, "superadmin");
            await expect(page).toHaveURL(/super\/communities/);
        });

        /**
         * TS-DLAC-01.1
         * กรองรายการบัญชีด้วยประเภท "ผู้ดูแลชุมชน"
         */
        test("TS-DLAC-01.1: filter account list by admin type", async ({
            page,
        }) => {
            await goToManageAccountPage(page);

            await filterAccountByType(page, "ผู้ดูแลชุมชน");

            await expect(
                page.getByRole("cell", { name: "ผู้ดูแลชุมชน" }).first()
            ).toBeVisible();

            await expect(
                page.getByRole("cell", { name: "สมาชิก" })
            ).toHaveCount(0);

            await expect(
                page.getByRole("cell", { name: "ผู้ใช้งานทั่วไป" })
            ).toHaveCount(0);

        });

        /**
         * TS-DLAC-01.2
         * กรองรายการบัญชีด้วยประเภท "สมาชิก"
         */
        test("TS-DLAC-01.2: filter account list by member type", async ({
            page,
        }) => {
            await goToManageAccountPage(page);

            await filterAccountByType(page, "สมาชิก");

            await expect(
                page.getByRole("cell", { name: "สมาชิก" }).first()
            ).toBeVisible();

            await expect(
                page.getByRole("cell", { name: "ผู้ดูแลชุมชน" })
            ).toHaveCount(0);

            await expect(
                page.getByRole("cell", { name: "ผู้ใช้งานทั่วไป" })
            ).toHaveCount(0);

        });

        /**
         * TS-DLAC-01.3
         * กรองรายการบัญชีด้วยประเภท "ผู้ใช้งานทั่วไป"
         */
        test("TS-DLAC-01.3: filter account list by general user type", async ({
            page,
        }) => {
            await goToManageAccountPage(page);

            await filterAccountByType(page, "ผู้ใช้งานทั่วไป");

            await expect(
                page.getByRole("cell", { name: "ผู้ใช้งานทั่วไป" }).first()
            ).toBeVisible();

            await expect(
                page.getByRole("cell", { name: "ผู้ดูแลชุมชน" })
            ).toHaveCount(0);

            await expect(
                page.getByRole("cell", { name: "สมาชิก" })
            ).toHaveCount(0);

        });

        /**
         * TS-DLAC-01.4
         * ตรวจสอบการแสดง Modal ยืนยันก่อนลบบัญชี
         */
        test("TS-DLAC-01.4: display confirm delete modal", async ({ page }) => {
            await goToManageAccountPage(page);
            await clickDeleteIcon(page);

            const modal = page.getByRole("dialog");

            await expect(
                modal.getByRole("heading", { name: "ยืนยันการลบบัญชี" })
            ).toBeVisible();

            await expect(
                modal.getByRole("button", { name: "ยืนยัน" })
            ).toBeVisible();

            await expect(
                modal.getByRole("button", { name: "ยกเลิก" })
            ).toBeVisible();

        });

        /**
         * TS-DLAC-01.5
         * ลบบัญชีผู้ใช้งานสำเร็จ
         */
        test("TS-DLAC-01.5: delete account successfully", async ({ page }) => {
            await goToManageAccountPage(page);

            const emailCell = page
                .getByRole("table")
                .getByRole("rowgroup")
                .nth(1)
                .getByRole("row")
                .first()
                .getByRole("cell")
                .nth(4);

            const email = await emailCell.textContent();

            expect(email).not.toBeNull();

            await clickDeleteIcon(page);

            const confirmBtn = page
                .getByRole("dialog")
                .getByRole("button", { name: /ยืนยัน/i });

            await expect(confirmBtn).toBeEnabled();
            await confirmBtn.click();

            await expect(
                page.getByRole("cell", { name: email })
            ).toHaveCount(0);

        });

        /**
         * TS-DLAC-01.6
         * ยกเลิกการลบบัญชี (Cancel Delete)
         */
        test("TS-DLAC-01.6: cancel delete account", async ({ page }) => {
            await goToManageAccountPage(page);

            const emailCell = page
                .getByRole("table")
                .getByRole("rowgroup")
                .nth(1)
                .getByRole("row")
                .first()
                .getByRole("cell")
                .nth(4);

            const email = await emailCell.textContent();

            expect(email).not.toBeNull();

            await clickDeleteIcon(page);

            const confirmBtn = page
                .getByRole("dialog")
                .getByRole("button", { name: /ยกเลิก/i });

            await expect(confirmBtn).toBeEnabled();
            await confirmBtn.click();

            await expect(
                page.getByRole("cell", { name: email })
            ).toHaveCount(0);

        });
    });


