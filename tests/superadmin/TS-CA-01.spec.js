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
async function goToPageCreateAccount(page) {

  const manageAccount = page.getByRole("link", { name: "จัดการบัญชี" });
  await expect(manageAccount).toBeVisible();
  await manageAccount.click();

  const addBtn = page.getByRole("button", { name: /เพิ่มบัญชี/ });
  await expect(addBtn).toBeEnabled();
  await addBtn.click();

  await expect(page).toHaveURL(/super\/account\/admin\/create/);
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

test.describe("SuperAdmin - Create Account", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-CA-01.1.1
   * สร้างบัญชีสำเร็จ Admin สำเร็จ
   */
  test("TS-CA-01.1.1: SuperAdmin create Admin successfully", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await uploadProfileImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");
    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lala22@gmail.com");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");
    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Admin" }).click();

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/accounts\/all/);
    await expect(
      page.getByRole("cell", { name: "lala22@gmail.com" })
    ).toBeVisible();
  });

  /**
   * TC-CA-01.1.2
   * สร้างบัญชีสำเร็จ Member สำเร็จ
   */
  test("TS-CA-01.1.2: SuperAdmin create Member successfully", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");
    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("member01");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("member01@gmail.com");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");
    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Member" }).click();

    const communityInput = page.getByRole("combobox", {
      name: "ค้นหาชุมชน",
    });

    await communityInput.click();
    await communityInput.fill("วิสาหกิจ");

    const option = page
      .getByRole("option")
      .filter({ hasText: "วิสาหกิจ" })
      .first();

    await expect(option).toBeVisible();
    await option.click();

    await page
      .getByRole("textbox", { name: /บทบาทในชุมชน/ })
      .fill("ฝ่ายต้อนรับ");

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/accounts\/all/);
    await expect(
      page.getByRole("cell", { name: "member01@gmail.com" })
    ).toBeVisible();
  });

  /**
   * TC-CA-01.2
   * กดยกเลิกสร้าง Admin และ Member สำเร็จ (จากหน้าสร้างบัญชี)
   */
  test("TS-CA-01.2: cancel create account from create page", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    const cancelBtn = page.getByRole("button", { name: "ยกเลิก" });
    await expect(cancelBtn).toBeEnabled();
    await cancelBtn.click();

    await expect(page).toHaveURL(/super\/accounts\/all/);
  });

  /**
   * TC-CA-01.3
   * กรอกข้อมูลไม่ครบ (ชื่อว่าง)
   */
  test("TS-CA-01.3: Create account failed - name is required", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lalaying22@gmail.com");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");
    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Admin" }).click();
    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/account\/admin\/create/);
    await expect(page.getByText(/กรุณากรอกชื่อ/)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  /**
   * TC-CA-01.4
   * กรอกข้อมูลไม่ครบ (นามสกุลว่าง)
   */
  test("TS-CA-01.4: Create account failed - lastname is required", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lalafdds22@gmail.com");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");
    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Admin" }).click();

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();
    await expect(page).toHaveURL(/super\/account\/admin\/create/);
    await expect(page.getByText(/กรุณากรอกนามสกุล/)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  /**
   * TC-CA-01.5
   * กรอกรหัสผ่านถูกต้องครบทุกเงื่อนไข
   */
  test("TS-CA-01.5: Create account success - valid password", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");
    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lala22sdok@gmail.com");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");
    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Admin" }).click();

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/accounts\/all/);
    await expect(
      page.getByRole("cell", { name: "lala22sdok@gmail.com" })
    ).toBeVisible();
  });

  /**
   * TC-CA-01.6
   * กรอกรหัสผ่านไม่ครบทุกเงื่อนไข
   */
  test("TS-CA-01.6: Create account failed - password does not meet requirements", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");
    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lala2dd2@gmail.com");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("samitananii");
    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("samitananii");

    await page.getByRole("button", { name: "Admin" }).click();
    await uploadProfileImage(page);
    await expect(page.getByText(/รหัสผ่านไม่เป็นไปตามเงื่อนไข/i)).toBeVisible();
    await expect(page).toHaveURL(/super\/account\/admin\/create/);
  });

  /**
   * TC-CA-01.7
   * รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน
   */
  test("TS-CA-01.7: Create account failed - password mismatch", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("laladfji22@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    const confirmPasswordInput = page.getByRole("textbox", {
      name: "กรอกยืนยันรหัสผ่าน *",
    });

    await confirmPasswordInput.fill("Samitanan992");
    await confirmPasswordInput.blur();

    await page.getByRole("button", { name: "Admin" }).click();
    await uploadProfileImage(page);

    await expect(confirmPasswordInput.locator("..")).toContainText(
      "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"
    );
    await expect(page).toHaveURL(/super\/account\/admin\/create/);
  });

  /**
   * TC-CA-01.8
   * อีเมลซ้ำกับในระบบ
   */
  test("TS-CA-01.8: Create account failed - duplicate email", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lala22@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Admin" }).click();
    await uploadProfileImage(page);

    await expect(page.getByText("อีเมลนี้ถูกใช้งานแล้ว")).toBeVisible();
    await expect(page).toHaveURL(/super\/account\/admin\/create/);
  });

  /**
   * TC-CA-01.9
   * รหัสผ่านสั้นกว่าที่กำหนด
   */
  test("TS-CA-01.9: Create account failed - password too short", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");
    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lala2sss2@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");
    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Saio3");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Saio3");

    await page.getByRole("button", { name: "Admin" }).click();
    await uploadProfileImage(page);
    await expect(
      page.getByText("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    ).toBeVisible();
    await expect(page).toHaveURL(/super\/account\/admin\/create/);
  });

  /**
   * TC-CA-01.10
   * อีเมลรูปแบบผิด
   */
  test("TS-CA-01.10: Create account failed - invalid email format", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    const emailInput = page.getByRole("textbox", { name: "อีเมล *" });
    await emailInput.fill("lala22@abc.com");
    await emailInput.blur(); // trigger validation

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Admin" }).click();
    await uploadProfileImage(page);
    await expect(emailInput.locator("..")).toContainText(
      "รูปแบบอีเมลไม่ถูกต้อง"
    );
    await expect(page).toHaveURL(/super\/account\/admin\/create/);
  });

  /**
   * TS-CA-01.11
   * ไม่เลือกชุมชนวิสาหกิจ
   */
  test("TS-CA-01.11: Create Member failed - community not selected", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lala21pok2@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Member" }).click();

    await page
      .getByRole("textbox", { name: /บทบาทในชุมชน/ })
      .fill("ฝ่ายต้อนรับ");

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/account\/admin\/create/);
    await expect(communityField.locator("..")).toContainText("กรุณาเลือกชุมชน");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  /**
   * TS-CA-01.12
   * กรอกข้อมูลผิดหลายอย่างพร้อมกัน
   */
  test("TS-CA-01.12: Create account failed - multiple invalid fields", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");
    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("lalaeweii22@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");
    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Member" }).click();
    const communityInput = page.getByRole("combobox", {
      name: "ค้นหาชุมชน",
    });

    await communityInput.click();
    await communityInput.fill("วิสาหกิจ");

    const option = page
      .getByRole("option")
      .filter({ hasText: "วิสาหกิจ" })
      .first();

    await expect(option).toBeVisible();
    await option.click();

    await uploadProfileImage(page);
    await page.getByRole("button", { name: "สร้างบัญชี" }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();

    await expect(page).toHaveURL(/super\/account\/admin\/create/);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
  
});


