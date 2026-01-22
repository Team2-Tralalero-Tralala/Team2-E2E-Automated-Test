import { test, expect } from "@playwright/test";

test.describe("Guest Mode Access Control", () => {
    
    /**
     * TC-VS-01: Guest Mode View Booking History
     * คาดหวัง: เมื่อเข้าหน้าประวัติการจองโดยไม่ล็อกอิน ระบบต้องดีดไปหน้า Home
     */
    test("TC-VS-01: Guest cannot access booking history and is redirected to home", async ({ page }) => {
        const protectedUrl = "/tourist/bookings-histories";
        const expectedHomeUrl = "/tourist/home";
        //await expect(page).toHaveURL(/tourist\/home/);

        await page.goto(protectedUrl);

        await expect(page).toHaveURL(new RegExp(expectedHomeUrl));

        const homeHeader = page.getByText('แพ็กเกจมาใหม่');
        await expect(homeHeader).toBeVisible();

        const bookingHeader = page.getByRole('heading', { name: 'ประวัติการจอง' });
        await expect(bookingHeader).not.toBeVisible();
    });
});