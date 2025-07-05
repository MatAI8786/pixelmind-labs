import { test, expect } from "@playwright/test";

test("Save workflow pops success toast", async ({ page }) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  await page.route("**/api/workflows/save", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "toast" }),
    });
  });
  await page.route("**/api/workflows/list", (route) =>
    route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: "[]",
    }),
  );

  await page.goto("http://localhost:3000");
  await page.evaluate(() => {
    window.prompt = () => "toast-e2e";
  });

  await page.getByRole("button", { name: "Save Workflow" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 10000 });
});
