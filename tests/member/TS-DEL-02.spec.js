import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageManagePackage } from "../../flows/member/PageManagePackage.flow";

test.describe("Member - Delete Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await goToPageManagePackage(page);
  });

  /**
   * TS-DEL-02.2
   * ตรวจสอบการแสดง Modal ยืนยันการลบแพ็กเกจ
   */
  test("TS-DEL-02.2: Should show delete confirmation modal when clicking delete icon", async ({
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
  });
});
