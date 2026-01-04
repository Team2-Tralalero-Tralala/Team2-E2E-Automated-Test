import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/** * goToPageEditStore - ฟังก์ชันสำหรับนำทางไปยังหน้าจัดการแก้ไขร้านค้า
 * Input:
 *   - page: Playwright Page object
 * Action:
 *  1. คลิกที่ลิงก์ของชุมชน "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว"
 *  2. คลิกที่ปุ่มร้านค้าเพื่อดูร้านค้าทั้งหมด
 *  3. คลิกที่ปุ่มจัดการร้านค้า
 *  4. คลิกที่ปุ่มแก้ไขเพื่อเข้าสู่หน้าจัดการแก้ไขร้านค้า
 * Output:
 *   - ไม่มี return value, แต่ browser จะนำทางไปยังหน้าจัดการแก้ไขร้านค้า
 */
async function goToPageEditStore(page) {
  await page
    .getByRole("link", { name: "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว" })
    .click();
  await page.getByRole("button", { name: "ร้านค้า จำนวน 1 ร้านค้า" }).click();
  await page.getByRole("button", { name: "จัดการ" }).click();
  await page.getByRole("button", { name: "แก้ไข" }).click();
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

/**
 * uploadProfileImage - ฟังก์ชันสำหรับอัพโหลดรูปโปรไฟล์
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. กำหนด path ของรูปโปรไฟล์
 *   2. อัพโหลดไฟล์ผ่าน input[type="file"]
 *   3. ตรวจสอบว่า dialog สำหรับรูปภาพแสดงขึ้น
 *   4. กดปุ่ม "ใช้รูปเดิม" เพื่อยืนยันรูป
 * Output:
 *   - ไม่มี return value, แต่ browser จะแสดง dialog และอัพโหลดรูปสำเร็จ
 */
async function uploadProfileImage(page) {
  const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");
  await page.locator('input[type="file"]').setInputFiles(imagePath);

  const imageDialog = page.getByRole("dialog");
  await expect(imageDialog).toBeVisible();

  const useOriginalBtn = imageDialog.getByRole("button", {
    name: "ใช้รูปเดิม",
  });
  await expect(useOriginalBtn).toBeEnabled();
  await useOriginalBtn.click();
}

test.describe("SuperAdmin - Edit Store", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-ECT-01.1
   * แก้ไขร้านค้าสำเร็จ
   */
  test("TC-ECT-01.1: SuperAdmin Edit Store Successfully", async ({ page }) => {
    await goToPageEditStore(page);

    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อย");
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ");
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
    await page.getByRole("button", { name: "✕" }).click();
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.keyboard.press("Escape");
    
    const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

    // --- 1. จัดการล้าง "ภาพหน้าปก" (ส่วนบน) ---
    const coverArea = page.locator('div').filter({ has: page.getByText('อัพโหลดภาพหน้าปก') }).last();
    // ค้นหาปุ่มทุกลูกในโซนหน้าปก (ซึ่งปกติจะมีแค่ปุ่มลบรูป)
    const coverDeleteBtn = coverArea.locator('button'); 
    if (await coverDeleteBtn.count() > 0) {
        await coverDeleteBtn.first().click();
        // รอจนกว่าจะเห็นข้อความ "0 / 1" เพื่อยืนยันว่าลบเกลี้ยงแล้ว
        await expect(coverArea).toContainText("0 / 1", { timeout: 10000 });
    }
    // เริ่มอัปโหลดใหม่
    await coverArea.locator('input[type="file"]').setInputFiles(imagePath);
    await expect(coverArea).toContainText("1 / 1", { timeout: 15000 });

    // --- 2. จัดการล้าง "รูปภาพเพิ่มเติม" (ส่วนล่าง) ---
    const extraArea = page.locator('div').filter({ has: page.getByText('อัพโหลดรูปภาพเพิ่มเติม') }).last();
    const extraDeleteBtns = extraArea.locator('button');
    
    // ลูปกดปุ่มลบที่มีทั้งหมดในโซนนี้จนกว่าตัวเลขจะกลายเป็น "0 / 5"
    while (await extraDeleteBtns.count() > 0) {
        await extraDeleteBtns.first().click();
        await page.waitForTimeout(500); // เว้นจังหวะให้ UI ขยับ
    }
    await expect(extraArea).toContainText("0 / 5", { timeout: 10000 });

    // อัปโหลด 2 รูปใหม่ตามตรรกะของเพื่อน (วน loop เพื่อความเสถียร)
    const extraInput = extraArea.locator('input[type="file"]');
    for (let i = 1; i <= 2; i++) {
        await extraInput.setInputFiles(imagePath);
        // รอให้ตัวเลขเปลี่ยนเป็น 1/5 และ 2/5 ตามลำดับ
        await expect(extraArea).toContainText(`${i} / 5`, { timeout: 15000 });
    }
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-ECT-01.2
   * ข้อมูลร้านค้ากรอกไม่ครบถ้วน
   *
   */
  test("TC-ECT-01.2: SuperAdmin Edit Store Unsuccessfull", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).click();
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("");
    await page.getByRole("textbox", { name: "หมู่ที่" }).click();
    await page.getByRole("textbox", { name: "หมู่ที่" }).fill("");
    await page.getByRole("combobox", { name: "จังหวัด *" }).click();
    await page.getByRole("combobox", { name: "จังหวัด *" }).fill("");
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).fill("");
    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).fill("");
    await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).click();
    await page.getByRole("button", { name: "✕" }).click();
    await page.getByRole("button", { name: "ลบไฟล์ลำดับที่" }).first().click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-ECT-01.3
   * ปักหมุดหากไม่พบสถานที่
   *
   */
  test("TC-ECT-01.3: SuperAdmin Edit Store Successfull", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByText("ปักหมุด", { exact: true }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TC-ECT-01.4
   *  เพิ่มหรือลบแท็ก
   *
   */
  test("TC-ECT-01.4: SuperAdmin Edit Store Successfull", async ({ page }) => {
    await goToPageEditStore(page);
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .fill("");
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
  });

  /**
   * TC-ECT-01.5
   *  ไม่เพิ่มแท็ก
   *
   */
  test("TC-ECT-01.5: SuperAdmin Edit Store Successfull", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("button", { name: "✕" }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
  });
  /**
   * TC-ECT-01.6
   *  อัพโหลดรูปภาพหน้าปก
   *
   */
  test("TC-ECT-01.6: SuperAdmin Edit Store Successfull", async ({ page }) => {
    await goToPageEditStore(page);
  });
  /**
   * TC-ECT-01.7
   * ไม่อัพโหลดรูปภาพหน้าปก
   *
   */
  test("TC-ECT-01.7: SuperAdmin Edit Store Successfull", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("button", { name: "ลบไฟล์ลำดับที่" }).first().click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-ECT-01.8
   * อัพโหลดรูปภาพเพิ่มเติม
   *
   */
  test("TC-ECT-01.8: SuperAdmin Edit Store Successfull", async ({ page }) => {
    await goToPageEditStore(page);
  });

  /**
   * TC-ECT-01.9
   * ไม่อัพโหลดรูปภาพเพิ่มเติม
   *
   */
  test("TC-ECT-01.9: SuperAdmin Edit Store Unsuccessfull", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("button", { name: "ลบไฟล์ลำดับที่" }).nth(1).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-ECT-01.10
   * แก้ไขร้านค้าสำเร็จ
   */
  test("TC-ECT-01.10: SuperAdmin Edit Store Successfully", async ({ page }) => {
    await goToPageEditStore(page);

    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อย");
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ");
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
    await page.getByRole("button", { name: "✕" }).click();
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-ECT-01.11
   * แก้ไขร้านค้าสำเร็จ
   */
  test("TC-ECT-01.11: SuperAdmin Edit Store Successfully", async ({ page }) => {
    await goToPageEditStore(page);

    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อย");
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ");
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
    await page.getByRole("button", { name: "✕" }).click();
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.getByRole('button', { name: 'บันทึก' }).click();
  await page.getByRole('button', { name: 'ยกเลิก' }).click();

  });
  /**
   * TC-ECT-01.12
   * แก้ไขร้านค้าสำเร็จ
   */
  test("TC-ECT-01.12: SuperAdmin Edit Store Successfully", async ({ page }) => {
    await goToPageEditStore(page);

    await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อร้านค้า *" })
      .fill("ป้านกน้อย");
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).click();
    await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ");
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
    await page.getByRole("button", { name: "✕" }).click();
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
  });
});
