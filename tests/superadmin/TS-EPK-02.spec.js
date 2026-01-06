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
   * TS-EPK-02.1: Super Admin บันทึกข้อมูลแพ็กเกจได้ เมื่อกรอกข้อมูลครบ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน
   * 6. คลิกปุ่มข้อความ (Text Button) "บันทึกแพ็กเกจ"
   * 7. หน้างต่างแสดงผลซ้อนคลิกปุ่มข้อความ (Text Button) "ยืนยัน"
   */
  test("TS-EPK-02.1: Super Admin บันทึกข้อมูลแพ็กเกจได้   เมื่อกรอกข้อมูลครบ", async ({ page }) => {
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
   * TS-EPK-02.2: Super Admin ไม่สามารถ บันทึกข้อมูลแพ็กเกจได้ เมื่อกรอกข้อมูลไม่ครบ
   * ขั้นตอน:
   *  1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน
   * 6. คลิกปุ่มข้อความ (Text Button) "บันทึกแพ็กเกจ"
   * 7. หน้างต่างแสดงผลซ้อนคลิกปุ่มข้อความ (Text Button) "ยืนยัน"
   */
  test("TS-EPK-02.2: Super Admin ไม่สามารถ บันทึกข้อมูลแพ็กเกจได้ เมื่อกรอกข้อมูลไม่ครบ", async ({ page }) => {
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
   * TS-EPK-02.3: คลิกปุ่ม (Button) "ยกเลิก" ในหน้้าต่างแสดงผลซ้อนระบบไม่บันทึกข้อมูล
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน
   * 6. คลิกปุ่มข้อความ (Text Button) "บันทึกแพ็กเกจ"
   * 7. หน้างต่างแสดงผลซ้อนคลิกปุ่มข้อความ (Text Button) "ยกเลิก"
   */
  test("TS-EPK-02.3: คลิกปุ่ม (Button) \"ยกเลิก\" ในหน้้าต่างแสดงผลซ้อนระบบไม่บันทึกข้อมูล", async ({ page }) => {
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
  await page.getByRole('button', { name: 'ยกเลิก' }).click();
  });

  /**
   * TS-EPK-02.4: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าแก้ไขแพ็กเกจระบบกลับไปยังหน้า "จัดการแพ็กเกจ"
   * ขั้นตอน:
   *  1. เข้าสู่ระบบบัญชี Super Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. คลิกปุ่มไอคอน (Icon Button) "ดินสอ"
   * 4. ไปที่หน้า "แก้ไขแพ็กเกจ"
   * 5. กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน
   * 6. หน้างต่างแสดงผลซ้อนคลิกปุ่มข้อความ (Text Button) "ยกเลิก"
   */
  test("TS-EPK-02.4: คลิกปุ่ม (Button) \"ยกเลิก\" ในหน้าแก้ไขแพ็กเกจระบบกลับไปยังหน้า \"จัดการแพ็กเกจ\"", async ({ page }) => {
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
  await page.getByRole('button', { name: 'ยกเลิก' }).click();
  });

});
