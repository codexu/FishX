import { DataItem } from "./index.d";
import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser;
let page: Page;

async function initBorwser(url: string) {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
    dumpio: false,
  });
  page = await browser.newPage();

  await page.evaluate(
    "() =>{Object.defineProperties(navigator,{webdriver:{get: () => false}})}"
  );
}

export async function fetchData(url: string) {
  await page.goto(url);
  await page.waitForSelector(".article-content", {
    visible: true,
    timeout: 3000,
  });
  return await page.evaluate(async () => {
    const htmlString =  document.querySelector(".article-content");
    // 将html 转换为字符串，去掉标签
    const html = htmlString?.innerHTML.replace(/<[^>]+>/g, "") || '加载失败';
    return html;
  });
}

export default async function (url: string) {
  if (browser === undefined) {
    await initBorwser(url);
    return await fetchData(url);
  } else {
    return await fetchData(url);
  }
}
