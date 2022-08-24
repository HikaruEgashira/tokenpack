import type { NextApiRequest, NextApiResponse } from "next";
import { launchChromium } from "playwright-aws-lambda";
import type { ChromiumBrowser } from "playwright-core";

type Err = {
  message: string;
};
type Data = {
  title: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Err | Data>
) {
  let browser: ChromiumBrowser = null!;

  try {
    browser = await launchChromium();
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto(req.query.url?.toString() || "https://example.com");

    const title = await page.title();
    res.status(200).json({ title });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
