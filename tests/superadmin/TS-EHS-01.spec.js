import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToEditHomestayDetailPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าแก้ไขรายละเอียดโฮมสเตย์
 * Input: 
 * - page: object ของ Playwright Page
 * - target: 
 * 1. String = ค้นหาชุมชนตามชื่อ (Regex)
 * 2. Number = ค้นหาชุมชนตามลำดับแถว (เริ่มนับที่ 1)
 * 3. Null/Undefined = เลือกชุมชนแถวแรกเสมอ
 * 
 * Action: 
 * 1. คลิกเมนู "จัดการชุมชน"
 * 2. เลือกชุมชนเป้าหมายตาม target
 * 3. คลิกแท็บ "ที่พัก" (Accommodation Accordion)
 * 4. คลิกปุ่ม "จัดการ" เพื่อดูรายการโฮมสเตย์
 * 5. เลือกโฮมสเตย์รายการแรก และคลิกปุ่ม "แก้ไข"
 * 
 * Output:
 * - ไม่มี return value, Browser จะถูก Navigate ไปยัง URL หน้าแก้ไขโฮมสเตย์ (/homestay/:id/edit)
 */
async function goToEditHomestayDetailPage(page, target = null) {
    const manageCommunity = page.getByRole("link", { name: "จัดการชุมชน" });
    await expect(manageCommunity).toBeVisible();
    await manageCommunity.click();

    await expect(page.locator("tbody tr").first()).toBeVisible();

    let targetRow;
    if (typeof target === 'string') {
        targetRow = page.getByRole("row", { name: new RegExp(target) });
    } else if (typeof target === 'number') {
        targetRow = page.locator("tbody tr").nth(target - 1);
    } else {
        targetRow = page.locator("tbody tr").first();
    }
    await targetRow.getByRole('link').first().click();

    await expect(page).toHaveURL(/super\/community\/\d+$/);

    const accommodationAccordion = page.getByRole('button', { name: /ที่พัก/ });
    await accommodationAccordion.click();

    const manageButton = page.getByRole('button', { name: 'จัดการ' });
    await expect(manageButton).toBeVisible();
    await manageButton.click();

    await expect(page).toHaveURL(/.*\/homestay\/all/);

    await page.locator('tbody tr').first().getByRole('link').first().click();

    const editButton = page.getByRole('link', { name: 'แก้ไข' });
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page).toHaveURL(/.*\/homestay\/\d+\/edit$/);
}

/**
 * panMapViaJS - ฟังก์ชันจำลองการคลิกบนแผนที่ (Leaflet) เพื่อเปลี่ยนพิกัด Latitude/Longitude
 * Input: 
 * - page: object ของ Playwright Page
 * 
 * Action: 
 * 1. ตรวจสอบว่ามี Map Container อยู่จริง
 * 2. ใช้ page.evaluate (JS Injection) เพื่อคำนวณพิกัดกลางแผนที่และสร้าง MouseEvent 'click'
 * 3. Dispatch Event ไปที่ Map Pane เพื่อให้แผนที่รับรู้การคลิก
 * 4. ตรวจสอบว่าค่าใน Input ละติจูดเปลี่ยนแปลงหรือไม่ ถ้าไม่เปลี่ยนให้ใช้ Playwright Mouse Click ซ้ำ
 * 
 * Output:
 * - ไม่มี return value, แต่ค่าในช่อง input "ละติจูด" และ "ลองจิจูด" จะเปลี่ยนไป
 */
async function panMapViaJS(page) {
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const latInput = page.getByRole("spinbutton", { name: "ละติจูด *" });
    const lngInput = page.getByRole("spinbutton", { name: "ลองจิจูด *" });

    const beforeLat = await latInput.inputValue();

    await page.evaluate(() => {
        const mapEl = document.querySelector('.leaflet-container');

        const rect = mapEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + 50;
        const y = rect.top + rect.height / 2 + 50;

        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });

        const target = mapEl.querySelector('.leaflet-map-pane') || mapEl;
        target.dispatchEvent(clickEvent);
    });

    if (await latInput.inputValue() === beforeLat) {
        const box = await page.locator(".leaflet-container").boundingBox();
        await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.7);
    }
    await expect(latInput).not.toHaveValue(beforeLat, { timeout: 10000 });
}

/**
 * uploadHomestayCover - ฟังก์ชันจัดการรูปภาพหน้าปก (Cover) โดยใช้ Logic ตรวจสอบพิกัด (Y-Axis)
 * Input: 
 * - page: object ของ Playwright Page
 * - fileRelativePath: 
 * 1. String path = ต้องการลบรูปเก่าและอัปโหลดรูปใหม่
 * 2. Null/Undefined = ต้องการลบรูปเก่าออกเพียงอย่างเดียว
 * 
 * Action: 
 * 1. ระบุตำแหน่ง Header ของ "ภาพหน้าปก" และ "รูปเพิ่มเติม" เพื่อสร้างขอบเขต (Boundary)
 * 2. วนลูปหาปุ่มลบ (Delete Button) และตรวจสอบว่าปุ่มนั้นอยู่ **ระหว่าง** Header ทั้งสองหรือไม่
 * 3. ถ้าเจอปุ่มที่อยู่ในขอบเขต ให้กดลบและรอจนกว่าปุ่มจะหายไป (Break Loop ทันที)
 * 4. หากมี fileRelativePath ส่งมา ให้ทำการเลือก Input ตัวแรกและอัปโหลดไฟล์ใหม่เข้าไป
 * 
 * Output:
 * - ไม่มี return value, หน้าเว็บจะแสดงผลการลบหรืออัปโหลดรูปหน้าปก
 */
export async function uploadHomestayCover(page, fileRelativePath) {

    const coverHeading = page.getByRole("heading", { name: "ภาพหน้าปก (COVER) *" });
    const galleryHeading = page.getByRole("heading", { name: "รูปเพิ่มเติม (GALLERY) *" });

    await expect(coverHeading).toBeVisible();
    await expect(galleryHeading).toBeVisible();


    const section = coverHeading.locator("..");

    //ลบรูปหน้าปกเดิม (ถ้ามี)
    const allDeleteBtns = await section.getByRole("button", { name: /ลบไฟล์/ }).all();

    const coverBox = await coverHeading.boundingBox();
    const galleryBox = await galleryHeading.boundingBox();

    if (coverBox && galleryBox) {
        for (const btn of allDeleteBtns) {
            if (await btn.isVisible()) {
                const btnBox = await btn.boundingBox();

                if (btnBox && btnBox.y > coverBox.y && btnBox.y < galleryBox.y) {
                    await btn.click();
                    await expect(btn).toBeHidden();
                    break;
                }
            }
        }
    }
    //อัปโหลดรูปใหม่ (ถ้ามี path ส่งมา)
    if (fileRelativePath) {
        const input = section.locator('input[type="file"]').first();
        const filePath = path.join(process.cwd(), fileRelativePath);
        await input.setInputFiles(filePath);
        await expect(section.getByRole("button", { name: /ลบไฟล์/ }).first()).toBeVisible();
    }
}

/**
 * uploadHomestayGallery - ฟังก์ชันจัดการรูปภาพเพิ่มเติม (Gallery)
 * Input: 
 * - page: object ของ Playwright Page
 * - filesRelativePaths (Default = []):
 * 1. Empty Array [] = ต้องการลบรูป Gallery ทั้งหมด
 * 2. Array of Strings = ต้องการอัปโหลดรูปเพิ่มตามรายการไฟล์ที่ส่งมา
 * 
 * Action: 
 * 1. รอ Network Idle เพื่อให้รูปภาพเดิมโหลดครบ
 * 2. กรณีส่ง Array ว่าง: วนลูปกดปุ่มลบรูป Gallery ทิ้งทั้งหมดจนกว่าจะเหลือ 0
 * 3. กรณีส่งรายการไฟล์: วนลูปอัปโหลดทีละไฟล์ และรอจังหวะ (Timeout) เพื่อความเสถียร
 * 4. ตรวจสอบจำนวนปุ่มลบว่าเพิ่มขึ้นถูกต้องตามจำนวนไฟล์หรือไม่
 * 
 * Output:
 * - ไม่มี return value, Gallery จะถูกเคลียร์หรือเพิ่มรูปตามคำสั่ง
 */
export async function uploadHomestayGallery(page, filesRelativePaths = []) {
    const section = page
        .getByRole("heading", { name: "รูปเพิ่มเติม (GALLERY) *" })
        .locator("..");

    await page.waitForLoadState('networkidle');

    const input = section.locator('input[type="file"]').last();
    await expect(input).toBeAttached();

    const removeBtns = section.getByRole("button", {
        name: /ลบไฟล์ลำดับที่/,
    });

    const before = await removeBtns.count();

    // กรณี 1: ส่ง array ว่าง (ลบรูปทั้งหมด)
    if (filesRelativePaths.length === 0) {
        while ((await removeBtns.count()) > 0) {
            await removeBtns.first().click();
            await page.waitForTimeout(200);
        }
        return;
    }

    // กรณี 2: อัปโหลดรูปเพิ่ม
    for (const p of filesRelativePaths) {
        const filePath = path.join(process.cwd(), p);
        await input.setInputFiles(filePath);
        await page.waitForTimeout(300);
    }

    await expect(removeBtns).toHaveCount(before + filesRelativePaths.length, { timeout: 10000 });
}

test.describe("SuperAdmin - Edit Homestay", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
    });

    /**
     * TS-EHS-01.1
     * กรอกข้อมูลครบถ้วน
     */
    test("TS-EHS-01.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        await page.getByLabel('ชื่อที่พัก *').fill('โฮมสเตย์บ้านบ่าววี กรุงธนคอมเพล็กซ์');
        await page.getByLabel('ประเภทที่พัก *').fill('บ้านสองชั้น');
        await page.getByLabel('สิ่งอำนวยความสะดวก *').fill('แอร์, Wifi, เครื่องทำน้ำอุ่น, TV');

        await page.getByLabel('จำนวนห้องทั้งหมด *').fill('7');
        await page.getByLabel('จำนวนผู้เข้าพักต่อห้อง *').fill('5');

        await page.getByLabel('บ้านเลขที่ *').fill('100/89');
        await page.getByLabel('หมู่ที่').fill('2');

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'ระยอง' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'แกลง' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'สองสลึง' }).click();

        await page.getByLabel('คำอธิบายที่อยู่').fill('บ้านเลขที่ 100/89 หมู่ 2');

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();
    });

    /**
    * TS-EHS-01.2
    * กรอกข้อมูลไม่ครบถ้วนหลายจุด
    */
    test("TS-EHS-01.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        const nameInput = page.getByLabel("ชื่อที่พัก *");
        await nameInput.click();
        await nameInput.press("Control+A");
        await nameInput.press("Delete");

        const typeInput = page.getByLabel("ประเภทที่พัก *");
        await typeInput.click();
        await typeInput.press("Control+A");
        await typeInput.press("Delete");

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        const errorDialog = page.getByRole("dialog").filter({ hasText: /ข้อมูลไม่ถูกต้อง|กรุณาระบุ|ข้อผิดพลาด/ });
        await expect(errorDialog).toBeVisible();

        const closeBtn = errorDialog.getByRole("button", { name: "ปิด" });
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }
    });

    /**
     * TS-EHS-01.3
     * กรอกละติจูด ลองจิจูด
     */
    test("TS-EHS-01.3: กรอกละติจูด ลองจิจูด", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 9);

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();
    });

    /**
    * TS-EHS-01.4
    * ปักหมุดหากไม่พบสถานที่
    */
    test("TS-EHS-01.4: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 9);

        await panMapViaJS(page);

        const pinBtn = page.getByText("ปักหมุด", { exact: true });
        if (await pinBtn.isVisible()) {
            await pinBtn.click();
        }
        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        if (await confirmButton.isVisible()) {
            await confirmButton.click();
        }
    });

    /**
     * TS-EHS-01.5
     * เพิ่มหรือลบแท็ก
     */
    test("TS-EHS-01.5: เพิ่มหรือลบแท็ก", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        const removeTagBtns = page.getByRole('button', { name: '✕' });

        while ((await removeTagBtns.count()) > 0) {
            await removeTagBtns.first().click();
            await page.waitForTimeout(200);
        }

        const tagsToAdd = ['Tag-1-Relax', 'Tag-2-Culture', 'Tag-5-Relax'];

        const tagInput = page.getByRole('combobox', { name: /ค้นหาแท็ก/ });
        await tagInput.click(); // เปิด Dropdown

        for (const tag of tagsToAdd) {
            // เลือก Tag ตามชื่อที่เตรียมไว้
            await page.getByRole('option', { name: tag }).click();
        }
        await page.keyboard.press('Escape');

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        if (await confirmButton.isVisible()) {
            await confirmButton.click();
        }
    });

    /**
    * TS-EHS-01.6
    * ไม่เพิ่มแท็ก
    */
    test("TS-EHS-01.6: ไม่เพิ่มแท็ก", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        const removeTagBtns = page.getByRole('button', { name: '✕' });

        while ((await removeTagBtns.count()) > 0) {
            await removeTagBtns.first().click();
            await page.waitForTimeout(200);
        }

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        const errorDialog = page.getByRole("dialog").filter({ hasText: /ข้อมูลไม่ถูกต้อง|กรุณาระบุ|ข้อผิดพลาด/ });
        await expect(errorDialog).toBeVisible();

        const closeBtn = errorDialog.getByRole("button", { name: "ปิด" });
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }
    });

    /**
    * TS-EHS-01.7
    * อัพโหลดรูปภาพหน้าปก
    */
    test("TS-EHS-01.7: อัพโหลดรูปภาพหน้าปก", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        await uploadHomestayCover(page, "assets/photo/pic2.jpg");

        await page.getByRole('button', { name: 'บันทึก' }).click();
        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

    });

    /**
    * TS-EHS-01.8
    * ไม่อัพโหลดรูปภาพหน้าปก
    */
    test("TS-EHS-01.8: ไม่อัพโหลดรูปภาพหน้าปก", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        await uploadHomestayCover(page);

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        // const errorDialog = page.getByRole("dialog").filter({ hasText: /ข้อมูลไม่ถูกต้อง|กรุณาระบุ|ข้อผิดพลาด/ });
        // await expect(errorDialog).toBeVisible();

        // const closeBtn = errorDialog.getByRole("button", { name: "ปิด" });
        // if (await closeBtn.isVisible()) {
        //     await closeBtn.click();
        // }
    });

    /**
    * TS-EHS-01.9
    * อัพโหลดรูปภาพเพิ่มเติม
    */
    test("TS-EHS-01.9: อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        const newImages = [
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg"
        ];
        await uploadHomestayGallery(page, newImages);

        await page.getByRole('button', { name: 'บันทึก' }).click();
        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();


    });

    /**
    * TS-EHS-01.10
    * ไม่อัพโหลดรูปภาพเพิ่มเติม
    */
    test("TS-EHS-01.10: ไม่อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        await uploadHomestayGallery(page, []);

        await page.getByRole('button', { name: 'บันทึก' }).click();
        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click

        // const errorDialog = page.getByRole("dialog").filter({ hasText: /ข้อมูลไม่ถูกต้อง|กรุณาระบุ|ข้อผิดพลาด/ });
        // await expect(errorDialog).toBeVisible();

        // const closeBtn = errorDialog.getByRole("button", { name: "ปิด" });
        // if (await closeBtn.isVisible()) {
        //     await closeBtn.click();
        // }

    });

    /**
    * TS-EHS-01.11
    * ยกเลิกการแก้ไขร้านค้า (แบบ Modal)
    */
    test("TS-EHS-01.11: ยกเลิกการแก้ไขร้านค้า (แบบ Modal)", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('สวัสดีชาวไทย');

        await page.getByRole('button', { name: 'บันทึก' }).click();

        const cancelButton = page.getByRole('button', { name: 'ยกเลิก' });
        await expect(cancelButton).toBeVisible();
        await cancelButton.click();
    });
    /**
    * TS-EHS-01.12
    * ยกเลิกการแก้ไขร้านค้า
    */
    test("TS-EHS-01.12: ยกเลิกการแก้ไขร้านค้า", async ({ page }) => {
        await goToEditHomestayDetailPage(page, 8);

        await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('สวัสดีชาวไทย');

        await page.getByRole('button', { name: 'ยกเลิก' }).click();
    });
});


