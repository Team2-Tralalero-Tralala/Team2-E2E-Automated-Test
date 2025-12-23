import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("SuperAdmin - Manage Community", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });

    /*
    * TS-DCMNT-02.1: คลิกปุ่มไอคอน (Icon Button) ถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)
    */
    test("TS-DCMNT-02.1: คลิกปุ่มไอคอน (Icon Button) ถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)", async ({ page }) => {
        await filterAllCommunityManagePage(page);
    });

    /*
    * TS-DCMNT-02.2: คลิกปุ่ม (Button) ยืนยัน ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะถูกลบ
    */
    test("TS-DCMNT-02.2: คลิกปุ่ม (Button) ยืนยัน ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะถูกลบ", async ({ page }) => {
        await filterOpenCommunityManagePage(page);
    });

    /*
    * TS-DCMNT-02.3: คลิกปุ่ม (Button) ยกเลิก ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะไม่ถูกลบ
    */
    test("TS-DCMNT-02.3: คลิกปุ่ม (Button) ยกเลิก ในหน้าต่างแสดงผลซ้อน (Modal) ชุมชนจะไม่ถูกลบ", async ({ page }) => {
        await filterCloseCommunityManagePage(page);
    });


    async function filterAllCommunityManagePage(page) {
    }

    async function filterOpenCommunityManagePage(page) {
    }

    async function filterCloseCommunityManagePage(page) {
    }

});