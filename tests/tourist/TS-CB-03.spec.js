import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("Tourist - CancelBooking TS-CB-03", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/home");
    });

    /**
     * TS-CB-03: ผู้ใช้งานสามารถยกเลิกการจองได้สำเร็จ
     */
    test("TS-CB-03.1: ผู้ใช้งานสามารถยกเลิกการจองได้สำเร็จ", async ({ page }) => {
        await goToPageBookingHistories(page);
        await cancelPendingBookingMoreThanAWeek(page);
    });

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับนำทางไปยังหน้าประวัติการจองผ่านทางโปรไฟล์
    * Input: page (Page Object)
    * Output : - (นำทางไปยังหน้าประวัติการจอง)
    */
    async function goToPageBookingHistories(page) {
        await page.getByRole('button', { name: /.* Profile/ }).click();
        await page.getByRole('link', { name: 'ประวัติการจอง' }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับตรวจสอบเงื่อนไขวันที่ล่วงหน้ามากกว่า 7 วันเพื่อยกเลิกการจอง
    * Input: page (Page Object)
    * Output : - (ดำเนินการยกเลิกการจองหากล่วงหน้า > 7 วัน)
    */
    async function cancelPendingBookingMoreThanAWeek(page) {
        // 1. กรองสถานะรอยืนยัน
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();
        await page.getByText('รอยืนยัน').click();
        await page.getByRole('button', { name: 'ตัวกรอง' }).click();

        // 2. เลือกการ์ดและเข้าสู่หน้ารายละเอียด
        const pendingCard = page.locator('.relative.flex.flex-col').filter({ hasText: 'รอยืนยัน' }).first();
        await expect(pendingCard).toBeVisible({ timeout: 5000 });
        await pendingCard.click();

        // 3. ตรวจสอบเงื่อนไขวันที่
        const dateElement = page.getByText('เวลา').first();
        await expect(dateElement).toBeVisible({ timeout: 10000 });
        const dateText = await dateElement.innerText();
        const joinDate = parseThaiDate(dateText);
        const today = new Date();

        if (joinDate) {
            const diffTime = joinDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // ตรวจสอบเงื่อนไขล่วงหน้ามากกว่า 7 วัน
            expect(diffDays).toBeGreaterThan(7);

            // 4. ตรวจสอบปุ่มและดำเนินการกดยกเลิก
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
    * Input: dateStr (String)
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
        const year = parseInt(parts[3]) - 543; //
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