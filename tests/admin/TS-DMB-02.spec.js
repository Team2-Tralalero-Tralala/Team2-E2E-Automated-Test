import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManageMemberPage - ไปยังหน้าจัดการสมาชิก
 */
async function goToManageMemberPage(page) {
  await page.getByRole("link", { name: "จัดการสมาชิก" }).click();
  await expect(page).toHaveURL(/admin\/members/);
}
const nameTestFile = "แดง ชาติ";

test.describe("admin - Delete Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToManageMemberPage(page);
    await expect(page).toHaveURL(/admin\/members/);
  });

  /**
   * TS-DMB-02.1: ผู้ใช้งานบัญชี Admin ต้องสามารถลบสมาชิกได้
   */
  test('TS-DMB-02.1: คลิกปุ่มไอคอน (Icon Button) "ถังขยะ" ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal) ', async ({
    page,
  }) => {
    await page
      .getByRole("row", { name: nameTestFile })
      .getByLabel("ลบ")
      .click();
    await expect(
      page.getByRole("dialog").getByText("ยืนยันการลบบัญชีสมาชิก")
    ).toBeVisible();
    await expect(
      page
        .getByRole("dialog")
        .getByText("คุณต้องการยืนยันการลบบัญชีสมาชิกหรือไม่")
    ).toBeVisible();
  });
  /**
   * TS-DMB-02.2: คลิกปุ่ม (Button) "ยืนยัน" ในหน้าต่างแสดงผลซ้อน (Modal) สมาชิกจะถูกลบ
   */
  test('TS-DMB-02.2: คลิกปุ่ม (Button) "ยืนยัน" ในหน้าต่างแสดงผลซ้อน (Modal) สมาชิกจะถูกลบ', async ({
    page,
  }) => {
    await page
      .getByRole("row", { name: nameTestFile })
      .getByLabel("ลบ")
      .click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page.getByText(nameTestFile)).not.toBeVisible();
  });
  /**
   * TS-DMB-02.3: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อน (Modal) สมาชิกจะไม่ถูกลบ
   */
  test('TS-DMB-02.3: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อน (Modal) สมาชิกจะไม่ถูกลบ', async ({
    page,
  }) => {
    await page
      .getByRole("row", { name: nameTestFile })
      .getByLabel("ลบ")
      .click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(page.getByRole("row", { name: nameTestFile })).toBeVisible();
  });
});
