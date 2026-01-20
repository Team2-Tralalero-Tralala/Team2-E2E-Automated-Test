import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Booking History View & Details", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/booking-histories");
        await page.waitForLoadState("networkidle");
    });

    test("TC-VH-03.1: View all booking history", async ({ page }) => {
        // 1. Verify Heading
        const heading = page.getByRole('heading', { name: /ประวัติการจอง|Booking History/i });
        await expect(heading).toBeVisible();

        // 2. Identify the booking cards (the snapshot shows they have a heading level 3)
        const bookingCards = page.getByRole('heading', { level: 3 });
        const noDataMessage = page.getByText(/ไม่พบข้อมูล|No data found/i);

        // 3. Logic: Expect at least one card OR the "No Data" message
        const count = await bookingCards.count();
        if (count > 0) {
            // Verify the first card is visible
            await expect(bookingCards.first()).toBeVisible();
            
            // Verify common elements within the cards (Price/Status)
            // Snapshot shows status labels like "คืนเงินแล้ว", "จองสำเร็จ"
            const firstStatus = page.getByText(/คืนเงินแล้ว|จองสำเร็จ|ถูกปฏิเสธ|รอยืนยัน/i).first();
            await expect(firstStatus).toBeVisible();
        } else {
            await expect(noDataMessage).toBeVisible();
        }
    });

    /**
     * TC-VH-03.2: ดูรายละเอียดประวัติการจอง (Side Panel)
     */
    test("TC-VH-03.2: View booking details in side panel", async ({ page }) => {
        // 1. ระบุ Card ใบแรกที่มีชื่อกิจกรรม
        const firstCard = page.locator('div').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
        
        // 2. คลิกที่ตัว Card (เนื่องจาก Snapshot ระบุว่า card มี cursor=pointer และไม่มีปุ่มแยก)
        await firstCard.click();

        // 3. ระบุ Side Panel (หรือ Container ที่แสดงรายละเอียด)
        // จาก Snapshot (ref=e105), ข้อมูลละเอียดจะใช้หัวข้อ Heading Level 3 เหมือนกัน 
        // เราจึงระบุตัวตนของมันด้วยข้อความที่ "ต้องมี" ในรายละเอียดเท่านั้น
        const detailContainer = page.locator('div').filter({ hasText: /จำนวนผู้เข้าจองทั้งหมด|ราคารวม/ }).last();
        
        // ตรวจสอบว่า Container รายละเอียดปรากฏขึ้น
        await expect(detailContainer).toBeVisible({ timeout: 10000 });

        // 4. ตรวจสอบข้อมูลภายในรายละเอียด
        const requiredFields = [
            /ราคา/i,
            /สถานะ/i,
            /จำนวนผู้เข้าจองทั้งหมด/i,
            /ราคารวม/i
        ];

        for (const field of requiredFields) {
            // ใช้ความสามารถของ Playwright ในการหา Text ภายใน Container นั้นๆ
            await expect(detailContainer.getByText(field).first()).toBeVisible();
        }

        // 5. ทดสอบปิด (ถ้า UI มีปุ่มปิด หรือถ้ากดซ้ำที่เดิมเพื่อปิด)
        // หากไม่มีปุ่มปิดชัดเจนใน Snapshot (ref=e105-e122) ขั้นตอนนี้อาจข้ามไปหรือปรับตามพฤติกรรมจริงของเว็บ
    });
});