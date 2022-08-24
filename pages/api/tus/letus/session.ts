import type { NextApiRequest, NextApiResponse } from "next";
import { launchChromium } from "playwright-aws-lambda";
import type { ChromiumBrowser } from "playwright-core";
import z from "zod";

type Err = {
  message: string;
};
type Data = {
  session_token: string;
};

const LOGIN_URL = "https://letus.ed.tus.ac.jp/";
const LOGIN_SCHEME = z.object({
  username: z.string(),
  password: z.string(),
});
const LOGIN_SELECTOR: typeof LOGIN_SCHEME._type = {
  username: "#login_username",
  password: "#login_password",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Err | Data>
) {
  let browser: ChromiumBrowser = null!;
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const params = LOGIN_SCHEME.parse(req.body);

    browser = await launchChromium({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(LOGIN_URL);
    await page.fill(LOGIN_SELECTOR.username, params.username);
    await page.fill(LOGIN_SELECTOR.password, params.password);
    await Promise.all([
      page.waitForNavigation(),
      page.click("input[type=submit]"),
    ]);
    const cookies = await context.cookies();

    const sessionToken = cookies.find(
      (cookie) => cookie.name === "MoodleSession2022"
    )?.value;
    if (!sessionToken) {
      res.status(401).json({ message: "Invalid username or password" });
      return;
    }

    res.status(200).json({ session_token: sessionToken });
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
