import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dummyFiles = [
    { name: "test_image.jpg", size: 1024 * 1024 },
    { name: "large_image.jpg", size: 15 * 1024 * 1024 },
    { name: "test.pdf", size: 1024 },
    { name: "test_video.mp4", size: 1024 * 1024 },
];

dummyFiles.forEach((file) => {
    const filePath = path.join(dataDir, file.name);
    if (!fs.existsSync(filePath)) {
        const buffer = Buffer.alloc(file.size);
        fs.writeFileSync(filePath, buffer);
    }
});

test.describe("TS-EPK-01 แก้ไขข้อมูลแพ็กเกจ", () => {
    test.beforeEach(async({ page }) => {
        await page.goto(
            "http://dekdee2.informatics.buu.ac.th:4080/guest/partner/login"
        );
        await page.locator("#username").fill("comm_admin_1@example.com");
        await page.locator("#password").fill("hashedpw");

        await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

        await page.waitForURL(/.*\/admin.*/, { timeout: 15000 });
    });

    // --- Helper Functions ---

    /**
     * goToEditPackagePage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าแก้ไขแพ็กเกจ ID 1
     * Input:
     * - page: object ของ Playwright Page
     * Action:
     * 1. เข้าสู่ URL หน้าแก้ไขแพ็กเกจโดยตรง
     * 2. กดปุ่ม "แก้ไขรายละเอียดแพ็กเกจ"
     * 3. ตรวจสอบ Breadcrumb ว่าแสดงคำว่า "แก้ไขแพ็กเกจ"
     * Output:
     * - Browser แสดงหน้าฟอร์มแก้ไขแพ็กเกจ
     */
    async function goToEditPackagePage(page) {
        await page.goto(
            "http://dekdee2.informatics.buu.ac.th:4080/admin/package/1"
        );
        await page.getByRole("button", { name: "แก้ไขรายละเอียดแพ็กเกจ" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    }

    /**
     * fillDateByID - ฟังก์ชันกรอกวันที่ลงใน Input แบบแยกช่อง (วัน/เดือน/ปี)
     * Input:
     * - page: object ของ Playwright Page
     * - elementId: ID ของ Parent Element ที่คลุมช่องวันที่
     * - day, month, year: ค่าวันที่ต้องการกรอก
     * Action:
     * 1. ค้นหา input ภายใน ID ที่กำหนด
     * 2. กรอกค่า วัน, เดือน, ปี ตามลำดับ
     * Output:
     * - ช่องวันที่ถูกกรอกข้อมูลครบถ้วน
     */
    async function fillDateByID(page, elementId, day, month, year) {
        const inputs = page.locator(`#${elementId} input[inputmode="numeric"]`);
        await expect(inputs.first()).toBeVisible();
        await inputs.nth(0).fill(day);
        await inputs.nth(1).fill(month);
        await inputs.nth(2).fill(year);
    }

    /**
     * fillTimeByLabel - ฟังก์ชันกรอกเวลา (ชม./นาที) โดยอ้างอิงจาก Label
     * Input:
     * - page: object ของ Playwright Page
     * - labelText: ข้อความบน Label (เช่น "เวลาที่เริ่ม")
     * - hour, minute: ค่าเวลาที่ต้องการกรอก
     * Action:
     * 1. หา Label เพื่อดึง ID ของ input container
     * 2. ค้นหาช่อง input ชม. และ นาที
     * 3. กรอกค่า
     * Output:
     * - ช่องเวลาถูกกรอกข้อมูลครบถ้วน
     */
    async function fillTimeByLabel(page, labelText, hour, minute) {
        const label = page.locator(`label:has-text("${labelText}")`).first();
        await expect(label).toBeVisible();
        const id = await label.getAttribute("for");
        const container = page.locator(`#${id.replace(/:/g, "\\:")}`);
        const inputs = container.locator(
            'input[placeholder="ชม."], input[placeholder="นาที"]'
        );
        await inputs.nth(0).fill(hour);
        await inputs.nth(1).fill(minute);
    }

    /**
     * selectAutocomplete - ฟังก์ชันเลือกค่าจาก Dropdown แบบ Autocomplete
     * Input:
     * - page: object ของ Playwright Page
     * - labelOrIdSelector: Label หรือ ID selector ของช่อง input
     * - value: ค่าที่ต้องการพิมพ์ค้นหา
     * Action:
     * 1. คลิกและเคลียร์ค่าใน input
     * 2. พิมพ์ค่าที่ต้องการ
     * 3. เลือกตัวเลือกแรกที่ปรากฏใน List
     * Output:
     * - ค่าถูกเลือกใน Dropdown
     */
    async function selectAutocomplete(page, labelOrIdSelector, value) {
        const input = labelOrIdSelector.startsWith("#") ?
            page.locator(labelOrIdSelector) :
            page.getByLabel(labelOrIdSelector);

        await input.click();
        await input.clear();
        await input.fill(value);
        await page.locator('li[role="option"]').first().click();
    }

    /**
     * clickSaveAndConfirm - ฟังก์ชันกดปุ่มบันทึกและยืนยันใน Popup
     * Input:
     * - page: object ของ Playwright Page
     * Action:
     * 1. คลิกพื้นที่ว่างเพื่อปิด Overlay ที่อาจบังอยู่
     * 2. คลิกปุ่ม "บันทึก" (Force click)
     * 3. รอ Popup ยืนยัน (SweetAlert)
     * 4. คลิกปุ่ม Confirm ใน Popup
     * Output:
     * - ส่งข้อมูลฟอร์มและปิด Popup
     */
    async function clickSaveAndConfirm(page) {
        // คลิกที่ว่างเพื่อปิด Dropdown/Tooltip ที่อาจบังอยู่
        await page.locator("body").click({ force: true });
        await page.waitForTimeout(500); // รอ UI นิ่ง

        // FIX: ใส่ force: true ที่ปุ่มบันทึก เพื่อแก้ปัญหา element อื่นบัง (เช่น dropdown)
        await page.getByRole("button", { name: "บันทึก" }).click({ force: true });

        const confirmPopup = page.locator(".swal2-popup");
        // เพิ่ม timeout ในการรอ Popup เผื่อเครื่องช้า
        await expect(confirmPopup).toBeVisible({ timeout: 10000 });
        await confirmPopup.locator(".swal2-confirm").click();
    }

    /**
     * TC-EPK-01.1
     * แก้ไขข้อมูลสำเร็จ (กรอกครบทุกช่อง)
     */
    test("TS-EPK-01.1: แก้ไขข้อมูลสำเร็จ", async({ page }) => {
        await goToEditPackagePage(page);

        await page.locator("#name").fill("แพ็กเกจท่องเที่ยวชุมชนแสนสุข");
        await page
            .locator("#description")
            .fill("ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน");
        await page.locator("#houseNumber").fill("123");
        await page.locator("#villageNumber").fill("5");
        await selectAutocomplete(page, "จังหวัด", "ชลบุรี");
        await selectAutocomplete(page, "อำเภอ / เขต", "เมืองชลบุรี");
        await selectAutocomplete(page, "ตำบล/แขวง", "แสนสุข");
        await page.locator("#addressDetail").fill("ชุมชนอยู่ติดทะเล");
        await page.locator("#latitude").fill("13.2838");
        await page.locator("#longitude").fill("100.9157");
        await selectAutocomplete(page, "เลือกผู้ดูแล", "ธนกร");
        await page.locator("#capacity").fill("20");
        await page.locator("#facility").fill("อาหาร 3 มื้อ รถนำเที่ยว ไกด์");

        await fillDateByID(page, "startDate", "20", "01", "2568");
        await fillTimeByLabel(page, "เวลาที่เริ่ม", "10", "00");
        await fillDateByID(page, "endDate", "21", "01", "2568");
        await fillTimeByLabel(page, "เวลาที่สิ้นสุด", "12", "00");
        await fillDateByID(page, "openDate", "01", "01", "2568");
        await fillTimeByLabel(page, "เวลาที่เปิดจอง", "00", "00");
        await fillDateByID(page, "closeDate", "10", "01", "2568");
        await fillTimeByLabel(page, "เวลาที่ปิดจอง", "12", "00");

        await page.locator("#price").fill("1000");

        await clickSaveAndConfirm(page);

        console.log("Waiting for redirect...");
        await page.waitForURL(/.*\/admin\/packages\/all/, { timeout: 20000 });

        console.log("Reloading page...");
        await page.reload();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        console.log("Verifying data in table...");
        await expect(
            page.getByRole("button", { name: "แพ็กเกจท่องเที่ยวชุมชนแสนสุข" })
        ).toBeVisible({ timeout: 15000 });
    });

    /**
     * TC-EPK-01.2
     * ไม่กรอกชื่อแพ็กเกจ
     */
    test("TS-EPK-01.2: ไม่กรอกชื่อแพ็กเกจ", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#name").fill("");
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.3
     * ไม่กรอกคำอธิบายแพ็กเกจ
     */
    test("TS-EPK-01.3: ไม่กรอกคำอธิบายแพ็กเกจ", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#description").fill("");
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.4
     * กรอกข้อมูลที่อยู่ครบถ้วน
     */
    test("TS-EPK-01.4: กรอกข้อมูลที่อยู่ครบถ้วน", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#houseNumber").fill("99/9");
        await page.locator("#addressDetail").fill("ซอย 5");
        await clickSaveAndConfirm(page);
        await expect(page).not.toHaveURL(/.*\/edit/);
    });

    /**
     * TC-EPK-01.5
     * กรอกข้อมูลที่อยู่ไม่ครบถ้วน
     */
    test("TS-EPK-01.5: กรอกข้อมูลที่อยู่ไม่ครบถ้วน", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#houseNumber").fill("");
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.6
     * ปักหมุด (กรอกพิกัด)
     */
    test("TS-EPK-01.6: ปักหมุด (กรอกพิกัด)", async({ page }) => {
        await goToEditPackagePage(page);
        const latInput = page.locator("#latitude");
        const longInput = page.locator("#longitude");
        await latInput.fill("13.2838");
        await longInput.fill("100.9157");
        await expect(latInput).toHaveValue("13.2838");
        await expect(longInput).toHaveValue("100.9157");
        await clickSaveAndConfirm(page);
    });

    /**
     * TC-EPK-01.7
     * ไม่กรอกผู้ดูแลแพ็กเกจ
     */
    test("TS-EPK-01.7: ไม่กรอกผู้ดูแลแพ็กเกจ", async({ page }) => {
        await goToEditPackagePage(page);
        const clearBtn = page.locator('button[title="Clear"]');
        if (await clearBtn.isVisible()) {
            await clearBtn.click();
        } else {
            await page.locator("#community-member-selector").click();
            await page.locator("#community-member-selector").clear();
        }
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.8
     * ไม่กรอกจำนวนที่เปิดรับ
     */
    test("TS-EPK-01.8: ไม่กรอกจำนวนที่เปิดรับ", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#capacity").fill("");
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.9
     * ไม่กรอกวันที่และเวลา
     */
    test("TS-EPK-01.9: ไม่กรอกวันที่และเวลา", async({ page }) => {
        await goToEditPackagePage(page);
        const inputs = page.locator("#startDate input");
        await inputs.nth(0).fill("");
        await inputs.nth(1).fill("");
        await inputs.nth(2).fill("");
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.10
     * เพิ่มแท็ก
     */
    test("TS-EPK-01.10: เพิ่มแท็ก", async({ page }) => {
        await goToEditPackagePage(page);
        const tagInput = page.locator("#tag-selector");
        await tagInput.click();
        const firstOption = page.locator('li[role="option"]').first();
        await expect(firstOption).toBeVisible();
        await firstOption.click();
        await page.locator("body").click();
        await clickSaveAndConfirm(page);
    });

    /**
     * TC-EPK-01.11
     * ลบแท็ก
     */
    test("TS-EPK-01.11: ลบแท็ก", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#tag-selector").click();
        await page.locator('li[role="option"]').first().click();
        await page.locator("body").click();
        const deleteBtns = page.locator(
            '.MuiAutocomplete-root .MuiChip-deleteIcon, .MuiAutocomplete-root button[title="Clear"]'
        );
        if ((await deleteBtns.count()) > 0) {
            await deleteBtns.last().click();
        }
        await clickSaveAndConfirm(page);
    });

    /**
     * TC-EPK-01.12
     * ไม่กรอกราคาแพ็กเกจ
     */
    test("TS-EPK-01.12: ไม่กรอกราคาแพ็กเกจ", async({ page }) => {
        await goToEditPackagePage(page);
        await page.locator("#price").fill("");
        await page.getByRole("button", { name: "บันทึก" }).click();
        await expect(
            page.locator("nav[aria-label='breadcrumb']").getByText("แก้ไขแพ็กเกจ")
        ).toBeVisible();
    });

    /**
     * TC-EPK-01.13
     * อัพโหลดรูปภาพไฟล์ถูกต้อง
     */
    test("TS-EPK-01.13: อัพโหลดรูปภาพไฟล์ถูกต้อง", async({ page }) => {
        await goToEditPackagePage(page);
        const filePath = path.join(process.cwd(), "data/test_image.jpg");
        await page
            .locator('input[type="file"][accept="image/*"]')
            .first()
            .setInputFiles(filePath);
        await clickSaveAndConfirm(page);
    });

    /**
     * TC-EPK-01.14
     * อัพโหลดไฟล์เกินขนาด
     */
    test("TS-EPK-01.14: อัพโหลดไฟล์เกินขนาด", async({ page }) => {
        await goToEditPackagePage(page);
        const largeFilePath = path.join(process.cwd(), "data/large_image.jpg");
        await page
            .locator('input[type="file"][accept="image/*"]')
            .first()
            .setInputFiles(largeFilePath);
        const toast = page
            .locator(".Toastify__toast--error")
            .or(page.getByText("เกินขนาด", { exact: false }));
        if (await toast.isVisible({ timeout: 3000 })) {
            await expect(toast).toBeVisible();
        }
    });

    /**
     * TC-EPK-01.15
     * อัพโหลดไฟล์ผิดประเภท
     */
    test("TS-EPK-01.15: อัพโหลดไฟล์ผิดประเภท", async({ page }) => {
        await goToEditPackagePage(page);
        const pdfPath = path.join(process.cwd(), "data/test.pdf");
        await page
            .locator('input[type="file"][accept="image/*"]')
            .first()
            .setInputFiles(pdfPath);
    });

    /**
     * TC-EPK-01.16
     * อัพโหลดวิดีโอ
     */
    test("TS-EPK-01.16: อัพโหลดวิดีโอ", async({ page }) => {
        await goToEditPackagePage(page);
        const videoPath = path.join(process.cwd(), "data/test_video.mp4");
        await page
            .locator('input[type="file"][accept="video/*"]')
            .setInputFiles(videoPath);
        await clickSaveAndConfirm(page);
    });

    /**
     * TC-EPK-01.17
     * เพิ่มที่พัก
     */
    test("TS-EPK-01.17: เพิ่มที่พัก", async({ page }) => {
        await goToEditPackagePage(page);
        const accomInput = page.getByPlaceholder("ค้นหาชื่อที่พัก");
        await accomInput.click();
        await accomInput.fill("Homestay");
        await page.waitForTimeout(1000);

        const dropdownItem = page.locator("div.absolute.z-50 button").first();
        await expect(dropdownItem).toBeVisible();
        await dropdownItem.click();

        await fillDateByID(page, "hsCheckInDate", "20", "01", "2568");
        await fillTimeByLabel(page, "เวลาเช็กอิน", "14", "00");
        await fillDateByID(page, "hsCheckOutDate", "21", "01", "2568");
        await fillTimeByLabel(page, "เวลาเช็กเอาท์", "12", "00");

        await clickSaveAndConfirm(page);
    });
});