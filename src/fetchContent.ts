import autoScroll from "./autoScroll";
import { DataItem } from "./index.d";
import puppeteer, { Browser, Page } from "puppeteer";

const baseUrl = "https://toutiao.com/";

let browser: Browser;
let page: Page;

async function initBorwser() {
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

  await page.goto(baseUrl);
  await page.waitForSelector(".feed-card-wrapper", {
    visible: true,
    timeout: 3000,
  });
}

async function fetchData () {
  await autoScroll(page);
  return await page.evaluate(async () => {
    let list: DataItem[] = [];
    document.querySelectorAll(".feed-card-wrapper").forEach((item) => {
      if (item.classList.contains("sticky-cell")) {
        return;
      }
      const itemText = item.querySelector(".title");
      if (itemText && itemText.innerHTML.length > 0) {
        list.push({
          title:
            itemText.innerHTML.length > 20
              ? itemText.innerHTML.slice(0, 20) + "..."
              : itemText.innerHTML,
          src: itemText.getAttribute("href") || "",
          desc: itemText.innerHTML || "暂无描述",
        });
      }
    });
    return list;
  });
}

export default async function () {
  if (browser === undefined) {
    await initBorwser();
    return await fetchData();
  } else {
    return await fetchData();
  }
}
