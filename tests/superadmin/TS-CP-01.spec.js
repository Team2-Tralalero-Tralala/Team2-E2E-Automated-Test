import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToCreateAccount - ฟังก์ชันนำผู้ใช้งานไปยังหน้าสร้างบัญชีผู้ใช้งาน (Create Account)
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action:
 *   1. เลือกเมนู "จัดการบัญชี" (Manage Account)
 *   2. คลิกปุ่ม "เพิ่มบัญชี" (Add Account)
 *   3. รอหน้าเปลี่ยน URL ไปยังหน้าสร้างบัญชี
 * Output:
 *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/account/admin/create
 */
async function goToPageProfile(page) {
  const profileBtn = page.locator("button:has(img)");
  await expect(profileBtn).toBeVisible();
  await profileBtn.click();
  const editProfile = page.getByRole("link", { name: "แก้ไขโปรไฟล์" });
  await expect(editProfile).toBeVisible();
  await editProfile.click();
  await expect(page).toHaveURL(/super\/profile-me/);
}

/**
 * uploadProfileImage - ฟังก์ชันสำหรับอัพโหลดรูปโปรไฟล์
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. กำหนด path ของรูปโปรไฟล์
 *   2. อัพโหลดไฟล์ผ่าน input[type="file"]
 *   3. ตรวจสอบว่า dialog สำหรับรูปภาพแสดงขึ้น
 *   4. กดปุ่ม "ใช้รูปเดิม" เพื่อยืนยันรูป
 * Output:
 *   - ไม่มี return value, แต่ browser จะแสดง dialog และอัพโหลดรูปสำเร็จ
 */
async function uploadProfileImage(page) {
  const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");
  await page.locator('input[type="file"]').setInputFiles(imagePath);

  const imageDialog = page.getByRole("dialog");
  await expect(imageDialog).toBeVisible();

  const useOriginalBtn = imageDialog.getByRole("button", {
    name: "ใช้รูปเดิม",
  });
  await expect(useOriginalBtn).toBeEnabled();
  await useOriginalBtn.click();
}

test.describe("SuperAdmin - Edit Profile", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-CP-01.1
   * แก้ไขข้อมูลส่วนตัวสำเร็จ
   */
  test("TS-CP-01.1 : SuperAdmin edit profile successfully", async ({
    page,
  }) => {
    await goToPageProfile(page);

    await uploadProfileImage(page);
    await page
      .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
      .fill("หัวหน้า");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("วาวา");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ใช้ *" })
      .fill("wawazanoi11");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("superadmin_1@example.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0923098763");

    const saveBtn = page.getByRole("button", { name: "บันทึก" });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

    const successModal = page.getByRole("dialog");
    await expect(successModal).toContainText("แก้ไขข้อมูลส่วนตัวสำเร็จ");

    await successModal.getByRole("button", { name: "ปิด" }).click();

    await expect(page).toHaveURL(/super\/profile-me/);
  });

  /**
   * TS-CP-01.2
   * ยกเลิกการแก้ไขข้อมูลส่วนตัว
   */
  test("TS-CP-01.2 : SuperAdmin cancle edit profile", async ({ page }) => {
    await goToPageProfile(page);
    await uploadProfileImage(page);
    await page
      .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
      .fill("หัวหน้า");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("วาวา");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ใช้ *" })
      .fill("wawazanoi11");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("superadmin_1@example.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0923098763");
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-CP-01.3.1
   * กรอกข้อมูลไม่ครบ (ชื่อว่าง) textbox
   */
  test("TS-CP-01.3.1 : Validation when firstname is empty (TextBox)", async ({
    page,
  }) => {
    await goToPageProfile(page);

    const firstNameInput = page.getByRole("textbox", {
      name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *",
    });

    await firstNameInput.clear();
    await expect(page.getByText("กรุณากรอกชื่อ")).toBeVisible();
  });

  /**
   * TS-CP-01.3.2
   * กรอกข้อมูลไม่ครบ (ชื่อว่าง) modal
   */
  test("TS-CP-01.3.2 : Validation when firstname is empty (Modal)", async ({
    page,
  }) => {
    await goToPageProfile(page);

    const firstNameInput = page.getByRole("textbox", {
      name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *",
    });

    await firstNameInput.clear();

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

    const cancelModal = page.getByRole("dialog");
    await expect(cancelModal).toContainText("ไม่สามารถบันทึกข้อมูลได้");

    await cancelModal.getByRole("button", { name: "ปิด" }).click();

    await expect(page).toHaveURL(/super\/profile-me/);
  });

  /**
   * TS-CP-01.4.1
   * กรอกข้อมูลไม่ครบ (นามสกุลว่าง) textbox
   */
  test("TS-CP-01.4.1 : Validation when first lastname is empty ", async ({
    page,
  }) => {
    await goToPageProfile(page);

    const lastNameInput = page.getByRole("textbox", {
      name: "นามสกุล *",
    });

    await lastNameInput.clear();

    await page.getByRole("button", { name: "บันทึก" }).click();
    await expect(page.getByText("กรุณากรอกนามสกุล")).toBeVisible();
    await expect(page).toHaveURL(/super\/profile-me/);
  });

  /**
   * TS-CP-01.4.2
   * กรอกข้อมูลไม่ครบ (นามสกุลว่าง) modal
   */
  test("TS-CP-01.4.2 : Validation when first name is empty (Modal)", async ({
    page,
  }) => {
    await goToPageProfile(page);

    const firstNameInput = page.getByRole("textbox", {
      name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *",
    });

    await firstNameInput.clear();

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

    const cancelModal = page.getByRole("dialog");
    await expect(cancelModal).toContainText("ไม่สามารถบันทึกข้อมูลได้");

    await cancelModal.getByRole("button", { name: "ปิด" }).click();

    await expect(page).toHaveURL(/super\/profile-me/);
  });

  /**
   * TS-CP-01.5
   * อีเมลซ้ำกับในระบบ
   */
  test("TS-CP-01.5 : Validation when email is already used", async ({
    page,
  }) => {
    await goToPageProfile(page);

    const emailInput = page.getByRole("textbox", {
      name: "อีเมล *",
    });

    await emailInput.clear();

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("superadmin_2@example.com");

    await expect(page.getByText("อีเมลนี้ถูกใช้งานแล้ว")).toBeVisible();
    await expect(page).toHaveURL(/super\/profile-me/);
  });

  /**
   * TS-CP-01.6
   * อีเมลรูปแบบผิด
   */
  test("TS-CP-01.6 : Validation when email format is invalid", async ({
    page,
  }) => {
    await goToPageProfile(page);

    const emailInput = page.getByRole("textbox", {
      name: "อีเมล *",
    });

    await emailInput.clear();

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("superadmin_1@abc.com");

    await expect(page.getByText("รูปแบบอีเมลไม่ถูกต้อง")).toBeVisible();
    await expect(page).toHaveURL(/super\/profile-me/);
  });

  /**
   * TS-CP-01.7
   * กรอกข้อมูลผิดหลายอย่างพร้อมกัน
   */
  test("TS-CP-01.7 : Create account failed - multiple invalid fields", async ({
    page,
  }) => {
    await goToPageProfile(page);

    await uploadProfileImage(page);

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("superadmin_1@example.com");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

    const cancelModal = page.getByRole("dialog");
    await expect(cancelModal).toContainText("ไม่สามารถบันทึกข้อมูลได้");

    await cancelModal.getByRole("button", { name: "ปิด" }).click();

    await expect(page).toHaveURL(/super\/profile-me/);
  });
});
