import { test, expect } from "@playwright/test";

/**
 * TS-CRP-01.1: ผู้ใช้งานทั่วไปสร้างโปรไฟล์ได้สำเร็จ
 */
test("TS-CRP-01.1: ผู้ใช้งานทั่วไปสร้างโปรไฟล์ได้สำเร็จ", async ({
  page,
}) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
   await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.2: กรอกข้อมูลไม่ครบ (ชื่อว่าง)
 */
test("TS-CRP-01.2: กรอกข้อมูลไม่ครบ (ชื่อว่าง)", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.3: กรอกข้อมูลไม่ครบ (นามสกุลว่าง)
 */
test("TS-CRP-01.3: กรอกข้อมูลไม่ครบ (นามสกุลว่าง)", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.4: ชื่อผู้ใช้ไม่ครบตามเงื่อนไข
 */
test("TS-CRP-01.4: ชื่อผู้ใช้ไม่ครบตามเงื่อนไข", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("la");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.5: รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน
 */
test("TS-CRP-01.5: รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.6: รหัสผ่านสั้นเกินไป
 */
test("TS-CRP-01.6: รหัสผ่านสั้นเกินไป", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Sa");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).fill("Sa");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.7: อีเมลรูปแบบผิด
 */
test("TS-CRP-01.7: อีเมลรูปแบบผิด", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lal");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.8: อีเมลซ้ำกับในระบบ
 */
test("TS-CRP-01.8: อีเมลซ้ำกับในระบบ", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.9: เบอร์โทรศัพท์ไม่ถูกต้อง
 */
test("TS-CRP-01.9: เบอร์โทรศัพท์ไม่ถูกต้อง", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("09");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.10: ไม่เลือกเพศ
 */
test("TS-CRP-01.10: ไม่เลือกเพศ", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  // 1. จังหวัด (ปุ่ม Open ตัวแรก)
  await page.getByRole("button", { name: "Open" }).first().click();
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();

  // 2. อำเภอ/เขต (ปุ่ม Open ตัวที่สอง - index 1)
  await page.getByRole("button", { name: "Open" }).nth(1).click();
  await page.getByRole("option", { name: "บางรัก" }).click();

  // 3. ตำบล/แขวง (ปุ่ม Open ตัวที่สาม - index 2)
  await page.getByRole("button", { name: "Open" }).nth(2).click();
  await page.getByRole("option", { name: "สีลม" }).click();

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

/**
 * TS-CRP-01.11: ไม่เลือกจังหวัด/อำเภอ/ตำบล
 */
test("TS-CRP-01.11: ไม่เลือกจังหวัด/อำเภอ/ตำบล", async ({ page }) => {
  // 1. ไปที่หน้าลงทะเบียน
  await page.goto("/guest/signup");

  // --- ข้อมูลส่วนตัว ---
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .click();
  await page
    .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า) *" })
    .fill("ดงยุค");

  await page.getByRole("textbox", { name: "นามสกุล *" }).click();
  await page.getByRole("textbox", { name: "นามสกุล *" }).fill("ลาลา");

  // --- ข้อมูลบัญชี ---
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).click();
  await page.getByRole("textbox", { name: "ชื่อผู้ใช้ *" }).fill("lala22");

  await page.getByRole("textbox", { name: "อีเมล *" }).click();
  await page.getByRole("textbox", { name: "อีเมล *" }).fill("lala22@gmail.com");

  await page.getByRole("textbox", { name: "รหัสผ่าน *", exact: true }).click();
  await page
    .getByRole("textbox", { name: "รหัสผ่าน *", exact: true })
    .fill("Samitanan99");

  await page.getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" }).click();
  await page
    .getByRole("textbox", { name: "ยืนยันรหัสผ่าน *" })
    .fill("Samitanan99");

  // --- ข้อมูลติดต่อ ---
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).click();
  await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0987654321");

  // --- วันเกิด (ตาม Selector ที่คุณให้มา: วว/ดด/ปปปป) ---
  await page.getByRole("textbox", { name: "วว" }).click();
  await page.getByRole("textbox", { name: "วว" }).fill("01");

  await page.getByRole("textbox", { name: "ดด" }).click();
  await page.getByRole("textbox", { name: "ดด" }).fill("01");

  await page.getByRole("textbox", { name: "ปปปป" }).click();
  await page.getByRole("textbox", { name: "ปปปป" }).fill("2540");

  // --- เพศ ---
  await page.getByRole("radio", { name: "ชาย" }).click();
  await page.getByRole("radio", { name: "ชาย" }).click();
  // --- ที่อยู่ (Dropdown แบบคลิกปุ่ม Open) ---

  await page.getByRole("button", { name: "ลงทะเบียน" }).click();
});

