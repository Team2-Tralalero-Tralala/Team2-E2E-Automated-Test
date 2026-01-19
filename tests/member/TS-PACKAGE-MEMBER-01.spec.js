import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToCreatePackagePage - Navigates to the Create Package page
 */
async function goToCreatePackagePage(page) {
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/member\/packages\/all/);
  await page.getByRole("button", { name: "เพิ่มแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/member\/package\/create/);
}

/**
 * fillPackageForm - Fills the package creation form
 */
async function fillPackageForm(page, data) {
  if (data.name) await page.locator("#name").fill(data.name);

  if (data.description)
    await page.locator("#description").fill(data.description);

  if (data.province) {
    await page.locator("#province").fill(data.province);
    await page.getByRole("option").first().waitFor();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  if (data.price) await page.locator("#price").fill(data.price.toString());
}

test.describe("Member - create packages draft", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await goToCreatePackagePage(page);
  });

  /**
   * TS-PACKAGE-MEMBER-01.1: ทดสอบกดปุ่ม “บันทึกฉบับร่าง” เพื่อเก็บข้อมูลไว้แก้ไขภายหลัง
   */
  test("TS-PACKAGE-MEMBER-01.1: ทดสอบกดปุ่ม “บันทึกฉบับร่าง” เพื่อเก็บข้อมูลไว้แก้ไขภายหลัง", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "ฉบับร่าง" }).click();
    await page.getByRole("button", { name: "ฉบับร่าง" }).nth(1).click();
    const draftData = {
      name: "แพ็กเกจทดสอบฉบับร่าง",
      description: "คำอธิบายสำหรับแพ็กเกจทดสอบฉบับร่าง",
      price: "1500",
      province: "เชียงใหม่",
    };
    await fillPackageForm(page, draftData);

    await page.getByRole("button", { name: "สร้างแพ็กเกจ" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /ยืนยัน/i })
      .click();

    await page.goto("/member/packages/draft");
    await expect(page).toHaveURL(/member\/packages\/draft/);

    const newPackageRow = page.getByRole("row", { name: draftData.name });
    await expect(newPackageRow).toBeVisible();
    await expect(newPackageRow).toContainText("ฉบับร่าง");
  });
});
