import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("Admin - Edit Community", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "admin");
        await expect(page).toHaveURL(/admin\/community\/own/);
    });

    test("TS-AS-01.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
        await goToPageStore(page);
        await fillFormCorrect(page);
    });
    test("TS-AS-01.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
        await goToPageStore(page);
        await fillFormIncorrect(page);
    });
    test("TS-AS-01.3: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
        await goToPageStore(page);
    });
    test("TS-AS-01.4: เพิ่มแท็ก", async ({ page }) => {
        await goToPageStore(page);
    });
    test("TS-AS-01.5: เพิ่มรูปภาพ", async ({ page }) => {
        await goToPageStore(page);
    });

    async function uploadExtraImages(page, filesRelativePaths) {
        const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));
        const section = page.getByRole("heading", { name: "อัพโหลดรูปภาพเพิ่มเติม *" }).locator("..");
        const input = section.locator('input[type="file"]');
        await expect(input).toHaveCount(1);
        const removeBtns = section.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });
        const before = await removeBtns.count();
        for (const filePath of files) {
            await input.setInputFiles(filePath);
        }
        const expected = before + files.length;
        await expect(removeBtns).toHaveCount(expected, { timeout: 60000 });
    }

    async function uploadCoverImages(page, filesRelativePaths) {
        const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));
        const section = page.getByRole("heading", { name: "อัพโหลดภาพหน้าปก *" }).locator("..");
        const input = section.locator('input[type="file"]');
        await expect(input).toHaveCount(1);
        const removeBtns = section.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });
        const before = await removeBtns.count();
        for (const filePath of files) {
            await input.setInputFiles(filePath);
        }
        const expected = before + files.length;
        await expect(removeBtns).toHaveCount(expected, { timeout: 60000 });
    }

    /*
    * คำอธิบาย : ไปที่หน้าร้านค้า
    * Input: page (Playwright Page Object)
    * Output : -
    */
    async function goToPageStore(page) {
        await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
        let textHeader = page.getByText('รายละเอียดของชุมชน');
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'แก้ไข' }).click();
        textHeader = page.getByRole('link', { name: 'แก้ไขวิสาหกิจชุมชน' });
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'ข้อมูลชุมชน' }).click();
        textHeader = page.getByRole('button', { name: 'จัดการร้านค้า' });
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'จัดการร้านค้า' }).click();
        textHeader = page.getByRole('heading', { name: 'จัดการร้านค้า' })
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: '＋ เพิ่มร้านค้า' }).click();
    }

    async function fillFormCorrect(page) {
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).fill('ป้านกน้อย');
        await page.getByRole('textbox', { name: 'รายละเอียดร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'รายละเอียดร้านค้า *' }).fill('ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีสได้จ๊ะลูก ๆ');
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
        await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
        await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('1');
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'ชลบุรี' }).click();
        await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
        await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'แสนสุข' }).click();
        await page.getByRole('textbox', { name: 'รหัสไปรษณีย์ *' }).click();
        await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
        await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ติดวัดแสนสุข');
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).click();
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).fill('มหาวิทยาลัยบูรพา');
        await page.getByRole('listitem').filter({ hasText: 'มหาวิทยาลัยบูรพา, 169' }).click();
        await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
        await page.getByRole('option', { name: 'Tag-3-Food' }).click();
        await page.getByRole('option', { name: 'Tag-8-Food' }).click();
        await uploadCoverImages(page, ["assets/photo/store-1.jpg"]);
        await uploadExtraImages(page, [
            "assets/photo/somtom-1.jpg",
            "assets/photo/somtom-2.jpg",
        ]);
        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        let textHeader = page.getByText(/สำเร็จ/);
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'ปิด' }).click();
    }

        async function fillFormIncorrect(page) {
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).fill('ป้านกน้อย');
        await page.getByRole('textbox', { name: 'รายละเอียดร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'รายละเอียดร้านค้า *' }).fill('ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีสได้จ๊ะลูก ๆ');
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
        await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
        await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('1');
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'ชลบุรี' }).click();
        await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
        await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'แสนสุข' }).click();
        await page.getByRole('textbox', { name: 'รหัสไปรษณีย์ *' }).click();
        await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
        await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ติดวัดแสนสุข');
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).click();
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).fill('มหาวิทยาลัยบูรพา');
        await page.getByRole('listitem').filter({ hasText: 'มหาวิทยาลัยบูรพา, 169' }).click();
        await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
        await page.getByRole('option', { name: 'Tag-3-Food' }).click();
        await page.getByRole('option', { name: 'Tag-8-Food' }).click();
        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        let textHeader = page.getByText(/ไม่ถูกต้อง/);
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'ปิด' }).click();
    }

    async function fillFormWithoutAddImage(page) {
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).fill('ป้านกน้อย');
        await page.getByRole('textbox', { name: 'รายละเอียดร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'รายละเอียดร้านค้า *' }).fill('ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีสได้จ๊ะลูก ๆ');
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
        await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
        await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('1');
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'ชลบุรี' }).click();
        await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
        await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'แสนสุข' }).click();
        await page.getByRole('textbox', { name: 'รหัสไปรษณีย์ *' }).click();
        await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
        await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ติดวัดแสนสุข');
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).click();
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).fill('มหาวิทยาลัยบูรพา');
        await page.getByRole('listitem').filter({ hasText: 'มหาวิทยาลัยบูรพา, 169' }).click();
        await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
        await page.getByRole('option', { name: 'Tag-3-Food' }).click();
        await page.getByRole('option', { name: 'Tag-8-Food' }).click();
        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('dialog', { name: 'ข้อมูลไม่ถูกต้อง' }).click();
        await page.getByRole('button', { name: 'ปิด' }).click();
        await page.locator('#add-btn-_r_q_').click();
        await page.locator('#add-btn-_r_q_').setInputFiles('Screenshot 2025-11-26 222406.png');
        await page.getByRole('button', { name: 'เพิ่มไฟล์' }).click();
        await page.getByRole('button', { name: 'เพิ่มไฟล์' }).setInputFiles('Screenshot 2025-11-26 221307.png');
        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ปิด' }).click();
    }
});