/*
Step 0: download geckodriver from
https://github.com/mozilla/geckodriver/releases/ and put it in your path (e.g.,
this directory).

Step 1: create or edit `PRIVATE.js` to include fields. See `PRIVATE_example.js`
for required fields.

Step 2: run
```
$ node index.js
```
and make a note of rows missing audio by searching output for "Uploaded 0 audio
files for:".

Step 3: perhaps using `makeAudio.sh` and AWS Polly, create audio.

Step 4: rerun `node index.js` to upload audio.
*/

const {Builder, By, Key, until} = require('selenium-webdriver');
const {url, user, passwd, mp3paths} = require('./PRIVATE');
const {existsSync} = require('fs');
const {join} = require('path');
const fetch = require('node-fetch');
const {writeFile} = require('fs');
const {promisify} = require('util');
const writeFilePromise = promisify(writeFile);
const mkdirp = require('mkdirp');

const CONTENT_DIR = 'downloaded-content';
mkdirp.sync(CONTENT_DIR);

/**
 * Download a URL, then dump to a file.
 * @param {String} url
 * @param {String} outputPath
 */
function downloadFile(url, outputPath) {
  return fetch(url).then(x => x.arrayBuffer()).then(x => writeFilePromise(outputPath, Buffer.from(x)));
}

/**
 * Convert a string to a stringy slug (using alphanumeric, dashes, underscores, and dots only).
 * @param {String} s string to make a slug
 */
function slugify(s) { return s.replace(/[^-_.a-zA-Z0-9]+/g, '-'); }

const toDownloadPath = f => join(CONTENT_DIR, f);
const downloadUrls = urls => Promise.all(urls.map(
    url => existsSync(toDownloadPath(slugify(url))) ? false : downloadFile(url, toDownloadPath(slugify(url)))));

(async function memrise() {
  let driver = await new Builder().forBrowser('firefox').build();
  try {
    await driver.get('https://www.memrise.com/login/');
    await driver.findElement(By.name('username')).sendKeys(user);
    await driver.findElement(By.name('password')).sendKeys(passwd, Key.RETURN);
    await driver.wait(until.titleIs('Dashboard - Memrise'), 20000);
    await driver.get(url);
    await driver.executeScript(
        `Array.from(document.getElementsByClassName('show-hide btn btn-small')).forEach(x => x.click())`);
    await driver.sleep(4000);

    let levels = await driver.findElements(By.css('div.level[data-level-id]'));
    for (let level of levels) {
      let levelTitle = await (level.findElement(By.css('div.level-header h3.level-name')).then(n => n.getText()));
      console.log(JSON.stringify({levelTitle}));

      let trs = await level.findElements(By.css('tr.thing'));
      for (let tr of trs) {
        let kana = await (tr.findElement(By.css('td.text.column[data-key="1"]')).then(n => n.getText()));
        let english = await (tr.findElement(By.css('td.text.column[data-key="2"]')).then(n => n.getText()));
        let pos = await (tr.findElement(By.css('td.text.attribute')).then(n => n.getText()));
        let kanji = await (tr.findElement(By.css('td.text.column[data-key="4"]')).then(n => n.getText()));

        // Audio
        let aud = await tr.findElement(By.css('td.audio[data-key]'));
        let players = await aud.findElements(By.css('a.audio-player[data-url]'));
        let audioUrls = await Promise.all(players.map(a => a.getAttribute('data-url')));
        await downloadUrls(audioUrls);
        if (audioUrls.length === 0) {
          let basefname = `${kana}.mp3`; // TODO FIXME: missing kana, repeated kana, etc.?
          let toUpload = mp3paths.map(p => join(p, basefname)).filter(existsSync);
          if (toUpload.length > 0) {
            numAudioed++;
            for (let s of toUpload) {
              let input = await tr.findElement(By.css('td.audio[data-key] div.files-add input'));
              await input.sendKeys(s);
              await driver.sleep(2000);
            }
          }
          console.log(`DEBUG: Uploaded ${toUpload.length} audio files for: ${kana}`);
        }

        // Images
        let imgs = await tr.findElements(By.css('td.image[data-key] div.images img.thing-img[data-url]'));
        let imgUrls = await Promise.all(imgs.map(img => img.getAttribute('data-url')));
        await downloadUrls(imgUrls);
        console.log(JSON.stringify({kana, english, kanji, pos, audio: audioUrls, img: imgUrls}));
      }
    }
  } finally {
    await driver.get('https://www.memrise.com/logout');
    await driver.quit();
  }
})()