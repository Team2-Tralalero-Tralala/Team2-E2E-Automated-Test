import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToAccountDetail
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้ารายละเอียดสมาชิก
 * Steps:
 * 1. คลิกเมนู "จัดการบัญชี"
 * 2. คลิกชื่อสมาชิก
 * 3. ไปยังหน้า /super/account/:id
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
   * TS-CAR-01.1
   * แก้ไขข้อมูล
   */
  test("TS-CAR-01.1: Edit member successfully", async ({ page }) => {
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
   * TS-CAR-01.2
   * ยกเลิกการแก้ไขข้อมูลสมาชิก
   */
  test("TS-CAR-01.2: Cancel edit member", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "แก้ไข" }).click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();

    await expect(page).toHaveURL(/\/super\/account\/\d+$/);
  });

  /**
   * TS-CAR-01.3
   * ไม่กรอกชื่อ (required field)
   */
  test("TS-CAR-01.3: Validation required first name", async ({ page }) => {
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
   * TS-CAR-01.4
   * ตั้งรหัสผ่านใหม่สำเร็จ
   */
  test("TS-CAR-01.4: Change password successfully", async ({ page }) => {
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
   * TS-CAR-01.5
   * อีเมลซ้ำกับในระบบ
   */
  test("TS-CAR-01.5: Validation duplicate email", async ({ page }) => {
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
   * TS-CAR-01.06
   * อีเมลรูปแบบไม่ถูกต้อง
   */
  test("TS-CAR-01.6: Validation invalid email format", async ({ page }) => {
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
   * TS-CAR-01.07
   * รหัสผ่านสั้นกว่าที่กำหนด
   */
  test("TS-CAR-01.7: Validation password too short", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "ตั้งรหัสผ่าน" }).click();

    await page.getByRole("textbox", { name: "รหัสผ่าน" }).fill("Suau77");
    await expect(page.getByText("รหัสผ่านสั้นกว่าที่กำหนด")).toBeVisible();
  });

  /**
   * TS-CAR-01.8
   * ยกเลิกการตั้งรหัสผ่าน
   */
  test("TS-CAR-01.8: Cancel change password", async ({ page }) => {
    const memberName = "จินตนา จิรายุ";
    await goToAccountDetail(page, memberName);
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);

    await page.getByRole("button", { name: "ตั้งรหัสผ่าน" }).click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(page).toHaveURL(/\/super\/account\/\d+$/);
  });

  /**
   * TS-CAR-01.9
   * กรอกข้อมูลไม่ครบถ้วน
   */
  test("TS-CAR-01.9: Validation required fields on edit member", async ({
    page,
  }) => {
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
