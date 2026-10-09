import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Tourist - Booking History Search & Filter", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "tourist");
        await page.goto("/tourist/booking-histories");
        await page.waitForLoadState("networkidle");
    });

    /**
     * TC-VH-02.1: ค้นหาด้วยคีย์เวิร์ด (ใช้ช่องค้นหาด้านล่าง)
     */
    test("TC-VH-02.1: Search by keyword 'ทำผ้ามัดย้อม'", async ({ page }) => {
        const keyword = "ทำผ้ามัดย้อม";
        
        // เจาะจงไปที่ช่องค้นหาในส่วนของเนื้อหา (ไม่ใช่ Header) 
        // อ้างอิงจาก snapshot: อยู่ใกล้กับปุ่ม ล่าสุด/เก่าสุด
        const searchInput = page.locator('input[type="text"]').nth(1); // ตัวที่ 1 คืออันบน, ตัวที่ 2 (index 1) คืออันล่าง
        
        await searchInput.fill(keyword);
        await searchInput.press('Enter');

        const firstCardHeader = page.getByRole('heading', { level: 3 }).first();
        await expect(firstCardHeader).toContainText(keyword);
    });

    /**
     * TC-VH-02.2: เรียงลำดับ ล่าสุด - เก่าสุด
     */
    test("TC-VH-02.2: Sort by Latest/Oldest", async ({ page }) => {
        const latestBtn = page.getByRole('button', { name: 'ล่าสุด' });
        const oldestBtn = page.getByRole('button', { name: 'เก่าสุด' });

        // 1. กดเก่าสุด
        await oldestBtn.click();
        await page.waitForLoadState('networkidle');
        // เก็บค่าวันที่ของใบแรกไว้ (เช่น ปี 2568)
        const oldestDateText = await page.locator('p:has-text("จองเมื่อ")').first().textContent();

        // 2. กดล่าสุด
        await latestBtn.click();
        await page.waitForLoadState('networkidle');
        const latestDateText = await page.locator('p:has-text("จองเมื่อ")').first().textContent();

        // ตรวจสอบเบื้องต้นว่าค่าวันที่เปลี่ยนไป (ถ้าข้อมูลมีมากพอ)
        expect(oldestDateText).not.toBe(latestDateText);
    });

    /**
     * TC-VH-02.3: กรองสถานะ 'จองสำเร็จ' และช่วงเวลา
     */
    test("TC-VH-02.3: Filter by Status and Period", async ({ page }) => {
        // 1. เปิดตัวกรอง
        await page.getByRole('button', { name: /ตัวกรอง/ }).click();

        // 2. ระบุ Scope ไปที่ "เมนูตัวกรอง" ที่เปิดขึ้นมาเท่านั้น 
        // จาก snapshot: Container ของตัวกรองอยู่ที่ ref=e42
        const filterMenu = page.locator('div').filter({ has: page.getByRole('heading', { name: 'ตัวกรอง' }) });

        // 3. เลือกสถานะ "จองสำเร็จ" ภายในเมนูตัวกรองเท่านั้น (แก้ Strict Mode)
        const statusBtn = filterMenu.getByRole('button', { name: 'จองสำเร็จ' });
        await statusBtn.click();

        // 4. เลือกช่วงเวลา "7 วัน"
        const periodBtn = filterMenu.getByRole('button', { name: '7 วัน' });
        await periodBtn.click();

        // 5. คลิกปิดตัวกรอง หรือคลิกพื้นที่ข้างนอกเพื่อให้ตัวกรองทำงาน (ถ้าไม่มีปุ่ม Apply)
        // จาก snapshot ดูเหมือนว่าพอคลิกแล้วจะเลือกทันที หรือต้องกดที่ไอคอน 'ตัวกรอง' ซ้ำ
        await page.getByRole('button', { name: /ตัวกรอง/ }).click();

        // 6. ตรวจสอบผลลัพธ์: ทุก Card ที่แสดงต้องมีสถานะ "จองสำเร็จ"
        // สโคปเฉพาะในส่วนรายการจอง (ref=e93)
        const bookingList = page.locator('div').filter({ has: page.getByRole('heading', { level: 3 }) }).first();
        await expect(bookingList).toContainText("จองสำเร็จ");
    });
});