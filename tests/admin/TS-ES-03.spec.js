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
  await clickFirstVisible([
    page.getByRole("link", { name: "จัดการชุมชน" }),
    page.getByRole("button", { name: "จัดการชุมชน" }),
  ]);
  await page.waitForLoadState("networkidle");

  await clickFirstVisible([
    page.getByRole("button", { name: /ร้านค้า.*จำนวน/ }),
    page.getByRole("button", { name: /ร้านค้า/ }),
    page.getByRole("link", { name: /ร้านค้า/ }),
  ]);

  await clickFirstVisible([
    page.getByRole("button", { name: "จัดการ" }),
    page.getByRole("link", { name: "จัดการ" }),
  ]);

  // IMPORTANT: ห้ามใช้ button:has(svg) เพราะอาจไปคลิก "ออกจากระบบ" ได้
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
}

async function fillStoreIncomplete(page) {
  await page.getByRole("textbox", { name: "ชื่อร้านค้า *" }).fill("ป้านกน้อย");
  await page.getByRole("textbox", { name: "รายละเอียดร้านค้า *" }).fill("");
}

async function selectTags(page) {
  // ลบแท็กเดิมก่อน (ถ้ามี)
  const closeTagButtons = page.getByRole("button", { name: "✕" });
  const tagCount = await closeTagButtons.count();
  for (let i = 0; i < tagCount; i++) {
    await closeTagButtons.first().click();
  }

  // copy behavior from SuperAdmin (TS-EST-02): click combobox -> click option -> Escape
  await page
    .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
    .click();
  await page.waitForTimeout(1000);
  await page.getByRole("option", { name: "Tag-1-Relax" }).click();
  await page.keyboard.press("Escape");

  await page
    .getByRole("combobox", { name: "ค้นหาแท็ก เช่น เดินป่า ทะเล ภูเขา" })
    .click();
  await page.waitForTimeout(1000);
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
}

async function uploadStoreImages(page) {
  // ใช้รูปตัวอย่างที่มีอยู่แทน
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
  const coverDeleteBtn = coverArea.locator('button[title="ลบไฟล์"]');
  if ((await coverDeleteBtn.count().catch(() => 0)) > 0) {
    await coverDeleteBtn.first().click();
  }

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

  // รอ UI อัพเดตนิดหน่อย
  await page.waitForTimeout(5000);
}

async function saveAndConfirm(page) {
  await page.getByRole("button", { name: "บันทึก" }).click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible({ timeout: 15000 });
  await modal.getByRole("button", { name: "ยืนยัน" }).click();
}

async function saveAndCancelInModal(page) {
  await page.getByRole("button", { name: "บันทึก" }).click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible({ timeout: 15000 });
  await modal.getByRole("button", { name: "ยกเลิก" }).click();
  await expect(modal).not.toBeVisible({ timeout: 15000 });
}

test.describe("Admin - Edit Store (save/cancel behaviors)", () => {
  // Don't use "serial" — it skips remaining tests after first failure
  test.describe.configure({ mode: "parallel" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
    await goToAdminEditStoreFromCommunityPencil(page);
  });

  test("TS-ES-03.1: Admin แก้ไขร้านค้าได้ เมื่อกรอกข้อมูลครบ", async ({
    page,
  }) => {
    await fillStoreComplete(page);
    await selectTags(page);
    await uploadStoreImages(page);
    await saveAndConfirm(page);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/admin\/community\/stores/);
    await expect(
      page.getByRole("heading", { name: "จัดการร้านค้า", exact: true })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("ป้านกน้อย")).toBeVisible({ timeout: 15000 });
  });

  test("TS-ES-03.2: Admin ไม่สามารถแก้ไขร้านค้าได้ เมื่อกรอกข้อมูลไม่ครบถ้วน", async ({
    page,
  }) => {
    await fillStoreIncomplete(page);
    await saveAndConfirm(page);
    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toBeVisible({
      timeout: 15000,
    });
    await page.waitForTimeout(1000);
  });

  test('TS-ES-03.3: คลิก "ยกเลิก" ในหน้าต่างแสดงผลซ้อน ระบบไม่บันทึกข้อมูล', async ({
    page,
  }) => {
    await fillStoreIncomplete(page);
    await saveAndCancelInModal(page);

    // ยังอยู่หน้าแก้ไขร้านค้า (ไม่ได้บันทึก/ไม่ได้เปลี่ยนหน้า)
    await expect(page.getByRole("heading", { name: /แก้ไขร้านค้า/ })).toBeVisible({
      timeout: 15000,
    });
    await page.waitForTimeout(1000);
  });

  test('TS-ES-03.4: คลิก "ยกเลิก" ในหน้าแก้ไขร้านค้า ระบบกลับไปหน้า "จัดการร้านค้า"', async ({
    page,
  }) => {
    await fillStoreComplete(page);

    // คลิกยกเลิกบนหน้า (ไม่ใช่ใน modal)
    const cancelBtn = page.getByRole("button", { name: "ยกเลิก" });
    await expect(cancelBtn).toBeVisible({ timeout: 15000 });
    await cancelBtn.click();

    // ต้องกดยืนยันในหน้าต่างแสดงผลซ้อนเพื่อยกเลิกการแก้ไข
    const modal = page.getByRole("dialog");
    if (await modal.isVisible().catch(() => false)) {
      await modal.getByRole("button", { name: "ยืนยัน" }).click();
    }

    await page.waitForTimeout(1000);

    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/admin\/community\/stores/);
    await expect(
      page.getByRole("heading", { name: "จัดการร้านค้า", exact: true })
    ).toBeVisible({ timeout: 15000 });
    
    // ควรออกจากหน้าแก้ไขร้านค้า (ขึ้นกับระบบว่าไปหน้าไหน แต่ไม่ควรยังเป็นฟอร์มแก้ไข)
    await expect(page.getByRole("heading", { name: /แก้ไขร้านค้า/ })).toHaveCount(
      0,
      { timeout: 15000 }
    );
    await page.waitForTimeout(1000);
  });
});

