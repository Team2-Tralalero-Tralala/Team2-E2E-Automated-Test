import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";
import path from "path";

/**
 * goToPageCreateAccount
 * ใช้สำหรับนำทางจากหน้า Community List ไปยังหน้า Create Community
 * Steps:
 * 1. คลิกปุ่ม "เพิ่มชุมชน"
 * 2. ตรวจสอบว่า URL เป็น /super/community/create
 */
async function goToPageEditCommunity(page) {
  const communityName = "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว";

  const row = page.locator("tr", { hasText: communityName });
  await expect(row).toBeVisible();

  const editIcon = row.locator("td").last().locator("button").first();
  await expect(editIcon).toBeVisible();

  await editIcon.click();
  await expect(page).toHaveURL(/\/super\/community\/\d+\/edit$/);
}

/**
 * uploadCoverImage
 * อัปโหลดรูปหน้าปกชุมชนและยืนยันการครอป
 */
async function uploadCoverImage(page) {
  const coverImage = path.resolve(
    process.cwd(),
    "assets/photo/communityCover.jpeg"
  );
  await page.locator('input[type="file"]').nth(0).setInputFiles(coverImage);
  const useCropBtn = page.getByRole("button", { name: "ใช้รูปที่ครอป" });
  await expect(useCropBtn).toBeVisible();
  await useCropBtn.click();
  await expect(useCropBtn).toBeHidden();
}

/**
 * uploadLogoImage
 * อัปโหลดโลโก้ชุมชนและยืนยันการครอป
 */
async function uploadLogoImage(page) {
  const logoImage = path.resolve(
    process.cwd(),
    "assets/photo/logoCommunity.jpg"
  );
  await page.locator('input[type="file"]').nth(1).setInputFiles(logoImage);
  const useConfirmBtn = page.getByRole("button", { name: "ใช้รูปที่ครอป" });
  await expect(useConfirmBtn).toBeVisible();
  await useConfirmBtn.click();
  await expect(useConfirmBtn).toBeHidden();
}

test.describe("SuperAdmin - Edit Community", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "superadmin");
    await expect(page).toHaveURL(/super\/communities/);
  });

  /**
   * TC-ECMNT-01.1
   * กรอกข้อมูลครบถ้วน (ข้อมูลชุมชน)
   */
  test("TC-ECMNT-01.1: Edit community with complete community information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("สมุนไพรดอนกลาง");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("เกษตรแปรรูป");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400098765");

    await page.getByRole("textbox", { name: "วว" }).fill("05");
    await page.getByRole("textbox", { name: "ดด" }).fill("03");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2564");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารออมสิน" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("9876543210");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill(
        "กลุ่มชาวบ้านรวมตัวกันนำสมุนไพรท้องถิ่นมาแปรรูปเป็นผลิตภัณฑ์สุขภาพ เพื่อเพิ่มมูลค่าและสร้างรายได้ให้กับชุมชน"
      );

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("แปรรูปสมุนไพรพื้นบ้าน");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill(
        "ผลิตและจำหน่ายผลิตภัณฑ์สมุนไพร เช่น ยาหม่อง น้ำมันสมุนไพร และชาสมุนไพร"
      );
  });

  /**
   * TC-ECMNT-01.2
   * ไม่กรอกชื่อวิสาหกิจชุมชน
   */
  test("TC-ECMNT-01.2: Validate required community name", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    const communityNameInput = page.getByRole("textbox", {
      name: /ชื่อวิสาหกิจชุมชน/,
    });

    await expect(communityNameInput).toBeVisible();
    await communityNameInput.fill("");
    await communityNameInput.blur();
    const validationMessage = page.getByText("กรุณากรอกชื่อวิสาหกิจชุมชน");
    await expect(validationMessage).toBeVisible();
  });

  /**
   * TC-ECMNT-01.3
   * ไม่กรอกเลขทะเบียน
   */
  test("TC-ECMNT-01.3: Validate required community registration number", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByLabel("เลขทะเบียนวิสาหกิจชุมชน *").clear();
    await expect(
      page.getByText("กรุณากรอกเลขทะเบียนวิสาหกิจชุมชน")
    ).toBeVisible();
  });

  /**
   * TC-ECMNT-01.4
   * กรอกเลขทะเบียนเป็นตัวอักษร
   */
  test("TC-ECMNT-01.4: Upload community cover and logo images", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    const communityNumberInput = page.getByRole("textbox", {
      name: /เลขทะเบียนวิสาหกิจชุมชน/,
    });

    await expect(communityNumberInput).toBeVisible();
    await communityNumberInput.fill("SCER-0012-111");
  });

  /**
   * TC-ECMNT-01.5
   * กรอกชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น
   */
  test("TC-ECMNT-01.5: Validate local name input", async ({ page }) => {
    await goToPageEditCommunity(page);
    const localNameInput = page.locator("#alias");
    await localNameInput.fill("", { force: true });
    await localNameInput.fill("ชชทน", { force: true });
    await localNameInput.blur({ force: true });
  });

  /**
   * TC-ECMNT-01.6
   * อัพโหลดรูปภาพหน้าปกและโลโก้
   */
  test("TC-ECMNT-01.6: Upload community cover and logo images", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await uploadCoverImage(page);
    await uploadLogoImage(page);
  });

  /**
   * TC-ECMNT-01.8
   * ไม่อัพโลโก้
   */
  test("TC-ECMNT-01.8: Click community name without logo should navigate to detail page", async ({
    page,
  }) => {
    await page.goto("/super/communities/all");
    await page
      .getByRole("link", { name: "วิสาหกิจชุมชนท่องเที่ยวบ้านน้ำเชี่ยว" })
      .click();
    await expect(page).toHaveURL(/\/super\/community\/\d+$/);
  });

  /**
   * TC-ECMNT-01.9
   * กรอกบัญชีข้อมูลธนาคารครบ
   */
  test("TC-ECMNT-01.8: Fill complete bank account information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารกรุงไทย" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนทอผ้าบ้านหนองไผ่");
    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("11108761627");
  });

  /**
   * TC-ECMNT-01.10
   * ไม่กรอกเลขบัญชี
   */
  test("TC-ECMNT-01.10: Validate required bank account number", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByLabel("หมายเลขบัญชี *").clear();
    await expect(page.getByText("กรุณากรอกหมายเลขบัญชี")).toBeVisible();
  });

  /**
   * TC-ECMNT-01.11
   * ไม่กรอกเลขบัญชี
   */
  test("TC-ECMNT-01.11: Validate bank account accepts numeric only", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("dlpslwdlk11");

    const nameError = page.getByText("กรุณากรอกเลขบัญชีเป็นตัวเลข");
    await expect(nameError).toBeVisible();
  });

  /**
   * TC-ECMNT-01.12
   * กรอกชื่อกิจกรรมหลัก
   */
  test("TC-ECMNT-01.12: Fill main activity information", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("ดูสวนสัตว์ลาลารี");
  });

  /**
   * TC-ECMNT-01.13
   * ไม่กรอกชื่อกิจกรรมหลัก
   */
  test("TC-ECMNT-01.13: Validate required main activity name", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();
    await page.getByLabel("ชื่อกิจกรรมหลัก *").clear();
    const nameError = page.getByText("กรุณากรอกชื่อกิจกรรมหลัก");
    await expect(nameError).toBeVisible();
  });

  /**
   * TC-ECMNT-01.14
   * อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TC-ECMNT-01.14: Upload additional community images", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

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
      await expect(imageSection).toContainText(`${i + 1} / 5`);
    }
  });

  /**
   * TC-ACMNT-01.15
   * อัพโหลดวิดิโอเพิ่มเติม
   */
  test("TC-ECMNT-01.15: Upload additional community videos", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

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
      await expect(videoSection).toContainText(`${i + 1} / 5`);
    }
  });

  /**
   * TC-ACMNT-01.16
   * ไม่อัพโหลดรูปภาพเพิ่มเติม
   */
  test("TC-ECMNT-01.16: No additional photos uploaded.", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    const nameError = page.getByText("กรุณาอัพโหลดรูปภาพ");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/\d+$/);
  });

  /**
   * TC-ACMNT-01.17
   * ไม่อัพโหลดวิดิโอเพิ่มเติม
   */
  test("TC-ECMNT-01.17: No additional video uploaded.", async ({ page }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

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
      await expect(imageSection).toContainText(`${i + 1} / 5`);
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible();

    await resultDialog.getByRole("button", { name: "ปิด" }).click();
    await expect(resultDialog).toBeHidden();

    const nameError = page.getByText("กรุณาอัพโหลดรูปภาพ");
    await expect(nameError).toBeVisible();
    await expect(page).toHaveURL(/\/super\/community\/\d+$/);
  });

  /**
   * TC-ECMNT-01.18
   * กรอกข้อมูลครบถ้วน (ข้อมูลที่อยู่วิสาหกิจชุมชน)
   */
  test("TC-ECMNT-01.18: Fill complete community address information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("45/1");
    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("3");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("อุบล");
    await page.getByRole("option", { name: "อุบลราชธานี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("วาริน");
    await page.getByRole("option", { name: "วารินชำราบ" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });
    await subDistrict.click();
    await subDistrict.fill("วารินชำราบ");
    await page.getByRole("option", { name: "วารินชำราบ" }).click();

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("34190");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill(
        "ตั้งอยู่ในพื้นที่ชุมชนบ้านดอนกลาง ใกล้แปลงสมุนไพรและศูนย์เรียนรู้ชุมชน"
      );

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("15.244845");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("104.847299");
  });

  /**
   * TC-ECMNT-01.19
   * กรอกข้อมูลไม่ครบถ้วน (ข้อมูลที่อยู่วิสาหกิจชุมชน)
   */
  test("TC-ECMNT-01.19: Validate incomplete community address information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    const houseNo = page.getByRole("textbox", { name: "บ้านเลขที่ *" });
    await houseNo.clear();
    await houseNo.fill("");

    const moo = page.getByRole("spinbutton", { name: "หมู่ที่" });
    await moo.clear();
    await moo.fill("");

    const addressDesc = page.getByRole("textbox", {
      name: "คำอธิบายที่อยู่",
    });
    await addressDesc.clear();
    await addressDesc.fill(
      "ตั้งอยู่ในพื้นที่ชุมชนบ้านดอนกลาง ใกล้แปลงสมุนไพรและศูนย์เรียนรู้ชุมชน"
    );
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
  });

  /**
   * TC-ECMNT-01.20
   * ปักหมุดวิสาหกิจ
   */
  test("TC-ECMNT-01.20: Pin community location by latitude and longitude", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();
    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("15.244845");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("104.847299");
  });

  /**
   * TC-ECMNT-01.21
   * ปักหมุดวิสาหกิจจากการค้นหาสถานที่ใกล้เคียง
   */
  test("TC-ECMNT-01.21: Pin community location by searching place", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    const searchInput = page.getByPlaceholder(
      "ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด"
    );

    await searchInput.click();
    await searchInput.fill("วารินชำราบ");

    const firstOption = page.locator('li:has-text("อำเภอวารินชำราบ")').first();

    await expect(firstOption).toBeVisible();
    await firstOption.click();

    const latInput = page.getByRole("spinbutton", { name: "ละติจูด *" });
    const lngInput = page.getByRole("spinbutton", { name: "ลองจิจูด *" });

    await expect(latInput).not.toHaveValue("");
    await expect(lngInput).not.toHaveValue("");

    const lat = Number(await latInput.inputValue());
    const lng = Number(await lngInput.inputValue());

    expect(lat).toBeGreaterThan(0);
    expect(lng).toBeGreaterThan(0);
  });

  /**
   * TC-ECMNT-01.22
   * กรอกข้อมูลครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)
   */
  test("TC-ECMNT-01.22:  Fill contact and caretaker information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill("045123456");

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill("dondangherb@gmail.com");

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://dondang-herb.community");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/dondangherb");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/R/ti/p/@dondangherb");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@dondangherb");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("นายสมชาย ดอนกลาง");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0815678901");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("นางสมหญิง ดอนกลาง");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0892345678");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill("จินตนา");

    const jintanaOption = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(jintanaOption).toBeVisible();
    await jintanaOption.click();

    await page.keyboard.press("Escape");
    await page.waitForSelector('[role="option"]', { state: "detached" });
  });

  /**
   * TC-ECMNT-01.23
   * กรอกข้อมูลไม่ครบถ้วน (ข้อมูลติดต่อและผู้ดูแล)
   */
  test("TC-ECMNT-01.23: Validate incomplete community information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    const communityPhone = page.getByRole("textbox", {
      name: "โทรศัพท์วิสาหกิจชุมชน *",
    });
    await communityPhone.clear();
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
  });

  /**
   * TC-ECMNT-01.24
   * กรอกข้อมูลเมนูแบบเลื่อนลง (Dropdown) ครบถ้วน (แบบ Modal)
   */
  test("TC-ECMNT-01.24: Edit community with complete community information", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("สมุนไพรดอนกลาง");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("เกษตรแปรรูป");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400098765");

    await page.getByRole("textbox", { name: "วว" }).fill("05");
    await page.getByRole("textbox", { name: "ดด" }).fill("03");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2564");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารออมสิน" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("9876543210");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill(
        "กลุ่มชาวบ้านรวมตัวกันนำสมุนไพรท้องถิ่นมาแปรรูปเป็นผลิตภัณฑ์สุขภาพ เพื่อเพิ่มมูลค่าและสร้างรายได้ให้กับชุมชน"
      );

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("แปรรูปสมุนไพรพื้นบ้าน");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill(
        "ผลิตและจำหน่ายผลิตภัณฑ์สมุนไพร เช่น ยาหม่อง น้ำมันสมุนไพร และชาสมุนไพร"
      );

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("45/1");
    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("3");

    const province = page.getByRole("combobox", { name: "จังหวัด *" });
    await province.click();
    await province.fill("อุบล");
    await page.getByRole("option", { name: "อุบลราชธานี" }).click();

    const district = page.getByRole("combobox", { name: "อำเภอ / เขต *" });
    await district.click();
    await district.fill("วาริน");
    await page.getByRole("option", { name: "วารินชำราบ" }).click();

    const subDistrict = page.getByRole("combobox", { name: "ตำบล/แขวง *" });
    await subDistrict.click();
    await subDistrict.fill("วารินชำราบ");
    await page.getByRole("option", { name: "วารินชำราบ" }).click();

    await expect(
      page.getByRole("textbox", { name: "รหัสไปรษณีย์ *" })
    ).toHaveValue("34190");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill(
        "ตั้งอยู่ในพื้นที่ชุมชนบ้านดอนกลาง ใกล้แปลงสมุนไพรและศูนย์เรียนรู้ชุมชน"
      );

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("15.244845");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("104.847299");

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill("045123456");

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill("dondangherb@gmail.com");

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://dondang-herb.community");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/dondangherb");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/R/ti/p/@dondangherb");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@dondangherb");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("นายสมชาย ดอนกลาง");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0815678901");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("นางสมหญิง ดอนกลาง");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0892345678");

    const caretaker = page.getByRole("combobox", { name: "ผู้ดูแล *" });
    await caretaker.click();

    const caretakerSearch = page.getByPlaceholder("เลือกผู้ดูแล");
    await caretakerSearch.fill("กมล");

    const caretakerOption = page.getByText("กมล เบอร์ลี่", { exact: true });
    await expect(caretakerOption).toBeVisible();
    await caretakerOption.click();

    await expect(caretaker).toHaveValue("กมล เบอร์ลี่");

    const memberDropdown = page.getByRole("combobox", { name: "สมาชิก" });
    await memberDropdown.click();

    const memberSearch = page.getByPlaceholder("ค้นหาสมาชิก");
    await memberSearch.fill("จินตนา");

    const jintanaOption = page.getByText("จินตนา จิรายุ", { exact: true });
    await expect(jintanaOption).toBeVisible();
    await jintanaOption.click();

    await page.keyboard.press("Escape");
    await page.waitForSelector('[role="option"]', { state: "detached" });

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
  });

  /**
   * TC-ECMNT-01.25
   * กรอกข้อมูลเมนูแบบเลื่อนลง (Dropdown) ไม่ครบถ้วน
   */
  test("TC-ECMNT-01.25: Validate incomplete dropdown inputs", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("สมุนไพรดอนกลาง");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("เกษตรแปรรูป");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400098765");

    await page.getByRole("textbox", { name: "วว" }).fill("05");
    await page.getByRole("textbox", { name: "ดด" }).fill("03");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2564");

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("9876543210");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill(
        "กลุ่มชาวบ้านรวมตัวกันนำสมุนไพรท้องถิ่นมาแปรรูปเป็นผลิตภัณฑ์สุขภาพ"
      );

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("แปรรูปสมุนไพรพื้นบ้าน");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill("ผลิตและจำหน่ายผลิตภัณฑ์สมุนไพร");

    await page.getByRole("button", { name: "ที่อยู่วิสาหกิจชุมชน" }).click();

    await page.getByRole("textbox", { name: "บ้านเลขที่ *" }).fill("45/1");
    await page.getByRole("spinbutton", { name: "หมู่ที่" }).fill("3");

    await page
      .getByRole("textbox", { name: "คำอธิบายที่อยู่" })
      .fill("ตั้งอยู่ในพื้นที่ชุมชนบ้านดอนกลาง");

    await page.getByRole("spinbutton", { name: "ละติจูด *" }).fill("15.244845");
    await page
      .getByRole("spinbutton", { name: "ลองจิจูด *" })
      .fill("104.847299");

    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill("045123456");

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill("dondangherb@gmail.com");

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://dondang-herb.community");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/dondangherb");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/@dondangherb");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@dondangherb");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("นายสมชาย ดอนกลาง");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0815678901");
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
  });

  /**
   * TC-ECMNT-01.26
   * บันทึกแก้ไขผู้ดูแลระบบ
   */
  test("TC-ECMNT-01.26: Cancel editing community via confirmation modal", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลชุมชน" }).click();

    await uploadCoverImage(page);
    await uploadLogoImage(page);

    await page
      .getByRole("textbox", { name: "ชื่อวิสาหกิจชุมชน *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", {
        name: "ชื่อย่อ / ชื่อเรียก / ชื่อท้องถิ่น (ถ้ามี)",
      })
      .fill("สมุนไพรดอนกลาง");

    await page
      .getByRole("textbox", { name: "ประเภทวิสาหกิจชุมชน *" })
      .fill("เกษตรแปรรูป");

    await page
      .getByRole("textbox", { name: "เลขทะเบียนวิสาหกิจชุมชน *" })
      .fill("3120400098765");

    await page.getByRole("textbox", { name: "วว" }).fill("05");
    await page.getByRole("textbox", { name: "ดด" }).fill("03");
    await page.getByRole("textbox", { name: "ปปปป" }).fill("2564");

    await page.getByRole("combobox", { name: "ชื่อธนาคาร *" }).click();
    await page.getByRole("option", { name: "ธนาคารออมสิน" }).click();

    await page
      .getByRole("textbox", { name: "ชื่อบัญชีธนาคาร *" })
      .fill("วิสาหกิจชุมชนแปรรูปสมุนไพรบ้านดอนกลาง");

    await page
      .getByRole("textbox", { name: "หมายเลขบัญชี *" })
      .fill("9876543210");

    await page
      .getByRole("textbox", { name: "ประวัติวิสาหกิจชุมชน *" })
      .fill(
        "กลุ่มชาวบ้านรวมตัวกันนำสมุนไพรท้องถิ่นมาแปรรูปเป็นผลิตภัณฑ์สุขภาพ เพื่อเพิ่มมูลค่าและสร้างรายได้ให้กับชุมชน"
      );

    await page
      .getByRole("textbox", { name: "ชื่อกิจกรรมหลัก *" })
      .fill("แปรรูปสมุนไพรพื้นบ้าน");

    await page
      .getByRole("textbox", { name: "รายละเอียดกิจกรรมหลัก *" })
      .fill(
        "ผลิตและจำหน่ายผลิตภัณฑ์สมุนไพร เช่น ยาหม่อง น้ำมันสมุนไพร และชาสมุนไพร"
      );
    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
  });

  /**
   * TC-ECMNT-01.27
   *  ยกเลิกการแก้ไขชุมชน;
   */
  test("TC-ECMNT-01.27: Cancel edit community and return to community list", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ข้อมูลติดต่อและผู้ดูแล" }).click();

    await page
      .getByRole("textbox", { name: "โทรศัพท์วิสาหกิจชุมชน *" })
      .fill("045123456");

    await page
      .getByRole("textbox", { name: "อีเมลวิสาหกิจชุมชน *" })
      .fill("dondangherb@gmail.com");

    await page
      .getByRole("textbox", { name: "Link Website" })
      .fill("https://dondang-herb.community");

    await page
      .getByRole("textbox", { name: "Link Facebook" })
      .fill("https://facebook.com/dondangherb");

    await page
      .getByRole("textbox", { name: "Link Line" })
      .fill("https://line.me/R/ti/p/@dondangherb");

    await page
      .getByRole("textbox", { name: "Link Tiktok" })
      .fill("https://tiktok.com/@dondangherb");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ดูแลหลัก *" })
      .fill("นายสมชาย ดอนกลาง");

    await page.getByRole("textbox", { name: "โทรศัพท์ *" }).fill("0815678901");

    await page
      .getByRole("textbox", { name: "ชื่อผู้ประสานงาน" })
      .fill("นางสมหญิง ดอนกลาง");

    await page
      .getByPlaceholder("กรอกเบอร์โทรศัพท์ของผู้ประสานงาน")
      .fill("0892345678");

    await page.getByRole("button", { name: "ยกเลิก" }).click();
    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/\/super\/communities\/?$/);
  });

  /**
   * TC-ECMNT-01.28
   *  ยกเลิกการแก้ไขชุมชน;
   */
  test("TC-ECMNT-01.28: Cancel edit community and return to community list", async ({
    page,
  }) => {
    await goToPageEditCommunity(page);
    await page.getByRole("button", { name: "ยกเลิก" }).click();
    const confirmDialog = page.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/\/super\/communities\/?$/);
  });

  /**
   * TC-ECMNT-01.29
   * เปิดสถานะชุมชน
   */
  test("TC-ECMNT-01.29: Enable community status", async ({ page }) => {
    await goToPageEditCommunity(page);

    let statusToggle = page.getByRole("switch");

    if ((await statusToggle.count()) === 0) {
      statusToggle = page.locator('input[type="checkbox"]').first();
    }

    await expect(statusToggle).toBeVisible();

    if (!(await statusToggle.isChecked())) {
      await statusToggle.click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
  });

  /**
   * TC-ECMNT-01.30
   * ปิดสถานะชุมชน
   */
  test("TC-ECMNT-01.30: Disable community status", async ({ page }) => {
    await goToPageEditCommunity(page);
    let statusToggle = page.getByRole("switch");
    if ((await statusToggle.count()) === 0) {
      statusToggle = page.locator('input[type="checkbox"]').first();
    }

    await expect(statusToggle).toBeVisible();
    if (await statusToggle.isChecked()) {
      await statusToggle.click();
    }

    await page.getByRole("button", { name: "บันทึก" }).click();

    const confirmModal = page.getByRole("dialog");
    await expect(confirmModal).toBeVisible();
    await confirmModal.getByRole("button", { name: "ยืนยัน" }).click();
    await expect(page).toHaveURL(/super\/communities\/all/);
  });
});
