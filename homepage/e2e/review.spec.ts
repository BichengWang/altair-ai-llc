import { expect, test } from "@playwright/test";

test("review workspace uploads a docx and asks the agent about the selected clause", async ({
  page,
}) => {
  await page.route("https://api.openai.com/v1/chat/completions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        choices: [
          {
            message: {
              content:
                "The selected excerpt gives the customer a 30-day termination option.",
            },
          },
        ],
      }),
    });
  });

  await page.goto("/review");

  await page.getByLabel("Upload a DOCX file").setInputFiles(
    new URL("./fixtures/review-sample.docx", import.meta.url).pathname
  );

  const targetText = page.getByText(
    /customer may terminate this agreement upon 30 days written notice\./i
  );

  await expect(targetText).toBeVisible();

  const box = await targetText.boundingBox();

  if (!box) {
    throw new Error("Unable to determine selection target bounds");
  }

  await page.mouse.move(box.x + 6, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 6, box.y + box.height / 2, {
    steps: 12,
  });
  await page.mouse.up();

  await expect(
    page.getByText("Highlighted excerpt", { exact: true })
  ).toBeVisible();
  await page
    .getByLabel("Ask about the selected clause")
    .fill("What right does the customer have?");
  await expect(page.getByRole("button", { name: /ask agent/i })).toBeEnabled();
  await page.getByRole("button", { name: /ask agent/i }).click();

  await expect(
    page.getByText(/30-day termination option/i)
  ).toBeVisible();
});
