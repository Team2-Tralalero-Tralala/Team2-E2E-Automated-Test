import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

test.describe("SuperAdmin - Manage Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /*
  * TS-DCMNT-01.1: กรองชุมชนทั้งหมด
  */
  test("TS-DCMNT-01.1: กรองชุมชนทั้งหมด", async ({ page }) => {
    await filterAllCommunityManagePage(page);
  });

  /*
  * TS-DCMNT-01.2: กรองชุมชนที่เปิด
  */
  test("TS-DCMNT-01.2: กรองชุมชนที่เปิด", async ({ page }) => {
    await filterOpenCommunityManagePage(page);
  });

  /*
  * TS-DCMNT-01.3: กรองชุมชนที่ปิด
  */
  test("TS-DCMNT-01.3: กรองชุมชนที่ปิด", async ({ page }) => {
    await filterCloseCommunityManagePage(page);
  });


  async function filterAllCommunityManagePage(page) {
    await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await page.getByRole('button', { name: 'ทั้งหมด' }).nth(1).click();
  }

  async function filterOpenCommunityManagePage(page) {
    await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await page.getByRole('button', { name: 'เปิด' }).click();
  }

  async function filterCloseCommunityManagePage(page) {
    await page.getByRole('link', { name: 'จัดการชุมชน' }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
    await page.getByRole('button', { name: 'ทั้งหมด' }).click();
    await page.getByRole('button', { name: 'ปิด', exact: true }).click();
  }

});