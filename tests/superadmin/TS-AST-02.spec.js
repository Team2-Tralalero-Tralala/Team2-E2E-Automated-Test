import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToManageStorePage - นำผู้ใช้งานไปยังหน้า "จัดการร้านค้า"
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. ไปที่หน้า "รายละเอียดชุมชน"
 *   2. เปิด Dropdown เลือก "ร้านค้า"
 *   3. คลิกปุ่ม "จัดการ"
 * Output:
 *   - Browser ถูก navigate ไปยังหน้า /super/community/store
 */
async function goToManageStorePage(page) {
  const storeDropdown = page.getByRole("button", { name: "ร้านค้า" });
  await expect(storeDropdown).toBeVisible();
  await storeDropdown.click();

  const manageBtn = page.getByRole("button", { name: "จัดการ" });
  await expect(manageBtn).toBeEnabled();
  await manageBtn.click();

  await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);
}

/**
 * selectFromCombobox - ฟังก์ชันสำหรับเลือกค่าจาก Combobox แบบ Autocomplete (ไม่ใช่ <select>)
 * Input:
 *   - page  : Playwright Page object ใช้ควบคุม browser
 *   - label : string ชื่อ label ของ combobox (เช่น "จังหวัด *", "อำเภอ / เขต *")
 *   - value : string ค่าที่ต้องการเลือก (เช่น "ชลบุรี", "เมือง")
 * Action:
 *   1. หา combobox จาก role="combobox" ตาม label
 *   2. คลิกเพื่อเปิด dropdown
 *   3. พิมพ์ค่าเพื่อค้นหา option
 *   4. เลือก option ที่ตรงกับค่าที่พิมพ์
 * Output:
 *   - Combobox ถูกเลือกค่าเรียบร้อย และค่าถูกแสดงใน input
 */
async function selectFromCombobox(page, label, value) {
  const combobox = page.getByRole("combobox", { name: label });

  await expect(combobox).toBeVisible();
  await combobox.click();
  await combobox.fill(value);

  const option = page.getByRole("option", { name: new RegExp(value) }).first();
  await expect(option).toBeVisible();
  await option.click();

  await expect(combobox).toHaveValue(new RegExp(value));
}

/**
 * uploadStoreImages - อัพโหลดรูปปกร้านค้าและรูปเพิ่มเติม
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   1. อัพโหลดรูปปก
 *   2. อัพโหลดรูปเพิ่มเติม
 * Output:
 *   - รูปถูกแสดงใน UI
 */
async function uploadStoreImages(page) {
  const coverImagePath = path.resolve("assets/photo/IMG_1.jpg");
  const galleryImagePath = path.resolve("assets/photo/IMG_2.jpg");

  const coverSection = page
    .getByRole("heading", { name: "อัพโหลดภาพหน้าปก *" })
    .locator("..");
  const gallerySection = page
    .getByRole("heading", { name: "อัพโหลดรูปภาพเพิ่มเติม *" })
    .locator("..");

  const coverBtn = coverSection.getByRole("button", { name: "เพิ่มไฟล์" });
  const galleryBtn = gallerySection.getByRole("button", { name: "เพิ่มไฟล์" });

  await expect(coverBtn).toBeVisible();
  await expect(galleryBtn).toBeVisible();

  const [coverChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    coverBtn.click(),
  ]);
  await coverChooser.setFiles(coverImagePath);

  const [galleryChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    galleryBtn.click(),
  ]);
  await galleryChooser.setFiles(galleryImagePath);
}

/**
 * ฟังก์ชัน : addTags
 * คำอธิบาย :
 * ใช้สำหรับเพิ่มแท็กให้กับร้านค้าในหน้า "เพิ่มร้านค้า"
 * โดยค้นหาแท็กจาก combobox และเลือกผ่าน checkbox ใน listbox
 *
 * @param {Page} page - Playwright page object
 * @param {string[]} tags - รายชื่อแท็กที่ต้องการเพิ่ม (เช่น ["Relax", "Food", "Nature"])
 */
async function addTags(page, tags) {
  const tagCombobox = page.getByRole("combobox", { name: /ค้นหาแท็ก/i });
  await expect(tagCombobox).toBeVisible();

  const listbox = page.getByRole("listbox");

  for (const tag of tags) {
    await tagCombobox.click();
    await tagCombobox.fill(tag);

    await expect(listbox).toBeVisible();

    const option = listbox
      .getByRole("option", { name: new RegExp(`Tag-\\d+-${tag}`, "i") })
      .first();

    await option.getByRole("checkbox").check();

    await tagCombobox.fill("");
    await expect(listbox)
      .toBeHidden({ timeout: 2000 })
      .catch(() => {});
  }
}

test.describe("SuperAdmin - Add Store", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-AST-02.1
   * กรอกข้อมูลร้านค้าครบถ้วน และบันทึกสำเร็จ
   */
    test("TS-AST-02.1: SuperAdmin add store successfully", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);

      const links = page.getByRole("link", { name: "ป้านกน้อย" });
      await expect(links.first()).toBeVisible();
    });

  /**
   * TS-AST-02.2
   * กรอกข้อมูลร้านค้าไม่ครบถ้วนหลายจุด
   */
    test("TS-AST-02.2: SuperAdmin add store validation errors", async ({
      page,
    }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ป้านกน้อย");
      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");

      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);

      await expect(bangsaenResult).toBeVisible({ timeout: 3000 });

      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();
      const errorDialog = page.getByRole("dialog");

      await expect(errorDialog).toBeVisible();
      await errorDialog.getByRole("button", { name: "ปิด" }).click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await expect(
        page.getByText(/รายละเอียดร้านค้า.*(จำเป็น|กรุณา)/i)
      ).toBeVisible();
      await expect(page.getByText(/อำเภอ.*(จำเป็น|กรุณา)/i)).toBeVisible();
      await expect(page.getByText(/ตำบล\/แขวง.*(จำเป็น|กรุณา)/i)).toBeVisible();
      await expect(page.getByText(/รหัสไปรษณีย์.*(จำเป็น|กรุณา)/i)).toBeVisible();
      await expect(page.getByText("ยังไม่ได้เลือก")).toBeVisible();
      const coverSection = page
        .getByRole("heading", { name: /อัพโหลดภาพหน้าปก/i })
        .locator("..");
      await expect(coverSection.getByText("0 / 1")).toBeVisible();
      const gallerySection = page
        .getByRole("heading", { name: /อัพโหลดรูปภาพเพิ่มเติม/i })
        .locator("..");
      await expect(gallerySection.getByText("0 / 5")).toBeVisible();
    });

  /**
   * TS-AST-02.3
   * ปักหมุดหากไม่พบสถานที่
   */
    test("TS-AST-02.3: Pin marker when place search has no results", async ({
      page,
    }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");

      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("zzzz_not_found_place_12345");

      const map = page.locator(".leaflet-container").first();
      await expect(map).toBeVisible();

      //ปุ่มกดไม่ได้
      const markerBtn = page.getByRole("button", { name: /^Marker$/ });
      await expect(markerBtn).toBeEnabled();
      await markerBtn.click();

      const lat = page.getByRole("spinbutton", { name: /ละติจูด/i });
      const lng = page.getByRole("spinbutton", { name: /ลองจิจูด/i });
      const latBefore = await lat.inputValue();
      const lngBefore = await lng.inputValue();

      await map.click({ position: { x: 220, y: 140 } });

      await expect(lat).not.toHaveValue(latBefore);
      await expect(lng).not.toHaveValue(lngBefore);

      await expect(lat).toHaveValue(/^-?\d+(\.\d+)?$/);
      await expect(lng).toHaveValue(/^-?\d+(\.\d+)?$/);

      await addTags(page, ["Relax"]);

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);

      const links = page.getByRole("link", { name: "ป้านกน้อย" });
      await expect(links.first()).toBeVisible();
    });

  /**
   * TS-AST-02.4
   * เพิ่มแท็ก
   */
    test("TS-AST-02.4: Add tags", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");

      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");

      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");

      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");

      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);

      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });

      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax", "Food", "Nature"]);

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);

      const links = page.getByRole("link", { name: "ป้านกน้อย" });
      await expect(links.first()).toBeVisible();
    });

  /**
   * TS-AST-02.5
   * ไม่เพิ่มแท็ก
   */
    test("TS-AST-02.5: Tag validation errors", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");

      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");

      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");

      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");

      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);

      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });

      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      const errorDialog = page.getByRole("dialog");
      await expect(errorDialog).toBeVisible();
      await errorDialog.getByRole("button", { name: "ปิด" }).click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);
      await expect(page.getByText("ยังไม่ได้เลือก")).toBeVisible();
    });

  /**
   * TS-AST-02.6
   * อัพโหลดรูปภาพหน้าปก
   */
    test("TS-AST-02.6: Upload cover photo", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);

      const coverSection = page
        .getByRole("heading", { name: /อัพโหลดภาพหน้าปก/i })
        .locator("..");

      const coverUploadBtn = coverSection.getByRole("button", {
        name: "เพิ่มไฟล์",
      });
      await expect(coverUploadBtn).toBeVisible();

      const coverImagePath = path.resolve("assets/photo/IMG_1.jpg");
      const [chooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        coverUploadBtn.click(),
      ]);
      await chooser.setFiles(coverImagePath);

      await expect(
        coverSection.getByRole("img", { name: /ไฟล์ที่เลือก 1/i })
      ).toBeVisible();
      await expect(
        coverSection.getByRole("button", { name: /ลบไฟล์ลำดับที่ 1/i })
      ).toBeVisible();

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.waitForTimeout(5000);
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
      await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);
    });

  /**
   * TS-AST-02.7
   * ไม่อัพโหลดรูปภาพหน้าปก
   */
    test("TS-AST-02.7: not Upload cover photo", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.waitForTimeout(5000);
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);
    });

  /**
   * TS-AST-02.8
   * อัพโหลดรูปภาพเพิ่มเติม
   */
    test("TS-AST-02.8: Upload gallery photo", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);
      const gallerySection = page
        .getByRole("heading", { name: /อัพโหลดรูปภาพเพิ่มเติม/i })
        .locator("..");

      const galleryUploadBtn = gallerySection.getByRole("button", {
        name: "เพิ่มไฟล์",
      });
      await expect(galleryUploadBtn).toBeVisible();

      const img1 = path.resolve("assets/photo/IMG_1.jpg");
      const img2 = path.resolve("assets/photo/IMG_2.jpg");

      {
        const [chooser1] = await Promise.all([
          page.waitForEvent("filechooser"),
          galleryUploadBtn.click(),
        ]);
        await chooser1.setFiles(img1);
      }

      {
        const [chooser2] = await Promise.all([
          page.waitForEvent("filechooser"),
          galleryUploadBtn.click(),
        ]);
        await chooser2.setFiles(img2);
      }

      await expect(gallerySection.getByText(/2\s*\/\s*5/)).toBeVisible();
      await expect(
        gallerySection.getByRole("img", { name: /ไฟล์ที่เลือก 1/i })
      ).toBeVisible();
      await expect(
        gallerySection.getByRole("img", { name: /ไฟล์ที่เลือก 2/i })
      ).toBeVisible();

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.waitForTimeout(5000);
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
      await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);
    });

  /**
   * TS-AST-02.9
   * ไม่อัพโหลดรูปภาพเพิ่มเติม
   */
    test("TS-AST-02.9: not Upload gallery photo", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);
      const gallerySection = page
        .getByRole("heading", { name: /อัพโหลดรูปภาพเพิ่มเติม/i })
        .locator("..");

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.waitForTimeout(5000);
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);
    });

  /**
   * TS-AST-02.10
   * กรอกข้อมูลครบถ้วนและยืนยันการสร้างร้านค้า (แบบ Modal)
   */
    test("TS-AST-02.10: Modal add store successfully", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.waitForTimeout(5000);
      await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
    });

  /**
   * TS-AST-02.11
   * กรอกข้อมูลไม่ครบถ้วนและบันทึกการสร้างร้านค้า
   */
  test("TS-AST-02.11: Modal add store validation errors", async ({ page }) => {
    await page.getByRole("row").nth(1).getByRole("link").click();

    await goToManageStorePage(page);

    const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
    await expect(addStoreBtn).toBeEnabled();
    await addStoreBtn.click();

    await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);


    await page
      .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
      .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

    await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
    await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
    await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
    //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("บ้านเลขที่ 11 หมู่ 6");

    const searchLocationInput = page.getByPlaceholder(
      /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
    );

    await expect(searchLocationInput).toBeVisible();
    await searchLocationInput.fill("บางแสน");
    const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
    await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
    const firstPlace = page.getByRole("listitem").first();
    await expect(firstPlace).toBeVisible();
    await firstPlace.click();

    await addTags(page, ["Relax"]);

    await uploadStoreImages(page);

    const saveBtn = page.getByRole("button", { name: "บันทึก" });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยัน" })
      .click();

    await page.waitForTimeout(5000);
    await page.getByRole("dialog").getByRole("button", { name: "ปิด" }).click();
  });

  /**
   * TS-AST-02.12
   * ยกเลิกการสร้างร้านค้า (แบบ Modal)
   */
  test("TS-AST-02.12: Modal add store cancel", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "บันทึก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page.waitForTimeout(5000);
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยกเลิก" })
        .click();

      await page.waitForTimeout(5000);
      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);
    });

    /**
   * TS-AST-02.13
   * ยกเลิกการสร้างร้านค้า
   */
  test("TS-AST-02.13: Cancel modal add store", async ({ page }) => {
      await page.getByRole("row").nth(1).getByRole("link").click();

      await goToManageStorePage(page);

      const addStoreBtn = page.getByRole("button", { name: "เพิ่มร้านค้า" });
      await expect(addStoreBtn).toBeEnabled();
      await addStoreBtn.click();

      await expect(page).toHaveURL(/\/super\/community\/\d+\/store\/create/);

      await page
        .getByRole("textbox", { name: "ชื่อร้านค้า *" })
        .fill("ป้านกน้อย");

      await page
        .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
        .fill("ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ");

      await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
      await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");
      await selectFromCombobox(page, "จังหวัด *", "ชลบุรี");
      await selectFromCombobox(page, "อำเภอ / เขต *", "เมือง");
      await selectFromCombobox(page, "ตำบล/แขวง *", "แสนสุข");
      //await page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" }).fill("20130");
      await page
        .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
        .fill("บ้านเลขที่ 11 หมู่ 6");

      const searchLocationInput = page.getByPlaceholder(
        /ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด/i
      );

      await expect(searchLocationInput).toBeVisible();
      await searchLocationInput.fill("บางแสน");
      const bangsaenResult = page.getByText(/บางแสน,.*ชลบุรี/i);
      await expect(bangsaenResult).toBeVisible({ timeout: 5000 });
      const firstPlace = page.getByRole("listitem").first();
      await expect(firstPlace).toBeVisible();
      await firstPlace.click();

      await addTags(page, ["Relax"]);

      await uploadStoreImages(page);

      const saveBtn = page.getByRole("button", { name: "ยกเลิก" });
      await expect(saveBtn).toBeEnabled();
      await saveBtn.click();

      await page.waitForTimeout(5000);
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "ยืนยัน" })
        .click();

      await page.waitForTimeout(5000);
      await expect(page).toHaveURL(/\/super\/community\/\d+\/stores\/all/);
    });
});
