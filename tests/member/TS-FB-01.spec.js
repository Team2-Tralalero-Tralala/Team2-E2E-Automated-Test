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
    // test("TS-FB-01.1: ยกเลิกตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ", async ({ page, }) => {
    //     await goToReplyToReviewMessagesPage(page);

    //     // ทำชั่วคราวเพราะปุ่ม "ดูทั้งหมด" ลิ้งค์ผิด
    //     await safeGoto(page, "/member/package/feedbacks/22");
    //     await page.getByRole('textbox', { name: 'ตอบกลับ' }).click();
    //     await page.getByRole('textbox', { name: 'ตอบกลับ' }).fill('ขอบคุณ ขอบใจ ขอบพระทัย แต้งกิ้ว');
    //     await page.getByRole('button', { name: 'ยืนยันการตอบกลับรีวิว' }).click();
    //     await page.getByRole('button', { name: 'ยกเลิก' }).click();

    //     await expect(page).toHaveURL(/member\/package\/feedbacks\/22/)

    /**
     * TS-FB-01.1
     * ยกเลิกตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ
    */
    test("TS-FB-01.1: ยกเลิกตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ", async ({ page }) => {
        // กำหนด ID และชื่อแพ็กเกจเป็นตัวแปร เพื่อให้ง่ายต่อการแก้ไขและเช็ค URL
        const packageId = "22"; 
        const packageName = "098 Supasit Meedecha"; 

        await goToReplyToReviewMessagesPage(page);

        // 1. หา Section ของแพ็กเกจที่เราต้องการ
        const packageSection = page.locator('section').filter({ hasText: packageName });

        // 2. ตรวจสอบว่าต้องมีข้อเสนอแนะ > 0 (เช็คหาข้อความที่ขึ้นต้นด้วยเลข 1-9 ตามด้วย " ข้อเสนอแนะ")
        // เพื่อป้องกันการไปทำเทสต์กับแพ็กเกจที่มี "0 ข้อเสนอแนะ"
        await expect(packageSection.getByText(/^[1-9][0-9]* ข้อเสนอแนะ/)).toBeVisible();

        // 3. คลิกปุ่ม "ดูทั้งหมด" ของแพ็กเกจนั้น
        await packageSection.getByRole("button", { name: "ดูทั้งหมด" }).click();

        // 4. ไปที่หน้า feedbacks ย่อยโดยใช้ packageId (ทำชั่วคราวเพราะลิ้งค์ผิด)
        await safeGoto(page, `/member/package/feedbacks/${packageId}`);

        // 5. จำลองการตอบกลับ (ใช้ .first() เผื่อมีปุ่มตอบกลับหลายอันในหน้าจอ)
        await page.getByRole('textbox', { name: 'ตอบกลับ' }).first().click();
        await page.getByRole('textbox', { name: 'ตอบกลับ' }).first().fill('ขอบคุณ ขอบใจ ขอบพระทัย แต้งกิ้ว');
        await page.getByRole('button', { name: 'ยืนยันการตอบกลับรีวิว' }).first().click();
        
        // 6. กดยกเลิก
        const cancelButton = page.getByRole('button', { name: 'ยกเลิก' }).first();
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        // 7. ตรวจสอบว่ายังอยู่หน้าเดิม โดยใช้ Regular expression ที่นำ packageId มาประกอบ
        const expectedUrlRegex = new RegExp(`member\\/package\\/feedbacks\\/${packageId}`);
        await expect(page).toHaveURL(expectedUrlRegex);
    });


    // /**
    //  * TS-FB-01.2
    //  * ตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ
    //  */
    // test("TS-FB-01.2: ตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ", async ({ page, }) => {
    //     await goToReplyToReviewMessagesPage(page);

    //     // ทำชั่วคราวเพราะปุ่ม "ดูทั้งหมด" ลิ้งค์ผิด
    //     await safeGoto(page, "/member/package/feedbacks/22");

    //     await page.getByRole('textbox', { name: 'ตอบกลับ' }).click();

    //     const replyMessage = 'ขอบคุณ ขอบใจ ขอบพระทัย แต้งกิ้ว';
    //     await page.getByRole('textbox', { name: 'ตอบกลับ' }).click();
    //     await page.getByRole('textbox', { name: 'ตอบกลับ' }).fill(replyMessage);
    //     await page.getByRole('button', { name: 'ยืนยันการตอบกลับรีวิว' }).click();
    //     await page.getByRole('button', { name: 'ยืนยัน' }).click();

    //     await expect(page).toHaveURL(/member\/package\/feedbacks\/22/);

    //     // ตรวจสอบว่าข้อความที่เราเพิ่งส่งไป (replyMessage) ปรากฏขึ้นมาบนหน้าเว็บจริง
    //     await expect(page.getByText(replyMessage)).toBeVisible();
    // });

    /**
     * TS-FB-01.2
     * ตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ
     */
    test("TS-FB-01.2: ตอบกลับข้อความรีวิวในข้อเสนอแนะของแพ็กเกจ", async ({ page }) => {
        // กำหนดตัวแปรให้จัดการง่ายขึ้น
        const packageId = "22"; 
        const packageName = "098 Supasit Meedecha"; 
        const replyMessage = 'ขอบคุณ ขอบใจ ขอบพระทัย แต้งกิ้ว';

        await goToReplyToReviewMessagesPage(page);

        // 1. หา Section ของแพ็กเกจที่เราต้องการ
        const packageSection = page.locator('section').filter({ hasText: packageName });

        // 2. ตรวจสอบว่าต้องมีข้อเสนอแนะ > 0 ถึงจะเข้าไปตอบกลับได้
        await expect(packageSection.getByText(/^[1-9][0-9]* ข้อเสนอแนะ/)).toBeVisible();

        // 3. คลิกปุ่ม "ดูทั้งหมด" ของแพ็กเกจนั้น
        await packageSection.getByRole("button", { name: "ดูทั้งหมด" }).click();

        // 4. ทำชั่วคราวเพราะปุ่ม "ดูทั้งหมด" ลิ้งค์ผิด
        await safeGoto(page, `/member/package/feedbacks/${packageId}`);

        // 5. ทำการพิมพ์ข้อความตอบกลับ (ใช้ .first() เผื่อมีหลายรีวิวในหน้า)
        const replyBox = page.getByRole('textbox', { name: 'ตอบกลับ' }).first();
        await replyBox.click();
        await replyBox.fill(replyMessage);
        
        // 6. กดยืนยันการตอบกลับ
        await page.getByRole('button', { name: 'ยืนยันการตอบกลับรีวิว' }).first().click();
        
        // 7. กดยืนยันในหน้าต่าง Popup/Modal
        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' }).first();
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        // 8. ตรวจสอบว่า URL ยังถูกต้องอยู่
        const expectedUrlRegex = new RegExp(`member\\/package\\/feedbacks\\/${packageId}`);
        await expect(page).toHaveURL(expectedUrlRegex);

        // 9. ตรวจสอบว่าข้อความที่เราเพิ่งส่งไป (replyMessage) ปรากฏขึ้นมาบนหน้าเว็บจริง
        await expect(page.getByText(replyMessage).first()).toBeVisible();
    });

});

//npx playwright codegen http://localhost:4000/guest/partner/login
//npx playwright test tests/member/TS-FB-01.spec.js --headed
//npx playwright test tests/member/TS-FB-01.spec.js -g "TS-FB-01\.1\b" --headed