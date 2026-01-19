import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import { safeGoto } from "../../utils/safeGoto.js";

async function goToReplyToReviewMessagesPage(page) {
    const managePackage = page.getByRole("link", { name: "จัดการแพ็กเกจ" });
    await expect(managePackage).toBeVisible();
    await managePackage.click();
    await expect(page).toHaveURL(/\/member\/packages\/all/);

    const reviewMessages = page.getByRole("link", { name: "ข้อเสนอแนะ" });
    await expect(reviewMessages).toBeVisible();
    await reviewMessages.click();
    await expect(page).toHaveURL(/\/member\/feedbacks/);

}


test.describe("Member - Reply To Review Messages", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "memberForReplyMessagesTest");
    });

    /**
     * TS-FB-01.1
     * ยกเลิกตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ
     */
    test("TS-FB-01.1: ยกเลิกตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ", async ({ page, }) => {
        await goToReplyToReviewMessagesPage(page);

        // ทำชั่วคราวเพราะปุ่ม "ดูทั้งหมด" ลิ้งค์ผิด
        await safeGoto(page, "/member/package/feedbacks/22");
        await page.getByRole('textbox', { name: 'ตอบกลับ' }).click();
        await page.getByRole('textbox', { name: 'ตอบกลับ' }).fill('ขอบคุณ ขอบใจ ขอบพระทัย แต้งกิ้ว');
        await page.getByRole('button', { name: 'ยืนยันการตอบกลับรีวิว' }).click();
        await page.getByRole('button', { name: 'ยกเลิก' }).click();

        await expect(page).toHaveURL(/member\/package\/feedbacks\/22/)
    });

    /**
     * TS-FB-01.2
     * ตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ
     */
    test("TS-FB-01.2: ตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ", async ({ page, }) => {
        await goToReplyToReviewMessagesPage(page);

        // ทำชั่วคราวเพราะปุ่ม "ดูทั้งหมด" ลิ้งค์ผิด
        await safeGoto(page, "/member/package/feedbacks/22");

        await page.getByRole('textbox', { name: 'ตอบกลับ' }).click();

        const replyMessage = 'ขอบคุณ ขอบใจ ขอบพระทัย แต้งกิ้ว';
        await page.getByRole('textbox', { name: 'ตอบกลับ' }).click();
        await page.getByRole('textbox', { name: 'ตอบกลับ' }).fill(replyMessage);
        await page.getByRole('button', { name: 'ยืนยันการตอบกลับรีวิว' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();

        await expect(page).toHaveURL(/member\/package\/feedbacks\/22/);

        // ตรวจสอบว่าข้อความที่เราเพิ่งส่งไป (replyMessage) ปรากฏขึ้นมาบนหน้าเว็บจริง
        await expect(page.getByText(replyMessage)).toBeVisible();
    });

});

//npx playwright codegen http://localhost:4000/guest/partner/login
//npx playwright test tests/member/TS-FB-01.spec.js --headed
//npx playwright test tests/member/TS-FB-01.spec.js -g "TS-FB-01\.1\b" --headed