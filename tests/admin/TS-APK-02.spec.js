import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

test.describe("Admin - Login Account", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "thanakorn");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-APK-02.1
   * แสดง modal ยืนยันการอนุมัติเมื่อคลิกปุ่มอนุมัติ
   */
  test("TS-APK-02.1: Shows confirm modal on approve request", async ({
    page,
  }) => {
    await page.goto("/admin/package-requests");
    await expect(
      page.getByRole("heading", { name: /คำขออนุมัติ/i })
    ).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rowToApprove = table
      .getByRole("row")
      .filter({ has: page.getByRole("button", { name: /^อนุมัติ$/ }) })
      .first();

    await expect(rowToApprove).toBeVisible();
    await rowToApprove.getByRole("button", { name: /^อนุมัติ$/ }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible({ timeout: 10000 });

    await expect(confirmModal.getByText(/ยืนยันการอนุมัติ/i)).toBeVisible();

    await expect(
      confirmModal.getByRole("button", { name: /ยืนยัน/i })
    ).toBeVisible();
    await expect(
      confirmModal.getByRole("button", { name: /ยกเลิก/i })
    ).toBeVisible();

    await page.waitForTimeout(5000);
  });

  /**
   * TS-APK-02.2
   * กดยืนยันการอนุมัติ เมื่อแสดง modal ยืนยันการอนุมัติ
   */
  test("TS-APK-02.2: Confirm approve request", async ({ page }) => {
    await page.goto("/admin/package-requests");
    await expect(
      page.getByRole("heading", { name: /คำขออนุมัติ/i })
    ).toBeVisible();

    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    const rowToApprove = table
      .getByRole("row")
      .filter({ has: page.getByRole("button", { name: /^อนุมัติ$/ }) })
      .first();

    await expect(rowToApprove).toBeVisible();

    const packageName = (
      await rowToApprove.getByRole("cell").nth(0).innerText()
    ).trim();

    await rowToApprove.getByRole("button", { name: /^อนุมัติ$/ }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible({ timeout: 10000 });

    await confirmModal.getByRole("button", { name: /ยืนยัน/i }).click();

    await expect(confirmModal).toBeHidden({ timeout: 10000 });

    await expect(
      table.getByRole("row", { name: new RegExp(packageName) })
    ).toHaveCount(0);

    await page.waitForTimeout(5000);
  });

  /**
   * TS-APK-02.3
   * กดยกเลิกการอนุมัติ เมื่อแสดง modal ยืนยันการอนุมัติ
   */
  test("TS-APK-02.3: Cancel approve request", async ({ page }) => {
    await page.goto("/admin/package-requests");
    await expect(
      page.getByRole("heading", { name: /คำขออนุมัติ/i })
    ).toBeVisible();
    const table = page.getByRole("table");
    await expect(table).toBeVisible();
    const rowToApprove = table
      .getByRole("row")
      .filter({ has: page.getByRole("button", { name: /^อนุมัติ$/ }) })
      .first();
    await expect(rowToApprove).toBeVisible();
    const packageName = (
      await rowToApprove.getByRole("cell").nth(0).innerText()
    ).trim();
    await rowToApprove.getByRole("button", { name: /^อนุมัติ$/ }).click();
    const cancelModal = page.getByRole("dialog");
    await expect(cancelModal).toBeVisible({ timeout: 10000 });
    await cancelModal.getByRole("button", { name: /ยกเลิก/i }).click();
    await expect(cancelModal).toBeHidden({ timeout: 10000 });
    await expect(
      table.getByRole("row", { name: new RegExp(packageName) })
    ).toBeVisible();
    await page.waitForTimeout(5000);
  });
});
