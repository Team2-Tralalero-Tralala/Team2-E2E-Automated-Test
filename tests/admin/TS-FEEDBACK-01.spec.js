import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToManagePackagePage - นำผู้ใช้งานไปยังหน้าจัดการแพ็กเกจ
 */
async function goToManagePackagePage(page) {
    const managePackageMenu = page.getByRole("link", { name: "จัดการแพ็กเกจ" });
    await expect(managePackageMenu).toBeVisible();
    await managePackageMenu.click();
}

/**
 * goToFeedbackTab - เปิดแท็บข้อเสนอแนะ
 */
async function goToFeedbackTab(page) {
    const feedbackTab = page.getByRole("button", { name: "ข้อเสนอแนะ" });
    await expect(feedbackTab).toBeVisible();
    await feedbackTab.click();
}

/**
 * clickViewPackageFromFirstCard - กดปุ่มดูแพ็กเกจจากการ์ดแรก
 */
async function clickViewPackageFromFirstCard(page) {
    const firstCard = page.locator(".package-card").first();
    const viewPackageBtn = firstCard.getByRole("button", { name: /ดูแพ็กเกจ/i });
    await expect(viewPackageBtn).toBeVisible();
    await viewPackageBtn.click();
}

test.describe("TS-FEEDBACK-01: Package Feedback", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "admin");
    });

    /**
     * TS-FEEDBACK-01.1
     * ตอบกลับข้อเสนอแนะจากหน้าแพ็กเกจสำเร็จ
     * Expected Result:
     *   - มีข้อความตอบกลับแสดงใต้รีวิว
     */
    test("TS-FEEDBACK-01.1: reply feedback successfully", async ({ page }) => {
        await goToManagePackagePage(page);
        await goToFeedbackTab(page);
        await clickViewPackageFromFirstCard(page);

        const replyInput = page.getByPlaceholder("ตอบกลับ");
        await expect(replyInput).toBeVisible();
        await replyInput.fill("ขอบคุณสำหรับข้อเสนอแนะ");

        const sendIconBtn = page
            .locator("button")
            .filter({ has: page.locator("svg") })
            .first();

        await expect(sendIconBtn).toBeVisible();
        await sendIconBtn.click();

        const confirmBtn = page.getByRole("button", { name: /ยืนยัน/i });
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();

        const replyMessage = page
            .locator("p")
            .filter({ hasText: "ขอบคุณสำหรับข้อเสนอแนะ" });

        await expect(replyMessage).toBeVisible();
    });

    /**
     * TS-FEEDBACK-01.2
     * ยกเลิกการตอบกลับข้อเสนอแนะ
     * Expected Result:
     *   - ไม่มีข้อความตอบกลับแสดงใต้รีวิว
     */
    test("TS-FEEDBACK-01.2: cancel reply feedback", async ({ page }) => {
        await goToManagePackagePage(page);
        await goToFeedbackTab(page);
        await clickViewPackageFromFirstCard(page);

        const replyInput = page.getByPlaceholder("ตอบกลับ");
        await expect(replyInput).toBeVisible();
        await replyInput.fill("ทดสอบการยกเลิก");

        const sendIconBtn = page
            .locator("button")
            .filter({ has: page.locator("svg") })
            .first();

        await expect(sendIconBtn).toBeVisible();
        await sendIconBtn.click();

        const cancelBtn = page.getByRole("button", { name: /ยกเลิก/i });
        await expect(cancelBtn).toBeVisible();
        await cancelBtn.click();

        const replyMessage = page
            .locator("p")
            .filter({ hasText: "ทดสอบการยกเลิก" });

        await expect(replyMessage).toHaveCount(0);
    });
});
