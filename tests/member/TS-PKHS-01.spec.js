import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการแพ็กเกจ
 * Input:
 *   - page: object ของ Playwright Page
 * Action:
 *   1. คลิกเมนู "จัดการแพ็กเกจ"
 * Output:
 *   - Browser ถูกนำไปยังหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
    const managePackageMenu = page.getByRole("link", { name: "จัดการแพ็กเกจ" });
    await expect(managePackageMenu).toBeVisible();
    await managePackageMenu.click();
}

/**
 * goToPackageHistoryPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าประวัติแพ็กเกจ
 * Input:
 *   - page: object ของ Playwright Page
 * Action:
 *   1. คลิกเมนู "ประวัติแพ็กเกจ"
 * Output:
 *   - Browser แสดงหน้าประวัติแพ็กเกจ
 */
async function goToPackageHistoryPage(page) {
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
     * ตรวจสอบว่าสมาชิกสามารถเข้าไปดูหน้าประวัติแพ็กเกจได้
     * Steps:
     *   1. เข้าสู่ระบบด้วยบัญชีสมาชิก
     *   2. คลิกเมนู "จัดการแพ็กเกจ"
     *   3. คลิกเมนู "ประวัติแพ็กเกจ"
     * Expected Result:
     *   - ระบบไม่แสดงข้อความ error
     *   - ไม่ redirect ไปหน้า error / forbidden
     */
    test("TC-PKHS-01.1: member can access package history page", async ({
        page,
    }) => {
        await goToManagePackagePage(page);
        await goToPackageHistoryPage(page);

        await expect(page).not.toHaveURL(/error|forbidden|403|500/i);

        const errorMessage = page.getByText(/error|ผิดพลาด|ไม่สามารถ/i);
        await expect(errorMessage).toHaveCount(0);
    });
});
