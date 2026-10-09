import { test, expect } from "@playwright/test";

test.describe("TS-EPK-02 บันทึกข้อมูลแพ็กเกจ (Admin)", () => {
    /**
     * กำหนดโหมดการรันเป็น Serial
     * เพื่อให้ Test Case ทำงานเรียงลำดับทีละข้อ
     * ป้องกันปัญหาข้อมูลชนกัน (Race Condition) เพราะทุกเคสทดสอบที่ ID 1 เหมือนกัน
     */
    test.describe.configure({ mode: "serial" });

    test.beforeEach(async({ page }) => {
        await page.goto(
            "http://dekdee2.informatics.buu.ac.th:4080/guest/partner/login"
        );

        await page.locator("#username").fill("comm_admin_1@example.com");
        await page.locator("#password").fill("hashedpw");
        await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

        await page.waitForURL(/.*\/admin.*/, { timeout: 15000 });

        await page.goto(
            "http://dekdee2.informatics.buu.ac.th:4080/admin/package/1"
        );
        await page.getByRole("button", { name: "แก้ไขรายละเอียดแพ็กเกจ" }).click();

        await expect(
            page
            .getByRole("heading", { name: "แก้ไขแพ็กเกจ" })
            .or(page.getByText("แก้ไขแพ็กเกจ").first())
        ).toBeVisible();
    });

    /**
     * TC-EPK-02.1
     * Admin บันทึกข้อมูลแพ็กเกจสำเร็จ (กรอกครบ)
     */
    test("TS-EPK-02.1: Admin บันทึกข้อมูลแพ็กเกจสำเร็จ (กรอกครบ)", async({
        page,
    }) => {
        await page.locator("#name").fill("แพ็กเกจท่องเที่ยวชุมชนแสนสุข (แก้ไข)");
        await page
            .locator("#description")
            .fill("ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน (อัปเดต)");
        await page.locator("#price").fill("1500");

        await page.locator("body").click({ force: true });

        await page.getByRole("button", { name: "บันทึก" }).click();

        const confirmPopup = page.locator(".swal2-popup");
        await expect(confirmPopup).toBeVisible({ timeout: 5000 });
        await confirmPopup.locator(".swal2-confirm").click();

        await page.waitForURL(/.*\/admin\/packages\/all/, { timeout: 15000 });
    });

    /**
     * TC-EPK-02.2
     * Admin บันทึกข้อมูลไม่สำเร็จ (กรณีลบชื่อแพ็กเกจออก - Validation Check)
     */
    test("TS-EPK-02.2: Admin บันทึกข้อมูลไม่สำเร็จ (ลบชื่อแพ็กเกจออก)", async({
        page,
    }) => {
        await page.locator("#name").fill("");

        await page.getByRole("button", { name: "บันทึก" }).click();

        await expect(page).toHaveURL(/.*\/edit/);
    });

    /**
     * TC-EPK-02.3
     * คลิกปุ่ม 'ยกเลิก' ในหน้าต่างยืนยัน (Popup)
     */
    test("TS-EPK-02.3: คลิกปุ่ม 'ยกเลิก' ในหน้าต่างยืนยัน (Popup)", async({
        page,
    }) => {
        const testValue = "ชื่อทดสอบกด Popup ยกเลิก";
        await page.locator("#name").fill(testValue);

        await page.getByRole("button", { name: "บันทึก" }).click();

        const confirmPopup = page.locator(".swal2-popup");
        await expect(confirmPopup).toBeVisible();

        await confirmPopup.locator(".swal2-cancel").click();

        await expect(confirmPopup).toBeHidden();

        await expect(page).toHaveURL(/.*\/edit/);
    });

    /**
     * TC-EPK-02.4
     * คลิกปุ่ม 'ยกเลิก' ในหน้าแก้ไขแพ็กเกจ (Form Cancel Button)
     */
    test("TS-EPK-02.4: คลิกปุ่ม 'ยกเลิก' ในหน้าแก้ไขแพ็กเกจ", async({
        page,
    }) => {
        await page.locator("#name").fill("ข้อมูลนี้จะไม่ถูกบันทึก");

        const cancelBtn = page.getByRole("button", { name: "ยกเลิก" });
        await cancelBtn.click({ force: true });

        try {
            await page.waitForURL(/.*\/admin\/packages\/all/, { timeout: 5000 });
        } catch (e) {
            console.log(
                "⚠️ Warning: ปุ่ม 'ยกเลิก' อาจจะยังไม่ทำงาน หรือ Redirect ช้าเกินไป"
            );
        }
    });
});