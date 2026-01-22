import { test, expect } from "@playwright/test";
import { users } from "../../utils/test-users.js";
import { LoginPage } from "../../pages/auth/LoginPage.js";

test.describe("TS-CE-01 ผู้ใช้งานทั่วไปสามารถดูวิสาหกิจชุมชนได้", () => {
    const COMMUNITY_NAME = "วิสาหกิจชุมชนกลุ่มแม่บ้านเกษตรกรบ้านป่าเหมือด";
    const SEARCH_KEYWORD_FOUND = "เดินป่า";
    const SEARCH_KEYWORD_NOT_FOUND = "ดวงจันทร์สีทอง";

    /**
     * Pre-condition:
     * 1. เข้าสู่หน้า Login
     * 2. ล็อกอินด้วยบัญชีนักท่องเที่ยว (Tourist)
     */
    test.beforeEach(async({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto(users.tourist.loginPath);
        await loginPage.login(users.tourist.email, users.tourist.password);

        await page.waitForTimeout(2000);
    });

    /**
     * searchCommunity - ฟังก์ชันสำหรับค้นหาแพ็กเกจหรือวิสาหกิจชุมชน
     * Input:
     * - page: object ของ Playwright Page
     * - keyword: คำค้นหา (String)
     * Action:
     * 1. กรอกคำค้นหาลงในช่อง input
     * 2. คลิกปุ่มค้นหา (แว่นขยาย)
     * 3. รอผลลัพธ์โหลด
     * Output:
     * - หน้าเว็บแสดงผลการค้นหา
     */
    async function searchCommunity(page, keyword) {
        const searchInput = page.getByPlaceholder("ค้นหาแพ็กเกจกิจกรรม:");
        await searchInput.fill(keyword);

        const searchBtn = page
            .locator("header button")
            .filter({ has: page.locator("svg") })
            .last();
        await searchBtn.click();

        await page.waitForTimeout(1000);
    }

    /**
     * TC-CE-01.1
     * ค้นหาวิสาหกิจชุมชนแล้วพบข้อมูล
     */
    test("TS-CE-01.1: ค้นหาวิสาหกิจชุมชนแล้วพบข้อมูล", async({ page }) => {
        await searchCommunity(page, SEARCH_KEYWORD_FOUND);

        await expect(
            page.getByRole("heading", { name: COMMUNITY_NAME })
        ).toBeVisible();

        await expect(
            page.getByRole("heading", {
                name: `ผลลัพธ์ที่ตรงกับการค้นหา "${SEARCH_KEYWORD_FOUND}"`,
            })
        ).toBeVisible();
    });

    /**
     * TC-CE-01.2
     * ค้นหาวิสาหกิจชุมชนแล้วไม่พบข้อมูล
     */
    test("TS-CE-01.2: ค้นหาวิสาหกิจชุมชนแล้วไม่พบข้อมูล", async({ page }) => {
        await searchCommunity(page, SEARCH_KEYWORD_NOT_FOUND);

        await expect(
            page.getByRole("heading", { name: COMMUNITY_NAME })
        ).toBeHidden();

        await expect(page.getByText(COMMUNITY_NAME)).not.toBeVisible();
    });

    /**
     * TC-CE-01.3
     * เข้าดูรายละเอียดวิสาหกิจชุมชน
     */
    test("TS-CE-01.3: เข้าดูรายละเอียดวิสาหกิจชุมชน", async({ page }) => {
        await searchCommunity(page, SEARCH_KEYWORD_FOUND);

        const communityCard = page
            .locator("div")
            .filter({ hasText: COMMUNITY_NAME })
            .last();
        await communityCard.click();

        await expect(
            page.getByRole("heading", { name: COMMUNITY_NAME, level: 1 }).first()
        ).toBeVisible();

        await expect(
            page
            .getByRole("heading", {
                name: "วิสาหกิจชุมชนกลุ่มแม่บ้านเกษตรกรบ้านป่าเหมือด",
            })
            .first()
        ).toBeVisible();

        await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText(
            COMMUNITY_NAME
        );
    });
});