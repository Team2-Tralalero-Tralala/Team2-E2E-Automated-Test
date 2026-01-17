import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("Admin - Edit Community", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "admin");
        await expect(page).toHaveURL(/admin\/community\/own/);
    });

    test("TS-AS-02.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
        await goToPageStore(page);
        await fillFormCorrect(page);
    });
    test("TS-AS-02.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
        await goToPageStore(page);
        await fillFormIncorrect(page);
    });
    test("TS-AS-02.3: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
        await goToPageStore(page);
        await fillLatLng(page);
    });
    test("TS-AS-02.4: เพิ่มแท็ก", async ({ page }) => {
        await goToPageStore(page);
        await fillTag(page);
    });
    test("TS-AS-02.5: เพิ่มรูปภาพ", async ({ page }) => {
        await goToPageStore(page);
        await insertImage(page);
    });

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับอัปโหลดรูปภาพเพิ่มเติมของร้านค้าเข้าสู่ระบบ
    * Input: page (Page Object), filesRelativePaths (Array ของที่อยู่ไฟล์รูปภาพ)
    * Output : - (แสดงผลการอัปโหลดบนหน้าจอ)
    */
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

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับอัปโหลดรูปภาพหน้าปกของร้านค้า
    * Input: page (Page Object), filesRelativePaths (Array ของที่อยู่ไฟล์รูปภาพ)
    * Output : - (แสดงผลภาพหน้าปกบนหน้าจอ)
    */
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
        await page.getByRole('button', { name: /ร้านค้า จำนวน/ }).click();
        await page.getByRole('button', { name: 'จัดการ' }).click();
        textHeader = page.getByRole('heading', { name: 'จัดการร้านค้า' })
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: '＋ เพิ่มร้านค้า' }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันจำลองการกรอกข้อมูลลงในฟอร์มเพิ่ม/แก้ไขร้านค้าแบบครบถ้วนและถูกต้อง
    * Input: page (Page Object)
    * Output : บันทึกข้อมูลสำเร็จและแสดงข้อความแจ้งเตือน "สำเร็จ"
    */
    //TS-AS-02.1 กรอกข้อมูลครบถ้วน
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
        await uploadCoverImages(page, ["assets/photo/store-2.jpg"]);
        await uploadExtraImages(page, [
            "assets/photo/somtom-3.jpg",
            "assets/photo/somtom-4.jpg",
        ]);
        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        let textHeader = page.getByText(/สำเร็จ/);
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'ปิด' }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันจำลองการกรอกข้อมูลลงในฟอร์มเพิ่ม/แก้ไขร้านค้าแบบครบถ้วนและถูกต้อง
    * Input: page (Page Object)
    * Output : บันทึกข้อมูลสำเร็จและแสดงข้อความแจ้งเตือน "ไม่ถูกต้อง"
    */
    //TS-AS-02.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด
    async function fillFormIncorrect(page) {
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).click();
        await page.getByRole('textbox', { name: 'ชื่อร้านค้า *' }).fill('ป้านกน้อย');
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
        await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('11');
        await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
        await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('1');
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'ชลบุรี' }).click();
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).click();
        await page.getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' }).fill('มหาวิทยาลัยบูรพา');
        await page.getByRole('listitem').filter({ hasText: 'มหาวิทยาลัยบูรพา, 169' }).click();
        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        let textHeader = page.getByText(/ไม่ถูกต้อง/);
        await expect(textHeader).toBeVisible();
        await page.getByRole('button', { name: 'ปิด' }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับกรอกค่าพิกัดละติจูดและลองจิจูดด้วยตนเองในกรณีที่ไม่พบสถานที่จากการค้นหา
    * Input: page (Playwright Page Object)
    * Output : ค่าพิกัดถูกระบุลงในฟิลด์ที่เกี่ยวข้องและทำการปักหมุดบนแผนที่
    */
    //TS-AS-02.3 ปักหมุดหากไม่พบสถานที่
    async function fillLatLng(page) {
        await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
        await page.getByRole('spinbutton', { name: 'ละติจูด *' }).press('ControlOrMeta+a');
        await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
        await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
        await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).press('ControlOrMeta+a');
        await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
        await page.getByText('ปักหมุด', { exact: true }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับเลือกแท็ก (Tags) ที่เกี่ยวข้องกับร้านค้า
    * Input: page (Playwright Page Object)
    * Output : แท็กที่เลือกถูกแสดงในส่วนของช่องค้นหาแท็ก
    */
    //TS-AS-02.4 เพิ่มแท็ก
    async function fillTag(page) {
        await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
        await page.getByRole('option', { name: 'Tag-8-Food' }).click();
    }

    /*
    * คำอธิบาย : ฟังก์ชันสำหรับทดสอบการอัปโหลดรูปภาพทั้งภาพหน้าปกและรูปภาพเพิ่มเติม
    * Input: page (Playwright Page Object)
    * Output : รูปภาพที่เลือกถูกอัปโหลดและแสดงตัวอย่างบนหน้าฟอร์ม
    */
    //TS-AS-02.5 เพิ่มรูปภาพ
    async function insertImage(page) {
        await uploadCoverImages(page, ["assets/photo/store-2.jpg"]);
        await uploadExtraImages(page, [
            "assets/photo/somtom-3.jpg",
            "assets/photo/somtom-4.jpg",
        ]);
    }
});