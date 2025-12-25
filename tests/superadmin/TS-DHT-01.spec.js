import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

const nameTestFile = "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว";
test.describe("SuperAdmin - Delete Homestay", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /*
   * TS-DHT-01.1: คลิกปุ่มไอคอน (Icon Button) "ถังขยะ" ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)
   */
  test("TS-DHT-01.1: คลิกปุ่มไอคอน (Icon Button) ถังขยะ ต้องโชว์หน้าต่างแสดงผลซ้อน (Modal)", async ({
    page,
  }) => {
    await openModalDeleteHomestay(page);
    await expect(page.getByText(/ยืนยันการลบที่พัก/)).toBeVisible();
  });

  /*
   *TS-DHT-01.2: คลิกปุ่ม (Button) "ยืนยัน" ในหน้าต่างแสดงผลซ้อน (Modal) ที่พักจะถูกลบ
   */

  test("TS-DHT-01.2: คลิกปุ่ม (Button) ยืนยัน ในหน้าต่างแสดงผลซ้อน (Modal) ที่พักจะถูกลบ", async ({
    page,
  }) => {
    await confirmDeleteHomestay(page);
    await expect(
      page.getByText(/โฮมสเตย์บ้าน ของ วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว/)
    ).not.toBeVisible();
  });

  /*
   * TS-DHT-01.3: คลิกปุ่ม (Button) "ยกเลิก" ในหน้าต่างแสดงผลซ้อน (Modal) ที่พักจะไม่ถูกลบ
   */
  test("TS-DHT-01.3: คลิกปุ่ม (Button) ยกเลิก ในหน้าต่างแสดงผลซ้อน (Modal) ที่พักจะไม่ถูกลบ", async ({
    page,
  }) => {
    await cancelDeleteHomestay(page);
    await expect(
      page.getByText(/โฮมสเตย์บ้าน ของ วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว/)
    ).toBeVisible();
  });

  /*
   * ฟังก์ชันสำหรับเปิด Modal ลบที่พัก
   */
  async function openModalDeleteHomestay(page) {
    await page.getByRole("link", { name: "จัดการชุมชน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
    await page.getByRole("link", { name: nameTestFile }).click();
    await page.getByRole("button", { name: /ที่พัก/ }).click();
    await page.getByRole("button", { name: "จัดการ" }).click();
    await page
      .getByRole("row", {
        name: /โฮมสเตย์บ้าน ของ วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว/,
      })
      .getByLabel("ลบ")
      .click();
  }

  /*
   * ฟังก์ชันสำหรับยืนยันการลบที่พัก
   */
  async function confirmDeleteHomestay(page) {
    await page.getByRole("link", { name: "จัดการชุมชน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
    await page.getByRole("link", { name: nameTestFile }).click();
    await page.getByRole("button", { name: /ที่พัก/ }).click();
    await page.getByRole("button", { name: "จัดการ" }).click();
    await page
      .getByRole("row", {
        name: /โฮมสเตย์บ้าน ของ วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว/,
      })
      .getByLabel("ลบ")
      .click();
    await page.getByRole("button", { name: "ยืนยัน" }).click();
  }

  /*
   * ฟังก์ชันสำหรับยกเลิกการลบที่พัก
   */
  async function cancelDeleteHomestay(page) {
    await page.getByRole("link", { name: "จัดการชุมชน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
    await page.getByRole("link", { name: nameTestFile }).click();
    await page.getByRole("button", { name: /ที่พัก/ }).click();
    await page.getByRole("button", { name: "จัดการ" }).click();
    await page
      .getByRole("row", {
        name: /โฮมสเตย์บ้าน ของ วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว/,
      })
      .getByLabel("ลบ")
      .click();
    await page.getByRole("button", { name: "ยกเลิก" }).click();
  }
});
