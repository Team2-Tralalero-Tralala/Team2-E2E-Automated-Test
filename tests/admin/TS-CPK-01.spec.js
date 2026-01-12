import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToCreatePackagePage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าสร้างแพ็กเกจ
 * Input: 
 * - page: object ของ Playwright Page
 * * Action: 
 * 1. คลิกเมนู "จัดการชุมชน"
 * 2. คลิการ์ด "แพ็กเกจ" (Package Accordion)
 * 3. คลิกปุ่ม "จัดการ" เพื่อดูรายการแพ็กเกจ
 * 4. พามาหน้า "จัดการแพ็กเกจ"
 * 5. คลิกปุ่ม "เพิ่มแพ็กเกจ"
 * * Output:
 * - ไม่มี return value, Browser จะถูก Navigate ไปยัง URL หน้าสร้างแพ็กเกจ (/admin/package/create)
 */
async function goToCreatePackagePage(page) {
    const manageCommunity = page.getByRole("link", { name: "จัดการชุมชน" });
    await expect(manageCommunity).toBeVisible();
    await manageCommunity.click();

    await expect(page).toHaveURL(/admin\/community\/own/);

    const accommodationAccordion = page.getByRole('button', { name: /แพ็กเกจ/ });
    await accommodationAccordion.click();

    const managePackageButton = page.getByRole('button', { name: 'จัดการ' });
    await expect(managePackageButton).toBeVisible();
    await managePackageButton.click();

    await expect(page).toHaveURL(/admin\/packages\/all/);

    const createPackageButton = page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' });
    await expect(createPackageButton).toBeVisible();
    await createPackageButton.click();

    await expect(page).toHaveURL(/admin\/package\/create/);
}

/**
 * uploadCoverImage - ฟังก์ชันอัปโหลดรูปภาพหน้าปก (Cover Image)
 * Input: 
 * - page: object ของ Playwright Page
 * - fileRelativePath: String = path ของไฟล์รูปภาพ (Relative Path)
 * * Action: 
 * 1. แปลง Relative Path เป็น Absolute Path
 * 2. ค้นหา Section ที่มีข้อความ "อัพโหลดภาพหน้าปก *" และมี Input File อยู่ภายใน
 * 3. ตรวจสอบว่าพบ Input File จริง
 * 4. สั่งอัปโหลดไฟล์ไปยัง Input ดังกล่าว
 * * Output:
 * - ไม่มี return value, ไฟล์หน้าปกถูกอัปโหลด (Input มีค่าไฟล์ที่เลือก)
 */
async function uploadCoverImage(page, fileRelativePath) {
    const filePath = path.join(process.cwd(), fileRelativePath);

    // 1. หา Section "อัพโหลดภาพหน้าปก *"
    // ใช้ .filter เพื่อหา div ที่มีข้อความนี้ และมี input file ซ่อนอยู่
    const section = page.locator('div')
        .filter({ has: page.getByText(/^อัพโหลดภาพหน้าปก \*$/) })
        .filter({ has: page.locator('input[type="file"]') })
        .last();

    const input = section.locator('input[type="file"]');

    // ตรวจสอบว่าเจอ Input จริงๆ
    await expect(input).toHaveCount(1);

    // 2. อัปโหลดไฟล์
    await input.setInputFiles(filePath);

    // 3. (Optional) รอตรวจสอบว่าอัปโหลดสำเร็จ
    // เนื่องจากเป็นภาพปก (มีได้แค่ 1 รูป) เราอาจจะเช็คว่าข้อความ "0 / 1" หายไป หรือมีปุ่มลบโผล่ขึ้นมา
    // แต่ถ้า UI คล้ายๆ กัน ก็น่าจะมีปุ่มลบ (เช่นชื่อ "ลบไฟล์" หรือ icon กากบาท)
    // เบื้องต้นรอให้ input มีค่าก็ถือว่าสั่งอัปโหลดแล้ว
}

/**
 * uploadExtraImages - ฟังก์ชันอัปโหลดรูปภาพเพิ่มเติม (รองรับหลายไฟล์)
 * Input: 
 * - page: object ของ Playwright Page
 * - filesRelativePaths: Array<String> = รายชื่อ path ของไฟล์รูปภาพ
 * * Action: 
 * 1. แปลงรายการ Relative Path เป็น Absolute Path ทั้งหมด
 * 2. ค้นหา Section "อัพโหลดรูปภาพเพิ่มเติม *"
 * 3. นับจำนวนปุ่ม "ลบไฟล์" ที่มีอยู่เดิม (เพื่อใช้ Verify ผลลัพธ์)
 * 4. วนลูปอัปโหลดไฟล์ทีละไฟล์ไปยัง Input
 * 5. รอตรวจสอบ (Assertion) จนกว่าจำนวนปุ่ม "ลบไฟล์" จะเพิ่มขึ้นเท่ากับจำนวนไฟล์ที่อัปโหลด
 * * Output:
 * - ไม่มี return value, รูปภาพทั้งหมดถูกเพิ่มเข้าสู่รายการสำเร็จ
 */
async function uploadExtraImages(page, filesRelativePaths) {
    const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));

    // วิธีหา Section
    const section = page.locator('div')
        .filter({ has: page.getByText(/^อัพโหลดรูปภาพเพิ่มเติม \*$/) }) // หา div ที่มีข้อความนี้
        .filter({ has: page.locator('input[type="file"]') })         // และต้องมี input file อยู่ข้างใน
        .last(); // เลือกตัวในสุด (Closest Container)

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

/**
 * uploadExtraVideos - ฟังก์ชันอัปโหลดวิดีโอเพิ่มเติม (รองรับหลายไฟล์)
 * Input: 
 * - page: object ของ Playwright Page
 * - filesRelativePaths: Array<String> = รายชื่อ path ของไฟล์วิดีโอ
 * * Action: 
 * 1. แปลงรายการ Relative Path เป็น Absolute Path ทั้งหมด
 * 2. ค้นหา Section "อัพโหลดวิดีโอเพิ่มเติม *"
 * 3. นับจำนวนปุ่ม "ลบไฟล์" ที่มีอยู่เดิม
 * 4. วนลูปอัปโหลดไฟล์ทีละไฟล์
 * 5. รอตรวจสอบ (Assertion) จนกว่าจำนวนปุ่ม "ลบไฟล์" จะเพิ่มขึ้นเท่ากับจำนวนไฟล์ที่อัปโหลด
 * * Output:
 * - ไม่มี return value, วิดีโอทั้งหมดถูกเพิ่มเข้าสู่รายการสำเร็จ
 */
async function uploadExtraVideos(page, filesRelativePaths) {
    const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));

    // วิธีหา Section เพื่อความชัวร์ (กรณีไม่ใช่ Heading)
    const section = page.locator('div')
        .filter({ has: page.getByText(/^อัพโหลดวิดีโอเพิ่มเติม \*$/) }) // หา div ที่มีข้อความนี้
        .filter({ has: page.locator('input[type="file"]') })         // และต้องมี input file อยู่ข้างใน
        .last(); // เลือกตัวที่เจาะจงที่สุด (Closest Container)

    const input = section.locator('input[type="file"]');
    await expect(input).toHaveCount(1);

    // ใช้จำนวนปุ่มลบเป็นตัวแทนจำนวนวิดีโอที่ถูกเลือกแล้ว (UI นี้มีปุ่มลบทุกไฟล์)
    const removeBtns = section.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });

    const before = await removeBtns.count();
    // อัปทีละไฟล์ (input ไม่ multiple)
    for (const filePath of files) {
        await input.setInputFiles(filePath);
    }
    const expected = before + files.length;
    // รอจนจำนวนปุ่มลบเพิ่มขึ้นตามที่อัป
    await expect(removeBtns).toHaveCount(expected, { timeout: 60000 });
}

/**
 * panMapViaJS - ฟังก์ชันสำหรับสั่งเปลี่ยนพิกัดบนแผนที่โดยใช้ JavaScript (แก้ปัญหาการคลิกปกติไม่ตอบสนอง)
 * Input:
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action:
 * 1. รอให้ container ของแผนที่ (Leaflet) แสดงผลและพร้อมใช้งาน
 * 2. เก็บค่าละติจูดปัจจุบันไว้เป็นค่าเริ่มต้น (beforeLat) เพื่อใช้เปรียบเทียบ
 * 3. ใช้ page.evaluate เพื่อรัน JavaScript ภายใน Browser โดยตรง
 * 4. คำนวณตำแหน่งพิกัดใหม่บนหน้าจอ (offset +50px จากกึ่งกลางแผนที่)
 * 5. สร้าง MouseEvent ประเภท 'click' และ dispatch event ไปยัง DOM element ของแผนที่
 * 6. ตรวจสอบผลลัพธ์: หากค่าละติจูดไม่เปลี่ยน (Fallback) จะใช้คำสั่ง Playwright mouse.click เพื่อคลิกซ้ำในตำแหน่งใหม่ (70% ของพื้นที่)
 * 7. รอจนกว่าค่าละติจูดจะเปลี่ยนไปจากค่าเดิม
 * Output:
 * - ไม่มี return value แต่ค่าพิกัดละติจูดและลองจิจูดจะถูกอัปเดตจากการทำงาน
 */
async function panMapViaJS(page) {
    // รอให้แผนที่และ input พร้อมก่อน
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const latInput = page.getByRole("spinbutton", { name: "ละติจูด *" });
    const lngInput = page.getByRole("spinbutton", { name: "ลองจิจูด *" });

    // เก็บค่าเดิม
    const beforeLat = await latInput.inputValue();

    await page.evaluate(() => {
        const mapEl = document.querySelector('.leaflet-container');

        const rect = mapEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + 50; // ขยับไปขวา 50px
        const y = rect.top + rect.height / 2 + 50;  // ขยับลง 50px

        // สร้าง Event คลิก
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });

        // ส่ง Event ไปที่กลางแผนที่
        // หมายเหตุ: ต้องส่งไปที่ element ลูกของ map (เช่น .leaflet-map-pane) เพื่อความชัวร์
        const target = mapEl.querySelector('.leaflet-map-pane') || mapEl;
        target.dispatchEvent(clickEvent);
    });

    // บางที Leaflet รับแค่ mousedown
    // ให้ใช้วิธี Click ของ Playwright แบบ Force (บังคับกด) ไปที่จุดใหม่
    if (await latInput.inputValue() === beforeLat) {
        const box = await page.locator(".leaflet-container").boundingBox();
        // คลิกจุดที่ต่างจากเดิม (ขวาล่าง)
        await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.7);
    }
    await expect(latInput).not.toHaveValue(beforeLat, { timeout: 10000 });
}
test.describe("Admin - Create Package", () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await loginAs(page, "admin4");
        await expect(page).toHaveURL(/admin\/community\/own/);
    });

    /**
     * TS-CPK-01.1
     * กรอกข้อมูลครบถ้วน
     */
    test("TS-CPK-01.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("น่านเนิบๆ เสพศิลป์ กลิ่นกาแฟ")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        // await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('10');
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่มแพ็กเกจ
        // const startDate = page.locator('div').filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) }).last();
        // await startDate.getByPlaceholder('วว').fill('09');
        // await startDate.getByPlaceholder('ดด').fill('01');
        // await startDate.getByPlaceholder('ปปปป').fill('2568');

        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุดแพ็กเกจ
        // const endDate = page.locator('div').filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) }).last();
        // await endDate.getByPlaceholder('วว').fill('10');
        // await endDate.getByPlaceholder('ดด').fill('01');
        // await endDate.getByPlaceholder('ปปปป').fill('2568');

        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        // const openDate = page.locator('div').filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) }).last();
        // await openDate.getByPlaceholder('วว').fill('01');
        // await openDate.getByPlaceholder('ดด').fill('01');
        // await openDate.getByPlaceholder('ปปปป').fill('2568');

        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        // const closeDate = page.locator('div').filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) }).last();
        // await closeDate.getByPlaceholder('วว').fill('08');
        // await closeDate.getByPlaceholder('ดด').fill('01');
        // await closeDate.getByPlaceholder('ปปปป').fill('2568');

        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        await Promise.all([
            page.waitForURL(/admin\/packages\/all/, { timeout: 60000 }), // เพิ่ม timeout 60วิ เผื่ออัปโหลดไฟล์นาน
        ]);
    });

    /**
     * TS-CPK-01.2
     * ไม่กรอกชื่อแพ็กเกจ
     */
    test("TS-CPK-01.2: ไม่กรอกชื่อแพ็กเกจ", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่ม
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุด
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง 
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
     * TS-CPK-01.3
     * ไม่กรอกคำอธิบายแพ็กเกจ
     */
    test("TS-CPK-01.3: ไม่กรอกคำอธิบายแพ็กเกจ", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("ล่องแพเปียก โดดน้ำตกเอราวัณ");
        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่ม
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุด
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
     * TS-CPK-01.4
     * กรอกข้อมูลที่อยู่ครบถ้วน
     */
    test("TS-CPK-01.4: กรอกข้อมูลที่อยู่ครบถ้วน", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("น่านเนิบๆ เสพศิลป์ กลิ่นกาแฟ - 2")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่ม
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุด 
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง 
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง 
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        await Promise.all([
            page.waitForURL(/admin\/packages\/all/, { timeout: 60000 }), // เพิ่ม timeout 60วิ เผื่ออัปโหลดไฟล์นาน
        ]);
    });

    /**
     * TS-CPK-01.5
     * กรอกข้อมูลที่อยู่ไม่ครบถ้วนหลายจุด
     */
    test("TS-CPK-01.5: กรอกข้อมูลที่อยู่ไม่ครบถ้วนหลายจุด", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("ล่องแพเปียก โดดน้ำตกเอราวัณ");
        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่และเวลาที่เริ่ม 
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุด 
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
    * TS-CPK-01.6
    * ปักหมุดหากไม่พบวิสาหกิจชุมชน
    */
    test("TS-CPK-01.6: ปักหมุดหากไม่พบวิสาหกิจชุมชน", async ({ page }) => {
        await goToCreatePackagePage(page);
        await panMapViaJS(page);

        const pinBtn = page.getByText("ปักหมุด", { exact: true });
        if (await pinBtn.isVisible()) {
            await pinBtn.click();
        }
    });

    /**
     * TS-CPK-01.7
     * ไม่กรอกผู้ดูแลแพ็กเกจ
     */
    test("TS-CPK-01.7: ไม่กรอกผู้ดูแลแพ็กเกจ", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("เดินตรอก กินอร่อย ร้อยพวงมาลัย")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่มแพ็กเกจ
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุดแพ็กเกจ
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
     * TS-CPK-01.8
     * ไม่กรอกจำนวนที่เปิดรับแพ็กเกจ
     */
    test("TS-CPK-01.8: ไม่กรอกจำนวนที่เปิดรับแพ็กเกจ", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("เดินตรอก กินอร่อย ร้อยพวงมาลัย")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่มแพ็กเกจ
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุดแพ็กเกจ
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
     * TS-CPK-01.9
     * ไม่กรอกกวันที่และเวลา
     */
    test("TS-CPK-01.9: ไม่กรอกกวันที่และเวลา", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("เดินตรอก กินอร่อย ร้อยพวงมาลัย")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();
        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
     * TS-CPK-01.10
     * เพิ่มแท็ก
     */
    test("TS-CPK-01.10: เพิ่มแท็ก", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("เดินตรอก กินอร่อย ร้อยพวงมาลัย")

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown
    });

    /**
     * TS-CPK-01.11
     * ลบแท็ก
     */
    test("TS-CPK-01.11: ลบแท็ก", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("เดินตรอก กินอร่อย ร้อยพวงมาลัย")

        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        const removeTagBtns = page.getByRole('button', { name: '✕' });

        while ((await removeTagBtns.count()) > 0) {
            await removeTagBtns.first().click();
            await page.waitForTimeout(200);
        }
    });

    /**
     * TS-CPK-01.12
     * ไม่กรอกราคาแพ็กเกจ
     */
    test("TS-CPK-01.12: ไม่กรอกราคาแพ็กเกจ", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("เดินตรอก กินอร่อย ร้อยพวงมาลัย")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("พักโฮมสเตย์กลางทุ่งนาบ่อเกลือ ตื่นเช้าดูหมอก ดริปกาแฟริมระเบียง และแวะหอศิลป์ริมน่าน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'น่าน' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'นาน้อย' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 400 เมตร หน้าซอยพักโฮมสเตย์กลางทุ่งนาบ่อเกลือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่มแพ็กเกจ
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุดแพ็กเกจ
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

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
     * TS-CPK-01.13
     * อัพโหลดภาพหน้าปก
     */
    test("TS-CPK-01.13: อัพโหลดภาพหน้าปก", async ({ page }) => {
        await goToCreatePackagePage(page);
        await uploadCoverImage(page, "assets/photo/pic1.jpg");
    });

    /**
     * TS-CPK-01.14
     * อัพโหลดรูปภาพเพิ่มเติม
     */
    test("TS-CPK-01.14: อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
        await goToCreatePackagePage(page);
        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
    });

    /**
     * TS-CPK-01.15
     * อัพโหลดวิดีโอ
     */
    test("TS-CPK-01.15: อัพโหลดวิดีโอ", async ({ page }) => {
        await goToCreatePackagePage(page);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])
    });

    /**
   * TS-CPK-01.16
   * เพิ่มที่พัก
   */
    test("TS-CPK-01.16: เพิ่มที่พัก", async ({ page }) => {
        await goToCreatePackagePage(page);

        await page.getByLabel("ชื่อแพ็กเกจ *").fill("ดำน้ำตื้น ฟื้นฟูใจ หมู่เกาะสุรินทร์")

        await page.getByRole('button', { name: 'ฉบับร่าง' }).first().click();
        await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();

        await page.getByLabel("คำอธิบายแพ็กเกจ *").fill("หนีความวุ่นวายไปติดเกาะ ดำน้ำดูปะการังที่สมบูรณ์ที่สุด สัมผัสวิถีชีวิตชาวมอแกน")
        await page.getByLabel("บ้านเลขที่ *").fill("100/555")
        await page.getByLabel("หมู่ที่").fill("2")

        await page.getByLabel('จังหวัด *').click();
        await page.getByRole('option', { name: 'พังงา' }).click();

        await page.getByLabel('อำเภอ / เขต *').click();
        await page.getByRole('option', { name: 'เกาะยาว' }).click();

        await page.getByLabel('ตำบล/แขวง *').click();
        await page.getByRole('option', { name: 'เกาะยาวใหญ่' }).click();

        await page.getByLabel("คำอธิบายที่อยู่ *").fill("เลี้ยวซ้าย 500 เมตร หน้าซอยเกาะยาวใหญ่ ตรงไป 200 เมตร พบจุดหมายฝั่งซ้ายมือ")

        await page.getByLabel('ละติจูด *').fill('16.358');
        await page.getByLabel('ลองจิจูด *').fill('103.985');

        await page.getByRole('combobox', { name: /เลือกผู้ดูแล/ }).click();
        await page.getByRole('option', { name: 'กมล เบอร์ลี่' }).click();

        await page.getByLabel("เปิดรับจำนวน *").fill("20")
        await page.getByLabel("สิ่งอำนวยความสะดวก *").fill("รถรับ-ส่งตลอด 24 ชั่วโมง")

        // วันที่-เวลาที่เริ่มแพ็กเกจ
        const startDateBlock = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เริ่ม \*$/) })
            .last();
        await startDateBlock.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const startTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เริ่ม\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await startTime.getByPlaceholder('ชม.').fill('08');
        await startTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาที่สิ้นสุดแพ็กเกจ
        const endDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่สิ้นสุด \*$/) })
            .last();
        await endDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const endTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่สิ้นสุด\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await endTime.getByPlaceholder('ชม.').fill('18');
        await endTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเปิดจอง
        const openDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เปิดจอง \*$/) })
            .last();
        await openDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^12$/ }).click();

        const openTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่เปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await openTime.getByPlaceholder('ชม.').fill('09');
        await openTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาปิดจอง
        const closeDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่ปิดจอง \*$/) })
            .last();
        await closeDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^19$/ }).click();

        const closeTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาที่ปิดจอง\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await closeTime.getByPlaceholder('ชม.').fill('23');
        await closeTime.getByPlaceholder('นาที').fill('59');


        await page.getByRole('combobox', { name: /ค้นหาแท็ก/ }).click();
        await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
        await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
        await page.keyboard.press('Escape'); // ปิด Dropdown

        await page.getByLabel("ราคา *").fill("2300")

        await uploadCoverImage(page, "assets/photo/pic1.jpg");

        await uploadExtraImages(page, [
            "assets/photo/pic1.jpg",
            "assets/photo/pic2.jpg",
            "assets/photo/pic3.jpg",
        ]);
        await uploadExtraVideos(page, [
            "assets/photo/vdo1.mp4",
            "assets/photo/vdo2.mp4",
        ])

        // เพิ่มที่พัก
        // await page.getByRole('textbox', { name: 'ค้นหาชื่อที่พัก' }).click();
        // await page.getByRole('button', { name: 'Sheepy Valley Stay' }).click();
        await page.getByPlaceholder('ค้นหาชื่อที่พัก').click();
        await page.getByText('Sheepy Valley Stay').click();

        // วันที่-เวลาเช็คอิน
        const checkInDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เช็กอินพัก $/) })
            .last();
        await checkInDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^20$/ }).click();

        const checkInTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาเช็กอิน\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await checkInTime.getByPlaceholder('ชม.').fill('12');
        await checkInTime.getByPlaceholder('นาที').fill('00');

        // วันที่-เวลาเช็คเอ้าท์
        const checkOutDate = page.locator('div')
            .filter({ has: page.getByText(/^วัน\/เดือน\/ปี \(พ\.ศ\.\) ที่เช็กเอาท์ $/) })
            .last();
        await checkOutDate.getByRole('button', { name: 'เปิดปฏิทิน' }).click();
        await page.getByRole('gridcell').filter({ hasText: /^22$/ }).click();

        const checkOutTime = page.locator('div')
            .filter({ has: page.getByText(/^เวลาเช็กเอาท์\*$/) })
            .filter({ has: page.getByPlaceholder('ชม.') })
            .last();

        await checkOutTime.getByPlaceholder('ชม.').fill('12');
        await checkOutTime.getByPlaceholder('นาที').fill('00');

        await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();

        const confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
        await expect(confirmButton).toBeVisible();
        await confirmButton.click();

        await Promise.all([
            page.waitForURL(/admin\/packages\/all/, { timeout: 600000 }), // เพิ่ม timeout 600วิ เผื่ออัปโหลดไฟล์นาน
        ]);
    });

});

//npx playwright codegen http://dekdee2.informatics.buu.ac.th:4080/guest/partner/login
//npx playwright test tests/admin/TS-CPK-01.spec.js --headed
//npx playwright test tests/admin/TS-CPK-01.spec.js -g "TS-CPK-01.1" --headed
// npx playwright test tests/admin/TS-CPK-01.spec.js -g "TS-CPK-01\.1\b" --headed

