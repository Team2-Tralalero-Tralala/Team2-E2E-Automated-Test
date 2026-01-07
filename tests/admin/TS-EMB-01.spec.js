import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("TS-EMB-01 แก้ไขข้อมูลสมาชิก", () => {
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

    /**
     * goToManageMembersPage
     * ไปที่หน้าจัดการสมาชิก
     */
    async function goToManageMembersPage(page) {
        await page.goto("http://dekdee2.informatics.buu.ac.th:4080/admin/members");
        await expect(page.locator("tbody tr").first()).toBeVisible();
    }

    /**
     * clickEditButtonFirstMember
     * คลิกปุ่มแก้ไขของสมาชิกคนแรกในตาราง
     */
    async function clickEditButtonFirstMember(page) {
        const firstRow = page.locator("tbody tr").first();
        await expect(firstRow).toBeVisible();

        const oldName = await firstRow.locator("td").nth(1).innerText();
        console.log(`กำลังแก้ไขสมาชิกคนแรก: ${oldName}`);

        const editBtn = firstRow.locator('button[title="แก้ไข"]');
        await expect(editBtn).toBeVisible();
        await editBtn.click();
    }

    /**
     * TS-EMB-01.1: แก้ไขข้อมูลสำเร็จ
     */
    test("TS-EMB-01.1: แก้ไขข้อมูลสำเร็จ", async({ page }) => {
        await goToManageMembersPage(page);

        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill("ชาติ");
        await page.locator("#username").fill("แดง");
        await page.locator("#email").fill("ddd@gmail.com");
        await page.locator("#phone").fill("0987654321");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        await expect(confirmPopup).toBeVisible();
        await expect(confirmPopup.locator("#swal2-title")).toHaveText(
            "ยืนยันการบันทึกข้อมูล"
        );
        await confirmPopup.locator(".swal2-confirm").click();

        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/.*admin\/members/);

        const updatedRow = page.getByRole("row", { name: "แดง ชาติ" });
        await expect(updatedRow).toBeVisible();
        await expect(updatedRow).toContainText("ddd@gmail.com");

        console.log("Verified: Updated first member to 'แดง ชาติ' successfully.");
    });

    /**
     * TS-EMB-01.2: ไม่กรอกชื่อ
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error
     */
    test("TS-EMB-01.2: ไม่กรอกชื่อ", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("0987654321");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty name.");
    });

    /**
     * TS-EMB-01.3: ไม่กรอกนามสกุล
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error
     */
    test("TS-EMB-01.3: ไม่กรอกนามสกุล", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill("");
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("0987654321");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty last name.");
    });

    /**
     * TS-EMB-01.4: ไม่กรอกชื่อผู้ใช้
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error
     */
    test("TS-EMB-01.4: ไม่กรอกชื่อผู้ใช้", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill("");
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("0987654321");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty username.");
    });

    /**
     * TS-EMB-01.5: ไม่กรอกอีเมล
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error
     */
    test("TS-EMB-01.5: ไม่กรอกอีเมล", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill("");
        await page.locator("#phone").fill("0987654321");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty email.");
    });

    /**
     * TS-EMB-01.6: ไม่กรอกเบอร์โทรศัพท์
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error
     */
    test("TS-EMB-01.6: ไม่กรอกเบอร์โทรศัพท์", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty phone.");
    });

    /**
     * TS-EMB-01.7: กรอกเบอร์โทรศัพท์เป็นตัวอักษร
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error (หรือ Validation Error)
     */
    test("TS-EMB-01.7: กรอกเบอร์โทรศัพท์เป็นตัวอักษร", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("InvalidPhone");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with text phone number.");
    });

    /**
     * TS-EMB-01.8: ไม่กรอกรหัสผ่าน (เมื่อกดเปลี่ยน)
     * คาดหวัง: ระบบไม่บันทึก
     */
    test("TS-EMB-01.8: ไม่กรอกรหัสผ่าน", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        const changePassBtn = page.getByRole("button", { name: "เปลี่ยนรหัสผ่าน" });
        if (await changePassBtn.isVisible()) {
            await changePassBtn.click();
            await expect(page.locator("#password")).toBeVisible();
        }

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("0987654321");
        await page.locator("#password").fill("");
        await page.locator("#confirm_password").fill("");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty password.");
    });

    /**
     * TS-EMB-01.9: ไม่กรอกยืนยันรหัสผ่าน
     * คาดหวัง: ระบบไม่บันทึก
     */
    test("TS-EMB-01.9: ไม่กรอกยืนยันรหัสผ่าน", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        const changePassBtn = page.getByRole("button", { name: "เปลี่ยนรหัสผ่าน" });
        if (await changePassBtn.isVisible()) {
            await changePassBtn.click();
            await expect(page.locator("#password")).toBeVisible();
        }

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("0987654321");
        await page.locator("#password").fill("Admin1879");
        await page.locator("#confirm_password").fill("");
        await page.locator("#communityRole").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty confirm password.");
    });

    /**
     * TS-EMB-01.10: ไม่กรอกบทบาทวิสาหกิจ
     * คาดหวัง: ระบบไม่บันทึกและแสดง Toast Error
     */
    test("TS-EMB-01.10: ไม่กรอกบทบาทวิสาหกิจ", async({ page }) => {
        await goToManageMembersPage(page);
        await clickEditButtonFirstMember(page);

        await expect(
            page.getByText("แก้ไขข้อมูลสมาชิก", { exact: true })
        ).toBeVisible();

        const timestamp = Date.now();

        await page.locator("#fname").fill("แดง");
        await page.locator("#lname").fill(`Chati ${timestamp}`);
        await page.locator("#username").fill(`User${timestamp}`);
        await page.locator("#email").fill(`test${timestamp}@email.com`);
        await page.locator("#phone").fill("0987654321");
        await page.locator("#communityRole").fill("");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const toast = page
            .locator(".Toastify__toast--error")
            .filter({ hasText: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        await expect(toast).toBeVisible();

        await expect(page).toHaveURL(/.*\/edit/);
        console.log("Verified: System blocked saving with empty community role.");
    });
});