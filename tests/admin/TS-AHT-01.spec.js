import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageHomestay - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการที่พัก (Homestay Management)
 * Input: 
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 * 1. คลิกเมนู "จัดการที่พัก" (Manage Homestays)
 * 2. รอให้ระบบเปลี่ยนเส้นทางไปยังหน้าจัดการที่พัก
 * Output:
 * - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /admin/community/Homestays
 */
async function goToPageHomestay(page) {

  await page.getByRole('button', { name: 'แก้ไข' }).click();
  await page.getByRole('button', { name: 'ข้อมูลชุมชน' }).click();
  await page.getByRole('button', { name: 'จัดการที่พัก' }).click();

  await expect(page).toHaveURL(/admin\/community\/homestays/);
}


test.describe("Admin - Add Homestay", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "thanakorn");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TC-AHT-01.1
   * กรอกข้อมูลครบ
   */
  test("TC-AHT-01.1: Admin add homestay successfully", async ({
    page,
  }) => {
    await goToPageHomestay(page);

    await page.getByRole('button', { name: '+ เพิ่มที่พัก' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('โฮมสเตย์ บางแสนริมเล');
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).fill('โฮมสเตย์');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('แอร์ น้ำอุ่น อาหารเช้า สระว่ายน้ำ');
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).fill('20');
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).fill('2');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('29');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('2');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ใกล้ติดคาเฟ่หมาจัสมิน');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
    await page.locator('div').filter({ hasText: /^แท็ก \*$/ }).click();

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const roomPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const seaPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([roomPath, seaPath]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'บันทึก' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page).toHaveURL(/admin\/community\/homestays/);

  });

    /**
   * TC-AHT-01.2
   * กรอกไม่ข้อมูลครบ
   */
  test("TC-AHT-01.2: Admin add homestay with incomplete data", async ({
    page,
  }) => {
    await goToPageHomestay(page);

    await page.getByRole('button', { name: '+ เพิ่มที่พัก' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('โฮมสเตย์ บางแสนริมเล');
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).fill('');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('');
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).fill('20');
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).fill('');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('2');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ใกล้ติดคาเฟ่หมาจัสมิน');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
    await page.locator('div').filter({ hasText: /^แท็ก \*$/ }).click();

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const roomPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const seaPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([roomPath, seaPath]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: 'บันทึก' }).click();
    await expect(page.getByText("กรุณากรอกประเภทของที่พัก")).toBeVisible();
    await expect(page.getByText("กรุณากรอกสิ่งอำนวยความสะดวก")).toBeVisible();
    await expect(page.getByText("ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป")).toBeVisible();
    await expect(page.getByText("กรุณากรอกบ้านเลขที่")).toBeVisible();

    await expect(page).toHaveURL(/admin\/community\/homestay/);

  });

    /**
   * TC-AHT-01.3
   * ปักหมุดหากไม่พบสถานที่
   */
  test("TC-AHT-01.3: Admin add homestay with pinning location", async ({
    page,
  }) => {
    await goToPageHomestay(page);

    await page.getByRole('button', { name: '+ เพิ่มที่พัก' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('โฮมสเตย์ บางแสนริมเล');
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).fill('โฮมสเตย์');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('แอร์ น้ำอุ่น อาหารเช้า สระว่ายน้ำ');
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).fill('20');
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).fill('2');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('29');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('2');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ใกล้ติดคาเฟ่หมาจัสมิน');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
    await page.locator('div').filter({ hasText: /^แท็ก \*$/ }).click();

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const roomPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const seaPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([roomPath, seaPath]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/community\/homestay/);

  });

    /**
   * TC-AHT-01.4
   * เพิ่มแท็ก
   */
  test("TC-AHT-01.4: Admin add homestay with tags", async ({
    page,
  }) => {
    await goToPageHomestay(page);

    await page.getByRole('button', { name: '+ เพิ่มที่พัก' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('โฮมสเตย์ บางแสนริมเล');
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).fill('โฮมสเตย์');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('แอร์ น้ำอุ่น อาหารเช้า สระว่ายน้ำ');
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).fill('20');
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).fill('2');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('29');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('2');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ใกล้ติดคาเฟ่หมาจัสมิน');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
    await page.locator('div').filter({ hasText: /^แท็ก \*$/ }).click();
    
    await expect(page.getByText("Tag-1-Relax")).toBeVisible();

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const roomPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const seaPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([roomPath, seaPath]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/community\/homestay/);

  });

    /**
   * TC-AHT-01.5
   * อัพโหลดรูปภาพ
   */
  test("TC-AHT-01.5: Admin add homestay upload image", async ({
    page,
  }) => {
    await goToPageHomestay(page);

    await page.getByRole('button', { name: '+ เพิ่มที่พัก' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อที่พัก *' }).fill('โฮมสเตย์ บางแสนริมเล');
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).click();
    await page.getByRole('textbox', { name: 'ประเภทที่พัก *' }).fill('โฮมสเตย์');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('แอร์ น้ำอุ่น อาหารเช้า สระว่ายน้ำ');
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนห้องทั้งหมด *' }).fill('20');
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).click();
    await page.getByRole('spinbutton', { name: 'จำนวนผู้เข้าพักต่อห้อง *' }).fill('2');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('29');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('2');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่' }).fill('ใกล้ติดคาเฟ่หมาจัสมิน');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-1-Relax' }).click();
    await page.locator('div').filter({ hasText: /^แท็ก \*$/ }).click();

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const roomPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const seaPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัปโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([roomPath, seaPath]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    await page.waitForTimeout(1000);
    

    await expect(page).toHaveURL(/admin\/community\/homestay/);

  });

});