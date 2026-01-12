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
async function goToEditHomestayDetailPage(page, target = "บางแสนริมเล") {
  // กำหนด Default เป็น Homestay A
  // 2. คลิกเมนูย่อย "จัดการที่พัก" (ตามรูป Sidebar)
  const manageHomestays = page.getByRole("link", { name: "จัดการที่พัก" });
  await expect(manageHomestays).toBeVisible();
  await manageHomestays.click();

  // เช็คว่าเข้ามาหน้าตารางที่พักแล้ว
  await expect(page).toHaveURL(/.*\/community\/homestays/);

  // 3. เลือกคลิกที่ชื่อ "Homestay A" เพื่อเข้าไปหน้าดูรายละเอียด (ตามรูปตาราง)
  // การใช้ getByRole('link', { name: ... }) จะแม่นยำกว่าการจิ้มแถวแรก (first())
  await page.getByRole("link", { name: target }).click();

  // 4. กดปุ่ม "แก้ไข" (สีเขียวขวาบน ในหน้ารายละเอียด)
  const editButton = page.getByRole("link", { name: "แก้ไข", exact: true });
  await expect(editButton).toBeVisible();
  await editButton.click();

  // เช็คว่าเข้าหน้า Edit เรียบร้อย
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
    const mapEl = document.querySelector(".leaflet-container");

    const rect = mapEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + 50;
    const y = rect.top + rect.height / 2 + 50;

    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    });

    const target = mapEl.querySelector(".leaflet-map-pane") || mapEl;
    target.dispatchEvent(clickEvent);
  });

  if ((await latInput.inputValue()) === beforeLat) {
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
  const coverHeading = page.getByRole("heading", {
    name: "ภาพหน้าปก (COVER) *",
  });
  const galleryHeading = page.getByRole("heading", {
    name: "รูปเพิ่มเติม (GALLERY) *",
  });

  await expect(coverHeading).toBeVisible();
  await expect(galleryHeading).toBeVisible();

  const section = coverHeading.locator("..");

  //ลบรูปหน้าปกเดิม (ถ้ามี)
  const allDeleteBtns = await section
    .getByRole("button", { name: /ลบไฟล์/ })
    .all();

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
    await expect(
      section.getByRole("button", { name: /ลบไฟล์/ }).first()
    ).toBeVisible();
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

  await page.waitForLoadState("networkidle");

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

  await expect(removeBtns).toHaveCount(before + filesRelativePaths.length, {
    timeout: 10000,
  });
}

test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-EHT-01.1
   * กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน
   */
  test("TS-EHT-01.1: กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน", async ({ page }) => {
    await goToEditHomestayDetailPage(page);
    await page.getByRole("textbox", { name: "ชื่อที่พัก *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อที่พัก *" })
      .fill("บางแสนริมเล");
    await page.getByRole("textbox", { name: "ประเภทที่พัก *" }).click();
    await page
      .getByRole("textbox", { name: "ประเภทที่พัก *" })
      .fill("โฮมสเตย์");
    await page.getByRole("textbox", { name: "สิ่งอำนวยความสะดวก *" }).click();
    await page
      .getByRole("textbox", { name: "สิ่งอำนวยความสะดวก *" })
      .fill("แอร์ น้ำอุ่น อาหารเช้า");
    await page.getByRole("spinbutton", { name: "จำนวนห้องทั้งหมด *" }).click();
    await page
      .getByRole("spinbutton", { name: "จำนวนห้องทั้งหมด *" })
      .fill("20");
    await page
      .getByRole("spinbutton", { name: "จำนวนผู้เข้าพักต่อห้อง *" })
      .click();
    await page
      .getByRole("spinbutton", { name: "จำนวนผู้เข้าพักต่อห้อง *" })
      .fill("2");
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).click();
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("29");
    await page.getByRole("textbox", { name: "หมู่ที่" }).click();
    await page.getByRole("textbox", { name: "หมู่ที่" }).fill("2");
    await page.getByRole("button", { name: "Open" }).first().click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();
    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).click();
    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ใกล้ติดคาเฟ่หมาจัสมิน \n");

    const mapSearchBox = page.getByPlaceholder(
      /ป้อนชื่อวิสาหกิจชุมชน|ค้นหาสถานที่/
    );
    if (await mapSearchBox.isVisible()) {
      await mapSearchBox.fill("วงเวียนบางแสน");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);
    }

    await page.getByLabel("ละติจูด *").fill("13.2838");
    await page.getByLabel("ลองจิจูด *").fill("100.9157");
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-1-Relax" }).click();
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });

  /**
   * TS-EHT-01.2
   * กรอกข้อมูลไม่ครบถ้วนหลายจุด
   */
  test("TS-EHT-01.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
    await goToEditHomestayDetailPage(page);
    await page.getByRole("textbox", { name: "ชื่อที่พัก *" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อที่พัก *" })
      .fill("");
    await page.getByRole("textbox", { name: "ประเภทที่พัก *" }).click();
    await page
      .getByRole("textbox", { name: "ประเภทที่พัก *" })
      .fill("");
    await page.getByRole("textbox", { name: "สิ่งอำนวยความสะดวก *" }).click();
    await page
      .getByRole("textbox", { name: "สิ่งอำนวยความสะดวก *" })
      .fill("แอร์ น้ำอุ่น อาหารเช้า");
    await page.getByRole("spinbutton", { name: "จำนวนห้องทั้งหมด *" }).click();
    await page
      .getByRole("spinbutton", { name: "จำนวนห้องทั้งหมด *" })
      .fill("20");
    await page
      .getByRole("spinbutton", { name: "จำนวนผู้เข้าพักต่อห้อง *" })
      .click();
    await page
      .getByRole("spinbutton", { name: "จำนวนผู้เข้าพักต่อห้อง *" })
      .fill("");
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).click();
    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("");
    await page.getByRole("textbox", { name: "หมู่ที่" }).click();
    await page.getByRole("textbox", { name: "หมู่ที่" }).fill("2");
    await page.getByRole("button", { name: "Open" }).first().click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
    await page.getByRole("option", { name: "เมืองชลบุรี" }).click();
    await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await page.getByRole("textbox", { name: "คำอธิบายที่อยู่" }).click();
    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ใกล้ติดคาเฟ่หมาจัสมิน \n");

    const mapSearchBox = page.getByPlaceholder(
      /ป้อนชื่อวิสาหกิจชุมชน|ค้นหาสถานที่/
    );
    if (await mapSearchBox.isVisible()) {
      await mapSearchBox.fill("วงเวียนบางแสน");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(1000);
    }

    await page.getByLabel("ละติจูด *").fill("13.2838");
    await page.getByLabel("ลองจิจูด *").fill("100.9157");
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-1-Relax" }).click();
    await page.getByRole("option", { name: "Tag-3-Food" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });

   /**
   * TS-EHT-01.3
   * ปักหมุดหากไม่พบสถานที่
   */
  test("TS-EHT-01.3: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
    await goToEditHomestayDetailPage(page);

    await page.getByLabel("ละติจูด *").fill("13.2838");
    await page.getByLabel("ลองจิจูด *").fill("100.9157");
      await page.getByText('ปักหมุด', { exact: true }).click();
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });

  /**
   * TS-EHT-01.4
   * แก้ไขแท็ก
   */
  test("TS-EHT-01.4: แก้ไขแท็ก", async ({ page }) => {
    await goToEditHomestayDetailPage(page);
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.getByRole("option", { name: "Tag-1-Relax" }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });
   /**
   * TS-EHT-01.5
   * แก้ไขรูปภาพ
   */
  test("TS-EHT-01.5: แก้ไขรูปภาพ", async ({ page }) => {
    await goToEditHomestayDetailPage(page);
    const coverImage = 'assets/photo/cat.jpg'; 
    const galleryImages = [
        'assets/photo/cat.jpg', 
    ];

    // 1. แก้ไขรูปหน้าปก (Cover)
    // ฟังก์ชันนี้จะลบรูปเก่าออกก่อน แล้วอัปโหลดรูปใหม่เข้าไป
    await uploadHomestayCover(page, coverImage);
    
    // 2. แก้ไขรูปเพิ่มเติม (Gallery)
    // ฟังก์ชันนี้จะเพิ่มรูปเข้าไปใน Gallery
    await uploadHomestayGallery(page, galleryImages);

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  });
});
