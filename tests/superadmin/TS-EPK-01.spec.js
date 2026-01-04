import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";
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
   * TS-EPK-01.1: แก้ไขข้อมูลสำเร็จ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน
   */
  test("TS-EPK-01.1: แก้ไขข้อมูลสำเร็จ", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });

  /**
   * TS-EPK-01.2: ไม่กรอกชื่อแพ็กเกจ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. แก้ไขข้อมูลครบถ้วนแต่ไม่กรอกชื่อแพ็กเกจ
   */
  test("TS-EPK-01.2: ไม่กรอกชื่อแพ็กเกจ", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });

  /**
   * TS-EPK-01.3: แก้ไขข้อมูลสำเร็จ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. แก้ไขข้อมูลครบถ้วนแต่ไม่กรอกคำอธิบายแพ็กเกจ
   */
  test("TS-EPK-01.3: ไม่กรอกคำอธิบายแพ็กเกจ", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });

  /**
   * TS-EPK-01.4: กรอกข้อมูลที่อยู่ครบถ้วน
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่อยู่ครบถ้วน
   */
  test("TS-EPK-01.4: กรอกข้อมูลที่อยู่ครบถ้วน", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
/**
   * TS-EPK-01.5: กรอกข้อมูลที่อยู่ไม่ครบถ้วนหลายจุด
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่อยู่ไม่ครบถ้วน
   */
  test("TS-EPK-01.5: กรอกข้อมูลที่อยู่ไม่ครบถ้วนหลายจุด", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).fill('');
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).fill('');
  await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('');
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
/**
   * TS-EPK-01.6: ปักหมุดหากไม่พบวิสาหกิจชุมชน
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 6. เลื่อนแผนที่ไปยังตำแหน่งวิสาหกิจชุมชน
   * 7. คลิกปุ่มข้อความ (Text Button) "ปักหมุด"
   */
  test("TS-EPK-01.6: ปักหมุดหากไม่พบวิสาหกิจชุมชน", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).fill('');
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).fill('');
  await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('');
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
  await page.getByRole('button', { name: 'Marker' }).click();
  await page.getByText('ตำแหน่งที่เลือก×+− Leaflet').click();
  await page.getByText('ปักหมุด', { exact: true }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
  /**
   * TS-EPK-01.7: ไม่กรอกผู้ดูแลแพ็กเกจ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. แก้ไขข้อมูลครบถ้วนแต่ไม่กรอกผู้ดูแลแพ็กเกจ
   */
  test("TS-EPK-01.7: ไม่กรอกผู้ดูแลแพ็กเกจ", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
/**
   * TS-EPK-01.8: ไม่กรอกจำนวนที่เปิดรับแพ็กเกจ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. แก้ไขข้อมูลครบถ้วนแต่ไม่กรอกจำนวนที่เปิดรับแพ็กเกจ
   */
  test("TS-EPK-01.8: ไม่กรอกจำนวนที่เปิดรับแพ็กเกจ", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
/**
   * TS-EPK-01.9: เพิ่มแท็ก
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. เพิ่มแท็ก
   */
  test("TS-EPK-01.9: เพิ่มแท็ก", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
  await page.getByRole('option', { name: 'Tag-6-Nature' }).click();
  await page.keyboard.press("Escape");
  
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
/**
   * TS-EPK-01.10: ลบแท็ก
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. ลบแท็ก
   */
  test("TS-EPK-01.10: ลบแท็ก", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
  await page.getByRole('option', { name: 'Tag-6-Nature' }).click();
  await page.keyboard.press("Escape");
  await page.getByRole('button', { name: '✕' }).nth(1).click();
  
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
  /**
   * TS-EPK-01.11: ไม่กรอกราคาแพ็กเกจ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. แก้ไขข้อมูลครบถ้วนแต่ไม่กรอกราคาแพ็กเกจ
   */
  test("TS-EPK-01.11: ไม่กรอกราคาแพ็กเกจ", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
  await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
  await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('');
  await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
  /**
   * TS-EPK-01.12: อัพโหลดภาพหน้าปกไฟล์ถูกต้อง
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. อัพโหลดภาพหน้าปกไฟล์ถูกต้อง
   */
  test("TS-EPK-01.12: อัพโหลดภาพหน้าปกไฟล์ถูกต้อง", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
   const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");
    const coverArea = page.locator('div').filter({ hasText: /^อัพโหลดภาพหน้าปก/ }).last();

    // 1. ล้างรูปเดิม (ถ้ามี)
    const coverDeleteBtn = coverArea.locator('button'); 
    if (await coverDeleteBtn.isVisible()) {
        await coverDeleteBtn.first().click();
        await expect(coverArea).toContainText("0 / 1");
    }

    // 2. อัปโหลดรูปใหม่ (ใช้ฟังก์ชันดักจับที่ฉลาดขึ้น ไม่ให้ค้าง)
    // เราจะใช้หน้าต่างเลือกไฟล์เฉพาะตอนที่มันเด้งขึ้นมาจริงๆ เท่านั้น
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);
    
    const fileChooser = await fileChooserPromise;
    if (fileChooser) await fileChooser.setFiles(imagePath);

    // เช็คว่ารูปขึ้นแล้ว (ปุ่ม x ปรากฏ)
    await expect(coverArea.locator('button')).toBeVisible({ timeout: 10000 });

    // --- ส่วนที่สำคัญมาก: ต้องกรอกราคาด้วย ปุ่มบันทึกถึงจะทำงานสมบูรณ์ ---
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');

    // 3. กดบันทึก
    // ใช้ scrollIntoViewIfNeeded เพื่อให้แน่ใจว่าจอเลื่อนลงมาเห็นปุ่ม
    const saveBtn = page.getByRole('button', { name: 'บันทึก' });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();

    // กดยืนยันใน Dialog
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
   /**
   * TS-EPK-01.13: อัพโหลดไฟล์เกินขนาด
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. อัพโหลดโลโก้ไฟล์ที่ต้องการแก้ไขเกินขนาด
   */
  test("TS-EPK-01.13: อัพโหลดไฟล์เกินขนาด", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
   const imagePath = path.join(process.cwd(), "assets/photo/OVER.jpg");
    const coverArea = page.locator('div').filter({ hasText: /^อัพโหลดภาพหน้าปก/ }).last();

    // 1. ล้างรูปเดิม (ถ้ามี)
    const coverDeleteBtn = coverArea.locator('button'); 
    if (await coverDeleteBtn.isVisible()) {
        await coverDeleteBtn.first().click();
        await expect(coverArea).toContainText("0 / 1");
    }

    // 2. อัปโหลดรูปใหม่ (ใช้ฟังก์ชันดักจับที่ฉลาดขึ้น ไม่ให้ค้าง)
    // เราจะใช้หน้าต่างเลือกไฟล์เฉพาะตอนที่มันเด้งขึ้นมาจริงๆ เท่านั้น
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);
    
    const fileChooser = await fileChooserPromise;
    if (fileChooser) await fileChooser.setFiles(imagePath);

    // เช็คว่ารูปขึ้นแล้ว (ปุ่ม x ปรากฏ)
    await expect(coverArea.locator('button')).toBeVisible({ timeout: 10000 });

    // --- ส่วนที่สำคัญมาก: ต้องกรอกราคาด้วย ปุ่มบันทึกถึงจะทำงานสมบูรณ์ ---
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');

    // 3. กดบันทึก
    // ใช้ scrollIntoViewIfNeeded เพื่อให้แน่ใจว่าจอเลื่อนลงมาเห็นปุ่ม
    const saveBtn = page.getByRole('button', { name: 'บันทึก' });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();

    // กดยืนยันใน Dialog
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
  /**
   * TS-EPK-01.14: อัพโหลดไฟล์ที่ไม่ใช่ (JPG/PNG)
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. อัพโหลดโลโก้ไฟล์ PDF
   */
  test("TS-EPK-01.14: อัพโหลดไฟล์ที่ไม่ใช่ (JPG/PNG)", async ({ page }) => {
    await goToManagePackagePage(page);
  await page.getByRole('row', { name: 'พายเรือ วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส ธนกร สุขใจ เผยแพร่ อนุม' }).getByLabel('แก้ไข').click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('พายเรือ');
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('พายเรือตามแม่น้ำ');
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
  await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
  await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
  await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('6');
  await page.getByRole('button', { name: 'Open' }).first().click();
  await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชลบุรี');
  await page.locator('#province-listbox').click();
  await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
  await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
  await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
  await page.getByRole('option', { name: 'แสนสุข' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
  await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('วงเวียนบางแสน');
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
  await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
 await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
  await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).fill('ธนกร สุขใจ');
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
  await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
  await page.getByRole('button', { name: '✕' }).click();
  await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
     await page.getByRole('option', { name: 'Tag-5-Relax' }).click();
    await page.keyboard.press("Escape");
   const imagePath = path.join(process.cwd(), "assets/photo/pdf.pdf");
    const coverArea = page.locator('div').filter({ hasText: /^อัพโหลดภาพหน้าปก/ }).last();

    // 1. ล้างรูปเดิม (ถ้ามี)
    const coverDeleteBtn = coverArea.locator('button'); 
    if (await coverDeleteBtn.isVisible()) {
        await coverDeleteBtn.first().click();
        await expect(coverArea).toContainText("0 / 1");
    }

    // 2. อัปโหลดรูปใหม่ (ใช้ฟังก์ชันดักจับที่ฉลาดขึ้น ไม่ให้ค้าง)
    // เราจะใช้หน้าต่างเลือกไฟล์เฉพาะตอนที่มันเด้งขึ้นมาจริงๆ เท่านั้น
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null);
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);
    
    const fileChooser = await fileChooserPromise;
    if (fileChooser) await fileChooser.setFiles(imagePath);

    // เช็คว่ารูปขึ้นแล้ว (ปุ่ม x ปรากฏ)
    await expect(coverArea.locator('button')).toBeVisible({ timeout: 10000 });

    // --- ส่วนที่สำคัญมาก: ต้องกรอกราคาด้วย ปุ่มบันทึกถึงจะทำงานสมบูรณ์ ---
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('4500');

    // 3. กดบันทึก
    // ใช้ scrollIntoViewIfNeeded เพื่อให้แน่ใจว่าจอเลื่อนลงมาเห็นปุ่ม
    const saveBtn = page.getByRole('button', { name: 'บันทึก' });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();

    // กดยืนยันใน Dialog
    await page.getByRole('button', { name: 'ยืนยัน' }).click();
  });
});
