import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManageMemberPage - ไปยังหน้าจัดการสมาชิก
 */
async function goToManageMemberPage(page) {
  await page.getByRole("link", { name: "จัดการสมาชิก" }).click();
  await expect(page).toHaveURL(/admin\/members/);
}
async function submitForm(page) {
  await page.getByRole("button", { name: "บันทีก" }).click();

  const confirmBtn = page
    .getByRole("dialog")
    .getByRole("button", { name: /ยืนยัน/i });
  await confirmBtn.click();
}
test.describe("admin - Edit Activity Role Member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToManageMemberPage(page);
    await expect(page).toHaveURL(/admin\/members/);
  });

  /**
   * TS-EMT-01.1: กรอกบทบาทวิสาหกิจ
   */
  test("TS-EMT-01.1: กรอกบทบาทวิสาหกิจ", async ({ page }) => {
    await page
      .getByRole("row", { name: "แดง ชาติ" })
      .getByLabel("แก้ไข")
      .click();
    await submitMemberForm(page);
    await page
      .getByRole("textbox", { name: "บทบาทในชุมชน *" })
      .fill(" มัคคุเทศนก์");
    await submitForm(page);
    await expect(page.getByText("มัคคุเทศนก์")).toBeVisible();
  });
  /**
   * TS-EMT-01.2:ไม่กรอกบทบาทวิสาหกิจ
   */
  test("TS-EMT-01.2:ไม่กรอกบทบาทวิสาหกิจ", async ({ page }) => {
    await page
      .getByRole("row", { name: "แดง ชาติ" })
      .getByLabel("แก้ไข")
      .click();
    await submitMemberForm(page);
    await page.getByRole("textbox", { name: "บทบาทในชุมชน *" }).fill(" ");
    await submitForm(page);
    await expect(page.getByText("มัคคุเทศนก์")).not.toBeVisible();
  });
});
