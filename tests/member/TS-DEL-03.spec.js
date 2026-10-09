import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageManagePackage } from "../../flows/member/PageManagePackage.flow";

test.describe("Member - Delete Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await goToPageManagePackage(page);
  });

  /**
   * TS-DEL-03.2
   * ตรวจสอบการกดยกเลิกในป็อปอัป
   */
  test("TS-DEL-03.2: Check if you pressed cancel in the pop-up.", async ({
    page,
  }) => {
    const packageName = "ทำผ้ามัดย้อม";

    const packageRow = page.getByRole("row", {
      name: new RegExp(packageName),
    });

    await packageRow.getByRole("button", { name: "ลบ" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(
      `คุณต้องการลบแพ็กเกจ "${packageName}" ใช่หรือไม่?`
    );

    await modal.getByRole("button", { name: "ยกเลิก" }).click();

    await expect(modal).toHaveCount(0);
    await expect(page).toHaveURL(/\/packages\/all/);
  });
});
