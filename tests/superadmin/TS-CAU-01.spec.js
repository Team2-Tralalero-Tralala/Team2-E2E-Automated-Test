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
  await page.getByRole("button", { name: "Tourist" }).click();
  await expect(page).toHaveURL(/super\/account\/tourist\/create/);
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
   * TC-CAU-01.1
   * สร้างบัญชีสำเร็จ Tourist สำเร็จ
   */
  test("TS-CAU-01.1 : SuperAdmin create Tourist successfully", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ลี่ลี่");

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("นานา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nana11@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Nanana789");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Nanana789");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });

    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("20130");

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/accounts\/all/);

    await expect(
      page.getByRole("cell", { name: "samitanan11@gmail.com" })
    ).toBeVisible();
  });

  /**
   * TC-CAU-01.2
   * กดยกเลิกสร้าง Tourist สำเร็จ (จากหน้าสร้างบัญชี)
   */
  test("TS-CAU-01.2: cancel create account from create page", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    const cancelBtn = page.getByRole("button", { name: "ยกเลิก" });
    await expect(cancelBtn).toBeEnabled();
    await cancelBtn.click();
    await expect(page).toHaveURL(/super\/accounts\/all/);
  });

  /**
   * TC-CAU-01.3
   * กรอกข้อมูลไม่ครบ (ชื่อว่าง)
   */
  test("TS-CAU-01.3: Create account failed - name is required", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("นานา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nana_11@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("20130");

    await uploadProfileImage(page);

   await expect(page.getByText(/กรุณากรอกขื่อ/)).toBeVisible();
  });

  /**
   * TC-CAU-01.4
   * กรอกข้อมูลไม่ครบ (นามสกุลว่าง)
   */
  test("TS-CAU-01.4: Create account failed - lastname is required", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ดงยุค");

    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nanaa_111@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
    await expect(page.getByText(/กรุณากรอกนามสกุล/)).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  /**
   * TC-CAU-01.5
   * รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน
   */
  test("TS-CAU-01.5: Create account failed - password mismatch", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ลี่ลี่");
    await page.getByRole("textbox", { name: "นามสกุล *" }).fill("นานา");
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana11");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nanaa_11@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Nanana7892");

    const confirmPasswordInput = page.getByRole("textbox", {
      name: "กรอกยืนยันรหัสผ่าน *",
    });

    await confirmPasswordInput.fill("Nanana789");
    await confirmPasswordInput.blur();

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await expect(confirmPasswordInput.locator("..")).toContainText(
      "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"
    );

    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
  });

  /**
   * TC-CAU-01.6
   * อีเมลซ้ำกับในระบบ
   */
  test("TS-CAU-01.6: Create account failed - duplicate email", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ลี่ลี่");

     await page.getByRole("textbox", { name: "นามสกุล *" }).fill("นานา");
     await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana11");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nana11@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Samitanan99");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Samitanan99");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await expect(page.getByText("อีเมลนี้ถูกใช้งานแล้ว")).toBeVisible();
    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
  });

  /**
   * TC-CA-01.7
   * กรอกรหัสผ่านไม่ครบทุกเงื่อนไข
   */
  test("TS-CA-01.7: Create account failed - password does not meet requirements", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);
     await page
       .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
       .fill("ลี่ลี่");
     await page.getByRole("textbox", { name: "นามสกุล *" }).fill("นานา");
     await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana11");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nanana11@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("nanana789");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("nanana789");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", {
      name: "อำเภอ / เขต *",
    });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await expect(page.getByText(/รหัสผ่านไม่เป็นไปตามเงื่อนไข/i)).toBeVisible();
    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
  });

  /**
   * TC-CAU-01.8
   * รหัสผ่านสั้นกว่าที่กำหนด
   */
  test("TS-CAU-01.8: Create account failed - password too short", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("นานา");

    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana11");

    await page
      .getByRole("textbox", { name: "อีเมล *" })
      .fill("nanana11@gmail.com");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Nana45");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Nana45");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", {
      name: "อำเภอ / เขต *",
    });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await expect(
      page.getByText("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    ).toBeVisible();

    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
  });

  /**
   * TC-CAU-01.9
   * อีเมลรูปแบบผิด
   */
  test("TS-CAU-01.9: Create account failed - invalid email format", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("นานา");

    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana11");

    const emailInput = page.getByRole("textbox", { name: "อีเมล *" });
    await emailInput.fill("nana11@abc.com");
    await emailInput.blur(); // trigger validation

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Nanana789");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Nanana789");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", {
      name: "อำเภอ / เขต *",
    });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await expect(emailInput.locator("..")).toContainText(
      "รูปแบบอีเมลไม่ถูกต้อง"
    );
    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
  });

  /**
   * TC-CA-01.10
   * กรอกข้อมูลผิดหลายอย่างพร้อมกัน
   */
  test("TS-CA-01.10: Create account failed - multiple invalid fields", async ({
    page,
  }) => {
    await goToPageCreateAccount(page);

    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ลี่ลี่");

    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("nana11");
    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Nanan789");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Nanan789");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", {
      name: "อำเภอ / เขต *",
    });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();
   
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();
   
    await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
   
    await expect(page).toHaveURL(/super\/account\/tourist\/create/);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

   /**
     * TC-CA-01.11
     * กรอกรหัสผ่านถูกต้องครบทุกเงื่อนไข
     */
    test("TS-CA-01.11: Create account success - valid password", async ({
      page,
    }) => {
    await goToPageCreateAccount(page);
  
    await page
      .getByRole("textbox", { name: "ชื่อ(ไม่ต้องใส่คำนำหน้า) *" })
      .fill("ลี่ลี่");

    await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

    await page
      .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
      .fill("Nanan7809");

    await page
      .getByRole("textbox", { name: "กรอกยืนยันรหัสผ่าน *" })
      .fill("Nanana789");

    await page.getByRole("button", { name: "Tourist" }).click();

    await page.fill('[type="date"]', "2000-01-01");
    await page.getByLabel("หญิง").check();

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("ชลบุรี");
    await page.getByRole("option", { name: "ชลบุรี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("เมือง");
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });

    await subDistrict.click();
    await subDistrict.fill("เสม็ด");
    await page.getByRole("option", { name: "เสม็ด" }).click();

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("20130");

    await uploadProfileImage(page);

    await page.getByRole("button", { name: "สร้างบัญชี" }).click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await expect(page).toHaveURL(/super\/accounts\/all/);
  });

});