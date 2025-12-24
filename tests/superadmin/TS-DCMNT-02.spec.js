import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

const nameTestFile = "วิสาหกิจชุมชนกลุ่มผลิตผ้าย้อมครามบ้านคำข่า";
test.describe("SuperAdmin - Manage Community", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });

    /*
    * TS-DCMNT-02.1: คลิกปุ่มไอคอน (Icon Button) ถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)
    */
    test("TS-DCMNT-02.1: คลิกปุ่มไอคอน (Icon Button) ถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)", async ({ page }) => {
        await openModalDeleteCommunity(page);
    });

    /*
    * TS-DCMNT-02.2: คลิกปุ่ม (Button) ยืนยัน ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะถูกลบ
    */
    test("TS-DCMNT-02.2: คลิกปุ่ม (Button) ยืนยัน ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะถูกลบ", async ({ page }) => {
        await confirmDeleteCommunity(page);
    });

    /*
    * TS-DCMNT-02.3: คลิกปุ่ม (Button) ยกเลิก ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะไม่ถูกลบ
    */
    test("TS-DCMNT-02.3: คลิกปุ่ม (Button) ยกเลิก ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะไม่ถูกลบ", async ({ page }) => {
        await cancelDeleteCommunity(page);
    });


    async function openModalDeleteCommunity(page) {
        await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
        await expect(page).toHaveURL(/super\/communities\/all/);
        await page.getByRole('row', { name: nameTestFile }).getByLabel('ลบ').click();
    }

    async function confirmDeleteCommunity(page) {
        await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
        await expect(page).toHaveURL(/super\/communities\/all/);
        await page.getByRole('row', { name: nameTestFile }).getByLabel('ลบ').click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
    }

    async function cancelDeleteCommunity(page) {
        await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
        await expect(page).toHaveURL(/super\/communities\/all/);
        await page.getByRole('row', { name: nameTestFile }).getByLabel('ลบ').click();
        await page.getByRole('button', { name: 'ยกเลิก' }).click();
    }

});