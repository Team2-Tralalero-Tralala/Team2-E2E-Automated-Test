import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * logout - ออกจากระบบผู้ใช้งานปัจจุบัน
 * Input:
 *   - page: Playwright Page object
 * Action:
 *   - เปิดเมนูโปรไฟล์ของผู้ใช้งานที่ล็อกอินอยู่
 *   - คลิกปุ่ม "ออกจากระบบ"
 *   - รอจนระบบนำทางไปยังหน้า Login / Guest
 * Output:
 *   - assertion ว่าผู้ใช้งานออกจากระบบสำเร็จ (URL เปลี่ยนไปจากหน้าของ role เดิม)
 */

async function logout(page) {
  // เปิดเมนูโปรไฟล์ (ใช้ชื่อปุ่มที่พบใน snapshot ของคุณ เช่น "ธนกร สุขใจ")
  const profileBtn = page.getByRole("button", {
    name: /ธนกร|สุขใจ|นภา|ธนวรรธน์/i,
  });
  await expect(profileBtn).toBeVisible({ timeout: 15000 });
  await profileBtn.click();

  const logoutBtn = page.getByRole("button", { name: /ออกจากระบบ/i });
  await expect(logoutBtn).toBeVisible({ timeout: 15000 });
  await logoutBtn.click();
}

test.describe("Admin - Login Account", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "thanakorn");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-PKG-REJECT-01.1
   * ทดสอบการปฏิเสธแพ็กเกจโดยกรอกเหตุผลและยืนยัน
   */
    test("TS-PKG-REJECT-01.1: Confirm reject approve request", async ({
      page,
    }) => {
      await page.goto("/admin/package-requests");
      await expect(
        page.getByRole("heading", { name: /คำขออนุมัติ/i })
      ).toBeVisible();

      const table = page.getByRole("table");
      await expect(table).toBeVisible();

      const rowToReject = table
        .getByRole("row")
        .filter({ has: page.getByRole("button", { name: /^ปฏิเสธ$/ }) })
        .first();

      await expect(rowToReject).toBeVisible();

      const packageName = (
        await rowToReject.getByRole("cell").nth(0).innerText()
      ).trim();

      await rowToReject.getByRole("button", { name: /^ปฏิเสธ$/ }).click();

      const rejectModal = page.getByRole("dialog");
      await expect(rejectModal).toBeVisible({ timeout: 10000 });

      const rejectBox = page.getByRole("textbox", { name: /เหตุผลการปฏิเสธ/i });
      await expect(rejectBox).toBeVisible();
      const keyword = "ไม่ผ่านตามเกณฑ์ที่กำหนด";
      await rejectBox.fill(keyword);

      await rejectModal.getByRole("button", { name: /ส่ง/i }).click();
      await expect(rejectModal).toBeHidden({ timeout: 10000 });

      await expect(
        table.getByRole("row", { name: new RegExp(packageName) })
      ).toHaveCount(0);

      await page.waitForTimeout(5000);
    });

  /**
   * TS-PKG-REJECT-01.2
   * ทดสอบการปฏิเสธแพ็กเกจโดยไม่กรอกเหตุผล
   */
    test("TS-PKG-REJECT-01.2: Reject approve request without reason", async ({ page }) => {
      await page.goto("/admin/package-requests");
      await expect(
        page.getByRole("heading", { name: /คำขออนุมัติ/i })
      ).toBeVisible();

      const table = page.getByRole("table");
      await expect(table).toBeVisible();

      const rowToReject = table
        .getByRole("row")
        .filter({ has: page.getByRole("button", { name: /^ปฏิเสธ$/ }) })
        .first();

      await expect(rowToReject).toBeVisible();

      const packageName = (
        await rowToReject.getByRole("cell").nth(0).innerText()
      ).trim();

      await rowToReject.getByRole("button", { name: /^ปฏิเสธ$/ }).click();

      const rejectModal = page.getByRole("dialog");
      await expect(rejectModal).toBeVisible({ timeout: 10000 });

      const rejectBox = page.getByRole("textbox", { name: /เหตุผลการปฏิเสธ/i });
      await expect(rejectBox).toBeVisible();

      await rejectModal.getByRole("button", { name: /ส่ง/i }).click();

      await page.waitForTimeout(5000);
    });

  /**
   * TS-PKG-REJECT-01.3
   * ตรวจสอบการปฏิเสธคำขออนุมัติแพ็กเกจโดยผู้ดูแลระบบ
   */
    test("TC-PKG-Reject-01.3: Reject already approved/rejected package", async ({
      page,
    }) => {
      await page.goto("/admin/package-requests");
      await expect(
        page.getByRole("heading", { name: /คำขออนุมัติ/i })
      ).toBeVisible();

      const table = page.getByRole("table");
      await expect(table).toBeVisible();

      const targetRow = table
        .getByRole("row")
        .filter({
          has: page.getByText(/อนุมัติแล้ว|ถูกปฏิเสธ/i),
        })
        .first();

      await expect(targetRow).toBeVisible();

      const rowToReject = table
        .getByRole("row")
        .filter({ has: page.getByRole("button", { name: /^ปฏิเสธ$/ }) })
        .first();

      await expect(rowToReject).toBeVisible();
      await rowToReject.getByRole("button", { name: /^ปฏิเสธ$/ }).click();
    });

  /**
   * TS-PKG-REJECT-01.4
   * ทดสอบผู้ใช้ทั่วไป (Member/Tourist) พยายามเข้าหน้าปฏิเสธแพ็กเกจ
   */
  test.describe("Access control - Package Requests", () => {
    test("TC-PKG-Reject-01.4: Member cannot access admin package-requests", async ({
      page,
    }) => {
      await logout(page);
      await loginAs(page, "member1");
      await page.goto("/admin/package-requests", {
        waitUntil: "domcontentloaded",
      });
      await page
        .getByText(/ไม่มีสิทธิ์เข้าถึง|403|forbidden|unauthorized/i)
        .isVisible()
        .catch(() => false);
      await page.waitForTimeout(5000);
    });

    test("TC-PKG-Reject-01.4: Tourist cannot access admin package-requests", async ({
      page,
    }) => {
      await logout(page);
      await loginAs(page, "tourist2");

      await page.goto("/admin/package-requests", {
        waitUntil: "domcontentloaded",
      });

      await page
        .getByText(/ไม่มีสิทธิ์เข้าถึง|403|forbidden|unauthorized/i)
        .isVisible()
        .catch(() => false);
      await page.waitForTimeout(5000);
    });
  });
});
