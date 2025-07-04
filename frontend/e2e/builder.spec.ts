import { test, expect } from "@playwright/test";

const drag = async (page, source, target, pos) => {
  const box = await source.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const tbox = await target.boundingBox();
  await page.mouse.move(
    tbox.x + (pos?.x || tbox.width / 2),
    tbox.y + (pos?.y || tbox.height / 2),
  );
  await page.mouse.up();
};

test("add, connect, save and reload workflow", async ({ page }) => {
  let saved: any = null;
  await page.route("**/api/workflows/save", async (route, request) => {
    saved = await request.postDataJSON();
    await route.fulfill({ status: 200, body: JSON.stringify({ id: "123" }) });
  });
  await page.route("**/api/workflows/123", async (route) => {
    await route.fulfill({ status: 200, body: JSON.stringify(saved) });
  });
  await page.route("**/api/workflows/list", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([{ id: "123", name: "workflow-123" }]),
    });
  });

  await page.goto("/builder");
  await page.evaluate(() => {
    window.prompt = () => "workflow-123";
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

  const trigger = page.locator("aside >> text=Trigger");
  const action = page.locator("aside >> text=Action");
  const canvas = page.locator("main");

  await expect(trigger).toBeVisible();
  await expect(action).toBeVisible();

  await trigger.dragTo(canvas, { targetPosition: { x: 200, y: 200 } });
  await action.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });

  const source = page.locator(
    ".react-flow__node-trigger .react-flow__handle.source",
  );
  const target = page.locator(
    ".react-flow__node-action .react-flow__handle.target",
  );
  await drag(page, source, target);

  await page.getByText("Save").click();
  await page.reload();
  await page.waitForSelector("select");
  await page.locator("select").selectOption("123");
  await page.getByText("Load").click();

  await expect(page.locator(".react-flow__node")).toHaveCount(2);
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(1);
});
