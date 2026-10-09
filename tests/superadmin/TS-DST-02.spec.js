import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToEditAccommodationPage - ฟังก์ชันนำผู้ใช้งานไปยังหน้าการแก้ไขที่พัก
 * Input:
 *   - page: object ของ Playwright Page
 * Action:
 *   1. เข้าเมนู "จัดการชุมชน"
 *   2. เลือกชุมชนตัวแรก
 *   3. คลิก "ที่พัก" > "จัดการ" > เลือกที่พักตัวแรก > "แก้ไข"
 */
async function goToEditAccommodationPage(page) {
  await page.getByRole("link", { name: "จัดการชุมชน" }).click();
  await page.getByRole("row").nth(1).getByRole("cell").nth(1).click();

  const accommodationText = page.getByText("ที่พัก", { exact: true });
  await page.mouse.wheel(0, 3000);
  await expect(accommodationText).toBeVisible();
  await accommodationText.click();

  await page.getByRole("button", { name: "จัดการ" }).click();
  await page
    .getByRole("row")
    .nth(1)
    .getByRole("cell")
    .nth(1)
    .getByRole("link")
    .click();
  await page.getByRole("link", { name: "แก้ไข" }).click();
}

test.describe("SuperAdmin - Manage Accommodation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-DST-02.1
   * กรอกข้อมูลครบถ้วน
   */
  test("TS-DST-02.1: fill accommodation form completely", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const nameInput = page.getByLabel("ชื่อที่พัก").first();
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.fill("บางแสนริมเล");
    await nameInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));

    await page.getByLabel("ประเภทที่พัก").fill("โฮมสเตย์");
    await page.getByLabel("สิ่งอำนวยความสะดวก").fill("แอร์, Wifi, เครื่องทำน้ำอุ่น");
    await page.getByLabel("จำนวนห้องทั้งหมด").fill("2");
    await page.getByLabel("จำนวนผู้เข้าพักต่อห้อง").fill("2");

    await page.getByLabel("บ้านเลขที่").fill("231");
    await page.getByLabel("หมู่ที่").fill("6");
    await page.getByLabel("จังหวัด").click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByLabel("อำเภอ / เขต").click();
    await page.getByRole("option", { name: /เมือง/ }).click();
    await page.getByLabel("ตำบล/แขวง").click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await expect(page.getByLabel("รหัสไปรษณีย์")).not.toHaveValue("");
    await page.getByLabel("คำอธิบายที่อยู่").fill("บ้านเลขที่ 231 หมู่ 6");

    const tagDropdown = page.getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" });
    await tagDropdown.click();
    await page.getByRole("checkbox").first().check();
    await page.locator("body").click({ position: { x: 0, y: 0 } });

    const deleteCoverBtn = page.locator("button[aria-label^='ลบไฟล์ลำดับที่ 1']").first();
    if (await deleteCoverBtn.count() > 0) await deleteCoverBtn.click();

    const coverInput = page.locator("input[id^='upload-input']").first();
    await coverInput.setInputFiles("assets/photo/IMG_123.png");
    await page.locator("span[id^='upload-counter']").first().waitFor({ state: "visible" });

    const galleryFiles = ["assets/photo/IMG_124.png", "assets/photo/IMG_125.png"];
    for (const file of galleryFiles) {
      const addBtn = page.locator("button[id^='add-btn']").last();
      await addBtn.click();
      const input = addBtn.locator("input[type='file']");
      await input.setInputFiles(file);
      await addBtn.locator("span[id^='upload-counter']").waitFor({ state: "visible" });
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    const confirmBtn = page.locator("button.swal2-confirm", { hasText: "ยืนยัน" });
    await confirmBtn.waitFor({ state: "visible" });
    await confirmBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/homestay\/all/);
  });

  /**
   * TS-DST-02.2
   * ลบข้อมูลทั้งหมดในฟอร์มแล้วบันทึก, ตรวจสอบ validation messages
   */
  test("TS-DST-02.2: clear accommodation form and check validation", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    await page.getByLabel("ชื่อที่พัก").first().fill("");
    await page.getByLabel("ประเภทที่พัก").fill("");
    await page.getByLabel("สิ่งอำนวยความสะดวก").fill("");
    await page.getByLabel("จำนวนห้องทั้งหมด").fill("");
    await page.getByLabel("จำนวนผู้เข้าพักต่อห้อง").fill("");

    await page.getByLabel("บ้านเลขที่").fill("231");
    await page.getByLabel("หมู่ที่").fill("6");
    await page.getByLabel("จังหวัด").click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByLabel("อำเภอ / เขต").click();
    await page.getByRole("option", { name: /เมือง/ }).click();
    await page.getByLabel("ตำบล/แขวง").click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await expect(page.getByLabel("รหัสไปรษณีย์")).not.toHaveValue("");
    await page.getByLabel("คำอธิบายที่อยู่").fill("บ้านเลขที่ 231 หมู่ 6");

    const checkedTags = page.locator("input[type='checkbox']:checked");
    const countChecked = await checkedTags.count();
    for (let i = 0; i < countChecked; i++) await checkedTags.nth(i).uncheck();

    const deleteCoverBtn = page.locator("button[aria-label^='ลบไฟล์ลำดับที่ 1']").first();
    if (await deleteCoverBtn.count() > 0) await deleteCoverBtn.click();

    const galleryDeleteBtns = page.locator("button[aria-label^='ลบไฟล์ลำดับที่']");
    while (await galleryDeleteBtns.count() > 0) await galleryDeleteBtns.first().click();

    await page.getByRole("button", { name: "บันทึก" }).click();

    await expect(page.getByText(/กรุณากรอก.*ชื่อที่พัก/)).toBeVisible();
    await expect(page.getByText(/กรุณากรอก.*ประเภทที่พัก/)).toBeVisible();
    await expect(page.getByText(/กรุณากรอก.*สิ่งอำนวยความสะดวก/)).toBeVisible();
    await expect(page.getByText(/กรุณากรอก.*จำนวนห้องทั้งหมด/)).toBeVisible();
    await expect(page.getByText(/กรุณากรอก.*จำนวนผู้เข้าพักต่อห้อง/)).toBeVisible();
    await expect(page.getByText(/กรุณากรอก.*เพิ่มรูปภาพหน้าปก/)).toBeVisible();
    await expect(page.getByText(/กรุณากรอก.*เพิ่มรูปภาพเพิ่มเติม/)).toBeVisible();
  });

  /**
   * TS-DST-02.3
   * เพิ่มแท็ก "Relax" ให้ที่พัก
   */
  test("TS-DST-02.3: add 'Relax' tag", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const tagDropdown = page.getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" });
    await tagDropdown.click();
    await page.getByRole("checkbox").first().check();
    await page.locator("body").click({ position: { x: 0, y: 0 } });

    await page.getByRole("button", { name: "บันทึก" }).click();
    const confirmBtn = page.locator("button.swal2-confirm", { hasText: "ยืนยัน" });
    await confirmBtn.waitFor({ state: "visible" });
    await confirmBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/homestay\/all/);
  });

  /**
   * TS-DST-02.4
   * ลบทุกแท็กที่มีอยู่
   */
  test("TS-DST-02.4: remove all existing tags", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const removeTagButtons = page.locator('button.ml-2.text-gray-500.hover\\:text-red-500');
    const count = await removeTagButtons.count();
    for (let i = 0; i < count; i++) await removeTagButtons.first().click();

    await page.getByRole("button", { name: "บันทึก" }).click();
    await expect(page.getByText(/กรุณาเลือก.*แท็ก/)).toBeVisible();
  });

  /**
   * TS-DST-02.5
   * อัปโหลดรูปภาพหน้าปก
   */
  test("TS-DST-02.5: upload cover image", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const deleteCoverBtn = page.locator("button[aria-label^='ลบไฟล์ลำดับที่ 1']").first();
    if (await deleteCoverBtn.count() > 0) await deleteCoverBtn.click();

    const coverInput = page.locator("input[id^='upload-input']").first();
    await coverInput.setInputFiles("assets/photo/IMG_123.png");
    await page.locator("span[id^='upload-counter']").first().waitFor({ state: "visible" });

    await page.getByRole("button", { name: "บันทึก" }).click();
    const confirmBtn = page.locator("button.swal2-confirm", { hasText: "ยืนยัน" });
    await confirmBtn.waitFor({ state: "visible" });
    await confirmBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/homestay\/all/);  });

  /**
   * TS-DST-02.6
   * ลบภาพหน้าปกแล้วตรวจสอบ validation
   */
  test("TS-DST-02.6: remove cover image and check validation", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const deleteCoverBtn = page.locator("button[aria-label^='ลบไฟล์ลำดับที่ 1']").first();
    if (await deleteCoverBtn.count() > 0) await deleteCoverBtn.click();

    await page.getByRole("button", { name: "บันทึก" }).click();
    await expect(page.getByText(/กรุณาเพิ่ม.*ภาพหน้าปก/)).toBeVisible();
  });

  /**
   * TS-DST-02.7
   * อัปโหลดรูปภาพเพิ่มเติม
   */
  test("TS-DST-02.7: upload additional images with max 3 existing", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const galleryDeleteBtns = page.locator("button[aria-label^='ลบไฟล์ลำดับที่']");
    const count = await galleryDeleteBtns.count();
    for (let i = count - 1; i >= 3; i--) await galleryDeleteBtns.nth(i).click();

    const galleryFiles = ["assets/photo/IMG_124.png", "assets/photo/IMG_125.png"];
    for (const file of galleryFiles) {
      const addBtn = page.locator("button[id^='add-btn']").last();
      await addBtn.click();
      const input = addBtn.locator("input[type='file']");
      await input.setInputFiles(file);
      await addBtn.locator("span[id^='upload-counter']").waitFor({ state: "visible" });
    }

    await page.getByRole("button", { name: "บันทึก" }).click();
    const confirmBtn = page.locator("button.swal2-confirm", { hasText: "ยืนยัน" });
    await confirmBtn.waitFor({ state: "visible" });
    await confirmBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/homestay\/all/);
  });

  /**
   * TS-DST-02.8
   * ลบรูปเพิ่มเติมทั้งหมดแล้วตรวจสอบ validation
   */
  test("TS-DST-02.8: remove existing gallery images and check validation", async ({ page }) => {
    await goToEditAccommodationPage(page);
    await page.waitForLoadState("networkidle");

    const galleryDeleteBtns = page.locator("button[aria-label^='ลบไฟล์ลำดับที่']");
    while (await galleryDeleteBtns.count() > 0) await galleryDeleteBtns.first().click();

    await page.getByRole("button", { name: "บันทึก" }).click();
    await expect(page.getByText(/กรุณาเพิ่ม.*รูปภาพเพิ่มเติม/)).toBeVisible();
  });

  /**
   * TS-DST-02.9
   * ยกเลิกการแก้ไขผ่าน modal
   */
  test("TS-DST-02.9: cancel editing via modal", async ({ page }) => {
    await page.goto("http://dekdee2.informatics.buu.ac.th:4080/super/community/1/homestay/1/edit");
    await page.waitForLoadState("networkidle");

    const nameInput = page.getByLabel("ชื่อที่พัก").first();
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.fill("บางแสนริมเล");
    await nameInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));

    await page.getByLabel("ประเภทที่พัก").fill("โฮมสเตย์");
    await page.getByLabel("สิ่งอำนวยความสะดวก").fill("แอร์, Wifi, เครื่องทำน้ำอุ่น");
    await page.getByLabel("จำนวนห้องทั้งหมด").fill("2");
    await page.getByLabel("จำนวนผู้เข้าพักต่อห้อง").fill("2");

    await page.getByLabel("บ้านเลขที่").fill("231");
    await page.getByLabel("หมู่ที่").fill("6");
    await page.getByLabel("จังหวัด").click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByLabel("อำเภอ / เขต").click();
    await page.getByRole("option", { name: /เมือง/ }).click();
    await page.getByLabel("ตำบล/แขวง").click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await page.getByLabel("คำอธิบายที่อยู่").fill("บ้านเลขที่ 231 หมู่ 6");

    await page.getByRole("button", { name: "บันทึก" }).click();
    const cancelModalBtn = page.getByRole("button", { name: "ยกเลิก" });
    await cancelModalBtn.waitFor({ state: "visible" });
    await cancelModalBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/homestay\/\d+\/edit/);
  });

  /**
   * TS-DST-02.10
   * ยกเลิกการแก้ไขก่อนบันทึก
   */
  test("TS-DST-02.10: cancel editing before save", async ({ page }) => {
    await goToEditAccommodationPage(page);

    await page.waitForLoadState("networkidle");

    const nameInput = page.getByLabel("ชื่อที่พัก").first();
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.fill("บางแสนริมเล");
    await nameInput.evaluate(el => el.dispatchEvent(new Event('input', { bubbles: true })));

    await page.getByLabel("ประเภทที่พัก").fill("โฮมสเตย์");
    await page.getByLabel("สิ่งอำนวยความสะดวก").fill("แอร์, Wifi, เครื่องทำน้ำอุ่น");
    await page.getByLabel("จำนวนห้องทั้งหมด").fill("2");
    await page.getByLabel("จำนวนผู้เข้าพักต่อห้อง").fill("2");

    await page.getByLabel("บ้านเลขที่").fill("231");
    await page.getByLabel("หมู่ที่").fill("6");
    await page.getByLabel("จังหวัด").click();
    await page.getByRole("option", { name: "ชลบุรี" }).click();
    await page.getByLabel("อำเภอ / เขต").click();
    await page.getByRole("option", { name: /เมือง/ }).click();
    await page.getByLabel("ตำบล/แขวง").click();
    await page.getByRole("option", { name: "แสนสุข" }).click();
    await page.getByLabel("คำอธิบายที่อยู่").fill("บ้านเลขที่ 231 หมู่ 6");

    const cancelBtn = page.getByRole("button", { name: "ยกเลิก" });
    await cancelBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/homestay\/all/);
  });
});