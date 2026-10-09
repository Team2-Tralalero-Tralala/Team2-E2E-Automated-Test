import { expect } from "@playwright/test";

/**
 * goToPageEditPackage
 *
 * ฟังก์ชันนี้ใช้สำหรับนำผู้ใช้ (member)
 * ไปยังหน้า "แก้ไขรายละเอียดแพ็กเกจ" ของแพ็กเกจที่เลือก
 *
 * Flow การทำงาน:
 * 1. คลิกเมนู Sidebar "จัดการแพ็กเกจ"
 * 2. ตรวจสอบว่าเข้าสู่หน้าแสดงรายการแพ็กเกจทั้งหมดแล้ว
 * 3. ค้นหาแถวของแพ็กเกจจากชื่อตามที่ส่งมา
 * 4. คลิกชื่อแพ็กเกจเพื่อเข้าสู่หน้า Package Detail
 * 5. ตรวจสอบว่า URL และชื่อแพ็กเกจในหน้า Detail ถูกต้อง
 * 6. คลิกปุ่ม "แก้ไขรายละเอียดแพ็กเกจ"
 * 7. ตรวจสอบว่า URL เปลี่ยนเป็นหน้า Edit Package สำเร็จ
 *
 * หมายเหตุ:
 * - ระบบเป็น SPA (Single Page Application)
 * - การเปลี่ยนหน้าเกิดจาก client-side routing
 * - ใช้ expect(page).toHaveURL() แทน waitForURL()
 *
 * @param {import('@playwright/test').Page} page - Playwright page instance
 * @param {string} packageName - ชื่อแพ็กเกจที่ต้องการแก้ไข
 */
export async function goToPageEditPackage(page, packageName) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/\/packages\/all/);

  const packageRow = page.locator("tr").filter({ hasText: packageName });
  await expect(packageRow).toHaveCount(1);

  const packageNameCell = packageRow.getByText(packageName, { exact: false });
  await expect(packageNameCell).toBeVisible();
  await packageNameCell.click();

  await expect(page).toHaveURL(/\/member\/package\/\d+$/);
  await expect(page.getByText(packageName, { exact: false })).toBeVisible();

  const editButton = page.getByRole("button", {
    name: "แก้ไขรายละเอียดแพ็กเกจ",
  });

  await expect(editButton).toBeVisible();
  await expect(editButton).toBeEnabled();
  await editButton.click();
  await expect(page).toHaveURL(/\/member\/package\/\d+\/edit$/);
}

