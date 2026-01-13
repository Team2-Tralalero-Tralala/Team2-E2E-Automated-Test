import { expect } from "@playwright/test";

/**
 * goToPageEditPackage
 *
 * ใช้สำหรับนำผู้ใช้ไปยังหน้า "จัดการแพ็กเกจทั้งหมด"
 * ผ่านเมนู Sidebar ของระบบ
 *
 * ลำดับการทำงาน:
 * 1. คลิกเมนู Sidebar ชื่อ "จัดการแพ็กเกจ"
 * 2. ตรวจสอบว่าเปลี่ยนหน้าไปยัง URL ของหน้าแสดงแพ็กเกจทั้งหมดสำเร็จ
 *
 * หมายเหตุ:
 * - ระบบเป็น SPA (Single Page Application)
 * - การเปลี่ยนหน้าใช้ client-side routing
 * - ใช้ expect(page).toHaveURL() เพื่อยืนยันการเปลี่ยนหน้า
 *   แทนการใช้ waitForURL()
 *
 * @param {import('@playwright/test').Page} page
 *        Playwright page instance
 */
export async function goToPageManagePackage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/\/packages\/all/);
}




