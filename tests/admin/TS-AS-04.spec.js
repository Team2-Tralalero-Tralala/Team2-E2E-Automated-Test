import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToCreateStorePage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าสร้างร้านค้า
 * Input: 
 * - page: object ของ Playwright Page
 * Action: 
 * 1. ตรวจสอบเมนู "จัดการร้านค้า" หากยังไม่แสดง ให้คลิกเมนูแม่ "จัดการชุมชน" เพื่อเปิดลิสต์
 * 2. รอจนกว่าเมนู "จัดการร้านค้า" จะแสดงผลและทำการคลิก
 * 3. ตรวจสอบว่า Browser ไปที่หน้ารายการร้านค้า (/admin/community/stores)
 * 4. คลิกปุ่ม "เพิ่มร้านค้า"
 * 5. ตรวจสอบว่า Browser ไปที่หน้าสร้างร้านค้า (/admin/community/store/create)
 * Output:
 * - ไม่มี return value, Browser จะถูก Navigate ไปยัง URL หน้าสร้างร้านค้า
 */
async function goToCreateStorePage(page) {
    const manageCommunity = page.getByRole("link", { name: "จัดการชุมชน" }).or(page.getByText("รายละเอียดของชุมชน"));

    const manageStore = page.getByRole("link", { name: "จัดการร้านค้า" }).or(page.getByText("จัดการร้านค้า"));
    if (!await manageStore.isVisible()) {
        await manageCommunity.click();
    }
    await expect(manageStore).toBeVisible();
    await manageStore.click();
    await expect(page).toHaveURL(/admin\/community\/stores/);

    const addStoreButton = page.getByRole('button', { name: /เพิ่มร้านค้า/ });
    await expect(addStoreButton).toBeVisible();
    await addStoreButton.click();
    await expect(page).toHaveURL(/admin\/community\/store\/create/)
}

/**
 * uploadCoverImage - ฟังก์ชันอัปโหลดรูปภาพหน้าปก (Cover Image)
 * Input: 
 * - page: object ของ Playwright Page
 * - fileRelativePath: String = path ของไฟล์รูปภาพ (Relative Path)
 * Action: 
 * 1. แปลง Relative Path เป็น Absolute Path
 * 2. ค้นหา Section ที่มีข้อความ "อัพโหลดภาพหน้าปก *" และมี Input File ซ่อนอยู่
 * 3. ตรวจสอบว่าพบ Input File จำนวน 1 ตำแหน่ง
 * 4. สั่งอัปโหลดไฟล์ไปยัง Input ดังกล่าว
 * Output:
 * - ไม่มี return value, ไฟล์หน้าปกถูกอัปโหลด
 */
async function uploadCoverImage(page, fileRelativePath) {
    const filePath = path.join(process.cwd(), fileRelativePath);

    const section = page.locator('div')
        .filter({ has: page.getByText(/^อัพโหลดภาพหน้าปก \*$/) })
        .filter({ has: page.locator('input[type="file"]') })
        .last();

    const input = section.locator('input[type="file"]');

    await expect(input).toHaveCount(1);

    await input.setInputFiles(filePath);
}

/**
 * uploadExtraImages - ฟังก์ชันอัปโหลดรูปภาพเพิ่มเติม (รองรับหลายไฟล์)
 * Input: 
 * - page: object ของ Playwright Page
 * - filesRelativePaths: Array<String> = รายชื่อ path ของไฟล์รูปภาพ
 * Action: 
 * 1. แปลงรายการ Relative Path เป็น Absolute Path ทั้งหมด
 * 2. ค้นหา Section โดยอ้างอิงจากปุ่ม "เพิ่มไฟล์" (เพื่อความแม่นยำและแยกจากรูปปก)
 * 3. ค้นหา Input File ที่อยู่ใน Section นั้น
 * 4. วนลูป (Loop) เพื่ออัปโหลดไฟล์ทีละรูป (เนื่องจาก Input ไม่รองรับการใส่ Array ทีเดียว)
 * 5. รอตรวจสอบ (Assertion) จนกว่าจำนวนปุ่ม "ลบไฟล์" จะเพิ่มขึ้นครบตามจำนวนไฟล์ที่อัปโหลด
 * Output:
 * - ไม่มี return value, รูปภาพทั้งหมดถูกเพิ่มเข้าสู่รายการสำเร็จ
 */
async function uploadExtraImages(page, filesRelativePaths) {
    const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));

    const section = page.locator('div')
        .filter({ has: page.getByRole('button', { name: 'เพิ่มไฟล์' }) })
        .last();

    const input = section.locator('input[type="file"]');

    await expect(input).toBeAttached();

    // วนลูปอัปโหลดทีละไฟล์ (Sequential Upload)
    for (const file of files) {
        await input.setInputFiles(file);
        // หาก UI มี Animation การโหลด อาจต้องรอให้รายการเก่าขึ้นก่อน ค่อยอัปไฟล์ถัดไป แต่ปกติ Framework ส่วนใหญ่จะรับค่าต่อเนื่องได้เลย
    }

    const removeBtns = page.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });

    await expect(async () => {
        const count = await removeBtns.count();
        expect(count).toBeGreaterThanOrEqual(files.length);
    }).toPass({ timeout: 15000 });
}

test.describe("Admin - Add Store", () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await loginAs(page, "admin4");
        await expect(page).toHaveURL(/admin\/community\/own/);
    });

    /**
     * TS-AS-04.1
     * Admin สร้างร้านค้าได้ เมื่อกรอกข้อมูลครบ
     */
    test("TS-AS-04.1: Admin สร้างร้านค้าได้ เมื่อกรอกข้อมูลครบ", async ({ page }) => {
        await goToCreateStorePage(page);

        await page.getByLabel("ชื่อร้านค้า *").fill("Plearn Tiew (เพลินเที่ยว)")

        await page.getByLabel("รายละเอียดร้านค้า *").fill("เพลินทุกที่...ดีทุกทริป")
        await page.getByLabel("บ้านเลขที่ *").fill("400/4")
        await page.getByLabel("หมู่ที่").fill("1")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'นครนายก' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'เมืองนครนายก' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'บ้านใหญ่' }).click();

        await page.getByLabel("คำอธิบายที่อยู่").fill("เลี้ยวซ้ายหน้าโรงแรมวันเดอร์ลิสต์ และ ตรงไป 1 กม.")

        await page.getByLabel('ละติจูด *').fill('14.204480258166297');
        await page.getByLabel('ลองจิจูด *').fill('101.21594096638655');

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-3-Food' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        page.waitForURL(/\/admin\/community\/stores/, { timeout: 60000 });

        const closeButton = page.getByRole('button', { name: 'ปิด' });
        await expect(closeButton).toBeVisible();
        await closeButton.click();

        // เช็คว่ามีชื่อในตารางจัดการร้านค้ามั้ย
        await expect(page.getByRole('cell', { name: 'Plearn Tiew (เพลินเที่ยว)' })).toBeVisible();

        // เช็คโดยการค้นหา
        const newStoreName = "Plearn Tiew (เพลินเที่ยว)";
        await page.getByPlaceholder('ค้นหา').fill(newStoreName);
        await page.keyboard.press('Enter');
        await expect(page.getByRole('cell', { name: newStoreName })).toBeVisible();
    });

    /**
     * TS-AS-04.2
     * Admin ไม่สามารถสร้างร้านค้าได้ เมื่อกรอกข้อมูลไม่ครบ
     */
    test("TS-AS-04.2: Admin ไม่สามารถสร้างร้านค้าได้ เมื่อกรอกข้อมูลไม่ครบ", async ({ page }) => {
        await goToCreateStorePage(page);

        await page.getByLabel("ชื่อร้านค้า *").fill("Plearn Tiew (เพลินเที่ยว)")

        // await page.getByLabel("รายละเอียดร้านค้า *").fill("เพลินทุกที่...ดีทุกทริป") <--ไม่กรอก รายละเอียดร้านค้า

        await page.getByLabel("บ้านเลขที่ *").fill("400/4")
        await page.getByLabel("หมู่ที่").fill("1")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'นครนายก' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'เมืองนครนายก' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'บ้านใหญ่' }).click();

        await page.getByLabel("คำอธิบายที่อยู่").fill("เลี้ยวซ้ายหน้าโรงแรมวันเดอร์ลิสต์ และ ตรงไป 1 กม.")

        await page.getByLabel('ละติจูด *').fill('14.204480258166297');
        await page.getByLabel('ลองจิจูด *').fill('101.21594096638655');

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-3-Food' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        const errorDialog = page.getByRole("dialog").filter({ hasText: /ข้อมูลไม่ถูกต้อง/ });
        await expect(errorDialog).toBeVisible();
        // await errorDialog.getByRole("button", { name: "ปิด" }).click();
        // await expect(errorDialog).toBeHidden();
        // await expect(page).toHaveURL(/admin\/community\/store\/create/);

        // ใส่บรรทัดนี้เพื่อหยุดโปรแกรม เอาไว้แคป
        // await page.pause();
        // แคปทั้งหน้า
        //await page.screenshot({ path: 'error-dialog.png' });
        // หรือ แคปเฉพาะกล่อง Error
        // await errorDialog.screenshot({ path: 'only-dialog.png' });
    });

    /**
     * TS-AS-04.3
     * คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อนระบบไม่บันทึกข้อมูล
     */
    test("TS-AS-04.3: คลิกปุ่ม (Button) 'ยกเลิก' ในหน้าต่างแสดงผลซ้อนระบบไม่บันทึกข้อมูล", async ({ page }) => {
        await goToCreateStorePage(page);

        await page.getByLabel("ชื่อร้านค้า *").fill("Plearn Tiew (เพลินเที่ยว)")

        await page.getByLabel("รายละเอียดร้านค้า *").fill("เพลินทุกที่...ดีทุกทริป")
        await page.getByLabel("บ้านเลขที่ *").fill("400/4")
        await page.getByLabel("หมู่ที่").fill("1")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'นครนายก' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'เมืองนครนายก' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'บ้านใหญ่' }).click();

        await page.getByLabel("คำอธิบายที่อยู่").fill("เลี้ยวซ้ายหน้าโรงแรมวันเดอร์ลิสต์ และ ตรงไป 1 กม.")

        await page.getByLabel('ละติจูด *').fill('14.204480258166297');
        await page.getByLabel('ลองจิจูด *').fill('101.21594096638655');

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-3-Food' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const cancelButton = page.getByRole('button', { name: 'ยกเลิก' });
        await expect(cancelButton).toBeVisible();
        // await page.screenshot({ path: 'confirm-dialog-before-cancel.png' });
        await cancelButton.click();

        await expect(page).toHaveURL(/admin\/community\/store\/create/)
    });
    /**
     * TS-AS-04.4
     * คลิกปุ่ม (Button) "ยกเลิก" ในหน้าสร้างร้านค้า ระบบกลับไปยังหน้า "จัดการร้านค้า"
     */
    test("TS-AS-04.4: คลิกปุ่ม (Button) 'ยกเลิก' ในหน้าสร้างร้านค้า ระบบกลับไปยังหน้า 'จัดการร้านค้า'", async ({ page }) => {
        await goToCreateStorePage(page);

        await page.getByLabel("ชื่อร้านค้า *").fill("Soul Day (โซลเดย์)")

        await page.getByRole('button', { name: 'ยกเลิก' }).click();

        const cancelButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();

        await expect(page).toHaveURL(/admin\/community\/stores/)
    });

});

//npx playwright codegen http://dekdee2.informatics.buu.ac.th:4080/guest/partner/login
//npx playwright test tests/admin/TS-AS-04.spec.js --headed
// npx playwright test tests/admin/TS-AS-04.spec.js -g "TS-AS-04\.1\b" --headed

