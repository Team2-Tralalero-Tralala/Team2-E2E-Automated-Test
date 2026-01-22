import { test, expect } from "@playwright/test";
import { users } from "../../utils/test-users.js";
import { LoginPage } from "../../pages/auth/LoginPage.js";

test.describe("TS-CP-01 ผู้ใช้งานทั่วไปสามารถเปลี่ยนรหัสผ่าน", () => {
    let currentPassword = users.tourist.password;
    const NEW_PASSWORD_VALID = "Abc@7890";

    /**
     * Pre-condition:
     * 1. เข้าสู่หน้า Login
     * 2. ล็อกอินด้วยบัญชี Tourist
     * 3. ไปที่เมนู Profile -> เปลี่ยนรหัสผ่าน
     * 4. ตรวจสอบว่าอยู่หน้าเปลี่ยนรหัสผ่านจริง
     */
    test.beforeEach(async({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto(users.tourist.loginPath);
        await loginPage.login(users.tourist.email, currentPassword);

        await page.waitForTimeout(2000);

        await page.getByRole("button", { name: "Profile", exact: false }).click();
        await page.getByText("เปลี่ยนรหัสผ่าน").click();

        await expect(
            page.getByRole("heading", { name: "เปลี่ยนรหัสผ่าน" })
        ).toBeVisible();
    });

    /**
     * TC-CP-01.1
     * เปลี่ยนรหัสผ่านสำเร็จ
     */
    test("TS-CP-01.1: เปลี่ยนรหัสผ่านสำเร็จ", async({ page }) => {
        await page.locator("#current-password").fill(currentPassword);
        await page.locator("#new-password").fill(NEW_PASSWORD_VALID);
        await page.locator("#confirm-password").fill(NEW_PASSWORD_VALID);

        await page.getByRole("button", { name: "ยืนยัน" }).click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible()) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        currentPassword = NEW_PASSWORD_VALID;

        await page.waitForTimeout(1000);
    });

    /**
     * TC-CP-01.2
     * รหัสผ่านปัจจุบันไม่ถูกต้อง
     */
    test("TS-CP-01.2: รหัสผ่านปัจจุบันไม่ถูกต้อง", async({ page }) => {
        await page.locator("#current-password").fill("WrongPass1234");
        await page.locator("#new-password").fill("Abc@7890");
        await page.locator("#confirm-password").fill("Abc@7890");

        await page.getByRole("button", { name: "ยืนยัน" }).click();

        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible({ timeout: 3000 })) {
            await confirmPopup.locator(".swal2-confirm").click();
        }

        const errorMsg = page
            .getByText("Invalid current password")
            .or(page.getByText("ข้อมูลไม่ถูกต้อง"));

        const errorBanner = page
            .locator("div.bg-red-50")
            .filter({ hasText: "ไม่ถูกต้อง" });

        await expect(errorMsg.or(errorBanner).first()).toBeVisible();
    });

    /**
     * TC-CP-01.3
     * รหัสผ่านใหม่กับยืนยันไม่ตรงกัน
     */
    test("TS-CP-01.3: รหัสผ่านใหม่กับยืนยันไม่ตรงกัน", async({ page }) => {
        await page.locator("#current-password").fill(currentPassword);
        await page.locator("#new-password").fill("Abc@7891");
        await page.locator("#confirm-password").fill("Abc@7892");

        await page.getByRole("button", { name: "ยืนยัน" }).click();

        const helperText = page.locator("#confirm-password-helper-text");
        await expect(helperText).toBeVisible();
        await expect(helperText).toContainText("ไม่ตรงกัน");
    });

    /**
     * TC-CP-01.4
     * กรอกรหัสผ่านไม่ครบ
     */
    test("TS-CP-01.4: กรอกรหัสผ่านไม่ครบ", async({ page }) => {
        await page.locator("#current-password").fill(currentPassword);
        await page.locator("#new-password").fill("");
        await page.locator("#confirm-password").fill("");

        await page.getByRole("button", { name: "ยืนยัน" }).click();
        const confirmPopup = page.locator(".swal2-popup");
        if (await confirmPopup.isVisible({ timeout: 3000 })) {
            await confirmPopup.locator(".swal2-confirm").click();
        }
        await expect(confirmPopup).toContainText(
            "ข้อมูลไม่ครบหรือรูปแบบรหัสผ่านไม่ถูกต้อง"
        );
        await page.getByRole("button", { name: "ปิด" }).click();
        await expect(confirmPopup).toBeHidden();
    });

    /**
     * TC-CP-01.5
     * รูปแบบรหัสผ่านใหม่ไม่ถูกต้อง (Weak Password)
     */
    test("TS-CP-01.5: รูปแบบรหัสผ่านใหม่ไม่ถูกต้อง", async({ page }) => {
        await page.locator("#current-password").fill(currentPassword);

        await page.locator("#new-password").fill("12345678");
        await page.locator("#confirm-password").fill("12345678");

        await page.getByRole("button", { name: "ยืนยัน" }).click();

        const bannerError = page.locator("div.bg-red-50");

        const passwordRequirementError = page.getByText("รหัสผ่านต้องประกอบด้วย");

        await expect(
            bannerError.or(passwordRequirementError).first()
        ).toBeVisible();
    });

    /**
     * TC-CP-01.6
     * ยกเลิกการเปลี่ยนรหัสผ่าน
     */
    test("TS-CP-01.6: ยกเลิกการเปลี่ยนรหัสผ่าน", async({ page }) => {
        await page.locator("#current-password").fill(currentPassword);
        await page.locator("#new-password").fill(currentPassword);
        await page.locator("#confirm-password").fill(currentPassword);

        await page.getByRole("button", { name: "ยกเลิก" }).click();

        await expect(page).toHaveURL(/.*\/change-password/);
    });
});