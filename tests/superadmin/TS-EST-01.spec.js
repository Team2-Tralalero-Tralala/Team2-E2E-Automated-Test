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
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพหน้าปก (Cover Image)
 * ปรับปรุง: แก้ไขปัญหาหาปุ่มลบไม่เจอ โดยการหาปุ่มที่มองเห็นได้แทนการอิงชื่อปุ่ม
 */
async function uploadCoverImage(page, fileRelativePath) {
  const filePath = path.join(process.cwd(), fileRelativePath);

  // 1. หา Section ของ "อัพโหลดภาพหน้าปก"
  const section = page
    .locator("div")
    .filter({
      has: page.getByRole("heading", { name: /อัพโหลดภาพหน้าปก/ }),
    })
    .last();

  // 2. ระบุปุ่ม "เพิ่มไฟล์" เอาไว้เช็คสถานะ
  // (ใช้ .first() เผื่อเจอหลายอัน แต่ปกติใน section นี้จะมีอันเดียว)
  const addBtn = section.getByRole("button", { name: "เพิ่มไฟล์" }).first();

  // 3. ตรวจสอบว่ามีรูปคาอยู่ไหม?
  // ถ้าปุ่มเพิ่มไฟล์ "ไม่แสดง" (Hidden) หรือหาไม่เจอ -> แปลว่าสล็อตเต็ม -> ต้องลบรูปเก่าก่อน
  if (!(await addBtn.isVisible())) {
    console.log("Cover image detected. Searching for delete button...");

    // Trick: เอาเมาส์ไปชี้ที่กลาง Section ก่อน เผื่อปุ่มลบซ่อนอยู่ (Hover state)
    await section.hover();

    // --- วิธีใหม่: หาปุ่มลบโดยไม่อิงชื่อ (Generic Search) ---
    // ดึงปุ่มทั้งหมดใน Section นี้ออกมา
    const allBtns = await section.getByRole("button").all();
    let deleteClicked = false;

    for (const btn of allBtns) {
      // เงื่อนไข: เป็นปุ่มที่ "มองเห็นได้" และ "ไม่ใช่ปุ่มเพิ่มไฟล์"
      if (await btn.isVisible()) {
        const text = await btn.innerText(); // ดึงข้อความปุ่ม (ถ้ามี)

        // ถ้าข้อความไม่มีคำว่า "เพิ่มไฟล์" ให้สันนิษฐานว่าเป็นปุ่มลบ (X)
        if (!text.includes("เพิ่มไฟล์")) {
          console.log("Found a visible button (likely Delete/X). Clicking...");
          await btn.click();
          deleteClicked = true;
          break; // ลบแค่รูปเดียวแล้วหยุด loop
        }
      }
    }

    // ถ้ากดลบไปแล้ว ต้องรอให้ปุ่ม "เพิ่มไฟล์" เด้งกลับมา
    if (deleteClicked) {
      await expect(addBtn).toBeVisible({ timeout: 5000 });
    } else {
      console.log("Warning: Could not find any delete button!");
    }
  }

  // 4. อัปโหลดรูปใหม่ (ถึงตรงนี้ปุ่มเพิ่มไฟล์ควรจะพร้อมแล้ว)
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    addBtn.click(),
  ]);
  await fileChooser.setFiles(filePath);

  // 5. รอและตรวจสอบว่าอัปโหลดสำเร็จ
  // เมื่ออัปโหลดเสร็จ ปุ่มเพิ่มไฟล์ต้องหายไป (ถูกแทนที่ด้วยรูป preview)
  await expect(addBtn).toBeHidden({ timeout: 10000 });

  // รอให้ UI นิ่งสักครู่
  await page.waitForTimeout(500);
}
/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพเพิ่มเติม (Extra Images)
 * รองรับการอัปโหลดหลายไฟล์ โดยจะเพิ่มต่อจากรูปที่มีอยู่เดิม
 */
/**
 * ฟังก์ชันสำหรับอัปโหลดรูปภาพเพิ่มเติม (Extra Images)
 * ปรับปรุง: ล้างรูปเดิมออกให้หมดก่อนเพื่อให้เป็น Clean State
 */
async function uploadExtraImages(page, filesRelativePaths) {
  const section = page.locator('div').filter({
    has: page.getByRole("heading", { name: /อัพโหลดรูปภาพเพิ่มเติม/ }),
  }).last();

  const removeBtns = section.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });

  // 1. ลบรูปเดิมออกให้หมดก่อน (ถ้ามี)
  // วนลูปคลิกปุ่มลบตัวแรกจนกว่าปุ่มลบจะหมดไปจากหน้าจอ
  while (await removeBtns.count() > 0) {
    await removeBtns.first().click();
    // รอให้จำนวนปุ่มลดลงจริงๆ ก่อนวนลูปต่อ
    await page.waitForTimeout(500); 
  }
  
  // ตรวจสอบให้มั่นใจว่าสะอาดแล้วจริงๆ
  await expect(removeBtns).toHaveCount(0);

  const addBtn = section.getByRole("button", { name: "เพิ่มไฟล์" })
    .filter({ hasText: /\/ 5/ })
    .last();

  // 2. เริ่มอัปโหลดรูปใหม่ทีละไฟล์
  for (const relativePath of filesRelativePaths) {
    const filePath = path.join(process.cwd(), relativePath);
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      addBtn.click(),
    ]);
    await fileChooser.setFiles(filePath);
    await page.waitForTimeout(1000); // รอให้ UI อัปเดตสถานะ (เช่น 1 / 5)
  }

  // 3. ยืนยันผล: จำนวนปุ่มลบต้องเท่ากับจำนวนไฟล์ที่เพิ่งอัปโหลดไป
  await expect(removeBtns).toHaveCount(filesRelativePaths.length, { timeout: 20000 });
}

test.describe("SuperAdmin - Edit Store", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-EST-01.1
   * กรอกข้อมูลครบถ้วน
   */
  test("TC-EST-01.1: กรอกข้อมูลครบถ้วน", async ({ page }) => {
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

    // กำหนดไฟล์รูปที่จะใช้ (profile.jpg)
    const profileImgPath = "assets/photo/profile.jpg";

    // 1. อัปโหลดรูปปก (จะทำการลบรูปเก่าให้อัตโนมัติในฟังก์ชัน)
    await test.step("อัปโหลดรูปภาพหน้าปก (ลบเก่า-เพิ่มใหม่)", async () => {
      await uploadCoverImage(page, profileImgPath);
    });

    // 2. อัปโหลดรูปเพิ่มเติม (ส่วนนี้เหมือนเดิม)
    await test.step("อัปโหลดรูปภาพเพิ่มเติม", async () => {
      await uploadExtraImages(page, [profileImgPath]);
    });

    // 3. บันทึกและยืนยัน
    await test.step("บันทึกข้อมูล", async () => {
      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page.getByRole("button", { name: "ยืนยัน" }).click();

      const closeBtn = page.getByRole("button", { name: "ปิด" });
      await expect(closeBtn).toBeVisible({ timeout: 15000 });
      await closeBtn.click();

      await expect(page).toHaveURL(/\/stores\/all/);
    });
  });
  /**
   * TC-EST-01.2
   * กรอกข้อมูลไม่ครบถ้วนหลายจุด
   */
  test("TC-EST-01.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
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
   * TC-EST-01.3
   * ปักหมุดหากไม่พบสถานที่
   */
  test("TC-EST-01.3: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
    await goToPageEditStore(page);
    await page
      .locator("div")
      .filter({ hasText: /^\+− Leaflet \| © OpenStreetMap contributors$/ })
      .nth(1)
      .dblclick();
    await page.getByText("ปักหมุด", { exact: true }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TC-EST-01.4
   * เพิ่มหรือลบแท็ก
   */
  test("TC-EST-01.4: เพิ่มหรือลบแท็ก", async ({ page }) => {
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
   * TC-EST-01.5
   * ไม่เพิ่มแท็ก
   */
  test("TC-EST-01.5: ไม่เพิ่มแท็ก", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("button", { name: "✕" }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
  });
  /**
   * TC-EST-01.6
   * อัพโหลดรูปภาพหน้าปก
   */
  test("TC-EST-01.6: อัพโหลดรูปภาพหน้าปก", async ({ page }) => {
    await goToPageEditStore(page);
    // กำหนดไฟล์รูปที่จะใช้ (profile.jpg)
    const profileImgPath = "assets/photo/profile.jpg";
    await uploadCoverImage(page, profileImgPath);
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
    
  });
  /**
   * TC-EST-01.7
   * ไม่อัพโหลดรูปภาพหน้าปก
   */
  test("TC-EST-01.7: ไม่อัพโหลดรูปภาพหน้าปก", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("button", { name: "ลบไฟล์ลำดับที่" }).first().click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-EST-01.8
   * อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TC-EST-01.8: อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
    await goToPageEditStore(page);
    // กำหนดไฟล์รูปที่จะใช้ (profile.jpg)
    const profileImgPath = "assets/photo/profile.jpg";

    // 1. อัปโหลดรูปปก (จะทำการลบรูปเก่าให้อัตโนมัติในฟังก์ชัน)
    await test.step("อัปโหลดรูปภาพหน้าปก (ลบเก่า-เพิ่มใหม่)", async () => {
      await uploadCoverImage(page, profileImgPath);
    });

    // 2. อัปโหลดรูปเพิ่มเติม (ส่วนนี้เหมือนเดิม)
    await test.step("อัปโหลดรูปภาพเพิ่มเติม", async () => {
      await uploadExtraImages(page, [profileImgPath]);
    });

    // 3. บันทึกและยืนยัน
    await test.step("บันทึกข้อมูล", async () => {
      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page.getByRole("button", { name: "ยืนยัน" }).click();

      const closeBtn = page.getByRole("button", { name: "ปิด" });
      await expect(closeBtn).toBeVisible({ timeout: 15000 });
      await closeBtn.click();

      await expect(page).toHaveURL(/\/stores\/all/);
    });
  });

  /**
   * TC-EST-01.9
   * ไม่อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TC-EST-01.9: ไม่อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
    await goToPageEditStore(page);
    await page.getByRole("button", { name: "ลบไฟล์ลำดับที่" }).nth(1).click();
    await page.getByRole("button", { name: "บันทึก" }).click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
    await page.getByRole("button", { name: "ปิด" }).click();
  });
  /**
   * TC-EST-01.10
   * กรอกข้อมูลครบถ้วนและยืนยันการสร้างร้านค้า
   */
  test("TC-EST-01.10: กรอกข้อมูลครบถ้วนและยืนยันการสร้างร้านค้า\n(แบบ Modal)", async ({
    page,
  }) => {
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
   * TC-EST-01.11
   */
  test("TC-EST-01.11: กรอกข้อมูลไม่ครบถ้วนและบันทึกการสร้างร้านค้า", async ({
    page,
  }) => {
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
    await page.getByRole("button", { name: "ยกเลิก" }).click();
  });
  /**
   * TC-EST-01.12
   */
  test("TC-EST-01.12: ยกเลิกการแก้ไขร้านค้า (แบบ Modal)", async ({ page }) => {
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
  /**
   * TC-EST-01.13
   *
   */
  test("TC-EST-01.13: ยกเลิกการแก้ไขร้านค้า (แบบ Modal)", async ({ page }) => {
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
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();
  });

});
