import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Search Package by Tag", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await expect(page).toHaveURL(/\/tourist/);
    });

    /**
     * TC-ST-02.1
     * ค้นหาแพ็กเกจจากแท็ก (Tag) น้อยกว่า 2 แท็ก
     * คลิกแท็ก "เดินป่า" ที่หัวข้อ "กิจกรรมแนะนำ"
     */
    test("TC-ST-02.1: search package by single recommended tag", async ({
        page,
    }) => {
        const hikingTagBtn = page.getByRole("button", { name: "เดินป่า" });

        await expect(hikingTagBtn).toBeVisible();
        await hikingTagBtn.click();

        const packageCard = page.getByRole("article").first();
        const hikingTag = packageCard.getByText("เดินป่า");

        await expect(packageCard).toBeVisible();
        await expect(hikingTag).toBeVisible();
    });

    /**
    * TC-ST-02.2
    * ค้นหาแพ็กเกจจากแท็ก (Tag) มากกว่า 1 แท็ก
    * คลิกแท็ก "เดินป่า" ที่หัวข้อ "กิจกรรมแนะนำ"
    * และค้นหาแท็กเพิ่ม "กิจกรรมกลางแจ้ง" จากช่องค้นหาแท็ก
    */
    test("TC-ST-02.2: search package by multiple tags", async ({ page }) => {
        const hikingTagBtn = page.getByRole("button", { name: "เดินป่า" });

        await expect(hikingTagBtn).toBeVisible();
        await hikingTagBtn.click();

        const tagSearchInput = page.getByPlaceholder("ค้นหาแท็ก แล้วเลือกจากรายการ");

        await expect(tagSearchInput).toBeVisible();
        await tagSearchInput.fill("กิจกรรมกลางแจ้ง");

        const outdoorTagOption = page.getByRole("option", {
            name: "กิจกรรมกลางแจ้ง",
        });

        await expect(outdoorTagOption).toBeVisible();
        await outdoorTagOption.click();

        const packageCard = page.getByRole("article").first();
        const hikingTag = packageCard.getByText("เดินป่า");
        const outdoorTag = packageCard.getByText("กิจกรรมกลางแจ้ง");

        await expect(packageCard).toBeVisible();
        await expect(hikingTag).toBeVisible();
        await expect(outdoorTag).toBeVisible();
    });

    /**
     * TC-ST-02.3
     * ค้นหาแพ็กเกจจากแท็ก (Tag)
     * คลิกแท็ก "เดินป่า" ที่หัวข้อ "กิจกรรมแนะนำ"
     * และค้นหาแท็กที่ไม่มีอยู่จริง "โตมา โตมาชิกูรู"
     * ระบบต้องยังแสดงผลลัพธ์แพ็กเกจที่เกี่ยวข้องกับแท็ก "เดินป่า"
     */
    test("TC-ST-02.3: search package with non-existing additional tag and click outside", async ({
        page,
    }) => {
        const hikingTagBtn = page.getByRole("button", { name: "เดินป่า" });

        await expect(hikingTagBtn).toBeVisible();
        await hikingTagBtn.click();

        const tagSearchInput = page.getByPlaceholder("ค้นหาแท็ก แล้วเลือกจากรายการ");

        await expect(tagSearchInput).toBeVisible();
        await tagSearchInput.fill("โตมา โตมาชิกูรู");

        const nonExistingTagOption = page.getByRole("option", {
            name: "โตมา โตมาชิกูรู",
        });

        await expect(nonExistingTagOption).toHaveCount(0);

        await page.mouse.click(10, 10);

        const packageCard = page.getByRole("article").first();
        const hikingTag = packageCard.getByText("เดินป่า");

        await expect(packageCard).toBeVisible();
        await expect(hikingTag).toBeVisible();
    });
});
