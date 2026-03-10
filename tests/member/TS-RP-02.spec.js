import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * assertStatCard
 * ตรวจสอบการ์ดสถิติ 1 ใบว่ามี label, ค่าเป็นตัวเลข และหน่วยแสดงอยู่ในกรอบเดียวกัน
 * Assertion:
 *  - label ต้องมองเห็นได้ เช่น แพ็กเกจทั้งหมด
 *  - ต้องมีค่าตัวเลขอย่างน้อย 1 ค่า
 *  - ต้องมีหน่วยแสดงคู่กับตัวเลข เช่น แพ็กเกจ, บาท, ครั้ง
 */
async function assertStatCard(page, label, unit) {
  const labelEl = page.getByText(label, { exact: true });
  await expect(labelEl).toBeVisible();

  const card = labelEl.locator("..");
  await expect(card.getByText(/\b\d{1,3}(?:,\d{3})*\b/)).toBeVisible();
  await expect(card.getByText(unit, { exact: true })).toBeVisible();
}

test.describe("Member - Refund Requests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await expect(page).toHaveURL(/member\/community\/own/);
  });

  /**
   * TS-RP-02.1
   * แสดงจำนวนการจองแพ็กเกจและสถานะทั้งหมด
   * Steps:
   *  1) Login Member
   *  2) ไปที่หน้า “รายงาน”
   *  3) ตรวจสอบว่ามีการแสดง “จำนวนการจอง” + “สถานะ” และมีตัวเลขประกอบ
   */
  test("TS-RP-02.1: Show booking counts and all statuses", async ({ page }) => {
    await page.getByRole("link", { name: /^รายงาน$/ }).click();

    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByText("สถิติการจองแพ็กเกจ")).toBeVisible({
      timeout: 15000,
    });

    await assertStatCard(page, "แพ็กเกจทั้งหมด", "แพ็กเกจ");
    await assertStatCard(page, "รายได้ทั้งหมด", "บาท");
    await assertStatCard(page, "การจองสำเร็จ", "ครั้ง");
    await assertStatCard(page, "ยกเลิกการจอง", "ครั้ง");
  });
});
