import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToCreatePackagePage - Navigates to the Create Package page
 */
async function goToCreatePackagePage(page) {
  // Navigate to Manage Packages first
  await page.getByRole("link", { name: "จัดการแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/member\/packages\/all/);
  await page.getByRole("button", { name: "เพิ่มแพ็กเกจ" }).click();
  await expect(page).toHaveURL(/member\/package\/create/);
}

/**
 * fillPackageForm - Fills the package creation form
 */
async function fillPackageForm(page, data) {
  if (data.name) await page.locator("#name").fill(data.name);

  if (data.description)
    await page.locator("#description").fill(data.description);

  if (data.houseNumber)
    await page.locator("#houseNumber").fill(data.houseNumber);
  if (data.villageNumber)
    await page.locator("#villageNumber").fill(data.villageNumber);

  if (data.province) {
    await page.locator("#province").fill(data.province);
    await page.getByRole("option").first().waitFor();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  if (data.district) {
    const districtInput = page.locator("#district");
    await expect(districtInput).toBeEnabled({ timeout: 15000 });
    await districtInput.fill(data.district);
    await page.getByRole("option").first().waitFor();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  if (data.subDistrict) {
    const subDistrictInput = page.locator("#subDistrict");
    await expect(subDistrictInput).toBeEnabled({ timeout: 15000 });
    await subDistrictInput.fill(data.subDistrict);
    await page.getByRole("option").first().waitFor();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }

  if (data.addressDetail)
    await page.locator("#addressDetail").fill(data.addressDetail);
  if (data.latitude) await page.locator("#latitude").fill(data.latitude);
  if (data.longitude) await page.locator("#longitude").fill(data.longitude);

  if (data.capacity) await page.locator("#capacity").fill(data.capacity);
  if (data.facility) await page.locator("#facility").fill(data.facility);

  const fillDate = async (id, dateStr) => {
    const [d, m, y] = dateStr.split("/");
    const group = page.locator(`#${id}`);
    await group.locator("input[placeholder='วว']").fill(d);
    await group.locator("input[placeholder='ดด']").fill(m);
    await group.locator("input[placeholder='ปปปป']").fill(y);
  };

  if (data.startDate) await fillDate("startDate", data.startDate);
  if (data.endDate) await fillDate("endDate", data.endDate);
  if (data.openDate) await fillDate("openDate", data.openDate);
  if (data.closeDate) await fillDate("closeDate", data.closeDate);

  const fillTime = async (labelKeyword, timeStr) => {
    const [h, m] = timeStr.split(":");

    const wrapper = page
      .locator("div")
      .filter({ hasText: new RegExp(labelKeyword) })
      .filter({ has: page.getByPlaceholder("ชม.") })
      .last();

    if (await wrapper.isVisible()) {
      await wrapper.getByPlaceholder("ชม.").fill(h);
      await wrapper.getByPlaceholder("นาที").fill(m);
    } else {
      console.warn(
        `Time input wrapper for "${labelKeyword}" not found or visible.`
      );
    }
  };

  if (data.startTime) await fillTime("เวลาที่เริ่ม", data.startTime);
  if (data.endTime) await fillTime("เวลาที่สิ้นสุด", data.endTime);
  if (data.openTime) await fillTime("เวลาที่เปิดจอง", data.openTime);
  if (data.closeTime) await fillTime("เวลาที่ปิดจอง", data.closeTime);

  if (data.tags) {
    const tags = Array.isArray(data.tags) ? data.tags : [data.tags];
    for (const tag of tags) {
      await page.locator("#tag-selector").fill(tag);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }
  }

  if (data.price) await page.locator("#price").fill(data.price.toString());

  // Files
  if (data.coverImage) {
    const section = page
      .locator("div")
      .filter({ hasText: /^อัพโหลดภาพหน้าปก/ })
      .last();
    await section.locator("input[type='file']").setInputFiles(data.coverImage);
  }
  if (data.images) {
    const section = page
      .locator("div")
      .filter({ hasText: /^อัพโหลดรูปภาพเพิ่มเติม/ })
      .last();
    await section.locator("input[type='file']").setInputFiles(data.images);
  }
  if (data.videos) {
    const section = page
      .locator("div")
      .filter({ hasText: /^อัพโหลดวิดีโอเพิ่มเติม/ })
      .last();
    await section.locator("input[type='file']").setInputFiles(data.videos);
  }
}

test.describe("Member - ตรวจสอบการแสดงข้อความเตือนเมื่อกรอกไม่ครบ", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await goToCreatePackagePage(page);
  });

  /**
   * TS-PACKAGE-MEMBER-03.1: ทดสอบกรอกข้อมูลไม่ครบแล้วกด “บันทึก”
   */
  test("TS-PACKAGE-MEMBER-03.1: ทดสอบกรอกข้อมูลไม่ครบแล้วกด “บันทึก”", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "ฉบับร่าง" }).click();
    await page.getByRole("button", { name: "เผยแพร่" }).nth(1).click();
    const partialData = {
      name: "แพ็กเกจไม่สมบูรณ์",
    };
    await fillPackageForm(page, partialData);

    await page.getByRole("button", { name: "สร้างแพ็กเกจ" }).click();

    await expect(page.getByText("กรุณากรอกข้อมูลให้ครบถ้วน")).toBeVisible();
  });
});
