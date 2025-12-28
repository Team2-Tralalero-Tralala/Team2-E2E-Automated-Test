/**
 * role : super admin
 * Requirement 20 : เพิ่มร้านค้า
 * TS-AST-01 : ผู้ใช้งานบัญชี Super Admin ต้องสามารถเพิ่มร้านค้า  (จากหน้าเพิ่มชุมขน)
 */
import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * นำทางไปยังหน้าสร้างร้านค้าตามลำดับขั้นตอนจริง
 */
async function goToPageCreateStore(page) {
    // 1. เลือกชุมชนเป้าหมาย
    await page.getByRole('link', { name: 'วิสาหกิจชุมชนท่องเที่ยวเชิงเกษตรบ้านร่องกล้า เทส' }).click();

    // 2. คลิกปุ่มแสดงจำนวนร้านค้า
    await page.getByRole('button', { name: /ร้านค้า จำนวน/ }).click();

    // 3. คลิกปุ่มจัดการ
    await page.getByRole('button', { name: 'จัดการ' }).click();

    // 4. คลิกปุ่มเพิ่มร้านค้า
    await page.getByRole('button', { name: '＋ เพิ่มร้านค้า' }).click();

    // ตรวจสอบว่า URL มาถึงหน้าสร้างร้านค้าแล้ว
    await expect(page).toHaveURL(/.*\/store\/create/);
}

/**
 * อัปโหลดรูปหน้าปก
 */
async function uploadCoverImage(page) {
    const imagePath = path.join(process.cwd(), "assets/storePhoto/cover.jpg");
    await page.locator('input[type="file"]').first().setInputFiles(imagePath);

    const imageDialog = page.getByRole("dialog");
    await expect(imageDialog).toBeVisible();

    await imageDialog.getByRole("button", { name: "ใช้รูปเดิม" }).click();
}

/**
 * อัปโหลดรูปภาพ Gallery (5 รูป)
 */
async function uploadGalleryImage(page) {
    const images = ["images1.jpg", "images2.jpg", "images3.jpg", "images4.jpg", "images5.jpg"];

    for (const imgName of images) {
        const imagePath = path.join(process.cwd(), `assets/storePhoto/${imgName}`);
        // ใช้ .last() เพราะปกติ input ของ gallery จะอยู่ท้ายสุด หรือใช้ index ถ้ามีหลายตัว
        await page.locator('input[type="file"]').last().setInputFiles(imagePath);

        const imageDialog = page.getByRole("dialog");
        if (await imageDialog.isVisible({ timeout: 5000 })) {
            await imageDialog.getByRole("button", { name: "ใช้รูปเดิม" }).click();
        }
    }
}

test.describe("SuperAdmin - Create Store", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });

    /**
     * TC-AST-01.1
     * กรอกข้อมูลครบถ้วน สร้างร้านค้าสำเร็จ
     */
    test("TS-AST-01.1: SuperAdmin create Store successfully", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "ชื่อร้านค้า *" })
            .fill("ร้านค้าเกษตรกร");
        await page
            .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
            .fill("สินค้าจากเกษตรกร");
        await page
            .getByRole("textbox", { name: "บ้านเลขที่ *" })
            .fill("123");
        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(
            page.getByRole("cell", { name: "ร้านค้าเกษตรกร" })
        ).toBeVisible();
    });

    /**
     * TC-AST-01.2
     * กรอกข้อมูลไม่ครบถ้วนและบันทึกการสร้างร้านค้า
     */
    test("TS-AST-01.2: SuperAdmin create Store failed - Incomplete Information", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page.getByRole('button', { name: 'Marker' }).click();
        await page.getByText('ปักหมุด', { exact: true }).click();
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(page.getByText(/กรุณากรอกชื่อร้านค้า/)).toBeVisible();
        await expect(page.getByText(/กรุณากรอกรายละเอียดของร้านค้า/)).toBeVisible();
        await expect(page.getByText(/กรุณากรอกบ้านเลขที่/)).toBeVisible();
        await expect(page.getByRole("dialog")).not.toBeVisible();
    });

    /**
     * TC-AST-01.3
     * ปักหมุดหากไม่พบสถานที่ (Pin location manually)
     */
    test("TS-AST-01.3: SuperAdmin create Store - Pin location manually", async ({
        page,
    }) => {
        await goToPageCreateStore(page);
        await page
            .getByRole("textbox", { name: "ชื่อร้านค้า *" })
            .fill("ร้านค้าเกษตรกร");
        await page
            .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
            .fill("สินค้าจากเกษตรกร");
        await page
            .getByRole("textbox", { name: "บ้านเลขที่ *" })
            .fill("123");
        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page.locator('div').filter({ hasText: /^\+− Leaflet \| © OpenStreetMap contributors$/ }).nth(1).click();
        await page.getByRole('button', { name: 'Marker' }).click();
        await page.getByText('ปักหมุด', { exact: true }).click();
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(
            page.getByRole("cell", { name: "ร้านค้าเกษตรกร" })
        ).toBeVisible();


        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
    });


    /**
             * TC-AST-01.4
             * เพิ่มแท็ก
             */
    test("TS-AST-01.4: SuperAdmin create Store successfully", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "ชื่อร้านค้า *" })
            .fill("ร้านค้าเกษตรกร");
        await page
            .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
            .fill("สินค้าจากเกษตรกร");
        await page
            .getByRole("textbox", { name: "บ้านเลขที่ *" })
            .fill("123");
        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(
            page.getByRole("cell", { name: "ร้านค้าเกษตรกร" })
        ).toBeVisible();
    });

    /**
     * TC-AST-01.5
     * ไม่เพิ่มแท็ก
     */
    test("TS-AST-01.5: SuperAdmin create Store successfully - No Tags", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ร้านค้าไม่มีแท็ก");
        await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("รายละเอียด");
        await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("111");
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'สระบุรี' }).click();
        await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
        await page.getByRole('option', { name: 'วิหารแดง' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'หนองสรวง' }).click();

        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();

        // Skip Tags

        await uploadCoverImage(page);
        await uploadGalleryImage(page);

        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ปิด' }).click();

        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
    });

    /**
     * TC-AST-01.6
     * อัปโหลดรูปหน้าปก
     */
    test("TS-AST-01.6: SuperAdmin create Store successfully - Upload Cover Image", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "ชื่อร้านค้า *" })
            .fill("ร้านค้าเกษตรกร");
        await page
            .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
            .fill("สินค้าจากเกษตรกร");
        await page
            .getByRole("textbox", { name: "บ้านเลขที่ *" })
            .fill("123");
        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(
            page.getByRole("cell", { name: "ร้านค้าเกษตรกร" })
        ).toBeVisible();
    });

    /**
     * TC-AST-01.7
     * ไม่อัพโหลดรูปภาพหน้าปก
     */
    test("TS-AST-01.7: SuperAdmin create Store successfully - No Cover Image", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ร้านค้าไม่มีรูปปก");
        await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("รายละเอียด");
        await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("222");
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'สระบุรี' }).click();
        await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
        await page.getByRole('option', { name: 'วิหารแดง' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'หนองสรวง' }).click();

        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();

        await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
        await page.getByRole('option', { name: 'Tag-6-Nature' }).click();

        await uploadGalleryImage(page);

        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ปิด' }).click();

        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
    });

    /**
     * TC-AST-01.8
     * อัปโหลดรูปภาพเพิ่มเติม
     */
    test("TS-AST-01.8: SuperAdmin create Store successfully", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "ชื่อร้านค้า *" })
            .fill("ร้านค้าเกษตรกร");
        await page
            .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
            .fill("สินค้าจากเกษตรกร");
        await page
            .getByRole("textbox", { name: "บ้านเลขที่ *" })
            .fill("123");
        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(
            page.getByRole("cell", { name: "ร้านค้าเกษตรกร" })
        ).toBeVisible();
    });

    /**
     * TC-AST-01.9
     * ไม่อัพโหลดรูปภาพเพิ่มเติม
     */
    test("TS-AST-01.9: SuperAdmin create Store successfully - No Gallery Image", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ร้านค้าไม่มีรูปเพิ่มเติม");
        await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("รายละเอียด");
        await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("333");
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'สระบุรี' }).click();
        await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
        await page.getByRole('option', { name: 'วิหารแดง' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'หนองสรวง' }).click();

        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();

        await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
        await page.getByRole('option', { name: 'Tag-6-Nature' }).click();

        await uploadCoverImage(page);

        // Skip Gallery Image

        await page.getByRole('button', { name: 'บันทึก' }).click();
        await page.getByRole('button', { name: 'ยืนยัน' }).click();
        await page.getByRole('button', { name: 'ปิด' }).click();

        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
    });

    /**
     * TC-AST-01.10
     * กรอกข้อมูลครบถ้วนและยืนยันการสร้างร้านค้า (แบบ Modal)
     */
    test("TS-AST-01.10: SuperAdmin create Store successfully", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "ชื่อร้านค้า *" })
            .fill("ร้านค้าเกษตรกร");
        await page
            .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
            .fill("สินค้าจากเกษตรกร");
        await page
            .getByRole("textbox", { name: "บ้านเลขที่ *" })
            .fill("123");
        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(
            page.getByRole("cell", { name: "ร้านค้าเกษตรกร" })
        ).toBeVisible();
    });

    /**
     * TC-AST-01.11
     * กรอกข้อมูลไม่ครบถ้วนและบันทึกการสร้างร้านค้า
     */
    test("TS-AST-01.11: SuperAdmin create Store failed - Incomplete Information", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        await page
            .getByRole("textbox", { name: "หมู่ที่" })
            .fill("2");
        await page
            .getByRole('combobox', { name: 'จังหวัด *' })
            .click();
        await page
            .getByRole('option', { name: 'สระบุรี' })
            .click();
        await page
            .getByRole("combobox", { name: "อำเภอ / เขต *" })
            .click();
        await page
            .getByRole('option', { name: 'วิหารแดง' })
            .click();
        await page
            .getByRole('combobox', { name: 'ตำบล/แขวง *' })
            .click();
        await page
            .getByRole('option', { name: 'หนองสรวง' })
            .click();
        await page
            .getByRole('textbox', { name: 'คำอธิบายที่อยู่' })
            .fill('ร้านค้าอยู่ติดวัดวิหารแดง');
        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page.getByRole('button', { name: 'Marker' }).click();
        await page.getByText('ปักหมุด', { exact: true }).click();
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' })
            .click();
        await page
            .getByRole('option', { name: 'Tag-6-Nature' })
            .click();
        await uploadCoverImage(page);
        await uploadGalleryImage(page);
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ยืนยัน' })
            .click();
        await page
            .getByRole("dialog")
            .getByRole('button', { name: 'ปิด' })
            .click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
        await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toBeVisible();
        await expect(page.getByRole("dialog")).not.toBeVisible();

    });


    /**
     * TC-AST-01.12
     * "ยกเลิกการสร้างร้านค้า (แบบ Modal)" for this one.
     */
    test("TS-AST-01.12: SuperAdmin create Store - Cancel via Modal", async ({
        page,
    }) => {
        await goToPageCreateStore(page);

        // Fill required fields to trigger the modal
        await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ร้านค้าทดสอบยกเลิก");
        await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("รายละเอียด");
        await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("444");
        await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
        await page.getByRole('option', { name: 'สระบุรี' }).click();
        await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
        await page.getByRole('option', { name: 'วิหารแดง' }).click();
        await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
        await page.getByRole('option', { name: 'หนองสรวง' }).click();

        await page
            .getByRole('textbox', { name: 'ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด' })
            .fill('วิหารแดง');
        await page
            .getByText('อำเภอวิหารแดง, จังหวัดสระบุรี, 18150, ประเทศไทยlat: 14.340134 · lng:')
            .click();
        await page
            .getByRole('button', { name: 'บันทึก' })
            .click();
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();
        await modal.getByRole('button', { name: 'ยกเลิก' }).click();
        await expect(modal).not.toBeVisible();
        await expect(page).toHaveURL(/super\/community\/1\/store\/create/);
    });

    /**
     * TC-AST-01.13
     * ยกเลิกการสร้างร้านค้า (Cancel via Page)
     */
    test("TS-AST-01.13: SuperAdmin create Store - Cancel via Page Button", async ({
        page,
    }) => {
        await goToPageCreateStore(page);
        await page.getByRole('button', { name: 'ยกเลิก' }).click();
        const modal = page.getByRole("dialog");
        await expect(modal).toBeVisible();
        await modal.getByRole('button', { name: 'ยืนยัน' }).click();
        await expect(page).toHaveURL(/super\/community\/1\/stores\/all/);
    });



});
