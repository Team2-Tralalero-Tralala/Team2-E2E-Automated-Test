import { expect, test } from "@playwright/test";
import path from "path";
import { loginAs } from "../../utils/roles.js";

/** 
 * goToPageEditStore - ฟังก์ชันสำหรับนำทางไปยังหน้าจัดการแก้ไขร้านค้า
 * Input:
 *   - page: Playwright Page object
 * Action:
 *  1. คลิกที่เมนูแถบข้าง (Sidebar) "จัดการชุมชน"
 *  2. คลิกเลือกชุมชน
 *  3. คลิกที่ปุ่ม "ร้านค้า" เพื่อเปิด/ขยายส่วนร้านค้า
 *  4. คลิกที่ปุ่ม "จัดการ"
 *  5. คลิกปุ่มไอคอน (Icon) "ดินสอ" เพื่อแก้ไขร้านค้า
 * Output:
 *   - ไม่มี return value, แต่ browser จะนำทางไปยังหน้าจัดการแก้ไขร้านค้า
 */
async function goToPageEditStore(page) {
  // 1. คลิกที่เมนูแถบข้าง (Sidebar) "จัดการชุมชน"
  const manageCommunityMenu = page.getByRole("link", { name: "จัดการชุมชน" });
  await expect(manageCommunityMenu).toBeVisible();
  await manageCommunityMenu.click();

  // 2. คลิกเลือกชุมชน (เลือกชุมชนแรกที่มี หรือชุมชนที่กำหนด)
  await page
    .getByRole("link", { name: "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว" })
    .click();

  // 3. คลิกที่ปุ่ม "ร้านค้า" เพื่อเปิด/ขยายส่วนร้านค้า
  await page.getByRole("button", { name: /ร้านค้า.*จำนวน/ }).click();

  // 4. คลิกที่ปุ่ม "จัดการ"
  await page.getByRole("button", { name: "จัดการ" }).click();

  // 5. คลิกปุ่มไอคอน "ดินสอ" (pencil/edit icon) เพื่อแก้ไขร้านค้า
  // ลองหาจากหลายวิธี - อาจเป็น button with aria-label, button with SVG, หรือ button "แก้ไข"
  try {
    // ลองหาจาก button "แก้ไข" ก่อน (เหมือน TS-EST-01)
    const editButton = page.getByRole("button", { name: "แก้ไข" });
    await editButton.click({ timeout: 2000 });
  } catch {
    // ถ้าไม่เจอ ลองหาจาก aria-label หรือ title ที่มีคำว่าแก้ไข/edit
    try {
      const editButton = page.locator('button[aria-label*="แก้ไข"], button[aria-label*="edit"], button[title*="แก้ไข"], button[title*="edit"]').first();
      await editButton.click({ timeout: 2000 });
    } catch {
      // ถ้ายังไม่เจอ ลองหาจาก button ที่มี SVG (icon button)
      const iconButton = page.locator('button:has(svg)').first();
      await iconButton.click();
    }
  }

  // 6. รอให้หน้าเปลี่ยนไปยังหน้าแก้ไขร้านค้า
  await page.waitForLoadState("networkidle");
}

/**
 * uploadExtraImages - ฟังก์ชันสำหรับอัปโหลดรูปภาพเพิ่มเติม
 * เจาะจงไปที่ส่วน "อัพโหลดรูปภาพเพิ่มเติม *" เพื่อไม่ให้ชนกับ input ตัวอื่น
 */
async function uploadExtraImages(page, filesRelativePaths) {
  // 1. แปลง path ให้เป็น absolute path
  const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));

  // 2. เจาะจง section โดยหาจากหัวข้อ "อัพโหลดรูปภาพเพิ่มเติม *"
  const section = page
    .getByRole("heading", { name: "อัพโหลดรูปภาพเพิ่มเติม *" })
    .locator("..");

  // 3. หา input file ภายใน section นั้นๆ เท่านั้น
  const fileInput = section.locator('input[type="file"]');

  // 4. นับจำนวนปุ่ม "ลบ" เดิมที่มีอยู่ เพื่อใช้ตรวจสอบว่ารูปใหม่ขึ้นหรือยัง
  const removeBtns = section.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });
  const beforeCount = await removeBtns.count();

  // 5. อัปโหลดไฟล์ทีละไฟล์ (รองรับกรณี UI ไม่อนุญาตให้เลือกพร้อมกันหลายรูป)
  for (const filePath of files) {
    await fileInput.setInputFiles(filePath);
  }

  // 6. ตรวจสอบว่ารูปถูกเพิ่มเข้าไปครบตามจำนวนที่อัปโหลดหรือไม่
  const expectedCount = beforeCount + files.length;
  await expect(removeBtns).toHaveCount(expectedCount, { timeout: 30000 });
}

test.describe("SuperAdmin - Edit Store", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-EST-02.1: กรอกข้อมูลครบถ้วน
   */
  test("TS-EST-02.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
    await goToPageEditStore(page);

    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อย");
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีสได้จ๊ะลูก ๆ");
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).click();
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
    await page.getByRole("textbox", { name: "หมู่ที่" }).click();
    await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
    await page.getByRole("combobox", { name: "จังหวัด *" }).click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();
    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).click();
    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("บ้านเลขที่ 11 หมู่ 6");
    await page.getByRole("spinbutton", { name: "ละติจูด *" }).click();
    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.2838");
    await page.getByRole("spinbutton", { name: "ลองจิจูด *" }).click();
    await page.getByRole("spinbutton", { name: "ลองจิจูด *" }).fill("100.9157");

    // ลบแท็กเดิมก่อน (ถ้ามี)
    const closeTagButtons = page.getByRole("button", { name: "✕" });
    const tagCount = await closeTagButtons.count();
    for (let i = 0; i < tagCount; i++) {
      await closeTagButtons.first().click();
    }

    // เพิ่มแท็ก
    // ค้นหาและเลือกแท็ก "ส้มตำ"
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "ส้มตำ" }).click();
    await page.keyboard.press("Escape");

    // ค้นหาและเลือกแท็ก "บางแสน"
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "บางแสน" }).click();
    await page.keyboard.press("Escape");

    const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

    // ลบรูปภาพเดิมก่อนอัพโหลด
    // ลบรูปภาพหน้าปก
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
    if (await coverDeleteBtn.count() > 0) {
      await coverDeleteBtn.first().click();
    }

    // ลบรูปภาพเพิ่มเติม
    const extraArea = page.locator('div').filter({ has: page.getByText('อัพโหลดรูปภาพเพิ่มเติม') }).last();
    const extraDeleteBtns = extraArea.locator('button[title="ลบไฟล์"]');
    while (await extraDeleteBtns.count() > 0) {
      await extraDeleteBtns.first().click();
      await page.waitForTimeout(500);
    }

    // อัพโหลดภาพหน้าปก
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);

    // อัพโหลดรูปภาพเพิ่มเติม (2 รูป)
    const extraInput = extraArea.locator('input[type="file"]');
    for (let i = 1; i <= 2; i++) {
      await extraInput.setInputFiles(imagePath);
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-EST-02.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด
   */
  test("TS-EST-02.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
    await goToPageEditStore(page);

    // กรอกข้อมูลไม่ครบถ้วน - ลบข้อมูลบางส่วน
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).fill("");
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).click();
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).fill("");

    // ลบแท็ก
    const closeTagButtons = page.getByRole("button", { name: "✕" });
    const tagCount = await closeTagButtons.count();
    for (let i = 0; i < tagCount; i++) {
      await closeTagButtons.first().click();
    }

    // ลบรูปภาพหน้าปก
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
    if (await coverDeleteBtn.count() > 0) {
      await coverDeleteBtn.first().click();
    }

    // ลบรูปภาพเพิ่มเติม
    const extraArea = page.locator('div').filter({ has: page.getByText('อัพโหลดรูปภาพเพิ่มเติม') }).last();
    const extraDeleteBtns = extraArea.locator('button[title="ลบไฟล์"]');
    while (await extraDeleteBtns.count() > 0) {
      await extraDeleteBtns.first().click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toBeVisible();
  });

  /**
   * TS-EST-02.3: ปักหมุดหากไม่พบสถานที่
   */
  test("TS-EST-02.3: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
    await goToPageEditStore(page);

    // ค้นหาสถานที่ไม่เจอ (ลองค้นหาสิ่งที่ไม่น่าจะมี)
    const searchInput = page.locator('input[placeholder*="ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียง"]');
    await searchInput.click();
    await searchInput.fill("สถานที่ที่ไม่มีในระบบ");
    await page.waitForTimeout(2000); // รอผลการค้นหา 2 วินาที

    // เลื่อนแผนที่ (drag the leaflet map)
    const mapContainer = page.locator('.leaflet-container');
    const mapBox = await mapContainer.boundingBox();
    if (mapBox) {
      const centerX = mapBox.x + mapBox.width / 2;
      const centerY = mapBox.y + mapBox.height / 2;
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX - 100, centerY - 50);
      await page.mouse.up();
    }

    // คลิก "ปักหมุด" (div element)
    await page.getByText("ปักหมุด", { exact: true }).click();

    // ตรวจสอบว่าพิกัดถูกตั้งค่า
    await expect(page.getByRole("spinbutton", { name: "ละติจูด *" })).not.toHaveValue("");
    await expect(page.getByRole("spinbutton", { name: "ลองจิจูด *" })).not.toHaveValue("");

    await page.getByRole("button", { name: "บันทึก" }).click();

    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-EST-02.4: เพิ่มหรือลบแท็ก
   */
  test("TS-EST-02.4: เพิ่มหรือลบแท็ก", async ({ page }) => {
    await goToPageEditStore(page);

    // ลบแท็กเดิมก่อน (ถ้ามี)
    const closeTagButtons = page.getByRole("button", { name: "✕" });
    const tagCount = await closeTagButtons.count();
    for (let i = 0; i < tagCount; i++) {
      await closeTagButtons.first().click();
    }

    // เพิ่มแท็กใหม่
    // ค้นหาและเลือกแท็ก "กาแฟ"
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: /กาแฟ/ }).click();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "บันทึก" }).click();

    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-EST-02.5: ไม่เพิ่มแท็ก
   */
  test("TS-EST-02.5: ไม่เพิ่มแท็ก", async ({ page }) => {
    await goToPageEditStore(page);

    // ลบแท็กทั้งหมด
    const closeTagButtons = page.getByRole("button", { name: "✕" });
    const tagCount = await closeTagButtons.count();
    for (let i = 0; i < tagCount; i++) {
      await closeTagButtons.first().click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();

    // ตรวจสอบว่า error message แสดงใน modal
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toBeVisible();
  });

  /**
   * TS-EST-02.6: อัพโหลดรูปภาพหน้าปก
   */
  test("TS-EST-02.6: อัพโหลดรูปภาพหน้าปก", async ({ page }) => {
    await goToPageEditStore(page);

    const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

    // ลบรูปภาพเดิมก่อนอัพโหลด
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
    if (await coverDeleteBtn.count() > 0) {
      await coverDeleteBtn.first().click();
    }

    // อัพโหลดรูปภาพหน้าปก
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);

    await page.getByRole("button", { name: "บันทึก" }).click();

    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-EST-02.7: ไม่อัพโหลดรูปภาพหน้าปก
   */
  test("TS-EST-02.7: ไม่อัพโหลดรูปภาพหน้าปก", async ({ page }) => {
    await goToPageEditStore(page);

    // ลบรูปภาพหน้าปก (สำหรับทดสอบกรณีไม่อัพโหลด)
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
    if (await coverDeleteBtn.count() > 0) {
      await coverDeleteBtn.first().click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page.getByText("กรุณาอัพโหลดรูปภาพให้ครบถ้วน")).toBeVisible();
  });

  /**
   * TS-EST-02.8: อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TS-EST-02.8: อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
    await goToPageEditStore(page);

    const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

    // ลบรูปภาพเดิมก่อนอัพโหลด
    const extraArea = page.locator('div').filter({ has: page.getByText('อัพโหลดรูปภาพเพิ่มเติม') }).last();
    const extraDeleteBtns = extraArea.locator('button[title="ลบไฟล์"]');
    while (await extraDeleteBtns.count() > 0) {
      await extraDeleteBtns.first().click();
      await page.waitForTimeout(500);
    }

    // อัพโหลดรูปภาพเพิ่มเติม (3 รูป)
    const extraInput = extraArea.locator('input[type="file"]');
    for (let i = 1; i <= 3; i++) {
      await extraInput.setInputFiles(imagePath);
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-EST-02.9: ไม่อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TS-EST-02.9: ไม่อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
    await goToPageEditStore(page);

    // ลบรูปภาพเพิ่มเติมทั้งหมด (สำหรับทดสอบกรณีไม่อัพโหลด)
    const extraArea = page.locator('div').filter({ has: page.getByText('อัพโหลดรูปภาพเพิ่มเติม') }).last();
    const extraDeleteBtns = extraArea.locator('button[title="ลบไฟล์"]');
    while (await extraDeleteBtns.count() > 0) {
      await extraDeleteBtns.first().click();
      await page.waitForTimeout(500);
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page.getByText("กรุณาอัพโหลดรูปภาพ")).toBeVisible();
  });

  /**
   * TS-EST-02.10: กรอกข้อมูลครบถ้วนและยืนยันการสร้างร้านค้า (แบบ Modal)
   */
  test("TS-EST-02.10: กรอกข้อมูลครบถ้วนและยืนยันการสร้างร้านค้า (แบบ Modal)", async ({ page }) => {
    await goToPageEditStore(page);

    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อย");
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีสได้จ๊ะลูก ๆ");
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).click();
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
    await page.getByRole("textbox", { name: "หมู่ที่" }).click();
    await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
    await page.getByRole("combobox", { name: "จังหวัด *" }).click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();
    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).click();
    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("บ้านเลขที่ 11 หมู่ 6");
      const searchInput = page.locator('input[placeholder*="ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียง"]');
      await searchInput.click();
      await searchInput.fill("วงเวียนบางแสน");
    await page.waitForTimeout(2000); // รอผลการค้นหา 2 วินาที
    
    // เลื่อนแผนที่ (drag the leaflet map)
    const mapContainer = page.locator('.leaflet-container');
    const mapBox = await mapContainer.boundingBox();
    if (mapBox) {
      const centerX = mapBox.x + mapBox.width / 2;
      const centerY = mapBox.y + mapBox.height / 2;
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX - 100, centerY - 50);
      await page.mouse.up();
    }
    
    await page.getByRole("spinbutton", { name: "ละติจูด *" }).click();
    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.2838");
    await page.getByRole("spinbutton", { name: "ลองจิจูด *" }).click();
    await page.getByRole("spinbutton", { name: "ลองจิจูด *" }).fill("100.9157");

    // ลบแท็กเดิมก่อน (ถ้ามี)
    const closeTagButtons = page.getByRole("button", { name: "✕" });
    const tagCount = await closeTagButtons.count();
    for (let i = 0; i < tagCount; i++) {
      await closeTagButtons.first().click();
    }

    // เพิ่มแท็ก
    // ค้นหาและเลือกแท็ก "ส้มตำ"
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "ส้มตำ" }).click();
    await page.keyboard.press("Escape");

    // ค้นหาและเลือกแท็ก "บางแสน"
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "บางแสน" }).click();
    await page.keyboard.press("Escape");
    const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

    // ลบรูปภาพเดิมก่อนอัพโหลด
    // ลบรูปภาพหน้าปก
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
    if (await coverDeleteBtn.count() > 0) {
      await coverDeleteBtn.first().click();
    }

    // ลบรูปภาพเพิ่มเติม
    const extraArea = page.locator('div').filter({ has: page.getByText('อัพโหลดรูปภาพเพิ่มเติม') }).last();
    const extraDeleteBtns = extraArea.locator('button[title="ลบไฟล์"]');
    while (await extraDeleteBtns.count() > 0) {
      await extraDeleteBtns.first().click();
      await page.waitForTimeout(500);
    }

    // อัพโหลดภาพหน้าปก
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);

    // อัพโหลดรูปภาพเพิ่มเติม (2 รูป)
    const extraInput = extraArea.locator('input[type="file"]');
    for (let i = 1; i <= 2; i++) {
      await extraInput.setInputFiles(imagePath);
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-EST-02.11: กรอกข้อมูลไม่ครบถ้วนและบันทึกการสร้างร้านค้า
   */
  test("TS-EST-02.11: กรอกข้อมูลไม่ครบถ้วนและบันทึกการสร้างร้านค้า", async ({ page }) => {
    await goToPageEditStore(page);

    // กรอกข้อมูลไม่ครบถ้วน - ลบข้อมูลบางส่วน
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).fill("");
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).click();
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).fill("");

    // ลบแท็ก
    const closeTagButtons = page.getByRole("button", { name: "✕" });
    const tagCount = await closeTagButtons.count();
    for (let i = 0; i < tagCount; i++) {
      await closeTagButtons.first().click();
    }

    // ลบรูปภาพ
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
    if (await coverDeleteBtn.count() > 0) {
      await coverDeleteBtn.first().click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    
    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toBeVisible();
  });

  /**
   * TS-EST-02.12: ยกเลิกการแก้ไขร้านค้า (แบบ Modal)
   */
  test("TS-EST-02.12: ยกเลิกการแก้ไขร้านค้า (แบบ Modal)", async ({ page }) => {
    await goToPageEditStore(page);

    // กรอกข้อมูลบางส่วน (หรือไม่กรอกก็ได้)
    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อยทดสอบ");

    await page.getByRole("button", { name: "บันทึก" }).click();

    // คลิกยกเลิกใน modal
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "ยกเลิก" }).click();

    // ตรวจสอบว่ายังอยู่ในหน้าแก้ไขร้านค้า
    await expect(page.getByRole("textbox", { name: "ชื่อร้านค้า *" })).toBeVisible();
  });

  /**
   * TS-EST-02.13: ยกเลิกการแก้ไขร้านค้า
   */
  test("TS-EST-02.13: ยกเลิกการแก้ไขร้านค้า", async ({ page }) => {
    await goToPageEditStore(page);

    // กรอกข้อมูลบางส่วน (หรือไม่กรอกก็ได้)
    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อยทดสอบ");

    // คลิกยกเลิก (นอก modal)
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    
    // รอให้ modal แสดงขึ้น
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // คลิกยืนยันใน modal
    await modal.getByRole("button", { name: "ยืนยัน" }).click();

    // ตรวจสอบว่าเปลี่ยนหน้าไปยังหน้าจัดการร้านค้า
    await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);
  });
});

