import { expect, test } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

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

/**
 * goToBackupPage - นำทางไปยังหน้า "สำรองข้อมูล" (Backup)
 * Steps:
 * 1) เข้าเมนู "การตั้งค่า"
 * 2) คลิกไอคอน/เมนู "การสำรองข้อมูล"
 * 3) ตรวจสอบว่ามาถึงหน้า "สำรองข้อมูล"
 */
async function goToBackupPage(page) {
  // ไปหน้า settings ผ่าน sidebar (ใช้หลาย selector เผื่อ UI ต่างกัน)
  await clickFirstVisible([
    page.getByRole("link", { name: /การตั้งค่า|ตั้งค่า/ }),
    page.getByRole("button", { name: /การตั้งค่า|ตั้งค่า/ }),
    page.locator('[aria-label*="การตั้งค่า"],[title*="การตั้งค่า"]'),
  ]);

  await page.waitForLoadState("networkidle");

  // คลิกเมนู/ไอคอน "การสำรองข้อมูล"
  await clickFirstVisible([
    page.getByRole("link", { name: /การสำรองข้อมูล|สำรองข้อมูล/i }),
    page.getByRole("button", { name: /การสำรองข้อมูล|สำรองข้อมูล/i }),
    page.locator('[aria-label*="สำรองข้อมูล"],[title*="สำรองข้อมูล"]'),
  ]);

  await page.waitForLoadState("networkidle");
  // หลีกเลี่ยง strict mode violation: ใช้ heading ที่ตรงชื่อหน้าโดยตรง
  await expect(
    page.getByRole("heading", { name: "สำรองข้อมูล", exact: true })
  ).toBeVisible({ timeout: 15000 });
}

async function getFirstBackupRow(page) {
  // ตารางมีแถว placeholder ว่าง ๆ ให้เลือกเฉพาะแถวที่มีชื่อไฟล์ (ปุ่มดาวน์โหลด)
  const rows = page.locator("table tbody tr").filter({
    has: page.locator('button[title*="ดาวน์โหลดไฟล์สำรองข้อมูล"]'),
  });
  await expect(rows.first()).toBeVisible({ timeout: 15000 });
  return rows.first();
}

async function getBackupNameFromRow(row) {
  // โครงสร้างจริง: td[0]=checkbox, td[1]=ชื่อไฟล์ (มี button + div แสดงชื่อไฟล์)
  const nameCell = row.locator("td").nth(1);
  const nameFromButton = nameCell.locator("button").locator("div").first();
  const text = (
    await nameFromButton.innerText().catch(async () => await nameCell.innerText())
  ).trim();
  if (!text) throw new Error("Cannot read backup filename from first row");
  return text;
}

async function getSearchInput(page) {
  const candidates = [
    page.getByRole("textbox", { name: /ค้นหา|Search/i }),
    page.locator('input[placeholder*="ค้นหา"]'),
    page.locator('input[placeholder*="Search"]'),
    page.locator('input[type="search"]'),
  ];

  for (const c of candidates) {
    try {
      if (await c.first().isVisible({ timeout: 1500 })) return c.first();
    } catch {
      // try next
    }
  }
  throw new Error("Search input not found on backup page");
}

async function getDeleteButtonFromRow(row) {
  const candidates = [
    row.getByRole("button", { name: /ถังขยะ|ลบ|delete|trash/i }),
    row.locator('button[aria-label*="ลบ"],button[aria-label*="delete"],button[aria-label*="trash"]'),
    row.locator('button[title*="ลบ"],button[title*="delete"],button[title*="trash"]'),
  ];

  for (const c of candidates) {
    try {
      if (await c.first().isVisible({ timeout: 1500 })) return c.first();
    } catch {
      // try next
    }
  }
  throw new Error("Delete (trash) button not found in first row");
}

async function getDownloadButtonFromRow(row) {
  const candidates = [
    // UI ปัจจุบัน: คลิกชื่อไฟล์เพื่อดาวน์โหลด
    row.locator('button[title*="ดาวน์โหลดไฟล์สำรองข้อมูล"]'),
    row.getByRole("button", { name: /ไฟล์|ดาวน์โหลด|download|file/i }),
    row.locator('button[aria-label*="ดาวน์โหลด"],button[aria-label*="download"],button[aria-label*="file"]'),
    row.locator('button[title*="ดาวน์โหลด"],button[title*="download"],button[title*="file"]'),
  ];

  for (const c of candidates) {
    try {
      if (await c.first().isVisible({ timeout: 1500 })) return c.first();
    } catch {
      // try next
    }
  }
  throw new Error("Download (file) button not found in first row");
}

test.describe("SuperAdmin - Backup File", () => {
  // ชุดนี้แตะข้อมูลจริง (ลบไฟล์) เลยทำให้รันแบบลำดับ เพื่อไม่ชนกันเอง
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
    await goToBackupPage(page);
  });

  /**
   * TS-BUARC-01.1: ค้นหา Backup File
   * Expected: ตารางแสดง Backup File ที่ถูกค้นหา
   */
  test("TS-BUARC-01.1: ค้นหา Backup File", async ({ page }) => {
    const row = await getFirstBackupRow(page);
    const backupName = await getBackupNameFromRow(row);

    const searchInput = await getSearchInput(page);
    await searchInput.click();
    await searchInput.fill(backupName);
    await page.keyboard.press("Enter");

    await expect(page.getByRole("cell", { name: backupName })).toBeVisible({
      timeout: 15000,
    });
  });

  /**
   * TS-BUARC-02.1: คลิกไอคอนถังขยะ ต้องโชว์ Modal
   * Expected: หน้าต่างแสดงผลซ้อน (Modal) แสดงถูกต้อง
   */
  test('TS-BUARC-02.1: คลิกไอคอน "ถังขยะ" ต้องโชว์ Modal', async ({
    page,
  }) => {
    const row = await getFirstBackupRow(page);
    const deleteBtn = await getDeleteButtonFromRow(row);
    await deleteBtn.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 15000 });
    await expect(modal.getByRole("button", { name: "ยืนยัน" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "ยกเลิก" })).toBeVisible();

    // ปิด modal เพื่อไม่ให้กระทบ test อื่น
    await modal.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(modal).not.toBeVisible({ timeout: 15000 });
  });

  /**
   * TS-BUARC-02.3: คลิก "ยกเลิก" ใน Modal -> Backup File ไม่ถูกลบ
   * Expected: Backup File ยังอยู่ในตารางเหมือนเดิม
   */
  test('TS-BUARC-02.3: คลิก "ยกเลิก" แล้ว Backup File ต้องไม่ถูกลบ', async ({
    page,
  }) => {
    const row = await getFirstBackupRow(page);
    const backupName = await getBackupNameFromRow(row);

    const deleteBtn = await getDeleteButtonFromRow(row);
    await deleteBtn.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 15000 });
    await modal.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(modal).not.toBeVisible({ timeout: 15000 });

    await expect(page.getByRole("cell", { name: backupName })).toBeVisible({
      timeout: 15000,
    });
  });

  /**
   * TS-BUARC-03.1: ดาวน์โหลด Backup File
   * Expected: Backup File ถูกดาวน์โหลด
   */
  test('TS-BUARC-03.1: คลิกไอคอน "ไฟล์" ดาวน์โหลด Backup File', async ({
    page,
  }) => {
    const row = await getFirstBackupRow(page);
    const downloadBtn = await getDownloadButtonFromRow(row);

    // บาง UI อาจมี modal ยืนยันก่อนดาวน์โหลด
    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });
    await downloadBtn.click();

    const modal = page.getByRole("dialog");
    if (await modal.isVisible().catch(() => false)) {
      const confirm = modal.getByRole("button", { name: "ยืนยัน" });
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
      }
    }

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  /**
   * TS-BUARC-02.2: คลิก "ยืนยัน" ใน Modal -> Backup File ถูกลบ
   * Expected: Backup File ถูกลบออกจริงและไม่ปรากฏอีกในตาราง
   */
  test('TS-BUARC-02.2: คลิก "ยืนยัน" แล้ว Backup File ต้องถูกลบ', async ({
    page,
  }) => {
    const row = await getFirstBackupRow(page);
    const backupName = await getBackupNameFromRow(row);

    const deleteBtn = await getDeleteButtonFromRow(row);
    await deleteBtn.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);
    await modal.getByRole("button", { name: "ยืนยัน" }).click();

    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("cell", { name: backupName })).toHaveCount(0, {
      timeout: 15000,
    });
    await page.waitForTimeout(5000);
  });
});

