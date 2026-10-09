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

  // รอให้ dialog ปรากฏ
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });

  const confirmBtn = dialog.getByRole("button", { name: /ยืนยัน/i });
  await confirmBtn.click();
}

/**
 * clickCreateButtonOnly - คลิกปุ่มสร้างบัญชีเท่านั้น (ไม่กดยืนยัน)
 */
async function clickCreateButtonOnly(page) {
  await page.getByRole("button", { name: "สร้างบัญชี" }).click();

  // รอให้ dialog ปรากฏ
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
}

/**
 * cancelInModal - คลิกปุ่มยกเลิกใน modal
 */
async function cancelInModal(page) {
  const dialog = page.getByRole("dialog");
  const cancelBtn = dialog.getByRole("button", { name: /ยกเลิก/i });
  await cancelBtn.click();
}

/**
 * cancelInForm - คลิกปุ่มยกเลิกในฟอร์ม
 */
async function cancelInForm(page) {
  await page.getByRole("button", { name: "ยกเลิก" }).click();
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
    firstName: "สมชาย",
    lastName: "สมสันต์",
    username: "somchai",
    email: "somchai@gmail.com",
    phone: "0811223344",
    password: "Somchai123",
    confirmPassword: "Somchai123",
    role: "ผู้ดูแลที่พัก",
  };

  /**
   * TS-CMB-02.1: Admin สร้างสมาชิกได้ เมื่อกรอกข้อมูลครบถ้วน
   */
  test("TS-CMB-02.1: Admin สร้างสมาชิกได้ เมื่อกรอกข้อมูลครบถ้วน", async ({
    page,
  }) => {
    await fillMemberForm(page, validData);
    await submitMemberForm(page);
    await expect(page.getByText("สร้างบัญชีสมาชิกสำเร็จ")).toBeVisible({
      timeout: 10000,
    });
  });

  /**
   * TS-CMB-02.2: Admin ไม่สามารถสร้างสมาชิกได้ เมื่อกรอกข้อมูลไม่ครบ
   */
  test("TS-CMB-02.2: Admin ไม่สามารถสร้างสมาชิกได้ เมื่อกรอกข้อมูลไม่ครบ", async ({
    page,
  }) => {
    await fillMemberForm(page, { ...validData, firstName: "" });
    await submitMemberForm(page);
    await verifyErrorMessage(page, "กรุณากรอกข้อมูลให้ครบถ้วน");
  });

  /**
   * TS-CMB-02.3: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อน ระบบไม่บันทึกข้อมูล
   */
  test('TS-CMB-02.3: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อน ระบบไม่บันทึกข้อมูล', async ({
    page,
  }) => {
    await fillMemberForm(page, { ...validData, lastName: "" });
    await clickCreateButtonOnly(page);

    // คลิกยกเลิกใน modal
    await cancelInModal(page);

    // ตรวจสอบว่ายังอยู่ในหน้าสร้างสมาชิก
    await expect(page).toHaveURL(/admin\/member\/create/);

    // ตรวจสอบว่า modal ปิดแล้ว
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  /**
   * TS-CMB-02.4: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าสร้างสมาชิก ระบบกลับไปยังหน้า "จัดการสมาชิก"
   */
  test('TS-CMB-02.4: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าสร้างสมาชิก ระบบกลับไปยังหน้า "จัดการสมาชิก"', async ({
    page,
  }) => {
    // กรอกข้อมูล (ครบหรือไม่ครบก็ได้)
    await fillMemberForm(page, validData);

    // คลิกยกเลิกในฟอร์ม
    await cancelInForm(page);

    // ตรวจสอบว่ากลับไปหน้าจัดการสมาชิก
    await expect(page).toHaveURL(/admin\/members/);
  });
});
