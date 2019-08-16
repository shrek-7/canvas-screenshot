
const puppeteerLambda = require('puppeteer-lambda');
let page = null; 
let browser=null;

const QUERY_SELECTOR_LIST = [
  'complianceCategories',
  'assetsDeprecated',
  'assetLifecycle',
  'businessCriticality',
  'assetCategory',
  'ownership'
]

const URL = 'http://localhost:3002/assets';

async function init () {
  await getPage(URL);

  for (let index = 0; index < QUERY_SELECTOR_LIST.length; index++) {
    await getScreenshot(QUERY_SELECTOR_LIST[index]);
  }
  await browser.close();
}

async function getScreenshot (selector, padding = 0) {
  let query = '.'+selector;
  await page.click(query); // CLick on each widget
  await page.waitFor(1000); // Wait for the graph to get loaded.

  // Calculate the widget coordinates.
  const rect = await page.evaluate(query => {
    const element = document.querySelector(query);
    const {x, y, width, height} = element.getBoundingClientRect();
    return {left: x, top: y, width, height, id: element.id};
  }, query);

  // take screenshot based on the coordinates.
  await page.screenshot({path: 'screenshots/' +'widget_'+ selector + '.png',
    clip: {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width,
      height: rect.height + padding * 2
    }
  });
}


async function getPage(url) {
  browser = await puppeteerLambda.getBrowser({
    headless: true,
    defaultViewport: {
      width: 1400,
      height: 1000,
      isLandscape: true
    }
    });
  page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
}

init();
