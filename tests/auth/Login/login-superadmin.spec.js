import { test, expect } from "@playwright/test";
import { loginAs } from "../../../utils/roles.js";

/**
 * TS-Login-01 
 * เข้าสู่ระบบไปยังหน้าหลัก 
 */
test("SuperAdmin login successfully", async ({ page }) => {
  await loginAs(page, "superadmin");
  await expect(page).toHaveURL(/super\/communities/);
});

test.describe("Login validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/guest/partner/login");
  });

  /**
   * TS-Login-02.1
   * เข้าสู่ระบบด้วย Username / Email ถูกต้อง แต่รหัสผ่านผิด
   */
  test("TC-Login-02.1: login with correct email but wrong password", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: /อีเมล/i })
      .fill("superadmin@example.com");
    await page.getByRole("textbox", { name: /รหัสผ่าน/i }).fill("hashedpw1");
    await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
    await expect(page.getByText("รหัสผ่านไม่ถูกต้อง")).toBeVisible();
  });

  /**
   * TS-Login-02.2
   * เข้าสู่ระบบด้วย Username / Email ไม่ถูกต้อง แต่รหัสผ่านถูก
   */
  test("TC-Login-02.2: login with correct password but wrong email", async ({
    page,
  }) => {
    await page
      .getByRole("textbox", { name: /อีเมล/i })
      .fill("superadmin_1@example.com");
    await page.getByRole("textbox", { name: /รหัสผ่าน/i }).fill("hashedpw1");
    await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
    await expect(page.getByText("ไม่พบบัญชีผู้ใช้งาน")).toBeVisible();
  });
 
  /**
   * TC-Login-03.1
   * ผู้ใช้งานไม่กรอก Username / Email และรหัสผ่าน (ปล่อยช่องว่างทั้งหมด)
   */
  test("TC-Login-03.1: empty email and password", async ({ page }) => {
    await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
    await expect(page.getByText("กรุณาป้อนอีเมล")).toBeVisible();
    await expect(page.getByText("กรุณาป้อนรหัสผ่าน")).toBeVisible();
  });

  /**
   * TC-Login-03.2
   * ผู้ใช้งานกรอก Username / Email แต่ไม่กรอกรหัสผ่าน
   */
  test("TC-Login-03.2: email only", async ({ page }) => {
    await page
      .getByRole("textbox", { name: /อีเมล/i })
      .fill("superadmin_1@example.com");
    await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
    await expect(page.getByText("กรุณาป้อนรหัสผ่าน")).toBeVisible();
  });

  /**
   * TC-Login-03.3
   * ผู้ใช้งานกรอกรหัสผ่าน แต่ไม่กรอก Username / Email
   * */
  test("TC-Login-03.3: password only", async ({ page }) => {
    await page.getByRole("textbox", { name: /รหัสผ่าน/i }).fill("hashedpw");
    await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
    await expect(page.getByText("กรุณาป้อนอีเมล")).toBeVisible();
  });
});