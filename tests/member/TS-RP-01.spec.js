import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Refund Requests", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member1");
    await expect(page).toHaveURL(/member\/home/);
  });

  /**
   * TC-RP-01.1
   * สมาชิกกดดูหน้ารายงานและสถิติ
   */
  test("TC-RP-01.1: Open DashBoards ", async ({ page }) => {
    await page.getByRole("link", { name: "รายงาน" }).click();
    await expect(
      page.getByRole("heading", { name: /รายงานและสถิติ/i }),
    ).toBeVisible({ timeout: 15000 });
  });
});
