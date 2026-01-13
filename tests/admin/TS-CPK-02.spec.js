import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.setTimeout(60000);
/**
 * goToPagePackage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าจัดการแพ็กเกจ (Package Management)
 * Input: 
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action: 
 * 1. คลิกเมนู "จัดการแพ็กเกจ" (Manage Packages)
 * 2. รอให้ระบบเปลี่ยนเส้นทางไปยังหน้าจัดการแพ็กเกจ
 * Output:
 * - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /admin/community/packages
 */
async function goToPagePackage(page) {

  const managePackage = page.getByRole("link", { name: "จัดการแพ็กเกจ" });
  await expect(managePackage).toBeVisible();
  await managePackage.click();

  await expect(page).toHaveURL(/admin\/packages\/all/);
}


test.describe("Admin - Create Packages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TC-CPK-02.1
   * กรอกข้อมูลครบถ้วน
   */
  test("TC-CPK-02.1: Admin create package successfully", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page).toHaveURL(/admin\/packages\/all/);
  });

  /**
   * TC-CPK-02.2
   * ไม่กรอกชื่อแพ็กเกจ
   */
  test("TC-CPK-02.2: Admin create package without name", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณากรอกชื่อแพ็กเกจ")).toBeVisible();


    await expect(page).toHaveURL(/admin\/package\/create/);
  });

    /**
   * TC-CPK-02.3
   * ไม่กรอกคำอธิบายแพ็กเกจ
   */
  test("TC-CPK-02.3: Admin create package without description", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณากรอกรายละเอียดแพ็กเกจ")).toBeVisible();


    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.4
   * กรอกข้อมูลที่อยู่ครบถ้วน
   */
  test("TC-CPK-02.4: Admin create package with complete address information", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page).toHaveURL(/admin\/packages\/all/);
  });

/**
   * TC-CPK-02.5
   * กรอกข้อมูลที่อยู่ไม่ครบถ้วนหลายจุด
   */
  test("TC-CPK-02.5: Admin create package with incomplete address information", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณากรอกบ้านเลขที่")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกตำบล/แขวง")).toBeVisible();
    
    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.6
   * ปักหมุดหากไม่พบวิสาหกิจชุมชน
   */
  test("TC-CPK-02.6: Admin create package with community not found", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.7
   * ไม่กรอกผู้ดูแลแพ็กเกจ
   */
  test("TC-CPK-02.6: Admin create package with no Package Administrator", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณาเลือกผู้ดูแล")).toBeVisible();

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

    /**
   * TC-CPK-02.8
   * ไม่กรอกจำนวนที่เปิดรับแพ็กเกจ
   */
  test("TC-CPK-02.6: Admin create package with no open package count", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณากรอกจำนวนที่เปิดรับ")).toBeVisible();

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

    /**
   * TC-CPK-02.9
   * ไม่กรอกวันที่และเวลา
   */
  test("TC-CPK-02.9: Admin create package with no date and time", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');

    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณาเลือกวันที่เริ่ม")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกเวลาเริ่ม")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกวันที่สิ้นสุด")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกเวลาสิ้นสุด")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกวันที่เปิดจอง")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกเวลาเปิดจอง")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกวันที่ปิดจอง")).toBeVisible();
    await expect(page.getByText("กรุณาเลือกเวลาปิดจอง")).toBeVisible();

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.10
   * เพิ่มแท็ก
   */
  test("TC-CPK-02.10: Admin create package with tag", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await expect(
        page.locator('span').filter({ hasText: 'Tag-2-Culture' })
    ).toBeVisible();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.11
   * ลบแท็ก
   */
  test("TC-CPK-02.11: Admin create package with no tag", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await expect(
        page.locator('span').filter({ hasText: 'Tag-2-Culture' })
    ).toBeVisible();
    await page.getByText('แท็ก').click();
    await page.getByRole('button', { name: '✕' }).click();
    await expect(page.getByText("Tag-2-Culture")).not.toBeVisible();

    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.12
   * ไม่กรอกราคาแพ็กเกจ
   */
  test("TC-CPK-02.12: Admin create package with no price", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await expect(page.getByText("กรุณากรอกราคา")).toBeVisible();

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.13
   * อัพโหลดรูปภาพไฟล์ถูกต้อง
   */
  test("TC-CPK-02.13: Admin create package with correct image file", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.14
   * อัพโหลดไฟล์เกินขนาด
   */
  test("TC-CPK-02.14: Admin create package with file size exceeds limit", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.15
   * อัพโหลดไฟล์รูปภาพที่ไม่ใช่ (JPG/PNG)
   */
  test("TC-CPK-02.15: Admin create package with invalid image file", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "notImage.gif"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "notImage.gif"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "notImage.gif"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(page.getByText("อัพโหลดไฟล์เฉพาะ JPG/PNG")).toBeVisible({
        timeout: 5000 
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(page.getByText("อัพโหลดไฟล์เฉพาะ JPG/PNG")).toBeVisible({
        timeout: 5000 
    });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.16
   * อัพโหลดวิดีโอ
   */
  test("TC-CPK-02.16: Admin create package with upload video", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/admin\/package\/create/);
  });

  /**
   * TC-CPK-02.17
   * เพิ่มที่พัก
   */
  test("TC-CPK-02.17: Admin create package with homestay", async ({
    page,
  }) => {
    await goToPagePackage(page);
    await page.getByRole('button', { name: 'เพิ่มแพ็กเกจ' }).click();

    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'ชื่อแพ็กเกจ *' }).fill('แพ็กเกจท่องเที่ยวชุมชนแสนสุข');
    await page.getByRole('button', { name: 'ฉบับร่าง' }).click();
    await page.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายแพ็กเกจ *' }).fill('ทัวร์ชุมชนแสนสุข ชมวิถีชีวิตชาวบ้าน');
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).click();
    await page.getByRole('textbox', { name: 'บ้านเลขที่ *' }).fill('123');
    await page.getByRole('textbox', { name: 'หมู่ที่' }).click();
    await page.getByRole('textbox', { name: 'หมู่ที่' }).fill('5');
    await page.getByRole('combobox', { name: 'จังหวัด *' }).click();
    await page.getByRole('combobox', { name: 'จังหวัด *' }).fill('ชล');
    await page.getByRole('option', { name: 'ชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'อำเภอ / เขต *' }).click();
    await page.getByRole('option', { name: 'เมืองชลบุรี' }).click();
    await page.getByRole('combobox', { name: 'ตำบล/แขวง *' }).click();
    await page.getByRole('option', { name: 'แสนสุข' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).click();
    await page.getByRole('textbox', { name: 'คำอธิบายที่อยู่ *' }).fill('ชุมชนอยู่ติดทะเล');
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ละติจูด *' }).fill('13.2838');
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).click();
    await page.getByRole('spinbutton', { name: 'ลองจิจูด *' }).fill('100.9157');
    await page.getByRole('combobox', { name: 'เลือกผู้ดูแล *' }).click();
    await page.locator('#community-member-selector-option-2').click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).click();
    await page.getByRole('spinbutton', { name: 'เปิดรับจำนวน *' }).fill('20');
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).click();
    await page.getByRole('textbox', { name: 'สิ่งอำนวยความสะดวก *' }).fill('อาหาร 3 มื้อ รถนำเที่ยว ไกด์');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).first().click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'ชม' }).fill('10');
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_a_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(1).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_c_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(2).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 13 มกราคม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_e_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(3).click();
    await page.getByRole('gridcell', { name: 'Choose วันอาทิตย์ที่ 18 มกราคม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_g_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('combobox', { name: 'ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา' }).click();
    await page.getByRole('option', { name: 'Tag-2-Culture' }).click();
    await page.getByText('แท็ก').click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).click();
    await page.getByRole('spinbutton', { name: 'ราคา *' }).fill('1000');

    const coverPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_125.png"
    );
    const ex1Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "IMG_124.png"
    );
    const ex2Path = path.join(
        process.cwd(),
        "assets",
        "photo",
        "OVER.jpg"
    );

    const videoPath = path.join(
        process.cwd(),
        "assets",
        "photo",
        "pkvdo.mp4"
    );

    const coverSection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
        .last();
    const coverInput = coverSection.locator('input[type="file"]');
    await coverInput.setInputFiles(coverPath);
    await expect(coverSection.locator("img")).toBeVisible({
        timeout: 10000,
    });

    const gallerySection = page
        .locator("div")
        .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
        .last();
    const galleryInput = gallerySection.locator('input[type="file"]');
    await galleryInput.setInputFiles([ex1Path, ex2Path]);
    await expect(async() => {
        const count = await gallerySection.locator("img").count();
        expect(count).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 10000 });

    const videoSection = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดวิดีโอเพิ่มเติม") })
    .last();

    const videoInput = videoSection.locator('input[type="file"]');
    await videoInput.setInputFiles(videoPath);

    await expect(videoSection.locator("video, img, .preview-container")).toBeVisible({
        timeout: 15000, 
    });

    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'ค้นหาชื่อที่พัก' }).click();
    await page.getByRole('button', { name: 'Sheepy Valley Stay' }).click();
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(4).click();
    await page.getByRole('gridcell', { name: 'Choose วันอังคารที่ 20 มกราคม' }).click();
    await page.locator('#time-input-_r_n_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_n_').getByRole('textbox', { name: 'ชม' }).fill('00');
    await page.locator('#time-input-_r_n_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_n_').getByRole('textbox', { name: 'นาที' }).fill('00');
    await page.getByRole('button', { name: 'เปิดปฏิทิน' }).nth(5).click();
    await page.getByRole('gridcell', { name: 'Choose วันพุธที่ 21 มกราคม' }).click();
    await page.locator('#time-input-_r_p_').getByRole('textbox', { name: 'ชม' }).click();
    await page.locator('#time-input-_r_p_').getByRole('textbox', { name: 'ชม' }).fill('12');
    await page.locator('#time-input-_r_p_').getByRole('textbox', { name: 'นาที' }).click();
    await page.locator('#time-input-_r_p_').getByRole('textbox', { name: 'นาที' }).fill('00');

    await page.getByRole('button', { name: 'สร้างแพ็กเกจ' }).click();
    await page.getByRole('button', { name: 'ยืนยัน' }).click();

    await expect(page).toHaveURL(/admin\/packages\/all/);
  });

});