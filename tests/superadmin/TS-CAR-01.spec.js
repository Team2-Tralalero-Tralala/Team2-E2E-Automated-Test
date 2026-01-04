import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToAccountDetail
 * คลิกชื่อสมาชิกในตาราง แล้วไปหน้ารายละเอียดสมาชิก
 */
async function goToAccountDetail(page, fullName) {

  const manageAccountMenu = page.getByRole("link", { name: "จัดการบัญชี" });
  await manageAccountMenu.click();

  const memberLink = page.getByRole("link", { name: fullName });
  await memberLink.click();
}

test.describe("SuperAdmin - Edit Account Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CA-02.1.1
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */
  test("TC-CAR-01: Click member name navigates to correct member page", async ({
    page,
  }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "แก้ไข" }).click();

    await page.getByLabel("ชื่อ *").fill("จินตนา");
    await page.getByLabel("นามสกุล *").fill("จิรายุ");
    await page.getByLabel("ชื่อผู้ใช้ *").fill("member_admin");
    await page.getByLabel("อีเมล *").fill("member_admin1@example.com");
    await page.getByLabel("โทรศัพท์ *").fill("0812345678");

    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/\/super\/accounts\/all$/);
  });

  /**
   * TC-CA-02.1.1
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */

  test("TC-CAR-02: Cancel edit member", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "แก้ไข" }).click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();

    await expect(page).toHaveURL(/\/super\/account\/\d+$/);
  });

  /**
   * TC-CA-02.1.1
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */
  test("TC-CAR-03: Create account failed - name is required", async ({
    page,
  }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "แก้ไข" }).click();

    const firstNameInput = page.getByRole("textbox", {
      name: "ชื่อ *",
    });

    await firstNameInput.clear();
    await expect(page.getByText("กรุณากรอกชื่อ")).toBeVisible();
  });

  /**
   * TC-CA-04
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */
  test("TC-CAR-04: Cancel edit member", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "ตั้งรหัสผ่าน" }).click();

    await page.getByRole("textbox", { name: "รหัสผ่าน" }).fill("Suauma789");
    await page.getByRole("button", { name: "ยืนยัน" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/\/super\/accounts\/all$/);
  });

  /**
   * TC-CA-01.5
   * อีเมลซ้ำกับในระบบ
   */
  test("TC-CAR-05: Create account failed - duplicate email", async ({
    page,
  }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "แก้ไข" }).click();

    const emailInput = page.getByRole("textbox", {
      name: "อีเมล *",
    });

    await emailInput.clear();
    await page.getByLabel("อีเมล *").fill("member_admin1@example.com");
    await expect(page.getByText("อีเมลนี้ถูกใช้งาน")).toBeVisible();
  });

  /**
   * TC-CA-01.6
   * อีเมลผิดรูปแบบ
   */
  test("TC-CAR-06: Create account failed - duplicate email", async ({
    page,
  }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "แก้ไข" }).click();

    const emailInput = page.getByRole("textbox", {
      name: "อีเมล *",
    });

    await emailInput.clear();
    await page.getByLabel("อีเมล *").fill("member_admin1@abc.com");
    await expect(page.getByText("รูปแบบอีเมลไม่ถูก")).toBeVisible();
  });

  /**
   * TC-CA-04
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */
  test("TC-CAR-07: Cancel edit member", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "ตั้งรหัสผ่าน" }).click();

    await page.getByRole("textbox", { name: "รหัสผ่าน" }).fill("Suau77");
    await expect(page.getByText("รหัสผ่านสั้นกว่าที่กำหนด")).toBeVisible();
  });

  /**
   * TC-CA-04
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */
  test("TC-CAR-05: Cancel edit member", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "ตั้งรหัสผ่าน" }).click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);
  });

  /**
   * TC-CAR-02.1.1
   * เมื่อคลิกชื่อสมาชิก จะไปยังหน้าของสมาชิกที่คลิก
   */
 test("TC-CAR-04: Validation required fields", async ({ page }) => {
   const memberName = "จินตนา จิรายุ";
   await goToAccountDetail(page, memberName);
   await expect(page).toHaveURL(/\/super\/account\/\d+$/);

   await page.getByRole("button", { name: "แก้ไข" }).click();

   await page.getByLabel("ชื่อ *").fill("จินตนา");
   await page.getByLabel("นามสกุล *").fill("จิรายุ");

   await page.getByLabel("ชื่อผู้ใช้ *").clear();
   await page.getByLabel("อีเมล *").clear();
   await page.getByLabel("โทรศัพท์ *").clear();

   await page.getByRole("button", { name: "บันทึก" }).click();

   await expect(page.getByText("กรุณากรอกชื่อผู้ใช้")).toBeVisible();
   await expect(page.getByText("กรุณากรอกอีเมล")).toBeVisible();
   await expect(page.getByText("กรุณากรอกเบอร์โทรศัพท์")).toBeVisible();
  
   await expect(page).toHaveURL(/\/super\/account\/\d+$/);
 });

});
