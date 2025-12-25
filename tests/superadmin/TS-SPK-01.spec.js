import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - ฟังก์ชันสำหรับไปยังหน้าจัดการแพ็กเกจ
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. ค้นหาเมนู "จัดการแพ็กเกจ" โดยใช้ role="link"
 *   2. คลิกเมนู "จัดการแพ็กเกจ"
 *   3. รอให้ URL เปลี่ยนไปยังหน้าจัดการแพ็กเกจ
 * Output:
 *   - browser จะแสดงหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/super\/packages\/all/);
}

/**
 * openFilterDialog - ฟังก์ชันสำหรับเปิด dialog ตัวกรอง
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. คลิกปุ่ม "ตัวกรอง"
 *   2. รอให้ dialog ปรากฏ
 * Output:
 *   - dialog ตัวกรองจะแสดงขึ้นมา
 */
async function openFilterDialog(page) {
  await page.getByRole("button", { name: /ทั้งหมด/ }).click();
  // รอให้ dialog เปิด
  await page.waitForTimeout(500);
}

/**
 * verifyTableHasPackages - ตรวจสอบว่าตารางมีข้อมูลแพ็กเกจ
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   - ตรวจสอบว่ามีตารางและมีแถวข้อมูล
 * Output:
 *   - assertion ว่าตารางแสดงผล
 */
async function verifyTableHasPackages(page) {
  const table = page.locator("table");
  await expect(table).toBeVisible();
  // ตรวจสอบว่ามีแถวข้อมูล (ไม่นับแถว header)
  const rows = page.locator("tbody tr");
  await expect(rows.first()).toBeVisible();
}

/**
 * verifyPublishStatus - ตรวจสอบสถานะแพ็กเกจในตาราง
 * Input:
 *   - page: Playwright Page object
 *   - expectedStatus: สถานะที่คาดหวัง ("เผยแพร่", "ไม่เผยแพร่", หรือ "ทั้งหมด")
 * Action:
 *   - ตรวจสอบว่าทุกแถวในตารางมีสถานะแพ็กเกจที่ถูกต้อง
 */
async function verifyPublishStatus(page, expectedStatus) {
  if (expectedStatus === "ทั้งหมด") {
    // ถ้าเป็น "ทั้งหมด" แค่ตรวจสอบว่ามีข้อมูล
    await verifyTableHasPackages(page);
    return;
  }

  // รอให้ตารางโหลดเสร็จ
  await page.waitForTimeout(1000);

  // ตรวจสอบว่าทุกแถวมีสถานะที่ถูกต้อง (คอลัมน์ที่ 5 คือสถานะแพ็กเกจ)
  const statusCells = page.locator("tbody tr td:nth-child(5)");
  const count = await statusCells.count();

  if (count > 0) {
    // ตรวจสอบว่าทุก cell มีสถานะที่ถูกต้อง
    for (let i = 0; i < count; i++) {
      const cellText = await statusCells.nth(i).textContent();
      expect(cellText?.trim()).toBe(expectedStatus);
    }
  }
}

/**
 * verifyApprovalStatus - ตรวจสอบสถานะการอนุมัติในตาราง
 * Input:
 *   - page: Playwright Page object
 *   - expectedStatus: สถานะที่คาดหวัง ("อนุมัติ", "รออนุมัติ", "ถูกปฏิเสธ", หรือ "ทั้งหมด")
 * Action:
 *   - ตรวจสอบว่าทุกแถวในตารางมีสถานะการอนุมัติที่ถูกต้อง
 */
async function verifyApprovalStatus(page, expectedStatus) {
  if (expectedStatus === "ทั้งหมด") {
    // ถ้าเป็น "ทั้งหมด" แค่ตรวจสอบว่ามีข้อมูล
    await verifyTableHasPackages(page);
    return;
  }

  // รอให้ตารางโหลดเสร็จ
  await page.waitForTimeout(1000);

  // ตรวจสอบว่าทุกแถวมีสถานะที่ถูกต้อง (คอลัมน์ที่ 6 คือสถานะการอนุมัติ)
  const statusCells = page.locator("tbody tr td:nth-child(6)");
  const count = await statusCells.count();

  if (count > 0) {
    // ตรวจสอบว่าทุก cell มีสถานะที่ถูกต้อง
    for (let i = 0; i < count; i++) {
      const cellText = await statusCells.nth(i).textContent();
      expect(cellText?.trim()).toBe(expectedStatus);
    }
  }
}

test.describe("SuperAdmin - Sort Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-SPK-01.1: กรองสถานะแพ็กเกจทั้งหมด
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะแพ็กเกจเป็น "ทั้งหมด"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจทั้งหมด
   */
  test("TS-SPK-01.1: กรองสถานะแพ็กเกจทั้งหมด", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะแพ็กเกจ "ทั้งหมด"
    const publishStatusSection = page
      .locator("text=สถานะแพ็กเกจ")
      .locator("..");
    await publishStatusSection.getByRole("button", { name: "ทั้งหมด" }).click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจทั้งหมด
    await verifyPublishStatus(page, "ทั้งหมด");
  });

  /**
   * TS-SPK-01.2: กรองสถานะแพ็กเกจเผยแพร่
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะแพ็กเกจเป็น "เผยแพร่"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจที่เผยแพร่
   */
  test("TS-SPK-01.2: กรองสถานะแพ็กเกจเผยแพร่", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะแพ็กเกจ "เผยแพร่"
    await page.getByRole("button", { name: "เผยแพร่" }).first().click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจที่เผยแพร่เท่านั้น
    await verifyPublishStatus(page, "เผยแพร่");
  });

  /**
   * TS-SPK-01.3: กรองสถานะแพ็กเกจไม่เผยแพร่
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะแพ็กเกจเป็น "ไม่เผยแพร่"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจที่ไม่เผยแพร่
   */
  test("TS-SPK-01.3: กรองสถานะแพ็กเกจไม่เผยแพร่", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะแพ็กเกจ "ไม่เผยแพร่"
    await page.getByRole("button", { name: "ไม่เผยแพร่" }).click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจที่ไม่เผยแพร่เท่านั้น
    await verifyPublishStatus(page, "ไม่เผยแพร่");
  });

  /**
   * TS-SPK-01.4: กรองสถานะการอนุมัติทั้งหมด
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะการอนุมัติเป็น "ทั้งหมด"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจทั้งหมด
   */
  test("TS-SPK-01.4: กรองสถานะการอนุมัติทั้งหมด", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะการอนุมัติ "ทั้งหมด"
    const approvalStatusSection = page
      .locator("text=สถานะการอนุมัติ")
      .locator("..");
    await approvalStatusSection
      .getByRole("button", { name: "ทั้งหมด" })
      .click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจทั้งหมด
    await verifyApprovalStatus(page, "ทั้งหมด");
  });

  /**
   * TS-SPK-01.5: กรองสถานะการอนุมัติที่อนุมัติ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะการอนุมัติเป็น "อนุมัติ"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจที่อนุมัติ
   */
  test("TS-SPK-01.5: กรองสถานะการอนุมัติที่อนุมัติ", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะการอนุมัติ "อนุมัติ"
    await page.getByRole("button", { name: "อนุมัติ" }).click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจที่อนุมัติเท่านั้น
    await verifyApprovalStatus(page, "อนุมัติ");
  });

  /**
   * TS-SPK-01.6: กรองสถานะการอนุมัติที่รออนุมัติ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะการอนุมัติเป็น "รออนุมัติ"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจที่รออนุมัติ
   */
  test("TS-SPK-01.6: กรองสถานะการอนุมัติที่รออนุมัติ", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะการอนุมัติ "รออนุมัติ"
    await page.getByRole("button", { name: "รออนุมัติ" }).click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจที่รออนุมัติเท่านั้น
    await verifyApprovalStatus(page, "รออนุมัติ");
  });

  /**
   * TS-SPK-01.7: กรองสถานะการอนุมัติที่ถูกปฏิเสธ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกตัวกรองสถานะการอนุมัติเป็น "ถูกปฏิเสธ"
   * 4. ตรวจสอบตารางแสดงแพ็กเกจที่ถูกปฏิเสธ
   */
  test("TS-SPK-01.7: กรองสถานะการอนุมัติที่ถูกปฏิเสธ", async ({ page }) => {
    await goToManagePackagePage(page);
    await openFilterDialog(page);

    // เลือกสถานะการอนุมัติ "ถูกปฏิเสธ"
    await page.getByRole("button", { name: "ถูกปฏิเสธ" }).click();

    // ตรวจสอบว่าตารางแสดงแพ็กเกจที่ถูกปฏิเสธเท่านั้น
    await verifyApprovalStatus(page, "ถูกปฏิเสธ");
  });
});
