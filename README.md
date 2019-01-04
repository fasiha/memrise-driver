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
for required fields—this will include your Memrise username and password, the course URL to edit, the locations of mp3 audio on your computer, and the column numbers from which your mp3s will be named (`keyColumnNumbers`; if multiple columns provided, they'll be separated by commas; the numbers start with 0; and these only consider textual columns, including attributes)
- run
```
$ node index.js
```
and make a note of rows missing audio by searching output for "Uploaded 0 audio
files for:".
- use [`makeAudio.sh`](makeAudio.sh) and AWS Polly to create mp3s, then put them in the directories promised in `PRIVATE.js`
- finally, rerun `node index.js` to upload new audio for any rows missing audio *and* download audio and images
- (optional: rerun `node index.js` and tee the output to a line-delimited JSON file to have a convenient database of the course, including all images and audio (while this run won't upload anything, it will download everything you just uploaded, so it'll be about as slow; it won't re-download the same file, unless Memrise changes its location))
