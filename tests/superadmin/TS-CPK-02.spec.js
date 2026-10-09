import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("SuperAdmin - Create Account", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TS-CPK-02.1
   * แสดง modal ปฏิเสธการอนุมัติเมื่อคลิกปุ่มปฏิเสธ
   */
  test("TS-CPK-02.1: Shows cancel modal on approve request", async ({
    page,
  }) => {
    await page.goto("/super/package-requests");
    await expect(
      page.getByRole("heading", { name: /คำขออนุมัติ/i })
    ).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rowToApprove = table
      .getByRole("row")
      .filter({ has: page.getByRole("button", { name: /^ปฏิเสธ$/ }) })
      .first();

    await expect(rowToApprove).toBeVisible();
    await rowToApprove.getByRole("button", { name: /^ปฏิเสธ$/ }).click();
    const rejectModal = page.getByRole("dialog");
    await expect(rejectModal).toBeVisible({ timeout: 10000 });

    await expect(rejectModal.getByText(/ปฏิเสธคำขออนุมัติ/i)).toBeVisible();
    await expect(rejectModal.getByText(/กรุณากรอกเหตุผลการปฏิเสธ เพื่อส่งให้ผู้ส่งคำขอรับทราบ/i)).toBeVisible();
    await expect(rejectModal.getByRole("textbox", { name: /เหตุผลการปฏิเสธ/i })).toBeVisible();
    await expect(
      rejectModal.getByRole("button", { name: /ส่ง/i })
    ).toBeVisible();
    await expect(
      rejectModal.getByRole("button", { name: /ยกเลิก/i })
    ).toBeVisible();

    await page.waitForTimeout(5000);
  });

  /**
   * TS-CPK-02.2
   * กดส่ง เมื่อแสดง modal ปฏิเสธการอนุมัติ
   */
  test("TS-CPK-02.2: Reject approve request", async ({ page }) => {
    await page.goto("/super/package-requests");
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
   * TS-CPK-02.3
   * กดยกเลิกการปฏิเสธ เมื่อแสดง modal ปฏิเสธการอนุมัติ
   */
  test("TS-CPK-02.3: Cancel reject request", async ({ page }) => {
    await page.goto("/super/package-requests");
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

    const cancelModal = page.getByRole("dialog");
    await expect(cancelModal).toBeVisible({ timeout: 10000 });
    
    const rejectBox = page.getByRole("textbox", { name: /เหตุผลการปฏิเสธ/i });
    await expect(rejectBox).toBeVisible();

    await cancelModal.getByRole("button", { name: /ยกเลิก/i }).click();

    await expect(cancelModal).toBeHidden({ timeout: 10000 });

    await expect(
      table.getByRole("row", { name: new RegExp(packageName) })
    ).toBeVisible();

    await page.waitForTimeout(5000);
  });
});