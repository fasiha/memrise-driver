# memrise-driver

[Memrise.com](https://www.memrise.com) is superb! We use it a lot for Japanese.

This repository, Memrise-Driver, is **not affiliated with Memrise.com**. It's a little robot that will
1. open a browser window to a specific Memrise course you've authored, 
2. find words that don't have audio,
3. use [AWS Polly](https://aws.amazon.com/polly/) (Amazon's text-to-speech) to generate audio for the word, in potentially *multiple* voices, if you don't have an mp3 audio file available, and
4. upload any audio it finds for this word to Memrise.

AWS Polly produces near-perfect Japanese speech in two voices (femme-coded and masc-coded). I am very sensitive to bad audio and of course want exquisite pronunciation to practice with, but I have been extremely satisfied with AWS Polly for this application—we have over 3000 Memrise flaschards whose audio is provided by AWS Polly, flashcards that are constantly practiced by both adults and children. Try it out: sign into the following with an Amazon.com account to convert any text to speech, and download the mp3: https://console.aws.amazon.com/polly/home/SynthesizeSpeech

It is also extremely cheap: check the [pricing](https://aws.amazon.com/polly/pricing/) page but as of now (early 2021), AWS charges US$4 per *million* characters (with an introductory twelve month special where you get five million characters free per month). You can of course analyze your own Memrise courses, but our ~3000 flashcards contain ~18'000 characters total, for an average of 5.6 characters per flashcard (where one kanji is one "character").

Finally, there appear to be no copyright issues related to AWS or Polly: assuming the text is your own material, it appears that *you* own the audio files created by AWS Polly.

## Installation
To use Memrise-Driver:
- install [Git](https://git-scm.com/)
- install [Node.js](https://nodejs.org/)
- in your command line (Terminal app in macOS, Command Prompt in Windows, xterm in Linux, etc.), run the following to clone (copy) this repository from GitHub to your computer, change into the newly-created directory, and install JavaScript dependencies:
```
git clone https://github.com/fasiha/memrise-driver.git
cd memrise-driver
npm install
```

This will clone (download) this repository from GitHub to your computer, change into the newly-created directory, and install Node dependencies (this might take a minute or two because Node will download the Chromium browser).

## Configuration
Then, create a *configuration* file. Look at [example_config.js](example_config.js) for the format it needs (a Node.js module). Here are all the fields you need to provide—

### `url`
This is the URL of the *course editor*, something like https://app.memrise.com/course/2172977/japanese-verb-conjugations/edit/

### `user`
Your Memrise username.

### `passwd`
Your Memrise password. If you're unhappy with storing storing this in a file on your disk, [reach out](issues/) and we can fix this.

### `voices`
A list of [AWS Polly voices](https://docs.aws.amazon.com/polly/latest/dg/voicelist.html). For Japanese, AWS Polly currently has Mizuki (femme) and Takumi (masc), so I might have `voices` set to `['Mizuki', 'Takumi']` (the square-brackets indicate a list in JavaScript).

### `voices_parent_path`
This is a path on your computer under which you've created a subdirectory for each AWS Polly voice. For example, I might have created the following directories:
- `/Users/me/Documents/Memrise/Takumi` and 
- `/Users/me/Documents/Memrise/Mizuki`.

Then, `voices_parent_path` should be `/Users/me/Documents/Memrise`. It's the path to the *parent* directory of all voices.

### `column_indexes`
Flashcards in your course might contain lots of columns and you might only want one, or a few, of them to be converted to audio. This field lets you control which columns in your course contain text that should be spoken.

Specifically, this is a list of numbers, with 0 indicating the first column, 1 indicating the second column, etc. In a Japanese course with the following columns:
- kana
- translation
- kanji
- part of speech

I would set `column_indexes` to be `[2, 0]`, since I want the audio to be drawn from either the kanji column, or if there's no kanji, from the kana column. (Protip: AWS Polly often sounds much more natural with kanji than just kana.)

### `aws_region`
This, and the next two configuration parameters, are AWS-specific. You will have to follow the AWS Polly setup instructions online—they are not very good, so do your best to set up an IAM user account.

`aws_region` is text like `us-east-2` or `ap-northeast-2` or `af-south-1` (for Ohio, USA; Seoul, Korea; or Cape Town, South Africa, respectively).

### `aws_access_key_id`
A long string that AWS will give you for your IAM user's key ID.

### `aws_secret_access_key`
A very long string from AWS representing your IAM user's secret key.

### `verbose`
This should be `true` or `false`. If true, the driver will print lots of text about what it's doing.

### `bottom_first`
Again, `true` or `false`. If true, the driver will start from the last section of your course instead of the first. This is useful if, for example, your course had audio, then you added some more sections, and you want to add text to these.

## Usage
After creating a configuration file with the above parameters filled in, invoke the driver from your command prompt (Terminal app, Command Prompt, xterm, etc.):
```console
node index.js MY_CONFIG_FILE.js
```
replacing MY_CONFIG_FILE.js with your actual config file.

This will open a Chromium window, log in, open your course, and start working. It'll save mp3 files from AWS Polly to your disk, so you always have a backup.

## Tech notes
Ah, a fellow developer! Welcome, welcome! This repo uses Puppeteer. (It used to use Selenium Webdriver, and it used to do a lot of other things, but as of February 2021, I threw that version away.)