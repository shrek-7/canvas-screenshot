
const puppeteerLambda = require('puppeteer-lambda');
const fs = require('fs');
const next_iteration = require('./index');
let page = null; 
let browser=null;
let iterator = 0;



exports.generateScreenshot = async function generateScreenshot (config, dashboard_name, initialize) {
  // create a separate folder for each dashboard by their dashboard name.
  fs.mkdir('screenshots/'+dashboard_name, { recursive: true }, (err) => {
    if (err) throw err;
  });


  await getPage(config.BASE_URL);

  let QUERY_SELECTOR_LIST = config.query_selector_list;

  if(!QUERY_SELECTOR_LIST.length){ // when there is only one screen and nothing to click.
    
    let image_path = `screenshots/${dashboard_name}/${dashboard_name}.png`;
    await page.screenshot({path: image_path});

  } else {
    
    for (let index = 0; index < QUERY_SELECTOR_LIST.length; index++) {
      await getScreenshot(QUERY_SELECTOR_LIST[index], dashboard_name);
    }

  }
  await browser.close();
  if(initialize){ // called only for first time.
    next_iteration.init(++iterator);
  }
}


  async function getScreenshot (selector, dashboard_name) {
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
  let image_path = `screenshots/${dashboard_name}/widget_${selector}.png`;
  await page.screenshot({path: image_path,
    clip: {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
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
