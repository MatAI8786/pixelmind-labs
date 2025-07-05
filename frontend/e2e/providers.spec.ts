import { test, expect } from "@playwright/test";

const drag = async (page, source, target) => {
  const box = await source.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const tbox = await target.boundingBox();
  await page.mouse.move(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
  await page.mouse.up();
};

test("LLM to Input workflow persists and provider test works", async ({
  page,
}) => {
  let saved: any = null;
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  await page.route("**/api/workflows/save", async (route, request) => {
    saved = await request.postDataJSON();
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "1" }),
    });
  });
  await page.route("**/api/workflows/1", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify(saved),
    });
  });
  await page.route("**/api/workflows/list", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify([{ id: "1", name: "e2e" }]),
    });
  });

  await page.route("**/api/providers", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    window.prompt = () => "e2e";
    document.querySelectorAll("[draggable]").forEach((el: Element) => {
      el.addEventListener("dragstart", (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (dt)
          dt.setData(
            "application/reactflow",
            el.textContent!.trim().toLowerCase(),
          );
      });
    });
  });

  const llm = page.locator("aside >> text=LLM");
  const input = page.locator("aside >> text=Input");
  const canvas = page.locator("main");

  await expect(llm).toBeVisible();
  await expect(input).toBeVisible();

  await llm.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });
  await page.getByRole('button', { name: '×' }).click();
  await input.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
  await page.getByRole('button', { name: '×' }).click();

  const source = page.locator(
    ".react-flow__node-llm .react-flow__handle.source",
  );
  const target = page.locator(
    ".react-flow__node-input .react-flow__handle.target",
  );
  await drag(page, source, target);

  await page.getByRole("button", { name: "Save Workflow" }).click();
  await expect(page.getByText("Saved")).toBeVisible();

  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.getByRole('button', { name: 'Workflows' }).click();
  await page.getByRole('button', { name: 'e2e' }).click();
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(1);

  await page.goto("/settings");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/settings$/);
});
