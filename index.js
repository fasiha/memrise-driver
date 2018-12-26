/*
Step 0: download geckodriver from
https://github.com/mozilla/geckodriver/releases/ and put it in your path (e.g.,
this directory).
*/

const {Builder, By, Key, until} = require('selenium-webdriver');
const {url, user, passwd} = require('./PRIVATE');

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
    await driver.get('http://www.google.com/ncr');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    await driver.quit();
  }
});

(async function memrise() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
    await driver.get('https://www.memrise.com/login/');
    await driver.findElement(By.name('username')).sendKeys(user);
    await driver.findElement(By.name('password')).sendKeys(passwd, Key.RETURN);
    await driver.wait(until.titleIs('Dashboard - Memrise'), 20000);
    await driver.get(url);
    // await driver.executeScript('alert("hi")');
    await driver.executeScript(
        `Array.from(document.getElementsByClassName('show-hide btn btn-small')).forEach(x => x.click())`);
    await driver.sleep(4000);

    let trs = await driver.findElements(By.css('tr.thing'));
    for (let tr of trs) {
      let aud = await tr.findElement(By.css('td.audio[data-key]'));
      let text = await aud.getText();
      if (text.includes('no audio')) {
        let kana = await tr.findElement(By.css('td.text[data-key="1"]'));
        console.log('no audio for:', await kana.getText());
      }
    }

  } finally {
    await driver.get('https://www.memrise.com/logout');
    await driver.quit();
  }
})()