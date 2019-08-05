"use strict";
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
const {existsSync} = require('fs');
const {join} = require('path');
const fetch = require('node-fetch');
const {writeFile} = require('fs');
const {promisify} = require('util');
const writeFilePromise = promisify(writeFile);
const {url, user, passwd, keyColumnNumbers, mp3paths, imgpaths} = require('./PRIVATE');
if ([url, user, passwd, keyColumnNumbers, mp3paths].some(x => typeof x === 'undefined')) {
  throw new Error('Required personal parameter missing')
}

const CONTENT_DIR = '.';

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
const flatten = v => v.reduce((prev, curr) => prev.concat(curr), []);
const unique = v => {
  let s = new Set(v);
  return [...s];
};

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
    await driver.sleep(8000);

    let levels = await driver.findElements(By.css('div.level[data-level-id]'));
    levels.reverse();
    let nlev = 0;
    for (let level of levels) {
      nlev++;
      let levelTitle = await (level.findElement(By.css('div.level-header h3.level-name')).then(n => n.getText()));
      console.log(JSON.stringify({levelTitle}));

      let trs = await level.findElements(By.css('tr.thing'));
      for (let tr of trs) {
        let textCols = await tr.findElements(By.css('td.cell.text[data-key]'));
        let texts = await Promise.all(textCols.map(td => td.getText()));
        let key = keyColumnNumbers.map(n => texts[n]).filter(s => !!s).join(',');
        if (!key) { throw new Error('No key found'); }

        // Audio
        let auds = await tr.findElements(By.css('td.audio[data-key]'));
        let audioUrls = [];
        if (auds.length > 0) {
          let aud = auds[0];
          let players = await aud.findElements(By.css('a.audio-player[data-url]'));
          audioUrls = await Promise.all(players.map(a => a.getAttribute('data-url')));
          // await downloadUrls(audioUrls);
          if (audioUrls.length === 0) {
            let possibleFilenames = unique(flatten(texts.map(s => [s, s.replace(/\?/g, '？')])).map(s => `${s}.mp3`));
            let toUpload = flatten(mp3paths.map(p => possibleFilenames.map(f => join(p, f)))).filter(existsSync);
            if (toUpload.length > 0) {
              for (let s of toUpload) {
                let input = await tr.findElement(By.css('td.audio[data-key] div.files-add input'));
                await input.sendKeys(s);
                await driver.sleep(2000);
              }
            }
            console.log(`// DEBUG: Uploaded ${toUpload.length} audio files for: ${key}`);
          }
        }

        // Images
        let imgs = await tr.findElements(By.css('td.image[data-key]'));
        if (imgs.length && imgpaths) {
          const img = imgs[0];
          const existing = await img.findElements(By.css('img.thing-img[data-url]'));
          // const imgUrls = await Promise.all(existing.map(img => img.getAttribute('data-url')));
          if (existing.length === 0) {
            let possibleFilenames =
                flatMap(flatMap(texts, s => [s, s.replace(/\?/g, '？')]), s => [`${s}.jpg`, `${s}.png`]);
            possibleFilenames = Array.from(new Set(possibleFilenames));
            let toUpload = flatten(imgpaths.map(p => possibleFilenames.map(f => join(p, f)))).filter(existsSync);
            if (toUpload.length > 0) {
              for (let s of toUpload) {
                let input = await img.findElement(By.css('div.files-add input'));
                await input.sendKeys(s);
                await driver.sleep(2000);
              }
            }
            console.log(`// DEBUG: Uploaded ${toUpload.length} img files for: ${key}`);
          }
        }

        if (false) {
          // Images
          let imgs = await tr.findElements(By.css('td.image[data-key] div.images img.thing-img[data-url]'));
          let imgUrls = await Promise.all(imgs.map(img => img.getAttribute('data-url')));
          // await downloadUrls(imgUrls);

          // log
          console.log(JSON.stringify({texts, key, audio: audioUrls, img: imgUrls}));
        }
      }
    }
  } finally {
    await driver.get('https://www.memrise.com/logout');
    await driver.quit();
  }
})();

/**
 *
 * @template T
 * @param {T[]} arr
 * @param {(x:T)=>T[]} f
 */
function flatMap(arr, f) {
  const ret = [];
  for (const x of arr) { ret.push(...f(x)); }
  return ret;
}
