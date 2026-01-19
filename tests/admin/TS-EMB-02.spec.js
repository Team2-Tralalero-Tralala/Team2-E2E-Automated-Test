import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToEditMemberPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าแก้ไขข้อมูลสมาชิก
 * Input:
 *   - page: object ของ Playwright Page
 * Action:
 *   1. เข้าไปหน้าจัดการสมาชิก
 *   2. เลือกสมาชิกแรกในคอลัมน์ชื่อบัญชี
 *   3. คลิกปุ่มข้อความ "แก้ไข"
 *   4. รอเปลี่ยนหน้าไปยังหน้าแก้ไขสมาชิก
 */
async function goToEditMemberPage(page) {
    const manageMemberMenu = page.getByRole("link", { name: "จัดการสมาชิก" });
    await expect(manageMemberMenu).toBeVisible();
    await manageMemberMenu.click();

    const firstMemberName = page
        .getByRole("row")
        .nth(1)
        .getByRole("cell")
        .nth(1);
    await expect(firstMemberName).toBeVisible();
    await firstMemberName.click();

    const editTextBtn = page.getByRole("button", { name: "แก้ไข" });
    await expect(editTextBtn).toBeVisible();
    await editTextBtn.click();

    await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit/);
}

test.describe("Admin - Edit Member", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "admin");
        await expect(page).toHaveURL(/admin\/community\/\own/);
    });

    /**
     * TS-EMB-02.1
     * แก้ไขข้อมูลสมาชิกสำเร็จ
     */
    test("TS-EMB-02.1: edit member successfully", async ({ page }) => {
        await goToEditMemberPage(page);

        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        const confirmBtn = page.getByRole("button", { name: "ยืนยัน" });
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        await expect(page).toHaveURL(/\/admin\/member\/\d+$/);
        await expect(page.getByText("แดง ชาติ")).toBeVisible();
        await expect(page.getByText("ddd@gmail.com")).toBeVisible();
        await expect(page.getByText("098-765-4321")).toBeVisible();
    });
    /**
     * TS-EMB-02.2
     * ไม่กรอกชื่อ
     */
    test("TS-EMB-02.2: edit member without first name", async ({ page }) => {
        await goToEditMemberPage(page);

        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        await expect(page.getByText("กรุณากรอกชื่อ")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
    /**
     * TS-EMB-02.3
     * ไม่กรอกนามสกุล
     */
    test("TS-EMB-02.3: edit member without last name", async ({ page }) => {
        await goToEditMemberPage(page);

        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        await expect(page.getByText("กรุณากรอกนามสกุล")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
    /**
     * TS-EMB-02.4
     * ไม่กรอกขื่อผู้ใช้
     */
    test("TS-EMB-02.4: edit member without username", async ({ page }) => {
        await goToEditMemberPage(page);

        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        await expect(page.getByText("กรุณากรอกชื่อผู้ใช้")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
    /**
     * TS-EMB-02.5
     * ไม่กรอกอีเมล
     */
    test("TS-EMB-02.5: edit member with invalid email", async ({ page }) => {
        await goToEditMemberPage(page);

        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        await expect(page.getByText("กรุณากรอกอีเมล")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
    /**
     * TS-EMB-02.6
     * ไม่กรอกเบอร์โทรศัพท์
     */
    test("TS-EMB-02.6: edit member without phone number", async ({ page }) => {
        await goToEditMemberPage(page);
        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        await expect(page.getByText("กรุณากรอกเบอร์โทรศัพท์")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
    /**
     * TS-EMB-02.7
     * กรอกเบอร์โทรศัพท์เป็นตัวอักษร
     */
    test("TS-EMB-02.7: edit member with phone number as text", async ({ page }) => {
        await goToEditMemberPage(page);
        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("123ฟกฟกฟก");
        await page.getByLabel("บทบาทในชุมชน").fill("มัคคุเทศก์");

        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();

        await expect(page.getByText("กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
    /**
     * TS-EMB-02.8
     * ไม่กรอกบทบาทในชุมชน
     */
    test("TS-EMB-02.8: edit member without community role", async ({ page }) => {
        await goToEditMemberPage(page);
        await page.getByLabel("ชื่อ (ไม่ต้องใส่คำนำหน้า)").fill("แดง");
        await page.getByLabel("นามสกุล").fill("ชาติ");
        await page.getByLabel("ชื่อผู้ใช้").fill("แดง");
        await page.getByLabel("อีเมล").fill("ddd@gmail.com");
        await page.getByLabel("โทรศัพท์").fill("0987654321");
        await page.getByLabel("บทบาทในชุมชน").fill("");
        const saveBtn = page.getByRole("button", { name: "บันทึก" });
        await expect(saveBtn).toBeEnabled();
        await saveBtn.click();
        await expect(page.getByText("กรุณากรอกบทบาทในชุมชน")).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/member\/\d+\/edit$/);
    });
});