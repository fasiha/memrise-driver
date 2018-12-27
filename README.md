# memrise-driver

This is a little robot for Selenium/WebDriver and geckodriver (Firefox) to automatically add content (audio for now, hopefully images also) to [Memrise.com](https://www.memrise.com) courses. It's pretty customized right now for my own use but can serve as a tutorial for scripting Memrise or Selenium.

To use this:
- install [Git](https://git-scm.com/)
- install [Node.js](https://nodejs.org/)
- in your command line (Terminal app in macOS, Command Prompt in Windows, xterm in Linux, etc.), run the following to clone (copy) this repository from GitHub to your computer, change into the newly-created directory, and install JavaScript dependencies:
```
git clone https://github.com/fasiha/memrise-driver.git
cd memrise-driver
npm install
```
- download geckodriver from
https://github.com/mozilla/geckodriver/releases/ and put it in the newly-created `memrise-driver` directory.
- create or edit `PRIVATE.js` to include fields. See [`PRIVATE_example.js`](PRIVATE_example.js)
for required fields—this will include your Memrise username and password, the course URL to edit, and the location of mp3 audio on your computer
- run
```
$ node index.js
```
and make a note of rows missing audio by searching output for "Uploaded 0 audio
files for:".
- use [`makeAudio.sh`](makeAudio.sh) and AWS Polly to create mp3s, then put them in the directories promised in `PRIVATE.js`
- finally, rerun `node index.js` to upload audio
