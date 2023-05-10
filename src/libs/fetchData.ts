import autoScroll from "./autoScroll";
import { DataItem } from "../index.d";
import puppeteer, { Browser, Page } from "puppeteer";

const baseUrl = "https://toutiao.com/";

let browser: Browser;
let homePage: Page;
let contentPage: Page;

async function initBorwser() {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      isMobile: true
    },
    dumpio: false,
  });
  homePage = await browser.newPage();
  contentPage = await browser.newPage();

  await homePage.goto(baseUrl);
  await homePage.waitForSelector(".feed-card-article-wrapper");
}

// 获取列表数据
async function getListData () {
  await autoScroll(homePage);
  return await homePage.evaluate(async () => {
    let list: DataItem[] = [];
    document.querySelectorAll(".feed-card-article-wrapper").forEach((item) => {
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

// 初始化获取列表
export async function fetchListData() {
  if (browser === undefined) {
    await initBorwser();
    return await getListData();
  } else {
    return await getListData();
  }
}

// 获取内容
export async function fetchContent(url: string) {
  await contentPage.goto(url);
  await contentPage.waitForSelector(".article-content");
  return await contentPage.evaluate(async () => {
    const dom = document.querySelector(".article-content");
    let string = '##### ' + dom?.innerHTML.replace(/<[^>]+>/g, "");
    return string || "暂无内容";
  });
}

// 获取评论
export async function fetchComment(url: string) {
  await contentPage.goto(url);
  await contentPage.waitForSelector(".side-drawer-btn");
  // 点击评论按钮
  await contentPage.click(".side-drawer-btn");
  await contentPage.waitForSelector(".comment-list");
  return await contentPage.evaluate(async () => {
    const dom = document.querySelectorAll(".comment-list li");
    let string = '';
    dom.forEach((item) => {
      const name = item.querySelector(".name");
      const content = item.querySelector(".content");
      if (name && content) {
        string += `##### **${name.innerHTML}**：${content.innerHTML.replace(/<[^>]+>/g, "")}\n\n`;
      }
    });
    return string || "暂无评论";
  });
}

// 完成登录
export async function checkLoginState() {
  await homePage.waitForSelector(".user-icon");
}

// 获取登录二维码
export async function fetchLoginQrCode() {
  await homePage.waitForSelector(".login-button");
  await homePage.click(".login-button");
  await homePage.waitForSelector(".web-login-scan-code__content__qrcode-wrapper__qrcode");
  return await homePage.evaluate(async () => {
    const dom = document.querySelector(
      ".web-login-scan-code__content__qrcode-wrapper__qrcode"
    );
    return dom?.getAttribute("src") || "";
  });
}
