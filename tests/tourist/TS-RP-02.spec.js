import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";
import { safeGoto } from "../../utils/safeGoto.js";

test.describe("Tourist - CreateFeedback", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/home");
    });

    /**
     * TS-RP-02: ผู้ใช้งาน Tourist เขียนรีวิวและให้คะแนนแพ็กเกจโดยไม่เพิ่มรูป
     */

    /**
     * TS-RP-02.1: ให้คะแนนและเขียนรีวิวสำเร็จ
     * 1.เข้าสู่ระบบบัญชี Tourist 
     * 2.คลิกเมนู "โปรไฟล์" ที่มุมขวาบน
     * 3.เลือกเมนู "ประวัติการจอง"
     * 4.เลือกแพ็กเกจที่ต้องการยกเลิกการจอง
     * 5. คลิกปุ่มข้อความ (Text Button) "ข้อเสนอแนะ" 
     * 6.ให้คะแนนแพ็กเกจ
     * 7.กรอกข้อเสนอแนะ ไม่เกิน 200 ตัวอักษร
     * 8. คลิกปุ่ม "ยืนยัน"
     */
    test("TS-RP-02.1: ให้คะแนนและเขียนรีวิวสำเร็จ", async ({ page }) => {
        await createFeedbackSuccess(page);
    });

    /**
     * TS-RP-02.2 ให้คะแนนและเขียนรีวิวไม่สำเร็จ
     * 1.เข้าสู่ระบบบัญชี Tourist 
     * 2.คลิกเมนู "โปรไฟล์" ที่มุมขวาบน
     * 3.เลือกเมนู "ประวัติการจอง"
     * 4.เลือกแพ็กเกจที่ต้องการยกเลิกการจอง
     * 5. คลิกปุ่มข้อความ (Text Button) "ข้อเสนอแนะ" 
     * 6.ให้คะแนนแพ็กเกจ
     * 7.กรอกข้อเสนอแนะ เกิน 200 ตัวอักษร
     * 8. คลิกปุ่ม "ยืนยัน"
     */
    test("TS-RP-02.2: ให้คะแนนและเขียนรีวิวไม่สำเร็จ", async ({ page }) => {
        await createFeedbackReviewFail(page);
    });

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับนำทางไปยังหน้าเขียนข้อเสนอแนะผ่านทางโปรไฟล์และประวัติการจอง
    * Input: page (Page Object)
    * Output : - (นำทางไปยังหน้าเขียนข้อเสนอแนะ)
    */
    async function goToPageCreateFeedback(page) {
        await page.getByRole('button', { name: /.* Profile/ }).click();
        await page.getByRole('link', { name: 'ประวัติการจอง' }).click();
        const successfulBooking = page.locator('div').filter({ hasText: 'จองสำเร็จ' });
        await successfulBooking.getByRole('button', { name: 'ข้อเสนอแนะ' });
        await expect(feedbackBtn).toBeVisible({ 
            timeout: 5000, 
            message: "ไม่พบปุ่ม 'ข้อเสนอแนะ' ในรายการที่จองสำเร็จภายใน 5 วินาที" 
        });
        await successfulBooking.first().click();
        // await safeGoto(page, "/tourist/booking-history/2/feedback");
        let textHeader = page.getByText("ประวัติการจอง");
        await expect(textHeader).toBeVisible();
    }

    /*
    * คำอธิบาย : ฟังก์ชันทดสอบกรณีการเขียนรีวิว ให้คะแนน และเพิ่มรูปภาพไม่เกิน 5 รูป ได้สำเร็จ
    * Input: page (Page Object)
    * Output : - (บันทึกข้อมูลสำเร็จและแสดงผลบนหน้าจอ)
    */
    async function createFeedbackSuccess(page) {
        await goToPageCreateFeedback(page);
        await page.getByRole('button').nth(6).click();
        await page.getByRole('textbox', { name: 'ข้อเสนอแนะ' }).click();
        const feedbackText = `ผม/ฉันขอขอบคุณเป็นอย่างยิ่งสำหรับความช่วยเหลือและความเอาใจใส่ที่คุณมอบให้ในครั้งนี้เพราะไม่ใช่แค่ทำให้งานสำเร็จลุล่วงเท่านั้น 
แต่ยังทำให้ผม/ฉันรู้สึกอุ่นใจและได้รับพลังบวกอย่างมาก`;
        const textbox = page.getByRole('textbox', { name: 'ข้อเสนอแนะ' });
        await textbox.fill(feedbackText);
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ตกลง' }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันทดสอบกรณีการเขียนข้อเสนอแนะเกิน 200 ตัวอักษร ทำให้ไม่สามารถส่งข้อมูลได้
    * Input: page (Page Object)
    * Output : - (แสดงข้อความแจ้งเตือนข้อผิดพลาดเนื่องจากตัวอักษรเกินจำนวนที่กำหนด)
    */
    async function createFeedbackReviewFail(page) {
        await goToPageCreateFeedback(page);
        await page.getByRole('button').nth(6).click();
        await page.getByRole('textbox', { name: 'ข้อเสนอแนะ' }).click();
        const feedbackText = `ผม/ฉันขอขอบคุณเป็นอย่างยิ่งสำหรับความช่วยเหลือและความเอาใจใส่ที่คุณมอบให้ในครั้งนี้เพราะไม่ใช่แค่ทำให้งานสำเร็จลุล่วงเท่านั้น 
        แต่ยังทำให้ผม/ฉันรู้สึกอุ่นใจและได้รับพลังบวกอย่างมาก ความทุ่มเทและความตั้งใจของคุณเป็นสิ่งที่ผม/ฉันเห็นและซาบซึ้งจริง ๆ 
        และผม/ฉันอยากให้คุณรู้ว่ามันมีความหมายมากเพียงใด ขอบคุณอีกครั้งสำหรับไมตรีและความจริงใจที่มอบให้ครับ/ค่ะ`;
        const textbox = page.getByRole('textbox', { name: 'ข้อเสนอแนะ' });
        await textbox.fill(feedbackText);
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ตกลง' }).click();
    }

});