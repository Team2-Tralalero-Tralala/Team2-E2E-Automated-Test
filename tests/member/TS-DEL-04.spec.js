import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageManagePackage } from "../../flows/member/PageManagePackage.flow";

test.describe("Member - Delete Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await goToPageManagePackage(page);
  });

  /**
   * TS-DEL-03.4
   * ตรวจสอบการกดยืนยันลบสำเร็จและแพ็กเกจหายจากตาราง
   */
  test("TS-DEL-03.4: Confirm delete and check package is removed", async ({
    page,
  }) => {
    const packageName = "สัมผัสวิถีประมงพื้นบ้าน";

    const packageRow = page.getByRole("row", { name: new RegExp(packageName) });
    await packageRow.getByRole("button", { name: "ลบ" }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(
      `คุณต้องการลบแพ็กเกจ "${packageName}" ใช่หรือไม่?`
    );

    await modal.getByRole("button", { name: "ยืนยันลบ" }).click();
    await expect(modal).toHaveCount(0);
    await expect(page).toHaveURL(/\/packages\/all/);
    await expect(
      page.getByRole("row", { name: new RegExp(packageName) })
    ).toHaveCount(0);
  });
});
