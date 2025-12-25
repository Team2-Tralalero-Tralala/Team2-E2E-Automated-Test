import { safeGoto } from "../../utils/safeGoto.js";

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[placeholder="ป้อนชื่ออีเมล"]');
    this.passwordInput = page.locator('input[placeholder="ป้อนรหัสผ่าน"]');
    this.submitBtn = page.locator('button:has-text("เข้าสู่ระบบ")');
  }

  async goto(path) {
    await safeGoto(this.page, path);
    await this.emailInput.waitFor({
      state: "visible",
      timeout: 30000,
    });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }
}
