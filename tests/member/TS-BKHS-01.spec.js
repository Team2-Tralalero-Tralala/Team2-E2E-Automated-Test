import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Member - Booking History Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
  });

  /**
   * TC-PKHS-01.1: ตรวจสอบว่าสมาชิกเข้าไปดูหน้าประวัติประวัติการจองได้
   * ขั้นตอน:
   * 1. เข้าระบบด้วยบัญชีสมาชิก (Member)
   * 2. คลิกเมนู “ประวัติการจอง”
   */
  test("TC-PKHS-01.1: Verify navigation to Booking History page", async ({
    page,
  }) => {
    // Navigate to Booking History
    // Navigate to Booking History
    // 1. Click "Manage Booking" (จัดการการจอง) to expand/access menu
    await page
      .getByRole("link", { name: "จัดการการจอง" })
      .or(page.getByRole("button", { name: "จัดการการจอง" }))
      .click();

    // 2. Click "Booking History" (ประวัติการจอง)
    const historyLink = page
      .getByRole("link", { name: "ประวัติการจอง" })
      .or(page.getByRole("button", { name: "ประวัติการจอง" }));
    await expect(historyLink).toBeVisible();
    await historyLink.click();

    // Verify URL
    await expect(page).toHaveURL(/member\/bookings-histories/);

    // Verify Header
    await expect(
      page.getByRole("heading", { name: "ประวัติการจอง" }),
    ).toBeVisible();
  });

  /**
   * TC-PKHS-01.2: ค้นหาประวัติการจองตามชื่อกิจกรรรมหรือผู้จองได้
   * ขั้นตอน:
   * 1. พิมพ์ชื่อกิจกรรมหรือผู้จองในช่องค้นหา
   */
  test("TC-PKHS-01.2: Search booking history", async ({ page }) => {
    // Navigate via UI to ensure state consistency
    await page
      .getByRole("link", { name: "จัดการการจอง" })
      .or(page.getByRole("button", { name: "จัดการการจอง" }))
      .click();
    const historyLink = page
      .getByRole("link", { name: "ประวัติการจอง" })
      .or(page.getByRole("button", { name: "ประวัติการจอง" }));
    await expect(historyLink).toBeVisible();
    await historyLink.click();
    await expect(page).toHaveURL(/member\/bookings-histories/);
    await page.waitForLoadState("networkidle");

    // Ensure visible rows exist before searching
    const originalRows = page.locator("tbody tr");
    await expect(originalRows.first()).toBeVisible();

    // Pick a text from the first row to search for (e.g., User name or Activity name)
    // Column 1 = Booker Name, Column 2 = Activity Name
    const firstRowName = await originalRows
      .first()
      .locator("td")
      .nth(0)
      .innerText();
    const keyword = firstRowName.trim();
    console.log(`Searching for keyword: ${keyword}`);

    // Type in Search Box
    const searchBox = page.getByPlaceholder("ค้นหา");
    await expect(searchBox).toBeVisible();
    await searchBox.fill(keyword);

    // Wait for filter results
    await page.waitForTimeout(1000); // Wait for debounce/api

    // Verify results contain the keyword
    const filteredRows = page.locator("tbody tr");
    await expect(filteredRows.first()).toBeVisible();
    await expect(filteredRows.first()).toContainText(keyword);
  });

  /**
   * TC-PKHS-01.3: ตรวจสอบการแสดงรายการประวัติการจอง
   * ขั้นตอน:
   * 1. เปิดหน้า “ประวัติการจอง”
   * 2. ตรวจสอบตารางแสดงรายการ
   */
  test("TC-PKHS-01.3: Verify booking history table display", async ({
    page,
  }) => {
    // Navigate via UI
    await page
      .getByRole("link", { name: "จัดการการจอง" })
      .or(page.getByRole("button", { name: "จัดการการจอง" }))
      .click();
    const historyLink = page
      .getByRole("link", { name: "ประวัติการจอง" })
      .or(page.getByRole("button", { name: "ประวัติการจอง" }));
    await historyLink.click();
    await expect(page).toHaveURL(/member\/bookings-histories/);
    await page.waitForLoadState("networkidle");

    // Check Table Headers
    const headers = [
      "ชื่อผู้จอง",
      "ชื่อกิจกรรม",
      "ราคา",
      "สถานะ",
      "หลักฐาน",
      "เวลา",
    ];
    for (const header of headers) {
      await expect(
        page.getByRole("columnheader", { name: header }),
      ).toBeVisible();
    }

    // Check at least one row exists
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  /**
   * TC-PKHS-01.4: กรองสถานะการจอง
   * ขั้นตอน:
   * 1. คลิกปุ่ม “ตัวกรองสถานะ” (หรือ dropdown)
   * 2. เลือก “จองสำเร็จ” (Success)
   */
  test("TC-PKHS-01.4: Filter booking status (Success)", async ({ page }) => {
    // Navigate via UI
    await page
      .getByRole("link", { name: "จัดการการจอง" })
      .or(page.getByRole("button", { name: "จัดการการจอง" }))
      .click();
    const historyLink = page
      .getByRole("link", { name: "ประวัติการจอง" })
      .or(page.getByRole("button", { name: "ประวัติการจอง" }));
    await historyLink.click();
    await expect(page).toHaveURL(/member\/bookings-histories/);
    await page.waitForLoadState("networkidle");

    // Open Filter (Defaults to "ทั้งหมด" (All) or "Status")
    const filterButton = page
      .locator("button")
      .filter({ hasText: /ทั้งหมด|สถานะ|Status/ })
      .last();
    await expect(filterButton).toBeVisible();
    await filterButton.click();

    // Select "จองสำเร็จ" (Success)
    const successOption = page.getByRole("button", { name: "จองสำเร็จ" });

    await expect(successOption).toBeVisible();
    await successOption.click();

    // Wait for table update - check for specific status in rows
    await expect(async () => {
      const rows = page.locator("tbody tr");
      const rowCount = await rows.count();

      // Ensure we have results to verify
      expect(rowCount).toBeGreaterThan(0);

      // Verify ALL rows have status "จองสำเร็จ"
      for (let i = 0; i < rowCount; i++) {
        const statusCell = rows.nth(i).locator("td").nth(3); // Column 4 is Status
        await expect(statusCell).toContainText("จองสำเร็จ");
      }
    }).toPass({ timeout: 5000 });
  });
});

