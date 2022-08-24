import type { NextApiRequest, NextApiResponse } from "next";
import { launchChromium } from "playwright-aws-lambda";
import type { ChromiumBrowser } from "playwright-core";
import z from "zod";

const cookieNames = <const>["campus-twins", "JSESSIONID"];
type Data = Record<typeof cookieNames[number], string>;
type Err = {
  message: string;
};

const LOGIN_URL = "https://twins.tsukuba.ac.jp/campusweb/campussmart.do";
const LOGINED_URL =
  "https://twins.tsukuba.ac.jp/campusweb/campussmart.do?page=main";
const LOGIN_SCHEME = z.object({
  username: z.string(),
  password: z.string(),
});
const LOGIN_SELECTOR: typeof LOGIN_SCHEME._type = {
  username: "#LoginFormSimple input[type=text]",
  password: "#LoginFormSimple input[type=password]",
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
      page.click("button[type=submit]"),
    ]);
    await page.waitForURL(LOGINED_URL);
    const cookies = await context.cookies();

    const data = cookieNames.reduce<Data>((acc, name) => {
      const cookie = cookies.find((cookie) => cookie.name === name);
      if (!cookie) throw new Error(`Cookie ${name} not found`);
      return { ...acc, [name]: cookie.value };
    }, {} as Data);

    res.status(200).json(data);
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
