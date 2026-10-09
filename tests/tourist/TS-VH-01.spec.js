import { test, expect } from "@playwright/test";

test.describe("Guest Mode Access Control", () => {
    
    /**
     * TC-VH-01: Guest Mode View Booking History
     * คาดหวัง: เมื่อเข้าหน้าประวัติการจองโดยไม่ล็อกอิน ระบบต้องดีดไปหน้า Home
     */
    test("TC-VH-01: Guest cannot access booking history and is redirected to home", async ({ page }) => {
        const protectedUrl = "/tourist/bookings-histories";
        await expect(page).toHaveURL(/tourist\/home/);

        // 1. พยายามเข้าหน้าที่มีการป้องกัน
        await page.goto(protectedUrl);

        // 2. ตรวจสอบว่า URL เปลี่ยนไปเป็นหน้า Home หรือไม่
        // Playwright จะรอจนกว่า Redirection จะเสร็จสิ้นภายใน timeout (ปกติ 5 วินาที)
        await expect(page).toHaveURL(expectedRedirectUrl);

        // 3. (Optional) ตรวจสอบว่าไม่มีเนื้อหาที่เป็นความลับแสดงออกมา
        // เช่น ตรวจสอบว่าไม่เห็นหัวข้อ "ประวัติการจองของคุณ"
        const bookingHeader = page.getByRole('heading', { name: 'ประวัติการจอง' });
        await expect(bookingHeader).not.toBeVisible();
    });
});