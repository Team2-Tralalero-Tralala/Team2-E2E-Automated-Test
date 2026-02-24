import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageEditProfile - ฟังก์ชันสำหรับนำทางไปยังหน้าการแก้ไขข้อมูลส่วนตัว
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action:
 *   1. คลิกที่ปุ่ม Profile
 *   2. คลิกที่ลิงก์ "แก้ไขข้อมูลส่วนตัว"
 *   3. รอหน้าเปลี่ยน URL ไปยังหน้าแก้ไขข้อมูลส่วนตัว
 * Output:
 *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /tourist/edit-profile
 */
async function goToPageEditProfile(page) {
  await page.getByRole("button", { name: /Profile/ }).click();
  await page.getByText("แก้ไขข้อมูลส่วนตัว").click();
  await page.waitForURL(/tourist\/edit-profile/);
}

/**
 * uploadProfileImage - ฟังก์ชันสำหรับอัพโหลดรูปโปรไฟล์
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. กำหนด path ของรูปโปรไฟล์
 *   2. อัพโหลดไฟล์ผ่าน input[type="file"]
 *   3. รอ dialog สำหรับรูปภาพแสดงขึ้น
 *   4. คลิกปุ่ม "ใช้รูปเดิม" ใน dialog
 * Output:
 *   - ไม่มี return value, แต่ระบบจะทำการอัพโหลดรูปโปรไฟล์ที่ระบุ
 */
async function uploadProfileImage(page) {
  const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");
  await page.locator('input[type="file"]').setInputFiles(imagePath);
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "ใช้รูปเดิม" }).click();
  await expect(dialog).toBeHidden();
}

/**
 * uploadProfilePDF - ฟังก์ชันสำหรับอัพโหลดไฟล์ PDF แทนรูปโปรไฟล์
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. กำหนด path ของไฟล์ PDF
 *   2. อัพโหลดไฟล์ผ่าน input[type="file"]
 *   3. รอ dialog สำหรับรูปภาพแสดงขึ้น
 * Output:
 *  - ไม่มี return value, แต่ระบบจะทำการอัพโหลดไฟล์ PDF ที่ระบุ
 */
async function uploadProfilePDF(page) {
  const pdfPath = path.join(process.cwd(), "assets/photo/pdf.pdf");
  await page.locator('input[type="file"]').setInputFiles(pdfPath);
  await page.getByRole("dialog").waitFor();
}

/**
 * fillProfileForm - ฟังก์ชันสำหรับกรอกข้อมูลในฟอร์มแก้ไขข้อมูลส่วนตัว
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. กรอกข้อมูลในช่องต่างๆ ของฟอร์มแก้ไขข้อมูลส่วนตัว
 *   2. เลือกเพศเป็น "ชาย"
 *   3. เลือกที่อยู่ (จังหวัด, อำเภอ, ตำบล) เว้นแต่จะระบุให้ข้าม
 *   4. สามารถระบุข้อมูลทับได้ผ่าน parameter overrides  
 * Output:
 *   - ไม่มี return value, แต่ฟอร์มจะถูกกรอกข้อมูลตามที่ระบุ
 */
async function fillProfileForm(page, overrides = {}) {
  const data = {
    firstName: "นักท่องเที่ยว",
    lastName: "เดินทาง",
    username: "travel123",
    email: "travel123@gmail.com",
    phone: "0923456789",
    birth: "2000-01-01",
    skipAddress: false,
    ...overrides,
  };

  await page.getByRole("textbox", { name: /ชื่อ \(ไม่ต้องใส่คำนำหน้า\)/ }).fill(data.firstName);
  await page.getByRole("textbox", { name: /นามสกุล/ }).fill(data.lastName);
  await page.getByRole("textbox", { name: /ชื่อผู้ใช้/ }).fill(data.username);
  await page.getByRole("textbox", { name: /อีเมล/ }).fill(data.email);
  await page.getByRole("textbox", { name: /โทรศัพท์/ }).fill(data.phone);
  await page.getByRole("textbox", { name: /วัน-เดือน-ปีเกิด/ }).fill(data.birth);

  await page.getByText("ชาย").click();

  if (!data.skipAddress) {
    await page.getByRole("combobox", { name: "จังหวัด *" }).click();
    await page.getByText("ชลบุรี").click();

    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByText("เมืองชลบุรี").click();

    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
    await page.getByText("แสนสุข").click();
  }
}

/**
 * submitAndConfirm - ฟังก์ชันสำหรับส่งฟอร์มแก้ไขข้อมูลส่วนตัวและยืนยัน
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. คลิกปุ่ม "บันทึก"
 *   2. รอ dialog แสดงขึ้น
 *   3. คลิกปุ่ม "ยืนยัน" ใน dialog
 * Output:
 *   - ไม่มี return value, แต่ระบบจะทำการส่งฟอร์มและยืนยันการแก้ไขข้อมูลส่วนตัว
 */
async function submitAndConfirm(page) {
  await page.getByRole("button", { name: "บันทึก" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "ยืนยัน" }).click();
}

test.describe("TS-EP-01.1 - แก้ไขข้อมูลส่วนตัว", () => {
  /**
   * TC-EP-01.1
   * แก้ไขข้อมูลส่วนตัวสำเร็จ
   */
  test("TS-EP-01.1: แก้ไขข้อมูลส่วนตัวสำเร็จ", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page);
    await submitAndConfirm(page);

    const dialog = page.getByRole("dialog", { name: "แก้ไขข้อมูลส่วนตัวสำเร็จ" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "ปิด" }).click();
    await expect(page).toHaveURL(/tourist\/edit-profile/);
  });

  /**
   * TC-EP-01.2
   * ยกเลิกการแก้ไขข้อมูลส่วนตัว
   */
  test("TS-EP-01.2: ยกเลิกการแก้ไขข้อมูลส่วนตัว", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page);
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await page.waitForURL(/tourist\/home/);
  });

  /**
   * TC-EP-01.3
   * ชื่อว่าง
   */
  test("TS-EP-01.3: ชื่อว่าง", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page, { firstName: "" });
    await submitAndConfirm(page);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("ไม่สามารถบันทึกข้อมูลได้");
  });

  /**
   * TC-EP-01.4
   * นามสกุลว่าง
   */
  test("TS-EP-01.4: นามสกุลว่าง", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page, { lastName: "" });
    await submitAndConfirm(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("ไม่สามารถบันทึกข้อมูลได้");
  });

  /**
   * TC-EP-01.5
   * อีเมลผิดรูปแบบ
   */
  test("TS-EP-01.5: อีเมลผิดรูปแบบ", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page, { email: "tr" });
    await submitAndConfirm(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("ไม่สามารถบันทึกข้อมูลได้");
  });

  /**
   * TC-EP-01.6
   * อีเมลซ้ำ
   */
  test("TS-EP-01.6: อีเมลซ้ำ", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page, { email: "comm_member_2@example.com" });
    await submitAndConfirm(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("ไม่สามารถบันทึกข้อมูลได้");
  });

  /**
   * TC-EP-01.7
   * เบอร์โทรไม่ถูกต้อง
   */
  test("TS-EP-01.7: เบอร์โทรไม่ถูกต้อง", async ({ page }) => {
    await loginAs(page, "tourist");
    await goToPageEditProfile(page);
    await uploadProfileImage(page);
    await fillProfileForm(page, { phone: "09" });
    await submitAndConfirm(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("ไม่สามารถบันทึกข้อมูลได้");
  });

  /**
   * TC-EP-01.8
   * ที่อยู่ไม่ครบ
   */
  test("TS-EP-01.8: ที่อยู่ไม่ครบ", async ({ page }) => {
  await loginAs(page, "tourist");
  await goToPageEditProfile(page);
  await uploadProfileImage(page);
  await fillProfileForm(page, { skipAddress: true });
  await page.getByRole("button", { name: "บันทึก" }).click();
  const dialog = page.getByRole("dialog", { 
    name: "ไม่สามารถบันทึกข้อมูลได้" 
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("กรุณากรอกที่อยู่ให้ครบถ้วน");
  await dialog.getByRole("button", { name: "ปิด" }).click();
});

  /**
   * TC-EP-01.9
   * อัปโหลดไฟล์ผิดประเภท
   */
test.only("TS-EP-01.9: อัปโหลดไฟล์ผิดประเภท", async ({ page }) => {
  await loginAs(page, "tourist");
  await goToPageEditProfile(page);
  await uploadProfilePDF(page);
  const dialog = page.getByRole("dialog", {
    name: "ไม่สามารถบันทึกข้อมูลได้",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น"
  );
});
});
