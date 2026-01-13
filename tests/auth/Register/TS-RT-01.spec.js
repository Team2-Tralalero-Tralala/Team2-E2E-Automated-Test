import { test, expect } from "@playwright/test";

test.describe("Guest - Register Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4000/");
    await page.click('a[href="/guest/signup"]');
    await expect(page).toHaveURL("http://localhost:4000/guest/signup");
  });

  /**
   * TS-RT-01.1
   * สร้างบัญชีสำเร็จ User สำเร็จ
   */
  test("TS-RT-01.1: Fill all required fields and submit", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai01");
    await page.fill("#email", "somchai01@example.com");
    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345678");

    const dateInputs = page.locator(
      'div[aria-label="Thai BE date input"] input'
    );
    await dateInputs.nth(0).fill("01");
    await dateInputs.nth(1).fill("01");
    await dateInputs.nth(2).fill("2540");

    await page.locator('label[for="male"]').click();

    await page.fill("#province", "กรุงเทพมหานคร");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.fill("#district", "บางรัก");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.fill("#subDistrict", "สีลม");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(page.locator("#postalCode")).not.toBeEmpty();

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page).toHaveURL(/success|login|verify/);
  });

  /**
   * TS-RT-01.2
   * กรอกข้อมูลไม่ครบ (ชื่อว่าง)
   */
  test("TS-RT-01.2: Clear first name should show validation message", async ({
    page,
  }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#fname", "");
    await page.locator("#lname").click();
    await expect(page.locator("#fname-helper-text")).toHaveText(
      "กรุณากรอกชื่อ"
    );

    await page.click('button:has-text("ลงทะเบียน")');
    await expect(page.locator("#fname-helper-text")).toHaveText(
      "กรุณากรอกชื่อ"
    );
  });

  /**
   * TS-RT-01.3
   * กรอกข้อมูลไม่ครบ (นามสกุลว่าง)
   */
  test("TS-RT-01.3: Clear last name should show validation message", async ({
    page,
  }) => {
    await page.fill("#lname", "ใจดี");
    await page.fill("#lname", "");
    await page.locator("#fname").click();
    await expect(page.locator("#lname-helper-text")).toHaveText(
      "กรุณากรอกนามสกุล"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#lname-helper-text")).toHaveText(
      "กรุณากรอกนามสกุล"
    );
  });

  /**
   * TS-RT-01.4
   * กรอกชื่อผู้ใช้ไม่ครบ (ชื่อผู้ใช้ว่าง)
   */
  test("TS-RT-01.4: Username is required", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai01");
    await page.fill("#username", "");

    await page.locator("#email").click();

    await expect(page.locator("#username-helper-text")).toHaveText(
      "กรุณากรอกชื่อผู้ใช้"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#username-helper-text")).toHaveText(
      "กรุณากรอกชื่อผู้ใช้"
    );
  });

  /**
   * TS-RT-01.5
   * ชื่อผู้ใช้ซ้ำ (มีชื่อผู้ใช้นี้แล้วในระบบ)
   */
  test("TS-RT-01.5: Username already exists", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai01");
    await page.fill("#email", "somchai02@example.com");
    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345679");

    await expect(page.locator("#username-helper-text")).toHaveText(
      "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
    );
    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#username-helper-text")).toHaveText(
      "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
    );
  });

  /**
   * TS-RT-01.6
   * กรอกอีเมลไม่ครบ (อีเมลว่าง)
   */
  test("TS-RT-01.6: Email is required", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai03");

    await page.fill("#email", "");

    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345680");

    await page.locator("#password").click();

    await expect(page.locator("#email-helper-text")).toHaveText(
      "กรุณากรอกอีเมล"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#email-helper-text")).toHaveText(
      "กรุณากรอกอีเมล"
    );
  });

  /**
   * TS-RT-01.7
   * อีเมลรูปแบบผิด
   */
  test("TS-RT-01.7: Invalid email format", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai04");

    await page.fill("#email", "somchai04@abc.com");

    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345681");

    await page.locator("#password").click();

    await expect(page.locator("#email-helper-text")).toHaveText(
      "กรุณากรอกรูปแบบอีเมลให้ถูกต้อง"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#email-helper-text")).toHaveText(
      "กรุณากรอกรูปแบบอีเมลให้ถูกต้อง"
    );
  });

  /**
   * TS-RT-01.8
   * รหัสผ่านสั้นกว่าที่กำหนด
   */
  test("TS-RT-01.8: Password shorter than minimum length", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai05");
    await page.fill("#email", "somchai05@example.com");

    await page.fill("#password", "Pass12");
    await page.fill("#passwordConfirm", "Pass12");

    await page.fill("#phone", "812345682");

    await page.locator("#phone").click();

    await expect(page.locator("#password-helper-text")).toHaveText(
      "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#password-helper-text")).toHaveText(
      "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
    );
  });

  /**
   * TS-RT-01.9
   * รูปแบบรหัสผ่านไม่ถูกต้อง
   */
  test("TS-RT-01.9: Invalid password format", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai06");
    await page.fill("#email", "somchai06@example.com");

    await page.fill("#password", "password1");
    await page.fill("#passwordConfirm", "password1");

    await page.fill("#phone", "812345683");
    n;
    await page.locator("#phone").click();

    await expect(page.locator("#password-helper-text")).toHaveText(
      "กรุณากรอกรหัสผ่านให้ตรงตามเงื่อนไข"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#password-helper-text")).toHaveText(
      "กรุณากรอกรหัสผ่านให้ตรงตามเงื่อนไข"
    );
  });

  /**
   * TS-RT-01.10
   * รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน
   */
  test("TS-RT-01.10: Password and confirm password do not match", async ({
    page,
  }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai07");
    await page.fill("#email", "somchai07@example.com");

    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password124");

    await page.fill("#phone", "812345684");

    await page.locator("#phone").click();

    await expect(page.locator("#passwordConfirm-helper-text")).toHaveText(
      "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#passwordConfirm-helper-text")).toHaveText(
      "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"
    );
  });

  /**
   * TS-RT-01.11
   * กรอกหมายเลขโทรศัพท์ไม่ครบ
   */
  test("TS-RT-01.11: Phone number less than 10 digits", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai11");
    await page.fill("#email", "somchai11@example.com");

    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");

    await page.fill("#phone", "81234567");

    const dateInputs = page.locator(
      'div[aria-label="Thai BE date input"] input'
    );
    await dateInputs.nth(0).fill("01");
    await dateInputs.nth(1).fill("01");
    await dateInputs.nth(2).fill("2540");

    await page.locator('label[for="male"]').click();

    await page.locator("#email").click();

    await expect(page.locator("#phone-helper-text")).toHaveText(
      "กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 9 หลัก"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#phone-helper-text")).toHaveText(
      "กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 9 หลัก"
    );
  });

  /**
   * TS-RT-01.12
   * กรอกวัน เดือน ปีเกิด ไม่ครบ (ว่าง)
   */
  test("TS-RT-01.12: Birth date is required", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai12");
    await page.fill("#email", "somchai12@example.com");

    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345689");

    await page.locator('label[for="male"]').click();

    await expect(page.locator("#birthDate-helper-text")).toHaveText(
      "กรุณาระบุวัน-เดือน-ปีเกิด"
    );

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#birthDate-helper-text")).toHaveText(
      "กรุณาระบุวัน-เดือน-ปีเกิด"
    );
  });

  /**
   * TS-RT-01.13
   * ข้อมูลเพศว่าง
   */
  test("TS-RT-01.13: Gender is required", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai13");
    await page.fill("#email", "somchai13@example.com");
    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345690");

    const dateInputs = page.locator(
      'div[aria-label="Thai BE date input"] input'
    );
    await dateInputs.nth(0).fill("01");
    await dateInputs.nth(1).fill("01");
    await dateInputs.nth(2).fill("2540");

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#gender-helper-text")).toHaveText(
      "กรุณาเลือกเพศ"
    );
  });

  /**
   * TS-RT-01.14
   * ข้อมูลจังหวัดว่าง
   */
  test("TS-RT-01.14: Province is required", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai14");
    await page.fill("#email", "somchai14@example.com");
    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345691");

    const dateInputs = page.locator(
      'div[aria-label="Thai BE date input"] input'
    );
    await dateInputs.nth(0).fill("01");
    await dateInputs.nth(1).fill("01");
    await dateInputs.nth(2).fill("2540");

    await page.locator('label[for="male"]').click();

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#province-helper-text")).toHaveText(
      "กรุณาเลือกจังหวัด"
    );
  });

  /**
   * TS-RT-01.15
   * ข้อมูลอำเภอ/เขตว่าง
   */
  test("TS-RT-01.15: District is required", async ({ page }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai15");
    await page.fill("#email", "somchai15@example.com");
    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345692");

    const dateInputs = page.locator(
      'div[aria-label="Thai BE date input"] input'
    );
    await dateInputs.nth(0).fill("01");
    await dateInputs.nth(1).fill("01");
    await dateInputs.nth(2).fill("2540");

    await page.locator('label[for="male"]').click();

    await page.fill("#province", "กรุงเทพมหานคร");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#district-helper-text")).toHaveText(
      "กรุณาเลือกอำเภอ/เขต"
    );
  });

  /**
   * TS-RT-01.16
   * ข้อมูลตำบล/แขวงว่าง
   */
  test("TS-RT-01.16: Postal code is required when sub-district not selected", async ({
    page,
  }) => {
    await page.fill("#fname", "สมชาย");
    await page.fill("#lname", "ใจดี");
    await page.fill("#username", "somchai16");
    await page.fill("#email", "somchai16@example.com");
    await page.fill("#password", "Password123");
    await page.fill("#passwordConfirm", "Password123");
    await page.fill("#phone", "812345693");

    const dateInputs = page.locator(
      'div[aria-label="Thai BE date input"] input'
    );
    await dateInputs.nth(0).fill("01");
    await dateInputs.nth(1).fill("01");
    await dateInputs.nth(2).fill("2540");

    await page.locator('label[for="male"]').click();

    await page.fill("#province", "กรุงเทพมหานคร");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.fill("#district", "บางรัก");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#postalCode-helper-text")).toHaveText(
      "กรุณากรอกรหัสไปรษณีย์"
    );
  });

  /**
   * TS-RT-01.17
   * กรอกข้อมูลผิดหลายอย่างพร้อมกัน
   */
  test("TS-RT-01.17: Multiple invalid fields", async ({ page }) => {
    await page.fill("#lname", "ใจดี");
    await page.fill("#email", "somchai18@abc.com");
    await page.fill("#password", "12345");
    await page.fill("#passwordConfirm", "123456");
    await page.fill("#phone", "81234");

    await page.click('button:has-text("ลงทะเบียน")');

    await expect(page.locator("#fname-helper-text")).toHaveText(
      "กรุณากรอกชื่อ"
    );

    await expect(page.locator("#username-helper-text")).toHaveText(
      "กรุณากรอกชื่อผู้ใช้"
    );

    await expect(page.locator("#email-helper-text")).toHaveText(
      "รูปแบบอีเมลไม่ถูกต้อง"
    );

    await expect(page.locator("#password-helper-text")).toHaveText(
      "รหัสผ่านไม่ตรงตามเงื่อนไข"
    );

    await expect(page.locator("#passwordConfirm-helper-text")).toHaveText(
      "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"
    );

    await expect(page.locator("#phone-helper-text")).toHaveText(
      "กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 9 หลัก"
    );

    await expect(page.locator("#birthDate-helper-text")).toHaveText(
      "กรุณาระบุวัน-เดือน-ปีเกิด"
    );

    await expect(page.locator("#gender-helper-text")).toHaveText(
      "กรุณาเลือกเพศ"
    );

    await expect(page.locator("#province-helper-text")).toHaveText(
      "กรุณาเลือกจังหวัด"
    );

    await expect(page.locator("#postalCode-helper-text")).toHaveText(
      "กรุณากรอกรหัสไปรษณีย์"
    );
  });
});
