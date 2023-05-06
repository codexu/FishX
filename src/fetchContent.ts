import { DataItem } from "./index.d";

const puppeteer = require("puppeteer");

const baseUrl = "https://toutiao.com/";

let browser, page;

export default async function () {
  browser = await puppeteer.launch({
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

  await page.goto(baseUrl);

  await page.waitForSelector(".feed-card-wrapper", {
    visible: true,
    timeout: 3000,
  });

  return await page.evaluate(() => {
    let list: DataItem[] = [];
    document.querySelectorAll(".feed-card-wrapper").forEach((item) => {
      const itemText = item.querySelector(".title");
      if (itemText && itemText.innerHTML.length > 0) {
        list.push({
          title:
            itemText.innerHTML.length > 20
              ? itemText.innerHTML.slice(0, 20) + "..."
              : itemText.innerHTML,
          src: itemText.getAttribute("href") || "",
        });
      }
    });
    return list;
  });
}
