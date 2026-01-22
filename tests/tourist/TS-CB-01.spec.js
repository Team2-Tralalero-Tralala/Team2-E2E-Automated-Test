import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("Tourist - CancelBooking", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/home");
    });

    /**
     * TS-CB-01: ผู้ใช้งาน Tourist ยกเลิกการจองล่วงหน้า 1 สัปดาห์ ก่อนแพ็กเกจเริ่ม
     */

    /**
     * TS-CB-01.1: ใผู้ใช้งานสามารถยกเลิกการจองได้สำเร็จ
     * 1.เข้าสู่ระบบบัญชี Tourist 
     * 2.คลิกเมนู "โปรไฟล์" ที่มุมขวาบน
     * 3.เลือกเมนู "ประวัติการจอง"
     * 4.เลือกแพ็กเกจที่ต้องการยกเลิกการจอง
     * 5. คลิกปุ่มข้อความ (Text Button) "ยกเลิกการจอง" 
     */
    test("TS-CB-01.1: ผู้ใช้งานสามารถยกเลิกการจองได้สำเร็จ", async ({ page }) => {
        await goToPageBookingHistories(page);
        await cancelPendingBooking(page);
    });

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับนำทางไปยังหน้าเขียนข้อเสนอแนะผ่านทางโปรไฟล์และประวัติการจอง
    * Input: page (Page Object)
    * Output : - (นำทางไปยังหน้าเขียนข้อเสนอแนะ)
    */
    async function goToPageBookingHistories(page) {
        await page.getByRole('button', { name: /.* Profile/ }).click();
        await page.getByRole('link', { name: 'ประวัติการจอง' }).click();
        // await safeGoto(page, "/tourist/booking-history/2/feedback");
    }

    /*
        * คำอธิบาย : ฟังก์ชันสำหรับกรองสถานะ เลือกแพ็กเกจ และตรวจสอบเงื่อนไขวันที่ล่วงหน้า 7 วันเพื่อยกเลิกการจอง
        * Input: page (Page Object)
        * Output : - (ดำเนินการยกเลิกการจองหากพบรายการที่ตรงตามเงื่อนไขวันที่ล่วงหน้า 7 วัน)
        */
    async function cancelPendingBooking(page) {
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByRole('button', { name: 'รอยืนยัน' }).click();
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        const pendingCard = page.locator('.relative.flex.flex-col').filter({ hasText: 'รอยืนยัน' }).first();
        await expect(pendingCard).toBeVisible({
            timeout: 5000,
            message: "ไม่พบการ์ดรายการที่มีสถานะ 'รอยืนยัน' บนหน้าจอ"
        });
        await pendingCard.click();

        const dateElement = page.getByText('เวลา').first();
        await expect(dateElement).toBeVisible({ timeout: 10000 });
        const dateText = await dateElement.innerText();
        const joinDate = parseThaiDate(dateText);
        const today = new Date();

        if (joinDate) {
            const diffTime = joinDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            expect(diffDays).toBeGreaterThanOrEqual(7);
            const cancelBtn = page.getByRole('button', { name: 'ยกเลิกการจอง' });
            await expect(cancelBtn).toBeVisible({ timeout: 5000 });
            await cancelBtn.click();
            await handleCancellationModals(page);
        } else {
            throw new Error("ไม่สามารถอ่านวันที่เข้าร่วมได้จากข้อความ: " + dateText);
        }
    }

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับแปลงข้อความวันที่ภาษาไทย (พ.ศ.) เป็น Date Object (ค.ศ.)
    * Input: dateStr (String) เช่น "30 มกราคม 2569"
    * Output : Date Object
    */
    function parseThaiDate(dateStr) {
        const months = {
            'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3, 'พฤษภาคม': 4, 'มิถุนายน': 5,
            'กรกฎาคม': 6, 'สิงหาคม': 7, 'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11
        };
        const parts = dateStr.match(/(\d+)\s+([ก-์]+)\s+(\d+)/);
        if (!parts) return null;
        const day = parseInt(parts[1]);
        const month = months[parts[2]];
        const year = parseInt(parts[3]) - 543;
        return new Date(year, month, day);
    }

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับจัดการ Modal ยืนยันการยกเลิกการจอง และปิด Modal เมื่อดำเนินการสำเร็จ
    * Input: page (Page Object)
    * Output : - (ดำเนินการกดยืนยันการยกเลิกและปิดหน้าต่างแจ้งเตือนสำเร็จ)
    */
    async function handleCancellationModals(page) {
        await expect(page.getByText('ยืนยันการยกเลิกการจอง')).toBeVisible({ timeout: 5000 });
        const confirmBtn = page.getByRole('button', { name: 'ยืนยัน' });
        await confirmBtn.click();
        await expect(page.getByText('ยกเลิกการจองสำเร็จ')).toBeVisible({ timeout: 5000 });
        const closeBtn = page.getByRole('button', { name: 'ปิด' });
        await closeBtn.click();
    }
});