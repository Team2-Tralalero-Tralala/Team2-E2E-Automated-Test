import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageEditCommunity
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้า Edit Community
 * Steps:
 * 1. คลิกปุ่ม "แก้ไข"
 * 2. ตรวจสอบว่า URL เป็น /admin/community/own/edit
 */
async function goToPageEditCommunity(page) {
  const addBtn = page.getByRole("button", { name: "แก้ไข" });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await expect(page).toHaveURL(/\/admin\/community\/own\/edit/);
}

test.describe("Admin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-ECMNT-03.1
   * กรอกข้อมูลครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)
   */
  test("TS-ECMNT-03.1: Fill contact and caretaker information", async ({
    page,
  }) => {
    /**
     * Test Data
     * ใช้ทดสอบการกรอกข้อมูล “ข้อมูลติดต่อและผู้ดูแล” แบบครบถ้วน
     * ครอบคลุมข้อมูลติดต่อ วิสาหกิจชุมชน ผู้ดูแล ผู้ประสานงาน และการเลือกจาก Combobox
     */
    const testData = {
      communityPhone: "045987654",
      communityEmail: "community.herb@testmail.com",
      website: "https://community-herb.local",
      facebook: "https://facebook.com/communityherb",
      line: "https://line.me/R/ti/p/@communityherb",
      tiktok: "https://tiktok.com/@communityherb",
      caretakerName: "นายวิชัย ใจดี",
      caretakerPhone: "0823456789",
      coordinatorName: "นางสาวสุภาวดี แสนสุข",
      coordinatorPhone: "0867890123",
      caretakerSearch: "สม",
      caretakerValue: "สมศักดิ์ พูนผล",
      memberSearch: "พร",
      memberValue: "พรทิพย์ วัฒนชัย",
    };

    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill(testData.communityPhone);

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill(testData.communityEmail);

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill(testData.website);

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill(testData.facebook);

    await page.getByRole("textbox", { name: "Link Line" }).fill(testData.line);

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill(testData.tiktok);

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill(testData.caretakerName);

    await page
      .getByRole("textbox", { name: "โทรศัพท์ *" })
      .fill(testData.caretakerPhone);

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill(testData.coordinatorName);

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill(testData.coordinatorPhone);

    const caretakerDropdown = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretakerDropdown.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill(testData.caretakerSearch);

    const caretakerOption = page.getByText(testData.caretakerValue, {
      exact: true,
    });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretakerDropdown).toHaveValue(testData.caretakerValue);

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill(testData.memberSearch);

    const memberOption = page.getByText(testData.memberValue, { exact: true });
    await expect(memberOption).toBeVisible();
    await memberOption.click();

    await page.keyboard.press("Escape");
    await page.waitForSelector('[role="option"]', { state: "detached" });
  });

  /**
   * TS-ECMNT-03.2
   * กรอกข้อมูลไม่ครบถ้วน
   *
   */
  test("TS-ECMNT-03.2: Validate required fields when clearing data", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    const communityPhone = page.getByRole("textbox", {
      name: "โทรศัพท์วิสาหกิจชุมชน *",
    });
    await communityPhone.fill("");
    await communityPhone.blur();

    await expect(
      page.getByText("กรุณากรอกหมายเลขโทรศัพท์ของวิสาหกิจชุมชน")
    ).toBeVisible();

    const communityEmail = page.getByRole("textbox", {
      name: "อีเมลวิสาหกิจชุมชน *",
    });
    await communityEmail.fill("");
    await communityEmail.blur();

    await expect(
      page.getByText("กรุณากรอกอีเมลของวิสาหกิจชุมชน")
    ).toBeVisible();

    const caretakerName = page.getByRole("textbox", {
      name: "ชื่อผู้ดูแลหลัก *",
    });
    await caretakerName.fill("");
    await caretakerName.blur();

    await expect(page.getByText("กรุณากรอกชื่อผู้ดูแลหลัก")).toBeVisible();

    const caretakerPhone = page.getByRole("textbox", {
      name: "โทรศัพท์ *",
    });
    await caretakerPhone.fill("");
    await caretakerPhone.blur();

    await expect(
      page.getByText("กรุณากรอกหมายเลขโทรศัพท์ของผู้ดูแลหลัก")
    ).toBeVisible();
  });
});
