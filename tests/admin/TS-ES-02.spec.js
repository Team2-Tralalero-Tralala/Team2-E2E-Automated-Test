import { expect, test } from "@playwright/test";
import path from "path";
import { loginAs } from "../../utils/roles.js";

async function getTagCombo(page) {
  return page.getByRole("combobox", {
    name: /ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา/,
  });
}

async function getTagFieldContainer(page) {
  const tagCombo = await getTagCombo(page);
  // ครอบทั้ง label + autocomplete + ส่วนแสดง tag ที่เลือก (div.mt-4)
  const byColSpan = tagCombo.locator(
    'xpath=ancestor::*[contains(@class,"col-span-2")][1]'
  );
  if (await byColSpan.count()) return byColSpan;

  // fallback: หา parent div ที่มีคำว่า "แท็ก" และมี div.mt-4 อยู่ภายใน
  return tagCombo.locator(
    'xpath=ancestor::div[.//label[contains(normalize-space(.),"แท็ก")] and .//div[contains(@class,"mt-4")]][1]'
  );
}

async function assertTagsOptionsPresent(page, tagNames) {
  const tagCombo = await getTagCombo(page);
  await tagCombo.click();
  await tagCombo.fill("Tag");

  for (const name of tagNames) {
    await expect(page.getByRole("option", { name })).toBeVisible({
      timeout: 15000,
    });
  }

  await page.keyboard.press("Escape");
  await tagCombo.fill("");
}

async function selectTag(page, tagName) {
  const tagCombo = await getTagCombo(page);
  await tagCombo.click();
  await tagCombo.fill(tagName);

  const opt = page.getByRole("option", { name: tagName });
  await expect(opt).toBeVisible({ timeout: 15000 });
  await opt.click();
  await page.keyboard.press("Escape");
  await tagCombo.fill("");

  const tagField = await getTagFieldContainer(page);
  const selectedArea = tagField.locator("div.mt-4");

  // ตรวจว่า "ยังไม่ได้เลือก" หายไป และ chip ของแท็กแสดงขึ้นจริง
  await expect(selectedArea.getByText("ยังไม่ได้เลือก")).not.toBeVisible({
    timeout: 15000,
  });
  await expect(selectedArea.getByText(tagName)).toBeVisible({ timeout: 15000 });
}

async function clickFirstVisible(locators) {
  for (const locator of locators) {
    try {
      if (await locator.first().isVisible({ timeout: 1500 })) {
        await locator.first().click();
        return;
      }
    } catch {
      // try next candidate
    }
  }
  throw new Error("No clickable locator matched");
}

async function goToAdminEditStoreFromCommunityPencil(page) {
  // 1) ไปที่ "จัดการชุมชน" จาก sidebar
  await clickFirstVisible([
    page.getByRole("link", { name: "จัดการชุมชน" }),
    page.getByRole("button", { name: "จัดการชุมชน" }),
  ]);
  await page.waitForLoadState("networkidle");

  // 2) เลือกเมนูย่อย "ร้านค้า" (อาจเป็น dropdown/accordion)
  await clickFirstVisible([
    page.getByRole("button", { name: /ร้านค้า.*จำนวน/ }),
    page.getByRole("button", { name: /ร้านค้า/ }),
    page.getByRole("link", { name: /ร้านค้า/ }),
  ]);

  // 3) กด "จัดการ"
  await clickFirstVisible([
    page.getByRole("button", { name: "จัดการ" }),
    page.getByRole("link", { name: "จัดการ" }),
  ]);

  // 4) กดไอคอน "ดินสอ"/แก้ไข (fallback หลายแบบ)
  // IMPORTANT: ห้ามใช้ button:has(svg) เพราะอาจไปคลิก "ออกจากระบบ" ได้
  // ให้เจาะจงไอคอนแก้ไขในตารางจัดการร้านค้าเท่านั้น
  const table = page.locator("table");
  await expect(table).toBeVisible({ timeout: 15000 });
  const pencilBtn = table
    .locator('button[aria-label="แก้ไข"],button[title="แก้ไข"]')
    .first();
  await expect(pencilBtn).toBeVisible({ timeout: 15000 });
  await pencilBtn.click();

  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: /แก้ไขร้านค้า/ })).toBeVisible({
    timeout: 15000,
  });
}

async function fillStoreComplete(page) {
  await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ป้านกน้อย");
  await page
    .getByRole("textbox", { name: "รายละเอียดร้านค้า *" })
    .fill("ป้านกน้อยขายส้มตำแซ่บ");
  await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("11");
  await page.getByRole("textbox", { name: "หมู่ที่" }).fill("6");

  await page.getByRole("combobox", { name: "จังหวัด *" }).click();
  await page.getByRole("option", { name: "ชลบุรี" }).click();

  await page.getByRole("combobox", { name: "อำเภอ / เขต *" }).click();
  await page.getByRole("option", { name: /เมือง/ }).click();

  await page.getByRole("combobox", { name: "ตำบล/แขวง *" }).click();
  await page.getByRole("option", { name: "แสนสุข" }).click();

  const postal = page.getByRole("textbox", { name: /รหัสไปรษณีย์/ });
  if (
    (await postal.isVisible().catch(() => false)) &&
    (await postal.isEditable().catch(() => false))
  ) {
    await postal.fill("20130");
  }

  await page
    .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
    .fill("บ้านเลขที่ 11 หมู่ 6");

  const placeSearch = page.locator(
    'input[placeholder*="ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียง"]'
  );
  if (await placeSearch.isVisible().catch(() => false)) {
    await placeSearch.fill("วงเวียนบางแสน");
    await page.waitForTimeout(1000);
  }

  await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("13.2838");
  await page.getByRole("spinbutton", { name: "ลองจิจูด *" }).fill("100.9157");

  const closeTagButtons = page.getByRole("button", { name: "✕" });
  const tagCount = await closeTagButtons.count();
  for (let i = 0; i < tagCount; i++) {
    await closeTagButtons.first().click();
  }

  // เพิ่มแท็ก (อิงจาก SuperAdmin test): คลิก combobox -> เลือก option -> Escape
  const tagCombo = page.getByRole("combobox", {
    name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา",
  });

  await tagCombo.click();
  await page.getByRole("option", { name: "Tag-1-Relax" }).click();
  await page.keyboard.press("Escape");

  await tagCombo.click();
  await page.getByRole("option", { name: "Tag-2-Culture" }).click();
  await page.keyboard.press("Escape");
}

async function fillStoreIncomplete(page) {
  await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ป้านกน้อย");
  await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");

  const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
  if (await district.isVisible().catch(() => false)) {
    await district.click();
    await district.fill("");
  }

  const addressDesc = page.getByRole("textbox", { name: "คำอธิบายที่อยู่" });
  if (await addressDesc.isVisible().catch(() => false)) {
    await addressDesc.fill("");
  }

  const closeTagButtons = page.getByRole("button", { name: "✕" });
  const tagCount = await closeTagButtons.count();
  for (let i = 0; i < tagCount; i++) {
    await closeTagButtons.first().click();
  }
}

async function uploadStoreImages(page) {
  const imagePath = path.join(process.cwd(), "assets/photo/profile.jpg");

  // copy from SuperAdmin (TS-EST-02): remove old images then upload
  const coverArea = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดภาพหน้าปก") })
    .last();

  const extraArea = page
    .locator("div")
    .filter({ has: page.getByText("อัพโหลดรูปภาพเพิ่มเติม") })
    .last();

  // ลบรูปภาพเดิมก่อนอัพโหลด
  // ลบรูปภาพหน้าปก
  const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
  if ((await coverDeleteBtn.count().catch(() => 0)) > 0) {
    await coverDeleteBtn.first().click();
  }

  // ลบรูปภาพเพิ่มเติม
  const extraDeleteBtns = extraArea.locator('button[title="ลบไฟล์"]');
  while ((await extraDeleteBtns.count().catch(() => 0)) > 0) {
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
}

async function saveAndConfirm(page) {
  await page.getByRole("button", { name: "บันทึก" }).click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible({ timeout: 15000 });
  await modal.getByRole("button", { name: "ยืนยัน" }).click();
}

async function pinMapWhenNoPlaceFound(page) {
  const searchInput = page.locator(
    'input[placeholder*="ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียง"]'
  );
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.click();
    await searchInput.fill("สถานที่ที่ไม่มีในระบบ");
    await page.waitForTimeout(1500);
  }

  const mapContainer = page.locator(".leaflet-container");
  await mapContainer.scrollIntoViewIfNeeded().catch(() => {});

  const mapRect = await mapContainer.boundingBox().catch(() => null);
  if (mapRect) {
    const centerX = mapRect.x + mapRect.width / 2;
    const centerY = mapRect.y + mapRect.height / 2;
    // Ensure the map receives focus + triggers movement
    await page.mouse.click(centerX, centerY);
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 100, centerY - 50);
    await page.mouse.up();
  }

  await page.getByText("ปักหมุด", { exact: true }).click();
  await expect(page.getByRole("spinbutton", { name: "ละติจูด *" })).not.toHaveValue(
    "13.2838"
  );
  await expect(page.getByRole("spinbutton", { name: "ลองจิจูด *" })).not.toHaveValue(
    "100.9157"
  );
}

test.describe('Admin - Edit Store (from "pencil" icon)', () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  test("TS-ES-02.1: กรอกข้อมูลที่ต้องการแก้ไขครบถ้วน", async ({ page }) => {
    await goToAdminEditStoreFromCommunityPencil(page);
    await fillStoreComplete(page);
    await saveAndConfirm(page);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/community\/stores/);

    await expect(
      page.getByRole("heading", { name: "จัดการร้านค้า", exact: true })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("ป้านกน้อย")).toBeVisible({ timeout: 15000 });
  });

  test("TS-ES-02.2: กรอกข้อมูลไม่ครบถ้วนหลายจุด", async ({ page }) => {
    await goToAdminEditStoreFromCommunityPencil(page);
    await fillStoreIncomplete(page);
    await saveAndConfirm(page);
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก")).toBeVisible({
      timeout: 15000,
    });
    await page.waitForTimeout(1000);
  });

  test("TS-ES-02.3: ปักหมุดหากไม่พบสถานที่", async ({ page }) => {
    await goToAdminEditStoreFromCommunityPencil(page);
    await pinMapWhenNoPlaceFound(page);
  });

  test("TS-ES-02.4: แก้ไขแท็ก", async ({ page }) => {
    await goToAdminEditStoreFromCommunityPencil(page);

    // copy behavior from SuperAdmin (TS-EST-02): click combobox -> click option -> Escape
    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole("option", { name: "Tag-1-Relax" })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("option", { name: "Tag-1-Relax" }).click();
    await page.keyboard.press("Escape");

    await page
      .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
      .click();
    await page.waitForTimeout(1000);
    await expect(page.getByRole("option", { name: "Tag-2-Culture" })).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("option", { name: "Tag-2-Culture" }).click();
    await page.keyboard.press("Escape");

    // verify chips show up in tag field
    const tagField = await getTagFieldContainer(page);
    const selectedArea = tagField.locator("div.mt-4");
    await expect(selectedArea.getByText("Tag-1-Relax")).toBeVisible({
      timeout: 15000,
    });
    await expect(selectedArea.getByText("Tag-2-Culture")).toBeVisible({
      timeout: 15000,
    });
    await saveAndConfirm(page);

    // อย่างน้อยต้องไม่ขึ้น validation error หลังยืนยัน
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toHaveCount(0, {
      timeout: 15000,
    });
  });

  test("TS-ES-02.5: แก้ไขรูปภาพ", async ({ page }) => {
    await goToAdminEditStoreFromCommunityPencil(page);
    await uploadStoreImages(page);
    await saveAndConfirm(page);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/admin\/community\/stores/);
  });
});

