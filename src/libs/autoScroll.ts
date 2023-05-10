import { Page } from "puppeteer";

export default async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= 5000) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  });
}
