import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("SuperAdmin - Create Account", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-APK-01
   * ค้นหาแพ็กเกจในคำขออนุมัติ
   */
  test("TS-APK-01.1: SuperAdmin search package on approval requests", async ({
    page,
  }) => {
    await page.goto("/super/package-requests");
    await expect(
      page.getByRole("heading", { name: /คำขออนุมัติ/i })
    ).toBeVisible();

    const searchBox = page
      .getByRole("textbox", { name: /ค้นหา/i })
      .or(page.getByPlaceholder(/ค้นหา/i));

    await expect(searchBox).toBeVisible();

    const keyword = "ทำอาหารพื้นบ้าน";
    await searchBox.fill(keyword);

    await searchBox.press("Enter");

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    await expect(
      table.getByRole("row", { name: new RegExp(keyword, "i") }).first()
    ).toBeVisible({ timeout: 15000 });

    await page.waitForTimeout(5000);
  });
});
