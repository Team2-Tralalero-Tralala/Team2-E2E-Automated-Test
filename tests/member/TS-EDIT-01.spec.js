import { test } from "@playwright/test";
import { loginAs } from "../../utils/roles";
import { goToPageEditPackage } from "../../flows/member/PageEditPackage.flow";

test.describe("Member - Edit Package", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
  });

  /**
   * TS-EDIT-01.1
   * ตรวจสอบการเปิดหน้าแก้ไขแพ็กเกจของสมาชิก
   */
  test("TS-EDIT-01.1: Member can open edit package page", async ({ page }) => {
    const packageName = "เรียนรู้การจักสาน";
    await goToPageEditPackage(page, packageName);
  });
});
