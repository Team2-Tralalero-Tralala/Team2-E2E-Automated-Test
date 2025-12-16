/**
 * ฟังก์ชัน safeGoto
 * ใช้สำหรับเปลี่ยนหน้าไปยัง URL ที่กำหนด
 * รองรับทั้งกรณีที่เป็น full URL และ relative path
 *
 * @param {Page} page - Playwright page object
 * @param {string} path - URL เต็ม หรือ path 
 */
export async function safeGoto(page, path) {
  const url = path.startsWith("http")
    ? path
    : `${process.env.PLAYWRIGHT_BASE_URL}${path}`;

  await page.evaluate((url) => {
    window.location.href = url;
  }, url);
}
