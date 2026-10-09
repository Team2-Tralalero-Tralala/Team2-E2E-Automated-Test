import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageEditPackage } from "../../flows/member/PageEditPackage.flow";

test.describe("Member - Edit Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
  });

  /**
   * TS-EDIT-02.1
   * แก้ไขแพ็กเกจ → แสดง Confirm Modal → ยืนยัน → กลับหน้ารวม → ตรวจสอบชื่อในตาราง
   */
  test("TS-EDIT-02.1: Edit package and confirm save", async ({ page }) => {
    const updatedPackageName = "เรียนรู้การจักสานขั้นพื้นฐาน";

    await goToPageEditPackage(page, "เรียนรู้การจักสาน");

    await page.locator("#name").fill(updatedPackageName);

    await page
      .locator("#description")
      .fill(
        "เวิร์กช็อปเรียนรู้การจักสานจากวัสดุธรรมชาติ เหมาะสำหรับผู้เริ่มต้น"
      );
    await page.locator("#capacity").fill("10");
    await page.locator("#price").fill("1500");

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await expect(
      confirmModal.getByText("คุณต้องการบันทึกการแก้ไขแพ็กเกจนี้ใช่หรือไม่?")
    ).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();

    await expect(page).toHaveURL(/\/packages\/all/);

    const packageTable = page.locator("table");
    await expect(packageTable.getByText(updatedPackageName)).toBeVisible();
  });
});

