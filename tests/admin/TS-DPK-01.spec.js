import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - ฟังก์ชันสำหรับไปยังหน้าจัดการแพ็กเกจ
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. คลิกเมนู "จัดการแพ็กเกจ"
 *   2. รอให้ URL เปลี่ยนไปยังหน้าจัดการแพ็กเกจ
 * Output:
 *   - browser จะแสดงหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/admin\/packages\/all/);
}

/**
 * searchPackage - ฟังก์ชันสำหรับค้นหาแพ็กเกจ
 * Input:
 *   - page: Playwright Page object
 *   - searchTerm: คำค้นหา
 * Action:
 *   1. กรอกคำค้นหาในช่องค้นหา
 *   2. รอให้ตารางอัปเดตผลการค้นหา
 * Output:
 *   - ตารางจะแสดงเฉพาะแพ็กเกจที่ตรงกับคำค้นหา
 */
async function searchPackage(page, searchTerm) {
  const searchInput = page.getByRole("textbox", { name: /ค้นหา/ });
  await searchInput.fill(searchTerm);
  // รอให้ตารางอัปเดตหลังจากค้นหา
  await page.waitForTimeout(1000);
}

/**
 * verifySearchResults - ตรวจสอบผลการค้นหา
 * Input:
 *   - page: Playwright Page object
 *   - searchTerm: คำค้นหาที่ใช้
 * Action:
 *   - ตรวจสอบว่าทุกแถวในตารางมีข้อมูลที่ตรงกับคำค้นหา (ค้นหาได้จากทุกคอลัมน์)
 * Output:
 *   - assertion ว่าผลการค้นหาถูกต้อง
 */
async function verifySearchResults(page, searchTerm) {
  // ตรวจสอบว่ามีตาราง
  const table = page.locator("table");
  await expect(table).toBeVisible();

  // ดึงแถวที่มีข้อมูล (แถวที่มีปุ่มในคอลัมน์ชื่อแพ็กเกจ)
  const dataRows = page.locator("tbody tr:has(td:nth-child(2) button)");
  const count = await dataRows.count();

  // ต้องมีอย่างน้อย 1 ผลลัพธ์
  expect(count).toBeGreaterThan(0);

  const search = searchTerm.toLowerCase();

  // ตรวจสอบทุกแถวว่ามีคำค้นหาอยู่ในคอลัมน์ใดคอลัมน์หนึ่ง
  for (let i = 0; i < count; i++) {
    const row = dataRows.nth(i);
    const rowText = await row.textContent();
    const rowContent = rowText?.trim().toLowerCase() || "";

    // ตรวจสอบว่าแถวนี้มีคำค้นหาอยู่หรือไม่
    // (สามารถค้นหาจาก: ชื่อแพ็กเกจ, ชื่อชุมชน, ผู้ดูแล, สถานะแพ็กเกจ, สถานะการอนุมัติ)
    expect(rowContent).toContain(search);
  }
}

test.describe("Admin - Search Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    // ตรวจสอบว่าหลังจาก login แล้วไปยังหน้า dashboard ของ admin (ตามที่กำหนดใน roles.js) -> /admin/community/own
    // หรือถ้า roles.js ตรวจสอบแล้ว ก็ไม่ต้องตรวจสอบซ้ำ แต่ถ้าจะตรวจสอบต้องให้ตรงกัน
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-DPK-01.1: ค้นหาแพ็กเกจ
   * ขั้นตอน:
   * 1. เข้าสู่ระบบบัญชี Admin
   * 2. คลิกที่เมนู "จัดการแพ็กเกจ"
   * 3. เลือกช่องค้นหา
   * 4. ค้นหาแพ็กเกจ
   * 5. ตรวจสอบตารางแสดงแพ็กเกจที่ถูกค้นหา
   */
  test("TS-DPK-01.1: ค้นหาแพ็กเกจ", async ({ page }) => {
    await goToManagePackagePage(page);

    // ค้นหาแพ็กเกจด้วยคำว่า "ทำ"
    const searchTerm = "ทำ";
    await searchPackage(page, searchTerm);

    // ตรวจสอบว่าผลการค้นหาแสดงเฉพาะแพ็กเกจที่มีคำว่า "ทำ"
    await verifySearchResults(page, searchTerm);

    // ตรวจสอบว่ายัง อยู่ในหน้าจัดการแพ็กเกจ
    await expect(page).toHaveURL(/admin\/packages\/all/);
  });
});
