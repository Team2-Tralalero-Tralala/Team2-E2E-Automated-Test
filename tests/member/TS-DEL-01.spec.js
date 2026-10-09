import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageManagePackage } from "../../flows/member/PageManagePackage.flow";

test.describe("Member - Delete Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
  });

  /**
   * TS-DEL-01.1
   * ตรวจสอบการเปิดหน้า “จัดการแพ็กเกจ”
   */
  test("TS-DEL-01.1: Check that the Manage Packages page is open.", async ({
    page,
  }) => {
    await goToPageManagePackage(page);
  });
});
