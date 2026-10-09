import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * ตั้งค่าให้ test ในไฟล์นี้รันแบบ serial
 * เพื่อให้ใช้ session / state ต่อเนื่องกันได้
 */
test.describe.configure({ mode: "serial" });

/**
 * goToManageAccountsPage
 * ใช้สำหรับนำทางไปยังหน้า "จัดการบัญชี" (Super Admin)
 * Steps:
 * 1. คลิกลิงก์ "จัดการบัญชี"
 * 2. ตรวจสอบว่า URL เป็น /super/accounts/all
 */
async function goToManageAccountsPage(page) {
    const manageAccountLink = page.getByRole("link", { name: "จัดการบัญชี" });
    await expect(manageAccountLink).toBeVisible();
    await manageAccountLink.click();
    await expect(page).toHaveURL(/super\/accounts\/all/);
    console.log("Waiting 2 seconds at Manage Accounts page...");
    await page.waitForTimeout(2000);
}

/**
 * goToManageMemberPage
 * ใช้สำหรับนำทางไปยังหน้า "จัดการสมาชิก" (Admin)
 * Steps:
 * 1. คลิกลิงก์ "จัดการสมาชิก"
 * 2. ตรวจสอบว่า URL เป็น /admin/members
 */
async function goToManageMemberPage(page) {
    const manageManageMemberLink = page.getByRole("link", {
        name: "จัดการสมาชิก",
    });
    await expect(manageManageMemberLink).toBeVisible();
    await manageManageMemberLink.click();
    await expect(page).toHaveURL(/admin\/members/);
    console.log("Waiting 2 seconds at Manage Member page...");
    await page.waitForTimeout(2000);
}

/**
 * filterByRoleAdmin
 * กรองผู้ใช้งานตามบทบาท "ผู้ดูแลชุมชน"
 */
async function filterByRoleAdmin(page) {
    const filterBtn = page
        .locator("button")
        .filter({
            hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/,
        })
        .first();

    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    const adminOption = page.getByRole("button", { name: "ผู้ดูแลชุมชน" });
    await adminOption.click();
    console.log("Waiting 1 seconds after filtering...");
    await page.waitForTimeout(1000);
}

/**
 * filterByRoleMember
 * กรองผู้ใช้งานตามบทบาท "สมาชิก"
 */
async function filterByRoleMember(page) {
    const filterBtn = page
        .locator("button")
        .filter({ hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/ })
        .first();
    await filterBtn.click();
    const memberOption = page.getByRole("button", { name: "สมาชิก" });
    await memberOption.click();
    await page.waitForTimeout(1000);
}

/**
 * filterByRoleUser
 * กรองผู้ใช้งานตามบทบาท "ผู้ใช้งานทั่วไป"
 */
async function filterByRoleUser(page) {
    const filterBtn = page
        .locator("button")
        .filter({ hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/ })
        .first();
    await filterBtn.click();

    const userOption = page.getByRole("button", { name: "ผู้ใช้งานทั่วไป" });
    await userOption.click();

    await page.waitForTimeout(1000);
}

/**
 * filterByRoleAll
 * แสดงผู้ใช้งานทั้งหมดทุกบทบาท
 */
async function filterByRoleAll(page) {
    const filterBtn = page
        .locator("button")
        .filter({ hasText: /ทั้งหมด|ผู้ดูแลชุมชน|สมาชิก|ผู้ใช้งานทั่วไป/ })
        .first();

    await filterBtn.click({ force: true });

    const userOption = page.getByRole("button", { name: "ทั้งหมด" }).last();
    await userOption.click();

    await page.waitForTimeout(1000);
}

/**
 * TS-STA-01
 * ผู้ใช้งาน Super Admin สามารถระงับบัญชีผู้ใช้งานได้
 */
test.describe
    .serial("TS-STA-01 ผู้ใช้งาน Super Admin สามารถระงับบัญชีผู้ใช้งาน", () => {
      let page;

      test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        await loginAs(page, "superadmin");
        await expect(page).toHaveURL(/super\/communities/);
        console.log("Login Successful - Starting tests...");
      });

      test.afterAll(async () => {
        await page.close();
      });

      test.afterEach(async ({}, testInfo) => {
        const fileName = testInfo.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        if (page) {
          await page.screenshot({
            path: `screenshots/${fileName}.png`,
            fullPage: true,
          });
        }
      });

      /**
       * TS-STA-01.1
       * ตรวจสอบว่า Super Admin สามารถกรองผู้ใช้งานตามบทบาท "ผู้ดูแลชุมชน (Admin)" ได้
       * Expected:
       * - ตารางแสดงข้อมูลผู้ใช้งานต้องปรากฏ
       */
      test("TS-STA-01.1: กรองบทบาท Admin", async ({}) => {
        await goToManageAccountsPage(page);
        await filterByRoleAdmin(page);
        await expect(page.getByRole("table")).toBeVisible();
      });

      /**
       * TS-STA-01.2
       * ตรวจสอบว่า Super Admin สามารถกรองผู้ใช้งานตามบทบาท "สมาชิก (Member)" ได้
       * Expected:
       * - ตารางแสดงข้อมูลผู้ใช้งานต้องปรากฏ
       */
      test("TS-STA-01.2: กรองบทบาท Member", async ({}) => {
        await goToManageAccountsPage(page);
        await filterByRoleMember(page);
        await expect(page.getByRole("table")).toBeVisible();
      });

      /**
       * TS-STA-01.3
       * ตรวจสอบว่า Super Admin สามารถกรองผู้ใช้งานตามบทบาท "ผู้ใช้งานทั่วไป (User)" ได้
       * Expected:
       * - ตารางแสดงข้อมูลผู้ใช้งานต้องปรากฏ
       */
      test("TS-STA-01.3: กรองบทบาท User", async ({}) => {
        await goToManageAccountsPage(page);
        await filterByRoleUser(page);
        await expect(page.getByRole("table")).toBeVisible();
      });

      /**
       * TS-STA-01.8
       * ตรวจสอบว่าเฉพาะ Super Admin เท่านั้นที่สามารถมองเห็นปุ่ม "บล็อกบัญชี"
       * Expected:
       * - ปุ่มบล็อก (title="บล็อก") ต้องมองเห็นได้
       */
      test("TS-STA-01.8: แสดงปุ่มระงับบัญชีเฉพาะ Super Admin เท่านั้น", async ({}) => {
        await filterByRoleAll(page);
        const blockBtn = page.locator('button[title="บล็อก"]').first();
        await expect(blockBtn).toBeVisible();
      });

      /**
       * TS-STA-01.5
       * ตรวจสอบว่าเมื่อ Super Admin กดปุ่มบล็อก
       * ระบบจะแสดง Modal ยืนยันการระงับบัญชี
       * Expected:
       * - Modal ต้องแสดง
       * - ต้องมีปุ่ม "ยืนยัน" และ "ยกเลิก"
       */
      test("TS-STA-01.5: ยกเลิกการระงับบัญชีก่อนยืนยัน (แสดง Modal)", async ({}) => {
        await goToManageAccountsPage(page);
        await filterByRoleAll(page);

        const rowToSuspend = page
          .getByRole("row")
          .filter({ has: page.locator('button[title="บล็อก"]') })
          .first();

        await expect(rowToSuspend).toBeVisible();

        await rowToSuspend
          .locator('button[title="บล็อก"]')
          .click({ force: true });

        const confirmModal = page
          .locator(".modal-content")
          .or(page.getByRole("dialog"));
        await expect(confirmModal).toBeVisible();

        await expect(
          confirmModal.getByRole("button", { name: /ยกเลิก/ })
        ).toBeVisible();
        await expect(
          confirmModal.getByRole("button", { name: /ยืนยัน/ })
        ).toBeVisible();
        await page.waitForTimeout(2000);
      });

      /**
       * TS-STA-01.6
       * ตรวจสอบว่าสามารถยกเลิกการระงับบัญชีได้
       * โดยกดปุ่ม "ยกเลิก" ใน Modal
       * Expected:
       * - Modal ต้องปิดลงโดยไม่ระงับบัญชี
       */
      test("TS-STA-01.6: ยกเลิกการระงับบัญชีก่อนยืนยัน (กดปุ่มยกเลิกใน Modal)", async ({}) => {
        const confirmModal = page
          .locator(".modal-content")
          .or(page.getByRole("dialog"));
        await expect(confirmModal).toBeVisible();
        await confirmModal.getByRole("button", { name: "ยกเลิก" }).click();
        await page.waitForTimeout(2000);
      });
      
      /**
       * TS-STA-01.4
       * ตรวจสอบว่า Super Admin สามารถระงับบัญชีผู้ใช้งานได้สำเร็จ
       * Expected:
       * - ระบบยอมรับการยืนยัน
       * - กระบวนการระงับบัญชีทำงานได้โดยไม่ error
       */
      test("TS-STA-01.4: ระงับบัญชีผู้ใช้งานสำเร็จ", async ({}) => {
        await goToManageAccountsPage(page);
        await filterByRoleAll(page);

        const rowToSuspend = page
          .getByRole("row")
          .filter({ has: page.locator('button[title="บล็อก"]') })
          .first();

        await expect(rowToSuspend).toBeVisible();

        await rowToSuspend
          .locator('button[title="บล็อก"]')
          .click({ force: true });

        const confirmModal = page
          .locator(".modal-content")
          .or(page.getByRole("dialog"));
        await expect(confirmModal).toBeVisible();
        await page.waitForTimeout(1000);
        await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
        await page.waitForTimeout(1000);
      });
    });

test.describe
    .serial("TS-STA-01 ผู้ใช้งาน Admin", () => {
      let page;

      test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        await loginAs(page, "admin");
        await expect(page).toHaveURL(/admin\/community\/own/);
        console.log("Login Successful - Starting tests...");
      });

      test.afterAll(async () => {
        await page.close();
      });

      test.afterEach(async ({}, testInfo) => {
        const fileName = testInfo.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        if (page) {
          await page.screenshot({
            path: `screenshots/${fileName}.png`,
            fullPage: true,
          });
        }
      });

      /**
       * TS-STA-01.10
       * ตรวจสอบว่า Admin สามารถเข้าหน้าจัดการสมาชิกได้
       * (กรณีผู้ใช้งานไม่ถูกระงับ)
       * Expected:
       * - เข้าหน้า Manage Member ได้ตามปกติ
       */
      test("TS-STA-01.10: ผู้ใช้ที่ไม่ถูกระงับควรเข้าสู่ระบบได้ตามปกติ", async ({}) => {
        await goToManageMemberPage(page);
        await page.waitForTimeout(1000);
      });

      /**
       * TS-STA-01.7
       * ตรวจสอบว่า Admin (ไม่ใช่ Super Admin)
       * จะไม่สามารถเห็นปุ่มระงับบัญชี
       * Expected:
       * - ปุ่มบล็อกต้องไม่ปรากฏ
       */
      test("TS-STA-01.7: ผู้ใช้งานที่ไม่ใช่ Super Admin ไม่สามารถเห็นปุ่มระงับบัญชี", async ({}) => {
        const blockBtn = page.locator('button[title="บล็อก"]').first();

        await expect(blockBtn).toBeHidden();
        await page.waitForTimeout(1000);
      });
    });

test.describe.serial("TS-STA-01 ผู้ใช้งานเข้าสู่ระบบไม่สำเร็จ", () => {
  let page;

  test.afterEach(async ({}, testInfo) => {
    const fileName = testInfo.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    if (page) {
      await page.screenshot({
        path: `screenshots/${fileName}.png`,
        fullPage: true,
      });
      await page.close();
    }
  });
  
  /**
   * TS-STA-01.9
   * ตรวจสอบว่าผู้ใช้งานที่ถูกระงับ
   * ไม่สามารถเข้าสู่ระบบได้
   * Expected:
   * - แสดงข้อความแจ้งเตือนว่าบัญชีถูกบล็อก
   */
  test("TS-STA-01.9: ผู้ใช้งานเข้าสู่ระบบไม่สำเร็จ", async ({
    page: fixturePage,
  }) => {
    page = fixturePage;

    await page.goto("/guest/partner/login");
    await page.locator("#username").fill("admin_1@example.com");
    await page.locator("#password").fill("hashedpw");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    const errorMsg = page.getByText(/ถูกบล็อก/);
    await expect(errorMsg).toBeVisible();
    await page.waitForTimeout(1000);
  });
});