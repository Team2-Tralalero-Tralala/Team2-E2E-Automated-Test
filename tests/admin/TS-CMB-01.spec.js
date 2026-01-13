import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManageMemberPage - ไปยังหน้าจัดการสมาชิก
 */
async function goToManageMemberPage(page) {
  await page.getByRole("link", { name: "จัดการสมาชิก" }).click();
  await expect(page).toHaveURL(/admin\/members/);
}

/**
 * fillMemberForm - กรอกฟอร์มสร้างสมาชิก
 * @param {object} data - ข้อมูลสมาชิก
 */
async function fillMemberForm(page, data) {
  if (data.firstName !== undefined) {
    await page
      .getByRole("textbox", { name: "ชื่อ (ไม่ต้องใส่คำนำหน้า)" })
      .fill(data.firstName);
  }
  if (data.lastName !== undefined) {
    await page.getByRole("textbox", { name: "นามสกุล" }).fill(data.lastName);
  }
  if (data.username !== undefined) {
    await page.getByRole("textbox", { name: "ชื่อผู้ใช้" }).fill(data.username);
  }
  if (data.email !== undefined) {
    await page.getByRole("textbox", { name: "อีเมล" }).fill(data.email);
  }
  if (data.phone !== undefined) {
    await page.getByRole("textbox", { name: "โทรศัพท์" }).fill(data.phone);
  }
  if (data.password !== undefined) {
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(data.password);
  }
  if (data.confirmPassword !== undefined) {
    await page.getByPlaceholder("ยืนยันรหัสผ่าน").fill(data.confirmPassword);
  }
  if (data.role !== undefined) {
    await page.getByRole("textbox", { name: "บทบาทวิสาหกิจ" }).fill(data.role);
  }
}

/**
 * submitMemberForm - ส่งฟอร์มสร้างสมาชิก
 */
async function submitMemberForm(page) {
  await page.getByRole("button", { name: "สร้างบัญชี" }).click();

  const confirmBtn = page
    .getByRole("dialog")
    .getByRole("button", { name: /ยืนยัน/i });
  await confirmBtn.click();
}

/**
 * verifyErrorMessage - ตรวจสอบข้อความ error
 */
async function verifyErrorMessage(page, expectedError) {
  await expect(page.getByText(expectedError)).toBeVisible();
}

test.describe("Admin - Create Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToManageMemberPage(page);
    await page.getByRole("button", { name: "สร้างสมาชิก" }).click();
  });
  /**
   * test data
   */
  const validData = {
    firstName: "แดง",
    lastName: "ชาติ",
    username: "แดง",
    email: "ddd@gmail.com",
    phone: "0824789765",
    password: "Admin1879",
    confirmPassword: "Admin1879",
    role: "มัคคุเทศก์",
  };

  /**
   * TS-CMB-01.1: กรอกข้อมูลครบถ้วน
   */
  test("TS-CMB-01.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
    await fillMemberForm(page, validData);
    await submitMemberForm(page);
    await expect(page.getByText("สร้างบัญชีสมาชิกสำเร็จ")).toBeVisible({
      timeout: 10000,
    });
  });

  /**
   * TS-CMB-01.2: ไม่กรอกชื่อ
   */
  test("TS-CMB-01.2: ไม่กรอกชื่อ", async ({ page }) => {
    await fillMemberForm(page, { ...validData, firstName: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกชื่อ");
  });

  /**
   * TS-CMB-01.3: ไม่กรอกนามสกุล
   */
  test("TS-CMB-01.3: ไม่กรอกนามสกุล", async ({ page }) => {
    await fillMemberForm(page, { ...validData, lastName: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกนามสกุล");
  });

  /**
   * TS-CMB-01.4: ไม่กรอกชื่อผู้ใช้
   */
  test("TS-CMB-01.4: ไม่กรอกชื่อผู้ใช้", async ({ page }) => {
    await fillMemberForm(page, { ...validData, username: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกชื่อผู้ใช้");
  });

  /**
   * TS-CMB-01.5: ไม่กรอกอีเมล
   */
  test("TS-CMB-01.5: ไม่กรอกอีเมล", async ({ page }) => {
    await fillMemberForm(page, { ...validData, email: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกอีเมล");
  });

  /**
   * TS-CMB-01.6: ไม่กรอกเบอร์โทรศัพท์
   */
  test("TS-CMB-01.6: ไม่กรอกเบอร์โทรศัพท์", async ({ page }) => {
    await fillMemberForm(page, { ...validData, phone: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกเบอร์โทรศัพท์");
  });

  /**
   * TS-CMB-01.7: กรอกเบอร์โทรศัพท์เป็นตัวอักษร
   */
  test("TS-CMB-01.7: กรอกเบอร์โทรศัพท์เป็นตัวอักษร", async ({ page }) => {
    await fillMemberForm(page, { ...validData, phone: "123ฟกฟกฟก" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกตัวเลขให้ถูกต้อง");
  });

  /**
   * TS-CMB-01.8: ไม่กรอกรหัสผ่าน
   */
  test("TS-CMB-01.8: ไม่กรอกรหัสผ่าน", async ({ page }) => {
    await fillMemberForm(page, { ...validData, password: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกรหัสผ่าน");
  });

  /**
   * TS-CMB-01.9: ไม่กรอกยืนยันรหัสผ่าน
   */
  test("TS-CMB-01.9: ไม่กรอกยืนยันรหัสผ่าน", async ({ page }) => {
    await fillMemberForm(page, { ...validData, confirmPassword: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกยืนยันรหัสผ่าน");
  });

  /**
   * TS-CMB-01.10: ไม่กรอกบทบาทวิสาหกิจ
   */
  test("TS-CMB-01.10: ไม่กรอกบทบาทวิสาหกิจ", async ({ page }) => {
    await fillMemberForm(page, { ...validData, role: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกบทบาทวิสาหกิจ");
  });
});
