import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToLoginHistoryPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าประวัติการเข้าใช้งาน
 * Input: 
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 *   1. เลือกเมนู "ประวัติการเข้าใช้งาน"
 *   2. รอหน้าเปลี่ยน URL ไปยังหน้าประวัติการเข้าใช้งาน
 * Output:
 *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/logs
 */
async function goToLoginHistoryPage(page) {
  const historyLink = page.getByRole("link", { name: "ประวัติการเข้าใช้งาน" });
  await expect(historyLink).toBeVisible();
  await historyLink.click();

  // ตรวจสอบว่า URL เปลี่ยนไปยัง /super/logs
  await expect(page).toHaveURL(/\/super\/logs/);
}

test.describe("SuperAdmin - Login History", () => {
  test.beforeEach(async ({ page }) => {
    // Login เป็น SuperAdmin ก่อนทุกเทส
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-HTR-01.1
   * ตรวจสอบการเข้าถึงหน้าประวัติการเข้าใช้งาน
   */
  test("TS-HTR-01.1: SuperAdmin can access login history page", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const pageTitle = page.getByRole("heading", { name: "ประวัติการเข้าใช้งาน" });
    await expect(pageTitle).toBeVisible();

    const firstRow = page.getByRole("row").first();
    await expect(firstRow).toBeVisible();

  });

  /**
   * TS-HTR-01.2
   * กรองข้อมูลผู้ใช้งานตามบทบาท
   */
  test("TS-HTR-01.2: Filter login history by role", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const roles = [
      "ผู้ดูแลระบบ",
      "ผู้ดูแลชุมชน",
      "สมาชิก",
      "ผู้ใช้งานทั่วไป",
    ];

    const filterButton = page.locator(
      'button.flex.items-center.justify-between.w-40'
    );

    for (const role of roles) {
      await expect(filterButton).toBeVisible();
      await filterButton.click();

      const roleButton = page.getByRole("button", { name: role });
      await expect(roleButton).toBeVisible();
      await roleButton.click();

      await page.waitForLoadState("networkidle");

      await expect(filterButton).toHaveText(new RegExp(role));

      const headers = page.getByRole("columnheader");
      const headerCount = await headers.count();
      let roleColumnIndex = -1;

      for (let i = 0; i < headerCount; i++) {
        const text = (await headers.nth(i).innerText()).trim();
        if (text === "บทบาท") {
          roleColumnIndex = i;
          break;
        }
      }

      expect(roleColumnIndex).not.toBe(-1);

      const rows = page.locator("tbody tr");
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const cell = rows.nth(i).locator("td").nth(roleColumnIndex);
        await expect(cell).toHaveText(role);
      }
    }
  });

  /**
     * TS-HTR-01.3
     * กำหนดจำนวนแถวต่อหน้าเป็น 10 แถว
     */
  test("TS-HTR-01.3: Set rows per page to 10", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const rowsPerPageButton = page.locator(
      'button[aria-haspopup="listbox"]'
    );

    await expect(rowsPerPageButton).toBeVisible();
    await rowsPerPageButton.click();

    const option10 = page.getByRole("option", { name: "10" });
    await expect(option10).toBeVisible();
    await option10.click();

    await page.waitForLoadState("networkidle");

    await expect(rowsPerPageButton).toHaveText(/10/);

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    expect(rowCount).toBeLessThanOrEqual(10);

  });

  /**
   * TS-HTR-01.4
   * กำหนดจำนวนแถวต่อหน้าเป็น 30 แถว
   */
  test("TS-HTR-01.4: Set rows per page to 30", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const rowsPerPageButton = page.locator(
      'button[aria-haspopup="listbox"]'
    );

    await expect(rowsPerPageButton).toBeVisible();
    await rowsPerPageButton.click();

    const option30 = page.getByRole("option", { name: "30" });
    await expect(option30).toBeVisible();
    await option30.click();

    await page.waitForLoadState("networkidle");

    await expect(rowsPerPageButton).toHaveText(/30/);

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    expect(rowCount).toBeLessThanOrEqual(30);

  });

  /**
   * TS-HTR-01.5
   * ตรวจสอบ Pagination
   */
  test("TS-HTR-01.5: Pagination - go to next page", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();

    const firstRowTextPage1 = await rows.first().innerText();

    const nextPageButton = page
      .getByRole("button")
      .filter({ has: page.locator("svg") })
      .last();

    await expect(nextPageButton).toBeVisible();
    await expect(nextPageButton).toBeEnabled();

    await nextPageButton.click();

    await page.waitForLoadState("networkidle");

    await expect(rows.first()).toBeVisible();

    const firstRowTextPage2 = await rows.first().innerText();

    expect(firstRowTextPage2).not.toEqual(firstRowTextPage1);

  });

  /**
   * TS-HTR-01.6
   * ค้นหาผู้ใช้งานด้วยชื่อผู้ใช้
   */
  test("TS-HTR-01.6: Search login history by username", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const username = "wawazanoi11";

    const searchInput = page.getByPlaceholder("ค้นหา");
    await expect(searchInput).toBeVisible();

    await searchInput.fill(username);

    await page.waitForLoadState("networkidle");

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).innerText();
      expect(rowText).toContain(username);
    }

  });

  /**
   * TS-HTR-01.7
   * ค้นหาผู้ใช้งานด้วยอีเมล
   */
  test("TS-HTR-01.7: Search login history by email", async ({ page }) => {
    await goToLoginHistoryPage(page);

    const email = "superadmin_1@example.com";

    const searchInput = page.getByPlaceholder("ค้นหา");
    await expect(searchInput).toBeVisible();

    await searchInput.fill(email);

    await page.waitForLoadState("networkidle");

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).innerText();
      expect(rowText).toContain(email);
    }

  });
});
