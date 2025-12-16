# Team2-E2E-Automated-Test

🧪 Playwright – End-to-End Testing
This project uses Playwright for End-to-End (E2E) testing to ensure the system works correctly across real browser environments, including Chromium

📦 Playwright Installation
npm install
npx playwright install

# Common Playwright Commands
  Run all tests
  - npx playwright test

  Run tests in UI mode
  - npx playwright test --ui

  Run a specific test file
  - npx playwright test tests/login.spec.ts

  Re-run only failed tests
  - npx playwright test --last-failed

  View HTML test report
  - npx playwright show-report
  
  Run a specific test file with visible browser
  - npx playwright test tests/login.spec.ts --headed
  
  Run all tests with visible browser
  - npx playwright test --headed

  Run tests slowly to observe actions clearly
  - npx playwright test tests/login.spec.ts --headed --slow-mo=500

# Test File Naming (Scenario ID)
Test files are named using the Scenario ID, making the test scope immediately clear from the file name.
  
  Format : <scenario-id>.spec.ts
  Examples : TS-Login-01.spec.ts

# Test Case Structure Within a Scenario File
Inside each scenario file, multiple test cases are defined to cover different paths or conditions of the same scenario.
Each test case includes a unique sub-ID for clear identification.

  Example : 
  test.describe("TS-Login-01: User Login Scenario", () => {
  
  test("TS-Login-01.1: User login successfully", async ({ page }) => {
    // test steps
  });

  test("TS-Login-01.2: Login with invalid password", async ({ page }) => {
    // test steps
  });
});
