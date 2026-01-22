import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - ฟังก์ชันนำผู้ใช้งานไปยังหน้า “จัดการแพ็กเกจ”
 * Input:
 *   - page: object ของ Playwright Page
 * Action:
 *   1. คลิกเมนู “จัดการแพ็กเกจ”
 *   2. รอ redirect ไปหน้า /admin/packages/all
 * Output:
 *   - browser อยู่ที่หน้าแสดงรายการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
  const managePackageMenu = page.getByRole("link", {
    name: "จัดการแพ็กเกจ",
  });
  await expect(managePackageMenu).toBeVisible();
  await managePackageMenu.click();

  await expect(page).toHaveURL(/admin\/packages\/all/);
}

test.describe("Admin - View Travel Packages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TC-PKG-View-01.1
   * ตรวจสอบว่าระบบแสดงรายการแพ็กเกจครบทุกคอลัมน์
   * และชื่อชุมชนของทุกแพ็กเกจต้องเหมือนกัน
   */
  test("TS-PKG-View-01.1: admin can view packages from the same community", async ({
    page,
  }) => {
    await goToManagePackagePage(page);

    const packageTable = page.getByRole("table");
    await expect(packageTable).toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "ชื่อแพ็กเกจ" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "ชื่อชุมชน" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "ผู้ดูแล" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "สถานะแพ็กเกจ" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "จำนวนการจอง" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "จัดการ" })
    ).toBeVisible();

    const packageRows = page.locator("tbody tr");
    const rowCount = await packageRows.count();
    await expect(rowCount).toBeGreaterThan(0);

    const communityCells = packageRows.locator("td").nth(1);
    const communityNames = await communityCells.allTextContents();

    const normalizedCommunityNames = communityNames.map((name) =>
      name.trim()
    );

    const uniqueCommunities = new Set(normalizedCommunityNames);
    await expect(uniqueCommunities.size).toBe(1);
  });

  /**
  * TC-PKG-View-01.2
  * ทดสอบการใช้ช่องค้นหาเพื่อกรองรายการแพ็กเกจ
  * และตรวจสอบว่าผลลัพธ์ตรงกับคำค้น
  */
  test("TS-PKG-View-01.2: admin can search packages by keyword", async ({
    page,
  }) => {
    const keyword = "ล่องเรือชมวิถีริมน้ำ";

    await goToManagePackagePage(page);

    const searchInput = page.locator('input[placeholder="ค้นหา"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(keyword);

    const packageRows = page.locator("tbody tr");

    await expect(packageRows.first()).toBeVisible();

    const rowCount = await packageRows.count();
    await expect(rowCount).toBeGreaterThan(0);

    let hasMatchedRow = false;

    for (let i = 0; i < rowCount; i++) {
      const row = packageRows.nth(i);

      const packageName = (await row.locator("td").nth(0).textContent())?.trim();
      const communityName = (await row.locator("td").nth(1).textContent())?.trim();
      const ownerName = (await row.locator("td").nth(2).textContent())?.trim();
      const status = (await row.locator("td").nth(3).textContent())?.trim();

      if (
        packageName?.includes(keyword) ||
        communityName?.includes(keyword) ||
        ownerName?.includes(keyword) ||
        status?.includes(keyword)
      ) {
        hasMatchedRow = true;
        break;
      }
    }

    await expect(hasMatchedRow).toBe(true);
  });

  /**
   * TC-PKG-View-01.3
   * ทดสอบการใช้ตัวกรองสถานะแพ็กเกจ
   * และตรวจสอบว่าระบบแสดงเฉพาะแพ็กเกจที่มีสถานะ "เผยแพร่"
   */
  test("TS-PKG-View-01.3: admin can filter packages by published status", async ({
    page,
  }) => {
    await goToManagePackagePage(page);

    const filterButton = page.getByRole("button", { name: "ตัวกรอง" });
    await expect(filterButton).toBeVisible();
    await filterButton.click();

    const publishedRadio = page.locator(
      'input[type="radio"][name="packageStatus"][value="เผยแพร่"]'
    );
    await expect(publishedRadio).toBeVisible();
    await publishedRadio.check();

    const packageRows = page.locator("tbody tr");
    await expect(packageRows.first()).toBeVisible();

    const rowCount = await packageRows.count();
    await expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const statusCell = packageRows.nth(i).locator("td").nth(4);
      const statusText = (await statusCell.textContent())?.trim();

      await expect(statusText).toBe("เผยแพร่");
    }
  });

  /**
   * TC-PKG-View-01.4
   * ทดสอบการแสดงผลเมื่อไม่มีข้อมูลแพ็กเกจในระบบ
   * และตรวจสอบว่าระบบแสดงข้อความแจ้งเตือนอย่างถูกต้อง
   */
  test("TS-PKG-View-01.4: admin can see empty state when no packages exist", async ({
    page,
  }) => {
    await goToManagePackagePage(page);

    const packageTable = page.getByRole("table");
    await expect(packageTable).toBeVisible();

    const packageRows = page.locator("tbody tr");
    const rowCount = await packageRows.count();

    await expect(rowCount).toBe(0);

    const emptyMessage = page.getByText("ไม่พบข้อมูลแพ็กเกจ");
    await expect(emptyMessage).toBeVisible();
  });

});
