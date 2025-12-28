import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageEditCommunityDetail - ฟังก์ชันนำผู้ใช้งานไปยังหน้าแก้ไขรายละเอียดวิสาหกิจชุมชน
 * Input: 
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - target: 
 *    1. String = ค้นหาตามชื่อชุมชน
 *    2. Number = ค้นหาตามลำดับแถว (เริ่มนับที่ 1, เช่น 8 คือแถวที่ 8)
 *    3. Null/Undefined = เลือกแถวแรกเสมอ
 * Action: 
 *   1. เลือกเมนู "จัดการชุมชน" 
 *   2. คลิกชื่อชุนชมที่ต้องการแก้ไข 
 *   3. คลิกปุ่ม "แก้ไข" 
 *   4. รอหน้าเปลี่ยน URL แก้ไขรายละเอียดวิสาหกิจชุมชน
 * Output:
 *   - ไม่มี return value, แต่ browser จะถูก navigate ไปยัง URL /super/community/:communityId/edit
 */
async function goToPageEditCommunityDetail(page, target = null) {
  const manageCommunity = page.getByRole("link", { name: "จัดการชุมชน" });
  await expect(manageCommunity).toBeVisible();
  await manageCommunity.click();

  await expect(page.locator("tbody tr").first()).toBeVisible();

  let targetRow;

  // เลือกแถว (ตามชื่อ หรือ ตามลำดับ)
  if (typeof target === 'string') {
    targetRow = page.getByRole("row", { name: new RegExp(target) });
  } else if (typeof target === 'number') {
    // ลบ 1 เพราะ index เริ่มที่ 0 (ส่งมา 9 คือ index 8)
    targetRow = page.locator("tbody tr").nth(target - 1);
  } else {
    targetRow = page.locator("tbody tr").first();
  }
  await targetRow.getByRole('link').first().click();

  // เช็คว่าเข้ามาหน้า Detail แล้ว
  await expect(page).toHaveURL(/super\/community\/\d+$/);

  const editBtn = page.getByRole("button", { name: /แก้ไข/ });
  await expect(editBtn).toBeEnabled();
  await editBtn.click();

  // เช็คว่าเข้าหน้า Edit แล้ว
  await expect(page).toHaveURL(/super\/community\/\d+\/edit/);
}

/**
 * saveAndCheckResult - ฟังก์ชันสำหรับกดบันทึกและตรวจสอบผลลัพธ์ตามกรณีที่กำหนด (สำเร็จ/ไม่สำเร็จ/ยกเลิก)
 * Input:
 * - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * - type: string ประเภทของผลลัพธ์ที่คาดหวัง ('success' | 'error' | 'cancel_confirm') ค่าเริ่มต้นคือ 'success'
 * Action:
 * 1. คลิกปุ่ม "บันทึก" เพื่อเริ่มกระบวนการ submit form
 * 2. รอจนกว่า Dialog "ยืนยันการแก้ไขข้อมูล" จะแสดงขึ้นมา
 * 3. กรณี type = 'cancel_confirm': จะคลิกปุ่ม "ยกเลิก" ใน Dialog และจบการทำงาน (ไม่บันทึกจริง)
 * 4. กรณีอื่น: จะคลิกปุ่ม "ยืนยัน" ใน Dialog เพื่อส่งข้อมูล
 * 5. ตรวจสอบผลลัพธ์หลังกดยืนยันตาม type ที่ระบุ:
 * - 'success': รอ Dialog สำเร็จ, กดปุ่ม "ปิด", และตรวจสอบว่า URL ถูก Redirect กลับไปยังหน้ารายการชุมชน
 * - 'error': รอ Dialog แจ้งเตือนข้อผิดพลาด, กดปุ่ม "ปิด", และตรวจสอบว่า URL ยังคงอยู่ที่หน้าแก้ไขเดิม
 * Output:
 * - ไม่มี return value แต่จะทำการ Assert UI และ URL ตาม Flow ที่กำหนด
 */
async function saveAndCheckResult(page, type = 'success') {

  await page.getByRole("button", { name: "บันทึก" }).click();

  // Dialog ยืนยันการแก้ไข
  const confirmDialog = page.getByRole("dialog").filter({ hasText: "ยืนยันการแก้ไขข้อมูล" });
  await expect(confirmDialog).toBeVisible();

  if (type === 'cancel_confirm') {
    // กรณีเทสกดปุ่ม "ยกเลิก" ใน Modal ยืนยัน
    await confirmDialog.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(confirmDialog).toBeHidden();
    return; // จบการทำงาน
  }

  // กดปุ่มยืนยัน
  await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();
  await expect(confirmDialog).toBeHidden();

  // ตรวจสอบผลลัพธ์ (Success หรือ Error)
  if (type === 'success') {
    const successDialog = page.getByRole("dialog").filter({ hasText: "แก้ไขวิสาหกิจชุมชนสำเร็จ" });
    await expect(successDialog).toBeVisible({ timeout: 10000 });
    await successDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(successDialog).toBeHidden();
    await expect(page).toHaveURL(/super\/communities(\/all)?/);

  } else if (type === 'error') {
    const errorDialog = page.getByRole("dialog").filter({ hasText: /ข้อมูลไม่ถูกต้อง|เกิดข้อผิดพลาด/ });
    await expect(errorDialog).toBeVisible();
    await errorDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(errorDialog).toBeHidden();
    await expect(page).toHaveURL(/super\/community\/\d+\/edit/);
  }
}

/**
 * openAccordion - ฟังก์ชันสำหรับเปิด Accordion ตามหัวข้อที่กำหนด
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - title: string ชื่อหัวข้อของ Accordion ที่ต้องการเปิด
 * Action:
 *   1. ค้นหาปุ่ม Accordion จาก role "button" โดยใช้ชื่อหัวข้อ
 *   2. ตรวจสอบว่าปุ่ม Accordion มองเห็นได้บนหน้าจอ
 *   3. ตรวจสอบค่า aria-expanded เพื่อดูสถานะการเปิด/ปิด
 *   4. หาก Accordion ยังไม่ถูกเปิด (aria-expanded = "false") จะทำการคลิกเพื่อเปิด
 *   5. ตรวจสอบว่า Accordion ถูกเปิดแล้ว (aria-expanded = "true")
 *   6. กรณีไม่พบ aria-expanded จะทำการคลิกปุ่มโดยตรง
 * Output:
 *   - ไม่มี return value แต่ Accordion ที่ระบุจะอยู่ในสถานะเปิด
 */
async function openAccordion(page, title) {
  const header = page.getByRole("button", { name: title });
  await expect(header).toBeVisible();

  const expanded = await header.getAttribute("aria-expanded");

  if (expanded !== null) {
    if (expanded === "false") await header.click();
    await expect(header).toHaveAttribute("aria-expanded", "true");
  } else {
    await header.click();
  }
}

/**
 * uploadCover - ฟังก์ชันสำหรับอัปโหลดรูปหน้าปก (Cover Image)
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - fileRelativePath: string path ของไฟล์รูป (relative path จาก root project)
 * Action:
 *   1. แปลง relative path ของไฟล์รูปเป็น absolute path
 *   2. ค้นหา input ประเภท file ตัวแรกบนหน้า
 *   3. อัปโหลดไฟล์รูปเข้าไปใน input
 *   4. ตรวจสอบว่ามี dialog สำหรับครอปรูปแสดงขึ้นมาหรือไม่
 *   5. หากพบ dialog และปุ่ม "ใช้รูปที่ครอป" แสดงอยู่ จะทำการคลิกปุ่มดังกล่าว
 *   6. รอจน dialog ถูกปิดลง
 * Output:
 *   - ไม่มี return value แต่รูปหน้าปกจะถูกอัปโหลดและยืนยันเรียบร้อย
 */
export async function uploadCover(page, fileRelativePath) {
  const filePath = path.join(process.cwd(), fileRelativePath);

  const fileInput = page.locator('input[type="file"]').nth(0);
  await fileInput.setInputFiles(filePath);

  const dialog = page.getByRole("dialog");

  if (await dialog.isVisible({ timeout: 2000 })) {
    const useCropBtn = dialog.getByRole("button", { name: "ใช้รูปที่ครอป" });

    if (await useCropBtn.isVisible()) {
      await useCropBtn.click();
    }

    await expect(dialog).toBeHidden();
  }
}

/**
 * uploadProfile - ฟังก์ชันสำหรับอัปโหลดรูปโปรไฟล์ (Profile Image)
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - fileRelativePath: string path ของไฟล์รูป (relative path จาก root project)
 * Action:
 *   1. แปลง relative path ของไฟล์รูปเป็น absolute path
 *   2. ค้นหา input ประเภท file สำหรับรูปโปรไฟล์ (ลำดับที่ 2)
 *   3. อัปโหลดไฟล์รูปเข้าไปใน input
 *   4. ตรวจสอบว่ามี dialog สำหรับครอปรูปแสดงขึ้นมาหรือไม่
 *   5. หากพบ dialog และปุ่ม "ใช้รูปที่ครอป" แสดงอยู่ จะทำการคลิกปุ่มดังกล่าว
 *   6. รอจน dialog ถูกปิดลง
 * Output:
 *   - ไม่มี return value แต่รูปโปรไฟล์จะถูกอัปโหลดและยืนยันเรียบร้อย
 */
export async function uploadProfile(page, fileRelativePath) {
  const filePath = path.join(process.cwd(), fileRelativePath);

  // input file ของโปรไฟล์ (ปรับ nth ตามโครงสร้างจริง)
  const fileInput = page.locator('input[type="file"]').nth(1);
  await fileInput.setInputFiles(filePath);

  const dialog = page.getByRole("dialog");

  if (await dialog.isVisible({ timeout: 2000 })) {
    const useCropBtn = dialog.getByRole("button", {
      name: "ใช้รูปที่ครอป",
    });

    if (await useCropBtn.isVisible()) {
      await useCropBtn.click();
    }

    await expect(dialog).toBeHidden();
  }
}

/**
 * setRegisteredDateBE - ฟังก์ชันสำหรับกรอกวันที่จดทะเบียนวิสาหกิจชุมชน (รูปแบบ พ.ศ.)
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - ddmmyyyyBE: string วันที่ในรูปแบบ DDMMYYYY (พ.ศ.)
 * Action:
 *   1. แยกค่าวัน (DD), เดือน (MM) และปี (YYYY) จาก string ที่รับเข้ามา
 *   2. ค้นหาแถวของฟิลด์วันที่จากข้อความ label "วัน/เดือน/ปี (พ.ศ.) ที่จดทะเบียนวิสาหกิจชุมชน *"
 *   3. เข้าถึง group ของ input วันที่ที่มีชื่อ "Thai BE date input"
 *   4. ตรวจสอบว่า group ของ input วันที่แสดงอยู่บนหน้าจอ
 *   5. กรอกค่าวัน เดือน และปี ลงใน textbox ตามลำดับ (วว / ดด / ปปปป)
 * Output:
 *   - ไม่มี return value แต่ฟิลด์วันที่จดทะเบียนจะถูกกรอกค่าตามที่กำหนด
 */
async function setRegisteredDateBE(page, ddmmyyyyBE) {
  const day = ddmmyyyyBE.slice(0, 2);
  const month = ddmmyyyyBE.slice(2, 4);
  const year = ddmmyyyyBE.slice(4, 8);

  // หาแถวที่มี label ของฟิลด์วันที่
  const row = page
    .getByText("วัน/เดือน/ปี (พ.ศ.) ที่จดทะเบียนวิสาหกิจชุมชน *")
    .locator("..");

  // ในแถวนั้น จะมี group ชื่อ "Thai BE date input"
  const group = row.getByRole("group", { name: "Thai BE date input" });
  await expect(group).toBeVisible();

  await group.getByRole("textbox", { name: "วว" }).fill(day);
  await group.getByRole("textbox", { name: "ดด" }).fill(month);
  await group.getByRole("textbox", { name: "ปปปป" }).fill(year);
}

/**
 * selectBank - ฟังก์ชันสำหรับเลือกชื่อธนาคารจาก combobox
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - bankName: string ชื่อธนาคารที่ต้องการเลือก
 * Action:
 *   1. ค้นหา combobox ของฟิลด์ "ชื่อธนาคาร *"
 *   2. ตรวจสอบว่า combobox แสดงอยู่บนหน้าจอ
 *   3. คลิกเพื่อเปิดรายการตัวเลือก
 *   4. ค้นหาตัวเลือกจาก role "option" ตามชื่อธนาคารที่ระบุ
 *   5. หากพบ option จะทำการคลิกเลือกโดยตรง
 *   6. กรณีไม่พบ option จะ fallback ไปคลิกจาก text ที่ตรงกับชื่อธนาคาร
 * Output:
 *   - ไม่มี return value แต่ชื่อธนาคารที่เลือกจะถูกตั้งค่าใน combobox
 */
async function selectBank(page, bankName) {
  const bankCombo = page.getByRole("combobox", { name: "ชื่อธนาคาร *" });
  await expect(bankCombo).toBeVisible();
  await bankCombo.click();

  // เลือกตัวเลือก
  const option = page.getByRole("option", { name: bankName });
  if (await option.count()) {
    await option.click();
  } else {
    await page.getByText(bankName, { exact: true }).click();
  }
}

/**
 * uploadExtraImages - ฟังก์ชันสำหรับอัปโหลดรูปภาพเพิ่มเติมหลายไฟล์
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - filesRelativePaths: array ของ string path ไฟล์รูป (relative path จาก root project)
 * Action:
 *   1. แปลง relative path ของไฟล์รูปทั้งหมดเป็น absolute path
 *   2. ค้นหา section ของหัวข้อ "อัพโหลดรูปภาพเพิ่มเติม *"
 *   3. เข้าถึง input ประเภท file ภายใน section และตรวจสอบว่ามีเพียง 1 input
 *   4. นับจำนวนปุ่ม "ลบไฟล์ลำดับที่ X" ก่อนการอัปโหลด เพื่อใช้เป็นค่าอ้างอิง
 *   5. อัปโหลดไฟล์ทีละไฟล์ เพื่อรองรับ UI ที่ไม่รองรับ multiple upload หรือมีขั้นตอนเพิ่มช่องอัปโหลด
 *   6. คำนวณจำนวนปุ่มลบที่คาดหวังหลังอัปโหลดเสร็จ
 *   7. รอจนจำนวนปุ่มลบเพิ่มขึ้นครบตามจำนวนไฟล์ที่อัปโหลด
 * Output:
 *   - ไม่มี return value แต่รูปภาพเพิ่มเติมทั้งหมดจะถูกอัปโหลดเรียบร้อย
 */
async function uploadExtraImages(page, filesRelativePaths) {
  const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));

  const section = page
    .getByRole("heading", { name: "อัพโหลดรูปภาพเพิ่มเติม *" })
    .locator("..");

  const input = section.locator('input[type="file"]');
  await expect(input).toHaveCount(1);

  // ใช้จำนวนปุ่ม "ลบไฟล์ลำดับที่ X" เป็นตัววัดว่ารูปถูกเพิ่มแล้ว
  const removeBtns = section.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });
  const before = await removeBtns.count();

  // อัปโหลดทีละไฟล์ (กัน UI ที่ไม่ได้รองรับ multiple หรือมี flow เพิ่ม slot)
  for (const filePath of files) {
    await input.setInputFiles(filePath);
  }

  const expected = before + files.length;

  // รอจนปุ่มลบเพิ่มขึ้นครบตามจำนวนไฟล์ที่อัป
  await expect(removeBtns).toHaveCount(expected, { timeout: 60000 });
}

/**
 * uploadExtraVideos - ฟังก์ชันสำหรับอัปโหลดวิดีโอเพิ่มเติมหลายไฟล์
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - filesRelativePaths: array ของ string path ไฟล์วิดีโอ (relative path จาก root project)
 * Action:
 *   1. แปลง relative path ของไฟล์วิดีโอทั้งหมดเป็น absolute path
 *   2. ค้นหา section ของหัวข้อ "อัพโหลดวิดีโอเพิ่มเติม *"
 *   3. เข้าถึง input ประเภท file ภายใน section และตรวจสอบว่ามีเพียง 1 input
 *   4. นับจำนวนปุ่ม "ลบไฟล์ลำดับที่ X" ก่อนการอัปโหลด เพื่อใช้เป็นค่าอ้างอิง
 *   5. อัปโหลดวิดีโอทีละไฟล์ เพื่อรองรับ UI ที่ไม่รองรับ multiple upload
 *   6. คำนวณจำนวนปุ่มลบที่คาดหวังหลังอัปโหลดเสร็จ
 *   7. รอจนจำนวนปุ่มลบเพิ่มขึ้นครบตามจำนวนไฟล์ที่อัปโหลด
 * Output:
 *   - ไม่มี return value แต่วิดีโอเพิ่มเติมทั้งหมดจะถูกอัปโหลดเรียบร้อย
 */
async function uploadExtraVideos(page, filesRelativePaths) {
  const files = filesRelativePaths.map((p) => path.join(process.cwd(), p));

  const section = page
    .getByRole("heading", { name: "อัพโหลดวิดีโอเพิ่มเติม *" })
    .locator("..");

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
 * pickComboboxOption - ฟังก์ชันสำหรับเลือกค่าจาก combobox โดยใช้ข้อความตัวเลือก
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 *   - label: string ชื่อ label ของ combobox ที่ต้องการเลือกค่า
 *   - optionText: string ข้อความของตัวเลือกที่ต้องการเลือก
 * Action:
 *   1. ค้นหา combobox จาก role "combobox" โดยอ้างอิงชื่อ label
 *   2. คลิกเพื่อเปิด dropdown ของ combobox
 *   3. พิมพ์ข้อความตัวเลือกลงใน combobox เพื่อช่วยค้นหา (ใช้ fill เพื่อความเสถียร)
 *   4. ค้นหาตัวเลือกจาก role "option" ตามข้อความที่ระบุ
 *   5. หากพบ option จะทำการคลิกเลือกและจบการทำงานของฟังก์ชัน
 *   6. กรณีไม่พบ role "option" จะ fallback ไปคลิกจาก text ที่ตรงกับข้อความตัวเลือก
 * Output:
 *   - ไม่มี return value แต่ค่าที่เลือกจะถูกตั้งค่าใน combobox ตามที่ระบุ
 */
async function pickComboboxOption(page, label, optionText) {
  const combo = page.getByRole("combobox", { name: label });

  await combo.click();
  // พิมพ์เพื่อค้นหา 
  await combo.fill(optionText);
  // เลือกจากรายการ 
  const opt = page.getByRole("option", { name: optionText }).first();
  if (await opt.count()) {
    await opt.click();
    return;
  }

  await page.getByText(optionText, { exact: true }).click();
}

/**
 * clickMapAndWaitLatLng - ฟังก์ชันสำหรับคลิกแผนที่และรอให้ค่าพิกัดละติจูด/ลองจิจูดเปลี่ยน
 * Input:
 *   - page: object ของ Playwright Page ใช้สำหรับควบคุม browser
 * Action:
 *   1. ค้นหา container ของแผนที่ (Leaflet) จาก class ".leaflet-container"
 *   2. ตรวจสอบว่าแผนที่แสดงอยู่บนหน้าจอ
 *   3. เข้าถึง input ของละติจูด และลองจิจูด เพื่อใช้เก็บค่าก่อนการคลิก
 *   4. อ่านค่าละติจูด และลองจิจูดก่อนการคลิกแผนที่
 *   5. คำนวณตำแหน่งกึ่งกลางของแผนที่ และคลิกตำแหน่งที่ปลอดภัย (หลีกเลี่ยงปุ่มซูม +/-)
 *   6. รอจนค่าละติจูดเปลี่ยนจากค่าเดิม
 *   7. รอจนค่าลองจิจูดเปลี่ยนจากค่าเดิม
 * Output:
 *   - ไม่มี return value แต่ค่าพิกัดละติจูดและลองจิจูดจะถูกอัปเดตจากการคลิกแผนที่
 */
async function clickMapAndWaitLatLng(page) {
  // จับ container ของแผนที่ (Leaflet จะมี .leaflet-container)
  const map = page.locator(".leaflet-container").first();
  await expect(map).toBeVisible();

  // เก็บค่าก่อนคลิก
  const latInput = page.getByRole("spinbutton", { name: "ละติจูด *" });
  const lngInput = page.getByRole("spinbutton", { name: "ลองจิจูด *" });

  const beforeLat = await latInput.inputValue();
  const beforeLng = await lngInput.inputValue();

  // คลิกกลางแผนที่ (เลี่ยงกดไปโดนปุ่ม +/-)
  const box = await map.boundingBox();
  if (!box) throw new Error("Map bounding box not found");
  await page.mouse.click(box.x + box.width * 0.6, box.y + box.height * 0.5);

  // รอให้ค่าเปลี่ยน (หรือจะรอให้ไม่เท่าเดิม)
  await expect(latInput).not.toHaveValue(beforeLat, { timeout: 15000 });
  await expect(lngInput).not.toHaveValue(beforeLng, { timeout: 15000 });
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


// เซตค่าเริ่มต้นหลังจากล็อกอิน เข้ามาให้อยู่หน้า /super/communities
test.describe("SuperAdmin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-ECMNT-01.1
   * แก้ไขและกรอกข้อมูลครบถ้วน (ข้อมูลชุมชน)
   */
  test("TS-ECMNT-01.1: แก้ไขและกรอกข้อมูลครบถ้วน (ข้อมูลชุมชน)", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    await uploadCover(page, "assets/photo/communityCover.jpg");
    await uploadProfile(page, "assets/photo/communityProfile.jpg");

    // ชื่อวิสาหกิจชุมชน * 
    await page.getByLabel("ชื่อวิสาหกิจชุมชน *").fill("ชุมชนบ่าววี กรุงธนคอมเพล็กซ์");

    // ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)
    await page
      .getByLabel("ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)")
      .fill("ชชทน")

    // ประเภทวิสาหกิจชุมชน * 
    await page
      .getByLabel("ประเภทวิสาหกิจชุมชน *")
      .fill("ทำอาหาร")

    //เลขทะเบียนวิสาหกิจชุมชน *
    await page
      .getByLabel("เลขทะเบียนวิสาหกิจชุมชน *")
      .fill("FUNNY-14-D4C")

    // วัน/เดือน/ปี (พ.ศ.) ที่จดทะเบียนวิสาหกิจชุมชน *
    await setRegisteredDateBE(page, "12092549"); // 12 / 09 / 2549

    // ชื่อธนาคาร *
    await selectBank(page, "ธนาคารกสิกรไทย");

    // ชื่อบัญชีธนาคาร *
    await page
      .getByLabel("ชื่อบัญชีธนาคาร *")
      .fill("นกน้อย นานาชนิด")

    // หมายเลขบัญชี *
    await page
      .getByLabel("หมายเลขบัญชี *")
      .fill("1110111111")

    // ประวัติวิสาหกิจชุมชน *
    await page
      .getByLabel("ประวัติวิสาหกิจชุมชน *")
      .fill("นกน้อยน่ารักมาชมเล่นได้จ๊ะ")

    // ชื่อกิจกรรมหลัก *
    await page
      .getByLabel("ชื่อกิจกรรมหลัก *")
      .fill("ดูนก")

    // รายละเอียดกิจกรรมหลัก *
    await page
      .getByLabel("รายละเอียดกิจกรรมหลัก *")
      .fill("ดูนกบนต้นไม้")

    await saveAndCheckResult(page, 'success');
  });

  /**
  * TS-ECMNT-01.2
  * ไม่กรอกชื่อวิสาหกิจ
  */
  test("TS-ECMNT-01.2: ไม่กรอกชื่อวิสาหกิจ", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );

    await openAccordion(page, "ข้อมูลชุมชน");

    const nameInput = page.getByLabel("ชื่อวิสาหกิจชุมชน *");
    await nameInput.click();
    await nameInput.press("Control+A");
    await nameInput.press("Delete");

    await saveAndCheckResult(page, 'error')
  });

  /**
     * TS-ECMNT-01.3
     * ไม่กรอกเลขทะเบียน
     */
  test("TS-ECMNT-01.3: ไม่กรอกเลขทะเบียน", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );

    await openAccordion(page, "ข้อมูลชุมชน");

    const nameInput = page.getByLabel("เลขทะเบียนวิสาหกิจชุมชน *");
    await nameInput.click();
    await nameInput.press("Control+A");
    await nameInput.press("Delete");

    await saveAndCheckResult(page, 'error')
  });

  /**
  * TS-ECMNT-01.4
  * กรอกเลขทะเบียนเป็นตัวอักษร
  */
  test("TS-ECMNT-01.4: กรอกเลขทะเบียนเป็นตัวอักษร", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );

    await openAccordion(page, "ข้อมูลชุมชน");

    await page
      .getByLabel("เลขทะเบียนวิสาหกิจชุมชน *")
      .fill("TEST-NUM-COM")
    await saveAndCheckResult(page, 'success')
  });

  /**
   * TS-ECMNT-01.5
   * กรอกชื่อย่อซ้ำกับชุมชนอื่น
   */
  test("TS-ECMNT-01.5: กรอกชื่อย่อซ้ำกับชุมชนอื่น", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );

    await openAccordion(page, "ข้อมูลชุมชน");

    await page
      .getByLabel("ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)")
      .fill("ชชทน")
    await saveAndCheckResult(page, 'success')
  });

  /**
  * TS-ECMNT-01.6
  * อัพโหลดโลโก้หรือภาพหน้าปกไฟล์ถูกต้อง
  */
  test("TS-ECMNT-01.6: อัพโหลดโลโก้หรือภาพหน้าปกไฟล์ถูกต้อง", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );

    await openAccordion(page, "ข้อมูลชุมชน");

    await uploadCover(page, "assets/photo/communityCover.jpg");
    await uploadProfile(page, "assets/photo/communityProfile.jpg");
    await saveAndCheckResult(page, 'success')

  });

  /**
  * TS-ECMNT-01.8
  * อัพโหลดไฟล์ที่ไม่ใช่ (JPG/PNG)
  */
  test("TS-ECMNT-01.8: อัพโหลดไฟล์ที่ไม่ใช่ (JPG/PNG)", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    const fileInput = page.locator('input[type="file"]').first();

    await fileInput.setInputFiles("assets/photo/vdo1.mp4");

    // Browser ต้องปฏิเสธไฟล์นี้ ทำให้ใน input ไม่มีไฟล์ค้างอยู่
    const filesCount = await fileInput.evaluate(el => el.files?.length ?? 0);
    expect(filesCount).toBe(0);
  });

  /**
  * TS-ECMNT-01.9
  * ไม่อัพโหลดโลโก้
  */
  test("TS-ECMNT-01.9: ไม่อัพโหลดโลโก้", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    // กันกรณีที่ระบบฉลาดจัดๆ ถ้าไม่แก้อะไรเลย มันจะไม่ส่ง Request อะไรเลย
    // await page.getByLabel("ชื่อวิสาหกิจชุมชน *").fill(`เทสไม่แก้รูป ${Date.now()}`);

    let uploadCalled = false;

    // เริ่มดัก
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("upload") // เช็คว่ายิงไป path upload ไหม
      ) {
        uploadCalled = true;
      }
    });

    await saveAndCheckResult(page, 'success');
    // ต้องไม่มีการเรียก upload
    expect(uploadCalled).toBe(false);
  });
  /**
   * TS-ECMNT-01.10
   * กรอกข้อมูลบัญชีธนาคารครบ
   */
  test("TS-ECMNT-01.10: กรอกข้อมูลบัญชีธนาคารครบ", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    await selectBank(page, "ธนาคารทหารไทย");

    await page
      .getByLabel("ชื่อบัญชีธนาคาร *")
      .fill("แพนด้า แพนเค้ก");

    await page
      .getByLabel("หมายเลขบัญชี *")
      .fill("5518040895");

    await saveAndCheckResult(page, 'success')
  });

  /**
  * TS-ECMNT-01.11
  * ไม่กรอกเลขบัญชี
  */
  test("TS-ECMNT-01.11: ไม่กรอกเลขบัญชี", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    const numBankInput = page.getByLabel("หมายเลขบัญชี *");
    await numBankInput.click();
    await numBankInput.press("Control+A");
    await numBankInput.press("Delete");

    await saveAndCheckResult(page, 'error')

  });

  /**
  * TS-ECMNT-01.12
  * กรอกเลขบัญชีเป็นตัวอักษร
  */
  test("TS-ECMNT-01.12: กรอกเลขบัญชีเป็นตัวอักษร", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );

    await openAccordion(page, "ข้อมูลชุมชน");
    await page.getByLabel("หมายเลขบัญชี *").fill("111-0-1กห11-ก")

    await saveAndCheckResult(page, 'error')
  });

  /**
  * TS-ECMNT-01.13
  * กรอกชื่อกิจกรรมหลัก
  */
  test("TS-ECMNT-01.13: กรอกชื่อกิจกรรมหลัก", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );
    await openAccordion(page, "ข้อมูลชุมชน");
    await page.getByLabel("ชื่อกิจกรรมหลัก *").fill("ท่องเที่ยวเชิงเกษตร");

    await saveAndCheckResult(page, 'success')
  });

  /**
  * TS-ECMNT-01.14
  * ไม่กรอกชื่อกิจกรรมหลัก
  */
  test("TS-ECMNT-01.14: ไม่กรอกชื่อกิจกรรมหลัก", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    const nameAcvInput = page.getByLabel("ชื่อกิจกรรมหลัก *");
    await nameAcvInput.click();
    await nameAcvInput.press("Control+A");
    await nameAcvInput.press("Delete");
    await saveAndCheckResult(page, 'error')
  });

  /**
    * TS-ECMNT-01.15
    * อัพโหลดรูปภาพเพิ่มเติม
    */
  test("TS-ECMNT-01.15: อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    await uploadExtraImages(page, [
      "assets/photo/pic1.jpg",
      "assets/photo/pic2.jpg",
      "assets/photo/pic3.jpg",
    ]);
    await saveAndCheckResult(page, 'success')

  });

  /**
  * TS-ECMNT-01.16
  * อัพโหลดวิดีโอเพิ่มเติม
  */
  test("TS-ECMNT-01.16: อัพโหลดวิดีโอเพิ่มเติม", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน");

    await uploadExtraVideos(page, [
      "assets/photo/vdo1.mp4",
      "assets/photo/vdo2.mp4",
    ]);

    await saveAndCheckResult(page, 'success')

  });

  /**
  * TS-ECMNT-01.17
  * ไม่อัพโหลดรูปภาพเพิ่มเติม
  */
  test("TS-ECMNT-01.17: ไม่อัพโหลดรูปภาพเพิ่มเติม", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );

    await openAccordion(page, "ข้อมูลชุมชน")

    const imgSection = page
      .getByRole("heading", { name: "อัพโหลดรูปภาพเพิ่มเติม *" })
      .locator("..");

    const delBtns = imgSection.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });
    const n = await delBtns.count();

    for (let i = 0; i < n; i++) {
      await delBtns.first().click();
    }

    await saveAndCheckResult(page, 'error')
  });

  /**
  * TS-ECMNT-01.18
  * ไม่อัพโหลดวิดีโอเพิ่มเติม
  */
  test("TS-ECMNT-01.18: ไม่อัพโหลดวิดีโอเพิ่มเติม", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลชุมชน")

    const videoSection = page
      .getByRole("heading", { name: "อัพโหลดวิดีโอเพิ่มเติม *" })
      .locator("..");

    const delBtns = videoSection.getByRole("button", { name: /ลบไฟล์ลำดับที่/ });
    const n = await delBtns.count();

    for (let i = 0; i < n; i++) {
      await delBtns.first().click(); // ลบตัวแรกไปเรื่อย ๆ จนหมด
    }

    await saveAndCheckResult(page, 'error')
  });

  /**
  * TS-ECMNT-01.19
  * กรอกข้อมูลครบถ้วน (ข้อมูลที่อยู่ชุมชน)
  */
  test("TS-ECMNT-01.19: กรอกข้อมูลครบถ้วน (ข้อมูลที่อยู่ชุมชน)", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ที่อยู่วิสาหกิจชุมชน");


    await page.getByLabel("บ้านเลขที่ *").fill("11");
    await page.getByLabel("หมู่ที่").fill("6");

    await pickComboboxOption(page, "จังหวัด *", "ชลบุรี");
    await pickComboboxOption(page, "อำเภอ / เขต *", "เมืองชลบุรี");
    await pickComboboxOption(page, "ตำบล/แขวง *", "แสนสุข");

    await page.getByLabel("ละติจูด *").fill("13.2838");
    await page.getByLabel("ลองจิจูด *").fill("100.9157");

    await saveAndCheckResult(page, 'success')
  });

  /**
  * TS-ECMNT-01.20
  * กรอกข้อมูลไม่ครบถ้วนหลายจุด
  */
  test("TS-ECMNT-01.20: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ที่อยู่วิสาหกิจชุมชน");


    await page.getByLabel("บ้านเลขที่ *").fill("11");

    await pickComboboxOption(page, "จังหวัด *", "นนทบุรี");


    await saveAndCheckResult(page, 'error')

  });

  /**
   * TS-ECMNT-01.21
   * ปักหมุดวิสาหกิจชุมชน
   */
  test("TS-ECMNT-01.21: ปักหมุดวิสาหกิจชุมชน", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ที่อยู่วิสาหกิจชุมชน");

    await panMapViaJS(page);

    const pinBtn = page.getByText("ปักหมุด", { exact: true });
    if (await pinBtn.isVisible()) {
      await pinBtn.click();
    }
    await saveAndCheckResult(page, 'success');
  });

  /**
  * TS-ECMNT-01.22
  * ปักหมุดแบบใส่ ละติจูด ลองจิจูด
  */
  test("TS-ECMNT-01.22: ปักหมุดแบบใส่ ละติจูด ลองจิจูด", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );

    await openAccordion(page, "ที่อยู่วิสาหกิจชุมชน");

    await page.getByLabel("ละติจูด *").fill("13.2838");
    await page.getByLabel("ลองจิจูด *").fill("100.9157");
    await saveAndCheckResult(page, 'success')
  });

  /**
   * TS-ECMNT-01.23
   * กรอกข้อมูลครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)
   */
  test("TS-ECMNT-01.23: กรอกข้อมูลครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลติดต่อและผู้ดูแล")

    await page.getByLabel("โทรศัพท์วิสาหกิจชุมชน *").fill("0981234567");
    await page.getByLabel("อีเมลวิสาหกิจชุมชน *").fill("ssks11@gmail.com");
    await page.getByLabel("ชื่อผู้ดูแลหลัก *").fill("ยศยิ่ง นาคุ");
    await page.getByLabel("โทรศัพท์ *").fill("0822349876");
    await page.getByLabel("ชื่อผู้ประสานงาน").fill("นาริ วารุ");
    await page.locator("#coordinatorPhone").fill("0935649876");

    await pickComboboxOption(page, "ผู้ดูแล *", "คริสติน่า2 แซ่แต้");

    const memberCombo = page.getByRole("combobox", { name: "ค้นหาสมาชิก" });
    await memberCombo.scrollIntoViewIfNeeded();
    await memberCombo.click();
    await memberCombo.fill("จินตนา");

    await memberCombo.press("Enter");

    const row = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(row).toBeVisible();
    await row.click();

    // ปิด dropdown ก่อน
    await page.keyboard.press("Escape");

    // assert ว่าถูกเพิ่มแล้ว (ดูที่สรุปด้านล่าง/รายการสมาชิก)
    await expect(page.getByText(/จำนวนสมาชิก\s+\d+\s+คน/)).toBeVisible();
    await expect(page.getByText("จินตนา จิรายุ")).toBeVisible();

    await saveAndCheckResult(page, 'success')

  });

  /**
  * TS-ECMNT-01.24
  * กรอกข้อมูลไม่ครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)
  */
  test("TS-ECMNT-01.24: กรอกข้อมูลไม่ครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลติดต่อและผู้ดูแล")

    const phoneInput = page.getByLabel("โทรศัพท์วิสาหกิจชุมชน *");
    await phoneInput.click();
    await phoneInput.press("Control+A");
    await phoneInput.press("Delete");
    await page.getByLabel("อีเมลวิสาหกิจชุมชน *").fill("ssks11@gmail.com");

    await saveAndCheckResult(page, 'error')
  });

  /**
  * TS-ECMNT-01.25
  * กดยกเลิกที่ Modal ยืนยันการแก้ไขชุมชน
  */
  test("TS-ECMNT-01.25: กดยกเลิกที่ Modal ยืนยันการแก้ไขชุมชน", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลติดต่อและผู้ดูแล")

    await page.getByLabel("โทรศัพท์วิสาหกิจชุมชน *").fill("0981234568");
    await saveAndCheckResult(page, 'cancel_confirm')
  });

  /**
  * TS-ECMNT-01.26
  * กดยกเลิกฟอร์มแก้ไขชุมชน
  */
  test("TS-ECMNT-01.26: กดยกเลิกฟอร์มแก้ไขชุมชน", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      9
    );
    await openAccordion(page, "ข้อมูลติดต่อและผู้ดูแล")

    await page.getByLabel("โทรศัพท์วิสาหกิจชุมชน *").fill("0981234568");

    await page.getByRole("button", { name: "ยกเลิก" }).click();

    const confirmDialog = page.getByRole("dialog").filter({
      hasText: "ยืนยันการยกเลิก",
    });

    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(confirmDialog).toBeHidden();

    await expect(page).toHaveURL(/super\/community\/\d+/);
  });

  /**
  * TS-ECMNT-01.27
  * แก้ไขผู้ดูแลชุมชน
  */
  test("TS-ECMNT-01.27: แก้ไขผู้ดูแลชุมชน", async ({ page }) => {
    await goToPageEditCommunityDetail(
      page,
      8
    );
    await openAccordion(page, "ข้อมูลติดต่อและผู้ดูแล")

    await pickComboboxOption(page, "ผู้ดูแล *", "อดัม วอง");


    await saveAndCheckResult(page, 'success')
  });

  /**
   * TS-ECMNT-01.28
   * เปิดชุมชน
   */
  test("TS-ECMNT-01.28: เปิดชุมชน", async ({ page }) => {
    await goToPageEditCommunityDetail(page, 10); 
    
    const statusSwitch = page.getByRole("switch");
    
    // ถ้ายังไม่เปิด(unchecked) ให้กดเพื่อเปิด
    // ถ้าเปิดอยู่แล้ว ก็ไม่ต้องกด
    if (await statusSwitch.isChecked() === false) {
       await statusSwitch.click();
    }

    await saveAndCheckResult(page, 'success');

    // กลับไปหน้า List เพื่อเช็ค Text ในตาราง
    await page.goto('/super/communities/all');

    // ตรวจสอบแถวที่ 10 (Index 9)
    const row = page.locator("tbody tr").nth(9);
    await expect(row).toContainText("เปิด");
  });

  /**
   * TS-ECMNT-01.29
   * ปิดชุมชน
   */
  test("TS-ECMNT-01.29: ปิดชุมชน", async ({ page }) => {
    await goToPageEditCommunityDetail(page, 10); 
    
    const statusSwitch = page.getByRole("switch");
    
    // ถ้ายังเปิดอยู่ (checked) -> ให้กดเพื่อปิด
    if (await statusSwitch.isChecked() === true) {
       await statusSwitch.click();
    }

    await saveAndCheckResult(page, 'success');

    // กลับไปหน้า List เพื่อเช็ค Text ในตาราง
    await page.goto('/super/communities/all');

    // ตรวจสอบแถวที่ 10 (Index 9)
    const row = page.locator("tbody tr").nth(9);
    await expect(row).toContainText("ปิด");
  });

});

