import { test, expect } from "@playwright/test";
import { loginAs } from "../../utils/roles.js";

/**
 * goToCreatePackagePage - Navigates to the Create Package page
 */
async function goToCreatePackagePage(page) {
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

  if (data.accommodation) {
    await page.getByPlaceholder("ค้นหาชื่อที่พัก").fill(data.accommodation);
  }

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

test.describe("Member - create packages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "member");
    await goToCreatePackagePage(page);
  });

  /**
   * TS-PACKAGE-MEMBER-02.1: ทดสอบกรอกข้อมูลครบถ้วนและกด “บันทึก” เพื่อสร้างแพ็กเกจ
   */
  test("TS-PACKAGE-MEMBER-02.1: ทดสอบกรอกข้อมูลครบถ้วนและกด “บันทึก” เพื่อสร้างแพ็กเกจ", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "ฉบับร่าง" }).click();
    await page.getByRole("button", { name: "เผยแพร่" }).nth(1).click();

    const fullData = {
      name: "แพ็กเกจสมบูรณ์",
      description: "แพ็กเกจสมบูรณ์",
      price: "3500",
      houseNumber: "99",
      villageNumber: "5",
      province: "เชียงใหม่",
      district: "เมืองเชียงใหม่",
      subDistrict: "สุเทพ",
      addressDetail: "วิวสวย",
      latitude: "18.796143",
      longitude: "98.979263",
      capacity: "5",
      facility: "ห้องน้ำส่วนตัว",
      startDate: "01/02/2569",
      startTime: "10:00",
      endDate: "05/02/2569",
      endTime: "14:00",
      openDate: "15/01/2569",
      openTime: "08:00",
      closeDate: "30/01/2569",
      closeTime: "22:00",
      tags: ["ธรรมชาติ", "ภูเขา"],
      coverImage: {
        name: "cover.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("this is a test image"), // Dummy content
      },
      images: [
        {
          name: "img1.jpg",
          mimeType: "image/jpeg",
          buffer: Buffer.from("img1"),
        },
        {
          name: "img2.jpg",
          mimeType: "image/jpeg",
          buffer: Buffer.from("img2"),
        },
      ],
      videos: [
        {
          name: "vid1.mp4",
          mimeType: "video/mp4",
          buffer: Buffer.from("vid1"),
        },
      ],
    };

    await fillPackageForm(page, fullData);

    await page.getByRole("button", { name: "สร้างแพ็กเกจ" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /ยืนยัน/i })
      .click();

    await expect(page.getByText("Hello")).toBeVisible();
    await page.goto("/member/packages/all");
    await expect(page).toHaveURL(/member\/packages\/all/);

    await expect(page.getByRole("row", { name: fullData.name })).toBeVisible();
  });
});
