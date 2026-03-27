import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * ฟังก์ชันช่วยระบุกลุ่มตัวกรอง (Section)
 */
const getFilterGroup = (page, title) => {
  return page.locator('div').filter({ 
    has: page.getByRole('paragraph').filter({ hasText: title }) 
  }).last();
};

/**
 * ฟังก์ชันเปิดหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/admin\/packages\/all/);
}

/**
 * ฟังก์ชันเปิด Dialog ตัวกรอง
 */
async function openFilterDialog(page) {
  await page.getByRole("button", { name: "ตัวกรอง" }).click();
  await expect(page.getByRole('paragraph').filter({ hasText: /^สถานะแพ็กเกจ$/ })).toBeVisible();
}

/**
 * ฟังก์ชันตรวจสอบสถานะในตาราง (เวอร์ชันแก้ไขปัญหาค่าว่าง)
 */
async function verifyStatus(page, columnIndex, expectedStatus) {
  const cells = page.locator(`tbody tr td:nth-child(${columnIndex})`);
  
  // 1. รอให้แถวแรกเปลี่ยนเป็นค่าที่ต้องการ (Auto-retry) 
  // ขั้นตอนนี้จะช่วยรอจนกว่า API จะโหลดเสร็จและตาราง Render ใหม่
  if (expectedStatus !== "ทั้งหมด") {
    await expect(cells.first()).toHaveText(expectedStatus, { timeout: 10000 });
  } else {
    await expect(cells.first()).toBeVisible();
  }

  // 2. ดึงค่าข้อความทั้งหมดจากคอลัมน์นั้นออกมา
  const allTexts = await cells.allInnerTexts();
  
  // 3. กรองเอาเฉพาะแถวที่มีข้อความจริงๆ (ตัดค่าว่าง "" ที่เป็น Placeholder ของระบบออก)
  const filteredTexts = allTexts.map(t => t.trim()).filter(t => t !== "");

  // 4. ตรวจสอบความถูกต้อง
  if (expectedStatus === "ทั้งหมด") {
    expect(filteredTexts.length).toBeGreaterThan(0);
  } else {
    // ต้องมีอย่างน้อย 1 รายการที่แสดงผล
    expect(filteredTexts.length).toBeGreaterThan(0);
    // ทุกรายการที่เหลือต้องตรงกับสถานะที่เลือก
    for (const text of filteredTexts) {
      expect(text).toBe(expectedStatus);
    }
  }
}

test.describe("Admin - Sort Package", () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await goToManagePackagePage(page);
    await openFilterDialog(page);
  });

  // --- ส่วนที่ 1: สถานะแพ็กเกจ (คอลัมน์ 4) ---
  
  test("TS-DPK-02.1: กรองสถานะแพ็กเกจทั้งหมด", async ({ page }) => {
    const section = getFilterGroup(page, "สถานะแพ็กเกจ");
    await section.getByRole("radio", { name: "ทั้งหมด" }).click();
    await verifyStatus(page, 4, "ทั้งหมด");
  });

  test("TS-DPK-02.2: กรองสถานะแพ็กเกจเผยแพร่", async ({ page }) => {
    const section = getFilterGroup(page, "สถานะแพ็กเกจ");
    // exact: true เพื่อไม่ให้ซ้ำกับคำว่า "ไม่เผยแพร่"
    await section.getByRole("radio", { name: "เผยแพร่", exact: true }).click();
    await verifyStatus(page, 4, "เผยแพร่");
  });

  test("TS-DPK-02.3: กรองสถานะแพ็กเกจไม่เผยแพร่", async ({ page }) => {
    const section = getFilterGroup(page, "สถานะแพ็กเกจ");
    await section.getByRole("radio", { name: "ไม่เผยแพร่", exact: true }).click();
    await verifyStatus(page, 4, "ไม่เผยแพร่");
  });

  // --- ส่วนที่ 2: สถานะการอนุมัติ (คอลัมน์ 5) ---

  test("TS-DPK-02.4: กรองสถานะการอนุมัติทั้งหมด", async ({ page }) => {
    const section = getFilterGroup(page, "สถานะการอนุมัติ");
    await section.getByRole("radio", { name: "ทั้งหมด" }).click();
    await verifyStatus(page, 5, "ทั้งหมด");
  });

  test("TS-DPK-02.5: กรองสถานะการอนุมัติที่อนุมัติ", async ({ page }) => {
    const section = getFilterGroup(page, "สถานะการอนุมัติ");
    await section.getByRole("radio", { name: "อนุมัติ", exact: true }).click();
    await verifyStatus(page, 5, "อนุมัติ");
  });

  test("TS-DPK-02.7: กรองสถานะการอนุมัติที่ถูกปฏิเสธ", async ({ page }) => {
    const section = getFilterGroup(page, "สถานะการอนุมัติ");
    await section.getByRole("radio", { name: "ถูกปฏิเสธ", exact: true }).click();
    await verifyStatus(page, 5, "ถูกปฏิเสธ");
  });
});