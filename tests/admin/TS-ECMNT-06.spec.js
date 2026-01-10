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
   * TS-ECMNT-06.1
   * Admin บันทึกข้อมูลวิสาหกิจชุมชนได้ เมื่อกรอกข้อมูลครบ
   */
  test("TS-ECMNT-06.1: Edit community with complete community information", async ({
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
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนแปรรูปข้าวอินทรีย์บ้านหนองโพ");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("กลุ่มข้าวอินทรีย์หนองโพ");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("เกษตรแปรรูป");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("SMCE-9023-7");

    await page.getByRole("textbox", { name: "วว" }).fill("12");
    await page.getByRole("textbox", { name: "ดด" }).fill("08");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2565");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page
      .getByRole("option", {
        name: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
      })
      .click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปข้าวอินทรีย์บ้านหนองโพ");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("0949283212");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill(
        "กลุ่มเกษตรกรรวมตัวกันผลิตและแปรรูปข้าวอินทรีย์ เพื่อเพิ่มมูลค่าและสร้างรายได้อย่างยั่งยืน"
      );

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("แปรรูปข้าวอินทรีย์");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill(
        "ผลิตและจำหน่ายข้าวสารอินทรีย์ ข้าวกล้อง และผลิตภัณฑ์แปรรูปจากข้าว"
      );

    const imageSection = page
      .locator("text=อัพโหลดรูปภาพเพิ่มเติม")
      .locator("..");

    const imageInput = imageSection.locator('input[type="file"]');

    const images = [
      path.join(process.cwd(), "assets/photo/activity1.jpeg"),
      path.join(process.cwd(), "assets/photo/activity2.jpg"),
      path.join(process.cwd(), "assets/photo/activity3.jpg"),
    ];

    for (let i = 0; i < images.length; i++) {
      await imageInput.setInputFiles(images[i]);
      await expect(imageSection).toContainText(/\d+\s*\/\s*5/);
    }

    const videoSection = page
      .locator("text=อัพโหลดวิดีโอเพิ่มเติม")
      .locator("..");

    const videoInput = videoSection.locator('input[type="file"]');

    const videos = [
      path.join(process.cwd(), "assets/video/activity_Video1.mp4"),
      path.join(process.cwd(), "assets/video/activity_Video2.mp4"),
    ];
    for (let i = 0; i < videos.length; i++) {
      await videoInput.setInputFiles(videos[i]);
      await expect(videoSection).toContainText(/\d+\s*\/\s*5/);
    }

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("128/7");

    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("5");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.fill("เชียงใหม่");
    await province.press("Tab");

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.fill("แม่ริม");
    await district.press("Tab");

    const subDistrict = page.getByRole("combobox", {
      name: "ตำบล/แขวง *",
    });
    await subDistrict.fill("ริมใต้");
    await subDistrict.press("Tab");

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("23170");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ใกล้ศูนย์พัฒนาเกษตรอินทรีย์และแหล่งท่องเที่ยวชุมชน");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("18.918703");

    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("98.981716");

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

    const caretakerDropdown = page.getByRole("combobox", {
      name: "ผู้ดูแล *",
    });
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

    const memberOption = page.getByText(testData.memberValue, {
      exact: true,
    });
    await expect(memberOption).toBeVisible();
    await memberOption.click();

    await page.keyboard.press("Escape");
    await page.waitForSelector('[role="option"]', { state: "detached" });

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/admin\/community\/own/);
  });

  /**
   * TS-ECMNT-06.2
   *  Admin ไม่สามารถ บันทึกข้อมูลวิสาหกิจชุมชนได้ เมื่อกรอกข้อมูลไม่ครบ
   */
  test("TS-ECMNT-06.2: Edit community with complete community information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const communityNameInput = page.getByRole("textbox", {
      name: /ชื่อวิสาหกิจชุมชน/,
    });

    await expect(communityNameInput).toBeVisible();
    await communityNameInput.fill("");
    await communityNameInput.blur();

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    const houseNumber = page.getByRole("textbox", { name: "บ้านเลขที่ *" });
    await houseNumber.fill("");
    await houseNumber.press("Tab");
    await expect(page.locator("#houseNumber-helper-text")).toHaveText(
      "กรุณากรอกบ้านเลขที่"
    );
    await expect(houseNumber).toHaveClass(/border-red-600/);

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    const communityPhone = page.getByRole("textbox", {
      name: "โทรศัพท์วิสาหกิจชุมชน *",
    });
    await communityPhone.fill("");
    await communityPhone.blur();

    const communityEmail = page.getByRole("textbox", {
      name: "อีเมลวิสาหกิจชุมชน *",
    });
    await communityEmail.fill("");
    await communityEmail.blur();

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await expect(resultDialog).toContainText("ข้อมูลไม่ถูกต้อง");
    await expect(resultDialog).toContainText(
      "กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก"
    );

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();
    await expect(page).toHaveURL(/admin\/community\/own\/edit/);
  });

  /**
   * TS-ECMNT-06.3
   *  คลิกปุ่ม (Button) "ยกเลิก"
   * ในหน้้าต่างแสดงผลซ้อน ระบบไม่บันทึกข้อมูล
   */
  test("TS-ECMNT-06.3: Cancel edit community and return to community list", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "บันทึก" }).click();
    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText("ยืนยันการแก้ไขข้อมูล");
    await confirmDialog.getByRole("button", { name: "ยกเลิก" }).click();
    await expect(page).toHaveURL(/admin\/community\/own\/edit/);
  });

  /**
   * TS-ECMNT-06.4
   *  ยกเลิกการแก้ไขชุมชน
   */
  test("TS-ECMNT-06.4: Cancel edit community and return to community list", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText("ยืนยันการยกเลิก");
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/admin\/community\/own/);
  });
});
