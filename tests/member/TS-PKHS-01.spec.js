import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToPackageHistoryPage - นำผู้ใช้งานไปยังหน้า “ประวัติแพ็กเกจ”
 *
 * Input:
 *   - page: Playwright Page
 *
 * Action:
 *   1. คลิกเมนู “จัดการแพ็กเกจ”
 *   2. คลิกเมนู “ประวัติแพ็กเกจ”
 *
 * Expected Result:
 *   - ระบบนำผู้ใช้งานเข้าสู่หน้าประวัติแพ็กเกจ
 *   - หน้าต้องโหลดสำเร็จโดยไม่แสดง error
 */
async function goToPackageHistoryPage(page) {
    const managePackageMenu = page.getByRole("link", { name: "จัดการแพ็กเกจ" });
    await expect(managePackageMenu).toBeVisible();
    await managePackageMenu.click();

    const historyMenu = page.getByRole("link", { name: "ประวัติแพ็กเกจ" });
    await expect(historyMenu).toBeVisible();
    await historyMenu.click();
}

test.describe("TS-PKHS-01: Package History", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "member");
    });

    /**
     * TC-PKHS-01.1
     * ตรวจสอบการเปิดหน้า “ประวัติแพ็กเกจ” ของสมาชิก
     * กรณีมี error ระบบต้องไม่ผ่านการทดสอบ
     */
    test("TC-PKHS-01.1: member can open package history page without error", async ({
        page,
    }) => {
        await goToPackageHistoryPage(page);

        const errorMessage = page.getByText(
            "Request failed with status code 400"
        );

        await expect(errorMessage).not.toBeVisible();
    });

    /**
     * TC-PKHS-01.2
     * สมาชิกค้นหาประวัติแพ็กเกจด้วยคีย์เวิร์ด
     */
    test("TC-PKHS-01.2: search package history by keyword", async ({
        page,
    }) => {
        await goToPackageHistoryPage(page);

        const searchInput = page.getByPlaceholder(/ค้นหา/i);
        await expect(searchInput).toBeVisible();
        await searchInput.fill("เดินป่า");

        const tableRows = page.locator("tbody tr");
        await expect(tableRows).toHaveCountGreaterThan(0);

        const matchedRows = tableRows.filter({
            hasText: "เดินป่า",
        });

        await expect(matchedRows.first()).toBeVisible();
    });

    /**
     * TC-PKHS-01.3
     * ตรวจสอบการแสดงข้อมูลในตารางประวัติแพ็กเกจ
     */
    test("TC-PKHS-01.3: display completed package history correctly", async ({
        page,
    }) => {
        await goToPackageHistoryPage(page);

        const table = page.locator("table");
        await expect(table).toBeVisible();

        await expect(page.getByText("ชื่อแพ็กเกจ")).toBeVisible();
        await expect(page.getByText("ชื่อชุมชน")).toBeVisible();
        await expect(page.getByText("ผู้ดูแล")).toBeVisible();
        await expect(page.getByText("สถานะแพ็กเกจ")).toBeVisible();
        await expect(page.getByText("เวลาสิ้นสุด")).toBeVisible();

        const tableRows = page.locator("tbody tr");
        await expect(tableRows.first()).toBeVisible();
    });
});
