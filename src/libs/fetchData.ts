import autoScroll from "./autoScroll";
import { DataItem } from "../index.d";
import puppeteer, { Browser, Page } from "puppeteer";

const baseUrl = "https://toutiao.com/";

let browser: Browser;
let listPage: Page;
let contentPage: Page;

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
  listPage = await browser.newPage();
  contentPage = await browser.newPage();

  await listPage.evaluate(
    "() =>{Object.defineProperties(navigator,{webdriver:{get: () => false}})}"
  );
  await contentPage.evaluate(
    "() =>{Object.defineProperties(navigator,{webdriver:{get: () => false}})}"
  );
  await listPage.goto(baseUrl);
  await listPage.waitForSelector(".feed-card-wrapper", {
    visible: true,
    timeout: 3000,
  });
}

async function getListData () {
  await autoScroll(listPage);
  return await listPage.evaluate(async () => {
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

export async function fetchListData() {
  if (browser === undefined) {
    await initBorwser();
    return await getListData();
  } else {
    return await getListData();
  }
}

export async function fetchContent(url: string) {
  await contentPage.goto(url);
  await contentPage.waitForSelector(".article-content", {
    visible: true,
    timeout: 3000,
  });
  return await contentPage.evaluate(async () => {
    const dom = document.querySelector(".article-content");
    let string = '###### ' + dom?.innerHTML.replace(/<[^>]+>/g, "");
    return string || "暂无内容";
  });
}
